import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code = fs.readFileSync(new URL('../../../magnetismo-feminino/priority-form.js', import.meta.url), 'utf8');
class Element {
  handlers = {};
  attributes = {};
  hidden = false;
  value = '';
  validityMessage = '';
  addEventListener(type, callback) { this.handlers[type] = callback; }
  setAttribute(key, value) { this.attributes[key] = value; }
  removeAttribute(key) { delete this.attributes[key]; }
  getAttribute(key) { return this.attributes[key]; }
  setCustomValidity(message) { this.validityMessage = message; }
  focus() { this.focused = true; }
}
function setup(fetchImpl, protocol = 'http:', location = {}, config = {}) {
  const elements = Object.fromEntries(['checkout-dialog', 'priority-form', 'priority-registration', 'priority-success', 'priority-success-title', 'priority-error'].map(id => [id, new Element()]));
  const form = elements['priority-form'];
  form.elements = Object.fromEntries(['name', 'whatsapp', 'email'].map(id => [id, new Element()]));
  Object.assign(form.elements.name, { value: '  Maria  ' });
  Object.assign(form.elements.whatsapp, { value: '(71) 99999-9999' });
  Object.assign(form.elements.email, { value: 'maria@example.invalid' });
  const button = new Element(); button.innerHTML = 'Entrar';
  form.querySelector = () => button;
  form.attributes.action = '/api/priority-list';
  form.attributes['data-success-url'] = 'cadastro-confirmado.html';
  form.reportValidity = () => Object.values(form.elements).every(el => !el.validityMessage);
  form.reset = () => Object.values(form.elements).forEach(el => { el.value = ''; });
  elements['priority-success'].hidden = elements['priority-error'].hidden = true;
  elements['checkout-dialog'].open = true;
  const timers = new Set();
  const redirects = [];
  vm.runInNewContext(code, { document: { getElementById: id => elements[id] }, fetch: fetchImpl, AbortController, window: { CLEOPATRA_CONFIG: config, location: { protocol, hostname: '127.0.0.1', port: '4173', assign: url => redirects.push(url), ...location }, setTimeout: callback => { timers.add(callback); return callback; }, clearTimeout: callback => timers.delete(callback) } });
  let prevented = 0;
  return { ...elements, button, timers, redirects, get prevented() { return prevented; }, submit: () => form.handlers.submit({ preventDefault() { prevented++; } }) };
}
{
  let resolveRequest, count = 0, payload;
  const state = setup((url, options) => { count++; payload = JSON.parse(options.body); return new Promise(resolve => { resolveRequest = resolve; }); });
  const pending = state.submit();
  assert.equal(state.prevented, 1, 'Native submission is prevented until the server confirms persistence');
  assert(state.button.disabled && state['priority-success'].hidden);
  assert.deepEqual(state.redirects, [], 'No redirect before server confirmation');
  await state.submit(); assert.equal(count, 1, 'Double submission ignored');
  assert.equal(payload.name, 'Maria'); assert.equal(payload.consent, true);
  resolveRequest({ ok: true, json: async () => ({ ok: true }) }); await pending;
  assert.deepEqual(state.redirects, ['cadastro-confirmado.html']);
  assert(!state.button.disabled && !state.timers.size);
  state['checkout-dialog'].handlers.close();
  assert(!state['priority-registration'].hidden && state['priority-success'].hidden);
}
for (const fetchImpl of [async () => { throw Error('network'); }, async () => ({ ok: false, json: async () => ({ ok: false }) }), async () => ({ ok: true, json: async () => ({}) }), async () => ({ ok: true, json: async () => { throw Error('invalid response'); } })]) {
  const state = setup(fetchImpl); await state.submit();
  assert(!state['priority-registration'].hidden && state['priority-success'].hidden);
  assert(!state['priority-error'].hidden && state['priority-form'].elements.name.value.includes('Maria'));
  assert.deepEqual(state.redirects, [], 'Failure never redirects to confirmation');
  assert(!state.button.disabled && !state.timers.size);
}
{
  let calls = 0; const state = setup(async () => { calls++; });
  state['priority-form'].elements.whatsapp.value = '123'; await state.submit();
  assert.equal(calls, 0, 'Invalid WhatsApp never sent');
}
{
  const state = setup(() => { throw Error('should not fetch'); }, 'file:'); await state.submit();
  assert(state['priority-success'].hidden && state['priority-error'].textContent.includes('Não foi possível enviar'));
}
const html = fs.readFileSync(new URL('../../../magnetismo-feminino/index.html', import.meta.url), 'utf8');
for (const status of [404, 405]) {
  const calls = [];
  const state = setup(async (url, options) => {
    calls.push({ url, body: options.body });
    return calls.length === 1 ? { status, ok: false } : { status: 201, ok: true, json: async () => ({ ok: true }) };
  }, 'http:', { port: '5500' });
  await state.submit();
  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, 'http://127.0.0.1:4173/api/priority-list');
  assert.equal(calls[0].body, calls[1].body);
  assert.deepEqual(state.redirects, ['cadastro-confirmado.html'], 'Live Server connects to real local API before redirecting');
}
for (const status of [422, 500]) {
  let calls = 0;
  const state = setup(async () => { calls++; return { status, ok: false, json: async () => ({ ok: false }) }; }, 'http:', { port: '5500' });
  await state.submit(); assert.equal(calls, 1, 'No duplicate request after validation or save failure');
  assert(state['priority-success'].hidden);
}
{
  let calls = 0;
  const state = setup(async () => { calls++; if (calls === 1) return { status: 405 }; throw Error('offline'); }, 'http:', { port: '5500' });
  await state.submit(); assert(state['priority-error'].textContent.includes('temporariamente indisponível'));
}
{
  let calls = 0;
  const state = setup(async () => { calls++; return { status: 405 }; }, 'https:', { hostname: 'example.com', port: '' });
  await state.submit(); assert.equal(calls, 1, 'Published pages never send contacts to localhost');
}
for (const name of ['name', 'whatsapp', 'email']) assert(new RegExp(`name="${name}"[^>]+required`).test(html));
{
  const calls = [];
  const state = setup(async url => { calls.push(url); return { status: 201, ok: true, json: async () => ({ ok: true }) }; }, 'https:', { hostname: 'example.com', port: '' }, { priorityEndpoint: 'https://api.example.invalid/cadastro' });
  await state.submit();
  assert.deepEqual(calls, ['https://api.example.invalid/cadastro']);
  assert.deepEqual(state.redirects, ['cadastro-confirmado.html']);
}
{
  const calls = [];
  const state = setup(async url => { calls.push(url); return { status: 404 }; }, 'http:', { port: '5500' }, { priorityEndpoint: 'https://api.example.invalid/cadastro' });
  await state.submit();
  assert.equal(calls.length, 1, 'Configured API failures never retry against a different server');
  assert.deepEqual(state.redirects, []);
}
assert(!html.includes('Inscrições encerradas'), 'Enrollment closure notice appears only after registration');
const confirmation = fs.readFileSync(new URL('../../../magnetismo-feminino/cadastro-confirmado.html', import.meta.url), 'utf8');
assert(confirmation.includes('seu cadastro foi realizado com sucesso'));
const message = confirmation.match(/<div class="priority-message">([\s\S]*?)<\/div>/)[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
assert.equal(message, 'As inscrições para o Protocolo do Magnetismo Feminino estão temporariamente encerradas, mas temos uma boa notícia: seu cadastro foi realizado com sucesso e você já está na nossa Lista de Prioridade! Para garantir a qualidade da experiência e o acompanhamento das participantes, estamos limitando o número de novos acessos. Mas você já deu o primeiro passo! Assim que novas vagas forem disponibilizadas, você será uma das primeiras pessoas a receber o aviso. Fique de olho no seu WhatsApp e e-mail. Sua oportunidade pode estar mais perto do que imagina.');
console.log('OK: redirecionamento após gravação, validação, envio único, erro sem perder dados, API configurável e aviso após cadastro.');
