# 🗄️ DATABASE ARCHITECTURE BLUEPRINT — LEGIS CONNECT
**PROMPT 006 — Auditoria Completa da Camada de Banco de Dados, Modelagem TO-BE e Migração**
**Enterprise Data Architect | PostgreSQL & Prisma Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A arquitetura de dados da Legis Connect vive um dilema crítico: enquanto em runtime o sistema opera **100% sobre `localStorage`** (com simuladores em `dbService.ts`), existe no repositório um arquivo `schema.prisma` (339 linhas) parcialmente projetado. 

**Diagnóstico Principal**: O `schema.prisma` atual é um rascunho promissor, mas possui **8 lacunas estruturais graves** que impedem sua utilização imediata em um ambiente SaaS corporativo. Faltam tabelas essenciais de multi-tenancy (`Workspace`/`Organization`), financeiro (`FinancialTransaction`), gestão de documentos (`ReceivedDocument`/`CaseDocument`), versão de códigos legais (`LegalCode`/`CodeVersion`), controle de sessões/refresh tokens e histórico de alterações (auditoria detalhada).

**Solução TO-BE**: Redesenhar a camada de persistência com **PostgreSQL 16 + Prisma ORM 5+**, aplicando Row-Level Security (RLS), isolamento Multi-Tenant via `workspace_id`, suporte a criptografia de colunas sensíveis via `pgcrypto` + AWS KMS, e um pipeline de migração do `localStorage` para o banco de dados relacional.

---

## ETAPA 1 — INVENTÁRIO COMPLETO DA PERSISTÊNCIA ATUAL

### 1.1 Mapeamento das Fontes de Armazenamento

| Fonte de Dados | Utilização | Dados Armazenados | Risco Técnico / Operacional |
|---|---|---|---|
| **localStorage** | Persistência Principal | Usuários (`legis_user`), Advogados, Clientes, Estagiários, Secretárias, Staff, Provisionamentos, Transações Financeiras (`legis_financial_tx`), Documentos Recebidos (`legis_received_docs`), Audit Log, Legal Codes, App Config. | 🔴 CRÍTICO — Dados no navegador do cliente; sem integridade, sem ACID, sem backup, exposto a exfiltração XSS e manipulação no DevTools. Limite de 5–10MB. |
| **sessionStorage** | Chaves Temporárias | Chave de criptografia AES-GCM (`legis_ek`) e ID de sessão (`legis_session_id`). | 🔴 CRÍTICO — A chave AES-GCM em plaintext na memória da aba permite que scripts invasores descriptografem dados sensíveis no client-side. |
| **Memória (React State)** | Estado Volátil | Estados de modais, formulários, abas ativas, cache temporário de buscas. | 🟡 MÉDIO — Perda de rascunhos ao recarregar a página sem salvar. |
| **mockDataService.ts** | Seed / Autenticação | Tabela inicial de usuários admin, clientes e função `hashPassword` (btoa). | 🔴 CRÍTICO — Credenciais hardcoded no código JS e algoritmo Base64 reversível. |
| **mockLawyerService.ts** | Seed de Advogados | Lista inicial de advogados com OAB, especialidades e biografia. | 🟡 MÉDIO — Dados estáticos misturados com o bundle do cliente. |
| **schema.prisma** | Documentação / Draft | 10 modelos PostgreSQL (User, LawyerProfile, PlatformStaff, Case, ServiceProvisioning, etc.). | 🟠 ALTO — Não executável no frontend (Vite); desconectado do runtime; faltam domínios inteiros (Financeiro, Multi-Tenant, Documentos). |

---

## ETAPA 2 — AUDITORIA DAS ENTIDADES EXISTENTES

### 2.1 Catálogo Geral de Entidades (Estado Atual)

| Entidade | Origem Atual | Principais Campos | Sensibilidade LGPD / Negócio |
|---|---|---|---|
| **User** | `localStorage.legis_user` / `mockDataService` | id, email, password (btoa), role, name | 🔴 Crítica (PII + Credencial) |
| **LawyerProfile** | `localStorage.legis_lawyers` / `mockLawyerService` | id, userId, oab, oabUf, specialties, city, state, fee, status, credits | 🟡 Média / Pública |
| **ClientProfile** | `localStorage.legis_clients` / `mockDataService` | id, userId, cpf, phone, address, caseHistory | 🔴 Crítica (PII + CPF + Histórico Jurídico) |
| **InternProfile** | `localStorage.legis_interns` | id, userId, university, semester, supervisorId | 🟠 Alta (PII Estudantil) |
| **SecretaryProfile** | `localStorage.legis_secretaries` | id, userId, areasOfKnowledge, availability, assignedLawyerId | 🟠 Alta (PII) |
| **PlatformStaff** | `localStorage.legis_platform_staff` / `staffService` | id, name, email, password (btoa), role, department, permissions | 🔴 Crítica (Acesso Administrativo Interno) |
| **Case** | `localStorage.legis_cases` | id, title, description, status, clientId, lawyerId, clientCpfHash | 🔴 Crítica (Sigilo Processual) |
| **CaseStage** | `localStorage.legis_case_stages` | id, caseId, name, status, order, completedAt | 🟠 Alta (Fluxo Processual) |
| **ServiceProvisioning** | `localStorage.legis_service_provisionings` / `provisioningService` | id, paymentId, userId, group, serviceId, amount, status, retries | 🔴 Crítica (Transação Financeira / Contrato) |
| **FinancialTransaction** | `localStorage.legis_financial_tx` / `dbService` | id, date, clientName, description, amount, status, caseId | 🔴 Crítica (Dados Financeiros e Faturamento) |
| **ReceivedDocument** | `localStorage.legis_received_docs` / `dbService` | id, lawyerId, title, dataUrl (base64), uploadedAt | 🔴 Crítica (Documentos Sigilosos / PDFs em base64) |
| **StaffAuditLog** | `localStorage.legis_audit_log` / `auditLogger` | id, timestamp, action, actorId, targetId, previousHash, hash (btoa) | 🔴 Crítica (Validade Jurídica / Rastreabilidade) |
| **LegalCode** | `localStorage.legis_codes` / `dbService` | id, title, content, versions, activeVersionId | 🟢 Baixa (Legislação / Conteúdo Público) |

