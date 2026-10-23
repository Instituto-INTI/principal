import http from 'node:http';
import {readFile} from 'node:fs/promises';
const files={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/engine.js':'engine.js','/content.js':'content.js','/config.js':'config.js','/style.css':'style.css','/assets/inti-hero.jpg':'assets/inti-hero.jpg','/assets/inti-horizon.jpg':'assets/inti-horizon.jpg','/assets/masterclass.png':'assets/masterclass.png'};
for(const name of ['conflict','silence','doubt'])files['/assets/emotional-'+name+'.jpg']='assets/emotional-'+name+'.jpg';
files['/assets/masterclass.jpg']='assets/masterclass.jpg';
const types={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',jpg:'image/jpeg',png:'image/png'};
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{const file=files[new URL(req.url,'http://localhost').pathname];if(!file){res.writeHead(404);res.end('Não encontrado');return;}try{const data=await readFile(new URL(file,import.meta.url));res.writeHead(200,{'Content-Type':types[file.split('.').pop()],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"});res.end(data);}catch{res.writeHead(500);res.end('Erro ao carregar');}}).listen(port,'127.0.0.1',()=>console.log(`INTI disponível em http://127.0.0.1:${port}`));
