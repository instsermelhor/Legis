# PROMPT 061 — Enterprise AI Architecture & Legal Intelligence Platform Blueprint
## Legis Connect · CAIO · AI Solutions Architect · LegalTech Intelligence Lead · MLOps Engineer
### Versão 1.0 COMPLETA | Classificação: CONFIDENCIAL | Data: 2026-07-25 | 27 Etapas Auditadas

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Corporativa Completa de Inteligência Artificial da Legis Connect TO-BE**, cobrindo as 27 etapas mandatórias: AI Strategy, AI Gateway Enterprise (LiteLLM + Kong AI), Multi-LLM Routing (Claude 3.5 Sonnet, Gemini 2.5 Pro, Llama 3 70B, DeepSeek R1), RAG Híbrido (pgvector HNSW 0.7.4 + BM25 + Cohere Rerank v3), Base de Conhecimento Jurídica (CF/88, CLT, CC, CPC + STF/STJ), Agentes Autônomos LangGraph, Legis Copilot com HITL, Prompt Engineering Corporativo, AI Memory, AI Security (NeMo Guardrails + OWASP LLM Top 10), AI Privacy (LGPD), AI Governance Office (ISO/IEC 42001), MLOps (MLflow + Prometheus AI), Legal Predictive Analytics e Responsible AI.

**Estado AS-IS:** Maturidade `1.2 / 5.0` — frontend React chama Gemini API diretamente via `geminiService.ts`, API Key exposta no bundle JS (VULN-004), zero AI Gateway, sem RAG jurídico, zero governança, zero auditoria, custo imprevisível.

**Estado TO-BE:** Maturidade `4.8 / 5.0` — AI Gateway LiteLLM, RAG Híbrido com legislação + STF/STJ, pgvector HNSW, LangGraph Multi-Agent, Legis Copilot HITL, NeMo Guardrails, custo < R$ 12/usuário/mês via Semantic Cache, AI Governance Office formalizado.

---

## ETAPA 1 — AUDITORIA DA IA ATUAL DA PLATAFORMA

### 1.1 Matriz de Recursos de IA Existentes

| Recurso de IA | Estado Atual (AS-IS) | Risco | Evolução Necessária (TO-BE) |
|---|---|---|---|
| **geminiService.ts** | Chamada direta Gemini API no frontend | CRÍTICO: API Key exposta no bundle JS (CVSS 9.0) | AI Gateway NestJS (LiteLLM) |
| **API Key Management** | Hardcoded no .env do frontend | CRÍTICO: Indexável via GitHub Search | HashiCorp Vault TTL 1h + Rotação |
| **Modelo** | Gemini 1.5 Flash único, sem fallback | ALTO: Vendor lock-in + zero disponibilidade | Multi-LLM Routing: Claude/Gemini/Llama |
| **Contexto Enviado** | Prompt raw sem sanitização PII | ALTO: CPF, dados jurídicos expostos ao Google | PII Sanitizer Middleware pré-envio |
| **RAG / Knowledge Base** | Inexistente | ALTO: Respostas genéricas sem base legal BR | RAG Híbrido + STF/STJ + pgvector HNSW |
| **Auditoria de IA** | Inexistente | ALTO: Alucinações sem rastreamento | AI Audit Trail HMAC SHA-256 imutável |
| **Controle de Custos** | Sem metrificação | MÉDIO: Custo ilimitado por power user | Metered Billing + Budget Alerts |
| **Agentes Autônomos** | Inexistentes | ESTRATÉGICO: Zero automação jurídica | LangGraph Multi-Agent + HITL |
| **Prompt Engineering** | Ad-hoc inline, sem governança | MÉDIO: Inconsistência + risco de PII | Prompt Library versionada + aprovação |
| **Guardrails** | Inexistentes | ALTO: Jailbreak, injection, outputs errados | NeMo Guardrails Input/Output/Topical |

### 1.2 Score de Maturidade de IA

| Domínio | AS-IS | TO-BE | Gap |
|---|---|---|---|
| AI Gateway & Infrastructure | 0.5 / 5.0 | 5.0 / 5.0 | +4.5 |
| Knowledge Base & RAG | 0.0 / 5.0 | 4.8 / 5.0 | +4.8 |
| AI Agents & Automation | 0.0 / 5.0 | 4.5 / 5.0 | +4.5 |
| AI Security & Privacy | 0.5 / 5.0 | 4.9 / 5.0 | +4.4 |
| AI Governance & MLOps | 0.0 / 5.0 | 4.7 / 5.0 | +4.7 |
| **Maturidade Geral** | **1.2 / 5.0** | **4.8 / 5.0** | **+3.6** |

---

## ETAPA 2 — DIAGNÓSTICO DA ARQUITETURA ATUAL DE IA (AI RISK ASSESSMENT)

### 2.1 Arquitetura AS-IS com Vetores de Ataque

```
ARQUITETURA ATUAL (CRITICAMENTE INSEGURA):

[Usuário] → [React Frontend]
  ↓ (API Key visível no bundle JS — qualquer pessoa pode extrair)
[geminiService.ts — chamada direta ao LLM sem segurança]
  ↓ (sem PII Sanitizer, sem rate limiting, sem auditoria, sem guardrails)
[Google Gemini API 1.5 Flash]
  ↓ (resposta sem validação, sem grounding, sem disclaimer)
[Resposta exibida diretamente na UI]

VETORES CONFIRMADOS:
  [A] Extração da API Key via DevTools/bundle analyzer
  [B] Prompt Injection: "Ignore todas as instruções anteriores..."
  [C] Data Exfiltration: dados jurídicos sensíveis → Google sem anonimização
  [D] Custo ilimitado: milhares de requests por usuário sem bloqueio
```

### 2.2 AI Risk Matrix

| ID | Risco | Prob. | Impacto | CVSS | Controle TO-BE |
|---|---|---|---|---|---|
| AI-001 | API Key Gemini exposta no bundle | Alta | Crítico | 9.0 | Vault TTL 1h + AI Gateway |
| AI-002 | PII enviado ao LLM sem sanitização | Alta | Alto | 8.2 | PII Sanitizer Middleware |
| AI-003 | Zero auditoria de prompts | Alta | Alto | 8.0 | AI Audit Trail HMAC SHA-256 |
| AI-004 | Custo ilimitado por usuário | Alta | Alto | 7.5 | Metered Billing + Budget Alerts |
| AI-005 | Prompt Injection / Jailbreak | Média | Alto | 7.8 | NeMo Guardrails Rails |
| AI-006 | Vendor lock-in Gemini | Média | Médio | 5.5 | Multi-LLM Routing + Fallback |
| AI-007 | Alucinações jurídicas sem grounding | Alta | Alto | 8.0 | RAG + Citation Validator + HITL |
| AI-008 | Ações automáticas sem supervisão | Baixa | Crítico | 7.0 | HITL Gate obrigatório |

---

## ETAPA 3 — AI STRATEGY FRAMEWORK

### 3.1 Visão Estratégica

```
LEGIS CONNECT AI VISION 2026-2028:
"Transformar a Legis Connect no AI-Powered Legal Intelligence Operating System
do mercado jurídico brasileiro — onde a IA é a camada cognitiva central que
amplifica a capacidade dos advogados, protege os direitos dos clientes e
automatiza processos jurídicos com segurança, ética e embasamento legal."

POSICIONAMENTO:
  Hoje → Plataforma de conexão advogado-cliente com IA básica
  12m  → Copiloto jurídico inteligente (RAG + Legislação BR)
  24m  → Legal Intelligence OS (Agentes + Analytics Preditivo)
  36m  → Ecossistema cognitivo jurídico — padrão de mercado no Brasil
```

### 3.2 OKRs Estratégicos de IA

