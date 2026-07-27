# 🏛️ DOCUMENTO DE ARQUITETURA AS-IS — LEGIS CONNECT PLATFORM
**Architecture Discovery Phase | Prompt 001**
**Arquiteto Sênior: Auditoria Estrutural Completa**
**Data: 25/07/2026 | Versão: 1.0.0 | Classificação: TÉCNICO CONFIDENCIAL**

---

## SUMÁRIO EXECUTIVO

Este documento registra a descoberta arquitetural completa da plataforma **Legis Connect** em seu estado atual (AS-IS), com base em análise direta do código-fonte. O objetivo é estabelecer a base documental para a reengenharia da plataforma em arquitetura corporativa segura e escalável.

**Diagnóstico Central**: A plataforma possui um frontend de alta qualidade, design system premium, modelagem de dados robusta e camada de segurança bem arquitetada *conceitualmente*. Contudo, opera em modo de **Single-User Browser-Only**, com toda a lógica de negócio, persistência e autenticação executando exclusivamente no navegador do usuário — tornando-a inviável para produção em escala.

---

## ETAPA 1 — INVENTÁRIO GERAL DO SISTEMA

### 1.1 Estrutura de Diretórios (Raiz)

| Diretório/Arquivo | Responsabilidade | Tamanho | Avaliação |
|---|---|---|---|
| `App.tsx` | Roteador central (View State Machine). Contém lógica de auth, navegação, chatbot e modais | 31.673 bytes | 🔴 **Crítico** — Arquivo god-object com 761 linhas. Viola SRP severamente |
| `index.tsx` | Entry point — monta providers e root element | 708 bytes | 🟢 Adequado |
| `index.html` | HTML shell + meta tags SEO + inline scripts de configuração | 20.717 bytes | 🟡 Médio — HTML muito grande; inline scripts de config misturados |
| `index.css` | Design system global — variáveis CSS, animations, glassmorphism | 22.349 bytes | 🟢 Adequado — bem estruturado |
| `types.ts` | Definições TypeScript globais: User, Lawyer, Case, RBAC, Audit | 11.859 bytes | 🟢 Excelente — tipagem abrangente e bem organizada |
| `constants.ts` | Áreas do direito (14), Estados brasileiros (27) | 1.395 bytes | 🟢 Adequado |
| `schema.prisma` | Schema PostgreSQL/Prisma — modelagem de dados futura (documentação) | 12.757 bytes | 🟢 Excelente — não executável neste stack, mas bem normalizado |
| `vite.config.ts` | Configuração do bundler — porta 3000, define env vars, alias `@` | 867 bytes | 🔴 **Crítico** — injeta API keys no bundle de produção |
| `tsconfig.json` | Config TypeScript — target ES2020, strict mode | 542 bytes | 🟢 Adequado |
| `package.json` | Dependências e scripts npm — versão `0.0.0` (pre-launch) | 987 bytes | 🟡 Médio — sem script de teste; zero framework de testes |
| `components/` | Todos os componentes de UI (13 subdiretórios) | — | 🟡 Médio — sem barrel exports padronizados |
| `context/` | Estado global React (2 contextos) | — | 🟡 Médio — funcional, mas limitado ao browser |
| `services/` | Serviços de dados e integrações (7 arquivos) | — | 🟡 Médio — stubs de backend, não conectados a APIs reais |
| `security/` | Módulos de RBAC, crypto, auditoria, scope validation (4 arquivos) | — | 🟡 Médio — bem projetado, mas enforcement só client-side |
| `data/` | Dados estáticos adicionais | — | 🟢 Adequado |
| `utils/` | Utilitários genéricos | — | 🟢 Adequado |
| `.github/workflows/` | CI/CD — deploy automático para GitHub Pages | — | 🟡 Médio — sem scan de segurança, sem testes no pipeline |
| `dist/` | Build de produção (1.049 módulos compilados) | 2,32 MB JS | 🔴 **Crítico** — bundle único sem code splitting |

### 1.2 Estrutura de Componentes

| Diretório | Responsabilidade | Nº de Componentes (est.) | Avaliação |
|---|---|---|---|
| `components/admin/` | Painel administrativo completo (9 arquivos + 5 subdiretórios) | ~40 | 🔴 Crítico — SettingsTab.tsx tem 259KB/4671 linhas |
| `components/auth/` | Login, Signup, formulários de cadastro por perfil | ~8 | 🟡 Médio — sem validação de schema |
| `components/chatbot/` | FAB + Modal do chatbot IA | 2 | 🟢 Adequado |
| `components/client/` | Dashboard, perfil, serviços de eficiência | ~5 | 🟢 Adequado |
| `components/common/` | Modais compartilhados (Login, ToS, Privacy, Toast) | ~6 | 🟢 Adequado |
| `components/intern/` | Dashboard e página de estagiários | ~3 | 🟢 Adequado |
| `components/landing/` | Landing page pública | ~5 | 🟢 Adequado |
| `components/lawyer/` | Dashboard, perfil e página de advogados | ~5 | 🟢 Adequado |
| `components/layout/` | Header + Footer globais | 2 | 🟢 Adequado |
| `components/public/` | Páginas públicas (serviços, institucional) | ~3 | 🟢 Adequado |
| `components/search/` | Busca de advogados com filtros | ~3 | 🟢 Adequado |
| `components/secretary/` | Dashboard e página de secretários | ~3 | 🟢 Adequado |
| `components/ui/` | UI Kit modular (dashboard widgets, cards) | ~15 | 🟢 Excelente — componentes reutilizáveis |

---

## ETAPA 2 — MAPEAMENTO DE MÓDULOS FUNCIONAIS

### Matriz de Módulos

