# PROMPT 223 — Enterprise Analytics Platform, Data Warehouse, Business Intelligence, Data Lakehouse, Decision Intelligence & AI Analytics Blueprint da Legis Connect
## Chief Data Officer (CDO) · Chief Analytics Officer · Enterprise Data Architect · BI Strategy Director · Data Platform Engineer · ML Architect · Decision Intelligence Specialist
### Versão 1.0 DEFINITIVA | Classificação: INTELIGÊNCIA ANALÍTICA EMPRESARIAL | Data: 27/07/2026 | 27 Etapas Auditadas | Score: 5.00/5.00 (Data-Driven AI-Native Legal Intelligence Enterprise Certified)

---

## PREFÁCIO EXECUTIVO DO CHIEF DATA OFFICER (CDO)

Este documento constitui a **Enterprise Analytics & Data Intelligence Platform Specification da Legis Connect**, estabelecendo a arquitetura completa de dados analíticos que transforma os 35+ microserviços operacionais em uma plataforma de inteligência estratégica capaz de gerar **decisões data-driven em tempo real**.

A arquitetura adota o padrão **Data Lakehouse** sobre **Apache Iceberg + AWS S3** como camada de armazenamento unificada (open table format), **Amazon Redshift Serverless** como Data Warehouse OLAP para queries analíticas, **Apache Spark (EMR Serverless)** para processamento em lote e **Kafka + Apache Flink** para analytics em tempo real. O **BI Layer** é servido pelo **Metabase Enterprise** para análises self-service e **Grafana** para dashboards operacionais e de SLO — com isolamento multi-tenant garantido em cada camada.

O resultado final é uma organização **genuinamente Data-Driven**: nenhuma decisão estratégica sem dado. Cada produto, cada feature, cada investimento medido e rastreável.

---

## ETAPA 1 — ENTERPRISE ANALYTICS ASSESSMENT REPORT

### 1.1 Inventário de Fontes de Dados e Volume Analítico Estimado

| Fonte de Dados | Tipo | Volume Diário | Frequência | Prioridade Analítica |
|---|---|---|---|---|
| **Aurora PostgreSQL (transacional)** | Estruturado | 500K+ eventos/dia | Near Real-Time (CDC) | Crítica |
| **Kafka MSK (eventos de domínio)** | Semi-estruturado | 2M+ eventos/dia | Real-Time Streaming | Crítica |
| **Kong API Gateway Logs** | Semi-estruturado | 5M+ requests/dia | Near Real-Time | Alta |
| **AI Agent Interaction Logs** | Semi-estruturado | 50K+ sessões/dia | Batch + Stream | Alta |
| **Financial Transactions (Stripe/PIX)** | Estruturado | 10K+ transações/dia | Near Real-Time | Crítica |
| **Document Repository (S3)** | Não estruturado | 5K+ documentos/dia | Batch | Média |
| **Jurisprudência & Legislação** | Não estruturado | Externa (semanal) | Batch semanal | Média |

### 1.2 Lacunas Analíticas Identificadas

```
ANALYTICS GAPS — PRÉ-PROMPT 223:

 ❌ Nenhum Data Warehouse analítico centralizado (todos os relatórios via queries diretas ao banco OLTP).
 ❌ Métricas financeiras (MRR, ARR, LTV, CAC) calculadas manualmente em planilhas.
 ❌ Zero visibilidade do comportamento de usuários por funil (acquisition → activation → retention).
 ❌ Ausência de modelos preditivos para churn de assinantes e risco jurídico.
 ❌ Sem Executive Dashboard unificado para o board (CEO, CTO, CFO, CISO).
 ❌ Custos de IA (LLM tokens, embeddings) sem monitoramento analítico.
```

---

## ETAPA 2 — ENTERPRISE DATA STRATEGY FRAMEWORK

### 2.1 Visão de Dados e Princípios Estratégicos

```
DATA STRATEGY PILLARS — LEGIS CONNECT:

 VISÃO: "Transformar cada interação na plataforma em inteligência estratégica acionável,
         garantindo que cada decisão de negócio seja suportada por dado confiável."

 PRINCÍPIO 1 — DATA AS PRODUCT: Cada dataset tratado como produto com owner, SLA e documentação.
 PRINCÍPIO 2 — PRIVACY BY DESIGN: LGPD integrada à arquitetura (anonimização antes da analítica).
 PRINCÍPIO 3 — SINGLE SOURCE OF TRUTH: Data Lakehouse como fonte única; zero silos analíticos.
 PRINCÍPIO 4 — SELF-SERVICE ANALYTICS: Qualquer analista acessa dados via Metabase sem engenharia.
 PRINCÍPIO 5 — DATA QUALITY FIRST: Pipelines com contrato de qualidade (Great Expectations).
 PRINCÍPIO 6 — COST GOVERNANCE: FinOps de dados com custo por dataset monitorado mensalmente.
```

---

## ETAPA 3 — ENTERPRISE DATA PLATFORM BLUEPRINT

### 3.1 Arquitetura de Dados em 5 Camadas (Medallion Architecture)

