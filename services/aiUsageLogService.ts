/**
 * aiUsageLogService.ts — ISS-042
 *
 * Serviço de log de uso da IA (Gemini) por utilizador.
 * Regista cada chamada com: userId, model, prompt tokens (estimado),
 * timestamp e view de origem.
 *
 * Persiste em localStorage para o MVP; migrar para Supabase (tabela ai_usage_logs)
 * na Sprint 5 com a migração completa para Supabase.
 *
 * Schema de destino (Supabase):
 *   ai_usage_logs(id uuid, user_id text, model text, tokens_in int,
 *                 tokens_out int, view text, created_at timestamptz)
 */

const STORAGE_KEY = 'legis_ai_usage_logs';
const MAX_LOCAL_LOGS = 500; // evitar crescimento ilimitado de localStorage

export interface AiUsageLog {
  id: string;
  userId: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  view: string;
  createdAt: string;
}

function generateId(): string {
  return `aul_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Estima o número de tokens de uma string (aprox. 4 chars = 1 token) */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Regista uma chamada à IA */
export function logAiUsage(params: {
  userId: string;
  model: string;
  promptText: string;
  responseText: string;
  view: string;
}): AiUsageLog {
  const entry: AiUsageLog = {
    id: generateId(),
    userId: params.userId,
    model: params.model,
    tokensIn: estimateTokens(params.promptText),
    tokensOut: estimateTokens(params.responseText),
    view: params.view,
    createdAt: new Date().toISOString(),
  };

  const existing = getAiUsageLogs();
  const updated = [entry, ...existing].slice(0, MAX_LOCAL_LOGS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return entry;
}

/** Obtém todos os logs de uso da IA */
export function getAiUsageLogs(): AiUsageLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Obtém logs de um utilizador específico */
export function getAiUsageLogsByUser(userId: string): AiUsageLog[] {
  return getAiUsageLogs().filter((log) => log.userId === userId);
}

/** Estatísticas agregadas de uso da IA */
export function getAiUsageStats(userId?: string): {
  totalCalls: number;
  totalTokensIn: number;
  totalTokensOut: number;
  last30DaysCalls: number;
} {
  const logs = userId ? getAiUsageLogsByUser(userId) : getAiUsageLogs();
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    totalCalls: logs.length,
    totalTokensIn: logs.reduce((s, l) => s + l.tokensIn, 0),
    totalTokensOut: logs.reduce((s, l) => s + l.tokensOut, 0),
    last30DaysCalls: logs.filter((l) => l.createdAt >= cutoff).length,
  };
}

/** Limpa logs mais antigos que N dias */
export function pruneAiUsageLogs(olderThanDays = 90): void {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();
  const filtered = getAiUsageLogs().filter((l) => l.createdAt >= cutoff);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// ─────────────────────────────────────────────────────────────────────────────
// Quota Management & 80% Threshold Alert Engine
// ─────────────────────────────────────────────────────────────────────────────

const QUOTA_CONFIG_KEY = 'legis_ai_quota_config';

export interface AiQuotaConfig {
  monthlyQuotaTokens: number;      // Padrão: 2.000.000 tokens/mês
  alertThresholdPercent: number;   // Padrão: 80%
  criticalThresholdPercent: number;// Padrão: 95%
  hardLimitEnabled: boolean;       // Bloquear ao atingir 100%
}

export interface AiQuotaStatus {
  monthlyQuotaTokens: number;
  usedTokensCurrentMonth: number;
  remainingTokens: number;
  percentageUsed: number;
  status: 'NORMAL' | 'WARNING_80' | 'CRITICAL_95' | 'EXCEEDED';
  alertTriggered: boolean;
  message: string;
}

export const DEFAULT_AI_QUOTA_CONFIG: AiQuotaConfig = {
  monthlyQuotaTokens: 2_000_000,
  alertThresholdPercent: 80,
  criticalThresholdPercent: 95,
  hardLimitEnabled: true,
};

export function getAiQuotaConfig(): AiQuotaConfig {
  try {
    const raw = localStorage.getItem(QUOTA_CONFIG_KEY);
    return raw ? { ...DEFAULT_AI_QUOTA_CONFIG, ...JSON.parse(raw) } : DEFAULT_AI_QUOTA_CONFIG;
  } catch {
    return DEFAULT_AI_QUOTA_CONFIG;
  }
}

export function saveAiQuotaConfig(config: Partial<AiQuotaConfig>): AiQuotaConfig {
  const current = getAiQuotaConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(QUOTA_CONFIG_KEY, JSON.stringify(updated));
  return updated;
}

/** Calcula o status da cota mensal com base no consumo desde o primeiro dia do mês corrente */
export function getAiMonthlyQuotaStatus(): AiQuotaStatus {
  const config = getAiQuotaConfig();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const logs = getAiUsageLogs();
  const currentMonthLogs = logs.filter((l) => l.createdAt >= startOfMonth);
  const usedTokens = currentMonthLogs.reduce((acc, l) => acc + l.tokensIn + l.tokensOut, 0);

  const percentageUsed = config.monthlyQuotaTokens > 0
    ? Math.min(100, Number(((usedTokens / config.monthlyQuotaTokens) * 100).toFixed(1)))
    : 0;

  const remainingTokens = Math.max(0, config.monthlyQuotaTokens - usedTokens);

  let status: AiQuotaStatus['status'] = 'NORMAL';
  let alertTriggered = false;
  let message = 'Consumo dentro dos limites operacionais normais.';

  if (percentageUsed >= 100) {
    status = 'EXCEEDED';
    alertTriggered = true;
    message = 'ALERTA CRÍTICO: Cota mensal de 100% de tokens foi atingida! Modo de proteção contra sobrecarga ativado.';
  } else if (percentageUsed >= config.criticalThresholdPercent) {
    status = 'CRITICAL_95';
    alertTriggered = true;
    message = `ALERTA DE SEGURANÇA: Consumo de tokens atingiu ${percentageUsed}% da cota mensal (limite crítico de ${config.criticalThresholdPercent}%).`;
  } else if (percentageUsed >= config.alertThresholdPercent) {
    status = 'WARNING_80';
    alertTriggered = true;
    message = `AVISO PREVENTIVO: Consumo de tokens atingiu ${percentageUsed}% da cota mensal (limite de atenção de ${config.alertThresholdPercent}%).`;
  }

  return {
    monthlyQuotaTokens: config.monthlyQuotaTokens,
    usedTokensCurrentMonth: usedTokens,
    remainingTokens,
    percentageUsed,
    status,
    alertTriggered,
    message,
  };
}

/** Valida se a chamada de IA é permitida antes da execução */
export function validateAiCallQuota(): { allowed: boolean; reason?: string } {
  const quota = getAiMonthlyQuotaStatus();
  const config = getAiQuotaConfig();

  if (config.hardLimitEnabled && quota.status === 'EXCEEDED') {
    return {
      allowed: false,
      reason: 'Cota mensal de tokens de IA esgotada. Contate o administrador do sistema para expansão.',
    };
  }

  return { allowed: true };
}

