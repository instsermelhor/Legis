import React, { useState } from 'react';
import {
  analyzeAppealAdmissibility,
  generateSuperiorAppealDraft,
  type SuperiorAppealType,
  type TargetCourt,
  type AdmissibilityCheckResult,
} from '../../lib/superiorAppealsAiEngine';

interface SuperiorAppealsAiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'admissibility' | 'generator' | 'repercussao' | 'draft_preview';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const SuperiorAppealsAiModal: React.FC<SuperiorAppealsAiModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('admissibility');

  // Admissibility Test State
  const [admParams, setAdmParams] = useState({
    appealType: 'REsp' as SuperiorAppealType,
    targetCourt: 'STJ' as TargetCourt,
    hasPrequestionamento: true,
    reexaminesFacts: false,
    hasRepercussaoGeral: true,
    hasTranscendence: true,
  });

  const [admResult, setAdmResult] = useState<AdmissibilityCheckResult>(() =>
    analyzeAppealAdmissibility({
      appealType: 'REsp',
      targetCourt: 'STJ',
      hasPrequestionamento: true,
      reexaminesFacts: false,
      hasRepercussaoGeral: true,
    })
  );

  // Draft Form State
  const [draftForm, setDraftForm] = useState({
    appealType: 'REsp' as SuperiorAppealType,
    targetCourt: 'STJ' as TargetCourt,
    processNumber: '1004589-32.2024.8.26.0100',
    recurrentParty: 'Indústria Metalúrgica Alfa S.A.',
    recurredParty: 'Banco Financeiro Beta S.A.',
    violatedArticles: 'Art. 489 §1º CPC, Art. 1.022 CPC',
    precedentTheme: 'Tema 1050 STJ',
    keyArguments: 'O acórdão recorrido negou vigência ao Art. 1.022 do CPC ao omitir-se sobre a tese firmada em recurso repetitivo.',
  });

  const [generatedDraft, setGeneratedDraft] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);

  if (!isOpen) return null;

  const handleRunAdmissibilityTest = () => {
    const res = analyzeAppealAdmissibility(admParams);
    setAdmResult(res);
  };

  const handleGenerateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const text = generateSuperiorAppealDraft({
      appealType: draftForm.appealType,
      targetCourt: draftForm.targetCourt,
      processNumber: draftForm.processNumber,
      recurrentParty: draftForm.recurrentParty,
      recurredParty: draftForm.recurredParty,
      violatedArticles: draftForm.violatedArticles.split(',').map((s) => s.trim()),
      precedentTheme: draftForm.precedentTheme,
      keyArguments: draftForm.keyArguments,
    });
    setGeneratedDraft(text);
    setActiveTab('draft_preview');
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-4xl bg-gray-50 dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">🏛️ Recursos STF / STJ / TST & Filtros de Admissibilidade</h2>
              <span className="text-[10px] bg-purple-500/30 text-purple-200 font-bold px-2 py-0.5 rounded-full border border-purple-400/30">
                IA Recursal Avançada
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Filtro Súmulas 7 STJ / 279 STF • Repercussão Geral • Transcendência CLT
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          {[
            { id: 'admissibility', label: '⚖️ Teste de Admissibilidade', icon: '🔍' },
            { id: 'generator', label: '✍️ Gerador de Minutas', icon: '📝' },
            { id: 'repercussao', label: '🎯 Repercussão Geral & Transcendência', icon: '📌' },
            { id: 'draft_preview', label: '📄 Editor & SHA-256', icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 py-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
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
          {/* TAB 1: Teste de Admissibilidade */}
          {activeTab === 'admissibility' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">🔍 Diagnóstico de Barreiras Recursais</h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tribunal Alvo</label>
                    <select
                      value={admParams.targetCourt}
                      onChange={(e) => setAdmParams({ ...admParams, targetCourt: e.target.value as TargetCourt })}
                      className="w-full px-2 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="STJ">STJ (Recurso Especial)</option>
                      <option value="STF">STF (Recurso Extraordinário)</option>
                      <option value="TST">TST (Recurso de Revista)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tipo de Recurso</label>
                    <select
                      value={admParams.appealType}
                      onChange={(e) => setAdmParams({ ...admParams, appealType: e.target.value as SuperiorAppealType })}
                      className="w-full px-2 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="REsp">REsp</option>
                      <option value="RE">RE</option>
                      <option value="RR">RR (Trabalhista)</option>
                      <option value="AREsp">AREsp</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={admParams.hasPrequestionamento}
                      onChange={(e) => setAdmParams({ ...admParams, hasPrequestionamento: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    Há prequestionamento expresso dos artigos violados?
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={admParams.reexaminesFacts}
                      onChange={(e) => setAdmParams({ ...admParams, reexaminesFacts: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    O recurso depende do reexame de fatos/provas (Súmulas 7 STJ / 279 STF)?
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={admParams.hasRepercussaoGeral}
                      onChange={(e) => setAdmParams({ ...admParams, hasRepercussaoGeral: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    Demonstrada preliminar formal de Repercussão Geral / Transcendência?
                  </label>
                </div>

                <button
                  onClick={handleRunAdmissibilityTest}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-md"
                >
                  ⚡ Executar Teste de Admissibilidade por IA
                </button>
              </div>

              {/* Resultado da Admissibilidade */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">📊 Probabilidade de Admissão</h4>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold text-white ${
                        admResult.score >= 80 ? 'bg-emerald-600' : admResult.score >= 50 ? 'bg-amber-600' : 'bg-red-600'
                      }`}
                    >
                      {admResult.score}% Probabilidade
                    </span>
                  </div>

                  {admResult.barriers.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-red-600">🚨 Barreiras Detectadas:</span>
                      {admResult.barriers.map((b, idx) => (
                        <p key={idx} className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                          • {b}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1 pt-2">
                    <span className="text-xs font-bold text-emerald-600">💡 Recomendações de Ajuste:</span>
                    {admResult.recommendations.map((r, idx) => (
                      <p key={idx} className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/40 p-2 rounded-lg">
                        ✓ {r}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Gerador de Minutas */}
          {activeTab === 'generator' && (
            <form onSubmit={handleGenerateDraft} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">✍️ Parâmetros da Minuta Recursal</h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Processo Nº</label>
                  <input
                    type="text"
                    value={draftForm.processNumber}
                    onChange={(e) => setDraftForm({ ...draftForm, processNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Artigos Violados</label>
                  <input
                    type="text"
                    value={draftForm.violatedArticles}
                    onChange={(e) => setDraftForm({ ...draftForm, violatedArticles: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Síntese do Fundamento Jurídico da Violação</label>
                <textarea
                  rows={3}
                  value={draftForm.keyArguments}
                  onChange={(e) => setDraftForm({ ...draftForm, keyArguments: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-md"
              >
                ✨ Gerar Minuta Completa do Recurso por IA
              </button>
            </form>
          )}

          {/* TAB 3: Repercussão Geral */}
          {activeTab === 'repercussao' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 text-xs text-indigo-800 dark:text-indigo-300">
                📌 <strong>Gerador de Preliminar de Repercussão Geral (Art. 1.035 CPC)</strong> — Minuta a relevância social, econômica, política ou jurídica para superação do filtro do STF.
              </div>
            </div>
          )}

          {/* TAB 4: Editor & SHA-256 */}
          {activeTab === 'draft_preview' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">📄 Minuta do Recurso Gerada por IA</h4>
                  <button
                    onClick={handleCopyDraft}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                  >
                    {copiedDraft ? '✅ Recurso Copiado!' : '📋 Copiar Minuta Completa'}
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={14}
                  value={generatedDraft || 'Preencha o formulário na aba "Gerador de Minutas" para criar o recurso.'}
                  className="w-full p-4 font-mono text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 text-center">
          <p className="text-xs text-gray-400">
            Legis Connect — Advocacia de Tribunais Superiores (STF/STJ/TST) em Conformidade com o CPC/2015
          </p>
        </div>
      </div>
    </div>
  );
};
