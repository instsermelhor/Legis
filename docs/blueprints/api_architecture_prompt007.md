# 🌐 API ARCHITECTURE BLUEPRINT — LEGIS CONNECT
**PROMPT 007 — Auditoria Completa da Camada de Comunicação, APIs e Arquitetura Backend**
**Enterprise API Architect | NestJS & Distributed Systems Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A arquitetura de comunicação atual da Legis Connect **não possui uma camada de backend real**. Todas as chamadas de "API" são invocações síncronas de funções JavaScript locais acessando o `localStorage` do navegador ou chamadas diretas do bundle frontend à API do Google Gemini com chaves de API expostas.

**Diagnóstico Principal**: A plataforma opera como uma aplicação *Standalone Client-Side Single-Page Application (SPA)* simulando um ecossistema SaaS. Para que a Legis Connect possa operar em produção corporativa com múltiplos escritórios, milhares de usuários simultâneos e sigilo jurídico, toda a camada de comunicação deve ser reestruturada em um **Modular Monolith enterprise construído em NestJS**, protegido por um **API Gateway** com autenticação **JWT + OAuth 2.1**, rate limiting rigoroso e contratos **REST v1 padronizados e documentados via OpenAPI (Swagger)**.

---

## ETAPA 1 — AUDITORIA DA ARQUITETURA ATUAL DE COMUNICAÇÃO

### 1.1 Diagrama de Comunicação AS-IS (Atual)

```
================================================================================
                     FLUXO DE COMUNICAÇÃO ATUAL (AS-IS)
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│                             BROWSER (CLIENT-SIDE)                           │
│                                                                             │
│  [ React Components ] ───► [ Context API ] ───► [ Service Layer ]           │
│  (App.tsx, Modals,         (AppDataContext,      (dbService, staffService,  │
│   Dashboards)               AppContext)           provisioningService)      │
│                                                         │                   │
│                                                         ├───────────────────┤
│                                                         │                   │
│                                                         ▼                   ▼
│                                                 [ localStorage ]    [ Gemini API ]
│                                                 (Sem rede / HTTP)   (Request direto
│                                                                      sem proxy)
└─────────────────────────────────────────────────────────────────────────────┘

  FALHAS CRÍTICAS:
  ❌ Ausência de HTTP Client (Axios/Fetch) para a maioria dos módulos
  ❌ Sem abstração de erros de rede (Network Errors / Retry)
  ❌ Mistura total entre estado da UI e persistência de dados
  ❌ API Keys expostas no cabeçalho/bundle de chamadas diretas
  ❌ Sem camada de serialização, validação de DTOs ou cabeçalhos de segurança
```

---

## ETAPA 2 — INVENTÁRIO DE APIS EXISTENTES (MOCKS VS. REAIS)

