/**
 * lib/djenProcessCrawlerEngine.ts
 * Nível 12 — Monitoramento de Diários Oficiais (DJEN/DataJud) & Calculadora de Prazos CPC/2015
 * Legis Connect — Plataforma Jurídica Online
 */

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PublicationItem {
  id: string;
  processNumber: string;
  tribunal: string;
  diarioName: string;
  dataPublicacao: string;
  dataDisponibilizacao: string;
  oabAdvogado: string;
  nomeAdvogado: string;
  partes: string;
  conteudoCompleto: string;
  resumoIa: string;
  tipoAcaoRecomendada: string;
  prazoDiasUteis: number;
  urgency: UrgencyLevel;
  lida: boolean;
}

export interface TrackedProcess {
  id: string;
  processNumber: string;
  tribunal: string;
  comarcaVara: string;
  clienteNome: string;
  classeProcessual: string;
  assuntoPrincipal: string;
  valorCausaBrl: number;
  dataDistribuicao: string;
  status: 'ativo' | 'suspenso' | 'arquivado' | 'transito_julgado';
  ultimaMovimentacao: string;
  dataUltimaMovimentacao: string;
  proximoPrazoData?: string;
  proximoPrazoDescricao?: string;
}

export interface DeadlineCalculationResult {
  dataDisponibilizacao: Date;
  dataPublicacao: Date;
  dataInicioContagem: Date;
  dataVencimento: Date;
  diasUteisContados: number;
  diasFimDeSemana: number;
  feriadosIgnorados: string[];
  isPrazoFatal: boolean;
}

// Feriados Nacionais e Suspensão CPC Art. 220 (Recesso 20/dez a 20/jan)
export const HOLIDAYS_BR_2026: { data: string; nome: string }[] = [
  { data: '2026-01-01', nome: 'Confraternização Universal' },
  { data: '2026-02-16', nome: 'Carnaval' },
  { data: '2026-02-17', nome: 'Carnaval' },
  { data: '2026-04-03', nome: 'Sexta-feira Santa' },
  { data: '2026-04-21', nome: 'Tiradentes' },
  { data: '2026-05-01', nome: 'Dia do Trabalho' },
  { data: '2026-06-04', nome: 'Corpus Christi' },
  { data: '2026-09-07', nome: 'Independência do Brasil' },
  { data: '2026-10-12', nome: 'Nossa Senhora Aparecida' },
  { data: '2026-11-02', nome: 'Finados' },
  { data: '2026-11-15', nome: 'Proclamação da República' },
  { data: '2026-11-20', nome: 'Dia da Consciência Negra' },
  { data: '2026-12-25', nome: 'Natal' },
];

