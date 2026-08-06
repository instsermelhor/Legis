import React, { useState } from 'react';
import {
  MOCK_CONTROLLER_TASKS,
  MOCK_SUPERIOR_NOTICES,
  generateProtocolCertificate,
  type ControllerTask,
} from '../../lib/legalControllerEngine';

interface LegalControllerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'review_queue' | 'superior_courts' | 'sla_performance' | 'certificates';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const LegalControllerModal: React.FC<LegalControllerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('review_queue');
  const [tasks, setTasks] = useState<ControllerTask[]>(MOCK_CONTROLLER_TASKS);
  const [selectedTask, setSelectedTask] = useState<ControllerTask | null>(MOCK_CONTROLLER_TASKS[0]);
  const [copiedCert, setCopiedCert] = useState(false);

  if (!isOpen) return null;

  const handleApproveTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'approved',
              sha256Proof: 'c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8',
            }
          : t
      )
    );
  };

  const certText = selectedTask ? generateProtocolCertificate(selectedTask) : '';

  const handleCopyCert = () => {
    navigator.clipboard.writeText(certText);
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-4xl bg-gray-50 dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-cyan-950 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">🎯 Controladoria Jurídica & Monitor STF/STJ</h2>
              <span className="text-[10px] bg-cyan-500/30 text-cyan-200 font-bold px-2 py-0.5 rounded-full border border-cyan-400/30">
                SLA 100% Zero Falhas
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Conferência em 4 Olhos • Protocolo Tempestivo • Publicações dos Tribunais Superiores
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          {[
            { id: 'review_queue', label: '🎯 Fila de Conferência (4 Olhos)', icon: '🔍' },
            { id: 'superior_courts', label: '🏛️ Monitor STF / STJ / TST', icon: '🏛️' },
            { id: 'sla_performance', label: '📊 SLA de Prazos', icon: '📈' },
            { id: 'certificates', label: '📜 Certificados SHA-256', icon: '📄' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 py-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                activeTab === tab.id
                  ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20'
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
          {/* TAB 1: Fila de Conferência */}
          {activeTab === 'review_queue' && (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{task.processNumber}</span>
                      <p className="text-xs text-gray-400">{task.court} • Advogado: {task.lawyerName}</p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                        task.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700 animate-pulse'
                      }`}
                    >
                      {task.status === 'approved' ? '✅ Aprovado para Protocolo' : '⏳ Pendente de Revisão (4 Olhos)'}
                    </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{task.documentType}</span>
                      <p className="text-gray-500">Vencimento Legal: <strong className="text-red-600">{new Date(task.deadlineDate).toLocaleDateString('pt-BR')}</strong></p>
                    </div>

                    {task.status === 'pending_review' ? (
                      <button
                        onClick={() => handleApproveTask(task.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
                      >
                        ✓ Aprovar e Protocolar
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setActiveTab('certificates');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors"
                      >
                        📄 Ver Certificado
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Monitor Tribunais Superiores */}
          {activeTab === 'superior_courts' && (
            <div className="space-y-3">
              <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700 rounded-xl p-3 text-xs text-cyan-800 dark:text-cyan-300">
                🏛️ <strong>Feed em Tempo Real STF / STJ / TST</strong> — Captura automática de acórdãos, decisões monocráticas e teses de Repercussão Geral.
              </div>

              {MOCK_SUPERIOR_NOTICES.map((notice) => (
                <div key={notice.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">
                        {notice.court}
                      </span>
                      <span className="font-bold text-xs text-gray-800 dark:text-gray-200">{notice.processNumber}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{notice.organ} • Relator: {notice.ministerName}</span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg leading-relaxed">
                    "{notice.summaryText}"
                  </p>

                  <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1">
                    <span>Tema Vinculado: <strong className="text-indigo-600 dark:text-indigo-400">{notice.precedentTheme || 'N/A'}</strong></span>
                    <span>Publicado em {new Date(notice.publicationDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SLA de Prazos */}
          {activeTab === 'sla_performance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center border border-gray-100 dark:border-gray-700">
                  <span className="text-2xl">🎯</span>
                  <p className="text-xs text-gray-500 mt-1">Cumprimento SLA</p>
                  <p className="font-extrabold text-emerald-600 text-base mt-0.5">100% TEMPESTIVO</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center border border-gray-100 dark:border-gray-700">
                  <span className="text-2xl">👁️</span>
                  <p className="text-xs text-gray-500 mt-1">Revisão 4 Olhos</p>
                  <p className="font-extrabold text-indigo-600 text-base mt-0.5">100% AUDITADO</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center border border-gray-100 dark:border-gray-700">
                  <span className="text-2xl">🚨</span>
                  <p className="text-xs text-gray-500 mt-1">Risco de Preclusão</p>
                  <p className="font-extrabold text-gray-900 dark:text-white text-base mt-0.5">0 FALHAS</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center border border-gray-100 dark:border-gray-700">
                  <span className="text-2xl">⚡</span>
                  <p className="text-xs text-gray-500 mt-1">Tempo Médio Revisão</p>
                  <p className="font-extrabold text-cyan-600 text-base mt-0.5">42 MINUTOS</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Certificados SHA-256 */}
          {activeTab === 'certificates' && (
            <div className="space-y-4">
              {selectedTask ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">📜 Certificado Oficial de Protocolo Criptográfico</h4>
                    <button
                      onClick={handleCopyCert}
                      className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                    >
                      {copiedCert ? '✅ Certificado Copiado!' : '📋 Copiar Certificado SHA-256'}
                    </button>
                  </div>

                  <textarea
                    readOnly
                    rows={12}
                    value={certText}
                    className="w-full p-4 font-mono text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 leading-relaxed focus:outline-none"
                  />
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">Selecione uma tarefa aprovada para visualizar o certificado.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 text-center">
          <p className="text-xs text-gray-400">
            Legis Connect — Governance & Legal Controller Suite com Certificação SHA-256
          </p>
        </div>
      </div>
    </div>
  );
};
