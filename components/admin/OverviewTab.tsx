import React, { useState, useMemo } from 'react';
import type { Lawyer } from '../../types';
import { mockClients, mockInterns, mockMonthlyRevenue, mockEfficiencyServices } from '../../services/mockDataService';
import { SpecialtyPieChart } from './SpecialtyPieChart';
import { StatCard, SectionTitle, SearchInput, Badge, IconBriefcase, IconUsers, IconGradCap, IconMoney, IconX, lawyerStatusBadge, clientStatusBadge, internStatusBadge } from './AdminShared';

type KpiModal = { type: 'lawyers' | 'clients' | 'interns' } | null;

const BRAZIL_STATES = ['Todos', 'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export const OverviewTab: React.FC<{
  lawyers: Lawyer[];
  onNavigateToFinance?: (filter?: string) => void;
}> = ({ lawyers, onNavigateToFinance }) => {
  const [modal, setModal] = useState<KpiModal>(null);
  const [stateFilter, setStateFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [servicesCount, setServicesCount] = useState(mockEfficiencyServices.length);

  React.useEffect(() => {
    const saved = localStorage.getItem('legis_services');
    if (saved) setServicesCount(JSON.parse(saved).length);
  }, []);

  const stats = useMemo(() => ({
    totalLawyers: lawyers.length,
    verifiedLawyers: lawyers.filter(l => l.status === 'verificado').length,
    pendingLawyers: lawyers.filter(l => l.status === 'pendente').length,
    totalClients: mockClients.length,
    activeClients: mockClients.filter(c => c.status === 'ativo').length,
    totalInterns: mockInterns.length,
    activeInterns: mockInterns.filter(i => i.status === 'ativo').length,
    lastMonthRevenue: mockMonthlyRevenue[mockMonthlyRevenue.length - 1].revenue,
  }), [lawyers]);

  const specialtyDistribution = useMemo(() => {
    const counts: { [key: string]: number } = { 'Direito Internacional': 1 };
    lawyers.forEach(l => l.specialties.forEach(s => { counts[s] = (counts[s] || 0) + 1; }));
    return counts;
  }, [lawyers]);

  const internSemesterDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    mockInterns.forEach(i => { counts[i.semester] = (counts[i.semester] || 0) + 1; });
    return counts;
  }, []);

  const internSpecialtyDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    mockInterns.forEach(i => { counts[i.specialtyInterest] = (counts[i.specialtyInterest] || 0) + 1; });
    return counts;
  }, []);

  const serviceGroupDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    const groupsRaw = localStorage.getItem('legis_serviceGroups');
    const groups: { id: string, name: string }[] = groupsRaw ? JSON.parse(groupsRaw) : [];
    const groupMap = new Map(groups.map(g => [g.id, g.name]));
    
    const servicesRaw = localStorage.getItem('legis_services');
    const servs: { groupId: string }[] = servicesRaw ? JSON.parse(servicesRaw) : [];
    
    if (servs.length > 0) {
      servs.forEach(s => {
        const name = groupMap.get(s.groupId) || 'Outros';
        counts[name] = (counts[name] || 0) + 1;
      });
    } else {
      counts['Sem Serviços'] = 1;
    }
    return counts;
  }, [servicesCount]); // recompute if servicesCount changes

  const clientServiceDistribution = useMemo(() => {
    // Mock distribution since we don't have real contract links
    return {
      'Organização de Pastas': 12,
      'Acompanhamento de Diários': 8,
      'Triagem de Atendimentos': 5,
      'Consultoria Avulsa': 3,
    };
  }, []);

  // Filtered KPI data
  const filteredLawyers = useMemo(() => lawyers.filter(l =>
    (stateFilter === 'Todos' || l.location.state === stateFilter) &&
    l.name.toLowerCase().includes(search.toLowerCase())
  ), [lawyers, stateFilter, search]);

  const filteredClients = useMemo(() => mockClients.filter(c =>
    (stateFilter === 'Todos' || c.state === stateFilter) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  ), [stateFilter, search]);

  const filteredInterns = useMemo(() => mockInterns.filter(i =>
    (stateFilter === 'Todos' || i.state === stateFilter) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  ), [stateFilter, search]);

  const closeModal = () => { setModal(null); setStateFilter('Todos'); setSearch(''); };

  return (
    <div className="space-y-8">
      <SectionTitle title="Visão Geral" subtitle="Clique em qualquer KPI para ver detalhes e filtros" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard icon={<span className="text-primary"><IconBriefcase /></span>} label="Advogados Cadastrados" value={stats.totalLawyers} sub={`${stats.verifiedLawyers} verificados · ${stats.pendingLawyers} pendentes`} onClick={() => setModal({ type: 'lawyers' })} />
        <StatCard icon={<span className="text-blue-600"><IconUsers /></span>} label="Clientes" value={stats.totalClients} sub={`${stats.activeClients} ativos`} color="bg-blue-100" onClick={() => setModal({ type: 'clients' })} />
        <StatCard icon={<span className="text-purple-600"><IconGradCap /></span>} label="Estudantes" value={stats.totalInterns} sub={`${stats.activeInterns} ativos`} color="bg-purple-100" onClick={() => setModal({ type: 'interns' })} />
        <StatCard icon={<span className="text-orange-600"><IconBriefcase /></span>} label="Serviços" value={servicesCount} sub="serviços configurados" color="bg-orange-100" />
        <StatCard icon={<span className="text-emerald-600"><IconMoney /></span>} label="Receita Último Mês" value={`R$ ${stats.lastMonthRevenue.toLocaleString('pt-BR')}`} sub="clique para ver financeiro" color="bg-emerald-100" onClick={() => onNavigateToFinance && onNavigateToFinance()} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Advogados por Especialidade</h3>
          <SpecialtyPieChart data={specialtyDistribution} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Estudantes por Especialidade</h3>
          <SpecialtyPieChart data={internSpecialtyDistribution} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Estudantes por Semestre</h3>
          <SpecialtyPieChart data={internSemesterDistribution} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Serviços por Grupo</h3>
          <SpecialtyPieChart data={serviceGroupDistribution} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Clientes por Serviços Contratados</h3>
          <SpecialtyPieChart data={clientServiceDistribution} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Receita Mensal (R$)</h3>
          <div className="space-y-2">
            {mockMonthlyRevenue.map(m => {
              const max = Math.max(...mockMonthlyRevenue.map(x => x.revenue));
              const pct = Math.round((m.revenue / max) * 100);
              return (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-14 shrink-0">{m.month}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div className="bg-primary h-5 rounded-full flex items-center justify-end pr-2" style={{ width: `${pct}%` }}>
                      <span className="text-white text-xs font-medium">{m.consultations}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-700 font-semibold w-24 text-right">R$ {m.revenue.toLocaleString('pt-BR')}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3">Número dentro da barra = consultas realizadas no mês.</p>
        </div>
      </div>

      {/* KPI Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {modal.type === 'lawyers' && 'KPIs — Advogados'}
                  {modal.type === 'clients' && 'KPIs — Clientes'}
                  {modal.type === 'interns' && 'KPIs — Estudantes'}
                </h2>
                <p className="text-sm text-gray-500">Filtre por estado e veja receita individual</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100"><IconX /></button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 p-4 border-b bg-gray-50">
              <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome..." /></div>
              <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30">
                {BRAZIL_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Content */}
            <div className="overflow-auto flex-1 p-4">
              {modal.type === 'lawyers' && (
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr><th className="px-4 py-2 text-left">Advogado</th><th className="px-4 py-2 text-left">Estado</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Receita/Mês</th><th className="px-4 py-2 text-right">Pendente</th></tr>
                  </thead>
                  <tbody>
                    {filteredLawyers.map(l => (
                      <tr key={l.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><img src={l.photoUrl} className="w-7 h-7 rounded-full object-cover" alt="" />{l.name}</td>
                        <td className="px-4 py-3">{l.location.state}</td>
                        <td className="px-4 py-3">{lawyerStatusBadge(l.status)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700">{l.monthlyRevenue ? `R$ ${l.monthlyRevenue.toLocaleString('pt-BR')}` : '—'}</td>
                        <td className="px-4 py-3 text-right text-yellow-700">{l.pendingPayments ? `R$ ${l.pendingPayments.toLocaleString('pt-BR')}` : '—'}</td>
                      </tr>
                    ))}
                    {filteredLawyers.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
                  </tbody>
                </table>
              )}
              {modal.type === 'clients' && (
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr><th className="px-4 py-2 text-left">Cliente</th><th className="px-4 py-2 text-left">Estado</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Total Pago</th><th className="px-4 py-2 text-right">Pendente</th></tr>
                  </thead>
                  <tbody>
                    {filteredClients.map(c => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                        <td className="px-4 py-3">{c.state}</td>
                        <td className="px-4 py-3">{clientStatusBadge(c.status)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700">R$ {c.totalPaid.toLocaleString('pt-BR')}</td>
                        <td className="px-4 py-3 text-right text-yellow-700">{c.pendingAmount > 0 ? `R$ ${c.pendingAmount.toLocaleString('pt-BR')}` : '—'}</td>
                      </tr>
                    ))}
                    {filteredClients.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
                  </tbody>
                </table>
              )}
              {modal.type === 'interns' && (
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr><th className="px-4 py-2 text-left">Estudante</th><th className="px-4 py-2 text-left">Estado</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Bolsa/Mês</th><th className="px-4 py-2 text-right">Total Recebido</th></tr>
                  </thead>
                  <tbody>
                    {filteredInterns.map(i => (
                      <tr key={i.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{i.name}</td>
                        <td className="px-4 py-3">{i.state}</td>
                        <td className="px-4 py-3">{internStatusBadge(i.status)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-700">{i.stipend ? `R$ ${i.stipend.toLocaleString('pt-BR')}` : '—'}</td>
                        <td className="px-4 py-3 text-right text-emerald-700">{i.totalEarned ? `R$ ${i.totalEarned.toLocaleString('pt-BR')}` : '—'}</td>
                      </tr>
                    ))}
                    {filteredInterns.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {modal.type === 'lawyers' && `${filteredLawyers.length} advogados`}
                {modal.type === 'clients' && `${filteredClients.length} clientes`}
                {modal.type === 'interns' && `${filteredInterns.length} estudantes`}
              </p>
              {onNavigateToFinance && (
                <button onClick={() => { closeModal(); onNavigateToFinance(modal.type); }} className="text-sm text-primary hover:underline font-medium">
                  Ver no Financeiro →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
