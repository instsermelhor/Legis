import React, { useState, useEffect } from 'react';
import {
  LgpdRightType,
  LgpdRightsRequest,
  LGPD_RIGHT_LABELS,
  createLgpdRequest,
  getLgpdRequestsByUser,
  refreshOverdueRequests,
} from '../../services/lgpdRightsService';

interface LgpdRightsPortalProps {
  userId: string;
  userEmail: string;
}

const STATUS_STYLES: Record<LgpdRightsRequest['status'], string> = {
  pending:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  in_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  overdue:   'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

const STATUS_LABELS: Record<LgpdRightsRequest['status'], string> = {
  pending:   '⏳ Aguardando',
  in_review: '🔍 Em Análise',
  completed: '✅ Concluído',
  rejected:  '❌ Indeferido',
  overdue:   '⚠️ Prazo Vencido',
};

export const LgpdRightsPortal: React.FC<LgpdRightsPortalProps> = ({ userId, userEmail }) => {
  const [requests, setRequests] = useState<LgpdRightsRequest[]>([]);
  const [selectedRight, setSelectedRight] = useState<LgpdRightType | ''>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    refreshOverdueRequests();
    setRequests(getLgpdRequestsByUser(userId));
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRight) return;

    setSubmitting(true);
    createLgpdRequest({ userId, userEmail, rightType: selectedRight, description });
    setRequests(getLgpdRequestsByUser(userId));
    setSubmitting(false);
    setSubmitted(true);
    setSelectedRight('');
    setDescription('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  const rightKeys = Object.keys(LGPD_RIGHT_LABELS) as LgpdRightType[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🛡️</span>
          <div>
            <h2 className="text-lg font-bold text-violet-900 dark:text-violet-100">
              Portal de Direitos do Titular
            </h2>
            <p className="text-sm text-violet-700 dark:text-violet-300 mt-1">
              Conforme a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>,
              você tem direitos sobre os seus dados pessoais. Exerça-os abaixo.
              Respondemos em até <strong>15 dias corridos</strong> (Art. 19 LGPD).
            </p>
          </div>
        </div>
      </div>

      {/* Nova Solicitação */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Nova Solicitação</h3>

        {submitted && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-300">
            ✅ Solicitação enviada com sucesso! Prazo de resposta: 15 dias corridos.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selecção do direito */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rightKeys.map((key) => {
              const info = LGPD_RIGHT_LABELS[key];
              const isSelected = selectedRight === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedRight(isSelected ? '' : key)}
                  className={`text-left p-3 rounded-xl border-2 transition-all duration-150 ${
                    isSelected
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700'
                  }`}
                >
                  <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-0.5">
                    {info.article}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {info.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {info.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Descrição opcional */}
          {selectedRight && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Detalhe a sua solicitação <span className="text-gray-400">(opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Descreva o contexto ou informações adicionais..."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedRight || submitting}
            className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors duration-150"
          >
            {submitting ? 'Enviando...' : 'Enviar Solicitação'}
          </button>
        </form>
      </div>

      {/* Histórico */}
      {requests.length > 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Minhas Solicitações ({requests.length})
          </h3>
          <div className="space-y-3">
            {requests.map((r) => {
              const info = LGPD_RIGHT_LABELS[r.rightType];
              const deadline = new Date(r.deadlineAt);
              return (
                <div
                  key={r.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {info.title}
                      </span>
                      <span className="text-xs text-gray-400">{info.article}</span>
                    </div>
                    {r.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{r.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Prazo: {deadline.toLocaleDateString('pt-BR')}
                    </p>
                    {r.resolutionNotes && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">
                        Resposta: {r.resolutionNotes}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
