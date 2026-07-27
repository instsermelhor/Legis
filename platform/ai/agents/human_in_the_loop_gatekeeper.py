"""
Legis Connect — Human-in-the-Loop (HitL) Gatekeeper
Mecanismo de Interrupção e Aprovação Humana Obrigatória para Ações de Alto Risco
Padrão: Human-in-the-Loop Architecture (Prompt 231 - Etapa 20)
"""

from typing import Dict, Any


class HumanInTheLoopGatekeeper:
    """Interrompe fluxos de agentes quando a ação envolve riscos financeiros ou judiciais irreversíveis."""

    HIGH_RISK_ACTIONS = [
        "PROTOCOL_PETITION",
        "EXECUTE_PAYMENT",
        "DELETE_CASE_DATA",
        "ISSUE_LEGAL_OPINION_EXTERNAL"
    ]

    def evaluate_action_risk(self, action_name: str, agent_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        is_high_risk = action_name.upper() in self.HIGH_RISK_ACTIONS

        if is_high_risk:
            print(f"[HitL GATEKEEPER] Ação '{action_name}' pelo agente '{agent_id}' requer aprovação humana explícita.")
            return {
                "status": "AWAITING_HUMAN_APPROVAL",
                "requires_approval": True,
                "action": action_name,
                "agent_id": agent_id,
                "payload": payload,
                "approval_url": f"https://app.legis-connect.com/approvals/task-{agent_id}"
            }

        return {
            "status": "APPROVED_AUTOMATICALLY",
            "requires_approval": False,
            "action": action_name,
            "agent_id": agent_id,
            "payload": payload
        }
