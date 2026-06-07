import React, { useState, useMemo } from 'react';
import { mockClients, mockInterns } from '../../services/mockDataService';
import type { MockClient, MockIntern } from '../../services/mockDataService';
import { SearchInput, SectionTitle, clientStatusBadge, internStatusBadge, IconX, IconEdit } from './AdminShared';

// ─── Clients Tab ─────────────────────────────────────────────────────────────
export const ClientsTab: React.FC<{ onEditClient?: (c: MockClient) => void }> = ({ onEditClient }) => {
  const [clients, setClients] = useState(mockClients);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | MockClient['status']>('todos');
  const [selected, setSelected] = useState<MockClient | null>(null);

  const filtered = useMemo(() =>
    clients.filter(c =>
      (filter === 'todos' || c.status === filter) &&
      c.name.toLowerCase().includes(search.toLowerCase())
    ), [clients, search, filter]);

  const toggleStatus = (id: number) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'ativo' ? 'inativo' as const : 'ativo' as const } : c));
  };

  if (selected) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline mb-5">← Voltar</button>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
          {clientStatusBadge(selected.status)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            ['E-mail', selected.email],
            ['Telefone', selected.phone],
            ['CPF', selected.cpf],
            ['Endereço', selected.address],
            ['Cidade / Estado', `${selected.city}, ${selected.state}`],
            ['Casos Ativos', String(selected.activeCases)],
            ['Total de Casos', String(selected.totalCases)],
            ['Área do Último Caso', selected.lastCaseArea],
            ['Cadastro', new Date(selected.joinedDate).toLocaleDateString('pt-BR')],
            ['Total Pago', `R$ ${selected.totalPaid.toLocaleString('pt-BR')}`],
            ['Pendente', selected.pendingAmount > 0 ? `R$ ${selected.pendingAmount.toLocaleString('pt-BR')}` : '—'],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
              <p className="font-medium text-gray-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        {selected.notes && (
          <div className="mt-4 bg-yellow-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Observações</p>
            <p className="text-sm text-gray-700 mt-1">{selected.notes}</p>
          </div>
        )}
        <div className="mt-5 flex gap-3">
          <button onClick={() => toggleStatus(selected.id)} className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${selected.status === 'ativo' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
            {selected.status === 'ativo' ? 'Desativar' : 'Reativar'}
          </button>
          {onEditClient && <button onClick={() => onEditClient(selected)} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"><IconEdit /> Editar Cadastro</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionTitle title="Clientes" subtitle="Gerencie e visualize todos os clientes cadastrados" />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome..." /></div>
        <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
          <option value="todos">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-5 py-3">Cidade/UF</th>
              <th className="px-5 py-3">Casos</th>
              <th className="px-5 py-3">Total Pago</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-5 py-3">{c.email}</td>
                <td className="px-5 py-3">{c.city}/{c.state}</td>
                <td className="px-5 py-3">{c.activeCases} ativos / {c.totalCases} total</td>
                <td className="px-5 py-3 font-semibold text-emerald-700">R$ {c.totalPaid.toLocaleString('pt-BR')}</td>
                <td className="px-5 py-3">{clientStatusBadge(c.status)}</td>
                <td className="px-5 py-3 text-center space-x-2">
                  <button onClick={() => setSelected(c)} className="text-primary text-xs font-medium hover:underline">Ver</button>
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

// ─── Interns Tab ─────────────────────────────────────────────────────────────
export const InternsTab: React.FC<{ onEditIntern?: (i: MockIntern) => void }> = ({ onEditIntern }) => {
  const [interns, setInterns] = useState(mockInterns);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | MockIntern['status']>('todos');
  const [selected, setSelected] = useState<MockIntern | null>(null);

  const filtered = useMemo(() =>
    interns.filter(i =>
      (filter === 'todos' || i.status === filter) &&
      (i.name.toLowerCase().includes(search.toLowerCase()) || i.university.toLowerCase().includes(search.toLowerCase()))
    ), [interns, search, filter]);

  const toggleStatus = (id: number, curr: MockIntern['status']) => {
    const next: MockIntern['status'] = curr === 'ativo' ? 'inativo' : 'ativo';
    setInterns(prev => prev.map(i => i.id === id ? { ...i, status: next } : i));
  };

  if (selected) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline mb-5">← Voltar</button>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
          {internStatusBadge(selected.status)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            ['E-mail', selected.email],
            ['Telefone', selected.phone],
            ['CPF', selected.cpf || '—'],
            ['Cidade / Estado', `${selected.city}, ${selected.state}`],
            ['Universidade', selected.university],
            ['Semestre', selected.semester],
            ['Interesse', selected.specialtyInterest],
            ['Horas', `${selected.hoursCompleted}/${selected.availableHours}h`],
            ['Cadastro', new Date(selected.joinedDate).toLocaleDateString('pt-BR')],
            ['Bolsa Mensal', selected.stipend ? `R$ ${selected.stipend.toLocaleString('pt-BR')}` : '—'],
            ['Total Recebido', selected.totalEarned ? `R$ ${selected.totalEarned.toLocaleString('pt-BR')}` : '—'],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
              <p className="font-medium text-gray-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        {selected.notes && (
          <div className="mt-4 bg-yellow-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Observações</p>
            <p className="text-sm text-gray-700 mt-1">{selected.notes}</p>
          </div>
        )}
        <div className="mt-5 flex gap-3">
          <button onClick={() => toggleStatus(selected.id, selected.status)} className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${selected.status === 'ativo' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
            {selected.status === 'ativo' ? 'Desativar' : 'Ativar'}
          </button>
          {onEditIntern && <button onClick={() => onEditIntern(selected)} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"><IconEdit /> Editar Cadastro</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionTitle title="Estudantes" subtitle="Gerencie os estudantes e estagiários cadastrados" />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome ou universidade..." /></div>
        <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
          <option value="todos">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="pendente">Pendentes</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">Universidade</th>
              <th className="px-5 py-3">Cidade/UF</th>
              <th className="px-5 py-3">Interesse</th>
              <th className="px-5 py-3">Horas</th>
              <th className="px-5 py-3">Bolsa</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-900">{i.name}</td>
                <td className="px-5 py-3">{i.university}</td>
                <td className="px-5 py-3">{i.city}/{i.state}</td>
                <td className="px-5 py-3">{i.specialtyInterest}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.round((i.hoursCompleted / i.availableHours) * 100)}%` }} />
                    </div>
                    <span className="text-xs">{i.hoursCompleted}h</span>
                  </div>
                </td>
                <td className="px-5 py-3 font-semibold text-blue-700">{i.stipend ? `R$ ${i.stipend}` : '—'}</td>
                <td className="px-5 py-3">{internStatusBadge(i.status)}</td>
                <td className="px-5 py-3 text-center space-x-2">
                  <button onClick={() => setSelected(i)} className="text-primary text-xs font-medium hover:underline">Ver</button>
                  <button onClick={() => toggleStatus(i.id, i.status)} className={`text-xs font-medium hover:underline ${i.status === 'ativo' ? 'text-red-600' : 'text-green-600'}`}>
                    {i.status === 'ativo' ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-400">Nenhum resultado encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">{filtered.length} de {interns.length} estudantes</p>
    </div>
  );
};
