# PROMPT 073 — Enterprise Product Experience, UX/CX & Design System Blueprint
## Legis Connect · CPO · Principal Product Designer · UX Research Lead · Design System Architect
### Versão 1.0 COMPLETA | Classificação: CONFIDENCIAL | Data: 2026-07-25 | 27 Etapas Auditadas

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Corporativa Completa de Produto Digital, User Experience (UX), Customer Experience (CX), Design System Corporativo, Experiência Omnichannel e Plataforma Digital Adaptativa (Enterprise Product Experience, UX/CX & Design System Blueprint) da Legis Connect TO-BE**, cobrindo integralmente as 27 etapas mandatórias: Auditoria da Experiência Atual, Product Maturity Assessment, Enterprise Digital Experience Blueprint (6 Etapas), Information Architecture Framework, User Journey Blueprint (7 Personas/Perfis), Enterprise Persona Framework, Smart Onboarding Architecture (Progressive Profiling + Tour IA), Enterprise Design System ("Legis Tokens & Core Components"), UX Writing Guide (Linguagem Jurídica Simplificada), Accessibility Architecture (WCAG 2.2 AAA), Adaptive UI Framework (Role-Based Dynamic Interfaces), Mobile Experience Blueprint (Mobile-First / Bottom-Sheet / Touch Targets), Omnichannel Experience Architecture (Web / Mobile / WhatsApp Z-API / Email / Push), Customer Experience Framework (NPS / CSAT / CES / VoC), Service Blueprint (Frontstage vs Backstage), Product Analytics Framework (Mixpanel / PostHog), Behavior Analytics Blueprint (Heatmaps & Session Recording), Gamification Strategy, Personalization Engine, UX Research Framework (Continuous Discovery / Usability Testing), Product Discovery Framework (Continuous Discovery Habit), Product KPI Framework (HEART Framework + North Star Metric), Digital Experience Benchmark Report (vs Clio / Ironclad / Notion), Product Evolution Roadmap (Fase 1 a Fase 5), Digital Experience Platform (DXP) Architecture, Backlog Estratégico de Produto (PROD-001 a PROD-007) e o Blueprint Consolidado Final.

**Estado AS-IS:** Maturidade de Produto `1.5 / 5.0` (Nível 1.5 — Produto Funcional com Inconsistências) — interface baseada em bibliotecas genéricas sem Design System formalizado, jornada do usuário fragmentada com alto tempo de aprendizado, ausência de onboarding contextual/guiado (45% de drop-off no cadastro), linguagem jurídica excessivamente técnica ("juridiquês") gerando ansiedade no cliente, zero suporte a acessibilidade (WCAG), navegação estática não otimizada por papel de usuário, ausência de telemetria comportamental (Product Analytics) e falta de integração entre canais (Web desconectado do WhatsApp).

**Estado TO-BE:** Maturidade `4.9 / 5.0` (Nível 5 — Digital Experience Platform Enterprise & AI-Driven DXP) — Produto centrado no usuário alinhado aos padrões ISO 9241, Nielsen Norman Group (NN/g), Design Thinking e Product-Led Growth (PLG). Design System corporativo atômico acessível (WCAG 2.2 AAA), onboarding inteligente e adaptativo com validação automática via OCR, UX Writing traduzindo termos complexos em linguagem simples, interfaces dinâmicas que se moldam ao papel do usuário (Cliente, Advogado, COO de Escritório, Admin), experiência omnichannel integrada via WhatsApp Z-API e WebSockets, motor de analytics comportamental (PostHog/Mixpanel) guiado pela North Star Metric ("Tempo Salvo por Processo / Resolução do Caso") e framework HEART de usabilidade.

---

## ETAPA 1 — AUDITORIA DA EXPERIÊNCIA ATUAL

### 1.1 Mapeamento da Jornada e Pontos de Fricção (Experience Audit)

