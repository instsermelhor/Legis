import React, { useState, useRef } from 'react';
import { MOCK_REVENUE_DATA, MOCK_KPIS } from './adminMockKpis';
import type { Lawyer } from '../../../types';
import { mockClients, mockInterns, mockSecretaries } from '../../../services/mockDataService';

// ─── Types ────────────────────────────────────────────────────────────────────
type ExportFormat = 'pdf' | 'csv' | 'xlsx';

interface ExportDropdownProps {
  lawyers: Lawyer[];
}

// ─── Utility: format currency ─────────────────────────────────────────────────
const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`;

// ─── PDF Export ───────────────────────────────────────────────────────────────
async function exportToPDF(): Promise<void> {
  // Dynamic import so bundle splitting works — only loaded when needed
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // ── Cover / Header ─────────────────────────────────────────────────────────
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Legis Connect', 14, 18);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Executivo — Painel Administrativo', 14, 27);
  doc.setFontSize(9);
  doc.text(`Gerado em: ${dateStr} às ${timeStr}`, 14, 35);

  // ── KPI Summary ────────────────────────────────────────────────────────────
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Indicadores-Chave de Performance (KPIs)', 14, 52);

  autoTable(doc, {
    startY: 57,
    head: [['Indicador', 'Valor Atual', 'Mês Anterior', 'Variação']],
    body: MOCK_KPIS.map((k) => {
      const diff = ((k.rawValue - k.prevValue) / k.prevValue * 100).toFixed(1);
      const arrow = parseFloat(diff) >= 0 ? '↑' : '↓';
      return [k.label, k.value, '—', `${arrow} ${Math.abs(parseFloat(diff))}%`];
    }),
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [31, 41, 55] },
    alternateRowStyles: { fillColor: [249, 246, 255] },
    margin: { left: 14, right: 14 },
  });

  // ── Revenue Table ──────────────────────────────────────────────────────────
  const afterKpi = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Receita vs. Custos (Últimos 12 Meses)', 14, afterKpi);

  autoTable(doc, {
    startY: afterKpi + 5,
    head: [['Mês', 'Receita', 'Custos Infra', 'Lucro Bruto']],
    body: MOCK_REVENUE_DATA.map((d) => [
      d.month, fmt(d.receita), fmt(d.custos), fmt(d.lucro),
    ]),
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    margin: { left: 14, right: 14 },
  });

  // ── Footer ─────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Legis Connect — Documento Confidencial | Página ${i}/${pageCount}`,
      14, 290,
    );
  }

  doc.save(`relatorio_executivo_legis_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}.pdf`);
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
async function exportToCSV(): Promise<void> {
  const { unparse } = await import('papaparse');

  const kpiRows = MOCK_KPIS.map((k) => ({
    indicador: k.label,
    valor_atual: k.value,
    descricao: k.description ?? '',
  }));

  const revenueRows = MOCK_REVENUE_DATA.map((d) => ({
    mes: d.month,
    receita_brl: d.receita,
    custos_brl: d.custos,
    lucro_brl: d.lucro,
  }));

  const csvContent = `INDICADORES KPI\n${unparse(kpiRows)}\n\nRECEITA MENSAL\n${unparse(revenueRows)}`;
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dados_analytics_legis_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── XLSX Export ──────────────────────────────────────────────────────────────
async function exportToXLSX(lawyers: Lawyer[]): Promise<void> {
  const XLSX = await import('xlsx');

  const wb = XLSX.utils.book_new();

  // Aba 1: KPIs
  const kpiSheet = XLSX.utils.json_to_sheet(
    MOCK_KPIS.map((k) => ({
      'Indicador': k.label,
      'Valor Atual': k.value,
      'Descrição': k.description ?? '',
    }))
  );
  XLSX.utils.book_append_sheet(wb, kpiSheet, 'KPIs');

  // Aba 2: Receita Mensal
  const revenueSheet = XLSX.utils.json_to_sheet(
    MOCK_REVENUE_DATA.map((d) => ({
      'Mês': d.month,
      'Receita (R$)': d.receita,
      'Custos Infra (R$)': d.custos,
      'Lucro Bruto (R$)': d.lucro,
    }))
  );
  XLSX.utils.book_append_sheet(wb, revenueSheet, 'Receita Mensal');

  // Aba 3: Usuários — Advogados
  const lawyersSheet = XLSX.utils.json_to_sheet(
    lawyers.map((l) => ({
      'Nome': l.name,
      'OAB': l.oab,
      'Estado': l.location.state,
      'Status': l.status,
      'Receita/Mês (R$)': l.monthlyRevenue ?? 0,
      'Pendente (R$)': l.pendingPayments ?? 0,
    }))
  );
  XLSX.utils.book_append_sheet(wb, lawyersSheet, 'Advogados');

  // Aba 4: Clientes
  const clients = JSON.parse(localStorage.getItem('legis_clients') || 'null') || mockClients;
  const clientsSheet = XLSX.utils.json_to_sheet(
    clients.map((c: any) => ({
      'Nome': c.name,
      'Estado': c.state,
      'Status': c.status,
      'Total Pago (R$)': c.totalPaid ?? 0,
      'Pendente (R$)': c.pendingAmount ?? 0,
    }))
  );
  XLSX.utils.book_append_sheet(wb, clientsSheet, 'Clientes');

  XLSX.writeFile(wb, `analytics_legis_${Date.now()}.xlsx`);
}

// ─── Export Dropdown Component ────────────────────────────────────────────────
export const ExportDropdown: React.FC<ExportDropdownProps> = ({ lawyers }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    setLoading(format);
    setOpen(false);
    try {
      if (format === 'pdf')  await exportToPDF();
      if (format === 'csv')  await exportToCSV();
      if (format === 'xlsx') await exportToXLSX(lawyers);
    } catch (err) {
      console.error('Export error:', err);
      alert('Erro ao exportar. Verifique o console.');
    } finally {
      setLoading(null);
    }
  };

  const OPTIONS = [
    { format: 'pdf'  as ExportFormat, label: 'Relatório Executivo (.PDF)', icon: '📄', desc: 'Documento formatado com KPIs e receita' },
    { format: 'csv'  as ExportFormat, label: 'Dados Brutos (.CSV)',          icon: '📊', desc: 'Planilha plana para análise custom' },
    { format: 'xlsx' as ExportFormat, label: 'Planilha Completa (.XLSX)',    icon: '🗂️', desc: '4 abas: KPIs, Receita, Advogados, Clientes' },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={!!loading}
        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60 disabled:cursor-wait"
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
        {loading ? 'Gerando...' : 'Exportar'}
        {!loading && (
          <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="p-3 border-b border-gray-100 dark:border-[#2A2545]">
            <p className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Exportar Dashboard
            </p>
          </div>
          {OPTIONS.map((opt) => (
            <button
              key={opt.format}
              onClick={() => handleExport(opt.format)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors text-left"
            >
              <span className="text-xl mt-0.5">{opt.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{opt.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
