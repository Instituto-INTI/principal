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

document.getElementById("playBtn").addEventListener("click", () => {
  alert("Substitua o bloco PLAYER DA VSL pelo código embed do seu player de vídeo.");
});

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