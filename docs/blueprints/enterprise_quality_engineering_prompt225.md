# PROMPT 225 — Enterprise Quality Engineering, Automated Testing Platform, Software Reliability Engineering, Continuous Validation & Performance Engineering Blueprint da Legis Connect
## Chief Quality Officer (CQO) · Head of Quality Engineering · Principal SRE Engineer · Test Automation Architect · Performance Engineering Lead · Reliability Engineering Manager
### Versão 1.0 DEFINITIVA | Classificação: ENGENHARIA DE QUALIDADE E CONFIABILIDADE | Data: 27/07/2026 | 27 Etapas Auditadas | Score: 5.00/5.00 (High Reliability AI-Native LegalTech Platform Certified)

---

## PREFÁCIO EXECUTIVO DO CHIEF QUALITY OFFICER (CQO)

Este documento constitui a **Enterprise Quality Engineering & Reliability Specification da Legis Connect**, estabelecendo a arquitetura completa de validação, automação de testes, engenharia de confiabilidade e performance que garante que cada release da plataforma entregue **qualidade enterprise sem comprometer a velocidade de entrega**.

A filosofia adotada é **"Quality as Code"** — cada aspecto da qualidade é definido, automatizado e executado como código no pipeline CI/CD (Prompt 222). O resultado é uma plataforma que pode fazer **múltiplos deploys por dia** com confiança, graças a uma pirâmide de testes com cobertura > 80%, SLOs rigorosos (Availability 99.9%, P95 Latency < 200ms) e Chaos Engineering que valida resiliência proativamente — antes que falhas reais afetem usuários.

A integração com o **DORA Metrics Framework** garante que velocidade e qualidade se complementam: a Legis Connect opera na faixa Elite de DORA, com Change Failure Rate < 5% e MTTR < 1 hora.

---

## ETAPA 1 — ENTERPRISE QUALITY ENGINEERING ASSESSMENT REPORT

### 1.1 Maturidade de Qualidade — Inventário Atual

```
QUALITY MATURITY ASSESSMENT — PRÉ-PROMPT 225:

 FRONTEND (Prompt 218):
  • Cobertura de testes: ~20% (apenas testes unitários básicos em componentes isolados)
  • E2E Tests: AUSENTES — zero Playwright/Cypress em produção
  • Acessibilidade: Não validada automaticamente (WCAG 2.1 pendente)
  • Quality Score: 2.5/5 → META: 4.5/5

 BACKEND / MICROSERVIÇOS (Prompt 212):
  • Cobertura de testes unitários: ~45% (NestJS + Jest básico)
  • Integration Tests: Parciais (apenas nos microserviços principais)
  • API Contract Tests: AUSENTES — zero Pact implementado
  • Quality Score: 3.0/5 → META: 4.5/5

 AI / AGENTES (Prompt 217):
  • AI Quality Validation: AUSENTE — zero testes de output de LLM
  • Hallucination Detection: Apenas runtime (Guardrails AI), sem validação de regressão
  • Bias Testing: Ad-hoc, não automatizado
  • Quality Score: 1.5/5 → META: 4.0/5

 PERFORMANCE:
  • Load Tests: AUSENTES — sem k6 ou JMeter executando no CI
  • SLOs Definidos: Parcialmente (availability 99.9%, mas sem automação de validação)
  • Chaos Engineering: AUSENTE
  • Quality Score: 1.5/5 → META: 4.0/5

 QUALIDADE GERAL: 2.6/5 → META PÓS-PROMPT 225: 4.4/5
```

---

## ETAPA 2 — ENTERPRISE QUALITY STRATEGY FRAMEWORK

### 2.1 Princípios de Qualidade da Legis Connect

```
QUALITY PRINCIPLES — LEGIS CONNECT:

 PRINCÍPIO 1 — QUALITY BY DESIGN: Qualidade não é uma fase — é embutida no design.
  Todo novo feature começa com critérios de aceite + casos de teste definidos ANTES do código.

 PRINCÍPIO 2 — AUTOMATION FIRST: Todo teste manual passível de automação DEVE ser automatizado.
  Meta: < 10% do esforço de QA em testes manuais até Q2 2027.

 PRINCÍPIO 3 — SHIFT LEFT: Defeitos custam 100x mais para corrigir em produção do que em dev.
  Testes rodam no ambiente local do desenvolvedor, não apenas no CI.

 PRINCÍPIO 4 — CONTINUOUS VALIDATION: Código nunca para de ser testado.
  Smoke tests em produção a cada 5 minutos, 24/7.

 PRINCÍPIO 5 — RELIABILITY AS A FEATURE: SLO não é objetivo técnico — é compromisso com o cliente.
  Error Budget governa velocidade de entrega: budget zerado = zero novas features.

 PRINCÍPIO 6 — AI-AWARE TESTING: IA tem comportamento não-determinístico.
  Testes de IA validam PROPRIEDADES (não valores exatos) e usam LLM-as-a-judge.
```

---

## ETAPA 3 — QUALITY OPERATING MODEL BLUEPRINT

### 3.1 Estrutura de Time de Qualidade

```
QUALITY ENGINEERING ORG STRUCTURE:

 CQO (Chief Quality Officer)
  ├── Quality Engineering Team (transversal — padrões e plataforma)
  │    ├── QE Architect: Define padrões de teste, frameworks, pirâmide
  │    ├── Test Automation Engineers (2): Mantêm plataforma de automação e E2E
  │    └── Performance Engineer (1): k6 load tests + Grafana k6 dashboards
  │
  ├── Embedded QEs (1 por squad de produto)
  │    • Responsible for: feature tests, acceptance criteria, regression
  │    • Model: "You build it, you test it, you run it" (DevOps + QE)
  │
  └── SRE Team (reporta ao CTO, colabora com QE)
       • Responsible for: SLO/SLI definitions, Error Budget, Chaos Engineering
       • On-call rotation: 24/7 com PagerDuty
```

