import React, { useState, useEffect } from 'react';
import { 
  BriefcaseIcon, 
  ClipboardListIcon, 
  ShieldCheckIcon, 
  UsersIcon, 
  UserCircleIcon, 
  PencilIcon, 
  BadgeCheckIcon, 
  ChatBubbleIcon, 
  CurrencyDollarIcon, 
  CrosshairsIcon, 
  DocumentDownloadIcon, 
  LocationMarkerIcon, 
  CalendarIcon, 
  CreditCardIcon 
} from '../common/IconComponents';
import { mockEfficiencyServiceGroups, mockEfficiencyServices } from '../../services/mockDataService';
import type { EfficiencyServiceGroup, EfficiencyService, User } from '../../types';

const getGroupIcon = (groupId: string, className = "w-4 h-4") => {
  switch (groupId) {
    case 'group-1': return <ClipboardListIcon className={className} />;
    case 'group-2': return <ShieldCheckIcon className={className} />;
    case 'group-3': return <UsersIcon className={className} />;
    case 'group-4': return <UserCircleIcon className={className} />;
    case 'group-5': return <PencilIcon className={className} />;
    case 'group-6': return <UsersIcon className={className} />;
    case 'group-7': return <BadgeCheckIcon className={className} />;
    case 'group-8': return <ChatBubbleIcon className={className} />;
    case 'group-9': return <CurrencyDollarIcon className={className} />;
    case 'group-10': return <CrosshairsIcon className={className} />;
    case 'group-11': return <DocumentDownloadIcon className={className} />;
    case 'group-12': return <LocationMarkerIcon className={className} />;
    case 'group-13': return <CalendarIcon className={className} />;
    case 'group-14': return <CreditCardIcon className={className} />;
    case 'group-15': return <BriefcaseIcon className={className} />;
    default: return <BriefcaseIcon className={className} />;
  }
};

export interface EfficiencyServicesPageProps {
  embedded?: boolean;
}

