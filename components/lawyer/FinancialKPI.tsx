/**
 * FinancialKPI.tsx
 * KPI financeiro completo para o Painel do Advogado.
 * Inclui: cards de resumo, histórico de faturamento por mês,
 * tabela de transações com filtros e exportação CSV.
 */
import React, { useState, useMemo } from 'react';
import { dbFinancial } from '../../services/dbService';
import type { FinancialTransaction } from '../../services/dbService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function groupByMonth(txs: FinancialTransaction[]) {
  const now = new Date();
  const result: { month: string; received: number; pending: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const month = MONTHS[d.getMonth()];
    const monthTxs = txs.filter(t => t.date.startsWith(key));
    result.push({
      month,
      received: monthTxs.filter(t => t.status === 'recebido').reduce((s, t) => s + t.amount, 0),
      pending: monthTxs.filter(t => t.status !== 'recebido').reduce((s, t) => s + t.amount, 0),
    });
  }
  return result;
}

function exportCSV(txs: FinancialTransaction[]) {
  const header = 'Data,Cliente,Descrição,Valor,Status';
  const rows = txs.map(t =>
    `${t.date},${t.clientName},"${t.description}",${t.amount},${t.status}`
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
const BarChart: React.FC<{ data: { month: string; received: number; pending: number }[] }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.received + d.pending), 1);
  return (
    <div className="flex items-end gap-2 h-28 mt-2">
      {data.map(d => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex flex-col justify-end" style={{ height: 88 }}>
            {d.received > 0 && (
              <div
                className="w-full bg-primary/80 rounded-t"
                style={{ height: `${(d.received / max) * 88}px` }}
                title={`Recebido: ${fmt(d.received)}`}
              />
            )}
            {d.pending > 0 && (
              <div
                className="w-full bg-amber-400/70 rounded-t"
                style={{ height: `${(d.pending / max) * 88}px`, marginTop: 1 }}
                title={`Pendente: ${fmt(d.pending)}`}
              />
            )}
          </div>
          <span className="text-xs text-gray-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: FinancialTransaction['status'] }> = ({ status }) => {
  const map = {
    recebido: 'bg-green-100 text-green-800',
    pendente: 'bg-amber-100 text-amber-800',
    inadimplente: 'bg-red-100 text-red-800',
  };
  const label = { recebido: 'Recebido', pendente: 'Pendente', inadimplente: 'Inadimplente' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status]}`}>{label[status]}</span>;
};

// ─── Main Component ───────────────────────────────────────────────────────────
interface FinancialKPIProps {
  lawyerId?: number;
}

export const FinancialKPI: React.FC<FinancialKPIProps> = ({ lawyerId }) => {
  const [txs] = useState<FinancialTransaction[]>(() => dbFinancial.getAll(lawyerId));
  const [period, setPeriod] = useState<'all' | '30' | '90' | '365'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | FinancialTransaction['status']>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const now = new Date();
    return txs.filter(t => {
      if (period !== 'all') {
        const diff = (now.getTime() - new Date(t.date).getTime()) / 86400000;
        if (diff > Number(period)) return false;
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (search && !t.clientName.toLowerCase().includes(search.toLowerCase()) &&
          !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [txs, period, statusFilter, search]);

  const totalRecebido = filtered.filter(t => t.status === 'recebido').reduce((s, t) => s + t.amount, 0);
  const totalPendente = filtered.filter(t => t.status === 'pendente').reduce((s, t) => s + t.amount, 0);
  const totalInadim = filtered.filter(t => t.status === 'inadimplente').reduce((s, t) => s + t.amount, 0);
  const totalGeral = totalRecebido + totalPendente + totalInadim;

  const chartData = groupByMonth(txs);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-700">Resumo Financeiro</h2>
        <button
          onClick={() => exportCSV(filtered)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 shadow-sm transition-colors dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
        >
          ⬇ Exportar Relatório CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Faturamento Total', value: fmt(totalGeral), color: 'text-gray-800', bg: 'bg-white' },
          { label: 'Recebido', value: fmt(totalRecebido), color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Pendente', value: fmt(totalPendente), color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Inadimplente', value: fmt(totalInadim), color: 'text-red-700', bg: 'bg-red-50' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} p-4 rounded-xl border border-gray-200 shadow-sm`}>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{k.label}</p>
            <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Histórico — Últimos 6 meses</p>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/80 inline-block"/> Recebido</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400/70 inline-block"/> Pendente</span>
          </div>
        </div>
        <BarChart data={chartData} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Filtrar Transações</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Período</label>
            <select value={period} onChange={e => setPeriod(e.target.value as typeof period)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <option value="all">Todos</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <option value="all">Todos</option>
              <option value="recebido">Recebido</option>
              <option value="pendente">Pendente</option>
              <option value="inadimplente">Inadimplente</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Cliente ou descrição..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{t.clientName}</td>
                <td className="px-4 py-3">{t.description}</td>
                <td className="px-4 py-3 font-semibold">{fmt(t.amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Nenhuma transação encontrada.</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t flex justify-between items-center text-xs text-gray-500">
          <span>{filtered.length} transações</span>
          <span>Total recebido no filtro: <strong className="text-green-700">{fmt(totalRecebido)}</strong></span>
        </div>
      </div>
    </div>
  );
};
