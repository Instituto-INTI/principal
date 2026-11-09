import fs from 'node:fs';
const htmlFile = 'cleopatra/dist/index.html';
let html = fs.readFileSync(htmlFile, 'utf8');
html = html.replace('id="checkout-status">Inscrições em breve.', 'id="checkout-status">Inscrições encerradas. Entre na Lista de Prioridade.');
html = html.replace('As inscrições serão disponibilizadas em breve nesta página. Quando estiverem abertas, o botão da oferta levará você à plataforma de pagamento.', 'As inscrições estão temporariamente encerradas. Clique em “Quero ativar meu magnetismo” e preencha o formulário para entrar na Lista de Prioridade e receber o aviso de novas vagas pelo WhatsApp e e-mail.');
fs.writeFileSync(htmlFile, html);
const readmeFile = 'cleopatra/README.md';
let readme = fs.readFileSync(readmeFile, 'utf8');
readme = readme.replace('- `checkoutUrl`: URL HTTPS real da plataforma de pagamento.', '- `checkoutUrl`: reservado para uma futura abertura de vendas. O fluxo atual sempre abre o formulário da Lista de Prioridade.');
readme = readme.replace('Enquanto o link do checkout estiver vazio, a página comunica que as inscrições estarão disponíveis em breve. Não há captura de dados nem simulação de pagamento. A entrega do produto e o reembolso devem ser configurados na plataforma de pagamento.', `O botão “Quero ativar meu magnetismo” abre o formulário “GARANTA SUA VAGA”, com nome, WhatsApp e e-mail obrigatórios. Após a gravação confirmada pelo servidor, o popup mostra a mensagem de sucesso da Lista de Prioridade. Erros preservam o formulário preenchido e não exibem uma confirmação falsa. O prazo de oferta, se configurado, não impede o cadastro na lista.

Os cadastros são recebidos por \`POST /api/priority-list\` e gravados em \`data/priority-list.jsonl\` (uma linha JSON por cadastro), fora da pasta pública \`dist\` e ignorados pelo Git. Cada registro contém identificador, data, nome, WhatsApp, e-mail e o texto da autorização apresentada no formulário. Nenhum dado é enviado a serviços externos; o envio futuro de avisos será feito a partir dessa lista. O servidor não oferece uma rota pública para consultar contatos.

Para testar o cadastro, use \`npm run dev\` e http://127.0.0.1:4173; abrir apenas o HTML ou usar um servidor estático/Live Server não fornece a API de gravação. Ao hospedar, execute o servidor Node e mantenha um diretório persistente para os dados (configurável por \`CLEOPATRA_DATA_DIR\`). Faça backup desse diretório; ele não é incluído no ZIP de entrega. Uma hospedagem apenas estática precisará de uma API de cadastro antes de receber contatos. A entrega do produto e o reembolso continuam dependendo de uma futura plataforma de pagamento.

Validação do fluxo: \`npm run check\` e \`npm run test:priority\`.`);
fs.writeFileSync(readmeFile, readme);
