/**
 * security/rbac.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — ROLE-BASED ACCESS CONTROL ENGINE v2.0
 * Source of Truth: docs/RBAC_ACCESS_GOVERNANCE.md
 *
 * Princípio: DENY BY DEFAULT.
 * Se não houver autorização explícita → NEGADO.
 *
 * Hierarquia de Roles (nível numérico):
 *   super_admin (9) > admin (7) > staff_finance_admin (5) >
 *   staff_compliance_auditor (5) > staff_support_l1 (4) >
 *   lawyer (3) > secretary (2) > intern (2) > client (1)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { View } from '../types';

// ─── System Roles ─────────────────────────────────────────────────────────────

export type SystemRole =
  | 'super_admin'
  | 'admin'
  | 'staff_finance_admin'
  | 'staff_compliance_auditor'
  | 'staff_support_l1'
  | 'lawyer'
  | 'secretary'
  | 'intern'
  | 'client';

// ─── Access Scopes ────────────────────────────────────────────────────────────

/**
 * Define o perímetro de dados acessíveis para uma permissão.
 *   own        → apenas os próprios dados do usuário
 *   assigned   → dados atribuídos diretamente ao usuário
 *   team       → dados da equipe do usuário
 *   office     → dados do escritório/organização do usuário
 *   global     → toda a plataforma (apenas super_admin / admin)
 */
export type AccessScope = 'own' | 'assigned' | 'team' | 'office' | 'global';

// ─── Granular Permission Type ─────────────────────────────────────────────────
//
// Nomenclatura: <resource>:<action>
// Recursos: users, clients, lawyers, cases, documents, agenda, financial,
//           escrow, provisioning, audit, staff, registrations, services,
//           ai, system, roles
// Ações:    create, read, update, delete, list, search, export, import,
//           approve, reject, assign, unassign, delegate, revoke, configure,
//           manage, impersonate, audit, chargeback, release, dispute

export type Permission =
  // ── Users ────────────────────────────────────────────────────────────────
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:list'
  | 'users:impersonate'       // apenas super_admin
  // ── Roles & Delegação ────────────────────────────────────────────────────
  | 'roles:read'
  | 'roles:manage'            // criar/editar/revogar roles — apenas super_admin
  | 'roles:delegate'          // delegar permissões dentro do escopo — admin+
  | 'roles:revoke'            // revogar permissões — admin+
  // ── Clientes ─────────────────────────────────────────────────────────────
  | 'clients:read'
  | 'clients:create'
  | 'clients:update'
  | 'clients:delete'
  | 'clients:list'
  | 'clients:assign'          // vincular cliente a advogado/escritório
  | 'clients:export'
  // ── Advogados ────────────────────────────────────────────────────────────
  | 'lawyers:read'
  | 'lawyers:create'
  | 'lawyers:update'
  | 'lawyers:delete'
  | 'lawyers:list'
  | 'lawyers:approve'         // aprovar cadastro OAB
  | 'lawyers:suspend'
  // ── Casos / Processos ────────────────────────────────────────────────────
  | 'cases:read'
  | 'cases:create'
  | 'cases:update'
  | 'cases:delete'
  | 'cases:list'
  | 'cases:assign'
  | 'cases:approve'
  | 'cases:export'
  // ── Documentos ───────────────────────────────────────────────────────────
  | 'documents:read'
  | 'documents:upload'
  | 'documents:update'
  | 'documents:delete'
  | 'documents:export'
  // ── Agenda ───────────────────────────────────────────────────────────────
  | 'agenda:read'
  | 'agenda:create'
  | 'agenda:update'
  | 'agenda:delete'
  // ── Financeiro ───────────────────────────────────────────────────────────
  | 'financial:read'
  | 'financial:export'
  | 'financial:chargeback'
  | 'financial:approve'       // aprovar lançamentos — finance_admin+
  // ── Escrow ───────────────────────────────────────────────────────────────
  | 'escrow:read'
  | 'escrow:create'
  | 'escrow:release'          // liberar honorários
  | 'escrow:dispute'          // acionar disputa
  | 'escrow:manage'           // gerenciar qualquer escrow (admin/finance_admin)
  // ── Provisionamento ──────────────────────────────────────────────────────
  | 'provisioning:read'
  | 'provisioning:manage'
  | 'provisioning:retry'
  // ── Serviços ─────────────────────────────────────────────────────────────
  | 'services:read'
  | 'services:manage'
  // ── Staff / Equipe ───────────────────────────────────────────────────────
  | 'staff:read'
  | 'staff:create'
  | 'staff:update'
  | 'staff:delete'
  | 'staff:delegate'
  | 'staff:revoke'
  // ── Registros ────────────────────────────────────────────────────────────
  | 'registrations:read'
  | 'registrations:write'
  | 'registrations:approve'
  | 'registrations:suspend'
  // ── Auditoria ────────────────────────────────────────────────────────────
  | 'audit:read'
  | 'audit:write'
  | 'audit:delete'            // exclusivo super_admin (imutabilidade via append-only)
  | 'audit:oab_check'
  | 'audit:complaints'
  | 'audit:export'
  // ── IA ───────────────────────────────────────────────────────────────────
  | 'ai:use'
  | 'ai:manage'
  // ── Sistema ──────────────────────────────────────────────────────────────
  | 'system:config'
  | 'system:monitor'
  // ── Dashboards (portais de acesso) ───────────────────────────────────────
  | 'lawyer:dashboard'
  | 'client:dashboard'
  | 'intern:dashboard'
  | 'secretary:dashboard'
  | 'admin:dashboard'
  | 'superadmin:dashboard'
  // ─ Legado (mantidos para compatibilidade — não usar em código novo) ───────
  | 'admin:read'
  | 'admin:write'
  | 'admin:delete'
  | 'admin:impersonate'
  | 'admin:manage_staff'
  | 'finance:read'
  | 'finance:write'
  | 'finance:chargeback'
  | 'finance:export';

