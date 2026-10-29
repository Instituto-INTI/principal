(() => {
  const player = document.getElementById('vid-6a831b98d46da2e77f9cb8d8');
  if (!player) return;

  const revealAt = 0.5;
  const events = ['player:ready', 'video:play', 'video:timeupdate'];
  let revealed = false;

  // VTurb API: https://docs.vturb.com/en/docs/reference/player/api/events
  function checkProgress(event) {
    if (revealed || !player.played || player.inSmartAutoPlay) return;

    const duration = player.duration;
    const time = event.detail?.time ?? player.currentTime;
    if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(time)) return;
    if (time / duration < revealAt) return;

    revealed = true;
    document.body.classList.remove('video-pending');
    events.forEach(type => player.removeEventListener(type, checkProgress));
    window.dispatchEvent(new Event('video:content-revealed'));
  }

  // Load this file before the asynchronous VTurb script so ready is not missed.
  events.forEach(type => player.addEventListener(type, checkProgress));
})();