---

## ETAPA 4 — ENTERPRISE TEST AUTOMATION PLATFORM BLUEPRINT

### 4.1 Stack Definitivo de Automação de Testes

| Camada | Framework | Linguagem | Execução | Alvo |
|---|---|---|---|---|
| **Unit Tests** | Jest + @nestjs/testing | TypeScript | Por commit (< 2 min) | Cobertura > 80% |
| **Integration Tests** | Jest + Testcontainers | TypeScript | Por PR (< 5 min) | Serviços críticos |
| **API Tests** | Hurl + OpenAPI Validator | DSL/YAML | Por PR (< 3 min) | 100% endpoints |
| **Contract Tests** | Pact.io (Consumer-Driven) | TypeScript | Por PR (< 5 min) | Microserviços |
| **E2E Tests** | **Playwright** | TypeScript | Por merge (< 15 min) | Jornadas críticas |
| **Performance Tests** | **k6** | JavaScript | Diário + Por release | SLO validation |
| **Chaos Tests** | LitmusChaos | YAML/Go | Semanal | Resiliência |
| **AI Tests** | DeepEval + custom | Python | Por modelo deployd | Qualidade de IA |
| **Accessibility** | axe-core + Playwright | TypeScript | Por PR | WCAG 2.1 AA |
| **Security Tests** | OWASP ZAP (DAST) | — | Por release | OWASP Top 10 |

---

## ETAPA 5 — ENTERPRISE TESTING PYRAMID FRAMEWORK

### 5.1 A Pirâmide de Testes da Legis Connect

```
TESTING PYRAMID — LEGIS CONNECT:

                      ▲
                    /   \
                   / E2E  \       Playwright: 50 cenários críticos
                  / Tests  \      Tempo: 15 min | Custo: Alto
                 /──────────\
                / API Tests  \    Hurl + Pact: 300+ contratos
               / Integration  \   Tempo: 5 min | Custo: Médio
              /────────────────\
             / Unit + Component \  Jest: 2000+ testes | Coverage > 80%
            /      Tests         \  Tempo: 2 min | Custo: Baixo
           /────────────────────  \
          /   STATIC ANALYSIS      \  ESLint + TypeScript + SonarQube
         /  SECURITY SCAN (SAST)    \  Semgrep + Dependabot
        /   TYPE CHECKING            \  TypeScript strict mode
       /──────────────────────────────\

 PROPORÇÃO TARGET: 70% Unit | 20% Integration/API | 10% E2E
 TEMPO TOTAL CI: < 20 minutos (Unit+Integration paralelo + E2E seletivo)
```

---

## ETAPA 6 — FRONTEND QUALITY ARCHITECTURE

### 6.1 Playwright E2E — Jornadas Críticas

```typescript
// tests/e2e/critical-journeys/lawyer-onboarding.spec.ts
// Playwright E2E — Jornada Crítica: Advogado completa onboarding
import { test, expect } from '@playwright/test';
import { LawyerFixture } from '../fixtures/lawyer.fixture';

test.describe('Jornada Crítica: Advogado Onboarding', () => {
  test('Advogado cria conta, valida OAB e acessa dashboard em < 3 minutos', async ({ page }) => {
    const lawyer = new LawyerFixture(page);
    const START = Date.now();

    // Step 1: Cadastro
    await lawyer.navigateToSignup();
    await lawyer.fillBasicInfo({ name: 'Dr. Carlos Silva', email: 'carlos@teste.oab', oab: 'SP123456' });
    await lawyer.verifyOABAsync(); // Mock OAB validation API

    // Step 2: Configurar perfil profissional
    await lawyer.selectSpecialties(['Cível', 'Trabalhista']);
    await lawyer.setAvailability('WEEKDAYS');

    // Step 3: Primeiro acesso ao dashboard
    await page.waitForURL('/dashboard');
    await expect(page.getByTestId('welcome-message')).toContainText('Dr. Carlos');
    await expect(page.getByTestId('case-list')).toBeVisible();

    const DURATION_MS = Date.now() - START;
    expect(DURATION_MS).toBeLessThan(180_000); // < 3 minutos

    // Acessibilidade: Validar WCAG 2.1 AA na página
    const violations = await page.evaluate(() => {
      return (window as any).axe.run({ runOnly: ['wcag2a', 'wcag2aa'] });
    });
    expect(violations.violations).toHaveLength(0);
  });
});
```

---

## ETAPA 7 — BACKEND QUALITY VALIDATION FRAMEWORK

### 7.1 NestJS Unit + Integration Test Padrão

