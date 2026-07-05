import React, { useState, useEffect } from 'react';
import type { Lawyer } from '../../types';
import { backend } from '../../services/modules';
import { DashboardShell, LivePill, type ShellNavGroup } from '../ui';

// ── Tabs
import { OverviewTab }          from './overview/OverviewTab';
import { RegistrationsTab }     from './RegistrationsTab';
import { FinanceTab }           from './FinanceTab';
import { SettingsTab }          from './SettingsTab';
import { ServicesManagementTab } from './ServicesManagementTab';
import { AdminCommandsTab }     from './AdminCommandsTab';
import { OperationsTab }        from './operations/OperationsTab';
import { StaffManagementTab }   from './staff/StaffManagementTab';
import { ImpersonationPanel }   from './staff/ImpersonationPanel';
import { ProvisioningDashboard } from './provisioning/ProvisioningDashboard';

// ── Icons
import {
  IconMoney, IconSettings, IconChart, IconEdit, IconShopBag, IconLock,
} from './AdminShared';

// ── Icon for Operations module
const IconOps = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
  </svg>
);
const IconShield = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const IconEye = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const IconBox = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

// ─── Tab definitions ──────────────────────────────────────────────────────────
type Tab = 'overview' | 'admin_commands' | 'registrations' | 'finance' | 'services' | 'settings' | 'operations' | 'staff' | 'impersonation' | 'provisioning';

const TAB_GROUPS = [
  {
    title: 'Monitoramento & Finanças',
    items: [
      { id: 'overview'     as const, label: 'Visão Geral — BI', icon: <IconChart /> },
      { id: 'finance'      as const, label: 'Financeiro',        icon: <IconMoney /> },
    ]
  },
  {
    title: 'Operação & Cadastros',
    items: [
      { id: 'registrations' as const, label: 'Gestão de Cadastros',    icon: <IconEdit /> },
      { id: 'services'      as const, label: 'Serviços / Eficiência',   icon: <IconShopBag /> },
      { id: 'provisioning'  as const, label: 'Provisionamento',         icon: <IconBox />,    badge: 'novo' },
      { id: 'operations'    as const, label: 'Ops & IA',                icon: <IconOps /> },
    ]
  },
  {
    title: 'Segurança & Equipe',
    items: [
      { id: 'staff'         as const, label: 'Equipe Interna',          icon: <IconShield />, badge: 'rbac' },
      { id: 'impersonation' as const, label: 'Modo Espelho',            icon: <IconEye />,    badge: '⚠' },
    ]
  },
  {
    title: 'Controle & Sistema',
    items: [
      { id: 'admin_commands' as const, label: 'Configurações Admin', icon: <IconLock /> },
      { id: 'settings'       as const, label: 'Configurações',       icon: <IconSettings /> },
    ]
  }
];

interface AdminDashboardProps {
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab]     = useState<Tab>('overview');
  const [lawyers, setLawyers]         = useState<Lawyer[]>([]);
  const [financeFilter, setFinanceFilter] = useState<string | undefined>(undefined);

  // Advogados reais (todos os status) para a fila de verificação.
  const carregarAdvogados = () => {
    backend.admin.advogados().then(lista => setLawyers(lista.map(a => ({
      id: a.id,
      name: a.nome,
      oab: a.oab,
      specialties: a.especialidades ?? [],
      location: { city: a.cidade ?? '', state: a.estado ?? '' },
      photoUrl: a.foto_url ?? `https://i.pravatar.cc/200?u=adv-${a.id}`,
      rating: 0,
      reviewCount: 0,
      bio: a.bio ?? '',
      experience: { years: 0, cases: 0 },
      education: [],
      contact: { phone: a.telefone ?? '', email: a.email },
      reviews: [],
      availability: [],
      status: a.status === 'rejeitado' ? 'suspenso' : a.status,
    })))).catch(() => setLawyers([]));
  };
  useEffect(carregarAdvogados, []);

  const handleLawyerUpdate = (updated: Lawyer) => {
    setLawyers(prev => prev.map(l => l.id === updated.id ? updated : l));
    // Persiste no banco: status de verificação, bio e especialidades.
    void backend.pessoas.advogados.atualizar(updated.id, {
      status: updated.status === 'suspenso' ? 'rejeitado' : updated.status,
      bio: updated.bio,
      especialidades: updated.specialties,
      foto_url: updated.photoUrl,
    }).catch(erro => alert(erro instanceof Error ? erro.message : 'Falha ao salvar no servidor.'));
  };

  const navigateToFinance = (filter?: string) => {
    setFinanceFilter(filter);
    setActiveTab('finance');
  };

  const navGroups: ShellNavGroup<Tab>[] = TAB_GROUPS.map(group => ({
    title: group.title,
    items: group.items.map(tab => ({
      id: tab.id,
      label: tab.label,
      icon: tab.icon,
      badge: ('badge' in tab ? (tab as { badge?: string }).badge : undefined),
    })),
  }));

  return (
    <DashboardShell<Tab>
      userName="Painel Administrativo"
      panelLabel="Legis Connect — Backoffice Interno"
      groups={navGroups}
      active={activeTab}
      onSelect={setActiveTab}
      onLogout={onLogout}
      sidebarExtra={<div className="mb-4"><LivePill label="Sistema online" /></div>}
      contentCard={false}
    >
      {activeTab === 'overview'        && <OverviewTab lawyers={lawyers} onNavigateToFinance={navigateToFinance} />}
      {activeTab === 'admin_commands'  && <AdminCommandsTab />}
      {activeTab === 'registrations'   && <RegistrationsTab lawyers={lawyers} onLawyerUpdate={handleLawyerUpdate} />}
      {activeTab === 'finance'         && <FinanceTab lawyers={lawyers} initialFilter={financeFilter} />}
      {activeTab === 'services'        && <ServicesManagementTab />}
      {activeTab === 'operations'      && <OperationsTab />}
      {activeTab === 'settings'        && <SettingsTab />}
      {activeTab === 'staff'           && <StaffManagementTab actorId="super_admin" />}
      {activeTab === 'impersonation'   && <ImpersonationPanel actorId="super_admin" actorEmail="admin@legisconnect.com.br" />}
      {activeTab === 'provisioning'    && <ProvisioningDashboard />}
    </DashboardShell>
  );
};
