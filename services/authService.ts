/**
 * services/authService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Serviço Centralizado de Autenticação & Segurança — Enterprise Edition
 *
 * Implementa:
 *  - Autenticação assíncrona exclusiva com PBKDF2v2 (310k iterações, OWASP 2024)
 *  - Proteção contra Brute Force com lockout progressivo (3→5→8→10 tentativas)
 *  - Detecção de primeiro acesso (mustChangePassword)
 *  - Fluxo de MFA (TOTP)
 *  - Contexto de segurança por sessão
 *  - Zero suporte a hash legado (segurança por design)
 */

import type { PlatformStaff } from '../types';
import { StaffService } from './staffService';
import { verifyPasswordHash } from '../security/passwordPolicy';
import { MfaService } from '../security/mfaService';
import { AuditLogger } from '../security/auditLogger';
import { setSecurityContext } from '../security/scopeValidator';
import type { SystemRole } from '../security/rbac';

// ─── Configurações de Brute-Force (Lockout Progressivo) ──────────────────────
const LOCKOUT_TIERS = [
  { maxAttempts: 3,  lockoutMs: 5  * 60 * 1000 },  // 3 falhas  → 5 min
  { maxAttempts: 5,  lockoutMs: 15 * 60 * 1000 },  // 5 falhas  → 15 min
  { maxAttempts: 8,  lockoutMs: 60 * 60 * 1000 },  // 8 falhas  → 1 hora
  { maxAttempts: 10, lockoutMs: 24 * 60 * 60 * 1000 }, // 10 falhas → 24 horas
];

interface LockoutRecord {
  failedCount: number;
  lockedUntil: number | null;
  lockedUntilIso?: string;
  tier: number;
}

const lockoutStore: Map<string, LockoutRecord> = new Map();

// ─── Resultado de autenticação ────────────────────────────────────────────────
export interface AuthResult {
  success: boolean;
  staff?: Omit<PlatformStaff, 'password'>;
  error?: string;
  requiresPasswordChange?: boolean;
  requiresMfa?: boolean;
  mfaChallengeId?: string;
  /** Tempo restante do lockout em segundos (para exibir contador) */
  lockoutRemainingSeconds?: number;
  /** Tentativas restantes antes do próximo lockout */
  remainingAttempts?: number;
}

// ─── Helpers de Brute Force ───────────────────────────────────────────────────
function isLockedOut(email: string): { locked: boolean; remainingSeconds?: number; remainingMinutes?: number } {
  const record = lockoutStore.get(email.toLowerCase());
  if (!record?.lockedUntil) return { locked: false };

  const now = Date.now();
  if (now < record.lockedUntil) {
    const remainingMs = record.lockedUntil - now;
    return {
      locked: true,
      remainingSeconds: Math.ceil(remainingMs / 1000),
      remainingMinutes: Math.ceil(remainingMs / 60000),
    };
  }
  // Lockout expirado — reseta sem remover o tier (tier persiste)
  lockoutStore.set(email.toLowerCase(), { ...record, lockedUntil: null, lockedUntilIso: undefined });
  return { locked: false };
}

function recordFailedAttempt(email: string): {
  locked: boolean;
  remainingAttempts: number;
  lockoutSeconds?: number;
} {
  const key = email.toLowerCase();
  const current = lockoutStore.get(key) || { failedCount: 0, lockedUntil: null, tier: 0 };
  const newCount = current.failedCount + 1;

  let tierIdx = current.tier;
  for (let i = LOCKOUT_TIERS.length - 1; i >= 0; i--) {
    if (newCount >= LOCKOUT_TIERS[i].maxAttempts) {
      tierIdx = i;
      break;
    }
  }

  if (newCount >= LOCKOUT_TIERS[tierIdx].maxAttempts) {
    const lockoutMs = LOCKOUT_TIERS[tierIdx].lockoutMs;
    const lockedUntil = Date.now() + lockoutMs;
    lockoutStore.set(key, {
      failedCount: newCount,
      lockedUntil,
      lockedUntilIso: new Date(lockedUntil).toISOString(),
      tier: Math.min(tierIdx + 1, LOCKOUT_TIERS.length - 1),
    });
    return { locked: true, remainingAttempts: 0, lockoutSeconds: Math.ceil(lockoutMs / 1000) };
  }

  lockoutStore.set(key, { failedCount: newCount, lockedUntil: null, tier: tierIdx });
  const nextTierAttempts = LOCKOUT_TIERS[tierIdx].maxAttempts;
  return { locked: false, remainingAttempts: nextTierAttempts - newCount };
}