| Serviço / Módulo | Endpoint Simulado / Real | Método | Status Atual | Situação Futura (TO-BE) |
|---|---|---|---|---|
| **Autenticação** | `handleLogin(email, pass)` | JS Call | 🔴 Mock Inseguro (btoa) | `POST /api/v1/auth/login` (NestJS + JWT) |
| **Cadastro Cliente** | `ClientSignupForm.tsx` | Local State | 🔴 Sem validação server | `POST /api/v1/clients/register` |
| **Cadastro Advogado** | `LawyerSignupForm.tsx` | Local State | 🔴 Sem validação OAB | `POST /api/v1/lawyers/register` |
| **Gemini Análise** | `analyzeCaseWithGemini()` | Direct HTTP | 🔴 API Key no Bundle | `POST /api/v1/ai/analyze-case` (Proxy) |
| **Gemini Maps** | `findPlacesWithMaps()` | Direct HTTP | 🔴 API Key no Bundle | `POST /api/v1/ai/find-lawyers` (Proxy) |
| **Gemini Chat** | `chatWithGemini()` | Direct HTTP | 🔴 API Key no Bundle | `POST /api/v1/ai/chat` (Proxy) |
| **Documentos** | `dbDocuments.add()` | JS Call | 🔴 Base64 localStorage | `POST /api/v1/documents/upload` (S3) |
| **Financeiro** | `dbFinancial.getAll()` | JS Call | 🔴 Mock estático | `GET /api/v1/finance/transactions` |
| **Provisionamento** | `processPaymentWebhook()` | JS Call | 🔴 Webhook Simulado | `POST /api/v1/webhooks/stripe` |
| **Staff Admin** | `StaffService.authenticate()`| JS Call | 🔴 Hash btoa local | `POST /api/v1/staff/login` |
| **Audit Logger** | `AuditLogger.log()` | JS Call | 🔴 Hash btoa local | `POST /api/v1/audit/logs` |
| **Config Plataforma**| `dbConfig.get()` | JS Call | 🔴 Credenciais em local | `GET /api/v1/config/public` |
| **Validação OAB** | `SettingsTab` (Simulado) | Dummy Timer | 🔴 Não valida na OAB | `POST /api/v1/lawyers/verify-oab` |
| **Exportação LGPD** | Inexistente | — | 🔴 Ausente | `GET /api/v1/users/me/export-data` |

---

## ETAPA 3 — IDENTIFICAÇÃO DE DOMÍNIOS DE API

Separamos a plataforma em **10 Domínios de API** independentes e coesos:

```
                               DOMÍNIOS DE API LEGIS CONNECT
                               ═════════════════════════════

  ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
  │ 1. IDENTITY API    │   │ 2. USER API        │   │ 3. LAWYER API      │
  │ - Auth / JWT / MFA │   │ - Perfis / PII     │   │ - OAB / Busca      │
  │ - Password Reset   │   │ - Preferências     │   │ - Especialidades   │
  └────────────────────┘   └────────────────────┘   └────────────────────┘
  ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
  │ 4. CLIENT API      │   │ 5. CASES API       │   │ 6. DOCUMENT API    │
  │ - Dados pessoais   │   │ - Processos/Etapas │   │ - S3 Presigned URL │
  │ - Histórico        │   │ - Atendimentos     │   │ - Antivírus / ACL  │
  └────────────────────┘   └────────────────────┘   └────────────────────┘
  ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
  │ 7. FINANCIAL API   │   │ 8. PROVISIONING API│   │ 9. AI GATEWAY API  │
  │ - Transações       │   │ - State Machine    │   │ - Gemini Proxy     │
  │ - Faturas / Stripe │   │ - Webhooks Gateway │   │ - Rate Limit / RAG │
  └────────────────────┘   └────────────────────┘   └────────────────────┘
                           ┌────────────────────┐
                           │ 10. AUDIT & LOGS   │
                           │ - Chain HMAC Log   │
                           │ - SIEM / Export    │
                           └────────────────────┘
```

---