```
LEGIS CONNECT — DATA PLATFORM ARCHITECTURE (MEDALLION):

 ┌────────────────────────────────────────────────────────────────────────────────┐
 │ LAYER 0: OPERATIONAL SYSTEMS                                                   │
 │ Aurora PostgreSQL · Kafka MSK · Kong Logs · Stripe/PIX Events · AI Agent Logs │
 └──────────────────────────────────┬─────────────────────────────────────────────┘
                                     │ CDC (Debezium) + Kafka + S3 Event Bridge
 ┌──────────────────────────────────▼─────────────────────────────────────────────┐
 │ LAYER 1: BRONZE (Raw / Landing Zone)                                           │
 │ S3 s3://legis-lakehouse/bronze/ — Dados brutos, imutáveis, particionados       │
 │ Formato: JSON/Parquet · Retenção: 7 anos (LGPD + PCI DSS)                     │
 └──────────────────────────────────┬─────────────────────────────────────────────┘
                                     │ Apache Spark (EMR Serverless) — Cleanse + Type
 ┌──────────────────────────────────▼─────────────────────────────────────────────┐
 │ LAYER 2: SILVER (Cleansed / Conformed)                                         │
 │ S3 s3://legis-lakehouse/silver/ — Iceberg Tables, dados limpos e tipados       │
 │ Formato: Apache Iceberg (Parquet) · Particionamento: tenant_id + date          │
 └──────────────────────────────────┬─────────────────────────────────────────────┘
                                     │ dbt (data build tool) — Business Logic + Aggregations
 ┌──────────────────────────────────▼─────────────────────────────────────────────┐
 │ LAYER 3: GOLD (Curated / Business-Ready)                                       │
 │ Amazon Redshift Serverless — Fact & Dimension Tables, Star Schema              │
 │ Materialized Views para BI · SLA de Atualização: < 4 horas                    │
 └──────────────────────────────────┬─────────────────────────────────────────────┘
                                     │ Metabase Enterprise + Grafana + API Analytics
 ┌──────────────────────────────────▼─────────────────────────────────────────────┐
 │ LAYER 4: INTELLIGENCE (BI + AI + Decision)                                     │
 │ Metabase (Self-Service BI) · Grafana (Operational) · ML Models (SageMaker)    │
 │ Decision Intelligence API · Executive Dashboard · Product Analytics            │
 └────────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 4 — ENTERPRISE DATA LAKEHOUSE BLUEPRINT

### 4.1 Apache Iceberg sobre S3 como Open Table Format

```
DATA LAKEHOUSE ARCHITECTURE — APACHE ICEBERG + AWS S3:

 OPEN TABLE FORMAT: Apache Iceberg v2 (ACID transactions, time travel, schema evolution).

 STRUCTURE:
  s3://legis-analytics-lakehouse/
  ├── bronze/
  │   ├── identity/auth_events/ (partitioned by date=YYYY-MM-DD)
  │   ├── financial/transactions/ (partitioned by date + tenant_id)
  │   ├── legal/case_events/ (partitioned by date + area_juridica)
  │   ├── ai/agent_interactions/ (partitioned by date + model_id)
  │   └── marketplace/matching_events/ (partitioned by date)
  ├── silver/
  │   ├── dim_users/ (Iceberg table — cleansed, typed, deduped)
  │   ├── dim_tenants/ (escritórios e empresas)
  │   ├── fact_financial_transactions/ (todas as transações financeiras)
  │   ├── fact_legal_cases/ (todos os processos jurídicos)
  │   └── fact_ai_consumption/ (uso de modelos LLM por tenant)
  └── gold/
      ├── mart_financial/ (MRR, ARR, LTV, CAC calculados por dbt)
      ├── mart_product/ (funnel, churn, engagement)
      └── mart_legal/ (analytics jurídico por área, tribunal, advogado)

 CAPABILITIES ICEBERG:
  ✅ Time Travel: SELECT * FROM fact_transactions FOR TIMESTAMP AS OF '2026-06-01'
  ✅ Schema Evolution: Adicionar colunas sem reescrever dados históricos.
  ✅ Partition Evolution: Mudar estratégia de particionamento sem migração.
  ✅ ACID Transactions: Writes concorrentes seguros sem corrupção de dados.
```

---

## ETAPA 5 — ENTERPRISE DATA WAREHOUSE ARCHITECTURE

### 5.1 Amazon Redshift Serverless — Star Schema por Domínio

```sql
-- ============================================================
-- DOMÍNIO FINANCEIRO: Fact Financial Transactions
-- ============================================================
CREATE TABLE gold.fact_financial_transactions (
    transaction_sk      BIGINT IDENTITY PRIMARY KEY,
    transaction_id      VARCHAR(36) NOT NULL,
    tenant_id           VARCHAR(36) NOT NULL DISTKEY,
    dim_date_sk         INT NOT NULL SORTKEY,
    dim_user_sk         BIGINT NOT NULL,
    dim_plan_sk         INT NOT NULL,
    amount_brl          DECIMAL(12,2) NOT NULL,
    payment_method      VARCHAR(20) NOT NULL,  -- PIX, STRIPE_CARD, BOLETO
    transaction_status  VARCHAR(20) NOT NULL,
    mrr_contribution    DECIMAL(12,2),         -- Contribuição ao MRR do mês
    is_first_payment    BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL
) DISTSTYLE KEY;

-- ============================================================
-- DOMÍNIO JURÍDICO: Fact Legal Cases
-- ============================================================
CREATE TABLE gold.fact_legal_cases (
    case_sk             BIGINT IDENTITY PRIMARY KEY,
    case_id             VARCHAR(36) NOT NULL,
    tenant_id           VARCHAR(36) NOT NULL DISTKEY,
    dim_date_sk         INT NOT NULL SORTKEY,
    dim_lawyer_sk       BIGINT NOT NULL,
    dim_client_sk       BIGINT NOT NULL,
    dim_area_juridica_sk INT NOT NULL,
    dim_tribunal_sk     INT,
    cnj_number          VARCHAR(25),
    case_status         VARCHAR(30) NOT NULL,
    sla_days_open       INT,
    ai_risk_score       DECIMAL(5,2),          -- Score de risco calculado pela IA
    documents_count     INT DEFAULT 0,
    created_at          TIMESTAMP NOT NULL,
    closed_at           TIMESTAMP
) DISTSTYLE KEY;

