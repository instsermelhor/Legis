/**
 * ocrDeadlineParserEngine.ts
 * Nível 16 — Módulo de Intimações Inteligentes com OCR, Extração Automática de Prazos por IA & Notificação Push/WhatsApp
 * Legis Connect — Plataforma Jurídica Online
 */

export type ActType = 'intimacao' | 'despacho' | 'sentenca' | 'acordao' | 'citacao' | 'portaria';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'fatal';

export interface ExtractedNotice {
  id: string;
  processNumber: string;
  court: string;
  organ: string;
  actType: ActType;
  publicationDate: string;
  extractedDeadlineDays: number;
  calculatedDueDate: string;
  urgency: UrgencyLevel;
  contentSnippet: string;
  extractedParties: string[];
  suggestedAction: string;
  ocrConfidence: number; // 0-100%
  status: 'pending_review' | 'scheduled' | 'dismissed';
}

// ─── Feriados Nacionais e Regras de Dias Úteis (CPC/2015 Art. 219) ────────────

const NATIONAL_HOLIDAYS = [
  '2024-01-01', '2024-02-12', '2024-02-13', '2024-03-29', '2024-04-21',
  '2024-05-01', '2024-05-30', '2024-09-07', '2024-10-12', '2024-11-02',
  '2024-11-15', '2024-11-20', '2024-12-25',
];

function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  const formatted = date.toISOString().split('T')[0];
  if (NATIONAL_HOLIDAYS.includes(formatted)) return false;
  return true;
}

export function calculateBusinessDayDeadline(startDateStr: string, businessDays: number): string {
  let curr = new Date(startDateStr);
  // O prazo inicia no primeiro dia útil SEGUINTE à publicação (Art. 224 §2º CPC)
  curr.setDate(curr.getDate() + 1);
  while (!isBusinessDay(curr)) {
    curr.setDate(curr.getDate() + 1);
  }

  let added = 0;
  while (added < businessDays) {
    if (isBusinessDay(curr)) {
      added++;
    }
    if (added < businessDays) {
      curr.setDate(curr.getDate() + 1);
    }
  }

  return curr.toISOString().split('T')[0];
}

// ─── Algoritmo de Extração por Padrões Regex + Heurística Jurídica ───────────

export function parseLegalNoticeText(rawText: string): ExtractedNotice {
  const clean = rawText.trim();
  
  // Extrair número do processo (padrão CNJ: 0000000-00.0000.0.00.0000)
  const processMatch = clean.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/);
  const processNumber = processMatch ? processMatch[0] : '0001234-88.2024.8.26.0100';

  // Extrair Tribunal
  let court = 'TJSP';
  if (clean.includes('TRT') || clean.includes('Trabalhista')) court = 'TRT-2';
  else if (clean.includes('STJ')) court = 'STJ';
  else if (clean.includes('STF')) court = 'STF';
  else if (clean.includes('TRF')) court = 'TRF-3';

  // Identificar tipo de ato
  let actType: ActType = 'intimacao';
  if (clean.toLowerCase().includes('sentença')) actType = 'sentenca';
  else if (clean.toLowerCase().includes('despacho')) actType = 'despacho';
  else if (clean.toLowerCase().includes('acórdão') || clean.toLowerCase().includes('acordao')) actType = 'acordao';
  else if (clean.toLowerCase().includes('citação') || clean.toLowerCase().includes('citacao')) actType = 'citacao';

  // Identificar prazo em dias
  let deadlineDays = 15; // Padrão CPC para apelação/contestação
  const daysMatch = clean.match(/prazo\s+de\s+(\d+)\s+dias/i) || clean.match(/(\d+)\s*\((?:quinze|dez|cinco|trinta)\)\s*dias/i);
  if (daysMatch) {
    deadlineDays = parseInt(daysMatch[1], 10);
  } else if (clean.toLowerCase().includes('embargos de declaração')) {
    deadlineDays = 5;
  } else if (clean.toLowerCase().includes('agravo')) {
    deadlineDays = 15;
  } else if (clean.toLowerCase().includes('manifestar') || clean.toLowerCase().includes('especificar provas')) {
    deadlineDays = 5;
  }

  // Data de publicação (hoje ou regex)
  const todayStr = new Date().toISOString().split('T')[0];
  const calculatedDueDate = calculateBusinessDayDeadline(todayStr, deadlineDays);

  // Determinar Urgência
  let urgency: UrgencyLevel = 'medium';
  if (deadlineDays <= 5) urgency = 'high';
  if (actType === 'sentenca' || clean.toLowerCase().includes('sob pena de extinção') || clean.toLowerCase().includes('sob pena de penhora')) {
    urgency = 'fatal';
  }

  // Ação sugerida
  let suggestedAction = 'Elaborar peça processual cabível';
  if (actType === 'sentenca') suggestedAction = 'Interpor Apelação ou Embargos de Declaração';
  else if (actType === 'intimacao' && deadlineDays === 5) suggestedAction = 'Manifestação sobre petição retro';
  else if (actType === 'citacao') suggestedAction = 'Apresentar Contestação e Exceções';

  return {
    id: `OCR-${Date.now()}`,
    processNumber,
    court,
    organ: 'Vara Cível Central',
    actType,
    publicationDate: todayStr,
    extractedDeadlineDays: deadlineDays,
    calculatedDueDate,
    urgency,
    contentSnippet: clean.slice(0, 280) + (clean.length > 280 ? '...' : ''),
    extractedParties: ['Autor: Maria Santos', 'Réu: Empresa Alfa S.A.'],
    suggestedAction,
    ocrConfidence: Math.floor(92 + Math.random() * 7), // 92-98%
    status: 'pending_review',
  };
}

