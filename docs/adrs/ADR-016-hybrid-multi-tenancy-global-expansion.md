# ADR-016: Arquitetura SaaS Multi-Tenant Híbrida com Data Sovereignty Regional
Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Global Expansion Officer, CTO, CISO

## Contexto
A Legis Connect precisa atender simultaneamente pequenos advogados autônomos (baixo custo),
escritórios médios (isolamento lógico) e corporações multinacionais/governos (isolamento físico de dados),
garantindo conformidade com leis regionais de privacidade (LGPD no Brasil, GDPR na Europa, CCPA nos EUA).

## Opções Avaliadas
| Modelo Multi-Tenant | Isolamento de Dados | Eficiência de Custo | Suporte a Data Residency | Decisão |
|---|---|---|---|---|
| Single-Tenant Total (Silo) | Máximo | Baixíssima (Inviável) | Excelente | Descartada |
| Shared Database (Pool) | Médio (RLS) | Altíssima | Dificultada | Parcial |
| **Hybrid Multi-Tenancy** | **Flexível (RLS ou Silo)** | **Alta (Otimizada)** | **Excelente (Nativa)** | **ESCOLHIDA** |

## Decisão
Adotar **Hybrid Multi-Tenancy**:
1. **Shared Multi-Tenant Pool (RLS)**: Para os planos Starter e Professional. Múltiplos tenants compartilham o mesmo banco de dados regional com Row-Level Security (RLS) via `tenant_id`.
2. **Dedicated Single-Tenant Pool (Silo)**: Para o plano Enterprise. Instâncias dedicadas de banco de dados e namespaces Kubernetes isolados dentro da região geográfica exigida pelo cliente.
3. **Geo-Fencing por Região Cloud**: Dados mantidos estritamente na região local do cliente (`sa-east-1` para LATAM, `us-east-1` para EUA, `eu-west-1` para Europa).

## Consequências
- Positivas: Redução drástica de custos para 90% dos usuários enquanto atende aos requisitos rigorosos de governos e clientes Enterprise.
- Mitigações: Roteamento inteligente na borda (Cloudflare Anycast + Kong Gateway) baseado no cabeçalho de país/tenant do usuário.
