import React, { useState } from 'react';
import type { View } from '../../types';
import { ClientSignupForm, ClientSignupData } from './ClientSignupForm';
import { UserCircleIcon, BriefcaseIcon, AcademicCapIcon } from '../common/IconComponents';

interface SignupPageProps {
    onClientSignup: (data: ClientSignupData) => void;
    onNavigate: (view: View) => void;
    onShowTerms: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onClientSignup, onNavigate, onShowTerms }) => {
    const [showForm, setShowForm] = useState(false);

    if (showForm) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-neutral-light">
                <div className="flex justify-center">
                    <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
                        <button onClick={() => setShowForm(false)} className="text-sm text-primary hover:underline mb-4">&larr; Voltar para seleção</button>
                        <ClientSignupForm onSignup={onClientSignup} onShowTerms={onShowTerms} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900">
                    Junte-se à Legis Connect
                </h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Selecione o tipo de conta que você gostaria de criar.
                </p>

                <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Client Signup Option */}
                    <div
                        onClick={() => setShowForm(true)}
                        className="p-8 border-2 border-gray-200 rounded-lg text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 transform hover:scale-105"
                    >
                        <UserCircleIcon className="h-16 w-16 text-primary mx-auto" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">Sou um Cliente</h2>
                        <p className="mt-2 text-gray-500">
                            Procurando por um advogado para resolver seu caso de forma rápida.
                        </p>
                    </div>

                    {/* Lawyer Signup Option */}
                    <div
                        onClick={() => onNavigate('forLawyers')}
                        className="p-8 border-2 border-gray-200 rounded-lg text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 transform hover:scale-105"
                    >
                        <BriefcaseIcon className="h-16 w-16 text-primary mx-auto" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">Sou um Advogado</h2>
                        <p className="mt-2 text-gray-500">
                            Querendo expandir sua carteira de clientes e gerenciar seus casos ativos.
                        </p>
                    </div>

                    {/* Intern Signup Option */}
                    <div
                        onClick={() => onNavigate('forInterns')}
                        className="p-8 border-2 border-gray-200 rounded-lg text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 transform hover:scale-105"
                    >
                        <AcademicCapIcon className="h-16 w-16 text-primary mx-auto" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">Sou Estudante</h2>
                        <p className="mt-2 text-gray-500">
                            Estudante de Direito ou estagiário buscando desenvolver sua grade educacional.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
