# 🔌 ENTERPRISE INTEGRATION & CONNECTIVITY BLUEPRINT — LEGIS CONNECT
**PROMPT 019 — Auditoria Completa de Arquitetura de Integrações, APIs Externas, Ecossistema Jurídico e Conectividade Omnichannel**
**Enterprise Integration Architect | API Architect & Distributed Systems Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A arquitetura de integração atual da Legis Connect pauta-se no **acoplamento direto entre o navegador e APIs externas** — destacando-se a chamada direta à API do Google Gemini via `geminiService.ts` sem intermediação de um servidor seguro. Não há uma camada centralizadora de APIs (*API Gateway*), gerenciamento de filas (*Message Broker*), barramento de eventos ou infraestrutura de resiliência a indisponibilidades de parceiros externos.

**Diagnóstico Principal de Integração**:
- **Nível de Maturidade de Conectividade**: `1.0 / 5.0` (Inexistente / Chamadas Diretas no Client).
- **Risco de Exposição de Credenciais**: **CRÍTICO**. `GEMINI_API_KEY` visível em código JavaScript público.
- **Vulnerabilidade Operacional**: Falta de *Rate Limit*, *Circuit Breakers* ou filas de retentativas; qualquer instabilidade na API do Google paralisa o assistente da aplicação.

**Objetivo Arquitetural TO-BE**: Construir o **Enterprise Integration Platform Engine**, implantando uma arquitetura distribuída e orientada a eventos (**Event-Driven Architecture - EDA**) alimentada por um **API Gateway NestJS**, gateways de serviços especializados (*AI Gateway*, *Payment Gateway*, *Notification Gateway*, *Legal Gateway*), mensageria **BullMQ + Redis 7+** (com escalabilidade para **AWS SQS**), suporte a contratos **OpenAPI 3.1 / AsyncAPI** e resiliência via **Opossum Circuit Breakers**.

---

## ETAPA 1 — INVENTÁRIO COMPLETO DAS INTEGRAÇÕES

### 1.1 Matriz de Mapeamento de Integrações Internas e Externas

| Domínio de Integração | Provedor / Sistema Externo | Tipo de Interface | Criticidade | Prioridade TO-BE |
|---|---|---|---|---|
| **Inteligência Artificial** | **Google Gemini 2.5 Flash** (GCP Vertex AI) | REST / Streaming | 🔴 Extrema | 🔴 CRÍTICA (INT-001) |
| **Inteligência Artificial** | **OpenAI GPT-4o** (Fallback / Multi-llm) | REST API | 🟡 Média | 🟡 MÉDIA |
| **Comunicação Transacional** | **SendGrid / AWS SES** (E-mails) | SMTP / REST API | 🔴 Extrema | 🔴 CRÍTICA (INT-002) |
| **Comunicação Omnichannel** | **WhatsApp Business API (Meta Cloud)** | REST Webhooks | 🟠 Alta | 🟠 ALTA |
| **Comunicação SMS / Push** | **Twilio / Firebase Cloud Messaging (FCM)** | REST / WebPush | 🟡 Média | 🟡 MÉDIA |
| **Financeiro / Checkout** | **Stripe Checkout & Subscriptions** | REST / Webhooks | 🔴 Extrema | 🔴 CRÍTICA (INT-003) |
| **Financeiro / Pagamentos** | **Pagar.me / Gerencianet** (PIX Instantâneo) | REST / Webhooks | 🟠 Alta | 🟠 ALTA |
| **Jurídico / Processual** | **API DataJud (Conselho Nacional de Justiça - CNJ)** | REST / JSON | 🟠 Alta | 🟠 ALTA |
| **Jurídico / Assinaturas** | **Clicksign / DocuSign** (ICP-Brasil) | REST / Webhooks | 🟠 Alta | 🟠 ALTA |
| **Armazenamento de Arquivos**| **AWS S3 / Cloudflare R2** | S3 Protocol API | 🔴 Extrema | 🔴 CRÍTICA |

---