## ETAPA 4 — ARQUITETURA BACKEND ALVO (TO-BE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITETURA DE COMUNICAÇÃO TO-BE                      │
│                                                                             │
│  [ Client App: React 19 SPA / Mobile ]                                      │
│                        │                                                    │
│                        │ HTTPS (TLS 1.3 + HSTS)                             │
│                        ▼                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     API GATEWAY / LOAD BALANCER                      │   │
│  │  - AWS ALB / Cloudflare WAF                                          │   │
│  │  - Rate Limiting Global (100 req/min por IP)                         │   │
│  │  - SSL/TLS Termination & Cors Policy Enforcement                     │   │
│  └──────────────────────────────────┬───────────────────────────────────┘   │
│                                     │                                       │
│                                     ▼ mTLS / Internal Network               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                   NESTJS BACKEND (Modular Monolith)                  │   │
│  │                                                                      │   │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │   │
│  │  │ AuthModule       │ │ UsersModule      │ │ LawyersModule    │  │   │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘  │   │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │   │
│  │  │ CasesModule      │ │ FinanceModule    │ │ DocumentsModule  │  │   │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘  │   │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │   │
│  │  │ ProvisionModule  │ │ AiGatewayModule  │ │ AuditModule      │  │   │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘  │   │
│  │                                                                      │   │
│  │  [ Common: JwtAuthGuard | RolesGuard | ZodPipe | AuditInterceptor ]  │   │
│  └──────┬──────────────────────┬──────────────────────┬─────────────────┘   │
│         │                      │                      │                     │
│         ▼ SQL                  ▼ TCP                  ▼ REST / S3 SDK       │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐             │
│  │  PostgreSQL  │       │  Redis 7+    │       │  External    │             │
│  │  16 (Primary)│       │  - Sessions  │       │  Services    │             │
│  │  + RLS       │       │  - Cache     │       │  - Gemini AI │             │
│  │              │       │  - RateLimit │       │  - Stripe    │             │
│  │              │       │  - BullQueue │       │  - AWS S3    │             │
│  └──────────────┘       └──────────────┘       └──────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 5 — ESTRUTURA DE DIRETÓRIOS NESTJS RECOMENDADA

```
backend/
├── dist/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── main.ts                    // Bootstrap: Swagger, Helmet, ValidationPipe
│   ├── app.module.ts              // Root module importing feature modules
│   │
│   ├── common/                    // Cross-cutting concerns
│   │   ├── decorators/            // @Roles(), @Permissions(), @CurrentUser()
│   │   ├── filters/               // HttpExceptionFilter (Global Exception Handler)
│   │   ├── guards/                // JwtAuthGuard, RolesGuard, PermissionsGuard, WorkspaceGuard
│   │   ├── interceptors/          // AuditInterceptor, LoggingInterceptor, TransformInterceptor
│   │   ├── middleware/            // RequestLoggerMiddleware, CorrelationIdMiddleware
│   │   ├── pipes/                 // ZodValidationPipe
│   │   └── utils/                 // CryptoUtils, DateUtils, PaginationUtils
│   │
│   ├── modules/                   // Domínios da Aplicação
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/        // jwt.strategy.ts, local.strategy.ts
│   │   │   └── dto/               // login.dto.ts, register.dto.ts, mfa.dto.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   ├── lawyers/
│   │   │   ├── lawyers.controller.ts
│   │   │   ├── lawyers.service.ts
│   │   │   └── dto/
│   │   ├── clients/
│   │   ├── cases/
│   │   ├── finance/
│   │   ├── documents/
│   │   │   ├── documents.controller.ts
│   │   │   ├── documents.service.ts
│   │   │   └── s3.service.ts      // AWS S3 Presigned URL generator
│   │   ├── provisioning/
│   │   │   ├── provisioning.controller.ts
│   │   │   ├── provisioning.service.ts
│   │   │   └── webhooks/          // stripe.webhook.ts
│   │   ├── ai-gateway/
│   │   │   ├── ai-gateway.controller.ts
│   │   │   ├── ai-gateway.service.ts
│   │   │   └── guards/            // ai-rate-limit.guard.ts
│   │   └── audit/
│   │       ├── audit.controller.ts
│   │       ├── audit.service.ts
│   │       └── audit.processor.ts // Bull Queue Worker para logs imutáveis
│   │
│   └── database/
│       ├── prisma.service.ts      // Prisma Client Singleton
│       └── redis.service.ts       // Redis Client Singleton
│
├── test/                          // Testes E2E (Supertest)
├── .env.example
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## ETAPA 6 — DEFINIÇÃO DOS CONTRATOS REST API (PADRÃO V1)

### 6.1 Padrões Obrigatórios de Resposta HTTP

Todas as APIs do Legis Connect retornarão o mesmo envelope JSON padronizado:

#### Resposta de Sucesso (`200 OK`, `201 Created`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": "c7a8e9f0-1234-4567-89ab-cdef01234567",
    "name": "Dra. Carolina Alencar",
    "oab": "123456/SP"
  },
  "meta": {
    "timestamp": "2026-07-25T02:45:00.000Z",
    "correlationId": "req_8f9a0b1c2d3e"
  }
}
```

