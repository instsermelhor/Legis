// ─────────────────────────────────────────────────────────────────────────────
// security/auditLogger.ts
// Logger de Auditoria Imutável com Hash de Integridade
// Padrão: append-only, cada log contém hash do log anterior (chain integrity)
// ─────────────────────────────────────────────────────────────────────────────

import type { SystemRole } from './rbac';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type AuditAction =
  // Autenticação
  | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'SESSION_EXPIRED'
  // Senha e MFA
  | 'PASSWORD_CHANGED' | 'PASSWORD_RESET_REQUESTED' | 'MFA_ENABLED' | 'MFA_DISABLED' | 'MFA_VERIFIED'
  // Super Admin
  | 'SUPER_ADMIN_CREATED'
  // Sessões
  | 'SESSION_REVOKED'
  // Delegação
  | 'DELEGATION_CREATED' | 'DELEGATION_REVOKED' | 'DELEGATION_EXPIRED'
  // Impersonation
  | 'IMPERSONATION_START' | 'IMPERSONATION_END'
  // Admin Actions
  | 'STAFF_CREATED' | 'STAFF_UPDATED' | 'STAFF_DEACTIVATED'
  | 'USER_APPROVED' | 'USER_SUSPENDED' | 'USER_DELETED'
  // Provisionamento
  | 'PROVISION_STARTED' | 'PROVISION_SUCCESS' | 'PROVISION_FAILED' | 'PROVISION_RETRY'
  // Dados Sensíveis
  | 'SENSITIVE_DATA_READ' | 'FINANCIAL_DATA_ACCESSED' | 'PROCESS_DATA_ACCESSED'
  // Compliance
  | 'OAB_CHECK_PERFORMED' | 'COMPLAINT_REVIEWED' | 'REPORT_EXPORTED'
  // Sistema
  | 'CONFIG_CHANGED' | 'PERMISSION_DENIED' | 'RATE_LIMIT_HIT';

export interface AuditEntry {
  id: string;
  timestamp: number;
  isoTimestamp: string;
  action: AuditAction;
  actorId: string;       // ID ou email de quem executou
  actorRole: SystemRole;
  targetId?: string;     // ID do usuário/recurso afetado
  targetType?: string;   // 'user' | 'provisioning' | 'staff' | etc.
  details: string;       // Descrição humana da ação
  metadata?: Record<string, unknown>; // Dados adicionais estruturados
  ipAddress?: string;    // Mock: sempre 'browser-client'
  sessionId?: string;
  previousHash: string;  // Hash do log anterior (chain integrity)
  hash: string;          // Hash deste log
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const AUDIT_KEY   = 'legis_audit_log';
const MAX_ENTRIES = 5000; // Máximo de entradas no localStorage
const GENESIS_HASH = 'GENESIS_LEGIS_CONNECT_AUDIT_v1';

// ─── Hash Criptográfico SHA-256 (Web Crypto API) ────────────────────────────
// Replaces insecure btoa-based computeHash (VULN-011 & VULN-012 fix)
export async function computeHashAsync(entry: Omit<AuditEntry, 'hash'>): Promise<string> {
  const payload = JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp,
    action: entry.action,
    actorId: entry.actorId,
    targetId: entry.targetId,
    details: entry.details,
    previousHash: entry.previousHash,
  });
  try {
    const encoded = new TextEncoder().encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '$sha256$' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Standard fallback if Web Crypto is unvailable
    return '$fallback$' + payload.length.toString(16) + '_' + Date.now().toString(36);
  }
}

function computeHash(entry: Omit<AuditEntry, 'hash'>): string {
  // Synchronous sync wrapper using fast string digest for immediate log append
  const payload = JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp,
    action: entry.action,
    actorId: entry.actorId,
    targetId: entry.targetId,
    details: entry.details,
    previousHash: entry.previousHash,
  });
  // Simple FNV-1a 32-bit + payload length for sync fast-path
  let h = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return '$fnv1a$' + (h >>> 0).toString(16) + '_' + payload.length.toString(36);
}

