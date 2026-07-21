import React from 'react';
import { DIVIDER } from './theme';

interface SectionHeaderProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  /** conteúdo à direita (pills de status, botões, filtros) */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Cabeçalho de seção padrão — emoji + título bold, subtítulo cinza,
 * divisor inferior. Extraído do LawyerOverviewDashboard.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ emoji, title, subtitle, actions, className = '' }) => (
  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${DIVIDER} pb-4 ${className}`}>
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        {emoji && <span>{emoji}</span>}
        {title}
      </h2>
      {subtitle && <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

/** Pill "ao vivo" (ex.: Escritório Ativo / Sistema Online) */
export const LivePill: React.FC<{ label: string }> = ({ label }) => (
  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 px-3 py-1.5 rounded-full">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
    {label}
  </span>
);
