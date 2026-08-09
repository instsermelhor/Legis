/**
 * services/authService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Serviço Centralizado de Autenticação & Segurança
 *
 * Implementa:
 *  - Autenticação assíncrona segura com PBKDF2v2 (310k iterações) e legado PBKDF2v1
 *  - Proteção contra Brute Force com lockout progressivo
 *  - Detecção de primeiro acesso (must_change_password)
 *  - Fluxo de MFA (TOTP)
 *  - Gestão de sessões seguras
 *  - Integração com SecurityContext (scopeValidator)
 */

import type { PlatformStaff } from '../types';
import { StaffService } from './staffService';
import { hashPasswordAsync } from './mockDataService';
import { verifyPasswordHash } from '../security/passwordPolicy';
import { MfaService } from '../security/mfaService';
import { AuditLogger } from '../security/auditLogger';
import { setSecurityContext } from '../security/scopeValidator';
import type { SystemRole } from '../security/rbac';

// ─── Configurações de Brute-Force (Lockout Progressivo) ──────────────────────
const LOCKOUT_TIERS = [
  { maxAttempts: 3, lockoutMs: 5 * 60 * 1000 },       // 3 falhas → 5 min
  { maxAttempts: 5, lockoutMs: 15 * 60 * 1000 },       // 5 falhas → 15 min
  { maxAttempts: 8, lockoutMs: 60 * 60 * 1000 },       // 8 falhas → 1 hora
  { maxAttempts: 10, lockoutMs: 24 * 60 * 60 * 1000 }, // 10 falhas → 24 horas
];

interface LockoutRecord {
  failedCount: number;
  lockedUntil: number | null;
  tier: number; // índice atual em LOCKOUT_TIERS
}

const lockoutStore: Map<string, LockoutRecord> = new Map();

// ─── Resultado de autenticação ────────────────────────────────────────────────
export interface AuthResult {
  success: boolean;
  staff?: Omit<PlatformStaff, 'password'>;
  error?: string;
  requiresPasswordChange?: boolean; // must_change_password = true
  requiresMfa?: boolean;            // MFA habilitado → envia desafio
  mfaChallengeId?: string;          // ID do desafio MFA criado
}

// ─── Helpers de Brute Force ───────────────────────────────────────────────────
function isLockedOut(email: string): { locked: boolean; remainingMinutes?: number } {
  const record = lockoutStore.get(email.toLowerCase());
  if (!record?.lockedUntil) return { locked: false };

  const now = Date.now();
  if (now < record.lockedUntil) {
    return { locked: true, remainingMinutes: Math.ceil((record.lockedUntil - now) / 60000) };
  }
  // Lockout expirado — reseta contagem (não remove o tier)
  lockoutStore.set(email.toLowerCase(), { ...record, lockedUntil: null });
  return { locked: false };
}

function recordFailedAttempt(email: string): { locked: boolean; remainingAttempts: number } {
  const key = email.toLowerCase();
  const current = lockoutStore.get(key) || { failedCount: 0, lockedUntil: null, tier: 0 };
  const newCount = current.failedCount + 1;

  // Determina o tier de lockout apropriado
  let tierIdx = current.tier;
  for (let i = LOCKOUT_TIERS.length - 1; i >= 0; i--) {
    if (newCount >= LOCKOUT_TIERS[i].maxAttempts) {
      tierIdx = i;
      break;
    }
  }

  if (newCount >= LOCKOUT_TIERS[tierIdx].maxAttempts) {
    const lockedUntil = Date.now() + LOCKOUT_TIERS[tierIdx].lockoutMs;
    lockoutStore.set(key, { failedCount: newCount, lockedUntil, tier: Math.min(tierIdx + 1, LOCKOUT_TIERS.length - 1) });
    return { locked: true, remainingAttempts: 0 };
  }

  lockoutStore.set(key, { failedCount: newCount, lockedUntil: null, tier: tierIdx });
  const nextTierAttempts = LOCKOUT_TIERS[tierIdx].maxAttempts;
  return { locked: false, remainingAttempts: nextTierAttempts - newCount };
}

function resetFailedAttempts(email: string): void {
  lockoutStore.delete(email.toLowerCase());
}

