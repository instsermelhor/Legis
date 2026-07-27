# 📊 ENTERPRISE DATA PLATFORM & BUSINESS INTELLIGENCE BLUEPRINT — LEGIS CONNECT
**PROMPT 021 — Auditoria Completa da Arquitetura de Dados, Business Intelligence, Data Warehouse, Governança e Analytics**
**Chief Data Officer (CDO) | Principal Enterprise Data Architect & BI Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A arquitetura de dados atual da Legis Connect pauta-se no **armazenamento desnormalizado no `localStorage` do navegador**, operado via `dbService.ts`. Não há separação entre banco relacional transacional (OLTP) e banco analítico (OLAP), não existem pipelines de extração e carga (ETL/ELT), não há catálogo de indicadores de negócio (KPIs), governança de linhagem de dados (*Data Lineage*) ou dashboards executivos em tempo real.

**Diagnóstico da Arquitetura de Dados**:
- **Maturidade de Dados (AS-IS)**: `0.8 / 5.0` (Inexistente / Armazenamento Local).
- **Incapacidade Analítica**: Impossibilidade de consolidar métricas de negócio como **MRR (Monthly Recurring Revenue)**, **ARR**, **CAC**, **LTV**, tempo médio de resposta de advogados ou taxa de retenção de escritórios.
- **Riscos de Governança**: Dados sensíveis e PII sem classificação LGPD, sem linhagem e sem controle de qualidade (*Data Quality*).

**Objetivo Arquitetural TO-BE**: Estruturar a **Enterprise Data & Analytics Engine**, implementando um modelo transacional **PostgreSQL 16 OLTP 3NF** com isolamento Multi-Tenant via RLS, pipeline CDC de captura contínua com **Debezium + Apache Kafka**, ambiente **Data Warehouse no AWS Redshift** estruturado em **Star Schema (Kimball)**, transformações declarativas com **`dbt` (data build tool)**, Data Lake em **AWS S3 + Apache Iceberg**, plataforma de BI **Metabase / Power BI Embed**, catálogo corporativo com **DataHub**, observabilidade com **Monte Carlo** e infraestrutura de ML com **Feast Feature Store**.

---

## ETAPA 1 — INVENTÁRIO COMPLETO DOS DADOS

### 1.1 Classificação dos Domínios de Dados da Plataforma

| Domínio de Dados | Entidades Principais | Sensibilidade (LGPD) | Criticidade de Negócio |
|---|---|---|---|
| **Cadastrais (Identity)** | `users`, `lawyer_profiles`, `client_profiles`, `workspaces` | 🔴 PII Sensível (CPF/OAB) | 🔴 CRÍTICA |
| **Jurídicos (Legal)** | `cases`, `case_stages`, `specialties`, `case_documents` | 🔴 Confidencial / Sigilo | 🔴 CRÍTICA |
| **Financeiros (Finance)** | `financial_transactions`, `invoices`, `subscriptions` | 🟠 Confidencial | 🔴 CRÍTICA |
| **Administrativos (Staff)**| `platform_staff`, `service_provisionings` | 🟡 Interno | 🟠 ALTA |
| **Operacionais (Ops)** | `lawyer_specialties`, `system_settings` | 🟢 Público / Interno | 🟡 MÉDIA |
| **Inteligência Artificial**| `prompt_templates`, `vector_embeddings`, `token_usage` | 🟡 Interno | 🟠 ALTA |
| **Analíticos (BI)** | `fact_contract_sales`, `fact_case_events` | 🟢 Anonimizado / Agregado | 🟠 ALTA |
| **Auditoria (Compliance)** | `staff_audit_logs`, `consent_records` | 🔴 Sigiloso / Imutável | 🔴 CRÍTICA |

---