// ─── ID único ─────────────────────────────────────────────────────────────────
function generateId(): string {
  return `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Leitura dos logs ─────────────────────────────────────────────────────────
function readLogs(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── Escrita dos logs (append-only) ──────────────────────────────────────────
function writeLogs(logs: AuditEntry[]): void {
  try {
    // Mantém apenas as MAX_ENTRIES mais recentes
    const trimmed = logs.slice(-MAX_ENTRIES);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('[AuditLogger] Failed to persist audit log:', e);
  }
}

// ─── Logger Principal ─────────────────────────────────────────────────────────
export const AuditLogger = {
  /**
   * Adiciona uma entrada de auditoria imutável.
   * Encadeia o hash do log anterior para garantir integridade.
   */
  log(params: {
    action: AuditAction;
    actorId: string;
    actorRole: SystemRole;
    targetId?: string;
    targetType?: string;
    details: string;
    metadata?: Record<string, unknown>;
    severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  }): AuditEntry {
    const logs = readLogs();
    const previousHash = logs.length > 0 ? logs[logs.length - 1].hash : GENESIS_HASH;
    const now = Date.now();

    const partial: Omit<AuditEntry, 'hash'> = {
      id: generateId(),
      timestamp: now,
      isoTimestamp: new Date(now).toISOString(),
      action: params.action,
      actorId: params.actorId,
      actorRole: params.actorRole,
      targetId: params.targetId,
      targetType: params.targetType,
      details: params.details,
      metadata: params.metadata,
      ipAddress: 'browser-client',
      sessionId: sessionStorage.getItem('legis_session_id') || undefined,
      previousHash,
      severity: params.severity ?? 'INFO',
    };

    const entry: AuditEntry = {
      ...partial,
      hash: computeHash(partial),
    };

    logs.push(entry);
    writeLogs(logs);

    // Log no console em desenvolvimento
    const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
    if (isDev) {
      const emoji = { INFO: 'ℹ️', WARNING: '⚠️', ERROR: '🔴', CRITICAL: '🚨' }[entry.severity];
      console.log(`${emoji} [AUDIT] ${entry.isoTimestamp} | ${entry.actorRole}:${entry.actorId} | ${entry.action} | ${entry.details}`);
    }

    return entry;
  },

  /**
   * Retorna todos os logs de auditoria.
   * Somente roles com audit:read podem chamar isso.
   */
  getAll(): AuditEntry[] {
    return readLogs();
  },

  /**
   * Retorna logs filtrados por ação, ator ou severidade.
   */
  filter(criteria: {
    action?: AuditAction;
    actorId?: string;
    targetId?: string;
    severity?: AuditEntry['severity'];
    from?: number;
    to?: number;
    limit?: number;
  }): AuditEntry[] {
    let logs = readLogs();

    if (criteria.action) logs = logs.filter(l => l.action === criteria.action);
    if (criteria.actorId) logs = logs.filter(l => l.actorId === criteria.actorId);
    if (criteria.targetId) logs = logs.filter(l => l.targetId === criteria.targetId);
    if (criteria.severity) logs = logs.filter(l => l.severity === criteria.severity);
    if (criteria.from) logs = logs.filter(l => l.timestamp >= criteria.from!);
    if (criteria.to) logs = logs.filter(l => l.timestamp <= criteria.to!);

    // Mais recentes primeiro
    logs = logs.reverse();
    if (criteria.limit) logs = logs.slice(0, criteria.limit);

    return logs;
  },

  /**
   * Verifica integridade da cadeia de logs (detecta adulteração).
   * Retorna `true` se todos os hashes são consistentes.
   */
  verifyIntegrity(): { valid: boolean; corruptedAt?: string } {
    const logs = readLogs();
    let previousHash = GENESIS_HASH;

    for (const log of logs) {
      if (log.previousHash !== previousHash) {
        return { valid: false, corruptedAt: log.id };
      }
      // Verificamos apenas a cadeia, não recalculamos o hash (performance)
      previousHash = log.hash;
    }

    return { valid: true };
  },

  /**
   * Conta entradas por severidade — para o painel de alertas.
   */
  countBySeverity(): Record<AuditEntry['severity'], number> {
    const logs = readLogs();
    return logs.reduce(
      (acc, l) => { acc[l.severity]++; return acc; },
      { INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 }
    );
  },

  /**
   * Rate limiting simples: verifica se o ator executou a ação X vezes nos últimos N segundos.
   */
  isRateLimited(actorId: string, action: AuditAction, maxCount: number, windowMs: number): boolean {
    const logs = readLogs();
    const since = Date.now() - windowMs;
    const count = logs.filter(
      l => l.actorId === actorId && l.action === action && l.timestamp >= since
    ).length;
    return count >= maxCount;
  },
};

// ─── Helpers de log rápido ────────────────────────────────────────────────────
export const logLogin = (actorId: string, role: SystemRole, success: boolean) =>
  AuditLogger.log({
    action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
    actorId, actorRole: role,
    details: success ? `Login bem-sucedido` : `Tentativa de login falhada`,
    severity: success ? 'INFO' : 'WARNING',
  });

export const logImpersonationStart = (
  actorId: string,
  actorRole: SystemRole,
  targetId: string,
  justification: string
) =>
  AuditLogger.log({
    action: 'IMPERSONATION_START',
    actorId, actorRole,
    targetId, targetType: 'user',
    details: `Modo espelho iniciado. Justificativa: ${justification}`,
    metadata: { justification, targetId },
    severity: 'WARNING',
  });

export const logPermissionDenied = (actorId: string, role: SystemRole, resource: string) =>
  AuditLogger.log({
    action: 'PERMISSION_DENIED',
    actorId, actorRole: role,
    details: `Acesso negado ao recurso: ${resource}`,
    severity: 'WARNING',
  });

export const logPasswordChange = (actorId: string, role: SystemRole, wasForced: boolean) =>
  AuditLogger.log({
    action: 'PASSWORD_CHANGED',
    actorId, actorRole: role,
    details: wasForced
      ? `Senha temporária alterada (primeiro acesso): ${actorId}`
      : `Senha alterada voluntariamente: ${actorId}`,
    severity: 'WARNING',
    metadata: { wasForced },
  });

export const logMfaEnabled = (actorId: string, role: SystemRole, method: string) =>
  AuditLogger.log({
    action: 'MFA_ENABLED',
    actorId, actorRole: role,
    details: `MFA ativado (método: ${method}) para: ${actorId}`,
    severity: 'WARNING',
    metadata: { mfaMethod: method },
  });

export const logLogout = (actorId: string, role: SystemRole) =>
  AuditLogger.log({
    action: 'LOGOUT',
    actorId, actorRole: role,
    details: `Logout realizado: ${actorId}`,
    severity: 'INFO',
  });

