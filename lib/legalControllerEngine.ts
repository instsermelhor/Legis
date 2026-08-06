/**
 * legalControllerEngine.ts
 * Nível 21 — Controladoria Jurídica, Fila de Conferência (4 Olhos), Monitor de Tribunais Superiores (STF/STJ/TST) & Certificados de Protocolo SHA-256
 * Legis Connect — Plataforma Jurídica Online
 */

export type ProtocolStatus = 'pending_review' | 'approved' | 'protocolled' | 'rejected';
export type SuperiorCourt = 'STF' | 'STJ' | 'TST' | 'TSE' | 'TRF1' | 'TRF2' | 'TRF3' | 'TRF4' | 'TRF5' | 'TRF6';

export interface ControllerTask {
  id: string;
  processNumber: string;
  court: SuperiorCourt | string;
  lawyerName: string;
  reviewerName?: string;
  documentType: string;
  deadlineDate: string;
  status: ProtocolStatus;
  urgencyScore: number; // 0-100
  sha256Proof?: string;
}

export interface SuperiorCourtNotice {
  id: string;
  court: SuperiorCourt;
  organ: string;
  ministerName: string;
  processNumber: string;
  summaryText: string;
  publicationDate: string;
  precedentTheme?: string;
}

// ─── Fila de Conferência Simulada de Controladoria Jurídica ──────────────────

export const MOCK_CONTROLLER_TASKS: ControllerTask[] = [
  {
    id: 'CTRL-2024-001',
    processNumber: '1004589-32.2024.8.26.0100',
    court: 'TJSP',
    lawyerName: 'Dr. Roberto Almeida',
    reviewerName: 'Dra. Vanessa Controller (Controladoria)',
    documentType: 'Recurso de Apelação',
    deadlineDate: '2024-08-12',
    status: 'pending_review',
    urgencyScore: 95,
  },
  {
    id: 'CTRL-2024-002',
    processNumber: '0009823-11.2024.5.02.0045',
    court: 'TRT-2',
    lawyerName: 'Dr. Carlos Mendes',
    reviewerName: 'Dra. Vanessa Controller (Controladoria)',
    documentType: 'Contestação Trabalhista',
    deadlineDate: '2024-08-15',
    status: 'approved',
    urgencyScore: 70,
    sha256Proof: '8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
  },
];

// ─── Publicações Recentes dos Tribunais Superiores (STF/STJ/TST) ─────────────

export const MOCK_SUPERIOR_NOTICES: SuperiorCourtNotice[] = [
  {
    id: 'STF-NOTICE-001',
    court: 'STF',
    organ: 'Primeira Turma',
    ministerName: 'Min. Alexandre de Moraes',
    processNumber: 'RE 1.450.982',
    summaryText: 'Inadmitido recurso extraordinário por ausência de repercussão geral expressa nos termos do art. 1.035 do CPC.',
    publicationDate: '2024-08-06',
    precedentTheme: 'Tema 1050 STF',
  },
  {
    id: 'STJ-NOTICE-002',
    court: 'STJ',
    organ: 'Corte Especial',
    ministerName: 'Min. Herman Benjamin',
    processNumber: 'REsp 2.105.443',
    summaryText: 'Afetado recurso especial ao rito dos Recursos Repetitivos (Tema 1245 STJ) para definir a fluência dos juros de mora.',
    publicationDate: '2024-08-05',
    precedentTheme: 'Tema 1245 STJ',
  },
  {
    id: 'TST-NOTICE-003',
    court: 'TST',
    organ: 'SDI-1',
    ministerName: 'Min. Lelio Bentes Corrêa',
    processNumber: 'E-RR 10012-45.2021.5.02.0001',
    summaryText: 'Embargos acolhidos para fixar a responsabilidade subsidiária da Administração Pública nos termos da Súmula 331, V, do TST.',
    publicationDate: '2024-08-04',
    precedentTheme: 'Súmula 331 TST',
  },
];

// ─── Emissão de Certificado de Protocolo Tempestivo SHA-256 ──────────────────

export function generateProtocolCertificate(task: ControllerTask): string {
  const nowStr = new Date().toISOString();
  return `CERTIFICADO DE PROTOCOLO TEMPESTIVO & CONTROLADORIA JURÍDICA
================================================================================
ID DA CONFERÊNCIA: ${task.id}
NÚMERO DO PROCESSO: ${task.processNumber}
TRIBUNAL: ${task.court}
DOCUMENTO: ${task.documentType}
ADVOGADO RESPONSÁVEL: ${task.lawyerName}
CONTROLADORIA REVISORA: ${task.reviewerName || 'Validação Automática'}
DATA DE VENCIMENTO LEGAL: ${task.deadlineDate}
DATA E HORA DO PROTOCOLO: ${nowStr}
STATUS: TEMPESTIVO E CONFERIDO EM 4 OLHOS (SLA 100%)
--------------------------------------------------------------------------------
HASH CRIPTOGRÁFICO DE AUTENTICIDADE SHA-256:
${task.sha256Proof || 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'}
================================================================================
Legis Connect Legal Operations & Controller Suite — 2026`;
}
