/**
 * CaseDigitalFolder.tsx
 * Pasta Digital do Caso — Fase 3
 * Timeline de andamentos, upload de documentos (simulado),
 * link direto para tribunal, sub-abas por área.
 */
import React, { useState, useMemo } from 'react';
import type { Case } from '../../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
type AndamentoType = 'audiencia' | 'peticao' | 'sentenca' | 'recurso' | 'doc' | 'prazo' | 'publicacao' | 'outro';

interface Andamento {
  id: string;
  caseId: string;
  date: string;
  time: string;
  title: string;
  description: string;
  type: AndamentoType;
  author: string;
  important: boolean;
}

interface DocUpload {
  id: string;
  caseId: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  category: 'inicial' | 'procuracao' | 'contrato' | 'prova' | 'sentenca' | 'outro';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ANDAMENTOS: Andamento[] = [
  {
    id: 'a1', caseId: 'case1', date: '2024-09-10', time: '14:32',
    title: 'Audiência de Conciliação Realizada',
    description: 'Audiência de conciliação realizada perante o MM. Juiz. As partes não chegaram a acordo. Próxima fase: contestação da parte ré.',
    type: 'audiencia', author: 'Dr. Carlos Andrade', important: true
  },
  {
    id: 'a2', caseId: 'case1', date: '2024-08-28', time: '09:15',
    title: 'Petição Inicial Protocolada',
    description: 'Petição inicial protocolada no TJSP — 3ª Vara Cível de São Paulo. Número do processo: 1005234-12.2024.8.26.0100.',
    type: 'peticao', author: 'Dr. Carlos Andrade', important: true
  },
  {
    id: 'a3', caseId: 'case1', date: '2024-08-20', time: '16:00',
    title: 'Documentação Recebida do Cliente',
    description: 'Recebidos: certidão de óbito, certidão de casamento, RG e CPF dos herdeiros. Documentação completa para início do processo de inventário.',
    type: 'doc', author: 'Ana Secretária', important: false
  },
  {
    id: 'a4', caseId: 'case2', date: '2024-09-12', time: '11:00',
    title: 'Fase de Instrução — Depoimentos',
    description: 'Realizado depoimento do reclamante e da primeira testemunha. Segunda testemunha ausente — designada nova data.',
    type: 'audiencia', author: 'Dr. Carlos Andrade', important: true
  },
  {
    id: 'a5', caseId: 'case2', date: '2024-07-15', time: '08:30',
    title: 'Publicação de Intimação — Prazo 5 dias úteis',
    description: 'Publicada intimação no DJe para apresentação de documentos complementares. Prazo: 5 dias úteis a contar desta data.',
    type: 'prazo', author: 'Sistema PJe', important: true
  },
];

const MOCK_DOCS: DocUpload[] = [
  { id: 'd1', caseId: 'case1', name: 'Petição_Inicial_Inventário.pdf', type: 'PDF', size: '2.3 MB', uploadedAt: '2024-08-28', uploadedBy: 'Dr. Carlos Andrade', category: 'inicial' },
  { id: 'd2', caseId: 'case1', name: 'Procuração_Inventário.pdf', type: 'PDF', size: '0.8 MB', uploadedAt: '2024-08-20', uploadedBy: 'Ana Secretária', category: 'procuracao' },
  { id: 'd3', caseId: 'case1', name: 'Certidão_Óbito.pdf', type: 'PDF', size: '0.4 MB', uploadedAt: '2024-08-20', uploadedBy: 'Ana Secretária', category: 'prova' },
  { id: 'd4', caseId: 'case2', name: 'CTPS_Reclamante.jpg', type: 'Imagem', size: '1.1 MB', uploadedAt: '2024-07-10', uploadedBy: 'Dr. Carlos Andrade', category: 'prova' },
  { id: 'd5', caseId: 'case2', name: 'Contrato_Trabalho.pdf', type: 'PDF', size: '3.2 MB', uploadedAt: '2024-07-10', uploadedBy: 'Ana Secretária', category: 'contrato' },
];

// ─── Tribunal Links ───────────────────────────────────────────────────────────
const TRIBUNAL_LINKS: Record<string, { name: string; url: string; icon: string }> = {
  Civil:       { name: 'TJSP — e-SAJ',  url: 'https://esaj.tjsp.jus.br', icon: '⚖️' },
  Trabalhista: { name: 'PJe — TRT',     url: 'https://pje.trt15.jus.br', icon: '👷' },
  Penal:       { name: 'TJSP — SAJ',    url: 'https://esaj.tjsp.jus.br', icon: '🔒' },
  Outro:       { name: 'Projudi',        url: 'https://projudi.tjgo.jus.br', icon: '🏛️' },
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ANDAMENTO_TYPE_MAP: Record<AndamentoType, { icon: string; color: string; bg: string }> = {
  audiencia:   { icon: '⚖️', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-900/40' },
  peticao:     { icon: '📄', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30 border-violet-200 dark:border-violet-900/40' },
  sentenca:    { icon: '🏛️', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-900/40' },
  recurso:     { icon: '↩️', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-900/40' },
  doc:         { icon: '📎', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/30 border-teal-200 dark:border-teal-900/40' },
  prazo:       { icon: '⏰', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-900/40' },
  publicacao:  { icon: '📰', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-900/40' },
  outro:       { icon: '📌', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700/40' },
};

const DOC_CATEGORY_MAP = {
  inicial:    { label: 'Petição Inicial', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  procuracao: { label: 'Procuração', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  contrato:   { label: 'Contrato', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  prova:      { label: 'Prova/Documento', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  sentenca:   { label: 'Sentença/Decisão', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  outro:      { label: 'Outro', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
};

// ─── Add Andamento Modal ──────────────────────────────────────────────────────
interface AddAndamentoModalProps {
  caseId: string;
  onAdd: (a: Omit<Andamento, 'id'>) => void;
  onClose: () => void;
}

const AddAndamentoModal: React.FC<AddAndamentoModalProps> = ({ caseId, onAdd, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AndamentoType>('outro');
  const [important, setImportant] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ caseId, date, time, title, description, type, author: 'Dr. Advogado', important });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1A1730] rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">📝 Novo Andamento</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Data</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Hora</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Tipo do Andamento</label>
              <select value={type} onChange={e => setType(e.target.value as AndamentoType)}
                className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]">
                {Object.entries(ANDAMENTO_TYPE_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {k.charAt(0).toUpperCase() + k.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Título *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required
                placeholder="Ex: Audiência de instrução realizada"
                className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A] focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Descrição</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder="Detalhes do andamento..."
                className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A] focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={important} onChange={e => setImportant(e.target.checked)}
                className="w-4 h-4 accent-violet-600" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Marcar como evento importante</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-black/20 rounded-xl hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button type="submit" className="flex-1 py-2.5 text-sm font-bold text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors">
                Registrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
type FolderTab = 'andamentos' | 'documentos' | 'tribunal';

interface CaseDigitalFolderProps {
  selectedCase: Case;
  onBack: () => void;
}

export const CaseDigitalFolder: React.FC<CaseDigitalFolderProps> = ({ selectedCase, onBack }) => {
  const [tab, setTab] = useState<FolderTab>('andamentos');
  const [andamentos, setAndamentos] = useState<Andamento[]>(() => {
    try {
      const saved = localStorage.getItem(`legis_andamentos_${selectedCase.id}`);
      return saved ? JSON.parse(saved) : MOCK_ANDAMENTOS.filter(a => a.caseId === selectedCase.id);
    } catch { return MOCK_ANDAMENTOS.filter(a => a.caseId === selectedCase.id); }
  });
  const [docs, setDocs] = useState<DocUpload[]>(() => {
    try {
      const saved = localStorage.getItem(`legis_docs_${selectedCase.id}`);
      return saved ? JSON.parse(saved) : MOCK_DOCS.filter(d => d.caseId === selectedCase.id);
    } catch { return MOCK_DOCS.filter(d => d.caseId === selectedCase.id); }
  });
  const [showAddAndamento, setShowAddAndamento] = useState(false);
  const [docFilter, setDocFilter] = useState<string>('all');

  const tribunalInfo = TRIBUNAL_LINKS[selectedCase.group || 'Outro'];

  const saveAndamentos = (next: Andamento[]) => {
    setAndamentos(next);
    localStorage.setItem(`legis_andamentos_${selectedCase.id}`, JSON.stringify(next));
  };

  const handleAddAndamento = (a: Omit<Andamento, 'id'>) => {
    const next = [{ ...a, id: `a${Date.now()}` }, ...andamentos].sort((x, y) => y.date.localeCompare(x.date));
    saveAndamentos(next);
  };

  const handleDeleteAndamento = (id: string) => {
    saveAndamentos(andamentos.filter(a => a.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const newDocs: DocUpload[] = files.map((f: File) => ({
      id: `d${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      caseId: selectedCase.id,
      name: f.name,
      type: f.type.includes('pdf') ? 'PDF' : f.type.includes('image') ? 'Imagem' : 'Arquivo',
      size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'Advogado Titular',
      category: 'outro' as const,
    }));
    const next = [...newDocs, ...docs];
    setDocs(next);
    localStorage.setItem(`legis_docs_${selectedCase.id}`, JSON.stringify(next));
    e.target.value = '';
  };

  const handleDeleteDoc = (id: string) => {
    const next = docs.filter(d => d.id !== id);
    setDocs(next);
    localStorage.setItem(`legis_docs_${selectedCase.id}`, JSON.stringify(next));
  };

  const filteredDocs = useMemo(() =>
    docFilter === 'all' ? docs : docs.filter(d => d.category === docFilter),
    [docs, docFilter]
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back + Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="mt-1 shrink-0 p-1.5 rounded-lg bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-black/30 transition-colors text-sm"
        >
          ← Voltar
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate">📂 {selectedCase.title}</h2>
            <span className="px-2 py-0.5 text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 rounded-full">
              {selectedCase.status}
            </span>
            {selectedCase.group && (
              <span className="px-2 py-0.5 text-xs font-bold bg-gray-100 text-gray-600 dark:bg-black/20 dark:text-gray-400 rounded-full">
                {selectedCase.group}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Cliente: <strong className="text-gray-600 dark:text-gray-300">{selectedCase.clientName}</strong>
            {selectedCase.clientCpf && <> · CPF: <span className="font-mono">{selectedCase.clientCpf}</span></>}
            <> · Nº: <span className="font-mono">{selectedCase.id}</span></>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-[#2A2545]">
        {([
          { id: 'andamentos', label: '📜 Andamentos', count: andamentos.length },
          { id: 'documentos', label: '📎 Documentos', count: docs.length },
          { id: 'tribunal', label: '🏛️ Tribunal', count: null },
        ] as { id: FolderTab; label: string; count: number | null }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-all flex items-center gap-1.5 ${
              tab === t.id
                ? 'border-violet-600 text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-violet-600 hover:bg-gray-50 dark:hover:bg-[#1A1730]'
            }`}
          >
            {t.label}
            {t.count !== null && (
              <span className="px-1.5 py-0.5 text-[9px] font-black bg-violet-600 text-white rounded-full">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Andamentos Tab ── */}
      {tab === 'andamentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Diário de Bordo do Processo</h3>
            <button
              onClick={() => setShowAddAndamento(true)}
              className="px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 transition-colors"
            >
              + Registrar Andamento
            </button>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 dark:bg-[#2A2545]" />
            <div className="space-y-4">
              {andamentos.length === 0 && (
                <div className="text-center py-10 text-gray-400 dark:text-gray-600">
                  <span className="text-4xl block mb-2">📜</span>
                  <p className="text-sm">Nenhum andamento registrado. Clique em "Registrar Andamento".</p>
                </div>
              )}
              {andamentos.map(a => {
                const tInfo = ANDAMENTO_TYPE_MAP[a.type];
                return (
                  <div key={a.id} className="flex gap-4 relative">
                    {/* Dot */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 z-10 border-2 border-white dark:border-[#1A1730] shadow-sm ${tInfo.bg}`}>
                      {tInfo.icon}
                    </div>
                    {/* Content */}
                    <div className={`flex-1 min-w-0 bg-white dark:bg-[#1A1730] border rounded-xl p-4 shadow-sm ${a.important ? 'border-violet-200 dark:border-violet-900/40' : 'border-gray-200 dark:border-[#2A2545]'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-black text-gray-800 dark:text-white">{a.title}</p>
                            {a.important && (
                              <span className="text-[8px] font-black px-1.5 py-0.5 bg-violet-600 text-white rounded-full uppercase">Importante</span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {new Date(a.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {a.time} · {a.author}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAndamento(a.id)}
                          className="shrink-0 p-1 text-gray-300 dark:text-gray-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors text-xs"
                        >
                          🗑
                        </button>
                      </div>
                      {a.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{a.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Documentos Tab ── */}
      {tab === 'documentos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Documentos do Caso</h3>
            <label className="cursor-pointer px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 transition-colors flex items-center gap-1.5">
              ⬆️ Fazer Upload
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setDocFilter('all')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${docFilter === 'all' ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400'}`}
            >
              Todos ({docs.length})
            </button>
            {Object.entries(DOC_CATEGORY_MAP).map(([k, v]) => {
              const count = docs.filter(d => d.category === k).length;
              if (count === 0) return null;
              return (
                <button
                  key={k}
                  onClick={() => setDocFilter(k)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${docFilter === k ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400'}`}
                >
                  {v.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Documents Grid */}
          {filteredDocs.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-[#2A2545] rounded-2xl">
              <span className="text-4xl block mb-2">📎</span>
              <p className="text-sm">Nenhum documento. Clique em "Fazer Upload".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-xl p-3.5 shadow-sm group hover:border-violet-300 dark:hover:border-violet-700 transition-all">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center text-lg shrink-0">
                    {doc.type === 'PDF' ? '📄' : doc.type === 'Imagem' ? '🖼️' : '📁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{doc.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{doc.size} · {doc.uploadedAt}</p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${DOC_CATEGORY_MAP[doc.category]?.color || DOC_CATEGORY_MAP.outro.color}`}>
                      {DOC_CATEGORY_MAP[doc.category]?.label || 'Outro'}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors" title="Baixar">
                      ⬇️
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                      title="Excluir"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tribunal Tab ── */}
      {tab === 'tribunal' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Acesso Direto ao Tribunal</h3>
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-900/40 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                {tribunalInfo.icon}
              </div>
              <div>
                <p className="text-sm font-black text-gray-800 dark:text-white">{tribunalInfo.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Sistema eletrônico de processo judicial</p>
                <p className="text-xs font-mono text-violet-600 dark:text-violet-400 mt-0.5">{tribunalInfo.url}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-white dark:bg-black/20 rounded-xl p-3.5 border border-violet-100 dark:border-violet-900/30">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Nº do Processo</p>
                <p className="text-sm font-black text-gray-800 dark:text-white font-mono mt-1">{selectedCase.id}</p>
              </div>
              <div className="bg-white dark:bg-black/20 rounded-xl p-3.5 border border-violet-100 dark:border-violet-900/30">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Rito / Grupo</p>
                <p className="text-sm font-black text-gray-800 dark:text-white mt-1">{selectedCase.group} — {selectedCase.caseType}</p>
              </div>
            </div>
            <a
              href={tribunalInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              🏛️ Acessar {tribunalInfo.name} →
            </a>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-3">
              Você será redirecionado para o sistema oficial. Faça login com seu Certificado Digital (A3/Nuvem).
            </p>
          </div>

          {/* Stage Progress */}
          <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5">
            <h4 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-4">Fases do Processo</h4>
            <div className="space-y-2">
              {(selectedCase.stages || []).map((stage, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    stage.status === 'completed' ? 'bg-emerald-500 text-white' :
                    stage.status === 'current' ? 'bg-violet-600 text-white animate-pulse' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}>
                    {stage.status === 'completed' ? '✓' : i + 1}
                  </div>
                  <p className={`text-xs ${
                    stage.status === 'completed' ? 'text-gray-500 dark:text-gray-400 line-through' :
                    stage.status === 'current' ? 'font-bold text-violet-700 dark:text-violet-400' :
                    'text-gray-400 dark:text-gray-600'
                  }`}>
                    {stage.name}
                  </p>
                  {stage.status === 'current' && (
                    <span className="ml-auto text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-full">
                      Atual
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showAddAndamento && (
        <AddAndamentoModal
          caseId={selectedCase.id}
          onAdd={handleAddAndamento}
          onClose={() => setShowAddAndamento(false)}
        />
      )}
    </div>
  );
};
