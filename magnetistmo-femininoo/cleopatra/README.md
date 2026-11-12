# Cleópatra — Protocolo do Magnetismo Feminino

Página pública em `../../magnetismo-feminino/`, feita com HTML, CSS e JavaScript, sem instalação de dependências ou etapa de build. Com a raiz do repositório como diretório de publicação, o endereço é `https://gt.institutointi.com/magnetismo-feminino/`.

## Visualizar e verificar

Execute `npm run dev` nesta pasta e abra `http://127.0.0.1:4173`.

- `npm run check`: verifica a sintaxe dos scripts e do servidor.
- `npm run test:priority`: verifica a gravação dos cadastros, validação, falhas e redirecionamento.
- `node tools/test-vsl-gate.mjs`: verifica a liberação das seções após 50% da VSL.
- `node tools/test-testimonials.mjs`: verifica o carrossel, controles, pausa e gestos.

## Correções do PDF de novembro de 2026

As alterações seguem `Correcao pv - Protocolo Magnetismo feminino.pdf`: títulos centralizados, descrições maiores, botões com texto centralizado, pirâmides no logo, imagens estáticas em WebP no lugar dos vídeos decorativos, ordem das duas primeiras imagens de benefícios corrigida e textos ajustados conforme o documento. A VSL continua sendo um vídeo.

Os cards do kit usam “ASSISTA”, “ESCUTE”, “VISUALIZE” e “ATIVE”. O nome dos áudios é “Áudios de Ativação Biokinesis”. A oferta usa a arte estática original do protocolo e os selos de compra segura e garantia fornecidos no material. O total parcelado adicional e os avisos antecipados de inscrições encerradas foram removidos conforme o PDF. O preço permanece em 12x de R$ 10,03 ou R$ 97,00 à vista, com 1 ano de acesso e 7 dias de garantia.

A foto de João Rafael é circular e mantém a assinatura. Foram removidos o bloco adicional com o nome do autor, as duas perguntas indicadas do FAQ, as setas decorativas nos depoimentos, a faixa superior do rodapé e o texto de aviso antecipado no formulário. Os depoimentos em alta resolução usam WebP sem perda de pixels; a ampliação por gesto permanece disponível.

`corrections.css` concentra os ajustes de layout e legibilidade. As imagens originais e os antigos vídeos foram preservados como fontes; a página carrega apenas as imagens referenciadas no HTML.

## VSL e liberação do conteúdo

O player VTurb `vid-6aee4b40cbb56d66d7edc140` fica na seção `#apresentacao`. O script de incorporação está no HTML. `vsl-gate.js` libera o botão principal, as seções de venda, o rodapé e a oferta fixa quando a reprodução alcança 50% da duração real. SmartAutoPlay não libera o conteúdo; a liberação permanece até o próximo carregamento.

No celular, `mobile.css` posiciona o mesmo player após a descrição da abertura, antes do botão principal. O player não é duplicado nem movido no DOM.

## Cadastro e aviso após o envio

O botão “QUERO ATIVAR MEU MAGNETISMO” abre o formulário com nome, WhatsApp e e-mail obrigatórios. O envio usa JSON com `{ name, whatsapp, email, consent: true }`. A API deve responder com um status HTTP de sucesso e `{ "ok": true }` somente após confirmar o cadastro.

Após essa confirmação, `priority-form.js` redireciona para `cadastro-confirmado.html`, na mesma pasta da página. O aviso completo da Lista de Prioridade aparece nessa página. Erros mantêm os campos preenchidos e não provocam redirecionamento. Não há dados pessoais nos parâmetros da URL.

O servidor local recebe `POST /api/priority-list` e grava em `data/priority-list.jsonl`, fora da pasta pública. Os testes usam dados fictícios e diretórios temporários. Não existe rota pública para consultar contatos. O Live Server também pode usar a API local da porta 4173 quando a sua própria rota retorna 404 ou 405; essa alternativa só funciona em prévias locais.

## Conexão ao servidor de produção — pendente

A URL e o formato definitivo da API de produção mencionada no PDF ainda não foram fornecidos. Em `../../magnetismo-feminino/config.js`, `priorityEndpoint` está vazio e o formulário usa `/api/priority-list`. Quando a integração for definida, preencha essa configuração e ajuste o contrato se necessário.

Para a integração, serão necessários:

- URL HTTPS do endpoint de cadastro.
- Campos e nomes esperados no JSON e formato da resposta de confirmação.
- Liberação CORS para o domínio da página, se a API usar outro domínio.
- Definição de qualquer autenticação necessária no servidor, sem incluir segredos no JavaScript público.

Publicar apenas os arquivos estáticos não executa a API Node. Para usar o servidor existente em produção, é necessário executá-lo na hospedagem e configurar um diretório persistente com `CLEOPATRA_DATA_DIR`. O formulário só confirma o cadastro quando há uma resposta positiva da API.

`checkoutUrl` continua reservado para uma futura abertura de vendas. `offerEndsAt` aceita uma data real em ISO com fuso; sem data, o contador fica oculto. `videoUrl` pertence ao modal antigo de apresentação e não controla a VSL incorporada.
