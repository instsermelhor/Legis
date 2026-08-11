/**
 * components/admin/SystemHealthModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — SYSTEM HEALTH & OBSERVABILITY MODAL
 * Painel de saúde da infraestrutura, monitoramento de Web Vitals,
 * diagnósticos de conexão, armazenamento e fila de erros do Sentry/Monitoring.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { runHealthCheck, getErrorQueue, clearErrorQueue, getDeploymentInfo, type AppError } from '../../lib/monitoring';
import { performanceMetricsEngine, type PerformanceSummary } from '../../lib/performanceMetricsEngine';
import { infrastructureCacheManager } from '../../lib/infrastructureCacheManager';

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemHealthModal: React.FC<SystemHealthModalProps> = ({ isOpen, onClose }) => {
  const [healthStatus, setHealthStatus] = useState<{
    status: 'healthy' | 'degraded' | 'down';
    checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }>;
  } | null>(null);
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);
  const [errorQueue, setErrorQueue] = useState<AppError[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'webvitals' | 'errors' | 'cache'>('infrastructure');

  const deploymentInfo = getDeploymentInfo();

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const hc = await runHealthCheck();
      setHealthStatus(hc);
      setPerformanceSummary(performanceMetricsEngine.getSummary());
      setErrorQueue(getErrorQueue());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      performanceMetricsEngine.init();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearErrors = () => {
    clearErrorQueue();
    setErrorQueue([]);
  };

  const handleClearCache = () => {
    infrastructureCacheManager.clear();
    alert('Cache de infraestrutura limpo com sucesso!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#151226] rounded-3xl border border-gray-200 dark:border-[#252040] shadow-2xl overflow-hidden flex flex-col"
        data-testid="system-health-modal"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
              🏥
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Painel de Saúde e Observabilidade
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    healthStatus?.status === 'healthy'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}
                >
                  {healthStatus?.status === 'healthy' ? '🟢 Operacional' : '⚠️ Atenção'}
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                v{deploymentInfo.version} • {deploymentInfo.environment} • {deploymentInfo.commitSha}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors text-xs font-semibold flex items-center gap-1"
            >
              🔄 {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-white/[0.02] px-6 gap-2">
          {(['infrastructure', 'webvitals', 'errors', 'cache'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-xs font-bold transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-primary text-primary dark:text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'infrastructure' && '🖥️ Infraestrutura & Conetores'}
              {tab === 'webvitals' && '⚡ Core Web Vitals'}
              {tab === 'errors' && `⚠️ Fila de Erros (${errorQueue.length})`}
              {tab === 'cache' && '💾 Gestão de Cache'}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Infrastructure */}
          {activeTab === 'infrastructure' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diagnostic Checks</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {healthStatus?.checks &&
                  Object.entries(healthStatus.checks).map(([key, check]) => (
                    <div
                      key={key}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">{key}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${check.ok ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {check.ok ? '✓ OK' : '✕ FALHA'}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-gray-400">
                        {check.latencyMs !== undefined ? `Latência: ${check.latencyMs}ms` : check.error || 'N/A'}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 2: Web Vitals */}
          {activeTab === 'webvitals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-purple-500/10 border border-emerald-500/20">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Score de Desempenho Geral</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Baseado em medições dos Core Web Vitals no cliente</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-500">{performanceSummary?.score ?? 100}/100</span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{performanceSummary?.rating}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {performanceSummary?.metrics &&
                  Object.entries(performanceSummary.metrics).map(([name, m]) => (
                    <div key={name} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.rating === 'good' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {m.rating}
                        </span>
                      </div>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">{m.value} <span className="text-xs font-normal text-gray-400">{name === 'CLS' ? '' : 'ms'}</span></p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 3: Error Queue */}
          {activeTab === 'errors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fila de Exceções em Memória</h3>
                {errorQueue.length > 0 && (
                  <button
                    onClick={handleClearErrors}
                    className="text-xs text-rose-500 font-semibold hover:underline"
                  >
                    Limpar Fila
                  </button>
                )}
              </div>
              {errorQueue.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-gray-400 text-xs">
                  🎉 Nenhum erro registrado nesta sessão.
                </div>
              ) : (
                <div className="space-y-2">
                  {errorQueue.map((err) => (
                    <div key={err.id} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs font-mono">
                      <div className="flex justify-between font-bold text-rose-400 mb-1">
                        <span>{err.component || 'Global'} → {err.action || 'Unknown'}</span>
                        <span className="text-[10px] text-gray-500">{new Date(err.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{err.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Cache Management */}
          {activeTab === 'cache' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Gerenciador de Cache em Memória (LRU)</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                    Itens armazenados em cache: {infrastructureCacheManager.size()}
                  </p>
                </div>
                <button
                  onClick={handleClearCache}
                  className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors"
                >
                  Purgar Cache
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
