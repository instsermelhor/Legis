import React, { useState, useMemo } from 'react';
import type { Lawyer } from '../../types';
import { mockClients, mockInterns, mockMonthlyRevenue } from '../../services/mockDataService';
import { StatCard, SectionTitle, SearchInput, IconMoney, IconShield, IconChart, IconBriefcase, IconUsers, IconGradCap } from './AdminShared';

const BRAZIL_STATES = ['Todos', 'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
type FilterType = 'lawyers' | 'clients' | 'interns';

export const FinanceTab: React.FC<{ lawyers: Lawyer[]; initialFilter?: string }> = ({ lawyers, initialFilter }) => {
  const [filterType, setFilterType] = useState<FilterType>(
    initialFilter === 'clients' ? 'clients' : initialFilter === 'interns' ? 'interns' : 'lawyers'
  );
  const [stateFilter, setStateFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  const totalRevenue = mockMonthlyRevenue.reduce((a, m) => a + m.revenue, 0);
  const totalPending = lawyers.reduce((a, l) => a + (l.pendingPayments || 0), 0);
  const clientPending = mockClients.reduce((a, c) => a + c.pendingAmount, 0);
  const internStipends = mockInterns.filter(i => i.status === 'ativo').reduce((a, i) => a + (i.stipend || 0), 0);
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

  return (
    <div className="space-y-6">
      <SectionTitle title="Gestão Financeira" subtitle="Receita e pagamentos individualizados por perfil" />

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<span className="text-emerald-600"><IconMoney /></span>} label="Receita Total (6 meses)" value={`R$ ${totalRevenue.toLocaleString('pt-BR')}`} color="bg-emerald-100" />
        <StatCard icon={<span className="text-yellow-600"><IconShield /></span>} label="Pendente (Advogados)" value={`R$ ${totalPending.toLocaleString('pt-BR')}`} color="bg-yellow-100" />
        <StatCard icon={<span className="text-orange-600"><IconShield /></span>} label="Pendente (Clientes)" value={`R$ ${clientPending.toLocaleString('pt-BR')}`} color="bg-orange-100" />
        <StatCard icon={<span className="text-blue-600"><IconGradCap /></span>} label="Bolsas Ativas/Mês" value={`R$ ${internStipends.toLocaleString('pt-BR')}`} color="bg-blue-100" />
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
          <div className="flex gap-2">
            {([['lawyers', 'Advogados', <IconBriefcase />], ['clients', 'Clientes', <IconUsers />], ['interns', 'Estudantes', <IconGradCap />]] as [FilterType, string, React.ReactNode][]).map(([t, label, icon]) => (
              <button key={t} onClick={() => { setFilterType(t); setSearch(''); setStateFilter('Todos'); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterType === t ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'}`}>
                <span className="w-4 h-4">{icon}</span>{label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar..." />
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30">
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
                <tr><th className="px-5 py-3">Estudante</th><th className="px-5 py-3">UF</th><th className="px-5 py-3">Horas</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Bolsa/Mês</th><th className="px-5 py-3">Total Recebido</th></tr>
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
        </div>
      </div>
    </div>
  );
};
