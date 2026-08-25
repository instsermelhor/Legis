/**
 * security/rbac.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — ROLE-BASED ACCESS CONTROL ENGINE v3.0
 * Source of Truth: docs/RBAC_ACCESS_GOVERNANCE.md
 *
 * Princípio: DENY BY DEFAULT.
 * Se não houver autorização explícita → NEGADO.
 *
 * Hierarquia de Roles (nível numérico):
 *   super_admin (9) > admin (7) > staff_finance_admin (5) >
 *   staff_compliance_auditor (5) > staff_support_l1 (4) >
 *   gestor (3) > lawyer (3) > secretary (2) > legal_assistant (2) >
 *   intern (2) > student (1) > client (1)
 *
 * Cadeia de autorização:
 *   IDENTIDADE → USUÁRIO → MEMBERSHIP → TENANT → ROLE → PERMISSION →
 *   RESOURCE → SCOPE → OWNERSHIP → BACKEND AUTHORIZATION → RLS → DADO
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { View } from '../types';

// ─── System Roles ─────────────────────────────────────────────────────────────

/**
 * Conjunto completo de roles da plataforma Legis Connect.
 *
 * PLATAFORMA (Staff Interno):
 *   super_admin, admin, staff_finance_admin, staff_compliance_auditor, staff_support_l1
 *
 * PROFISSIONAL/OPERACIONAL:
 *   gestor, lawyer, secretary, legal_assistant, intern
 *
 * ACADÊMICO:
 *   student
 *
 * CLIENTE:
 *   client
 */
export type SystemRole =
  // Staff Interno da Plataforma
  | 'super_admin'
  | 'admin'
  | 'staff_finance_admin'
  | 'staff_compliance_auditor'
  | 'staff_support_l1'
  // Profissional / Operacional
  | 'gestor'          // Gestor de Escritório — gerencia equipe e operações
  | 'lawyer'          // Advogado — contexto profissional próprio
  | 'secretary'       // Secretária — apoio administrativo
  | 'legal_assistant' // Assistente Jurídico — apoio jurídico com formação técnica
  | 'intern'          // Estagiário / Bacharelando — acesso restrito atribuído
  // Acadêmico
  | 'student'         // Estudante de Direito — sem vínculo profissional formal
  // Usuário Final
  | 'client';         // Cliente — somente seus próprios dados

// ─── Access Scopes ────────────────────────────────────────────────────────────

/**
 * Define o perímetro de dados acessíveis para uma permissão.
 *
 *   own        → apenas os próprios dados do usuário (owner_id = user.id)
 *   assigned   → dados atribuídos formalmente ao usuário (assigned_to = user.id)
 *   team       → dados da equipe do usuário (team_id = user.team_id)
 *   office     → dados do escritório/organização (office_id = user.office_id)
 *   tenant     → todos os dados dentro do tenant atual
 *   authorized → dados com autorização explícita concedida (shared_with includes user.id)
 *   related    → dados diretamente relacionados ao usuário (ex: caso do cliente)
 *   global     → toda a plataforma (apenas super_admin / admin com auditoria)
 *   none       → sem acesso (DENY explícito no contexto de escopo)
 */
export type AccessScope =
  | 'own'
  | 'assigned'
  | 'team'
  | 'office'
  | 'tenant'
  | 'authorized'
  | 'related'
  | 'global'
  | 'none';

// ─── Granular Permission Type ─────────────────────────────────────────────────
//
// Nomenclatura: <resource>:<action>
// Recursos: users, profile, clients, lawyers, cases, documents, agenda,
//           financial, escrow, provisioning, services, staff, registrations,
//           audit, ai, system, roles, academic, notifications, content, security
// Ações:    create, read, update, delete, list, search, export, import,
//           approve, reject, assign, unassign, delegate, revoke, configure,
//           manage, impersonate, audit, chargeback, release, dispute,
//           archive, restore, download, upload, share, invite, publish, unpublish