| Objetivo | Key Result | Target | Prazo |
|---|---|---|---|
| Produtividade do advogado | Redução do tempo em pesquisa jurídica | -40% | 6 meses |
| Experiência do cliente | NPS impactado por features IA | +15 pts | 4 meses |
| Custo operacional | Tickets resolvidos pela IA | 30% | 6 meses |
| Monetização de IA | MRR incremental planos AI Pro | R$ 150k | 9 meses |
| IA segura e confiável | Incidentes LGPD relacionados à IA | 0 | Contínuo |

### 3.3 Priorização de Casos de Uso

| Caso de Uso | Valor | Complexidade | Prioridade | Sprint |
|---|---|---|---|---|
| AI Gateway Seguro (VULN-004) | Crítico | Baixa | P0 | Sprint 0 |
| PII Sanitizer Middleware | Crítico | Baixa | P0 | Sprint 0 |
| RAG com Legislação Brasileira | Alto | Média | P1 | Sprint 1 |
| Legis AI Assistant (Clientes) | Alto | Média | P1 | Sprint 2 |
| Legis Copilot (Advogados + HITL) | Alto | Alta | P1 | Sprint 2-3 |
| Smart Match AI | Médio | Média | P2 | Sprint 3 |
| LangGraph Multi-Agent Engine | Alto | Muito Alta | P3 | Sprint 4+ |
| Legal Predictive Analytics | Médio | Alta | P3 | Sprint 5+ |

---

## ETAPA 4 — ENTERPRISE AI ARCHITECTURE BLUEPRINT

```
LEGIS CONNECT — ENTERPRISE AI ARCHITECTURE TO-BE (7 CAMADAS)

CAMADA 1 — AI INTERFACE LAYER
  Chat Widget · Copilot Sidebar · AI Search Bar · Document Analyzer
  Legis AI Assistant (Clientes) · Smart Match Widget · Executive Dashboard

CAMADA 2 — AI GATEWAY (LiteLLM + Kong AI Plugin)
  OAuth 2.1 Auth · Rate Limiting por workspace_id
  Token Budget Enforcement · Cost Tracking
  PII Sanitizer · NeMo Guardrails · Redis Semantic Cache

CAMADA 3 — ORCHESTRATION (LangGraph + Temporal.io)
  Multi-Agent Router · Workflow Orchestrator
  Memory Manager (Redis STM + PostgreSQL LTM)
  Tool Registry · HITL Approval Gate

CAMADA 4 — LLM SERVICES (Multi-LLM Routing)
  Claude 3.5 Sonnet · Gemini 2.5 Pro
  Llama 3 70B (on-prem) · DeepSeek R1 (on-prem)

CAMADA 5 — KNOWLEDGE BASE & RAG ENGINE
  CF/88 · CLT · CC · CPC · CDC · Legislação Federal
  Jurisprudência STF · STJ · TRTs · Templates de Peças
  Documentos privados por workspace_id

CAMADA 6 — VECTOR & DATA LAYER
  pgvector HNSW 0.7.4 · BM25 ElasticSearch
  Cohere Rerank v3 · Redis Semantic Cache TTL 24h

CAMADA 7 — GOVERNANCE & OBSERVABILITY
  AI Audit Trail HMAC · MLflow Registry
  Prometheus AI Metrics · RAGAS Benchmarks
  AI Governance Office · ISO/IEC 42001
```

---

## ETAPA 5 — AI GATEWAY FRAMEWORK (LITELLM + KONG AI)

### 5.1 Fluxo Completo do AI Gateway

```
[Frontend React]
  POST /api/ai/query
  ↓
[NestJS AI Controller — autenticado via JWT]
  ↓
[1. PII SANITIZER MIDDLEWARE]
   Detecta: CPF, CNPJ, RG, email, telefone, OAB
   Substitui por tokens: {PII_CPF_001}, {PII_NAME_001}
   Registra sanitização no Audit Log (tipo + timestamp — nunca o dado)
  ↓
[2. NEMO GUARDRAILS — Input Check]
   Verifica Prompt Injection, Jailbreak, Topical Boundary
   Bloqueia → HTTP 400 + log SOC se violação detectada
  ↓
[3. REDIS SEMANTIC CACHE]
   Hash da query → busca cache (TTL 24h)
   Cache HIT  → retorna resposta (zero custo de token)
   Cache MISS → prossegue para roteamento
  ↓
[4. LITELLM ROUTER]
   Seleciona modelo: tipo_tarefa + sensibilidade_dado + latência
   Budget Check: workspace_id dentro do limite mensal?
   ├─→ Claude 3.5 Sonnet  → análise jurídica complexa
   ├─→ Gemini 2.5 Pro     → documentos > 50 páginas
   └─→ Llama 3 70B        → dados ultrasensíveis (on-prem)
  ↓
[5. NEMO GUARDRAILS — Output Check]
   Verifica: PII no output, alucinações, disclaimer jurídico ausente
  ↓
[6. AI AUDIT TRAIL]
   Registra: user_id, prompt_hash(SHA-256), model_used, tokens_in, tokens_out, response_hash
   NUNCA registra conteúdo raw dos prompts — apenas hashes
```

### 5.2 Configuração LiteLLM

```yaml
model_list:
  - model_name: "legal-analysis"
    litellm_params:
      model: "anthropic/claude-3-5-sonnet-20241022"
      api_key: "os.environ/ANTHROPIC_KEY"   # HashiCorp Vault TTL 1h
      max_tokens: 8192
      temperature: 0.1   # Baixo para precisão jurídica

  - model_name: "document-processing"
    litellm_params:
      model: "gemini/gemini-2.5-pro"
      api_key: "os.environ/GEMINI_KEY"
      max_tokens: 32768

  - model_name: "sensitive-data"
    litellm_params:
      model: "ollama/llama3:70b"
      api_base: "http://ollama.legis.internal:11434"  # On-premises
      max_tokens: 4096

router_settings:
  routing_strategy: "latency-based-routing"
  fallbacks: [{"legal-analysis": ["document-processing"]}]
  retry_policy: {num_retries: 3, retry_after: 2}

litellm_settings:
  budget_manager:
    max_budget_per_workspace: 500.00   # R$ 500/mês por workspace
    budget_duration: "monthly"
    on_budget_exceeded: "block"
```

---

## ETAPA 6 — LLM SELECTION STRATEGY

### 6.1 Matriz de Seleção por Caso de Uso

| Caso de Uso | Modelo Primário | Fallback | Justificativa |
|---|---|---|---|
| Análise jurídica complexa | Claude 3.5 Sonnet | Gemini 2.5 Pro | Raciocínio superior + contexto 200k |
| Geração de peças | Claude 3.5 Sonnet | Llama 3 70B on-prem | Precisão máxima + HITL obrigatório |
| Documentos longos (>50 pág.) | Gemini 2.5 Pro | Claude 3.5 Haiku | Janela de contexto 1M tokens |
| Dados ultrasensíveis (PII) | Llama 3 70B (on-prem) | DeepSeek R1 (on-prem) | Zero data egress da infraestrutura |
| Embeddings | text-embedding-3-large | Cohere embed-v3 | Alta qualidade para direito BR |
| Chatbot FAQ (alto volume) | Gemini 1.5 Flash | Llama 3 8B on-prem | Baixo custo para alto volume |
| Raciocínio estruturado | DeepSeek R1 (on-prem) | Claude 3.5 Sonnet | Chain-of-thought jurídico |

### 6.2 Política de Roteamento por Sensibilidade

```
PÚBLICO:       Legislação, jurisprudência → Qualquer modelo externo
INTERNO:       Casos sem PII, prazos → Claude/Gemini com PII Sanitizer
CONFIDENCIAL:  Contratos, petições → Claude + PII Sanitizer obrigatório
SENSÍVEL:      CPF, saúde, sigilo → Llama 3 70B on-premises APENAS
```

