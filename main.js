'use strict';
document.documentElement.classList.add('js');
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
const menuButton = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
function closeMenu() {
  menu?.classList.remove('show');
  menuButton?.setAttribute('aria-expanded', 'false');
}
menuButton?.addEventListener('click', () => {
  const open = menu.classList.toggle('show');
  menuButton.setAttribute('aria-expanded', String(open));
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.classList.contains('show')) {
    closeMenu();
    menuButton.focus();
  }
});
menu?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
const filters = document.querySelector('.filters');
if (filters) {
  filters.hidden = false;
  const cards = [...document.querySelectorAll('.project[data-category]')];
  const buttons = [...filters.querySelectorAll('[data-filter]')];
  function applyFilter(category) {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    cards.forEach(card => { card.hidden = category !== 'Todos' && card.dataset.category !== category; });
    const count = cards.filter(card => !card.hidden).length;
    document.getElementById('resultCount').textContent = `${count} ${count === 1 ? 'proyecto' : 'proyectos'} · ${category}`;
  }
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (button) applyFilter(button.dataset.filter);
  });
  applyFilter('Todos');
}
// Third-party players load only after an explicit play action.
document.querySelectorAll('.youtube-embed[data-youtube-id]').forEach(container => {
  const id = container.dataset.youtubeId;
  if (!/^[\w-]{11}$/.test(id)) return;
  const title = container.dataset.youtubeTitle || 'Vídeo del proyecto';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'video-preview';
  const icon = document.createElement('span');
  icon.className = 'play-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '▷';
  const label = document.createElement('span');
  label.textContent = `Reproducir: ${title}`;
  const note = document.createElement('span');
  note.textContent = 'Se cargará el reproductor de YouTube';
  button.append(icon,label,note);
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.title = title;
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    container.replaceChildren(frame);
    frame.focus();
  });
  container.append(button);
  const external = document.createElement('a');
  external.className = 'video-external';
  external.href = `https://www.youtube.com/watch?v=${id}`;
  external.target = '_blank';
  external.rel = 'noopener noreferrer';
  external.textContent = 'Ver en YouTube ↗';
  container.after(external);
});