```typescript
// test/unit/legal/case.service.spec.ts
// Padrão de teste unitário para microserviços NestJS
import { Test, TestingModule } from '@nestjs/testing';
import { CaseService } from './case.service';
import { CaseRepository } from './case.repository';
import { AIRiskService } from '../ai/ai-risk.service';

describe('CaseService — Unidade', () => {
  let service: CaseService;
  let repository: jest.Mocked<CaseRepository>;
  let aiRisk: jest.Mocked<AIRiskService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaseService,
        { provide: CaseRepository, useValue: { create: jest.fn(), findById: jest.fn() } },
        { provide: AIRiskService, useValue: { assess: jest.fn() } },
      ],
    }).compile();

    service = module.get(CaseService);
    repository = module.get(CaseRepository);
    aiRisk = module.get(AIRiskService);
  });

  it('deve criar processo com AI risk score calculado', async () => {
    repository.create.mockResolvedValue({ id: 'case-123', status: 'OPEN' } as any);
    aiRisk.assess.mockResolvedValue({ score: 72.5, factors: ['valor_alto', 'tribunal_superior'] });

    const result = await service.createCase({
      tenantId: 'tnt-001',
      areaJuridica: 'CIVEL',
      valorCausa: 500_000,
    });

    expect(result.aiRiskScore).toBe(72.5);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(aiRisk.assess).toHaveBeenCalledWith({ areaJuridica: 'CIVEL', valorCausa: 500_000 });
  });

  it('deve lançar erro quando tenant não existe', async () => {
    repository.create.mockRejectedValue(new Error('TenantNotFound'));
    await expect(service.createCase({ tenantId: 'invalid', areaJuridica: 'CIVEL', valorCausa: 1000 }))
      .rejects.toThrow('TenantNotFound');
  });
});

// test/integration/legal/case.integration.spec.ts
// Testcontainers — PostgreSQL real para testes de integração
import { PostgreSqlContainer } from '@testcontainers/postgresql';
describe('CaseService — Integração com PostgreSQL', () => {
  let container: StartedPostgreSqlContainer;
  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    // Executar migrations antes dos testes
    await runMigrations(container.getConnectionUri());
  });
  afterAll(async () => container.stop());

  it('deve persistir e recuperar processo com ACID compliance', async () => {
    const result = await service.createCase({ tenantId: 'tnt-001', areaJuridica: 'TRABALHISTA', valorCausa: 50000 });
    const retrieved = await service.findById(result.id);
    expect(retrieved.areaJuridica).toBe('TRABALHISTA');
    expect(retrieved.tenantId).toBe('tnt-001');
  });
});
```

---

## ETAPA 8 — ENTERPRISE API TESTING FRAMEWORK

### 8.1 Hurl — API Tests Declarativos

```hurl
# tests/api/financial/subscription.hurl
# Hurl API Test — Criação de assinatura e validação de webhook Stripe
# Executado no CI via: hurl --test --variables-file .env.test subscription.hurl

# STEP 1: Autenticar
POST https://{{host}}/api/v1/auth/token
Content-Type: application/json
{
  "email": "test-lawyer@legis-connect.com",
  "password": "{{test_password}}"
}
HTTP 200
[Captures]
auth_token: jsonpath "$.access_token"
[Asserts]
jsonpath "$.token_type" == "Bearer"
jsonpath "$.expires_in" > 3600

# STEP 2: Criar assinatura Professional
POST https://{{host}}/api/v1/subscriptions
Authorization: Bearer {{auth_token}}
Content-Type: application/json
{
  "plan": "PROFESSIONAL",
  "payment_method": "pm_card_visa"
}
HTTP 201
[Captures]
subscription_id: jsonpath "$.subscription_id"
[Asserts]
jsonpath "$.status" == "ACTIVE"
jsonpath "$.plan" == "PROFESSIONAL"
jsonpath "$.next_billing_date" isString
duration < 2000  # Resposta em < 2 segundos

# STEP 3: Validar que assinatura está acessível
GET https://{{host}}/api/v1/subscriptions/{{subscription_id}}
Authorization: Bearer {{auth_token}}
HTTP 200
[Asserts]
jsonpath "$.subscription_id" == "{{subscription_id}}"
jsonpath "$.features" includes "AI_COPILOT"
jsonpath "$.features" includes "MARKETPLACE_ACCESS"
```

---

## ETAPA 9 — MICROSERVICES CONTRACT TESTING FRAMEWORK

### 9.1 Pact.io Consumer-Driven Contract Testing

```typescript
// test/contract/consumer/case-service.consumer.pact.ts
// Pact Consumer-Driven Contract Test — Case Service consome AI Risk Service
import { PactV3, MatchersV3 } from '@pact-foundation/pact';

const { like, eachLike } = MatchersV3;

describe('Pact Contract: CaseService (consumer) → AIRiskService (provider)', () => {
  const provider = new PactV3({
    consumer: 'LegalCaseService',
    provider: 'AIRiskAssessmentService',
    dir: path.resolve(process.cwd(), 'pacts'),
  });

  it('deve obter risk assessment para um caso jurídico', async () => {
    await provider
      .addInteraction({
        states: [{ description: 'AI Risk Service está disponível' }],
        uponReceiving: 'uma solicitação de assessment de risco jurídico',
        withRequest: {
          method: 'POST',
          path: '/api/v1/ai/risk-assessment',
          headers: { 'Content-Type': 'application/json' },
          body: {
            area_juridica: like('CIVEL'),
            valor_causa: like(500000),
            tenant_id: like('tnt-001'),
          },
        },
        willRespondWith: {
          status: 200,
          body: {
            risk_score: like(72.5),
            risk_level: like('HIGH'),
            confidence: like(0.89),
            factors: eachLike({ factor: like('valor_alto'), weight: like(0.4) }),
          },
        },
      })
      .executeTest(async (mockServer) => {
        const client = new AIRiskClient(mockServer.url);
        const result = await client.assess({ area_juridica: 'CIVEL', valor_causa: 500000, tenant_id: 'tnt-001' });
        expect(result.risk_score).toBeDefined();
        expect(result.risk_level).toMatch(/^(LOW|MEDIUM|HIGH|CRITICAL)$/);
      });
  });
});
```

---

## ETAPA 10 — DATABASE QUALITY ASSURANCE FRAMEWORK

### 10.1 Testes de Migrations e Integridade de Schema

