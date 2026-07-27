# PROMPT 040 — Enterprise Data Architecture & Governance Blueprint
## Legis Connect · Chief Data Officer (CDO) · Enterprise Data Architect · Data Engineering Lead
### Versão 1.0 | Classificação: CONFIDENCIAL | Data: 2026-07-25

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Corporativa de Dados e Governança da Legis Connect TO-BE**, consolidando 25 domínios cruciais de Engenharia de Dados, Data Lakehouse (AWS S3 + Apache Iceberg), Data Warehouse (AWS Redshift Serverless), Governança DAMA-DMBOK 2.0, Master Data Management (MDM), Data Quality com Great Expectations, Data Catalog com DataHub, Linhagem OpenLineage, Analytics em Tempo Real com Kafka/Flink e Infraestrutura de Dados para Inteligência Artificial (Feast Feature Store + pgvector).

**Estado AS-IS:** Maturidade de Dados `1.2 / 5.0` (Inexistente / Reativo) — armazenamento volátil de estado no frontend (`localStorage`), ausência de camada OLAP analítica, dados desgovernados sem catálogo ou linhagem, sem políticas de retenção LGPD e falta de pipelines de dados para alimentar modelos de IA.

**Estado TO-BE:** Maturidade de Dados `4.9 / 5.0` (Enterprise Data Platform & Data-Driven Organization) — Arquitetura Medallion em Data Lakehouse (Bronze, Silver, Gold), Data Mesh por domínios jurídicos, MDM Golden Record (CPF/CNPJ/OAB), Data Quality Score > 98%, Governança DAMA-DMBOK 2.0 com DataHub, Feast Feature Store para MLOps, Analytics em tempo real via Apache Flink e conformidade total com a LGPD.

---

## ETAPA 1 — INVENTÁRIO COMPLETO DOS DADOS ATUAIS (AS-IS vs. TO-BE)

### 1.1 Matriz de Domínios de Dados

| Domínio de Dados | Origem Primária | Sensibilidade LGPD | Uso Principal | Risco Atual |
|---|---|---|---|---|
| **Identidade & Acesso** | PostgreSQL RDS (IAM) | ALTAMENTE SENSÍVEL | Autenticação, RBAC/ABAC | Exposição de credenciais |
| **Pessoas & Clientes** | PostgreSQL / Gov.br | ALTAMENTE SENSÍVEL | CRM, Faturamento, Contratos | Duplicidade e falta de MDM |
| **Advogados & OAB** | PostgreSQL / OAB API | CONFIDENCIAL | Match Jurídico, Atendimento | Cadastro desatualizado |
| **Processos Jurídicos** | PostgreSQL / DataJud | CONFIDENCIAL | Gestão de Casos, Prazos | Perda de histórico e sincronia |
| **Documentos & GED** | AWS S3 Bucket | CONFIDENCIAL | Cofre Digital, Assinaturas | Ausência de retenção legal |
| **Transações Financeiras**| PostgreSQL (Billing) | ALTAMENTE SENSÍVEL | Faturamento, Split, Contabilidade | Inconsistência de conciliação |
| **Vetores & IA** | pgvector / Redis | INTERNO | RAG Jurídico, Busca Semântica | Inexistência de Feature Store |

---

## ETAPA 2 — CLASSIFICAÇÃO DOS DOMÍNIOS DE DADOS (DATA MESH DOMAINS)

```
LEGAL DOMAIN (Domain Owner: Legal Lead)
├── Processos & Andamentos Judiciais (DataJud CNJ)
├── Peças, Contratos & Documentos (GED S3)
└── Jurisprudência & Legislação (LexML)

FINANCIAL DOMAIN (Domain Owner: CFO / Finance Lead)
├── Faturas, Assinaturas SaaS & Consumo de IA
├── Split Payments & Comissões de Marketplace
└── Conciliação Bancária & Lançamentos Contábeis

USER & CRM DOMAIN (Domain Owner: Product Lead)
├── Cadastros Mestre de Clientes & Pessoas (MDM)
├── Perfis Profissionais de Advogados & Registros OAB
└── Jornada do Usuário, Conversão & Engagement

AI & ANALYTICS DOMAIN (Domain Owner: CDO / Head of AI)
├── Embeddings Vetoriais (pgvector HNSW) & Feature Store (Feast)
├── Histórico de Prompts & Feedback de Interação Humano-IA
└── Métricas de Desempenho RAG (RAGAS Benchmarks)
```

