import React, { useState } from 'react';
import type { Intern } from '../../types';
import { AcademicCapIcon, ClipboardListIcon, UsersIcon, ChatBubbleIcon } from '../common/IconComponents';

interface InternDashboardProps {
    intern: Intern;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className="bg-primary/10 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

export const InternDashboard: React.FC<InternDashboardProps> = ({ intern }) => {
    const [activeTab, setActiveTab] = useState<'studies' | 'hours'>('studies');

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-neutral-light p-6 sm:p-8 rounded-lg">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center sm:space-x-4 mb-8 text-center sm:text-left">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold mb-4 sm:mb-0">
                        {intern.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Painel do Estudante</h1>
                        <p className="text-gray-600">Bem-vindo(a), {intern.name}! ({intern.semester} - {intern.university})</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Seu Desempenho</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<AcademicCapIcon className="w-6 h-6 text-primary" />} label="Horas Complementares" value={`${intern.hoursCompleted} / 200h`} />
                        <StatCard icon={<ClipboardListIcon className="w-6 h-6 text-primary" />} label="Casos Estudados" value={intern.casesStudied?.length || 0} />
                        <StatCard icon={<UsersIcon className="w-6 h-6 text-primary" />} label="Mentorias" value={0} />
                        <StatCard icon={<ChatBubbleIcon className="w-6 h-6 text-primary" />} label="Fóruns Ativos" value={2} />
                    </div>
                </div>

                {/* Progress Bar for Hours */}
                <div className="mb-10 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Progresso da Grade Educacional</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min((intern.hoursCompleted / 200) * 100, 100)}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-500">Você já completou {intern.hoursCompleted} horas do objetivo de 200h obrigatórias. Continue participando de simulações e mentorias!</p>
                </div>

                {/* Tabs */}
                <div>
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setActiveTab('studies')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'studies' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Mural de Casos Simulados
                            </button>
                            <button onClick={() => setActiveTab('hours')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'hours' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Painel de Mentorias e Clínicas
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'studies' && (
                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">Simulação: Direito Trabalhista #452</h4>
                                    <p className="text-sm text-gray-500 mt-1">Análise de petição inicial de acúmulo de função. Valendo 5 horas extracurriculares.</p>
                                </div>
                                <button className="px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition text-sm whitespace-nowrap">Acessar Estudo</button>
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">Simulação: Contratos Civis #108</h4>
                                    <p className="text-sm text-gray-500 mt-1">Revisão de cláusulas abusivas em contrato de adesão. Valendo 3 horas extracurriculares.</p>
                                </div>
                                <button className="px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition text-sm whitespace-nowrap">Acessar Estudo</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hours' && (
                        <div className="text-center bg-gray-50 p-10 rounded-lg border border-dashed border-gray-300">
                            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">Nenhuma mentoria agendada.</h3>
                            <p className="text-gray-500 mt-2 max-w-md mx-auto">Explore advogados parceiros pela barra de busca e envie solicitações de acompanhamento prático e mentoria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
