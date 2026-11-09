import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPriorityListHandler } from './priority-list.mjs';
const root = path.resolve(fileURLToPath(new URL('../../magnetismo-feminino/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const port = Number(process.env.PORT || 4173);
export function createApp({ dataDirectory = process.env.CLEOPATRA_DATA_DIR || fileURLToPath(new URL('./data/', import.meta.url)), allowLocalPreview = false } = {}) {
const priorityList = createPriorityListHandler(path.join(dataDirectory, 'priority-list.jsonl'), { allowLocalPreview });
return http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); res.end('Invalid request'); return; }
  if (pathname === '/api/priority-list') { void priorityList(req, res); return; }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.stat(file, (error, stats) => {
    if (error || !stats.isFile()) { res.writeHead(404); res.end('Not found'); return; }
    const headers = { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Content-Length': stats.size };
    const isVideo = ['.mp4', '.webm'].includes(path.extname(file));
    if (isVideo) headers['Accept-Ranges'] = 'bytes';
    if (isVideo && req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      const suffix = match && !match[1];
      const start = suffix ? Math.max(0, stats.size - Number(match[2])) : Number(match?.[1]);
      const end = suffix || !match?.[2] ? stats.size - 1 : Math.min(Number(match[2]), stats.size - 1);
      if (!match || (!match[1] && !match[2]) || start >= stats.size || start < 0 || end < start) {
        res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` }); res.end(); return;
      }
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${stats.size}`, 'Content-Length': end - start + 1 });
      fs.createReadStream(file, { start, end }).pipe(res); return;
    }
    res.writeHead(200, headers);
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file).pipe(res);
  });
});
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createApp({ allowLocalPreview: true }).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
}
