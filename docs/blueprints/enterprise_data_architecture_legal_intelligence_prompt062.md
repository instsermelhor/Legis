# PROMPT 062 — Enterprise Data Architecture & Legal Intelligence Data Platform Blueprint
## Legis Connect · CDO · Enterprise Data Architect · Analytics Engineering · Data Governance
### Versão 1.0 COMPLETA | Classificação: CONFIDENCIAL | Data: 2026-07-25 | 27 Etapas Auditadas

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Corporativa Completa de Dados da Legis Connect TO-BE**, cobrindo as 27 etapas mandatórias: Data Architecture Enterprise, Data Governance Office, Data Lake (AWS S3 + Delta Lake), Data Warehouse (AWS Redshift), Data Lakehouse (Apache Iceberg), ETL/ELT (Apache Airflow + dbt), Real-Time Streaming (Apache Kafka + Flink), Master Data Management, Data Catalog (Apache Atlas), Data Quality (Great Expectations), Business Intelligence (Apache Superset + Metabase), Legal Analytics, AI Data Infrastructure, Secure Data Architecture (Row-Level Security + Column Masking), LGPD Compliance, Data Lineage (OpenLineage), Data Mesh e API Data Strategy.

**Estado AS-IS:** Maturidade de Dados `1.0 / 5.0` — dados armazenados no `localStorage` do browser, AppDataContext React para estado em memória, zero banco de dados corporativo, zero histórico persistente, zero analytics, zero governança, zero LGPD compliance para dados em repouso.

**Estado TO-BE:** Maturidade `4.7 / 5.0` — PostgreSQL 16 transacional, Redshift analítico, Data Lake S3 + Delta Lake, Kafka streaming, dbt transformações, Great Expectations qualidade, Apache Atlas catálogo, Superset dashboards executivos, LGPD compliance integral, Data Governance Office formalizado e Data Mesh operacional por domínio jurídico.

---

## ETAPA 1 — AUDITORIA DA ARQUITETURA DE DADOS ATUAL

### 1.1 Inventário Completo dos Domínios de Dados

| Domínio de Dados | Origem | Armazenamento Atual | Risco |
|---|---|---|---|
| **Usuários / Auth** | Formulários de cadastro | localStorage + AppDataContext (memória) | CRÍTICO: Perda ao fechar aba |
| **Perfis de Advogados** | Cadastro profissional | localStorage por chave JSON | CRÍTICO: Sem validação OAB |
| **Perfis de Clientes** | Cadastro de clientes | localStorage + memória React | CRÍTICO: Dados pessoais sem LGPD |
| **Escritórios / Orgs** | Cadastro de escritório | localStorage estruturado | ALTO: Sem hierarquia formal |
| **Serviços Jurídicos** | Catálogo de serviços | AppDataContext (volátil) | ALTO: Sem versionamento |
| **Documentos Jurídicos** | Upload de arquivos | Estado React (sem persistência) | CRÍTICO: Documentos perdidos ao recarregar |
| **Processos Judiciais** | Entrada manual | localStorage JSON | ALTO: Sem integração DataJud |
| **Financeiro / Pagamentos** | Stripe Webhook (parcial) | Sem banco — apenas webhook | CRÍTICO: Sem reconciliação financeira |
| **Auditoria / Logs** | Não existe | Não existe | CRÍTICO: Zero rastreabilidade |
| **Dados de IA** | Gemini API calls | Sem persistência | ALTO: Zero analytics de uso |
| **Mensagens / Chat** | Estado React temporário | Memória volátil | ALTO: Histórico perdido por sessão |
| **Avaliações e Reviews** | Formulários | localStorage | MÉDIO: Sem análise de sentimento |

### 1.2 Score de Maturidade de Dados

| Dimensão | AS-IS | TO-BE | Gap |
|---|---|---|---|
| Persistência e Confiabilidade | 0.5 / 5.0 | 5.0 / 5.0 | +4.5 |
| Governança e Qualidade | 0.0 / 5.0 | 4.7 / 5.0 | +4.7 |
| Analytics e BI | 0.0 / 5.0 | 4.8 / 5.0 | +4.8 |
| Segurança e LGPD | 0.5 / 5.0 | 4.9 / 5.0 | +4.4 |
| Integração e Streaming | 0.0 / 5.0 | 4.5 / 5.0 | +4.5 |
| AI Data Infrastructure | 0.0 / 5.0 | 4.6 / 5.0 | +4.6 |
| **Maturidade Geral** | **1.0 / 5.0** | **4.7 / 5.0** | **+3.7** |

---

## ETAPA 2 — DIAGNÓSTICO DA ARQUITETURA ATUAL (DATA ARCHITECTURE RISK ASSESSMENT)

### 2.1 Arquitetura AS-IS com Riscos Críticos

```
ARQUITETURA ATUAL (CRITICAMENTE INSEGURA E FRÁGIL):

[Usuário] → [React Application]
  ↓ (toda lógica no frontend — sem separação)
[AppDataContext — Estado Global React]
  ↓ (dados em memória RAM — perdidos com refresh)
[localStorage — Browser Storage]
  ↓ (limite 5MB por domínio, sem criptografia)
[Dados da Plataforma — SEMIPERSISTENTES]

PROBLEMAS CRÍTICOS CONFIRMADOS:
  [A] localStorage não é banco de dados: limite 5MB, sem ACID, sem backup
  [B] Dados perdidos em: modo anônimo, limpeza de cache, troca de device
  [C] LGPD: dados pessoais (CPF, email) sem criptografia em repouso
  [D] Zero analytics: impossível gerar KPIs, relatórios ou indicadores
  [E] Zero auditoria: sem trilha de quem acessou, criou ou alterou dados
  [F] Zero integração: dados isolados no browser — inacessíveis para IA/Airflow
  [G] Multi-usuário impossível: sem servidor, dados não são compartilhados
  [H] Backup: inexistente — dados do usuário podem ser perdidos permanentemente
```

### 2.2 Data Architecture Risk Matrix

| ID | Risco | Prob. | Impacto | CVSS | Controle TO-BE |
|---|---|---|---|---|---|
| DATA-001 | Perda total de dados com limpeza de cache | Alta | Crítico | 9.5 | PostgreSQL RDS + backup automático |
| DATA-002 | Dados pessoais sem criptografia em repouso | Alta | Crítico | 9.0 | AES-256 em repouso + TLS em trânsito |
| DATA-003 | Zero auditoria de operações | Alta | Alto | 8.5 | Audit Trail imutável no PostgreSQL |
| DATA-004 | Nenhum analytics ou KPI possível | Alta | Alto | 8.0 | Redshift DW + Superset BI |
| DATA-005 | Multi-tenancy impossível sem banco | Alta | Crítico | 9.0 | PostgreSQL + Row-Level Security |
| DATA-006 | LGPD: sem controle de consentimento | Alta | Alto | 8.5 | Consent Management Platform |
| DATA-007 | Zero histórico — sem Data Lake | Alta | Alto | 8.0 | S3 + Delta Lake para dados históricos |
| DATA-008 | Financeiro sem reconciliação | Alta | Crítico | 9.0 | PostgreSQL + Stripe reconciliation |

---

## ETAPA 3 — ENTERPRISE DATA ARCHITECTURE TARGET

### 3.1 Arquitetura TO-BE em 6 Camadas

```
LEGIS CONNECT — ENTERPRISE DATA ARCHITECTURE TO-BE

CAMADA 1 — FONTES DE DADOS (DATA SOURCES)
  Aplicação SaaS (NestJS API) · Stripe Payments · DataJud CNJ
  Gemini/Claude APIs · OAB API · DOU/Planalto · Usuários (UI)

CAMADA 2 — DATA INGESTION LAYER
  Batch: Apache Airflow DAGs (diário/semanal)
  Streaming: Apache Kafka + Kafka Connect (tempo real)
  CDC: Debezium (Change Data Capture do PostgreSQL)
  APIs: RESTful + Webhooks (Stripe, DataJud)

CAMADA 3 — DATA STORAGE LAYER
  OLTP: PostgreSQL 16 RDS (transacional — fonte da verdade)
  Data Lake: AWS S3 + Delta Lake (dados brutos + histórico)
  Data Warehouse: AWS Redshift (analytics + BI)
  Cache: Redis (dados quentes + sessões)
  Search: ElasticSearch (busca full-text + BM25)
  Vector: pgvector (embeddings para IA/RAG)

CAMADA 4 — DATA PROCESSING LAYER
  Batch ETL/ELT: Apache Airflow + dbt (transformações)
  Streaming: Apache Flink (processamento eventos real-time)
  Quality: Great Expectations (validação e contratos de dados)
  Catalog: Apache Atlas + DataHub (metadados e lineage)

CAMADA 5 — ANALYTICS & INTELLIGENCE LAYER
  BI Executivo: Apache Superset + Metabase
  Legal Analytics: Dashboards jurídicos especializados
  Predictive: MLflow + Scikit-learn (modelos preditivos)
  AI RAG: pgvector + LiteLLM (Legal Intelligence)
  NL Query: Text-to-SQL com LLM para perguntas em português

CAMADA 6 — CONSUMPTION LAYER
  Aplicação SaaS (Legis Connect Frontend)
  AI Copilot (Legis Copilot + Legal Assistant)
  APIs de Dados (REST + GraphQL para parceiros)
  Alertas e Notificações (prazos, insights proativos)
  Exportação (relatórios PDF + CSV para escritórios)
```

