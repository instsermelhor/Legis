// ─────────────────────────────────────────────────────────────────────────────
// security/recoveryProtection.ts
// Proteção contra Perda do Controle Administrativo
// Garante que a plataforma sempre tenha ao menos 1 Super Admin ativo
// ─────────────────────────────────────────────────────────────────────────────

import type { StaffRole } from '../types';
import { AuditLogger } from './auditLogger';

// ─── Constantes ───────────────────────────────────────────────────────────────
const STAFF_KEY = 'legis_platform_staff';
const MIN_SUPER_ADMINS = 1; // Mínimo de super admins ativos na plataforma

interface StaffMinimal {
  id: string;
  email: string;
  role: StaffRole;
  active: boolean;
}

function readStaffMinimal(): StaffMinimal[] {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── Verificações de Proteção ─────────────────────────────────────────────────
export const RecoveryProtection = {
  /**
   * Verifica se existe pelo menos 1 super_admin ativo na plataforma.
   * Retorna true se a plataforma está protegida.
   */
  ensureAdminExists(): boolean {
    const staff = readStaffMinimal();
    const activeSuperAdmins = staff.filter(s => s.role === 'super_admin' && s.active);
    return activeSuperAdmins.length >= MIN_SUPER_ADMINS;
  },

  /**
   * Conta o número de super admins ativos.
   */
  countActiveSuperAdmins(): number {
    const staff = readStaffMinimal();
    return staff.filter(s => s.role === 'super_admin' && s.active).length;
  },

  /**
   * Verifica se um usuário é o ÚLTIMO super admin ativo.
   * Se for, bloqueia operações que o removeriam (desativação, rebaixamento de role).
   */
  isLastSuperAdmin(userId: string): boolean {
    const staff = readStaffMinimal();
    const activeSuperAdmins = staff.filter(s => s.role === 'super_admin' && s.active);
    return activeSuperAdmins.length === 1 && activeSuperAdmins[0].id === userId;
  },

  /**
   * Valida se uma operação de desativação é segura.
   * Bloqueia se o alvo é o último super admin.
   */
  validateDeactivation(targetId: string, actorId: string): { allowed: boolean; reason?: string } {
    if (this.isLastSuperAdmin(targetId)) {
      AuditLogger.log({
        action: 'PERMISSION_DENIED',
        actorId,
        actorRole: 'super_admin',
        targetId,
        targetType: 'staff',
        details: `Tentativa bloqueada: desativar o último Super Administrador ativo (ID: ${targetId})`,
        severity: 'CRITICAL',
      });
      return {
        allowed: false,
        reason: 'Operação bloqueada: não é possível desativar o último Super Administrador ativo. Promova outro usuário antes de prosseguir.',
      };
    }
    return { allowed: true };
  },

  /**
   * Valida se um rebaixamento de role (de super_admin para outro) é seguro.
   */
  validateRoleDowngrade(
    targetId: string,
    newRole: StaffRole,
    actorId: string
  ): { allowed: boolean; reason?: string } {
    const staff = readStaffMinimal().find(s => s.id === targetId);
    if (!staff) return { allowed: true };

    if (staff.role === 'super_admin' && newRole !== 'super_admin') {
      if (this.isLastSuperAdmin(targetId)) {
        AuditLogger.log({
          action: 'PERMISSION_DENIED',
          actorId,
          actorRole: 'super_admin',
          targetId,
          targetType: 'staff',
          details: `Tentativa bloqueada: rebaixar o último Super Administrador ativo (ID: ${targetId}) para "${newRole}"`,
          severity: 'CRITICAL',
        });
        return {
          allowed: false,
          reason: 'Operação bloqueada: não é possível rebaixar o último Super Administrador ativo. Promova outro usuário antes de prosseguir.',
        };
      }
    }
    return { allowed: true };
  },

  /**
   * Detecta tentativa de escalada indevida de privilégio.
   * Um usuário não pode atribuir a si mesmo uma role superior.
   */
  detectPrivilegeEscalation(
    actorId: string,
    actorRole: StaffRole,
    targetId: string,
    requestedRole: StaffRole
  ): boolean {
    const ROLE_LEVELS: Record<StaffRole, number> = {
      super_admin: 100,
      admin: 80,
      staff_finance_admin: 40,
      staff_compliance_auditor: 60,
      staff_support_l1: 20,
    };

    // Self-escalation: tentativa de se promover
    if (actorId === targetId && ROLE_LEVELS[requestedRole] > ROLE_LEVELS[actorRole]) {
      AuditLogger.log({
        action: 'PERMISSION_DENIED',
        actorId,
        actorRole,
        targetId,
        targetType: 'staff',
        details: `⚠️ ALERTA SEGURANÇA: Tentativa de auto-escalada de privilégio de "${actorRole}" para "${requestedRole}"`,
        severity: 'CRITICAL',
        metadata: { actorRole, requestedRole, isPrivilegeEscalation: true },
      });
      return true;
    }

    // Não-super_admin tentando promover alguém a super_admin
    if (requestedRole === 'super_admin' && actorRole !== 'super_admin') {
      AuditLogger.log({
        action: 'PERMISSION_DENIED',
        actorId,
        actorRole,
        targetId,
        targetType: 'staff',
        details: `⚠️ ALERTA SEGURANÇA: "${actorRole}" tentou promover usuário a super_admin sem autoridade`,
        severity: 'CRITICAL',
        metadata: { actorRole, requestedRole, isPrivilegeEscalation: true },
      });
      return true;
    }

    return false;
  },

  /**
   * Modo de Recuperação de Emergência.
   * Cria um super admin de recuperação temporário via console.
   * Apenas disponível se NÃO há super admins ativos.
   * Em produção: exigiria acesso físico ao servidor.
   */
  emergencyRecovery(): { available: boolean; message: string } {
    if (this.ensureAdminExists()) {
      return {
        available: false,
        message: 'Modo de recuperação não disponível: há pelo menos 1 Super Administrador ativo.',
      };
    }

    return {
      available: true,
      message: [
        'ATENÇÃO: Modo de recuperação de emergência ativado.',
        'Acesse o console do navegador e execute:',
        "  window.__legis_emergency_recovery('sua-nova-senha-segura')",
        'Este comando só funciona quando não há Super Administradores ativos.',
      ].join('\n'),
    };
  },
};

// Disponibiliza função de recuperação no window (apenas em ambiente sem admin ativo)
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__legis_emergency_recovery = async (newPassword: string) => {
    if (RecoveryProtection.ensureAdminExists()) {
      console.warn('[LEGIS RECOVERY] Bloqueado: já existe um Super Admin ativo.');
      return;
    }
    if (!newPassword || newPassword.length < 12) {
      console.error('[LEGIS RECOVERY] Senha deve ter ao menos 12 caracteres.');
      return;
    }
    console.warn('[LEGIS RECOVERY] Modo de emergência ativado. Recriar super admin...');
    // Sinaliza para o StaffService recriar o seed
    localStorage.removeItem('legis_platform_staff');
    console.info('[LEGIS RECOVERY] Dados reiniciados. Recarregue a página para restaurar o acesso.');
  };
}
