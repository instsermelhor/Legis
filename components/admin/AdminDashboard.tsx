import React, { useState, useMemo } from 'react';
import type { Lawyer } from '../../types';
import { mockLawyers } from '../../services/mockLawyerService';
import { mockClients, mockInterns, mockMonthlyRevenue } from '../../services/mockDataService';
import type { MockClient, MockIntern } from '../../services/mockDataService';
import { SpecialtyPieChart } from './SpecialtyPieChart';

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon: React.FC<{ d: string; className?: string }> = ({ d, className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);
const IconBriefcase = () => <Icon d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />;
const IconUsers = () => <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z" />;
const IconGradCap = () => <Icon d="M12 14l9-5-9-5-9 5 9 5zm0 0v6M5 9.5l-2 1.12V16m16-5.5v5.38" />;
const IconMoney = () => <Icon d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
const IconChart = () => <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
const IconSettings = () => <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />;
const IconShield = () => <Icon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />;

// ─── Shared Components ───────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string }> = ({ icon, label, value, sub, color = 'bg-primary/10' }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
    <div className={`${color} p-3 rounded-full`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Pesquisar...'}
      className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-full"
    />
  </div>
);

const Badge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${color}`}>{label}</span>
);

const lawyerStatusBadge = (s: Lawyer['status']) => {
  const map = { verificado: ['Verificado', 'bg-green-100 text-green-800'], pendente: ['Pendente', 'bg-yellow-100 text-yellow-800'], suspenso: ['Suspenso', 'bg-red-100 text-red-800'] };
  return <Badge label={map[s][0]} color={map[s][1]} />;
};
const clientStatusBadge = (s: MockClient['status']) => {
  const map = { ativo: ['Ativo', 'bg-green-100 text-green-800'], inativo: ['Inativo', 'bg-gray-100 text-gray-600'] };
  return <Badge label={map[s][0]} color={map[s][1]} />;
};
const internStatusBadge = (s: MockIntern['status']) => {
  const map = { ativo: ['Ativo', 'bg-green-100 text-green-800'], pendente: ['Pendente', 'bg-yellow-100 text-yellow-800'], inativo: ['Inativo', 'bg-gray-100 text-gray-600'] };
  return <Badge label={map[s][0]} color={map[s][1]} />;
};

// ─── Tab: Visão Geral ────────────────────────────────────────────────────────
const OverviewTab: React.FC<{ lawyers: Lawyer[] }> = ({ lawyers }) => {
  const stats = useMemo(() => ({
    totalLawyers: lawyers.length,
    verifiedLawyers: lawyers.filter(l => l.status === 'verificado').length,
    pendingLawyers: lawyers.filter(l => l.status === 'pendente').length,
    totalClients: mockClients.length,
    activeClients: mockClients.filter(c => c.status === 'ativo').length,
    totalInterns: mockInterns.length,
    totalRevenue: mockMonthlyRevenue.reduce((a, m) => a + m.revenue, 0),
    lastMonthRevenue: mockMonthlyRevenue[mockMonthlyRevenue.length - 1].revenue,
  }), [lawyers]);

  const specialtyDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    lawyers.forEach(l => l.specialties.forEach(s => { counts[s] = (counts[s] || 0) + 1; }));
    return counts;
  }, [lawyers]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<span className="text-primary"><IconBriefcase /></span>} label="Advogados Cadastrados" value={stats.totalLawyers} sub={`${stats.verifiedLawyers} verificados · ${stats.pendingLawyers} pendentes`} />
        <StatCard icon={<span className="text-blue-600"><IconUsers /></span>} label="Clientes" value={stats.totalClients} sub={`${stats.activeClients} ativos`} color="bg-blue-100" />
        <StatCard icon={<span className="text-purple-600"><IconGradCap /></span>} label="Estudantes" value={stats.totalInterns} sub="cadastrados na plataforma" color="bg-purple-100" />
        <StatCard icon={<span className="text-emerald-600"><IconMoney /></span>} label="Receita Último Mês" value={`R$ ${stats.lastMonthRevenue.toLocaleString('pt-BR')}`} sub="estimado" color="bg-emerald-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Advogados por Especialidade</h3>
          <SpecialtyPieChart data={specialtyDistribution} />
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
    </div>
  );
};

// ─── Tab: Advogados ──────────────────────────────────────────────────────────
const LawyersTab: React.FC<{ lawyers: Lawyer[]; onStatusChange: (id: number, s: Lawyer['status']) => void }> = ({ lawyers, onStatusChange }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | Lawyer['status']>('todos');
  const [selected, setSelected] = useState<Lawyer | null>(null);

  const filtered = useMemo(() =>
    lawyers.filter(l =>
      (filter === 'todos' || l.status === filter) &&
      (l.name.toLowerCase().includes(search.toLowerCase()) ||
       l.oab.toLowerCase().includes(search.toLowerCase()) ||
       l.specialties.join(' ').toLowerCase().includes(search.toLowerCase()))
    ),
    [lawyers, search, filter]
  );

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
            ['Receita Mensal (Est.)', selected.monthlyRevenue ? `R$ ${selected.monthlyRevenue.toLocaleString('pt-BR')}` : '—'],
            ['Pagamentos Pendentes', selected.pendingPayments ? `R$ ${selected.pendingPayments.toLocaleString('pt-BR')}` : '—'],
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
            <tr>
              <th className="px-5 py-3">Advogado</th>
              <th className="px-5 py-3">OAB</th>
              <th className="px-5 py-3">Especialidades</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-900 flex items-center gap-3">
                  <img src={l.photoUrl} alt={l.name} className="w-8 h-8 rounded-full object-cover" />
                  {l.name}
                </td>
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

// ─── Tab: Clientes ───────────────────────────────────────────────────────────
const ClientsTab: React.FC = () => {
  const [clients, setClients] = useState(mockClients);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | MockClient['status']>('todos');

  const filtered = useMemo(() =>
    clients.filter(c =>
      (filter === 'todos' || c.status === filter) &&
      c.name.toLowerCase().includes(search.toLowerCase())
    ), [clients, search, filter]);

  const toggleStatus = (id: number) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'ativo' ? 'inativo' : 'ativo' } : c));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome..." /></div>
        <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="todos">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-5 py-3">Telefone</th>
              <th className="px-5 py-3">Casos</th>
              <th className="px-5 py-3">Cadastro</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-5 py-3">{c.email}</td>
                <td className="px-5 py-3">{c.phone}</td>
                <td className="px-5 py-3">{c.activeCases} ativos / {c.totalCases} total</td>
                <td className="px-5 py-3">{new Date(c.joinedDate).toLocaleDateString('pt-BR')}</td>
                <td className="px-5 py-3">{clientStatusBadge(c.status)}</td>
                <td className="px-5 py-3 text-center">
                  <button onClick={() => toggleStatus(c.id)} className={`text-xs font-medium hover:underline ${c.status === 'ativo' ? 'text-red-600' : 'text-green-600'}`}>
                    {c.status === 'ativo' ? 'Desativar' : 'Reativar'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">Nenhum resultado encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">{filtered.length} de {clients.length} clientes</p>
    </div>
  );
};

// ─── Tab: Estudantes ─────────────────────────────────────────────────────────
const InternsTab: React.FC = () => {
  const [interns, setInterns] = useState(mockInterns);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | MockIntern['status']>('todos');

  const filtered = useMemo(() =>
    interns.filter(i =>
      (filter === 'todos' || i.status === filter) &&
      (i.name.toLowerCase().includes(search.toLowerCase()) ||
       i.university.toLowerCase().includes(search.toLowerCase()))
    ), [interns, search, filter]);

  const toggleStatus = (id: number, curr: MockIntern['status']) => {
    const next: MockIntern['status'] = curr === 'ativo' ? 'inativo' : 'ativo';
    setInterns(prev => prev.map(i => i.id === id ? { ...i, status: next } : i));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome ou universidade..." /></div>
        <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="todos">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="pendente">Pendentes</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">Universidade</th>
              <th className="px-5 py-3">Semestre</th>
              <th className="px-5 py-3">Interesse</th>
              <th className="px-5 py-3">Horas</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-900">{i.name}</td>
                <td className="px-5 py-3">{i.university}</td>
                <td className="px-5 py-3">{i.semester}</td>
                <td className="px-5 py-3">{i.specialtyInterest}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.round((i.hoursCompleted / i.availableHours) * 100)}%` }} />
                    </div>
                    <span>{i.hoursCompleted}/{i.availableHours}h</span>
                  </div>
                </td>
                <td className="px-5 py-3">{internStatusBadge(i.status)}</td>
                <td className="px-5 py-3 text-center">
                  <button onClick={() => toggleStatus(i.id, i.status)} className={`text-xs font-medium hover:underline ${i.status === 'ativo' ? 'text-red-600' : 'text-green-600'}`}>
                    {i.status === 'ativo' ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">Nenhum resultado encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">{filtered.length} de {interns.length} estudantes</p>
    </div>
  );
};

