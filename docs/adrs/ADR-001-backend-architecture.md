# ADR-001: Seleção da Arquitetura Híbrida de Microsserviços orientada a Eventos (EDA) e DDD
Status: APROVADO
Data: 27/07/2026
Decisores: CTO, Enterprise Architect, Principal Backend Engineer

## Contexto
A plataforma Legis Connect exige alta escalabilidade, isolamento de domínios (Marketplace, CLM, IA) e
resiliência distribuída com suporte a transações assíncronas e agentes de IA autônomos.

## Decisão
Adotar uma Arquitetura de Microsserviços orientada por Domain-Driven Design (DDD), com comunicação síncrona
de baixa latência via gRPC / REST no API Gateway e comunicação assíncrona desacoplada via Apache Kafka.
Cada serviço utilizará a Arquitetura Hexagonal (Ports & Adapters) construída em NestJS (TypeScript).

## Consequências
- Positivas: Altíssimo desacoplamento, escalabilidade independente por pod, resiliência com Saga Pattern.
- Mitigações: Complexidade distribuída tratada por Istio Service Mesh, OpenTelemetry e ArgoCD GitOps.
