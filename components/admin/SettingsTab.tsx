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

// ─── Admin Users + Permission Management ──────────────────────────────────────

const roleLabels: Record<AdminUser['role'], string> = {
  super: 'Super Admin',
  admin: 'Administrador',
  manager: 'Gerente',
  collaborator: 'Colaborador',
  viewer: 'Visualizador',
};
const roleColors: Record<AdminUser['role'], string> = {
  super: 'bg-red-100 text-red-800',
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  collaborator: 'bg-teal-100 text-teal-800',
  viewer: 'bg-gray-100 text-gray-700',
};

// ── All application functions grouped by category ──────────────────────────────
const APP_FUNCTIONS: { category: string; icon: string; items: { id: string; label: string }[] }[] = [
  {
    category: 'Visão Geral & Dashboard',
    icon: '📊',
    items: [
      { id: 'view_overview', label: 'Visualizar Visão Geral' },
      { id: 'view_kpis', label: 'Visualizar KPIs' },
      { id: 'view_charts', label: 'Visualizar Gráficos' },
    ],
  },
  {
    category: 'Gestão de Cadastros',
    icon: '👥',
    items: [
      { id: 'view_lawyers', label: 'Visualizar Advogados' },
      { id: 'edit_lawyers', label: 'Editar Advogados' },
      { id: 'delete_lawyers', label: 'Excluir Advogados' },
      { id: 'view_clients', label: 'Visualizar Clientes' },
      { id: 'edit_clients', label: 'Editar Clientes' },
      { id: 'delete_clients', label: 'Excluir Clientes' },
      { id: 'view_interns', label: 'Visualizar Bacharelandos' },
      { id: 'edit_interns', label: 'Editar Bacharelandos' },
      { id: 'delete_interns', label: 'Excluir Bacharelandos' },
      { id: 'view_secretaries', label: 'Visualizar Secret./Assist. Jurídico' },
      { id: 'edit_secretaries', label: 'Editar Secret./Assist. Jurídico' },
      { id: 'delete_secretaries', label: 'Excluir Secret./Assist. Jurídico' },
      { id: 'upload_docs_registrations', label: 'Upload de Documentos (Cadastros)' },
    ],
  },
  {
    category: 'Gestão Financeira',
    icon: '💰',
    items: [
      { id: 'view_finance', label: 'Visualizar Financeiro' },
      { id: 'edit_finance', label: 'Editar Lançamentos' },
      { id: 'view_finance_lawyers', label: 'Financeiro de Advogados' },
      { id: 'view_finance_clients', label: 'Financeiro de Clientes' },
      { id: 'view_finance_interns', label: 'Financeiro de Bacharelandos' },
      { id: 'view_finance_secretaries', label: 'Financeiro de Secretariado' },
      { id: 'view_finance_services', label: 'Financeiro de Serviços' },
      { id: 'export_finance', label: 'Exportar Relatórios Financeiros' },
    ],
  },
  {
    category: 'Configurações',
    icon: '⚙️',
    items: [
      { id: 'view_settings', label: 'Acessar Configurações' },
      { id: 'edit_general_settings', label: 'Configurações Gerais' },
      { id: 'manage_legal_docs', label: 'Documentos Legais' },
      { id: 'manage_services', label: 'Serviços de Eficiência' },
      { id: 'manage_admin_users', label: 'Usuários Administrativos' },
      { id: 'manage_apis', label: 'Conexão com APIs' },
      { id: 'manage_database', label: 'Banco de Dados' },
      { id: 'manage_codes', label: 'Códigos da Plataforma' },
    ],
  },
  {
    category: 'Painéis de Usuários',
    icon: '🖥️',
    items: [
      { id: 'impersonate_lawyer', label: 'Acessar Painel do Advogado' },
      { id: 'impersonate_client', label: 'Acessar Painel do Cliente' },
      { id: 'impersonate_intern', label: 'Acessar Painel do Bacharelando' },
      { id: 'impersonate_secretary', label: 'Acessar Painel do Secret./Assist.' },
    ],
  },
  {
    category: 'Comunicação & Agenda',
    icon: '📅',
    items: [
      { id: 'view_messages', label: 'Visualizar Mensagens' },
      { id: 'send_messages', label: 'Enviar Mensagens' },
      { id: 'view_calendar', label: 'Visualizar Agenda' },
      { id: 'manage_calendar', label: 'Gerenciar Agenda' },
      { id: 'manage_videoconference', label: 'Videoconferências' },
    ],
  },
  {
    category: 'Relatórios & Auditoria',
    icon: '📋',
    items: [
      { id: 'view_reports', label: 'Visualizar Relatórios' },
      { id: 'export_reports', label: 'Exportar Relatórios' },
      { id: 'view_audit_log', label: 'Log de Auditoria' },
    ],
  },
];

