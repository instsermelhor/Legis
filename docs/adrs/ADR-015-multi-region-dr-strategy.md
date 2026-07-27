# ADR-015: Estratégia de Disaster Recovery Multi-Region Active-Passive (Pilot Light / Warm Standby)
Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Resilience Officer, CTO, Cloud Architect, CISO

## Contexto
A Legis Connect opera primariamente na região AWS sa-east-1 (São Paulo). Para garantir continuidade total
mesmo diante de um desastre regional da AWS, é necessária uma segunda região configurada para failover.

## Opções Avaliadas
| Modelo | RTO | RPO | Custo Relativo | Decisão |
|---|---|---|---|---|
| Active-Active Multi-Region | < 1 min | 0 | 2.2x (Duplicação total contínua) | Descartada (Custo/Complexidade) |
| **Active-Passive Pilot Light (Aurora Global DB)** | **< 15 min** | **< 1s** | **1.35x (Otimizado)** | **ESCOLHIDA** |
| Backup & Restore (Cold Standby) | > 6 horas | > 1h | 1.05x | Descartada (Viola RTO Tier 0) |

## Decisão
Adotar **Active-Passive Pilot Light** entre `sa-east-1` (Primária) e `us-east-1` (Secundária):
- **Aurora Global Database**: Replicação síncrona/near-síncrona de banco de dados (lag < 1s).
- **EKS Pilot Light**: Cluster Kubernetes secundário em `us-east-1` mantido com réplicas mínimas (1 pod/node) atualizado continuamente via GitOps (ArgoCD).
- **Amazon Route 53 DNS Failover**: Checagem de saúde a cada 10s aciona chaveamento de DNS em < 30s.
- **AWS Backup Vault Lock**: Cofre de backups imutáveis WORM Air-Gapped contra ataques de Ransomware.

## Consequências
- Positivas: Cumpre os objetivos de RTO < 15 min e RPO < 1s para o Tier 0 sem duplicar 100% dos custos computacionais 24/7.
- Mitigações: Testes semestrais automatizados de failover para garantir a prontidão do cluster secundário `us-east-1`.
