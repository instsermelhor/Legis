# ⚛️ FRONTEND ARCHITECTURE BLUEPRINT — LEGIS CONNECT
**PROMPT 002 — Mapeamento Profundo de Componentes React + Plano de Modularização**
**Arquiteto Frontend Enterprise Sênior | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A camada frontend da Legis Connect é tecnicamente bem construída no que tange a **design system, componentização básica e UX**. O projeto utiliza React 19 + TypeScript 5.8 + Vite 6, tem identidade visual premium e múltiplos dashboards funcionais.

**O problema central não é a qualidade do código, mas a concentração de responsabilidades**: três arquivos totalizam **470KB** de código React — mais da metade de toda a lógica da plataforma — tornando manutenção, testing e evolução paralela por equipes impossíveis.

Adicionalmente, a ausência de React Router, React Query, Zod e framework de testes torna o frontend tecnicamente pré-produção.

---

## ETAPA 1 — INVENTÁRIO COMPLETO DE COMPONENTES

### 1.1 Mega-Componentes (Hot Spots de Dívida Técnica)

| Componente | Localização | Tamanho | Linhas | Responsabilidades | Complexidade | Problemas |
|---|---|---|---|---|---|---|
| `SettingsTab.tsx` | `components/admin/` | 259 KB | ~4.671 | Branding, DB config, Staff CRUD, Audit Log, Impersonation, BI, Security, OAB tools, Legal codes | 🔴 EXTREMA | Viola SRP em 10+ eixos; impossível testar |
| `LawyerDashboard.tsx` | `components/lawyer/` | 179 KB | 2.328 | Overview, casos, agenda, financeiro, IA tools, estagiários, secretárias, perfil, documentos | 🔴 EXTREMA | God component; 25 imports; estado local gigantesco |
| `FinanceTab.tsx` | `components/admin/` | 79 KB | ~1.400 | Relatórios, transações, KPIs, gráficos, exports, provisioning financeiro | 🔴 ALTA | 4+ responsabilidades; difícil de testar |
| `AdminCommandsTab.tsx` | `components/admin/` | 78 KB | ~1.400 | Comandos de sistema, BI avançado, ferramentas de compliance | 🔴 ALTA | Lógica de negócio misturada com UI |
| `RegistrationsTab.tsx` | `components/admin/` | 70 KB | ~1.200 | CRUD completo advogados+clientes+estagiários+secretárias em uma tela | 🔴 ALTA | Deveria ser 4 componentes separados |
| `LegalManagementDashboard.tsx` | `components/lawyer/` | 82 KB | ~1.500 | Gestão de processos, kanban, documentos jurídicos, petições | 🔴 ALTA | Módulo completo em arquivo único |
| `LoginForm.tsx` | `components/auth/` | 25 KB | ~450 | Login admin + login mock de todos os perfis + validação + navegação | 🟡 ALTA | Lógica de negócio misturada; mock hardcoded |
| `LoginModal.tsx` | `components/common/` | 25 KB | ~450 | Duplicação do LoginForm adaptada para modal contextual | 🟡 ALTA | Código duplicado com LoginForm |
| `LegalAiTools.tsx` | `components/common/` | 26 KB | ~480 | 8 ferramentas de IA (peças, pesquisas, áudio, transcrição, revisão, etc.) | 🟡 ALTA | Poderia ser 8 componentes por ferramenta |
| `EfficiencyServicesPage.tsx` | `components/client/` | 28 KB | ~520 | Catálogo de serviços, filtros, checkout simulado, grupos de serviços | 🟡 MÉDIA | Sem separação de lista/detalhe/checkout |

### 1.2 Componentes de Qualidade Adequada

| Componente | Localização | Tamanho | Responsabilidade | Complexidade | Avaliação |
|---|---|---|---|---|---|
| `App.tsx` | Raiz | 31 KB | Roteamento, auth, chatbot, modais — GOD | 🔴 CRÍTICO | Deve ser 5 arquivos |
| `ClientDashboard.tsx` | `client/` | 17 KB | Shell + navegação entre 7 sub-abas | 🟡 Média | Bem modularizado em sections/ |
| `AdminDashboard.tsx` | `admin/` | 12 KB | Shell do painel admin (nav + roteamento) | 🟢 Boa | Pequeno e focado |
| `DashboardShell.tsx` | `ui/` | 5.8 KB | Layout unificado com sidebar + mobile | 🟢 Excelente | Componente genérico reutilizável |
| `LawyerProfile.tsx` | `lawyer/` | 7.3 KB | Exibição de perfil público do advogado | 🟢 Boa | Foco único |
| `BookingCalendar.tsx` | `common/` | 11 KB | Calendário de disponibilidade e agendamento | 🟡 Média | Adequada para a complexidade |
| `StaffManagementTab.tsx` | `admin/staff/` | 19 KB | CRUD de colaboradores internos | 🟡 Média | Aceitável |
| `ImpersonationPanel.tsx` | `admin/staff/` | 17 KB | Modo espelho (impersonation) com auditoria | 🟡 Média | Bem estruturado |
| `Toast.tsx` | `common/` | 4.6 KB | Sistema de notificações toast | 🟢 Excelente | Simples e reutilizável |
| `EmptyState.tsx` | `common/` | 1.5 KB | Estado vazio padronizado | 🟢 Excelente | Componente atômico ideal |
| `StarRating.tsx` | `common/` | 1.7 KB | Input de avaliação por estrelas | 🟢 Excelente | Componente atômico |
| `CaseProgressTracker.tsx` | `common/` | 1.9 KB | Tracker visual de etapas do processo | 🟢 Boa | Foco único |
| `TabNav.tsx` | `common/` | 2.7 KB | Navegação por abas reutilizável | 🟢 Excelente | Componente genérico |

### 1.3 UI Kit — components/ui/ (Biblioteca Interna)

| Componente | Tamanho | Responsabilidade | Avaliação |
|---|---|---|---|
| `Button.tsx` | 1.2 KB | Botão reutilizável com variantes | 🟢 Excelente |
| `Card.tsx` | 0.5 KB | Container com estilo padrão | 🟢 Excelente |
| `Badge.tsx` | 0.6 KB | Badge/Tag informativa | 🟢 Excelente |
| `KpiCard.tsx` | 2 KB | Card de métrica com ícone e tendência | 🟢 Excelente |
| `SectionHeader.tsx` | 1.5 KB | Cabeçalho de seção padronizado | 🟢 Excelente |
| `GradientHero.tsx` | 1.6 KB | Banner hero com gradiente | 🟢 Boa |
| `ChartTooltip.tsx` | 1.3 KB | Tooltip customizado para Recharts | 🟢 Boa |
| `DashboardShell.tsx` | 5.8 KB | Layout shell reutilizável | 🟢 Excelente |
| `theme.ts` | 4.7 KB | Tokens: cores, acentos, CARD, INPUT, LABEL | 🟢 Excelente |
| `useReveal.ts` | 0.8 KB | Hook de animação scroll-reveal | 🟢 Boa |

