import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Menu, X, Film, Headphones, Pause, Play } from 'lucide-react';
import * as copy from './content';
import { siteConfig, getSalesState, type MediaConfig } from './config';
import { Symbol, WingedSun } from './Symbol';
import { useExperienceEffects } from './useExperienceEffects';
import { SevenLayersInfographic } from './SevenLayersInfographic';

function Text({ paragraphs }: { paragraphs: readonly string[] }) { return <>{paragraphs.map(p => <p key={p}>{p}</p>)}</>; }
function Eyebrow({ children }: { children: ReactNode }) { return <div className="eyebrow"><span />{children}</div>; }
function SectionHeading({ number, label, children }: { number: string; label: string; children: ReactNode }) { return <><Eyebrow>{number} / {label}</Eyebrow>{children}</>; }
function CTA({ children, purchase = false }: { children: ReactNode; purchase?: boolean }) {
  const sales = getSalesState(siteConfig);
  if (purchase && !sales.ready && !sales.waitlist) return <div className="purchase-action"><button className="cta" disabled>{children}<ArrowUpRight size={19} aria-hidden="true" /></button><p className="purchase-note">Pré-lançamento · Inscrições ainda não disponíveis.</p></div>;
  return <a className="cta" href={purchase ? sales.checkout || sales.waitlist! : '#oferta'}>{purchase && !sales.ready ? 'ENTRAR NA LISTA DE ESPERA' : children}<ArrowUpRight size={19} aria-hidden="true" /></a>;
}
function Media({ media, title, demonstration = false }: { media: MediaConfig; title: string; demonstration?: boolean }) {
  const [failed, setFailed] = useState(false);
  const player = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = player.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) element.pause(); });
    const pauseWhenHidden = () => { if (document.hidden) element.pause(); };
    observer.observe(element);
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', pauseWhenHidden); element.pause(); };
  }, [media.src, failed]);
  return <div className={`media-frame ${demonstration ? 'demo-frame' : ''}`}>
    {media.src && !failed ? <video ref={player} controls playsInline preload="none" poster={media.poster} aria-label={title} onError={() => setFailed(true)}>
      <source src={media.src} onError={() => setFailed(true)} />{media.captions && <track src={media.captions} kind="captions" srcLang="pt-BR" label="Português" default />}Seu navegador não suporta vídeo.
    </video> : <div className="media-pending">
      <img src={media.poster} alt={demonstration ? 'Cleópatra no trono, imagem de referência da experiência' : 'Representação artística virtual de Cleópatra'} width="1122" height="1402" loading="lazy" />
      <div className="media-status"><Film size={22} aria-hidden="true" /><span>{failed ? 'Vídeo temporariamente indisponível' : demonstration ? 'Prévia em breve' : 'Vídeo de convite em breve'}</span><small>{demonstration ? 'A demonstração real ainda não foi disponibilizada.' : 'Leia o convite de Cleópatra abaixo.'}</small></div>
    </div>}
  </div>;
}

function HeroVisual() {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const manualPause = useRef(false);
  const media = siteConfig.videos.hero;
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const syncMotion = () => {
      if (preference.matches || document.hidden || !visible || manualPause.current) element.pause();
      else { element.muted = true; void element.play().catch(() => setPlaying(false)); }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncMotion(); }, { threshold: 0.05 });
    observer.observe(element);
    syncMotion();
    preference.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    return () => { observer.disconnect(); preference.removeEventListener('change', syncMotion); document.removeEventListener('visibilitychange', syncMotion); element.pause(); };
  }, [media.src, failed]);
  return <>
    <div className="hero-image">{media.src && !failed ? <video id="hero-video" ref={video} autoPlay muted loop playsInline preload="metadata" poster={media.poster} aria-label="Cleópatra, representação artística virtual em vídeo" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)}><source src={media.src} type="video/mp4" onError={() => setFailed(true)} /></video> : <picture><source media="(max-width: 640px)" srcSet={siteConfig.images.heroMobile} /><img src={siteConfig.images.hero} alt="Cleópatra, representação artística virtual, com joias de ouro e esmeraldas em um palácio egípcio" width="1122" height="1402" fetchPriority="high" /></picture>}</div>
    {media.src && !failed && <button className="hero-video-control" aria-controls="hero-video" aria-label={playing ? 'Pausar vídeo de abertura' : 'Reproduzir vídeo de abertura'} onClick={() => {
      const element = video.current;
      if (!element) return;
      manualPause.current = !element.paused;
      if (element.paused) void element.play().catch(() => setPlaying(false));
      else element.pause();
    }}>{playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}<span>{playing ? 'PAUSAR' : 'REPRODUZIR'}</span></button>}
  </>;
}

