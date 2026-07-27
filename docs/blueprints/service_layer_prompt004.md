# ⚙️ SERVICE LAYER ARCHITECTURE BLUEPRINT — LEGIS CONNECT
**PROMPT 004 — Auditoria Completa da Camada de Serviços e Regras de Negócio**
**Arquiteto Backend Enterprise | Domain-Driven Design Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A camada de serviços da Legis Connect é tecnicamente **a mais bem estruturada do projeto**. Ao contrário de muitas plataformas na mesma fase, os serviços têm interfaces claras, documentação inline, padrões de RBAC granular e até uma máquina de estados de provisionamento funcional. O `auditLogger.ts`, o `rbac.ts` e o `cryptoUtils.ts` são, especialmente, módulos de qualidade enterprise.

**O problema central, porém, é de posicionamento**: toda esta camada existe e executa **no navegador do cliente**. Lógica de negócio, autenticação, auditoria, criptografia e integração com IA rodam no dispositivo do usuário — onde qualquer pessoa pode interceptar, modificar ou burlar o comportamento esperado.

**Diagnóstico Central**: Os serviços estão prontos para serem migrados. A arquitetura pensada (Repository Pattern, State Machine, RBAC, Chain-of-Trust no audit log) é exatamente o que um backend NestJS enterprise precisaria. O trabalho de migração é de **extração**, não de redesign.

---

## ETAPA 1 — INVENTÁRIO COMPLETO DOS SERVIÇOS

### 1.1 Mapa Geral de Serviços

| Serviço | Arquivo | Tamanho | Linhas | Responsabilidade | Consumidores Principais | Situação |
|---|---|---|---|---|---|---|
| **dbService** | `services/dbService.ts` | 24 KB | 562 | Persistência geral: config, docs, financial, legal codes + stubs cloud | FinanceTab, LawyerDashboard, SettingsTab | 🟡 Funcional/Local |
| **geminiService** | `services/geminiService.ts` | 5.6 KB | 141 | Integração IA: análise de caso, busca Maps, chatbot | LawyerSearch, ChatbotModal, LegalAiTools | 🔴 Crítico — API Key exposta |
| **provisioningService** | `services/provisioningService.ts` | 16.5 KB | 439 | Motor de provisionamento: state machine, payment webhook, credits | EfficiencyServicesPage, AdminCommandsTab | 🟡 Bem projetado/Local |
| **staffService** | `services/staffService.ts` | 9.5 KB | 296 | CRUD de colaboradores internos + autenticação + RBAC | SettingsTab, StaffManagementTab | 🟡 Funcional/Local |
| **auditLogger** | `security/auditLogger.ts` | 10 KB | 261 | Log de auditoria append-only com hash chain | provisioningService, staffService, App.tsx | 🔴 Hash inseguro / localStorage |
| **cryptoUtils** | `security/cryptoUtils.ts` | 7.9 KB | 203 | AES-GCM encryption, SHA-256 hash, masks, sanitização, validação CPF/CNPJ | Potencial uso em vários locais | 🟡 Implementação correta — subutilizada |
| **rbac** | `security/rbac.ts` | 7.5 KB | 190 | RBAC: roles, permissões, hierarquia, funções de verificação | AdminDashboard, StaffManagementTab | 🔴 RBAC client-side — bypassável |
| **mockLawyerService** | `services/mockLawyerService.ts` | — | — | Dados mock de advogados (seed) | AppDataContext | 🔴 Dados hardcoded em prod |
| **mockDataService** | `services/mockDataService.ts` | — | — | Dados mock de clientes, estagiários, secretárias + hashPassword (btoa) | AppDataContext, App.tsx, staffService | 🔴 btoa como hash de senha |
| **agendaService** | `services/agendaSync.ts` | — | — | Sincronização de agenda (Google Calendar stub) | LawyerDashboard (AgendaSync) | 🟡 Stub não funcional |
| **mapsService** | (via geminiService.findPlaces) | — | — | Busca geolocalizada via Gemini Maps Grounding | LawyerSearch | 🔴 API Key exposta |

### 1.2 Diagrama de Dependências entre Serviços

```
App.tsx
 ├── mockDataService (hashPassword, AdminUser seed)
 └── AppDataContext
       ├── mockLawyerService (seed inicial)
       └── mockDataService (seed inicial)

SettingsTab
 ├── dbService (dbConfig, dbDocuments, dbFinancial, dbCodes)
 ├── staffService
 └── auditLogger

provisioningService
 └── auditLogger

staffService
 ├── auditLogger
 └── mockDataService (hashPassword)

geminiService ← API Key direta no bundle (process.env.API_KEY)
  ↑
  LawyerSearch, ChatbotModal, LegalAiTools, LawyerDashboard

rbac ← usado por componentes para verificação local
  ↑
  AdminDashboard, SettingsTab (verificações de UI)
```

---

## ETAPA 2 — AUDITORIA DO dbService

### 2.1 Análise Completa

**Arquivo**: `services/dbService.ts` (562 linhas / 24KB)

O `dbService.ts` é o módulo mais rico e complexo. Contém **5 sub-serviços independentes** exportados como objetos:

| Sub-serviço | Responsabilidade | Métodos | Entidade |
|---|---|---|---|
| `dbCloud` | Stubs Firebase/Supabase REST | `testConnection`, `saveDocument`, `getDocument`, `deleteDocument`, `saveList`, `getList` | Todas |
| `dbConfig` | Config da plataforma (branding, db) | `get()`, `set()` | `AppConfig` |
| `dbDocuments` | Documentos recebidos pelos advogados | `getAll(lawyerId?)`, `add()`, `remove()` | `ReceivedDocument` |
| `dbFinancial` | Transações financeiras | `getAll(lawyerId?)`, `update()` | `FinancialTransaction` |
| `dbCodes` | Códigos jurídicos com versionamento | `getAll()`, `saveAll()`, `update()`, `addVersion()`, `deleteVersion()`, `activateVersion()`, `reset()` | `LegalCode`, `CodeVersion` |

### 2.2 Problemas Técnicos por Sub-serviço

#### `dbCloud` — Stub Funcional Mas Desconectado
```typescript
// dbService.ts L141–307
export const dbCloud = {
  async testConnection(provider, apiKey, projectId): Promise<boolean>,
  async saveDocument(collection, docId, data, ...): Promise<void>,
  async getDocument(collection, docId, ...): Promise<T | null>,
  async deleteDocument(collection, docId, ...): Promise<void>,
  async saveList(collection, list, ...): Promise<void>,
  async getList(collection, ...): Promise<T[] | null>,
};
```

**Problema Crítico**: `dbCloud` nunca é chamado pelo `AppDataContext`.
Apenas `dbConfig.set()`, `dbDocuments.add()`, `dbDocuments.remove()`, `dbFinancial.update()` e `dbCodes.saveAll()` condicionalmente chamam `dbCloud.saveDocument()` — mas **somente para estas entidades**.

Lawyers, clients, interns, secretaries, staff e provisioning **nunca sincronizam com cloud**, mesmo com `dbType === 'cloud'` configurado.

**Resultado prático**: O botão "Ativar Cloud" no painel de settings dá a falsa impressão de sincronização real. Nenhum dado de usuários é sincronizado.

