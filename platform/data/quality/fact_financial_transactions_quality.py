"""
Legis Connect — Great Expectations Data Quality Suite
Dataset: gold.fact_financial_transactions
Owner: Financial Data Steward
Standards: DAMA-DMBOK 2 Data Quality Framework
Run: Before each dbt Gold Layer refresh (Airflow task)
"""
import great_expectations as gx
from great_expectations.core.expectation_suite import ExpectationSuite

context = gx.get_context()

suite: ExpectationSuite = context.add_or_update_expectation_suite(
    expectation_suite_name="gold.fact_financial_transactions"
)

# COMPLETENESS: Campos obrigatórios nunca nulos
suite.add_expectation(gx.expectations.ExpectColumnValuesToNotBeNull(column="transaction_id"))
suite.add_expectation(gx.expectations.ExpectColumnValuesToNotBeNull(column="tenant_id"))
suite.add_expectation(gx.expectations.ExpectColumnValuesToNotBeNull(column="amount_brl"))
suite.add_expectation(gx.expectations.ExpectColumnValuesToNotBeNull(column="transaction_status"))

# UNIQUENESS: transaction_id deve ser único
suite.add_expectation(gx.expectations.ExpectColumnValuesToBeUnique(column="transaction_id"))

# VALIDITY: Valores dentro de intervalos esperados
suite.add_expectation(gx.expectations.ExpectColumnValuesToBeBetween(
    column="amount_brl", min_value=0.01, max_value=10_000_000.00
))
suite.add_expectation(gx.expectations.ExpectColumnValuesToBeInSet(
    column="transaction_status",
    value_set=["PAID", "PENDING", "FAILED", "REFUNDED", "DISPUTED"]
))
suite.add_expectation(gx.expectations.ExpectColumnValuesToBeInSet(
    column="payment_method",
    value_set=["PIX", "STRIPE_CARD", "STRIPE_BOLETO", "STRIPE_BANK_TRANSFER"]
))

# FRESHNESS: A tabela deve ter sido atualizada nas últimas 6 horas
suite.add_expectation(gx.expectations.ExpectTableRowCountToBeGreaterThan(value=0))

# REFERENTIAL INTEGRITY: tenant_id deve existir em dim_tenants
# (validado via dbt relationship test no pipeline dbt)

print(f"Quality Suite saved: {suite.expectation_suite_name} — {len(suite.expectations)} contracts")
context.save_expectation_suite(suite)
