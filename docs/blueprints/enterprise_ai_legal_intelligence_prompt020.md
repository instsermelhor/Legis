# 🧠 ENTERPRISE AI PLATFORM & LEGAL INTELLIGENCE BLUEPRINT — LEGIS CONNECT
**PROMPT 020 — Auditoria Completa da Arquitetura de IA, Automação Jurídica, Agentes Inteligentes e Plataforma Cognitiva**
**Chief AI Architect | Principal ML Architect & LLM Systems Engineer | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A camada de inteligência artificial atual da Legis Connect baseia-se na **chamada direta do navegador à API do Google Gemini** via `geminiService.ts`, sem intermediação de servidor backend. Essa abordagem expõe a credencial privada (`GEMINI_API_KEY`) no código compilado em JavaScript público, não possui mecanismos de sanitização de dados pessoais (PII), carece de arquitetura de busca de conhecimento (*Retrieval-Augmented Generation - RAG*), não mantém memória conversacional persistente e não possui governança ou monitoramento de custos (FinOps).

**Diagnóstico da Camada de Inteligência Artificial**:
- **Nível de Maturidade de IA**: `1.0 / 5.0` (Inexistente / Chamadas Diretas no Client).
- **Riscos Principais**: Exposição de chave de API, potencial vazamento de PII/dados confidenciais para provedores de IA, falta de auditoria de respostas, ausência de explicabilidade (*Explainable AI*) e suscetibilidade a ataques de *Prompt Injection* e alucinações jurídicas.

**Visão Arquitetural TO-BE**: Construir o **Enterprise AI Platform & Legal Intelligence Engine**, estruturado em um **AI Gateway Proxy NestJS**, suporte **Multi-LLM (Gemini 2.5 Flash, GPT-4o, Claude 3.5 Sonnet)**, plataforma **RAG Jurídica (PostgreSQL 16 `pgvector` + Hybrid Search)**, orquestração de **Sistemas Multi-Agente com LangGraph**, biblioteca de ferramentas **MCP (Model Context Protocol)**, proteção ativa com **PiiSanitizer + PromptInjectionGuard**, observabilidade com **LangSmith / OpenTelemetry** e política de automação baseada em **Human-in-the-Loop (HITL)**.

---

## ETAPA 1 — INVENTÁRIO DA ARQUITETURA ATUAL DE IA (AS-IS)

### 1.1 Mapeamento da Infraestrutura Cognitiva Existente

| Serviço / Componente | Modelo Utilizado | Modo de Invocação | Problema / Risco Encontrado | Arquitetura Correta (TO-BE) |
|---|---|---|---|---|
| **`geminiService.ts`** | Google Gemini (v1) | HTTP Direct via Frontend | `API_KEY` exposta no bundle JS; sem rate limit. | **`AiGatewayModule`** NestJS Server Proxy. |
| **Assistente de Dúvidas** | Gemini Flash | Chat sem memória persistente | Esquece o contexto ao recarregar a página; sem RAG. | **Context Engineering** + Redis Memory + `pgvector`. |
| **Análise Documental** | Gemini Flash | Prompt estático inline | Risco de enviar PII de clientes para a API sem filtro. | **`PiiSanitizerService`** + Legal RAG. |
| **Pesquisa de Leis** | Mock estático no JS | JSON local no cliente | Legislação desatualizada; sem busca semântica real. | **Hybrid Search** (Vector + BM25) no PostgreSQL. |

---

## ETAPA 2 — ARQUITETURA AI GATEWAY CENTRALIZADO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CENTRALIZED AI GATEWAY ARCHITECTURE                   │
│                                                                             │
│  [ Client Application (Web / Mobile) ]                                      │
│                     │                                                       │
│                     ▼ JWT Authenticated Request                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ NESTSJ AI GATEWAY PROXY MODULE (`AiGatewayModule`)                   │   │
│  │                                                                      │   │
│  │ ├── 1. Auth & Workspace Guard (Valida permissão e cota do plano)    │   │
│  │ ├── 2. PiiSanitizerService (Ofusca CPFs, E-mails e Nomes)            │   │
│  │ ├── 3. PromptInjectionGuard (Detecta tentativas de Jailbreak)       │   │
│  │ ├── 4. Semantic Cache Engine (Redis - Reutiliza respostas idênticas)  │   │
│  │ └── 5. Dynamic Router Engine (Seleciona o melhor provedor/modelo)    │   │
│  └──────────────────────────────────┬───────────────────────────────────┘   │
│                                     │                                       │
│                                     ▼ Managed Cloud API Calls               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ MULTI-PROVIDER LLM ECOSYSTEM                                         │   │
│  │ ├── Google Vertex AI (Gemini 2.5 Flash / Pro - Principal)            │   │
│  │ ├── OpenAI API (GPT-4o - Análise Complexa e Raciocínio Logico)       │   │
│  │ ├── Anthropic (Claude 3.5 Sonnet - Redação Contratual de Precisão)  │   │
│  │ └── Local / Private LLM (Llama 3 70B - Tarefas Sigilosas em Lote)    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 3 — ARQUITETURA MULTI-LLM E MATRIZ DE ROTEAMENTO DINÂMICO

