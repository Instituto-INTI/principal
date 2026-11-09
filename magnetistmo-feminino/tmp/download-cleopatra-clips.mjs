import fs from 'node:fs';
const clips = [
  { name: 'presenca', videoId: '70d700dd7ada4fbdbf2b8d14b5f69f21', url: 'https://resource2.heygen.ai/videos/53dc60d03bef4b0d9fec4a7d18b85c82/53dc60d03bef4b0d9fec4a7d18b85c82/01a1ad32-224f-79c7-bf5a-caf375506032.mp4' },
  { name: 'fascinio', videoId: 'f7c3231d5a6c4b5c8c8775e570ef4475', url: 'https://resource2.heygen.ai/videos/53dc60d03bef4b0d9fec4a7d18b85c82/53dc60d03bef4b0d9fec4a7d18b85c82/01a1ad34-553b-7c1d-8f72-8f9dd064e43a.mp4' },
  { name: 'magnetismo', videoId: 'acbf58e686ca4f6f8e66ba644b13f8f5', url: 'https://resource2.heygen.ai/videos/53dc60d03bef4b0d9fec4a7d18b85c82/53dc60d03bef4b0d9fec4a7d18b85c82/01a1ad34-8bc2-7713-9ea1-fa28f2f9ffb6.mp4' }
];
fs.mkdirSync('tmp/video-originals', { recursive: true });
for (const clip of clips) {
  const destination = `tmp/video-originals/${clip.name}.mp4`;
  if (fs.existsSync(destination) && fs.statSync(destination).size > 1000) { console.log('Already downloaded:', clip.name); continue; }
  const response = await fetch(clip.url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw Error(`${clip.name}: HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (!data.includes(Buffer.from('ftyp'))) throw Error('Invalid MP4: ' + clip.name);
  fs.writeFileSync(destination, data);
  console.log('Downloaded:', clip.name, data.byteLength, 'bytes');
}
fs.writeFileSync('tmp/video-originals/heygen-clips.json', JSON.stringify(clips, null, 2));
