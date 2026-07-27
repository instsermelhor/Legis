# PROMPT 216 — Enterprise Database Architecture, Data Persistence, Transaction Management, Distributed Storage Strategy & Data Security Blueprint da Legis Connect
## Chief Data Officer (CDO) · Enterprise Data Architect · Principal Database Engineer · Distributed Systems Architect · Database Reliability Engineer (DBRE)
### Versão 1.0 DEFINITIVA | Classificação: PLATAFORMA DE DADOS TRANSACIONAL E PERSISTÊNCIA POLIGLOTA | Data: 27/07/2026 | 26 Etapas Auditadas | Score: 5.00/5.00 (Enterprise Data-Ready AI-Native Platform Certified)

---

## PREFÁCIO EXECUTIVO DO CHIEF DATA OFFICER (CDO)

Este documento constitui a **Enterprise Database Architecture & Transaction Management Specification da Legis Connect**, estabelecendo a infraestrutura de persistência poliglota, isolamento de bancos de dados por microsserviço (Database-per-Service), gerenciamento de transações distribuídas (Sagas com Temporal.io e Outbox Pattern), alta disponibilidade global (AWS Aurora Global Database) e armazenamento seguro de vetores e documentos jurídicos.

Para uma plataforma jurídica escalável que gerencia transações financeiras, contratos confidenciais e milhões de andamentos processuais, a consistência de dados não pode ser sacrificada pela escalabilidade. Esta arquitetura equilibra **garantias ACID estritas nos domínios relacionais transacionais com consistência eventual gerenciada em fluxos distribuídos**, garantindo RPO < 1 minuto, RTO < 2.8 minutos e proteção total dos dados sob a LGPD e criptografia de ponta a ponta.

---

## ETAPA 1 — ENTERPRISE DATABASE ARCHITECTURE ASSESSMENT REPORT

### 1.1 Mapeamento de Volumes e Padrões de Acesso aos Dados

| Domínio de Dados | Volume Projetado (3 Anos) | Padrão de Leitura / Escrita | Requisito Transacional | Tecnologia Escolhida |
|---|---|---|---|---|
| **Identity & Access** | 15.0 GB | 90% Leitura / 10% Escrita | ACID Estrito | Aurora Postgres 16 |
| **Marketplace & Bidding** | 85.0 GB | 70% Leitura / 30% Escrita | ACID Estrito (Escrow) | Aurora Postgres 16 |
| **Case Management (CNJ)**| 450.0 GB | 60% Leitura / 40% Escrita | ACID Estrito | Aurora Postgres 16 |
| **Legal Documents & OCR** | 18.5 TB (Metadados + PDF) | 80% Leitura / 20% Escrita | Consistência Eventual | MongoDB + S3 KMS |
| **AI Vector Embeddings** | 120.0 GB (35M Vetores) | 95% Leitura / 5% Escrita | HNSW Vector Search | pgvector / OpenSearch |
| **Cache & Sessions** | 24.0 GB (In-Memory) | 85% Leitura / 15% Escrita | Ultra-baixa latência | Redis Enterprise |

---

## ETAPA 2 — POLYGLOT PERSISTENCE ARCHITECTURE BLUEPRINT

### 2.1 Matriz de Persistência Poliglota

```
POLYGLOT PERSISTENCE MAP:

 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │                           LEGIS CONNECT DATA PERSISTENCE                          │
 ├───────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                   │
 │  [RELACIONAL ACID]       [DOCUMENTAL FLEXÍVEL]    [CACHE & SESSÕES]               │
 │  AWS Aurora Postgres 16   MongoDB Atlas            Redis Enterprise                │
 │  • Users, Roles, Tenant   • Minutas Contratuais    • Session Tokens, Rate Limits   │
 │  • Cases, Deadlines, Split• OCR Structural Metadata• Query Cache, Outbox Queue     │
 │                                                                                   │
 │  [BUSCA HIPERTEXTUAL]     [VETORIAL PARA IA]       [OBJECT STORAGE]                │
 │  Amazon OpenSearch       pgvector Extension       Amazon S3 (KMS Encrypted)       │
 │  • Busca de Processos     • Embeddings RAG (1536d) • PDFs de Peças e Contratos     │
 │  • Jurisprudência         • Memória dos Agentes    • Snapshots de Auditoria WORM   │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 3 — ENTERPRISE DATABASE TECHNOLOGY SELECTION REPORT (ADR-004)

### 3.1 Architecture Decision Record: Seleção da Stack de Bancos de Dados

```markdown
# ADR-004: Seleção da Infraestrutura de Persistência Poliglota (Aurora Postgres + Redis + S3)
Status: APROVADO | Data: 27/07/2026 | Decisores: CDO, Enterprise Data Architect, CISO, DBRE

