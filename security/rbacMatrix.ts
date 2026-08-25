/**
 * security/rbacMatrix.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — RBAC MATRIX v3.0: ROLE × RESOURCE × ACTION
 *
 * Matriz completa de controle de acesso com três resultados possíveis:
 *   ALLOW       → acesso explicitamente concedido
 *   DENY        → acesso explicitamente negado (DENY BY DEFAULT)
 *   CONDITIONAL → acesso concedido apenas se condição de escopo/ownership for atendida
 *
 * A consulta à matriz é realizada via checkMatrix().
 * Qualquer combinação não listada retorna DENY automaticamente.
 *
 * Hierarquia de Verificação de Condicionais:
 *   1. OWN:      resourceOwnerId === userId
 *   2. ASSIGNED: assignedIds.includes(resourceId)
 *   3. OFFICE:   officeId === resourceOfficeId
 *   4. TENANT:   tenantId === resourceTenantId
 *   → Se nenhuma condição satisfeita: DENY
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { SystemRole } from './rbac';

// ─── Resources ────────────────────────────────────────────────────────────────

export type Resource =
  | 'users'
  | 'profile'
  | 'clients'
  | 'lawyers'
  | 'cases'
  | 'documents'
  | 'agenda'
  | 'financial'
  | 'escrow'
  | 'provisioning'
  | 'services'
  | 'team'
  | 'staff'
  | 'registrations'
  | 'academic'
  | 'notifications'
  | 'content'
  | 'security'
  | 'audit'
  | 'ai'
  | 'system'
  | 'roles'
  | 'error_reports';

// ─── Actions ──────────────────────────────────────────────────────────────────

export type Action =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LIST'
  | 'SEARCH'
  | 'EXPORT'
  | 'IMPORT'
  | 'APPROVE'
  | 'REJECT'
  | 'ASSIGN'
  | 'UNASSIGN'
  | 'DELEGATE'
  | 'REVOKE'
  | 'CONFIGURE'
  | 'MANAGE'
  | 'AUDIT'
  | 'CHARGEBACK'
  | 'RELEASE'
  | 'DISPUTE'
  | 'IMPERSONATE'
  | 'ARCHIVE'
  | 'RESTORE'
  | 'DOWNLOAD'
  | 'UPLOAD'
  | 'SHARE'
  | 'INVITE'
  | 'PUBLISH'
  | 'UNPUBLISH';

export type MatrixResult = 'ALLOW' | 'DENY' | 'CONDITIONAL';

// ─── Matrix Definition ────────────────────────────────────────────────────────
// Estrutura: RBAC_MATRIX[role][resource][action] → MatrixResult
// Células ausentes = DENY (DENY BY DEFAULT)

type RoleResourceMatrix = Partial<Record<Resource, Partial<Record<Action, MatrixResult>>>>;
type FullMatrix = Record<SystemRole, RoleResourceMatrix>;

export const RBAC_MATRIX: FullMatrix = {

  // ── SUPER ADMIN ─────────────────────────────────────────────────────────────
  // GLOBAL — com auditoria obrigatória em todas as ações
  super_admin: {
    users:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',IMPERSONATE:'ALLOW' },
    profile:       { READ:'ALLOW',UPDATE:'ALLOW' },
    roles:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',DELEGATE:'ALLOW',REVOKE:'ALLOW',CONFIGURE:'ALLOW' },
    clients:       { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',ASSIGN:'ALLOW',ARCHIVE:'ALLOW',RESTORE:'ALLOW' },
    lawyers:       { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',APPROVE:'ALLOW',REJECT:'ALLOW' },
    cases:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',ASSIGN:'ALLOW',APPROVE:'ALLOW',ARCHIVE:'ALLOW',RESTORE:'ALLOW' },
    documents:     { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',DOWNLOAD:'ALLOW',UPLOAD:'ALLOW',SHARE:'ALLOW',ARCHIVE:'ALLOW' },
    agenda:        { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW' },
    financial:     { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',CHARGEBACK:'ALLOW',APPROVE:'ALLOW',AUDIT:'ALLOW' },
    escrow:        { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',RELEASE:'ALLOW',DISPUTE:'ALLOW',MANAGE:'ALLOW' },
    provisioning:  { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',MANAGE:'ALLOW',CONFIGURE:'ALLOW' },
    services:      { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',MANAGE:'ALLOW',CONFIGURE:'ALLOW' },
    team:          { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',INVITE:'ALLOW',MANAGE:'ALLOW' },
    staff:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',DELEGATE:'ALLOW',REVOKE:'ALLOW' },
    registrations: { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',APPROVE:'ALLOW',REJECT:'ALLOW',EXPORT:'ALLOW' },
    academic:      { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',MANAGE:'ALLOW' },
    notifications: { READ:'ALLOW',MANAGE:'ALLOW' },
    content:       { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',PUBLISH:'ALLOW',UNPUBLISH:'ALLOW',MANAGE:'ALLOW' },
    security:      { READ:'ALLOW',MANAGE:'ALLOW',CONFIGURE:'ALLOW',AUDIT:'ALLOW' },
    audit:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',AUDIT:'ALLOW' },
    ai:            { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',MANAGE:'ALLOW',CONFIGURE:'ALLOW' },
    system:        { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',CONFIGURE:'ALLOW',AUDIT:'ALLOW',MANAGE:'ALLOW' },
    error_reports: { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW' },
  },

  // ── ADMIN ────────────────────────────────────────────────────────────────────
  // GLOBAL — sem impersonação, sem delete de usuários, sem chargeback
  admin: {
    users:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',IMPERSONATE:'DENY' },
    profile:       { READ:'ALLOW',UPDATE:'ALLOW' },
    roles:         { CREATE:'DENY',READ:'ALLOW',UPDATE:'DENY',DELETE:'DENY',DELEGATE:'ALLOW',REVOKE:'ALLOW',CONFIGURE:'DENY' },
    clients:       { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',ASSIGN:'ALLOW',ARCHIVE:'DENY' },
    lawyers:       { CREATE:'DENY',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW',SEARCH:'ALLOW',APPROVE:'ALLOW',REJECT:'ALLOW' },
    cases:         { CREATE:'DENY',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',ASSIGN:'ALLOW',APPROVE:'DENY',ARCHIVE:'DENY' },
    documents:     { CREATE:'DENY',READ:'ALLOW',UPDATE:'DENY',DELETE:'DENY',LIST:'ALLOW',EXPORT:'ALLOW',DOWNLOAD:'ALLOW' },
    agenda:        { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW' },
    financial:     { READ:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',CHARGEBACK:'DENY',APPROVE:'DENY',AUDIT:'ALLOW' },
    escrow:        { CREATE:'DENY',READ:'ALLOW',UPDATE:'DENY',DELETE:'DENY',RELEASE:'DENY',DISPUTE:'DENY',MANAGE:'ALLOW' },
    provisioning:  { READ:'ALLOW',LIST:'ALLOW',MANAGE:'DENY',CONFIGURE:'DENY' },
    services:      { READ:'ALLOW',MANAGE:'ALLOW',CONFIGURE:'DENY' },
    team:          { READ:'ALLOW',UPDATE:'ALLOW',LIST:'ALLOW',INVITE:'ALLOW',MANAGE:'ALLOW' },
    staff:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW',DELEGATE:'ALLOW',REVOKE:'ALLOW' },
    registrations: { CREATE:'DENY',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW',APPROVE:'ALLOW',REJECT:'ALLOW',EXPORT:'ALLOW' },
    academic:      { READ:'ALLOW',LIST:'ALLOW',MANAGE:'ALLOW' },
    notifications: { READ:'ALLOW',MANAGE:'ALLOW' },
    content:       { READ:'ALLOW',MANAGE:'ALLOW',PUBLISH:'ALLOW',UNPUBLISH:'ALLOW' },
    security:      { READ:'ALLOW',MANAGE:'DENY',CONFIGURE:'DENY' },
    audit:         { READ:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',DELETE:'DENY',AUDIT:'ALLOW' },
    ai:            { READ:'ALLOW',MANAGE:'DENY',CONFIGURE:'DENY' },
    system:        { READ:'ALLOW',CONFIGURE:'DENY',AUDIT:'ALLOW',MANAGE:'DENY' },
    error_reports: { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW',EXPORT:'DENY' },
  },

  // ── STAFF — FINANCE ADMIN ────────────────────────────────────────────────────
  // TENANT — acesso financeiro completo, sem acesso a dados jurídicos
  staff_finance_admin: {
    profile:       { READ:'ALLOW',UPDATE:'ALLOW' },
    users:         { READ:'DENY',LIST:'DENY',IMPERSONATE:'DENY' },
    clients:       { READ:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW' },
    cases:         { READ:'DENY' },
    documents:     { READ:'DENY' },
    financial:     { READ:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',CHARGEBACK:'ALLOW',APPROVE:'ALLOW',AUDIT:'ALLOW' },
    escrow:        { READ:'ALLOW',LIST:'ALLOW',RELEASE:'ALLOW',DISPUTE:'ALLOW',MANAGE:'ALLOW' },
    provisioning:  { READ:'ALLOW',LIST:'ALLOW',MANAGE:'ALLOW' },
    registrations: { READ:'ALLOW',LIST:'ALLOW' },
    notifications: { READ:'ALLOW' },
    audit:         { READ:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',DELETE:'DENY' },
    system:        { READ:'ALLOW',CONFIGURE:'DENY' },
    error_reports: { CREATE:'ALLOW',READ:'ALLOW',LIST:'ALLOW' },
  },

  // ── STAFF — COMPLIANCE AUDITOR ────────────────────────────────────────────────
  // TENANT — somente leitura para auditoria e conformidade
  staff_compliance_auditor: {
    profile:       { READ:'ALLOW',UPDATE:'ALLOW' },
    users:         { READ:'DENY',IMPERSONATE:'DENY' },
    clients:       { READ:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW' },
    lawyers:       { READ:'ALLOW',LIST:'ALLOW' },
    cases:         { READ:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW' },
    documents:     { READ:'ALLOW',LIST:'ALLOW' },
    financial:     { READ:'DENY' },
    escrow:        { READ:'DENY' },
    registrations: { READ:'ALLOW',LIST:'ALLOW' },
    notifications: { READ:'ALLOW' },
    security:      { READ:'ALLOW' },
    audit:         { READ:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',DELETE:'DENY',AUDIT:'ALLOW' },
    provisioning:  { READ:'ALLOW' },
    system:        { READ:'ALLOW',CONFIGURE:'DENY' },
    error_reports: { CREATE:'ALLOW',READ:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW' },
  },

  // ── STAFF — SUPPORT L1 ────────────────────────────────────────────────────────
  // TENANT — mínimo necessário para diagnóstico de suporte
  staff_support_l1: {
    profile:       { READ:'ALLOW',UPDATE:'ALLOW' },
    clients:       { READ:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW' },
    cases:         { READ:'ALLOW',LIST:'ALLOW' },
    registrations: { READ:'ALLOW',LIST:'ALLOW' },
    notifications: { READ:'ALLOW' },
    audit:         { READ:'ALLOW',LIST:'ALLOW' },
    financial:     { READ:'DENY' },
    escrow:        { READ:'DENY' },
    system:        { READ:'ALLOW',CONFIGURE:'DENY' },
    error_reports: { CREATE:'ALLOW',READ:'ALLOW',LIST:'ALLOW' },
  },

  // ── GESTOR ────────────────────────────────────────────────────────────────────
  // OFFICE — acesso operacional dentro do escritório/tenant
  gestor: {
    profile:       { READ:'ALLOW',UPDATE:'ALLOW' },
    users:         { READ:'DENY',IMPERSONATE:'DENY' },
    // Equipe do escritório — acesso total
    team:          { READ:'ALLOW',UPDATE:'ALLOW',LIST:'ALLOW',INVITE:'ALLOW',MANAGE:'ALLOW',DELETE:'CONDITIONAL' }, // CONDITIONAL = só pode remover membros de menor nível
    roles:         { READ:'ALLOW',DELEGATE:'ALLOW',REVOKE:'ALLOW',MANAGE:'DENY' },
    // Clientes do escritório — acesso operacional
    clients:       { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'CONDITIONAL',DELETE:'DENY',LIST:'CONDITIONAL',SEARCH:'ALLOW',EXPORT:'ALLOW',ASSIGN:'ALLOW',ARCHIVE:'CONDITIONAL' }, // CONDITIONAL = apenas tenant/office
    // Casos do escritório — acesso operacional
    cases:         { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'CONDITIONAL',DELETE:'DENY',LIST:'CONDITIONAL',SEARCH:'ALLOW',EXPORT:'ALLOW',ASSIGN:'ALLOW',ARCHIVE:'CONDITIONAL' }, // CONDITIONAL = tenant/office
    // Documentos do escritório
    documents:     { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'CONDITIONAL',DELETE:'DENY',LIST:'CONDITIONAL',EXPORT:'ALLOW',DOWNLOAD:'ALLOW',UPLOAD:'ALLOW',SHARE:'ALLOW',ARCHIVE:'CONDITIONAL' },
    // Agenda do escritório
    agenda:        { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'CONDITIONAL',DELETE:'CONDITIONAL',LIST:'ALLOW',EXPORT:'ALLOW' },
    // Financeiro do escritório (leitura + relatórios, sem estorno)
    financial:     { READ:'CONDITIONAL',LIST:'CONDITIONAL',EXPORT:'CONDITIONAL',CHARGEBACK:'DENY',APPROVE:'DENY' },
    escrow:        { READ:'CONDITIONAL',LIST:'CONDITIONAL',CREATE:'DENY',RELEASE:'DENY',DISPUTE:'DENY',MANAGE:'DENY' },
    // Serviços
    services:      { READ:'ALLOW' },
    // Notificações
    notifications: { READ:'ALLOW',MANAGE:'ALLOW' },
    // IA
    ai:            { READ:'ALLOW' },
    // Acadêmico — supervisão de estagiários
    academic:      { READ:'ALLOW',LIST:'ALLOW',MANAGE:'ALLOW' },
    // Auditoria do escritório (leitura)
    audit:         { READ:'CONDITIONAL',LIST:'CONDITIONAL',DELETE:'DENY' },
    // Sistema — sem acesso
    system:        { READ:'DENY',CONFIGURE:'DENY' },
    staff:         { READ:'DENY',DELEGATE:'DENY' },
    registrations: { READ:'DENY' },
    error_reports: { CREATE:'ALLOW',READ:'CONDITIONAL',LIST:'CONDITIONAL' },
  },

  // ── LAWYER ────────────────────────────────────────────────────────────────────
  // OFFICE — contexto profissional próprio
  lawyer: {
    profile:       { READ:'ALLOW',UPDATE:'ALLOW' },
    users:         { READ:'DENY',LIST:'DENY',IMPERSONATE:'DENY' },
    clients:       { CREATE:'DENY',READ:'CONDITIONAL',LIST:'CONDITIONAL',ASSIGN:'ALLOW',EXPORT:'DENY',UPDATE:'DENY' }, // CONDITIONAL = apenas clientes vinculados
    cases:         { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'CONDITIONAL',DELETE:'DENY',LIST:'CONDITIONAL',ASSIGN:'ALLOW',EXPORT:'ALLOW',ARCHIVE:'CONDITIONAL' }, // CONDITIONAL = apenas casos próprios
    documents:     { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'CONDITIONAL',DELETE:'DENY',LIST:'CONDITIONAL',EXPORT:'ALLOW',DOWNLOAD:'ALLOW',UPLOAD:'ALLOW',SHARE:'CONDITIONAL' }, // CONDITIONAL = próprios/vinculados
    agenda:        { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW' },
    financial:     { READ:'CONDITIONAL',LIST:'CONDITIONAL',EXPORT:'CONDITIONAL',CHARGEBACK:'DENY',APPROVE:'DENY' }, // CONDITIONAL = apenas próprio
    escrow:        { CREATE:'ALLOW',READ:'CONDITIONAL',RELEASE:'ALLOW',DISPUTE:'ALLOW',MANAGE:'DENY' },
    team:          { READ:'CONDITIONAL',LIST:'CONDITIONAL',INVITE:'DENY',MANAGE:'DENY' }, // pode ver membros do office
    roles:         { READ:'DENY',DELEGATE:'ALLOW',REVOKE:'ALLOW',MANAGE:'DENY' }, // delega para secretary/intern/legal_assistant
    registrations: { READ:'DENY' },
    notifications: { READ:'ALLOW' },
    academic:      { READ:'ALLOW',MANAGE:'CONDITIONAL' }, // pode supervisionar seus estagiários
    audit:         { READ:'CONDITIONAL',LIST:'CONDITIONAL',DELETE:'DENY' }, // CONDITIONAL = apenas própria auditoria
    ai:            { READ:'ALLOW' },
    system:        { READ:'DENY',CONFIGURE:'DENY' },
    staff:         { READ:'CONDITIONAL',DELEGATE:'ALLOW',REVOKE:'ALLOW' }, // apenas sua secretária/estagiário
    error_reports: { CREATE:'ALLOW',READ:'CONDITIONAL' },
  },

  // ── SECRETARY ─────────────────────────────────────────────────────────────────
  // ASSIGNED — apoio administrativo para o advogado vinculado
  secretary: {
    profile:       { READ:'ALLOW',UPDATE:'ALLOW' },
    users:         { READ:'DENY',IMPERSONATE:'DENY' },
    clients:       { READ:'CONDITIONAL',LIST:'CONDITIONAL',UPDATE:'DENY',DELETE:'DENY',EXPORT:'DENY' }, // apenas vinculados ao advogado
    cases:         { READ:'CONDITIONAL',LIST:'CONDITIONAL',UPDATE:'DENY',DELETE:'DENY',CREATE:'DENY',ARCHIVE:'DENY' },
    documents:     { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'DENY',DELETE:'DENY',LIST:'CONDITIONAL',UPLOAD:'ALLOW',DOWNLOAD:'CONDITIONAL',SHARE:'DENY' },
    agenda:        { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW' }, // Função principal
    financial:     { READ:'DENY',CHARGEBACK:'DENY',EXPORT:'DENY' },
    escrow:        { READ:'DENY' },
    notifications: { READ:'ALLOW' },
    audit:         { READ:'CONDITIONAL',DELETE:'DENY' },
    ai:            { READ:'DENY' },
    system:        { READ:'DENY',CONFIGURE:'DENY' },
    team:          { READ:'CONDITIONAL',INVITE:'DENY',MANAGE:'DENY' }, // pode ver quem está no time
    staff:         { READ:'DENY',DELEGATE:'DENY' },
    registrations: { READ:'DENY' },
    academic:      { READ:'DENY' },
    content:       { READ:'DENY' },
    security:      { READ:'DENY' },
    error_reports: { CREATE:'ALLOW' },
  },

  // ── LEGAL ASSISTANT ───────────────────────────────────────────────────────────
  // ASSIGNED — apoio jurídico técnico para o advogado vinculado
  legal_assistant: {
    profile:       { READ:'ALLOW',UPDATE:'ALLOW' },
    users:         { READ:'DENY',IMPERSONATE:'DENY' },
    clients:       { READ:'CONDITIONAL',LIST:'CONDITIONAL',UPDATE:'DENY',DELETE:'DENY',EXPORT:'DENY' }, // apenas clientes do advogado vinculado
    cases:         { READ:'CONDITIONAL',LIST:'CONDITIONAL',UPDATE:'CONDITIONAL',DELETE:'DENY',CREATE:'DENY',ARCHIVE:'DENY' }, // CONDITIONAL = apenas casos atribuídos
    documents:     { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'CONDITIONAL',DELETE:'DENY',LIST:'CONDITIONAL',UPLOAD:'ALLOW',DOWNLOAD:'CONDITIONAL',SHARE:'CONDITIONAL' },
    agenda:        { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'CONDITIONAL',DELETE:'DENY',LIST:'CONDITIONAL' },
    financial:     { READ:'CONDITIONAL',CHARGEBACK:'DENY',APPROVE:'DENY',EXPORT:'DENY' }, // apenas leitura do que lhe é permitido
    escrow:        { READ:'DENY' },
    notifications: { READ:'ALLOW' },
    audit:         { READ:'CONDITIONAL',DELETE:'DENY' },
    ai:            { READ:'ALLOW' },
    system:        { READ:'DENY',CONFIGURE:'DENY' },
    team:          { READ:'CONDITIONAL',INVITE:'DENY',MANAGE:'DENY' },
    staff:         { READ:'DENY',DELEGATE:'DENY' },
    registrations: { READ:'DENY' },
    academic:      { READ:'DENY' },
    content:       { READ:'DENY' },
    security:      { READ:'DENY' },
    error_reports: { CREATE:'ALLOW' },
  },

  // ── INTERN ────────────────────────────────────────────────────────────────────
  // ASSIGNED — estagiário/bacharelando — menor privilégio
  intern: {
    profile:       { READ:'ALLOW',UPDATE:'ALLOW' },
    users:         { READ:'DENY',IMPERSONATE:'DENY' },
    clients:       { READ:'DENY',LIST:'DENY' }, // estagiário NÃO acessa dados de clientes diretamente
    cases:         { READ:'CONDITIONAL',LIST:'CONDITIONAL',UPDATE:'DENY',DELETE:'DENY',CREATE:'DENY',ARCHIVE:'DENY' }, // apenas casos atribuídos
    documents:     { READ:'CONDITIONAL',LIST:'CONDITIONAL',CREATE:'DENY',UPDATE:'DENY',DELETE:'DENY',DOWNLOAD:'CONDITIONAL',UPLOAD:'DENY',SHARE:'DENY' }, // apenas documentos autorizados
    agenda:        { READ:'CONDITIONAL',CREATE:'DENY',UPDATE:'DENY',DELETE:'DENY' }, // apenas própria agenda
    financial:     { READ:'DENY',CHARGEBACK:'DENY',EXPORT:'DENY' },
    escrow:        { READ:'DENY' },
    notifications: { READ:'ALLOW' },
    academic:      { READ:'ALLOW',UPDATE:'ALLOW' }, // registra horas e atividades
    audit:         { READ:'CONDITIONAL',DELETE:'DENY' },
    ai:            { READ:'ALLOW' }, // IA para assistência acadêmica
    system:        { READ:'DENY',CONFIGURE:'DENY' },
    team:          { READ:'DENY',INVITE:'DENY',MANAGE:'DENY' },
    staff:         { READ:'DENY',DELEGATE:'DENY' },
    registrations: { READ:'DENY' },
    content:       { READ:'DENY' },
    security:      { READ:'DENY' },
    error_reports: { CREATE:'ALLOW' },
  },

  // ── STUDENT ────────────────────────────────────────────────────────────────────
  // OWN — estudante sem vínculo formal — menor privilégio absoluto
  student: {
    profile:       { READ:'ALLOW',UPDATE:'ALLOW' },
    users:         { READ:'DENY',IMPERSONATE:'DENY' },
    clients:       { READ:'DENY',LIST:'DENY' },  // NUNCA acessa dados de clientes
    cases:         { READ:'DENY',LIST:'DENY',CREATE:'DENY',UPDATE:'DENY',DELETE:'DENY' }, // NUNCA acessa casos
    documents:     { READ:'DENY',LIST:'DENY',CREATE:'DENY',UPDATE:'DENY',DELETE:'DENY' }, // NUNCA acessa documentos jurídicos
    agenda:        { READ:'DENY',CREATE:'DENY',UPDATE:'DENY',DELETE:'DENY' },
    financial:     { READ:'DENY',CHARGEBACK:'DENY',EXPORT:'DENY' },
    escrow:        { READ:'DENY' },
    notifications: { READ:'ALLOW' },
    academic:      { READ:'ALLOW',UPDATE:'CONDITIONAL' }, // somente próprio registro acadêmico
    content:       { READ:'ALLOW' }, // conteúdo acadêmico público
    audit:         { READ:'CONDITIONAL',DELETE:'DENY' }, // somente seus próprios logs
    ai:            { READ:'DENY' }, // sem acesso a IA jurídica
    system:        { READ:'DENY',CONFIGURE:'DENY' },
    team:          { READ:'DENY',INVITE:'DENY',MANAGE:'DENY' },
    staff:         { READ:'DENY',DELEGATE:'DENY' },
    registrations: { READ:'DENY' },
    security:      { READ:'DENY' },
    error_reports: { CREATE:'ALLOW' },
  },

  // ── CLIENT ────────────────────────────────────────────────────────────────────
  // OWN — somente seus próprios dados e recursos diretamente relacionados
  client: {
    profile:       { READ:'ALLOW',UPDATE:'ALLOW' }, // próprio perfil
    users:         { READ:'DENY',LIST:'DENY',IMPERSONATE:'DENY' },
    clients:       { READ:'CONDITIONAL',UPDATE:'CONDITIONAL',LIST:'DENY',DELETE:'DENY',EXPORT:'DENY' }, // apenas próprio registro
    lawyers:       { READ:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW' }, // busca pública de advogados
    cases:         { READ:'CONDITIONAL',LIST:'CONDITIONAL',CREATE:'DENY',UPDATE:'DENY',DELETE:'DENY',ARCHIVE:'DENY' }, // apenas próprios casos
    documents:     { READ:'CONDITIONAL',LIST:'CONDITIONAL',CREATE:'DENY',UPDATE:'DENY',DELETE:'DENY',DOWNLOAD:'CONDITIONAL',UPLOAD:'DENY',SHARE:'DENY' }, // apenas próprios docs autorizados
    agenda:        { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'DENY',DELETE:'DENY',LIST:'CONDITIONAL' }, // agendamento próprio
    financial:     { READ:'CONDITIONAL',LIST:'CONDITIONAL',EXPORT:'DENY',CHARGEBACK:'DENY',APPROVE:'DENY' }, // apenas próprio financeiro
    escrow:        { READ:'CONDITIONAL',LIST:'CONDITIONAL',CREATE:'DENY',RELEASE:'DENY',DISPUTE:'DENY',MANAGE:'DENY' }, // leitura dos seus escrows
    notifications: { READ:'ALLOW' },
    error_reports: { CREATE:'ALLOW',READ:'CONDITIONAL' },
    audit:         { READ:'CONDITIONAL',LIST:'CONDITIONAL',DELETE:'DENY' }, // somente seus logs
    ai:            { READ:'DENY' },
    system:        { READ:'DENY',CONFIGURE:'DENY' },
    team:          { READ:'DENY',INVITE:'DENY',MANAGE:'DENY' },
    staff:         { READ:'DENY',DELEGATE:'DENY' },
    registrations: { READ:'DENY' },
    academic:      { READ:'DENY' },
    content:       { READ:'DENY' },
    security:      { READ:'DENY' },
  },
};

// ─── Matrix Query Function ────────────────────────────────────────────────────

export interface MatrixCheckContext {
  /** ID do recurso a verificar (para condicionais de ownership) */
  resourceId?: string;
  /** ID do dono do recurso (para condicionais OWN) */
  resourceOwnerId?: string;
  /** ID do usuário atual (para condicionais OWN) */
  userId?: string;
  /** Tenant ID do usuário atual */
  tenantId?: string;
  /** Tenant ID do recurso (para condicionais TENANT/cross-tenant) */
  resourceTenantId?: string;
  /** ID do escritório atual (para condicionais OFFICE) */
  officeId?: string;
  /** ID do escritório do recurso (para condicionais OFFICE) */
  resourceOfficeId?: string;
  /** IDs atribuídos ao usuário (para condicionais ASSIGNED) */
  assignedIds?: string[];
  /** Usuários autorizados explicitamente (para condicionais AUTHORIZED) */
  authorizedUserIds?: string[];
}