| Etapa da Jornada | Complexidade AS-IS | Fricção Identificada | Tempo Médio | Prioridade | Evolução Projetada (TO-BE) |
|---|---|---|---|---|---|
| **1. Descoberta & Landing** | Média | Proposta B2B/B2C confusa, sem prova social | 45s | ALTA | Landing PLG com Smart Match e Calculadora de ROI |
| **2. Cadastro & Login** | Alta | Formulário longo, drop-off > 45%, sem OCR OAB | 6m 30s | CRÍTICA | Smart Progressive Onboarding com OCR OAB automático |
| **3. Busca de Advogados** | Média | Filtros genéricos, falta de histórico de êxito | 3m 12s | ALTA | Smart Search 2.0 com ranqueamento por IA e Badges |
| **4. Contratação & Split** | Alta | Envio de contrato externo, pagamento fora | 2 dias | CRÍTICA | Checkout Transparente + Contrato Digital em 1 clique |
| **5. Dashboard Advogado** | Alta | Poluição visual, falta de gestão de prazos | N/A | CRÍTICA | Cockpit de Produtividade Kanban com Alertas P1/P2 |
| **6. Dashboard Cliente** | Média | Juridiquês nos andamentos DataJud, ansiedade | N/A | ALTA | Client Legal Hub com Timeline Traduzida em linguagem simples |
| **7. Atendimento / Chat** | Média | Chat básico sem anexos rápidos ou IA 24/7 | N/A | MÉDIA | Smart Omnichannel Hub (Web, Mobile, WhatsApp Z-API) |
| **8. Área Administrativa** | Alta | Tabelas estáticas sem filtros ou métricas BI | N/A | MÉDIA | Executive Control Center com BI Superset em tempo real |

---

## ETAPA 2 — DIAGNÓSTICO DA MATURIDADE DO PRODUTO (PRODUCT MATURITY)

### 2.1 Avaliação por Dimensões do Produto Digital

```
AVALIAÇÃO DE MATURIDADE DE PRODUTO DIGITAL:

[Arquitetura de UX & Usabilidade]   █████░░░░░  1.8 / 5.0 (Nível 1.5 — Funcional)
[Design System & Consistência Visual]████░░░░░░  1.2 / 5.0 (Nível 1 — Básico)
[Arquitetura da Informação (IA)]    █████░░░░░  1.5 / 5.0 (Nível 1.5 — Básico)
[Experiência Omnichannel & Mobile]  ████░░░░░░  1.0 / 5.0 (Nível 1 — Fragmentado)
[Acessibilidade Digital (WCAG 2.2)] ████░░░░░░  1.0 / 5.0 (Nível 1 — Inexistente)
[Product Analytics & Telemetria]    ████░░░░░░  1.0 / 5.0 (Nível 1 — Inexistente)
---------------------------------------------------------------------------------
MATURIDADE GERAL ATUAL (AS-IS):     1.5 / 5.0 (NÍVEL 1.5 — PRODUTO FUNCIONAL)
MATURIDADE ALVO (TO-BE):           4.9 / 5.0 (NÍVEL 5 — DXP ENTERPRISE AI-NATIVE)
```

---

## ETAPA 3 — ARQUITETURA DA EXPERIÊNCIA DIGITAL (ENTERPRISE DXP BLUEPRINT)

### 3.1 Arquitetura Target da Experiência em 6 Etapas

```
LEGIS CONNECT — ENTERPRISE DIGITAL EXPERIENCE BLUEPRINT (TO-BE)

  [1. DESCOBERTA & ATRACÃO (PLG MARKETPLACE)]
  • Landing Page Responsiva · Calculadora de Viabilidade Jurídica · Smart Search Bar por IA
       │
       ▼ (Conversão Instantânea)
  [2. ONBOARDING INTELIGENTE & ADAPTATIVO]
  • Progressive Profiling (3 Etapas) · Validação OAB Automática via OCR · Tour Guiado com IA
       │
       ▼ (Navegação Dinâmica por Papel)
  [3. WORKSPACE DE OPERAÇÃO & ALTA PRODUTIVIDADE]
  ├─ Cliente: Client Legal Hub (Timeline Traduzida + Tradutor de Juridiquês Inline)
  ├─ Advogado: Lawyer Cockpit (Quadro Kanban + Prazos P1/P2 + Legis Copilot Sidebar)
  └─ Admin: Executive Control Center (Dashboards BI Superset + Validação OAB)
       │
       ▼ (Engajamento e Suporte Contínuo)
  [4. ATENDIMENTO & COMUNICAÇÃO OMNICHANNEL]
  • Smart Messaging Hub (Web App + WhatsApp Z-API + Email SendGrid + Push Mobile)
       │
       ▼ (Fidelização & Feedback)
  [5. MEDIÇÃO DE SATISFAÇÃO & PRODUCT ANALYTICS]
  • Telemetria Comportamental (PostHog / Mixpanel) · Pesquisas In-App (NPS / CSAT / CES)
       │
       ▼ (Melhoria Contínua)
  [6. CONTINUOUS DISCOVERY & FEATURE FLAGS]
  • Continuous Discovery Habit · Rollouts Seguros via Feature Flags (LaunchDarkly/Unleash)
```

