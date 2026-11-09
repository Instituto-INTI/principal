import fs from 'node:fs';
const file = 'cleopatra/dist/index.html';
let html = fs.readFileSync(file, 'utf8');
html = html.replace('content="#f6f2ea"', 'content="#0f0e0c"');
html = html.replace(/  <link rel="preconnect"[^\n]+\n/g, '');
html = html.replace(/  <link href="https:\/\/fonts.googleapis.com[^\n]+\n/, '  <link rel="preload" href="assets/fonts/outfit-variable.ttf" as="font" type="font/ttf" crossorigin>\n  <link rel="preload" href="assets/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin>\n');
html = html.replaceAll('<span class="brand-icon" aria-hidden="true">✳</span>', '<span class="brand-icon" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><path d="M18 3 32 11v14L18 33 4 25V11Z" stroke="currentColor"/><path d="m18 8 5 10-5 10-5-10 5-10Zm-9 5 9 5 9-5M9 23l9-5 9 5" stroke="currentColor"/></svg></span>');
const heroStart = html.indexOf('    <section class="hero wrap"');
const heroEnd = html.indexOf('    <div class="marquee"', heroStart);
html = html.slice(0, heroStart) + `    <section class="hero wrap" aria-labelledby="hero-title">
      <div class="hero-visual" aria-hidden="true"><div class="hero-image"><img src="assets/pdf-2-1.jpg" alt="" width="1024" height="1536" fetchpriority="high"></div></div>
      <div class="hero-copy">
        <p class="eyebrow intro-anim"><span class="status-dot"></span> PROTOCOLO DO MAGNETISMO FEMININO</p>
        <h1 id="hero-title" class="intro-anim">De opção<br>à <em>prioridade.</em></h1>
        <p class="hero-lead intro-anim">Uma presença que marca.<br>Uma mulher que se escolhe.</p>
        <p class="hero-description intro-anim">Desperte a sua confiança e descubra um caminho para se sentir valorizada e desejada, sem correr atrás de ninguém. A sua nova presença começa em você.</p>
        <div class="hero-actions intro-anim"><a href="#oferta" class="button">Quero despertar meu magnetismo <span aria-hidden="true">↗</span></a><a href="#apresentacao" class="hero-secondary"><span aria-hidden="true">▷</span> Conhecer o protocolo</a></div>
        <div class="hero-assurance intro-anim"><span><i aria-hidden="true">✓</i> 7 dias de garantia</span><span><i aria-hidden="true">✓</i> 1 ano de acesso</span><span><i aria-hidden="true">✓</i> Experiência digital</span></div>
      </div>
      <div class="hero-image-note"><span class="note-line"></span><span>INSPIRADO EM CLEÓPATRA<small>O poder de uma presença inesquecível.</small></span></div>
      <a href="#apresentacao" class="scroll-note"><span aria-hidden="true">↓</span> O SEU PRÓXIMO CAPÍTULO COMEÇA AQUI</a>
    </section>
    <section class="video-section wrap" id="apresentacao" aria-labelledby="video-section-title">
      <button class="video-cover reveal" data-presentation aria-label="Conhecer a apresentação do protocolo">
        <img src="assets/pdf-3-1.jpg" alt="Representação artística de Cleópatra em luz dourada" width="1024" height="1536" loading="lazy">
        <span class="video-cover-copy"><span class="eyebrow">UM CONVITE PARA VOLTAR A SI</span><span class="video-cover-title" id="video-section-title">O magnetismo<br>começa em você.</span><span class="video-cover-caption">Conheça a experiência Cleópatra</span></span>
        <span class="video-play"><span aria-hidden="true">▶</span><small>EXPLORAR O PROTOCOLO</small></span>
        <span class="video-corner" aria-hidden="true">CLEÓPATRA / A EXPERIÊNCIA</span>
      </button>
    </section>
` + html.slice(heroEnd);
html = html.replace('<p class="eyebrow">01 / A SUA ESSÊNCIA</p>', '<p class="eyebrow">01 — PRESENÇA É PODER</p>');
html = html.replace('Não é sobre ser mais bonita.<br>É sobre ser mais <em>magnética.</em>', 'Beleza chama atenção.<br><em>Magnetismo deixa uma marca.</em>');
html = html.replace('Um ritual de reencontro.<br>Um kit <em>completo.</em>', 'O seu magnetismo.<br><em>Uma experiência completa.</em>');
html = html.replace('Permita-se<br>ocupar o seu<br><em>próprio lugar.</em>', 'Escolha ser<br>a sua própria<br><em>prioridade.</em>');
html = html.replace('Transformação<br>começa com<br><em>acolhimento.</em>', 'Por trás do método,<br><em>um olhar para você.</em>');
html = html.replace('Com clareza.<br><em>Com confiança.</em>', 'Antes de começar,<br><em>tire suas dúvidas.</em>');
html = html.replace('Agora, é a sua vez<br>de <em>se escolher.</em>', 'A sua próxima versão<br>começa com <em>uma escolha.</em>');
html = html.replace(/<span class="final-star"[^>]*>.*?<\/span>/, '<span class="final-star" aria-hidden="true">C.</span>');
fs.writeFileSync(file, html);
console.log('Nova composição HTML aplicada.');
