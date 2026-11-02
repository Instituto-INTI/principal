# Código do Magnetismo

Página de vendas em português, criada a partir da copy final e do briefing fornecidos. React, TypeScript e Vite, com CSS próprio, imagens WebP e fontes locais. Sem backend, rastreadores ou cadastro de visitantes.

## Executar

No PowerShell:

```powershell
cd C:\Users\israe\Music\INTI\cleopatra\codigo-do-magnetismo
npm install
npm run dev
```

Abra o endereço informado pelo Vite, normalmente **http://127.0.0.1:5173/**.

```powershell
npm run check:content
npm run build
npm run check:browser
npm run preview
```

O preview de produção normalmente fica em **http://127.0.0.1:4173/**. `dist/` contém o site estático completo, incluindo HTML pré-renderizado. O conteúdo está disponível antes do JavaScript; React hidrata a página para ativar menu, vídeos e animações. Acordeões e âncoras usam elementos nativos. `check:browser` usa o Chrome local em modo headless; se necessário, defina `CHROME_PATH`. Capturas e relatório ficam em `.qa/`, fora da publicação.

## Onde editar

| Arquivo | Conteúdo |
| --- | --- |
| `src/content.ts` | Copy aprovada, mantendo a sequência original |
| `src/config.ts` | Checkout, condições comerciais, imagens, vídeos e depoimentos |
| `src/App.tsx` | Estrutura e componentes |
| `src/SevenLayersInfographic.tsx` | Sete camadas concêntricas em SVG e legenda HTML com links para os dias |
| `src/refinements.css` | Ajustes por seção do plano: legibilidade, disposição responsiva e infográfico |
| `src/Symbol.tsx` | Família de sete símbolos vetoriais e assinatura alada |
| `src/styles.css` | Direção visual, breakpoints, foco e movimento reduzido |
| `src/effects.css` e `src/useExperienceEffects.ts` | Efeitos da seção 02 em diante: entradas em sequência, luz nos portais, progressão visual, parallax discreto e microinterações |
| `docs/copy-original.txt` | Extração integral do PDF da copy |
| `docs/briefing-original.txt` | Extração integral do briefing de 14 páginas |
| `ASSETS_A_PRODUZIR.md` | Inventário, pendências e prompts de imagem |
| `VALIDACAO.md` | Verificações realizadas e limites |
| `PENDENCIAS_PUBLICACAO.md` | Dados, mídias e PDFs que ainda precisam ser fornecidos |

## Antes de abrir as vendas

Preencha em `src/config.ts` somente informações confirmadas:

- `checkoutUrl`: endereço HTTPS real do pagamento. Não incluir credenciais na URL.
- `waitlistUrl`: lista de espera HTTPS real, caso exista pré-lançamento.
- `price`, `paymentTerms`: preço e condições reais, exibidos literalmente.
- `platform`, `accessPeriod`, `delivery`: plataforma, prazo de acesso e instruções de entrega. `delivery` também responde à pergunta sobre acesso.
- `guarantee`, `purchaseSecurity`: termos reais de garantia e segurança da compra.
- `activationDuration`: duração média real, usada no FAQ.
- `videos.invitation` e `videos.demonstration`: `src`, `poster` e, quando aplicável, `captions` em WebVTT. Arquivos locais podem ficar em `public/videos/`; também são aceitas URLs diretas de mídia HTTPS. Uma URL de página do YouTube não é arquivo de vídeo.
- `images.finalThrone`: arte final aprovada com aura. Sem esse arquivo, mantém-se o trono atual.

O vídeo da primeira seção já está configurado em `videos.hero`, usando `public/images/cleopatra video.mp4`. Reproduz automaticamente sem som e em loop, com botão de pausa. Quem prefere movimento reduzido recebe o vídeo pausado e pode iniciar a reprodução manualmente. A imagem original serve de poster e fallback.

Nenhum preço, desconto, parcelamento, prazo ou garantia foi inventado. A compra só é habilitada com checkout HTTPS válido e condições comerciais completas: preço, pagamento, plataforma, prazo, entrega e garantia. No pré-lançamento, os CTAs comerciais levam à lista de espera real, se configurada; caso contrário, ficam desabilitados com aviso visível. Os CTAs intermediários levam à oferta. Sem vídeo, aparecem posters explicitamente identificados, sem reprodução simulada. Não há áudio automático. Com vídeo de convite configurado, o roteiro integral fica no acordeão “Ler o convite”.

As oito perguntas originais permanecem em `src/content.ts`. As três dependentes de duração, entrega e garantia só aparecem quando seus dados reais estão preenchidos. Na configuração atual são cinco perguntas públicas, sem respostas genéricas. O vídeo do hero pausa fora da área visível e com a aba oculta; uma pausa manual é preservada.

A seção 09 só aparece se `testimonials` contiver relatos autorizados, específicos deste produto e com conteúdo. Cada item usa `product: 'codigo-do-magnetismo'`, `authorized: true`, `name`, `format` (`text`, `video` ou `audio`) e `text` ou `src`. Vídeos podem ter `captions`. A autorização deve ser obtida antes de configurar o item.

## Publicação e manutenção

O projeto de Sites está identificado em `.openai/hosting.json`. A publicação inicial mantém acesso privado. O diretório de publicação é `dist/`; os arquivos de documentação, a configuração TypeScript e as imagens fonte não fazem parte da pasta pública. Nunca coloque segredos em `src/config.ts`: tudo importado pela página pode ser lido por visitantes.

Ao publicar em outro domínio, atualize canonical, `og:url`, `og:image` e `twitter:image` em `index.html`. A página não inventa identificação jurídica, políticas ou canais de contato: forneça esses textos antes do lançamento comercial se fizerem parte da sua operação.

Para regenerar imagens WebP a partir dos PNGs locais em `.asset-sources/`, execute `node scripts/prepare-images.mjs`. Os PNGs originais ficam fora da publicação e do versionamento. Para reinstalar as fontes com suas licenças OFL, use `node scripts/download-fonts.mjs` com acesso à rede.

`npm run check:content` confere a copy com a extração existente, as sete camadas, as mídias e os estados de configuração de oferta, lista de espera, FAQ, transcrição e depoimentos. Os valores de teste só existem em memória durante a auditoria. `npm run check:browser` verifica a versão de produção em 375, 390, 768, 1024 e 1440 px, na configuração atual de pré-lançamento. Revise `VALIDACAO.md` e `PENDENCIAS_PUBLICACAO.md` antes do lançamento.