---

## ETAPA 2 — ÁRVORE HIERÁRQUICA REACT COMPLETA

```
index.tsx  ←  Entry Point
│
└── <React.StrictMode>
     └── <ToastProvider>           ← Notificações globais
          └── <AppProvider>        ← Config: branding, logo, dbType
               └── <AppDataProvider>  ← Dados: lawyers, clients, interns, secretaries, services
                    └── <App />  🔴 GOD COMPONENT (761 linhas)
                         │
                         ├── [Estado App.tsx]
                         │    ├── currentView: View (roteamento por estado)
                         │    ├── user: User | null (sessão)
                         │    ├── searchResults: Lawyer[]
                         │    ├── selectedLawyer: Lawyer | null
                         │    ├── mapsResult: MapsSearchResult | null
                         │    ├── isChatbotOpen / chatHistory / isChatbotLoading
                         │    └── isTermsModalOpen / isPrivacyModalOpen / isEticaModalOpen
                         │         isLoginModalOpen / isProfileSelectorOpen / loginPendingAction
                         │
                         ├── <Header>                    ← layout/Header.tsx
                         │    ├── Logo + Nav links
                         │    ├── Botão Login/Logout
                         │    └── Menu hamburger mobile
                         │
                         ├── [Roteamento por currentView — switch condicional JSX]
                         │
                         │   ── ROTAS PÚBLICAS ──────────────────────────────
                         │    ├── 'landing'          → <LandingPage>
                         │    │    └── Seções: Hero, Features, How it works, CTA, Testimonials
                         │    │
                         │    ├── 'forLawyers'       → <ForLawyersPage>
                         │    ├── 'forInterns'       → <ForInternsPage>
                         │    ├── 'forClients'       → <ForClientsPage>
                         │    ├── 'forSecretariado'  → <ForSecretariadoPage>
                         │    ├── 'services'         → <ServicesPublicPage>
                         │    │
                         │   ── ROTAS DE AUTH ──────────────────────────────
                         │    ├── 'login'            → <LoginForm>
                         │    │    └── Tabs: Entrar | Cadastrar + perfis
                         │    ├── 'signup'           → <SignupPage>
                         │    │    ├── <ClientSignupForm>    (13KB)
                         │    │    ├── <LawyerSignupForm>    (22KB)
                         │    │    ├── <InternSignupForm>    (21KB)
                         │    │    └── SecretarySignupForm
                         │    │
                         │   ── ROTAS DE BUSCA ─────────────────────────────
                         │    ├── 'search'           → <LawyerSearch>
                         │    │    ├── Filtros de especialidade/cidade
                         │    │    ├── → analyzeCaseWithGemini()
                         │    │    ├── → findPlacesWithMaps()
                         │    │    └── Cards de advogado
                         │    ├── 'profile'          → <LawyerProfile>
                         │    │
                         │   ── ÁREAS AUTENTICADAS ─────────────────────────
                         │    ├── 'dashboard'        → <ClientDashboard>
                         │    │    ├── <DashboardShell>           (layout)
                         │    │    ├── sections/ClientOverview
                         │    │    ├── sections/ClientProfile
                         │    │    ├── sections/ClientLawyerSearch
                         │    │    ├── sections/ClientProcessTracker
                         │    │    ├── sections/ClientContracts
                         │    │    ├── sections/ClientFinancial
                         │    │    └── <EfficiencyServicesPage>   (28KB)
                         │    │
                         │    ├── 'lawyerDashboard'  → <LawyerDashboard>  🔴 179KB
                         │    │    ├── [Abas internas — 15+ seções]
                         │    │    ├── Overview / KPIs
                         │    │    ├── Agenda → <AgendaSync>
                         │    │    ├── Casos → <LegalManagementDashboard> 🔴 82KB
                         │    │    │    ├── Kanban (cases/)
                         │    │    │    ├── Documentos
                         │    │    │    └── Petições IA
                         │    │    ├── Financeiro → <FinancialKPI>        (33KB)
                         │    │    ├── Perfil (edição completa)
                         │    │    ├── Ferramentas IA → <LegalAiTools>    (26KB)
                         │    │    ├── Estagiários → <InternApprovalQueue>
                         │    │    ├── Secretária → <SecretaryWorkspace>
                         │    │    ├── Serviços → <EfficiencyServicesPage>
                         │    │    └── Documentos → <DocumentReceiver>
                         │    │
                         │    ├── 'internDashboard'  → <InternDashboard>
                         │    ├── 'secretariadoDashboard' → <SecretariadoDashboard>
                         │    │
                         │   ── ÁREA ADMINISTRATIVA ──────────────────────
                         │    └── 'adminDashboard'   → <AdminDashboard>
                         │         ├── <DashboardShell>  (layout)
                         │         ├── 'overview'    → <OverviewTab>       (25KB)
                         │         ├── 'finance'     → <FinanceTab>        🔴 79KB
                         │         ├── 'registrations' → <RegistrationsTab> 🔴 70KB
                         │         ├── 'services'    → <ServicesManagementTab>
                         │         ├── 'admin_commands' → <AdminCommandsTab> 🔴 78KB
                         │         ├── 'staff'       → <StaffManagementTab>
                         │         │    └── <ImpersonationPanel>
                         │         └── 'settings'    → <SettingsTab>      🔴 259KB
                         │              ├── Branding (logo, cores, tagline)
                         │              ├── Database (config LocalStorage/Cloud)
                         │              ├── Staff Management
                         │              ├── Audit Log (viewer + export)
                         │              ├── Impersonation Panel
                         │              ├── Security Config
                         │              ├── BI / Analytics
                         │              ├── OAB Tools
                         │              ├── Legal Codes
                         │              └── System Commands
                         │
                         ├── <Footer>                    ← layout/Footer.tsx
                         ├── <ChatbotFab>                ← chatbot/ChatbotFab.tsx
                         ├── <ChatbotModal>              ← chatbot/ChatbotModal.tsx
                         ├── <LoginModal>                ← common/LoginModal.tsx (25KB)
                         ├── <ProfileSelectorModal>
                         ├── <TermsOfServiceModal>
                         ├── <PrivacyPolicyModal>
                         └── <EticaOABModal>
```

---

## ETAPA 3 — ANÁLISE DE RESPONSABILIDADE (SRP)

### FRONT-001: App.tsx — Violação Extrema de SRP

