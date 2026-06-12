import React, { useState, useMemo } from 'react';
import type { Lawyer } from '../../../types';
import { mockClients, mockInterns, mockSecretaries, mockMonthlyRevenue, mockEfficiencyServices } from '../../../services/mockDataService';

// ── New BI components
import { KpiCardsRow }          from './KpiCardsRow';
import { RevenueAreaChart }     from './RevenueAreaChart';
import { ServicesBarChart }     from './ServicesBarChart';
import { UserDistributionDonut } from './UserDistributionDonut';
import { ExportDropdown }       from './ExportDropdown';

// ── Shared UI
import { SectionTitle, SearchInput, IconBriefcase, IconUsers, IconGradCap, IconMoney, IconX, lawyerStatusBadge, clientStatusBadge, internStatusBadge } from '../AdminShared';
import { SpecialtyPieChart } from '../SpecialtyPieChart';

// ─── Types ────────────────────────────────────────────────────────────────────
type KpiModal = { type: 'lawyers' | 'clients' | 'interns' | 'secretaries' | 'services' } | null;
const BRAZIL_STATES = ['Todos', 'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

// ─── Secretary mini-icon ──────────────────────────────────────────────────────
const IconSecretariat = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

// ─── Small legacy KPI Card (for user-count section) ───────────────────────────
const MiniKpiCard: React.FC<{
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color?: string; onClick?: () => void;
}> = ({ icon, label, value, sub, color = 'bg-primary/10', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-[#12102A] rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm flex items-center gap-3 px-4 py-3 ${
      onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/40 transition-all' : ''
    }`}
  >
    <div className={`${color} p-2 rounded-lg shrink-0`}>
      <span className="block w-4 h-4">{icon}</span>
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
      <p className="text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{sub}</p>}
    </div>
    {onClick && (
      <svg className="w-3 h-3 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    )}
  </div>
);

// ─── Overview Tab (new orchestrator) ─────────────────────────────────────────
export const OverviewTab: React.FC<{
  lawyers: Lawyer[];
  onNavigateToFinance?: (filter?: string) => void;
}> = ({ lawyers, onNavigateToFinance }) => {
  const [modal, setModal]               = useState<KpiModal>(null);
  const [stateFilter, setStateFilter]   = useState('Todos');
  const [search, setSearch]             = useState('');
  const [servicesCount, setServicesCount] = useState(mockEfficiencyServices.length);
  const [clients, setClients]           = useState(mockClients);
  const [interns, setInterns]           = useState(mockInterns);
  const [secretaries, setSecretaries]   = useState(mockSecretaries);

  React.useEffect(() => {
    const saved = localStorage.getItem('legis_services');
    if (saved) setServicesCount(JSON.parse(saved).length);
    const sc = localStorage.getItem('legis_clients');    if (sc) setClients(JSON.parse(sc));
    const si = localStorage.getItem('legis_interns');    if (si) setInterns(JSON.parse(si));
    const ss = localStorage.getItem('legis_secretaries'); if (ss) setSecretaries(JSON.parse(ss));
  }, []);

  const stats = useMemo(() => ({
    totalLawyers:     lawyers.length,
    verifiedLawyers:  lawyers.filter(l => l.status === 'verificado').length,
    totalClients:     clients.length,
    activeClients:    clients.filter((c: any) => c.status === 'ativo').length,
    totalInterns:     interns.length,
    activeInterns:    interns.filter((i: any) => i.status === 'ativo' || i.status === 'active').length,
    totalSecretaries: secretaries.length,
    activeSecretaries: secretaries.filter((s: any) => s.status === 'ativo').length,
    lastMonthRevenue: mockMonthlyRevenue[mockMonthlyRevenue.length - 1].revenue,
  }), [lawyers, clients, interns, secretaries]);

  const specialtyDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    lawyers.forEach(l => l.specialties.forEach(s => { counts[s] = (counts[s] || 0) + 1; }));
    return counts;
  }, [lawyers]);

  const internSpecialtyDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    interns.forEach((i: any) => { counts[i.specialtyInterest] = (counts[i.specialtyInterest] || 0) + 1; });
    return counts;
  }, [interns]);

  const internSemesterDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    interns.forEach((i: any) => { counts[i.semester] = (counts[i.semester] || 0) + 1; });
    return counts;
  }, [interns]);

  // Filtered drill-down lists
  const filteredLawyers   = useMemo(() => lawyers.filter(l => (stateFilter === 'Todos' || l.location.state === stateFilter) && l.name.toLowerCase().includes(search.toLowerCase())), [lawyers, stateFilter, search]);
  const filteredClients   = useMemo(() => clients.filter((c: any) => (stateFilter === 'Todos' || c.state === stateFilter) && c.name.toLowerCase().includes(search.toLowerCase())), [clients, stateFilter, search]);
  const filteredInterns   = useMemo(() => interns.filter((i: any) => (stateFilter === 'Todos' || i.state === stateFilter) && i.name.toLowerCase().includes(search.toLowerCase())), [interns, stateFilter, search]);
  const filteredSecretaries = useMemo(() => secretaries.filter((s: any) => (stateFilter === 'Todos' || s.state === stateFilter) && s.name.toLowerCase().includes(search.toLowerCase())), [secretaries, stateFilter, search]);

  const closeModal = () => { setModal(null); setStateFilter('Todos'); setSearch(''); };

  return (
    <div className="space-y-8">
      {/* ── Page header with Export button ── */}
      <div className="flex items-start justify-between gap-4">
        <SectionTitle
          title="Visão Geral — Business Intelligence"
          subtitle="KPIs em tempo real com variação mensal. Clique nos cards de usuários para ver detalhes."
        />
        <ExportDropdown lawyers={lawyers} />
      </div>

      {/* ── BI KPI Cards (MoM) ── */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
          Indicadores-Chave de Performance
        </h4>
        <KpiCardsRow />
      </div>

      {/* ── User Count Cards (legacy, drill-down) ── */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
          Cadastros da Plataforma
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <MiniKpiCard icon={<IconBriefcase />}  label="Advogados"           value={stats.totalLawyers}     sub={`${stats.verifiedLawyers} verificados`}  color="bg-primary/10"  onClick={() => setModal({ type: 'lawyers' })} />
          <MiniKpiCard icon={<IconUsers />}       label="Clientes"            value={stats.totalClients}     sub={`${stats.activeClients} ativos`}          color="bg-blue-100"    onClick={() => setModal({ type: 'clients' })} />
          <MiniKpiCard icon={<IconGradCap />}     label="Bacharelandos"       value={stats.totalInterns}     sub={`${stats.activeInterns} ativos`}          color="bg-indigo-100"  onClick={() => setModal({ type: 'interns' })} />
          <MiniKpiCard icon={<IconSecretariat />} label="Secret./Assist Jur." value={stats.totalSecretaries} sub={`${stats.activeSecretaries} ativos`}     color="bg-purple-100"  onClick={() => setModal({ type: 'secretaries' })} />
          <MiniKpiCard icon={<IconBriefcase />}   label="Serviços"            value={servicesCount}          sub="configurados"                              color="bg-orange-100"  onClick={() => setModal({ type: 'services' })} />
          <MiniKpiCard icon={<IconMoney />}       label="Receita Último Mês"  value={`R$ ${stats.lastMonthRevenue.toLocaleString('pt-BR')}`} sub="ver financeiro" color="bg-emerald-100" onClick={() => onNavigateToFinance && onNavigateToFinance()} />
        </div>
      </div>

      {/* ── Recharts Charts Row ── */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
          Gráficos de Tendência
        </h4>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RevenueAreaChart />
          <ServicesBarChart />
        </div>
      </div>

      {/* ── Distribution Charts Row ── */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
          Distribuição
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <UserDistributionDonut />
          <div className="bg-white dark:bg-[#12102A] rounded-2xl border border-gray-200 dark:border-[#2A2545] shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4">Advogados por Especialidade</h3>
            <SpecialtyPieChart data={specialtyDistribution} />
          </div>
          <div className="bg-white dark:bg-[#12102A] rounded-2xl border border-gray-200 dark:border-[#2A2545] shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4">Bacharelandos por Especialidade</h3>
            <SpecialtyPieChart data={internSpecialtyDistribution} />
          </div>
        </div>
      </div>

      {/* ── KPI Drill-down Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-[#1A1730] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b dark:border-[#2A2545]">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {modal.type === 'lawyers' && 'KPIs — Advogados'}
                  {modal.type === 'clients' && 'KPIs — Clientes'}
                  {modal.type === 'interns' && 'KPIs — Bacharelandos'}
                  {modal.type === 'secretaries' && 'KPIs — Secret./Assist Jurídico'}
                  {modal.type === 'services' && 'Faturamento — Serviços'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Filtre por estado e veja informações individuais</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2545]"><IconX /></button>
            </div>
            <div className="flex gap-3 p-4 border-b dark:border-[#2A2545] bg-gray-50 dark:bg-[#12102A]">
              <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome..." /></div>
              <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="text-sm border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-[#1A1730] text-gray-900 dark:text-white">
                {BRAZIL_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="overflow-auto flex-1 p-4">
              {modal.type === 'lawyers' && (
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-[#12102A]">
                    <tr><th className="px-4 py-2 text-left">Advogado</th><th className="px-4 py-2 text-left">Estado</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Receita/Mês</th><th className="px-4 py-2 text-right">Pendente</th></tr>
                  </thead>
                  <tbody>
                    {filteredLawyers.map(l => (
                      <tr key={l.id} className="border-b dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-[#1A1730]/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2"><img src={l.photoUrl} className="w-7 h-7 rounded-full object-cover" alt="" />{l.name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{l.location.state}</td>
                        <td className="px-4 py-3">{lawyerStatusBadge(l.status)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">{l.monthlyRevenue ? `R$ ${l.monthlyRevenue.toLocaleString('pt-BR')}` : '—'}</td>
                        <td className="px-4 py-3 text-right text-yellow-700 dark:text-yellow-400">{l.pendingPayments ? `R$ ${l.pendingPayments.toLocaleString('pt-BR')}` : '—'}</td>
                      </tr>
                    ))}
                    {filteredLawyers.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
                  </tbody>
                </table>
              )}
              {modal.type === 'clients' && (
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-[#12102A]">
                    <tr><th className="px-4 py-2 text-left">Cliente</th><th className="px-4 py-2 text-left">Estado</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Total Pago</th><th className="px-4 py-2 text-right">Pendente</th></tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((c: any) => (
                      <tr key={c.id} className="border-b dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-[#1A1730]/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{c.name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.state}</td>
                        <td className="px-4 py-3">{clientStatusBadge(c.status)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">R$ {c.totalPaid?.toLocaleString('pt-BR') ?? '0'}</td>
                        <td className="px-4 py-3 text-right text-yellow-700 dark:text-yellow-400">{c.pendingAmount > 0 ? `R$ ${c.pendingAmount.toLocaleString('pt-BR')}` : '—'}</td>
                      </tr>
                    ))}
                    {filteredClients.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
                  </tbody>
                </table>
              )}
              {modal.type === 'interns' && (
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-[#12102A]">
                    <tr><th className="px-4 py-2 text-left">Bacharelando(a)</th><th className="px-4 py-2 text-left">Estado</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Bolsa/Mês</th><th className="px-4 py-2 text-right">Total Recebido</th></tr>
                  </thead>
                  <tbody>
                    {filteredInterns.map((i: any) => (
                      <tr key={i.id} className="border-b dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-[#1A1730]/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{i.name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{i.state}</td>
                        <td className="px-4 py-3">{internStatusBadge(i.status === 'active' ? 'ativo' : i.status)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-700 dark:text-blue-400">{i.stipend ? `R$ ${i.stipend.toLocaleString('pt-BR')}` : '—'}</td>
                        <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-400">{i.totalEarned ? `R$ ${i.totalEarned.toLocaleString('pt-BR')}` : '—'}</td>
                      </tr>
                    ))}
                    {filteredInterns.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
                  </tbody>
                </table>
              )}
              {modal.type === 'secretaries' && (
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase bg-purple-50 dark:bg-purple-900/20">
                    <tr><th className="px-4 py-2 text-left">Secretário(a)</th><th className="px-4 py-2 text-left">Estado</th><th className="px-4 py-2 text-left">Disponibilidade</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Honorário/Mês</th></tr>
                  </thead>
                  <tbody>
                    {filteredSecretaries.map((s: any) => {
                      const availLabel = s.availability === 'integral' ? 'Integral' : s.availability === 'meio-periodo' ? 'Meio Período' : 'Freelancer';
                      return (
                        <tr key={s.id} className="border-b dark:border-[#2A2545] hover:bg-purple-50/30 dark:hover:bg-purple-900/10">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center shrink-0">{s.name.charAt(0)}</div>
                            {s.name}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.state}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{availLabel}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.status === 'ativo' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : s.status === 'pendente' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>{s.status}</span></td>
                          <td className="px-4 py-3 text-right font-semibold text-purple-700 dark:text-purple-400">{s.monthlyFee ? `R$ ${s.monthlyFee.toLocaleString('pt-BR')}` : '—'}</td>
                        </tr>
                      );
                    })}
                    {filteredSecretaries.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 border-t dark:border-[#2A2545] bg-gray-50 dark:bg-[#12102A] flex justify-between items-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {modal.type === 'lawyers' && `${filteredLawyers.length} advogados`}
                {modal.type === 'clients' && `${filteredClients.length} clientes`}
                {modal.type === 'interns' && `${filteredInterns.length} bacharelandos`}
                {modal.type === 'secretaries' && `${filteredSecretaries.length} secretários/assistentes`}
              </p>
              {onNavigateToFinance && modal.type !== 'services' && (
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
