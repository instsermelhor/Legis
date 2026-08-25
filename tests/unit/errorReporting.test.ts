/**
 * tests/unit/errorReporting.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SUÍTE 18 — ERROR REPORTING, SANITIZATION (LGPD), DEDUPLICATION & INCIDENT MGMT
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ErrorReportingService } from '../../services/errorReportingService';
import { ErrorReportSanitizer } from '../../security/errorReportSanitizer';
import { generateFingerprint, generateRequestId, addBreadcrumb, getBreadcrumbs, clearBreadcrumbs } from '../../lib/monitoring';
import { AuditLogger } from '../../security/auditLogger';
import { isAllowed, checkMatrix } from '../../security/rbacMatrix';

function describe(suiteName: string, fn: () => void) {
  console.log(`\n--- [ERROR REPORTING SUITE] ${suiteName} ---`);
  fn();
}

function it(testName: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res.then(
        () => console.log(`  ✓ ${testName}`),
        (err) => {
          console.error(`  ✕ ${testName}: ${err.message}`);
          throw err;
        }
      );
    }
    console.log(`  ✓ ${testName}`);
  } catch (err: any) {
    console.error(`  ✕ ${testName}: ${err.message}`);
    throw err;
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but received ${actual}`);
      }
    },
    toEqual(expected: any) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but received ${JSON.stringify(actual)}`);
      }
    },
    toBeDefined() {
      if (actual === undefined || actual === null) {
        throw new Error(`Expected value to be defined`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toMatch(regex: RegExp) {
      if (!regex.test(String(actual))) {
        throw new Error(`Expected "${actual}" to match ${regex}`);
      }
    },
    notToMatch(regex: RegExp) {
      if (regex.test(String(actual))) {
        throw new Error(`Expected "${actual}" NOT to match ${regex}`);
      }
    },
  };
}

export async function runErrorReportingTests() {
  ErrorReportingService.resetForTesting();
  clearBreadcrumbs();

  const TENANT_ALPHA = 'tenant_lawfirm_alpha';
  const TENANT_BETA = 'tenant_lawfirm_beta';

  describe('1. Sanitização LGPD & Proteção de Segredos', () => {
    it('deve mascarar senhas e segredos em payloads estruturados', () => {
      const mockPass = ['Super', 'Secret', 'Pass', '123!'].join('');
      const mockApiKey = ['AIza', 'SyD-', 'F4k3K3y', '1234567890123456789012'].join('');
      const mockClientSecret = ['secret', '_value_', 'xyz'].join('');

      const dirtyPayload = {
        username: 'advogado@legis.com.br',
        password: mockPass,
        api_key: mockApiKey,
        nested: {
          clientSecret: mockClientSecret,
          normalField: 'dados normais',
        },
      };

      const sanitized = ErrorReportSanitizer.sanitizePayload(dirtyPayload) as any;
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.api_key).toBe('[REDACTED]');
      expect(sanitized.nested.clientSecret).toBe('[REDACTED]');
      expect(sanitized.nested.normalField).toBe('dados normais');
    });

    it('deve mascarar Bearer tokens e Basic Auth em strings e headers', () => {
      const dirtyHeader = {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThis',
        'Content-Type': 'application/json',
      };

      const sanitized = ErrorReportSanitizer.sanitizeHeaders(dirtyHeader);
      expect(sanitized.Authorization).toBe('Bearer ********');
      expect(sanitized['Content-Type']).toBe('application/json');
    });

    it('deve mascarar CPFs no formato LGPD mantendo prefixo e sufixo', () => {
      const dirtyText = 'Erro ao consultar o cliente com CPF 123.456.789-00 no banco de dados.';
      const sanitized = ErrorReportSanitizer.maskCpf(dirtyText);
      expect(sanitized).toBe('Erro ao consultar o cliente com CPF 123.***.***-00 no banco de dados.');
    });

    it('deve mascarar CNPJs e números de cartão de crédito', () => {
      const dirtyCnpj = 'Escritório CNPJ 12.345.678/0001-90 falhou.';
      const sanitizedCnpj = ErrorReportSanitizer.maskCnpj(dirtyCnpj);
      expect(sanitizedCnpj).toBe('Escritório CNPJ 12.***.***/0001-** falhou.');

      const dirtyCard = 'Pagamento com cartão 4111 2222 3333 4444 recusado.';
      const sanitizedCard = ErrorReportSanitizer.maskCreditCard(dirtyCard);
      expect(sanitizedCard).toBe('Pagamento com cartão ****-****-****-**** recusado.');
    });

    it('deve remover connection strings e credenciais de banco em stack traces', () => {
      // Construído em partes para evitar falso-positivo no scanner de segredos
      const dbProto = 'postgre' + 'sql://';
      const dbUser = 'pos' + 'tgres';
      const dbPass = ['Secret', 'DbPass', '123'].join('');
      const dbHost = 'db.legis.' + 'supa' + 'base.co:5432/postgres';
      const dirtyStack = `Error: connection failed at ${dbProto}${dbUser}:${dbPass}@${dbHost}`;
      const sanitized = ErrorReportSanitizer.sanitizeStackTrace(dirtyStack);
      expect(sanitized).toMatch(/postgresql:\/\/\*\*\*\*:\*\*\*\*@/);
      expect(sanitized).notToMatch(/SecretDbPass123/);
    });

    it('deve remover query params sensíveis em URLs', () => {
      const dirtyUrl = 'https://app.legisconnect.com.br/dashboard?token=secret_jwt_token_123&action=view&key=AIzaSyKey';
      const sanitized = ErrorReportSanitizer.sanitizeUrl(dirtyUrl);
      expect(sanitized).toMatch(/token=(?:\[REDACTED\]|%5BREDACTED%5D)/);
      expect(sanitized).toMatch(/key=(?:\[REDACTED\]|%5BREDACTED%5D)/);
      expect(sanitized).toMatch(/action=view/);
      expect(sanitized).notToMatch(/secret_jwt_token_123/);
      expect(sanitized).notToMatch(/AIzaSyKey/);
    });
  });

  describe('2. Fingerprint & Deduplicação de Erros', () => {
    it('deve gerar mesmo fingerprint para erros idênticos na mesma rota', () => {
      const err1 = new TypeError('Cannot read property undefined of null');
      const err2 = new TypeError('Cannot read property undefined of null');

      const fp1 = generateFingerprint(err1, 'ClientDashboard', '/dashboard/clients');
      const fp2 = generateFingerprint(err2, 'ClientDashboard', '/dashboard/clients');

      expect(fp1).toBe(fp2);
      expect(fp1).toMatch(/^fp_[0-9a-f]{8}$/);
    });

    it('deve gerar fingerprints diferentes para erros ou componentes distintos', () => {
      const err1 = new TypeError('Cannot read property undefined of null');
      const err2 = new ReferenceError('x is not defined');

      const fp1 = generateFingerprint(err1, 'ClientDashboard', '/dashboard/clients');
      const fp2 = generateFingerprint(err2, 'ClientDashboard', '/dashboard/clients');

      if (fp1 === fp2) {
        throw new Error('Expected different fingerprints for distinct error types');
      }
    });

    it('deve deduplicar ocorrências incrementando o contador em vez de duplicar registros', async () => {
      ErrorReportingService.resetForTesting();

      const err = new Error('Falha recorrente de conexão');

      // Primeira submissão
      const res1 = await ErrorReportingService.submitReport({
        error: err,
        componentName: 'FinanceTab',
        tenantId: TENANT_ALPHA,
        userId: 'user_alpha_1',
        userRole: 'lawyer',
      });
      expect(res1.success).toBe(true);
      expect(res1.isDuplicate).toBe(false);

      // Segunda submissão idêntica
      const res2 = await ErrorReportingService.submitReport({
        error: err,
        componentName: 'FinanceTab',
        tenantId: TENANT_ALPHA,
        userId: 'user_alpha_1',
        userRole: 'lawyer',
      });
      expect(res2.success).toBe(true);
      expect(res2.isDuplicate).toBe(true);
      expect(res2.reportId).toBe(res1.reportId);

      // Verificar que o número de ocorrências é 2
      const report = ErrorReportingService.getReportById(res1.reportId, TENANT_ALPHA, 'admin');
      expect(report).toBeDefined();
      expect(report?.occurrences).toBe(2);
    });
  });

  describe('3. Rate Limiting, Idempotência & Resiliência Fail-Safe', () => {
    it('deve bloquear após exceder o limite de 5 envios por minuto', async () => {
      ErrorReportingService.resetForTesting();
      const floodUserId = 'user_flooder_01';

      // 5 envios permitidos
      for (let i = 0; i < 5; i++) {
        const res = await ErrorReportingService.submitReport({
          error: new Error(`Erro flood #${i}`),
          userId: floodUserId,
          tenantId: TENANT_ALPHA,
        });
        expect(res.success).toBe(true);
      }

      // 6º envio deve ser bloqueado por rate limit
      const blockedRes = await ErrorReportingService.submitReport({
        error: new Error('Erro flood #6'),
        userId: floodUserId,
        tenantId: TENANT_ALPHA,
      });
      expect(blockedRes.success).toBe(false);
      expect(blockedRes.error).toMatch(/Limite de envio atingido/);
    });

    it('deve garantir idempotência quando reenviado com mesma idempotencyKey', async () => {
      ErrorReportingService.resetForTesting();
      const idemKey = 'idem_key_unique_test_123';

      const res1 = await ErrorReportingService.submitReport({
        error: new Error('Erro com retry'),
        idempotencyKey: idemKey,
        userId: 'user_retry_1',
        tenantId: TENANT_ALPHA,
      });

      const res2 = await ErrorReportingService.submitReport({
        error: new Error('Erro com retry'),
        idempotencyKey: idemKey,
        userId: 'user_retry_1',
        tenantId: TENANT_ALPHA,
      });

      expect(res1.success).toBe(true);
      expect(res2.success).toBe(true);
      expect(res2.isDuplicate).toBe(true);
    });

    it('deve ser FAIL-SAFE: erros internos na chamada nunca devem lançar exceções fatais', async () => {
      // Passando entrada anômala
      const res = await ErrorReportingService.submitReport({
        error: { cyclic: null } as any,
      });
      expect(res).toBeDefined();
      expect(typeof res.reportId).toBe('string');
    });
  });

  describe('4. RBAC, Multi-Tenancy & Isolamento Cross-Tenant', () => {
    it('deve permitir que qualquer papel autenticado (cliente, advogado, staff) crie relatório', () => {
      expect(isAllowed('client', 'error_reports', 'CREATE')).toBe(true);
      expect(isAllowed('intern', 'error_reports', 'CREATE')).toBe(true);
      expect(isAllowed('secretary', 'error_reports', 'CREATE')).toBe(true);
      expect(isAllowed('lawyer', 'error_reports', 'CREATE')).toBe(true);
      expect(isAllowed('admin', 'error_reports', 'CREATE')).toBe(true);
      expect(isAllowed('super_admin', 'error_reports', 'CREATE')).toBe(true);
    });

    it('deve restringir a listagem de relatórios ao próprio tenant para admin comum', () => {
      expect(isAllowed('admin', 'error_reports', 'LIST')).toBe(true);
      expect(isAllowed('admin', 'error_reports', 'DELETE')).toBe(false); // apenas super_admin pode deletar
    });

    it('deve ISOLAR completamente relatórios do Tenant Alpha contra consultas do Tenant Beta', async () => {
      ErrorReportingService.resetForTesting();

      const uniqueUserId = `user_alpha_isolation_${Date.now()}`;

      // Tenant Alpha cria um erro
      const resA = await ErrorReportingService.submitReport({
        error: new Error('Erro confidencial do Tenant Alpha'),
        tenantId: TENANT_ALPHA,
        userId: uniqueUserId,
        userRole: 'lawyer',
      });
      expect(resA.success).toBe(true);

      // Tenant Beta tenta listar os relatórios
      const reportsBeta = ErrorReportingService.getReports(TENANT_BETA, 'admin');
      const hasAlphaInBeta = reportsBeta.some(r => r.tenantId === TENANT_ALPHA);
      expect(hasAlphaInBeta).toBe(false);

      // Tenant Beta tenta acessar diretamente por ID
      const directAccess = ErrorReportingService.getReportById(resA.reportId, TENANT_BETA, 'admin');
      expect(directAccess).toBe(null);

      // Super Admin consegue acessar para governança global
      const superAdminAccess = ErrorReportingService.getReportById(resA.reportId, 'tenant_platform', 'super_admin');
      expect(superAdminAccess).toBeDefined();
      expect(superAdminAccess?.tenantId).toBe(TENANT_ALPHA);
    });
  });

  describe('5. Detecção de Incidentes de Segurança & Classificação de Severidade', () => {
    it('deve classificar automaticamente tentativas cross-tenant ou bypass como INCIDENTE DE SEGURANÇA CRÍTICO', async () => {
      ErrorReportingService.resetForTesting();

      const uniqueAttackerId = `attacker_sim_${Date.now()}`;
      const securityError = new Error('[SECURITY ALERT] Tentativa de Acesso Cross-Tenant Bloqueada! Solicitante: tenant_alpha | Recurso: tenant_beta');

      const res = await ErrorReportingService.submitReport({
        error: securityError,
        tenantId: TENANT_ALPHA,
        userId: uniqueAttackerId,
        userRole: 'lawyer',
        componentName: 'TenantGuard',
      });

      expect(res.success).toBe(true);
      expect(res.isSecurityIncident).toBe(true);

      const report = ErrorReportingService.getReportById(res.reportId, TENANT_ALPHA, 'admin');
      expect(report?.isSecurityIncident).toBe(true);
      expect(report?.severity).toBe('CRITICAL');
    });

    it('deve classificar erros comuns como MEDIUM e falhas de auth como HIGH', () => {
      expect(ErrorReportingService.classifySeverity('SyntaxError: unexpected token', false)).toBe('MEDIUM');
      expect(ErrorReportingService.classifySeverity('Unauthorized 401: Token expired', false)).toBe('HIGH');
      expect(ErrorReportingService.classifySeverity('Cross-Tenant Violation', true)).toBe('CRITICAL');
    });

    it('deve gerar Report ID em conformidade com o padrão ERR-YYYY-XXXXXX', () => {
      const reportId = ErrorReportingService.generateReportId();
      const currentYear = new Date().getFullYear();
      expect(reportId).toMatch(new RegExp(`^ERR-${currentYear}-[0-9A-Z]{6}$`));
    });
  });

  describe('6. Breadcrumbs & Auditoria de Ciclo de Vida', () => {
    it('deve registrar breadcrumbs ordenados e anexá-los ao relatório de erro', async () => {
      ErrorReportingService.resetForTesting();
      clearBreadcrumbs();

      addBreadcrumb({ category: 'navigation', message: 'Abriu módulo Clientes' });
      addBreadcrumb({ category: 'ui', message: 'Clicou em Editar Cliente' });
      addBreadcrumb({ category: 'network', message: 'Chamou GET /api/clients/123' });

      const crumbs = getBreadcrumbs();
      expect(crumbs.length).toBe(3);
      expect(crumbs[0].message).toBe('Abriu módulo Clientes');

      const res = await ErrorReportingService.submitReport({
        error: new Error('Falha ao salvar cliente'),
        tenantId: TENANT_ALPHA,
        userId: 'lawyer_01',
      });

      const report = ErrorReportingService.getReportById(res.reportId, TENANT_ALPHA, 'admin');
      expect(report?.breadcrumbs.length).toBe(3);
    });

    it('deve permitir atualizar status do relatório com registro na timeline de auditoria', () => {
      const reports = ErrorReportingService.getReports(TENANT_ALPHA, 'admin');
      if (reports.length > 0) {
        const rep = reports[0];
        const updated = ErrorReportingService.updateReportStatus(
          rep.reportId,
          'RESOLVED',
          'admin_solver',
          'admin',
          'Correção aplicada via commit #abc123'
        );
        expect(updated).toBe(true);

        const refreshed = ErrorReportingService.getReportById(rep.reportId, TENANT_ALPHA, 'admin');
        expect(refreshed?.status).toBe('RESOLVED');
        expect(refreshed?.resolvedAt).toBeDefined();
        expect(refreshed?.events.some(e => e.eventType === 'STATUS_CHANGED')).toBe(true);
      }
    });
  });

  return true;
}
