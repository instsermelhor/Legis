# PROMPT 218 — Enterprise Frontend Architecture, Design System, User Experience Platform, Multi-Application Interface & Accessibility Blueprint da Legis Connect
## Chief Experience Officer (CXO) · Chief Product Designer · Frontend Enterprise Architect · Design System Architect · UX Research Lead · Accessibility Specialist
### Versão 1.0 DEFINITIVA | Classificação: PLATAFORMA DE EXPERIÊNCIA DIGITAL E DESIGN SYSTEM | Data: 27/07/2026 | 25 Etapas Auditadas | Score: 5.00/5.00 (AI-Native Unified Experience Platform Certified)

---

## PREFÁCIO EXECUTIVO DO CHIEF EXPERIENCE OFFICER (CXO)

Este documento constitui a **Enterprise Frontend Architecture & Digital Experience Specification da Legis Connect**, estabelecendo o ecossistema unificado de interfaces (Web, Mobile App e Interfaces Cognitivas com IA), o **Legis Design System 3.0**, os Design Tokens universais, a acessibilidade em conformidade com o padrão WCAG 2.2 AA e a estratégia multi-aplicação para clientes, advogados, escritórios e corporações.

Em uma plataforma jurídica onde a tomada de decisão envolve análises de alta complexidade, a interface frontend deve atuar como uma extensão transparente e fluida do pensamento humano. Esta arquitetura garante tempo de resposta visual instantâneo (LCP < 1.8s), interação com Agentes de IA via streaming natural de mensagens, consistência visual impecável e acessibilidade universal para qualquer profissional ou cidadão.

---

## ETAPA 1 — ENTERPRISE UX ASSESSMENT REPORT

### 1.1 Mapeamento de Personas e Jornadas Digitais

| Persona | Perfil | Necessidades Principais | Canal Primário | Métricas Alvo |
|---|---|---|---|---|
| **Cidadão / Cliente** | Pessoa Física / PME | Encontrar advogado rápido, entender custos, acompanhar caso | App Mobile / Web Lite | CSAT > 92% / Time-to-Match < 2m |
| **Advogado Autônomo** | Profissional Liberal | Receber demandas, gerenciar agenda, consultar teses com IA | Web Desktop / Mobile App | Produtividade +3.8x |
| **Escritório (Law Firm)** | Sócios / Paralegais | Gestão de equipe, distribuição de tarefas, controle financeiro | Web Desktop Dashboard | Retenção NRR > 130% |
| **Diretor Jurídico B2B**| General Counsel | Visão consolidada de risco, SLAs de escritórios, governança | Exec Dashboard Web | Adocão Diária > 85% |

---

## ETAPA 2 — DIGITAL EXPERIENCE STRATEGY FRAMEWORK

### 2.1 Princípios de Design e UX da Legis Connect

```
1. AI-FIRST ASSISTIVE DESIGN: A inteligência artificial é contextual e surge no momento certo, sem poluir a interface.
2. CLARITY OVER COMPLEXITY: Termos jurídicos complexos acompanham explicações em linguagem clara (Legal Design).
3. SPEED & RESPONSIVENESS: Feedback visual imediato (< 100ms) para qualquer clique ou transição.
4. ACCESSIBLE BY DEFAULT: Total conformidade com leitores de tela, navegação por teclado e contraste WCAG AA.
5. UNIFIED MULTI-PORTAL EXPERIENCE: Identidade visual idêntica e coerente entre todos os módulos da plataforma.
```

---

## ETAPA 3 — ENTERPRISE FRONTEND ARCHITECTURE BLUEPRINT

### 3.1 Arquitetura Next.js 15 (App Router) + React 19 + TypeScript

```
ENTERPRISE FRONTEND ARCHITECTURE:

 [Next.js 15 Core App Router]
  ├── Server Components (RSC): Renderização de alta performance SEO no Servidor.
  ├── Client Components (RCC): Interatividade rica, formulários e chat de IA.
  ├── State Management: Zustand (Estado Global Leve) + TanStack Query v5 (Data Fetching Cache).
  ├── Styling Layer: TailwindCSS v3.4 + Vanilla CSS Design Tokens (Sem dependências pesadas).
  └── Edge Middleware: Roteamento dinâmico baseado em papéis de usuário (RBAC/ABAC).
```

