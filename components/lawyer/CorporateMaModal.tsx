import React, { useState } from 'react';
import {
  calculateMaValuation,
  MOCK_DUE_DILIGENCE_LIABILITIES,
  generateSpaContractText,
  type ValuationResult,
} from '../../lib/corporateMaEngine';

interface CorporateMaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'valuation' | 'liabilities' | 'spa_gen' | 'audit_report';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const CorporateMaModal: React.FC<CorporateMaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('valuation');

  // Form de Valuation
  const [valForm, setValForm] = useState({
    targetName: 'TechBrasil Soluções S.A.',
    buyerName: 'Global Investimentos Fund',
    annualRevenue: '45000000',
    ebitda: '12000000',
    ebitdaMultiple: '6.5',
    totalDebt: '8000000',
    cashAndEquivalents: '3000000',
    identifiedLiabilities: '15000000',
  });

  const [valuationResult, setValuationResult] = useState<ValuationResult>(() =>
    calculateMaValuation({
      annualRevenue: 45000000,
      ebitda: 12000000,
      ebitdaMultiple: 6.5,
      totalDebt: 8000000,
      cashAndEquivalents: 3000000,
      identifiedLiabilities: 15000000,
    })
  );

  const [copiedSpa, setCopiedSpa] = useState(false);

  if (!isOpen) return null;

  const handleRunValuation = (e: React.FormEvent) => {
    e.preventDefault();
    const result = calculateMaValuation({
      annualRevenue: parseFloat(valForm.annualRevenue) || 0,
      ebitda: parseFloat(valForm.ebitda) || 0,
      ebitdaMultiple: parseFloat(valForm.ebitdaMultiple) || 0,
      totalDebt: parseFloat(valForm.totalDebt) || 0,
      cashAndEquivalents: parseFloat(valForm.cashAndEquivalents) || 0,
      identifiedLiabilities: parseFloat(valForm.identifiedLiabilities) || 0,
    });
    setValuationResult(result);
  };

  const spaText = generateSpaContractText(valForm.targetName, valForm.buyerName, valuationResult);

  const handleCopySpa = () => {
    navigator.clipboard.writeText(spaText);
    setCopiedSpa(true);
    setTimeout(() => setCopiedSpa(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-4xl bg-gray-50 dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-900 via-zinc-900 to-amber-950 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">🏢 Fusões & Aquisições (M&A) & Due Diligence</h2>
              <span className="text-[10px] bg-amber-500/30 text-amber-200 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                Corporate Governance
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-0.5">
              Valuation EV/EBITDA • Auditoria de Passivos • Contratos SPA & Escrow
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          {[
            { id: 'valuation', label: '🧮 Valuation & Deal Price', icon: '💰' },
            { id: 'liabilities', label: '🔍 Auditoria de Passivos', icon: '⚠️' },
            { id: 'spa_gen', label: '📜 Gerador SPA / Contrato', icon: '📄' },
            { id: 'audit_report', label: '📊 Relatório Due Diligence', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 py-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                activeTab === tab.id
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: Valuation */}
          {activeTab === 'valuation' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form onSubmit={handleRunValuation} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">💰 Parâmetros da Transação (Deal)</h4>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Empresa Alvo (Target)</label>
                  <input
                    type="text"
                    value={valForm.targetName}
                    onChange={(e) => setValForm({ ...valForm, targetName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">EBITDA Anual (R$)</label>
                    <input
                      type="number"
                      value={valForm.ebitda}
                      onChange={(e) => setValForm({ ...valForm, ebitda: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Múltiplo EV/EBITDA</label>
                    <input
                      type="number"
                      step="0.1"
                      value={valForm.ebitdaMultiple}
                      onChange={(e) => setValForm({ ...valForm, ebitdaMultiple: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Dívida Total (R$)</label>
                    <input
                      type="number"
                      value={valForm.totalDebt}
                      onChange={(e) => setValForm({ ...valForm, totalDebt: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Caixa (R$)</label>
                    <input
                      type="number"
                      value={valForm.cashAndEquivalents}
                      onChange={(e) => setValForm({ ...valForm, cashAndEquivalents: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Desconto por Passivos Due Diligence (R$)</label>
                  <input
                    type="number"
                    value={valForm.identifiedLiabilities}
                    onChange={(e) => setValForm({ ...valForm, identifiedLiabilities: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-md"
                >
                  ⚡ Recalcular Valuation & Deal Value
                </button>
              </form>

              {/* Resultado do Valuation */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">📊 Estrutura de Preço do Deal</h4>
                  <div className="space-y-2">
                    {valuationResult.breakdown.map((line, idx) => (
                      <p key={idx} className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/40 p-2 rounded-lg">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-xl border border-amber-200 dark:border-amber-700 text-center">
                  <span className="text-xs text-amber-800 dark:text-amber-300 font-bold uppercase">PREÇO AJUSTADO DE AQUISIÇÃO (PURCHASE PRICE)</span>
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                    R$ {valuationResult.netPurchasePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Auditoria de Passivos */}
          {activeTab === 'liabilities' && (
            <div className="space-y-3">
              {MOCK_DUE_DILIGENCE_LIABILITIES.map((liab) => (
                <div key={liab.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 rounded-full uppercase">
                        {liab.category}
                      </span>
                      <span className="font-mono text-xs text-gray-400">{liab.id}</span>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        liab.severity === 'deal_breaker'
                          ? 'bg-red-600 text-white animate-pulse'
                          : liab.severity === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {liab.severity === 'deal_breaker' ? '🚨 DEAL BREAKER' : liab.severity}
                    </span>
                  </div>

                  <p className="text-xs text-gray-800 dark:text-gray-200 font-medium">{liab.description}</p>

                  <div className="bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-gray-700 dark:text-gray-300">
                      <span>Valor Estimado: R$ {liab.estimatedValue.toLocaleString('pt-BR')}</span>
                      <span>Probabilidade: {liab.probability.toUpperCase()}</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400"><strong>Mitigação:</strong> {liab.mitigationStrategy}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Gerador SPA / Contrato */}
          {activeTab === 'spa_gen' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">📜 Minuta Oficial SPA (Share Purchase Agreement)</h4>
                  <button
                    onClick={handleCopySpa}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                  >
                    {copiedSpa ? '✅ Contrato Copiado!' : '📋 Copiar SPA Completo'}
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={14}
                  value={spaText}
                  className="w-full p-4 font-mono text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Relatório Due Diligence */}
          {activeTab === 'audit_report' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">📊 Relatório Executivo de Due Diligence M&A</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Relatório homologado para apresentação ao Conselho de Administração e Comitê de Investimento.
                </p>
                <div className="bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs space-y-2 border border-zinc-700">
                  <p className="text-amber-400 font-bold">SUMMARY REPORT: TARGET AUDIT COMPLETE</p>
                  <p>- Enterprise Value: R$ {valuationResult.enterpriseValue.toLocaleString('pt-BR')}</p>
                  <p>- Passivos Identificados: R$ {valForm.identifiedLiabilities.toLocaleString('pt-BR')}</p>
                  <p>- Recomendação: Prosseguir com o Fechamento condicionado a retenção de 15% em Conta Escrow.</p>
                  <p className="text-zinc-500 pt-2">Autenticado SHA-256: 9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 text-center">
          <p className="text-xs text-gray-400">
            Legis Connect — M&A Corporate Governance em Conformidade com a Lei das S.A. (Lei 6.404/76)
          </p>
        </div>
      </div>
    </div>
  );
};
