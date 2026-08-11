/**
 * components/admin/BiDrillDownView.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Componente de Navegação Detalhada (Drill-Down / Drill-Through) de BI.
 * Permite filtrar e inspecionar transações financeiras e causas individuais.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';

export interface DrillDownItem {
  id: string;
  clientName: string;
  lawyerName: string;
  specialty: string;
  state: string;
  amount: number;
  date: string;
  status: 'Concluído' | 'Em Escrow' | 'Pendente';
}

const MOCK_DRILL_DOWN_DATA: DrillDownItem[] = [
  { id: 'TX-1001', clientName: 'Carlos Eduardo Silva', lawyerName: 'Dra. Maria Fernanda', specialty: 'Direito Trabalhista', state: 'SP', amount: 4500.00, date: '2026-08-10', status: 'Concluído' },
  { id: 'TX-1002', clientName: 'Mariana Santos Rocha', lawyerName: 'Dr. Roberto Alves', specialty: 'Direito Civil', state: 'RJ', amount: 2800.00, date: '2026-08-09', status: 'Em Escrow' },
  { id: 'TX-1003', clientName: 'TechCorp Brasil Ltda', lawyerName: 'Advocacia Pinheiro', specialty: 'Direito Empresarial', state: 'MG', amount: 15000.00, date: '2026-08-08', status: 'Concluído' },
  { id: 'TX-1004', clientName: 'Lucas Gabriel Lima', lawyerName: 'Dra. Juliana Costa', specialty: 'Direito Penal', state: 'SP', amount: 6200.00, date: '2026-08-07', status: 'Em Escrow' },
  { id: 'TX-1005', clientName: 'Fernanda Oliveira', lawyerName: 'Dr. Bruno Mendonça', specialty: 'Direito de Família', state: 'PR', amount: 1900.00, date: '2026-08-06', status: 'Concluído' },
];

export const BiDrillDownView: React.FC = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('TODAS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredData = MOCK_DRILL_DOWN_DATA.filter(item => {
    const matchesSpecialty = selectedSpecialty === 'TODAS' || item.specialty === selectedSpecialty;
    const matchesStatus = selectedStatus === 'TODOS' || item.status === selectedStatus;
    const matchesSearch = item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.lawyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecialty && matchesStatus && matchesSearch;
  });

  const totalFilteredRevenue = filteredData.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="space-y-4">
      {/* Control Bar & Filters */}
      <div className="p-4 bg-gray-50 dark:bg-[#151226] rounded-2xl border border-gray-200 dark:border-[#252040] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-gray-500 font-bold mb-1">Filtrar por Área:</label>
          <select
            value={selectedSpecialty}
            onChange={e => setSelectedSpecialty(e.target.value)}
            className="w-full p-2 bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-xl text-gray-800 dark:text-gray-200"
          >
            <option value="TODAS">Todas as Especialidades</option>
            <option value="Direito Trabalhista">Direito Trabalhista</option>
            <option value="Direito Civil">Direito Civil</option>
            <option value="Direito Empresarial">Direito Empresarial</option>
            <option value="Direito Penal">Direito Penal</option>
            <option value="Direito de Família">Direito de Família</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-500 font-bold mb-1">Status do Honorário:</label>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full p-2 bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-xl text-gray-800 dark:text-gray-200"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="Concluído">Concluído</option>
            <option value="Em Escrow">Em Escrow</option>
            <option value="Pendente">Pendente</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-500 font-bold mb-1">Busca por Nome ou ID:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full p-2 bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-xl text-gray-800 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs">
        <span className="font-bold text-emerald-800 dark:text-emerald-300">
          Resultados da Inspeção: {filteredData.length} registros encontrados
        </span>
        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
          Total Filtrado: R$ {totalFilteredRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Drill-Through Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-[#252040]">
        <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
          <thead className="bg-gray-100 dark:bg-[#201C38] text-gray-900 dark:text-white uppercase font-bold text-[10px]">
            <tr>
              <th className="p-3">ID Transação</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Advogado / Banca</th>
              <th className="p-3">Especialidade</th>
              <th className="p-3">UF</th>
              <th className="p-3">Valor (R$)</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#252040]">
            {filteredData.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#1C1836] transition-colors">
                <td className="p-3 font-mono font-bold text-primary dark:text-purple-400">{item.id}</td>
                <td className="p-3 font-semibold">{item.clientName}</td>
                <td className="p-3">{item.lawyerName}</td>
                <td className="p-3">{item.specialty}</td>
                <td className="p-3 font-bold">{item.state}</td>
                <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    item.status === 'Concluído' ? 'bg-emerald-500/10 text-emerald-600' :
                    item.status === 'Em Escrow' ? 'bg-amber-500/10 text-amber-600' : 'bg-gray-500/10 text-gray-600'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