**Problema**: O App.tsx (761 linhas, 31KB) acumula 6 responsabilidades distintas:

| Responsabilidade | Deve ir para |
|---|---|
| Roteamento (`currentView` state machine) | `<AppRouter>` com React Router v7 |
| Lógica de autenticação (`handleLogin`, `handleLogout`) | `AuthContext` + `useAuth()` hook |
| Lógica de autorização (guards de rota) | `<PrivateRoute>` / `<RoleGuard>` |
| Estado do chatbot | `ChatbotContext` ou componente próprio |
| Gerenciamento de modais globais | `ModalContext` ou `useModalManager()` |
| Seed de super admin no localStorage | `useSeedAdminEffect()` hook |

**Estrutura recomendada:**
```
src/app/
 ├── AppProviders.tsx      ← Stack de providers
 ├── AppRouter.tsx         ← React Router routes
 ├── AuthContext.tsx        ← auth state + handlers
 ├── ModalContext.tsx       ← modal state manager
 └── ChatbotContext.tsx     ← chatbot state
```

---

### FRONT-002: SettingsTab.tsx (259KB / 4.671 linhas)

**Responsabilidades Identificadas (10 eixos distintos):**

| Sub-responsabilidade | Linhas Aprox. | Componente Proposto |
|---|---|---|
| Configuração de branding (logo, cores, tagline) | ~300 | `settings/BrandingSettings.tsx` |
| Configuração de banco de dados (local/cloud) | ~250 | `settings/DatabaseSettings.tsx` |
| Configuração de contato e domínio | ~150 | `settings/ContactSettings.tsx` |
| Gestão de staff interno | ~600 | `settings/StaffSettings.tsx` |
| Audit log (viewer, filtros, export) | ~500 | `settings/AuditLogViewer.tsx` |
| Painel de impersonation | ~400 | `settings/ImpersonationSettings.tsx` |
| Configuração de segurança (MFA, CSP, session) | ~350 | `settings/SecuritySettings.tsx` |
| BI / Analytics dashboard | ~500 | `settings/BiDashboard.tsx` |
| Ferramentas OAB (verificação, compliance) | ~400 | `settings/OabTools.tsx` |
| Códigos legais (CRUD de leis/artigos) | ~400 | `settings/LegalCodesManager.tsx` |
| Comandos de sistema (reset, export, import) | ~800 | `settings/SystemCommands.tsx` |

**Estrutura Recomendada:**
```
features/admin/settings/
 ├── SettingsTab.tsx           ← Shell com tabs (< 100 linhas)
 ├── components/
 │    ├── BrandingSettings.tsx
 │    ├── DatabaseSettings.tsx
 │    ├── ContactSettings.tsx
 │    ├── StaffSettings.tsx
 │    ├── AuditLogViewer.tsx
 │    ├── ImpersonationSettings.tsx
 │    ├── SecuritySettings.tsx
 │    ├── BiDashboard.tsx
 │    ├── OabTools.tsx
 │    ├── LegalCodesManager.tsx
 │    └── SystemCommands.tsx
 └── hooks/
      ├── useAuditLog.ts
      ├── useStaffCrud.ts
      └── useSystemConfig.ts
```

---

### FRONT-003: LawyerDashboard.tsx (179KB / 2.328 linhas)

**25 imports identificados** — sinalizador crítico de acoplamento excessivo.

**Responsabilidades:**

| Sub-responsabilidade | Componente Proposto |
|---|---|
| Overview / KPIs financeiros e operacionais | `lawyer/overview/LawyerOverview.tsx` |
| Agenda e disponibilidade | `lawyer/schedule/ScheduleManager.tsx` |
| Gestão de processos (kanban) | `lawyer/cases/CasesManager.tsx` |
| Financeiro (receitas, pendências) | `lawyer/finance/LawyerFinance.tsx` |
| Edição de perfil público | `lawyer/profile/ProfileEditor.tsx` |
| Ferramentas de IA (peças, pesquisas) | `lawyer/ai/LegalAiWorkspace.tsx` |
| Gestão de estagiários | `lawyer/team/InternsPanel.tsx` |
| Gestão de secretárias | `lawyer/team/SecretaryPanel.tsx` |
| Serviços de eficiência | `lawyer/services/LawyerServices.tsx` |
| Recebimento de documentos | `lawyer/documents/DocumentReceiver.tsx` |

**Estrutura Recomendada:**
```
features/lawyer/
 ├── LawyerDashboard.tsx        ← Shell com DashboardShell (< 80 linhas)
 ├── overview/
 ├── schedule/
 ├── cases/
 │    ├── CasesManager.tsx
 │    ├── CaseKanban.tsx
 │    └── CaseDetail.tsx
 ├── finance/
 ├── profile/
 ├── ai/
 ├── team/
 │    ├── InternsPanel.tsx
 │    └── SecretaryPanel.tsx
 ├── services/
 └── documents/
```

---

### FRONT-004: LoginForm.tsx e LoginModal.tsx — Duplicação e Lógica de Negócio

**Problema**: Dois componentes de 25KB cada, com código praticamente duplicado. Ambos implementam:
- Mock de autenticação hardcoded
- Lógica de negócio (qual dashboard navegar por role)
- UI de formulário

**Solução**: Extrair `useLoginForm()` hook com a lógica; criar `<LoginFormUI>` puro (apenas apresentação); eliminar `LoginModal.tsx` reutilizando `LoginFormUI` dentro de um `<Modal>`.

---

### FRONT-005: RegistrationsTab.tsx — 4 CRUDs em 70KB

Gerencia CRUD completo de advogados, clientes, estagiários e secretárias na mesma tela.

**Solução**:
```
features/admin/registrations/
 ├── RegistrationsTab.tsx        ← Shell com tabs (< 80 linhas)
 ├── lawyers/LawyerRegistrations.tsx
 ├── clients/ClientRegistrations.tsx
 ├── interns/InternRegistrations.tsx
 └── secretaries/SecretaryRegistrations.tsx
```

---

## ETAPA 4 — AUDITORIA DE PROPS E COMUNICAÇÃO

### 4.1 Prop Drilling Identificado

```
App.tsx
 ├── user (User | null)
 │    ↓ prop drilling
 │    ├── ClientDashboard     → props: user, onNavigate, onLogout, onUpdateLawyerReview
 │    ├── LawyerDashboard     → props: lawyer (user.data), onLogout
 │    ├── InternDashboard     → props: intern, onLogout
 │    └── AdminDashboard      → props: adminUserEmail, onLogout
 │
 ├── onNavigate (handleNavigate)
 │    ↓ prop drilling para 3+ níveis
 │    └── ClientDashboard → sections/ClientLawyerSearch → (passa novamente)
 │
 └── allLawyers (de AppDataContext — mas re-passado via props em alguns casos)
```

