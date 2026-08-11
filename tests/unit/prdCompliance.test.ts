/**
 * tests/unit/prdCompliance.test.ts
 * Suíte de Testes de Conformidade com o PRD Master Legis Connect
 * Valida os contratos de RBAC, Audit Chain, Escrow, Provisionamento e Guardrails de IA.
 */

import { hasPermission, canImpersonate, ROLE_LEVELS, SystemRole } from '../../security/rbac';
import { StaffAuditLogger } from '../../security/auditLogger';
import { validateAuditIntegrity } from '../../security/auditIntegrityValidator';
import { createEscrowTransaction, releaseEscrow } from '../../services/escrowService';
import { processServiceProvisioning } from '../../services/provisioningService';

export interface TestResult {
  name: string;
  category: 'AUTH' | 'ESCROW' | 'AI' | 'SYNC' | 'SECURITY';
  passed: boolean;
  durationMs: number;
  error?: string;
}

export async function runPrdComplianceTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Teste 1: Validação do Nível de Autoridade Zero-Trust (RBAC Level Check)
  try {
    const t0 = performance.now();
    const superAdminLevel = ROLE_LEVELS['super_admin'];
    const adminLevel = ROLE_LEVELS['admin'];
    const lawyerLevel = ROLE_LEVELS['lawyer'];
    const clientLevel = ROLE_LEVELS['client'];

    const isHierarchyValid = superAdminLevel > adminLevel && adminLevel > lawyerLevel && lawyerLevel > clientLevel;
    const canSuperAdminImp = canImpersonate('super_admin');
    const canLawyerImp = canImpersonate('lawyer');

    results.push({
      name: 'PRD FR-001/FR-005: Zero-Trust RBAC Hierarchy & Impersonation Gate',
      category: 'SECURITY',
      passed: isHierarchyValid && canSuperAdminImp && !canLawyerImp,
      durationMs: Math.round(performance.now() - t0),
    });
  } catch (err: any) {
    results.push({
      name: 'PRD FR-001/FR-005: Zero-Trust RBAC Hierarchy & Impersonation Gate',
      category: 'SECURITY',
      passed: false,
      durationMs: 0,
      error: err?.message || String(err),
    });
  }

  // Teste 2: Cadeia Imutável de Auditoria (HMAC Chained Hash Audit Log)
  try {
    const t0 = performance.now();
    const logger = StaffAuditLogger.getInstance();
    const log1 = await logger.logAction({
      action: 'PRD_TEST_LOGIN',
      actorId: 'super_admin_test_id',
      actorRole: 'super_admin',
      details: 'Teste de auditoria imutável',
      severity: 'INFO',
    });

    const isHashValid = log1.hash && log1.hash.length === 64; // SHA-256 hex string
    const isIntegrityValid = await validateAuditIntegrity();

    results.push({
      name: 'PRD FR-024: HMAC Chained Audit Log Integrity',
      category: 'SECURITY',
      passed: Boolean(isHashValid && isIntegrityValid),
      durationMs: Math.round(performance.now() - t0),
    });
  } catch (err: any) {
    results.push({
      name: 'PRD FR-024: HMAC Chained Audit Log Integrity',
      category: 'SECURITY',
      passed: false,
      durationMs: 0,
      error: err?.message || String(err),
    });
  }

  // Teste 3: Ciclo de Vida do Escrow (Pagamento Retido & Liberação Segura)
  try {
    const t0 = performance.now();
    const tx = createEscrowTransaction({
      lawyerId: 'lawyer-123',
      clientId: 'client-456',
      amount: 250.00,
      description: 'Consulta Jurídica Teste Escrow',
    });

    const isCreatedRetained = tx.status === 'HELD';
    const releasedTx = releaseEscrow(tx.id);
    const isReleased = releasedTx?.status === 'RELEASED';

    results.push({
      name: 'PRD FR-021: Escrow Lifecycle (HELD -> RELEASED)',
      category: 'ESCROW',
      passed: isCreatedRetained && isReleased,
      durationMs: Math.round(performance.now() - t0),
    });
  } catch (err: any) {
    results.push({
      name: 'PRD FR-021: Escrow Lifecycle (HELD -> RELEASED)',
      category: 'ESCROW',
      passed: false,
      durationMs: 0,
      error: err?.message || String(err),
    });
  }

  // Teste 4: Idempotência do Motor de Provisionamento
  try {
    const t0 = performance.now();
    const paymentId = `pay_test_${Date.now()}`;
    const p1 = processServiceProvisioning({
      paymentId,
      userEmail: 'cliente.teste@legisconnect.com.br',
      userId: 'user-789',
      group: 'client',
      serviceId: 'serv_01',
      serviceTitle: 'Consulta Avulsa',
      amount: 150.00,
    });

    const p2 = processServiceProvisioning({
      paymentId,
      userEmail: 'cliente.teste@legisconnect.com.br',
      userId: 'user-789',
      group: 'client',
      serviceId: 'serv_01',
      serviceTitle: 'Consulta Avulsa',
      amount: 150.00,
    });

    const isIdempotent = p1.id === p2.id && p1.status === 'PROVISIONED';

    results.push({
      name: 'PRD FR-022: Provisioning Engine Idempotency Gate',
      category: 'SYNC',
      passed: isIdempotent,
      durationMs: Math.round(performance.now() - t0),
    });
  } catch (err: any) {
    results.push({
      name: 'PRD FR-022: Provisioning Engine Idempotency Gate',
      category: 'SYNC',
      passed: false,
      durationMs: 0,
      error: err?.message || String(err),
    });
  }

  return results;
}
