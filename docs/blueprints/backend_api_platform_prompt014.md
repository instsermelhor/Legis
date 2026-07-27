# ⚙️ BACKEND ARCHITECTURE & API PLATFORM BLUEPRINT — LEGIS CONNECT
**PROMPT 014 — Auditoria Completa da Arquitetura Backend, APIs, Microsserviços e Camada de Negócio**
**Enterprise Software Architect | Principal Backend Engineer & DDD Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A Legis Connect opera atualmente **sem um servidor de aplicação backend**. Todas as regras de negócio, autenticação, autorização de acesso, cálculos financeiros, máquinas de estado e integrações externas executam no navegador do cliente, persistindo dados em `localStorage`.

**Diagnóstico de Arquitetura Backend**:
- **Nível de Maturidade Backend**: `0 / 100` (Inexistente).
- **Risco de Integridade e Segurança**: **CRÍTICO**. Qualquer regra de negócio ou controle de acesso executado no client-side pode ser contornado ou sobrescrito em segundos via manipulação de código no DevTools.

**Arquitetura Alvo TO-BE**: Construção de um **Modular Monolith em NestJS 10+ (Node.js 20 / TypeScript)** orientado a **Domain-Driven Design (DDD)** e **Clean Architecture**, preparado para evolução futura em microsserviços se necessário. A plataforma será alimentada por **AWS RDS PostgreSQL 16**, cache **Redis 7+**, mensageria assíncrona **BullMQ** e integrações externas seguras com **Stripe**, **Google Vertex AI** e **SendGrid**.

---

## ETAPA 1 — AUDITORIA DA ARQUITETURA ATUAL (AS-IS)

### 1.1 Mapeamento de Migração de Componentes Client-Side

| Componente Current (Client-Side) | Responsabilidade Atual | Problema Encontrado | Arquitetura Correta (Backend TO-BE) |
|---|---|---|---|
| **`AppDataContext.tsx`** | Centraliza usuários, advogados, clientes e serviços em memória. | Re-renderizações massivas na UI; limite de memória; ausência de ACID. | **NestJS Application Layer** + **TanStack Query** no frontend. |
| **`dbService.ts`** | Simula operações CRUD de banco de dados no `localStorage`. | Sem chaves estrangeiras, sem transações, sem persistência remota. | **Prisma ORM** + **PostgreSQL 16 Multi-AZ**. |
| **`staffService.ts`** | Autenticação e RBAC de colaboradores internos. | Senhas em `btoa` e permissões verificadas apenas no JS do browser. | **AuthModule NestJS** + **Passport JWT** + **Argon2id**. |
| **`provisioningService.ts`** | Máquina de estados de pagamento e liberações de acesso. | Créditos de IA e permissões de planos manipuláveis no DevTools. | **ProvisioningModule NestJS** + **BullMQ Workers** + **Stripe Webhooks**. |
| **`geminiService.ts`** | Chamada direta do frontend à API do Google Gemini. | `API_KEY` exposta no bundle JS; sem rate limit ou FinOps. | **AiGatewayModule NestJS** (Proxy isolado no servidor). |
| **`auditLogger.ts`** | Gravação local do histórico de auditoria. | Log forjável e apagável pelo usuário (`localStorage.clear()`). | **AuditModule NestJS** + **HMAC-SHA-256** + **PostgreSQL Append-Only**. |

---

## ETAPA 2 — DEFINIÇÃO DA ARQUITETURA BACKEND FUTURA

### 2.1 Comparativo de Estilos Arquiteturais Backend

| Critério de Avaliação | Monolito Tradicional | Microsserviços Distribuídos | Modular Monolith (NestJS + DDD) |
|---|---|---|---|
| **Velocidade de Desenvolvimento** | 🟢 Rápida | 🔴 Lenta (Overhead de redes) | 🟢 **Excelente (Ideal para o time)** |
| **Complexidade Operacional** | 🟢 Baixa | 🔴 Altíssima (K8s, Service Mesh) | 🟢 **Otimizada (Single Deployment)** |
| **Isolamento de Domínio** | 🔴 Fraco (Spaghetti Code) | 🟢 Forte (Processos isolados) | 🟢 **Forte (Módulos NestJS isolados)** |
| **Custo de Infraestrutura** | 🟢 Baixo | 🔴 Alto (Vários containers/DBs) | 🟢 **Baixo (AWS ECS Fargate Cluster)** |
| **Facilidade de Refatoração** | 🔴 Complexa | 🔴 Difícil (Breaking API Changes)| 🟢 **Alta (TypeScript Compile-Time)** |
| **DECISÃO LEGIS CONNECT** | Descartado | Descartado (Prematuro) | **RECOMENDADO (Fase 1 e 2)** |

