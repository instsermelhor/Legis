// ─── Mock KPI Data — Legis Connect Admin BI ──────────────────────────────────
// Production: replace these with API calls / React Query hooks

export interface KpiMetric {
  label: string;
  value: string;
  rawValue: number;
  prevValue: number;
  unit?: string;
  description?: string;
  color: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'indigo';
  icon: string;
}

export interface RevenueDataPoint {
  month: string;
  receita: number;
  custos: number;
  lucro: number;
}

export interface ServicesDayDataPoint {
  day: string;
  automacoes: number;
  pecas_ia: number;
  consultas: number;
}

export interface UserDistributionItem {
  name: string;
  value: number;
  color: string;
}

// ── KPI Cards (com variação MoM) ─────────────────────────────────────────────
export const MOCK_KPIS: KpiMetric[] = [
  {
    label: 'MRR',
    value: 'R$ 148.320',
    rawValue: 148320,
    prevValue: 131200,
    description: 'Receita Recorrente Mensal',
    color: 'emerald',
    icon: '💰',
  },
  {
    label: 'Usuários Ativos',
    value: '2.847',
    rawValue: 2847,
    prevValue: 2610,
    description: 'DAU médio do mês',
    color: 'blue',
    icon: '👥',
  },
  {
    label: 'Processos Ativos',
    value: '11.204',
    rawValue: 11204,
    prevValue: 10890,
    description: 'Monitorados em tempo real',
    color: 'violet',
    icon: '⚖️',
  },
  {
    label: 'Peças IA Geradas',
    value: '34.512',
    rawValue: 34512,
    prevValue: 29840,
    description: 'Volume mensal de peças jurídicas',
    color: 'indigo',
    icon: '🤖',
  },
  {
    label: 'Churn Rate',
    value: '2,4%',
    rawValue: 2.4,
    prevValue: 3.1,
    description: 'Taxa de cancelamento mensal',
    color: 'rose',
    icon: '📉',
  },
  {
    label: 'SLA de Robôs',
    value: '98,7%',
    rawValue: 98.7,
    prevValue: 97.2,
    description: 'Taxa de sucesso das automações',
    color: 'amber',
    icon: '🤖',
  },
];

// ── Revenue vs Costs — 12 months ─────────────────────────────────────────────
export const MOCK_REVENUE_DATA: RevenueDataPoint[] = [
  { month: 'Jun/24', receita: 72400,  custos: 31200, lucro: 41200  },
  { month: 'Jul/24', receita: 80100,  custos: 33800, lucro: 46300  },
  { month: 'Ago/24', receita: 88500,  custos: 35100, lucro: 53400  },
  { month: 'Set/24', receita: 94200,  custos: 38700, lucro: 55500  },
  { month: 'Out/24', receita: 101800, custos: 41200, lucro: 60600  },
  { month: 'Nov/24', receita: 109300, custos: 43800, lucro: 65500  },
  { month: 'Dez/24', receita: 118600, custos: 47500, lucro: 71100  },
  { month: 'Jan/25', receita: 122100, custos: 50200, lucro: 71900  },
  { month: 'Fev/25', receita: 129400, custos: 52800, lucro: 76600  },
  { month: 'Mar/25', receita: 135700, custos: 55400, lucro: 80300  },
  { month: 'Abr/25', receita: 141200, custos: 58100, lucro: 83100  },
  { month: 'Mai/25', receita: 148320, custos: 61400, lucro: 86920  },
];

// ── Services Volume by Day of Week ────────────────────────────────────────────
export const MOCK_SERVICES_BY_DAY: ServicesDayDataPoint[] = [
  { day: 'Seg', automacoes: 1420, pecas_ia: 890, consultas: 342 },
  { day: 'Ter', automacoes: 1890, pecas_ia: 1240, consultas: 421 },
  { day: 'Qua', automacoes: 2100, pecas_ia: 1580, consultas: 518 },
  { day: 'Qui', automacoes: 1980, pecas_ia: 1410, consultas: 489 },
  { day: 'Sex', automacoes: 1640, pecas_ia: 1120, consultas: 374 },
  { day: 'Sáb', automacoes: 680,  pecas_ia: 420,  consultas: 142 },
  { day: 'Dom', automacoes: 310,  pecas_ia: 180,  consultas: 68  },
];

// ── User Distribution ─────────────────────────────────────────────────────────
export const MOCK_USER_DISTRIBUTION: UserDistributionItem[] = [
  { name: 'Advogados Autônomos', value: 1240, color: '#7C3AED' },
  { name: 'Escritórios Médios',   value: 680,  color: '#2563EB' },
  { name: 'Bacharelandos',        value: 520,  color: '#0891B2' },
  { name: 'Secret./Assist.',      value: 270,  color: '#7E22CE' },
  { name: 'Depart. Corporativos', value: 137,  color: '#4F46E5' },
];

// ── Helper: calculate MoM variation ──────────────────────────────────────────
export function calcMoM(current: number, previous: number): { pct: number; positive: boolean } {
  if (previous === 0) return { pct: 0, positive: true };
  const pct = parseFloat(((current - previous) / previous * 100).toFixed(1));
  return { pct: Math.abs(pct), positive: pct >= 0 };
}
