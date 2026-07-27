# ADR-012: Arquitetura Híbrida de CRM e CDP para a Legis Connect
Status: APROVADO | Data: 27/07/2026 | Decisores: CCO, VP CX, CTO, DPO

## Contexto
A Legis Connect precisa gerenciar o relacionamento com 4 segmentos distintos: clientes finais (PF), advogados autônomos (Starter/Pro), escritórios de advocacia (PJ) e departamentos jurídicos corporativos (Enterprise).

É necessário conciliar a eficiência comercial e de marketing com o rigor da LGPD (Prompt 224) e do sigilo profissional advocatício, evitando vazamentos de PII ou dados de processos de clientes para plataformas SaaS externas.

## Opções Avaliadas
| Opção | Vantagens | Desvantagens | Decisão |
|---|---|---|---|
| **Salesforce Enterprise Total** | Plataforma completa, madura | Custo altíssimo ($150+/user), complexidade, dados de processos na nuvem SF | Descartada |
| **HubSpot Enterprise Total** | Excelente automação de marketing e vendas B2B | Limitações em regras de privacidade personalizadas para dados advocatícios | Parcial |
| **CRM 100% Proprietário** | Controle total de dados, LGPD nativa | Custo alto de desenvolvimento de pipeline comercial B2B | Parcial |
| **Modelo Híbrido (HubSpot + In-App CRM + CDP)** | Melhor de dois mundos: HubSpot para Vendas/MKT B2B; CDP + In-App Engine para dados de produto | Requer sincronização via Reverse ETL (RudderStack) | **ESCOLHIDA** |

## Decisão
Adotar o **Modelo Híbrido de CRM e CDP**:
1. **HubSpot Enterprise**: Gestão de pipeline comercial B2B/Enterprise, qualificação de leads (MQL/SQL), automação de e-mail marketing e gestão de metas de vendas.
2. **Proprietary In-App CX Engine**: Motor nativo do produto para cálculo de Health Score, histórico de uso de IA, atendimento via AI Support Agent e marketplace matching.
3. **CDP (ClickHouse + Iceberg)**: Fonte única de verdade (Single Source of Truth) para o perfil Customer 360°, alimentando tanto o produto quanto o HubSpot via Reverse ETL com dados estritamente anonimizados/pseudonimizados.

## Consequências
- Positivas: Autonomia do time comercial B2B sem comprometer a privacidade dos dados jurídicos dos clientes.
- Mitigações: Zero PII ou dados de processos jurídicos sincronizados com o HubSpot (apenas metadados de plano, tenant_id, health score e estágio de vendas).