#### Resposta Paginada (`GET /api/v1/lawyers?page=1&limit=10`):
```json
{
  "success": true,
  "statusCode": 200,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 142,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "timestamp": "2026-07-25T02:45:00.000Z",
    "correlationId": "req_9a0b1c2d3e4f"
  }
}
```

#### Resposta de Erro Padronizada (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`):
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Falha na validação dos dados enviados.",
  "details": [
    {
      "field": "email",
      "issue": "Formato de e-mail inválido."
    },
    {
      "field": "cpf",
      "issue": "Dígito verificador do CPF incorreto."
    }
  ],
  "meta": {
    "timestamp": "2026-07-25T02:45:00.000Z",
    "correlationId": "req_0b1c2d3e4f5a"
  }
}
```

---

## ETAPA 7 — PROJETO DA API DE AUTENTICAÇÃO (`AuthModule`)

### 7.1 Endpoints do Módulo de Autenticação

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/mfa/verify
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/password/request-reset
POST /api/v1/auth/password/confirm-reset
GET  /api/v1/auth/me
```

### 7.2 Fluxo Sequencial de Autenticação com MFA e Refresh Token

```
  Client (React)              API Gateway               NestJS Auth             Redis / DB
       │                           │                         │                      │
   1.  │─── POST /auth/login ─────►│                         │                      │
       │    (email, password)      │─── AuthGuard ──────────►│                      │
       │                           │                         │─── Verify Argon2id ─►│ (PostgreSQL)
       │                           │                         │    Password OK?      │
       │                           │                         │                      │
   2.  │◄── 200 OK (Requires MFA) ◄┼─────────────────────────┤ (Se MFA ativo)       │
       │    { mfaTicket }          │                         │                      │
       │                           │                         │                      │
   3.  │─── POST /auth/mfa/verify─►│                         │                      │
       │    (mfaTicket, totpCode)  │────────────────────────►│─── Verify TOTP ─────►│
       │                           │                         │                      │
   4.  │◄── 200 OK ───────────────◄┼─────────────────────────┤                      │
       │    Set-Cookie:            │                         │─── Save Session ────►│ (Redis)
       │    refresh_token (httpOnly│                         │    JWT Sign (15m)     │
       │    Body: { accessToken }  │                         │                      │
```

---

## ETAPA 8 — PROJETO DA API DE USUÁRIOS E PERMISSÕES (`UsersModule`)

### 8.1 Endpoints do Módulo de Usuários

| Método | Endpoint | Proteção | Descrição |
|---|---|---|---|
| `GET` | `/api/v1/users` | `@Roles('admin')` | Listagem paginada de usuários do workspace. |
| `GET` | `/api/v1/users/:id` | `@Permissions('users:read')` | Detalhes do perfil do usuário. |
| `PATCH` | `/api/v1/users/:id` | `@Permissions('users:write')` | Atualiza dados básicos (nome, telefone). |
| `PATCH` | `/api/v1/users/:id/status` | `@Roles('admin')` | Ativa, suspende ou bloqueia conta. |
| `DELETE` | `/api/v1/users/:id` | `@Roles('super_admin')` | Soft delete do usuário (LGPD Art. 16). |
| `GET` | `/api/v1/users/me/export-data` | `@CurrentUser()` | Exportação completa de dados pessoais (LGPD Art. 18). |

---

## ETAPA 9 — PROJETO DAS APIS JURÍDICAS (`Lawyers`, `Clients`, `Cases`)

### 9.1 Endpoints de Advogados e Busca (`LawyersModule`)

