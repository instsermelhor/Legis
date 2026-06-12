import React, { useState } from 'react';
import type { User, Case, Appointment } from '../../../types';

interface ClientOverviewProps {
  user: User;
  onGoToLawyer: () => void;
  onGoToProcessos: () => void;
  onGoToBuscar: () => void;
  onGoToServicos: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getProfileCompletion(user: User): number {
  let count = 0;
  if (user.name) count++;
  if (user.phone) count++;
  if (user.address) count++;
  return Math.round((count / 3) * 100);
}

function formatDatePtBR(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T12:00:00');
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getCountdownLabel(dateStr: string): string {
  const days = getDaysUntil(dateStr);
  if (days === 0) return 'Hoje!';
  if (days === 1) return 'Amanhã';
  return `em ${days} dias`;
}

function isFuture(dateStr: string): boolean {
  return getDaysUntil(dateStr) >= 0;
}

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('pt-BR');
}

const STAGE_NAME_MAP: Record<string, string> = {
  'Petição Inicial': 'Início',
  'Análise do Juiz': 'Com o Juiz',
  'Audiência': 'Audiência',
  'Sentença': 'Decisão Final',
  'Recurso': 'Revisão',
  'Concluído': 'Encerrado',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-[#1A1730] dark:bg-[#1A1730] rounded-2xl p-4 flex flex-col gap-2 border border-[#2A2545] shadow-lg hover:scale-[1.02] transition-all duration-200">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  color,
  onClick,
}: {
  icon: string;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.02] active:scale-95 w-full text-left ${color}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="flex-1 font-semibold text-sm">{label}</span>
      <span className="text-lg opacity-60">→</span>
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const ClientOverview: React.FC<ClientOverviewProps> = ({
  user,
  onGoToLawyer,
  onGoToProcessos,
  onGoToBuscar,
  onGoToServicos,
}) => {
  const [lawyerImgError, setLawyerImgError] = useState(false);

  const hasCase = !!(user.caseHistory && user.caseHistory.length > 0);
  const activeCase: Case | undefined = user.caseHistory?.find(c => c.status === 'Ativo');
  const activeCasesCount = user.caseHistory?.filter(c => c.status === 'Ativo').length ?? 0;

  const now = new Date().toISOString().split('T')[0];
  const confirmedFutureAppointments: Appointment[] = (user.appointments ?? []).filter(
    a => a.status === 'Confirmado' && isFuture(a.date)
  );
  const nextAppointment: Appointment | undefined = confirmedFutureAppointments.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )[0];

  const pendingDocuments = activeCasesCount > 0 ? 2 : 0;
  const nextDeadline = activeCasesCount > 0 ? addDays(15) : null;

  const profilePct = getProfileCompletion(user);

  const lawyerName = activeCase?.lawyerName ?? 'Advogado';
  const lawyerPhoto = `https://i.pravatar.cc/80?u=lawyer-${activeCase?.lawyerId ?? 1}`;

  // ── Empty State ────────────────────────────────────────────────────────────
  if (!hasCase) {
    return (
      <div className="animate-fade-in min-h-screen bg-[#0F0C1E] p-6 flex flex-col items-center justify-center gap-6 text-center">
        <div className="text-8xl">⚖️</div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Comece sua jornada jurídica</h2>
          <p className="text-gray-400">Encontre o advogado ideal para resolver seu caso</p>
        </div>
        <button
          onClick={onGoToBuscar}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-purple-900/40"
        >
          🔍 Buscar Advogados
        </button>

        {/* Quick actions even in empty state */}
        <div className="w-full max-w-sm mt-4 grid grid-cols-2 gap-3">
          <QuickActionButton
            icon="⚖️"
            label="Buscar Advogados"
            color="bg-blue-900/40 border-blue-700/40 text-blue-200 hover:bg-blue-800/50"
            onClick={onGoToBuscar}
          />
          <QuickActionButton
            icon="💼"
            label="Contratar Serviço"
            color="bg-green-900/40 border-green-700/40 text-green-200 hover:bg-green-800/50"
            onClick={onGoToServicos}
          />
        </div>
      </div>
    );
  }

  // ── Full Dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in min-h-screen bg-[#0F0C1E] dark:bg-[#0F0C1E] px-4 py-6 max-w-2xl mx-auto flex flex-col gap-6">

      {/* 1. Header de Boas-vindas */}
      <div className="flex flex-col gap-1">
        <p className="text-gray-400 text-sm">{getGreeting()},</p>
        <h1 className="text-2xl font-bold text-white leading-tight">
          {user.name ?? user.email.split('@')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm">Aqui está tudo sobre sua vida jurídica hoje</p>

        {/* Profile completion bar */}
        <div className="mt-3 bg-[#1A1730] rounded-xl p-3 border border-[#2A2545]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 font-medium">Completude do perfil</span>
            <span className="text-xs font-bold text-purple-400">{profilePct}%</span>
          </div>
          <div className="w-full bg-[#2A2545] rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-700"
              style={{ width: `${profilePct}%` }}
            />
          </div>
          {profilePct < 100 && (
            <p className="text-xs text-gray-500 mt-1">
              Complete seu perfil para uma melhor experiência
            </p>
          )}
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Resumo
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            icon="⚖️"
            label="Casos Ativos"
            value={activeCasesCount}
            sub={activeCasesCount === 1 ? '1 processo em andamento' : `${activeCasesCount} processos`}
            color="bg-purple-900/50"
          />
          <KpiCard
            icon="📅"
            label="Consultas Agendadas"
            value={confirmedFutureAppointments.length}
            sub={nextAppointment ? `Próxima: ${getCountdownLabel(nextAppointment.date)}` : 'Nenhuma agendada'}
            color="bg-blue-900/50"
          />
          <KpiCard
            icon="📎"
            label="Docs Pendentes"
            value={pendingDocuments}
            sub={pendingDocuments > 0 ? 'Ação necessária' : 'Tudo em dia'}
            color="bg-amber-900/50"
          />
          <KpiCard
            icon="🗓️"
            label="Próx. Vencimento"
            value={nextDeadline ?? '—'}
            sub={nextDeadline ? 'em 15 dias' : 'Sem vencimentos'}
            color="bg-rose-900/50"
          />
        </div>
      </div>

      {/* 3. Card de Status de Contratação */}
      {activeCase && (
        <div className="rounded-2xl bg-gradient-to-br from-purple-900/70 via-purple-800/60 to-[#1A1730] border border-purple-700/40 p-5 shadow-xl shadow-purple-900/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-shrink-0">
              <img
                src={lawyerImgError ? `https://i.pravatar.cc/80?u=fallback` : lawyerPhoto}
                alt={lawyerName}
                onError={() => setLawyerImgError(true)}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/60"
              />
              <span className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-[#0F0C1E]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-bold text-base truncate">{lawyerName}</h3>
                <span className="text-xs bg-purple-600/70 text-purple-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                  Seu Advogado
                </span>
              </div>
              <p className="text-purple-300 text-xs mt-0.5">{activeCase.title}</p>
            </div>
          </div>

          {/* Pending task */}
          <div className="bg-black/20 rounded-xl p-3 mb-4 border border-purple-700/30">
            <p className="text-xs text-purple-300 font-medium mb-2">Próxima ação necessária</p>
            <p className="text-sm text-white mb-3">📎 Falta anexar comprovante de residência</p>
            <button
              onClick={onGoToLawyer}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all duration-200 font-medium"
            >
              Resolver agora →
            </button>
          </div>

          {/* Action button */}
          <button
            onClick={onGoToLawyer}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-900/40 text-sm"
          >
            💬 Mensagem Rápida
          </button>
        </div>
      )}

      {/* 4. Linha do Tempo Visual do Processo */}
      {activeCase && activeCase.stages && activeCase.stages.length > 0 && (
        <div className="bg-[#1A1730] rounded-2xl border border-[#2A2545] p-5">
          <h2 className="text-sm font-bold text-white mb-4">📋 Progresso do Processo</h2>

          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-0 min-w-max">
              {activeCase.stages.map((stage, idx) => {
                const displayName = STAGE_NAME_MAP[stage.name] ?? stage.name;
                const isLast = idx === activeCase.stages.length - 1;

                return (
                  <React.Fragment key={idx}>
                    <div className="flex flex-col items-center gap-2">
                      {/* Circle */}
                      {stage.status === 'completed' && (
                        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-900/40">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                      )}
                      {stage.status === 'current' && (
                        <div className="relative w-9 h-9">
                          <div className="absolute inset-0 rounded-full bg-purple-600 animate-ping opacity-30" />
                          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/50 relative z-10">
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          </div>
                        </div>
                      )}
                      {stage.status === 'upcoming' && (
                        <div className="w-9 h-9 rounded-full bg-[#2A2545] border-2 border-gray-600 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-gray-600" />
                        </div>
                      )}

                      {/* Label */}
                      <span
                        className={`text-xs text-center font-medium w-14 leading-tight ${
                          stage.status === 'completed'
                            ? 'text-green-400'
                            : stage.status === 'current'
                            ? 'text-purple-300'
                            : 'text-gray-600'
                        }`}
                      >
                        {displayName}
                      </span>
                    </div>

                    {/* Arrow connector */}
                    {!isLast && (
                      <div
                        className={`h-0.5 w-8 mx-1 flex-shrink-0 rounded-full ${
                          stage.status === 'completed' ? 'bg-green-500/60' : 'bg-[#2A2545]'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-400">Concluído</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-purple-600" />
              <span className="text-xs text-gray-400">Em andamento</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#2A2545] border border-gray-600" />
              <span className="text-xs text-gray-400">Pendente</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Próxima Consulta */}
      {nextAppointment && (
        <div className="bg-[#1A1730] rounded-2xl border border-[#2A2545] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">🗓️ Próxima Consulta</h2>
            <span className="text-xs bg-green-900/50 text-green-400 border border-green-700/40 px-2.5 py-1 rounded-full font-medium">
              ✓ Confirmada
            </span>
          </div>

          <div className="flex items-start gap-4 mb-4">
            <div className="bg-purple-900/50 rounded-xl p-3 text-center min-w-[60px]">
              <p className="text-2xl font-bold text-white leading-none">
                {new Date(nextAppointment.date + 'T12:00:00').getDate()}
              </p>
              <p className="text-xs text-purple-300 uppercase">
                {new Date(nextAppointment.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm capitalize">
                {formatDatePtBR(nextAppointment.date)}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">⏰ {nextAppointment.time}</p>
              <p className="text-gray-400 text-xs mt-0.5">
                {nextAppointment.modality === 'Videochamada' ? '🎥 Videochamada' : '🏢 Presencial'}
              </p>
              <div className="mt-2">
                <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded-full">
                  📅 {getCountdownLabel(nextAppointment.date)}
                </span>
              </div>
            </div>
          </div>

          {nextAppointment.modality === 'Videochamada' && (
            <button
              onClick={() =>
                window.open(
                  nextAppointment.consultationLink ?? 'https://meet.legisconnect.com.br',
                  '_blank'
                )
              }
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-900/40 text-sm flex items-center justify-center gap-2"
            >
              🎥 Entrar na Videochamada
            </button>
          )}
        </div>
      )}

      {/* 6. Atalhos Rápidos */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Atalhos Rápidos
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionButton
            icon="💬"
            label="Falar com meu Advogado"
            color="bg-purple-900/40 border border-purple-700/40 text-purple-200 hover:bg-purple-800/50"
            onClick={onGoToLawyer}
          />
          <QuickActionButton
            icon="⚖️"
            label="Buscar Advogados"
            color="bg-blue-900/40 border border-blue-700/40 text-blue-200 hover:bg-blue-800/50"
            onClick={onGoToBuscar}
          />
          <QuickActionButton
            icon="🔍"
            label="Ver Meus Processos"
            color="bg-amber-900/40 border border-amber-700/40 text-amber-200 hover:bg-amber-800/50"
            onClick={onGoToProcessos}
          />
          <QuickActionButton
            icon="💼"
            label="Contratar Serviço"
            color="bg-green-900/40 border border-green-700/40 text-green-200 hover:bg-green-800/50"
            onClick={onGoToServicos}
          />
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-4" />
    </div>
  );
};
