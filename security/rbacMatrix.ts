/**
 * security/rbacMatrix.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — RBAC MATRIX: ROLE × RESOURCE × ACTION
 *
 * Matriz completa de controle de acesso com três resultados possíveis:
 *   ALLOW       → acesso explicitamente concedido
 *   DENY        → acesso explicitamente negado (DENY BY DEFAULT)
 *   CONDITIONAL → acesso concedido apenas se condição de escopo/ownership for atendida
 *
 * A consulta à matriz é realizada via checkMatrix().
 * Qualquer combinação não listada retorna DENY automaticamente.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { SystemRole } from './rbac';

// ─── Resources & Actions ──────────────────────────────────────────────────────

export type Resource =
  | 'users'
  | 'clients'
  | 'lawyers'
  | 'cases'
  | 'documents'
  | 'agenda'
  | 'financial'
  | 'escrow'
  | 'provisioning'
  | 'services'
  | 'staff'
  | 'registrations'
  | 'audit'
  | 'ai'
  | 'system'
  | 'roles';

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
  | 'IMPERSONATE';

export type MatrixResult = 'ALLOW' | 'DENY' | 'CONDITIONAL';

// ─── Matrix Definition ────────────────────────────────────────────────────────
// Estrutura: RBAC_MATRIX[role][resource][action] → MatrixResult
// Células ausentes = DENY (DENY BY DEFAULT)

type RoleResourceMatrix = Partial<Record<Resource, Partial<Record<Action, MatrixResult>>>>;
type FullMatrix = Record<SystemRole, RoleResourceMatrix>;

export const RBAC_MATRIX: FullMatrix = {

  // ── SUPER ADMIN ─────────────────────────────────────────────────────────────
  super_admin: {
    users:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',IMPERSONATE:'ALLOW' },
    roles:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',DELEGATE:'ALLOW',REVOKE:'ALLOW',CONFIGURE:'ALLOW' },
    clients:       { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',ASSIGN:'ALLOW' },
    lawyers:       { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',APPROVE:'ALLOW',REJECT:'ALLOW' },
    cases:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',ASSIGN:'ALLOW',APPROVE:'ALLOW' },
    documents:     { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW' },
    agenda:        { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW' },
    financial:     { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',CHARGEBACK:'ALLOW',APPROVE:'ALLOW',AUDIT:'ALLOW' },
    escrow:        { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',RELEASE:'ALLOW',DISPUTE:'ALLOW',MANAGE:'ALLOW' },
    provisioning:  { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',MANAGE:'ALLOW',CONFIGURE:'ALLOW' },
    services:      { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',MANAGE:'ALLOW',CONFIGURE:'ALLOW' },
    staff:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',DELEGATE:'ALLOW',REVOKE:'ALLOW' },
    registrations: { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',APPROVE:'ALLOW',REJECT:'ALLOW',EXPORT:'ALLOW' },
    audit:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',AUDIT:'ALLOW' },
    ai:            { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',MANAGE:'ALLOW',CONFIGURE:'ALLOW' },
    system:        { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',CONFIGURE:'ALLOW',AUDIT:'ALLOW',MANAGE:'ALLOW' },
  },

  // ── ADMIN ────────────────────────────────────────────────────────────────────
  admin: {
    users:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',IMPERSONATE:'DENY' },
    roles:         { CREATE:'DENY',READ:'ALLOW',UPDATE:'DENY',DELETE:'DENY',DELEGATE:'ALLOW',REVOKE:'ALLOW',CONFIGURE:'DENY' },
    clients:       { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',ASSIGN:'ALLOW' },
    lawyers:       { CREATE:'DENY',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW',SEARCH:'ALLOW',APPROVE:'ALLOW',REJECT:'ALLOW' },
    cases:         { CREATE:'DENY',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW',SEARCH:'ALLOW',EXPORT:'ALLOW',ASSIGN:'ALLOW',APPROVE:'DENY' },
    documents:     { CREATE:'DENY',READ:'ALLOW',UPDATE:'DENY',DELETE:'DENY',LIST:'ALLOW',EXPORT:'ALLOW' },
    agenda:        { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW' },
    financial:     { READ:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',CHARGEBACK:'DENY',APPROVE:'DENY',AUDIT:'ALLOW' },
    escrow:        { CREATE:'DENY',READ:'ALLOW',UPDATE:'DENY',DELETE:'DENY',RELEASE:'DENY',DISPUTE:'DENY',MANAGE:'ALLOW' },
    provisioning:  { READ:'ALLOW',LIST:'ALLOW',MANAGE:'DENY',CONFIGURE:'DENY' },
    services:      { READ:'ALLOW',MANAGE:'ALLOW',CONFIGURE:'DENY' },
    staff:         { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW',DELEGATE:'ALLOW',REVOKE:'ALLOW' },
    registrations: { CREATE:'DENY',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'DENY',LIST:'ALLOW',APPROVE:'ALLOW',REJECT:'ALLOW',EXPORT:'ALLOW' },
    audit:         { READ:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',DELETE:'DENY',AUDIT:'ALLOW' },
    ai:            { READ:'ALLOW',MANAGE:'DENY',CONFIGURE:'DENY' },
    system:        { READ:'ALLOW',CONFIGURE:'DENY',AUDIT:'ALLOW',MANAGE:'DENY' },
  },

  // ── STAFF — FINANCE ADMIN ────────────────────────────────────────────────────
  staff_finance_admin: {
    users:         { READ:'DENY',LIST:'DENY',IMPERSONATE:'DENY' },
    clients:       { READ:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW' },
    cases:         { READ:'DENY' },
    financial:     { READ:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',CHARGEBACK:'ALLOW',APPROVE:'ALLOW',AUDIT:'ALLOW' },
    escrow:        { READ:'ALLOW',LIST:'ALLOW',RELEASE:'ALLOW',DISPUTE:'ALLOW',MANAGE:'ALLOW' },
    provisioning:  { READ:'ALLOW',LIST:'ALLOW',MANAGE:'ALLOW' },
    registrations: { READ:'ALLOW',LIST:'ALLOW' },
    audit:         { READ:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',DELETE:'DENY' },
    system:        { READ:'ALLOW',CONFIGURE:'DENY' },
  },

  // ── STAFF — COMPLIANCE AUDITOR ────────────────────────────────────────────────
  staff_compliance_auditor: {
    users:         { READ:'DENY',IMPERSONATE:'DENY' },
    clients:       { READ:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW' },
    lawyers:       { READ:'ALLOW',LIST:'ALLOW' },
    cases:         { READ:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW' },
    documents:     { READ:'ALLOW',LIST:'ALLOW' },
    financial:     { READ:'DENY' },
    escrow:        { READ:'DENY' },
    registrations: { READ:'ALLOW',LIST:'ALLOW' },
    audit:         { READ:'ALLOW',LIST:'ALLOW',EXPORT:'ALLOW',DELETE:'DENY',AUDIT:'ALLOW' },
    provisioning:  { READ:'ALLOW' },
    system:        { READ:'ALLOW',CONFIGURE:'DENY' },
  },

  // ── STAFF — SUPPORT L1 ────────────────────────────────────────────────────────
  staff_support_l1: {
    clients:       { READ:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW' },
    cases:         { READ:'ALLOW',LIST:'ALLOW' },
    registrations: { READ:'ALLOW',LIST:'ALLOW' },
    audit:         { READ:'ALLOW',LIST:'ALLOW' },
    financial:     { READ:'DENY' },
    escrow:        { READ:'DENY' },
    system:        { READ:'ALLOW',CONFIGURE:'DENY' },
  },

  // ── LAWYER ────────────────────────────────────────────────────────────────────
  lawyer: {
    // Scope: office + own
    users:         { READ:'DENY',LIST:'DENY',IMPERSONATE:'DENY' },
    clients:       { CREATE:'DENY',READ:'CONDITIONAL',LIST:'CONDITIONAL',ASSIGN:'ALLOW',EXPORT:'DENY' }, // CONDITIONAL = apenas clientes vinculados
    cases:         { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'CONDITIONAL',DELETE:'DENY',LIST:'CONDITIONAL',ASSIGN:'ALLOW',EXPORT:'ALLOW' }, // CONDITIONAL = apenas casos próprios
    documents:     { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'CONDITIONAL',DELETE:'DENY',LIST:'CONDITIONAL',EXPORT:'ALLOW' }, // CONDITIONAL = próprios/vinculados
    agenda:        { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW' },
    financial:     { READ:'CONDITIONAL',LIST:'CONDITIONAL',EXPORT:'CONDITIONAL',CHARGEBACK:'DENY',APPROVE:'DENY' }, // CONDITIONAL = apenas próprio
    escrow:        { CREATE:'ALLOW',READ:'CONDITIONAL',RELEASE:'ALLOW',DISPUTE:'ALLOW',MANAGE:'DENY' },
    registrations: { READ:'DENY' },
    audit:         { READ:'CONDITIONAL',LIST:'CONDITIONAL',DELETE:'DENY' }, // CONDITIONAL = apenas própria auditoria
    ai:            { READ:'ALLOW' },
    system:        { READ:'DENY',CONFIGURE:'DENY' },
    staff:         { READ:'CONDITIONAL',DELEGATE:'ALLOW',REVOKE:'ALLOW' }, // apenas sua secretária/estagiário
  },

  // ── SECRETARY ─────────────────────────────────────────────────────────────────
  secretary: {
    users:         { READ:'DENY',IMPERSONATE:'DENY' },
    clients:       { READ:'CONDITIONAL',LIST:'CONDITIONAL',UPDATE:'DENY',DELETE:'DENY',EXPORT:'DENY' }, // apenas vinculados ao advogado
    cases:         { READ:'CONDITIONAL',LIST:'CONDITIONAL',UPDATE:'DENY',DELETE:'DENY',CREATE:'DENY' },
    documents:     { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'DENY',DELETE:'DENY',LIST:'CONDITIONAL' },
    agenda:        { CREATE:'ALLOW',READ:'ALLOW',UPDATE:'ALLOW',DELETE:'ALLOW',LIST:'ALLOW' },
    financial:     { READ:'DENY',CHARGEBACK:'DENY' },
    escrow:        { READ:'DENY' },
    audit:         { READ:'CONDITIONAL',DELETE:'DENY' },
    ai:            { READ:'DENY' },
    system:        { READ:'DENY',CONFIGURE:'DENY' },
    staff:         { READ:'DENY',DELEGATE:'DENY' },
    registrations: { READ:'DENY' },
  },

  // ── INTERN ────────────────────────────────────────────────────────────────────
  intern: {
    users:         { READ:'DENY',IMPERSONATE:'DENY' },
    clients:       { READ:'DENY',LIST:'DENY' },
    cases:         { READ:'CONDITIONAL',LIST:'CONDITIONAL',UPDATE:'DENY',DELETE:'DENY',CREATE:'DENY' }, // apenas casos atribuídos
    documents:     { READ:'CONDITIONAL',LIST:'CONDITIONAL',CREATE:'DENY',UPDATE:'DENY',DELETE:'DENY' }, // apenas documentos autorizados
    agenda:        { READ:'CONDITIONAL',CREATE:'DENY',UPDATE:'DENY',DELETE:'DENY' }, // apenas própria agenda
    financial:     { READ:'DENY',CHARGEBACK:'DENY' },
    escrow:        { READ:'DENY' },
    audit:         { READ:'CONDITIONAL',DELETE:'DENY' },
    ai:            { READ:'ALLOW' },
    system:        { READ:'DENY',CONFIGURE:'DENY' },
    staff:         { READ:'DENY',DELEGATE:'DENY' },
    registrations: { READ:'DENY' },
  },

  // ── CLIENT ────────────────────────────────────────────────────────────────────
  client: {
    users:         { READ:'DENY',LIST:'DENY',IMPERSONATE:'DENY' },
    clients:       { READ:'CONDITIONAL',UPDATE:'CONDITIONAL',LIST:'DENY' }, // apenas próprio perfil
    lawyers:       { READ:'ALLOW',LIST:'ALLOW',SEARCH:'ALLOW' }, // busca pública
    cases:         { READ:'CONDITIONAL',LIST:'CONDITIONAL',CREATE:'DENY',UPDATE:'DENY',DELETE:'DENY' }, // apenas próprios casos
    documents:     { READ:'CONDITIONAL',LIST:'CONDITIONAL',CREATE:'DENY',UPDATE:'DENY',DELETE:'DENY' }, // apenas próprios docs
    agenda:        { CREATE:'ALLOW',READ:'CONDITIONAL',UPDATE:'DENY',DELETE:'DENY',LIST:'CONDITIONAL' }, // apenas própria agenda
    financial:     { READ:'CONDITIONAL',LIST:'CONDITIONAL',EXPORT:'DENY',CHARGEBACK:'DENY' }, // apenas próprio financeiro
    escrow:        { READ:'CONDITIONAL',LIST:'CONDITIONAL',CREATE:'DENY',RELEASE:'DENY',DISPUTE:'DENY',MANAGE:'DENY' },
    audit:         { READ:'CONDITIONAL',LIST:'CONDITIONAL',DELETE:'DENY' },
    ai:            { READ:'DENY' },
    system:        { READ:'DENY',CONFIGURE:'DENY' },
    staff:         { READ:'DENY',DELEGATE:'DENY' },
    registrations: { READ:'DENY' },
  },
};

// ─── Matrix Query Function ────────────────────────────────────────────────────

export interface MatrixCheckContext {
  /** ID do recurso a verificar (para condicionais) */
  resourceOwnerId?: string;
  /** ID do usuário atual (para condicionais) */
  userId?: string;
  /** ID do escritório atual (para condicionais) */
  officeId?: string;
  /** ID do escritório do recurso (para condicionais) */
  resourceOfficeId?: string;
  /** IDs atribuídos ao usuário (para condicionais) */
  assignedIds?: string[];
}

/**
 * Consulta a matriz RBAC e resolve condicionais.
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
    const { resourceOwnerId, userId, officeId, resourceOfficeId, assignedIds } = context;

    // OWN: usuário é dono do recurso
    if (resourceOwnerId && userId && resourceOwnerId === userId) return 'ALLOW';
    // ASSIGNED: recurso está na lista de atribuídos
    if (assignedIds && resourceOwnerId && assignedIds.includes(resourceOwnerId)) return 'ALLOW';
    // OFFICE: mesmo escritório
    if (officeId && resourceOfficeId && officeId === resourceOfficeId) return 'ALLOW';

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
