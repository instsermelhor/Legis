/**
 * Legis Connect — Customer Health Score Calculator
 * Algoritmo de cálculo do Health Score por Tenant (0 a 100)
 * Padrão: Customer Success Operating Model (Prompt 226 - Etapa 12)
 */

export interface TenantMetrics {
  tenantId: string;
  activeUsersRatio: number;      // Ratio 0.0 a 1.0 (active_users / total_seats)
  monthlyCasesCreated: number;   // Quantidade de casos criados nos últimos 30 dias
  aiQueriesPerUser30d: number;   // Média de requisições AI Copilot por usuário
  hasOverdueInvoices: boolean;   // Inadimplência financeira
  lastNpsRating?: number;        // Nota NPS (0 a 10)
}

export interface HealthScoreResult {
  score: number;
  status: 'HEALTHY' | 'MEDIUM_RISK' | 'CRITICAL_RISK';
  breakdown: {
    adoption: number;
    aiUsage: number;
    payment: number;
    csat: number;
  };
  recommendedAction: string;
}

export function calculateHealthScore(metrics: TenantMetrics): HealthScoreResult {
  // 1. Adoção de Produto (peso 35%)
  const adoptionScore = Math.min(100, Math.round(
    (metrics.activeUsersRatio * 50) + (Math.min(metrics.monthlyCasesCreated, 20) / 20 * 50)
  ));

  // 2. Uso de Inteligência Artificial (peso 25%)
  const aiUsageScore = Math.min(100, Math.round((metrics.aiQueriesPerUser30d / 30) * 100));

  // 3. Pontualidade Financeira (peso 20%)
  const paymentScore = metrics.hasOverdueInvoices ? 0 : 100;

  // 4. Satisfação / VoC (peso 20%)
  const csatScore = metrics.lastNpsRating !== undefined ? (metrics.lastNpsRating / 10) * 100 : 80;

  // Cálculo ponderado
  const finalScore = Math.round(
    (adoptionScore * 0.35) +
    (aiUsageScore * 0.25) +
    (paymentScore * 0.20) +
    (csatScore * 0.20)
  );

  let status: 'HEALTHY' | 'MEDIUM_RISK' | 'CRITICAL_RISK' = 'HEALTHY';
  let recommendedAction = 'NURTURE_AND_EXPAND';

  if (finalScore < 50) {
    status = 'CRITICAL_RISK';
    recommendedAction = 'TRIGGER_HIGH_PRIORITY_CSM_INTERVENTION';
  } else if (finalScore < 75) {
    status = 'MEDIUM_RISK';
    recommendedAction = 'SEND_ENGAGEMENT_PLAYBOOK_EMAIL';
  }

  return {
    score: finalScore,
    status,
    breakdown: {
      adoption: adoptionScore,
      aiUsage: aiUsageScore,
      payment: paymentScore,
      csat: csatScore,
    },
    recommendedAction,
  };
}