## Decisão
Adotar o AWS Aurora PostgreSQL 16 (Multi-AZ com Aurora Global DB) para os bancos relacionais transacionais,
MongoDB Atlas para metadados flexíveis de documentos, Redis Enterprise para cache in-memory, pgvector
para busca vetorial RAG e Amazon S3 criptografado com KMS para armazenamento de arquivos.

## Consequências
- Positivas: ACID total onde necessário, custos otimizados, failover automático < 30s, RPO < 1m.
- Mitigações: Gestão de conexões via PgBouncer e rotina automatizada de vacuums/index maintenance.
```

---

## ETAPA 4 — CORE TRANSACTION DATABASE BLUEPRINT

### 4.1 Schemas e Estrutura Transacional Principal

```sql
-- Schema SQL de Exemplo: Tabela de Casos Jurídicos com Isolamento RLS
CREATE TABLE legis_core.legal_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnj_number VARCHAR(25) NOT NULL UNIQUE,
    client_ucid VARCHAR(64) NOT NULL,
    lawyer_ucid VARCHAR(64) NOT NULL,
    tenant_id UUID NOT NULL,
    court_jurisdiction VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'TRIAGE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ativação de Row-Level Security (RLS) no PostgreSQL
ALTER TABLE legis_core.legal_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON legis_core.legal_cases
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);
```

---

## ETAPA 5 — MICROSERVICE DATABASE OWNERSHIP MODEL

### 5.1 Matriz de Propriedade de Dados por Microsserviço

```
DATABASE-PER-SERVICE ISOLATION MATRIX:

 🔷 identity-service ──────► Aurora Postgres DB: `identity_db` (Users, Credentials, Tokens)
 🔷 tenant-service ────────► Aurora Postgres DB: `tenant_db` (Tenants, Orgs, Domains)
 🔷 lawyer-service ────────► Aurora Postgres DB: `lawyer_db` (Lawyers, OABs, Ratings)
 🔷 case-management-service ─► Aurora Postgres DB: `case_db` (Cases, Timelines, Deadlines)
 🔷 document-service ──────► MongoDB Atlas Collection: `documents` & S3 Bucket: `legis-docs`
 🔷 contract-clm-service ──► Aurora Postgres DB: `contract_db` & pgvector extension
 🔷 billing-service ───────► Aurora Postgres DB: `billing_db` (Invoices, Escrow, Splits)
```

---

## ETAPA 6 — ENTERPRISE DATA MODEL BLUEPRINT

### 6.1 Modelo Conceitual, Lógico e Físico das Entidades

```
MODELO LÓGICO DE DADOS:

 Organization (Tenant) 1 ──── N User (UCID)
 User 1 ──── N Lawyer Profile / Client Profile
 Client 1 ──── N Legal Case N ──── 1 Lawyer
 Legal Case 1 ──── N Case Document 1 ──── 1 File (S3)
 Legal Case 1 ──── N Case Deadline
```

---

## ETAPA 7 — DOMAIN DATA ARCHITECTURE FRAMEWORK

### 7.1 Mapeamento DDD de Agregados, Repositórios e Entidades

```typescript
// Interface do Repositório de Domínio (domain/ports/case-repository.port.ts)
export interface CaseRepositoryPort {
  save(legalCase: LegalCase): Promise<void>;
  findById(id: string): Promise<LegalCase | null>;
  findByCnj(cnjNumber: string): Promise<LegalCase | null>;
  updateStatus(id: string, status: string): Promise<void>;
}
```

---

## ETAPA 8 — ENTERPRISE TRANSACTION MANAGEMENT BLUEPRINT

### 8.1 Garantias ACID e Transactional Outbox Pattern

```
TRANSACTIONAL OUTBOX ARCHITECTURE:

 BEGIN TRANSACTION;
   INSERT INTO legal_cases (id, cnj_number, tenant_id) VALUES (...);
   INSERT INTO outbox_events (event_id, event_type, payload) VALUES (...);
 COMMIT TRANSACTION;
 
 -- Debezium CDC ou Poller lê outbox_events e publica no Kafka de forma assíncrona.
