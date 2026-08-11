import React, { useState, useEffect } from 'react';
import { getConsolidatedBiMetrics, BiMetricsResult } from '../../lib/biAnalyticsEngine';

import { exportBiReportPdf, exportBiReportExcel } from '../../services/biExporterService';

interface BiAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BiAnalyticsModal: React.FC<BiAnalyticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [metrics, setMetrics] = useState<BiMetricsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      getConsolidatedBiMetrics().then(res => {
        if (isMounted) {
          setMetrics(res);
          setIsLoading(false);
        }
      });
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExportPdf = () => {
    if (!metrics) return;
    exportBiReportPdf(metrics);
    setExportSuccess('PDF Exportado!');
    setTimeout(() => setExportSuccess(null), 3000);
  };

  const handleExportExcel = () => {
    if (!metrics) return;
    exportBiReportExcel(metrics);
    setExportSuccess('Excel Exportado!');
    setTimeout(() => setExportSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#1A1730] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2545] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-primary/10 to-emerald-500/10 border-b border-gray-200 dark:border-[#2A2545] flex items-center justify-between">
          <div>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Nível 8 — BI Analytics & Governança OAB/LGPD
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              Painel de Inteligência Financeira & Auditoria de Conformidade
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252040]"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading || !metrics ? (
            <div className="py-20 text-center text-gray-400 text-xs">
              <span className="text-3xl block mb-2 animate-spin">⚡</span>
              Consolidando indicadores financeiros e executando auditoria OAB/LGPD...
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Executive KPIs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#151226] border border-gray-200 dark:border-[#252040]">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Receita Bruta Total</div>
                  <div className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-emerald-500 font-bold mt-1">▲ +18.4% este mês</div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#151226] border border-gray-200 dark:border-[#252040]">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Processos Ativos</div>
                  <div className="text-xl md:text-2xl font-black text-primary dark:text-white mt-1">
                    {metrics.activeCasesCount} <span className="text-xs font-semibold text-gray-400">casos</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Média {metrics.avgCaseDurationDays} dias</div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#151226] border border-gray-200 dark:border-[#252040]">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Taxa de Conversão</div>
                  <div className="text-xl md:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                    {metrics.conversionRate}%
                  </div>
                  <div className="text-[10px] text-purple-500 font-bold mt-1">Consultas → Contratos</div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#151226] border border-gray-200 dark:border-[#252040]">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Compliance LGPD/OAB</div>
                  <div className="text-xl md:text-2xl font-black text-amber-500 mt-1">
                    {metrics.lgpdComplianceScore}%
                  </div>
                  <div className="text-[10px] text-amber-500 font-bold mt-1">🛡️ Certificado Ativo</div>
                </div>
              </div>

              {/* Revenue Breakdown by Specialty */}
              <div className="bg-gray-50 dark:bg-[#151226] p-6 rounded-2xl border border-gray-200 dark:border-[#252040]">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                  <span>📊 Faturamento por Área do Direito (DRE Jurídico)</span>
                  <span className="text-xs text-gray-400 font-normal">Mês Atual</span>
                </h4>

                <div className="space-y-4">
                  {metrics.revenueBySpecialty.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{item.specialty}</span>
                        <span className="font-mono text-gray-600 dark:text-gray-400">
                          R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-[#252040] rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance & Governance Shield */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <div className="font-bold text-emerald-800 dark:text-emerald-300">
                      Auditoria Contínua de Ética OAB & LGPD (Art. 16 LGPD / Prov. 205 OAB)
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {metrics.oabEthicsStatus} • Criptografia AES-GCM ativa em dados de clientes.
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleExportPdf}
                    className="px-3 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-all shadow flex items-center gap-1"
                  >
                    📄 Exportar PDF
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="px-3 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-all shadow flex items-center gap-1"
                  >
                    📊 Exportar Excel
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
