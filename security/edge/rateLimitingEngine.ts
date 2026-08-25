/**
 * security/edge/rateLimitingEngine.ts — Legis Connect Multi-Dimensional Rate Limiting
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor de limitação de taxa na borda com chave multidimensional:
 * IP + User ID + Tenant ID + Rota + Método + Nível de Risco.
 * Políticas diferenciadas por criticidade de endpoint (Auth, AI, Admin, Upload).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { HttpRequestContext } from './wafEngine';

export type RouteCategory =
  | 'AUTH_LOGIN'
  | 'AUTH_RECOVERY'
  | 'AI_INFERENCE'
  | 'ERROR_REPORTING'
  | 'HEALTH_PROBE'
  | 'ADMIN_API'
  | 'SEARCH_QUERY'
  | 'FILE_UPLOAD'
  | 'WEBHOOK_INGEST'
  | 'GENERAL_API'
  | 'DEFAULT';

export interface RateLimitPolicy {
  category: RouteCategory;
  windowMs: number;
  maxRequests: number;
  burstAllowance: number;
  progressivePenalty: boolean;
  description: string;
}

export interface RateLimitResult {
  allowed: boolean;
  category: RouteCategory;
  key: string;
  limit: number;
  currentCount: number;
  remaining: number;
  resetTimeMs: number;
  retryAfterSeconds?: number;
  headers: Record<string, string>;
}

interface RateBucket {
  count: number;
  firstRequestTs: number;
  violationsCount: number;
}

export class RateLimitingEngine {
  private static readonly POLICIES: Record<RouteCategory, RateLimitPolicy> = {
    AUTH_LOGIN: {
      category: 'AUTH_LOGIN',
      windowMs: 60 * 1000,
      maxRequests: 5,
      burstAllowance: 1,
      progressivePenalty: true,
      description: 'Limite rigoroso para endpoints de autenticação e login.',
    },
    AUTH_RECOVERY: {
      category: 'AUTH_RECOVERY',
      windowMs: 60 * 1000,
      maxRequests: 3,
      burstAllowance: 0,
      progressivePenalty: true,
      description: 'Limite crítico para recuperação de senha e desafios MFA.',
    },
    AI_INFERENCE: {
      category: 'AI_INFERENCE',
      windowMs: 60 * 1000,
      maxRequests: 15,
      burstAllowance: 3,
      progressivePenalty: false,
      description: 'Limite por cota de requisições do motor de Inteligência Artificial.',
    },
    ERROR_REPORTING: {
      category: 'ERROR_REPORTING',
      windowMs: 60 * 1000,
      maxRequests: 20,
      burstAllowance: 5,
      progressivePenalty: false,
      description: 'Limite controlado para ingestão de relatórios de erro.',
    },
    HEALTH_PROBE: {
      category: 'HEALTH_PROBE',
      windowMs: 60 * 1000,
      maxRequests: 120,
      burstAllowance: 20,
      progressivePenalty: false,
      description: 'Alta tolerância para sondas e health checks de monitoramento.',
    },
    ADMIN_API: {
      category: 'ADMIN_API',
      windowMs: 60 * 1000,
      maxRequests: 30,
      burstAllowance: 5,
      progressivePenalty: true,
      description: 'Limite para operações do painel administrativo.',
    },
    SEARCH_QUERY: {
      category: 'SEARCH_QUERY',
      windowMs: 60 * 1000,
      maxRequests: 30,
      burstAllowance: 5,
      progressivePenalty: false,
      description: 'Limite para consultas e buscas globais.',
    },
    FILE_UPLOAD: {
      category: 'FILE_UPLOAD',
      windowMs: 60 * 1000,
      maxRequests: 10,
      burstAllowance: 2,
      progressivePenalty: false,
      description: 'Limite para upload de documentos e anexos.',
    },
    WEBHOOK_INGEST: {
      category: 'WEBHOOK_INGEST',
      windowMs: 60 * 1000,
      maxRequests: 100,
      burstAllowance: 20,
      progressivePenalty: false,
      description: 'Limite para webhooks com autenticação por assinatura HMAC.',
    },
    GENERAL_API: {
      category: 'GENERAL_API',
      windowMs: 60 * 1000,
      maxRequests: 60,
      burstAllowance: 10,
      progressivePenalty: false,
      description: 'Limite padrão para endpoints de API gerais.',
    },
    DEFAULT: {
      category: 'DEFAULT',
      windowMs: 60 * 1000,
      maxRequests: 120,
      burstAllowance: 20,
      progressivePenalty: false,
      description: 'Limite padrão global para rotas estáticas e páginas.',
    },
  };

  private static store = new Map<string, RateBucket>();

  /**
   * Identifica a categoria de rota da requisição.
   */
  public static categorizeRoute(path: string): RouteCategory {
    const normalized = path.toLowerCase();

    if (normalized === '/api/health' || normalized === '/health') return 'HEALTH_PROBE';
    if (normalized.includes('/login') || normalized.includes('/auth/signin')) return 'AUTH_LOGIN';
    if (normalized.includes('/forgot-password') || normalized.includes('/reset-password') || normalized.includes('/mfa')) return 'AUTH_RECOVERY';
    if (normalized.startsWith('/api/gemini') || normalized.startsWith('/ai')) return 'AI_INFERENCE';
    if (normalized.startsWith('/api/error-reports')) return 'ERROR_REPORTING';
    if (normalized.startsWith('/api/admin') || normalized.startsWith('/admin')) return 'ADMIN_API';
    if (normalized.startsWith('/api/upload') || normalized.startsWith('/upload')) return 'FILE_UPLOAD';
    if (normalized.startsWith('/api/webhooks') || normalized.startsWith('/webhooks')) return 'WEBHOOK_INGEST';
    if (normalized.includes('/search')) return 'SEARCH_QUERY';
    if (normalized.startsWith('/api/')) return 'GENERAL_API';

    return 'DEFAULT';
  }

  /**
   * Constrói a chave multidimensional de rate limit.
   */
  public static buildDimensionKey(req: HttpRequestContext, category: RouteCategory): string {
    const ip = req.ip || '0.0.0.0';
    const user = req.userId || 'anon';
    const tenant = req.tenantId || 'global';
    return category + ':' + tenant + ':' + user + ':' + ip;
  }

  /**
   * Avalia a requisição e aplica as regras da política de rate limiting.
   */
  public static checkRateLimit(req: HttpRequestContext): RateLimitResult {
    const now = Date.now();
    const category = this.categorizeRoute(req.path || req.url || '/');
    const policy = this.POLICIES[category];
    const key = this.buildDimensionKey(req, category);

    let bucket = this.store.get(key);

    if (!bucket || now - bucket.firstRequestTs >= policy.windowMs) {
      bucket = { count: 1, firstRequestTs: now, violationsCount: bucket ? bucket.violationsCount : 0 };
      this.store.set(key, bucket);
    } else {
      bucket.count += 1;
    }

    const maxAllowed = policy.maxRequests + policy.burstAllowance;
    const isExceeded = bucket.count > maxAllowed;

    if (isExceeded) {
      bucket.violationsCount += 1;
    }

    const resetTimeMs = bucket.firstRequestTs + policy.windowMs;
    const remaining = Math.max(0, maxAllowed - bucket.count);
    const retryAfterSeconds = isExceeded ? Math.ceil((resetTimeMs - now) / 1000) : undefined;

    const headers: Record<string, string> = {
      'X-RateLimit-Limit': String(maxAllowed),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(Math.ceil(resetTimeMs / 1000)),
    };

    if (retryAfterSeconds) {
      headers['Retry-After'] = String(retryAfterSeconds);
    }

    return {
      allowed: !isExceeded,
      category,
      key,
      limit: maxAllowed,
      currentCount: bucket.count,
      remaining,
      resetTimeMs,
      retryAfterSeconds,
      headers,
    };
  }

  /**
   * Limpa o registro de rate limit para uma chave específica (ex: após login bem sucedido).
   */
  public static resetKey(key: string): void {
    this.store.delete(key);
  }

  /**
   * Limpa todos os buckets (usado para testes unitários).
   */
  public static clearAll(): void {
    this.store.clear();
  }

  /**
   * Retorna a política configurada para uma categoria de rota.
   */
  public static getPolicy(category: RouteCategory): RateLimitPolicy {
    return this.POLICIES[category];
  }
}
