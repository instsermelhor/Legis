/**
 * superiorAppealsAiEngine.ts
 * Nível 21/22 — Módulo de Inteligência Artificial Generativa para Recursos aos Tribunais Superiores (STF/STJ/TST)
 * Legis Connect — Plataforma Jurídica Online
 */

export type SuperiorAppealType = 'RE' | 'REsp' | 'RR' | 'AREsp' | 'ARE' | 'AgInt';
export type TargetCourt = 'STF' | 'STJ' | 'TST';

export interface AdmissibilityCheckResult {
  score: number; // 0-100% de probabilidade de admissão
  hasPrequestionamento: boolean;
  sumula7StjRisk: boolean; // Reexame de provas
  sumula279StfRisk: boolean; // Reexame de fatos/provas
  repercussaoGeralDemonstrated: boolean; // Art. 1.035 CPC
  transcendenceDemonstrated?: boolean; // Art. 896-A CLT (para TST)
  barriers: string[];
  recommendations: string[];
}

export interface AppellateDraftParams {
  appealType: SuperiorAppealType;
  targetCourt: TargetCourt;
  processNumber: string;
  recurrentParty: string;
  recurredParty: string;
  violatedArticles: string[];
  precedentTheme?: string;
  keyArguments: string;
}

// ─── Teste de Admissibilidade de Recursos aos Tribunais Superiores ────────────

export function analyzeAppealAdmissibility(params: {
  appealType: SuperiorAppealType;
  targetCourt: TargetCourt;
  hasPrequestionamento: boolean;
  reexaminesFacts: boolean;
  hasRepercussaoGeral: boolean;
  hasTranscendence?: boolean;
}): AdmissibilityCheckResult {
  const barriers: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  if (!params.hasPrequestionamento) {
    score -= 40;
    barriers.push('Ausência de Prequestionamento Expresso (Súmulas 282 e 356 STF / Súmula 211 STJ)');
    recommendations.push('Interpor Embargos de Declaração na origem para provocar a manifestação expressa sobre a norma violada.');
  }

  if (params.reexaminesFacts) {
    score -= 35;
    if (params.targetCourt === 'STJ') {
      barriers.push('Risco de Óbice da Súmula 7 do STJ (A pretensão de simples reexame de prova não enseja recurso especial)');
      recommendations.push('Reenquadrar a fundamentação para valoração jurídica da prova ou valoração da tese de direito puro.');
    } else if (params.targetCourt === 'STF') {
      barriers.push('Risco de Óbice da Súmula 279 do STF (Para simples reexame de prova não cabe recurso extraordinário)');
      recommendations.push('Demonstrar a violação direta e frontal à Constituição Federal sem necessidade de revolver os fatos.');
    }
  }

  if (params.targetCourt === 'STF' && !params.hasRepercussaoGeral) {
    score -= 25;
    barriers.push('Ausência de Preliminar Formal e Fundamentada de Repercussão Geral (Art. 1.035 §2º CPC)');
    recommendations.push('Incluir capítulo autônomo demonstrando a relevância jurídica, econômica, social ou política da questão.');
  }

  if (params.targetCourt === 'TST' && !params.hasTranscendence) {
    score -= 25;
    barriers.push('Ausência de Demonstração de Transcendência Trabalhista (Art. 896-A da CLT)');
    recommendations.push('Demonstrar a transcendência econômica, política, social ou jurídica da causa.');
  }

  return {
    score: Math.max(0, score),
    hasPrequestionamento: params.hasPrequestionamento,
    sumula7StjRisk: params.targetCourt === 'STJ' && params.reexaminesFacts,
    sumula279StfRisk: params.targetCourt === 'STF' && params.reexaminesFacts,
    repercussaoGeralDemonstrated: params.hasRepercussaoGeral,
    transcendenceDemonstrated: params.hasTranscendence,
    barriers,
    recommendations: recommendations.length > 0 ? recommendations : ['Recurso atende aos requisitos formais de admissibilidade.'],
  };
}

// ─── Gerador de Minutas de Recursos aos Tribunais Superiores ─────────────────

export function generateSuperiorAppealDraft(params: AppellateDraftParams): string {
  const { appealType, targetCourt, processNumber, recurrentParty, recurredParty, violatedArticles, precedentTheme, keyArguments } = params;

  let headerCourt = 'EXCELENTÍSSIMO SENHOR DOUTOR DESEMBARGADOR PRESIDENTE DO EGREGIO TRIBUNAL DE ORIGEM';
  if (appealType === 'AgInt') {
    headerCourt = `EXCELENTÍSSIMO SENHOR DOUTOR MINISTRO RELATOR DO ${targetCourt}`;
  }

  return `${headerCourt}

PROCESSO Nº: ${processNumber}
RECORRENTE: ${recurrentParty.toUpperCase()}
RECORRIDO: ${recurredParty.toUpperCase()}

${appealType === 'RE' ? 'RECURSO EXTRAORDINÁRIO (Art. 102, III, "a", CF/88)' : appealType === 'REsp' ? 'RECURSO ESPECIAL (Art. 105, III, "a", CF/88)' : 'RECURSO DE REVISTA (Art. 896 CLT)'}

${recurrentParty}, já qualificado nos autos do processo em epígrafe, vem, respeitosamente, à presença de Vossa Excelência, interpor o presente

${appealType} — ${targetCourt.toUpperCase()}

com fulcro na legislação vigente, pelas razões de fato e de direito a seguir expostas.

I — DA TEMPESTIVIDADE E PREPARO
O presente recurso é tempestivo, tendo sido interposto no prazo legal de 15 (quinze) dias úteis (Art. 1.003, § 5º, CPC). As guias de preparo e porte de remessa e retorno foram devidamente recolhidas.

II — DO PREQUESTIONAMENTO EXPRESSO
Cumpre destacar que a matéria de direito objeto deste recurso foi expressamente debatida no acórdão recorrido, atendendo ao requisito do prequestionamento (Súmula 282 STF / Súmula 211 STJ).

${targetCourt === 'STF' ? `III — DA PRELIMINAR DE REPERCUSSÃO GERAL (Art. 1.035, CPC)
A questão constitucional em debate transcende os interesses subjetivos das partes, possuindo relevante expressão jurídica, econômica e social, enquadrando-se no ${precedentTheme || 'Tema de Repercussão Geral do STF'}.` : ''}

IV — DA VIOLAÇÃO AOS ARTIGOS ${violatedArticles.join(', ')}
O v. acórdão recorrido contrariou frontalmente o disposto nos artigos ${violatedArticles.join(', ')}, ao entender que:
"${keyArguments}"

V — DOS PEDIDOS
Pelo exposto, requer a Vossa Excelência:
a) O recebimento e processamento do presente recurso;
b) O provimento do recurso pelo ${targetCourt} para reformar o acórdão recorrido.

Termos em que pede deferimento.
Local e Data.
Assinado digitalmente com hash SHA-256 via Legis Connect.`;
}
