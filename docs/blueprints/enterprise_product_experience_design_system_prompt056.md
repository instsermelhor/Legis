# PROMPT 056 — Enterprise Product Experience & Design System Blueprint
## Legis Connect · Chief Product Officer (CPO) · Head of Product Design · UX Architect · Design System Lead
### Versão 1.0 | Classificação: CONFIDENCIAL | Data: 2026-07-25

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Corporativa de Experiência do Produto Digital, Design System e Estratégia de Evolução UX (Premium Legal Digital Experience Platform) da Legis Connect TO-BE**, consolidando 24 domínios estratégicos de Mapeamento de Capacidades do Produto, Personas de Usuário (PF, PME, Advogado, LegalOps, SysAdmin), Customer Journey Mapping, Arquitetura da Informação, Design System em Tokens (Figma/React/Tailwind), Acessibilidade Universal (WCAG 2.2 AA/AAA), Experiência do Marketplace Jurídico com Smart Match AI e Escrow, Product Analytics (Funil AAARRR), Onboarding Progressivo (TTV < 90s) e Governança de Produto.

**Estado AS-IS:** Maturidade de Produto & UX `1.4 / 5.0` (Inconsistente / Alta Fricção) — fluxos de onboarding extensos com taxa de abandono > 58%, falta de padronização visual entre módulos, dashboards ruidosos sem prioridade para prazos judiciais fatais, ausência de conformidade WCAG 2.2 e falta de métricas de produto orientadas por dados.

**Estado TO-BE:** Maturidade de Produto & UX `4.9 / 5.0` (Premium Legal Digital Experience Platform) — Legis Design System Corporativo em Tokens (Storybook React), Onboarding Progressivo em 3 Passos com TTV < 90s, Dashboards Adaptativos orientados a Ações P1, Marketplace Jurídico com Smart Match e Conta de Garantia (Escrow), Acessibilidade Universal WCAG 2.2 AA/AAA, Padrões de Interação Humano-IA com aprovação explícita (HITL) e Cultura de ProductOps com Dual-Track Agile.

---

## ETAPA 1 — AUDITORIA DA EXPERIÊNCIA ATUAL DO PRODUTO (AS-IS vs. TO-BE)

### 1.1 Matriz de Avaliação das Jornadas

| Jornada de Usuário | Estado Atual (AS-IS) | Problema Detectado | Oportunidade TO-BE |
|---|---|---|---|
| **Landing & Descoberta** | Página estática simples | Pouca conversão e falta de provas sociais | Landing interativa com Demos + Smart Match AI |
| **Onboarding Cliente** | Form de etapa única (18 campos)| Abandono > 58%, TTV longo (15 min) | Progressive Profiling em 3 passos (TTV < 90s) |
| **Dashboard Advogado** | Painel genérico poluído | Prazos fatais P1 misturados com notícias | Painel adaptativo orientado a ações críticas P1 |
| **Marketplace Busca** | Lista estática de advogados | Sem relevância semântica ou garantia | Smart Match AI + Escrow Account + Rating 5★ |
| **Gestão de Processos** | Lista textual em tabela simples | Dificuldade de acompanhar status | Kanban drag-and-drop + DataTables responsivas |

---

## ETAPA 2 — PRODUCT CAPABILITY MAP & PERSONAS DE USUÁRIO

```
LEGIS CONNECT — PRODUCT CAPABILITY MAP
├── 1. PUBLIC & ACQUISITION PORTAL
│   ├── Home / Value Proposition & Interactive Demos
│   ├── Smart Match AI (Encontrar Advogado em Linguagem Natural)
│   └── Legal Calculators & Privacy Consent Portal (CMP)
├── 2. ADVOCATE WORKSPACE (/app/advocate)
│   ├── Dashboard Adaptativo (Visão do Dia & Prazos Fatais P1)
│   ├── Case Manager (Kanban / DataTables com filtros avançados)
│   ├── Legis Copilot (Elaboração Assistida de Peças & Resumos)
│   └── Financeiro (Faturamento, Split Payment & Dunning)
├── 3. CLIENT PORTAL (/app/client)
│   ├── Meu Painel (Linha do Tempo Visual tipo Rastreamento)
│   ├── Client AI Assistant (Tradução de Juridiquês Real-time)
│   └── Meus Documentos (Cofre Digital S3 Object Lock & Assinaturas)
└── 4. ENTERPRISE ADMIN & DEVELOPER
    ├── System Health, SLOs & Infrastructure Audit
    ├── Gestão de Usuários, RBAC/ABAC & Security Audit Logs
    └── Developer Portal B2B (APIs, Webhooks Engine & Sandbox)
```