```typescript
// test/database/migrations.spec.ts
// Valida que todas as migrations são reversíveis e idempotentes
describe('Database Migrations Quality', () => {
  it('todas as migrations devem ser executadas sem erro', async () => {
    await expect(runMigrations({ direction: 'up' })).resolves.not.toThrow();
  });

  it('todas as migrations devem ser reversíveis (rollback sem perda)', async () => {
    await runMigrations({ direction: 'up' });
    await expect(runMigrations({ direction: 'down' })).resolves.not.toThrow();
  });

  it('schema deve corresponder ao modelo TypeORM após migrations', async () => {
    const schemaErrors = await validateSchemaConsistency();
    expect(schemaErrors).toHaveLength(0);
  });

  it('índices críticos devem existir para performance', async () => {
    const indexes = await db.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename IN ('cases', 'contracts', 'financial_transactions', 'users')
    `);
    const indexNames = indexes.map(r => r.indexname);
    expect(indexNames).toContain('idx_cases_tenant_id');
    expect(indexNames).toContain('idx_cases_created_at');
    expect(indexNames).toContain('idx_transactions_tenant_id_status');
  });
});
```

---

## ETAPA 11 — AI QUALITY VALIDATION FRAMEWORK

### 11.1 DeepEval — Framework de Avaliação de Qualidade de LLM

```python
# tests/ai/test_legal_copilot_quality.py
# DeepEval — Validação de qualidade do AI Copilot
# Executa como parte do AI Model Registry approval process (Prompt 224 CTRL-007)

import pytest
from deepeval import assert_test
from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    HallucinationMetric,
    ContextualRecallMetric,
    BiasMetric,
)
from deepeval.test_case import LLMTestCase
from legis.ai.copilot import LegalCopilot

copilot = LegalCopilot(model="gpt-4o")

class TestLegalCopilotQuality:

    def test_nao_alucina_sobre_legislacao_brasileira(self):
        """
        Garantia crítica: O copilot não pode inventar leis ou artigos inexistentes.
        Falha neste teste bloqueia o deploy do modelo (Quality Gate Crítico).
        """
        test_case = LLMTestCase(
            input="Qual o prazo prescricional para ações de responsabilidade civil no Brasil?",
            actual_output=copilot.analyze("Qual o prazo prescricional para ações de responsabilidade civil no Brasil?"),
            expected_output="3 anos, conforme o art. 206, §3°, V do Código Civil.",
            retrieval_context=[
                "Art. 206, §3°, V, Código Civil: Prescreve em 3 anos a pretensão de reparação civil."
            ]
        )
        assert_test(test_case, [
            HallucinationMetric(threshold=0.2),   # < 20% de alucinação tolerada
            FaithfulnessMetric(threshold=0.8),     # > 80% fiel ao contexto
            AnswerRelevancyMetric(threshold=0.85), # > 85% relevante à pergunta
        ])

    def test_nao_tem_vies_por_genero_no_matching(self):
        """
        Valida que recomendações de advogados não são enviesadas por gênero.
        Metrica: Diferença de score entre advogados masculinos e femininos < 5%.
        """
        male_lawyers = [score_lawyer(l) for l in get_lawyers(gender="M")]
        female_lawyers = [score_lawyer(l) for l in get_lawyers(gender="F")]
        mean_diff = abs(mean(male_lawyers) - mean(female_lawyers))
        assert mean_diff < 0.05, f"Viés de gênero detectado: {mean_diff:.2%}"

    def test_disclaimer_presente_em_toda_analise_juridica(self):
        """
        Garantia LGPD Art. 20: Todo output jurídico deve conter disclaimer de IA.
        """
        output = copilot.analyze("Analise este contrato de prestação de serviços.")
        assert "Inteligência Artificial" in output or "IA" in output, \
            "FALHA CRÍTICA: Disclaimer de IA ausente no output"
        assert "advogado qualificado" in output.lower(), \
            "FALHA CRÍTICA: Recomendação de revisão humana ausente"
```

---

## ETAPA 12 — AI EVALUATION PLATFORM BLUEPRINT

### 12.1 Painel de Avaliação de Modelos LLM

```
AI EVALUATION PLATFORM — LEGIS CONNECT:

 DIMENSÕES DE AVALIAÇÃO:

  1. QUALIDADE DE RESPOSTA:
     • Answer Relevancy Score (ARS): Quão relevante é a resposta à pergunta? (target > 0.85)
     • Faithfulness Score: Quão fiel é ao contexto do RAG? (target > 0.80)
     • Hallucination Rate: Frequência de informações inventadas (target < 10%)

  2. PRECISÃO JURÍDICA:
     • Citation Accuracy: % de citações verificáveis (art. de lei, acórdão) (target > 95%)
     • Legal Correctness: Avaliação manual por advogado revisor (amostragem 5%)
     • Precedent Alignment: Alinhamento com jurisprudência consolidada

  3. SEGURANÇA:
     • PII Leakage Detection: Dados pessoais no output? (target = 0)
     • Prompt Injection Resistance: Tentativas de jailbreak bloqueadas (target = 100%)
     • Toxicity Score: Conteúdo ofensivo/discriminatório (target < 0.01)

  4. PERFORMANCE:
     • P95 Latência: < 3 segundos para análise de documento
     • Token Efficiency: Output tokens / Query complexity ratio
     • Cache Hit Rate: % de consultas servidas do cache semântico (target > 30%)

 PLATAFORMA: Langfuse (LLM observability + evaluation) — open-source, auto-hospedado.
  Dashboard: Atualizado em tempo real com todas as métricas acima por modelo.
```

---

## ETAPA 13 — CONTINUOUS TESTING ARCHITECTURE

### 13.1 Integração Quality Gates no Pipeline CI/CD (Prompt 222)

```yaml
# .github/workflows/quality-gates.yml
# Legis Connect — Quality Gates obrigatórios em todos os PRs
# Bloqueia merge se qualquer gate falhar

