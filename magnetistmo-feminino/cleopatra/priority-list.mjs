import { mkdir, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const permission = 'Receber avisos sobre as novas vagas do Protocolo do Magnetismo Feminino pelo WhatsApp e e-mail informados.';

export function createPriorityListHandler(filename, { allowLocalPreview = false } = {}) {
  let writes = Promise.resolve();
  return async (req, res) => {
    const reply = (status, payload) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(JSON.stringify(payload));
    };
    // Local previews may use Live Server on another loopback port.
    // This exception is disabled unless the local launcher enables it.
    if (req.headers.origin) {
      let allowed = false;
      try {
        const origin = new URL(req.headers.origin);
        const target = new URL(`http://${req.headers.host}`);
        const loopback = hostname => ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
        const localConnection = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
        allowed = ['http:', 'https:'].includes(origin.protocol) && (origin.host === req.headers.host ||
          (allowLocalPreview && localConnection && origin.protocol === 'http:' && loopback(origin.hostname) && loopback(target.hostname)));
      } catch {}
      if (!allowed) { reply(403, { ok: false }); return; }
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS') {
      if (!req.headers.origin || req.headers['access-control-request-method'] !== 'POST') { reply(405, { ok: false }); return; }
      res.writeHead(204, { 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' }); res.end(); return;
    }
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); reply(405, { ok: false }); return; }
    if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') { reply(415, { ok: false }); return; }
    try {
      const chunks = [];
      let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > 4096) { reply(413, { ok: false }); return; }
        chunks.push(chunk);
      }
      let input;
      try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { reply(400, { ok: false }); return; }
      if (!input || typeof input !== 'object' || Array.isArray(input)) { reply(422, { ok: false }); return; }
      const name = typeof input.name === 'string' ? input.name.trim() : '';
      const email = typeof input.email === 'string' ? input.email.trim() : '';
      const rawPhone = typeof input.whatsapp === 'string' ? input.whatsapp.trim() : '';
      const whatsapp = rawPhone.replace(/\D/g, '');
      if (name.length < 2 || name.length > 120 || /[\x00-\x1f\x7f]/.test(name) ||
          email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          rawPhone.length > 30 || !/^[+\d\s().-]+$/.test(rawPhone) || whatsapp.length < 10 || whatsapp.length > 15 || input.consent !== true) {
        reply(422, { ok: false }); return;
      }
      const record = { id: randomUUID(), createdAt: new Date().toISOString(), name, whatsapp, email, consent: permission };
      const write = writes.then(async () => {
        await mkdir(path.dirname(filename), { recursive: true });
        await appendFile(filename, JSON.stringify(record) + '\n', { encoding: 'utf8', mode: 0o600, flush: true });
      });
      writes = write.catch(() => {});
      await write;
      reply(201, { ok: true });
    } catch {
      if (!res.headersSent && !res.destroyed) reply(500, { ok: false });
    }
  };
}