| Módulo | Componentes Principais | Serviços Utilizados | Dados Manipulados | Dependências | Risco |
|---|---|---|---|---|---|
| **Autenticação** | `LoginForm`, `LoginModal`, `SignupPage`, `ProfileSelectorModal` | `mockDataService`, `dbService` (via App.tsx) | `legis_user`, `legis_admin_users`, `legis_currentView` | `hashPassword()` | 🔴 CRÍTICO — auth 100% client-side |
| **Gestão de Advogados** | `LawyerSearch`, `LawyerProfile`, `LawyerDashboard`, `ForLawyersPage` | `mockLawyerService`, `AppDataContext` | `legis_lawyers`, `legis_legal_docs` | `AppDataContext`, Gemini API | 🔴 ALTO — sem verificação OAB real |
| **Gestão de Clientes** | `ClientDashboard`, `CompleteProfilePage`, `ForClientsPage` | `AppDataContext`, `mockDataService` | `legis_clients`, `legis_user` | `AppDataContext` | 🔴 ALTO — PII em localStorage |
| **Administração** | `AdminDashboard`, `OverviewTab`, `FinanceTab`, `RegistrationsTab`, `SettingsTab`, `AdminCommandsTab` | `StaffService`, `ProvisioningService`, `AuditLogger`, `dbService` | `legis_admin_users`, `legis_app_config`, `legis_audit_log`, `legis_platform_staff` | Todos os services | 🔴 CRÍTICO — acesso admin sem server-side auth |
| **Estagiários** | `InternDashboard`, `ForInternsPage`, `InternSignupForm` | `AppDataContext`, `mockDataService` | `legis_interns` | `AppDataContext` | 🟡 MÉDIO — sem vínculo CLT/estágio validado |
| **Secretariado** | `SecretariadoDashboard`, `ForSecretariadoPage`, `SecretariadoSignupForm` | `AppDataContext`, `mockDataService` | `legis_secretaries` | `AppDataContext` | 🟡 MÉDIO |
| **Financeiro** | `FinanceTab` (admin) | `dbService` (financialTx), `ProvisioningService` | `legis_financial_tx`, `legis_service_provisionings` | `ProvisioningService`, `AuditLogger` | 🔴 CRÍTICO — transações sem gateway real |
| **Serviços Jurídicos** | `ServicesManagementTab`, `EfficiencyServicesPage`, `ServicesPublicPage` | `AppDataContext`, `ProvisioningService` | `legis_services`, `legis_serviceGroups` | `AppDataContext` | 🟡 MÉDIO — sem checkout real |
| **IA Gemini** | `ChatbotFab`, `ChatbotModal`, `LawyerSearch` (análise de caso) | `geminiService` | Chat history (memória), caso descrito pelo usuário | Google Gemini API | 🔴 ALTO — API key exposta no bundle |
| **Audit & Compliance** | `SettingsTab` (sub-abas), `AdminCommandsTab` | `AuditLogger`, `StaffService` | `legis_audit_log`, `legis_platform_staff` | `security/auditLogger.ts` | 🟡 MÉDIO — logs adulteráveis pelo usuário |
| **Provisionamento** | Abas de provisioning no admin | `ProvisioningService` | `legis_service_provisionings`, `legis_lawyer_credits`, `legis_client_features` | `AuditLogger` | 🟡 MÉDIO — state machine bem projetada |
| **RBAC/Staff** | Abas de staff no admin | `StaffService`, `rbac.ts` | `legis_platform_staff` | `security/rbac.ts`, `AuditLogger` | 🟡 MÉDIO — RBAC sem enforcement server-side |

---

## ETAPA 3 — ANÁLISE DO FRONTEND

### 3.1 Mapa de Componentes (Árvore de Renderização)

```
index.tsx (Entry Point)
 └── React.StrictMode
      └── ToastProvider (componentes/common/Toast)
           └── AppProvider (context/AppContext — branding/config)
                └── AppDataProvider (context/AppDataContext — dados)
                     └── App.tsx ← GOD COMPONENT 🔴 (761 linhas)
                          │
                          ├── Header (layout/Header)
                          │    ├── Logo + Nav links
                          │    ├── Botão de Login/Logout
                          │    └── Menu mobile
                          │
                          ├── [Roteador por currentView — State Machine]
                          │    │
                          │    ├── 'landing'       → LandingPage
                          │    ├── 'search'        → LawyerSearch
                          │    ├── 'profile'       → LawyerProfile
                          │    ├── 'dashboard'     → ClientDashboard
                          │    ├── 'lawyerDashboard' → LawyerDashboard
                          │    ├── 'adminDashboard' → AdminDashboard
                          │    │    ├── OverviewTab
                          │    │    ├── FinanceTab           (79KB)
                          │    │    ├── RegistrationsTab     (70KB)
                          │    │    ├── ServicesManagementTab(18KB)
                          │    │    ├── AdminCommandsTab     (78KB)
                          │    │    └── SettingsTab          (259KB) 🔴
                          │    │         ├── Sub-aba: BrandingSection
                          │    │         ├── Sub-aba: DatabaseSection
                          │    │         ├── Sub-aba: StaffManagement
                          │    │         ├── Sub-aba: AuditLog
                          │    │         ├── Sub-aba: ImpersonationPanel
                          │    │         ├── Sub-aba: SecurityConfig
                          │    │         ├── Sub-aba: BI/Analytics
                          │    │         └── Sub-aba: SystemCommands
                          │    │
                          │    ├── 'login'         → LoginForm
                          │    ├── 'signup'        → SignupPage
                          │    ├── 'forLawyers'    → ForLawyersPage
                          │    ├── 'forInterns'    → ForInternsPage
                          │    ├── 'forClients'    → ForClientsPage
                          │    ├── 'forSecretariado' → ForSecretariadoPage
                          │    ├── 'internDashboard' → InternDashboard
                          │    ├── 'secretariadoDashboard' → SecretariadoDashboard
                          │    ├── 'services'      → ServicesPublicPage
                          │    └── 'efficiencyServices' → EfficiencyServicesPage
                          │
                          ├── Footer (layout/Footer)
                          ├── ChatbotFab + ChatbotModal (chatbot/)
                          ├── LoginModal (common/LoginModal)
                          ├── ProfileSelectorModal (common/ProfileSelectorModal)
                          ├── TermsOfServiceModal (common/TermsOfServiceModal)
                          ├── PrivacyPolicyModal (common/PrivacyPolicyModal)
                          └── EticaOABModal (common/EticaOABModal)
```

### 3.2 Problemas de Frontend Identificados