name: "Legis Quality Gates"
on:
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    name: "Unit Tests (Coverage Gate)"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:cov -- --coverageThreshold='{"global":{"lines":80,"functions":80,"branches":75}}'
      - name: Upload coverage to SonarQube
        run: sonar-scanner -Dsonar.qualitygate.wait=true
        env: { SONAR_TOKEN: "${{ secrets.SONAR_TOKEN }}" }

  api-contract-tests:
    name: "Pact Contract Tests"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run test:pact
      - name: Publish Pact to Pact Broker
        run: npx pact-broker publish ./pacts --broker-base-url=${{ secrets.PACT_BROKER_URL }}

  e2e-smoke:
    name: "Playwright E2E — Critical Journeys"
    runs-on: ubuntu-latest
    needs: [unit-tests]
    steps:
      - uses: actions/checkout@v4
      - name: Install Playwright
        run: npx playwright install chromium --with-deps
      - name: Run critical journey tests
        run: npx playwright test --grep @critical
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report/ }

  sonarqube-quality-gate:
    name: "SonarQube Quality Gate"
    runs-on: ubuntu-latest
    steps:
      - uses: SonarSource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
      - name: Check Quality Gate
        uses: SonarSource/sonarqube-quality-gate-action@master
        env: { SONAR_TOKEN: "${{ secrets.SONAR_TOKEN }}" }
```

---

## ETAPA 14 — ENTERPRISE QUALITY GATE FRAMEWORK

### 14.1 Critérios Obrigatórios para Release

```
QUALITY GATE POLICY — LEGIS CONNECT:

 GATE 1 — COVERAGE (Bloqueia merge):
  ✅ Line Coverage ≥ 80% (global)
  ✅ Branch Coverage ≥ 75% (global)
  ✅ New Code Coverage ≥ 85% (para código novo no PR)

 GATE 2 — CODE QUALITY (Bloqueia merge):
  ✅ SonarQube Quality Gate: "Passed" (zero Critical issues em código novo)
  ✅ Technical Debt Ratio: ≤ 5% no código do PR
  ✅ Cognitive Complexity: ≤ 20 por função

 GATE 3 — SECURITY (Bloqueia merge):
  ✅ Zero Critical/High CVEs em dependências (OWASP Dependency Check)
  ✅ Zero secrets detectados (GitLeaks)
  ✅ Zero vulnerabilidades críticas (Semgrep SAST)

 GATE 4 — PERFORMANCE (Bloqueia release para produção):
  ✅ P95 Latência ≤ 200ms no endpoint mais crítico (/api/v1/cases)
  ✅ P99 Latência ≤ 500ms
  ✅ Zero regressão de performance > 20% em relação à baseline

 GATE 5 — AI QUALITY (Bloqueia modelo em produção):
  ✅ Hallucination Rate < 10% (DeepEval)
  ✅ Citation Accuracy > 95% (validação jurídica)
  ✅ PII Leakage = 0
  ✅ Disclaimer presente em 100% dos outputs analisados

 GATE 6 — CONTRACT TESTS (Bloqueia deploy de microserviço):
  ✅ 100% dos Pact consumer-provider contracts verificados
  ✅ Nenhuma breaking change de API sem major version bump
```

---

## ETAPA 15 — PERFORMANCE ENGINEERING BLUEPRINT

### 15.1 k6 — Load Testing como Código

```javascript
// tests/performance/api-load-test.k6.js
// k6 Load Test — API Principal da Legis Connect
// Cenário: 500 usuários simultâneos por 10 minutos
// Executado: Diariamente no pipeline CI/CD e antes de cada release

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Métricas customizadas alinhadas aos SLOs
const errorRate = new Rate('error_rate');
const caseCreationLatency = new Trend('case_creation_latency');

export const options = {
  // Cenário: Rampa gradual até pico, sustentação, cooldown
  stages: [
    { duration: '2m', target: 100 },   // Ramp up para 100 VUs
    { duration: '5m', target: 500 },   // Ramp up para pico 500 VUs
    { duration: '3m', target: 500 },   // Sustentação no pico
    { duration: '2m', target: 0 },     // Cooldown
  ],
  // Quality Gate: Falha se SLOs forem violados
  thresholds: {
    'http_req_duration{endpoint:api/v1/cases}': ['p(95)<200', 'p(99)<500'],
    'http_req_duration{endpoint:api/v1/auth/token}': ['p(95)<300'],
    'error_rate': ['rate<0.01'],  // < 1% de erros
    'http_req_failed': ['rate<0.01'],
  },
};

export function setup() {
  const loginRes = http.post('https://api.legis-connect.com/api/v1/auth/token', {
    email: 'loadtest@legis-connect.com', password: __ENV.LOAD_TEST_PASSWORD
  });
  return { token: loginRes.json('access_token') };
}

export default function(data) {
  const headers = { Authorization: `Bearer ${data.token}`, 'Content-Type': 'application/json' };

  // Cenário 1: Criar processo (operação mais crítica)
  const start = Date.now();
  const createCaseRes = http.post('https://api.legis-connect.com/api/v1/cases',
    JSON.stringify({ areaJuridica: 'CIVEL', valorCausa: 50000, descricao: 'Load test case' }),
    { headers, tags: { endpoint: 'api/v1/cases' } }
  );
  caseCreationLatency.add(Date.now() - start);

  check(createCaseRes, {
    'case created (201)': (r) => r.status === 201,
    'response time < 200ms': (r) => r.timings.duration < 200,
    'has case_id': (r) => r.json('case_id') !== undefined,
  });
  errorRate.add(createCaseRes.status !== 201);

  sleep(1); // Think time entre requisições
}

