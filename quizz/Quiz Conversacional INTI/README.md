# Quiz Conversacional INTI

Experiência educativa: comportamento → interpretação → reação → custo emocional → espelho → direção → uma habilidade prioritária → masterclass A Coragem de se Escolher.

## Rodar localmente

Requer Node.js 20+. Na pasta `quizz`, execute `npm start` e abra http://127.0.0.1:4173. Sem dependências externas. Testes: `npm test` (203 testes, incluindo 192 combinações).

## Publicação

Arquivos estáticos com caminhos relativos: esta pasta pode ser servida diretamente em `/quizz/` por qualquer hospedagem estática, inclusive GitHub Pages. O servidor Node é apenas para prévia local.

Configure o link real da masterclass em `config.js` (`masterclassUrl`). Enquanto vazio, a inscrição permanece desabilitada.

## Conteúdo e privacidade

Conteúdo em `content.js`; regras em `engine.js`; interface em `app.js` e `style.css`. Sem API, analytics ou armazenamento persistente. As respostas permanecem na memória desta página. Encerrar ou recarregar apaga a sessão. O quiz não atribui diagnóstico ou pontuação clínica.

Autovalidação é uma habilidade prática, não um novo núcleo da metodologia INTI. As fotografias ilustrativas foram geradas por IA; a arte da masterclass foi fornecida pelo Instituto INTI.
