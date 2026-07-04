import React, { useState } from 'react';
import type { User, Case, Appointment } from '../../../types';
import {
  Card, KpiCard, SectionHeader, GradientHero, Badge, ACCENTS, type Accent,
} from '../../ui';
import { CaseProgressTracker } from '../../common/CaseProgressTracker';

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

// ─── Atalho rápido (padrão de acento do UI kit) ──────────────────────────────

function QuickActionButton({
  icon, label, color, onClick,
}: {
  icon: string;
  label: string;
  color: Accent;
  onClick: () => void;
}) {
  const c = ACCENTS[color];
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-2xl border ${c.bg} ${c.border} ${c.text} transition-all duration-200 hover:scale-[1.02] active:scale-95 w-full text-left`}
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
      <div className="animate-fade-in space-y-6">
        <SectionHeader
          emoji="🏠"
          title={`${getGreeting()}, ${user.name ?? user.email.split('@')[0]}`}
          subtitle="Comece sua jornada jurídica"
        />
        <Card className="flex flex-col items-center justify-center gap-5 text-center py-12">
          <div className="text-7xl">⚖️</div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Comece sua jornada jurídica</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">Encontre o advogado ideal para resolver seu caso</p>
          </div>
          <button
            onClick={onGoToBuscar}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-violet-500/20"
          >
            🔍 Buscar Advogados
          </button>
          <div className="w-full max-w-md grid grid-cols-2 gap-3">
            <QuickActionButton icon="⚖️" label="Buscar Advogados" color="blue" onClick={onGoToBuscar} />
            <QuickActionButton icon="💼" label="Contratar Serviço" color="emerald" onClick={onGoToServicos} />
          </div>
        </Card>
      </div>
    );
  }

  // ── Full Dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-6">

      {/* 1. Header de Boas-vindas */}
      <SectionHeader
        emoji="🏠"
        title={`${getGreeting()}, ${user.name ?? user.email.split('@')[0]} 👋`}
        subtitle="Aqui está tudo sobre sua vida jurídica hoje"
        actions={<Badge color="violet">Perfil {profilePct}%</Badge>}
      />

      {/* Barra de completude do perfil */}
      <Card className="!p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Completude do perfil</span>
          <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{profilePct}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-[#2A2545] rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700"
            style={{ width: `${profilePct}%` }}
          />
        </div>
        {profilePct < 100 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            Complete seu perfil para uma melhor experiência
          </p>
        )}
      </Card>

      {/* 2. KPI Cards — mesmo componente do painel do Advogado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon="⚖️"
          label="Casos Ativos"
          value={String(activeCasesCount)}
          sub={activeCasesCount === 1 ? '1 processo em andamento' : `${activeCasesCount} processos`}
          color="violet"
        />
        <KpiCard
          icon="📅"
          label="Consultas Agendadas"
          value={String(confirmedFutureAppointments.length)}
          sub={nextAppointment ? `Próxima: ${getCountdownLabel(nextAppointment.date)}` : 'Nenhuma agendada'}
          color="blue"
        />
        <KpiCard
          icon="📎"
          label="Docs Pendentes"
          value={String(pendingDocuments)}
          sub={pendingDocuments > 0 ? 'Ação necessária' : 'Tudo em dia'}
          color="amber"
        />
        <KpiCard
          icon="🗓️"
          label="Próx. Vencimento"
          value={nextDeadline ?? '—'}
          sub={nextDeadline ? 'em 15 dias' : 'Sem vencimentos'}
          color="rose"
        />
      </div>

      {/* 3. Card do Advogado — mesmo GradientHero do painel do Advogado */}
      {activeCase && (
        <GradientHero
          title={lawyerName}
          subtitle={activeCase.title}
          action={
            <Badge color="violet" solid className="!bg-white/20">Seu Advogado</Badge>
          }
        >
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-shrink-0">
              <img
                src={lawyerImgError ? 'https://i.pravatar.cc/80?u=fallback' : lawyerPhoto}
                alt={lawyerName}
                onError={() => setLawyerImgError(true)}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/50"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-400 w-3.5 h-3.5 rounded-full border-2 border-violet-800" />
            </div>
            <div className="flex-1 min-w-0 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3.5">
              <p className="text-xs text-violet-200 font-medium mb-1">Próxima ação necessária</p>
              <p className="text-sm text-white mb-2">📎 Falta anexar comprovante de residência</p>
              <button
                onClick={onGoToLawyer}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-all duration-200 font-bold"
              >
                Resolver agora →
              </button>
            </div>
          </div>
          <button
            onClick={onGoToLawyer}
            className="mt-4 w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 rounded-xl border border-white/20 transition-all text-sm"
          >
            💬 Mensagem Rápida
          </button>
        </GradientHero>
      )}

      {/* 4. Linha do Tempo Visual do Processo — componente único da plataforma */}
      {activeCase && activeCase.stages && activeCase.stages.length > 0 && (
        <Card>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">📋 Progresso do Processo</h3>
          <CaseProgressTracker
            stages={activeCase.stages.map(s => ({ ...s, name: STAGE_NAME_MAP[s.name] ?? s.name }))}
            showLegend
          />
        </Card>
      )}

      {/* 5. Próxima Consulta */}
      {nextAppointment && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">🗓️ Próxima Consulta</h3>
            <Badge color="emerald">✓ Confirmada</Badge>
          </div>

          <div className="flex items-start gap-4 mb-4">
            <div className="bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-900/30 rounded-xl p-3 text-center min-w-[60px]">
              <p className="text-2xl font-black text-violet-800 dark:text-violet-300 leading-none">
                {new Date(nextAppointment.date + 'T12:00:00').getDate()}
              </p>
              <p className="text-xs text-violet-500 dark:text-violet-400 uppercase mt-0.5">
                {new Date(nextAppointment.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 dark:text-white font-semibold text-sm capitalize">
                {formatDatePtBR(nextAppointment.date)}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">⏰ {nextAppointment.time}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                {nextAppointment.modality === 'Videochamada' ? '🎥 Videochamada' : '🏢 Presencial'}
              </p>
              <div className="mt-2">
                <Badge color="blue">📅 {getCountdownLabel(nextAppointment.date)}</Badge>
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
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-sm text-sm flex items-center justify-center gap-2"
            >
              🎥 Entrar na Videochamada
            </button>
          )}
        </Card>
      )}

      {/* 6. Atalhos Rápidos */}
      <div>
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Atalhos Rápidos
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickActionButton icon="💬" label="Falar com meu Advogado" color="violet" onClick={onGoToLawyer} />
          <QuickActionButton icon="⚖️" label="Buscar Advogados" color="blue" onClick={onGoToBuscar} />
          <QuickActionButton icon="🔍" label="Ver Meus Processos" color="amber" onClick={onGoToProcessos} />
          <QuickActionButton icon="💼" label="Contratar Serviço" color="emerald" onClick={onGoToServicos} />
        </div>
      </div>
    </div>
  );
};
