/**
 * expertForensicsEngine.ts
 * Nível 19 — Módulo de Perícia Técnica, Análise de Laudos por IA, Calculadora de Danos & Gerador de Quesitos
 * Legis Connect — Plataforma Jurídica Online
 */

export type ForensicsArea = 'medica' | 'trabalhista' | 'contabil' | 'engenharia' | 'grafotecnica' | 'ti_digital';

export interface ForensicsCalculation {
  materialDamage: number; // Danos Emergentes
  moralDamage: number; // Dano Moral
  lostProfits: number; // Lucros Cessantes
  correctionIndex: 'IPCA-E' | 'SELIC' | 'INPC' | 'IGP-M';
  interestRate: number; // % ao mês
  totalLiquidated: number;
  breakdown: string[];
}

export interface TechnicalQuesito {
  id: string;
  number: number;
  question: string;
  objective: string;
  category: string;
}

export interface ForensicsReport {
  id: string;
  processNumber: string;
  area: ForensicsArea;
  expertName: string;
  findings: string[];
  divergences: string[];
  suggestedQuesitos: TechnicalQuesito[];
  calculation: ForensicsCalculation;
  signatureHash: string;
}

// ─── Calculadora de Liquidação de Danos e Correção Monetária ────────────────

export function calculateDamageLiquidation(params: {
  materialDamage: number;
  moralDamage: number;
  lostProfits: number;
  monthsCount: number;
  correctionIndex: 'IPCA-E' | 'SELIC' | 'INPC' | 'IGP-M';
}): ForensicsCalculation {
  const breakdown: string[] = [];
  const { materialDamage, moralDamage, lostProfits, monthsCount, correctionIndex } = params;

  // Índices de correção acumulados simulados (2024-2026)
  const indexRates: Record<string, number> = {
    'IPCA-E': 0.12, // 12% acumulado
    SELIC: 0.22, // 22% acumulado (com juros)
    INPC: 0.11,
    'IGP-M': 0.08,
  };

  const mult = indexRates[correctionIndex] || 0.12;
  const correctedMaterial = materialDamage * (1 + mult);
  const correctedMoral = moralDamage; // Dano moral corrigido a partir do arbitramento (Súmula 362 STJ)
  const correctedProfits = lostProfits * (1 + mult);

  // Juros de mora 1% a.m. (Art. 406 CC / Súmula 54 STJ)
  const interestMult = correctionIndex === 'SELIC' ? 0 : monthsCount * 0.01;
  const interestAmount = (correctedMaterial + correctedProfits) * interestMult;

  const totalLiquidated = correctedMaterial + correctedMoral + correctedProfits + interestAmount;

  breakdown.push(`Danos Materiais: R$ ${materialDamage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} → Corrigido (${correctionIndex}): R$ ${correctedMaterial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  breakdown.push(`Dano Moral Arbitrado: R$ ${moralDamage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Súmula 362 STJ)`);
  breakdown.push(`Lucros Cessantes: R$ ${lostProfits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} → Corrigido: R$ ${correctedProfits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  if (interestMult > 0) {
    breakdown.push(`Juros de Mora (${monthsCount} meses × 1% a.m. - Súmula 54 STJ): R$ ${interestAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  } else {
    breakdown.push(`Juros inclusos na taxa SELIC (Tema 1086 STJ)`);
  }
  breakdown.push(`VALOR TOTAL LIQUIDADO: R$ ${totalLiquidated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

  return {
    materialDamage: correctedMaterial,
    moralDamage: correctedMoral,
    lostProfits: correctedProfits,
    correctionIndex,
    interestRate: interestMult * 100,
    totalLiquidated,
    breakdown,
  };
}

// ─── Banco de Quesitos Periciais Estratégicos por Área ────────────────────────

export const MOCK_QUESITOS_BY_AREA: Record<ForensicsArea, TechnicalQuesito[]> = {
  medica: [
    {
      id: 'Q-MED-1',
      number: 1,
      question: 'Queira o Sr. Perito informar se o periciando apresenta lesão ou sequela física/psíquica decorrente do evento alegado na exordial.',
      objective: 'Nexo causal direto',
      category: 'Nexo Causal',
    },
    {
      id: 'Q-MED-2',
      number: 2,
      question: 'Há incapacidade laborativa no momento? Caso positivo, a incapacidade é total ou parcial, temporária ou permanente?',
      objective: 'Graduação da incapacidade',
      category: 'Incapacidade Laborativa',
    },
    {
      id: 'Q-MED-3',
      number: 3,
      question: 'Informe o perito se há possibilidade de reabilitação profissional com tratamentos médicos ou fisioterápicos disponíveis.',
      objective: 'Possibilidade de reabilitação',
      category: 'Reabilitação',
    },
  ],
  trabalhista: [
    {
      id: 'Q-TRAB-1',
      number: 1,
      question: 'Descreva o perito as atividades habituais exercidas pelo reclamante na empresa ré e o ambiente físico de trabalho.',
      objective: 'Caracterização do ambiente',
      category: 'Ambiente de Trabalho',
    },
    {
      id: 'Q-TRAB-2',
      number: 2,
      question: 'Informe se o periciando ficava exposto a agentes insalubres (físicos, químicos ou biológicos) acima dos limites de tolerância fixados na NR-15.',
      objective: 'Adicional de Insalubridade',
      category: 'NR-15 Insalubridade',
    },
    {
      id: 'Q-TRAB-3',
      number: 3,
      question: 'Constatou-se o fornecimento e a efetiva fiscalização de Equipamentos de Proteção Individual (EPIs) com Certificado de Aprovação (CA) válido?',
      objective: 'Atenuação/Neutralização do agente',
      category: 'EPIs e CA',
    },
  ],
  contabil: [
    {
      id: 'Q-CONT-1',
      number: 1,
      question: 'Queira o perito contábil apurar a evolução do saldo devedor contratual, discriminando juros remuneratórios, moratórios e tarifas aplicadas.',
      objective: 'Apuração de anomalias contratuais',
      category: 'Saldo Devedor',
    },
    {
      id: 'Q-CONT-2',
      number: 2,
      question: 'Houve a aplicação de capitalização de juros em periodicidade inferior à anual (anatocismo) sem previsão contratual expressa?',
      objective: 'Anatocismo indevido',
      category: 'Anatocismo',
    },
  ],
  engenharia: [
    {
      id: 'Q-ENG-1',
      number: 1,
      question: 'Indique o perito se os vícios construtivos verificados no imóvel decorrem de falha na execução do projeto ou má qualidade dos materiais.',
      objective: 'Responsabilidade da construtora',
      category: 'Vícios Construtivos',
    },
  ],
  grafotecnica: [
    {
      id: 'Q-GRAF-1',
      number: 1,
      question: 'A assinatura constante do documento questionado provém do punho caligráfico da parte autora ou trata-se de falsificação/decalque?',
      objective: 'Falsidade documental',
      category: 'Autenticidade de Assinatura',
    },
  ],
  ti_digital: [
    {
      id: 'Q-TI-1',
      number: 1,
      question: 'Informe o perito de TI se os logs de acesso e a cadeia de custódia da prova digital apresentada preservam o valor hash SHA-256 original.',
      objective: 'Integridade da prova digital',
      category: 'Cadeia de Custódia Digital',
    },
  ],
};