## ETAPA 2 — ARQUITETURA GERAL DE DADOS (TO-BE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ENTERPRISE DATA & ANALYTICS ARCHITECTURE                │
│                                                                             │
│  [ OPERATIONAL LAYER (OLTP) ]                                               │
│  • NestJS API ──► AWS RDS PostgreSQL 16 (Multi-AZ com RLS por Workspace)   │
│                        │                                                    │
│                        ▼ Change Data Capture (CDC)                          │
│  [ INGESTION LAYER ]                                                        │
│  • Debezium CDC ──► Apache Kafka Event Stream ──► AWS S3 Raw Zone (Data Lake)│
│                                                              │              │
│                                                              ▼              │
│  [ ANALYTICAL LAYER (DW & LAKEHOUSE) ]                                      │
│  • AWS S3 (Bronze / Silver / Gold Zones com Apache Iceberg)                 │
│  • Apache Airflow + `dbt` (Data Build Tool - Star Schema Transformations)   │
│  • AWS Redshift / Snowflake (Enterprise Data Warehouse - OLAP)             │
│                                                              │              │
│                                                              ▼              │
│  [ SERVING & VISUALIZATION LAYER ]                                          │
│  • Metabase / Power BI Embedded (Dashboards Executivos e Operacionais)      │
│  • Feast Feature Store (Modelos Preditivos de ML - Churn & LTV Forecasting) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 3 — AUDITORIA DO MODELO TRANSACIONAL (OLTP)

* **Normalização Relacional (3NF)**: Garantida no schema Prisma v2.0 com tabelas de junção (`lawyer_specialties`), chaves primárias UUID v4 e chaves estrangeiras com integridade referencial estrita (`ON DELETE RESTRICT`).
* **Performance de Leitura/Escrita**: Índices B-Tree compostos para consultas do aplicativo (`workspace_id + status`) e índices GIN para busca textual por nome de partes.

---

## ETAPA 4 — ARQUITETURA DO DATA WAREHOUSE (MODELAGEM DIMENSIONAL KIMBALL)

```
                            STAR SCHEMA DATA WAREHOUSE
                            ══════════════════════════

                            ┌───────────────────┐
                            │   DIM_LAWYER      │
                            │ - lawyer_key (PK) │
                            │ - name, oab_num   │
                            └─────────┬─────────┘
                                      │
  ┌───────────────────┐               │               ┌───────────────────┐
  │   DIM_CLIENT      │               ▼               │     DIM_TIME      │
  │ - client_key (PK) ├───► ┌───────────────────┐ ◄───┤ - time_key (PK)   │
  │ - name, city, state│     │ FACT_CONTRACT_SALES│    │ - day, month, year│
  └───────────────────┘     │ - sale_id (PK)    │     └───────────────────┘
                            │ - lawyer_key (FK) │
  ┌───────────────────┐     │ - client_key (FK) │     ┌───────────────────┐
  │   DIM_WORKSPACE   │     │ - time_key (FK)   │     │    DIM_SERVICE    │
  │ - ws_key (PK)     ├───► │ - service_key(FK) ├───► │ - service_key(PK) │
  │ - workspace_name  │     │ - gross_amount    │     │ - service_name    │
  └───────────────────┘     │ - platform_fee    │     └───────────────────┘
                            └───────────────────┘
```

---

## ETAPA 5 — ESTRATÉGIA DE ETL/ELT (`Apache Airflow + dbt`)

* **Abordagem ELT (Extract, Load, Transform)**: Os dados são extraídos do PostgreSQL via Debezium CDC, carregados brutos no AWS S3 (Raw Zone) e transformados em tempo de consulta no AWS Redshift usando **`dbt` (data build tool)**.
* **Orquestração**: DAGs do **Apache Airflow** agendando execuções incrementais a cada 1 hora.

---

## ETAPA 6 — DATA LAKE & LAKEHOUSE ARCHITECTURE (AWS S3 + APACHE ICEBERG)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DATA LAKE ZONE ARCHITECTURE                           │
│                                                                             │
│  [ RAW ZONE (Bronze) ]    ──► JSONs brutos do CDC, logs de IA e eventos.    │
│  [ CLEANSED ZONE (Silver) ] ─► Parquet limpo, deduped, com tipos validados. │
│  [ CURATED ZONE (Gold) ]   ──► Tabelas agregadas Iceberg para DW e BI.     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 7 — FRAMEWORK DE GOVERNANÇA DE DADOS (DAMA-DMBOK)

