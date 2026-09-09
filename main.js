document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const menuBtn = document.getElementById('menuBtn');
  const menu    = document.getElementById('menu');
  if (menuBtn && menu) {
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('show');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('nav')) {
        menu.classList.remove('show');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (window.renderYoutubeEmbeds) {
    window.renderYoutubeEmbeds(document);
  }
});

window.renderYoutubeEmbeds = function renderYoutubeEmbeds(root = document) {
  if (!document.getElementById('youtubeFallbackStyles')) {
    const style = document.createElement('style');
    style.id = 'youtubeFallbackStyles';
    style.textContent = `
      .youtube-fallback{position:relative;display:block;width:100%;aspect-ratio:16/9;overflow:hidden;color:#fff;text-decoration:none;background:#000}
      .youtube-fallback img{width:100%;height:100%;display:block;object-fit:cover;filter:brightness(.72)}
      .youtube-play{position:absolute;inset:50% auto auto 50%;width:44px;height:44px;transform:translate(-50%,-50%);border-radius:999px;background:rgba(255,0,0,.88)}
      .youtube-play::after{content:"";position:absolute;top:50%;left:52%;transform:translate(-50%,-50%);border-style:solid;border-width:8px 0 8px 14px;border-color:transparent transparent transparent #fff}
      .youtube-fallback-text{position:absolute;left:8px;right:8px;bottom:7px;font-size:.76rem;font-weight:800;text-align:center;text-shadow:0 1px 8px rgba(0,0,0,.9)}
    `;
    document.head.appendChild(style);
  }

  const embeds = root.querySelectorAll('.youtube-embed[data-youtube-id]');
  const isLocalFile = window.location.protocol === 'file:';

  embeds.forEach(embed => {
    const id = embed.dataset.youtubeId;
    const title = embed.dataset.youtubeTitle || 'Video de YouTube';
    const watchUrl = `https://www.youtube.com/watch?v=${id}`;

    if (isLocalFile) {
      embed.innerHTML = `
        <a class="youtube-fallback" href="${watchUrl}" target="_blank" rel="noopener" aria-label="${title}">
          <img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="${title}">
          <span class="youtube-play" aria-hidden="true"></span>
          <span class="youtube-fallback-text">Ver vídeo en YouTube</span>
        </a>
      `;
      return;
    }

    embed.innerHTML = `
      <iframe src="https://www.youtube.com/embed/${id}" title="${title}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    `;
  });
};

window.createIframeModal = function createIframeModal(options) {
  const modal = options.modal;
  const container = options.container;
  const closeButton = options.closeButton;
  const desktopRatio = options.desktopRatio || 0.91;
  const mobileRatio = options.mobileRatio || 0.72;
  let activeIframe = null;

  function resize() {
    if (!activeIframe) return;

    try {
      const doc = activeIframe.contentWindow.document;
      const h = Math.max(
        doc.body.scrollHeight,
        doc.documentElement.scrollHeight
      );
      const isDesktop = window.matchMedia('(min-width: 901px)').matches;
      const limit = Math.floor(window.innerHeight * (isDesktop ? desktopRatio : mobileRatio));
      activeIframe.style.height = Math.min(h, limit) + 'px';
    } catch(e) {
      activeIframe.style.height = '600px';
    }
  }

  function open(file) {
    modal.style.display = 'flex';

    const iframe = document.createElement('iframe');
    activeIframe = iframe;
    iframe.src = file;
    iframe.style.cssText = 'width:100%;border:none;display:block;border-radius:4px;min-height:260px;max-height:91vh;overflow:auto;';
    iframe.scrolling = 'auto';
    iframe.onload = () => {
      resize();
      setTimeout(resize, 120);
      setTimeout(resize, 450);
      setTimeout(resize, 900);
    };

    container.innerHTML = '';
    container.appendChild(iframe);
  }

  function close() {
    modal.style.display = 'none';
    container.innerHTML = '';
    activeIframe = null;
  }

  if (closeButton) closeButton.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  window.addEventListener('resize', resize);
  window.addEventListener('message', e => {
    if (e.data && e.data.type === 'resize-project-modal') resize();
  });

  return { open, close, resize };
};