```
GET  /api/v1/lawyers                (Público - Busca paginada por cidade/especialidade)
GET  /api/v1/lawyers/:id            (Público - Perfil completo e especialidades)
POST /api/v1/lawyers/register       (Público - Cadastro de advogado com upload OAB)
PATCH/api/v1/lawyers/me/profile     (Protegido - Advogado atualiza bio, honorários)
POST /api/v1/lawyers/:id/verify-oab (Protegido - Admin/Compliance valida OAB na API oficial)
```

### 9.2 Endpoints de Casos e Processos (`CasesModule`)

```
GET   /api/v1/cases                 (Protegido - Lista casos do usuário/advogado logado)
POST  /api/v1/cases                 (Protegido - Abre novo caso jurídico)
GET   /api/v1/cases/:id             (Protegido - Detalhes, etapas e documentos vinculados)
PATCH /api/v1/cases/:id/stage       (Protegido - Avança etapa do processo)
POST  /api/v1/cases/:id/documents   (Protegido - Vincula documento S3 ao processo)
```

---

## ETAPA 10 — PROJETO DA API FINANCEIRA (`FinanceModule`)

### 10.1 Endpoints do Módulo Financeiro

```
GET  /api/v1/finance/summary        (Visão geral: Recebido, Pendente, Inadimplente)
GET  /api/v1/finance/transactions   (Listagem paginada com filtros por data/status)
POST /api/v1/finance/transactions   (Lança nova receita ou despesa)
POST /api/v1/finance/checkout       (Gera Link de Pagamento / PIX via Stripe/PagarMe)
GET  /api/v1/finance/export/csv     (Exporta relatório financeiro para contabilidade)
```

---

## ETAPA 11 — API DE DOCUMENTOS JURÍDICOS E S3 (`DocumentsModule`)

### 11.1 Fluxo Seguro de Upload com S3 Presigned URLs

```
  Client (React)                 NestJS API (DocumentsModule)          AWS S3 Bucket
       │                                     │                               │
   1.  │─── POST /documents/presign-upload ─►│                               │
       │    { fileName, mimeType, size }    │─── Validate MIME & Size       │
       │                                     │─── Generate S3 Presigned URL  │
   2.  │◄── 200 OK { uploadUrl, s3Key } ─────┤                               │
       │                                     │                               │
   3.  │─── PUT <uploadUrl> ────────────────────────────────────────────────►│ (Direct to S3)
       │    (Binary File Stream)             │                               │
       │                                     │                               │
   4.  │─── POST /documents/confirm ────────►│                               │
       │    { s3Key, caseId, title }         │─── Save Metadata in Postgres  │
   5.  │◄── 201 Created { documentId } ──────┤                               │
```

#### Regras de Segurança no Upload:
* **MIME Types Permitidos**: `application/pdf`, `image/jpeg`, `image/png`. (Proibido `.exe`, `.bat`, `.js`, `.zip`).
* **Tamanho Máximo**: 25 MB por arquivo.
* **Scan Antivírus Assíncrono**: AWS Lambda acionada via S3 Event executando ClamAV antes de marcar o documento como `ACTIVE`.

---

## ETAPA 12 — API DE INTELIGÊNCIA ARTIFICIAL (`AiGatewayModule`)

### 12.1 Arquitetura do AI Gateway Proxy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AI GATEWAY ARCHITECTURE                          │
│                                                                             │
│  Client React ──► POST /api/v1/ai/analyze-case ──► NestJS AiGateway         │
│                                                        │                    │
│    ┌───────────────────────────────────────────────────┼─────────────────┐  │
│    │ NestJS AiGateway Security Pipeline                │                 │  │
│    │                                                   ▼                 │  │
│    │ 1. JwtAuthGuard ──────────► Rejeita requisições não autenticadas   │  │
│    │ 2. ThrottlerGuard ────────► Rate limit: Max 20 req/min por usuário │  │
│    │ 3. PromptSanitizer ───────► Remove padrões de Prompt Injection     │  │
│    │ 4. CacheService (Redis) ──► Retorna análise salva se prompt igual  │  │
│    │ 5. Gemini SDK (Server) ───► Usa API Key isolada no servidor .env   │  │
│    │ 6. UsageLogger ───────────► Registra consumo de tokens do usuário  │  │
│    └───────────────────────────────────────────────────┬─────────────────┘  │
│                                                        │                    │
│                                                        ▼                    │
│                                              Google Gemini 2.5 Flash API    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 13 — SEGURANÇA DA API (OWASP API SECURITY TOP 10)