// ─── Role Levels ─────────────────────────────────────────────────────────────

export const ROLE_LEVELS: Record<SystemRole, number> = {
  super_admin:              9,
  admin:                    7,
  staff_finance_admin:      5,
  staff_compliance_auditor: 5,
  staff_support_l1:         4,
  lawyer:                   3,
  secretary:                2,
  intern:                   2,
  client:                   1,
};

// ─── Role Default Scopes ──────────────────────────────────────────────────────

export const ROLE_SCOPE: Record<SystemRole, AccessScope> = {
  super_admin:              'global',
  admin:                    'global',
  staff_finance_admin:      'global',
  staff_compliance_auditor: 'global',
  staff_support_l1:         'global',
  lawyer:                   'office',
  secretary:                'assigned',
  intern:                   'assigned',
  client:                   'own',
};

// ─── Role Permissions Map ─────────────────────────────────────────────────────
// Princípio: DENY BY DEFAULT — somente permissões aqui listadas são concedidas.

export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {

  // ── SUPER ADMIN (Level 9): Autoridade máxima de governança ───────────────
  super_admin: [
    // Users & Roles
    'users:read', 'users:create', 'users:update', 'users:delete', 'users:list', 'users:impersonate',
    'roles:read', 'roles:manage', 'roles:delegate', 'roles:revoke',
    // Clients & Lawyers
    'clients:read', 'clients:create', 'clients:update', 'clients:delete', 'clients:list', 'clients:assign', 'clients:export',
    'lawyers:read', 'lawyers:create', 'lawyers:update', 'lawyers:delete', 'lawyers:list', 'lawyers:approve', 'lawyers:suspend',
    // Cases & Documents
    'cases:read', 'cases:create', 'cases:update', 'cases:delete', 'cases:list', 'cases:assign', 'cases:approve', 'cases:export',
    'documents:read', 'documents:upload', 'documents:update', 'documents:delete', 'documents:export',
    // Agenda
    'agenda:read', 'agenda:create', 'agenda:update', 'agenda:delete',
    // Financial & Escrow
    'financial:read', 'financial:export', 'financial:chargeback', 'financial:approve',
    'escrow:read', 'escrow:create', 'escrow:release', 'escrow:dispute', 'escrow:manage',
    // Provisioning & Services
    'provisioning:read', 'provisioning:manage', 'provisioning:retry',
    'services:read', 'services:manage',
    // Staff
    'staff:read', 'staff:create', 'staff:update', 'staff:delete', 'staff:delegate', 'staff:revoke',
    // Registrations
    'registrations:read', 'registrations:write', 'registrations:approve', 'registrations:suspend',
    // Audit
    'audit:read', 'audit:write', 'audit:delete', 'audit:oab_check', 'audit:complaints', 'audit:export',
    // AI & System
    'ai:use', 'ai:manage',
    'system:config', 'system:monitor',
    // Dashboards
    'admin:dashboard', 'superadmin:dashboard',
    // Legado
    'admin:read', 'admin:write', 'admin:delete', 'admin:impersonate', 'admin:manage_staff',
    'finance:read', 'finance:write', 'finance:chargeback', 'finance:export',
  ],

  // ── ADMIN (Level 7): Gestão operacional delegada ─────────────────────────
  admin: [
    // Users (sem delete, sem impersonate)
    'users:read', 'users:create', 'users:update', 'users:list',
    'roles:read', 'roles:delegate', 'roles:revoke',
    // Clients & Lawyers
    'clients:read', 'clients:create', 'clients:update', 'clients:list', 'clients:assign', 'clients:export',
    'lawyers:read', 'lawyers:update', 'lawyers:list', 'lawyers:approve', 'lawyers:suspend',
    // Cases & Documents
    'cases:read', 'cases:update', 'cases:list', 'cases:assign', 'cases:export',
    'documents:read', 'documents:upload', 'documents:export',
    // Agenda
    'agenda:read', 'agenda:create', 'agenda:update',
    // Financial & Escrow
    'financial:read', 'financial:export',
    'escrow:read', 'escrow:manage',
    // Provisioning & Services
    'provisioning:read', 'provisioning:retry',
    'services:read', 'services:manage',
    // Staff (sem delete)
    'staff:read', 'staff:create', 'staff:update', 'staff:delegate', 'staff:revoke',
    // Registrations
    'registrations:read', 'registrations:write', 'registrations:approve', 'registrations:suspend',
    // Audit (sem delete)
    'audit:read', 'audit:oab_check', 'audit:complaints', 'audit:export',
    // AI & System
    'ai:use',
    'system:monitor',
    // Dashboard
    'admin:dashboard',
    // Legado
    'admin:read', 'admin:write', 'admin:manage_staff',
    'finance:read', 'finance:write', 'finance:export',
  ],

  // ── STAFF — FINANCE ADMIN (Level 5): Acesso financeiro delegado ──────────
  staff_finance_admin: [
    // Financial — completo
    'financial:read', 'financial:export', 'financial:chargeback', 'financial:approve',
    // Escrow — gerenciamento completo
    'escrow:read', 'escrow:release', 'escrow:dispute', 'escrow:manage',
    // Provisioning
    'provisioning:read', 'provisioning:manage',
    // Clients (somente leitura para contexto)
    'clients:read', 'clients:list',
    // Registrations (somente leitura)
    'registrations:read',
    // Audit (somente leitura)
    'audit:read', 'audit:export',
    // System monitor
    'system:monitor',
    // Dashboard
    'admin:dashboard',
    // Legado
    'finance:read', 'finance:write', 'finance:chargeback', 'finance:export',
  ],

  // ── STAFF — COMPLIANCE AUDITOR (Level 5): Somente leitura de conformidade ─
  staff_compliance_auditor: [
    // Audit — leitura total
    'audit:read', 'audit:write', 'audit:oab_check', 'audit:complaints', 'audit:export',
    // Registrations — leitura
    'registrations:read',
    // Provisioning — leitura
    'provisioning:read',
    // Clients — leitura para contexto
    'clients:read', 'clients:list',
    // Cases — leitura para conformidade
    'cases:read', 'cases:list',
    // Dashboard
    'admin:dashboard',
  ],

  // ── STAFF — SUPPORT L1 (Level 4): Suporte básico ─────────────────────────
  staff_support_l1: [
    'registrations:read',
    'audit:read',
    'clients:read', 'clients:list',
    'cases:read', 'cases:list',
    'system:monitor',
    'admin:dashboard',
  ],

  // ── LAWYER (Level 3): Advogado — acesso ao seu escopo profissional ────────
  lawyer: [
    // Dashboard
    'lawyer:dashboard',
    // Clientes vinculados (escopo: office/assigned)
    'clients:read', 'clients:list', 'clients:assign',
    // Casos próprios
    'cases:read', 'cases:create', 'cases:update', 'cases:list', 'cases:assign',
    // Documentos próprios
    'documents:read', 'documents:upload', 'documents:update',
    // Agenda própria
    'agenda:read', 'agenda:create', 'agenda:update', 'agenda:delete',
    // Financeiro próprio (escopo: own)
    'financial:read',
    // Escrow — próprio
    'escrow:read', 'escrow:create', 'escrow:release', 'escrow:dispute',
    // Delegação para secretária/estagiário (dentro do escopo)
    'roles:delegate',
    // Serviços
    'services:read',
    // IA
    'ai:use',
    // Audit própria
    'audit:read',
  ],

  // ── SECRETARY (Level 2): Secretária — delegado pelo advogado ─────────────
  secretary: [
    // Dashboard
    'secretary:dashboard',
    // Clientes vinculados — somente leitura e comunicação
    'clients:read', 'clients:list',
    // Casos vinculados — somente leitura
    'cases:read', 'cases:list',
    // Documentos — leitura e upload
    'documents:read', 'documents:upload',
    // Agenda — gerenciamento completo
    'agenda:read', 'agenda:create', 'agenda:update', 'agenda:delete',
    // Serviços
    'services:read',
    // Audit própria
    'audit:read',
  ],

  // ── INTERN (Level 2): Estagiário — acesso restrito atribuído ─────────────
  intern: [
    // Dashboard
    'intern:dashboard',
    // Casos atribuídos — somente leitura
    'cases:read', 'cases:list',
    // Documentos autorizados — somente leitura
    'documents:read',
    // Agenda relacionada — somente leitura
    'agenda:read',
    // Serviços
    'services:read',
    // IA — assistência
    'ai:use',
    // Audit própria
    'audit:read',
  ],

  // ── CLIENT (Level 1): Cliente — somente seus próprios dados ──────────────
  client: [
    // Dashboard
    'client:dashboard',
    // Próprio perfil — implícito no dashboard
    // Próprios casos — leitura
    'cases:read',
    // Próprios documentos — leitura
    'documents:read',
    // Própria agenda — leitura e agendamento
    'agenda:read', 'agenda:create',
    // Próprio financeiro — somente leitura
    'financial:read',
    // Escrow — somente leitura do seu
    'escrow:read',
    // Serviços
    'services:read',
    // Audit própria
    'audit:read',
  ],
};