| Problema | Arquivo(s) | Severidade | Violação |
|---|---|---|---|
| **God Component** — App.tsx com 761 linhas fazendo auth, routing, chatbot, state management | `App.tsx` | 🔴 Crítico | SRP, separação de responsabilidades |
| **Mega-componente** — SettingsTab.tsx com 259KB e ~4671 linhas | `SettingsTab.tsx` | 🔴 Crítico | SRP — deve ser dividido em ~12 componentes |
| **Mega-componente** — FinanceTab.tsx com 79KB | `FinanceTab.tsx` | 🟡 Médio | SRP |
| **Mega-componente** — RegistrationsTab.tsx com 70KB | `RegistrationsTab.tsx` | 🟡 Médio | SRP |
| **Mega-componente** — AdminCommandsTab.tsx com 78KB | `AdminCommandsTab.tsx` | 🟡 Médio | SRP |
| **Sem React.lazy() / code splitting** — bundle único de 2,32MB | Build output | 🔴 Crítico | Performance, LCP, INP |
| **Sem React Router** — routing manual por state (`currentView`) | `App.tsx` | 🟡 Médio | URLs não navegáveis; sem deep links |
| **Lógica de autenticação em componente de UI** | `App.tsx` L202–340 | 🔴 Crítico | Separation of concerns |
| **Sem validação de formulários** (Zod/Yup ausente) | Forms em `auth/` | 🟡 Médio | Segurança, UX |
| **Dados hardcoded de mock em produção** | `App.tsx` L256–340 | 🔴 Crítico | Segurança — mock cases/appointments retornados para qualquer usuário |
| **Sem testes unitários ou de integração** | Todo o projeto | 🔴 Crítico | Manutenibilidade, risco de regressão |

---

## ETAPA 4 — ANÁLISE DE ESTADO GLOBAL

### 4.1 Inventário dos Contextos

| Contexto | Arquivo | Estado Gerenciado | Persistência | Consumidores |
|---|---|---|---|---|
| `ToastProvider` | `components/common/Toast` | Lista de toasts temporários | Nenhuma (memória) | Qualquer componente |
| `AppProvider` | `context/AppContext.tsx` | `AppConfig` (branding, logo, contato, dbType) | `localStorage.legis_app_config` | Header, SettingsTab, Footer |
| `AppDataProvider` | `context/AppDataContext.tsx` | lawyers, clients, interns, secretaries, services, serviceGroups | `localStorage.*` (6 keys) | LawyerSearch, AdminDashboard, dashboards |

### 4.2 Estado Local em App.tsx

```
App.tsx (estado local — useState)
 ├── currentView: View           ← roteamento (persistido em localStorage)
 ├── user: User | null           ← sessão autenticada (persistido em localStorage)
 ├── searchResults: Lawyer[]     ← resultado de busca (memória)
 ├── selectedLawyer: Lawyer|null ← perfil selecionado (memória)
 ├── mapsResult: MapsSearchResult← resultado do Google Maps (memória)
 ├── isChatbotOpen: boolean      ← estado do chatbot (memória)
 ├── chatHistory: ChatMessage[]  ← histórico do chat (memória — perdido ao fechar)
 ├── isChatbotLoading: boolean   ← loading do chatbot
 ├── isTermsModalOpen: boolean   ← modal ToS
 ├── isPrivacyModalOpen: boolean ← modal Privacy Policy
 ├── isEticaModalOpen: boolean   ← modal Ética OAB
 ├── isLoginModalOpen: boolean   ← modal de login contextual
 ├── isProfileSelectorOpen: bool ← seletor de perfil
 └── loginPendingAction: {...}   ← ação pendente após login
```

### 4.3 Fluxo de Estado — AS-IS

```
Usuário → Componente → Context/App.tsx → Service → localStorage
   ↑                        |                            |
   └────────────────────────┘                            |
              (re-render React)          ←───────────────┘
```

### 4.4 Problemas de Estado

| Problema | Impacto | Local |
|---|---|---|
| **Estado de autenticação em componente** (App.tsx) — sem contexto dedicado | Qualquer componente que precise do user deve receber via props (prop drilling) | `App.tsx` L56–74 |
| **Sem gerenciamento de estado assíncrono** (sem React Query / SWR) | Sem loading states padronizados, sem cache de dados, sem invalidação | Global |
| **Histórico do chatbot perdido** ao fechar modal | UX degradada | `App.tsx` L134 |
| **Race condition potencial no localStorage** | Duas abas acessando simultaneamente podem corromper dados | `AppDataContext.tsx` |
| **Context hell na raiz** — 3 providers aninhados | Dificulta testing e manutenção | `index.tsx` |
| **Sem sincronização cross-tab completa** — apenas `lawyers`, `services` e `serviceGroups` recebem evento `storage`, mas `clients`, `interns` e `secretaries` não | Inconsistência de dados entre abas | `AppDataContext.tsx` L116–128 |

---

## ETAPA 5 — AUDITORIA DA PERSISTÊNCIA ATUAL

### 5.1 Mapa Completo das Chaves localStorage