---

## ETAPA 4 — DATABASE STRATEGY ARCHITECTURE

### 4.1 Arquitetura Poliglota de Bancos

| Banco | Tipo | Tecnologia | Responsabilidade |
|---|---|---|---|
| **PostgreSQL 16 RDS** | OLTP Transacional | AWS RDS Multi-AZ | Fonte da verdade: usuários, contratos, processos, financeiro |
| **AWS Redshift** | OLAP Analítico | Cluster RA3 | Data Warehouse: KPIs, relatórios, BI executivo |
| **AWS S3 + Delta Lake** | Data Lake | S3 + Apache Iceberg | Dados históricos, logs, eventos, documentos brutos |
| **Redis 7** | Cache + STM | ElastiCache | Sessões, cache, AI Short-Term Memory, rate limiting |
| **ElasticSearch 8** | Search Engine | AWS OpenSearch | Full-text jurídico, BM25 RAG, logs Kibana |
| **pgvector (PostgreSQL)** | Vector DB | Extensão PostgreSQL | Embeddings RAG — 1536-dim HNSW — isolamento por workspace |

### 4.2 Decisão de Stack — PostgreSQL como OLTP Principal

```
JUSTIFICATIVA POSTGRESQL 16 RDS:
  ✓ ACID compliance — essencial para dados jurídicos e financeiros
  ✓ Row-Level Security — multi-tenancy nativo por workspace_id
  ✓ pgvector — embeddings RAG na mesma instância (reduz latência)
  ✓ Extensões jurídicas: unaccent, pg_trgm (busca com acento PT-BR)
  ✓ Logical Replication → CDC via Debezium → Kafka → Redshift
  ✓ PITR (Point-in-Time Recovery) — RPO < 5 minutos

CONFIGURAÇÃO RDS:
  Instância: db.r6g.2xlarge (8 vCPUs, 64GB RAM)
  Storage: gp3 1TB (IOPS provisionados: 6.000)
  Multi-AZ: Sim (failover automático < 60s)
  Backup: Diário + PITR 35 dias
  Encryption: AES-256 em repouso + TLS 1.3 em trânsito
  Monitoring: Enhanced Monitoring + Performance Insights
```

---

## ETAPA 5 — ENTERPRISE DATA MODEL

### 5.1 Domínios de Dados e Entidades Principais

```
DOMAIN: IDENTITY
  entities: User, Organization, Role, Permission, Session, AuditLog
  owner: Engineering Squad (Platform)
  sensitivity: CONFIDENTIAL (PII)

DOMAIN: LEGAL
  entities: Lawyer, LawyerProfile, Client, LegalCase, CaseDocument,
            CaseTimeline, ProcessMovement, LegalService, Contract
  owner: Legal Product Squad
  sensitivity: SENSITIVE (dados jurídicos + PII)

DOMAIN: FINANCIAL
  entities: Subscription, Plan, Payment, Invoice, Commission,
            StripeCustomer, Payout, FinancialTransaction
  owner: Finance Squad
  sensitivity: CONFIDENTIAL (dados financeiros)

DOMAIN: MARKETPLACE
  entities: ServiceListing, ServiceMatch, Review, Rating,
            SmartMatchScore, MarketplaceTransaction
  owner: Marketplace Squad
  sensitivity: INTERNAL

DOMAIN: AI & KNOWLEDGE
  entities: AISession, AIPromptHash, AIResponseHash, AIAuditLog,
            LegalKnowledgeBase, Embedding, RAGQuery, ModelVersion
  owner: AI Squad (CAIO)
  sensitivity: CONFIDENTIAL (hashes + metadados)

DOMAIN: ANALYTICS
  entities: DailyMetric, UserEvent, FunnelEvent, RevenueMetric,
            ChurnSignal, ProductUsage, PerformanceMetric
  owner: Data Squad (CDO)
  sensitivity: INTERNAL (anonimizado)
```

### 5.2 Schema Central — LEGAL DOMAIN (PostgreSQL 16)

```sql
-- Escritório / Organização
CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(256) NOT NULL,
    cnpj            VARCHAR(18) UNIQUE,
    oab_seccional   VARCHAR(2),
    plan_id         UUID REFERENCES subscription_plans(id),
    status          VARCHAR(16) DEFAULT 'active' CHECK (status IN ('active','suspended','cancelled')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Usuário (todos os tipos — Advogado, Cliente, Admin)
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID REFERENCES organizations(id),
    email           VARCHAR(256) UNIQUE NOT NULL,
    email_hash      CHAR(64) NOT NULL,       -- SHA-256 para busca sem expor PII
    phone_encrypted BYTEA,                   -- AES-256-GCM
    full_name       VARCHAR(256) NOT NULL,
    name_encrypted  BYTEA,                   -- AES-256-GCM (LGPD)
    role            VARCHAR(32) NOT NULL CHECK (role IN ('admin','lawyer','client','staff')),
    oab_number      VARCHAR(16),
    oab_uf          CHAR(2),
    status          VARCHAR(16) DEFAULT 'active',
    lgpd_consent_at TIMESTAMPTZ,
    lgpd_version    VARCHAR(8),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Caso Jurídico
CREATE TABLE legal_cases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID REFERENCES organizations(id) NOT NULL,
    client_id       UUID REFERENCES users(id) NOT NULL,
    lawyer_id       UUID REFERENCES users(id) NOT NULL,
    case_number_cnj VARCHAR(25),              -- formato CNJ NNNNNNN-NN.NNNN.N.NN.NNNN
    area_direito    VARCHAR(64) NOT NULL,
    status          VARCHAR(32) DEFAULT 'intake',
    priority        VARCHAR(8) DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
    risk_score      DECIMAL(3,2),             -- 0.00–1.00 (modelo preditivo)
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Row-Level Security — multi-tenancy seguro
ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON legal_cases
    USING (org_id = current_setting('app.current_org_id')::UUID);

-- Audit Trail imutável
CREATE TABLE audit_trail (
    id              BIGSERIAL PRIMARY KEY,
    table_name      VARCHAR(64) NOT NULL,
    record_id       UUID NOT NULL,
    action          VARCHAR(8) NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE','SELECT')),
    actor_id        UUID NOT NULL,
    actor_ip        INET,
    old_values      JSONB,
    new_values      JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Particionamento mensal do Audit Trail
CREATE TABLE audit_trail_2026_07 PARTITION OF audit_trail
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
```

---

## ETAPA 6 — DATA GOVERNANCE FRAMEWORK

### 6.1 Legis Connect Data Governance Office

| Papel | Responsabilidade | Reunião |
|---|---|---|
| **CDO (Chief Data Officer)** | Estratégia de dados + Data Mesh evolution | Semanal |
| **Data Governance Council** | Políticas, classificação, prioridades (CTO + CISO + DPO + CPO) | Quinzenal |
| **Domain Data Owner** | Responsável pelos dados de cada domínio (1 por Squad) | Por demanda |
| **Data Steward** | Qualidade, catálogo, metadados (1 por domínio) | Diária |
| **DPO (Data Protection Officer)** | LGPD compliance e atendimento a titulares | Semanal |

### 6.2 Políticas de Governança de Dados

```
POLÍTICA DATA-GOV-001: Toda nova tabela deve ter:
  - Domain Owner registrado no Apache Atlas
  - Classificação de sensibilidade (PUBLIC/INTERNAL/CONFIDENTIAL/SENSITIVE)
  - Retention policy definida (em dias)
  - LGPD legal basis documentada (se contiver PII)
  - Data Steward designado

POLÍTICA DATA-GOV-002: Ciclo de vida de dados:
  - Criação: schema migration versionada (Flyway)
  - Modificação: via PR aprovado pelo Domain Data Owner
  - Deprecação: período de 90 dias com aviso nos consumidores
  - Eliminação: aprovação CDO + DPO + registro no audit trail

POLÍTICA DATA-GOV-003: Acesso a dados:
  - Princípio do Menor Privilégio para todos os usuários de BD
  - Service Accounts por microserviço (sem credenciais compartilhadas)
  - Acesso a dados SENSITIVE: MFA obrigatório + aprovação do DPO
  - Acesso direto ao banco: proibido em produção (somente via API)

POLÍTICA DATA-GOV-004: Qualidade de dados:
  - Great Expectations checks em toda pipeline de ingestão
  - SLA de qualidade: completude >= 99%, unicidade >= 99.9%
  - Dado com qualidade abaixo do threshold é quarentenado
  - Alertas automáticos ao Data Steward do domínio
```

### 6.3 Classificação de Dados no Data Governance

