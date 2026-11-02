// QA local de produção sem dependências adicionais: Chrome headless via CDP.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve, extname } from 'node:path';
import sharp from 'sharp';

const qa = resolve('.qa');
const dist = resolve('dist');
await mkdir(qa, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = resolve(dist, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(dist + '\\') && !path.startsWith(dist + '/')) { res.writeHead(403).end(); return; }
    const body = await readFile(path);
    res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
    const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range) {
      const start = Number(range[1]), end = Math.min(range[2] ? Number(range[2]) : body.length - 1, body.length - 1);
      if (start > end) { res.writeHead(416).end(); return; }
      res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${body.length}`, 'Content-Length': end - start + 1 });
      res.end(body.subarray(start, end + 1));
    } else res.writeHead(200, { 'Content-Length': body.length }).end(body);
  } catch { res.writeHead(404).end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/`;
const executable = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
await stat(executable);
const chrome = spawn(executable, ['--headless=new', '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required', `--user-data-dir=${resolve(qa, 'chrome-' + Date.now())}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
try {
  const endpoint = await new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error('Chrome startup timeout')), 20000);
    chrome.on('error', reject);
    chrome.stderr.on('data', data => {
      output += data;
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let nextId = 0, sessionId;
  const pending = new Map(), errors = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      if (request) { clearTimeout(request.timer); pending.delete(message.id); message.error ? request.reject(new Error(JSON.stringify(message.error))) : request.resolve(message.result); }
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') errors.push(message.params.entry.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(arg => arg.value || arg.description).join(' '));
  });
  const send = (method, params = {}, browserCommand = false) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params, ...(!browserCommand && sessionId ? { sessionId } : {}) }));
  });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' }, true);
  ({ sessionId } = await send('Target.attachToTarget', { targetId, flatten: true }, true));
  await send('Page.enable'); await send('Page.bringToFront'); await send('Runtime.enable'); await send('Log.enable');
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  const until = async expression => {
    for (let attempt = 0; attempt < 60; attempt++) { if (await evaluate(expression)) return; await pause(100); }
    throw new Error('Page condition failed: ' + expression);
  };
  const report = [];
  for (const width of [375, 390, 768, 1024, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await send('Page.navigate', { url });
    await until("document.readyState === 'complete' && !!document.querySelector('.layers-legend')");
    await evaluate('document.fonts.ready');
    await until("document.querySelector('.hero-video-control')?.getAttribute('aria-label') === 'Reproduzir vídeo de abertura'");
    const size = await evaluate(`({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight })`);
    assert.equal(size.width, width);
    assert.ok(size.scrollWidth <= width, `Horizontal overflow at ${width}px: ${size.scrollWidth}`);
    const overflow = await evaluate(`Array.from(document.querySelectorAll('main *')).filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.left < -1 || r.right > innerWidth + 1); }).map(el => el.tagName + '.' + el.className).slice(0,20)`);
    assert.deepEqual(overflow, [], `Element overflow at ${width}px`);
    assert.equal(await evaluate("document.querySelectorAll('[data-layer]').length"), 7);
    assert.equal(await evaluate("document.querySelectorAll('.portal').length"), 7);
    assert.equal(await evaluate("document.querySelectorAll('.faq details').length"), 5);
    assert.equal(await evaluate("document.querySelectorAll('[data-section=\"09\"]').length"), 0);
    const bodyText = await evaluate(`Array.from(document.querySelectorAll('.hero-description p, .method-step p, .portal-description p, .audience-list p, .offer-list p:not(.offer-extra), .how-to p, .faq-answer p, .finale-content .prose p')).map(el => parseFloat(getComputedStyle(el).fontSize))`);
    assert.ok(bodyText.every(size => size >= 16), `Body text below 16px at ${width}`);
    const overlap = await evaluate(`['.hero','.finale'].map(selector => { const section = document.querySelector(selector); const image = section.querySelector(selector + '-image').getBoundingClientRect(); const text = section.querySelector(selector + '-content h1, ' + selector + '-content h2').getBoundingClientRect(); return Math.max(0,Math.min(image.right,text.right)-Math.max(image.left,text.left)) * Math.max(0,Math.min(image.bottom,text.bottom)-Math.max(image.top,text.top)); })`);
    assert.deepEqual(overlap, [0,0], `Headline overlaps portrait at ${width}`);
    // Real pointer click, then keyboard Enter and Space on a focused summary.
    await evaluate("document.querySelector('.faq summary').scrollIntoView({block:'center'})");
    const point = await evaluate("(() => {const r = document.querySelector('.faq summary').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
    await until("document.querySelector('.faq details').open === true");
    const { root } = await send('DOM.getDocument');
    const { nodeId } = await send('DOM.querySelector', { nodeId: root.nodeId, selector: '.faq summary' });
    const expanded = await send('Accessibility.getPartialAXTree', { nodeId });
    assert.ok(expanded.nodes.some(node => node.properties?.some(property => property.name === 'expanded' && property.value.value === true)), 'Native summary must expose expanded state');
    await evaluate("document.querySelector('.faq summary').focus()");
    assert.equal(await evaluate("document.activeElement === document.querySelector('.faq summary')"), true);
    for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, ...(type === 'keyDown' ? { text: '\r', unmodifiedText: '\r' } : {}) });
    await until("document.querySelector('.faq details').open === false");
    const collapsed = await send('Accessibility.getPartialAXTree', { nodeId });
    assert.ok(collapsed.nodes.some(node => node.properties?.some(property => property.name === 'expanded' && property.value.value === false)), 'Native summary must expose collapsed state');
    for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: ' ', code: 'Space', windowsVirtualKeyCode: 32, ...(type === 'keyDown' ? { text: ' ', unmodifiedText: ' ' } : {}) });
    await until("document.querySelector('.faq details').open === true");
    await evaluate("document.querySelector('.faq details').open = false");
    if (width < 600) {
      await evaluate("document.querySelector('.menu-toggle').click()");
      await until("document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'true'");
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await until("document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'false'");
    }
    assert.equal(await evaluate("Array.from(document.querySelectorAll('.purchase-action button')).every(el => el.disabled)"), true);
    await evaluate("document.querySelector('.hero-content .cta').click()");
    assert.equal(await evaluate("location.hash === '#oferta' && document.querySelector('#oferta').getBoundingClientRect().top < 100"), true, 'Hero CTA must navigate to the offer');
    // Trigger lazy-loaded images throughout the actual page, then record the full layout.
    await evaluate(`(async()=>{ for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,30));} scrollTo(0,0); document.querySelectorAll('img[loading="lazy"]').forEach(img => {img.loading = 'eager';}); })()`);
    await until('Array.from(document.images).every(img => img.complete && img.naturalWidth > 0)');
    await evaluate('Promise.all(Array.from(document.images).map(img => img.decode()))');
    await pause(200);
    assert.equal(await evaluate('Array.from(document.images).every(img => img.complete && img.naturalWidth > 0)'), true);
    // Stitch painted viewports: very tall mobile pages can exceed Chrome's texture limit.
    const tiles = [];
    for (let top = 0; top < size.height; top += 900) {
      const actualTop = await evaluate(`scrollTo(0,${top}); scrollY`);
      await pause(40);
      const tile = await send('Page.captureScreenshot', { format: 'png' });
      tiles.push({ input: Buffer.from(tile.data, 'base64'), left: 0, top: Math.round(actualTop) });
    }
    const path = resolve(qa, `page-${width}.png`);
    await sharp({ create: { width, height: size.height, channels: 3, background: '#100d12' } }).composite(tiles).png().toFile(path);
    await evaluate('scrollTo(0,0)');
    if (width === 375 || width === 1440) {
      await evaluate("document.querySelector('#dia-1').scrollIntoView({block:'center'})");
      await pause(100);
      const viewport = await send('Page.captureScreenshot', { format: 'png' });
      await writeFile(resolve(qa, `activation-viewport-${width}.png`), Buffer.from(viewport.data, 'base64'));
      await evaluate('scrollTo(0,0)');
      const sections = await evaluate("Array.from(document.querySelectorAll('[data-section]')).map(el => ({number:el.dataset.section,top:el.getBoundingClientRect().top+scrollY,height:el.getBoundingClientRect().height}))");
      for (const section of sections) await sharp(path).extract({ left: 0, top: Math.ceil(section.top), width, height: Math.min(Math.floor(section.height), size.height - Math.ceil(section.top)) }).png().toFile(resolve(qa, `section-${section.number}-${width}.png`));
    }
    report.push({ width, height: size.height, overflow: 0, minBodyText: Math.min(...bodyText), faqClickAndKeyboard: 'pass', portraitsSeparateFromHeadlines: true });
    console.log(`PASS ${width}px: no overflow/portrait overlap, readable text, media, FAQ click/keyboard, menu, CTAs.`);
  }
  // Normal motion: autoplay, pause/resume, pause outside viewport, user pause persists.
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await evaluate('scrollTo(0,0)');
  await until("document.querySelector('#hero-video')?.paused === false");
  await evaluate("document.querySelector('.hero-video-control').click()");
  await until("document.querySelector('#hero-video').paused");
  await evaluate("document.querySelector('#oferta').scrollIntoView()");
  await pause(200);
  await evaluate('scrollTo(0,0)');
  await pause(200);
  assert.equal(await evaluate("document.querySelector('#hero-video').paused"), true);
  await evaluate("document.querySelector('.hero-video-control').click()");
  await until("document.querySelector('#hero-video').paused === false");
  await evaluate("document.querySelector('#oferta').scrollIntoView()");
  await until("document.querySelector('#hero-video').paused");
  // Error on the actual supplied media activates its approved static fallback.
  await evaluate("document.querySelector('#hero-video').dispatchEvent(new Event('error'))");
  await until("!document.querySelector('#hero-video') && !!document.querySelector('.hero-image picture')");
  assert.deepEqual(errors, [], 'Browser console errors');
  await writeFile(resolve(qa, 'browser-report.json'), JSON.stringify({ date: new Date().toISOString(), report, consoleErrors: errors, motionAndVideoFallback: 'pass' }, null, 2));
  console.log('PASS: reduced/normal motion, supplied video pause/resume/visibility, media fallback, no console errors.');
} finally {
  socket?.close();
  chrome.kill();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
