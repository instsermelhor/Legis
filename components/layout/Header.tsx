import React, { useState, useEffect } from 'react';
import type { View, User } from '../../types';
import { useAppConfig } from '../../context/AppContext';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  user: User | null;
  onLogout: () => void;
}

// Scales icon
const ScalesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 10l7-7 7 7M3 14h6m6 0h6M6 14l-3 4h6l-3-4zM18 14l-3 4h6l-3-4z"/>
  </svg>
);

// Logout icon
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
  </svg>
);

// User icon
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>
);

// Sun icon (light mode)
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9H21m-18 0H2.34M18.36 5.64l-.71.71M6.34 17.66l-.71.71M18.36 18.36l-.71-.71M6.34 6.34l-.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z"/>
  </svg>
);

// Moon icon (dark mode)
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, user, onLogout }) => {
  const { config } = useAppConfig();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('legis_dark_mode') === 'true';
  });

  // Apply / remove dark class on <html>
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('legis_dark_mode', String(darkMode));
  }, [darkMode]);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = user?.role !== 'admin' ? [
    { label: 'Buscar Advogado', view: 'search' as View },
    { label: 'Advogados', view: 'forLawyers' as View },
    { label: 'Bacharelandos', view: 'forInterns' as View },
    { label: 'Secret/Assist Jurídico', view: 'forSecretariado' as View },
    { label: 'Clientes', view: 'forClients' as View },
    { label: 'Serviços', view: 'services' as View },
  ] : [];

  const isActive = (view: View) => {
    if (view === 'search') return currentView === 'search' || currentView === 'profile';
    if (view === 'forInterns') return currentView === 'forInterns' || currentView === 'internDashboard';
    if (view === 'forClients') return currentView === 'forClients' || currentView === 'signup';
    if (view === 'forSecretariado') return currentView === 'forSecretariado' || currentView === 'secretariadoDashboard';
    return currentView === view;
  };

  const isLandingOrPublic = ['landing', 'search', 'forLawyers', 'forInterns', 'forClients', 'forSecretariado', 'services', 'profile', 'login', 'signup'].includes(currentView);

  // ── Header base classes ───────────────────────────────────────────────────
  // On landing page: glassmorphism dark; on inner pages: white/dark panel
  const headerBase = isLandingOrPublic
    ? `glass-dark text-white`
    : `bg-white dark:bg-surface-card border-b border-gray-200 dark:border-surface-border text-gray-800 dark:text-white`;

  const shadowClass = scrolled ? 'shadow-dark-card' : '';

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBase} ${shadowClass}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <button
            onClick={() => onNavigate(user?.role === 'admin' ? 'adminDashboard' : 'landing')}
            className="flex-shrink-0 flex items-center gap-2.5 group"
          >
            {config.headerLogoUrl ? (
              <img src={config.headerLogoUrl} alt={config.appName} className="h-9 w-auto object-contain" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
                  <ScalesIcon />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-cinzel text-lg font-semibold tracking-widest text-primary group-hover:text-primary-light transition-colors duration-200">
                    LEGIS
                  </span>
                  <span className="font-cinzel text-[10px] tracking-[0.3em] text-accent/80 -mt-0.5">
                    CONNECT
                  </span>
                </div>
              </>
            )}
          </button>

          {/* ── Desktop nav ───────────────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.view}
                onClick={() => onNavigate(link.view)}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive(link.view)
                    ? 'text-primary bg-primary/10 font-semibold'
                    : isLandingOrPublic
                      ? 'text-white/80 hover:text-white hover:bg-white/8'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-gray-100 dark:hover:bg-white/6'
                }`}
              >
                {link.label}
                {isActive(link.view) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            ))}
            {user?.role === 'admin' && (
              <span className={`px-3.5 py-2 text-sm font-semibold ${isLandingOrPublic ? 'text-accent' : 'text-primary'}`}>
                Painel Administrativo
              </span>
            )}
          </nav>

          {/* ── Right side actions ────────────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(d => !d)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isLandingOrPublic
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8'
              }`}
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
              aria-label="Alternar modo escuro"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <>
                <span className={`hidden sm:inline text-sm font-medium ${isLandingOrPublic ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                  Olá, <span className="font-semibold">{user.name?.split(' ')[0] || user.email}</span>
                </span>
                <button
                  onClick={onLogout}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isLandingOrPublic
                      ? 'text-white/80 hover:text-white border border-white/20 hover:bg-white/10'
                      : 'text-primary border border-primary/20 bg-primary/6 hover:bg-primary/12'
                  }`}
                >
                  <LogoutIcon />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isLandingOrPublic
                      ? 'text-white/80 hover:text-white border border-white/15 hover:bg-white/10'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/8'
                  }`}
                >
                  <UserIcon />
                  Entrar
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="btn-primary text-sm py-2 px-4"
                >
                  Cadastrar-se
                </button>
              </>
            )}

            {/* Mobile hamburger */}
            {navLinks.length > 0 && (
              <button
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  isLandingOrPublic ? 'text-white/80 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setMobileOpen(o => !o)}
                aria-label="Abrir menu"
              >
                {mobileOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile nav drawer ──────────────────────────────────────────────── */}
      {mobileOpen && navLinks.length > 0 && (
        <div className={`lg:hidden border-t animate-slide-down ${
          isLandingOrPublic ? 'border-white/10 glass-dark' : 'border-gray-200 dark:border-surface-border bg-white dark:bg-surface-card'
        }`}>
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map(link => (
              <button
                key={link.view}
                onClick={() => { onNavigate(link.view); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.view)
                    ? 'bg-primary/12 text-primary font-semibold'
                    : isLandingOrPublic
                      ? 'text-white/75 hover:text-white hover:bg-white/8'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/6 hover:text-primary'
                }`}
              >
                {link.label}
              </button>
            ))}
            {!user && (
              <button
                onClick={() => { onNavigate('login'); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium sm:hidden transition-colors ${
                  isLandingOrPublic ? 'text-white/75 hover:text-white hover:bg-white/8' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                Entrar
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
