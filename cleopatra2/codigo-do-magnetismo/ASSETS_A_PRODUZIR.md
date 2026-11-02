# Inventário visual e recursos pendentes

## Atualização da seção 10

A capa fornecida `public/images/capa CÓDIGO DO MAGNETISMO.png` substitui a imagem anterior na oferta. A página usa `public/images/capa-codigo-do-magnetismo.webp`, versão otimizada de 1000 × 1778, configurada em `siteConfig.images.productCover`. A moldura respeita a proporção vertical da capa e não sobrepõe títulos nem escurece a arte fornecida.

## Atualização da seção 04

Os três ícones do método foram substituídos pelas imagens fornecidas: `CONEXÃO SIMBÓLICA.jpeg`, `IMERSÃO ARQUETÍPICA.jpeg` e `CANALIZAÇÃO PSÍQUICA.jpeg`. Os arquivos originais estão preservados em `public/images/`; as versões WebP de 900 × 900 são configuradas em `siteConfig.images.method` e podem ser regeneradas com `node scripts/prepare-method-images.mjs`. Todas preenchem as molduras sem tarjas, mantendo a numeração e os efeitos de iluminação.

## Atualização da seção 05

Os ícones dos sete dias foram substituídos pelas imagens JPEG fornecidas pelo usuário em `public/images/`. As versões usadas na página são WebP, geradas por `node scripts/prepare-activation-images.mjs`, preservando os arquivos originais. As imagens preenchem completamente as molduras com recorte proporcional centralizado, sem tarjas nem distorção. A ordem em `siteConfig.images.activations` é: Espelho da Rainha, Coroa de Cleópatra, Tesouros do Nilo, Decreto da Rainha, Fascínio de Cleópatra, Aura Dourada e Trono de Cleópatra. Os SVGs continuam disponíveis para os demais componentes da página e como alternativa de configuração.

## Direção comum

Paleta: preto #100D12, ameixa #241D28, ouro antigo #C5A46D, ouro luminoso #E6C88F, marfim #F5EBDD e esmeralda #173F37. Realismo cinematográfico, materiais naturais, sombras profundas e sensualidade elegante. A personagem é uma representação artística virtual e ficcional, explicitada na página.

**Referência facial principal:** `.asset-sources/cleopatra-hero-source.png`. Para qualquer nova aparição da personagem, anexar essa imagem como referência de identidade. Não gerar rostos a partir de texto isolado. Preservar olhos amendoados claros, pele oliva, cabelos pretos lisos com franja, maquiagem refinada, diadema alado com esmeralda, colar de ouro e esmeraldas e tecido preto. A imagem do trono foi gerada com essa referência.

## Entregues

| Recurso | Arquivo | Proporção e uso |
| --- | --- | --- |
| Cleópatra principal | `public/images/cleopatra-hero.webp` | 1122 × 1402, aproximadamente 4:5. Seção 01, convite e composição simbólica |
| Retrato móvel | `public/images/cleopatra-hero-mobile.webp` | 640 × 800. Primeira dobra móvel |
| Cleópatra no trono | `public/images/cleopatra-throne.webp` | 1122 × 1402, aproximadamente 4:5. Seção 12 e representação do produto |
| Imagem social | `public/images/social.webp` | 1200 × 630. Metadados de compartilhamento |
| Sete símbolos | `src/Symbol.tsx` | SVG nativo, viewBox 200 × 220. Sete portais: espelho, coroa, tesouros, decreto, fascínio, aura e trono |
| Visualização do produto | Componente `digital-display` em `src/App.tsx` | Composição HTML/CSS com a imagem do trono, apresentada como representação visual do produto digital. Não sugere entrega de aparelho ou material físico |

Os PNGs fonte foram preservados em `.asset-sources/`, fora da pasta pública. As imagens foram produzidas com a ferramenta integrada de geração de imagens; não foi usada API paga configurada no projeto. A conversão para WebP, redução e recorte social foram feitos localmente com Sharp.

## Pendências obrigatórias para concluir as mídias

| Recurso | Entrega necessária | Integração |
| --- | --- | --- |
| Vídeo do convite | Vídeo real da personagem virtual, 4:5 ou 9:16, MP4 H.264 + AAC. Rosto igual à referência. Legendas WebVTT em português. Recorte ajustável no player | `siteConfig.videos.invitation.src` e `.captions`, seção 06 |
| Demonstração real | Trecho autêntico de uma ativação do produto, aproximadamente 20–40 s, 16:9, idealmente 1920 × 1080. Narração, imagens e sons efetivamente entregues. Legendas WebVTT | `siteConfig.videos.demonstration.src` e `.captions`, seção 07 |
| Depoimentos | Somente relatos reais deste produto, autorizados, em texto, áudio ou vídeo. Não há pendência bloqueante: a seção está oculta | `siteConfig.testimonials`, seção 09 |

**Não criar uma demonstração ilustrativa e apresentá-la como produto real.** Os dois players só são instanciados quando há arquivo de vídeo. Até lá, a página exibe os estados “Vídeo de convite em breve” e “Prévia em breve”. O texto integral do convite está visível, conforme o roteiro fornecido.