**Diagnóstico**: O prop drilling de `user` e `onNavigate` é o padrão principal de comunicação. Resolve-se com `AuthContext` + `useAuth()` hook — qualquer componente pode obter o usuário sem receber via prop.

### 4.2 Fluxo de Comunicação

```
[Usuário interage com UI]
         ↓
[Componente chama callback/setState]
         ↓ (prop drilling ou Context)
[App.tsx ou Context atualiza estado]
         ↓
[React re-renderiza subárvore afetada]
         ↓ (localStorage.setItem no useEffect)
[Dados persistidos no localStorage]
         ↓ (StorageEvent em outra aba)
[AppDataContext sincroniza parcialmente]
```

### 4.3 Acoplamentos Ocultos Críticos

| Acoplamento | Descrição | Impacto |
|---|---|---|
| `LawyerDashboard` importa `mockInterns` e `mockSecretaries` diretamente | Importação direta de serviço mock dentro de componente de UI | 🔴 Viola Clean Architecture |
| `ClientDashboard` tem `mockLawyers[0]` hardcoded como `FALLBACK_LAWYER` | Dado de negócio hardcoded no componente | 🟡 Deve vir de contexto/API |
| `LoginForm` contém senha hardcoded `@@Rk08266570#` inline | Credencial de produção em código de UI | 🔴 Crítico (segurança) |
| `App.tsx` constrói `mockCases` e `mockAppointments` inline para clientes | Mock de dados de caso returnam para qualquer usuário autenticado | 🔴 Crítico (dados falsos) |

---

## ETAPA 5 — AUDITORIA DOS HOOKS REACT

### 5.1 Hooks em App.tsx

```typescript
// Estado principal — App.tsx
const [currentView, setCurrentView] = useState<View>(() => {
  // ← Lógica de inicialização complexa (8 linhas) — deveria ser hook próprio
});

// Efeitos de sincronização
useEffect(() => localStorage.setItem('legis_currentView', currentView), [currentView]);
// ✅ Correto

useEffect(() => {
  // Seed de superadmin (40+ linhas de lógica dentro de efeito)
  // 🔴 Problema: lógica de negócio complexa em useEffect — difícil de testar
}, []);

useEffect(() => {
  // Detecção de autocadastro token na URL
  // 🟡 Aceitável mas deveria ser hook próprio: useAutoRegistrationToken()
}, []);

useEffect(() => {
  // Inicializa chatbot com mensagem de boas-vindas
  // 🟢 Correto — dependência dupla [isChatbotOpen, chatHistory.length]
}, [isChatbotOpen, chatHistory.length]);
```

### 5.2 Padrões de Hooks Identificados

| Hook | Componente | Avaliação | Problema |
|---|---|---|---|
| `useState` | Onipresente | 🟢 Uso correto | — |
| `useEffect` (sync localStorage) | App.tsx | 🟢 Correto | — |
| `useEffect` (seed admin) | App.tsx | 🔴 Incorreto | Lógica de negócio em efeito; não testável |
| `useCallback` (handleLogin, handleNavigate) | App.tsx | 🟢 Correto | Dependências corretas |
| `useMemo` | LawyerDashboard, outros | 🟡 Parcial | Ausente onde custos de cálculo são altos |
| `useContext` (AppDataContext) | Múltiplos | 🟢 Correto | — |
| `useRef` | ClientDashboard (messagesEndRef) | 🟢 Correto | — |
| `useReveal` (custom) | components/ui/ | 🟢 Bom | Scroll animation customizado |

### 5.3 Hooks Personalizados — Inventário

| Hook | Localização | Responsabilidade |
|---|---|---|
| `useAppData()` | `context/AppDataContext.tsx` | Acesso ao contexto de dados global |
| `useAppConfig()` | `context/AppContext.tsx` | Acesso à configuração de branding |
| `useReveal()` | `components/ui/useReveal.ts` | Animação de scroll reveal |

**Déficit Crítico**: A plataforma tem apenas 3 hooks customizados. Uma aplicação desta complexidade deveria ter pelo menos 15–20 hooks especializados. Toda a lógica de negócio que hoje está em componentes/App.tsx deveria estar em hooks testáveis:
- `useAuth()` — estado de autenticação
- `useLawyerSearch()` — busca com filtros e Gemini
- `useProvisioning()` — ciclo de vida de serviços
- `useCaseManagement()` — CRUD de processos
- `useAuditLog()` — leitura do log de auditoria
- `useStaffCrud()` — CRUD de colaboradores
- `useFinancialData()` — transações financeiras

---

## ETAPA 6 — ANÁLISE DO GERENCIAMENTO DE ESTADO

### 6.1 Mapa do Estado Global Atual

```
Estado Global (React Context)
│
├── ToastContext
│    └── toasts: Toast[]       → Local de UI (OK)
│
├── AppContext (AppProvider)
│    └── config: AppConfig     → Database type, branding, contact
│         ↑
│         Lida via: useAppConfig()
│
└── AppDataContext (AppDataProvider)
     ├── lawyers: Lawyer[]        → Fonte de verdade dos advogados
     ├── clients: MockClient[]    → Fonte de verdade dos clientes
     ├── interns: MockIntern[]    → Fonte de verdade dos estagiários
     ├── secretaries: MockSecretary[] → Fonte de verdade das secretárias
     ├── services: EfficiencyService[]
     └── serviceGroups: EfficiencyServiceGroup[]
          ↑
          Lida via: useAppData()
```

### 6.2 Estado Local em App.tsx (Deve ser Extraído)

```
App.tsx useState (deve migrar para contextos):
│
├── currentView        → AuthContext + React Router
├── user               → AuthContext
├── searchResults      → useLocalState (dentro de LawyerSearch)
├── selectedLawyer     → useLocalState (dentro de LawyerSearch)
├── mapsResult         → useLocalState (dentro de LawyerSearch)
├── isChatbotOpen      → ChatbotContext
├── chatHistory        → ChatbotContext
├── isChatbotLoading   → ChatbotContext
└── is*ModalOpen       → ModalContext
```

### 6.3 Classificação do Estado por Destino

