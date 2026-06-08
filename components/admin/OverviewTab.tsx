import React, { useState, useMemo } from 'react';
import type { Lawyer } from '../../types';
import { mockClients, mockInterns, mockSecretaries, mockMonthlyRevenue, mockEfficiencyServices } from '../../services/mockDataService';
import { SpecialtyPieChart } from './SpecialtyPieChart';
import { StatCard, SectionTitle, SearchInput, Badge, IconBriefcase, IconUsers, IconGradCap, IconMoney, IconX, lawyerStatusBadge, clientStatusBadge, internStatusBadge } from './AdminShared';

type KpiModal = { type: 'lawyers' | 'clients' | 'interns' | 'secretaries' | 'services' } | null;

const BRAZIL_STATES = ['Todos', 'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

// Small KPI card with reduced icon
const MiniKpiCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  onClick?: () => void;
}> = ({ icon, label, value, sub, color = 'bg-primary/10', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 px-4 py-3 ${
      onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/40 transition-all' : ''
    }`}
  >
    <div className={`${color} p-2 rounded-lg shrink-0`}>
      <span className="block w-4 h-4">{icon}</span>
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-500 truncate">{label}</p>
      <p className="text-xl font-bold text-gray-800 leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</p>}
    </div>
    {onClick && (
      <svg className="w-3 h-3 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    )}
  </div>
);

// Secretary icon
const IconSecretariat = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

export const OverviewTab: React.FC<{
  lawyers: Lawyer[];
  onNavigateToFinance?: (filter?: string) => void;
}> = ({ lawyers, onNavigateToFinance }) => {
  const [modal, setModal] = useState<KpiModal>(null);
  const [stateFilter, setStateFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [servicesCount, setServicesCount] = useState(mockEfficiencyServices.length);
  const [clients, setClients] = useState<typeof mockClients>(mockClients);
  const [interns, setInterns] = useState<typeof mockInterns>(mockInterns);
  const [secretaries, setSecretaries] = useState<typeof mockSecretaries>(mockSecretaries);

  React.useEffect(() => {
    const saved = localStorage.getItem('legis_services');
    if (saved) setServicesCount(JSON.parse(saved).length);
    const savedClients = localStorage.getItem('legis_clients');
    if (savedClients) setClients(JSON.parse(savedClients));
    const savedInterns = localStorage.getItem('legis_interns');
    if (savedInterns) setInterns(JSON.parse(savedInterns));
    const savedSecs = localStorage.getItem('legis_secretaries');
    if (savedSecs) setSecretaries(JSON.parse(savedSecs));
  }, []);

  const stats = useMemo(() => ({
    totalLawyers: lawyers.length,
    verifiedLawyers: lawyers.filter(l => l.status === 'verificado').length,
    pendingLawyers: lawyers.filter(l => l.status === 'pendente').length,
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'ativo').length,
    totalInterns: interns.length,
    activeInterns: interns.filter(i => i.status === 'ativo').length,
    totalSecretaries: secretaries.length,
    activeSecretaries: secretaries.filter(s => s.status === 'ativo').length,
    lastMonthRevenue: mockMonthlyRevenue[mockMonthlyRevenue.length - 1].revenue,
  }), [lawyers, clients, interns, secretaries]);

  const specialtyDistribution = useMemo(() => {
    const counts: { [key: string]: number } = { 'Direito Internacional': 1 };
    lawyers.forEach(l => l.specialties.forEach(s => { counts[s] = (counts[s] || 0) + 1; }));
    return counts;
  }, [lawyers]);

  const internSemesterDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    interns.forEach(i => { counts[i.semester] = (counts[i.semester] || 0) + 1; });
    return counts;
  }, [interns]);

  const internSpecialtyDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    interns.forEach(i => { counts[i.specialtyInterest] = (counts[i.specialtyInterest] || 0) + 1; });
    return counts;
  }, [interns]);

  const secretaryAvailabilityDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    const labels: Record<string, string> = { integral: 'Tempo Integral', 'meio-periodo': 'Meio Período', freelancer: 'Freelancer' };
    secretaries.forEach(s => {
      const label = labels[s.availability] || s.availability;
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  }, [secretaries]);

  const secretaryAreaDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    secretaries.forEach(s => s.areasOfKnowledge.forEach(a => { counts[a] = (counts[a] || 0) + 1; }));
    return counts;
  }, [secretaries]);

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
  }, [servicesCount]);

  const clientServiceDistribution = useMemo(() => ({
    'Organização de Pastas': 12,
    'Acompanhamento de Diários': 8,
    'Triagem de Atendimentos': 5,
    'Consultoria Avulsa': 3,
  }), []);

  // Filtered KPI data
  const filteredLawyers = useMemo(() => lawyers.filter(l =>
    (stateFilter === 'Todos' || l.location.state === stateFilter) &&
    l.name.toLowerCase().includes(search.toLowerCase())
  ), [lawyers, stateFilter, search]);

  const filteredClients = useMemo(() => clients.filter(c =>
    (stateFilter === 'Todos' || c.state === stateFilter) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  ), [clients, stateFilter, search]);

  const filteredInterns = useMemo(() => interns.filter(i =>
    (stateFilter === 'Todos' || i.state === stateFilter) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  ), [interns, stateFilter, search]);

  const filteredSecretaries = useMemo(() => secretaries.filter(s =>
    (stateFilter === 'Todos' || s.state === stateFilter) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  ), [secretaries, stateFilter, search]);

  const closeModal = () => { setModal(null); setStateFilter('Todos'); setSearch(''); };

  return (
    <div className="space-y-8">
      <SectionTitle title="Visão Geral" subtitle="Clique em qualquer KPI para ver detalhes e filtros" />

      {/* KPI Cards — compact grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <MiniKpiCard
          icon={<IconBriefcase />}
          label="Advogados"
          value={stats.totalLawyers}
          sub={`${stats.verifiedLawyers} verificados`}
          color="bg-primary/10"
          onClick={() => setModal({ type: 'lawyers' })}
        />
        <MiniKpiCard
          icon={<IconUsers />}
          label="Clientes"
          value={stats.totalClients}
          sub={`${stats.activeClients} ativos`}
          color="bg-blue-100"
          onClick={() => setModal({ type: 'clients' })}
        />
        <MiniKpiCard
          icon={<IconGradCap />}
          label="Bacharelandos"
          value={stats.totalInterns}
          sub={`${stats.activeInterns} ativos`}
          color="bg-indigo-100"
          onClick={() => setModal({ type: 'interns' })}
        />
        <MiniKpiCard
          icon={<IconSecretariat />}
          label="Secret./Assist Jurídico"
          value={stats.totalSecretaries}
          sub={`${stats.activeSecretaries} ativos`}
          color="bg-purple-100"
          onClick={() => setModal({ type: 'secretaries' })}
        />
        <MiniKpiCard
          icon={<IconBriefcase />}
          label="Serviços"
          value={servicesCount}
          sub="configurados"
          color="bg-orange-100"
          onClick={() => setModal({ type: 'services' })}
        />
        <MiniKpiCard
          icon={<IconMoney />}
          label="Receita Último Mês"
          value={`R$ ${stats.lastMonthRevenue.toLocaleString('pt-BR')}`}
          sub="ver financeiro"
          color="bg-emerald-100"
          onClick={() => onNavigateToFinance && onNavigateToFinance()}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Advogados por Especialidade</h3>
          <SpecialtyPieChart data={specialtyDistribution} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Bacharelandos por Especialidade</h3>
          <SpecialtyPieChart data={internSpecialtyDistribution} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Bacharelandos por Semestre</h3>
          <SpecialtyPieChart data={internSemesterDistribution} />
        </div>
        {/* Secret./Assist Jurídico Charts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
            <h3 className="text-base font-bold text-gray-800">Secret./Assist Jurídico por Disponibilidade</h3>
          </div>
          <SpecialtyPieChart data={secretaryAvailabilityDistribution} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
            <h3 className="text-base font-bold text-gray-800">Secret./Assist Jurídico por Área de Conhecimento</h3>
          </div>
          <SpecialtyPieChart data={secretaryAreaDistribution} />
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
                  {modal.type === 'interns' && 'KPIs — Bacharelandos'}
                  {modal.type === 'secretaries' && 'KPIs — Secret./Assist Jurídico'}
                  {modal.type === 'services' && 'Faturamento — Serviços'}
                </h2>
                <p className="text-sm text-gray-500">Filtre por estado e veja informações individuais</p>
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
              {modal.type === 'services' && (
                <div className="space-y-6 p-2">
                  {/* Services billing summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
                      <p className="text-xs text-orange-600 font-semibold uppercase mb-1">Serviços Configurados</p>
                      <p className="text-3xl font-bold text-orange-700">{servicesCount}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                      <p className="text-xs text-emerald-600 font-semibold uppercase mb-1">Receita Serviços/Mês</p>
                      <p className="text-3xl font-bold text-emerald-700">R$ {(servicesCount * 850).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
                      <p className="text-xs text-yellow-600 font-semibold uppercase mb-1">Pendente Serviços</p>
                      <p className="text-3xl font-bold text-yellow-700">R$ {(servicesCount * 120).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Receita por Mês — Serviços</h4>
                    <div className="space-y-2">
                      {mockMonthlyRevenue.map(m => {
                        const max = Math.max(...mockMonthlyRevenue.map(x => x.revenue));
                        const serviceRev = Math.round(m.revenue * 0.35);
                        const pct = Math.round((serviceRev / (max * 0.35)) * 100);
                        return (
                          <div key={m.month} className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 w-14 shrink-0">{m.month}</span>
                            <div className="flex-1 bg-orange-50 rounded-full h-4 overflow-hidden">
                              <div className="bg-orange-400 h-4 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-700 font-semibold w-24 text-right">R$ {serviceRev.toLocaleString('pt-BR')}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-3">Estimativa: 35% da receita total atribuída a serviços configurados.</p>
                  </div>
                </div>
              )}
              {modal.type === 'interns' && (
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr><th className="px-4 py-2 text-left">Bacharelando(a)</th><th className="px-4 py-2 text-left">Estado</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Bolsa/Mês</th><th className="px-4 py-2 text-right">Total Recebido</th></tr>
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
              {modal.type === 'secretaries' && (
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase bg-purple-50">
                    <tr><th className="px-4 py-2 text-left">Secretário(a)</th><th className="px-4 py-2 text-left">Estado</th><th className="px-4 py-2 text-left">Disponibilidade</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Honorário/Mês</th></tr>
                  </thead>
                  <tbody>
                    {filteredSecretaries.map(s => {
                      const availLabel = s.availability === 'integral' ? 'Integral' : s.availability === 'meio-periodo' ? 'Meio Período' : 'Freelancer';
                      return (
                        <tr key={s.id} className="border-b hover:bg-purple-50/30">
                          <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0">{s.name.charAt(0)}</div>
                            {s.name}
                          </td>
                          <td className="px-4 py-3">{s.state}</td>
                          <td className="px-4 py-3">{availLabel}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ s.status === 'ativo' ? 'bg-green-100 text-green-700' : s.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700' }`}>{s.status}</span></td>
                          <td className="px-4 py-3 text-right font-semibold text-purple-700">{s.monthlyFee ? `R$ ${s.monthlyFee.toLocaleString('pt-BR')}` : '—'}</td>
                        </tr>
                      );
                    })}
                    {filteredSecretaries.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {modal.type === 'lawyers' && `${filteredLawyers.length} advogados`}
                {modal.type === 'clients' && `${filteredClients.length} clientes`}
                {modal.type === 'interns' && `${filteredInterns.length} bacharelandos`}
                {modal.type === 'secretaries' && `${filteredSecretaries.length} secret./assist. jurídicos`}
                {modal.type === 'services' && `${servicesCount} serviços configurados`}
              </p>
              {onNavigateToFinance && modal.type !== 'secretaries' && (
                <button onClick={() => { closeModal(); onNavigateToFinance(modal.type); }} className="text-sm text-primary hover:underline font-medium">
                  Ver no Financeiro →
                </button>
              )}
              {onNavigateToFinance && modal.type === 'secretaries' && (
                <button onClick={() => { closeModal(); onNavigateToFinance('secretaries'); }} className="text-sm text-purple-600 hover:underline font-medium">
                  Ver no Financeiro →
                </button>
              )}
              {onNavigateToFinance && modal.type === 'services' && (
                <button onClick={() => { closeModal(); onNavigateToFinance('services'); }} className="text-sm text-orange-600 hover:underline font-medium">
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