---

## ETAPA 3 — PROJETO DA CAMADA DE APLICAÇÃO (MODULE BOUNDARIES)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   NESTSJ MODULAR MONOLITH APPLICATION                       │
│                                                                             │
│  [ HTTP / REST Controllers ]      [ Webhook Handlers ]      [ Cron Jobs ]   │
│               │                            │                     │          │
│               └────────────────────┬───────┴─────────────────────┘          │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    APPLICATION DOMAIN MODULES                        │   │
│  │                                                                      │   │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │   │
│  │  │ AuthModule       │ │ UsersModule      │ │ LawyersModule    │  │   │
│  │  │ - Login/MFA/JWT  │ │ - User Profile   │ │ - OAB/Search     │  │   │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘  │   │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │   │
│  │  │ CasesModule      │ │ FinanceModule    │ │ DocumentsModule  │  │   │
│  │  │ - Cases & Stages │ │ - Stripe/Invoices│ │ - AWS S3 Upload  │  │   │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘  │   │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │   │
│  │  │ ProvisionModule  │ │ AiGatewayModule  │ │ AuditModule      │  │   │
│  │  │ - State Machine  │ │ - Gemini / RAG   │ │ - HMAC Audit Log │  │   │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘  │   │
│  └─────────────────────────────────┬────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │              INFRASTRUCTURE LAYER (Persistence & IO)                 │   │
│  │  ├── PrismaService (PostgreSQL 16 Multi-AZ com RLS)                  │   │
│  │  ├── RedisService (Cluster Cache & Rate Limit)                       │   │
│  │  ├── BullMQQueues (Worker Assíncrono de Notificações e Audit)        │   │
│  │  └── AwsS3Service (Documentos Criptografados com SSE-KMS)            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 4 — APLICAÇÃO DE DOMAIN-DRIVEN DESIGN (DDD)

### 4.1 Mapeamento de Bounded Contexts (Contextos Delimitados)

```
                            BOUNDED CONTEXTS MAP
                            ═════════════════════

  1. IDENTITY & ACCESS CONTEXT
     • Entidades: User, Role, Permission, RefreshToken, Workspace
     • Responsabilidade: Autenticação, emissão de JWT, RBAC/ABAC e Multi-Tenancy.

  2. LEGAL OPERATIONS CONTEXT
     • Entidades: LawyerProfile, ClientProfile, Case, CaseStage, Specialty
     • Responsabilidade: Gestão de processos, acompanhamento de fases e match jurídico.

  3. DOCUMENT MANAGEMENT CONTEXT
     • Entidades: CaseDocument, DocumentVersion, S3Object
     • Responsabilidade: Armazenamento seguro S3, controle de versão e OCR.

  4. FINANCIAL & PROVISIONING CONTEXT
     • Entidades: FinancialTransaction, ServiceProvisioning, Invoice, Subscription
     • Responsabilidade: Cobranças, integração Stripe, conciliação e concessão de créditos.

  5. AI & COGNITIVE PLATFORM CONTEXT
     • Entidades: PromptTemplate, VectorEmbedding, TokenUsageLog
     • Responsabilidade: AI Gateway, RAG, sanitização de PII e FinOps.

  6. GOVERNANCE & COMPLIANCE CONTEXT
     • Entidades: StaffAuditLog, ImpersonationSession, ConsentRecord
     • Responsabilidade: Audit trail imutável com HMAC, conformidade LGPD e DPA.
```

---

## ETAPA 5 — PROJETO DA API REST ENTERPRISE

### 5.1 Padrão de Versionamento e Contratos HTTP

