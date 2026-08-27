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

export const AdminUsers: React.FC = () => {
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

  // Edit user modal state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    secondaryEmail: '',
    confirmSecondaryEmail: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

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

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || '',
      phone: u.phone || '',
      secondaryEmail: u.secondaryEmail || '',
      confirmSecondaryEmail: u.secondaryEmail || '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setEditErrors({});
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    const errors: Record<string, string> = {};
    if (!editForm.name.trim()) errors.name = 'Nome obrigatório';
    if (editForm.secondaryEmail && editForm.secondaryEmail !== editForm.confirmSecondaryEmail) {
      errors.confirmSecondaryEmail = 'E-mails secundários não coincidem';
    }
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmNewPassword) {
      errors.confirmNewPassword = 'As senhas não coincidem';
    }
    if (editForm.phone && !/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(editForm.phone.replace(/\s/g, ''))) {
      errors.phone = 'Número inválido (ex: (11) 99999-9999)';
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    const updated = users.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          name: editForm.name.trim(),
          phone: editForm.phone.trim() || undefined,
          secondaryEmail: editForm.secondaryEmail.trim() || undefined,
          password: editForm.newPassword ? hashPassword(editForm.newPassword) : u.password,
        };
      }
      return u;
    });

    saveUsers(updated);
    setEditingUser(null);
    setEditErrors({});
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

      {saved && <p className="text-sm text-green-600 font-medium bg-green-50 border border-green-200 rounded-lg px-3 py-2"><Icon name="✓" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Usuário criado com sucesso!</p>}

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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base"><Icon name="📱" className="w-4 h-4 inline-block mr-1 align-text-bottom" /></span>
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
            <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5"><Icon name="✉" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" />️ E-mail Secundário <span className="font-normal text-gray-400">(opcional — usado para reset de senha)</span></p>
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
                      <p className="text-xs text-gray-600"><Icon name="📧" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> {u.email}</p>
                      {u.secondaryEmail && <p className="text-xs text-gray-400"><Icon name="✉" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" />️ {u.secondaryEmail}</p>}
                      {u.phone && <p className="text-xs text-green-600"><Icon name="📱" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> {u.phone}</p>}
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
                          onClick={() => openEdit(u)}
                          className="text-xs font-semibold px-2 py-1 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          ⚙️ Editar
                        </button>
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
                      <div className="flex gap-1.5 justify-center flex-wrap">
                        <button
                          onClick={() => openEdit(u)}
                          className="text-xs font-semibold px-2 py-1 rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                        >
                          ⚙️ Editar Acesso
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

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL: Password Reset
      ──────────────────────────────────────────────────────────────────────── */}
      {resetUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setResetUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <div>
                <h2 className="text-base font-bold text-gray-900"><Icon name="🔒" className="w-4 h-4 inline-block mr-1 align-text-bottom" /> Resetar Senha</h2>
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
                      <p className="text-sm font-semibold text-gray-800"><Icon name="📧" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> E-mail Principal</p>
                      <p className="text-xs text-gray-500 truncate">{resetUser.email}</p>
                    </div>
                  </label>

                  {/* E-mail Secundário */}
                  <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${!resetUser.secondaryEmail ? 'opacity-40 cursor-not-allowed' : resetMethod === 'secondary' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="resetMethod" value="secondary" disabled={!resetUser.secondaryEmail}
                      checked={resetMethod === 'secondary'} onChange={() => setResetMethod('secondary')} className="accent-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800"><Icon name="✉" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" />️ E-mail Secundário</p>
                      <p className="text-xs text-gray-500 truncate">{resetUser.secondaryEmail || 'Não cadastrado'}</p>
                    </div>
                  </label>

                  {/* SMS */}
                  <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${!resetUser.phone ? 'opacity-40 cursor-not-allowed' : resetMethod === 'sms' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="resetMethod" value="sms" disabled={!resetUser.phone}
                      checked={resetMethod === 'sms'} onChange={() => setResetMethod('sms')} className="accent-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800"><Icon name="💬" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> SMS</p>
                      <p className="text-xs text-gray-500 truncate">{resetUser.phone || 'Não cadastrado'}</p>
                    </div>
                  </label>

                  {/* WhatsApp */}
                  <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${!resetUser.phone ? 'opacity-40 cursor-not-allowed' : resetMethod === 'whatsapp' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                    <input type="radio" name="resetMethod" value="whatsapp" disabled={!resetUser.phone}
                      checked={resetMethod === 'whatsapp'} onChange={() => setResetMethod('whatsapp')} className="accent-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800"><Icon name="📱" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> WhatsApp</p>
                      <p className="text-xs text-gray-500 truncate">{resetUser.phone || 'Não cadastrado'}</p>
                    </div>
                  </label>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-amber-800 font-medium">
                    <Icon name="⚠" className="w-4 h-4 inline-block mr-1 align-text-bottom" />️ Um link seguro de redefinição de senha será enviado para: <strong>{resetMethodLabel(resetUser)[resetMethod]}</strong>
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
                <div className="text-5xl"><Icon name="✅" className="w-4 h-4 inline-block mr-1 align-text-bottom" /></div>
                <p className="text-base font-bold text-gray-800">Link enviado com sucesso!</p>
                <p className="text-sm text-gray-500">O link de redefinição foi enviado para <strong>{resetMethodLabel(resetUser)[resetMethod]}</strong>.</p>
                <p className="text-xs text-gray-400">O link expira em 24 horas por segurança.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL: Edit Admin User (Edit Access)
      ──────────────────────────────────────────────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2A2545]">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white"><Icon name="⚙" className="w-4 h-4 inline-block mr-1 align-text-bottom" />️ Editar Acesso</h2>
                <p className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">Usuário: <strong>{editingUser.email}</strong></p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Name */}
              <Field label="Nome *" error={editErrors.name}>
                <input value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] p-2"
                  placeholder="Nome completo" />
              </Field>

              {/* Phone */}
              <Field label="Celular / WhatsApp" error={editErrors.phone}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base"><Icon name="📱" className="w-4 h-4 inline-block mr-1 align-text-bottom" /></span>
                  <input value={editForm.phone} onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] p-2"
                    placeholder="(11) 99999-9999" />
                </div>
              </Field>

              {/* Secondary Email section */}
              <div className="bg-blue-50/50 border border-dashed border-blue-200 rounded-xl p-3 space-y-3 dark:bg-purple-950/20 dark:border-purple-900">
                <p className="text-xs font-bold text-blue-800 dark:text-purple-300 flex items-center gap-1.5"><Icon name="✉" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" />️ E-mail Secundário <span className="font-normal text-gray-400 dark:text-gray-500">(usado para recuperar a senha em caso de esquecimento)</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="E-mail Secundário" error={editErrors.secondaryEmail}>
                    <input type="email" value={editForm.secondaryEmail} onChange={e => setEditForm(prev => ({ ...prev, secondaryEmail: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] p-2"
                      placeholder="email.secundario@exemplo.com" />
                  </Field>
                  <Field label="Confirmar E-mail Secundário" error={editErrors.confirmSecondaryEmail}>
                    <input type="email" value={editForm.confirmSecondaryEmail} onChange={e => setEditForm(prev => ({ ...prev, confirmSecondaryEmail: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] p-2"
                      placeholder="Confirmar e-mail secundário" />
                  </Field>
                </div>
              </div>

              {/* Password Section (Optional) */}
              <div className="bg-amber-50/50 border border-dashed border-amber-200 rounded-xl p-3 space-y-3 dark:bg-amber-950/10 dark:border-amber-900">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5"><Icon name="🔒" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Nova Senha <span className="font-normal text-gray-400 dark:text-gray-500">(deixe em branco para manter a atual)</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Nova Senha" error={editErrors.newPassword}>
                    <input type="password" value={editForm.newPassword} onChange={e => setEditForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] p-2"
                      placeholder="Nova senha" />
                  </Field>
                  <Field label="Confirmar Nova Senha" error={editErrors.confirmNewPassword}>
                    <input type="password" value={editForm.confirmNewPassword} onChange={e => setEditForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] p-2"
                      placeholder="Confirmar nova senha" />
                  </Field>
                </div>
              </div>

              {/* Save / Cancel buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-[#2A2545]">
                <button onClick={handleSaveEdit}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow">
                  💾 Salvar Alterações
                </button>
                <button onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold dark:bg-[#2A2545] dark:text-gray-300 dark:hover:bg-[#3A355A]">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL: Per-user permission manager
      ──────────────────────────────────────────────────────────────────────── */}
      {permUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPermUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <div>
                <h2 className="text-base font-bold text-gray-900"><Icon name="🔑" className="w-4 h-4 inline-block mr-1 align-text-bottom" /> Permissões — {permUser.name}</h2>
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
                <h2 className="text-base font-bold text-white"><Icon name="🛡" className="w-4 h-4 inline-block mr-1 align-text-bottom" />️ Painel do Super Admin</h2>
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
                <Icon name="👤" className="w-4 h-4 inline-block mr-1 align-text-bottom" /> Usuários ({users.filter(u => u.role !== 'super').length})
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
                          <p className="text-xs text-gray-500 mt-0.5 truncate"><Icon name="📧" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> {u.email}{u.phone ? ` · <Icon name="📱" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> ${u.phone}` : ''}</p>
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

