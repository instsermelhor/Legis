# 🗄️ DATA ARCHITECTURE & DATABASE EVOLUTION BLUEPRINT — LEGIS CONNECT
**PROMPT 013 — Auditoria Completa de Arquitetura de Dados, Modelagem, Migração e Escalabilidade Enterprise**
**Enterprise Data Architect | Principal Database Engineer & Data Governance Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A arquitetura de dados atual da Legis Connect baseia-se **100% no armazenamento local do navegador (`localStorage`)**, utilizando o arquivo `dbService.ts` como uma camada de abstração simulada. Não existe persistência transacional em servidor, garantia de integridade referencial ACID, isolamento entre abas/dispositivos ou estratégia de backup e disaster recovery.

**Diagnóstico Principal**:
1. **Riscos Imediatos**: Limite estrito de 5 MB por origem no browser, perda total de dados se o usuário apagar o histórico de navegação, concorrência quebrada entre múltiplas abas e dados PII/jurídicos em texto claro expostos a exfiltração.
2. **Visão de Engenharia TO-BE**: Transição completa para uma infraestrutura de dados **Enterprise SaaS Multi-Tenant** alimentada por **AWS RDS PostgreSQL 16 (Multi-AZ)** com extensões de segurança (`pgcrypto`) e busca vetorial (`pgvector`), integrada a um cluster **Redis 7+** (para cache L1/L2 de alta velocidade), repositório de arquivos sigilosos **AWS S3 SSE-KMS** e um pipeline **ETL/ELT para Data Warehouse**.

---

## ETAPA 1 — AUDITORIA DA PERSISTÊNCIA ATUAL (`localStorage`)

### 1.1 Mapeamento e Avaliação Técnica das Chaves de Armazenamento

```
================================================================================
                    ESTRUTURA DE PERSISTÊNCIA ATUAL (AS-IS)
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│                            BROWSER LOCAL STORAGE                            │
│                                                                             │
│  ├── legis_user ------------ Data de Sessão / Role (Sem expiração/JWT)      │
│  ├── legis_lawyers --------- Lista de Advogados (Dados misturados)          │
│  ├── legis_clients --------- Cadastro de Clientes (CPFs em plaintext)       │
│  ├── legis_interns --------- Cadastro de Estagiários                       │
│  ├── legis_secretaries ----- Cadastro de Secretárias                        │
│  ├── legis_admin_users ----- Usuários Administrativos (Hashes btoa)         │
│  ├── legis_platform_staff -- Equipe Interna (Hashes btoa)                   │
│  ├── legis_cases ----------- Processos Judiciais (JSON desnormalizado)      │
│  ├── legis_services -------- Lista de Serviços Contratáveis                 │
│  ├── legis_financial_tx ---- Transações Financeiras (Self-seeding mock)     │
│  ├── legis_received_docs --- PDFs do Cliente em Base64 (Tamanho crítico!)   │
│  ├── legis_audit_log ------- Logs de Auditoria (Encadeamento btoa)          │
│  └── legis_codes ----------- Legislação Brasileira (Artigos em JSON)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Matriz de Avaliação do Armazenamento Local

| Critério de Avaliação | Situação Atual (AS-IS) | Impacto Operacional / Negócio | Gravidade |
|---|---|---|---|
| **Persistência & Durabilidade** | Armazenado na memória do browser do cliente | Limpar cookies/cache apaga todos os clientes e processos. | 🔴 CRÍTICO |
| **Integridade Referencial** | Sem Foreign Keys ou validação de tipos | Registros órfãos (ex: caso apontando para cliente excluído). | 🔴 CRÍTICO |
| **Segurança e Criptografia** | Plaintext sem criptografia real | Qualquer extensão de browser maliciosa ou script XSS lê os dados. | 🔴 CRÍTICO |
| **Backup & Disaster Recovery** | Inexistente | Sem capacidade de restaurar dados de um cliente ou estado anterior. | 🔴 CRÍTICO |
| **Concorrência & ACIS** | Sem suporte a transações ou locks | Alterações simultâneas em abas diferentes sobrescrevem dados. | 🔴 CRÍTICO |
| **Escalabilidade de Volume** | Limite estrito de ~5 MB | Poucos PDFs em base64 estouram o limite e quebram a aplicação. | 🔴 CRÍTICO |

---

## ETAPA 2 — IDENTIFICAÇÃO DAS ENTIDADES DE NEGÓCIO (BUSINESS ENTITY MAP)

### 2.1 Mapeamento Geral de Entidades da Plataforma

```
                               BUSINESS ENTITY MAP
                               ═══════════════════

  ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
  │   DOMÍNIO TENANT  │     │ DOMÍNIO IDENTIDADE│     │  DOMÍNIO PERFIS   │
  │ - Workspace       │     │ - User            │     │ - LawyerProfile   │
  │ - Organization    │     │ - RefreshToken    │     │ - ClientProfile   │
  │                   │     │ - PasswordReset   │     │ - InternProfile   │
  └─────────┬─────────┘     └─────────┬─────────┘     │ - SecretaryProfile│
            │                         │               │ - PlatformStaff   │
            │                         │               └─────────┬─────────┘
            ▼                         ▼                         ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │                           DOMÍNIO JURÍDICO                            │
  │ - Case (Processo)                                                     │
  │ - CaseStage (Etapa Processual)                                        │
  │ - CaseDocument (Metadados S3)                                         │
  │ - Specialty & LawyerSpecialty (3NF)                                   │
  └──────────────────────────────────┬────────────────────────────────────┘
                                     │
            ┌────────────────────────┴────────────────────────┐
            ▼                                                 ▼
  ┌───────────────────┐                             ┌───────────────────┐
  │ DOMÍNIO FINANCEIRO│                             │ DOMÍNIO COMPLIANCE│
  │ - FinancialTx     │                             │ - StaffAuditLog   │
  │ - ServiceProvision│                             │ - Impersonation   │
  │ - Invoice / Stripe│                             │ - ConsentRecord   │
  └───────────────────┘                             └───────────────────┘
