import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

interface QueueJob {
  id: string;
  type: string;
  description: string;
  tenant: string;
  status: JobStatus;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  errorMsg?: string;
  durationMs?: number;
}

// ─── Mock Jobs ────────────────────────────────────────────────────────────────
const INITIAL_JOBS: QueueJob[] = [
  { id: 'job-001', type: 'PETICAO_AUTO',     description: 'Peticionamento automático — Processo 0012345-67.2024.8.26.0001', tenant: 'Adv. Carlos Silva',      status: 'completed', priority: 8, attempts: 1, maxAttempts: 3, createdAt: '14:22:10', updatedAt: '14:22:48', durationMs: 38000 },
  { id: 'job-002', type: 'READ_INTIMACAO',   description: 'Leitura de intimação — TJSP: 3 processos pendentes',             tenant: 'Escritório Mendes',     status: 'completed', priority: 9, attempts: 1, maxAttempts: 3, createdAt: '14:18:05', updatedAt: '14:18:22', durationMs: 17200 },
  { id: 'job-003', type: 'DIARIO_SCRAPE',    description: 'Captura D.O. Federal — edição 14/06/2025',                       tenant: 'Sistema Global',        status: 'running',   priority: 7, attempts: 1, maxAttempts: 3, createdAt: '14:30:00', updatedAt: '14:30:00' },
  { id: 'job-004', type: 'PETICAO_AUTO',     description: 'Peticionamento — Recurso Inominado Proc. 0098765',               tenant: 'Adv. Fernanda Lopes',   status: 'failed',    priority: 8, attempts: 3, maxAttempts: 3, createdAt: '13:55:00', updatedAt: '14:10:32', errorMsg: 'Timeout na autenticação PJe-MG. Certificado digital expirado.' },
  { id: 'job-005', type: 'AI_GENERATE_PECA', description: 'Geração IA — Contestação Trabalhista (GPT-4o)',                  tenant: 'Escritório Saraiva',    status: 'pending',   priority: 6, attempts: 0, maxAttempts: 3, createdAt: '14:32:14', updatedAt: '14:32:14' },
  { id: 'job-006', type: 'AI_GENERATE_PECA', description: 'Geração IA — Petição Inicial Cível',                             tenant: 'Adv. Roberto Andrade',  status: 'pending',   priority: 6, attempts: 0, maxAttempts: 3, createdAt: '14:33:01', updatedAt: '14:33:01' },
  { id: 'job-007', type: 'DIARIO_SCRAPE',    description: 'Captura D.O. Estadual SP — edição matinal',                      tenant: 'Sistema Global',        status: 'failed',    priority: 7, attempts: 2, maxAttempts: 3, createdAt: '13:00:00', updatedAt: '13:45:00', errorMsg: 'Servidor do IMESP retornou 503. Aguardando restabelecimento.' },
  { id: 'job-008', type: 'NOTIF_EMAIL',      description: 'Envio de alerta de prazo — 12 advogados',                        tenant: 'Sistema Global',        status: 'completed', priority: 5, attempts: 1, maxAttempts: 3, createdAt: '14:00:00', updatedAt: '14:00:14', durationMs: 14000 },
  { id: 'job-009', type: 'READ_INTIMACAO',   description: 'Leitura de intimação — e-SAJ BA',                                tenant: 'Adv. Patrícia Santos',  status: 'pending',   priority: 9, attempts: 0, maxAttempts: 3, createdAt: '14:34:00', updatedAt: '14:34:00' },
  { id: 'job-010', type: 'PETICAO_AUTO',     description: 'Recurso de Apelação — TJRJ',                                     tenant: 'Corp. Jurídica Ltda.',  status: 'running',   priority: 9, attempts: 1, maxAttempts: 3, createdAt: '14:29:00', updatedAt: '14:29:00' },
];

