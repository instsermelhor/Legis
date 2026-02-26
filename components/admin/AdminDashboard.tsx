import React, { useState, useMemo } from 'react';
import type { Lawyer } from '../../types';
import { mockLawyers } from '../../services/mockLawyerService';
import { BriefcaseIcon, UsersIcon, CurrencyDollarIcon, ShieldCheckIcon } from '../common/IconComponents';
import { SpecialtyPieChart } from './SpecialtyPieChart';



const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4">
        <div className="bg-primary/10 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const StatusBadge: React.FC<{ status: Lawyer['status'] }> = ({ status }) => {
    const styles = {
        verificado: 'bg-green-100 text-green-800',
        pendente: 'bg-yellow-100 text-yellow-800',
        suspenso: 'bg-red-100 text-red-800',
    };
    const text = {
        verificado: 'Verificado',
        pendente: 'Pendente',
        suspenso: 'Suspenso',
    }
    return <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{text[status]}</span>;
};

export const AdminDashboard: React.FC = () => {
    const [lawyers, setLawyers] = useState<Lawyer[]>(mockLawyers);

    const stats = useMemo(() => ({
        totalLawyers: lawyers.length,
        totalClients: 580, // Mock data
        activeCases: 120, // Mock data
        monthlyRevenue: lawyers.reduce((acc, l) => acc + (l.monthlyRevenue || 0), 0),
    }), [lawyers]);
    
    const specialtyDistribution = useMemo(() => {
        const counts: { [key: string]: number } = {};
        lawyers.forEach(lawyer => {
            lawyer.specialties.forEach(specialty => {
                counts[specialty] = (counts[specialty] || 0) + 1;
            });
        });
        return counts;
    }, [lawyers]);

    const handleStatusChange = (lawyerId: number, newStatus: Lawyer['status']) => {
        setLawyers(lawyers.map(l => l.id === lawyerId ? { ...l, status: newStatus } : l));
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-neutral-light p-6 sm:p-8 rounded-lg">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Painel Administrativo</h1>

                {/* Stats Section */}
                <div className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Visão Geral da Plataforma</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<BriefcaseIcon className="w-6 h-6 text-primary" />} label="Total de Advogados" value={stats.totalLawyers} />
                        <StatCard icon={<UsersIcon className="w-6 h-6 text-primary" />} label="Total de Clientes" value={stats.totalClients} />
                        <StatCard icon={<ShieldCheckIcon className="w-6 h-6 text-primary" />} label="Casos Ativos" value={stats.activeCases} />
                        <StatCard icon={<CurrencyDollarIcon className="w-6 h-6 text-primary" />} label="Receita Mensal (Est.)" value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`} />
                    </div>
                </div>

                 {/* Platform Analytics Section */}
                <div className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Análise da Plataforma</h2>
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Distribuição de Advogados por Especialidade</h3>
                        <SpecialtyPieChart data={specialtyDistribution} />
                    </div>
                </div>

                {/* Lawyer Management Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Gerenciamento de Advogados</h2>
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nome</th>
                                    <th scope="col" className="px-6 py-3">OAB</th>
                                    <th scope="col" className="px-6 py-3">Especialidades</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lawyers.map(lawyer => (
                                    <tr key={lawyer.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{lawyer.name}</td>
                                        <td className="px-6 py-4">{lawyer.oab}</td>
                                        <td className="px-6 py-4">{lawyer.specialties.join(', ')}</td>
                                        <td className="px-6 py-4"><StatusBadge status={lawyer.status} /></td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            {lawyer.status === 'pendente' && (
                                                <button onClick={() => handleStatusChange(lawyer.id, 'verificado')} className="font-medium text-green-600 hover:underline text-xs">Verificar</button>
                                            )}
                                            {lawyer.status === 'verificado' && (
                                                <button onClick={() => handleStatusChange(lawyer.id, 'suspenso')} className="font-medium text-red-600 hover:underline text-xs">Suspender</button>
                                            )}
                                            {lawyer.status === 'suspenso' && (
                                                <button onClick={() => handleStatusChange(lawyer.id, 'verificado')} className="font-medium text-blue-600 hover:underline text-xs">Reativar</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
