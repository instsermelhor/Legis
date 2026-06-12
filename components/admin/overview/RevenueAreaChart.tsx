import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { MOCK_REVENUE_DATA } from './adminMockKpis';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({
  active, payload, label,
}) => {
  if (!active || !payload?.length) return null;
  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`;
  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-xl shadow-xl px-4 py-3 text-xs">
      <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Revenue Area Chart ───────────────────────────────────────────────────────
export const RevenueAreaChart: React.FC = () => (
  <div className="bg-white dark:bg-[#12102A] rounded-2xl border border-gray-200 dark:border-[#2A2545] shadow-sm p-5">
    {/* Header */}
    <div className="flex items-center justify-between mb-1">
      <div>
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
          Receita vs. Custos de Infraestrutura
        </h3>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">Últimos 12 meses — valores em R$</p>
      </div>
      <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
        ↑ Crescimento consistente
      </span>
    </div>

    {/* Chart */}
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={MOCK_REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradCustos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#F43F5E" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10B981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
        />
        <Area
          type="monotone" dataKey="receita" name="Receita"
          stroke="#7C3AED" strokeWidth={2.5}
          fill="url(#gradReceita)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Area
          type="monotone" dataKey="custos" name="Custos Infra"
          stroke="#F43F5E" strokeWidth={2}
          fill="url(#gradCustos)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Area
          type="monotone" dataKey="lucro" name="Lucro Bruto"
          stroke="#10B981" strokeWidth={2}
          fill="url(#gradLucro)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
          strokeDasharray="4 2"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
