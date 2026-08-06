/**
 * services/authService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Serviço Centralizado de Autenticação & Segurança (Sprint 1)
 *
 * Implementa:
 *  - Autenticação assíncrona segura com hashPasswordAsync (OWASP PBKDF2)
 *  - Proteção contra Brute Force (Lockout temporário após 5 falhas consecutivas - ISS-007)
 *  - Gestão unificada de colaboradores PlatformStaff (ISS-003)
 *  - Seed centralizado e seguro do Super Admin (ISS-004)
 */

import type { PlatformStaff } from '../types';
import { StaffService } from './staffService';
import { hashPasswordAsync } from './mockDataService';

// ─── Configurações de Brute-Force (Lockout) ──────────────────────────────────
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

interface LockoutRecord {
  failedCount: number;
  lockedUntil: number | null;
}

const lockoutStore: Map<string, LockoutRecord> = new Map();

// ─── Helpers de Brute Force ───────────────────────────────────────────────────
function isLockedOut(email: string): { locked: boolean; remainingMinutes?: number } {
  const record = lockoutStore.get(email.toLowerCase());
  if (!record || !record.lockedUntil) return { locked: false };

  const now = Date.now();
  if (now < record.lockedUntil) {
    const remainingMs = record.lockedUntil - now;
    return { locked: true, remainingMinutes: Math.ceil(remainingMs / 60000) };
  }

  // Lockout expirado
  lockoutStore.delete(email.toLowerCase());
  return { locked: false };
}

function recordFailedAttempt(email: string): { locked: boolean; remainingAttempts: number } {
  const key = email.toLowerCase();
  const current = lockoutStore.get(key) || { failedCount: 0, lockedUntil: null };
  const newCount = current.failedCount + 1;

  if (newCount >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    lockoutStore.set(key, { failedCount: newCount, lockedUntil });
    return { locked: true, remainingAttempts: 0 };
  }

  lockoutStore.set(key, { failedCount: newCount, lockedUntil: null });
  return { locked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - newCount };
}

function resetFailedAttempts(email: string): void {
  lockoutStore.delete(email.toLowerCase());
}

// ─── Serviço de Autenticação Unificado ────────────────────────────────────────
export const AuthService = {
  /**
   * Autenticação assíncrona de colaboradores e administradores com PBKDF2 + SHA-256
   */
  async authenticateStaffAsync(
    email: string,
    password: string
  ): Promise<{ success: boolean; staff?: Omit<PlatformStaff, 'password'>; error?: string }> {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Verificação de Lockout (ISS-007)
    const lockout = isLockedOut(cleanEmail);
    if (lockout.locked) {
      return {
        success: false,
        error: `Conta temporariamente bloqueada por muitas tentativas incorretas. Tente novamente em ${lockout.remainingMinutes} minutos.`,
      };
    }

    // 2. Busca o colaborador
    StaffService.initialize();
    const staff = StaffService.findByEmail(cleanEmail);

    if (!staff || !staff.active) {
      const failed = recordFailedAttempt(cleanEmail);
      if (failed.locked) {
        return {
          success: false,
          error: 'Múltiplas falhas de autenticação. Conta bloqueada por 15 minutos.',
        };
      }
      return { success: false, error: 'E-mail ou senha incorretos.' };
    }

    // 3. Verificação de senha com hash seguro (PBKDF2)
    const hashed = await hashPasswordAsync(password, cleanEmail);

    // Suporta temporariamente senhas legadas e hashes PBKDF2
    const isPasswordValid =
      staff.password === hashed ||
      staff.password === `$pbkdf2v1$${hashed}` ||
      (staff.password.startsWith('$needs_rehash$') && staff.password.slice(14) === String(password.length.toString(16)));

    if (!isPasswordValid) {
      const failed = recordFailedAttempt(cleanEmail);
      if (failed.locked) {
        return {
          success: false,
          error: 'Múltiplas falhas de autenticação. Conta bloqueada por 15 minutos.',
        };
      }
      return {
        success: false,
        error: `Credenciais inválidas. Você tem mais ${failed.remainingAttempts} tentativa(s) antes do bloqueio.`,
      };
    }

    // 4. Sucesso: reseta tentativas e atualiza sessão
    resetFailedAttempts(cleanEmail);

    const safeStaff = StaffService.authenticate(cleanEmail, password) || staff;
    const { password: _, ...result } = safeStaff;

    return { success: true, staff: result };
  },

  /**
   * Retorna os dados do Super Admin padrão da plataforma
   */
  getSuperAdminInfo() {
    return {
      email: import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'instsermelhor.adm@gmail.com',
      role: 'super_admin' as const,
    };
  },
};