## ETAPA 2 — ARQUITETURA GERAL DE INTEGRAÇÕES (TO-BE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ENTERPRISE INTEGRATION ARCHITECTURE (TO-BE)                 │
│                                                                             │
│  [ Clients: Web React 19 / Mobile / Third-Party Integrations ]              │
│                                │                                            │
│                                ▼ HTTPS TLS 1.3                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ CLOUDFLARE WAF + API GATEWAY LAYER (NestJS Gateway Engine)           │   │
│  │ • OAuth 2.1 / JWT Guard   • Rate Limiter (Throttler)   • CORS Policy │   │
│  └─────────────────────────────────┬────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼ Internal VPC / mTLS                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ INTEGRATION GATEWAY MODULES LAYER                                    │   │
│  │                                                                      │   │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │   │
│  │  │ AI Gateway       │ │ Payment Gateway  │ │ Legal Gateway    │  │   │
│  │  │ (Gemini/OpenAI)  │ │ (Stripe/PagarMe) │ │ (DataJud/CNJ)    │  │   │
│  │  └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘  │   │
│  │           │                    │                    │            │   │
│  │  ┌────────┴─────────┐ ┌────────┴─────────┐ ┌────────┴─────────┐  │   │
│  │  │ Notify Gateway   │ │ Storage Gateway  │ │ Identity Gateway │  │   │
│  │  │ (SendGrid/WhatsApp)│ (S3 / R2 Storage)│ │ (Keycloak/OIDC)  │  │   │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘  │   │
│  └─────────────────────────────────┬────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼ Event Bus / Message Broker             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ EVENT-DRIVEN BUS (BullMQ + Redis 7+ / AWS SQS & EventBridge)         │   │
│  └─────────────────────────────────┬────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼ External REST / Webhook Calls          │
│  [ External Providers: Google Vertex AI, Stripe, SendGrid, Meta, CNJ ]       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 3 — ARQUITETURA DO API GATEWAY

* **Engine Selecionada**: **NestJS API Gateway** integrado ao **Cloudflare Enterprise WAF** na borda.
* **Funcionalidades Nativas**:
  - **Authentication & Authorization**: Decodificação e validação de tokens JWT (RSA-256) em tempo de execução.
  - **Rate Limiting & Throttling**: Proteção dinâmica por IP e Usuário autenticado (`@nestjs/throttler`).
  - **Request Transformation & Validation**: Sanitização automática de DTOs via Zod/class-validator.
  - **Circuit Breaking & Bulkhead**: Isolamento de falhas de serviços downstream.

---

## ETAPA 4 — DEBATE ARQUITETURAL: ESB TRADICIONAL VS. EVENT-DRIVEN ARCHITECTURE (EDA)

| Critério de Comparação | ESB Tradicional (MuleSoft, WSO2) | Event-Driven Architecture (EDA + API Gateway) |
|---|---|---|
| **Complexidade de Infra** | 🔴 Altíssima (Barramento pesado monolítico) | 🟢 Otimizada (Desacoplamento leve via Redis/SQS) |
| **Latência de Comunicação** | 🔴 Alta (Transformações pesadas de XML/SOAP) | 🟢 Baixíssima (Eventos assíncronos JSON em tempo real) |
| **Manutenibilidade** | 🔴 Difícil (Regras de negócio presas no ESB) | 🟢 Excelente (Regras isoladas em Micro-services/Modules) |
| **DECISÃO LEGIS CONNECT** | Descartado | **RECOMENDADO (Event-Driven Architecture)** |

---

## ETAPA 5 — ARQUITETURA DE MENSAGERIA ASSÍNCRONA (`BullMQ + Redis 7+`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARQUITETURA DE FILAS E EVENTOS BULLMQ                    │
│                                                                             │
│  [ Evento de Origem ] ──► NestJS EventPublisher                            │
│                                  │                                          │
│                                  ▼ Push Job                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ BullMQ Queue System (AWS ElastiCache Redis 7+)                       │   │
│  │ ├── queue.notifications  ──► Worker SendGrid / Meta WhatsApp (3 retries)│
│  │ ├── queue.audit-logs     ──► Worker Audit HMAC Inserter (Batch 100)    │   │
│  │ ├── queue.webhooks       ──► Worker Outbound Webhook Delivery com DLQ  │   │
│  │ └── queue.ai-embeddings  ──► Worker pgvector Embedding Generator       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 6 — INTEGRAÇÃO COM INTELIGÊNCIA ARTIFICIAL (AI GATEWAY PROXY)

### 6.1 Especificação do `AiGatewayModule`

```typescript
// features/ai/ai-gateway.service.ts
import { Injectable, BadGatewayException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { PiiSanitizerService } from '../../security/pii-sanitizer.service';
import { RedisService } from '../../shared/redis/redis.service';

@Injectable()
export class AiGatewayService {
  private aiClient: GoogleGenAI;

  constructor(
    private piiSanitizer: PiiSanitizerService,
    private redisCache: RedisService,
  ) {
    this.aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateCaseSummary(prompt: string, userId: string): Promise<string> {
    // 1. Sanitizar PII do Prompt antes de enviar à API externa
    const sanitizedPrompt = this.piiSanitizer.sanitize(prompt);
    
    // 2. Verificar Cache de Respostas no Redis (Evita custos desnecessários)
    const cacheKey = `ai_cache:${Buffer.from(sanitizedPrompt).toString('base64')}`;
    const cachedResponse = await this.redisCache.get(cacheKey);
    if (cachedResponse) return cachedResponse;

    // 3. Chamada Segura Server-Side à API do Gemini
    try {
      const response = await this.aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: sanitizedPrompt,
      });
      
      const resultText = response.text || '';
      await this.redisCache.set(cacheKey, resultText, 86400); // Cache 24h
      return resultText;
    } catch (error) {
      throw new BadGatewayException('Serviço de IA temporariamente indisponível.');
    }
  }
}
```

