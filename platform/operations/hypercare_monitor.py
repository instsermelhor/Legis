"""
Legis Connect — Enterprise Hypercare Monitoring & Alerting Platform
Monitoramento intensivo pos Go-Live — Primeiros 90 dias de Producao
Padrao: Enterprise Hypercare Operating Model (Prompt 238 - Etapa 18)
Integracao: Prometheus + Grafana + PagerDuty + Slack (War Room)
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional


class HypercarePeriod(Enum):
    """Periodos de Hypercare com diferentes nivveis de intensidade de monitoramento."""
    CRITICAL = "dias_1_7"       # War Room 24/7, review a cada 30 min
    INTENSIVE = "dias_8_30"     # Extended hours, briefing 3x/semana
    REDUCTION = "dias_31_90"    # On-call padrao, briefing semanal


class AlertSeverity(Enum):
    P1 = "P1_CRITICAL"    # Plataforma indisponivel — page imediato
    P2 = "P2_HIGH"        # Degradacao significativa — page < 5 min
    P3 = "P3_MEDIUM"      # Impacto parcial — ticket + notificacao
    P4 = "P4_LOW"         # Informativo — log apenas


@dataclass
class HypercareThreshold:
    """Limiares de alerta ajustados por periodo de Hypercare."""
    period: HypercarePeriod
    error_rate_p1_pct: float      # % de erros que dispara P1
    p99_latency_p1_ms: float      # Latencia P99 que dispara P1
    ai_hallucination_pct: float   # % de alucinacoes que dispara P2
    mttr_target_minutes: int      # MTTR alvo para incidentes P1


HYPERCARE_THRESHOLDS = {
    HypercarePeriod.CRITICAL: HypercareThreshold(
        period=HypercarePeriod.CRITICAL,
        error_rate_p1_pct=0.5,     # Mais rigoroso que padrao (1.0%)
        p99_latency_p1_ms=2000.0,  # Mais rigoroso que padrao (3000ms)
        ai_hallucination_pct=2.0,  # Mais rigoroso que padrao (4%)
        mttr_target_minutes=10,    # Mais rigoroso que padrao (15 min)
    ),
    HypercarePeriod.INTENSIVE: HypercareThreshold(
        period=HypercarePeriod.INTENSIVE,
        error_rate_p1_pct=1.0,
        p99_latency_p1_ms=2500.0,
        ai_hallucination_pct=3.0,
        mttr_target_minutes=12,
    ),
    HypercarePeriod.REDUCTION: HypercareThreshold(
        period=HypercarePeriod.REDUCTION,
        error_rate_p1_pct=2.0,     # Padrao de producao
        p99_latency_p1_ms=3000.0,  # Padrao de producao
        ai_hallucination_pct=4.0,  # Padrao de producao
        mttr_target_minutes=15,    # SLA padrao
    ),
}


@dataclass
class HypercareIncident:
    """Registro de incidente durante periodo de Hypercare."""
    incident_id: str
    severity: AlertSeverity
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    description: str = ""
    squad_owner: str = ""
    postmortem_due: Optional[datetime] = None

    @property
    def mttr_minutes(self) -> Optional[float]:
        """Calcula Mean Time to Repair em minutos."""
        if self.resolved_at:
            return (self.resolved_at - self.detected_at).total_seconds() / 60
        return None

    @property
    def is_sla_breach(self) -> bool:
        """Verifica se o MTTR violou o SLA do periodo."""
        period = HypercareMonitor.get_current_period()
        threshold = HYPERCARE_THRESHOLDS[period]
        if self.mttr_minutes and self.severity == AlertSeverity.P1:
            return self.mttr_minutes > threshold.mttr_target_minutes
        return False


class HypercareMonitor:
    """
    Monitor Central de Hypercare — Legis Connect Go-Live.
    Avalia metricas em tempo real e dispara alertas ajustados ao periodo de Hypercare.
    """

    GO_LIVE_DATE = datetime(2026, 8, 10, 2, 0, 0)  # 10/08/2026 02:00 BRT

    EXIT_CRITERIA = [
        "Nenhum incidente P1 nas ultimas 2 semanas consecutivas",
        "Error Budget consumido < 10% no ultimo mes",
        "NPS dos primeiros usuarios > 40",
        "MAU crescendo semana a semana de forma organica",
        "Todos os GAPs do Go-Live fechados (GAP-001 a GAP-005)",
    ]

    @classmethod
    def get_current_period(cls) -> HypercarePeriod:
        """Determina o periodo de Hypercare baseado nos dias desde o Go-Live."""
        days_since_golive = (datetime.utcnow() - cls.GO_LIVE_DATE).days
        if days_since_golive <= 7:
            return HypercarePeriod.CRITICAL
        elif days_since_golive <= 30:
            return HypercarePeriod.INTENSIVE
        else:
            return HypercarePeriod.REDUCTION

    @classmethod
    def evaluate_metric(
        cls,
        metric_name: str,
        value: float,
        period: Optional[HypercarePeriod] = None
    ) -> Dict:
        """
        Avalia uma metrica contra os limiares do periodo de Hypercare atual.
        Retorna o status e a acao recomendada.
        """
        period = period or cls.get_current_period()
        threshold = HYPERCARE_THRESHOLDS[period]
        result = {"metric": metric_name, "value": value, "period": period.value}

        if metric_name == "error_rate_pct":
            if value > threshold.error_rate_p1_pct:
                result.update({"severity": AlertSeverity.P1.value, "action": "PAGE_IMMEDIATE"})
            else:
                result.update({"severity": "OK", "action": "NONE"})

        elif metric_name == "p99_latency_ms":
            if value > threshold.p99_latency_p1_ms:
                result.update({"severity": AlertSeverity.P1.value, "action": "PAGE_IMMEDIATE"})
            else:
                result.update({"severity": "OK", "action": "NONE"})

        elif metric_name == "ai_hallucination_pct":
            if value > threshold.ai_hallucination_pct:
                result.update({"severity": AlertSeverity.P2.value, "action": "NOTIFY_AI_TEAM"})
            else:
                result.update({"severity": "OK", "action": "NONE"})

        return result

    @classmethod
    def check_exit_criteria(cls, metrics: Dict[str, float]) -> Dict:
        """
        Verifica se os criterios de saida do Hypercare foram atingidos.
        Retorna True se a plataforma pode sair do Hypercare para BAU.
        """
        checks = {
            "no_p1_in_2_weeks": metrics.get("p1_incidents_last_14d", 1) == 0,
            "error_budget_ok": metrics.get("error_budget_consumed_pct", 100) < 10,
            "nps_ok": metrics.get("user_nps", 0) > 40,
            "mau_growing": metrics.get("mau_growth_rate_wow", 0) > 0,
            "gaps_closed": metrics.get("open_gaps_count", 5) == 0,
        }
        all_passed = all(checks.values())
        return {
            "hypercare_exit_approved": all_passed,
            "checks": checks,
            "recommendation": "APPROVE_BAU_TRANSITION" if all_passed else "CONTINUE_HYPERCARE",
        }

    @classmethod
    def generate_executive_briefing(cls, metrics: Dict[str, float]) -> str:
        """Gera briefing executivo automatico para as reunioes diarias de Hypercare."""
        period = cls.get_current_period()
        threshold = HYPERCARE_THRESHOLDS[period]

        return f"""
HYPERCARE EXECUTIVE BRIEFING — {datetime.now().strftime('%d/%m/%Y %H:%M')} BRT
Periodo: {period.value} | MTTR Target: {threshold.mttr_target_minutes} min

SAUDE DA PLATAFORMA:
  Availability: {metrics.get('availability_pct', 0):.3f}%
  Error Rate:   {metrics.get('error_rate_pct', 0):.3f}%
  P99 Latency:  {metrics.get('p99_latency_ms', 0):.0f}ms

NEGOCIO:
  Novos Usuarios:  {int(metrics.get('new_users_today', 0))}
  Receita Hoje:    R$ {metrics.get('revenue_today', 0):.2f}
  AI Deflection:   {metrics.get('ai_deflection_pct', 0):.1f}%

PROXIMOS PASSOS:
  {chr(10).join(f'  - {c}' for c in cls.EXIT_CRITERIA[:3])}

STATUS: {"🟢 VERDE — Todos os indicadores dentro dos limiares" if metrics.get('overall_status') == 'GREEN' else "🔴 ATENCAO — Investigar indicadores acima do threshold"}
        """.strip()
