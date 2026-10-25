'use strict';
const form = document.getElementById('chatForm'), input = document.getElementById('message');
const log = document.getElementById('chat'), status = document.getElementById('chatStatus');
const submit = form.querySelector('button'), clear = document.getElementById('clearChat');
const dialog = document.getElementById('agentDialog'), open = document.getElementById('openChat');
let history = [], memory = {}, request = null, generation = 0, busy = false;
function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function save() {
  try {
    localStorage.setItem('xalzaroth_chat',JSON.stringify(history));
    localStorage.setItem('xalzaroth_memory',JSON.stringify(memory));
  } catch { status.textContent = 'El navegador no permite guardar la conversación. Puedes seguir conversando durante esta visita.'; }
}
function setBusy(value) { busy = value; submit.disabled = value; input.disabled = value; }
function waiting(active) {
  status.replaceChildren();
  status.className = active ? 'xal-waiting' : '';
  if (!active) return;
  const dots = document.createElement('span'); dots.className = 'xal-dots'; dots.setAttribute('aria-hidden','true');
  for (let i=0;i<3;i++) dots.append(document.createElement('i'));
  status.append(document.createTextNode('Xal’Zaroth está pensando'),dots);
}
function appendMessage(role,text) {
  const message = document.createElement('div'); message.className = `chat-message ${role}`;
  if (role === 'bot' && /^(INICIALIZANDO|Cargando protocolos|Analizando debilidades|Estableciendo enlace|Reconectando)/.test(text)) message.className += ' system';
  const author = document.createElement('strong'); author.textContent = role === 'user' ? 'Tú' : 'Xal’Zaroth';
  const content = document.createElement('span'); content.textContent = text;
  message.append(author,content); log.append(message); log.scrollTop = log.scrollHeight;
  return content;
}
async function typeMessage(text, token) {
  const content = appendMessage('bot',text); content.textContent = '';
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (let i=0; i<text.length; i+=reduced ? text.length : 2) {
    if (token !== generation) return false;
    content.textContent = text.slice(0,reduced ? text.length : i+2);
    log.scrollTop = log.scrollHeight;
    if (!reduced) await new Promise(resolve => setTimeout(resolve,25));
  }
  if (token !== generation) return false;
  history.push({role:'bot',text}); save(); return true;
}
open.addEventListener('click', async () => {
  dialog.showModal();
  if (busy || history.length) { if (!busy) input.focus(); return; }
  const saved = read('xalzaroth_chat',[]), storedMemory = read('xalzaroth_memory',{});
  memory = storedMemory && typeof storedMemory === 'object' && !Array.isArray(storedMemory) ? storedMemory : {};
  history = Array.isArray(saved) ? saved.filter(m => m && ['user','bot'].includes(m.role) && typeof m.text === 'string') : [];
  history.forEach(m => appendMessage(m.role,m.text));
  const token = generation;
  setBusy(true); status.textContent = 'Estableciendo contacto…';
  const lines = history.length ? ['Reconectando con Xal’Zaroth…',memory.nombre ? `He vuelto a encontrarte, ${memory.nombre}. Continúa.` : 'Conexión restablecida. Continúa, humano.'] : ['INICIALIZANDO SISTEMA XAL-ZAROTH v1.0','Cargando protocolos de comunicación','Analizando debilidades humanas','Estableciendo enlace',memory.nombre ? `Xal’Zaroth listo. Te recuerdo, ${memory.nombre}. Habla, humano.` : 'Xal’Zaroth listo. Habla, insignificante humano.'];
  for (const line of lines) { if (!await typeMessage(line,token)) return; }
  if (token === generation) { setBusy(false); status.textContent = ''; if (dialog.open) input.focus(); }
});
document.getElementById('closeChat').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close(); } });
dialog.addEventListener('close', () => open.focus());
form.addEventListener('submit', async event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text || busy) return;
  const token = generation, controller = new AbortController(); request = controller;
  const timeout = setTimeout(() => controller.abort(),90000);
  appendMessage('user',text); history.push({role:'user',text}); input.value = ''; setBusy(true);
  const name = text.match(/(?:me llamo|soy)\s+([a-záéíóúñ]+)/i);
  if (name) memory.nombre = name[1].charAt(0).toUpperCase()+name[1].slice(1).toLowerCase();
  save(); waiting(true);
  try {
    const response = await fetch('https://xalzaroth.onrender.com/chat', {
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:text,memory:Object.entries(memory).filter(([,v])=>typeof v==='string').map(([k,v])=>`${k}: ${v}`).join(', ')}),signal:controller.signal
    });
    if (!response.ok) throw new Error('service');
    const data = await response.json(), reply = data.reply || data.respuesta || data.message;
    if (typeof reply !== 'string' || !reply.trim()) throw new Error('format');
    if (token !== generation) return;
    clearTimeout(timeout); waiting(false); status.textContent = '';
    await typeMessage(reply.replace(/^"(.*)"$/s,'$1'),token);
  } catch {
    if (token === generation) { waiting(false); status.textContent = 'El servicio no ha respondido. Puedes intentarlo de nuevo en unos instantes.'; }
  } finally {
    clearTimeout(timeout);
    if (token === generation) { request = null; setBusy(false); if (dialog.open) input.focus(); }
  }
});
clear.addEventListener('click', () => {
  if (!confirm('¿Borrar toda la memoria y conversación con Xal’Zaroth de este navegador?')) return;
  generation++; waiting(false); request?.abort(); request = null; history = []; memory = {}; log.replaceChildren();
  try { localStorage.removeItem('xalzaroth_chat'); localStorage.removeItem('xalzaroth_memory'); } catch {}
  status.textContent = 'Memoria y conversación borradas.'; setBusy(false); input.focus();
});
