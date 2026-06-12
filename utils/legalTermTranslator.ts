/**
 * legalTermTranslator.ts
 * Traduz jargões jurídicos para linguagem simples e amigável ao cidadão.
 * Conceito "Zero Juridiquês" — Legis Connect.
 */

interface TermEntry {
  simple: string;
  detail: string;
  emoji: string;
  good?: boolean; // indica se é uma movimentação positiva para o cliente
}

const LEGAL_TERMS: Record<string, TermEntry> = {
  // ─── Fases processuais ───
  'conclusos para despacho': {
    simple: 'Aguardando decisão do juiz',
    detail: 'O processo está na mesa do juiz. Ele está analisando tudo e vai decidir qual é o próximo passo.',
    emoji: '⚖️',
  },
  'conclusos': {
    simple: 'Na fila para o juiz decidir',
    detail: 'Os autos estão esperando o juiz dar uma resposta ou tomar uma decisão.',
    emoji: '⏳',
  },
  'despacho': {
    simple: 'Ordem ou instrução do juiz',
    detail: 'O juiz escreveu uma orientação dizendo o que deve acontecer a seguir no processo.',
    emoji: '📋',
  },
  'sentença': {
    simple: 'Decisão final do juiz',
    detail: 'O juiz tomou a decisão principal do caso, dizendo quem ganhou e o que cada parte deve fazer.',
    emoji: '🔨',
  },
  'acórdão': {
    simple: 'Decisão de um grupo de juízes',
    detail: 'Um grupo de juízes (chamado de câmara ou turma) analisou o caso e tomou uma decisão coletiva.',
    emoji: '👥',
  },
  'juntada': {
    simple: 'Documento recebido no processo',
    detail: 'Um documento foi oficialmente adicionado ao processo. Pode ser uma petição, um comprovante ou qualquer arquivo importante.',
    emoji: '📎',
  },
  'citação': {
    simple: 'Aviso oficial que você foi incluído em um processo',
    detail: 'Você foi notificado formalmente de que existe uma ação judicial envolvendo você. É importante responder dentro do prazo.',
    emoji: '📬',
    good: false,
  },
  'intimação': {
    simple: 'Aviso para você fazer algo',
    detail: 'O tribunal está pedindo que você (ou seu advogado) tome alguma ação ou compareça a algum lugar. Fique atento aos prazos!',
    emoji: '🔔',
  },
  'audiência designada': {
    simple: 'Data de audiência marcada',
    detail: 'Uma reunião foi agendada onde você, o juiz e a outra parte vão se encontrar (pessoalmente ou por vídeo) para debater o caso.',
    emoji: '📅',
    good: true,
  },
  'audiência realizada': {
    simple: 'Audiência aconteceu',
    detail: 'A reunião com o juiz e as partes já ocorreu. O juiz vai analisar o que foi dito e tomar uma decisão.',
    emoji: '✅',
  },
  'recurso': {
    simple: 'Pedido para revisar a decisão',
    detail: 'Uma das partes não concordou com a decisão e pediu para que outro juiz (ou grupo de juízes) revise o caso.',
    emoji: '🔄',
  },
  'embargos': {
    simple: 'Pedido de esclarecimento da decisão',
    detail: 'Uma das partes pediu ao juiz que explique melhor a decisão ou corrija algum erro que encontrou.',
    emoji: '❓',
  },
  'tutela antecipada': {
    simple: 'Proteção imediata concedida',
    detail: 'O juiz concordou em proteger você agora mesmo, antes do processo terminar, porque a situação é urgente.',
    emoji: '🛡️',
    good: true,
  },
  'tutela antecipada concedida': {
    simple: 'Proteção imediata aprovada! ✓',
    detail: 'Ótima notícia! O juiz aprovou que você seja protegido agora mesmo, enquanto o processo continua.',
    emoji: '🎉',
    good: true,
  },
  'tutela antecipada negada': {
    simple: 'Pedido de proteção imediata negado',
    detail: 'O juiz não aprovou a proteção imediata por enquanto, mas o processo continua e ainda pode ter um resultado favorável.',
    emoji: '⚠️',
    good: false,
  },
  'processo extinto': {
    simple: 'Processo encerrado',
    detail: 'O processo foi encerrado. Pode ter sido por acordo, desistência, ou porque o juiz entendeu que não havia razão para continuá-lo.',
    emoji: '🏁',
  },
  'arquivado': {
    simple: 'Processo guardado/encerrado',
    detail: 'O processo foi arquivado porque foi concluído, prescreveu ou não há mais andamentos previstos.',
    emoji: '📦',
  },
  'prazo': {
    simple: 'Data limite para agir',
    detail: 'Existe um período específico para que algo seja feito. Se o prazo passar sem ação, pode haver consequências.',
    emoji: '⏰',
  },
  'petição': {
    simple: 'Documento enviado ao juiz',
    detail: 'Seu advogado (ou a outra parte) enviou um documento escrito ao tribunal com argumentos, pedidos ou informações.',
    emoji: '📄',
  },
  'petição inicial': {
    simple: 'Início do processo — primeiro documento',
    detail: 'Este foi o documento que deu início ao processo judicial. Nele, a parte que abriu o caso explicou o que quer e por quê.',
    emoji: '🚀',
  },
  'contestação': {
    simple: 'Resposta da outra parte',
    detail: 'A outra parte respondeu ao processo, apresentando seus argumentos e defesa.',
    emoji: '💬',
  },
  'réu': {
    simple: 'Pessoa que está sendo processada',
    detail: 'É quem está sendo acionado no processo — pode ser você ou outra pessoa/empresa.',
    emoji: '👤',
  },
  'autor': {
    simple: 'Quem abriu o processo',
    detail: 'É a pessoa ou empresa que iniciou o processo judicial, buscando resolver um problema pela Justiça.',
    emoji: '👤',
  },
  'exequente': {
    simple: 'Quem quer receber o que é seu',
    detail: 'É a parte que já ganhou o processo e agora está pedindo que a decisão seja cumprida na prática.',
    emoji: '💰',
  },
  'executado': {
    simple: 'Quem deve cumprir a decisão',
    detail: 'É a parte que foi condenada e precisa pagar ou realizar algo determinado pela Justiça.',
    emoji: '⚖️',
  },
  'penhora': {
    simple: 'Bens reservados para pagar a dívida',
    detail: 'O juiz determinou que alguns bens (dinheiro, veículo, imóvel) fiquem separados para garantir o pagamento da dívida.',
    emoji: '🔒',
    good: false,
  },
  'liminar': {
    simple: 'Decisão urgente do juiz',
    detail: 'O juiz tomou uma decisão rápida porque a situação era urgente. Essa decisão vale enquanto o processo não termina.',
    emoji: '⚡',
  },
};