| Nível | Definição | Exemplos | Controles |
|---|---|---|---|
| **PUBLIC** | Dados sem restrição | Legislação, jurisprudência pública | Nenhum especial |
| **INTERNAL** | Dados operacionais da empresa | Métricas de uso, logs anonimizados | Acesso autenticado |
| **CONFIDENTIAL** | Dados estratégicos e financeiros | MRR, contratos, planos | RBAC + audit log |
| **SENSITIVE** | PII + dados jurídicos | CPF, processos, documentos | Criptografia + DPO approval |

---

## ETAPA 7 — ENTERPRISE DATA CLASSIFICATION FRAMEWORK

### 7.1 Taxonomia de Classificação por Entidade

```
DOMAIN: IDENTITY (SENSITIVE)
  User.email              → SENSITIVE (PII — LGPD Art. 5º, I)
  User.name_encrypted     → SENSITIVE (PII — criptografado AES-256)
  User.phone_encrypted    → SENSITIVE (PII — criptografado AES-256)
  User.oab_number         → CONFIDENTIAL (dado profissional)
  User.lgpd_consent_at    → CONFIDENTIAL (registro de consentimento)

DOMAIN: LEGAL (SENSITIVE)
  LegalCase.case_number   → CONFIDENTIAL (dado processual)
  LegalCase.risk_score    → CONFIDENTIAL (análise proprietária)
  CaseDocument.content    → SENSITIVE (segredo profissional OAB)
  Contract.terms          → SENSITIVE (dados contratuais)

DOMAIN: FINANCIAL (CONFIDENTIAL)
  Payment.amount          → CONFIDENTIAL
  Payment.stripe_id       → CONFIDENTIAL (tokenizado)
  Invoice.tax_info        → CONFIDENTIAL
  FinancialTransaction    → CONFIDENTIAL

DOMAIN: ANALYTICS (INTERNAL)
  DailyMetric.*           → INTERNAL (anonimizado, sem PII)
  UserEvent.*             → INTERNAL (event_id + org_id apenas)
  RevenueMetric.*         → INTERNAL

DOMAIN: AI (INTERNAL/CONFIDENTIAL)
  AIPromptHash            → CONFIDENTIAL (hash SHA-256 — nunca o prompt raw)
  AIAuditLog              → CONFIDENTIAL
  LegalKnowledgeBase      → PUBLIC (dados jurídicos públicos)
  Embedding               → INTERNAL
```

---

## ETAPA 8 — DATA CATALOG ARCHITECTURE (APACHE ATLAS + DATAHUB)

### 8.1 Comparação de Soluções de Data Catalog

| Solução | Open Source | Lineage | Integração Airflow | Classificação | Escolha |
|---|---|---|---|---|---|
| **Apache Atlas** | Sim | Sim (nativo) | Sim | Sim | Principal |
| **DataHub** | Sim | Sim | Sim | Sim | Complementar |
| Collibra | Não | Sim | Sim | Sim | Descartado (custo) |
| Alation | Não | Parcial | Sim | Sim | Descartado (custo) |

**Decisão:** Apache Atlas como catálogo principal + DataHub como interface de descoberta para times de dados.

### 8.2 Estrutura do Catálogo de Dados

```
CATÁLOGO — ENTIDADE: legal_cases (exemplo completo)

  Nome:            legal_cases
  Domínio:         LEGAL
  Proprietário:    Legal Product Squad (Lead: @senior-engineer-legal)
  Data Steward:    @data-steward-legal
  Banco:           PostgreSQL 16 RDS (legis-prod-db)
  Schema:          public
  Tipo:            TABLE (OLTP — fonte da verdade)
  Registros:       ~850.000 (estimado ano 1)
  Sensibilidade:   SENSITIVE
  LGPD Base Legal: Art. 7º, V — execução de contrato
  Retenção:        7 anos após encerramento do caso (LGPD + normas OAB)
  PII Presente:    Sim (client_id → User.name_encrypted, User.email_hash)
  Criptografia:    AES-256 em repouso (RDS Encryption), TLS 1.3 em trânsito
  Consumidores:    NestJS API, Apache Airflow (ETL), Redshift (analytics)
  Lineage:         User → legal_cases → case_documents → Redshift DW → Superset
  Qualidade:       Great Expectations Suite "legal_cases_quality" (diário)
  SLA Qualidade:   completude >= 99.5%, unicidade case_number_cnj >= 99.9%
  Última Auditoria: 2026-07-25
  Classificação Atlas: LegalData, SensitiveData, PIIRelated
```

---

## ETAPA 9 — MASTER DATA MANAGEMENT FRAMEWORK (MDM)

### 9.1 Golden Record por Domínio MDM

| Domínio MDM | Entidade Master | Chave Natural | Deduplicação | Sistema Autoritativo |
|---|---|---|---|---|
| **Advogado** | Lawyer (User com role=lawyer) | oab_number + oab_uf | Fuzzy match nome + CPF hash | OAB API + cadastro Legis |
| **Cliente** | Client (User com role=client) | cpf_hash (SHA-256) | Deterministic match por CPF hash | Cadastro Legis + validação CPF |
| **Escritório** | Organization | cnpj | Exact match CNPJ | Receita Federal API + cadastro |
| **Processo** | LegalCase | case_number_cnj (formato CNJ) | Exact match CNJ | DataJud API + cadastro manual |
| **Serviço Jurídico** | LegalService | slug (gerado) | Curado manualmente | Equipe jurídica Legis |

### 9.2 Pipeline MDM — Deduplicação de Advogados

```
PIPELINE MDM — ADVOGADO GOLDEN RECORD:

1. INGESTÃO: Novo cadastro de advogado na plataforma
2. NORMALIZAÇÃO: Normaliza nome (minúsculas, sem acentos, sem sufixos)
3. BLOCKING: Agrupa candidatos por {oab_uf, primeiro_nome[0:3]}
4. MATCHING: Algoritmo Jaro-Winkler (score >= 0.92 = duplicata)
5. VALIDAÇÃO OAB: Consulta API OAB — verifica situação do registro
6. GOLDEN RECORD: Merge de atributos (mais recente / mais completo prevalece)
7. SOBREVIVENTE: ID original preservado, duplicatas marcadas (status=duplicate)
8. PROPAGAÇÃO: Referências atualizadas via foreign key cascade
9. AUDIT: Operação MDM registrada no audit_trail com justificativa

SLA: Processo MDM rodando diariamente via Airflow DAG às 01h00 BRT
```

---

## ETAPA 10 — DATA QUALITY FRAMEWORK (GREAT EXPECTATIONS)

### 10.1 Dimensões de Qualidade de Dados

| Dimensão | Definição | Métrica | Target | Alerta |
|---|---|---|---|---|
| **Completude** | Campos obrigatórios preenchidos | % registros sem nulos em campos críticos | >= 99.5% | < 98% → P1 |
| **Unicidade** | Sem registros duplicados | % registros únicos por chave natural | >= 99.9% | < 99.5% → P1 |
| **Precisão** | Formato e valores válidos | % registros com valores no domínio esperado | >= 99.0% | < 98% → P2 |
| **Consistência** | Dados coerentes entre sistemas | % registros consistentes cross-system | >= 98.0% | < 95% → P1 |
| **Atualidade** | Dados dentro do prazo de atualização | % registros atualizados no SLA | >= 99.0% | < 97% → P2 |
| **Referencial** | Integridade de chaves estrangeiras | % FK válidas sem registros órfãos | 100% | < 100% → P0 |

### 10.2 Great Expectations Suite — Legal Cases

```python
import great_expectations as ge

# Suite de qualidade para a tabela legal_cases
context = ge.get_context()

suite = context.create_expectation_suite("legal_cases_quality", overwrite_existing=True)

validator = context.get_validator(
    datasource_name="legis_postgres_prod",
    data_asset_name="legal_cases"
)

# Completude
validator.expect_column_values_to_not_be_null("id")
validator.expect_column_values_to_not_be_null("org_id")
validator.expect_column_values_to_not_be_null("client_id")
validator.expect_column_values_to_not_be_null("lawyer_id")
validator.expect_column_values_to_not_be_null("area_direito")

# Unicidade
validator.expect_column_values_to_be_unique("id")
validator.expect_compound_columns_to_be_unique(["case_number_cnj"])

# Domínio de valores
validator.expect_column_values_to_be_in_set(
    "area_direito",
    ["trabalhista", "civil", "penal", "tributario", "familia",
     "empresarial", "previdenciario", "consumidor", "administrativo"]
)
validator.expect_column_values_to_be_in_set(
    "priority", ["low", "normal", "high", "urgent"]
)

# Formato CNJ
validator.expect_column_values_to_match_regex(
    "case_number_cnj",
    r"^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$"
)

# Integridade temporal
validator.expect_column_values_to_be_dateutil_parseable("created_at")
validator.expect_column_pair_values_to_be_equal(
    "created_at", "updated_at",
    or_equal=True  # updated_at sempre >= created_at
)

validator.save_expectation_suite()
# Executado diariamente via Airflow + resultados no Data Docs
```

