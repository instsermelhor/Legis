/**
 * services/biExporterService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor de Exportação de Relatórios de BI, DRE Jurídico e Controladoria Financeira.
 * Suporta geração em PDF (jsPDF) e Excel (xlsx).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { BiMetricsResult } from '../lib/biAnalyticsEngine';

export function exportBiReportPdf(metrics: BiMetricsResult): void {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('Legis Connect — Relatório de Inteligência Financeira & BI', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28);
  doc.text(`Status LGPD & OAB: ${metrics.oabEthicsStatus} (Score: ${metrics.lgpdComplianceScore}%)`, 14, 34);

  // Quadro de KPIs Executivos
  autoTable(doc, {
    startY: 40,
    head: [['Indicador KPI', 'Valor Consolidado', 'Variação / Detalhe']],
    body: [
      ['Receita Bruta Total', `R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '▲ +18.4% este mês'],
      ['Processos Ativos', `${metrics.activeCasesCount} casos`, `Duração média: ${metrics.avgCaseDurationDays} dias`],
      ['Taxa de Conversão', `${metrics.conversionRate}%`, 'Consultas → Contratos'],
      ['Score de Compliance LGPD', `${metrics.lgpdComplianceScore}%`, 'Certificado Ativo'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [40, 36, 69] },
  });

  // Tabela de Faturamento por Especialidade (DRE Jurídico)
  const currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 90;
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('DRE Jurídico — Faturamento por Área do Direito', 14, currentY);

  const specialtyRows = metrics.revenueBySpecialty.map(item => [
    item.specialty,
    `R$ ${item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `${item.percentage}%`,
  ]);

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Especialidade / Área', 'Receita Gerada (R$)', 'Representatividade (%)']],
    body: specialtyRows,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
  });

  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Legis Connect © 2026 — Documento de Controladoria Confidencial — Página ${i} de ${pageCount}`, 14, 285);
  }

  doc.save(`legis_connect_relatorio_bi_${Date.now()}.pdf`);
}

export function exportBiReportExcel(metrics: BiMetricsResult): void {
  const kpiData = [
    { Indicador: 'Receita Bruta Total', Valor: metrics.totalRevenue, Unidade: 'BRL' },
    { Indicador: 'Processos Ativos', Valor: metrics.activeCasesCount, Unidade: 'Casos' },
    { Indicador: 'Taxa de Conversão', Valor: metrics.conversionRate, Unidade: 'Percentual' },
    { Indicador: 'Score LGPD', Valor: metrics.lgpdComplianceScore, Unidade: 'Percentual' },
  ];

  const specialtyData = metrics.revenueBySpecialty.map(item => ({
    Especialidade: item.specialty,
    Receita: item.revenue,
    Percentual: item.percentage,
  }));

  const wb = XLSX.utils.book_new();

  const wsKpis = XLSX.utils.json_to_sheet(kpiData);
  XLSX.utils.book_append_sheet(wb, wsKpis, 'Indicadores KPIs');

  const wsSpecialty = XLSX.utils.json_to_sheet(specialtyData);
  XLSX.utils.book_append_sheet(wb, wsSpecialty, 'DRE por Especialidade');

  XLSX.writeFile(wb, `legis_connect_bi_financial_${Date.now()}.xlsx`);
}