| Vulnerabilidade OWASP | Situação Atual | Correção Aplicada no TO-BE |
|---|---|---|
| **API1:2023 - Broken Object Level Authorization (BOLA)** | 🔴 Inexistente (Qualquer ID pode ser lido) | `WorkspaceGuard` + filtro `WHERE workspace_id = :userWorkspaceId` em todas as queries. |
| **API2:2023 - Broken Authentication** | 🔴 Inexistente (Auth JS no cliente) | JWT assinado no servidor + Argon2id + Refresh Token httpOnly + MFA TOTP. |
| **API3:2023 - Broken Object Property Level Authorization** | 🔴 Dados retornados sem filtro | Class-Transformer DTOs com `@Exclude()` para nunca retornar senhas ou hashes. |
| **API4:2023 - Unrestricted Resource Consumption** | 🔴 Sem Rate Limit (DDoS livre) | `@nestjs/throttler` global (100 req/min) + limites severos nas rotas de Auth e IA. |
| **API5:2023 - Broken Function Level Authorization** | 🔴 Inexistente (Admin via DevTools) | `@Roles()` e `@Permissions()` Guards em todos os endpoints administrativos. |
| **API6:2023 - Unrestricted Access to Sensitive Business Flows** | 🔴 Inexistente | Captcha + Rate Limit + Idempotency Key em pagamentos e cadastros. |
| **API7:2023 - Server Side Request Forgery (SSRF)** | 🔴 Possível via `dbCloud` | Proxy estrito sem permissão para o backend fazer chamadas a IPs arbitrários. |
| **API8:2023 - Security Misconfiguration** | 🔴 API Key exposta no bundle JS | Helmet.js + CORS restrito a `https://legisconnect.com.br` + secrets no Secrets Manager. |
| **API9:2023 - Improper Inventory Management** | 🔴 Sem versão de API | Versionamento explícito `/api/v1/` + Swagger OpenAPI auto-gerado. |
| **API10:2023 - Unsafe Consumption of APIs** | 🔴 Chamadas sem timeout ou retry | `HttpModule` com timeout de 10s, 3 retries e Circuit Breaker para chamadas externas. |

---

## ETAPA 14 — RESILIÊNCIA E ALTA DISPONIBILIDADE

### 14.1 Padrão Circuit Breaker para APIs Externas (Gemini / Stripe)

```typescript
// Implementação de resiliência com Opossum / NestJS
import CircuitBreaker from 'opossum';

const options = {
  timeout: 8000, // 8 segundos de timeout
  errorThresholdPercentage: 50, // Abre o circuito se 50% das requisições falharem
  resetTimeout: 30000, // Tenta reabrir após 30 segundos
};

const breaker = new CircuitBreaker(callGeminiApi, options);
breaker.fallback(() => ({
  text: "O assistente de IA está temporariamente indisponível. Tente novamente em alguns instantes.",
  groundingChunks: []
}));
```

### 14.2 Health Check API (`TerminusModule`)

```
GET /api/v1/health
Resposta:
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "storage": { "status": "up" }
  }
}
```

---

## ETAPA 15 — DOCUMENTAÇÃO E GOVERNANÇA DE APIS (SWAGGER OPENAPI)

O backend NestJS gerará a documentação interativa **OpenAPI 3.0** automaticamente no ambiente de staging:

