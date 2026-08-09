// ─────────────────────────────────────────────────────────────────────────────
// security/rbac.ts
// Motor de Controle de Acesso Baseado em Roles (RBAC)
// Zero-Trust: nenhum acesso concedido por default — tudo é explicitamente autorizado
// ─────────────────────────────────────────────────────────────────────────────

// ─── Roles do Sistema ─────────────────────────────────────────────────────────
export type SystemRole =
  | 'super_admin'            // Administrador Master — acesso total + impersonation
  | 'admin'                  // Administrador operacional
  | 'staff_finance_admin'    // Equipe financeira — faturamento, chargebacks, NFs
  | 'staff_compliance_auditor' // Equipe de compliance — logs, OAB, denúncias
  | 'staff_support_l1'       // Suporte L1 — cadastros básicos, sem dados sensíveis
  | 'lawyer'                 // Advogado verificado OAB
  | 'client'                 // Cliente pessoa física/jurídica
  | 'intern'                 // Bacharelando/Estagiário
  | 'secretary';             // Secretário/Assistente Jurídico

import type { View } from '../types';

// ─── Nível Numérico de Autoridade ────────────────────────────────────────────
export const ROLE_LEVELS: Record<SystemRole, number> = {
  super_admin:               100,
  admin:                      80,
  staff_compliance_auditor:   60,
  staff_finance_admin:        40,
  staff_support_l1:           20,
  lawyer:                     15,
  secretary:                  12,
  intern:                     10,
  client:                     10,
};

// ─── Permissões Granulares ────────────────────────────────────────────────────
export type Permission =
  // Administração
  | 'admin:read'
  | 'admin:write'
  | 'admin:delete'
  | 'admin:impersonate'
  | 'admin:manage_staff'
  // Financeiro
  | 'finance:read'
  | 'finance:write'
  | 'finance:chargeback'
  | 'finance:export'
  // Cadastros
  | 'registrations:read'
  | 'registrations:write'
  | 'registrations:approve'
  | 'registrations:suspend'
  // Compliance / Auditoria
  | 'audit:read'
  | 'audit:write'
  | 'audit:oab_check'
  | 'audit:complaints'
  // Serviços / Provisionamento
  | 'services:read'
  | 'services:manage'
  | 'provisioning:read'
  | 'provisioning:manage'
  | 'provisioning:retry'
  // Painéis externos (acesso ao próprio perfil)
  | 'lawyer:dashboard'
  | 'client:dashboard'
  | 'intern:dashboard'
  | 'secretary:dashboard'
  // IA e Sistemas
  | 'ai:use'
  | 'ai:manage'
  | 'system:config';

// ─── Mapa de Permissões por Role ──────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  super_admin: [
    'admin:read', 'admin:write', 'admin:delete', 'admin:impersonate', 'admin:manage_staff',
    'finance:read', 'finance:write', 'finance:chargeback', 'finance:export',
    'registrations:read', 'registrations:write', 'registrations:approve', 'registrations:suspend',
    'audit:read', 'audit:write', 'audit:oab_check', 'audit:complaints',
    'services:read', 'services:manage',
    'provisioning:read', 'provisioning:manage', 'provisioning:retry',
    'lawyer:dashboard', 'client:dashboard', 'intern:dashboard', 'secretary:dashboard',
    'ai:use', 'ai:manage', 'system:config',
  ],
  admin: [
    'admin:read', 'admin:write', 'admin:manage_staff',
    'finance:read', 'finance:write', 'finance:export',
    'registrations:read', 'registrations:write', 'registrations:approve', 'registrations:suspend',
    'audit:read', 'audit:oab_check',
    'services:read', 'services:manage',
    'provisioning:read', 'provisioning:retry',
    'ai:use',
  ],
  staff_compliance_auditor: [
    'audit:read', 'audit:write', 'audit:oab_check', 'audit:complaints',
    'registrations:read',
    'provisioning:read',
    // NÃO tem acesso a finance ou dados de processos
  ],
  staff_finance_admin: [
    'finance:read', 'finance:write', 'finance:chargeback', 'finance:export',
    'provisioning:read', 'provisioning:manage',
    'registrations:read',
    // NÃO tem acesso a logs de processos ou código das IAs
  ],
  staff_support_l1: [
    'registrations:read',   // Apenas visualização de cadastros básicos
    'audit:read',           // Logs de erro para atendimento
    // NÃO vê dados financeiros nem peças processuais
  ],
  lawyer: [
    'lawyer:dashboard',
    'services:read',
    'ai:use',
  ],
  client: [
    'client:dashboard',
    'services:read',
  ],
  intern: [
    'intern:dashboard',
    'services:read',
    'ai:use',
  ],
  secretary: [
    'secretary:dashboard',
    'services:read',
  ],
};

