# 🧪 QUALITY ENGINEERING & SOFTWARE RELIABILITY BLUEPRINT — LEGIS CONNECT
**PROMPT 018 — Auditoria Completa de Arquitetura de Testes, Garantia da Qualidade (QA), Confiabilidade e Engenharia de Validação**
**Principal Quality Engineer | Software Test Architect & Reliability Engineering Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A auditoria de qualidade de software da Legis Connect revelou um cenário de **ausência total de testes automatizados**: a cobertura atual é de **`0%`** em todos os níveis (unitário, integração, contrato, segurança, performance e E2E). Toda a validação funcional é realizada de forma manual e empírica pelo próprio desenvolvedor no navegador local.

**Diagnóstico Principal de Qualidade**:
- **Scorecard de Qualidade (AS-IS)**: `0 / 100` (Crítico / Sem Validação Automatizada).
- **Risco de Regressão**: **MÁXIMO**. Qualquer alteração de código no `App.tsx`, `SettingsTab.tsx` ou nos serviços de dados pode quebrar fluxos críticos (autenticação, cobranças ou análise de casos) sem detecção prévia antes do deploy.

**Objetivo Arquitetural TO-BE**: Construir a infraestrutura de **Continuous Quality & Reliability Engine**, implementando a Pirâmide de Testes Automatizados com **Vitest / Jest** (cobertura unitária/integração > 90%), **Supertest** (APIs NestJS), **Playwright** (E2E Cross-Browser), **axe-core** (Acessibilidade WCAG 2.2 AA), **k6** (Testes de Carga), **Stryker** (Mutation Testing) e **SonarQube Quality Gates** integrados nativamente ao pipeline CI/CD no GitHub Actions.

---

## ETAPA 1 — AUDITORIA GERAL DA QUALIDADE (QA SCORECARD)

### 1.1 Scorecard Executivo da Qualidade de Software

| Nível de Teste | Situação AS-IS | Ferramenta Recomendada | Meta de Cobertura TO-BE | Status Alvo |
|---|---|---|---|---|
| **Testes Unitários (Frontend)** | `0%` | **Vitest + React Testing Library** | **> 90%** (Utils, Hooks, Stores) | 🟢 Enterprise |
| **Testes Unitários (Backend)** | `0%` | **Vitest / Jest** | **> 90%** (Services, Guards, DTOs) | 🟢 Enterprise |
| **Testes de Integração** | `0%` | **Supertest + Testcontainers** | **> 85%** (APIs + DB + Redis) | 🟢 Enterprise |
| **Testes End-to-End (E2E)** | `0%` | **Playwright** | **100%** (15 Fluxos Críticos) | 🟢 Enterprise |
| **Testes de Segurança (SAST/DAST)**| `0%` | **Semgrep + OWASP ZAP + Snyk** | **100%** do Pipeline CI/CD | 🟢 Enterprise |
| **Testes de Performance & Carga** | `0%` | **k6** | **p95 < 180ms** (10k VUs) | 🟢 Enterprise |
| **Testes de Acessibilidade** | `0%` | **axe-core + Pa11y** | **100%** WCAG 2.2 AA Pass | 🟢 Enterprise |
| **Mutation Testing** | `0%` | **Stryker Mutator** | **> 80%** StrykerScore | 🟢 Enterprise |

---

## ETAPA 2 — AUDITORIA DOS FLUXOS CRÍTICOS (CRITICAL PATH MATRIX)

### 2.1 Matriz de Riscos de Fluxos Negociais

```
                               MATRIZ DE FLUXOS CRÍTICOS
                               ═════════════════════════

  Fluxo de Negócio              Criticidade    Impacto de Falha             Estratégia de Teste Exigida
  ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  1. Autenticação & JWT / 2FA    🔴 Extrema     Bypass de Segurança / Vios   Unitario + Supertest + Playwright
  2. Isolamento Multi-Tenant     🔴 Extrema     Vazamento Cross-Tenant (RLS) Teste de Integração Postgres RLS
  3. Contratação & Webhooks      🔴 Extrema     Perda Financeira / Fraude    Contract Test + Stripe Mock E2E
  4. IA Análise de Casos / RAG   🔴 Extrema     Alucinação / Pii Leakage     Unitario + Prompt Injection Test
  5. Upload de Documentos S3     🟠 Alta        Falha de Upload / Malware    Supertest Multipart + ClamAV Scan
  6. Pesquisa de Advogados       🟠 Alta        Perda de Leads de Clientes   Playwright E2E + Search Unit Test
  7. Audit Log Imutabilidade     🔴 Extrema     Perda de Validade Jurídica  Teste de Integração HMAC DB Trigger
```

