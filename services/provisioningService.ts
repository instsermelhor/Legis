// ─────────────────────────────────────────────────────────────────────────────
// services/provisioningService.ts
// Motor Universal de Provisionamento de Serviços (Fulfillment Engine)
// Simula o fluxo: Pagamento → State Machine → Liberação de Acesso
// Compatível com Stripe / PagarMe (substitua processPaymentWebhook por handler HTTP real)
// ─────────────────────────────────────────────────────────────────────────────

import { AuditLogger } from '../security/auditLogger';
import type { ServiceProvisioning, ProvisioningStatus, ServiceProvisioningGroup } from '../types';

// ─── Constantes ───────────────────────────────────────────────────────────────
const PROVISIONING_KEY = 'legis_service_provisionings';
const LAWYER_CREDITS_KEY = 'legis_lawyer_credits';
const CLIENT_FEATURES_KEY = 'legis_client_features';
const INTERN_FEATURES_KEY = 'legis_intern_features';

// ─── SLA de Entrega ───────────────────────────────────────────────────────────
const PROVISION_SLA_MS = 30_000; // 30 segundos de timeout para APIs externas (simulado)

// ─── CRUD de Provisionamentos ─────────────────────────────────────────────────
function readProvisionings(): ServiceProvisioning[] {
  try {
    const raw = localStorage.getItem(PROVISIONING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeProvisionings(items: ServiceProvisioning[]): void {
  localStorage.setItem(PROVISIONING_KEY, JSON.stringify(items));
}

function generateProvisionId(): string {
  return `prov_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Provisionamento por Grupo ─────────────────────────────────────────────────

/**
 * Provisiona serviço para CLIENTE:
 * - Rastreio via CPF
 * - Documento via IA
 * - Acesso a consulta jurídica
 */
async function provisionForClient(prov: ServiceProvisioning): Promise<void> {
  const features: Record<string, unknown> = {};
  try {
    const existing = localStorage.getItem(CLIENT_FEATURES_KEY);
    const all = existing ? JSON.parse(existing) : {};
    const userFeatures = all[prov.userId] || {};

    // Libera funcionalidade baseada no serviceId
    switch (prov.serviceId) {
      case 'cpf-rastreio':
      case 'rastreio-automatizado':
        features['cpf_tracking'] = true;
        features['cpf_tracking_limit'] = (userFeatures.cpf_tracking_limit || 0) + 3;
        break;
      case 'documento-ia':
      case 'peticao-ia':
        features['ai_documents'] = true;
        features['ai_document_credits'] = (userFeatures.ai_document_credits || 0) + 5;
        break;
      case 'consulta-premium':
        features['premium_consultation'] = true;
        features['premium_slots'] = (userFeatures.premium_slots || 0) + 1;
        break;
      default:
        features['service_' + prov.serviceId] = true;
    }

    all[prov.userId] = { ...userFeatures, ...features, updatedAt: Date.now() };
    localStorage.setItem(CLIENT_FEATURES_KEY, JSON.stringify(all));
  } catch (e) {
    throw new Error(`Falha ao provisionar para cliente: ${e}`);
  }
}

/**
 * Provisiona serviço para ADVOGADO:
 * - Tokens de IA
 * - Robôs de push para tribunais
 * - Acesso a módulos premium
 */
async function provisionForLawyer(prov: ServiceProvisioning): Promise<void> {
  try {
    const existing = localStorage.getItem(LAWYER_CREDITS_KEY);
    const all = existing ? JSON.parse(existing) : {};
    const credits = all[prov.userId] || {};

    switch (prov.serviceId) {
      case 'tokens-ia':
      case 'ia-premium':
        credits['ai_tokens'] = (credits.ai_tokens || 0) + 1000;
        break;
      case 'robos-tribunal':
      case 'push-tribunal':
        credits['tribunal_bots'] = (credits.tribunal_bots || 0) + 1;
        credits['tribunal_bot_ids'] = [...(credits.tribunal_bot_ids || []), generateProvisionId()];
        break;
      case 'clientes-ilimitados':
        credits['client_limit'] = 9999;
        break;
      case 'agenda-premium':
        credits['premium_calendar'] = true;
        break;
      default:
        credits['service_' + prov.serviceId] = true;
    }

    credits['updatedAt'] = Date.now();
    all[prov.userId] = credits;
    localStorage.setItem(LAWYER_CREDITS_KEY, JSON.stringify(all));
  } catch (e) {
    throw new Error(`Falha ao provisionar para advogado: ${e}`);
  }
}

/**
 * Provisiona serviço para BACHARELANDO:
 * - Simulador OAB avançado
 * - Mentorias
 * - Casos reais
 */
async function provisionForIntern(prov: ServiceProvisioning): Promise<void> {
  try {
    const existing = localStorage.getItem(INTERN_FEATURES_KEY);
    const all = existing ? JSON.parse(existing) : {};
    const features = all[prov.userId] || {};

    switch (prov.serviceId) {
      case 'simulador-oab':
        features['oab_simulator_advanced'] = true;
        features['oab_simulator_expiry'] = Date.now() + 365 * 24 * 60 * 60 * 1000;
        break;
      case 'mentoria-premium':
        features['mentorship_sessions'] = (features.mentorship_sessions || 0) + 3;
        break;
      case 'casos-reais':
        features['real_cases_access'] = true;
        features['real_cases_limit'] = (features.real_cases_limit || 0) + 10;
        break;
      default:
        features['service_' + prov.serviceId] = true;
    }

    features['updatedAt'] = Date.now();
    all[prov.userId] = features;
    localStorage.setItem(INTERN_FEATURES_KEY, JSON.stringify(all));
  } catch (e) {
    throw new Error(`Falha ao provisionar para bacharelando: ${e}`);
  }
}

// ─── State Machine de Provisionamento ────────────────────────────────────────
/**
 * Transição de estados:
 * PENDING → IN_PROGRESS → PROVISIONED
 *                       ↘ PROVISION_FAILED (com SLA + retry)
 */
async function runProvisioningStateMachine(prov: ServiceProvisioning): Promise<void> {
  const provisionings = readProvisionings();
  const idx = provisionings.findIndex(p => p.id === prov.id);
  if (idx === -1) return;

  // PENDING → IN_PROGRESS
  provisionings[idx].status = 'IN_PROGRESS';
  provisionings[idx].updatedAt = new Date().toISOString();
  writeProvisionings(provisionings);

  try {
    // Simula latência de API externa (50-300ms)
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 250));

    // Simula falha aleatória de 5% para demonstrar o fluxo de erro
    if (Math.random() < 0.05) {
      throw new Error('API do tribunal temporariamente indisponível (simulado)');
    }

    // Executa provisionamento por grupo
    switch (prov.group) {
      case 'client':   await provisionForClient(prov);  break;
      case 'lawyer':   await provisionForLawyer(prov);  break;
      case 'intern':   await provisionForIntern(prov);  break;
      case 'secretary': await provisionForClient(prov); break; // Secretário usa fluxo de cliente
    }

    // IN_PROGRESS → PROVISIONED
    const updated = readProvisionings();
    const i = updated.findIndex(p => p.id === prov.id);
    if (i !== -1) {
      updated[i].status = 'PROVISIONED';
      updated[i].updatedAt = new Date().toISOString();
      updated[i].provisionedAt = new Date().toISOString();
      updated[i].errorMessage = undefined;
      writeProvisionings(updated);
    }

    AuditLogger.log({
      action: 'PROVISION_SUCCESS',
      actorId: 'system',
      actorRole: 'super_admin',
      targetId: prov.userId,
      targetType: 'provisioning',
      details: `Serviço '${prov.serviceTitle}' provisionado com sucesso para ${prov.group} ${prov.userId}`,
      metadata: { provisioningId: prov.id, serviceId: prov.serviceId, group: prov.group },
      severity: 'INFO',
    });

  } catch (error) {
    // IN_PROGRESS → PROVISION_FAILED
    const updated = readProvisionings();
    const i = updated.findIndex(p => p.id === prov.id);
    if (i !== -1) {
      updated[i].status = 'PROVISION_FAILED';
      updated[i].updatedAt = new Date().toISOString();
      updated[i].errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      updated[i].retryCount = (updated[i].retryCount || 0);
      writeProvisionings(updated);
    }

    AuditLogger.log({
      action: 'PROVISION_FAILED',
      actorId: 'system',
      actorRole: 'super_admin',
      targetId: prov.userId,
      targetType: 'provisioning',
      details: `FALHA ao provisionar '${prov.serviceTitle}' para ${prov.userId}: ${error instanceof Error ? error.message : 'Erro'}`,
      metadata: { provisioningId: prov.id, error: String(error) },
      severity: 'ERROR',
    });
  }
}

// ─── API Principal ─────────────────────────────────────────────────────────────
export const ProvisioningService = {
  /**
   * Processa o webhook de pagamento confirmado.
   * Endpoint equivalente: POST /api/webhooks/payment-success
   *
   * Payload compatível com Stripe (invoice.paid) e PagarMe (charge.successful).
   */
  async processPaymentWebhook(payload: {
    event: 'invoice.paid' | 'charge.successful' | 'payment.confirmed';
    paymentId: string;
    userId: string;
    userEmail: string;
    group: ServiceProvisioningGroup;
    serviceId: string;
    serviceTitle: string;
    amount: number; // em centavos
    currency?: string;
    metadata?: Record<string, string>;
  }): Promise<ServiceProvisioning> {
    // Idempotência: verifica se já foi processado
    const existing = readProvisionings().find(p => p.paymentId === payload.paymentId);
    if (existing) {
      console.warn('[Provisioning] Webhook duplicado ignorado:', payload.paymentId);
      return existing;
    }

    const prov: ServiceProvisioning = {
      id: generateProvisionId(),
      paymentId: payload.paymentId,
      userId: payload.userId,
      userEmail: payload.userEmail,
      group: payload.group,
      serviceId: payload.serviceId,
      serviceTitle: payload.serviceTitle,
      amount: payload.amount / 100, // converte centavos para reais
      currency: payload.currency || 'BRL',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retryCount: 0,
      metadata: payload.metadata,
    };

    // Persiste estado PENDING
    const all = readProvisionings();
    all.push(prov);
    writeProvisionings(all);

    AuditLogger.log({
      action: 'PROVISION_STARTED',
      actorId: 'payment-gateway',
      actorRole: 'super_admin',
      targetId: payload.userId,
      details: `Pagamento confirmado: ${payload.event} | ${payload.serviceTitle} | R$ ${prov.amount.toFixed(2)}`,
      metadata: { provisioningId: prov.id, paymentId: payload.paymentId },
      severity: 'INFO',
    });

    // Executa state machine de forma assíncrona (fire-and-forget)
    runProvisioningStateMachine(prov).catch(e =>
      console.error('[Provisioning] State machine error:', e)
    );

    return prov;
  },

  /**
   * Retenta um provisionamento que falhou.
   * Máximo de 3 tentativas (SLA fallback).
   */
  async retryProvisioning(provisioningId: string): Promise<{ success: boolean; message: string }> {
    const all = readProvisionings();
    const idx = all.findIndex(p => p.id === provisioningId);

    if (idx === -1) return { success: false, message: 'Provisionamento não encontrado.' };

    const prov = all[idx];
    if (prov.status !== 'PROVISION_FAILED') {
      return { success: false, message: `Só é possível retentar provisionamentos com status PROVISION_FAILED. Status atual: ${prov.status}` };
    }

    const MAX_RETRIES = 3;
    if ((prov.retryCount || 0) >= MAX_RETRIES) {
      return { success: false, message: `Limite de ${MAX_RETRIES} tentativas atingido. Contate o suporte.` };
    }

    // Incrementa contador e volta para PENDING
    all[idx].retryCount = (all[idx].retryCount || 0) + 1;
    all[idx].status = 'PENDING';
    all[idx].updatedAt = new Date().toISOString();
    all[idx].errorMessage = undefined;
    writeProvisionings(all);

    AuditLogger.log({
      action: 'PROVISION_RETRY',
      actorId: 'admin',
      actorRole: 'super_admin',
      targetId: prov.userId,
      details: `Retentativa ${all[idx].retryCount}/${MAX_RETRIES} para provisionamento ${provisioningId}`,
      severity: 'WARNING',
    });

    // Re-executa
    runProvisioningStateMachine(all[idx]).catch(console.error);

    return { success: true, message: `Retentativa ${all[idx].retryCount}/${MAX_RETRIES} iniciada.` };
  },

  /** Retorna todos os provisionamentos. */
  getAll(): ServiceProvisioning[] {
    return readProvisionings().reverse(); // mais recentes primeiro
  },

  /** Retorna provisionamentos filtrados. */
  filter(criteria: {
    userId?: string;
    group?: ServiceProvisioningGroup;
    status?: ProvisioningStatus;
  }): ServiceProvisioning[] {
    let items = readProvisionings();
    if (criteria.userId) items = items.filter(p => p.userId === criteria.userId);
    if (criteria.group) items = items.filter(p => p.group === criteria.group);
    if (criteria.status) items = items.filter(p => p.status === criteria.status);
    return items.reverse();
  },

  /** Retorna os KPIs para o painel administrativo. */
  getKpis(): {
    total: number;
    provisioned: number;
    inProgress: number;
    failed: number;
    pending: number;
    totalRevenue: number;
    failedRevenue: number;
  } {
    const all = readProvisionings();
    return {
      total: all.length,
      provisioned: all.filter(p => p.status === 'PROVISIONED').length,
      inProgress: all.filter(p => p.status === 'IN_PROGRESS').length,
      failed: all.filter(p => p.status === 'PROVISION_FAILED').length,
      pending: all.filter(p => p.status === 'PENDING').length,
      totalRevenue: all.filter(p => p.status === 'PROVISIONED').reduce((s, p) => s + p.amount, 0),
      failedRevenue: all.filter(p => p.status === 'PROVISION_FAILED').reduce((s, p) => s + p.amount, 0),
    };
  },

  /** Verifica se um usuário tem acesso a um serviço específico. */
  hasActiveService(userId: string, serviceId: string): boolean {
    return readProvisionings().some(
      p => p.userId === userId && p.serviceId === serviceId && p.status === 'PROVISIONED'
    );
  },

  /** Retorna créditos do advogado (IA tokens, bots de tribunal, etc.). */
  getLawyerCredits(userId: string): Record<string, unknown> {
    try {
      const all = localStorage.getItem(LAWYER_CREDITS_KEY);
      if (!all) return {};
      const parsed = JSON.parse(all);
      return parsed[userId] || {};
    } catch { return {}; }
  },

  /** Retorna funcionalidades desbloqueadas do cliente. */
  getClientFeatures(userId: string): Record<string, unknown> {
    try {
      const all = localStorage.getItem(CLIENT_FEATURES_KEY);
      if (!all) return {};
      const parsed = JSON.parse(all);
      return parsed[userId] || {};
    } catch { return {}; }
  },

  /** Retorna funcionalidades desbloqueadas do bacharelando. */
  getInternFeatures(userId: string): Record<string, unknown> {
    try {
      const all = localStorage.getItem(INTERN_FEATURES_KEY);
      if (!all) return {};
      const parsed = JSON.parse(all);
      return parsed[userId] || {};
    } catch { return {}; }
  },

  /**
   * Simula um pagamento (para uso em demonstração e testes).
   * Em produção: substituir pela chamada real ao webhook handler HTTP.
   */
  async simulatePayment(params: {
    userId: string;
    userEmail: string;
    group: ServiceProvisioningGroup;
    serviceId: string;
    serviceTitle: string;
    amount: number;
  }): Promise<ServiceProvisioning> {
    return this.processPaymentWebhook({
      event: 'payment.confirmed',
      paymentId: `pay_sim_${Date.now().toString(36)}`,
      ...params,
    });
  },
};
