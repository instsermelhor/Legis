import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TenantTokenUsage {
  id: string;
  tenant: string;
  plan: string;
  tokensInput: number;
  tokensOutput: number;
  totalTokens: number;
  costUsd: number;
  provider: 'openai' | 'google' | 'anthropic';
  model: string;
  period: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_USAGE: TenantTokenUsage[] = [
  { id: '1', tenant: 'Escritório Saraiva & Assoc.',   plan: 'Pro',       tokensInput: 1_280_400, tokensOutput: 412_200, totalTokens: 1_692_600, costUsd: 42.31, provider: 'openai',    model: 'gpt-4o',        period: 'Jun/25' },
  { id: '2', tenant: 'Depart. Jurídico Fibra Corp.',  plan: 'Corporate', tokensInput: 2_100_000, tokensOutput: 680_000, totalTokens: 2_780_000, costUsd: 69.50, provider: 'openai',    model: 'gpt-4o',        period: 'Jun/25' },
  { id: '3', tenant: 'Adv. Carlos Mendes',            plan: 'Starter',   tokensInput: 148_200,   tokensOutput: 52_100,  totalTokens: 200_300,   costUsd: 5.01,  provider: 'google',    model: 'gemini-2.0',    period: 'Jun/25' },
  { id: '4', tenant: 'Escritório Lima & Pereira',     plan: 'Pro',       tokensInput: 890_100,   tokensOutput: 301_400, totalTokens: 1_191_500, costUsd: 29.79, provider: 'openai',    model: 'gpt-4o-mini',   period: 'Jun/25' },
  { id: '5', tenant: 'Adv. Fernanda Lopes',           plan: 'Starter',   tokensInput: 92_400,    tokensOutput: 31_200,  totalTokens: 123_600,   costUsd: 3.09,  provider: 'anthropic', model: 'claude-3-haiku', period: 'Jun/25' },
  { id: '6', tenant: 'Corp. Jurídica Nacional',       plan: 'Corporate', tokensInput: 3_400_000, tokensOutput: 920_000, totalTokens: 4_320_000, costUsd: 108.0, provider: 'openai',    model: 'gpt-4o',        period: 'Jun/25' },
  { id: '7', tenant: 'Adv. Roberto Andrade',          plan: 'Pro',       tokensInput: 480_200,   tokensOutput: 148_000, totalTokens: 628_200,   costUsd: 15.71, provider: 'openai',    model: 'gpt-4o-mini',   period: 'Jun/25' },
  { id: '8', tenant: 'Escritório Pimentel',           plan: 'Starter',   tokensInput: 214_000,   tokensOutput: 78_000,  totalTokens: 292_000,   costUsd: 7.30,  provider: 'google',    model: 'gemini-2.0',    period: 'Jun/25' },
];

const MOCK_DAILY: { day: string; tokens: number; cost: number }[] = [
  { day: '01',  tokens: 820_000,  cost: 20.50 },
  { day: '03',  tokens: 1_100_000, cost: 27.50 },
  { day: '05',  tokens: 940_000,  cost: 23.50 },
  { day: '07',  tokens: 1_280_000, cost: 32.00 },
  { day: '09',  tokens: 1_050_000, cost: 26.25 },
  { day: '11',  tokens: 890_000,  cost: 22.25 },
];

const PROVIDER_COLORS: Record<string, string> = {
  openai:    '#10A37F',
  google:    '#4285F4',
  anthropic: '#D97706',
};

const PLAN_BADGE: Record<string, string> = {
  Starter:   'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  Pro:       'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
  Corporate: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
};

// ─── Utility ──────────────────────────────────────────────────────────────────
const fmtTokens = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : `${(n / 1000).toFixed(1)}K`;
const fmtUsd = (n: number) => `US$ ${n.toFixed(2)}`;

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-xl shadow-xl px-4 py-3 text-xs">
      <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">Dia {label}</p>
      <p className="text-violet-600 dark:text-violet-400 font-semibold">{fmtTokens(payload[0].value)} tokens</p>
      <p className="text-emerald-600 dark:text-emerald-400">{fmtUsd(payload[1]?.value ?? 0)} custo</p>
    </div>
  );
};

