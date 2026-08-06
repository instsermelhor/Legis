import React, { useState } from 'react';
import {
  calculatePrecatorioValuation,
  generatePrecatorioAssignmentContract,
  type PrecatorioEntity,
  type PrecatorioNature,
  type PrecatorioValuationResult,
} from '../../lib/precatorioCreditEngine';

interface PrecatorioCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'calculator' | 'contract_gen' | 'queue_tracker' | 'audit_report';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const PrecatorioCreditModal: React.FC<PrecatorioCreditModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');

  // Form State
  const [calcForm, setCalcForm] = useState({
    grossAmount: '450000',
    entity: 'União Federal' as PrecatorioEntity,
    nature: 'Alimentar' as PrecatorioNature,
    isPreferential: true,
    haircutPercentage: '30',
    lawyerFeePercentage: '20',
    estimatedYearsToPay: '2',
  });

  const [valResult, setValResult] = useState<PrecatorioValuationResult>(() =>
    calculatePrecatorioValuation({
      grossAmount: 450000,
      entity: 'União Federal',
      nature: 'Alimentar',
      isPreferential: true,
      haircutPercentage: 30,
      lawyerFeePercentage: 20,
      estimatedYearsToPay: 2,
    })
  );

  // Contract Form State
  const [contractForm, setContractForm] = useState({
    assignorName: 'João da Silva (Cedente)',
    assigneeName: 'Fundo de Investimento Américas FIDC (Cessionário)',
    processNumber: '0010482-44.2021.4.03.6100',
    precatorioNumber: 'PRC-2024-009812',
  });

  const [copiedContract, setCopiedContract] = useState(false);

  if (!isOpen) return null;

  const handleRunValuation = (e: React.FormEvent) => {
    e.preventDefault();
    const res = calculatePrecatorioValuation({
      grossAmount: parseFloat(calcForm.grossAmount) || 0,
      entity: calcForm.entity,
      nature: calcForm.nature,
      isPreferential: calcForm.isPreferential,
      haircutPercentage: parseFloat(calcForm.haircutPercentage) || 0,
      lawyerFeePercentage: parseFloat(calcForm.lawyerFeePercentage) || 0,
      estimatedYearsToPay: parseFloat(calcForm.estimatedYearsToPay) || 0,
    });
    setValResult(res);
  };

  const contractText = generatePrecatorioAssignmentContract({
    assignorName: contractForm.assignorName,
    assigneeName: contractForm.assigneeName,
    processNumber: contractForm.processNumber,
    precatorioNumber: contractForm.precatorioNumber,
    entity: calcForm.entity,
    valuation: valResult,
  });

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractText);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-4xl bg-gray-50 dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">💰 Precatórios, RPVs & Cessão de Créditos</h2>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                Mercado Financeiro Jurídico
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Simulador de Deságio • Cessão de Crédito Judicial • Ordem Preferencial (Art. 100 CF)
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          {[
            { id: 'calculator', label: '🧮 Valuation & Deságio', icon: '💰' },
            { id: 'contract_gen', label: '📜 Contrato de Cessão', icon: '📄' },
            { id: 'queue_tracker', label: '🏛️ Fila de Pagamento LOA', icon: '📊' },
            { id: 'audit_report', label: '📊 Parecer do Crédito SHA-256', icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 py-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
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
          {/* TAB 1: Valuation & Deságio */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form onSubmit={handleRunValuation} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">💰 Parâmetros da Opereção de Crédito</h4>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Valor Bruto de Face (R$)</label>
                  <input
                    type="number"
                    value={calcForm.grossAmount}
                    onChange={(e) => setCalcForm({ ...calcForm, grossAmount: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Deságio Acordado (%)</label>
                    <input
                      type="number"
                      value={calcForm.haircutPercentage}
                      onChange={(e) => setCalcForm({ ...calcForm, haircutPercentage: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Honorários Advocatícios (%)</label>
                    <input
                      type="number"
                      value={calcForm.lawyerFeePercentage}
                      onChange={(e) => setCalcForm({ ...calcForm, lawyerFeePercentage: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Ente Devedor</label>
                    <select
                      value={calcForm.entity}
                      onChange={(e) => setCalcForm({ ...calcForm, entity: e.target.value as PrecatorioEntity })}
                      className="w-full px-2 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="União Federal">União Federal (TRF)</option>
                      <option value="Estado de SP (TJSP)">Estado de SP (TJSP)</option>
                      <option value="Estado do RJ (TJRJ)">Estado do RJ (TJRJ)</option>
                      <option value="Município de São Paulo">Município de SP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Natureza</label>
                    <select
                      value={calcForm.nature}
                      onChange={(e) => setCalcForm({ ...calcForm, nature: e.target.value as PrecatorioNature })}
                      className="w-full px-2 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Alimentar">Alimentar (Prioritário)</option>
                      <option value="Comum">Comum</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-md"
                >
                  ⚡ Recalcular Liquidação & Payout
                </button>
              </form>

              {/* Resultado do Valuation */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">📊 Apuração Financeira do Precatório</h4>
                  <div className="space-y-2 text-xs">
                    <p className="flex justify-between bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg">
                      <span>Valor Facial Bruto:</span>
                      <strong className="font-mono">R$ {valResult.grossAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </p>
                    <p className="flex justify-between bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg">
                      <span>Honorários Advocatícios Destacados:</span>
                      <strong className="font-mono text-emerald-600">R$ {valResult.lawyerFeeAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </p>
                    <p className="flex justify-between bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg">
                      <span>Deságio Aplicado ({calcForm.haircutPercentage}%):</span>
                      <strong className="font-mono text-red-600">R$ {valResult.discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-700 text-center">
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold uppercase">VALOR LÍQUIDO A RECEBER PELO CLIENTE (PAYOUT)</span>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                    R$ {valResult.netPayoutToClient.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Contrato de Cessão */}
          {activeTab === 'contract_gen' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">📜 Minuta do Contrato de Cessão de Crédito Judicial</h4>
                  <button
                    onClick={handleCopyContract}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                  >
                    {copiedContract ? '✅ Contrato Copiado!' : '📋 Copiar Contrato Completo'}
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={14}
                  value={contractText}
                  className="w-full p-4 font-mono text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Fila de Pagamento LOA */}
          {activeTab === 'queue_tracker' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 text-xs text-emerald-800 dark:text-emerald-300">
                🏛️ <strong>Fila de Pagamento do Ente Devedor (LOA 2024/2025)</strong> — Rastreamento de ordem cronológica e prioridades constitucionais.
              </div>
            </div>
          )}

          {/* TAB 4: Parecer SHA-256 */}
          {activeTab === 'audit_report' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">📊 Relatório Executivo de Auditoria de Crédito</h4>
                <div className="bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs space-y-2 border border-zinc-700">
                  <p className="text-emerald-400 font-bold">PRECATÓRIO VALUATION COMPLETE</p>
                  <p>- Valor Bruto: R$ {valResult.grossAmount.toLocaleString('pt-BR')}</p>
                  <p>- Liquidação Líquida: R$ {valResult.netPayoutToClient.toLocaleString('pt-BR')}</p>
                  <p className="text-zinc-500 pt-2">Autenticado SHA-256: {valResult.signatureHash}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 text-center">
          <p className="text-xs text-gray-400">
            Legis Connect — Gestão de Precatórios & Créditos Judiciais em Conformidade com o Art. 100 da CF/88
          </p>
        </div>
      </div>
    </div>
  );
};
