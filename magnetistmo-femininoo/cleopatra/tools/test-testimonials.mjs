import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../../../magnetismo-feminino/testimonials.js',import.meta.url),'utf8');
class Element {
  listeners=new Map();children=[];style={};attributes={};index=0;
  classList={toggle(){}};
  addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push(fn);}
  emit(type,event={}){for(const fn of this.listeners.get(type)||[])fn(event);}
  setAttribute(name,value){this.attributes[name]=value;}
  append(card){card.index=this.children.length;this.children.push(card);}
  cloneNode(){return new Element();}
  getBoundingClientRect(){return {left:this.offsetLeft};}
  contains(){return false;}
}
function setup(reduced=false){
  let step=0,time=0,sequence=0;
  const pending=new Map(),observers=[];
  Object.defineProperty(Element.prototype,'offsetLeft',{configurable:true,get(){return this.index*step;}});
  const carousel=new Element(),track=new Element(),pause=new Element(),prev=new Element(),next=new Element();
  for(let i=0;i<3;i++)track.append(new Element());
  const dots=Array.from({length:3},()=>new Element());
  const preference={matches:reduced,addEventListener(type,fn){this.change=fn;}};
  const document=new Element();document.hidden=false;
  document.querySelector=selector=>({'.testimonial-carousel':carousel,'.testimonial-track':track,'[data-pause]':pause,'[data-prev]':prev,'[data-next]':next}[selector]);
  document.querySelectorAll=()=>dots;
  class Observer{constructor(fn){this.callback=fn;observers.push(this);}observe(){}}
  const window=new Element();window.matchMedia=()=>preference;window.IntersectionObserver=Observer;
  window.requestAnimationFrame=fn=>{const id=++sequence;pending.set(id,fn);return id;};
  window.cancelAnimationFrame=id=>pending.delete(id);
  vm.runInNewContext(source,{document,window,IntersectionObserver:Observer});
  return {carousel,track,pause,prev,next,dots,document,preference,pending,
    width(value){step=value;window.emit('resize');},
    visible(value){observers[0].callback([{isIntersecting:value}]);},
    tick(delta=16){time+=delta;const frames=[...pending.values()];pending.clear();frames.forEach(fn=>fn(time));},
    offset(){return -Number(track.style.transform.match(/translate3d\(([-\d.e+]+)px/)[1]);}};
}
const s=setup();
assert.equal(s.track.children.length,6,'Duplica a sequência uma vez');
assert(s.track.children.slice(3).every(card=>card.inert&&card.attributes['aria-hidden']==='true'));
assert.equal(s.pending.size,0,'Conteúdo oculto não inicia animação');
s.width(120);assert.equal(s.pending.size,0);
s.visible(true);assert.equal(s.pending.size,1);
let previous=0,wraps=0;
for(let i=0;i<2200;i++){
 s.tick();const offset=s.offset();
 assert(offset>=0&&offset<360,'Movimento permanece dentro de um ciclo');
 if(offset<previous)wraps++;
 if(i>0){const advance=(offset-previous+360)%360;assert(Math.abs(advance-.352)<.00001,'Velocidade constante para a esquerda, inclusive no reinício');}
 previous=offset;
}
assert(wraps>=2,'Passa pelo fim da sequência repetidamente');
s.carousel.emit('mouseenter');const stopped=s.offset();s.tick(2000);assert.equal(s.offset(),stopped);
s.carousel.emit('mouseleave');s.tick();s.tick();assert(s.offset()!==stopped,'Retoma de onde parou');
s.document.hidden=true;s.document.emit('visibilitychange');const hidden=s.offset();s.tick(20000);assert.equal(s.offset(),hidden);
s.document.hidden=false;s.document.emit('visibilitychange');s.tick();assert.equal(s.offset(),hidden,'Retomar a aba não causa salto');
const phase=s.offset()/360;s.width(180.5);assert(Math.abs(s.offset()/541.5-phase)<.00001,'Redimensionar preserva o ponto do ciclo, incluindo larguras fracionárias');
s.visible(false);assert.equal(s.pending.size,0);s.visible(true);assert.equal(s.pending.size,1);
s.pause.emit('click');assert.equal(s.pending.size,0);s.next.emit('click');assert(s.offset()>=0,'Controle manual continua disponível em pausa');
s.pause.emit('click');assert.equal(s.pending.size,1);
s.carousel.emit('touchstart',{changedTouches:[{clientX:200}]});assert.equal(s.pending.size,0);
s.carousel.emit('touchend',{changedTouches:[{clientX:100}]});assert.equal(s.pending.size,1);
const r=setup(true);r.width(320);r.visible(true);assert.equal(r.pending.size,0,'Movimento reduzido não inicia o automático');
r.next.emit('click');assert.equal(r.offset(),320,'Movimento reduzido mantém navegação manual');
const beforePinch=r.offset();
r.carousel.emit('touchstart',{touches:[{clientX:200},{clientX:300}],changedTouches:[{clientX:200}]});
r.carousel.emit('touchend',{touches:[{clientX:100}],changedTouches:[{clientX:0}]});
r.carousel.emit('touchend',{touches:[],changedTouches:[{clientX:0}]});
assert.equal(r.offset(),beforePinch,'Pinça para ampliar a imagem não avança o carrossel');
console.log('OK: deslocamento contínuo à esquerda, múltiplos ciclos sem salto, pausa, visibilidade, redimensionamento, controles e movimento reduzido.');
