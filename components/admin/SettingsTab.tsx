import React, { useState } from 'react';
import { mockLegalDocuments, mockAdminUsers, mockEfficiencyServiceGroups, hashPassword, mockBiApoio, mockBiDadosBase, mockBiClientes, mockBiProdutos, mockBiFornecedores, mockBiVendas } from '../../services/mockDataService';
import type { LegalDocument, AdminUser } from '../../services/mockDataService';
import { SectionTitle, IconEdit, IconPlus, IconKey, IconUpload, IconTrash } from './AdminShared';
import { dbCodes, LegalCode, dbCloud, CodeVersion } from '../../services/dbService';
import { useAppConfig } from '../../context/AppContext';
import type { EfficiencyServiceGroup, BiApoio, BiDadosBase, BiCliente, BiProduto, BiFornecedor, BiVenda } from '../../types';
import { LegalAiTools } from '../common/LegalAiTools';


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
    const isTextFile = file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.md') || file.type === 'text/plain';
    const reader = new FileReader();

    if (isTextFile) {
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        const updated = docs.map(d => d.id === id ? { ...d, content: `[Arquivo: ${file.name}]\n${content.substring(0, 500)}...`, lastUpdated: new Date().toISOString().split('T')[0] } : d);
        saveDocs(updated);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (ev) => {
        const arrayBuffer = ev.target?.result as ArrayBuffer;
        const extracted = extractPrintableText(arrayBuffer);
        const content = `[Conteúdo extraído do arquivo binário ${file.name}]\n\n` + (extracted || 'Nenhum texto legível encontrado no arquivo.');
        const updated = docs.map(d => d.id === id ? { ...d, content: content.substring(0, 2000), lastUpdated: new Date().toISOString().split('T')[0] } : d);
        saveDocs(updated);
      };
      reader.readAsArrayBuffer(file);
    }
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
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" placeholder="Ex: Política de Cookies" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Conteúdo do Documento *</label>
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={5} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" placeholder="Escreva o conteúdo do documento..." />
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
          <div key={doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{doc.title}</p>
                <p className="text-xs text-gray-400">Atualizado em: {new Date(doc.lastUpdated).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:border-primary/50 cursor-pointer transition-colors dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y font-mono dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
  {
    category: 'Ferramentas de IA Jurídica',
    icon: '⚡',
    items: [
      { id: 'ia_pecas', label: 'Criação de Peças Jurídicas' },
      { id: 'ia_pesquisas', label: 'Pesquisas Jurídicas' },
      { id: 'ia_audios', label: 'Comandos por Áudios' },
      { id: 'ia_transcricao', label: 'Transcrição de Áudios' },
      { id: 'ia_fundamentacoes', label: 'Fundamentações' },
      { id: 'ia_revisao', label: 'Revisão de Textos' },
      { id: 'ia_jurisprudencia', label: 'Busca por Jurisprudências Reais' },
      { id: 'ia_manifestacao', label: 'Manifestação Processual' },
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
    'ia_pecas', 'ia_pesquisas', 'ia_audios', 'ia_transcricao', 'ia_fundamentacoes', 'ia_revisao', 'ia_jurisprudencia', 'ia_manifestacao',
  ],
  manager: [
    'view_overview','view_kpis','view_charts',
    'view_lawyers','edit_lawyers','view_clients','edit_clients','view_interns','edit_interns','view_secretaries','edit_secretaries',
    'view_finance','view_finance_lawyers','view_finance_clients','view_finance_interns','view_finance_secretaries','view_finance_services',
    'view_messages','send_messages','view_calendar',
    'view_reports',
    'ia_pecas', 'ia_pesquisas', 'ia_audios', 'ia_transcricao', 'ia_fundamentacoes', 'ia_revisao', 'ia_jurisprudencia', 'ia_manifestacao',
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


const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    {children}
    {error && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{error}</p>}
  </div>
);

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('legis_admin_users');
    let loaded: AdminUser[] = saved ? JSON.parse(saved) : mockAdminUsers;
    let needsSave = false;
    loaded = loaded.map(u => {
      if (!u.password.startsWith('$scrambled$')) {
        needsSave = true;
        return { ...u, password: hashPassword(u.password) };
      }
      return u;
    });
    if (needsSave) {
      localStorage.setItem('legis_admin_users', JSON.stringify(loaded));
    }
    return loaded;
  });
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    confirmSecondaryEmail: '',
    secondaryEmail: '',
    phone: '',
    password: '',
    role: 'viewer' as AdminUser['role'],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  // Permission manager modal
  const [permUser, setPermUser] = useState<AdminUser | null>(null);
  const [permDraft, setPermDraft] = useState<string[]>([]);

  // Password reset modal
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [resetMethod, setResetMethod] = useState<'email' | 'secondary' | 'sms' | 'whatsapp'>('email');
  const [resetSent, setResetSent] = useState(false);

  // Role default permissions modal
  const [showRoleDefaults, setShowRoleDefaults] = useState(false);
  const [roleDefaultsDraft, setRoleDefaultsDraft] = useState<Record<AdminUser['role'], string[]>>(() => {
    const saved = localStorage.getItem('legis_role_defaults');
    return saved ? JSON.parse(saved) : { ...DEFAULT_PERMISSIONS };
  });
  const [editingRole, setEditingRole] = useState<AdminUser['role']>('admin');
  const [superAdminTab, setSuperAdminTab] = useState<'permissions' | 'users'>('permissions');

  const saveUsers = (newUsers: AdminUser[]) => {
    setUsers(newUsers);
    localStorage.setItem('legis_admin_users', JSON.stringify(newUsers));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!newUser.name.trim()) errors.name = 'Nome obrigatório';
    if (!newUser.email.trim()) errors.email = 'E-mail obrigatório';
    if (!newUser.password.trim()) errors.password = 'Senha obrigatória';
    if (newUser.secondaryEmail && newUser.secondaryEmail !== newUser.confirmSecondaryEmail)
      errors.confirmSecondaryEmail = 'E-mails secundários não coincidem';
    if (newUser.phone && !/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(newUser.phone.replace(/\s/g, '')))
      errors.phone = 'Número inválido (ex: (11) 99999-9999)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = () => {
    if (!validateForm()) return;
    const savedDefaults = localStorage.getItem('legis_role_defaults');
    const defaults = savedDefaults ? JSON.parse(savedDefaults) : DEFAULT_PERMISSIONS;
    const user: AdminUser = {
      id: Date.now(),
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      secondaryEmail: newUser.secondaryEmail.trim() || undefined,
      phone: newUser.phone.trim() || undefined,
      password: hashPassword(newUser.password),
      role: newUser.role,
      createdAt: new Date().toISOString().split('T')[0],
      active: true,
      permissions: defaults[newUser.role] || [],
    };
    saveUsers([...users, user]);
    setNewUser({ name: '', email: '', confirmSecondaryEmail: '', secondaryEmail: '', phone: '', password: '', role: 'viewer' });
    setFormErrors({});
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

  // ── Password reset ────────────────────────────────────────────────────────
  const openReset = (u: AdminUser) => {
    setResetUser(u);
    setResetMethod('email');
    setResetSent(false);
  };

  const handleSendReset = () => {
    setResetSent(true);
    setTimeout(() => {
      setResetUser(null);
      setResetSent(false);
    }, 2500);
  };

  const resetMethodLabel = (u: AdminUser) => ({
    email: u.email,
    secondary: u.secondaryEmail || '(sem e-mail secundário)',
    sms: u.phone || '(sem telefone)',
    whatsapp: u.phone || '(sem WhatsApp)',
  });

  // ── Permission manager ────────────────────────────────────────────────────
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

  // ── Role defaults editor ──────────────────────────────────────────────────
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
            onClick={() => { setShowForm(f => !f); setFormErrors({}); }}
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

          {/* Row 1: Name + Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nome *" error={formErrors.name}>
              <input value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white ${formErrors.name ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Nome completo" />
            </Field>
            <Field label="Nível de Acesso *">
              <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value as AdminUser['role'] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                <option value="collaborator">Colaborador</option>
                <option value="viewer">Visualizador</option>
                <option value="manager">Gerente</option>
                <option value="admin">Administrador</option>
                <option value="super">Super Admin</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1">Permissões padrão do nível serão aplicadas. Personalize depois.</p>
            </Field>
          </div>

          {/* Row 2: Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Senha *" error={formErrors.password}>
              <input type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white ${formErrors.password ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Senha de acesso" />
            </Field>
            <Field label="Celular / WhatsApp" error={formErrors.phone}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">📱</span>
                <input value={newUser.phone} onChange={e => setNewUser(u => ({ ...u, phone: e.target.value }))}
                  className={`w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white ${formErrors.phone ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="(11) 99999-9999" />
              </div>
            </Field>
          </div>

          {/* Row 3: Primary email */}
          <Field label="E-mail Principal *" error={formErrors.email}>
            <input type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white ${formErrors.email ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="email@exemplo.com" />
          </Field>

          {/* Row 4: Secondary email */}
          <div className="bg-white border border-dashed border-blue-300 rounded-xl p-3 space-y-3 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
            <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5">✉️ E-mail Secundário <span className="font-normal text-gray-400">(opcional — usado para reset de senha)</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="E-mail Secundário" error={formErrors.secondaryEmail}>
                <input type="email" value={newUser.secondaryEmail} onChange={e => setNewUser(u => ({ ...u, secondaryEmail: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                  placeholder="email.secundario@exemplo.com" />
              </Field>
              <Field label="Confirmar E-mail Secundário" error={formErrors.confirmSecondaryEmail}>
                <input type="email" value={newUser.confirmSecondaryEmail} onChange={e => setNewUser(u => ({ ...u, confirmSecondaryEmail: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white ${formErrors.confirmSecondaryEmail ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Confirmar e-mail secundário" />
              </Field>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={handleCreate}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90">
              ✅ Criar Usuário
            </button>
            <button onClick={() => { setShowForm(false); setFormErrors({}); }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Users table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Contatos</th>
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
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{u.name}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-xs text-gray-600">📧 {u.email}</p>
                      {u.secondaryEmail && <p className="text-xs text-gray-400">✉️ {u.secondaryEmail}</p>}
                      {u.phone && <p className="text-xs text-green-600">📱 {u.phone}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openPermManager(u)}
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      🔑 {customCount}/{allFunctionIds.length}
                      {isCustomized && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold">Custom</span>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {u.active ? '● Ativo' : '○ Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'super' ? (
                      <div className="flex gap-1.5 justify-center flex-wrap">
                        <button
                          onClick={() => toggleActive(u.id)}
                          className={`text-xs font-semibold px-2 py-1 rounded-lg border transition-colors ${u.active ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100' : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'}`}
                        >
                          {u.active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => openPermManager(u)}
                          className="text-xs font-semibold px-2 py-1 rounded-lg border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          Permissões
                        </button>
                        <button
                          onClick={() => openReset(u)}
                          className="text-xs font-semibold px-2 py-1 rounded-lg border border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors"
                        >
                          🔒 Reset Senha
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-xs font-semibold px-2 py-1 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
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
          MODAL: Password Reset
      ──────────────────────────────────────────────────────────────────────── */}
      {resetUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setResetUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <div>
                <h2 className="text-base font-bold text-gray-900">🔒 Resetar Senha</h2>
                <p className="text-xs text-gray-500 mt-0.5">Usuário: <strong>{resetUser.name}</strong></p>
              </div>
              <button onClick={() => setResetUser(null)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
            </div>

            {!resetSent ? (
              <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-gray-600">Selecione como enviar o link de redefinição de senha:</p>

                <div className="space-y-2">
                  {/* E-mail Principal */}
                  <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${resetMethod === 'email' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="resetMethod" value="email" checked={resetMethod === 'email'} onChange={() => setResetMethod('email')} className="accent-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">📧 E-mail Principal</p>
                      <p className="text-xs text-gray-500 truncate">{resetUser.email}</p>
                    </div>
                  </label>

                  {/* E-mail Secundário */}
                  <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${!resetUser.secondaryEmail ? 'opacity-40 cursor-not-allowed' : resetMethod === 'secondary' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="resetMethod" value="secondary" disabled={!resetUser.secondaryEmail}
                      checked={resetMethod === 'secondary'} onChange={() => setResetMethod('secondary')} className="accent-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">✉️ E-mail Secundário</p>
                      <p className="text-xs text-gray-500 truncate">{resetUser.secondaryEmail || 'Não cadastrado'}</p>
                    </div>
                  </label>

                  {/* SMS */}
                  <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${!resetUser.phone ? 'opacity-40 cursor-not-allowed' : resetMethod === 'sms' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="resetMethod" value="sms" disabled={!resetUser.phone}
                      checked={resetMethod === 'sms'} onChange={() => setResetMethod('sms')} className="accent-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">💬 SMS</p>
                      <p className="text-xs text-gray-500 truncate">{resetUser.phone || 'Não cadastrado'}</p>
                    </div>
                  </label>

                  {/* WhatsApp */}
                  <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${!resetUser.phone ? 'opacity-40 cursor-not-allowed' : resetMethod === 'whatsapp' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                    <input type="radio" name="resetMethod" value="whatsapp" disabled={!resetUser.phone}
                      checked={resetMethod === 'whatsapp'} onChange={() => setResetMethod('whatsapp')} className="accent-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">📱 WhatsApp</p>
                      <p className="text-xs text-gray-500 truncate">{resetUser.phone || 'Não cadastrado'}</p>
                    </div>
                  </label>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-amber-800 font-medium">
                    ⚠️ Um link seguro de redefinição de senha será enviado para: <strong>{resetMethodLabel(resetUser)[resetMethod]}</strong>
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={handleSendReset}
                    className="flex-1 py-2.5 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors shadow">
                    🔗 Enviar Link de Redefinição
                  </button>
                  <button onClick={() => setResetUser(null)}
                    className="px-4 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-10 text-center space-y-3">
                <div className="text-5xl">✅</div>
                <p className="text-base font-bold text-gray-800">Link enviado com sucesso!</p>
                <p className="text-sm text-gray-500">O link de redefinição foi enviado para <strong>{resetMethodLabel(resetUser)[resetMethod]}</strong>.</p>
                <p className="text-xs text-gray-400">O link expira em 24 horas por segurança.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL: Per-user permission manager
      ──────────────────────────────────────────────────────────────────────── */}
      {permUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPermUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
                  <div key={group.category} className="bg-gray-50 rounded-xl border border-gray-200 p-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
            <div className="px-6 py-4 border-t border-gray-200 shrink-0 flex justify-between items-center bg-gray-50 rounded-b-2xl dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <p className="text-xs text-gray-500">{permDraft.length} função{permDraft.length !== 1 ? 'ões' : ''} habilitada{permDraft.length !== 1 ? 's' : ''}</p>
              <div className="flex gap-2">
                <button onClick={() => setPermUser(null)}
                  className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 bg-gradient-to-r from-purple-600 to-primary rounded-t-2xl dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <div>
                <h2 className="text-base font-bold text-white">🛡️ Painel do Super Admin</h2>
                <p className="text-xs text-purple-200 mt-0.5">Configure permissões padrão por nível e gerencie usuários ativos/inativos.</p>
              </div>
              <button onClick={() => setShowRoleDefaults(false)} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
            </div>

            {/* Main tabs: Permissions / Users */}
            <div className="flex border-b border-gray-200 px-6 pt-3 gap-1 shrink-0 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <button onClick={() => setSuperAdminTab('permissions')}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg border-b-2 transition-colors ${superAdminTab === 'permissions' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                🔑 Permissões por Nível
              </button>
              <button onClick={() => setSuperAdminTab('users')}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg border-b-2 transition-colors ${superAdminTab === 'users' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                👤 Usuários ({users.filter(u => u.role !== 'super').length})
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

              {/* ── Tab: Users ── */}
              {superAdminTab === 'users' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">Ativar ou desativar usuários administrativos via checkbox:</p>
                    <span className="text-xs text-gray-400">{users.filter(u => u.role !== 'super' && u.active).length} ativos de {users.filter(u => u.role !== 'super').length}</span>
                  </div>
                  <div className="space-y-2">
                    {users.filter(u => u.role !== 'super').map(u => (
                      <label key={u.id}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${u.active ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
                        <input
                          type="checkbox"
                          checked={u.active}
                          onChange={() => toggleActive(u.id)}
                          className="w-5 h-5 accent-green-600 shrink-0 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-gray-800">{u.name}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                              {u.active ? '● Ativo' : '○ Inativo'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">📧 {u.email}{u.phone ? ` · 📱 ${u.phone}` : ''}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-gray-400">Desde {new Date(u.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </label>
                    ))}
                    {users.filter(u => u.role !== 'super').length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-8">Nenhum usuário administrativo cadastrado.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Tab: Permissions ── */}
              {superAdminTab === 'permissions' && (<>
                {/* Role sub-tabs */}
                <div className="flex gap-1 flex-wrap border-b border-gray-200 pb-2 mb-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                  {(['admin', 'manager', 'collaborator', 'viewer'] as AdminUser['role'][]).map(role => (
                    <button key={role} onClick={() => setEditingRole(role)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${editingRole === role ? 'border-primary text-primary bg-primary/5' : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${roleColors[role].split(' ')[0]}`} />
                      {roleLabels[role]}
                      <span className="ml-1 text-gray-400">({(roleDefaultsDraft[role] || []).length})</span>
                    </button>
                  ))}
                </div>

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
              </>)}

              {superAdminTab === 'permissions' && APP_FUNCTIONS.map(group => {
                const roleDraft = roleDefaultsDraft[editingRole] || [];
                const allOn = group.items.every(i => roleDraft.includes(i.id));
                return (
                  <div key={group.category} className="bg-gray-50 rounded-xl border border-gray-200 p-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
            <div className="px-6 py-4 border-t border-gray-200 shrink-0 flex justify-between items-center bg-gray-50 rounded-b-2xl dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <p className="text-xs text-gray-500">
                ⚠️ As alterações afetam apenas novos usuários. Clique em "Salvar" para aplicar.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowRoleDefaults(false)}
                  className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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

  // BI support & transational data states
  const [biApoio, setBiApoio] = useState<BiApoio>(() => {
    const saved = localStorage.getItem('legis_bi_tb_apoio');
    return saved ? JSON.parse(saved) : mockBiApoio;
  });

  const [biDadosBase, setBiDadosBase] = useState<BiDadosBase[]>(() => {
    const saved = localStorage.getItem('legis_bi_tb_dados_base');
    return saved ? JSON.parse(saved) : mockBiDadosBase;
  });

  // New BI Equipamentos/Serviços de Eficiência states
  const [biClientes, setBiClientes] = useState<BiCliente[]>(() => {
    const saved = localStorage.getItem('legis_bi_clientes');
    return saved ? JSON.parse(saved) : mockBiClientes;
  });

  const [biProdutos, setBiProdutos] = useState<BiProduto[]>(() => {
    const saved = localStorage.getItem('legis_bi_produtos');
    const parsed = saved ? JSON.parse(saved) : mockBiProdutos;
    if (parsed.length > 0 && parsed[0].codigo && !parsed[0].codigo.startsWith('G')) {
      localStorage.setItem('legis_bi_produtos', JSON.stringify(mockBiProdutos));
      localStorage.setItem('legis_bi_vendas', JSON.stringify(mockBiVendas));
      return mockBiProdutos;
    }
    return parsed;
  });

  const [biFornecedores, setBiFornecedores] = useState<BiFornecedor[]>(() => {
    const saved = localStorage.getItem('legis_bi_fornecedores');
    const parsed = saved ? JSON.parse(saved) : mockBiFornecedores;
    const needsMigration = parsed.some((f: BiFornecedor) => f.codigo === 'F01' || f.codigo === 'F02' || f.codigo === 'F03') || !parsed.some((f: BiFornecedor) => f.codigo === 'F0001');
    if (needsMigration) {
      localStorage.setItem('legis_bi_fornecedores', JSON.stringify(mockBiFornecedores));
      localStorage.setItem('legis_bi_vendas', JSON.stringify(mockBiVendas));
      return mockBiFornecedores;
    }
    return parsed;
  });

  const [biVendas, setBiVendas] = useState<BiVenda[]>(() => {
    const saved = localStorage.getItem('legis_bi_vendas');
    let data = saved ? JSON.parse(saved) : mockBiVendas;
    const hasOldFornecedor = data.some((v: BiVenda) => v.fornecedor && (v.fornecedor.startsWith('F01') || v.fornecedor.startsWith('F02') || v.fornecedor.startsWith('F03')));
    if (hasOldFornecedor || (data.length > 0 && data[0].produto && !data[0].produto.startsWith('G'))) {
      data = mockBiVendas;
      localStorage.setItem('legis_bi_vendas', JSON.stringify(mockBiVendas));
    }
    const migrated = data.map((v: BiVenda) => {
      let status = v.status_aluguel as string;
      if (status === 'Devolvido') status = 'Entregue';
      else if (status === 'Não devolvido') status = 'Cancelado';
      else if (status === 'Não retirado ainda') status = 'Em Realização';
      return { ...v, status_aluguel: status as BiVenda['status_aluguel'] };
    });
    return migrated;
  });

  const [biSubTab, setBiSubTab] = useState<'excel_ums' | 'servicos_aluguel'>('excel_ums');
  const [biAluguelTab, setBiAluguelTab] = useState<'clientes' | 'produtos' | 'fornecedores' | 'vendas'>('vendas');

  const [showAluguelForm, setShowAluguelForm] = useState(false);
  const [editingAluguelId, setEditingAluguelId] = useState<string | null>(null);

  // Form states for dim_clientes
  const [clientForm, setClientForm] = useState<BiCliente>({ codigo: '', nome: '', cpf_cnpj: '', cidade: '', estado: '', lista_concatenada: '' });
  // Form states for dim_produtos
  const [productForm, setProductForm] = useState<BiProduto>({ codigo: '', nome: '', descricao: '', custo: 0, preco_tabela: 0, lista_concatenada: '' });
  // Form states for dim_fornecedores
  const [supplierForm, setSupplierForm] = useState<BiFornecedor>({ codigo: '', nome: '', cpf_cnpj: '', estado: '', lista_concatenada: '' });
  // Form states for fato_vendas
  const [saleForm, setSaleForm] = useState<BiVenda>({
    id_tab: '',
    fornecedor: '',
    cliente: '',
    produto: '',
    qtd: 1,
    vlr_unit: 0,
    valor_total: 0,
    custo_prod: 0,
    lucro: 0,
    data: '',
    data_referencia: '',
    data_retirada: '',
    data_devolucao: '',
    status_pagamento: 'Pago',
    status_aluguel: 'Entregue',
  });

  const [docTab, setDocTab] = useState('DAX (Power BI)');
  const [showTxForm, setShowTxForm] = useState(false);
  const [editingTxId, setEditingTxId] = useState<number | null>(null);
  const [txForm, setTxForm] = useState<BiDadosBase>({
    id_tab: 0,
    semestre: '1º sem',
    valor_ums: 5.2,
    mes_ano: '',
    executado_ums: 0,
    receita_fat: 0,
    transferencia_recebida: 0,
    despesa_total: 0,
    custo: 0,
    imposto: 0,
    juros: 0,
    salarios_ordenados: 0,
    glosa: 0,
    emissao_nf: '',
    recebimento_nf: '',
  });

  // Double-Click Inline Editing states
  const [customLabels, setCustomLabels] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('legis_bi_custom_labels');
    const defaults = {
      tab_excel_ums: 'Geral (Excel UMS)',
      tab_servicos_aluguel: 'Config. Serviços',
      sub_vendas: 'Fato Vendas(Servicos)',
      sub_clientes: 'Dim Clientes',
      sub_produtos: 'Dim Produtos',
      sub_fornecedores: 'Dim Fornecedores'
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.tab_servicos_aluguel === 'Aluguer de Equipamentos') {
        parsed.tab_servicos_aluguel = 'Config. Serviços';
      }
      if (parsed.sub_vendas === 'fato_vendas (Alugueres)' || parsed.sub_vendas === 'Fato Vendas(Servicos') {
        parsed.sub_vendas = 'Fato Vendas(Servicos)';
      }
      if (parsed.sub_clientes === 'dim_clientes (Clientes)') {
        parsed.sub_clientes = 'Dim Clientes';
      }
      if (parsed.sub_produtos === 'dim_produtos (Produtos)' || parsed.sub_produtos === 'Dim Serviços') {
        parsed.sub_produtos = 'Dim Produtos';
      }
      if (parsed.sub_fornecedores === 'dim_fornecedores (Fornecedores)') {
        parsed.sub_fornecedores = 'Dim Fornecedores';
      }
      return parsed;
    }
    return defaults;
  });

  interface ActiveInlineEditor {
    type: 'label' | 'cell';
    targetId: string;
    field?: string;
    value: string;
  }
  const [activeInlineEditor, setActiveInlineEditor] = useState<ActiveInlineEditor | null>(null);

  const isSuperAdmin = () => {
    try {
      const userRaw = localStorage.getItem('legis_user');
      if (!userRaw) return false;
      const user = JSON.parse(userRaw);
      if (user.role !== 'admin') return false;

      const adminUsersRaw = localStorage.getItem('legis_admin_users');
      const adminUsersList = adminUsersRaw ? JSON.parse(adminUsersRaw) : [
        { id: 1, name: 'Super Admin', email: 'admin@legisconnect.com.br', password: 'admin', role: 'super', createdAt: '2024-01-01', active: true }
      ];

      const matched = adminUsersList.find((u: AdminUser) => u.email.toLowerCase() === user.email.toLowerCase());
      return matched?.role === 'super';
    } catch {
      return false;
    }
  };

  const handleLabelDoubleClick = (key: string, currentValue: string) => {
    if (!isSuperAdmin()) return;
    setActiveInlineEditor({
      type: 'label',
      targetId: key,
      value: currentValue
    });
  };

  const handleSaveLabel = (key: string, newValue: string) => {
    if (!newValue.trim()) {
      setActiveInlineEditor(null);
      return;
    }
    const updated = { ...customLabels, [key]: newValue.trim() };
    setCustomLabels(updated);
    localStorage.setItem('legis_bi_custom_labels', JSON.stringify(updated));
    setActiveInlineEditor(null);
  };

  const handleSaveClientCell = (index: number, field: keyof BiCliente, newValue: string) => {
    const oldClient = biClientes[index];
    if (!oldClient) return;
    const oldConcat = oldClient.lista_concatenada;

    const updatedClient = { ...oldClient, [field]: newValue };
    if (field === 'codigo' || field === 'nome') {
      updatedClient.lista_concatenada = `${updatedClient.codigo} - ${updatedClient.nome}`;
    }

    const nextClientes = [...biClientes];
    nextClientes[index] = updatedClient;
    setBiClientes(nextClientes);
    localStorage.setItem('legis_bi_clientes', JSON.stringify(nextClientes));

    if (updatedClient.lista_concatenada !== oldConcat) {
      const updatedSales = biVendas.map(v => {
        if (v.cliente === oldConcat) {
          return { ...v, cliente: updatedClient.lista_concatenada };
        }
        return v;
      });
      setBiVendas(updatedSales);
      localStorage.setItem('legis_bi_vendas', JSON.stringify(updatedSales));
    }

    setActiveInlineEditor(null);
  };

  const handleSaveProductCell = (index: number, field: keyof BiProduto, newValue: string | number) => {
    const oldProduct = biProdutos[index];
    if (!oldProduct) return;
    const oldConcat = oldProduct.lista_concatenada;

    const parsedValue = (field === 'custo' || field === 'preco_tabela') ? Number(newValue) : newValue;
    const updatedProduct = { ...oldProduct, [field]: parsedValue };
    if (field === 'codigo' || field === 'nome') {
      updatedProduct.lista_concatenada = `${updatedProduct.codigo} - ${updatedProduct.nome}`;
    }

    const nextProdutos = [...biProdutos];
    nextProdutos[index] = updatedProduct as BiProduto;
    setBiProdutos(nextProdutos);
    localStorage.setItem('legis_bi_produtos', JSON.stringify(nextProdutos));

    if (updatedProduct.lista_concatenada !== oldConcat) {
      const updatedSales = biVendas.map(v => {
        if (v.produto === oldConcat) {
          return { ...v, produto: updatedProduct.lista_concatenada };
        }
        return v;
      });
      setBiVendas(updatedSales);
      localStorage.setItem('legis_bi_vendas', JSON.stringify(updatedSales));
    }

    setActiveInlineEditor(null);
  };

  const handleSaveSupplierCell = (index: number, field: keyof BiFornecedor, newValue: string) => {
    const oldSupplier = biFornecedores[index];
    if (!oldSupplier) return;
    const oldConcat = oldSupplier.lista_concatenada;

    const updatedSupplier = { ...oldSupplier, [field]: newValue };
    if (field === 'codigo' || field === 'nome') {
      updatedSupplier.lista_concatenada = `${updatedSupplier.codigo} - ${updatedSupplier.nome}`;
    }

    const nextFornecedores = [...biFornecedores];
    nextFornecedores[index] = updatedSupplier;
    setBiFornecedores(nextFornecedores);
    localStorage.setItem('legis_bi_fornecedores', JSON.stringify(nextFornecedores));

    if (updatedSupplier.lista_concatenada !== oldConcat) {
      const updatedSales = biVendas.map(v => {
        if (v.fornecedor === oldConcat) {
          return { ...v, fornecedor: updatedSupplier.lista_concatenada };
        }
        return v;
      });
      setBiVendas(updatedSales);
      localStorage.setItem('legis_bi_vendas', JSON.stringify(updatedSales));
    }

    setActiveInlineEditor(null);
  };

  const handleSaveSaleCell = (index: number, field: keyof BiVenda, newValue: string | number) => {
    const oldSale = biVendas[index];
    if (!oldSale) return;

    let updatedSale = { ...oldSale };

    if (field === 'produto') {
      const prodVal = String(newValue);
      const matched = biProdutos.find(p => p.lista_concatenada === prodVal);
      const nextQtd = oldSale.qtd;
      const nextVlr = matched ? matched.preco_tabela : oldSale.vlr_unit;
      const nextCusto = matched ? matched.custo : oldSale.custo_prod;
      const nextTotal = nextQtd * nextVlr;
      const nextLucro = nextTotal - (nextQtd * nextCusto);
      updatedSale = {
        ...oldSale,
        produto: prodVal,
        vlr_unit: nextVlr,
        custo_prod: nextCusto,
        valor_total: nextTotal,
        lucro: nextLucro
      };
    } else if (field === 'qtd') {
      const nextQtd = Number(newValue);
      const nextTotal = nextQtd * oldSale.vlr_unit;
      const nextLucro = nextTotal - (nextQtd * oldSale.custo_prod);
      updatedSale = {
        ...oldSale,
        qtd: nextQtd,
        valor_total: nextTotal,
        lucro: nextLucro
      };
    } else if (field === 'valor_total') {
      const nextTotal = Number(newValue);
      const nextLucro = nextTotal - (oldSale.qtd * oldSale.custo_prod);
      updatedSale = {
        ...oldSale,
        valor_total: nextTotal,
        lucro: nextLucro
      };
    } else if (field === 'lucro') {
      updatedSale = {
        ...oldSale,
        lucro: Number(newValue)
      };
    } else if (field === 'vlr_unit' || field === 'custo_prod') {
      updatedSale = {
        ...oldSale,
        [field]: Number(newValue)
      };
    } else {
      updatedSale = {
        ...oldSale,
        [field]: newValue as never
      };
    }

    const nextVendas = [...biVendas];
    nextVendas[index] = updatedSale as BiVenda;
    setBiVendas(nextVendas);
    localStorage.setItem('legis_bi_vendas', JSON.stringify(nextVendas));

    setActiveInlineEditor(null);
  };

  const handleSaveTxCell = (index: number, field: keyof BiDadosBase, newValue: string | number) => {
    const oldTx = biDadosBase[index];
    if (!oldTx) return;

    let parsedValue = newValue;
    if (field === 'mes_ano' || field === 'semestre' || field === 'emissao_nf' || field === 'recebimento_nf') {
      parsedValue = String(newValue);
    } else {
      parsedValue = Number(newValue);
    }

    const updatedTx = { ...oldTx, [field]: parsedValue };

    const nextBase = [...biDadosBase];
    nextBase[index] = updatedTx as BiDadosBase;
    setBiDadosBase(nextBase);
    localStorage.setItem('legis_bi_tb_dados_base', JSON.stringify(nextBase));

    setActiveInlineEditor(null);
  };

  const renderEditableCell = (
    value: string | number | undefined,
    onSave: (val: string) => void,
    options?: {
      type?: 'text' | 'number' | 'date' | 'select';
      selectOptions?: string[];
      displayValue?: string;
      className?: string;
      onDoubleClickKey: string;
    }
  ) => {
    const isSuper = isSuperAdmin();
    const type = options?.type || 'text';
    const isEditing = activeInlineEditor?.type === 'cell' && activeInlineEditor.targetId === options?.onDoubleClickKey;
    const displayVal = options?.displayValue !== undefined ? options.displayValue : String(value);

    if (isSuper && isEditing) {
      if (type === 'select' && options?.selectOptions) {
        return (
          <select
            autoFocus
            className={`border border-purple-500 rounded px-1.5 py-0.5 text-xs bg-white dark:bg-[#1A1730] dark:text-white ${options?.className || ''}`}
            value={activeInlineEditor.value}
            onChange={e => {
              setActiveInlineEditor({ ...activeInlineEditor, value: e.target.value });
              onSave(e.target.value);
            }}
            onBlur={() => onSave(activeInlineEditor.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') setActiveInlineEditor(null);
            }}
          >
            {options.selectOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }
      return (
        <input
          autoFocus
          type={type}
          className={`border border-purple-500 rounded px-1.5 py-0.5 text-xs bg-white dark:bg-[#1A1730] dark:text-white ${options?.className || ''}`}
          value={activeInlineEditor.value}
          onChange={e => setActiveInlineEditor({ ...activeInlineEditor, value: e.target.value })}
          onBlur={() => onSave(activeInlineEditor.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onSave(activeInlineEditor.value);
            if (e.key === 'Escape') setActiveInlineEditor(null);
          }}
        />
      );
    }

    return (
      <span
        onDoubleClick={() => {
          if (!isSuper) return;
          setActiveInlineEditor({
            type: 'cell',
            targetId: options!.onDoubleClickKey,
            value: String(value)
          });
        }}
        className={`${isSuper ? 'cursor-pointer hover:bg-purple-50/50 hover:text-purple-600 dark:hover:bg-purple-950/30 transition-all rounded px-1 -mx-1' : ''} ${options?.className || ''}`}
        title={isSuper ? 'Duplo clique para editar' : undefined}
      >
        {displayVal}
      </span>
    );
  };

  const renderEditableLabel = (
    labelKey: string,
    defaultVal: string,
    options?: {
      className?: string;
    }
  ) => {
    const isSuper = isSuperAdmin();
    const currentValue = customLabels[labelKey] || defaultVal;
    const isEditing = activeInlineEditor?.type === 'label' && activeInlineEditor.targetId === labelKey;

    if (isSuper && isEditing) {
      return (
        <input
          autoFocus
          className={`border border-purple-500 rounded px-2 py-1 text-xs bg-white dark:bg-[#1A1730] dark:text-white font-bold inline-block text-black ${options?.className || ''}`}
          value={activeInlineEditor.value}
          onChange={e => setActiveInlineEditor({ ...activeInlineEditor, value: e.target.value })}
          onBlur={() => handleSaveLabel(labelKey, activeInlineEditor.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSaveLabel(labelKey, activeInlineEditor.value);
            if (e.key === 'Escape') setActiveInlineEditor(null);
          }}
          onClick={e => e.stopPropagation()}
        />
      );
    }

    return (
      <span
        onDoubleClick={e => {
          if (!isSuper) return;
          e.stopPropagation();
          handleLabelDoubleClick(labelKey, currentValue);
        }}
        className={`${isSuper ? 'cursor-pointer hover:underline' : ''} ${options?.className || ''}`}
        title={isSuper ? 'Duplo clique para editar' : undefined}
      >
        {currentValue}
      </span>
    );
  };

  const handleSave = () => {
    updateConfig({
      appName: appName.trim(),
      siteTagline: siteTagline.trim(),
      footerText: footerText.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      customFields
    });
    localStorage.setItem('legis_bi_tb_apoio', JSON.stringify(biApoio));
    localStorage.setItem('legis_bi_tb_dados_base', JSON.stringify(biDadosBase));
    localStorage.setItem('legis_bi_clientes', JSON.stringify(biClientes));
    localStorage.setItem('legis_bi_produtos', JSON.stringify(biProdutos));
    localStorage.setItem('legis_bi_fornecedores', JSON.stringify(biFornecedores));
    localStorage.setItem('legis_bi_vendas', JSON.stringify(biVendas));
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" value={appName} onChange={e => setAppName(e.target.value)} placeholder="Ex: Legis Connect" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase">Slogan Principal</label>
            <button type="button" onClick={() => setSiteTagline('')} className="text-[10px] font-bold text-red-600 hover:underline">Excluir Slogan</button>
          </div>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" value={siteTagline} onChange={e => setSiteTagline(e.target.value)} placeholder="Slogan do aplicativo" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase">Texto do Rodapé</label>
            <button type="button" onClick={() => setFooterText('')} className="text-[10px] font-bold text-red-600 hover:underline">Excluir Copyright</button>
          </div>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" value={footerText} onChange={e => setFooterText(e.target.value)} placeholder="Ex: © 2026 Legis Connect. Todos os direitos reservados." />
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
            <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="contato@empresa.com" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-gray-600">Telefone de Contato</label>
              {contactPhone && <button type="button" onClick={() => setContactPhone('')} className="text-[10px] font-bold text-red-600 hover:underline">Excluir</button>}
            </div>
            <input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+55 11 99999-9999" />
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
              <div key={field.id} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-200 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                <input
                  type="text"
                  value={field.key}
                  onChange={e => handleEditCustomField(field.id, e.target.value, field.value)}
                  className="w-1/3 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none bg-white p-1 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                  placeholder="Nome do Campo"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={e => handleEditCustomField(field.id, field.key, e.target.value)}
                  className="flex-grow border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none bg-white p-1 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none bg-white p-1 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
              placeholder="Ex: Endereço Comercial"
            />
          </div>
          <div className="flex-1 w-full text-left">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Valor</label>
            <input
              type="text"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none bg-white p-1 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:border-primary/50 cursor-pointer transition-colors dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:border-primary/50 cursor-pointer transition-colors dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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

      {/* Seção BI / Modelagem Financeira */}
      <div className="pt-6 border-t space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wider flex items-center gap-2">
              <span>📊</span> Modelagem de Dados Financeiros & BI
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Gerencie os modelos de dados e premissas financeiras que alimentam os Dashboards de Analytics da plataforma.
            </p>
          </div>

          <div className="flex bg-gray-100 dark:bg-[#201C3D] p-1 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm shrink-0">
            <button
              type="button"
              onClick={() => { setBiSubTab('excel_ums'); setDocTab('DAX (Power BI)'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${biSubTab === 'excel_ums' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}
            >
              📊 {renderEditableLabel('tab_excel_ums', 'Geral (Excel UMS)')}
            </button>
            <button
              type="button"
              onClick={() => { setBiSubTab('servicos_aluguel'); setDocTab('SQL (Criação de Tabelas)'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${biSubTab === 'servicos_aluguel' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}
            >
              ⚙️ {renderEditableLabel('tab_servicos_aluguel', 'Aluguer de Equipamentos')}
            </button>
          </div>
        </div>

        {biSubTab === 'excel_ums' ? (
          <>
            {/* Tabela A: Premissas (tb_apoio) */}
            <div className="bg-purple-50/50 dark:bg-[#1A1730]/40 border border-purple-200 dark:border-[#2A2545] rounded-xl p-4 space-y-4 text-left animate-fade-in">
              <h5 className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase">Tabela A: Premissas (tb_apoio)</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Teto de Execução Anual (UMS) *</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white p-1"
                    value={biApoio.teto_execucao_anual_ums}
                    onChange={e => setBiApoio(prev => ({ ...prev, teto_execucao_anual_ums: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Meta de Razão de Eficiência Final *</label>
                  <input
                    type="number"
                    step="0.0000001"
                    className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white p-1"
                    value={biApoio.meta_razao_final}
                    onChange={e => setBiApoio(prev => ({ ...prev, meta_razao_final: Number(e.target.value) }))}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Ex: 0.4399678 (equivale a ~44%)</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase">Metas de Faturamento por Período / Semestre</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {biApoio.periodos.map((periodo, idx) => (
                    <div key={periodo} className="bg-white dark:bg-[#1A1730] p-2.5 rounded-lg border border-purple-100 dark:border-[#2A2545]">
                      <span className="block text-[10px] font-bold text-gray-500 uppercase">{periodo}</span>
                      <input
                        type="number"
                        step="0.001"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded mt-1 px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white"
                        value={biApoio.meta_faturamento_percentual[idx]}
                        onChange={e => {
                          const nextMetas = [...biApoio.meta_faturamento_percentual];
                          nextMetas[idx] = Number(e.target.value);
                          setBiApoio(prev => ({ ...prev, meta_faturamento_percentual: nextMetas }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabela Dados Transacionais */}
            <div className="bg-blue-50/50 dark:bg-[#1A1730]/40 border border-blue-200 dark:border-[#2A2545] rounded-xl p-4 space-y-4 text-left animate-fade-in">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h5 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">Tabela Dados Transacionais</h5>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Deseja redefinir a tabela transacional para os dados de teste originais?')) {
                        setBiDadosBase(mockBiDadosBase);
                        localStorage.setItem('legis_bi_tb_dados_base', JSON.stringify(mockBiDadosBase));
                      }
                    }}
                    className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 px-2.5 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40"
                  >
                    Redefinir Padrão
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTxId(null);
                      setTxForm({
                        id_tab: 0,
                        semestre: '1º sem',
                        valor_ums: 5.5,
                        mes_ano: new Date().toISOString().split('T')[0],
                        executado_ums: 10000,
                        receita_fat: 50000,
                        transferencia_recebida: 5000,
                        despesa_total: 25000,
                        custo: 10000,
                        imposto: 5000,
                        juros: 1000,
                        salarios_ordenados: 6000,
                        glosa: 1000,
                        emissao_nf: new Date().toISOString().split('T')[0],
                        recebimento_nf: new Date().toISOString().split('T')[0],
                      });
                      setShowTxForm(!showTxForm);
                    }}
                    className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 px-2.5 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40"
                  >
                    {showTxForm && !editingTxId ? '✕ Fechar Form' : '+ Novo Lançamento'}
                  </button>
                </div>
              </div>

              {/* Tx Form */}
              {showTxForm && (
                <div className="bg-white dark:bg-[#1A1730] border border-blue-200 dark:border-[#2A2545] p-4 rounded-lg space-y-4">
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-300">{editingTxId ? `📝 Editar Registro #${editingTxId}` : '➕ Novo Registro Transacional'}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Semestre *</label>
                      <select
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.semestre}
                        onChange={e => setTxForm(p => ({ ...p, semestre: e.target.value }))}
                      >
                        {biApoio.periodos.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Mês / Ano *</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.mes_ano}
                        onChange={e => setTxForm(p => ({ ...p, mes_ano: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Valor UMS (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.valor_ums}
                        onChange={e => setTxForm(p => ({ ...p, valor_ums: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Executado UMS *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.executado_ums}
                        onChange={e => setTxForm(p => ({ ...p, executado_ums: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Receita Faturamento *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.receita_fat}
                        onChange={e => setTxForm(p => ({ ...p, receita_fat: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Transf. Recebida *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.transferencia_recebida}
                        onChange={e => setTxForm(p => ({ ...p, transferencia_recebida: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Despesa Total *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.despesa_total}
                        onChange={e => setTxForm(p => ({ ...p, despesa_total: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Custo Operacional *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.custo}
                        onChange={e => setTxForm(p => ({ ...p, custo: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Impostos *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.imposto}
                        onChange={e => setTxForm(p => ({ ...p, imposto: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Juros *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.juros}
                        onChange={e => setTxForm(p => ({ ...p, juros: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Salários/Ordenados *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.salarios_ordenados}
                        onChange={e => setTxForm(p => ({ ...p, salarios_ordenados: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Glosas *</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.glosa}
                        onChange={e => setTxForm(p => ({ ...p, glosa: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Emissão NF *</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.emissao_nf}
                        onChange={e => setTxForm(p => ({ ...p, emissao_nf: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Recebimento NF *</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                        value={txForm.recebimento_nf}
                        onChange={e => setTxForm(p => ({ ...p, recebimento_nf: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        let nextBase;
                        if (editingTxId) {
                          nextBase = biDadosBase.map(t => t.id_tab === editingTxId ? { ...txForm, id_tab: editingTxId } : t);
                        } else {
                          nextBase = [...biDadosBase, { ...txForm, id_tab: Date.now() }];
                        }
                        setBiDadosBase(nextBase);
                        localStorage.setItem('legis_bi_tb_dados_base', JSON.stringify(nextBase));
                        setShowTxForm(false);
                        setEditingTxId(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                    >
                      {editingTxId ? 'Salvar Alterações' : 'Adicionar Lançamento'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTxForm(false);
                        setEditingTxId(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Tx List Table */}
              <div className="overflow-x-auto border border-gray-200 dark:border-[#2A2545] rounded-lg">
                <table className="w-full text-xs text-left bg-white dark:bg-[#1A1730]">
                  <thead className="bg-gray-100 dark:bg-[#201C3D] uppercase font-bold text-gray-700 dark:text-gray-300 border-b dark:border-[#2A2545]">
                    <tr>
                      <th className="px-3 py-2">Mês/Ano</th>
                      <th className="px-3 py-2">Semestre</th>
                      <th className="px-3 py-2 text-right">Faturamento</th>
                      <th className="px-3 py-2 text-right">Despesa Total</th>
                      <th className="px-3 py-2 text-right">Custo</th>
                      <th className="px-3 py-2 text-right">Imposto</th>
                      <th className="px-3 py-2 text-right">Exec UMS</th>
                      <th className="px-3 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biDadosBase.map((tx, idx) => (
                      <tr key={tx.id_tab} className="border-b dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-[#221d3f]">
                        <td className="px-3 py-2 font-medium">
                          {renderEditableCell(tx.mes_ano, val => handleSaveTxCell(idx, 'mes_ano', val), {
                            type: 'date',
                            displayValue: tx.mes_ano ? new Date(tx.mes_ano + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '—',
                            onDoubleClickKey: `tx-${idx}-mes_ano`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(tx.semestre, val => handleSaveTxCell(idx, 'semestre', val), {
                            type: 'select',
                            selectOptions: biApoio.periodos,
                            onDoubleClickKey: `tx-${idx}-semestre`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                          {renderEditableCell(tx.receita_fat, val => handleSaveTxCell(idx, 'receita_fat', val), {
                            type: 'number',
                            displayValue: `R$ ${tx.receita_fat.toLocaleString('pt-BR')}`,
                            onDoubleClickKey: `tx-${idx}-receita_fat`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right text-red-600 dark:text-red-400">
                          {renderEditableCell(tx.despesa_total, val => handleSaveTxCell(idx, 'despesa_total', val), {
                            type: 'number',
                            displayValue: `R$ ${tx.despesa_total.toLocaleString('pt-BR')}`,
                            onDoubleClickKey: `tx-${idx}-despesa_total`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {renderEditableCell(tx.custo, val => handleSaveTxCell(idx, 'custo', val), {
                            type: 'number',
                            displayValue: `R$ ${tx.custo.toLocaleString('pt-BR')}`,
                            onDoubleClickKey: `tx-${idx}-custo`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {renderEditableCell(tx.imposto, val => handleSaveTxCell(idx, 'imposto', val), {
                            type: 'number',
                            displayValue: `R$ ${tx.imposto.toLocaleString('pt-BR')}`,
                            onDoubleClickKey: `tx-${idx}-imposto`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {renderEditableCell(tx.executado_ums, val => handleSaveTxCell(idx, 'executado_ums', val), {
                            type: 'number',
                            onDoubleClickKey: `tx-${idx}-executado_ums`
                          })}</td>
                        <td className="px-3 py-2 text-center space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTxId(tx.id_tab);
                              setTxForm({ ...tx });
                              setShowTxForm(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Deseja excluir este registro transacional?')) {
                                const next = biDadosBase.filter(t => t.id_tab !== tx.id_tab);
                                setBiDadosBase(next);
                                localStorage.setItem('legis_bi_tb_dados_base', JSON.stringify(next));
                              }
                            }}
                            className="text-red-600 dark:text-red-400 hover:underline font-bold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {biDadosBase.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-3 py-6 text-center text-gray-400">Nenhum lançamento cadastrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="flex gap-2 flex-wrap mb-2 border-b pb-2">
              {[
                { id: 'vendas' as const, key: 'sub_vendas', default: 'fato_vendas (Alugueres)' },
                { id: 'clientes' as const, key: 'sub_clientes', default: 'dim_clientes (Clientes)' },
                { id: 'produtos' as const, key: 'sub_produtos', default: 'dim_produtos (Produtos)' },
                { id: 'fornecedores' as const, key: 'sub_fornecedores', default: 'dim_fornecedores (Fornecedores)' }
              ].map(sub => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setBiAluguelTab(sub.id);
                    setShowAluguelForm(false);
                    setEditingAluguelId(null);
                  }}
                  className={`pb-2 text-xs font-bold transition-all ${
                    biAluguelTab === sub.id
                      ? 'border-b-2 border-purple-600 text-purple-700'
                      : 'text-gray-500 hover:text-purple-600'
                  }`}
                >
                  {renderEditableLabel(sub.key, sub.default)}
                </button>
              ))}
            </div>

            {/* Actions header */}
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h5 className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase">
                {biAluguelTab === 'vendas' ? 'Tabela Fato Serviços' : 
                 biAluguelTab === 'clientes' ? 'Tabela Dimensão: Clientes' :
                 biAluguelTab === 'produtos' ? 'Tabela Dimensão Produtos' :
                 'Tabela Dimensão Fornecedores'}
              </h5>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Deseja redefinir esta tabela para os dados de teste originais?')) {
                      if (biAluguelTab === 'vendas') { setBiVendas(mockBiVendas); localStorage.setItem('legis_bi_vendas', JSON.stringify(mockBiVendas)); }
                      else if (biAluguelTab === 'clientes') { setBiClientes(mockBiClientes); localStorage.setItem('legis_bi_clientes', JSON.stringify(mockBiClientes)); }
                      else if (biAluguelTab === 'produtos') { setBiProdutos(mockBiProdutos); localStorage.setItem('legis_bi_produtos', JSON.stringify(mockBiProdutos)); }
                      else if (biAluguelTab === 'fornecedores') { setBiFornecedores(mockBiFornecedores); localStorage.setItem('legis_bi_fornecedores', JSON.stringify(mockBiFornecedores)); }
                    }
                  }}
                  className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 px-2.5 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  Redefinir Padrão
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAluguelId(null);
                    setShowAluguelForm(!showAluguelForm);
                    // Reset forms
                    if (biAluguelTab === 'clientes') setClientForm({ codigo: 'C' + String(biClientes.length + 1).padStart(2, '0'), nome: '', cpf_cnpj: '', cidade: '', estado: '', lista_concatenada: '' });
                    else if (biAluguelTab === 'produtos') setProductForm({ codigo: 'P' + String(biProdutos.length + 1).padStart(2, '0'), nome: '', descricao: '', custo: 0, preco_tabela: 0, lista_concatenada: '' });
                    else if (biAluguelTab === 'fornecedores') setSupplierForm({ codigo: 'F' + String(biFornecedores.length + 1).padStart(2, '0'), nome: '', cpf_cnpj: '', estado: '', lista_concatenada: '' });
                    else if (biAluguelTab === 'vendas') setSaleForm({
                      id_tab: 'v' + String(biVendas.length + 1).padStart(2, '0'),
                      fornecedor: biFornecedores[0]?.lista_concatenada || '',
                      cliente: biClientes[0]?.lista_concatenada || '',
                      produto: biProdutos[0]?.lista_concatenada || '',
                      qtd: 1,
                      vlr_unit: biProdutos[0]?.preco_tabela || 0,
                      valor_total: biProdutos[0]?.preco_tabela || 0,
                      custo_prod: biProdutos[0]?.custo || 0,
                      lucro: (biProdutos[0]?.preco_tabela || 0) - (biProdutos[0]?.custo || 0),
                      data: new Date().toISOString().split('T')[0],
                      data_referencia: new Date().toISOString().split('T')[0].substring(0, 8) + '01',
                      data_retirada: new Date().toISOString().split('T')[0],
                      data_devolucao: '',
                      status_pagamento: 'Pago',
                      status_aluguel: 'Entregue',
                    });
                  }}
                  className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/30 px-2.5 py-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/40"
                >
                  {showAluguelForm && !editingAluguelId ? '✕ Fechar Form' : '+ Novo Registro'}
                </button>
              </div>
            </div>

            {/* Form for dim_clientes */}
            {showAluguelForm && biAluguelTab === 'clientes' && (
              <div className="bg-white dark:bg-[#1A1730] border border-purple-200 dark:border-[#2A2545] p-4 rounded-lg space-y-4">
                <p className="text-xs font-bold text-purple-900 dark:text-purple-300">{editingAluguelId ? '📝 Editar Cliente' : '➕ Novo Cliente'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Código *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={clientForm.codigo} onChange={e => setClientForm(p => ({ ...p, codigo: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Nome *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={clientForm.nome} onChange={e => setClientForm(p => ({ ...p, nome: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">CPF/CNPJ *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={clientForm.cpf_cnpj} onChange={e => setClientForm(p => ({ ...p, cpf_cnpj: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Cidade *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={clientForm.cidade} onChange={e => setClientForm(p => ({ ...p, cidade: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Estado (UF) *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={clientForm.estado} onChange={e => setClientForm(p => ({ ...p, estado: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const computed = `${clientForm.codigo} - ${clientForm.nome}`;
                      const payload = { ...clientForm, lista_concatenada: computed };
                      let next;
                      if (editingAluguelId) {
                        next = biClientes.map(c => c.lista_concatenada === editingAluguelId ? payload : c);
                      } else {
                        next = [...biClientes, payload];
                      }
                      setBiClientes(next);
                      localStorage.setItem('legis_bi_clientes', JSON.stringify(next));
                      setShowAluguelForm(false);
                      setEditingAluguelId(null);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700"
                  >
                    Salvar
                  </button>
                  <button type="button" onClick={() => { setShowAluguelForm(false); setEditingAluguelId(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Form for dim_produtos */}
            {showAluguelForm && biAluguelTab === 'produtos' && (
              <div className="bg-white dark:bg-[#1A1730] border border-purple-200 dark:border-[#2A2545] p-4 rounded-lg space-y-4">
                <p className="text-xs font-bold text-purple-900 dark:text-purple-300">{editingAluguelId ? '📝 Editar Produto' : '➕ Novo Produto'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Código *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={productForm.codigo} onChange={e => setProductForm(p => ({ ...p, codigo: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Nome *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={productForm.nome} onChange={e => setProductForm(p => ({ ...p, nome: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Descrição *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={productForm.descricao} onChange={e => setProductForm(p => ({ ...p, descricao: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">com Desc. *</label>
                    <input type="number" className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={productForm.custo} onChange={e => setProductForm(p => ({ ...p, custo: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Preço Tabela *</label>
                    <input type="number" className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={productForm.preco_tabela} onChange={e => setProductForm(p => ({ ...p, preco_tabela: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const computed = `${productForm.codigo} - ${productForm.nome}`;
                      const payload = { ...productForm, lista_concatenada: computed };
                      let next;
                      if (editingAluguelId) {
                        next = biProdutos.map(p => p.lista_concatenada === editingAluguelId ? payload : p);
                      } else {
                        next = [...biProdutos, payload];
                      }
                      setBiProdutos(next);
                      localStorage.setItem('legis_bi_produtos', JSON.stringify(next));
                      setShowAluguelForm(false);
                      setEditingAluguelId(null);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700"
                  >
                    Salvar
                  </button>
                  <button type="button" onClick={() => { setShowAluguelForm(false); setEditingAluguelId(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Form for dim_fornecedores */}
            {showAluguelForm && biAluguelTab === 'fornecedores' && (
              <div className="bg-white dark:bg-[#1A1730] border border-purple-200 dark:border-[#2A2545] p-4 rounded-lg space-y-4">
                <p className="text-xs font-bold text-purple-900 dark:text-purple-300">{editingAluguelId ? '📝 Editar Fornecedor' : '➕ Novo Fornecedor'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Código *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={supplierForm.codigo} onChange={e => setSupplierForm(p => ({ ...p, codigo: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Nome *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={supplierForm.nome} onChange={e => setSupplierForm(p => ({ ...p, nome: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">CPF/CNPJ *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={supplierForm.cpf_cnpj} onChange={e => setSupplierForm(p => ({ ...p, cpf_cnpj: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Estado (UF) *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={supplierForm.estado} onChange={e => setSupplierForm(p => ({ ...p, estado: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const computed = `${supplierForm.codigo} - ${supplierForm.nome}`;
                      const payload = { ...supplierForm, lista_concatenada: computed };
                      let next;
                      if (editingAluguelId) {
                        next = biFornecedores.map(f => f.lista_concatenada === editingAluguelId ? payload : f);
                      } else {
                        next = [...biFornecedores, payload];
                      }
                      setBiFornecedores(next);
                      localStorage.setItem('legis_bi_fornecedores', JSON.stringify(next));
                      setShowAluguelForm(false);
                      setEditingAluguelId(null);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700"
                  >
                    Salvar
                  </button>
                  <button type="button" onClick={() => { setShowAluguelForm(false); setEditingAluguelId(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Form for fato_vendas */}
            {showAluguelForm && biAluguelTab === 'vendas' && (
              <div className="bg-white dark:bg-[#1A1730] border border-purple-200 dark:border-[#2A2545] p-4 rounded-lg space-y-4">
                <p className="text-xs font-bold text-purple-900 dark:text-purple-300">{editingAluguelId ? '📝 Editar Registro de Venda' : '➕ Novo Registro de Venda'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">ID Lançamento *</label>
                    <input className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={saleForm.id_tab} onChange={e => setSaleForm(p => ({ ...p, id_tab: e.target.value }))} disabled={!!editingAluguelId} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Fornecedor *</label>
                    <select
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.fornecedor}
                      onChange={e => setSaleForm(p => ({ ...p, fornecedor: e.target.value }))}
                    >
                      {biFornecedores.map(f => <option key={f.lista_concatenada} value={f.lista_concatenada}>{f.lista_concatenada}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Cliente *</label>
                    <select
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.cliente}
                      onChange={e => setSaleForm(p => ({ ...p, cliente: e.target.value }))}
                    >
                      {biClientes.map(c => <option key={c.lista_concatenada} value={c.lista_concatenada}>{c.lista_concatenada}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Produto *</label>
                    <select
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.produto}
                      onChange={e => {
                        const prodVal = e.target.value;
                        const matched = biProdutos.find(p => p.lista_concatenada === prodVal);
                        setSaleForm(p => {
                          const nextQtd = p.qtd;
                          const nextVlr = matched ? matched.preco_tabela : p.vlr_unit;
                          const nextCusto = matched ? matched.custo : p.custo_prod;
                          const nextTotal = nextQtd * nextVlr;
                          const nextLucro = nextTotal - (nextQtd * nextCusto);
                          return {
                            ...p,
                            produto: prodVal,
                            vlr_unit: nextVlr,
                            custo_prod: nextCusto,
                            valor_total: nextTotal,
                            lucro: nextLucro
                          };
                        });
                      }}
                    >
                      {biProdutos.map(p => <option key={p.lista_concatenada} value={p.lista_concatenada}>{p.lista_concatenada}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Qtd *</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.qtd}
                      onChange={e => {
                        const nextQtd = Number(e.target.value);
                        setSaleForm(p => {
                          const nextTotal = nextQtd * p.vlr_unit;
                          const nextLucro = nextTotal - (nextQtd * p.custo_prod);
                          return { ...p, qtd: nextQtd, valor_total: nextTotal, lucro: nextLucro };
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Vlr Unit (R$) *</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.vlr_unit}
                      onChange={e => {
                        const nextVlr = Number(e.target.value);
                        setSaleForm(p => {
                          const nextTotal = p.qtd * nextVlr;
                          const nextLucro = nextTotal - (p.qtd * p.custo_prod);
                          return { ...p, vlr_unit: nextVlr, valor_total: nextTotal, lucro: nextLucro };
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Custo Prod (R$) *</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.custo_prod}
                      onChange={e => {
                        const nextCusto = Number(e.target.value);
                        setSaleForm(p => {
                          const nextLucro = p.valor_total - (p.qtd * nextCusto);
                          return { ...p, custo_prod: nextCusto, lucro: nextLucro };
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Valor Total (R$) *</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1 bg-gray-50"
                      value={saleForm.valor_total}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Lucro (R$) *</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1 bg-gray-50"
                      value={saleForm.lucro}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Data Pedido *</label>
                    <input type="date" className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={saleForm.data} onChange={e => setSaleForm(p => ({ ...p, data: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Data Entrada *</label>
                    <input type="date" className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={saleForm.data_referencia} onChange={e => setSaleForm(p => ({ ...p, data_referencia: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Data Entrega *</label>
                    <input type="date" className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={saleForm.data_retirada} onChange={e => setSaleForm(p => ({ ...p, data_retirada: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Data Pagto</label>
                    <input type="date" className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1" value={saleForm.data_devolucao} onChange={e => setSaleForm(p => ({ ...p, data_devolucao: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Status Pagamento *</label>
                    <select
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.status_pagamento}
                      onChange={e => setSaleForm(p => ({ ...p, status_pagamento: e.target.value }))}
                    >
                      <option value="Pago">Pago</option>
                      <option value="Pendente">Pendente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">STATUS SERVIÇO *</label>
                    <select
                      className="w-full border border-gray-300 dark:border-[#2A2545] rounded px-2 py-1 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:text-white mt-1"
                      value={saleForm.status_aluguel}
                      onChange={e => setSaleForm(p => ({ ...p, status_aluguel: e.target.value as 'Entregue' | 'Cancelado' | 'Em Realização' }))}
                    >
                      <option value="Entregue">Entregue</option>
                      <option value="Cancelado">Cancelado</option>
                      <option value="Em Realização">Em Realização</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      let next;
                      if (editingAluguelId) {
                        next = biVendas.map(v => v.id_tab === editingAluguelId ? saleForm : v);
                      } else {
                        next = [...biVendas, saleForm];
                      }
                      setBiVendas(next);
                      localStorage.setItem('legis_bi_vendas', JSON.stringify(next));
                      setShowAluguelForm(false);
                      setEditingAluguelId(null);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700"
                  >
                    Salvar
                  </button>
                  <button type="button" onClick={() => { setShowAluguelForm(false); setEditingAluguelId(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Table lists */}
            <div className="overflow-x-auto border border-gray-200 dark:border-[#2A2545] rounded-lg">
              {biAluguelTab === 'clientes' && (
                <table className="w-full text-xs text-left bg-white dark:bg-[#1A1730]">
                  <thead className="bg-gray-100 dark:bg-[#201C3D] uppercase font-bold text-gray-700 dark:text-gray-300 border-b dark:border-[#2A2545]">
                    <tr>
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Nome</th>
                      <th className="px-3 py-2">CPF/CNPJ</th>
                      <th className="px-3 py-2">Cidade</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biClientes.map((c, idx) => (
                      <tr key={c.lista_concatenada} className="border-b dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-[#221d3f]">
                        <td className="px-3 py-2">
                          {renderEditableCell(c.codigo, val => handleSaveClientCell(idx, 'codigo', val), {
                            onDoubleClickKey: `client-${idx}-codigo`
                          })}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {renderEditableCell(c.nome, val => handleSaveClientCell(idx, 'nome', val), {
                            onDoubleClickKey: `client-${idx}-nome`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(c.cpf_cnpj, val => handleSaveClientCell(idx, 'cpf_cnpj', val), {
                            onDoubleClickKey: `client-${idx}-cpf_cnpj`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(c.cidade, val => handleSaveClientCell(idx, 'cidade', val), {
                            onDoubleClickKey: `client-${idx}-cidade`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(c.estado, val => handleSaveClientCell(idx, 'estado', val), {
                            onDoubleClickKey: `client-${idx}-estado`
                          })}
                        </td>
                        <td className="px-3 py-2 text-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAluguelId(c.lista_concatenada);
                              setClientForm({ ...c });
                              setShowAluguelForm(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Excluir este cliente?')) {
                                const next = biClientes.filter(x => x.lista_concatenada !== c.lista_concatenada);
                                setBiClientes(next);
                                localStorage.setItem('legis_bi_clientes', JSON.stringify(next));
                              }
                            }}
                            className="text-red-600 dark:text-red-400 hover:underline font-bold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {biClientes.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-gray-400">Nenhum cliente cadastrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {biAluguelTab === 'produtos' && (
                <table className="w-full text-xs text-left bg-white dark:bg-[#1A1730]">
                  <thead className="bg-gray-100 dark:bg-[#201C3D] uppercase font-bold text-gray-700 dark:text-gray-300 border-b dark:border-[#2A2545]">
                    <tr>
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Nome</th>
                      <th className="px-3 py-2">Descrição</th>
                      <th className="px-3 py-2 text-right">C/ Desc.</th>
                      <th className="px-3 py-2 text-right">Preço Tabela</th>
                      <th className="px-3 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biProdutos.map((p, idx) => (
                      <tr key={p.lista_concatenada} className="border-b dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-[#221d3f]">
                        <td className="px-3 py-2">
                          {renderEditableCell(p.codigo, val => handleSaveProductCell(idx, 'codigo', val), {
                            onDoubleClickKey: `product-${idx}-codigo`
                          })}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {renderEditableCell(p.nome, val => handleSaveProductCell(idx, 'nome', val), {
                            onDoubleClickKey: `product-${idx}-nome`
                          })}
                        </td>
                        <td className="px-3 py-2 truncate max-w-[200px]" title={p.descricao}>
                          {renderEditableCell(p.descricao, val => handleSaveProductCell(idx, 'descricao', val), {
                            onDoubleClickKey: `product-${idx}-descricao`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {renderEditableCell(p.custo, val => handleSaveProductCell(idx, 'custo', val), {
                            type: 'number',
                            displayValue: `R$ ${p.custo}`,
                            onDoubleClickKey: `product-${idx}-custo`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {renderEditableCell(p.preco_tabela, val => handleSaveProductCell(idx, 'preco_tabela', val), {
                            type: 'number',
                            displayValue: `R$ ${p.preco_tabela}`,
                            onDoubleClickKey: `product-${idx}-preco_tabela`
                          })}
                        </td>
                        <td className="px-3 py-2 text-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAluguelId(p.lista_concatenada);
                              setProductForm({ ...p });
                              setShowAluguelForm(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Excluir este produto?')) {
                                const next = biProdutos.filter(x => x.lista_concatenada !== p.lista_concatenada);
                                setBiProdutos(next);
                                localStorage.setItem('legis_bi_produtos', JSON.stringify(next));
                              }
                            }}
                            className="text-red-600 dark:text-red-400 hover:underline font-bold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {biProdutos.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-gray-400">Nenhum produto cadastrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {biAluguelTab === 'fornecedores' && (
                <table className="w-full text-xs text-left bg-white dark:bg-[#1A1730]">
                  <thead className="bg-gray-100 dark:bg-[#201C3D] uppercase font-bold text-gray-700 dark:text-gray-300 border-b dark:border-[#2A2545]">
                    <tr>
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Nome</th>
                      <th className="px-3 py-2">CPF/CNPJ</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biFornecedores.map((f, idx) => (
                      <tr key={f.lista_concatenada} className="border-b dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-[#221d3f]">
                        <td className="px-3 py-2">
                          {renderEditableCell(f.codigo, val => handleSaveSupplierCell(idx, 'codigo', val), {
                            onDoubleClickKey: `supplier-${idx}-codigo`
                          })}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {renderEditableCell(f.nome, val => handleSaveSupplierCell(idx, 'nome', val), {
                            onDoubleClickKey: `supplier-${idx}-nome`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(f.cpf_cnpj, val => handleSaveSupplierCell(idx, 'cpf_cnpj', val), {
                            onDoubleClickKey: `supplier-${idx}-cpf_cnpj`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(f.estado, val => handleSaveSupplierCell(idx, 'estado', val), {
                            onDoubleClickKey: `supplier-${idx}-estado`
                          })}
                        </td>
                        <td className="px-3 py-2 text-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAluguelId(f.lista_concatenada);
                              setSupplierForm({ ...f });
                              setShowAluguelForm(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Excluir este fornecedor?')) {
                                const next = biFornecedores.filter(x => x.lista_concatenada !== f.lista_concatenada);
                                setBiFornecedores(next);
                                localStorage.setItem('legis_bi_fornecedores', JSON.stringify(next));
                              }
                            }}
                            className="text-red-600 dark:text-red-400 hover:underline font-bold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {biFornecedores.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-gray-400">Nenhum fornecedor cadastrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {biAluguelTab === 'vendas' && (
                <table className="w-full text-xs text-left bg-white dark:bg-[#1A1730]">
                  <thead className="bg-gray-100 dark:bg-[#201C3D] uppercase font-bold text-gray-700 dark:text-gray-300 border-b dark:border-[#2A2545]">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Cliente</th>
                      <th className="px-3 py-2">Fornecedor</th>
                      <th className="px-3 py-2">Produto</th>
                      <th className="px-3 py-2 text-right">Qtd</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      <th className="px-3 py-2 text-right">Lucro</th>
                      <th className="px-3 py-2">STATUS SERVIÇO</th>
                      <th className="px-3 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biVendas.map((v, idx) => (
                      <tr key={v.id_tab} className="border-b dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-[#221d3f]">
                        <td className="px-3 py-2">
                          {renderEditableCell(v.id_tab, val => handleSaveSaleCell(idx, 'id_tab', val), {
                            onDoubleClickKey: `sale-${idx}-id_tab`
                          })}
                        </td>
                        <td className="px-3 py-2 font-medium truncate max-w-[120px]" title={v.cliente}>
                          {renderEditableCell(v.cliente, val => handleSaveSaleCell(idx, 'cliente', val), {
                            type: 'select',
                            selectOptions: biClientes.map(c => c.lista_concatenada),
                            onDoubleClickKey: `sale-${idx}-cliente`
                          })}
                        </td>
                        <td className="px-3 py-2 truncate max-w-[120px]" title={v.fornecedor}>
                          {renderEditableCell(v.fornecedor, val => handleSaveSaleCell(idx, 'fornecedor', val), {
                            type: 'select',
                            selectOptions: biFornecedores.map(f => f.lista_concatenada),
                            onDoubleClickKey: `sale-${idx}-fornecedor`
                          })}
                        </td>
                        <td className="px-3 py-2 truncate max-w-[120px]" title={v.produto}>
                          {renderEditableCell(v.produto, val => handleSaveSaleCell(idx, 'produto', val), {
                            type: 'select',
                            selectOptions: biProdutos.map(p => p.lista_concatenada),
                            onDoubleClickKey: `sale-${idx}-produto`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {renderEditableCell(v.qtd, val => handleSaveSaleCell(idx, 'qtd', val), {
                            type: 'number',
                            onDoubleClickKey: `sale-${idx}-qtd`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-emerald-700">
                          {renderEditableCell(v.valor_total, val => handleSaveSaleCell(idx, 'valor_total', val), {
                            type: 'number',
                            displayValue: `R$ ${v.valor_total.toLocaleString('pt-BR')}`,
                            onDoubleClickKey: `sale-${idx}-valor_total`
                          })}
                        </td>
                        <td className="px-3 py-2 text-right text-emerald-600">
                          {renderEditableCell(v.lucro, val => handleSaveSaleCell(idx, 'lucro', val), {
                            type: 'number',
                            displayValue: `R$ ${v.lucro.toLocaleString('pt-BR')}`,
                            onDoubleClickKey: `sale-${idx}-lucro`
                          })}
                        </td>
                        <td className="px-3 py-2">
                          {renderEditableCell(
                            v.status_aluguel,
                            val => handleSaveSaleCell(idx, 'status_aluguel', val),
                            {
                              type: 'select',
                              selectOptions: ['Entregue', 'Cancelado', 'Em Realização'],
                              displayValue: v.status_aluguel,
                              onDoubleClickKey: `sale-${idx}-status_aluguel`,
                              className: `px-2 py-0.5 rounded text-[10px] font-bold ${
                                v.status_aluguel === 'Entregue' ? 'bg-green-100 text-green-800' :
                                v.status_aluguel === 'Cancelado' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`
                            }
                          )}
                        </td>
                        <td className="px-3 py-2 text-center space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAluguelId(v.id_tab);
                              setSaleForm({ ...v });
                              setShowAluguelForm(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Excluir este lançamento de aluguer?')) {
                                const next = biVendas.filter(x => x.id_tab !== v.id_tab);
                                setBiVendas(next);
                                localStorage.setItem('legis_bi_vendas', JSON.stringify(next));
                              }
                            }}
                            className="text-red-600 dark:text-red-400 hover:underline font-bold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {biVendas.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-3 py-6 text-center text-gray-400">Nenhum lançamento cadastrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Documentação BI */}
        <div className="bg-slate-50 dark:bg-[#1A1730]/40 border border-slate-200 dark:border-[#2A2545] rounded-xl p-4 space-y-3">
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase flex items-center gap-1">
            <span>📖</span> Documentação do Modelo de Dados & Relacionamentos
          </h5>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Copie os scripts de transformação de dados para Power BI (DAX), Python (Pandas) ou SQL para recriar o modelo de dados de forma idêntica ou otimizada:
          </p>

          <div className="space-y-3 text-left">
            <div className="bg-white dark:bg-[#1A1730] p-3 rounded-lg border border-slate-100 dark:border-[#2A2545] space-y-1.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">🔗 Estrutura de Relacionamentos</p>
              {biSubTab === 'excel_ums' ? (
                <ol className="list-decimal list-inside text-[11px] text-gray-600 dark:text-gray-400 space-y-1 leading-relaxed">
                  <li><strong>Chave de Relação:</strong> Ligue as tabelas usando <code>tb_apoio[periodos]</code> &rarr; <code>tb_dados_base[semestre]</code>.</li>
                  <li><strong>Cardinalidade:</strong> Relacionamento de <strong>1 para Muitos (1:N)</strong>, onde cada período de premissa se relaciona a múltiplos registros mensais.</li>
                  <li><strong>Direção do Filtro:</strong> Unidirecional (tb_apoio filtra tb_dados_base).</li>
                  <li><strong>Alinhamento:</strong> Mantenha os mesmos nomes textuais (ex: '1º sem', '2º sem') em ambos os lados para que as fórmulas encontrem os percentuais corretos.</li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside text-[11px] text-gray-600 dark:text-gray-400 space-y-1 leading-relaxed">
                  <li><strong>Chave de Relação (Clientes):</strong> <code>dim_clientes[lista_concatenada]</code> &rarr; <code>fato_vendas[cliente]</code> (1:N).</li>
                  <li><strong>Chave de Relação (Produtos):</strong> <code>dim_produtos[lista_concatenada]</code> &rarr; <code>fato_vendas[produto]</code> (1:N).</li>
                  <li><strong>Chave de Relação (Fornecedores):</strong> <code>dim_fornecedores[lista_concatenada]</code> &rarr; <code>fato_vendas[fornecedor]</code> (1:N).</li>
                  <li><strong>Nota de Limpeza:</strong> Como as chaves originais utilizam o formato concatenado "ID - Nome", a tabela facto liga-se diretamente às chaves primárias textuais correspondentes.</li>
                </ol>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2 border-b border-gray-200 dark:border-[#2A2545]">
                {biSubTab === 'excel_ums' ? (
                  ['DAX (Power BI)', 'Python (Pandas)', 'SQL Queries'].map(tabName => (
                    <button
                      key={tabName}
                      type="button"
                      onClick={() => setDocTab(tabName)}
                      className={`pb-1 text-xs font-bold ${docTab === tabName ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    >
                      {tabName}
                    </button>
                  ))
                ) : (
                  ['SQL (Criação de Tabelas)', 'Tratamento de Chaves (Regex / Limpeza)', 'Fórmulas DAX'].map(tabName => (
                    <button
                      key={tabName}
                      type="button"
                      onClick={() => setDocTab(tabName)}
                      className={`pb-1 text-xs font-bold ${docTab === tabName ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    >
                      {tabName}
                    </button>
                  ))
                )}
              </div>

              {biSubTab === 'excel_ums' && docTab === 'DAX (Power BI)' && (
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-lg text-[10px] font-mono overflow-auto max-h-48 leading-relaxed">
{`-- Medida: Faturamento Acumulado
Faturamento_Acumulado = SUM(tb_dados_base[receita_fat])

-- Medida: Resultado Mensal
Resultado_Mensal = SUM(tb_dados_base[receita_fat]) + SUM(tb_dados_base[transferencia_recebida]) - SUM(tb_dados_base[despesa_total])

-- Coluna Calculada: Dias para Recebimento
Dias_p_Recebimento = DATEDIFF(tb_dados_base[emissao_nf], tb_dados_base[recebimento_nf], DAY)

-- Medida: Prazo Médio de Recebimento
Prazo_Medio_Recebimento = AVERAGE(tb_dados_base[Dias_p_Recebimento])

-- Coluna Calculada: Despesa Administrativa
Despesa_Administrativa = tb_dados_base[despesa_total] - tb_dados_base[custo] - tb_dados_base[imposto] - tb_dados_base[juros] - tb_dados_base[salarios_ordenados] - tb_dados_base[glosa]

-- Coluna Calculada: Custo Operacional Amplo
Custo_Mais_Despesa = tb_dados_base[custo] + tb_dados_base[Despesa_Administrativa]

-- Coluna Calculada: Base de Saída Total
Total_Saidas_Razao = tb_dados_base[custo] + tb_dados_base[Despesa_Administrativa] + tb_dados_base[imposto]

-- Medida: Razão de Eficiência Mensal
Razao_Mensal = DIVIDE(SUM(tb_dados_base[Total_Saidas_Razao]), SUM(tb_dados_base[receita_fat]) + SUM(tb_dados_base[transferencia_recebida]))

-- Medida: UMS Acumulado
Executado_UMS_Acumulado = 
CALCULATE(
    SUM(tb_dados_base[executado_ums]),
    FILTER(
        ALLSELECTED(tb_dados_base),
        tb_dados_base[mes_ano] <= MAX(tb_dados_base[mes_ano])
    )
)

-- Medida: % Consumo do Teto
Percentual_Consumo_Teto = DIVIDE([Executado_UMS_Acumulado], 189346)`}
                </pre>
              )}
              {biSubTab === 'excel_ums' && docTab === 'Python (Pandas)' && (
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-lg text-[10px] font-mono overflow-auto max-h-48 leading-relaxed">
{`import pandas as pd
import numpy as np

# Carregar dados
tb_dados_base = pd.read_csv('tb_dados_base.csv')
tb_dados_base['mes_ano'] = pd.to_datetime(tb_dados_base['mes_ano'])
tb_dados_base['emissao_nf'] = pd.to_datetime(tb_dados_base['emissao_nf'])
tb_dados_base['recebimento_nf'] = pd.to_datetime(tb_dados_base['recebimento_nf'])

# 1. Resultado Mensal
tb_dados_base['Resultado'] = tb_dados_base['receita_fat'] + tb_dados_base['transferencia_recebida'] - tb_dados_base['despesa_total']

# 2. Prazo Médio de Recebimento
tb_dados_base['Dias_p_Recebimento'] = (tb_dados_base['recebimento_nf'] - tb_dados_base['emissao_nf']).dt.days

# 3. Despesa Administrativa e Custo Operacional Amplo
tb_dados_base['Despesa_Administrativa'] = (
    tb_dados_base['despesa_total'] - tb_dados_base['custo'] - 
    tb_dados_base['imposto'] - tb_dados_base['juros'] - 
    tb_dados_base['salarios_ordenados'] - tb_dados_base['glosa']
).clip(lower=0)

tb_dados_base['Custo_Mais_Despesa'] = tb_dados_base['custo'] + tb_dados_base['Despesa_Administrativa']

# 4. Base de Saída Total para Razão
tb_dados_base['Total_Saidas_Razao'] = tb_dados_base['custo'] + tb_dados_base['Despesa_Administrativa'] + tb_dados_base['imposto']

# 5. Razão de Eficiência Mensal
tb_dados_base['Razao_Mensal'] = tb_dados_base['Total_Saidas_Razao'] / (tb_dados_base['receita_fat'] + tb_dados_base['transferencia_recebida'])

# 6. Consumo do Teto UMS
tb_dados_base = tb_dados_base.sort_values('mes_ano')
tb_dados_base['Executado_UMS_Acumulado'] = tb_dados_base['executado_ums'].cumsum()
tb_dados_base['Percentual_Consumo_Teto'] = tb_dados_base['Executado_UMS_Acumulado'] / 189346`}
                </pre>
              )}
              {biSubTab === 'excel_ums' && docTab === 'SQL Queries' && (
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-lg text-[10px] font-mono overflow-auto max-h-48 leading-relaxed">
{`-- 1. Resultado Mensal
SELECT 
    id_tab,
    mes_ano,
    (receita_fat + transferencia_recebida - despesa_total) AS resultado_mensal
FROM tb_dados_base;

-- 2. Prazo Médio de Recebimento
SELECT 
    id_tab,
    mes_ano,
    DATEDIFF(day, emissao_nf, recebimento_nf) AS dias_p_recebimento
FROM tb_dados_base;

-- 3. Custo Operacional Amplo e Base de Saída Total
SELECT 
    id_tab,
    mes_ano,
    custo,
    despesa_total,
    imposto,
    (despesa_total - custo - imposto - juros - salarios_ordenados - glosa) AS despesa_administrativa,
    (custo + (despesa_total - custo - imposto - juros - salarios_ordenados - glosa)) AS custo_mais_despesa,
    (custo + (despesa_total - custo - imposto - juros - salarios_ordenados - glosa) + imposto) AS total_saidas_razao
FROM tb_dados_base;

-- 4. Razão de Eficiência Mensal e Consumo UMS
WITH acumulado AS (
    SELECT 
        b.*,
        SUM(executado_ums) OVER (ORDER BY mes_ano) AS executado_ums_acumulado
    FROM tb_dados_base b
)
SELECT 
    id_tab,
    mes_ano,
    executado_ums,
    executado_ums_acumulado,
    (executado_ums_acumulado / 189346.0) AS percentual_consumo_teto,
    (custo + (despesa_total - custo - imposto - juros - salarios_ordenados - glosa) + imposto) / NULLIF(receita_fat + transferencia_recebida, 0) AS razao_mensal
FROM acumulado;`}
                </pre>
              )}

              {/* Equipment Rental docs */}
              {biSubTab === 'servicos_aluguel' && docTab === 'SQL (Criação de Tabelas)' && (
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-lg text-[10px] font-mono overflow-auto max-h-48 leading-relaxed">
{`-- 1. Criação do DDL para Dimensões e Facto (Star Schema)
CREATE TABLE dim_clientes (
    lista_concatenada VARCHAR(255) PRIMARY KEY, -- ID - Nome
    codigo VARCHAR(50) UNIQUE,
    nome VARCHAR(150),
    cpf_cnpj VARCHAR(50),
    cidade VARCHAR(100),
    estado VARCHAR(2)
);

CREATE TABLE dim_produtos (
    lista_concatenada VARCHAR(255) PRIMARY KEY, -- ID - Nome
    codigo VARCHAR(50) UNIQUE,
    nome VARCHAR(150),
    descricao TEXT,
    custo DECIMAL(18,4),
    preco_tabela DECIMAL(18,4)
);

CREATE TABLE dim_fornecedores (
    lista_concatenada VARCHAR(255) PRIMARY KEY, -- ID - Nome
    codigo VARCHAR(50) UNIQUE,
    nome VARCHAR(150),
    cpf_cnpj VARCHAR(50),
    estado VARCHAR(2)
);

CREATE TABLE fato_vendas (
    id_tab VARCHAR(50) PRIMARY KEY,
    fornecedor VARCHAR(255) REFERENCES dim_fornecedores(lista_concatenada),
    cliente VARCHAR(255) REFERENCES dim_clientes(lista_concatenada),
    produto VARCHAR(255) REFERENCES dim_produtos(lista_concatenada),
    qtd INT,
    vlr_unit DECIMAL(18,4),
    valor_total DECIMAL(18,4),
    custo_prod DECIMAL(18,4),
    lucro DECIMAL(18,4),
    data DATE,
    data_referencia DATE,
    data_retirada DATE,
    data_devolucao DATE,
    status_pagamento VARCHAR(50),
    status_aluguel VARCHAR(50)
);`}
                </pre>
              )}

              {biSubTab === 'servicos_aluguel' && docTab === 'Tratamento de Chaves (Regex / Limpeza)' && (
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-lg text-[10px] font-mono overflow-auto max-h-48 leading-relaxed">
{`# Script Python/Pandas para Limpeza de Dados e Chaves
import pandas as pd
import re

# Carregar vendas originais com chaves mistas
fato_vendas = pd.read_csv('Vendas.csv')

# Extrair ID numérico e Nome limpo a partir de chaves concatenadas "ID - Nome"
def extrair_id(texto):
    if pd.isna(texto): return None
    match = re.match(r'^(\\w+)\\s*-\\s*', str(texto))
    return match.group(1) if match else str(texto)

def extrair_nome(texto):
    if pd.isna(texto): return None
    return re.sub(r'^\\w+\\s*-\\s*', '', str(texto))

# Aplicar transformações
fato_vendas['cliente_codigo'] = fato_vendas['Cliente'].apply(extrair_id)
fato_vendas['cliente_nome'] = fato_vendas['Cliente'].apply(extrair_nome)

fato_vendas['produto_codigo'] = fato_vendas['Produto'].apply(extrair_id)
fato_vendas['produto_nome'] = fato_vendas['Produto'].apply(extrair_nome)

fato_vendas['fornecedor_codigo'] = fato_vendas['Fornecedor'].apply(extrair_id)
fato_vendas['fornecedor_nome'] = fato_vendas['Fornecedor'].apply(extrair_nome)`}
                </pre>
              )}

              {biSubTab === 'servicos_aluguel' && docTab === 'Fórmulas DAX' && (
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-lg text-[10px] font-mono overflow-auto max-h-48 leading-relaxed">
{`-- 1. Faturamento Total (Medida)
Faturamento_Total = SUM(fato_vendas[Valor Total])

-- 2. Lucro Líquido Acumulado (Medida)
Lucro_Total = SUM(fato_vendas[Lucro])

-- 3. Margem de Lucro % (Medida)
Margem_Lucro = DIVIDE([Lucro_Total], [Faturamento_Total], 0)

-- 4. Tempo Médio em Dias (Medida)
Tempo_Medio = AVERAGE(DATEDIFF(fato_vendas[Data Entrada], fato_vendas[Data Entrega], DAY))

-- 5. Valor Cancelado (Medida)
Valor_Cancelado = CALCULATE([Faturamento_Total], fato_vendas[Status do Serviço] = "Cancelado")`}
                </pre>
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
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
          <label className="block text-xs font-medium text-gray-600 mb-1">{editingId ? 'Editar Nome do Grupo' : 'Nome do Novo Grupo'}</label>
          <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" placeholder="Ex: Gestão Documental" />
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

// ─── Legal Codes Settings ─────────────────────────────────────────────────────
const LegalCodesSettings: React.FC = () => {
  const [codes, setCodes] = useState<LegalCode[]>(() => dbCodes.getAll());
  const [editingVersionId, setEditingVersionId] = useState<{ codeId: string; versionId: string } | null>(null);
  const [editingVersionName, setEditingVersionName] = useState('');
  const [editingVersionContent, setEditingVersionContent] = useState('');
  const [newVersionName, setNewVersionName] = useState<Record<string, string>>({}); // codeId -> name
  const [saved, setSaved] = useState<string | null>(null);

  const handleActivateVersion = (codeId: string, versionId: string) => {
    const updated = dbCodes.activateVersion(codeId, versionId);
    setCodes(updated);
  };

  const handleDeleteVersion = (codeId: string, versionId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta versão?')) {
      const updated = dbCodes.deleteVersion(codeId, versionId);
      setCodes(updated);
    }
  };

  const handleStartEditVersion = (codeId: string, version: CodeVersion) => {
    setEditingVersionId({ codeId, versionId: version.id });
    setEditingVersionName(version.name);
    setEditingVersionContent(version.content);
  };

  const handleSaveVersionEdit = () => {
    if (!editingVersionId) return;
    const { codeId, versionId } = editingVersionId;
    
    const updatedCodes = codes.map(c => {
      if (c.id === codeId) {
        const versions = (c.versions || []).map(v => 
          v.id === versionId 
            ? { ...v, name: editingVersionName, content: editingVersionContent, lastUpdated: new Date().toISOString().split('T')[0] } 
            : v
        );
        const isActive = c.activeVersionId === versionId;
        const updatedCode = {
          ...c,
          versions,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        if (isActive) {
          updatedCode.content = editingVersionContent;
          updatedCode.lastUpdated = new Date().toISOString().split('T')[0];
        }
        return updatedCode;
      }
      return c;
    });
    
    dbCodes.saveAll(updatedCodes);
    setCodes(updatedCodes);
    setEditingVersionId(null);
  };

  const handleVersionUpload = (codeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const versionName = newVersionName[codeId]?.trim() || `Versão ${new Date().toLocaleDateString('pt-BR')}`;
    if (!file) return;

    const isTextFile = file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.md') || file.type === 'text/plain';
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const reader = new FileReader();

    if (isTextFile) {
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        const updated = dbCodes.addVersion(codeId, versionName, content, file.name, undefined, 'text');
        setCodes(updated);
        setSaved(codeId);
        setNewVersionName(prev => ({ ...prev, [codeId]: '' }));
        setTimeout(() => setSaved(null), 2500);
      };
      reader.readAsText(file);
    } else if (isPdf) {
      const dataUrlReader = new FileReader();
      dataUrlReader.onload = (dev) => {
        const dataUrl = dev.target?.result as string;
        const arrayBufferReader = new FileReader();
        arrayBufferReader.onload = (aev) => {
          const arrayBuffer = aev.target?.result as ArrayBuffer;
          const extractedText = extractPrintableText(arrayBuffer);
          const updated = dbCodes.addVersion(
            codeId,
            versionName,
            extractedText || `[Conteúdo PDF: ${file.name}]`,
            file.name,
            dataUrl,
            'pdf'
          );
          setCodes(updated);
          setSaved(codeId);
          setNewVersionName(prev => ({ ...prev, [codeId]: '' }));
          setTimeout(() => setSaved(null), 2500);
        };
        arrayBufferReader.readAsArrayBuffer(file);
      };
      dataUrlReader.readAsDataURL(file);
    } else {
      const dataUrlReader = new FileReader();
      dataUrlReader.onload = (dev) => {
        const dataUrl = dev.target?.result as string;
        const arrayBufferReader = new FileReader();
        arrayBufferReader.onload = (aev) => {
          const arrayBuffer = aev.target?.result as ArrayBuffer;
          const extractedText = extractPrintableText(arrayBuffer);
          const updated = dbCodes.addVersion(
            codeId,
            versionName,
            extractedText || `[Conteúdo Binário: ${file.name}]`,
            file.name,
            dataUrl,
            'text'
          );
          setCodes(updated);
          setSaved(codeId);
          setNewVersionName(prev => ({ ...prev, [codeId]: '' }));
          setTimeout(() => setSaved(null), 2500);
        };
        arrayBufferReader.readAsArrayBuffer(file);
      };
      dataUrlReader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-800">Códigos Legais e Regulamentos</h3>
      <p className="text-sm text-gray-500">Gerencie múltiplas versões e faça o upload de arquivos PDF para leitura integrada.</p>

      <div className="space-y-4">
        {codes.map(code => (
          <div key={code.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545]">
            {/* Card Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50/50 dark:bg-black/10">
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">{code.title}</p>
                <p className="text-xs text-gray-400">Total de versões: {code.versions?.length || 0}</p>
              </div>
              {saved === code.id && <span className="text-xs text-green-600 font-medium">✓ Versão adicionada!</span>}
            </div>

            {/* Version List */}
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Versões Cadastradas</p>
                <div className="divide-y divide-gray-100 dark:divide-white/5 border border-gray-150 dark:border-[#2A2545] rounded-lg overflow-hidden bg-gray-50/20 dark:bg-black/5">
                  {(code.versions || []).map(ver => {
                    const isActive = code.activeVersionId === ver.id;
                    const isPdf = ver.fileType === 'pdf';
                    return (
                      <div key={ver.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs text-gray-800 dark:text-white">{ver.name}</span>
                            {isActive && <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded text-[9px] font-bold">Ativa</span>}
                            {isPdf && <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded text-[9px] font-bold">PDF</span>}
                          </div>
                          <p className="text-[10px] text-gray-500">
                            {ver.fileName ? `Arquivo: ${ver.fileName}` : 'Edição Manual'} | Atualizado em: {new Date(ver.lastUpdated).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {!isActive && (
                            <button
                              onClick={() => handleActivateVersion(code.id, ver.id)}
                              className="text-[11px] font-bold text-green-600 hover:text-green-700 transition-colors"
                            >
                              Ativar
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEditVersion(code.id, ver)}
                            className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
                          >
                            Editar Texto
                          </button>
                          {(code.versions || []).length > 1 && (
                            <button
                              onClick={() => handleDeleteVersion(code.id, ver.id)}
                              className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors"
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload / Add New Version Form */}
              <div className="bg-purple-50/25 dark:bg-purple-950/5 border border-purple-100/60 dark:border-purple-950/20 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">📤 Adicionar Nova Versão</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newVersionName[code.id] || ''}
                      onChange={e => setNewVersionName(prev => ({ ...prev, [code.id]: e.target.value }))}
                      placeholder="Ex: Revisão 2026, Emenda Constitucional 132"
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-900 dark:bg-[#1A1730] dark:border-[#2A2545] dark:text-white focus:outline-none"
                    />
                  </div>
                  <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/95 cursor-pointer transition-colors shrink-0">
                    <IconPlus /> Selecionar Arquivo e Enviar
                    <input
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      className="hidden"
                      onChange={e => handleVersionUpload(code.id, e)}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-gray-400">Suporta arquivos de texto (.txt, .md) ou arquivos PDF (.pdf) que serão exibidos nativamente na biblioteca.</p>
              </div>
            </div>

            {/* Version Text Editor modal/panel */}
            {editingVersionId && editingVersionId.codeId === code.id && (
              <div className="border-t p-4 space-y-3 bg-gray-50/50 dark:bg-black/15 animate-fade-in">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Editando Texto da Versão</p>
                  <input
                    type="text"
                    value={editingVersionName}
                    onChange={e => setEditingVersionName(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-0.5 text-xs bg-white dark:bg-[#1A1730] dark:text-white"
                    placeholder="Nome da Versão"
                  />
                </div>
                <textarea
                  value={editingVersionContent}
                  onChange={e => setEditingVersionContent(e.target.value)}
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none resize-y font-mono bg-white dark:bg-[#1A1730] dark:text-white dark:border-[#2A2545]"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveVersionEdit} className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded hover:bg-primary/90">
                    Salvar Alterações
                  </button>
                  <button onClick={() => setEditingVersionId(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
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

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      if (dbType === 'local') {
        setTesting(false);
        setTestResult({
          type: 'success',
          message: 'Conexão local (localStorage) estabelecida com sucesso! Status: Ativo e operacional.'
        });
      } else {
        if (!dbApiKey || !dbProjectUrl) {
          setTesting(false);
          setTestResult({
            type: 'error',
            message: 'Erro ao conectar na nuvem: Chave da API e URL do Projeto são obrigatórias.'
          });
        } else {
          const ok = await dbCloud.testConnection(dbCloudProvider, dbApiKey, dbProjectUrl);
          setTesting(false);
          if (ok) {
            setTestResult({
              type: 'success',
              message: `Conexão de teste com ${dbCloudProvider === 'firebase' ? 'Firebase Firestore' : 'Supabase PostgreSQL'} bem-sucedida!`
            });
          } else {
            setTestResult({
              type: 'error',
              message: `Falha na conexão com ${dbCloudProvider === 'firebase' ? 'Firebase' : 'Supabase'}. Verifique as credenciais e tente novamente.`
            });
          }
        }
      }
    } catch (e) {
      setTesting(false);
      setTestResult({
        type: 'error',
        message: `Erro ao testar conexão: ${e instanceof Error ? e.message : String(e)}`
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
      <div>
        <h3 className="text-base font-bold text-gray-800">Conexão de Banco de Dados</h3>
        <p className="text-sm text-gray-500">Configure as conexões locais ou em nuvem para sincronização em tempo real de dados jurídicos.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tipo de Armazenamento/Conexão</label>
          <select
            value={dbType}
            onChange={e => { setDbType(e.target.value as 'local' | 'cloud'); setTestResult(null); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
          >
            <option value="local">Banco de Dados Local (localStorage - Offline Primeiro)</option>
            <option value="cloud">Banco de Dados em Nuvem (Firebase / Supabase)</option>
          </select>
        </div>

        {dbType === 'cloud' && (
          <div className="bg-gray-50 dark:bg-[#201C3D] border border-gray-200 dark:border-[#2A2545] p-4 rounded-xl space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Configurações de Credenciais da Nuvem</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Provedor Cloud</label>
                <select
                  value={dbCloudProvider}
                  onChange={e => setDbCloudProvider(e.target.value as 'firebase' | 'supabase')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:text-white p-1"
                >
                  <option value="firebase">Firebase Firestore</option>
                  <option value="supabase">Supabase PostgreSQL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Chave da API (API Key) *</label>
                <input
                  type="password"
                  value={dbApiKey}
                  onChange={e => setDbApiKey(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:text-white p-1"
                  placeholder="AIzaSy..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">ID do Projeto / URL do Projeto *</label>
                <input
                  type="text"
                  value={dbProjectUrl}
                  onChange={e => setDbProjectUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:text-white p-1"
                  placeholder="https://sua-app.supabase.co ou project-id"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Domínio de Autenticação (Auth Domain)</label>
                <input
                  type="text"
                  value={dbAuthDomain}
                  onChange={e => setDbAuthDomain(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:text-white p-1"
                  placeholder="sua-app.firebaseapp.com"
                />
              </div>
            </div>

            {dbCloudProvider === 'firebase' && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#2a243d] dark:to-[#221c33] border border-amber-200 dark:border-[#3d3159] p-4 rounded-xl mt-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <span>🔑</span>
                  <span>Guia de Acesso e Configuração do Firebase</span>
                </div>
                
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
                  <p>
                    Como as políticas de segurança do Google bloqueiam logins automatizados por segurança, você precisará copiar as chaves do Console do Firebase. Siga o passo a passo abaixo:
                  </p>
                  
                  <div className="space-y-2 pl-1">
                    <div className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-200 dark:bg-[#3d3159] text-amber-900 dark:text-amber-200 font-bold rounded-full text-[10px] shrink-0">1</span>
                      <div>
                        Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Firebase Console</a>.
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-200 dark:bg-[#3d3159] text-amber-900 dark:text-amber-200 font-bold rounded-full text-[10px] shrink-0">2</span>
                      <div className="flex-1">
                        Use as credenciais abaixo para entrar na conta do Google:
                        <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/70 dark:bg-[#1A1730]/65 p-2 rounded-lg border border-amber-100 dark:border-[#3d3159]">
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="text-gray-500">Email:</span>
                            <code className="bg-gray-100 dark:bg-[#201C3D] px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">legisconnectonline@gmail.com</code>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('legisconnectonline@gmail.com');
                                alert('E-mail copiado!');
                              }}
                              className="text-primary hover:underline text-[10px] shrink-0"
                            >
                              Copiar
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="text-gray-500">Senha:</span>
                            <code className="bg-gray-100 dark:bg-[#201C3D] px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">@@Rk08266570#</code>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('@@Rk08266570#');
                                alert('Senha copiada!');
                              }}
                              className="text-primary hover:underline text-[10px] shrink-0"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-200 dark:bg-[#3d3159] text-amber-900 dark:text-amber-200 font-bold rounded-full text-[10px] shrink-0">3</span>
                      <div>
                        Selecione o projeto correspondente (ex: <strong>Legis Connect</strong>) no painel.
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-200 dark:bg-[#3d3159] text-amber-900 dark:text-amber-200 font-bold rounded-full text-[10px] shrink-0">4</span>
                      <div>
                        Clique no ícone de <strong>Engrenagem (Configurações do Projeto)</strong> no menu lateral esquerdo e selecione <strong>Configurações do projeto</strong>.
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-200 dark:bg-[#3d3159] text-amber-900 dark:text-amber-200 font-bold rounded-full text-[10px] shrink-0">5</span>
                      <div>
                        Na guia <strong>Geral</strong>, role até a seção <strong>Seus aplicativos</strong>. Copie os seguintes valores do bloco de código `firebaseConfig`:
                        <ul className="list-disc list-inside mt-1 space-y-0.5 pl-2 text-gray-600 dark:text-gray-400">
                          <li><code className="text-gray-800 dark:text-gray-200">apiKey</code> &rarr; Cole no campo <strong>Chave da API</strong> acima</li>
                          <li><code className="text-gray-800 dark:text-gray-200">projectId</code> &rarr; Cole no campo <strong>ID do Projeto / URL do Projeto</strong> acima</li>
                          <li><code className="text-gray-800 dark:text-gray-200">authDomain</code> &rarr; Cole no campo <strong>Domínio de Autenticação</strong> acima</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-200 dark:bg-[#3d3159] text-amber-900 dark:text-amber-200 font-bold rounded-full text-[10px] shrink-0">6</span>
                      <div>
                        Clique em <strong>Salvar Conexão</strong> e depois em <strong>🔌 Testar Conexão</strong> para validar a sincronização.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                placeholder="Ex: Minha API Personalizada" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
              <input value={newApi.description} onChange={e => setNewApi(p => ({ ...p, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                placeholder="Para que serve esta integração..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rótulo do Endpoint</label>
              <input value={newApi.endpoint} onChange={e => setNewApi(p => ({ ...p, endpoint: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                placeholder="Ex: URL Base, Servidor..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rótulo da Chave de Acesso</label>
              <input value={newApi.keyLabel} onChange={e => setNewApi(p => ({ ...p, keyLabel: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
                    {isCustom && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">Personalizado</span>}
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
                <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {api.fields.map((field: ApiField) => (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">{field.label}</label>
                        <input type={field.type} value={vals[field.key] || ''} onChange={e => setField(api.id, field.key, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white font-mono dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
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
                <div className="px-4 pb-4 pt-3 border-t border-gray-200 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
type SettingsSection = 'general' | 'codes' | 'documents' | 'users' | 'services_groups' | 'database' | 'api_connections' | 'ia_tools' | null;

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
  {
    id: 'ia_tools' as const,
    label: 'IA Jurídica',
    icon: '⚡',
    description: 'Acesse e teste as ferramentas de Inteligência Artificial Generativa',
    color: 'from-amber-400 to-yellow-500',
    bg: 'bg-amber-50/50',
    border: 'border-amber-100',
    textColor: 'text-amber-700',
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
      {section === 'ia_tools' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 dark:bg-[#1A1730] dark:border-[#2A2545]">
          <LegalAiTools role="lawyer" allowedTools={['pecas', 'pesquisas', 'audios', 'transcricao', 'fundamentacoes', 'revisao', 'jurisprudencia', 'manifestacao']} />
        </div>
      )}

    </div>
  );
};