function resetFailedAttempts(email: string): void {
  lockoutStore.delete(email.toLowerCase());
}

// ─── Expõe lockout store para a UI (somente leitura) ─────────────────────────
export function getLockoutInfo(email: string): {
  isLocked: boolean;
  remainingSeconds: number;
  failedCount: number;
} {
  const record = lockoutStore.get(email.toLowerCase());
  if (!record) return { isLocked: false, remainingSeconds: 0, failedCount: 0 };

  const now = Date.now();
  const isLocked = !!(record.lockedUntil && now < record.lockedUntil);
  const remainingSeconds = isLocked ? Math.ceil((record.lockedUntil! - now) / 1000) : 0;

  return { isLocked, remainingSeconds, failedCount: record.failedCount };
}

// ─── Serviço de Autenticação Unificado ────────────────────────────────────────
export const AuthService = {
  /**
   * Autenticação assíncrona de administradores — PBKDF2v2 exclusivo.
   * Sem suporte a hashes legados por design de segurança.
   */
  async authenticateStaffAsync(
    email: string,
    password: string
  ): Promise<AuthResult> {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Verificação de Lockout progressivo
    const lockout = isLockedOut(cleanEmail);
    if (lockout.locked) {
      return {
        success: false,
        error: `Acesso temporariamente bloqueado. Tente novamente em ${lockout.remainingMinutes} minuto(s).`,
        lockoutRemainingSeconds: lockout.remainingSeconds,
      };
    }

    // 2. Busca o colaborador
    StaffService.initialize();
    const staff = StaffService.findByEmail(cleanEmail);

    if (!staff || !staff.active) {
      const failed = recordFailedAttempt(cleanEmail);
      AuditLogger.log({
        action: 'LOGIN_FAILURE',
        actorId: cleanEmail,
        actorRole: 'staff_support_l1',
        details: failed.locked
          ? `Conta bloqueada após múltiplas falhas: ${cleanEmail}`
          : `Tentativa com email não autorizado: ${cleanEmail}`,
        severity: failed.locked ? 'ERROR' : 'WARNING',
        metadata: { attemptsRemaining: failed.remainingAttempts },
      });
      if (failed.locked) {
        return {
          success: false,
          error: 'Acesso bloqueado por múltiplas falhas. Aguarde antes de tentar novamente.',
          lockoutRemainingSeconds: failed.lockoutSeconds,
        };
      }
      // Mensagem genérica — não revela se o email existe
      return {
        success: false,
        error: 'E-mail ou senha incorretos.',
        remainingAttempts: failed.remainingAttempts,
      };
    }

    // 3. Verificação de senha — exclusivamente PBKDF2v2
    let isPasswordValid = false;

    if (staff.password.startsWith('$pbkdf2v2$')) {
      isPasswordValid = await verifyPasswordHash(password, staff.password);
    } else {
      // Senha em formato legado — nega acesso e força redefinição via suporte
      AuditLogger.log({
        action: 'LOGIN_FAILURE',
        actorId: cleanEmail,
        actorRole: staff.role as SystemRole,
        details: `Tentativa com hash legado bloqueada — credenciais devem ser regeneradas: ${cleanEmail}`,
        severity: 'ERROR',
        metadata: { hashFormat: 'legacy', action: 'blocked' },
      });
      return {
        success: false,
        error: 'Credenciais desatualizadas. Entre em contato com o suporte para redefinir o acesso.',
      };
    }

    if (!isPasswordValid) {
      const failed = recordFailedAttempt(cleanEmail);
      AuditLogger.log({
        action: 'LOGIN_FAILURE',
        actorId: cleanEmail,
        actorRole: staff.role as SystemRole,
        details: failed.locked
          ? `Conta bloqueada: ${cleanEmail}`
          : `Senha incorreta: ${cleanEmail} (${failed.remainingAttempts} tentativa(s) restante(s))`,
        severity: failed.locked ? 'ERROR' : 'WARNING',
        metadata: { attemptsRemaining: failed.remainingAttempts },
      });
      if (failed.locked) {
        return {
          success: false,
          error: 'Acesso bloqueado por múltiplas falhas. Aguarde antes de tentar novamente.',
          lockoutRemainingSeconds: failed.lockoutSeconds,
        };
      }
      return {
        success: false,
        error: `E-mail ou senha incorretos. ${failed.remainingAttempts} tentativa(s) restante(s).`,
        remainingAttempts: failed.remainingAttempts,
      };
    }

    // 4. Login bem-sucedido — reseta tentativas
    resetFailedAttempts(cleanEmail);

    // Atualiza lastLogin e loginCount
    const all = JSON.parse(localStorage.getItem('legis_platform_staff') || '[]') as PlatformStaff[];
    const idx = all.findIndex(s => s.id === staff.id);
    if (idx !== -1) {
      all[idx].lastLogin = new Date().toISOString();
      all[idx].loginCount = (all[idx].loginCount || 0) + 1;
      localStorage.setItem('legis_platform_staff', JSON.stringify(all));
    }

    const { password: _, ...safeStaff } = staff;

    // 5. Verifica se primeiro acesso (mustChangePassword)
    if (staff.mustChangePassword) {
      // Define contexto mínimo para permitir a troca de senha
      setSecurityContext({
        userId: cleanEmail,
        role: staff.role as SystemRole,
        sessionId: `temp_${Date.now()}`,
        customPermissions: [],
        isImpersonating: false,
      });

      AuditLogger.log({
        action: 'LOGIN_SUCCESS',
        actorId: cleanEmail,
        actorRole: staff.role as SystemRole,
        details: `Login com senha temporária — troca obrigatória exigida: ${cleanEmail}`,
        severity: 'WARNING',
        metadata: { requiresPasswordChange: true },
      });
      return { success: true, staff: safeStaff, requiresPasswordChange: true };
    }

    // 6. Verifica MFA
    if (staff.mfaEnabled && staff.mfaSecretEncrypted) {
      const challenge = MfaService.createChallenge(staff.id, staff.mfaMethod || 'TOTP');
      AuditLogger.log({
        action: 'LOGIN_SUCCESS',
        actorId: cleanEmail,
        actorRole: staff.role as SystemRole,
        details: `Credenciais válidas — desafio MFA iniciado: ${cleanEmail}`,
        severity: 'INFO',
        metadata: { requiresMfa: true, mfaMethod: staff.mfaMethod },
      });
      return { success: true, staff: safeStaff, requiresMfa: true, mfaChallengeId: challenge.id };
    }

    // 7. Login completo
    this._setSecurityContextForStaff(safeStaff);

    AuditLogger.log({
      action: 'LOGIN_SUCCESS',
      actorId: cleanEmail,
      actorRole: staff.role as SystemRole,
      details: `Login bem-sucedido: ${cleanEmail} (${staff.role})`,
      severity: 'INFO',
      metadata: { role: staff.role, accessLevel: staff.accessLevel },
    });

    return { success: true, staff: safeStaff };
  },

  /**
   * Completa o login após verificação de MFA.
   */
  async completeMfaLogin(
    staffId: string,
    challengeId: string,
    token: string
  ): Promise<AuthResult> {
    const staff = StaffService.findById(staffId);
    if (!staff) return { success: false, error: 'Usuário não encontrado.' };
    if (!staff.mfaSecretEncrypted) return { success: false, error: 'MFA não configurado.' };

    const result = await MfaService.verifyChallenge(challengeId, token, staff.mfaSecretEncrypted);

    if (!result.success) {
      AuditLogger.log({
        action: 'LOGIN_FAILURE',
        actorId: staff.email,
        actorRole: staff.role as SystemRole,
        details: `Falha na verificação MFA: ${staff.email}`,
        severity: 'WARNING',
        metadata: { mfaError: result.error, attemptsRemaining: result.attemptsRemaining },
      });
      return { success: false, error: result.error };
    }

    MfaService.clearChallenge(challengeId);
    const { password: _, ...safeStaff } = staff;
    this._setSecurityContextForStaff(safeStaff);

    AuditLogger.log({
      action: 'LOGIN_SUCCESS',
      actorId: staff.email,
      actorRole: staff.role as SystemRole,
      details: `Login completo com MFA: ${staff.email}`,
      severity: 'INFO',
      metadata: { mfaVerified: true },
    });

    return { success: true, staff: safeStaff };
  },

  /**
   * Define o SecurityContext após login bem-sucedido.
   */
  _setSecurityContextForStaff(staff: Omit<PlatformStaff, 'password'>): void {
    const session = StaffService.createSession(staff.id, staff.email);
    setSecurityContext({
      userId: staff.email,
      role: staff.role as SystemRole,
      sessionId: session.id,
      customPermissions: staff.permissions as never[],
      isImpersonating: false,
    });
  },

  /**
   * Retorna o email do Super Admin de produção (sem dados sensíveis).
   */
  getSuperAdminInfo() {
    return {
      email: 'legisconnectonline@gmail.com',
      role: 'super_admin' as const,
    };
  },
};
