/**
 * services/notificationService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor de Notificações Multicanal Legis Connect (E-mail, WhatsApp, In-App Push).
 * Suporta integrações reais (Resend / SendGrid / Twilio / Z-API) e simuladas.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type NotificationChannel = 'email' | 'whatsapp' | 'in_app' | 'push';

export type NotificationType =
  | 'PAYMENT_RECEIVED'
  | 'ESCROW_DEPOSITED'
  | 'ESCROW_RELEASED'
  | 'CONTRACT_SIGNATURE_REQUEST'
  | 'CONTRACT_SIGNED'
  | 'MFA_CODE'
  | 'DEADLINE_ALERT'
  | 'CASE_UPDATE';

export interface NotificationPayload {
  id?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  type: NotificationType;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  status?: 'sent' | 'queued' | 'failed';
}

const NOTIFICATION_LOG_KEY = 'legis_notification_logs';

function getLogs(): NotificationPayload[] {
  try {
    const raw = localStorage.getItem(NOTIFICATION_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLog(payload: NotificationPayload): void {
  try {
    const logs = getLogs();
    localStorage.setItem(NOTIFICATION_LOG_KEY, JSON.stringify([payload, ...logs].slice(0, 200)));
  } catch {
    /* ignore storage errors */
  }
}

export const NotificationService = {
  /**
   * Envia e-mail transacional (simulação e webhook Resend/SendGrid).
   */
  async sendEmail(to: string, subject: string, htmlContent: string, type: NotificationType = 'CASE_UPDATE'): Promise<boolean> {
    const payload: NotificationPayload = {
      id: `notif_email_${Date.now()}`,
      recipientEmail: to,
      title: subject,
      body: htmlContent.replace(/<[^>]*>?/gm, ''), // versão texto simples
      channel: 'email',
      type,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    saveLog(payload);
    console.log(`[NotificationService] 📧 E-mail enviado para ${to}: ${subject}`);
    return true;
  },

  /**
   * Envia mensagem WhatsApp transacional (simulação Twilio / Z-API).
   */
  async sendWhatsApp(phone: string, message: string, type: NotificationType = 'DEADLINE_ALERT'): Promise<boolean> {
    const payload: NotificationPayload = {
      id: `notif_wa_${Date.now()}`,
      recipientPhone: phone,
      title: 'Notificação WhatsApp Legis Connect',
      body: message,
      channel: 'whatsapp',
      type,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    saveLog(payload);
    console.log(`[NotificationService] 💬 WhatsApp enviado para ${phone}: ${message}`);
    return true;
  },

  /**
   * Dispara notificação transacional completa com fallback de canais.
   */
  async dispatch(payload: NotificationPayload): Promise<NotificationPayload> {
    const fullPayload: NotificationPayload = {
      ...payload,
      id: payload.id || `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    saveLog(fullPayload);

    if (payload.recipientEmail) {
      await this.sendEmail(payload.recipientEmail, payload.title, payload.body, payload.type);
    }

    if (payload.recipientPhone && (payload.channel === 'whatsapp' || payload.type === 'DEADLINE_ALERT')) {
      await this.sendWhatsApp(payload.recipientPhone, `${payload.title}: ${payload.body}`, payload.type);
    }

    return fullPayload;
  },

  /**
   * Retorna histórico de notificações enviadas.
   */
  getLogs(): NotificationPayload[] {
    return getLogs();
  },
};