// ─── Tab: Financeiro ─────────────────────────────────────────────────────────
const FinanceTab: React.FC<{ lawyers: Lawyer[] }> = ({ lawyers }) => {
  const totalRevenue = mockMonthlyRevenue.reduce((a, m) => a + m.revenue, 0);
  const totalPending = lawyers.reduce((a, l) => a + (l.pendingPayments || 0), 0);
  const maxRev = Math.max(...mockMonthlyRevenue.map(m => m.revenue));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<span className="text-emerald-600"><IconMoney /></span>} label="Receita Total (6 meses)" value={`R$ ${totalRevenue.toLocaleString('pt-BR')}`} color="bg-emerald-100" />
        <StatCard icon={<span className="text-yellow-600"><IconShield /></span>} label="Pagamentos Pendentes" value={`R$ ${totalPending.toLocaleString('pt-BR')}`} color="bg-yellow-100" />
        <StatCard icon={<span className="text-blue-600"><IconChart /></span>} label="Consultas (último mês)" value={mockMonthlyRevenue[mockMonthlyRevenue.length - 1].consultations} color="bg-blue-100" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-5">Evolução de Receita</h3>
        <div className="flex items-end gap-3 h-40">
          {mockMonthlyRevenue.map(m => {
            const pct = Math.round((m.revenue / maxRev) * 100);
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-600 font-medium">R$ {(m.revenue / 1000).toFixed(0)}k</span>
                <div className="w-full bg-primary rounded-t-md" style={{ height: `${pct}%`, minHeight: 8 }} />
                <span className="text-xs text-gray-500">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <h3 className="text-base font-bold text-gray-800 p-5 border-b">Receita por Advogado</h3>
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-5 py-3">Advogado</th>
              <th className="px-5 py-3">Especialidade</th>
              <th className="px-5 py-3">Consultas/Mês</th>
              <th className="px-5 py-3">Taxa</th>
              <th className="px-5 py-3">Receita Mensal</th>
              <th className="px-5 py-3">Pendente</th>
            </tr>
          </thead>
          <tbody>
            {lawyers.map(l => (
              <tr key={l.id} className="border-b hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{l.name}</td>
                <td className="px-5 py-3 text-xs">{l.specialties[0]}</td>
                <td className="px-5 py-3">{l.consultationsThisMonth ?? '—'}</td>
                <td className="px-5 py-3">{l.consultationFee ? `R$ ${l.consultationFee}` : '—'}</td>
                <td className="px-5 py-3 font-semibold text-emerald-700">{l.monthlyRevenue ? `R$ ${l.monthlyRevenue.toLocaleString('pt-BR')}` : '—'}</td>
                <td className="px-5 py-3 text-yellow-700">{l.pendingPayments ? `R$ ${l.pendingPayments.toLocaleString('pt-BR')}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Tab: Configurações ──────────────────────────────────────────────────────
const SettingsTab: React.FC<{ onNavigate: (view: 'etica') => void }> = ({ onNavigate }) => {
  const [siteName, setSiteName] = useState('Legis Connect');
  const [siteTagline, setSiteTagline] = useState('A solução para seus problemas jurídicos.');
  const [footerText, setFooterText] = useState('© 2025 Legis Connect. Todos os direitos reservados.');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-800">Configurações Gerais</h3>
        {[
          { label: 'Nome do site', value: siteName, set: setSiteName },
          { label: 'Slogan principal', value: siteTagline, set: setSiteTagline },
          { label: 'Texto do rodapé', value: footerText, set: setFooterText },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{f.label}</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" value={f.value} onChange={e => f.set(e.target.value)} />
          </div>
        ))}
        <button onClick={handleSave} className="mt-2 px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">
          {saved ? '✓ Salvo!' : 'Salvar Configurações'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-1">Documentos Legais</h3>
        <p className="text-sm text-gray-500 mb-4">Documentos exibidos para advogados e clientes na plataforma.</p>
        <div className="space-y-3">
          {[
            ['Código de Ética e Disciplina da OAB', 'Disponível — texto completo integrado'],
            ['Termos de Serviço', 'Disponível'],
            ['Política de Privacidade', 'Disponível'],
            ['LGPD — Lei nº 13.709/2018', 'Referenciada no disclaimer'],
          ].map(([doc, status]) => (
            <div key={doc} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm text-gray-700">{doc}</span>
              <span className="text-xs text-green-600 font-medium">{status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-1">Credenciais de Acesso Administrativo</h3>
        <p className="text-sm text-gray-500 mb-3">Credentials de acesso ao painel.</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">E-mail</p><p className="font-medium text-gray-800">admin@legisconnect.com.br</p></div>
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Senha</p><p className="font-medium text-gray-800">legisadmin</p></div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Admin Dashboard ────────────────────────────────────────────────────
type Tab = 'overview' | 'lawyers' | 'clients' | 'interns' | 'finance' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',  label: 'Visão Geral',  icon: <IconChart /> },
  { id: 'lawyers',   label: 'Advogados',    icon: <IconBriefcase /> },
  { id: 'clients',   label: 'Clientes',     icon: <IconUsers /> },
  { id: 'interns',   label: 'Estudantes',   icon: <IconGradCap /> },
  { id: 'finance',   label: 'Financeiro',   icon: <IconMoney /> },
  { id: 'settings',  label: 'Configurações',icon: <IconSettings /> },
];

interface AdminDashboardProps {
  onNavigate: (view: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [lawyers, setLawyers] = useState<Lawyer[]>(mockLawyers);

  const handleStatusChange = (id: number, status: Lawyer['status']) => {
    setLawyers(prev => prev.map(l => l.id === id ? { ...l, status } : l));
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
        <aside className="md:w-56 shrink-0 bg-white border-r md:min-h-screen">
          <nav className="p-3 space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <span className="w-5 h-5 shrink-0">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview'  && <OverviewTab lawyers={lawyers} />}
          {activeTab === 'lawyers'   && <LawyersTab lawyers={lawyers} onStatusChange={handleStatusChange} />}
          {activeTab === 'clients'   && <ClientsTab />}
          {activeTab === 'interns'   && <InternsTab />}
          {activeTab === 'finance'   && <FinanceTab lawyers={lawyers} />}
          {activeTab === 'settings'  && <SettingsTab onNavigate={() => {}} />}
        </main>
      </div>
    </div>
  );
};
