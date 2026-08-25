/**
 * api/_edge-shield.ts — Legis Connect Master Edge Shield Middleware Wrapper
 * ─────────────────────────────────────────────────────────────────────────────
 * Middleware de borda que encapsula endpoints serverless e APIs da Legis Connect.
 * Executa todas as camadas do Escudo de Borda em sequência:
 * 
 *   1. Origin Cloaking Check (X-Legis-Edge-Secret)
 *   2. Threat Intelligence & IP Denylist
 *   3. Bot Management & Bot Fight (Crawler allowlist / Malicious bot block)
 *   4. WAF Inspection (SQLi, XSS, RCE, Path Traversal, Scanners)
 *   5. Multi-Dimensional Rate Limiting (IP + User + Tenant + Route + Risk)
 *   6. Brute Force Protection (em rotas de autenticação)
 *   7. Cache Guard & Security Headers Injection
 *   8. Observabilidade & Logging
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { WafEngine, HttpRequestContext, WafInspectionResult } from '../security/edge/wafEngine';
import { BotManagementEngine, BotClassificationResult } from '../security/edge/botManagementEngine';
import { RateLimitingEngine, RateLimitResult } from '../security/edge/rateLimitingEngine';
import { BruteForceProtection, BruteForceAssessment } from '../security/edge/bruteForceProtection';
import { OriginCloakProtection, OriginCloakValidation } from '../security/edge/originCloakProtection';
import { ThreatIntelligence, ThreatAssessment } from '../security/edge/threatIntelligence';
import { MultiTenantCacheGuard } from '../security/edge/multiTenantCacheGuard';
import { EdgeObservability } from '../security/edge/edgeObservability';

export interface VercelLikeRequest {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined> | string;
  body?: unknown;
  socket?: { remoteAddress?: string };
}

export interface VercelLikeResponse {
  status: (code: number) => VercelLikeResponse;
  json: (data: unknown) => void;
  setHeader: (key: string, value: string) => void;
}

export interface ShieldEvaluationSummary {
  allowed: boolean;
  statusCode: number;
  blockedReason?: string;
  threatAssessment: ThreatAssessment;
  botAssessment: BotClassificationResult;
  wafAssessment: WafInspectionResult;
  rateLimitAssessment: RateLimitResult;
  bruteForceAssessment?: BruteForceAssessment;
  originValidation: OriginCloakValidation;
  appliedHeaders: Record<string, string>;
  requestId: string;
}

export class EdgeShield {
  /**
   * Avalia uma requisição completa contra todas as camadas do Escudo de Borda.
   */
  public static evaluateRequest(req: VercelLikeRequest): ShieldEvaluationSummary {
    const requestId = 'REQ-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const method = (req.method || 'GET').toUpperCase();
    const url = req.url || '/';
    const path = url.split('?')[0];
    const headers = req.headers || {};
    const ip = this.extractClientIp(req);
    const tenantId = this.getHeaderValue(headers, 'x-tenant-id');
    const userId = this.getHeaderValue(headers, 'x-user-id');

    const context: HttpRequestContext = {
      method,
      url,
      path,
      headers,
      query: req.query,
      body: req.body,
      ip,
      tenantId,
      userId,
    };

    const appliedHeaders: Record<string, string> = {
      'X-Request-ID': requestId,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    };

    // ── Camada 1: Origin Cloaking Check ──────────────────────────────────────
    const originValidation = OriginCloakProtection.validateOriginRequest(context);
    if (!originValidation.valid) {
      EdgeObservability.logSecurityEvent({
        type: 'ORIGIN_BYPASS_ATTEMPT',
        severity: 'CRITICAL',
        requestId,
        ip,
        method,
        path,
        reason: originValidation.reason || 'Tentativa de acesso direto à origem detectada.',
      });
      return {
        allowed: false,
        statusCode: 403,
        blockedReason: originValidation.reason,
        threatAssessment: { ip, isThreat: true, isAllowlisted: false, action: 'BLOCK' },
        botAssessment: { category: 'SUSPICIOUS_BOT', isBot: true, isMalicious: false, isLegitimate: false, action: 'BLOCK', confidenceScore: 100, reason: '', detectedSignatures: [] },
        wafAssessment: { allowed: false, action: 'BLOCK', blocked: true, challenged: false, matchedRules: [], inspectedAt: '', latencyMs: 0 },
        rateLimitAssessment: { allowed: false, category: 'DEFAULT', key: '', limit: 0, currentCount: 0, remaining: 0, resetTimeMs: 0, headers: {} },
        originValidation,
        appliedHeaders,
        requestId,
      };
    }

    // ── Camada 2: Threat Intelligence & IP Denylist ──────────────────────────
    const threatAssessment = ThreatIntelligence.checkIpReputation(ip);
    if (threatAssessment.action === 'BLOCK') {
      EdgeObservability.logSecurityEvent({
        type: 'THREAT_INTEL_BLOCKED',
        severity: 'HIGH',
        requestId,
        ip,
        method,
        path,
        reason: threatAssessment.reason || 'IP listado em base de ameaças.',
      });
      return {
        allowed: false,
        statusCode: 403,
        blockedReason: threatAssessment.reason,
        threatAssessment,
        botAssessment: { category: 'MALICIOUS_BOT', isBot: true, isMalicious: true, isLegitimate: false, action: 'BLOCK', confidenceScore: 99, reason: '', detectedSignatures: [] },
        wafAssessment: { allowed: false, action: 'BLOCK', blocked: true, challenged: false, matchedRules: [], inspectedAt: '', latencyMs: 0 },
        rateLimitAssessment: { allowed: false, category: 'DEFAULT', key: '', limit: 0, currentCount: 0, remaining: 0, resetTimeMs: 0, headers: {} },
        originValidation,
        appliedHeaders,
        requestId,
      };
    }

    // ── Camada 3: Bot Management & Bot Fight ────────────────────────────────
    const botAssessment = BotManagementEngine.classifyTraffic(context);
    if (botAssessment.action === 'BLOCK') {
      EdgeObservability.logSecurityEvent({
        type: 'BOT_BLOCKED',
        severity: 'HIGH',
        requestId,
        ip,
        method,
        path,
        reason: botAssessment.reason,
      });
      return {
        allowed: false,
        statusCode: 403,
        blockedReason: botAssessment.reason,
        threatAssessment,
        botAssessment,
        wafAssessment: { allowed: false, action: 'BLOCK', blocked: true, challenged: false, matchedRules: [], inspectedAt: '', latencyMs: 0 },
        rateLimitAssessment: { allowed: false, category: 'DEFAULT', key: '', limit: 0, currentCount: 0, remaining: 0, resetTimeMs: 0, headers: {} },
        originValidation,
        appliedHeaders,
        requestId,
      };
    }

    // ── Camada 4: WAF Inspection (SQLi, XSS, RCE, Path Traversal) ───────────
    const wafAssessment = WafEngine.inspectRequest(context);
    if (wafAssessment.blocked) {
      const primaryRule = wafAssessment.matchedRules[0];
      EdgeObservability.logSecurityEvent({
        type: 'WAF_BLOCKED',
        severity: primaryRule ? primaryRule.severity : 'CRITICAL',
        requestId,
        ip,
        method,
        path,
        ruleId: primaryRule?.ruleId,
        category: primaryRule?.category,
        reason: wafAssessment.blockReason || 'Bloqueio de segurança WAF disparado.',
      });
      return {
        allowed: false,
        statusCode: 403,
        blockedReason: wafAssessment.blockReason,
        threatAssessment,
        botAssessment,
        wafAssessment,
        rateLimitAssessment: { allowed: false, category: 'DEFAULT', key: '', limit: 0, currentCount: 0, remaining: 0, resetTimeMs: 0, headers: {} },
        originValidation,
        appliedHeaders,
        requestId,
      };
    }

    // ── Camada 5: Multi-Dimensional Rate Limiting ────────────────────────────
    const rateLimitAssessment = RateLimitingEngine.checkRateLimit(context);
    Object.assign(appliedHeaders, rateLimitAssessment.headers);

    if (!rateLimitAssessment.allowed) {
      EdgeObservability.logSecurityEvent({
        type: 'RATE_LIMITED',
        severity: 'MEDIUM',
        requestId,
        ip,
        method,
        path,
        category: rateLimitAssessment.category,
        reason: 'Limite de requisições excedido para a categoria: ' + rateLimitAssessment.category,
      });
      return {
        allowed: false,
        statusCode: 429,
        blockedReason: 'Muitas requisições. Tente novamente em ' + (rateLimitAssessment.retryAfterSeconds || 60) + ' segundos.',
        threatAssessment,
        botAssessment,
        wafAssessment,
        rateLimitAssessment,
        originValidation,
        appliedHeaders,
        requestId,
      };
    }

    // ── Camada 6: Anti-Brute Force (Se rota de autenticação) ────────────────
    let bruteForceAssessment: BruteForceAssessment | undefined = undefined;
    if (rateLimitAssessment.category === 'AUTH_LOGIN' || rateLimitAssessment.category === 'AUTH_RECOVERY') {
      bruteForceAssessment = BruteForceProtection.evaluateRequest(ip);
      if (bruteForceAssessment.blocked) {
        EdgeObservability.logSecurityEvent({
          type: 'BRUTE_FORCE_BLOCKED',
          severity: 'HIGH',
          requestId,
          ip,
          method,
          path,
          reason: bruteForceAssessment.reason,
        });
        return {
          allowed: false,
          statusCode: 429,
          blockedReason: bruteForceAssessment.reason,
          threatAssessment,
          botAssessment,
          wafAssessment,
          rateLimitAssessment,
          bruteForceAssessment,
          originValidation,
          appliedHeaders,
          requestId,
        };
      }
    }

    // ── Camada 7: Cache Guard & Cache Isolation ─────────────────────────────
    const hasAuthOrTenant = Boolean(headers['authorization'] || tenantId || userId);
    const cachePolicy = MultiTenantCacheGuard.evaluateCachePolicy(path, hasAuthOrTenant);
    appliedHeaders['Cache-Control'] = cachePolicy.cacheControl;
    appliedHeaders['Vary'] = cachePolicy.varyHeader;

    return {
      allowed: true,
      statusCode: 200,
      threatAssessment,
      botAssessment,
      wafAssessment,
      rateLimitAssessment,
      bruteForceAssessment,
      originValidation,
      appliedHeaders,
      requestId,
    };
  }

  /**
   * Wrapper de alta ordem para proteger handlers de funções serverless da Vercel.
   */
  public static wrapHandler<TReq extends VercelLikeRequest, TRes extends VercelLikeResponse>(
    handler: (req: TReq, res: TRes) => Promise<unknown> | unknown
  ) {
    return async (req: TReq, res: TRes) => {
      const evaluation = EdgeShield.evaluateRequest(req);

      // Injeta headers de segurança e controle de taxa
      for (const [key, value] of Object.entries(evaluation.appliedHeaders)) {
        res.setHeader(key, value);
      }

      if (!evaluation.allowed) {
        return res.status(evaluation.statusCode).json({
          success: false,
          error: evaluation.blockedReason || 'Requisição bloqueada pelo Escudo de Borda.',
          code: 'EDGE_SHIELD_BLOCKED',
          requestId: evaluation.requestId,
        });
      }

      return handler(req, res);
    };
  }

  private static extractClientIp(req: VercelLikeRequest): string {
    const headers = req.headers || {};
    const forwarded = this.getHeaderValue(headers, 'x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    const realIp = this.getHeaderValue(headers, 'x-real-ip');
    if (realIp) return realIp.trim();
    return req.socket?.remoteAddress || '127.0.0.1';
  }

  private static getHeaderValue(headers: Record<string, string | string[] | undefined>, name: string): string {
    const val = headers[name.toLowerCase()] || headers[name];
    if (Array.isArray(val)) return val.join(' ');
    return typeof val === 'string' ? val : '';
  }
}