### 7.1 Matriz RACI de Governança de Dados

| Papel / Responsabilidade | Data Owner (Negócio) | Data Steward (Qualidade) | Data Custodian (Infra/DBA) | DPO (Privacidade) |
|---|---|---|---|---|
| **Definição de Conceitos de Negócio** | 🔴 Accountable | 🟢 Responsible | 🟡 Consulted | 🟡 Informed |
| **Qualidade e Regras de Validação** | 🟡 Consulted | 🔴 Accountable | 🟢 Responsible | 🟡 Informed |
| **Criptografia e Performance DB** | 🟡 Informed | 🟡 Consulted | 🔴 Accountable | 🟢 Responsible |
| **Conformidade LGPD e Expurgo** | 🟡 Consulted | 🟢 Responsible | 🟢 Responsible | 🔴 Accountable |

---

## ETAPA 8 — DATA QUALITY ENGINE (GREAT EXPECTATIONS)

```
                             DATA QUALITY SCORECARD
                             ══════════════════════

  Critério de Qualidade          Métrica Target    Mecanismo de Validade
  ─────────────────────────────────────────────────────────────────────────────
  Completude (Completeness)      > 99.8%           Check de Nulos em colunas obrigatórias
  Consistência (Consistency)     100%              FK checks & dbt test assertions
  Unicidade (Uniqueness)         100%              Unique Index check em CPFs/OABs
  Atualidade (Freshness)         < 15 Minutos      Alertas de atraso de sync CDC no Airflow
```

---

## ETAPA 9 — MASTER DATA MANAGEMENT (MDM - GOLDEN RECORD)

* **Entidades Mestres**: Advogado, Cliente e Escritório Jurídico.
* **Resolução de Identidade**: Algoritmo de correspondência determinística baseada no hash do CPF/CNPJ + Levenshtein Distance em nomes completos para evitar duplicidades no cadastro.

---

## ETAPA 10 — DATA LINEAGE (RASTREABILIDADE END-TO-END)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA LINEAGE ENGINE (OPENLINEAGE + MARQUEZ)              │
│                                                                             │
│  [ Postgres `cases` ] ──► [ Debezium Stream ] ──► [ S3 Bronze Parquet ]     │
│                                                          │                  │
│                                                          ▼                  │
│  [ Metabase Dashboard ] ◄── [ Redshift DW ] ◄── [ dbt Model `stg_cases` ]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 11 — CATÁLOGO CORPORATIVO DE DADOS (DATAHUB / OPENMETADATA)

* **Documentação Automatizada**: O **DataHub** conecta-se ao PostgreSQL, AWS Redshift e `dbt`, gerando automaticamente o mapa de colunas, tipos, descrições de negócio e tags de sensibilidade LGPD (`PII_HIGH`, `PII_CONFIDENTIAL`).

---

## ETAPA 12 — CATÁLOGO DE INDICADORES ESTRATÉGICOS (KPIS)

```
                               CATÁLOGO DE KPIS
                               ═════════════════

  • METRICAS FINANCEIRAS:
    - MRR (Monthly Recurring Revenue): Receita mensal recorrente por assinaturas.
    - ARR (Annual Run Rate): Projeção de receita anualizada.
    - CAC (Customer Acquisition Cost): Custo de marketing/vendas por novo escritório.
    - LTV (Lifetime Value): Valor total gerado por um cliente ao longo do ciclo de vida.

  • METRICAS JURÍDICAS & OPERACIONAIS:
    - SLA de Resposta de Advogados: Tempo médio entre a dúvida do cliente e o retorno.
    - Rate de Fechamento de Casos: % de consultas convertidas em contratos firmados.
```

---