export type Permission =
  // ── Users ────────────────────────────────────────────────────────────────
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:list'
  | 'users:impersonate'         // apenas super_admin
  // ── Profile (perfil próprio) ──────────────────────────────────────────────
  | 'profile:read'
  | 'profile:update'
  // ── Roles & Delegação ────────────────────────────────────────────────────
  | 'roles:read'
  | 'roles:manage'              // criar/editar/revogar roles — apenas super_admin
  | 'roles:delegate'            // delegar permissões dentro do escopo — admin+
  | 'roles:revoke'              // revogar permissões — admin+
  // ── Clientes ─────────────────────────────────────────────────────────────
  | 'clients:read'
  | 'clients:create'
  | 'clients:update'
  | 'clients:delete'
  | 'clients:list'
  | 'clients:assign'            // vincular cliente a advogado/escritório
  | 'clients:export'
  | 'clients:archive'
  // ── Advogados ────────────────────────────────────────────────────────────
  | 'lawyers:read'
  | 'lawyers:create'
  | 'lawyers:update'
  | 'lawyers:delete'
  | 'lawyers:list'
  | 'lawyers:approve'           // aprovar cadastro OAB
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
  | 'cases:archive'
  | 'cases:restore'
  // ── Documentos ───────────────────────────────────────────────────────────
  | 'documents:read'
  | 'documents:upload'
  | 'documents:update'
  | 'documents:delete'
  | 'documents:export'
  | 'documents:download'
  | 'documents:share'
  | 'documents:archive'
  // ── Agenda ───────────────────────────────────────────────────────────────
  | 'agenda:read'
  | 'agenda:create'
  | 'agenda:update'
  | 'agenda:delete'
  | 'agenda:export'
  // ── Financeiro ───────────────────────────────────────────────────────────
  | 'financial:read'
  | 'financial:export'
  | 'financial:chargeback'
  | 'financial:approve'         // aprovar lançamentos — finance_admin+
  // ── Escrow ───────────────────────────────────────────────────────────────
  | 'escrow:read'
  | 'escrow:create'
  | 'escrow:release'            // liberar honorários
  | 'escrow:dispute'            // acionar disputa
  | 'escrow:manage'             // gerenciar qualquer escrow (admin/finance_admin)
  // ── Provisionamento ──────────────────────────────────────────────────────
  | 'provisioning:read'
  | 'provisioning:manage'
  | 'provisioning:retry'
  // ── Serviços ─────────────────────────────────────────────────────────────
  | 'services:read'
  | 'services:manage'
  // ── Equipe / Staff Profissional ───────────────────────────────────────────
  | 'team:read'
  | 'team:manage'               // gestor pode gerenciar equipe
  | 'team:invite'               // gestor pode convidar membros
  // ── Staff Interno da Plataforma ───────────────────────────────────────────
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
  | 'audit:delete'              // exclusivo super_admin (imutabilidade via append-only)
  | 'audit:oab_check'
  | 'audit:complaints'
  | 'audit:export'
  // ── Acadêmico ────────────────────────────────────────────────────────────
  | 'academic:read'             // acessar conteúdos acadêmicos
  | 'academic:write'            // registrar horas, atividades
  | 'academic:manage'           // supervisor/gestor gerencia estágios
  | 'academic:simulate'         // usar simulador OAB
  // ── Notificações ─────────────────────────────────────────────────────────
  | 'notifications:read'
  | 'notifications:manage'
  // ── Conteúdo / CMS ───────────────────────────────────────────────────────
  | 'content:read'
  | 'content:publish'
  | 'content:unpublish'
  | 'content:manage'
  // ── Segurança ────────────────────────────────────────────────────────────
  | 'security:read'
  | 'security:manage'
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
  | 'gestor:dashboard'
  | 'legal_assistant:dashboard'
  | 'student:dashboard'
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
  // Staff Interno
  super_admin:              9,
  admin:                    7,
  staff_finance_admin:      5,
  staff_compliance_auditor: 5,
  staff_support_l1:         4,
  // Profissional / Operacional
  gestor:                   3,
  lawyer:                   3,
  secretary:                2,
  legal_assistant:          2,
  intern:                   2,
  // Acadêmico / Cliente
  student:                  1,
  client:                   1,
};

