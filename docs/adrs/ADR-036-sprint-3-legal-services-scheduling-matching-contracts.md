# ADR-036: Sprint 3 Legal Services Platform — Smart Scheduling, Intelligent Matching & Service Contracts
# Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Product Officer, AI Solutions Architect, Backend Engineering Director, Legal Operations Director

## Contexto
Com a fundação do Marketplace Jurídico concluída na Sprint 2 (Prompt 249), a Sprint 3 estabelece o núcleo operacional de prestação e contratação de serviços jurídicos digitais: o Smart Scheduling Engine, o Intelligent Matching Engine, o Intake Digital e o Service Contract Engine.

## Decisões Técnicas

### 1. Smart Scheduling Engine Desacoplado
- Implementar a gestão de horários e reservas de consultas como um microsserviço independente com controle estrito de concorrência no Redis para evitar agendamentos duplicados (*double-booking*).

### 2. Algoritmo de Pareamento Inteligente por IA (Intelligent Matching)
- O motor de matching calcula o índice de afinidade (`matchScorePct`) em tempo real considerando 7 atributos: especialidade OAB, localização, valor de honorários, idioma, urgência, disponibilidade imediata e histórico de avaliações.

### 3. Validade Jurídica de Contratos com W3C Verifiable Credentials
- Minutas de contratos de prestação de serviços jurídicos geradas automaticamente são assinadas digitalmente usando W3C Verifiable Credentials (Prompt 234) com ancoragem do hash de auditoria no ledger Hyperledger Besu (ADR-020).

### 4. Emissão da Autorização para Início da Sprint 4
- Certificar a conclusão da Sprint 3 com 92.1% de cobertura de testes e emitir a ordem executiva **AUTH-SPRINT4-2026-001** autorizando o desenvolvimento dos módulos de Mensageria Segura, WebRTC Audio/Vídeo, Cofre Digital de Documentos e Colaboração em Tempo Real.

## Consequências
- Positivas: Redução a zero de agendamentos conflitantes; pareamento cliente-advogado em menos de 50ms; contratos de honorários auditáveis e com plena validade jurídica.
- Regra de Ouro: Proibição estrita de acesso aos documentos do Intake por advogados não envolvidos no agendamento.
