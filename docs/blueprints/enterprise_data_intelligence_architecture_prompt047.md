# PROMPT 047 — Enterprise Data Architecture, Governance & Legal Intelligence Blueprint
## Legis Connect · Chief Data Officer (CDO) · Enterprise Data Architect · Data Engineering Lead
### Versão 1.0 | Classificação: CONFIDENCIAL | Data: 2026-07-25

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Corporativa de Dados, Data Lakehouse, Governança e Inteligência Legal (Enterprise Data Architecture) da Legis Connect TO-BE**, consolidando 25 domínios cruciais de Engenharia de Dados, Data Mesh por domínios jurídicos, Data Lakehouse (AWS S3 + Apache Iceberg), Data Warehouse (AWS Redshift Serverless), Governança DAMA-DMBOK 2.0, Master Data Management (MDM), Data Quality (Great Expectations), Catálogo de Dados (DataHub), Feast Feature Store para MLOps e Plataforma de Business Intelligence (Apache Superset / Metabase).

**Estado AS-IS:** Maturidade de Dados `1.2 / 5.0` (Inexistente / Volátil) — armazenamento desgovernado no frontend (`localStorage`), sem banco transacional estruturado, ausência de camada OLAP analítica, sem catálogo de dados ou linhagem, falta de deduplicação MDM e incapacidade de alimentar pipelines de IA de forma confiável.

**Estado TO-BE:** Maturidade de Dados `4.9 / 5.0` (Data-Driven LegalTech Platform) — Arquitetura Medallion em Data Lakehouse (Bronze, Silver, Gold), Data Mesh com Domain Owners em Legal, Finance e Product, MDM Golden Record (CPF/CNPJ/OAB), Data Quality Score > 98%, Governança DAMA-DMBOK 2.0 com DataHub, Feast Feature Store para MLOps, Analytics em tempo real via Apache Flink e conformidade absoluta com a LGPD.

---

## ETAPA 1 — AUDITORIA DO MODELO ATUAL DE DADOS (AS-IS vs. TO-BE)

### 1.1 Matriz de Domínios de Dados

| Domínio de Dados | Origem Primária | Armazenamento Atual (AS-IS) | Problema Identificado | Evolução Necessária (TO-BE) |
|---|---|---|---|---|
| **Identidade & Acesso** | Formulários Frontend | `localStorage` / Prisma básico | Volatilidade e risco de segurança | PostgreSQL RDS Multi-AZ + Keycloak IAM |
| **Pessoas & Clientes** | Cadastros de Usuários | `localStorage` | Duplicidade e falta de MDM | MDM Golden Record + Deduplicação Jaro-Winkler |
| **Advogados & OAB** | Autodeclaração | `localStorage` | Cadastro não verificado na OAB | Validação OAB API + Silver Zone Iceberg |
| **Processos Jurídicos** | Entrada Manual | `localStorage` | Perda de histórico e sem sincronia | DataJud CNJ Ingestion + Event Bus Kafka |
| **Documentos & GED** | Upload local | Local / S3 Não Governa | Ausência de retenção e WORM | Cofre S3 Object Lock + Envelope Encryption |
| **Financeiro & Billing**| Transações pontuais | `localStorage` | Sem DRE ou conciliação | Financial Core + Redshift Star Schema |

---

## ETAPA 2 — DATA LANDSCAPE MAPPING (DO DADO BRUTO À DECISÃO)

```
[FONTES DE DADOS (PostgreSQL OLTP / DataJud / Gov.br / S3 GED / APIs)]
                                │
                                ▼
[CAMADA DE INGESTÃO (Debezium CDC + Airbyte + Kafka Events)]
                                │
                                ▼
[PROCESSAMENTO & DML (dbt Core + Apache Spark + Great Expectations)]
                                │
                                ▼
[ARMAZENAMENTO MEDALLION (S3 Iceberg Bronze/Silver ──> Redshift Gold DW)]
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
[ANALYTICS & BI PLATFORM]                       [AI & MACHINE LEARNING]
 • Superset (Executivo C-Level)                  • Feast Feature Store (Redis/S3)
 • Metabase (Operacional & Legal)                • pgvector HNSW (Embeddings RAG)
 • Embedded SDK In-App                           • Modelos ML (Previsão de Êxito)
        │                                               │
        └───────────────────────┬───────────────────────┘
                                ▼
                   [DECISÃO ESTRATÉGICA DATA-DRIVEN]
```

---

## ETAPA 3 — ENTERPRISE DATA ARCHITECTURE (TO-BE)