#### `dbConfig` — Credenciais em Plaintext
```typescript
// dbService.ts L311–324
export const dbConfig = {
  get(): AppConfig {              // lê de localStorage.legis_app_config
    return load<AppConfig>(KEYS.config, DEFAULT_CONFIG);
  },
  set(config: Partial<AppConfig>): AppConfig {
    // Persiste dbApiKey, dbAuthDomain, dbProjectUrl em plaintext no localStorage
    save(KEYS.config, updated);
  },
};
// 🔴 CRÍTICO: dbApiKey é uma credencial de produção salva em plaintext
```

#### `dbDocuments` — Documentos Jurídicos como Base64
```typescript
// dbService.ts L326–348
interface ReceivedDocument {
  dataUrl: string;  // ← PDF completo em base64! Pode ter megabytes
  lawyerId?: number;
}
// 🔴 Documentos jurídicos sigilosos em localStorage
// Limite de 5-10MB pode ser excedido com poucos PDFs
// Sem ACL — qualquer pessoa com acesso ao browser vê todos os documentos
```

#### `dbFinancial` — Self-Seeding Problemático
```typescript
// dbService.ts L364–386
getAll(lawyerId?: number): FinancialTransaction[] {
  const stored = load<FinancialTransaction[]>(KEYS.financialTx, []);
  if (stored.length === 0) {
    save(KEYS.financialTx, MOCK_TRANSACTIONS); // ← Seed automático em produção!
    return MOCK_TRANSACTIONS;
  }
  return stored;
},
// 🔴 Se a chave for deletada, dados mock de 10 transações voltam automaticamente
// 🔴 lawyerId ignorado: getAll(lawyerId?) — parâmetro sem efeito real
```

#### `dbCodes` — Funcionalidade Mais Rica; Dados de Conteúdo Jurídico
O `dbCodes` tem versionamento, migração automática e suporte a PDF (base64). É funcionalmente o módulo mais bem implementado — mas expõe conteúdo jurídico inteiro (artigos de lei com versões) no localStorage.

### 2.3 Fluxo Atual vs. Proposto

```
ATUAL:
  Componente → dbService.[módulo].método() → localStorage.setItem()
                     ↑ Sem React state      ← Mudanças não causam re-render!

PROPOSTO (NestJS + Prisma):
  Componente
    ↓ useQuery / useMutation (TanStack Query)
  API Hook (ex: useDocuments(), useFinancialData())
    ↓ axios.get/post
  NestJS Controller (DocumentsController, FinanceController)
    ↓ Application Service (DocumentsService, FinanceService)
  Repository Interface
    ↓ Prisma Repository
  PostgreSQL (fonte de verdade única)
```

### 2.4 Mapeamento de Entidades para Migração

| Entidade dbService | Tabela PostgreSQL | Módulo NestJS | Prioridade |
|---|---|---|---|
| `AppConfig` | `platform_config` | `ConfigModule` | 🟡 Média |
| `ReceivedDocument` | `documents` | `DocumentsModule` | 🔴 Alta |
| `FinancialTransaction` | `transactions` | `FinanceModule` | 🔴 Alta |
| `LegalCode` + `CodeVersion` | `legal_codes`, `legal_code_versions` | `LegalCodesModule` | 🟡 Média |

---

## ETAPA 3 — AUDITORIA DO geminiService

### 3.1 Análise Completa

**Arquivo**: `services/geminiService.ts` (141 linhas / 5.6KB)

```typescript
// geminiService.ts L1–14 — O problema começa aqui:
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  try {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || 'dummy_key' });
    //                                ↑ API KEY DO GEMINI INJETADA NO BUNDLE VITE
    //                                ↑ Qualquer usuário pode ver: DevTools → Sources
  } catch {
    return null;
  }
};
const ai = getAI(); // ← Instância global exposta no bundle JS
```

### 3.2 Três Funções e Seus Problemas

#### `analyzeCaseWithGemini()` — Análise jurídica exposta ao público
```typescript
// geminiService.ts L15–77
export async function analyzeCaseWithGemini(description: string): Promise<CaseAnalysis>
// Problema: Chamada direta do frontend ao Gemini com API Key exposta
// Sem rate limiting → um usuário pode fazer 1.000 requests/minuto
// Sem logging → sem rastreabilidade de uso
// Sem validação de input → prompt injection possível
// Custo: a cada query o usuário gasta tokens da conta do dono da plataforma
```

#### `findPlacesWithMaps()` — Google Maps Grounding exposto
```typescript
// geminiService.ts L79–115
export async function findPlacesWithMaps(description: string, location?): Promise<MapsSearchResult>
// Problema idêntico ao anterior + uso de config tipada como 'any'
// config: any → sem type safety na configuração do Google Maps tool
// Falha silenciosa: retorna texto vazio em vez de lançar erro
```

#### `chatWithGemini()` — Chatbot sem persistência de contexto seguro
```typescript
// geminiService.ts L118–140
export async function chatWithGemini(history: ChatMessage[], newMessage: string): Promise<string>
// Histórico do chat mantido no estado do App.tsx (sem persistência segura)
// System instruction embarcada no bundle — visível a qualquer pessoa
// Sem verificação se o usuário está autenticado antes de chamar a API
```

### 3.3 Vetores de Ataque Específicos

| Vetor | Descrição | Impacto |
|---|---|---|
| **API Key Exfiltration** | `process.env.API_KEY` visível em DevTools → Sources | 🔴 Custo ilimitado na conta; vazamento de credencial |
| **Prompt Injection** | `analyzeCaseWithGemini(description)` — `description` vem diretamente do usuário sem sanitização | 🔴 Manipulação da análise jurídica; jailbreak |
| **Cost Amplification** | Sem rate limit → DDoS econômico | 🔴 Fatura Gemini pode explodir |
| **System Instruction Leak** | System prompts visíveis no bundle minificado | 🟡 Médio — facilita contornar as restrições |
| **Unauthenticated Access** | `chatWithGemini()` chamado sem verificar autenticação | 🟡 Uso gratuito por não-usuários |

### 3.4 Arquitetura Proposta — AI Gateway

```
Frontend (Componente React)
         │
         ▼
useAiAnalysis() hook       ← TanStack Query useMutation
         │
         ▼
POST /api/ai/analyze-case  ← NestJS AiGatewayController
         │
         ▼
AiGatewayService (NestJS)
  ├── Verificação JWT (usuário autenticado?)
  ├── RBAC check (has 'ai:use' permission?)
  ├── Rate Limiter (Throttler) — ex: 20 req/min por usuário
  ├── Input Sanitization (removeDangerousPatterns)
  ├── Prompt Construction (monta o prompt de forma segura)
  ├── Cache Layer (Redis — evita chamadas duplicadas)
  ├── Gemini SDK call (API Key apenas no servidor .env)
  ├── Response Validation (valida schema da resposta)
  ├── Usage Logger (registra tokens consumidos por usuário)
  └── Retry Logic (exponential backoff em caso de erro)
         │
         ▼
Retorna CaseAnalysis ao frontend
```

### 3.5 Módulo NestJS — AiGatewayModule

```typescript
// Estrutura do módulo:
src/modules/ai-gateway/
 ├── ai-gateway.module.ts
 ├── ai-gateway.controller.ts     ← POST /api/ai/analyze-case
 │                                   POST /api/ai/chat
 │                                   POST /api/ai/find-lawyers (Maps)
 ├── ai-gateway.service.ts        ← Lógica de negócio + Gemini SDK
 ├── ai-rate-limiter.guard.ts     ← ThrottlerGuard customizado por usuário
 ├── dto/
 │    ├── analyze-case.dto.ts     ← Zod/class-validator schema
 │    └── chat-message.dto.ts
 └── interceptors/
      └── ai-usage-logger.interceptor.ts ← Registra tokens por userID
```