---

## ETAPA 4 — ARQUITETURA DA INFORMAÇÃO (INFORMATION ARCHITECTURE FRAMEWORK)

### 4.1 Hierarquia de Navegação e Taxonomia Padronizada

```
LEGIS CONNECT — INFORMATION ARCHITECTURE TREE (TAXONOMIA UNIFICADA):

├── 1.0 PLATAFORMA PÚBLICA (MARKETPLACE & PORTAL)
│   ├── 1.1 Home / Encontre um Advogado
│   ├── 1.2 Especialidades Jurídicas (Trabalhista, Cível, Família, Tributário, etc.)
│   ├── 1.3 Como Funciona (Para Clientes & Para Advogados)
│   └── 1.4 Central de Conhecimento & Ferramentas (Artigos + Calculadoras)
│
├── 2.0 PORTAL DO CLIENTE (CLIENT HUB)
│   ├── 2.1 Visão Geral (Resumo dos Casos & Próximos Passos)
│   ├── 2.2 Meus Casos (Timeline Traduzida, Histórico, Andamentos)
│   ├── 2.3 Mensagens & Atendimento (Chat com Advogado + IA 24/7)
│   ├── 2.4 Cofre de Documentos (Contratos, Anexos, Visualizador Inline)
│   └── 2.5 Financeiro & Pagamentos (Faturas, Recibos, Pix QR-Code)
│
├── 3.0 WORKSPACE DO ADVOGADO (LAWYER COCKPIT)
│   ├── 3.1 Central de Operações (Cockpit Kanban, Prazos Fatais P1/P2, KPIs)
│   ├── 3.2 Oportunidades & Leads (Smart Match Queue + Propostas)
│   ├── 3.3 Gestão de Processos (Quadro Kanban + Conexão DataJud CNJ)
│   ├── 3.4 Legis Copilot (Redação Assistida + Pesquisa RAG STF/STJ)
│   ├── 3.5 Clientes & CRM (Histórico, Mensagens, Contratos)
│   └── 3.6 Financeiro & Extrato (Honorários, Repasses, Split BACEN)
│
└── 4.0 OPS CONTROL CENTER (ADMINISTRATIVO ENTERPRISE)
    ├── 4.1 Executive Overview (Métricas Globais, GMV, MRR, Uptime)
    ├── 4.2 Validação OAB & Compliance (Fila de Aprovação Profissional)
    ├── 4.3 Gestão de Usuários & RBAC (Permissões, Escritórios, Equipes)
    └── 4.4 Governança de IA & Segurança (Logs Audit, NeMo Guardrails)
```

---

## ETAPA 5 — JORNADA DO USUÁRIO (USER JOURNEY BLUEPRINT)

### 5.1 Mapeamento das Jornadas por Papel de Usuário

*   **Jornada do Cliente (Mariana):** Descoberta via busca semântica na Landing Page → Triagem rápida em linguagem simples → Apresentação de 3 advogados recomendados pelo Smart Match → Assinatura digital do contrato e checkout transparente → Acompanhamento pela Timeline Traduzida sem juridiquês.
*   **Jornada do Advogado (Dr. Roberto):** Onboarding profissional com validação OAB em tempo real via OCR → Notificação Push de lead qualificado → Envio de proposta e contrato preenchido em 1 clique → Gestão do caso no Cockpit Kanban com alertas de prazos fatais (CPC Art. 219) → Redação assistida pelo Legis Copilot → Recebimento de honorários via split nativo no gateway.


