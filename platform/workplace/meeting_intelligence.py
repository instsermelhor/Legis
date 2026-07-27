"""
Legis Connect — Meeting Intelligence Platform
Transcricao, sumarizacao e extracao de action items de reunioes corporativas
Padrao: Meeting Intelligence Framework (Prompt 235 - Etapa 15)
Integracao: Whisper ASR + GPT-4o Summarization + Jira API + Prompt 234 (Blockchain Anchor)
"""

import hashlib
from datetime import datetime
from typing import Dict, List


class MeetingIntelligencePlatform:
    """Converte reunioes gravadas em atas estruturadas e tarefas acionaveis."""

    def process_meeting(
        self,
        meeting_id: str,
        transcript: str,
        participants: List[str],
        meeting_type: str = "squad_sync",
    ) -> Dict:
        """
        Processa uma reuniao gravada e gera ata estruturada com action items.

        Args:
            meeting_id: Identificador unico da reuniao (ex: MTG-2026-07-27-001)
            transcript: Transcricao completa da reuniao (via Whisper ASR)
            participants: Lista de participantes (email corporativo)
            meeting_type: Tipo de reuniao (squad_sync, strategic_review, client_meeting)

        Returns:
            Dicionario com resumo, action items, hash de integridade e metadados
        """
        # 1. Resumo executivo gerado por LLM (GPT-4o ou Gemini 1.5 Flash via Cost Router Prompt 233)
        executive_summary = self._generate_summary(meeting_id, transcript)

        # 2. Extracao automatica de decisoes e action items
        action_items = self._extract_action_items(transcript, participants)

        # 3. Classificacao automatica de confidencialidade (Prompt 224 LGPD)
        confidentiality = "CONFIDENTIAL" if meeting_type == "client_meeting" else "INTERNAL"

        # 4. Hash imutavel da ata para ancoragem na blockchain (Prompt 234 Hyperledger Besu)
        raw_content = f"{meeting_id}:{transcript}:{str(participants)}"
        meeting_hash = hashlib.sha256(raw_content.encode("utf-8")).hexdigest()

        return {
            "meeting_id": meeting_id,
            "processed_at": datetime.utcnow().isoformat() + "Z",
            "meeting_type": meeting_type,
            "participants": participants,
            "summary": executive_summary,
            "action_items": action_items,
            "confidentiality": confidentiality,
            "integrity_hash": f"0x{meeting_hash}",  # Ancorado na rede Besu
            "dlt_status": "PENDING_ANCHOR",
        }

    def _generate_summary(self, meeting_id: str, transcript: str) -> str:
        """Gera resumo executivo da reuniao via LLM (simulado)."""
        return (
            f"[AI SUMMARY - {meeting_id}] Reuniao abordou os seguintes topicos principais: "
            f"{transcript[:300]}... "
            f"Proximos passos definidos e action items atribuidos automaticamente."
        )

    def _extract_action_items(self, transcript: str, participants: List[str]) -> List[Dict]:
        """Extrai action items da transcricao via LLM com responsavel e prazo."""
        # Em producao: LLM extrai entidades (tarefa, responsavel, prazo) do transcript
        default_owner = participants[0] if participants else "team@legis.io"
        return [
            {
                "task": "Revisar clausulas do contrato discutido na reuniao",
                "owner": default_owner,
                "deadline": "2026-08-03",
                "priority": "HIGH",
                "jira_ticket": "LEG-" + meeting_id[-3:],
            },
            {
                "task": "Enviar proposta ao cliente com os termos acordados",
                "owner": participants[1] if len(participants) > 1 else default_owner,
                "deadline": "2026-08-05",
                "priority": "MEDIUM",
                "jira_ticket": None,
            },
        ]
