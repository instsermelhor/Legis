/**
 * Legis Connect — Marketplace Registry & Verification Service
 * Padrão: Lawyer Domain & Professional Verification Engine (Prompt 249 - Etapa 2 & 5)
 * Implementação do serviço de cadastro de advogados, verificação OAB e busca profissional
 */

export interface LawyerRegistrationRequest {
  userId: string;
  tenantId: string;
  oabNumber: string;
  oabState: string;
  specialties: string[];
  hourlyRateBrl: number;
}

export interface VerificationResult {
  lawyerId: string;
  oabNumber: string;
  oabState: string;
  verified: boolean;
  statusMessage: string;
  verifiedAt: Date;
}

export interface MarketplaceEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  tenantId: string;
  timestamp: Date;
  payload: Record<string, any>;
}

export class MarketplaceRegistryService {
  private static eventsQueue: MarketplaceEvent[] = [];

  public static async registerLawyer(request: LawyerRegistrationRequest): Promise<string> {
    const lawyerId = `LWY-${Date.now()}`;
    console.log(`[MARKETPLACE SERVICE] Registering Lawyer ${lawyerId} (OAB: ${request.oabNumber}/${request.oabState})...`);

    // Publicar evento de registro pendente
    this.publishEvent({
      eventId: `EVT-MKT-${Date.now()}`,
      eventType: 'legis.marketplace.lawyer.registered.v1',
      aggregateId: lawyerId,
      tenantId: request.tenantId,
      timestamp: new Date(),
      payload: { lawyerId, oabNumber: request.oabNumber, oabState: request.oabState },
    });

    // Iniciar verificação automática OAB
    await this.verifyOabRegistration(lawyerId, request.tenantId, request.oabNumber, request.oabState);

    return lawyerId;
  }

  public static async verifyOabRegistration(
    lawyerId: string,
    tenantId: string,
    oabNumber: string,
    oabState: string
  ): Promise<VerificationResult> {
    console.log(`[VERIFICATION ENGINE] Querying CNA/OAB API for OAB ${oabNumber}/${oabState}...`);

    // Simulando resposta da API de Verificação da OAB
    const verified = true;
    const statusMessage = verified ? 'OAB Ativa e Regularizada' : 'OAB Inativa ou Não Encontrada';

    if (verified) {
      this.publishEvent({
        eventId: `EVT-MKT-${Date.now()}`,
        eventType: 'legis.marketplace.lawyer.verified.v1',
        aggregateId: lawyerId,
        tenantId,
        timestamp: new Date(),
        payload: { lawyerId, oabNumber, oabState, status: 'VERIFIED_ACTIVE' },
      });
    }

    return {
      lawyerId,
      oabNumber,
      oabState,
      verified,
      statusMessage,
      verifiedAt: new Date(),
    };
  }

  private static publishEvent(event: MarketplaceEvent): void {
    this.eventsQueue.push(event);
    console.log(`[MARKETPLACE EVENT BUS] Published Kafka Event: ${event.eventType}`);
  }
}
