# ADR-018: Implementação da Arquitetura Data Mesh com Governança Descentralizada por Domínios
Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Data Officer, Enterprise Data Architect, CTO

## Contexto
A Legis Connect cresceu para mais de 35 microserviços e 5 divisões de negócios. O modelo tradicional de Data Warehouse
centralizado gerava gargalos de engenharia de dados e dependência excessiva de uma única equipe.

## Opções Avaliadas
| Modelo de Dados | Propriedade dos Dados | Escalabilidade | Facilidade de Governança | Decisão |
|---|---|---|---|---|
| Monolito Data Warehouse | Centralizada | Limitada | Alta (Central) | Descartada |
| Data Lake Desestruturado | Nenhuma | Alta | Baixíssima (Data Swamp) | Descartada |
| **Data Mesh Por Domínios** | **Descentralizada (Domains)** | **Altíssima** | **Excelente (Federada)** | **ESCOLHIDA** |

## Decisão
Adotar **Data Mesh** organizado nos 5 Domínios Principais:
1. **Legal Domain**: Responsável pelo catálogo de processos, petições e jurisprudência.
2. **Financial Domain**: Responsável por faturamento, ARR, billing e impostos.
3. **Customer Domain**: Responsável pela jornada do cliente, onboarding e CRM.
4. **AI & Intelligence Domain**: Responsável por embeddings, corpora de treino e métricas de IA.
5. **Security & Audit Domain**: Responsável por logs de auditoria, SIEM e telemetria de segurança.

## Consequências
- Positivas: Autonomia total das equipes de produtos com contratos claros de Data Products, SLAs e schemas declarativos.
- Mitigações: Governança federada padronizada via OpenMetadata e suítes de validação de qualidade automatizadas (Great Expectations).