### 3.1 Critérios de Seleção Automática de Modelos (*Dynamic Model Routing*)

| Tipo de Tarefa Cognitiva | Modelo Primário | Model Fallback | Razão da Escolha | Target Latência / Custo |
|---|---|---|---|---|
| **Resumos Rápidos / Triagem** | **Gemini 2.5 Flash** | GPT-4o-mini | Baixa latência e menor custo por token. | < 800ms / $ 0.0001 per req |
| **Redação de Petições & Peças** | **Claude 3.5 Sonnet** | GPT-4o | Alta precisão sintática e coesão textual jurídica. | < 2.5s / $ 0.003 per req |
| **Raciocínio & Julgamento Complexo** | **GPT-4o** | Gemini 2.5 Pro | Superior em estruturação lógica e interpretação. | < 3.0s / $ 0.005 per req |
| **Processamento Sigiloso em Lote** | **Llama 3 70B Local** | DeepSeek R1 | Execução 100% interna sem envio a nuvem de terceiros.| Batch Processing / $ 0.0 |

---

## ETAPA 4 — PLATAFORMA RAG JURÍDICA (RETRIEVAL-AUGMENTED GENERATION)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PLATAFORMA RAG JURÍDICA (HYBRID SEARCH)                  │
│                                                                             │
│  [ Documentos / Leis / Jurisprudência ] ──► Chunking Strategy (Semantic 512t)│
│                                                   │                         │
│                                                   ▼                         │
│  [ Embeddings Generator ] ────────────────► `text-embedding-004` (Google)   │
│                                                   │                         │
│                                                   ▼                         │
│  [ PostgreSQL 16 `pgvector` ] ────────────► Index HNSW (Cosene Similarity)  │
│                                                   │                         │
│  [ User Query ] ──► Hybrid Search (0.7 Vector Similarity + 0.3 Full-Text BM25)│
│                            │                                                │
│                            ▼                                                │
│  [ Cohere Rerank Model ] ──► Re-ordena os Top 5 Chunks mais relevantes      │
│                            │                                                │
│                            ▼                                                │
│  [ Prompt Context Construction ] ─────────► Envia contexto exato à LLM     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 5 — ENGENHARIA DE CONTEXTO EM 3 NÍVEIS

```
                               GERENCIAMENTO DE CONTEXTO
                               ═════════════════════════

  1. MEMÓRIA CURTA (Short-Term Window) ──► Janela deslizante dos últimos 10 turnos no Redis.
  2. CONTEXTO ORGANIZACIONAL (Workspace) ► Dados do escritório, especialidades e modelo de contrato.
  3. CONTEXTO PROCESSUAL (Long-Term RAG) ─► Documentos do caso recuperados via `pgvector`.
```

---

## ETAPA 6 — ARQUITETURA DE AGENTES INTELIGENTES (MULTI-AGENT SYSTEM)

### 6.1 Matriz do Ecossistema Multi-Agente

| Nome do Agente | Responsabilidade Negocial | Ferramentas Autorizadas (Tools) | Escopo de Permissão |
|---|---|---|---|
| **Agente Jurídico (Chief Legal)** | Orquestração principal de consultas | All Legal Tools | Read-Only |
| **Agente de Pesquisa** | Busca de leis e jurisprudência STF/STJ | DataJud API + RAG Search | Read-Only |
| **Agente Contratual** | Análise e redação de minutas | Contract Templates + PDF Reader | Draft Generation |
| **Agente Financeiro** | Dúvidas sobre faturas e honorários | Stripe Read API + DB Finance | Financial Read-Only |
| **Agente Compliance** | Verificação de riscos e LGPD | PII Scanner + Policy Docs | Audit Only |
| **Agente de Petições** | Geração preliminar de peças processuais | Case Context + RAG + Templates | Draft Generation (HITL) |