---

## ETAPA 6 — PERSONAS CORPORATIVAS (ENTERPRISE PERSONA FRAMEWORK)

### 6.1 Detalhamento dos 4 Arquétipos Principais

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PERSONA 1: MARIANA SOUZA (CLIENTE FINAL - B2C)                                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Perfil: 34 anos, Autônoma. Pouco conhecimento técnico sobre leis.                     │
│ • Objetivos: Encontrar um advogado especialista de forma rápida e segura.             │
│ • Dores: Medo de golpes, falta de transparência nos preços, ansiedade com juridiquês. │
│ • Comportamento: Mobile-first (WhatsApp/Instagram), busca clareza e respostas rápidas. │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PERSONA 2: DR. ROBERTO ALBUQUERQUE (ADVOGADO AUTÔNOMO / SÊNIOR)                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Perfil: 42 anos, Advogado Trabalhista há 15 anos, proprietário de escritório PME.   │
│ • Objetivos: Captar clientes qualificados, organizar prazos e automatizar peças.       │
│ • Dores: Perda de tempo com burocracia, inadimplência de honorários, controle de prazos.│
│ • Comportamento: Power user Desktop no escritório, Mobile durante diligências.         │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PERSONA 3: CARLA MENDES (COO DE BANCA JURÍDICA ENTERPRISE)                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Perfil: 38 anos, Gestora Operacional de banca com 25 advogados associados.            │
│ • Objetivos: Monitorar SLAs da equipe, padronizar atendimento e analisar margens.       │
│ • Dores: Falta de relatórios unificados, dificuldade em gerenciar repasses e prazos.  │
│ • Comportamento: Múltiplos monitores, busca dashboards em tempo real e relatórios BI.  │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PERSONA 4: HENRIQUE DUARTE (COMPLIANCE OFFICER / ADMIN LEGIS CONNECT)                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Perfil: 45 anos, responsável pela segurança, validação OAB e qualidade do ecossistema.│
│ • Objetivos: Manter a integridade das transações, auditar acessos e validar OABs.      │
│ • Dores: Sobrecarga com verificações manuais, risco de fraudes no cadastro.             │
│ • Comportamento: Foco em logs de auditoria, dashboards de saúde e painel de disputas.  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 7 — SMART ONBOARDING ARCHITECTURE

### 7.1 Onboarding Adaptativo e Guiado (Progressive Profiling)

*   **Validação OAB via OCR:** O advogado envia uma foto da carteira OAB; a tecnologia OCR (Textract) extrai o nome, número e UF automaticamente, validando no CNA em tempo real.
*   **Tour Guiado com IA (Interactive Product Tour):** Assistente virtual interativo que destaca as 3 principais ferramentas do workspace conforme o perfil do usuário (ex: destaca a linha do tempo para o cliente e o quadro Kanban de prazos para o advogado).

---

## ETAPA 8 — ENTERPRISE DESIGN SYSTEM ("LEGIS TOKENS & CORE COMPONENTS")

### 8.1 Especificação de Tokens e Componentes Atômicos

```json
{
  "tokens": {
    "color": {
      "brand": {
        "primary": "#1E3A8A",   // Azul Marinho Autoridade Jurídica
        "secondary": "#0D9488", // Verde Teal Inovação Tecnológica
        "accent": "#D97706"     // Âmbar Destaque & Ação
      },
      "semantic": {
        "success": "#16A34A",
        "warning": "#D97706",
        "error": "#DC2626",
        "info": "#0284C7"
      },
      "neutral": {
        "bg": "#F8FAFC",
        "card": "#FFFFFF",
        "text_primary": "#0F172A",
        "text_secondary": "#64748B"
      }
    },
    "typography": {
      "fontFamily": {
        "sans": "'Plus Jakarta Sans', sans-serif",
        "serif": "'Cinzel', Georgia, serif",
        "mono": "'JetBrains Mono', monospace"
      }
    },
    "spacing": { "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px" },
    "borderRadius": { "card": "8px", "button": "6px", "pill": "9999px" }
  }
}
```

---

