import sharp from 'sharp';

// Preserve supplied compositions and originals; create lightweight website versions.
const images = [
  ['O Espelho da Rainha', 'espelho-da-rainha'],
  ['A Coroa de Cleópatra', 'coroa-de-cleopatra'],
  ['Os Tesouros do Nilo', 'tesouros-do-nilo'],
  ['O Decreto da Rainha', 'decreto-da-rainha'],
  ['O Fascínio de Cleópatra', 'fascinio-de-cleopatra'],
  ['A Aura Dourada', 'aura-dourada'],
  ['O Trono de Cleópatra', 'trono-de-cleopatra'],
];
for (const [source, destination] of images) {
  const result = await sharp(`public/images/${source}.jpeg`).rotate().resize({ width: 900, withoutEnlargement: true }).webp({ quality: 84 }).toFile(`public/images/${destination}.webp`);
  console.log(`${destination}.webp: ${result.width} × ${result.height}, ${Math.round(result.size / 1024)} KB`);
}
