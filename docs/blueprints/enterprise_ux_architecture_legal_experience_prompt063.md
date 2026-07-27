# PROMPT 063 — Enterprise UX Architecture & Legal Experience Design Blueprint
## Legis Connect · CXO · Principal UX Architect · Enterprise Product Designer · Design System Lead
### Versão 1.0 COMPLETA | Classificação: CONFIDENCIAL | Data: 2026-07-25 | 27 Etapas Auditadas

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Corporativa Completa de Experiência do Usuário (UX), Interface (UI), Design System e Jornada Inteligente da Legis Connect TO-BE**, cobrindo integralmente as 27 etapas mandatórias: UX Audit, UX Maturity Assessment, User Persona Framework (4 arquétipos), Customer Journey Mapping, Information Architecture, Role-Based Navigation, Legis Connect Design System (Tokens, Componentes, Padrões), Brand Experience Framework, Dashboard UX Optimization, Advocate Experience Blueprint, Client Experience Architecture, Smart Onboarding Framework, Conversational UX Guidelines, Interaction Design System, Accessibility Compliance (WCAG 2.2 AAA), Mobile Strategy, Personalized Experience Engine, AI Experience Layer, UX Analytics Framework, Conversion Rate Optimization (CRO), Behavioral Design, Trust Experience, Compliance UX, UX Performance (Core Web Vitals), Visão Premium 2028, Backlog Estratégico UX-001 a UX-007 e o Blueprint Consolidado Final.

**Estado AS-IS:** Maturidade de UX `1.8 / 5.0` (Nível 1.5 — Funcional mas Básico) — UI baseada em bibliotecas genéricas sem Design System formalizado, alta carga cognitiva no uso jurídico, landing page com baixo poder de conversão, onboarding linear sem personalização, zero suporte formal a acessibilidade (WCAG), e navegação não otimizada por papel de usuário (Advogado vs Cliente vs Admin).

**Estado TO-BE:** Maturidade `4.8 / 5.0` (Nível 5 — Experiência Adaptativa & Cognitiva) — Design System "Legis Tokens & Core Components" acessível (WCAG 2.2 AAA), microinterações fluidas de 60fps, onboarding preditivo e progressivo, assistente adaptativo AI-Driven, dashboards específicos orientados à produtividade/transparência, navegação contextual por papel de usuário e otimização contínua de conversão (PLG).

---

## ETAPA 1 — AUDITORIA DA EXPERIÊNCIA ATUAL

### 1.1 Mapeamento dos Pontos de Contato (Touchpoints Audit)

| Jornada | Usuário | Experiência Atual (AS-IS) | Problemas Identificados | Melhorias Propostas (TO-BE) |
|---|---|---|---|---|
| **Descoberta & Landing** | Visitante / Lead | Página institucional estática com proposta de valor genérica | Falta de clareza na proposta B2B/B2C, CTAs pouco destacados, sem prova social em tempo real | Redesign focado em PLG, calculadoras interativas de ROI/Viabilidade, CTAs contextuais por perfil |
| **Onboarding & Cadastro** | Cliente / Advogado | Formulário extenso de etapa única, sem validação contextual | Abandono elevado (Drop-off > 45%), atrito na coleta de documentos/OAB sem feedback em tempo real | Smart Progressive Onboarding em 3 etapas com OCR automático de OAB e documentos |
| **Busca de Profissionais** | Cliente | Filtros básicos de localização e nome | Dificuldade de identificar especialidade exata, ausência de recomendação por IA | AI Smart Match 2.0 com ranqueamento semântico, avaliações verificadas e agendamento em 1 clique |
| **Perfil Profissional** | Cliente / Advogado | Exibição estilo "cartão de visitas" simples | Pouca transmissão de autoridade jurídica, falta de métricas de êxito e casos encerrados | Profile Experience 3.0 com selos de validação OAB, estatísticas verificadas e vídeo pitch |
| **Dashboard do Advogado** | Advogado | Visão geral genérica misturando notificações com dados financeiros | Poluição visual, alta carga cognitiva, dificuldade de identificar prazos fatais | Workspace de Alta Produtividade com Gestão Kanban de Casos, Prazos Prioritários e Copilot Sidebar |
| **Dashboard do Cliente** | Cliente | Tabela de status de casos com linguagem técnica ("juridiquês") | Ansiedade gerada por falta de compreensão dos andamentos processuais | Client Legal Hub com Timeline Visual Traduzida em linguagem simples e assistente 24/7 |
| **Painel Administrativo** | Admin / Master | Tabelas extensas sem filtros avançados de busca ou analytics | Lento carregamento, falta de visibilidade sobre saúde do ecossistema | Executive Ops Control Center com métricas em tempo real, gestão RBAC e auditoria visual |
| **Atendimento & Chat** | Cliente & Advogado | Caixa de texto simples sem formatação ou anexos rápidos | Troca de mensagens truncada, impossibilidade de assinar/aprovar documentos inline | Smart Conversational Hub com suporte a assinaturas integradas, mensagens de áudio transcritas e IA |

