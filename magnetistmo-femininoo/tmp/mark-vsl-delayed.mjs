import fs from 'node:fs';
const file='cleopatra/dist/index.html';
let html=fs.readFileSync(file,'utf8');
html=html.replace('<footer class="footer wrap">','<footer class="footer wrap" data-vsl-delayed hidden inert>');
html=html.replace('<aside class="sticky-offer" aria-label=','<aside class="sticky-offer" data-vsl-delayed hidden inert aria-label=');
fs.writeFileSync(file,html);