---

## ETAPA 7 — INTEGRAÇÕES JURÍDICAS (DATAJUD CNJ & ASSINATURA DIGITAL)

```
                            INTEGRAÇÕES JURÍDICAS TO-BE
                            ═══════════════════════════

  • API DataJud CNJ ────────► Consulta pública unificada de andamento de processos judiciais.
  • Validador OAB Federal ──► Confirmação em tempo real de status ativo de advogados cadastrados.
  • Clicksign / DocuSign ───► Emissão de contratos de honorários com assinatura ICP-Brasil.
```

---

## ETAPA 8 — INTEGRAÇÃO FINANCEIRA & CHECKOUT (STRIPE & PIX)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE PAGAMENTO E WEBHOOKS STRIPE                     │
│                                                                             │
│  1. Cliente ───────► POST /api/v1/finance/checkout ──► Gera Stripe Session  │
│  2. Cliente ───────► Redirecionado para Checkout Stripe Seguro              │
│  3. Stripe ────────► Webhook Event `checkout.session.completed`             │
│                        │                                                    │
│                        ▼ Assinatura HMAC-SHA-256 (`stripe-signature`)       │
│  4. Backend NestJS ─► Valida evento + Libera acesso em `ServiceProvisionings`│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 9 — PLATAFORMA DE COMUNICAÇÃO OMNICHANNEL

* **Notification Engine (`NotificationService`)**: Serviço centralizado abstraindo o canal de envio conforme preferência do usuário final:
  - **E-mail**: Transacional via **SendGrid / AWS SES** (Templates HTML estilizados).
  - **WhatsApp**: Notificações formais de andamento processual via **WhatsApp Business Cloud API (Meta)**.
  - **Push Notification**: Alertas instantâneos em tempo real no browser/mobile via **Firebase Cloud Messaging (FCM)**.

---

## ETAPA 10 — INFRAESTRUTURA DE WEBHOOKS COM DEAD LETTER QUEUE (DLQ)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   INFRAESTRUTURA OUTBOUND WEBHOOKS                          │
│                                                                             │
│  Evento de Negócio ──► Delivery Worker ──► POST Endpoint do Cliente         │
│                              │ (Timeout 10s)                                │
│                              ├──► Sucesso (HTTP 200/204) ──► Log OK         │
│                              └──► Falha (HTTP 5xx / Timeout)                │
│                                     │                                       │
│                                     ▼ Retry com Exponential Backoff         │
│                                  Tentativa 1 (1 min) ──► Tentativa 2 (5 min)│
│                                     │                                       │
│                                     ▼ Se falhar 5x                          │
│                                  Mover para Dead Letter Queue (DLQ) + Alert │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 11 — CATÁLOGO DE EVENTOS DE NEGÓCIO (EVENT-DRIVEN CATALOG)

| Nome do Evento | Tópico / Event Schema | Payload Principal | Consumidores Assíncronos |
|---|---|---|---|
| **`user.registered`** | `legis.identity.user_registered` | `{ userId, email, role, workspaceId }` | NotificationService, AuditService |
| **`lawyer.approved`** | `legis.legal.lawyer_approved` | `{ lawyerId, oabNumber, workspaceId }` | MailerService, IndexerService |
| **`case.created`** | `legis.cases.case_created` | `{ caseId, title, clientId, lawyerId }` | DataJudSyncService, AuditService |
| **`payment.confirmed`** | `legis.finance.payment_confirmed`| `{ invoiceId, amount, workspaceId }` | ProvisioningService, InvoiceService |
| **`document.uploaded`** | `legis.docs.document_uploaded` | `{ docId, s3Bucket, s3Key, mimeType }` | ClamAVScanner, VectorEmbeddingService |

---

## ETAPA 12 — ARMAZENAMENTO ENTERPRISE (AWS S3 & CLOUDFLARE R2)

