# ADR-035: Sprint 2 Marketplace Foundation — Lawyer Registry, OAB Verification Engine & Search Indexing
# Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Product Officer, Enterprise Marketplace Architect, Lead Backend Architect, Identity & Verification Architect

## Contexto
Com o módulo de Identidade da Sprint 1 (Prompt 248) concluído e certificado, a Sprint 2 estabelece os primeiros domínios de negócio da plataforma Legis Connect: o cadastro de Advogados (Lawyer Registry), Clientes (Client Registry), o Motor de Validação OAB (Verification Engine) e a Busca Híbrida Profissional.

## Decisões Técnicas

### 1. Desacoplamento dos Domínios Lawyer e Client
- Implementar os domínios `Lawyer` e `Client` como microsserviços desacoplados e orientados a eventos (*Event-Driven Architecture*), mantendo a entidade de usuário de identidade apenas como referência (`userId` / `tenantId`).

### 2. Verification Engine com Integração CNA/OAB
- Toda conta de advogado criada é submetida ao **Verification Engine**, que consulta assincronamente a API do Cadastro Nacional dos Advogados (CNA/OAB).
- Somente advogados com status `VERIFIED_ACTIVE` têm permissão para publicar perfil público e receber contatos no Marketplace.

### 3. Indexação de Busca Híbrida (BM25 + pgvector)
- Perfis de advogados validados são sincronizados via eventos Kafka para o índice de busca no Elasticsearch/pgvector, permitindo buscas em tempo real por localização, especialidade e biografia em menos de 50ms.

### 4. Emissão da Autorização para Início da Sprint 3
- Certificar a conclusão da Sprint 2 com 91.8% de cobertura de testes e emitir a ordem executiva **AUTH-SPRINT3-2026-001** autorizando o desenvolvimento dos módulos de Agenda Inteligente, Gestão de Consultas, Contratação e AI Matching Engine.

## Consequências
- Positivas: Validação automatizada contra fraude de registro OAB; busca de advogados de altíssimo desempenho; conformidade com LGPD.
- Regra de Ouro: Proibição estrita de exibição pública de advogados não-verificados no Marketplace.