---

## ETAPA 11 — DATA LAKE ARCHITECTURE (AWS S3 + DELTA LAKE)

### 11.1 Arquitetura de Zonas do Data Lake

```
DATA LAKE — S3 BUCKET STRUCTURE:

s3://legis-data-lake-prod/

ZONE 1: RAW (Bronze — dados brutos, imutáveis)
  /raw/
    /postgresql/legal_cases/year=2026/month=07/day=25/*.parquet
    /postgresql/users/year=2026/month=07/day=25/*.parquet
    /stripe/events/year=2026/month=07/day=25/*.json
    /datajud/movements/year=2026/month=07/day=25/*.json
    /gemini_api/audit_logs/year=2026/month=07/*.json
  Retenção: 7 anos | Formato: Parquet + JSON | Compressão: Snappy
  Versionamento S3: Habilitado | Criptografia: SSE-S3 (AES-256)

ZONE 2: CURATED (Silver — dados limpos e validados)
  /curated/
    /legal_cases_clean/                (deduplicados + Great Expectations)
    /users_anonymized/                 (PII substituída por pseudônimos)
    /financial_reconciled/             (Stripe reconciliado com PostgreSQL)
    /ai_interactions_aggregated/       (métricas por sessão, sem conteúdo)
  Retenção: 5 anos | Formato: Delta Lake (ACID + Time Travel)

ZONE 3: ANALYTICS (Gold — dados prontos para consumo)
  /analytics/
    /daily_metrics/                    (KPIs diários agregados)
    /lawyer_performance/               (score de performance por advogado)
    /revenue_cohorts/                  (análise de coorte de receita)
    /churn_signals/                    (sinais de churn por organização)
  Retenção: 3 anos | Formato: Delta Lake | Sync: Redshift Spectrum

ZONE 4: ARCHIVE (Cold Storage)
  /archive/                            (dados retidos por obrigação legal)
  Retenção: 10 anos | Tier: S3 Glacier Deep Archive | Custo: mínimo
```

### 11.2 Delta Lake — Vantagens para Legis Connect

```
DELTA LAKE FEATURES CRÍTICOS PARA LEGALTECH:
  ACID Transactions:   Garante consistência em pipelines paralelos
  Time Travel:         SELECT * FROM legal_cases VERSION AS OF '2026-01-01'
  Schema Evolution:    Adicionar colunas sem reescrever histórico
  Data Lineage:        Integração nativa com Apache Atlas
  OPTIMIZE + Z-Order:  Queries 3-10x mais rápidas por partition pruning
  Change Data Feed:    Stream de alterações para Kafka downstream
```

---

## ETAPA 12 — ENTERPRISE DATA WAREHOUSE (AWS REDSHIFT)

### 12.1 Arquitetura Star Schema

```
FATO: fact_legal_cases
  case_id, date_key, org_key, lawyer_key, client_key, area_key,
  region_key, plan_key,
  total_cases_count, open_cases_count, closed_cases_count,
  avg_resolution_days, total_revenue_brl, risk_score_avg

FATO: fact_payments
  payment_id, date_key, org_key, lawyer_key, plan_key,
  amount_brl, stripe_fee_brl, net_amount_brl, payment_status,
  payment_method, currency

FATO: fact_ai_interactions
  session_id, date_key, org_key, user_key, model_key,
  tokens_in, tokens_out, cache_hit, latency_ms, cost_usd,
  csat_score, confidence_score

DIMENSÃO: dim_date
  date_key, full_date, day_of_week, week_number, month, quarter, year,
  is_weekend, is_holiday_br, fiscal_quarter

DIMENSÃO: dim_organization
  org_key, org_id, org_name, plan_name, state, region,
  oab_seccional, size_tier, created_at, is_active

DIMENSÃO: dim_lawyer
  lawyer_key, lawyer_id, oab_number, oab_uf, area_especialidade,
  years_experience, rating_avg, cases_total, state

DIMENSÃO: dim_area_direito
  area_key, area_name, area_category, tribunal_principal

DIMENSÃO: dim_region
  region_key, state, region_name, macro_region
```

### 12.2 Exemplos de Queries Analíticas

```sql
-- KPI: MRR por estado e plano (last 12 months)
SELECT
    d.state,
    p.plan_name,
    DATE_TRUNC('month', dt.full_date) AS month,
    SUM(f.net_amount_brl) AS mrr_brl,
    COUNT(DISTINCT f.org_key) AS paying_orgs
FROM fact_payments f
JOIN dim_date dt ON f.date_key = dt.date_key
JOIN dim_organization d ON f.org_key = d.org_key
WHERE dt.full_date >= DATEADD(month, -12, CURRENT_DATE)
  AND f.payment_status = 'succeeded'
GROUP BY 1, 2, 3
ORDER BY 3 DESC, 4 DESC;

-- KPI: Produtividade do advogado por especialidade
SELECT
    l.area_especialidade,
    AVG(c.avg_resolution_days) AS avg_resolution_days,
    AVG(c.risk_score_avg) AS avg_risk_score,
    SUM(c.total_revenue_brl) AS total_revenue,
    COUNT(DISTINCT c.lawyer_key) AS active_lawyers
FROM fact_legal_cases c
JOIN dim_lawyer l ON c.lawyer_key = l.lawyer_key
JOIN dim_date d ON c.date_key = d.date_key
WHERE d.year = 2026
GROUP BY 1
ORDER BY 5 DESC;
```

---

## ETAPA 13 — DATA LAKEHOUSE STRATEGY (APACHE ICEBERG)

### 13.1 Arquitetura Lakehouse

```
DATA LAKEHOUSE — CONVERGÊNCIA DATA LAKE + DATA WAREHOUSE:

PROBLEMA RESOLVIDO:
  Data Lake puro:      Flexível mas sem ACID, schema caótico, queries lentas
  Data Warehouse puro: ACID e rápido, mas rígido e caro para dados brutos
  Lakehouse:           Melhor dos dois mundos — ACID + schema + custo de object store

STACK LEGIS CONNECT LAKEHOUSE:
  Storage:   AWS S3 (custo de object store)
  Format:    Apache Iceberg (ACID + schema evolution + time travel)
  Engine:    Apache Spark (processamento) + Redshift Spectrum (queries SQL)
  Catalog:   AWS Glue Data Catalog (metadados Iceberg)
  BI:        Apache Superset → consulta diretamente via Redshift Spectrum

VANTAGENS ICEBERG vs. DELTA LAKE (decisão para gold zone):
  Hidden Partitioning: queries sem precisar conhecer a estrutura de partição
  Row-level deletes:   GDPR/LGPD compliance nativo (delete sem reescrita total)
  Concurrent writes:   Múltiplos jobs escrevendo simultaneamente sem conflito
  Snapshot isolation:  Time travel para auditoria e reprodutibilidade

COMANDO ICEBERG — LGPD RIGHT TO ERASURE:
  DELETE FROM gold.users_analytics
  WHERE user_pseudo_id = 'pseudo_abc123';
  -- Iceberg cria novo snapshot sem os dados — histórico auditável preservado
```

---

## ETAPA 14 — DATA PIPELINE ARCHITECTURE (AIRFLOW + DBT)

### 14.1 Stack de Pipeline de Dados

| Ferramenta | Papel | Justificativa |
|---|---|---|
| **Apache Airflow 2.8** | Orquestração de workflows | DAGs Python, retry logic, SLA alerts |
| **dbt Core** | Transformações SQL (ELT) | Modelos versionados, testes, docs automáticos |
| **Debezium** | CDC do PostgreSQL | Captura de mudanças em tempo real via Kafka |
| **Great Expectations** | Validação de qualidade | Contratos de dados entre sistemas |
| **Flyway** | Migrations de schema | Versionamento de DDL do PostgreSQL |

### 14.2 DAGs Airflow Principais

```python
# AIRFLOW DAG — Pipeline Diário Legal Cases Analytics
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-squad',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'email_on_failure': True,
    'email': ['data-alerts@legisconnect.com.br'],
    'sla': timedelta(hours=2),  # Alerta se pipeline demorar > 2h
}

with DAG(
    dag_id='legal_cases_daily_pipeline',
    default_args=default_args,
    schedule_interval='0 4 * * *',   # 04:00 BRT todo dia
    start_date=datetime(2026, 7, 1),
    catchup=False,
    tags=['legal', 'analytics', 'daily'],
) as dag:

    extract = PythonOperator(
        task_id='extract_postgres_to_s3_raw',
        python_callable=extract_postgres_to_s3,
        op_kwargs={
            'table': 'legal_cases',
            'incremental_key': 'updated_at',
            'destination': 's3://legis-data-lake-prod/raw/postgresql/legal_cases/'
        }
    )

    validate_raw = PythonOperator(
        task_id='validate_raw_great_expectations',
        python_callable=run_ge_suite,
        op_kwargs={'suite_name': 'legal_cases_raw_quality'}
    )

    transform_dbt = BashOperator(
        task_id='transform_dbt_legal_cases',
        bash_command='dbt run --models legal_cases+ --target prod'
    )

    test_dbt = BashOperator(
        task_id='test_dbt_legal_cases',
        bash_command='dbt test --models legal_cases+ --target prod'
    )

    load_redshift = PythonOperator(
        task_id='load_fact_legal_cases_redshift',
        python_callable=load_to_redshift,
        op_kwargs={'model': 'fact_legal_cases'}
    )

    # Dependências sequenciais
    extract >> validate_raw >> transform_dbt >> test_dbt >> load_redshift
```

