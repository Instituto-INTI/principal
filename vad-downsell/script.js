const revealTargets = document.querySelectorAll(
  'section, .brand, .hero-copy, .hero-visual, .photo-card, .video-shell, .topic-grid article, .split > *, .together-copy, .guarantee-grid, .offer-card, .offer-copy, .mockup'
);

revealTargets.forEach((element, index) => {
  element.classList.add('reveal');
  element.style.transitionDelay = `${Math.min(index * 0.08, 0.5)}s`;
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -30px 0px'
  }
);

revealTargets.forEach((element) => revealObserver.observe(element));

// Liberação em 50% da duração real do vídeo (VTurb SmartPlayer V4).
(() => {
  const player = document.getElementById('vid-6ace55895c7e85022d10fd74');
  const key = 'vturb-offer-unlocked-6ace55895c7e85022d10fd74-downsell';
  const preview = new URLSearchParams(window.location.search).get('preview') === '1';
  let unlocked = false;
  let knownDuration = 0;

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    document.documentElement.classList.add('offer-unlocked');
    const heroButton = document.getElementById('heroOfferBtn');
    if (heroButton) heroButton.hidden = false;
    try { sessionStorage.setItem(key, '1'); } catch (_) {}
  }

  try {
    if (preview || sessionStorage.getItem(key) === '1') unlock();
  } catch (_) { if (preview) unlock(); }

  function checkProgress(event) {
    if (unlocked) return;
    const time = Number(event?.detail?.time ?? player?.currentTime);
    const duration = Number(player?.duration);
    if (Number.isFinite(duration) && duration > 0) knownDuration = duration;
    if (Number.isFinite(time) && knownDuration > 0 && time >= knownDuration * 0.5) {
      unlock();
    }
  }

  // Os eventos são registrados antes do carregamento assíncrono do player.
  player.addEventListener('player:ready', checkProgress);
  player.addEventListener('video:timeupdate', checkProgress);
  player.addEventListener('video:ended', unlock);
})();

document.getElementById("buyBtn").addEventListener("click", (event) => {
  event.preventDefault();
  // Troque '#' no HTML pela URL real do checkout.
  alert("Adicione aqui a URL do checkout do Viver a Dois.");
});

document.getElementById("declineBtn").addEventListener("click", (event) => {
  event.preventDefault();
  // Troque '#' no HTML pela URL para continuar somente com o Guia.
  alert("Adicione aqui a URL de continuidade do Guia.");
});
