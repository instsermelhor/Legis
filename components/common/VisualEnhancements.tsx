/**
 * components/common/VisualEnhancements.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — PREMIUM UI VISUAL ENHANCEMENTS
 * Utilitários visuais: Toast Notification, Glass Containers, Status Badges
 * e Botões com gradiente e animações hover.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';

export interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  onClose?: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ type, title, message, onClose }) => {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const borderColors = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    error: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-slide-in flex items-start gap-3 max-w-md ${borderColors[type]}`}
      data-testid="toast-notification"
    >
      <span className="text-xl">{icons[type]}</span>
      <div className="flex-1">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{title}</h4>
        {message && <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-xs opacity-60 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
};

export const StatusBadge: React.FC<{ status: 'active' | 'pending' | 'suspended'; label?: string }> = ({
  status,
  label,
}) => {
  const styles = {
    active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    suspended: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  const defaultLabels = {
    active: '🟢 Ativo',
    pending: '⏳ Pendente',
    suspended: '🔴 Suspenso',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${styles[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {label || defaultLabels[status]}
    </span>
  );
};

export const GlassContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`p-6 rounded-3xl bg-white/75 dark:bg-[#151226]/75 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-xl hover-lift ${className}`}
  >
    {children}
  </div>
);