---

## ETAPA 4 — AUDITORIA DO provisioningService

### 4.1 Análise Completa

**Arquivo**: `services/provisioningService.ts` (439 linhas / 16.5KB)

O `provisioningService` é o módulo **com o melhor design arquitetural** do projeto. Implementa:
- Idempotência por `paymentId` (L254–259)
- State Machine explícita: `PENDING → IN_PROGRESS → PROVISIONED | PROVISION_FAILED`
- Retry com limite (3 tentativas máximas) (L316–318)
- Audit logging em cada transição
- Separação de provisionamento por grupo (client, lawyer, intern, secretary)
- Interface compatível com Stripe e PagarMe (`invoice.paid`, `charge.successful`)

**O código é correto. O ambiente é errado.**

### 4.2 State Machine Documentada

```
                        [processPaymentWebhook()]
                                  │
                                  ▼
                              PENDING ←─────────── retryProvisioning()
                                  │                     (max 3 retries)
                    [runProvisioningStateMachine()]
                                  │
                                  ▼
                            IN_PROGRESS
                           /            \
                   (sucesso)            (falha / random 5%)
                      │                       │
                      ▼                       ▼
                 PROVISIONED          PROVISION_FAILED
                      │
              [provisionForClient|Lawyer|Intern()]
                      │
              localStorage.setItem()  ← PROBLEMA
              (features/credits por userId)
```

### 4.3 Problemas Críticos de Posicionamento

| Problema | Código | Impacto |
|---|---|---|
| **State Machine no browser** | `runProvisioningStateMachine()` chamada no frontend | 🔴 Estado de pagamento pode ser manipulado via DevTools |
| **localStorage como banco de provisionamento** | `writeProvisionings(all)` — L28–30 | 🔴 Dados de compras perdidos ao limpar o browser |
| **Features de crédito no browser** | `localStorage.setItem(LAWYER_CREDITS_KEY, ...)` — L112 | 🔴 Usuário pode adicionar tokens de IA ilimitados no DevTools |
| **Webhook simulado no frontend** | `processPaymentWebhook()` nunca recebe webhook real de Stripe | 🟠 Sem integração de pagamento real |
| **Fire-and-forget sem persistência** | `runProvisioningStateMachine(prov).catch()` — L294–296 | 🟠 Falha silenciosa sem retry automático |
| **Sem SLA real** | `PROVISION_SLA_MS = 30_000` — L18 — nunca usado em timeout real | 🟡 SLA definida mas não implementada |

### 4.4 Problema de Segurança — Injeção de Créditos

```javascript
// Ataque: usuário abre DevTools → Console:
localStorage.setItem('legis_lawyer_credits', JSON.stringify({
  "user_123": {
    "ai_tokens": 999999,
    "tribunal_bots": 99,
    "client_limit": 9999,
    "premium_calendar": true
  }
}));
// Resultado: usuário tem créditos ilimitados sem pagar nada
```

### 4.5 Proposta — Provisioning Domain (NestJS)

```
src/modules/provisioning/
 ├── provisioning.module.ts
 ├── domain/
 │    ├── entities/
 │    │    ├── Provisioning.entity.ts      ← Entidade rica com state machine
 │    │    └── ProvisioningCredit.entity.ts
 │    ├── value-objects/
 │    │    ├── ProvisioningStatus.vo.ts    ← PENDING|IN_PROGRESS|PROVISIONED|FAILED
 │    │    └── ServiceGroup.vo.ts          ← client|lawyer|intern|secretary
 │    ├── events/
 │    │    ├── ProvisioningStarted.event.ts
 │    │    ├── ProvisioningCompleted.event.ts
 │    │    └── ProvisioningFailed.event.ts
 │    └── state-machine/
 │         └── ProvisioningStateMachine.ts ← XState ou classe pura
 │
 ├── application/
 │    ├── use-cases/
 │    │    ├── ProcessPaymentWebhook.usecase.ts  ← POST /webhooks/stripe
 │    │    ├── RetryProvisioning.usecase.ts
 │    │    └── GetProvisioningStatus.usecase.ts
 │    └── services/
 │         └── ProvisioningService.ts
 │
 ├── infrastructure/
 │    ├── persistence/
 │    │    └── ProvisioningPrismaRepository.ts   ← PostgreSQL
 │    ├── queue/
 │    │    └── provisioning.processor.ts          ← Bull Queue (assíncrono)
 │    └── stripe/
 │         └── StripeWebhookGuard.ts             ← Valida assinatura Stripe
 │
 └── presentation/
      ├── provisioning.controller.ts
      └── webhooks/
           └── stripe-webhook.controller.ts
```

---

## ETAPA 5 — AUDITORIA DO staffService

### 5.1 Análise Completa

**Arquivo**: `services/staffService.ts` (296 linhas / 9.5KB)

O `staffService` tem design adequado para um serviço CRUD. Implementa:
- Autenticação com `authenticate()` (email + hash de senha)
- Soft-delete via `setActive()` — compliance LGPD (nunca apaga, desativa)
- Auditoria integrada em todas as operações mutantes
- Seed inicial com 5 colaboradores de diferentes roles

**Problema único mas fatal**: executa no browser.

### 5.2 Análise de Autenticação do Staff

```typescript
// staffService.ts L148–167
authenticate(email: string, password: string): Omit<PlatformStaff, 'password'> | null {
  const staff = this.findByEmail(email);
  if (!staff) return null;
  if (!staff.active) return null;

  const hashed = hashPassword(password);  // ← btoa("legis:" + password)
  if (staff.password !== hashed) return null;
  // ↑ Comparação de hash insegura — btoa é reversível em milissegundos
  // ↑ A comparação ocorre no browser — não há blindagem server-side

  // Atualiza lastLogin — persiste no localStorage
  writeStaff(all);  // ← Dados de autenticação salvos no mesmo localStorage
  return safeStaff;
}
```

**Ataque ao staff**:
```javascript
// DevTools → Console:
const staff = JSON.parse(localStorage.getItem('legis_platform_staff'));
console.log(staff.map(s => ({email: s.email, hash: s.password})));
// Resultado: tabela completa de emails + hashes btoa de todos os colaboradores
// atob(hash.replace('legis_hash_', '')) → reverte qualquer senha
```

### 5.3 RBAC do Staff — 5 Roles Granulares (Bem Projetado)

| Role | Nível | Permissões Principais |
|---|---|---|
| `super_admin` | 100 | Tudo + impersonation + manage_staff |
| `admin` | 80 | Read/write + finance + registrations + audit:read |
| `staff_compliance_auditor` | 60 | Apenas audit + registrations:read |
| `staff_finance_admin` | 40 | Apenas finance + provisioning |
| `staff_support_l1` | 20 | Apenas registrations:read + audit:read |

Este modelo de RBAC é excelente e deve ser **transplantado diretamente** para o NestJS como Guards.

### 5.4 Proposta — Staff Module (NestJS)