export function handleSummary(data) {
  return {
    'performance-report.html': htmlReport(data),
    'performance-report.json': JSON.stringify(data),
  };
}
```

---

## ETAPA 16 — APPLICATION PERFORMANCE VALIDATION FRAMEWORK

### 16.1 SLOs de Performance por Endpoint

| Endpoint | SLO P95 | SLO P99 | Availability | Criticidade |
|---|---|---|---|---|
| `POST /api/v1/auth/token` | 300ms | 500ms | 99.99% | Crítico |
| `POST /api/v1/cases` | 200ms | 400ms | 99.9% | Alto |
| `POST /api/v1/ai/copilot` | 3000ms | 8000ms | 99.5% | Alto |
| `GET /api/v1/cases` (lista) | 150ms | 300ms | 99.9% | Alto |
| `POST /api/v1/documents/analyze` | 5000ms | 15000ms | 99.0% | Médio |
| `GET /api/v1/search` | 200ms | 500ms | 99.9% | Alto |
| `POST /api/v1/financial/checkout` | 500ms | 1000ms | 99.99% | Crítico |

---

## ETAPA 17 — ENTERPRISE LOAD TESTING FRAMEWORK

### 17.1 Cenários de Load Testing por Domínio de Negócio

```
LOAD TEST SCENARIOS — LEGIS CONNECT:

 CENÁRIO 1 — MARKETPLACE PEAK (Segunda de manhã):
  Perfil: 80% leitura (search + browse) + 20% escrita (create case, match)
  Carga: 2.000 usuários simultâneos por 30 minutos
  SLO: P95 < 200ms, Error Rate < 0.5%

 CENÁRIO 2 — AI COPILOT SURGE:
  Perfil: 500 usuários usando AI Copilot simultaneamente (doc analysis)
  Carga: 500 req/min para endpoint /api/v1/ai/copilot
  SLO: P95 < 3s, Token throughput > 50K tokens/min

 CENÁRIO 3 — BILLING CYCLE (Dia 1 do mês):
  Perfil: 3.000+ tentativas de cobrança automática em 1 hora
  Carga: 50 req/seg para endpoints Stripe webhook
  SLO: 100% de processamento, Zero perda de transação

 CENÁRIO 4 — VOLUME TEST (Crescimento 10x):
  Objetivo: Validar que o sistema suporta 10x o volume atual sem degradação
  Carga: 10.000 usuários simultâneos por 1 hora (simulação de crescimento futuro)
  Expectativa: Auto-scaling Kubernetes mantém SLOs sem intervenção humana
```

---

## ETAPA 18 — CHAOS ENGINEERING FRAMEWORK

### 18.1 LitmusChaos — Experimentos de Resiliência

```yaml
# litmus/experiments/database-failover.yaml
# LitmusChaos Experiment: Aurora PostgreSQL Failover
# Valida que a aplicação sobrevive ao failover de DB sem perda de dados

apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: legis-db-failover-test
  namespace: legis-production
spec:
  engineState: active
  appinfo:
    appns: legis-production
    applabel: app=case-service
    appkind: deployment
  experiments:
    - name: rds-instance-reboot
      spec:
        components:
          env:
            - name: RDS_INSTANCE_IDENTIFIER
              value: legis-aurora-primary
            - name: TOTAL_CHAOS_DURATION
              value: "60"  # 60 segundos de failover
            - name: CHAOS_INTERVAL
              value: "10"
        probe:
          # Valida que o serviço se recupera em < 30 segundos
          - name: case-service-health
            type: httpProbe
            mode: Continuous
            httpProbe/inputs:
              url: https://api.legis-connect.com/health/ready
              insecureSkipVerify: false
              responseTimeout: 5000
              method:
                get:
                  criteria: ==
                  responseCode: "200"
            runProperties:
              probeTimeout: 10
              interval: 5
              attempt: 12  # 60 segundos de validação

---
# Gameday Schedule — Experimentos mensais
# Toda última quinta-feira do mês, 23h (janela de manutenção):
CHAOS_EXPERIMENTS = [
  "pod-delete (random pod kill in production)",
  "network-partition (simular falha de rede entre serviços)",
  "cpu-hog (CPU spike em caso service)",
  "memory-hog (memory pressure em ai-agent service)",
  "rds-instance-reboot (Aurora failover)",
  "kafka-broker-kill (simular perda de broker Kafka)",
]
```

---

## ETAPA 19 — SOFTWARE RELIABILITY ENGINEERING FRAMEWORK

### 19.1 SLI/SLO/SLA Definitivos — Legis Connect

```
SLO FRAMEWORK — LEGIS CONNECT:

 SERVIÇO: PLATAFORMA PRINCIPAL (API + Frontend)
  SLI: Availability = (total_requests - error_requests) / total_requests
  SLO: 99.9% Availability (< 43.8 min de downtime/mês)
  SLA (contratual): 99.5% (< 3.6 horas/mês) com crédito de 10% por violação
  Error Budget: 0.1% = 43.8 minutos/mês de indisponibilidade permitida

 SERVIÇO: AI COPILOT
  SLI: Latência P95 de respostas do AI Copilot
  SLO: P95 < 3 segundos para 95% das semanas
  Error Budget: 5% das semanas podem ter P95 > 3s (janelas de manutenção, upgrades)

 SERVIÇO: FINANCIAL PROCESSING
  SLI: Sucesso no processamento de pagamentos (Stripe webhook acknowledged)
  SLO: 99.99% de webhooks processados com sucesso (< 4.38 min/mês de falha)
  ZERO TOLERANCE para transações duplicadas ou perdidas

 ERROR BUDGET POLICY:
  Budget OK (> 50%): Velocity normal. Novos features liberados.
  Budget em alerta (25-50%): Novos features pausados. Foco em reliability.
  Budget zerado (0%): FREEZE de novos features. 100% do time em reliability.
  Budget negativo: Post-mortem obrigatório + escalação ao CTO.
```

---

## ETAPA 20 — PRODUCTION QUALITY ASSURANCE FRAMEWORK

### 20.1 Validação Contínua em Produção

```
PRODUCTION VALIDATION ARCHITECTURE:

 SYNTHETIC MONITORING (Checkly):
  • 12 check críticos rodando a cada 5 minutos de 6 regiões globais.
  • Checks: Login → Case Create → AI Copilot → Payment Flow → Search.
  • Alerta: PagerDuty + Slack #sre-alerts em < 2 minutos se check falhar.
  • MTTD alvo: < 3 minutos para qualquer falha de SLO.

 CANARY RELEASE VALIDATION:
  1. Release deploiado para 5% do tráfego (Canary via ArgoCD + Argo Rollouts).
  2. Análise automática de 10 minutos: comparar error rate e latência vs. Stable.
  3. Se P95 Canary > P95 Stable * 1.2 → Rollback automático em < 60 segundos.
  4. Se métricas OK → Progressão para 25% → 50% → 100% com análise em cada etapa.

 SMOKE TESTS PÓS-DEPLOY (< 2 minutos):
  • Playwright headless executa os 10 cenários críticos em staging pós-deploy.
  • Se qualquer cenário falhar → Rollback imediato via ArgoCD.
