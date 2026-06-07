import React, { useState, useMemo } from 'react';
import type { Lawyer } from '../../types';
import { mockClients, mockInterns, mockSecretaries, mockMonthlyRevenue, mockEfficiencyServices, mockEfficiencyServiceGroups } from '../../services/mockDataService';
import type { EfficiencyService, EfficiencyServiceGroup } from '../../types';
import { StatCard, SectionTitle, SearchInput, IconMoney, IconShield, IconChart, IconBriefcase, IconUsers, IconGradCap, IconSettings } from './AdminShared';

// ─── Secretary Icon ───────────────────────────────────────────────────────────
const IconSecretariat = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const BRAZIL_STATES = ['Todos', 'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
type FilterType = 'lawyers' | 'clients' | 'interns' | 'secretaries' | 'services';

export const FinanceTab: React.FC<{ lawyers: Lawyer[]; initialFilter?: string }> = ({ lawyers, initialFilter }) => {
  const [filterType, setFilterType] = useState<FilterType>(
    initialFilter === 'clients' ? 'clients'
    : initialFilter === 'interns' ? 'interns'
    : initialFilter === 'secretaries' ? 'secretaries'
    : 'lawyers'
  );
  const [stateFilter, setStateFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('Mensal');

  const [services, setServices] = useState<EfficiencyService[]>(mockEfficiencyServices);
  const [groups, setGroups] = useState<EfficiencyServiceGroup[]>(mockEfficiencyServiceGroups);

  React.useEffect(() => {
    const savedS = localStorage.getItem('legis_services');
    if (savedS) setServices(JSON.parse(savedS));
    const savedG = localStorage.getItem('legis_serviceGroups');
    if (savedG) setGroups(JSON.parse(savedG));
  }, []);

  const getScale = (tf: string) => {
    switch (tf) {
      case 'Diário': return 1/30;
      case 'Semanal': return 1/4;
      case '1 Ano': return 12;
      case 'Até 5 Anos': return 60;
      case 'Mensal':
      default: return 1;
    }
  };
  const scale = getScale(timeFilter);

  const baseTotalRevenue = mockMonthlyRevenue.reduce((a, m) => a + m.revenue, 0);
  const baseTotalPending = lawyers.reduce((a, l) => a + (l.pendingPayments || 0), 0);
  const baseClientPending = mockClients.reduce((a, c) => a + c.pendingAmount, 0);
  const baseInternStipends = mockInterns.filter(i => i.status === 'ativo').reduce((a, i) => a + (i.stipend || 0), 0);
  const baseSecretaryFees = mockSecretaries.filter(s => s.status === 'ativo').reduce((a, s) => a + (s.monthlyFee || 0), 0);
  const baseSecretaryPending = mockSecretaries.reduce((a, s) => a + (s.pendingFee || 0), 0);

  // Simulated Services Revenue Base (Mensal)
  const baseServicesRevenue = services.reduce((a, s, idx) => a + (s.price * ((idx + 1) * 3)), 0);

  const totalRevenue = baseTotalRevenue * scale;
  const totalPending = baseTotalPending * scale;
  const clientPending = baseClientPending * scale;
  const internStipends = baseInternStipends * scale;
  const secretaryFees = baseSecretaryFees * scale;
  const servicesRevenue = baseServicesRevenue * scale;

  const maxRev = Math.max(...mockMonthlyRevenue.map(m => m.revenue));

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

  const filteredSecretaries = useMemo(() => mockSecretaries.filter(s =>
    (stateFilter === 'Todos' || s.state === stateFilter) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  ), [stateFilter, search]);

  const filteredServices = useMemo(() => services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  ), [services, search]);

  const tabs: [FilterType, string, React.ReactNode, string][] = [
    ['lawyers', 'Advogados', <IconBriefcase />, ''],
    ['clients', 'Clientes', <IconUsers />, ''],
    ['interns', 'Bacharelandos', <IconGradCap />, ''],
    ['secretaries', 'Secret./Assist. Jurídico', <IconSecretariat />, 'purple'],
    ['services', 'Serviços', <IconSettings />, ''],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionTitle title="Gestão Financeira" subtitle="Receita, pagamentos e remunerações individualizadas por perfil" />
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
          <span className="text-sm font-medium text-gray-700">Período do Relatório:</span>
          <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)} className="text-sm border-none bg-transparent font-bold text-primary focus:outline-none cursor-pointer">
            <option>Diário</option>
            <option>Semanal</option>
            <option>Mensal</option>
            <option>1 Ano</option>
            <option>Até 5 Anos</option>
          </select>
        </div>
      </div>

      {/* Top KPIs — compact horizontal pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: `Receita Base (${timeFilter})`, value: `R$ ${totalRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
          { label: `Receita Serviços (${timeFilter})`, value: `R$ ${servicesRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, color: 'border-orange-200 bg-orange-50 text-orange-800' },
          { label: 'Pendente Advogados', value: `R$ ${totalPending.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, color: 'border-yellow-200 bg-yellow-50 text-yellow-800' },
          { label: 'Pendente Clientes', value: `R$ ${clientPending.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, color: 'border-red-200 bg-red-50 text-red-800' },
          { label: `Bolsas (${timeFilter})`, value: `R$ ${internStipends.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, color: 'border-blue-200 bg-blue-50 text-blue-800' },
          { label: `Secret. (${timeFilter})`, value: `R$ ${secretaryFees.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, color: 'border-purple-200 bg-purple-50 text-purple-800' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`flex flex-col px-4 py-2.5 rounded-xl border ${color} min-w-[140px]`}>
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70 leading-tight">{label}</span>
            <span className="text-base font-bold leading-snug mt-0.5">{value}</span>
          </div>
        ))}
      </div>

      {/* Revenue bar chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-5">Evolução de Receita Mensal</h3>
        <div className="flex items-end gap-3 h-40">
          {mockMonthlyRevenue.map(m => {
            const pct = Math.round((m.revenue / maxRev) * 100);
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-600 font-medium">R$ {(m.revenue / 1000).toFixed(0)}k</span>
                <div className="w-full bg-primary rounded-t-md" style={{ height: `${pct}%`, minHeight: 8 }} />
                <span className="text-xs text-gray-500">{m.month}</span>
                <span className="text-xs text-gray-400">{m.consultations} consul.</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individualized table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            {tabs.map(([t, label, icon, color]) => (
              <button
                key={t}
                onClick={() => { setFilterType(t); setSearch(''); setStateFilter('Todos'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filterType === t
                    ? color === 'purple'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'
                }`}
              >
                <span className="w-4 h-4">{icon}</span>{label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar..." />
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
              {BRAZIL_STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Lawyers */}
          {filterType === 'lawyers' && (
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr><th className="px-5 py-3">Advogado</th><th className="px-5 py-3">UF</th><th className="px-5 py-3">Consul./Mês</th><th className="px-5 py-3">Taxa</th><th className="px-5 py-3">Receita/Mês</th><th className="px-5 py-3">Pendente</th></tr>
              </thead>
              <tbody>
                {filteredLawyers.map(l => (
                  <tr key={l.id} className="border-b hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900 flex items-center gap-2"><img src={l.photoUrl} className="w-7 h-7 rounded-full object-cover" alt="" />{l.name}</td>
                    <td className="px-5 py-3">{l.location.state}</td>
                    <td className="px-5 py-3">{l.consultationsThisMonth ?? '—'}</td>
                    <td className="px-5 py-3">{l.consultationFee ? `R$ ${l.consultationFee}` : '—'}</td>
                    <td className="px-5 py-3 font-semibold text-emerald-700">{l.monthlyRevenue ? `R$ ${l.monthlyRevenue.toLocaleString('pt-BR')}` : '—'}</td>
                    <td className="px-5 py-3 text-yellow-700">{l.pendingPayments ? `R$ ${l.pendingPayments.toLocaleString('pt-BR')}` : '—'}</td>
                  </tr>
                ))}
                {filteredLawyers.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold text-sm border-t">
                <tr>
                  <td colSpan={4} className="px-5 py-3 text-gray-600">Totais</td>
                  <td className="px-5 py-3 text-emerald-700">R$ {filteredLawyers.reduce((a, l) => a + (l.monthlyRevenue || 0), 0).toLocaleString('pt-BR')}</td>
                  <td className="px-5 py-3 text-yellow-700">R$ {filteredLawyers.reduce((a, l) => a + (l.pendingPayments || 0), 0).toLocaleString('pt-BR')}</td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* Clients */}
          {filterType === 'clients' && (
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">UF</th><th className="px-5 py-3">Casos</th><th className="px-5 py-3">Área</th><th className="px-5 py-3">Total Pago</th><th className="px-5 py-3">Pendente</th></tr>
              </thead>
              <tbody>
                {filteredClients.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-5 py-3">{c.state}</td>
                    <td className="px-5 py-3">{c.activeCases}/{c.totalCases}</td>
                    <td className="px-5 py-3 text-xs">{c.lastCaseArea}</td>
                    <td className="px-5 py-3 font-semibold text-emerald-700">R$ {c.totalPaid.toLocaleString('pt-BR')}</td>
                    <td className="px-5 py-3 text-yellow-700">{c.pendingAmount > 0 ? `R$ ${c.pendingAmount.toLocaleString('pt-BR')}` : '—'}</td>
                  </tr>
                ))}
                {filteredClients.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold text-sm border-t">
                <tr>
                  <td colSpan={4} className="px-5 py-3 text-gray-600">Totais</td>
                  <td className="px-5 py-3 text-emerald-700">R$ {filteredClients.reduce((a, c) => a + c.totalPaid, 0).toLocaleString('pt-BR')}</td>
                  <td className="px-5 py-3 text-yellow-700">R$ {filteredClients.reduce((a, c) => a + c.pendingAmount, 0).toLocaleString('pt-BR')}</td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* Interns */}
          {filterType === 'interns' && (
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr><th className="px-5 py-3">Bacharelando</th><th className="px-5 py-3">UF</th><th className="px-5 py-3">Horas</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Bolsa/Mês</th><th className="px-5 py-3">Total Recebido</th></tr>
              </thead>
              <tbody>
                {filteredInterns.map(i => (
                  <tr key={i.id} className="border-b hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{i.name}</td>
                    <td className="px-5 py-3">{i.state}</td>
                    <td className="px-5 py-3">{i.hoursCompleted}/{i.availableHours}h</td>
                    <td className="px-5 py-3 capitalize">{i.status}</td>
                    <td className="px-5 py-3 font-semibold text-blue-700">{i.stipend ? `R$ ${i.stipend.toLocaleString('pt-BR')}` : '—'}</td>
                    <td className="px-5 py-3 text-emerald-700">{i.totalEarned ? `R$ ${i.totalEarned.toLocaleString('pt-BR')}` : '—'}</td>
                  </tr>
                ))}
                {filteredInterns.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold text-sm border-t">
                <tr>
                  <td colSpan={4} className="px-5 py-3 text-gray-600">Totais</td>
                  <td className="px-5 py-3 text-blue-700">R$ {filteredInterns.reduce((a, i) => a + (i.stipend || 0), 0).toLocaleString('pt-BR')}/mês</td>
                  <td className="px-5 py-3 text-emerald-700">R$ {filteredInterns.reduce((a, i) => a + (i.totalEarned || 0), 0).toLocaleString('pt-BR')}</td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* ─── Secretaries ─────────────────────────────────────────────────── */}
          {filterType === 'secretaries' && (
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-purple-50 border-b border-purple-100">
                <tr>
                  <th className="px-5 py-3">Secretário(a)</th>
                  <th className="px-5 py-3">UF</th>
                  <th className="px-5 py-3">Experiência</th>
                  <th className="px-5 py-3">Disponibilidade</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Honorário/Mês</th>
                  <th className="px-5 py-3">Pendente</th>
                  <th className="px-5 py-3">Total Recebido</th>
                </tr>
              </thead>
              <tbody>
                {filteredSecretaries.map(s => {
                  const availLabel = s.availability === 'integral' ? 'Integral' : s.availability === 'meio-periodo' ? 'Meio Período' : 'Freelancer';
                  return (
                    <tr key={s.id} className="border-b hover:bg-purple-50/40">
                      <td className="px-5 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          {s.name}
                        </div>
                      </td>
                      <td className="px-5 py-3">{s.state}</td>
                      <td className="px-5 py-3">{s.experience} anos</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          s.availability === 'integral' ? 'bg-blue-50 text-blue-700' :
                          s.availability === 'meio-periodo' ? 'bg-indigo-50 text-indigo-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {availLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          s.status === 'ativo' ? 'bg-green-100 text-green-700' :
                          s.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-purple-700">
                        {s.monthlyFee ? `R$ ${s.monthlyFee.toLocaleString('pt-BR')}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-yellow-700">
                        {s.pendingFee && s.pendingFee > 0 ? `R$ ${s.pendingFee.toLocaleString('pt-BR')}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-emerald-700">
                        {s.totalEarned ? `R$ ${s.totalEarned.toLocaleString('pt-BR')}` : '—'}
                      </td>
                    </tr>
                  );
                })}
                {filteredSecretaries.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>
                )}
              </tbody>
              <tfoot className="bg-purple-50 font-semibold text-sm border-t border-purple-100">
                <tr>
                  <td colSpan={5} className="px-5 py-3 text-gray-600">Totais</td>
                  <td className="px-5 py-3 text-purple-700">
                    R$ {filteredSecretaries.reduce((a, s) => a + (s.monthlyFee || 0), 0).toLocaleString('pt-BR')}/mês
                  </td>
                  <td className="px-5 py-3 text-yellow-700">
                    R$ {filteredSecretaries.reduce((a, s) => a + (s.pendingFee || 0), 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-5 py-3 text-emerald-700">
                    R$ {filteredSecretaries.reduce((a, s) => a + (s.totalEarned || 0), 0).toLocaleString('pt-BR')}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* Services */}
          {filterType === 'services' && (
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr><th className="px-5 py-3">Serviço</th><th className="px-5 py-3">Grupo</th><th className="px-5 py-3 text-right">Valor Padrão</th><th className="px-5 py-3 text-right">Contratos (Simulado)</th><th className="px-5 py-3 text-right">Receita Estimada</th></tr>
              </thead>
              <tbody>
                {filteredServices.map((s, idx) => {
                  const group = groups.find(g => g.id === s.groupId);
                  const simulatedContracts = (idx + 1) * 3;
                  const estimatedRev = s.price * simulatedContracts;
                  return (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-5 py-3">{group?.name || '—'}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-700">R$ {s.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-5 py-3 text-right">{simulatedContracts} ativos</td>
                      <td className="px-5 py-3 text-right font-bold text-emerald-700">R$ {estimatedRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
                {filteredServices.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold text-sm border-t">
                <tr>
                  <td colSpan={4} className="px-5 py-3 text-gray-600">Receita Total Estimada (Serviços)</td>
                  <td className="px-5 py-3 text-emerald-700 text-right">
                    R$ {filteredServices.reduce((a, s, idx) => a + (s.price * ((idx + 1) * 3)), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
