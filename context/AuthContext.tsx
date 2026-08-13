// ─────────────────────────────────────────────────────────────────────────────
// context/AuthContext.tsx
// Contexto Global de Autenticação com suporte completo a Super Admin Universal
// Fix crítico: substitui prop-drilling do App.tsx por contexto dedicado
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { PlatformStaff } from '../types';
import { AuthService } from '../services/authService';
import { StaffService } from '../services/staffService';
import { clearSecurityContext, getSecurityContext } from '../security/scopeValidator';
import { logLogout } from '../security/auditLogger';
import type { SystemRole } from '../security/rbac';
import type { View } from '../types';

import { TenantService, PLATFORM_TENANT_ID, DEFAULT_TENANT_ID } from '../services/tenantService';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface AuthStaffState {
  staff: Omit<PlatformStaff, 'password'>;
  sessionId?: string;
}

export interface AuthContextValue {
  /** Tenant ID ativo no contexto de autenticação */
  currentTenantId: string;
  /** Colaborador administrativo autenticado (staff/super admin) */
  authStaff: AuthStaffState | null;
  /** Indica se está autenticado */
  isAuthenticated: boolean;
  /** Indica se é Super Admin Universal */
  isSuperAdmin: boolean;
  /** Indica se é um admin regular */
  isAdmin: boolean;
  /** Indica se deve forçar troca de senha */
  mustChangePassword: boolean;
  /** Indica se há desafio MFA pendente */
  mfaPending: boolean;
  /** ID do desafio MFA ativo */
  mfaChallengeId: string | null;
  /** Staff temporário aguardando MFA */
  pendingMfaStaff: Omit<PlatformStaff, 'password'> | null;
  /** View de destino pós-login (para redirecionamento inteligente) */
  redirectView: View | null;

