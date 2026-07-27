/**
 * Legis Connect — Legal Services Operations Engine
 * Padrão: Smart Scheduling & Intelligent Matching Engine (Prompt 250 - Etapa 2 & 4)
 * Implementação dos serviços de agendamento inteligente, pareamento por IA e assinatura de contratos
 */

export interface ScheduleAppointmentRequest {
  tenantId: string;
  lawyerId: string;
  clientId: string;
  scheduledTime: Date;
  durationMinutes: number;
}

export interface MatchingQuery {
  legalCategory: string;
  city: string;
  state: string;
  maxHourlyRateBrl?: number;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
}

export interface MatchScore {
  lawyerId: string;
  matchScorePct: number;
  matchReasons: string[];
}

export interface ServicesKafkaEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  tenantId: string;
  timestamp: Date;
  payload: Record<string, any>;
}

export class LegalServicesEngine {
  private static eventsQueue: ServicesKafkaEvent[] = [];

  public static async calculateMatches(query: MatchingQuery): Promise<MatchScore[]> {
    console.log(`[INTELLIGENT MATCHING ENGINE] Calculating matches for category "${query.legalCategory}" in ${query.city}/${query.state}...`);

    // Simulando algoritmo de matching
    const matches: MatchScore[] = [
      {
        lawyerId: 'LWY-748201',
        matchScorePct: 96.5,
        matchReasons: ['Especialidade OAB idêntica', 'Disponibilidade imediata em 2h', 'Honorário dentro do limite'],
      },
      {
        lawyerId: 'LWY-902144',
        matchScorePct: 88.0,
        matchReasons: ['Especialidade correlata', 'Avaliação 5.0 estrelas'],
      },
    ];

    return matches;
  }

  public static async scheduleAppointment(request: ScheduleAppointmentRequest): Promise<string> {
    const appointmentId = `APT-${Date.now()}`;
    console.log(`[SMART SCHEDULING ENGINE] Reserving slot for Lawyer ${request.lawyerId} and Client ${request.clientId}...`);

    // Publicar evento Kafka
    this.publishEvent({
      eventId: `EVT-SRV-${Date.now()}`,
      eventType: 'legis.services.appointment.confirmed.v1',
      aggregateId: appointmentId,
      tenantId: request.tenantId,
      timestamp: new Date(),
      payload: { appointmentId, lawyerId: request.lawyerId, clientId: request.clientId, scheduledTime: request.scheduledTime },
    });

    return appointmentId;
  }

  public static async signServiceContract(appointmentId: string, tenantId: string, lawyerId: string, clientId: string): Promise<string> {
    const contractId = `CTR-${Date.now()}`;
    console.log(`[SERVICE CONTRACT ENGINE] Signing digital contract ${contractId} for Appointment ${appointmentId}...`);

    this.publishEvent({
      eventId: `EVT-SRV-${Date.now()}`,
      eventType: 'legis.services.contract.signed.v1',
      aggregateId: contractId,
      tenantId,
      timestamp: new Date(),
      payload: { contractId, appointmentId, lawyerId, clientId, signedAt: new Date() },
    });

    return contractId;
  }

  private static publishEvent(event: ServicesKafkaEvent): void {
    this.eventsQueue.push(event);
    console.log(`[SERVICES EVENT BUS] Published Kafka Event: ${event.eventType}`);
  }
}
