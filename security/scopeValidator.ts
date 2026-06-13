// ─────────────────────────────────────────────────────────────────────────────
// security/scopeValidator.ts
// Validação de Escopos e Tokens de Acesso
// Zero-Trust: valida QUEM acessa, O QUÊ acessa e se TEM DIREITO a acessar
// ─────────────────────────────────────────────────────────────────────────────

import type { SystemRole, Permission } from './rbac';
import { hasPermission, hasMinLevel } from './rbac';
import { AuditLogger, logPermissionDenied } from './auditLogger';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface SecurityContext {
  userId: string;       // email ou ID único do usuário
  role: SystemRole;
  cpf?: string;         // Para validação de isolamento de dados do cliente
  sessionId?: string;
  customPermissions?: Permission[];
  isImpersonating?: boolean; // Se está em modo espelho
  impersonatedBy?: string;   // Quem iniciou o espelho
}

export interface AccessResult {
  granted: boolean;
  reason: string;
  requiresMfa?: boolean;
}

// ─── Contexto de Segurança Global ─────────────────────────────────────────────
const SECURITY_CTX_KEY = 'legis_security_ctx';

export function setSecurityContext(ctx: SecurityContext): void {
  sessionStorage.setItem(SECURITY_CTX_KEY, JSON.stringify(ctx));
}