```
src/modules/staff/
 ├── staff.module.ts
 ├── domain/
 │    ├── entities/
 │    │    └── PlatformStaff.entity.ts
 │    └── value-objects/
 │         └── StaffRole.vo.ts
 ├── application/
 │    ├── use-cases/
 │    │    ├── CreateStaff.usecase.ts
 │    │    ├── UpdateStaff.usecase.ts
 │    │    ├── DeactivateStaff.usecase.ts  ← Soft-delete (compliance)
 │    │    └── AuthenticateStaff.usecase.ts → migra para AuthModule
 │    └── services/
 │         └── StaffService.ts
 ├── infrastructure/
 │    └── StaffPrismaRepository.ts
 └── presentation/
      └── staff.controller.ts
```

---

## ETAPA 6 — AUDITORIA DO auditLogger

### 6.1 Análise Completa

**Arquivo**: `security/auditLogger.ts` (261 linhas / 10KB)

O `auditLogger` tem o design correto para um sistema de auditoria corporativa:
- **26 tipos de eventos** pré-definidos (`AuditAction` type)
- **Chain integrity**: cada entrada carrega o hash da anterior (`previousHash`)
- **`verifyIntegrity()`**: função que percorre a cadeia e detecta adulteração
- **Rate limiting**: `isRateLimited()` conta ações por ator em janela de tempo
- **Filtros ricos**: `filter()` por action, actorId, targetId, severity, período

**O problema é fatal**: toda essa sofisticação está no browser.

### 6.2 O Hash Chain — Implementação Correta, Algoritmo Errado

```typescript
// auditLogger.ts L52–68
function computeHash(entry: Omit<AuditEntry, 'hash'>): string {
  const payload = JSON.stringify({ id, timestamp, action, actorId, targetId, details, previousHash });
  try {
    return '$h1$' + btoa(unescape(encodeURIComponent(payload))).slice(0, 64);
    //             ↑ btoa = Base64 ENCODING — NÃO É UMA FUNÇÃO DE HASH
    //             ↑ btoa é completamente reversível: atob(hash.replace('$h1$',''))
    //             ↑ Um atacante pode recalcular hashes para cobrir rastros
  } catch {
    return '$h1$' + Date.now().toString(36); // ← Fallback ainda pior
  }
}

// O que deveria ser:
// '$sha256$' + await crypto.subtle.digest('SHA-256', encodedPayload)
// cryptoUtils.ts já implementa hashSensitiveData() com SHA-256 — mas não é usado aqui!
```

### 6.3 Inconsistência Interna — SHA-256 Disponível, Não Usado

```typescript
// cryptoUtils.ts L99–109 — SHA-256 implementado corretamente:
export async function hashSensitiveData(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(`legis_v1:${data}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return '$sha256$' + Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// auditLogger.ts L63 — usa btoa em vez de SHA-256:
return '$h1$' + btoa(unescape(encodeURIComponent(payload))).slice(0, 64);
// ← computeHash é síncrona → poderia usar crypto.subtle.digest com async
// → mas o AuditLogger.log() é síncrono → esta é a limitação real
```

**Solução**: Tornar `AuditLogger.log()` assíncrono (retorna `Promise<AuditEntry>`) ou usar uma fila de eventos.

### 6.4 Falhas Críticas do auditLogger

| Falha | Detalhe | Impacto Jurídico |
|---|---|---|
| **localStorage adulterável** | `localStorage.clear()` ou edição no DevTools | Logs sem validade jurídica |
| **Truncamento a 5.000 entradas** | `logs.slice(-MAX_ENTRIES)` — logs mais antigos perdidos | Violação de retenção mínima (LGPD: 5 anos) |
| **Hash btoa reversível** | `atob()` reverte qualquer hash | Integridade forjável trivialmente |
| **IP sempre 'browser-client'** | `ipAddress: 'browser-client'` hardcoded | IP real nunca registrado |
| **sessionId de sessionStorage** | `sessionStorage.getItem('legis_session_id')` — pode ser null ou manipulado | Rastreio de sessão não confiável |
| **Sem assinatura digital** | Nenhuma chave privada assina os logs | Sem não-repúdio |

### 6.5 Arquitetura Proposta — Audit Service Imutável

```
AuditLogger (frontend)
    │ evento ocorre
    ▼
POST /api/audit/log          ← NestJS AuditController (fire-and-forget)
    │
    ▼
AuditService (NestJS)
    ├── Recebe dados do evento
    ├── Enriquece: IP real (req.ip), userAgent, sessionId real (JWT)
    ├── Assina com HMAC-SHA-256 (chave no servidor)
    ├── Publica em Message Queue (Bull/RabbitMQ)
    │
    ▼
AuditProcessor (Worker)
    ├── Persiste em PostgreSQL (tabela append-only, sem UPDATE/DELETE)
    ├── Replica em CloudWatch Logs / Datadog
    └── Retém por 5 anos (retenção LGPD)
```

### 6.6 Schema PostgreSQL — Audit Log Imutável

```sql
-- Tabela sem UPDATE ou DELETE (enforced via triggers)
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action        TEXT NOT NULL,
  actor_id      TEXT NOT NULL,
  actor_role    TEXT NOT NULL,
  target_id     TEXT,
  target_type   TEXT,
  details       TEXT NOT NULL,
  metadata      JSONB,
  ip_address    INET,              -- IP real do servidor
  session_id    UUID,
  previous_hash TEXT NOT NULL,
  entry_hash    TEXT NOT NULL,     -- HMAC-SHA-256 assinado pelo servidor
  severity      TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Previne DELETE e UPDATE (auditoria é append-only)
CREATE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
```

---

## ETAPA 7 — AUDITORIA DO cryptoUtils

### 7.1 Análise Completa

**Arquivo**: `security/cryptoUtils.ts` (203 linhas / 7.9KB)

Este é o módulo **mais bem implementado** do projeto inteiro. Usa exclusivamente a **Web Crypto API** nativa — sem dependências de terceiros, sem segredos hardcoded, sem falsos positivos de segurança.

### 7.2 Matriz Detalhada de Funções

| Função | Algoritmo | Uso Atual | Avaliação | Problema |
|---|---|---|---|---|
| `encryptData(plaintext)` | AES-GCM 256-bit + IV aleatório 96-bit | Nenhum uso identificado nos componentes | 🟢 Excelente | Subutilizada |
| `decryptData(encrypted)` | AES-GCM 256-bit | Nenhum uso identificado | 🟢 Excelente | Subutilizada |
| `hashSensitiveData(data)` | SHA-256 com salt `legis_v1:` | Nenhum uso identificado | 🟢 Excelente | Subutilizada — poderia substituir btoa em auditLogger |
| `compareHash(data, hash)` | SHA-256 comparação | Nenhum uso identificado | 🟢 Excelente | Subutilizada |
| `maskCpf(cpf)` | Regex mascaramento | Provavelmente usado em exibições | 🟢 Excelente | — |
| `maskEmail(email)` | Regex mascaramento | Provavelmente usado em exibições | 🟢 Excelente | — |
| `maskPhone(phone)` | Regex mascaramento | Provavelmente usado | 🟢 Boa | — |
| `maskCurrency(value)` | String literal `R$ **.**,**` | Nenhum uso identificado | 🟡 Superficial | Deveria retornar `R$ ${value.toLocaleString()}` mascarado |
| `sanitizeInput(input)` | HTML entity encoding | Nenhum uso nos formulários identificado | 🟢 Boa | Não aplicado nos formulários de cadastro |
| `isValidCpf(cpf)` | Algoritmo de dígito verificador | Formulários de cadastro (não aplicado) | 🟢 Excelente | Não chamado em ClientSignupForm |
| `isValidCnpj(cnpj)` | Algoritmo dígito verificador CNPJ | Não identificado | 🟢 Excelente | Subutilizado |

**Paradoxo Crítico**: O `cryptoUtils.ts` tem SHA-256 real (`hashSensitiveData`), AES-GCM real (`encryptData`) e validação de CPF real (`isValidCpf`). Mas:
- `mockDataService.hashPassword()` usa `btoa` em vez de `hashSensitiveData()`
- `auditLogger.computeHash()` usa `btoa` em vez de `hashSensitiveData()`
- `ClientSignupForm` não chama `isValidCpf()`

**Solução imediata (sem backend)**: substituir `btoa` por `hashSensitiveData()` em `mockDataService.ts` e `auditLogger.ts`. Isso melhora segurança mesmo antes da migração para backend.

### 7.3 Problema da Chave de Criptografia

```typescript
// cryptoUtils.ts L10–35
const CRYPTO_KEY_STORAGE = 'legis_ek';