// Mock de Intimações do DJEN (Diário de Justiça Eletrônico Nacional)
export const MOCK_PUBLICATIONS: PublicationItem[] = [
  {
    id: 'pub_101',
    processNumber: '1048291-33.2025.8.26.0100',
    tribunal: 'TJSP - Tribunal de Justiça de SP',
    diarioName: 'DJE SP - Caderno 3 - Judicial - 1ª Instância - Capital',
    dataDisponibilizacao: '2026-08-04',
    dataPublicacao: '2026-08-05',
    oabAdvogado: 'OAB/SP 412.980',
    nomeAdvogado: 'Dra. Mariana Costa e Silva',
    partes: 'Banco Horizonte S/A vs. Metalúrgica Paulista Ltda.',
    conteudoCompleto: 'Fica o patrono do requerido intimado para apresentar CONTESTAÇÃO no prazo legal de 15 (quinze) dias úteis, sob pena de revelia e presunção de veracidade dos fatos alegados na exordial (Art. 335 do CPC).',
    resumoIa: 'Intimação para Apresentação de Contestação no prazo de 15 dias úteis. Risco de revelia.',
    tipoAcaoRecomendada: 'Elaboração de Contestação + Pedido de Provas',
    prazoDiasUteis: 15,
    urgency: 'critical',
    lida: false,
  },
  {
    id: 'pub_102',
    processNumber: '2194810-88.2025.8.26.0000',
    tribunal: 'TJSP - 12ª Câmara de Direito Privado',
    diarioName: 'DJE SP - Caderno 2 - Judicial - 2ª Instância',
    dataDisponibilizacao: '2026-08-05',
    dataPublicacao: '2026-08-06',
    oabAdvogado: 'OAB/SP 412.980',
    nomeAdvogado: 'Dra. Mariana Costa e Silva',
    partes: 'Construtora Alfa S/A vs. Condomínio Solar dos Pássaros',
    conteudoCompleto: 'Vistos. Concedo o efeito suspensivo ativo pleiteado no Agravo de Instrumento. Intime-se a parte agravada para responder no prazo de 15 (quinze) dias (Art. 1.019, II, do CPC).',
    resumoIa: 'Tutela de urgência DEFERIDA em favor do cliente! Agravado intimado para contraminuta em 15 dias.',
    tipoAcaoRecomendada: 'Notificar cliente sobre liminar deferida + Preparar execução provisória',
    prazoDiasUteis: 15,
    urgency: 'high',
    lida: false,
  },
  {
    id: 'pub_103',
    processNumber: '0019284-77.2024.5.02.0004',
    tribunal: 'TRT-2 (São Paulo - SP)',
    diarioName: 'DEJT - Diário Eletrônico da Justiça do Trabalho',
    dataDisponibilizacao: '2026-08-05',
    dataPublicacao: '2026-08-06',
    oabAdvogado: 'OAB/SP 412.980',
    nomeAdvogado: 'Dra. Mariana Costa e Silva',
    partes: 'João Pedro Alves vs. Transportadora Rápido Solução Ltda.',
    conteudoCompleto: 'Ciência às partes da designação de AUDIÊNCIA DE INSTRUÇÃO TELEPRESENCIAL para o dia 24/08/2026 às 14:00h. Rol de testemunhas deve ser apresentado em 5 dias sob pena de preclusão.',
    resumoIa: 'Designação de Audiência de Instrução Telepresencial. Apresentar rol de testemunhas em 5 dias.',
    tipoAcaoRecomendada: 'Cadastrar testemunhas no portal + Enviar link Zoom ao cliente',
    prazoDiasUteis: 5,
    urgency: 'high',
    lida: true,
  },
  {
    id: 'pub_104',
    processNumber: 'REsp 1.948.201/DF',
    tribunal: 'STJ - Superior Tribunal de Justiça',
    diarioName: 'DJE STJ - Coordenadoria da 3ª Turma',
    dataDisponibilizacao: '2026-08-03',
    dataPublicacao: '2026-08-04',
    oabAdvogado: 'OAB/SP 412.980',
    nomeAdvogado: 'Dra. Mariana Costa e Silva',
    partes: 'Fazenda Nacional vs. Indústrias Reunidas S/A',
    conteudoCompleto: 'Por unanimidade, a Terceira Turma deu provimento ao Recurso Especial interposto, nos termos do voto do Ministro Relator. Acórdão publicado.',
    resumoIa: 'Acórdão STJ publicado. Recurso Especial PROVIDO por unanimidade.',
    tipoAcaoRecomendada: 'Análise de Embargos de Declaração no prazo de 5 dias úteis',
    prazoDiasUteis: 5,
    urgency: 'medium',
    lida: true,
  },
];

