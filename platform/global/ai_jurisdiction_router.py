"""
Legis Connect — AI Jurisdiction Router
Roteador de Inteligência Jurídica Regional e RAG por Jurisdição
Padrão: Global AI Localization Framework (Prompt 230 - Etapa 20 & Prompt 217 Integration)
"""

from typing import Dict, Any


class AIJurisdictionRouter:
    """Roteia a consulta do usuário para a base vetorial e sistema de leis da jurisdição correta."""

    JURISDICTION_CONFIGS: Dict[str, Dict[str, Any]] = {
        "BRA": {
            "legal_system": "CIVIL_LAW",
            "vector_index": "br_laws_index",
            "language": "pt-BR",
            "system_prompt": "Você é um assistente de IA especialista em Direito Brasileiro (Civil Law)."
        },
        "USA": {
            "legal_system": "COMMON_LAW",
            "vector_index": "us_case_law_index",
            "language": "en-US",
            "system_prompt": "You are an AI assistant expert in US Common Law and Federal Precedents."
        },
        "DEU": {
            "legal_system": "CIVIL_LAW",
            "vector_index": "de_bgb_index",
            "language": "de-DE",
            "system_prompt": "Sie sind ein KI-Assistent und Experte für deutsches Recht (BGB)."
        },
    }

    def route_query(self, query: str, jurisdiction_code: str) -> Dict[str, Any]:
        config = self.JURISDICTION_CONFIGS.get(jurisdiction_code.upper())
        if not config:
            raise ValueError(f"Jurisdição '{jurisdiction_code}' não suportada atualmente.")
        
        return {
            "query": query,
            "jurisdiction": jurisdiction_code,
            "legal_system": config["legal_system"],
            "vector_index": config["vector_index"],
            "language": config["language"],
            "system_prompt": config["system_prompt"],
        }
