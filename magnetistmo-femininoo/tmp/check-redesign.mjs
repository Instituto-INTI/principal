import fs from 'node:fs';
import assert from 'node:assert/strict';
const html = fs.readFileSync('cleopatra/dist/index.html', 'utf8');
const css = fs.readFileSync('cleopatra/dist/styles.css', 'utf8');
assert(!/Cormorant|Garamond|DM\+Sans|fonts\.googleapis/.test(html + css), 'As fontes anteriores foram removidas');
assert(html.includes('De opção') && html.includes('João Rafael'), 'O HTML mantém UTF-8');
assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length, 'Blocos CSS completos');
assert(css.includes('@media(prefers-reduced-motion:reduce)'), 'Movimento reduzido disponível');
assert(css.includes('@media(max-width:600px)'), 'Layout para celular disponível');
assert(html.includes('id="apresentacao"') && html.includes('data-presentation'), 'Apresentação navegável');
for (const font of ['outfit', 'manrope']) {
  const file = `cleopatra/dist/assets/fonts/${font}-variable.ttf`;
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.readUInt32BE(0), 0x00010000, `Fonte ${font} em formato TrueType válido`);
  const response = await fetch(`http://127.0.0.1:4173/assets/fonts/${font}-variable.ttf`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'font/ttf');
  assert.equal((await response.arrayBuffer()).byteLength, bytes.byteLength);
}
console.log('OK: fontes locais válidas, UTF-8, blocos CSS, configuração responsiva e apresentação.');
