/**
 * InternCases.tsx
 * Meus Casos — Painel do Bacharelando
 * Sub-tabs: Casos Delegados | Minutas & Peças | Diário de Bordo
 * Repositório de minutas com status (Rascunho → Revisão → Aprovado)
 * Diário de bordo com registro diário de atividades.
 */
import React, { useState, useMemo } from 'react';
import type { Case } from '../../../types';
import type { Lawyer } from '../../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type MinutaStatus = 'rascunho' | 'revisao' | 'aprovado' | 'protocolado';
type MinutaTipo = 'peticao_inicial' | 'contestacao' | 'recurso' | 'manifestacao' | 'parecer' | 'contrato' | 'outro';

interface Minuta {
  id: string;
  caseId?: string;
  caseTitle?: string;
  titulo: string;
  tipo: MinutaTipo;
  status: MinutaStatus;
  criadoEm: string;
  atualizadoEm: string;
  observacoes?: string;
  feedbackAdvogado?: string;
  wordCount?: number;
}

interface DiarioEntry {
  id: string;
  data: string;
  horasTrabalho: number;
  atividades: string;
  aprendizados?: string;
  advogadoPresente: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_MINUTAS: Minuta[] = [
  {
    id: 'm1', titulo: 'Petição Inicial — Indenização por Dano Moral', tipo: 'peticao_inicial',
    status: 'aprovado', criadoEm: '2024-11-20', atualizadoEm: '2024-11-25',
    caseTitle: 'Silva vs. Empresa XYZ', wordCount: 2840,
    feedbackAdvogado: 'Excelente fundamentação. Aprovado para protocolo. Corrigir apenas a data da citação.',
  },
  {
    id: 'm2', titulo: 'Contestação — Ação Trabalhista (Horas Extras)', tipo: 'contestacao',
    status: 'revisao', criadoEm: '2024-12-01', atualizadoEm: '2024-12-03',
    caseTitle: 'Rodrigues vs. Construtora', wordCount: 1950,
    observacoes: 'Aguardando análise do Dr. Carlos sobre os artigos da CLT citados.',
  },
  {
    id: 'm3', titulo: 'Agravo de Instrumento — Liminar Negada', tipo: 'recurso',
    status: 'rascunho', criadoEm: '2024-12-05', atualizadoEm: '2024-12-05',
    caseTitle: 'Santos vs. Banco Nacional', wordCount: 850,
    observacoes: 'Em elaboração. Pesquisar jurisprudência do STJ.',
  },
  {
    id: 'm4', titulo: 'Parecer Jurídico — Rescisão Contratual', tipo: 'parecer',
    status: 'protocolado', criadoEm: '2024-11-10', atualizadoEm: '2024-11-15',
    caseTitle: 'Caso NPJ #045', wordCount: 3200,
    feedbackAdvogado: 'Protocolo nº 0012345-67.2024.8.26.0100.',
  },
];

const MOCK_DIARIO: DiarioEntry[] = [
  { id: 'd1', data: '2024-12-05', horasTrabalho: 4, atividades: 'Redação do agravo de instrumento. Pesquisa de jurisprudência no STJ sobre liminares em ações possessórias. Revisão de peças anteriores.', aprendizados: 'Aprendi a estruturar o agravo de instrumento com base na decisão agravada.', advogadoPresente: true },
  { id: 'd2', data: '2024-12-04', horasTrabalho: 6, atividades: 'Acompanhamento de audiência de instrução no TRT. Triagem de novos clientes do NPJ. Organização de documentos do caso Rodrigues.', aprendizados: 'Observei como o advogado conduz os depoimentos e formula perguntas de forma estratégica.', advogadoPresente: true },
  { id: 'd3', data: '2024-12-03', horasTrabalho: 4, atividades: 'Revisão da contestação com Dr. Carlos. Correção dos fundamentos sobre horas extras. Atualização do dossiê do caso.', advogadoPresente: false },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const MINUTA_STATUS_MAP: Record<MinutaStatus, { label: string; color: string; icon: string; step: number }> = {
  rascunho:    { label: 'Rascunho',          color: 'bg-gray-100 text-gray-600 border-gray-200',     icon: '✏️', step: 1 },
  revisao:     { label: 'Em Revisão',        color: 'bg-amber-100 text-amber-700 border-amber-200',  icon: '🔍', step: 2 },
  aprovado:    { label: 'Aprovado',          color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '✅', step: 3 },
  protocolado: { label: 'Protocolado',       color: 'bg-blue-100 text-blue-700 border-blue-200',    icon: '🏛️', step: 4 },
};

const MINUTA_TIPO_MAP: Record<MinutaTipo, string> = {
  peticao_inicial: 'Petição Inicial',
  contestacao:     'Contestação',
  recurso:         'Recurso',
  manifestacao:    'Manifestação',
  parecer:         'Parecer Jurídico',
  contrato:        'Contrato',
  outro:           'Outro',
};

// ─── Add Minuta Modal ─────────────────────────────────────────────────────────

interface AddMinutaModalProps {
  cases: Case[];
  onAdd: (m: Omit<Minuta, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  onClose: () => void;
}

const AddMinutaModal: React.FC<AddMinutaModalProps> = ({ cases, onAdd, onClose }) => {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<MinutaTipo>('peticao_inicial');
  const [caseId, setCaseId] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    const selectedCase = cases.find(c => c.id === caseId);
    onAdd({ titulo, tipo, status: 'rascunho', caseId, caseTitle: selectedCase?.title, observacoes, wordCount: 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1A1730] rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">📄 Nova Minuta / Peça</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Título da Peça *</label>
              <input value={titulo} onChange={e => setTitulo(e.target.value)} required
                placeholder="Ex: Petição Inicial — Dano Moral"
                className="w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-[#12102A] focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Tipo de Peça</label>
              <select value={tipo} onChange={e => setTipo(e.target.value as MinutaTipo)}
                className="w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]">
                {Object.entries(MINUTA_TIPO_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {cases.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Caso Vinculado</label>
                <select value={caseId} onChange={e => setCaseId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]">
                  <option value="">Nenhum caso específico</option>
                  {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Observações</label>
              <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={3}
                placeholder="Notas sobre esta peça, fontes a pesquisar, etc."
                className="w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-[#12102A] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-black/20 rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">+ Criar Peça</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Add Diário Entry Modal ───────────────────────────────────────────────────

interface AddDiarioModalProps {
  onAdd: (entry: Omit<DiarioEntry, 'id'>) => void;
  onClose: () => void;
}

const AddDiarioModal: React.FC<AddDiarioModalProps> = ({ onAdd, onClose }) => {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [horas, setHoras] = useState('4');
  const [atividades, setAtividades] = useState('');
  const [aprendizados, setAprendizados] = useState('');
  const [advogadoPresente, setAdvogadoPresente] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!atividades.trim()) return;
    onAdd({ data, horasTrabalho: Number(horas), atividades, aprendizados, advogadoPresente });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1A1730] rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">📓 Novo Registro — Diário de Bordo</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Data</label>
                <input type="date" value={data} onChange={e => setData(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Horas Trabalhadas</label>
                <input type="number" min="1" max="12" value={horas} onChange={e => setHoras(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Atividades Realizadas *</label>
              <textarea value={atividades} onChange={e => setAtividades(e.target.value)} rows={4} required
                placeholder="Descreva as atividades realizadas hoje no estágio..."
                className="w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-[#12102A] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Aprendizados do Dia</label>
              <textarea value={aprendizados} onChange={e => setAprendizados(e.target.value)} rows={2}
                placeholder="O que você aprendeu hoje? Conceitos, práticas, jurisprudências..."
                className="w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-[#12102A] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={advogadoPresente} onChange={e => setAdvogadoPresente(e.target.checked)}
                className="w-4 h-4 accent-indigo-600" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Advogado supervisor presente</span>
            </label>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-black/20 rounded-xl">Cancelar</button>
              <button type="submit" className="flex-1 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">✓ Registrar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

type CasesSubTab = 'casos' | 'minutas' | 'diario';

interface InternCasesProps {
  delegatedCases: Case[];
  supervisorLawyer: Lawyer | null;
  internId: number | string;
  onOpenSupervisor: () => void;
}

export const InternCases: React.FC<InternCasesProps> = ({
  delegatedCases, supervisorLawyer, internId, onOpenSupervisor,
}) => {
  const [subTab, setSubTab] = useState<CasesSubTab>('casos');
  const [minutas, setMinutas] = useState<Minuta[]>(MOCK_MINUTAS);
  const [diario, setDiario] = useState<DiarioEntry[]>(MOCK_DIARIO);
  const [showAddMinuta, setShowAddMinuta] = useState(false);
  const [showAddDiario, setShowAddDiario] = useState(false);
  const [minutaFilter, setMinutaFilter] = useState<MinutaStatus | 'todos'>('todos');
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const filteredMinutas = useMemo(() =>
    minutaFilter === 'todos' ? minutas : minutas.filter(m => m.status === minutaFilter),
    [minutas, minutaFilter]
  );

  const addMinuta = (m: Omit<Minuta, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const today = new Date().toISOString().split('T')[0];
    setMinutas(prev => [{ ...m, id: `m${Date.now()}`, criadoEm: today, atualizadoEm: today }, ...prev]);
  };

  const addDiario = (entry: Omit<DiarioEntry, 'id'>) => {
    setDiario(prev => [{ ...entry, id: `d${Date.now()}` }, ...prev].sort((a, b) => b.data.localeCompare(a.data)));
  };

  const totalHorasDiario = diario.reduce((sum, e) => sum + e.horasTrabalho, 0);

  const subTabBtn = (id: CasesSubTab, label: string, badge?: number) => (
    <button
      onClick={() => setSubTab(id)}
      className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${subTab === id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-black/30'}`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${subTab === id ? 'bg-white/30 text-white' : 'bg-indigo-100 text-indigo-700'}`}>{badge}</span>
      )}
    </button>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        {subTabBtn('casos', '⚖️ Casos Delegados', delegatedCases.length)}
        {subTabBtn('minutas', '📄 Minutas & Peças', minutas.length)}
        {subTabBtn('diario', '📓 Diário de Bordo', diario.length)}
      </div>

      {/* ── Casos Delegados ── */}
      {subTab === 'casos' && (
        <div className="space-y-4">
          {supervisorLawyer && (
            <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-xl p-3.5">
              <img src={supervisorLawyer.photoUrl} alt={supervisorLawyer.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-200 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Dr(a). {supervisorLawyer.name}</p>
                <p className="text-[10px] text-indigo-500">OAB {supervisorLawyer.oab}</p>
              </div>
              <button onClick={onOpenSupervisor} className="shrink-0 px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Ver Perfil
              </button>
            </div>
          )}

          {delegatedCases.length > 0 ? (
            <div className="space-y-3">
              {delegatedCases.map(c => (
                <div key={c.id}
                  className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                  onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-lg shrink-0">⚖️</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{c.title}</p>
                      <p className="text-xs text-gray-400 truncate">Cliente: {c.clientName} · {c.area}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.status === 'Ativo' ? 'bg-green-50 text-green-700 border-green-200' : c.status === 'Concluído' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {c.status}
                      </span>
                      <span className="text-gray-400 text-xs">{expandedCase === c.id ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {expandedCase === c.id && (
                    <div className="border-t border-gray-100 dark:border-[#2A2545] px-4 py-3 bg-gray-50 dark:bg-black/10 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Área', value: c.area || '—' },
                          { label: 'Tipo', value: c.caseType || '—' },
                          { label: 'Grupo', value: c.group || '—' },
                          { label: 'Nº do Caso', value: c.id },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">{label}</p>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{value}</p>
                          </div>
                        ))}
                      </div>
                      {c.stages && c.stages.length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Fases do Processo</p>
                          <div className="flex gap-1 flex-wrap">
                            {c.stages.map((stage, i) => (
                              <span key={i} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${stage.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : stage.status === 'current' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                                {stage.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-black/10 border-2 border-dashed border-gray-200 dark:border-[#2A2545] rounded-2xl p-10 text-center">
              <p className="text-4xl mb-3">📂</p>
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-1">Nenhum caso delegado ainda</h4>
              <p className="text-xs text-gray-500">Quando seu advogado supervisor atribuir casos, eles aparecerão aqui.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Minutas & Peças ── */}
      {subTab === 'minutas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(['todos', 'rascunho', 'revisao', 'aprovado', 'protocolado'] as const).map(f => {
                const meta = f !== 'todos' ? MINUTA_STATUS_MAP[f] : null;
                return (
                  <button key={f} onClick={() => setMinutaFilter(f)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${minutaFilter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-black/20 text-gray-500 dark:text-gray-400'}`}>
                    {meta ? `${meta.icon} ${meta.label}` : 'Todas'}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowAddMinuta(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
              + Nova Peça
            </button>
          </div>

          {/* Pipeline de status */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-black/10 rounded-xl p-3">
            {(['rascunho', 'revisao', 'aprovado', 'protocolado'] as MinutaStatus[]).map((s, i) => {
              const meta = MINUTA_STATUS_MAP[s];
              const count = minutas.filter(m => m.status === s).length;
              return (
                <React.Fragment key={s}>
                  <div className="flex-1 text-center">
                    <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm mb-1 ${count > 0 ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-black/20'}`}>
                      {meta.icon}
                    </div>
                    <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400">{meta.label}</p>
                    <p className={`text-sm font-black ${count > 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-700'}`}>{count}</p>
                  </div>
                  {i < 3 && <div className="w-6 h-px bg-gray-300 dark:bg-gray-700 shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>

          <div className="space-y-3">
            {filteredMinutas.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">📄</p>
                <p className="text-sm">Nenhuma peça neste status.</p>
                <button onClick={() => setShowAddMinuta(true)} className="mt-3 px-4 py-2 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50">
                  + Criar nova peça
                </button>
              </div>
            ) : filteredMinutas.map(m => {
              const statusMeta = MINUTA_STATUS_MAP[m.status];
              return (
                <div key={m.id} className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${statusMeta.color}`}>{statusMeta.icon} {statusMeta.label}</span>
                        <span className="text-[9px] text-gray-400 bg-gray-100 dark:bg-black/20 px-2 py-0.5 rounded-full">{MINUTA_TIPO_MAP[m.tipo]}</span>
                        {m.wordCount && m.wordCount > 0 && <span className="text-[9px] text-gray-400">~{m.wordCount.toLocaleString()} palavras</span>}
                      </div>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">{m.titulo}</p>
                      {m.caseTitle && <p className="text-xs text-gray-400 mt-0.5">📁 {m.caseTitle}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-gray-400">Atualizado</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{new Date(m.atualizadoEm).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  {m.observacoes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-black/10 rounded-xl px-3 py-2 italic">{m.observacoes}</p>
                  )}
                  {m.feedbackAdvogado && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl px-3 py-2">
                      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase mb-0.5">Feedback do Advogado</p>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300">{m.feedbackAdvogado}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Diário de Bordo ── */}
      {subTab === 'diario' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">Diário de Bordo do Estagiário</h4>
              <p className="text-xs text-gray-400 mt-0.5">{diario.length} registro(s) · {totalHorasDiario}h totais registradas</p>
            </div>
            <button onClick={() => setShowAddDiario(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
              + Novo Registro
            </button>
          </div>

          {diario.length === 0 ? (
            <div className="bg-gray-50 dark:bg-black/10 border-2 border-dashed border-gray-200 dark:border-[#2A2545] rounded-2xl p-10 text-center">
              <p className="text-4xl mb-2">📓</p>
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-1">Nenhum registro ainda</h4>
              <p className="text-xs text-gray-500 mb-3">Registre suas atividades diárias de estágio para comprovação.</p>
              <button onClick={() => setShowAddDiario(true)} className="px-4 py-2 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50">
                + Criar primeiro registro
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {diario.map(entry => (
                <div key={entry.id} className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-lg shrink-0">📓</div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">
                          {new Date(entry.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">⏱️ {entry.horasTrabalho}h trabalhadas</span>
                          {entry.advogadoPresente && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">Supervisor presente</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setDiario(prev => prev.filter(e => e.id !== entry.id))}
                      className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors text-xs"
                      title="Excluir registro"
                    >🗑</button>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Atividades Realizadas</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{entry.atividades}</p>
                  </div>
                  {entry.aprendizados && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-bold mb-1">💡 Aprendizados</p>
                      <p className="text-xs text-indigo-800 dark:text-indigo-300">{entry.aprendizados}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddMinuta && (
        <AddMinutaModal cases={delegatedCases} onAdd={addMinuta} onClose={() => setShowAddMinuta(false)} />
      )}
      {showAddDiario && (
        <AddDiarioModal onAdd={addDiario} onClose={() => setShowAddDiario(false)} />
      )}
    </div>
  );
};
