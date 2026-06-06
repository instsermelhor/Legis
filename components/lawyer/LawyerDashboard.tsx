import React, { useState, useMemo } from 'react';
import type { Lawyer, Appointment, Case, CaseStage } from '../../types';
import { CalendarIcon, ClockIcon, VideoCameraIcon, UsersIcon, ClipboardListIcon, CurrencyDollarIcon, PencilIcon, CalendarPlusIcon } from '../common/IconComponents';
import { CaseProgressTracker } from '../common/CaseProgressTracker';
import { UpdateCaseStatusModal } from '../common/UpdateCaseStatusModal';
import { CalendarSyncModal } from '../common/CalendarSyncModal';
import { dbCodes, LegalCode } from '../../services/dbService';

interface LawyerDashboardProps {
    lawyer: Lawyer;
}

const CPC_STAGES: CaseStage[] = [
    { name: 'Petição Inicial', status: 'completed' },
    { name: 'Audiência de Conciliação', status: 'current' },
    { name: 'Contestação do Réu', status: 'upcoming' },
    { name: 'Réplica do Autor', status: 'upcoming' },
    { name: 'Saneamento do Processo', status: 'upcoming' },
    { name: 'Instrução e Julgamento', status: 'upcoming' },
    { name: 'Sentença Judicial', status: 'upcoming' },
    { name: 'Recursos', status: 'upcoming' }
];

const CPP_STAGES: CaseStage[] = [
    { name: 'Inquérito / Denúncia', status: 'completed' },
    { name: 'Recebimento da Denúncia', status: 'current' },
    { name: 'Resposta à Acusação', status: 'upcoming' },
    { name: 'Audiência de Instrução', status: 'upcoming' },
    { name: 'Alegações Finais', status: 'upcoming' },
    { name: 'Sentença Criminal', status: 'upcoming' },
    { name: 'Recursos', status: 'upcoming' }
];

const CLT_STAGES: CaseStage[] = [
    { name: 'Ajuizamento da Ação', status: 'completed' },
    { name: 'Audiência Inicial', status: 'current' },
    { name: 'Contestação e Defesa', status: 'upcoming' },
    { name: 'Audiência de Instrução', status: 'upcoming' },
    { name: 'Razões Finais', status: 'upcoming' },
    { name: 'Sentença Trabalhista', status: 'upcoming' },
    { name: 'Recursos / RO', status: 'upcoming' }
];

