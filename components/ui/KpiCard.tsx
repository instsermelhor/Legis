import React from 'react';
import { ACCENTS, type Accent } from './theme';

export interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  /** variação % MoM — renderiza pill de tendência */
  trend?: number;
  /** contador de pendências — renderiza bolinha vermelha no canto */
  badge?: number;
  color?: Accent;
  onClick?: () => void;
}

/**
 * KPI Card padrão — extraído do LawyerOverviewDashboard.
 * Fundo tintado por acento, ícone em quadrado arredondado,
 * label uppercase tracking-widest, valor font-black, pill de tendência.
 */
export const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, sub, trend, badge, color = 'violet', onClick }) => {
  const c = ACCENTS[color];
  const isPositive = trend !== undefined && trend >= 0;
  return (
    <div
      onClick={onClick}
      className={`${c.bg} border ${c.border} rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-200 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`w-10 h-10 ${c.iconBg} rounded-xl flex items-center justify-center text-xl mb-3`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-black ${c.text} mt-1`}>{value}</p>
      {sub && <p className={`text-xs ${c.sub} mt-0.5`}>{sub}</p>}
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center bg-rose-500 text-white text-[9px] font-black rounded-full">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      {trend !== undefined && (
        <div className={`absolute top-4 right-4 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};
