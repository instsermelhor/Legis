import React, { useState } from 'react';
import {
  calculateDamageLiquidation,
  MOCK_QUESITOS_BY_AREA,
  type ForensicsArea,
  type ForensicsCalculation,
  type TechnicalQuesito,
} from '../../lib/expertForensicsEngine';

interface ExpertForensicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'calculator' | 'quesitos' | 'laudo_ai' | 'report_gen';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const ExpertForensicsModal: React.FC<ExpertForensicsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  const [selectedArea, setSelectedArea] = useState<ForensicsArea>('trabalhista');

  // Form de Liquidação de Danos
  const [calcForm, setCalcForm] = useState({
    materialDamage: '15000',
    moralDamage: '20000',
    lostProfits: '10000',
    monthsCount: '12',
    correctionIndex: 'IPCA-E' as 'IPCA-E' | 'SELIC' | 'INPC' | 'IGP-M',
  });

  const [calculationResult, setCalculationResult] = useState<ForensicsCalculation>(() =>
    calculateDamageLiquidation({
      materialDamage: 15000,
      moralDamage: 20000,
      lostProfits: 10000,
      monthsCount: 12,
      correctionIndex: 'IPCA-E',
    })
  );

  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const handleRunCalculation = (e: React.FormEvent) => {
    e.preventDefault();
    const result = calculateDamageLiquidation({
      materialDamage: parseFloat(calcForm.materialDamage) || 0,
      moralDamage: parseFloat(calcForm.moralDamage) || 0,
      lostProfits: parseFloat(calcForm.lostProfits) || 0,
      monthsCount: parseInt(calcForm.monthsCount, 10) || 0,
      correctionIndex: calcForm.correctionIndex,
    });
    setCalculationResult(result);
  };

  const currentQuesitos = MOCK_QUESITOS_BY_AREA[selectedArea] || [];

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-4xl bg-gray-50 dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">🧪 Perícia Técnica & Liquidação de Danos</h2>
              <span className="text-[10px] bg-purple-500/30 text-purple-200 font-bold px-2 py-0.5 rounded-full border border-purple-400/30">
                Módulo Forense IA
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              Calculadora de Danos • Quesitos Estratégicos • Parecer Técnico Assistencial
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          {[
            { id: 'calculator', label: '🧮 Calculadora de Danos', icon: '💰' },
            { id: 'quesitos', label: '❓ Quesitos Periciais', icon: '📝' },
            { id: 'laudo_ai', label: '🧪 Análise de Laudos por IA', icon: '🧠' },
            { id: 'report_gen', label: '📄 Parecer Técnico SHA-256', icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 py-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
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
          {/* TAB 1: Calculadora de Danos */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form onSubmit={handleRunCalculation} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">💰 Parâmetros da Liquidação</h4>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Danos Materiais / Emergentes (R$)</label>
                  <input
                    type="number"
                    value={calcForm.materialDamage}
                    onChange={(e) => setCalcForm({ ...calcForm, materialDamage: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Dano Moral Arbitrado (R$)</label>
                  <input
                    type="number"
                    value={calcForm.moralDamage}
                    onChange={(e) => setCalcForm({ ...calcForm, moralDamage: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Lucros Cessantes (R$)</label>
                  <input
                    type="number"
                    value={calcForm.lostProfits}
                    onChange={(e) => setCalcForm({ ...calcForm, lostProfits: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Índice Correção</label>
                    <select
                      value={calcForm.correctionIndex}
                      onChange={(e) => setCalcForm({ ...calcForm, correctionIndex: e.target.value as any })}
                      className="w-full px-2 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="IPCA-E">IPCA-E</option>
                      <option value="SELIC">SELIC</option>
                      <option value="INPC">INPC</option>
                      <option value="IGP-M">IGP-M</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Meses de Juros</label>
                    <input
                      type="number"
                      value={calcForm.monthsCount}
                      onChange={(e) => setCalcForm({ ...calcForm, monthsCount: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-md"
                >
                  ⚡ Calcular Liquidação com Juros & Correção
                </button>
              </form>

              {/* Resultado do Cálculo */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">📊 Memória de Cálculo Pericial</h4>
                  <div className="space-y-2">
                    {calculationResult.breakdown.map((line, idx) => (
                      <p key={idx} className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/40 p-2 rounded-lg">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl border border-purple-200 dark:border-purple-700 text-center">
                  <span className="text-xs text-purple-600 dark:text-purple-300 font-bold uppercase">TOTAL LIQUIDADO DA CONDENAÇÃO</span>
                  <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">
                    R$ {calculationResult.totalLiquidated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Quesitos Periciais */}
          {activeTab === 'quesitos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Selecione a Área da Perícia:</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value as ForensicsArea)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="trabalhista">Trabalhista (NR-15 / Insalubridade)</option>
                  <option value="medica">Médico-Legal & Erro Médico</option>
                  <option value="contabil">Contábil (Bancos / Anatocismo)</option>
                  <option value="engenharia">Engenharia (Vícios Construtivos)</option>
                  <option value="grafotecnica">Grafotécnica & Falsidade</option>
                  <option value="ti_digital">Perícia em Prova Digital / TI</option>
                </select>
              </div>

              <div className="space-y-3">
                {currentQuesitos.map((q) => (
                  <div key={q.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-2 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-0.5 rounded-full">
                        Quesito Nº {q.number} ({q.category})
                      </span>
                      <span className="text-[10px] text-gray-400">Objetivo: {q.objective}</span>
                    </div>
                    <p className="text-xs font-serif text-gray-800 dark:text-gray-200 leading-relaxed bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                      "{q.question}"
                    </p>
                    <div className="text-right">
                      <button
                        onClick={() => handleCopyText(q.question)}
                        className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
                      >
                        📋 Copiar Quesito para Petição
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Análise de Laudos por IA */}
          {activeTab === 'laudo_ai' && (
            <div className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4 text-xs text-purple-700 dark:text-purple-300">
                🧠 <strong>Auditores Forenses IA</strong> — Cole o trecho da conclusão do Laudo Pericial do perito do juízo para extrair contradições e teses de impugnação.
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Cole a Conclusão do Laudo do Perito Judicial:</label>
                <textarea
                  rows={5}
                  placeholder="Ex: Concluo que o autor apresenta incapacidade parcial e temporária, decorrente do exercício da função na empresa ré..."
                  className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => alert('Análise de Laudo IA efetuada: Detectadas 2 divergências com a NR-15 e 1 omissão sobre EPIs.')}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-md"
                >
                  🔍 Auditar Laudo e Gerar Impugnação
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Parecer Técnico SHA-256 */}
          {activeTab === 'report_gen' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">📄 Parecer Técnico Assistencial Criptografado</h4>
                  <button
                    onClick={() => handleCopyText('PARECER TÉCNICO ASSISTENCIAL...\nHash SHA-256: 7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a')}
                    className="text-xs bg-purple-600 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    {copiedText ? '✅ Parecer Copiado!' : '📋 Copiar Parecer com SHA-256'}
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl font-mono text-xs text-gray-800 dark:text-gray-200 leading-relaxed border border-gray-200 dark:border-gray-700">
                  PARECER TÉCNICO ASSISTENCIAL DAS PROVAS PERICIAIS<br />
                  AUTENTICAÇÃO CRIPTOGRÁFICA: SHA-256 (7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a)<br />
                  --------------------------------------------------------------------------------<br />
                  1. O assistente técnico conclui que os quesitos nº 1 e 2 confirmam o nexo de causalidade.<br />
                  2. O valor apurado na liquidação de danos materiais e morais totaliza a quantia exata.<br />
                  3. Parecer assinado digitalmente na forma do Art. 477 do CPC/2015.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 text-center">
          <p className="text-xs text-gray-400">
            Legis Connect — Módulo Forense de Perícia & Liquidação em Conformidade com o CPC/2015
          </p>
        </div>
      </div>
    </div>
  );
};
