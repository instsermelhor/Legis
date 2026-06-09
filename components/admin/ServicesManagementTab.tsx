import React, { useState, useEffect } from 'react';
import { mockEfficiencyServiceGroups, mockEfficiencyServices } from '../../services/mockDataService';
import type { EfficiencyServiceGroup, EfficiencyService } from '../../types';
import { SectionTitle, IconPlus, IconEdit, IconTrash } from './AdminShared';

export const ServicesManagementTab: React.FC = () => {
  const [groups, setGroups] = useState<EfficiencyServiceGroup[]>([]);
  const [services, setServices] = useState<EfficiencyService[]>([]);
  const [groupDiscounts, setGroupDiscounts] = useState<Record<string, { lawyer: number; intern: number; secretary: number; client: number }>>({});
  const [localGroupDiscounts, setLocalGroupDiscounts] = useState<Record<string, { lawyer: number; intern: number; secretary: number; client: number }>>({});
  const [savedGroupsState, setSavedGroupsState] = useState<Record<string, boolean>>({});
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formGroupId, setFormGroupId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountLawyer, setFormDiscountLawyer] = useState('');
  const [formDiscountIntern, setFormDiscountIntern] = useState('');
  const [formDiscountSecretary, setFormDiscountSecretary] = useState('');
  const [formDiscountClient, setFormDiscountClient] = useState('');

  // Load from local storage
  useEffect(() => {
    const isMigrated = localStorage.getItem('legis_services_initialized_v6');
    if (!isMigrated) {
      localStorage.setItem('legis_serviceGroups', JSON.stringify(mockEfficiencyServiceGroups));
      localStorage.setItem('legis_services', JSON.stringify(mockEfficiencyServices));
      localStorage.setItem('legis_services_initialized_v6', 'true');
      setGroups(mockEfficiencyServiceGroups);
      setServices(mockEfficiencyServices);
    } else {
      const savedGroups = localStorage.getItem('legis_serviceGroups');
      if (savedGroups) setGroups(JSON.parse(savedGroups));
      else setGroups(mockEfficiencyServiceGroups);

      const savedServices = localStorage.getItem('legis_services');
      if (savedServices) setServices(JSON.parse(savedServices));
      else setServices(mockEfficiencyServices);
    }

    const savedGroupDiscounts = localStorage.getItem('legis_group_discounts');
    if (savedGroupDiscounts) {
      const parsed = JSON.parse(savedGroupDiscounts);
      setGroupDiscounts(parsed);
      setLocalGroupDiscounts(parsed);
    }
  }, []);

  const saveServicesToStorage = (newServices: EfficiencyService[]) => {
    setServices(newServices);
    localStorage.setItem('legis_services', JSON.stringify(newServices));
  };

  const handleSave = () => {
    if (!formName || !formGroupId || !formPrice) return;
    
    const priceValue = parseFloat(formPrice.replace(',', '.'));
    if (isNaN(priceValue)) {
      alert('Por favor, insira um preço válido.');
      return;
    }

    const newService: EfficiencyService = {
      id: editingId || `serv-${Date.now()}`,
      groupId: formGroupId,
      name: formName,
      description: formDescription,
      price: priceValue,
      discountLawyer: Math.min(100, Math.max(0, parseFloat(formDiscountLawyer) || 0)),
      discountIntern: Math.min(100, Math.max(0, parseFloat(formDiscountIntern) || 0)),
      discountSecretary: Math.min(100, Math.max(0, parseFloat(formDiscountSecretary) || 0)),
      discountClient: Math.min(100, Math.max(0, parseFloat(formDiscountClient) || 0)),
    };

    let newServices;
    if (editingId) {
      newServices = services.map(s => s.id === editingId ? newService : s);
    } else {
      newServices = [...services, newService];
    }

    saveServicesToStorage(newServices);
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (service: EfficiencyService) => {
    setEditingId(service.id);
    setFormGroupId(service.groupId);
    setFormName(service.name);
    setFormDescription(service.description);
    setFormPrice(service.price.toString());
    setFormDiscountLawyer(service.discountLawyer?.toString() || '');
    setFormDiscountIntern(service.discountIntern?.toString() || '');
    setFormDiscountSecretary(service.discountSecretary?.toString() || '');
    setFormDiscountClient(service.discountClient?.toString() || '');
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      saveServicesToStorage(services.filter(s => s.id !== id));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormGroupId(groups.length > 0 ? groups[0].id : '');
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormDiscountLawyer('');
    setFormDiscountIntern('');
    setFormDiscountSecretary('');
    setFormDiscountClient('');
  };

  const handleDiscountInputChange = (groupId: string, role: 'lawyer' | 'intern' | 'secretary' | 'client', val: string) => {
    const num = Math.min(100, Math.max(0, parseFloat(val) || 0));
    const current = localGroupDiscounts[groupId] || { lawyer: 0, intern: 0, secretary: 0, client: 0 };
    const updatedGroup = { ...current, [role]: num };
    setLocalGroupDiscounts(prev => ({
      ...prev,
      [groupId]: updatedGroup
    }));
  };

  const isGroupDiscountDirty = (groupId: string) => {
    const saved = groupDiscounts[groupId] || { lawyer: 0, intern: 0, secretary: 0, client: 0 };
    const local = localGroupDiscounts[groupId] || { lawyer: 0, intern: 0, secretary: 0, client: 0 };
    return saved.lawyer !== local.lawyer ||
           saved.intern !== local.intern ||
           saved.secretary !== local.secretary ||
           saved.client !== local.client;
  };

  const handleSaveGroupDiscount = (groupId: string) => {
    const localVal = localGroupDiscounts[groupId] || { lawyer: 0, intern: 0, secretary: 0, client: 0 };
    const updatedDiscounts = { ...groupDiscounts, [groupId]: localVal };
    
    setGroupDiscounts(updatedDiscounts);
    localStorage.setItem('legis_group_discounts', JSON.stringify(updatedDiscounts));
    
    setSavedGroupsState(prev => ({ ...prev, [groupId]: true }));
    setTimeout(() => {
      setSavedGroupsState(prev => ({ ...prev, [groupId]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Gestão de Serviços e Descontos" subtitle="Cadastre serviços, gerencie preços e controle descontos gerais por grupos ou específicos por serviço." />
      
      <div className="flex justify-end">
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
          <IconPlus /> Novo Serviço
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
          <h3 className="font-bold text-gray-800 dark:text-white border-b pb-3 mb-3">{editingId ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Serviço *</label>
              <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" placeholder="Ex: Triagem Documental" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grupo do Serviço *</label>
              <select value={formGroupId} onChange={e => setFormGroupId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500">
                <option value="" disabled>Selecione um Grupo</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
              <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" rows={2} placeholder="Descreva os detalhes do serviço..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço (R$) *</label>
              <input type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" placeholder="0.00" />
            </div>
          </div>

          {/* Descontos Específicos */}
          <div className="border-t border-gray-100 dark:border-white/5 pt-4 space-y-3">
            <h4 className="font-bold text-sm text-purple-700 dark:text-purple-400">Descontos Específicos deste Serviço para Assinantes (%)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Advogados</label>
                <input type="number" min="0" max="100" value={formDiscountLawyer} onChange={e => setFormDiscountLawyer(e.target.value)} className="w-full border border-gray-300 dark:border-[#3A3555] rounded-lg px-3 py-2 text-sm bg-white text-gray-900 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Bacharelandos</label>
                <input type="number" min="0" max="100" value={formDiscountIntern} onChange={e => setFormDiscountIntern(e.target.value)} className="w-full border border-gray-300 dark:border-[#3A3555] rounded-lg px-3 py-2 text-sm bg-white text-gray-900 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Secret./Assist.</label>
                <input type="number" min="0" max="100" value={formDiscountSecretary} onChange={e => setFormDiscountSecretary(e.target.value)} className="w-full border border-gray-300 dark:border-[#3A3555] rounded-lg px-3 py-2 text-sm bg-white text-gray-900 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Clientes</label>
                <input type="number" min="0" max="100" value={formDiscountClient} onChange={e => setFormDiscountClient(e.target.value)} className="w-full border border-gray-300 dark:border-[#3A3555] rounded-lg px-3 py-2 text-sm bg-white text-gray-900 dark:bg-[#2A2545] dark:border-[#3A3555] dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" placeholder="0" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Salvar Serviço</button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm font-medium border border-yellow-200">
          Você não possui nenhum "Grupo de Serviço" criado. Acesse as Configurações para criar os grupos antes de adicionar serviços.
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(group => {
            const groupServices = services.filter(s => s.groupId === group.id);
            return (
              <div key={group.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545]">
                {/* Group Header */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545]">
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">{group.name}</h3>
                </div>

                {/* Group Discounts */}
                <div className="bg-purple-50/40 dark:bg-purple-950/10 px-6 py-4 border-b border-gray-200 dark:border-[#2A2545] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest">Desconto Geral do Grupo para Assinantes (%)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { role: 'lawyer', label: 'Advogados' },
                        { role: 'intern', label: 'Bacharelandos' },
                        { role: 'secretary', label: 'Secret./Assist.' },
                        { role: 'client', label: 'Clientes' }
                      ].map(item => {
                        const val = localGroupDiscounts[group.id]?.[item.role as 'lawyer'] ?? 0;
                        return (
                          <div key={item.role} className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-gray-600 dark:text-gray-400 shrink-0">{item.label}:</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={val || ''}
                              placeholder="0"
                              onChange={e => handleDiscountInputChange(group.id, item.role as any, e.target.value)}
                              className="w-16 border border-gray-300 dark:border-[#3A3555] rounded px-2.5 py-1 text-center bg-white dark:bg-[#2A2545] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                            <span className="text-gray-400 font-semibold">%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-end justify-end shrink-0">
                    <button
                      onClick={() => handleSaveGroupDiscount(group.id)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                        isGroupDiscountDirty(group.id)
                          ? 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                          : 'bg-gray-100 text-gray-400 dark:bg-[#2A2545] dark:text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!isGroupDiscountDirty(group.id)}
                    >
                      <span>💾</span>
                      <span>{savedGroupsState[group.id] ? 'Salvo!' : 'Salvar'}</span>
                    </button>
                  </div>
                </div>

                {groupServices.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">Nenhum serviço atrelado a este grupo.</div>
                ) : (
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase border-b bg-gray-50/50 dark:bg-black/10">
                      <tr>
                        <th className="px-6 py-3">Serviço</th>
                        <th className="px-6 py-3 hidden md:table-cell">Descrição</th>
                        <th className="px-6 py-3">Descontos Específicos (Adv/Est/Sec/Cli)</th>
                        <th className="px-6 py-3 text-right">Preço</th>
                        <th className="px-6 py-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {groupServices.map(service => (
                        <tr key={service.id} className="last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white w-1/4">{service.name}</td>
                          <td className="px-6 py-4 hidden md:table-cell text-xs text-gray-500 dark:text-gray-400 w-1/3">{service.description}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-purple-600 dark:text-purple-400">
                            {service.discountLawyer || 0}% / {service.discountIntern || 0}% / {service.discountSecretary || 0}% / {service.discountClient || 0}%
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-green-700 dark:text-green-400 whitespace-nowrap">
                            R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-center space-x-3 whitespace-nowrap">
                            <button onClick={() => handleEdit(service)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="Editar"><IconEdit /></button>
                            <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Excluir"><IconTrash /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};