```typescript
// main.ts (Swagger Config)
const config = new DocumentBuilder()
  .setTitle('Legis Connect API')
  .setDescription('API Corporativa de Plataforma Jurídica SaaS')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

---

## ETAPA 16 — ESTRATÉGIA DE MIGRAÇÃO EM 4 FASES

```
                    CRONOGRAMA DE MIGRAÇÃO DA ARQUITETURA
                    ══════════════════════════════════════

  FASE 1: INFRAESTRUTURA BASE & AUTH (Semanas 1-4)
  ├── Setup NestJS + Prisma + PostgreSQL + Redis
  ├── Implementar AuthModule (JWT, Argon2id, Refresh Token, MFA)
  └── Implementar AuditModule e Health Checks

  FASE 2: DOMÍNIOS CORE DE USUÁRIOS & ROLES (Semanas 5-8)
  ├── Implementar UsersModule, LawyersModule e ClientsModule
  ├── Conectar Frontend React à nova Auth API (substituir localStorage)
  └── Aplicar RBAC e Guards de Multi-Tenancy

  FASE 3: CASOS, DOCUMENTOS, FINANCEIRO & IA (Semanas 9-12)
  ├── Implementar CasesModule, DocumentsModule (S3 Presigned)
  ├── Implementar FinanceModule (Stripe/PagarMe)
  └── Migrar chamadas da Gemini API para o AiGatewayModule

  FASE 4: DESATIVAÇÃO DO LEGADO & HARDENING (Semanas 13-16)
  ├── Remover `dbService.ts`, `staffService.ts` e Mocks do Frontend
  ├── Executar Pentest OWASP API e ajuste de Rate Limits
  └── Lançamento oficial da API TO-BE em Produção
