import React, { useState } from 'react';
// FIX: Corrected import path for local module.
import type { Lawyer, Appointment, Case, CaseStage } from '../../types';
import { CalendarIcon, ClockIcon, VideoCameraIcon, UsersIcon, ClipboardListIcon, CurrencyDollarIcon, PencilIcon, CalendarPlusIcon } from '../common/IconComponents';
import { CaseProgressTracker } from '../common/CaseProgressTracker';
import { UpdateCaseStatusModal } from '../common/UpdateCaseStatusModal';
import { CalendarSyncModal } from '../common/CalendarSyncModal';

interface LawyerDashboardProps {
  lawyer: Lawyer;
}

const initialActiveCases: Case[] = [
    { 
        id: 'case1', clientName: 'Ana Clara Dias', title: 'Inventário e Partilha de Bens', status: 'Ativo', lawyerName: 'Dr. Carlos Andrade',
        // FIX: Added missing lawyerId property to conform to the Case type.
        lawyerId: 1,
        stages: [
            { name: 'Reunião Inicial', status: 'completed' },
            { name: 'Levantamento de Bens', status: 'current' },
            { name: 'Plano de Partilha', status: 'upcoming' },
            { name: 'Homologação', status: 'upcoming' },
        ]
    },
    { 
        id: 'case2', clientName: 'Roberto Martins', title: 'Reclamação Trabalhista', status: 'Ativo', lawyerName: 'Dr. Carlos Andrade',
        // FIX: Added missing lawyerId property to conform to the Case type.
        lawyerId: 1,
        stages: [
            { name: 'Análise Documental', status: 'completed' },
            { name: 'Petição Inicial', status: 'completed' },
            { name: 'Audiência de Conciliação', status: 'completed' },
            { name: 'Fase de Instrução', status: 'current' },
            { name: 'Sentença', status: 'upcoming' },
        ]
    },
];

const upcomingAppointments: Appointment[] = [
    { id: 'apt1', clientName: 'Ana Clara Dias', date: '2024-09-15', time: '10:00', status: 'Confirmado', modality: 'Videochamada' },
    { id: 'apt2', clientName: 'Roberto Martins', date: '2024-09-15', time: '14:00', status: 'Confirmado', modality: 'Videochamada' },
    { id: 'apt3', clientName: 'Sofia Pereira', date: '2024-09-17', time: '11:00', status: 'Confirmado', modality: 'Presencial' },
];