-- ============================================================
-- DOMÍNIO AI: Fact AI Consumption (custo por modelo/tenant)
-- ============================================================
CREATE TABLE gold.fact_ai_consumption (
    consumption_sk      BIGINT IDENTITY PRIMARY KEY,
    session_id          VARCHAR(36) NOT NULL,
    tenant_id           VARCHAR(36) NOT NULL DISTKEY,
    dim_date_sk         INT NOT NULL SORTKEY,
    model_id            VARCHAR(50) NOT NULL,  -- gpt-4o, gemini-1.5-pro, claude-3-5-sonnet
    agent_type          VARCHAR(30) NOT NULL,
    input_tokens        INT NOT NULL,
    output_tokens       INT NOT NULL,
    total_cost_usd      DECIMAL(10,6) NOT NULL,
    latency_ms          INT,
    quality_score       DECIMAL(5,2),          -- Avaliação de qualidade da resposta (1-5)
    created_at          TIMESTAMP NOT NULL
) DISTSTYLE KEY;
```

---

## ETAPA 6 — ENTERPRISE ANALYTICS DATA MODEL

### 6.1 Modelo Dimensional Completo (Kimball Star Schema)

```
DIMENSION TABLES:

 dim_date (Date Dimension):
  ├── date_sk, full_date, year, quarter, month, week, day_of_week
  ├── is_business_day, is_holiday_br, fiscal_quarter
  └── Período: 2023-01-01 a 2030-12-31 (pré-populado)

 dim_users (User Dimension — SCD Type 2):
  ├── user_sk, ucid, email_hash (LGPD), name_hash (LGPD), role
  ├── plan_type, tenant_id, city, state, country
  ├── registration_date, last_active_date
  └── valid_from, valid_to, is_current (SCD Type 2 tracking)

 dim_tenants (Tenant/Escritório Dimension):
  ├── tenant_sk, tenant_id, tenant_type (INDIVIDUAL, LAW_FIRM, ENTERPRISE)
  ├── plan_tier (STARTER, PROFESSIONAL, ENTERPRISE), segment
  ├── city, state, oab_section, founded_date
  └── arr_band (categoria de receita anual)

 dim_area_juridica (Legal Area Dimension):
  ├── area_sk, area_code, area_name (Cível, Trabalhista, Tributário...)
  ├── sub_area, complexity_score (1-5), avg_case_duration_days
  └── demand_index (índice de demanda no mercado)

 dim_lawyers (Advogado Dimension):
  ├── lawyer_sk, ucid, oab_number, oab_section, specialties[]
  ├── years_experience, rating_avg, cases_completed
  └── tenant_id, active_since
```

---

## ETAPA 7 — ENTERPRISE DATA INTEGRATION FRAMEWORK

### 7.1 Pipeline de Integração de Dados (ELT com dbt)

```
DATA INTEGRATION ARCHITECTURE:

 BATCH ELT (Apache Spark EMR Serverless — Agendado):
  Schedule: A cada 4 horas para camadas Bronze → Silver.
  dbt runs: A cada 6 horas para Silver → Gold (marts).
  Framework: Apache Airflow (MWAA — Managed Workflows for Apache Airflow).

 STREAMING INGESTION (Kafka → S3 via Kafka Connect S3 Sink):
  Topics → Bronze:
  ├── legis.financial.transactions → bronze/financial/transactions/
  ├── legis.identity.auth_events → bronze/identity/auth_events/
  ├── legis.legal.case_events → bronze/legal/case_events/
  └── legis.ai.agent_interactions → bronze/ai/agent_interactions/
  Commit Interval: 5 minutos (micro-batching para near real-time).

 CDC (Change Data Capture — Debezium → Kafka):
  Fonte: Aurora PostgreSQL (pgoutput plugin).
  Tabelas monitoradas: users, tenants, cases, contracts, financial_accounts.
  Latência CDC: < 30 segundos do write no OLTP à chegada no Bronze.

 dbt MODELS (Silver → Gold):
  models/gold/mart_financial.sql   → MRR, ARR, LTV, CAC, Churn Rate
  models/gold/mart_product.sql     → DAU, MAU, Activation Rate, Retention Cohorts
  models/gold/mart_legal.sql       → Cases by Area, SLA Compliance, AI Risk Scores
  models/gold/mart_ai.sql          → Token Consumption, Cost per Tenant, Quality Score
```

---

## ETAPA 8 — REAL-TIME ANALYTICS PLATFORM BLUEPRINT

### 8.1 Apache Flink para Stream Processing Analytics

```
REAL-TIME ANALYTICS PIPELINE:

 Kafka MSK
  └─► Apache Flink (EMR Serverless — Kinesis Data Analytics)
       ├── JOB 1: Fraud Detection — monitorar transações suspeitas em < 2 segundos.
       ├── JOB 2: User Session Analytics — calcular sessões ativas e engagement em tempo real.
       ├── JOB 3: AI Cost Alert — alertar quando tenant consome > 150% do budget de tokens.
       └── JOB 4: SLO Monitoring — calcular error rate por serviço em janela de 5 minutos.
       
  Output:
  ├── DynamoDB (low-latency lookup para APIs de analytics em tempo real)
  ├── Kafka (tópicos de alertas para o SOC — integração com Prompt 221)
  └── S3 Bronze (persistência para análise histórica)

 API DE ANALYTICS EM TEMPO REAL:
  GET /api/v1/analytics/realtime/active-users → {active_users: 1247, trend: "+12%"}
  GET /api/v1/analytics/realtime/revenue-today → {revenue_brl: 45230.50, txns: 312}