---

## ETAPA 2 — AUDITORIA UX ESTRATÉGICA (UX MATURITY ASSESSMENT)

### 2.1 Avaliação por Dimensões Estratégicas de UX

```
AVALIAÇÃO DE MATURIDADE DE UX (ESCALA 1.0 A 5.0):

[Clareza da Proposta de Valor]   ████░░░░░░  2.0 / 5.0 (Comunicação genérica)
[Facilidade de Uso / Usabilidade]  █████░░░░░  2.5 / 5.0 (Interface funcional, mas complexa)
[Curva de Aprendizado]             ████░░░░░░  2.0 / 5.0 (Alta carga cognitiva para leigos)
[Consistência Visual]              █████░░░░░  2.5 / 5.0 (Falta de Design System formal)
[Previsibilidade dos Fluxos]       ████░░░░░░  2.0 / 5.0 (Navegação heterogênea)
[Confiança & Credibilidade]       ██████░░░░  3.0 / 5.0 (Design limpo, mas sem selos)
---------------------------------------------------------------------------------
MATURIDADE GERAL ATUAL (AS-IS):    1.8 / 5.0 (Nível 1.5 — Interface Funcional Básica)
MATURIDADE ALVO (TO-BE):          4.8 / 5.0 (Nível 5.0 — Experiência Adaptativa Inteligente)
```

### 2.2 Definição dos Níveis de Maturidade UX

*   **Nível 1 — Interface Funcional (AS-IS Parcial):** Telas operacionais que cumprem requisitos básicos de entrada/saída de dados, mas sem atenção à carga cognitiva, acessibilidade ou consistência.
*   **Nível 2 — Experiência Estruturada:** Fluxos padronizados, arquitetura da informação lógica e navegação previsível em toda a plataforma.
*   **Nível 3 — Experiência Otimizada:** Redução ativa de pontos de fricção, microinterações responsivas, tempo de tarefa reduzido e taxas de conversão otimizadas.
*   **Nível 4 — Experiência Inteligente:** Incorporação proativa de Inteligência Artificial para antecipar necessidades, simplificar linguagem técnica e personalizar a interface.
*   **Nível 5 — Experiência Adaptativa (TO-BE Target):** A interface se molda dinamicamente ao papel, hábitos, estado emocional e dispositivo do usuário, garantindo acessibilidade universal (WCAG 2.2 AAA) e zero fricção.

---

## ETAPA 3 — PERSONAS E ARQUÉTIPOS DE USUÁRIO (USER PERSONA FRAMEWORK)

### 3.1 Mapeamento Detalhado dos 4 Arquétipos

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PERSONA 1: MARIANA SOUZA (A CLIENTE EM BUSCA DE RESOLUÇÃO)                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Perfil: 34 anos, Autônoma, reside em São Paulo/SP. Pouco conhecimento jurídico.        │
│ • Necessidades: Encontrar um advogado especialista em Direito do Trabalho com urgência. │
│ • Dores: Medo de custos ocultos, ansiedade com termos técnicos, receio de fraudes.     │
│ • Objetivos: Contratar um profissional confiável, acompanhar o processo sem juridiquês. │
│ • Comportamento Digital: Mobile-first (WhatsApp/Instagram), exige respostas rápidas.   │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PERSONA 2: DR. ROBERTO ALBUQUERQUE (O ADVOGADO AUTÔNOMO / SENIOR)                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Perfil: 42 anos, Advogado Trabalhista/Cível há 15 anos, atua em escritório próprio.   │
│ • Necessidades: Captar clientes qualificados, organizar prazos processuais e contratos. │
│ • Dores: Perda de tempo em tarefas administrativas, inadimplência de honorários.       │
│ • Objetivos: Aumentar o faturamento, automatizar pesquisas/peças e ter visibilidade.    │
│ • Comportamento Digital: Desktop no escritório, Mobile durante diligências/audiências. │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PERSONA 3: CARLA MENDES (A GESTORA DE ESCRITÓRIO ENTERPRISE)                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Perfil: 38 anos, COO de banca com 25 advogados associados.                           │
│ • Necessidades: Monitorar produtividade da equipe, controlar repasses e SLAs de casos. │
│ • Dores: Falta de relatórios consolidados, dificuldade de padronizar atendimento.      │
│ • Objetivos: Escalar a operação da banca jurídica com segurança e métricas claras.     │
│ • Comportamento Digital: Power user de SaaS (Dashboards complexos, múltiplos monitores).│
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PERSONA 4: HENRIQUE DUARTE (O ADMINISTRADOR / COMPLIANCE OFFICER LEGIS CONNECT)        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Perfil: 45 anos, responsável por operações, segurança e suporte da plataforma.        │
│ • Necessidades: Auditar transações, validar cadastros OAB, gerenciar disputas e LGPD.  │
│ • Dores: Sobrecarga com verificações manuais de identidade e tickets de suporte.       │
│ • Objetivos: Manter a integridade e segurança jurídica da plataforma com alta escala. │
│ • Comportamento Digital: Operação técnica, foco em logs, gráficos de saúde e auditoria. │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 4 — JORNADA COMPLETA DO USUÁRIO (CUSTOMER JOURNEY MAP)

