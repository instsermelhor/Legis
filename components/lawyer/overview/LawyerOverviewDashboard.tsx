/**
 * LawyerOverviewDashboard.tsx
 * Dashboard Gerencial do Painel do Advogado — dados reais da API:
 * processos, fluxo de caixa (financeiro/resumo), agenda do dia e prazos.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import type { Lawyer, Case } from '../../../types';
import { backend, type ProcessoApi, type ResumoFinanceiroApi, type EventoAgendaApi } from '../../../services/modules';
import { KpiCard, ChartTooltip, SectionHeader, LivePill, GradientHero, HeroButton } from '../../ui';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const hojeIso = () => new Date().toISOString().split('T')[0];
const emDiasIso = (dias: number) => {
  const d = new Date(); d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
};

// ─── Agenda do Dia Widget ─────────────────────────────────────────────────────
const TIPO_COLORS = {
  audiencia: { dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', icon: '⚖️' },
  consulta:  { dot: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', icon: '🗣️' },
  reuniao:   { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: '👥' },
  prazo:     { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: '⏰' },
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
  const [processos, setProcessos] = useState<ProcessoApi[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiroApi | null>(null);
  const [agendaHoje, setAgendaHoje] = useState<EventoAgendaApi[]>([]);
  const [prazos, setPrazos] = useState<EventoAgendaApi[]>([]);

  useEffect(() => {
    backend.processos.listar().then(setProcessos).catch(() => setProcessos([]));
    backend.financeiro.resumo().then(setResumo).catch(() => setResumo(null));
    backend.agenda.listar({ de: hojeIso(), ate: hojeIso(), escopo: 'tenant' })
      .then(setAgendaHoje).catch(() => setAgendaHoje([]));
    // Prazos da semana (eventos tipo "prazo" nos próximos 7 dias).
    backend.agenda.listar({ de: hojeIso(), ate: emDiasIso(7), escopo: 'tenant' })
      .then(eventos => setPrazos(eventos.filter(e => e.tipo === 'prazo')))
      .catch(() => setPrazos([]));
  }, []);

  // Fluxo de caixa: recebido vs. em aberto, direto do agregado SQL.
  const cashflowData = useMemo(() => {
    return (resumo?.por_mes ?? []).map(m => ({
      month: MESES[Number(m.mes.split('-')[1]) - 1],
      recebido: m.recebido,
      aberto: m.aberto,
    }));
  }, [resumo]);

  // KPIs
  const mesAtual = hojeIso().slice(0, 7);
  const receitaMes = resumo?.por_mes.find(m => m.mes === mesAtual)?.recebido ?? 0;
  const receitaMesAnterior = resumo?.por_mes.at(-2)?.recebido ?? 0;
  const momRevenue = receitaMesAnterior > 0
    ? Math.round(((receitaMes - receitaMesAnterior) / receitaMesAnterior) * 100)
    : 0;

  const processosAtivos = processos.filter(p => p.status === 'Em Andamento').length;
  const concluidos = processos.filter(p => p.status === 'Concluído').length;
  const taxaExito = processos.length > 0 ? Math.round((concluidos / processos.length) * 100) : 0;

  const horasAte = (iso: string) =>
    Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 3_600_000));
  const prazosUrgentes = prazos.filter(p => horasAte(p.inicio) <= 48).length;

  const donutData = [
    { name: 'Em Andamento', value: processos.filter(p => p.status === 'Em Andamento').length },
    { name: 'Concluídos', value: concluidos },
    { name: 'Aguardando Doc.', value: processos.filter(p => p.status === 'Aguardando Documentação').length },
  ].filter(d => d.value > 0);

  const todayStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  const horaDe = (iso: string) =>
    new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <SectionHeader
        emoji="📊"
        title="Visão Geral — Central do Escritório"
        subtitle={todayStr}
        actions={<LivePill label="Escritório Ativo" />}
      />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon="💰"
          label="Faturamento do Mês"
          value={fmt(receitaMes)}
          sub="Honorários recebidos"
          trend={momRevenue}
          color="violet"
        />
        <KpiCard
          icon="⚖️"
          label="Processos Ativos"
          value={String(processosAtivos)}
          sub={`${processos.length} total na carteira`}
          color="emerald"
        />
        <KpiCard
          icon="⏰"
          label="Prazos Fatais / Semana"
          value={String(prazosUrgentes)}
          sub="Prazos < 48h"
          color="amber"
        />
        <KpiCard
          icon="🏆"
          label="Taxa de Êxito"
          value={`${taxaExito}%`}
          sub="Processos concluídos"
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
              <p className="text-xs text-gray-400 dark:text-gray-500">Honorários recebidos vs. valores em aberto</p>
            </div>
            <button
              onClick={onNavigateToFinancial}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
            >
              Ver completo →
            </button>
          </div>
          {cashflowData.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-16">
              Sem lançamentos financeiros ainda. Lance honorários em um processo para ver o fluxo de caixa.
            </p>
          ) : (
            <>
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
                  <Tooltip content={<ChartTooltip formatter={v => fmt(v)} nameFormatter={n => (n === 'recebido' ? 'Recebido' : 'Em aberto')} />} />
                  <Area type="monotone" dataKey="recebido" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gradHon)" dot={false} activeDot={{ r: 4, fill: '#8b5cf6' }} />
                  <Area type="monotone" dataKey="aberto" stroke="#f43f5e" strokeWidth={2} fill="url(#gradCus)" dot={false} activeDot={{ r: 4, fill: '#f43f5e' }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center">
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-1.5 rounded bg-violet-500 inline-block" /> Recebido</span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-1.5 rounded bg-rose-500 inline-block" /> Em aberto</span>
              </div>
            </>
          )}
        </div>

        {/* Distribuição de Processos (Donut) */}
        <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Carteira de Processos</h3>
            <button onClick={onNavigateToGestao} className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">Ver →</button>
          </div>
          {donutData.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-14">Nenhum processo cadastrado.</p>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* ── Grid: Agenda + Prazos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Widget de Agenda do Dia */}
        <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">📅 Agenda de Hoje</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">{agendaHoje.length} compromissos</span>
          </div>
          {agendaHoje.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Nenhum compromisso hoje.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gray-100 dark:bg-[#2A2545]" />
              <div className="space-y-4">
                {agendaHoje.map(item => {
                  const tc = TIPO_COLORS[item.tipo] ?? TIPO_COLORS.reuniao;
                  return (
                    <div key={item.id} className="flex gap-3 relative">
                      <div className={`w-9 h-9 ${tc.dot} rounded-full flex items-center justify-center text-white text-sm shrink-0 shadow-sm z-10`}>
                        {tc.icon}
                      </div>
                      <div className="flex-1 min-w-0 pb-3 border-b border-gray-50 dark:border-[#2A2545] last:border-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-gray-800 dark:text-white">{horaDe(item.inicio)}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${tc.badge}`}>
                            {item.tipo}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{item.titulo}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          {[item.pessoa_nome, item.local ?? item.processo_numero].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Painel de Prazos Urgentes */}
        <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
              🚨 Prazos da Semana
              {prazosUrgentes > 0 && (
                <span className="px-2 py-0.5 text-[9px] font-black bg-rose-600 text-white rounded-full animate-pulse">
                  {prazosUrgentes} URGENTE
                </span>
              )}
            </h3>
            <span className="text-xs text-gray-400">Próximos 7 dias</span>
          </div>
          {prazos.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              Nenhum prazo cadastrado. Registre prazos na agenda com o tipo "prazo".
            </p>
          ) : (
            <div className="space-y-3">
              {prazos.map(item => {
                const horas = horasAte(item.inicio);
                const urgente = horas <= 48;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl p-3.5 border ${
                      urgente
                        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                        : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-xs font-black ${urgente ? 'text-rose-800 dark:text-rose-300' : 'text-amber-800 dark:text-amber-300'}`}>
                          {urgente && <span className="animate-pulse mr-1">⚡</span>}
                          {item.titulo}
                        </p>
                        {item.local && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{item.local}</p>}
                        {item.processo_numero && (
                          <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mt-0.5 truncate">Proc.: {item.processo_numero}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-sm font-black ${urgente ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
                          {horas}h
                        </p>
                        <p className={`text-[9px] ${urgente ? 'text-rose-500' : 'text-amber-500'}`}>restantes</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Resumo Rápido de Casos ── */}
      <GradientHero
        title="Seus Casos Recentes"
        subtitle="Acompanhe o status mais recente dos seus processos"
        action={<HeroButton onClick={onNavigateToCases}>Ver todos os casos →</HeroButton>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {processos.slice(0, 3).map(p => (
            <div key={p.id} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3.5">
              <p className="text-xs font-black text-white truncate">{p.nome}</p>
              <p className="text-[10px] text-violet-200 mt-0.5 truncate">👤 {p.cliente_nome ?? 'Sem cliente vinculado'}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="px-2 py-0.5 text-[9px] font-bold bg-white/20 text-white rounded-full">{p.status}</span>
                {p.tipo_processo && <span className="text-[9px] text-violet-300">{p.tipo_processo}</span>}
              </div>
            </div>
          ))}
          {processos.length === 0 && (
            <div className="col-span-3 text-center py-4 text-violet-200 text-sm">
              Nenhum processo ativo. Cadastre o primeiro na Gestão Jurídica.
            </div>
          )}
        </div>
      </GradientHero>

    </div>
  );
};