async function getOrCreateKey(): Promise<CryptoKey> {
  const stored = sessionStorage.getItem(CRYPTO_KEY_STORAGE);
  // Chave AES-GCM 256-bit exportada como base64 e salva na sessionStorage
  // 🔴 Acessível via DevTools → Application → Session Storage
  // 🔴 Toda a proteção AES-GCM cai se a chave está exposta
  // Correto: a chave deveria vir do servidor via KMS (AWS Key Management Service)
}
```

### 7.4 Destino das Funções na Arquitetura TO-BE

| Função | Destino no Backend | Observação |
|---|---|---|
| `hashSensitiveData()` | `bcrypt.hash()` no NestJS (bcrypt > SHA-256 para senhas) | SHA-256 é adequado para dados não-senha; bcrypt para passwords |
| `encryptData()` | Criptografia de coluna no PostgreSQL (pgcrypto ou app-level) | Chave via AWS KMS |
| `decryptData()` | Server-side apenas | Nunca descriptografar dados sensíveis no frontend |
| `maskCpf()` | Manter no frontend — apenas mascaramento de exibição | ✅ Correto ficar no frontend |
| `sanitizeInput()` | Frontend (UI) + validação server-side com class-validator | Defense in depth |
| `isValidCpf()` | Manter no frontend + revalidar no backend (Zod schema) | Defense in depth |

---

## ETAPA 8 — MAPEAMENTO DAS REGRAS DE NEGÓCIO

### 8.1 Inventário de Regras por Localização Atual

| Regra de Negócio | Localização Atual | Local Correto | Prioridade de Migração |
|---|---|---|---|
| Autenticação por role | `App.tsx:handleLogin()` | `AuthModule` NestJS (passport-jwt) | 🔴 CRÍTICA |
| Autorização de acesso ao painel admin | `App.tsx` (if user.role !== 'admin') | `RolesGuard` NestJS | 🔴 CRÍTICA |
| Verificação de permissões granulares | `rbac.ts:hasPermission()` no frontend | `@Permissions()` decorator + `PermissionsGuard` NestJS | 🔴 CRÍTICA |
| Aprovação de cadastro de advogado | `LawyerDashboard` (mock) | `LawyerService.approve()` com notificação | 🔴 ALTA |
| Regra de idempotência de pagamento | `provisioningService.processPaymentWebhook()` | `ProvisioningService` NestJS | 🔴 ALTA |
| Limite de retentativas (3 max) | `provisioningService.retryProvisioning()` | `ProvisioningService` NestJS | 🔴 ALTA |
| Soft-delete de colaboradores | `staffService.setActive()` | `StaffService.deactivate()` NestJS | 🟠 ALTA |
| Deduplicação de advogados por OAB | `AppDataContext.addLawyer()` (por ID) | `LawyerService.create()` NestJS (UNIQUE OAB) | 🟠 ALTA |
| Verificação de OAB na API oficial | `SettingsTab` (simulado) | `OabVerificationService` → API OAB real | 🟠 ALTA |
| Cálculo de KPIs financeiros | `FinanceTab` (local) | `FinanceService.getKpis()` NestJS | 🟡 MÉDIA |
| Provisionamento de features por role | `provisioningService.provisionForClient/Lawyer()` | `ProvisioningService.provision()` NestJS + Redis | 🔴 ALTA |
| Validação de CPF | `cryptoUtils.isValidCpf()` (frontend) | NestJS + Zod schema (server-side validation) | 🟡 MÉDIA |
| Rate limiting de IA | Inexistente | `ThrottlerGuard` + `AiRateLimiterGuard` NestJS | 🔴 CRÍTICA |
| Cálculo de hash de auditoria | `auditLogger.computeHash()` (btoa) | `AuditService.sign()` NestJS (HMAC-SHA-256) | 🔴 ALTA |

### 8.2 Regras Sem Implementação (Gaps)

| Regra Necessária | Status Atual | Prioridade |
|---|---|---|
| Verificação de e-mail único no cadastro | ❌ Ausente | 🔴 CRÍTICA |
| Verificação de OAB na API real | ❌ Simulado | 🔴 ALTA |
| Prazo de resposta ao cliente (SLA jurídico) | ❌ Ausente | 🟡 MÉDIA |
| Cálculo automático de honorários | ❌ Ausente | 🟡 MÉDIA |
| Notificação por email (SendGrid/SES) | ❌ Ausente | 🟠 ALTA |
| Expiração de sessão com refresh | ❌ Ausente | 🔴 CRÍTICA |
| Blacklist de tokens invalidados | ❌ Ausente | 🟠 ALTA |
| Verificação de disponibilidade antes de agendamento | ❌ Ausente | 🟠 ALTA |

---

## ETAPA 9 — AUDITORIA DE INTEGRAÇÕES EXTERNAS

### 9.1 Mapa Completo de Integrações

| Integração | Objetivo | Arquivo | Autenticação | Status | Risco |
|---|---|---|---|---|---|
| **Gemini AI** (Google) | Análise jurídica, chatbot, busca Maps | `geminiService.ts` | `process.env.API_KEY` no bundle | 🟡 Funcional | 🔴 API Key exposta |
| **Google Maps** (via Gemini) | Busca de advogados por geolocalização | `geminiService.ts L79` | Mesma API Key do Gemini | 🟡 Funcional | 🔴 API Key exposta |
| **Firebase Firestore** | Cloud storage alternativo | `dbService.ts dbCloud` | `dbApiKey` no localStorage | 🔴 Desconectado | 🔴 Credencial exposta |
| **Supabase** | Cloud storage alternativo | `dbService.ts dbCloud` | `dbApiKey` no localStorage | 🔴 Desconectado | 🔴 Credencial exposta |
| **Stripe / PagarMe** | Pagamentos | `provisioningService.ts L242` | Webhook simulado | 🔴 Não implementado | 🟠 Sem gateway real |
| **API OAB** | Verificação de número OAB | `SettingsTab.tsx` (simulado) | Não autenticada | 🔴 Simulado | 🟡 Sem validação real |
| **GitHub** | Deploy / Versionamento | `.github/` | GitHub Actions | 🟢 Funcional | 🟢 OK |

### 9.2 Avaliação por Critério de Segurança

| Integração | Autenticação Segura | Rate Limiting | Retry Logic | Circuit Breaker | Timeout | Logging |
|---|---|---|---|---|---|---|
| Gemini AI | 🔴 API Key no bundle | 🔴 Ausente | 🔴 Ausente | 🔴 Ausente | 🟡 Implícito | 🔴 Console.error |
| Firebase Cloud | 🔴 ApiKey no localStorage | 🔴 Ausente | 🔴 Ausente | 🔴 Ausente | 🔴 Ausente | 🔴 Console.warn |
| Supabase | 🔴 ApiKey no localStorage | 🔴 Ausente | 🔴 Ausente | 🔴 Ausente | 🔴 Ausente | 🔴 Console.warn |
| Stripe | 🔴 Não implementado | — | — | — | — | — |
| OAB API | 🔴 Não implementado | — | — | — | — | — |

### 9.3 Plano de Segurança para Integrações TO-BE

```typescript
// NestJS — HttpModule com configuração enterprise:
@Module({
  imports: [
    HttpModule.register({
      timeout: 10_000,           // 10 segundos timeout
      maxRedirects: 5,
      retries: 3,                // 3 tentativas automáticas
      retryDelay: 1000,          // 1 segundo entre tentativas (exponential backoff)
    }),
  ],
})

