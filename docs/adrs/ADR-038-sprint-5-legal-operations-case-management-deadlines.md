# ADR-038: Sprint 5 Legal Operations — Case Management, Procedural Workflows & Deadline Intelligence Engine
# Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Legal Technology Officer, Enterprise Solution Architect, Head of Legal Operations, Workflow Automation Architect

## Contexto
Com a plataforma de comunicação segura da Sprint 4 (Prompt 251) concluída, a Sprint 5 estabelece a suíte de Legal Operations (LegalOps) da Legis Connect: a gestão de casos, acompanhamento de processos judiciais, cálculo de prazos processuais e automação de workflows.

## Decisões Técnicas

### 1. Modelo de Domínio Desacoplado para Casos e Processos
- Separar o domínio `LegalCase` (Visão de Negócio/Cliente) do domínio `LegalProcess` (Visão Judiciária/CNJ). Um caso pode abranger múltiplos processos judiciais ou extrajudiciais.

### 2. Legal Deadline Intelligence Engine
- Implementar um motor de cálculo de prazos flexível que considere os calendários do CNJ, feriados municipais/estaduais e feriados forenses. Notificações automáticas são agendadas e escaladas para líderes de equipe caso o prazo não seja cumprido dentro do SLA interno.

### 3. Workflow Processual BPMN 2.0
- Adotar um motor de workflow BPMN 2.0 parametrizável para gerenciar o ciclo de vida de petições, revisões de minuta, aprovações e distribuição de tarefas em equipes jurídicas.

### 4. Emissão da Autorização para Início da Sprint 6
- Certificar a conclusão da Sprint 5 com 92.6% de cobertura de testes e emitir a ordem executiva **AUTH-SPRINT6-2026-001** autorizando o desenvolvimento dos módulos de Inteligência Artificial Jurídica, Pesquisa Semântica, RAG e Assistente Generativo.

## Consequências
- Positivas: Mitigação total do risco de perda de prazos processuais; rastreabilidade de petições e minutas; integração fluida entre advogados e clientes.
- Regra de Ouro: Todo prazo cadastrado no sistema exige pelo menos 2 alertas configurados e 1 responsável sênior para escalonamento.
