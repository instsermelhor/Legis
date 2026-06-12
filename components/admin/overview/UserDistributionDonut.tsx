import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { MOCK_USER_DISTRIBUTION } from './adminMockKpis';

// ─── Active Sector (hover effect) ────────────────────────────────────────────
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;

  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill={fill} className="text-sm font-bold" style={{ fontSize: 13, fontWeight: 700 }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#6B7280" style={{ fontSize: 11 }}>
        {value.toLocaleString('pt-BR')}
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="#9CA3AF" style={{ fontSize: 10 }}>
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector
        cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6}
        startAngle={startAngle} endAngle={endAngle} fill={fill}
      />
      <Sector
        cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 14}
        startAngle={startAngle} endAngle={endAngle} fill={fill}
      />
    </g>
  );
};

// ─── User Distribution Donut ──────────────────────────────────────────────────
export const UserDistributionDonut: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = MOCK_USER_DISTRIBUTION.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white dark:bg-[#12102A] rounded-2xl border border-gray-200 dark:border-[#2A2545] shadow-sm p-5">
      {/* Header */}
      <div className="mb-1">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
          Distribuição de Perfis de Usuário
        </h3>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          Total: {total.toLocaleString('pt-BR')} usuários cadastrados
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Donut */}
        <div className="w-full sm:w-56 shrink-0" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={MOCK_USER_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                strokeWidth={0}
              >
                {MOCK_USER_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2">
          {MOCK_USER_DISTRIBUTION.map((item, idx) => {
            const pct = ((item.value / total) * 100).toFixed(1);
            return (
              <button
                key={item.name}
                onClick={() => setActiveIndex(idx)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${
                  activeIndex === idx
                    ? 'bg-gray-100 dark:bg-[#1A1730] shadow-sm'
                    : 'hover:bg-gray-50 dark:hover:bg-[#1A1730]/50'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-300 flex-1 truncate">
                  {item.name}
                </span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                  {item.value.toLocaleString('pt-BR')}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 w-10 text-right">
                  {pct}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
