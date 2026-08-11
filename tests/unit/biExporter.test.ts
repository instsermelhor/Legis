/**
 * tests/unit/biExporter.test.ts
 * Suíte de Testes Unitários de Exportação de BI, DRE Jurídico e Autoatendimento LGPD
 */

import { getConsolidatedBiMetrics } from '../../lib/biAnalyticsEngine';
import { requestLgpdDataExport, submitLgpdDeletionRequest } from '../../services/lgpdRightsService';

export interface BiExporterTestResult {
  testName: string;
  category: 'BI_EXPORTER' | 'LGPD_SAR';
  passed: boolean;
  durationMs: number;
  error?: string;
}

export async function runBiExporterTests(): Promise<BiExporterTestResult[]> {
  const results: BiExporterTestResult[] = [];

  // Teste 1: Estrutura de Métricas de BI para Exportação
  try {
    const t0 = performance.now();
    const metrics = await getConsolidatedBiMetrics();

    const isValid = Boolean(
      metrics &&
      typeof metrics.totalRevenue === 'number' &&
      metrics.revenueBySpecialty.length > 0 &&
      metrics.lgpdComplianceScore > 0
    );

    results.push({
      testName: 'Consolidação de Métricas de BI & DRE por Especialidade',
      category: 'BI_EXPORTER',
      passed: isValid,
      durationMs: Math.round(performance.now() - t0),
    });
  } catch (err: any) {
    results.push({
      testName: 'Consolidação de Métricas de BI & DRE por Especialidade',
      category: 'BI_EXPORTER',
      passed: false,
      durationMs: 0,
      error: err?.message || String(err),
    });
  }

  // Teste 2: Atendimento a Solicitação SAR de Exportação LGPD
  try {
    const t0 = performance.now();
    const sarRecord = requestLgpdDataExport('titular.teste@legisconnect.com.br');

    const isValidSar = Boolean(
      sarRecord &&
      sarRecord.userEmail === 'titular.teste@legisconnect.com.br' &&
      sarRecord.status === 'COMPLETED'
    );

    results.push({
      testName: 'Geração de Relatório de Direitos do Titular LGPD (Art. 18)',
      category: 'LGPD_SAR',
      passed: isValidSar,
      durationMs: Math.round(performance.now() - t0),
    });
  } catch (err: any) {
    results.push({
      testName: 'Geração de Relatório de Direitos do Titular LGPD (Art. 18)',
      category: 'LGPD_SAR',
      passed: false,
      durationMs: 0,
      error: err?.message || String(err),
    });
  }

  return results;
}