---

## ETAPA 7 — ORQUESTRAÇÃO DE AGENTES (LANGGRAPH MULTI-AGENT SUPERVISOR)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 LANGGRAPH MULTI-AGENT ORCHESTRATION FLOW                    │
│                                                                             │
│  [ User Input Request ]                                                     │
│            │                                                                │
│            ▼                                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ SUPERVISOR AGENT (Roteador de Intenções)                             │   │
│  │ Classifica se a requisição é: Jurídica, Financeira, Contratual etc. │   │
│  └──────────────────────────────────┬───────────────────────────────────┘   │
│                                     │                                       │
│          ┌──────────────────────────┼──────────────────────────┐            │
│          ▼                          ▼                          ▼            │
│  ┌───────────────┐          ┌───────────────┐          ┌───────────────┐    │
│  │ Agente Pesquisa│         │Agente Contrato│          │Agente Finanças│    │
│  └───────┬───────┘          └───────┬───────┘          └───────┬───────┘    │
│          │                          │                          │            │
│          └──────────────────────────┼──────────────────────────┘            │
│                                     │                                       │
│                                     ▼ Consolidação & Validação              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ HUMAN-IN-THE-LOOP (HITL) REVIEW GATEWAY                              │   │
│  │ O advogado valida e aprova a minuta gerada antes da emissão final    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 8 — CATÁLOGO DE FERRAMENTAS DOS AGENTES (MCP TOOL REGISTRY)

* **Protocolo Padrão**: **Model Context Protocol (MCP)** para conexão padronizada de ferramentas:
  - `search_laws(query)`: Consulta base oficial de legislação no PostgreSQL.
  - `fetch_process_status(cnjNumber)`: Consome API DataJud do CNJ.
  - `read_case_document(docId)`: Leitura estruturada de PDFs salvos no S3.
  - `calculate_legal_fees(caseType, value)`: Executa motor de cálculo financeiro.

---

## ETAPA 9 — BASE DE CONHECIMENTO JURÍDICA BRASILEIRA

* **Fontes Indexadas**:
  - **Legislação Federal**: Constituição Federal, Código Civil, CPC, CLT, Código Penal.
  - **Jurisprudência**: Súmulas e acórdãos do STF, STJ e TST.
  - **Base do Escritório**: Modelos de peças, pareceres anteriores e contratos padrão.
* **Pipeline de Atualização**: Ingestão diária automatizada via crawler oficial dos diários da justiça integrados ao pipeline de embeddings.

---

## ETAPA 10 — PROMPT ENGINEERING CORPORATIVO & GOVERNANÇA DE PROMPTS

```
                               PROMPT GOVERNANCE FRAMEWORK
                               ═══════════════════════════

  [ Versionamento em Git ] ──► System Prompts armazenados como código (`prompts/v1/legal_analyst.pt`)
  [ Variáveis Injetadas ]  ──► Injeção estrita de contexto sem concatenação direta de input do usuário
  [ Prompt Auditing ]      ──► Aprovação obrigatória pelo Lead Architect para novos prompts em prod
```

---

## ETAPA 11 — SEGURANÇA DA IA (AI SECURITY FRAMEWORK)

* **Prompt Injection Defense**: Análise semântica e sintática de inputs com **PromptInjectionGuard** antes de repassar aos modelos.
* **Sanitização PII**: **PiiSanitizerService** detecta e substitui números de CPF, e-mails, telefones e nomes de partes por tokens neutros (`[CPF_01]`).
* **Proteção contra Alucinações**: Obrigatoriedade de fundamentação via RAG. Respostas sem evidência documental são rejeitadas.

---

## ETAPA 12 — GOVERNANÇA DE INTELIGÊNCIA ARTIFICIAL

* **AI Ownership**: Definição do Conselho de Governança de IA (*AI Governance Board*) unindo Arquitetura de Software, Jurídico e DPO.
* **Trilha de Auditoria Auditável**: Registro imutável no PostgreSQL de cada chamada de IA contendo: `userId`, `sanitizedPrompt`, `modelUsed`, `tokensSpent`, `responseHash` e `userFeedback`.

---