// ─── Role Definition ──────────────────────────────────────────────────────────

export interface RoleDefinition {
  role: SystemRole;
  level: number;
  scope: AccessScope;
  permissions: Permission[];
  canDelegateTo: SystemRole[];
  canElevateToLevel: number; // nível máximo que pode delegar (nunca superior ao próprio)
}

export const ROLE_DEFINITIONS: Record<SystemRole, RoleDefinition> = {
  super_admin: {
    role: 'super_admin', level: 9, scope: 'global',
    permissions: ROLE_PERMISSIONS.super_admin,
    canDelegateTo: ['admin', 'staff_finance_admin', 'staff_compliance_auditor', 'staff_support_l1', 'lawyer', 'secretary', 'intern', 'client'],
    canElevateToLevel: 7, // pode criar admins, não outros super_admins
  },
  admin: {
    role: 'admin', level: 7, scope: 'global',
    permissions: ROLE_PERMISSIONS.admin,
    canDelegateTo: ['staff_finance_admin', 'staff_compliance_auditor', 'staff_support_l1'],
    canElevateToLevel: 5,
  },
  staff_finance_admin: {
    role: 'staff_finance_admin', level: 5, scope: 'global',
    permissions: ROLE_PERMISSIONS.staff_finance_admin,
    canDelegateTo: [],
    canElevateToLevel: 0,
  },
  staff_compliance_auditor: {
    role: 'staff_compliance_auditor', level: 5, scope: 'global',
    permissions: ROLE_PERMISSIONS.staff_compliance_auditor,
    canDelegateTo: [],
    canElevateToLevel: 0,
  },
  staff_support_l1: {
    role: 'staff_support_l1', level: 4, scope: 'global',
    permissions: ROLE_PERMISSIONS.staff_support_l1,
    canDelegateTo: [],
    canElevateToLevel: 0,
  },
  lawyer: {
    role: 'lawyer', level: 3, scope: 'office',
    permissions: ROLE_PERMISSIONS.lawyer,
    canDelegateTo: ['secretary', 'intern'],
    canElevateToLevel: 2,
  },
  secretary: {
    role: 'secretary', level: 2, scope: 'assigned',
    permissions: ROLE_PERMISSIONS.secretary,
    canDelegateTo: [],
    canElevateToLevel: 0,
  },
  intern: {
    role: 'intern', level: 2, scope: 'assigned',
    permissions: ROLE_PERMISSIONS.intern,
    canDelegateTo: [],
    canElevateToLevel: 0,
  },
  client: {
    role: 'client', level: 1, scope: 'own',
    permissions: ROLE_PERMISSIONS.client,
    canDelegateTo: [],
    canElevateToLevel: 0,
  },
};

