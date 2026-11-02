# Pendências de publicação — 02/11/2026

As alterações do plano foram aplicadas ao projeto existente. A página permanece em pré-lançamento até receber dados reais. Não houve publicação nesta rodada.

## Referências ainda necessárias

O DOCX `docs/Plano_Implementacao_Codigo_Magnetismo.docx` foi lido integralmente. Estão disponíveis as extrações `docs/copy-original.txt` (12 páginas) e `docs/briefing-original.txt` (14 páginas), utilizadas na implementação. Os três PDFs originais não foram encontrados no workspace nem fornecidos nesta conversa:

- PDF da copy final, 12 páginas: necessário para reconferir a extração com o original.
- PDF do briefing criativo, 14 páginas: necessário para conferir a referência visual original.
- PDF da captura da página anterior, 7 páginas: necessário para a comparação visual com a captura aprovada. Não há extração nem cópia local dessa captura.

Os testes comparam a copy à extração existente; não comprovam fidelidade a PDFs ausentes. A página atual foi inspecionada diretamente no código e no Chrome local.

## Dados comerciais em `src/config.ts`

| Campo | Recurso a fornecer | Comportamento atual |
| --- | --- | --- |
| `price` | Preço real, no formato a ser exibido | Sem preço público |
| `paymentTerms` | Condições reais de pagamento | Sem parcelamento ou desconto inventado |
| `platform` | Plataforma de acesso (`accessPlatform` no plano) | Nome da plataforma oculto |
| `accessPeriod` | Prazo de acesso (`accessDuration` no plano) | Prazo oculto |
| `delivery` | Instruções reais de entrega e acesso | Pergunta correspondente do FAQ oculta |
| `guarantee` | Termos reais da garantia (`guaranteeText` no plano) | Pergunta correspondente do FAQ oculta |
| `activationDuration` | Duração média real de cada ativação | Pergunta correspondente do FAQ oculta |
| `checkoutUrl` | URL HTTPS real de pagamento | Compra indisponível |
| `waitlistUrl` | URL HTTPS real da lista de espera, caso exista | Sem captação fictícia |
| `purchaseSecurity` | Informação verificável sobre a compra, se aplicável | Nenhum selo ou afirmação inventada |

A abertura de vendas exige checkout HTTPS válido e preenchimento de `price`, `paymentTerms`, `platform`, `accessPeriod`, `delivery` e `guarantee`. Com dados incompletos, a oferta mantém o aviso de pré-lançamento. Se houver `waitlistUrl` válida, os dois CTAs comerciais levam à lista de espera; sem ela, ficam desabilitados com indicação visível de indisponibilidade. Os CTAs intermediários continuam levando a `#oferta`.

## Mídias e autorizações

| Campo | Pendente | Material preservado |
| --- | --- | --- |
| `videos.invitation.src` | Vídeo real do convite | Poster `/images/cleopatra-hero.webp` e roteiro integral |
| `videos.invitation.captions` | Legendas WebVTT, quando disponíveis | Player com suporte preparado |
| `videos.demonstration.src` | Amostra autêntica de 20–40 segundos | Poster `/images/cleopatra-throne.webp` |
| `videos.demonstration.captions` | Legendas WebVTT, quando disponíveis | Player com suporte preparado |
| `images.finalThrone` | Arte final aprovada da personagem no trono com aura, em arquivo independente | Trono atual `/images/cleopatra-throne.webp` |
| `testimonials` | Relatos reais desta experiência, identificação autorizada e mídia/texto | Seção 09 completamente oculta |

Os campos `videos.invitation.poster` e `videos.demonstration.poster` já têm referências válidas; substituir somente se houver posters finais aprovados. Os nomes aninhados preservam o padrão do projeto e correspondem a `invitationVideoUrl`, `invitationPoster`, `demoVideoUrl` e `demoPoster` do plano.

O hero já possui vídeo real em `videos.hero.src`, poster e retrato mobile. As três artes dos pilares, as sete artes dos dias e a capa final do produto já estão integradas, em WebP, com os originais preservados. Nenhuma nova personagem ou imagem de banco foi criada.

## Conferir quando os materiais chegarem

1. Reconferir os três PDFs originais, especialmente a captura da versão aprovada.
2. Conferir áudio, legendas e duração dos vídeos reais; o teste atual cobre os estados configurados por renderização e o vídeo real da abertura no navegador.
3. Testar a compra no ambiente do provedor e a lista de espera real, se utilizada.
4. Repetir `npm run check:content`, `npm run build` e a inspeção de navegador após configurar os materiais. O teste de navegador entregue valida o estado atual de pré-lançamento.
5. Verificar em Safari/iPhone e Android físicos antes do lançamento; a validação desta rodada usa Chrome headless com dimensões de viewport, sem emulação de todos os comportamentos desses dispositivos.
