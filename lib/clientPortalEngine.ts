/**
 * lib/clientPortalEngine.ts
 * Nível 14 — Portal do Cliente & Sala Virtual de Atendimento Criptografada com Tradutor Jurídico IA
 * Legis Connect — Plataforma Jurídica Online
 */

export type CasePhase =
  | 'distribuicao'
  | 'citacao_reu'
  | 'conciliacao'
  | 'instrucao'
  | 'sentenca'
  | 'recurso'
  | 'execucao_recebimento';

export interface ClientCaseTimeline {
  id: string;
  processNumber: string;
  title: string;
  advogadoNome: string;
  advogadoOab: string;
  advogadoAvatar: string;
  currentPhase: CasePhase;
  progressPct: number;
  explicacaoLeiga: string;
  ultimaAtualizacaoData: string;
  valorProvavelRecebimentoBrl: number;
}

export interface ClientInvoice {
  id: string;
  title: string;
  valueBrl: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  pixCode: string;
  paidAt?: string;
}

export interface VirtualMeeting {
  id: string;
  title: string;
  dateStr: string;
  timeStr: string;
  advogadoNome: string;
  meetingUrl: string;
  isEncryptedE2e: boolean;
  status: 'scheduled' | 'live' | 'finished';
}

export const MOCK_CLIENT_CASE: ClientCaseTimeline = {
  id: 'cas_client_1',
  processNumber: '1048291-33.2025.8.26.0100',
  title: 'Ação de Indenização por Descumprimento Contratual e Danos Morais',
  advogadoNome: 'Dra. Mariana Costa e Silva',
  advogadoOab: 'OAB/SP 412.980',
  advogadoAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  currentPhase: 'instrucao',
  progressPct: 65,
  explicacaoLeiga: 'Seu processo já passou da fase inicial de defesa e agora o juiz marcou a fase de provas (audiência). O juiz ouvirá as testemunhas e colherá o seu depoimento para dar a decisão final (Sentença).',
  ultimaAtualizacaoData: '2026-08-05',
  valorProvavelRecebimentoBrl: 125000.00,
};

export const MOCK_CLIENT_INVOICES: ClientInvoice[] = [
  {
    id: 'inv_101',
    title: 'Honorários Iniciais - Entrada da Ação Indenizatória',
    valueBrl: 2500.00,
    dueDate: '2026-07-15',
    status: 'paid',
    pixCode: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-42661417400052040000530398654072500.005802BR5913LEGIS CONNECT6009SAO PAULO62070503***6304E2CA',
    paidAt: '2026-07-14T14:30:00Z',
  },
  {
    id: 'inv_102',
    title: 'Parcela 2/3 - Acompanhamento da Fase de Instrução',
    valueBrl: 1500.00,
    dueDate: '2026-08-15',
    status: 'pending',
    pixCode: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-42661417400052040000530398654071500.005802BR5913LEGIS CONNECT6009SAO PAULO62070503***6304A18F',
  },
];

export const MOCK_CLIENT_MEETINGS: VirtualMeeting[] = [
  {
    id: 'meet_1',
    title: 'Alinhamento Pré-Audiência de Instrução',
    dateStr: '2026-08-12',
    timeStr: '15:00',
    advogadoNome: 'Dra. Mariana Costa e Silva',
    meetingUrl: 'https://legisconnect.com.br/meet/room-encrypted-e2e-84920',
    isEncryptedE2e: true,
    status: 'scheduled',
  },
];

export function formatPhaseStepInfo(phase: CasePhase): { label: string; stepNumber: number; description: string } {
  switch (phase) {
    case 'distribuicao':
      return { label: '1. Petição Inicial', stepNumber: 1, description: 'Sua ação foi protocolada e entregue no tribunal.' };
    case 'citacao_reu':
      return { label: '2. Citação do Réu', stepNumber: 2, description: 'O réu é notificado oficialmente pela Justiça.' };
    case 'conciliacao':
      return { label: '3. Tentativa de Acordo', stepNumber: 3, description: 'Audiência para tentar um acordo amigável.' };
    case 'instrucao':
      return { label: '4. Fase de Provas (Atual)', stepNumber: 4, description: 'Apresentação de provas e depoimento de testemunhas.' };
    case 'sentenca':
      return { label: '5. Decisão do Juiz (Sentença)', stepNumber: 5, description: 'O juiz profere a decisão final da causa.' };
    case 'recurso':
      return { label: '6. Análise de Recurso', stepNumber: 6, description: 'Análise pelos Desembargadores do Tribunal.' };
    case 'execucao_recebimento':
      return { label: '7. Recebimento dos Valores', stepNumber: 7, description: 'Liberação do pagamento da indenização ao cliente.' };
  }
}
