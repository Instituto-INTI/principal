import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('public/fonts', { recursive: true });
const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const cssUrl = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&family=Manrope:wght@400..800&display=swap';
const response = await fetch(cssUrl, { headers: { 'User-Agent': agent } });
if (!response.ok) throw new Error(`Fonts CSS: ${response.status}`);
const css = await response.text();
let found = 0;
for (const match of css.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/g)) {
  const block = match[1];
  const src = block.match(/url\(([^)]+)\)/)?.[1];
  const cormorant = block.includes('Cormorant');
  const italic = /font-style:\s*italic/.test(block);
  const name = cormorant ? `cormorant-${italic ? 'italic-' : ''}latin.woff2` : 'manrope-latin.woff2';
  if (!src) throw new Error('Missing font URL');
  const font = await fetch(src);
  if (!font.ok) throw new Error(`${name}: ${font.status}`);
  await writeFile(`public/fonts/${name}`, Buffer.from(await font.arrayBuffer()));
  console.log(name); found++;
}
if (found !== 3) throw new Error('Expected exactly 3 Latin variable font files');
for (const family of ['cormorantgaramond', 'manrope']) {
  const license = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`);
  if (!license.ok) throw new Error(`License for ${family}: ${license.status}`);
  await writeFile(`public/fonts/${family}-OFL.txt`, await license.text());
}
