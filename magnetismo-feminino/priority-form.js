(() => {
  'use strict';
  const dialog = document.getElementById('checkout-dialog');
  const form = document.getElementById('priority-form');
  const error = document.getElementById('priority-error');
  const phone = form.elements.whatsapp;
  const name = form.elements.name;
  const submit = form.querySelector('[type="submit"]');
  const submitLabel = submit.innerHTML;
  const localPreview = window.location.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) && window.location.port !== '4173';
  let sending = false;

  function validate() {
    const digits = phone.value.replace(/\D/g, '');
    phone.setCustomValidity(digits.length >= 10 && digits.length <= 15 && /^[+\d\s().-]+$/.test(phone.value) ? '' : 'Informe um WhatsApp válido com DDD, usando de 10 a 15 dígitos.');
    name.setCustomValidity(name.value.trim().length >= 2 ? '' : 'Informe seu nome com pelo menos 2 caracteres.');
  }
  phone.addEventListener('input', validate);
  name.addEventListener('input', validate);
  dialog.addEventListener('close', () => {
    // Closing the dialog must not interrupt a request already in progress.
    if (sending) return;
    error.hidden = true;
    dialog.setAttribute('aria-labelledby', 'checkout-title');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    validate();
    if (!form.reportValidity()) return;
    sending = true;
    error.hidden = true;
    submit.disabled = true;
    submit.textContent = 'Enviando seu cadastro…';
    dialog.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      if (window.location.protocol === 'file:') throw new Error('local-file');
      const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.value.trim(), whatsapp: phone.value.trim(), email: form.elements.email.value.trim(), consent: true }),
        signal: controller.signal
      };
      // A production API can be supplied without changing the registration flow.
      const endpoint = window.CLEOPATRA_CONFIG?.priorityEndpoint || form.getAttribute('action');
      let response = await fetch(endpoint, request);
      // Live Server serves the page but cannot receive POST requests.
      // Retry only its explicit missing-route response, never a failed save.
      if (localPreview && endpoint === form.getAttribute('action') && [404, 405].includes(response.status)) {
        try { response = await fetch('http://127.0.0.1:4173/api/priority-list', request); }
        catch { throw new Error('local-service-unavailable'); }
      }
      if ([404, 405].includes(response.status)) throw new Error('api-unavailable');
      if (response.status === 422) throw new Error('invalid-fields');
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error('registration-failed');
      form.reset();
      name.setCustomValidity('');
      phone.setCustomValidity('');
      window.location.assign(form.getAttribute('data-success-url'));
    } catch (reason) {
      const messages = {
        'local-file': 'Não foi possível enviar seu cadastro. Tente novamente pelo endereço da página. Seus dados continuam preenchidos.',
        'local-service-unavailable': 'O cadastro está temporariamente indisponível. Tente novamente em instantes. Seus dados continuam preenchidos.',
        'api-unavailable': 'O cadastro está temporariamente indisponível. Tente novamente em instantes. Seus dados continuam preenchidos.',
        'invalid-fields': 'Confira seu nome, WhatsApp com DDD e e-mail antes de enviar novamente.'
      };
      error.textContent = messages[reason.message] || 'Não foi possível confirmar seu cadastro. Tente novamente em instantes. Seus dados continuam preenchidos.';
      error.hidden = false;
    } finally {
      window.clearTimeout(timeout);
      sending = false;
      submit.disabled = false;
      submit.innerHTML = submitLabel;
      dialog.removeAttribute('aria-busy');
    }
  });
})();
