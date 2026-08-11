/**
 * components/common/LgpdSelfServiceModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal Self-Service de Atendimento aos Direitos do Titular (Art. 18 LGPD).
 * Permite a qualquer usuário solicitar cópia integral dos seus dados (SAR),
 * revogação de consentimento e solicitação de anonimização ou eliminação.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { requestLgpdDataExport, submitLgpdDeletionRequest } from '../../services/lgpdRightsService';
import type { User } from '../../types';

interface LgpdSelfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const LgpdSelfServiceModal: React.FC<LgpdSelfServiceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'delete' | 'consent'>('export');
  const [reason, setReason] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDataExport = () => {
    const email = currentUser?.email || 'titular@legisconnect.com.br';
    requestLgpdDataExport(email);
    setStatusMessage('✓ Relatório SAR gerado com sucesso. Cópia completa disponibilizada.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDeleteRequest = () => {
    const email = currentUser?.email || 'titular@legisconnect.com.br';
    submitLgpdDeletionRequest(email, reason || 'Solicitação direta do titular via portal.');
    setStatusMessage('✓ Solicitação de eliminação/anonimização enviada ao DPO (Prazo: 15 dias úteis).');
    setReason('');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1A1730] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2545] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-gray-200 dark:border-[#2A2545] flex items-center justify-between">
          <div>
            <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              LGPD — Lei 13.709/2018 (Artigo 18)
            </span>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
              Portal de Direitos do Titular de Dados
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252040]"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 dark:border-[#2A2545] bg-gray-50/50 dark:bg-[#151226]/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'export'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-[#252040]'
            }`}
          >
            📄 Cópia dos Dados (SAR)
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'consent'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-[#252040]'
            }`}
          >
            🛡️ Gestão de Consentimento
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'delete'
                ? 'bg-rose-600 text-white shadow'
                : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-[#252040]'
            }`}
          >
            ⚠️ Eliminação / Anonimização
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {statusMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
              {statusMessage}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Em conformidade com o Art. 18, II da LGPD, você tem o direito de obter a confirmação da existência de tratamento e o acesso integral aos seus dados pessoais armazenados pela plataforma.
              </p>
              <div className="p-4 bg-gray-50 dark:bg-[#151226] rounded-2xl border border-gray-200 dark:border-[#252040] space-y-2 text-xs">
                <div className="font-bold text-gray-800 dark:text-gray-200">Titular Identificado:</div>
                <div className="font-mono text-gray-500">{currentUser?.email || 'Usuário Não Autenticado'}</div>
              </div>
              <button
                onClick={handleDataExport}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                📥 Baixar Relatório Completo de Dados (JSON / SAR)
              </button>
            </div>
          )}

          {activeTab === 'consent' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Você pode gerenciar as finalidades de consentimento ativas para tratamento de dados pessoais (Art. 7º, I da LGPD).
              </p>
              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#151226] rounded-xl border border-gray-200 dark:border-[#252040]">
                  <span>Tratamento essencial para execução do contrato jurídico</span>
                  <input type="checkbox" checked disabled className="accent-blue-600" />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#151226] rounded-xl border border-gray-200 dark:border-[#252040]">
                  <span>Comunicações e notificações institucionais via WhatsApp/E-mail</span>
                  <input type="checkbox" defaultChecked className="accent-blue-600" />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'delete' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Solicite a eliminação ou anonimização dos seus dados pessoais não essenciais. Dados sujeitos a dever legal ou regulatório (ex: Provimento OAB e obrigações fiscais) serão mantidos sob guarda protegida pelo prazo regulatório de 5 anos (Art. 16, I da LGPD).
              </p>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Motivo ou observações da solicitação (opcional)..."
                className="w-full p-3 bg-gray-50 dark:bg-[#151226] border border-gray-200 dark:border-[#252040] rounded-xl text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows={3}
              />
              <button
                onClick={handleDeleteRequest}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                ⚠️ Solicitar Anonimização / Eliminação ao DPO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