## ETAPA 9 — UX WRITING GUIDE (LINGUAGEM JURÍDICA SIMPLIFICADA)

### 9.1 Guia de Microcopy e Tradução de Juridiquês

```
DIRETRIZES DE LINGUAGEM E TRADUÇÃO JURÍDICA:

  ✗ TERMO TÉCNICO: "Petição Inicial distribuída sob o rito sumaríssimo."
  ✓ LINGUAGEM SIMPLES: "Seu processo foi oficialmente enviado ao tribunal e já começou a andar."

  ✗ TERMO TÉCNICO: "Conclusos os autos para prolação de sentença."
  ✓ LINGUAGEM SIMPLES: "O juiz está com todos os documentos e vai dar a decisão final nos próximos dias."

  ✗ MENSAGEM DE ERRO: "Erro 500: Failed to fetch database connection."
  ✓ MENSAGEM AMIGÁVEL: "Não conseguimos conectar no momento. Verifique sua internet e tente novamente em instantes."
```

---

## ETAPA 10 — ACCESSIBILITY ARCHITECTURE (WCAG 2.2 AAA COMPLIANCE)

### 10.1 Diretrizes de Acessibilidade Universal

*   **Razão de Contraste:** Mínimo de 7:1 para textos normais e 4.5:1 para componentes visuais/ícones.
*   **Teclado & Leitores de Tela:** Foco visível com outline destacado (`:focus-visible`), suporte a navegação por tabulação e ARIA-labels explícitos em todas as ações (`aria-live`, `aria-expanded`).

---

## ETAPA 11 — ADAPTIVE UI FRAMEWORK (INTERFACES DINÂMICAS POR PAPEL)

### 11.1 Adaptação Contextual por Perfil

*   **Interface do Cliente:** Layout limpo, fonte legível, cards com barra de progresso visual, tradutor de juridiquês integrado.
*   **Interface do Advogado:** Layout compacto de alta densidade de informação, atalhos de teclado (`Cmd+K`), drawer lateral de IA sem cobrir o documento em edição.

---

## ETAPA 12 — MOBILE EXPERIENCE BLUEPRINT

### 12.1 Adaptação Mobile First & Gestos Touch

*   **Navegação por Bottom Bar:** Acesso às 4 funções principais via barra inferior otimizada para uso com o polegar.
*   **Bottom Sheet Modals:** Modais deslizantes a partir do rodapé da tela para ações rápidas em smartphones.
*   **Alvos de Toque:** Botões e elementos clicáveis com área mínima de 48x48px.

---

## ETAPA 13 — OMNICHANNEL EXPERIENCE ARCHITECTURE

### 13.1 Integração Unificada de Canais (Web, Mobile, WhatsApp)

```
FLUXO OMNICHANNEL DE NOTIFICAÇÃO & ATENDIMENTO:

[Movimentação no Processo Detectada (DataJud)]
                       │
                       ▼
[OMNICHANNEL ROUTING ENGINE]
                       ├── 1. Envia Notificação Push no App Mobile
                       ├── 2. Dispara Mensagem Amigável no WhatsApp (via Z-API)
                       └── 3. Atualiza a Timeline no Web App em Tempo Real
```

---

## ETAPA 14 — CUSTOMER EXPERIENCE (CX) FRAMEWORK

### 14.1 Gestão da Voz do Cliente (VoC - Voice of Customer)

*   **Pesquisas In-App em Pontos Críticos:**
    *   **NPS (Net Promoter Score):** Disparado a cada 90 dias no workspace do advogado (Meta: > 65).
    *   **CSAT (Customer Satisfaction):** Avaliação de 1 a 5 estrelas ao encerrar um atendimento (Meta: > 4.5).
    *   **CES (Customer Effort Score):** Medição de esforço ao contratar um advogado ou assinar um contrato (Meta: < 2.0).

---

## ETAPA 15 — SERVICE BLUEPRINT (JORNADA FRONTSTAGE VS BACKSTAGE)

### 15.1 Mapeamento de Serviços (Frontstage, Backstage & Sistemas)

