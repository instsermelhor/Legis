import React, { useState, useMemo } from 'react';
import type { Lawyer, Appointment, Case, CaseStage } from '../../types';
import { CalendarIcon, ClockIcon, VideoCameraIcon, UsersIcon, ClipboardListIcon, CurrencyDollarIcon, PencilIcon, CalendarPlusIcon } from '../common/IconComponents';
import { CaseProgressTracker } from '../common/CaseProgressTracker';
import { UpdateCaseStatusModal } from '../common/UpdateCaseStatusModal';
import { CalendarSyncModal } from '../common/CalendarSyncModal';
import { dbCodes, LegalCode } from '../../services/dbService';
import { FinancialKPI } from './FinancialKPI';
import { LegalManagementDashboard } from './LegalManagementDashboard';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { ChangeEmailModal } from '../common/ChangeEmailModal';
import { AREAS_OF_LAW, BRAZILIAN_STATES } from '../../constants';
import { mockInterns, mockSecretaries } from '../../services/mockDataService';
import { ApiStatusPanel } from '../common/ApiStatusPanel';
import type { MockIntern, MockSecretary } from '../../services/mockDataService';
import { LegalAiTools } from '../common/LegalAiTools';
import { EfficiencyServicesPage } from '../client/EfficiencyServicesPage';

const ALL_IA_TOOLS = [
    { key: 'pecas', label: '📄 Peças Jurídicas' },
    { key: 'pesquisas', label: '🔍 Pesquisas Jurídicas' },
    { key: 'audios', label: '🎙️ Comandos por Áudio' },
    { key: 'transcricao', label: '📝 Transcrição de Áudio' },
    { key: 'fundamentacoes', label: '⚖️ Fundamentações' },
    { key: 'revisao', label: '✍️ Revisão de Textos' },
    { key: 'jurisprudencia', label: '🏛️ Jurisprudências' },
    { key: 'manifestacao', label: '💼 Manifestações' },
];


