import { Icon } from '@/components/common/IconComponents';
import React, { useState } from 'react';
import { mockLegalDocuments, mockAdminUsers, mockEfficiencyServiceGroups, hashPassword, mockBiApoio, mockBiDadosBase, mockBiClientes, mockBiProdutos, mockBiFornecedores, mockBiVendas } from '../../../services/mockDataService';
import type { LegalDocument, AdminUser } from '../../../services/mockDataService';
import { SectionTitle, IconEdit, IconPlus, IconKey, IconUpload, IconTrash } from '../AdminShared';
import { dbCodes, LegalCode, dbCloud, CodeVersion } from '../../../services/dbService';
import { useAppConfig } from '../../../context/AppContext';
import type { EfficiencyServiceGroup, BiApoio, BiDadosBase, BiCliente, BiProduto, BiFornecedor, BiVenda } from '../../../types';
import { LegalAiTools } from '../../common/LegalAiTools';


// Helper to extract printable ASCII text from binary files (e.g. PDF/DOCX) to prevent garbled text
const extractPrintableText = (arrayBuffer: ArrayBuffer, limit: number = 2000): string => {
  const view = new DataView(arrayBuffer);
  let result = '';
  let currentWord = '';
  for (let i = 0; i < view.byteLength && result.length < limit; i++) {
    const charCode = view.getUint8(i);
    if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13 || charCode === 9) {
      const char = String.fromCharCode(charCode);
      currentWord += char;
    } else {
      if (currentWord.trim().length > 4) {
        result += currentWord.trim() + '\n';
      }
      currentWord = '';
    }
  }
  if (currentWord.trim().length > 4) {
    result += currentWord.trim();
  }
  return result.replace(/\n+/g, '\n').substring(0, limit);
};


// ─── Service Groups Settings ──────────────────────────────────────────────────

export const ServiceGroupsSettings: React.FC = () => {
  const [groups, setGroups] = useState<EfficiencyServiceGroup[]>(() => {
    const saved = localStorage.getItem('legis_serviceGroups');
    return saved ? JSON.parse(saved) : mockEfficiencyServiceGroups;
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');

  const saveToStorage = (newGroups: EfficiencyServiceGroup[]) => {
    setGroups(newGroups);
    localStorage.setItem('legis_serviceGroups', JSON.stringify(newGroups));
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    let newGroups;
    if (editingId) {
      newGroups = groups.map(g => g.id === editingId ? { ...g, name: formName } : g);
    } else {
      newGroups = [...groups, { id: `group-${Date.now()}`, name: formName }];
    }
    saveToStorage(newGroups);
    setShowForm(false);
    setEditingId(null);
    setFormName('');
  };

  const handleEdit = (group: EfficiencyServiceGroup) => {
    setEditingId(group.id);
    setFormName(group.name);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo? Os serviços atrelados poderão ficar órfãos.')) {
      saveToStorage(groups.filter(g => g.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-800">Grupos de Serviços de Eficiência</h3>
        <button onClick={() => { setShowForm(true); setEditingId(null); setFormName(''); }} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
          <IconPlus /> Novo Grupo
        </button>
      </div>
      
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
          <label className="block text-xs font-medium text-gray-600 mb-1">{editingId ? 'Editar Nome do Grupo' : 'Nome do Novo Grupo'}</label>
          <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" placeholder="Ex: Gestão Documental" />
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">Salvar Grupo</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr><th className="px-5 py-3">Nome do Grupo</th><th className="px-5 py-3 text-right">Ações</th></tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <tr key={g.id} className="border-b hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{g.name}</td>
                <td className="px-5 py-3 text-right space-x-3">
                  <button onClick={() => handleEdit(g)} className="text-blue-600 font-medium hover:underline flex-inline items-center gap-1"><IconEdit /> Editar</button>
                  <button onClick={() => handleDelete(g.id)} className="text-red-600 font-medium hover:underline flex-inline items-center gap-1"><IconTrash /> Excluir</button>
                </td>
              </tr>
            ))}
            {groups.length === 0 && <tr><td colSpan={2} className="px-5 py-6 text-center text-gray-500">Nenhum grupo cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