// ─── Role Default Scopes ──────────────────────────────────────────────────────

export const ROLE_SCOPE: Record<SystemRole, AccessScope> = {
  // Staff opera em escopo global, mas com auditoria
  super_admin:              'global',
  admin:                    'global',
  staff_finance_admin:      'tenant',
  staff_compliance_auditor: 'tenant',
  staff_support_l1:         'tenant',
  // Profissional
  gestor:                   'office',
  lawyer:                   'office',
  secretary:                'assigned',
  legal_assistant:          'assigned',
  intern:                   'assigned',
  // Acadêmico
  student:                  'own',
  // Cliente
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
    // Profile
    'profile:read', 'profile:update',
    // Clients & Lawyers
    'clients:read', 'clients:create', 'clients:update', 'clients:delete', 'clients:list', 'clients:assign', 'clients:export', 'clients:archive',
    'lawyers:read', 'lawyers:create', 'lawyers:update', 'lawyers:delete', 'lawyers:list', 'lawyers:approve', 'lawyers:suspend',
    // Cases & Documents
    'cases:read', 'cases:create', 'cases:update', 'cases:delete', 'cases:list', 'cases:assign', 'cases:approve', 'cases:export', 'cases:archive', 'cases:restore',
    'documents:read', 'documents:upload', 'documents:update', 'documents:delete', 'documents:export', 'documents:download', 'documents:share', 'documents:archive',
    // Agenda
    'agenda:read', 'agenda:create', 'agenda:update', 'agenda:delete', 'agenda:export',
    // Financial & Escrow
    'financial:read', 'financial:export', 'financial:chargeback', 'financial:approve',
    'escrow:read', 'escrow:create', 'escrow:release', 'escrow:dispute', 'escrow:manage',
    // Provisioning & Services
    'provisioning:read', 'provisioning:manage', 'provisioning:retry',
    'services:read', 'services:manage',
    // Team & Staff
    'team:read', 'team:manage', 'team:invite',
    'staff:read', 'staff:create', 'staff:update', 'staff:delete', 'staff:delegate', 'staff:revoke',
    // Registrations
    'registrations:read', 'registrations:write', 'registrations:approve', 'registrations:suspend',
    // Audit
    'audit:read', 'audit:write', 'audit:delete', 'audit:oab_check', 'audit:complaints', 'audit:export',
    // Academic
    'academic:read', 'academic:write', 'academic:manage', 'academic:simulate',
    // Notifications
    'notifications:read', 'notifications:manage',
    // Content
    'content:read', 'content:publish', 'content:unpublish', 'content:manage',
    // Security
    'security:read', 'security:manage',
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
    // Profile
    'profile:read', 'profile:update',
    // Clients & Lawyers
    'clients:read', 'clients:create', 'clients:update', 'clients:list', 'clients:assign', 'clients:export',
    'lawyers:read', 'lawyers:update', 'lawyers:list', 'lawyers:approve', 'lawyers:suspend',
    // Cases & Documents
    'cases:read', 'cases:update', 'cases:list', 'cases:assign', 'cases:export',
    'documents:read', 'documents:upload', 'documents:export', 'documents:download',
    // Agenda
    'agenda:read', 'agenda:create', 'agenda:update',
    // Financial & Escrow
    'financial:read', 'financial:export',
    'escrow:read', 'escrow:manage',
    // Provisioning & Services
    'provisioning:read', 'provisioning:retry',
    'services:read', 'services:manage',
    // Team & Staff (sem delete)
    'team:read', 'team:manage', 'team:invite',
    'staff:read', 'staff:create', 'staff:update', 'staff:delegate', 'staff:revoke',
    // Registrations
    'registrations:read', 'registrations:write', 'registrations:approve', 'registrations:suspend',
    // Audit (sem delete)
    'audit:read', 'audit:oab_check', 'audit:complaints', 'audit:export',
    // Academic
    'academic:read', 'academic:manage',
    // Notifications
    'notifications:read', 'notifications:manage',
    // Content
    'content:read', 'content:manage',
    // Security (somente leitura)
    'security:read',
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
    // Profile próprio
    'profile:read', 'profile:update',
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
    // Notifications
    'notifications:read',
    // System monitor
    'system:monitor',
    // Dashboard
    'admin:dashboard',
    // Legado
    'finance:read', 'finance:write', 'finance:chargeback', 'finance:export',
  ],

  // ── STAFF — COMPLIANCE AUDITOR (Level 5): Somente leitura de conformidade ─
  staff_compliance_auditor: [
    // Profile próprio
    'profile:read', 'profile:update',
    // Audit — leitura total
    'audit:read', 'audit:write', 'audit:oab_check', 'audit:complaints', 'audit:export',
    // Registrations — leitura
    'registrations:read',
    // Provisioning — leitura
    'provisioning:read',
    // Clients — leitura para contexto
    'clients:read', 'clients:list',
    // Lawyers — leitura para conformidade OAB
    'lawyers:read', 'lawyers:list',
    // Cases — leitura para conformidade
    'cases:read', 'cases:list',
    // Documents — leitura para auditoria
    'documents:read',
    // Notifications
    'notifications:read',
    // Security — leitura
    'security:read',
    // Dashboard
    'admin:dashboard',
  ],

  // ── STAFF — SUPPORT L1 (Level 4): Suporte básico ─────────────────────────
  staff_support_l1: [
    // Profile próprio
    'profile:read', 'profile:update',
    // Leitura básica
    'registrations:read',
    'audit:read',
    'clients:read', 'clients:list',
    'cases:read', 'cases:list',
    // Notifications
    'notifications:read',
    // System monitor
    'system:monitor',
    // Dashboard
    'admin:dashboard',
  ],

  // ── GESTOR (Level 3): Gestor de Escritório ───────────────────────────────
  // Acesso operacional dentro do escritório/tenant
  gestor: [
    // Dashboard
    'gestor:dashboard',
    // Profile
    'profile:read', 'profile:update',
    // Equipe — gerenciamento completo dentro do escritório
    'team:read', 'team:manage', 'team:invite',
    // Delegação para membros da equipe
    'roles:delegate', 'roles:revoke',
    // Clientes do escritório — leitura e atribuição
    'clients:read', 'clients:create', 'clients:update', 'clients:list', 'clients:assign', 'clients:export',
    // Casos do escritório
    'cases:read', 'cases:create', 'cases:update', 'cases:list', 'cases:assign', 'cases:export', 'cases:archive',
    // Documentos do escritório
    'documents:read', 'documents:upload', 'documents:update', 'documents:export', 'documents:download', 'documents:share',
    // Agenda do escritório
    'agenda:read', 'agenda:create', 'agenda:update', 'agenda:delete', 'agenda:export',
    // Financeiro do escritório (leitura + relatórios, sem estorno)
    'financial:read', 'financial:export',
    'escrow:read',
    // Serviços
    'services:read',
    // Notificações
    'notifications:read', 'notifications:manage',
    // IA
    'ai:use',
    // Auditoria do escritório (apenas leitura)
    'audit:read',
    // Acadêmico — supervisão de estagiários
    'academic:manage',
  ],

  // ── LAWYER (Level 3): Advogado — acesso ao seu contexto profissional ────────
  lawyer: [
    // Dashboard
    'lawyer:dashboard',
    // Profile
    'profile:read', 'profile:update',
    // Clientes vinculados (escopo: office/assigned)
    'clients:read', 'clients:list', 'clients:assign',
    // Casos próprios
    'cases:read', 'cases:create', 'cases:update', 'cases:list', 'cases:assign', 'cases:export', 'cases:archive',
    // Documentos próprios
    'documents:read', 'documents:upload', 'documents:update', 'documents:export', 'documents:download', 'documents:share',
    // Agenda própria
    'agenda:read', 'agenda:create', 'agenda:update', 'agenda:delete',
    // Financeiro próprio (escopo: own)
    'financial:read', 'financial:export',
    // Escrow — próprio
    'escrow:read', 'escrow:create', 'escrow:release', 'escrow:dispute',
    // Delegação para secretária/estagiário/assistente (dentro do escopo)
    'roles:delegate',
    // Equipe (somente leitura)
    'team:read',
    // Serviços
    'services:read',
    // Notificações
    'notifications:read',
    // IA
    'ai:use',
    // Auditoria própria
    'audit:read',
    // Acadêmico — supervisão
    'academic:manage',
  ],

  // ── SECRETARY (Level 2): Secretária — apoio administrativo delegado ───────
  secretary: [
    // Dashboard
    'secretary:dashboard',
    // Profile
    'profile:read', 'profile:update',
    // Clientes vinculados — leitura e comunicação (escopo: assigned)
    'clients:read', 'clients:list',
    // Casos vinculados — somente leitura
    'cases:read', 'cases:list',
    // Documentos — leitura e upload (sem delete, sem export)
    'documents:read', 'documents:upload', 'documents:download',
    // Agenda — gerenciamento completo (principal função)
    'agenda:read', 'agenda:create', 'agenda:update', 'agenda:delete',
    // Serviços
    'services:read',
    // Notificações
    'notifications:read',
    // Auditoria própria
    'audit:read',
  ],

  // ── LEGAL ASSISTANT (Level 2): Assistente Jurídico ─────────────────────────
  // Mais permissões que secretária no âmbito jurídico
  legal_assistant: [
    // Dashboard
    'legal_assistant:dashboard',
    // Profile
    'profile:read', 'profile:update',
    // Clientes — leitura no escopo atribuído
    'clients:read', 'clients:list',
    // Casos — leitura e atualização no escopo atribuído
    'cases:read', 'cases:update', 'cases:list',
    // Documentos — leitura, upload, download (sem delete)
    'documents:read', 'documents:upload', 'documents:update', 'documents:download', 'documents:share',
    // Agenda — leitura e criação
    'agenda:read', 'agenda:create', 'agenda:update',
    // Financeiro — somente leitura no escopo
    'financial:read',
    // Serviços
    'services:read',
    // Notificações
    'notifications:read',
    // IA — assistência
    'ai:use',
    // Auditoria própria
    'audit:read',
  ],

  // ── INTERN (Level 2): Estagiário / Bacharelando — princípio de menor privilégio ─
  intern: [
    // Dashboard
    'intern:dashboard',
    // Profile
    'profile:read', 'profile:update',
    // Casos atribuídos — somente leitura (escopo: assigned)
    'cases:read', 'cases:list',
    // Documentos autorizados — somente leitura
    'documents:read', 'documents:download',
    // Agenda relacionada — somente leitura
    'agenda:read',
    // Serviços
    'services:read',
    // Notificações
    'notifications:read',
    // IA — assistência acadêmica
    'ai:use',
    // Acadêmico — registrar horas, usar simulador OAB
    'academic:read', 'academic:write', 'academic:simulate',
    // Auditoria própria
    'audit:read',
  ],

  // ── STUDENT (Level 1): Estudante de Direito — sem vínculo profissional ────
  // MENOR PRIVILÉGIO — apenas contexto acadêmico e próprio perfil
  student: [
    // Dashboard
    'student:dashboard',
    // Profile
    'profile:read', 'profile:update',
    // Conteúdo acadêmico — leitura
    'academic:read', 'academic:simulate',
    // Serviços (apenas leitura de catálogo)
    'services:read',
    // Notificações
    'notifications:read',
    // Auditoria própria
    'audit:read',
    // Conteúdo público
    'content:read',
    // NÃO tem: cases, clients, documents, financial, escrow, agenda, ai
  ],

  // ── CLIENT (Level 1): Cliente — somente seus próprios dados ──────────────
  client: [
    // Dashboard
    'client:dashboard',
    // Profile próprio
    'profile:read', 'profile:update',
    // Próprios casos — leitura (escopo: own/related)
    'cases:read',
    // Próprios documentos — leitura e download
    'documents:read', 'documents:download',
    // Própria agenda — leitura e agendamento
    'agenda:read', 'agenda:create',
    // Próprio financeiro — somente leitura
    'financial:read',
    // Escrow — somente leitura do seu
    'escrow:read',
    // Serviços
    'services:read',
    // Notificações
    'notifications:read',
    // Auditoria própria
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
  description: string;
}