### 14.3 Modelos dbt — Transformações

```sql
-- models/silver/legal_cases_clean.sql
-- Camada Silver: dados limpos e normalizados

{{ config(
    materialized='incremental',
    unique_key='case_id',
    on_schema_change='append_new_columns',
    partition_by={'field': 'created_date', 'data_type': 'date'},
    cluster_by=['org_id', 'area_direito']
) }}

WITH source AS (
    SELECT * FROM {{ source('postgresql', 'legal_cases') }}
    {% if is_incremental() %}
    WHERE updated_at > (SELECT MAX(updated_at) FROM {{ this }})
    {% endif %}
),
normalized AS (
    SELECT
        id AS case_id,
        org_id,
        client_id,
        lawyer_id,
        TRIM(UPPER(case_number_cnj)) AS case_number_cnj,
        LOWER(area_direito) AS area_direito,
        COALESCE(status, 'unknown') AS status,
        priority,
        CAST(risk_score AS DECIMAL(3,2)) AS risk_score,
        DATE(created_at) AS created_date,
        created_at,
        updated_at
    FROM source
    WHERE id IS NOT NULL
      AND org_id IS NOT NULL
)
SELECT * FROM normalized
```

---

## ETAPA 15 — REAL-TIME DATA ARCHITECTURE (KAFKA + FLINK)

### 15.1 Topologia de Streaming

```
REAL-TIME DATA ARCHITECTURE:

PRODUTORES DE EVENTOS:
  NestJS API       → eventos de negócio (caso criado, pagamento, match)
  Stripe           → webhooks de pagamento (payment.succeeded, etc.)
  DataJud          → movimentações processuais (webhook/polling)
  UI Frontend      → eventos de uso (click, page_view, feature_usage)

KAFKA TOPICS (schema versionado com Schema Registry Avro):
  legis.users.events          (criação, update, login, logout)
  legis.legal.case.events     (criação, atualização, fechamento de caso)
  legis.payments.events       (pagamentos, reembolsos, cancelamentos)
  legis.datajud.movements     (movimentações processuais em tempo real)
  legis.ai.interactions       (sessões de IA — sem conteúdo, apenas hashes)
  legis.alerts.deadline       (alertas de prazo P1/P2 gerados)
  legis.audit.trail           (operações críticas para SIEM)

KAFKA CONNECT SINKS:
  PostgreSQL Sink:  legis.*.events → legal_cases, users (OLTP)
  S3 Sink:         todos os tópicos → S3 Raw Zone (Parquet particionado)
  ElasticSearch:   legis.audit.trail → índice para alertas SIEM

APACHE FLINK — STREAMING JOBS:
  Job 1: Deadline Alert Engine
    Consome: legis.datajud.movements
    Processa: Calcula prazo (CPC Art. 219) a partir da movimentação
    Produz:   legis.alerts.deadline → Dashboard + Notificação

  Job 2: Real-Time Fraud Detection
    Consome: legis.payments.events
    Processa: Velocity check + padrão de comportamento
    Produz:   legis.alerts.fraud → equipe anti-fraude

  Job 3: AI Cost Tracker
    Consome: legis.ai.interactions
    Processa: Agrega custo por workspace_id em janela de 1h
    Produz:   legis.metrics.ai_costs → Budget Alert se > 80% do limite
```

---

## ETAPA 16 — OPERATIONAL ANALYTICS FRAMEWORK

### 16.1 KPIs Operacionais por Perfil

```
GESTÃO JURÍDICA (Advogado / Escritório):
  Demandas Ativas:       Total de casos em aberto por advogado/área
  Taxa de Resolução:     % casos encerrados / total por período
  Tempo Médio:           Dias médios de resolução por área jurídica
  Prazos Críticos:       Casos com prazo em < 7 dias (semáforo)
  Taxa de Êxito:         % casos favoráveis ao cliente (histórico)
  Produtividade IA:      % de tarefas com auxílio do Copilot
  NPS Parcial:           Satisfação dos clientes (tempo real)

OPERAÇÃO PLATAFORMA (CTO / Engenharia):
  Usuários Ativos:       MAU, WAU, DAU por perfil (advogado/cliente)
  Latência API P95:      Tempo de resposta por endpoint
  Uptime:                SLA 99.9% (Uptime Robot + PagerDuty)
  Erros 4xx/5xx:         Taxa de erros por serviço
  AI Token Usage:        Tokens consumidos/custo por workspace

FINANCEIRO (CFO / CEO):
  MRR:                   Receita Recorrente Mensal (total + por plano)
  ARR:                   Receita Anual Recorrente
  Churn Rate:            % cancelamentos mensais
  ARPU:                  Receita média por usuário ativo
  LTV / CAC:             Lifetime Value vs. Custo de Aquisição
  NRR:                   Net Revenue Retention (expansão - churn)
```

### 16.2 Superset Dashboard — Configuração

```yaml
# Apache Superset — Conexões e Dashboards
databases:
  - name: Legis Connect Redshift Analytics
    sqlalchemy_uri: "redshift+psycopg2://user:pass@cluster.redshift.amazonaws.com:5439/legisdb"
    expose_in_sqllab: true
    allow_csv_upload: false

dashboards:
  - name: "CEO — Growth & Revenue"
    slices:
      - "MRR por Mês (últimos 12 meses)"
      - "Churn Rate Mensal"
      - "Novos Clientes por Estado"
      - "ARPU por Plano"
      - "Forecast MRR 90 dias (Prophet)"

  - name: "CTO — Platform Performance"
    slices:
      - "API Latência P50/P95/P99"
      - "Error Rate por Serviço"
      - "Uptime por Componente"
      - "AI Token Usage por Workspace"
      - "Cache Hit Rate AI Gateway"

  - name: "Legal Product — Lawyer Analytics"
    slices:
      - "Casos por Área Jurídica (heat map)"
      - "Tempo Médio de Resolução"
      - "Taxa de Êxito por Estado"
      - "Adoção do Legis Copilot"
      - "NPS por Tipo de Serviço"
```

---

## ETAPA 17 — EXECUTIVE BI ARCHITECTURE

### 17.1 CEO Dashboard — Visão Estratégica

| Métrica | Fonte | Frequência | Visualização |
|---|---|---|---|
| **MRR / ARR** | fact_payments | Diária | Time series + YoY |
| **Churn Rate** | fact_subscriptions | Semanal | Funnel + coorte |
| **NPS Geral** | dim_reviews | Semanal | Gauge + trend |
| **MAU / WAU / DAU** | fact_user_events | Diária | Área empilhada |
| **Forecast 90d** | Modelo Prophet | Semanal | Linha + banda de confiança |
| **Market Penetration** | CRM + DataJud | Mensal | Mapa de calor por estado |

### 17.2 CISO Dashboard — Segurança e Compliance

| Métrica | Fonte | Alerta |
|---|---|---|
| **Tentativas de Login** | audit_trail | > 5 falhas/min → P1 |
| **Acessos Fora do Horário** | auth_logs | Acesso 00h-06h → notificação |
| **Solicitações LGPD DSR** | consent_requests | Volume anormal → P2 |
| **PII Detection Events** | AI audit logs | Pico > baseline × 3 → P2 |
| **Vulnerabilidades CVE** | Dependabot + Trivy | CRITICAL não patchado → P0 |
| **Prompts Bloqueados** | NeMo Guardrails | > 50/dia → investigação |

---

## ETAPA 18 — LEGAL ANALYTICS PLATFORM

### 18.1 Inteligência Jurídica Especializada

```
MÓDULO 1: MARKET LEGAL INTELLIGENCE
  Análise de tendências de demandas por área jurídica e estado
  Identificação de áreas em crescimento (trabalhista, tributário, família)
  Mapeamento de oportunidades por região geográfica
  Benchmark de taxa de êxito por especialidade (anonimizado, agregado)

MÓDULO 2: LAWYER PERFORMANCE ANALYTICS
  Score de Performance: (taxa_êxito × 0.4) + (nps_médio × 0.3) +
                        (tempo_resposta × 0.2) + (completude_perfil × 0.1)
  Ranking por área jurídica, estado e tribunal
  Identificação de advogados com potencial de upsell (perfil completo, alto NPS)
  Early Warning: advogados com queda de performance (churn risk)

MÓDULO 3: CASE ANALYTICS
  Distribuição de casos por área, estado, tribunal e fase processual
  Análise de duração: tempo por fase processual vs. benchmark nacional
  Identificação de tribunais com maior backlog (impacto nos prazos)
  Análise de documentação: tipos mais frequentes por área jurídica

MÓDULO 4: JURISPRUDENCE INTELLIGENCE
  Trending: temas jurídicos mais pesquisados no RAG (anonimizado)
  Knowledge Gap: áreas sem cobertura suficiente na base de conhecimento
  Citation Network: quais leis e decisões são mais citadas por área
  Alerta de Mudança Legislativa: nova lei aprovada afeta X casos ativos
```