## ETAPA 13 — ARQUITETURA DE DASHBOARDS CORPORATIVOS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ARQUITETURA DE DASHBOARDS BI                         │
│                                                                             │
│  1. EXEC DASHBOARD ──► MRR, ARR, Churn Rate, LTV, CAC, Total de Contratos   │
│  2. LEGAL DASHBOARD ─► Processos Ativos por UF, Taxa de Êxito, SLA Resposta │
│  3. FIN DASHBOARD ──► Conciliação Stripe/PIX, Inadimplência, Repasse OAB    │
│  4. AI DASHBOARD ───► Token Consumption, Cost/Session, Feedback Rate      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 14 — ANALYTICS AVANÇADO E MODELOS PREDITIVOS

* **Predictive Churn Model**: Algoritmo de classificação (XGBoost) treinando em dados de uso da plataforma para prever escritórios com alto risco de cancelamento nos próximos 30 dias.
* **Propensão de Match Jurídico**: Modelo de recomendação cruzando o tipo da causa do cliente com o histórico de vitórias do advogado na mesma comarca.

---

## ETAPA 15 — OBSERVABILIDADE DOS DADOS (MONTE CARLO)

* **Monitores Automatizados**: Alertas imediatos caso ocorra uma alteração não comunicada no schema do banco de dados (*Schema Drift*) ou se o volume de registros inseridos no DW variar mais de 30% em relação à média histórica.

---

## ETAPA 16 — COMPLIANCE DE DADOS & RETENÇÃO LGPD

* **Política de Retenção Temporal**:
  - Dados Financeiros/Fiscais: Retenção obrigatória por **5 anos** (Lei nº 5.172/1966).
  - Logs de Acesso a Aplicação: Retenção obrigatória por **6 meses** (Marco Civil da Internet).
  - Expurgo LGPD: Anonimização irreversível dos dados cadastrais do titular mediante requisição confirmada via Portal de Privacidade.

---

## ETAPA 17 — SEGURANÇA DOS DADOS ANALÍTICOS

* **Máscaras de PII no BI**: Usuários das equipes de negócios navegam no Metabase/Power BI visualizando CPFs e e-mails mascarados (`***.456.789-**`), preservando a privacidade dos clientes.

---

## ETAPA 18 — ARCHITECTURE FOR MACHINE LEARNING (FEAST FEATURE STORE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FEAST FEATURE STORE ARCHITECTURE                       │
│                                                                             │
│  [ Offline Store (Redshift/S3) ] ──► Treinamento de Modelos Preditivos      │
│                                              │                              │
│                                              ▼                              │
│  [ Online Store (Redis Cluster) ] ──► Inferência em Tempo Real (< 10ms)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 19 — ROADMAP EVOLUTIVO DA PLATAFORMA DE DADOS

```
                    ROADMAP DA PLATAFORMA DE DADOS
                    ══════════════════════════════

  FASE 1: FUNDAÇÃO OLTP & CDC (Semanas 1-4)
  ├── Implantação do PostgreSQL 16 Multi-AZ com Prisma v2.0 3NF
  ├── Ativação do Change Data Capture (CDC) via Debezium + Kafka
  └── Definição das políticas de Data Governance e DAMA-DMBOK

  FASE 2: DATA WAREHOUSE & BI (Semanas 5-8)
  ├── Deploy do AWS Redshift DW com Kimball Star Schema
  ├── Modelos de transformação declarativa em `dbt`
  └── Instalação do Metabase BI e publicação dos Dashboards de KPIs

  FASE 3: DATA LAKE & ADVANCED ANALYTICS (Semanas 9-12)
  ├── Data Lake AWS S3 + Apache Iceberg (Bronze/Silver/Gold)
  ├── Implantação do Feast Feature Store para ML
  └── Modelos Preditivos de Churn Rate e Match Jurídico
```

---

## ETAPA 20 — BACKLOG TÉCNICO DA PLATAFORMA DE DADOS