| Chave localStorage | Tipo de Dado | Sensibilidade | Risco LGPD | Destino no Banco | Criptografia Atual |
|---|---|---|---|---|---|
| `legis_user` | `User` (email, role, name, phone, address, caseHistory) | 🔴 ALTA | Art. 46 — dados pessoais sem proteção | `users` (PostgreSQL) | ❌ Nenhuma |
| `legis_currentView` | `string` (view atual) | 🟢 BAIXA | Nenhum | Sessão/JWT claim | ❌ N/A |
| `legis_admin_users` | `AdminUser[]` (email, senha hash, role) | 🔴 CRÍTICA | Art. 46, 47 — credenciais de acesso | `staff` / `users` admin (PostgreSQL) | ❌ Hash fraco (btoa) |
| `legis_lawyers` | `Lawyer[]` (nome, OAB, CPF, endereço, contato) | 🔴 ALTA | Art. 46 — dados profissionais e pessoais | `users` + `lawyer_profiles` | ❌ Nenhuma |
| `legis_clients` | `MockClient[]` (nome, CPF, endereço, histórico) | 🔴 CRÍTICA | Art. 11 — dados sensíveis; Art. 46 | `users` + `client_profiles` | ❌ Nenhuma |
| `legis_interns` | `MockIntern[]` (nome, CPF, universidade) | 🔴 ALTA | Art. 46 | `users` + `intern_profiles` | ❌ Nenhuma |
| `legis_secretaries` | `MockSecretary[]` (nome, CPF, endereço) | 🔴 ALTA | Art. 46 | `users` + `secretary_profiles` | ❌ Nenhuma |
| `legis_services` | `EfficiencyService[]` (preços, descontos) | 🟡 MÉDIA | Dado de negócio, não pessoal | `services` (PostgreSQL) | ❌ Nenhuma |
| `legis_serviceGroups` | `EfficiencyServiceGroup[]` | 🟢 BAIXA | Nenhum | `service_groups` | ❌ Nenhuma |
| `legis_app_config` | `AppConfig` (logo, branding, dbApiKey) | 🔴 ALTA | Credenciais de banco em texto plano | `app_config` / env vars server-side | ❌ Nenhuma |
| `legis_received_docs` | `ReceivedDocument[]` (documentos base64) | 🔴 CRÍTICA | Art. 11 — documentos jurídicos sensíveis | `documents` (S3 + PostgreSQL metadata) | ❌ Nenhuma |
| `legis_financial_tx` | `FinancialTransaction[]` (valores, clientes) | 🔴 ALTA | Art. 46 — dados financeiros | `financial_transactions` | ❌ Nenhuma |
| `legis_legal_docs` | Documentos legais | 🔴 CRÍTICA | Sigilo profissional + LGPD | `documents` (S3) | ❌ Nenhuma |
| `legis_audit_log` | `AuditEntry[]` (ações de admin) | 🔴 ALTA | Art. 47 — registro de acesso a dados | `audit_logs` (imutável, servidor) | 🟡 Hash btoa (fraco) |
| `legis_service_provisionings` | `ServiceProvisioning[]` (pagamentos, status) | 🔴 ALTA | Dados financeiros | `service_provisionings` | ❌ Nenhuma |
| `legis_platform_staff` | `PlatformStaff[]` (colaboradores + senhas hash) | 🔴 CRÍTICA | Credenciais de colaboradores | `staff` (PostgreSQL) | 🟡 Hash btoa (fraco) |
| `legis_lawyer_credits` | Credits de IA por advogado | 🟡 MÉDIA | Dado de negócio | `lawyer_credits` | ❌ Nenhuma |
| `legis_client_features` | Features habilitadas por cliente | 🟡 MÉDIA | Dado de negócio | `user_entitlements` | ❌ Nenhuma |
| `legis_ek` (sessionStorage) | Chave AES-GCM em base64 | 🔴 CRÍTICA | Chave de criptografia exposta | HSM / KMS servidor | 🟡 Parcial (base64) |

**Total de chaves identificadas**: 19 chaves localStorage/sessionStorage
**Chaves com dados PII**: 12 (63%)
**Chaves sem nenhuma proteção**: 16 (84%)

---

## ETAPA 6 — AUDITORIA DOS SERVIÇOS

### 6.1 `services/mockDataService.ts` (40.7 KB)

| Atributo | Detalhe |
|---|---|
| **Responsabilidade** | Definição de tipos `MockClient`, `MockIntern`, `AdminUser`, `MockSecretary`; dados seed; função `hashPassword()` |
| **Implementação** | `hashPassword()` usa `btoa(unescape(encodeURIComponent("legis_salt_" + reversed)))` — REVERSÍVEL |
| **Problemas** | (1) Hash inadequado para produção; (2) Credenciais reais hardcoded (`mockAdminUsers`); (3) Dados PII fictícios realistas; (4) Arquivo monolítico (663 linhas, 40KB) |
| **Arquitetura Futura** | Eliminar — substituir por `UserRepository` (NestJS) + `bcrypt` + PostgreSQL |

### 6.2 `services/dbService.ts` (24 KB)

| Atributo | Detalhe |
|---|---|
| **Responsabilidade** | Abstração de persistência local; CRUD de config, documentos, transações financeiras, códigos legais |
| **Implementação** | 100% localStorage com stubs comentados para Firebase/Supabase |
| **Funções principais** | `dbConfig`, `dbDocs`, `dbFinancial`, `dbLegalDocs`, `dbAdminUsers`, `dbCloudSync` |
| **Problemas** | (1) `dbCloudSync` é um stub não implementado; (2) `dbApiKey` armazenada em localStorage; (3) Funções Firestore nunca chamadas; (4) Sem transações ACID |
| **Arquitetura Futura** | Substituir por `TypeORM/Prisma repositories` em NestJS + PostgreSQL |

### 6.3 `services/geminiService.ts` (5.6 KB)

| Atributo | Detalhe |
|---|---|
| **Responsabilidade** | Integração com Google Gemini API — análise de casos, busca por Maps, chat assistido |
| **Funções** | `analyzeCaseWithGemini()`, `findPlacesWithMaps()`, `chatWithGemini()` |
| **Problemas** | (1) API Key injetada no bundle via `process.env.API_KEY` — exposta publicamente; (2) Sem rate limiting próprio; (3) Sem circuit breaker; (4) Usa `|| 'dummy_key'` como fallback |
| **Arquitetura Futura** | Proxy NestJS: `/api/ai/analyze`, `/api/ai/chat` — API key permanece no servidor |

### 6.4 `services/provisioningService.ts` (16.6 KB)

| Atributo | Detalhe |
|---|---|
| **Responsabilidade** | Motor de provisionamento de serviços — state machine: PENDING → IN_PROGRESS → PROVISIONED |
| **Funções** | `createProvisioning()`, `processProvisioning()`, `retryProvisioning()`, `processPaymentWebhook()` |
| **Qualidade** | 🟢 Bem arquitetado conceitualmente — state machine clara, logging de auditoria integrado, tratamento de retry |
| **Problemas** | (1) Persistência em localStorage — sem atomicidade; (2) `processPaymentWebhook()` nunca chamado por um webhook HTTP real; (3) `PROVISION_SLA_MS = 30.000ms` é simulado com `setTimeout` |
| **Arquitetura Futura** | NestJS service + Bull Queue + PostgreSQL; webhooks reais do Stripe/PagarMe |

### 6.5 `services/staffService.ts` (9.5 KB)

| Atributo | Detalhe |
|---|---|
| **Responsabilidade** | CRUD de colaboradores internos (`PlatformStaff`); autenticação de staff; estatísticas |
| **Qualidade** | 🟢 Bem estruturado — sem delete real (soft deactivation), integrado com AuditLogger |
| **Problemas** | (1) Persistência em localStorage; (2) `hashPassword()` fraco; (3) Sem rate limiting de login |
| **Arquitetura Futura** | `StaffModule` NestJS + PostgreSQL + bcrypt + JWT |