// Circuit Breaker com @nestjs/circuit-breaker ou opossum:
const circuit = new CircuitBreaker(geminiRequest, {
  errorThresholdPercentage: 50,  // Abre após 50% de falhas
  timeout: 8000,                  // 8 segundos para considerar falha
  resetTimeout: 30000,            // Tenta reabrir após 30 segundos
});

// Rate Limiting por usuário (ThrottlerModule):
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 20, ttl: 60000 } })  // 20 req/min
async analyzeCase() { ... }
```

---

## ETAPA 10 — AVALIAÇÃO ARQUITETURAL DA CAMADA DE SERVIÇOS

### 10.1 Scorecard

| Categoria | Nota 0–100 | Justificativa |
|---|---|---|
| **Organização e Estrutura** | 65 | Serviços bem nomeados, responsabilidades claras; problema é o posicionamento (browser) |
| **Separação de Responsabilidades** | 55 | dbService tem 5 sub-módulos acoplados; provisioningService bem separado |
| **Segurança** | 12 | API Key exposta; btoa como hash; RBAC client-side; credentials em localStorage |
| **Escalabilidade** | 8 | localStorage não escala além de 1 usuário/device; sem queue; sem cache |
| **Testabilidade** | 20 | Serviços com efeito colateral em localStorage; impossível testar sem mocks globais |
| **Manutenção** | 60 | Código bem documentado; comentários de migração; padrões consistentes |
| **Design Arquitetural** | 70 | State Machine no provisioning, RBAC granular, chain integrity no audit são excelentes padrões |
| **MÉDIA GERAL** | **41** | Acima da média de projetos na mesma fase; mas inaceitável para produção |

---

## ETAPA 11 — NOVA ARQUITETURA DE SERVIÇOS (NestJS + DDD)

### 11.1 Estrutura Completa do Backend NestJS

```
backend/ (NestJS)
│
├── src/
│    │
│    ├── app.module.ts           ← Root module: imports todos os modules
│    ├── main.ts                 ← Bootstrap: Helmet, CORS, ValidationPipe, Swagger
│    │
│    ├── common/                 ← Utilitários compartilhados
│    │    ├── decorators/
│    │    │    ├── Roles.decorator.ts     ← @Roles('admin', 'lawyer')
│    │    │    └── Permissions.decorator.ts ← @Permissions('finance:read')
│    │    ├── guards/
│    │    │    ├── JwtAuthGuard.ts        ← Passport JWT
│    │    │    ├── RolesGuard.ts          ← Verifica SystemRole
│    │    │    └── PermissionsGuard.ts    ← Verifica Permission granular
│    │    ├── interceptors/
│    │    │    ├── AuditInterceptor.ts    ← Log automático de todas as requests
│    │    │    └── TransformInterceptor.ts ← Serializa respostas
│    │    ├── filters/
│    │    │    └── HttpExceptionFilter.ts ← Tratamento global de erros
│    │    ├── pipes/
│    │    │    └── ZodValidationPipe.ts   ← Validação Zod nos DTOs
│    │    └── utils/
│    │         ├── crypto.util.ts         ← bcrypt, SHA-256 (migrado do cryptoUtils)
│    │         └── cpf.util.ts            ← isValidCpf (migrado do cryptoUtils)
│    │
│    ├── modules/
│    │    │
│    │    ├── auth/                       ← Autenticação + JWT
│    │    │    ├── auth.module.ts
│    │    │    ├── auth.controller.ts     ← POST /api/auth/login, /logout, /refresh, /me
│    │    │    ├── auth.service.ts        ← login(), validateUser(), refreshToken()
│    │    │    ├── strategies/
│    │    │    │    ├── jwt.strategy.ts   ← Passport JWT (httpOnly cookie)
│    │    │    │    └── local.strategy.ts ← Passport Local (email+senha)
│    │    │    └── dto/
│    │    │         └── login.dto.ts      ← Zod: email, password
│    │    │
│    │    ├── users/                      ← Usuários (clientes, advogados, etc.)
│    │    │    ├── users.module.ts
│    │    │    ├── users.controller.ts
│    │    │    ├── users.service.ts
│    │    │    ├── domain/
│    │    │    │    └── User.entity.ts    ← Com role, status, createdAt
│    │    │    ├── infrastructure/
│    │    │    │    └── UserPrismaRepository.ts
│    │    │    └── dto/
│    │    │         ├── create-user.dto.ts
│    │    │         └── update-user.dto.ts
│    │    │
│    │    ├── lawyers/                    ← Domínio de advogados
│    │    │    ├── lawyers.module.ts
│    │    │    ├── lawyers.controller.ts  ← GET /api/lawyers (paginado), GET /:id, POST, PATCH, DELETE
│    │    │    ├── lawyers.service.ts
│    │    │    ├── domain/
│    │    │    │    ├── Lawyer.entity.ts
│    │    │    │    └── Specialization.vo.ts
│    │    │    └── infrastructure/
│    │    │         └── LawyerPrismaRepository.ts
│    │    │
│    │    ├── clients/                    ← Domínio de clientes
│    │    │    └── (estrutura similar ao lawyers)
│    │    │
│    │    ├── cases/                      ← Processos jurídicos
│    │    │    ├── cases.module.ts
│    │    │    ├── cases.controller.ts
│    │    │    ├── cases.service.ts
│    │    │    ├── domain/
│    │    │    │    ├── Case.entity.ts
│    │    │    │    ├── CaseStatus.vo.ts  ← OPEN|INSTRUCTION|APPEAL|CLOSED
│    │    │    │    └── CaseDocument.entity.ts
│    │    │    └── infrastructure/
│    │    │         └── CasePrismaRepository.ts
│    │    │
│    │    ├── finance/                    ← Financeiro
│    │    │    ├── finance.module.ts
│    │    │    ├── finance.controller.ts  ← GET /api/finance/transactions, /summary, /kpis
│    │    │    ├── finance.service.ts
│    │    │    └── infrastructure/
│    │    │         └── FinancePrismaRepository.ts
│    │    │
│    │    ├── staff/                      ← Colaboradores internos
│    │    │    └── (migrado de staffService.ts)
│    │    │
│    │    ├── provisioning/               ← Motor de provisionamento
│    │    │    ├── provisioning.module.ts
│    │    │    ├── presentation/
│    │    │    │    ├── provisioning.controller.ts
│    │    │    │    └── webhooks/
│    │    │    │         └── stripe-webhook.controller.ts ← POST /webhooks/stripe
│    │    │    ├── application/
│    │    │    │    └── use-cases/
│    │    │    │         ├── ProcessPaymentWebhook.usecase.ts
│    │    │    │         └── RetryProvisioning.usecase.ts
│    │    │    ├── domain/
│    │    │    │    ├── Provisioning.entity.ts
│    │    │    │    └── state-machine/ProvisioningStateMachine.ts
│    │    │    └── infrastructure/
│    │    │         ├── ProvisioningPrismaRepository.ts
│    │    │         └── queue/provisioning.processor.ts ← Bull Queue worker
│    │    │
│    │    ├── ai-gateway/                 ← Proxy seguro para Gemini
│    │    │    └── (ver Etapa 3)
│    │    │
│    │    ├── audit/                      ← Log de auditoria imutável
│    │    │    └── (ver Etapa 6)
│    │    │
│    │    ├── documents/                  ← Gestão de documentos jurídicos
│    │    │    ├── documents.module.ts
│    │    │    ├── documents.controller.ts ← POST /api/documents/upload (S3 presigned)
│    │    │    │                             GET /api/documents/:id (presigned download URL)
│    │    │    └── documents.service.ts
│    │    │
│    │    └── config/                     ← Configuração da plataforma (branding)
│    │         ├── config.module.ts
│    │         ├── config.controller.ts   ← GET /api/config/public (sem auth)
│    │         │                            PATCH /api/config (super_admin only)
│    │         └── config.service.ts
│    │
│    └── infrastructure/
│         ├── database/
│         │    ├── prisma.service.ts      ← PrismaClient singleton
│         │    └── schema.prisma          ← Schema completo de todas as tabelas
│         ├── cache/
│         │    └── redis.module.ts        ← Cache para React Query e rate limiting
│         ├── queue/
│         │    └── bull.module.ts         ← Bull Queue para operações assíncronas
│         └── storage/
│              └── s3.service.ts          ← Upload/download S3 com presigned URLs
│
├── prisma/
│    ├── schema.prisma
│    └── migrations/
│
├── test/                                 ← Testes E2E
└── .env                                  ← Secrets (nunca no frontend)
     ├── DATABASE_URL
     ├── JWT_SECRET
     ├── GEMINI_API_KEY        ← Apenas aqui
     ├── STRIPE_WEBHOOK_SECRET
     ├── AWS_ACCESS_KEY_ID
     └── REDIS_URL