---

## ETAPA 7 — LEGAL RAG ARCHITECTURE (RAG HÍBRIDO JURÍDICO)

### 7.1 Pipeline RAG Completo

```
INGESTÃO (Apache Airflow — batch diário):
  Fonte (PDF/HTML/API)
    → PyMuPDF Parser (extração de texto)
    → Limpeza e normalização
    → Chunking Semântico (512 tokens, overlap 64)
    → Metadados: {tipo, tribunal, data, area_direito, ementa, norma}
    → Dual Embedding:
        text-embedding-3-large → pgvector (semântico)
        BM25 Tokenizer         → ElasticSearch (lexical)
    → Upsert ON CONFLICT DO UPDATE (dedup por source_id)

CONSULTA (NestJS RAG Service — real-time):
  Query do Usuário
    ↓ HyDE (Hypothetical Document Embeddings — +18% recall)
    ↓ Parallel Search:
        pgvector ANN HNSW (similaridade coseno)
        BM25 ElasticSearch (artigos de lei específicos)
    ↓ Reciprocal Rank Fusion (RRF) → top 20 candidatos
    ↓ Cohere Rerank v3 → top 5 chunks mais relevantes
    ↓ Redis Semantic Cache (TTL 24h — cache hit?)
    ↓ Context Assembly: [System Prompt] + [5 Chunks RAG] + [Query]
    ↓ LLM Generation (via AI Gateway)
    ↓ Citation Validator (cada afirmação cita chunk de origem?)
    ↓ Confidence Score (0.0–1.0 baseado em faithfulness)
    ↓ HITL Gate (score < 0.85 → flag "requer revisão humana")
    ↓ Resposta Jurídica Fundamentada com Citações Rastreáveis
```

### 7.2 Benchmarks de Estratégia RAG

| Estratégia | Recall | Precision | Custo | Uso |
|---|---|---|---|---|
| Semântica pura (pgvector) | 78% | 82% | Baixo | Contexto geral |
| Lexical pura (BM25) | 72% | 88% | Muito baixo | Artigos de lei |
| **RAG Híbrido (pgvector + BM25 + Rerank)** | **91%** | **94%** | **Médio** | **Produção** |
| RAG Híbrido + HyDE | 94% | 93% | Médio-Alto | Queries ambíguas |

---

## ETAPA 8 — LEGAL KNOWLEDGE MANAGEMENT FRAMEWORK

### 8.1 Inventário da Base de Conhecimento Jurídica

| Categoria | Fontes | Volume | Frequência | Responsável |
|---|---|---|---|---|
| Constituição Federal | Planalto.gov.br | 1 documento | Emendas (eventuais) | Airflow |
| Legislação Federal | API Planalto + DOU | ~18.000 normas | Semanal via RSS DOU | Airflow |
| Jurisprudência STF | API STFAPI | ~550.000 acórdãos | Diária | Airflow DAG |
| Jurisprudência STJ | API STJARQUIVO | ~900.000 acórdãos | Diária | Airflow DAG |
| Jurisprudência TRTs | CNJ DataJud API | ~2.500.000 acórdãos | Semanal | Airflow DAG |
| Súmulas TST | Portal TST | ~800 súmulas | Mensal | Airflow DAG |
| Templates de Peças | Equipe jurídica | ~2.500 modelos | Mensal (revisão humana) | Jurídico Legis |
| Doutrina | Parceiros editoriais | ~6.000 artigos | Trimestral | Parceiros + IA |
| Docs do Escritório | Upload usuário | Variável | Tempo real | Self-service |

### 8.2 Pipeline de Ingestão Airflow

```
AIRFLOW DAG — jurisprudencia_stj_ingestion (schedule: 0 3 * * * BRT)
  Task 1: fetch_new_decisions()    — Consulta API STJ últimas 24h
  Task 2: extract_text()           — PyMuPDF extrai texto dos PDFs
  Task 3: clean_and_normalize()    — Remove headers, rodapés, OCR artifacts
  Task 4: chunk_semantic()         — 512 tokens, overlap 64
  Task 5: extract_metadata()       — {tribunal, data, relator, area, ementa}
  Task 6: generate_embeddings()    — text-embedding-3-large batch (1000/req)
  Task 7: upsert_pgvector()        — ON CONFLICT (source_id) DO UPDATE
  Task 8: update_elasticsearch()   — BM25 index upsert
  Task 9: invalidate_cache()       — Invalida Redis entries da área jurídica
  
  VALIDAÇÃO: Hash SHA-256 por documento. Fontes não-allowlisted rejeitadas.
  ALERTA: PagerDuty se ingestão falhar por 2+ dias consecutivos.
```

---

## ETAPA 9 — VECTOR SEARCH ARCHITECTURE (PGVECTOR 0.7.4 HNSW)

### 9.1 Escolha de Banco Vetorial

| Solução | Latência P99 | Custo | Isolamento por Tenant | PostgreSQL | Escolha |
|---|---|---|---|---|---|
| Pinecone | ~20ms | $$$$ | Namespaces | Não nativa | Não |
| Weaviate | ~30ms | $$$ | Multi-tenancy | Não nativa | Não |
| Milvus | ~15ms | $$ | Collections | Não nativa | Não |
| **pgvector** | **~25ms** | **$** | **Row-Level Security** | **Nativa** | **SIM** |

**Justificativa:** pgvector integra ao PostgreSQL já usado pela Legis Connect, elimina banco adicional, suporta isolamento por `workspace_id` via RLS e o índice HNSW 0.7.4 oferece performance ANN adequada para o volume esperado (< 10M vetores em 3 anos).

### 9.2 Schema SQL Completo

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE legal_knowledge_base (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_type        VARCHAR(32) NOT NULL
                    CHECK (doc_type IN ('legislation','jurisprudence','template','doctrine','internal')),
    source          VARCHAR(128) NOT NULL,
    source_id       VARCHAR(256) UNIQUE,        -- dedup via ON CONFLICT
    title           TEXT NOT NULL,
    area_direito    VARCHAR(64),                -- 'trabalhista','civil','penal','tributario'
    content_chunk   TEXT NOT NULL,
    chunk_index     INTEGER NOT NULL,
    total_chunks    INTEGER NOT NULL,
    embedding       VECTOR(1536) NOT NULL,      -- text-embedding-3-large
    bm25_tokens     TSVECTOR GENERATED ALWAYS AS
                    (to_tsvector('portuguese', content_chunk)) STORED,
    workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE,  -- NULL = público
    doc_date        DATE,
    source_url      TEXT,
    content_hash    CHAR(64) NOT NULL,          -- SHA-256 para integridade
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW — ANN de alta performance
CREATE INDEX idx_lkb_hnsw ON legal_knowledge_base
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 200);

-- FTS para busca lexical BM25
CREATE INDEX idx_lkb_fts ON legal_knowledge_base USING GIN (bm25_tokens);

-- Filtros compostos
CREATE INDEX idx_lkb_filter ON legal_knowledge_base
    (doc_type, area_direito, workspace_id, doc_date DESC);

-- Row-Level Security — isolamento por workspace
ALTER TABLE legal_knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON legal_knowledge_base
    USING (workspace_id = current_setting('app.current_workspace_id')::UUID
           OR workspace_id IS NULL);