const initialActiveCases: Case[] = [
    {
        id: 'case1', clientName: 'Ana Clara Dias', title: 'Inventário e Partilha de Bens', status: 'Ativo', lawyerName: 'Dr. Carlos Andrade',
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
    const [activeSection, setActiveSection] = useState<'overview' | 'meusCasos' | 'codigos'>('overview');
    
    const [cases, setCases] = useState<Case[]>(() => {
        const saved = localStorage.getItem('legis_lawyer_cases');
        return saved ? JSON.parse(saved) : initialActiveCases;
    });

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);

    // Filters for Meus Casos
    const [filterOAB, setFilterOAB] = useState('');
    const [filterProcesso, setFilterProcesso] = useState('');
    const [filterCPF, setFilterCPF] = useState('');

    // Process/Lawsuit Registration Modal State
    const [showAddCaseForm, setShowAddCaseForm] = useState(false);
    const [clientData, setClientData] = useState({
        name: '',
        cpf: '',
        email: '',
        phone: '',
        address: '',
        isForeigner: false,
        foreignerDocument: '',
        countryOfOrigin: '',
        timeInBrazil: ''
    });
    const [processNumber, setProcessNumber] = useState('');
    const [caseTitle, setCaseTitle] = useState('');
    const [caseSummary, setCaseSummary] = useState('');
    const [procedureType, setProcedureType] = useState<'CPC' | 'CPP' | 'CLT' | 'Custom'>('CPC');
    const [customStages, setCustomStages] = useState<CaseStage[]>(CPC_STAGES);

    // Legal Codes State
    const [selectedCode, setSelectedCode] = useState<LegalCode | null>(null);
    const [codeSearchQuery, setCodeSearchQuery] = useState('');

    const filteredCases = useMemo(() => {
        return cases.filter(c => {
            const matchesOAB = !filterOAB || lawyer.oab.toLowerCase().includes(filterOAB.toLowerCase());
            const matchesProcesso = !filterProcesso || c.id.toLowerCase().includes(filterProcesso.toLowerCase());
            const matchesCPF = !filterCPF || c.clientName.toLowerCase().includes(filterCPF.toLowerCase());
            return matchesOAB && matchesProcesso && matchesCPF;
        });
    }, [cases, filterOAB, filterProcesso, filterCPF, lawyer.oab]);

    const handleOpenUpdateModal = (caseToUpdate: Case) => {
        setSelectedCase(caseToUpdate);
        setIsUpdateModalOpen(true);
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedCase(null);
    };

    const handleUpdateCaseStatus = (caseId: string, newCurrentStageName: string) => {
        const updated = cases.map(c => {
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
        });
        setCases(updated);
        localStorage.setItem('legis_lawyer_cases', JSON.stringify(updated));
        handleCloseUpdateModal();
    };

    const handleProcedureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value as 'CPC' | 'CPP' | 'CLT' | 'Custom';
        setProcedureType(type);
        if (type === 'CPC') setCustomStages(CPC_STAGES);
        else if (type === 'CPP') setCustomStages(CPP_STAGES);
        else if (type === 'CLT') setCustomStages(CLT_STAGES);
        else setCustomStages([{ name: 'Fase Inicial', status: 'completed' }]);
    };

    const handleStageNameChange = (index: number, name: string) => {
        setCustomStages(prev => prev.map((s, idx) => idx === index ? { ...s, name } : s));
    };

    const handleStageStatusChange = (index: number, status: CaseStage['status']) => {
        setCustomStages(prev => prev.map((s, idx) => idx === index ? { ...s, status } : s));
    };

    const addCustomStage = () => {
        setCustomStages(prev => [...prev, { name: '', status: 'upcoming' }]);
    };

    const removeCustomStage = (index: number) => {
        setCustomStages(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleAddCaseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newCase: Case = {
            id: processNumber,
            clientName: clientData.name,
            title: caseTitle,
            status: 'Ativo',
            lawyerName: lawyer.name,
            lawyerId: lawyer.id,
            stages: customStages
        };

        const updatedCases = [...cases, newCase];
        setCases(updatedCases);
        localStorage.setItem('legis_lawyer_cases', JSON.stringify(updatedCases));

        // Reset
        setClientData({
            name: '',
            cpf: '',
            email: '',
            phone: '',
            address: '',
            isForeigner: false,
            foreignerDocument: '',
            countryOfOrigin: '',
            timeInBrazil: ''
        });
        setProcessNumber('');
        setCaseTitle('');
        setCaseSummary('');
        setProcedureType('CPC');
        setCustomStages(CPC_STAGES);
        setShowAddCaseForm(false);
    };

    const highlightSearchText = (text: string, query: string) => {
        if (!query || !query.trim()) return text;
        const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
        return (
            <>
                {parts.map((part, idx) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <mark key={idx} className="bg-yellow-200 text-yellow-900 font-bold">{part}</mark>
                    ) : (
                        part
                    )
                )}
            </>
        );
    };

    return (
        <>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-neutral-light p-6 sm:p-8 rounded-lg animate-fade-in">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <div className="flex items-center space-x-4">
                            <img src={lawyer.photoUrl} alt={lawyer.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-primary" />
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Painel do Advogado</h1>
                                <p className="text-gray-600">Bem-vindo(a) de volta, {lawyer.name}!</p>
                            </div>
                        </div>
                        {/* Section Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveSection('overview')}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                    activeSection === 'overview'
                                        ? 'bg-primary text-white shadow'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                Visão Geral
                            </button>
                            <button
                                onClick={() => setActiveSection('meusCasos')}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                    activeSection === 'meusCasos'
                                        ? 'bg-primary text-white shadow'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                Meus Casos
                            </button>
                            <button
                                onClick={() => { setActiveSection('codigos'); setSelectedCode(dbCodes.getAll()[0] || null); }}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                                    activeSection === 'codigos'
                                        ? 'bg-primary text-white shadow'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                ⚖️ Códigos
                            </button>
                        </div>
                    </div>

                    {/* Meus Casos Section */}
                    {activeSection === 'meusCasos' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-700">Meus Casos</h2>
                                <button
                                    onClick={() => setShowAddCaseForm(true)}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark shadow transition-all duration-150"
                                >
                                    + Cadastrar Processo
                                </button>
                            </div>

                            {/* Filter Panel */}
                            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Filtros de Busca</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Número da OAB</label>
                                        <input
                                            type="text"
                                            value={filterOAB}
                                            onChange={e => setFilterOAB(e.target.value)}
                                            placeholder="Ex: SP123456"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Número do Processo</label>
                                        <input
                                            type="text"
                                            value={filterProcesso}
                                            onChange={e => setFilterProcesso(e.target.value)}
                                            placeholder="Ex: case001"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">CPF / Nome do Cliente</label>
                                        <input
                                            type="text"
                                            value={filterCPF}
                                            onChange={e => setFilterCPF(e.target.value)}
                                            placeholder="Ex: Ana Clara"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary p-2 border"
                                        />
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <button
                                        onClick={() => { setFilterOAB(''); setFilterProcesso(''); setFilterCPF(''); }}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Limpar Filtros
                                    </button>
                                </div>
                            </div>
                            {/* Cases List */}
                            <div className="space-y-6">
                                {filteredCases.length > 0 ? filteredCases.map(c => (
                                    <div key={c.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{c.title}</h3>
                                                <p className="text-sm text-gray-500">Cliente: {c.clientName}</p>
                                                <p className="text-xs text-gray-400 mt-1">Nº Processo: <span className="font-mono font-medium">{c.id}</span></p>
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
                                )) : (
                                    <p className="text-gray-500 text-center py-10 bg-white rounded-lg border border-gray-200">Nenhum caso encontrado com os filtros aplicados.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Overview Section */}
                    {activeSection === 'overview' && (
                        <>
                            <div className="mb-10" id="overview-stats">
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
                                    {cases.slice(0, 3).map(c => (
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
                                    {cases.length === 0 && (
                                        <p className="text-gray-500 text-center py-6">Você ainda não possui casos ativos.</p>
                                    )}
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
                                    {(activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {(activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).map(apt => (
                                                <AppointmentCard key={apt.id} appointment={apt} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-6">Nenhum agendamento encontrado.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Codes Section */}
                    {activeSection === 'codigos' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">⚖️ Biblioteca de Códigos Legais</h2>
                                    <p className="text-sm text-gray-500">Acesse as legislações federais necessárias para o exercício de sua advocacia.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Sidebar */}
                                <div className="md:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-2 h-[550px] overflow-y-auto">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Legislações</h3>
                                    {dbCodes.getAll().map(code => (
                                        <button
                                            key={code.id}
                                            onClick={() => { setSelectedCode(code); setCodeSearchQuery(''); }}
                                            className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-all ${
                                                selectedCode?.id === code.id
                                                    ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                                            }`}
                                        >
                                            <p className="font-semibold truncate">{code.title}</p>
                                            <p className="text-xs text-gray-400 mt-1">Atualizado em: {new Date(code.lastUpdated).toLocaleDateString('pt-BR')}</p>
                                        </button>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col h-[550px]">
                                    {selectedCode ? (
                                        <>
                                            <div className="border-b pb-4 mb-4 flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">{selectedCode.title}</h3>
                                                    <p className="text-xs text-gray-400">Última atualização: {new Date(selectedCode.lastUpdated).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                                {selectedCode.fileName && (
                                                    <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md border font-medium">
                                                        📄 {selectedCode.fileName}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mb-4">
                                                <input
                                                    type="text"
                                                    value={codeSearchQuery}
                                                    onChange={e => setCodeSearchQuery(e.target.value)}
                                                    placeholder="Buscar palavra-chave ou artigo no texto..."
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border"
                                                />
                                            </div>

                                            <div className="flex-grow overflow-y-auto bg-gray-50 border rounded-lg p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {highlightSearchText(selectedCode.content, codeSearchQuery)}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-3">
                                            <span className="text-5xl">⚖️</span>
                                            <p className="font-medium">Selecione uma legislação na barra lateral para começar a leitura.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Case updates */}
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

            {/* Add lawsuit modal */}
            {showAddCaseForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in my-8">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-xl font-bold text-gray-900">Cadastrar Novo Processo</h3>
                            <button onClick={() => setShowAddCaseForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleAddCaseSubmit} className="space-y-6 text-left">
                            {/* 1. DADOS DO CLIENTE */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-800 border-b pb-1">1. Dados do Cliente</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Nome Completo *</label>
                                        <input
                                            type="text"
                                            required
                                            value={clientData.name}
                                            onChange={e => setClientData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border"
                                            placeholder="Nome do cliente"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">CPF *</label>
                                        <input
                                            type="text"
                                            required
                                            value={clientData.cpf}
                                            onChange={e => setClientData(prev => ({ ...prev, cpf: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border"
                                            placeholder="000.000.000-00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">E-mail *</label>
                                        <input
                                            type="email"
                                            required
                                            value={clientData.email}
                                            onChange={e => setClientData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border"
                                            placeholder="email@exemplo.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Telefone *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={clientData.phone}
                                            onChange={e => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Endereço Residencial Completo *</label>
                                    <input
                                        type="text"
                                        required
                                        value={clientData.address}
                                        onChange={e => setClientData(prev => ({ ...prev, address: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border"
                                        placeholder="Rua, Número, Bairro, Cidade - Estado"
                                    />
                                </div>

                                {/* Checkbox Se Estrangeiro */}
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            id="client-isForeigner"
                                            type="checkbox"
                                            checked={clientData.isForeigner}
                                            onChange={e => setClientData(prev => ({ ...prev, isForeigner: e.target.checked }))}
                                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                        />
                                        <label htmlFor="client-isForeigner" className="ml-2 block text-xs font-medium text-gray-700">
                                            Cliente Estrangeiro
                                        </label>
                                    </div>

                                    {clientData.isForeigner && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 border rounded-lg animate-fade-in text-xs border-gray-200">
                                            <div>
                                                <label className="block font-medium text-gray-700 mb-1">Documento de Estrangeiro *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={clientData.foreignerDocument}
                                                    onChange={e => setClientData(prev => ({ ...prev, foreignerDocument: e.target.value }))}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                                    placeholder="Passaporte / RNE"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-medium text-gray-700 mb-1">País de Origem *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={clientData.countryOfOrigin}
                                                    onChange={e => setClientData(prev => ({ ...prev, countryOfOrigin: e.target.value }))}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                                    placeholder="Ex: Itália"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-medium text-gray-700 mb-1">Tempo no Brasil *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={clientData.timeInBrazil}
                                                    onChange={e => setClientData(prev => ({ ...prev, timeInBrazil: e.target.value }))}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                                    placeholder="Ex: 2 anos"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. DADOS DO PROCESSO */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-800 border-b pb-1">2. Dados do Processo</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Número do Processo *</label>
                                        <input
                                            type="text"
                                            required
                                            value={processNumber}
                                            onChange={e => setProcessNumber(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border"
                                            placeholder="Ex: 5001234-56.2026.8.26.0100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Título/Ação Judicial *</label>
                                        <input
                                            type="text"
                                            required
                                            value={caseTitle}
                                            onChange={e => setCaseTitle(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border"
                                            placeholder="Ex: Ação Revisional"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Resumo do Caso *</label>
                                    <textarea
                                        required
                                        value={caseSummary}
                                        onChange={e => setCaseSummary(e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border"
                                        placeholder="Resumo dos fatos e fundamentos do caso..."
                                    />
                                </div>
                            </div>

                            {/* 3. LINHA DE ANDAMENTO */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-800 border-b pb-1">3. Linha de Andamento Processual</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Rito/Procedimento de Andamento *</label>
                                        <select
                                            value={procedureType}
                                            onChange={handleProcedureChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white p-2 border"
                                        >
                                            <option value="CPC">Civil - Procedimento Comum (CPC)</option>
                                            <option value="CPP">Penal - Procedimento Ordinário (CPP)</option>
                                            <option value="CLT">Trabalhista - Rito Ordinário (CLT)</option>
                                            <option value="Custom">Personalizado / Outros</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg space-y-3">
                                    <label className="block text-xs font-bold text-gray-600">Fases do Processo (Linha do Tempo)</label>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                        {customStages.map((stage, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}.</span>
                                                <input
                                                    type="text"
                                                    value={stage.name}
                                                    onChange={e => handleStageNameChange(idx, e.target.value)}
                                                    className="flex-grow border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none p-1"
                                                    placeholder="Nome da Fase"
                                                />
                                                <select
                                                    value={stage.status}
                                                    onChange={e => handleStageStatusChange(idx, e.target.value as CaseStage['status'])}
                                                    className="border border-gray-300 rounded-md px-2 py-1 text-xs bg-white p-1"
                                                >
                                                    <option value="completed">Concluída</option>
                                                    <option value="current">Atual</option>
                                                    <option value="upcoming">Pendente</option>
                                                </select>
                                                {procedureType === 'Custom' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCustomStage(idx)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-bold px-1.5"
                                                    >
                                                        &times;
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {procedureType === 'Custom' && (
                                        <button
                                            type="button"
                                            onClick={addCustomStage}
                                            className="text-xs text-primary font-bold hover:underline"
                                        >
                                            + Adicionar Nova Fase
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowAddCaseForm(false)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/95"
                                >
                                    Criar Processo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
export default LawyerDashboard;