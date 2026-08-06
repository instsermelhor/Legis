/**
 * jurisprudenceLibraryEngine.ts
 * Nível 15 — Motor de Pesquisa de Jurisprudência, Súmulas Vinculantes STF/STJ & Banco de Teses Vencedoras
 * Legis Connect — Plataforma Jurídica Online
 */

export type CourtType = 'STF' | 'STJ' | 'TST' | 'TSE' | 'TRF' | 'TJSP' | 'TJRJ' | 'TJMG' | 'TJRS';
export type PrecedentCategory = 'sumula_vinculante' | 'sumula_simples' | 'tema_repetitivo' | 'repercussao_geral' | 'tese_fixada';

export interface PrecedentItem {
  id: string;
  court: CourtType;
  category: PrecedentCategory;
  number: number;
  title: string;
  summary: string;
  fullText: string;
  area: string;
  bindingForce: boolean; // Força vinculante (Art. 927 CPC)
  relator?: string;
  decisionDate: string;
  relevanceScore: number; // 0-100
  tags: string[];
}

export interface LegalThesis {
  id: string;
  title: string;
  area: string;
  side: 'author' | 'defendant' | 'both';
  summary: string;
  argumentationText: string;
  keyArticles: string[];
  associatedPrecedents: string[];
  winRateEstimate: number; // %
  timesUsed: number;
}

// ─── Banco de Súmulas & Precedentes Reais ─────────────────────────────────────

