/**
 * oralDefenseAiEngine.ts
 * Nível 23 — IA Generativa para Sustentação Oral, Roteiro Cronometrado & Teleprompter Inteligente
 * Legis Connect — Plataforma Jurídica Online
 */

export type CourtSessionType = 'STF_Plenario' | 'STJ_Turma' | 'TST_SDI' | 'TJ_Camara' | 'TRT_Turma';
export type DurationMinutes = 5 | 10 | 15;

export interface SpeechSection {
  title: string;
  suggestedDurationSeconds: number;
  scriptContent: string;
  emphasisNotes: string;
}

export interface OralDefenseScript {
  id: string;
  processNumber: string;
  court: CourtSessionType;
  lawyerName: string;
  targetMinister: string;
  totalDurationMinutes: DurationMinutes;
  sections: SpeechSection[];
  wordCount: number;
  wordsPerMinute: number;
  signatureHash: string;
}

// ─── Gerador de Roteiro Cronometrado de Sustentação Oral ─────────────────────

export function generateOralDefenseScript(params: {
  processNumber: string;
  court: CourtSessionType;
  lawyerName: string;
  targetMinister: string;
  durationMinutes: DurationMinutes;
  clientRole: 'autor' | 'réu' | 'recorrente' | 'recorrido';
  keyPrecedent: string;
  centralThesis: string;
}): OralDefenseScript {
  const { processNumber, court, lawyerName, targetMinister, durationMinutes, clientRole, keyPrecedent, centralThesis } = params;

  const totalSec = durationMinutes * 60;

  const sections: SpeechSection[] = [
    {
      title: '1. EXÓRDIO E Cumprimentos Regimentais',
      suggestedDurationSeconds: Math.round(totalSec * 0.1), // 10% do tempo
      scriptContent: `Excelentíssimo Senhor Presidente desta Egrégia Sessão de Julgamento, Eminente Relator ${targetMinister}, Ilustres Ministros/Desembargadores, Representante do Ministério Público e Colegas Advogados. Ocupo esta tribuna em defesa de ${clientRole.toUpperCase()} no processo nº ${processNumber}.`,
      emphasisNotes: 'Tom de voz firme, pausado e respeitoso. Cumprimentos sucintos para otimizar o tempo regimental.',
    },
    {
      title: '2. SÍNTESE DOS FATOS E PONTO NODAL',
      suggestedDurationSeconds: Math.round(totalSec * 0.25), // 25% do tempo
      scriptContent: `Diferente do que assentou o r. acórdão recorrido, a controvérsia posta nestes autos não exige o reexame de provas, mas a estrita valoração do direito em torno da tese central: "${centralThesis}".`,
      emphasisNotes: 'Enfatizar a matéria de direito puro para afastar os óbices das Súmulas 7 do STJ e 279 do STF.',
    },
    {
      title: '3. DEMONSTRAÇÃO DO PRECEDENTE VINCULANTE (Art. 927 CPC)',
      suggestedDurationSeconds: Math.round(totalSec * 0.45), // 45% do tempo
      scriptContent: `O entendimento adotado pelo acórdão a quo diverge frontalmente da orientação consolidada por esta Corte no ${keyPrecedent}. Conforme julgado por este Tribunal, o direito aplicável exige a reforma imediata do acórdão sob pena de insegurança jurídica.`,
      emphasisNotes: 'MOMENTO CHAVE DO DISCURSO: Fazer pausa estratégica ao citar a tese vinculante do precedente.',
    },
    {
      title: '4. CONCLUSAO E REQUERIMENTO FINAL',
      suggestedDurationSeconds: Math.round(totalSec * 0.2), // 20% do tempo
      scriptContent: `Diante de todo o exposto, confia-se em que esta Egrégia Turma/Câmara dará PROVIMENTO ao recurso para reformar o julgado, fazendo a mais lídima e costumeira JUSTIÇA!`,
      emphasisNotes: 'Finalização enérgica e assertiva. Elevar sutilmente a entonação ao concluir.',
    },
  ];

  const fullText = sections.map((s) => s.scriptContent).join(' ');
  const wordCount = fullText.split(/\s+/).length;
  const wordsPerMinute = Math.round(wordCount / durationMinutes);

  return {
    id: `SPEECH-${Date.now()}`,
    processNumber,
    court,
    lawyerName,
    targetMinister,
    totalDurationMinutes: durationMinutes,
    sections,
    wordCount,
    wordsPerMinute,
    signatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  };
}