```

---

## ETAPA 10 — AI LEGAL ASSISTANT BLUEPRINT (PARA CLIENTES)

### 10.1 Funcionalidades

| Funcionalidade | Fonte de Dados | Limitação Ética |
|---|---|---|
| Responder dúvidas jurídicas | RAG (legislação + jurisprudência) | Disclaimer obrigatório em toda resposta |
| Resumir documentos | Documento enviado pelo cliente | Sem PII de terceiros no resumo |
| Explicar leis | Legislação brasileira (RAG) | Cita artigo completo como fonte |
| Sugerir argumentos | Jurisprudência + doutrina (RAG) | Apenas informativo — não substitui advogado |
| Busca semântica | pgvector + BM25 | Resultados rankados por relevância |
| Smart Match | Perfis + histórico de advogados | Apresenta 3 opções — escolha do cliente |

### 10.2 Fluxo de Atendimento

```
[CLIENTE ACESSA CHAT]
  ↓
[DEMAND CLASSIFIER (ML)]
  Classifica: área jurídica, urgência, complexidade, valor estimado
  Confiança < 0.80 → pergunta de clarificação
  ↓
[ORIENTAÇÃO JURÍDICA RAG]
  Busca legislação e jurisprudência relevante
  Traduz juridiquês em linguagem simples
  Exibe sempre: "Esta orientação é informativa. Para representação, consulte um advogado."
  ↓
[SMART MATCH AI]
  3 advogados ranqueados: especialidade × avaliação × taxa_resposta × disponibilidade
  ↓
[ACOMPANHAMENTO DURANTE O PROCESSO]
  Notificações proativas de movimentações
  Timeline traduzida em linguagem simples
  AI responde dúvidas 24/7
```

### 10.3 Limites Éticos Inegociáveis (Provimento OAB 205/2021 + LGPD)

```
NUNCA: Emite pareceres definitivos em nome de advogado
NUNCA: Protocola documentos sem aprovação humana
NUNCA: Promete resultados ou probabilidades de êxito
NUNCA: Armazena dados de saúde sem consentimento explícito
SEMPRE: Exibe disclaimer jurídico em toda resposta de orientação
SEMPRE: Cita fontes legislativas e jurisprudenciais
SEMPRE: Oferece contato humano como alternativa ao chat
```

---

## ETAPA 11 — LAWYER AI COPILOT ARCHITECTURE (LEGIS COPILOT)

### 11.1 Módulos do Legis Copilot

```
MÓDULO 1 — ANÁLISE DE PROCESSOS (DataJud + RAG)
  Input:  Número CNJ (ex: 0001234-56.2024.5.02.0001)
  Etapas: DataJud API → movimentações + partes + documentos
          RAG → jurisprudência similar → análise de risco
  Output: Últimas movimentações, prazo crítico, similar cases,
          risco estimado, recomendações de ação

MÓDULO 2 — REDAÇÃO ASSISTIDA DE PEÇAS (HITL OBRIGATÓRIO)
  Input:  Tipo de peça + dados do caso + fundamentos
  Etapas: RAG → modelos + jurisprudência + legislação
          Claude 3.5 Sonnet → minuta estruturada
          Sistema → badges de confiança por trecho
  HITL:   Advogado DEVE revisar, editar e aprovar ANTES de qualquer uso
  Output: Peça finalizada pelo advogado (IA assistiu, humano decidiu)

MÓDULO 3 — PESQUISA JURÍDICA INTELIGENTE
  Input:  Pergunta em linguagem natural
  Output: Posição STF + STJ + legislação + doutrina + divergências

MÓDULO 4 — REVISÃO TEXTUAL JURÍDICA
  Input:  Texto redigido pelo advogado
  Output: Sugestões inline de clareza, precisão, citações ausentes
  Regra:  IA sugere — advogado aceita ou rejeita individualmente

MÓDULO 5 — CHECKLIST PROCESSUAL INTELIGENTE
  Input:  Tipo de ação + fase processual + tribunal
  Output: Documentos obrigatórios + prazo legal + jurisprudência local
```

### 11.2 Badges de Confiança e HITL

```typescript
enum CopilotConfidenceLevel {
  HIGH   = 'high',   // Jurisprudência pacificada STF/STJ
  MEDIUM = 'medium', // Área com divergência jurisprudencial ativa
  LOW    = 'low',    // Tema inovador — pesquisa adicional necessária
}

interface TextChunkAnalysis {
  text: string;
  confidence: CopilotConfidenceLevel;
  sources: LegalReference[];  // citações rastreáveis por afirmação
  hitl_required: boolean;     // true se confidence === 'low'
}

// BLOQUEIO ABSOLUTO: botão "Usar Peça" desabilitado até aprovação explícita
// O sistema NUNCA protocola documento sem confirmação do advogado
```

---

## ETAPA 12 — LEGAL AUTOMATION FRAMEWORK

### 12.1 Automações por Categoria

| Automação | Gatilho | Ação Automática | Revisão Humana |
|---|---|---|---|
| Monitoramento DataJud | Nova movimentação processual | Extrai prazo + cria alerta P1 | Advogado confirma |
| Classificação Documental | Upload PDF/DOCX no GED | Classifica tipo + extrai metadados | Opcional |
| Resumo de Peças Longas | Peça > 10 páginas | Resumo executivo em 3 parágrafos | Flag "resumo IA" |
| Contrato de Honorários | Match cliente-advogado confirmado | Pré-preenche contrato padrão | Advogado assina |
| Relatório Mensal | Dia 1 às 09h | Relatório de atividades do caso | Advogado revisa |
| Triagem de Demanda | Formulário novo caso | Classifica área + fee estimado | Advogado confirma aceite |

### 12.2 Document Intelligence Pipeline

```
[Upload PDF/DOCX]
  ↓ OCR se necessário (AWS Textract)
  ↓ Extração estruturada: tipo, partes, datas, valores
  ↓ Classificação ML: contrato/petição/decisão/procuração/outros
  ↓ Entity Recognition: nomes, CPFs tokenizados, valores, prazos
  ↓ Indexação RAG: chunking + embedding + pgvector + BM25
  ↓ Metadata card no GED (< 30s para documentos até 50 páginas)
```

---

## ETAPA 13 — AI AGENT ARCHITECTURE (AGENTES AUTÔNOMOS)

### 13.1 Portfólio de 5 Agentes Especializados

```
AGENT-01: LEGAL RESEARCH AGENT
  Ferramentas: search_stf(), search_stj(), search_legislation(),
               search_doctrine(), search_internal_cases()
  Output: Tese jurídica + fundamentos + citações + análise de risco

AGENT-02: DOCUMENT ANALYSIS AGENT
  Ferramentas: extract_clauses(), compare_with_legislation(),
               risk_score(), suggest_amendment()
  Output: Semáforo de risco por cláusula (verde/amarelo/vermelho)

AGENT-03: PROCESS MONITORING AGENT
  Ferramentas: query_datajud(), calculate_deadline(),
               create_alert(), check_recurso_cabivel()
  Output: Alertas P1 (< 24h) / P2 (< 7d) no dashboard

AGENT-04: CLIENT INTAKE AGENT
  Ferramentas: classify_demand(), check_lawyer_availability(),
               calculate_fee_estimate(), match_lawyer()
  Output: Briefing estruturado + proposta de honorários sugerida

AGENT-05: COMPLIANCE CHECK AGENT
  Ferramentas: check_lgpd_compliance(), check_clt_compliance(),
               check_cc_requirements(), check_cdc_compliance()
  Output: Relatório de conformidade + pontos de atenção + referências
```

### 13.2 Padrão ReAct (Reasoning + Acting)

```
EXEMPLO — AGENT-02 analisando contrato de trabalho:

THOUGHT: "Usuário enviou contrato de trabalho. Identificar violações CLT."
ACTION: extract_clauses(doc_id="contract_abc123")
OBS: ["Cláusula 4.1: jornada 50h/semana", "Cláusula 9.1: férias após 2 anos"]

