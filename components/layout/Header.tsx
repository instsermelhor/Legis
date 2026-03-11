import React from 'react';
import { BriefcaseIcon, UserCircleIcon, LogoutIcon } from '../common/IconComponents';
// FIX: Corrected import path for local module.
import type { View, User } from '../../types';

interface HeaderProps {
  onNavigate: (view: View) => void;
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, user, onLogout }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => onNavigate(user?.role === 'admin' ? 'adminDashboard' : 'landing')}
          >
            <BriefcaseIcon className="h-8 w-8 text-primary" />
            <span className="ml-3 text-2xl font-bold text-primary tracking-tight">Legis Connect</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            {user?.role !== 'admin' && (
              <>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('search'); }} className="text-gray-600 hover:text-primary transition duration-150 ease-in-out font-medium">Encontrar Advogado</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="text-gray-600 hover:text-primary transition duration-150 ease-in-out font-medium">Meus Casos</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('signup'); }} className="text-gray-600 hover:text-primary transition duration-150 ease-in-out font-medium">Clientes</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('forLawyers'); }} className="text-gray-600 hover:text-primary transition duration-150 ease-in-out font-medium">Advogados</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('forInterns'); }} className="text-gray-600 hover:text-primary transition duration-150 ease-in-out font-medium">Estudantes</a>
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