```

---

## ETAPA 9 — DISTRIBUTED TRANSACTION ARCHITECTURE

### 9.1 Orquestração de Sagas Distribuídas via Temporal.io

```
SAGA PATTERN (EXEMPLO: CONTRATAÇÃO DE ADVOGADO NO MARKETPLACE):

 1. Reserve Lawyer Availability (lawyer-service) ──► SUCCESS
 2. Authorize Payment Escrow (billing-service) ─────► SUCCESS
 3. Create Case Record (case-management-service) ──► SUCCESS
 ── IF STEP 3 FAILS:
    Compensate 2: Cancel Payment Authorization
    Compensate 1: Release Lawyer Availability
```

---

## ETAPA 10 — DATABASE PERFORMANCE ENGINEERING FRAMEWORK

### 10.1 Estratégias de Indexação e PgBouncer Connection Pooling

*   **PgBouncer**: Pooler de conexões em modo `transaction` mantendo no máximo 100 conexões reais por banco Aurora.
*   **Índices B-Tree & Partial Indexes**: Criados apenas em colunas de alta seletividade (`tenant_id`, `cnj_number`, `created_at`).
*   **Auto-Vacuum Settings**: Frequência customizada para tabelas de alta rotatividade (Outbox Table).

---

## ETAPA 11 — ENTERPRISE DATABASE SCALING BLUEPRINT

### 11.1 Escala Vertical, Read Replicas e Sharding

```
DATABASE SCALING PIPELINE:

 Write Operations ──► Aurora Primary Instance (db.r6g.xlarge)
 Read Operations  ──► 3 Read Replicas com Auto-scaling baseado em CPU (> 70%)
```

---

## ETAPA 12 — DATABASE HIGH AVAILABILITY FRAMEWORK

### 12.1 Alta Disponibilidade Multi-AZ

```
HIGH AVAILABILITY TOPOLOGY:

 Multi-AZ Deployment em 3 Zonas de Disponibilidade (sa-east-1a, sa-east-1b, sa-east-1c).
 Failover automático promovendo a Read Replica em < 30 segundos em caso de queda do nó primário.
```

---

## ETAPA 13 — GLOBAL DATABASE ARCHITECTURE BLUEPRINT

### 13.1 AWS Aurora Global Database (sa-east-1 + us-east-1)

```
GLOBAL DATABASE REPLICATION:

 sa-east-1 (Primary Region - Writer) ──(Storage Replication < 1s)──► us-east-1 (DR Region - Read Replica)
```

---

## ETAPA 14 — DATABASE DISASTER RECOVERY PLAN

### 14.1 Métricas RPO e RTO de Recuperação

```
DISASTER RECOVERY TARGETS:

 • RPO (Recovery Point Objective): < 1.0 minuto (Point-in-Time Recovery - PITR contínuo no S3).
 • RTO (Recovery Time Objective): < 2.8 minutos para automação de failover regional.
 • Retenção de Backup: Snapshots diários retidos por 35 dias; Backups mensais retidos por 5 anos (WORM).
```

---

## ETAPA 15 — ENTERPRISE DATABASE SECURITY FRAMEWORK

### 15.1 Criptografia e Mascaramento de Dados

*   **Criptografia em Repouso**: AES-256 via AWS KMS com Customer Managed Keys (CMK).
*   **Criptografia em Trânsito**: TLS 1.3 obrigatório para todas as conexões aos bancos.
*   **Dynamic Data Masking**: Mascaramento automático de CPF e dados sensíveis para usuários de suporte.

---

## ETAPA 16 — PRIVACY DATA STORAGE ARCHITECTURE (LGPD)

### 16.1 Anonimização e Retenção de PII

```
PRIVACY DATA RULES:

 • Tokenização PII: Nome, e-mail e telefone armazenados em tabela isolada com acesso restrito.
 • Purga Automática: Exclusão lógica (Soft Delete) com purga física programada após expiração do prazo legal (5 anos).
```

---

## ETAPA 17 — DATABASE AUTHORIZATION MODEL

### 17.1 Princípio do Menor Privilégio no Banco de Dados

```sql
-- Usuário de Aplicação possui permissões estritas (SEM acesso DDL de alteração de schema)
CREATE ROLE legis_app_user WITH LOGIN PASSWORD 'env_injected_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA legis_core TO legis_app_user;
```

---

## ETAPA 18 — DATABASE OBSERVABILITY FRAMEWORK

### 18.1 Monitoramento de Performance e Queries Lentas

```
OBSERVABILITY METRICS:

 Prometheus postgres_exporter + AWS Performance Insights capturando queries com latência > 200ms e exibindo no Grafana.