export const EfficiencyServicesPage: React.FC<EfficiencyServicesPageProps> = ({ embedded = false }) => {
  const [groups] = useState<EfficiencyServiceGroup[]>(() => {
    const isMigrated = localStorage.getItem('legis_services_initialized_v6');
    if (!isMigrated) {
      localStorage.setItem('legis_serviceGroups', JSON.stringify(mockEfficiencyServiceGroups));
      localStorage.setItem('legis_services', JSON.stringify(mockEfficiencyServices));
      localStorage.setItem('legis_services_initialized_v6', 'true');
      return mockEfficiencyServiceGroups;
    } else {
      const savedGroups = localStorage.getItem('legis_serviceGroups');
      return savedGroups ? JSON.parse(savedGroups) : mockEfficiencyServiceGroups;
    }
  });
  const [services] = useState<EfficiencyService[]>(() => {
    const isMigrated = localStorage.getItem('legis_services_initialized_v6');
    if (!isMigrated) {
      return mockEfficiencyServices;
    } else {
      const savedServices = localStorage.getItem('legis_services');
      return savedServices ? JSON.parse(savedServices) : mockEfficiencyServices;
    }
  });
  const [groupDiscounts] = useState<Record<string, { lawyer: number; intern: number; secretary: number; client: number }>>(() => {
    const savedGroupDiscounts = localStorage.getItem('legis_group_discounts');
    return savedGroupDiscounts ? JSON.parse(savedGroupDiscounts) : {};
  });
  const [selectedService, setSelectedService] = useState<EfficiencyService | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  
  // Form for non-logged-in users
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Check if user is logged in
  const [loggedInUser] = useState<User | null>(() => {
    const userRaw = localStorage.getItem('legis_user');
    if (userRaw) {
      try {
        return JSON.parse(userRaw);
      } catch (e) {
        console.error('Error parsing logged-in user', e);
      }
    }
    return null;
  });

  const getServiceDiscount = (service: EfficiencyService): number => {
    if (!loggedInUser) return 0;
    const role = loggedInUser.role;
    
    let specific: number | undefined;
    let group: number | undefined;

    if (role === 'lawyer') {
      specific = service.discountLawyer;
      group = groupDiscounts[service.groupId]?.lawyer;
    } else if (role === 'intern') {
      specific = service.discountIntern;
      group = groupDiscounts[service.groupId]?.intern;
    } else if (role === 'secretary') {
      specific = service.discountSecretary;
      group = groupDiscounts[service.groupId]?.secretary;
    } else if (role === 'client') {
      specific = service.discountClient;
      group = groupDiscounts[service.groupId]?.client;
    }

    if (specific !== undefined && specific > 0) {
      return specific;
    }
    return group ?? 0;
  };

  useEffect(() => {
    if (selectedGroupFilter !== 'all') {
      const matchCount = services.filter(s => 
        s.groupId === selectedGroupFilter && 
        (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         s.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ).length;
      if (matchCount === 0) {
        const timer = setTimeout(() => setSelectedGroupFilter('all'), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [searchQuery, services, selectedGroupFilter]);

  const handleOpenContract = (service: EfficiencyService) => {
    setSelectedService(service);
    setIsConfirmModalOpen(true);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!contactForm.name.trim()) errors.name = 'Nome completo é obrigatório';
    if (!contactForm.email.trim()) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/^\S+@\S+\.\S+$/.test(contactForm.email)) {
      errors.email = 'Insira um e-mail válido';
    }
    if (!contactForm.phone.trim()) {
      errors.phone = 'Celular é obrigatório';
    } else if (!/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(contactForm.phone.replace(/\s/g, ''))) {
      errors.phone = 'Insira um celular válido (ex: (11) 99999-9999)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    if (!loggedInUser) {
      if (!validateForm()) return;
    }

    // 1. Increment contracted service count in localStorage
    let counts: Record<string, number> = {};
    try {
      const saved = localStorage.getItem('legis_contracted_services');
      if (saved) counts = JSON.parse(saved);
      else {
        // Initialize default mock counts
        services.forEach((s, idx) => {
          counts[s.id] = (idx + 1) * 3;
        });
      }
    } catch (e) {
      console.error(e);
    }
    
    counts[selectedService.id] = (counts[selectedService.id] || 0) + 1;
    localStorage.setItem('legis_contracted_services', JSON.stringify(counts));

    // 2. Mock adding to financial transactions if user is logged in
    if (loggedInUser) {
      try {
        const savedTxRaw = localStorage.getItem('legis_financial_tx');
        const txList = savedTxRaw ? JSON.parse(savedTxRaw) : [];
        const discountPct = getServiceDiscount(selectedService);
        const finalPrice = discountPct > 0 ? selectedService.price * (1 - discountPct / 100) : selectedService.price;
        const newTx = {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          clientName: loggedInUser.name || 'Cliente Logado',
          description: `Contratação: ${selectedService.name}${discountPct > 0 ? ` (${discountPct}% desc.)` : ''}`,
          amount: finalPrice,
          status: 'pendente'
        };
        localStorage.setItem('legis_financial_tx', JSON.stringify([...txList, newTx]));
      } catch (e) {
        console.error('Error adding financial transaction', e);
      }
    }

    // 3. Switch modals
    setIsConfirmModalOpen(false);
    setIsSuccessModalOpen(true);
    
    // Clear form
    setContactForm({ name: '', email: '', phone: '' });
  };

  // Check if any service matches the keyword search
  const hasMatchedServices = groups.some(group => 
    services.some(s => 
      s.groupId === group.id && 
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  return (
    <div className={embedded ? "space-y-6" : "bg-white min-h-screen dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"}>
      {!embedded && (
        <div className="bg-primary/5 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
            <BriefcaseIcon className="h-10 w-10 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Serviços Administrativos e de Eficiência
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Soluções ágeis e especializadas para otimizar sua rotina jurídica e documental.
            </p>
          </div>
        </div>
      )}

      {embedded && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">💼 Serviços Administrativos e de Eficiência</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Contrate soluções administrativas e de otimização de forma nativa e integrada.
          </p>
        </div>
      )}

      <div className={embedded ? "py-2" : "container mx-auto px-4 sm:px-6 lg:px-8 py-12"}>
        {/* Keyword Search Filter */}
        {groups.length > 0 && (
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-gray-950 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-white placeholder-gray-400"
                placeholder="Buscar serviços por palavra-chave..."
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Small Menu / Navigation divided by service groups */}
        {groups.length > 0 && (
          <div className="mb-8 bg-gray-50 dark:bg-[#2A2545]/40 rounded-xl p-4 border border-gray-200/60 dark:border-white/5 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categorias de Serviços</p>
              {selectedGroupFilter !== 'all' && (
                <button 
                  type="button" 
                  onClick={() => setSelectedGroupFilter('all')}
                  className="text-xs font-semibold text-primary dark:text-purple-400 hover:underline"
                >
                  Mostrar Todos
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedGroupFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedGroupFilter === 'all'
                    ? 'bg-primary text-white shadow-sm shadow-primary/25'
                    : 'bg-white text-gray-600 hover:bg-gray-105 border border-gray-205 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-gray-300 dark:hover:bg-[#3A3555]'
                }`}
              >
                📁 Todos os Grupos
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${
                  selectedGroupFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-105 text-gray-500 dark:bg-black/20 dark:text-gray-400'
                }`}>
                  {services.filter(s => 
                    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    s.description.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length}
                </span>
              </button>
              {groups.map(g => {
                const count = services.filter(s => 
                  s.groupId === g.id && 
                  (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   s.description.toLowerCase().includes(searchQuery.toLowerCase()))
                ).length;
                
                if (count === 0) return null;
                const cleanName = g.name.replace(/^\d+\.\s*/, '');

                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGroupFilter(g.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      selectedGroupFilter === g.id
                        ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25'
                        : 'bg-white text-gray-650 hover:bg-gray-105 border-gray-205 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-gray-350 dark:hover:bg-[#3A3555]'
                    }`}
                  >
                    <span>{getGroupIcon(g.id, "w-3.5 h-3.5")}</span>
                    {cleanName}
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${
                      selectedGroupFilter === g.id ? 'bg-white/20 text-white' : 'bg-gray-105 text-gray-500 dark:bg-black/20 dark:text-gray-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {groups.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">Nenhum serviço disponível no momento.</p>
          </div>
        ) : !hasMatchedServices ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 dark:bg-[#2A2545] dark:border-[#3A3555]">
            <svg className="w-12 h-12 text-gray-350 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Nenhum serviço encontrado para "<strong>{searchQuery}</strong>".
            </p>
            <button 
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 text-sm font-semibold text-primary dark:text-purple-400 hover:underline"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {groups.map(group => {
              if (selectedGroupFilter !== 'all' && group.id !== selectedGroupFilter) return null;

              const groupServices = services.filter(s => 
                s.groupId === group.id && 
                (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 s.description.toLowerCase().includes(searchQuery.toLowerCase()))
              );
              if (groupServices.length === 0) return null;

              return (
                <div key={group.id} className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b-2 border-primary/20 pb-3 mb-8">
                    {group.name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {groupServices.map(service => {
                      const discountPct = getServiceDiscount(service);
                      const finalPrice = discountPct > 0 ? service.price * (1 - discountPct / 100) : service.price;
                      return (
                        <div key={service.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col h-full hover:shadow-lg transition-shadow dark:text-white dark:bg-[#2A2545] dark:border-[#3A3555]">
                          <div className="flex-grow">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 dark:bg-primary/20 dark:text-purple-300">
                                {getGroupIcon(service.groupId, "w-4 h-4")}
                              </div>
                              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{service.name}</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">{service.description}</p>
                          </div>
                          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                            <div className="flex flex-col">
                              {discountPct > 0 && (
                                <span className="text-xs text-gray-400 line-through">
                                  R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              )}
                              <span className="text-2xl font-bold text-primary dark:text-purple-400 flex items-center gap-2">
                                R$ {finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                {discountPct > 0 && (
                                  <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-300 px-1.5 py-0.5 rounded-full font-bold">
                                    {discountPct}% OFF
                                  </span>
                                )}
                              </span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleOpenContract(service)}
                              className="px-4 py-2 bg-primary/10 text-primary dark:bg-purple-950/30 dark:text-purple-300 font-medium rounded-lg hover:bg-primary hover:text-white dark:hover:bg-purple-600 dark:hover:text-white transition-colors"
                            >
                              Contratar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONFIRM / REQUEST MODAL */}
      {isConfirmModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsConfirmModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden dark:bg-[#1A1730] dark:border-[#2A2545]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/10">
              <h2 className="text-lg font-bold text-gray-950 dark:text-white">🚀 Contratar Serviço</h2>
              <button onClick={() => setIsConfirmModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleConfirmContract} className="p-6 space-y-4">
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <p className="text-xs text-primary font-bold uppercase tracking-wider">Serviço Selecionado</p>
                <p className="text-base font-bold text-gray-950 dark:text-white mt-1">{selectedService.name}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedService.description}</p>
                <div className="mt-3 flex flex-col">
                  {getServiceDiscount(selectedService) > 0 && (
                    <span className="text-xs text-gray-400 line-through">
                      R$ {selectedService.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  <p className="text-xl font-bold text-primary flex items-center gap-2">
                    R$ {(getServiceDiscount(selectedService) > 0 ? selectedService.price * (1 - getServiceDiscount(selectedService) / 100) : selectedService.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    {getServiceDiscount(selectedService) > 0 && (
                      <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-300 px-1.5 py-0.5 rounded-full font-bold">
                        {getServiceDiscount(selectedService)}% OFF
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {loggedInUser ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300">
                  <p className="text-xs font-bold uppercase tracking-wide">Conta Identificada</p>
                  <p className="text-sm font-semibold mt-1">Cliente: {loggedInUser.name}</p>
                  <p className="text-xs opacity-80">E-mail: {loggedInUser.email}</p>
                  <p className="text-xs mt-2">Clique em confirmar para fechar a contratação deste serviço administrativo.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Forneça seus dados de contato rápido</p>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Nome Completo</label>
                    <input 
                      type="text" 
                      value={contactForm.name} 
                      onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-gray-950 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-white ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Seu nome completo" 
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-0.5">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">E-mail</label>
                    <input 
                      type="email" 
                      value={contactForm.email} 
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-gray-950 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-white ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="exemplo@email.com" 
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-0.5">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Celular com WhatsApp</label>
                    <input 
                      type="text" 
                      value={contactForm.phone} 
                      onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-gray-950 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-white ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="(11) 99999-9999" 
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-0.5">{formErrors.phone}</p>}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 py-3 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                >
                  {loggedInUser ? 'Confirmar Contratação' : 'Enviar Solicitação'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {isSuccessModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsSuccessModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center space-y-4 dark:bg-[#1A1730]" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-2 animate-bounce">
              ✓
            </div>
            <h3 className="text-xl font-bold text-gray-950 dark:text-white">Sucesso!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Sua contratação do serviço <strong>{selectedService.name}</strong> foi registrada!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {loggedInUser 
                ? `Um comprovante foi enviado para o e-mail cadastrado (${loggedInUser.email}). Nossa equipe ou o advogado responsável entrará em contato via WhatsApp.`
                : `Nossa equipe de assessores jurídicos recebeu seus dados e iniciará o atendimento via WhatsApp em instantes.`}
            </p>
            <button 
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