Roteiro para o vídeo: usar exatamente `invitation.script` em `src/content.ts`, também preservado no documento da copy. Representar Cleópatra como personagem ficcional, sem sugerir gravação de uma pessoa histórica. Sem autoplay com áudio.

## Prompts efetivamente utilizados

### Imagem principal — geração integrada

> Use case: ads-marketing. Create a single ultra-realistic cinematic portrait for a premium Egyptian-inspired women's symbolic immersion website. Fictional artistic Cleopatra, adult woman about 30 with olive bronze skin, elegant symmetrical features, almond hazel eyes, straight black hair with blunt fringe, subtle kohl eyeliner, sovereign confident calm expression, realistic pores and skin, magnificent aged gold Egyptian winged headdress with green emerald central jewel, broad delicate gold and emerald collar, elegant black draped noble dress. Head and upper torso portrait, three quarter turned with direct eye contact. Subject occupies RIGHT two thirds, face fully visible, generous space above headdress. Left third is a softly shadowed ancient palace wall with columns. Light falls on face in warm gold from left, moody plum-black shadows. Warm film grain, luxury perfume editorial photography, anamorphic cinema, not fantasy game rendering. Background dark #100D12 and #241D28, antique gold #C5A46D, emerald #173F37, no bright orange. Portrait 4:5 composition, no lettering, no logo, no watermark. This face will be reused for the same character in subsequent images. Save the generated image and return its local file path.

### Trono — geração integrada com referência de identidade

Referência anexada: PNG da imagem principal.

> Use case: identity-preserve. Reference image is the previously generated Cleopatra portrait, use it as the EXACT facial identity and costume reference. Create a new cinematic photograph of THE SAME adult woman with same hazel eyes, olive skin, straight black hair with bangs, Egyptian gold winged headdress with central emerald, gold emerald collar and black silk noble dress. Show her seated on a magnificent ancient Egyptian gold throne, centered in a palatial shadowed hall, full body and complete throne visible, sovereign confident eye contact, natural anatomy and skin. Portrait 4:5 composition. Large throne arch, elegant symmetrical ancient palace columns in background, warm subtle gold rim light, deep plum-black shadows, black #100D12, antique gold #C5A46D and emerald #173F37. Understated luxury perfume campaign, cinematic realistic photography, no videogame or fantasy look, no text, no logos. Preserve the face exactly. Scene to close a website about seven symbolic experiences inspired by Cleopatra, artistic fictional representation. Return local saved path.

## Variações fotográficas opcionais dos sete símbolos

Os sete SVGs estão concluídos e formam uma família coerente. Não é necessário substituí-los. Para preferir objetos fotorrealistas, produzir sete arquivos WebP de 800 × 1000 (4:5), aproximadamente 150 KB cada, e preencher `siteConfig.images.activations` na ordem dos dias. Evitar textos gerados dentro das imagens.

Prompt base: “Premium cinematic still life for a symbolic Cleopatra immersion website. [OBJETO]. Ancient Egyptian palace niche in deep black and imperial plum, aged gold with restrained emerald details, sculptural side lighting, tactile realistic materials, atmospheric depth, understated luxury editorial photography. Single centered symbolic object, tall arched composition, dark negative space around object. 4:5 portrait, no people unless explicitly requested, no lettering, no logos, no watermark, no fantasy videogame rendering.”

| Dia / destino sugerido | Substituir [OBJETO] por |
| --- | --- |
| 01 — `/images/espelho.webp` | An ornate ancient Egyptian handheld gold mirror with a lotus handle, polished softly reflective disk, subtle emerald setting, symbol of self-recognition |
| 02 — `/images/coroa.webp` | A sovereign Egyptian gold winged crown with one deep emerald, resting on black silk, symbol of receptivity and worth |
| 03 — `/images/tesouros.webp` | A partly open ancient Egyptian royal treasure chest with a few gold ornaments and a quiet reflection of Nile water, abundance without excess |
| 04 — `/images/decreto.webp` | A royal papyrus scroll with a sculpted gold seal and ceremonial scepter, no legible writing, symbol of clarity and sovereign intention |
| 05 — `/images/fascinio.webp` | A translucent black silk veil with a single emerald gold ornament; elegant visual suggestion of mystery and fascination, no face or extra person |
| 06 — `/images/aura.webp` | The SAME fictional Cleopatra from the attached main portrait reference, calm confident silhouette framed by a subtle symbolic golden backlight, natural anatomy; preserve exact identity, no suggestion of scientific energy fields |
| 07 — `/images/trono.webp` | A monumental empty ancient Egyptian gold throne with winged detailing, deep emerald accent and black silk, symbol of sovereignty |

Para o dia 06, anexar obrigatoriamente a referência facial principal. Se uma nova personagem surgir em qualquer variação, rejeitar o resultado e refazer com a referência. Para novo mockup, usar apenas a experiência digital já descrita: sete ativações e preparação; não acrescentar livros, bônus, aplicativos ou materiais não fornecidos.

## Atualização da abertura

O arquivo fornecido pelo usuário, public/images/cleopatra video.mp4 (1280 × 720), foi integrado à seção 01. A configuração fica em siteConfig.videos.hero. Reproduz sem som, em loop, com controle de pausa e respeito à preferência por movimento reduzido. O retrato anterior permanece como poster e fallback. Os vídeos de convite e demonstração continuam pendentes.