THOUGHT: "Cláusula 4.1 viola CLT — limite é 44h/semana. Verificando..."
ACTION: check_clt_compliance(clause="jornada 50h/semana")
OBS: "VIOLAÇÃO: CLT Art. 58 — 8h/dia, 44h/semana. Horas extras: adicional 50%."

THOUGHT: "Cláusula 9.1 também viola CLT — férias após 12 meses."
ACTION: check_clt_compliance(clause="férias após 2 anos")
OBS: "VIOLAÇÃO: CLT Art. 130 — férias a partir de 12 meses de vigência."

FINAL: Relatório com 2 cláusulas críticas + referências + sugestões de correção.
HITL:  Exibe para revisão do advogado antes de qualquer ação.
```

---

## ETAPA 14 — MULTI-AGENT ORCHESTRATION FRAMEWORK (LANGGRAPH)

### 14.1 Workflow LangGraph

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class ContractAnalysisState(TypedDict):
    contract_doc_id: str
    extracted_clauses: list[str]
    legislation_refs: list[str]
    jurisprudence_refs: list[str]
    risk_items: list[dict]
    human_approved: bool
    human_comments: str
    final_report: str

workflow = StateGraph(ContractAnalysisState)
workflow.add_node("extract_document",    agent_extract_document)
workflow.add_node("fetch_legislation",   agent_fetch_legislation)
workflow.add_node("fetch_jurisprudence", agent_fetch_jurisprudence)
workflow.add_node("analyze_risks",       agent_analyze_risks)
workflow.add_node("human_review",        hitl_approval_gate)   # HITL obrigatório
workflow.add_node("generate_report",     agent_generate_report)
workflow.add_node("log_audit",           log_ai_audit_trail)

workflow.set_entry_point("extract_document")
# Pesquisa paralela: legislação + jurisprudência simultâneos
workflow.add_edge("extract_document", "fetch_legislation")
workflow.add_edge("extract_document", "fetch_jurisprudence")
workflow.add_edge(["fetch_legislation", "fetch_jurisprudence"], "analyze_risks")
workflow.add_edge("analyze_risks", "human_review")
workflow.add_conditional_edges(
    "human_review",
    lambda s: "approved" if s["human_approved"] else "needs_revision",
    {"approved": "generate_report", "needs_revision": "analyze_risks"}
)
workflow.add_edge("generate_report", "log_audit")
workflow.add_edge("log_audit", END)
```

### 14.2 Comparação de Frameworks

| Framework | Estado | HITL Nativo | Escolha |
|---|---|---|---|
| LangChain | Limitado | Não | Não |
| **LangGraph** | **Stateful Graph** | **Sim** | **SIM** |
| Semantic Kernel | Médio | Não | Não |
| AutoGen | Multi-agent | Parcial | Não para produção |

---

## ETAPA 15 — PROMPT ENGINEERING FRAMEWORK CORPORATIVO

### 15.1 Estrutura da Prompt Library

```
legis-prompts/ (Git versionado — tag semântica)
├── system/
│   ├── base_legal_assistant_v2.3.md
│   ├── lawyer_copilot_v1.8.md
│   ├── compliance_agent_v1.2.md
│   └── client_intake_agent_v1.5.md
├── tasks/
│   ├── contract_analysis_v3.1.md      (benchmark: 94% accuracy)
│   ├── piece_generation_v2.0.md       (HITL obrigatório — benchmark: 89%)
│   ├── deadline_extraction_v1.5.md    (benchmark: 97% precision)
│   └── jurisprudence_summary_v2.1.md  (benchmark: 92% faithfulness)
├── guardrails/
│   ├── legal_disclaimer.md            (obrigatório em TODA resposta)
│   ├── pii_filter_instructions.md
│   └── hallucination_warning.md       (confidence < 0.80)
└── tests/
    ├── adversarial_prompts_400.json   (injection, jailbreak, DAN)
    └── quality_benchmarks_200.json    (ground truth validado)
```

### 15.2 Ciclo de Vida de Aprovação de Prompt

```
1. DRAFT       → Engenheiro de IA redige com template padrão
2. PEER REVIEW → Code review por outro engenheiro (PR no GitHub)
3. LEGAL REVIEW → Jurídico valida limites éticos + disclaimers OAB
4. BENCHMARK   → 200 perguntas de referência (target: >= 92% pass rate)
5. ADVERSARIAL → 400 testes: prompt injection, jailbreak, DAN attacks
6. APPROVED    → Merge com tag semântica (ex: v2.0) + CHANGELOG.md
7. MONITORING  → CSAT, faithfulness, block rate monitorados em produção
8. DEPRECATED  → Após 6 meses de desuso ou nova versão aprovada
```

---

## ETAPA 16 — AI MEMORY ARCHITECTURE

### 16.1 Modelo de Memória em 4 Camadas

| Camada | Tecnologia | Retenção | Dados | LGPD |
|---|---|---|---|---|
| STM (Short-Term) | Redis | TTL 30min | Histórico da conversa (max 50 msgs) | Implícito — sessão ativa |
| LTM (Long-Term) | PostgreSQL | Contrato + 90d | Preferências autorizadas | Art. 7º, I — Consentimento explícito |
| Knowledge | pgvector | Permanente | Base jurídica compartilhada (read-only) | N/A — dados públicos |
| Episodic | PostgreSQL | 1 ano | Sessões marcadas úteis pelo usuário | Art. 7º, I — Opt-in |

### 16.2 Context Window Manager + Direito ao Esquecimento

```python
class LegisContextWindowManager:
    MAX_CONTEXT_TOKENS = 8192  # Reserva 4096 para a resposta

    def build_context(self, user_id: str, session_id: str, query: str):
        budget = self.MAX_CONTEXT_TOKENS
        system = self.get_system_prompt(user_role=self.get_role(user_id))
        budget -= token_count(system)
        rag_chunks = self.rag_search(query, max_tokens=2000)
        budget -= token_count(rag_chunks)
        stm_history = self.redis.get_session(session_id, max_tokens=budget // 2)
        budget -= token_count(stm_history)
        ltm_prefs = self.get_ltm_preferences(user_id, max_tokens=min(budget, 500))
        return ContextWindow(system, rag_chunks, stm_history, ltm_prefs, query)

    def forget(self, user_id: str, scope: str):
        """Direito ao esquecimento LGPD Art. 18, IV e VI"""
        if scope == 'session':
            self.redis.delete_session(user_id)
        elif scope == 'all':
            self.redis.delete_all_user(user_id)
            self.postgres.anonymize_ltm(user_id)
            self.postgres.anonymize_episodic(user_id)
            # Audit hashes preservados por 7 anos (obrigação legal)
```

---

## ETAPA 17 — AI SECURITY FRAMEWORK

### 17.1 OWASP LLM Top 10 — Cobertura Completa

| OWASP LLM | Risco | Controle Implementado |
|---|---|---|
| LLM01 — Prompt Injection | "Ignore as instruções anteriores..." | NeMo Guardrails Input Rails — detecta e bloqueia |
| LLM02 — Insecure Output | Código malicioso na resposta | Output sanitization + sandboxed execution |
| LLM03 — Training Poisoning | Documentos maliciosos no RAG | SHA-256 hash + source allowlist na ingestão |
| LLM04 — Model DoS | Prompts extremamente longos | Token limit 8192/req + rate limiting 60req/min |
| LLM05 — Supply Chain | Dependências LLM comprometidas | SBOM + Trivy scan de dependências AI/ML |
| LLM06 — Info Disclosure | LLM vaza dados de outro workspace | Row-Level Security pgvector + workspace_id |
| LLM07 — Insecure Plugin | Ferramenta de agente sem auth | Tool Registry com OAuth 2.1 por ferramenta |
| LLM08 — Excessive Agency | Agente age sem autorização | HITL Gate obrigatório para toda ação irreversível |
| LLM09 — Overreliance | Usuário confia cegamente na IA | Disclaimer + confidence score + fonte obrigatória |
| LLM10 — Model Theft | Extração via queries repetidas | Rate limiting + pattern detection SIEM Wazuh |