---

## ETAPA 19 — AI DATA INFRASTRUCTURE BLUEPRINT

### 19.1 Infraestrutura de Dados para IA

```
DADOS DE TREINAMENTO E AVALIAÇÃO:
  Armazenamento: S3 curated zone (formato Parquet + Delta Lake)
  Versionamento: DVC (Data Version Control) para datasets de treino
  Linhagem:      Dataset → Experimento MLflow → Modelo registrado
  Qualidade:     Great Expectations suite "ai_training_data_quality"
  LGPD:          Todos os datasets anonimizados (PII substituída por hash)
  Acesso:        Bucket S3 separado por ambiente (dev/staging/prod)

FEATURE STORE (FEAST):
  Online Features (Redis < 50ms):
    lawyer_avg_rating_30d, lawyer_response_time_24h,
    case_deadline_days_remaining, user_engagement_7d_score
  Offline Features (Redshift — batch analytics):
    lawyer_win_rate_by_area_1y, client_case_outcome_history,
    org_churn_probability, case_complexity_score

EMBEDDING STORE (PGVECTOR):
  Tabela:         legal_knowledge_base (VECTOR(1536) HNSW)
  Namespace:      workspace_id = NULL (público) ou workspace_id (privado)
  Ingestão:       Apache Airflow (batch diário — jurisprudência)
  Atualização:    Event-driven (upload documento → embedding imediato)
  Cache:          Redis Semantic Cache TTL 24h (economia 35% tokens)

AI AUDIT DATA:
  Tabela:         ai_audit_log (imutável — sem UPDATE/DELETE)
  Campos:         session_id, user_id, prompt_hash, model, tokens, response_hash
  Acesso:         Somente leitura (exceto sistema de auditoria)
  Retenção:       7 anos (obrigação legal de auditoria)
  Export:         Airflow → S3 archive zone (Glacier após 2 anos)
```

---

## ETAPA 20 — SECURE DATA ARCHITECTURE

### 20.1 Controles de Segurança em Camadas

```
CRIPTOGRAFIA EM REPOUSO:
  PostgreSQL RDS:       AES-256 (RDS Encryption com KMS gerenciado)
  S3 Data Lake:         SSE-S3 (AES-256) por bucket
  Redis ElastiCache:    Encryption at rest habilitado
  Redshift:             AES-256 com cluster encryption

CRIPTOGRAFIA EM TRÂNSITO:
  Aplicação → RDS:      TLS 1.3 obrigatório (SSL mode=verify-full)
  Airflow → S3:         HTTPS forçado (Bucket Policy: aws:SecureTransport)
  Kafka:                TLS + SASL/SCRAM autenticação
  API → Frontend:       TLS 1.3 (HSTS preload)

CONTROLE DE ACESSO (RBAC + ABAC):
  PostgreSQL:           Row-Level Security por org_id/workspace_id
  Redshift:             Column-level security para dados PII
  S3:                   IAM Policies + Bucket Policies (deny public access)
  Airflow:              RBAC (Viewer/User/Op/Admin por squad)

MASCARAMENTO DE DADOS (Column Masking):
  Ambiente de Dev/Staging: PII mascarada automaticamente
  email:        joao.silva@... → j***.***a@...
  cpf (hash):   visível apenas para papel DPO
  phone:        +55 (11) 9****-**** (últimos 4 dígitos visíveis)

MONITORAMENTO:
  AWS CloudTrail:       Auditoria de todo acesso AWS (S3, RDS, Redshift, KMS)
  AWS GuardDuty:        Detecção de anomalias (acesso incomum ao banco)
  AWS Macie:            Descoberta automática de PII no S3
  Wazuh SIEM:           Correlação de eventos de segurança
  Alertas:              CloudWatch → SNS → PagerDuty (24x7)
```

### 20.2 Database Roles e Permissões PostgreSQL

```sql
-- Criação de roles com princípio do menor privilégio
CREATE ROLE app_api_service;     -- NestJS backend
CREATE ROLE airflow_etl;         -- Apache Airflow
CREATE ROLE redshift_reader;     -- Redshift Spectrum (somente leitura)
CREATE ROLE dpo_role;            -- DPO (acesso a dados SENSITIVE)
CREATE ROLE readonly_analyst;    -- Time de dados (sem PII)

-- app_api_service — CRUD apenas nas tabelas necessárias
GRANT SELECT, INSERT, UPDATE ON TABLE users, legal_cases, organizations TO app_api_service;
GRANT SELECT, INSERT ON TABLE audit_trail TO app_api_service;
REVOKE DELETE ON TABLE audit_trail FROM app_api_service;  -- Audit Trail imutável

-- airflow_etl — leitura para ETL
GRANT SELECT ON ALL TABLES IN SCHEMA public TO airflow_etl;

-- readonly_analyst — sem acesso a colunas PII
GRANT SELECT ON TABLE legal_cases TO readonly_analyst;
REVOKE SELECT (client_id, lawyer_id) ON TABLE legal_cases FROM readonly_analyst;

-- Rotação automática de senhas via HashiCorp Vault (TTL 24h)
```

---

## ETAPA 21 — LGPD DATA GOVERNANCE FRAMEWORK

### 21.1 Controles LGPD por Processo

| Direito do Titular | Processo | Prazo | Sistema |
|---|---|---|---|
| **Acesso** (Art. 18, I) | Portal DSR → NestJS API → exportação JSON | 15 dias | Self-service |
| **Correção** (Art. 18, III) | Formulário → API → audit trail | 15 dias | Self-service |
| **Eliminação** (Art. 18, VI) | DPO aprova → soft delete → purge schedule | 15 dias | DPO Dashboard |
| **Portabilidade** (Art. 18, V) | Exportação JSON/CSV de todos os dados | 15 dias | Self-service |
| **Revogação** (Art. 18, IX) | Toggle consent → pseudonimização imediata | Imediato | Self-service |
| **Informação** (Art. 18, II) | Aviso sobre compartilhamento com terceiros | 15 dias | Portal LGPD |

### 21.2 Consent Management Platform

```sql
-- Tabela de Consentimento LGPD
CREATE TABLE consent_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) NOT NULL,
    consent_type        VARCHAR(64) NOT NULL,  -- 'analytics','marketing','ai_training','cookies'
    legal_basis         VARCHAR(32) NOT NULL,  -- 'consent','contract','legitimate_interest'
    status              VARCHAR(16) DEFAULT 'granted' CHECK (status IN ('granted','revoked')),
    granted_at          TIMESTAMPTZ NOT NULL,
    revoked_at          TIMESTAMPTZ,
    ip_address          INET NOT NULL,         -- Evidência de consentimento livre
    user_agent          TEXT,
    privacy_policy_ver  VARCHAR(8) NOT NULL,
    purpose_description TEXT NOT NULL,         -- Finalidade específica (Art. 8º)
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Solicitações de Titulares (Data Subject Requests)
CREATE TABLE dsr_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) NOT NULL,
    request_type    VARCHAR(32) NOT NULL CHECK (request_type IN
                    ('access','correction','deletion','portability','revocation','information')),
    status          VARCHAR(16) DEFAULT 'pending',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    completed_by    UUID REFERENCES users(id),   -- DPO responsável
    response_data   JSONB,
    notes           TEXT
);
```

### 21.3 LGPD Right to Erasure — Pipeline Técnico

```
PROCESSO DE ELIMINAÇÃO (LGPD Art. 18, VI):

1. SOLICITAÇÃO: Usuário solicita eliminação via portal
2. VALIDAÇÃO: Sistema verifica obrigações legais de retenção
   - Dados financeiros: mantidos 5 anos (Lei 9.613/98)
   - Dados jurídicos: mantidos 7 anos (normas OAB)
   - Demais dados: eliminados em 30 dias
3. PSEUDONIMIZAÇÃO: PII substituída por tokens irreversíveis
   User.name_encrypted → {PSEUDONYM_abc123}
   User.email → {EMAIL_HASH_abc123}@deleted.legis
4. DATA LAKE: Iceberg DELETE → novo snapshot sem os dados
5. REDSHIFT: UPDATE com valores pseudonimizados nas dimensões
6. AI DATA: Embeddings privados do workspace → deletados permanentemente
7. AUDITORIA: Registro imutável no audit_trail (sem os dados, apenas o ID)
8. CERTIFICADO: Email de confirmação ao usuário com protocolo
```

---

## ETAPA 22 — DATA LIFECYCLE MANAGEMENT POLICY

### 22.1 Ciclo de Vida por Categoria de Dado

