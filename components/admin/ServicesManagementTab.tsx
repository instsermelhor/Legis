import React, { useState, useEffect } from 'react';
import { mockEfficiencyServiceGroups, mockEfficiencyServices } from '../../services/mockDataService';
import type { EfficiencyServiceGroup, EfficiencyService } from '../../types';
import { SectionTitle, IconPlus, IconEdit, IconTrash } from './AdminShared';

export const ServicesManagementTab: React.FC = () => {
  const [groups, setGroups] = useState<EfficiencyServiceGroup[]>([]);
  const [services, setServices] = useState<EfficiencyService[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formGroupId, setFormGroupId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');

  // Load from local storage
  useEffect(() => {
    const savedGroups = localStorage.getItem('legis_serviceGroups');
    if (savedGroups) setGroups(JSON.parse(savedGroups));
    else setGroups(mockEfficiencyServiceGroups);

    const savedServices = localStorage.getItem('legis_services');
    if (savedServices) setServices(JSON.parse(savedServices));
    else setServices(mockEfficiencyServices);
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
      price: priceValue
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
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Gestão de Serviços" subtitle="Cadastre, edite e configure os valores dos serviços de eficiência." />
      
      <div className="flex justify-end">
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
          <IconPlus /> Novo Serviço
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
          <h3 className="font-bold text-gray-800 border-b pb-3 mb-3">{editingId ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Serviço *</label>
              <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" placeholder="Ex: Triagem Documental" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grupo do Serviço *</label>
              <select value={formGroupId} onChange={e => setFormGroupId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                <option value="" disabled>Selecione um Grupo</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" rows={2} placeholder="Descreva os detalhes do serviço..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
              <input type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" placeholder="0.00" />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Salvar Serviço</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
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
              <div key={group.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                  <h3 className="font-bold text-gray-800 text-lg">{group.name}</h3>
                </div>
                {groupServices.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">Nenhum serviço atrelado a este grupo.</div>
                ) : (
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase border-b">
                      <tr><th className="px-6 py-3">Serviço</th><th className="px-6 py-3 hidden md:table-cell">Descrição</th><th className="px-6 py-3 text-right">Preço</th><th className="px-6 py-3 text-center">Ações</th></tr>
                    </thead>
                    <tbody>
                      {groupServices.map(service => (
                        <tr key={service.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900 w-1/3">{service.name}</td>
                          <td className="px-6 py-4 hidden md:table-cell text-xs">{service.description}</td>
                          <td className="px-6 py-4 text-right font-bold text-green-700 whitespace-nowrap">R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-center space-x-3 whitespace-nowrap">
                            <button onClick={() => handleEdit(service)} className="text-blue-600 hover:text-blue-800" title="Editar"><IconEdit /></button>
                            <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-800" title="Excluir"><IconTrash /></button>
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
