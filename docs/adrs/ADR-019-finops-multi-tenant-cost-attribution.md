# ADR-019: Modelo de Atribuição de Custos Multi-Tenant e FinOps Engine
Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Financial Technology Officer, Head of FinOps, CTO

## Contexto
Para garantir margens brutas > 80% e entender a rentabilidade de cada plano SaaS (Starter, Professional, Enterprise),
a Legis Connect precisa calcular com precisão de centavos quanto cada tenant consome de computação, banco, storage e IA.

## Opções Avaliadas
| Modelo de Atribuição | Precisão de Margem | Complexidade | Atribuição de Custos de IA | Decisão |
|---|---|---|---|---|
| Rateio Igualitário (Divisão simples) | Baixíssima | Mínima | PÉSSIMA | Descartada |
| Estimativa por Volume de Dados | Média | Baixa | Imprecisa | Descartada |
| **Atribuição Granular (OpenCost + Token Metering)** | **Altíssima (< 1% erro)** | **Média** | **EXCELENTE** | **ESCOLHIDA** |

## Decisão
Adotar **Atribuição Granular Multi-Tenant**:
1. **Computação K8s**: OpenCost rastreia o uso exato de CPU/RAM de cada Pod atribuído ao `tenant_id`.
2. **Consumo de IA**: Proxy LiteLLM registra tokens de entrada/saída consumidos por cada `tenant_id` e associa ao custo unitário da API do provedor (OpenAI, Anthropic, Gemini).
3. **Storage & DB**: Medição via métricas de volume S3 por prefixo de tenant e conexões RLS ativas.
4. **Governança FinOps**: Adotar o framework da FinOps Foundation (Inform -> Optimize -> Operate) com alertas automatizados via AWS Budgets.

## Consequências
- Positivas: Identificação em tempo real da margem de contribuição individual de cada cliente e bloqueio imediato de vazamentos de custos.
- Mitigações: Obrigatoriedade da tag `tenant_id` em todos os pods K8s e requisições enviadas ao proxy LiteLLM.
