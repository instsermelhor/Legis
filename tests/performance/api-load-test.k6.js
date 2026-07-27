/**
 * Legis Connect — k6 Load Test: API Principal
 * Cenário: 500 usuários simultâneos por 10 minutos
 * SLOs: P95 < 200ms | Error Rate < 1% | Availability > 99.9%
 * 
 * Execução: k6 run --env HOST=api.legis-connect.com api-load-test.k6.js
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// Métricas customizadas alinhadas aos SLOs
const errorRate = new Rate('legis_error_rate');
const caseCreationDuration = new Trend('legis_case_creation_duration');
const aiCopilotDuration = new Trend('legis_ai_copilot_duration');
const totalRequests = new Counter('legis_total_requests');

const HOST = __ENV.HOST || 'staging-api.legis-connect.com';
const BASE_URL = `https://${HOST}`;

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Warm-up
    { duration: '5m', target: 500 },   // Ramp-up para pico
    { duration: '3m', target: 500 },   // Sustentação
    { duration: '2m', target: 0 },     // Cooldown
  ],
  thresholds: {
    // SLOs — Falha = Quality Gate bloqueado = deploy cancelado
    'http_req_duration{endpoint:cases}': ['p(95)<200', 'p(99)<400'],
    'http_req_duration{endpoint:auth}': ['p(95)<300', 'p(99)<600'],
    'legis_error_rate': ['rate<0.01'],     // < 1% erros
    'http_req_failed': ['rate<0.01'],
    'legis_case_creation_duration': ['p(95)<200'],
  },
};

export function setup() {
  const loginRes = http.post(`${BASE_URL}/api/v1/auth/token`, JSON.stringify({
    email: 'loadtest@legis-connect.com',
    password: __ENV.LOAD_TEST_PASSWORD,
  }), { headers: { 'Content-Type': 'application/json' } });

  const token = loginRes.json('access_token');
  if (!token) throw new Error('Setup failed: Could not authenticate load test user');
  return { token };
}

export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
    'X-Tenant-Id': 'tnt-loadtest-001',
  };

  group('Case Management', () => {
    // POST /api/v1/cases
    const start = Date.now();
    const createRes = http.post(`${BASE_URL}/api/v1/cases`, JSON.stringify({
      areaJuridica: 'CIVEL',
      valorCausa: 50000,
      descricao: 'Processo de teste de carga automatizado',
    }), { headers, tags: { endpoint: 'cases' } });
    
    caseCreationDuration.add(Date.now() - start);
    totalRequests.add(1);
    
    const caseOk = check(createRes, {
      'case created (201)': (r) => r.status === 201,
      'case_id present': (r) => !!r.json('case_id'),
      'response < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!caseOk);

    // GET /api/v1/cases (list)
    const listRes = http.get(`${BASE_URL}/api/v1/cases?limit=10`, { headers, tags: { endpoint: 'cases' } });
    check(listRes, { 'cases list (200)': (r) => r.status === 200 });
  });

  group('Authentication', () => {
    // GET /health — heartbeat
    const healthRes = http.get(`${BASE_URL}/health/ready`, { tags: { endpoint: 'health' } });
    check(healthRes, { 'health OK (200)': (r) => r.status === 200 });
  });

  sleep(Math.random() * 2 + 0.5); // Think time: 0.5-2.5 segundos
}

export function handleSummary(data) {
  return {
    'tests/performance/reports/summary.html': htmlReport(data),
    'tests/performance/reports/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