// ─── Job type labels ──────────────────────────────────────────────────────────
const JOB_TYPE_LABELS: Record<string, string> = {
  PETICAO_AUTO:     '⚖️ Peticionamento',
  READ_INTIMACAO:   '📬 Leitura Intimação',
  DIARIO_SCRAPE:    '📰 Captura Diário',
  AI_GENERATE_PECA: '🤖 Geração IA',
  NOTIF_EMAIL:      '📧 Notificação',
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<JobStatus, { label: string; bg: string; dot: string }> = {
  pending:   { label: 'Aguardando',  bg: 'bg-gray-100   dark:bg-gray-700/50   text-gray-600   dark:text-gray-300',   dot: 'bg-gray-400' },
  running:   { label: 'Executando',  bg: 'bg-blue-100   dark:bg-blue-900/40   text-blue-700   dark:text-blue-300',   dot: 'bg-blue-400   animate-pulse' },
  completed: { label: 'Concluído',   bg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-400' },
  failed:    { label: 'Falhou',      bg: 'bg-rose-100   dark:bg-rose-900/40   text-rose-700   dark:text-rose-300',   dot: 'bg-rose-500' },
};

// ─── Job Queue Component ──────────────────────────────────────────────────────
export const JobQueue: React.FC = () => {
  const [jobs, setJobs] = useState<QueueJob[]>(INITIAL_JOBS);
  const [filter, setFilter] = useState<JobStatus | 'all'>('all');
  const [retrying, setRetrying] = useState<string | null>(null);

  const counts = {
    pending:   jobs.filter((j) => j.status === 'pending').length,
    running:   jobs.filter((j) => j.status === 'running').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    failed:    jobs.filter((j) => j.status === 'failed').length,
  };

  const handleRetry = async (jobId: string) => {
    setRetrying(jobId);
    // Simulate retry: set to running → completed after delay
    setJobs((prev) => prev.map((j) =>
      j.id === jobId ? { ...j, status: 'running', attempts: j.attempts, errorMsg: undefined } : j
    ));
    await new Promise((res) => setTimeout(res, 2500));
    setJobs((prev) => prev.map((j) =>
      j.id === jobId ? { ...j, status: 'completed', updatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), durationMs: 2500 } : j
    ));
    setRetrying(null);
  };

  const visible = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
            Fila de Processamento
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Jobs de peticionamento, captura de diários e geração IA
          </p>
        </div>
        {/* Summary */}
        <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
          <span className="text-gray-500 dark:text-gray-400">{counts.pending} aguardando</span>
          <span className="text-blue-600 dark:text-blue-400">{counts.running} executando</span>
          <span className="text-emerald-600 dark:text-emerald-400">{counts.completed} concluídos</span>
          <span className="text-rose-600 dark:text-rose-400">{counts.failed} falharam</span>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'failed', 'running', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filter === f
                ? 'bg-violet-600 text-white shadow'
                : 'bg-gray-100 dark:bg-[#1A1730] text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
            }`}
          >
            {f === 'all' ? `Todos (${jobs.length})` :
             f === 'failed' ? `Falharam (${counts.failed})` :
             f === 'running' ? `Executando (${counts.running})` :
             f === 'pending' ? `Aguardando (${counts.pending})` :
             `Concluídos (${counts.completed})`}
          </button>
        ))}
      </div>

      {/* Failed banner */}
      {counts.failed > 0 && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 rounded-xl">
          <span className="text-xl mt-0.5">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">
              {counts.failed} job(s) falharam e necessitam de ação
            </p>
            <p className="text-xs text-rose-500 dark:text-rose-500 mt-0.5">
              Use o botão <strong>Retry</strong> para reprocessar manualmente.
            </p>
          </div>
          <button
            onClick={() => setFilter('failed')}
            className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline"
          >
            Ver →
          </button>
        </div>
      )}

      {/* Jobs table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#2A2545]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#1A1730] text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Job</th>
              <th className="px-4 py-3 text-left">Tenant</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Tentativas</th>
              <th className="px-4 py-3 text-right">Duração</th>
              <th className="px-4 py-3 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#2A2545]">
            {visible.map((job) => {
              const sCfg = STATUS_CFG[job.status];
              const typeLabel = JOB_TYPE_LABELS[job.type] ?? job.type;
              const isRetrying = retrying === job.id;

              return (
                <React.Fragment key={job.id}>
                  <tr className={`hover:bg-gray-50 dark:hover:bg-[#1A1730]/50 transition-colors ${job.status === 'failed' ? 'bg-rose-50/40 dark:bg-rose-900/10' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-0.5">{typeLabel}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight max-w-xs truncate" title={job.description}>
                        {job.description}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        Criado: {job.createdAt} · Atualizado: {job.updatedAt}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{job.tenant}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${sCfg.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                        {sCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold ${job.attempts >= job.maxAttempts ? 'text-rose-600 dark:text-rose-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {job.attempts}/{job.maxAttempts}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500 dark:text-gray-400">
                      {job.durationMs ? `${(job.durationMs / 1000).toFixed(1)}s` : job.status === 'running' ? '⏳' : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(job.status === 'failed') && (
                        <button
                          onClick={() => handleRetry(job.id)}
                          disabled={isRetrying}
                          className="px-3 py-1 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all disabled:opacity-60 disabled:cursor-wait flex items-center gap-1 mx-auto"
                        >
                          {isRetrying ? (
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                          ) : '↺'}
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                  {job.errorMsg && (
                    <tr>
                      <td colSpan={6} className="px-4 py-1.5 bg-rose-50 dark:bg-rose-900/10">
                        <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <span>🔴</span> {job.errorMsg}
                        </p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                  Nenhum job neste status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