/**
 * Traduz um termo ou andamento jurídico para linguagem simples.
 * @param term - O texto do andamento jurídico (case-insensitive)
 * @returns O objeto TermEntry se encontrado, ou null
 */
export function translateLegalTerm(term: string): TermEntry | null {
  const normalizedInput = term.toLowerCase().trim();

  // Busca exata
  if (LEGAL_TERMS[normalizedInput]) {
    return LEGAL_TERMS[normalizedInput];
  }

  // Busca parcial — verifica se o input CONTÉM algum dos termos do dicionário
  for (const [key, entry] of Object.entries(LEGAL_TERMS)) {
    if (normalizedInput.includes(key) || key.includes(normalizedInput)) {
      return entry;
    }
  }

  // Fallback genérico
  return {
    simple: 'Movimentação registrada no processo',
    detail: 'Uma ação aconteceu no seu processo. Fale com seu advogado para entender o que isso significa para o seu caso.',
    emoji: '📋',
  };
}

/**
 * Retorna apenas o texto simples de um termo jurídico.
 */
export function simplifyLegalTerm(term: string): string {
  const result = translateLegalTerm(term);
  return result?.simple ?? term;
}

/**
 * Classifica uma descrição de problema jurídico em uma área do Direito.
 * Usa análise de palavras-chave (NLP simplificado).
 */
export interface LegalAreaClassification {
  area: string;
  areaSimple: string; // Nome amigável para o cliente
  confidence: 'alta' | 'média' | 'baixa';
  complexity: 'simples' | 'moderada' | 'complexa';
  keywords: string[];
  emoji: string;
  color: string; // Tailwind color class
  description: string; // O que o cliente pode esperar
}

