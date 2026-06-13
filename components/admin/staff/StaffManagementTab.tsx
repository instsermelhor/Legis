import React, { useState, useEffect } from 'react';
import { StaffService } from '../../../services/staffService';
import { ROLE_LABELS, ROLE_PERMISSIONS } from '../../../security/rbac';
import type { PlatformStaff, StaffRole } from '../../../types';

// ─── Constantes ───────────────────────────────────────────────────────────────
const ROLE_OPTIONS: { value: StaffRole; label: string; color: string; desc: string }[] = [
  {
    value: 'super_admin',
    label: '👑 Super Administrador',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    desc: 'Acesso total + Modo Espelho (Impersonation)',
  },
  {
    value: 'admin',
    label: '🛡️ Administrador',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    desc: 'Gestão operacional completa',
  },
  {
    value: 'staff_compliance_auditor',
    label: '🔍 Auditor de Compliance',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    desc: 'Logs de auditoria imutáveis, OAB check, denúncias',
  },
  {
    value: 'staff_finance_admin',
    label: '💰 Gestor Financeiro',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    desc: 'Faturamento, chargebacks, notas fiscais — SEM acesso a processos',
  },
  {
    value: 'staff_support_l1',
    label: '🎧 Suporte L1',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
    desc: 'Apenas cadastros básicos e logs de erro — SEM dados financeiros',
  },
];

const DEPT_OPTIONS = [
  'Diretoria', 'Financeiro', 'Compliance & Jurídico', 'Atendimento ao Cliente',
  'Tecnologia', 'Marketing', 'Operações', 'RH',
];