```

---

## ETAPA 12 — ESTRATÉGIA DE MIGRAÇÃO POR FASE

### Fase 1 — Serviços Críticos de Segurança (Semanas 1–4)

```
SERVICE-001: Auth Service
  Status: Iniciar imediatamente
  Ação:
    1. Criar AuthModule com Passport JWT + httpOnly cookie
    2. Migrar handleLogin do App.tsx para POST /api/auth/login
    3. Criar POST /api/auth/logout (invalida cookie)
    4. Criar GET /api/auth/me (perfil do usuário autenticado)
    5. Implementar refresh token (7 dias)
  Resultado: Autenticação server-side; localStorage.legis_user eliminado

SERVICE-002: Audit Service
  Status: Iniciar na semana 2
  Ação:
    1. Criar AuditModule com tabela PostgreSQL append-only
    2. Substituir AuditLogger.log() por POST /api/audit/log (fire-and-forget)
    3. Hash HMAC-SHA-256 com chave privada no servidor
    4. Configurar CloudWatch Logs para retenção de 5 anos
  Resultado: Auditoria com validade jurídica

SERVICE-003: RBAC Guard (NestJS)
  Status: Junto com Auth Service
  Ação:
    1. Transpor rbac.ts para decorators NestJS (@Roles, @Permissions)
    2. Criar RolesGuard e PermissionsGuard como global guards
    3. Manter rbac.ts no frontend apenas para controle de UI (tabs visíveis)
    4. Nunca confiar no role vindo do frontend — sempre do JWT
  Resultado: Autorização server-side; RBAC bypassável eliminado

SERVICE-004: AI Gateway
  Status: Semana 3
  Ação:
    1. Criar AiGatewayModule com ThrottlerGuard
    2. Mover API Key para .env do servidor
    3. Criar POST /api/ai/analyze-case, /api/ai/chat, /api/ai/find-lawyers
    4. Adicionar cache Redis (TTL: 5min para análise de casos similares)
  Resultado: API Key segura; rate limiting; logging de uso
```

### Fase 2 — Domínios de Negócio (Semanas 5–10)

```
SERVICE-005: Lawyers Service
  Migrar: AppDataContext.lawyers → GET /api/lawyers?page=1&limit=20
  Prioridade: ALTA (é o core do produto)

SERVICE-006: Clients Service
  Migrar: AppDataContext.clients → GET /api/clients (somente admin/lawyer)
  Prioridade: ALTA (PII — urgência LGPD)

SERVICE-007: Staff Service
  Migrar: staffService.ts → StaffModule NestJS
  Prioridade: ALTA (credenciais de colaboradores)

SERVICE-008: Provisioning Service
  Migrar: provisioningService.ts → ProvisioningModule + Bull Queue + Stripe Webhook
  Prioridade: ALTA (receita real depende disto)
```

### Fase 3 — Integrações e Dados Complementares (Semanas 11–16)

```
SERVICE-009: Financial Service
  Migrar: dbFinancial → FinanceModule NestJS + tabela transactions
  Integrar: Stripe para reconciliação de pagamentos

SERVICE-010: Documents Service
  Migrar: dbDocuments (base64 localStorage) → S3 presigned URLs
  Remover: base64 de documentos do localStorage

SERVICE-011: Notifications Service
  Criar novo: NestJS + SendGrid/SES para emails transacionais

SERVICE-012: Legal Codes Service
  Migrar: dbCodes → LegalCodesModule NestJS
  Adicionar: Versionamento com diff e aprovação de admin
