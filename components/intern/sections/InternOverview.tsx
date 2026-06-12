/**
 * InternOverview.tsx
 * Visão Geral do Painel do Bacharelando — Dashboard Central Analítico
 * KPIs: CR/IRA, Horas Complementares, Horas de Estágio (cronômetro),
 *       Casos Vinculados, Widget OAB Countdown, Agenda de Prazos Híbrida,
 *       Gráfico de Evolução de Notas por Semestre.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Intern, Case } from '../../../types';
import type { Lawyer } from '../../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgendaItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'prova' | 'praca_peca' | 'audiencia' | 'prazo' | 'evento';
  subject?: string;
  caseRef?: string;
  priority: 'alta' | 'media' | 'baixa';
}

interface OabSimulado {
  id: string;
  date: string;
  area: string;
  total: number;
  corretas: number;
  pct: number;
}

// ─── Mock Agenda Items ────────────────────────────────────────────────────────

const MOCK_AGENDA: AgendaItem[] = [
  { id: 'a1', title: 'Prova — Direito Civil V', date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], type: 'prova', subject: 'Direito Civil V (Família)', priority: 'alta' },
  { id: 'a2', title: 'Entrega: Petição Inicial (Rascunho)', date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], type: 'praca_peca', caseRef: 'Caso #001', priority: 'alta' },
  { id: 'a3', title: 'Prova — Direito do Trabalho II', date: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0], type: 'prova', subject: 'Direito do Trabalho II', priority: 'media' },
  { id: 'a4', title: 'Audiência de Instrução — Acompanhamento', date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0], type: 'audiencia', caseRef: 'Caso #002', priority: 'media' },
  { id: 'a5', title: 'Prazo: Contestação (revisão final)', date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0], type: 'prazo', caseRef: 'Caso #001', priority: 'alta' },
  { id: 'a6', title: 'Seminário de Ética Profissional', date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0], type: 'evento', priority: 'baixa' },
];

const MOCK_SIMULADOS: OabSimulado[] = [
  { id: 's1', date: '2024-11-15', area: 'Direito Civil', total: 30, corretas: 22, pct: 73 },
  { id: 's2', date: '2024-11-22', area: 'Direito Penal', total: 30, corretas: 18, pct: 60 },
  { id: 's3', date: '2024-11-29', area: 'Dir. Processual', total: 30, corretas: 25, pct: 83 },
  { id: 's4', date: '2024-12-06', area: 'Ética OAB', total: 20, corretas: 16, pct: 80 },
];

// ─── OAB Exam Dates ───────────────────────────────────────────────────────────
// Próxima fase do Exame de Ordem (data simulada)
const NEXT_OAB_DATE = new Date('2025-08-10T08:00:00');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DETAILED_SEMESTERS = [
  '1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre', '5º Semestre',
  '6º Semestre', '7º Semestre', '8º Semestre', '9º Semestre', '10º Semestre',
];

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatCountdown(targetDate: Date): { days: number; hours: number; minutes: number } {
  const now = new Date();
  const diff = Math.max(0, targetDate.getTime() - now.getTime());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  };
}

function getAgendaTypeMeta(type: AgendaItem['type']) {
  switch (type) {
    case 'prova': return { icon: '📝', label: 'Prova', color: 'bg-red-100 text-red-700 border-red-200' };
    case 'praca_peca': return { icon: '📄', label: 'Peça', color: 'bg-violet-100 text-violet-700 border-violet-200' };
    case 'audiencia': return { icon: '⚖️', label: 'Audiência', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    case 'prazo': return { icon: '⏰', label: 'Prazo', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    case 'evento': return { icon: '📅', label: 'Evento', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  }
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

const KpiCard: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  colorClass: string;
  textClass: string;
}> = ({ icon, label, value, sub, colorClass, textClass }) => (
  <div className={`${colorClass} border rounded-2xl p-4 flex flex-col gap-2`}>
    <div className="flex items-center gap-2">
      <span className="text-xl">{icon}</span>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
    <p className={`text-2xl font-black ${textClass}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </div>
);

// ─── Internship Hours Timer ───────────────────────────────────────────────────

const InternshipTimerWidget: React.FC<{ internId: number | string }> = ({ internId }) => {
  const storageKey = `legis_intern_timer_${internId}`;
  const [elapsed, setElapsed] = useState<number>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved).elapsed || 0 : 0;
  });
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          localStorage.setItem(storageKey, JSON.stringify({ elapsed: next }));
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, storageKey]);

  const totalHours = Math.floor(elapsed / 3600);
  const weeklyGoal = 20; // horas semanais
  const pct = Math.min(100, Math.round((totalHours / weeklyGoal) * 100));

  const resetTimer = () => {
    setElapsed(0);
    setRunning(false);
    localStorage.setItem(storageKey, JSON.stringify({ elapsed: 0 }));
  };

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          ⏱️ Cronômetro de Estágio
        </h4>
        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-black/20 px-2 py-1 rounded-lg">
          Meta: {weeklyGoal}h/semana
        </span>
      </div>

      {/* Timer display */}
      <div className="flex items-center justify-center">
        <div className={`text-4xl font-black font-mono tracking-widest px-6 py-4 rounded-2xl ${running ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-black/20'}`}>
          {formatDuration(elapsed)}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{totalHours}h cumpridas esta semana</span>
          <span className={pct >= 100 ? 'text-emerald-600 font-bold' : 'text-indigo-600'}>{pct}% da meta</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-black/20 rounded-full h-2.5">
          <div className={`${pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'} h-2.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setRunning(r => !r)}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${running ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
        >
          {running ? '⏸ Pausar' : '▶ Iniciar'}
        </button>
        <button
          onClick={resetTimer}
          className="px-4 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 dark:bg-black/20 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-black/30 transition-all"
          title="Resetar cronômetro"
        >
          ↺
        </button>
      </div>
    </div>
  );
};

// ─── OAB Countdown Widget ─────────────────────────────────────────────────────

const OabCountdownWidget: React.FC = () => {
  const [countdown, setCountdown] = useState(() => formatCountdown(NEXT_OAB_DATE));

  useEffect(() => {
    const t = setInterval(() => setCountdown(formatCountdown(NEXT_OAB_DATE)), 60000);
    return () => clearInterval(t);
  }, []);

  const avgPct = MOCK_SIMULADOS.length > 0
    ? Math.round(MOCK_SIMULADOS.reduce((a, s) => a + s.pct, 0) / MOCK_SIMULADOS.length)
    : 0;

  const performanceColor = avgPct >= 70 ? 'text-emerald-600' : avgPct >= 50 ? 'text-amber-600' : 'text-red-600';
  const performanceBg = avgPct >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/20' : avgPct >= 50 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20';

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
        ⚖️ OAB Tracker — Próximo Exame
      </h4>

      {/* Countdown */}
      <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl p-4 text-white">
        <p className="text-xs font-semibold text-white/70 mb-2">🗓 Exame da Ordem — 1ª Fase · Aug 2025</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { value: countdown.days, label: 'Dias' },
            { value: countdown.hours, label: 'Horas' },
            { value: countdown.minutes, label: 'Min' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/20 rounded-xl py-2">
              <p className="text-2xl font-black">{value}</p>
              <p className="text-[10px] font-semibold text-white/70 uppercase">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Média de simulados */}
      <div className={`${performanceBg} rounded-xl p-3 flex items-center justify-between`}>
        <div>
          <p className="text-xs font-semibold text-gray-500">Média dos Simulados</p>
          <p className={`text-2xl font-black ${performanceColor}`}>{avgPct}%</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{MOCK_SIMULADOS.length} simulado(s)</p>
          <p className={`text-xs font-bold ${performanceColor}`}>
            {avgPct >= 70 ? '✅ Aprovado' : avgPct >= 50 ? '⚠️ Atenção' : '❌ Precisa estudar'}
          </p>
        </div>
      </div>

      {/* Histórico de simulados */}
      <div className="space-y-2">
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Histórico de Simulados</p>
        {MOCK_SIMULADOS.slice(-3).reverse().map(sim => (
          <div key={sim.id} className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 w-24 shrink-0">{sim.area}</span>
            <div className="flex-1 bg-gray-100 dark:bg-black/20 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full flex items-center justify-end pr-1.5 ${sim.pct >= 70 ? 'bg-emerald-500' : sim.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${sim.pct}%` }}
              >
                <span className="text-white text-[9px] font-bold">{sim.pct}%</span>
              </div>
            </div>
            <span className="text-[10px] text-gray-400 w-20 shrink-0 text-right">{sim.corretas}/{sim.total} certas</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Agenda Híbrida ───────────────────────────────────────────────────────────

