import React, { useState } from 'react';
import { mockLegalDocuments, mockAdminUsers } from '../../services/mockDataService';
import type { LegalDocument, AdminUser } from '../../services/mockDataService';
import { SectionTitle, IconEdit, IconPlus, IconKey, IconUpload, IconTrash } from './AdminShared';

// ─── Legal Documents ──────────────────────────────────────────────────────────
const LegalDocuments: React.FC = () => {
  const [docs, setDocs] = useState<LegalDocument[]>(mockLegalDocuments);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const handleContentChange = (id: string, content: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, content, lastUpdated: new Date().toISOString().split('T')[0] } : d));
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
      setDocs(prev => prev.map(d => d.id === id ? { ...d, content: `[Arquivo: ${file.name}]\n${content.substring(0, 500)}...`, lastUpdated: new Date().toISOString().split('T')[0] } : d));
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-800">Documentos Legais</h3>
      <p className="text-sm text-gray-500">Edite o conteúdo ou envie arquivos para cada documento.</p>

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
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'viewer' as AdminUser['role'] });
  const [saved, setSaved] = useState(false);

  const handleCreate = () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    const user: AdminUser = { id: Date.now(), ...newUser, createdAt: new Date().toISOString().split('T')[0], active: true };
    setUsers(prev => [...prev, user]);
    setNewUser({ name: '', email: '', password: '', role: 'viewer' });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleActive = (id: number) => setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));

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
              <input value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Nome completo" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
              <input type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Senha</label>
              <input type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Senha de acesso" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nível de Acesso</label>
              <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value as AdminUser['role'] }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
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
                    <button onClick={() => toggleActive(u.id)} className={`text-xs font-medium hover:underline ${u.active ? 'text-red-600' : 'text-green-600'}`}>
                      {u.active ? 'Desativar' : 'Reativar'}
                    </button>
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
  const [siteName, setSiteName] = useState('Legis Connect');
  const [siteTagline, setSiteTagline] = useState('A solução para seus problemas jurídicos.');
  const [footerText, setFooterText] = useState('© 2025 Legis Connect. Todos os direitos reservados.');
  const [saved, setSaved] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <h3 className="text-base font-bold text-gray-800">Configurações Gerais</h3>
      {[{ label: 'Nome do site', value: siteName, set: setSiteName }, { label: 'Slogan principal', value: siteTagline, set: setSiteTagline }, { label: 'Texto do rodapé', value: footerText, set: setFooterText }].map(f => (
        <div key={f.label}>
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{f.label}</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={f.value} onChange={e => f.set(e.target.value)} />
        </div>
      ))}
      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }} className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
        {saved ? '✓ Salvo!' : 'Salvar Configurações'}
      </button>
    </div>
  );
};

// ─── Service Groups Settings ──────────────────────────────────────────────────
import { mockEfficiencyServiceGroups } from '../../services/mockDataService';
import type { EfficiencyServiceGroup } from '../../types';

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

// ─── Main SettingsTab ─────────────────────────────────────────────────────────
type SettingsSection = 'general' | 'documents' | 'users' | 'services_groups';

export const SettingsTab: React.FC = () => {
  const [section, setSection] = useState<SettingsSection>('general');

  const sections = [
    { id: 'general' as const, label: 'Configurações Gerais' },
    { id: 'documents' as const, label: 'Documentos Legais' },
    { id: 'users' as const, label: 'Usuários Administrativos' },
    { id: 'services_groups' as const, label: 'Serviços de Eficiência' },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle title="Configurações" subtitle="Gerencie configurações gerais, documentos e acessos administrativos" />

      <div className="flex gap-2 border-b">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${section === s.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {section === 'general' && <GeneralSettings />}
      {section === 'documents' && <LegalDocuments />}
      {section === 'users' && <AdminUsers />}
      {section === 'services_groups' && <ServiceGroupsSettings />}
    </div>
  );
};