const AREA_KEYWORDS: { area: string; areaSimple: string; emoji: string; color: string; description: string; keywords: string[] }[] = [
  {
    area: 'Direito Trabalhista',
    areaSimple: 'Problemas no Trabalho',
    emoji: '👷',
    color: 'amber',
    description: 'Questões como demissão, horas extras, FGTS, férias não pagas e assédio moral no trabalho.',
    keywords: ['demiti', 'demissão', 'trabalho', 'emprego', 'salário', 'fgts', 'carteira', 'horas extras', 'férias', 'rescisão', 'clt', 'sindicato', 'chefe', 'patrão', 'empresa', 'assédio', 'verbas', 'trabalhista', 'funcionário'],
  },
  {
    area: 'Direito de Família',
    areaSimple: 'Família e Relacionamentos',
    emoji: '👨‍👩‍👧',
    color: 'rose',
    description: 'Divórcio, guarda de filhos, pensão alimentícia, inventário de herança e adoção.',
    keywords: ['divórcio', 'separação', 'guarda', 'filho', 'pensão', 'alimentos', 'herança', 'inventário', 'casamento', 'divorciar', 'cônjuge', 'esposa', 'marido', 'família', 'adoção', 'tutela', 'curatela'],
  },
  {
    area: 'Direito do Consumidor',
    areaSimple: 'Problemas com Empresas e Produtos',
    emoji: '🛒',
    color: 'blue',
    description: 'Compra com defeito, cobrança indevida, cancelamento de serviço, banco e operadora.',
    keywords: ['banco', 'cobrança', 'fatura', 'cartão', 'produto', 'defeito', 'serviço', 'cancelamento', 'operadora', 'internet', 'compra', 'loja', 'fraude', 'consórcio', 'seguro', 'plano de saúde', 'telefone', 'energia', 'água'],
  },
  {
    area: 'Direito Penal',
    areaSimple: 'Defesa Criminal',
    emoji: '🔐',
    color: 'red',
    description: 'Acusações criminais, prisão, crimes, boletim de ocorrência e defesa em processos penais.',
    keywords: ['crime', 'preso', 'acusado', 'policia', 'roubo', 'furto', 'homicídio', 'ameaça', 'lesão', 'prisão', 'penal', 'delegacia', 'inquérito', 'bo', 'boletim', 'violência', 'tráfico', 'estelionato'],
  },
  {
    area: 'Direito Civil',
    areaSimple: 'Contratos e Dívidas',
    emoji: '📝',
    color: 'purple',
    description: 'Cobranças, dívidas, contratos descumpridos, dano moral e questões com vizinhos ou locatários.',
    keywords: ['dívida', 'contrato', 'cobrança', 'dano', 'moral', 'aluguel', 'imóvel', 'vizinho', 'empréstimo', 'descumpriu', 'nome sujo', 'spc', 'serasa', 'acordo', 'multa', 'indenização'],
  },
  {
    area: 'Direito Imobiliário',
    areaSimple: 'Casa, Terreno e Propriedade',
    emoji: '🏠',
    color: 'green',
    description: 'Compra e venda de imóvel, despejo, usucapião, financiamento habitacional e condomínio.',
    keywords: ['imóvel', 'casa', 'apartamento', 'terreno', 'compra', 'venda', 'escritura', 'despejo', 'aluguel', 'financiamento', 'minha casa', 'condomínio', 'vizinho', 'usucapião', 'invasão'],
  },
  {
    area: 'Direito Previdenciário',
    areaSimple: 'INSS e Aposentadoria',
    emoji: '👴',
    color: 'teal',
    description: 'Aposentadoria, benefício negado pelo INSS, auxílio-doença, pensão por morte e revisão de benefício.',
    keywords: ['inss', 'aposentadoria', 'benefício', 'auxílio', 'doença', 'pensão', 'morte', 'bpc', 'loas', 'previdência', 'contribuição', 'negado', 'indeferido', 'revisão'],
  },
];

export function classifyLegalProblem(description: string): LegalAreaClassification {
  const lowerDesc = description.toLowerCase();
  let bestMatch = AREA_KEYWORDS[0];
  let bestScore = 0;
  const foundKeywords: string[] = [];

  for (const areaEntry of AREA_KEYWORDS) {
    let score = 0;
    const matched: string[] = [];
    for (const kw of areaEntry.keywords) {
      if (lowerDesc.includes(kw)) {
        score++;
        matched.push(kw);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = areaEntry;
      foundKeywords.splice(0, foundKeywords.length, ...matched);
    }
  }

  const confidence: LegalAreaClassification['confidence'] =
    bestScore >= 3 ? 'alta' : bestScore >= 1 ? 'média' : 'baixa';

  const wordCount = description.split(' ').length;
  const complexity: LegalAreaClassification['complexity'] =
    wordCount > 50 ? 'complexa' : wordCount > 20 ? 'moderada' : 'simples';

  return {
    area: bestMatch.area,
    areaSimple: bestMatch.areaSimple,
    confidence,
    complexity,
    keywords: foundKeywords,
    emoji: bestMatch.emoji,
    color: bestMatch.color,
    description: bestMatch.description,
  };
}