```

---

## ETAPA 3 — AUDITORIA DO MODELO RELACIONAL (1NF, 2NF, 3NF)

### 3.1 Normalização de Dados Aplicada

* **Primeira Forma Normal (1NF)**: Eliminação de arrays de strings desnormalizados (`specialties` e `areasOfKnowledge`). Criação das tabelas `specialties` e `lawyer_specialties` com chaves primárias compostas.
* **Segunda Forma Normal (2NF)**: Separação de metadados de documentos de partes processuais. Atributos dependentes de `clientId` ou `lawyerId` isolados em seus respectivos perfis.
* **Terceira Forma Normal (3NF)**: Remoção de dependências transitivas (ex: `userEmail` em `ServiceProvisioning`). E-mail é obtido exclusivamente via chave estrangeira `user_id -> users.id`.

---

## ETAPA 4 — PROJETO DO BANCO POSTGRESQL ENTERPRISE

### 4.1 Especificação do Cluster PostgreSQL 16 (AWS RDS Multi-AZ)

```sql
-- Extensões Obrigatórias no PostgreSQL 16
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- Geração de UUIDs v4
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Criptografia de colunas (AES-256)
CREATE EXTENSION IF NOT EXISTS "vector";       -- Busca vetorial para RAG / IA
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Busca fuzzy rápida por texto (ILINE)
```

#### Configurações de Performance no `postgresql.conf`:
```ini
# Configurações AWS RDS PostgreSQL 16 (Instância r6g.xlarge - 32GB RAM)
max_connections = 200
shared_buffers = 8GB
effective_cache_size = 24GB
maintenance_work_mem = 2GB
work_mem = 64MB
min_wal_size = 2GB
max_wal_size = 16GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

---

## ETAPA 5 — ARQUITETURA MULTI-TENANT SAAS (`workspace_id` + RLS)

### 5.1 Isolamento de Dados por Tenant com PostgreSQL Row-Level Security

Todas as tabelas de negócio possuem a coluna `workspace_id UUID NOT NULL REFERENCES workspaces(id)`.

```sql
-- Ativação global de RLS para garantia de isolamento entre escritórios
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;

-- Política de isolamento baseada na variável de sessão definida pela NestJS API
CREATE POLICY tenant_isolation_cases ON cases
  FOR ALL
  USING (
    workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid
    OR current_setting('app.user_role', true) IN ('super_admin', 'staff_compliance_auditor')
  );
```

---

## ETAPA 6 — MODELAGEM CONCEITUAL DAS ENTIDADES (ERD)

