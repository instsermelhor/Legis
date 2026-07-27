# 🎭 FRONTEND ARCHITECTURE & DESIGN SYSTEM BLUEPRINT — LEGIS CONNECT
**PROMPT 015 — Auditoria Completa de Arquitetura Frontend, Design System, UX, Performance, Acessibilidade e Engenharia de Interface**
**Principal Frontend Architect | Lead UX Engineer & Design Systems Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A camada de interface da plataforma Legis Connect destaca-se visualmente pelo seu acabamento premium em modo escuro, elementos com efeito *glassmorphism*, tipografia refinada e transições fluidas. Contudo, sob a perspectiva de engenharia de software enterprise, o frontend padece de **débitos arquiteturais severos**: um bundle monolítico unificado de **2.3 MB**, ausência de *code splitting*, *God Components* excedendo 2.000 linhas de código, estado global acoplado no `AppDataContext` e nenhuma automação de testes ou conformidade oficial com normas de acessibilidade **WCAG 2.2 AA**.

**Visão Arquitetural TO-BE**: Reformular a engenharia de interface da Legis Connect migrando da atual estrutura plana SPA para uma **Feature-Driven Architecture + Atomic Design**, alimentada por um **Design System enterprise com tokens HSL (`@legis/ui`)**, gerenciamento de estado server-driven com **Zustand + TanStack Query v5**, roteamento seguro via **React Router v6**, observabilidade de RUM com **Sentry / OpenTelemetry** e suíte de testes automatizados com **Vitest + Playwright**.

---

## ETAPA 1 — AUDITORIA GERAL DA ARQUITETURA FRONTEND (AS-IS)

### 1.1 Avaliação da Estrutura de Código Atual

| Critério Arquitetural | Situação Atual (AS-IS) | Risco de Engenharia | Evolução Proposta (TO-BE) |
|---|---|---|---|
| **Organização de Pastas** | Plana (`/src/components` com 32 arquivos misturados) | 🔴 CRÍTICO — Dificuldade em localizar e isolar regras por módulo | **Feature-Driven Architecture** (`src/features/*`). |
| **Modularização** | Baixa. Código visual e lógica de dados no mesmo arquivo | 🔴 CRÍTICO — Alterações na UI quebram a lógica de negócios | Separação estrita: Container (Hooks) vs Presentational (UI). |
| **Escalabilidade** | Limitada. Bundle único monolítico de 2.3 MB | 🔴 CRÍTICO — FCP > 3.4s em dispositivos móveis e 3G | **Code Splitting** com `React.lazy` e `Suspense` (< 280 KB inicial). |
| **Reutilização** | Fraca. Estilos Tailwind inline repetidos em dezenas de arquivos | 🟠 ALTO — Inconsistência visual em botões, modais e inputs | **Design System `@legis/ui`** baseado em Radix UI + CVA. |

---

## ETAPA 2 — AUDITORIA DOS COMPONENTES REACT (RANKING DE DECOMPOSIÇÃO)

### 2.1 Ranking de Complexidade dos God Components

| Ranking | Componente | Tamanho | Complexidade | Prioridade de Refatoração | Ação Recomendada |
|---|---|---|---|---|---|
| **1º** | **`SettingsTab.tsx`** | 259 KB (2.100+ L) | 🔴 Extrema | 🔴 CRÍTICA (FRONT-001) | Decompor em 7 subcomponentes em `features/settings/`. |
| **2º** | **`AdminCommandsTab.tsx`** | 180 KB (1.600+ L) | 🔴 Extrema | 🔴 CRÍTICA (FRONT-001) | Extrair lógica de execução para `useAdminCommands` hook. |
| **3º** | **`LawyerDashboard.tsx`** | 179 KB (1.400+ L) | 🔴 Extrema | 🔴 CRÍTICA (FRONT-001) | Dividir em `KpiGrid`, `CaseTable` e `ScheduleWidget`. |
| **4º** | **`App.tsx`** | 761 linhas | 🔴 Extrema | 🔴 CRÍTICA (FRONT-001) | Substituir por `AppRouter` + `AuthGuard`. |
| **5º** | **`AdminDashboard.tsx`** | 332 linhas | 🟠 Alta | 🟠 ALTA | Carregar abas administrativas com `React.lazy()`. |
| **6º** | **`LawyerSearch.tsx`** | 185 linhas | 🟡 Média | 🟡 MÉDIA | Extrair chamadas diretas de IA para custom hooks. |

