import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../../../magnetismo-feminino/vsl-gate.js',import.meta.url),'utf8');

class Events {
  handlers=new Map();
  addEventListener(type,handler){if(!this.handlers.has(type))this.handlers.set(type,new Set());this.handlers.get(type).add(handler);}
  removeEventListener(type,handler){this.handlers.get(type)?.delete(handler);}
  emit(type,detail={}){for(const handler of [...(this.handlers.get(type)||[])])handler({type,detail});}
  dispatchEvent(event){this.emit(event.type,event.detail);}
}
function setup(initial={}){
  const player=Object.assign(new Events(),{duration:100,currentTime:0,inSmartAutoPlay:false,played:false},initial);
  const blocks=Array.from({length:4},()=>({hidden:true,inert:true}));
  const offer={closest:()=>blocks[0]};
  const presentation={scrolls:0,scrollIntoView(){this.scrolls++;}};
  const document=new Events();
  document.getElementById=id=>({'vid-6aee4b40cbb56d66d7edc140':player,'vsl-delayed-content':blocks[0],apresentacao:presentation,oferta:offer}[id]);
  document.querySelectorAll=()=>blocks;
  const window={matchMedia:()=>({matches:false})};
  vm.runInNewContext(code,{document,window,CustomEvent:class{constructor(type){this.type=type;}}});
  return {player,blocks,document,presentation};
}

{
  const {player,blocks,document,presentation}=setup();
  assert(blocks.every(b=>b.hidden&&b.inert),'Tudo permanece oculto antes de iniciar');
  player.emit('video:timeupdate',{time:49.999});
  assert(blocks.every(b=>b.hidden),'49,999% não libera');
  let prevented=false;
  const anchor={getAttribute:()=> '#oferta'};
  const click={target:{closest:()=>anchor},preventDefault(){prevented=true;}};
  for(const handler of document.handlers.get('click'))handler(click);
  assert(prevented&&presentation.scrolls===1,'Link da oferta leva à VSL enquanto está bloqueado');
  player.emit('smartautoplay:timeupdate',{time:90});
  assert(blocks.every(b=>b.hidden),'Prévia automática não libera');
  player.inSmartAutoPlay=true;
  player.emit('video:timeupdate',{time:90});
  player.emit('video:ended');
  assert(blocks.every(b=>b.hidden),'Mesmo eventos do player não liberam a prévia');
  player.inSmartAutoPlay=false;
  let notifications=0;document.addEventListener('cleopatra:vsl-unlocked',()=>notifications++);
  player.emit('video:timeupdate',{time:50});
  assert(blocks.every(b=>!b.hidden&&!b.inert),'50% libera seções, rodapé, oferta fixa e botão principal');
  assert.equal(notifications,1,'Notifica a atualização do layout uma vez');
  player.emit('video:timeupdate',{time:1});player.emit('video:ended');
  assert(blocks.every(b=>!b.hidden),'Retroceder mantém tudo visível');assert.equal(notifications,1);
  assert.equal(document.handlers.get('click').size,0,'Navegação normal é restaurada');
}
for(const duration of [0,NaN,Infinity,-10]){
  const {player,blocks}=setup({duration});player.emit('video:timeupdate',{time:500});
  assert(blocks.every(b=>b.hidden),'Duração inválida não libera');
}
{
  const {player,blocks}=setup({duration:0});player.emit('player:ready');
  player.duration=240;player.emit('video:timeupdate',{time:119.9});assert(blocks[0].hidden);
  player.emit('video:timeupdate',{time:120});assert(!blocks[0].hidden,'Usa metade da duração real quando ela fica disponível');
}
{
  const {blocks}=setup({duration:300,currentTime:180,played:true});
  assert(blocks.every(b=>!b.hidden),'Retomada real além da metade libera');
}
{
  const {player,blocks}=setup();player.currentTime=60;player.emit('video:play');
  assert(!blocks[0].hidden,'Retomada após o carregamento também funciona');
}
{
  const {player,blocks}=setup();player.emit('video:ended');assert(!blocks[0].hidden,'Fim da VSL garante liberação');
  assert(setup().blocks.every(b=>b.hidden),'Novo carregamento começa bloqueado novamente');
}
const html=fs.readFileSync(new URL('../../../magnetismo-feminino/index.html',import.meta.url),'utf8');
assert.equal((html.match(/data-vsl-delayed hidden inert/g)||[]).length,4,'Oculta conteúdo, rodapé, oferta fixa e botão principal já no HTML');
assert(/class="button" data-vsl-delayed hidden inert>QUERO ATIVAR MEU MAGNETISMO/.test(html),'O botão principal usa a mesma liberação da VSL');
const wrapper=html.indexOf('id="vsl-delayed-content"');
assert(wrapper>html.indexOf('</vturb-smartplayer>'),'A VSL permanece fora do conteúdo oculto');
assert(wrapper<html.indexOf('id="essencia"')&&wrapper<html.indexOf('id="oferta"'),'As seções de venda ficam no conteúdo oculto');
assert(html.indexOf('src="vsl-gate.js"')<html.indexOf('src="app.js"'),'A integração é instalada antes da aplicação');
console.log('OK: início oculto, limite de 50%, duração dinâmica, SmartAutoPlay, retomada, liberação única, navegação e novo carregamento.');