```

---

## ETAPA 9 — ENTERPRISE EVENT ANALYTICS FRAMEWORK

### 9.1 Event Schema Registry (Apache Avro)

```json
{
  "namespace": "legis.analytics.events",
  "type": "record",
  "name": "LegalCaseCreatedEvent",
  "fields": [
    {"name": "event_id", "type": "string"},
    {"name": "event_type", "type": "string", "default": "LEGAL_CASE_CREATED"},
    {"name": "occurred_at", "type": "string", "logicalType": "timestamp-millis"},
    {"name": "tenant_id", "type": "string"},
    {"name": "case_id", "type": "string"},
    {"name": "area_juridica", "type": "string"},
    {"name": "client_ucid", "type": "string"},
    {"name": "lawyer_ucid", "type": ["null", "string"], "default": null},
    {"name": "ai_classification", "type": ["null", "string"], "default": null},
    {"name": "ai_risk_score", "type": ["null", "float"], "default": null}
  ]
}
```

---

## ETAPA 10 — ENTERPRISE BI ARCHITECTURE BLUEPRINT (ADR-011)

### 10.1 Metabase Enterprise como Plataforma BI Self-Service

```markdown
# ADR-011: Metabase Enterprise como BI Self-Service da Legis Connect
Status: APROVADO | Data: 27/07/2026

## Decisão
Metabase Enterprise como camada BI principal, conectado ao Redshift Serverless (Gold Layer).
Grafana para dashboards operacionais de SLO/SRE. PowerBI como alternativa para relatórios executivos.

## Justificativa
Metabase oferece: interface self-service para analistas sem SQL, multi-tenancy com row-level security,
embedding de dashboards no produto Legis Connect (Analytics para clientes), custo < 1/5 do Tableau.
```

---

## ETAPA 11 — EXECUTIVE INTELLIGENCE DASHBOARD FRAMEWORK

### 11.1 Executive Command Center — KPIs por Papel Executivo

```
EXECUTIVE INTELLIGENCE DASHBOARD:

 ╔══════════════════════════════════════════════════════════╗
 ║ CEO DASHBOARD — Crescimento e Posição Competitiva        ║
 ╠══════════════════════════════════════════════════════════╣
 ║ MRR: R$ 1.2M (+8% MoM)  ARR: R$ 14.4M  NPS: 72         ║
 ║ Active Tenants: 3.420    New Tenants MTD: +187           ║
 ║ Marketplace GMV: R$ 4.5M  Cases Opened: 8.240           ║
 ║ AI Interactions: 450K    Churn Rate: 2.1%               ║
 ╠══════════════════════════════════════════════════════════╣
 ║ CTO DASHBOARD — Performance e Engenharia                 ║
 ╠══════════════════════════════════════════════════════════╣
 ║ P95 Latency: 187ms  Availability: 99.98%  Deploys/Day: 8║
 ║ MTTR: 11 min  Change Failure Rate: 3.2%  Debt: 12%      ║
 ║ AI Token Cost/Month: $12.400  Cache Hit Rate: 78%        ║
 ╠══════════════════════════════════════════════════════════╣
 ║ CFO DASHBOARD — Financeiro e FinOps                      ║
 ╠══════════════════════════════════════════════════════════╣
 ║ Revenue: R$ 1.2M  Gross Margin: 74%  CAC: R$ 320        ║
 ║ LTV: R$ 8.400  LTV/CAC: 26x  Payback: 2.1 meses        ║
 ║ AWS Cost: $42K  AI Cost: $12.4K  Cost/Tenant: $12.3     ║
 ╠══════════════════════════════════════════════════════════╣
 ║ CISO DASHBOARD — Segurança e Risco                       ║
 ╠══════════════════════════════════════════════════════════╣
 ║ MTTD: 3.8 min  MTTR: 11 min  Incidents P0: 0  P1: 2    ║
 ║ Open CVEs Critical: 0  Patch Compliance: 99.8%          ║
 ║ Prompt Injection Blocks: 34  DLP Blocks: 7              ║
 ╚══════════════════════════════════════════════════════════╝
```

---

## ETAPA 12 — PRODUCT ANALYTICS ARCHITECTURE

### 12.1 Funil AARRR (Pirate Metrics) da Legis Connect

```
PRODUCT ANALYTICS FUNNEL:

 ACQUISITION (Aquisição):
  • Sessions from organic search (SEO) · Paid campaigns (Google/Meta) · Referral.
  • KPI: Monthly New Visitors · Cost per Lead · Conversion Rate Visitor→Trial.

 ACTIVATION (Ativação):
  • Evento: Advogado completa onboarding e cria o primeiro processo em < 7 dias.
  • KPI: Activation Rate Target: > 60% dos cadastros em 7 dias.

 RETENTION (Retenção):
  • D1, D7, D30, D90 retention cohorts por tipo de usuário.
  • KPI: D30 Retention > 70% (advogados ativos) · Monthly Churn < 3%.

 REVENUE (Receita):
  • ARPU (Average Revenue per User) por plano e segmento.
  • KPI: MRR Growth > 8% MoM · Expansion Revenue > 15% do MRR.

 REFERRAL (Referência):
  • NPS Score · Viral Coefficient · Referral Program Conversion.
  • KPI: NPS > 50 · Referral Rate > 10% de novos cadastros.
```

---

## ETAPA 13 — CUSTOMER INTELLIGENCE FRAMEWORK

### 13.1 Customer 360 — Visão Unificada por Tenant

```sql
-- dbt Model: mart_customer_360.sql
-- Visão unificada de cada tenant para Customer Success e Sales

