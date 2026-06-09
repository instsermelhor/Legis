import React, { useState, useMemo } from 'react';
import type { Lawyer, EfficiencyService, EfficiencyServiceGroup, BiApoio, BiDadosBase } from '../../types';
import { mockClients, mockInterns, mockSecretaries, mockMonthlyRevenue, mockEfficiencyServices, mockEfficiencyServiceGroups, mockBiApoio, mockBiDadosBase } from '../../services/mockDataService';
import { SectionTitle, SearchInput, IconBriefcase, IconUsers, IconGradCap, IconSettings } from './AdminShared';

// ─── Secretary Icon ───────────────────────────────────────────────────────────
const IconSecretariat = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const BRAZIL_STATES = ['Todos', 'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
type FilterType = 'lawyers' | 'clients' | 'interns' | 'secretaries' | 'services';

export const FinanceTab: React.FC<{ lawyers: Lawyer[]; initialFilter?: string }> = ({ lawyers, initialFilter }) => {
  const [viewMode, setViewMode] = useState<'profiles' | 'bi_dashboard'>('profiles');
  const [filterType, setFilterType] = useState<FilterType>(
    initialFilter === 'clients' ? 'clients'
    : initialFilter === 'interns' ? 'interns'
    : initialFilter === 'secretaries' ? 'secretaries'
    : initialFilter === 'services' ? 'services'
    : 'lawyers'
  );
  const [stateFilter, setStateFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('Mensal');

  // Load BI config
  const biApoio = useMemo<BiApoio>(() => {
    const saved = localStorage.getItem('legis_bi_tb_apoio');
    return saved ? JSON.parse(saved) : mockBiApoio;
  }, []);

  const biDadosBase = useMemo<BiDadosBase[]>(() => {
    const saved = localStorage.getItem('legis_bi_tb_dados_base');
    const data = saved ? JSON.parse(saved) : mockBiDadosBase;
    return [...data].sort((a, b) => a.mes_ano.localeCompare(b.mes_ano));
  }, []);

  // Calculations for BI Dashboard
  const processedData = useMemo(() => {
    const result = [];
    let accumulatedUms = 0;
    for (let i = 0; i < biDadosBase.length; i++) {
      const tx = biDadosBase[i];
      const dtE = new Date(tx.emissao_nf + 'T12:00:00');
      const dtR = new Date(tx.recebimento_nf + 'T12:00:00');
      const diffTime = Math.abs(dtR.getTime() - dtE.getTime());
      const diasRecebimento = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;
      
      const resultado = tx.receita_fat + tx.transferencia_recebida - tx.despesa_total;
      
      const despesaAdministrativa = Math.max(0, tx.despesa_total - tx.custo - tx.imposto - tx.juros - tx.salarios_ordenados - tx.glosa);
      const custoMaisDespesa = tx.custo + despesaAdministrativa;
      const totalSaidasRazao = tx.custo + despesaAdministrativa + tx.imposto;
      
      const divisorRazao = tx.receita_fat + tx.transferencia_recebida;
      const razaoMensal = divisorRazao > 0 ? totalSaidasRazao / divisorRazao : 0;
      
      accumulatedUms += tx.executado_ums;
      const percentualConsumoTeto = accumulatedUms / biApoio.teto_execucao_anual_ums;
      
      result.push({
        ...tx,
        diasRecebimento,
        resultado,
        despesaAdministrativa,
        custoMaisDespesa,
        totalSaidasRazao,
        razaoMensal,
        accumulatedUms,
        percentualConsumoTeto,
      });
    }
    return result;
  }, [biDadosBase, biApoio]);

  const biKpis = useMemo(() => {
    if (processedData.length === 0) return { totalFat: 0, totalRes: 0, avgPraz: 0, maxTetoPct: 0 };
    const totalFat = processedData.reduce((sum, d) => sum + d.receita_fat, 0);
    const totalRes = processedData.reduce((sum, d) => sum + d.resultado, 0);
    const avgPraz = processedData.reduce((sum, d) => sum + d.diasRecebimento, 0) / processedData.length;
    const totalUms = processedData.reduce((sum, d) => sum + d.executado_ums, 0);
    const maxTetoPct = totalUms / biApoio.teto_execucao_anual_ums;
    
    return {
      totalFat,
      totalRes,
      avgPraz,
      maxTetoPct,
    };
  }, [processedData, biApoio]);

  const [services, setServices] = useState<EfficiencyService[]>(mockEfficiencyServices);
  const [groups, setGroups] = useState<EfficiencyServiceGroup[]>(mockEfficiencyServiceGroups);
  const [contractedServicesCounts, setContractedServicesCounts] = useState<Record<string, number>>({});

  React.useEffect(() => {
    const savedS = localStorage.getItem('legis_services');
    if (savedS) setServices(JSON.parse(savedS));
    const savedG = localStorage.getItem('legis_serviceGroups');
    if (savedG) setGroups(JSON.parse(savedG));

    const savedCounts = localStorage.getItem('legis_contracted_services');
    if (savedCounts) {
      setContractedServicesCounts(JSON.parse(savedCounts));
    } else {
      const initialCounts: Record<string, number> = {};
      const currentServices = savedS ? JSON.parse(savedS) : mockEfficiencyServices;
      currentServices.forEach((s: EfficiencyService, idx: number) => {
        initialCounts[s.id] = (idx + 1) * 3;
      });
      localStorage.setItem('legis_contracted_services', JSON.stringify(initialCounts));
      setContractedServicesCounts(initialCounts);
    }
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


  // Simulated Services Revenue Base (Mensal)
  const baseServicesRevenue = services.reduce((sum, s) => {
    const count = contractedServicesCounts[s.id] ?? 0;
    return sum + (s.price * count);
  }, 0);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <SectionTitle title="Gestão Financeira" subtitle="Controles, relatórios e dashboards analíticos de faturamento e despesas" />
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-[#201C3D] p-1 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('profiles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${viewMode === 'profiles' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}
            >
              👤 Perfis & Contas
            </button>
            <button
              onClick={() => setViewMode('bi_dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${viewMode === 'bi_dashboard' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}
            >
              📊 BI Dashboard
            </button>
          </div>

          {viewMode === 'profiles' && (
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <span className="text-sm font-medium text-gray-700">Período:</span>
              <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)} className="text-sm border-none bg-transparent font-bold text-primary focus:outline-none cursor-pointer">
                <option>Diário</option>
                <option>Semanal</option>
                <option>Mensal</option>
                <option>1 Ano</option>
                <option>Até 5 Anos</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {viewMode === 'bi_dashboard' ? (
        <div className="space-y-8 animate-fade-in text-left">
           {/* BI Analytics Dashboard */}
           {/* KPI Cards */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {/* Card 1: Faturamento Acumulado */}
             <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 shadow-sm space-y-1">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Faturamento Acumulado</span>
                 <span className="text-xl">💰</span>
               </div>
               <p className="text-2xl font-black text-gray-800 dark:text-white">R$ {biKpis.totalFat.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
               <p className="text-[10px] text-gray-400">Soma de receita_fat</p>
             </div>

             {/* Card 2: Resultado Líquido */}
             <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 shadow-sm space-y-1">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Resultado Líquido</span>
                 <span className={`text-xs px-2 py-0.5 rounded font-bold ${biKpis.totalRes >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {biKpis.totalRes >= 0 ? 'Superávit' : 'Déficit'}
                 </span>
               </div>
               <p className={`text-2xl font-black ${biKpis.totalRes >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                 R$ {biKpis.totalRes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
               </p>
               <p className="text-[10px] text-gray-400">Receita + Transf - Despesa</p>
             </div>

             {/* Card 3: Prazo Médio de Recebimento */}
             <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 shadow-sm space-y-1">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Prazo Médio Recebimento</span>
                 <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">Alvo: ~30.6d</span>
               </div>
               <p className="text-2xl font-black text-gray-800 dark:text-white">{biKpis.avgPraz.toFixed(1)} dias</p>
               <p className="text-[10px] text-gray-400">Diferença de NF-e (emissão vs recebimento)</p>
             </div>

             {/* Card 4: Utilização do Teto UMS */}
             <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 shadow-sm space-y-1">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Utilização do Teto UMS</span>
                 <span className="text-[10px] text-amber-700 font-bold">Máx: {biApoio.teto_execucao_anual_ums}</span>
               </div>
               <div className="flex items-baseline gap-1.5">
                 <p className="text-2xl font-black text-gray-800 dark:text-white">{(biKpis.maxTetoPct * 100).toFixed(1)}%</p>
                 <span className="text-[10px] text-gray-400">do anual</span>
               </div>
               <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                 <div
                   className={`h-full rounded-full ${biKpis.maxTetoPct > 1 ? 'bg-red-500' : 'bg-primary'}`}
                   style={{ width: `${Math.min(100, biKpis.maxTetoPct * 100)}%` }}
                 />
               </div>
             </div>
           </div>

           {/* Charts Grid */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Chart 1: Razão de Eficiência Mensal */}
             <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
               <div>
                 <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center justify-between">
                   <span>📈 Visão 1: Análise de Eficiência</span>
                   <span className="text-[10px] font-medium text-gray-400">Razão Mensal vs Meta ({ (biApoio.meta_razao_final * 100).toFixed(1) }%)</span>
                 </h4>
                 <p className="text-xs text-gray-400 mt-0.5">Valores ACIMA da linha de meta indicam ineficiência (estouro de gastos).</p>
               </div>

               {/* Line Chart */}
               {processedData.length > 0 ? (
                 <div className="relative h-64 mt-6">
                   <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="none">
                     {/* Horizontal grid lines */}
                     {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, idx) => {
                       const y = 200 - (level * 180);
                       return (
                         <g key={idx}>
                           <line x1="40" y1={y} x2="480" y2={y} stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3,3" />
                           <text x="10" y={y + 4} className="text-[9px] fill-gray-400 font-mono">{(level * 100).toFixed(0)}%</text>
                         </g>
                       );
                     })}

                     {/* Constant Target Line */}
                     {(() => {
                       const targetY = 200 - (biApoio.meta_razao_final * 180);
                       return (
                         <g>
                           <line x1="40" y1={targetY} x2="480" y2={targetY} stroke="#EF4444" strokeWidth="1.5" strokeDasharray="5,5" />
                           <text x="400" y={targetY - 5} className="text-[8px] fill-red-500 font-bold">Meta ({ (biApoio.meta_razao_final * 100).toFixed(1) }%)</text>
                         </g>
                       );
                     })()}

                     {/* Line data path */}
                     {(() => {
                       const points = processedData.map((d, idx) => {
                         const x = 40 + (idx * (440 / (processedData.length - 1 || 1)));
                         const y = 200 - (Math.min(1.2, d.razaoMensal) * 180);
                         return { x, y, val: d.razaoMensal, label: d.mes_ano };
                       });

                       const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                       return (
                         <g>
                           {/* Area path */}
                           <path
                             d={`${pathD} L ${points[points.length - 1].x} 200 L 40 200 Z`}
                             fill="url(#gradient-efficiency)"
                             opacity="0.1"
                           />
                           {/* Line path */}
                           <path d={pathD} fill="none" stroke="#6366F1" strokeWidth="2.5" />
                           
                           {/* Data points */}
                           {points.map((p, idx) => {
                             const isExceeded = p.val > biApoio.meta_razao_final;
                             return (
                               <g key={idx}>
                                 <circle
                                   cx={p.x}
                                   cy={p.y}
                                   r="5"
                                   fill={isExceeded ? '#EF4444' : '#10B981'}
                                   stroke="#FFFFFF"
                                   strokeWidth="1.5"
                                 />
                                 <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[8px] font-bold fill-gray-700 dark:fill-gray-300">
                                   {(p.val * 100).toFixed(0)}%
                                 </text>
                               </g>
                             );
                           })}
                         </g>
                       );
                     })()}

                     {/* X Axis Labels */}
                     {processedData.map((d, idx) => {
                       const x = 40 + (idx * (440 / (processedData.length - 1 || 1)));
                       const dateStr = d.mes_ano ? new Date(d.mes_ano + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }) : '';
                       return (
                         <text key={idx} x={x} y="215" textAnchor="middle" className="text-[9px] fill-gray-400 uppercase font-bold">
                           {dateStr}
                         </text>
                       );
                     })}

                     {/* Gradient definitions */}
                     <defs>
                       <linearGradient id="gradient-efficiency" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#6366F1" />
                         <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                       </linearGradient>
                     </defs>
                   </svg>
                 </div>
               ) : (
                 <p className="text-center text-gray-400 py-12">Nenhum dado disponível.</p>
               )}
             </div>

             {/* Chart 2: Pareto de Despesas */}
             {(() => {
               const sums = [
                 { key: 'Custo Operacional', val: processedData.reduce((sum, d) => sum + d.custo, 0), color: 'bg-indigo-600', fill: '#4F46E5', desc: 'Histórico: ~37.3%' },
                 { key: 'Salários e Ordenados', val: processedData.reduce((sum, d) => sum + d.salarios_ordenados, 0), color: 'bg-emerald-600', fill: '#10B981', desc: 'Histórico: ~24.2%' },
                 { key: 'Despesas Administrativas', val: processedData.reduce((sum, d) => sum + d.despesaAdministrativa, 0), color: 'bg-purple-600', fill: '#8B5CF6', desc: 'Despesas Gerais de Apoio' },
                 { key: 'Impostos', val: processedData.reduce((sum, d) => sum + d.imposto, 0), color: 'bg-orange-600', fill: '#F97316', desc: 'Encargos Fiscais' },
                 { key: 'Juros', val: processedData.reduce((sum, d) => sum + d.juros, 0), color: 'bg-rose-600', fill: '#F43F5E', desc: 'Despesas Financeiras' },
                 { key: 'Glosas', val: processedData.reduce((sum, d) => sum + d.glosa, 0), color: 'bg-amber-600', fill: '#F59E0B', desc: 'Perdas / Estornos' },
               ];

               const totalDespesa = processedData.reduce((sum, d) => sum + d.despesa_total, 0) || 1;
               const sortedSums = [...sums].sort((a, b) => b.val - a.val).map(s => ({ ...s, pct: s.val / totalDespesa }));

               return (
                 <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-6 shadow-sm space-y-4">
                   <div>
                     <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center justify-between">
                       <span>🍩 Visão 2: Composição de Despesas</span>
                       <span className="text-[10px] font-medium text-gray-400">Total: R$ {totalDespesa.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                     </h4>
                     <p className="text-xs text-gray-400 mt-0.5">Distribuição percentual do desembolso total por categoria de saída.</p>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                     {/* Donut Chart using simple SVG */}
                     <div className="relative flex justify-center">
                       <svg className="w-40 h-40" viewBox="0 0 100 100">
                         {(() => {
                           let accumulatedAngle = 0;
                           return sortedSums.map((s, idx) => {
                             const percentage = s.pct;
                             if (percentage <= 0) return null;
                             const strokeDash = `${percentage * 251.2} ${251.2 * (1 - percentage)}`;
                             const strokeOffset = -accumulatedAngle * 251.2;
                             accumulatedAngle += percentage;
                             return (
                               <circle
                                 key={idx}
                                 cx="50"
                                 cy="50"
                                 r="40"
                                 fill="transparent"
                                 stroke={s.fill}
                                 strokeWidth="12"
                                 strokeDasharray={strokeDash}
                                 strokeDashoffset={strokeOffset}
                                 transform="rotate(-90 50 50)"
                               />
                             );
                           });
                         })()}
                         <circle cx="50" cy="50" r="28" className="fill-white dark:fill-[#1A1730]" />
                         <text x="50" y="48" textAnchor="middle" className="text-[7px] font-bold fill-gray-400 uppercase tracking-wider">Despesas</text>
                         <text x="50" y="58" textAnchor="middle" className="text-[9px] font-black fill-gray-800 dark:fill-white">
                           {totalDespesa >= 1000000 ? `R$ ${(totalDespesa / 1000000).toFixed(1)}M` : `R$ ${(totalDespesa / 1000).toFixed(0)}k`}
                         </text>
                       </svg>
                     </div>

                     {/* Pareto Bars */}
                     <div className="space-y-3">
                       {sortedSums.map((s, idx) => {
                         if (s.val === 0 && idx > 2) return null;
                         return (
                           <div key={s.key} className="space-y-1">
                             <div className="flex justify-between items-baseline text-[10px] font-semibold">
                               <span className="text-gray-700 dark:text-gray-300">{s.key}</span>
                               <span className="text-gray-500 font-mono">{(s.pct * 100).toFixed(1)}%</span>
                             </div>
                             <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                               <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct * 100}%` }} />
                             </div>
                             <div className="flex justify-between items-center text-[9px] text-gray-400">
                               <span>R$ {s.val.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                               <span>{s.desc}</span>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 </div>
               );
             })()}
           </div>

           {/* Chart 3: Execução de Metas de Faturamento */}
           <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-6 shadow-sm">
             <div>
               <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center justify-between">
                 <span>📊 Visão 3: Execução de Metas de Faturamento</span>
                 <span className="text-[10px] font-medium text-gray-400">Mensal: Executado UMS vs Meta de Faturamento</span>
               </h4>
               <p className="text-xs text-gray-400 mt-0.5">Mês a mês comparativo do volume UMS executado contra a meta calculada de acordo com as premissas da tabela de apoio.</p>
             </div>

             {processedData.length > 0 ? (
               <div className="relative h-64 mt-6">
                 <svg className="w-full h-full" viewBox="0 0 1000 240" preserveAspectRatio="none">
                   {/* Y Axis Grid lines */}
                   {[5000, 10000, 15000, 20000, 25000].map((val, idx) => {
                     const y = 200 - (val / 25000 * 180);
                     return (
                       <g key={idx}>
                         <line x1="50" y1={y} x2="980" y2={y} stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3,3" />
                         <text x="10" y={y + 4} className="text-[10px] fill-gray-400 font-mono">{val.toLocaleString('pt-BR')}</text>
                       </g>
                     );
                   })}

                   {/* Bars & Markers */}
                   {processedData.map((d, idx) => {
                     const gap = 930 / processedData.length;
                     const x = 60 + (idx * gap);
                     const barWidth = Math.min(30, gap * 0.45);
                     
                     // Executado Bar
                     const barHeight = (d.executado_ums / 25000) * 180;
                     const barY = 200 - barHeight;

                     // Target calculation: Meta faturamento percentual of that period
                     const periodIdx = biApoio.periodos.indexOf(d.semestre);
                     const metaPct = periodIdx >= 0 ? biApoio.meta_faturamento_percentual[periodIdx] : 0;
                     // Target for the month is period target divided by 6
                     const targetVal = (metaPct * biApoio.teto_execucao_anual_ums) / 6;
                     const targetY = 200 - (targetVal / 25000) * 180;

                     return (
                       <g key={idx}>
                         {/* Bar Executed */}
                         <rect
                           x={x - barWidth/2}
                           y={barY}
                           width={barWidth}
                           height={barHeight}
                           fill="#3B82F6"
                           rx="3"
                           className="transition-all hover:fill-blue-600"
                         />

                         {/* Target line indicator */}
                         <line
                           x1={x - barWidth * 0.8}
                           y1={targetY}
                           x2={x + barWidth * 0.8}
                           y2={targetY}
                           stroke="#F59E0B"
                           strokeWidth="3"
                           strokeLinecap="round"
                         />

                         {/* Value text */}
                         <text x={x} y={barY - 5} textAnchor="middle" className="text-[9px] font-bold fill-blue-700 dark:fill-blue-400">
                           {d.executado_ums}
                         </text>
                         
                         {/* Target text */}
                         <text x={x} y={targetY - 5} textAnchor="middle" className="text-[8px] font-semibold fill-amber-600">
                           {Math.round(targetVal)}
                         </text>
                       </g>
                     );
                   })}

                   {/* X Axis Labels */}
                   {processedData.map((d, idx) => {
                     const gap = 930 / processedData.length;
                     const x = 60 + (idx * gap);
                     const dateStr = d.mes_ano ? new Date(d.mes_ano + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) : '';
                     return (
                       <text key={idx} x={x} y="220" textAnchor="middle" className="text-[10px] fill-gray-500 font-bold uppercase">
                         {dateStr}
                       </text>
                     );
                   })}
                 </svg>
                 
                 {/* Legend */}
                 <div className="flex justify-center gap-6 mt-3 text-xs">
                   <div className="flex items-center gap-1.5">
                     <span className="w-3.5 h-3.5 rounded bg-blue-500 inline-block" />
                     <span className="text-gray-600 dark:text-gray-400">Executado UMS</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                     <span className="w-4 h-1 rounded bg-amber-500 inline-block" />
                     <span className="text-gray-600 dark:text-gray-400">Meta do Período (Mensalizada)</span>
                   </div>
                 </div>
               </div>
             ) : (
               <p className="text-center text-gray-400 py-12">Nenhum dado disponível.</p>
             )}
           </div>
        </div>
      ) : (
        <>
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
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
                <tr><th className="px-5 py-3">Serviço</th><th className="px-5 py-3">Grupo</th><th className="px-5 py-3 text-right">Valor Padrão</th><th className="px-5 py-3 text-right">Contratos (Real/Simulado)</th><th className="px-5 py-3 text-right">Receita Estimada</th></tr>
              </thead>
              <tbody>
                {filteredServices.map((s) => {
                  const group = groups.find(g => g.id === s.groupId);
                  const simulatedContracts = contractedServicesCounts[s.id] ?? 0;
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
                    R$ {filteredServices.reduce((a, s) => a + (s.price * (contractedServicesCounts[s.id] ?? 0)), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
};
