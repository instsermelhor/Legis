import React, { useState } from 'react';
import type { Intern } from '../../types';
import { AcademicCapIcon, ClipboardListIcon, UsersIcon, ChatBubbleIcon } from '../common/IconComponents';
import { AREAS_OF_LAW, BRAZILIAN_STATES } from '../../constants';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { ChangeEmailModal } from '../common/ChangeEmailModal';
import { LawyerInfoPopup } from '../common/LawyerInfoPopup';
import { mockLawyers } from '../../services/mockLawyerService';
import { mockInterns } from '../../services/mockDataService';

interface InternDashboardProps {
    intern: Intern;
    userEmail?: string;
    onUpdateIntern?: (updated: Partial<Intern>) => void;
    onUpdateEmail?: (newEmail: string) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

// Grade por semestre - disciplinas típicas de cada período
const SEMESTER_CURRICULUM: Record<string, string[]> = {
    '1º Semestre': ['Introdução ao Direito', 'Teoria do Estado', 'Sociologia Jurídica', 'Português Jurídico', 'Filosofia do Direito'],
    '2º Semestre': ['Direito Constitucional I', 'Direito Civil I (Parte Geral)', 'Direito Penal I', 'Direito Romano', 'Metodologia da Pesquisa'],
    '3º Semestre': ['Direito Constitucional II', 'Direito Civil II (Obrigações)', 'Direito Penal II', 'Direito Empresarial I', 'Direito Processual Geral'],
    '4º Semestre': ['Direito Civil III (Contratos)', 'Direito Administrativo I', 'Direito Penal III', 'Direito Empresarial II', 'Direito Processual Civil I'],
    '5º Semestre': ['Direito Civil IV (Responsabilidade Civil)', 'Direito Administrativo II', 'Direito Tributário I', 'Direito do Trabalho I', 'Direito Processual Civil II'],
    '6º Semestre': ['Direito Civil V (Família)', 'Direito Tributário II', 'Direito do Trabalho II', 'Direito Processual Penal I', 'Direito Internacional Público'],
    '7º Semestre': ['Direito Civil VI (Sucessões)', 'Direito Ambiental', 'Direito Processual do Trabalho', 'Direito Processual Penal II', 'Prática Jurídica Civil I'],
    '8º Semestre': ['Direito Eleitoral', 'Direito Digital e Proteção de Dados', 'Direito Previdenciário', 'Prática Jurídica Penal I', 'Prática Jurídica Trabalhista'],
    '9º Semestre': ['TCC I', 'Prática Jurídica Civil II', 'Prática Jurídica Penal II', 'Arbitragem e Mediação', 'Direito do Consumidor'],
    '10º Semestre': ['TCC II', 'Estágio Supervisionado', 'Ética Profissional OAB', 'Simulação de Júri', 'Tópicos Especiais em Direito'],
};

const SEMESTER_OPTIONS = [
    '1º ao 3º semestre',
    '4º ao 6º semestre',
    '7º ao 9º semestre',
    '9º ao 10º semestre',
];

const DETAILED_SEMESTERS = Object.keys(SEMESTER_CURRICULUM);

export const InternDashboard: React.FC<InternDashboardProps> = ({ intern, userEmail, onUpdateIntern, onUpdateEmail }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'perfil' | 'studies' | 'hours' | 'casos'>('overview');
    const [showLawyerPopup, setShowLawyerPopup] = useState(false);

    // Find supervisor lawyer - look up by supervisorLawyerId in mockInterns or use default
    const mockInternData = mockInterns.find(i => i.name === intern.name);
    const supervisorLawyerId = mockInternData?.supervisorLawyerId;
    const supervisorLawyer = supervisorLawyerId
        ? mockLawyers.find(l => l.id === supervisorLawyerId) || null
        : null;

    // Profile editing state
    const [profileData, setProfileData] = useState({
        name: intern.name || '',
        university: intern.university || '',
        semester: intern.semester || '1º ao 3º semestre',
        specialtyInterest: intern.specialtyInterest || '',
        phone: intern.contact?.phone || '',
        cep: intern.cep || '',
        street: intern.street || '',
        number: intern.number || '',
        complement: intern.complement || '',
        neighborhood: intern.neighborhood || '',
        city: intern.city || '',
        state: intern.state || '',
    });
    const [selectedDetailSemester, setSelectedDetailSemester] = useState(DETAILED_SEMESTERS[0]);
    const [profileSaved, setProfileSaved] = useState(false);
    // OAB State
    const [hasOab, setHasOab] = useState(false);
    const [oabNumber, setOabNumber] = useState('');
    const [oabUF, setOabUF] = useState('');

    // Modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = () => {
        if (onUpdateIntern) {
            onUpdateIntern({
                name: profileData.name,
                university: profileData.university,
                semester: profileData.semester,
                specialtyInterest: profileData.specialtyInterest,
                contact: { ...intern.contact, phone: profileData.phone, email: intern.contact?.email || '' },
                cep: profileData.cep,
                street: profileData.street,
                number: profileData.number,
                complement: profileData.complement,
                neighborhood: profileData.neighborhood,
                city: profileData.city,
                state: profileData.state,
            });
        }
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
    };

