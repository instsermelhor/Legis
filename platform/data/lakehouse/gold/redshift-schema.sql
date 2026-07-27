-- Legis Connect — Amazon Redshift Serverless — Gold Layer Schema
-- Standards: Kimball Star Schema · DAMA-DMBOK 2 · LGPD Privacy by Design
-- Nota: ZERO PII armazenado — apenas hashes e IDs internos

-- ============================================================
-- SCHEMA DEFINITIONS
-- ============================================================
CREATE SCHEMA IF NOT EXISTS gold;
CREATE SCHEMA IF NOT EXISTS ml;

-- ============================================================
-- DIMENSION: Date (Pre-populated 2023-2030)
-- ============================================================
CREATE TABLE IF NOT EXISTS gold.dim_date (
    date_sk          INT NOT NULL PRIMARY KEY,
    full_date        DATE NOT NULL,
    year             SMALLINT NOT NULL,
    quarter          SMALLINT NOT NULL,
    month            SMALLINT NOT NULL,
    month_name       VARCHAR(10) NOT NULL,
    week_of_year     SMALLINT NOT NULL,
    day_of_week      SMALLINT NOT NULL,
    day_name         VARCHAR(10) NOT NULL,
    is_business_day  BOOLEAN NOT NULL DEFAULT TRUE,
    is_holiday_br    BOOLEAN NOT NULL DEFAULT FALSE,
    fiscal_year      SMALLINT NOT NULL,
    fiscal_quarter   SMALLINT NOT NULL
) DISTSTYLE ALL SORTKEY(full_date);

-- ============================================================
-- DIMENSION: Tenants (escritórios, empresas, indivíduos)
-- ============================================================
CREATE TABLE IF NOT EXISTS gold.dim_tenants (
    tenant_sk       BIGINT IDENTITY PRIMARY KEY,
    tenant_id       VARCHAR(36) NOT NULL UNIQUE,
    tenant_type     VARCHAR(20) NOT NULL, -- INDIVIDUAL, LAW_FIRM, ENTERPRISE
    plan_tier       VARCHAR(20) NOT NULL, -- STARTER, PROFESSIONAL, ENTERPRISE
    segment         VARCHAR(30),
    city            VARCHAR(100),
    state           CHAR(2),
    country         CHAR(2) DEFAULT 'BR',
    arr_band        VARCHAR(20), -- <1K, 1K-5K, 5K-20K, 20K+
    registered_date DATE NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) DISTSTYLE ALL;

-- ============================================================
-- DIMENSION: Legal Areas (Áreas Jurídicas)
-- ============================================================
CREATE TABLE IF NOT EXISTS gold.dim_area_juridica (
    area_sk                SMALLINT PRIMARY KEY,
    area_code              VARCHAR(10) NOT NULL UNIQUE,
    area_name              VARCHAR(50) NOT NULL,
    sub_area               VARCHAR(50),
    complexity_score       SMALLINT CHECK (complexity_score BETWEEN 1 AND 5),
    avg_case_duration_days INT,
    demand_index           DECIMAL(5,2) -- Índice de demanda 0-100
) DISTSTYLE ALL;

-- ============================================================
-- FACT: Financial Transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS gold.fact_financial_transactions (
    transaction_sk      BIGINT IDENTITY PRIMARY KEY,
    transaction_id      VARCHAR(36) NOT NULL UNIQUE,
    tenant_id           VARCHAR(36) NOT NULL DISTKEY,
    dim_date_sk         INT NOT NULL REFERENCES gold.dim_date(date_sk),
    dim_tenant_sk       BIGINT REFERENCES gold.dim_tenants(tenant_sk),
    amount_brl          DECIMAL(12,2) NOT NULL,
    payment_method      VARCHAR(20) NOT NULL,
    transaction_status  VARCHAR(20) NOT NULL,
    mrr_contribution    DECIMAL(12,2),
    is_first_payment    BOOLEAN DEFAULT FALSE,
    is_expansion        BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL
) DISTKEY(tenant_id) SORTKEY(dim_date_sk);

