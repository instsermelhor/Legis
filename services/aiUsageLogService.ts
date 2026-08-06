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