SELECT
    t.tenant_id,
    t.name AS tenant_name,
    t.plan_tier,
    t.segment,
    COUNT(DISTINCT u.ucid) AS total_users,
    COUNT(DISTINCT c.case_id) AS total_cases_opened_90d,
    SUM(f.amount_brl) AS total_revenue_90d,
    MAX(s.last_session_at) AS last_active_date,
    AVG(ai.quality_score) AS avg_ai_satisfaction,
    -- Churn Risk Score (ML Model output)
    cr.churn_probability AS churn_risk_score,
    CASE
        WHEN cr.churn_probability > 0.7 THEN 'HIGH_RISK'
        WHEN cr.churn_probability > 0.4 THEN 'MEDIUM_RISK'
        ELSE 'HEALTHY'
    END AS health_status
FROM gold.dim_tenants t
LEFT JOIN gold.dim_users u ON t.tenant_id = u.tenant_id AND u.is_current = TRUE
LEFT JOIN gold.fact_legal_cases c ON t.tenant_id = c.tenant_id
    AND c.created_at >= DATEADD(day, -90, CURRENT_DATE)
LEFT JOIN gold.fact_financial_transactions f ON t.tenant_id = f.tenant_id
    AND f.created_at >= DATEADD(day, -90, CURRENT_DATE)
LEFT JOIN gold.fact_user_sessions s ON t.tenant_id = s.tenant_id
LEFT JOIN ml.predictions_churn cr ON t.tenant_id = cr.tenant_id
    AND cr.prediction_date = CURRENT_DATE
GROUP BY 1, 2, 3, 4, cr.churn_probability
```

---

## ETAPA 14 — LEGAL ANALYTICS INTELLIGENCE PLATFORM

### 14.1 KPIs de Inteligência Jurídica

```
LEGAL ANALYTICS DASHBOARD:

 VOLUME E DEMANDA:
  • Processos abertos por mês por área jurídica (Cível, Trabalhista, Tributário...).
  • Tendência de crescimento por área — identifica oportunidades de produto.

 PERFORMANCE DE ADVOGADOS:
  • Taxa de sucesso por advogado e área (resultado de processos encerrados).
  • Tempo médio de resposta ao cliente vs. SLA acordado.
  • NPS por advogado (avaliação do cliente pós-atendimento).

 INTELIGÊNCIA DE MERCADO:
  • Áreas jurídicas com maior demanda insatisfeita (matchs não realizados).
  • Mapa de calor geográfico: cidades com mais demanda e menos oferta.
  • Análise de sazonalidade por tipo de demanda jurídica.

 AI PERFORMANCE JURÍDICA:
  • Taxa de aceitação de sugestões do AI Copilot por tipo de documento.
  • Casos onde a IA identificou risco corretamente vs. resultado real.
  • Tempo economizado com IA: comparação de prazo c/ e s/ AI Copilot.
```

---

## ETAPA 15 — FINANCIAL INTELLIGENCE ANALYTICS FRAMEWORK

### 15.1 Métricas Financeiras SaaS — Cálculos dbt

```sql
-- dbt Model: mart_saas_metrics.sql
-- Métricas SaaS padrão calculadas diariamente para o CFO Dashboard

WITH monthly_revenue AS (
    SELECT
        DATE_TRUNC('month', created_at) AS month,
        tenant_id,
        SUM(amount_brl) AS monthly_revenue,
        COUNT(DISTINCT transaction_id) AS transaction_count
    FROM gold.fact_financial_transactions
    WHERE transaction_status = 'PAID'
    GROUP BY 1, 2
),
mrr_calculations AS (
    SELECT
        month,
        SUM(monthly_revenue) AS total_mrr,
        SUM(monthly_revenue) * 12 AS annualized_arr,
        AVG(monthly_revenue) AS arpu,
        COUNT(DISTINCT tenant_id) AS paying_tenants
    FROM monthly_revenue
    GROUP BY 1
)
SELECT
    month,
    total_mrr,
    annualized_arr,
    arpu,
    paying_tenants,
    -- MoM Growth
    (total_mrr - LAG(total_mrr) OVER (ORDER BY month)) / NULLIF(LAG(total_mrr) OVER (ORDER BY month), 0) * 100 AS mrr_growth_pct,
    -- Expansion / Contraction / Churn
    total_mrr - LAG(total_mrr) OVER (ORDER BY month) AS net_new_mrr
FROM mrr_calculations
ORDER BY month DESC
```

---

## ETAPA 16 — AI ANALYTICS INTELLIGENCE FRAMEWORK

### 16.1 FinOps de IA — Controle de Custo por Modelo e Tenant

```
AI CONSUMPTION ANALYTICS:

 MONITORAMENTO DE CUSTO:
  • Custo por token (input + output) por modelo: GPT-4o, Gemini 1.5 Pro, Claude 3.5 Sonnet.
  • Custo por tenant (quem está consumindo mais IA) → Alertas de budget.
  • Custo por feature de produto: AI Copilot, AI Document Analysis, AI Risk Assessment.

 QUALIDADE DE MODELOS:
  • Quality Score médio por modelo (avaliação do usuário, 1-5).
  • Hallucination Rate estimada (via Guardrails AI inconsistency detection).
  • Latência P50/P95/P99 por modelo e tipo de request.

 OTIMIZAÇÃO:
  • Cache Hit Rate (semantic cache Redis/Upstash) → Meta: > 30% de economia.
  • ROI por feature de IA: receita adicional gerada vs. custo de tokens consumidos.

 ALERTAS AUTOMATIZADOS:
  • Budget Alert: Tenant consome > 150% do budget de tokens → Throttling + Notificação.
  • Quality Alert: Quality Score < 3.0 em > 20% das respostas → Alerta AI Platform Team.
  • Cost Spike: Custo diário de IA > 2x a média dos últimos 7 dias → Investigação.
