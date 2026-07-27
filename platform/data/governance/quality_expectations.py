"""
Legis Connect — Enterprise Data Quality Validation Engine
Suíte de Testes de Qualidade de Dados usando Great Expectations
Padrão: Enterprise Data Quality Framework (Prompt 232 - Etapa 13)
"""

import pandas as pd


class DataQualityValidator:
    """Validador automatizado de regras de qualidade para promoção de datasets da camada Silver para Gold."""

    def validate_legal_cases_silver(self, df: pd.DataFrame) -> dict:
        errors = []

        # Rule 1: CNJ Number não pode ser nulo
        null_cnj_count = df["cnj_number"].isnull().sum()
        if null_cnj_count > 0:
            errors.append(f"Regra violada: {null_cnj_count} linhas com cnj_number nulo.")

        # Rule 2: tenant_id não pode ser nulo
        null_tenant_count = df["tenant_id"].isnull().sum()
        if null_tenant_count > 0:
            errors.append(f"Regra violada: {null_tenant_count} linhas com tenant_id nulo.")

        # Rule 3: Unicidade de case_id
        duplicate_cases = df["case_id"].duplicated().sum()
        if duplicate_cases > 0:
            errors.append(f"Regra violada: {duplicate_cases} case_ids duplicados encontrados.")

        is_passed = len(errors) == 0
        score = 100.0 if is_passed else max(0.0, 100.0 - (len(errors) * 10.0))

        return {
            "passed": is_passed,
            "quality_score": score,
            "error_count": len(errors),
            "errors": errors
        }
