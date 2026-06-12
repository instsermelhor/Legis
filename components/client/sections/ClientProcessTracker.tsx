import React, { useState, useRef, useCallback } from 'react';
import { translateLegalTerm, classifyLegalProblem } from '../../../utils/legalTermTranslator';
import type { User, Case } from '../../../types';
import { CaseProgressTracker } from '../../common/CaseProgressTracker';
import { StarRating } from '../../common/StarRating';

// ─── Props ───────────────────────────────────────────────────────────────────
interface ClientProcessTrackerProps {
  user: User;
  onUpdateLawyerReview: (
    lawyerId: number,
    caseId: string,
    rating: number,
    comment: string,
  ) => void;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_MOVEMENTS = [
  { date: '12/06/2025', code: 'conclusos para despacho', rawText: 'Conclusos para despacho' },
  { date: '10/06/2025', code: 'juntada', rawText: 'Juntada de petição pela parte autora' },
  { date: '05/06/2025', code: 'intimação', rawText: 'Intimação para apresentar documentos' },
  { date: '01/06/2025', code: 'petição inicial', rawText: 'Petição inicial protocolada' },
];

interface CpfProcess {
  id: string;
  tribunal: string;
  assunto: string;
  area: string;
  ultimaMovimentacao: string;
  dataUltMov: string;
  status: string;
  favoravel: boolean | null;
}

const CPF_FOUND_PROCESSES: CpfProcess[] = [
  {
    id: 'TRT-0001234-55.2024.5.02.0001',
    tribunal: 'TRT 2ª Região (SP)',
    assunto: 'Rescisão indireta do contrato de trabalho',
    area: 'Trabalhista',
    ultimaMovimentacao: 'Conclusos para despacho',
    dataUltMov: '12/06/2025',
    status: 'Em andamento',
    favoravel: true,
  },
  {
    id: 'TJSP-0009876-12.2023.8.26.0100',
    tribunal: 'TJSP — 3ª Vara Cível',
    assunto: 'Cobrança de dívida — Banco Digital',
    area: 'Cível',
    ultimaMovimentacao: 'Audiência designada',
    dataUltMov: '08/06/2025',
    status: 'Aguardando audiência',
    favoravel: null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
type StatusFilter = 'Todos' | 'Ativo' | 'Concluído';

const getStatusBadge = (status: Case['status']) => {
  switch (status) {
    case 'Ativo':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700';
    case 'Concluído':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700';
    case 'Cancelado':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-700';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getAreaBadge = (area: string) => {
  const lower = area.toLowerCase();
  if (lower.includes('trabalhist')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  if (lower.includes('cív') || lower.includes('civil')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
  if (lower.includes('penal') || lower.includes('criminal')) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  if (lower.includes('famíl') || lower.includes('familia')) return 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300';
  if (lower.includes('previdenci')) return 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300';
  if (lower.includes('imobili')) return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
  return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
};

const getFavoravelBadge = (favoravel: boolean | null) => {
  if (favoravel === true) return { label: '✅ Favorável', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' };
  if (favoravel === false) return { label: '⚠️ Desfavorável', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' };
  return { label: '⏳ Em andamento', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' };
};

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface TranslationResult {
  emoji: string;
  simple: string;
  detail: string;
}

interface TranslationModalProps {
  termText: string;
  onClose: () => void;
}

const TranslationModal: React.FC<TranslationModalProps> = ({ termText, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TranslationResult | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const translated = translateLegalTerm(termText);
      setResult(
        translated ?? {
          emoji: '📋',
          simple: 'Movimentação registrada',
          detail: 'Fale com seu advogado para entender o significado dessa movimentação.',
        },
      );
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [termText]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
          <span className="text-white font-semibold text-sm">🤖 Tradutor Jurídico</span>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5">
          {/* Original term */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 font-mono bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg truncate">
            "{termText}"
          </p>

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Traduzindo termo jurídico...</p>
            </div>
          ) : result ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{result.emoji}</span>
                <p className="text-base font-bold text-gray-800 dark:text-gray-100">{result.simple}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{result.detail}</p>
            </div>
          ) : null}

          <button
            onClick={onClose}
            className="mt-5 w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Entendido!
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ReviewModal ─────────────────────────────────────────────────────────────

interface ReviewModalProps {
  caseItem: Case;
  onSubmit: (rating: number, comment: string) => void;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ caseItem, onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 flex items-center justify-between">
          <span className="text-white font-semibold">⭐ Avaliar Serviço</span>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors" aria-label="Fechar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Caso:</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{caseItem.title}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Advogado: {caseItem.lawyerName}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sua avaliação:</p>
            <StarRating rating={rating} onRatingChange={setRating} />
            {rating === 0 && (
              <p className="text-xs text-amber-500 mt-1">Selecione ao menos 1 estrela</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Comentário (opcional):
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi a experiência..."
              className="w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar Avaliação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CaseCard ─────────────────────────────────────────────────────────────────

interface CaseCardProps {
  caseItem: Case;
  onReview: (caseItem: Case) => void;
  onTranslate: (text: string) => void;
  reviewedIds: Set<string>;
}

const CaseCard: React.FC<CaseCardProps> = ({ caseItem, onReview, onTranslate, reviewedIds }) => {
  const [open, setOpen] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const classification = classifyLegalProblem(caseItem.title + ' ' + (caseItem.caseType ?? ''));
  const isReviewed = caseItem.reviewSubmitted || reviewedIds.has(caseItem.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const names = Array.from(files as FileList).map((f: File) => f.name);
    setUploadedDocs((prev) => [...prev, ...names]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-base">{classification.emoji}</span>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base leading-tight">
                {caseItem.title}
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              👤 {caseItem.lawyerName} &bull; ID: <span className="font-mono">{caseItem.id}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusBadge(caseItem.status)}`}>
              {caseItem.status}
            </span>
            {caseItem.group && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getAreaBadge(caseItem.group)}`}>
                {caseItem.group}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      {caseItem.stages && caseItem.stages.length > 0 && (
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Progresso do Caso
          </p>
          <CaseProgressTracker stages={caseItem.stages} />
        </div>
      )}

      {/* Accordion: Movimentações */}
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span>📋 Movimentações do Processo</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="mt-3 space-y-2">
            {MOCK_MOVEMENTS.map((mov, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5"
              >
                <div className="mt-0.5 text-gray-400 dark:text-gray-500 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500">{mov.date}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-tight">{mov.rawText}</p>
                </div>
                <button
                  onClick={() => onTranslate(mov.code)}
                  className="shrink-0 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  🤖 Explicar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-5 py-3 flex flex-wrap items-center gap-2">
        {/* Upload */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          id={`doc-upload-${caseItem.id}`}
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Enviar Documentos
        </button>

        {/* Show uploaded docs */}
        {uploadedDocs.map((doc, i) => (
          <span key={i} className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg flex items-center gap-1 font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {doc.length > 20 ? doc.slice(0, 18) + '…' : doc}
          </span>
        ))}

        {/* Review button */}
        {caseItem.status === 'Concluído' && !isReviewed && (
          <button
            onClick={() => onReview(caseItem)}
            className="ml-auto text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            ⭐ Avaliar Serviço
          </button>
        )}
        {isReviewed && caseItem.status === 'Concluído' && (
          <span className="ml-auto text-xs text-emerald-500 dark:text-emerald-400 font-medium flex items-center gap-1">
            ✅ Avaliação enviada
          </span>
        )}
      </div>
    </div>
  );
};

// ─── CpfProcessCard ───────────────────────────────────────────────────────────

interface CpfProcessCardProps {
  proc: CpfProcess;
  onTranslate: (text: string) => void;
}

const CpfProcessCard: React.FC<CpfProcessCardProps> = ({ proc, onTranslate }) => {
  const [open, setOpen] = useState(false);
  const favBadge = getFavoravelBadge(proc.favoravel);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-0.5">{proc.id}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">🏛️ {proc.tribunal}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getAreaBadge(proc.area)}`}>
              {proc.area}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${favBadge.cls}`}>
              {favBadge.label}
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-100">{proc.assunto}</p>
      </div>

      {/* Status + last movement */}
      <div className="px-5 py-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {proc.dataUltMov}
        </span>
        <span className="truncate max-w-[200px]">{proc.ultimaMovimentacao}</span>
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full font-medium text-gray-600 dark:text-gray-300">
          {proc.status}
        </span>
      </div>

      {/* Accordion */}
      <div className="px-5 py-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span>📋 Última Movimentação</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="mt-3 flex items-start gap-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5">
            <div className="mt-0.5 text-gray-400 dark:text-gray-500 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 dark:text-gray-500">{proc.dataUltMov}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{proc.ultimaMovimentacao}</p>
            </div>
            <button
              onClick={() => onTranslate(proc.ultimaMovimentacao)}
              className="shrink-0 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              🤖 Traduzir
            </button>
          </div>
        )}
      </div>

      {/* Hire button */}
      <div className="px-5 pb-4">
        <button
          onClick={() => alert('🚀 Em breve: você poderá contratar um advogado diretamente pelo Legis Connect!')}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Contratar Advogado para este Processo
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const ClientProcessTracker: React.FC<ClientProcessTrackerProps> = ({
  user,
  onUpdateLawyerReview,
}) => {
  // Seção 1: Casos na plataforma
  const [filter, setFilter] = useState<StatusFilter>('Todos');
  const [reviewingCase, setReviewingCase] = useState<Case | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  // Tradução modal
  const [translationTerm, setTranslationTerm] = useState<string | null>(null);

  // Seção 2: Varredura CPF
  const [cpfValue, setCpfValue] = useState('');
  const [scanState, setScanState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [foundProcesses, setFoundProcesses] = useState<CpfProcess[]>([]);

  const SCAN_MESSAGES = ['🔍 Acessando tribunais...', '⚖️ Verificando TJ e TST...', '✅ Processos encontrados!'];

  const handleTranslate = useCallback((term: string) => {
    setTranslationTerm(term);
  }, []);

  const handleReviewSubmit = (rating: number, comment: string) => {
    if (!reviewingCase) return;
    onUpdateLawyerReview(reviewingCase.lawyerId, reviewingCase.id, rating, comment);
    setReviewedIds((prev) => new Set(prev).add(reviewingCase.id));
    setReviewingCase(null);
  };

  const handleScan = () => {
    if (scanState === 'loading') return;
    setScanState('loading');
    setFoundProcesses([]);

    let msgIndex = 0;
    setScanMessage(SCAN_MESSAGES[0]);

    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < SCAN_MESSAGES.length) {
        setScanMessage(SCAN_MESSAGES[msgIndex]);
      }
    }, 800);

    setTimeout(() => {
      clearInterval(interval);
      setScanMessage(SCAN_MESSAGES[2]);
      setTimeout(() => {
        setFoundProcesses(CPF_FOUND_PROCESSES);
        setScanState('done');
      }, 300);
    }, 2500);
  };

  const filteredCases = (user.caseHistory ?? []).filter((c) => {
    if (filter === 'Todos') return true;
    if (filter === 'Ativo') return c.status === 'Ativo';
    if (filter === 'Concluído') return c.status === 'Concluído';
    return true;
  });

  const hasCases = (user.caseHistory ?? []).length > 0;

  return (
    <div className="space-y-10">
      {/* ─── Seção 1: Casos na Plataforma ─── */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            ⚖️ Meus Casos no Escritório
          </h2>
          {/* Filtros */}
          {hasCases && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
              {(['Todos', 'Ativo', 'Concluído'] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    filter === f
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {!hasCases ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center px-6">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4 text-3xl">
              ⚖️
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
              Nenhum caso ainda
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-sm">
              Você ainda não possui casos registrados no escritório. Encontre um advogado especialista e dê o primeiro passo!
            </p>
            <button
              onClick={() => alert('Redirecionar para busca de advogados')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              🔍 Buscar Advogado
            </button>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-10 text-center text-gray-400 dark:text-gray-500 text-sm">
            Nenhum caso encontrado com este filtro.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCases.map((c) => (
              <CaseCard
                key={c.id}
                caseItem={c}
                onReview={setReviewingCase}
                onTranslate={handleTranslate}
                reviewedIds={reviewedIds}
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── Seção 2: Varredura por CPF ─── */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            🔍 Varredura de Processos por CPF
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Verificamos automaticamente todos os tribunais do país
          </p>
        </div>

        {/* Search card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 p-5 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="cpf-input" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                CPF do Titular
              </label>
              <input
                id="cpf-input"
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpfValue}
                onChange={(e) => setCpfValue(formatCpf(e.target.value))}
                maxLength={14}
                className="w-full border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex items-end">
              <button
                id="btn-scan-cpf"
                onClick={handleScan}
                disabled={scanState === 'loading' || cpfValue.length < 14}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {scanState === 'loading' ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                {scanState === 'loading' ? 'Varrendo...' : 'Varrer Agora'}
              </button>
            </div>
          </div>

          {/* Loading animation messages */}
          {scanState === 'loading' && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                {scanMessage}
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {scanState === 'done' && foundProcesses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {foundProcesses.length} processo(s) encontrado(s) para o CPF informado
              </p>
            </div>
            {foundProcesses.map((proc) => (
              <CpfProcessCard key={proc.id} proc={proc} onTranslate={handleTranslate} />
            ))}
          </div>
        )}

        {scanState === 'done' && foundProcesses.length === 0 && (
          <div className="py-10 text-center text-gray-400 dark:text-gray-500 text-sm">
            Nenhum processo encontrado para o CPF informado.
          </div>
        )}
      </section>

      {/* ─── Translation Modal ─── */}
      {translationTerm !== null && (
        <TranslationModal
          termText={translationTerm}
          onClose={() => setTranslationTerm(null)}
        />
      )}

      {/* ─── Review Modal ─── */}
      {reviewingCase !== null && (
        <ReviewModal
          caseItem={reviewingCase}
          onSubmit={handleReviewSubmit}
          onClose={() => setReviewingCase(null)}
        />
      )}
    </div>
  );
};