// ─── Componente Badge de Role ─────────────────────────────────────────────────
const RoleBadge: React.FC<{ role: StaffRole }> = ({ role }) => {
  const option = ROLE_OPTIONS.find(r => r.value === role);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${option?.color || 'bg-gray-100 text-gray-700'}`}>
      {option?.label || role}
    </span>
  );
};

// ─── Formulário de Criação/Edição ─────────────────────────────────────────────
interface StaffFormProps {
  initial?: PlatformStaff;
  onSave: () => void;
  onCancel: () => void;
  actorId: string;
}

const StaffForm: React.FC<StaffFormProps> = ({ initial, onSave, onCancel, actorId }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    password: '',
    role: initial?.role || 'staff_support_l1' as StaffRole,
    department: initial?.department || 'Atendimento ao Cliente',
    phone: initial?.phone || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!form.name.trim() || !form.email.trim()) {
      setError('Nome e e-mail são obrigatórios.');
      setSaving(false);
      return;
    }

    if (!initial && !form.password) {
      setError('Senha é obrigatória para novos colaboradores.');
      setSaving(false);
      return;
    }

    if (!initial) {
      const result = StaffService.create({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        department: form.department,
        phone: form.phone,
        createdBy: actorId,
      });
      if (!result.success) { setError(result.error || 'Erro ao criar colaborador.'); setSaving(false); return; }
    } else {
      StaffService.update(initial.id, {
        name: form.name,
        phone: form.phone,
        department: form.department,
        role: form.role,
      }, actorId);
    }

    setSaving(false);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo *</label>
          <input
            type="text" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="Ex: João Silva" required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail *</label>
          <input
            type="email" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            disabled={!!initial}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 disabled:opacity-60"
            placeholder="colaborador@legisconnect.com.br" required
          />
        </div>
        {!initial && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha Inicial *</label>
            <input
              type="password" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500"
              placeholder="Mínimo 8 caracteres" minLength={8} required
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
          <input
            type="tel" value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm"
            placeholder="(11) 99999-0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departamento *</label>
          <select
            value={form.department}
            onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm"
          >
            {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Seleção de Role com descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nível de Acesso (Role) *</label>
        <div className="grid grid-cols-1 gap-2">
          {ROLE_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                form.role === opt.value
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-violet-300'
              }`}
            >
              <input
                type="radio" name="role" value={opt.value}
                checked={form.role === opt.value}
                onChange={() => setForm(p => ({ ...p, role: opt.value }))}
                className="mt-0.5 accent-violet-600"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{opt.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Permissões da role selecionada */}
      <div className="bg-gray-50 dark:bg-[#1A1730] rounded-lg p-3">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Permissões desta role:</p>
        <div className="flex flex-wrap gap-1">
          {(ROLE_PERMISSIONS[form.role] || []).map(perm => (
            <span key={perm} className="px-2 py-0.5 bg-white dark:bg-[#12102A] border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-700 dark:text-gray-300">
              {perm}
            </span>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button" onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          Cancelar
        </button>
        <button
          type="submit" disabled={saving}
          className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition"
        >
          {saving ? 'Salvando...' : initial ? 'Salvar Alterações' : 'Criar Colaborador'}
        </button>
      </div>
    </form>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
interface StaffManagementTabProps {
  actorId?: string;
}

export const StaffManagementTab: React.FC<StaffManagementTabProps> = ({ actorId = 'admin' }) => {
  const [staff, setStaff] = useState<PlatformStaff[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<PlatformStaff | undefined>();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<StaffRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const loadStaff = () => setStaff(StaffService.getAll());

  useEffect(() => { loadStaff(); }, []);

  const filtered = staff.filter(s => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || s.role === roleFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? s.active : !s.active);
    return matchSearch && matchRole && matchStatus;
  });

  const stats = StaffService.getStats();

  const handleToggleActive = (s: PlatformStaff) => {
    if (!confirm(`${s.active ? 'Desativar' : 'Ativar'} o colaborador ${s.name}?`)) return;
    StaffService.setActive(s.id, !s.active, actorId);
    loadStaff();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestão de Equipe Interna</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Matriz RBAC de colaboradores da plataforma Legis Connect
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Colaborador
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900 dark:text-white' },
          { label: 'Ativos', value: stats.active, color: 'text-green-600 dark:text-green-400' },
          { label: 'Inativos', value: stats.inactive, color: 'text-red-600 dark:text-red-400' },
          { label: 'Super Admin', value: stats.byRole['super_admin'] || 0, color: 'text-purple-600 dark:text-purple-400' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-[#12102A] rounded-xl border border-gray-200 dark:border-[#2A2545] p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Modal de criação/edição */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12102A] rounded-2xl border border-gray-200 dark:border-[#2A2545] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editTarget ? `✏️ Editar: ${editTarget.name}` : '👤 Novo Colaborador Interno'}
            </h3>
            <StaffForm
              initial={editTarget}
              actorId={actorId}
              onSave={() => { setShowForm(false); loadStaff(); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text" placeholder="Buscar por nome, e-mail ou departamento..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm"
        />
        <select
          value={roleFilter} onChange={e => setRoleFilter(e.target.value as StaffRole | '')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm"
        >
          <option value="">Todas as Roles</option>
          {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>

      {/* Tabela de Staff */}
      <div className="bg-white dark:bg-[#12102A] rounded-xl border border-gray-200 dark:border-[#2A2545] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#2A2545] bg-gray-50 dark:bg-[#1A1730]">
                {['Colaborador', 'Role', 'Departamento', 'Último Login', 'Status', 'Ações'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#1E1B3A]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                    Nenhum colaborador encontrado.
                  </td>
                </tr>
              ) : filtered.map(s => (
                <tr key={s.id} className={`transition hover:bg-gray-50 dark:hover:bg-[#1A1730] ${!s.active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={s.role} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{s.department}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {s.lastLogin
                      ? new Date(s.lastLogin).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                      : 'Nunca'}
                    <br />
                    <span className="text-gray-400">{s.loginCount || 0} logins</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {s.active ? '● Ativo' : '○ Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditTarget(s); setShowForm(true); }}
                        className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`text-xs px-2 py-1 rounded transition ${
                          s.active
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100'
                            : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                        }`}
                      >
                        {s.active ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 dark:border-[#2A2545] text-xs text-gray-400">
          {filtered.length} de {staff.length} colaboradores exibidos
        </div>
      </div>
    </div>
  );
};
