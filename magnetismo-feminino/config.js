/* Configure os dados reais quando estiverem disponíveis.
 * videoUrl: URL HTTPS de um arquivo MP4/WebM, YouTube ou Vimeo.
 * checkoutUrl: reservado para uma futura abertura de vendas. Atualmente o botão abre a Lista de Prioridade.
 * priorityEndpoint: URL da API de produção quando fornecida. Sem URL, usa POST /api/priority-list.
 * Envia JSON { name, whatsapp, email, consent }.
 * priorityResponseMode: 'http' aceita confirmação HTTP 2xx do webhook, inclusive sem corpo.
 * Sem esse modo, a API deve confirmar com { ok: true }.
 * offerEndsAt: data ISO com fuso, ex.: 2026-12-15T23:59:59-03:00.
 * Sem data, não é exibido contador. O prazo nunca reinicia por visitante.
 */
window.CLEOPATRA_CONFIG = {
  videoUrl: '',
  checkoutUrl: '',
  priorityEndpoint: 'https://api.datacrazy.io/v1/crm/api/crm/flows/webhooks/ea5ae026-31d9-47ef-804a-c8fa2c7dbf15/584a6865-495d-4168-9103-ac63c35f51ff',
  priorityResponseMode: 'http',
  offerEndsAt: ''
};
