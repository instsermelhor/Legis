import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-violet-600 text-white shadow-sm hover:bg-violet-700 disabled:opacity-40',
  secondary:
    'bg-white dark:bg-[#1A1730] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40',
  ghost:
    'text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-40',
  danger:
    'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 disabled:opacity-40',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
};

/** Botão padrão da plataforma — identidade do módulo Advogado. */
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', className = '', children, ...rest }) => (
  <button
    className={`inline-flex items-center justify-center gap-1.5 font-bold rounded-lg transition-all duration-150 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
