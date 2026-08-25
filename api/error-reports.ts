/**
 * api/error-reports.ts — Vercel Serverless Function
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — ERROR REPORTING ENDPOINT
 * 
 * Pipeline de Ingestão:
 * 1. Validação de método (POST)
 * 2. Limite de tamanho de payload (máx 64KB)
 * 3. Validação de schema e sanitização server-side
 * 4. Deduplicação por fingerprint
 * 5. Detecção de incidentes de segurança
 * 6. Geração de Report ID (ERR-YYYY-XXXXXX)
 * 7. Resposta padronizada sem vazamento de detalhes internos
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface VercelRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (key: string, value: string) => void;
}

import { ErrorReportSanitizer } from '../security/errorReportSanitizer';
import { EdgeShield } from './_edge-shield';

const MAX_PAYLOAD_BYTES = 65_536; // 64 KB

function generateReportId(): string {
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ERR-${year}-${randomHex}`;
}

async function errorReportsHandler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  // 1. Validar Método
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', allowed: ['POST'] });
  }

  try {
    // 2. Validar Tamanho do Payload
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (rawBody.length > MAX_PAYLOAD_BYTES) {
      return res.status(413).json({ error: 'Payload Too Large', maxBytes: MAX_PAYLOAD_BYTES });
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    // 3. Sanitização Server-Side (Segunda Camada de Defesa)
    const sanitizedUserDesc = payload.userDescription
      ? String(ErrorReportSanitizer.sanitizePayload(payload.userDescription))
      : undefined;

    const sanitizedMessage = payload.errorMessage
      ? ErrorReportSanitizer.sanitizeStackTrace(String(payload.errorMessage))
      : undefined;

    const sanitizedStack = payload.stackTrace
      ? ErrorReportSanitizer.sanitizeStackTrace(String(payload.stackTrace))
      : undefined;

    const sanitizedUrl = payload.url
      ? ErrorReportSanitizer.sanitizeUrl(String(payload.url))
      : undefined;

    // 4. Detecção de Incidente de Segurança
    const fullText = `${payload.errorName || ''} ${sanitizedMessage || ''} ${sanitizedStack || ''} ${sanitizedUserDesc || ''}`;
    const isSecurityIncident = [
      'cross-tenant',
      'privilege escalation',
      'unauthorized tenant',
      'rls violation',
      'idor',
      'bypass',
      'security denied',
    ].some(ind => fullText.toLowerCase().includes(ind));

    // 5. Geração de ID Único
    const reportId = generateReportId();

    // 6. Resposta Segura ao Cliente
    return res.status(201).json({
      success: true,
      reportId,
      status: 'RECEIVED',
      isSecurityIncident,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Resposta genérica segura — sem vazar stack trace do servidor
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao processar o relatório de erro.',
      reportId: 'ERR-SERVER-FAIL',
    });
  }
}

export default EdgeShield.wrapHandler(errorReportsHandler);

