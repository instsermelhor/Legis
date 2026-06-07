import React, { useState } from 'react';
import { LoginForm, Credentials } from '../auth/LoginForm';
import { InternSignupForm, InternSignupData } from '../auth/InternSignupForm';
import { AcademicCapIcon, ClipboardListIcon, UsersIcon } from '../common/IconComponents';

interface ForInternsPageProps {
    onLogin: (credentials: Credentials) => boolean;
    onSignup: (internData: InternSignupData) => boolean;
    onShowTerms: () => void;
}

export const ForInternsPage: React.FC<ForInternsPageProps> = ({ onLogin, onSignup, onShowTerms }) => {
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
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <InternSignupForm onSignup={onSignup} onShowTerms={onShowTerms} />
                        </div>
                    </div>
                );
            case 'landing':
            default:
                return (
                    <div className="text-center animate-fade-in">
                        <h1 className="text-4xl font-extrabold text-gray-900">
                            Desenvolva sua Carreira Jurídica na Prática
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            A Legis Connect oferece aos Bacharelandos de Direito e Estagiários o ambiente perfeito para acessar casos reais simulados, gerenciar sua grade educacional e conectar-se com profissionais experientes.
                        </p>
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
                        <h2 className="text-3xl font-bold text-center text-gray-900">Vantagens para Bacharelandos e Estagiários</h2>
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <AcademicCapIcon className="h-12 w-12 text-primary mx-auto" />
                                <h3 className="mt-5 text-lg font-medium text-gray-900">Grade Educacional</h3>
                                <p className="mt-2 text-base text-gray-500">Desenvolva e escale sua grade monitorando suas horas complementares e atividades práticas.</p>
                            </div>
                            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <ClipboardListIcon className="h-12 w-12 text-primary mx-auto" />
                                <h3 className="mt-5 text-lg font-medium text-gray-900">Estudo de Casos</h3>
                                <p className="mt-2 text-base text-gray-500">Acesse estudos de caso simulados para analisar peças e jurisprudências com ferramentas IA.</p>
                            </div>
                            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <UsersIcon className="h-12 w-12 text-primary mx-auto" />
                                <h3 className="mt-5 text-lg font-medium text-gray-900">Mentoria Tática</h3>
                                <p className="mt-2 text-base text-gray-500">Faça networking com advogados verificados da plataforma para expandir seu horizonte profissional.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
