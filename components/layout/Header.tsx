import React, { useState } from 'react';
import { BriefcaseIcon, UserCircleIcon, LogoutIcon } from '../common/IconComponents';
import type { View, User } from '../../types';
import { useAppConfig } from '../../context/AppContext';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, user, onLogout }) => {
  const { config } = useAppConfig();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = user?.role !== 'admin' ? [
    { label: 'Encontrar Advogado', view: 'search' as View },
    { label: 'Advogados', view: 'forLawyers' as View },
    { label: 'Estudantes', view: 'forInterns' as View },
    { label: 'Secretariado', view: 'forSecretariado' as View },
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

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => onNavigate(user?.role === 'admin' ? 'adminDashboard' : 'landing')}
          >
            {config.headerLogoUrl ? (
              <img src={config.headerLogoUrl} alt={config.appName} className="h-10 w-auto object-contain" />
            ) : (
              <>
                <BriefcaseIcon className="h-8 w-8 text-primary" />
                <span className="ml-3 text-2xl font-bold text-primary tracking-tight">{config.appName}</span>
              </>
            )}
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center">
            {navLinks.map(link => (
              <a
                key={link.view}
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate(link.view); }}
                className={`transition duration-150 ease-in-out font-medium ml-5 ${isActive(link.view) ? 'text-primary border-b-2 border-primary py-1' : 'text-gray-600 hover:text-primary py-1 border-b-2 border-transparent'}`}
              >
                {link.label}
              </a>
            ))}
            {user?.role === 'admin' && (
              <span className="text-gray-600 font-medium">Painel Administrativo</span>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-700">Olá, <span className="font-medium">{user.name || user.email}</span></span>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <LogoutIcon className="h-5 w-5 mr-2" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  Entrar
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-transform duration-150 hover:scale-105"
                >
                  Cadastrar
                </button>
              </>
            )}

            {/* Mobile hamburger - only show if there are nav links */}
            {navLinks.length > 0 && (
              <button
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen(o => !o)}
                aria-label="Abrir menu"
              >
                {mobileOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && navLinks.length > 0 && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-md animate-fade-in">
          <nav className="container mx-auto px-4 py-3 flex flex-col space-y-1">
            {navLinks.map(link => (
              <a
                key={link.view}
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate(link.view); setMobileOpen(false); }}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.view) ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'}`}
              >
                {link.label}
              </a>
            ))}
            {!user && (
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate('login'); setMobileOpen(false); }}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors sm:hidden"
              >
                Entrar
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

