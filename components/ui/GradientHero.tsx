import React from 'react';

interface GradientHeroProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  /** botão/ação à direita */
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Painel hero em gradiente violeta — extraído do bloco
 * "Seus Casos Recentes" do LawyerOverviewDashboard.
 * Substitui os banners indigo (bacharel) e verde (secretariado).
 */
export const GradientHero: React.FC<GradientHeroProps> = ({ title, subtitle, emoji, action, children, className = '' }) => (
  <div className={`bg-gradient-to-br from-violet-600 to-violet-800 dark:from-violet-900 dark:to-[#12102A] rounded-2xl p-6 text-white shadow-lg ${className}`}>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-base font-bold flex items-center gap-2">
          {emoji && <span className="text-xl">{emoji}</span>}
          {title}
        </h3>
        {subtitle && <p className="text-sm text-violet-200 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    {children}
  </div>
);

/** Botão translúcido para uso dentro do GradientHero. */
export const HeroButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...rest }) => (
  <button
    className={`shrink-0 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold rounded-xl border border-white/20 transition-all ${className}`}
    {...rest}
  >
    {children}
  </button>
);