export function getSecurityContext(): SecurityContext | null {
  try {
    const raw = sessionStorage.getItem(SECURITY_CTX_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSecurityContext(): void {
  sessionStorage.removeItem(SECURITY_CTX_KEY);
}

// ─── Validação de Permissão ───────────────────────────────────────────────────
/**
 * Função principal de validação de acesso.
 * Verifica role + permissão + isolamento de dados.
 *
 * @param ctx - Contexto de segurança do usuário solicitante
 * @param permission - Permissão requerida para a ação
 * @param resourceOwnerId - ID do dono do recurso (para isolamento de dados)
 * @returns AccessResult com motivo legível
 */
export function validateAccess(
  ctx: SecurityContext | null,
  permission: Permission,
  resourceOwnerId?: string
): AccessResult {
  // 1. Sem contexto = acesso negado
  if (!ctx) {
    return { granted: false, reason: 'Sessão não autenticada. Faça login para continuar.' };
  }

  // 2. Verifica permissão da role
  const permitted = hasPermission(ctx.role, permission, ctx.customPermissions);
  if (!permitted) {
    logPermissionDenied(ctx.userId, ctx.role, permission);
    return {
      granted: false,
      reason: `Acesso negado: sua role '${ctx.role}' não possui a permissão '${permission}'.`
    };
  }

  // 3. Isolamento de dados: cliente só acessa seus próprios recursos
  if (ctx.role === 'client' && resourceOwnerId && resourceOwnerId !== ctx.userId) {
    logPermissionDenied(ctx.userId, ctx.role, `${permission}@${resourceOwnerId}`);
    return {
      granted: false,
      reason: 'Acesso negado: você só pode acessar seus próprios dados (LGPD Art. 18).'
    };
  }

  // 4. Ações financeiras exigem log adicional
  if (permission.startsWith('finance:')) {
    AuditLogger.log({
      action: 'FINANCIAL_DATA_ACCESSED',
      actorId: ctx.userId,
      actorRole: ctx.role,
      targetId: resourceOwnerId,
      details: `Acesso financeiro via permissão: ${permission}`,
      severity: 'INFO',
    });
  }

  // 5. Leitura de dados de processo — log de auditoria
  if (permission === 'registrations:read' && ctx.role !== 'super_admin') {
    AuditLogger.log({
      action: 'PROCESS_DATA_ACCESSED',
      actorId: ctx.userId,
      actorRole: ctx.role,
      targetId: resourceOwnerId,
      details: `Leitura de cadastro pelo colaborador ${ctx.userId}`,
      severity: 'INFO',
    });
  }

  return { granted: true, reason: 'Acesso autorizado.' };
}

// ─── Validação de Isolamento por CPF ─────────────────────────────────────────
/**
 * Garante que um cliente só acesse dados cujo CPF corresponde à sua sessão.
 * Implementa o requisito LGPD de isolamento transacional.
 */
export function validateCpfOwnership(
  ctx: SecurityContext | null,
  resourceCpf: string
): AccessResult {
  if (!ctx) return { granted: false, reason: 'Não autenticado.' };

  // Admin e staff podem acessar qualquer CPF
  if (hasMinLevel(ctx.role, 20)) {
    return { granted: true, reason: 'Acesso staff autorizado.' };
  }

  // Cliente: CPF deve corresponder ao da sessão
  if (ctx.cpf && ctx.cpf.replace(/\D/g, '') === resourceCpf.replace(/\D/g, '')) {
    return { granted: true, reason: 'CPF verificado. Acesso autorizado.' };
  }

  logPermissionDenied(ctx.userId, ctx.role, `cpf_ownership:${resourceCpf.slice(0, 3)}***`);
  return {
    granted: false,
    reason: 'Acesso negado: o CPF informado não corresponde ao titular da sessão (LGPD § Isolamento Transacional).'
  };
}

// ─── Guard de Impersonation ───────────────────────────────────────────────────
/**
 * Valida se um usuário pode iniciar o modo espelho (impersonation).
 * Apenas super_admin pode impersonar, com justificativa obrigatória.
 */
export function validateImpersonation(
  ctx: SecurityContext | null,
  targetUserId: string,
  justification: string
): AccessResult {
  if (!ctx) return { granted: false, reason: 'Não autenticado.' };

  if (!hasPermission(ctx.role, 'admin:impersonate')) {
    logPermissionDenied(ctx.userId, ctx.role, 'impersonation');
    return {
      granted: false,
      reason: 'Apenas Super Administradores podem ativar o Modo Espelho.'
    };
  }

  if (!justification || justification.trim().length < 20) {
    return {
      granted: false,
      reason: 'Justificativa obrigatória e deve ter no mínimo 20 caracteres para ativar o Modo Espelho.'
    };
  }

  if (targetUserId === ctx.userId) {
    return { granted: false, reason: 'Não é possível espelhar a própria sessão.' };
  }

  return { granted: true, reason: 'Impersonation autorizada. Log de auditoria registrado.' };
}

// ─── Middleware / Hook para uso em componentes React ─────────────────────────
/**
 * Hook utilitário que retorna um validador de acesso para o contexto atual.
 * Uso: const { can } = useAccessGuard(); if (!can('finance:read')) return null;
 */
export function createAccessGuard(ctx: SecurityContext | null) {
  return {
    can: (permission: Permission, resourceOwnerId?: string): boolean =>
      validateAccess(ctx, permission, resourceOwnerId).granted,

    canWithReason: (permission: Permission, resourceOwnerId?: string): AccessResult =>
      validateAccess(ctx, permission, resourceOwnerId),

    ownsCpf: (cpf: string): boolean =>
      validateCpfOwnership(ctx, cpf).granted,

    isAtLeastLevel: (level: number): boolean =>
      ctx ? hasMinLevel(ctx.role, level) : false,

    isStaff: (): boolean =>
      ctx ? hasMinLevel(ctx.role, 20) : false,

    isAdmin: (): boolean =>
      ctx ? hasMinLevel(ctx.role, 80) : false,

    isSuperAdmin: (): boolean =>
      ctx?.role === 'super_admin',
  };
}

// ─── Token de Scope (Simulação de OAuth2 Scope) ───────────────────────────────
/**
 * Gera um token de escopo simulado para comunicação inter-módulos.
 * Em produção: JWT assinado com RS256 via servidor.
 */
export function generateScopeToken(ctx: SecurityContext, scopes: Permission[]): string {
  const payload = {
    sub: ctx.userId,
    role: ctx.role,
    scopes,
    iat: Date.now(),
    exp: Date.now() + 30 * 60 * 1000, // 30 minutos
    sessionId: ctx.sessionId,
  };
  // Simulação — em prod: JWT.sign(payload, privateKey, { algorithm: 'RS256' })
  return `$scope$${btoa(JSON.stringify(payload))}`;
}

/**
 * Valida um token de escopo e retorna os dados se válido.
 */
export function validateScopeToken(
  token: string,
  requiredScope: Permission
): { valid: boolean; payload?: Record<string, unknown>; reason?: string } {
  try {
    if (!token.startsWith('$scope$')) {
      return { valid: false, reason: 'Token de formato inválido.' };
    }

    const payload = JSON.parse(atob(token.slice(7)));

    if (payload.exp < Date.now()) {
      return { valid: false, reason: 'Token expirado.' };
    }

    if (!Array.isArray(payload.scopes) || !payload.scopes.includes(requiredScope)) {
      return { valid: false, reason: `Token não possui o scope necessário: ${requiredScope}` };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'Token inválido ou corrompido.' };
  }
}
