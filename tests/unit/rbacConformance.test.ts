/**
 * tests/unit/rbacConformance.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — RBAC CONFORMANCE & SECURITY TEST SUITE v3.0
 *
 * Cobre:
 *   1. Conformidade da matriz RBAC (ALLOW/DENY por role × resource × action)
 *   2. Proteção IDOR (acesso por ID sem autorização)
 *   3. Bloqueio de escalada de privilégio
 *   4. Segregation of Duties (SoD)
 *   5. Regras de delegação
 *   6. canAccessView / proteção de rotas
 *   7. Isolamento entre usuários (User A ≠ User B)
 *   8. Isolamento entre escritórios (Office A ≠ Office B)
 *   9. Isolamento Acadêmico (Student vs Intern vs Lawyer)
 *  10. Regra DENY BY DEFAULT
 *  11. Super Admin — acesso irrestrito e impersonação
 *  12. Novos Perfis: Gestor, Assistente Jurídico e Estudante
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  hasPermission,
  canImpersonate,
  canDelegate,
  canElevateTo,
  hasSoDConflict,
  canAccessView,
  ROLE_LEVELS,
  ROLE_PERMISSIONS,
  ROLE_DEFINITIONS,
  isStaffRole,
  isOfficeRole,
  isOfficeStaffRole,
  isAcademicRole,
  type SystemRole,
  type Permission,
} from '../../security/rbac';

import {
  checkMatrix,
  isAllowed,
  type Resource,
  type Action,
} from '../../security/rbacMatrix';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RbacTestResult {
  suite: string;
  testName: string;
  passed: boolean;
  expected: string;
  actual: string;
  durationMs: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function rbacTest(
  suite: string,
  testName: string,
  condition: boolean,
  expected: string,
  actual: string,
): RbacTestResult {
  const t0 = performance.now();
  return {
    suite,
    testName,
    passed: condition,
    expected,
    actual,
    durationMs: Math.round(performance.now() - t0),
  };
}

// ─── Suite 1: DENY BY DEFAULT ────────────────────────────────────────────────

function testDenyByDefault(): RbacTestResult[] {
  const results: RbacTestResult[] = [];

  // Uma role sem permissão deve retornar false
  const clientCanAdmin = hasPermission('client', 'admin:dashboard');
  results.push(rbacTest('DENY_BY_DEFAULT', 'client não pode acessar admin:dashboard',
    !clientCanAdmin, 'false', String(clientCanAdmin)));

  // Permissão inexistente deve retornar false
  const impossiblePerm = hasPermission('super_admin', 'nonexistent:action' as Permission);
  results.push(rbacTest('DENY_BY_DEFAULT', 'permissão inexistente retorna false',
    !impossiblePerm, 'false', String(impossiblePerm)));

  // Sem role (undefined) usa client como fallback — client não tem admin
  const nullRole = hasPermission(undefined as unknown as SystemRole, 'admin:dashboard');
  results.push(rbacTest('DENY_BY_DEFAULT', 'role undefined não tem admin:dashboard',
    !nullRole, 'false', String(nullRole)));

  // intern não pode acessar financial:approve
  const internFinancial = hasPermission('intern', 'financial:approve');
  results.push(rbacTest('DENY_BY_DEFAULT', 'intern não pode financial:approve',
    !internFinancial, 'false', String(internFinancial)));

  // client não pode roles:manage
  const clientRoles = hasPermission('client', 'roles:manage');
  results.push(rbacTest('DENY_BY_DEFAULT', 'client não pode roles:manage',
    !clientRoles, 'false', String(clientRoles)));

  // student não pode acessar cases:read
  const studentCases = hasPermission('student', 'cases:read');
  results.push(rbacTest('DENY_BY_DEFAULT', 'student não pode cases:read',
    !studentCases, 'false', String(studentCases)));

  return results;
}

// ─── Suite 2: ROLE × PERMISSION ALLOW ────────────────────────────────────────

function testExplicitAllow(): RbacTestResult[] {
  const results: RbacTestResult[] = [];

  const cases: [SystemRole, Permission, string][] = [
    ['super_admin', 'users:impersonate', 'super_admin tem users:impersonate'],
    ['super_admin', 'roles:manage', 'super_admin tem roles:manage'],
    ['super_admin', 'audit:delete', 'super_admin tem audit:delete'],
    ['admin', 'staff:delegate', 'admin tem staff:delegate'],
    ['admin', 'lawyers:approve', 'admin tem lawyers:approve'],
    ['staff_finance_admin', 'financial:chargeback', 'finance_admin tem financial:chargeback'],
    ['staff_finance_admin', 'escrow:release', 'finance_admin tem escrow:release'],
    ['staff_compliance_auditor', 'audit:read', 'compliance_auditor tem audit:read'],
    ['staff_compliance_auditor', 'audit:oab_check', 'compliance_auditor tem audit:oab_check'],
    ['gestor', 'team:manage', 'gestor tem team:manage'],
    ['gestor', 'team:invite', 'gestor tem team:invite'],
    ['gestor', 'cases:create', 'gestor tem cases:create'],
    ['lawyer', 'cases:create', 'lawyer tem cases:create'],
    ['lawyer', 'escrow:create', 'lawyer tem escrow:create'],
    ['lawyer', 'ai:use', 'lawyer tem ai:use'],
    ['secretary', 'agenda:create', 'secretary tem agenda:create'],
    ['secretary', 'documents:upload', 'secretary tem documents:upload'],
    ['legal_assistant', 'cases:update', 'legal_assistant tem cases:update'],
    ['legal_assistant', 'documents:share', 'legal_assistant tem documents:share'],
    ['intern', 'ai:use', 'intern tem ai:use'],
    ['intern', 'cases:read', 'intern tem cases:read'],
    ['intern', 'academic:simulate', 'intern tem academic:simulate'],
    ['student', 'academic:read', 'student tem academic:read'],
    ['student', 'academic:simulate', 'student tem academic:simulate'],
    ['client', 'client:dashboard', 'client tem client:dashboard'],
    ['client', 'agenda:create', 'client tem agenda:create'],
  ];

  for (const [role, permission, name] of cases) {
    const result = hasPermission(role, permission);
    results.push(rbacTest('ALLOW', name, result, 'true', String(result)));
  }

  return results;
}

// ─── Suite 3: ROLE × PERMISSION DENY ─────────────────────────────────────────

function testExplicitDeny(): RbacTestResult[] {
  const results: RbacTestResult[] = [];

  const cases: [SystemRole, Permission, string][] = [
    // admin não pode impersonar nem deletar
    ['admin', 'users:impersonate', 'admin NÃO pode users:impersonate'],
    ['admin', 'roles:manage', 'admin NÃO pode roles:manage'],
    // finance_admin não administra staff
    ['staff_finance_admin', 'staff:create', 'finance_admin NÃO pode staff:create'],
    ['staff_finance_admin', 'users:impersonate', 'finance_admin NÃO pode users:impersonate'],
    // compliance_auditor não acessa financeiro
    ['staff_compliance_auditor', 'financial:read', 'compliance_auditor NÃO pode financial:read'],
    ['staff_compliance_auditor', 'escrow:release', 'compliance_auditor NÃO pode escrow:release'],
    // gestor não altera configurações globais nem impersona
    ['gestor', 'system:config', 'gestor NÃO pode system:config'],
    ['gestor', 'users:impersonate', 'gestor NÃO pode users:impersonate'],
    ['gestor', 'financial:chargeback', 'gestor NÃO pode financial:chargeback'],
    // lawyer não acessa configuração de sistema
    ['lawyer', 'system:config', 'lawyer NÃO pode system:config'],
    ['lawyer', 'users:impersonate', 'lawyer NÃO pode users:impersonate'],
    ['lawyer', 'financial:chargeback', 'lawyer NÃO pode financial:chargeback'],
    // secretary não acessa financeiro nem configuração
    ['secretary', 'financial:read', 'secretary NÃO pode financial:read'],
    ['secretary', 'roles:delegate', 'secretary NÃO pode roles:delegate'],
    ['secretary', 'audit:write', 'secretary NÃO pode audit:write'],
    // legal_assistant não pode deletar casos nem gerenciar sistema
    ['legal_assistant', 'cases:delete', 'legal_assistant NÃO pode cases:delete'],
    ['legal_assistant', 'system:config', 'legal_assistant NÃO pode system:config'],
    // intern não acessa clientes nem financeiro
    ['intern', 'clients:read', 'intern NÃO pode clients:read'],
    ['intern', 'financial:read', 'intern NÃO pode financial:read'],
    ['intern', 'staff:delegate', 'intern NÃO pode staff:delegate'],
    // student não acessa dados de clientes nem casos jurídicos
    ['student', 'clients:read', 'student NÃO pode clients:read'],
    ['student', 'cases:read', 'student NÃO pode cases:read'],
    ['student', 'documents:read', 'student NÃO pode documents:read'],
    ['student', 'financial:read', 'student NÃO pode financial:read'],
    ['student', 'ai:use', 'student NÃO pode ai:use'],
    // client não acessa dados de outros nem admin
    ['client', 'admin:dashboard', 'client NÃO pode admin:dashboard'],
    ['client', 'audit:write', 'client NÃO pode audit:write'],
    ['client', 'financial:chargeback', 'client NÃO pode financial:chargeback'],
  ];

  for (const [role, permission, name] of cases) {
    const hasIt = hasPermission(role, permission);
    results.push(rbacTest('DENY', name, !hasIt, 'false', String(hasIt)));
  }

  return results;
}

// ─── Suite 4: ESCALADA DE PRIVILÉGIO ─────────────────────────────────────────

function testPrivilegeEscalation(): RbacTestResult[] {
  const results: RbacTestResult[] = [];

  // client não pode virar admin
  const clientCanElevate = canElevateTo('client', 7);
  results.push(rbacTest('ESCALADA', 'client não pode elevar para nível 7 (admin)',
    !clientCanElevate, 'false', String(clientCanElevate)));

  // lawyer não pode elevar para admin
  const lawyerCanElevate = canElevateTo('lawyer', 7);
  results.push(rbacTest('ESCALADA', 'lawyer não pode elevar para nível 7 (admin)',
    !lawyerCanElevate, 'false', String(lawyerCanElevate)));

  // gestor não pode elevar para admin
  const gestorCanElevate = canElevateTo('gestor', 7);
  results.push(rbacTest('ESCALADA', 'gestor não pode elevar para nível 7 (admin)',
    !gestorCanElevate, 'false', String(gestorCanElevate)));

  // admin não pode criar outro super_admin
  const adminCanElevateSuperAdmin = canElevateTo('admin', 9);
  results.push(rbacTest('ESCALADA', 'admin não pode elevar para nível 9 (super_admin)',
    !adminCanElevateSuperAdmin, 'false', String(adminCanElevateSuperAdmin)));

  // super_admin pode criar admin (nível 7)
  const superAdminCanCreateAdmin = canElevateTo('super_admin', 7);
  results.push(rbacTest('ESCALADA', 'super_admin pode criar admin (nível 7)',
    superAdminCanCreateAdmin, 'true', String(superAdminCanCreateAdmin)));

  // super_admin não pode criar outro super_admin (nível 9)
  const superAdminCanCreateSuper = canElevateTo('super_admin', 9);
  results.push(rbacTest('ESCALADA', 'super_admin não pode criar super_admin (nível 9)',
    !superAdminCanCreateSuper, 'false', String(superAdminCanCreateSuper)));

  // Hierarquia de levels está correta
  const levelOrdering = (
    ROLE_LEVELS.super_admin > ROLE_LEVELS.admin &&
    ROLE_LEVELS.admin > ROLE_LEVELS.staff_finance_admin &&
    ROLE_LEVELS.staff_finance_admin > ROLE_LEVELS.lawyer &&
    ROLE_LEVELS.gestor === ROLE_LEVELS.lawyer &&
    ROLE_LEVELS.lawyer > ROLE_LEVELS.secretary &&
    ROLE_LEVELS.secretary > ROLE_LEVELS.client
  );
  results.push(rbacTest('ESCALADA', 'hierarquia de levels está correta (9>7>5>3>2>1)',
    levelOrdering, 'true', String(levelOrdering)));

  return results;
}

// ─── Suite 5: IMPERSONAÇÃO ────────────────────────────────────────────────────

function testImpersonation(): RbacTestResult[] {
  const results: RbacTestResult[] = [];

  const rolesNotAllowed: SystemRole[] = [
    'admin', 'staff_finance_admin', 'staff_compliance_auditor',
    'staff_support_l1', 'gestor', 'lawyer', 'secretary', 'legal_assistant', 'intern', 'student', 'client'
  ];

  for (const role of rolesNotAllowed) {
    const canImp = canImpersonate(role);
    results.push(rbacTest('IMPERSONACAO', `${role} NÃO pode impersonar`,
      !canImp, 'false', String(canImp)));
  }

  const superCanImp = canImpersonate('super_admin');
  results.push(rbacTest('IMPERSONACAO', 'super_admin PODE impersonar',
    superCanImp, 'true', String(superCanImp)));

  return results;
}

// ─── Suite 6: DELEGAÇÃO ───────────────────────────────────────────────────────

function testDelegation(): RbacTestResult[] {
  const results: RbacTestResult[] = [];

  // super_admin pode delegar admin:dashboard para admin
  const superToAdmin = canDelegate('super_admin', 'admin', 'admin:dashboard');
  results.push(rbacTest('DELEGACAO', 'super_admin pode delegar admin:dashboard para admin',
    superToAdmin, 'true', String(superToAdmin)));

  // gestor pode delegar cases:read para legal_assistant
  const gestorToAssistant = canDelegate('gestor', 'legal_assistant', 'cases:read');
  results.push(rbacTest('DELEGACAO', 'gestor pode delegar cases:read para legal_assistant',
    gestorToAssistant, 'true', String(gestorToAssistant)));

  // lawyer pode delegar cases:read para secretary
  const lawyerToSecretary = canDelegate('lawyer', 'secretary', 'cases:read');
  results.push(rbacTest('DELEGACAO', 'lawyer pode delegar cases:read para secretary',
    lawyerToSecretary, 'true', String(lawyerToSecretary)));

  // lawyer NÃO pode delegar para admin (fora de canDelegateTo)
  const lawyerToAdmin = canDelegate('lawyer', 'admin', 'cases:read');
  results.push(rbacTest('DELEGACAO', 'lawyer NÃO pode delegar para admin',
    !lawyerToAdmin, 'false', String(lawyerToAdmin)));

  // student NÃO pode delegar nada
  const studentDelegate = canDelegate('student', 'client', 'academic:read');
  results.push(rbacTest('DELEGACAO', 'student NÃO pode delegar',
    !studentDelegate, 'false', String(studentDelegate)));

  // client NÃO pode delegar nada
  const clientDelegate = canDelegate('client', 'intern', 'cases:read');
  results.push(rbacTest('DELEGACAO', 'client NÃO pode delegar',
    !clientDelegate, 'false', String(clientDelegate)));

  // secretary NÃO pode delegar (canDelegateTo: [])
  const secretaryDelegate = canDelegate('secretary', 'client', 'agenda:read');
  results.push(rbacTest('DELEGACAO', 'secretary NÃO pode delegar',
    !secretaryDelegate, 'false', String(secretaryDelegate)));

  return results;
}

// ─── Suite 7: SEGREGATION OF DUTIES (SoD) ────────────────────────────────────

function testSoD(): RbacTestResult[] {
  const results: RbacTestResult[] = [];

  // Conflito: financial:approve + financial:chargeback
  const conflictFinance = hasSoDConflict(['financial:approve', 'financial:chargeback']);
  results.push(rbacTest('SOD', 'financial:approve + financial:chargeback gera conflito SoD',
    conflictFinance.length > 0, '1 conflito', `${conflictFinance.length} conflito(s)`));

  // Conflito: escrow:create + escrow:release
  const conflictEscrow = hasSoDConflict(['escrow:create', 'escrow:release']);
  results.push(rbacTest('SOD', 'escrow:create + escrow:release gera conflito SoD',
    conflictEscrow.length > 0, '1 conflito', `${conflictEscrow.length} conflito(s)`));

  // super_admin tem isenção de SoD
  const superAdminExempt = hasSoDConflict(
    ['financial:approve', 'financial:chargeback', 'escrow:create', 'escrow:release'],
    'super_admin',
  );
  results.push(rbacTest('SOD', 'super_admin tem isenção de SoD',
    superAdminExempt.length === 0, '0 conflitos (isenção)', `${superAdminExempt.length} conflito(s)`));

  return results;
}

// ─── Suite 8: PROTEÇÃO DE ROTAS / VIEWS ──────────────────────────────────────

function testViewProtection(): RbacTestResult[] {
  const results: RbacTestResult[] = [];

  // superAdminDashboard: somente super_admin
  const superAdminView = canAccessView('super_admin', 'superAdminDashboard');
  results.push(rbacTest('VIEWS', 'super_admin acessa superAdminDashboard',
    superAdminView, 'true', String(superAdminView)));

  const adminCanAccessSuperAdmin = canAccessView('admin', 'superAdminDashboard');
  results.push(rbacTest('VIEWS', 'admin NÃO acessa superAdminDashboard',
    !adminCanAccessSuperAdmin, 'false', String(adminCanAccessSuperAdmin)));

  const clientCanAccessAdmin = canAccessView('client', 'adminDashboard');
  results.push(rbacTest('VIEWS', 'client NÃO acessa adminDashboard',
    !clientCanAccessAdmin, 'false', String(clientCanAccessAdmin)));

  const lawyerCanAccessAdmin = canAccessView('lawyer', 'adminDashboard');
  results.push(rbacTest('VIEWS', 'lawyer NÃO acessa adminDashboard',
    !lawyerCanAccessAdmin, 'false', String(lawyerCanAccessAdmin)));

  // adminDashboard: admin e super_admin
  const adminView = canAccessView('admin', 'adminDashboard');
  results.push(rbacTest('VIEWS', 'admin acessa adminDashboard',
    adminView, 'true', String(adminView)));

  // lawyerDashboard: lawyer e gestor
  const lawyerView = canAccessView('lawyer', 'lawyerDashboard');
  results.push(rbacTest('VIEWS', 'lawyer acessa lawyerDashboard',
    lawyerView, 'true', String(lawyerView)));

  return results;
}

// ─── Suite 9: ISOLAMENTO ENTRE USUÁRIOS (IDOR) ────────────────────────────────

function testIsolation(): RbacTestResult[] {
  const results: RbacTestResult[] = [];

  const userA = { id: 'user-A', officeId: 'office-1', tenantId: 'tenant-1' };
  const userB = { id: 'user-B', officeId: 'office-2', tenantId: 'tenant-2' };
  const userAResource = { ownerId: 'user-A', officeId: 'office-1', tenantId: 'tenant-1' };
  const userBResource = { ownerId: 'user-B', officeId: 'office-2', tenantId: 'tenant-2' };

  // IDOR Test: client A acessa caso de A (ALLOW via CONDITIONAL)
  const clientOwnCase = checkMatrix('client', 'cases', 'READ', {
    userId: userA.id,
    resourceOwnerId: userAResource.ownerId,
  });
  results.push(rbacTest('IDOR', 'client acessa SEU PRÓPRIO caso (CONDITIONAL → ALLOW)',
    clientOwnCase === 'ALLOW', 'ALLOW', clientOwnCase));

  // IDOR Test: client A tenta acessar caso de B (DENY)
  const clientOtherCase = checkMatrix('client', 'cases', 'READ', {
    userId: userA.id,
    resourceOwnerId: userBResource.ownerId,
  });
  results.push(rbacTest('IDOR', 'client NÃO acessa caso de OUTRO cliente (CONDITIONAL → DENY)',
    clientOtherCase === 'DENY', 'DENY', clientOtherCase));

  // IDOR Test: student tenta ler caso (DENY direto)
  const studentCase = checkMatrix('student', 'cases', 'READ', {
    userId: userA.id,
    resourceOwnerId: userAResource.ownerId,
  });
  results.push(rbacTest('IDOR', 'student NUNCA acessa casos de clientes (DENY absoluto)',
    studentCase === 'DENY', 'DENY', studentCase));

  // IDOR Test: gestor acessa caso do próprio escritório
  const gestorSameOffice = checkMatrix('gestor', 'cases', 'READ', {
    userId: userA.id,
    officeId: userA.officeId,
    resourceOfficeId: userA.officeId,
  });
  results.push(rbacTest('IDOR', 'gestor acessa caso do PRÓPRIO escritório (CONDITIONAL → ALLOW)',
    gestorSameOffice === 'ALLOW', 'ALLOW', gestorSameOffice));

  // IDOR Test: gestor NÃO acessa caso de outro escritório
  const gestorOtherOffice = checkMatrix('gestor', 'cases', 'READ', {
    userId: userA.id,
    officeId: userA.officeId,
    resourceOfficeId: userBResource.officeId,
  });
  results.push(rbacTest('IDOR', 'gestor NÃO acessa caso de OUTRO escritório (CONDITIONAL → DENY)',
    gestorOtherOffice === 'DENY', 'DENY', gestorOtherOffice));

  // Isolamento Office A ≠ Office B para Advogados
  const lawyerOfficeA = checkMatrix('lawyer', 'cases', 'READ', {
    userId: userA.id,
    officeId: userA.officeId,
    resourceOfficeId: userBResource.officeId,
  });
  results.push(rbacTest('IDOR', 'lawyer NÃO acessa caso de outro escritório (Office A ≠ B)',
    lawyerOfficeA === 'DENY', 'DENY', lawyerOfficeA));

  return results;
}

// ─── Suite 10: SUPER ADMIN — ACESSO IRRESTRITO ────────────────────────────────

function testSuperAdmin(): RbacTestResult[] {
  const results: RbacTestResult[] = [];

  const superPerms: Permission[] = [
    'users:impersonate', 'roles:manage', 'roles:delegate', 'roles:revoke',
    'audit:delete', 'system:config', 'financial:chargeback', 'financial:approve',
    'escrow:release', 'escrow:manage', 'staff:delete', 'staff:revoke',
    'lawyers:approve', 'lawyers:delete', 'cases:delete', 'documents:delete',
  ];

  for (const perm of superPerms) {
    const result = hasPermission('super_admin', perm);
    results.push(rbacTest('SUPER_ADMIN', `super_admin tem ${perm}`,
      result, 'true', String(result)));
  }

  return results;
}

// ─── Runner Principal ─────────────────────────────────────────────────────────

export async function runRbacConformanceTests(): Promise<{
  results: RbacTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    conformanceIndex: number;
    failedTests: string[];
  };
}> {
  const allResults: RbacTestResult[] = [
    ...testDenyByDefault(),
    ...testExplicitAllow(),
    ...testExplicitDeny(),
    ...testPrivilegeEscalation(),
    ...testImpersonation(),
    ...testDelegation(),
    ...testSoD(),
    ...testViewProtection(),
    ...testIsolation(),
    ...testSuperAdmin(),
  ];

  const passed  = allResults.filter(r => r.passed).length;
  const failed  = allResults.filter(r => !r.passed).length;
  const total   = allResults.length;
  const conformanceIndex = Math.round((passed / total) * 100);
  const failedTests = allResults.filter(r => !r.passed).map(r => `[${r.suite}] ${r.testName}`);

  return {
    results: allResults,
    summary: { total, passed, failed, conformanceIndex, failedTests },
  };
}