const pastAppointments: Appointment[] = [
    { id: 'apt4', clientName: 'Lucas Ferreira', date: '2024-09-05', time: '15:00', status: 'Concluído', modality: 'Videochamada' },
    { id: 'apt5', clientName: 'Mariana Costa', date: '2024-09-02', time: '09:00', status: 'Concluído', modality: 'Videochamada' },
    { id: 'apt6', clientName: 'Pedro Almeida', date: '2024-08-28', time: '16:00', status: 'Cancelado', modality: 'Presencial' },
];

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4">
        <div className="bg-primary/10 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
    const statusClasses: { [key in Appointment['status']]: string } = {
        'Confirmado': 'bg-green-100 text-green-800',
        'Concluído': 'bg-gray-100 text-gray-800',
        'Cancelado': 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{appointment.clientName}</h3>
                    <p className="text-sm text-gray-500">{appointment.modality}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClasses[appointment.status]}`}>
                    {appointment.status}
                </span>
            </div>
            <div className="mt-4 border-t pt-4 space-y-2 text-sm text-gray-700">
                <p className="flex items-center"><CalendarIcon className="w-4 h-4 mr-2 text-gray-400" /> {new Date(appointment.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                <p className="flex items-center"><ClockIcon className="w-4 h-4 mr-2 text-gray-400" /> {appointment.time}</p>
            </div>
            {appointment.status === 'Confirmado' && (
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                        <VideoCameraIcon className="w-4 h-4" />
                        Iniciar Chamada
                    </button>
                    <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                        Remarcar
                    </button>
                </div>
            )}
        </div>
    );
}

export const LawyerDashboard: React.FC<LawyerDashboardProps> = ({ lawyer }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cases, setCases] = useState<Case[]>(initialActiveCases);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const handleOpenUpdateModal = (caseToUpdate: Case) => {
    setSelectedCase(caseToUpdate);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedCase(null);
  };

  const handleUpdateCaseStatus = (caseId: string, newCurrentStageName: string) => {
    setCases(prevCases => 
        prevCases.map(c => {
            if (c.id === caseId) {
                const newCurrentIndex = c.stages.findIndex(s => s.name === newCurrentStageName);
                if (newCurrentIndex === -1) return c; 

                const newStages: CaseStage[] = c.stages.map((stage, index) => {
                    if (index < newCurrentIndex) return { ...stage, status: 'completed' };
                    if (index === newCurrentIndex) return { ...stage, status: 'current' };
                    return { ...stage, status: 'upcoming' };
                });
                return { ...c, stages: newStages };
            }
            return c;
        })
    );
    handleCloseUpdateModal();
  };

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-neutral-light p-6 sm:p-8 rounded-lg">
          <div className="flex items-center space-x-4 mb-8">
              <img src={lawyer.photoUrl} alt={lawyer.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-primary" />
              <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Painel do Advogado</h1>
                  <p className="text-gray-600">Bem-vindo(a) de volta, {lawyer.name}!</p>
              </div>
          </div>

          <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Visão Geral</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard icon={<ClipboardListIcon className="w-6 h-6 text-primary" />} label="Casos Ativos" value={cases.length} />
                  <StatCard icon={<UsersIcon className="w-6 h-6 text-primary" />} label="Clientes Atendidos" value={lawyer.experience.cases} />
                  {lawyer.monthlyRevenue && <StatCard icon={<CurrencyDollarIcon className="w-6 h-6 text-primary" />} label="Faturamento Mensal" value={`R$ ${lawyer.monthlyRevenue.toLocaleString('pt-BR')}`} />}
                  <StatCard icon={<CalendarIcon className="w-6 h-6 text-primary" />} label="Consultas (Mês)" value={lawyer.consultationsThisMonth || 0} />
              </div>
          </div>

          <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Resumo Financeiro</h2>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <p className="text-gray-600">Faturamento deste mês:</p>
                          <p className="text-lg font-bold text-gray-800">R$ {lawyer.monthlyRevenue?.toLocaleString('pt-BR') || '0,00'}</p>
                      </div>
                      <div className="flex justify-between items-center">
                          <p className="text-gray-600">Pagamentos pendentes:</p>
                          <p className="text-lg font-bold text-red-600">R$ {lawyer.pendingPayments?.toLocaleString('pt-BR') || '0,00'}</p>
                      </div>
                  </div>
                  <button className="w-full mt-6 bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Ver Relatório Financeiro Completo
                  </button>
              </div>
          </div>


          <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Casos Ativos</h2>
              <div className="space-y-6">
                  {cases.map(c => (
                      <div key={c.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                              <div>
                                  <h3 className="text-lg font-bold text-gray-800">{c.title}</h3>
                                  <p className="text-sm text-gray-500">Cliente: {c.clientName}</p>
                              </div>
                              <span className="bg-primary/10 text-primary text-xs font-medium mt-2 sm:mt-0 px-2.5 py-0.5 rounded-full">{c.status}</span>
                          </div>
                          <CaseProgressTracker stages={c.stages} />
                          <div className="mt-4 border-t pt-4 flex flex-col sm:flex-row gap-3">
                              <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">Ver Detalhes</button>
                              <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">Enviar Mensagem</button>
                              <button onClick={() => handleOpenUpdateModal(c)} className="flex-1 px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                                  <PencilIcon className="w-4 h-4" />
                                  Atualizar Andamento
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Meus Agendamentos</h2>
                <button 
                  onClick={() => setIsSyncModalOpen(true)}
                  className="mt-2 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <CalendarPlusIcon className="w-5 h-5 text-gray-500" />
                    Sincronizar Calendário
                </button>
            </div>
              <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-6">
                      <button onClick={() => setActiveTab('upcoming')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                          Próximos Agendamentos
                      </button>
                      <button onClick={() => setActiveTab('past')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                          Histórico de Consultas
                      </button>
                  </nav>
              </div>
              <div className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).map(apt => (
                          <AppointmentCard key={apt.id} appointment={apt} />
                      ))}
                  </div>
              </div>
          </div>
        </div>
      </div>
      {isUpdateModalOpen && selectedCase && (
        <UpdateCaseStatusModal 
            caseToUpdate={selectedCase}
            onClose={handleCloseUpdateModal}
            onUpdateStatus={handleUpdateCaseStatus}
        />
      )}
      {isSyncModalOpen && (
        <CalendarSyncModal 
            lawyer={lawyer}
            onClose={() => setIsSyncModalOpen(false)}
        />
      )}
    </>
  );
};