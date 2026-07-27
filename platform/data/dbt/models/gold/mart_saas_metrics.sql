-- Legis Connect — dbt Model: mart_saas_metrics
-- Calcula métricas SaaS padrão: MRR, ARR, ARPU, Churn Rate, Growth
-- Owner: Financial Data Steward | Refresh: A cada 6 horas | SLA: < 4 horas de lag

{{ config(
    materialized='table',
    schema='gold',
    alias='mart_saas_metrics',
    tags=['financial', 'kpi', 'executive']
) }}

WITH monthly_revenue AS (
    SELECT
        DATE_TRUNC('month', created_at)::DATE AS month,
        tenant_id,
        SUM(amount_brl) AS monthly_revenue
    FROM {{ ref('fact_financial_transactions') }}
    WHERE transaction_status = 'PAID'
      AND amount_brl > 0
    GROUP BY 1, 2
),

mrr_by_month AS (
    SELECT
        month,
        SUM(monthly_revenue) AS total_mrr,
        SUM(monthly_revenue) * 12 AS annualized_arr,
        AVG(monthly_revenue) AS arpu,
        COUNT(DISTINCT tenant_id) AS paying_tenants
    FROM monthly_revenue
    GROUP BY 1
),

mrr_with_growth AS (
    SELECT
        month,
        total_mrr,
        annualized_arr,
        arpu,
        paying_tenants,
        -- MoM Growth Rate
        ROUND(
            (total_mrr - LAG(total_mrr) OVER (ORDER BY month))
            / NULLIF(LAG(total_mrr) OVER (ORDER BY month), 0) * 100, 2
        ) AS mrr_growth_pct,
        -- Net New MRR
        total_mrr - LAG(total_mrr) OVER (ORDER BY month) AS net_new_mrr,
        -- Tenant Growth
        paying_tenants - LAG(paying_tenants) OVER (ORDER BY month) AS net_new_tenants
    FROM mrr_by_month
)

SELECT * FROM mrr_with_growth
ORDER BY month DESC
