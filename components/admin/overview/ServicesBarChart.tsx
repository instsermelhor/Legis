import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';
import { backend } from '../../../services/modules';

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
export const ServicesBarChart: React.FC = () => {
  // Dados reais: processos por status (métricas do admin).
  const [dados, setDados] = useState<Array<{ day: string; total: number }>>([]);
  useEffect(() => {
    backend.admin.metricas()
      .then(m => setDados(m.processos_por_status.map(p => ({ day: p.status, total: p.total }))))
      .catch(() => setDados([]));
  }, []);

  return (
  <div className="bg-white dark:bg-[#12102A] rounded-2xl border border-gray-200 dark:border-[#2A2545] shadow-sm p-5">
    {/* Header */}
    <div className="mb-1">
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
        Processos por Status
      </h3>
      <p className="text-[10px] text-gray-400 dark:text-gray-500">Toda a plataforma — dados do banco</p>
    </div>

    {/* Chart */}
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={dados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={3}>
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
          dataKey="total" name="Processos"
          fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
  );
};
