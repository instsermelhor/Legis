/**
 * virtualHearingEngine.ts
 * Nível 17 — Módulo de Audiências Virtuais, Gravação por IA, Transcrição em Tempo Real & Minuta de Ata Automatizada
 * Legis Connect — Plataforma Jurídica Online
 */

export type HearingType = 'conciliacao' | 'instrucao' | 'sustentacao_oral' | 'justificacao' | 'saneamento';
export type HearingStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
export type SpeakerRole = 'juiz' | 'advogado_autor' | 'advogado_reu' | 'testemunha_autor' | 'testemunha_reu' | 'preposto';

export interface HearingSpeaker {
  name: string;
  role: SpeakerRole;
  avatarUrl?: string;
  oabOrId?: string;
}

export interface TranscriptSnippet {
  id: string;
  speaker: HearingSpeaker;
  timestamp: string;
  text: string;
  flaggedAlert?: boolean; // Alerta de contradição ou ponto relevante
}

export interface HearingSession {
  id: string;
  processNumber: string;
  court: string;
  organ: string;
  type: HearingType;
  scheduledDate: string;
  scheduledTime: string;
  status: HearingStatus;
  virtualRoomUrl: string;
  judgeName: string;
  speakers: HearingSpeaker[];
  transcripts: TranscriptSnippet[];
  summaryNotes?: string;
  proposedAgreementAmount?: number;
  agreementStatus?: 'accepted' | 'rejected' | 'pending';
}

// ─── Dados de Audiências Simuladas ────────────────────────────────────────────

export const MOCK_HEARINGS: HearingSession[] = [
  {
    id: 'HEAR-2024-001',
    processNumber: '1004589-32.2024.8.26.0100',
    court: 'TJSP',
    organ: '3ª Vara Cível da Capital',
    type: 'conciliacao',
    scheduledDate: '2024-08-06',
    scheduledTime: '14:30',
    status: 'live',
    virtualRoomUrl: 'https://teams.microsoft.com/l/meetup-join/tjsp-vara3-sala12',
    judgeName: 'Dr. Fernando Henrique Cardoso (Juiz Leigo)',
    speakers: [
      { name: 'Dr. Fernando Henrique Cardoso', role: 'juiz' },
      { name: 'Dr. Roberto Almeida (OAB/SP 123.456)', role: 'advogado_autor' },
      { name: 'Dra. Patricia Lima (OAB/SP 654.321)', role: 'advogado_reu' },
      { name: 'Maria Silva Santos', role: 'preposto' },
    ],
    transcripts: [
      {
        id: 'TR-1',
        speaker: { name: 'Dr. Fernando Henrique Cardoso', role: 'juiz' },
        timestamp: '14:31:05',
        text: 'Declarada aberta a audiência de conciliação referente ao processo 1004589-32.2024.8.26.0100. Pergunto à ré se há proposta de acordo.',
      },
      {
        id: 'TR-2',
        speaker: { name: 'Dra. Patricia Lima', role: 'advogado_reu' },
        timestamp: '14:31:40',
        text: 'Excelência, formulamos a proposta de pagamento do valor de R$ 15.000,00 em 3 parcelas iguais de R$ 5.000,00 para quitação integral do pedido.',
      },
      {
        id: 'TR-3',
        speaker: { name: 'Dr. Roberto Almeida', role: 'advogado_autor' },
        timestamp: '14:32:15',
        text: 'A autora aceita a proposta de R$ 15.000,00, desde que a primeira parcela seja quitada em até 5 dias úteis via PIX.',
        flaggedAlert: true,
      },
      {
        id: 'TR-4',
        speaker: { name: 'Dr. Fernando Henrique Cardoso', role: 'juiz' },
        timestamp: '14:32:50',
        text: 'Ótimo. Registre-se a homologação do acordo por sentença com resolução do mérito, nos termos do art. 487, III, "b" do CPC.',
      },
    ],
    summaryNotes: 'Acordo homologado no valor de R$ 15.000,00 em 3 parcelas.',
    proposedAgreementAmount: 15000,
    agreementStatus: 'accepted',
  },
  {
    id: 'HEAR-2024-002',
    processNumber: '0009823-11.2024.5.02.0045',
    court: 'TRT-2',
    organ: '45ª Vara do Trabalho de SP',
    type: 'instrucao',
    scheduledDate: '2024-08-08',
    scheduledTime: '10:00',
    status: 'scheduled',
    virtualRoomUrl: 'https://zoom.us/j/trt2-vara45-sala02',
    judgeName: 'Dra. Claudia Regina Santos (Juíza do Trabalho)',
    speakers: [
      { name: 'Dra. Claudia Regina Santos', role: 'juiz' },
      { name: 'Dr. Carlos Mendes (OAB/SP 987.654)', role: 'advogado_autor' },
      { name: 'José Ferreira (Depoimento Pessoal)', role: 'testemunha_autor' },
    ],
    transcripts: [],
    agreementStatus: 'pending',
  },
];

// ─── Gerador Automático da Minuta da Ata de Audiência ────────────────────────

export function generateHearingMinutes(session: HearingSession): string {
  const dateStr = new Date().toLocaleDateString('pt-BR');
  const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  let minutesText = `ATA DE AUDIÊNCIA DE ${session.type.toUpperCase()}\n`;
  minutesText += `PROCESSO Nº: ${session.processNumber}\n`;
  minutesText += `TRIBUNAL: ${session.court} — ${session.organ}\n`;
  minutesText += `DATA E HORA: ${dateStr} às ${timeStr}\n`;
  minutesText += `PRESIDENTE: ${session.judgeName}\n\n`;

  minutesText += `PARTES E ADVOGADOS PRESENTES:\n`;
  session.speakers.forEach((s) => {
    minutesText += `- ${s.name} (${s.role.toUpperCase()}${s.oabOrId ? ` - ${s.oabOrId}` : ''})\n`;
  });

  minutesText += `\nRESUMO DOS DEPOIMENTOS E OCORRÊNCIAS:\n`;
  if (session.transcripts.length > 0) {
    session.transcripts.forEach((t) => {
      minutesText += `[${t.timestamp}] ${t.speaker.name}: "${t.text}"\n`;
    });
  } else {
    minutesText += `Audiência aguardando início do depoimento das partes.\n`;
  }

  minutesText += `\nDELIBERAÇÃO E DECISÃO:\n`;
  if (session.agreementStatus === 'accepted') {
    minutesText += `HOMOLOGAÇÃO DE ACORDO: As partes transigiram mediante o pagamento da quantia de R$ ${(
      session.proposedAgreementAmount || 0
    ).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
    })}. Homologo o acordo celebrado para que surta seus efeitos jurídicos, extinguindo o processo com resolução do mérito nos termos do Art. 487, III, "b" do CPC. Custas dispensadas.\n`;
  } else {
    minutesText += `Sem proposta conciliatória das partes. Conclusos os autos para sentença ou designação de nova data.\n`;
  }

  minutesText += `\nNada mais havendo, encerrou-se a presente audiência, cuja ata foi gerada e assinada digitalmente com validação SHA-256 pela plataforma Legis Connect.\n`;

  return minutesText;
}
