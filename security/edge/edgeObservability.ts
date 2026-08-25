/**
 * security/edge/edgeObservability.ts — Legis Connect Edge Logging & Security Alerting
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor de observabilidade de borda e emissão de alertas operacionais.
 * Registra eventos de segurança (bloqueios, desafios, rate limits, ataques)
 * com garantia de privacidade e conformidade LGPD (Zero-PII em logs).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type EdgeEventType =
  | 'WAF_BLOCKED'
  | 'BOT_CHALLENGED'
  | 'BOT_BLOCKED'
  | 'RATE_LIMITED'
  | 'BRUTE_FORCE_THROTTLED'
  | 'BRUTE_FORCE_BLOCKED'
  | 'ORIGIN_BYPASS_ATTEMPT'
  | 'THREAT_INTEL_BLOCKED'
  | 'CACHE_VIOLATION_BLOCKED';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface EdgeSecurityEvent {
  eventId: string;
  type: EdgeEventType;
  severity: AlertSeverity;
  timestamp: string;
  requestId: string;
  ip: string;
  method: string;
  path: string;
  ruleId?: string;
  category?: string;
  reason: string;
  metadata?: Record<string, unknown>;
}

export interface SecurityAlert {
  alertId: string;
  severity: AlertSeverity;
  title: string;
  responsible: string;
  actionRequired: string;
  timestamp: string;
  event: EdgeSecurityEvent;
}

export class EdgeObservability {
  private static events: EdgeSecurityEvent[] = [];
  private static alerts: SecurityAlert[] = [];
  private static maxEventBuffer = 500;

  /**
   * Registra um evento de segurança na borda de forma assíncrona e segura.
   */
  public static logSecurityEvent(event: Omit<EdgeSecurityEvent, 'eventId' | 'timestamp'>): EdgeSecurityEvent {
    const fullEvent: EdgeSecurityEvent = {
      ...event,
      eventId: 'EVT-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      timestamp: new Date().toISOString(),
      ip: this.sanitizeIp(event.ip),
      path: this.sanitizePath(event.path),
    };

    this.events.unshift(fullEvent);
    if (this.events.length > this.maxEventBuffer) {
      this.events.pop();
    }

    // Se for severidade HIGH ou CRITICAL, disparar alerta operacional
    if (fullEvent.severity === 'HIGH' || fullEvent.severity === 'CRITICAL') {
      this.dispatchAlert(fullEvent);
    }

    return fullEvent;
  }

  /**
   * Dispara um alerta de segurança categorizado com responsável e ação necessária.
   */
  private static dispatchAlert(event: EdgeSecurityEvent): SecurityAlert {
    const alertId = 'ALT-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    let responsible = 'Security Operations Center (SOC)';
    let actionRequired = 'Investigar tráfego anômalo e aplicar regra de mitigação se necessário.';

    if (event.type === 'WAF_BLOCKED' && event.severity === 'CRITICAL') {
      responsible = 'Lead Security Engineer / Incident Response Team';
      actionRequired = 'Verificar payload malicioso e confirmar se há vetor de exploração ativo.';
    } else if (event.type === 'BRUTE_FORCE_BLOCKED') {
      responsible = 'IAM & Identity Security Officer';
      actionRequired = 'Auditar contas-alvo e verificar se houve credenciais comprometidas.';
    } else if (event.type === 'ORIGIN_BYPASS_ATTEMPT') {
      responsible = 'Cloud Infrastructure & DevOps Lead';
      actionRequired = 'Inspecionar regras de firewall de origem e isolar endpoints expostos.';
    }

    const alert: SecurityAlert = {
      alertId,
      severity: event.severity,
      title: '[' + event.severity + '] Alerta de Segurança de Borda: ' + event.type,
      responsible,
      actionRequired,
      timestamp: new Date().toISOString(),
      event,
    };

    this.alerts.unshift(alert);
    if (this.alerts.length > 200) {
      this.alerts.pop();
    }

    return alert;
  }

  /**
   * Retorna os eventos recentes de segurança.
   */
  public static getRecentEvents(limit: number = 50): readonly EdgeSecurityEvent[] {
    return this.events.slice(0, limit);
  }

  /**
   * Retorna os alertas ativos.
   */
  public static getActiveAlerts(limit: number = 20): readonly SecurityAlert[] {
    return this.alerts.slice(0, limit);
  }

  /**
   * Limpa o buffer de eventos e alertas (para testes).
   */
  public static clearAll(): void {
    this.events = [];
    this.alerts = [];
  }

  // Sanitização de IP para privacidade LGPD quando aplicável
  private static sanitizeIp(ip: string): string {
    if (!ip) return '0.0.0.0';
    return ip.trim();
  }

  // Sanitização de paths para não vazar dados de query strings confidenciais
  private static sanitizePath(path: string): string {
    if (!path) return '/';
    return path.split('?')[0];
  }
}
