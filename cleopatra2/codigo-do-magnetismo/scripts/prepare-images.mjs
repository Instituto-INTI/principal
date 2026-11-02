import sharp from 'sharp';
import { stat } from 'node:fs/promises';
const base = 'public/images/';
await sharp('.asset-sources/cleopatra-hero-source.png').resize(1122).webp({ quality: 86 }).toFile(base + 'cleopatra-hero.webp');
await sharp('.asset-sources/cleopatra-hero-source.png').resize(640).webp({ quality: 82 }).toFile(base + 'cleopatra-hero-mobile.webp');
await sharp('.asset-sources/cleopatra-throne-source.png').resize(1122).webp({ quality: 86 }).toFile(base + 'cleopatra-throne.webp');
await sharp('.asset-sources/cleopatra-hero-source.png').resize(1200, 630, { fit: 'cover', position: 'attention' }).webp({ quality: 85 }).toFile(base + 'social.webp');
for (const file of ['cleopatra-hero.webp', 'cleopatra-hero-mobile.webp', 'cleopatra-throne.webp', 'social.webp']) console.log(file, Math.round((await stat(base + file)).size / 1024), 'KB');
