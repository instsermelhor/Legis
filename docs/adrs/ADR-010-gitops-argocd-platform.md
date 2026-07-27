# ADR-010: ArgoCD como Plataforma GitOps da Legis Connect
Status: APROVADO | Data: 27/07/2026 | Decisores: CTO, Platform Engineering Lead, SRE Principal

## Contexto
A Legis Connect precisa de uma estratégia de entrega contínua para 35+ microserviços em múltiplos
clusters Kubernetes EKS (us-east-1 e sa-east-1), com rastreabilidade completa de deployments,
rollback instantâneo e sem acesso kubectl manual em produção.

## Opções Avaliadas
| Opção | Vantagem | Desvantagem |
|---|---|---|
| ArgoCD | Maturidade, UI rica, App of Apps pattern, RBAC granular | Operação de cluster próprio |
| FluxCD | Leve, GitOps nativo CNCF | UI menos completa |
| Spinnaker | Enterprise CD completo | Complexidade operacional extrema |

## Decisão
ArgoCD com "App of Apps" pattern no repositório /platform-gitops como fonte única de verdade
para o estado desejado de todos os deployments Kubernetes em produção.
Nenhum kubectl apply manual é permitido em produção (GitOps Enforcement via OPA Gatekeeper).

## Consequências
- Positivas: Auditoria via Git log, rollback < 30s, multi-cluster, RBAC por time/serviço.
- Mitigações: ArgoCD em HA (3 réplicas) com backup de estado no S3 (ArgoCD notifications backup).