function Testimonials() {
  const items = siteConfig.testimonials.filter(t => t.authorized && t.product === 'codigo-do-magnetismo' && (t.format === 'text' ? t.text?.trim() : t.src));
  if (!items.length) return null;
  return <section className="section testimonials" id="experiencias" data-section="09"><div className="container"><SectionHeading number="09" label="Experiências"><h2>O QUE DIZEM AS MULHERES QUE JÁ EXPERIMENTARAM NOSSA ABORDAGEM?</h2></SectionHeading><div className="testimonials-list">{items.map((item, i) => <figure key={i}>{item.format === 'text' ? <blockquote>{item.text}</blockquote> : item.format === 'audio' ? <audio controls preload="none" src={item.src} aria-label={`Relato de ${item.name}`} /> : <video controls playsInline preload="none" src={item.src} aria-label={`Relato de ${item.name}`}>{item.captions && <track kind="captions" src={item.captions} srcLang="pt-BR" label="Português" />}</video>}<figcaption>{item.name}</figcaption></figure>)}</div><p className="small">As experiências variam de pessoa para pessoa e não constituem garantia de resultados específicos.</p></div></section>;
}

export default function App() {
  useExperienceEffects();
  const [menuOpen, setMenuOpen] = useState(false);
  const sales = getSalesState(siteConfig);
  const visibleFaq = copy.faq.filter(item => 'answer' in item || siteConfig[item.key].trim());
  useEffect(() => {
    if (!menuOpen) return;
    const closeMenu = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', closeMenu);
    return () => window.removeEventListener('keydown', closeMenu);
  }, [menuOpen]);

  return <>
    <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
    <header className="header">
      <a className="brand" href="#inicio" aria-label="Código do Magnetismo — início"><WingedSun /><span>CÓDIGO DO<span>MAGNETISMO</span></span></a>
      <button className="menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      <nav id="navigation" className={menuOpen ? 'navigation open' : 'navigation'} aria-label="Navegação principal" onClick={() => setMenuOpen(false)}>
        <a href="#metodo">O método</a><a href="#jornada">As 7 camadas</a><a href="#convite">O convite</a><a href="#oferta" className="nav-cta">ENTRAR NA EXPERIÊNCIA <ArrowUpRight size={15} aria-hidden="true" /></a>
      </nav>
    </header>

    <main id="conteudo">
      <section className="hero" id="inicio" data-section="01" aria-labelledby="hero-title">
        <HeroVisual />
        <div className="hero-content container">
          <Eyebrow>AS 7 CAMADAS DO MAGNETISMO DE CLEÓPATRA</Eyebrow>
          <h1 id="hero-title">JÁ TENTOU ATIVAR O ARQUÉTIPO DE CLEÓPATRA COM AFIRMAÇÕES, SONS E IMAGENS NO CELULAR, MAS <em>NÃO SENTIU O MAGNETISMO QUE ESPERAVA?</em></h1>
          <div className="hero-description"><Text paragraphs={copy.hero.paragraphs} /></div>
          <p className="signature">{copy.signature}</p>
          <CTA>QUERO VIVER O PODER DE CLEÓPATRA</CTA>
          <p className="hero-meta">7 dias de ativação <span>•</span> 7 camadas do magnetismo <span>•</span> Experiências imersivas guiadas</p>
        </div>
        <a href="#magnetismo" className="scroll-cue" aria-label="Explorar a experiência"><span>UM CONVITE AO SEU PODER</span><ArrowDown size={16} /></a>
        <span className="hero-caption">CLEÓPATRA · REPRESENTAÇÃO ARTÍSTICA VIRTUAL</span>
      </section>

      <div className="essence-strip" aria-hidden="true"><span>A SEDUTORA</span><i>✦</i><span>A ESTRATEGISTA</span><i>✦</i><span>A RAINHA</span></div>

      <section className="section desire" id="magnetismo" data-section="02">
        <div className="container">
          <div className="desire-heading reveal"><SectionHeading number="02" label="O desejo"><h2>NÃO É SOBRE SER MAIS BONITA.<br /><em>É SOBRE SER MAIS MAGNÉTICA.</em></h2></SectionHeading></div>
          <div className="contrasts">{copy.desire.contrasts.map(([a, b], i) => <div className="contrast reveal" key={a}><span className="index">0{i + 1}</span><p>{a}<br /><em>{b}</em></p><ArrowUpRight aria-hidden="true" /></div>)}</div>
          <div className="desire-bottom reveal"><div className="prose"><Text paragraphs={copy.desire.paragraphs} /></div><p className="statement">{copy.desire.closing}</p></div>
          <p className="essence-line">{copy.desire.essence}</p>
        </div>
      </section>

      <section className="section problem" id="conexao" data-section="03">
        <div className="container">
          <div className="problem-grid"><div className="symbolic-scene reveal" aria-hidden="true"><div className="phone"><div className="phone-camera" /><img src={siteConfig.images.heroMobile} alt="" width="480" height="600" loading="lazy" /><span>CLEÓPATRA</span></div><div className="scene-orbit" /><span className="scene-word">OBSERVAR</span><ArrowRight className="scene-arrow" /><Symbol kind={1} className="scene-mirror" /><span className="scene-word second">VIVENCIAR</span></div>
            <div className="reveal"><SectionHeading number="03" label="Além da imagem"><h2>{copy.problem.title}</h2></SectionHeading><p className="subheading">{copy.problem.subtitle}</p><div className="prose"><Text paragraphs={copy.problem.before} /></div></div>
          </div>
          <div className="analogy reveal"><span className="ornament">✦</span><div><Text paragraphs={copy.problem.analogy} /></div></div>
          <blockquote className="grand-quote reveal">O símbolo é o mesmo.<br /><em>A conexão é que muda.</em></blockquote>
          <div className="problem-after prose reveal"><Text paragraphs={copy.problem.after} /></div>
          <p className="statement centered">{copy.problem.closing}</p>
        </div>
      </section>

      <section className="section method" id="metodo" data-section="04">
        <div className="container"><div className="centered section-intro reveal"><SectionHeading number="04" label="O método"><h2>CONHEÇA A ATIVAÇÃO ARQUETÍPICA <em>IMERSIVA DE CLEÓPATRA.</em></h2></SectionHeading><p className="subheading">{copy.method.subtitle}</p><p>{copy.method.intro}</p><p className="small">{copy.method.lead}</p></div>
          <div className="method-steps">{copy.method.elements.map((item, i) => <article className="method-step reveal" key={item.name}><div className={`method-art method-art-${i} method-art--image`}><img src={siteConfig.images.method[i]} alt={['Olho de Hórus dourado', 'Ísis alada com luz dourada', 'Mãos conduzindo luz dourada'][i]} width="900" height="900" loading="lazy" decoding="async" /><span>0{i + 1}</span></div><h3>{item.name}</h3><p>{item.text}</p></article>)}</div>
          <div className="method-connector" aria-label="Progressão dos pilares"><span>CONECTAR</span><ArrowRight aria-hidden="true" /><span>VIVENCIAR</span><ArrowRight aria-hidden="true" /><span>EXPRESSAR</span></div>
          <div className="method-closing centered reveal"><p>{copy.method.closing[0]}</p><p className="statement">{copy.method.closing[1]}</p></div>
        </div>
      </section>

      <section className="section journey" id="jornada" data-section="05">
        <div className="container"><div className="section-intro centered reveal"><SectionHeading number="05" label="A jornada"><h2 id="journey-title"><em>7 CAMADAS</em> DO MAGNETISMO.<br />7 DIAS DE VIVÊNCIAS IMERSIVAS.<br />UMA EXPERIÊNCIA DE TRANSFORMAÇÃO.</h2></SectionHeading><p className="subheading" id="journey-subtitle">{copy.journey.subtitle}</p><div className="prose"><Text paragraphs={copy.journey.intro} /></div></div>
          <SevenLayersInfographic />
          <div className="centered journey-navigation"><p>A jornada é organizada em três níveis:</p><div className="journey-route"><a href="#nivel-i">ATIVAR</a><ArrowRight size={16} aria-hidden="true" /><a href="#nivel-ii">DIRECIONAR</a><ArrowRight size={16} aria-hidden="true" /><a href="#nivel-iii">IRRADIAR</a></div></div>
          {copy.journey.levels.map(level => <div className="level" id={`nivel-${level.roman.toLowerCase()}`} key={level.roman}>
            <div className="level-heading reveal"><span className="level-roman">{level.roman}</span><div><p className="eyebrow">NÍVEL {level.roman}</p><h3>{level.name}</h3><p>{level.description}</p></div><div className="level-line" /></div>
            <div className={`portals portals-${level.days.length}`}>{level.days.map(day => <article id={`dia-${day.day}`} className={`portal portal-${day.day} reveal`} key={day.day}>
              <div className={`portal-art${siteConfig.images.activations[day.day - 1] ? ' portal-art--image' : ''}`}>{siteConfig.images.activations[day.day - 1] ? <img src={siteConfig.images.activations[day.day - 1]} alt={day.name} width="900" height={day.day === 1 ? 600 : day.day === 6 || day.day === 7 ? 900 : 1125} loading="lazy" decoding="async" /> : <Symbol kind={day.day} />}<span className="portal-day">DIA {String(day.day).padStart(2, '0')}</span></div>
              <h4>{day.name}</h4><p className="benefit">{day.benefit}</p><div className="portal-description"><Text paragraphs={day.text} /></div>
            </article>)}</div>
          </div>)}
          <div className="journey-closing centered reveal"><WingedSun /><p className="statement">{copy.journey.closing}</p><CTA>QUERO ATIVAR AS 7 CAMADAS DO MAGNETISMO</CTA></div>
        </div>
      </section>

      <section className="section invitation" id="convite" data-section="06"><div className="container">
        <div className="centered reveal"><SectionHeading number="06" label="O convite"><h2>UM CONVITE <em>DE CLEÓPATRA</em></h2></SectionHeading></div>
        <div className={`invitation-grid reveal${siteConfig.videos.invitation.src ? ' has-video' : ''}`}><div><Media media={siteConfig.videos.invitation} title={copy.invitation.title} /><p className="media-caption">Personagem virtual · Apresentação simbólica e ficcional</p></div><div className="invitation-script">{siteConfig.videos.invitation.src ? <><p className="invitation-support">{copy.invitation.script[3]}</p><details className="invitation-transcript"><summary>Ler o convite <ChevronDown size={18} aria-hidden="true" /></summary><blockquote><Text paragraphs={copy.invitation.script} /></blockquote></details></> : <><span className="quote-mark" aria-hidden="true">“</span><blockquote><Text paragraphs={copy.invitation.script} /></blockquote></>}<CTA>ACEITAR O CONVITE DE CLEÓPATRA</CTA></div></div>
      </div></section>

      <section className="section demonstration" id="experiencia" data-section="07"><div className="container">
        <div className="demo-heading reveal"><SectionHeading number="07" label="A experiência"><h2>NÃO É MAIS UMA ATIVAÇÃO PARA SIMPLESMENTE OUVIR.<br /><em>É UMA EXPERIÊNCIA PARA VIVER.</em></h2></SectionHeading></div>
        <div className="demo-grid"><div className="demo-player reveal"><p className="media-label">{copy.demonstration.preview}</p><Media media={siteConfig.videos.demonstration} title="Demonstração real de uma ativação imersiva" demonstration /><span className="media-caption"><Headphones size={14} aria-hidden="true" /> Uma prévia da jornada imersiva</span></div><div className="prose reveal"><Text paragraphs={copy.demonstration.paragraphs} /><p className="statement">{copy.demonstration.signature}</p></div></div>
        <div className="centered"><CTA>QUERO VIVER ESSA EXPERIÊNCIA</CTA></div>
      </div></section>

      <section className="section audience" id="para-quem" data-section="08"><div className="container audience-grid"><div className="reveal"><SectionHeading number="08" label="Seu lugar nesta jornada"><h2>PARA QUEM É O <em>CÓDIGO DO MAGNETISMO?</em></h2></SectionHeading><p>{copy.audience.intro}</p><div className="audience-emblem" aria-hidden="true"><WingedSun /><span>RECONHEÇA<br />SEU PODER.</span></div></div><div className="reveal"><ul className="audience-list">{copy.audience.items.map(item => <li key={item}><Check size={17} aria-hidden="true" /><p>{item}</p></li>)}</ul><div className="audience-note"><p className="statement">{copy.audience.closing}</p><p>{copy.audience.preparation}</p></div></div></div></section>

      <Testimonials />

      <section className="section offer" id="oferta" data-section="10"><div className="container">
        <div className="centered reveal"><SectionHeading number="10" label="Entre na experiência"><h2>CÓDIGO DO <em>MAGNETISMO</em></h2></SectionHeading><p className="subheading">{copy.offer.subtitle}</p><p>{copy.offer.description}</p></div>
        <div className="offer-grid"><div className="offer-visual reveal"><div className="digital-display digital-display--cover" role="img" aria-label="Capa do produto digital Código do Magnetismo"><img src={siteConfig.images.productCover} alt="" width="1000" height="1778" loading="lazy" decoding="async" /></div><p className="media-caption">Representação visual do produto digital</p><div className="offer-mini-symbols" aria-hidden="true">{[1,2,3,4,5,6,7].map(n => <Symbol key={n} kind={n} />)}</div></div>
          <div className="offer-content reveal"><h3 className="eyebrow">AO ENTRAR, VOCÊ RECEBE:</h3><ul className="offer-list">{copy.offer.items.map(item => <li key={item.title}><Check size={18} aria-hidden="true" /><div><h4>{item.title}</h4>{item.extra && <p className="offer-extra">{item.extra}</p>}<p>{item.text}</p></div></li>)}<li><Check size={18} aria-hidden="true" /><div><h4>ACESSO ONLINE</h4>{siteConfig.platform && <p>{siteConfig.platform}</p>}{siteConfig.accessPeriod && <p>{siteConfig.accessPeriod}</p>}</div></li></ul>
            <div className="how-to"><h4>COMO COMEÇAR</h4><Text paragraphs={copy.offer.start} /></div>
            <div className="purchase-box"><p className="eyebrow">{sales.ready ? 'SEU INVESTIMENTO' : 'PRÉ-LANÇAMENTO'}</p>{sales.ready ? <><p className="price">{siteConfig.price}</p><p>{siteConfig.paymentTerms}</p><p>{siteConfig.guarantee}</p>{siteConfig.purchaseSecurity && <p>{siteConfig.purchaseSecurity}</p>}</> : <p className="availability">As condições de inscrição serão disponibilizadas em breve.</p>}<CTA purchase>QUERO VIVER O PODER DE CLEÓPATRA</CTA>{!sales.ready && sales.waitlist && <p className="purchase-note">Pré-lançamento · Inscreva-se na lista de espera.</p>}</div>
          </div>
        </div>
      </div></section>

      <section className="section faq" id="duvidas" data-section="11"><div className="container faq-grid"><div className="reveal"><SectionHeading number="11" label="Antes de começar"><h2>PERGUNTAS<br /><em>FREQUENTES</em></h2></SectionHeading><WingedSun className="faq-emblem" /></div><div className="faq-items reveal">{visibleFaq.map((item, i) => <details key={item.question}><summary><span className="faq-number">{String(i + 1).padStart(2, '0')}</span><span>{item.question}</span><ChevronDown size={18} aria-hidden="true" /></summary><div className="faq-answer"><p>{'answer' in item ? item.answer : siteConfig[item.key]}</p></div></details>)}</div></div></section>

      <section className="finale" id="seu-convite" data-section="12"><div className="finale-image"><img src={siteConfig.images.finalThrone || siteConfig.images.throne} alt="Cleópatra virtual sentada em um trono dourado, representando soberania" width="1122" height="1402" loading="lazy" /></div><div className="container finale-content reveal"><Eyebrow>SEU PRÓXIMO CAPÍTULO</Eyebrow><h2>NÃO SE CONTENTE EM CHAMAR ATENÇÃO.<br /><em>DESPERTE FASCÍNIO.</em></h2><div className="prose"><Text paragraphs={copy.finale.paragraphs} /></div><p className="signature">{copy.signature}</p><div className="finale-brand">CÓDIGO DO MAGNETISMO<span>As 7 Camadas do Magnetismo de Cleópatra.</span></div><CTA purchase>QUERO ATIVAR O PODER DE CLEÓPATRA</CTA></div></section>
    </main>

    <footer className="footer container"><a className="brand" href="#inicio"><WingedSun /><span>CÓDIGO DO<span>MAGNETISMO</span></span></a><p>Uma jornada simbólica inspirada em Cleópatra.<br />Personagem virtual criada com inteligência artificial.</p><a className="footer-top" href="#inicio">VOLTAR AO TOPO <ArrowUpRight size={16} /></a></footer>
  </>;
}