export const MOCK_PRECEDENTS: PrecedentItem[] = [
  {
    id: 'PREC-STF-SV-11',
    court: 'STF',
    category: 'sumula_vinculante',
    number: 11,
    title: 'Súmula Vinculante 11 — Uso de Algemas',
    summary: 'Só é lícito o uso de algemas em casos de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia.',
    fullText: 'Só é lícito o uso de algemas em casos de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia, justificada a excepcionalidade por escrito, sob pena de responsabilidade disciplinar, civil e penal do agente ou da autoridade e de nulidade da prisão ou do ato processual a que se refere, sem prejuízo da responsabilidade civil do Estado.',
    area: 'Penal',
    bindingForce: true,
    relator: 'Min. Marco Aurélio',
    decisionDate: '2008-08-13',
    relevanceScore: 98,
    tags: ['algemas', 'prisão', 'nulidade', 'direitos fundamentais', 'excepcionalidade'],
  },
  {
    id: 'PREC-STF-SV-25',
    court: 'STF',
    category: 'sumula_vinculante',
    number: 25,
    title: 'Súmula Vinculante 25 — Prisão de Depositário Infiel',
    summary: 'É ilícita a prisão civil de depositário infiel, qualquer que seja a modalidade do depósito.',
    fullText: 'É ilícita a prisão civil de depositário infiel, qualquer que seja a modalidade do depósito.',
    area: 'Cível',
    bindingForce: true,
    relator: 'Min. Cezar Peluso',
    decisionDate: '2009-12-16',
    relevanceScore: 95,
    tags: ['prisão civil', 'depositário infiel', 'pacto de san josé', 'direitos humanos'],
  },
  {
    id: 'PREC-STF-RG-69',
    court: 'STF',
    category: 'repercussao_geral',
    number: 69,
    title: 'Tema 69 STF — Exclusão do ICMS da Base de Cálculo do PIS e da COFINS',
    summary: 'O ICMS não compõe a base de cálculo para a incidência do PIS e da COFINS (Tese do Século).',
    fullText: 'O ICMS não compõe a base de cálculo para fins de incidência do PIS e da COFINS.',
    area: 'Tributário',
    bindingForce: true,
    relator: 'Min. Cármen Lúcia',
    decisionDate: '2017-03-15',
    relevanceScore: 100,
    tags: ['tributário', 'icms', 'pis', 'cofins', 'tese do século', 'repetição de indébito'],
  },
  {
    id: 'PREC-STJ-SUM-385',
    court: 'STJ',
    category: 'sumula_simples',
    number: 385,
    title: 'Súmula 385 STJ — Inscrição Indevida em Cadastro de Inadimplentes e Preexistência',
    summary: 'Da anotação irregular em cadastro de proteção ao crédito, não cabe indenização por dano moral, quando pré-existente legítima inscrição.',
    fullText: 'Da anotação irregular em cadastro de proteção ao crédito, não cabe indenização por dano moral, quando pré-existente legítima inscrição, ressalvado o direito ao cancelamento.',
    area: 'Consumidor',
    bindingForce: true,
    relator: 'Segunda Seção',
    decisionDate: '2009-06-08',
    relevanceScore: 92,
    tags: ['dano moral', 'spc', 'serasa', 'inscrição indevida', 'pré-existente'],
  },
  {
    id: 'PREC-STJ-SUM-543',
    court: 'STJ',
    category: 'sumula_simples',
    number: 543,
    title: 'Súmula 543 STJ — Rescisão de Contrato de Compra e Venda Imobiliária',
    summary: 'Na hipótese de resolução de contrato de promessa de compra e venda de imóvel submetido ao CDC, deve ocorrer a imediata restituição das parcelas pagas.',
    fullText: 'Na hipótese de resolução de contrato de promessa de compra e venda de imóvel submetido ao Código de Defesa do Consumidor, deve ocorrer a imediata restituição das parcelas pagas pelo promitente comprador - integralmente, em caso de culpa exclusiva do promitente vendedor/construtor, ou parcialmente, caso tenha sido o comprador quem deu causa ao desfazimento.',
    area: 'Imobiliário',
    bindingForce: true,
    relator: 'Segunda Seção',
    decisionDate: '2015-08-31',
    relevanceScore: 96,
    tags: ['imobiliário', 'rescisão', 'construtora', 'restituição', 'distrato'],
  },
  {
    id: 'PREC-TST-SUM-331',
    court: 'TST',
    category: 'sumula_simples',
    number: 331,
    title: 'Súmula 331 TST — Terceirização de Serviços e Responsabilidade',
    summary: 'A contratação de trabalhadores por empresa interposta é ilícita, formando-se o vínculo diretamente com o tomador dos serviços, salvo exceções legais.',
    fullText: 'I - A contratação de trabalhadores por empresa interposta é ilícita, formando-se o vínculo diretamente com o tomador dos serviços, salvo no caso de trabalho temporário (Lei nº 6.019, de 03.01.1974). IV - O inadimplemento das obrigações trabalhistas, por parte do empregador, implica a responsabilidade subsidiária do tomador dos serviços quanto àquelas obrigações.',
    area: 'Trabalhista',
    bindingForce: true,
    relator: 'Tribunal Pleno',
    decisionDate: '2011-05-24',
    relevanceScore: 97,
    tags: ['trabalhista', 'terceirização', 'responsabilidade subsidiária', 'vínculo de emprego'],
  },
];

// ─── Banco de Teses Jurídicas Vencedoras ──────────────────────────────────────

