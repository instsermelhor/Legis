# ADR-037: Sprint 4 Secure Communication — Signal Protocol E2EE, WebRTC SFU & Digital Evidence Vault
# Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Technology Officer, CISO, Secure Communications Architect, Collaboration Systems Architect

## Contexto
Com o núcleo de Serviços Jurídicos concluído na Sprint 3 (Prompt 250), a Sprint 4 estabelece os mecanismos de comunicação segura entre clientes, advogados e equipes jurídicas. Para garantir o sigilo profissional (estatuto da OAB) e a conformidade com LGPD/ISO 27001, é necessário implementar criptografia ponta a ponta, chamadas WebRTC de alta fidelidade e um Cofre Digital de Evidências com cadeia de custódia auditável.

## Decisões Técnicas

### 1. Criptografia E2EE Baseada no Signal Protocol
- Toda troca de mensagens privadas utiliza o **Signal Protocol** (X3DH Key Exchange + Double Ratchet). As chaves privadas nunca saem dos dispositivos finais dos usuários.

### 2. Videoconferência WebRTC com Cluster SFU MediaSoup
- As chamadas de áudio e vídeo utilizam o WebRTC acoplado a um cluster auto-escalável de servidores SFU (*Selective Forwarding Unit*) em EKS, garantindo suporte a múltiplos participantes com latência P95 < 50ms.

### 3. Cofre Digital de Evidências (*Digital Evidence Vault*)
- Todos os arquivos e mídias confidenciais armazenados no Cofre Digital possuem seus hashes SHA-256 e Keccak-256 gravados imutavelmente na blockchain Hyperledger Besu (ADR-020), gerando logs de cadeia de custódia aceitos em perícias judiciais (ISO 27037).

### 4. Emissão da Autorização para Início da Sprint 5
- Certificar a conclusão da Sprint 4 com 92.8% de cobertura de testes e emitir a ordem executiva **AUTH-SPRINT5-2026-001** autorizando o desenvolvimento dos módulos de Gestão de Casos Jurídicos, Prazos Processuais e Automação Jurídica.

## Consequências
- Positivas: Sigilo absoluto de conversas cliente-advogado; cadeia de custódia inquestionável para provas digitais; chamadas WebRTC HD de alta resiliência.
- Regra de Ouro: Proibição estrita de armazenamento de chaves privadas E2EE em servidores da plataforma.
