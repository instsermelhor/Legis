# ADR-002: Seleção do Kong Gateway Enterprise como API Gateway Central
Status: APROVADO
Data: 27/07/2026
Decisores: Chief Integration Architect, CTO, CISO

## Contexto
Necessidade de um gateway de altíssima performance, escalável horizontalmente no Kubernetes EKS,
com suporte a mTLS, gRPC proxy, plugins customizados e suporte nativo a OpenTelemetry.

## Decisão
Adotar o Kong Gateway Enterprise operando em modo Híbrido (Separando Control Plane e Data Planes).

## Consequências
- Positivas: Processamento de 100k+ RPS com latência < 2ms, integração nativa com Redis e Kubernetes Ingress Controller.
- Mitigações: Gestão de licença e monitoramento de consumo via Prometheus/Grafana.