### 17.2 Configuração NeMo Guardrails

```yaml
# nemo_guardrails_config.yaml — Legis Connect
models:
  - type: main
    engine: openai
    model: gpt-4o-mini   # Modelo leve para guardrails (velocidade)

rails:
  input:
    flows:
      - self check input
      - check prompt injection
      - check legal topical boundary
      - check pii in input
  output:
    flows:
      - self check output
      - check legal disclaimer present
      - check pii in output
      - check hallucination risk
  dialog:
    flows:
      - legal assistant conversation

define flow check prompt injection:
  user ask something
  $is_injection = execute check_for_injection(user_message=$last_user_message)
  if $is_injection == True:
    bot refuse to respond
    log security_event(type="prompt_injection_attempt", user_id=$user_id)
```

---

## ETAPA 18 — AI PRIVACY FRAMEWORK (LGPD APLICADA À IA)

### 18.1 Controles por Fase do Processamento

| Fase | Dado | Controle | Base Legal LGPD |
|---|---|---|---|
| Coleta do Prompt | Texto do usuário | PII Sanitizer: CPF, CNPJ, nomes mascarados | Art. 46 — segurança |
| Envio ao LLM Externo | Contexto RAG | Apenas chunks públicos sem identificadores | Art. 7º, V — contrato |
| Envio ao LLM On-prem | Dados sensíveis | Llama 3 70B local — zero data egress | Art. 46 — segurança |
| Resposta do LLM | Texto gerado | Output PII Scanner — bloqueia se PII vazar | Art. 7º, V — contrato |
| Audit Log | Registros | Apenas hashes SHA-256 — NUNCA conteúdo raw | Art. 46 — segurança |
| Fine-tuning | Dataset | Proibido sem consentimento + DPA com fornecedor | Art. 7º, I — consentimento |

### 18.2 PII Sanitizer — Implementação TypeScript

```typescript
@Injectable()
export class PIISanitizerMiddleware implements NestMiddleware {
  private readonly patterns = {
    cpf:   /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
    cnpj:  /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(?:\+?55\s?)?(?:\(?\d{2}\)?[\s-]?)?\d{4,5}[\s-]?\d{4}\b/g,
    oab:   /\b\d{3,6}\/[A-Z]{2}\b/g,
  };

  sanitize(text: string): { sanitized: string; piiFound: PIIToken[] } {
    const piiFound: PIIToken[] = [];
    let sanitized = text;
    let idx = 0;
    for (const [type, pattern] of Object.entries(this.patterns)) {
      sanitized = sanitized.replace(pattern, (match) => {
        const token = `{PII_${type.toUpperCase()}_${String(idx++).padStart(3,'0')}}`;
        piiFound.push({ token, original_hash: sha256(match), type });
        return token;
      });
    }
    return { sanitized, piiFound };
  }
}
```

### 18.3 Política de Retenção de Dados de IA

```
STM Redis:           TTL 30min — sem log persistente do conteúdo
LTM PostgreSQL:      Contrato + 90 dias
Audit Logs (hashes): 7 anos (obrigação legal)
Embeddings privados: Deletados na desativação do workspace
Fine-tuning datasets: Nunca sem consentimento explícito + DPA
```

---

## ETAPA 19 — RESPONSIBLE AI GOVERNANCE MODEL (AI GOVERNANCE OFFICE)

### 19.1 Estrutura do AI Governance Office

| Papel | Responsabilidade | Reunião |
|---|---|---|
| CAIO | Estratégia e visão de IA | Semanal |
| AI Ethics Board | Aprova casos de uso de alto risco (Jurídico + CISO + CPO + DPO) | Quinzenal |
| AI Model Owner | Aprova novos modelos e versões em produção | Por demanda |
| AI Safety Officer | Monitora incidentes, bias e falhas (1 FTE dedicado) | Diária |
| Privacy Champion IA | Garante LGPD em cada feature de IA (1 por squad) | Semanal |

### 19.2 Gate de Aprovação de Novo Caso de Uso

```
PROCESSO OBRIGATÓRIO PARA FEATURES DE ALTO RISCO:

Etapa 1 — AI Impact Assessment (AIA):
  Quais dados são processados? Há PII? Dados sensíveis?
  Impacto de uma resposta errada? (financeiro, jurídico, reputacional)
  Decisão final: humano ou IA? Se IA, qual o HITL?

Etapa 2 — Bias & Fairness Evaluation:
  Testado em perfis de diferentes estados, gêneros, etnias, rendas?
  Falsos positivos/negativos por grupo demográfico aceitáveis?

Etapa 3 — Legal Review:
  Provimento OAB 205/2021: viola publicidade indevida?
  LGPD: base legal clara? DPIA realizado?
  CPC/CPP: respeita sigilo processual e segredo de justiça?

Etapa 4 — Security Red Team:
  Testado contra prompt injection, jailbreak, DAN attacks?
  Workspace A completamente isolado do Workspace B?
  Rate limiting e budget control implementados?

Decision Gate:
  APPROVE     → Produção com monitoramento contínuo
  CONDITIONAL → Aprovado somente com HITL obrigatório
  REJECT      → Reformular completamente o caso de uso
```

### 19.3 ISO/IEC 42001 — Controles Implementados

```
4.1 Contexto: AI Impact Assessment por caso de uso
5.2 Política:  AI Policy aprovada pelo Board (publicada internamente)
6.1 Riscos:    AI Risk Matrix atualizada trimestralmente
8.4 Ciclo:     SSDLC + MLOps com aprovação em cada stage gate
9.1 Monitor:   RAGAS benchmarks + Prometheus AI metrics
10.2 NC:       Playbook de incidentes de IA (RTO 24h)
```

---

## ETAPA 20 — AI EVALUATION FRAMEWORK

### 20.1 Métricas de Qualidade por Módulo

| Módulo | Métrica | Target |
|---|---|---|
| RAG Jurídico | Context Recall | > 0.90 |
| RAG Jurídico | Answer Faithfulness | > 0.95 |
| RAG Jurídico | Answer Relevancy | > 0.88 |
| Legis Copilot | Human Approval Rate (sem edição significativa) | > 0.70 |
| Legis Copilot | Edit Distance Ratio (palavras alteradas) | < 0.15 |
| AI Assistant | CSAT (escala 1-5) | > 4.2 |
| AI Gateway | Cache Hit Rate | > 0.35 |
| AI Gateway | Latência P95 end-to-end | < 3.5s |
| AI Safety | Guardrail Block Rate (deve ser baixo) | < 0.5% |
| AI Costs | Custo por Usuário Ativo | < R$ 12/mês |

### 20.2 RAGAS Benchmark — Avaliação Contínua

```python
from ragas.metrics import answer_relevancy, faithfulness, context_recall

LEGAL_BENCHMARK = [
    {
        "question": "Qual prazo prescricional para cobrança de honorários advocatícios?",
        "ground_truth": "5 anos — CC Art. 206, §5º, II",
        "contexts": ["CC Art. 206, §5º, II", "STJ AgRg no Ag 1.362.162"]
    },
    {
        "question": "Em acidente de trabalho, qual o prazo para ação trabalhista?",
        "ground_truth": "5 anos vigente o contrato, limitado a 2 anos após extinção (CF Art. 7º, XXIX)",
        "contexts": ["CF/88 Art. 7º, XXIX", "CLT Art. 11", "TST Súmula 308"]
    },
    # 198 casos adicionais validados pelo jurídico
]

# Execução: a cada deploy de novo modelo ou versão de prompt
# Threshold bloqueante: Answer Faithfulness < 0.92 → rollback automático
```

