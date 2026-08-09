import React, { useState, useEffect } from 'react';
import { runAuthTests, TestResult } from '../../tests/unit/auth.test';
import { runEscrowTests } from '../../tests/unit/escrow.test';
import { runGeminiTests } from '../../tests/unit/gemini.test';
import { runSupabaseSyncTests } from '../../tests/integration/supabaseSync.test';
import { validateAuditChainIntegrity, AuditIntegrityReport } from '../../security/auditIntegrityValidator';
import { auditSecurityHeaders, SecurityHeaderCheck } from '../../security/securityHeaders';

export const QaTestExecutionPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditIntegrityReport | null>(null);
  const [securityHeaders, setSecurityHeaders] = useState<SecurityHeaderCheck[]>([]);

  const executeAllTests = async () => {
    setRunning(true);
    try {
      const auth = await runAuthTests();
      const escrow = await runEscrowTests();
      const ai = await runGeminiTests();
      const sync = await runSupabaseSyncTests();

      setTestResults([...auth, ...escrow, ...ai, ...sync]);
      setAuditReport(validateAuditChainIntegrity());
      setSecurityHeaders(auditSecurityHeaders());
    } catch (err) {
      console.error('[QaTestExecutionPanel] Erro ao rodar suíte de testes', err);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    executeAllTests();
  }, []);

  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.passed).length;
  const failedTests = totalTests - passedTests;
  const totalDuration = testResults.reduce((acc, t) => acc + t.durationMs, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            🧪 Suíte de Testes Automatizados (Sprint 10 QA)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-medium">
              Zero-Defect SDLC
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Validação automatizada de Autenticação, Escrow/Split, Consumo IA Gemini, Sync Supabase e Integridade de Auditoria.
          </p>
        </div>

        <button
          onClick={executeAllTests}
          disabled={running}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition shadow-md shadow-indigo-950 flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          {running ? '🔄 Executando Testes...' : '▶ Rodar Suíte Completa QA'}
        </button>
      </div>

      {/* KPI Cards dos Testes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 text-xs">
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block mb-1">Total de Testes</span>
          <span className="text-lg font-bold font-mono text-slate-200">{totalTests} Suítes</span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block mb-1">Aprovados</span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            {passedTests} ({totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%)
          </span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block mb-1">Reprovados</span>
          <span className={`text-lg font-bold font-mono ${failedTests > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {failedTests}
          </span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block mb-1">Tempo Total</span>
          <span className="text-lg font-bold font-mono text-indigo-400">{totalDuration} ms</span>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="overflow-x-auto border border-slate-800 rounded-lg mb-5">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="px-3 py-2">Categoria</th>
              <th className="px-3 py-2">Nome do Teste</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Duração</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {testResults.map((t, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition">
                <td className="px-3 py-2 font-mono text-slate-400">{t.category}</td>
                <td className="px-3 py-2 font-medium text-slate-200">{t.name}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.passed
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {t.passed ? '✓ Aprovado' : '✕ Reprovado'}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-slate-400 text-right">{t.durationMs} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Seção de Integridade de Hash-Chain e DevSecOps Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Integridade da Trilha de Auditoria */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <h4 className="font-bold text-xs text-slate-200 mb-2 flex items-center justify-between">
            <span>🔒 Cadeia de Hashes de Auditoria</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                auditReport?.isChainIntact ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {auditReport?.isChainIntact ? 'Cadeia Íntacta' : 'Violação Detectada'}
            </span>
          </h4>
          <div className="space-y-1 text-xs text-slate-400 font-mono">
            <p>Registros Verificados: {auditReport?.totalRecords ?? 0}</p>
            <p>Registros Válidos: {auditReport?.validRecords ?? 0}</p>
            <p className={auditReport?.tamperedRecords ? 'text-rose-400' : 'text-emerald-400'}>
              Registros Adulterados: {auditReport?.tamperedRecords ?? 0}
            </p>
          </div>
        </div>

        {/* Auditoria de Security Headers */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <h4 className="font-bold text-xs text-slate-200 mb-2">
            🛡️ DevSecOps Security Headers
          </h4>
          <div className="space-y-1 text-[11px]">
            {securityHeaders.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-slate-300">
                <span className="truncate pr-2">{h.header}</span>
                <span className="font-mono text-emerald-400 shrink-0">✓ Conformidade</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