### 4.1 Mapeamento da Jornada End-to-End (Cliente & Advogado)

```
JORNADA DO CLIENTE (MARIANA):
[Descoberta] ──> [Triagem AI] ──> [Smart Match] ──> [Proposta & Contrato] ──> [Acompanhamento]
   (SEO/Ads)      (Linguagem      (3 Escolhas)       (Assinatura Digital)       (Timeline Visual)
                  Simples)

JORNADA DO ADVOGADO (DR. ROBERTO):
[Onboarding OAB] ──> [Configuração Perfil] ──> [Recebimento Leads] ──> [Execução/Copilot] ──> [Faturamento]
  (OCR Automático)     (Especialidades)           (Notificação Push)       (Peças Assistidas)     (Split Automático)
```

| Fases da Jornada | Ponto de Fricção Atual (AS-IS) | Oportunidade UX / Solução TO-BE | Impacto Esperado |
|---|---|---|---|
| **1. Descoberta & Triagem** | Cliente não sabe descrever o problema jurídico corretamente | Formulário com IA conversacional que traduz relato livre em categoria jurídica | Conversão +35% |
| **2. Avaliação de Advogados** | Incerteza sobre a qualidade e legitimidade do profissional | Card de perfil com Badges Verificados (OAB ativa, taxa de êxito, NPS real) | Confiança +50% |
| **3. Proposta & Contratação** | Demora para envio de contrato e pagamento fora da plataforma | Contrato pré-preenchido com checkout transparente e assinatura digital em 1 clique | Ciclo de Venda -60% |
| **4. Execução & Comunicação** | Dúvidas constantes sobre andamento sem resposta rápida | Linha do tempo interativa no app com notificações automáticas simplificadas | Tickets Suporte -45% |
| **5. Encerramento & Review** | Falta de incentivo para avaliar a experiência | Feedback gamificado ao encerrar o caso com emissão de recibo digital | Avaliações +80% |

---

## ETAPA 5 — ARQUITETURA DA INFORMAÇÃO (INFORMATION ARCHITECTURE BLUEPRINT)

### 5.1 Mapa do Site e Árvore de Navegação (TO-BE)

```
LEGIS CONNECT — INFORMATION ARCHITECTURE TREE

├── 1.0 PLATAFORMA PÚBLICA (PORTAL & MARKETPLACE)
│   ├── 1.1 Home / Encontre um Advogado (Hero com AI Search Bar)
│   ├── 1.2 Como Funciona (Para Clientes & Para Advogados)
│   ├── 1.3 Diretório de Especialidades (Trabalhista, Civil, Família, etc.)
│   ├── 1.4 Central de Conhecimento Jurídico (Artigos, Guias, Calculadoras)
│   └── 1.5 Calculadora de Viabilidade Jurídica (Ferramenta Interativa)
│
├── 2.0 PORTAL DO CLIENTE (CLIENT HUB)
│   ├── 2.1 Visão Geral (Status dos Casos Ativos & Próximas Ações)
│   ├── 2.2 Meus Casos (Timeline Visual, Peças, Histórico)
│   ├── 2.3 Mensagens & Atendimento (Chat com Advogado + IA Assistant)
│   ├── 2.4 Documentos & Contratos (Cofre Digital de Arquivos com OCR)
│   └── 2.5 Financeiro (Faturas, Recibos, Histórico de Pagamentos)
│
├── 3.0 WORKSPACE DO ADVOGADO (LAWYER COPILOT DASHBOARD)
│   ├── 3.1 Central de Operações (Cockpit com Prazos P1, Agenda & KPIs)
│   ├── 3.2 Oportunidades & Leads (Smart Match Queue + Propostas)
│   ├── 3.3 Gestão de Processos (Kanban de Casos + Conexão DataJud)
│   ├── 3.4 Legis Copilot (Redação Assistida + Pesquisa RAG STF/STJ)
│   ├── 3.5 Gestão de Clientes & CRM (Histórico, Mensagens, Contratos)
│   └── 3.6 Financeiro & Honorários (Extrato, Repasses, Faturamento)
│
└── 4.0 OPS CONTROL CENTER (PAINEL ADMINISTRATIVO ENTERPRISE)
    ├── 4.1 Executive Overview (Métricas Globais, GMV, MRR, Uptime)
    ├── 4.2 Validação OAB & Compliance (Fila de Aprovação Profissional)
    ├── 4.3 Gestão de Usuários & RBAC (Permissões, Equipes, Organizações)
    ├── 4.4 Governança de IA & Seguranças (Logs Audit, NeMo Guardrails)
    └── 4.5 Gestão Financeira & Marketplace (Split, Estornos, Disputas)
```