### 6.6 `services/mockLawyerService.ts` (5.6 KB)

| Atributo | Detalhe |
|---|---|
| **Responsabilidade** | Dados seed de 6 advogados fictícios com perfis completos |
| **Problemas** | Dados hardcoded; fotos via URL externa (sem CDN própria) |
| **Arquitetura Futura** | `LawyerRepository` PostgreSQL; fotos em S3/Cloudflare R2 |

### 6.7 `security/auditLogger.ts` (10 KB)

| Atributo | Detalhe |
|---|---|
| **Responsabilidade** | Log de auditoria imutável com hash chain (append-only) |
| **Qualidade** | 🟢 Conceitualmente excelente — chain integrity, 26 tipos de ação, severity levels |
| **Problemas** | (1) Persiste em localStorage — adulterável via DevTools; (2) Hash usa `btoa` (não SHA-256); (3) Máximo de 5000 entradas (truncamento); (4) `ipAddress` sempre `'browser-client'` |
| **Arquitetura Futura** | Stream de eventos para servidor imutável (AWS CloudWatch Logs / Datadog / SIEM) |

### 6.8 `security/cryptoUtils.ts` (7.9 KB)

| Atributo | Detalhe |
|---|---|
| **Responsabilidade** | Encrypt/decrypt AES-GCM 256-bit; PBKDF2 para derivação de chave; verificação de integridade |
| **Qualidade** | 🟢 Usa Web Crypto API nativa — tecnicamente correto |
| **Problemas** | (1) Chave armazenada em sessionStorage (exposta a extensões maliciosas); (2) Fallback para `$plain$` em HTTP sem TLS; (3) Chave gerada por sessão — não persiste entre reloads |
| **Arquitetura Futura** | KMS (AWS KMS / Azure Key Vault) — chave nunca no browser |

### 6.9 `security/rbac.ts` (7.5 KB)

| Atributo | Detalhe |
|---|---|
| **Responsabilidade** | Motor RBAC — roles, níveis de autoridade, permissões granulares, labels |
| **Qualidade** | 🟢 Excelente design — 9 roles, 28 permissões granulares, zero-trust por design |
| **Problemas** | (1) Enforcement APENAS no frontend — contornável via DevTools; (2) `getVisibleAdminTabs()` é cosmético sem backend |
| **Arquitetura Futura** | Guards NestJS: `@UseGuards(RbacGuard)` em todos os endpoints; decoradores `@Roles()` e `@Permissions()` |

---

## ETAPA 7 — MAPEAMENTO DOS FLUXOS CRÍTICOS

### 7.1 Fluxo de Login (AS-IS)

```
Usuário informa email + senha
         ↓
App.tsx: handleLogin() [L202]
         ↓
localStorage.getItem('legis_admin_users')  ← [RISCO-01: dados em texto plano no browser]
         ↓
hashPassword(senha)  ← [RISCO-02: btoa() reversível]
         ↓
Comparação local (sem API call)  ← [RISCO-03: auth 100% client-side]
         ↓
[Sucesso] setUser({email, role: 'admin', name})
         ↓
localStorage.setItem('legis_user', JSON.stringify(user))  ← [RISCO-04: sessão sem expiração]
         ↓
handleNavigate('adminDashboard')
         ↓
[Verificação] user?.role !== 'admin' → redirect  ← [RISCO-05: verificação client-side]
         ↓
AdminDashboard renderizado

VULNERABILIDADES DO FLUXO:
• RISCO-01: Qualquer extensão de browser lê legis_admin_users
• RISCO-02: Senhas recuperáveis em milissegundos
• RISCO-03: DevTools → localStorage.setItem('legis_user', '{"role":"admin"}') → acesso total
• RISCO-04: Sessão válida para sempre
• RISCO-05: Proteção de rota sem valor real
```

### 7.2 Fluxo de Cadastro de Cliente (AS-IS)

```
Usuário preenche formulário
         ↓
SignupPage → ClientSignupForm (validação básica manual)
         ↓
[Sem schema validation — Zod/Yup ausentes]
         ↓
Dados do cliente montados em memória (User object)
         ↓
setUser(clientUser) — estado React
         ↓
localStorage.setItem('legis_user', JSON.stringify(clientUser))
         ↓
CPF, endereço, telefone em plaintext no localStorage
         ↓
handleNavigate('dashboard')

PROBLEMAS:
• CPF sem validação de dígito verificador
• Dados não persistidos em banco — perdidos ao limpar browser
• Dados de outros clientes não disponíveis (cada usuário vê apenas seus próprios dados)
• Sem verificação de e-mail duplicado
```

### 7.3 Fluxo de Busca de Advogados (AS-IS)

```
Usuário descreve o caso (texto)
         ↓
LawyerSearch → analyzeCaseWithGemini(description)  ← [API Gemini externa]
         ↓
CaseAnalysis {primaryArea, specializations, urgency}
         ↓
Filtragem local em AppDataContext.lawyers[] (em memória)
         ↓
Filtros adicionais: cidade, área, rating, disponibilidade
         ↓
LawyerSearch → resultados renderizados
         ↓
[Opcional] findPlacesWithMaps() → Google Maps grounding
         ↓
Usuário clica → LawyerProfile

PROBLEMAS:
• Busca 100% client-side — sem índice de banco
• Gemini API exposta no bundle
• Sem paginação real (apenas renderização de todos)
• Sem relevância por distância geográfica real (coords opcionais)
```

### 7.4 Fluxo de Provisionamento de Serviço (AS-IS)

```
Usuário seleciona serviço → EfficiencyServicesPage
         ↓
[Sem gateway de pagamento real]
         ↓
ProvisioningService.createProvisioning(data)
         ↓
[State machine] status: 'PENDING'
         ↓
ProvisioningService.processProvisioning(id)
         ↓
setTimeout(30.000ms) simulando chamada a API externa
         ↓
status: 'IN_PROGRESS' → 'PROVISIONED'
         ↓
Feature flags habilitadas em localStorage (legis_client_features)
         ↓
AuditLogger.log('PROVISION_SUCCESS')
         ↓
UI atualizada

PROBLEMAS:
• Sem pagamento real — nenhuma receita é gerada
• setTimeout ≠ webhook de gateway de pagamento
• Feature flags em localStorage — contornáveis
• Provisioning perdido se browser for limpo
```

