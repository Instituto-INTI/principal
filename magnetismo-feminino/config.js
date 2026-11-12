/* Configure os dados reais quando estiverem disponíveis.
 * videoUrl: URL HTTPS de um arquivo MP4/WebM, YouTube ou Vimeo.
 * checkoutUrl: reservado para uma futura abertura de vendas. Atualmente o botão abre a Lista de Prioridade.
 * priorityEndpoint: URL da API de produção quando fornecida. Sem URL, usa POST /api/priority-list.
 * A API deve receber JSON { name, whatsapp, email, consent } e confirmar com { ok: true }.
 * offerEndsAt: data ISO com fuso, ex.: 2026-12-15T23:59:59-03:00.
 * Sem data, não é exibido contador. O prazo nunca reinicia por visitante.
 */
window.CLEOPATRA_CONFIG = {
  videoUrl: '',
  checkoutUrl: '',
  priorityEndpoint: '',
  offerEndsAt: ''
};