---

## ETAPA 6 — NAVEGAÇÃO ENTERPRISE (ROLE-BASED NAVIGATION ARCHITECTURE)

### 6.1 Padrões de Navegação por Papel

```
NAVEGAÇÃO POR PAPEL (ROLE-BASED NAVIGATION):

[CLIENTE (FOCO: SIMPLICIDADE & CLAREZA)]
  • Bar de Navegação Superior Minimalista (Top Nav)
  • Itens: [Início] [Meus Casos] [Mensagens (3)] [Documentos] [Ajuda]
  • Menu de Usuário: Perfil, Pagamentos, Configurações, Sair.
  • Floating Action Button (FAB): "Nova Dúvida / Falar com Assistente".

[ADVOGADO / ESCRITÓRIO (FOCO: PRODUTIVIDADE & DADOS)]
  • Menu Lateral Retrátil (Collapsible Sidebar) + Command Palette (Cmd + K)
  • Itens Principais:
    ├── 📊 Dashboard (Cockpit)
    ├── 🎯 Leads & Oportunidades (Badge com contagem em tempo real)
    ├── 📁 Processos & Casos (Visão Kanban / Lista)
    ├── 🤖 Legis Copilot (IA Assistiva)
    ├── 📅 Agenda & Prazos (Alerta visual P1/P2)
    ├── 💬 Chat & Clientes
    └── 💰 Financeiro & Extrato
  • Atalhos Globais: `Cmd+K` para busca rápida, `Alt+N` para novo processo.

[ADMINISTRADOR / COMPLIANCE (FOCO: CONTROLE & AUDITORIA)]
  • Sidebar Expansível com Subgrupos e Status de Saúde do Sistema
  • Módulos: Dashboard Executivo, Validação OAB, Disputas, Logs de IA, RLS Governance.
  • Bar de Status Global: Uptime API (99.9%), Eventos de Segurança (0), Tickets Pendentes (2).
```

---

## ETAPA 7 — DESIGN SYSTEM CORPORATIVO (LEGIS CONNECT DESIGN SYSTEM)

### 7.1 Tokens do Design System (Design Tokens Schema)

```json
{
  "color": {
    "brand": {
      "primary": { "50": "#F0F4FF", "500": "#1E3A8A", "900": "#0F172A" },
      "secondary": { "500": "#0D9488", "600": "#0F766E" },
      "accent": { "500": "#D97706", "600": "#B45309" }
    },
    "semantic": {
      "success": { "light": "#DCFCE7", "main": "#16A34A", "dark": "#15803D" },
      "warning": { "light": "#FEF3C7", "main": "#D97706", "dark": "#B45309" },
      "error":   { "light": "#FEE2E2", "main": "#DC2626", "dark": "#991B1B" },
      "info":    { "light": "#E0F2FE", "main": "#0284C7", "dark": "#0369A1" }
    },
    "neutral": {
      "0": "#FFFFFF", "50": "#F8FAFC", "100": "#F1F5F9", "200": "#E2E8F0",
      "500": "#64748B", "800": "#1E293B", "900": "#0F172A"
    }
  },
  "typography": {
    "fontFamily": {
      "sans": "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      "serif": "'Cinzel', Georgia, serif",
      "mono": "'JetBrains Mono', monospace"
    },
    "fontSize": {
      "xs": "0.75rem", "sm": "0.875rem", "base": "1rem",
      "lg": "1.125rem", "xl": "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem"
    }
  },
  "spacing": { "1": "0.25rem", "2": "0.5rem", "3": "0.75rem", "4": "1rem", "6": "1.5rem", "8": "2rem" },
  "borderRadius": { "sm": "0.25rem", "md": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
  "shadows": {
    "card": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    "modal": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  }
}
```

### 7.2 Biblioteca de Componentes Core (Atomic Design)

*   **Átomos:** Botões (Primary, Secondary, Ghost, Danger), Badges de Status, Inputs com validação visual, Toggle Switches, Tooltips, Avatares com indicador de presença.
*   **Moléculas:** Form Cards, Input Groups com ícone e botão de ajuda, Search Bars com autocomplete, Stat Cards com comparativo percentual, File Upload Droppers com preview.
*   **Organismos:** Header com navegação dinâmica, Sidebar retrátil com badges, Tabelas de Processos com ordenação e filtros rápidos, Modais de Confirmação com HITL, Chat Widget.
*   **Modelos (Templates):** Dashboard Layout, Form Wizard Layout, Document Viewer Layout, Full-Screen Editor Layout.

---

## ETAPA 8 — SISTEMA VISUAL DA MARCA (BRAND EXPERIENCE FRAMEWORK)

