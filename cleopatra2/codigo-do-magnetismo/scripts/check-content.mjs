import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { renderPage } from './render-page.mjs';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
const { html, copy, siteConfig, validCheckout, getSalesState, App } = await renderPage();
const decode = str => str.replace(/&#x([a-f0-9]+);/gi, (_, c) => String.fromCodePoint(parseInt(c, 16))).replace(/&#(\d+);/g, (_, c) => String.fromCodePoint(Number(c))).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;|&#x27;/g, "'").replace(/&gt;/g, '>').replace(/&lt;/g, '<');
const normalize = str => decode(str).replace(/\s+/g, ' ').trim().toLocaleLowerCase('pt-BR');
const rendered = normalize(html.replace(/<[^>]*>/g, ' '));
const source = normalize(await readFile('docs/copy-original.txt', 'utf8'));
let count = 0;
function check(value, key = '', mustRender = true) {
  if (typeof value === 'string') {
    if (key === 'key') return;
    const text = normalize(value);
    assert.ok(source.includes(text), `Copy not found in approved PDF: ${value}`);
    if (mustRender) assert.ok(rendered.includes(text), `Approved copy missing from rendered page: ${value}`);
    count++;
  } else if (Array.isArray(value)) value.forEach(v => check(v, '', mustRender));
  else if (value && typeof value === 'object') {
    const visible = mustRender && !('key' in value && !siteConfig[value.key]?.trim());
    Object.entries(value).forEach(([k, v]) => check(v, k, visible));
  }
}
check(copy);
assert.deepEqual([...html.matchAll(/data-section="(\d+)"/g)].map(m => m[1]), ['01','02','03','04','05','06','07','08','10','11','12']);
assert.equal(copy.faq.length, 8, 'All 8 questions must remain in the content');
assert.equal((html.match(/<summary>/g) || []).length, copy.faq.filter(item => item.answer || siteConfig[item.key]?.trim()).length, 'Only FAQs with approved answers are public');
for (const item of copy.faq.filter(item => item.key && !siteConfig[item.key]?.trim())) assert.ok(!rendered.includes(normalize(item.question)));
assert.equal((html.match(/class="portal portal-/g) || []).length, 7, 'Expected 7 experiences');
assert.equal((html.match(/<video\b/g) || []).length, 1, 'Only the supplied hero video should be active');
assert.ok(html.includes('id="hero-video"') && html.includes('muted=""') && html.includes('playsInline=""') && html.includes('loop=""'), 'Hero video must be muted, inline and looped');
assert.ok(!html.includes('<audio'), 'No audio-only player without media');
assert.ok(!/href="(?:#|javascript:|https?:\/\/example\.)"/i.test(html), 'No false CTA');
assert.ok(!html.includes('[INSERIR') && !html.includes('DIREÇÃO VISUAL:'), 'No editorial instructions in public copy');
for (const value of ['', 'javascript:alert(1)', 'http://checkout.com', 'https://example.com', 'https://user:pass@checkout.com']) assert.equal(validCheckout(value), null);
for (const value of ['https://pay.example.com', 'https://localhost', 'https://127.0.0.1', 'https://[::1]']) assert.equal(validCheckout(value), null);
assert.equal(validCheckout('https://pay.hotmart.com/real-checkout'), 'https://pay.hotmart.com/real-checkout');
const sales = getSalesState(siteConfig);
if (!sales.ready && !sales.waitlist) assert.equal((html.match(/class="cta" disabled=""/g) || []).length, 2, 'Purchase CTAs must clearly be unavailable');
if (!sales.ready) assert.ok(!html.includes('>SEU INVESTIMENTO<'), 'Incomplete sales data must not appear as an open offer');
assert.equal((html.match(/data-layer="[1-7]"/g) || []).length, 7, 'Exactly seven concentric layers');
assert.equal((html.match(/class="layer-connector"/g) || []).length, 7, 'Each layer has its connector');
const legend = html.match(/<ol class="layers-legend">(.*?)<\/ol>/s)?.[1];
assert.ok(legend, 'Accessible HTML legend required');
assert.deepEqual([...legend.matchAll(/href="#dia-(\d)"/g)].map(m => Number(m[1])), [1,2,3,4,5,6,7]);
assert.ok(html.indexOf('class="seven-layers"') < html.indexOf('id="nivel-i"'), 'Infographic before levels');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate IDs');
for (const m of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(m[1]), `Missing anchor ${m[1]}`);
const paths = new Set([...html.matchAll(/(?:src|srcSet|poster)="(\/[^" ]+)"/g)].map(m => m[1]));
for (const path of paths) assert.ok((await stat('public' + decodeURIComponent(path))).isFile(), `Missing media ${path}`);
for (const path of ['/fonts/cormorant-latin.woff2','/fonts/cormorant-italic-latin.woff2','/fonts/manrope-latin.woff2']) assert.ok((await stat('public' + path)).size > 0);
// Exercise the configured states without changing the delivered configuration.
const original = { ...siteConfig };
try {
  Object.assign(siteConfig, { checkoutUrl: 'https://pay.hotmart.com/qa', waitlistUrl: '', price: '', paymentTerms: '' });
  assert.equal(getSalesState(siteConfig).ready, false, 'A URL alone must not open sales');
  Object.assign(siteConfig, { waitlistUrl: 'https://forms.google.com/qa' });
  let scenario = renderToString(createElement(App));
  assert.equal((scenario.match(/href="https:\/\/forms.google.com\/qa"/g) || []).length, 2);
  assert.ok(!scenario.includes('href="https://pay.hotmart.com/qa"'));
  Object.assign(siteConfig, { price: 'VALOR DE TESTE', paymentTerms: 'CONDIÇÕES DE TESTE', platform: 'PLATAFORMA DE TESTE', accessPeriod: 'PRAZO DE TESTE', delivery: 'ENTREGA DE TESTE', guarantee: 'GARANTIA DE TESTE', activationDuration: 'DURAÇÃO DE TESTE' });
  assert.equal(getSalesState(siteConfig).ready, true);
  scenario = renderToString(createElement(App));
  assert.equal((scenario.match(/href="https:\/\/pay.hotmart.com\/qa"/g) || []).length, 2);
  assert.equal((scenario.match(/<summary>/g) || []).length, 8);
  Object.assign(siteConfig, { videos: { ...original.videos, invitation: { ...original.videos.invitation, src: '/qa-invitation.mp4' }, demonstration: { ...original.videos.demonstration, src: '/qa-demo.mp4' } } });
  scenario = renderToString(createElement(App));
  assert.equal((scenario.match(/<video\b/g) || []).length, 3);
  assert.ok(scenario.includes('Ler o convite'));
  assert.equal((scenario.match(/preload="none"/g) || []).length, 2);
  for (const line of copy.invitation.script) assert.ok(normalize(scenario.replace(/<[^>]*>/g, ' ')).includes(normalize(line)));
  Object.assign(siteConfig, { testimonials: [{ authorized: false, product: 'codigo-do-magnetismo', format: 'text', name: 'TESTE', text: 'TESTE' }] });
  assert.ok(!renderToString(createElement(App)).includes('data-section="09"'));
  siteConfig.testimonials[0].authorized = true;
  assert.ok(renderToString(createElement(App)).includes('data-section="09"'));
} finally { Object.assign(siteConfig, original); }
console.log(`PASS: ${count} approved copy fragments matched to the existing PDF extraction; applicable copy rendered.`);
console.log('PASS: sections, 7 rings and experiences, conditional FAQ, anchors, assets, supplied hero, media/transcript states, checkout completeness, waitlist, authorized testimonials.');
