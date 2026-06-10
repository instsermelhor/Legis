import React, { useState, useMemo, useRef } from 'react';
import { mockProcessosService, Processo } from '../../services/mockProcessosService';
import { mockLawyers } from '../../services/mockLawyerService';
import { mockInterns, mockSecretaries } from '../../services/mockDataService';

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface LegalManagementDashboardProps {
  lawyerName?: string;
  lawyerOab?: string;
  lawyerId?: number;
}

export const LegalManagementDashboard: React.FC<LegalManagementDashboardProps> = ({ lawyerName, lawyerOab }) => {
  // Load data from mock service
  const [processos, setProcessos] = useState<Processo[]>(() => {
    const list = mockProcessosService.getProcessos();
    return lawyerName ? list.filter(p => p.advogado === lawyerName) : list;
  });
  
  // Access role: 'gestor' or 'advogado_comum'
  const [userRole, setUserRole] = useState<'gestor' | 'advogado_comum'>('gestor');

  // Interactive filters
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterGestor, setFilterGestor] = useState<string>('All');
  const [filterAdvogado, setFilterAdvogado] = useState<string>(lawyerName || 'All');

  // Advanced features: Search and highlights
  const [searchQuery, setSearchQuery] = useState('');
  const [drillDown, setDrillDown] = useState<{ field: string; value: string } | null>(null);

  // CRUD states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState<Processo | null>(null);

  // Console Command states
  const [commandText, setCommandText] = useState('');
  const [commandError, setCommandError] = useState('');
  const [showSubestabelecerModal, setShowSubestabelecerModal] = useState(false);
  const [showAutorizarModal, setShowAutorizarModal] = useState(false);

  // Subestabelecer form states
  const [subProcessId, setSubProcessId] = useState('');
  const [subTargetLawyerId, setSubTargetLawyerId] = useState<number | ''>('');
  const [subFile, setSubFile] = useState<{ name: string; fileType: string; size: string } | null>(null);
  const [subPassword, setSubPassword] = useState('');
  const [subError, setSubError] = useState('');
  const [subSuccess, setSubSuccess] = useState(false);
  const subFileInputRef = useRef<HTMLInputElement>(null);

  // Autorizar Acesso form states
  const [authProcessId, setAuthProcessId] = useState('');
  const [authCategory, setAuthCategory] = useState<'intern' | 'secretary'>('intern');
  const [authTargetId, setAuthTargetId] = useState<number | ''>('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleExecuteCommand = () => {
    const cmd = commandText.trim().toLowerCase();
    if (cmd === 'subestabelecer') {
      setShowSubestabelecerModal(true);
      setCommandError('');
    } else if (cmd === 'autorizar acesso') {
      setShowAutorizarModal(true);
      setCommandError('');
    } else {
      setCommandError('Comando não reconhecido. Digite "Subestabelecer" ou "Autorizar Acesso" (ou use as sugestões rápidas).');
    }
  };

  const handleSubestabelecerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubError('');

    if (!subProcessId) {
      setSubError('Por favor, selecione um processo.');
      return;
    }
    if (!subTargetLawyerId) {
      setSubError('Por favor, selecione o advogado de destino.');
      return;
    }
    if (!subFile) {
      setSubError('Por favor, faça o upload da Procuração de Subestabelecimento.');
      return;
    }
    if (!subPassword) {
      setSubError('Por favor, digite sua senha particular para confirmar.');
      return;
    }

    const expectedPassword = lawyerOab || 'senha123';
    if (subPassword !== expectedPassword && subPassword !== '123456' && subPassword !== 'senha123') {
      setSubError('Senha particular incorreta. Tente novamente.');
      return;
    }

    const targetLawyer = mockLawyers.find(l => l.id === Number(subTargetLawyerId));
    if (!targetLawyer) {
      setSubError('Advogado selecionado não encontrado.');
      return;
    }

    mockProcessosService.updateProcesso(Number(subProcessId), { advogado: targetLawyer.name });
    
    const savedDocMeta = {
      processId: subProcessId,
      fileName: subFile.name,
      fileType: subFile.fileType,
      fileSize: subFile.size,
      date: new Date().toLocaleDateString('pt-BR'),
      byLawyer: lawyerName || 'Advogado Gestor'
    };
    localStorage.setItem(`legis_subestablishment_doc_${subProcessId}`, JSON.stringify(savedDocMeta));

    setSubSuccess(true);
    setTimeout(() => {
      setShowSubestabelecerModal(false);
      setSubProcessId('');
      setSubTargetLawyerId('');
      setSubFile(null);
      setSubPassword('');
      setSubSuccess(false);
      setCommandText('');
      loadData();
    }, 1500);
  };

  const handleAutorizarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authProcessId) {
      setAuthError('Por favor, selecione um processo.');
      return;
    }
    if (!authTargetId) {
      setAuthError('Por favor, selecione o profissional.');
      return;
    }
    if (!authPassword) {
      setAuthError('Por favor, digite sua senha particular para confirmar.');
      return;
    }

    const expectedPassword = lawyerOab || 'senha123';
    if (authPassword !== expectedPassword && authPassword !== '123456' && authPassword !== 'senha123') {
      setAuthError('Senha particular incorreta. Tente novamente.');
      return;
    }

    const key = `legis_delegated_cases_${authCategory}_${authTargetId}`;
    const saved = localStorage.getItem(key);
    const delegatedList: string[] = saved ? JSON.parse(saved) : [];
    if (!delegatedList.includes(authProcessId)) {
      delegatedList.push(authProcessId);
      localStorage.setItem(key, JSON.stringify(delegatedList));
    }

    setAuthSuccess(true);
    setTimeout(() => {
      setShowAutorizarModal(false);
      setAuthProcessId('');
      setAuthTargetId('');
      setAuthPassword('');
      setAuthSuccess(false);
      setCommandText('');
    }, 1500);
  };

  // Form states
  const [formDept, setFormDept] = useState<'Cível' | 'Trabalhista' | 'Societário'>('Cível');
  const [formAdvogado, setFormAdvogado] = useState('');
  const [formGestor, setFormGestor] = useState('');
  const [formDataEntrada, setFormDataEntrada] = useState('');
  const [formDataConclusao, setFormDataConclusao] = useState('');
  const [formStatus, setFormStatus] = useState<'Em Andamento' | 'Concluído' | 'Aguardando Documentação'>('Em Andamento');
  const [formValor, setFormValor] = useState(0);

  // Reload data
  const loadData = () => {
    const list = mockProcessosService.getProcessos();
    setProcessos(lawyerName ? list.filter(p => p.advogado === lawyerName) : list);
  };

  // Save or edit handler
  const handleSaveProcesso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAdvogado.trim() || !formGestor.trim() || !formDataEntrada) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const dataConclusaoVal = formStatus === 'Concluído' ? (formDataConclusao || new Date().toISOString().split('T')[0]) : null;

    const payload = {
      departamento: formDept,
      advogado: formAdvogado,
      gestor: formGestor,
      data_entrada: formDataEntrada,
      data_conclusao: dataConclusaoVal,
      status: formStatus,
      valor: Number(formValor),
    };

    if (editingProcesso) {
      mockProcessosService.updateProcesso(editingProcesso.id_processo, payload);
    } else {
      mockProcessosService.addProcesso(payload);
    }

    setIsModalOpen(false);
    setEditingProcesso(null);
    loadData();
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingProcesso(null);
    setFormDept('Cível');
    setFormAdvogado(lawyerName || '');
    setFormGestor('');
    const today = new Date().toISOString().split('T')[0];
    setFormDataEntrada(today);
    setFormDataConclusao('');
    setFormStatus('Em Andamento');
    setFormValor(0);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (p: Processo) => {
    setEditingProcesso(p);
    setFormDept(p.departamento);
    setFormAdvogado(p.advogado);
    setFormGestor(p.gestor);
    setFormDataEntrada(p.data_entrada);
    setFormDataConclusao(p.data_conclusao || '');
    setFormStatus(p.status);
    setFormValor(p.valor);
    setIsModalOpen(true);
  };

  // Delete handler
  const handleDelete = (id: number) => {
    if (window.confirm(`Tem certeza de que deseja excluir o processo Nº ${id}?`)) {
      mockProcessosService.deleteProcesso(id);
      loadData();
    }
  };

  // Unique filters data lists
  const gestoresList = useMemo(() => {
    const list = processos.map(p => p.gestor);
    return Array.from(new Set(list)).sort();
  }, [processos]);

  const advogadosList = useMemo(() => {
    const list = processos.map(p => p.advogado);
    return Array.from(new Set(list)).sort();
  }, [processos]);

  // Main filtered processes lists
  const filteredProcessos = useMemo(() => {
    return processos.filter(p => {
      // 1. Date Range
      if (filterStartDate && p.data_entrada < filterStartDate) return false;
      if (filterEndDate && p.data_entrada > filterEndDate) return false;

      // 2. Status
      if (filterStatus !== 'All' && p.status !== filterStatus) return false;

      // 3. Dept
      if (filterDept !== 'All' && p.departamento !== filterDept) return false;

      // 4. Gestor
      if (filterGestor !== 'All' && p.gestor !== filterGestor) return false;

      // 5. Advogado
      if (filterAdvogado !== 'All' && p.advogado !== filterAdvogado) return false;

      // 6. Search Query (id_processo or names)
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const idMatch = String(p.id_processo).includes(query);
        const advMatch = p.advogado.toLowerCase().includes(query);
        const gestorMatch = p.gestor.toLowerCase().includes(query);
        const deptMatch = p.departamento.toLowerCase().includes(query);
        if (!idMatch && !advMatch && !gestorMatch && !deptMatch) return false;
      }

      // 7. Drill-Down Filter
      if (drillDown) {
        if (drillDown.field === 'departamento' && p.departamento !== drillDown.value) return false;
        if (drillDown.field === 'gestor' && p.gestor !== drillDown.value) return false;
        if (drillDown.field === 'status' && p.status !== drillDown.value) return false;
      }

      return true;
    });
  }, [processos, filterStartDate, filterEndDate, filterStatus, filterDept, filterGestor, filterAdvogado, searchQuery, drillDown]);

  // Calculations for KPI Cards
  const kpis = useMemo(() => {
    const total = filteredProcessos.length;
    const emAndamento = filteredProcessos.filter(p => p.status === 'Em Andamento').length;
    const concluidos = filteredProcessos.filter(p => p.status === 'Concluído').length;
    const aguardandoDoc = filteredProcessos.filter(p => p.status === 'Aguardando Documentação').length;
    const faturamentoTotal = filteredProcessos.reduce((acc, p) => acc + p.valor, 0);

    const completed = filteredProcessos.filter(p => p.status === 'Concluído');
    const tempoMedio = completed.length > 0 
      ? Math.round(completed.reduce((acc, p) => acc + p.tempo, 0) / completed.length) 
      : 0;

    return { total, emAndamento, concluidos, aguardandoDoc, faturamentoTotal, tempoMedio };
  }, [filteredProcessos]);

  // Calculate Monthly Dynamics (Current month and forecasted)
  const monthlyMetrics = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth(); // 0-indexed
    const currentYearMonth = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;
    
    // Active processes in the current month
    // Rule: entered on or before current month, and (no conclusion or concluded in current month or later)
    const ativosMesAtual = processos.filter(p => {
      const entryYM = p.data_entrada.substring(0, 7);
      if (entryYM > currentYearMonth) return false;
      if (!p.data_conclusao) return true;
      const concYM = p.data_conclusao.substring(0, 7);
      return concYM >= currentYearMonth;
    }).length;

    // Predicted new processes for next month (July 2026) based on 3-month rolling average
    // Let's find unique list of months in format YYYY-MM
    const entriesByMonth: Record<string, number> = {};
    processos.forEach(p => {
      const ym = p.data_entrada.substring(0, 7);
      entriesByMonth[ym] = (entriesByMonth[ym] || 0) + 1;
    });

    // Let's find the last 3 months with entries
    const sortedYM = Object.keys(entriesByMonth).sort();
    const last3Months = sortedYM.slice(-3);
    const sumLast3 = last3Months.reduce((acc, m) => acc + entriesByMonth[m], 0);
    const avgForecast = last3Months.length > 0 ? Math.ceil(sumLast3 / last3Months.length) : 3;

    return { ativosMesAtual, previstosProximoMes: avgForecast };
  }, [processos]);

  // Alert arrays
  const alertProcessosParados = useMemo(() => {
    // Active processes entered > 60 days ago
    const now = new Date();
    return processos.filter(p => {
      if (p.status === 'Concluído') return false;
      const entryDate = new Date(p.data_entrada);
      const diffTime = now.getTime() - entryDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 60;
    });
  }, [processos]);

  // Dynamic Chart Data aggregations
  const chartData = useMemo(() => {
    // 1. Processos por departamento
    const depts = { Cível: 0, Trabalhista: 0, Societário: 0 };
    filteredProcessos.forEach(p => {
      if (p.departamento in depts) depts[p.departamento]++;
    });

    // 2. Processos por gestor
    const gestores: Record<string, number> = {};
    filteredProcessos.forEach(p => {
      gestores[p.gestor] = (gestores[p.gestor] || 0) + 1;
    });

    // 3. Distribuição por status
    const statuses = { 'Em Andamento': 0, 'Concluído': 0, 'Aguardando Documentação': 0 };
    filteredProcessos.forEach(p => {
      if (p.status in statuses) statuses[p.status]++;
    });

    // 4. Evolução de processos ao longo do tempo (últimos 6 meses de data_entrada)
    const monthCounts: Record<string, number> = {};
    const now = new Date();
    // Pre-populate last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[key] = 0;
    }
    filteredProcessos.forEach(p => {
      const key = p.data_entrada.substring(0, 7);
      if (key in monthCounts) {
        monthCounts[key]++;
      }
    });
    const evolucao = Object.entries(monthCounts).map(([month, count]) => ({
      month: month.substring(5) + '/' + month.substring(2, 4), // MM/YY
      count
    }));

    // 5. Faturamento por departamento
    const faturamentoDept = { Cível: 0, Trabalhista: 0, Societário: 0 };
    filteredProcessos.forEach(p => {
      if (p.departamento in faturamentoDept) faturamentoDept[p.departamento] += p.valor;
    });

    // 6. Tempo médio por gestor
    const tempoGestorSum: Record<string, number> = {};
    const tempoGestorCount: Record<string, number> = {};
    filteredProcessos.forEach(p => {
      if (p.status === 'Concluído') {
        tempoGestorSum[p.gestor] = (tempoGestorSum[p.gestor] || 0) + p.tempo;
        tempoGestorCount[p.gestor] = (tempoGestorCount[p.gestor] || 0) + 1;
      }
    });
    const tempoGestor = Object.keys(tempoGestorSum).map(g => ({
      gestor: g,
      avg: Math.round(tempoGestorSum[g] / tempoGestorCount[g])
    }));

    // 7. Taxa de conclusão por gestor
    const concluidosGestor: Record<string, number> = {};
    const totalGestor: Record<string, number> = {};
    filteredProcessos.forEach(p => {
      totalGestor[p.gestor] = (totalGestor[p.gestor] || 0) + 1;
      if (p.status === 'Concluído') {
        concluidosGestor[p.gestor] = (concluidosGestor[p.gestor] || 0) + 1;
      }
    });
    const taxaConclusaoGestor = Object.keys(totalGestor).map(g => {
      const conc = concluidosGestor[g] || 0;
      const tot = totalGestor[g];
      return {
        gestor: g,
        rate: tot > 0 ? Math.round((conc / tot) * 100) : 0
      };
    });

    // 8. Valor por gestor
    const valorGestor: Record<string, number> = {};
    filteredProcessos.forEach(p => {
      valorGestor[p.gestor] = (valorGestor[p.gestor] || 0) + p.valor;
    });

    return {
      depts,
      gestores,
      statuses,
      evolucao,
      faturamentoDept,
      tempoGestor,
      taxaConclusaoGestor,
      valorGestor
    };
  }, [filteredProcessos]);

  // Click on chart segments triggers filter or drill-down
  const handleChartClick = (field: string, value: string) => {
    if (drillDown && drillDown.field === field && drillDown.value === value) {
      // Toggle off
      setDrillDown(null);
    } else {
      setDrillDown({ field, value });
    }
  };

  const handleClearDrillDown = () => {
    setDrillDown(null);
  };

  return (
    <div className="space-y-8 animate-fade-in theme-lawyer">
      
      {/* Header and Access Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-[#2A2545] pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            ⚖️ Gestão Jurídica & Processos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Acompanhe o andamento da carteira de processos, faturamento por gestor e gargalos operacionais.
          </p>
        </div>
        
        {/* Access level selector */}
        <div className="flex items-center bg-gray-100 dark:bg-[#1E1B38] p-1 rounded-xl border border-gray-200 dark:border-[#2A2545] shrink-0">
          <button
            onClick={() => setUserRole('gestor')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              userRole === 'gestor'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            👑 Gestor (Full Access)
          </button>
          <button
            onClick={() => setUserRole('advogado_comum')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              userRole === 'advogado_comum'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            💼 Advogado Comum (Sem Finanças)
          </button>
        </div>
      </div>

      {/* Console de Comandos do Gestor (Full Access) */}
      {userRole === 'gestor' && (
        <div className="bg-gradient-to-r from-[#1E1B38] to-[#120F24] p-5 rounded-xl border border-primary/30 shadow-md space-y-3 text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-light flex items-center gap-1.5">
              <span>💻</span> Console de Comandos do Gestor
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Modo: Full Access</span>
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-300">Digite um comando e pressione Enter ou clique em Executar:</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-light font-mono text-sm">&gt;</span>
                <input
                  type="text"
                  placeholder='Ex: "Subestabelecer" ou "Autorizar Acesso"'
                  value={commandText}
                  onChange={e => {
                    setCommandText(e.target.value);
                    setCommandError('');
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleExecuteCommand();
                    }
                  }}
                  className="w-full text-sm bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-white/30"
                />
              </div>
              <button
                type="button"
                onClick={handleExecuteCommand}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>⚙</span> Executar
              </button>
            </div>
            {commandError && <p className="text-[11px] text-red-400 font-semibold">{commandError}</p>}
            
            {/* Command Suggestions / Autocomplete */}
            <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[11px] text-gray-400">
              <span>Sugestões rápidas:</span>
              <button
                type="button"
                onClick={() => {
                  setCommandText('Subestabelecer');
                  setCommandError('');
                }}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 rounded font-semibold transition-colors animate-pulse"
              >
                Subestabelecer
              </button>
              <button
                type="button"
                onClick={() => {
                  setCommandText('Autorizar Acesso');
                  setCommandError('');
                }}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 rounded font-semibold transition-colors animate-pulse"
              >
                Autorizar Acesso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts & Operational Bottlenecks Panel */}
      {(alertProcessosParados.length > 0 || kpis.aguardandoDoc > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kpis.aguardandoDoc > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-3">
              <span className="text-xl animate-bounce">⚠️</span>
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm">Gargalo Operacional: Aguardando Documentos</h4>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Existem <strong>{kpis.aguardandoDoc}</strong> processos travados aguardando documentação do cliente.
                </p>
                <button
                  onClick={() => setFilterStatus('Aguardando Documentação')}
                  className="text-xs text-amber-800 dark:text-amber-300 font-bold underline mt-2"
                >
                  Filtrar esses processos →
                </button>
              </div>
            </div>
          )}

          {alertProcessosParados.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl p-4 flex gap-3">
              <span className="text-xl animate-pulse">⏰</span>
              <div>
                <h4 className="font-bold text-rose-800 dark:text-rose-300 text-sm">Alerta: Processos Parados ({alertProcessosParados.length})</h4>
                <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                  Identificados processos sem conclusão e inativos há mais de 60 dias desde a entrada.
                </p>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => {
                      setFilterStatus('All');
                      setDrillDown(null);
                      setSearchQuery('');
                      // Find these by filter or alert lists
                      const ids = alertProcessosParados.map(p => p.id_processo).join(', ');
                      alert(`IDs de processos parados: ${ids}`);
                    }}
                    className="text-xs text-rose-800 dark:text-rose-300 font-bold underline"
                  >
                    Ver Lista Detalhada
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Filters Panel */}
      <div className="bg-white dark:bg-[#1A1730] p-5 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filtros Avançados</h3>
          {(filterStartDate || filterEndDate || filterStatus !== 'All' || filterDept !== 'All' || filterGestor !== 'All' || filterAdvogado !== 'All' || searchQuery || drillDown) && (
            <button
              onClick={() => {
                setFilterStartDate('');
                setFilterEndDate('');
                setFilterStatus('All');
                setFilterDept('All');
                setFilterGestor('All');
                setFilterAdvogado(lawyerName || 'All');
                setSearchQuery('');
                setDrillDown(null);
              }}
              className="text-xs text-primary font-bold hover:underline"
            >
              Resetar Filtros
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Período */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase">Data Entrada (Início)</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
              className="w-full text-xs border border-gray-300 dark:border-[#332E55] rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase">Data Entrada (Fim)</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
              className="w-full text-xs border border-gray-300 dark:border-[#332E55] rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full text-xs border border-gray-300 dark:border-[#332E55] rounded-lg px-2.5 py-1.5 bg-white dark:bg-[#1A1730]"
            >
              <option value="All">Todos Status</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Aguardando Documentação">Aguardando Documentação</option>
            </select>
          </div>

          {/* Departamento */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase">Departamento</label>
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="w-full text-xs border border-gray-300 dark:border-[#332E55] rounded-lg px-2.5 py-1.5 bg-white dark:bg-[#1A1730]"
            >
              <option value="All">Todos Departamentos</option>
              <option value="Cível">Cível</option>
              <option value="Trabalhista">Trabalhista</option>
              <option value="Societário">Societário</option>
            </select>
          </div>

          {/* Gestor */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase">Gestor</label>
            <select
              value={filterGestor}
              onChange={e => setFilterGestor(e.target.value)}
              className="w-full text-xs border border-gray-300 dark:border-[#332E55] rounded-lg px-2.5 py-1.5 bg-white dark:bg-[#1A1730]"
            >
              <option value="All">Todos Gestores</option>
              {gestoresList.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase">Advogado Responsável</label>
            <select
              value={filterAdvogado}
              onChange={e => setFilterAdvogado(e.target.value)}
              className="w-full text-xs border border-gray-300 dark:border-[#332E55] rounded-lg px-2.5 py-1.5 bg-white dark:bg-[#1A1730] disabled:opacity-85 disabled:cursor-not-allowed"
              disabled={!!lawyerName}
            >
              {lawyerName ? (
                <option value={lawyerName}>{lawyerName}</option>
              ) : (
                <>
                  <option value="All">Todos Advogados</option>
                  {advogadosList.map(a => <option key={a} value={a}>{a}</option>)}
                </>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase">Buscar Processo</label>
            <input
              type="text"
              placeholder="Digite o Nº do processo, nome do advogado, gestor ou departamento..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs border border-gray-300 dark:border-[#332E55] rounded-lg px-2.5 py-1.5"
            />
          </div>
        </div>
      </div>

      {/* Drill-down notification indicator */}
      {drillDown && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex items-center justify-between text-xs font-semibold text-primary">
          <span className="flex items-center gap-1.5">
            🔍 Filtro de Gráfico (Drill-Down) ativo: <strong>{drillDown.field.toUpperCase()} = {drillDown.value}</strong>
          </span>
          <button
            onClick={handleClearDrillDown}
            className="px-2 py-1 bg-white hover:bg-gray-50 rounded shadow-sm text-[10px]"
          >
            Limpar Drill-Down
          </button>
        </div>
      )}

      {/* KPI Cards section */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-[#1A1730] p-4 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 text-lg opacity-40">📁</div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">Total de Processos</p>
          <p className="text-2xl font-black text-gray-800 dark:text-white mt-1.5">{kpis.total}</p>
        </div>

        {/* Em Andamento */}
        <div className="bg-white dark:bg-[#1A1730] p-4 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 text-lg opacity-40">⚙️</div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">Em Andamento</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1.5">{kpis.emAndamento}</p>
        </div>

        {/* Concluídos */}
        <div className="bg-white dark:bg-[#1A1730] p-4 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 text-lg opacity-40">✅</div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">Concluídos</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">{kpis.concluidos}</p>
        </div>

        {/* Aguardando doc */}
        <div className="bg-white dark:bg-[#1A1730] p-4 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 text-lg opacity-40 animate-pulse text-amber-500">⚠️</div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">Aguardando Doc</p>
          <p className="text-2xl font-black text-amber-500 mt-1.5">{kpis.aguardandoDoc}</p>
        </div>

        {/* Faturamento (Restricted) */}
        <div className="bg-white dark:bg-[#1A1730] p-4 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 text-lg opacity-40">💰</div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">Faturamento Total</p>
          {userRole === 'gestor' ? (
            <p className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 mt-2 truncate">
              {fmtCurrency(kpis.faturamentoTotal)}
            </p>
          ) : (
            <span className="inline-block mt-2 px-2 py-0.5 bg-red-150 text-red-700 text-[10px] font-bold rounded">
              🔒 Restrito
            </span>
          )}
        </div>

        {/* Tempo médio */}
        <div className="bg-white dark:bg-[#1A1730] p-4 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 text-lg opacity-40">⏱️</div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">Tempo Médio</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1.5">
            {kpis.tempoMedio} <span className="text-xs font-normal">dias</span>
          </p>
        </div>
      </div>

      {/* Monthly Dynamic metrics (Current and predicted) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-[#151226] border border-gray-200 dark:border-[#252042] p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <div>
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Processos Ativos no Mês Atual</h4>
            <p className="text-2xl font-black text-primary mt-0.5">{monthlyMetrics.ativosMesAtual}</p>
            <p className="text-[10px] text-gray-500">Com data de entrada ou conclusão neste mês corrente</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-[#2A2545] pt-3 sm:pt-0 sm:pl-6">
          <span className="text-2xl">📈</span>
          <div>
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Previstos para o Próximo Mês</h4>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{monthlyMetrics.previstosProximoMes}</p>
            <p className="text-[10px] text-gray-500">Média móvel calculada sobre os novos casos dos últimos 3 meses</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Section (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Barras: processos por departamento */}
        <div className="bg-white dark:bg-[#1A1730] p-5 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Processos por Departamento</h3>
          <div className="space-y-3">
            {Object.entries(chartData.depts).map(([dept, count]) => {
              const max = Math.max(...(Object.values(chartData.depts) as number[]), 1);
              const pct = ((count as number) / max) * 100;
              const isSelected = drillDown?.field === 'departamento' && drillDown?.value === dept;
              return (
                <div
                  key={dept}
                  onClick={() => handleChartClick('departamento', dept)}
                  className={`space-y-1 cursor-pointer p-1.5 rounded transition-all ${
                    isSelected ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-gray-50 dark:hover:bg-black/10 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300">{dept}</span>
                    <span className="text-gray-900 dark:text-white">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3.5 overflow-hidden">
                    <div
                      className="bg-primary h-3.5 rounded-full transition-all duration-550"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barras: processos por gestor */}
        <div className="bg-white dark:bg-[#1A1730] p-5 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Processos por Gestor</h3>
          <div className="space-y-3 h-52 overflow-y-auto pr-1">
            {Object.keys(chartData.gestores).length > 0 ? (
              Object.entries(chartData.gestores).map(([gestor, count]) => {
                const max = Math.max(...(Object.values(chartData.gestores) as number[]), 1);
                const pct = ((count as number) / max) * 100;
                const isSelected = drillDown?.field === 'gestor' && drillDown?.value === gestor;
                return (
                  <div
                    key={gestor}
                    onClick={() => handleChartClick('gestor', gestor)}
                    className={`space-y-1 cursor-pointer p-1.5 rounded transition-all ${
                      isSelected ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-gray-50 dark:hover:bg-black/10 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700 dark:text-gray-300">{gestor}</span>
                      <span className="text-gray-900 dark:text-white">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-3.5 rounded-full transition-all duration-550"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 text-center py-12">Nenhum gestor cadastrado.</p>
            )}
          </div>
        </div>

        {/* Pizza/Donut: distribuição por status */}
        <div className="bg-white dark:bg-[#1A1730] p-5 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Distribuição por Status</h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
            
            {/* SVG Donut */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E5E7EB" strokeWidth="3" />
                {(() => {
                  const vals = Object.values(chartData.statuses) as number[];
                  const tot = vals.reduce((a, b) => a + b, 0) || 1;
                  const andamentoPct = (((chartData.statuses['Em Andamento'] || 0) as number) / tot) * 100;
                  const concluidoPct = (((chartData.statuses['Concluído'] || 0) as number) / tot) * 100;
                  const aguardandoPct = (((chartData.statuses['Aguardando Documentação'] || 0) as number) / tot) * 100;

                  let offset = 0;
                  const andamentoStroke = andamentoPct;
                  const concluidoStroke = concluidoPct;
                  const aguardandoStroke = aguardandoPct;

                  const andamentoOffset = offset;
                  offset += andamentoStroke;
                  const concluidoOffset = offset;
                  offset += concluidoStroke;
                  const aguardandoOffset = offset;

                  return (
                    <>
                      {/* Em Andamento (Blue) */}
                      {andamentoStroke > 0 && (
                        <circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke="#3B82F6"
                          strokeWidth="3.2"
                          strokeDasharray={`${andamentoStroke} ${100 - andamentoStroke}`}
                          strokeDashoffset={100 - andamentoOffset}
                          className="cursor-pointer hover:stroke-[4px] transition-all"
                          onClick={() => handleChartClick('status', 'Em Andamento')}
                        />
                      )}
                      {/* Concluído (Green) */}
                      {concluidoStroke > 0 && (
                        <circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke="#10B981"
                          strokeWidth="3.2"
                          strokeDasharray={`${concluidoStroke} ${100 - concluidoStroke}`}
                          strokeDashoffset={100 - concluidoOffset}
                          className="cursor-pointer hover:stroke-[4px] transition-all"
                          onClick={() => handleChartClick('status', 'Concluído')}
                        />
                      )}
                      {/* Aguardando Documentação (Orange) */}
                      {aguardandoStroke > 0 && (
                        <circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke="#F59E0B"
                          strokeWidth="3.2"
                          strokeDasharray={`${aguardandoStroke} ${100 - aguardandoStroke}`}
                          strokeDashoffset={100 - aguardandoOffset}
                          className="cursor-pointer hover:stroke-[4px] transition-all"
                          onClick={() => handleChartClick('status', 'Aguardando Documentação')}
                        />
                      )}
                    </>
                  );
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-gray-800 dark:text-white">{kpis.total}</span>
                <span className="text-[9px] text-gray-400 uppercase font-bold">Processos</span>
              </div>
            </div>

            {/* Labels */}
            <div className="space-y-2 text-xs">
              <div
                onClick={() => handleChartClick('status', 'Em Andamento')}
                className={`flex items-center gap-2 cursor-pointer p-1 rounded ${
                  drillDown?.field === 'status' && drillDown?.value === 'Em Andamento' ? 'bg-blue-50 dark:bg-blue-950/20 font-bold' : ''
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">Em Andamento ({chartData.statuses['Em Andamento']})</span>
              </div>
              <div
                onClick={() => handleChartClick('status', 'Concluído')}
                className={`flex items-center gap-2 cursor-pointer p-1 rounded ${
                  drillDown?.field === 'status' && drillDown?.value === 'Concluído' ? 'bg-emerald-50 dark:bg-emerald-950/20 font-bold' : ''
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-700 dark:text-gray-300">Concluído ({chartData.statuses['Concluído']})</span>
              </div>
              <div
                onClick={() => handleChartClick('status', 'Aguardando Documentação')}
                className={`flex items-center gap-2 cursor-pointer p-1 rounded ${
                  drillDown?.field === 'status' && drillDown?.value === 'Aguardando Documentação' ? 'bg-amber-50 dark:bg-amber-950/20 font-bold' : ''
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-700 dark:text-gray-300">Aguardando Doc. ({chartData.statuses['Aguardando Documentação']})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha: evolução de processos ao longo do tempo */}
        <div className="bg-white dark:bg-[#1A1730] p-5 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Evolução Temporal (Novos Casos)</h3>
          <div className="flex items-end gap-2 h-36 border-b border-gray-200 dark:border-[#2A2545] pb-1.5 px-2">
            {chartData.evolucao.map((e, idx) => {
              const max = Math.max(...chartData.evolucao.map(x => x.count), 1);
              const heightPct = (e.count / max) * 80; // keep some padding
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end items-center h-24 relative group">
                    <span className="absolute -top-6 text-[10px] font-bold text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {e.count}
                    </span>
                    <div
                      className="w-3 bg-purple-500 rounded-t-sm hover:bg-purple-600 transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 truncate">{e.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barras: faturamento por departamento (Restricted) */}
        <div className="bg-white dark:bg-[#1A1730] p-5 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Faturamento por Departamento</h3>
          {userRole === 'gestor' ? (
            <div className="space-y-3">
              {Object.entries(chartData.faturamentoDept).map(([dept, val]) => {
                const max = Math.max(...(Object.values(chartData.faturamentoDept) as number[]), 1);
                const pct = ((val as number) / max) * 100;
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700 dark:text-gray-300">{dept}</span>
                      <span className="text-emerald-700 dark:text-emerald-400">{fmtCurrency(val as number)}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-3.5 rounded-full transition-all duration-550"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 bg-gray-50 dark:bg-[#1E1B38] rounded-xl border border-dashed border-gray-200 dark:border-[#2A2545]">
              <span className="text-3xl mb-2">🔒</span>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Restrição de Acesso Financeiro</p>
              <p className="text-[10px] text-gray-500 max-w-xs mt-1">
                Seu perfil atual de Advogado Comum não possui permissões para ver gráficos monetários. Alterne para Gestor acima para visualizar.
              </p>
            </div>
          )}
        </div>

        {/* Barras: tempo médio por gestor */}
        <div className="bg-white dark:bg-[#1A1730] p-5 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Tempo Médio por Gestor (Dias)</h3>
          <div className="space-y-3 h-52 overflow-y-auto pr-1">
            {chartData.tempoGestor.length > 0 ? (
              chartData.tempoGestor.map(item => {
                const max = Math.max(...chartData.tempoGestor.map(x => x.avg), 1);
                const pct = (item.avg / max) * 100;
                return (
                  <div key={item.gestor} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700 dark:text-gray-300">{item.gestor}</span>
                      <span className="text-purple-600 dark:text-purple-400">{item.avg} dias</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3.5 overflow-hidden">
                      <div
                        className="bg-purple-500 h-3.5 rounded-full transition-all duration-550"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 text-center py-12">Nenhum processo concluído para cálculo.</p>
            )}
          </div>
        </div>

        {/* Taxa de conclusão por gestor */}
        <div className="bg-white dark:bg-[#1A1730] p-5 rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm lg:col-span-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Taxa de Conclusão por Gestor (% concluídos / total)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {chartData.taxaConclusaoGestor.length > 0 ? (
              chartData.taxaConclusaoGestor.map(item => (
                <div key={item.gestor} className="bg-gray-50 dark:bg-[#201C3D] p-4 rounded-xl border border-gray-200 dark:border-[#2A2545] flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{item.gestor}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Eficiência Conclusiva</p>
                  </div>
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center bg-white dark:bg-[#1A1730] rounded-full shadow-inner border dark:border-[#2A2545]">
                    <span className="text-xs font-black text-gray-900 dark:text-white">{item.rate}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center col-span-3 py-4">Sem dados suficientes.</p>
            )}
          </div>
        </div>

      </div>

      {/* Main Process Table (Drill-down / list / CRUD) */}
      <div className="bg-white dark:bg-[#1A1730] rounded-xl border border-gray-200 dark:border-[#2A2545] shadow-sm overflow-hidden">
        <div className="p-5 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50/50 dark:bg-black/10">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Lista de Processos ({filteredProcessos.length})</h3>
            <p className="text-[11px] text-gray-400">
              Drill-down: clique nas linhas ou barras dos gráficos acima para filtrar rapidamente esta listagem.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark shadow-sm transition-all"
          >
            + Adicionar Novo Processo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-100 dark:bg-gray-800/50 text-[10px] text-gray-500 uppercase tracking-wide border-b border-gray-200 dark:border-[#2A2545]">
              <tr>
                <th className="px-4 py-3">ID Processo</th>
                <th className="px-4 py-3">Departamento</th>
                <th className="px-4 py-3">Advogado</th>
                <th className="px-4 py-3">Gestor</th>
                <th className="px-4 py-3">Data Entrada</th>
                <th className="px-4 py-3">Data Conclusão</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3 text-center">Tempo (Dias)</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcessos.map(p => {
                const isLate = p.status !== 'Concluído' && (
                  (new Date().getTime() - new Date(p.data_entrada).getTime()) / (1000 * 60 * 60 * 24) > 90
                );
                return (
                  <tr
                    key={p.id_processo}
                    className={`border-b border-gray-150 dark:border-[#2A2545] hover:bg-gray-50 dark:hover:bg-black/10 transition-colors ${
                      p.status === 'Aguardando Documentação' ? 'bg-amber-50/20 dark:bg-amber-950/5' : ''
                    } ${isLate ? 'bg-rose-50/10 dark:bg-rose-950/5' : ''}`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-gray-900 dark:text-white">#{p.id_processo}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        p.departamento === 'Cível' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                        p.departamento === 'Trabalhista' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                        'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                      }`}>
                        {p.departamento}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{p.advogado}</td>
                    <td className="px-4 py-3">{p.gestor}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(p.data_entrada).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.data_conclusao ? new Date(p.data_conclusao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {p.status === 'Aguardando Documentação' && <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />}
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' :
                          p.status === 'Concluído' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {userRole === 'gestor' ? fmtCurrency(p.valor) : <span className="text-gray-400">🔒</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-800 dark:text-gray-200">
                      {p.status === 'Concluído' ? (
                        <span className={p.tempo > 90 ? 'text-red-600 font-bold' : ''}>
                          {p.tempo}
                        </span>
                      ) : (
                        <span className="text-gray-400">Ativo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 hover:bg-gray-150 dark:hover:bg-gray-800 rounded text-blue-600"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(p.id_processo)}
                          className="p-1 hover:bg-gray-150 dark:hover:bg-gray-800 rounded text-red-600"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProcessos.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                    Nenhum processo correspondente aos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 dark:bg-black/10">
              <h3 className="font-bold text-gray-800 dark:text-white">
                {editingProcesso ? `Editar Processo #${editingProcesso.id_processo}` : 'Cadastrar Processo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveProcesso} className="p-6 space-y-4">
              {/* Dept */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase">Departamento *</label>
                <select
                  value={formDept}
                  onChange={e => setFormDept(e.target.value as 'Cível' | 'Trabalhista' | 'Societário')}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Cível">Cível</option>
                  <option value="Trabalhista">Trabalhista</option>
                  <option value="Societário">Societário</option>
                </select>
              </div>

              {/* Advogado */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase">Advogado Responsável *</label>
                <input
                  type="text"
                  placeholder="Nome do advogado"
                  value={formAdvogado}
                  onChange={e => setFormAdvogado(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 disabled:opacity-85 disabled:cursor-not-allowed"
                  required
                  disabled={!!lawyerName}
                />
              </div>

              {/* Gestor */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase">Gestor do Caso *</label>
                <input
                  type="text"
                  placeholder="Nome do gestor"
                  value={formGestor}
                  onChange={e => setFormGestor(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Data Entrada */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase">Data de Entrada *</label>
                <input
                  type="date"
                  value={formDataEntrada}
                  onChange={e => setFormDataEntrada(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase">Status *</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as 'Em Andamento' | 'Concluído' | 'Aguardando Documentação')}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Aguardando Documentação">Aguardando Documentação</option>
                </select>
              </div>

              {/* Data Conclusao */}
              {formStatus === 'Concluído' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="block text-xs font-semibold text-gray-600 uppercase">Data de Conclusão</label>
                  <input
                    type="date"
                    value={formDataConclusao}
                    onChange={e => setFormDataConclusao(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              )}

              {/* Valor */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase">
                  Valor Financeiro (R$) {userRole !== 'gestor' && '(Apenas Gestores)'}
                </label>
                <input
                  type="number"
                  placeholder="Valor em R$"
                  value={formValor}
                  onChange={e => setFormValor(Number(e.target.value))}
                  disabled={userRole !== 'gestor'}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Submit buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Procuração Subestabelecimento Modal */}
      {showSubestabelecerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1730] rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-[#2A2545] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-[#2A2545]">
              <div>
                <h2 className="text-base font-bold text-gray-800 dark:text-white">Procuração Subestabelecimento</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Subestabeleça a gestão do processo para outro advogado</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSubestabelecerModal(false);
                  setSubError('');
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A2545] text-gray-400"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubestabelecerSubmit} className="p-5 space-y-4">
              {/* Select Process */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">1. Selecionar Processo *</label>
                <select
                  value={subProcessId}
                  onChange={e => setSubProcessId(e.target.value)}
                  className="w-full text-xs border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 bg-white dark:bg-[#1A1730] dark:text-white"
                  required
                >
                  <option value="">Selecione um processo...</option>
                  {processos.map(p => (
                    <option key={p.id_processo} value={p.id_processo}>
                      Proc #{p.id_processo} - Dept: {p.departamento} ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Target Lawyer */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">2. Advogado de Destino *</label>
                <select
                  value={subTargetLawyerId}
                  onChange={e => setSubTargetLawyerId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 bg-white dark:bg-[#1A1730] dark:text-white"
                  required
                >
                  <option value="">Selecione o advogado...</option>
                  {mockLawyers
                    .filter(l => l.name !== lawyerName)
                    .map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name} - OAB {l.oab} ({l.specialties[0]})
                      </option>
                    ))}
                </select>
              </div>

              {/* Upload Document */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-2">3. Procuração de Subestabelecimento (.pdf, .jpg, .jpeg, .png) *</label>
                <input
                  type="file"
                  ref={subFileInputRef}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                    if (!allowed.includes(f.type)) {
                      setSubError('Formato não permitido. Use PDF, JPG, JPEG ou PNG.');
                      return;
                    }
                    setSubFile({
                      name: f.name,
                      fileType: f.type.includes('pdf') ? 'PDF' : 'Imagem',
                      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`
                    });
                    setSubError('');
                  }}
                />
                {!subFile ? (
                  <button
                    type="button"
                    onClick={() => subFileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-primary/20 dark:border-primary/40 rounded-xl py-5 text-center hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                  >
                    <p className="text-2xl mb-1">📤</p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Carregar arquivo da procuração</p>
                    <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, JPEG ou PNG</p>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3">
                    <span className="text-xl shrink-0">{subFile.fileType === 'PDF' ? '📄' : '🖼️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{subFile.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-400">{subFile.fileType} · {subFile.size}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubFile(null)}
                      className="shrink-0 text-red-500 hover:text-red-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">4. Senha Particular para Confirmar *</label>
                <input
                  type="password"
                  placeholder="Digite sua senha particular (ex: sua OAB ou 123456)"
                  value={subPassword}
                  onChange={e => setSubPassword(e.target.value)}
                  className="w-full text-xs border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 bg-white dark:bg-[#1A1730] dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>

              {subError && <p className="text-xs text-red-500 font-semibold">{subError}</p>}

              {subSuccess && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl px-4 py-2.5 text-green-800 dark:text-green-400 text-xs font-semibold">
                  ✅ Subestabelecimento realizado! O processo foi transferido.
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-[#2A2545]">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubestabelecerModal(false);
                    setSubError('');
                  }}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:text-white dark:bg-transparent dark:border-[#2A2545] dark:hover:bg-[#2A2545]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subSuccess}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirmar Subestabelecimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Autorizar Acesso ao Caso Modal */}
      {showAutorizarModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1730] rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-[#2A2545] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-[#2A2545]">
              <div>
                <h2 className="text-base font-bold text-gray-800 dark:text-white">Autorizar Acesso ao Caso</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Delegue acesso de um processo para sua equipe</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAutorizarModal(false);
                  setAuthError('');
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A2545] text-gray-400"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAutorizarSubmit} className="p-5 space-y-4">
              {/* Select Process */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">1. Selecionar Processo *</label>
                <select
                  value={authProcessId}
                  onChange={e => setAuthProcessId(e.target.value)}
                  className="w-full text-xs border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 bg-white dark:bg-[#1A1730] dark:text-white"
                  required
                >
                  <option value="">Selecione um processo...</option>
                  {processos.map(p => (
                    <option key={p.id_processo} value={p.id_processo}>
                      Proc #{p.id_processo} - Dept: {p.departamento} ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-2">2. Categoria do Profissional *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs cursor-pointer dark:text-white">
                    <input
                      type="radio"
                      name="authCategory"
                      checked={authCategory === 'intern'}
                      onChange={() => {
                        setAuthCategory('intern');
                        setAuthTargetId('');
                      }}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Estagiário</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer dark:text-white">
                    <input
                      type="radio"
                      name="authCategory"
                      checked={authCategory === 'secretary'}
                      onChange={() => {
                        setAuthCategory('secretary');
                        setAuthTargetId('');
                      }}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Secretário / Assist. Jurídico</span>
                  </label>
                </div>
              </div>

              {/* Select Target Professional */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">3. Selecionar Profissional *</label>
                <select
                  value={authTargetId}
                  onChange={e => setAuthTargetId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 bg-white dark:bg-[#1A1730] dark:text-white"
                  required
                >
                  <option value="">Selecione o profissional...</option>
                  {authCategory === 'intern'
                    ? mockInterns.map(i => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.university})
                        </option>
                      ))
                    : mockSecretaries.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.availability === 'integral' ? 'Integral' : 'Meio Período'})
                        </option>
                      ))}
                </select>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">4. Senha Particular para Confirmar *</label>
                <input
                  type="password"
                  placeholder="Digite sua senha particular (ex: sua OAB ou 123456)"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  className="w-full text-xs border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 bg-white dark:bg-[#1A1730] dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>

              {authError && <p className="text-xs text-red-500 font-semibold">{authError}</p>}

              {authSuccess && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl px-4 py-2.5 text-green-800 dark:text-green-400 text-xs font-semibold">
                  ✅ Autorização de acesso concedida com sucesso!
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-[#2A2545]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAutorizarModal(false);
                    setAuthError('');
                  }}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:text-white dark:bg-transparent dark:border-[#2A2545] dark:hover:bg-[#2A2545]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={authSuccess}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirmar Autorização
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
