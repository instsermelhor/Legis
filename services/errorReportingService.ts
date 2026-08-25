/**
 * services/errorReportingService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — ERROR REPORTING & INCIDENT MANAGEMENT SERVICE
 * 
 * Motor Client-Side / Service Layer para captura de relatórios de erro,
 * deduplicação por fingerprint, rate limiting, mitigação de incidentes
 * de segurança, resiliência fail-safe e integração com Auditoria e RLS.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  AppError,
  BreadcrumbEntry,
  getBreadcrumbs,
  generateFingerprint,
  generateRequestId,
  getDeploymentInfo,
} from '../lib/monitoring';
import { ErrorReportSanitizer } from '../security/errorReportSanitizer';
import { AuditLogger } from '../security/auditLogger';
import { SystemRole } from '../security/rbac';

export type ErrorReportStatus =
  | 'NEW'
  | 'TRIAGED'
  | 'INVESTIGATING'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'FIXED'
  | 'RETESTING'
  | 'RESOLVED'
  | 'DUPLICATE'
  | 'WONT_FIX';

export type ErrorSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ErrorReportEvent {
  id: string;
  reportId: string;
  actorId: string;
  actorRole: string;
  eventType: 'CREATED' | 'TRIAGED' | 'ASSIGNED' | 'STATUS_CHANGED' | 'COMMENTED' | 'RESOLVED';
  fromStatus?: ErrorReportStatus;
  toStatus?: ErrorReportStatus;
  comment?: string;
  createdAt: string;
}

export interface ErrorReportRecord {
  id: string;
  reportId: string; // ERR-YYYY-XXXXXX
  tenantId: string;
  userId: string;
  userRole: SystemRole;
  status: ErrorReportStatus;
  severity: ErrorSeverity;
  isSecurityIncident: boolean;
  fingerprint: string;
  occurrences: number;
  title: string;
  userDescription?: string;
  url: string;
  componentName?: string;
  moduleName?: string;
  environment: string;
  appVersion: string;
  requestId: string;
  correlationId?: string;
  breadcrumbs: BreadcrumbEntry[];
  errorName?: string;
  errorMessage?: string;
  stackTrace?: string;
  userAgent: string;
  viewport: string;
  screenshotBase64?: string;
  screenshotConsent: boolean;
  assignedTo?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  events: ErrorReportEvent[];
}

export interface SubmitReportInput {
  userDescription?: string;
  error?: unknown;
  componentName?: string;
  moduleName?: string;
  screenshotBase64?: string;
  screenshotConsent?: boolean;
  tenantId?: string;
  userId?: string;
  userRole?: SystemRole;
  correlationId?: string;
  idempotencyKey?: string;
}

const STORAGE_KEY = 'legis_error_reports';
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REPORTS_PER_WINDOW = 5;

// Armazenamento em memória para SSR / testes / cache
let memoryStore: ErrorReportRecord[] = [];
let idempotencySet = new Set<string>();
const userSubmissionTimestamps = new Map<string, number[]>();

function getStoredReports(): ErrorReportRecord[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        memoryStore = JSON.parse(raw);
        return memoryStore;
      }
    }
  } catch {}
  return memoryStore;
}

function saveStoredReports(reports: ErrorReportRecord[]): void {
  memoryStore = reports;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    }
  } catch {}
}

export class ErrorReportingService {
  /**
   * Limpa cache e registros (útil para testes)
   */
  static resetForTesting(): void {
    memoryStore = [];
    idempotencySet.clear();
    userSubmissionTimestamps.clear();
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }

  /**
   * Verifica rate limit por usuário
   */
  static isRateLimited(userId: string): boolean {
    const now = Date.now();
    const timestamps = userSubmissionTimestamps.get(userId) || [];
    const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    userSubmissionTimestamps.set(userId, recent);
    return recent.length >= MAX_REPORTS_PER_WINDOW;
  }

  private static recordSubmission(userId: string): void {
    const now = Date.now();
    const timestamps = userSubmissionTimestamps.get(userId) || [];
    timestamps.push(now);
    userSubmissionTimestamps.set(userId, timestamps);
  }

  /**
   * Detecta se o erro constitui um incidente de segurança
   */
  static detectSecurityIncident(errText: string): boolean {
    const indicators = [
      'cross-tenant',
      'privilege escalation',
      'unauthorized tenant',
      'rls violation',
      'idor',
      'bypass',
      'security denied',
      'access denied',
      'forbidden tenant',
      'security alert',
      'acesso cross-tenant',
    ];
    const lower = errText.toLowerCase();
    return indicators.some(ind => lower.includes(ind));
  }

  /**
   * Classifica automaticamente a severidade do erro
   */
  static classifySeverity(errText: string, isSecurity: boolean): ErrorSeverity {
    if (isSecurity) return 'CRITICAL';
    const lower = errText.toLowerCase();
    if (lower.includes('unauthorized') || lower.includes('unauthenticated') || lower.includes('forbidden')) {
      return 'HIGH';
    }
    if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('500') || lower.includes('database')) {
      return 'MEDIUM';
    }
    if (lower.includes('warning') || lower.includes('deprecated')) {
      return 'LOW';
    }
    return 'MEDIUM';
  }

  /**
   * Gera Report ID único no formato regulamentar ERR-YYYY-XXXXXX
   */
  static generateReportId(): string {
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ERR-${year}-${randomHex}`;
  }

  /**
   * Envia um relatório de erro com sanitização, deduplicação, auditoria e resiliência
   */
  static async submitReport(input: SubmitReportInput): Promise<{
    success: boolean;
    reportId: string;
    isDuplicate?: boolean;
    isSecurityIncident?: boolean;
    error?: string;
  }> {
    try {
      const userId = input.userId || 'anonymous_user';
      const tenantId = input.tenantId || 'tenant_default';
      const userRole = input.userRole || 'client';

      // 1. Rate Limiting Check
      if (this.isRateLimited(userId)) {
        return {
          success: false,
          reportId: '',
          error: 'Limite de envio atingido. Aguarde alguns instantes antes de reportar novamente.',
        };
      }

      // 2. Idempotência
      const idemKey = input.idempotencyKey || `${userId}_${Date.now()}`;
      if (idempotencySet.has(idemKey)) {
        const existing = getStoredReports().find(r => r.requestId === input.idempotencyKey);
        if (existing) {
          return { success: true, reportId: existing.reportId, isDuplicate: true };
        }
      }
      idempotencySet.add(idemKey);

      // 3. Extrair dados do erro
      const rawError = input.error instanceof Error ? input.error : new Error(String(input.error || 'Relato de Usuário'));
      const errorName = rawError.name || 'Error';
      const rawMessage = rawError.message || 'Erro sem mensagem explícita';
      const rawStack = rawError.stack || '';

      // 4. Sanitização LGPD rigorosa
      const errorMessage = ErrorReportSanitizer.sanitizeStackTrace(rawMessage);
      const stackTrace = ErrorReportSanitizer.sanitizeStackTrace(rawStack);
      const currentUrl = typeof window !== 'undefined' ? window.location?.href : 'https://legisconnect.local';
      const sanitizedUrl = ErrorReportSanitizer.sanitizeUrl(currentUrl);
      const userDesc = input.userDescription ? String(ErrorReportSanitizer.sanitizePayload(input.userDescription)) : undefined;

      // 5. Breadcrumbs e Metadados
      const breadcrumbs = (getBreadcrumbs() || []).map(b => ({
        ...b,
        message: ErrorReportSanitizer.sanitizeStackTrace(b.message),
        data: b.data ? (ErrorReportSanitizer.sanitizePayload(b.data) as Record<string, unknown>) : undefined,
      }));

      const deployInfo = getDeploymentInfo();
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js/Test';
      const viewport = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '1920x1080';
      const requestId = generateRequestId();
      const fingerprint = generateFingerprint(rawError, input.componentName, sanitizedUrl);

      // 6. Detecção de Segurança & Severidade
      const fullTextToInspect = `${errorName} ${rawMessage} ${rawStack} ${userDesc || ''}`;
      const isSecurityIncident = this.detectSecurityIncident(fullTextToInspect);
      const severity = this.classifySeverity(fullTextToInspect, isSecurityIncident);

      // 7. Deduplicação por Fingerprint no Tenant
      const reports = getStoredReports();
      const existingReportIndex = reports.findIndex(
        r => r.tenantId === tenantId && r.fingerprint === fingerprint && r.status !== 'RESOLVED'
      );

      let finalReportId: string;

      if (existingReportIndex >= 0) {
        // Incrementa ocorrência do relatório existente
        const existing = reports[existingReportIndex];
        existing.occurrences += 1;
        existing.updatedAt = new Date().toISOString();
        if (isSecurityIncident) existing.isSecurityIncident = true;
        if (severity === 'CRITICAL') existing.severity = 'CRITICAL';

        existing.events.push({
          id: generateRequestId(),
          reportId: existing.reportId,
          actorId: userId,
          actorRole: userRole,
          eventType: 'COMMENTED',
          comment: userDesc || `Ocorrência recorrente detectada (${existing.occurrences}x).`,
          createdAt: new Date().toISOString(),
        });

        reports[existingReportIndex] = existing;
        saveStoredReports(reports);
        finalReportId = existing.reportId;
      } else {
        // Cria novo relatório
        finalReportId = this.generateReportId();
        const newRecord: ErrorReportRecord = {
          id: generateRequestId(),
          reportId: finalReportId,
          tenantId,
          userId,
          userRole,
          status: 'NEW',
          severity,
          isSecurityIncident,
          fingerprint,
          occurrences: 1,
          title: userDesc ? userDesc.slice(0, 100) : `${errorName}: ${errorMessage.slice(0, 80)}`,
          userDescription: userDesc,
          url: sanitizedUrl,
          componentName: input.componentName,
          moduleName: input.moduleName || 'general',
          environment: deployInfo.environment,
          appVersion: deployInfo.version,
          requestId,
          correlationId: input.correlationId,
          breadcrumbs,
          errorName,
          errorMessage,
          stackTrace,
          userAgent,
          viewport,
          screenshotBase64: input.screenshotConsent ? input.screenshotBase64 : undefined,
          screenshotConsent: !!input.screenshotConsent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          events: [
            {
              id: generateRequestId(),
              reportId: finalReportId,
              actorId: userId,
              actorRole: userRole,
              eventType: 'CREATED',
              comment: userDesc || 'Relatório de erro registrado via cliente.',
              createdAt: new Date().toISOString(),
            },
          ],
        };

        reports.unshift(newRecord);
        saveStoredReports(reports.slice(0, 200)); // manter até 200 relatórios
      }

      this.recordSubmission(userId);

      // 8. Registro de Auditoria
      AuditLogger.log({
        action: 'ERROR_REPORTED',
        actorId: userId,
        actorRole: userRole,
        targetId: finalReportId,
        targetType: 'error_report',
        details: JSON.stringify({
          reportId: finalReportId,
          severity,
          moduleName: input.moduleName,
          isSecurityIncident,
          occurrences: existingReportIndex >= 0 ? reports[existingReportIndex].occurrences : 1,
        }),
        severity: isSecurityIncident ? 'CRITICAL' : severity === 'HIGH' ? 'ERROR' : 'INFO',
      });

      if (isSecurityIncident) {
        AuditLogger.log({
          action: 'SECURITY_INCIDENT_FLAGGED',
          actorId: 'SYSTEM_SENTINEL',
          actorRole: 'super_admin',
          targetId: finalReportId,
          targetType: 'security_incident',
          details: JSON.stringify({
            reportId: finalReportId,
            tenantId,
            reason: 'Possível violação de segurança/isolamento detectada em stack de erro.',
          }),
          severity: 'CRITICAL',
        });
      }

      return {
        success: true,
        reportId: finalReportId,
        isDuplicate: existingReportIndex >= 0,
        isSecurityIncident,
      };
    } catch (err: any) {
      // FAIL-SAFE: Nunca propagar erro de relatório para a UI
      console.error('[ErrorReportingService] Falha segura ao submeter erro:', err);
      return {
        success: false,
        reportId: 'ERR-FAILSAFE',
        error: err?.message || 'Erro inesperado no sistema de relatório.',
      };
    }
  }

  /**
   * Captura erro automaticamente a partir de Error Boundary
   */
  static async captureFromBoundary(
    error: Error,
    componentStack?: string,
    moduleName?: string,
    context?: { tenantId?: string; userId?: string; userRole?: SystemRole }
  ): Promise<string> {
    const res = await this.submitReport({
      error,
      componentName: componentStack?.split('\n')?.[1]?.trim() || 'ErrorBoundary',
      moduleName: moduleName || 'ui_boundary',
      tenantId: context?.tenantId,
      userId: context?.userId,
      userRole: context?.userRole,
    });
    return res.reportId;
  }

  /**
   * Lista relatórios aplicando RBAC e Isolamento Multi-Tenant
   */
  static getReports(requestingTenantId: string, requestingRole: SystemRole): ErrorReportRecord[] {
    const all = getStoredReports();
    // super_admin pode ver todos os tenants
    if (requestingRole === 'super_admin') {
      return all;
    }
    // Demais papéis: apenas relatórios do seu próprio tenant
    return all.filter(r => r.tenantId === requestingTenantId);
  }

  /**
   * Obtém relatório por ID respeitando RBAC
   */
  static getReportById(reportId: string, requestingTenantId: string, requestingRole: SystemRole): ErrorReportRecord | null {
    const reports = this.getReports(requestingTenantId, requestingRole);
    const found = reports.find(r => r.reportId === reportId || r.id === reportId);
    
    if (found) {
      AuditLogger.log({
        action: 'REPORT_VIEWED',
        actorId: 'admin_user',
        actorRole: requestingRole,
        targetId: reportId,
        targetType: 'error_report',
        details: JSON.stringify({ reportId, tenantId: found.tenantId }),
      });
    }

    return found || null;
  }

  /**
   * Atualiza status do relatório com registro de evento e auditoria
   */
  static updateReportStatus(
    reportId: string,
    newStatus: ErrorReportStatus,
    actorId: string,
    actorRole: SystemRole,
    comment?: string,
    assignedTo?: string
  ): boolean {
    const reports = getStoredReports();
    const index = reports.findIndex(r => r.reportId === reportId || r.id === reportId);
    if (index < 0) return false;

    const report = reports[index];
    const previousStatus = report.status;
    report.status = newStatus;
    report.updatedAt = new Date().toISOString();
    if (assignedTo) report.assignedTo = assignedTo;
    if (newStatus === 'RESOLVED') report.resolvedAt = new Date().toISOString();

    report.events.push({
      id: generateRequestId(),
      reportId: report.reportId,
      actorId,
      actorRole,
      eventType: 'STATUS_CHANGED',
      fromStatus: previousStatus,
      toStatus: newStatus,
      comment: comment ? ErrorReportSanitizer.sanitizeStackTrace(comment) : undefined,
      createdAt: new Date().toISOString(),
    });

    reports[index] = report;
    saveStoredReports(reports);

    AuditLogger.log({
      action: newStatus === 'RESOLVED' ? 'REPORT_RESOLVED' : 'REPORT_STATUS_CHANGED',
      actorId,
      actorRole,
      targetId: report.reportId,
      targetType: 'error_report',
      details: JSON.stringify({ from: previousStatus, to: newStatus, comment }),
    });

    return true;
  }
}
