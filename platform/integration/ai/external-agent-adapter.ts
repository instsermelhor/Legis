/**
 * Legis Connect — External AI Agent Integration Adapter
 * Adaptador seguro para invocar agentes de IA desenvolvidos por terceiros/parceiros
 * Padrão: AI Integration Ecosystem (Prompt 227 - Etapa 21 & Prompt 224 LGPD Compliance)
 */

export interface ExternalAIAgentRequest {
  query: string;
  contextDocuments: string[];
  tenantId: string;
}

export interface ExternalAIAgentResponse {
  answer: string;
  confidenceScore: number;
  tokensUsed: number;
}

export class ExternalAIAgentAdapter {
  async invokePartnerAgent(
    agentEndpoint: string,
    apiKey: string,
    payload: ExternalAIAgentRequest
  ): Promise<ExternalAIAgentResponse> {
    // Validação e sanitização de PII antes de enviar ao agente parceiro (LGPD Prompt 224)
    const sanitizedPayload = this.sanitizePII(payload);

    const response = await fetch(agentEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Legis-Trace-Id': crypto.randomUUID(),
      },
      body: JSON.stringify(sanitizedPayload),
    });

    if (!response.ok) {
      throw new Error(`Partner AI Agent error (${response.status}): ${response.statusText}`);
    }

    return (await response.json()) as ExternalAIAgentResponse;
  }

  private sanitizePII(payload: ExternalAIAgentRequest): ExternalAIAgentRequest {
    // Remove CPFs e números de cartão antes de transmitir a APIs parceiras
    const cpfRegex = /\d{3}\.\d{3}\.\d{3}-\d{2}/g;
    const sanitizedQuery = payload.query.replace(cpfRegex, '[CPF_MASCARADO]');

    const sanitizedDocs = payload.contextDocuments.map(doc =>
      doc.replace(cpfRegex, '[CPF_MASCARADO]')
    );

    return {
      ...payload,
      query: sanitizedQuery,
      contextDocuments: sanitizedDocs,
    };
  }
}
