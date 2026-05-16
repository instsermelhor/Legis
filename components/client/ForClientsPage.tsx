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
            <h1 className="text-4xl font-extrabold text-gray-900">
              Seus direitos, com quem entende
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Encontre o advogado certo para o seu caso, acompanhe cada etapa do processo e comunique-se com total segurança e transparência.
            </p>
            <div className="mt-10 max-w-2xl mx-auto text-left bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Legis Connect — Acesso à Justiça com Tecnologia</h2>
              <p className="text-gray-700 mb-4">
                Na <strong>Legis Connect</strong>, você tem acesso a uma rede de advogados verificados, prontos para atender suas necessidades jurídicas com profissionalismo e agilidade.
              </p>
              <p className="text-gray-700">
                Acompanhe o andamento do seu processo em tempo real, troque mensagens com seu advogado de forma segura e receba notificações sobre cada etapa. Tudo em um único lugar, com a privacidade e a segurança que você merece.
              </p>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => setMode('signup')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-transform duration-150 hover:scale-105"
              >
                Quero me Cadastrar
              </button>
              <button
                onClick={() => setMode('login')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-primary text-base font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Já sou Cadastrado
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
            <h2 className="text-3xl font-bold text-center text-gray-900">Vantagens de ser um Cliente Legis Connect</h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <UserCircleIcon className="h-12 w-12 text-primary mx-auto" />
                <h3 className="mt-5 text-lg font-medium text-gray-900">Advogados Verificados</h3>
                <p className="mt-2 text-base text-gray-500">Todos os advogados da plataforma são verificados pela OAB, garantindo qualidade e segurança.</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <BriefcaseIcon className="h-12 w-12 text-primary mx-auto" />
                <h3 className="mt-5 text-lg font-medium text-gray-900">Acompanhe seu Caso</h3>
                <p className="mt-2 text-base text-gray-500">Monitore o progresso do seu processo jurídico em tempo real, com total transparência.</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <BadgeCheckIcon className="h-12 w-12 text-primary mx-auto" />
                <h3 className="mt-5 text-lg font-medium text-gray-900">Comunicação Segura</h3>
                <p className="mt-2 text-base text-gray-500">Troque mensagens com seu advogado de forma confidencial e segura diretamente na plataforma.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
