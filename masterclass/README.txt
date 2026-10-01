SITE — A CORAGEM DE SE ESCOLHER

Arquivos:
- index.html: página completa
- styles.css: identidade visual e responsividade
- script.js: popup/modal, máscara de WhatsApp, animações e configuração
- assets/capa-masterclass.jpg: capa enviada

AJUSTES NECESSÁRIOS ANTES DE PUBLICAR

1. DATA DA MASTERCLASS
Abra script.js e altere:
const EVENT_DATE = '[DIA DA SEMANA], [DATA]';
Exemplo:
const EVENT_DATE = 'TERÇA-FEIRA, 22 DE SETEMBRO';

2. PÁGINA DE OBRIGADO
Abra script.js e informe a URL em:
const THANK_YOU_URL = '';

3. CAPTURA REAL DOS LEADS
O formulário já funciona visualmente, mas ainda não envia dados a nenhuma plataforma.
No evento submit do script.js existe um ponto preparado para conectar webhook, Kiwify, ActiveCampaign, Make, n8n, Supabase ou outro sistema.

4. FOTO DO JOÃO RAFAEL
A seção "Quem vai conduzir" contém um espaço reservado. Substitua o bloco placeholder-photo por uma imagem real quando a foto estiver disponível.

5. PUBLICAÇÃO
Pode ser hospedado em Vercel, Netlify, Cloudflare Pages, Hostinger ou servidor próprio como site estático.
