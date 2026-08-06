/**
 * lib/monitoring.ts
 * Nível 10 — Monitoramento de Produção: Sentry + Web Vitals + Health Check
 * Legis Connect — Plataforma Jurídica Online
 */

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export interface AppError {
  id: string;
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
}

export interface WebVitalsMetric {
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: string;
}

export interface DeploymentInfo {
  version: string;
  commitSha: string;
  deployedAt: string;
  environment: 'development' | 'staging' | 'production';
  buildTime: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const IS_PRODUCTION = import.meta.env.PROD;
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Thresholds para Core Web Vitals (ms ou score)
const VITALS_THRESHOLDS = {
  FCP:  { good: 1800, poor: 3000 },
  LCP:  { good: 2500, poor: 4000 },
  FID:  { good: 100,  poor: 300  },
  CLS:  { good: 0.1,  poor: 0.25 },
  TTFB: { good: 800,  poor: 1800 },
  INP:  { good: 200,  poor: 500  },
} as const;

// Fila local de erros (fallback quando Sentry não está configurado)
const errorQueue: AppError[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// Inicialização do monitoramento
// ─────────────────────────────────────────────────────────────────────────────

export function initMonitoring(): void {
  if (!IS_PRODUCTION) {
    console.info('[Monitoring] Modo desenvolvimento — Sentry desativado.');
    return;
  }

  if (!SENTRY_DSN) {
    console.warn('[Monitoring] VITE_SENTRY_DSN não configurado. Usando fila local de erros.');
  } else {
    console.info(`[Monitoring] Sentry inicializado para versão ${APP_VERSION}`);
  }

  // Captura erros globais não tratados
  window.addEventListener('unhandledrejection', (event) => {
    captureError({
      message: `Promise não tratada: ${String(event.reason)}`,
      severity: 'high',
      context: { type: 'unhandledrejection' },
    });
  });

  window.addEventListener('error', (event) => {
    captureError({
      message: event.message,
      stack: event.error?.stack,
      severity: 'high',
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Inicia coleta de Web Vitals
  collectWebVitals();

  console.info('[Monitoring] ✅ Sistema de monitoramento ativo.');
}

// ─────────────────────────────────────────────────────────────────────────────
// Captura de erros
// ─────────────────────────────────────────────────────────────────────────────

export function captureError(params: {
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  severity?: AppError['severity'];
  context?: Record<string, unknown>;
}): string {
  const error: AppError = {
    id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    message: params.message,
    stack: params.stack,
    component: params.component,
    userId: params.userId,
    timestamp: new Date().toISOString(),
    severity: params.severity ?? 'medium',
    context: params.context,
  };

  // Em produção, enviaria para Sentry via fetch
  if (IS_PRODUCTION && SENTRY_DSN) {
    sendToSentry(error).catch(() => {
      errorQueue.push(error);
    });
  } else {
    errorQueue.push(error);
    if (!IS_PRODUCTION) {
      console.error('[Monitoring] Erro capturado:', error);
    }
  }

  return error.id;
}

// Stub assíncrono de envio ao Sentry (a SDK real seria importada pelo vite plugin)
async function sendToSentry(error: AppError): Promise<void> {
  if (!SENTRY_DSN) return;
  // Em produção real: Sentry.captureException(new Error(error.message), { extra: error.context });
  await fetch(SENTRY_DSN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dsn: SENTRY_DSN,
      level: error.severity,
      message: error.message,
      release: APP_VERSION,
      timestamp: error.timestamp,
      extra: error.context,
    }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Web Vitals (Core Web Vitals via PerformanceObserver)
// ─────────────────────────────────────────────────────────────────────────────

function rateMetric(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
  const t = VITALS_THRESHOLDS[name];
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

function reportVital(metric: WebVitalsMetric): void {
  const icon = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
  console.info(`[Web Vitals] ${icon} ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);

  if (IS_PRODUCTION && metric.rating === 'poor') {
    captureError({
      message: `Core Web Vital degradado: ${metric.name} = ${metric.value.toFixed(2)}`,
      severity: 'medium',
      context: { metric },
    });
  }
}

function collectWebVitals(): void {
  if (!('PerformanceObserver' in window)) return;

  try {
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
      const value = last.renderTime || last.loadTime || 0;
      reportVital({ name: 'LCP', value, rating: rateMetric('LCP', value), timestamp: new Date().toISOString() });
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // CLS
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!e.hadRecentInput) clsValue += e.value ?? 0;
      }
      reportVital({ name: 'CLS', value: clsValue, rating: rateMetric('CLS', clsValue), timestamp: new Date().toISOString() });
    }).observe({ type: 'layout-shift', buffered: true });

    // FCP via paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          reportVital({ name: 'FCP', value: entry.startTime, rating: rateMetric('FCP', entry.startTime), timestamp: new Date().toISOString() });
        }
      }
    }).observe({ type: 'paint', buffered: true });

    // TTFB via navigation
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navEntry) {
      const ttfb = navEntry.responseStart - navEntry.requestStart;
      reportVital({ name: 'TTFB', value: ttfb, rating: rateMetric('TTFB', ttfb), timestamp: new Date().toISOString() });
    }
  } catch (e) {
    // PerformanceObserver pode não estar disponível em todos os ambientes
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Health Check endpoint (ping do sistema)
// ─────────────────────────────────────────────────────────────────────────────

export async function runHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'down';
  checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }>;
  timestamp: string;
}> {
  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};

  // 1) Supabase API
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (supabaseUrl) {
    const t0 = performance.now();
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      checks['supabase'] = { ok: res.ok, latencyMs: Math.round(performance.now() - t0) };
    } catch (e) {
      checks['supabase'] = { ok: false, error: String(e) };
    }
  } else {
    checks['supabase'] = { ok: false, error: 'URL não configurada' };
  }

  // 2) Conectividade geral
  checks['network'] = { ok: navigator.onLine };

  // 3) LocalStorage
  try {
    localStorage.setItem('_hc', '1');
    localStorage.removeItem('_hc');
    checks['localStorage'] = { ok: true };
  } catch {
    checks['localStorage'] = { ok: false, error: 'Quota excedida ou bloqueado' };
  }

  // 4) Web Crypto (usado pelo smartContractsEngine)
  checks['webCrypto'] = { ok: typeof window.crypto?.subtle?.digest === 'function' };

  const failures = Object.values(checks).filter(c => !c.ok).length;
  const status = failures === 0 ? 'healthy' : failures <= 1 ? 'degraded' : 'down';

  return { status, checks, timestamp: new Date().toISOString() };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitários exportados
// ─────────────────────────────────────────────────────────────────────────────

/** Retorna a fila local de erros (útil para painel admin) */
export function getErrorQueue(): AppError[] {
  return [...errorQueue];
}

/** Limpa a fila local */
export function clearErrorQueue(): void {
  errorQueue.length = 0;
}

/** Info do deploy atual */
export function getDeploymentInfo(): DeploymentInfo {
  return {
    version: APP_VERSION,
    commitSha: import.meta.env.VITE_COMMIT_SHA || 'local',
    deployedAt: import.meta.env.VITE_DEPLOYED_AT || new Date().toISOString(),
    environment: IS_PRODUCTION ? 'production' : 'development',
    buildTime: performance.timing?.domContentLoadedEventEnd - performance.timing?.navigationStart || 0,
  };
}
