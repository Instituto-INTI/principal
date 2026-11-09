# Cleópatra — Protocolo do Magnetismo Feminino

Página responsiva em HTML, CSS e JavaScript, sem dependências de execução ou etapa de build. Segunda direção visual: fundo escuro, dourado, abertura em tela cheia, seção de apresentação, benefícios em três composições e kit em blocos claros.

## Visualizar

Execute `npm run dev` nesta pasta e abra http://127.0.0.1:4173.

## Ativar a comercialização

A VSL já está integrada na seção `#apresentacao` com o player VTurb `vid-6aee4b40cbb56d66d7edc140` e o script fornecido. O player aparece diretamente na página, centralizado, com largura máxima de 400 px e proporção vertical reservada pelo embed. A configuração `videoUrl` abaixo pertence ao antigo modal de apresentação e não controla essa VSL; para trocar a VSL, substitua o embed em `../../magnetismo-feminino/index.html`.

As seções abaixo da VSL, o rodapé, a oferta fixa e o botão “Quero despertar meu magnetismo” começam ocultos e fora da navegação por teclado. `../../magnetismo-feminino/vsl-gate.js` usa os [eventos oficiais da VTurb V4](https://docs.vturb.com/en/docs/reference/player/api/events) e a [duração real do vídeo](https://docs.vturb.com/en/docs/reference/player/api/properties) para liberá-los quando a reprodução atingir 50%. A prévia muda SmartAutoPlay não conta. A liberação ocorre uma vez por carregamento da página, permanece após retroceder o vídeo e não usa cronômetro ou armazenamento local. Enquanto o conteúdo estiver oculto, os links da abertura para as seções direcionam à VSL. A reprodução da VTurb precisa estar disponível para liberar o conteúdo.

No mobile (até 600 px), a VSL aparece imediatamente após o parágrafo que termina em “A sua nova presença começa em você.”, antes do botão principal. A ordem é definida por CSS Grid em `../../magnetismo-feminino/mobile.css`, usando o mesmo player, sem duplicá-lo ou removê-lo do DOM durante a reprodução. No desktop, a VSL mantém a posição anterior, abaixo da abertura.

Edite `../../magnetismo-feminino/config.js`:

- `videoUrl`: URL HTTPS de vídeo MP4/WebM, YouTube ou Vimeo.
- `checkoutUrl`: reservado para uma futura abertura de vendas. O fluxo atual sempre abre o formulário da Lista de Prioridade.
- `offerEndsAt`: data real em formato ISO com fuso (por exemplo, `2026-12-15T23:59:59-03:00`). Sem data, o contador permanece oculto. Ele não reinicia por visitante e, quando expira, encerra a oferta na página.

O botão “Quero ativar meu magnetismo” abre o formulário “GARANTA SUA VAGA”, com nome, WhatsApp e e-mail obrigatórios. Após a gravação confirmada pelo servidor, o popup mostra a mensagem de sucesso da Lista de Prioridade. Erros preservam o formulário preenchido e não exibem uma confirmação falsa. O prazo de oferta, se configurado, não impede o cadastro na lista.

Os cadastros são recebidos por `POST /api/priority-list` e gravados em `data/priority-list.jsonl` (uma linha JSON por cadastro), fora da pasta pública `../../magnetismo-feminino` e ignorados pelo Git. Cada registro contém identificador, data, nome, WhatsApp, e-mail e o texto da autorização apresentada no formulário. Nenhum dado é enviado a serviços externos; o envio futuro de avisos será feito a partir dessa lista. O servidor não oferece uma rota pública para consultar contatos.

Para testar o cadastro, mantenha `npm run dev` em execução e abra http://127.0.0.1:4173. Também é possível manter a página aberta pelo Live Server: se o envio receber 404 ou 405 em uma prévia HTTP em `localhost`/`127.0.0.1`, o formulário usa a API local da porta 4173. O servidor local aceita o preflight CORS dessa prévia, limitado a conexões e origens de loopback. A exceção fica desativada por padrão no `createApp` e é habilitada pelo comando local de inicialização. Falhas de validação/gravação nunca são reenviadas automaticamente. Páginas publicadas não usam esse endereço local. Se o serviço estiver desligado, o formulário explica o problema e mantém os dados preenchidos.

Ao hospedar, execute o servidor Node e mantenha um diretório persistente para os dados (configurável por `CLEOPATRA_DATA_DIR`). Faça backup desse diretório; ele não é incluído no ZIP de entrega. Abrir apenas o HTML não fornece a API, e uma hospedagem apenas estática precisará de uma API de cadastro antes de receber contatos. A entrega do produto e o reembolso continuam dependendo de uma futura plataforma de pagamento.

Validação do fluxo: `npm run check` e `npm run test:priority`.

O envio do formulário acontece por `fetch`, com a navegação nativa cancelada. A mensagem completa “Parabéns por essa iniciativa!” substitui o formulário dentro do mesmo popup, após a confirmação da gravação, sem redirecionar nem recarregar a página. Os arquivos `.vscode/settings.json` da raiz e desta pasta excluem `data/**`, JSONL e logs da atualização automática do Live Server, para impedir que a gravação do cadastro feche o popup. Se o Live Server já estava iniciado antes dessa configuração, pare e inicie o Live Server uma vez para aplicá-la. A prévia Node em http://127.0.0.1:4173 funciona imediatamente e não recarrega a página ao gravar dados.

O preço do PDF foi preservado: 12 parcelas de R$ 10,03 (total R$ 120,36) ou R$ 97,00 à vista. O acesso é de 1 ano, com 7 dias de garantia. Antes de abrir vendas, confirme esses termos no checkout.

## Material e conteúdo

O carrossel de depoimentos (`../../magnetismo-feminino/testimonials.js`) desliza continuamente para a esquerda a 22 px/s. Uma cópia da sequência permite repetir o ciclo sem salto visual. Mantém pausa, setas, indicadores, teclado e gestos de deslizar. O movimento pausa ao passar o mouse, focar o carrossel, manter um toque, sair da tela ou ocultar a aba. Respeita movimento reduzido e inicia somente quando a seção fica visível após a liberação da VSL.

A abertura usa `../../magnetismo-feminino/assets/cleo.mp4` como vídeo de fundo, com reprodução automática, sem som, em loop e em linha no celular. A imagem original funciona como poster durante o carregamento. A reprodução pausa fora da tela, em abas ocultas e quando a pessoa prefere movimento reduzido.

No celular (até 600 px), `../../magnetismo-feminino/mobile.css` posiciona esse vídeo atrás do título, texto e chamada da abertura, com degradê para manter a leitura. Essa folha só é aplicada no mobile; o layout de desktop permanece igual.

As três imagens da seção de magnetismo agora usam clipes gerados com a cota gratuita do HeyGen. Os quatro itens do kit usam loops renderizados localmente com movimento suave e pontos de luz dourada, preservando a arte e os rostos originais. Nenhum crédito ou assinatura foi comprado. Os sete arquivos ficam em `../../magnetismo-feminino/assets/loop-*.mp4`; todos são H.264, sem faixa de áudio e com início rápido para a web.

Os vídeos das seções só carregam ao entrar na tela. A preferência de movimento reduzido e a economia de dados mantêm a imagem estática; abas ocultas e vídeos fora da tela pausam. Se um arquivo não carregar, a imagem original é restaurada.

A capa na oferta foi ampliada para até 330 px de largura no computador e 310 px no celular, com a legenda abaixo. Ela usa o vídeo `../../magnetismo-feminino/assets/video celular.mp4` fornecido pelo usuário, em repetição contínua e sem som. A moldura respeita a proporção vertical 9:16 e mantém a flutuação suave. A capa de carregamento `video-celular-poster.jpg` foi extraída do próprio vídeo. O renderizador `tools/render_offer_loop.py` foi mantido como fonte da animação anterior, que não é mais exibida nessa seção.

O projeto de renderização está em `tools/render_loops.py`, com os clipes originais em `tools/sources/` e o inventário em `tools/loops-manifest.json`. Para refazer os loops, use Python 3 e FFmpeg: `python tools/render_loops.py --ffmpeg CAMINHO_DO_FFMPEG`. As artes originais estão em `../../magnetismo-feminino/assets/`. Não há chamadas pagas nesse script. Use `--portraits-only` para refazer apenas a preparação dos três clipes gerados.

As artes e os três relatos foram extraídos do PDF fornecido. A fotografia de João Rafael usa o arquivo `../../magnetismo-feminino/assets/joao-rafael.jpg` fornecido pelo usuário. O segundo e o terceiro relatos usam os arquivos em alta resolução `../../magnetismo-feminino/assets/print 2.png` e `../../magnetismo-feminino/assets/print 5.png`, fornecidos pelo usuário, exibidos por inteiro. O primeiro relato mantém o recorte do cabeçalho; os dois novos prints já vêm sem cabeçalho e não recebem recorte adicional. A cópia mantém a sequência do framework, com redação editorial e sem garantir controle sobre sentimentos ou atitudes de terceiros. O contador depende de um prazo real, ainda não fornecido.

Inclui navegação por âncoras, apresentação em modal, integração configurável de vídeo e checkout, carrossel com navegação, pausa, teclado e gesto de deslizar, perguntas expansíveis e resumo fixo da oferta. As animações respeitam a preferência por movimento reduzido. Outfit nos títulos e Manrope nos textos, com arquivos variáveis incluídos em `../../magnetismo-feminino/assets/fonts/`, sem chamadas externas ao Google Fonts. As licenças SIL Open Font License acompanham os arquivos.

## Publicação

Os arquivos públicos ficam em `../../magnetismo-feminino/`, diretamente na raiz do repositório: `magnetismo-feminino/index.html`, folhas de estilo, scripts e `magnetismo-feminino/assets/`. Com a raiz do repositório como diretório de publicação, a página abre em https://gt.institutointi.com/magnetismo-feminino/.

As referências do HTML e das folhas de estilo são relativas à mesma pasta, incluindo fontes, imagens e vídeos. Mantenha essa estrutura ao publicar. O servidor local, os testes e os renderizadores de vídeo já apontam para a nova pasta pública.

A pasta de produção `magnetistmo-feminino/` permanece no GitHub para preservar o projeto e seus materiais, mas é excluída da hospedagem pelo `.assetsignore` da raiz. Isso evita publicar ferramentas locais, arquivos de trabalho e dados de cadastro junto com o site. A identidade do Sites está em `.openai/hosting.json`. Não é necessário instalar pacotes para executar a página.

O endpoint `/api/priority-list` mantém o endereço anterior. A publicação dos arquivos estáticos não executa `server.mjs`; o cadastro em produção continua dependendo de uma API nesse endereço.
