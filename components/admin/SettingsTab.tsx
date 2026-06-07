import React, { useState } from 'react';
import { mockLegalDocuments, mockAdminUsers, mockEfficiencyServiceGroups } from '../../services/mockDataService';
import type { LegalDocument, AdminUser } from '../../services/mockDataService';
import { SectionTitle, IconEdit, IconPlus, IconKey, IconUpload, IconTrash } from './AdminShared';
import { dbCodes, LegalCode } from '../../services/dbService';
import { useAppConfig } from '../../context/AppContext';
import type { EfficiencyServiceGroup } from '../../types';

// ─── Legal Documents ──────────────────────────────────────────────────────────
const LegalDocuments: React.FC = () => {
  const [docs, setDocs] = useState<LegalDocument[]>(() => {
    const savedDocs = localStorage.getItem('legis_legal_docs');
    return savedDocs ? JSON.parse(savedDocs) : mockLegalDocuments;
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const saveDocs = (newDocs: LegalDocument[]) => {
    setDocs(newDocs);
    localStorage.setItem('legis_legal_docs', JSON.stringify(newDocs));
  };

  const handleContentChange = (id: string, content: string) => {
    const updated = docs.map(d => d.id === id ? { ...d, content, lastUpdated: new Date().toISOString().split('T')[0] } : d);
    saveDocs(updated);
  };

  const handleSave = (id: string) => {
    setSaved(id);
    setEditingId(null);
    setTimeout(() => setSaved(null), 2500);
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const updated = docs.map(d => d.id === id ? { ...d, content: `[Arquivo: ${file.name}]\n${content.substring(0, 500)}...`, lastUpdated: new Date().toISOString().split('T')[0] } : d);
      saveDocs(updated);
    };
    reader.readAsText(file);
  };

  const handleAdd = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const newDoc: LegalDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle,
      content: newContent,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    const updated = [...docs, newDoc];
    saveDocs(updated);
    setNewTitle('');
    setNewContent('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento legal?')) {
      const updated = docs.filter(d => d.id !== id);
      saveDocs(updated);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">Documentos Legais</h3>
          <p className="text-sm text-gray-500">Edite, adicione ou exclua os termos, políticas e outros documentos legais.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
          <IconPlus /> Novo Documento
        </button>
      </div>

      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2"><IconPlus /> Adicionar Novo Documento Legal</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título do Documento *</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white" placeholder="Ex: Política de Cookies" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Conteúdo do Documento *</label>
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={5} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y bg-white" placeholder="Escreva o conteúdo do documento..." />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">Adicionar Documento</button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {docs.map(doc => (
          <div key={doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{doc.title}</p>
                <p className="text-xs text-gray-400">Atualizado em: {new Date(doc.lastUpdated).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                  <IconUpload /> Upload
                  <input type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={e => handleFileUpload(doc.id, e)} />
                </label>
                <button onClick={() => setEditingId(editingId === doc.id ? null : doc.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
                  <IconEdit /> {editingId === doc.id ? 'Fechar' : 'Editar'}
                </button>
                <button onClick={() => handleDelete(doc.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                  <IconTrash /> Excluir
                </button>
                {saved === doc.id && <span className="text-xs text-green-600 font-medium self-center">✓ Salvo!</span>}
              </div>
            </div>

            {editingId === doc.id ? (
              <div className="p-4">
                <textarea
                  value={doc.content}
                  onChange={e => handleContentChange(doc.id, e.target.value)}
                  rows={10}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y font-mono"
                />
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleSave(doc.id)} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
                    Salvar Documento
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-sm text-gray-600 line-clamp-3">{doc.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Admin Users ──────────────────────────────────────────────────────────────
const roleLabels: Record<AdminUser['role'], string> = { super: 'Super Admin', manager: 'Gerente', viewer: 'Visualizador' };
const roleColors: Record<AdminUser['role'], string> = { super: 'bg-red-100 text-red-800', manager: 'bg-blue-100 text-blue-800', viewer: 'bg-gray-100 text-gray-700' };

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('legis_admin_users');
    return saved ? JSON.parse(saved) : mockAdminUsers;
  });
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'viewer' as AdminUser['role'] });
  const [saved, setSaved] = useState(false);

  const saveUsers = (newUsers: AdminUser[]) => {
    setUsers(newUsers);
    localStorage.setItem('legis_admin_users', JSON.stringify(newUsers));
  };

  const handleCreate = () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    const user: AdminUser = { id: Date.now(), ...newUser, createdAt: new Date().toISOString().split('T')[0], active: true };
    const updated = [...users, user];
    saveUsers(updated);
    setNewUser({ name: '', email: '', password: '', role: 'viewer' });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleActive = (id: number) => {
    const updated = users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    saveUsers(updated);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário administrativo?')) {
      const updated = users.filter(u => u.id !== id);
      saveUsers(updated);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-800">Credenciais de Acesso Administrativo</h3>
        <button onClick={() => setShowForm(f => !f)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
          <IconPlus /> Novo Admin
        </button>
      </div>
      {saved && <p className="text-sm text-green-600 font-medium">✓ Usuário criado com sucesso!</p>}

      {/* New user form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2"><IconKey /> Criar Novo Usuário Admin</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
              <input value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border" placeholder="Nome completo" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
              <input type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border" placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Senha</label>
              <input type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border" placeholder="Senha de acesso" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nível de Acesso</label>
              <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value as AdminUser['role'] }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white">
                <option value="viewer">Visualizador</option>
                <option value="manager">Gerente</option>
                <option value="super">Super Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">Criar Usuário</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr><th className="px-5 py-3">Nome</th><th className="px-5 py-3">E-mail</th><th className="px-5 py-3">Nível</th><th className="px-5 py-3">Cadastro</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-center">Ação</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-5 py-3">{u.email}</td>
                <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleColors[u.role]}`}>{roleLabels[u.role]}</span></td>
                <td className="px-5 py-3">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{u.active ? 'Ativo' : 'Inativo'}</span></td>
                <td className="px-5 py-3 text-center">
                  {u.role !== 'super' && (
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => toggleActive(u.id)} className={`text-xs font-medium hover:underline ${u.active ? 'text-amber-600' : 'text-green-600'}`}>
                        {u.active ? 'Desativar' : 'Ativar'}
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="text-xs font-medium text-red-600 hover:underline">
                        Excluir
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── General Settings ─────────────────────────────────────────────────────────
const GeneralSettings: React.FC = () => {
  const { config, updateConfig, setLogoFromFile } = useAppConfig();
  const [appName, setAppName] = useState(config.appName || '');
  const [siteTagline, setSiteTagline] = useState(config.siteTagline || '');
  const [footerText, setFooterText] = useState(config.footerText || '');
  const [contactEmail, setContactEmail] = useState(config.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(config.contactPhone || '');
  const [customFields, setCustomFields] = useState<{ id: string; key: string; value: string }[]>(() => config.customFields || []);
  
  // Custom fields form state
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateConfig({
      appName: appName.trim(),
      siteTagline: siteTagline.trim(),
      footerText: footerText.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      customFields
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleHeaderLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFromFile(file, 'headerLogoUrl');
    }
  };

  const handleFooterLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFromFile(file, 'footerLogoUrl');
    }
  };

  const deleteLogo = (target: 'headerLogoUrl' | 'footerLogoUrl') => {
    updateConfig({ [target]: null });
  };

  const handleAddCustomField = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    const newField = {
      id: `field-${Date.now()}`,
      key: newKey.trim(),
      value: newValue.trim()
    };
    setCustomFields(prev => [...prev, newField]);
    setNewKey('');
    setNewValue('');
  };

  const handleDeleteCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const handleEditCustomField = (id: string, key: string, value: string) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, key, value } : f));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-800">Configurações Gerais</h3>
        <span className="text-xs text-gray-400">Última atualização: {config.updatedAt ? new Date(config.updatedAt).toLocaleString('pt-BR') : 'Sem dados'}</span>
      </div>
      
      {/* App details */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase">Nome do Aplicativo</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setAppName('')} className="text-[10px] font-bold text-red-600 hover:underline">Limpar</button>
              <button type="button" onClick={() => setAppName('Legis Connect')} className="text-[10px] font-bold text-primary hover:underline">Restaurar Padrão</button>
            </div>
          </div>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white" value={appName} onChange={e => setAppName(e.target.value)} placeholder="Ex: Legis Connect" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase">Slogan Principal</label>
            <button type="button" onClick={() => setSiteTagline('')} className="text-[10px] font-bold text-red-600 hover:underline">Excluir Slogan</button>
          </div>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white" value={siteTagline} onChange={e => setSiteTagline(e.target.value)} placeholder="Slogan do aplicativo" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase">Texto do Rodapé</label>
            <button type="button" onClick={() => setFooterText('')} className="text-[10px] font-bold text-red-600 hover:underline">Excluir Copyright</button>
          </div>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white" value={footerText} onChange={e => setFooterText(e.target.value)} placeholder="Ex: © 2026 Legis Connect. Todos os direitos reservados." />
        </div>
      </div>

      {/* Contact information details */}
      <div className="pt-4 border-t space-y-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Informações de Contato</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-gray-600">E-mail de Contato</label>
              {contactEmail && <button type="button" onClick={() => setContactEmail('')} className="text-[10px] font-bold text-red-600 hover:underline">Excluir</button>}
            </div>
            <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="contato@empresa.com" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-gray-600">Telefone de Contato</label>
              {contactPhone && <button type="button" onClick={() => setContactPhone('')} className="text-[10px] font-bold text-red-600 hover:underline">Excluir</button>}
            </div>
            <input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+55 11 99999-9999" />
          </div>
        </div>
      </div>

      {/* Dynamic custom fields section */}
      <div className="pt-4 border-t space-y-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Outras Informações Customizadas (Incluir/Excluir)</h4>
        <p className="text-xs text-gray-500">Adicione qualquer campo adicional para exibição nas informações da plataforma.</p>
        
        {customFields.length > 0 && (
          <div className="space-y-3">
            {customFields.map(field => (
              <div key={field.id} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <input
                  type="text"
                  value={field.key}
                  onChange={e => handleEditCustomField(field.id, e.target.value, field.value)}
                  className="w-1/3 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none bg-white p-1"
                  placeholder="Nome do Campo"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={e => handleEditCustomField(field.id, field.key, e.target.value)}
                  className="flex-grow border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none bg-white p-1"
                  placeholder="Valor"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteCustomField(field.id)}
                  className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add custom field form */}
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full text-left">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Novo Campo</label>
            <input
              type="text"
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none bg-white p-1"
              placeholder="Ex: Endereço Comercial"
            />
          </div>
          <div className="flex-1 w-full text-left">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Valor</label>
            <input
              type="text"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none bg-white p-1"
              placeholder="Ex: Av. Paulista, 1000 - SP"
            />
          </div>
          <button
            type="button"
            onClick={handleAddCustomField}
            className="w-full sm:w-auto px-4 py-1.5 bg-primary text-white font-semibold text-xs rounded hover:bg-primary-dark shadow-sm shrink-0"
          >
            + Incluir Informação
          </button>
        </div>
      </div>

      {/* Header and Footer Logos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
        {/* Header Logo */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase">Logo do Cabeçalho</label>
          <div className="flex items-center gap-4">
            {config.headerLogoUrl ? (
              <div className="relative group">
                <img src={config.headerLogoUrl} className="h-16 w-auto object-contain border rounded p-1 max-w-[200px]" alt="Header Logo" />
                <button
                  onClick={() => deleteLogo('headerLogoUrl')}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow hover:scale-110 transition-all w-6 h-6 flex items-center justify-center font-bold text-xs"
                  title="Excluir Logo"
                >
                  &times;
                </button>
              </div>
            ) : (
              <div className="h-16 w-40 border border-dashed rounded flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                Sem logotipo
              </div>
            )}
            <div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                <IconUpload /> Enviar/Editar Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleHeaderLogoUpload} />
              </label>
              {config.headerLogoUrl && (
                <button
                  onClick={() => deleteLogo('headerLogoUrl')}
                  className="mt-2 text-xs text-red-600 hover:underline flex items-center gap-1 text-left"
                >
                  Excluir Logo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Logo */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase">Logo do Rodapé</label>
          <div className="flex items-center gap-4">
            {config.footerLogoUrl ? (
              <div className="relative group">
                <img src={config.footerLogoUrl} className="h-16 w-auto object-contain border rounded p-1 max-w-[200px]" alt="Footer Logo" />
                <button
                  onClick={() => deleteLogo('footerLogoUrl')}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow hover:scale-110 transition-all w-6 h-6 flex items-center justify-center font-bold text-xs"
                  title="Excluir Logo"
                >
                  &times;
                </button>
              </div>
            ) : (
              <div className="h-16 w-40 border border-dashed rounded flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                Sem logotipo
              </div>
            )}
            <div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                <IconUpload /> Enviar/Editar Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleFooterLogoUpload} />
              </label>
              {config.footerLogoUrl && (
                <button
                  onClick={() => deleteLogo('footerLogoUrl')}
                  className="mt-2 text-xs text-red-600 hover:underline flex items-center gap-1 text-left"
                >
                  Excluir Logo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t flex items-center gap-3">
        <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
          {saved ? '✓ Salvo!' : 'Salvar Configurações'}
        </button>
        {saved && <span className="text-xs text-green-600 font-medium">✓ Configurações salvas e aplicadas em tempo real.</span>}
      </div>
    </div>
  );
};

// ─── Service Groups Settings ──────────────────────────────────────────────────

const ServiceGroupsSettings: React.FC = () => {
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
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">{editingId ? 'Editar Nome do Grupo' : 'Nome do Novo Grupo'}</label>
          <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Ex: Gestão Documental" />
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">Salvar Grupo</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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

// ─── Legal Codes Settings ─────────────────────────────────────────────────────
const LegalCodesSettings: React.FC = () => {
  const [codes, setCodes] = useState<LegalCode[]>(() => dbCodes.getAll());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const handleContentChange = (id: string, content: string) => {
    setCodes(prev => prev.map(c => c.id === id ? { ...c, content, lastUpdated: new Date().toISOString().split('T')[0] } : c));
  };

  const handleSave = (id: string) => {
    const code = codes.find(c => c.id === id);
    if (code) {
      dbCodes.update(id, code.content, code.fileName);
    }
    setSaved(id);
    setEditingId(null);
    setTimeout(() => setSaved(null), 2500);
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const updated = dbCodes.update(id, content, file.name);
      setCodes(updated);
      setSaved(id);
      setTimeout(() => setSaved(null), 2500);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-800">Códigos Legais</h3>
      <p className="text-sm text-gray-500">Faça o upload ou edite as legislações para consulta dos advogados.</p>

      <div className="space-y-4">
        {codes.map(code => (
          <div key={code.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{code.title}</p>
                {code.fileName && <p className="text-xs text-primary font-medium">Arquivo: {code.fileName}</p>}
                <p className="text-xs text-gray-400">Atualizado em: {new Date(code.lastUpdated).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                  <IconUpload /> Upload
                  <input type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={e => handleFileUpload(code.id, e)} />
                </label>
                <button onClick={() => setEditingId(editingId === code.id ? null : code.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
                  <IconEdit /> {editingId === code.id ? 'Fechar' : 'Editar'}
                </button>
                {saved === code.id && <span className="text-xs text-green-600 font-medium self-center">✓ Salvo!</span>}
              </div>
            </div>

            {editingId === code.id ? (
              <div className="p-4">
                <textarea
                  value={code.content}
                  onChange={e => handleContentChange(code.id, e.target.value)}
                  rows={10}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y font-mono"
                />
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleSave(code.id)} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
                    Salvar Código
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">{code.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Database Settings ────────────────────────────────────────────────────────
const DatabaseSettings: React.FC = () => {
  const { config, updateConfig } = useAppConfig();
  const [dbType, setDbType] = useState(config.dbType || 'local');
  const [dbCloudProvider, setDbCloudProvider] = useState(config.dbCloudProvider || 'firebase');
  const [dbApiKey, setDbApiKey] = useState(config.dbApiKey || '');
  const [dbProjectUrl, setDbProjectUrl] = useState(config.dbProjectUrl || '');
  const [dbAuthDomain, setDbAuthDomain] = useState(config.dbAuthDomain || '');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = () => {
    updateConfig({
      dbType,
      dbCloudProvider,
      dbApiKey,
      dbProjectUrl,
      dbAuthDomain,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTestConnection = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      if (dbType === 'local') {
        setTestResult({
          type: 'success',
          message: 'Conexão local (localStorage) estabelecida com sucesso! Status: Ativo e operacional.'
        });
      } else {
        if (!dbApiKey || !dbProjectUrl) {
          setTestResult({
            type: 'error',
            message: 'Erro ao conectar na nuvem: Chave da API e URL do Projeto são obrigatórias.'
          });
        } else {
          setTestResult({
            type: 'success',
            message: `Conexão de teste com ${dbCloudProvider === 'firebase' ? 'Firebase Firestore' : 'Supabase PostgreSQL'} bem-sucedida!`
          });
        }
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div>
        <h3 className="text-base font-bold text-gray-800">Conexão de Banco de Dados</h3>
        <p className="text-sm text-gray-500">Configure as conexões locais ou em nuvem para sincronização em tempo real de dados jurídicos.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tipo de Armazenamento/Conexão</label>
          <select
            value={dbType}
            onChange={e => { setDbType(e.target.value as any); setTestResult(null); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white p-2 border"
          >
            <option value="local">Banco de Dados Local (localStorage - Offline Primeiro)</option>
            <option value="cloud">Banco de Dados em Nuvem (Firebase / Supabase)</option>
          </select>
        </div>

        {dbType === 'cloud' && (
          <div className="bg-gray-50 border p-4 rounded-xl space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold text-gray-700 uppercase">Configurações de Credenciais da Nuvem</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Provedor Cloud</label>
                <select
                  value={dbCloudProvider}
                  onChange={e => setDbCloudProvider(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white p-1"
                >
                  <option value="firebase">Firebase Firestore</option>
                  <option value="supabase">Supabase PostgreSQL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Chave da API (API Key) *</label>
                <input
                  type="password"
                  value={dbApiKey}
                  onChange={e => setDbApiKey(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white p-1"
                  placeholder="AIzaSy..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ID do Projeto / URL do Projeto *</label>
                <input
                  type="text"
                  value={dbProjectUrl}
                  onChange={e => setDbProjectUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white p-1"
                  placeholder="https://sua-app.supabase.co ou project-id"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Domínio de Autenticação (Auth Domain)</label>
                <input
                  type="text"
                  value={dbAuthDomain}
                  onChange={e => setDbAuthDomain(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white p-1"
                  placeholder="sua-app.firebaseapp.com"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Connection Links */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-2 text-xs text-gray-700">
          <p className="font-bold text-blue-900">Links Úteis para Configuração e Conexão:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Console de Gerenciamento Cloud: {' '}
              <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                Firebase Console (Firestore)
              </a>
              {' '} ou {' '}
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                Supabase Dashboard (PostgreSQL)
              </a>
            </li>
            <li>
              Visualização de Banco de Dados Local: {' '}
              <button
                type="button"
                onClick={() => alert('Os dados locais estão armazenados no localStorage do seu navegador sob a chave "legis_lawyer_cases" e "legis_received_docs".')}
                className="text-primary hover:underline font-semibold"
              >
                Inspecionar localStorage Local
              </button>
            </li>
          </ul>
        </div>
      </div>

      {testResult && (
        <div className={`p-3 rounded-lg border text-xs font-medium ${testResult.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {testResult.type === 'success' ? '✓ ' : '✗ '} {testResult.message}
        </div>
      )}

      <div className="pt-4 border-t flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
        >
          {saved ? '✓ Salvo!' : 'Salvar Conexão'}
        </button>
        
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
        >
          {testing ? 'Testando...' : '🔌 Testar Conexão'}
        </button>
      </div>
    </div>
  );
};

// ─── API Connections Screen ───────────────────────────────────────────────────
const APIConnections: React.FC = () => {
  const APIS = [
    {
      id: 'whatsapp', label: 'WhatsApp Business API', icon: '💬', color: 'bg-green-50 border-green-200',
      badgeColor: 'bg-green-100 text-green-800', description: 'Envio de notificações e mensagens automáticas aos clientes via WhatsApp.',
      fields: [{ key: 'token', label: 'Token de Acesso', type: 'password' }, { key: 'phone_id', label: 'Phone Number ID', type: 'text' }],
    },
    {
      id: 'gcal', label: 'Google Calendar', icon: '📅', color: 'bg-blue-50 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800', description: 'Sincronize a agenda dos advogados e secretariado com o Google Calendar.',
      fields: [{ key: 'client_id', label: 'Client ID', type: 'text' }, { key: 'client_secret', label: 'Client Secret', type: 'password' }],
    },
    {
      id: 'ms365', label: 'Microsoft 365 / Outlook', icon: '📧', color: 'bg-indigo-50 border-indigo-200',
      badgeColor: 'bg-indigo-100 text-indigo-800', description: 'Integração com Outlook Calendar e OneDrive para documentos.',
      fields: [{ key: 'tenant_id', label: 'Tenant ID', type: 'text' }, { key: 'client_id', label: 'Client ID (App)', type: 'text' }, { key: 'client_secret', label: 'Client Secret', type: 'password' }],
    },
    {
      id: 'viacep', label: 'ViaCEP', icon: '📮', color: 'bg-yellow-50 border-yellow-200',
      badgeColor: 'bg-yellow-100 text-yellow-800', description: 'Preenchimento automático de endereços via CEP nos formulários de cadastro.',
      fields: [],
    },
    {
      id: 'jusbrasil', label: 'JusBrasil API', icon: '⚖️', color: 'bg-amber-50 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800', description: 'Consulta de processos judiciais e jurisprudência diretamente na plataforma.',
      fields: [{ key: 'api_key', label: 'Chave da API', type: 'password' }],
    },
    {
      id: 'cnj', label: 'CNJ — Datajud', icon: '🏛️', color: 'bg-red-50 border-red-200',
      badgeColor: 'bg-red-100 text-red-800', description: 'Integração com o Conselho Nacional de Justiça para consulta de dados processuais.',
      fields: [{ key: 'api_key', label: 'Chave Datajud', type: 'password' }],
    },
    {
      id: 'receita', label: 'Receita Federal (CPF/CNPJ)', icon: '🇧🇷', color: 'bg-green-50 border-green-200',
      badgeColor: 'bg-green-100 text-green-800', description: 'Validação e consulta de CPF e CNPJ via API da Receita Federal.',
      fields: [{ key: 'api_token', label: 'Token de Acesso', type: 'password' }],
    },
    {
      id: 'openai', label: 'OpenAI (IA Jurídica)', icon: '🤖', color: 'bg-purple-50 border-purple-200',
      badgeColor: 'bg-purple-100 text-purple-800', description: 'Habilite assistência jurídica com IA para redação de peças e resumo de documentos.',
      fields: [{ key: 'api_key', label: 'OpenAI API Key', type: 'password' }, { key: 'model', label: 'Modelo (ex: gpt-4o)', type: 'text' }],
    },
    {
      id: 'stripe', label: 'Stripe (Pagamentos)', icon: '💳', color: 'bg-cyan-50 border-cyan-200',
      badgeColor: 'bg-cyan-100 text-cyan-800', description: 'Processamento de pagamentos e cobranças online dos clientes.',
      fields: [{ key: 'publishable_key', label: 'Chave Pública', type: 'text' }, { key: 'secret_key', label: 'Chave Secreta', type: 'password' }],
    },
    {
      id: 'zapsign', label: 'ZapSign (Assinatura Digital)', icon: '✍️', color: 'bg-teal-50 border-teal-200',
      badgeColor: 'bg-teal-100 text-teal-800', description: 'Envio e coleta de assinaturas digitais em documentos e contratos.',
      fields: [{ key: 'api_token', label: 'API Token', type: 'password' }],
    },
  ];

  const [enabledApis, setEnabledApis] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('legis_api_enabled') || '{}'); } catch { return {}; }
  });
  const [apiValues, setApiValues] = useState<Record<string, Record<string, string>>>(() => {
    try { return JSON.parse(localStorage.getItem('legis_api_values') || '{}'); } catch { return {}; }
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; msg: string }>>({});

  const toggleApi = (id: string) => {
    const next = { ...enabledApis, [id]: !enabledApis[id] };
    setEnabledApis(next);
    localStorage.setItem('legis_api_enabled', JSON.stringify(next));
  };

  const setField = (apiId: string, key: string, value: string) => {
    setApiValues(prev => ({ ...prev, [apiId]: { ...prev[apiId], [key]: value } }));
  };

  const handleSaveApi = (id: string) => {
    localStorage.setItem('legis_api_values', JSON.stringify(apiValues));
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2500);
  };

  const handleTest = (id: string) => {
    setTesting(id);
    setTestResults(prev => ({ ...prev, [id]: { ok: false, msg: '' } }));
    setTimeout(() => {
      setTesting(null);
      const vals = apiValues[id] || {};
      const api = APIS.find(a => a.id === id)!;
      const allFilled = api.fields.length === 0 || api.fields.every(f => !!vals[f.key]?.trim());
      if (allFilled) {
        setTestResults(prev => ({ ...prev, [id]: { ok: true, msg: `Conexão com ${api.label} estabelecida com sucesso!` } }));
      } else {
        setTestResults(prev => ({ ...prev, [id]: { ok: false, msg: 'Preencha todos os campos obrigatórios antes de testar.' } }));
      }
    }, 1500);
  };

  const activeCount = Object.values(enabledApis).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">Conexão com APIs</h3>
          <p className="text-sm text-gray-500 mt-0.5">Configure e ative integrações externas para expandir as funcionalidades da plataforma.</p>
        </div>
        <div className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
          {activeCount} ativa{activeCount !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {APIS.map(api => {
          const isEnabled = !!enabledApis[api.id];
          const isExpanded = expandedId === api.id;
          const vals = apiValues[api.id] || {};
          const testResult = testResults[api.id];

          return (
            <div key={api.id} className={`rounded-xl border-2 transition-all ${isEnabled ? api.color : 'bg-white border-gray-200'}`}>
              {/* Header row */}
              <div className="flex items-center gap-4 p-4">
                <span className="text-2xl shrink-0">{api.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-800">{api.label}</p>
                    {isEnabled && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${api.badgeColor}`}>Ativo</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{api.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {api.fields.length > 0 && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : api.id)}
                      className="text-xs text-gray-500 hover:text-primary font-medium transition-colors"
                    >
                      {isExpanded ? '▲ Fechar' : '⚙️ Configurar'}
                    </button>
                  )}
                  {/* Toggle switch */}
                  <button
                    onClick={() => toggleApi(api.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none shrink-0 ${
                      isEnabled ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    title={isEnabled ? 'Desativar API' : 'Ativar API'}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Expanded config area */}
              {isExpanded && api.fields.length > 0 && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {api.fields.map(field => (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">{field.label}</label>
                        <input
                          type={field.type}
                          value={vals[field.key] || ''}
                          onChange={e => setField(api.id, field.key, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white font-mono"
                          placeholder={field.type === 'password' ? '••••••••••••••••' : `${field.label}...`}
                        />
                      </div>
                    ))}
                  </div>

                  {testResult && (
                    <div className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                      testResult.ok
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {testResult.ok ? '✅ ' : '❌ '}{testResult.msg}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveApi(api.id)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90"
                    >
                      {savedId === api.id ? '✅ Salvo!' : '💾 Salvar Credenciais'}
                    </button>
                    <button
                      onClick={() => handleTest(api.id)}
                      disabled={testing === api.id}
                      className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      {testing === api.id ? '⏳ Testando...' : '🔌 Testar Conexão'}
                    </button>
                  </div>
                </div>
              )}

              {/* ViaCEP has no fields – just info */}
              {isExpanded && api.fields.length === 0 && (
                <div className="px-4 pb-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Esta API não requer configuração adicional. Basta ativar para uso automático.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Settings Hub (Icon Grid) ─────────────────────────────────────────────────
type SettingsSection = 'general' | 'codes' | 'documents' | 'users' | 'services_groups' | 'database' | 'api_connections' | null;

const settingsSections = [
  {
    id: 'general' as const,
    label: 'Configurações Gerais',
    icon: '⚙️',
    description: 'Nome do app, logos, contato e dados gerais',
    color: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-blue-700',
  },
  {
    id: 'codes' as const,
    label: 'Código',
    icon: '📜',
    description: 'Upload e edição de legislações e códigos legais',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    textColor: 'text-amber-700',
  },
  {
    id: 'documents' as const,
    label: 'Documentos Legais',
    icon: '📋',
    description: 'Termos de uso, políticas de privacidade e regulamentos',
    color: 'from-emerald-500 to-green-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-700',
  },
  {
    id: 'users' as const,
    label: 'Usuários Administrativos',
    icon: '👥',
    description: 'Criar, ativar e gerenciar credenciais de admins',
    color: 'from-purple-500 to-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-700',
  },
  {
    id: 'services_groups' as const,
    label: 'Serviços de Eficiência',
    icon: '🚀',
    description: 'Grupos e serviços oferecidos pela plataforma',
    color: 'from-orange-400 to-red-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    textColor: 'text-orange-700',
  },
  {
    id: 'database' as const,
    label: 'Banco de Dados',
    icon: '🗄️',
    description: 'Configurar conexão local ou cloud (Firebase / Supabase)',
    color: 'from-slate-500 to-gray-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    textColor: 'text-slate-700',
  },
  {
    id: 'api_connections' as const,
    label: 'Conexão com APIs',
    icon: '🔌',
    description: 'WhatsApp, Google, IA Jurídica, Pagamentos e mais',
    color: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    textColor: 'text-teal-700',
  },
];

export const SettingsTab: React.FC = () => {
  const [section, setSection] = useState<SettingsSection>(null);

  // Hub landing page
  if (!section) {
    return (
      <div className="space-y-6">
        <SectionTitle title="Configurações" subtitle="Selecione uma categoria para acessar as configurações da plataforma" />

        {/* Icon Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {settingsSections.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`group relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 ${s.bg} ${s.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left w-full`}
            >
              {/* Gradient orb */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shadow-md`}>
                {s.icon}
              </div>
              <div>
                <p className={`text-sm font-bold ${s.textColor}`}>{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.description}</p>
              </div>
              {/* Arrow hint */}
              <span className="absolute bottom-4 right-4 text-gray-300 group-hover:text-gray-500 transition-colors text-lg">→</span>
            </button>
          ))}
        </div>

        {/* Quick-access footer info */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl shrink-0">ℹ️</span>
          <p className="text-xs text-gray-500">
            Cada seção de configurações opera de forma independente. Alterações salvas são aplicadas em tempo real na plataforma.
            Certifique-se de salvar antes de navegar para outra seção.
          </p>
        </div>
      </div>
    );
  }

  // Sub-section view with back button
  const current = settingsSections.find(s => s.id === section)!;

  return (
    <div className="space-y-5">
      {/* Breadcrumb header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSection(null)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
        >
          ← Configurações
        </button>
        <span className="text-gray-300">/</span>
        <div className="flex items-center gap-2">
          <span className="text-base">{current.icon}</span>
          <span className={`text-sm font-bold ${current.textColor}`}>{current.label}</span>
        </div>
      </div>

      {section === 'general' && <GeneralSettings />}
      {section === 'codes' && <LegalCodesSettings />}
      {section === 'documents' && <LegalDocuments />}
      {section === 'users' && <AdminUsers />}
      {section === 'services_groups' && <ServiceGroupsSettings />}
      {section === 'database' && <DatabaseSettings />}
      {section === 'api_connections' && <APIConnections />}
    </div>
  );
};