export const MOCK_THESES: LegalThesis[] = [
  {
    id: 'THESIS-CIV-001',
    title: 'Dano Moral In Re Ipsa em Negativação Indevida no SPC/SERASA',
    area: 'Consumidor',
    side: 'author',
    summary: 'A inclusão indevida do nome do consumidor nos órgãos de proteção ao crédito gera dano moral presumido (in re ipsa), dispensando prova do prejuízo.',
    argumentationText: 'Conforme pacífica jurisprudência do Superior Tribunal de Justiça, a inscrição indevida em cadastros de inadimplentes configura dano moral in re ipsa, prescindindo da comprovação de prejuízo concreto. O quantum indenizatório deve atender aos princípios da razoabilidade e proporcionalidade, com função punitivo-pedagógica.',
    keyArticles: ['Art. 14 CDC', 'Art. 186 CC/02', 'Art. 927 CC/02'],
    associatedPrecedents: ['PREC-STJ-SUM-385'],
    winRateEstimate: 89,
    timesUsed: 1420,
  },
  {
    id: 'THESIS-TRAB-002',
    title: 'Inversão do Ônus da Prova nas Horas Extras (Súmula 338 TST)',
    area: 'Trabalhista',
    side: 'author',
    summary: 'A não apresentação injustificada dos cartões de ponto por empresa com mais de 20 empregados gera presunção relativa de veracidade da jornada alegada.',
    argumentationText: 'É ônus do empregador que conta com mais de 20 (vinte) empregados o registro da jornada de trabalho na forma do art. 74, § 2º, da CLT. A não-apresentação injustificada dos controles de frequência gera presunção relativa de veracidade da jornada de trabalho descrita na petição inicial, nos termos da Súmula 338, I, do C. TST.',
    keyArticles: ['Art. 74 §2º CLT', 'Art. 818 CLT', 'Súmula 338 TST'],
    associatedPrecedents: ['Súmula 338 TST'],
    winRateEstimate: 92,
    timesUsed: 2150,
  },
  {
    id: 'THESIS-TRIB-003',
    title: 'Tese do Século — Exclusão do ICMS da Base do PIS/COFINS',
    area: 'Tributário',
    side: 'author',
    summary: 'O valor arrecadado a título de ICMS não se incorpora ao patrimônio do contribuinte, não podendo compor a base de cálculo das contribuições PIS e COFINS.',
    argumentationText: 'O Colendo Supremo Tribunal Federal, no julgamento do RE 574.706/PR (Tema 69 de Repercussão Geral), fixou a tese de que "O ICMS não compõe a base de cálculo para a incidência do PIS e da COFINS". Assim, faz jus o contribuinte à restituição/compensação dos valores recolhidos indevidamente nos últimos 5 anos.',
    keyArticles: ['Art. 195 I "b" CF/88', 'Art. 165 CTN', 'Tema 69 STF'],
    associatedPrecedents: ['PREC-STF-RG-69'],
    winRateEstimate: 97,
    timesUsed: 3890,
  },
  {
    id: 'THESIS-FAM-004',
    title: 'Pensão Alimentícia Avoenga — Caráter Complementar e Subsidiário',
    area: 'Família',
    side: 'defendant',
    summary: 'A obrigação alimentar dos avós possui natureza subsidiária e complementar, exigindo demonstração de esgotamento dos meios dos genitores.',
    argumentationText: 'A responsabilidade dos avós de prestar alimentos aos netos é subsidiária e complementar, nos termos da Súmula 596 do STJ. Não demonstrado a impossibilidade total dos genitores de prover a subsistência do alimentando, descabe a condenação direta dos avós.',
    keyArticles: ['Art. 1.696 CC/02', 'Art. 1.698 CC/02', 'Súmula 596 STJ'],
    associatedPrecedents: ['Súmula 596 STJ'],
    winRateEstimate: 85,
    timesUsed: 780,
  },
];

// ─── Funções de Pesquisa e Formatação ────────────────────────────────────────

export function searchPrecedents(query: string, areaFilter?: string, courtFilter?: string): PrecedentItem[] {
  let list = MOCK_PRECEDENTS;

  if (areaFilter && areaFilter !== 'all') {
    list = list.filter((p) => p.area.toLowerCase() === areaFilter.toLowerCase());
  }

  if (courtFilter && courtFilter !== 'all') {
    list = list.filter((p) => p.court === courtFilter);
  }

  if (!query.trim()) return list;

  const q = query.toLowerCase();
  return list.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.fullText.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function searchTheses(query: string, areaFilter?: string): LegalThesis[] {
  let list = MOCK_THESES;

  if (areaFilter && areaFilter !== 'all') {
    list = list.filter((t) => t.area.toLowerCase() === areaFilter.toLowerCase());
  }

  if (!query.trim()) return list;

  const q = query.toLowerCase();
  return list.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.argumentationText.toLowerCase().includes(q) ||
      t.keyArticles.some((a) => a.toLowerCase().includes(q))
  );
}

export function formatAbntCitation(precedent: PrecedentItem): string {
  const year = precedent.decisionDate.split('-')[0];
  return `BRASIL. Tribunal: ${precedent.court}. ${precedent.title}. Relator: ${precedent.relator || 'Orgão Julgador'}. Data do Julgamento: ${new Date(precedent.decisionDate).toLocaleDateString('pt-BR')}. Fundamentação legal: Art. 927 CPC. Ementa: "${precedent.fullText}"`;
}