```
[FRONTEND REACT / MOBILE] ──> [API GATEWAY (Kong)] ──> [BACKEND MICROSERVICES]
                                                            │
                                                            ▼
                                        [OPERATIONAL DB (PostgreSQL 16 Multi-AZ + RLS)]
                                                            │ (Debezium CDC)
                                                            ▼
                                        [EVENT BUS (AWS MSK Apache Kafka)]
                                                            │
        ┌───────────────────────────────────────────────────┴───────────────────────────────────────────────────┐
        ▼                                                                                                       ▼
[DATA LAKEHOUSE (AWS S3 + Apache Iceberg)]                                                             [REAL-TIME ANALYTICS (Flink)]
 ├── Bronze (Raw Unstructured & CDC)                                                                    └── Alertas & Prazos Fatais
 ├── Silver (Curated MDM Golden Record)
 └── Gold (Redshift DW Star Schema Kimball)
```

---

## ETAPA 4 — MODELAGEM DE DADOS CORPORATIVA (OLTP 3NF & OLAP KIMBALL)

### 4.1 Data Warehouse Star Schema Kimball (Redshift DW)

```sql
-- FATO: fact_case_events (Eventos Processuais e Atendimentos)
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

-- DIMENSÃO: dim_lawyers (SCD Type 2 - Histórico de Alterações)
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

## ETAPA 5 — ESTRATÉGIA DE MIGRAÇÃO DE DADOS (FRONTEND → DATA PLATFORM)

```
[ESTADO ATUAL: React + localStorage]
                │
                ▼ (Fase 1: Migration Script + Schema Validation)
[ESTADO INTERMEDIÁRIO: NestJS API + PostgreSQL Operacional]
                │
                ▼ (Fase 2: Debezium CDC + Kafka Sync)
