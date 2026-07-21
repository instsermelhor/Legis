import React from 'react';
import { CARD } from './theme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** desativa o padding padrão p-5 */
  noPadding?: boolean;
  onClick?: () => void;
}

/** Card padrão da plataforma — identidade do módulo Advogado. */
export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false, onClick }) => (
  <div className={`${CARD} ${noPadding ? '' : 'p-5'} ${className}`} onClick={onClick}>
    {children}
  </div>
);