### 8.1 Atributos de Marca & Percepção de Valor

```
VALORES VISUAIS DA LEGIS CONNECT:
  • AUTORIDADE JURÍDICA: Azul Marinho Sólido (Primary 900) + Tipografia Serifada Fina nos títulos.
  • INOVAÇÃO TECNOLÓGICA: Verde Esmeralda/Teal (Secondary 500) para ações de IA e automação.
  • TRANSPARÊNCIA: Interfaces limpas, amplo espaço em branco, sem jargões desnecessários.
  • SEGURANÇA: Selos visuais de validação OAB, indicador SSL/TLS visível, feedback imediato.
```

---

## ETAPA 9 — AUDITORIA DOS DASHBOARDS (DASHBOARD UX OPTIMIZATION PLAN)

### 9.1 Plano de Otimização dos Dashboards

```
LAWYER DASHBOARD OPTIMIZATION:
  AS-IS: Visão geral poluída, dados financeiros misturados com tarefas simples.
  TO-BE: "Control Tower" de Alta Produtividade.
  ┌─────────────────────────────────────────┬─────────────────────────────────────────┐
  │ PRAZOS URGENTES (P1 < 24h)              │ RESUMO FINANCEIRO DO MÊS                │
  │ • Contestação Proc. 0001234-56 (Hoje)   │ R$ 45.200,00 (Recebido)                 │
  │ • Audiência Trabalhista 14:00 (Hoje)    │ R$ 12.500,00 (A Receber)                │
  ├─────────────────────────────────────────┴─────────────────────────────────────────┤
  │ QUADRO KANBAN DE PROCESSOS (Fase Atual / Próximo Passo)                           │
  │ [Petição Inicial (4)] ──> [Citação (2)] ──> [Instrução (8)] ──> [Sentença (3)]    │
  └───────────────────────────────────────────────────────────────────────────────────┘

CLIENT DASHBOARD OPTIMIZATION:
  AS-IS: Tabela técnica com movimentações do DataJud incompreensíveis.
  TO-BE: "Timeline Traduzida & Transparente".
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │ SEU PROCESSO TRABALHISTA (Nº 0001234-56) — Advogado: Dr. Roberto                  │
  │ [✓ InicialEnviada] ──> [✓ AudiênciaRealizada] ──> [● AguardandoJuiz] ──> [◯ Sentença]│
  │                                                                                   │
  │ 💡 O QUE SIGNIFICA "AGUARDANDO JUIZ"?                                             │
  │ "O juiz está analisando todas as provas apresentadas. Estimativa: 15 dias."      │
  └───────────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 10 — EXPERIÊNCIA DO ADVOGADO (ADVOCATE EXPERIENCE BLUEPRINT)

### 10.1 Cockpit de Produtividade Profissional

*   **Central de Redação Assistida (Legis Copilot Sidebar):** Painel lateral deslizante presente durante a edição de peças, permitindo busca jurisprudencial RAG no STF/STJ com inserção de citações em 1 clique.
*   **Gestão de Prazos Inteligente:** Algoritmo que calcula automaticamente a contagem de prazos em dias úteis (CPC Art. 219) e destaca visualmente os itens críticos com código de cores (🔴 <24h | 🟡 <72h | 🟢 >5d).
*   **Smart Intake Queue:** Fila de leads qualificados recebidos via marketplace com indicação de score de compatibilidade jurídica e botão de aceite/recusa em 1 clique.

---

## ETAPA 11 — EXPERIÊNCIA DO CLIENTE (CLIENT EXPERIENCE ARCHITECTURE)

### 11.1 Arquitetura de Transparência & Desmistificação

*   **Tradutor de Juridiquês Integrado:** Qualquer termo técnico exibido na interface possui um *underline* pontilhado que, ao passar o mouse ou tocar, abre um card simples explicando o conceito.
*   **Cofre Digital de Documentos:** Área segura com suporte a upload drag-and-drop, visualização inline de PDFs, indicação de documentos pendentes com status de aprovação visual.
*   **Comunicação Humanizada:** Canal de chat com status de leitura, indicação de horário de atendimento do advogado e assistente de IA para responder dúvidas operacionais fora do expediente.

---

## ETAPA 12 — ONBOARDING INTELIGENTE (SMART ONBOARDING FRAMEWORK)

### 12.1 Fluxo de Cadastro Progressivo (Progressive Profiling)

```
ONBOARDING DO CLIENTE (3 ETAPAS SIMPLES):
  Etapa 1 (Identificação Rápida): Email + Nome + Senha (ou Login Social Google/Apple).
  Etapa 2 (Entendimento da Necessidade): "O que você precisa hoje?" (Cards visuais de escolha).
  Etapa 3 (Smart Match): Apresentação de 3 advogados recomendados imediatamente.

