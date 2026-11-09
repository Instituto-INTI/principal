import fs from 'node:fs';
const file='cleopatra/dist/index.html';
let html=fs.readFileSync(file,'utf8');
if (!html.includes('href="loops.css"')) html=html.replace('<link rel="stylesheet" href="styles.css">','<link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="loops.css">');
const mapping={'pdf-2-2.jpg':'presenca','pdf-2-1.jpg':'fascinio','pdf-3-1.jpg':'magnetismo','pdf-4-1.jpg':'ativacao','pdf-4-2.jpg':'audios','pdf-5-1.jpg':'cards','pdf-5-2.jpg':'imaginacao'};
html=html.replace(/(<div class="(?:story-photo|kit-image)">(?:<span[^>]*>.*?<\/span>)?)<img src="assets\/([^\"]+)"([^>]*)>/g,(match,before,image,attributes)=>{
  const name=mapping[image];
  if(!name)return match;
  const alt=attributes.match(/alt="([^"]*)"/)?.[1]||'';
  return before+`<video class="section-loop" data-src="assets/loop-${name}.mp4" poster="assets/${image}" muted loop playsinline preload="none" aria-label="${alt}" tabindex="-1"></video>`;
});
fs.writeFileSync(file,html);
console.log('Section video elements:',(html.match(/class="section-loop"/g)||[]).length);
