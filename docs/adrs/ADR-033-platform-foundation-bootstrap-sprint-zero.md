# ADR-033: Platform Foundation Bootstrap, Sprint Zero Certification & Business Feature Authorization
# Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Software Architect, VP of Engineering, Platform Engineering Director, DevSecOps Director

## Contexto
Após a conclusão da fábrica de software (Prompt 246) e autorização para construção do programa (Prompt 245), é necessário estabelecer a fundação técnica básica (Sprint Zero) antes de permitir que os squads desenvolvam regras de negócio. O objetivo é evitar que cada squad invente sua própria infraestrutura, logging, autenticação ou comunicação de eventos.

## Decisões Técnicas

### 1. Homologação da Estrutura Monorepo (`legis-platform`)
- Adotar **Turborepo v2 + pnpm workspaces** para gerenciamento do monorepo corporativo contendo aplicações (`apps/`), pacotes compartilhados (`packages/`), infraestrutura (`infrastructure/`) e ferramentas CLI (`tooling/`).

### 2. Publicação das Bibliotecas Compartilhadas (`@legis/*`)
- Desenvolver e homologar as 7 bibliotecas compartilhadas base antes da codificação de regras de negócio:
  - `@legis/core` (NestJS bootstrap, DI e decoradores).
  - `@legis/logging` (Winston/Zap com injeção automática de TraceID).
  - `@legis/auth` (Keycloak OIDC guards, RBAC e DID).
  - `@legis/telemetry` (OpenTelemetry instrumentation).
  - `@legis/exceptions` (Global filters e RFC 7807 Error details).
  - `@legis/messaging` (Kafka producer/consumer com DLQ).
  - `@legis/ui` (Design System React tokens).

### 3. Provisionamento e Certificação da Infraestrutura de Staging (Sprint Zero)
- Certificar a operabilidade completa do cluster EKS Kubernetes, Aurora PostgreSQL Global Database, Redis Cluster, Strimzi Kafka Operator, Keycloak 25.0 HA, Vault KMS e OpenTelemetry Collector.

### 4. Emissão da Ordem de Autorização para Desenvolvimento de Funcionalidades
- Homologar a conclusão da Sprint Zero e emitir a ordem executiva **AUTH-DEV-2026-001** liberando os 9 squads para iniciarem o desenvolvimento das User Stories funcionais a partir do PI 1.

## Consequências
- Positivas: Padronização absoluta do código-fonte, zero duplicação de esforço de infraestrutura entre squads, segurança e observabilidade ativas desde a primeira User Story.
- Regra de Ouro: Proibição estrita de desenvolvimento de regras de negócio fora dos padrões das bibliotecas `@legis/*`.
