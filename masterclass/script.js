// CONFIGURAÇÃO RÁPIDA
// Se quiser, informe uma URL de página de obrigado em THANK_YOU_URL.
const THANK_YOU_URL = '';

function getBrasiliaNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());

  const get = type => Number(parts.find(part => part.type === type)?.value);
  const date = new Date(Date.UTC(get('year'), get('month') - 1, get('day')));

  return { date, hour: get('hour'), minute: get('minute') };
}

function getNextMasterclass() {
  const { date, hour, minute } = getBrasiliaNow();
  const sessionHasPassed = hour > 19 || (hour === 19 && minute >= 30);
  let weekday = date.getUTCDay();
  const today = date.getTime();

  if (weekday < 1 || weekday > 4 || sessionHasPassed) {
    do {
      date.setUTCDate(date.getUTCDate() + 1);
      weekday = date.getUTCDay();
    } while (weekday === 0 || weekday > 4);
  }

  const dateText = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC'
  }).format(date);

  const weekdayText = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    timeZone: 'UTC'
  }).format(date);

  const label = date.getTime() === today ? `HOJE, ${dateText}` : `${weekdayText.toUpperCase()}, ${dateText}`;

  return { date, label };
}

const nextMasterclass = getNextMasterclass();
document.querySelectorAll('[data-event-date]').forEach(el => {
  el.textContent = nextMasterclass.label;
});
document.querySelectorAll('[data-event-time]').forEach(el => {
  el.textContent = '19H30';
});

const modal = document.getElementById('signupModal');
const form = document.getElementById('signupForm');
const success = document.getElementById('formSuccess');
const sticky = document.querySelector('.mobile-sticky');

function openModal(){
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  setTimeout(() => modal.querySelector('input')?.focus(), 50);
}
function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}
document.querySelectorAll('.open-modal').forEach(btn => btn.addEventListener('click', openModal));
document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', closeModal));
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

const phone = form.querySelector('input[name="whatsapp"]');
phone.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g,'').slice(0,11);
  if(v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3');
  else if(v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3');
  else if(v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/,'($1) $2');
  else if(v.length) v = v.replace(/(\d{0,2})/,'($1');
  e.target.value = v;
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  if(!form.reportValidity()) return;

  // Integração futura:
  // Aqui você pode enviar os dados para Kiwify, ActiveCampaign, Make, n8n,
  // webhook próprio, Supabase ou outra ferramenta antes do redirecionamento.
  const data = Object.fromEntries(new FormData(form).entries());
  console.log('Inscrição capturada:', data);

  form.hidden = true;
  success.hidden = false;
  if(THANK_YOU_URL){ setTimeout(() => window.location.href = THANK_YOU_URL, 700); }
});

const revealTargets = document.querySelectorAll(
  '.reveal, .section > .container > .cards, .section > .container > .check-grid, ' +
  '.section > .container > .prose, .section > .container > blockquote, ' +
  '.section > .container > .impact-line, .section > .container > .event-card, ' +
  '.section > .container > .cta, .section > .container > h2, .section > .container > h3, ' +
  '.cards > .card, .check-grid > div, footer .container'
);

revealTargets.forEach((element, index) => {
  element.classList.add('reveal');
  if (element.parentElement?.classList.contains('cards') || element.parentElement?.classList.contains('check-grid')) {
    element.style.setProperty('--reveal-delay', `${(index % 6) * 90}ms`);
  }
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
},{threshold:.12, rootMargin:'0px 0px -6%'});

revealTargets.forEach(element => observer.observe(element));

function updateSticky(){
  if(window.innerWidth <= 860 && window.scrollY > 620) sticky.classList.add('show');
  else sticky.classList.remove('show');
}
window.addEventListener('scroll', updateSticky, {passive:true});
window.addEventListener('resize', updateSticky);
updateSticky();