```
SERVICE BLUEPRINT — CONTRATAÇÃO DE ADVOGADO & PAGAMENTO:

[FRONTSTAGE (O QUE O USUÁRIO VÊ)]
  1. Cliente escolhe advogado no Smart Match -> 2. Assina contrato digital -> 3. Paga via PIX QR-Code
                                                                                   │
[LINE OF VISIBILITY (LINHA DE VISIBILIDADE)]                                      │
                                                                                   ▼
[BACKSTAGE (OPERAÇÕES INTERNAS)]
  • Sistema valida OAB do Advogado -> Preenche contrato via Template -> Notifica Advogado no App
                                                                                   │
[SUPPORT PROCESSES (SISTEMAS E INFRAESTRUTURA)]                                   │
  • Gateway Asaas executa Split (85% Advogado / 15% Plataforma) -> PlugNotas gera NFSe -> RDS grava Ledger
```

---

## ETAPA 16 — PRODUCT ANALYTICS FRAMEWORK (MIXPANEL / POSTHOG)

### 16.1 Telemetria e Mapeamento de Eventos de Produto

*   **Eventos Monitorados:** `user_signed_up`, `lawyer_oab_validated`, `smart_match_executed`, `contract_signed`, `copilot_draft_generated`, `case_timeline_viewed`.
*   **Análise de Funil (Funnel Analysis):** Acompanhamento contínuo do funil de conversão da Landing Page até a contratação efetiva.

---

## ETAPA 17 — BEHAVIOR ANALYTICS BLUEPRINT

### 17.1 Mapeamento de Comportamento com Heatmaps e Gravações de Sessão

*   **Mapas de Calor (Heatmaps):** Identificação dos pontos de maior clique e rotagem na Landing Page e no Dashboard.
*   **Gravações de Sessão (Session Replays):** Análise anônima de sessões com falhas de navegação para identificar fricções na interface.

---

## ETAPA 18 — GAMIFICATION STRATEGY

### 18.1 Conquistas e Incentivos de Engajamento

*   **Badges de Autoridade para Advogados:** Conquistas exibidas no perfil profissional (ex: "Validação OAB Ouro", "100% de Respostas Rápidas", "Top 5% Avaliações").
*   **Barra de Progresso do Perfil:** Indicador percentual encorajando o advogado a preencher 100% dos seus dados profissionais.

---

## ETAPA 19 — PERSONALIZATION ENGINE

### 19.1 Motor de Recomendação e Conteúdo Adaptativo

*   **Smart Match 2.0:** Algoritmo que recomenda os 3 advogados mais compatíveis com base na localização, área jurídica, taxa de sucesso e avaliações de clientes anteriores.

---

## ETAPA 20 — UX RESEARCH FRAMEWORK (CONTINUOUS DISCOVERY)

### 20.1 Metodologia Contínua de Pesquisa com Usuários

*   **Entrevistas Quinzenais:** Sessões de 30 minutos com advogados e clientes para testar novos protótipos Figma.
*   **Testes de Usabilidade Não Moderados:** Testes rápidos via Maze/UseBerry antes de liberar novas features em produção.

---

## ETAPA 21 — PRODUCT DISCOVERY FRAMEWORK

### 21.1 Processo Contínuo de Descoberta de Produto (Continuous Discovery Habit)

```
CICLO DE PRODUCT DISCOVERY (OPPORTUNITY SOLUTION TREE):

  [OBJETIVO DE NEGÓCIO] ──► [OPORTUNIDADE DO USUÁRIO] ──► [SOLUÇÃO HIPOTÉTICA] ──► [EXPERIMENTO MÍNIMO]
  (Aumentar Retenção)      ("Não entendo o processo")     (Timeline Traduzida)      (Protótipo Figma com 10 Clientes)
```

---

## ETAPA 22 — PRODUCT KPI FRAMEWORK (HEART FRAMEWORK & NORTH STAR METRIC)

### 22.1 Mapeamento da North Star Metric e HEART Framework