---

## ETAPA 3 — CUSTOMER JOURNEY BLUEPRINT & ONBOARDING TTV < 90S

```
JORNADA DO CLIENTE FINAL:
[DESCOBERTA (SEO/Calculadora)] ──> [CADASTRO PROGRESSIVO (<90s)] ──> [SMART MATCH AI]
                                                                            │
[AVALIAÇÃO 5★ & RETENÇÃO] <── [TIMELINE REAL-TIME / TRANSLATOR] <── [CONTRATAÇÃO ESCROW]

JORNADA DO ADVOGADO:
[CADASTRO OAB AUTOMÁTICO] ──> [CONFIGURAÇÃO DO PERFIL] ──> [DASHBOARD PRAZOS P1]
                                                                        │
[REPASSE PIX INSTANTÂNEO] <── [ATENDIMENTO & COPILOTO IA] <─────── [RECEBIMENTO DEMANDAS]
```

---

## ETAPA 4 — DESIGN SYSTEM ENTERPRISE & DESIGN TOKENS

```json
{
  "color": {
    "brand": { "primary": "#0F172A", "accent": "#2563EB" },
    "semantic": { "success": "#059669", "warning": "#D97706", "critical": "#E11D48" },
    "neutral": { "bg": "#F8FAFC", "surface": "#FFFFFF", "text": "#1E293B" }
  },
  "typography": {
    "fontFamily": { "primary": "Inter, sans-serif", "heading": "Outfit, sans-serif" },
    "scale": { "display": "36px", "h1": "30px", "h2": "24px", "body": "14px", "caption": "12px" }
  },
  "spacing": { "base": "8px", "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px" }
}
```

- **Biblioteca de Componentes (Storybook React):** Tokens, Components (Buttons, Forms, Cards), Patterns (Dashboards, Multi-step forms), Templates e Guidelines.

---

## ETAPA 5 — ACESSIBILIDADE DIGITAL UNIVERSAL (WCAG 2.2 AA/AAA)

- **Navegação 100% por Teclado:** Aneis de foco bem visíveis (`outline: 2px solid #2563EB`) em todos os elementos interativos.
- **Suporte Total a Leitores de Tela:** Atributos ARIA completos (`aria-expanded`, `aria-live="polite"` para atualizações dinâmicas).
- **Contraste de Texto:** Manutenção estrita da razão de contraste de no mínimo 4.5:1 para texto normal e 3:1 para elementos visuais.

---

## ETAPA 6 — MARKETPLACE JURÍDICO & TRUST EXPERIENCE FRAMEWORK

- **Smart Match & Rating 5★:** Algoritmo de recomendação combinando especialidade da causa, geolocalização e avaliações validadas de clientes anteriores.
- **Garantia de Pagamento (Escrow Visual):** Indicador gráfico mostrando a custódia segura dos honorários em Conta Grafada do Banco Central até a entrega do serviço.
- **Badge de Autenticidade OAB:** Selo de verificação em tempo real junto aos cadastros das Seccionais da OAB.

---

## ETAPA 7 — PRODUCT ANALYTICS & GROWTH FUNNEL (AAARRR)

```
FUNIL AAARRR DE PRODUTO:
1. Aquisição: Visitantes únicos na Landing Page convertidos em Cadastros (Meta: > 4.5%).
2. Ativação: % de novos usuários que concluem a primeira ação útil em < 24h (Meta: > 75%).
3. Retenção: % de advogados ativos após 30 dias (D30 Retention Meta: > 68%).
4. Receita: MRR, ARR e Net Retention Rate (NRR > 118%).
5. Indicação: Net Promoter Score (NPS > 50) e convites virais entre advogados.
```

---

## ETAPA 8 — ROADMAP EVOLUTIVO DO PRODUTO (4 FASES)

```
ROADMAP EXECUTIVO DE PRODUTO:
├── FASE 1 — CORREÇÃO & HARMONIZAÇÃO (Meses 1 - 3)
│   ├── Lançamento do Design System Corporativo em React / Tailwind
│   ├── Refatoração do Onboarding para Cadastro Progressivo em 3 passos (TTV < 90s)
│   └── Implementação das diretrizes WCAG 2.2 AA de Acessibilidade
├── FASE 2 — EXPERIÊNCIA PREMIUM & MARKETPLACE (Meses 4 - 6)
│   ├── Lançamento do Smart Match AI e Conta de Garantia (Escrow Split)
│   ├── Implementação da Linha do Tempo Visual e Tradutor de Juridiquês
│   └── Lançamento dos Dashboards Operacionais e Product Analytics (Mixpanel)
├── FASE 3 — INTELIGÊNCIA & COPILOTO (Meses 7 - 9)
│   ├── Lançamento do Legis Copilot com RAG Híbrido e confirmação HITL
│   └── Sistema Multiagente LangGraph para pesquisa e análise contratual
└── FASE 4 — ECOSSISTEMA & B2B (Meses 10 - 12)
    ├── Lançamento do Developer Portal B2B e APIs Comerciais
    └── Certificações ISO 27001, SOC 2 Type II e ISO 8000 Data Quality
```

