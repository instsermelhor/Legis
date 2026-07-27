import { Injectable } from '@nestjs/common';

@Injectable()
export class LegalAssistantAgent {
  async executeTask(userPrompt: string, userUcid: string, tenantId: string): Promise<string> {
    console.log(`[AI Agent] Processing prompt for UCID: ${userUcid} in Tenant: ${tenantId}`);
    return `Análise efetuada com base no acervo jurídico do tenant ${tenantId}.`;
  }
}
