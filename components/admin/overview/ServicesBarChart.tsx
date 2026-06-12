import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { MOCK_SERVICES_BY_DAY } from './adminMockKpis';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({
  active, payload, label,
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-xl shadow-xl px-4 py-3 text-xs">
      <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value.toLocaleString('pt-BR')}
        </p>
      ))}
    </div>
  );
};

// ─── Services Grouped Bar Chart ───────────────────────────────────────────────
export const ServicesBarChart: React.FC = () => (
  <div className="bg-white dark:bg-[#12102A] rounded-2xl border border-gray-200 dark:border-[#2A2545] shadow-sm p-5">
    {/* Header */}
    <div className="mb-1">
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
        Volume de Serviços de Eficiência
      </h3>
      <p className="text-[10px] text-gray-400 dark:text-gray-500">Requisições por dia da semana</p>
    </div>

    {/* Chart */}
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={MOCK_SERVICES_BY_DAY} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={3}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
        <Legend
          iconType="square"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
        />
        <Bar
          dataKey="automacoes" name="Automações"
          fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={22}
        />
        <Bar
          dataKey="pecas_ia" name="Peças IA"
          fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={22}
        />
        <Bar
          dataKey="consultas" name="Consultas"
          fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={22}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