// ─── AI Telemetry Component ───────────────────────────────────────────────────
export const AiTelemetry: React.FC = () => {
  const [sortBy, setSortBy] = useState<'tokens' | 'cost'>('cost');

  const sorted = [...MOCK_USAGE].sort((a, b) =>
    sortBy === 'cost' ? b.costUsd - a.costUsd : b.totalTokens - a.totalTokens
  );

  const totalTokens = MOCK_USAGE.reduce((s, u) => s + u.totalTokens, 0);
  const totalCost   = MOCK_USAGE.reduce((s, u) => s + u.costUsd, 0);
  const maxTokens   = Math.max(...MOCK_USAGE.map((u) => u.totalTokens));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
          Telemetria de IA — Consumo de Tokens
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Consumo por tenant em Junho/2025 — Modelos: GPT-4o, Gemini 2.0, Claude 3
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Tokens Mês',    value: fmtTokens(totalTokens), icon: '🧠', color: 'text-violet-700 dark:text-violet-300' },
          { label: 'Custo Total (USD)',    value: fmtUsd(totalCost),      icon: '💰', color: 'text-emerald-700 dark:text-emerald-300' },
          { label: 'Tenants Consumidores', value: String(MOCK_USAGE.length), icon: '🏢', color: 'text-blue-700 dark:text-blue-300' },
          { label: 'Margem Estimada',      value: '∼68%',                icon: '📈', color: 'text-amber-700 dark:text-amber-300' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#12102A] rounded-xl border border-gray-200 dark:border-[#2A2545] p-4 text-center">
            <p className="text-xl mb-1">{s.icon}</p>
            <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Daily chart */}
      <div className="bg-white dark:bg-[#12102A] rounded-2xl border border-gray-200 dark:border-[#2A2545] p-5">
        <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
          Consumo de Tokens — Primeiros Dias de Junho
        </h4>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={MOCK_DAILY} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={(v) => fmtTokens(v)} width={38} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
            <Bar dataKey="tokens" name="Tokens" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {MOCK_DAILY.map((_, i) => (
                <Cell key={i} fill={i === MOCK_DAILY.length - 1 ? '#4F46E5' : '#7C3AED'} />
              ))}
            </Bar>
            <Bar dataKey="cost" name="Custo" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} hide />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-tenant table */}
      <div className="bg-white dark:bg-[#12102A] rounded-2xl border border-gray-200 dark:border-[#2A2545] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2A2545]">
          <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Consumo por Tenant
          </p>
          <div className="flex gap-2">
            {(['cost', 'tokens'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setSortBy(k)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === k ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-[#1A1730] text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                }`}
              >
                {k === 'cost' ? '$ Custo' : '🧠 Tokens'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#1A1730] text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Tenant</th>
                <th className="px-5 py-3 text-left">Plano</th>
                <th className="px-5 py-3 text-left">Modelo</th>
                <th className="px-5 py-3 text-right">Tokens Totais</th>
                <th className="px-5 py-3 text-right">Custo USD</th>
                <th className="px-5 py-3 text-left">Consumo Relativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2A2545]">
              {sorted.map((u) => {
                const relPct = (u.totalTokens / maxTokens) * 100;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-[#1A1730]/50">
                    <td className="px-5 py-3 font-semibold text-gray-800 dark:text-gray-100 text-sm">{u.tenant}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${PLAN_BADGE[u.plan] ?? ''}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[u.provider] }} />
                        {u.model}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-violet-700 dark:text-violet-400 text-xs">
                      {fmtTokens(u.totalTokens)}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                      {fmtUsd(u.costUsd)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-violet-500"
                            style={{ width: `${relPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 w-8 text-right">{relPct.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