---

## ETAPA 9 — BACKLOG ESTRATÉGICO DE PRODUTO DIGITAL

---

### PRODUCT-001 — Implementação do Design System Corporativo Unificado

**Problema:** A plataforma possui telas inconsistentes, gerando confusão nos usuários e lentidão no desenvolvimento.

**Impacto:** Redução da confiança percebida e alta curva de aprendizado.

**Solução:** Implantar o Legis Design System em Tokens (Figma/React/Tailwind) catalogado no Storybook.

**Prioridade:** CRÍTICA | **Complexidade:** Média | **Estimativa:** 6 semanas

---

### PRODUCT-002 — Redesenho do Onboarding para Cadastro Progressivo (TTV < 90s)

**Problema:** O cadastro atual exige 18 campos no primeiro passo, gerando abandono de 58%.

**Impacto:** Perda massiva de novos usuários potenciais e frustração inicial.

**Solução:** Criar fluxo de onboarding em 3 passos simples com autocompletar via CPF/OAB e dados de demonstração.

**Prioridade:** CRÍTICA | **Complexidade:** Baixa-Média | **Estimativa:** 3 semanas

---

### PRODUCT-003 — Dashboards Adaptativos com Foco em Prazos Fatais P1

**Problema:** Prazos judiciais urgentes aparecem misturados com notícias e informações genéricas.

**Impacto:** Risco operacional grave de perda de prazos processuais por advogados.

**Solução:** Redesenhar os painéis priorizando alertas visuais P1 (Rose 600) e agenda limpa orientada à ação.

**Prioridade:** CRÍTICA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

### PRODUCT-004 — Marketplace Jurídico com Smart Match e Escrow Visual

**Problema:** A busca de advogados é estática e não transmite segurança financeira para o contratante.

**Impacto:** Baixa conversão de matches e desconfiança na realização de pagamentos online.

**Solução:** Implementar busca semântica em linguagem natural, ranking por avaliações 5★ e selo gráfico de retenção em Escrow.

**Prioridade:** ALTA | **Complexidade:** Média-Alta | **Estimativa:** 5 semanas

---

### PRODUCT-005 — Legis Copilot & Padrões de Interação Humano-IA

**Problema:** Sugestões de IA geram texto sem indicação clara de origem ou nível de confiança.

**Impacto:** Recusa de advogados em utilizar o copiloto por receio de alucinações.

**Solução:** Criar badges de transparência de IA, explicabilidade de fontes e confirmação obrigatória Human-in-the-Loop.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

## ETAPA 10 — ARQUITETURA FINAL DE PRODUTO ENTERPRISE (PREMIUM LEGAL PLATFORM)

```
LEGIS CONNECT — INTEGRATED ENTERPRISE PRODUCT ARCHITECTURE
Versão 1.0 — Julho 2026

[PERSONAS & USUÁRIOS]
Clientes Finais · Advogados Autônomos · Escritórios (LegalOps) · Administradores · Parceiros B2B
          ↓
[ESTRATÉGIA DE PRODUTO & VISION]
Premium Legal Digital Experience Platform · Proposta de Valor AI-Native · Posicionamento Líder
          ↓
[DESIGN SYSTEM & ACESSIBILIDADE (Foundations)]
Design Tokens (Figma Engine) ──> Storybook React ──> WCAG 2.2 AA Universal Accessibility
          ↓
[ARQUITETURA MODULAR & JORNADAS]
 ├── Public & Acquisition Portal (Smart Match AI)
 ├── Advocate Workspace (Dashboards Adaptativos & Prazos P1)
 ├── Client Portal (Timeline Visual & Tradutor de Juridiquês)
 └── Enterprise Admin & Developer Portal (APIs B2B & Webhooks Engine)
          ↓
[PRODUCTOPS & GROWTH ENGINE]
Dual-Track Agile (Discovery + Delivery) · Funil AAARRR Analytics · Roadmap em 4 Fases
```

---

*Enterprise Product Experience & Design System Blueprint v1.0*
*Chief Product Officer · Head of Product Design · Legis Connect · 2026*
