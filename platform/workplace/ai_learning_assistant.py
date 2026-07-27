"""
Legis Connect — AI Learning Assistant
Agente de IA para recomendacao de trilhas de aprendizado corporativo
Padrao: AI Learning Assistant Framework (Prompt 235 - Etapa 13)
Integracao: LangGraph (Prompt 231) + Knowledge Graph (Prompt 220) + LMS Docebo
"""

from typing import List, Dict


class LegalLearningAgent:
    """Agente de IA especializado em trilhas de aprendizado juridico e tecnico."""

    SKILL_GAP_COURSES: Dict[str, List[str]] = {
        "junior_lawyer": [
            "Direito Processual Civil Avancado",
            "LGPD Aplicada ao Direito",
            "Legal Tech Basics",
            "Estrategia de Negociacao",
        ],
        "senior_lawyer": [
            "Estrategia Juridica Empresarial",
            "AI for Legal Professionals",
            "Contratos Internacionais (Common Law vs Civil Law)",
            "Gestao de Escritorios Juridicos",
        ],
        "software_engineer": [
            "Domain-Driven Design",
            "Event-Driven Architecture com Kafka",
            "AI Engineering with LangChain",
            "FinOps for Engineers",
        ],
        "product_manager": [
            "Product Discovery Framework",
            "OKRs para Produto",
            "Data-Driven Product Management",
            "LegalTech Market Strategy",
        ],
    }

    def recommend_learning_path(self, employee_role: str, completed_courses: List[str]) -> Dict:
        """Recomenda trilha de aprendizado personalizada baseada no cargo e historico."""
        all_courses = self.SKILL_GAP_COURSES.get(employee_role, [])
        pending_courses = [c for c in all_courses if c not in completed_courses]

        urgency = "HIGH" if len(pending_courses) >= 3 else "MEDIUM" if len(pending_courses) >= 1 else "NONE"

        return {
            "employee_role": employee_role,
            "total_courses_in_path": len(all_courses),
            "completed": len(completed_courses),
            "pending_courses": pending_courses,
            "completion_percentage": round((len(completed_courses) / max(len(all_courses), 1)) * 100, 1),
            "urgency": urgency,
        }

    def answer_legal_question(self, question: str, context: str = "") -> str:
        """Responde perguntas juridicas consultando a Knowledge Base via RAG."""
        # Integracao com ElasticSearch + Knowledge Graph (Prompt 220)
        print(f"[AI LEARNING] Consultando Knowledge Base para: '{question}'")
        return f"[KNOWLEDGE BASE] Resposta para '{question}' baseada no contexto: {context or 'Knowledge Base Geral'}"

    def generate_onboarding_plan(self, employee_role: str, start_date: str) -> Dict:
        """Gera plano de onboarding personalizado para novo colaborador."""
        courses = self.SKILL_GAP_COURSES.get(employee_role, [])
        return {
            "employee_role": employee_role,
            "start_date": start_date,
            "onboarding_duration_days": 30,
            "week_1": courses[:1] if courses else [],
            "week_2_4": courses[1:3] if len(courses) > 1 else [],
            "month_2_3": courses[3:] if len(courses) > 3 else [],
        }