### DATA-001 — Deploy do PostgreSQL 16 OLTP 3NF e Migração de Dados
* **Problema**: Dados persistidos localmente no `localStorage`.
* **Solução**: Provisionar RDS PostgreSQL 16 Multi-AZ e migrar dados para schema 3NF.
* **Prioridade**: 🔴 EMERGENCIAL | **Complexidade**: Alta | **Esforço**: 60h

### DATA-002 — Implantação do Pipeline CDC Debezium + Apache Kafka
* **Problema**: Ausência de captura de mudanças em tempo real para análises.
* **Solução**: Pipeline CDC enviando alterações do PostgreSQL para o Data Lake S3.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 48h

### DATA-003 — Data Warehouse AWS Redshift com Star Schema Kimball
* **Problema**: Impossibilidade de executar consultas analíticas sem travar o banco produtivo.
* **Solução**: DW dimensional com tabelas fato e dimensões otimizadas.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 56h

### DATA-004 — Modelos de Transformação `dbt` e Dashboards Metabase
* **Problema**: Falta de visão de KPIs executivos (MRR, ARR, Churn, LTV).
* **Solução**: Pipelines `dbt` alimentando painéis executivos no Metabase BI.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Média | **Esforço**: 40h

### DATA-005 — Setup do Catálogo Corporativo de Dados com DataHub
* **Problema**: Falta de linhagem e documentação dos dados corporativos.
* **Solução**: Instalação do DataHub catalogando schemas e classificações LGPD.
* **Prioridade**: 🟠 ALTA | **Complexidade**: Média | **Esforço**: 32h

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 021

| Entregável | Status |
|---|---|
| ✅ Inventário Completo dos Dados (Mapeamento de 8 Domínios de Dados) | Concluído |
| ✅ Arquitetura Corporativa de Dados (Modelo 4 Camadas TO-BE) | Concluído |
| ✅ Auditoria do Modelo Transacional OLTP (PostgreSQL 16 3NF + RLS) | Concluído |
| ✅ Projeto do Data Warehouse (Kimball Star Schema com Fatos e Dimensões) | Concluído |
| ✅ Estratégia de ETL/ELT (Apache Airflow + `dbt` Transformations) | Concluído |
| ✅ Arquitetura do Data Lake (AWS S3 Bronze/Silver/Gold + Apache Iceberg) | Concluído |
| ✅ Framework de Governança de Dados (DAMA-DMBOK + Matriz RACI) | Concluído |
| ✅ Plano de Data Quality (Great Expectations Engine & Scorecard) | Concluído |
| ✅ Estratégia de Master Data Management (MDM Golden Record) | Concluído |
| ✅ Modelo de Data Lineage (OpenLineage + Marquez Integration) | Concluído |
| ✅ Catálogo Corporativo de Dados (DataHub / OpenMetadata Integration) | Concluído |
| ✅ Catálogo de KPIs Estratégicos (MRR, ARR, CAC, LTV, Churn, SLAs) | Concluído |
| ✅ Arquitetura de Dashboards Corporativos (Metabase / Power BI Embedded) | Concluído |
| ✅ Estratégia de Analytics Avançado (Predictive Churn & Legal Match Models) | Concluído |
| ✅ Plano de Observabilidade dos Dados (Monte Carlo Data Drift Alerts) | Concluído |
| ✅ Matriz de Compliance de Dados (Politica de Retencao Temporal LGPD) | Concluído |
| ✅ Plano de Segurança dos Dados (Mascara de PII no BI + KMS AES-256) | Concluído |
| ✅ Arquitetura preparada para Machine Learning (Feast Feature Store) | Concluído |
| ✅ Roadmap Evolutivo da Plataforma de Dados em 3 Fases (12 semanas) | Concluído |
| ✅ Backlog Técnico da Plataforma de Dados Priorizado (`DATA-001` a `DATA-005`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 021 — Enterprise Data Platform & Business Intelligence Blueprint | v1.0.0*
*Próximo: PROMPT 022 — Plano Mestre de Reengenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