-- ============================================================
-- FACT: Legal Cases
-- ============================================================
CREATE TABLE IF NOT EXISTS gold.fact_legal_cases (
    case_sk             BIGINT IDENTITY PRIMARY KEY,
    case_id             VARCHAR(36) NOT NULL UNIQUE,
    tenant_id           VARCHAR(36) NOT NULL DISTKEY,
    dim_date_sk         INT NOT NULL REFERENCES gold.dim_date(date_sk),
    dim_tenant_sk       BIGINT REFERENCES gold.dim_tenants(tenant_sk),
    dim_area_sk         SMALLINT REFERENCES gold.dim_area_juridica(area_sk),
    cnj_number          VARCHAR(25),
    case_status         VARCHAR(30) NOT NULL,
    sla_days_open       INT,
    ai_risk_score       DECIMAL(5,2),
    documents_count     INT DEFAULT 0,
    created_at          TIMESTAMP NOT NULL,
    closed_at           TIMESTAMP
) DISTKEY(tenant_id) SORTKEY(dim_date_sk);

-- ============================================================
-- FACT: AI Token Consumption (FinOps de IA)
-- ============================================================
CREATE TABLE IF NOT EXISTS gold.fact_ai_consumption (
    consumption_sk  BIGINT IDENTITY PRIMARY KEY,
    session_id      VARCHAR(36) NOT NULL,
    tenant_id       VARCHAR(36) NOT NULL DISTKEY,
    dim_date_sk     INT NOT NULL REFERENCES gold.dim_date(date_sk),
    model_id        VARCHAR(50) NOT NULL,
    agent_type      VARCHAR(30) NOT NULL,
    input_tokens    INT NOT NULL,
    output_tokens   INT NOT NULL,
    total_cost_usd  DECIMAL(10,6) NOT NULL,
    latency_ms      INT,
    quality_score   DECIMAL(3,1) CHECK (quality_score BETWEEN 1.0 AND 5.0),
    cache_hit       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL
) DISTKEY(tenant_id) SORTKEY(dim_date_sk);

-- ============================================================
-- MART VIEW: SaaS Metrics (MRR, ARR, Growth)
-- ============================================================
CREATE OR REPLACE VIEW gold.v_saas_metrics_monthly AS
WITH monthly AS (
    SELECT
        DATE_TRUNC('month', created_at)::DATE AS month,
        SUM(amount_brl) AS total_mrr,
        COUNT(DISTINCT tenant_id) AS paying_tenants,
        AVG(amount_brl) AS arpu
    FROM gold.fact_financial_transactions
    WHERE transaction_status = 'PAID'
    GROUP BY 1
)
SELECT
    month,
    total_mrr,
    total_mrr * 12 AS annualized_arr,
    paying_tenants,
    arpu,
    (total_mrr - LAG(total_mrr) OVER (ORDER BY month))
        / NULLIF(LAG(total_mrr) OVER (ORDER BY month), 0) * 100 AS mrr_growth_pct
FROM monthly;

-- ML Predictions table (output from SageMaker jobs)
CREATE TABLE IF NOT EXISTS ml.predictions_churn (
    tenant_id           VARCHAR(36) NOT NULL DISTKEY,
    prediction_date     DATE NOT NULL,
    churn_probability   DECIMAL(5,4) NOT NULL,
    model_version       VARCHAR(20) NOT NULL,
    features_snapshot   SUPER,  -- JSON com features usadas
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, prediction_date)
) SORTKEY(prediction_date);

COMMENT ON TABLE gold.fact_financial_transactions IS 'Todas as transações financeiras da plataforma. LGPD: Zero PII — apenas tenant_id como identificador.';
COMMENT ON TABLE gold.fact_legal_cases IS 'Todos os processos jurídicos. LGPD: cnj_number pseudonimizado.';
