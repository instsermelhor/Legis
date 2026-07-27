# ADR-026: Autonomous Governance, Human-in-the-Loop Levels & Safety Boundaries
# Status: APROVADO | Data: 27/07/2026 | Decisores: CTO, CISO, CAIO, Chief Autonomous Systems Officer

## Contexto
Com a implantação de capacidades autônomas na Legis Connect (Prompt 240), é essencial estabelecer limites claros de governança ética, segurança e soberania humana. A automação não supervisionada em domínios jurídicos ou estratégicos pode acarretar riscos regulatórios, operacionais e financeiros inaceitáveis.

## Decisões Técnicas

### 1. Escala de 5 Níveis de Autonomia
Adotar uma classificação formal de autonomia para todos os agentes e automações da plataforma:
- **Level 0 (Manual):** Operação 100% humana (M&A, pareceres estratégicos, decisões de pessoal).
- **Level 1 (Observação):** IA apenas monitora e analisa telemetria/dados.
- **Level 2 (Recomendação):** IA sugere ações (minutas de petições, jurisprudência, rascunhos). Advogado deve aprovar.
- **Level 3 (Supervisionada):** IA executa ações operacionais simples com notificação imediata aos humanos e janela de override (15 min).
- **Level 4 (Automática):** IA executa e reporta em relatório diário (Self-healing de infraestrutura, auto-scaling, bloqueio de IP no WAF).

### 2. Guardrails Obrigatórios
- **Veto Humano Absoluto:** Qualquer operador autorizado pode acionar o *Emergency Global Stop* ou desativar autonomias específicas por domínio a qualquer momento.
- **Auditabilidade Imutável:** Todas as execuções autônomas de nível 3 e 4 geram hashes de transação registrados na blockchain Hyperledger Besu (ADR-020).
- **Zero Decisão Jurídica Autônoma:** Agentes de IA estão estritamente proibidos de enviar petições, contratos ou recursos diretamente a órgãos judiciais ou clientes sem aprovação humana prévia.

## Consequências
- Positivas: Eliminação de 80% das tarefas repetitivas de TI e operações sem comprometer a segurança, conformidade e governança humana.
- Mitigações: Treinamento contínuo de equipes para monitorar o Cognitive Dashboard e agir em caso de discrepâncias nos alertas preditivos.
