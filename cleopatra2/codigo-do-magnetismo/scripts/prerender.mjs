import { readFile, writeFile } from 'node:fs/promises';
import { renderPage } from './render-page.mjs';
const { html } = await renderPage();
const template = await readFile('dist/index.html', 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('Missing prerender root');
await writeFile('dist/index.html', template.replace('<div id="root"></div>', `<div id="root">${html}</div>`));
console.log('Static HTML generated: complete page content available before JavaScript.');