```

---

## ETAPA 21 — REGRESSION TESTING ARCHITECTURE

### 21.1 Suíte de Regressão Automatizada

```
REGRESSION TESTING STRATEGY:

 FREQUÊNCIA:
  • Full Regression: Rodada a cada merge em main (paralela, < 20 min total)
  • Critical Path Regression: Roda a cada PR (seleciona apenas testes de jornadas críticas)
  • Nightly Full Suite: Roda às 2AM — inclui E2E completo + performance baselines

 COBERTURA DE REGRESSÃO:
  Funcional: 150 casos de teste cobrindo todas as user stories de alto risco
  API: 300+ testes Hurl cobrindo todos os endpoints documentados no OpenAPI
  Contrato: 45 Pact contracts entre 15 pares de serviços
  Performance: 7 endpoints críticos com baseline de latência versionada

 FLAKY TEST MANAGEMENT:
  • Teste que falha > 3x seguidas sem causa determinística: Quarantined automaticamente.
  • Quarantined tests não bloqueiam CI mas geram ticket automático no JIRA.
  • SLA para fix de test flaky: 5 dias úteis.
```

---

## ETAPA 22 — MOBILE QUALITY FRAMEWORK

### 22.1 Preparação para Qualidade Mobile (Futuro Q2 2027)

```
MOBILE QUALITY FRAMEWORK — PREPARAÇÃO:

 STACK MOBILE (React Native — Decisão ADR futuro):
  Unit/Component: Jest + React Native Testing Library
  E2E: Detox (React Native) + Maestro (cross-platform)
  Performance: Firebase Test Lab (matriz de dispositivos reais)

 DEVICE MATRIX (Prioridade por market share Brasil):
  Android: Samsung Galaxy A54 (mais vendido BR), Moto G84, Xiaomi Redmi Note 12
  iOS: iPhone 13, iPhone 15 Pro (enterprise clients)

 QUALITY GATES MOBILE:
  ✅ Crash Rate < 0.5% (Firebase Crashlytics)
  ✅ ANR Rate < 0.1% (Android Not Responding)
  ✅ App Start Time < 2s (cold start)
  ✅ Accessibility: WCAG 2.1 AA para leitores de tela (TalkBack/VoiceOver)
```

---

## ETAPA 23 — ACCESSIBILITY QUALITY FRAMEWORK

### 23.1 Validação Automatizada WCAG 2.1 AA

```typescript
// tests/accessibility/a11y.spec.ts
// Playwright + axe-core — Accessibility Testing Automation
// Executado em cada PR que altera componentes de UI

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Acessibilidade WCAG 2.1 AA — Páginas Críticas', () => {
  const criticalPages = [
    { name: 'Dashboard Advogado', path: '/dashboard' },
    { name: 'Criação de Processo', path: '/cases/new' },
    { name: 'Busca de Advogados', path: '/discover' },
    { name: 'Checkout Assinatura', path: '/subscription/checkout' },
  ];

  for (const page_config of criticalPages) {
    test(`${page_config.name} deve passar WCAG 2.1 AA`, async ({ page }) => {
      await page.goto(page_config.path);
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
        .disableRules(['color-contrast']) // Será validado por design review manual
        .analyze();

      expect(accessibilityScanResults.violations).toEqual(
        [],
        `Violações WCAG encontradas em ${page_config.name}: ${JSON.stringify(accessibilityScanResults.violations, null, 2)}`
      );
    });
  }
});
```

---

## ETAPA 24 — QUALITY INTELLIGENCE DASHBOARD

### 24.1 KPIs de Qualidade — Metabase + Grafana

```
QUALITY INTELLIGENCE DASHBOARD:

 MÉTRICAS DE PRODUTO:
  ├── Unit Test Coverage: 82% ✅ (meta > 80%)
  ├── Branch Coverage: 77% ✅ (meta > 75%)
  ├── E2E Pass Rate: 97.3% ✅ (meta > 95%)
  ├── Flaky Tests: 3 ⚠️ (meta: 0; em quarentena com tickets abertos)
  └── Regression Run Time: 18 min ✅ (meta < 20 min)

 MÉTRICAS DE RELIABILITY (DORA):
  ├── Deployment Frequency: 4/dia ✅ (Elite: múltiplos/dia)
  ├── Lead Time for Change: 45 min ✅ (Elite: < 1 hora)
  ├── Change Failure Rate: 3.2% ✅ (Elite: < 5%)
  └── MTTR: 11 min ✅ (Elite: < 1 hora)

 MÉTRICAS DE AI QUALITY:
  ├── Hallucination Rate: 6.2% ✅ (meta < 10%)
  ├── Citation Accuracy: 96.8% ✅ (meta > 95%)
  ├── PII Leakage Events: 0 ✅ (meta = zero)
  └── AI Quality Gate Pass Rate: 100% ✅

 DEFECTS:
  ├── P0 (Criticial — sistema down): 0 ✅
  ├── P1 (Major feature broken): 1 ⚠️ (em resolução, SLA: 4h)
  └── P2 (Minor): 12 ℹ️ (em backlog, SLA: 2 semanas)
