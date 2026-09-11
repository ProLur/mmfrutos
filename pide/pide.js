(function () {
  'use strict';

  const FORO_ORIGIN = 'https://www.sindicatopide.org';
  const FORO_BASE = FORO_ORIGIN + '/foros/';
  const CACHE_KEY = 'pideFeedCacheV1';
  const CACHE_MAX = 40;
  const ALLOWED_TAGS = new Set(['A', 'B', 'I', 'EM', 'STRONG', 'BR', 'U']);

  const state = {
    threads: [],
    nextPage: 2,
    loading: false,
    exhausted: false,
    searchMode: false
  };

  const els = {};

  document.addEventListener('DOMContentLoaded', () => {
    els.feed = document.getElementById('pideFeed');
    els.status = document.getElementById('pideStatus');
    els.loadMoreBtn = document.getElementById('pideLoadMore');
    els.refreshBtn = document.getElementById('pideRefresh');
    els.searchForm = document.getElementById('pideSearchForm');
    els.searchInput = document.getElementById('pideSearchInput');
    els.searchExit = document.getElementById('pideSearchExit');
    els.newPill = document.getElementById('pideNewPill');

    els.loadMoreBtn.addEventListener('click', loadMore);
    els.refreshBtn.addEventListener('click', () => loadInitial(true));
    els.searchForm.addEventListener('submit', e => {
      e.preventDefault();
      const q = els.searchInput.value.trim();
      if (q) doSearch(q);
    });
    els.searchExit.addEventListener('click', exitSearch);
    els.newPill.addEventListener('click', () => {
      els.newPill.hidden = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    loadInitial(false);
  });

  // ---------- Utilidades de texto/HTML seguro ----------

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function sanitizeFragment(rootNode) {
    function walk(n) {
      if (n.nodeType === Node.TEXT_NODE) return document.createTextNode(n.textContent);
      if (n.nodeType !== Node.ELEMENT_NODE) return null;

      const tag = n.tagName;

      if (tag === 'SPAN' && n.classList && n.classList.contains('ForoBuscadorResultado')) {
        const mark = document.createElement('mark');
        Array.from(n.childNodes).forEach(c => {
          const w = walk(c);
          if (w) mark.appendChild(w);
        });
        return mark;
      }

      if (!ALLOWED_TAGS.has(tag)) {
        const frag = document.createDocumentFragment();
        Array.from(n.childNodes).forEach(c => {
          const w = walk(c);
          if (w) frag.appendChild(w);
        });
        return frag;
      }

      const el = document.createElement(tag.toLowerCase());
      if (tag === 'A') {
        let href = n.getAttribute('href') || '';
        if (!/^https?:\/\//i.test(href)) href = FORO_BASE;
        el.setAttribute('href', href);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
      Array.from(n.childNodes).forEach(c => {
        const w = walk(c);
        if (w) el.appendChild(w);
      });
      return el;
    }

    const wrapper = document.createElement('div');
    Array.from(rootNode.childNodes).forEach(c => {
      const w = walk(c);
      if (w) wrapper.appendChild(w);
    });
    return wrapper.innerHTML.trim();
  }

  function stripTags(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function initials(name) {
    const clean = (name || '?').trim();
    return escapeHTML(clean.slice(0, 2).toUpperCase());
  }

  function colorForName(name) {
    const str = name || '?';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return 'hsl(' + hue + ' 62% 42%)';
  }

  function isStaffInfo(infoEl) {
    if (!infoEl) return false;
    const font = infoEl.querySelector('font[color]');
    if (font && /ff00ff/i.test(font.getAttribute('color') || '')) return true;
    const img = infoEl.querySelector('img[src*="logo-PIDE"]');
    return !!img;
  }

  function timeAgo(dateStr) {
    const m = (dateStr || '').match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
    if (!m) return dateStr || '';
    const d = new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]);
    const diffMin = Math.round((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1) return 'ahora';
    if (diffMin < 60) return diffMin + 'min';
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return diffH + 'h';
    const diffD = Math.round(diffH / 24);
    if (diffD < 7) return diffD + 'd';
    const sameYear = d.getFullYear() === new Date().getFullYear();
    return d.toLocaleDateString('es-ES', sameYear ? { day: '2-digit', month: '2-digit' } : { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  // ---------- Parseo del foro ----------

  function parseForoDocument(htmlText) {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    const hilos = Array.from(doc.querySelectorAll('.ForoHilo'));
    return hilos.map(parseHilo).filter(Boolean);
  }

  function parseHilo(hiloEl) {
    let idEl = hiloEl.previousElementSibling;
    let guard = 0;
    while (idEl && guard < 5 && !(idEl.tagName === 'A' && idEl.getAttribute('name') && idEl.getAttribute('name').indexOf('hilo') === 0)) {
      idEl = idEl.previousElementSibling;
      guard++;
    }
    const id = idEl ? idEl.getAttribute('name').replace('hilo', '') : ('t' + Math.random().toString(36).slice(2));

    const titleB = hiloEl.querySelector(':scope > b');
    const title = titleB ? titleB.textContent.trim() : '(sin título)';

    const messagesRoot = hiloEl.querySelector(':scope > .ForoHiloMensajes');
    const messages = [];
    if (messagesRoot) {
      Array.from(messagesRoot.querySelectorAll('.ForoMensaje')).forEach(m => {
        messages.push(parseMensaje(m, messagesRoot));
      });
    }
    if (!messages.length) return null;

    const infoEl = hiloEl.querySelector(':scope > .ForoHiloInfo');
    const closed = !!(infoEl && /cerrado/i.test(infoEl.textContent));

    return { id, title, closed, messages };
  }

  function depthOf(el, root) {
    let d = 0;
    let p = el.parentElement;
    while (p && p !== root) {
      if (p.classList && p.classList.contains('ForoMensaje')) d++;
      p = p.parentElement;
    }
    return d;
  }

  function parseMensaje(msgEl, root) {
    const infoEl = msgEl.querySelector(':scope > .ForoMensajeInfo');
    const textoEl = msgEl.querySelector(':scope > .ForoMensajeTexto');
    let author = 'Anónimo';
    let date = '';
    let isStaff = false;

    if (infoEl) {
      const b = infoEl.querySelector('b');
      author = b ? b.textContent.trim() : infoEl.textContent.trim();
      const m = infoEl.textContent.match(/\(([^)]+)\)\s*$/);
      date = m ? m[1] : '';
      isStaff = isStaffInfo(infoEl);
    }

    let html = '';
    if (textoEl) {
      const clone = textoEl.cloneNode(true);
      clone.querySelectorAll('.ForoMensaje, input, button').forEach(n => n.remove());
      html = sanitizeFragment(clone);
    }

    return { depth: depthOf(msgEl, root), author, date, isStaff, html };
  }

  function parseSearchResults(htmlText) {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    const container = doc.querySelector('#ForoHilos');
    if (!container) return [];
    const blocks = Array.from(container.querySelectorAll(':scope > .ForoHilo'));
    return blocks.map(b => {
      const info = b.querySelector('.ForoMensajeInfo');
      const infoText = info ? info.textContent : '';
      const titleMatch = infoText.match(/MENSAJE DEL HILO\s*:\s*(.*?)\s*\((\d+)\s*mensajes?\s*en el hilo\)/i);
      const title = titleMatch ? titleMatch[1].trim() : '(resultado)';
      const count = titleMatch ? +titleMatch[2] : null;
      const bolds = info ? info.querySelectorAll('b') : [];
      const author = bolds.length ? bolds[bolds.length - 1].textContent.trim() : 'Anónimo';
      const dateMatch = infoText.match(/\(([^)]+)\)\s*$/);
      const date = dateMatch ? dateMatch[1] : '';
      const isStaff = isStaffInfo(info);
      const snippetEl = b.querySelector('.ForoHiloMensajes');
      const snippetHtml = snippetEl ? sanitizeFragment(snippetEl.cloneNode(true)) : '';
      const linkEl = b.querySelector('a[href*="hilo="]');
      let hiloId = null;
      if (linkEl) {
        const m = linkEl.getAttribute('href').match(/hilo=(\d+)/);
        hiloId = m ? m[1] : null;
      }
      return { title, count, author, date, isStaff, snippetHtml, hiloId };
    });
  }

  // ---------- Red ----------

  async function fetchHTML(url, opts) {
    const res = await fetch(url, Object.assign({ mode: 'cors' }, opts || {}));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.text();
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeCache(threads) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(threads.slice(0, CACHE_MAX)));
    } catch (e) { /* almacenamiento no disponible, no pasa nada */ }
  }

  // ---------- Render ----------

  function setStatus(html, isError) {
    if (!html) {
      els.status.hidden = true;
      els.status.innerHTML = '';
      return;
    }
    els.status.hidden = false;
    els.status.innerHTML = html;
    els.status.classList.toggle('pide-status-error', !!isError);
  }

  function threadCardHTML(thread) {
    const first = thread.messages[0];
    const replies = thread.messages.slice(1);
    const previewShort = stripTags(first.html);
    const preview = previewShort.length > 220 ? previewShort.slice(0, 220) + '…' : previewShort;

    return (
      '<article class="pide-post" data-id="' + escapeHTML(thread.id) + '">' +
        '<div class="pide-post-main" role="button" tabindex="0" aria-expanded="false">' +
          '<span class="pide-avatar" style="--av-color:' + colorForName(first.author) + '">' + initials(first.author) + '</span>' +
          '<span class="pide-post-body">' +
            '<span class="pide-post-head">' +
              '<span class="pide-author">' + escapeHTML(first.author) + '</span>' +
              (first.isStaff ? '<span class="pide-badge" title="Cuenta oficial del sindicato">✓</span>' : '') +
              '<span class="pide-dot">·</span>' +
              '<span class="pide-time">' + escapeHTML(timeAgo(first.date)) + '</span>' +
            '</span>' +
            '<span class="pide-title">' + escapeHTML(thread.title) + '</span>' +
            '<span class="pide-preview">' + escapeHTML(preview) + '</span>' +
            '<span class="pide-meta-row">' +
              (thread.closed ? '<span class="pide-tag pide-tag-closed">🔒 Cerrado</span>' : '') +
              '<span class="pide-tag">💬 ' + replies.length + (replies.length === 1 ? ' respuesta' : ' respuestas') + '</span>' +
            '</span>' +
          '</span>' +
          '<span class="pide-chevron" aria-hidden="true">›</span>' +
        '</div>' +
        '<div class="pide-thread" hidden></div>' +
      '</article>'
    );
  }

  function msgRowHTML(m, depth) {
    return (
      '<div class="pide-msg" style="--depth:' + Math.min(depth, 4) + '">' +
        '<span class="pide-avatar pide-avatar-sm" style="--av-color:' + colorForName(m.author) + '">' + initials(m.author) + '</span>' +
        '<div class="pide-msg-body">' +
          '<div class="pide-msg-head">' +
            '<span class="pide-author">' + escapeHTML(m.author) + '</span>' +
            (m.isStaff ? '<span class="pide-badge" title="Cuenta oficial del sindicato">✓</span>' : '') +
            '<span class="pide-dot">·</span>' +
            '<span class="pide-time">' + escapeHTML(timeAgo(m.date)) + '</span>' +
          '</div>' +
          '<div class="pide-msg-text">' + (m.html || '<em>(mensaje vacío)</em>') + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function externalLinkHTML(hiloId) {
    return '<a class="pide-external" href="' + FORO_BASE + 'index.php?hilo=' + encodeURIComponent(hiloId) + '" target="_blank" rel="noopener noreferrer">Ver y responder en sindicatopide.org ↗</a>';
  }

  // Hilo completo (incluye el mensaje original): se usa cuando el OP aún no se ha mostrado en ningún sitio.
  function fullThreadHTML(thread) {
    const msgsHTML = thread.messages.map(m => msgRowHTML(m, m.depth)).join('');
    return msgsHTML + externalLinkHTML(thread.id);
  }

  // Solo las respuestas (sin el OP, que ya se muestra completo en la propia tarjeta al expandir).
  function repliesOnlyHTML(thread) {
    const replies = thread.messages.slice(1);
    const list = replies.length
      ? replies.map(m => msgRowHTML(m, Math.max(0, m.depth - 1))).join('')
      : '<p class="pide-loading">Todavía no hay respuestas.</p>';
    return list + externalLinkHTML(thread.id);
  }

  function bindCard(article, thread) {
    const row = article.querySelector('.pide-post-main');
    const preview = article.querySelector('.pide-preview');
    const detail = article.querySelector('.pide-thread');
    let built = false;

    function toggle() {
      const expanded = row.getAttribute('aria-expanded') === 'true';
      if (!built) {
        const first = thread.messages[0];
        if (preview && first) {
          preview.innerHTML = first.html || '';
          preview.classList.add('pide-preview-expanded');
        }
        detail.innerHTML = repliesOnlyHTML(thread);
        built = true;
      }
      row.setAttribute('aria-expanded', String(!expanded));
      detail.hidden = expanded;
    }

    row.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      toggle();
    });
    row.addEventListener('keydown', e => {
      if (e.target.closest('a')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }

  function appendThreadCards(threads, position) {
    threads.forEach(thread => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = threadCardHTML(thread);
      const article = wrapper.firstElementChild;
      bindCard(article, thread);
      if (position === 'start') {
        els.feed.insertBefore(article, els.feed.firstChild);
      } else {
        els.feed.appendChild(article);
      }
    });
  }

  function renderAll() {
    els.feed.innerHTML = '';
    appendThreadCards(state.threads, 'end');
  }

  function updateLoadMoreButton() {
    if (state.exhausted) {
      els.loadMoreBtn.textContent = 'No hay más hilos';
      els.loadMoreBtn.disabled = true;
    } else {
      els.loadMoreBtn.textContent = state.loading ? 'Cargando…' : 'Cargar hilos más antiguos';
      els.loadMoreBtn.disabled = state.loading;
    }
  }

  // ---------- Flujo principal ----------

  async function loadInitial(isManualRefresh) {
    const cached = readCache();
    if (!isManualRefresh && cached && cached.length) {
      state.threads = cached;
      renderAll();
      setStatus('Mostrando la última copia guardada, actualizando…');
    } else {
      setStatus('Cargando el foro…');
    }

    try {
      const html = await fetchHTML(FORO_BASE);
      const fresh = parseForoDocument(html);
      const existingIds = new Set(state.threads.map(t => t.id));
      const brandNew = fresh.filter(t => !existingIds.has(t.id));

      if (!state.threads.length) {
        state.threads = fresh;
        renderAll();
      } else if (brandNew.length) {
        state.threads = brandNew.concat(state.threads);
        appendThreadCards(brandNew, 'start');
        if (window.scrollY > 240) {
          els.newPill.textContent = brandNew.length + (brandNew.length === 1 ? ' hilo nuevo ↑' : ' hilos nuevos ↑');
          els.newPill.hidden = false;
        }
      }

      writeCache(state.threads);
      setStatus('');
    } catch (e) {
      setStatus('No se ha podido conectar con el foro ahora mismo. <a href="' + FORO_BASE + '" target="_blank" rel="noopener noreferrer">Ábrelo directamente ↗</a>', true);
    }
  }

  async function loadMore() {
    if (state.loading || state.exhausted || state.searchMode) return;
    state.loading = true;
    updateLoadMoreButton();
    try {
      const html = await fetchHTML(FORO_BASE + 'index.php?pagina=' + state.nextPage);
      const more = parseForoDocument(html);
      const existingIds = new Set(state.threads.map(t => t.id));
      const uniqueNew = more.filter(t => !existingIds.has(t.id));
      if (!uniqueNew.length) {
        state.exhausted = true;
      } else {
        state.threads.push.apply(state.threads, uniqueNew);
        appendThreadCards(uniqueNew, 'end');
        state.nextPage++;
      }
    } catch (e) {
      setStatus('No se ha podido cargar más contenido ahora mismo.', true);
    } finally {
      state.loading = false;
      updateLoadMoreButton();
    }
  }

  // ---------- Búsqueda ----------

  function searchResultHTML(r) {
    return (
      '<article class="pide-post pide-search-result">' +
        '<div class="pide-post-main pide-post-static">' +
          '<span class="pide-avatar" style="--av-color:' + colorForName(r.author) + '">' + initials(r.author) + '</span>' +
          '<span class="pide-post-body">' +
            '<span class="pide-post-head">' +
              '<span class="pide-author">' + escapeHTML(r.author) + '</span>' +
              (r.isStaff ? '<span class="pide-badge" title="Cuenta oficial del sindicato">✓</span>' : '') +
              '<span class="pide-dot">·</span>' +
              '<span class="pide-time">' + escapeHTML(timeAgo(r.date)) + '</span>' +
            '</span>' +
            '<span class="pide-title">' + escapeHTML(r.title) + (r.count ? ' <span class="pide-title-count">(' + r.count + (r.count === 1 ? ' mensaje' : ' mensajes') + ')</span>' : '') + '</span>' +
            '<span class="pide-preview pide-preview-search">' + r.snippetHtml + '</span>' +
          '</span>' +
        '</div>' +
        '<div class="pide-thread" data-hilo="' + escapeHTML(r.hiloId || '') + '">' +
          '<button class="btn secondary pide-open-thread" type="button">Ver hilo completo aquí</button>' +
        '</div>' +
      '</article>'
    );
  }

  function bindSearchResult(article) {
    const btn = article.querySelector('.pide-open-thread');
    const detail = article.querySelector('.pide-thread');
    const hiloId = detail.getAttribute('data-hilo');
    if (!btn || !hiloId) return;
    btn.addEventListener('click', async () => {
      detail.innerHTML = '<p class="pide-loading">Cargando hilo…</p>';
      try {
        const html = await fetchHTML(FORO_BASE + 'index.php?hilo=' + encodeURIComponent(hiloId));
        const threads = parseForoDocument(html);
        detail.innerHTML = threads[0]
          ? fullThreadHTML(threads[0])
          : '<p class="pide-loading">No se pudo cargar. <a href="' + FORO_BASE + 'index.php?hilo=' + hiloId + '" target="_blank" rel="noopener noreferrer">Abrir en sindicatopide.org ↗</a></p>';
      } catch (e) {
        detail.innerHTML = '<p class="pide-loading">Error al cargar. <a href="' + FORO_BASE + 'index.php?hilo=' + hiloId + '" target="_blank" rel="noopener noreferrer">Abrir en sindicatopide.org ↗</a></p>';
      }
    });
  }

  async function doSearch(query) {
    state.searchMode = true;
    els.searchExit.hidden = false;
    els.loadMoreBtn.hidden = true;
    els.newPill.hidden = true;
    setStatus('Buscando "' + escapeHTML(query) + '"…');
    els.feed.innerHTML = '';

    try {
      const html = await fetchHTML(FORO_BASE + 'index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'buscar=' + encodeURIComponent(query)
      });
      const results = parseSearchResults(html);
      if (!results.length) {
        els.feed.innerHTML = '<p class="pide-loading">Sin resultados para "' + escapeHTML(query) + '".</p>';
      } else {
        results.forEach(r => {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = searchResultHTML(r);
          const article = wrapper.firstElementChild;
          bindSearchResult(article);
          els.feed.appendChild(article);
        });
      }
      setStatus('');
    } catch (e) {
      setStatus('No se ha podido buscar ahora mismo.', true);
    }
  }

  function exitSearch() {
    state.searchMode = false;
    els.searchExit.hidden = true;
    els.loadMoreBtn.hidden = false;
    els.searchInput.value = '';
    setStatus('');
    renderAll();
  }
})();