const AgendaHibrida: React.FC<{ agendaItems?: AgendaItem[] }> = ({ agendaItems = MOCK_AGENDA }) => {
  const [filter, setFilter] = useState<'todos' | 'prova' | 'praca_peca' | 'prazo' | 'audiencia'>('todos');

  const filtered = agendaItems
    .filter(item => filter === 'todos' || item.type === filter)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">📅 Agenda de Prazos — Próximos 30 dias</h4>
        <div className="flex gap-1 flex-wrap">
          {(['todos', 'prova', 'praca_peca', 'prazo'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-black/20 text-gray-500 dark:text-gray-400 hover:bg-gray-200'}`}
            >
              {f === 'todos' ? 'Todos' : f === 'prova' ? '📝 Provas' : f === 'praca_peca' ? '📄 Peças' : '⏰ Prazos'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm">Nenhum prazo para este filtro</p>
          </div>
        ) : (
          filtered.map(item => {
            const meta = getAgendaTypeMeta(item.type);
            const daysUntil = getDaysUntil(item.date);
            const isUrgent = daysUntil <= 3;
            return (
              <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isUrgent ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30' : 'border-gray-100 dark:border-[#2A2545] hover:border-gray-200 dark:hover:border-indigo-900/40'}`}>
                <div className="text-xl shrink-0">{meta?.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${isUrgent ? 'text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'} truncate`}>{item.title}</p>
                  {(item.subject || item.caseRef) && (
                    <p className="text-[10px] text-gray-400 truncate">{item.subject || item.caseRef}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span className={`block text-xs font-bold ${isUrgent ? 'text-red-600' : daysUntil <= 7 ? 'text-amber-600' : 'text-gray-500'}`}>
                    {daysUntil === 0 ? 'Hoje!' : daysUntil === 1 ? 'Amanhã' : `${daysUntil}d`}
                  </span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${meta?.color}`}>{meta?.label}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─── Grade Evolution Chart (CSS bars) ────────────────────────────────────────

const GradeEvolutionChart: React.FC<{ grades: Record<string, Record<string, string>> }> = ({ grades }) => {
  const data = useMemo(() => DETAILED_SEMESTERS.map((sem, idx) => {
    const semGrades: string[] = grades[sem] ? (Object.values(grades[sem]) as string[]).filter((v: string) => v.trim()) : [];
    const avg = semGrades.length > 0 ? semGrades.reduce((a: number, b: string) => a + Number(b), 0) / semGrades.length : null;
    return { sem: `${idx + 1}°`, avg, count: semGrades.length };
  }), [grades]);

  const hasAny = data.some(d => d.avg !== null);

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">📊 Evolução Acadêmica por Semestre</h4>
        {!hasAny && <p className="text-xs text-gray-400">Lance notas no Mural de Estudos para ver o gráfico</p>}
      </div>
      <div className="flex items-end gap-2 h-32">
        {data.map(({ sem, avg }) => {
          const height = avg !== null ? Math.round((avg / 10) * 100) : 5;
          const color = avg === null ? 'bg-gray-200 dark:bg-gray-700' : avg >= 7 ? 'bg-emerald-500' : avg >= 5 ? 'bg-amber-500' : 'bg-red-500';
          return (
            <div key={sem} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] font-bold text-gray-500">{avg !== null ? avg.toFixed(1) : '—'}</span>
              <div className="w-full bg-gray-100 dark:bg-black/20 rounded-t-lg overflow-hidden" style={{ height: '80px' }}>
                <div
                  className={`${color} w-full rounded-t-lg transition-all duration-500`}
                  style={{ height: `${height}%`, marginTop: `${100 - height}%` }}
                />
              </div>
              <span className="text-[9px] text-gray-400 font-medium">{sem}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> ≥ 7.0</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> 5.0–6.9</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> {'< 5.0'}</span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface InternOverviewProps {
  intern: Intern;
  supervisorLawyer: Lawyer | null;
  delegatedCases: Case[];
  grades: Record<string, Record<string, string>>;
  courseDocs: Record<string, { name: string; fileType: string; size: string; date: string; docType: string; semester: string }[]>;
  onOpenSupervisor: () => void;
}

export const InternOverview: React.FC<InternOverviewProps> = ({
  intern,
  supervisorLawyer,
  delegatedCases,
  grades,
  courseDocs,
  onOpenSupervisor,
}) => {
  // CR/IRA calculado
  const crIra = useMemo(() => {
    const allGrades: number[] = (Object.values(grades) as Record<string, string>[])
      .flatMap(semGrades => Object.values(semGrades) as string[])
      .filter((v: string) => v.trim())
      .map(Number);
    return allGrades.length > 0 ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length) : null;
  }, [grades]);

  const totalGradedSubjects = useMemo(() =>
    (Object.values(grades) as Record<string, string>[]).flatMap(g => Object.values(g) as string[]).filter((v: string) => v.trim()).length,
    [grades]
  );
  const totalCourseDocs = Object.values(courseDocs).flat().length;
  const semesterNumber = parseInt(intern.semester?.match(/\d+/)?.[0] || '1', 10);
  const semesterProgress = Math.round((semesterNumber / 10) * 100);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon="🎓"
          label="Progresso do Curso"
          value={`${semesterNumber}°/10°`}
          sub={`Semestre — ${semesterProgress}% concluído`}
          colorClass="bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/40"
          textClass="text-indigo-700 dark:text-indigo-400"
        />
        <KpiCard
          icon="📈"
          label="CR / IRA"
          value={crIra !== null ? crIra.toFixed(2) : '—'}
          sub={totalGradedSubjects > 0 ? `${totalGradedSubjects} nota(s) lançada(s)` : 'Lance notas no Mural'}
          colorClass={`${crIra !== null ? crIra >= 7 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40' : crIra >= 5 ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40' : 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/40' : 'bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-700'}`}
          textClass={crIra !== null ? crIra >= 7 ? 'text-emerald-700 dark:text-emerald-400' : crIra >= 5 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400' : 'text-gray-400'}
        />
        <KpiCard
          icon="📋"
          label="Casos de Estágio"
          value={delegatedCases.length}
          sub={`${delegatedCases.filter(c => c.status === 'Ativo').length} ativo(s)`}
          colorClass="bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40"
          textClass="text-blue-700 dark:text-blue-400"
        />
        <KpiCard
          icon="⏰"
          label="Hs. Complementares"
          value={`${intern.hoursCompleted || 0}/200h`}
          sub={`${Math.round(((intern.hoursCompleted || 0) / 200) * 100)}% validado`}
          colorClass="bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/40"
          textClass="text-violet-700 dark:text-violet-400"
        />
      </div>

      {/* Progresso do Semestre */}
      <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">🎓 Progresso do Curso — 1° ao 10° Semestre</h4>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 flex gap-1 items-end h-8">
            {Array.from({ length: 10 }, (_, i) => {
              const completed = i + 1 < semesterNumber;
              const current = i + 1 === semesterNumber;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-all ${completed ? 'bg-indigo-500' : current ? 'bg-indigo-300 animate-pulse' : 'bg-gray-100 dark:bg-black/20'}`}
                  style={{ height: completed ? '100%' : current ? '70%' : '40%' }}
                  title={`${i + 1}° Semestre${completed ? ' (Concluído)' : current ? ' (Atual)' : ''}`}
                />
              );
            })}
          </div>
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 shrink-0">{semesterProgress}%</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>1° Semestre</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{intern.semester}</span>
          <span>10° Semestre</span>
        </div>

        {/* Info tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-[#2A2545] rounded-lg px-3 py-1.5">
            <span className="text-xs font-semibold text-gray-500">Universidade:</span>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-[140px]">{intern.university || '—'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-[#2A2545] rounded-lg px-3 py-1.5">
            <span className="text-xs font-semibold text-gray-500">Área de interesse:</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{intern.specialtyInterest || '—'}</span>
          </div>
          {totalCourseDocs > 0 && (
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-[#2A2545] rounded-lg px-3 py-1.5">
              <span className="text-xs font-semibold text-gray-500">📎</span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{totalCourseDocs} doc(s) do curso</span>
            </div>
          )}
        </div>
      </div>

      {/* Supervisor Banner */}
      {supervisorLawyer && (
        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-4 text-white flex items-center gap-4">
          <img src={supervisorLawyer.photoUrl} alt={supervisorLawyer.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">Estagiando em: Dr(a). {supervisorLawyer.name}</p>
            <p className="text-xs text-white/75">OAB {supervisorLawyer.oab} · {supervisorLawyer.specialties.slice(0, 2).join(', ')}</p>
          </div>
          <button onClick={onOpenSupervisor} className="shrink-0 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition-all">
            Ver Perfil
          </button>
        </div>
      )}

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InternshipTimerWidget internId={intern.id} />
        <OabCountdownWidget />
      </div>

      {/* Grade Evolution Chart */}
      <GradeEvolutionChart grades={grades} />

      {/* Agenda Híbrida */}
      <AgendaHibrida />
    </div>
  );
};