| Categoria | Criação | Uso Ativo | Arquivo | Eliminação | Base Legal |
|---|---|---|---|---|---|
| **Dados de Usuário (PII)** | Cadastro | Duração do contrato | 90 dias pós-cancelamento | 1 ano pós-cancelamento | LGPD Art. 15 |
| **Dados Jurídicos (Casos)** | Abertura do caso | Duração do caso | 7 anos após encerramento | 7 anos (normas OAB) | Res. CFE + OAB |
| **Dados Financeiros** | Transação | 5 anos | 5 anos | 5 anos após transação | Lei 9.613/98 |
| **Audit Trail** | Evento | 2 anos online | 5 anos S3 Standard | 7 anos total | Normas contábeis |
| **Dados de IA (hashes)** | Sessão IA | 2 anos | 5 anos S3 | 7 anos | Auditoria legal |
| **Logs de Acesso** | Evento | 90 dias | 1 ano S3 | 2 anos | SOC 2 + ISO 27001 |
| **Documentos Jurídicos** | Upload | Duração do caso | 7 anos | 7 anos (OAB) | Res. OAB 08/2024 |
| **Dados Analíticos** | Agregação | 3 anos Redshift | 5 anos S3 | 7 anos total | Negócio |

### 22.2 Automação do Ciclo de Vida

```
AIRFLOW DAG — data_lifecycle_management (schedule: 0 2 1 * * — 1º de cada mês):

  Task 1: identify_expired_records()
    → Busca registros com retention_expires_at <= NOW()
    → Agrupa por categoria de dado e base legal

  Task 2: archive_to_s3_glacier()
    → Move dados expirados do S3 Standard para Glacier Deep Archive
    → Mantém metadados (sem PII) para auditoria de existência

  Task 3: pseudonymize_user_pii()
    → Substitui PII de usuários com cancelamento > 1 ano por tokens
    → Preserva IDs internos para integridade referencial

  Task 4: purge_confirmed_deletions()
    → Executa deletions aprovadas por DPO (DSR requests completed)
    → Iceberg DELETE → novo snapshot auditável
    → Log de eliminação no audit_trail com hash do registro eliminado

  Task 5: generate_lifecycle_report()
    → Relatório mensal para CDO e DPO:
      - Registros arquivados: N
      - Registros pseudonimizados: N
      - Registros eliminados: N
      - Estimativa de custo de armazenamento
```

---

## ETAPA 23 — DATA LINEAGE FRAMEWORK (OPENLINEAGE + MARQUEZ)

### 23.1 Rastreabilidade End-to-End

```
DATA LINEAGE — FLUXO COMPLETO DE UM DADO:

[ORIGEM]
  Usuário preenche formulário de novo caso no frontend Legis Connect
  ↓
[INGESTÃO]
  NestJS API valida e persiste em: PostgreSQL legal_cases
  ↓ (Debezium CDC captura o INSERT)
  Kafka Topic: legis.legal.case.events (evento em JSON + schema Avro)
  ↓
[PROCESSAMENTO BATCH]
  Airflow DAG: legal_cases_daily_pipeline (04:00 BRT)
  → S3 Raw Zone: /raw/postgresql/legal_cases/year=2026/...parquet
  ↓ (Great Expectations validation)
  → S3 Curated Zone: /curated/legal_cases_clean/ (Delta Lake)
  ↓ (dbt transformation: fact_legal_cases)
  → Redshift: legis_analytics.fact_legal_cases
  ↓
[CONSUMO]
  Apache Superset: Dashboard "Gestão Jurídica" → Advogado vê KPIs
  MLflow: Dataset para treinamento do modelo Deadline Risk
  LiteLLM RAG: Embedding do documento do caso → pgvector HNSW
  NestJS API: Query de analytics para o painel do escritório

[OPENLINEAGE METADATA]:
  Cada etapa emite eventos OpenLineage para o Marquez:
  {
    "job": "airflow.legal_cases_daily_pipeline",
    "inputs": [{"namespace": "postgresql://legis-prod", "name": "legal_cases"}],
    "outputs": [{"namespace": "s3://legis-data-lake-prod", "name": "raw/legal_cases"}]
  }
```

### 23.2 Impacto de Mudança de Schema (Impact Analysis)

```
CENÁRIO: Mudança na tabela legal_cases (adicionar coluna tribunal_uf)

OpenLineage / Marquez identifica automaticamente todos os consumidores:
  IMPACTADOS:
    - Airflow DAG: legal_cases_daily_pipeline (Task: extract_postgres_to_s3_raw)
    - dbt Model: silver/legal_cases_clean.sql (precisa adicionar a coluna)
    - dbt Model: gold/fact_legal_cases.sql (nova dimensão disponível)
    - Redshift: legis_analytics.dim_region (enriquecimento possível)
    - Superset: Dashboard "Gestão Jurídica" (nova slice disponível)
  
  AÇÃO: Notificação automática aos Data Owners dos sistemas impactados
        antes de qualquer migration ser aplicada em produção.
```

---

## ETAPA 24 — DATA API ARCHITECTURE

### 24.1 Estratégia de Exposição de Dados

```
CAMADAS DE API DE DADOS:

CAMADA 1 — INTERNAL DATA API (NestJS)
  Uso: Consumo interno pelo frontend e microserviços
  Autenticação: JWT Bearer + OAuth 2.1 (PKCE para SPA)
  Rate Limiting: 1000 req/min por org_id
  Exemplos:
    GET  /api/v1/analytics/org/{id}/cases/summary
    GET  /api/v1/analytics/lawyer/{id}/performance
    POST /api/v1/reports/generate (relatório PDF assíncrono)

CAMADA 2 — PARTNER DATA API (REST + GraphQL)
  Uso: Escritórios com plano Enterprise (acesso a dados próprios)
  Autenticação: API Keys via HashiCorp Vault + mTLS
  Escopo: Apenas dados da própria organização (workspace isolation)
  Rate Limiting: 10.000 req/dia por workspace_id
  Exemplos:
    GET  /partner/v1/cases?status=open&area=trabalhista
    POST /partner/v1/webhooks (receber eventos em tempo real)
    GET  /partner/v1/analytics/monthly-summary

CAMADA 3 — AI DATA API (Interno — LiteLLM Gateway)
  Uso: RAG queries, embedding generation, analytics de IA
  Autenticação: Service-to-service com mTLS
  Escopo: Read-only legal_knowledge_base + workspace embeddings

DATA CONTRACTS (dbt Contracts):
  Cada modelo dbt exposto via API tem um contrato formal:
  - Schema versionado (v1, v2)
  - Breaking changes: deprecation period de 90 dias
  - Non-breaking changes: adição de campos sem quebra
  - SLA de disponibilidade: 99.9% para APIs críticas
```

### 24.2 GraphQL API — Dados Jurídicos

```graphql
type LegalCaseSummary {
  caseId:         ID!
  areaDir:        String!
  status:         CaseStatus!
  priority:       Priority!
  riskScore:      Float
  createdDate:    DateTime!
  daysOpen:       Int
  nextDeadline:   DateTime
  lawyerName:     String!
  clientInitials: String!  # Anonimizado — apenas iniciais
}

type Query {
  orgCasesSummary(
    orgId: ID!
    filters: CaseFilters
    pagination: Pagination
  ): CasesSummaryPage!

  lawyerPerformance(
    lawyerId: ID!
    period: DateRange!
  ): LawyerPerformanceMetrics!
}

# Cada resolver aplica Row-Level Security (org_id do JWT)
# Campos PII nunca expostos — apenas dados agregados e anonimizados
```

---

## ETAPA 25 — DATA MESH OPERATING MODEL

### 25.1 Domínios do Data Mesh

```
DATA MESH — LEGIS CONNECT OPERATING MODEL:

PRINCÍPIO 1: DOMAIN OWNERSHIP
  Cada domínio é dono dos seus dados como um produto
  Domínios independentes, autônomos, com SLAs próprios

PRINCÍPIO 2: DATA AS A PRODUCT
  Dados publicados com: esquema, qualidade, documentação, SLA
  Consumers confiam no produto — não dependem do pipeline do producer

PRINCÍPIO 3: SELF-SERVE DATA PLATFORM
  Plataforma centralizada de infraestrutura (CDO Office)
  Cada domínio consegue publicar e consumir dados de forma autônoma

PRINCÍPIO 4: FEDERATED GOVERNANCE
  Políticas globais (CDO + DPO) aplicadas automaticamente
  Implementação local por domínio (Data Steward)

DOMÍNIOS DO DATA MESH LEGIS CONNECT:

DOMAIN: LEGAL
  Produtos de dados: cases_performance, jurisprudence_trends, deadline_alerts
  Owner Squad: Legal Product
  Data Steward: @data-steward-legal
  SLA Qualidade: completude >= 99.5%, atualidade <= 4h
  Tech Stack: PostgreSQL → Airflow → S3 (Delta Lake) → Redshift

DOMAIN: FINANCIAL
  Produtos de dados: revenue_metrics, subscription_cohorts, payment_events
  Owner Squad: Finance
  Data Steward: @data-steward-finance
  SLA Qualidade: completude 100%, unicidade 100% (dados financeiros críticos)
  Tech Stack: PostgreSQL + Stripe → Kafka → S3 → Redshift

DOMAIN: IDENTITY & ACCESS
  Produtos de dados: user_activity, org_profiles, access_audit_events
  Owner Squad: Platform Engineering
  Data Steward: @data-steward-platform
  SLA Qualidade: completude >= 99.9%, latência streaming <= 5s
  Tech Stack: PostgreSQL → Debezium → Kafka → S3 → Redshift

DOMAIN: AI & KNOWLEDGE
  Produtos de dados: ai_usage_metrics, rag_quality_scores, model_performance
  Owner Squad: AI Squad
  Data Steward: @data-steward-ai
  SLA Qualidade: faithfulness >= 0.95, completude >= 99%
  Tech Stack: pgvector + Redis + S3 → MLflow → Superset

DOMAIN: OPERATIONS & ANALYTICS
  Produtos de dados: platform_health, feature_adoption, nps_trends
  Owner Squad: Product & Engineering
  Data Steward: @data-steward-ops
  SLA Qualidade: latência <= 24h, completude >= 98%
  Tech Stack: Kafka events → Flink → S3 → Redshift → Superset
```