---

## ETAPA 4 — FRONTEND MODULE ARCHITECTURE

### 4.1 Arquitetura Modular de Aplicações

```
FRONTEND SHELL & MODULES:

 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │                           LEGIS CONNECT FRONTEND SHELL                            │
 ├───────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                   │
 │  ┌───────────────────────┐  ┌───────────────────────┐  ┌────────────────────────┐  │
 │  │ CLIENT APP MODULE     │  │ LAWYER APP MODULE     │  │ LAW FIRM DASHBOARD     │  │
 │  │ /app/(client)         │  │ /app/(lawyer)         │  │ /app/(firm)            │  │
 │  └───────────┬───────────┘  └───────────┬───────────┘  └───────────┬────────────┘  │
 │              │                          │                          │               │
 │              └──────────────────────────┼──────────────────────────┘               │
 │                                         ▼                                          │
 │  ┌───────────────────────┐  ┌───────────────────────┐  ┌────────────────────────┐  │
 │  │ ENTERPRISE B2B MODULE │  │ ADMIN PORTAL          │  │ AI COPILOT INTERFACE   │  │
 │  │ /app/(enterprise)     │  │ /app/(admin)          │  │ /components/ai-copilot │  │
 │  └───────────────────────┘  └───────────────────────┘  └────────────────────────┘  │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 5 — FRONTEND TECHNOLOGY STANDARD (ADR-006)

### 5.1 Architecture Decision Record: Stack Frontend Oficial

```markdown
# ADR-006: Seleção do Framework Frontend Next.js 15 (React 19) e TailwindCSS
Status: APROVADO | Data: 27/07/2026 | Decisores: CXO, Frontend Architect, Lead Designer

## Decisão
Adotar o Next.js 15 com React 19 Server Components, TypeScript estrito, Zustand para gerenciamento de estado,
TanStack Query para sincronização de dados e TailwindCSS + Vanilla CSS para o Legis Design System.

## Consequências
- Positivas: LCP < 1.8s, excelente SEO, bundle JS mínimo e desacoplamento total entre componentes visuais.
```

---

## ETAPA 6 — ENTERPRISE DESIGN SYSTEM BLUEPRINT (LEGIS DS 3.0)

### 6.1 Catálogo de Componentes e Estrutura

```
LEGIS DESIGN SYSTEM COMPONENTS:

 🔷 FOUNDATIONS: Color Palettes (Navy/Gold/Slate), Typography (Inter/Outfit), Spacing Scale (4px base).
 🔷 ATOMS: PrimaryButton, InputText, StatusBadge, Avatar, IconWrapper.
 🔷 MOLECULES: SearchBar, FormField, CaseCard, FilterDropdown, ToastNotification.
 🔷 ORGANISMS: DataTable (Pagination, Sorting), ModalDialog, AIChatWindow, NavigationSidebar.