| Estado | Destino Atual | Destino Correto |
|---|---|---|
| Sessão de usuário autenticado | `localStorage.legis_user` | `AuthContext` + JWT cookie httpOnly |
| Lista de advogados | `localStorage.legis_lawyers` + AppDataContext | PostgreSQL via React Query |
| Lista de clientes | `localStorage.legis_clients` + AppDataContext | PostgreSQL via React Query |
| Transações financeiras | `localStorage.legis_financial_tx` | PostgreSQL via React Query |
| Configuração de app | `localStorage.legis_app_config` | `AppContext` + PostgreSQL (admin settings) |
| Audit log | `localStorage.legis_audit_log` | Servidor imutável (streaming) |
| Provisionamentos | `localStorage.legis_service_provisionings` | PostgreSQL + Bull Queue |
| Toast notifications | `ToastContext` (memória) | ✅ Correto — local de UI |
| Estado de modais | App.tsx useState | `ModalContext` |
| Estado de roteamento | App.tsx `currentView` | React Router v7 |

---

## ETAPA 7 — ANÁLISE DE ROTAS E NAVEGAÇÃO

### 7.1 Views Mapeadas (State Machine Atual)

```typescript
type View =
  | 'landing'             // ← Público
  | 'search'              // ← Público
  | 'profile'             // ← Público
  | 'forLawyers'          // ← Público
  | 'forInterns'          // ← Público
  | 'forClients'          // ← Público
  | 'forSecretariado'     // ← Público
  | 'services'            // ← Público
  | 'login'               // ← Auth
  | 'signup'              // ← Auth
  | 'dashboard'           // ← Privado (client)
  | 'lawyerDashboard'     // ← Privado (lawyer)
  | 'internDashboard'     // ← Privado (intern)
  | 'secretariadoDashboard' // ← Privado (secretary)
  | 'adminDashboard';     // ← Privado (admin/super)
```

**Problemas da abordagem atual:**
- URLs não mudam — impossível usar back/forward do browser
- Sem deep links — não é possível compartilhar link de uma tela específica
- Sem histórico de navegação
- Impossível implementar lazy loading por rota

### 7.2 Estrutura de Rotas Recomendada (React Router v7)

```typescript
// routes/index.tsx
const routes = [
  // ── Públicas ────────────────────────────────────
  { path: '/',                element: <LandingPage /> },
  { path: '/buscar',          element: <LawyerSearch /> },
  { path: '/advogado/:id',    element: <LawyerProfile /> },
  { path: '/para-advogados',  element: <ForLawyersPage /> },
  { path: '/para-clientes',   element: <ForClientsPage /> },
  { path: '/para-estagiarios',element: <ForInternsPage /> },
  { path: '/para-secretariado',element: <ForSecretariadoPage /> },
  { path: '/servicos',        element: <ServicesPublicPage /> },

  // ── Autenticação ─────────────────────────────────
  { path: '/entrar',          element: <LoginPage /> },
  { path: '/cadastro',        element: <SignupPage /> },
  { path: '/cadastro/advogado',element: <LawyerSignupPage /> },
  { path: '/cadastro/estagiario',element: <InternSignupPage /> },

  // ── Área do Cliente (protegida: role=client) ─────
  { path: '/cliente',         element: <PrivateRoute roles={['client']}><ClientDashboard /></PrivateRoute>,
    children: [
      { path: 'visao-geral',  element: <ClientOverview /> },
      { path: 'perfil',       element: <ClientProfile /> },
      { path: 'processos',    element: <ClientProcessTracker /> },
      { path: 'financeiro',   element: <ClientFinancial /> },
    ]
  },

  // ── Área do Advogado (protegida: role=lawyer) ────
  { path: '/advogado/painel', element: <PrivateRoute roles={['lawyer']}><LawyerDashboard /></PrivateRoute>,
    children: [
      { path: 'visao-geral',  element: lazy(() => import('./features/lawyer/overview')) },
      { path: 'processos',    element: lazy(() => import('./features/lawyer/cases')) },
      { path: 'agenda',       element: lazy(() => import('./features/lawyer/schedule')) },
      { path: 'financeiro',   element: lazy(() => import('./features/lawyer/finance')) },
      { path: 'ia',           element: lazy(() => import('./features/lawyer/ai')) },
    ]
  },

  // ── Área Admin (protegida: role=admin|super) ────
  { path: '/admin',           element: <PrivateRoute roles={['admin', 'super_admin']}><AdminDashboard /></PrivateRoute>,
    children: [
      { path: 'visao-geral',  element: lazy(() => import('./features/admin/overview')) },
      { path: 'financeiro',   element: lazy(() => import('./features/admin/finance')) },
      { path: 'cadastros',    element: lazy(() => import('./features/admin/registrations')) },
      { path: 'configuracoes',element: lazy(() => import('./features/admin/settings')) },
    ]
  },

  { path: '*', element: <NotFoundPage /> },
];
```

### 7.3 Proteção de Rotas — Componente `<PrivateRoute>`

```typescript
// shared/components/PrivateRoute.tsx
export function PrivateRoute({ roles, children }: {
  roles: SystemRole[];
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/entrar" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/403" replace />;
  return <>{children}</>;
}
```

---

## ETAPA 8 — AUDITORIA DE PERFORMANCE FRONTEND

### 8.1 Bundle Atual vs. Objetivo

| Métrica | Situação Atual | Meta | Gap |
|---|---|---|---|
| **Bundle total (gzip)** | 542 KB | < 150 KB gzip | −392 KB |
| **Bundle JS inicial** | 2.321 KB (raw) | < 300 KB (raw) | −2.021 KB |
| **Chunks** | 1 chunk único | 10–15 chunks por rota | — |
| **Lazy loading** | Nenhum | Todas as rotas privadas | — |
| **Code splitting** | Nenhum | `React.lazy()` + `Suspense` | — |
| **Tree shaking** | Parcial (Vite) | Full tree shaking | — |
| **First Contentful Paint** | Estimado > 3s (4G) | < 1.5s | — |

### 8.2 Dependências Pesadas (Contribuem para Bundle Gigante)

| Biblioteca | Custo Estimado | Otimização Possível |
|---|---|---|
| `recharts` | ~350 KB raw | Importar apenas os gráficos usados; usar `treeshake` |
| `jspdf` + `jspdf-autotable` | ~250 KB raw | Carregar dinamicamente apenas no click de "exportar" |
| `xlsx` | ~300 KB raw | Carregar dinamicamente; considerar `exceljs` mais moderno |
| `@google/genai` | ~120 KB raw | Mover para backend proxy (não deveria estar no frontend) |
| `papaparse` | ~50 KB raw | Adequado; carregar dinamicamente se necessário |

### 8.3 Plano de Otimização de Bundle

```javascript
// vite.config.ts — manualChunks recomendado
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-data': ['@tanstack/react-query', 'zod'],
          'feature-admin': [/* admin feature files */],
          'feature-lawyer': [/* lawyer feature files */],
          'feature-client': [/* client feature files */],
          'dynamic-pdf': ['jspdf', 'jspdf-autotable'],   // lazy
          'dynamic-xlsx': ['xlsx'],                        // lazy
        }
      }
    }
  }
});
```

