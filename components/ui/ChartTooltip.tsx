import React from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  /** formata o valor (ex.: moeda) */
  formatter?: (value: number, name: string) => string;
  /** traduz o nome da série */
  nameFormatter?: (name: string) => string;
}

/** Tooltip Recharts padrão — extraído do LawyerOverviewDashboard. */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label, formatter, nameFormatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-xl shadow-xl p-3 text-xs">
      {label && <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">{label}</p>}
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-500 dark:text-gray-400">{nameFormatter ? nameFormatter(p.name) : p.name}:</span>
          <span className="font-bold text-gray-800 dark:text-white">
            {formatter ? formatter(p.value, p.name) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};