// ─── Verificações de Permissão ────────────────────────────────────────────────

/**
 * Verifica se uma role possui uma permissão específica.
 * Respeita permissões customizadas do usuário (override).
 */
export function hasPermission(
  role: SystemRole,
  permission: Permission,
  customPermissions?: Permission[]
): boolean {
  // Permissões customizadas têm prioridade
  if (customPermissions?.includes(permission)) return true;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Verifica se uma role tem nível de autoridade >= mínimo exigido.
 */
export function hasMinLevel(role: SystemRole, minLevel: number): boolean {
  return (ROLE_LEVELS[role] ?? 0) >= minLevel;
}

/**
 * Verifica se pode executar impersonation (apenas super_admin).
 */
export function canImpersonate(role: SystemRole): boolean {
  return hasPermission(role, 'admin:impersonate');
}

/**
 * Retorna o label amigável da role para exibição.
 */
export const ROLE_LABELS: Record<SystemRole, string> = {
  super_admin:               '👑 Super Administrador',
  admin:                     '🛡️ Administrador',
  staff_finance_admin:       '💰 Gestor Financeiro',
  staff_compliance_auditor:  '🔍 Auditor de Compliance',
  staff_support_l1:          '🎧 Suporte L1',
  lawyer:                    '⚖️ Advogado',
  client:                    '👤 Cliente',
  intern:                    '🎓 Bacharelando',
  secretary:                 '📋 Secret./Assist. Jurídico',
};

/**
 * Retorna as abas do admin visíveis para a role.
 */
export function getVisibleAdminTabs(role: SystemRole): string[] {
  const tabs: string[] = [];

  if (hasPermission(role, 'admin:read')) tabs.push('overview', 'admin_commands');
  if (hasPermission(role, 'finance:read')) tabs.push('finance', 'plans');
  if (hasPermission(role, 'registrations:read')) tabs.push('registrations');
  if (hasPermission(role, 'services:manage')) tabs.push('services');
  if (hasPermission(role, 'provisioning:read')) tabs.push('provisioning');
  if (hasPermission(role, 'audit:read')) tabs.push('audit');
  if (hasPermission(role, 'admin:manage_staff')) tabs.push('staff', 'impersonation');
  if (hasPermission(role, 'system:config')) tabs.push('settings', 'operations', 'ai_config', 'whatsapp_config');

  return tabs;
}

/**
 * Retorna a view de dashboard correta para cada role.
 * Usado para redirecionamento inteligente pós-login.
 */
export function getRoleRedirectView(role: SystemRole): View {
  switch (role) {
    case 'super_admin':  return 'superAdminDashboard';
    case 'admin':        return 'adminDashboard';
    case 'lawyer':       return 'lawyerDashboard';
    case 'intern':       return 'internDashboard';
    case 'secretary':    return 'secretariadoDashboard';
    case 'client':       return 'dashboard';
    // Staff roles vão para o admin dashboard com tabs filtradas
    case 'staff_finance_admin':
    case 'staff_compliance_auditor':
    case 'staff_support_l1': return 'adminDashboard';
    default:             return 'landing';
  }
}

/**
 * Verifica se a role é administrativa (staff interno da plataforma).
 */
export function isStaffRole(role: SystemRole): boolean {
  return ['super_admin', 'admin', 'staff_finance_admin', 'staff_compliance_auditor', 'staff_support_l1'].includes(role);
}

/**
 * Verifica se a role é super_admin.
 */
export function isSuperAdminRole(role: SystemRole): boolean {
  return role === 'super_admin';
}