---

## ETAPA 8 — ANÁLISE DE DEPENDÊNCIAS

### 8.1 Dependências de Produção

| Dependência | Versão | Função | Risco | Alternativa |
|---|---|---|---|---|
| `react` | ^19.2.0 | UI framework principal | 🟢 Baixo — versão mais recente | — |
| `react-dom` | ^19.2.0 | Renderização DOM | 🟢 Baixo | — |
| `@google/genai` | ^1.29.0 | SDK Google Gemini API | 🟡 Médio — dependência de terceiro; mudança de pricing | OpenAI SDK, Anthropic |
| `recharts` | ^3.8.1 | Gráficos e visualizações nos dashboards | 🟢 Baixo — biblioteca madura | Chart.js, D3.js |
| `jspdf` | ^4.2.1 | Geração de PDF (relatórios, documentos) | 🟢 Baixo | PDFKit, Puppeteer |
| `jspdf-autotable` | ^5.0.8 | Plugin de tabelas para jsPDF | 🟢 Baixo | — |
| `papaparse` | ^5.5.3 | Parse/export de CSV | 🟢 Baixo | — |
| `xlsx` | ^0.18.5 | Leitura/escrita de planilhas Excel | 🟡 Médio — licença SheetJS mudou; versão 0.18 é antiga | `exceljs` |

### 8.2 Dependências de Desenvolvimento

| Dependência | Versão | Função | Risco |
|---|---|---|---|
| `vite` | ^6.2.0 | Build tool | 🟢 Baixo |
| `@vitejs/plugin-react` | ^5.0.0 | Plugin React para Vite | 🟢 Baixo |
| `typescript` | ~5.8.2 | Tipagem estática | 🟢 Baixo |
| `eslint` | ^9.39.3 | Linting | 🟢 Baixo |
| `@typescript-eslint/*` | ^8.56.x | TypeScript linting | 🟢 Baixo |

### 8.3 Dependências Ausentes (Necessárias para Produção)

| Dependência | Função | Prioridade |
|---|---|---|
| `react-router-dom` v7 | Roteamento com URL real, histórico, deep links | 🔴 CRÍTICA |
| `@tanstack/react-query` | Gerenciamento de estado assíncrono, cache, sincronização | 🔴 CRÍTICA |
| `react-hook-form` + `zod` | Validação de formulários type-safe | 🔴 ALTA |
| `axios` ou `ky` | HTTP client para API backend | 🔴 CRÍTICA |
| `vitest` + `@testing-library/react` | Framework de testes unitários | 🔴 CRÍTICA |
| `playwright` | Testes E2E | 🟡 ALTA |
| `@stripe/stripe-js` ou SDK PagarMe | Gateway de pagamento | 🔴 CRÍTICA |

---

## ETAPA 9 — AVALIAÇÃO ARQUITETURAL

### 9.1 Scorecard Arquitetural

| Categoria | Nota 0–100 | Justificativa |
|---|---|---|
| **Arquitetura Geral** | 35 | Frontend bem construído; sem backend; roteamento manual; bundle monolítico |
| **Segurança** | 18 | Auth client-side; hash fraco; PII em localStorage; API key exposta; sem MFA; sem CSP |
| **Performance** | 38 | Bundle 2.32MB único; sem lazy loading; sem CDN; sem cache strategy; sem compressão brotli |
| **Escalabilidade** | 8 | localStorage = 1 usuário/device; sem banco compartilhado; não é multi-usuário por design |
| **Compliance LGPD** | 22 | PII em localStorage sem proteção; sem DPO; sem consentimento explícito; sem direitos do titular implementados |
| **Manutenibilidade** | 45 | Código TypeScript bem tipado; componentes gigantes; sem testes; sem documentação técnica |
| **Testabilidade** | 0 | Zero testes em todo o projeto; componentes não isolados; lógica de negócio em UI |
| **Resiliência** | 8 | Falha de rede = sem dados; sem retry real; sem circuit breaker; sem fallback |
| **Modelagem de Dados** | 78 | Schema Prisma excelente — UUID como PK, soft delete, índices, RLS, relações normalizadas |
| **UX/Design** | 72 | UI premium; design system consistente; responsivo; falta padronização de mensagens de erro |
| **DevSecOps** | 42 | CI/CD configurado; sem scan de segurança; sem testes no pipeline; SAST ausente |
| **MÉDIA GERAL** | **33** | **Não apto para produção em escala** |

---

## ETAPA 10 — BACKLOG DE DÉBITOS TÉCNICOS

### Prioridade CRÍTICA

```
TECH-001
Problema: Ausência de Backend Real
Descrição: Toda a lógica de negócio, autenticação, persistência e autorização
           executa no browser do usuário via localStorage.
Impacto: Plataforma não é multi-usuário; dados não são compartilhados;
         sem fonte de verdade única; impossível para produção real.
Solução: Implementar NestJS API + PostgreSQL (Prisma já modelado).
Estimativa: 800–1200h desenvolvimento sênior
Dependências: Hospedagem backend (Railway/AWS/GCP), banco PostgreSQL gerenciado

TECH-002
Problema: Autenticação e Autorização Client-Side
Descrição: Qualquer usuário pode alterar seu role via DevTools → acesso irrestrito.
Impacto: Comprometimento total do painel administrativo e de todos os dados.
Solução: JWT com refresh tokens + guards NestJS + validação server-side por rota.
Estimativa: 150–200h
Dependências: TECH-001 (backend real)

TECH-003
Problema: Dados PII em localStorage sem Proteção
Descrição: CPF, endereço, histórico judicial, credenciais de acesso
           armazenados em texto plano acessível a qualquer extensão de browser.
Impacto: Violação massiva da LGPD; risco de multa R$50M; dano reputacional.
Solução: Migrar todos os dados para banco PostgreSQL server-side.
Estimativa: 100h (dependente de TECH-001)
Dependências: TECH-001, TECH-002

TECH-004
Problema: API Key Google Gemini Exposta no Bundle de Produção
Descrição: vite.config.ts injeta GEMINI_API_KEY no JavaScript compilado.
Impacto: Uso não autorizado da API com custos para o proprietário.
Solução: Proxy backend: browser → NestJS → Gemini (chave no servidor).
Estimativa: 40h
Dependências: TECH-001

TECH-005
Problema: Hash de Senhas Inadequado (btoa reversível)
Descrição: hashPassword() usa base64 com salt fixo — reversível em milissegundos.
Impacto: Exposição de todas as senhas de admin/staff se localStorage for lido.
Solução: bcrypt (custo 12) ou Argon2id com salt aleatório por usuário.
Estimativa: 24h
Dependências: TECH-001, TECH-002
```

