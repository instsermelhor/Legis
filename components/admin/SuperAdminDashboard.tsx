// ─────────────────────────────────────────────────────────────────────────────
// components/admin/SuperAdminDashboard.tsx
// Painel do Super Administrador Universal
// Visão geral de governança, acesso a todos os módulos, delegações e sessões
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import type { View, User } from '../../types';
import { StaffService } from '../../services/staffService';
import { AuditLogger } from '../../security/auditLogger';
import { getSecurityContext } from '../../security/scopeValidator';
import { isSuperAdminRole } from '../../security/rbac';
import type { SystemRole } from '../../security/rbac';

interface SuperAdminDashboardProps {
  onNavigate: (view: View) => void;
  onLogout: () => void;
  user: User | null;
}

type ActiveTab = 'overview' | 'staff' | 'sessions' | 'delegations' | 'audit' | 'security';

interface StaffStats {
  total: number;
  active: number;
  inactive: number;
  superAdmins: number;
  byRole: Record<string, number>;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actorId: string;
  actorRole: string;
  details: string;
  severity: string;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  staff_finance_admin: 'Financeiro',
  staff_compliance_auditor: 'Compliance',
  staff_support_l1: 'Suporte L1',
};

const SEVERITY_COLORS: Record<string, string> = {
  INFO: '#3b82f6',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  CRITICAL: '#dc2626',
};

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onNavigate,
  onLogout,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [staffList, setStaffList] = useState<ReturnType<typeof StaffService.getAll>>([]);
  const [delegations, setDelegations] = useState<ReturnType<typeof StaffService.listDelegations>>([]);
  const [confirmLogoutAll, setConfirmLogoutAll] = useState<string | null>(null);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);

  const ctx = getSecurityContext();
  const isSuperAdmin = user?.role === 'super_admin' || (ctx?.role && isSuperAdminRole(ctx.role as SystemRole));
  const currentStaff = user?.email ? StaffService.findByEmail(user.email) : null;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStats(StaffService.getStats());
    setStaffList(StaffService.getAll());
    setDelegations(StaffService.listDelegations());
    const logs = AuditLogger.getRecentLogs(100);
    setAuditEntries(logs as unknown as AuditEntry[]);
    if (currentStaff) {
      setIsMfaEnabled(currentStaff.mfaEnabled || false);
    }
  };

  const handleRevokeAllSessions = (userId: string) => {
    if (ctx) {
      StaffService.revokeAllSessions(userId, ctx.userId);
      setConfirmLogoutAll(null);
      loadData();
    }
  };

  const handleToggleStaffActive = (staffId: string, currentActive: boolean) => {
    if (!ctx) return;
    const result = StaffService.setActive(staffId, !currentActive, ctx.userId);
    if (!result.success) {
      alert(result.error);
    } else {
      loadData();
    }
  };

  const moduleCards = [
    { icon: '👥', title: 'Colaboradores', desc: `${stats?.active || 0} ativos`, action: () => setActiveTab('staff'), color: '#8b5cf6' },
    { icon: '🔑', title: 'Delegações', desc: `${delegations.filter(d => d.active).length} ativas`, action: () => setActiveTab('delegations'), color: '#f59e0b' },
    { icon: '🖥️', title: 'Sessões', desc: 'Monitorar acessos', action: () => setActiveTab('sessions'), color: '#06b6d4' },
    { icon: '📋', title: 'Auditoria', desc: `${auditEntries.length} eventos`, action: () => setActiveTab('audit'), color: '#10b981' },
    { icon: '⚙️', title: 'Painel Operacional', desc: 'Configurações gerais', action: () => onNavigate('adminDashboard'), color: '#6366f1' },
    { icon: '🛡️', title: 'Meu Perfil Admin', desc: 'Segurança pessoal', action: () => onNavigate('myAdminProfile'), color: '#ec4899' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #060410 0%, #0D0B1A 100%)' }}>
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-white/6"
        style={{ background: 'rgba(8,6,18,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25">
              <span className="text-xs text-amber-400">⭐</span>
              <span className="text-xs font-bold text-amber-300 tracking-wide">SUPER ADMIN UNIVERSAL</span>
            </div>
            <span className="hidden sm:block text-sm text-gray-400 font-medium">{user?.name || user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            {!isMfaEnabled && (
              <button
                onClick={() => onNavigate('mfaSetup')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-all"
              >
                ⚠️ Ativar MFA
              </button>
            )}
            <button
              onClick={() => onNavigate('myAdminProfile')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white border border-white/8 hover:border-white/20 transition-all"
            >
              Meu Perfil
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-montserrat font-bold text-white mb-1.5">
            Painel de Governança Global
          </h1>
          <p className="text-gray-500 text-sm">
            Legis Connect · Área Restrita · Controle Máximo de Plataforma
          </p>
        </div>

        {/* Alerta MFA desativado */}
        {!isMfaEnabled && (
          <div className="mb-6 flex items-center gap-3 px-5 py-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
            <span className="text-amber-400 text-xl shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-300">Segurança Recomendada: Ative o MFA</p>
              <p className="text-xs text-amber-500/80 mt-0.5">Proteja sua conta com autenticação de dois fatores (Google Authenticator).</p>
            </div>
            <button
              onClick={() => onNavigate('mfaSetup')}
              className="shrink-0 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all"
            >
              Configurar Agora
            </button>
          </div>
        )}

        {/* Tab navigation */}
        <nav className="flex gap-1 mb-8 flex-wrap">
          {([
            { id: 'overview',     label: '⬛ Visão Geral' },
            { id: 'staff',        label: '👥 Colaboradores' },
            { id: 'sessions',     label: '🖥️ Sessões' },
            { id: 'delegations',  label: '🔑 Delegações' },
            { id: 'audit',        label: '📋 Auditoria' },
            { id: 'security',     label: '🛡️ Segurança' },
          ] as { id: ActiveTab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Colaboradores', value: stats?.total || 0, sub: `${stats?.active || 0} ativos`, icon: '👥', color: '#8b5cf6' },
                { label: 'Super Admins', value: stats?.superAdmins || 0, sub: 'com acesso total', icon: '⭐', color: '#f59e0b' },
                { label: 'Delegações Ativas', value: delegations.filter(d => d.active).length, sub: 'de acesso', icon: '🔑', color: '#06b6d4' },
                { label: 'Eventos de Auditoria', value: auditEntries.length, sub: 'registrados', icon: '📋', color: '#10b981' },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl border border-white/7 p-5"
                  style={{ background: 'rgba(15,12,30,0.8)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                  <div className="text-xs font-medium mt-1" style={{ color: stat.color }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Module cards */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Acesso Rápido</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {moduleCards.map(card => (
                  <button key={card.title} onClick={card.action}
                    className="text-left rounded-2xl border border-white/7 p-5 hover:border-white/15 hover:scale-[1.02] transition-all group"
                    style={{ background: 'rgba(15,12,30,0.8)' }}>
                    <div className="text-3xl mb-3">{card.icon}</div>
                    <div className="font-semibold text-white text-sm mb-1 group-hover:text-opacity-100">{card.title}</div>
                    <div className="text-xs text-gray-500">{card.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Audit recentes */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Últimos Eventos de Segurança</h2>
              <div className="rounded-2xl border border-white/7 overflow-hidden" style={{ background: 'rgba(15,12,30,0.8)' }}>
                {auditEntries.slice(0, 5).map((entry, i) => (
                  <div key={entry.id || i} className={`px-5 py-3.5 flex items-center gap-4 ${i < 4 ? 'border-b border-white/5' : ''}`}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SEVERITY_COLORS[entry.severity] || '#6b7280' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate">{entry.details || entry.action}</p>
                      <p className="text-xs text-gray-600">{entry.actorId} · {new Date(entry.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-md shrink-0"
                      style={{ color: SEVERITY_COLORS[entry.severity], background: `${SEVERITY_COLORS[entry.severity]}15` }}>
                      {entry.severity}
                    </span>
                  </div>
                ))}
                {auditEntries.length === 0 && (
                  <div className="px-5 py-8 text-center text-gray-600 text-sm">Nenhum evento registrado.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STAFF ──────────────────────────────────────────────────────── */}
        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Colaboradores da Plataforma</h2>
              {isSuperAdmin && (
                <button
                  onClick={() => onNavigate('delegationManager')}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-all"
                >
                  + Nova Delegação
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-white/7 overflow-hidden" style={{ background: 'rgba(15,12,30,0.8)' }}>
              {staffList.map((staff, i) => (
                <div key={staff.id} className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 ${i < staffList.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">{staff.name}</span>
                      {staff.role === 'super_admin' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/20">
                          ⭐ SUPER ADMIN
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${staff.active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                        {staff.active ? '● Ativo' : '○ Inativo'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{staff.email} · {ROLE_LABELS[staff.role] || staff.role} · {staff.department}</p>
                    <p className="text-xs text-gray-700 mt-0.5">Último login: {staff.lastLogin ? new Date(staff.lastLogin).toLocaleString('pt-BR') : 'Nunca'}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleToggleStaffActive(staff.id, staff.active)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          staff.active
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                        }`}
                      >
                        {staff.active ? 'Desativar' : 'Ativar'}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirmLogoutAll === staff.id) {
                          handleRevokeAllSessions(staff.id);
                        } else {
                          setConfirmLogoutAll(staff.id);
                          setTimeout(() => setConfirmLogoutAll(null), 5000);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        confirmLogoutAll === staff.id
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {confirmLogoutAll === staff.id ? '⚠️ Confirmar' : '🔌 Encerrar Sessões'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SESSÕES ──────────────────────────────────────────────────── */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Monitoramento de Sessões</h2>
            {user?.email && (() => {
              const currentStaffData = StaffService.findByEmail(user.email);
              const sessions = currentStaffData ? StaffService.getActiveSessions(currentStaffData.id) : [];
              return (
                <div>
                  <p className="text-sm text-gray-400 mb-4">
                    {sessions.length > 0 ? `${sessions.length} sessão(ões) ativa(s)` : 'Nenhuma sessão ativa encontrada.'}
                  </p>
                  <div className="space-y-3">
                    {sessions.map(sess => (
                      <div key={sess.id} className="rounded-xl border border-white/7 p-4"
                        style={{ background: 'rgba(15,12,30,0.8)' }}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-white font-medium">Sessão: <span className="font-mono text-violet-300 text-xs">{sess.id.slice(0, 20)}...</span></p>
                            <p className="text-xs text-gray-500 mt-1">Criada: {new Date(sess.createdAt).toLocaleString('pt-BR')}</p>
                            <p className="text-xs text-gray-500">Expira: {new Date(sess.expiresAt).toLocaleString('pt-BR')}</p>
                            <p className="text-xs text-gray-600 mt-1 truncate">UA: {sess.userAgent?.slice(0, 60)}...</p>
                          </div>
                          <button
                            onClick={() => { StaffService.revokeSession(sess.id, ctx?.userId || ''); loadData(); }}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            Revogar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── DELEGAÇÕES ───────────────────────────────────────────────── */}
        {activeTab === 'delegations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Delegações de Acesso</h2>
              <button onClick={() => onNavigate('delegationManager')}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-all">
                + Nova Delegação
              </button>
            </div>
            {delegations.length === 0 ? (
              <div className="rounded-2xl border border-white/7 p-10 text-center text-gray-600"
                style={{ background: 'rgba(15,12,30,0.8)' }}>
                Nenhuma delegação registrada.
              </div>
            ) : (
              <div className="space-y-3">
                {delegations.map(dlg => (
                  <div key={dlg.id} className={`rounded-xl border p-4 ${dlg.active ? 'border-white/7' : 'border-white/3 opacity-50'}`}
                    style={{ background: 'rgba(15,12,30,0.8)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-white text-sm">{dlg.targetUserName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/15 text-violet-300 font-semibold">
                            {ROLE_LABELS[dlg.role] || dlg.role}
                          </span>
                          {dlg.active ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-500/15 text-green-400 font-semibold">Ativa</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-500/15 text-gray-500 font-semibold">Revogada</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{dlg.scope} · {dlg.organization}</p>
                        <p className="text-xs text-gray-600">Válida até: {dlg.validUntil ? new Date(dlg.validUntil).toLocaleDateString('pt-BR') : 'Sem expiração'}</p>
                      </div>
                      {dlg.active && (
                        <button
                          onClick={() => { StaffService.revokeDelegation(dlg.id, ctx?.userId || ''); loadData(); }}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          Revogar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── AUDITORIA ────────────────────────────────────────────────── */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Log de Auditoria</h2>
              <span className="text-xs text-gray-500">{auditEntries.length} registros</span>
            </div>
            <div className="rounded-2xl border border-white/7 overflow-hidden max-h-[600px] overflow-y-auto"
              style={{ background: 'rgba(15,12,30,0.8)' }}>
              {auditEntries.map((entry, i) => (
                <div key={entry.id || i} className={`px-5 py-3 ${i < auditEntries.length - 1 ? 'border-b border-white/4' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: SEVERITY_COLORS[entry.severity] || '#6b7280' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-300">{entry.action}</span>
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                          style={{ color: SEVERITY_COLORS[entry.severity], background: `${SEVERITY_COLORS[entry.severity]}12` }}>
                          {entry.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{entry.details}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{entry.actorId} · {new Date(entry.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              ))}
              {auditEntries.length === 0 && (
                <div className="px-5 py-8 text-center text-gray-600 text-sm">Nenhum evento registrado.</div>
              )}
            </div>
          </div>
        )}

        {/* ── SEGURANÇA ────────────────────────────────────────────────── */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Central de Segurança</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: '🔐', title: 'Autenticação MFA',
                  status: isMfaEnabled ? 'Ativa' : 'Inativa',
                  statusColor: isMfaEnabled ? '#10b981' : '#f59e0b',
                  desc: isMfaEnabled ? 'Conta protegida com TOTP' : 'Recomendado: configure o MFA agora',
                  action: () => onNavigate('mfaSetup'),
                  actionLabel: isMfaEnabled ? 'Gerenciar' : 'Configurar',
                },
                {
                  icon: '🔑', title: 'Delegações Ativas',
                  status: String(delegations.filter(d => d.active).length),
                  statusColor: '#8b5cf6',
                  desc: 'Acessos temporários concedidos a terceiros',
                  action: () => onNavigate('delegationManager'),
                  actionLabel: 'Gerenciar',
                },
                {
                  icon: '📋', title: 'Log de Auditoria',
                  status: `${auditEntries.filter(e => e.severity === 'CRITICAL').length} críticos`,
                  statusColor: auditEntries.some(e => e.severity === 'CRITICAL') ? '#ef4444' : '#10b981',
                  desc: 'Rastreabilidade completa de todas as ações',
                  action: () => setActiveTab('audit'),
                  actionLabel: 'Ver Logs',
                },
                {
                  icon: '🛡️', title: 'Colaboradores Super Admin',
                  status: `${stats?.superAdmins || 0} ativos`,
                  statusColor: '#f59e0b',
                  desc: 'Proteção: mínimo 1 ativo garantido',
                  action: () => setActiveTab('staff'),
                  actionLabel: 'Gerenciar',
                },
              ].map(item => (
                <div key={item.title} className="rounded-2xl border border-white/7 p-5"
                  style={{ background: 'rgba(15,12,30,0.8)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm font-bold" style={{ color: item.statusColor }}>{item.status}</span>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500 mb-4">{item.desc}</p>
                  <button onClick={item.action}
                    className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                    {item.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
