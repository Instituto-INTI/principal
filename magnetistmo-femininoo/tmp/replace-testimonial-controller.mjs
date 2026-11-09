import fs from 'node:fs';
const appFile='cleopatra/dist/app.js';
const app=fs.readFileSync(appFile,'utf8');
const start=app.indexOf("  const carousel = document.querySelector('.testimonial-carousel');");
if(start<0)throw Error('Existing carousel controller not found');
fs.writeFileSync(appFile,app.slice(0,start)+'})();\n');
