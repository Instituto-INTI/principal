import { cp, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// The existing host serves the repository directly. Publish the built files
// beside the source, touching only this project's generated files.
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const html = await readFile(join(dist, 'index.html'), 'utf8');
if (!html.includes('id="hero-title"') || html.includes('src="/src/main.tsx"')) {
  throw new Error('Build the complete, prerendered page before publishing.');
}
for (const name of ['assets', 'images', 'fonts', 'favicon.svg']) {
  await cp(join(dist, name), join(root, name), { recursive: true });
}
// Write the entry point after its dependencies are in place.
await writeFile(join(root, 'index.html'), html);
console.log('Static page prepared at cleopatra2/codigo-do-magnetismo/index.html.');