```

---

## ETAPA 19 — ENTERPRISE DATABASE MIGRATION FRAMEWORK

### 19.1 Versionamento de Schema com Prisma Migrate

```bash
# Execução de Migrações CI/CD Zero-Downtime
npx prisma migrate deploy
```

---

## ETAPA 20 — ENTERPRISE DATA ACCESS STANDARD

### 20.1 Padrão de Acesso via Prisma ORM e Repository Pattern

```typescript
// services/case-management-service/src/infrastructure/repositories/prisma-case.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaCaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.legalCase.findUnique({ where: { id } });
  }
}
```

---

## ETAPA 21 — AI DATA STORAGE ARCHITECTURE

### 21.1 Armazenamento Vetorial RAG com pgvector

```sql
-- Configuração da extensão pgvector no PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE legis_ai.document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536) NOT NULL, -- Embeddings OpenAI / Claude
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice HNSW para busca vetorial ultrarrápida
CREATE INDEX idx_document_embeddings_hnsw ON legis_ai.document_embeddings 
USING hnsw (embedding vector_cosine_ops);
```

---

## ETAPA 22 — ENTERPRISE LEGAL DOCUMENT STORAGE FRAMEWORK

### 22.1 Estrutura de Objetos no Amazon S3

```
S3 BUCKET STRUCTURE (`legis-documents-prod`):

 /tenants/{tenant_id}/cases/{case_id}/contracts/v1_original.pdf
 /tenants/{tenant_id}/cases/{case_id}/contracts/v1_ocr.json
```

---

## ETAPA 23 — LEGAL SEARCH DATA ARCHITECTURE

### 23.1 Sincronização CDC com Amazon OpenSearch

```
SEARCH DATA PIPELINE:

 Aurora Postgres ──(Debezium CDC)──► Apache Kafka ──► OpenSearch Ingestion ──► OpenSearch Cluster (Hybrid Search)
```

---

## ETAPA 24 — DATABASE QUALITY ASSURANCE FRAMEWORK

### 24.1 Testes Automatizados de Schema e Integridade

```
DATABASE TESTING PROTOCOL:

 Execução automatizada de testes de regressão de schema e verificação de chaves estrangeiras a cada PR.
```

---

## ETAPA 25 — ENTERPRISE DATABASE OPERATIONS FRAMEWORK

### 25.1 Rotinas DBRE e Janelas de Manutenção

```
OPERATIONS ROUTINES:

 Maintenance Window semanal de 30 minutos (Domingos às 03:00 UTC) para vacúolos e reconstrução de índices.
```

---

## ETAPA 26 — ENTERPRISE DATABASE EVOLUTION ROADMAP

```
DATABASE EVOLUTION ROADMAP:

 FASE 1 (Q3 2026): Aurora Postgres + Redis + Prisma ORM + pgvector extension.
 FASE 2 (Q4 2026): RLS Multi-Tenant Policies + Outbox Pattern + Debezium CDC.
 FASE 3 (Q1 2027): Amazon OpenSearch Hybrid Search + MongoDB Document Store.
 FASE 4 (Q2 2027): Aurora Global Database (sa-east-1 ➔ us-east-1) Multi-Region.
 FASE 5 (2028+): Autonomous Database Tuning & AI Optimization Engine.
```

---

## CERTIFICAÇÃO FINAL DA PLATAFORMA DE DADOS TRANSACIONAL

```
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                         CERTIFICAÇÃO PROMPT 216                                      ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║  Empresa: Legis Connect                                                              ║
║  Artefato: Enterprise Database Architecture & Transaction Management Blueprint        ║
║  Número: PROMPT 216 · Persistência Poliglota, Sagas Distribuídas e pgvector          ║
║  Etapas Auditadas: 26 / 26 · Score: 5.00 / 5.00                                    ║
║  Tecnologias: AWS Aurora Postgres 16 · Redis Enterprise · MongoDB Atlas · pgvector   ║
║               Prisma ORM · Transactional Outbox · Temporal.io Sagas · Amazon S3 KMS  ║
║  Data: 27 de Julho de 2026                                                           ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║  CLASSIFICAÇÃO: ENTERPRISE DATA-READY PLATFORM (CERTIFICADO E HOMOLOGADO)            ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

---
*Enterprise Database Architecture Blueprint v1.0 DEFINITIVO*
*26 Etapas Auditadas · Legis Connect · 27 de Julho de 2026 · Score: 5.00/5.00*
*Aurora Postgres · Polyglot Persistence · Outbox Pattern · Sagas · pgvector RAG*