interface LawyerDashboardProps {
    lawyer: Lawyer;
    onLogout?: () => void;
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

const GROUP_TYPES: Record<string, string[]> = {
    Civil: ['Procedimento Comum', 'Juizado Especial Cível', 'Execução de Título'],
    Penal: ['Procedimento Ordinário', 'Procedimento Sumário', 'Tribunal do Júri'],
    Trabalhista: ['Rito Ordinário', 'Rito Sumaríssimo'],
    Outro: ['Procedimento Especial', 'Outros']
};

const initialActiveCases: Case[] = [
    {
        id: 'case1', clientName: 'Ana Clara Dias', title: 'Inventário e Partilha de Bens', status: 'Ativo', lawyerName: 'Dr. Carlos Andrade',
        lawyerId: 1,
        group: 'Civil',
        caseType: 'Procedimento Comum',
        clientCpf: '123.456.789-00',
        clientAddress: 'Rua das Acácias, 45, São Paulo - SP',
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
        group: 'Trabalhista',
        caseType: 'Rito Ordinário',
        clientCpf: '987.654.321-00',
        clientAddress: 'Av. Atlântica, 200, Rio de Janeiro - RJ',
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
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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

export const LawyerDashboard: React.FC<LawyerDashboardProps> = ({ lawyer, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [activeSection, setActiveSection] = useState<'overview' | 'meusCasos' | 'gestaoJuridica' | 'codigos' | 'financeiro' | 'perfil' | 'estagiarios' | 'secretariado' | 'apis' | 'iaTools' | 'efficiency_services'>('overview');

    // Intern/Secretary selection state
    const [linkedInternId, setLinkedInternId] = useState<number | null>(() => {
        const saved = localStorage.getItem(`legis_lawyer_linked_intern_${lawyer.id}`);
        return saved ? Number(saved) : null;
    });
    const [linkedSecretaryId, setLinkedSecretaryId] = useState<number | null>(() => {
        const saved = localStorage.getItem(`legis_lawyer_linked_secretary_${lawyer.id}`);
        return saved ? Number(saved) : null;
    });
    const [internSearch, setInternSearch] = useState('');
    const [secretarySearch, setSecretarySearch] = useState('');
    const [confirmLinkIntern, setConfirmLinkIntern] = useState<MockIntern | null>(null);
    const [confirmLinkSecretary, setConfirmLinkSecretary] = useState<MockSecretary | null>(null);
    const [linkSuccess, setLinkSuccess] = useState<'intern' | 'secretary' | null>(null);

    // AI Tools Permissions state
    const [internPerms, setInternPerms] = useState<string[]>([]);
    const [secretaryPerms, setSecretaryPerms] = useState<string[]>([]);

    React.useEffect(() => {
        if (linkedInternId !== null) {
            localStorage.setItem(`legis_lawyer_linked_intern_${lawyer.id}`, String(linkedInternId));
            const saved = localStorage.getItem(`legis_perms_intern_${linkedInternId}`);
            setInternPerms(saved ? JSON.parse(saved) : ['pecas', 'pesquisas', 'audios', 'transcricao', 'fundamentacoes', 'revisao', 'jurisprudencia', 'manifestacao']);
        } else {
            localStorage.removeItem(`legis_lawyer_linked_intern_${lawyer.id}`);
            setInternPerms([]);
        }
    }, [linkedInternId, lawyer.id]);

    React.useEffect(() => {
        if (linkedSecretaryId !== null) {
            localStorage.setItem(`legis_lawyer_linked_secretary_${lawyer.id}`, String(linkedSecretaryId));
            const saved = localStorage.getItem(`legis_perms_secretary_${linkedSecretaryId}`);
            setSecretaryPerms(saved ? JSON.parse(saved) : ['pecas', 'pesquisas', 'audios', 'transcricao', 'fundamentacoes', 'revisao', 'jurisprudencia', 'manifestacao']);
        } else {
            localStorage.removeItem(`legis_lawyer_linked_secretary_${lawyer.id}`);
            setSecretaryPerms([]);
        }
    }, [linkedSecretaryId, lawyer.id]);

    const toggleInternPerm = (perm: string) => {
        setInternPerms(prev => {
            const next = prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm];
            if (linkedInternId) {
                localStorage.setItem(`legis_perms_intern_${linkedInternId}`, JSON.stringify(next));
            }
            return next;
        });
    };

    const toggleSecretaryPerm = (perm: string) => {
        setSecretaryPerms(prev => {
            const next = prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm];
            if (linkedSecretaryId) {
                localStorage.setItem(`legis_perms_secretary_${linkedSecretaryId}`, JSON.stringify(next));
            }
            return next;
        });
    };


    // Profile Editing State
    const [profileData, setProfileData] = useState({
        name: lawyer.name || '',
        oab: lawyer.oab || '',
        oabUF: lawyer.oabUF || '',
        bio: lawyer.bio || '',
        phone: lawyer.contact?.phone || '',
        email: lawyer.contact?.email || '',
        city: lawyer.location?.city || '',
        state: lawyer.location?.state || '',
        cpf: lawyer.cpf || '',
        rg: lawyer.rg || '',
        dataNasc: lawyer.dataNasc || '',
        estadoCivil: lawyer.estadoCivil || '',
        naturalidade: lawyer.naturalidade || '',
        // Residential address (structured)
        resCep: '',
        resStreet: lawyer.address || '',
        resNumber: '',
        resComplement: '',
        resNeighborhood: '',
        resCity: lawyer.location?.city || '',
        resState: lawyer.location?.state || '',
        // Commercial address (structured)
        comSameAsRes: false,
        comCep: '',
        comStreet: lawyer.commercialAddress || '',
        comNumber: '',
        comComplement: '',
        comNeighborhood: '',
        comCity: '',
        comState: '',
        address: lawyer.address || '',
        commercialAddress: lawyer.commercialAddress || '',
        consultationFee: String(lawyer.consultationFee || ''),
        primarySpecialties: lawyer.primarySpecialties || lawyer.specialties.slice(0, 3),
        secondarySpecialties: lawyer.secondarySpecialties || lawyer.specialties.slice(3),
    });
    const [sameAddress, setSameAddress] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    
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
    const [filterGroup, setFilterGroup] = useState('');
    const [filterCaseType, setFilterCaseType] = useState('');

    // Process/Lawsuit Registration Form State
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

    // Confirmation popups
    const [pendingCaseToAdd, setPendingCaseToAdd] = useState<{ caseData: Case; clientData: typeof clientData } | null>(null);
    const [confirmingCase, setConfirmingCase] = useState<Case | null>(null);
    const [confirmDetailsInputs, setConfirmDetailsInputs] = useState({ processNumber: '', cpf: '' });
    const [detailsError, setDetailsError] = useState('');
    const [viewingCaseDetails, setViewingCaseDetails] = useState<Case | null>(null);

    // Legal Codes State
    const [legalCodes, setLegalCodes] = useState<LegalCode[]>(() => dbCodes.getAll());
    const [selectedCode, setSelectedCode] = useState<LegalCode | null>(() => dbCodes.getAll()[0] || null);
    const [selectedVersionId, setSelectedVersionId] = useState<string>('');
    const [codeSearchQuery, setCodeSearchQuery] = useState('');

    const currentCodeVersion = useMemo(() => {
        if (!selectedCode) return null;
        const versions = selectedCode.versions || [];
        const activeVer = versions.find(v => v.id === selectedVersionId) || 
                          versions.find(v => v.id === selectedCode.activeVersionId) || 
                          versions[0] || null;
        return activeVer;
    }, [selectedCode, selectedVersionId]);

    // Refresh codes from storage when the codes section becomes active
    const handleActivateCodes = () => {
        const fresh = dbCodes.getAll();
        setLegalCodes(fresh);
        setSelectedCode(prev => fresh.find(c => c.id === prev?.id) || fresh[0] || null);
        setSelectedVersionId('');
        setActiveSection('codigos');
    };

    const filteredCases = useMemo(() => {
        return cases.filter(c => {
            const matchesOAB = !filterOAB || lawyer.oab.toLowerCase().includes(filterOAB.toLowerCase());
            const matchesProcesso = !filterProcesso || c.id.toLowerCase().includes(filterProcesso.toLowerCase());
            const matchesCPF = !filterCPF || 
                c.clientName.toLowerCase().includes(filterCPF.toLowerCase()) || 
                (c.clientCpf || '').replace(/\D/g, '').includes(filterCPF.replace(/\D/g, ''));
            const matchesGroup = !filterGroup || c.group === filterGroup;
            const matchesCaseType = !filterCaseType || (c.caseType || '').toLowerCase().includes(filterCaseType.toLowerCase());
            return matchesOAB && matchesProcesso && matchesCPF && matchesGroup && matchesCaseType;
        });
    }, [cases, filterOAB, filterProcesso, filterCPF, filterGroup, filterCaseType, lawyer.oab]);

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
        
        let group: Case['group'] = 'Civil';
        let caseType = 'Procedimento Comum';
        if (procedureType === 'CPC') {
            group = 'Civil';
            caseType = 'Procedimento Comum (CPC)';
        } else if (procedureType === 'CPP') {
            group = 'Penal';
            caseType = 'Procedimento Ordinário (CPP)';
        } else if (procedureType === 'CLT') {
            group = 'Trabalhista';
            caseType = 'Rito Ordinário (CLT)';
        } else {
            group = 'Outro';
            caseType = 'Personalizado';
        }

        const newCase: Case = {
            id: processNumber,
            clientName: clientData.name,
            title: caseTitle,
            status: 'Ativo',
            lawyerName: lawyer.name,
            lawyerId: lawyer.id,
            stages: customStages,
            group,
            caseType,
            clientCpf: clientData.cpf,
            clientAddress: clientData.address
        };

        setPendingCaseToAdd({ caseData: newCase, clientData: { ...clientData } });
    };

    const handleConfirmAddCase = () => {
        if (!pendingCaseToAdd) return;
        const updatedCases = [...cases, pendingCaseToAdd.caseData];
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
        setPendingCaseToAdd(null);
        setShowAddCaseForm(false);
    };

    const handleOpenDetailsConfirm = (c: Case) => {
        setConfirmingCase(c);
        setConfirmDetailsInputs({ processNumber: '', cpf: '' });
        setDetailsError('');
    };

    const handleDetailsConfirmSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const inputProcess = confirmDetailsInputs.processNumber.trim();
        const inputCpfClean = confirmDetailsInputs.cpf.replace(/\D/g, '');
        const caseProcess = (confirmingCase?.id || '').trim();
        const caseCpfClean = (confirmingCase?.clientCpf || '').replace(/\D/g, '');

        if (inputProcess !== caseProcess) {
            setDetailsError('Número de processo incorreto.');
            return;
        }
        if (inputCpfClean !== caseCpfClean) {
            setDetailsError('CPF do cliente incorreto para este processo.');
            return;
        }
        setViewingCaseDetails(confirmingCase);
        setConfirmingCase(null);
    };

