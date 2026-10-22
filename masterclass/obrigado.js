const WHATSAPP_GROUP_URL = 'https://sndflw.com/i/vPRiTJylSxHXR1hAZ9LU';

const button = document.getElementById('botaozap');
const notice = document.getElementById('linkNotice');
if (/^https:\/\/sndflw\.com\/i\/[A-Za-z0-9_-]+\/?$/.test(WHATSAPP_GROUP_URL.trim())) {
  button.href = WHATSAPP_GROUP_URL.trim();
  button.removeAttribute('aria-disabled');
} else {
  button.addEventListener('click', event => event.preventDefault());
  notice.textContent = 'Link do grupo ainda não configurado.';
}