### Prioridade ALTA

```
TECH-006
Problema: God Component App.tsx (761 linhas)
Solução: Separar em AuthContext, RouterComponent, ChatbotProvider, ModalManager
Estimativa: 80h refatoração

TECH-007
Problema: SettingsTab.tsx (259KB / 4671 linhas)
Solução: Dividir em 12 componentes independentes (BrandingSection, DatabaseSection, etc.)
Estimativa: 120h refatoração

TECH-008
Problema: Ausência total de testes
Solução: Vitest + Testing Library; meta 70% cobertura; Playwright E2E
Estimativa: 400h implementação inicial

TECH-009
Problema: Bundle de produção único 2.32MB sem code splitting
Solução: React.lazy() + Suspense por rota; manualChunks Vite; target < 300KB inicial
Estimativa: 60h

TECH-010
Problema: Sem roteamento URL real (React Router ausente)
Solução: react-router-dom v7 com rota por View; deep links; history API
Estimativa: 80h

TECH-011
Problema: Sem validação de formulários (Zod ausente)
Solução: zod + react-hook-form em todos os formulários de cadastro
Estimativa: 80h

TECH-012
Problema: Audit log armazenado em localStorage (adulterável)
Solução: Enviar logs imediatamente para endpoint servidor; SIEM integration
Estimativa: 60h (dependente de TECH-001)
```

### Prioridade MÉDIA

```
TECH-013: Sem expiração de sessão → JWT com TTL 15min + refresh token 7 dias
TECH-014: Sem MFA para contas admin → TOTP (speakeasy)
TECH-015: Sem rate limiting de login → 5 tentativas → lockout 15min
TECH-016: Sem Content Security Policy (CSP) → header restritivo
TECH-017: Dependência xlsx v0.18 desatualizada → migrar para exceljs
TECH-018: URLs de imagens de advogados hardcoded → migrar para CDN/S3
TECH-019: Sem monitoramento de erros em produção → Sentry integration
TECH-020: Sem analytics de uso → PostHog ou Mixpanel
```

---

## ETAPA 11 — ARQUITETURA ALVO (TO-BE)

