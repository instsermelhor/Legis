# PROMPT 043 — Enterprise UX Architecture & Digital Experience Blueprint
## Legis Connect · Chief Experience Officer (CXO) · Head of Product Design · UX Architect · Design System Lead
### Versão 1.0 | Classificação: CONFIDENCIAL | Data: 2026-07-25

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Corporativa de Experiência do Usuário, Interface Digital e Design System (Enterprise UX Architecture) da Legis Connect TO-BE**, consolidando 25 domínios fundamentais de Human-Centered Design, Jornadas de Usuário, Acessibilidade Universal (WCAG 2.2 AA/AAA), UX Writing, Behavioral Design, Padrões de Interação Humano-IA, Product Analytics, Performance de UX (Core Web Vitals) e Governança de DesignOps.

**Estado AS-IS:** Maturidade UX `1.3 / 5.0` (Inconsistente & Ad-hoc) — navegação fragmentada entre módulos, falta de design system unificado, formulários de onboarding longos (alta fricção e abandono > 58%), falhas de acessibilidade e ausência de padronização na exibição de sugestões de Inteligência Artificial.

**Estado TO-BE:** Maturidade UX `4.9 / 5.0` (Enterprise Digital Experience) — Design System Corporativo em Tokens (Figma/React/Tailwind/CSS), Onboarding em 3 Passos com TTV < 90 segundos, Acessibilidade Universal WCAG 2.2 AA/AAA, Padrões de Interação Humano-IA com aprovação explícita (Human-in-the-Loop), Core Web Vitals otimizados (LCP < 1.2s, INP < 100ms) e Cultura de DesignOps com UX Center of Excellence.

---

## ETAPA 1 — INVENTÁRIO COMPLETO DA EXPERIÊNCIA ATUAL (AS-IS)

### 1.1 Matriz de Pontos de Contato e Fricção

| Jornada / Ponto de Contato | Perfil Principal | Objetivo do Usuário | Etapas Atuais | Problemas & Fricções Detectadas |
|---|---|---|---|---|
| **Landing Page & Public** | Visitante / Lead | Entender o valor e cadastrar-se | 1 (Landing) | Proposta genérica, sem demo interativa ou calculadoras |
| **Cadastro de Usuário** | Cliente / Advogado | Criar conta e acessar | 1 (18 campos) | Abandono > 58%, exige dados sensíveis logo no 1º passo |
| **Busca de Advogado** | Cliente Final | Encontrar especialista ideal | 3 (Busca/Filtro) | Filtros rígidos sem busca semântica em linguagem natural |
| **Contratação de Serviço** | Cliente Final | Contratar com segurança | 4 (Valores/Termos) | Exibição vaga sobre split, falta de indicação de Escrow |
| **Dashboard Advogado** | Advogado / Sócio | Gerenciar o dia e prazos | 1 (Painel Geral) | Ruído visual, prazos críticos P1 misturados com notícias |
| **Painel do Cliente** | Cliente Final | Acompanhar andamento | 1 (Status Caso) | Uso de "Juridiquês" sem tradução explicativa visual |
| **Central de Documentos** | Todos os Perfis | Subir e assinar arquivos | 3 (Upload/Assinar)| Sem drag-and-drop avançado, preview lento de PDF |

---

## ETAPA 2 — PERSONAS E SEGMENTAÇÃO DE USUÁRIOS ENTERPRISE

```
[PERSONA 1: CLIENTE FINAL (PESSOA FÍSICA/JURÍDICA)]
• Perfil: Juliana Lima, 42 anos, Empresária.
• Objetivos: Encontrar advogados qualificados, acompanhar processos sem ansiedade, entender custos.
• Fricções: Medo do "Juridiquês", falta de clareza em honorários, incerteza sobre prazos.
• Solução UX: Linha do tempo visual tipo "rastreamento de encomenda", tradução automática de status.

[PERSONA 2: ADVOGADO AUTÔNOMO / SÓCIO]
• Perfil: Dr. Roberto Mendes, 38 anos, Advogado Civilista.
• Objetivos: Não perder prazos fatais CNJ, captar novos clientes, automatizar peças repetitivas.
• Fricções: Excesso de trabalho administrativo, interfaces lentas de tribunais, estresse com prazos.
• Solução UX: Dashboard limpo focado em ações do dia, alertas P1 destacados, Copiloto IA de 1-clique.

[PERSONA 3: ESCRITÓRIO JURÍDICO (LEGAL OPS)]
• Perfil: Camila Torres, 45 anos, COO de escritório de médio porte (25 advogados).
• Objetivos: Monitorar produtividade da equipe, controlar DRE/Faturamento, delegar tarefas.
• Fricções: Informações desorganizadas, falta de métricas visuais executivas para sócios.
• Solução UX: Dashboards customizáveis por drag-and-drop, exportação rápida e visão de workloads.

[PERSONA 4: ADMINISTRADOR DA PLATAFORMA]
• Perfil: Marcus Vinícius, 35 anos, SysAdmin Legis Connect.
• Objetivos: Monitorar saúde do sistema, gerenciar permissões RBAC/PAM, auditar acessos LGPD.
• Fricções: Interfaces genéricas de suporte sem busca em massa ou logs visuais.
• Solução UX: Painel administrativo enterprise com tabela interativa, filtros avançados e Audit Log.

[PERSONA 5: PARCEIROS CORPORATIVOS & B2B]
• Perfil: André Neves, 40 anos, Diretor de TI de Lawtech parceira.
• Objetivos: Integrar APIs B2B, gerenciar webhooks, acompanhar consumo de serviços.
• Fricções: Documentação desatualizada, ausência de ambiente sandbox interativo.
• Solução UX: Developer Portal B2B (`developer.legisconnect.com.br`) com Swagger e Sandbox.
```