### 8.4 Re-renderizações e Memoização

| Problema | Componente | Solução |
|---|---|---|
| `App.tsx` re-renderiza toda a árvore ao alterar qualquer modal | App.tsx | Mover modais para `ModalContext` com portais |
| `AppDataContext.Provider` re-renderiza todos consumidores ao atualizar qualquer lista | AppDataContext | Dividir em contextos menores (LawyersContext, ClientsContext) |
| `LawyerDashboard` computações sem `useMemo` | LawyerDashboard | Memoizar filtros de casos, cálculos de KPI |
| Funções callback recriadas em todo render | Múltiplos | Envolver com `useCallback` + `useRef` onde aplicável |

---

## ETAPA 9 — AUDITORIA DE SEGURANÇA FRONTEND

### 9.1 Matriz de Segurança Frontend

| Item | Situação Atual | Risco | Solução |
|---|---|---|---|
| **localStorage — dados PII** | CPF, endereço, credenciais em plaintext | 🔴 CRÍTICO | Migrar para PostgreSQL server-side |
| **API Key Gemini no bundle** | `process.env.API_KEY` injetado via Vite | 🔴 CRÍTICO | Proxy backend NestJS |
| **Tokens de sessão** | Sem JWT — `legis_user` em localStorage | 🔴 CRÍTICO | JWT httpOnly cookie |
| **Autenticação client-side** | `hashPassword(btoa)` comparado no browser | 🔴 CRÍTICO | API REST com bcrypt server-side |
| **Autorização de rotas** | Verificação de `user.role !== 'admin'` no frontend | 🔴 CRÍTICO | Guards no servidor + `<PrivateRoute>` no frontend |
| **XSS** | Sem DOMPurify; sem dangerouslySetInnerHTML identificado | 🟡 BAIXO (React escapa por padrão) | Adicionar DOMPurify nos campos onde HTML é aceito |
| **CSP (Content Security Policy)** | Ausente | 🟠 ALTO | Adicionar header CSP restritivo |
| **Variáveis de ambiente** | `ONLINE_URL` e `APP_DIR_NAME` expostas no bundle | 🟡 MÉDIO | Aceitável para URLs públicas; nunca para secrets |
| **Credenciais hardcoded** | `@@Rk08266570#` em LoginForm.tsx e App.tsx | 🔴 CRÍTICO | Remover imediatamente; usar seed via API |
| **Dados mock em produção** | `mockCases`, `mockAppointments` retornados para qualquer usuário | 🔴 ALTO | Remover mocks; usar dados reais do backend |

---

## ETAPA 10 — AVALIAÇÃO DO DESIGN SYSTEM

### 10.1 Estado Atual — O que Existe

O projeto tem um design system **parcialmente implementado** em `components/ui/`:

| Token/Componente | Status | Uso |
|---|---|---|
| `theme.ts` — `CARD`, `CARD_PAD`, `INPUT`, `LABEL`, `DIVIDER` | ✅ Implementado | Usado em maioria dos componentes |
| `theme.ts` — `ACCENTS` (7 cores: violet, emerald, amber, rose, blue, teal, indigo) | ✅ Implementado | Consistente nos dashboards |
| `theme.ts` — `CHART_COLORS` | ✅ Implementado | Recharts |
| `Button.tsx` | ✅ Implementado | Subutilizado — alguns componentes usam `<button>` inline |
| `Card.tsx` | ✅ Implementado | — |
| `Badge.tsx` | ✅ Implementado | — |
| `KpiCard.tsx` | ✅ Implementado | Bem usado em dashboards |
| `DashboardShell.tsx` | ✅ Excelente | Layout unificado — referência de padrão |
| `SectionHeader.tsx` | ✅ Implementado | — |

### 10.2 Lacunas do Design System (O que Falta)

| Componente | Prioridade | Impacto |
|---|---|---|
| `<Input>` padronizado (com label, erro, helper text) | 🔴 Alta | Formulários inconsistentes hoje |
| `<Select>` padronizado | 🔴 Alta | — |
| `<Textarea>` padronizado | 🟡 Média | — |
| `<Modal>` reutilizável | 🔴 Alta | Múltiplos modais com lógica duplicada |
| `<Table>` com paginação e sort | 🔴 Alta | Admin usa tabelas sem padrão |
| `<Form>` com validação integrada (Zod) | 🔴 Alta | — |
| `<Skeleton>` (loading state) | 🟡 Média | Ausente em toda a plataforma |
| `<Alert>` (mensagens de erro/sucesso) | 🟡 Média | Inconsistente entre módulos |
| `<Pagination>` | 🟡 Média | Listas sem paginação real |
| `<SearchInput>` com debounce | 🟡 Média | Buscas sem debounce podem causar problemas |
| Tokens de tipografia (font-size, weight) | 🟡 Média | Parcialmente no CSS global |
| Tokens de espaçamento | 🟡 Média | Alguns hardcoded nos componentes |
| Dark mode sistemático | 🟡 Média | Implementado em alguns; ausente em outros |

### 10.3 Proposta de Design System Completo

```
src/design-system/
 ├── tokens/
 │    ├── colors.ts          ← Paleta central + acentos (já existe em theme.ts)
 │    ├── typography.ts      ← Font sizes, weights, line heights
 │    ├── spacing.ts         ← Scale de 4px
 │    └── breakpoints.ts     ← sm/md/lg/xl
 │
 ├── primitives/             ← Átomos indivisíveis
 │    ├── Button/
 │    │    ├── Button.tsx
 │    │    ├── Button.test.tsx
 │    │    └── Button.stories.tsx
 │    ├── Input/
 │    ├── Select/
 │    ├── Textarea/
 │    ├── Badge/
 │    ├── Avatar/
 │    └── Icon/
 │
 ├── molecules/              ← Composições de primitivos
 │    ├── FormField/         ← Label + Input + Error
 │    ├── SearchInput/       ← Input + Icon + debounce
 │    ├── KpiCard/
 │    ├── StarRating/
 │    └── CaseProgress/
 │
 ├── organisms/              ← Componentes complexos
 │    ├── Modal/
 │    ├── Table/
 │    ├── DataTable/         ← Table + sort + paginação
 │    ├── DashboardShell/
 │    ├── Toast/
 │    └── BookingCalendar/
 │
 └── index.ts                ← Barrel export de tudo
```

---

## ETAPA 11 — PROPOSTA DE NOVA ESTRUTURA FRONTEND

### Estrutura Feature-Driven (Feature Driven Development + Clean Architecture)