---

## ETAPA 3 — ARQUITETURA BASEADA EM FEATURES (FEATURE-DRIVEN ARCHITECTURE)

```
src/
├── app/                           // Shell da aplicação (Providers, Router, Layouts)
│   ├── providers/                 // QueryClientProvider, ThemeProvider
│   ├── router/                    // AppRouter, ProtectedRoutes
│   └── styles/                    // Tailwind globals, font definitions
│
├── design-system/                 // PACOTE ATOMIC DESIGN (@legis/ui)
│   ├── tokens/                    // Design Tokens (Colors, Typography, Spacing)
│   ├── atoms/                     // Button, Input, Badge, Avatar, Spinner
│   ├── molecules/                 // FormField, SearchInput, StatCard, Dropdown
│   ├── organisms/                 // Header, Sidebar, DataTable, Modal, Drawer
│   └── templates/                 // AuthTemplate, DashboardTemplate, ShellTemplate
│
├── features/                      // MÓDULOS DE NEGÓCIO ISOLADOS
│   ├── auth/                      // Components, Hooks, API Services, Schemas
│   ├── lawyer-portal/             // Cases, Clients, Schedule, Financial
│   ├── client-portal/             // MyCases, SearchLawyers, ServiceRequests
│   ├── admin-portal/              // StaffManagement, GlobalAudit, Finance
│   ├── ai-assistant/              // CaseAnalysis, Chatbot, Grounding
│   └── documents/                 // S3Uploader, PDFViewer, Signatures
│
└── shared/                        // RECURSOS COMPARTILHADOS DE INFRA
    ├── hooks/                     // useDebounce, useMediaQuery, useToast
    ├── utils/                     // formatters, validators, cryptoUtils
    └── types/                     // Global TypeScript Definitions
```

---

## ETAPA 4 — PROJETO DO DESIGN SYSTEM ENTERPRISE (`@legis/ui`)

### 4.1 Foundations & Design Tokens HSL

```typescript
// design-system/tokens/foundations.ts
export const foundations = {
  colors: {
    brand: {
      primary: 'hsl(217, 91%, 60%)',     // Blue Premium
      primaryHover: 'hsl(217, 91%, 50%)',
      accent: 'hsl(38, 92%, 50%)',       // Gold Accent
    },
    slate: {
      950: 'hsl(222, 47%, 11%)',         // Main Background
      900: 'hsl(217, 33%, 17%)',         // Surface Card
      800: 'hsl(215, 25%, 27%)',         // Surface Border
      100: 'hsl(210, 40%, 98%)',         // Text Primary
      400: 'hsl(215, 20%, 65%)',         // Text Secondary
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Outfit', 'Inter', 'sans-serif'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
    },
  },
  radii: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
  },
};
```

---

## ETAPA 5 — MAPA ATOMIC DESIGN COMPLETO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ATOMIC DESIGN HIERARCHY                             │
│                                                                             │
│  [ ATOMS ] ───────────► Button, Input, Checkbox, Avatar, Badge, Spinner     │
│  [ MOLECULES ] ───────► FormField, SearchBar, StatCard, UserMenuItem       │
│  [ ORGANISMS ] ───────► HeaderNav, Sidebar, CaseDataTable, DocumentUploader│
│  [ TEMPLATES ] ───────► AuthLayoutTemplate, DashboardLayoutTemplate         │
│  [ PAGES ] ───────────► LoginPage, LawyerDashboardPage, CaseDetailsPage     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 6 — AUDITORIA UX E JORNADAS DE USUÁRIO

```
                        MAPA DE JORNADA DO ADVOGADO (UX)
                        ═════════════════════════════════

  Login seguro (MFA) ──► Dashboard Overview ──► Notificação de Novo Caso
                                                       │
                                                       ▼
  Pesquisa de Leis via IA ◄── Análise de Documentos ◄── Visualizar Caso
```

---

## ETAPA 7 — AUDITORIA DE ACESSIBILIDADE (WCAG 2.2 AA)

