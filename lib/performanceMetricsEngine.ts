/**
 * lib/performanceMetricsEngine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — PERFORMANCE & WEB VITALS METRICS ENGINE
 *
 * Captura, calcula e gerencia métricas de desempenho em tempo real (Core Web Vitals):
 *   - LCP (Largest Contentful Paint) < 2500ms (Good)
 *   - INP (Interaction to Next Paint) < 200ms (Good)
 *   - CLS (Cumulative Layout Shift) < 0.1 (Good)
 *   - TTFB (Time to First Byte) < 800ms (Good)
 *   - FCP (First Contentful Paint) < 1800ms (Good)
 *
 * Calcula o Performance Health Score (0-100) e mantêm um histórico em memória.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface MetricEntry {
  name: 'LCP' | 'INP' | 'CLS' | 'TTFB' | 'FCP' | 'FID';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: string;
}

export interface PerformanceSummary {
  score: number;
  rating: 'EXCELLENT' | 'SATISFACTORY' | 'POOR';
  metrics: Record<string, MetricEntry>;
  capturedCount: number;
  lastUpdated: string;
}

const STORAGE_KEY = 'legis_performance_metrics';
const MAX_ENTRIES = 100;

// Thresholds baseados nas diretrizes do Google Core Web Vitals
const THRESHOLDS: Record<MetricEntry['name'], { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
  FID: { good: 100, poor: 300 },
};

function determineRating(name: MetricEntry['name'], value: number): MetricEntry['rating'] {
  const thresh = THRESHOLDS[name];
  if (!thresh) return 'good';
  if (value <= thresh.good) return 'good';
  if (value <= thresh.poor) return 'needs-improvement';
  return 'poor';
}

class PerformanceMetricsEngine {
  private metricsMap: Map<string, MetricEntry> = new Map();
  private history: MetricEntry[] = [];
  private isInitialized = false;

  constructor() {
    this.loadFromStorage();
  }

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;
    this.observeVitals();
  }

  public recordMetric(name: MetricEntry['name'], value: number): MetricEntry {
    const roundedValue = name === 'CLS' ? Math.round(value * 1000) / 1000 : Math.round(value);
    const rating = determineRating(name, roundedValue);

    const entry: MetricEntry = {
      name,
      value: roundedValue,
      rating,
      timestamp: new Date().toISOString(),
    };

    this.metricsMap.set(name, entry);
    this.history.unshift(entry);
    if (this.history.length > MAX_ENTRIES) {
      this.history.pop();
    }

    this.saveToStorage();
    return entry;
  }

  public getSummary(): PerformanceSummary {
    const metrics: Record<string, MetricEntry> = {};
    let totalScorePoints = 0;
    let metricCount = 0;

    this.metricsMap.forEach((entry, name) => {
      metrics[name] = entry;
      metricCount++;
      if (entry.rating === 'good') totalScorePoints += 100;
      else if (entry.rating === 'needs-improvement') totalScorePoints += 60;
      else totalScorePoints += 20;
    });

    const score = metricCount > 0 ? Math.round(totalScorePoints / metricCount) : 100;
    const rating = score >= 90 ? 'EXCELLENT' : score >= 70 ? 'SATISFACTORY' : 'POOR';

    return {
      score,
      rating,
      metrics,
      capturedCount: this.history.length,
      lastUpdated: new Date().toISOString(),
    };
  }

  public getHistory(): MetricEntry[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.metricsMap.clear();
    this.history = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MetricEntry[];
        this.history = parsed;
        parsed.forEach((m) => {
          if (!this.metricsMap.has(m.name)) {
            this.metricsMap.set(m.name, m);
          }
        });
      }
    } catch {}
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history.slice(0, 30)));
    } catch {}
  }

  private observeVitals(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      // LCP
      const lcpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        if (lastEntry) this.recordMetric('LCP', lastEntry.startTime);
      });
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });

      // CLS
      const clsObs = new PerformanceObserver((list) => {
        let clsVal = 0;
        list.getEntries().forEach((e) => {
          const ls = e as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!ls.hadRecentInput) clsVal += ls.value;
        });
        this.recordMetric('CLS', clsVal);
      });
      clsObs.observe({ type: 'layout-shift', buffered: true });

      // TTFB & FCP
      const navObs = new PerformanceObserver((list) => {
        const nav = list.getEntries()[0] as PerformanceNavigationTiming;
        if (nav) {
          this.recordMetric('TTFB', nav.responseStart - nav.requestStart);
        }
      });
      navObs.observe({ type: 'navigation', buffered: true });

      const fcpObs = new PerformanceObserver((list) => {
        const fcp = list.getEntries()[0];
        if (fcp) this.recordMetric('FCP', fcp.startTime);
      });
      fcpObs.observe({ type: 'paint', buffered: true });
    } catch {}
  }
}

export const performanceMetricsEngine = new PerformanceMetricsEngine();
