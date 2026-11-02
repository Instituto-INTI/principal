export type MediaConfig = { src: string | null; poster: string; captions: string | null };
export type Testimonial = { name: string; authorized: boolean; product: 'codigo-do-magnetismo'; format: 'text' | 'video' | 'audio'; text?: string; src?: string; captions?: string };

// Preencha somente com condições reais e materiais autorizados. Strings vazias ocultam dados comerciais.
export const siteConfig = {
  checkoutUrl: '',
  waitlistUrl: '',
  price: '',
  paymentTerms: '',
  platform: '',
  accessPeriod: '',
  delivery: '',
  guarantee: '',
  purchaseSecurity: '',
  activationDuration: '',
  images: {
    hero: '/images/cleopatra-hero.webp',
    heroMobile: '/images/cleopatra-hero-mobile.webp',
    throne: '/images/cleopatra-throne.webp',
    // Arte final do trono com aura, quando aprovada. Enquanto ausente, conserva o trono atual.
    finalThrone: null as string | null,
    productCover: '/images/capa-codigo-do-magnetismo.webp',
    social: '/images/social.webp',
    method: [
      '/images/conexao-simbolica.webp',
      '/images/imersao-arquetipica.webp',
      '/images/canalizacao-psiquica.webp',
    ],
    // Imagens fornecidas, na ordem dos dias 01 a 07.
    activations: [
      '/images/espelho-da-rainha.webp',
      '/images/coroa-de-cleopatra.webp',
      '/images/tesouros-do-nilo.webp',
      '/images/decreto-da-rainha.webp',
      '/images/fascinio-de-cleopatra.webp',
      '/images/aura-dourada.webp',
      '/images/trono-de-cleopatra.webp',
    ],
  },
  videos: {
    hero: { src: '/images/cleopatra%20video.mp4', poster: '/images/cleopatra-hero.webp', captions: null } as MediaConfig,
    invitation: { src: null, poster: '/images/cleopatra-hero.webp', captions: null } as MediaConfig,
    demonstration: { src: null, poster: '/images/cleopatra-throne.webp', captions: null } as MediaConfig,
  },
  testimonials: [] as Testimonial[],
};

export function validCheckout(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const reserved = ['localhost', 'example.com', 'example.org', 'example.net'];
    return url.protocol === 'https:' && !url.username && !url.password && !reserved.some(domain => host === domain || host.endsWith('.' + domain)) && !['127.0.0.1', '[::1]'].includes(host) ? url.href : null;
  } catch { return null; }
}

// Mesma regra para o checkout e a lista de espera: destino HTTPS real, sem credenciais.
export function getSalesState(config: Pick<typeof siteConfig, 'checkoutUrl' | 'waitlistUrl' | 'price' | 'paymentTerms' | 'platform' | 'accessPeriod' | 'delivery' | 'guarantee'>) {
  const complete = [config.price, config.paymentTerms, config.platform, config.accessPeriod, config.delivery, config.guarantee].every(value => value.trim());
  const checkout = complete ? validCheckout(config.checkoutUrl) : null;
  return { checkout, waitlist: validCheckout(config.waitlistUrl), ready: !!checkout };
}
