import React from 'react';
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
          <nav className="hidden md:flex items-center">
            {user?.role !== 'admin' && (
              <>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('search'); }} className={`transition duration-150 ease-in-out font-medium ml-4 ${currentView === 'search' || currentView === 'profile' ? 'text-primary border-b-2 border-primary py-1' : 'text-gray-600 hover:text-primary py-1 border-b-2 border-transparent'}`}>Encontrar Advogado</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('forLawyers'); }} className={`transition duration-150 ease-in-out font-medium ml-6 ${currentView === 'forLawyers' ? 'text-primary border-b-2 border-primary py-1' : 'text-gray-600 hover:text-primary py-1 border-b-2 border-transparent'}`}>Advogados</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('forInterns'); }} className={`transition duration-150 ease-in-out font-medium ml-5 ${currentView === 'forInterns' || currentView === 'internDashboard' ? 'text-primary border-b-2 border-primary py-1' : 'text-gray-600 hover:text-primary py-1 border-b-2 border-transparent'}`}>Estudantes</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className={`transition duration-150 ease-in-out font-medium ml-7 ${['dashboard', 'login', 'lawyerDashboard', 'internDashboard'].includes(currentView) ? 'text-primary border-b-2 border-primary py-1' : 'text-gray-600 hover:text-primary py-1 border-b-2 border-transparent'}`}>Meus Casos</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('forClients'); }} className={`transition duration-150 ease-in-out font-medium ml-5 ${currentView === 'forClients' || currentView === 'signup' ? 'text-primary border-b-2 border-primary py-1' : 'text-gray-600 hover:text-primary py-1 border-b-2 border-transparent'}`}>Clientes</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('services'); }} className={`transition duration-150 ease-in-out font-medium ml-5 ${currentView === 'services' ? 'text-primary border-b-2 border-primary py-1' : 'text-gray-600 hover:text-primary py-1 border-b-2 border-transparent'}`}>Serviços</a>
              </>
            )}
            {user?.role === 'admin' && (
              <span className="text-gray-600 font-medium">Painel Administrativo</span>
            )}
          </nav>
          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </div>
    </header>
  );
};
