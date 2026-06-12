import React, { useState } from 'react';
import type { Lawyer } from '../../types';
import { mockLawyers } from '../../services/mockLawyerService';

// ── Tabs
import { OverviewTab }      from './overview/OverviewTab';
import { RegistrationsTab } from './RegistrationsTab';
import { FinanceTab }       from './FinanceTab';
import { SettingsTab }      from './SettingsTab';
import { ServicesManagementTab } from './ServicesManagementTab';
import { AdminCommandsTab } from './AdminCommandsTab';
import { OperationsTab }    from './operations/OperationsTab';

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

// ─── Tab definitions ──────────────────────────────────────────────────────────
type Tab = 'overview' | 'admin_commands' | 'registrations' | 'finance' | 'services' | 'settings' | 'operations';

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
      { id: 'operations'    as const, label: 'Ops & IA',                icon: <IconOps />,    badge: 'novo' },
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
  const [lawyers, setLawyers]         = useState<Lawyer[]>(mockLawyers);
  const [financeFilter, setFinanceFilter] = useState<string | undefined>(undefined);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLawyerUpdate = (updated: Lawyer) => {
    setLawyers(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const navigateToFinance = (filter?: string) => {
    setFinanceFilter(filter);
    setActiveTab('finance');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0B1E]">
      {/* ── Top bar ── */}
      <div className="bg-white dark:bg-[#12102A] border-b border-gray-200 dark:border-[#2A2545] shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Painel Administrativo</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Legis Connect — Backoffice Interno</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Sistema online
          </span>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
          >
            <span>{showMobileMenu ? '✕ Fechar' : '☰ Menu'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Mobile backdrop */}
        {showMobileMenu && (
          <div
            className="fixed inset-0 bg-black/40 z-10 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside className={`w-full md:w-60 shrink-0 bg-white dark:bg-[#12102A] border-r border-gray-200 dark:border-[#2A2545] md:min-h-screen relative z-20 ${showMobileMenu ? 'block' : 'hidden md:block'}`}>
          <nav className="p-3 space-y-4">
            {TAB_GROUPS.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2.5 mb-1.5">
                  {group.title}
                </p>
                {group.items.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setShowMobileMenu(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      activeTab === tab.id
                        ? 'bg-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900/50'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300'
                    }`}
                  >
                    <span className="w-5 h-5 shrink-0">{tab.icon}</span>
                    <span className="flex-1 text-left">{tab.label}</span>
                    {'badge' in tab && tab.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-200 text-violet-800 dark:bg-violet-900 dark:text-violet-300 uppercase">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}

            {onLogout && (
              <div className="pt-2 border-t border-gray-100 dark:border-[#2A2545]">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 transition-all duration-150 border border-dashed border-red-200 dark:border-red-800"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair do Painel
                </button>
              </div>
            )}
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 mt-4 border-t border-gray-100 dark:border-[#2A2545]">
            <div className="px-3 py-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
              <p className="text-[10px] font-bold text-violet-700 dark:text-violet-400 uppercase tracking-widest mb-0.5">Legis Connect</p>
              <p className="text-xs text-violet-500 dark:text-violet-500">Plataforma Jurídica</p>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'overview'        && <OverviewTab lawyers={lawyers} onNavigateToFinance={navigateToFinance} />}
          {activeTab === 'admin_commands'  && <AdminCommandsTab />}
          {activeTab === 'registrations'   && <RegistrationsTab lawyers={lawyers} onLawyerUpdate={handleLawyerUpdate} />}
          {activeTab === 'finance'         && <FinanceTab lawyers={lawyers} initialFilter={financeFilter} />}
          {activeTab === 'services'        && <ServicesManagementTab />}
          {activeTab === 'operations'      && <OperationsTab />}
          {activeTab === 'settings'        && <SettingsTab />}
        </main>
      </div>
    </div>
  );
};
