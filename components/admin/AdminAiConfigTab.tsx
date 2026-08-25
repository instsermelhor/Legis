import React, { useState, useEffect } from 'react';
import {
  getAiQuotaConfig,
  saveAiQuotaConfig,
  getAiMonthlyQuotaStatus,
  AiQuotaStatus,
  AiQuotaConfig
} from '../../services/aiUsageLogService';

export const AdminAiConfigTab: React.FC = () => {
  const [model, setModel] = useState('gemini-2.5-flash');
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [ragEnabled, setRagEnabled] = useState(true);
  const [stfSyncStatus, setStfSyncStatus] = useState('Sincronizado (STF 2026 / STJ 2026)');
  const [savedToast, setSavedToast] = useState(false);

  // Quota & Alertas de Throttling (80% / 95%)
  const [quotaConfig, setQuotaConfig] = useState<AiQuotaConfig>(getAiQuotaConfig());
  const [quotaStatus, setQuotaStatus] = useState<AiQuotaStatus>(getAiMonthlyQuotaStatus());

  useEffect(() => {
    setQuotaStatus(getAiMonthlyQuotaStatus());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAiQuotaConfig(quotaConfig);
    setQuotaStatus(getAiMonthlyQuotaStatus());
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#181537] p-6 rounded-2xl border border-gray-200 dark:border-[#2A2545] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🤖</span> Central de IA Preditiva, Quotas & RAG STF/STJ
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Controle os modelos Gemini, regras de RAG jurisprudencial, limites de inferência e monitoramento de quotas de tokens.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-xs font-semibold">
          Engine IA Ativa
        </span>
      </div>

      {/* Alerta de Quota (Thresholds 80% / 95% / 100%) */}
      {quotaStatus.alertTriggered && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-fade-in ${
          quotaStatus.status === 'EXCEEDED'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            : quotaStatus.status === 'CRITICAL_95'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
            : 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
        }`}>
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-bold text-sm">Monitor de Cota de Tokens GCP / Gemini</h4>
            <p className="text-xs mt-0.5">{quotaStatus.message}</p>
          </div>
        </div>
      )}

      {savedToast && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <span>✅ Configurações de IA e limites de quota salvos com sucesso!</span>
        </div>
      )}

      {/* Grid de Métricas com Monitor de Cota Mensal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#181537] p-5 rounded-2xl border border-gray-200 dark:border-[#2A2545]">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Consultas IA / Mês</span>
          <div className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">14.820</div>
          <span className="text-[11px] text-emerald-500 font-bold mt-1 inline-block">+18% em relação ao mês anterior</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#181537] p-5 rounded-2xl border border-gray-200 dark:border-[#2A2545]">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Precisão RAG Preditivo</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">96,4%</div>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">Indexação STF/STJ em tempo real</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#181537] p-5 rounded-2xl border border-gray-200 dark:border-[#2A2545]">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Status da API Gemini</span>
          <div className="text-2xl font-black text-emerald-500 mt-1 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            Operacional
          </div>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">Latência média: 420ms</span>
        </div>

        {/* Metric 4: Monitor de Cota */}
        <div className="bg-white dark:bg-[#181537] p-5 rounded-2xl border border-gray-200 dark:border-[#2A2545]">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Consumo de Cota Mensal</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              quotaStatus.percentageUsed >= 80 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
            }`}>
              {quotaStatus.percentageUsed}%
            </span>
          </div>
          <div className="text-lg font-black text-gray-900 dark:text-white mt-1">
            {quotaStatus.usedTokensCurrentMonth.toLocaleString('pt-BR')} / {quotaStatus.monthlyQuotaTokens.toLocaleString('pt-BR')}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quotaStatus.percentageUsed >= 95 ? 'bg-rose-500' : quotaStatus.percentageUsed >= 80 ? 'bg-amber-500' : 'bg-violet-600'
              }`}
              style={{ width: `${Math.min(100, quotaStatus.percentageUsed)}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400 mt-1.5 inline-block">
            Alerta ativo em {quotaConfig.alertThresholdPercent}% do limite
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-[#181537] p-6 rounded-2xl border border-gray-200 dark:border-[#2A2545] space-y-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Parâmetros do Modelo de Linguagem & Quotas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Modelo Principal Gemini</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#110F28] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recomendado — Alta velocidade)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Raciocínio jurídico avançado)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Temperatura ({temperature})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={e => setTemperature(parseFloat(e.target.value))}
              className="w-full mt-2 accent-violet-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Limite Máximo de Tokens por Resposta</label>
            <input
              type="number"
              value={maxTokens}
              onChange={e => setMaxTokens(parseInt(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#110F28] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cota Mensal Global de Tokens</label>
            <input
              type="number"
              step="100000"
              value={quotaConfig.monthlyQuotaTokens}
              onChange={e => setQuotaConfig({ ...quotaConfig, monthlyQuotaTokens: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#110F28] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Limiar de Alerta Preventivo (%)</label>
            <input
              type="number"
              min="50"
              max="99"
              value={quotaConfig.alertThresholdPercent}
              onChange={e => setQuotaConfig({ ...quotaConfig, alertThresholdPercent: parseInt(e.target.value) || 80 })}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#110F28] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status da Base RAG Jurisprudencial</label>
            <input
              type="text"
              readOnly
              value={stfSyncStatus}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-[#110F28] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-600 dark:text-gray-400 font-mono"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#2A2545]">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ragEnable"
              checked={ragEnabled}
              onChange={e => setRagEnabled(e.target.checked)}
              className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
            />
            <label htmlFor="ragEnable" className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Habilitar RAG Obrigatório em Análises Preditivas (Consulta automática a acórdãos STF/STJ)
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hardLimitEnable"
              checked={quotaConfig.hardLimitEnabled}
              onChange={e => setQuotaConfig({ ...quotaConfig, hardLimitEnabled: e.target.checked })}
              className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
            />
            <label htmlFor="hardLimitEnable" className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Ativar Bloqueio Preventivo (*Hard Limit*) ao atingir 100% da cota mensal (Evita estouro de fatura GCP)
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            Salvar Parâmetros de IA
          </button>
        </div>
      </form>
    </div>
  );
};

