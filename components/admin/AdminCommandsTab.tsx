import React, { useState, useEffect } from 'react';
import type { Lawyer, Intern, Secretary, EfficiencyService } from '../../types';
import { mockLawyers } from '../../services/mockLawyerService';
import { mockInterns, mockSecretaries, mockEfficiencyServices } from '../../services/mockDataService';
import { SectionTitle } from './AdminShared';

interface AdminCommandsTabProps {
  // Optional callback to notify the parent component of data changes
  onDataChange?: () => void;
}

interface PlatformFeature {
  id: string;
  name: string;
  category: 'funcionalidade' | 'api';
  description: string;
}

interface UserPackage {
  id: string;
  name: string;
  role: 'lawyer' | 'client' | 'intern' | 'secretary';
  price: number;
  features: string[];
  status: 'ativo' | 'inativo';
}

const FEATURES_LIST: PlatformFeature[] = [
  { id: 'ia_juridica', name: 'IA Jurídica & Copiloto', category: 'funcionalidade', description: 'Geração de peças, manifestações, pesquisas e revisões de textos por inteligência artificial.' },
  { id: 'transcricao_audio', name: 'Transcrição e Comandos por Áudio', category: 'funcionalidade', description: 'Gravação e conversão de áudios de audiências e reuniões em textos formatados.' },
  { id: 'chatbot_atendimento', name: 'Chatbot de Atendimento Inteligente', category: 'funcionalidade', description: 'Assistente virtual inteligente para atendimento inicial de clientes e triagem.' },
  { id: 'agenda_digital', name: 'Agenda Digital e Compromissos', category: 'funcionalidade', description: 'Organização de reuniões, prazos processuais e sincronização com Google Calendar/Outlook.' },
  { id: 'peticionamento', name: 'Módulo de Peticionamento Avançado', category: 'funcionalidade', description: 'Editor de petições e manifestações interconectado com jurisprudência em tempo real.' },
  { id: 'api_jusbrasil', name: 'API Jusbrasil Jurisprudência', category: 'api', description: 'Pesquisa e busca direta de jurisprudências atualizadas nos tribunais brasileiros.' },
  { id: 'api_diarios', name: 'API de Monitoramento de Diários', category: 'api', description: 'Robô de varredura automatizada de publicações nos diários de justiça oficiais.' },
  { id: 'api_pagamentos', name: 'API Financeira Asaas / Stripe', category: 'api', description: 'Processamento de boletos, cartões e PIX integrado para recebimento de honorários.' },
  { id: 'api_maps', name: 'API Google Maps / Localização', category: 'api', description: 'Geolocalização de profissionais e indicação de rotas físicas para reuniões presenciais.' },
  { id: 'api_gemini', name: 'API Gemini Pro / Google Cloud', category: 'api', description: 'Motor cognitivo central de processamento para comandos por áudio e revisões.' }
];