---

## ETAPA 3 — ESTRATÉGIA DE TESTES UNITÁRIOS (VITEST & RTL)

### 3.1 Exemplo de Teste Unitário de Service Backend (`auth.service.spec.ts`)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService — Testes Unitários de Segurança', () => {
  let authService: AuthService;
  let mockUsersRepo: any;
  let mockJwtService: any;

  beforeEach(() => {
    mockUsersRepo = { findByEmail: vi.fn() };
    mockJwtService = { sign: vi.fn().mockReturnValue('mocked_jwt_token') };
    authService = new AuthService(mockUsersRepo, mockJwtService as any, {} as any);
  });

  it('deve rejeitar tentativa de login se o e-mail não existir', async () => {
    mockUsersRepo.findByEmail.mockResolvedValue(null);

    await expect(authService.login({ email: 'inexistente@legis.com', password: 'Password123!' }))
      .rejects.toThrow(UnauthorizedException);
  });
});
```

---

## ETAPA 4 — ESTRATÉGIA DE TESTES DE INTEGRAÇÃO (SUPERTEST + TESTCONTAINERS)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TESTES DE INTEGRAÇÃO COM TESTCONTAINERS                  │
│                                                                             │
│  [ Vitest Runner ] ──► Testcontainers-node (Sobe PostgreSQL & Redis temporários)│
│                                   │                                         │
│                                   ▼                                         │
│  [ Supertest HTTP Agent ] ──► NestJS TestingModule (App Real em Memória)    │
│                                   │                                         │
│                                   ▼                                         │
│  [ Asserções de Banco ] ────► Valida inclusão relacional e RLS isolamento   │
│                                   │                                         │
│                                   ▼                                         │
│  [ TearDown ] ──────────────► Destrói containers e limpa o banco de teste   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 5 — ESTRATÉGIA DE TESTES END-TO-END (PLAYWRIGHT)

### 5.1 Especificação do Teste E2E de Fluxo do Cliente (`tests/e2e/client-flow.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Fluxo E2E: Busca de Advogado e Solicitação de Atendimento', () => {
  test('deve pesquisar advogado por cidade e solicitar consulta', async ({ page }) => {
    // 1. Acessar Landing Page
    await page.goto('https://staging.legisconnect.com.br');
    
    // 2. Preencher formulário de busca
    await page.fill('input[placeholder*="Cidade"]', 'São Paulo');
    await page.click('button:has-text("Buscar Advogados")');

    // 3. Verificar resultados retornados
    await expect(page.locator('.lawyer-card')).toHaveCount(3);

    // 4. Clicar no primeiro perfil e agendar
    await page.click('.lawyer-card >> nth=0 >> button:has-text("Solicitar Consulta")');
    await expect(page.locator('.modal-booking')).toBeVisible();
  });
});
```

---

## ETAPA 6 — TESTES DE API & CONTRATOS (SUPERTEST & NEWMAN)

* **Testes de Contrato REST (Swagger Validation)**: Validação automatizada contra o schema OpenAPI 3.0 garantindo que nenhum deploy altere os tipos de dados das respostas HTTP (evitando *breaking changes* no frontend).
* **Supertest Suite**: 100% dos endpoints REST v1 cobertos com casos de teste positivos (`200 OK`, `201 Created`) e negativos (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `429 Too Many Requests`).

---

## ETAPA 7 — TESTES DE SEGURANÇA (OWASP TESTING GUIDE)

```
                               SUÍTE DE TESTES OFENSIVOS (SAST/DAST)
                               ═════════════════════════════════════

  • Teste de Bypass de Auth ──► Tenta enviar JWT expirado, sem assinatura ou forjado (RS256).
  • Teste de Injeção SQL ────► Tenta enviar `' OR '1'='1` nos DTOs de busca do Prisma.
  • Teste de XSS ────────────► Tenta injetar `<script>alert(1)</script>` nos campos de nome/bio.
  • Teste de Cross-Tenant ───► Tenta acessar `/cases/:id` pertencente a outro `workspace_id`.