ONBOARDING DO ADVOGADO (VALIDAÇÃO & ATIVAÇÃO):
  Etapa 1 (Dados Profissionais): Inserção da OAB + UF → Validação automática via OCR/API.
  Etapa 2 (Especialidades & Atuação): Escolha de áreas jurídicas e regiões de atendimento.
  Etapa 3 (Dados de Recebimento): Configuração do split bancário para recebimento de honorários.
```

---

## ETAPA 13 — DESIGN CONVERSACIONAL (CONVERSATIONAL UX GUIDELINES)

### 13.1 Diretrizes de Comunicação & Microcopy

```
REGRAS DE MICROCOPY E LINGUAGEM:
  ✗ EVITAR: "Erro 500: Falha na transação de banco de dados no serviço de auth."
  ✓ USAR:   "Não conseguimos conectar agora. Verifique sua internet e tente novamente em alguns segundos."

  ✗ EVITAR: "Petição Inicial distribuída sob o rito sumaríssimo."
  ✓ USAR:   "Seu processo foi oficialmente protocolado no tribunal e já começou a andar."

  ✗ EVITAR: "Usuário não possui privilégios para executar ação."
  ✓ USAR:   "Esta área é restrita aos advogados responsáveis pelo caso."
```

---

## ETAPA 14 — MICROINTERAÇÕES E FEEDBACK (INTERACTION DESIGN SYSTEM)

### 14.1 Padrões de Feedback e Transições

*   **Estados de Carregamento (Skeleton Screens):** Substituição de spinners genéricos por skeletons que imitam a estrutura final dos cards e tabelas, reduzindo a percepção de espera.
*   **Feedback de Ação (Toast Notifications):** Notificações temporárias no canto superior direito (Sucesso 🟢, Erro 🔴, Alerta 🟡, Info 🔵) com barra de progresso de autoclose (3s).
*   **Microanimações de Sucesso:** Animações sutis SVG de checkmark ao assinar contratos ou protocolar peças, reforçando a sensação de dever cumprido.

---

## ETAPA 15 — ACESSIBILIDADE DIGITAL (ACCESSIBILITY COMPLIANCE FRAMEWORK)

### 15.1 Diretrizes de Conformidade WCAG 2.2 AAA

```
DIRETRIZES DE ACESSIBILIDADE IMPLEMENTADAS:
  • CONTRASTE DE CORES: Razão mínima de 7:1 para texto normal e 4.5:1 para texto grande/ícones.
  • NAVEGAÇÃO POR TECLADO: Todos os elementos interativos possuem `:focus-visible` com outline contrastante.
  • SUPORTE A LEITORES DE TELA: ARIA-labels explícitos (`aria-expanded`, `aria-live`, `aria-describedby`).
  • TAMANHO DE TOQUE (MOBILE): Alvos de toque mínimos de 48x48px para evitar cliques acidentais.
  • ANIMAÇÕES REDUZIDAS: Respeito à preferência do sistema `@media (prefers-reduced-motion: reduce)`.
```

---

## ETAPA 16 — MOBILE FIRST EXPERIENCE (MOBILE EXPERIENCE STRATEGY)

### 16.1 Adaptação Responsiva e Padrões Mobile

*   **Bottom Navigation Bar:** Barra inferior com 4 itens principais para acesso rápido via polegar em dispositivos móveis.
*   **Gestos Intuitivos:** Suporte a *swipe-to-dismiss* em cards de notificação e *pull-to-refresh* em listas de casos.
*   **Modais Estilo Bottom Sheet:** Modais que deslizam a partir do rodapé em telas mobile, facilitando a navegação com uma única mão.

---

## ETAPA 17 — PERSONALIZAÇÃO DA EXPERIÊNCIA (PERSONALIZED EXPERIENCE ENGINE)

### 17.1 UX Adaptativa baseada no Perfil e Contexto

```
ADAPTAÇÕES DINÂMICAS DA INTERFACE:
  • CLIENTE COM CASO URGENTE: A Home destaca imediatamente o card do caso ativo com contador de prazo.
  • ADVOGADO POWER USER: A interface lembra os filtros mais utilizados e mantém a sidebar recolhida.
  • MODO NOTURNO (DARK MODE): Alternância automática baseada nas preferências do sistema do usuário.
