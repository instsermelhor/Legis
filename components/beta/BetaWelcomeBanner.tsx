import React, { useState, useEffect } from 'react';

const BETA_BANNER_KEY = 'legis_beta_banner_dismissed';

export const BetaWelcomeBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(BETA_BANNER_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(BETA_BANNER_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Banner de Beta Fechado"
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-4 px-4 py-3"
      style={{
        background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
        borderBottom: '1px solid rgba(99,102,241,0.4)',
        boxShadow: '0 2px 20px rgba(99,102,241,0.25)',
      }}
    >
      {/* Efeito de partículas animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-indigo-400/20"
            style={{
              width: `${6 + i * 4}px`,
              height: `${6 + i * 4}px`,
              top: `${10 + i * 10}%`,
              left: `${5 + i * 16}%`,
              animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className="flex items-center gap-3 relative z-10">
        <span
          className="text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full border font-mono shrink-0"
          style={{
            background: 'rgba(99,102,241,0.25)',
            borderColor: 'rgba(129,140,248,0.5)',
            color: '#a5b4fc',
          }}
        >
          BETA FECHADO
        </span>

        <p className="text-xs text-indigo-200 hidden sm:block">
          🎉 Bem-vindo ao Beta da <strong className="text-white">Legis Connect</strong>!
          Sua opinião é fundamental para construirmos a melhor plataforma jurídica do Brasil.
        </p>
        <p className="text-xs text-indigo-200 sm:hidden">
          🎉 Bem-vindo ao Beta Legis Connect!
        </p>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 relative z-10 shrink-0">
        <a
          href="https://wa.me/5511999999999?text=Feedback%20Legis%20Connect%20Beta"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
          style={{
            background: 'rgba(99,102,241,0.3)',
            color: '#c7d2fe',
            border: '1px solid rgba(129,140,248,0.3)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.3)')}
        >
          💬 Canal de Suporte
        </a>

        <button
          id="beta-banner-dismiss"
          onClick={dismiss}
          aria-label="Fechar banner de beta"
          className="p-1.5 rounded-lg transition-all text-indigo-300 hover:text-white"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};