```

---

## ETAPA 17 — BACKLOG TÉCNICO DE APIS (PRIORIZADO)

### API-001 — Setup Inicial do Projeto NestJS Modular Monolith
* **Problema**: Inexistência de estrutura backend no repositório.
* **Solução**: Inicializar aplicação NestJS com TypeScript, ESLint, Prettier, Prisma Client e ConfigModule.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 24h

### API-002 — Implementar Módulo de Autenticação JWT (`AuthModule`)
* **Problema**: Autenticação simulada no cliente com senhas em `btoa`.
* **Solução**: Rotas `/auth/login`, `/auth/refresh`, `/auth/logout` com Argon2id e cookies `httpOnly`.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 60h

### API-003 — Implementar Autenticação Multi-Fator TOTP
* **Problema**: Ausência de 2FA para contas administrativas.
* **Solução**: Rotas `/auth/mfa/setup` e `/auth/mfa/verify` usando `speakeasy`.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 32h

### API-004 — Implementar Middleware e Guards de RBAC e Multi-Tenancy
* **Problema**: Ausência de controle de permissões server-side.
* **Solução**: `@Roles()`, `@Permissions()` Guards e `WorkspaceGuard` aplicando filtro por `workspace_id`.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 40h

### API-005 — Implementar AI Gateway Proxy para Gemini API
* **Problema**: API Key do Gemini exposta no bundle JavaScript da aplicação frontend.
* **Solução**: Módulo `AiGatewayModule` centralizando chamadas ao Gemini com Redis Cache e ThrottlerGuard.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 32h

### API-006 — Implementar Módulo de Usuários e Perfis (`UsersModule`)
* **Problema**: Gerenciamento de usuários armazenado no `localStorage`.
* **Solução**: Rotas CRUD padronizadas para `User`, `LawyerProfile`, `ClientProfile` com DTOs tipados.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Média | **Esforço**: 40h

### API-007 — Implementar Módulo de Casos e Processos (`CasesModule`)
* **Problema**: Casos jurídicos persistem no navegador do cliente sem integridade.
* **Solução**: API de acompanhamento de processos, etapas e vinculação de clientes e advogados.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Alta | **Esforço**: 48h

### API-008 — Implementar Módulo de Upload Seguro de Documentos (`DocumentsModule`)
* **Problema**: Documentos salvos como base64 no `localStorage`.
* **Solução**: Rota `/documents/presign-upload` gerando URLs assinadas do AWS S3 com validação de MIME type.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Alta | **Esforço**: 40h

### API-009 — Implementar Módulo Financeiro e Webhooks (`FinanceModule`)
* **Problema**: Transações financeiras estáticas e simuladas.
* **Solução**: Endpoints de relatórios, lançamentos e Webhook Handler seguro para Stripe/PagarMe.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Alta | **Esforço**: 48h

### API-010 — Implementar Módulo de Auditoria Imutável (`AuditModule`)
* **Problema**: Audit Log armazenado no navegador sem validade jurídica.
* **Solução**: `AuditInterceptor` gravando eventos via Bull Queue no PostgreSQL com HMAC-SHA-256.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 32h

### API-011 — Configurar Documentação Swagger/OpenAPI 3.0 e Envelope REST
* **Problema**: Ausência de documentação de API e respostas despadronizadas.
* **Solução**: Integrar `@nestjs/swagger` e `TransformInterceptor` para padronizar o envelope `{ success, data, meta }`.
* **Prioridade**: 🟡 MÉDIA | **Complexidade**: Baixa | **Esforço**: 16h

### API-012 — Implementar Resiliência e Health Checks (`TerminusModule`)
* **Problema**: Ausência de monitoramento e tratamento de falhas em APIs externas.
* **Solução**: Circuit Breakers com `opossum` e endpoint `/health` validando PostgreSQL, Redis e S3.
* **Prioridade**: 🟡 MÉDIA | **Complexidade**: Média | **Esforço**: 20h

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 007

| Entregável | Status |
|---|---|
| ✅ Auditoria Completa da Comunicação Atual (Fluxo AS-IS Mapeado) | Concluído |
| ✅ Inventário Completo de APIs (14 Endpoints e Serviços Catalogados) | Concluído |
| ✅ Mapeamento de 10 Domínios de API Independentes | Concluído |
| ✅ Arquitetura Backend TO-BE (Diagrama em Camadas: Gateway → NestJS → DB/Redis/S3) | Concluído |
| ✅ Estrutura de Diretórios NestJS Recomendada (Modular Monolith + DDD) | Concluído |
| ✅ Contratos REST v1 Padronizados (Envelope JSON, HTTP Status, Erros e Paginação) | Concluído |
| ✅ Projeto Completo da API de Autenticação (`AuthModule` + JWT + MFA + Refresh) | Concluído |
| ✅ Projeto da API de Usuários e Permissões (`UsersModule` + RBAC/ABAC) | Concluído |
| ✅ Projeto das APIs Jurídicas (`LawyersModule`, `ClientsModule`, `CasesModule`) | Concluído |
| ✅ Projeto da API Financeira (`FinanceModule` + Integrador Stripe/PagarMe) | Concluído |
| ✅ Projeto da API de Documentos (`DocumentsModule` + S3 Presigned URLs + Scan) | Concluído |
| ✅ AI Gateway Proxy (Isolamento de API Key Gemini + Rate Limit + Redis Cache) | Concluído |
| ✅ Matriz OWASP API Security Top 10 com Mitigações | Concluído |
| ✅ Estratégia de Alta Disponibilidade (Circuit Breaker + Health Checks) | Concluído |
| ✅ Documentação e Governança (OpenAPI 3.0 Swagger Setup) | Concluído |
| ✅ Plano de Migração Incremental da Comunicação em 4 Fases (16 semanas) | Concluído |
| ✅ Backlog Técnico de APIs Priorizado (`API-001` a `API-012`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 007 — API Architecture Blueprint | v1.0.0*
*Próximo: PROMPT 008 — Plano Mestre de Engenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