// ─── Serviço de Autenticação Unificado ────────────────────────────────────────
export const AuthService = {
  /**
   * Autenticação assíncrona de colaboradores e administradores.
   * Suporta PBKDF2v2 (moderno) e PBKDF2v1 (legado via hashPasswordAsync).
   * Retorna informações sobre primeiro acesso e MFA.
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
        error: `Conta temporariamente bloqueada por muitas tentativas incorretas. Tente novamente em ${lockout.remainingMinutes} minuto(s).`,
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
          : `Tentativa de login com email não encontrado: ${cleanEmail}`,
        severity: failed.locked ? 'ERROR' : 'WARNING',
      });
      if (failed.locked) {
        return { success: false, error: 'Múltiplas falhas de autenticação. Conta bloqueada.' };
      }
      return { success: false, error: 'E-mail ou senha incorretos.' };
    }

    // 3. Verificação de senha — tenta PBKDF2v2 primeiro, depois legado PBKDF2v1
    let isPasswordValid = false;

    // Tenta PBKDF2v2 (novo — hash começa com $pbkdf2v2$)
    if (staff.password.startsWith('$pbkdf2v2$')) {
      isPasswordValid = await verifyPasswordHash(password, staff.password);
    }

    // Fallback: PBKDF2v1 legado (via hashPasswordAsync do mockDataService)
    if (!isPasswordValid) {
      const hashedLegacy = await hashPasswordAsync(password, cleanEmail);
      isPasswordValid =
        staff.password === hashedLegacy ||
        staff.password === `$pbkdf2v1$${hashedLegacy}` ||
        // Verificação de hash legado simples (hashPassword)
        staff.password === (await hashPasswordAsync(password, cleanEmail));
    }

    // Fallback final: hashPassword síncrono (para registros de seed antigos)
    if (!isPasswordValid) {
      const { hashPassword } = await import('./mockDataService');
      isPasswordValid = staff.password === hashPassword(password);
    }

    if (!isPasswordValid) {
      const failed = recordFailedAttempt(cleanEmail);
      AuditLogger.log({
        action: 'LOGIN_FAILURE',
        actorId: cleanEmail,
        actorRole: staff.role as SystemRole,
        details: failed.locked
          ? `Conta bloqueada: ${cleanEmail}`
          : `Senha incorreta para: ${cleanEmail} (${failed.remainingAttempts} tentativa(s) restante(s))`,
        severity: failed.locked ? 'ERROR' : 'WARNING',
        metadata: { attemptsRemaining: failed.remainingAttempts },
      });
      if (failed.locked) {
        return { success: false, error: 'Múltiplas falhas de autenticação. Conta bloqueada.' };
      }
      return {
        success: false,
        error: `Credenciais inválidas. Você tem mais ${failed.remainingAttempts} tentativa(s) antes do bloqueio.`,
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

    // 5. Verifica se primeiro acesso (must_change_password)
    if (staff.mustChangePassword) {
      AuditLogger.log({
        action: 'LOGIN_SUCCESS',
        actorId: cleanEmail,
        actorRole: staff.role as SystemRole,
        details: `Login com senha temporária — troca obrigatória exigida para: ${cleanEmail}`,
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
        details: `Credenciais válidas — desafio MFA criado para: ${cleanEmail}`,
        severity: 'INFO',
        metadata: { requiresMfa: true, mfaMethod: staff.mfaMethod },
      });
      return { success: true, staff: safeStaff, requiresMfa: true, mfaChallengeId: challenge.id };
    }

    // 7. Login completo — define SecurityContext (fix crítico)
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
        details: `Falha na verificação MFA para: ${staff.email}`,
        severity: 'WARNING',
        metadata: { mfaError: result.error, attemptsRemaining: result.attemptsRemaining },
      });
      return { success: false, error: result.error };
    }

    MfaService.clearChallenge(challengeId);
    const { password: _, ...safeStaff } = staff;

    // Define SecurityContext após MFA bem-sucedido
    this._setSecurityContextForStaff(safeStaff);

    AuditLogger.log({
      action: 'LOGIN_SUCCESS',
      actorId: staff.email,
      actorRole: staff.role as SystemRole,
      details: `Login completo com MFA para: ${staff.email}`,
      severity: 'INFO',
      metadata: { mfaVerified: true },
    });

    return { success: true, staff: safeStaff };
  },

  /**
   * Define o SecurityContext após login bem-sucedido.
   * Fix crítico: anteriormente nunca era chamado.
   */
  _setSecurityContextForStaff(staff: Omit<PlatformStaff, 'password'>): void {
    // Cria sessão
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
   * Retorna informações do Super Admin da plataforma (sem dados sensíveis).
   */
  getSuperAdminInfo() {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
    return {
      email: metaEnv?.VITE_SUPER_ADMIN_EMAIL || 'ribeiro.rikardo@gmail.com',
      role: 'super_admin' as const,
    };
  },
};