## ETAPA 13 — OBSERVABILIDADE DA IA (LANGSMITH / OPENTELEMETRY AI)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     STACK DE OBSERVABILIDADE COGNITIVA                      │
│                                                                             │
│  [ AI Request Engine ] ──► LangSmith Tracing / OpenTelemetry AI Collector    │
│                                    │                                        │
│                                    ▼ Dashboards Grafana                     │
│  ├── Latência p95 / p99 por Modelo e Provedor                              │
│  ├── FinOps Token Usage (Custo em USD acumulado por Tenant e por Usuário)   │
│  ├── Taxa de Erros e Timeouts de APIs Externas                             │
│  └── Feedback do Usuário (Thumbs Up / Thumbs Down / Motivo de Rejeição)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 14 — FINOPS AI & OTIMIZAÇÃO DE CUSTOS

```
                           METAS DE OTIMIZAÇÃO FINOPS AI
                           ═════════════════════════════

  Métrica FinOps                  Meta TO-BE       Estratégia Aplicada
  ─────────────────────────────────────────────────────────────────────────────
  Cache Hit Rate Semântico        > 40%            Cache Redis de respostas idênticas
  Custo Médio por Conversa        < $ 0.005        Dynamic Routing (Gemini Flash para 80%)
  Compressão de Contexto          > 30%            Remoção de stop-words e duplicações
  Limite de Tokens por Usuário    Estrito por Plano Limite diário renovado via Redis
```

---

## ETAPA 15 — EXPLAINABLE AI (XAI & RASTREABILIDADE JURÍDICA)

* **Citações Obrigatórias**: Todas as respostas geradas pela IA para teses jurídicas ou análises de casos **devem citar expressamente** os artigos de lei ou acórdãos recuperados pela busca vetorial.
* **Score de Confiança**: Exibição visual do nível de precisão da resposta (ex: `Grau de Confiança: 94% — Baseado em 3 decisões do STJ`).

---

## ETAPA 16 — AVALIAÇÃO CONTÍNUA DOS MODELOS (LLM BENCHMARKING)

* **Pipeline Ragas / DeepEval**: Execução automatizada semanal de testes de benchmarking avaliando:
  - **Faithfulness**: Se a resposta foi 100% fiel ao documento recuperado.
  - **Answer Relevance**: Se a resposta realmente respondeu à pergunta do advogado.
  - **Context Recall**: Se o motor RAG recuperou todas as leis necessárias.

---

## ETAPA 17 — AUTOMAÇÃO JURÍDICA HUMAN-IN-THE-LOOP (HITL)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    POLÍTICA HUMAN-IN-THE-LOOP (HITL)                        │
│                                                                             │
│  [ IA Gera Minuta de Petição ] ──► Status: "DRAFT_PENDING_REVIEW"          │
│                                           │                                 │
│                                           ▼                                 │
│  [ Advogado Humano Revisa e edita ] ──────► Validação do Profissional       │
│                                           │                                 │
│                                           ▼                                 │
│  [ Aprovação & Assinatura Digital ] ──────► Status: "APPROVED_FOR_COURT"    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 18 — COMPLIANCE E IA RESPONSÁVEL (LGPD ART. 20)

* **Direito à Revisão de Decisões Automatizadas (Art. 20 LGPD)**: Garantia de que nenhuma decisão contratual, financeira ou de exclusão de usuário seja tomada 100% por IA sem supervisão humana.
* **Transparência**: Alerta visual claro em todas as telas indicando: *"Esta resposta foi gerada com o auxílio de inteligência artificial e deve ser validada por um advogado habilitado."*

---

## ETAPA 19 — ROADMAP EVOLUTIVO DA PLATAFORMA COGNITIVA

```
                    ROADMAP DE EVOLUÇÃO DA CAMADA DE IA
                    ═══════════════════════════════════

  FASE 1: AI GATEWAY & SEGURANÇA BASE (Semanas 1-4)
  ├── Deploy do `AiGatewayModule` NestJS (Proxy Server-Side)
  ├── Implantação do `PiiSanitizerService` e `PromptInjectionGuard`
  └── FinOps Token Tracking e Redis Semantic Cache Engine

  FASE 2: PLATAFORMA RAG JURÍDICA (Semanas 5-8)
  ├── Instalação do PostgreSQL 16 `pgvector` com HNSW index
  ├── Ingestão da base de legislação brasileira e jurisprudência STF/STJ
  └── Pipeline de busca híbrida (Vector + BM25) com Cohere Rerank

  FASE 3: SISTEMAS MULTI-AGENTE & LANGGRAPH (Semanas 9-12)
  ├── Implementação dos Agentes de Pesquisa, Contratual e Petições
  ├── Orquestração Multi-Agente com LangGraph e MCP Tools
  └── Interface Human-in-the-Loop para validação de minutas
```

