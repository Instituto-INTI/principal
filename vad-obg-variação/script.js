const revealItems = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -5% 0px'
});

revealItems.forEach((item) => {
  item.style.transitionDelay = item.style.getPropertyValue('--delay') || '0ms';
  revealObserver.observe(item);
});

document.querySelectorAll("[data-link]").forEach(el=>{
  el.addEventListener("click",e=>{
    if(el.getAttribute("href")==="#"){
      e.preventDefault();
      const type=el.dataset.link;
      const labels={guia:"link de acesso ao Guia Prático",produtos:"link da área de produtos",suporte:"link do WhatsApp ou canal de suporte"};
      alert("Substitua o # no HTML pelo "+labels[type]+".");
    }
  });
});