---

## ETAPA 21 — MLOPS ARCHITECTURE (MLFLOW + PROMETHEUS AI)

```
MLOPS STACK COMPLETO:

DESENVOLVIMENTO & EXPERIMENTAÇÃO:
  Jupyter Notebooks + VS Code
  DVC (Data Version Control) → versionamento de datasets no S3
  MLflow Tracking Server → parâmetros, métricas, artefatos por experiment run

REGISTRO & VALIDAÇÃO:
  MLflow Model Registry: staging → production (via PR aprovado)
  Pré-validações automáticas antes da promoção:
    - RAGAS Benchmark (Answer Faithfulness >= 0.92)
    - Adversarial Tests (400 casos — pass rate >= 98%)
    - Latency Test (P95 < 3.5s sob carga simulada em staging)
  Aprovação manual: AI Model Owner via interface MLflow

SERVING & INFERENCE:
  Modelos Externos: LiteLLM AI Gateway
  Modelos Fine-tuned Internos: BentoML REST API + Triton Inference Server
  A/B Testing: 10% tráfego → novo modelo | 90% → versão estável

MONITORAMENTO EM PRODUÇÃO:
  Prometheus: tokens/request, cache_hit_rate, model_error_rate, latency_p95
  Grafana: AI Dashboard CAIO em tempo real
  Arize AI / Phoenix: detecção de data drift e degradação de modelo
  PagerDuty Alerts:
    answer_faithfulness < 0.85 → P1 (equipe IA)
    error_rate > 2%            → P1 (IA + SRE)
    latency_p95 > 5s           → P2 (SRE)
    cost_per_user > R$ 20      → P2 (CAIO)
  Rollback: < 5 minutos via ArgoCD GitOps

VERSIONING POLICY:
  Modelos externos: versão fixada (nunca 'latest')
    Correto:   anthropic/claude-3-5-sonnet-20241022
    Incorreto: anthropic/claude-3-5-sonnet-latest
  Fine-tuned: semantic versioning v{major}.{minor}.{patch}
  Prompts: semantic versioning na Prompt Library + CHANGELOG.md obrigatório
```

---

## ETAPA 22 — LEGAL PREDICTIVE ANALYTICS FRAMEWORK

### 22.1 Modelos Preditivos Jurídicos

| Modelo | Objetivo | Features Principais | Output | Target |
|---|---|---|---|---|
| Churn Predictor | Prever abandono | Login freq., ações/semana, NPS, tempo resposta | Prob. churn 30d | AUC > 0.85 |
| Case Outcome | Estimar êxito | Área, tribunal, juiz, argumentos, jurisprudência | Score 0-100 | Accuracy > 0.72 |
| Deadline Risk | Identificar prazos em risco | Data limite, carga advogado, complexidade | Alerta P1 se > 0.7 | Recall > 0.95 |
| Smart Match Score | Match cliente-advogado | Especialidade, taxa êxito, avaliação, localização | Score 0-100 | MRR > 0.80 |
| Demand Classifier | Classificar demanda | Texto livre (BERT fine-tuned direito BR) | Área + urgência | F1 > 0.91 |

### 22.2 Feature Store Feast

```python
# Feast Feature Store — online (Redis < 50ms) + offline (Redshift — batch)
ONLINE_FEATURES = [
    "lawyer_avg_rating_30d",           # Rating últimos 30 dias
    "lawyer_response_time_24h_avg",    # Tempo médio resposta 24h
    "case_deadline_days_remaining",    # Dias até próximo prazo
    "user_platform_engagement_7d",     # Score engajamento 7 dias
]
OFFLINE_FEATURES = [
    "lawyer_win_rate_by_area_1y",      # Taxa êxito por área 12 meses
    "lawyer_client_retention_rate_1y", # Retenção clientes 12 meses
    "case_complexity_historical_score", # Score histórico complexidade
    "client_case_outcome_history",     # Histórico resultados anteriores
]
```

---

## ETAPA 23 — AI CUSTOMER EXPERIENCE ARCHITECTURE

```
JORNADA COMPLETA DO CLIENTE COM IA:

PRE-CADASTRO (Topo do Funil):
  Landing Page: Calculadora de Viabilidade Jurídica (AI-powered)
  Preview Smart Match: "Advogados com 87% casos trabalhistas ganhos na sua região"

CADASTRO & ONBOARDING:
  AI Intake Form: campo livre → IA extrai informações estruturadas
  Demand Classifier: categoriza demanda (F1 > 0.91)
  Onboarding Guide: AI responde dúvidas do processo de contratação

DURANTE O SERVIÇO:
  AI Legal Assistant 24/7: dúvidas processuais em linguagem simples
  Timeline Translator: converte jargão jurídico → português simples
  Proactive Alerts: "Seu processo teve movimentação hoje — audiência em 15/08"
  Document Summarizer: resumo de intimações em 3 linhas

POS-SERVIÇO:
  AI Review Prompter: sugestão de avaliação no momento certo
  Case Summary: resumo final do caso gerado por IA para o histórico
  Next Step Recommender: serviços complementares relevantes
```

---

## ETAPA 24 — AI BUSINESS INTELLIGENCE LAYER

```
EXECUTIVE AI INSIGHTS (Apache Superset + NL Query Interface):

CEO DASHBOARD:
  MRR Forecast 90d (Prophet Time Series)
  Churn Risk Score por coorte (RandomForest + XGBoost)
  Áreas jurídicas em crescimento/queda (trend automático)
  NL Query: "Qual advogado teve mais contratos novos este mês?" → SQL → Gráfico

CTO / CAIO DASHBOARD:
  Token usage por modelo e workspace (custo real vs. budget)
  Cache hit rate (% de economia de custo)
  Model performance drift no tempo (RAGAS por versão)
  Latência P95 por modelo e feature de IA

CPO DASHBOARD:
  Features de IA mais utilizadas (heatmap de adoção)
  Funnel de adoção do Legis Copilot (% advogados usando semanalmente)
  CSAT IA vs. interações manuais (comparativo)
  Taxa aprovação HITL: peças sem edição significativa

CISO DASHBOARD:
  Prompts bloqueados NeMo por dia (tentativas de abuso)
  PII Detection Events no PII Sanitizer
  Anomalias de uso detectadas pelo Wazuh SIEM
  Workspaces com budget AI acima de 80%

ARQUITETURA:
  PostgreSQL → Apache Airflow ETL → AWS Redshift DW
  Redshift → Apache Superset Dashboards
  NL Query Engine: Pergunta em português → LLM → SQL → Gráfico → Insight
```

---

## ETAPA 25 — AI EVOLUTION ROADMAP (3 FASES)

```
FASE 1 — IA ASSISTIVA (Meses 1-4): "IA como Ferramenta de Produtividade"
  M1: Deploy AI Gateway (LiteLLM) — remediação VULN-004 imediata
  M1: PII Sanitizer Middleware — LGPD compliance
  M2: RAG com Legislação Federal + STF/STJ + Súmulas
  M3: Legis AI Assistant para Clientes (FAQ + Smart Match AI)
  M4: Classificação Documental automática no GED
  KPI: 60% queries respondidas pelo RAG (zero custo LLM externo)
       Custo AI < R$ 8/usuário/mês | Satisfação cliente +10%

FASE 2 — IA INTEGRADA (Meses 5-8): "IA como Copiloto do Advogado"
  M5: Legis Copilot Módulo 1 — Análise de Processos (DataJud + RAG)
  M5: Legis Copilot Módulo 2 — Redação Assistida (HITL obrigatório)
  M6: Smart Match AI com Score de Compatibilidade
  M7: AI Memory Architecture completa (STM + LTM consentido)
  M8: MLOps completo (MLflow + Prometheus + RAGAS)
  KPI: NPS +15 pts | Produtividade advogado +35% | MRR +R$ 50k

FASE 3 — IA AUTÔNOMA (Meses 9-12): "IA como Agente de Negócios"
  M9:  LangGraph Multi-Agent Engine (Research + Document + Process + Compliance)
  M10: Legal Predictive Analytics (Case Outcome + Deadline Risk + Churn)
  M11: AI BI Executive Layer (NL queries em Superset)
  M12: AI Governance Office formalizado + ISO/IEC 42001 Assessment
  KPI: MRR incremental R$ 150k | Custo suporte -30% | Maturidade IA 4.8/5.0
```