export const ROLE_DEFINITIONS: Record<SystemRole, RoleDefinition> = {
  super_admin: {
    role: 'super_admin', level: 9, scope: 'global',
    permissions: ROLE_PERMISSIONS.super_admin,
    canDelegateTo: ['admin', 'staff_finance_admin', 'staff_compliance_auditor', 'staff_support_l1',
      'gestor', 'lawyer', 'secretary', 'legal_assistant', 'intern', 'student', 'client'],
    canElevateToLevel: 7, // pode criar admins, não outros super_admins
    description: 'Autoridade máxima de governança global. Impersonação auditada. MFA obrigatório.',
  },
  admin: {
    role: 'admin', level: 7, scope: 'global',
    permissions: ROLE_PERMISSIONS.admin,
    canDelegateTo: ['staff_finance_admin', 'staff_compliance_auditor', 'staff_support_l1', 'gestor'],
    canElevateToLevel: 5,
    description: 'Gestão operacional delegada. Sem impersonação. Sem delete de usuários.',
  },
  staff_finance_admin: {
    role: 'staff_finance_admin', level: 5, scope: 'tenant',
    permissions: ROLE_PERMISSIONS.staff_finance_admin,
    canDelegateTo: [],
    canElevateToLevel: 0,
    description: 'Gestão financeira delegada: escrow, chargeback, faturamento.',
  },
  staff_compliance_auditor: {
    role: 'staff_compliance_auditor', level: 5, scope: 'tenant',
    permissions: ROLE_PERMISSIONS.staff_compliance_auditor,
    canDelegateTo: [],
    canElevateToLevel: 0,
    description: 'Auditoria e conformidade OAB. Somente leitura. Sem acesso financeiro.',
  },
  staff_support_l1: {
    role: 'staff_support_l1', level: 4, scope: 'tenant',
    permissions: ROLE_PERMISSIONS.staff_support_l1,
    canDelegateTo: [],
    canElevateToLevel: 0,
    description: 'Suporte Nível 1. Leitura básica para diagnóstico. Sem mutações.',
  },
  gestor: {
    role: 'gestor', level: 3, scope: 'office',
    permissions: ROLE_PERMISSIONS.gestor,
    canDelegateTo: ['lawyer', 'secretary', 'legal_assistant', 'intern'],
    canElevateToLevel: 2,
    description: 'Gestor de Escritório. Gerencia equipe, clientes e operações dentro do tenant.',
  },
  lawyer: {
    role: 'lawyer', level: 3, scope: 'office',
    permissions: ROLE_PERMISSIONS.lawyer,
    canDelegateTo: ['secretary', 'legal_assistant', 'intern'],
    canElevateToLevel: 2,
    description: 'Advogado. Acesso ao contexto profissional próprio e casos atribuídos.',
  },
  secretary: {
    role: 'secretary', level: 2, scope: 'assigned',
    permissions: ROLE_PERMISSIONS.secretary,
    canDelegateTo: [],
    canElevateToLevel: 0,
    description: 'Secretária. Apoio administrativo delegado. Foco em agenda e clientes.',
  },
  legal_assistant: {
    role: 'legal_assistant', level: 2, scope: 'assigned',
    permissions: ROLE_PERMISSIONS.legal_assistant,
    canDelegateTo: [],
    canElevateToLevel: 0,
    description: 'Assistente Jurídico. Apoio técnico-jurídico. Pode atualizar casos e documentos.',
  },
  intern: {
    role: 'intern', level: 2, scope: 'assigned',
    permissions: ROLE_PERMISSIONS.intern,
    canDelegateTo: [],
    canElevateToLevel: 0,
    description: 'Estagiário/Bacharelando. Menor privilégio. Somente casos atribuídos.',
  },
  student: {
    role: 'student', level: 1, scope: 'own',
    permissions: ROLE_PERMISSIONS.student,
    canDelegateTo: [],
    canElevateToLevel: 0,
    description: 'Estudante de Direito. Sem vínculo profissional. Contexto acadêmico apenas.',
  },
  client: {
    role: 'client', level: 1, scope: 'own',
    permissions: ROLE_PERMISSIONS.client,
    canDelegateTo: [],
    canElevateToLevel: 0,
    description: 'Cliente. Somente seus próprios dados e recursos diretamente relacionados.',
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
  ['team:invite', 'staff:delete'],                // Convidar e demitir (sem governança superior)
  ['content:publish', 'audit:delete'],            // Publicar conteúdo e apagar rastro
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
  adminDashboard:         'admin:dashboard',
  superAdminDashboard:    'superadmin:dashboard',
  lawyerDashboard:        'lawyer:dashboard',
  internDashboard:        'intern:dashboard',
  secretariadoDashboard:  'secretary:dashboard',
  dashboard:              'client:dashboard',
  delegationManager:      'roles:delegate',
  myAdminProfile:         'admin:dashboard',
  forcePasswordChange:    'admin:dashboard',
  mfaSetup:               'admin:dashboard',
  mfaChallenge:           'admin:dashboard',
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
  gestor:                    '🏢 Gestor de Escritório',
  lawyer:                    '⚖️ Advogado',
  secretary:                 '📋 Secretária',
  legal_assistant:           '📂 Assistente Jurídico',
  intern:                    '🎓 Estagiário / Bacharelando',
  student:                   '📚 Estudante de Direito',
  client:                    '👤 Cliente',
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
    case 'super_admin':              return 'superAdminDashboard';
    case 'admin':                    return 'adminDashboard';
    case 'gestor':                   return 'lawyerDashboard';    // gestor usa dashboard do advogado enquanto view dedicada não existe
    case 'lawyer':                   return 'lawyerDashboard';
    case 'intern':                   return 'internDashboard';
    case 'secretary':                return 'secretariadoDashboard';
    case 'legal_assistant':          return 'secretariadoDashboard'; // usa secretariado enquanto view dedicada não existe
    case 'student':                  return 'internDashboard';       // usa intern enquanto view dedicada não existe
    case 'client':                   return 'dashboard';
    case 'staff_finance_admin':
    case 'staff_compliance_auditor':
    case 'staff_support_l1':         return 'adminDashboard';
    default:                         return 'landing';
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

/**
 * Verifica se a role é um profissional do escritório (lawyer ou gestor).
 */
export function isOfficeRole(role: SystemRole): boolean {
  return ['gestor', 'lawyer'].includes(role);
}

/**
 * Verifica se a role é de apoio operacional dentro do escritório.
 */
export function isOfficeStaffRole(role: SystemRole): boolean {
  return ['secretary', 'legal_assistant', 'intern'].includes(role);
}

/**
 * Verifica se a role é acadêmica (sem vínculo profissional formal).
 */
export function isAcademicRole(role: SystemRole): boolean {
  return role === 'student';
}