```

---

## ETAPA 8 — TESTES DA INTELIGÊNCIA ARTIFICIAL (AI & LLM TESTING)

### 8.1 Matriz de Validação do Módulo Cognitivo

| Teste de IA | Técnica / Ferramenta | Critério de Aprovação |
|---|---|---|
| **Prompt Injection Test** | Envio de prompts maliciosos de jailbreak ("Ignore system instructions"). | O AI Gateway bloqueia a requisição e retorna HTTP 400. |
| **Sanitização de PII** | Envio de prompts contendo CPFs e e-mails reais. | O `PiiSanitizerService` substitui por `[CPF_OMITIDO]` antes de enviar à API. |
| **Acurácia de RAG** | Validação do grounding com 100 perguntas jurídicas padrão. | 100% das respostas citam o artigo de lei correto do PostgreSQL. |
| **Hallucination Rate** | Teste de perguntas sobre leis inexistentes ("Art. 9999 do CPC"). | A IA responde: "Fundamentação não encontrada na base oficial." |

---

## ETAPA 9 — TESTES DE PERFORMANCE E CARGA (K6)

```
                            CENÁRIOS DE CARGA K6
                            ════════════════════

  • Teste de Carga (Load) ────► 1.000 Usuários Simultâneos por 10 minutos (Valida SLO)
  • Teste de Pico (Spike) ────► Salto repentino de 100 para 5.000 VUs em 30 segundos
  • Teste de Estresse ────────► Rampa até 10.000 VUs até encontrar o ponto de ruptura
  • Teste de Endurance ───────► 500 VUs sustentados por 12 horas (Mede vazamento de memória)
```

---

## ETAPA 10 — TESTES DE BANCO DE DADOS (TRANSAÇÕES & RLS)

* **Validação de Isolamento RLS**: Teste automatizado configurando a variável de sessão `app.current_workspace_id = 'ws_1'` e tentando executar `SELECT * FROM cases WHERE workspace_id = 'ws_2'`. O PostgreSQL DEVE retornar 0 linhas.
* **Teste de Transação ACID**: Simulação de falha no meio do processo de cobrança garantindo o `ROLLBACK` completo das tabelas `service_provisionings` e `financial_transactions`.

---

## ETAPA 11 — TESTES DE INTERFACE & VISUAL REGRESSION (STORYBOOK)

* **Component Driven Testing**: Todos os átomos e moléculas do Design System (`@legis/ui`) documentados e testados isoladamente no **Storybook**.
* **Visual Regression**: **Chromatic** integrado ao CI/CD para detectar qualquer alteração não planejada de layout, cor ou alinhamento de pixel em PRs.

---

## ETAPA 12 — TESTES DE ACESSIBILIDADE AUTOMATIZADOS (AXE-CORE)

```typescript
// Teste de Acessibilidade Automatizado com axe-core e Playwright
import { test, expect } from '@playwright/test';
import injectAxe, { checkA11y } from 'axe-playwright';

test('Página de Login deve cumprir as diretrizes WCAG 2.2 AA', async ({ page }) => {
  await page.goto('https://staging.legisconnect.com.br/login');
  await injectAxe(page);
  
  // Verifica violações de acessibilidade na página inteira
  await checkA11y(page, undefined, {
    detailedReport: true,
    detailedReportOptions: { html: true },
  });
});
```

---

## ETAPA 13 — TESTES DE COMPATIBILIDADE CROSS-BROWSER

* **Matriz de Execução (Playwright Grid)**:
  - **Browsers**: Chromium (Chrome, Edge), WebKit (Safari), Firefox.
  - **Dispositivos**: Desktop (1920x1080), Tablet iPad (768x1024), Mobile iPhone 15 / Pixel 8 (390x844).

---

## ETAPA 14 — CHAOS ENGINEERING (LITMUSCHAOS)

```
                            SIMULADOS DE CHAOS ENGINEERING
                            ══════════════════════════════

  1. Queda do Redis Cluster ──► A API NestJS DEVE continuar funcionando lendo direto do Postgres
  2. Latência de 5s no Gemini ─► O Circuit Breaker Opossum DEVE acionar o Fallback em < 8s
  3. Queda de 1 Nó PostgreSQL ─► O RDS Multi-AZ Failover DEVE promover o Standby em < 60s
