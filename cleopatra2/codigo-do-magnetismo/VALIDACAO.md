# Validação — 02/11/2026

## Resultado

Alterações aplicadas ao projeto existente, preservando React/TypeScript/Vite, IDs das seções, fontes locais, paleta, textos e artes aprovadas. Nenhuma dependência foi adicionada. A página permanece em pré-lançamento; não foi publicada nesta rodada.

- `npm run build`: passou, incluindo TypeScript, Vite e HTML pré-renderizado.
- `npm run check:content`: passou; 127 fragmentos conferidos com a extração de copy existente e presença da copy aplicável no HTML renderizado.
- `npm run check:browser`: passou no Chrome headless local, em 375, 390, 768, 1024 e 1440 px. Relatório e capturas em `.qa/` (ignorados pelo Git e fora de `dist/`).
- O projeto não possui comandos separados de lint nem framework de testes unitários. Os verificadores de conteúdo e de navegador cobrem as mudanças de comportamento.

## Escopo por seção

| Seção | Implementação |
| --- | --- |
| 01 | Textos secundários legíveis; colunas distintas no desktop, retrato acima do texto em telas menores; vídeo real preservado, com autoplay silencioso, pausa manual, pausa fora da tela/aba oculta e poster de reserva |
| 02 | Contrastes com melhor leitura e destaque para a chamada sobre presença e ausência, sem mudança textual |
| 03 | Comparativo celular/símbolo ampliado, rótulos maiores, analogia e citação central preservadas e espaçadas |
| 04 | Três artes quadradas uniformes: Olho de Hórus, Ísis alada e mãos/luz; descrições maiores e conector auxiliar somente no desktop |
| 05 | `SevenLayersInfographic`: núcleo e seis anéis, legenda HTML numerada com grupos e links para os dias; sete artes, benefícios e descrições mantidos em níveis de 3, 2 e 2 itens |
| 06 | Poster e roteiro completos no estado sem mídia; player real configurável, legendas e transcrição em “Ler o convite” quando houver vídeo |
| 07 | Player/poster ampliado e antes do texto auxiliar no mobile; indicação clara de mídia indisponível, sem reprodução simulada |
| 08 | Cinco itens originais preservados, corpo em 16 px, espaçamento e preparação inicial |
| 09 | Componente preservado; seção totalmente omitida sem relatos reais, específicos do produto e autorizados |
| 10 | Capa final existente preservada, entregáveis legíveis, dados comerciais centralizados e abertura de vendas condicionada a dados completos e checkout HTTPS |
| 11 | Oito perguntas preservadas no conteúdo; cinco públicas agora, três condicionais às respostas reais de duração, entrega e garantia; acordeões nativos |
| 12 | Texto e retrato em áreas separadas; trono atual preservado, campo para arte final com aura e mesma regra comercial da oferta |

## Verificações automatizadas

A auditoria de conteúdo confere ordem das 11 seções públicas (09 omitida), sete camadas concêntricas, sete conectores, legenda na ordem 1–7, sete ativações, três níveis, oito perguntas no conteúdo e somente perguntas respondidas no HTML público. Também verifica IDs únicos, âncoras existentes, arquivos locais de mídia/fontes e ausência de instruções editoriais na copy pública.

Os cenários de configuração são renderizados em memória, sem gravar valores fictícios em `src/config.ts` nem efetuar compras: checkout sem condições completas permanece bloqueado; lista de espera recebe os dois CTAs comerciais quando configurada; oferta completa usa o checkout; respostas reais fazem as oito perguntas aparecer; vídeos configurados usam players e transcrição integral; somente depoimentos autorizados são exibidos. URLs inseguras, com credenciais, de exemplo e locais são rejeitadas.

No Chrome, em cada largura exigida:

- Sem rolagem horizontal nem elementos de conteúdo ultrapassando a tela.
- Headline e imagem do hero/final não se sobrepõem.
- Descrições de corpo verificadas com tamanho mínimo de 16 px.
- As imagens carregam; sete camadas e sete cards permanecem no DOM.
- FAQ abre por clique real, fecha com Enter e reabre com Espaço; o foco e os estados expandido/recolhido são expostos pela árvore de acessibilidade nativa do navegador.
- Menu mobile abre e fecha com Escape.
- CTA do hero navega até a oferta; CTAs comerciais estão desabilitados com indicação visível no estado atual.
- Movimento reduzido pausa o vídeo de abertura; movimento normal permite reprodução silenciosa, pausa/reprodução manual e pausa ao sair da área visível. A pausa manual persiste após rolagem.
- Falha no vídeo de abertura apresenta a imagem aprovada de reserva.
- Nenhum erro de JavaScript/console relevante foi registrado.

## Inspeção visual

Capturas reais da versão de produção foram inspecionadas em desktop e mobile. Foram conferidos enquadramento dos retratos, títulos, legibilidade, três pilares, infográfico, sete artes e descrições, oferta, FAQ e encerramento. A revisão corrigiu o corte do rosto no poster da demonstração e a legibilidade de frases auxiliares da jornada e da conclusão do problema.

As capturas completas são montadas a partir de viewports pintados pelo Chrome, evitando o limite de textura em páginas mobile muito longas. Isso é uma técnica de captura do teste, sem alteração no site.

## Limitações e pendências

O DOCX do plano foi lido integralmente. A copy e o briefing foram consultados pelas extrações existentes em `docs/`. Os PDFs originais da copy (12 páginas), briefing (14 páginas) e captura da página anterior (7 páginas) não estavam disponíveis. Por isso, não foi possível reconferir a extração contra os PDFs nem fazer a comparação visual com a captura aprovada. Não se declara essa etapa concluída.

A validação de navegador usa Chrome headless local com larguras mobile/tablet/desktop. Não substitui Safari, iPhone/Android físicos, auditoria completa com leitor de tela, teste de rede móvel ou avaliação manual de todas as combinações possíveis de configuração.

Os vídeos reais de convite e demonstração, suas legendas, a arte final com aura e os dados de venda ainda não foram fornecidos. Seus estados configurados foram conferidos por renderização; sua reprodução real e a compra só poderão ser validadas com os materiais finais. Consulte `PENDENCIAS_PUBLICACAO.md` para os campos exatos.

## Reproduzir

```powershell
npm run check:content
npm run build
npm run check:browser
npm run preview
```

`check:browser` usa o Chrome instalado em `C:/Program Files/Google/Chrome/Application/chrome.exe`; alternativamente, defina `CHROME_PATH`. O verificador de navegador reflete a configuração atual de pré-lançamento e precisa de expectativas atualizadas após a abertura de vendas.