export const AdminCommandsTab: React.FC<AdminCommandsTabProps> = ({ onDataChange }) => {
  // Sub-tabs: 'toggles' | 'assignments' | 'packages'
  const [subTab, setSubTab] = useState<'toggles' | 'assignments' | 'packages'>('toggles');

  // Platform states
  const [featureStates, setFeatureStates] = useState<Record<string, boolean>>({});
  
  // User states loaded from localStorage/mocks
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [efficiencyServices, setEfficiencyServices] = useState<EfficiencyService[]>([]);

  // Package creator states
  const [packages, setPackages] = useState<UserPackage[]>([]);
  const [packageName, setPackageName] = useState('');
  const [packageRole, setPackageRole] = useState<'lawyer' | 'client' | 'intern' | 'secretary'>('lawyer');
  const [packagePrice, setPackagePrice] = useState('');
  const [packageFeatures, setPackageFeatures] = useState<string[]>([]);
  const [showPackageForm, setShowPackageForm] = useState(false);

  // Assignment states for linking
  const [selectedInternLawyer, setSelectedInternLawyer] = useState<Record<number, number>>({});
  const [selectedSecretaryLawyer, setSelectedSecretaryLawyer] = useState<Record<number, number>>({});

  // Loading data from localStorage or fallback mock
  useEffect(() => {
    // 1. Features
    const savedFeatures = localStorage.getItem('legis_platform_features');
    if (savedFeatures) {
      setFeatureStates(JSON.parse(savedFeatures));
    } else {
      const defaults: Record<string, boolean> = {};
      FEATURES_LIST.forEach(f => {
        defaults[f.id] = true; // all default to active
      });
      setFeatureStates(defaults);
      localStorage.setItem('legis_platform_features', JSON.stringify(defaults));
    }

    // 2. Lawyers
    const savedLawyers = localStorage.getItem('legis_lawyers');
    if (savedLawyers) {
      setLawyers(JSON.parse(savedLawyers));
    } else {
      setLawyers(mockLawyers);
      localStorage.setItem('legis_lawyers', JSON.stringify(mockLawyers));
    }

    // 3. Interns
    const savedInterns = localStorage.getItem('legis_interns');
    if (savedInterns) {
      setInterns(JSON.parse(savedInterns));
    } else {
      setInterns(mockInterns as unknown as Intern[]);
      localStorage.setItem('legis_interns', JSON.stringify(mockInterns));
    }

    // 4. Secretaries
    const savedSecretaries = localStorage.getItem('legis_secretaries');
    if (savedSecretaries) {
      setSecretaries(JSON.parse(savedSecretaries));
    } else {
      setSecretaries(mockSecretaries as unknown as Secretary[]);
      localStorage.setItem('legis_secretaries', JSON.stringify(mockSecretaries));
    }

    // 5. Efficiency Services (to offer inside package creator)
    const savedServices = localStorage.getItem('legis_services');
    if (savedServices) {
      setEfficiencyServices(JSON.parse(savedServices));
    } else {
      setEfficiencyServices(mockEfficiencyServices);
    }

    // 6. Subscription Packages
    const savedPackages = localStorage.getItem('legis_packages');
    if (savedPackages) {
      setPackages(JSON.parse(savedPackages));
    } else {
      const defaultPackages: UserPackage[] = [
        { id: 'pkg-1', name: 'Plano Legis Essencial', role: 'lawyer', price: 199.90, features: ['ia_juridica', 'agenda_digital'], status: 'ativo' },
        { id: 'pkg-2', name: 'Plano Legis Premium', role: 'lawyer', price: 399.90, features: ['ia_juridica', 'transcricao_audio', 'peticionamento', 'api_jusbrasil'], status: 'ativo' },
        { id: 'pkg-3', name: 'Módulo Estudante Pro', role: 'intern', price: 49.90, features: ['ia_juridica', 'peticionamento'], status: 'ativo' },
        { id: 'pkg-4', name: 'Pacote Auxiliar Administrativo', role: 'secretary', price: 99.90, features: ['chatbot_atendimento', 'agenda_digital'], status: 'ativo' }
      ];
      setPackages(defaultPackages);
      localStorage.setItem('legis_packages', JSON.stringify(defaultPackages));
    }
  }, []);

  // Toggles active state of a platform feature or API
  const handleToggleFeature = (id: string) => {
    const updated = { ...featureStates, [id]: !featureStates[id] };
    setFeatureStates(updated);
    localStorage.setItem('legis_platform_features', JSON.stringify(updated));
    if (onDataChange) onDataChange();
  };

  // Toggle user account active status
  const handleToggleUserStatus = (role: 'lawyer' | 'intern' | 'secretary', id: number) => {
    if (role === 'lawyer') {
      const updated = lawyers.map(l => {
        if (l.id === id) {
          const nextStatus: Lawyer['status'] = l.status === 'suspenso' ? 'verificado' : 'suspenso';
          return { ...l, status: nextStatus };
        }
        return l;
      });
      setLawyers(updated);
      localStorage.setItem('legis_lawyers', JSON.stringify(updated));
      // Sync mockLawyerService in memory
      mockLawyers.forEach(l => {
        if (l.id === id) {
          l.status = l.status === 'suspenso' ? 'verificado' : 'suspenso';
        }
      });
    } else if (role === 'intern') {
      const updated = interns.map(i => {
        if (i.id === id) {
          const nextStatus: Intern['status'] = i.status === 'inativo' || i.status === 'pending' ? 'active' : 'inativo' as any;
          return { ...i, status: nextStatus };
        }
        return i;
      });
      setInterns(updated);
      localStorage.setItem('legis_interns', JSON.stringify(updated));
    } else if (role === 'secretary') {
      const updated = secretaries.map(s => {
        if (s.id === id) {
          const nextStatus: Secretary['status'] = s.status === 'inativo' || s.status === 'pendente' ? 'ativo' : 'inativo';
          return { ...s, status: nextStatus };
        }
        return s;
      });
      setSecretaries(updated);
      localStorage.setItem('legis_secretaries', JSON.stringify(updated));
    }
    if (onDataChange) onDataChange();
  };

  // Delegate / link Intern to Supervisor (Lawyer)
  const handleLinkIntern = (internId: number) => {
    const lawyerId = selectedInternLawyer[internId];
    if (!lawyerId) return;

    // 1. Get current list of interns from state and handle unlinks
    const updated = interns.map(i => {
      // If this is the intern being linked
      if (i.id === internId) {
        // If they had an old supervisor, remove the link from the old supervisor's lawyer key
        const oldLawyerId = i.supervisorLawyerId;
        if (oldLawyerId && oldLawyerId !== lawyerId) {
          localStorage.removeItem(`legis_lawyer_linked_intern_${oldLawyerId}`);
        }
        return { ...i, supervisorLawyerId: lawyerId };
      }
      // If another intern was previously supervised by the new supervisor, clear their supervisor link
      if (i.supervisorLawyerId === lawyerId && i.id !== internId) {
        const copy = { ...i };
        delete copy.supervisorLawyerId;
        return copy;
      }
      return i;
    });

    // 2. Set the new lawyer key pointing to the new intern
    localStorage.setItem(`legis_lawyer_linked_intern_${lawyerId}`, String(internId));

    // 3. Save to state and localStorage
    setInterns(updated);
    localStorage.setItem('legis_interns', JSON.stringify(updated));
    alert('Estagiário(a) vinculado(a) com sucesso ao advogado!');
    if (onDataChange) onDataChange();
  };

  // Cancel Intern delegation
  const handleUnlinkIntern = (internId: number) => {
    let lawyerId: number | undefined;

    const updated = interns.map(i => {
      if (i.id === internId) {
        lawyerId = i.supervisorLawyerId;
        const copy = { ...i };
        delete copy.supervisorLawyerId;
        return copy;
      }
      return i;
    });

    // Remove the link from the supervisor's lawyer key
    if (lawyerId) {
      localStorage.removeItem(`legis_lawyer_linked_intern_${lawyerId}`);
    }

    setInterns(updated);
    localStorage.setItem('legis_interns', JSON.stringify(updated));
    alert('Atribuição de supervisão cancelada com sucesso.');
    if (onDataChange) onDataChange();
  };

  // Delegate / link Secretary to Lawyer
  const handleLinkSecretary = (secretaryId: number) => {
    const lawyerId = selectedSecretaryLawyer[secretaryId];
    if (!lawyerId) return;

    // 1. Get current list of secretaries from state and handle unlinks
    const updated = secretaries.map(s => {
      // If this is the secretary being linked
      if (s.id === secretaryId) {
        // If they had an old lawyer, remove the link from the old lawyer key
        const oldLawyerId = s.assignedLawyerId;
        if (oldLawyerId && oldLawyerId !== lawyerId) {
          localStorage.removeItem(`legis_lawyer_linked_secretary_${oldLawyerId}`);
        }
        return { ...s, assignedLawyerId: lawyerId };
      }
      // If another secretary was previously assigned to the new lawyer, clear their assignedLawyerId
      if (s.assignedLawyerId === lawyerId && s.id !== secretaryId) {
        const copy = { ...s };
        delete copy.assignedLawyerId;
        return copy;
      }
      return s;
    });

    // 2. Set the new lawyer key pointing to the new secretary
    localStorage.setItem(`legis_lawyer_linked_secretary_${lawyerId}`, String(secretaryId));

    // 3. Save to state and localStorage
    setSecretaries(updated);
    localStorage.setItem('legis_secretaries', JSON.stringify(updated));
    alert('Secretário(a) vinculado(a) com sucesso ao advogado!');
    if (onDataChange) onDataChange();
  };

  // Cancel Secretary assignment
  const handleUnlinkSecretary = (secretaryId: number) => {
    let lawyerId: number | undefined;

    const updated = secretaries.map(s => {
      if (s.id === secretaryId) {
        lawyerId = s.assignedLawyerId;
        const copy = { ...s };
        delete copy.assignedLawyerId;
        return copy;
      }
      return s;
    });

    // Remove the link from the lawyer key
    if (lawyerId) {
      localStorage.removeItem(`legis_lawyer_linked_secretary_${lawyerId}`);
    }

    setSecretaries(updated);
    localStorage.setItem('legis_secretaries', JSON.stringify(updated));
    alert('Atribuição de secretariado cancelada com sucesso.');
    if (onDataChange) onDataChange();
  };


  // Package Management
  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName || !packagePrice) return;

    const priceNum = parseFloat(packagePrice.replace(',', '.'));
    if (isNaN(priceNum)) {
      alert('Por favor, digite um preço válido.');
      return;
    }

    const newPkg: UserPackage = {
      id: `pkg-${Date.now()}`,
      name: packageName,
      role: packageRole,
      price: priceNum,
      features: packageFeatures,
      status: 'ativo'
    };

    const updated = [...packages, newPkg];
    setPackages(updated);
    localStorage.setItem('legis_packages', JSON.stringify(updated));

    // Reset Form
    setPackageName('');
    setPackagePrice('');
    setPackageFeatures([]);
    setShowPackageForm(false);
    alert('Novo pacote criado com sucesso!');
  };

  const handleTogglePackageStatus = (id: string) => {
    const updated = packages.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'ativo' ? 'inativo' : 'ativo' as any };
      }
      return p;
    });
    setPackages(updated);
    localStorage.setItem('legis_packages', JSON.stringify(updated));
  };

  const handleDeletePackage = (id: string) => {
    if (window.confirm('Excluir este pacote permanentemente?')) {
      const updated = packages.filter(p => p.id !== id);
      setPackages(updated);
      localStorage.setItem('legis_packages', JSON.stringify(updated));
    }
  };

  const toggleFeatureInPackage = (fid: string) => {
    setPackageFeatures(prev =>
      prev.includes(fid) ? prev.filter(x => x !== fid) : [...prev, fid]
    );
  };

  return (
    <div className="space-y-6">
      <SectionTitle 
        title="Comandos e Configurações Administrativas" 
        subtitle="Habilite funcionalidades, delegue atribuições e configure pacotes comerciais." 
      />

      {/* Navigation for Sub Tabs */}
      <div className="flex border-b border-gray-200 dark:border-white/10 mb-6">
        <button
          onClick={() => setSubTab('toggles')}
          className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
            subTab === 'toggles' 
              ? 'border-purple-600 text-purple-700 dark:text-purple-400 dark:border-purple-500' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          ⚙️ Ativar / Desativar Recursos e Contas
        </button>
        <button
          onClick={() => setSubTab('assignments')}
          className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
            subTab === 'assignments' 
              ? 'border-purple-600 text-purple-700 dark:text-purple-400 dark:border-purple-500' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          🤝 Delegar e Cancelar Atribuições
        </button>
        <button
          onClick={() => setSubTab('packages')}
          className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
            subTab === 'packages' 
              ? 'border-purple-600 text-purple-700 dark:text-purple-400 dark:border-purple-500' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          📦 Criar e Gerenciar Pacotes
        </button>
      </div>

      {/* ─── 1. ACTIVATE / DEACTIVATE ─── */}
      {subTab === 'toggles' && (
        <div className="space-y-8 animate-fade-in">
          {/* Functional Features Toggles */}
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              Funcionalidades da Plataforma
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURES_LIST.filter(f => f.category === 'funcionalidade').map(f => (
                <div key={f.id} className="p-4 bg-white dark:bg-[#1E1B38] border border-gray-200 dark:border-[#2A2545] rounded-xl flex items-start justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{f.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">{f.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggleFeature(f.id)}
                    className={`shrink-0 w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      featureStates[f.id] ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span 
                      className={`block w-4 h-4 rounded-full bg-white shadow absolute top-1 transition-transform ${
                        featureStates[f.id] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* APIs Toggles */}
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              Conexões com APIs de Parceiros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURES_LIST.filter(f => f.category === 'api').map(f => (
                <div key={f.id} className="p-4 bg-white dark:bg-[#1E1B38] border border-gray-200 dark:border-[#2A2545] rounded-xl flex items-start justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{f.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">{f.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggleFeature(f.id)}
                    className={`shrink-0 w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      featureStates[f.id] ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span 
                      className={`block w-4 h-4 rounded-full bg-white shadow absolute top-1 transition-transform ${
                        featureStates[f.id] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* User Account Controls */}
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Controle de Contas e Acessos
            </h3>
            
            <div className="bg-white dark:bg-[#1E1B38] border border-gray-200 dark:border-[#2A2545] rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 dark:bg-black/10 border-b border-gray-200 dark:border-white/10">
                <p className="text-xs font-bold text-gray-500 uppercase">Lista Geral de Advogados & Profissionais</p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-96 overflow-y-auto">
                {lawyers.map(l => (
                  <div key={l.id} className="p-4 flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <img src={l.photoUrl} className="w-8 h-8 rounded-full object-cover border" alt="" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{l.name}</p>
                        <p className="text-xs text-gray-400">OAB: {l.oab} · {l.contact.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        l.status === 'verificado' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300'
                      }`}>
                        {l.status === 'verificado' ? 'Ativo' : 'Suspenso'}
                      </span>
                      <button
                        onClick={() => handleToggleUserStatus('lawyer', l.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          l.status === 'verificado' 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400'
                        }`}
                      >
                        {l.status === 'verificado' ? 'Bloquear' : 'Reativar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. DELEGATE / CANCEL ASSIGNMENTS ─── */}
      {subTab === 'assignments' && (
        <div className="space-y-8 animate-fade-in">
          {/* Interns Delegation Panel */}
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              🎓 Supervisão de Bacharelandos e Estagiários
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Defina ou cancele o vínculo de supervisão técnica de um bacharelando a um advogado verificado na plataforma.
            </p>

            <div className="bg-white dark:bg-[#1E1B38] border border-gray-200 dark:border-[#2A2545] rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-black/10 border-b border-gray-200 dark:border-white/10 text-xs font-bold text-gray-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Estagiário(a)</th>
                    <th className="px-5 py-3">Universidade</th>
                    <th className="px-5 py-3">Supervisor Atual</th>
                    <th className="px-5 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                  {interns.map(i => {
                    const supervisor = lawyers.find(l => l.id === i.supervisorLawyerId);
                    return (
                      <tr key={i.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-bold text-gray-900 dark:text-white">{i.name}</p>
                          <p className="text-xs text-gray-400">{i.contact.email}</p>
                        </td>
                        <td className="px-5 py-3 text-xs">{i.university} ({i.semester})</td>
                        <td className="px-5 py-3">
                          {supervisor ? (
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              Dr(a). {supervisor.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Sem supervisor</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {supervisor ? (
                            <button
                              onClick={() => handleUnlinkIntern(i.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 font-bold rounded-lg text-xs hover:bg-red-100 transition-colors"
                            >
                              Remover Vínculo
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <select
                                value={selectedInternLawyer[i.id] || ''}
                                onChange={e => setSelectedInternLawyer(prev => ({ ...prev, [i.id]: Number(e.target.value) }))}
                                className="text-xs border border-gray-300 dark:border-[#3A3555] rounded-lg px-2.5 py-1.5 bg-white dark:bg-[#2A2545] text-gray-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                              >
                                <option value="">Selecionar Advogado...</option>
                                {lawyers.filter(l => l.status === 'verificado').map(l => (
                                  <option key={l.id} value={l.id}>{l.name} ({l.oab})</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleLinkIntern(i.id)}
                                disabled={!selectedInternLawyer[i.id]}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold rounded-lg text-xs transition-colors"
                              >
                                Atribuir
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Secretaries Delegation Panel */}
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              🗂️ Atribuição de Secretariado e Assistência Jurídica
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Vincule ou remova secretários(as) do painel de advogados para garantir apoio administrativo integrado.
            </p>

            <div className="bg-white dark:bg-[#1E1B38] border border-gray-200 dark:border-[#2A2545] rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-black/10 border-b border-gray-200 dark:border-white/10 text-xs font-bold text-gray-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Secretário(a)</th>
                    <th className="px-5 py-3">Localização / Exp.</th>
                    <th className="px-5 py-3">Advogado Atrelado</th>
                    <th className="px-5 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                  {secretaries.map(s => {
                    const lawyer = lawyers.find(l => l.id === s.assignedLawyerId);
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-bold text-gray-900 dark:text-white">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </td>
                        <td className="px-5 py-3 text-xs">{s.city}/{s.state} · {s.experience} anos exp.</td>
                        <td className="px-5 py-3">
                          {lawyer ? (
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              Dr(a). {lawyer.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Não atrelado(a)</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {lawyer ? (
                            <button
                              onClick={() => handleUnlinkSecretary(s.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 font-bold rounded-lg text-xs hover:bg-red-100 transition-colors"
                            >
                              Remover Vínculo
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <select
                                value={selectedSecretaryLawyer[s.id] || ''}
                                onChange={e => setSelectedSecretaryLawyer(prev => ({ ...prev, [s.id]: Number(e.target.value) }))}
                                className="text-xs border border-gray-300 dark:border-[#3A3555] rounded-lg px-2.5 py-1.5 bg-white dark:bg-[#2A2545] text-gray-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                              >
                                <option value="">Selecionar Advogado...</option>
                                {lawyers.filter(l => l.status === 'verificado').map(l => (
                                  <option key={l.id} value={l.id}>{l.name} ({l.oab})</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleLinkSecretary(s.id)}
                                disabled={!selectedSecretaryLawyer[s.id]}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold rounded-lg text-xs transition-colors"
                              >
                                Atribuir
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. PACKAGES CREATOR ─── */}
      {subTab === 'packages' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">
              📦 Pacotes e Assinaturas Disponíveis
            </h3>
            <button
              onClick={() => setShowPackageForm(!showPackageForm)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
            >
              {showPackageForm ? '✕ Fechar Cadastro' : '➕ Criar Novo Pacote'}
            </button>
          </div>

          {/* Form to Create Custom Package */}
          {showPackageForm && (
            <form onSubmit={handleCreatePackage} className="bg-white dark:bg-[#1E1B38] border border-gray-200 dark:border-[#2A2545] rounded-xl p-6 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white border-b pb-2">Cadastrar Novo Pacote de Usuário</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Pacote *</label>
                  <input
                    type="text"
                    required
                    value={packageName}
                    onChange={e => setPackageName(e.target.value)}
                    placeholder="Ex: Legis Premium Gold"
                    className="w-full border border-gray-300 dark:border-[#3A3555] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#2A2545] text-gray-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Perfil de Usuário Alvo *</label>
                  <select
                    value={packageRole}
                    onChange={e => setPackageRole(e.target.value as any)}
                    className="w-full border border-gray-300 dark:border-[#3A3555] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#2A2545] text-gray-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="lawyer">Advogado</option>
                    <option value="client">Cliente</option>
                    <option value="intern">Bacharelando (Estudante)</option>
                    <option value="secretary">Secretário / Assistente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor Mensal (R$) *</label>
                  <input
                    type="text"
                    required
                    value={packagePrice}
                    onChange={e => setPackagePrice(e.target.value)}
                    placeholder="Ex: 299,90"
                    className="w-full border border-gray-300 dark:border-[#3A3555] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#2A2545] text-gray-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Inclusions checkboxes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Selecione Módulos/Recursos Incluídos</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FEATURES_LIST.map(f => (
                    <label 
                      key={f.id} 
                      className={`p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 ${
                        packageFeatures.includes(f.id)
                          ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-500 text-purple-700 dark:text-purple-300 shadow-sm'
                          : 'bg-white dark:bg-[#2A2545] border-gray-200 dark:border-[#3A3555] text-gray-600 dark:text-gray-400 hover:bg-gray-50/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={packageFeatures.includes(f.id)}
                        onChange={() => toggleFeatureInPackage(f.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      {f.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-lg transition-colors shadow-md shadow-purple-500/20"
                >
                  Salvar Pacote
                </button>
                <button
                  type="button"
                  onClick={() => setShowPackageForm(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20 text-gray-700 font-bold text-sm rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* List of active packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(p => (
              <div 
                key={p.id} 
                className={`bg-white dark:bg-[#1E1B38] border rounded-2xl p-5 flex flex-col h-full shadow-sm relative overflow-hidden ${
                  p.status === 'ativo' ? 'border-gray-200 dark:border-[#2A2545]' : 'border-dashed border-gray-300 dark:border-[#2A2545] opacity-65'
                }`}
              >
                {/* User Type Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    p.role === 'lawyer' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                    p.role === 'client' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                    p.role === 'intern' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                    'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                  }`}>
                    {p.role === 'lawyer' ? 'Advogado' : p.role === 'client' ? 'Cliente' : p.role === 'intern' ? 'Estudante' : 'Assistente'}
                  </span>
                </div>

                <div className="flex-grow space-y-4">
                  <div>
                    <h4 className="font-extrabold text-gray-950 dark:text-white text-base leading-tight pr-14">{p.name}</h4>
                    <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
                      R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<span className="text-xs font-normal text-gray-400">/mês</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Recursos Incluídos</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.features.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">Sem recursos integrados</span>
                      ) : (
                        p.features.map(fid => {
                          const feat = FEATURES_LIST.find(f => f.id === fid);
                          return (
                            <span 
                              key={fid} 
                              className="px-2 py-0.5 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-md text-[10px] text-gray-600 dark:text-gray-300 font-semibold"
                            >
                              {feat ? feat.name : fid}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-4">
                  <button
                    onClick={() => handleTogglePackageStatus(p.id)}
                    className={`text-xs font-bold ${
                      p.status === 'ativo' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    {p.status === 'ativo' ? '⚠️ Desativar' : '✓ Reativar'}
                  </button>
                  <button
                    onClick={() => handleDeletePackage(p.id)}
                    className="text-xs font-bold text-red-500 hover:text-red-700"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