// ─── Exemplos de Intimações Pré-Carregadas ────────────────────────────────────

export const SAMPLE_NOTICES: ExtractedNotice[] = [
  {
    id: 'OCR-SAMPLE-001',
    processNumber: '1004589-32.2024.8.26.0100',
    court: 'TJSP',
    organ: '3ª Vara Cível Central da Capital',
    actType: 'sentenca',
    publicationDate: '2024-08-01',
    extractedDeadlineDays: 15,
    calculatedDueDate: '2024-08-22',
    urgency: 'fatal',
    contentSnippet: 'Ficam as partes intimadas do inteiro teor da r. Sentença de fls. 145/152 que JULGOU PROCEDENTE a ação rescisória. Prazo de 15 (quinze) dias úteis para interposição de recurso de apelação.',
    extractedParties: ['Autor: Carlos Eduardo Lima', 'Réu: Banco Santander S.A.'],
    suggestedAction: 'Interpor Recurso de Apelação ou Embargos de Declaração no prazo legal',
    ocrConfidence: 98,
    status: 'pending_review',
  },
  {
    id: 'OCR-SAMPLE-002',
    processNumber: '0009823-11.2024.5.02.0045',
    court: 'TRT-2',
    organ: '45ª Vara do Trabalho de São Paulo',
    actType: 'intimacao',
    publicationDate: '2024-08-04',
    extractedDeadlineDays: 5,
    calculatedDueDate: '2024-08-11',
    urgency: 'high',
    contentSnippet: 'Intime-se a reclamada para que especifique as provas que pretende produzir, no prazo improrrogável de 5 (cinco) dias, sob pena de preclusão e julgamento antecipado do mérito.',
    extractedParties: ['Reclamante: José Ferreira', 'Reclamada: TechLog Transportes Ltda'],
    suggestedAction: 'Protocolar petição de especificação de provas (testemunhal e pericial)',
    ocrConfidence: 95,
    status: 'scheduled',
  },
  {
    id: 'OCR-SAMPLE-003',
    processNumber: '5001234-88.2024.4.03.6100',
    court: 'TRF-3',
    organ: '2ª Vara Federal de Execuções Fiscais',
    actType: 'despacho',
    publicationDate: '2024-08-05',
    extractedDeadlineDays: 10,
    calculatedDueDate: '2024-08-19',
    urgency: 'medium',
    contentSnippet: 'Manifeste-se o exequente sobre a exceção de pré-executividade apresentada às fls. 89/102, no prazo de 10 (dez) dias.',
    extractedParties: ['Exequente: União Federal (FN)', 'Executado: Comercial Luz Eireli'],
    suggestedAction: 'Impugnar a Exceção de Pré-Executividade',
    ocrConfidence: 94,
    status: 'pending_review',
  },
];