---

## ETAPA 26 — BACKLOG DE ARQUITETURA DE DADOS

### DATA-001 — P0 EMERGENCIAL: Migração localStorage → PostgreSQL RDS
**Prioridade:** CRÍTICA | **Estimativa:** 3 semanas | **Complexidade:** Alta

Migrar todo o armazenamento de dados da plataforma de `localStorage` para PostgreSQL 16 RDS Multi-AZ. Criar schema inicial com migrations Flyway. Configurar Row-Level Security por `org_id`. Implementar backup automático (PITR 35 dias). Criptografia AES-256 em repouso.

**Critério de Aceite:** Zero dados armazenados no browser. Dados acessíveis em qualquer device do usuário.

---

### DATA-002 — P0 CRÍTICO: Criptografia e Proteção de PII (LGPD)
**Prioridade:** CRÍTICA | **Estimativa:** 2 semanas | **Complexidade:** Média

Criptografar colunas PII (nome, telefone) com AES-256-GCM usando AWS KMS. Implementar hashing de email para busca sem expor dados. Criar tabela `consent_records` para LGPD. Implementar pipeline de pseudonimização de dados de dev/staging.

---

### DATA-003 — P1: Data Lake S3 + Airflow ETL
**Prioridade:** ALTA | **Estimativa:** 6 semanas | **Complexidade:** Alta

S3 com 4 zonas (raw/curated/analytics/archive). Delta Lake para zonas silver e gold. Apache Airflow 2.8 com DAGs para todos os domínios. Great Expectations para qualidade de dados. Data Catalog Apache Atlas.

---

### DATA-004 — P1: Data Warehouse Redshift + Superset BI
**Prioridade:** ALTA | **Estimativa:** 6 semanas | **Complexidade:** Alta

AWS Redshift Cluster RA3. Star Schema com fatos e dimensões. dbt Core para transformações. Apache Superset com dashboards executivos (CEO/CTO/CPO/CISO). Acesso para todos os C-Levels.

---

### DATA-005 — P2: Kafka Streaming + Flink Real-Time
**Prioridade:** MÉDIA | **Estimativa:** 8 semanas | **Complexidade:** Muito Alta

Apache Kafka com Schema Registry (Avro). Debezium CDC do PostgreSQL. Apache Flink para Deadline Alert Engine e Fraud Detection. Kafka Connect Sinks para S3 e ElasticSearch.

---

### DATA-006 — P2: Master Data Management + Data Quality Avançada
**Prioridade:** MÉDIA | **Estimativa:** 6 semanas | **Complexidade:** Alta

Pipeline MDM para deduplicação de advogados (Jaro-Winkler + OAB API validation). Great Expectations suites por domínio. Data Quality Dashboard no Superset. Alertas automáticos ao Data Steward.

---

### DATA-007 — P3: Data Mesh + OpenLineage + Data API para Parceiros
**Prioridade:** MÉDIA | **Estimativa:** 10 semanas | **Complexidade:** Muito Alta

Formalização dos domínios do Data Mesh. OpenLineage + Marquez para lineage end-to-end. REST + GraphQL API de dados para parceiros enterprise. Data Contracts versionados com dbt. Impact Analysis automático em mudanças de schema.

---

## ETAPA 27 — ENTERPRISE DATA ARCHITECTURE & LEGAL INTELLIGENCE DATA PLATFORM BLUEPRINT

```
LEGIS CONNECT — DATA DRIVEN LEGAL INTELLIGENCE PLATFORM
Versão 1.0 | 27 Etapas Auditadas e Verificadas | Julho 2026

FONTES DE DADOS (DATA SOURCES)
  Aplicação SaaS (NestJS) · Stripe Payments · DataJud CNJ
  LLM APIs (Claude/Gemini) · OAB API · DOU/Planalto

DATA INGESTION LAYER
  Batch:      Apache Airflow 2.8 (DAGs por domínio — 04:00 BRT)
  Streaming:  Apache Kafka + Debezium CDC + Kafka Connect
  APIs:       Webhooks (Stripe, DataJud) + REST Pull (OAB, Planalto)

DATA STORAGE LAYER
  OLTP:       PostgreSQL 16 RDS Multi-AZ (fonte da verdade)
              Row-Level Security · AES-256 · PITR 35d
  Data Lake:  AWS S3 + Delta Lake + Apache Iceberg
              Bronze (raw 7a) · Silver (curated 5a) · Gold (analytics 3a)
  DW:         AWS Redshift RA3 (star schema · dbt · Spectrum)
  Cache:      Redis 7 ElastiCache (sessões · AI STM · rate limiting)
  Search:     ElasticSearch 8 (BM25 jurídico · logs · SIEM)
  Vector:     pgvector HNSW 0.7.4 (embeddings RAG 1536-dim)

DATA PROCESSING LAYER
  ETL/ELT:    Apache Airflow + dbt Core (transformações versionadas)
  Streaming:  Apache Flink (Deadline Alerts · Fraud Detection)
  Quality:    Great Expectations (contratos de qualidade por domínio)
  Catalog:    Apache Atlas + DataHub (metadados · lineage · classificação)
  MDM:        Pipeline deduplicação Advogado/Cliente/Escritório/Processo

ANALYTICS & INTELLIGENCE LAYER
  BI Executivo:      Apache Superset (CEO · CTO · CPO · CISO)
  Legal Analytics:   Market Intelligence · Lawyer Performance · Case Analytics
  Predictive:        MLflow + Feast Feature Store (churn · deadline · match)
  AI RAG:            pgvector + LiteLLM (Legal Intelligence Platform)
  NL Query:          Perguntas em português → SQL → Gráfico (Superset + LLM)

GOVERNANCE & COMPLIANCE LAYER
  Data Governance Office: CDO + Council + Domain Owners + Data Stewards
  LGPD: Consent Management · DSR Portal · Pseudonimização · Right to Erasure
  Data Classification: PUBLIC · INTERNAL · CONFIDENTIAL · SENSITIVE
  Data Lineage: OpenLineage + Marquez (rastreabilidade end-to-end)
  Data Security: RBAC · Column Masking · Row-Level Security · KMS
  Data Lifecycle: Airflow lifecycle DAG (archival · pseudonimização · purge)
  Data Mesh: 5 domínios autônomos com produtos de dados publicados

DATA MESH DOMAINS:
  LEGAL      → cases_performance, jurisprudence_trends, deadline_alerts
  FINANCIAL  → revenue_metrics, subscription_cohorts, payment_events
  IDENTITY   → user_activity, org_profiles, access_audit_events
  AI         → ai_usage_metrics, rag_quality_scores, model_performance
  OPERATIONS → platform_health, feature_adoption, nps_trends

MÉTRICAS DE SUCESSO:
  Maturidade Dados:  1.0 / 5.0 → 4.7 / 5.0 (+3.7)
  Prazo:             12 meses
  Data Quality SLA:  Completude >= 99.5% em todos os domínios
  Analytics SLA:     Dashboards atualizados <= 4h de delay
  LGPD DSR SLA:      Atendimento em <= 15 dias
  Streaming SLA:     Deadline Alerts <= 5 minutos após movimentação DataJud
  Custo Data Lake:   < R$ 2.000/mês (S3 + Glacier)

OBJETIVO FINAL:
LEGIS CONNECT — DATA DRIVEN LEGAL INTELLIGENCE PLATFORM
Arquitetura de dados enterprise que transforma dados jurídicos,
operacionais e financeiros em inteligência estratégica de próxima geração.
```

---

*Enterprise Data Architecture & Legal Intelligence Data Platform Blueprint v1.0*
*27 Etapas Auditadas, Verificadas e Documentadas*
*CDO · Enterprise Data Architect · Analytics Engineer · Data Governance Lead*
*Legis Connect · Julho 2026*
