import React, { useState } from 'react';
import {
  MOCK_CLIENT_CASE,
  MOCK_CLIENT_INVOICES,
  MOCK_CLIENT_MEETINGS,
  ClientInvoice,
  VirtualMeeting,
  formatPhaseStepInfo,
} from '../../lib/clientPortalEngine';

interface ClientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// External helper to copy text to clipboard (outside component for react-hooks/purity)
function copyToClipboardText(text: string, callback: () => void): void {
  navigator.clipboard.writeText(text);
  callback();
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'video' | 'invoices' | 'docs'>('timeline');
  const [invoices, setInvoices] = useState<ClientInvoice[]>(MOCK_CLIENT_INVOICES);
  const [meetings, setMeetings] = useState<VirtualMeeting[]>(MOCK_CLIENT_MEETINGS);
  const [activeMeetingRoom, setActiveMeetingRoom] = useState<boolean>(false);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPhaseInfo = formatPhaseStepInfo(MOCK_CLIENT_CASE.currentPhase);

  const handlePayPix = (invoiceId: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: 'paid',
            paidAt: new Date().toISOString(),
          };
        }
        return inv;
      })
    );
  };

  const handleCopyPix = (invoiceId: string, code: string) => {
    copyToClipboardText(code, () => {
      setCopiedPixId(invoiceId);
      setTimeout(() => setCopiedPixId(null), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Portal do Cliente & Sala Virtual de Atendimento">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-lg">Portal Exclusivo do Cliente</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  NÍVEL 14
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Acompanhamento Transparente sem Jargões · Sala Virtual Criptografada E2E · Pagamentos PIX
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/8 bg-slate-900/60 overflow-x-auto flex-shrink-0">
          {[
            { id: 'timeline', label: '📊 Meu Processo (Linha do Tempo)' },
            { id: 'video', label: `📹 Sala Virtual de Atendimento${activeMeetingRoom ? ' 🔴 (Ao Vivo)' : ''}` },
            { id: 'invoices', label: `💳 Honorários & Pagamentos (${invoices.filter(i => i.status === 'pending').length} Pendente)` },
            { id: 'docs', label: '📂 Meus Documentos' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/4'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0f1117]">
          
          {/* TAB 1: Linha do Tempo em Linguagem Leiga */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Header do Caso */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div>
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Processo sob seus Cuidados</span>
                  <h2 className="text-white font-bold text-base sm:text-lg mt-0.5">{MOCK_CLIENT_CASE.title}</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Processo nº <code className="text-indigo-300 font-mono">{MOCK_CLIENT_CASE.processNumber}</code>
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/6 flex-shrink-0">
                  <img
                    src={MOCK_CLIENT_CASE.advogadoAvatar}
                    alt={MOCK_CLIENT_CASE.advogadoNome}
                    className="w-10 h-10 rounded-full object-cover border border-emerald-500/40"
                  />
                  <div>
                    <span className="text-white font-bold text-xs block">{MOCK_CLIENT_CASE.advogadoNome}</span>
                    <span className="text-emerald-400 text-[10px] font-mono">{MOCK_CLIENT_CASE.advogadoOab}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Phase Info */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-white/8 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Progresso Geral da Causa:</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">{MOCK_CLIENT_CASE.progressPct}% Concluído</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-glow"
                    style={{ width: `${MOCK_CLIENT_CASE.progressPct}%` }}
                  />
                </div>

                {/* Status Traduzido em Linguagem Leiga */}
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📢</span>
                    <h3 className="text-emerald-300 font-bold text-sm">O que está acontecendo agora no seu processo:</h3>
                  </div>
                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                    "{MOCK_CLIENT_CASE.explicacaoLeiga}"
                  </p>
                </div>
              </div>

              {/* Visual 7 Steps Timeline */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-white/8 space-y-3">
                <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Etapas do Processo Judicial</h3>
                
                <div className="space-y-3">
                  {[
                    'distribuicao',
                    'citacao_reu',
                    'conciliacao',
                    'instrucao',
                    'sentenca',
                    'recurso',
                    'execucao_recebimento',
                  ].map((phase, idx) => {
                    const info = formatPhaseStepInfo(phase as any);
                    const isCurrent = MOCK_CLIENT_CASE.currentPhase === phase;
                    const isPassed = idx < 3;

                    return (
                      <div
                        key={phase}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-white font-bold ring-1 ring-emerald-500/40'
                            : isPassed
                            ? 'bg-slate-800/40 border-white/6 text-slate-300'
                            : 'bg-slate-950/30 border-white/4 text-slate-500'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isCurrent
                            ? 'bg-emerald-500 text-black shadow-lg animate-pulse'
                            : isPassed
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{info.label}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-black uppercase">
                                Fase Atual
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{info.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Sala Virtual de Atendimento (Videochamada E2E) */}
          {activeTab === 'video' && (
            <div className="max-w-3xl mx-auto space-y-4">
              {!activeMeetingRoom ? (
                <div className="p-6 rounded-2xl bg-slate-900 border border-white/8 space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-3xl">
                    📹
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">Sala Virtual de Atendimento 1-on-1</h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Conexão de áudio e vídeo criptografada de ponta a ponta (E2E) com seu advogado.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-left text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Reunião Agendada:</span>
                      <span className="text-white font-bold">{meetings[0].title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Data e Horário:</span>
                      <span className="text-emerald-400 font-mono font-bold">{meetings[0].dateStr} às {meetings[0].timeStr}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Segurança:</span>
                      <span className="text-emerald-300 font-semibold">🔒 Criptografia E2E Ativa</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveMeetingRoom(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>🎥 Entrar na Sala de Videochamada Agora</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Meeting Room Canvas */}
                  <div className="relative aspect-video rounded-2xl bg-slate-950 border border-emerald-500/40 overflow-hidden shadow-2xl flex flex-col justify-between p-4">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between z-10">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-xs">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        <span className="text-white font-bold">EM ATENDIMENTO AO VIVO</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                        🔒 E2E Encrypted Room #84920
                      </div>
                    </div>

                    {/* Participant Videos Grid */}
                    <div className="grid grid-cols-2 gap-4 my-auto h-3/4">
                      {/* Advogado */}
                      <div className="relative rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center">
                        <img
                          src={MOCK_CLIENT_CASE.advogadoAvatar}
                          alt="Advogado"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-[11px] text-white font-bold">
                          {MOCK_CLIENT_CASE.advogadoNome} (Advogado)
                        </div>
                      </div>

                      {/* Cliente (Você) */}
                      <div className="relative rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center">
                        {camOff ? (
                          <div className="flex flex-col items-center justify-center text-slate-500 text-xs">
                            <span className="text-3xl mb-1">👤</span>
                            <span>Câmera Desativada</span>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-300 text-xs font-semibold">
                            📷 Sua Câmera (Preview ao Vivo)
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-[11px] text-white font-bold">
                          Você (Cliente)
                        </div>
                      </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="flex items-center justify-center gap-3 z-10">
                      <button
                        onClick={() => setMicMuted(m => !m)}
                        className={`p-3 rounded-full transition-colors ${
                          micMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
                        }`}
                        title={micMuted ? 'Ativar Microfone' : 'Silenciar Microfone'}
                      >
                        {micMuted ? '🔇' : '🎙️'}
                      </button>
                      <button
                        onClick={() => setCamOff(c => !c)}
                        className={`p-3 rounded-full transition-colors ${
                          camOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
                        }`}
                        title={camOff ? 'Ativar Câmera' : 'Desativar Câmera'}
                      >
                        {camOff ? '📷❌' : '📹'}
                      </button>
                      <button
                        onClick={() => setActiveMeetingRoom(false)}
                        className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-colors"
                      >
                        📞 Encerrar Chamada
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Honorários & Pagamentos PIX */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {invoices.map(inv => (
                  <div key={inv.id} className="p-4 rounded-xl border border-white/8 bg-slate-900/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/6 pb-2">
                      <div>
                        <h3 className="text-white font-bold text-sm">{inv.title}</h3>
                        <p className="text-slate-400 text-xs">Vencimento: {inv.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {inv.status === 'paid' ? '✅ Pago' : '⏳ Aguardando Pagamento'}
                        </span>
                        <span className="font-mono text-emerald-400 font-bold text-base">
                          R$ {inv.valueBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {inv.status === 'pending' ? (
                      <div className="p-3 rounded-lg bg-slate-950 border border-white/6 space-y-2">
                        <span className="text-slate-300 text-xs font-semibold block">Pagamento Instantâneo via PIX:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={inv.pixCode}
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-white/10 rounded text-[10px] font-mono text-slate-400 truncate"
                          />
                          <button
                            onClick={() => handleCopyPix(inv.id, inv.pixCode)}
                            className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold whitespace-nowrap transition-colors"
                          >
                            {copiedPixId === inv.id ? '✅ Copiado!' : '📋 Copiar PIX'}
                          </button>
                          <button
                            onClick={() => handlePayPix(inv.id)}
                            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold whitespace-nowrap transition-colors shadow-md"
                          >
                            ⚡ Simular Baixa PIX
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-400 font-semibold flex items-center justify-between">
                        <span>Pago em: {inv.paidAt ? new Date(inv.paidAt).toLocaleString('pt-BR') : 'Confirmação bancária'}</span>
                        <button className="text-indigo-400 hover:underline">📄 Baixar Comprovante PDF</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Meus Documentos */}
          {activeTab === 'docs' && (
            <div className="space-y-3">
              {[
                { title: 'Procuração Ad Judicia Eletrônica Assinada', date: '2026-07-10', type: 'PDF Assinado SHA-256' },
                { title: 'Contrato de Honorários Advocatícios e Quota Litis', date: '2026-07-10', type: 'Smart Contract' },
                { title: 'Cópia da Decisão de Tutela de Urgência Deferida', date: '2026-08-05', type: 'Decisão Judicial' },
              ].map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-white/8 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h4 className="text-white font-bold text-sm">{doc.title}</h4>
                      <p className="text-slate-500 text-xs">Data: {doc.date} · {doc.type}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/14 text-white text-xs font-semibold transition-colors">
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/8 bg-slate-900/60 flex items-center justify-between flex-shrink-0">
          <p className="text-slate-500 text-xs">
            Legis Connect Nível 14 · Portal do Cliente & Sala Virtual Criptografada E2E
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/8 hover:bg-white/14 text-white text-sm transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