---

## ETAPA 20 — BACKLOG TÉCNICO DA CAMADA DE IA

### AI-001 — Implementar Proxy Server-Side `AiGatewayModule`
* **Problema**: `GEMINI_API_KEY` exposta no bundle público JavaScript.
* **Solução**: Mover chamadas para o backend NestJS com autenticação JWT e rate limiting.
* **Prioridade**: 🔴 EMERGENCIAL | **Complexidade**: Média | **Esforço**: 32h

### AI-002 — Desenvolver `PiiSanitizerService` para Anonimização de Prompts
* **Problema**: Envio inadvertido de CPFs e dados sensíveis para APIs externas.
* **Solução**: Filtro regex e NER substituindo PII por tokens neutros antes do despacho.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 24h

### AI-003 — Implantar RAG Jurídico com PostgreSQL 16 `pgvector`
* **Problema**: Respostas da IA sem fundamentação na legislação atualizada.
* **Solução**: Banco vetorial `pgvector` com busca híbrida e reranking de contexto.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 60h

### AI-004 — Implementar Orquestrador Multi-Agente com LangGraph
* **Problema**: Modelo único genérico falhando em tarefas jurídicas especializadas.
* **Solução**: Agentes especializados (Pesquisa, Petição, Contratos) orquestrados via LangGraph.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Alta | **Esforço**: 56h

### AI-005 — Dashboard FinOps AI e Semantic Caching no Redis
* **Problema**: Risco de custos descontrolados com APIs de IA em escala.
* **Solução**: Cache semântico de perguntas repetidas e controle de cota por tenant.
* **Prioridade**: 🟠 ALTA | **Complexidade**: Média | **Esforço**: 24h

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 020

| Entregável | Status |
|---|---|
| ✅ Inventário Completo da Arquitetura Atual de IA (Mapeamento de Riscos AS-IS) | Concluído |
| ✅ Projeto do AI Gateway Centralizado (`AiGatewayModule` NestJS Proxy) | Concluído |
| ✅ Estratégia Multi-LLM (Matriz de Roteamento Gemini, GPT-4o, Claude) | Concluído |
| ✅ Arquitetura RAG Jurídica (PostgreSQL `pgvector` + Hybrid Search + Rerank) | Concluído |
| ✅ Modelo de Engenharia de Contexto em 3 Níveis (Short, Workspace, RAG) | Concluído |
| ✅ Arquitetura de Agentes Inteligentes (Matriz dos 6 Agentes Especializados) | Concluído |
| ✅ Sistema de Orquestração de Agentes (LangGraph Multi-Agent Supervisor) | Concluído |
| ✅ Catálogo de Ferramentas dos Agentes (Model Context Protocol - MCP) | Concluído |
| ✅ Base de Conhecimento Jurídica Brasileira (Ingestão STF/STJ/Legislação) | Concluído |
| ✅ Framework Corporativo de Prompt Engineering (Versionamento em Git) | Concluído |
| ✅ Plano de Segurança da IA (PiiSanitizer + PromptInjectionGuard) | Concluído |
| ✅ Modelo de Governança da IA (AI Governance Board + Audit Trail) | Concluído |
| ✅ Arquitetura de Observabilidade da IA (LangSmith + OpenTelemetry AI) | Concluído |
| ✅ Estratégia FinOps para IA (Semantic Cache Redis + Target Hit > 40%) | Concluído |
| ✅ Modelo de Explainable AI (XAI com Citações e Score de Confiança) | Concluído |
| ✅ Processo de Avaliação Contínua dos Modelos (Ragas / DeepEval Benchmark) | Concluído |
| ✅ Arquitetura de Automação Jurídica (Política Human-in-the-Loop HITL) | Concluído |
| ✅ Matriz de Compliance e IA Responsável (LGPD Art. 20 + Transparência) | Concluído |
| ✅ Roadmap Evolutivo da Plataforma Cognitiva em 3 Fases (12 semanas) | Concluído |
| ✅ Backlog Técnico da Camada de IA Priorizado (`AI-001` a `AI-005`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 020 — Enterprise AI Platform & Legal Intelligence Blueprint | v1.0.0*
*Próximo: PROMPT 021 — Plano Mestre de Reengenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
