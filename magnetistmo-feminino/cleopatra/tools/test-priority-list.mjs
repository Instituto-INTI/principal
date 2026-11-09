import assert from 'node:assert/strict';
import { mkdtemp, readFile, unlink, rmdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createApp } from '../server.mjs';

const directory = await mkdtemp(path.join(os.tmpdir(), 'cleopatra-priority-test-'));
const server = createApp({ dataDirectory: directory });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const endpoint = `${base}/api/priority-list`;
const sample = { name: 'João Teste', whatsapp: '(71) 99999-9999', email: 'teste@example.invalid', consent: true };
const send = (data, headers = {}) => fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base, ...headers }, body: JSON.stringify(data) });
try {
  const success = await send(sample);
  assert.equal(success.status, 201);
  assert.deepEqual(await success.json(), { ok: true });
  const records = () => readFile(path.join(directory, 'priority-list.jsonl'), 'utf8').then(text => text.trim().split('\n').map(JSON.parse));
  const [saved] = await records();
  assert.equal(saved.name, sample.name);
  assert.equal(saved.whatsapp, '71999999999');
  assert.equal(saved.email, sample.email);
  assert(saved.id && Date.parse(saved.createdAt) && saved.consent.includes('WhatsApp'));
  for (const bad of [{ name: ' ' }, { whatsapp: 'abc11999999999' }, { whatsapp: '123' }, { email: 'invalid' }, { consent: false }, { name: 'A\nB' }]) {
    assert.equal((await send({ ...sample, ...bad })).status, 422);
  }
  assert.equal((await send(null)).status, 422);
  assert.equal((await send(sample, { Origin: 'https://another.example' })).status, 403);
  assert.equal((await send(sample, { Origin: 'null' })).status, 403);
  assert.equal((await send(sample, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await fetch(endpoint)).status, 405);
  assert.equal((await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' })).status, 400);
  assert.equal((await send({ ...sample, name: 'x'.repeat(5000) })).status, 413);
  assert.equal((await records()).length, 1, 'Rejected requests never create contacts');
  const responses = await Promise.all(Array.from({ length: 8 }, (_, i) => send({ ...sample, name: `Usuária ${i}` })));
  assert(responses.every(response => response.status === 201));
  assert.equal((await records()).length, 9, 'Concurrent records remain complete valid JSON');
  for (const url of ['/data/priority-list.jsonl', '/priority-list.jsonl']) assert.equal((await fetch(base + url)).status, 404);
  assert.equal((await fetch(base)).status, 200);
  assert.equal((await fetch(base, { method: 'HEAD' })).status, 200);
  const video = await fetch(base + '/assets/video%20celular.mp4', { headers: { Range: 'bytes=0-1023' } });
  assert.equal(video.status, 206);
  assert.equal((await video.arrayBuffer()).byteLength, 1024);

  // Simulate unwritable storage without touching real contacts.
  const blocked = path.join(directory, 'not-a-directory');
  await writeFile(blocked, 'test');
  const failing = createApp({ dataDirectory: blocked });
  await new Promise(resolve => failing.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${failing.address().port}/api/priority-list`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sample) });
    assert.equal(response.status, 500, 'Storage failure cannot return success');
    assert.deepEqual(await response.json(), { ok: false });
  } finally { await new Promise(resolve => failing.close(resolve)); await unlink(blocked); }
  assert.equal((await send(sample, { Origin: 'http://127.0.0.1:5500' })).status, 403, 'Cross-port preview is disabled by default');
  const preview = createApp({ dataDirectory: directory, allowLocalPreview: true });
  await new Promise(resolve => preview.listen(0, '127.0.0.1', resolve));
  try {
    const url = `http://127.0.0.1:${preview.address().port}/api/priority-list`;
    for (const origin of ['http://127.0.0.1:5500', 'http://localhost:5500']) {
      const options = await fetch(url, { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
      assert.equal(options.status, 204);
      assert.equal(options.headers.get('access-control-allow-origin'), origin);
      assert.equal(options.headers.get('access-control-allow-methods'), 'POST');
      const response = await fetch(url, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(sample) });
      assert.equal(response.status, 201);
      assert.equal(response.headers.get('access-control-allow-origin'), origin);
    }
    assert.equal((await records()).length, 11, 'Live Server submissions are actually saved');
    for (const origin of ['https://another.example', 'http://127.0.0.1.evil.example:5500', 'null', 'http://192.168.1.2:5500']) {
      assert.equal((await fetch(url, { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST' } })).status, 403);
    }
  } finally { await new Promise(resolve => preview.close(resolve)); }
  console.log('OK: cadastro persistente, validação, origem, limite, concorrência, dados privados, erro de armazenamento e vídeos preservados.');
} finally {
  await new Promise(resolve => server.close(resolve));
  await unlink(path.join(directory, 'priority-list.jsonl')).catch(() => {});
  await rmdir(directory);
}
