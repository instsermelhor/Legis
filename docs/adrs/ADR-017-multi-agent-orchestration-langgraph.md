# ADR-017: Seleção do LangGraph para Orquestração da Plataforma de Agentes Multi-Agentes
Status: APROVADO | Data: 27/07/2026 | Decisores: Chief AI Officer, Enterprise AI Architect, CTO

## Contexto
A Legis Connect precisa de uma engine de orquestração de agentes autônomos capaz de gerenciar grafos de estado cíclicos,
fluxos assíncronos duráveis, persistência de memória por thread e pontos de aprovação humana (Human-in-the-loop)
com controle de concorrência, auditabilidade total e baixa latência.

## Opções Avaliadas
| Framework | Suporte a Grafos Cíclicos | Human-in-the-Loop | Auditabilidade de Estado | Decisão |
|---|---|---|---|---|
| **LangGraph (LangChain Ecosystem)** | Excelente (Nativo) | Excelente (`interrupt`) | Excelente (State Checkpointing) | **ESCOLHIDA** |
| AutoGen (Microsoft) | Bom | Parcial | Complexo | Descartada |
| CrewAI | Limitado (Linear) | Básico | Básico | Descartada |

## Decisão
Adotar **LangGraph** integrado a microsserviços Python/FastAPI e NestJS:
- **Supervisor-Worker Pattern**: Nó Supervisor roteia solicitações para agentes especializados (Legal Research, Contract AI, Compliance).
- **Model Context Protocol (MCP)**: Padronização da interface de chamadas de ferramentas (tools) para bancos e APIs.
- **Human-in-the-Loop (HitL)**: Pontos de interrupção explícitos (`interrupt`) para ações de alto risco que exigem chancela humana (EU AI Act / LGPD).

## Consequências
- Positivas: Máxima flexibilidade para grafos complexos com checkpointing no Redis e auditabilidade total de rastro de raciocínio.
- Mitigações: Estabelecer limites rígidos de recursão nos grafos de estado para evitar loops infinitos de agentes.
