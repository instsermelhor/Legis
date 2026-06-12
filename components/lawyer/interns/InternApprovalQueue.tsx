/**
 * InternApprovalQueue.tsx
 * Fila de Aprovação de Estagiários — Painel do Advogado
 * Peças/pesquisas produzidas pelo estagiário aguardam "De acordo"
 * antes de serem enviadas. Métricas de produtividade por estagiário.
 */
import React, { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type SubmissionStatus = 'pending_approval' | 'approved' | 'needs_revision' | 'rejected';
type SubmissionType = 'pesquisa' | 'minuta' | 'revisao' | 'diligencia' | 'peticao';

interface InternSubmission {
  id: string;
  internId: number;
  internName: string;
  type: SubmissionType;
  title: string;
  description: string;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  lawyerComment?: string;
  caseRef: string;
  attachmentName?: string;
  wordCount?: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SUBMISSIONS: InternSubmission[] = [
  {
    id: 's1', internId: 1, internName: 'João Vitor Santos', type: 'pesquisa',
    title: 'Pesquisa — Jurisprudência STJ sobre Danos Morais Bancários',
    description: 'Levantamento de 12 ementas do STJ (2022-2024) sobre danos morais por negativação indevida. Teses organizadas por valor de condenação e fundamento legal.',
    status: 'pending_approval', submittedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    caseRef: 'case1', wordCount: 2340,
  },
  {
    id: 's2', internId: 2, internName: 'Maria Clara Alves', type: 'minuta',
    title: 'Minuta — Petição de Contestação (Inventário)',
    description: 'Minuta de contestação elaborada com base nos documentos recebidos. Arguição de nulidade da certidão de partilha e pedido de nova avaliação dos bens.',
    status: 'pending_approval', submittedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    caseRef: 'case1', wordCount: 4100, attachmentName: 'Contestacao_Inventario_v1.docx',
  },
  {
    id: 's3', internId: 1, internName: 'João Vitor Santos', type: 'revisao',
    title: 'Revisão Ortográfica — Recurso Ordinário TRT',
    description: 'Revisão gramatical e ortográfica completa. Padronização das citações conforme ABNT. Verificação de coerência jurídica das teses arguidas.',
    status: 'needs_revision', submittedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    reviewedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    lawyerComment: 'A fundamentação do 3º parágrafo precisa ser melhorada. Incluir citação do art. 897 da CLT.',
    caseRef: 'case2', wordCount: 1800,
  },
  {
    id: 's4', internId: 2, internName: 'Maria Clara Alves', type: 'diligencia',
    title: 'Diligência — Certidão Negativa de Débitos',
    description: 'Retirada da CND da Receita Federal e do INSS. Certidões obtidas em 23/05/2024, válidas por 180 dias.',
    status: 'approved', submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    lawyerComment: 'Perfeito! Arquivar no processo de inventário.',
    caseRef: 'case1', attachmentName: 'CND_Receita_Federal.pdf',
  },
  {
    id: 's5', internId: 3, internName: 'Lucas Ferreira Dias', type: 'pesquisa',
    title: 'Pesquisa — Legislação sobre Rescisão Indireta',
    description: 'Levantamento doutrinário e jurisprudencial sobre rescisão indireta (art. 483, CLT). Casos paradigma do TST.',
    status: 'approved', submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    caseRef: 'case2', wordCount: 3100,
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_MAP: Record<SubmissionType, { label: string; color: string; icon: string }> = {
  pesquisa:   { label: 'Pesquisa',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',   icon: '🔍' },
  minuta:     { label: 'Minuta',     color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', icon: '📝' },
  revisao:    { label: 'Revisão',    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',   icon: '✏️' },
  diligencia: { label: 'Diligência', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: '📋' },
  peticao:    { label: 'Petição',    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',   icon: '⚖️' },
};

const STATUS_MAP: Record<SubmissionStatus, { label: string; icon: string; badge: string }> = {
  pending_approval: { label: 'Aguardando Revisão', icon: '⏳', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  approved:         { label: 'Aprovado',            icon: '✅', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  needs_revision:   { label: 'Solicitar Revisão',   icon: '🔄', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  rejected:         { label: 'Rejeitado',            icon: '❌', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
};

// ─── Review Modal ─────────────────────────────────────────────────────────────
interface ReviewModalProps {
  submission: InternSubmission;
  onClose: () => void;
  onDecision: (id: string, decision: 'approved' | 'needs_revision' | 'rejected', comment: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ submission, onClose, onDecision }) => {
  const [comment, setComment] = useState('');
  const [decision, setDecision] = useState<'approved' | 'needs_revision' | 'rejected'>('approved');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1A1730] rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">👨‍⚖️ Revisão da Peça</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
          </div>
          <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 mb-4">
            <p className="text-xs font-black text-gray-800 dark:text-white">{submission.title}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              Por: {submission.internName} · {TYPE_MAP[submission.type].icon} {TYPE_MAP[submission.type].label}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{submission.description}</p>
            {submission.attachmentName && (
              <div className="mt-2 flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg px-3 py-2">
                <span>📎</span>
                <span className="text-[10px] text-violet-700 dark:text-violet-300 font-bold">{submission.attachmentName}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Decisão</label>
            <div className="grid grid-cols-3 gap-2">
              {(['approved', 'needs_revision', 'rejected'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDecision(d)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                    decision === d
                      ? d === 'approved' ? 'bg-emerald-600 border-emerald-600 text-white' :
                        d === 'needs_revision' ? 'bg-amber-500 border-amber-500 text-white' :
                        'bg-rose-600 border-rose-600 text-white'
                      : 'bg-white dark:bg-transparent border-gray-200 dark:border-[#2A2545] text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {STATUS_MAP[d].icon} {STATUS_MAP[d].label}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">
                Comentário {decision === 'needs_revision' ? '(obrigatório)' : '(opcional)'}
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                placeholder={
                  decision === 'approved' ? 'Ótimo trabalho! (opcional)' :
                  decision === 'needs_revision' ? 'Indique exatamente o que precisa ser corrigido...' :
                  'Justifique a rejeição...'
                }
                className="w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A] focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-black/20 rounded-xl hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button
              onClick={() => {
                if (decision === 'needs_revision' && !comment.trim()) return;
                onDecision(submission.id, decision, comment);
                onClose();
              }}
              className={`flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-colors ${
                decision === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' :
                decision === 'needs_revision' ? 'bg-amber-500 hover:bg-amber-600' :
                'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {STATUS_MAP[decision].icon} Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
type QueueFilter = 'all' | SubmissionStatus;

interface InternApprovalQueueProps {
  lawyerId?: number;
}

export const InternApprovalQueue: React.FC<InternApprovalQueueProps> = ({ lawyerId }) => {
  const [submissions, setSubmissions] = useState<InternSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('legis_intern_submissions');
      return saved ? JSON.parse(saved) : MOCK_SUBMISSIONS;
    } catch { return MOCK_SUBMISSIONS; }
  });
  const [filter, setFilter] = useState<QueueFilter>('pending_approval');
  const [reviewing, setReviewing] = useState<InternSubmission | null>(null);

  const save = (next: InternSubmission[]) => {
    setSubmissions(next);
    localStorage.setItem('legis_intern_submissions', JSON.stringify(next));
  };

  const handleDecision = (id: string, decision: 'approved' | 'needs_revision' | 'rejected', comment: string) => {
    save(submissions.map(s => s.id !== id ? s : {
      ...s,
      status: decision,
      reviewedAt: new Date().toISOString(),
      lawyerComment: comment || undefined,
    }));
  };

  const filtered = useMemo(() =>
    filter === 'all' ? submissions : submissions.filter(s => s.status === filter),
    [submissions, filter]
  );

  // Métricas por estagiário
  const internStats = useMemo(() => {
    const map = new Map<string, { name: string; total: number; approved: number; revision: number; rejected: number; pending: number }>();
    submissions.forEach(s => {
      const entry = map.get(s.internName) || { name: s.internName, total: 0, approved: 0, revision: 0, rejected: 0, pending: 0 };
      entry.total++;
      if (s.status === 'approved') entry.approved++;
      else if (s.status === 'needs_revision') entry.revision++;
      else if (s.status === 'rejected') entry.rejected++;
      else entry.pending++;
      map.set(s.internName, entry);
    });
    return Array.from(map.values());
  }, [submissions]);

  const pendingCount = submissions.filter(s => s.status === 'pending_approval').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-[#2A2545] pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            🎓 Fila de Aprovação — Estagiários
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500">Revise e aprove as peças produzidas antes de serem enviadas.</p>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-900/40 animate-pulse">
            ⏳ {pendingCount} aguardando revisão
          </span>
        )}
      </div>

      {/* ── Métricas de Produtividade ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {internStats.map(stat => {
          const approvalRate = stat.total > 0 ? Math.round(((stat.approved) / (stat.total - stat.pending)) * 100) || 0 : 0;
          return (
            <div key={stat.name} className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-sm">🎓</div>
                <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{stat.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center">
                  <p className="text-lg font-black text-gray-800 dark:text-white">{stat.total}</p>
                  <p className="text-[9px] text-gray-400 uppercase font-bold">Entregues</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{approvalRate}%</p>
                  <p className="text-[9px] text-gray-400 uppercase font-bold">Aprovação</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="flex-1 bg-gray-100 dark:bg-black/20 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${approvalRate}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-[8px] text-gray-400 font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">✅ {stat.approved} aprov.</span>
                <span className="text-amber-600 dark:text-amber-400">🔄 {stat.revision} revis.</span>
                <span className="text-amber-500">⏳ {stat.pending} pend.</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {([
          { id: 'all', label: 'Todas', count: submissions.length },
          { id: 'pending_approval', label: '⏳ Aguardando', count: submissions.filter(s => s.status === 'pending_approval').length },
          { id: 'needs_revision', label: '🔄 Em Revisão', count: submissions.filter(s => s.status === 'needs_revision').length },
          { id: 'approved', label: '✅ Aprovadas', count: submissions.filter(s => s.status === 'approved').length },
          { id: 'rejected', label: '❌ Rejeitadas', count: submissions.filter(s => s.status === 'rejected').length },
        ] as { id: QueueFilter; label: string; count: number }[]).map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              filter === f.id
                ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                : 'bg-white dark:bg-transparent border-gray-200 dark:border-[#2A2545] text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-700'
            }`}
          >
            {f.label}
            <span className={`px-1.5 py-0.5 text-[8px] font-black rounded-full ${filter === f.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-black/20 text-gray-500 dark:text-gray-400'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Submissions List ── */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 dark:text-gray-600">
            <span className="text-4xl block mb-2">🎓</span>
            <p className="text-sm">Nenhuma peça nesta categoria.</p>
          </div>
        )}
        {filtered.map(sub => {
          const typeInfo = TYPE_MAP[sub.type];
          const statusInfo = STATUS_MAP[sub.status];
          const timeAgo = (() => {
            const diff = Date.now() - new Date(sub.submittedAt).getTime();
            const h = Math.floor(diff / 3600000);
            if (h < 1) return 'há menos de 1h';
            if (h < 24) return `há ${h}h`;
            return `há ${Math.floor(h / 24)}d`;
          })();

          return (
            <div key={sub.id} className={`bg-white dark:bg-[#1A1730] border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${
              sub.status === 'pending_approval' ? 'border-amber-200 dark:border-amber-900/40' :
              sub.status === 'approved' ? 'border-emerald-200 dark:border-emerald-900/40' :
              sub.status === 'needs_revision' ? 'border-orange-200 dark:border-orange-900/40' :
              'border-rose-200 dark:border-rose-900/40 opacity-60'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                      {typeInfo.icon} {typeInfo.label}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusInfo.badge}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">Ref: {sub.caseRef}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">{sub.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{sub.description}</p>
                  {sub.attachmentName && (
                    <div className="mt-2 flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg px-3 py-1.5 w-fit">
                      <span className="text-xs">📎</span>
                      <span className="text-[10px] text-violet-700 dark:text-violet-300 font-bold">{sub.attachmentName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400 dark:text-gray-500">
                    <span>🎓 {sub.internName}</span>
                    {sub.wordCount && <span>📄 {sub.wordCount.toLocaleString('pt-BR')} palavras</span>}
                    <span>⏱ Enviado {timeAgo}</span>
                  </div>
                  {/* Lawyer comment */}
                  {sub.lawyerComment && (
                    <div className={`mt-3 rounded-xl px-3 py-2 text-xs ${
                      sub.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' :
                      'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                    }`}>
                      <span className="font-bold">Comentário do Advogado:</span> {sub.lawyerComment}
                    </div>
                  )}
                </div>
                {/* Actions */}
                {sub.status === 'pending_approval' && (
                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setReviewing(sub)}
                      className="px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                      👨‍⚖️ Revisar
                    </button>
                    <button
                      onClick={() => handleDecision(sub.id, 'approved', 'Aprovado sem ressalvas.')}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                      ✅ Aprovação Rápida
                    </button>
                  </div>
                )}
                {sub.status === 'needs_revision' && (
                  <button
                    onClick={() => setReviewing(sub)}
                    className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-sm whitespace-nowrap shrink-0"
                  >
                    📝 Ver Detalhes
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {reviewing && (
        <ReviewModal
          submission={reviewing}
          onClose={() => setReviewing(null)}
          onDecision={handleDecision}
        />
      )}
    </div>
  );
};