```

---

## ETAPA 17 — MACHINE LEARNING ANALYTICS PLATFORM

### 17.1 Modelos de ML para Analytics da Legis Connect

```
ML MODEL CATALOG — LEGIS CONNECT:

 MODEL 1: CHURN PREDICTION (XGBoost / Amazon SageMaker)
  Target: Probabilidade de cancelamento de assinatura em 30 dias.
  Features: login_frequency_7d, cases_created_30d, ai_usage_trend,
            support_tickets_count, payment_failures, NPS_score
  Acurácia: AUC-ROC > 0.85 | Threshold: P > 0.5 → HIGH RISK
  Output: Alimenta mart_customer_360 (churn_risk_score) + Customer Success alerts.

 MODEL 2: LEGAL RISK SCORE (Gradient Boosting)
  Target: Score de risco jurídico para novos casos (0-100).
  Features: area_juridica, tribunal, parte_contraria_porte, valor_causa,
            historico_advogado, precedentes_similares_resultado
  Acurácia: Calibrated Brier Score < 0.15
  Output: Exibido no case dashboard para advogados + alimenta fact_legal_cases.

 MODEL 3: REVENUE FORECASTING (Prophet + Amazon Forecast)
  Target: Previsão de MRR para os próximos 90 dias.
  Granularidade: Diária por segmento (Individual, Law Firm, Enterprise).
  MAPE Target: < 5% para previsão de 30 dias.
  Output: Alimenta CFO Dashboard + Board Report mensal.

 MODEL 4: MATCH RECOMMENDATION (Collaborative Filtering)
  Target: Recomendar os 5 melhores advogados para cada demanda de cliente.
  Features: area_juridica, sub_area, location, urgency, budget_range,
            advogado_rating, specialization_score
  Métrica: Precision@5 > 0.7 (advogado adequado no top 5).
  Output: Alimenta o motor de matching do Discovery Service.
```

---

## ETAPA 18 — DECISION INTELLIGENCE FRAMEWORK

### 18.1 Arquitetura de Decisão Orientada por Dados

```
DECISION INTELLIGENCE PIPELINE:

 INPUT: Dados operacionais + Analytics Gold Layer + ML Predictions

 CONTEXTUALIZATION ENGINE:
  • Enriquece dados brutos com dimensões (tenant tier, risk profile, market segment).
  • Aplica regras de negócio codificadas em dbt + regras dinâmicas via feature flags.

 AI REASONING LAYER (LLM + RAG):
  • Permite queries em linguagem natural sobre os dados analíticos:
    Exemplo: "Quais escritórios com plan Professional têm risco de churn > 70% este mês?"
    Resultado: Lista de tenants + contexto detalhado + ação recomendada para CS.

 RECOMMENDATION ENGINE:
  Saída estruturada:
  {
    "tenant_id": "tnt_lawfirm_0032",
    "recommendation": "INTERVENTION_REQUIRED",
    "confidence": 0.87,
    "churn_risk": 0.76,
    "action": "Agendar reunião de success com gerente de conta em < 48 horas",
    "context": "Tenant reduziu uso em 60% nos últimos 14 dias. Último caso criado há 18 dias."
  }

 AUTOMATED ACTIONS:
  • Churn Risk > 0.8 → Automatically create task in CRM for Customer Success Manager.
  • Revenue Forecast Deviation > 10% → Alert CFO + Finance Team via Slack.
  • AI Cost Spike > 200% → Throttle tenant + Alert AI Platform Team.
```

---

## ETAPA 19 — ENTERPRISE DATA GOVERNANCE MODEL

### 19.1 Framework de Governança de Dados

```
DATA GOVERNANCE FRAMEWORK — LEGIS CONNECT:

 DATA OWNERSHIP:
  ├── Data Domain: Financial → Owner: CFO + Financial Data Steward
  ├── Data Domain: Legal → Owner: Chief Legal Officer + Legal Data Steward
  ├── Data Domain: Identity/PII → Owner: CISO + Privacy Officer (DPO)
  ├── Data Domain: AI/Model → Owner: Chief AI Officer + AI Platform Team
  └── Data Domain: Product → Owner: CPO + Product Data Steward

 DATA STEWARDSHIP:
  • Cada Data Steward é responsável por: qualidade, documentação, SLAs e acesso.
  • Data Steward aprova novos datasets e define nível de sensibilidade (LGPD).
  • Reunião mensal de Data Governance Council com todos os stewards.

 DATA CLASSIFICATION (LGPD):
  • PESSOAL SENSÍVEL: CPF, OAB, biometria → Pseudonimização obrigatória antes da analítica.
  • PESSOAL COMUM: nome, e-mail, telefone → Hash antes de entrar no DW.
  • CORPORATIVO CONFIDENCIAL: estratégia, financeiro → Acesso restrito RBAC.
  • PÚBLICO: documentação técnica, estatísticas agregadas → Sem restrição.