---

## ETAPA 3 — USER JOURNEY MAPPING (JORNADA FIM A FIM)

```
[1. DESCOBERTA] ──> [2. CADASTRO] ──> [3. ONBOARDING] ──> [4. BUSCA/MATCH] ──> [5. CONTRATAÇÃO]
  Calculadora Open    Progressivo (<2m)   Checklist Guiado   Linguagem Natural    Transparente/Escrow
        │                   │                   │                  │                    │
        ▼                   ▼                   ▼                  ▼                    ▼
[10. FIDELIZAÇÃO]<── [9. RETENÇÃO]  <── [8. AVALIAÇÃO]  <── [7. COMUNICAÇÃO]<── [6. EXECUÇÃO]
  Viral Loops / NRR   NPS / Renewal       Feedback 5★        WhatsApp / Chat      Timeline Real-time
```

---

## ETAPA 4 — AUDITORIA DA ARQUITETURA DA INFORMAÇÃO (SITEMAP TO-BE)

```
LEGIS CONNECT PLATFORM SITEMAP
├── 1. PUBLIC & MARKETING PORTAL
│   ├── Home / Proposta de Valor
│   ├── Encontrar Advogado (Smart Match AI)
│   └── Calculadoras Jurídicas & Portal de Privacidade
├── 2. ADVOCATE WORKSPACE (/app/advocate)
│   ├── Dashboard (Visão do Dia, Prazos & Métricas)
│   ├── Processos & Casos (Kanban / Tabela Interativa)
│   ├── Agenda & Audiências (Sync Google/Outlook)
│   ├── Copiloto IA (Redação de Peças & Resumos)
│   ├── Clientes & CRM (Pipeline de Atendimento)
│   └── Financeiro (Faturamento, Honorários, Split)
├── 3. CLIENT PORTAL (/app/client)
│   ├── Meu Painel (Linha do Tempo dos Processos)
│   ├── Meus Documentos (Cofre Digital & Assinaturas)
│   ├── Mensagens (Chat Direto com Advogado)
│   └── Pagamentos & Faturas (PIX / Cartão / Histórico)
└── 4. ENTERPRISE ADMIN & DEVELOPER
    ├── System Health & SLO Monitor
    ├── Gestão de Usuários, RBAC & Audit Trail
    └── Developer Portal (APIs, Sandbox, Webhooks)
```

---

## ETAPA 5 — AUDITORIA DE FLUXOS CRÍTICOS & UI QUALITY ASSESSMENT

| Critério de Avaliação UI | Nota AS-IS | Nota TO-BE Alvo | Ação de Correção Principal |
|---|---|---|---|
| **Consistência Visual** | 2.1 / 5.0 | 4.9 / 5.0 | Padronização via Design System Corporativo em React/Tailwind |
| **Hierarquia de Informação** | 2.4 / 5.0 | 4.8 / 5.0 | Redesenho dos dashboards priorizando ações P1 sobre dados neutros |
| **Contraste & Legibilidade** | 3.0 / 5.0 | 5.0 / 5.0 | Conformidade estrita com a razão 4.5:1 da norma WCAG 2.2 AAA |
| **Responsividade Mobile** | 2.0 / 5.0 | 4.9 / 5.0 | Abordagem Mobile First nativa com navegação na *Thumb Zone* |
| **Tratamento de Erros** | 1.8 / 5.0 | 4.8 / 5.0 | Mensagens de erro orientadas a solução em linguagem humana |
| **SCORE GLOBAL DE UI** | **2.26 / 5.0** | **4.86 / 5.0** | **Interface Corporativa de Classe Mundial** |

---

