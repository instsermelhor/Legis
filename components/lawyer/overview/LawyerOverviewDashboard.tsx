/**
 * LawyerOverviewDashboard.tsx
 * Dashboard Gerencial do Painel do Advogado — Fase 1
 * KPI cards MoM, AreaChart Recharts (fluxo de caixa),
 * Widget de Agenda do Dia, Painel de Alertas Urgentes.
 */
import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import type { Lawyer, Case } from '../../../types';
import { mockProcessosService } from '../../../services/mockProcessosService';
import { dbFinancial } from '../../../services/dbService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// ─── Mock: Alertas de Intimações ──────────────────────────────────────────────
const MOCK_INTIMACOES = [
  { id: 'int1', tribunal: 'TJSP — 3ª Vara Cível', processo: '1005234-12.2024.8.26.0100', tipo: 'Intimação para Manifestação', prazoHoras: 32, urgente: true },
  { id: 'int2', tribunal: 'TRT 15ª Região', processo: '0012556-44.2023.5.15.0001', tipo: 'Publicação de Sentença', prazoHoras: 47, urgente: true },
  { id: 'int3', tribunal: 'PJe — Vara do Trabalho', processo: '0089123-11.2024.5.15.0023', tipo: 'Pauta de Audiência', prazoHoras: 72, urgente: false },
];

// ─── Mock: Agenda do Dia ──────────────────────────────────────────────────────
const MOCK_AGENDA_HOJE = [
  { id: 'ag1', hora: '09:00', titulo: 'Audiência de Conciliação', cliente: 'Ana Clara Dias', local: 'TJSP — 3ª Vara Cível', tipo: 'audiencia' as const },
  { id: 'ag2', hora: '11:30', titulo: 'Consulta Inicial', cliente: 'Marcos Vieira', local: 'Videochamada (Zoom)', tipo: 'consulta' as const },
  { id: 'ag3', hora: '14:00', titulo: 'Reunião com Perito', cliente: 'Roberto Martins', local: 'Escritório', tipo: 'reuniao' as const },
  { id: 'ag4', hora: '16:30', titulo: 'Depoimento de Testemunha', cliente: 'Sofia Pereira', local: 'TRT 15ª — Sala 4', tipo: 'audiencia' as const },
];

// ─── Cashflow Mock Data ────────────────────────────────────────────────────────
function buildCashflowData(lawyerId: number) {
  const txs = dbFinancial.getAll(lawyerId);
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthTxs = txs.filter(t => t.date.startsWith(key));
    const honorarios = monthTxs.filter(t => t.status === 'recebido').reduce((s, t) => s + t.amount, 0);
    // Simular custas processuais (20-35% dos honorários + variance)
    const custas = Math.round(honorarios * (0.20 + Math.random() * 0.15));
    return {
      month: MONTHS[d.getMonth()],
      honorarios: honorarios || Math.round(8000 + Math.random() * 12000),
      custas: custas || Math.round(2000 + Math.random() * 4000),
    };
  });
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  trend?: number;    // % MoM
  color: 'violet' | 'emerald' | 'amber' | 'rose';
}

