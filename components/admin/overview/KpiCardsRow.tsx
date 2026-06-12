import React from 'react';
import { MOCK_KPIS, calcMoM, type KpiMetric } from './adminMockKpis';

// ─── Color maps ───────────────────────────────────────────────────────────────
const BG_MAP: Record<KpiMetric['color'], string> = {
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700',
  blue:    'bg-blue-50    dark:bg-blue-900/20    border-blue-200    dark:border-blue-700',
  violet:  'bg-violet-50  dark:bg-violet-900/20  border-violet-200  dark:border-violet-700',
  amber:   'bg-amber-50   dark:bg-amber-900/20   border-amber-200   dark:border-amber-700',
  rose:    'bg-rose-50    dark:bg-rose-900/20    border-rose-200    dark:border-rose-700',
  indigo:  'bg-indigo-50  dark:bg-indigo-900/20  border-indigo-200  dark:border-indigo-700',
};
const ICON_BG_MAP: Record<KpiMetric['color'], string> = {
  emerald: 'bg-emerald-100 dark:bg-emerald-800/50',
  blue:    'bg-blue-100    dark:bg-blue-800/50',
  violet:  'bg-violet-100  dark:bg-violet-800/50',
  amber:   'bg-amber-100   dark:bg-amber-800/50',
  rose:    'bg-rose-100    dark:bg-rose-800/50',
  indigo:  'bg-indigo-100  dark:bg-indigo-800/50',
};
const VALUE_MAP: Record<KpiMetric['color'], string> = {
  emerald: 'text-emerald-700 dark:text-emerald-300',
  blue:    'text-blue-700    dark:text-blue-300',
  violet:  'text-violet-700  dark:text-violet-300',
  amber:   'text-amber-700   dark:text-amber-300',
  rose:    'text-rose-700    dark:text-rose-300',
  indigo:  'text-indigo-700  dark:text-indigo-300',
};

// ─── Single KPI Card ──────────────────────────────────────────────────────────
const KpiCard: React.FC<{ kpi: KpiMetric }> = ({ kpi }) => {
  const mom = calcMoM(kpi.rawValue, kpi.prevValue);
  // For churn, lower is better → flip positive/negative
  const isChurn = kpi.label === 'Churn Rate';
  const isPositive = isChurn ? !mom.positive : mom.positive;

  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow ${BG_MAP[kpi.color]}`}>
      {/* Header: icon + MoM badge */}
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${ICON_BG_MAP[kpi.color]}`}>
          {kpi.icon}
        </div>
        {/* MoM variation badge */}
        <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
          isPositive
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
        }`}>
          {isPositive ? '↑' : '↓'} {mom.pct}%
        </span>
      </div>

      {/* Value */}
      <div>
        <p className={`text-2xl font-extrabold leading-tight tracking-tight ${VALUE_MAP[kpi.color]}`}>
          {kpi.value}
        </p>
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-0.5">{kpi.label}</p>
        {kpi.description && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{kpi.description}</p>
        )}
      </div>

      {/* MoM context */}
      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        vs. mês anterior
      </p>
    </div>
  );
};

// ─── KPI Cards Row ────────────────────────────────────────────────────────────
export const KpiCardsRow: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
    {MOCK_KPIS.map((kpi) => (
      <KpiCard key={kpi.label} kpi={kpi} />
    ))}
  </div>
);