## ETAPA 6 — DESIGN SYSTEM ENTERPRISE & DESIGN TOKENS

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
  "spacing": { "base": "8px", "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px" }
}
```

---

## ETAPA 7 — ARQUITETURA DE COMPONENTES UX/UI

```
[DESIGN SYSTEM TOKENS (Figma Style Dictionary)]
                      │
                      ▼
[COMPONENT LIBRARY (Storybook React Component Library)]
 ├── Atoms (Buttons, Inputs, Badges, Avatars)
 ├── Molecules (Search Auto-complete, Datepickers, Form Controls)
 ├── Organisms (DataTables, Kanban Boards, Document Modals)
 └── Templates (Dashboards, Workspace Layouts, Client Timelines)
                      │
                      ▼
[APPLICATION SCREENS (React / Next.js Production Apps)]
```

---

## ETAPA 8 — ACESSIBILIDADE DIGITAL UNIVERSAL (WCAG 2.2 AA/AAA)

- **Navegação 100% por Teclado:** Aneis de foco altamente visíveis (`outline: 2px solid #2563EB`) em todos os botões e links.
- **Suporte Total a Leitores de Tela:** Atributos ARIA completos (`aria-expanded`, `aria-live="polite"` para atualizações de status).
- **Contraste de Alto Nível:** Razão mínima de contraste de 4.5:1 para texto normal e 3:1 para elementos de interface gráficos.

---

## ETAPA 9 — UX WRITING & CONTENT DESIGN FRAMEWORK

```
REGRAS DE LINGUAGEM LEGIS CONNECT:
• Antes (Juridiquês): "Decisão interlocutória deferiu o pedido de tutela provisória de urgência."
• Depois (Humano): "O juiz aceitou o seu pedido urgente e deu uma decisão favorável provisória."

• Antes (Erro Técnico): "Error 500: Database Connection Timeout."
• Antes (Erro Humano): "Não conseguimos carregar seus processos agora. Já estamos resolvendo. Tente em instantes."
```

---

## ETAPA 10 — DESIGN DE CONFIANÇA & CONFIABILIDADE (LEGAL TRUST)

- **Selo de Verificação OAB:** Destaque visual imediato para perfis de advogados validados junto ao cadastro da OAB.
- **Transparência de Custódia (Escrow Visual):** Indicador gráfico mostrando que o pagamento do cliente está retido com segurança em Conta de Garantia até a entrega.
- **Trilha de Acesso Visível (Audit Trail):** Histórico público de quem leu ou assinou cada documento.

---

## ETAPA 11 — BEHAVIORAL DESIGN & OPTIMIZATION

- **Nudges Comportamentais:** Lembretes amigáveis enviando avisos prévios sobre prazos 48h antes da data limite.
- **Feedback Loops Positivos:** Micro-animações e celebrações visuais ao concluir todas as tarefas prioritárias do dia.
- **Indicadores de Progresso:** Barras graduais mostrando a completude do perfil ou do cadastro do processo.

---

## ETAPA 12 — ONBOARDING EXPERIENCE & TTV

```
CADASTRO PROGRESSIVO EM 3 PASSOS:
[1. Quem é você?] ──> [2. Validação Rápida] ──> [3. Personalização]
 Nome + Email          OAB ou CPF (Auto-fill)    Especialidade / Foco

MÉTRICA TIME TO VALUE (TTV):
• AS-IS: 15 minutos (Formulário longo de etapa única)
• TO-BE Target: < 90 segundos (Acesso imediato com dados demonstrativos)
```

---

## ETAPA 13 — DASHBOARD EXPERIENCE POR PERSONA

```
DASHBOARD ADVOGADO (PRODUTIVIDADE & PRAZOS)
┌────────────────────────────────────────────────────────────────────────┐
│ 🔴 PRAZOS FATAIS HOJE: 2 Ações Exigidas (Ver Todos)                     │
├───────────────────────────┬────────────────────────────────────────────┤
│ 📅 AGENDA DO DIA (3 Audiências)│ 📊 FINANCEIRO (Mês Atual)                  │
│ • 10:00 - Audiência Conciliação│ • Honorários a Receber: R$ 42.500,00       │
│ • 14:30 - Sustentação Oral TRT│ • Taxa de Adimplência: 94.2%              │
├───────────────────────────┴────────────────────────────────────────────┤
│ ⚡ COPILOTO IA: "3 Peças Sugeridas Prontas para Revisão"    [Revisar Agora]│
└────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 14 — UX PARA INTELIGÊNCIA ARTIFICIAL (HUMAN-AI INTERACTION)

- **Transparência de Origem:** Todo texto gerado por IA possui badge visual "Sugestão IA" + score de confiança.
- **Human-in-the-Loop (HITL):** Nenhuma petição ou mensagem é enviada sem a revisão e confirmação do advogado em 1-clique.
- **Explicabilidade (XAI):** Botão "Por que a IA sugeriu isso?" exibindo os artigos de lei e acórdãos consultados.

---

## ETAPA 15 — UX ANALYTICS, PERFORMANCE & GROWTH

```
MÉTRICAS CORE DE EXPERIÊNCIA:
• North Star Metric: Weekly Active Workflows Completed (WAWC).
• System Usability Scale (SUS): Meta de pontuação contínua SUS > 85 / 100.
• Core Web Vitals (Performance UX):
  - LCP (Largest Contentful Paint): < 1.2 segundos.
  - INP (Interaction to Next Paint): < 100 milissegundos.
  - CLS (Cumulative Layout Shift): < 0.05.
