/**
 * lib/legalRagKnowledgeBase.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — LEGAL RAG (RETRIEVAL-AUGMENTED GENERATION) KNOWLEDGE BASE
 *
 * Base de conhecimento jurídica normativa pré-indexada para injeção de contexto:
 *   - Código de Processo Civil (CPC/2015)
 *   - Consolidação das Leis do Trabalho (CLT)
 *   - Código Civil (CC/2002)
 *   - Código de Defesa do Consumidor (CDC - Lei 8.078/90)
 *   - Lei Geral de Proteção de Dados (LGPD - Lei 13.709/18)
 *   - Súmulas Vinculantes & Jurisprudência do STF, STJ e TST
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface LegalArticle {
  id: string;
  source: 'CPC' | 'CLT' | 'CC' | 'CDC' | 'LGPD' | 'STF' | 'STJ' | 'TST';
  articleOrSumula: string;
  topic: string;
  content: string;
  keywords: string[];
}

export interface RagSearchResult {
  article: LegalArticle;
  relevanceScore: number;
}

const LEGAL_KNOWLEDGE_BASE: LegalArticle[] = [
  // ── CPC ──────────────────────────────────────────────────────────────────
  {
    id: 'cpc_art_219',
    source: 'CPC',
    articleOrSumula: 'Art. 219 do CPC',
    topic: 'Contagem de Prazos Processuais',
    content: 'Na contagem de prazo em dias, estabelecido por lei ou pelo juiz, computar-se-ão somente os dias úteis.',
    keywords: ['prazo', 'dias úteis', 'contagem', 'processo civil', 'cpc'],
  },
  {
    id: 'cpc_art_300',
    source: 'CPC',
    articleOrSumula: 'Art. 300 do CPC',
    topic: 'Tutela de Urgência',
    content: 'A tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo.',
    keywords: ['tutela', 'urgência', 'liminar', 'probabilidade do direito', 'perigo de dano'],
  },
  {
    id: 'cpc_art_335',
    source: 'CPC',
    articleOrSumula: 'Art. 335 do CPC',
    topic: 'Prazo para Contestação',
    content: 'O réu poderá oferecer contestação, por petição, no prazo de 15 (quinze) dias, cujo termo inicial será a data da audiência de conciliação ou de mediação.',
    keywords: ['contestação', 'prazo 15 dias', 'réu', 'defesa', 'resposta'],
  },
  {
    id: 'cpc_art_1003',
    source: 'CPC',
    articleOrSumula: 'Art. 1.003, § 5º do CPC',
    topic: 'Prazo Recursal Geral',
    content: 'Excetuados os embargos de declaração, o prazo para interpor e para responder aos recursos é de 15 (quinze) dias.',
    keywords: ['recurso', 'apelação', 'agravo', 'prazo 15 dias', 'embargos'],
  },

  // ── CLT ──────────────────────────────────────────────────────────────────
  {
    id: 'clt_art_477',
    source: 'CLT',
    articleOrSumula: 'Art. 477 da CLT',
    topic: 'Rescisão do Contrato de Trabalho',
    content: 'A entrega ao empregado de documentos que comprovem a comunicação da extinção contratual bem como o pagamento dos valores rescisórios deverão ser efetuados até dez dias contados do término do contrato.',
    keywords: ['rescisão', 'prazo 10 dias', 'verbas rescisórias', 'trabalhista', 'multa'],
  },
  {
    id: 'clt_art_847',
    source: 'CLT',
    articleOrSumula: 'Art. 847 da CLT',
    topic: 'Defesa na Justiça do Trabalho',
    content: 'Não havendo acordo, o reclamado terá vinte minutos para prestar sua defesa, após a leitura da reclamação, quando esta não for dispensada por ambas as partes.',
    keywords: ['reclamação trabalhista', 'contestação', 'audiência', 'defesa', 'trabalho'],
  },

  // ── LGPD ─────────────────────────────────────────────────────────────────
  {
    id: 'lgpd_art_18',
    source: 'LGPD',
    articleOrSumula: 'Art. 18 da LGPD',
    topic: 'Direitos do Titular dos Dados',
    content: 'O titular dos dados pessoais tem direito a obter do controlador, em relação aos dados por ele tratados, a qualquer momento e mediante requisição: confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos e eliminação.',
    keywords: ['lgpd', 'titular', 'direitos', 'acesso', 'eliminação', 'privacidade', 'dados pessoais'],
  },

  // ── SÚMULAS STF / STJ / TST ─────────────────────────────────────────────
  {
    id: 'stf_sv_14',
    source: 'STF',
    articleOrSumula: 'Súmula Vinculante 14 do STF',
    topic: 'Acesso do Advogado a Inquéritos',
    content: 'É direito do defensor, no interesse do representado, ter acesso amplo aos elementos de prova que, já documentados em procedimento investigatório realizado por órgão com competência de polícia judiciária, digam respeito ao exercício do direito de defesa.',
    keywords: ['súmula vinculante', 'advogado', 'inquérito', 'acesso', 'defesa', 'polícia'],
  },
  {
    id: 'stj_sumula_385',
    source: 'STJ',
    articleOrSumula: 'Súmula 385 do STJ',
    topic: 'Dano Moral e Inscrição Cadastral',
    content: 'Da anotação irregular em cadastro de proteção ao crédito, não cabe indenização por dano moral, quando pré-existente legítima inscrição, ressalvado o direito ao cancelamento.',
    keywords: ['dano moral', 'stj', 'serasa', 'spc', 'inscrição indevida', 'negativação'],
  },
  {
    id: 'tst_sumula_331',
    source: 'TST',
    articleOrSumula: 'Súmula 331 do TST',
    topic: 'Terceirização e Responsabilidade Subsidária',
    content: 'O inadimplemento das obrigações trabalhistas, por parte do empregador, implica a responsabilidade subsidiária do tomador dos serviços quanto àquelas obrigações, desde que este tenha participado da relação processual e conste também do título executivo judicial.',
    keywords: ['terceirização', 'responsabilidade subsidiária', 'tst', 'súmula 331', 'verbas trabalhistas'],
  },
];

export class LegalRagKnowledgeBase {
  /**
   * Realiza busca RAG semântica/por palavras-chave na base de conhecimento.
   * Retorna os artigos mais relevantes ordenados por score.
   */
  public search(query: string, limit = 3): RagSearchResult[] {
    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const queryTokens = normalizedQuery.split(/\W+/).filter(t => t.length > 2);

    const scored = LEGAL_KNOWLEDGE_BASE.map(article => {
      let score = 0;

      // Match em palavras-chave (+3 pontos)
      article.keywords.forEach(kw => {
        if (normalizedQuery.includes(kw.toLowerCase())) score += 3;
      });

      // Match em tópicos (+2 pontos)
      if (article.topic.toLowerCase().split(/\W+/).some(t => queryTokens.includes(t))) {
        score += 2;
      }

      // Match no conteúdo (+1 ponto por token)
      const contentNormalized = article.content.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      queryTokens.forEach(token => {
        if (contentNormalized.includes(token)) score += 1;
      });

      return { article, relevanceScore: score };
    });

    return scored
      .filter(s => s.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Formata os resultados da busca RAG em uma string pronta para injeção de contexto em LLMs.
   */
  public buildPromptContext(query: string): string {
    const results = this.search(query, 3);
    if (results.length === 0) return 'Nenhum contexto normativo relevante encontrado.';

    return results.map(r => `[${r.article.articleOrSumula} - ${r.article.topic}]\n${r.article.content}`).join('\n\n');
  }
}

export const legalRagKnowledgeBase = new LegalRagKnowledgeBase();