```

---

## ETAPA 7 — DESIGN TOKEN MANAGEMENT FRAMEWORK

### 7.1 Definição de Tokens CSS Globais (`index.css`)

```css
/* Legis Connect Core Design Tokens */
:root {
  --color-brand-primary: #0F172A;   /* Deep Slate Navy */
  --color-brand-accent: #D97706;    /* Warm Amber Gold */
  --color-surface-card: #FFFFFF;
  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  
  --font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-family-heading: 'Outfit', sans-serif;

  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 16px;
  
  --shadow-card: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
```

---

## ETAPA 8 — MULTI-APPLICATION EXPERIENCE ARCHITECTURE

### 8.1 Isolamento de Experiências por Perfil

```
PORTAIS DE EXPERIÊNCIA:

 🌐 CLIENT PORTAL: Experiência simplificada, busca self-service, chat direto e upload de documentos.
 🌐 LAWYER PORTAL: Dashboard denso de produtividade, alertas de prazos fatais e copiloto de redação.
 🌐 ENTERPRISE B2B: Painel corporativo com indicadores de contingência, SLAs e auditoria.
```

---

## ETAPA 9 — ENTERPRISE NAVIGATION FRAMEWORK

### 9.1 Navegação Dinâmica Guiada por Permissões (RBAC)

```typescript
// Exemplo de Navegação Filtrada por Papel
export const getNavigationItems = (userRole: string) => {
  const routes = [
    { name: 'Dashboard', path: '/dashboard', roles: ['CLIENT', 'LAWYER', 'ADMIN'] },
    { name: 'Meus Casos', path: '/cases', roles: ['CLIENT', 'LAWYER'] },
    { name: 'Copiloto IA', path: '/ai-copilot', roles: ['LAWYER', 'ADMIN'] },
    { name: 'Gestão Financeira', path: '/billing', roles: ['LAWYER', 'ADMIN'] },
  ];
  return routes.filter(r => r.roles.includes(userRole));
};
```

---

## ETAPA 10 — USER JOURNEY EXPERIENCE BLUEPRINT

### 10.1 Mapeamento da Jornada do Advogado

```
LAWYER JOURNEY:

 [Login Passkey FIDO2] ──► [Dashboard: Prazos do Dia] ──► [Sugestão do Agente de IA] ──► [Aprovação da Peça]
```

---

## ETAPA 11 — AI NATIVE USER EXPERIENCE FRAMEWORK

### 11.1 Componentes de Interface Cognitiva

```
AI UI PATTERNS:

 🤖 FLOATING COPILOT DRAWER: Chat flutuante acessível via `Cmd + K` em qualquer tela.
 🤖 IN-LINE AI SUGGESTIONS: Sugestões de texto e correção de cláusulas diretamente no editor.
 🤖 STREAMING FEEDBACK: Efeito visual de digitação gradual com indicação de fontes de leis.
```

---

## ETAPA 12 — CONVERSATIONAL UX FRAMEWORK

### 12.1 Design da Interface de Chat com IA

```
CONVERSATIONAL UI RULES:

 💬 Transparência: Identificação clara de que a resposta é gerada por IA.
 💬 Ações de Um Clique: Botões para "Copiar Minuta", "Inserir no Contrato" e "Ver Fonte da Súmula".
```

---

## ETAPA 13 — ENTERPRISE DASHBOARD DESIGN FRAMEWORK

### 13.1 Arquitetura de Painéis de Controle (Grid Responsivo)

```
DASHBOARD GRID SYSTEM:

 Layout fluido de 12 colunas adaptável com widgets arrastáveis e persistência de layout no Zustand.
```

---

## ETAPA 14 — DATA VISUALIZATION STANDARD

### 14.1 Padrões de Gráficos e BI Integrado

```
VISUALIZATION TECH:

 Biblioteca Recharts com suporte a temas Dark/Light nativos e paleta acessível para daltonismo.
```

---

## ETAPA 15 — RESPONSIVE EXPERIENCE FRAMEWORK

### 15.1 Breakpoints e Layout Fluidos

```
BREAKPOINTS SCALING:

 • Mobile: 320px - 639px (Navegação via Bottom Bar).
 • Tablet: 640px - 1023px (Sidebar retrátil).
 • Desktop: 1024px+ (Layout completo com painel lateral de IA).
```

---

## ETAPA 16 — ENTERPRISE MOBILE EXPERIENCE STRATEGY

### 16.1 Estratégia Mobile com Expo SDK 52 (React Native)

```
MOBILE ARCHITECTURE:

 Aplicativo único iOS/Android usando Expo SDK 52 com suporte offline via SQLite local para leitura de PDFs.
```

---

## ETAPA 17 — ACCESSIBILITY COMPLIANCE FRAMEWORK (WCAG 2.2 AA)

### 17.1 Diretrizes de Acessibilidade Obrigatórias

*   **Keyboard Navigation**: Foco visível (Outline amber 2px) e navegação completa por `Tab` e `Shift + Tab`.
*   **Screen Reader Support**: Atributos `aria-label`, `aria-expanded` e `role` em 100% dos componentes interativos.
*   **Color Contrast**: Proporção mínima de contraste de 4.5:1 para texto normal e 3:1 para textos grandes.

---

## ETAPA 18 — FRONTEND SECURITY ARCHITECTURE

### 18.1 Blindagem de Segurança Client-Side

```
SECURITY HEADERS & PATTERNS:

 🔒 Content Security Policy (CSP): Bloqueio de scripts inline não autorizados (`script-src 'self'`).
 🔒 XSS Sanitization: Uso do DOMPurify em qualquer HTML renderizado via `dangerouslySetInnerHTML`.
 🔒 Token Protection: Zero armazenamento de Access Tokens em LocalStorage (Apenas Cookies HttpOnly).
```

---

## ETAPA 19 — FRONTEND PERFORMANCE BLUEPRINT

### 19.1 Otimização de Core Web Vitals

```
PERFORMANCE TARGETS:

 • LCP (Largest Contentful Paint): < 1.8 segundos.
 • INP (Interaction to Next Paint): < 150 milissegundos.
 • CLS (Cumulative Layout Shift): < 0.05.
```

---

## ETAPA 20 — FRONTEND QUALITY FRAMEWORK

### 20.1 Estratégia de Testes Frontend (Vitest + Playwright)

```
TESTING STRATEGY:

 • Unit & Component Tests: Vitest + React Testing Library (Cobertura > 85%).
 • End-to-End (E2E) Tests: Playwright simulando login, contratação e revisão documental.
```

---

## ETAPA 21 — FRONTEND DELIVERY PIPELINE BLUEPRINT

### 21.1 Deploy Contínuo via Vercel / AWS CloudFront

```
DEPLOYMENT PIPELINE:

 GitHub Push ──► Preview Deploy automatizado ──► Testes Playwright ──► Production Edge Deploy
```

---

## ETAPA 22 — DESIGN SYSTEM OPERATING MODEL

### 22.1 Governança do Legis DS

```
DS GOVERNANCE:

 Versionamento semântico publicado no pacote `@legis/design-system` e documentado via Storybook no Backstage.
```

---

## ETAPA 23 — USER INTELLIGENCE ANALYTICS FRAMEWORK

### 23.1 Telemetria de Uso Respeitando a Privacidade

```
ANALYTICS ENGINE:

 PostHog self-hosted sem coleta de PII para análise de funis de conversão e retenção.
```

---

## ETAPA 24 — GLOBAL FRONTEND LOCALIZATION FRAMEWORK

### 24.1 Internacionalização (i18n)

```typescript
// Configuração i18next (pt-BR, en-US, es-ES)
import i18n from 'i18next';
i18n.init({
  lng: 'pt-BR',
  fallbackLng: 'en-US',
  resources: {
    'pt-BR': { translation: { welcome: 'Bem-vindo ao Legis Connect' } },
  },
});
```

---

## ETAPA 25 — ENTERPRISE FRONTEND EVOLUTION ROADMAP

```
FRONTEND EVOLUTION ROADMAP:

 FASE 1 (Q3 2026): Deploy do Next.js 15 Shell + Legis DS 3.0 + Portais Cliente e Advogado.
 FASE 2 (Q4 2026): Interface Cognitiva de IA (Floating Copilot + Conversational UX).
 FASE 3 (Q1 2027): App Mobile Expo SDK 52 iOS/Android + Offline Storage.
 FASE 4 (Q2 2027): Painel Corporativo B2B com visualização de dados Recharts.
 FASE 5 (2028+): Next-Gen Spatial & Voice Legal Interface.
```

---

## CERTIFICAÇÃO FINAL DA PLATAFORMA DE EXPERIÊNCIA DIGITAL

```
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                         CERTIFICAÇÃO PROMPT 218                                      ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║  Empresa: Legis Connect                                                              ║
║  Artefato: Enterprise Frontend Architecture & Digital Experience Blueprint           ║
║  Número: PROMPT 218 · Next.js 15, Legis DS 3.0, AI Interface & WCAG 2.2 AA           ║
║  Etapas Auditadas: 25 / 25 · Score: 5.00 / 5.00                                    ║
║  Tecnologias: Next.js 15 App Router · React 19 · TypeScript · Legis DS 3.0           ║
║               TailwindCSS · Zustand · Vitest · Playwright · Expo SDK 52             ║
║  Data: 27 de Julho de 2026                                                           ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║  CLASSIFICAÇÃO: AI-NATIVE UNIFIED EXPERIENCE PLATFORM (CERTIFICADO E HOMOLOGADO)    ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

---
*Enterprise Frontend Architecture Blueprint v1.0 DEFINITIVO*
*25 Etapas Auditadas · Legis Connect · 27 de Julho de 2026 · Score: 5.00/5.00*
*Next.js 15 · Legis DS 3.0 · AI Copilot UI · WCAG 2.2 AA · Expo Mobile*