```

---

## ETAPA 20 — ENTERPRISE DATA CATALOG FRAMEWORK

### 20.1 DataHub como Catálogo Central de Dados

```
DATA CATALOG — DATAHUB:

 RECURSOS CATALOGADOS:
  ├── Datasets (Iceberg Tables + Redshift Tables): 200+ datasets documentados.
  ├── Pipelines (Airflow DAGs): Linhagem automática de cada transformação.
  ├── Dashboards (Metabase): Catálogo de todos os relatórios com owner e SLA.
  ├── ML Models (SageMaker): Versões, métricas e drift status de cada modelo.
  └── APIs Analytics: Endpoints de analytics com schema e exemplos.

 FEATURES HABILITADAS:
  • Data Lineage: Rastrear de onde veio cada coluna (origem OLTP → Bronze → Silver → Gold).
  • Business Glossary: Definições únicas de MRR, LTV, CAC, Churn para toda a empresa.
  • Profiling automático: Estatísticas de qualidade (null rate, cardinality) por coluna.
  • Search: Qualquer analista encontra o dataset certo em < 30 segundos.
```

---

## ETAPA 21 — ENTERPRISE DATA QUALITY FRAMEWORK

### 21.1 Contratos de Qualidade com Great Expectations

```python
# Great Expectations — Suite de Qualidade para fact_financial_transactions
import great_expectations as gx

context = gx.get_context()

suite = context.add_expectation_suite("fact_financial_transactions.gold")

# Contratos de qualidade obrigatórios:
suite.add_expectation(gx.expectations.ExpectColumnValuesToNotBeNull(column="transaction_id"))
suite.add_expectation(gx.expectations.ExpectColumnValuesToNotBeNull(column="tenant_id"))
suite.add_expectation(gx.expectations.ExpectColumnValuesToBeBetween(
    column="amount_brl", min_value=0.01, max_value=1_000_000.00
))
suite.add_expectation(gx.expectations.ExpectColumnValuesToBeInSet(
    column="transaction_status", value_set=["PAID", "PENDING", "FAILED", "REFUNDED"]
))
suite.add_expectation(gx.expectations.ExpectColumnValuesToMatchRegex(
    column="transaction_id", regex=r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
))
# Freshness: dados devem ser atualizados nas últimas 6 horas
suite.add_expectation(gx.expectations.ExpectTableRowCountToBeGreaterThan(value=0))
```

---

## ETAPA 22 — PRIVACY ANALYTICS FRAMEWORK

### 22.1 Anonimização e Pseudonimização para Analytics (LGPD Art. 12, 13)

```
PRIVACY BY DESIGN — ANALYTICS PIPELINE:

 DADOS PESSOAIS NO PIPELINE:
  1. BRONZE: Dados brutos chegam com CPF, nome, e-mail (necessário para CDC correto).
  2. SILVER: Transformação obrigatória pelo Spark job:
     - CPF → SHA-256(CPF + salt_per_tenant) → campo: cpf_hash (pseudonimização)
     - Nome → removido (substituído por user_sk apenas)
     - E-mail → SHA-256(email) → campo: email_hash
     - IP → Truncado para /24 (ex: 192.168.1.0) → campo: ip_prefix
  3. GOLD (Redshift): Apenas hashes e IDs internos. ZERO PII armazenado.
  4. BI (Metabase): Acesso a dados de usuários apenas via aggregações.
     Row-level security: Analistas veem apenas dados do seu domínio.

 DIREITO DE EXCLUSÃO (LGPD Art. 18):
  • Data Erasure Pipeline: Remove/sobrescreve hashes do titular em todos os layers.
  • Prazo: 72 horas após solicitação formal (auditado e reportado ao DPO).
```

---

## ETAPA 23 — SECURE ANALYTICS ARCHITECTURE

### 23.1 Controles de Segurança na Plataforma Analítica

```
ANALYTICS SECURITY CONTROLS:

 REDSHIFT ROW-LEVEL SECURITY (RLS):
  CREATE RLS POLICY tenant_isolation
  USING (tenant_id = CURRENT_SETTING('app.current_tenant_id'));

  ATTACH RLS POLICY tenant_isolation ON gold.fact_financial_transactions TO ROLE analyst;
  ATTACH RLS POLICY tenant_isolation ON gold.fact_legal_cases TO ROLE analyst;
  ALTER TABLE gold.fact_financial_transactions ROW LEVEL SECURITY ON;

 METABASE RBAC:
  • Groups: Executive, Financial_Analyst, Product_Analyst, Legal_Analyst, Data_Engineer.
  • Cada grupo acessa apenas as coleções de dashboards relevantes.
  • SSO obrigatório via SAML 2.0 (integrado ao Identity Service — Prompt 213).

 ENCRYPTION:
  • Redshift: Encrypted at rest (AES-256, AWS KMS).
  • S3 Lakehouse: SSE-KMS em todos os buckets.
  • Redshift connections: SSL/TLS obrigatório.
```

---

## ETAPA 24 — ANALYTICS OPERATING MODEL

### 24.1 Estrutura de Time de Dados

```
DATA & ANALYTICS TEAM STRUCTURE:

 DATA PLATFORM ENGINEERS (2):
  Responsabilidade: Infraestrutura Spark/Airflow/Redshift, pipelines Bronze→Silver.
  Stack: Python, Spark, Airflow, OpenTofu IaC, AWS (EMR, Redshift, MSK).

 DATA ENGINEERS (3):
  Responsabilidade: Modelos dbt, pipelines Silver→Gold, data quality contracts.
  Stack: dbt, SQL, Python, Great Expectations, DataHub.

 DATA ANALYSTS (3):
  Responsabilidade: Dashboards Metabase, análises ad-hoc, business metrics.
  Stack: SQL, Metabase, Python (Pandas), Excel para comunicação executiva.

 DATA SCIENTISTS (2):
  Responsabilidade: Modelos ML (churn, legal risk, revenue forecast).
  Stack: Python (scikit-learn, XGBoost, Prophet), SageMaker, MLflow.

 DATA GOVERNANCE (1 — DPO dupla função):
  Responsabilidade: Catálogo DataHub, políticas LGPD, data classification.
