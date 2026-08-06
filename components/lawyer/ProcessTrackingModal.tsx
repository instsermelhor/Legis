import React, { useState } from 'react';
import {
  PublicationItem,
  TrackedProcess,
  MOCK_PUBLICATIONS,
  MOCK_TRACKED_PROCESSES,
  calculateCpcDeadline,
  formatUrgencyBadge,
  HOLIDAYS_BR_2026,
} from '../../lib/djenProcessCrawlerEngine';

interface ProcessTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// External helper function to format Date object cleanly (outside component for react-hooks/purity)
function formatDateBr(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getTodayIsoString(): string {
  return new Date().toISOString().slice(0, 10);
}

export const ProcessTrackingModal: React.FC<ProcessTrackingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'djen' | 'calculator' | 'processes' | 'alerts'>('djen');
  const [publications, setPublications] = useState<PublicationItem[]>(MOCK_PUBLICATIONS);
  const [trackedProcesses, setTrackedProcesses] = useState<TrackedProcess[]>(MOCK_TRACKED_PROCESSES);
  
  // States para Calculadora CPC
  const [calcDispDate, setCalcDispDate] = useState<string>(getTodayIsoString());
  const [calcDays, setCalcDays] = useState<number>(15);

  // States para Adicionar Processo
  const [newProcessNumber, setNewProcessNumber] = useState('');
  const [newTribunal, setNewTribunal] = useState('TJSP');
  const [newCliente, setNewCliente] = useState('');
  const [addProcessMessage, setAddProcessMessage] = useState('');

  if (!isOpen) return null;

  const unreadPubsCount = publications.filter(p => !p.lida).length;

  const handleToggleRead = (pubId: string) => {
    setPublications(prev =>
      prev.map(p => (p.id === pubId ? { ...p, lida: !p.lida } : p))
    );
  };

  const handleAddTrackedProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcessNumber || !newCliente) return;

    const newPrc: TrackedProcess = {
      id: `prc_${Math.random().toString(36).slice(2, 8)}`,
      processNumber: newProcessNumber,
      tribunal: newTribunal,
      comarcaVara: 'Vara Cível / Trabalhista',
      clienteNome: newCliente,
      classeProcessual: 'Procedimento Comum',
      assuntoPrincipal: 'Monitoramento DataJud CNJ',
      valorCausaBrl: 150000.00,
      dataDistribuicao: getTodayIsoString(),
      status: 'ativo',
      ultimaMovimentacao: 'Processo cadastrado no monitoramento DataJud/Legis',
      dataUltimaMovimentacao: getTodayIsoString(),
    };

    setTrackedProcesses(prev => [newPrc, ...prev]);
    setAddProcessMessage('✅ Processo cadastrado com sucesso! Monitoramento ativado.');
    setTimeout(() => {
      setAddProcessMessage('');
      setNewProcessNumber('');
      setNewCliente('');
    }, 1500);
  };

  const calcResult = calculateCpcDeadline(calcDispDate, calcDays);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Gestão Eletrônica de Processos & Prazos CPC/2015">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg">
              <span className="text-xl">⚖️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-lg">Gestão de Processos & Diários Oficiais (DJEN)</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  NÍVEL 12
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Crawler DJEN/DataJud · Calculadora CPC/2015 (Dias Úteis) · Prevenção de Preclusão
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/8 bg-slate-900/60 overflow-x-auto flex-shrink-0">
          {[
            { id: 'djen', label: '📜 Intimações DJEN', count: unreadPubsCount },
            { id: 'calculator', label: '⏳ Calculadora CPC (Dias Úteis)' },
            { id: 'processes', label: `📁 Processos Acompanhados (${trackedProcesses.length})` },
            { id: 'alerts', label: '🔔 Prevenção de Preclusão' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/4'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500 text-white font-bold animate-pulse">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0f1117]">
          
          {/* TAB 1: Intimações DJEN */}
          {activeTab === 'djen' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-xs">
                  Feed do Diário de Justiça Eletrônico Nacional monitorado em tempo real por OAB.
                </p>
                <span className="text-xs text-indigo-400 font-semibold">
                  🔍 OAB/SP 412.980 · 4 publicações encontradas
                </span>
              </div>

              <div className="space-y-3">
                {publications.map(pub => {
                  const urgencyInfo = formatUrgencyBadge(pub.urgency);
                  return (
                    <div
                      key={pub.id}
                      className={`p-4 rounded-xl border transition-all ${
                        pub.lida
                          ? 'border-white/6 bg-slate-900/30 text-slate-400'
                          : 'border-purple-500/30 bg-purple-950/20 text-white shadow-lg'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/6 pb-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-indigo-300">
                              {pub.processNumber}
                            </span>
                            <span className="text-xs text-slate-400">· {pub.tribunal}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">👥 Partes: {pub.partes}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${urgencyInfo.badgeColor}`}>
                            {urgencyInfo.label}
                          </span>
                          <button
                            onClick={() => handleToggleRead(pub.id)}
                            className="text-xs text-purple-400 hover:text-purple-300 underline ml-2"
                          >
                            {pub.lida ? 'Marcar não lida' : '✓ Marcar como Lida'}
                          </button>
                        </div>
                      </div>

                      {/* Resumo IA */}
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-white/6 space-y-1 mb-2">
                        <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold">
                          <span>🤖 Resumo Preditivo IA:</span>
                          <span>{pub.resumoIa}</span>
                        </div>
                        <p className="text-xs text-emerald-400">
                          🎯 Ação Recomendada: {pub.tipoAcaoRecomendada} (Prazo: {pub.prazoDiasUteis} dias úteis)
                        </p>
                      </div>

                      {/* Trecho do Diário Oficial */}
                      <p className="text-xs text-slate-300 font-mono line-clamp-3 bg-black/40 p-2.5 rounded-lg border border-white/4">
                        "{pub.conteudoCompleto}"
                      </p>

                      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2">
                        <span>Disponibilização: {pub.dataDisponibilizacao} · Publicação: {pub.dataPublicacao}</span>
                        <span>{pub.diarioName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Calculadora Inteligente CPC */}
          {activeTab === 'calculator' && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-slate-300 space-y-1">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <span>⏳ Calculadora de Prazos CPC/2015 (Art. 219 e 224)</span>
                </h3>
                <p>
                  Regra do CPC/2015: Contagem exclusiva em **dias úteis**. A disponibilização no DJEN gera a publicação no 1º dia útil seguinte, e o prazo começa no 1º dia útil após a publicação. Finais de semana e feriados nacionais são pulados automaticamente.
                </p>
              </div>

              {/* Controles de Entrada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900 border border-white/8">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                    📅 Data da Disponibilização no Diário Oficial (DJEN)
                  </label>
                  <input
                    type="date"
                    value={calcDispDate}
                    onChange={e => setCalcDispDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                    ⏱️ Prazo Legal (Dias Úteis)
                  </label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 30].map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setCalcDays(days)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          calcDays === days
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {days} Dias
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resultado do Cálculo */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 border border-purple-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/8 pb-3">
                  <div>
                    <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Vencimento do Prazo (Fatal)</span>
                    <h2 className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                      {formatDateBr(calcResult.dataVencimento)}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      calcResult.isPrazoFatal ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {calcResult.isPrazoFatal ? '🚨 PRAZO CURTO (Fatal)' : '✅ Prazo Regular'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/6">
                    <span className="text-slate-500 block text-[10px]">1. Disponibilização (D0)</span>
                    <span className="text-white font-mono font-semibold">{formatDateBr(calcResult.dataDisponibilizacao)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/6">
                    <span className="text-slate-500 block text-[10px]">2. Publicação Oficial (D1)</span>
                    <span className="text-purple-300 font-mono font-semibold">{formatDateBr(calcResult.dataPublicacao)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/6">
                    <span className="text-slate-500 block text-[10px]">3. Início da Contagem</span>
                    <span className="text-indigo-300 font-mono font-semibold">{formatDateBr(calcResult.dataInicioContagem)}</span>
                  </div>
                </div>

                {calcResult.feriadosIgnorados.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                    <span className="font-bold">🏖️ Feriados Ignorados na Contagem:</span>
                    <ul className="list-disc list-inside text-slate-300">
                      {calcResult.feriadosIgnorados.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Processos Acompanhados DataJud */}
          {activeTab === 'processes' && (
            <div className="space-y-4">
              {/* Form de adição rápida */}
              <form onSubmit={handleAddTrackedProcess} className="p-4 rounded-xl bg-slate-900 border border-white/8 space-y-3">
                <h3 className="text-white font-bold text-xs uppercase tracking-wider">➕ Cadastrar Novo Processo para Acompanhamento</h3>
                {addProcessMessage && (
                  <div className="p-2 rounded bg-emerald-950 text-emerald-300 text-xs font-semibold">
                    {addProcessMessage}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    value={newProcessNumber}
                    onChange={e => setNewProcessNumber(e.target.value)}
                    placeholder="Número do Processo (CNJ)..."
                    className="px-3.5 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    required
                    value={newCliente}
                    onChange={e => setNewCliente(e.target.value)}
                    placeholder="Nome do Cliente / Empresa..."
                    className="px-3.5 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <select
                    value={newTribunal}
                    onChange={e => setNewTribunal(e.target.value)}
                    className="px-3.5 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="TJSP">TJSP (São Paulo)</option>
                    <option value="TJRJ">TJRJ (Rio de Janeiro)</option>
                    <option value="TJMG">TJMG (Minas Gerais)</option>
                    <option value="TRT-2">TRT-2 (Trabalhista SP)</option>
                    <option value="STJ">STJ (Superior Tribunal de Justiça)</option>
                    <option value="STF">STF (Supremo Tribunal Federal)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
                >
                  📡 Ativar Rastreamento no DataJud
                </button>
              </form>

              {/* Lista de Processos */}
              <div className="space-y-3">
                {trackedProcesses.map(prc => (
                  <div key={prc.id} className="p-4 rounded-xl border border-white/8 bg-slate-900/50 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/6 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-purple-300">{prc.processNumber}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-white/6">
                            {prc.tribunal}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5">👤 Cliente: <span className="text-white font-semibold">{prc.clienteNome}</span> · {prc.classeProcessual}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-mono font-bold text-xs">
                          R$ {prc.valorCausaBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-slate-500 text-[10px] block">Valor da Causa</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">📌 Última Movimentação: {prc.ultimaMovimentacao}</p>

                    {prc.proximoPrazoData && (
                      <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-xs flex justify-between items-center">
                        <span className="text-purple-300 font-semibold">
                          ⏱️ Próximo Prazo: {prc.proximoPrazoDescricao}
                        </span>
                        <span className="font-mono font-bold text-emerald-400 bg-black/40 px-2 py-0.5 rounded">
                          {prc.proximoPrazoData}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Alertas & Prevenção de Preclusão */}
          {activeTab === 'alerts' && (
            <div className="max-w-2xl mx-auto space-y-4 text-slate-300 text-sm">
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <span>🛡️ Escudo Anti-Preclusão & Perempção Legis</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Evite a perda de prazos com notificações automatizadas multinível enviadas diretamente para seu celular e e-mail antes do vencimento fatal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-white/8 space-y-2">
                  <h4 className="text-emerald-400 font-bold text-sm">📲 Alertas via WhatsApp</h4>
                  <p className="text-slate-400">
                    Mensagens automáticas HSM enviadas a 5 dias, 3 dias e 24 horas antes do vencimento do prazo CPC.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-white/8 space-y-2">
                  <h4 className="text-purple-400 font-bold text-sm">📅 Sincronização Google Calendar</h4>
                  <p className="text-slate-400">
                    Criação de eventos com lembretes pop-up diretamente na agenda do advogado e da equipe do escritório.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/8 bg-slate-900/60 flex items-center justify-between flex-shrink-0">
          <p className="text-slate-500 text-xs">
            Legis Connect Nível 12 · Gestão Eletrônica de Processos, Diários (DJEN/DataJud) & Calculadora CPC
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
