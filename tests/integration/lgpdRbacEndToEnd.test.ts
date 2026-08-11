/**
 * tests/integration/lgpdRbacEndToEnd.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — END-TO-END INTEGRATION TEST SUITE
 * Integra a Engine RBAC + LGPD Rights Service + BI Analytics Exporter + IDOR Protection.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { hasPermission, canAccessView, canDelegate, type SystemRole } from '../../security/rbac';
import { checkMatrix } from '../../security/rbacMatrix';
import { requestLgpdDataExport, submitLgpdDeletionRequest, getLgpdRequests, getLgpdStats } from '../../services/lgpdRightsService';
import { exportBiReportToPdf, exportBiReportToExcel, generateBiReportSummary } from '../../services/biExporterService';

export interface IntegrationTestStepResult {
  step: string;
  passed: boolean;
  details: string;
}

export async function runEndToEndIntegrationTests(): Promise<{
  passed: boolean;
  totalSteps: number;
  results: IntegrationTestStepResult[];
}> {
  const results: IntegrationTestStepResult[] = [];

  // STEP 1: Validação da hierarquia RBAC
  (() => {
    const isSuperAdminFull = hasPermission('super_admin', 'users:impersonate') && hasPermission('super_admin', 'roles:manage');
    const isAdminRestricted = hasPermission('admin', 'roles:delegate') && !hasPermission('admin', 'users:impersonate');
    const isClientIsolated = hasPermission('client', 'client:dashboard') && !hasPermission('client', 'admin:dashboard');

    const stepPassed = isSuperAdminFull && isAdminRestricted && isClientIsolated;
    results.push({
      step: '1. Hierarquia de Permissões RBAC (Deny by Default)',
      passed: stepPassed,
      details: `superAdmin:${isSuperAdminFull}, admin:${isAdminRestricted}, client:${isClientIsolated}`,
    });
  })();

  // STEP 2: Validação da Matriz RBAC e Resolução Condicional (IDOR)
  (() => {
    const ownCaseAccess = checkMatrix('client', 'cases', 'READ', { userId: 'user-100', resourceOwnerId: 'user-100' });
    const otherCaseAccess = checkMatrix('client', 'cases', 'READ', { userId: 'user-100', resourceOwnerId: 'user-200' });
    const officeCaseAccess = checkMatrix('lawyer', 'cases', 'READ', { officeId: 'office-A', resourceOfficeId: 'office-A' });

    const stepPassed = ownCaseAccess === 'ALLOW' && otherCaseAccess === 'DENY' && officeCaseAccess === 'ALLOW';
    results.push({
      step: '2. Resolução de Matriz e Isolamento contra IDOR',
      passed: stepPassed,
      details: `own:${ownCaseAccess}, other:${otherCaseAccess}, office:${officeCaseAccess}`,
    });
  })();

  // STEP 3: Ciclo de Vida do Serviço LGPD (Art. 18 SAR + Eliminação)
  (() => {
    const sarReq = requestLgpdDataExport('integ.test@legisconnect.com.br');
    const delReq = submitLgpdDeletionRequest('integ.test@legisconnect.com.br', 'Solicitação de teste E2E');
    const allRequests = getLgpdRequests();
    const stats = getLgpdStats();

    const stepPassed = Boolean(sarReq && sarReq.status === 'completed' && delReq && allRequests.length >= 2 && stats.total >= 2);
    results.push({
      step: '3. Ciclo de Vida do Serviço LGPD (SAR + Deletion)',
      passed: stepPassed,
      details: `sar:${sarReq.id}, deletion:${delReq.id}, totalRequests:${allRequests.length}`,
    });
  })();

  // STEP 4: Geração de Relatórios e Exportador BI (PDF + Excel)
  (() => {
    const pdfBlob = exportBiReportToPdf();
    const excelBlob = exportBiReportToExcel();
    const summary = generateBiReportSummary();

    const stepPassed = Boolean(pdfBlob.size > 0 && excelBlob.size > 0 && summary.totalVolume > 0);
    results.push({
      step: '4. Engine de Exportação BI Analytics (PDF + Excel + Summary)',
      passed: stepPassed,
      details: `pdfSize:${pdfBlob.size}B, excelSize:${excelBlob.size}B, totalVolume:R$ ${summary.totalVolume.toLocaleString()}`,
    });
  })();

  // STEP 5: Delegação de Papéis e Elevação de Privilégios
  (() => {
    const lawyerCanDelegateToSecretary = canDelegate('lawyer', 'secretary', 'cases:read');
    const lawyerCannotDelegateToAdmin = !canDelegate('lawyer', 'admin', 'cases:read');
    const superAdminView = canAccessView('super_admin', 'superAdminDashboard');
    const adminBlockedFromSuperView = !canAccessView('admin', 'superAdminDashboard');

    const stepPassed = lawyerCanDelegateToSecretary && lawyerCannotDelegateToAdmin && superAdminView && adminBlockedFromSuperView;
    results.push({
      step: '5. Delegação de Funções e Validação de Views Protegidas',
      passed: stepPassed,
      details: `lawyer->secretary:${lawyerCanDelegateToSecretary}, superView:${superAdminView}, adminBlocked:${adminBlockedFromSuperView}`,
    });
  })();

  const allPassed = results.every(r => r.passed);
  return {
    passed: allPassed,
    totalSteps: results.length,
    results,
  };
}