```
src/
│
├── app/                          ← Configuração global da aplicação
│    ├── App.tsx                  ← Monta providers + router (< 50 linhas)
│    ├── AppProviders.tsx         ← Stack de React.Context providers
│    ├── AppRouter.tsx            ← React Router v7 routes
│    └── main.tsx                 ← Entry point (hoje index.tsx)
│
├── core/                         ← Regras de domínio — sem dependências de framework
│    ├── auth/
│    │    ├── AuthContext.tsx      ← Estado de autenticação + JWT
│    │    ├── useAuth.ts           ← Hook de acesso à sessão
│    │    └── authUtils.ts        ← Helpers de token, role checking
│    ├── rbac/
│    │    ├── permissions.ts      ← (migrado de security/rbac.ts)
│    │    ├── usePermissions.ts   ← Hook: hasPermission(), canAccess()
│    │    └── PrivateRoute.tsx    ← Componente guard de rota
│    └── types/                   ← (migrado de types.ts)
│
├── shared/                       ← Utilitários e componentes compartilhados
│    ├── components/
│    │    ├── Modal/
│    │    ├── Toast/
│    │    ├── EmptyState/
│    │    └── LoadingSkeleton/
│    ├── hooks/
│    │    ├── useDebounce.ts
│    │    ├── useLocalStorage.ts
│    │    ├── usePagination.ts
│    │    └── useAsync.ts
│    └── utils/
│         ├── formatters.ts       ← CPF, moeda, data
│         ├── validators.ts       ← Schemas Zod
│         └── cn.ts               ← clsx helper
│
├── design-system/                ← (ver Etapa 10)
│    ├── tokens/
│    ├── primitives/
│    ├── molecules/
│    └── organisms/
│
├── features/                     ← Features por domínio (Feature Slice Design)
│    │
│    ├── auth/                    ← Autenticação
│    │    ├── LoginPage.tsx
│    │    ├── SignupPage.tsx
│    │    ├── LoginForm/
│    │    ├── forms/
│    │    │    ├── ClientSignupForm.tsx
│    │    │    ├── LawyerSignupForm.tsx
│    │    │    └── InternSignupForm.tsx
│    │    └── hooks/
│    │         └── useLoginForm.ts
│    │
│    ├── public/                  ← Páginas públicas (sem auth)
│    │    ├── LandingPage/
│    │    ├── ForLawyersPage/
│    │    ├── ForClientsPage/
│    │    ├── ServicesPage/
│    │    └── LawyerSearch/
│    │         ├── LawyerSearch.tsx
│    │         ├── SearchFilters.tsx
│    │         ├── LawyerCard.tsx
│    │         └── hooks/
│    │              └── useLawyerSearch.ts
│    │
│    ├── lawyer/                  ← Área do Advogado
│    │    ├── LawyerDashboard.tsx ← Shell (< 80 linhas)
│    │    ├── overview/
│    │    ├── schedule/
│    │    ├── cases/
│    │    ├── finance/
│    │    ├── profile/
│    │    ├── ai/
│    │    ├── team/
│    │    └── documents/
│    │
│    ├── client/                  ← Área do Cliente
│    │    ├── ClientDashboard.tsx
│    │    ├── overview/
│    │    ├── processes/
│    │    ├── finance/
│    │    └── profile/
│    │
│    ├── admin/                   ← Área Administrativa
│    │    ├── AdminDashboard.tsx
│    │    ├── overview/
│    │    ├── finance/
│    │    ├── registrations/
│    │    │    ├── lawyers/
│    │    │    ├── clients/
│    │    │    ├── interns/
│    │    │    └── secretaries/
│    │    ├── settings/
│    │    │    ├── SettingsTab.tsx
│    │    │    └── components/ (11 sub-componentes)
│    │    └── staff/
│    │
│    ├── intern/                  ← Área do Estagiário
│    └── secretary/               ← Área da Secretária
│
├── services/                     ← Camada de acesso a dados (anti-corrupção)
│    ├── api/
│    │    ├── apiClient.ts        ← Axios instance + interceptors
│    │    ├── lawyers.api.ts      ← /api/lawyers endpoints
│    │    ├── users.api.ts        ← /api/users endpoints
│    │    ├── cases.api.ts        ← /api/cases endpoints
│    │    └── auth.api.ts         ← /api/auth endpoints
│    ├── queries/                 ← React Query hooks
│    │    ├── useLawyers.ts
│    │    ├── useClients.ts
│    │    └── useCases.ts
│    └── ai/
│         └── aiProxy.ts          ← Chama /api/ai/* (nunca Gemini direto)
│
└── infrastructure/               ← Integrações externas (pagamentos, etc.)
     ├── payment/
     │    └── stripeService.ts
     └── storage/
          └── s3Service.ts
```

---

## ETAPA 12 — BACKLOG DE REFATORAÇÃO

### FRONT-001 — App.tsx: Decompor God Component
**Tamanho**: 761 linhas / 31 KB
**Impacto**: Bloqueia múltiplas equipes; impossível testar isoladamente
**Solução**: Extrair em 5 arquivos (AuthContext, AppRouter, ChatbotContext, ModalContext, useSeedAdmin)
**Prioridade**: 🔴 CRÍTICA | **Estimativa**: 40h | **Dependência**: React Router v7

### FRONT-002 — SettingsTab.tsx: Dividir em 11 Componentes
**Tamanho**: 259 KB / 4.671 linhas
**Impacto**: Um único arquivo para toda a configuração da plataforma
**Solução**: Criar `features/admin/settings/components/` com 11 sub-componentes
**Prioridade**: 🔴 CRÍTICA | **Estimativa**: 120h | **Dependência**: FRONT-001

### FRONT-003 — LawyerDashboard.tsx: Dividir em 10 Módulos
**Tamanho**: 179 KB / 2.328 linhas
**Impacto**: Impossível desenvolver features independentes de advogados
**Solução**: `features/lawyer/` com 10 subdiretórios
**Prioridade**: 🔴 CRÍTICA | **Estimativa**: 80h | **Dependência**: React Router v7

### FRONT-004 — Implementar React Router v7
**Impacto**: URLs não navegáveis; sem lazy loading possível; sem deep links
**Solução**: Migrar state machine `currentView` para React Router declarativo
**Prioridade**: 🔴 CRÍTICA | **Estimativa**: 60h | **Dependência**: Nenhuma

### FRONT-005 — Implementar React Query + API Client
**Impacto**: Sem cache, sem loading states, sem sincronização com backend
**Solução**: `@tanstack/react-query` + Axios; substituir AppDataContext por queries
**Prioridade**: 🔴 ALTA | **Estimativa**: 80h | **Dependência**: Backend NestJS (TECH-001)

