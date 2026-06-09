/**
 * FinancialKPI.tsx
 * KPI financeiro completo para o Painel do Advogado.
 * Inclui: cards de resumo, histórico de faturamento por mês,
 * tabela de transações com filtros e exportação CSV.
 */
import React, { useState, useMemo } from 'react';
import { dbFinancial } from '../../services/dbService';
import type { FinancialTransaction } from '../../services/dbService';
import { mockProcessosService } from '../../services/mockProcessosService';
import type { Processo } from '../../services/mockProcessosService';
import { mockLawyers } from '../../services/mockLawyerService';

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
  const header = 'Data,Cliente,Descrição,Valor,Status,Processo';
  const rows = txs.map(t =>
    `${t.date},"${t.clientName.replace(/"/g, '""')}","${t.description.replace(/"/g, '""')}",${t.amount},${t.status},"${t.caseId || ''}"`
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a); // required for Firefox
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportXLSX(txs: FinancialTransaction[]) {
  let xml = '<?xml version="1.0" encoding="utf-8"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40"><Worksheet ss:Name="Financeiro"><Table>';
  xml += '<Row><Cell><Data ss:Type="String">Data</Data></Cell><Cell><Data ss:Type="String">Cliente</Data></Cell><Cell><Data ss:Type="String">Descrição</Data></Cell><Cell><Data ss:Type="String">Valor</Data></Cell><Cell><Data ss:Type="String">Status</Data></Cell><Cell><Data ss:Type="String">Processo</Data></Cell></Row>';
  txs.forEach(t => {
    const dateStr = new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    xml += `<Row><Cell><Data ss:Type="String">${dateStr}</Data></Cell><Cell><Data ss:Type="String">${t.clientName}</Data></Cell><Cell><Data ss:Type="String">${t.description}</Data></Cell><Cell><Data ss:Type="Number">${t.amount}</Data></Cell><Cell><Data ss:Type="String">${t.status}</Data></Cell><Cell><Data ss:Type="String">${t.caseId || ''}</Data></Cell></Row>`;
  });
  xml += '</Table></Worksheet></Workbook>';
  const blob = new Blob([xml], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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
  const [period, setPeriod] = useState<'all' | '30' | '60' | '90' | '120' | '365'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | FinancialTransaction['status']>('all');
  const [search, setSearch] = useState('');
  const [processSearch, setProcessSearch] = useState('');

  const [processList, setProcessList] = useState<Processo[]>(() => mockProcessosService.getProcessos());
  const [unlockedProcessIds, setUnlockedProcessIds] = useState<number[]>([]);
  
  // Validation States
  const [validatingProcess, setValidatingProcess] = useState<Processo | null>(null);
  const [validationOab, setValidationOab] = useState('');
  const [validationCpf, setValidationCpf] = useState('');
  const [validationError, setValidationError] = useState('');

  // Management States
  const [managingProcess, setManagingProcess] = useState<Processo | null>(null);
  const [manageValor, setManageValor] = useState(0);
  const [manageStatus, setManageStatus] = useState<Processo['status']>('Em Andamento');
  const [manageDataConclusao, setManageDataConclusao] = useState('');

  const lawyerOab = lawyerId ? mockLawyers.find(l => l.id === lawyerId)?.oab : undefined;

  const handleStartUnlock = (p: Processo) => {
    setValidatingProcess(p);
    setValidationOab('');
    setValidationCpf('');
    setValidationError('');
  };

  const handleValidationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatingProcess) return;
    
    const inputOabClean = validationOab.trim().toLowerCase();
    const systemOabClean = (lawyerOab || '').trim().toLowerCase();
    
    const inputCpfClean = validationCpf.replace(/\D/g, '');
    const processCpfClean = (validatingProcess.clientCpf || '').replace(/\D/g, '');

    if (!systemOabClean) {
      setValidationError('OAB do advogado não configurada no sistema.');
      return;
    }
    if (inputOabClean !== systemOabClean) {
      setValidationError('Número da OAB incorreto.');
      return;
    }
    if (inputCpfClean !== processCpfClean) {
      setValidationError('CPF do cliente incorreto para este processo.');
      return;
    }

    setUnlockedProcessIds(prev => [...prev, validatingProcess.id_processo]);
    setValidatingProcess(null);
  };

  const handleManageFinancials = (p: Processo) => {
    setManagingProcess(p);
    setManageValor(p.valor);
    setManageStatus(p.status);
    setManageDataConclusao(p.data_conclusao || new Date().toISOString().split('T')[0]);
  };

  const handleManagementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingProcess) return;

    const conclusaoDate = manageStatus === 'Concluído' ? manageDataConclusao : null;
    mockProcessosService.updateProcesso(managingProcess.id_processo, {
      valor: Number(manageValor),
      status: manageStatus,
      data_conclusao: conclusaoDate
    });

    setProcessList(mockProcessosService.getProcessos());
    setManagingProcess(null);
  };

  // Query processes data
  const lawyerName = lawyerId ? mockLawyers.find(l => l.id === lawyerId)?.name : undefined;
  const procKpis = useMemo(() => {
    const list = lawyerName ? processList.filter(p => p.advogado === lawyerName) : processList;
    const count = list.length;
    const totalVal = list.reduce((acc, p) => acc + p.valor, 0);
    const concluidoVal = list.filter(p => p.status === 'Concluído').reduce((acc, p) => acc + p.valor, 0);
    const concluidoCount = list.filter(p => p.status === 'Concluído').length;
    const andamentoVal = list.filter(p => p.status === 'Em Andamento').reduce((acc, p) => acc + p.valor, 0);
    const andamentoCount = list.filter(p => p.status === 'Em Andamento').length;
    const aguardandoVal = list.filter(p => p.status === 'Aguardando Documentação').reduce((acc, p) => acc + p.valor, 0);
    const aguardandoCount = list.filter(p => p.status === 'Aguardando Documentação').length;

    return { list, count, totalVal, concluidoVal, concluidoCount, andamentoVal, andamentoCount, aguardandoVal, aguardandoCount };
  }, [lawyerName, processList]);

  const filtered = useMemo(() => {
    const now = new Date();
    return txs.filter(t => {
      if (period !== 'all') {
        const diff = (now.getTime() - new Date(t.date).getTime()) / 86400000;
        if (diff > Number(period)) return false;
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (processSearch && (!t.caseId || !t.caseId.toLowerCase().includes(processSearch.toLowerCase()))) return false;
      if (search && !t.clientName.toLowerCase().includes(search.toLowerCase()) &&
          !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [txs, period, statusFilter, search, processSearch]);

  const totalRecebido = filtered.filter(t => t.status === 'recebido').reduce((s, t) => s + t.amount, 0);
  const totalPendente = filtered.filter(t => t.status === 'pendente').reduce((s, t) => s + t.amount, 0);
  const totalInadim = filtered.filter(t => t.status === 'inadimplente').reduce((s, t) => s + t.amount, 0);
  const totalGeral = totalRecebido + totalPendente + totalInadim;

  const chartData = groupByMonth(txs);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-700">Resumo Financeiro</h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(filtered)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-xs font-semibold rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-colors dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
          >
            ⬇ Exportar CSV
          </button>
          <button
            onClick={() => exportXLSX(filtered)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-300 text-xs font-semibold rounded-lg text-emerald-700 hover:bg-emerald-100 shadow-sm transition-colors dark:text-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-900/30"
          >
            📊 Exportar XLSX
          </button>
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Período</label>
            <select value={period} onChange={e => setPeriod(e.target.value as typeof period)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <option value="all">Todos</option>
              <option value="30">Últimos 30 dias</option>
              <option value="60">Últimos 60 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="120">Últimos 120 dias</option>
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
            <label className="block text-xs font-medium text-gray-500 mb-1">Número do Processo</label>
            <input
              type="text"
              placeholder="Ex: case001..."
              value={processSearch}
              onChange={e => setProcessSearch(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
            />
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
              <th className="px-4 py-3">Processo</th>
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
                <td className="px-4 py-3 text-xs font-semibold text-gray-500">{t.caseId || '—'}</td>
                <td className="px-4 py-3 font-semibold">{fmt(t.amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhuma transação encontrada.</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t flex justify-between items-center text-xs text-gray-500">
          <span>{filtered.length} transações</span>
          <span>Total recebido no filtro: <strong className="text-green-700">{fmt(totalRecebido)}</strong></span>
        </div>
      </div>

      {/* Seção de Faturamento de Processos (Gestão Jurídica) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] space-y-6">
        <div>
          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
            ⚖️ Faturamento de Processos (Gestão Jurídica)
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Acompanhe a receita estimada e honorários acumulados da sua carteira de processos ativos e concluídos.
          </p>
        </div>

        {/* KPI cards for processes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-purple-50/50 dark:bg-purple-950/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
            <p className="text-[10px] text-purple-750 dark:text-purple-300 uppercase font-bold tracking-wide">Valor Total da Carteira</p>
            <p className="text-lg font-black text-purple-800 dark:text-purple-300 mt-1">{fmt(procKpis.totalVal)}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{procKpis.count} processos vinculados</p>
          </div>
          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-bold tracking-wide">Honorários Recebidos (Concluídos)</p>
            <p className="text-lg font-black text-emerald-800 dark:text-emerald-300 mt-1">{fmt(procKpis.concluidoVal)}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{procKpis.concluidoCount} processos concluídos</p>
          </div>
          <div className="bg-blue-50/50 dark:bg-blue-950/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <p className="text-[10px] text-blue-700 dark:text-blue-300 uppercase font-bold tracking-wide">Honorários Em Andamento</p>
            <p className="text-lg font-black text-blue-800 dark:text-blue-300 mt-1">{fmt(procKpis.andamentoVal)}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{procKpis.andamentoCount} processos ativos</p>
          </div>
          <div className="bg-amber-50/50 dark:bg-amber-950/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <p className="text-[10px] text-amber-700 dark:text-amber-300 uppercase font-bold tracking-wide">Gargalo (Aguardando Doc)</p>
            <p className="text-lg font-black text-amber-800 dark:text-amber-300 mt-1">{fmt(procKpis.aguardandoVal)}</p>
            <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5">{procKpis.aguardandoCount} processos travados</p>
          </div>
        </div>

        {/* Table of Processes */}
        <div className="border border-gray-150 dark:border-[#2A2545] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-black/10 border-b text-gray-700 dark:text-gray-300 uppercase">
                <tr>
                  <th className="px-4 py-2.5">ID Processo</th>
                  <th className="px-4 py-2.5">Cliente</th>
                  <th className="px-4 py-2.5">Departamento</th>
                  <th className="px-4 py-2.5">Gestor</th>
                  <th className="px-4 py-2.5">Data Entrada</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Valor do Caso</th>
                  <th className="px-4 py-2.5 text-right">Duração</th>
                  <th className="px-4 py-2.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {procKpis.list.map(p => (
                  <tr key={p.id_processo} className="border-b hover:bg-gray-50 dark:hover:bg-black/10">
                    <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white">#{p.id_processo}</td>
                    <td className="px-4 py-2.5">{p.clientName || '—'}</td>
                    <td className="px-4 py-2.5">{p.departamento}</td>
                    <td className="px-4 py-2.5">{p.gestor}</td>
                    <td className="px-4 py-2.5">{new Date(p.data_entrada).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                        p.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-gray-950 dark:text-white">
                      {unlockedProcessIds.includes(p.id_processo) ? fmt(p.valor) : '🔒 Restrito'}
                    </td>
                    <td className="px-4 py-2.5 text-right">{p.status === 'Concluído' ? `${p.tempo} dias` : '—'}</td>
                    <td className="px-4 py-2.5 text-center">
                      {unlockedProcessIds.includes(p.id_processo) ? (
                        <button
                          onClick={() => handleManageFinancials(p)}
                          className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded hover:bg-primary/90 transition-colors"
                        >
                          ⚙️ Gerenciar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartUnlock(p)}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded transition-colors"
                        >
                          🔑 Desbloquear
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {procKpis.list.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-400">Nenhum processo da Gestão Jurídica vinculado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Validação OAB / CPF */}
      {validatingProcess && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setValidatingProcess(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  🔒 Confirmar Identidade
                </h2>
                <button onClick={() => setValidatingProcess(null)} className="text-gray-450 hover:text-gray-600 text-2xl font-bold leading-none dark:text-gray-400">&times;</button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Para acessar a gestão e administração financeira do processo <strong>#{validatingProcess.id_processo}</strong> ({validatingProcess.clientName}), confirme os dados abaixo.
              </p>
              <form onSubmit={handleValidationSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">OAB do Advogado *</label>
                  <input
                    type="text"
                    value={validationOab}
                    onChange={e => setValidationOab(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545]"
                    placeholder="Digite sua OAB (Ex: SP123456)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">CPF do Cliente *</label>
                  <input
                    type="text"
                    value={validationCpf}
                    onChange={e => setValidationCpf(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545]"
                    placeholder="Digite o CPF do cliente (apenas números ou formatado)"
                    required
                  />
                </div>
                {validationError && (
                  <p className="text-xs text-red-650 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
                    ⚠️ {validationError}
                  </p>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setValidatingProcess(null)} className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90">
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestão e Administração Financeira */}
      {managingProcess && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setManagingProcess(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  ⚙️ Gestão Financeira — Processo #{managingProcess.id_processo}
                </h2>
                <button onClick={() => setManagingProcess(null)} className="text-gray-450 hover:text-gray-600 text-2xl font-bold leading-none dark:text-gray-400">&times;</button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Administre as informações de faturamento e status para o cliente <strong>{managingProcess.clientName}</strong>.
              </p>
              <form onSubmit={handleManagementSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Valor do Caso (R$) *</label>
                  <input
                    type="number"
                    value={manageValor}
                    onChange={e => setManageValor(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545]"
                    placeholder="Valor em Reais"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Status do Processo *</label>
                  <select
                    value={manageStatus}
                    onChange={e => setManageStatus(e.target.value as Processo['status'])}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545]"
                  >
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Aguardando Documentação">Aguardando Documentação</option>
                  </select>
                </div>
                {manageStatus === 'Concluído' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Data de Conclusão *</label>
                    <input
                      type="date"
                      value={manageDataConclusao}
                      onChange={e => setManageDataConclusao(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545]"
                      required
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setManagingProcess(null)} className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90">
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
