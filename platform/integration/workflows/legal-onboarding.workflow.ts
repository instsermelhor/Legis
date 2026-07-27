/**
 * Legis Connect — Temporal.io Durable Workflow
 * Orquestração durável de processo de integração de novo parceiro/escritório
 * Padrão: Workflow Integration Platform (Prompt 227 - Etapa 13)
 */

export interface PartnerInput {
  partnerId: string;
  name: string;
  email: string;
  oabNumber: string;
  oabSection: string;
  planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
}

// Interfaces de Atividades do Workflow
export interface PartnerActivities {
  verifyOAB(oabNumber: string, oabSection: string): Promise<boolean>;
  createTenantAccount(input: PartnerInput): Promise<string>;
  setupBilling(tenantId: string, planTier: string): Promise<void>;
  sendWelcomeKit(email: string, tenantId: string): Promise<void>;
}

export async function partnerOnboardingWorkflow(
  partnerData: PartnerInput,
  activities: PartnerActivities
): Promise<{ success: boolean; tenantId: string }> {
  // Step 1: Validação assíncrona da OAB
  const isValidOAB = await activities.verifyOAB(partnerData.oabNumber, partnerData.oabSection);
  if (!isValidOAB) {
    throw new Error(`Validação OAB falhou para ${partnerData.oabNumber}/${partnerData.oabSection}`);
  }

  // Step 2: Criar Tenant e Conta Financeira
  const tenantId = await activities.createTenantAccount(partnerData);
  await activities.setupBilling(tenantId, partnerData.planTier);

  // Step 3: Enviar Kit de Boas-Vindas
  await activities.sendWelcomeKit(partnerData.email, tenantId);

  return { success: true, tenantId };
}