    const highlightSearchText = (text: string, query: string) => {
        if (!query || !query.trim()) return text;
        const parts = text.split(new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
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
                        <div className="flex gap-2 flex-wrap">
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
                                onClick={() => setActiveSection('gestaoJuridica')}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                                    activeSection === 'gestaoJuridica'
                                        ? 'bg-primary text-white shadow'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                ⚖️ Gestão Jurídica
                            </button>
                            <button
                                onClick={() => setActiveSection('financeiro')}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                                    activeSection === 'financeiro'
                                        ? 'bg-primary text-white shadow'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                📊 Financeiro
                            </button>
                            <button
                                onClick={handleActivateCodes}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                                    activeSection === 'codigos'
                                        ? 'bg-primary text-white shadow'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                ⚖️ Códigos
                            </button>
                            <button
                                onClick={() => setActiveSection('perfil')}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                                    activeSection === 'perfil'
                                        ? 'bg-primary text-white shadow'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                👤 Meu Perfil
                            </button>
                            <button
                                onClick={() => setActiveSection('estagiarios')}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                                    activeSection === 'estagiarios'
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                🎓 Estagiários
                            </button>
                            <button
                                onClick={() => setActiveSection('secretariado')}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                                    activeSection === 'secretariado'
                                        ? 'bg-purple-600 text-white shadow'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                🗂️ Secret./Assist. Jurídico
                            </button>
                            <button
                                onClick={() => setActiveSection('apis')}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                                    activeSection === 'apis'
                                        ? 'bg-teal-600 text-white shadow'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                🔌 APIs
                            </button>
                            <button
                                onClick={() => setActiveSection('iaTools')}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                                    activeSection === 'iaTools'
                                        ? 'bg-primary text-white shadow'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                ⚡ IA Jurídica
                            </button>
                            <button
                                onClick={() => setActiveSection('efficiency_services')}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                                    activeSection === 'efficiency_services'
                                        ? 'bg-primary text-white shadow'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                💼 Serviços de Eficiência
                            </button>

                            {onLogout && (
                                <button
                                    onClick={onLogout}
                                    className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 ml-auto"
                                >
                                    🚪 Sair
                                </button>
                            )}
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
                            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Filtros de Busca</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Número da OAB</label>
                                        <input
                                            type="text"
                                            value={filterOAB}
                                            onChange={e => setFilterOAB(e.target.value)}
                                            placeholder="Ex: SP123456"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Número do Processo</label>
                                        <input
                                            type="text"
                                            value={filterProcesso}
                                            onChange={e => setFilterProcesso(e.target.value)}
                                            placeholder="Ex: case001"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">CPF / Nome do Cliente</label>
                                        <input
                                            type="text"
                                            value={filterCPF}
                                            onChange={e => setFilterCPF(e.target.value)}
                                            placeholder="Ex: Ana Clara"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Grupo (Rito)</label>
                                        <select
                                            value={filterGroup}
                                            onChange={e => { setFilterGroup(e.target.value); setFilterCaseType(''); }}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                        >
                                            <option value="">Todos</option>
                                            <option value="Civil">Civil</option>
                                            <option value="Penal">Penal / Criminal</option>
                                            <option value="Trabalhista">Trabalhista</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Processo</label>
                                        {filterGroup && GROUP_TYPES[filterGroup] ? (
                                            <select
                                                value={filterCaseType}
                                                onChange={e => setFilterCaseType(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                            >
                                                <option value="">Todos</option>
                                                {GROUP_TYPES[filterGroup].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                value={filterCaseType}
                                                onChange={e => setFilterCaseType(e.target.value)}
                                                placeholder="Ex: Rito Ordinário"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <button
                                        onClick={() => { setFilterOAB(''); setFilterProcesso(''); setFilterCPF(''); setFilterGroup(''); setFilterCaseType(''); }}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Limpar Filtros
                                    </button>
                                </div>
                            </div>
                            {/* Cases List */}
                            <div className="space-y-6">
                                {filteredCases.length > 0 ? filteredCases.map(c => (
                                    <div key={c.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                        <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{c.title}</h3>
                                                <p className="text-sm text-gray-500">Cliente: {c.clientName}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Nº Processo: <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-1 py-0.5 rounded">{c.id}</span>
                                                    {c.group && <span className="ml-2 text-gray-500">· Rito: <strong>{c.group} ({c.caseType})</strong></span>}
                                                </p>
                                            </div>
                                            <span className="bg-primary/10 text-primary text-xs font-medium mt-2 sm:mt-0 px-2.5 py-0.5 rounded-full">{c.status}</span>
                                        </div>
                                        <CaseProgressTracker stages={c.stages} />
                                        <div className="mt-4 border-t pt-4 flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={() => handleOpenDetailsConfirm(c)}
                                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Ver Detalhes / Localização
                                            </button>
                                            <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">Enviar Mensagem</button>
                                            <button onClick={() => handleOpenUpdateModal(c)} className="flex-1 px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                                                <PencilIcon className="w-4 h-4" />
                                                Atualizar Andamento
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-gray-500 text-center py-10 bg-white rounded-lg border border-gray-200 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">Nenhum caso encontrado com os filtros aplicados.</p>
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
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
                                    <button
                                        onClick={() => setActiveSection('financeiro')}
                                        className="w-full mt-6 bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                    >
                                        Ver Relatório Financeiro Completo
                                    </button>
                                </div>
                            </div>

                            <div className="mb-10">
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">Casos Ativos</h2>
                                <div className="space-y-6">
                                    {cases.slice(0, 3).map(c => (
                                        <div key={c.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">{c.title}</h3>
                                                    <p className="text-sm text-gray-500">Cliente: {c.clientName}</p>
                                                </div>
                                                <span className="bg-primary/10 text-primary text-xs font-medium mt-2 sm:mt-0 px-2.5 py-0.5 rounded-full">{c.status}</span>
                                            </div>
                                            <CaseProgressTracker stages={c.stages} />
                                            <div className="mt-4 border-t pt-4 flex flex-col sm:flex-row gap-3">
                                                <button
                                                    onClick={() => handleOpenDetailsConfirm(c)}
                                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    Ver Detalhes / Localização
                                                </button>
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
                                        className="mt-2 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                    >
                                        <CalendarPlusIcon className="w-5 h-5 text-gray-500" />
                                        Sincronizar Calendário
                                    </button>
                                </div>
                                <div className="border-b border-gray-200 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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

                    {/* Financial KPI section */}
                    {activeSection === 'financeiro' && (
                        <FinancialKPI lawyerId={lawyer.id} />
                    )}

                    {/* Legal Management Dashboard section */}
                    {activeSection === 'gestaoJuridica' && (
                        <LegalManagementDashboard />
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
                                <div className="md:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-2 h-[550px] overflow-y-auto dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Legislações</h3>
                                    {legalCodes.map(code => (
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
                                <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col h-[550px] dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                    {selectedCode ? (
                                        <>
                                            <div className="border-b pb-4 mb-4 flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{selectedCode.title}</h3>
                                                    <p className="text-xs text-gray-400">
                                                        Última atualização: {currentCodeVersion ? new Date(currentCodeVersion.lastUpdated).toLocaleDateString('pt-BR') : new Date(selectedCode.lastUpdated).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {(selectedCode.versions || []).length > 1 && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[10px] text-gray-400 uppercase font-bold shrink-0">Versão:</span>
                                                            <select
                                                                value={currentCodeVersion?.id || ''}
                                                                onChange={e => setSelectedVersionId(e.target.value)}
                                                                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-none dark:bg-[#2A2545] dark:text-white dark:border-[#3A3555]"
                                                            >
                                                                {(selectedCode.versions || []).map(v => (
                                                                    <option key={v.id} value={v.id}>{v.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}
                                                    {currentCodeVersion?.fileName && (
                                                        <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-1 rounded border font-semibold dark:bg-[#2A2545] dark:text-gray-300 dark:border-[#3A3555] whitespace-nowrap">
                                                            📄 {currentCodeVersion.fileName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {currentCodeVersion?.fileType === 'pdf' && currentCodeVersion.fileDataUrl ? (
                                                <>
                                                    <div className="mb-3 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-950/40 dark:text-blue-400 text-xs px-3 py-2 rounded-lg flex items-center gap-2 shrink-0">
                                                        <span>ℹ️</span>
                                                        <span>Leitura de PDF integrada. Use as ferramentas de pesquisa nativas do leitor de PDF (Ctrl+F ou Cmd+F) para pesquisar.</span>
                                                    </div>
                                                    <div className="flex-grow border border-gray-200 rounded-lg overflow-hidden bg-gray-150/40">
                                                        <iframe
                                                            src={currentCodeVersion.fileDataUrl}
                                                            className="w-full h-full border-0"
                                                            title={selectedCode.title}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="mb-4 shrink-0">
                                                        <input
                                                            type="text"
                                                            value={codeSearchQuery}
                                                            onChange={e => setCodeSearchQuery(e.target.value)}
                                                            placeholder="Buscar palavra-chave ou artigo no texto..."
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                                        />
                                                    </div>
                                                    <div className="flex-grow overflow-y-auto bg-gray-50 dark:bg-black/10 border dark:border-[#2A2545] rounded-lg p-4 font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                        {highlightSearchText(currentCodeVersion?.content || selectedCode.content, codeSearchQuery)}
                                                    </div>
                                                </>
                                            )}
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

                    {/* ─── MEU PERFIL SECTION ────────────────────────────────────── */}
                    {activeSection === 'perfil' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <h3 className="text-base font-bold text-gray-800 border-b pb-2">Dados Pessoais e Profissionais</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nome Completo</label>
                                        <input value={profileData.name} onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">CPF</label>
                                        <input value={profileData.cpf} onChange={e => setProfileData(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">RG</label>
                                        <input value={profileData.rg} onChange={e => setProfileData(p => ({ ...p, rg: e.target.value }))} placeholder="00.000.000-0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Data de Nascimento</label>
                                        <input type="date" value={profileData.dataNasc} onChange={e => setProfileData(p => ({ ...p, dataNasc: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Estado Civil</label>
                                        <select value={profileData.estadoCivil} onChange={e => setProfileData(p => ({ ...p, estadoCivil: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                            <option value="">Selecione...</option>
                                            {['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'].map(v => <option key={v}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Naturalidade</label>
                                        <input value={profileData.naturalidade} onChange={e => setProfileData(p => ({ ...p, naturalidade: e.target.value }))} placeholder="Cidade - UF" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nº OAB</label>
                                        <input value={profileData.oab} onChange={e => setProfileData(p => ({ ...p, oab: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Estado OAB (UF)</label>
                                        <select value={profileData.oabUF} onChange={e => setProfileData(p => ({ ...p, oabUF: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                            <option value="">Selecione...</option>
                                            {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.uf}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Telefone</label>
                                        <input value={profileData.phone} onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Valor Consulta (R$)</label>
                                        <input type="number" value={profileData.consultationFee} onChange={e => setProfileData(p => ({ ...p, consultationFee: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Biografia / Apresentação Profissional</label>
                                        <textarea value={profileData.bio} onChange={e => setProfileData(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Especialidades */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <div>
                                    <h3 className="text-base font-bold text-gray-800 border-b pb-2 mb-3">Áreas de Atuação</h3>
                                    <p className="text-xs text-gray-500 mb-4">Selecione até 3 especialidades <strong>principais</strong>. As demais serão classificadas como secundárias.</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {AREAS_OF_LAW.map(area => {
                                        const isPrimary = profileData.primarySpecialties.includes(area);
                                        const isSecondary = profileData.secondarySpecialties.includes(area);
                                        const isSelected = isPrimary || isSecondary;
                                        const canSelectPrimary = profileData.primarySpecialties.length < 3;
                                        return (
                                            <label key={area} className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer text-xs font-medium transition-colors ${isPrimary ? 'bg-primary/10 border-primary text-primary' : isSecondary ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-primary/40'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        if (isSelected) {
                                                            setProfileData(p => ({
                                                                ...p,
                                                                primarySpecialties: p.primarySpecialties.filter(s => s !== area),
                                                                secondarySpecialties: p.secondarySpecialties.filter(s => s !== area),
                                                            }));
                                                        } else if (canSelectPrimary) {
                                                            setProfileData(p => ({ ...p, primarySpecialties: [...p.primarySpecialties, area] }));
                                                        } else {
                                                            setProfileData(p => ({ ...p, secondarySpecialties: [...p.secondarySpecialties, area] }));
                                                        }
                                                    }}
                                                    className="mt-0.5"
                                                />
                                                <span>
                                                    {area}
                                                    {isPrimary && <span className="ml-1 text-primary font-bold">(Principal)</span>}
                                                    {isSecondary && <span className="ml-1 text-blue-600">(Secundária)</span>}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-4 text-xs mt-2">
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary/30 inline-block" /> Primária (máx 3)</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-200 inline-block" /> Secundária (ilimitada)</span>
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <h3 className="text-base font-bold text-gray-800 border-b pb-2">Endereços</h3>

                                {/* Residencial */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">🏠 Endereço Residencial</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">CEP</label>
                                            <input value={profileData.resCep} onChange={e => setProfileData(p => ({ ...p, resCep: e.target.value }))} placeholder="00000-000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Rua / Logradouro</label>
                                            <input value={profileData.resStreet} onChange={e => setProfileData(p => ({ ...p, resStreet: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Número</label>
                                            <input value={profileData.resNumber} onChange={e => setProfileData(p => ({ ...p, resNumber: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Complemento</label>
                                            <input value={profileData.resComplement} onChange={e => setProfileData(p => ({ ...p, resComplement: e.target.value }))} placeholder="Apto, Bloco..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Bairro</label>
                                            <input value={profileData.resNeighborhood} onChange={e => setProfileData(p => ({ ...p, resNeighborhood: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Cidade</label>
                                            <input value={profileData.resCity} onChange={e => setProfileData(p => ({ ...p, resCity: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Estado (UF)</label>
                                            <select value={profileData.resState} onChange={e => setProfileData(p => ({ ...p, resState: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                                <option value="">Selecione...</option>
                                                {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Comercial */}
                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">🏢 Endereço Comercial (Escritório)</h4>
                                        <label className="flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={sameAddress}
                                                onChange={e => {
                                                    const v = e.target.checked;
                                                    setSameAddress(v);
                                                    if (v) {
                                                        setProfileData(p => ({
                                                            ...p,
                                                            comCep: p.resCep,
                                                            comStreet: p.resStreet,
                                                            comNumber: p.resNumber,
                                                            comComplement: p.resComplement,
                                                            comNeighborhood: p.resNeighborhood,
                                                            comCity: p.resCity,
                                                            comState: p.resState,
                                                        }));
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            Mesmo endereço residencial
                                        </label>
                                    </div>
                                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity ${sameAddress ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">CEP</label>
                                            <input value={profileData.comCep} onChange={e => setProfileData(p => ({ ...p, comCep: e.target.value }))} placeholder="00000-000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Rua / Logradouro</label>
                                            <input value={profileData.comStreet} onChange={e => setProfileData(p => ({ ...p, comStreet: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Número</label>
                                            <input value={profileData.comNumber} onChange={e => setProfileData(p => ({ ...p, comNumber: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Complemento / Sala</label>
                                            <input value={profileData.comComplement} onChange={e => setProfileData(p => ({ ...p, comComplement: e.target.value }))} placeholder="Sala, Andar..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Bairro</label>
                                            <input value={profileData.comNeighborhood} onChange={e => setProfileData(p => ({ ...p, comNeighborhood: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Cidade</label>
                                            <input value={profileData.comCity} onChange={e => setProfileData(p => ({ ...p, comCity: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Estado (UF)</label>
                                            <select value={profileData.comState} onChange={e => setProfileData(p => ({ ...p, comState: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                                <option value="">Selecione...</option>
                                                {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Segurança */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <h3 className="text-base font-bold text-gray-800 border-b pb-2">🔐 Segurança de Acesso</h3>
                                <p className="text-sm text-gray-500">Mantenha seus dados de acesso seguros e atualizados.</p>
                                <div className="flex flex-wrap gap-3">
                                    <button onClick={() => setShowPasswordModal(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                                        🔑 Alterar Senha
                                    </button>
                                    <button onClick={() => setShowEmailModal(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                                        📧 Alterar E-mail de Acesso
                                    </button>
                                </div>
                                <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                                    E-mail atual: <strong>{profileData.email || lawyer.contact.email}</strong>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2500); }}
                                    className="px-6 py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-md"
                                >
                                    {profileSaved ? '✓ Perfil Salvo!' : 'Salvar Perfil'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ─── ESTAGIÁRIOS SECTION ─────────────────────────────────────── */}
                    {activeSection === 'estagiarios' && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">🎓 Escolher Estagiário</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Selecione um bacharelando para atuar como estagiário vinculado ao seu escritório.</p>
                                </div>
                                {linkedInternId && (
                                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 text-xs font-semibold text-indigo-700">
                                        ✅ Estagiário vinculado: {mockInterns.find(i => i.id === linkedInternId)?.name}
                                    </div>
                                )}
                            </div>

                            {/* Search */}
                            <input
                                value={internSearch}
                                onChange={e => setInternSearch(e.target.value)}
                                placeholder="Buscar por nome, universidade ou área de interesse..."
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                            />

                            {/* Checkbox permissions grid */}
                            {linkedInternId && (
                                <div className="bg-white rounded-xl border border-indigo-200 shadow-sm p-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                    <h4 className="font-bold text-xs text-gray-800 mb-1 flex items-center gap-1.5 dark:text-gray-100">
                                        <span>⚙️</span> Controle de Acesso do Estagiário ({mockInterns.find(i => i.id === linkedInternId)?.name})
                                    </h4>
                                    <p className="text-[11px] text-gray-500 mb-3">Selecione quais ferramentas baseadas em IA o estagiário poderá acessar no painel dele:</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {ALL_IA_TOOLS.map(t => {
                                            const isChecked = internPerms.includes(t.key);
                                            return (
                                                <label key={t.key} className="flex items-center gap-2 p-2 rounded-lg border border-gray-250 hover:bg-gray-50 cursor-pointer transition-colors dark:border-[#2A2545] dark:hover:bg-[#2A2545]">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleInternPerm(t.key)}
                                                        className="rounded border-gray-300 text-indigo-650 focus:ring-indigo-550 dark:bg-black/20 dark:border-gray-655"
                                                    />
                                                    <span className="text-[11px] font-semibold text-gray-805 dark:text-gray-200">{t.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}



                            {/* Success Banner */}
                            {linkSuccess === 'intern' && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700 font-semibold text-sm">
                                    🎉 Estagiário vinculado com sucesso! Ele receberá uma notificação com suas informações.
                                </div>
                            )}

                            {/* Intern Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mockInterns
                                    .filter(i => {
                                        const q = internSearch.toLowerCase();
                                        return !q || i.name.toLowerCase().includes(q) || i.university.toLowerCase().includes(q) || i.specialtyInterest.toLowerCase().includes(q);
                                    })
                                    .map(intern => {
                                        const isLinked = linkedInternId === intern.id;
                                        return (
                                            <div key={intern.id} className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 transition-all ${isLinked ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-200 hover:shadow-md'}`}>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                                                            {intern.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{intern.name}</p>
                                                            <p className="text-xs text-gray-500">{intern.city || '—'} {intern.state ? `/ ${intern.state}` : ''}</p>
                                                        </div>
                                                    </div>
                                                    {isLinked && <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">Vinculado</span>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                    <div><span className="font-semibold text-gray-700">Universidade:</span><br />{intern.university}</div>
                                                    <div><span className="font-semibold text-gray-700">Semestre:</span><br />{intern.semester}</div>
                                                    <div className="col-span-2"><span className="font-semibold text-gray-700">Área de Interesse:</span> {intern.specialtyInterest}</div>
                                                </div>
                                                <div className="pt-2 border-t flex gap-2">
                                                    {isLinked ? (
                                                        <button
                                                            onClick={() => { setLinkedInternId(null); setLinkSuccess(null); }}
                                                            className="flex-1 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                                        >
                                                            Desvincular
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmLinkIntern(intern)}
                                                            className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                                                        >
                                                            Escolher como Estagiário
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>

                            {/* Confirm Modal */}
                            {confirmLinkIntern && (
                                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setConfirmLinkIntern(null)}>
                                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
                                        <h3 className="font-bold text-gray-900 text-lg">Confirmar Vinculação</h3>
                                        <p className="text-sm text-gray-600">
                                            Você está prestes a vincular <strong>{confirmLinkIntern.name}</strong> como estagiário do seu escritório.
                                        </p>
                                        <div className="bg-indigo-50 rounded-xl p-4 text-xs space-y-1.5">
                                            <p><strong>Universidade:</strong> {confirmLinkIntern.university}</p>
                                            <p><strong>Semestre:</strong> {confirmLinkIntern.semester}</p>
                                            <p><strong>Área de Interesse:</strong> {confirmLinkIntern.specialtyInterest}</p>
                                            <p><strong>Cidade:</strong> {confirmLinkIntern.city || '—'}</p>
                                        </div>
                                        <p className="text-xs text-gray-500">O bacharelando receberá uma notificação com suas informações de contato.</p>
                                        <div className="flex gap-3">
                                            <button onClick={() => setConfirmLinkIntern(null)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancelar</button>
                                            <button
                                                onClick={() => {
                                                    setLinkedInternId(confirmLinkIntern.id);
                                                    setLinkSuccess('intern');
                                                    setConfirmLinkIntern(null);
                                                    setTimeout(() => setLinkSuccess(null), 5000);
                                                }}
                                                className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
                                            >
                                                ✓ Confirmar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── SECRETARIADO SECTION ────────────────────────────────────── */}
                    {activeSection === 'secretariado' && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">🗂️ Secret./Assist. Jurídico</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Encontre e contrate profissionais de Secret./Assist. Jurídico para o seu escritório.</p>
                                </div>
                                {linkedSecretaryId && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 text-xs font-semibold text-purple-700">
                                        ✅ Secretário(a) vinculado: {mockSecretaries.find(s => s.id === linkedSecretaryId)?.name}
                                    </div>
                                )}
                            </div>

                            {/* Search */}
                            <input
                                value={secretarySearch}
                                onChange={e => setSecretarySearch(e.target.value)}
                                placeholder="Buscar por nome, cidade ou área de conhecimento..."
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                            />

                            {/* Checkbox permissions grid */}
                            {linkedSecretaryId && (
                                <div className="bg-white rounded-xl border border-purple-200 shadow-sm p-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                    <h4 className="font-bold text-xs text-gray-800 mb-1 flex items-center gap-1.5 dark:text-gray-100">
                                        <span>⚙️</span> Controle de Acesso do(a) Secretário(a) ({mockSecretaries.find(s => s.id === linkedSecretaryId)?.name})
                                    </h4>
                                    <p className="text-[11px] text-gray-500 mb-3">Selecione quais ferramentas baseadas em IA o(a) secretário(a) poderá acessar no painel dele(a):</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {ALL_IA_TOOLS.map(t => {
                                            const isChecked = secretaryPerms.includes(t.key);
                                            return (
                                                <label key={t.key} className="flex items-center gap-2 p-2 rounded-lg border border-gray-250 hover:bg-gray-50 cursor-pointer transition-colors dark:border-[#2A2545] dark:hover:bg-[#2A2545]">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleSecretaryPerm(t.key)}
                                                        className="rounded border-gray-300 text-purple-650 focus:ring-purple-550 dark:bg-black/20 dark:border-gray-655"
                                                    />
                                                    <span className="text-[11px] font-semibold text-gray-805 dark:text-gray-200">{t.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}



                            {/* Success Banner */}
                            {linkSuccess === 'secretary' && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700 font-semibold text-sm">
                                    🎉 Secretário(a) vinculado com sucesso! Ele(a) receberá uma notificação com suas informações.
                                </div>
                            )}

                            {/* Secretary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mockSecretaries
                                    .filter(s => {
                                        const q = secretarySearch.toLowerCase();
                                        return !q || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.areasOfKnowledge.some(a => a.toLowerCase().includes(q));
                                    })
                                    .map(sec => {
                                        const isLinked = linkedSecretaryId === sec.id;
                                        const availLabel = sec.availability === 'integral' ? 'Integral' : sec.availability === 'meio-periodo' ? 'Meio Período' : 'Freelancer';
                                        return (
                                            <div key={sec.id} className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 transition-all ${isLinked ? 'border-purple-400 ring-2 ring-purple-100' : 'border-gray-200 hover:shadow-md'}`}>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center shrink-0">
                                                            {sec.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{sec.name}</p>
                                                            <p className="text-xs text-gray-500">{sec.city} / {sec.state}</p>
                                                        </div>
                                                    </div>
                                                    {isLinked && <span className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">Vinculado</span>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                    <div><span className="font-semibold text-gray-700">Experiência:</span><br />{sec.experience} anos</div>
                                                    <div><span className="font-semibold text-gray-700">Disponibilidade:</span><br />{availLabel}</div>
                                                    <div className="col-span-2">
                                                        <span className="font-semibold text-gray-700">Áreas de Conhecimento:</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {sec.areasOfKnowledge.slice(0, 3).map(a => (
                                                                <span key={a} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] font-medium">{a}</span>
                                                            ))}
                                                            {sec.areasOfKnowledge.length > 3 && <span className="text-[10px] text-gray-400">+{sec.areasOfKnowledge.length - 3} mais</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                {sec.bio && <p className="text-xs text-gray-500 border-t pt-2 line-clamp-2">{sec.bio}</p>}
                                                <div className="pt-1 flex gap-2">
                                                    {isLinked ? (
                                                        <button
                                                            onClick={() => { setLinkedSecretaryId(null); setLinkSuccess(null); }}
                                                            className="flex-1 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                                        >
                                                            Desvincular
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmLinkSecretary(sec)}
                                                            className="flex-1 py-2 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                                                        >
                                                            Contratar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>

                            {/* Confirm Modal */}
                            {confirmLinkSecretary && (
                                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setConfirmLinkSecretary(null)}>
                                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
                                        <h3 className="font-bold text-gray-900 text-lg">Confirmar Contratação</h3>
                                        <p className="text-sm text-gray-600">
                                            Você está prestes a contratar <strong>{confirmLinkSecretary.name}</strong> para secretariar seu escritório.
                                        </p>
                                        <div className="bg-purple-50 rounded-xl p-4 text-xs space-y-1.5">
                                            <p><strong>Localização:</strong> {confirmLinkSecretary.city} / {confirmLinkSecretary.state}</p>
                                            <p><strong>Experiência:</strong> {confirmLinkSecretary.experience} anos</p>
                                            <p><strong>Disponibilidade:</strong> {confirmLinkSecretary.availability === 'integral' ? 'Integral' : confirmLinkSecretary.availability === 'meio-periodo' ? 'Meio Período' : 'Freelancer'}</p>
                                            <p><strong>Áreas:</strong> {confirmLinkSecretary.areasOfKnowledge.slice(0, 3).join(', ')}</p>
                                        </div>
                                        <p className="text-xs text-gray-500">O(A) secretário(a) receberá uma notificação com suas informações profissionais.</p>
                                        <div className="flex gap-3">
                                            <button onClick={() => setConfirmLinkSecretary(null)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancelar</button>
                                            <button
                                                onClick={() => {
                                                    setLinkedSecretaryId(confirmLinkSecretary.id);
                                                    setLinkSuccess('secretary');
                                                    setConfirmLinkSecretary(null);
                                                    setTimeout(() => setLinkSuccess(null), 5000);
                                                }}
                                                className="flex-1 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700"
                                            >
                                                ✓ Confirmar Contratação
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    </div>
                </div>
                        {/* APIs Section — fora do bloco secretariado */}
                        {activeSection === 'apis' && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">🔌 APIs Habilitadas</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Integrações ativas configuradas pelo administrador da plataforma.</p>
                                </div>
                                <ApiStatusPanel />
                            </div>
                        )}
                        {activeSection === 'iaTools' && (
                            <div className="space-y-6 animate-fade-in">
                                <LegalAiTools role="lawyer" allowedTools={['pecas', 'pesquisas', 'audios', 'transcricao', 'fundamentacoes', 'revisao', 'jurisprudencia', 'manifestacao']} />
                            </div>
                        )}
                        {activeSection === 'efficiency_services' && (
                            <div className="space-y-6 animate-fade-in">
                                <EfficiencyServicesPage embedded={true} />
                            </div>
                        )}


            {/* Password/Email Modals */}
            {showPasswordModal && (
                <ChangePasswordModal onClose={() => setShowPasswordModal(false)} onSave={(cur) => cur.length >= 4} />
            )}
            {showEmailModal && (
                <ChangeEmailModal currentEmail={profileData.email || lawyer.contact.email} onClose={() => setShowEmailModal(false)} onSave={(pwd, newEmail) => { if (pwd.length < 4) return false; setProfileData(p => ({ ...p, email: newEmail })); return true; }} />
            )}

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
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in my-8 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
                                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                        />
                                        <label htmlFor="client-isForeigner" className="ml-2 block text-xs font-medium text-gray-700">
                                            Cliente Estrangeiro
                                        </label>
                                    </div>

                                    {clientData.isForeigner && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 border rounded-lg animate-fade-in text-xs border-gray-200 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                            <div>
                                                <label className="block font-medium text-gray-700 mb-1">Documento de Estrangeiro *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={clientData.foreignerDocument}
                                                    onChange={e => setClientData(prev => ({ ...prev, foreignerDocument: e.target.value }))}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                        >
                                            <option value="CPC">Civil - Procedimento Comum (CPC)</option>
                                            <option value="CPP">Penal - Procedimento Ordinário (CPP)</option>
                                            <option value="CLT">Trabalhista - Rito Ordinário (CLT)</option>
                                            <option value="Custom">Personalizado / Outros</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg space-y-3 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                    <label className="block text-xs font-bold text-gray-600">Fases do Processo (Linha do Tempo)</label>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                        {customStages.map((stage, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}.</span>
                                                <input
                                                    type="text"
                                                    value={stage.name}
                                                    onChange={e => handleStageNameChange(idx, e.target.value)}
                                                    className="flex-grow border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none p-1 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                                    placeholder="Nome da Fase"
                                                />
                                                <select
                                                    value={stage.status}
                                                    onChange={e => handleStageStatusChange(idx, e.target.value as CaseStage['status'])}
                                                    className="border border-gray-300 rounded-md px-2 py-1 text-xs bg-white p-1 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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

            {/* Confirm Add Lawsuit Popup */}
            {pendingCaseToAdd && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in text-left dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            📝 Confirmar Cadastro de Processo
                        </h3>
                        <p className="text-sm text-gray-500">
                            Por favor, confirme as informações do novo processo antes de salvá-lo:
                        </p>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs space-y-1.5 text-gray-700 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                            <p><strong>Cliente:</strong> {pendingCaseToAdd.caseData.clientName}</p>
                            <p><strong>CPF:</strong> {pendingCaseToAdd.clientData.cpf}</p>
                            <p><strong>E-mail:</strong> {pendingCaseToAdd.clientData.email}</p>
                            <p><strong>Telefone:</strong> {pendingCaseToAdd.clientData.phone}</p>
                            <p><strong>Endereço:</strong> {pendingCaseToAdd.clientData.address}</p>
                            {pendingCaseToAdd.clientData.isForeigner && (
                                <p className="text-primary"><strong>Estrangeiro:</strong> Doc: {pendingCaseToAdd.clientData.foreignerDocument} (Origem: {pendingCaseToAdd.clientData.countryOfOrigin})</p>
                            )}
                            <div className="border-t my-2 pt-2">
                                <p><strong>Nº Processo:</strong> {pendingCaseToAdd.caseData.id}</p>
                                <p><strong>Título do Caso:</strong> {pendingCaseToAdd.caseData.title}</p>
                                <p><strong>Rito Processual:</strong> {pendingCaseToAdd.caseData.group} · {pendingCaseToAdd.caseData.caseType}</p>
                                <p><strong>Total de Fases:</strong> {pendingCaseToAdd.caseData.stages.length}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setPendingCaseToAdd(null)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Voltar e Editar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAddCase}
                                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90"
                            >
                                Confirmar Cadastro
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Details Access Popup */}
            {confirmingCase && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in text-left dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            🔒 Confirmação de Acesso
                        </h3>
                        <p className="text-sm text-gray-500">
                            Por favor, confirme o número do processo e o CPF do cliente para validar seu acesso às informações de localização e dados do cliente:
                        </p>

                        <form onSubmit={handleDetailsConfirmSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Confirme o Nº do Processo *</label>
                                <input
                                    type="text"
                                    required
                                    value={confirmDetailsInputs.processNumber}
                                    onChange={e => setConfirmDetailsInputs(prev => ({ ...prev, processNumber: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                    placeholder="Ex: case1"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Confirme o CPF do Cliente *</label>
                                <input
                                    type="text"
                                    required
                                    value={confirmDetailsInputs.cpf}
                                    onChange={e => setConfirmDetailsInputs(prev => ({ ...prev, cpf: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                    placeholder="Ex: 123.456.789-00"
                                />
                            </div>
                            {detailsError && <p className="text-xs text-red-600 font-semibold">{detailsError}</p>}
                            
                            <div className="flex gap-2 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmingCase(null)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90"
                                >
                                    Confirmar e Acessar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Client Location & Details Preview Modal */}
            {viewingCaseDetails && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-fade-in text-left dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Localização e Detalhes do Cliente</h3>
                            <button onClick={() => setViewingCaseDetails(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-sm dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <p><strong>Nome do Cliente:</strong> {viewingCaseDetails.clientName}</p>
                                {viewingCaseDetails.clientCpf && <p><strong>CPF:</strong> {viewingCaseDetails.clientCpf}</p>}
                                <p><strong>Processo Nº:</strong> {viewingCaseDetails.id} ({viewingCaseDetails.title})</p>
                                <p><strong>Grupo/Tipo:</strong> {viewingCaseDetails.group} · {viewingCaseDetails.caseType}</p>
                                <p><strong>Endereço Completo:</strong> {viewingCaseDetails.clientAddress || 'Endereço não cadastrado.'}</p>
                            </div>

                            {/* Simulated GPS Location Map */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Localização no GPS</label>
                                <div className="h-48 bg-blue-100 rounded-lg border border-blue-200 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />
                                    <span className="text-4xl z-10 animate-bounce">📍</span>
                                    <p className="text-sm font-semibold text-gray-800 z-10 mt-2">Localização Carregada</p>
                                    <p className="text-xs text-gray-500 z-10 max-w-xs truncate">
                                        {viewingCaseDetails.clientAddress || 'Sem coordenadas'}
                                    </p>
                                    <div className="absolute bottom-2 right-2 bg-white px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 shadow border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                        Legis Connect GPS Link
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setViewingCaseDetails(null)}
                            className="w-full py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Fechar Detalhes
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default LawyerDashboard;