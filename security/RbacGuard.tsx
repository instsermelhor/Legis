/**
 * security/RbacGuard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — RBAC Guard Components & Hooks
 *
 * Fornece:
 *   - usePermissions(role)       hook de consulta ao RBAC engine
 *   - <RbacGuard>                componente de proteção declarativa de UI
 *   - <AccessDenied>             feedback visual de acesso negado
 *   - withRbacGuard(HOC)         higher-order component para wrapping
 *
 * Uso:
 *   // Proteger um bloco de UI
 *   <RbacGuard role={user.role} permission="cases:create">
 *     <CreateCaseButton />
 *   </RbacGuard>
 *
 *   // Via hook
 *   const { can, scope } = usePermissions(user.role);
 *   if (can('financial:export')) { ... }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useMemo } from 'react';
import {
  hasPermission,
  canAccessView,
  ROLE_SCOPE,
  ROLE_LEVELS,
  isStaffRole,
  isSuperAdminRole,
  type SystemRole,
  type Permission,
  type AccessScope,
} from './rbac';
import type { View } from '../types';

// ─── usePermissions Hook ──────────────────────────────────────────────────────

export interface PermissionsContext {
  /** Verifica se a role possui uma permissão granular */
  can: (permission: Permission, customPermissions?: Permission[]) => boolean;
  /** Verifica se pode acessar uma view/rota */
  canView: (view: View) => boolean;
  /** Escopo padrão da role */
  scope: AccessScope;
  /** Nível hierárquico numérico */
  level: number;
  /** É staff interno? */
  isStaff: boolean;
  /** É super admin? */
  isSuperAdmin: boolean;
}

export function usePermissions(role: SystemRole | undefined | null): PermissionsContext {
  return useMemo(() => {
    const safeRole: SystemRole = role ?? 'client';
    return {
      can: (permission: Permission, customPermissions?: Permission[]) =>
        hasPermission(safeRole, permission, customPermissions),
      canView: (view: View) => canAccessView(safeRole, view),
      scope: ROLE_SCOPE[safeRole],
      level: ROLE_LEVELS[safeRole],
      isStaff: isStaffRole(safeRole),
      isSuperAdmin: isSuperAdminRole(safeRole),
    };
  }, [role]);
}

// ─── AccessDenied Component ───────────────────────────────────────────────────

interface AccessDeniedProps {
  message?: string;
  compact?: boolean;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  message = 'Você não possui autorização para acessar este recurso.',
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
        🔒 <span>{message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center bg-gray-50 dark:bg-[#151226] rounded-2xl border border-gray-200 dark:border-[#252040]">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-2xl mb-4">
        🔐
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
        Acesso Negado
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
        {message}
      </p>
      <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-3 font-mono">
        LEGIS CONNECT RBAC v2.0 — DENY BY DEFAULT
      </p>
    </div>
  );
};

// ─── RbacGuard Component ──────────────────────────────────────────────────────

interface RbacGuardProps {
  /** Role atual do usuário */
  role: SystemRole | undefined | null;
  /** Permissão granular exigida */
  permission: Permission;
  /** Permissões customizadas opcionais (delegação) */
  customPermissions?: Permission[];
  /** Conteúdo a exibir quando acesso é concedido */
  children: React.ReactNode;
  /** Fallback quando acesso é negado (padrão: <AccessDenied />) */
  fallback?: React.ReactNode;
  /** Renderizar fallback compacto (inline) ao invés do padrão */
  compactDeny?: boolean;
}

export const RbacGuard: React.FC<RbacGuardProps> = ({
  role,
  permission,
  customPermissions,
  children,
  fallback,
  compactDeny = false,
}) => {
  const safeRole: SystemRole = role ?? 'client';
  const isAllowed = hasPermission(safeRole, permission, customPermissions);

  if (!isAllowed) {
    if (fallback !== undefined) return <>{fallback}</>;
    return <AccessDenied compact={compactDeny} />;
  }

  return <>{children}</>;
};

// ─── RbacViewGuard Component ──────────────────────────────────────────────────

interface RbacViewGuardProps {
  role: SystemRole | undefined | null;
  view: View;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Protege uma view/rota completa.
 * Usado em App.tsx para substituir comparações manuais de role.
 */
export const RbacViewGuard: React.FC<RbacViewGuardProps> = ({
  role,
  view,
  children,
  fallback,
}) => {
  const safeRole: SystemRole = role ?? 'client';
  const isAllowed = canAccessView(safeRole, view);

  if (!isAllowed) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

// ─── withRbacGuard HOC ────────────────────────────────────────────────────────

export function withRbacGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: Permission,
  options?: { compactDeny?: boolean; fallback?: React.ReactNode },
): React.FC<P & { userRole?: SystemRole | null }> {
  const GuardedComponent: React.FC<P & { userRole?: SystemRole | null }> = (props) => {
    const { userRole, ...rest } = props;
    return (
      <RbacGuard
        role={userRole}
        permission={permission}
        compactDeny={options?.compactDeny}
        fallback={options?.fallback}
      >
        <WrappedComponent {...(rest as P)} />
      </RbacGuard>
    );
  };
  GuardedComponent.displayName = `withRbacGuard(${WrappedComponent.displayName || WrappedComponent.name})`;
  return GuardedComponent;
}