/**
 * Consulta a matriz RBAC e resolve condicionais.
 *
 * Ordem de resolução de condicionais:
 *   1. OWN (resourceOwnerId === userId)
 *   2. ASSIGNED (assignedIds.includes(resourceId ou resourceOwnerId))
 *   3. OFFICE (officeId === resourceOfficeId)
 *   4. TENANT (tenantId === resourceTenantId)
 *   5. AUTHORIZED (authorizedUserIds.includes(userId))
 *   → Nenhuma satisfeita: DENY
 *
 * @returns
 *   'ALLOW'       — acesso concedido
 *   'DENY'        — acesso negado
 *   'CONDITIONAL' — condicional não resolvida (context não fornecido)
 */
export function checkMatrix(
  role: SystemRole,
  resource: Resource,
  action: Action,
  context?: MatrixCheckContext,
): MatrixResult {
  const roleMatrix = RBAC_MATRIX[role];
  if (!roleMatrix) return 'DENY';

  const resourceMatrix = roleMatrix[resource];
  if (!resourceMatrix) return 'DENY';

  const result = resourceMatrix[action];
  if (!result) return 'DENY';

  // Resolver condicional se contexto fornecido
  if (result === 'CONDITIONAL' && context) {
    const { resourceId, resourceOwnerId, userId, tenantId, resourceTenantId, officeId, resourceOfficeId, assignedIds, authorizedUserIds } = context;

    // 1. OWN: usuário é dono do recurso
    if (resourceOwnerId && userId && resourceOwnerId === userId) return 'ALLOW';

    // 2. ASSIGNED: recurso está na lista de atribuídos ao usuário
    const targetId = resourceId || resourceOwnerId;
    if (assignedIds && targetId && assignedIds.includes(targetId)) return 'ALLOW';

    // 3. OFFICE: mesmo escritório
    if (officeId && resourceOfficeId && officeId === resourceOfficeId) return 'ALLOW';

    // 4. TENANT: mesmo tenant (para roles com escopo tenant)
    if (tenantId && resourceTenantId && tenantId === resourceTenantId) return 'ALLOW';

    // 5. AUTHORIZED: usuário está na lista de autorizados explicitamente
    if (authorizedUserIds && userId && authorizedUserIds.includes(userId)) return 'ALLOW';

    return 'DENY'; // Condicional não satisfeita → DENY
  }

  return result;
}

/**
 * Verifica acesso para múltiplas ações de uma vez.
 * Retorna um mapa action → resultado.
 */
export function checkMatrixBulk(
  role: SystemRole,
  resource: Resource,
  actions: Action[],
  context?: MatrixCheckContext,
): Record<Action, MatrixResult> {
  return Object.fromEntries(
    actions.map((action) => [action, checkMatrix(role, resource, action, context)]),
  ) as Record<Action, MatrixResult>;
}

/**
 * Verifica se uma role tem acesso efetivo (ALLOW) a uma operação.
 * Abstração booleana de checkMatrix para uso simples.
 */
export function isAllowed(
  role: SystemRole,
  resource: Resource,
  action: Action,
  context?: MatrixCheckContext,
): boolean {
  return checkMatrix(role, resource, action, context) === 'ALLOW';
}