* **AWS S3 Bucket Principal (`legis-documents-prod`)**: Armazenamento seguro criptografado com SSE-KMS, versionamento ativado e retenção imutável para documentos de processos.
* **Cloudflare R2 (Borda)**: Utilizado para assets estáticos e anexos públicos de suporte com **custo zero de transferência de dados de saída (Zero Egress Fees)**.

---

## ETAPA 13 — ESTRATÉGIA DE VERSIONAMENTO DE APIS (`/api/v1/`)

* **Padrão de URL**: Versionamento explícito na URI (`/api/v1/cases`, `/api/v2/cases`).
* **Depreciação Controlada**: Janela de manutenção de **12 meses** para APIs legadas, alertando clientes terceiros via Header HTTP `X-API-Deprecated: true` e `X-API-Sunset: 2027-07-25`.

---

## ETAPA 14 — CONTRATOS DE API & DOCUMENTAÇÃO AUTOMATIZADA

```
                               CONTRATOS DE INTEGRABILIDADE
                               ═════════════════════════════

  • REST API Specification ───► OpenAPI 3.1 gerado automaticamente via NestJS Swagger.
  • Event Bus Specification ──► AsyncAPI 2.6 documentando mensagens do Redis e BullMQ.
  • Validation Schemas ───────► Schemas Zod automatizados para requisições e respostas.
```

---

## ETAPA 15 — RESILIÊNCIA E PADRÕES INTEGRATIVOS EIP (`Opossum`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PADRÕES DE RESILIÊNCIA EIP APLICADOS                     │
│                                                                             │
│  1. RETRY WITH JITTER ────► Tenta novamente 3 vezes com tempo aleatório     │
│  2. CIRCUIT BREAKER ──────► Abre após 50% de falhas, bloqueando chamadas    │
│  3. BULKHEAD ISOLATION ───► Limita máximo de 10 conexões concorrentes p/ API │
│  4. FALLBACK HANDLER ─────► Retorna resposta padrão limpa se o parceiro cair│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 16 — OBSERVABILIDADE DAS INTEGRAÇÕES (OPENTELEMETRY)

* **Dashboard Grafana de Conectividade**:
  - Latência p95/p99 de chamadas ao Google Gemini, Stripe e SendGrid.
  - Taxa de sucesso de envios de Webhooks.
  - FinOps Token Tracking (Custo consolidado por chamada de IA).

---

## ETAPA 17 — SEGURANÇA DAS INTEGRAÇÕES

```
                               SECURITY INTEGRATION CHECKLIST
                               ══════════════════════════════

  [x] Comunicação exclusivamente via TLS 1.3 Criptografada
  [x] Assinatura de Webhooks Outbound via HMAC-SHA-256 com Secret por Tenant
  [x] mTLS (Mutual TLS) para conexões diretas com APIs Governamentais / Tribunais
  [x] Credenciais isoladas no AWS Secrets Manager (Zero Hardcoded Keys)
```

---

## ETAPA 18 — GOVERNANÇA DE APIS

* **API Catalog & Developer Portal**: Catálogo interativo de APIs públicas para integração de grandes escritórios jurídicos.
* **Ownership por Squad**: Cada endpoint de API ou evento de fila possui uma equipe proprietária responsável por manter a documentação OpenAPI e o SLA contratual.

---

## ETAPA 19 — ESTRATÉGIA DE TESTES DE INTEGRAÇÃO (`Pact & WireMock`)

* **Contract Testing com Pact**: Teste de contrato garantindo que a comunicação entre o frontend React e a API NestJS permaneça 100% compatível sem necessidade de subir o backend completo em desenvolvimento.
* **Mocks de APIs Externas com WireMock / Nock**: Simulação de respostas do Stripe, SendGrid e Google Gemini em ambiente de homologação.

---

## ETAPA 20 — ROADMAP DE EVOLUÇÃO DAS INTEGRAÇÕES

```
                    ROADMAP DE PLATAFORMA DE INTEGRAÇÃO
                    ═══════════════════════════════════

  FASE 1: INTEGRATION BASE & AI GATEWAY (Semanas 1-4)
  ├── Deploy do API Gateway NestJS + Cloudflare WAF
  ├── Isolamento da credencial do Gemini no `AiGatewayModule`
  └── Setup de Filas Assíncronas com BullMQ + Redis 7+

  FASE 2: FINANCEIRO, NOTIFICAÇÕES & WEBHOOKS (Semanas 5-8)
  ├── Gateway de Pagamentos (Stripe Checkout + Webhooks HMAC)
  ├── Plataforma Notification Engine (SendGrid + WhatsApp Cloud API)
  └── Infraestrutura Outbound Webhooks com DLQ

  FASE 3: ECOSSISTEMA JURÍDICO & DATAJUD (Semanas 9-12)
  ├── Conectores para a API DataJud do Conselho Nacional de Justiça
  ├── Integração com Clicksign / DocuSign (Assinaturas ICP-Brasil)
  └── Contratos de API OpenAPI 3.1 & AsyncAPI públicos
```