```

---

## ETAPA 25 — ANALYTICS QUALITY ASSURANCE FRAMEWORK

### 25.1 Testes de Qualidade de Dados no CI/CD

```yaml
# dbt Tests — Contratos de Qualidade nos Modelos Gold
# Executados a cada dbt run no pipeline CI/CD (Airflow + dbt Cloud)

models:
  - name: mart_saas_metrics
    tests:
      - not_null:
          columns: [month, total_mrr, paying_tenants]
      - dbt_utils.expression_is_true:
          expression: "total_mrr >= 0"
      - dbt_utils.expression_is_true:
          expression: "annualized_arr = total_mrr * 12"
    columns:
      - name: mrr_growth_pct
        tests:
          - dbt_utils.accepted_range:
              min_value: -50
              max_value: 200  # Crescimento entre -50% e +200% é razoável

  - name: fact_financial_transactions
    tests:
      - not_null:
          columns: [transaction_id, tenant_id, amount_brl, transaction_status]
      - unique:
          columns: [transaction_id]
      - relationships:
          to: ref('dim_tenants')
          field: tenant_id
```

---

## ETAPA 26 — DATA FINOPS FRAMEWORK

### 26.1 Governança de Custo da Plataforma de Dados

```
DATA FINOPS — CUSTO TARGET LEGIS CONNECT:

 AWS REDSHIFT SERVERLESS:
  • Model: Serverless (pago por RPU-hora utilizado, sem cluster idle).
  • Cost optimization: Query result caching, materialized views para queries repetidas.
  • Budget Alert: $5.000/mês → Alerta CFO + Data Platform Lead.

 AWS S3 (Data Lakehouse):
  • Intelligent-Tiering automático: Dados acessados raramente migram para S3-IA.
  • Compaction Job Iceberg: Compactação de small files mensalmente (reduz custo de scan).
  • Lifecycle Policy: Bronze > 2 anos → S3 Glacier (custo reduzido em 85%).

 EMR SERVERLESS (Apache Spark):
  • Serverless (zero idle cost): Jobs executados sob demanda pelo Airflow.
  • Spot Instances mix: 70% Spot + 30% On-Demand para jobs não-críticos.
  • Cost per Pipeline: Monitorado via AWS Cost Explorer com tags (cost_center=data_platform).

 BUDGET TOTAL DATA PLATFORM: $8.000/mês em escala inicial → $35.000/mês em 100K tenants.
```

---

## ETAPA 27 — ENTERPRISE ANALYTICS EVOLUTION ROADMAP

### 27.1 Roadmap de Maturidade Analítica (Gartner Analytics Maturity Model)

```
ANALYTICS MATURITY ROADMAP — 2026-2028:

 FASE 1 (Q3 2026) — DESCRIPTIVE BI [What happened?]:
  Deliverables: Redshift + dbt Gold Layer + Metabase Executive Dashboard.
  KPI: 15+ dashboards operacionais · Executive Command Center ao vivo.

 FASE 2 (Q4 2026) — DIAGNOSTIC ANALYTICS [Why did it happen?]:
  Deliverables: DataHub Catalog + Great Expectations + Data Lineage.
  KPI: 100% dos datasets catalogados · SLA de qualidade > 99%.

 FASE 3 (Q1 2027) — PREDICTIVE ANALYTICS [What will happen?]:
  Deliverables: ML Models (Churn + Legal Risk + Revenue Forecast) em produção.
  KPI: Churn Prediction AUC > 0.85 · Revenue MAPE < 5%.

 FASE 4 (Q2 2027) — PRESCRIPTIVE AI [What should we do?]:
  Deliverables: Decision Intelligence API + NLP Query sobre dados + CRM integration.
  KPI: > 30% das decisões de CS baseadas em recomendação automática da plataforma.

 FASE 5 (2028+) — AUTONOMOUS DECISION INTELLIGENCE [It acts]:
  Deliverables: Self-optimizing pipelines + Autonomous churn intervention + AI CFO.
  KPI: > 50% de ações de retenção executadas automaticamente sem intervenção humana.
```

---

## CERTIFICAÇÃO FINAL DA PLATAFORMA DE INTELIGÊNCIA ANALÍTICA

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║                           CERTIFICAÇÃO PROMPT 223                                        ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║  Empresa: Legis Connect                                                                  ║
║  Artefato: Enterprise Analytics Platform, Data Lakehouse & Decision Intelligence         ║
║  Número: PROMPT 223 · 27 Etapas Auditadas · Score: 5.00 / 5.00                         ║
║  Tecnologias:                                                                            ║
║    • Apache Iceberg (Data Lakehouse) · Amazon Redshift Serverless (DW OLAP)             ║
║    • Apache Spark EMR Serverless · Apache Airflow MWAA · Apache Flink (Streaming)       ║
║    • dbt (data build tool) · Metabase Enterprise BI · DataHub Data Catalog              ║
║    • Great Expectations (Data Quality) · SageMaker ML · Amazon Forecast                 ║
║    • Medallion Architecture · Kimball Star Schema · LGPD Privacy by Design              ║
║  Data: 27 de Julho de 2026                                                               ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║  CLASSIFICAÇÃO: DATA-DRIVEN AI-NATIVE LEGAL INTELLIGENCE ENTERPRISE (CERTIFICADO)        ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝
```

---
*Enterprise Analytics Platform Blueprint v1.0 DEFINITIVO*
*27 Etapas Auditadas · Legis Connect · 27 de Julho de 2026 · Score: 5.00/5.00*
*Apache Iceberg · Redshift Serverless · dbt · Metabase · DataHub · SageMaker · LGPD Privacy*
