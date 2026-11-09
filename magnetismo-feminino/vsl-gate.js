(() => {
  'use strict';

  const player = document.getElementById('vid-6aee4b40cbb56d66d7edc140');
  const content = document.getElementById('vsl-delayed-content');
  const presentation = document.getElementById('apresentacao');
  if (!player || !content || !presentation) return;

  const delayedElements = [...document.querySelectorAll('[data-vsl-delayed]')];
  let unlocked = false;

  function unlock() {
    if (unlocked || player.inSmartAutoPlay === true) return;
    unlocked = true;
    delayedElements.forEach(element => {
      element.hidden = false;
      element.inert = false;
    });
    player.removeEventListener('video:timeupdate', onTimeUpdate);
    player.removeEventListener('video:play', onPlayback);
    player.removeEventListener('video:pause', onPlayback);
    player.removeEventListener('video:ended', unlock);
    player.removeEventListener('player:ready', onReady);
    document.removeEventListener('click', redirectLockedAnchor, true);
    document.dispatchEvent(new CustomEvent('cleopatra:vsl-unlocked'));
  }

  function checkProgress(time) {
    if (unlocked || player.inSmartAutoPlay === true) return;
    const duration = Number(player.duration);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const currentTime = Number(time);
    if (!Number.isFinite(currentTime) || currentTime < 0) return;
    if (currentTime >= duration * 0.5) unlock();
  }

  function onTimeUpdate(event) {
    // VTurb V4 emits { detail: { time } } on this specific player element.
    checkProgress(event.detail?.time ?? player.currentTime);
  }

  function onPlayback() {
    checkProgress(player.currentTime);
  }

  function onReady() {
    // A restored playback position can already be past the halfway point.
    if (player.played === true) onPlayback();
  }

  function redirectLockedAnchor(event) {
    if (unlocked || event.defaultPrevented) return;
    const anchor = event.target.closest?.('a[href^="#"]');
    if (!anchor) return;
    const target = document.getElementById(anchor.getAttribute('href').slice(1));
    if (!target?.closest('[data-vsl-delayed]')) return;
    event.preventDefault();
    presentation.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  player.addEventListener('player:ready', onReady);
  player.addEventListener('video:timeupdate', onTimeUpdate);
  player.addEventListener('video:play', onPlayback);
  player.addEventListener('video:pause', onPlayback);
  player.addEventListener('video:ended', unlock);
  document.addEventListener('click', redirectLockedAnchor, true);
  onReady();
})();
