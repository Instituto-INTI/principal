(() => {
  'use strict';

  const player = document.getElementById('vid-6afb25de3d8d0dff27996353');
  const content = document.getElementById('vsl-delayed-content');
  const presentation = document.getElementById('apresentacao');
  if (!player || !content || !presentation) return;

  const delayedElements = [...document.querySelectorAll('[data-vsl-delayed]')];
  const unlockTimeSeconds = 4 * 60 + 55;
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
    player.removeEventListener('video:ended', onPlayback);
    player.removeEventListener('player:ready', onReady);
    document.removeEventListener('click', redirectLockedAnchor, true);
    document.dispatchEvent(new CustomEvent('cleopatra:vsl-unlocked'));
  }

  function checkProgress(time) {
    if (unlocked || player.inSmartAutoPlay === true) return;
    const currentTime = Number(time);
    if (!Number.isFinite(currentTime) || currentTime < 0) return;
    if (currentTime >= unlockTimeSeconds) unlock();
  }

  function onTimeUpdate(event) {
    // VTurb V4 emits { detail: { time } } on this specific player element.
    checkProgress(event.detail?.time ?? player.currentTime);
  }

  function onPlayback() {
    checkProgress(player.currentTime);
  }

  function onReady() {
    // A restored playback position can already be past the unlock time.
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
  player.addEventListener('video:ended', onPlayback);
  document.addEventListener('click', redirectLockedAnchor, true);
  onReady();
})();