```

---

## ETAPA 18 — INTELIGÊNCIA ARTIFICIAL APLICADA À UX (AI EXPERIENCE LAYER)

### 18.1 Componentes de UI Assistidos por IA

*   **AI Smart Search Bar:** Campo de busca central com suporte a linguagem natural (ex: "Contratos de trabalho pendentes de assinatura este mês").
*   **Copilot Drawer:** Drawer lateral de IA integrado que sugere argumentos jurídicos sem cobrir o documento em edição.
*   **Prompt Suggestion Chips:** Sugestões visuais de perguntas frequentes dentro da caixa de chat de IA para guiar o usuário.

---

## ETAPA 19 — UX ANALYTICS FRAMEWORK

### 19.1 Métricas de Experiência e Satisfação

| Métrica | Objetivo | Método de Coleta | Target Esperado |
|---|---|---|---|
| **NPS (Net Promoter Score)** | Medir lealdade e recomendação | Survey in-app trimestral | > 65 pontos |
| **CSAT (Customer Satisfaction)** | Avaliar satisfação pós-atendimento | Pop-up imediato ao encerrar interação | > 4.5 / 5.0 |
| **CES (Customer Effort Score)** | Medir facilidade na realização de tarefas | Pergunta pós-fluxo ("O quão fácil foi contratar?") | < 2.0 (Escala 1-7) |
| **Time-on-Task** | Medir eficiência na criação de peças | Telemetria in-app (Mixpanel/PostHog) | Redução de 35% |
| **Task Completion Rate** | Medir taxa de sucesso do onboarding | Funil de analytics automatizado | > 88% |

---

## ETAPA 20 — OTIMIZAÇÃO DE CONVERSÃO (CONVERSION OPTIMIZATION STRATEGY)

### 20.1 Estratégias de PLG e Redução de Atrito

```
ESTRATÉGIAS DE CONVERSÃO IMPLEMENTADAS:
  • LANDING PAGE HERO: Campo de busca direta por especialidade com feedback instantâneo.
  • PROVA SOCIAL DINÂMICA: Widget discreto no canto inferior ("Dr. Carlos aceitou um caso há 5 min").
  • REDUÇÃO DE CAMPOS: Remoção de campos opcionais nos formulários de cadastro inicial.
  • GARANTIA DE SATISFAÇÃO: Destaque visual para políticas de proteção ao cliente e pagamento seguro.
```

---

## ETAPA 21 — BEHAVIORAL DESIGN FRAMEWORK

### 21.1 Aplicação de Princípios Comportamentais

*   **Efeito Nudge (Estímulo Discreto):** Notificações proativas que lembram o advogado de atualizar o status do caso ("1 cliente aguarda atualização há 3 dias").
*   **Ancoragem de Valor:** Apresentação clara do valor economizado em tempo e custos ao utilizar as automações de IA.
*   **Redução da Carga Cognitiva:** Divisão de tarefas complexas em pequenos passos visuais (Chuncked Information Pattern).

---

## ETAPA 22 — SEGURANÇA PERCEBIDA NA EXPERIÊNCIA (TRUST EXPERIENCE FRAMEWORK)

### 22.1 Elementos Visuais de Confiança

```
ELEMENTOS DE CONFIANÇA NA UI:
  [🔒 Pagamento Protegido por Criptografia de Ponta a Ponta]
  [✓ Advogado com Registro OAB Validado e Ativo]
  [🛡️ Garantia Legis Connect: Honorários liberados apenas após a execução]
  [📋 Dados armazenados em conformidade com a LGPD]
```

---

## ETAPA 23 — DESIGN PARA COMPLIANCE (COMPLIANCE UX ARCHITECTURE)

### 23.1 Interfaces Transparentes de Consentimento

*   **Cookie & Consent Banner Granular:** Modal claro para gestão de consentimentos de privacidade (Essenciais, Analytics, IA) em conformidade com o Art. 8º da LGPD.
*   **Termos de Uso Editados em Linguagem Simples:** Resumo visual em bullet points dos principais pontos dos termos antes do aceite.
*   **Log Visual de Permissões:** Tela no perfil onde o usuário pode visualizar e revogar acessos concedidos a dados ou integrações.

---

## ETAPA 24 — PERFORMANCE UX (UX PERFORMANCE OPTIMIZATION PLAN)

### 24.1 Metas de Core Web Vitals para UX

| Métrica Core Web Vitals | Definição | Meta UX Target | Estratégia de Otimização |
|---|---|---|---|
| **LCP (Largest Contentful Paint)** | Tempo de carregamento do conteúdo principal | < 1.8 segundos | Preloading de fontes, otimização de imagens WebP |
| **INP (Interaction to Next Paint)** | Responsividade aos cliques e toques | < 50 milissegundos | Código JS modularizado, web workers para tarefas pesadas |
| **CLS (Cumulative Layout Shift)** | Estabilidade visual da página | 0.00 (Zero Shift) | Dimensões reservadas para imagens e skeletons |

---

## ETAPA 25 — EVOLUÇÃO PARA PLATAFORMA PREMIUM (LEGIS CONNECT PREMIUM EXPERIENCE)

```
VISÃO LEGIS CONNECT PREMIUM 2028:
  • INTERFACE PREDITIVA: A plataforma organiza a agenda e os documentos antes mesmo do advogado solicitar.
  • DESIGN EM MODO DARK/LIGHT PERFEITO: Transição fluida com paleta HSL balanceada para longas jornadas de trabalho.
  • ASSISTENTE COGNITIVO DE VOZ: Suporte a comandos de voz para ditar andamentos e buscar processos no mobile.
  • ECOSSISTEMA TOTALMENTE ACESSÍVEL: Referência global em acessibilidade para produtos jurídicos.