```

---

## ETAPA 15 — MUTATION TESTING (STRYKER MUTATOR)

* **Avaliação da Qualidade dos Testes**: O **Stryker Mutator** injeta pequenos erros intencionais ("mutantes") no código-fonte (ex: trocar `>` por `<`, ou `&&` por `||`).
* **Meta**: Cobertura de mutantes de **`StrykerScore > 80%`**, garantindo que os testes unitários realmente validam a lógica e não apenas "passam sem testar nada".

---

## ETAPA 16 — CONTINUOUS TESTING NO PIPELINE CI/CD

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONTINUOUS TESTING NO GITHUB ACTIONS                     │
│                                                                             │
│  [ Pull Request Opened ]                                                    │
│        │                                                                    │
│        ├──► 1. Vitest Unit & Integration Tests (Coverage > 90%)             │
│        ├──► 2. SonarQube Quality Gate Check (Zero Bugs / Zero Vulnerabilities)│
│        ├──► 3. Playwright E2E Critical Path Tests (Headless)                │
│        ├──► 4. Axe-Core Accessibility Check (WCAG 2.2 Pass)                │
│        └──► 5. Chromatic Visual Regression Check                            │
│        │                                                                    │
│        ▼                                                                    │
│  [ PR Approved & Merged to main ] ──► Automatic Smoke Test in Staging       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 17 — QUALIDADE DO CÓDIGO & TECHNICAL DEBT (SONARQUBE)

```
                         SONARQUBE QUALITY GATE TARGETS
                         ══════════════════════════════

  • Bugs: 0
  • Vulnerabilidades: 0 (OWASP A01-A10)
  • Security Hotspots: 100% Revisados
  • Code Smells: Mínimo (Maintainability Rating A)
  • Cobertura de Testes: > 90%
  • Duplicação de Código: < 3.0%
```

---

## ETAPA 18 — ENGENHARIA DE CONFIABILIDADE (SRE QUALITY METRICS)

| Métrica SRE de Qualidade | Definição | Meta TO-BE |
|---|---|---|
| **MTTR** (Mean Time To Recovery) | Tempo médio para restaurar o sistema após uma falha. | **< 15 Minutos** |
| **MTBF** (Mean Time Between Failures) | Tempo médio entre falhas de produção. | **> 720 Horas** (30 dias) |
| **Defect Escape Rate** | Taxa de bugs encontrados em produção vs. em testes. | **< 1.0%** |
| **Change Failure Rate** | Porcentagem de deploys que resultam em degradação. | **< 0.5%** |

---

## ETAPA 19 — GOVERNANÇA DA QUALIDADE (DoD & DoR)

* **Definition of Ready (DoR)**: Uma tarefa só entra na sprint se tiver critérios de aceite funcionais, mockups de UI e regras de segurança definidas.
* **Definition of Done (DoD)**: Uma tarefa só é considerada concluída se possuir **testes unitários/integração escritos**, cobertura > 90%, aprovação no SonarQube e revisão de código por 2 pares.

---

## ETAPA 20 — TEST DATA MANAGEMENT (TDM & LGPD)

* **Testcontainers com Dados Sanitizados**: Utilização de bibliotecas `@faker-js/faker` para geração automatizada de dados fictícios em ambientes de teste.
* **Zero PII em Staging/QA**: Proibido utilizar dumps de banco de dados de produção em ambientes de desenvolvimento ou teste.

---

## ETAPA 21 — ROADMAP DA ENGENHARIA DE QUALIDADE

```
                    ROADMAP DE IMPLANTAÇÃO DA QUALIDADE
                    ═══════════════════════════════════

  FASE 1: TESTES UNITÁRIOS & CI/CD PIPELINE (Semanas 1-3)
  ├── Setup do Vitest + React Testing Library + Jest
  ├── Escrita de testes unitários para a camada de Auth, Services e DTOs
  └── Integrar SonarQube e Vitest Coverage ao GitHub Actions

  FASE 2: TESTES DE INTEGRAÇÃO & E2E (Semanas 4-7)
  ├── Setup do Supertest com Testcontainers (PostgreSQL + Redis)
  ├── Testes E2E com Playwright para os 15 fluxos críticos
  └── Testes automatizados de Acessibilidade com axe-core

  FASE 3: PERFORMANCE, IA & CHAOS TESTING (Semanas 8-12)
  ├── Scripts de teste de carga k6 (10.000 VUs)
  ├── Testes de segurança da IA e mitigação de Prompt Injection
  └── Simulado de Chaos Engineering e Mutation Testing com Stryker