[ESTADO FINAL: Enterprise Data Lakehouse + Redshift DW]
```

---

## ETAPA 6 — DATA GOVERNANCE FRAMEWORK (DAMA-DMBOK 2.0 & RACI MATRIX)

| Função de Dados | Data Owner (Squad Lead) | Data Steward (Legal/Fin Analyst) | Data Custodian (DBA/DevOps) | DPO (Data Protection Officer) |
|---|---|---|---|---|
| Domínio Identidade | Responsável pela regra | Valida acessos | Mantém infraestrutura RDS | Audita consentimentos |
| Domínio Jurídico | Responsável pelo módulo | Valida dados de processos | Mantém barramento Kafka | Audita sigilo de documentos |
| Domínio Financeiro | Responsável por billing | Conclui conciliação | Mantém DW Redshift | Audita dados de cartões |

---

## ETAPA 7 — LGPD DATA GOVERNANCE & PRIVACY ENGINEERING

```
PRIVACY DATA MAP & GOVERNANCE:
1. PII Tags automatizadas no DataHub (tag:lgpd-sensitive, tag:lgpd-financial).
2. Exercício dos Direitos do Titular (Art. 18): Pipeline automatizado no Kafka (lgpd.rights.request) executando exportação JSON ou anonimização de dados em até 24h.
3. k-Anonymity em Datasets Analíticos: Aplicação de k ≥ 5 para remoção de identificadores indiretos em relatórios exportados.
```

---

## ETAPA 8 — DATA QUALITY MANAGEMENT (DAMA 6 DIMENSÕES)

```
DATA QUALITY RULES (Great Expectations Suite):
• Completude: expect_column_values_to_not_be_null(column="case_number") > 99.5%
• Validade CNJ: expect_column_values_to_match_regex(column="case_number", regex=r"^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$") > 99.5%
• Unicidade: expect_column_values_to_be_unique(column="cpf_cnpj") > 99.9%
• Consistência: dbt referential integrity tests entre faturas e clientes.
```

---

## ETAPA 9 — DATA MESH & DOMAIN DATA OWNERSHIP

```
DATA MESH ARCHITECTURE:
├── LEGAL DOMAIN: Data Product "case_events_curated" (Owner: Legal Squad)
├── FINANCIAL DOMAIN: Data Product "mrr_financial_ledger" (Owner: Finance Squad)
├── USER DOMAIN: Data Product "golden_record_clients" (Owner: Product Squad)
└── AI DOMAIN: Data Product "feature_store_vectors" (Owner: AI Squad)
```

---

## ETAPA 10 — BUSINESS INTELLIGENCE & MACHINE LEARNING DATA PLATFORM

- **Executive BI (Apache Superset):** Dashboards de MRR, ARR, LTV, CAC, NPS e Volume Global de Casos Ativos.
- **Operational BI (Metabase):** Dashboards de Prazos Fatais por Advogado, Faturamento de Honorários e SLAs.
- **Feast Feature Store:** Repositório de features online (Redis) para inferência de IA < 5ms e offline (S3 Parquet) para treinamento de modelos de prevenção de churn e probabilidade de êxito.

---

## ETAPA 11 — DATA OBSERVABILITY, BACKUP & DISASTER RECOVERY

- **Data Observability:** Monitoramento de frescor dos dados (*Freshness*), volume atípico (*Volume Anomalies*) e alterações de esquema (*Schema Drift*) com alertas no Grafana/PagerDuty.
- **Disaster Recovery:** **RPO < 5min** e **RTO < 15min** com PostgreSQL Point-in-Time Recovery (PITR), replicação Multi-AZ e S3 Object Lock (WORM).

---

## ETAPA 12 — BACKLOG TÉCNICO DE ENGENHARIA DE DADOS

---

### DATA-001 — Implantação da Arquitetura Data Lakehouse Medallion

**Problema:** Dados residem em estado volátil no frontend, sem banco analítico ou histórico de longo prazo.

**Impacto:** Impossibilidade de gerar inteligência de negócios, relatórios históricos ou alimentar modelos de IA.

**Solução:** Implantar o Data Lakehouse (AWS S3 + Apache Iceberg) com camadas Bronze, Silver e Gold orquestradas por Airflow e dbt.

**Prioridade:** ESTRATÉGICA | **Complexidade:** Alta | **Estimativa:** 6 semanas

---

### DATA-002 — Catálogo de Dados DataHub e Linhagem OpenLineage

**Problema:** Ausência de catálogo de dados e linhagem, gerando falta de visibilidade sobre a origem e impacto das transformações.

**Impacto:** Dificuldade de auditoria LGPD, duplicação de pipelines e riscos em migrações.

**Solução:** Deploy do DataHub OSS no Kubernetes com rastreamento OpenLineage e Glossário Jurídico Corporativo.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

### DATA-003 — Engine de Master Data Management (MDM Golden Record)

**Problema:** Cadastros duplicados de clientes e advogados gerando inconsistência operacional.

**Impacto:** Falhas em repasses de honorários e relatórios distorcidos.

**Solução:** Desenvolver o MDM Engine com deduplicação determinística e probabilística (Jaro-Winkler) publicando Golden Records no Kafka.

**Prioridade:** ALTA | **Complexidade:** Média-Alta | **Estimativa:** 5 semanas

---

### DATA-004 — Data Quality Framework com Great Expectations

**Problema:** Dados chegam às tabelas analíticas com falhas de formatação e valores nulos.

**Impacto:** Falta de confiança nos dashboards executivos e alucinações em respostas de IA.

**Solução:** Implementar suítes de teste de qualidade no dbt e Great Expectations bloqueando pipelines corrompidos.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

### DATA-005 — Feast Feature Store para MLOps e Sincronização pgvector

**Problema:** Modelos preditivos de IA não possuem repositório centralizado de features em tempo real.

**Impacto:** Latência alta no atendimento de IA e skew entre treino e produção.

**Solução:** Implantar a Feast Feature Store (Redis/S3) integrada ao pipeline de sincronização vetorial no pgvector.

**Prioridade:** ALTA | **Complexidade:** Média-Alta | **Estimativa:** 5 semanas

---

## ETAPA 13 — ARQUITETURA FINAL DE DADOS ENTERPRISE

```
LEGIS CONNECT — INTEGRATED ENTERPRISE DATA ARCHITECTURE
Versão 1.0 — Julho 2026

[FONTES OPERACIONAIS & EXTERNAS]
PostgreSQL 16 RDS · AWS S3 GED · DataJud CNJ · Gov.br · Stripe · Open Finance
          ↓
[INGESTÃO & EVENT STREAMING]
Debezium CDC · AWS MSK Apache Kafka · Airbyte Connectors · NestJS Webhooks
          ↓
[DATA LAKEHOUSE (AWS S3 + Apache Iceberg)]
Bronze (Raw Logs/CDC) ──> Silver (Curated & MDM Golden Record) ──> Gold (Star Schema DW)
          ↓
[GOVERNANÇA, SEGURANÇA & QUALIDADE (Transversal)]
DataHub Catalog · OpenLineage · Great Expectations Quality Gates · LGPD Privacy Map
          ↓
[CAMADA DE CONSUMO INTEGRADA]
 ├── Business Intelligence: Apache Superset (C-Level) & Metabase (Operacional)
 ├── AI & Machine Learning: Feast Feature Store & pgvector HNSW Vector DB
 └── Real-Time Analytics: Apache Flink Streaming (Alertas de Prazos Fatais)
```

---

*Enterprise Data Architecture, Governance & Legal Intelligence Blueprint v1.0*
*Chief Data Officer · Enterprise Data Architect · Legis Connect · 2026*
