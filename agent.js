'use strict';
const form = document.getElementById('chatForm'), input = document.getElementById('message');
const log = document.getElementById('chat'), status = document.getElementById('chatStatus');
const submit = form.querySelector('button'), clear = document.getElementById('clearChat');
let history = [], request = null;
function appendMessage(role,text) {
  const message = document.createElement('div'); message.className = `chat-message ${role}`;
  const author = document.createElement('strong'); author.textContent = role === 'user' ? 'Tú' : 'Xal’Zaroth';
  message.append(author,document.createTextNode(text)); log.append(message); log.scrollTop = log.scrollHeight;
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text || request) return;
  const controller = new AbortController(); request = controller;
  const timeout = setTimeout(() => controller.abort(),60000);
  appendMessage('user',text); input.value = ''; submit.disabled = true;
  status.textContent = 'Esperando a Xal’Zaroth…';
  try {
    const response = await fetch('https://xalzaroth.onrender.com/chat', {
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:text,memory:history.slice(-8).map(item => `${item.role}: ${item.text}`).join('\n')}), signal:controller.signal
    });
    if (!response.ok) throw new Error('service');
    const data = await response.json(), reply = data.reply || data.respuesta || data.message;
    if (typeof reply !== 'string' || !reply.trim()) throw new Error('format');
    if (request !== controller) return;
    history.push({role:'user',text},{role:'bot',text:reply}); appendMessage('bot',reply); status.textContent = '';
  } catch {
    if (request === controller) status.textContent = 'El servicio no ha respondido. Puedes intentarlo de nuevo en unos instantes.';
  } finally {
    clearTimeout(timeout);
    if (request === controller) { request = null; submit.disabled = false; input.focus(); }
  }
});
clear.addEventListener('click', () => {
  const active = request; request = null; active?.abort(); history = []; log.replaceChildren();
  status.textContent = 'Conversación borrada de esta página.'; submit.disabled = false; input.focus();
});