---

## ETAPA 3 — AUDITORIA DA ARQUITETURA ATUAL DE DADOS

1. **Persistência Temporária em Frontend (`localStorage`):** Dados de rascunhos de peças e estado de navegação armazenados no navegador do cliente sem criptografia.
2. **Ausência de Camada OLAP:** Consultas analíticas pesadas executadas diretamente no banco transacional PostgreSQL, gerando gargalos de performance.
3. **Falta de Catálogo e Linhagem:** Impossibilidade de rastrear o impacto de alterações de esquema em relatórios e IA.

---

## ETAPA 4 — ENTERPRISE DATA ARCHITECTURE (TO-BE)

```
[APLICAÇÕES LEGIS CONNECT (Web / Mobile / Integrations)]
                         │
                         ▼
[OPERATIONAL DB (PostgreSQL 16 Multi-AZ + RLS)]
                         │
                         ▼ (CDC via Debezium)
[DATA STREAMING & EVENT BUS (AWS MSK Apache Kafka)]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
[BRONZE ZONE (Raw S3 Iceberg)]    [REAL-TIME ANALYTICS (Apache Flink)]
        │                                 │
        ▼ (dbt Core + Great Expectation)   ▼
[SILVER ZONE (Curated Iceberg + MDM)] ──> [NOTIFICAÇÕES & ALERTAS REAL-TIME]
        │
        ▼ (dbt Gold Models)
[GOLD ZONE (AWS Redshift DW Star Schema)]
        │
        ├─────────────────────────────────┬─────────────────────────────────┐
        ▼                                 ▼                                 ▼
[EXECUTIVE BI (Superset)]      [OPERATIONAL BI (Metabase)]    [AI & ML FEATURE STORE (Feast)]
```

---

## ETAPA 5 — ESTRATÉGIA DE MIGRAÇÃO DE DADOS (FRONTEND → DATA PLATFORM)

```
[ESTADO ATUAL: React + localStorage]
                │
                ▼ (Migração Gradual com Sync Service)
[ESTADO INTERMEDIÁRIO: NestJS API + PostgreSQL Operacional]
                │
                ▼ (CDC Debezium automatizado)
[ESTADO FINAL: Enterprise Data Lakehouse + DW Redshift]
```

---

## ETAPA 6 — MODELO DE DADOS CORPORATIVO (OLTP & OLAP)

### 6.1 Data Warehouse Star Schema Kimball (Redshift DW)

```sql
-- TABELA FATO: fact_case_events
CREATE TABLE fact_case_events (
    event_sk          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    case_id           UUID          NOT NULL,
    workspace_id      UUID          NOT NULL,
    dim_lawyer_sk     BIGINT        REFERENCES dim_lawyers(lawyer_sk),
    dim_client_sk     BIGINT        REFERENCES dim_clients(client_sk),
    dim_time_sk       BIGINT        REFERENCES dim_time(time_sk),
    event_type        VARCHAR(50)   NOT NULL,
    duration_hours    NUMERIC(10,2),
    is_deadline_met   BOOLEAN       NOT NULL,
    ingested_at       TIMESTAMPTZ   DEFAULT NOW()
)
DISTKEY(workspace_id)
SORTKEY(dim_time_sk, workspace_id);

-- DIMENSÃO ADVOGADOS (SCD Type 2 - Histórico de Alterações)
CREATE TABLE dim_lawyers (
    lawyer_sk         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lawyer_id         UUID          NOT NULL,
    oab_number        VARCHAR(20)   NOT NULL,
    full_name         VARCHAR(200)  NOT NULL,
    specialties       VARCHAR[],
    state             CHAR(2),
    valid_from        DATE          NOT NULL,
    valid_to          DATE          DEFAULT '9999-12-31',
    is_current        BOOLEAN       DEFAULT TRUE,
    checksum          CHAR(64)      NOT NULL
);
```

---

## ETAPA 7 — ARQUITETURA DATA LAKEHOUSE (MEDALLION ARCHITECTURE)