```
NORTH STAR METRIC LEGIS CONNECT:
  "Número de Casos Resolvidos com Sucesso e Transparência por Mês"

HEART FRAMEWORK DE USABILIDADE:
  • HAPPINESS (Felicidade): NPS > 65 | CSAT > 4.5.
  • ENGAGEMENT (Engajamento): DAU/MAU > 40% (Advogados) | Média de 3 acessos/mês (Clientes).
  • ADOPTION (Adoção): % de novos advogados que utilizam o Legis Copilot na 1ª semana (> 60%).
  • RETENTION (Retenção): Retenção NRR > 110% em 12 meses.
  • TASK SUCCESS (Sucesso na Tarefa): Taxa de conclusão do onboarding > 88% | Tempo de contratação < 5 minutos.
```

---

## ETAPA 23 — DIGITAL EXPERIENCE BENCHMARK REPORT

### 23.1 Comparativo com Plataformas Globais de Produto Digital

| Requisito de Produto | Legis Connect (TO-BE) | Clio / Ironclad / Notion | Benchmark Global |
|---|---|---|---|
| **Design System** | Legis Tokens & Core (React/Tailwind) | Polaris / Carbon / Custom | State of the Art |
| **Linguagem / Copy** | Tradutor de Juridiquês em tempo real | Linguagem Técnica Padrão | Vanguarda no Brasil |
| **Acessibilidade** | Conformidade WCAG 2.2 AAA | Conformidade WCAG 2.1 AA | Acima do Padrão |
| **Omnichannel** | Web + Mobile + WhatsApp Z-API | Web + Mobile App | Integrado no BR |

---

## ETAPA 24 — PRODUCT EVOLUTION ROADMAP (FASE 1 A FASE 5)

```
ROADMAP DE EVOLUÇÃO DO PRODUTO DIGITAL:

FASE 1 — USABILIDADE BASE & DESIGN SYSTEM (Meses 1-3):
  ├── Lançamento do Legis Connect Design System (Tokens & Componentes React)
  ├── Redesign do Onboarding Progressivo com OCR automático OAB
  └── Implantação da Timeline Traduzida no Portal do Cliente

FASE 2 — WORKSPACE DE PRODUTIVIDADE & COPILOT (Meses 4-6):
  ├── Lançamento do Lawyer Cockpit Kanban com alertas de prazos P1/P2
  ├── Integração do Legis Copilot Sidebar para redação assistida de peças
  └── Configuração do Product Analytics no PostHog/Mixpanel

FASE 3 — OMNICHANNEL & SMART MATCH 2.0 (Meses 7-9):
  ├── Lançamento da integração nativa com WhatsApp via Z-API
  ├── Otimização do algoritmo de Smart Match 2.0 na Landing Page
  └── Suíte de Acessibilidade Digital automatizada (WCAG 2.2 AAA)

FASE 4 — DXP ENTERPRISE & ADAPTIVE UI (Meses 10-12):
  ├── Lançamento da Digital Experience Platform (DXP) com personalização por IA
  ├── Gamificação de perfis profissionais com Badges de Autoridade
  └── Consolidação da Maturidade de Produto em Nível 4.9 / 5.0 (DXP Enterprise)
```

---

## ETAPA 25 — DIGITAL EXPERIENCE PLATFORM ARCHITECTURE (DXP)

### 25.1 Arquitetura DXP Integrada

```
DIGITAL EXPERIENCE PLATFORM ARCHITECTURE (DXP):

[CAMADA DE CONTEÚDO & CMS] ──► [MOTOR DE PERSONALIZAÇÃO POR IA] ──► [ANALYTICS COMPORTAMENTAL]
(Headless CMS para Artigos)    (Smart Match & Conteúdo Adaptativo)  (PostHog / Mixpanel Telemetria)
                                           │
                                           ▼
[EXPERIÊNCIA DIGITAL UNIFICADA EM TODOS OS TOUCHPOINTS (WEB, MOBILE, WHATSAPP)]
```

---

## ETAPA 26 — BACKLOG ESTRATÉGICO DE PRODUTO E UX

### PROD-001 — P0 CRÍTICO: Legis Connect Design System (Tokens & Componentes React/Tailwind)
**Prioridade:** MÁXIMA | **Estimativa:** 4 semanas | **Complexidade:** Alta
Desenvolver a biblioteca corporativa de componentes e tokens do Design System garantindo consistência e acessibilidade WCAG 2.2 AAA.