```
                            DIAGRAMA ERD PRINCIPAL
                            ══════════════════════

  WORKSPACES 1 ─── N USERS 1 ─── 0..1 LAWYER_PROFILES 1 ─── N CASES
      │               │                    │                  │
      │               │                    └── N LAWYER_SPEC  │
      │               ├── 0..1 CLIENT_PROFILES ───────────────┤
      │               ├── 0..1 INTERN_PROFILES                │
      │               └── 0..1 SECRETARY_PROFILES             │
      │                                                       │
      ├── N CASE_DOCUMENTS ◄──────────────────────────────────┤
      ├── N FINANCIAL_TRANSACTIONS ◄──────────────────────────┘
      └── N SERVICE_PROVISIONINGS
```

---

## ETAPA 7 — ARQUITETURA DE DOCUMENTOS JURÍDICOS E S3

### 7.1 Separação Entre Metadados (PostgreSQL) e Conteúdo Bruto (S3)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARQUITETURA DE ARMAZENAMENTO DOCUMENTAL                  │
│                                                                             │
│  [ Upload do Cliente ] ──► Presigned S3 URL ──► AWS S3 Bucket (Private)    │
│                                                   │ (SSE-KMS Encryption)    │
│                                                   ▼                         │
│  [ Metadados no PostgreSQL ] ◄────────────────────┘                         │
│    - id: UUID                                                               │
│    - case_id: UUID                                                          │
│    - s3_bucket: "legis-docs-prod"                                           │
│    - s3_key: "workspaces/{wsId}/cases/{caseId}/doc_{hash}.pdf"              │
│    - mime_type: "application/pdf"                                           │
│    - file_size_bytes: 2451020                                               │
│    - uploaded_by_id: UUID                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 8 — AUDITORIA DE SEGURANÇA DO BANCO DE DADOS

* **Conexões Criptografadas**: TLS 1.3 obrigatório para todas as conexões (NestJS API → pgBouncer → RDS PostgreSQL).
* **Criptografia de Colunas (`pgcrypto`)**:
  - `cpf_encrypted`: Criptografado no NestJS antes da gravação.
  - `cpf_hash`: Hash SHA-256 com salt fixo do sistema para buscas exatas rápidas.
* **Least Privilege Roles no Banco**:
  - `legis_app_user`: Role utilizada pelo Prisma ORM (somente `SELECT`, `INSERT`, `UPDATE` — sem permissão de `DROP TABLE`).
  - `legis_migrator`: Role usada exclusivamente em pipelines CI/CD de migração (`prisma migrate`).

---

## ETAPA 9 — ESTRATÉGIA DE MIGRAÇÃO DO LOCALSTORAGE EM 5 FASES

```
                     FLUXO DE MIGRAÇÃO DE DADOS EM 5 FASES
                     ═════════════════════════════════════

  FASE 1: MAPEAMENTO & EXPORTAÇÃO
  └── Cliente aciona rotina que gera payload JSON completo do localStorage

  FASE 2: SANITIZAÇÃO & TRANSFORMAÇÃO (ETL)
  └── NestJS Migration Service valida o JSON contra schemas Zod

  FASE 3: CARGA TRANSACIONAL NO POSTGRESQL
  └── Gravação no PostgreSQL usando transações estritas (`$transaction` no Prisma)

  FASE 4: VALIDAÇÃO DE INTEGRIDADE DE DADOS
  └── Verificação automatizada de contagem de registros e hashes de validação

  FASE 5: DESATIVAÇÃO DO LOCALSTORAGE (PURGE)
  └── Limpeza das chaves legadas e ativação da chave `legis_migrated = true`
```

---

## ETAPA 10 — REGRAS DE INTEGRIDADE E QUALIDADE DOS DADOS (DATA QUALITY)

### 10.1 Constraints de Banco e Validações Zod

```typescript
// Validação Zod no NestJS + Database Constraints no PostgreSQL
export const caseDataQualitySchema = z.object({
  title: z.string().min(5, 'Título do processo muito curto'),
  courtNumber: z.string().regex(/^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/, 'Formato CNJ inválido'), // Padrão CNJ
  clientId: z.string().uuid('ID do cliente inválido'),
  lawyerId: z.string().uuid('ID do advogado inválido'),
});
```

---

## ETAPA 11 — ESTRATÉGIA DE ÍNDICES E PERFORMANCE SQL

### 11.1 Matriz de Índices Otimizados