```
s3://legisconnect-datalake/
├── bronze/                      RAW DATA (Imutável, Full-Fidelity)
│   ├── cdc_postgresql/          Logs CDC Debezium do PostgreSQL 16
│   └── external_apis/           Ingestão bruta DataJud, Gov.br, NFe.io
├── silver/                      CURATED DATA (Limpo, Validado, MDM Golden Record)
│   ├── dim_clients/             Clientes deduplicados via MDM Engine
│   ├── fact_cases/              Casos jurídicos limpos e particionados
│   └── enriched_documents/      Texto extraído via OCR AWS Textract
└── gold/                        SERVING DATA (Star Schema Kimball, BI & ML Ready)
    ├── analytics_cases/         Agregados para dashboards executivos
    ├── analytics_financial/     Indicadores MRR/ARR/LTV materializados
    └── feature_store/           Features offline para modelos ML (Feast)

FORMATO: Apache Iceberg (Suporte ACID, Time-Travel, Schema Evolution)
```

---

## ETAPA 8 — MASTER DATA MANAGEMENT (MDM & GOLDEN RECORD)

```
FONTES DE DADOS MESTRE:
[Gov.br OIDC] ──(Trust 1.0)──┐
[OAB Nacional] ──(Trust 1.0)──┼──> [MDM ENGINE (Matching Determinístico + Probabilístico)]
[Receita CNPJ] ──(Trust 0.95)─┘                            │
                                                           ▼
                                               [GOLDEN RECORD CANÔNICO]
                                               • ID Único Estável (UUID)
                                               • Dados Pessoais Validados
                                               • Tópico Kafka: mdm.golden_records
```

---

## ETAPA 9 — DATA QUALITY FRAMEWORK (DAMA 6 DIMENSÕES)

| Dimensão | KPI Target | Alerta de Falha | Ferramenta de Validação |
|---|---|---|---|
| **Completude** | > 99.5% | < 98.0% | Great Expectations (`expect_column_values_to_not_be_null`) |
| **Consistência** | > 99.8% | < 99.0% | dbt Referential Integrity Tests |
| **Precisão** | > 99.0% | < 97.0% | Regras de Negócio & Algoritmo de Validação CNJ/CPF |
| **Unicidade** | > 99.9% | < 99.5% | MDM Engine Deduplication Check |
| **Atualidade** | < 5min (Stream) | > SLA Target | Airflow SLA Callbacks & Kafka Lag Alerts |
| **Validade** | > 99.5% | < 98.0% | RegEx Matching (CNJ: `NNNNNNN-DD.AAAA.J.TT.OOOO`) |

---

## ETAPA 10 — DATA GOVERNANCE & DATA CATALOG (DATAHUB)

```
DATAHUB METADATA ENGINE (EKS Deployment):
├── Data Catalog: Registro automático de schemas PostgreSQL, Redshift, S3 Iceberg.
├── Business Glossary: Glossário com mais de 150 termos jurídicos e financeiros.
└── Data Lineage: Rastreamento automático end-to-end via OpenLineage backend.

GOVERNANCE COUNCIL (DGC):
CDO (Presidente) · Data Stewards (Legal & Finance) · Data Owners (Product) · DPO
```

---

## ETAPA 11 — DATA SECURITY & PRIVACY ENGINEERING (LGPD)

- **Zero Trust Data Access:** Acesso aos datasets analíticos restrito via IAM Roles e Redshift Column-Level Security.
- **Data Privacy Mapping:** Identificação automática de tags PII em todas as colunas do DataHub (`tag:lgpd-sensitive`).
- **k-Anonymity:** Anonimização de datasets analíticos de exportação com k ≥ 5 para prevenção de re-identificação.

---

## ETAPA 12 — BUSINESS INTELLIGENCE & ANALYTICS PLATFORM

```
EXECUTIVE DASHBOARD (Apache Superset):
• MRR / ARR / Net Retention / Churn Rate
• Volume Global de Processos Ativos e Taxa de Êxito
• Indicador de Satisfação de Clientes (NPS) e SUS Score

OPERATIONAL DASHBOARD (Metabase):
• Painel de Prazos Fatais por Advogado e por Escritório
• Faturamento de Honorários e Taxa de Adimplência
• Tempo Médio de Resposta a Clientes via Chat

EMBEDDED ANALYTICS (In-App React Component):
Gráficos interativos em tempo real dentro do workspace do advogado via Superset Embedded SDK.
```

---

## ETAPA 13 — DATA ARCHITECTURE PARA INTELIGÊNCIA ARTIFICIAL