```

---

## ETAPA 16 — BACKLOG TÉCNICO DE EXPERIÊNCIA DIGITAL (UX BACKLOG)

---

### UX-001 — Lançamento do Design System Corporativo Unificado

**Problema:** Módulos com linguagens visuais inconsistentes, gerando confusão e alta curva de aprendizado.

**Impacto:** Redução da confiança percebida e lentidão na criação de novas telas pelos times de produto.

**Solução:** Implementar Design System corporativo em Tokens (Figma/React/Tailwind) com biblioteca de componentes Storybook.

**Prioridade:** CRÍTICA | **Complexidade:** Média | **Estimativa:** 6 semanas

---

### UX-002 — Reformulação do Onboarding e Redução de TTV para < 90s

**Problema:** O cadastro exige 18 campos no primeiro contato, gerando abandono de 58%.

**Impacto:** Perda massiva de conversão de novos usuários e frustração inicial.

**Solução:** Implantar Cadastro Progressivo em 3 passos com autocompletar via CPF/OAB e acesso rápido com dados demo.

**Prioridade:** CRÍTICA | **Complexidade:** Baixa-Média | **Estimativa:** 3 semanas

---

### UX-003 — Redesenho dos Dashboards Priorizando Prazos Fatais

**Problema:** Dashboards atuais misturam alertas críticos com informações neutras sem hierarquia.

**Impacto:** Risco operacional grave de perda de prazos judiciais por advogados.

**Solução:** Redesenhar os painéis priorizando alertas P1 (Rose 600) e agenda limpa orientada à ação.

**Prioridade:** CRÍTICA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

### UX-004 — Implementação de Acessibilidade Universal WCAG 2.2 AA

**Problema:** Elementos de interface sem suporte a teclado e contraste insuficiente para pessoas com baixa visão.

**Impacto:** Exclusão de usuários com deficiência e não conformidade com regulamentos de acessibilidade.

**Solução:** Aplicar aneis de foco visíveis, atributos ARIA e garantir razão de contraste mínima de 4.5:1.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

### UX-005 — Padrões de Interação Humano-IA e Explicabilidade

**Problema:** Sugestões da IA geram insegurança por não indicar a origem ou o nível de confiança.

**Impacto:** Recusa dos advogados em utilizar o copiloto de redação e pesquisa.

**Solução:** Adicionar badges de transparência, explicabilidade de fontes normativas e botão de confirmação HITL.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 3 semanas

---

## ETAPA 17 — ARQUITETURA DE EXPERIÊNCIA DIGITAL INTEGRADA

```
LEGIS CONNECT — INTEGRATED DIGITAL EXPERIENCE ARCHITECTURE
Versão 1.0 — Julho 2026

[PERSONAS & USUÁRIOS]
Advogados · Clientes Finais · Gestores de Escritório · Administradores · Parceiros B2B
          ↓
[JORNADA DO USUÁRIO & UX STRATEGY]
Descoberta → Onboarding Progressivo (<90s TTV) → Ação Prioritária → Retenção
Princípios: Simplicidade, Confiança Jurídica, Transparência, Eficiência
          ↓
[DESIGN SYSTEM CORPORATIVO & TOKENS]
Design Tokens (Figma Engine) ──> Style Dictionary ──> Tailwind CSS / CSS Variables
Biblioteca de Componentes React (Atoms, Molecules, Organisms, Templates)
          ↓
[CAMADA DE INTERFACE & ACESSIBILIDADE]
Dashboards Adaptativos por Persona · Mobile First (Thumb Zone) · Acessibilidade WCAG 2.2 AA
          ↓
[INTERAÇÃO HUMANO-IA & CONFIANÇA]
Copiloto IA Transparente (HITL) · Explicabilidade XAI · Escrow Visual & Badges OAB
          ↓
[DESIGN OPS & PRODUCT ANALYTICS]
Figma-to-Dev Pipeline · Storybook · Mixpanel / Amplitude · SUS > 85 · Core Web Vitals
```

---

*Enterprise UX Architecture & Digital Experience Blueprint v1.0*
*Chief Experience Officer · Head of Product Design · Legis Connect · 2026*
