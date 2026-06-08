import React, { useState, useMemo } from 'react';
import type { Lawyer } from '../../types';
import { mockLawyers } from '../../services/mockLawyerService';
import { OverviewTab } from './OverviewTab';
import { RegistrationsTab } from './RegistrationsTab';
import { FinanceTab } from './FinanceTab';
import { SettingsTab } from './SettingsTab';
import { ServicesManagementTab } from './ServicesManagementTab';
import {
  IconMoney, IconSettings, IconChart, IconEdit,
  SearchInput, SectionTitle, lawyerStatusBadge,
} from './AdminShared';
// Inline icons for sidebar
const IconGrid = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);
const IconShopBag = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z" />
  </svg>
);

// ─── Lawyers Tab (kept local) ────────────────────────────────────────────────
const LawyersTab: React.FC<{
  lawyers: Lawyer[];
  onStatusChange: (id: number, s: Lawyer['status']) => void;
}> = ({ lawyers, onStatusChange }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | Lawyer['status']>('todos');
  const [selected, setSelected] = useState<Lawyer | null>(null);

  const filtered = useMemo(() =>
    lawyers.filter(l =>
      (filter === 'todos' || l.status === filter) &&
      (l.name.toLowerCase().includes(search.toLowerCase()) ||
       l.oab.toLowerCase().includes(search.toLowerCase()) ||
       l.specialties.join(' ').toLowerCase().includes(search.toLowerCase()))
    ), [lawyers, search, filter]);

  if (selected) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline mb-4">← Voltar</button>
        <div className="flex items-start gap-5 mb-6">
          <img src={selected.photoUrl} alt={selected.name} className="w-20 h-20 rounded-full object-cover border-2 border-primary/20" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
            <p className="text-sm text-gray-500">OAB: {selected.oab}/{selected.oabUF} · {selected.location.city}, {selected.location.state}</p>
            <div className="mt-2">{lawyerStatusBadge(selected.status)}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            ['E-mail', selected.contact.email],
            ['Telefone', selected.contact.phone],
            ['Especialidades', selected.specialties.join(', ')],
            ['Experiência', `${selected.experience.years} anos · ${selected.experience.cases} casos`],
            ['CPF', selected.cpf || '—'],
            ['RG', selected.rg || '—'],
            ['End. Residencial', selected.address || '—'],
            ['End. Comercial', selected.commercialAddress || '—'],
            ['Avaliação', `⭐ ${selected.rating} (${selected.reviewCount} avaliações)`],
            ['Taxa de Consulta', selected.consultationFee ? `R$ ${selected.consultationFee}` : '—'],
            ['Receita Mensal', selected.monthlyRevenue ? `R$ ${selected.monthlyRevenue.toLocaleString('pt-BR')}` : '—'],
            ['Pendente', selected.pendingPayments ? `R$ ${selected.pendingPayments.toLocaleString('pt-BR')}` : '—'],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
              <p className="font-medium text-gray-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bio</p>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selected.bio}</p>
        </div>
        <div className="mt-6 flex gap-3">
          {selected.status === 'pendente' && <button onClick={() => { onStatusChange(selected.id, 'verificado'); setSelected({ ...selected, status: 'verificado' }); }} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Verificar</button>}
          {selected.status === 'verificado' && <button onClick={() => { onStatusChange(selected.id, 'suspenso'); setSelected({ ...selected, status: 'suspenso' }); }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Suspender</button>}
          {selected.status === 'suspenso' && <button onClick={() => { onStatusChange(selected.id, 'verificado'); setSelected({ ...selected, status: 'verificado' }); }} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Reativar</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionTitle title="Advogados" subtitle="Gerencie, verifique e acompanhe os advogados cadastrados" />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome, OAB ou especialidade..." /></div>
        <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="todos">Todos os status</option>
          <option value="verificado">Verificado</option>
          <option value="pendente">Pendente</option>
          <option value="suspenso">Suspenso</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr><th className="px-5 py-3">Advogado</th><th className="px-5 py-3">OAB</th><th className="px-5 py-3">Especialidades</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-center">Ações</th></tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-900 flex items-center gap-3"><img src={l.photoUrl} alt={l.name} className="w-8 h-8 rounded-full object-cover" />{l.name}</td>
                <td className="px-5 py-3">{l.oab}</td>
                <td className="px-5 py-3 max-w-xs truncate">{l.specialties.join(', ')}</td>
                <td className="px-5 py-3">{lawyerStatusBadge(l.status)}</td>
                <td className="px-5 py-3 text-center space-x-2">
                  <button onClick={() => setSelected(l)} className="text-primary text-xs font-medium hover:underline">Ver</button>
                  {l.status === 'pendente' && <button onClick={() => onStatusChange(l.id, 'verificado')} className="text-green-600 text-xs font-medium hover:underline">Verificar</button>}
                  {l.status === 'verificado' && <button onClick={() => onStatusChange(l.id, 'suspenso')} className="text-red-600 text-xs font-medium hover:underline">Suspender</button>}
                  {l.status === 'suspenso' && <button onClick={() => onStatusChange(l.id, 'verificado')} className="text-blue-600 text-xs font-medium hover:underline">Reativar</button>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Nenhum resultado encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">{filtered.length} de {lawyers.length} advogados</p>
    </div>
  );
};

// ─── Tab definitions ──────────────────────────────────────────────────────────
type Tab = 'overview' | 'registrations' | 'finance' | 'settings' | 'services';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',       label: 'Visão Geral',         icon: <IconChart /> },
  { id: 'registrations',  label: 'Gestão de Cadastros', icon: <IconEdit /> },
  { id: 'finance',        label: 'Financeiro',           icon: <IconMoney /> },
  { id: 'services',       label: 'Serviços / Eficiência', icon: <IconShopBag /> },
  { id: 'settings',       label: 'Configurações',        icon: <IconSettings /> },
];

interface AdminDashboardProps {
  onNavigate: (view: any) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [lawyers, setLawyers] = useState<Lawyer[]>(mockLawyers);
  const [financeFilter, setFinanceFilter] = useState<string | undefined>(undefined);

  const handleStatusChange = (id: number, status: Lawyer['status']) => {
    setLawyers(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleLawyerUpdate = (updated: Lawyer) => {
    setLawyers(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const navigateToFinance = (filter?: string) => {
    setFinanceFilter(filter);
    setActiveTab('finance');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-xs text-gray-500">Legis Connect — Gestão da Plataforma</p>
        </div>
        <span className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Sistema online
        </span>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar nav */}
        <aside className="md:w-60 shrink-0 bg-white border-r md:min-h-screen">
          <nav className="p-3 space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-200'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <span className="w-5 h-5 shrink-0">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150 mt-4 border border-dashed border-red-200"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair do Painel
              </button>
            )}
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 mt-4 border-t">
            <div className="px-3 py-2 rounded-lg bg-purple-50 border border-purple-100">
              <p className="text-[10px] font-bold text-purple-700 uppercase tracking-widest mb-1">Legis Connect</p>
              <p className="text-xs text-purple-500">Plataforma Jurídica</p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview'      && <OverviewTab lawyers={lawyers} onNavigateToFinance={navigateToFinance} />}
          {activeTab === 'registrations' && <RegistrationsTab lawyers={lawyers} onLawyerUpdate={handleLawyerUpdate} />}
          {activeTab === 'finance'       && <FinanceTab lawyers={lawyers} initialFilter={financeFilter} />}
          {activeTab === 'services'      && <ServicesManagementTab />}
          {activeTab === 'settings'      && <SettingsTab />}
        </main>
      </div>
    </div>
  );
};
