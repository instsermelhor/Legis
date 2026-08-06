import React, { useState, useEffect } from 'react';
import type { View, User } from '../../types';
import { useAppConfig } from '../../context/AppContext';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { SubscriptionPlansModal } from '../common/SubscriptionPlansModal';
import { PredictiveLegalAiModal } from '../common/PredictiveLegalAiModal';
import { WhatsAppNotificationModal } from '../common/WhatsAppNotificationModal';
import { BiAnalyticsModal } from '../admin/BiAnalyticsModal';
import { SmartContractSignModal } from '../common/SmartContractSignModal';
import { DeploymentStatusModal } from '../admin/DeploymentStatusModal';
import { DiligenceMarketplaceModal } from '../lawyer/DiligenceMarketplaceModal';
import { ProcessTrackingModal } from '../lawyer/ProcessTrackingModal';
import { AiLegalDocumentGeneratorModal } from '../lawyer/AiLegalDocumentGeneratorModal';
import { ClientPortalModal } from '../client/ClientPortalModal';
import { OfficeFinancialModal } from '../lawyer/OfficeFinancialModal';
import { JurisprudenceTesesModal } from '../common/JurisprudenceTesesModal';
import { OcrDeadlineParserModal } from '../lawyer/OcrDeadlineParserModal';
import { VirtualHearingModal } from '../lawyer/VirtualHearingModal';
import { EnterpriseCertificationModal } from '../admin/EnterpriseCertificationModal';
import { ExpertForensicsModal } from '../lawyer/ExpertForensicsModal';
import { UnifiedToolsMenu } from './UnifiedToolsMenu';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  user: User | null;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  onOpenProfileSelector: () => void;
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

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, user, onLogout, onOpenLoginModal, onOpenProfileSelector }) => {
  const { config } = useAppConfig();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('legis_dark_mode') === 'true';
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [isPredictiveAiOpen, setIsPredictiveAiOpen] = useState(false);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  const [isBiOpen, setIsBiOpen] = useState(false);
  const [isSmartContractOpen, setIsSmartContractOpen] = useState(false);
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);
  const [isDiligenceOpen, setIsDiligenceOpen] = useState(false);
  const [isProcessTrackingOpen, setIsProcessTrackingOpen] = useState(false);
  const [isAiDocGenOpen, setIsAiDocGenOpen] = useState(false);
  const [isClientPortalOpen, setIsClientPortalOpen] = useState(false);
  const [isOfficeFinancialOpen, setIsOfficeFinancialOpen] = useState(false);
  const [isJurisprudenceOpen, setIsJurisprudenceOpen] = useState(false);
  const [isOcrDeadlineOpen, setIsOcrDeadlineOpen] = useState(false);
  const [isVirtualHearingOpen, setIsVirtualHearingOpen] = useState(false);
  const [isEnterpriseCertOpen, setIsEnterpriseCertOpen] = useState(false);
  const [isExpertForensicsOpen, setIsExpertForensicsOpen] = useState(false);
  const [unreadCount] = useState(2);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <>
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
              <button
                onClick={() => onNavigate('adminDashboard')}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentView === 'adminDashboard'
                    ? 'text-primary bg-primary/10'
                    : isLandingOrPublic
                      ? 'text-accent hover:text-white hover:bg-white/8'
                      : 'text-primary hover:bg-primary/8'
                }`}
              >
                Painel Admin
                {currentView === 'adminDashboard' && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
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

            {/* Search button (Cmd+K) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              title="Busca Global (⌘K)"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                isLandingOrPublic
                  ? 'text-white/70 border-white/15 hover:bg-white/10 hover:text-white'
                  : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/8'
              }`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              <span>Buscar</span>
              <kbd className="ml-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20">⌘K</kbd>
            </button>

            {/* Unified Tools Menu */}
            <UnifiedToolsMenu
              isAdmin={user?.role === 'admin'}
              onOpenModal={(key) => {
                if (key === 'plans') setIsPlansOpen(true);
                if (key === 'predictiveAi') setIsPredictiveAiOpen(true);
                if (key === 'whatsapp') setIsWhatsappOpen(true);
                if (key === 'biAnalytics') setIsBiOpen(true);
                if (key === 'smartContract') setIsSmartContractOpen(true);
                if (key === 'diligenceMarketplace') setIsDiligenceOpen(true);
                if (key === 'processTracking') setIsProcessTrackingOpen(true);
                if (key === 'aiDocGen') setIsAiDocGenOpen(true);
                if (key === 'clientPortal') setIsClientPortalOpen(true);
                if (key === 'officeFinancial') setIsOfficeFinancialOpen(true);
                if (key === 'jurisprudence') setIsJurisprudenceOpen(true);
                if (key === 'ocrDeadline') setIsOcrDeadlineOpen(true);
                if (key === 'virtualHearing') setIsVirtualHearingOpen(true);
                if (key === 'enterpriseCert') setIsEnterpriseCertOpen(true);
                if (key === 'expertForensics') setIsExpertForensicsOpen(true);
                if (key === 'monitor') setIsMonitorOpen(true);
              }}
            />



            {/* Deploy Monitor button (admin only) */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setIsMonitorOpen(true)}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-sm hover:opacity-90 transition-all"
                title="Monitoramento de Produção & CI/CD"
              >
                <span>🖥️</span>
                <span>Monitor</span>
              </button>
            )}

            {/* Notification bell (logged-in only) */}
            {user && (
              <button
                onClick={() => setIsNotifOpen(true)}
                className={`relative p-2 rounded-lg transition-all duration-200 ${
                  isLandingOrPublic
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8'
                }`}
                title="Notificações"
                aria-label="Abrir notificações"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-surface-card animate-pulse" />
                )}
              </button>
            )}

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
                  onClick={onOpenLoginModal}
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
                  onClick={onOpenProfileSelector}
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
                onClick={() => { onOpenLoginModal(); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium sm:hidden transition-colors ${
                  isLandingOrPublic ? 'text-white/75 hover:text-white hover:bg-white/8' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                Entrar
              </button>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => { onNavigate('adminDashboard'); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  currentView === 'adminDashboard'
                    ? 'bg-primary/12 text-primary'
                    : isLandingOrPublic
                      ? 'text-accent hover:text-white hover:bg-white/8'
                      : 'text-primary hover:bg-primary/8'
                }`}
              >
                Painel Admin
              </button>
            )}
          </nav>
        </div>
      )}
    </header>

    {/* ── Global overlays ───────────────────────────────────────────────────── */}
    <GlobalSearchModal
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
    />
    <NotificationDrawer
      isOpen={isNotifOpen}
      onClose={() => setIsNotifOpen(false)}
    />
    <SubscriptionPlansModal
      isOpen={isPlansOpen}
      onClose={() => setIsPlansOpen(false)}
    />
    <PredictiveLegalAiModal
      isOpen={isPredictiveAiOpen}
      onClose={() => setIsPredictiveAiOpen(false)}
    />
    <WhatsAppNotificationModal
      isOpen={isWhatsappOpen}
      onClose={() => setIsWhatsappOpen(false)}
    />
    <BiAnalyticsModal
      isOpen={isBiOpen}
      onClose={() => setIsBiOpen(false)}
    />
    <SmartContractSignModal
      isOpen={isSmartContractOpen}
      onClose={() => setIsSmartContractOpen(false)}
    />
    <DeploymentStatusModal
      isOpen={isMonitorOpen}
      onClose={() => setIsMonitorOpen(false)}
    />
    <DiligenceMarketplaceModal
      isOpen={isDiligenceOpen}
      onClose={() => setIsDiligenceOpen(false)}
    />
    <ProcessTrackingModal
      isOpen={isProcessTrackingOpen}
      onClose={() => setIsProcessTrackingOpen(false)}
    />
    <AiLegalDocumentGeneratorModal
      isOpen={isAiDocGenOpen}
      onClose={() => setIsAiDocGenOpen(false)}
    />
    <ClientPortalModal
      isOpen={isClientPortalOpen}
      onClose={() => setIsClientPortalOpen(false)}
    />
    <OfficeFinancialModal
      isOpen={isOfficeFinancialOpen}
      onClose={() => setIsOfficeFinancialOpen(false)}
    />
    <JurisprudenceTesesModal
      isOpen={isJurisprudenceOpen}
      onClose={() => setIsJurisprudenceOpen(false)}
    />
    <OcrDeadlineParserModal
      isOpen={isOcrDeadlineOpen}
      onClose={() => setIsOcrDeadlineOpen(false)}
    />
    <VirtualHearingModal
      isOpen={isVirtualHearingOpen}
      onClose={() => setIsVirtualHearingOpen(false)}
    />
    <EnterpriseCertificationModal
      isOpen={isEnterpriseCertOpen}
      onClose={() => setIsEnterpriseCertOpen(false)}
    />
    <ExpertForensicsModal
      isOpen={isExpertForensicsOpen}
      onClose={() => setIsExpertForensicsOpen(false)}
    />
  </>
  );
};
