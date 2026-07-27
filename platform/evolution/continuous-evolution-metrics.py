"""
Legis Connect — Continuous Evolution Metrics Engine
Calculo automatizado de metricas de sustentabilidade, divida tecnica e saude arquitetural.
Padrao: Enterprise Evolution Metrics Framework (Prompt 239 - Etapa 23)
Integracao: SonarQube + GitHub Actions + PagerDuty + Jira API
"""

from dataclasses import dataclass
from typing import Dict, List


@dataclass
class ArchitectureHealthReport:
    maintainability_index: float   # Target > 65 (SonarQube)
    test_coverage_pct: float       # Target > 85%
    tech_debt_ratio_pct: float     # Target < 15%
    dependency_green_pct: float    # Target > 70%
    lead_time_days: float          # Target < 2 dias (DORA)
    deployment_freq_weekly: int    # Target > 20/semana
    overall_sustainability_score: float  # 0-100


class EvolutionMetricsEngine:
    """
    Engine de metricas de evolucao continua da Legis Connect.
    Consolida indicadores de qualidade, velocidade, sustentabilidade e divida tecnica.
    """

    @classmethod
    def calculate_sustainability_score(
        cls,
        maintainability: float,
        coverage: float,
        doc_coverage: float,
        dep_health: float,
        security_score: float,
    ) -> float:
        """
        Calcula o Sustainability Score ponderado (0-100).
        """
        score = (
            (min(maintainability, 100) * 0.30) +
            (min(coverage, 100) * 0.25) +
            (min(doc_coverage, 100) * 0.20) +
            (min(dep_health, 100) * 0.15) +
            (min(security_score, 100) * 0.10)
        )
        return round(score, 2)

    @classmethod
    def evaluate_technology_obsolescence(cls, dependencies: List[Dict]) -> Dict:
        """
        Calcula o Technology Obsolescence Index (TOI).
        Classifica dependencias nas janelas Verde (0-3 anos), Amarela (3-5 anos) e Vermelha (> 5 anos/EOL).
        """
        total = len(dependencies)
        if total == 0:
            return {"toi_score": 100.0, "green_pct": 100.0, "yellow_pct": 0.0, "red_pct": 0.0}

        green = sum(1 for d in dependencies if d.get("years_to_eol", 0) >= 3)
        yellow = sum(1 for d in dependencies if 1 <= d.get("years_to_eol", 0) < 3)
        red = sum(1 for d in dependencies if d.get("years_to_eol", 0) < 1 or d.get("is_eol", False))

        green_pct = round((green / total) * 100, 1)
        yellow_pct = round((yellow / total) * 100, 1)
        red_pct = round((red / total) * 100, 1)

        # TOI: quanto maior a % verde e menor a vermelha, maior a pontuacao (0-100)
        toi_score = round(green_pct * 0.7 + yellow_pct * 0.3 - red_pct * 0.5, 1)
        toi_score = max(0.0, min(100.0, toi_score))

        return {
            "toi_score": toi_score,
            "green_pct": green_pct,
            "yellow_pct": yellow_pct,
            "red_pct": red_pct,
            "action_required": red > 0,
        }

    @classmethod
    def generate_annual_review_summary(cls, metrics: ArchitectureHealthReport) -> str:
        """
        Gera resumo para a Annual Architecture Review (Dezembro).
        """
        status_symbol = "🟢 EXCEPCIONAL" if metrics.overall_sustainability_score >= 85 else (
            "🟡 ADEQUADO" if metrics.overall_sustainability_score >= 70 else "🔴 NECESSITA ACAO"
        )

        return f"""
=====================================================================
 ANNUAL ENTERPRISE ARCHITECTURE REVIEW SUMMARY — LEGIS CONNECT
 Status Geral: {status_symbol}
=====================================================================

 METRICAS DE SUSTENTABILIDADE DE SOFTWARE:
  - Sustainability Score:   {metrics.overall_sustainability_score} / 100
  - Maintainability Index:  {metrics.maintainability_index} / 100 (Target > 65)
  - Cobertura de Testes:   {metrics.test_coverage_pct}% (Target > 85%)
  - Dependencias Verdes:    {metrics.dependency_green_pct}% (Target > 70%)

 GOVERNANCA DE DIVIDA TECNICA:
  - Tech Debt Ratio:       {metrics.tech_debt_ratio_pct}% (Target < 15%)

 VELOCIDADE DE ENGENHARIA (DORA):
  - Lead Time:              {metrics.lead_time_days} dias (Target < 2 dias)
  - Frequencia de Deploy:   {metrics.deployment_freq_weekly} deploys/semana (Target > 20)

 RECOMENDACAO DO ARB:
  {"Aprovado para expansao contínua com cota de 20% mantida." if metrics.overall_sustainability_score >= 75 else "Alocar 30% da capacidade das proximas 4 sprints para refinamento de divida tecnica."}
=====================================================================
""".strip()
