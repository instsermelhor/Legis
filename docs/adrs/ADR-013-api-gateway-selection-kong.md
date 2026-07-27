# ADR-013: Seleção do Kong Enterprise como API Gateway e API Management Platform
Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Integration Officer, CTO, CISO

## Contexto
A Legis Connect precisa de uma solução de API Gateway e API Management capaz de gerenciar
tráfego interno (East-West via Istio/Kong) e externo (North-South), suportando roteamento de altíssima
performance (< 5ms de latência adicionada), autenticação OAuth 2.0/OIDC, mTLS, rate limiting por tenant e
portal de desenvolvedores com suporte a monetização.

## Opções Avaliadas
| Plataforma | Latência Overhead | Developer Portal | Monetização | Decisão |
|---|---|---|---|---|
| **Kong Enterprise** | < 3ms (C/Lua engine) | Excelente (built-in + Backstage) | Nativa (Plugins) | **ESCOLHIDA** |
| AWS API Gateway | 15-30ms | Básico (Developer Portal serverless) | Via Usage Plans | Descartada (Latência/Lock-in) |
| Apigee (Google) | 10-20ms | Completo | Robusta | Descartada (Custo elevado) |

## Decisão
Adotar **Kong Enterprise** implantado no cluster Kubernetes EKS com Kong Ingress Controller.
Kong servirá como o gateway unificado North-South, enquanto Istio gerenciará o tráfego East-West.

## Consequências
- Positivas: Latência ultrabaixa (< 3ms), plugins nativos para rate limiting por tenant, monetização de APIs e integração com Backstage.
- Mitigações: Alta disponibilidade do Kong Gateway (3 réplicas multi-AZ) controlada via Kong Ingress Controller e GitOps (ArgoCD).