```
[DATA PLATFORM (Silver Zone)] ──> [FEAST FEATURE STORE] ──(Redis Online Store)──> [INFERÊNCIA ML < 5ms]
                                          │
                                          └──(S3 Offline Store)──> [TREINO DE MODELOS MLFLOW]
```
- **Vector DB Sync:** Sincronização automática entre documentos limpos na Silver Zone e embeddings no `pgvector`.

---

## ETAPA 14 — BACKLOG TÉCNICO DE DADOS

---

### DATA-001 — Implementação da Arquitetura Data Lakehouse Medallion

**Problema:** A plataforma concentra todos os dados em PostgreSQL operacional, sem camada OLAP e sem histórico para análises.

**Impacto:** Lentidão em consultas transacionais, incapacidade de gerar inteligência de negócios e falta de visão histórica.

**Solução:** Implantar Data Lakehouse (AWS S3 + Apache Iceberg) com camadas Bronze, Silver e Gold orquestradas por Airflow e dbt.

**Prioridade:** CRÍTICA | **Complexidade:** Alta | **Estimativa:** 6 semanas

---

### DATA-002 — Implantação do Data Catalog DataHub e Rastreabilidade OpenLineage

**Problema:** Equipes não possuem visibilidade dos dados existentes, origens, termos ou impactos de alterações de schema.

**Impacto:** Shadow IT, duplicação de pipelines e riscos de violação inadvertida da LGPD.

**Solução:** Deploy do DataHub OSS no Kubernetes com integração OpenLineage e Glossário Jurídico Corporativo.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

### DATA-003 — Engine de Master Data Management (MDM Golden Record)

**Problema:** Cadastros duplicados de clientes e advogados geram inconsistência nos relatórios e no marketplace.

**Impacto:** Falhas na atribuição de honorários, métricas distorcidas e insatisfação dos usuários.

**Solução:** Criar MDM Golden Record Engine utilizando matching determinístico (CPF/OAB) e probabilístico (Jaro-Winkler).

**Prioridade:** ALTA | **Complexidade:** Média-Alta | **Estimativa:** 5 semanas

---

### DATA-004 — Data Quality Framework com Great Expectations e dbt Tests

**Problema:** Dados chegam à camada analítica com falhas de formato, valores nulos e inconsistências procedimentais.

**Impacto:** Perda de confiabilidade nos dashboards executivos e alucinações em modelos de IA.

**Solução:** Implementar suítes de teste de qualidade no dbt e Great Expectations com bloqueio automático de pipelines corrompidos.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

### DATA-005 — Plataforma de BI Corporativo (Apache Superset / Metabase)

**Problema:** Relatórios são gerados manualmente ou via queries SQL diretas no banco de produção.

**Impacto:** Ineficiência operacional, lentidão no banco transacional e atraso na tomada de decisão.

**Solução:** Implantar Apache Superset para dashboards executivos C-Level e Metabase para self-service BI operacional.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

## ETAPA 15 — ARQUITETURA INTEGRADA DE DADOS ENTERPRISE

```
LEGIS CONNECT — INTEGRATED ENTERPRISE DATA ARCHITECTURE
Versão 1.0 — Julho 2026

[FONTES OPERACIONAIS]
PostgreSQL 16 RDS · AWS S3 GED · DataJud CNJ · Gov.br · Stripe · Open Finance
          ↓
[INGESTÃO & EVENT STREAMING]
Debezium CDC · Apache Kafka (AWS MSK) · Airbyte Connectors · NestJS Webhooks
          ↓
[DATA LAKEHOUSE (AWS S3 + Apache Iceberg)]
Bronze (Raw) ──> Silver (Curated & MDM Golden Record) ──> Gold (Star Schema DW)
          ↓
[GOVERNANÇA & QUALIDADE (Transversal)]
DataHub Catalog · OpenLineage Lineage · Great Expectations Quality Gates · LGPD Privacy Map
          ↓
[CAMADA DE CONSUMO INTEGRADA]
 ├── Business Intelligence: Apache Superset (C-Level) & Metabase (Operacional)
 ├── AI & Machine Learning: Feast Feature Store & pgvector HNSW Vector DB
 └── Real-Time Analytics: Apache Flink Streaming (Prazos & Alertas Real-Time)
```

---

*Enterprise Data Architecture & Governance Blueprint v1.0*
*Chief Data Officer · Enterprise Data Architect · Legis Connect · 2026*
