# A Coragem de se Escolher

Página estática criada a partir de `img/design pagina.png`, com vídeo em loop, contador para a próxima terça ou quinta às 19h30 (Bahia), apresentação do João Rafael e botão para o link de inscrição fornecido.

## Abrir a página

Abra `index.html` diretamente no navegador ou, com Node.js instalado, execute:

```sh
npm run dev
```

Acesse http://localhost:3000. Não é necessário instalar dependências.

## Arquivos

- `index.html`: conteúdo e link de inscrição.
- `styles.css`: layout da referência e adaptação para celular.
- `script.js`: contador, reprodução do vídeo e formulário de inscrição.
- `fonts/`: fontes locais, sem dependência de serviços externos.
- `img/`: arquivos fornecidos e recortes da capa do vídeo e do retrato.

Para hospedar em um serviço estático, envie `index.html`, `styles.css`, `script.js`, `fonts/` e `img/`. A imagem `img/design pagina.png` é apenas a referência e não é carregada pela página.

O cabeçalho e o contador mostram a próxima edição: toda terça e quinta, às 19h30, no horário da Bahia (UTC−3), independentemente do fuso do visitante. Ao atingir o horário, ambos passam automaticamente para a edição seguinte, inclusive com a página aberta. O contador também é atualizado ao retornar à aba. Para alterar a programação, ajuste `getNextEventTime` e o horário exibido em `updateEventDate`, no arquivo `script.js`, e os textos de apresentação no HTML.

## Formulário de inscrição

O botão de participação abre um popup com nome, e-mail e WhatsApp. Os três campos são obrigatórios. Para números brasileiros, informe o DDD; o código 55 é acrescentado quando não informado. Números de outros países são aceitos com + e o código do país.

O formulário envia um POST JSON ao webhook Datacrazy definido em `action` no HTML, com este formato:

```json
{
  "nome": "Nome do participante",
  "email": "participante@exemplo.com",
  "whatsapp": "5571999999999"
}
```

No fluxo Datacrazy, os campos recebidos são `nome`, `email` e `whatsapp`; associe-os aos campos correspondentes do contato, caso o fluxo ainda não tenha esse mapeamento. O endpoint permite POST com JSON pelo navegador (verificado via OPTIONS, sem criar cadastro).

Após uma resposta HTTP de sucesso, a pessoa é redirecionada na mesma aba para o link do WhatsApp em `data-whatsapp-url`, preservando todos os parâmetros do link fornecido. Durante o envio, novos cliques são bloqueados. Se a requisição falhar ou exceder 20 segundos, o formulário preserva os dados, mostra um aviso e permite tentar novamente, sem redirecionar.