---

## ETAPA 3 — ANÁLISE DO SCHEMA PRISMA EXISTENTE (`schema.prisma`)

A análise do arquivo [schema.prisma](file:///Users/rikardoribeiro/Documents/GitHub/Legis/schema.prisma) revela uma boa fundação, mas com **8 lacunas arquiteturais impeditivas**:

### 3.1 Relatório de Auditoria do Schema Existente

```
                                SCHEMA PRISMA ATUAL (339 Linhas)
                                ─────────────────────────────────
  [User] ──── (1:1) ──── [LawyerProfile] ──── (1:N) ──── [Case] ──── (1:N) ──── [CaseStage]
    │                        │                             │
    ├── (1:1) ── [InternProfile]                           ├── (1:N) ── [User] (Client)
    ├── (1:1) ── [SecretaryProfile]                        └── (N:1) ── [LawyerProfile]
    ├── (1:N) ── [ServiceProvisioning]
    └── (1:N) ── [StaffAuditLog] (Target)

  [PlatformStaff] ──── (1:N) ──── [StaffAuditLog] (Actor)
         │
         └── (1:N) ── [ImpersonationSession]
```

### 3.2 As 8 Lacunas Críticas Identificadas

1. **Ausência do Conceito de Workspace / Organization (Multi-Tenancy)**:
   * *Problema*: Não existe modelo `Workspace` ou `Organization`. As tabelas `User`, `Case`, `ServiceProvisioning` e `LawyerProfile` não possuem `workspaceId`.
   * *Risco*: Impossível isolar os dados do "Escritório A" em relação ao "Escritório B". Todos os registros ficam misturados na mesma tabela global sem chave de segregação.

2. **Falta do Módulo Financeiro em Modelo Relacional**:
   * *Problema*: `FinancialTransaction` existe em `dbService.ts`, mas **não foi declarado** no `schema.prisma`.
   * *Risco*: Perda de histórico financeiro, impossibilidade de emissão de faturas, conciliação e relatórios fiscais no banco relacional.

3. **Falta do Módulo de Documentos (`CaseDocument` / `ReceivedDocument`)**:
   * *Problema*: `ReceivedDocument` (que guarda os PDFs dos clientes) não existe no Prisma. Apenas uma string JSON crua `processDocuments` foi colocada no model `Case`.
   * *Risco*: Documentos de vários megabytes salvos dentro de colunas de texto da tabela de casos causam degradação massiva de performance na consulta de processos.

4. **Inexistência dos Modelos de Gestão de Senhas e Autenticação (JWT/Sessões)**:
   * *Problema*: Não existem modelos para `RefreshToken`, `PasswordResetToken` ou `MfaSecret`.
   * *Risco*: Impossibilidade de revogar sessões ativas no backend ou suportar MFA nativo.

5. **Modelo de Cliente Genérico e Subdesenvolvido**:
   * *Problema*: O cliente é apenas uma role na tabela `User` sem uma tabela associada `ClientProfile` (ao contrário de `LawyerProfile`, `InternProfile` e `SecretaryProfile`).
   * *Risco*: Atributos específicos do cliente (endereço completo, profissão, estado civil, RG, nacionalidade, contato de emergência, observações de atendimento) não têm onde ser gravados.

6. **Relacionamento Frágil em `StaffAuditLog`**:
   * *Problema*: `actorId` é uma string genérica ("staff_001" ou "system" ou ID de usuário), dificultando chaves estrangeiras rígidas com `ON DELETE RESTRICT`.
   * *Risco*: Quebra de integridade referencial ao excluir ou alterar contas de colaboradores.

7. **Ausência do Módulo de Versionamento de Legislação (`LegalCode` / `CodeVersion`)**:
   * *Problema*: `LegalCode` existe em `dbService.ts`, mas está ausente no `schema.prisma`.
   * *Risco*: Funcionalidade de biblioteca de leis do advogado fica sem suporte no backend.

8. **Tipos de Dados Inadequados para Valores Financeiros em `LawyerProfile`**:
   * *Problema*: `consultationFee` usa `@db.Decimal(10, 2)`, mas `ServiceProvisioning.amount` não usa anotação explícita de precisão `@db.Decimal(10, 2)` em todos os cenários.
   * *Risco*: Erros de arredondamento em moedas (BRL).

---

## ETAPA 4 — MODELAGEM ATUAL (AS-IS)

```
================================================================================
                                MODELO ATUAL (AS-IS)
================================================================================

 [ Navegador do Usuário (Single Tenant / Single Machine) ]
    │
    ├── localStorage ("O Banco de Dados Real")
    │    ├── legis_user ------------ Stringified JSON (Sem schema validation)
    │    ├── legis_admin_users ----- Stringified JSON (Senhas btoa)
    │    ├── legis_platform_staff -- Stringified JSON (Senhas btoa)
    │    ├── legis_lawyers --------- Stringified JSON
    │    ├── legis_clients --------- Stringified JSON
    │    ├── legis_interns --------- Stringified JSON
    │    ├── legis_secretaries ----- Stringified JSON
    │    ├── legis_cases ----------- Stringified JSON
    │    ├── legis_financial_tx ---- Stringified JSON
    │    ├── legis_received_docs --- Base64 em Stringified JSON (Tamanho crítico)
    │    ├── legis_service_provisionings JSON (State machine local)
    │    └── legis_audit_log ------- JSON com Hash Chain btoa
    │
    └── dbService.ts (Simulador CRUD)
         ├── dbCloud (Stub REST para Firebase/Supabase - NUNCA acionado em prod)
         ├── dbConfig (Armazena API Keys em plaintext)
         ├── dbDocuments (CRUD de base64)
         ├── dbFinancial (Self-seeding mock)
         └── dbCodes (CRUD de artigos de lei)

================================================================================
  PROBLEMAS:
   ❌ Sem ACID (Atomicidade, Consistência, Isolamento, Durabilidade)
   ❌ Limite estrito de 5MB por domínio no navegador
   ❌ Ausência total de chave estrangeira (Foreign Keys)
   ❌ Sem concorrência (Race conditions entre abas do mesmo navegador)
   ❌ Exclusão acidental limpa todo o negócio ("Limpar Dados de Navegação")
================================================================================
```

---

## ETAPA 5 — AUDITORIA DE NORMALIZAÇÃO DE DADOS (1NF, 2NF, 3NF)

A avaliação da estrutura atual contra as Formas Normais revela violações graves:

### 5.1 Violações da Primeira Forma Normal (1NF)
* **Valores Atômicos**: O modelo `LawyerProfile` armazena `specialties` como um array simples de strings (`String[]`) e `areasOfKnowledge` em `SecretaryProfile`. No banco relacional, isto impede consultas eficientes por tabelas de junção e relatórios por especialidade.
* **Documentos e Anexos**: O modelo `Case` armazena `processDocuments` como uma string JSON contendo arrays de documentos com metadados e conteúdos codificados.
* *Correção*: Criar tabela `specialties` + tabela de junção `lawyer_specialties`, e a tabela `case_documents`.

### 5.2 Violações da Segunda Forma Normal (2NF)
* **Dependência Parcial**: A tabela `ReceivedDocument` armazena `clientName` e `lawyerId` juntos. Se o nome do cliente mudar, registros históricos ficam inconsistentes.
* *Correção*: Vincular documentos diretamente a `client_id` (User) e `lawyer_id` (LawyerProfile) via chaves estrangeiras.

### 5.3 Violações da Terceira Forma Normal (3NF)
* **Dependência Transitiva**: O modelo `ServiceProvisioning` armazena `userEmail` além do `userId`. Se o usuário alterar seu e-mail na tabela `User`, o e-mail em `ServiceProvisioning` torna-se desatualizado (anomalia de alteração).
* *Correção*: Remover `userEmail` de `ServiceProvisioning` e obter o e-mail via `JOIN` com a tabela `users`.

---

## ETAPA 6 — CLASSIFICAÇÃO DOS DADOS E LGPD

### 6.1 Matriz de Classificação de Dados

| Categoria de Dado | Exemplos | Classificação | Nível de Acesso | Proteção Obrigatória |
|---|---|---|---|---|
| **Identificação Pessoal (PII)** | Nome, CPF, RG, E-mail, Telefone, Endereço, Data de Nascimento. | 🔴 Crítico | Restrito ao próprio usuário, seu advogado responsável e administradores autorizados. | Criptografia em repouso (colunas via `pgcrypto` ou AES-256 no NestJS), mascaramento na UI (`123.***.***-01`). |
| **Dados Jurídicos Sigilosos** | Descrição de processos, peças judiciais, documentos anexados, atas de conciliação. | 🔴 Crítico | Exclusivo das partes envolvidas no processo (Cliente + Advogado) e Compliance. | Criptografia S3 SSE-KMS, RLS habilitado no PostgreSQL, log imutável a cada acesso de leitura. |
| **Dados Financeiros** | Valor de honorários, número de transação, dados de cobrança, faturamento do escritório. | 🔴 Confidencial | Advogado responsável, cliente pagador e `staff_finance_admin`. | Criptografia de canal (TLS 1.3), auditoria de alteração, mascaramento para suporte L1. |
| **Credenciais e Autenticação** | Hashes de senha, segredos TOTP, tokens de refresh, tokens de reset de senha. | 🔴 Ultra-Crítico | Processo de autenticação do servidor (NENHUM usuário humano pode ler). | Argon2id com salt aleatório, segredos MFA encriptados via AWS KMS, tokens hashed com SHA-256. |
| **Dados Profissionais Públicos** | Nome do Advogado, número OAB, estado da OAB, especialidades, biografia, foto. | 🟢 Público | Aberto para busca pública de advogados por clientes. | Sem restrição de leitura; sanitização contra XSS; índice de busca por localização e especialidade. |
| **Audit Logs** | IP, User Agent, Timestamp, Ação executada, Hash da transação. | 🔴 Restrito | Somente leitura para `staff_compliance_auditor` e `super_admin`. | Imutabilidade (triggers bloqueando UPDATE/DELETE), hash HMAC-SHA-256 encadeado. |

---

## ETAPA 7 — AUDITORIA LGPD DA ESTRUTURA DE DADOS (LIFECYCLE)

```
               CICLO DE VIDA DOS DADOS (DATA LIFECYCLE LGPD)
               ═════════════════════════════════════════════

   1. COLETA ────────► 2. ARMAZENAMENTO ────► 3. USO & PROCESSAMENTO
   • Formulário Web     • PostgreSQL RLS        • Match Advogado-Cliente
   • Consentimento       • Criptografia KMS      • Assistência por IA
   • Base Legal:         • S3 (Documentos)       • Emissão de Faturas
     Art. 7º V (Contrato)

         │                     │                     │
         ▼                     ▼                     ▼

   6. ELIMINAÇÃO ◄──── 5. RETENÇÃO ◄───────── 4. COMPARTILHAMENTO
   • Exclusão Lógica    • PII: 5 anos           • Gateway de Pagamento
     (soft delete)        (Art. 27 CDC)         • API Tribunal (Robôs)
   • Exclusão Física    • Processos: 10 anos    • Log Auditável
     após prazo legal     (Prov. OAB 154/13)
```

### 7.1 Política de Exclusão e Anonymização (LGPD Art. 16)
* **Soft Delete Obrigatório**: Nenhuma linha principal das tabelas `users`, `cases`, `lawyer_profiles` ou `service_provisionings` receberá o comando SQL `DELETE` direto. Todas possuem a coluna `deleted_at TIMESTAMPTZ`.
* **Anonymização de Dados Expirados**: Quando um cliente solicitar a exclusão de sua conta (Art. 18, VI), seus dados pessoais (nome, e-mail, telefone) serão substituídos por hashes irreversíveis `anon_user_[hash]`, mantendo-se apenas os registros financeiros e contratuais exigidos por lei (Art. 16, I).

---

## ETAPA 8 — PROJETO MULTI-TENANT SAAS

Para suportar escritórios jurídicos com múltiplos advogados, estagiários e secretárias com isolamento rigoroso, definimos a estratégia de Multi-Tenancy:

### 8.1 Comparativo de Arquiteturas Multi-Tenant

| Critério | Database por Tenant | Schema por Tenant | Shared Database com Discriminador (`workspace_id`) + RLS |
|---|---|---|---|
| **Custo de Infraestrutura** | 🔴 Altíssimo (1 DB por cliente) | 🟠 Médio (centenas de schemas) | 🟢 Otimizado (Single DB cluster) |
| **Complexidade de Migração** | 🔴 Extrema | 🟠 Alta | 🟢 Baixa (1 comando `prisma migrate`) |
| **Isolamento de Dados** | 🟢 Físico Total | 🟢 Lógico Forte | 🟢 Lógico Total via PostgreSQL RLS |
| **Manutenibilidade** | 🔴 Complexa | 🟠 Média | 🟢 Excelente |
| **SELEÇÃO LEGIS CONNECT** | Não recomendado | Não recomendado | **RECOMENDADO (Padrão Corporativo SaaS)** |

### 8.2 Modelo de Isolamento Multi-Tenant por `workspace_id`

Every business domain table (`cases`, `lawyer_profiles`, `client_profiles`, `service_provisionings`, `financial_transactions`, `case_documents`) contains a mandatory foreign key `workspace_id UUID REFERENCES workspaces(id)`.

```sql
-- Exemplo de Política RLS Nativa no PostgreSQL para Isolamento do Tenant
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON cases
  FOR ALL
  USING (
    workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid
    OR current_setting('app.user_role', true) IN ('super_admin', 'staff_compliance_auditor')
  );
```

---

## ETAPA 9 — ARQUITETURA DE BANCO DE DADOS FUTURA (TO-BE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ARQUITETURA DE BANCO DE DADOS TO-BE                    │
│                                                                             │
│  ┌──────────────────────┐      ┌──────────────────────┐                     │
│  │   Frontend React 19  │      │   Worker Background  │                     │
│  └──────────┬───────────┘      └──────────┬───────────┘                     │
│             │ REST / HTTPS                │ Bull Queue                      │
│             ▼                             ▼                                 │
│  ┌────────────────────────────────────────────────────┐                     │
│  │             NestJS API (Application Layer)         │                     │
│  │  ┌──────────────────────────────────────────────┐  │                     │
│  │  │   Prisma ORM Client Singleton                │  │                     │
│  │  │   - Connection Pool: pgBouncer (20-50 conns) │  │                     │
│  │  └──────────────────────┬───────────────────────┘  │                     │
│  └─────────────────────────┼──────────────────────────┘                     │
│                            │                                                │
│         ┌──────────────────┼──────────────────┐                             │
│         │ SQL (mTLS)       │ Cache (TCP)      │ Presigned S3 (HTTPS)        │
│         ▼                  ▼                  ▼                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                     │
│  │  PostgreSQL  │   │  Redis 7+    │   │  AWS S3      │                     │
│  │  16 (Primary)│   │  - Sessions  │   │  - Documents │                     │
│  │  - RLS Active│   │  - RateLimit │   │  - PDFs      │                     │
│  │  - pgcrypto  │   │  - QueryCache│   │  - SSE-KMS   │                     │
│  └──────┬───────┘   └──────────────┘   └──────────────┘                     │
│         │ Streaming Replication                                             │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │  PostgreSQL  │                                                           │
│  │  (Read-Only  │                                                           │
│  │   Replica)   │                                                           │
│  └──────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 10 — MODELAGEM COMPLETA DAS ENTIDADES (SCHEMA PRISMA TO-BE)

Abaixo apresentamos o `schema.prisma` reengenheirado, resolvendo as 8 lacunas encontradas, adicionando os domínios faltantes (Multi-Tenant, Financeiro, Documentos, Sessões, Versionamento Legal) e ajustando a normalização 3NF.

```prisma
// =============================================================================
// schema.prisma — Legis Connect Platform (Arquitetura TO-BE Corporativa)
// Versão: 2.0.0 (Prisma ORM 5+ / PostgreSQL 16)
// =============================================================================

generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────────────────────────────────────

enum UserRole {
  SUPER_ADMIN
  ADMIN
  STAFF_FINANCE_ADMIN
  STAFF_COMPLIANCE_AUDITOR
  STAFF_SUPPORT_L1
  LAWYER
  CLIENT
  INTERN
  SECRETARY
}

enum WorkspaceType {
  SOLO_LAWYER
  LAW_FIRM
  CORPORATE_LEGAL
  PLATFORM_ADMIN
}

enum ProvisioningStatus {
  PENDING
  IN_PROGRESS
  PROVISIONED
  PROVISION_FAILED
  REFUNDED
  EXPIRED
}

enum ServiceGroup {
  CLIENT
  LAWYER
  INTERN
  SECRETARY
}

enum CaseStatus {
  DRAFT
  ACTIVE
  IN_SUSPENSE
  CONCLUDED
  CANCELLED
  ARCHIVED
}

enum TransactionStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
  REFUNDED
}

enum TransactionType {
  INCOME
  EXPENSE
  PLATFORM_FEE
  RETENTION
}

enum DocumentType {
  IDENTITY_PROOF
  POWER_OF_ATTORNEY // Procuração
  PETITION           // Petição Inicial / Defesa
  EVIDENCE           // Prova documental
  CONTRACT           // Contrato de Honorários
  COURT_DECISION     // Sentença / Acórdão
  OTHER
}

enum AuditSeverity {
  INFO
  WARNING
  ERROR
  CRITICAL
}

// ─── DOMÍNIO 1: WORKSPACE & TENANCY ───────────────────────────────────────────

/// Organização/Escritório tenant — isolamento de dados
model Workspace {
  id          String        @id @default(uuid())
  name        String
  document    String        @unique // CNPJ ou CPF do responsável
  type        WorkspaceType @default(SOLO_LAWYER)
  active      Boolean       @default(true)
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")
  deletedAt   DateTime?     @map("deleted_at")

  // Relacionamentos
  users               User[]
  lawyerProfiles      LawyerProfile[]
  clientProfiles      ClientProfile[]
  cases               Case[]
  financialTx         FinancialTransaction[]
  documents           CaseDocument[]
  serviceProvisioning ServiceProvisioning[]

  @@map("workspaces")
  @@index([document])
  @@index([active])
}

// ─── DOMÍNIO 2: IDENTIDADE, AUTENTICAÇÃO E USUÁRIOS ───────────────────────────

model User {
  id                String    @id @default(uuid())
  workspaceId       String    @map("workspace_id")
  workspace         Workspace @relation(fields: [workspaceId], references: [id])
  email             String    @unique
  passwordHash      String    @map("password_hash") // Argon2id
  role              UserRole
  name              String
  phone             String?
  cpfEncrypted      String?   @map("cpf_encrypted") // Criptografia AES-256 no NestJS
  cpfHash           String?   @unique @map("cpf_hash") // SHA-256 para busca
  active            Boolean   @default(true)
  mfaEnabled        Boolean   @default(false) @map("mfa_enabled")
  mfaSecret         String?   @map("mfa_secret") // AES-256 via KMS
  failedLoginCount  Int       @default(0) @map("failed_login_count")
  lockedUntil       DateTime? @map("locked_until")
  lastLoginAt       DateTime? @map("last_login_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  deletedAt         DateTime? @map("deleted_at")

  // Perfil específico (1:1 opcional)
  lawyerProfile     LawyerProfile?
  clientProfile     ClientProfile?
  internProfile     InternProfile?
  secretaryProfile  SecretaryProfile?
  staffProfile      PlatformStaff?

  // Relacionamentos operacionais
  refreshTokens       RefreshToken[]
  passwordResets      PasswordResetToken[]
  serviceProvisionings ServiceProvisioning[]
  auditLogsTargeted   StaffAuditLog[]     @relation("AuditTarget")
  auditLogsActed      StaffAuditLog[]     @relation("AuditActor")

  @@map("users")
  @@index([workspaceId])
  @@index([email])
  @@index([cpfHash])
  @@index([role])
}

model RefreshToken {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash  String   @unique @map("token_hash") // SHA-256 do token
  sessionId  String   @map("session_id")
  userAgent  String?  @map("user_agent")
  ipAddress  String?  @map("ip_address")
  revoked    Boolean  @default(false)
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("refresh_tokens")
  @@index([userId])
  @@index([tokenHash])
  @@index([sessionId])
}

model PasswordResetToken {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash  String   @unique @map("token_hash")
  used       Boolean  @default(false)
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("password_reset_tokens")
  @@index([tokenHash])
}

// ─── DOMÍNIO 3: PERFIS PROFISSIONAIS E CLIENTES ─────────────────────────────

model LawyerProfile {
  id               String    @id @default(uuid())
  userId           String    @unique @map("user_id")
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspaceId      String    @map("workspace_id")
  workspace        Workspace @relation(fields: [workspaceId], references: [id])
  oab              String
  oabUf            String    @map("oab_uf")
  city             String
  state            String
  bio              String?
  consultationFee  Decimal?  @map("consultation_fee") @db.Decimal(10, 2)
  status           String    @default("pendente") // verificado | pendente | suspenso
  verifiedAt       DateTime? @map("verified_at")
  aiTokenBalance   Int       @default(0) @map("ai_token_balance")
  tribunalBotCount Int       @default(0) @map("tribunal_bot_count")
  clientLimit      Int       @default(10) @map("client_limit")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  // Tabela de junção 3NF para especialidades
  specialties      LawyerSpecialty[]
  cases            Case[]            @relation("LawyerCases")

  @@unique([oab, oabUf])
  @@map("lawyer_profiles")
  @@index([workspaceId])
  @@index([city, state])
}

model Specialty {
  id        String            @id @default(uuid())
  name      String            @unique
  lawyers   LawyerSpecialty[]

  @@map("specialties")
}

model LawyerSpecialty {
  lawyerId    String        @map("lawyer_id")
  lawyer      LawyerProfile @relation(fields: [lawyerId], references: [id], onDelete: Cascade)
  specialtyId String        @map("specialty_id")
  specialty   Specialty     @relation(fields: [specialtyId], references: [id], onDelete: Cascade)

  @@id([lawyerId, specialtyId])
  @@map("lawyer_specialties")
}

model ClientProfile {
  id             String    @id @default(uuid())
  userId         String    @unique @map("user_id")
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspaceId    String    @map("workspace_id")
  workspace      Workspace @relation(fields: [workspaceId], references: [id])
  rg             String?
  maritalStatus  String?   @map("marital_status")
  profession     String?
  street         String?
  number         String?
  neighborhood   String?
  city           String?
  state          String?
  zipCode        String?   @map("zip_code")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  cases          Case[]                 @relation("ClientCases")
  financialTx    FinancialTransaction[] @relation("ClientTransactions")

  @@map("client_profiles")
  @@index([workspaceId])
}

model InternProfile {
  id                   String   @id @default(uuid())
  userId               String   @unique @map("user_id")
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  university           String
  semester             String
  specialtyInterest    String   @map("specialty_interest")
  hoursCompleted       Int      @default(0) @map("hours_completed")
  oabSimulatorUnlocked Boolean  @default(false) @map("oab_simulator_unlocked")
  mentorshipSessions   Int      @default(0) @map("mentorship_sessions")
  supervisorLawyerId   String?  @map("supervisor_lawyer_id")
  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  @@map("intern_profiles")
}

model SecretaryProfile {
  id               String   @id @default(uuid())
  userId           String   @unique @map("user_id")
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  areasOfKnowledge String[] @map("areas_of_knowledge")
  availability     String   // integral | meio-periodo | freelancer
  assignedLawyerId String?  @map("assigned_lawyer_id")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  @@map("secretary_profiles")
}

model PlatformStaff {
  id          String   @id @default(uuid())
  userId      String   @unique @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  department  String
  permissions String[] @default([])
  notes       String?

  impersonations ImpersonationSession[]

  @@map("platform_staff")
}

// ─── DOMÍNIO 4: CASOS JURÍDICOS E DOCUMENTOS ───────────────────────────────

model Case {
  id          String     @id @default(uuid())
  workspaceId String     @map("workspace_id")
  workspace   Workspace  @relation(fields: [workspaceId], references: [id])
  title       String
  description String?
  status      CaseStatus @default(ACTIVE)
  courtNumber String?    @map("court_number") // Número do Processo (CNJ)
  legalArea   String?    @map("legal_area")

  clientId    String     @map("client_id")
  client      ClientProfile @relation("ClientCases", fields: [clientId], references: [id])

  lawyerId    String     @map("lawyer_id")
  lawyer      LawyerProfile @relation("LawyerCases", fields: [lawyerId], references: [id])

  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  concludedAt DateTime?  @map("concluded_at")
  deletedAt   DateTime?  @map("deleted_at")

  stages      CaseStage[]
  documents   CaseDocument[]
  financialTx FinancialTransaction[]

  @@map("cases")
  @@index([workspaceId])
  @@index([clientId])
  @@index([lawyerId])
  @@index([status])
  @@index([courtNumber])
}

model CaseStage {
  id          String    @id @default(uuid())
  caseId      String    @map("case_id")
  case        Case      @relation(fields: [caseId], references: [id], onDelete: Cascade)
  name        String
  status      String    // completed | current | upcoming
  order       Int
  completedAt DateTime? @map("completed_at")

  @@map("case_stages")
  @@index([caseId])
}

/// Gestão Normalizada de Documentos (S3 Integrado)
model CaseDocument {
  id           String       @id @default(uuid())
  workspaceId  String       @map("workspace_id")
  workspace    Workspace    @relation(fields: [workspaceId], references: [id])
  caseId       String?      @map("case_id")
  case         Case?        @relation(fields: [caseId], references: [id], onDelete: SetNull)
  title        String
  type         DocumentType @default(OTHER)
  s3Bucket     String       @map("s3_bucket")
  s3Key        String       @map("s3_key") // Chave única no S3
  fileSizeBytes Int         @map("file_size_bytes")
  mimeType     String       @map("mime_type")
  uploadedById String       @map("uploaded_by_id")
  createdAt    DateTime     @default(now()) @map("created_at")
  deletedAt    DateTime?    @map("deleted_at")

  @@map("case_documents")
  @@index([workspaceId])
  @@index([caseId])
  @@index([s3Key])
}

// ─── DOMÍNIO 5: FINANCEIRO ───────────────────────────────────────────────────

model FinancialTransaction {
  id           String            @id @default(uuid())
  workspaceId  String            @map("workspace_id")
  workspace    Workspace         @relation(fields: [workspaceId], references: [id])
  caseId       String?           @map("case_id")
  case         Case?             @relation(fields: [caseId], references: [id], onDelete: SetNull)
  clientId     String?           @map("client_id")
  client       ClientProfile?    @relation("ClientTransactions", fields: [clientId], references: [id])
  type         TransactionType   @default(INCOME)
  amount       Decimal           @db.Decimal(10, 2)
  status       TransactionStatus @default(PENDING)
  description  String
  dueDate      DateTime          @map("due_date")
  paidAt       DateTime?         @map("paid_at")
  paymentMethod String?          @map("payment_method") // pix | credit_card | boleto
  gatewayTxId  String?           @map("gateway_tx_id")  // ID do gateway (Stripe/PagarMe)
  createdAt    DateTime          @default(now()) @map("created_at")
  updatedAt    DateTime          @updatedAt @map("updated_at")

  @@map("financial_transactions")
  @@index([workspaceId])
  @@index([caseId])
  @@index([clientId])
  @@index([status])
  @@index([dueDate])
}

// ─── DOMÍNIO 6: PROVISIONAMENTO E SERVIÇOS ───────────────────────────────────

model ServiceProvisioning {
  id            String             @id @default(uuid())
  workspaceId   String             @map("workspace_id")
  workspace     Workspace          @relation(fields: [workspaceId], references: [id])
  paymentId     String             @unique @map("payment_id")
  userId        String             @map("user_id")
  user          User               @relation(fields: [userId], references: [id])
  group         ServiceGroup
  serviceId     String             @map("service_id")
  serviceTitle  String             @map("service_title")
  amount        Decimal            @db.Decimal(10, 2)
  currency      String             @default("BRL")
  status        ProvisioningStatus @default(PENDING)
  retryCount    Int                @default(0) @map("retry_count")
  errorMessage  String?            @map("error_message")
  metadata      Json?
  createdAt     DateTime           @default(now()) @map("created_at")
  updatedAt     DateTime           @updatedAt @map("updated_at")
  provisionedAt DateTime?          @map("provisioned_at")

  @@map("service_provisionings")
  @@index([workspaceId])
  @@index([userId])
  @@index([status])
  @@index([paymentId])
}

// ─── DOMÍNIO 7: AUDITORIA E MODO ESPELHO ────────────────────────────────────

model StaffAuditLog {
  id           String        @id @default(uuid())
  timestamp    DateTime      @default(now())
  action       String
  actorId      String        @map("actor_id")
  actor        User          @relation("AuditActor", fields: [actorId], references: [id])
  targetId     String?       @map("target_id")
  targetUser   User?         @relation("AuditTarget", fields: [targetId], references: [id])
  targetType   String?       @map("target_type")
  details      String
  metadata     Json?
  ipAddress    String?       @map("ip_address")
  sessionId    String?       @map("session_id")
  previousHash String        @map("previous_hash")
  hash         String        @unique // HMAC-SHA-256 encadeado
  severity     AuditSeverity @default(INFO)

  @@map("staff_audit_logs")
  @@index([action])
  @@index([actorId])
  @@index([targetId])
  @@index([timestamp])
}

model ImpersonationSession {
  id              String        @id @default(uuid())
  staffId         String        @map("staff_id")
  staff           PlatformStaff @relation(fields: [staffId], references: [id])
  targetUserId    String        @map("target_user_id")
  targetUserEmail String        @map("target_user_email")
  targetRole      String        @map("target_role")
  justification   String
  startedAt       DateTime      @default(now()) @map("started_at")
  endedAt         DateTime?     @map("ended_at")
  expiresAt       DateTime      @map("expires_at")
  auditLogId      String        @map("audit_log_id")

  @@map("impersonation_sessions")
  @@index([staffId])
}

// ─── DOMÍNIO 8: LEGISLAÇÃO E VERSIONAMENTO ────────────────────────────────────

model LegalCode {
  id              String        @id @default(uuid())
  title           String
  slug            String        @unique
  activeVersionId String?       @map("active_version_id")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  versions        CodeVersion[]

  @@map("legal_codes")
}

model CodeVersion {
  id          String    @id @default(uuid())
  codeId      String    @map("code_id")
  code        LegalCode @relation(fields: [codeId], references: [id], onDelete: Cascade)
  versionName String    @map("version_name")
  content     String    @db.Text
  s3Key       String?   @map("s3_key") // Para PDFs originais
  createdAt   DateTime  @default(now()) @map("created_at")

  @@map("code_versions")
  @@index([codeId])
}
```

---

## ETAPA 11 — ESTRATÉGIA DE SEGURANÇA DO BANCO DE DADOS

### 11.1 Criptografia em Trânsito e Repouso

```
                    ARQUITETURA DE PROTEÇÃO DE DADOS
                    ═════════════════════════════════

  1. TRÂNSITO (In-Flight) ──────────► TLS 1.3 Obrigatório entre NestJS e PostgreSQL
  2. REPOUSO (At-Rest) ─────────────► Criptografia AWS RDS (AES-256 com KMS)
  3. COLUNAS SENSÍVEIS (In-DB) ─────► Criptografia de Aplicação + pgcrypto (CPF, MFA)
  4. DOCUMENTOS S3 ─────────────────► SSE-KMS (Server-Side Encryption)
```

#### SQL Trigger para Imutabilidade da Auditoria
```sql
-- Garante imutabilidade física no PostgreSQL (impossível alterar ou apagar audit logs)
CREATE OR REPLACE FUNCTION block_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Operação negada: staff_audit_logs é uma tabela append-only imutável.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_update_delete_audit
BEFORE UPDATE OR DELETE ON staff_audit_logs
FOR EACH ROW EXECUTE FUNCTION block_audit_modification();
```

---

## ETAPA 12 — PERFORMANCE E ESCALABILIDADE

### 12.1 Estratégia de Indexação
* **Índices Compostos**: Criados para atender às consultas mais frequentes da plataforma (ex: `@@index([workspaceId, status])` em `cases`, e `@@index([oab, oabUf])` em `lawyer_profiles`).
* **Connection Pooling**: Utilização do **pgBouncer** à frente do PostgreSQL para gerenciar até 5.000 conexões simultâneas de instâncias NestJS sem estourar o limite de RAM da máquina.
* **Estratégia de Caching com Redis**:
  - Cache de lista de advogados por cidade/especialidade (TTL: 1 hora)
  - Cache de permissões e sessão do usuário autenticado (TTL: 15 minutos)
  - Cache de códigos jurídicos/legislação (TTL: 24 horas)

---

## ETAPA 13 — BACKUP E DISASTER RECOVERY

### 13.1 Métricas RPO e RTO

| Métrica | Definição | Alvo Legis Connect | Mecanismo |
|---|---|---|---|
| **RPO** (Recovery Point Objective) | Perda máxima aceitável de dados | **< 5 Minutos** | WAL Streaming (Write-Ahead Logging) contínuo para AWS S3 + RDS Continuous Backups. |
| **RTO** (Recovery Time Objective) | Tempo máximo para colocar a plataforma no ar pós-desastre | **< 1 Hora** | RDS Automated Multi-AZ Failover (Instantâneo) + Restore automatizado via Terraform. |

---

## ETAPA 14 — PLANO DE MIGRAÇÃO DO LOCALSTORAGE PARA POSTGRESQL

```
                         ETAPAS DA MIGRAÇÃO DE DADOS
                         ═══════════════════════════

   FASE 1: Provisionar PostgreSQL 16 na Nuvem (AWS RDS Multi-AZ)
     │
   FASE 2: Executar `npx prisma migrate deploy` (Criar tabelas TO-BE)
     │
   FASE 3: Desenvolver Script ETL de Migração (`scripts/migrate-localstorage.ts`)
     │
   FASE 4: Executar ETL para extrair do localStorage, sanitizar e inserir no DB
     │
   FASE 5: Validar Contagem e Hashes de Integridade pós-migração
     │
   FASE 6: Desativar a camada `dbService` local e virar a chave para NestJS + Prisma
```

---

## ETAPA 15 — BACKLOG TÉCNICO DE BANCO DE DADOS (PRIORIZADO)

### DATABASE-001 — Provisionar PostgreSQL 16 e Aplicar Schema TO-BE
* **Problema**: A aplicação depende de `localStorage`.
* **Solução**: Provisionar PostgreSQL (RDS/Supabase) e rodar a migração do `schema.prisma` v2.0 (TO-BE).
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 40h

### DATABASE-002 — Implementar Multi-Tenancy com `workspace_id` e RLS
* **Problema**: Falta de segregação entre diferentes escritórios jurídicos.
* **Solução**: Adicionar `workspace_id` em todas as tabelas e aplicar políticas RLS no PostgreSQL.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 48h

### DATABASE-003 — Desenvolver Script ETL de Migração do localStorage
* **Problema**: Usuários existentes possuem dados armazenados no browser.
* **Solução**: Script CLI em TypeScript que lê o payload exportado do `localStorage`, valida via Zod e salva no PostgreSQL via Prisma.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Média | **Esforço**: 32h

### DATABASE-004 — Implementar Tabela de Auditoria Imutável com Trigger Append-Only
* **Problema**: O log no browser pode ser alterado ou limpo.
* **Solução**: Tabela `staff_audit_logs` no banco com trigger PL/pgSQL que bloqueia `UPDATE` e `DELETE`.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 16h

### DATABASE-005 — Normalizar Módulo de Documentos e Integrar com S3
* **Problema**: PDFs codificados em base64 armazenados diretamente no `localStorage`.
* **Solução**: Tabela `case_documents` armazenando apenas metadados e `s3_key`; arquivos salvos no AWS S3 com criptografia SSE-KMS.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Alta | **Esforço**: 40h

### DATABASE-006 — Migrar e Normalizar Especialidades de Advogados (3NF)
* **Problema**: Array de strings solto em `LawyerProfile.specialties`.
* **Solução**: Criar tabela `specialties` e `lawyer_specialties` (tabela de junção).
* **Prioridade**: 🟠 ALTA | **Complexidade**: Baixa | **Esforço**: 12h

### DATABASE-007 — Criar Módulo Financeiro no Prisma (`financial_transactions`)
* **Problema**: `dbFinancial` existe apenas como mock local.
* **Solução**: Model `FinancialTransaction` com suporte a pagamentos, vencimentos e conciliação Stripe.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Média | **Esforço**: 24h

### DATABASE-008 — Criptografia de Colunas Sensíveis (`cpf_encrypted`, `mfa_secret`)
* **Problema**: CPFs armazenados em texto claro.
* **Solução**: Implementar criptografia de aplicação (NestJS Crypto Service) + busca por `cpf_hash` (SHA-256).
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 24h

### DATABASE-009 — Configurar pgBouncer e Connection Pooling
* **Problema**: Esgotamento de conexões com múltiplas instâncias NestJS.
* **Solução**: Configurar pgBouncer na frente do PostgreSQL (pool de 20 a 50 conexões).
* **Prioridade**: 🟡 MÉDIA | **Complexidade**: Média | **Esforço**: 16h

### DATABASE-010 — Configurar Redis Cache para Consultas Frequentes
* **Problema**: Latência em pesquisas de advogados e verificações de sessão.
* **Solução**: Integração Redis 7+ para cache de busca de advogados e lista de revogação de tokens JWT.
* **Prioridade**: 🟡 MÉDIA | **Complexidade**: Média | **Esforço**: 20h

### DATABASE-011 — Configurar Automated Backups e WAL Streaming na AWS
* **Problema**: Ausência de plano de recuperação de desastres.
* **Solução**: Configurar backups diários no RDS + WAL streaming para S3 para garantir RPO < 5 minutos.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Média | **Esforço**: 16h

### DATABASE-012 — Implementar Scripts de Anonymização LGPD
* **Problema**: Falta de funcionalidade para atender ao direito de exclusão do titular (Art. 18 LGPD).
* **Solução**: Stored Procedure / Serviço NestJS para descaracterizar dados pessoais do usuário mantendo integridade financeira.
* **Prioridade**: 🟡 MÉDIA | **Complexidade**: Média | **Esforço**: 24h

---

## SUMMARY OF DELIVERABLES

| Entregável | Status |
|---|---|
| ✅ Inventário da Persistência Atual (localStorage, sessionStorage, dbService, Prisma) | Concluído |
| ✅ Catálogo de Entidades Existentes (Campos, Origem, Sensibilidade LGPD) | Concluído |
| ✅ Auditoria Detalhada do `schema.prisma` Atual (8 Lacunas Críticas Mapeadas) | Concluído |
| ✅ Diagrama do Modelo Conceitual AS-IS | Concluído |
| ✅ Auditoria de Normalização (Violações 1NF, 2NF, 3NF Identificadas) | Concluído |
| ✅ Matriz de Classificação de Dados e Diretrizes LGPD (Ciclo de Vida) | Concluído |
| ✅ Arquitetura SaaS Multi-Tenant (Isolamento por `workspace_id` + RLS) | Concluído |
| ✅ Diagrama da Arquitetura TO-BE (PostgreSQL + NestJS + Redis + S3) | Concluído |
| ✅ **Schema Prisma ORM TO-BE Completo** (18 Modelos, 8 Domínios, RLS, 3NF) | Concluído |
| ✅ Estratégia de Segurança do Banco (Trânsito, Repouso, Colunas, Triggers Imutáveis) | Concluído |
| ✅ Plano de Performance e Escalabilidade (pgBouncer, Índices, Redis) | Concluído |
| ✅ Plano de Backup e Disaster Recovery (RPO < 5min, RTO < 1h) | Concluído |
| ✅ Plano de Migração Incremental em 6 Fases (do localStorage ao PostgreSQL) | Concluído |
| ✅ Backlog Técnico de Banco de Dados Priorizado (`DATABASE-001` a `DATABASE-012`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 006 — Database Architecture Blueprint | v1.0.0*
*Próximo: PROMPT 007 — Plano de Execução e Engenharia da Transição (Roadmap Completo de Reconstrução TO-BE)*
