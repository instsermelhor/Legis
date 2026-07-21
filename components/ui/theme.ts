/**
 * theme.ts — Identidade Visual Legis Connect
 * Extraída do módulo Advogado (LawyerDashboard / LawyerOverviewDashboard),
 * que é a referência canônica. TODOS os módulos (cliente, bacharel,
 * assistente/secretariado, administrativo) devem consumir estes tokens.
 */

/** Card padrão — branco / #1A1730 com borda #2A2545 (dark) */
export const CARD =
  'bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl shadow-sm';

export const CARD_PAD = `${CARD} p-5`;

/** Divisor de seção (header com border-b) */
export const DIVIDER = 'border-b border-gray-200 dark:border-[#2A2545]';

/** Campo de formulário padrão */
export const INPUT =
  'w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm ' +
  'bg-white dark:bg-[#1C1A32] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-500 transition-colors';

/** Label de formulário padrão */
export const LABEL =
  'block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1';

export type Accent = 'violet' | 'emerald' | 'amber' | 'rose' | 'blue' | 'teal' | 'indigo';

export interface AccentClasses {
  bg: string;
  border: string;
  text: string;
  sub: string;
  iconBg: string;
  badge: string;
  solid: string;
  dot: string;
}

/** Mapa de acentos — origem: COLOR_MAP do LawyerOverviewDashboard */
export const ACCENTS: Record<Accent, AccentClasses> = {
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    border: 'border-violet-100 dark:border-violet-900/30',
    text: 'text-violet-800 dark:text-violet-300',
    sub: 'text-violet-500 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    solid: 'bg-violet-600 text-white',
    dot: 'bg-violet-500',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-100 dark:border-emerald-900/30',
    text: 'text-emerald-800 dark:text-emerald-300',
    sub: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    solid: 'bg-emerald-600 text-white',
    dot: 'bg-emerald-500',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-100 dark:border-amber-900/30',
    text: 'text-amber-800 dark:text-amber-300',
    sub: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    solid: 'bg-amber-500 text-white',
    dot: 'bg-amber-500',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    border: 'border-rose-100 dark:border-rose-900/30',
    text: 'text-rose-800 dark:text-rose-300',
    sub: 'text-rose-500 dark:text-rose-400',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    solid: 'bg-rose-600 text-white',
    dot: 'bg-rose-500',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-100 dark:border-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300',
    sub: 'text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    solid: 'bg-blue-600 text-white',
    dot: 'bg-blue-500',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/20',
    border: 'border-teal-100 dark:border-teal-900/30',
    text: 'text-teal-800 dark:text-teal-300',
    sub: 'text-teal-500 dark:text-teal-400',
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    solid: 'bg-teal-600 text-white',
    dot: 'bg-teal-500',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/20',
    border: 'border-indigo-100 dark:border-indigo-900/30',
    text: 'text-indigo-800 dark:text-indigo-300',
    sub: 'text-indigo-500 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    solid: 'bg-indigo-600 text-white',
    dot: 'bg-indigo-500',
  },
};

/** Cores para gráficos (Recharts) — origem: LawyerOverviewDashboard */
export const CHART_COLORS = {
  primary: '#8b5cf6',
  positive: '#10b981',
  warning: '#f59e0b',
  negative: '#f43f5e',
  info: '#3b82f6',
  series: ['#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#14b8a6'],
};
