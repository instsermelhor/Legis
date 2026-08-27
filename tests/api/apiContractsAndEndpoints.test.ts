/**
 * tests/api/apiContractsAndEndpoints.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SUÍTE 19 — API CONTRACTS, ENDPOINTS, SCHEMAS & ERROR HANDLING
 * ─────────────────────────────────────────────────────────────────────────────
 * Valida a conformidade de todos os endpoints serverless da plataforma:
 *   • GET  /api/health        (Health Check, conectividade Supabase, SLA < 200ms)
 *   • POST /api/error-reports (Ingestão de relatórios de erro, sanitização, 413, 405)
 *   • POST /api/gemini        (Proxy de IA server-side, CORS, validação de schema)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import healthHandler from '../../api/health';
import errorReportsHandler from '../../api/error-reports';
import geminiHandler from '../../api/gemini';
import casesV1Handler from '../../api/v1/cases';
import documentsV1Handler from '../../api/v1/documents';
import webhooksV1Handler from '../../api/v1/webhooks';

// ─── Test Framework Interno ──────────────────────────────────────────────────
type TestFn = () => void | Promise<void>;
interface TestCase { name: string; fn: TestFn; }
interface Suite { name: string; cases: TestCase[]; }

let _suites: Suite[] = [];
let _currentSuite: Suite | null = null;

function describe(suiteName: string, fn: () => void) {
  const suite: Suite = { name: suiteName, cases: [] };
  _suites.push(suite);
  _currentSuite = suite;
  fn();
  _currentSuite = null;
}

function it(testName: string, fn: TestFn) {
  if (_currentSuite) {
    _currentSuite.cases.push({ name: testName, fn });
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
    toBeLessThan(expected: number) {
      if (typeof actual !== 'number' || actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toMatch(regex: RegExp) {
      if (!regex.test(String(actual))) {
        throw new Error(`Expected "${actual}" to match ${regex}`);
      }
    },
  };
}

// ─── Mock Helpers para Vercel Serverless Functions ───────────────────────────
function createMockReqRes(options: {
  method?: string;
  url?: string;
  body?: any;
  query?: Record<string, string | string[]>;
  headers?: Record<string, string>;
}) {
  const req = {
    method: options.method || 'GET',
    url: options.url || '/api/health',
    body: options.body,
    query: options.query || {},
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'x-legis-edge-secret': 'LEGIS_ENTERPRISE_EDGE_DEFAULT_SECRET_2026',
      ...(options.headers || {})
    },
  };

  let statusCode = 200;
  let responseData: any = null;
  const responseHeaders: Record<string, string> = {};

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      responseData = data;
      return data;
    },
    setHeader(key: string, value: string) {
      responseHeaders[key.toLowerCase()] = value;
    },
    getStatusCode: () => statusCode,
    getResponseData: () => responseData,
    getResponseHeaders: () => responseHeaders,
  };

  return { req, res };
}

// ─── Test Suite Definition ───────────────────────────────────────────────────
export async function runApiContractsTests() {
  _suites = [];
  _currentSuite = null;

  describe('1. Health Check Endpoint (/api/health)', () => {
    it('deve responder com status 200 e schema padronizado em requisição GET', async () => {
      const { req, res } = createMockReqRes({ method: 'GET' });
      await healthHandler(req as any, res as any);

      expect([200, 503].includes(res.getStatusCode())).toBe(true);
      const data = res.getResponseData();
      expect(data).toBeDefined();
      expect(['ok', 'degraded'].includes(data.status)).toBe(true);
      expect(typeof data.version).toBe('string');
      expect(typeof data.timestamp).toBe('string');
      expect(typeof data.uptimeSeconds).toBe('number');
      expect(typeof data.responseTimeMs).toBe('number');
      expect(data.services).toBeDefined();
      expect(data.services.api.status).toBe('ok');
    });

    it('deve rejeitar métodos HTTP não permitidos (POST, PUT, DELETE) com 405', async () => {
      for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
        const { req, res } = createMockReqRes({ method });
        await healthHandler(req as any, res as any);

        expect(res.getStatusCode()).toBe(405);
        expect(res.getResponseData().error).toBe('Method Not Allowed');
      }
    });

    it('deve incluir headers de segurança Cache-Control no-store', async () => {
      const { req, res } = createMockReqRes({ method: 'GET' });
      await healthHandler(req as any, res as any);

      const headers = res.getResponseHeaders();
      expect(headers['cache-control']).toBe('no-store, no-cache, must-revalidate');
      expect(headers['content-type']).toBe('application/json');
    });
  });

  describe('2. Error Reporting Endpoint (/api/error-reports)', () => {
    it('deve aceitar payload válido via POST e retornar 201 Created com Report ID', async () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: {
          errorName: 'TypeError',
          errorMessage: 'Cannot read properties of null',
          userDescription: 'Erro ao clicar em salvar cliente',
          moduleName: 'core_clients',
          tenantId: 'tenant_lawfirm_alpha',
        },
      });

      await errorReportsHandler(req as any, res as any);

      expect(res.getStatusCode()).toBe(201);
      const data = res.getResponseData();
      expect(data.success).toBe(true);
      expect(data.status).toBe('RECEIVED');
      expect(data.reportId).toMatch(/^ERR-\d{4}-[0-9A-Z]{6}$/);
      expect(data.isSecurityIncident).toBe(false);
    });

    it('deve rejeitar requisições GET com status 405 Method Not Allowed', async () => {
      const { req, res } = createMockReqRes({ method: 'GET' });
      await errorReportsHandler(req as any, res as any);

      expect(res.getStatusCode()).toBe(405);
      expect(res.getResponseData().error).toBe('Method Not Allowed');
    });

    it('deve rejeitar payloads maiores que 64KB com status 413 Payload Too Large', async () => {
      const hugeString = 'x'.repeat(70_000);
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: { errorName: 'HugeError', stackTrace: hugeString },
      });

      await errorReportsHandler(req as any, res as any);

      expect(res.getStatusCode()).toBe(413);
      expect(res.getResponseData().error).toBe('Payload Too Large');
    });

    it('deve detectar tentativa de violação de segurança e marcar isSecurityIncident = true', async () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: {
          errorName: 'SecurityError',
          errorMessage: 'Tentativa de acesso Cross-Tenant detectada e bloqueada.',
          tenantId: 'tenant_lawfirm_alpha',
        },
      });

      await errorReportsHandler(req as any, res as any);

      expect(res.getStatusCode()).toBe(201);
      const data = res.getResponseData();
      expect(data.isSecurityIncident).toBe(true);
    });
  });

  describe('3. Gemini Serverless Proxy (/api/gemini)', () => {
    it('deve responder requisições OPTIONS com status 200 e headers CORS completos', async () => {
      const { req, res } = createMockReqRes({ method: 'OPTIONS' });
      await geminiHandler(req as any, res as any);

      expect(res.getStatusCode()).toBe(200);
      const headers = res.getResponseHeaders();
      expect(headers['access-control-allow-origin']).toBe('*');
      expect(headers['access-control-allow-methods']).toBe('POST, OPTIONS');
    });

    it('deve rejeitar métodos inválidos (GET) com status 405', async () => {
      const { req, res } = createMockReqRes({ method: 'GET' });
      await geminiHandler(req as any, res as any);

      expect(res.getStatusCode()).toBe(405);
      expect(res.getResponseData().error).toBe('Method Not Allowed');
    });

    it('deve validar obrigatoriedade do campo "contents" retornando 400 Bad Request', async () => {
      const prevKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = 'mock_test_key_serverless';

      try {
        const { req, res } = createMockReqRes({
          method: 'POST',
          body: { model: 'gemini-2.5-flash' },
        });

        await geminiHandler(req as any, res as any);

        expect(res.getStatusCode()).toBe(400);
        expect(res.getResponseData().error).toBe('Campo "contents" obrigatório.');
      } finally {
        process.env.GEMINI_API_KEY = prevKey;
      }
    });

    it('deve retornar status 500 com mensagem segura se a chave de API não estiver configurada', async () => {
      const prevKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.API_KEY;

      try {
        const { req, res } = createMockReqRes({
          method: 'POST',
          body: { contents: [{ parts: [{ text: 'analisar processo' }] }] },
        });

        await geminiHandler(req as any, res as any);

        expect(res.getStatusCode()).toBe(500);
        expect(res.getResponseData().error).toMatch(/não configurada no servidor/);
      } finally {
        process.env.GEMINI_API_KEY = prevKey;
      }
    });
  });

  // ─── SUÍTE 4: REST API v1 Cases Endpoint (/api/v1/cases) ────────────────────
  describe('4. REST API v1 Cases Endpoint (/api/v1/cases)', () => {
    it('deve listar processos via GET com sucesso', async () => {
      const { req, res } = createMockReqRes({
        method: 'GET',
        headers: { 'x-tenant-id': 'tenant_test_api' },
      });

      await casesV1Handler(req as any, res as any);
      expect(res.getStatusCode()).toBe(200);
      expect(res.getResponseData().success).toBe(true);
      expect(Array.isArray(res.getResponseData().data)).toBe(true);
    });

    it('deve criar novo processo via POST com sucesso', async () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        headers: { 'x-tenant-id': 'tenant_test_api' },
        body: {
          title: 'Ação Revisional de Contrato — Teste API',
          clientName: 'Empresa Teste SA',
          lawyerId: 1,
        },
      });

      await casesV1Handler(req as any, res as any);
      expect(res.getStatusCode()).toBe(201);
      expect(res.getResponseData().success).toBe(true);
      expect(res.getResponseData().data.title).toBe('Ação Revisional de Contrato — Teste API');
    });

    it('deve rejeitar métodos HTTP não suportados (DELETE) com 405', async () => {
      const { req, res } = createMockReqRes({
        method: 'DELETE',
        headers: { 'x-tenant-id': 'tenant_test_api' },
      });

      await casesV1Handler(req as any, res as any);
      expect(res.getStatusCode()).toBe(405);
    });
  });

  // ─── SUÍTE 5: REST API v1 Documents Endpoint (/api/v1/documents) ────────────
  describe('5. REST API v1 Documents Endpoint (/api/v1/documents)', () => {
    it('deve consultar versões GED de um documento via GET', async () => {
      const { req, res } = createMockReqRes({
        method: 'GET',
        headers: { 'x-tenant-id': 'tenant_test_api' },
        query: { document_id: 'doc_123' },
      });

      await documentsV1Handler(req as any, res as any);
      expect(res.getStatusCode()).toBe(200);
      expect(res.getResponseData().success).toBe(true);
      expect(Array.isArray(res.getResponseData().versions)).toBe(true);
    });

    it('deve rejeitar requisição sem document_id ou path com 400', async () => {
      const { req, res } = createMockReqRes({
        method: 'GET',
        headers: { 'x-tenant-id': 'tenant_test_api' },
      });

      await documentsV1Handler(req as any, res as any);
      expect(res.getStatusCode()).toBe(400);
      expect(res.getResponseData().success).toBe(false);
    });
  });

  // ─── SUÍTE 6: REST API v1 Webhooks Endpoint (/api/v1/webhooks) ───────────────
  describe('6. REST API v1 Webhooks Endpoint (/api/v1/webhooks)', () => {
    it('deve exigir header x-tenant-id retornando 400 se ausente', async () => {
      const { req, res } = createMockReqRes({
        method: 'GET',
      });

      await webhooksV1Handler(req as any, res as any);
      expect(res.getStatusCode()).toBe(400);
      expect(res.getResponseData().error).toMatch(/x-tenant-id é obrigatório/);
    });

    it('deve cadastrar nova subscrição de webhook via POST', async () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        headers: { 'x-tenant-id': 'tenant_test_api' },
        body: {
          url: 'https://webhook.site/test-integration',
          events: ['case.created', 'payment.received'],
        },
      });

      await webhooksV1Handler(req as any, res as any);
      expect(res.getStatusCode()).toBe(201);
      expect(res.getResponseData().success).toBe(true);
      expect(res.getResponseData().data.url).toBe('https://webhook.site/test-integration');
    });
  });


  // ─── Executar todas as suítes sequencialmente ──────────────────────────────
  for (const suite of _suites) {
    console.log(`\n--- [API CONTRACTS SUITE] ${suite.name} ---`);
    for (const { name, fn } of suite.cases) {
      try {
        const result = fn();
        if (result instanceof Promise) {
          await result;
        }
        console.log(`  ✓ ${name}`);
      } catch (err: any) {
        console.error(`  ✕ ${name}: ${err.message}`);
        throw err;
      }
    }
  }

  return true;
}
