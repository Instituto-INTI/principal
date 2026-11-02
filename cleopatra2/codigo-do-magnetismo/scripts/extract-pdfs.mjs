import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const root = 'C:/Users/israe/Downloads/';
await mkdir('../docs', { recursive: true });
for (const [name, output] of [['Framework de Produto- Cleópatra.pdf', 'copy'], ['Framework de Produto- Cleópatra (1).pdf', 'briefing']]) {
  const pdf = await getDocument({ data: new Uint8Array(await readFile(root + name)), useSystemFonts: true }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += `\n\n=== PÁGINA ${i} ===\n` + content.items.map(x => x.str + (x.hasEOL ? '\n' : ' ')).join('');
  }
  await writeFile('../docs/' + output + '.txt', text);
  console.log(output, pdf.numPages, 'pages', text.length, 'characters');
}