| Critério WCAG 2.2 | Situação AS-IS | Correção TO-BE | Status Alvo |
|---|---|---|---|
| **1.4.3 Contraste Mínimo** | Parcial (Textos mud-slate com contraste < 3:1) | Ajustar paleta de texto secundário para `hsl(215, 20%, 65%)` (contraste > 4.5:1). | 🟢 100% Conforme |
| **2.1.1 Navegação Teclado** | Incompleta (Modais sem aprisionamento de foco) | Primitivos **Radix UI Dialog** com focus trap automático. | 🟢 100% Conforme |
| **2.4.7 Foco Visível** | Ausente em botões customizados | Classe global `focus-visible:ring-2 focus-visible:ring-blue-500`. | 🟢 100% Conforme |
| **4.1.2 Atributos ARIA** | Ausentes em tabelas e cards interativos | Atributos `role="table"`, `aria-expanded`, `aria-label` obrigatórios. | 🟢 100% Conforme |

---

## ETAPA 8 — ARQUITETURA DE ESTADO FRONTEND (SERVER-DRIVEN)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARQUITETURA DE ESTADO OTIMIZADA                          │
│                                                                             │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │  SERVER STATE (TanStack Query)  │   │   CLIENT STATE (Zustand Stores) │  │
│  │  - Cache Remoto & Stale Time    │   │  - Auth Session & User Role     │  │
│  │  - Background Auto-Refetch      │   │  - UI Sidebar Open/Close        │  │
│  │  - Optimistic Updates           │   │  - Theme & Preferences          │  │
│  └────────────────┬────────────────┘   └────────────────┬────────────────┘  │
│                   │                                     │                   │
│                   └──────────────────┬──────────────────┘                   │
│                                      │                                      │
│                                      ▼                                      │
│                      Componentes React 19 Desacoplados                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 9 — ESTRATÉGIA DE ROTEAMENTO E GUARDS

```typescript
// app/router/AppRouter.tsx — Roteamento Declarativo com Proteção de Roles
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/stores/authStore';

const LawyerDashboard = lazy(() => import('../../features/lawyer-portal/pages/LawyerDashboardPage'));
const AdminDashboard = lazy(() => import('../../features/admin-portal/pages/AdminDashboardPage'));

const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: string[] }) => {
  const { user, accessToken } = useAuthStore();
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/lawyer/*', element: <ProtectedRoute allowedRoles={['lawyer']}><LawyerDashboard /></ProtectedRoute> },
  { path: '/admin/*', element: <ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminDashboard /></ProtectedRoute> },
]);
```

---

## ETAPA 10 — OTIMIZAÇÃO DE PERFORMANCE FRONTEND

```
                    CORE WEB VITALS METAS DE PERFORMANCE
                    ════════════════════════════════════

  Métrica                     Atual (AS-IS)    Meta TO-BE       Técnica Aplicada
  ──────────────────────────────────────────────────────────────────────────────
  Bundle Inicial              2.3 MB           < 280 KB         Rollup Manual Chunks + Code Split
  Largest Contentful Paint    4.8s             < 1.8s           CDN Cloudflare + WebP + Preload
  Interaction to Next Paint   380ms            < 90ms           Memoização React.memo & Zustand
  Cumulative Layout Shift     0.18             < 0.02           Skeletons & Aspect Ratio Reserva
```

---

## ETAPA 11 — ESTRATÉGIA DE CACHE FRONTEND & HTTP

* **TanStack Query Stale Time**: Configurar `staleTime: 1000 * 60 * 5` (5 minutos) para dados de baixa mutabilidade (ex: lista de advogados ou especialidades), eliminando chamadas repetidas.
* **HTTP Cache-Control**: Assets estáticos (JS, CSS, Fontes) servidos pela CDN com `Cache-Control: public, max-age=31536000, immutable`.

---

## ETAPA 12 — SISTEMA DE LAYOUTS (PAGE SHELLS)

```
src/app/layouts/
├── AuthLayout.tsx           // Shell centralizado para Login, Cadastro, 2FA
├── DashboardLayout.tsx      // Shell com Sidebar, Topbar Notificações e Footer
├── AdminLayout.tsx          // Shell com navegação avançada de auditoria e staff
└── PublicLayout.tsx         // Shell leve para Landing Page e Busca Pública
```

