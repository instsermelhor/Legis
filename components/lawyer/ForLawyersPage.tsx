import React, { useState } from 'react';
import { LoginForm, Credentials } from '../auth/LoginForm';
import { LawyerSignupForm } from '../auth/LawyerSignupForm';
import type { Lawyer } from '../../types';
import { BriefcaseIcon, BadgeCheckIcon, UsersIcon } from '../common/IconComponents';

interface ForLawyersPageProps {
  onLogin: (credentials: Credentials) => boolean;
  onSignup: (lawyerData: Partial<Lawyer>) => boolean;
  onShowTerms: () => void;
}

export const ForLawyersPage: React.FC<ForLawyersPageProps> = ({ onLogin, onSignup, onShowTerms }) => {
  const [mode, setMode] = useState<'landing' | 'login' | 'signup'>('landing');

  const renderContent = () => {
    switch (mode) {
      case 'login':
        return (
          <div className="w-full">
            <button onClick={() => setMode('landing')} className="text-sm text-primary hover:underline mb-4">&larr; Voltar</button>
            <LoginForm onLogin={onLogin} />
          </div>
        );
      case 'signup':
        return (
          <div className="w-full">
            <button onClick={() => setMode('landing')} className="text-sm text-primary hover:underline mb-4">&larr; Voltar</button>
            <LawyerSignupForm onSignup={onSignup} onShowTerms={onShowTerms} />
          </div>
        );
      case 'landing':
      default:
        return (
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-extrabold text-gray-900">
              Expanda sua Advocacia com a Legis Connect
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Conecte-se a uma vasta rede de clientes que precisam de sua expertise. Gerencie seus casos, agendamentos e finanças em um só lugar.
            </p>
            <div className="mt-10 max-w-2xl mx-auto text-left bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Legis Connect - O Direito com Foco na Inovação.</h2>
              <p className="text-gray-700 mb-4">
                No cenário jurídico contemporâneo, a velocidade e a segurança são ativos indispensáveis. A <strong>Legis Connect</strong> é uma solução inteligente desenvolvida para simplificar a prática jurídica e potencializar resultados através da conectividade.
              </p>
              <p className="text-gray-700">
                Mais do que uma plataforma, somos um elo. Nossa missão é eliminar as barreiras burocráticas e otimizar a interação entre os agentes do Direito e seus Clientes, utilizando tecnologia de ponta para garantir que cada etapa do processo seja clara, segura e acessível. Unimos a tradição dos valores jurídicos à inovação digital para transformar o modo como a justiça acontece.
              </p>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => setMode('signup')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-transform duration-150 hover:scale-105"
              >
                Quero me cadastrar
              </button>
              <button
                onClick={() => setMode('login')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-primary text-base font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Já sou cadastrado
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-center">
            <div className="max-w-4xl w-full">
                {renderContent()}
            </div>
        </div>
      </div>
      {mode === 'landing' && (
        <div className="bg-neutral-light py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-gray-900">Vantagens de ser um Advogado Parceiro</h2>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="text-center p-6 bg-white rounded-lg shadow-md">
                      <UsersIcon className="h-12 w-12 text-primary mx-auto" />
                      <h3 className="mt-5 text-lg font-medium text-gray-900">Novos Clientes</h3>
                      <p className="mt-2 text-base text-gray-500">Acesse um fluxo contínuo de casos e clientes qualificados em sua área de atuação.</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg shadow-md">
                      <BriefcaseIcon className="h-12 w-12 text-primary mx-auto" />
                      <h3 className="mt-5 text-lg font-medium text-gray-900">Gestão Simplificada</h3>
                      <p className="mt-2 text-base text-gray-500">Utilize nosso painel para gerenciar seus casos, agendamentos e comunicações.</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg shadow-md">
                       <BadgeCheckIcon className="h-12 w-12 text-primary mx-auto" />
                      <h3 className="mt-5 text-lg font-medium text-gray-900">Visibilidade e Credibilidade</h3>
                      <p className="mt-2 text-base text-gray-500">Construa sua reputação online com avaliações de clientes e um perfil profissional completo.</p>
                  </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};
