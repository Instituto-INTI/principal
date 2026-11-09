(() => {
  'use strict';
  const config = window.CLEOPATRA_CONFIG || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const loopVideos = [...document.querySelectorAll('.hero-background-video, .section-loop')];
  const visibleVideos = new Set();
  const dataConnection = navigator.connection;
  const syncLoop = video => {
    if (video.dataset.failed) return;
    if (reducedMotion.matches || document.hidden || dataConnection?.saveData || !visibleVideos.has(video)) {
      video.pause();
      return;
    }
    if (video.dataset.src) {
      video.src = video.dataset.src;
      delete video.dataset.src;
      video.load();
    }
    video.play().catch(() => {});
  };
  const syncAllLoops = () => loopVideos.forEach(syncLoop);
  loopVideos.forEach(video => {
    video.muted = true;
    video.defaultMuted = true;
    if (reducedMotion.matches || dataConnection?.saveData) video.removeAttribute('autoplay');
    video.addEventListener('error', () => {
      if (video.dataset.failed) return;
      video.dataset.failed = 'true';
      video.pause();
      const fallback = document.createElement('img');
      fallback.src = video.poster;
      fallback.alt = video.getAttribute('aria-label') || '';
      fallback.className = 'loop-fallback';
      video.replaceWith(fallback);
      visibleVideos.delete(video);
    });
  });
  reducedMotion.addEventListener('change', syncAllLoops);
  document.addEventListener('visibilitychange', syncAllLoops);
  dataConnection?.addEventListener('change', syncAllLoops);
  if ('IntersectionObserver' in window) {
    const loopObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleVideos.add(entry.target);
        else visibleVideos.delete(entry.target);
        syncLoop(entry.target);
      });
    }, { threshold: 0.01 });
    loopVideos.forEach(video => loopObserver.observe(video));
  } else {
    loopVideos.forEach(video => visibleVideos.add(video));
    syncAllLoops();
  }
  const validHttps = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
  document.documentElement.classList.add('js-motion');

  if ('IntersectionObserver' in window) {
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); reveals.unobserve(entry.target); } });
    }, { threshold: 0.09 });
    document.querySelectorAll('.reveal').forEach(el => reveals.observe(el));
  } else { document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view')); }

  const progress = document.querySelector('.reading-progress');
  const sticky = document.querySelector('.sticky-offer');
  const hero = document.querySelector('.hero');
  const offer = document.querySelector('#oferta');
  const footer = document.querySelector('.footer');
  let ticking = false;
  function updateScroll() {
    const maximum = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${maximum > 0 ? window.scrollY / maximum : 0})`;
    const rect = offer.getBoundingClientRect();
    const pastHero = hero.getBoundingClientRect().bottom < 0;
    const viewingOffer = rect.top < window.innerHeight * 0.8 && rect.bottom > 100;
    const viewingFooter = footer.getBoundingClientRect().top < window.innerHeight;
    const contentUnlocked = !document.getElementById('vsl-delayed-content')?.hidden;
    const visible = contentUnlocked && pastHero && !viewingOffer && !viewingFooter;
    sticky.classList.toggle('visible', visible);
    sticky.inert = !visible;
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { window.requestAnimationFrame(updateScroll); ticking = true; } }, { passive: true });
  window.addEventListener('resize', updateScroll);
  window.addEventListener('load', updateScroll);
  document.addEventListener('cleopatra:vsl-unlocked', updateScroll);
  updateScroll();

  let returnFocus;
  const dialogs = [...document.querySelectorAll('dialog')];
  function openDialog(dialog) {
    returnFocus = document.activeElement;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }
  function closeDialog(dialog) { dialog.close(); }
  dialogs.forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
      }
    });
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(dialog)));
    dialog.addEventListener('close', () => {
      document.body.style.overflow = '';
      const frame = dialog.querySelector('iframe');
      const video = dialog.querySelector('video');
      if (frame) frame.src = 'about:blank';
      if (video) video.pause();
      returnFocus?.focus({ preventScroll: true });
    });
  });
  const videoContainer = document.querySelector('#video-container');
  const fallback = document.querySelector('#presentation-fallback');
  function prepareVideo() {
    videoContainer.replaceChildren();
    fallback.hidden = false;
    if (!validHttps(config.videoUrl)) return;
    const url = new URL(config.videoUrl);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let source;
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
      const id = host === 'youtu.be' ? url.pathname.split('/')[1] : url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1];
      if (id && /^[\w-]{11}$/.test(id)) source = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    } else if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const id = url.pathname.match(/(?:\/video)?\/(\d+)/)?.[1];
      if (id) source = `https://player.vimeo.com/video/${id}?autoplay=1`;
    } else if (/\.(mp4|webm)$/i.test(url.pathname)) {
      const video = document.createElement('video');
      video.src = url.href; video.controls = true; video.autoplay = true; video.playsInline = true;
      video.setAttribute('aria-label', 'Apresentação do Protocolo do Magnetismo Feminino');
      videoContainer.append(video); fallback.hidden = true;
    }
    if (source) {
      const iframe = document.createElement('iframe');
      iframe.src = source; iframe.title = 'Apresentação do Protocolo do Magnetismo Feminino';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture'; iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      videoContainer.append(iframe); fallback.hidden = true;
    }
  }
  document.querySelectorAll('[data-presentation]').forEach(button => button.addEventListener('click', () => { prepareVideo(); openDialog(document.querySelector('#presentation-dialog')); }));
  document.querySelectorAll('[data-checkout]').forEach(button => button.addEventListener('click', () => {
    openDialog(document.querySelector('#checkout-dialog'));
  }));

  const end = config.offerEndsAt ? Date.parse(config.offerEndsAt) : NaN;
  const countdown = document.querySelector('#offer-countdown');
  let countdownTimer;
  function updateCountdown() {
    const remaining = end - Date.now();
    if (!Number.isFinite(end) || remaining <= 0) {
      countdown.hidden = true;
      if (countdownTimer) window.clearInterval(countdownTimer);
      if (Number.isFinite(end) && remaining <= 0) {
        document.querySelector('#checkout-status').textContent = 'O prazo desta oferta foi encerrado.';
      }
      return;
    }
    countdown.hidden = false;
    const seconds = Math.floor(remaining / 1000);
    const values = { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
    for (const [key, value] of Object.entries(values)) countdown.querySelector(`[data-${key}]`).textContent = String(value).padStart(2, '0');
  }
  if (Number.isFinite(end)) { updateCountdown(); if (end > Date.now()) countdownTimer = window.setInterval(updateCountdown, 1000); }

})();
