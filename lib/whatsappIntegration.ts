/**
 * lib/whatsappIntegration.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Engine de Integração com WhatsApp Business API (Cloud API Meta / Z-API / Evolution)
 * Notificações multicanal automatizadas para clientes e advogados.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface WhatsAppMessageRequest {
  phone: string;
  templateType: 'prazo_audiencia' | 'contrato_assinado' | 'cobranca_pix' | 'movimentacao_processo';
  variables: Record<string, string>;
}

export interface WhatsAppMessageResponse {
  messageId: string;
  status: 'sent' | 'delivered' | 'failed';
  phone: string;
  sentAt: string;
}

/**
 * Prepara e formata o modelo de mensagem HSM do WhatsApp.
 */
export function formatWhatsAppMessage(
  templateType: WhatsAppMessageRequest['templateType'],
  vars: Record<string, string>
): string {
  switch (templateType) {
    case 'prazo_audiencia':
      return `⚖️ *LEGIS CONNECT — Lembrete de Audiência*\n\nOlá, *${vars.clientName || 'Cliente'}*!\n\nLembramos que sua audiência no processo *#${vars.caseNumber || '0000'}* está agendada para:\n📅 *Data:* ${vars.date || 'Hoje'}\n🕒 *Horário:* ${vars.time || '14:00'}\n📍 *Local/Link:* ${vars.location || 'Sala Virtual Google Meet'}\n\nEm caso de dúvidas, responda esta mensagem.`;
    
    case 'cobranca_pix':
      return `💳 *LEGIS CONNECT — Cobrança de Honorários*\n\nOlá, *${vars.clientName || 'Cliente'}*!\n\nA fatura referente aos honorários do processo *${vars.caseTitle || 'Jurídico'}* foi emitida:\n💰 *Valor:* R$ ${vars.amount || '0,00'}\n\nCopie a chave PIX abaixo para pagamento instantâneo:\n\`${vars.pixCode || '00020126...'}\`\n\nAgradecemos a confiança!`;

    case 'contrato_assinado':
      return `📄 *LEGIS CONNECT — Contrato Disponível*\n\nOlá, *${vars.clientName || 'Cliente'}*!\n\nSeu contrato de honorários advocatícios já foi gerado e está pronto para assinatura digital segura:\n🔗 *Acessar Contrato:* ${vars.contractUrl || 'https://legisconnect.com.br/contratos'}\n\nAssinatura com validade jurídica via certificado digital.`;

    case 'movimentacao_processo':
      return `🔔 *LEGIS CONNECT — Nova Movimentação Processual*\n\nProcesso: *${vars.caseTitle || 'Ação Cível'}*\nNúmero: *#${vars.caseNumber || '12345'}*\n\n*Novo Andamento:* ${vars.updateSummary || 'Petição juntada aos autos com sucesso.'}\n\nVocê pode acompanhar os detalhes no seu portal de cliente.`;

    default:
      return 'Notificação Legis Connect';
  }
}

/**
 * Envia notificação simulada via WhatsApp Business API Cloud.
 */
export async function sendWhatsAppNotification(
  req: WhatsAppMessageRequest
): Promise<WhatsAppMessageResponse> {
  // Simula latência de resposta da API do WhatsApp (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    messageId: `wamid.${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    status: 'sent',
    phone: req.phone,
    sentAt: new Date().toISOString(),
  };
}
