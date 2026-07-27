# ADR-014: Seleção da Grafana Enterprise Stack (LGTM: Loki, Grafana, Tempo, Mimir) para Observabilidade da Legis Connect
Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Reliability Officer, Head of SRE, CTO, CISO

## Contexto
A Legis Connect precisa de uma infraestrutura de observabilidade capaz de suportar
15M+ de requisições diárias, 5M+ de eventos Kafka, 500GB+ de logs diários e traces de 35+ microserviços,
com custo previsível, sem vendor lock-in e em conformidade total com a LGPD (Prompt 224).

## Opções Avaliadas
| Plataforma | Custo Estimado (100K Tenants) | Lock-in | Padrão OpenTelemetry | Decisão |
|---|---|---|---|---|
| **Grafana LGTM Stack (Self-Hosted/Cloud)** | $6.500/mês | Zero (Open Source) | 100% Nativo | **ESCOLHIDA** |
| Datadog | $35.000+/mês | Altíssimo | Parcial (Agente proprietário) | Descartada (Custo) |
| Dynatrace | $28.000+/mês | Alto | Parcial | Descartada (Custo) |

## Decisão
Adotar a **Grafana Enterprise LGTM Stack**:
- **Grafana Mimir**: Armazenamento de métricas Prometheus com retenção de 13 meses.
- **Grafana Loki**: Logs estruturados com retenção inteligente de 90 dias em S3.
- **Grafana Tempo**: Trace storage de altíssima escala conectado ao S3.
- **Grafana Dashboards**: Visualização centralizada unificada (Single Pane of Glass).
- **OpenTelemetry (OTel)**: Padrão único e neutro de instrumentação no código.

## Consequências
- Positivas: Redução de 80% nos custos comparado a SaaS proprietários, sem vendor lock-in, conformidade total com LGPD.
- Mitigações: SRE team opera clusters Mimir/Loki/Tempo via Helm/GitOps com auto-scaling no EKS.
