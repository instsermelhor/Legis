# ADR-009: Microsoft Sentinel como Plataforma SIEM/SOAR Corporativa da Legis Connect
Status: APROVADO | Data: 27/07/2026 | Decisores: CISO, Cloud Security Architect, SOC Director

## Contexto
A Legis Connect necessita de um SIEM capaz de ingerir 100GB+/dia de logs distribuídos (AWS, Kubernetes, Kong,
PostgreSQL, App Telemetry), correlacionar alertas de segurança com ML/UEBA e executar playbooks SOAR para
automação de resposta em menos de 60 segundos após a detecção de um incidente crítico.

## Opções Avaliadas
| SIEM | Vantagem | Desvantagem |
|---|---|---|
| Microsoft Sentinel | Cloud-native, SOAR nativo, UEBA com ML, custos por GB | Lock-in Azure Log Analytics |
| Splunk Enterprise | Maturidade e ecossistema rico | Custo licença elevado (>$300K/ano) |
| Elastic SIEM | Open-source, flexível | Operação complexa em EKS multi-region |
| Google Chronicle | IA de segurança avançada | Ecossistema fora do AWS principal |

## Decisão
Adotar Microsoft Sentinel como plataforma SIEM/SOAR principal, com Log Analytics Workspace dedicado e
conectores nativos para: AWS CloudTrail, Kubernetes Falco, Kong Gateway, PostgreSQL e GitHub Advanced Security.

## Consequências
- Positivas: SOAR com 50+ playbooks pré-construídos, UEBA comportamental, integração com MITRE ATT&CK.
- Mitigações: Custo de ingestão controlado por filtragem de logs irrelevantes no pipeline Kafka antes da ingestão.
