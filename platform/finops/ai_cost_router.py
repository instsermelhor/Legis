"""
Legis Connect — AI Cost Router (Model Cascade Router)
Roteador de Custo Otimizado de Modelos LLM para garantia de Margem Bruta
Padrão: AI Cost Governance Framework (Prompt 233 - Etapa 10 & Prompt 217/231 Integration)
"""

from typing import Dict, Any


class AICostRouter:
    """Roteia a chamada de IA para o modelo com menor custo que satisfaça os requisitos de qualidade."""

    MODEL_PRICING: Dict[str, Dict[str, float]] = {
        "gpt-4o": {"input_per_k": 0.005, "output_per_k": 0.015},      # Modelos Premium
        "claude-3-5": {"input_per_k": 0.003, "output_per_k": 0.015},  # Modelos Premium
        "gemini-1-5-flash": {"input_per_k": 0.00035, "output_per_k": 0.00105}, # Ultra Economico (14x menor custo)
    }

    def select_cost_effective_model(self, task_complexity: str) -> str:
        if task_complexity in ["SIMPLE_TRIAGE", "TOKEN_COUNTING", "SIMPLE_SUMMARIZATION"]:
            return "gemini-1-5-flash"
        elif task_complexity == "CLAUSE_CLASSIFICATION":
            return "gemini-1-5-flash"
        else:
            return "gpt-4o"  # Apenas para raciocínio jurídico complexo e petições finais

    def calculate_estimated_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        pricing = self.MODEL_PRICING.get(model, self.MODEL_PRICING["gemini-1-5-flash"])
        cost = ((input_tokens / 1000.0) * pricing["input_per_k"]) + ((output_tokens / 1000.0) * pricing["output_per_k"])
        return round(cost, 6)