// ─── Core Authorization Functions ─────────────────────────────────────────────

/**
 * DENY BY DEFAULT: retorna true somente se a permission estiver
 * explicitamente no ROLE_PERMISSIONS da role (ou em customPermissions).
 */
export function hasPermission(
  role: SystemRole,
  permission: Permission,
  customPermissions?: Permission[],
): boolean {
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
 * Verifica se a role pode executar impersonation (exclusivo super_admin).
 */
export function canImpersonate(role: SystemRole): boolean {
  return role === 'super_admin';
}

/**
 * Verifica se grantor pode delegar uma permissão para grantee.
 * Regra: grantor deve possuir a permissão E ter nível superior ao grantee.
 */
export function canDelegate(
  grantor: SystemRole,
  grantee: SystemRole,
  permission: Permission,
): boolean {
  const grantorDef = ROLE_DEFINITIONS[grantor];
  const granteeLevel = ROLE_LEVELS[grantee];
  return (
    hasPermission(grantor, permission) &&
    grantorDef.canDelegateTo.includes(grantee) &&
    ROLE_LEVELS[grantor] > granteeLevel
  );
}

/**
 * Verifica se o usuário pode elevar outro usuário para um nível.
 * Nenhum usuário pode conceder privilégios superiores aos seus.
 */
export function canElevateTo(grantor: SystemRole, targetLevel: number): boolean {
  const def = ROLE_DEFINITIONS[grantor];
  return def.canElevateToLevel >= targetLevel && ROLE_LEVELS[grantor] > targetLevel;
}

// ─── Segregation of Duties (SoD) ─────────────────────────────────────────────

/**
 * Pares de permissões que NÃO podem coexistir em uma única role
 * para evitar fraude ou conflito de interesses (SoD).
 */
const SOD_CONFLICT_PAIRS: [Permission, Permission][] = [
  ['financial:approve', 'financial:chargeback'], // Aprovar e estornar
  ['escrow:create', 'escrow:release'],            // Criar e liberar escrow
  ['users:create', 'roles:manage'],               // Criar usuários e gerenciar roles (exceto super_admin)
  ['audit:write', 'audit:delete'],                // Escrever e deletar auditoria
];

/**
 * Detecta se um conjunto de permissões possui conflito SoD.
 * Retorna os pares conflitantes encontrados.
 */
export function hasSoDConflict(
  permissions: Permission[],
  exemptRole?: SystemRole,
): [Permission, Permission][] {
  // super_admin tem isenção de SoD — responsabilidade de governança
  if (exemptRole === 'super_admin') return [];
  return SOD_CONFLICT_PAIRS.filter(
    ([a, b]) => permissions.includes(a) && permissions.includes(b),
  );
}

// ─── View Access Control ──────────────────────────────────────────────────────

/**
 * Mapa de views protegidas para a permission mínima necessária.
 * DENY BY DEFAULT: views não listadas aqui são consideradas públicas.
 */
export const VIEW_PERMISSION_MAP: Partial<Record<View, Permission>> = {
  adminDashboard:       'admin:dashboard',
  superAdminDashboard:  'superadmin:dashboard',
  lawyerDashboard:      'lawyer:dashboard',
  internDashboard:      'intern:dashboard',
  secretariadoDashboard:'secretary:dashboard',
  dashboard:            'client:dashboard',
  delegationManager:    'roles:delegate',
  myAdminProfile:       'admin:dashboard',
  forcePasswordChange:  'admin:dashboard',
  mfaSetup:             'admin:dashboard',
  mfaChallenge:         'admin:dashboard',
};

/**
 * Verifica se uma role possui acesso a uma view específica.
 */
export function canAccessView(role: SystemRole, view: View): boolean {
  const requiredPermission = VIEW_PERMISSION_MAP[view];
  if (!requiredPermission) return true; // view pública
  return hasPermission(role, requiredPermission);
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

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
  if (hasPermission(role, 'admin:read') || hasPermission(role, 'admin:dashboard')) tabs.push('overview', 'admin_commands');
  if (hasPermission(role, 'financial:read') || hasPermission(role, 'finance:read')) tabs.push('finance', 'plans');
  if (hasPermission(role, 'registrations:read')) tabs.push('registrations');
  if (hasPermission(role, 'services:manage')) tabs.push('services');
  if (hasPermission(role, 'provisioning:read')) tabs.push('provisioning');
  if (hasPermission(role, 'audit:read')) tabs.push('audit');
  if (hasPermission(role, 'staff:read') || hasPermission(role, 'admin:manage_staff')) tabs.push('staff', 'impersonation');
  if (hasPermission(role, 'system:config')) tabs.push('settings', 'operations', 'ai_config', 'whatsapp_config');
  return tabs;
}

/**
 * Retorna a view de dashboard correta para cada role.
 */
export function getRoleRedirectView(role: SystemRole): View {
  switch (role) {
    case 'super_admin':  return 'superAdminDashboard';
    case 'admin':        return 'adminDashboard';
    case 'lawyer':       return 'lawyerDashboard';
    case 'intern':       return 'internDashboard';
    case 'secretary':    return 'secretariadoDashboard';
    case 'client':       return 'dashboard';
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