### FRONT-006 — Criar AuthContext e Remover Auth do App.tsx
**Impacto**: Lógica de autenticação em componente de UI
**Solução**: `core/auth/AuthContext.tsx` com `useAuth()` hook; JWT httpOnly cookie
**Prioridade**: 🔴 ALTA | **Estimativa**: 40h | **Dependência**: Backend NestJS

### FRONT-007 — Implementar Zod + react-hook-form nos Formulários
**Impacto**: Sem validação de schema; dados inválidos entram no sistema
**Solução**: Zod schemas + react-hook-form em todos os formulários de cadastro
**Prioridade**: 🔴 ALTA | **Estimativa**: 80h | **Dependência**: FRONT-001

### FRONT-008 — Code Splitting com React.lazy()
**Impacto**: Bundle de 2.3MB bloqueia carregamento inicial
**Solução**: React.lazy() em todas as rotas privadas + manualChunks no Vite
**Prioridade**: 🔴 ALTA | **Estimativa**: 40h | **Dependência**: FRONT-004

### FRONT-009 — Remover Mocks Hardcoded dos Componentes
**Impacto**: Dados fictícios retornados para usuários reais; credenciais expostas
**Solução**: Eliminar todo dado hardcoded; substituir por dados reais do backend
**Prioridade**: 🔴 ALTA | **Estimativa**: 30h | **Dependência**: Backend real

### FRONT-010 — Design System Completo (Modal, Table, Input, Form)
**Impacto**: Inconsistência de UI; duplicação de código
**Solução**: Criar `design-system/` com componentes primitivos e moléculas
**Prioridade**: 🟡 MÉDIA | **Estimativa**: 120h | **Dependência**: FRONT-001

### FRONT-011 — Implementar Testes (Vitest + Testing Library)
**Impacto**: Risco de regressão em qualquer mudança
**Solução**: Vitest + @testing-library/react; meta 60% cobertura em 90 dias
**Prioridade**: 🔴 ALTA | **Estimativa**: 200h | **Dependência**: FRONT-001 a FRONT-008

### FRONT-012 — LoginForm e LoginModal: Eliminar Duplicação
**Impacto**: Manutenção duplicada; bug em um afeta o outro
**Solução**: `useLoginForm()` hook + `<LoginFormUI>` puro + `<Modal>` como wrapper
**Prioridade**: 🟡 MÉDIA | **Estimativa**: 20h | **Dependência**: FRONT-007

---

## ETAPA 13 — ESTRATÉGIA DE MIGRAÇÃO INCREMENTAL (Strangler Fig Pattern)

### Princípio: Nunca Quebrar Produção

Usar o padrão **Strangler Fig** — novas implementações coexistem com as antigas; a troca ocorre quando o novo está pronto e testado.

### Fase 1 — Fundação Sem Quebrar (Dias 0–30)

```
Sprint 1 (0–7 dias):
  ✅ Instalar react-router-dom v7 (FRONT-004 — mapeamento inicial)
  ✅ Criar AppRouter.tsx com rotas mapeando para os mesmos componentes de hoje
  ✅ Manter App.tsx funcionando durante a transição
  ✅ Criar AuthContext.tsx com estado inicial migrado do App.tsx

Sprint 2 (7–14 dias):
  ✅ Migrar autenticação do App.tsx para AuthContext
  ✅ Criar <PrivateRoute> e <RoleGuard>
  ✅ Instalar React Query; criar apiClient.ts (ainda sem backend)
  ✅ Criar Zod schemas para os formulários de auth

Sprint 3 (14–21 dias):
  ✅ Implementar React.lazy() nas rotas privadas (FRONT-008)
  ✅ Configurar manualChunks no vite.config.ts
  ✅ Medir bundle antes e depois

Sprint 4 (21–30 dias):
  ✅ Decompor App.tsx: ModalContext, ChatbotContext, useSeedAdmin
  ✅ App.tsx deve ter < 80 linhas ao final desta fase
```

### Fase 2 — Migração de Estado e Serviços (Dias 30–90)

```
Sprint 5–6 (30–45 dias):
  ✅ Criar estrutura features/ (começando por feature/auth)
  ✅ Migrar LoginForm → features/auth/ com useLoginForm()
  ✅ Eliminar LoginModal.tsx duplicado
  ✅ Implementar react-hook-form + Zod em todos os formulários

Sprint 7–8 (45–60 dias):
  ✅ Decompor RegistrationsTab.tsx em 4 componentes
  ✅ Decompor FinanceTab.tsx em 3 componentes
  ✅ Criar features/admin/registrations/ e features/admin/finance/

Sprint 9–10 (60–90 dias):
  ✅ Decompor LawyerDashboard.tsx em 10 módulos
  ✅ Criar features/lawyer/ com subdiretórios
  ✅ Conectar React Query ao backend NestJS quando disponível
  ✅ Eliminar mocks hardcoded conforme endpoints são implementados
```

### Fase 3 — Otimização, Design System e Testes (Dias 90–180)

```
Sprint 11–13 (90–120 dias):
  ✅ Decompor SettingsTab.tsx em 11 componentes
  ✅ Implementar design-system/ completo (Modal, Table, Form, Input)
  ✅ Padronizar todos os formulários com design system

Sprint 14–16 (120–150 dias):
  ✅ Escrever testes Vitest para features críticas (auth, search, admin)
  ✅ Meta: 40% cobertura
  ✅ Implementar Playwright E2E para os 5 fluxos principais

Sprint 17–20 (150–180 dias):
  ✅ Meta: 70% cobertura de testes
  ✅ Implementar Storybook para design system
  ✅ Lighthouse CI no pipeline (meta: score > 90 em Performance e Acessibilidade)
  ✅ Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
```

---

## ROADMAP DE EVOLUÇÃO FRONTEND — RESUMO

| Fase | Prazo | Entregas Principais | Impacto Medido |
|---|---|---|---|
| **Fundação** | 0–30 dias | React Router, AuthContext, lazy loading, App.tsx < 80 linhas | Bundle inicial cai de 2.3MB para ~800KB |
| **Migração** | 30–90 dias | features/ estruturadas, auth refatorado, RegistrationsTab dividido, LawyerDashboard dividido | Primeiros testes unitários; code reviews < 300 linhas por PR |
| **Otimização** | 90–180 dias | SettingsTab dividido, design system completo, 70% cobertura de testes | Bundle inicial < 300KB; LCP < 2.5s; Lighthouse > 90 |

---

*Documento gerado em 25/07/2026 | Prompt 002 — Frontend Architecture Blueprint | v1.0.0*
*Próximo: PROMPT 003 — Especificação da API NestJS (Backend TO-BE)*
