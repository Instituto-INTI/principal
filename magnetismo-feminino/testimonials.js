(() => {
  'use strict';
  const carousel = document.querySelector('.testimonial-carousel');
  const track = document.querySelector('.testimonial-track');
  if (!carousel || !track || !track.children.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...track.children];
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    track.append(clone);
  });
  carousel.setAttribute('aria-live', 'off');

  const dots = [...document.querySelectorAll('[data-slide]')];
  const pauseButton = document.querySelector('[data-pause]');
  const speed = 22; // Constant pixels per second; independent of frame rate.
  let offset = 0, cycleWidth = 0, cardStep = 0, active = -1;
  let frame = 0, lastTime = null;
  let paused = reducedMotion.matches, hovered = false, focused = false, touching = false;
  let onScreen = !('IntersectionObserver' in window), touchStart, pinching = false;

  const wrap = value => cycleWidth > 0 ? ((value % cycleWidth) + cycleWidth) % cycleWidth : 0;
  const canMove = () => !paused && !hovered && !focused && !touching && !document.hidden && onScreen && cycleWidth > 0;

  function render() {
    track.style.transform = `translate3d(-${offset}px, 0, 0)`;
    const index = cardStep > 0 ? Math.floor((offset + 0.001) / cardStep) % cards.length : 0;
    if (index === active) return;
    active = index;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === active);
      dot.setAttribute('aria-current', i === active ? 'true' : 'false');
    });
  }

  function advance(time) {
    frame = 0;
    if (!canMove()) { lastTime = null; return; }
    if (lastTime !== null) {
      offset = wrap(offset + speed * Math.min(Math.max(time - lastTime, 0), 80) / 1000);
      render();
    }
    lastTime = time;
    frame = window.requestAnimationFrame(advance);
  }

  function syncMotion() {
    if (!canMove()) {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      lastTime = null;
    } else if (!frame) {
      lastTime = null;
      frame = window.requestAnimationFrame(advance);
    }
  }

  function measure() {
    const phase = cycleWidth > 0 ? offset / cycleWidth : 0;
    const firstClone = track.children[cards.length];
    cycleWidth = Math.max(0, firstClone.getBoundingClientRect().left - cards[0].getBoundingClientRect().left);
    cardStep = cycleWidth / cards.length;
    offset = wrap(phase * cycleWidth);
    render();
    syncMotion();
  }

  function jumpTo(index) {
    if (!cycleWidth) measure();
    const target = ((index % cards.length) + cards.length) % cards.length;
    offset = wrap(target * cardStep);
    render();
    syncMotion();
  }

  function updatePause() {
    if (pauseButton) {
      pauseButton.textContent = paused ? '▷' : 'Ⅱ';
      pauseButton.setAttribute('aria-label', paused ? 'Ativar movimento automático' : 'Pausar movimento automático');
      pauseButton.setAttribute('aria-pressed', paused ? 'true' : 'false');
    }
    syncMotion();
  }

  document.querySelector('[data-prev]')?.addEventListener('click', () => jumpTo(active - 1));
  document.querySelector('[data-next]')?.addEventListener('click', () => jumpTo(active + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => jumpTo(i)));
  pauseButton?.addEventListener('click', () => { paused = !paused; updatePause(); });
  carousel.addEventListener('mouseenter', () => { hovered = true; syncMotion(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; syncMotion(); });
  carousel.addEventListener('focusin', () => { focused = true; syncMotion(); });
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) { focused = false; syncMotion(); }
  });
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      jumpTo(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  carousel.addEventListener('touchstart', event => {
    // Native pinch-to-zoom must not advance the carousel.
    if (event.touches?.length > 1) {
      pinching = true;
      touchStart = undefined;
      touching = true;
      syncMotion();
      return;
    }
    touchStart = event.changedTouches[0].clientX;
    touching = true;
    syncMotion();
  }, { passive: true });
  carousel.addEventListener('touchend', event => {
    if (!pinching && touchStart !== undefined) {
      const delta = touchStart - event.changedTouches[0].clientX;
      if (Math.abs(delta) > 40) jumpTo(active + (delta > 0 ? 1 : -1));
    }
    touchStart = undefined;
    if (event.touches?.length) return;
    pinching = false;
    touching = false;
    syncMotion();
  }, { passive: true });
  carousel.addEventListener('touchcancel', () => {
    touching = false;
    touchStart = undefined;
    pinching = false;
    syncMotion();
  }, { passive: true });

  document.addEventListener('visibilitychange', syncMotion);
  document.addEventListener('cleopatra:vsl-unlocked', measure);
  reducedMotion.addEventListener('change', event => { paused = event.matches; updatePause(); });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(carousel);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      onScreen = entries[0].isIntersecting;
      if (onScreen) measure();
      else syncMotion();
    }).observe(carousel);
  }
  measure();
  updatePause();
})();
