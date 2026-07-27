/**
 * Legis Connect — AI Customer Support Agent
 * Agente de atendimento automatizado Tier 1 integrado ao RAG e fallback humano
 * Padrão: AI Customer Service Architecture (Prompt 226 - Etapa 18)
 */

export interface CustomerContext {
  tenantId: string;
  userId: string;
  planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  userRole: 'CLIENT' | 'LAWYER' | 'ADMIN';
}

export interface SupportResponse {
  answer: string;
  sources?: string[];
  escalatedToHuman: boolean;
  escalationReason?: string;
  confidenceScore: number;
}

export class AISupportAgent {
  async handleCustomerQuery(query: string, context: CustomerContext): Promise<SupportResponse> {
    // Step 1: Análise de sentimento simples
    const isFrustrated = this.detectFrustration(query);
    if (isFrustrated) {
      return {
        answer: 'Compreendo sua frustração. Estou transferindo imediatamente seu atendimento para um de nossos especialistas humanos.',
        escalatedToHuman: true,
        escalationReason: 'HIGH_FRUSTRATION_DETECTED',
        confidenceScore: 0.0,
      };
    }

    // Step 2: RAG Lookup na Base de Conhecimento
    const ragResult = await this.queryKnowledgeBase(query, context);

    if (ragResult.confidence >= 0.85) {
      return {
        answer: ragResult.answerText,
        sources: ragResult.sources,
        escalatedToHuman: false,
        confidenceScore: ragResult.confidence,
      };
    }

    // Step 3: Fallback para humano quando a confiança for insuficiente
    return {
      answer: 'Não encontrei uma resposta com grau de certeza suficiente na nossa base de conhecimento. Redirecionando para nossa equipe de suporte.',
      escalatedToHuman: true,
      escalationReason: 'LOW_AI_CONFIDENCE',
      confidenceScore: ragResult.confidence,
    };
  }

  private detectFrustration(query: string): boolean {
    const frustrationKeywords = ['absurdo', 'pessimo', 'horrivel', 'cancelar', 'processar', 'ouvidoria', 'raiva'];
    const lowerQuery = query.toLowerCase();
    return frustrationKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  private async queryKnowledgeBase(query: string, context: CustomerContext) {
    // Simulação RAG
    return {
      answerText: 'Para criar um novo modelo de petição com IA, acesse a aba "AI Copilot" no menu lateral e selecione "Nova Petição".',
      sources: ['https://ajuda.legis-connect.com/copilot/criando-peticao'],
      confidence: 0.92,
    };
  }
}
