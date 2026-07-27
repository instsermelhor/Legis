"""
Legis Connect — Multi-Agent Supervisor Orchestrator (LangGraph)
Orquestrador Supervisor-Worker para roteamento inteligente de tarefas jurídicas
Padrão: Multi-Agent Orchestration Engine (Prompt 231 - Etapa 5 & ADR-017)
"""

from typing import Annotated, Sequence, TypedDict, Dict, Any
from langchain_core.messages import BaseMessage
import operator


class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    next_step: str
    tenant_id: str
    current_agent: str
    requires_human_approval: bool


class MultiAgentSupervisor:
    """Orquestrador Supervisor que analisa o contexto e escala para o agente especializado correto."""

    def route_request(self, state: AgentState) -> AgentState:
        last_message = state["messages"][-1].content.lower() if state["messages"] else ""

        if any(w in last_message for w in ["pesquisar", "jurisprudência", "súmula", "acórdão"]):
            return {**state, "next_step": "legal_research_agent", "current_agent": "supervisor"}
        
        elif any(w in last_message for w in ["contrato", "cláusula", "análise documental", "pdf"]):
            return {**state, "next_step": "document_intel_agent", "current_agent": "supervisor"}

        elif any(w in last_message for w in ["protocolar", "pagar", "excluir dados", "ajuizar"]):
            return {
                **state,
                "next_step": "human_approval_gate",
                "current_agent": "supervisor",
                "requires_human_approval": True
            }

        else:
            return {**state, "next_step": "general_assistant_agent", "current_agent": "supervisor"}