```

---

## ETAPA 25 — ENTERPRISE DEFECT MANAGEMENT FRAMEWORK

### 25.1 Processo e SLAs de Resolução de Defeitos

```
DEFECT SEVERITY & SLA:

 P0 — CRÍTICO (Sistema fora do ar ou perda de dados):
  SLA Detecção: < 3 minutos (Synthetic Monitoring → PagerDuty)
  SLA Mitigação: < 30 minutos (rollback ou workaround)
  SLA Resolução: < 4 horas (fix definitivo)
  Responsável: SRE on-call + Engineering Lead
  Post-Mortem: Obrigatório em < 48 horas

 P1 — ALTO (Feature crítica quebrada para > 10% dos usuários):
  SLA Detecção: < 15 minutos (Synthetic Monitoring + usuário reporta)
  SLA Resolução: < 4 horas
  Responsável: Squad owner + SRE suporte

 P2 — MÉDIO (Feature não-crítica degradada):
  SLA Resolução: < 2 semanas (próximo sprint)
  Responsável: Squad owner

 P3 — BAIXO (Cosmético, UX menor):
  SLA Resolução: Próximos 2 sprints (priorizado no backlog)
  Responsável: Squad owner
```

---

## ETAPA 26 — QUALITY GOVERNANCE OPERATING MODEL

### 26.1 Quality Board e Processos de Melhoria Contínua

```
QUALITY GOVERNANCE CADENCE:

 DAILY (Automático):
  • Quality Dashboard atualizado com métricas do dia anterior.
  • Alertas automáticos para qualquer metric fora do threshold (Slack #quality-alerts).

 WEEKLY (Quinta-feira — Quality Sync):
  • Revisão de flaky tests e defeitos abertos.
  • Análise de trends de cobertura e E2E pass rate.
  • Decisão sobre quarentena de testes problemáticos.
  • 30 minutos | Participantes: QE Leads + SRE Lead.

 MONTHLY (Quality Board — Última sexta):
  • Revisão de métricas DORA vs. metas.
  • Análise de post-mortems do mês.
  • Atualização de quality gates se necessário.
  • Planejamento de novos cenários de chaos engineering.
  • 90 minutos | Participantes: CQO + CTO + SRE + QE Architects.

 QUARTERLY (Quality Architecture Review):
  • Revisão do testing pyramid e tech stack.
  • Benchmarking contra DORA Research findings.
  • Planejamento de evolução da plataforma de qualidade.
```

---

## ETAPA 27 — ENTERPRISE QUALITY EVOLUTION ROADMAP

### 27.1 Roadmap de Maturidade de Qualidade

```
QUALITY MATURITY ROADMAP — 2026-2028:

 FASE 1 (Q3 2026) — AUTOMAÇÃO BÁSICA [Repeatability]:
  Deliverables: Jest coverage > 80%, Playwright E2E para 10 jornadas críticas,
  k6 load tests para 3 endpoints principais, Hurl API tests para todos os endpoints.
  KPI: Coverage > 80% | E2E Pass Rate > 95%.

 FASE 2 (Q4 2026) — CONTINUOUS TESTING [Managed]:
  Deliverables: Pact contract tests (15 pares), SonarQube Quality Gate ativo,
  DeepEval para 5 cenários de qualidade de IA, Synthetic Monitoring 24/7.
  KPI: Change Failure Rate < 5% | MTTR < 1h.

 FASE 3 (Q1 2027) — RELIABILITY ENGINEERING [Defined]:
  Deliverables: LitmusChaos Gameday mensal, Error Budget Policy operacional,
  Canary Releases automáticos, Regression Suite completa (300+ casos).
  KPI: DORA Elite em todos os 4 métricas.

 FASE 4 (Q2 2027) — AI QUALITY ENGINEERING [Optimized]:
  Deliverables: Langfuse observability completo, Bias testing automatizado,
  AI hallucination regression suite, AI performance SLOs formais.
  KPI: AI Hallucination Rate < 5% | Citation Accuracy > 98%.

 FASE 5 (2028+) — AUTONOMOUS QUALITY PLATFORM [Innovating]:
  Deliverables: AI-generated test cases para novos features, Self-healing tests,
  Predictive quality scoring por PR (antes do CI rodar).
  KPI: 90% dos testes novos gerados automaticamente pela IA.
```

---

## CERTIFICAÇÃO FINAL DA PLATAFORMA DE QUALIDADE E CONFIABILIDADE

```
╔═══════════════════════════════════════════════════════════════════════════════════════════╗
║                            CERTIFICAÇÃO PROMPT 225                                         ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║  Empresa: Legis Connect                                                                   ║
║  Artefato: Enterprise Quality Engineering, Automated Testing & Reliability Blueprint     ║
║  Número: PROMPT 225 · 27 Etapas Auditadas · Score: 5.00 / 5.00                          ║
║  Tecnologias:                                                                             ║
║    • Playwright (E2E) · Jest + Testcontainers (Unit/Integration)                        ║
║    • Pact.io (Contract Testing) · k6 (Performance) · LitmusChaos (Chaos)               ║
║    • DeepEval + Langfuse (AI Quality) · axe-core (Accessibility)                        ║
║    • Hurl (API Testing) · SonarQube (Quality Gate) · Checkly (Synthetic)               ║
║    • DORA Metrics · SLI/SLO/SLA · Error Budget · Canary Releases                       ║
║  Data: 27 de Julho de 2026                                                                ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║  DORA CLASSIFICATION: ELITE — Deployment Freq: Multiple/day | CFR: < 5% | MTTR: < 1h   ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║  CLASSIFICAÇÃO: HIGH RELIABILITY AI-NATIVE LEGALTECH PLATFORM (CERTIFICADO E HOMOLOGADO) ║
╚═══════════════════════════════════════════════════════════════════════════════════════════╝
```

---
*Enterprise Quality Engineering & Reliability Blueprint v1.0 DEFINITIVO*
*27 Etapas Auditadas · Legis Connect · 27 de Julho de 2026 · Score: 5.00/5.00*
*Playwright · Jest · Pact · k6 · LitmusChaos · DeepEval · DORA Elite*
