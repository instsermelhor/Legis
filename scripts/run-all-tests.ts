/**
 * scripts/run-all-tests.ts — Legis Connect Master Test Execution Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Executável CLI para rodar todas as 22 suítes de testes da plataforma.
 *
 * Cobertura de Testes:
 *   • Unitários (01 a 11, 20, 21): Auth, PRD, Security Pentest, Escrow, BI Exporter,
 *                Performance/Infra, Visual UI, Multi-Agent Engine, Gemini IA,
 *                UX Journeys, RBAC Conformance, Concurrency, WCAG A11y.
 *   • Integração (12 a 14, 19): LGPD/RBAC End-to-End, Sync Supabase, Sequência UML,
 *                API Contracts & Endpoints.
 *   • Multitenancy (15, 16): RLS Database Security, Tenant Isolation & IDOR.
 *   • Arquitetura & Segurança (17, 18): Catálogo de Módulos, Error Reporting.
 *   • E2E Journeys (22): 10 Jornadas Críticas de Usuário.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Polyfills para ambiente de execução CLI (Node.js) ───────────────────────
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new MemoryStorage();
}
if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as any).sessionStorage = new MemoryStorage();
}
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    location: { origin: 'http://localhost:3000', pathname: '/' }
  };
}

import { runAuthTests } from '../tests/unit/auth.test';
import { runBiExporterTests } from '../tests/unit/biExporter.test';
import { runEscrowTests } from '../tests/unit/escrow.test';
import { runGeminiTests } from '../tests/unit/gemini.test';
import { runLegisMultiAgentEngineTests } from '../tests/unit/legisMultiAgentEngine.test';
import { runPerformanceInfrastructureTests } from '../tests/unit/performanceInfrastructure.test';
import { runPrdComplianceTests } from '../tests/unit/prdCompliance.test';
import { runRbacConformanceTests } from '../tests/unit/rbacConformance.test';
import { runSecurityPentestTests } from '../tests/unit/securityPentest.test';
import { runUxJourneysSimulationTests } from '../tests/unit/uxJourneysSimulation.test';
import { runVisualUiConformanceTests } from '../tests/unit/visualUiConformance.test';
import { runEndToEndIntegrationTests } from '../tests/integration/lgpdRbacEndToEnd.test';
import { runSupabaseSyncTests } from '../tests/integration/supabaseSync.test';
import { runUmlSequenceTests } from '../tests/integration/umlSequence.test';
import { runDatabaseRlsSecurityTests } from '../tests/multitenancy/rls-database-security.test';
import { runMultiTenancyTests } from '../tests/multitenancy/tenant-isolation.test';
import { runModuleCatalogTests } from '../tests/unit/moduleCatalog.test';
import { runErrorReportingTests } from '../tests/unit/errorReporting.test';
import { runApiContractsTests } from '../tests/api/apiContractsAndEndpoints.test';
import { runConcurrencyAndIdempotencyTests } from '../tests/unit/concurrencyAndIdempotency.test';
import { runWcagAccessibilityTests } from '../tests/accessibility/wcagAccessibility.test';
import { runE2EJourneysEngineTests } from '../tests/e2e/e2eJourneysEngine.test';

export interface SuiteResult {
  suiteName: string;
  category: 'UNIT' | 'INTEGRATION' | 'MULTITENANCY' | 'SECURITY' | 'E2E';
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  errors: string[];
}

async function executeSuite(
  name: string,
  category: SuiteResult['category'],
  fn: () => Promise<any> | any
): Promise<SuiteResult> {
  const t0 = performance.now();
  let total = 0;
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    const rawResult = await fn();

    if (Array.isArray(rawResult)) {
      total = rawResult.length;
      for (const r of rawResult) {
        if (r.passed) {
          passed++;
        } else {
          failed++;
          errors.push(`${r.name || r.testDescription || 'Test'}: ${r.error || 'Failed'}`);
        }
      }
    } else if (rawResult && typeof rawResult === 'object') {
      const tests = rawResult.tests || rawResult.results || [];
      if (Array.isArray(tests) && tests.length > 0) {
        total = tests.length;
        for (const t of tests) {
          if (t.passed) {
            passed++;
          } else {
            failed++;
            errors.push(`${t.name || t.testDescription || 'Test'}: ${t.error || 'Failed'}`);
          }
        }
      } else {
        total = rawResult.totalTests || 1;
        passed = rawResult.passedTests || (rawResult.success !== false ? total : 0);
        failed = total - passed;
      }
    } else {
      total = 1;
      passed = 1;
    }
  } catch (err: any) {
    total = 1;
    failed = 1;
    errors.push(`Exceção não tratada na suíte: ${err?.message || String(err)}`);
  }

  const durationMs = Math.round(performance.now() - t0);
  return { suiteName: name, category, total, passed, failed, durationMs, errors };
}

export async function runAllSuites(): Promise<SuiteResult[]> {
  const args = process.argv.slice(2);
  const filterUnit = args.includes('--unit');
  const filterIntegration = args.includes('--integration');
  const filterSecurity = args.includes('--security');
  const filterE2E = args.includes('--e2e');
  const filterMultitenancy = args.includes('--multitenancy');

  const hasFilter = filterUnit || filterIntegration || filterSecurity || filterE2E || filterMultitenancy;

  console.log('================================================================');
  console.log('  LEGIS CONNECT — MASTER AUTOMATED TEST EXECUTION ENGINE');
  console.log('================================================================');
  console.log(`  Data: ${new Date().toISOString()}`);
  if (hasFilter) {
    console.log(`  Filtro Ativo: ${[
      filterUnit && 'UNIT',
      filterIntegration && 'INTEGRATION',
      filterSecurity && 'SECURITY',
      filterE2E && 'E2E',
      filterMultitenancy && 'MULTITENANCY'
    ].filter(Boolean).join(', ')}`);
  }
  console.log('----------------------------------------------------------------\n');

  const allSuitesDefinitions: Array<{
    name: string;
    category: SuiteResult['category'];
    fn: () => Promise<any> | any;
  }> = [
    // Suítes Unitárias & Core
    { name: '01. Authentication & PBKDF2 Hashing', category: 'UNIT', fn: runAuthTests },
    { name: '02. PRD Master Compliance Contract', category: 'SECURITY', fn: runPrdComplianceTests },
    { name: '03. Security Pentest (OWASP Top 10)', category: 'SECURITY', fn: runSecurityPentestTests },
    { name: '04. Escrow Custody & Fee Split', category: 'UNIT', fn: runEscrowTests },
    { name: '05. BI Exporter Engine', category: 'UNIT', fn: runBiExporterTests },
    { name: '06. Performance & Infrastructure Limits', category: 'UNIT', fn: runPerformanceInfrastructureTests },
    { name: '07. Visual UI Conformance', category: 'UNIT', fn: runVisualUiConformanceTests },
    { name: '08. Legis Multi-Agent Engine', category: 'UNIT', fn: runLegisMultiAgentEngineTests },
    { name: '09. Gemini AI Integration & Throttling', category: 'UNIT', fn: runGeminiTests },
    { name: '10. UX Journeys Simulation', category: 'UNIT', fn: runUxJourneysSimulationTests },
    { name: '11. RBAC Conformance & Matrix', category: 'SECURITY', fn: runRbacConformanceTests },

    // Suítes de Integração & Backend
    { name: '12. LGPD & RBAC End-to-End Flow', category: 'INTEGRATION', fn: runEndToEndIntegrationTests },
    { name: '13. Supabase Cloud Sync Engine', category: 'INTEGRATION', fn: runSupabaseSyncTests },
    { name: '14. UML Sequence Architecture', category: 'INTEGRATION', fn: runUmlSequenceTests },

    // Suítes de Multitenancy & RLS
    { name: '15. PostgreSQL RLS Database Security', category: 'MULTITENANCY', fn: runDatabaseRlsSecurityTests },
    { name: '16. Tenant Isolation & IDOR Defense', category: 'MULTITENANCY', fn: runMultiTenancyTests },

    // Suítes de Módulos, Incidentes, Contratos, Concorrência, A11y & E2E
    { name: '17. Module Catalog & Entitlements Engine', category: 'SECURITY', fn: runModuleCatalogTests },
    { name: '18. Error Reporting & Incident Management', category: 'SECURITY', fn: runErrorReportingTests },
    { name: '19. API Contracts & Endpoints Integrity', category: 'INTEGRATION', fn: runApiContractsTests },
    { name: '20. Concurrency, Idempotency & Race Conditions', category: 'UNIT', fn: runConcurrencyAndIdempotencyTests },
    { name: '21. WCAG 2.1 AA Accessibility & Semantics', category: 'UNIT', fn: runWcagAccessibilityTests },
    { name: '22. 10 Critical User Journeys Engine (E2E)', category: 'E2E', fn: runE2EJourneysEngineTests },
  ];

  const suitesToRun = allSuitesDefinitions.filter(s => {
    if (!hasFilter) return true;
    if (filterUnit && s.category === 'UNIT') return true;
    if (filterIntegration && s.category === 'INTEGRATION') return true;
    if (filterSecurity && s.category === 'SECURITY') return true;
    if (filterE2E && s.category === 'E2E') return true;
    if (filterMultitenancy && s.category === 'MULTITENANCY') return true;
    return false;
  });

  const suites: SuiteResult[] = [];

  for (const def of suitesToRun) {
    suites.push(await executeSuite(def.name, def.category, def.fn));
  }

  // Impressão consolidada dos resultados
  let totalTestsAll = 0;
  let totalPassedAll = 0;
  let totalFailedAll = 0;
  let totalDurationAll = 0;

  console.log('RESULTADOS POR SUÍTE DE TESTE:\n');

  for (const s of suites) {
    totalTestsAll += s.total;
    totalPassedAll += s.passed;
    totalFailedAll += s.failed;
    totalDurationAll += s.durationMs;

    const icon = s.failed === 0 ? '✅ PASSED' : '❌ FAILED';
    const fill = s.suiteName.padEnd(50, '.');
    console.log(`  ${icon}  ${fill} ${s.passed}/${s.total} (${s.durationMs}ms)`);

    if (s.errors.length > 0) {
      for (const err of s.errors) {
        console.error(`          └─ ⚠️  ${err}`);
      }
    }
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`  RESUMO DA SUÍTE MASTER LEGIS CONNECT:`);
  console.log(`    Total de Suítes Executadas: ${suites.length}`);
  console.log(`    Total de Testes Automatizados: ${totalTestsAll}`);
  console.log(`    Aprovados: ${totalPassedAll}`);
  console.log(`    Falhas:    ${totalFailedAll}`);
  console.log(`    Tempo Total de Execução: ${totalDurationAll}ms`);
  console.log('================================================================\n');

  if (totalFailedAll > 0) {
    console.error('❌ EXECUÇÃO FINALIZADA COM FALHAS DE TESTE.');
    process.exit(1);
  } else {
    console.log('✅ 100% DAS SUÍTES DE TESTE FORAM APROVADAS COM SUCESSO!');
    process.exit(0);
  }
}

// Executa via CLI quando invocado diretamente
runAllSuites();