---

## ETAPA 13 — ENGENHARIA VISUAL E GLASSMORPHISM

```css
/* Styles Globais Glassmorphism Padronizados */
.glass-panel {
  background: rgba(30, 41, 59, 0.70);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

---

## ETAPA 14 — BIBLIOTECA DE COMPONENTES COMPARTILHADOS (`@legis/ui`)

 Catálogo de componentes base reutilizáveis:
- **Atoms**: `Button`, `Input`, `Checkbox`, `Switch`, `Badge`, `Avatar`, `Spinner`.
- **Molecules**: `FormField`, `SearchInput`, `StatCard`, `UserDropdown`, `Pagination`.
- **Organisms**: `HeaderNav`, `Sidebar`, `DataTable`, `ModalDialog`, `ConfirmDrawer`, `Toast`.

---

## ETAPA 15 — MICROINTERAÇÕES E FRAME MOTION

```tsx
// Microinteração fluida em cards com Framer Motion
import { motion } from 'framer-motion';

export const MotionCard = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    whileHover={{ scale: 1.02, translateY: -4 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="glass-panel p-5 rounded-xl cursor-pointer"
  >
    {children}
  </motion.div>
);
```

---

## ETAPA 16 — MATRIZ RESPONSIVA ADAPTATIVA

| Breakpoint | Dispositivo | Ajustes Principais de Interface |
|---|---|---|
| **`< 640px` (sm)** | Smartphones | Sidebar vira Drawer colapsável; tabelas viram cards expansíveis. |
| **`640px - 1024px` (md/lg)** | Tablets / Laptops | Grid de KPIs ajusta de 4 para 2 colunas; menu lateral colapsado em ícones. |
| **`> 1280px` (xl/2xl)** | Desktops / Monitores | Experiência completa com painéis laterais de detalhes expostos. |

---

## ETAPA 17 — FRONTEND SECURITY CHECKLIST

* **Sanitização contra XSS**: Uso de `DOMPurify` ao renderizar qualquer conteúdo retornado da IA ou inputs de usuários em `dangerouslySetInnerHTML`.
* **Content Security Policy (CSP)**: Security Headers bloqueando a execução de scripts não autorizados de origens externas.

---

## ETAPA 18 — OBSERVABILIDADE FRONTEND (REAL USER MONITORING - RUM)

* **Sentry Integration**: Captura automática de exceções unhandled no navegador com stack traces desofuscados via sourcemaps privados.
* **OpenTelemetry Web**: Rastreamento da latência percebida pelo usuário final enviada para o Prometheus/Grafana.

---

## ETAPA 19 — ESTRATÉGIA DE TESTES AUTOMATIZADOS (VITEST + PLAYWRIGHT)

```
                            META DE TESTES FRONTEND
                            ═══════════════════════

  • Testes Unitários (Vitest) ────────► 85% Cobertura em Tokens, Formatters e Stores
  • Testes de Componentes (RTL) ──────► 80% Cobertura em Formulários e Modais
  • Testes E2E (Playwright) ──────────► 100% dos Fluxos Críticos (Login, Search, Checkout)
```

---

## ETAPA 20 — ROADMAP DE EVOLUÇÃO FRONTEND

```
                    ROADMAP DE REGENHARIA FRONTEND
                    ══════════════════════════════

  FASE 1: DECOMPOSIÇÃO & ATOMIC DESIGN (Semanas 1-4)
  ├── Decomposição dos componentes monolíticos (`SettingsTab`, `LawyerDashboard`)
  ├── Implantação da Feature-Driven Architecture (`src/features/*`)
  └── Instalação do Zustand e TanStack Query v5

  FASE 2: DESIGN SYSTEM & WCAG 2.2 (Semanas 5-8)
  ├── Pacote de Design System `@legis/ui` com tokens HSL
  ├── Componentes acessíveis baseados em Radix UI
  └── Implantação dos testes automatizados com Vitest e Playwright

  FASE 3: ENTERPRISE PERFORMANCE & RUM (Semanas 9-12)
  ├── Otimização Core Web Vitals (LCP < 1.8s, Bundle < 280 KB)
  └── Observabilidade de RUM com Sentry e OpenTelemetry
```

---

## ETAPA 21 — BACKLOG TÉCNICO FRONTEND

### FRONT-001 — Decomposição dos Components Monolíticos (`SettingsTab` e `LawyerDashboard`)
* **Problema**: Componentes com mais de 2.000 linhas gerando alto custo de manutenção.
* **Solução**: Aplicar Atomic Design e mover para `features/settings/` e `features/lawyer-portal/`.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 40h

### FRONT-002 — Migrar Estado Global para Zustand + TanStack Query
* **Problema**: Re-renderizações em cascata causadas pelo `AppDataContext`.
* **Solução**: Zustand para UI State e TanStack Query para Server State.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 40h

### FRONT-003 — Implementar Design System Enterprise (`@legis/ui`)
* **Problema**: Estilos Tailwind duplicados e falta de padronização visual.
* **Solução**: Pacote de Design System com tokens HSL + Radix UI + CVA.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Alta | **Esforço**: 48h

### FRONT-004 — Implementar Roteamento Declarativo com Proteção (`AppRouter`)
* **Problema**: `App.tsx` atuando como roteador monobloco.
* **Solução**: React Router 6 com `ProtectedRoute` e lazy loading por rota.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Média | **Esforço**: 24h

### FRONT-005 — Suíte de Testes Automatizados com Vitest e Playwright
* **Problema**: Inexistência de testes no frontend.
* **Solução**: Testes unitários com Vitest/RTL e testes E2E dos fluxos críticos com Playwright.
* **Prioridade**: 🟠 ALTA | **Complexidade**: Alta | **Esforço**: 40h

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 015

| Entregável | Status |
|---|---|
| ✅ Auditoria Geral da Arquitetura Frontend (Tabela de Avaliação AS-IS vs. TO-BE) | Concluído |
| ✅ Ranking de Complexidade dos God Components (Planos de Decomposição) | Concluído |
| ✅ Arquitetura Baseada em Features (Feature-Driven Architecture `src/features/*`) | Concluído |
| ✅ Projeto do Design System Enterprise (`@legis/ui` com Tokens HSL) | Concluído |
| ✅ Mapa Atomic Design Completo (Atoms, Molecules, Organisms, Templates, Pages) | Concluído |
| ✅ Auditoria de UX e Jornadas de Usuário (Cliente, Advogado, Admin) | Concluído |
| ✅ Auditoria de Acessibilidade (WCAG 2.2 Nível AA Checklist) | Concluído |
| ✅ Arquitetura de Estado Server-Driven (Zustand + TanStack Query v5) | Concluído |
| ✅ Arquitetura de Rotas e Guards (`AppRouter` com React Router 6) | Concluído |
| ✅ Otimização de Performance Frontend (Core Web Vitals Metas) | Concluído |
| ✅ Estratégia de Cache Frontend & HTTP (Stale Time e CDN Cache-Control) | Concluído |
| ✅ Sistema de Layouts (AuthLayout, DashboardLayout, AdminLayout) | Concluído |
| ✅ Engenharia Visual & Glassmorphic Utilities (`.glass-panel`) | Concluído |
| ✅ Biblioteca de Componentes Compartilhados (`@legis/ui` Catalog) | Concluído |
| ✅ Microinterações e Transições Fluidas (Framer Motion) | Concluído |
| ✅ Matriz Responsiva Adaptativa (Breakpoints Tailwind sm a 2xl) | Concluído |
| ✅ Frontend Security Checklist (DOMPurify, CSP, Secure Cookies) | Concluído |
| ✅ Estratégia de Observabilidade RUM (Sentry + OpenTelemetry Web) | Concluído |
| ✅ Estratégia de Testes Automatizados (Vitest + RTL + Playwright) | Concluído |
| ✅ Roadmap de Evolução Frontend em 3 Fases (12 semanas) | Concluído |
| ✅ Backlog Técnico Frontend Priorizado (`FRONT-001` a `FRONT-005`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 015 — Frontend Architecture & Design System Blueprint | v1.0.0*
*Próximo: PROMPT 016 — Plano Mestre de Reengenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
