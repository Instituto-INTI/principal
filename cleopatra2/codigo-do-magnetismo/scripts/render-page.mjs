import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

export async function renderPage() {
  await mkdir('.qa', { recursive: true });
  await build({
    stdin: { contents: "export { default as App } from './src/App'; export * as copy from './src/content'; export { siteConfig, validCheckout, getSalesState } from './src/config';", resolveDir: process.cwd(), loader: 'tsx' },
    outfile: '.qa/render.mjs', bundle: true, platform: 'node', format: 'esm', external: ['react', 'react-dom', 'react-dom/server', 'lucide-react'], jsx: 'automatic',
  });
  const module = await import(pathToFileURL(resolve('.qa/render.mjs')).href + '?t=' + Date.now());
  return { ...module, html: renderToString(createElement(module.App)) };
}
