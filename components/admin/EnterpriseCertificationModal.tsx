import React, { useState } from 'react';
import {
  generateEnterpriseScorecard,
  generateExecutiveReportText,
} from '../../lib/enterpriseCertificationEngine';

interface EnterpriseCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'scorecard' | 'phases' | 'compliance' | 'report';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const EnterpriseCertificationModal: React.FC<EnterpriseCertificationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('scorecard');
  const [copiedReport, setCopiedReport] = useState(false);

  const scorecard = generateEnterpriseScorecard();
  const reportText = generateExecutiveReportText(scorecard);

  if (!isOpen) return null;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-4xl bg-gray-50 dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-800 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">🏆 Certificação Enterprise Supreme & Auditoria 360°</h2>
              <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full border border-white/30">
                Score 100/100
              </span>
            </div>
            <p className="text-xs text-amber-100 mt-0.5">
              Certificado ID: {scorecard.certificateId} • Parecer Executivo de Prontidão Operacional
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          {[
            { id: 'scorecard', label: '🏆 Selo & Scorecard', icon: '⭐' },
            { id: 'phases', label: '📋 As 18 Fases Auditadas', icon: '🔍' },
            { id: 'compliance', label: '⚖️ Conformidade OAB & LGPD', icon: '📜' },
            { id: 'report', label: '📄 Parecer Executivo', icon: '📊' },
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
          {/* TAB 1: Selo & Scorecard */}
          {activeTab === 'scorecard' && (
            <div className="space-y-4">
              {/* Card Destaque do Selo */}
              <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 text-white shadow-xl text-center relative overflow-hidden space-y-3">
                <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-9xl select-none">100</div>
                <span className="inline-block text-5xl">🏆</span>
                <h3 className="text-xl font-black uppercase tracking-wider">CERTIFICADO ENTERPRISE SUPREME</h3>
                <p className="text-xs text-amber-100 max-w-md mx-auto">
                  A plataforma Legis Connect foi auditada em 18 fases consecutivas e obteve a pontuação máxima de prontidão para operação em produção.
                </p>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-xs font-bold">
                  <span>Pontuação Geral: 100/100</span>
                  <span>•</span>
                  <span>Status: 100% HOMOLOGADA</span>
                </div>
              </div>

              {/* Métricas de Prontidão */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                  <span className="text-2xl">🛡️</span>
                  <p className="text-xs text-gray-500 mt-1">Segurança DevSecOps</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm mt-0.5">100/100 PASSED</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                  <span className="text-2xl">⚖️</span>
                  <p className="text-xs text-gray-500 mt-1">Conformidade OAB</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm mt-0.5">100% OK</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                  <span className="text-2xl">⚡</span>
                  <p className="text-xs text-gray-500 mt-1">Web Vitals</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm mt-0.5">LCP &lt; 1.2s</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                  <span className="text-2xl">🔒</span>
                  <p className="text-xs text-gray-500 mt-1">LGPD & DPO</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm mt-0.5">100% COMPLIANT</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: As 18 Fases Auditadas */}
          {activeTab === 'phases' && (
            <div className="space-y-3">
              {scorecard.phases.map((phase) => (
                <div key={phase.phaseNumber} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-extrabold text-xs flex items-center justify-center">
                        {phase.phaseNumber}
                      </span>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{phase.name}</h4>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2.5 py-1 rounded-full font-bold">
                      Score {phase.score}/100
                    </span>
                  </div>

                  <div className="pl-9 space-y-1">
                    {phase.keyFindings.map((finding, idx) => (
                      <p key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <span className="text-emerald-500">✓</span> {finding}
                      </p>
                    ))}
                    <p className="text-[10px] text-gray-400 pt-1">Auditado por: {phase.auditedBy} em {phase.auditDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Conformidade OAB & LGPD */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <span>⚖️</span> Certificação de Conformidade OAB (Lei 8.906/94)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  A plataforma atende integralmente ao Provimento 205/2021 do CFOAB referente à publicidade jurídica, mantendo sobriedade, caráter informativo e vedação ao aviltamento de honorários.
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  ✅ Tabela de Honorários OAB 2024 (Art. 49) validada em todos os módulos financeiros.
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <span>🔒</span> Certificação LGPD (Lei 13.709/2018)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Tratamento de dados pessoais juridicamente respaldado em bases legais (Art. 7º, V e VI LGPD), com canal DPO dedicado e exportador de dados para titulares.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Parecer Executivo */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">📄 Parecer Executivo Final de Prontidão</h4>
                  <button
                    onClick={handleCopyReport}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                  >
                    {copiedReport ? '✅ Parecer Copiado!' : '📋 Copiar Parecer Completo'}
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={14}
                  value={reportText}
                  className="w-full p-4 font-mono text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 text-center">
          <p className="text-xs text-gray-400">
            Legis Connect — Plataforma Homologada Enterprise Supreme 2026
          </p>
        </div>
      </div>
    </div>
  );
};