```

---

## ETAPA 13 — BACKLOG TÉCNICO PRIORIZADO

### SERVICE-001 — AuthModule NestJS + JWT
```
Problema: Autenticação 100% client-side com localStorage e btoa como hash.
Impacto: Qualquer usuário pode se tornar admin em 10 segundos via DevTools.
Solução: NestJS PassportJS + JWT httpOnly cookie + bcrypt server-side.
Prioridade: 🔴 CRÍTICA | Complexidade: Alta | Estimativa: 80h
Dependências: Nenhuma — pode iniciar imediatamente
```

### SERVICE-002 — Audit Service Imutável
```
Problema: Log de auditoria em localStorage com hash btoa reversível.
Impacto: Sem validade jurídica; logs adulteráveis; truncamento após 5.000 entradas.
Solução: AuditModule NestJS + PostgreSQL append-only + HMAC-SHA-256 + CloudWatch.
Prioridade: 🔴 CRÍTICA | Complexidade: Alta | Estimativa: 60h
Dependências: SERVICE-001
```

### SERVICE-003 — RBAC Server-Side
```
Problema: RBAC.ts executa no browser — qualquer verificação é bypassável.
Impacto: Um usuário com role 'client' pode chamar endpoints de admin.
Solução: @Roles() + @Permissions() decorators + Guards no NestJS.
Prioridade: 🔴 CRÍTICA | Complexidade: Média | Estimativa: 40h
Dependências: SERVICE-001
```

### SERVICE-004 — AI Gateway Proxy
```
Problema: API Key Gemini exposta no bundle JavaScript (process.env.API_KEY).
Impacto: Qualquer pessoa com DevTools tem acesso à API Key; custo ilimitado.
Solução: Proxy NestJS /api/ai/* com autenticação + rate limiting + logging.
Prioridade: 🔴 CRÍTICA | Complexidade: Média | Estimativa: 40h
Dependências: SERVICE-001
```

### SERVICE-005 — Remover hashPassword(btoa)
```
Problema: mockDataService.hashPassword() usa btoa — reversível em milissegundos.
Impacto: Todas as senhas (staff, admin) recuperáveis a partir do localStorage.
Solução: Imediata — substituir por cryptoUtils.hashSensitiveData() (SHA-256).
Prioridade: 🔴 CRÍTICA | Complexidade: Baixa | Estimativa: 8h
Dependências: Nenhuma — correção emergencial sem backend
```

### SERVICE-006 — Conectar dbCloud ao AppDataContext
```
Problema: dbCloud é um stub funcional que nunca é chamado para dados de usuários.
Impacto: Usuário acredita que dados estão na nuvem mas continuam no localStorage.
Solução: Curto prazo: conectar lawyers/clients ao dbCloud enquanto NestJS não existe.
         Longo prazo: eliminar dbCloud, usar NestJS API.
Prioridade: 🟠 ALTA | Complexidade: Média | Estimativa: 32h
Dependências: Configuração Firebase/Supabase real
```

### SERVICE-007 — Provisioning Service → NestJS + Bull Queue
```
Problema: State machine de pagamento no browser; créditos manipuláveis no localStorage.
Impacto: Usuários podem dar créditos ilimitados a si mesmos; sem integração real com Stripe.
Solução: Migrar para NestJS + Bull Queue + Stripe Webhook handler + PostgreSQL.
Prioridade: 🔴 ALTA | Complexidade: Alta | Estimativa: 120h
Dependências: SERVICE-001, SERVICE-003, conta Stripe
```

### SERVICE-008 — Documents Service → S3
```
Problema: Documentos jurídicos (PDFs) em base64 no localStorage.
Impacto: Limite de storage; dados sigilosos expostos; sem ACL.
Solução: Upload via presigned S3 URL; armazenar apenas URL no PostgreSQL.
Prioridade: 🔴 ALTA | Complexidade: Alta | Estimativa: 80h
Dependências: SERVICE-001, AWS S3 bucket
```

### SERVICE-009 — Usar cryptoUtils.isValidCpf() nos Formulários
```
Problema: ClientSignupForm e InternSignupForm não validam CPF matematicamente.
Impacto: CPFs inválidos entram no sistema; dados inconsistentes.
Solução: Chamar isValidCpf() já disponível no cryptoUtils.ts.
Prioridade: 🟠 ALTA | Complexidade: Baixa | Estimativa: 8h
Dependências: Nenhuma — correção imediata sem backend
```

### SERVICE-010 — OAB Verification Service Real
```
Problema: Verificação de OAB simulada no SettingsTab.
Impacto: Advogados com OAB inválida ou suspensa podem se cadastrar.
Solução: Integrar API pública da OAB (web scraping seguro ou parceria formal).
Prioridade: 🟡 MÉDIA | Complexidade: Alta | Estimativa: 60h
Dependências: Acordo legal com OAB ou API parceira
```

### SERVICE-011 — Notification Service (Email Transacional)
```
Problema: Nenhum email é enviado em nenhum evento da plataforma.
Impacto: Usuário cadastra e não recebe confirmação; admin não é notificado de novos cadastros.
Solução: SendGrid/AWS SES integrado ao NestJS (boas-vindas, aprovação, pagamento).
Prioridade: 🟡 MÉDIA | Complexidade: Média | Estimativa: 60h
Dependências: SERVICE-001, conta SendGrid ou AWS SES
```

### SERVICE-012 — Rate Limiting Global (NestJS ThrottlerModule)
```
Problema: Nenhum rate limiting em nenhum endpoint.
Impacto: DDoS, abuso de IA, brute force de login.
Solução: @nestjs/throttler configurado por rota (login: 5/min; IA: 20/min; geral: 100/min).
Prioridade: 🔴 ALTA | Complexidade: Baixa | Estimativa: 16h
Dependências: SERVICE-001 (para rate limiting por userID)
```

---

## ENTREGÁVEIS — RESUMO

| Entregável | Seção | Status |
|---|---|---|
| ✅ Inventário completo (11 serviços + diagrama de dependências) | Etapa 1 | Concluído |
| ✅ Auditoria dbService (5 sub-módulos: cloud, config, docs, financial, codes) | Etapa 2 | Concluído |
| ✅ Auditoria geminiService (3 funções + 5 vetores de ataque + AI Gateway proposto) | Etapa 3 | Concluído |
| ✅ Auditoria provisioningService (state machine documentada + exploração de créditos) | Etapa 4 | Concluído |
| ✅ Auditoria staffService (auth client-side + btoa reversível + RBAC 5 roles) | Etapa 5 | Concluído |
| ✅ Auditoria auditLogger (hash chain btoa + 6 falhas jurídicas + schema PostgreSQL) | Etapa 6 | Concluído |
| ✅ Auditoria cryptoUtils (11 funções — bem implementado, subutilizado) | Etapa 7 | Concluído |
| ✅ Mapeamento de regras de negócio (14 regras localizadas + 8 gaps) | Etapa 8 | Concluído |
| ✅ Auditoria de integrações externas (7 integrações + scorecard segurança) | Etapa 9 | Concluído |
| ✅ Scorecard arquitetural (média 41/100) | Etapa 10 | Concluído |
| ✅ Nova arquitetura NestJS + DDD (estrutura completa de diretórios) | Etapa 11 | Concluído |
| ✅ Estratégia de migração em 3 fases (16 semanas) | Etapa 12 | Concluído |
| ✅ Backlog técnico (SERVICE-001 a SERVICE-012, priorizado) | Etapa 13 | Concluído |

---

## 🏆 DESCOBERTA PRINCIPAL

**O código dos serviços da Legis Connect é, surpreendentemente, de alta qualidade para uma plataforma nesta fase.**

O `rbac.ts` implementa RBAC granular com 9 roles e 22 permissões — padrão enterprise. O `provisioningService.ts` tem state machine, idempotência e compatibilidade com Stripe/PagarMe. O `cryptoUtils.ts` usa Web Crypto API com AES-GCM 256-bit e SHA-256 real. O `auditLogger.ts` tem chain integrity e 26 tipos de eventos auditáveis.

**O único trabalho necessário é extração**: mover estes serviços do browser para o servidor NestJS, onde o código pode finalmente ter efeito — sem ser bypassável, sem expor credenciais e sem perder dados ao limpar o browser.

---

*Documento gerado em 25/07/2026 | Prompt 004 — Service Layer Architecture Blueprint | v1.0.0*
*Próximo: PROMPT 005 — Especificação do Schema PostgreSQL + Prisma ORM (Modelagem de Dados TO-BE)*