    const handlePasswordSave = (currentPassword: string, _newPassword: string) => {
        // Simulated check: any non-empty password is "correct" in demo
        return currentPassword.length >= 4;
    };

    const handleEmailSave = (password: string, newEmail: string) => {
        if (password.length < 4) return false;
        if (onUpdateEmail) onUpdateEmail(newEmail);
        return true;
    };

    const tabBtn = (id: typeof activeTab, label: string) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-neutral-light p-6 sm:p-8 rounded-xl shadow-sm">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center sm:space-x-4 mb-6 text-center sm:text-left">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold mb-4 sm:mb-0">
                        {intern.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Painel do Estudante</h1>
                        <p className="text-gray-600">Bem-vindo(a), {intern.name}! ({intern.semester} — {intern.university})</p>
                        {supervisorLawyer && (
                            <button
                                onClick={() => setShowLawyerPopup(true)}
                                className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-full hover:bg-indigo-100 transition-colors"
                            >
                                🎓 Estagiando em: {supervisorLawyer.name} — Ver informações
                            </button>
                        )}
                    </div>
                </div>

                {/* Supervisor notification banner */}
                {supervisorLawyer && (
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 mb-6 text-white flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🎉</span>
                            <div>
                                <p className="font-bold text-sm">Você foi escolhido como estagiário!</p>
                                <p className="text-xs text-white/85">Dr(a). {supervisorLawyer.name} — OAB {supervisorLawyer.oab}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowLawyerPopup(true)} className="shrink-0 px-4 py-2 bg-white/20 rounded-lg text-xs font-semibold hover:bg-white/30 transition-colors">
                            Ver Detalhes
                        </button>
                    </div>
                )}