- **Prefixo Oficial**: `/api/v1/`
- **Envelope Único de Resposta**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operação concluída com sucesso.",
  "data": { ... },
  "meta": {
    "timestamp": "2026-07-25T02:50:00.000Z",
    "correlationId": "req_8f9a0b1c2d3e"
  }
}
```

---

## ETAPA 6 — PROJETO GRAPHQL (AVALIAÇÃO DE USO)

- **Decisão Arquitetural**: Manter **REST API (JSON v1)** como protocolo principal para 90% das operações CRUD, Autenticação e Integrações Externas.
- **Uso Seletivo de GraphQL**: Implementar GraphQL `@nestjs/graphql` apenas na Fase 3 para a construção de **Dashboards Analytics Complexos** do Portal Administrativo e relatórios customizados de escritórios jurídicos.

---

## ETAPA 7 — ARQUITETURA DE AUTENTICAÇÃO BACKEND

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FLUXO DE AUTENTICAÇÃO JWT + COOKIES                    │
│                                                                             │
│  1. Login Request ──► POST /api/v1/auth/login (email + password)            │
│  2. Server ─────────► Argon2id Verify Password & Increment Fail Counter     │
│  3. Server ─────────► Genera JWT Access Token (15 min, payload na memória)   │
│  4. Server ─────────► Genera Refresh Token (7 dias, salvo no Redis)         │
│  5. Response ───────► Body: { accessToken }                                 │
│                       Header: Set-Cookie: refresh_token (httpOnly; Secure) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 8 — ARQUITETURA DE AUTORIZAÇÃO (RBAC + ABAC)

```typescript
// Guards NestJS de Permissões Combinadas (RBAC + ABAC)
@Injectable()
export class CombinedAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Obtido do JWT

    // 1. RBAC Check (Role do usuário)
    if (!this.checkRolePermission(user.role, request.route.path)) {
      throw new ForbiddenException('Acesso negado para esta função.');
    }

    // 2. ABAC Multi-Tenant Check (Propriedade do Recurso)
    const resourceWorkspaceId = request.params.workspaceId || request.body.workspaceId;
    if (user.role !== 'super_admin' && user.workspaceId !== resourceWorkspaceId) {
      throw new ForbiddenException('Acesso negado a dados de outro escritório.');
    }

    return true;
  }
}
```

---

## ETAPA 9 — PROJETO DOS SERVIÇOS BACKEND CENTRAIS

```
                               SERVIÇOS CENTRAIS NESTSJ
                               ════════════════════════

  • AuthService ──────► Gerencia tokens, Argon2id, MFA TOTP e sessoes Redis.
  • UserService ──────► Gestao de perfis, anonimizacao LGPD e exportacao.
  • LawyerService ────► Cadastro OAB, busca geolocalizada e especialidades.
  • LegalCaseService ─► Acompanhamento de processos, fases e notificacao.
  • DocumentService ──► Geração de Presigned URLs S3 e metadados.
  • FinancialService ─► Faturamento, conciliação Stripe e emissão de NFs.
  • NotificationService ► Envios assíncronos de E-mail (SendGrid) e Push.