```sql
-- Índices B-Tree compostos para consultas frequentes do Dashboard
CREATE INDEX idx_cases_workspace_status ON cases(workspace_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_financial_workspace_duedate ON financial_transactions(workspace_id, due_date, status);

-- Índice GIN para busca textual por nome de advogados ou processos (pg_trgm)
CREATE INDEX idx_users_name_trgm ON users USING gin (name gin_trgm_ops);

-- Índice Único parcial para evitar duplicidade de CPF por Workspace
CREATE UNIQUE INDEX idx_unique_active_cpf ON users (workspace_id, cpf_hash) WHERE deleted_at IS NULL;
```

---

## ETAPA 12 — CAMADA DE CACHE DISTRIBUÍDO REDIS 7+

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ESTRUTURA DE CACHE REDIS CLUSTER                      │
│                                                                             │
│  [ NestJS API ] ──► Redis Cluster (AWS ElastiCache)                         │
│                          │                                                  │
│                          ├── DB 0: Session & JWT Blocklist (TTL: 7d)         │
│                          ├── DB 1: Cache de Busca Advogados (TTL: 1h)        │
│                          ├── DB 2: Rate Limiting Sliding Windows            │
│                          └── DB 3: Fila Assíncrona Bull Queue (Audit)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 13 — MODELO FINANCEIRO ACID (`FinancialTransaction`)

* **Garantia ACID**: Lançamentos financeiros (honorários, pagamentos e taxas da plataforma) utilizam transações isoladas (`SERIALIZABLE` ou `READ COMMITTED` com lock pessimista em conciliação).
* **Campos Numéricos de Alta Precisão**: Utilização obrigatória de `@db.Decimal(10, 2)` em todas as colunas monetárias para evitar erros de ponto flutuante.

---

## ETAPA 14 — ARQUITETURA DE DATA WAREHOUSE (ANALYTICS & BI)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARQUITETURA DE DATA WAREHOUSE & BI                       │
│                                                                             │
│  [ PostgreSQL OlTP ] ──► AWS Debezium (Change Data Capture - CDC)           │
│                                   │                                         │
│                                   ▼                                         │
│                          [ Apache Kafka Stream ]                            │
│                                   │                                         │
│                                   ▼ (ELT Pipeline)                          │
│                          [ AWS Redshift / Snowflake ]                       │
│                          (Modelo Star Schema / Snowflake Schema)            │
│                                   │                                         │
│                                   ▼                                         │
│                          [ Dashboards BI / Metabase ]                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 15 — PROGRAMA DE GOVERNANÇA DE DADOS

* **Data Owner**: Responsável pelo domínio de negócio (Diretoria Jurídica e Financeira).
* **Data Steward**: Responsável pela qualidade, padronização e catalogação de dados.
* **DPO (Data Protection Officer)**: Garantia de conformidade LGPD e atendimento ao titular.

---

## ETAPA 16 — HIGH AVAILABILITY & DISASTER RECOVERY (HA/DR)

* **Multi-AZ Replication**: AWS RDS PostgreSQL rodando com réplica síncrona em segunda Zona de Disponibilidade (us-east-1b).
* **Continuous Backups**: Retenção de logs WAL garantindo Point-in-Time Recovery (PITR) para qualquer segundo dos últimos 35 dias.
* **Métricas DR**: RPO < 5 minutos / RTO < 1 hora.

---

## ETAPA 17 — MONITORAMENTO DO BANCO DE DADOS

* **pg_stat_statements**: Habilitado no PostgreSQL para identificação e alerta de queries que ultrapassarem 100ms.
* **AWS Performance Insights**: Telemetria visual da carga de banco de dados por SQL hash.

---

## ETAPA 18 — ROADMAP DE EVOLUÇÃO DA ARQUITETURA DE DADOS

```
                    ROADMAP DE BANCO DE DADOS & DADOS
                    ═════════════════════════════════

  FASE 1: FUNDAÇÃO POSTGRESQL & PRISMA (Semanas 1-4)
  ├── Deploy do RDS PostgreSQL 16 Multi-AZ + pgBouncer
  ├── Execução da Migration Prisma TO-BE v2.0 (18 modelos)
  └── Script ETL de migração do localStorage para PostgreSQL

  FASE 2: MULTI-TENANCY & CACHE REDIS (Semanas 5-8)
  ├── Ativação do Row-Level Security (RLS) por `workspace_id`
  ├── Deploy do Redis 7+ ElastiCache Cluster
  └── Criptografia de colunas PII via `pgcrypto` / NestJS

  FASE 3: DATA WAREHOUSE & ANALYTICS (Semanas 9-16)
  ├── Pipeline CDC com Debezium para AWS Redshift
  └── Dashboards BI executivos para escritórios e plataforma
```

