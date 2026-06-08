import React, { useState, useEffect } from 'react';
import { BriefcaseIcon } from '../common/IconComponents';
import { mockEfficiencyServiceGroups, mockEfficiencyServices } from '../../services/mockDataService';
import type { EfficiencyServiceGroup, EfficiencyService } from '../../types';

export const EfficiencyServicesPage: React.FC = () => {
  const [groups, setGroups] = useState<EfficiencyServiceGroup[]>([]);
  const [services, setServices] = useState<EfficiencyService[]>([]);
  const [selectedService, setSelectedService] = useState<EfficiencyService | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  // Form for non-logged-in users
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Check if user is logged in
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  useEffect(() => {
    const savedGroups = localStorage.getItem('legis_serviceGroups');
    const savedServices = localStorage.getItem('legis_services');
    
    if (savedGroups) setGroups(JSON.parse(savedGroups));
    else setGroups(mockEfficiencyServiceGroups);

    if (savedServices) setServices(JSON.parse(savedServices));
    else setServices(mockEfficiencyServices);

    const userRaw = localStorage.getItem('legis_user');
    if (userRaw) {
      try {
        setLoggedInUser(JSON.parse(userRaw));
      } catch (e) {
        console.error('Error parsing logged-in user', e);
      }
    }
  }, []);

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
        const newTx = {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          clientName: loggedInUser.name || 'Cliente Logado',
          description: `Contratação: ${selectedService.name}`,
          amount: selectedService.price,
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

  return (
    <div className="bg-white min-h-screen dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <BriefcaseIcon className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Serviços Administrativos e de Eficiência
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Soluções ágeis e especializadas para otimizar sua rotina jurídica e documental.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {groups.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {groups.map(group => {
              const groupServices = services.filter(s => s.groupId === group.id);
              if (groupServices.length === 0) return null;

              return (
                <div key={group.id} className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-primary/20 pb-3 mb-8">
                    {group.name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {groupServices.map(service => (
                      <div key={service.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col h-full hover:shadow-lg transition-shadow dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                        <div className="flex-grow">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">{service.name}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed mb-6">{service.description}</p>
                        </div>
                        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <button 
                            onClick={() => handleOpenContract(service)}
                            className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-colors"
                          >
                            Contratar
                          </button>
                        </div>
                      </div>
                    ))}
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
                <p className="text-xl font-bold text-primary mt-3">
                  R$ {selectedService.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
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
