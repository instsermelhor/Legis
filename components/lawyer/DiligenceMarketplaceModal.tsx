import React, { useState } from 'react';
import {
  DiligenceTask,
  Correspondent,
  DiligenceType,
  MOCK_CORRESPONDENTS,
  INITIAL_DILIGENCES,
  calculateEscrowSplit,
  formatDiligenceTypeLabel,
  formatStatusBadge,
} from '../../lib/diligenceMarketplaceEngine';

interface DiligenceMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiligenceMarketplaceModal: React.FC<DiligenceMarketplaceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'correspondents' | 'create' | 'my_diligences' | 'escrow_info'>('correspondents');
  const [tasks, setTasks] = useState<DiligenceTask[]>(INITIAL_DILIGENCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');

  // Form states para criação
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DiligenceType>('audiencia_presencial');
  const [description, setDescription] = useState('');
  const [comarca, setComarca] = useState('');
  const [tribunalVara, setTribunalVara] = useState('');
  const [processNumber, setProcessNumber] = useState('');
  const [offerValue, setOfferValue] = useState<number>(300);
  const [deadlineDays, setDeadlineDays] = useState<number>(3);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  if (!isOpen) return null;

  const split = calculateEscrowSplit(offerValue);

  // Filtragem de correspondentes
  const filteredCorrespondents = MOCK_CORRESPONDENTS.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.comarcaPrincipal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesState = selectedStateFilter === 'ALL' || c.oabUf === selectedStateFilter;
    return matchesSearch && matchesState;
  });

  const handleCreateDiligence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !comarca || !tribunalVara) return;

    const now = Date.now();
    const newTask: DiligenceTask = {
      id: `dil_${now}`,
      title,
      type,
      description,
      comarca,
      tribunalVara,
      processNumber,
      deadline: new Date(now + 86400000 * deadlineDays).toISOString(),
      escrowValueBrl: split.escrowValue,
      platformFeeBrl: split.platformFee,
      netCorrespondentBrl: split.netCorrespondent,
      status: 'open',
      requesterId: 'user_current',
      requesterName: 'Dr. Advogado Logado',
      requesterOab: 'OAB/SP 450.120',
      createdAt: new Date(now).toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);
    setFormSuccessMessage('✅ Diligência publicada e valor depositado em Custódia Escrow com sucesso!');
    setTimeout(() => {
      setFormSuccessMessage('');
      setActiveTab('my_diligences');
      // Reset form
      setTitle('');
      setDescription('');
      setComarca('');
      setTribunalVara('');
      setProcessNumber('');
    }, 1500);
  };

  const handleSimulateGpsCheckIn = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'checked_in',
            checkInLocation: {
              latitude: -23.55052,
              longitude: -46.633308,
              accuracyMeters: 3.5,
              addressName: 'Fórum João Mendes Jr. - Centro, São Paulo SP',
              timestamp: new Date().toISOString(),
            },
          };
        }
        return t;
      })
    );
  };

  const handleSimulateDelivery = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'delivered',
            deliveredAt: new Date().toISOString(),
            deliveryNotes: 'Relatório de audiência e ata assinada pelo magistrado anexados com sucesso.',
            deliveredDocsUrls: ['https://legisconnect.com.br/docs/ata_audiencia_presencial.pdf'],
          };
        }
        return t;
      })
    );
  };

  const handleApproveAndReleaseEscrow = (taskId: string) => {
    const txId = `tx_escrow_${Date.now()}`;
    const approvedDate = new Date().toISOString();
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'approved',
            approvedAt: approvedDate,
            escrowTransactionId: txId,
          };
        }
        return t;
      })
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Marketplace de Correspondentes Jurídicos & Diligências">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900 to-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg">
              <span className="text-xl">📍</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-lg">Marketplace de Correspondentes Jurídicos</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  NÍVEL 11
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Geo-Localização GPS · Custódia Escrow Protegida · Correspondentes Validados OAB
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
            { id: 'correspondents', label: '📍 Buscar Correspondentes', count: filteredCorrespondents.length },
            { id: 'create', label: '➕ Publicar Nova Diligência' },
            { id: 'my_diligences', label: `💼 Diligências (${tasks.length})` },
            { id: 'escrow_info', label: '🛡️ Garantia Escrow OAB' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/4'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-indigo-500/20 text-indigo-300">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0f1117]">
          
          {/* TAB 1: Correspondentes */}
          {activeTab === 'correspondents' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nome, comarca (ex: SP, RJ, DF) ou especialidade..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute left-3 top-3 text-slate-500 text-sm">🔍</span>
                </div>
                <select
                  value={selectedStateFilter}
                  onChange={e => setSelectedStateFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Todos os Estados</option>
                  <option value="SP">São Paulo (SP)</option>
                  <option value="RJ">Rio de Janeiro (RJ)</option>
                  <option value="MG">Minas Gerais (MG)</option>
                  <option value="DF">Distrito Federal (DF)</option>
                </select>
              </div>

              {/* Correspondents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCorrespondents.map(cor => (
                  <div key={cor.id} className="p-4 rounded-xl border border-white/8 bg-slate-900/50 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={cor.avatarUrl}
                        alt={cor.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold text-sm truncate">{cor.name}</h3>
                          {cor.isVerifiedOab && (
                            <span className="text-blue-400 text-xs" title="OAB Validada pelo Cadastro Nacional de Advogados (CNA)">
                              ✓ OAB
                            </span>
                          )}
                        </div>
                        <p className="text-indigo-400 text-xs font-semibold">{cor.oabNumber}</p>
                        <p className="text-slate-400 text-xs truncate mt-0.5">🏛️ {cor.comarcaPrincipal}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/6 text-center">
                      <div>
                        <span className="text-amber-400 font-bold text-xs flex items-center justify-center gap-1">
                          ★ {cor.rating.toFixed(2)}
                        </span>
                        <span className="text-slate-500 text-[10px] block">Avaliação</span>
                      </div>
                      <div>
                        <span className="text-white font-bold text-xs">{cor.totalDiligencias}</span>
                        <span className="text-slate-500 text-[10px] block">Diligências</span>
                      </div>
                      <div>
                        <span className="text-emerald-400 font-bold text-xs">{cor.taxaSucessoPct}%</span>
                        <span className="text-slate-500 text-[10px] block">Sucesso</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {cor.specialties.map((spec, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-white/6">
                          {spec}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setComarca(cor.comarcaPrincipal);
                        setActiveTab('create');
                      }}
                      className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>📩 Solicitar Diligência Direta</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Publicar Nova Diligência */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateDiligence} className="max-w-2xl mx-auto space-y-4">
              {formSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm font-semibold animate-pulse">
                  {formSuccessMessage}
                </div>
              )}

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Título da Diligência *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Acompanhamento de Audiência de Instrução e Julgamento"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Tipo de Diligência</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as DiligenceType)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="audiencia_presencial">🏛️ Audiência Presencial</option>
                    <option value="audiencia_virtual">💻 Audiência Virtual</option>
                    <option value="copia_processo">📁 Cópia de Processo Físico</option>
                    <option value="protocolo_presencial">📥 Protocolo Físico</option>
                    <option value="despacho_juiz">⚖️ Despacho com Juiz/Relator</option>
                    <option value="sustentacao_oral">🗣️ Sustentação Oral</option>
                    <option value="diligencia_policial">🛡️ Acompanhamento Policial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Prazo Limite (Dias)</label>
                  <select
                    value={deadlineDays}
                    onChange={e => setDeadlineDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>⚡ 24 Horas (Urgente)</option>
                    <option value={2}>⏱️ 48 Horas</option>
                    <option value={3}>📅 3 Dias Úteis</option>
                    <option value={5}>📅 5 Dias Úteis</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Comarca / Cidade *</label>
                  <input
                    type="text"
                    required
                    value={comarca}
                    onChange={e => setComarca(e.target.value)}
                    placeholder="Ex: São Paulo - SP"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Tribunal / Vara *</label>
                  <input
                    type="text"
                    required
                    value={tribunalVara}
                    onChange={e => setTribunalVara(e.target.value)}
                    placeholder="Ex: 4ª Vara Cível - Foro Central"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Número do Processo (Opcional)</label>
                <input
                  type="text"
                  value={processNumber}
                  onChange={e => setProcessNumber(e.target.value)}
                  placeholder="Ex: 1048291-33.2025.8.26.0100"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Instruções / Detalhes da Diligência</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descreva detalhes específicos: testemunhas a ouvir, teses a sustentar ou documentos a protocolar..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Escrow Value Calculator */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/30 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold text-xs">Valor Oferecido (R$):</label>
                  <input
                    type="number"
                    min={100}
                    step={50}
                    value={offerValue}
                    onChange={e => setOfferValue(Number(e.target.value))}
                    className="w-32 px-3 py-1.5 bg-slate-800 border border-indigo-500/50 rounded-lg text-right font-mono font-bold text-emerald-400 text-sm"
                  />
                </div>

                <div className="border-t border-white/6 pt-2 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Taxa da Plataforma (10%):</span>
                    <span className="font-mono">R$ {split.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Líquido para o Correspondente:</span>
                    <span className="font-mono text-emerald-400 font-semibold">R$ {split.netCorrespondent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-indigo-300 font-bold pt-1 border-t border-white/6">
                    <span>Depósito de Custódia (Escrow):</span>
                    <span className="font-mono text-indigo-400">R$ {split.escrowValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg transition-all"
              >
                🔒 Depositar R$ {offerValue.toFixed(2)} em Escrow & Publicar Diligência
              </button>
            </form>
          )}

          {/* TAB 3: Minhas Diligências */}
          {activeTab === 'my_diligences' && (
            <div className="space-y-4">
              {tasks.map(task => {
                const typeInfo = formatDiligenceTypeLabel(task.type);
                const statusInfo = formatStatusBadge(task.status);

                return (
                  <div key={task.id} className="p-4 rounded-xl border border-white/8 bg-slate-900/40 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/6 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{typeInfo.icon}</span>
                        <div>
                          <h3 className="text-white font-bold text-sm">{task.title}</h3>
                          <p className="text-slate-400 text-xs">
                            {task.comarca} · {task.tribunalVara}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.badgeColor}`}>
                          {statusInfo.label}
                        </span>
                        <span className="font-mono text-emerald-400 font-bold text-sm">
                          R$ {task.escrowValueBrl.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-xs">{task.description}</p>

                    {/* GPS Check-in Details */}
                    {task.checkInLocation && (
                      <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                          <span>📍 Check-in GPS Validado:</span>
                          <span className="font-mono text-emerald-400">
                            Lat {task.checkInLocation.latitude.toFixed(5)}, Lon {task.checkInLocation.longitude.toFixed(5)}
                          </span>
                        </div>
                        <p className="text-slate-300">{task.checkInLocation.addressName}</p>
                        <p className="text-slate-500 text-[10px]">
                          Precisão: {task.checkInLocation.accuracyMeters}m · Horário: {new Date(task.checkInLocation.timestamp).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    )}

                    {/* Delivered Files & Notes */}
                    {task.deliveryNotes && (
                      <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs space-y-1">
                        <p className="text-amber-300 font-semibold">📦 Relatório do Correspondente:</p>
                        <p className="text-slate-200">{task.deliveryNotes}</p>
                        {task.deliveredDocsUrls?.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline block text-[11px]">
                            📄 Download Documento de Entrega #{idx + 1}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons Workflow */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/6">
                      {task.status === 'accepted' && (
                        <button
                          onClick={() => handleSimulateGpsCheckIn(task.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>📍 Simular Check-in GPS no Tribunal</span>
                        </button>
                      )}

                      {task.status === 'checked_in' && (
                        <button
                          onClick={() => handleSimulateDelivery(task.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>📦 Simular Envio de Relatório & Atas</span>
                        </button>
                      )}

                      {task.status === 'delivered' && (
                        <button
                          onClick={() => handleApproveAndReleaseEscrow(task.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-md animate-bounce"
                        >
                          <span>✅ Aprovar & Liberar R$ {task.escrowValueBrl.toFixed(2)} (Escrow)</span>
                        </button>
                      )}

                      {task.status === 'approved' && (
                        <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <span>🎉 Transação concluída com sucesso! ID Escrow: <code className="text-slate-300 font-mono">{task.escrowTransactionId}</code></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: Garantia Escrow OAB */}
          {activeTab === 'escrow_info' && (
            <div className="max-w-2xl mx-auto space-y-4 text-slate-300 text-sm">
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <span>🛡️ Custódia Ética Escrow (Provimento 196/2020 OAB)</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  O sistema de Escrow do Legis Connect assegura total proteção financeira tanto para o contratante quanto para o correspondente jurídico contratado:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-white/8 space-y-2">
                  <h4 className="text-emerald-400 font-bold text-sm">🔒 Para o Contratante</h4>
                  <p className="text-slate-400">
                    O valor acordado fica retido em conta de custódia segura e só é repassado ao correspondente mediante a aprovação expressa do relatório de entrega.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-white/8 space-y-2">
                  <h4 className="text-indigo-400 font-bold text-sm">💼 Para o Correspondente</h4>
                  <p className="text-slate-400">
                    Garantia absoluta de recebimento antes de deslocar ao fórum. Não há risco de calote de honorários de sucumbência ou correspondência.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/8 bg-slate-900/60 flex items-center justify-between flex-shrink-0">
          <p className="text-slate-500 text-xs">
            Legis Connect Nível 11 · Marketplace de Correspondentes com Validação GPS & Escrow
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
