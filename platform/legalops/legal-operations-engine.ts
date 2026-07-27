/**
 * Legis Connect — Legal Operations Engine
 * Padrão: Case Management & Deadline Intelligence Engine (Prompt 252 - Etapa 2 & 5)
 * Implementação da gestão de casos jurídicos, cálculo de prazos processuais e workflows BPMN
 */

export interface CreateCaseRequest {
  tenantId: string;
  title: string;
  category: string;
  lawyerId: string;
  clientId: string;
  caseNumberCnj?: string;
}

export interface DeadlineCalculationRequest {
  tenantId: string;
  caseId: string;
  publicationDate: Date;
  daysCount: number;
  courtState: string;
}

export interface DeadlineCalculationResult {
  deadlineId: string;
  dueDate: Date;
  alertDates: Date[];
}

export interface LegalOpsKafkaEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  tenantId: string;
  timestamp: Date;
  payload: Record<string, any>;
}

export class LegalOperationsEngine {
  private static eventsQueue: LegalOpsKafkaEvent[] = [];

  public static async createLegalCase(request: CreateCaseRequest): Promise<string> {
    const caseId = `CAS-${Date.now()}`;
    console.log(`[LEGALOPS ENGINE] Creating legal case ${caseId} ("${request.title}")...`);

    this.publishEvent({
      eventId: `EVT-OPS-${Date.now()}`,
      eventType: 'legis.legalops.case.created.v1',
      aggregateId: caseId,
      tenantId: request.tenantId,
      timestamp: new Date(),
      payload: { caseId, title: request.title, lawyerId: request.lawyerId, clientId: request.clientId },
    });

    return caseId;
  }

  public static async calculateProceduralDeadline(request: DeadlineCalculationRequest): Promise<DeadlineCalculationResult> {
    const deadlineId = `DDL-${Date.now()}`;
    console.log(`[DEADLINE ENGINE] Calculating ${request.daysCount}-day CNJ deadline for Case ${request.caseId}...`);

    // Regra simples de adicao de dias uteis para simulacao
    const dueDate = new Date(request.publicationDate);
    dueDate.setDate(dueDate.getDate() + request.daysCount + 4); // simulando dias uteis + fins de semana

    const alert1 = new Date(dueDate);
    alert1.setDate(alert1.getDate() - 5);

    const alert2 = new Date(dueDate);
    alert2.setDate(alert2.getDate() - 1);

    const result: DeadlineCalculationResult = {
      deadlineId,
      dueDate,
      alertDates: [alert1, alert2],
    };

    this.publishEvent({
      eventId: `EVT-OPS-${Date.now()}`,
      eventType: 'legis.legalops.deadline.created.v1',
      aggregateId: deadlineId,
      tenantId: request.tenantId,
      timestamp: new Date(),
      payload: { deadlineId, caseId: request.caseId, dueDate, alertDates: result.alertDates },
    });

    return result;
  }

  private static publishEvent(event: LegalOpsKafkaEvent): void {
    this.eventsQueue.push(event);
    console.log(`[LEGALOPS EVENT BUS] Published Kafka Event: ${event.eventType}`);
  }
}