// Mock de Processos Acompanhados no DataJud (CNJ)
export const MOCK_TRACKED_PROCESSES: TrackedProcess[] = [
  {
    id: 'prc_1',
    processNumber: '1048291-33.2025.8.26.0100',
    tribunal: 'TJSP',
    comarcaVara: '4ª Vara Cível - Foro Central Cível SP',
    clienteNome: 'Metalúrgica Paulista Ltda.',
    classeProcessual: 'Procedimento Comum Cível',
    assuntoPrincipal: 'Inadimplemento de Contrato / Cobrança',
    valorCausaBrl: 450000.00,
    dataDistribuicao: '2025-11-14',
    status: 'ativo',
    ultimaMovimentacao: 'Publicação de Intimação para Contestação no DJE',
    dataUltimaMovimentacao: '2026-08-05',
    proximoPrazoData: '2026-08-26',
    proximoPrazoDescricao: 'Apresentação de Contestação (15 dias úteis)',
  },
  {
    id: 'prc_2',
    processNumber: '2194810-88.2025.8.26.0000',
    tribunal: 'TJSP',
    comarcaVara: '12ª Câmara de Direito Privado',
    clienteNome: 'Construtora Alfa S/A',
    classeProcessual: 'Agravo de Instrumento',
    assuntoPrincipal: 'Tutela de Urgência / Efeito Suspensivo',
    valorCausaBrl: 1200000.00,
    dataDistribuicao: '2026-01-20',
    status: 'ativo',
    ultimaMovimentacao: 'Decisão Monocrática: Efeito Suspensivo Ativo Deferido',
    dataUltimaMovimentacao: '2026-08-06',
    proximoPrazoData: '2026-08-27',
    proximoPrazoDescricao: 'Contraminuta ao Agravo (15 dias úteis)',
  },
  {
    id: 'prc_3',
    processNumber: '0019284-77.2024.5.02.0004',
    tribunal: 'TRT-2',
    comarcaVara: '4ª Vara do Trabalho de São Paulo',
    clienteNome: 'João Pedro Alves',
    classeProcessual: 'Reclamação Trabalhista',
    assuntoPrincipal: 'Horas Extraordinárias e Adicional de Periculosidade',
    valorCausaBrl: 85000.00,
    dataDistribuicao: '2024-06-10',
    status: 'ativo',
    ultimaMovimentacao: 'Designação de Audiência de Instrução Telepresencial',
    dataUltimaMovimentacao: '2026-08-06',
    proximoPrazoData: '2026-08-13',
    proximoPrazoDescricao: 'Apresentação de Rol de Testemunhas (5 dias úteis)',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Calculadora de Prazos Processuais do CPC/2015 (Art. 219 e 224)
// ─────────────────────────────────────────────────────────────────────────────

export function calculateCpcDeadline(
  dataDisponibilizacaoStr: string,
  diasUteisAlvo: number
): DeadlineCalculationResult {
  const dispDate = new Date(`${dataDisponibilizacaoStr}T12:00:00Z`);

  // Art. 224, § 2º: Considera-se publicada a intimação no primeiro dia útil seguinte à disponibilização
  const pubDate = new Date(dispDate);
  pubDate.setDate(pubDate.getDate() + 1);
  while (isWeekend(pubDate) || isHoliday(pubDate)) {
    pubDate.setDate(pubDate.getDate() + 1);
  }

  // Art. 224, caput: Começa a correr no primeiro dia útil seguinte à publicação
  const startDate = new Date(pubDate);
  startDate.setDate(startDate.getDate() + 1);
  while (isWeekend(startDate) || isHoliday(startDate)) {
    startDate.setDate(startDate.getDate() + 1);
  }

  // Contagem exclusiva de dias úteis (Art. 219 CPC)
  let count = 0;
  let weekendDays = 0;
  const holidaysIgnored: string[] = [];
  const curr = new Date(startDate);

  while (count < diasUteisAlvo) {
    if (isWeekend(curr)) {
      weekendDays++;
    } else {
      const holiday = getHolidayName(curr);
      if (holiday) {
        holidaysIgnored.push(`${formatDateShort(curr)} (${holiday})`);
      } else {
        count++;
        if (count === diasUteisAlvo) break;
      }
    }
    curr.setDate(curr.getDate() + 1);
  }

  const isFatal = diasUteisAlvo <= 5;

  return {
    dataDisponibilizacao: dispDate,
    dataPublicacao: pubDate,
    dataInicioContagem: startDate,
    dataVencimento: curr,
    diasUteisContados: count,
    diasFimDeSemana: weekendDays,
    feriadosIgnorados: holidaysIgnored,
    isPrazoFatal: isFatal,
  };
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Domingo, 6 = Sábado
}

function isHoliday(date: Date): boolean {
  return getHolidayName(date) !== null;
}

function getHolidayName(date: Date): string | null {
  const isoDate = date.toISOString().slice(0, 10);
  const found = HOLIDAYS_BR_2026.find(h => h.data === isoDate);
  return found ? found.nome : null;
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function formatUrgencyBadge(urgency: UrgencyLevel): { label: string; badgeColor: string } {
  switch (urgency) {
    case 'critical':
      return { label: '🚨 URGENTE (Fatal)', badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' };
    case 'high':
      return { label: '⚡ ALTA URGÊNCIA', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
    case 'medium':
      return { label: '📅 Normal', badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
    case 'low':
      return { label: 'ℹ️ Informativo', badgeColor: 'bg-slate-700/30 text-slate-300 border-slate-600/30' };
  }
}
