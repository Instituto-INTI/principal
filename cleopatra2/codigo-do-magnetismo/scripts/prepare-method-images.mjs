import sharp from 'sharp';

const images = [
  ['CONEXÃO SIMBÓLICA', 'conexao-simbolica'],
  ['IMERSÃO ARQUETÍPICA', 'imersao-arquetipica'],
  ['CANALIZAÇÃO PSÍQUICA', 'canalizacao-psiquica'],
];
for (const [source, destination] of images) {
  const result = await sharp(`public/images/${source}.jpeg`).rotate().resize({ width: 900, withoutEnlargement: true }).webp({ quality: 84 }).toFile(`public/images/${destination}.webp`);
  console.log(`${destination}.webp: ${result.width} × ${result.height}, ${Math.round(result.size / 1024)} KB`);
}