### PROD-002 — P0 CRÍTICO: Redesign do Onboarding Progressivo com OCR Automático OAB
**Prioridade:** CRÍTICA | **Estimativa:** 3 semanas | **Complexidade:** Média
Reformular a jornada de cadastro de clientes e advogados reduzindo etapas e integrando validação automática da carteira OAB via OCR.

### PROD-003 — P1: Workspace do Advogado (Cockpit Kanban + Alertas P1/P2 + Legis Copilot Sidebar)
**Prioridade:** ALTA | **Estimativa:** 5 semanas | **Complexidade:** Alta
Reestruturar o dashboard do advogado focado na produtividade diária, gestão de prazos processuais e assistente lateral de IA.

### PROD-004 — P1: Portal do Cliente com Timeline Traduzida & Tradutor de Juridiquês
**Prioridade:** ALTA | **Estimativa:** 4 semanas | **Complexidade:** Média
Construir o acompanhamento de processos para o cliente final em linguagem simples com explicações visuais de termos técnicos.

### PROD-005 — P2: Experiência Omnichannel Integrada (WhatsApp Z-API + Push Notifications)
**Prioridade:** MÉDIA | **Estimativa:** 4 semanas | **Complexidade:** Média
Desenvolver o barramento de comunicação omnichannel enviando andamentos e alertas diretamente no WhatsApp dos usuários.

### PROD-006 — P2: Product Analytics & Behavioral Telemetry (PostHog / Mixpanel)
**Prioridade:** MÉDIA | **Estimativa:** 3 semanas | **Complexidade:** Média
Implementar a telemetria de eventos comportamentais e mapeamento de funis de conversão para guiar a evolução do produto.

### PROD-007 — P3: Motor de Personalização & Gamificação de Perfis Profissionais
**Prioridade:** MÉDIA | **Estimativa:** 4 semanas | **Complexidade:** Média
Implantar o algoritmo de recomendação Smart Match 2.0 e o sistema de conquistas/badges para perfis de advogados.

---

## ETAPA 27 — ENTERPRISE PRODUCT EXPERIENCE, UX/CX & DESIGN SYSTEM BLUEPRINT

```
LEGIS CONNECT — ENTERPRISE DIGITAL LEGAL EXPERIENCE PLATFORM
Versão 1.0 | 27 Etapas Auditadas e Verificadas | Julho 2026

╔══════════════════════════════════════════════════════════════════╗
║             DESIGN SYSTEM & ACESSIBILIDADE UNIVERSAL             ║
║  Legis Design Tokens (HSL Hues · Core Components React/Tailwind) ║
║  Conformidade WCAG 2.2 AAA · Modo Escuro/Claro Suave             ║
║  UX Writing Guide (Linguagem Jurídica Simplificada & Transparente)║
╠══════════════════════════════════════════════════════════════════╣
║              WORKSPACES ADAPTATIVOS & OMNICHANNEL                ║
║  Client Legal Hub (Timeline Traduzida + Tradutor de Juridiquês) ║
║  Advocate Productivity Cockpit (Kanban + Alertas P1/P2 + Copilot)║
║  Smart Omnichannel Hub (Web App + WhatsApp Z-API + Push Mobile)  ║
╠══════════════════════════════════════════════════════════════════╣
║            PRODUCT ANALYTICS & CONTINUOUS DISCOVERY              ║
║  Product Analytics (PostHog/Mixpanel) · Behavioral Heatmaps      ║
║  North Star Metric & HEART Framework (Usabilidade & Retenção)    ║
║  Continuous Discovery Habit · Rollouts via Feature Flags         ║
╚══════════════════════════════════════════════════════════════════╝

MATURIDADE DE PRODUTO AS-IS: 1.5 / 5.0  →  TO-BE: 4.9 / 5.0
OBJETIVO FINAL: A PLATAFORMA JURÍDICA DIGITAL MAIS INTUITIVA, PRODUTIVA E CENTRADA NO USUÁRIO DO BRASIL.
```

---

*Enterprise Product Experience, UX/CX & Design System Blueprint v1.0*
*27 Etapas Auditadas, Verificadas e Documentadas*
*CPO · Principal Product Designer · UX Research Lead · Legis Connect · 2026*
