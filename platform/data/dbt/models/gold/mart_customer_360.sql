-- Legis Connect — dbt Model: mart_customer_360
-- Visão unificada de 360° por tenant para Customer Success e Sales
-- Owner: Product Data Steward | Refresh: Diário | Tags: customer_success, churn, health

{{ config(
    materialized='table',
    schema='gold',
    alias='mart_customer_360',
    tags=['customer_success', 'churn', 'health_score']
) }}

SELECT
    t.tenant_id,
    t.plan_tier,
    t.segment,
    t.registered_date,
    -- Usage Signals
    COUNT(DISTINCT c.case_id)       AS cases_created_90d,
    COUNT(DISTINCT ai.session_id)   AS ai_sessions_90d,
    SUM(f.amount_brl)               AS revenue_90d,
    -- Engagement
    AVG(ai.quality_score)           AS avg_ai_satisfaction,
    -- Churn Risk (from SageMaker ML model)
    COALESCE(cr.churn_probability, 0.5) AS churn_risk_score,
    CASE
        WHEN COALESCE(cr.churn_probability, 0.5) > 0.70 THEN 'HIGH_RISK'
        WHEN COALESCE(cr.churn_probability, 0.5) > 0.40 THEN 'MEDIUM_RISK'
        ELSE 'HEALTHY'
    END AS health_status,
    -- Metadata
    cr.model_version,
    CURRENT_TIMESTAMP AS calculated_at
FROM {{ ref('dim_tenants') }} t
LEFT JOIN {{ ref('fact_legal_cases') }} c
    ON t.tenant_id = c.tenant_id
    AND c.created_at >= DATEADD(day, -90, CURRENT_DATE)
LEFT JOIN {{ ref('fact_ai_consumption') }} ai
    ON t.tenant_id = ai.tenant_id
    AND ai.created_at >= DATEADD(day, -90, CURRENT_DATE)
LEFT JOIN {{ ref('fact_financial_transactions') }} f
    ON t.tenant_id = f.tenant_id
    AND f.created_at >= DATEADD(day, -90, CURRENT_DATE)
    AND f.transaction_status = 'PAID'
LEFT JOIN {{ source('ml', 'predictions_churn') }} cr
    ON t.tenant_id = cr.tenant_id
    AND cr.prediction_date = CURRENT_DATE
WHERE t.is_active = TRUE
GROUP BY t.tenant_id, t.plan_tier, t.segment, t.registered_date,
         cr.churn_probability, cr.model_version
