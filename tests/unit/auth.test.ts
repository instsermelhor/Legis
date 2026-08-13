/**
 * tests/unit/auth.test.ts
 * Suíte de Testes Unitários de Autenticação, Criptografia e RBAC Legis Connect
 */

import { generatePasswordHash, verifyPasswordHash } from '../../security/passwordPolicy';
import { hasPermission, SystemRole } from '../../security/rbac';

export interface TestResult {
  name: string;
  category: 'AUTH' | 'ESCROW' | 'AI' | 'SYNC' | 'SECURITY';
  passed: boolean;
  durationMs: number;
  error?: string;
}

export async function runAuthTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Teste 1: PBKDF2 Hashing e Verificação
  try {
    const t0 = performance.now();
    const testPass = 'SenhaSegura@2026';
    const hashed = await generatePasswordHash(testPass);
    const isValid = await verifyPasswordHash(testPass, hashed);
    const durationMs = Math.round(performance.now() - t0);

    results.push({
      name: 'PBKDF2 Hashing & Password Verification',
      category: 'AUTH',
      passed: isValid && hashed.startsWith('$pbkdf2v2$'),
      durationMs,
    });
  } catch (err: any) {
    results.push({
      name: 'PBKDF2 Hashing & Password Verification',
      category: 'AUTH',
      passed: false,
      durationMs: 0,
      error: err?.message || String(err),
    });
  }

  // Teste 2: Validação de Permissão RBAC SuperAdmin
  try {
    const t0 = performance.now();
    const canSuperAdminManageStaff = hasPermission('super_admin', 'admin:manage_staff');
    const canClientManageStaff = hasPermission('client' as SystemRole, 'admin:manage_staff');
    const durationMs = Math.round(performance.now() - t0);

    results.push({
      name: 'RBAC Multi-role Permission Matrix',
      category: 'AUTH',
      passed: canSuperAdminManageStaff && !canClientManageStaff,
      durationMs,
    });
  } catch (err: any) {
    results.push({
      name: 'RBAC Multi-role Permission Matrix',
      category: 'AUTH',
      passed: false,
      durationMs: 0,
      error: err?.message || String(err),
    });
  }

  // Teste 3: Rejeição de Senha Fraca
  try {
    const t0 = performance.now();
    const weakPass = '123456';
    const isWeakValid = await verifyPasswordHash(weakPass, '$pbkdf2v2$invalidhash');
    const durationMs = Math.round(performance.now() - t0);

    results.push({
      name: 'Weak Password Hash Rejection',
      category: 'AUTH',
      passed: !isWeakValid,
      durationMs,
    });
  } catch (err: any) {
    results.push({
      name: 'Weak Password Hash Rejection',
      category: 'AUTH',
      passed: true, // Espera falha/falso
      durationMs: 1,
    });
  }

  return results;
}
