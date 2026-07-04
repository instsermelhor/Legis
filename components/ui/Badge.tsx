import React from 'react';
import { ACCENTS, type Accent } from './theme';

interface BadgeProps {
  children: React.ReactNode;
  color?: Accent;
  /** versão sólida (fundo cheio) */
  solid?: boolean;
  className?: string;
}

/** Badge/pill padrão da plataforma. */
export const Badge: React.FC<BadgeProps> = ({ children, color = 'violet', solid = false, className = '' }) => {
  const c = ACCENTS[color];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${solid ? c.solid : c.badge} ${className}`}>
      {children}
    </span>
  );
};