  // ─── Ações ────────────────────────────────────────────────────────────────
  /** Login administrativo completo */
  loginStaff: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
    requiresPasswordChange?: boolean;
    requiresMfa?: boolean;
    mfaChallengeId?: string;
  }>;
  /** Completa login após MFA */
  completeMfaLogin: (token: string) => Promise<{ success: boolean; error?: string }>;
  /** Logout completo */
  logoutStaff: () => void;
  /** Limpa estado de MFA pendente */
  clearMfaPending: () => void;
  /** Atualiza o staff no contexto após alteração de dados */
  refreshStaff: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authStaff, setAuthStaff] = useState<AuthStaffState | null>(() => {
    // Restaura sessão existente se ainda válida
    try {
      const ctx = getSecurityContext();
      const savedStaffRaw = sessionStorage.getItem('legis_auth_staff');
      if (ctx && savedStaffRaw) {
        const savedStaff = JSON.parse(savedStaffRaw);
        if (savedStaff?.email === ctx.userId) {
          return { staff: savedStaff, sessionId: ctx.sessionId };
        }
      }
    } catch { /* silent */ }
    return null;
  });

  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [mfaPending, setMfaPending] = useState(false);
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [pendingMfaStaff, setPendingMfaStaff] = useState<Omit<PlatformStaff, 'password'> | null>(null);
  const [redirectView, setRedirectView] = useState<View | null>(null);

  // Computed values
  const isAuthenticated = authStaff !== null;
  const isSuperAdmin = authStaff?.staff.role === 'super_admin';
  const isAdmin = authStaff?.staff.role === 'admin' || isSuperAdmin;
  const currentTenantId = authStaff
    ? (isSuperAdmin ? PLATFORM_TENANT_ID : DEFAULT_TENANT_ID)
    : DEFAULT_TENANT_ID;

  // Persiste staff na sessão (sem a senha)
  useEffect(() => {
    if (authStaff) {
      sessionStorage.setItem('legis_auth_staff', JSON.stringify(authStaff.staff));
    } else {
      sessionStorage.removeItem('legis_auth_staff');
    }
  }, [authStaff]);

  /**
   * Login administrativo — usa AuthService com PBKDF2v2 + lockout progressivo
   */
  const loginStaff = useCallback(async (email: string, password: string) => {
    const result = await AuthService.authenticateStaffAsync(email, password);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    if (!result.staff) {
      return { success: false, error: 'Erro interno de autenticação.' };
    }

    // Caso: primeiro acesso (must_change_password)
    if (result.requiresPasswordChange) {
      setMustChangePassword(true);
      // Armazena staff temporariamente para após a troca de senha
      setPendingMfaStaff(result.staff);
      return { success: true, requiresPasswordChange: true };
    }

    // Caso: MFA obrigatório
    if (result.requiresMfa && result.mfaChallengeId) {
      setMfaPending(true);
      setMfaChallengeId(result.mfaChallengeId);
      setPendingMfaStaff(result.staff);
      return { success: true, requiresMfa: true, mfaChallengeId: result.mfaChallengeId };
    }

    // Caso: login completo
    const ctx = getSecurityContext();
    setAuthStaff({ staff: result.staff, sessionId: ctx?.sessionId });
    setMustChangePassword(false);
    setMfaPending(false);
    setPendingMfaStaff(null);

    // Define view de redirecionamento baseada no role
    const { getRoleRedirectView } = await import('../security/rbac');
    setRedirectView(getRoleRedirectView(result.staff.role as SystemRole));

    return { success: true };
  }, []);

  /**
   * Completa o login após verificação de código MFA
   */
  const completeMfaLogin = useCallback(async (token: string) => {
    if (!pendingMfaStaff || !mfaChallengeId) {
      return { success: false, error: 'Nenhuma sessão MFA pendente.' };
    }

    const result = await AuthService.completeMfaLogin(pendingMfaStaff.id, mfaChallengeId, token);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const ctx = getSecurityContext();
    setAuthStaff({ staff: pendingMfaStaff, sessionId: ctx?.sessionId });
    setMfaPending(false);
    setMfaChallengeId(null);
    setPendingMfaStaff(null);

    const { getRoleRedirectView } = await import('../security/rbac');
    setRedirectView(getRoleRedirectView(pendingMfaStaff.role as SystemRole));

    return { success: true };
  }, [pendingMfaStaff, mfaChallengeId]);

  /**
   * Logout completo — revoga sessão, limpa contexto
   */
  const logoutStaff = useCallback(() => {
    if (authStaff) {
      // Revoga todas as sessões do usuário
      StaffService.revokeAllSessions(authStaff.staff.id, authStaff.staff.email);
      logLogout(authStaff.staff.email, authStaff.staff.role as SystemRole);
    }

    // Limpa contextos de segurança
    clearSecurityContext();
    sessionStorage.removeItem('legis_auth_staff');
    sessionStorage.removeItem('legis_session_id');

    // Reseta estado
    setAuthStaff(null);
    setMustChangePassword(false);
    setMfaPending(false);
    setMfaChallengeId(null);
    setPendingMfaStaff(null);
    setRedirectView(null);
  }, [authStaff]);

  /**
   * Limpa estado MFA sem fazer logout
   */
  const clearMfaPending = useCallback(() => {
    setMfaPending(false);
    setMfaChallengeId(null);
    setPendingMfaStaff(null);
  }, []);

  /**
   * Atualiza dados do staff do storage (após alterações de perfil)
   */
  const refreshStaff = useCallback(() => {
    if (!authStaff) return;
    const fresh = StaffService.findByEmail(authStaff.staff.email);
    if (fresh) {
      const { password: _, ...safeStaff } = fresh;
      setAuthStaff(prev => prev ? { ...prev, staff: safeStaff } : null);
    }
  }, [authStaff]);

  const value: AuthContextValue = {
    currentTenantId,
    authStaff,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    mustChangePassword,
    mfaPending,
    mfaChallengeId,
    pendingMfaStaff,
    redirectView,
    loginStaff,
    completeMfaLogin,
    logoutStaff,
    clearMfaPending,
    refreshStaff,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;
