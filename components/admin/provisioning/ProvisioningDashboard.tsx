import React, { useState, useEffect, useCallback } from 'react';
import { ProvisioningService } from '../../../services/provisioningService';
import type { ServiceProvisioning, ProvisioningStatus, ServiceProvisioningGroup } from '../../../types';

// ─── Badge de Status ──────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: ProvisioningStatus }> = ({ status }) => {
  const config: Record<ProvisioningStatus, { label: string; cls: string; dot: string }> = {
    PENDING:          { label: 'Pendente',   cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', dot: 'bg-yellow-400' },
    IN_PROGRESS:      { label: 'Processando', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',         dot: 'bg-blue-400 animate-pulse' },
    PROVISIONED:      { label: 'Entregue',    cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',     dot: 'bg-green-400' },
    PROVISION_FAILED: { label: '⚠ Falha',    cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',            dot: 'bg-red-500 animate-pulse' },
    REFUNDED:         { label: 'Reembolsado', cls: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',            dot: 'bg-gray-400' },
    EXPIRED:          { label: 'Expirado',    cls: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',            dot: 'bg-gray-300' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
};

// ─── Badge de Grupo ───────────────────────────────────────────────────────────
const GroupBadge: React.FC<{ group: ServiceProvisioningGroup }> = ({ group }) => {
  const config: Record<ServiceProvisioningGroup, { icon: string; cls: string; label: string }> = {
    client:    { icon: '👤', label: 'Cliente',     cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
    lawyer:    { icon: '⚖️', label: 'Advogado',    cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
    intern:    { icon: '🎓', label: 'Bacharelando', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' },
    secretary: { icon: '📋', label: 'Secretário',  cls: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400' },
  };
  const c = config[group];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label: string; value: string | number; icon: string;
  color: string; sub?: string; urgent?: boolean;
}> = ({ label, value, icon, color, sub, urgent }) => (
  <div className={`relative bg-white dark:bg-[#12102A] rounded-xl border ${urgent ? 'border-red-400 dark:border-red-600 shadow-red-100 dark:shadow-red-900/20 shadow-lg' : 'border-gray-200 dark:border-[#2A2545]'} p-4`}>
    {urgent && (
      <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" />
    )}
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);

// ─── Painel de Simulação de Pagamento ─────────────────────────────────────────
const SimulatePaymentPanel: React.FC<{ onSimulated: () => void }> = ({ onSimulated }) => {
  const [form, setForm] = useState({
    userEmail: 'ana.rodrigues@email.com',
    group: 'client' as ServiceProvisioningGroup,
    serviceId: 'cpf-rastreio',
    serviceTitle: 'Rastreio Automatizado via CPF',
    amount: 297,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const SERVICE_PRESETS: { id: string; title: string; amount: number; group: ServiceProvisioningGroup }[] = [
    { id: 'cpf-rastreio', title: 'Rastreio Automatizado via CPF', amount: 297, group: 'client' },
    { id: 'documento-ia', title: 'Documento Jurídico via IA', amount: 147, group: 'client' },
    { id: 'tokens-ia', title: '1.000 Tokens de IA Jurídica', amount: 197, group: 'lawyer' },
    { id: 'robos-tribunal', title: 'Robô de Monitoramento Tribunal', amount: 397, group: 'lawyer' },
    { id: 'simulador-oab', title: 'Simulador OAB Avançado', amount: 97, group: 'intern' },
    { id: 'mentoria-premium', title: '3 Sessões de Mentoria Premium', amount: 247, group: 'intern' },
  ];

  const handlePreset = (p: typeof SERVICE_PRESETS[0]) => {
    setForm(prev => ({ ...prev, serviceId: p.id, serviceTitle: p.title, amount: p.amount, group: p.group }));
  };

  const handleSimulate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const prov = await ProvisioningService.simulatePayment({
        userId: form.userEmail,
        userEmail: form.userEmail,
        group: form.group,
        serviceId: form.serviceId,
        serviceTitle: form.serviceTitle,
        amount: form.amount * 100, // centavos
      });
      setResult(`✅ Pagamento simulado! ID: ${prov.id} | Status inicial: ${prov.status}`);
      setTimeout(onSimulated, 2000);
    } catch (e) {
      setResult(`❌ Erro: ${String(e)}`);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-[#12102A] rounded-xl border border-dashed border-gray-300 dark:border-[#2A2545] p-5">
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        🧪 Simulador de Pagamento
        <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-normal">Modo Demo</span>
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {SERVICE_PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => handlePreset(p)}
            className={`text-xs px-2 py-1 rounded-lg border transition ${
              form.serviceId === p.id
                ? 'bg-violet-600 text-white border-violet-600'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-400'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">E-mail do Usuário</label>
          <input
            type="email" value={form.userEmail}
            onChange={e => setForm(p => ({ ...p, userEmail: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor (R$)</label>
          <input
            type="number" value={form.amount}
            onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {result && (
        <p className={`text-xs mb-3 p-2 rounded-lg ${result.startsWith('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
          {result}
        </p>
      )}

      <button
        onClick={handleSimulate} disabled={loading}
        className="w-full py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition"
      >
        {loading ? '⏳ Processando...' : '🧪 Simular Pagamento Confirmado'}
      </button>
    </div>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export const ProvisioningDashboard: React.FC = () => {
  const [provisionings, setProvisionings] = useState<ServiceProvisioning[]>([]);
  const [kpis, setKpis] = useState(ProvisioningService.getKpis());
  const [statusFilter, setStatusFilter] = useState<ProvisioningStatus | ''>('');
  const [groupFilter, setGroupFilter] = useState<ServiceProvisioningGroup | ''>('');
  const [search, setSearch] = useState('');
  const [retrying, setRetrying] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [detail, setDetail] = useState<ServiceProvisioning | null>(null);

  const load = useCallback(() => {
    setProvisionings(ProvisioningService.getAll());
    setKpis(ProvisioningService.getKpis());
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000); // auto-refresh a cada 3s
    return () => clearInterval(interval);
  }, [load]);

  const filtered = provisionings.filter(p => {
    const matchSearch = !search ||
      p.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      p.serviceTitle.toLowerCase().includes(search.toLowerCase()) ||
      p.id.includes(search);
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchGroup = !groupFilter || p.group === groupFilter;
    return matchSearch && matchStatus && matchGroup;
  });

  const failures = provisionings.filter(p => p.status === 'PROVISION_FAILED');

  const handleRetry = async (id: string) => {
    setRetrying(id);
    const result = await ProvisioningService.retryProvisioning(id);
    if (!result.success) alert(result.message);
    setTimeout(() => { setRetrying(null); load(); }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Motor de Provisionamento</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Rastreie e gerencie todos os serviços contratados em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            🔄 Atualizar
          </button>
          <button
            onClick={() => setShowSimulator(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition"
          >
            🧪 Simular Pagamento
          </button>
        </div>
      </div>

      {/* Alertas de Falha */}
      {failures.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700 dark:text-red-400">
                {failures.length} provisionamento{failures.length > 1 ? 's' : ''} com falha — ação requerida
              </p>
              <div className="mt-2 space-y-1">
                {failures.slice(0, 3).map(f => (
                  <div key={f.id} className="flex items-center justify-between gap-2">
                    <p className="text-xs text-red-600 dark:text-red-400 flex-1 truncate">
                      <strong>{f.userEmail}</strong> — {f.serviceTitle}: {f.errorMessage || 'Erro desconhecido'}
                    </p>
                    <button
                      onClick={() => handleRetry(f.id)}
                      disabled={retrying === f.id}
                      className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded transition flex-shrink-0"
                    >
                      {retrying === f.id ? '⏳' : '↺ Retry'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Provisionamentos" value={kpis.total} icon="📦" color="text-gray-900 dark:text-white" />
        <KpiCard label="Entregues" value={kpis.provisioned} icon="✅" color="text-green-600 dark:text-green-400"
          sub={`R$ ${kpis.totalRevenue.toFixed(2)} em receita`} />
        <KpiCard label="Em Falha" value={kpis.failed} icon="❌" color="text-red-600 dark:text-red-400"
          sub={`R$ ${kpis.failedRevenue.toFixed(2)} em risco`} urgent={kpis.failed > 0} />
        <KpiCard label="Processando" value={kpis.inProgress + kpis.pending} icon="⏳" color="text-blue-600 dark:text-blue-400" />
      </div>

      {/* Simulador */}
      {showSimulator && (
        <SimulatePaymentPanel onSimulated={() => { setShowSimulator(false); load(); }} />
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text" placeholder="Buscar por e-mail, serviço ou ID..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm"
        />
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value as ProvisioningStatus | '')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm"
        >
          <option value="">Todos os Status</option>
          <option value="PENDING">Pendente</option>
          <option value="IN_PROGRESS">Processando</option>
          <option value="PROVISIONED">Entregue</option>
          <option value="PROVISION_FAILED">Falha</option>
          <option value="REFUNDED">Reembolsado</option>
        </select>
        <select
          value={groupFilter} onChange={e => setGroupFilter(e.target.value as ServiceProvisioningGroup | '')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm"
        >
          <option value="">Todos os Grupos</option>
          <option value="client">👤 Clientes</option>
          <option value="lawyer">⚖️ Advogados</option>
          <option value="intern">🎓 Bacharelandos</option>
          <option value="secretary">📋 Secretários</option>
        </select>
      </div>

      {/* Modal de detalhe */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDetail(null)}>
          <div className="bg-white dark:bg-[#12102A] rounded-2xl border border-gray-200 dark:border-[#2A2545] shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Detalhes do Provisionamento</h3>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl">✕</button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ['ID', detail.id],
                ['Payment ID', detail.paymentId],
                ['Usuário', detail.userEmail],
                ['Grupo', detail.group],
                ['Serviço', detail.serviceTitle],
                ['Valor', `R$ ${detail.amount.toFixed(2)}`],
                ['Status', detail.status],
                ['Criado em', new Date(detail.createdAt).toLocaleString('pt-BR')],
                ['Atualizado em', new Date(detail.updatedAt).toLocaleString('pt-BR')],
                ...(detail.provisionedAt ? [['Entregue em', new Date(detail.provisionedAt).toLocaleString('pt-BR')]] : []),
                ...(detail.errorMessage ? [['Erro', detail.errorMessage]] : []),
                ...(detail.retryCount !== undefined ? [['Tentativas', String(detail.retryCount)]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-gray-400 dark:text-gray-500 min-w-[110px] flex-shrink-0">{k}:</span>
                  <span className="text-gray-900 dark:text-white break-all">{v}</span>
                </div>
              ))}
            </div>
            {detail.status === 'PROVISION_FAILED' && (
              <button
                onClick={() => { handleRetry(detail.id); setDetail(null); }}
                className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition"
              >
                ↺ Tentar Novamente
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white dark:bg-[#12102A] rounded-xl border border-gray-200 dark:border-[#2A2545] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#2A2545] bg-gray-50 dark:bg-[#1A1730]">
                {['Usuário / Serviço', 'Grupo', 'Valor', 'Status', 'Data', 'Ações'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#1E1B3A]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                    {provisionings.length === 0
                      ? 'Nenhum provisionamento ainda. Use o simulador para testar o fluxo.'
                      : 'Nenhum resultado para os filtros selecionados.'}
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} className={`transition hover:bg-gray-50 dark:hover:bg-[#1A1730] cursor-pointer ${p.status === 'PROVISION_FAILED' ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}
                  onClick={() => setDetail(p)}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{p.serviceTitle}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.userEmail}</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600 font-mono">{p.id.slice(0, 16)}…</p>
                  </td>
                  <td className="px-4 py-3"><GroupBadge group={p.group} /></td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                    R$ {p.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === 'PROVISION_FAILED' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleRetry(p.id); }}
                        disabled={retrying === p.id}
                        className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded transition"
                      >
                        {retrying === p.id ? '⏳' : '↺ Retry'}
                      </button>
                    )}
                    {p.status === 'PROVISIONED' && (
                      <span className="text-xs text-green-500">✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 dark:border-[#2A2545] flex items-center justify-between text-xs text-gray-400">
          <span>{filtered.length} de {provisionings.length} registros</span>
          <span>Auto-refresh: 3s</span>
        </div>
      </div>
    </div>
  );
};
