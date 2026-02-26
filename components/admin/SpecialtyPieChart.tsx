import React, { useMemo } from 'react';

interface PieChartProps {
  data: { [key: string]: number };
}

// Paleta de cores predefinida para as fatias do gráfico
const COLORS = [
  '#0D47A1', // primary.dark
  '#1976D2', // primary.light
  '#42A5F5', // accent
  '#FFC107', // secondary
  '#FFA000',
  '#1E88E5',
  '#FBC02D',
  '#0097A7',
  '#D81B60',
  '#6D4C41',
];

const getCoordinatesForPercent = (percent: number) => {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
};

export const SpecialtyPieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = useMemo(() => Object.values(data).reduce((acc, value) => acc + value, 0), [data]);
  
  if (total === 0) {
      return <p className="text-center text-gray-500">Nenhum dado disponível para exibir o gráfico.</p>
  }

  let cumulativePercent = 0;

  const slices = Object.entries(data).map(([label, value], index) => {
    const percent = value / total;
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

    // Se a fatia for maior que 50%, usamos a flag de arco grande
    const largeArcFlag = percent > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX * 80} ${startY * 80}`, // Mover para o ponto inicial no círculo
      `A 80 80 0 ${largeArcFlag} 1 ${endX * 80} ${endY * 80}`, // Desenhar o arco
      `L 0 0`, // Linha de volta para o centro
    ].join(' ');

    return {
      pathData,
      color: COLORS[index % COLORS.length],
      label,
      value,
      percent: (percent * 100).toFixed(1)
    };
  });

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 animate-fade-in">
      {/* Gráfico */}
      <div className="relative w-48 h-48 flex-shrink-0">
        <svg viewBox="-100 -100 200 200" transform="rotate(-90)">
          {slices.map((slice, index) => (
            <path key={index} d={slice.pathData} fill={slice.color} />
          ))}
        </svg>
      </div>

      {/* Legenda */}
      <div className="w-full">
        <ul className="space-y-2">
          {slices.map((slice, index) => (
            <li key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: slice.color }}
                ></span>
                <span className="text-gray-700">{slice.label}</span>
              </div>
              <span className="font-semibold text-gray-800">{slice.value} ({slice.percent}%)</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
