import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const names=['presenca','fascinio','magnetismo','ativacao','audios','cards','imaginacao','oferta'];
function boxes(buffer,start=0,end=buffer.length){
  const result=[];
  for(let offset=start;offset+8<=end;){
    let size=buffer.readUInt32BE(offset),header=8;
    if(size===1){size=Number(buffer.readBigUInt64BE(offset+8));header=16;}
    if(size===0)size=end-offset;
    if(size<header||offset+size>end)break;
    result.push({type:buffer.toString('ascii',offset+4,offset+8),offset,size,header});offset+=size;
  }
  return result;
}
let total=0;
for(const name of names){
 const path='cleopatra/dist/assets/loop-'+name+'.mp4',buffer=fs.readFileSync(path),root=boxes(buffer);
 const moov=root.find(b=>b.type==='moov'),mdat=root.find(b=>b.type==='mdat');
 assert(moov&&mdat&&moov.offset<mdat.offset,name+': faststart MP4');
 const children=boxes(buffer,moov.offset+moov.header,moov.offset+moov.size);
 const mvhd=children.find(b=>b.type==='mvhd');
 const version=buffer[mvhd.offset+8];
 const duration=version===0?buffer.readUInt32BE(mvhd.offset+24)/buffer.readUInt32BE(mvhd.offset+20):Number(buffer.readBigUInt64BE(mvhd.offset+32))/buffer.readUInt32BE(mvhd.offset+28);
 assert(Math.abs(duration-(names.indexOf(name)<3?5:6))<.5,name+': duração esperada');
 const handlers=[];
 for(const track of children.filter(b=>b.type==='trak'))for(const media of boxes(buffer,track.offset+track.header,track.offset+track.size).filter(b=>b.type==='mdia'))for(const handler of boxes(buffer,media.offset+media.header,media.offset+media.size).filter(b=>b.type==='hdlr'))handlers.push(buffer.toString('ascii',handler.offset+16,handler.offset+20));
 assert(handlers.includes('vide')&&!handlers.includes('soun'),name+': vídeo sem faixa de áudio');
 const decoded=spawnSync('.tools/node_modules/ffmpeg-static/ffmpeg.exe',['-hide_banner','-loglevel','error','-i',path,'-f','null','-'],{encoding:'utf8'});
 assert.equal(decoded.status,0,name+': decodificação completa: '+decoded.stderr);
 const response=await fetch('http://127.0.0.1:4173/assets/loop-'+name+'.mp4',{headers:{Range:'bytes=0-1023'}});
 assert.equal(response.status,206);assert.equal(response.headers.get('content-type'),'video/mp4');
 assert.equal((await response.arrayBuffer()).byteLength,1024);
 total+=buffer.length;console.log('OK:',name,duration.toFixed(2)+'s',Math.round(buffer.length/1024)+'KB');
}
const html=fs.readFileSync('cleopatra/dist/index.html','utf8');
assert.equal((html.match(/class="section-loop(?: [^"]*)?"/g)||[]).length,8);
assert.equal((html.match(/preload="none"/g)||[]).length,8);
assert(html.includes('assets/cleo.mp4'),'Vídeo principal preservado');
console.log('OK: 8 loops H.264 decodificados, sem áudio, MP4 com início rápido, HTTP parcial e capas; total '+(total/1048576).toFixed(2)+'MB.');