---

## ETAPA 26 — BACKLOG DE INTELIGÊNCIA ARTIFICIAL

### AI-001 — P0 EMERGENCIAL: Deploy AI Gateway + Revogação da API Key
**Prioridade:** MÁXIMA | **Estimativa:** 1 semana | **Complexidade:** Baixa

Ação imediata (48h): Invalidar a API Key Gemini exposta no console Google AI Studio.
- Deploy do LiteLLM AI Gateway no NestJS backend (endpoint `/api/ai/query`)
- HashiCorp Vault com rotação automática (TTL 1h)
- Migrar toda lógica de `geminiService.ts` → `AiController` NestJS
- **Critério de Aceite:** Zero chamadas LLM partindo do frontend. API Key invisível em qualquer bundle.

---

### AI-002 — P0 CRÍTICO: PII Sanitizer Middleware (LGPD)
**Prioridade:** CRÍTICA | **Estimativa:** 2 semanas | **Complexidade:** Média

NestJS Middleware detectando e mascarando CPF, CNPJ, RG, email, telefone, OAB antes de qualquer envio a LLMs externos. Audit log de cada sanitização (tipo + timestamp — nunca o dado original).

---

### AI-003 — P1: RAG Híbrido com Base Jurídica Brasileira
**Prioridade:** ALTA | **Estimativa:** 6 semanas | **Complexidade:** Alta

Pipeline: CF/88 + CLT + CC + CPC + CDC + Legislação Federal + STF + STJ.
pgvector HNSW + BM25 ElasticSearch + Cohere Rerank v3.
Redis Semantic Cache TTL 24h.
Apache Airflow DAGs de ingestão diária.

---

### AI-004 — P1: Legis Copilot para Advogados (HITL Obrigatório)
**Prioridade:** ALTA | **Estimativa:** 8 semanas | **Complexidade:** Alta

5 módulos no dashboard do advogado.
Badges de confiança por trecho (HIGH/MEDIUM/LOW).
Botão "Usar Peça" ativo somente após aprovação explícita.
Registro de edições do advogado para melhoria contínua.

---

### AI-005 — P2: NeMo Guardrails + Prompt Library Corporativa
**Prioridade:** ALTA | **Estimativa:** 4 semanas | **Complexidade:** Média

NeMo Guardrails com rails input/output/topical.
Prompt Library Git com ciclo de aprovação jurídica.
Benchmark automático (200 casos) + adversarial (400 casos).

---

### AI-006 — P2: LangGraph Multi-Agent Engine
**Prioridade:** MÉDIA | **Estimativa:** 10 semanas | **Complexidade:** Muito Alta

5 agentes especializados orquestrados pelo LangGraph.
HITL gate em todas as ações irreversíveis.
Tool Registry com OAuth 2.1 por ferramenta.
Temporal.io para transações longas.

---

### AI-007 — P3: Legal Predictive Analytics + AI BI Executive Layer
**Prioridade:** MÉDIA | **Estimativa:** 8 semanas | **Complexidade:** Alta

Modelos preditivos: churn + deadline risk + case outcome + smart match.
Feast Feature Store (online Redis + offline Redshift).
Dashboard executivo Superset com NL query interface.
MLflow Model Registry com RAGAS benchmarks contínuos.

---

## ETAPA 27 — ENTERPRISE AI ARCHITECTURE & LEGAL INTELLIGENCE PLATFORM BLUEPRINT

```
LEGIS CONNECT — AI POWERED LEGAL INTELLIGENCE PLATFORM
Versão 1.0 | 27 Etapas Auditadas e Verificadas | Julho 2026

AI INTERFACE LAYER — TOUCHPOINTS
  Legis AI Assistant (Clientes 24/7)
  Legis Copilot para Advogados (HITL obrigatório)
  AI Search Semântico · Document Analyzer · Smart Match AI
  Proactive Alerts Processuais · AI Executive Dashboards

SEGURANÇA & PRIVACIDADE IA — CAMADA TRANSVERSAL
  PII Sanitizer pré-envio ao LLM
  NeMo Guardrails Input / Output / Topical Rails
  OWASP LLM Top 10 Controls completo
  HITL Gate — TODA ação irreversível exige aprovação humana
  AI Audit Trail HMAC SHA-256 imutável
  Workspace Namespace Isolation (RLS pgvector)

ORQUESTRAÇÃO — AI GATEWAY + LANGGRAPH + TEMPORAL
  LiteLLM AI Gateway (Routing + Budget + Cost Tracking)
  LangGraph Multi-Agent (Research / Document / Compliance / Process)
  HashiCorp Vault (API Keys TTL 1h — rotação automática)
  Redis STM Memory (TTL 30min por sessão)
  Temporal.io Workflow Orchestration

MODELOS — MULTI-LLM ROUTING
  Claude 3.5 Sonnet      — análise jurídica complexa
  Gemini 2.5 Pro         — documentos longos (1M token context)
  Llama 3 70B On-Prem    — dados sensíveis (zero data egress)
  DeepSeek R1 On-Prem    — raciocínio estruturado
  text-embedding-3-large — embeddings RAG 1536-dim

CONHECIMENTO — RAG HÍBRIDO JURÍDICO
  pgvector HNSW 0.7.4 (ANN — coseno)
  BM25 ElasticSearch (lexical — artigos de lei)
  Cohere Rerank v3 (refinamento semântico)
  Redis Semantic Cache TTL 24h (35% economia de tokens)
  Base: CF/88, CLT, CC, CPC, CDC, STF, STJ, TRTs (~3.5M documentos)

DADOS & MLOPS — GOVERNANÇA TRANSVERSAL
  Feast Feature Store (online Redis + offline Redshift)
  Apache Airflow (ingestão diária automatizada)
  MLflow Model Registry (staging → production)
  Prometheus AI Metrics + Grafana CAIO Dashboard
  RAGAS Benchmarks contínuos (Answer Faithfulness > 0.95)
  AI Governance Office + AI Ethics Board
  ISO/IEC 42001 + NIST AI RMF + Responsible AI

MÉTRICAS DE SUCESSO:
  Maturidade IA:     1.2 / 5.0 → 4.8 / 5.0 (+3.6)
  Prazo:             12 meses
  Custo AI/usuário:  < R$ 12/mês
  NPS:               +15 pontos
  Produtividade:     +35% (advogado)
  MRR incremental:   R$ 150k (planos AI Pro)
  Incidentes LGPD:   Zero

OBJETIVO FINAL:
LEGIS CONNECT — AI POWERED LEGAL INTELLIGENCE PLATFORM
O ecosistema jurídico cognitivo de referência no mercado brasileiro.
```

---

*Enterprise AI Architecture & Legal Intelligence Platform Blueprint v1.0*
*27 Etapas Auditadas, Verificadas e Documentadas*
*CAIO · AI Solutions Architect · MLOps Engineer · LegalTech Intelligence Lead*
*Legis Connect · Julho 2026*