                {/* Tab Nav */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex flex-wrap gap-2 sm:space-x-4">
                        {tabBtn('overview', 'Visão Geral')}
                        {tabBtn('perfil', '👤 Meu Perfil')}
                        {tabBtn('casos', '📋 Meus Casos')}
                        {tabBtn('studies', 'Mural de Casos')}
                        {tabBtn('hours', 'Mentorias e Clínicas')}
                    </nav>
                </div>

                {/* ─── OVERVIEW TAB ─── */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={<AcademicCapIcon className="w-6 h-6 text-primary" />} label="Horas Complementares" value={`${intern.hoursCompleted} / 200h`} />
                            <StatCard icon={<ClipboardListIcon className="w-6 h-6 text-primary" />} label="Casos Estudados" value={intern.casesStudied?.length || 0} />
                            <StatCard icon={<UsersIcon className="w-6 h-6 text-primary" />} label="Mentorias" value={0} />
                            <StatCard icon={<ChatBubbleIcon className="w-6 h-6 text-primary" />} label="Fóruns Ativos" value={2} />
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Progresso da Grade Educacional</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                                <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${Math.min((intern.hoursCompleted / 200) * 100, 100)}%` }} />
                            </div>
                            <p className="text-sm text-gray-500">
                                {intern.hoursCompleted} horas concluídas de 200h obrigatórias ({Math.round((intern.hoursCompleted / 200) * 100)}%)
                            </p>
                        </div>

                        {/* Grade curricular interativa */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">📚 Grade Curricular por Semestre</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {DETAILED_SEMESTERS.map(sem => (
                                    <button
                                        key={sem}
                                        onClick={() => setSelectedDetailSemester(sem)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedDetailSemester === sem ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary/10'}`}
                                    >
                                        {sem}
                                    </button>
                                ))}
                            </div>
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                <h4 className="font-bold text-primary text-sm mb-3">Disciplinas do {selectedDetailSemester}</h4>
                                <ul className="space-y-2">
                                    {(SEMESTER_CURRICULUM[selectedDetailSemester] || []).map((disc, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                            <span className="w-5 h-5 flex items-center justify-center bg-primary/20 text-primary rounded-full text-xs font-bold shrink-0">{i + 1}</span>
                                            {disc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── PERFIL TAB ─── */}
                {activeTab === 'perfil' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-gray-800">Dados Pessoais e Acadêmicos</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nome Completo</label>
                                    <input name="name" value={profileData.name} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Telefone</label>
                                    <input name="phone" value={profileData.phone} onChange={handleProfileChange} placeholder="(11) 99999-9999" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Universidade</label>
                                    <input name="university" value={profileData.university} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Semestre Atual</label>
                                    <select name="semester" value={profileData.semester} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                                        {SEMESTER_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Área de Interesse no Direito</label>
                                    <select name="specialtyInterest" value={profileData.specialtyInterest} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                                        <option value="">Selecione uma área...</option>
                                        {AREAS_OF_LAW.map(a => <option key={a}>{a}</option>)}
                                    </select>
                                </div>

                                {/* OAB checkbox */}
                                <div className="md:col-span-2">
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm font-semibold text-gray-700">⚖️ Possui OAB?</p>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="hasOab"
                                                    checked={hasOab === true}
                                                    onChange={() => setHasOab(true)}
                                                    className="accent-primary"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Sim</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="hasOab"
                                                    checked={hasOab === false}
                                                    onChange={() => setHasOab(false)}
                                                    className="accent-primary"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Não</span>
                                            </label>
                                        </div>
                                        {hasOab && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Número OAB</label>
                                                    <input
                                                        value={oabNumber}
                                                        onChange={e => setOabNumber(e.target.value)}
                                                        placeholder="Ex: 123456"
                                                        className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">UF da Ordem</label>
                                                    <select
                                                        value={oabUF}
                                                        onChange={e => setOabUF(e.target.value)}
                                                        className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="pt-4 border-t space-y-3">
                                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Endereço Residencial</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">CEP</label>
                                        <input name="cep" value={profileData.cep} onChange={handleProfileChange} placeholder="00000-000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Rua / Logradouro</label>
                                        <input name="street" value={profileData.street} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Número</label>
                                        <input name="number" value={profileData.number} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Complemento</label>
                                        <input name="complement" value={profileData.complement} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Bairro</label>
                                        <input name="neighborhood" value={profileData.neighborhood} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Cidade</label>
                                        <input name="city" value={profileData.city} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Estado (UF)</label>
                                        <select name="state" value={profileData.state} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                                            <option value="">Selecione...</option>
                                            {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleSaveProfile}
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow"
                                >
                                    {profileSaved ? '✓ Salvo!' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </div>

                        {/* Segurança de Acesso */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                            <h3 className="text-base font-bold text-gray-800">🔐 Segurança de Acesso</h3>
                            <p className="text-sm text-gray-500">Mantenha seus dados de acesso seguros e atualizados.</p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                                >
                                    🔑 Alterar Senha
                                </button>
                                <button
                                    onClick={() => setShowEmailModal(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    📧 Alterar E-mail
                                </button>
                            </div>
                            <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                                E-mail atual de acesso: <strong>{userEmail || intern.contact?.email || 'Não definido'}</strong>
                            </div>
                        </div>

                        {/* Grade curricular por semestre */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                            <h3 className="text-base font-bold text-gray-800">📚 Grade Curricular de Referência</h3>
                            <p className="text-sm text-gray-500">Visualize as disciplinas de cada período do curso de Direito.</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {DETAILED_SEMESTERS.map(sem => (
                                    <button key={sem} onClick={() => setSelectedDetailSemester(sem)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedDetailSemester === sem ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary/10'}`}>
                                        {sem}
                                    </button>
                                ))}
                            </div>
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                <h4 className="font-bold text-primary text-sm mb-3">{selectedDetailSemester}</h4>
                                <ul className="space-y-2">
                                    {(SEMESTER_CURRICULUM[selectedDetailSemester] || []).map((disc, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                            <span className="w-5 h-5 flex items-center justify-center bg-primary/20 text-primary rounded-full text-xs font-bold shrink-0">{i + 1}</span>
                                            {disc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── STUDIES TAB ─── */}
                {activeTab === 'studies' && (
                    <div className="space-y-4 animate-fade-in">
                        {[
                            { title: 'Simulação: Direito Trabalhista #452', desc: 'Análise de petição inicial de acúmulo de função. Valendo 5 horas extracurriculares.' },
                            { title: 'Simulação: Contratos Civis #108', desc: 'Revisão de cláusulas abusivas em contrato de adesão. Valendo 3 horas extracurriculares.' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">{item.title}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                                </div>
                                <button className="px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition text-sm whitespace-nowrap">Acessar Estudo</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── HOURS TAB ─── */}
                {activeTab === 'hours' && (
                    <div className="text-center bg-gray-50 p-10 rounded-lg border border-dashed border-gray-300 animate-fade-in">
                        <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Nenhuma mentoria agendada.</h3>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">Explore advogados parceiros e envie solicitações de acompanhamento prático e mentoria.</p>
                    </div>
                )}

                {/* ─── MEUS CASOS TAB ─── */}
                {activeTab === 'casos' && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800">📋 Meus Casos</h3>
                            {supervisorLawyer && (
                                <button onClick={() => setShowLawyerPopup(true)} className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                                    👤 Ver Advogado Supervisor
                                </button>
                            )}
                        </div>

                        {supervisorLawyer ? (
                            <>
                                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
                                    <img src={supervisorLawyer.photoUrl} alt={supervisorLawyer.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-200" />
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900">Supervisionado por: Dr(a). {supervisorLawyer.name}</p>
                                        <p className="text-xs text-indigo-600">OAB {supervisorLawyer.oab} — {supervisorLawyer.specialties.slice(0, 2).join(', ')}</p>
                                    </div>
                                </div>

                                {intern.casesStudied && intern.casesStudied.length > 0 ? (
                                    <div className="space-y-3">
                                        {intern.casesStudied.map(c => (
                                            <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{c.title}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">Cliente: {c.clientName} — Advogado: {c.lawyerName}</p>
                                                    </div>
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.status === 'Ativo' ? 'bg-green-50 text-green-700 border border-green-200' : c.status === 'Concluído' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                        {c.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                                        <p className="text-3xl mb-2">📂</p>
                                        <p className="text-sm font-semibold text-gray-700">Nenhum caso atribuído ainda</p>
                                        <p className="text-xs text-gray-500 mt-1">Quando seu advogado supervisor atribuir casos ao seu estágio, eles aparecerão aqui.</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center">
                                <p className="text-3xl mb-2">⏳</p>
                                <h4 className="font-bold text-gray-700">Aguardando vínculo com advogado</h4>
                                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                    Seus casos de estágio aparecerão aqui quando um advogado vinculá-lo(a) ao seu escritório.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modais */}
            {showPasswordModal && (
                <ChangePasswordModal onClose={() => setShowPasswordModal(false)} onSave={handlePasswordSave} />
            )}
            {showEmailModal && (
                <ChangeEmailModal currentEmail={userEmail || intern.contact?.email || ''} onClose={() => setShowEmailModal(false)} onSave={handleEmailSave} />
            )}
            {showLawyerPopup && supervisorLawyer && (
                <LawyerInfoPopup
                    lawyer={supervisorLawyer}
                    message="Você foi escolhido como estagiário deste advogado!"
                    onClose={() => setShowLawyerPopup(false)}
                />
            )}
        </div>
    );
};