```

---

## ETAPA 10 — INTEGRAÇÃO COM SERVIÇOS EXTERNOS

| Serviço Externo | Categoria | Biblioteca / SDK | Protocolo de Segurança |
|---|---|---|---|
| **Google Gemini 2.5 Flash** | Inteligência Artificial | `@google/genai` (Server-Side) | API Key via AWS Secrets Manager |
| **Stripe / PagarMe** | Gateway de Pagamentos | `stripe` SDK | Webhook Signature Verification (`stripe-signature`) |
| **SendGrid / AWS SES** | E-mail Transacional | `@sendgrid/mail` | API Key criptografada em servidor |
| **API Conselho Federal OAB** | Validação de Advogados | `axios` (mTLS / OAuth) | Credencial de integração oficial |
| **Clicksign / DocuSign** | Assinatura Digital | REST API SDK | Bearer Token + Webhooks assinados |

---

## ETAPA 11 — MENSAGERIA E PROCESSAMENTO ASSÍNCRONO (`BullMQ`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARQUITETURA DE FILAS BULLMQ + REDIS                      │
│                                                                             │
│  NestJS Controller (Fast Response < 50ms)                                   │
│         │                                                                   │
│         ▼ Enqueue Job                                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ BullMQ Queue (Redis 7+)                                              │   │
│  │ ├── Queue: "notifications"   ──► Worker: SendGrid Email Processor    │   │
│  │ ├── Queue: "audit-logs"      ──► Worker: HMAC Audit Log Storage      │   │
│  │ ├── Queue: "document-scan"   ──► Worker: ClamAV Antivirus Processor   │   │
│  │ └── Queue: "ai-embeddings"   ──► Worker: RAG Vector Generator        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 12 — TRATAMENTO DE ERROS E RESILIÊNCIA (`Opossum`)

### 12.1 Circuit Breaker para Chamadas Externas
* **Timeout Padronizado**: 10 segundos para APIs externas.
* **Circuit Breaker**: Abre após 50% de falhas consecutivas, acionando o método `Fallback` com resposta amigável pré-definida sem derrubar o backend NestJS.

---

## ETAPA 13 — SEGURANÇA BACKEND (API SECURITY CHECKLIST)

```
                               CHECKLIST DE SEGURANÇA DE API
                               ═════════════════════════════

  [x] HTTPS Obrigatório com HSTS (max-age=31536000)
  [x] CORS Restrito à origem confiável (https://legisconnect.com.br)
  [x] Rate Limiting por Usuário e IP (@nestjs/throttler)
  [x] Validação Estrita de Input DTOs com Zod / class-validator (strip unknown)
  [x] Proteção Helmet.js ativada (CSP, X-Frame-Options DENY)
  [x] Sanitize de logs (senhas e dados PII nunca gravados em texto claro)
```

---

## ETAPA 14 — ARQUITETURA DE AUDITORIA E COMPLIANCE

* **Audit Log Imutável**: Registro de requisições sensíveis efetuado por um `AuditInterceptor` gravado de forma assíncrona no PostgreSQL com a assinatura de integridade HMAC-SHA-256.

---

## ETAPA 15 — ESTRATÉGIA DE TESTES BACKEND (VITEST & SUPERTEST)

```
                            META DE COBERTURA DE TESTES
                            ═══════════════════════════

  • Testes Unitários (Vitest) ────────► 85% Cobertura em Services e Regras DDD
  • Testes de Integração (Supertest) ──► 80% Cobertura em Controladores REST
  • Testes E2E (Jest/Supertest) ──────► 100% dos Fluxos Críticos (Auth/Checkout)
```

---

## ETAPA 16 — OBSERVABILIDADE BACKEND

* **OpenTelemetry + Grafana**: Instrumentação nativa no NestJS capturando métricas de latência p95/p99, uso de CPU, conexões de banco de dados e contagem de chamadas a serviços externos.

---

## ETAPA 17 — DEPLOYMENT BACKEND (AWS ECS FARGATE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DEPLOYMENT PIPELINE (AWS ECS)                         │
│                                                                             │
│  GitHub Commit ──► CI Build ──► ECR Push (Distroless Image) ──► AWS CodeDeploy│
│                                                                   │ (Blue/Green)│
│                                                                   ▼             │
│                                                       AWS ECS Fargate Cluster   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 18 — ROADMAP DE IMPLEMENTAÇÃO BACKEND

```
                    ROADMAP DE DESENVOLVIMENTO BACKEND
                    ══════════════════════════════════

  FASE 1: FUNDAÇÃO & AUTENTICAÇÃO (Semanas 1-4)
  ├── Setup NestJS Modular Monolith + Prisma ORM + PostgreSQL
  ├── Implementar AuthModule (JWT, Argon2id, Refresh Token, MFA)
  └── Implementar AuditModule e Guards de Multi-Tenancy

  FASE 2: REGRAS DE NEGÓCIO CORE (Semanas 5-8)
  ├── Implementar UsersModule, LawyersModule, ClientsModule, CasesModule
  ├── Conectar Frontend React aos novos endpoints REST v1
  └── Migrar a persistência do `localStorage` para o servidor

  FASE 3: DOCUMENTOS, FINANCEIRO & IA (Semanas 9-12)
  ├── Implementar DocumentsModule (S3 Presigned URLs)
  ├── Implementar FinanceModule (Stripe Webhooks) e AiGatewayModule
  └── Integração de mensageria com BullMQ + Redis Cluster
```

---

## ETAPA 19 — BACKLOG TÉCNICO BACKEND

### BACKEND-001 — Setup Inicial do NestJS Modular Monolith
* **Problema**: Ausência de servidor backend no projeto.
* **Solução**: Inicializar aplicação NestJS com TypeScript, Prisma ORM, Winston Logger e ConfigModule.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 24h

### BACKEND-002 — Módulo de Autenticação e Emissão de JWT (`AuthModule`)
* **Problema**: Autenticação simulada no cliente com senhas em `btoa`.
* **Solução**: Implementar `AuthModule` com Argon2id, JWT Access Tokens e Refresh Tokens em cookies `httpOnly`.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 60h

### BACKEND-003 — Implementar Middleware de Multi-Tenancy e RBAC/ABAC
* **Problema**: Inexistência de isolamento seguro entre escritórios jurídicos.
* **Solução**: `@Roles()`, `@Permissions()` Guards e `WorkspaceGuard` validando a chave `workspace_id`.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 40h

### BACKEND-004 — Implementar Módulo Proxy de IA (`AiGatewayModule`)
* **Problema**: `GEMINI_API_KEY` exposta no bundle JavaScript do frontend.
* **Solução**: Proxy backend isolando a credencial, aplicando sanitização de PII e Redis Cache.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 32h

### BACKEND-005 — Módulo de Documentos e Upload Assinado S3 (`DocumentsModule`)
* **Problema**: PDFs codificados em base64 no `localStorage`.
* **Solução**: Geração de Presigned URLs do AWS S3 com validação de MIME type e scan antivírus.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Alta | **Esforço**: 40h

### BACKEND-006 — Mensageria Assíncrona com BullMQ + Redis
* **Problema**: Processamentos pesados travando as requisições HTTP.
* **Solução**: Filas BullMQ para envio de e-mails, auditoria e geração de relatórios em segundo plano.
* **Prioridade**: 🟠 ALTA | **Complexidade**: Média | **Esforço**: 32h

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 014

| Entregável | Status |
|---|---|
| ✅ Auditoria da Arquitetura Backend Atual (Tabela de Migração Client -> Server) | Concluído |
| ✅ Comparativo Arquitetural (Decisão pelo Modular Monolith em NestJS) | Concluído |
| ✅ Definição dos Módulos da Aplicação (Camadas e Limites de Domínio) | Concluído |
| ✅ Aplicação de Domain-Driven Design (Bounded Contexts Mapeados) | Concluído |
| ✅ Projeto da API REST Enterprise (Envelope JSON, HTTP Status, Versão v1) | Concluído |
| ✅ Avaliação GraphQL (Uso seletivo para Dashboards em Fase Avançada) | Concluído |
| ✅ Arquitetura de Autenticação Backend (JWT + Argon2id + Cookies httpOnly + MFA) | Concluído |
| ✅ Modelo de Autorização (RBAC + ABAC + Isolamento por `workspace_id`) | Concluído |
| ✅ Especificação dos 7 Serviços Backend Centrais (Auth, User, Lawyer, Case, etc.) | Concluído |
| ✅ Projeto de Integrações Externas (Stripe, SendGrid, Vertex AI, Clicksign) | Concluído |
| ✅ Arquitetura de Filas e Mensageria (BullMQ + Redis 7+ Cluster) | Concluído |
| ✅ Tratamento de Erros & Resiliência (Exception Filters + Circuit Breaker Opossum) | Concluído |
| ✅ Estratégia de Segurança Backend (API Security Checklist completa) | Concluído |
| ✅ Arquitetura de Auditoria e Compliance (AuditService com HMAC-SHA-256) | Concluído |
| ✅ Estratégia de Testes Backend (Vitest, Supertest e Meta de 80% Cobertura) | Concluído |
| ✅ Observabilidade Backend (OpenTelemetry + Prometheus + Grafana) | Concluído |
| ✅ Arquitetura de Deploy Backend (AWS ECS Fargate + ALB + RDS Multi-AZ) | Concluído |
| ✅ Roadmap de Implementação em 4 Fases (16 semanas) | Concluído |
| ✅ Backlog Técnico Backend Priorizado (`BACKEND-001` a `BACKEND-006`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 014 — Backend Architecture & API Platform Blueprint | v1.0.0*
*Próximo: PROMPT 015 — Plano Mestre de Reengenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
