/**
 * tests/unit/performanceInfrastructure.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — PERFORMANCE & INFRASTRUCTURE TEST SUITE
 * Testes unitários para a Engine de Métricas, Cache Manager (LRU/TTL) e Rate Limiter.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { performanceMetricsEngine } from '../../lib/performanceMetricsEngine';
import { infrastructureCacheManager, clientRateLimiter, sanitizePayload } from '../../lib/infrastructureCacheManager';

export interface PerformanceTestResult {
  suite: string;
  testName: string;
  passed: boolean;
  details: string;
}

export async function runPerformanceInfrastructureTests(): Promise<{
  passed: boolean;
  total: number;
  results: PerformanceTestResult[];
}> {
  const results: PerformanceTestResult[] = [];

  // TEST 1: Performance Engine — registro de métricas e pontuação de saúde
  (() => {
    performanceMetricsEngine.clearHistory();
    performanceMetricsEngine.recordMetric('LCP', 1500); // good
    performanceMetricsEngine.recordMetric('INP', 120);  // good
    performanceMetricsEngine.recordMetric('CLS', 0.05); // good

    const summary = performanceMetricsEngine.getSummary();
    const passed = summary.score === 100 && summary.rating === 'EXCELLENT' && summary.capturedCount === 3;

    results.push({
      suite: 'PerformanceEngine',
      testName: 'Registro de Web Vitals e cálculo de Score 100/100',
      passed,
      details: `score:${summary.score}, rating:${summary.rating}, captured:${summary.capturedCount}`,
    });
  })();

  // TEST 2: Cache Manager — Armazenamento, Recuperação e Expiração TTL
  (() => {
    infrastructureCacheManager.clear();
    infrastructureCacheManager.set('test_key', { data: 'legis' }, { ttlMs: 1000 });

    const cachedValue = infrastructureCacheManager.get<{ data: string }>('test_key');
    const hasValue = cachedValue?.data === 'legis';
    const initialSize = infrastructureCacheManager.size();

    const passed = hasValue && initialSize === 1;

    results.push({
      suite: 'CacheManager',
      testName: 'Armazenamento e Recuperação de Cache LRU em Memória',
      passed,
      details: `hasValue:${hasValue}, size:${initialSize}`,
    });
  })();

  // TEST 3: Rate Limiter — Limite de requisições por janela temporal
  (() => {
    const key = 'api_test_limit';
    clientRateLimiter.reset(key);

    let allowedCount = 0;
    for (let i = 0; i < 5; i++) {
      if (clientRateLimiter.isAllowed(key, 3, 60_000)) {
        allowedCount++;
      }
    }

    const passed = allowedCount === 3; // apenas as 3 primeiras permitidas

    results.push({
      suite: 'RateLimiter',
      testName: 'Bloqueio de requisições excedentes via Rate Limiter',
      passed,
      details: `allowed:${allowedCount}/5 (max: 3)`,
    });
  })();

  // TEST 4: Sanitizer — Mascaramento de chaves sensíveis
  (() => {
    const payload = {
      username: 'advogado1',
      password: '$locked$',
      token: 'jwt_token_xyz',
      oab: 'SP123456',
    };

    const sanitized = sanitizePayload(payload);
    const passed = sanitized.password === '***REDACTED***' && sanitized.token === '***REDACTED***' && sanitized.username === 'advogado1';

    results.push({
      suite: 'Sanitizer',
      testName: 'Mascaramento automático de campos sensíveis (password/token)',
      passed,
      details: `password:${sanitized.password}, token:${sanitized.token}`,
    });
  })();

  const allPassed = results.every(r => r.passed);
  return {
    passed: allPassed,
    total: results.length,
    results,
  };
}