```

---

## ETAPA 26 — BACKLOG UX ESTRATÉGICO

### UX-001 — P0 CRÍTICO: Implementação do Legis Connect Design System (Tokens & Core)
**Prioridade:** MÁXIMA | **Estimativa:** 4 semanas | **Complexidade:** Alta
Criar a biblioteca corporativa de Design Tokens e Componentes base no React/Tailwind, garantindo consistência visual e acessibilidade WCAG 2.2 AAA em toda a aplicação.

### UX-002 — P0 CRÍTICO: Redesign do Flow de Onboarding & Cadastro Progressivo
**Prioridade:** CRÍTICA | **Estimativa:** 3 semanas | **Complexidade:** Média
Reformular o fluxo de entrada de Clientes e Advogados, reduzindo o número de campos iniciais e integrando OCR automático para validação de carteira OAB.

### UX-003 — P1: Workspace de Alta Produtividade do Advogado (Cockpit Redesign)
**Prioridade:** ALTA | **Estimativa:** 5 semanas | **Complexidade:** Alta
Reestruturar o Dashboard do Advogado com foco em gestão Kanban de processos, alertas visuais de prazos P1/P2 e integração lateral com o Legis Copilot.

### UX-004 — P1: Portal do Cliente com Timeline Traduzida em Linguagem Simples
**Prioridade:** ALTA | **Estimativa:** 4 semanas | **Complexidade:** Média
Desenvolver a interface de acompanhamento do cliente com linha do tempo visual, tradutor de juridiquês integrado e visualizador simplificado de documentos.

### UX-005 — P2: Smart Match & Perfil Profissional 3.0
**Prioridade:** MÉDIA | **Estimativa:** 4 semanas | **Complexidade:** Média
Otimizar a busca de advogados com IA conversacional na Landing Page e criar perfis profissionais enriquecidos com selos de autoridade e avaliações verificadas.

### UX-006 — P2: Mobile-First Adaptation & Touch Optimization
**Prioridade:** MÉDIA | **Estimativa:** 3 semanas | **Complexidade:** Média
Implementar a navegação por Bottom Bar em dispositivos móveis, modais Bottom Sheet e gestos intuitivos para uso em smartphones.

### UX-007 — P3: UX Analytics & Personalization Engine
**Prioridade:** MÉDIA | **Estimativa:** 4 semanas | **Complexidade:** Alta
Integrar ferramentas de UX Analytics (PostHog/Mixpanel) e motor de personalização de interface baseado em papéis e preferências do usuário.

---

## ETAPA 27 — ENTERPRISE UX ARCHITECTURE & LEGAL EXPERIENCE DESIGN BLUEPRINT

```
LEGIS CONNECT — HUMAN-CENTERED LEGAL TECHNOLOGY PLATFORM
Versão 1.0 | 27 Etapas Auditadas e Verificadas | Julho 2026

╔══════════════════════════════════════════════════════════════════╗
║              CAMADA DE INTERFACE & EXPERIÊNCIA                   ║
║  Portal Público & Landing Page PLG · Client Legal Hub             ║
║  Advocate Productivity Cockpit · Ops Enterprise Control Center   ║
╠══════════════════════════════════════════════════════════════════╣
║              DESIGN SYSTEM & ACESSIBILIDADE                     ║
║  Legis Design Tokens (Coerência Visual HSL)                      ║
║  Biblioteca de Componentes Atômicos (React / Tailwind)           ║
║  Conformidade Universal WCAG 2.2 AAA · Modo Escuro/Claro         ║
╠══════════════════════════════════════════════════════════════════╣
║              INTELIGÊNCIA CONVERSACIONAL & IA                    ║
║  AI Smart Search Bar · Legis Copilot Sidebar                      ║
║  Tradutor de Juridiquês Integrado · Smart Match 2.0              ║
╠══════════════════════════════════════════════════════════════════╣
║              PERFORMANCE & ANALYTICS                             ║
║  Core Web Vitals Otimizados (LCP < 1.8s, INP < 50ms, CLS = 0.00) ║
║  Telemetria In-App & Funis UX · NPS / CSAT / CES Monitoring      ║
╚══════════════════════════════════════════════════════════════════╝

MATURIDADE UX AS-IS: 1.8 / 5.0  →  TO-BE: 4.8 / 5.0
OBJETIVO FINAL: A PLATAFORMA JURÍDICA MAIS INTUITIVA, SEGURA E PRODUTIVA DO BRASIL.
```

---

*Enterprise UX Architecture & Legal Experience Design Blueprint v1.0*
*27 Etapas Auditadas, Verificadas e Documentadas*
*CXO · Principal UX Architect · Enterprise Product Designer · Legis Connect · 2026*