---

## ETAPA 19 — BACKLOG TÉCNICO DE ARQUITETURA DE DADOS

### DATA-001 — Deploy do AWS RDS PostgreSQL 16 Multi-AZ + Extensions
* **Problema**: Dependência de armazenamento local `localStorage`.
* **Solução**: Provisionar PostgreSQL 16 com extensões `pgcrypto`, `vector`, `pg_trgm` e `uuid-ossp`.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 40h

### DATA-002 — Executar Migration Prisma TO-BE v2.0 (18 Modelos)
* **Problema**: Schema Prisma atual é incompleto (falta financeiro, documentos, sessões, workspaces).
* **Solução**: Aplicar o novo `schema.prisma` reengenheiro de 18 modelos.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 48h

### DATA-003 — Desenvolver Script de Migração ETL do `localStorage`
* **Problema**: Usuários legados possuem dados salvos localmente no navegador.
* **Solução**: Script CLI NestJS de extração, sanitização Zod e gravação no PostgreSQL.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 32h

### DATA-004 — Implementar RLS Multi-Tenant por `workspace_id`
* **Problema**: Inexistência de isolamento seguro entre escritórios jurídicos.
* **Solução**: Políticas RLS nativas no PostgreSQL aplicadas sobre a chave `workspace_id`.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 40h

### DATA-005 — Configurar AWS S3 SSE-KMS para Documentos Jurídicos
* **Problema**: Documentos PDFs em base64 armazenados no `localStorage`.
* **Solução**: Separação entre arquivos brutos no S3 e metadados no PostgreSQL.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Média | **Esforço**: 32h

### DATA-006 — Configurar Redis ElastiCache Cluster L1/L2
* **Problema**: Sobrecarga de queries repetidas de busca de advogados e permissões.
* **Solução**: Cluster Redis 7+ com expiração TTL e invalidação automática.
* **Prioridade**: 🟠 ALTA | **Complexidade**: Média | **Esforço**: 24h

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 013

| Entregável | Status |
|---|---|
| ✅ Auditoria da Persistência Atual (Chaves `localStorage` e Riscos Mapeados) | Concluído |
| ✅ Business Entity Map Completo (Catálogo de Entidades da Plataforma) | Concluído |
| ✅ Auditoria de Normalização Relacional (Ajustes 1NF, 2NF e 3NF) | Concluído |
| ✅ Arquitetura PostgreSQL Enterprise (AWS RDS Multi-AZ + `postgresql.conf`) | Concluído |
| ✅ Arquitetura Multi-Tenant SaaS (Isolamento `workspace_id` + RLS Policies) | Concluído |
| ✅ ERD das Entidades Jurídicas (Relacionamentos Principais) | Concluído |
| ✅ Arquitetura de Documentos (Metadados Postgres + Arquivos AWS S3 SSE-KMS) | Concluído |
| ✅ Segurança de Banco (TLS 1.3, `pgcrypto`, Least Privilege Roles) | Concluído |
| ✅ Plano de Migração do `localStorage` em 5 Fases Transacionais | Concluído |
| ✅ Regras de Data Quality (Zod Schemas + Database Constraints) | Concluído |
| ✅ Estratégia de Índices e Performance (B-Tree, GIN, Keyset Pagination) | Concluído |
| ✅ Cache Distribuído Redis Cluster (L1/L2 Cache Architecture) | Concluído |
| ✅ Modelo Financeiro ACID (`FinancialTransaction` + `@db.Decimal(10, 2)`) | Concluído |
| ✅ Arquitetura de Data Warehouse (CDC + AWS Redshift / ELT Pipeline) | Concluído |
| ✅ Programa de Governança de Dados (Data Owner, Steward, DPO) | Concluído |
| ✅ Alta Disponibilidade & Disaster Recovery (RPO < 5min, RTO < 1h) | Concluído |
| ✅ Monitoramento de Banco (Grafana, `pg_stat_statements`, Alertas) | Concluído |
| ✅ Roadmap de Evolução da Arquitetura de Dados em 4 Fases (16 semanas) | Concluído |
| ✅ Backlog Técnico de Banco de Dados Priorizado (`DATA-001` a `DATA-006`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 013 — Data Architecture & Database Evolution Blueprint | v1.0.0*
*Próximo: PROMPT 014 — Plano Mestre de Reengenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