```

---

## ETAPA 22 — BACKLOG TÉCNICO DE GARANTIA DA QUALIDADE

### QA-001 — Configurar Suíte de Testes Unitários com Vitest
* **Problema**: Ausência total de testes unitários no projeto.
* **Solução**: Configurar Vitest + React Testing Library com meta de 90% de cobertura.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 40h

### QA-002 — Testes de Integração Backend com Supertest e Testcontainers
* **Problema**: APIs NestJS e queries Prisma sem validação automatizada.
* **Solução**: Suíte de testes de integração subindo banco PostgreSQL temporário em container.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 48h

### QA-003 — Automação E2E dos Fluxos Críticos com Playwright
* **Problema**: Dependência de validação manual de telas e cadastros.
* **Solução**: Scripts Playwright cobrindo login, busca de advogados, contratação e checkout.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 48h

### QA-004 — Testes de Segurança de IA e Prompt Injection
* **Problema**: Risco de jailbreak e vazamento de PII pela integração cognitiva.
* **Solução**: Suíte automatizada enviando payloads maliciosos e validando o `AI Gateway`.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Média | **Esforço**: 24h

### QA-005 — Testes de Carga Otimizados com k6 (10.000 VUs)
* **Problema**: Desconhecimento dos limites de latência sob alta demanda.
* **Solução**: Script k6 integrado ao staging medindo p95/p99 e throughput.
* **Prioridade**: 🟠 ALTA | **Complexidade**: Média | **Esforço**: 20h

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 018

| Entregável | Status |
|---|---|
| ✅ Auditoria Geral da Qualidade (QA Scorecard com Metas TO-BE) | Concluído |
| ✅ Matriz de Fluxos Críticos e Riscos Negociais (Critical Path) | Concluído |
| ✅ Estratégia de Testes Unitários (Vitest + RTL + Meta > 90% Coverage) | Concluído |
| ✅ Estratégia de Testes de Integração (Supertest + Testcontainers) | Concluído |
| ✅ Estratégia Testes End-to-End E2E (Playwright Cross-Browser Suite) | Concluído |
| ✅ Plano de Testes de APIs & Contratos REST (Swagger OpenAPI Validation) | Concluído |
| ✅ Estratégia de Testes de Segurança (OWASP Testing Guide SAST/DAST) | Concluído |
| ✅ Plano de Testes de IA (Prompt Injection, PII Sanitizer, RAG Grounding) | Concluído |
| ✅ Estratégia de Performance e Carga (Scripts k6 para 10.000 VUs) | Concluído |
| ✅ Testes de Banco de Dados (Isolamento RLS Multi-Tenant & ACID) | Concluído |
| ✅ Testes de Interface UI & Regressão Visual (Storybook + Chromatic) | Concluído |
| ✅ Testes de Acessibilidade (WCAG 2.2 AA com axe-core & Pa11y) | Concluído |
| ✅ Matriz de Testes de Compatibilidade Cross-Browser e Dispositivos | Concluído |
| ✅ Estratégia de Chaos Engineering (Simulados LitmusChaos) | Concluído |
| ✅ Mutation Testing (Stryker Mutator com Meta > 80% StrykerScore) | Concluído |
| ✅ Continuous Testing CI/CD Pipeline (GitHub Actions Quality Gates) | Concluído |
| ✅ Auditoria de Qualidade de Código (SonarQube Quality Gate Metrics) | Concluído |
| ✅ Engenharia de Confiabilidade SRE (MTTR < 15min, MTBF > 720h, Failure Rate) | Concluído |
| ✅ Governança QA (Definition of Done DoD / Definition of Ready DoR) | Concluído |
| ✅ Estratégia de Test Data Management (Faker.js + Testcontainers) | Concluído |
| ✅ Roadmap da Engenharia de Qualidade em 4 Fases (12 semanas) | Concluído |
| ✅ Backlog Técnico de QA Priorizado (`QA-001` a `QA-005`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 018 — Quality Engineering & Software Reliability Blueprint | v1.0.0*
*Próximo: PROMPT 019 — Plano Mestre de Reengenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