---

## ETAPA 21 — BACKLOG TÉCNICO DE INTEGRAÇÕES

### INT-001 — Construir o Proxy Módulo de IA (`AiGatewayModule`)
* **Problema**: `GEMINI_API_KEY` exposta publicamente no bundle JS do cliente.
* **Solução**: Mudar chamada para o backend NestJS com sanitização PII e Redis Cache.
* **Prioridade**: 🔴 EMERGENCIAL | **Complexidade**: Média | **Esforço**: 32h

### INT-002 — Plataforma Notification Engine Omnichannel
* **Problema**: Disparo de e-mails/alertas direto pelo client-side sem retries.
* **Solução**: NotificationService com BullMQ despachando SendGrid, WhatsApp e FCM.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 48h

### INT-003 — Webhook Gateway Stripe com Validação HMAC-SHA-256
* **Problema**: Processamento de pagamentos desprotegido no cliente.
* **Solução**: Endpoint `/api/v1/payments/webhook` validando o cabeçalho `stripe-signature`.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 32h

### INT-004 — Implementar Padrões de Resiliência Opossum (Circuit Breaker)
* **Problema**: Queda de serviços de terceiros (IA/Stripe) travando a API.
* **Solução**: Circuit Breaker, Retries com Jitter e Fallback Handlers no NestJS.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Média | **Esforço**: 24h

### INT-005 — Conector API DataJud CNJ para Consulta Processual
* **Problema**: Dificuldade em atualizar o status de processos de forma automática.
* **Solução**: Integração assíncrona consumindo a API oficial do DataJud CNJ.
* **Prioridade**: 🟠 ALTA | **Complexidade**: Alta | **Esforço**: 40h

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 019

| Entregável | Status |
|---|---|
| ✅ Inventário Completo das Integrações (Mapeamento de Criticidade e Prioridade) | Concluído |
| ✅ Arquitetura Geral de Integração (Diagrama Multi-Layer TO-BE) | Concluído |
| ✅ Projeto do API Gateway (NestJS Gateway + Cloudflare WAF) | Concluído |
| ✅ Comparativo ESB Tradicional vs. Event-Driven Architecture (EDA Chosen) | Concluído |
| ✅ Arquitetura de Mensageria Assíncrona (BullMQ + Redis 7+ Cluster) | Concluído |
| ✅ AI Gateway Proxy (Isolamento Gemini, Sanitização PII, Redis Cache) | Concluído |
| ✅ Plano de Integrações Jurídicas (API DataJud CNJ + Assinaturas ICP-Brasil) | Concluído |
| ✅ Arquitetura Financeira (Stripe Checkout + Webhooks HMAC-SHA-256) | Concluído |
| ✅ Plataforma Omnichannel (SendGrid, WhatsApp Cloud API, FCM Push) | Concluído |
| ✅ Infraestrutura de Webhooks (Exponential Backoff + Dead Letter Queue DLQ) | Concluído |
| ✅ Catálogo de Eventos de Negócio EDA (Event Schemas Mapeados) | Concluído |
| ✅ Arquitetura de Armazenamento (AWS S3 SSE-KMS + Cloudflare R2 Zero Egress) | Concluído |
| ✅ Estratégia de Versionamento de APIs (URI `/api/v1/` + Deprecation Policy) | Concluído |
| ✅ Especificações de Contrato (OpenAPI 3.1 + AsyncAPI 2.6) | Concluído |
| ✅ Estratégia de Resiliência EIP (Retry, Circuit Breaker Opossum, Fallback) | Concluído |
| ✅ Plano de Observabilidade de Integrações (OpenTelemetry + Grafana Dashboard) | Concluído |
| ✅ Cibersegurança de Integrações (TLS 1.3, mTLS, Secret Manager) | Concluído |
| ✅ Modelo de Governança de APIs (API Catalog & Developer Portal) | Concluído |
| ✅ Estratégia de Testes de Integração (Pact Contract Testing & WireMock) | Concluído |
| ✅ Roadmap Evolutivo de Integrações em 3 Fases (12 semanas) | Concluído |
| ✅ Backlog Técnico de Integrações Priorizado (`INT-001` a `INT-005`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 019 — Enterprise Integration & Connectivity Blueprint | v1.0.0*
*Próximo: PROMPT 020 — Plano Mestre de Reengenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
