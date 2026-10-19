'use strict';
// Restore audio assets in mp3/ or lista/ without changing the player.
const tracks = [
  ['01 Ni mirarte.mp3','Ni mirarte'],['02 Perpetua.mp3','Perpetua'],
  ['03 Volando.mp3','Volando'],['04 La quiero.mp3','La quiero'],
  ['05 No vuelvas más.mp3','No vuelvas más'],['06 Misterio.mp3','Misterio'],
  ['07 Mi cancerbero.mp3','Mi cancerbero'],['08 No puedo más.mp3','No puedo más'],
  ['09 El alma.mp3','El alma']
];
const audio = document.getElementById('icaroAudio');
const list = document.getElementById('trackList');
const now = document.getElementById('audioNow');
const note = document.getElementById('audioNote');
let current = -1, candidateIndex = 0, candidates = [], shouldPlay = false, playingTitle = '';
async function playCurrent() {
  try { await audio.play(); }
  catch (error) {
    if (error.name === 'NotAllowedError') note.textContent = 'Pulsa reproducir en el control de audio para comenzar.';
  }
}
function selectTrack(index, autoplay = true) {
  if (index < 0 || index >= tracks.length) return;
  audio.pause();
  current = index; candidateIndex = 0; shouldPlay = autoplay;
  const [file,title] = tracks[index];
  playingTitle = title;
  audio.hidden = false;
  now.textContent = `${String(index + 1).padStart(2,'0')} · ${title}`;
  note.textContent = 'Cargando audio…';
  list.querySelectorAll('button').forEach((button,i) => button.setAttribute('aria-pressed', String(i === index)));
  candidates = ['mp3/','lista/'].map(path => path + encodeURIComponent(file));
  audio.src = candidates[0]; audio.load();
  if (autoplay) playCurrent();
}
audio.addEventListener('error', () => {
  if (candidateIndex + 1 < candidates.length) {
    audio.src = candidates[++candidateIndex]; audio.load();
    if (shouldPlay) playCurrent();
  } else note.textContent = 'Este audio no está disponible por ahora. Puedes escuchar el disco en Spotify o ver «Ni mirarte» en YouTube, más arriba.';
});
audio.addEventListener('playing', () => { note.textContent = `Escuchando ${playingTitle}.`; });
audio.addEventListener('pause', () => {
  if (!audio.error && current >= 0 && !audio.ended) note.textContent = 'En pausa.';
});
audio.addEventListener('loadedmetadata', () => { if (!shouldPlay) note.textContent = 'Audio listo para escuchar.'; });
audio.addEventListener('ended', () => {
  if (current + 1 < tracks.length) selectTrack(current + 1);
  else {
    note.textContent = 'Has llegado al final de Ícaro Caído.';
    list.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed','false'));
    current = -1;
  }
});
function renderTracks() {
  list.replaceChildren();
  tracks.forEach(([file,title],index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'track-button';
    button.setAttribute('aria-pressed',String(index === current));
    const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2,'0');
    const label = document.createElement('span'); label.textContent = title;
    button.append(number,label);
    button.addEventListener('click', () => selectTrack(index));
    list.append(button);
  });
}
async function init() {
  for (const source of ['mp3/lista.txt','lista/lista.txt']) {
    try {
      const response = await fetch(source);
      if (!response.ok) continue;
      const parsed = (await response.text()).split(/\r?\n/).map(line => {
        if (line.trim().startsWith('#')) return null;
        const parts = line.trim().split(/\s+-\s+/);
        if (parts.length < 2) return null;
        const first = parts.shift(), rest = parts.join(' - ');
        const entry = /\.mp3$/i.test(first) ? [first,rest] : /\.mp3$/i.test(rest) ? [rest,first] : null;
        return entry && !/[\\/]/.test(entry[0]) && !entry[0].includes('..') ? entry : null;
      }).filter(Boolean);
      if (parsed.length && current < 0) { tracks.splice(0,tracks.length,...parsed); break; }
    } catch { /* Fixed track list works even without manifests. */ }
  }
  renderTracks();
}
renderTracks();
init();
