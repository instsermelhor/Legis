/**
 * scripts/run-all-tests.ts — Legis Connect Master Test Execution Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Executável CLI para rodar todas as 16 suítes de testes da plataforma.
 *
 * Cobertura de Testes:
 *   • Unitários: Auth, PRD, Security Pentest, Escrow, BI Exporter,
 *                Performance/Infra, Visual UI, Multi-Agent Engine,
 *                Gemini IA, UX Journeys, RBAC Conformance.
 *   • Integração: LGPD/RBAC End-to-End, Sync Supabase, Sequência UML.
 *   • Multitenancy: RLS Database Security, Tenant Isolation.
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

interface SuiteResult {
  suiteName: string;
  category: 'UNIT' | 'INTEGRATION' | 'MULTITENANCY' | 'SECURITY';
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
      // Formato objeto (ex: { totalTests, passedTests, tests: [...] })
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
  console.log('================================================================');
  console.log('  LEGIS CONNECT — MASTER AUTOMATED TEST EXECUTION ENGINE');
  console.log('================================================================');
  console.log(`  Data: ${new Date().toISOString()}`);
  console.log('----------------------------------------------------------------\n');

  const suites: SuiteResult[] = [];

  // Suítes Unitárias
  suites.push(await executeSuite('01. Authentication & PBKDF2 Hashing', 'UNIT', runAuthTests));
  suites.push(await executeSuite('02. PRD Master Compliance Contract', 'SECURITY', runPrdComplianceTests));
  suites.push(await executeSuite('03. Security Pentest (OWASP Top 10)', 'SECURITY', runSecurityPentestTests));
  suites.push(await executeSuite('04. Escrow Custody & Fee Split', 'UNIT', runEscrowTests));
  suites.push(await executeSuite('05. BI Exporter Engine', 'UNIT', runBiExporterTests));
  suites.push(await executeSuite('06. Performance & Infrastructure Limits', 'UNIT', runPerformanceInfrastructureTests));
  suites.push(await executeSuite('07. Visual UI Conformance', 'UNIT', runVisualUiConformanceTests));
  suites.push(await executeSuite('08. Legis Multi-Agent Engine', 'UNIT', runLegisMultiAgentEngineTests));
  suites.push(await executeSuite('09. Gemini AI Integration & Throttling', 'UNIT', runGeminiTests));
  suites.push(await executeSuite('10. UX Journeys Simulation', 'UNIT', runUxJourneysSimulationTests));
  suites.push(await executeSuite('11. RBAC Conformance & Matrix', 'SECURITY', runRbacConformanceTests));

  // Suítes de Integração
  suites.push(await executeSuite('12. LGPD & RBAC End-to-End Flow', 'INTEGRATION', runEndToEndIntegrationTests));
  suites.push(await executeSuite('13. Supabase Cloud Sync Engine', 'INTEGRATION', runSupabaseSyncTests));
  suites.push(await executeSuite('14. UML Sequence Architecture', 'INTEGRATION', runUmlSequenceTests));

  // Suítes de Multitenancy & RLS
  suites.push(await executeSuite('15. PostgreSQL RLS Database Security', 'MULTITENANCY', runDatabaseRlsSecurityTests));
  suites.push(await executeSuite('16. Tenant Isolation & IDOR Defense', 'MULTITENANCY', runMultiTenancyTests));

  // Suíte de Arquitetura Modular & Catálogo
  // Suíte de Error Reporting & Gestão de Incidentes
  suites.push(await executeSuite('17. Module Catalog & Entitlements Engine', 'SECURITY', runModuleCatalogTests));
  suites.push(await executeSuite('18. Error Reporting & Incident Management', 'SECURITY', runErrorReportingTests));

  // Impressão dos resultados
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
    const fill = s.suiteName.padEnd(45, '.');
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
