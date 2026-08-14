import React, { useState } from 'react';
import { LoginForm, Credentials } from '../auth/LoginForm';
import { ClientSignupForm, ClientSignupData } from '../auth/ClientSignupForm';
import { UserCircleIcon, BriefcaseIcon, BadgeCheckIcon } from '../common/IconComponents';

interface ForClientsPageProps {
  onLogin: (credentials: Credentials) => boolean;
  onSignup: (data: ClientSignupData) => void;
  onShowTerms: () => void;
}

export const ForClientsPage: React.FC<ForClientsPageProps> = ({ onLogin, onSignup, onShowTerms }) => {
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
            <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
              <ClientSignupForm onSignup={onSignup} onShowTerms={onShowTerms} />
            </div>
          </div>
        );
      case 'landing':
      default:
        return (
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              Seus direitos, com quem entende
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Encontre o advogado certo para o seu caso, acompanhe cada etapa do processo e comunique-se com total segurança e transparência.
            </p>
            <div className="mt-8 max-w-2xl mx-auto text-left bg-gray-50 dark:bg-[#1A1730] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">Legis Connect — Acesso à Justiça com Tecnologia</h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Na <strong>Legis Connect</strong>, você tem acesso a uma rede de advogados verificados, prontos para atender suas necessidades jurídicas com profissionalismo e agilidade.
              </p>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                Acompanhe o andamento do seu processo em tempo real, troque mensagens com seu advogado de forma segura e receba notificações sobre cada etapa. Tudo em um único lugar, com a privacidade e a segurança que você merece.
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => setMode('signup')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-xl shadow-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-transform duration-150 hover:scale-105"
              >
                Quero me Cadastrar
              </button>
              <button
                onClick={() => setMode('login')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-primary text-base font-semibold rounded-xl text-primary dark:text-primary-light bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Já sou Cadastrado
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F0D1A] transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex justify-center">
          <div className="max-w-4xl w-full">
            {renderContent()}
          </div>
        </div>
      </div>
      {mode === 'landing' && (
        <div className="bg-gray-50 dark:bg-[#13102A] border-t border-gray-100 dark:border-white/5 py-10 sm:py-14 transition-colors">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white">Vantagens de ser um Cliente Legis Connect</h2>
            <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center p-6 bg-white dark:bg-[#1A1730] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <UserCircleIcon className="h-12 w-12 text-primary mx-auto" />
                <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Advogados Verificados</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Todos os advogados da plataforma são verificados pela OAB, garantindo qualidade e segurança.</p>
              </div>
              <div className="text-center p-6 bg-white dark:bg-[#1A1730] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <BriefcaseIcon className="h-12 w-12 text-primary mx-auto" />
                <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Acompanhe seu Caso</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Monitore o progresso do seu processo jurídico em tempo real, com total transparência.</p>
              </div>
              <div className="text-center p-6 bg-white dark:bg-[#1A1730] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <BadgeCheckIcon className="h-12 w-12 text-primary mx-auto" />
                <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Comunicação Segura</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Troque mensagens com seu advogado de forma confidencial e segura diretamente na plataforma.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