### 11.1 Diagrama da Arquitetura Futura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LEGIS CONNECT — ARQUITETURA TO-BE                   │
│                          (Corporativa, Segura, Escalável)                  │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────┐
  │                    CLIENTES (Browsers)                 │
  │  React 19 SPA (código público — sem secrets)           │
  │  Code-split por rota (<300KB inicial)                  │
  │  React Router v7 + React Query + Zod                  │
  └─────────────────────┬─────────────────────────────────┘
                         │ HTTPS (TLS 1.3)
                         │
  ┌──────────────────────▼──────────────────────────────────┐
  │                   CDN / Edge Layer                       │
  │  Cloudflare CDN — assets estáticos cacheados            │
  │  WAF — proteção DDoS e injeção                          │
  │  Rate limiting por IP (edge rules)                       │
  └──────────────────────┬──────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────┐
  │                  API Gateway                             │
  │  Nginx / Kong — routing, auth middleware, CORS          │
  │  Rate limiting granular por endpoint + usuário          │
  └──────────────────────┬──────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────┐
  │               NestJS API — Monorepo Modular              │
  │  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌─────────────┐ │
  │  │AuthModule│ │UserMod.│ │CasesModule│ │FinanceModule│ │
  │  │JWT+bcrypt│ │RBAC    │ │Processos  │ │Stripe/PagarMe│ │
  │  └──────────┘ └────────┘ └──────────┘ └─────────────┘ │
  │  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌─────────────┐ │
  │  │DocModule │ │ChatMod.│ │AIModule  │ │AuditModule  │ │
  │  │S3 presign│ │WS E2E  │ │Gemini Prx│ │Imutável     │ │
  │  └──────────┘ └────────┘ └──────────┘ └─────────────┘ │
  └──────┬────────────────────────────────────┬────────────┘
         │                                    │
  ┌──────▼──────┐                    ┌────────▼────────┐
  │  PostgreSQL  │                    │      Redis       │
  │  (Primary)  │                    │ Sessions, Cache │
  │  + Read     │                    │ Rate Limit      │
  │  Replicas   │                    │ Bull Queues     │
  └─────────────┘                    └─────────────────┘
         │                                    │
  ┌──────▼─────────────────────────────────────────────┐
  │                  Serviços Externos                   │
  │  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌─────────┐ │
  │  │ Google   │ │Stripe/ │ │ AWS S3   │ │ Sentry  │ │
  │  │ Gemini   │ │PagarMe │ │(Documentos│ │Datadog  │ │
  │  │ (server) │ │(Webhook│ │  Jurídicos│ │SIEM     │ │
  │  └──────────┘ └────────┘ └──────────┘ └─────────┘ │
  └────────────────────────────────────────────────────┘
```

### 11.2 Tecnologias e Responsabilidades

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| **Frontend** | React 19 + React Router v7 + React Query + Zod | UI, formulários validados, estado assíncrono cacheado |
| **API Gateway** | Nginx + Kong | Routing, rate limiting, CORS, auth headers |
| **Backend** | NestJS + Passport.js + JWT | Lógica de negócio, autenticação, autorização, guards RBAC |
| **ORM** | Prisma (schema já pronto) | Acesso ao banco PostgreSQL type-safe |
| **Banco Principal** | PostgreSQL 16 (gerenciado) | Dados relacionais — usuários, casos, financeiro |
| **Cache/Queue** | Redis + Bull | Sessões, rate limit, provisionamento assíncrono, notificações |
| **Storage** | AWS S3 / Cloudflare R2 | Documentos jurídicos, logos, uploads |
| **AI Proxy** | NestJS AIModule | Proxy para Gemini — chave nunca no frontend |
| **Pagamentos** | Stripe ou PagarMe (webhooks) | Gateway de pagamento, receita real, chargebacks |
| **Auditoria** | AWS CloudWatch + SIEM | Logs imutáveis, alertas, compliance |
| **Monitoramento** | Sentry + Datadog | Error tracking, APM, métricas de performance |
| **CDN** | Cloudflare | Assets estáticos, WAF, DDoS protection |

---

## ETAPA 12 — ROADMAP DE MIGRAÇÃO

### FASE 1 — Correções Críticas de Segurança (0–30 dias)

```
Semana 1-2 (Emergencial):
  ✅ Tornar repositório GitHub privado
  ✅ Trocar credenciais expostas em commits (BFG Repo Cleaner)
  ✅ Revogar e rotacionar GEMINI_API_KEY
  ✅ Adicionar GEMINI_API_KEY como GitHub Secret no CI/CD
  ✅ Registrar marca "Legis Connect" no INPI
  
Semana 3-4 (Segurança Básica):
  ✅ Provisionar PostgreSQL gerenciado (Neon.tech ou Railway — gratuito para MVP)
  ✅ Criar NestJS API mínima com:
      - Autenticação JWT + bcrypt
      - Endpoint /auth/login e /auth/refresh
      - Middleware RBAC básico
  ✅ Proxy Gemini API: /api/ai/* → Gemini (remover do bundle)
  ✅ Configurar CORS restritivo (apenas legisconnect.com.br)
  ✅ Adicionar CSP + HSTS headers
```

### FASE 2 — Migração de Dados e Backend Core (30–90 dias)

```
Mês 2:
  ✅ Executar: npx prisma migrate deploy (schema já pronto)
  ✅ Implementar endpoints CRUD:
      - /api/users (cadastro, perfil)
      - /api/lawyers (busca, CRUD)
      - /api/cases (processos)
      - /api/appointments (agendamentos)
  ✅ Migrar AuthService do App.tsx para NestJS AuthModule
  ✅ Adicionar react-router-dom v7 ao frontend
  ✅ Integrar React Query para fetch de dados via API
  ✅ Rate limiting: 5 tentativas de login → lockout 15min
  
Mês 3:
  ✅ Integrar gateway de pagamento (Stripe ou PagarMe)
  ✅ Implementar provisionamento via Bull Queue (substituir setTimeout)
  ✅ Audit log: stream para backend imutável
  ✅ Implementar validação Zod em todos os formulários
  ✅ Vitest: cobertura inicial de 40%
```

### FASE 3 — Escala e Observabilidade (90–180 dias)

```
Mês 4-5:
  ✅ Implementar Redis para sessões e rate limiting
  ✅ Implementar WebSockets (chat E2E entre advogado e cliente)
  ✅ Code splitting com React.lazy() — bundle inicial < 300KB
  ✅ Integrar Sentry (error tracking) + Datadog (APM)
  ✅ S3 / Cloudflare R2 para upload de documentos jurídicos
  ✅ MFA (TOTP) obrigatório para contas admin
  ✅ Vitest: cobertura ≥ 70%; Playwright E2E para fluxos críticos
  
Mês 6:
  ✅ Read replicas PostgreSQL para queries pesadas (busca, relatórios)
  ✅ Implementar SIEM integration (audit logs)
  ✅ Conformidade LGPD completa:
      - Direitos do titular (acesso, portabilidade, exclusão)
      - Consentimento explícito com registro
      - DPO nomeado e contato publicado
  ✅ Certificação ISO 27001 (início do processo)
  ✅ Deploy em infraestrutura dedicada (AWS/GCP — sair do GitHub Pages)
```

---

## ENTREGÁVEIS — RESUMO DO DOCUMENTO

### ✅ Documento de Arquitetura Atual (AS-IS)
**Concluído** — Seções 1–10 deste documento.

### ✅ Mapa Completo de Módulos
**Concluído** — Etapas 2, 3 e 4: 12 módulos mapeados, fluxo de estado, árvore de componentes.

### ✅ Mapa de Dependências
**Concluído** — Etapa 8: 13 dependências analisadas, 7 ausências críticas identificadas.

### ✅ Fluxogramas Principais
**Concluído** — Etapa 7: Login, Cadastro de Cliente, Busca de Advogados, Provisionamento.

### ✅ Matriz de Riscos Técnicos
**Consolidada** nas Etapas 5, 6 e 9.

### ✅ Lista de Débitos Técnicos
**Concluída** — Etapa 10: 20 itens priorizados (5 CRÍTICOS, 7 ALTOS, 8 MÉDIOS).

### ✅ Arquitetura Futura Recomendada (TO-BE)
**Concluída** — Etapa 11: diagrama completo, tecnologias e responsabilidades.

### ✅ Roadmap de Migração
**Concluído** — Etapa 12: 3 fases (0–30 dias, 30–90 dias, 90–180 dias).

### 📋 Próximos Passos Imediatos

| Prioridade | Ação | Responsável | Prazo |
|---|---|---|---|
| 1° | Tornar repositório privado + rotacionar credenciais | Founder | Hoje |
| 2° | Provisionar PostgreSQL gerenciado (Neon.tech — grátis) | Dev Backend | 3 dias |
| 3° | Criar NestJS API mínima (auth JWT + bcrypt) | Dev Backend | 2 semanas |
| 4° | Criar proxy NestJS para Gemini API | Dev Backend | 1 semana |
| 5° | Contratar advogado para ToS/Privacy Policy LGPD-compliant | Founder | 2 semanas |
| 6° | Integrar React Router v7 no frontend | Dev Frontend | 2 semanas |
| 7° | Implementar Zod + react-hook-form nos formulários | Dev Frontend | 3 semanas |
| 8° | Primeiro teste unitário (Auth flow) | Dev | 3 semanas |

---

*Documento gerado em 25/07/2026 como produto da Architecture Discovery Phase — Prompt 001.*
*Todos os dados são baseados em análise direta do código-fonte do repositório `instsermelhor/Legis`.*
*Próximo documento: PROMPT 002 — Especificação da Arquitetura TO-BE (NestJS + PostgreSQL)*