const COLOR_MAP = {
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    border: 'border-violet-100 dark:border-violet-900/30',
    text: 'text-violet-800 dark:text-violet-300',
    sub: 'text-violet-500 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-100 dark:border-emerald-900/30',
    text: 'text-emerald-800 dark:text-emerald-300',
    sub: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-100 dark:border-amber-900/30',
    text: 'text-amber-800 dark:text-amber-300',
    sub: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    border: 'border-rose-100 dark:border-rose-900/30',
    text: 'text-rose-800 dark:text-rose-300',
    sub: 'text-rose-500 dark:text-rose-400',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
  },
};

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, sub, trend, color }) => {
  const c = COLOR_MAP[color];
  const isPositive = trend !== undefined && trend >= 0;
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-200`}>
      <div className={`w-10 h-10 ${c.iconBg} rounded-xl flex items-center justify-center text-xl mb-3`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-black ${c.text} mt-1`}>{value}</p>
      {sub && <p className={`text-xs ${c.sub} mt-0.5`}>{sub}</p>}
      {trend !== undefined && (
        <div className={`absolute top-4 right-4 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-500 dark:text-gray-400">{p.name === 'honorarios' ? 'Honorários' : 'Custas'}:</span>
          <span className="font-bold text-gray-800 dark:text-white">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Agenda do Dia Widget ─────────────────────────────────────────────────────
const TIPO_COLORS = {
  audiencia: { dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', icon: '⚖️' },
  consulta:  { dot: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', icon: '🗣️' },
  reuniao:   { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: '👥' },
};

// ─── Distribuição de Processos (Donut) ────────────────────────────────────────
const DONUT_COLORS = ['#8b5cf6', '#10b981', '#f59e0b'];

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  lawyer: Lawyer;
  cases: Case[];
  onNavigateToFinancial: () => void;
  onNavigateToCases: () => void;
  onNavigateToGestao: () => void;
}

export const LawyerOverviewDashboard: React.FC<Props> = ({
  lawyer, cases, onNavigateToFinancial, onNavigateToCases, onNavigateToGestao
}) => {

  const processos = useMemo(() =>
    mockProcessosService.getProcessos().filter(p => p.advogado === lawyer.name),
    [lawyer.name]
  );

  const cashflowData = useMemo(() => buildCashflowData(lawyer.id), [lawyer.id]);

  // KPI calculations
  const currentMonthRevenue = useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return dbFinancial.getAll(lawyer.id)
      .filter(t => t.status === 'recebido' && t.date.startsWith(key))
      .reduce((s, t) => s + t.amount, 0);
  }, [lawyer.id]);

  const lastMonthRevenue = useMemo(() => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return dbFinancial.getAll(lawyer.id)
      .filter(t => t.status === 'recebido' && t.date.startsWith(key))
      .reduce((s, t) => s + t.amount, 0);
  }, [lawyer.id]);

  const momRevenue = lastMonthRevenue > 0
    ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0;

  // Processos ativos
  const processosAtivos = processos.filter(p => p.status === 'Em Andamento').length;

  // Prazos fatais da semana (mock — 2 intimações urgentes < 48h)
  const prazosUrgentes = MOCK_INTIMACOES.filter(i => i.prazoHoras <= 48).length;

  // Taxa de êxito
  const concluidos = processos.filter(p => p.status === 'Concluído').length;
  const taxaExito = processos.length > 0 ? Math.round((concluidos / processos.length) * 100) : 0;

  // Donut data
  const donutData = [
    { name: 'Em Andamento', value: processos.filter(p => p.status === 'Em Andamento').length || 5 },
    { name: 'Concluídos', value: processos.filter(p => p.status === 'Concluído').length || 8 },
    { name: 'Aguardando Doc.', value: processos.filter(p => p.status === 'Aguardando Documentação').length || 2 },
  ];

  const todayStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-[#2A2545] pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            📊 Visão Geral — Central do Escritório
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 capitalize mt-0.5">{todayStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Escritório Ativo
          </span>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon="💰"
          label="Faturamento do Mês"
          value={fmt(currentMonthRevenue || lawyer.monthlyRevenue || 0)}
          sub="Honorários recebidos"
          trend={momRevenue}
          color="violet"
        />
        <KpiCard
          icon="⚖️"
          label="Processos Ativos"
          value={String(processosAtivos || cases.length)}
          sub={`${processos.length} total na carteira`}
          trend={3}
          color="emerald"
        />
        <KpiCard
          icon="⏰"
          label="Prazos Fatais / Semana"
          value={String(prazosUrgentes)}
          sub="Intimações < 48h"
          trend={prazosUrgentes > 0 ? -20 : 0}
          color="amber"
        />
        <KpiCard
          icon="🏆"
          label="Taxa de Êxito"
          value={`${taxaExito || 78}%`}
          sub="Em sentenças concluídas"
          trend={5}
          color="rose"
        />
      </div>

      {/* ── Grid: Gráfico + Distribuição ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Fluxo de Caixa (AreaChart) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">Fluxo de Caixa — Últimos 6 Meses</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Honorários recebidos vs. Custas processuais</p>
            </div>
            <button
              onClick={onNavigateToFinancial}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
            >
              Ver completo →
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cashflowData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradHon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="honorarios" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gradHon)" dot={false} activeDot={{ r: 4, fill: '#8b5cf6' }} />
              <Area type="monotone" dataKey="custas" stroke="#f43f5e" strokeWidth={2} fill="url(#gradCus)" dot={false} activeDot={{ r: 4, fill: '#f43f5e' }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-1.5 rounded bg-violet-500 inline-block" /> Honorários</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-1.5 rounded bg-rose-500 inline-block" /> Custas</span>
          </div>
        </div>

        {/* Distribuição de Processos (Donut) */}
        <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Carteira de Processos</h3>
            <button onClick={onNavigateToGestao} className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">Ver →</button>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} processos`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {donutData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: DONUT_COLORS[i] }} />
                  <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                </span>
                <span className="font-bold text-gray-800 dark:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid: Agenda + Alertas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Widget de Agenda do Dia */}
        <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">📅 Agenda de Hoje</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">{MOCK_AGENDA_HOJE.length} compromissos</span>
          </div>
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gray-100 dark:bg-[#2A2545]" />
            <div className="space-y-4">
              {MOCK_AGENDA_HOJE.map((item) => {
                const tc = TIPO_COLORS[item.tipo];
                return (
                  <div key={item.id} className="flex gap-3 relative">
                    <div className={`w-9 h-9 ${tc.dot} rounded-full flex items-center justify-center text-white text-sm shrink-0 shadow-sm z-10`}>
                      {tc.icon}
                    </div>
                    <div className="flex-1 min-w-0 pb-3 border-b border-gray-50 dark:border-[#2A2545] last:border-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-gray-800 dark:text-white">{item.hora}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${tc.badge}`}>
                          {item.tipo}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{item.titulo}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{item.cliente} · {item.local}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Painel de Alertas Urgentes */}
        <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
              🚨 Alertas Urgentes
              {MOCK_INTIMACOES.filter(i => i.urgente).length > 0 && (
                <span className="px-2 py-0.5 text-[9px] font-black bg-rose-600 text-white rounded-full animate-pulse">
                  {MOCK_INTIMACOES.filter(i => i.urgente).length} URGENTE
                </span>
              )}
            </h3>
            <span className="text-xs text-gray-400">Intimações & prazos</span>
          </div>
          <div className="space-y-3">
            {MOCK_INTIMACOES.map(item => (
              <div
                key={item.id}
                className={`rounded-xl p-3.5 border ${
                  item.urgente
                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-xs font-black ${item.urgente ? 'text-rose-800 dark:text-rose-300' : 'text-amber-800 dark:text-amber-300'}`}>
                      {item.urgente && <span className="animate-pulse mr-1">⚡</span>}
                      {item.tipo}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{item.tribunal}</p>
                    <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mt-0.5 truncate">Proc.: {item.processo}</p>
                  </div>
                  <div className={`shrink-0 text-right`}>
                    <p className={`text-sm font-black ${item.urgente ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
                      {item.prazoHoras}h
                    </p>
                    <p className={`text-[9px] ${item.urgente ? 'text-rose-500' : 'text-amber-500'}`}>restantes</p>
                  </div>
                </div>
                <button className={`mt-2 text-[10px] font-bold underline ${item.urgente ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  Responder Intimação →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Resumo Rápido de Casos ── */}
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 dark:from-violet-900 dark:to-[#12102A] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold">Seus Casos Recentes</h3>
            <p className="text-sm text-violet-200 mt-0.5">Acompanhe o status mais recente dos seus processos</p>
          </div>
          <button
            onClick={onNavigateToCases}
            className="shrink-0 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold rounded-xl border border-white/20 transition-all"
          >
            Ver todos os casos →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {cases.slice(0, 3).map((c) => (
            <div key={c.id} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3.5">
              <p className="text-xs font-black text-white truncate">{c.title}</p>
              <p className="text-[10px] text-violet-200 mt-0.5 truncate">👤 {c.clientName}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="px-2 py-0.5 text-[9px] font-bold bg-white/20 text-white rounded-full">{c.status}</span>
                {c.group && <span className="text-[9px] text-violet-300">{c.group}</span>}
              </div>
            </div>
          ))}
          {cases.length === 0 && (
            <div className="col-span-3 text-center py-4 text-violet-200 text-sm">
              Nenhum caso ativo. Cadastre seu primeiro caso em "Meus Casos".
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