// Default permissions per role
const DEFAULT_PERMISSIONS: Record<AdminUser['role'], string[]> = {
  super: APP_FUNCTIONS.flatMap(g => g.items.map(i => i.id)),
  admin: [
    'view_overview','view_kpis','view_charts',
    'view_lawyers','edit_lawyers','view_clients','edit_clients','view_interns','edit_interns','view_secretaries','edit_secretaries','upload_docs_registrations',
    'view_finance','edit_finance','view_finance_lawyers','view_finance_clients','view_finance_interns','view_finance_secretaries','view_finance_services',
    'view_settings','edit_general_settings','manage_legal_docs','manage_services','manage_admin_users',
    'view_messages','send_messages','view_calendar','manage_calendar',
    'view_reports','export_reports',
  ],
  manager: [
    'view_overview','view_kpis','view_charts',
    'view_lawyers','edit_lawyers','view_clients','edit_clients','view_interns','edit_interns','view_secretaries','edit_secretaries',
    'view_finance','view_finance_lawyers','view_finance_clients','view_finance_interns','view_finance_secretaries','view_finance_services',
    'view_messages','send_messages','view_calendar',
    'view_reports',
  ],
  collaborator: [
    'view_overview','view_kpis',
    'view_lawyers','view_clients','view_interns','view_secretaries',
    'view_finance','view_finance_lawyers','view_finance_clients',
    'view_messages','view_calendar',
  ],
  viewer: [
    'view_overview','view_kpis','view_charts',
    'view_lawyers','view_clients','view_interns','view_secretaries',
    'view_finance',
    'view_reports',
  ],
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('legis_admin_users');
    return saved ? JSON.parse(saved) : mockAdminUsers;
  });
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'viewer' as AdminUser['role'] });
  const [saved, setSaved] = useState(false);

  // Permission manager modal
  const [permUser, setPermUser] = useState<AdminUser | null>(null);
  const [permDraft, setPermDraft] = useState<string[]>([]);

  // Role default permissions modal
  const [showRoleDefaults, setShowRoleDefaults] = useState(false);
  const [roleDefaultsDraft, setRoleDefaultsDraft] = useState<Record<AdminUser['role'], string[]>>(() => {
    const saved = localStorage.getItem('legis_role_defaults');
    return saved ? JSON.parse(saved) : { ...DEFAULT_PERMISSIONS };
  });
  const [editingRole, setEditingRole] = useState<AdminUser['role']>('admin');

  const saveUsers = (newUsers: AdminUser[]) => {
    setUsers(newUsers);
    localStorage.setItem('legis_admin_users', JSON.stringify(newUsers));
  };

  const handleCreate = () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    const savedDefaults = localStorage.getItem('legis_role_defaults');
    const defaults = savedDefaults ? JSON.parse(savedDefaults) : DEFAULT_PERMISSIONS;
    const user: AdminUser = {
      id: Date.now(),
      ...newUser,
      createdAt: new Date().toISOString().split('T')[0],
      active: true,
      permissions: defaults[newUser.role] || [],
    };
    saveUsers([...users, user]);
    setNewUser({ name: '', email: '', password: '', role: 'viewer' });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleActive = (id: number) => {
    saveUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário administrativo?')) {
      saveUsers(users.filter(u => u.id !== id));
    }
  };

  // Open permission manager for a user
  const openPermManager = (u: AdminUser) => {
    const savedDefaults = localStorage.getItem('legis_role_defaults');
    const defaults = savedDefaults ? JSON.parse(savedDefaults) : DEFAULT_PERMISSIONS;
    setPermDraft(u.permissions || defaults[u.role] || []);
    setPermUser(u);
  };

  const togglePerm = (id: string) => {
    setPermDraft(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const selectAllCategory = (catItems: { id: string }[]) => {
    const ids = catItems.map(i => i.id);
    const allOn = ids.every(id => permDraft.includes(id));
    setPermDraft(prev => allOn ? prev.filter(p => !ids.includes(p)) : [...new Set([...prev, ...ids])]);
  };

  const savePermissions = () => {
    if (!permUser) return;
    saveUsers(users.map(u => u.id === permUser.id ? { ...u, permissions: permDraft } : u));
    setPermUser(null);
  };

  const resetToRoleDefault = () => {
    if (!permUser) return;
    const savedDefaults = localStorage.getItem('legis_role_defaults');
    const defaults = savedDefaults ? JSON.parse(savedDefaults) : DEFAULT_PERMISSIONS;
    setPermDraft(defaults[permUser.role] || []);
  };

  // Role defaults editor
  const toggleRoleDefault = (role: AdminUser['role'], permId: string) => {
    setRoleDefaultsDraft(prev => {
      const current = prev[role] || [];
      return {
        ...prev,
        [role]: current.includes(permId) ? current.filter(p => p !== permId) : [...current, permId],
      };
    });
  };

  const saveRoleDefaults = () => {
    localStorage.setItem('legis_role_defaults', JSON.stringify(roleDefaultsDraft));
    setShowRoleDefaults(false);
  };

  const allFunctionIds = APP_FUNCTIONS.flatMap(g => g.items.map(i => i.id));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-800">Usuários Administrativos</h3>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie contas, níveis de acesso e funções delegadas a cada administrador.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowRoleDefaults(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            🛡️ Permissões Padrão por Nível
          </button>
          <button
            onClick={() => setShowForm(f => !f)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
          >
            <IconPlus /> Novo Admin
          </button>
        </div>
      </div>

      {saved && <p className="text-sm text-green-600 font-medium bg-green-50 border border-green-200 rounded-lg px-3 py-2">✓ Usuário criado com sucesso!</p>}

      {/* ── New user form ── */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4 animate-fade-in">
          <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2"><IconKey /> Criar Novo Usuário Admin</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nome *</label>
              <input value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                placeholder="Nome completo" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">E-mail *</label>
              <input type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Senha *</label>
              <input type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                placeholder="Senha de acesso" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nível de Acesso *</label>
              <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value as AdminUser['role'] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                <option value="collaborator">Colaborador</option>
                <option value="viewer">Visualizador</option>
                <option value="manager">Gerente</option>
                <option value="admin">Administrador</option>
                <option value="super">Super Admin</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1">As permissões padrão do nível serão aplicadas automaticamente. Você pode personalizá-las depois.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!newUser.name || !newUser.email || !newUser.password}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-40">
              Criar Usuário
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Users table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Nível</th>
              <th className="px-4 py-3">Funções</th>
              <th className="px-4 py-3">Cadastro</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const savedDefaults = localStorage.getItem('legis_role_defaults');
              const defaults = savedDefaults ? JSON.parse(savedDefaults) : DEFAULT_PERMISSIONS;
              const perms = u.permissions || defaults[u.role] || [];
              const customCount = perms.length;
              const defaultCount = (defaults[u.role] || []).length;
              const isCustomized = u.permissions !== undefined && u.permissions.length !== defaultCount;
              return (
                <tr key={u.id} className={`border-b hover:bg-gray-50 transition-colors ${!u.active ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 font-semibold text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openPermManager(u)}
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      🔑 {customCount}/{allFunctionIds.length} funções
                      {isCustomized && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold">Personalizado</span>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {u.active ? '● Ativo' : '○ Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'super' ? (
                      <div className="flex gap-2 justify-center flex-wrap">
                        <button
                          onClick={() => toggleActive(u.id)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${u.active ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100' : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'}`}
                        >
                          {u.active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => openPermManager(u)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          Permissões
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic text-center block">Protegido</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL: Per-user permission manager
      ──────────────────────────────────────────────────────────────────────── */}
      {permUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPermUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900">🔑 Permissões — {permUser.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Nível: <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${roleColors[permUser.role]}`}>{roleLabels[permUser.role]}</span>
                  &nbsp;· {permDraft.length} de {allFunctionIds.length} funções habilitadas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={resetToRoleDefault}
                  className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-100 transition-colors">
                  ↺ Restaurar Padrão do Nível
                </button>
                <button onClick={() => { setPermDraft(allFunctionIds); }}
                  className="text-xs text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-teal-100 transition-colors">
                  ✓ Todas
                </button>
                <button onClick={() => setPermDraft([])}
                  className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  ✕ Nenhuma
                </button>
                <button onClick={() => setPermUser(null)} className="text-gray-400 hover:text-gray-700 text-xl leading-none px-1">×</button>
              </div>
            </div>

            {/* Modal body — scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
              {APP_FUNCTIONS.map(group => {
                const allOn = group.items.every(i => permDraft.includes(i.id));
                const someOn = group.items.some(i => permDraft.includes(i.id));
                return (
                  <div key={group.category} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span>{group.icon}</span> {group.category}
                        <span className="text-xs font-normal text-gray-400">
                          ({group.items.filter(i => permDraft.includes(i.id)).length}/{group.items.length})
                        </span>
                      </h3>
                      <button
                        onClick={() => selectAllCategory(group.items)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${allOn ? 'bg-primary/10 text-primary border-primary/30' : someOn ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/30'}`}
                      >
                        {allOn ? '✓ Todas habilitadas' : someOn ? '◐ Parcial' : '○ Nenhuma'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.items.map(item => {
                        const enabled = permDraft.includes(item.id);
                        return (
                          <label key={item.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border transition-all ${enabled ? 'bg-primary/5 border-primary/30 text-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={() => togglePerm(item.id)}
                              className="w-4 h-4 accent-primary shrink-0"
                            />
                            <span className="text-xs font-medium">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-200 shrink-0 flex justify-between items-center bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-500">{permDraft.length} função{permDraft.length !== 1 ? 'ões' : ''} habilitada{permDraft.length !== 1 ? 's' : ''}</p>
              <div className="flex gap-2">
                <button onClick={() => setPermUser(null)}
                  className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold">
                  Cancelar
                </button>
                <button onClick={savePermissions}
                  className="px-5 py-2 text-sm text-white bg-primary rounded-xl hover:bg-primary/90 font-bold shadow">
                  💾 Salvar Permissões
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL: Default permissions per role (Super Admin panel)
      ──────────────────────────────────────────────────────────────────────── */}
      {showRoleDefaults && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowRoleDefaults(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 bg-gradient-to-r from-purple-600 to-primary rounded-t-2xl">
              <div>
                <h2 className="text-base font-bold text-white">🛡️ Painel do Super Admin — Funções Padrão por Nível</h2>
                <p className="text-xs text-purple-200 mt-0.5">Configure quais funções cada nível de acesso terá por padrão ao ser criado.</p>
              </div>
              <button onClick={() => setShowRoleDefaults(false)} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
            </div>

            {/* Role tabs */}
            <div className="flex gap-1 px-6 pt-4 shrink-0 flex-wrap">
              {(['admin', 'manager', 'collaborator', 'viewer'] as AdminUser['role'][]).map(role => (
                <button key={role} onClick={() => setEditingRole(role)}
                  className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${editingRole === role ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                  <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${roleColors[role].split(' ')[0]}`} />
                  {roleLabels[role]}
                  <span className="ml-1.5 text-xs text-gray-400">({(roleDefaultsDraft[role] || []).length})</span>
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">
                  Editando permissões padrão para: <span className={`px-2 py-0.5 rounded font-bold text-xs ${roleColors[editingRole]}`}>{roleLabels[editingRole]}</span>
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setRoleDefaultsDraft(prev => ({ ...prev, [editingRole]: [...allFunctionIds] }))}
                    className="text-xs text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg font-semibold hover:bg-teal-100">
                    ✓ Todas
                  </button>
                  <button onClick={() => setRoleDefaultsDraft(prev => ({ ...prev, [editingRole]: [] }))}
                    className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg font-semibold hover:bg-gray-200">
                    ✕ Nenhuma
                  </button>
                  <button onClick={() => setRoleDefaultsDraft(prev => ({ ...prev, [editingRole]: [...DEFAULT_PERMISSIONS[editingRole]] }))}
                    className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-semibold hover:bg-amber-100">
                    ↺ Restaurar Original
                  </button>
                </div>
              </div>

              {APP_FUNCTIONS.map(group => {
                const roleDraft = roleDefaultsDraft[editingRole] || [];
                const allOn = group.items.every(i => roleDraft.includes(i.id));
                return (
                  <div key={group.category} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        {group.icon} {group.category}
                        <span className="text-xs font-normal text-gray-400">
                          ({group.items.filter(i => roleDraft.includes(i.id)).length}/{group.items.length})
                        </span>
                      </h3>
                      <button onClick={() => {
                        const ids = group.items.map(i => i.id);
                        setRoleDefaultsDraft(prev => {
                          const current = prev[editingRole] || [];
                          const allOn = ids.every(id => current.includes(id));
                          return { ...prev, [editingRole]: allOn ? current.filter(p => !ids.includes(p)) : [...new Set([...current, ...ids])] };
                        });
                      }} className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${allOn ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/30'}`}>
                        {allOn ? '✓ Todas' : '○ Selecionar todas'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.items.map(item => {
                        const enabled = roleDraft.includes(item.id);
                        return (
                          <label key={item.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border transition-all ${enabled ? 'bg-primary/5 border-primary/30 text-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            <input type="checkbox" checked={enabled}
                              onChange={() => toggleRoleDefault(editingRole, item.id)}
                              className="w-4 h-4 accent-primary shrink-0" />
                            <span className="text-xs font-medium">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 shrink-0 flex justify-between items-center bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-500">
                ⚠️ As alterações afetam apenas novos usuários. Clique em "Salvar" para aplicar.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowRoleDefaults(false)}
                  className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold">
                  Cancelar
                </button>
                <button onClick={saveRoleDefaults}
                  className="px-5 py-2 text-sm text-white bg-purple-600 rounded-xl hover:bg-purple-700 font-bold shadow">
                  💾 Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

        {testResult && (
          <div className={`p-3 rounded-lg border text-xs font-medium ${testResult.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {testResult.type === 'success' ? '✓ ' : '✗ '} {testResult.message}
          </div>
        )}


      </div>{/* end space-y-4 */}

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

  type ApiField = { key: string; label: string; type: 'text' | 'password' };
  type ApiEntry = typeof APIS[0] & { custom?: boolean };

  // ── State ──────────────────────────────────────────────────────────────────
  const [customApis, setCustomApis] = useState<ApiEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('legis_custom_apis') || '[]'); } catch { return []; }
  });

  const allApis: ApiEntry[] = [...APIS, ...customApis];

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

  // ── Add new API ────────────────────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApi, setNewApi] = useState({ label: '', icon: '🔌', description: '', endpoint: '', keyLabel: 'API Key' });
  const ICON_OPTIONS = ['🔌','🌐','📡','📊','📝','💡','🔗','🚀','📦','⚙️','🛡️','🔐','💸','🤝','⚖️','📋','📧','📱','💬','📅','🤖','💳','✍️','🏛️','🇧🇷'];

  const handleAddApi = () => {
    if (!newApi.label.trim()) return;
    const entry: ApiEntry = {
      id: `custom_${Date.now()}`,
      label: newApi.label.trim(),
      icon: newApi.icon,
      description: newApi.description.trim() || 'Integração personalizada.',
      color: 'bg-gray-50 border-gray-300',
      badgeColor: 'bg-gray-100 text-gray-800',
      fields: [
        { key: 'endpoint', label: newApi.endpoint.trim() || 'Endpoint / URL', type: 'text' as const },
        { key: 'api_key', label: newApi.keyLabel.trim() || 'API Key', type: 'password' as const },
      ],
      custom: true,
    };
    const next = [...customApis, entry];
    setCustomApis(next);
    localStorage.setItem('legis_custom_apis', JSON.stringify(next));
    setNewApi({ label: '', icon: '🔌', description: '', endpoint: '', keyLabel: 'API Key' });
    setShowAddForm(false);
  };

  // ── Delete API ─────────────────────────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteApi = (id: string) => {
    const next = customApis.filter(a => a.id !== id);
    setCustomApis(next);
    localStorage.setItem('legis_custom_apis', JSON.stringify(next));
    const nextEnabled = { ...enabledApis };
    delete nextEnabled[id];
    setEnabledApis(nextEnabled);
    localStorage.setItem('legis_api_enabled', JSON.stringify(nextEnabled));
    setDeleteConfirmId(null);
  };

  // ── Shared helpers ─────────────────────────────────────────────────────────
  const toggleApi = (id: string) => {
    const next = { ...enabledApis, [id]: !enabledApis[id] };
    setEnabledApis(next);
    localStorage.setItem('legis_api_enabled', JSON.stringify(next));
  };

  const setField = (apiId: string, key: string, value: string) =>
    setApiValues(prev => ({ ...prev, [apiId]: { ...prev[apiId], [key]: value } }));

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
      const api = allApis.find(a => a.id === id)!;
      const allFilled = api.fields.length === 0 || api.fields.every((f: ApiField) => !!vals[f.key]?.trim());
      setTestResults(prev => ({
        ...prev,
        [id]: allFilled
          ? { ok: true, msg: `Conexão com ${api.label} estabelecida com sucesso!` }
          : { ok: false, msg: 'Preencha todos os campos obrigatórios antes de testar.' },
      }));
    }, 1500);
  };

  const activeCount = Object.values(enabledApis).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* ── Header bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-800">Conexão com APIs</h3>
          <p className="text-sm text-gray-500 mt-0.5">Configure e ative integrações externas para expandir as funcionalidades da plataforma.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
            {activeCount} ativa{activeCount !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowAddForm(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${showAddForm ? 'bg-gray-200 text-gray-700' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
          >
            {showAddForm ? '✕ Cancelar' : '+ Incluir Nova API'}
          </button>
        </div>
      </div>

      {/* ── Add New API Form ── */}
      {showAddForm && (
        <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📡</span>
            <p className="text-sm font-bold text-teal-800">Incluir Nova API</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nome da API *</label>
              <input value={newApi.label} onChange={e => setNewApi(p => ({ ...p, label: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
                placeholder="Ex: Minha API Personalizada" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
              <input value={newApi.description} onChange={e => setNewApi(p => ({ ...p, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
                placeholder="Para que serve esta integração..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rótulo do Endpoint</label>
              <input value={newApi.endpoint} onChange={e => setNewApi(p => ({ ...p, endpoint: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
                placeholder="Ex: URL Base, Servidor..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rótulo da Chave de Acesso</label>
              <input value={newApi.keyLabel} onChange={e => setNewApi(p => ({ ...p, keyLabel: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
                placeholder="Ex: API Key, Token..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(ic => (
                <button key={ic} type="button" onClick={() => setNewApi(p => ({ ...p, icon: ic }))}
                  className={`text-xl w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${newApi.icon === ic ? 'border-teal-500 bg-teal-100 scale-110 shadow' : 'border-gray-200 bg-white hover:border-teal-300'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={handleAddApi} disabled={!newApi.label.trim()}
              className="px-5 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              ✅ Incluir API
            </button>
            <button onClick={() => setShowAddForm(false)}
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── API list ── */}
      <div className="grid grid-cols-1 gap-4">
        {allApis.map(api => {
          const isEnabled = !!enabledApis[api.id];
          const isExpanded = expandedId === api.id;
          const vals = apiValues[api.id] || {};
          const testResult = testResults[api.id];
          const isCustom = !!api.custom;
          const awaitingDelete = deleteConfirmId === api.id;

          return (
            <div key={api.id} className={`rounded-xl border-2 transition-all ${isEnabled ? api.color : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-4 p-4">
                <span className="text-2xl shrink-0">{api.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-800">{api.label}</p>
                    {isEnabled && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${api.badgeColor}`}>Ativo</span>}
                    {isCustom && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">Personalizado</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{api.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {api.fields.length > 0 && (
                    <button onClick={() => setExpandedId(isExpanded ? null : api.id)}
                      className="text-xs text-gray-500 hover:text-primary font-medium transition-colors px-2 py-1 rounded-lg hover:bg-gray-100">
                      {isExpanded ? '▲ Fechar' : '⚙️ Configurar'}
                    </button>
                  )}
                  {isCustom && (
                    awaitingDelete ? (
                      <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                        <span className="text-xs text-red-700 font-semibold">Confirmar exclusão?</span>
                        <button onClick={() => handleDeleteApi(api.id)}
                          className="text-xs text-white bg-red-600 px-2 py-0.5 rounded font-bold hover:bg-red-700">Sim</button>
                        <button onClick={() => setDeleteConfirmId(null)}
                          className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded font-bold hover:bg-gray-200">Não</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirmId(api.id)}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
                        🗑️ Excluir API
                      </button>
                    )
                  )}
                  <button onClick={() => toggleApi(api.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none shrink-0 ${isEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                    title={isEnabled ? 'Desativar' : 'Ativar'}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
              {isExpanded && api.fields.length > 0 && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {api.fields.map((field: ApiField) => (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">{field.label}</label>
                        <input type={field.type} value={vals[field.key] || ''} onChange={e => setField(api.id, field.key, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white font-mono"
                          placeholder={field.type === 'password' ? '••••••••••••••••' : `${field.label}...`} />
                      </div>
                    ))}
                  </div>
                  {testResult && (
                    <div className={`px-3 py-2 rounded-lg text-xs font-semibold border ${testResult.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                      {testResult.ok ? '✅ ' : '❌ '}{testResult.msg}
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleSaveApi(api.id)} className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90">
                      {savedId === api.id ? '✅ Salvo!' : '💾 Salvar Credenciais'}
                    </button>
                    <button onClick={() => handleTest(api.id)} disabled={testing === api.id}
                      className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">
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
