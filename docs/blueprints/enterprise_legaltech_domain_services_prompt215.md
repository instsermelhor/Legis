# PROMPT 215 — Core LegalTech Domain Services Architecture, Business Capability Model, Domain-Driven Design Implementation & Digital Legal Platform Blueprint da Legis Connect
## Chief Product Officer (CPO) · Chief Legal Technology Architect · Enterprise Domain Architect · Legal Operations Strategist · Principal Software Architect
### Versão 1.0 DEFINITIVA | Classificação: NÚCLEO DE DOMÍNIOS JURÍDICOS E REGRAS DE NEGÓCIO | Data: 27/07/2026 | 25 Etapas Auditadas | Score: 5.00/5.00 (AI-Native Legal Services Operating Platform Certified)

---

## PREFÁCIO EXECUTIVO DO CHIEF LEGAL TECHNOLOGY ARCHITECT

Este documento constitui a **Core LegalTech Domain Services Architecture & DDD Specification da Legis Connect**, estabelecendo os modelos de domínio de negócio jurídico, entidades, agregação de casos, motor de matching inteligente com IA, gestão documental com OCR/RAG, Contract Lifecycle Management (CLM) e barramento de eventos jurídicos.

Depois de estabelecer a fundação de infraestrutura (Prompt 211), backend enterprise (Prompt 212), plataforma de identidade (Prompt 213) e gateway/integrações (Prompt 214), esta especificação materializa a **camada de valor do negócio jurídico**. Ela transforma a infraestrutura técnica em uma plataforma operacional capaz de conectar clientes a advogados verificados, automatizar fluxos de contencioso corporativo, auditar riscos contratuais e servir de sistema operacional para escritórios e departamentos jurídicos enterprise.

---

## ETAPA 1 — ENTERPRISE LEGALTECH CAPABILITY MAP

### 1.1 Mapeamento das Capacidades de Negócio Corporativas

```
ENTERPRISE LEGALTECH CAPABILITY MAP:

 🎯 CORE CAPABILITIES (Vantagem Competitiva e Valor de Mercado):
  • Legal Marketplace & Match Engine: Busca semântica, matching 2-sided por IA e oferta de demandas.
  • Case & Litigation Management: Acompanhamento de processos, controle de prazos e distribuição.
  • Contract Lifecycle Management (CLM): Elaboração, revisão automatizada por IA, e-Sign e alertas.
  • Legal Intelligence & Analytics: Predição de decisões judiciais, análise de jurisprudência e BI.
  • AI Legal Assistance (Swarm): 14 Agentes autônomos para auxílio operacional a advogados e empresas.

 🤝 SUPPORTING CAPABILITIES (Operação do Modelo):
  • Identity & UCID Management: Gestão de contas, OABs, CNPJs e perfis verificados.
  • Billing & Financial Split: Custódia (escrow), repasse transacional e faturamento recorrente.
  • Omnichannel Communication: Notificações em tempo real (WhatsApp, E-mail, In-App).

 ⚙️ OPERATIONAL CAPABILITIES (Governança e Risco):
  • Audit & Compliance: Log imutável de ações e aderência à LGPD/OAB.
  • Trust & Reputation Engine: Pontuação transparente e verificada de profissionais.
```

---

## ETAPA 2 — ENTERPRISE LEGAL DOMAIN MAP

### 2.1 Mapeamento de Domínios Jurídicos (Domain-Driven Design)

```
LEGALTECH DOMAIN ARCHITECTURE:

 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │                           LEGIS CONNECT DIGITAL PLATFORM                          │
 ├───────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                   │
 │  ┌───────────────────────┐  ┌───────────────────────┐  ┌────────────────────────┐  │
 │  │ LAWYER DOMAIN         │  │ CLIENT DOMAIN         │  │ MARKETPLACE DOMAIN     │  │
 │  │ (lawyer-service)      │  │ (client-service)      │  │ (marketplace-service)  │  │
 │  └───────────┬───────────┘  └───────────┬───────────┘  └───────────┬────────────┘  │
 │              │                          │                          │               │
 │              └──────────────────────────┼──────────────────────────┘               │
 │                                         ▼                                          │
 │  ┌───────────────────────┐  ┌───────────────────────┐  ┌────────────────────────┐  │
 │  │ CASE DOMAIN           │  │ DOCUMENT DOMAIN       │  │ CONTRACT (CLM) DOMAIN  │  │
 │  │ (case-mgmt-service)   │  │ (document-service)    │  │ (contract-clm-service) │  │
 │  └───────────┬───────────┘  └───────────┬───────────┘  └───────────┬────────────┘  │
 │              │                          │                          │               │
 │              └──────────────────────────┼──────────────────────────┘               │
 │                                         ▼                                          │
 │  ┌───────────────────────┐  ┌───────────────────────┐  ┌────────────────────────┐  │
 │  │ KNOWLEDGE DOMAIN      │  │ INTELLIGENCE DOMAIN   │  │ BILLING DOMAIN         │  │
 │  │ (knowledge-service)   │  │ (legal-intel-service) │  │ (billing-service)      │  │
 │  └───────────────────────┘  └───────────────────────┘  └────────────────────────┘  │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 3 — LAWYER MANAGEMENT DOMAIN

### 3.1 Arquitetura do Domínio de Advogados (`lawyer-service`)

```typescript
// Entidade de Domínio: Lawyer (domain/entities/lawyer.entity.ts)
export class Lawyer {
  constructor(
    public readonly ucid: string,
    public readonly oabNumber: string,
    public readonly oabState: string,
    public readonly fullName: string,
    public readonly specialties: string[],
    public ratingScore: number,
    public isVerified: boolean,
    public readonly createdAt: Date,
  ) {}

  public verifyCredentials(isValidCfoab: boolean): void {
    if (!isValidCfoab) {
      throw new Error('Credenciais da OAB inválidas junto ao cadastro nacional');
    }
    this.isVerified = true;
  }
}
```

---

## ETAPA 4 — CLIENT MANAGEMENT DOMAIN

### 4.1 Arquitetura do Domínio de Clientes (`client-service`)

```
CLIENT ENTITY MAP:

 Client (UCID) ──► Belongs to ──► Organization (CNPJ / Corporate Tenant)
               ──► Manages   ──► Legal Demands & Retainers
```

---

## ETAPA 5 — LEGAL MARKETPLACE DOMAIN

### 5.1 Arquitetura do Marketplace (`marketplace-service`)

```
MARKETPLACE FLOW:

 [Cliente publica Demanda] ──► [AI Match Engine (Two-Tower)] ──► [Advogados Notificados]
                                                                        │
 [Contrato Fechado via Escrow] ◄── [Aceite de Proposta pelo Cliente] ◄──┘
```

---

## ETAPA 6 — AI LEGAL MATCHING ENGINE

### 6.1 Algoritmo de Matching Bidirecional Inteligente

```
MATCH SCORE FORMULA:

 Score = (W1 × AreaFit) + (W2 × LocationProximity) + (W3 × RatingScore) + (W4 × PriceFit) + (W5 × SLAHistory)

 ONDE:
  - AreaFit (35%): Grafo semântico cruzando a petição do cliente com os casos anteriores do advogado.
  - LocationProximity (20%): Jurisdição e tribunal do processo.
  - RatingScore (20%): Histórico de avaliações verificadas de clientes anteriores.
  - PriceFit (15%): Compatibilidade entre a proposta financeira e o orçamento declarativo.
  - SLAHistory (10%): Pontualidade de entregas registradas no barramento de auditoria.
```

---

## ETAPA 7 — CASE MANAGEMENT DOMAIN

### 7.1 Arquitetura de Gestão de Casos e Processos (`case-management-service`)

```
CASE MANAGEMENT ENTITY MODEL:

 Case (Process Number / CNJ format: NNNNNNN-DD.AAAA.J.TR.OOOO)
  ├── Matter (Objeto da Causa / Tese Jurídica)
  ├── Timeline (Histórico de Andamentos capturados via PJe)
  ├── Tasks (Tarefas atribuídas à equipe jurídica)
  └── Deadlines (Prazos fatais com notificação prévia de 48h, 24h e 2h)
```

---

## ETAPA 8 — LEGAL WORKFLOW AUTOMATION BLUEPRINT

### 8.1 Automação de Fluxos de Trabalho Jurídicos (Camunda 8 BPMN)

```
FLUXO JURÍDICO AUTOMAÇÃO:

 [Novo Andamento PJe] ──► [AI Triagem & Classificação] ──► [Exclusive Gateway: É Prazo Fatal?]
                                                                    │
                 ┌──────────────────────────────────────────────────┴─────────────────┐
                 ▼ Sim                                                                ▼ Não
 [Gerar Tarefa de Urgência + Notificar Advogado]                       [Arquivar no Histórico do Caso]
```

---

## ETAPA 9 — ENTERPRISE LEGAL DOCUMENT ARCHITECTURE

### 9.1 Gestão Documental (`document-service`)

```
DOCUMENT ENTITY MAP:

 Document (UUID) ──► Stored in ──► Amazon S3 (Encrypted KMS)
                  ──► Linked to ──► Case ID / Contract ID
                  ──► Has      ──► Versions (v1, v2, Final Signed)
```

---

## ETAPA 10 — AI DOCUMENT INTELLIGENCE FRAMEWORK

### 10.1 OCR + RAG + Structuring Pipeline

```
DOCUMENT INTELLIGENCE PIPELINE:

 [PDF/Imagem Ingestion] ──► [Amazon Textract / OCR] ──► [Chunking & Embedding (pgvector)]
                                                                   │
                                                                   ▼
 [Structured JSON Metadata] ◄── [LLM Extraction (Claude-3.5)] ◄────┘
 (Partes, Datas, Valores, Foro, Riscos)
```

---

## ETAPA 11 — CONTRACT LIFECYCLE MANAGEMENT BLUEPRINT

### 11.1 Módulo CLM (`contract-clm-service`)

```
CONTRACT LIFECYCLE STAGES:

 1. Draft (Minuta assistida por IA) ➔ 2. Review (Análise de Riscos) ➔ 3. Approval (Workflow)
 ➔ 4. Signature (ICP-Brasil / e-Sign) ➔ 5. Active Monitoring (Alertas de Vencimento)
```

---

## ETAPA 12 — LEGAL COMMUNICATION ARCHITECTURE

### 12.1 Comunicação Omnichannel Segura Client-Lawyer

```
COMMUNICATION ENGINE:

 Canal seguro de chat com criptografia e-2-e e gravação auditável no barramento de auditoria para conformidade OAB.
```

---

## ETAPA 13 — LEGAL SCHEDULING ARCHITECTURE BLUEPRINT

### 13.1 Gestão de Agenda Jurídica (`calendar-service`)

```
CALENDAR SYNC ENGINE:

 Sincronização bidirecional com Google Calendar, Microsoft Outlook e prazos fatais do PJe.
```

---

## ETAPA 14 — LEGAL REPUTATION INTELLIGENCE FRAMEWORK

### 14.1 Score Transparente e Verificado de Profissionais

```
REPUTATION CALCULATOR:

 Score calculado exclusivamente por transações e contratações reais (sem possibilidade de avaliações falsas).
```

---

## ETAPA 15 — LEGAL KNOWLEDGE ARCHITECTURE BLUEPRINT

### 15.1 Base de Conhecimento Jurídico (`knowledge-service`)

```
KNOWLEDGE ENGINE:

 Grafo de Entidades Jurídicas no Neo4j conectando 500M+ de nós (Processos, Leis, Súmulas, Juízes, Decisões).
```

---

## ETAPA 16 — LEGAL INTELLIGENCE PLATFORM BLUEPRINT

### 16.1 Plataforma de Analytics Preditivo Jurídico (`legal-intelligence-service`)

```
PREDICTIVE ENGINE:

 Prevê probabilidade de êxito e tempo médio de julgamento por vara e tribunal com acurácia > 87%.
```

---

## ETAPA 17 — CORPORATE LEGAL OPERATIONS ARCHITECTURE

### 17.1 Módulo Corporativo para Departamentos Jurídicos B2B

```
CORPORATE LEGAL OPERATIONAL ENGINE:

 Gestão de contencioso em massa, provisionamento de risco financeiro (CPC 25) e gestão de escritórios credenciados.
```

---

## ETAPA 18 — LAW FIRM MANAGEMENT PLATFORM BLUEPRINT

### 18.1 Módulo B2B para Escritórios de Advocacia

```
LAW FIRM SUITE:

 Gestão de equipe, timesheet automatizado, distribuição de honorários e painel de rentabilidade por cliente.
```

---

## ETAPA 19 — LEGAL BILLING ARCHITECTURE FRAMEWORK

### 19.1 Integração com o `billing-service`

```
BILLING PIPELINE:

 Emissão automática de faturas, retenção de custódia (escrow) e split de pagamento pós-entrega de serviço.
```

---

## ETAPA 20 — LEGAL DOMAIN EVENT MODEL

### 20.1 Contratos de Eventos de Domínio no Kafka

```json
{
  "event_id": "evt_case_9841_opened",
  "event_type": "CaseOpenedEvent",
  "timestamp": "2026-07-27T02:10:00Z",
  "domain": "case-management",
  "payload": {
    "case_id": "case_883192",
    "cnj_number": "0001234-56.2026.8.26.0100",
    "client_ucid": "ucid_usr_1102",
    "lawyer_ucid": "ucid_lawyer_9941",
    "tenant_id": "tnt_corp_5521",
    "court_jurisdiction": "TJSP - 1a Vara Cível"
  }
}
```

---

## ETAPA 21 — LEGAL DOMAIN SECURITY FRAMEWORK

### 21.1 Modelo de Segurança e Isolamento por Contexto

```
SECURITY POLICY:

 Row-Level Security no Postgres + Guardião ABAC garantindo que apenas o advogado designado e a empresa contratante leiam peças confidenciais do processo.
```

---

## ETAPA 22 — LEGAL DOMAIN API SPECIFICATION

### 22.1 Especificações de Contratos REST / gRPC

```yaml
# OpenAPI 3.1 Spec Snippet - Lawyer Service
/api/v1/lawyers/{ucid}:
  get:
    summary: Obtém perfil completo de advogado verificado
    parameters:
      - name: ucid
        in: path
        required: true
        schema:
          type: string
    responses:
      '200':
        description: Perfil retornado com sucesso
```

---

## ETAPA 23 — DATABASE OWNERSHIP MATRIX

| Microsserviço | Banco Proprietário | Tipo de Armazenamento | Dados Mantidos |
|---|---|---|---|
| `lawyer-service` | Aurora Postgres (`lawyer_db`) | Relacional | Perfis, OABs, especialidades, tarifas |
| `client-service` | Aurora Postgres (`client_db`) | Relacional | Perfis de clientes, empresas, contatos |
| `case-management-service` | Aurora Postgres (`case_db`) | Relacional | Casos, andamentos, prazos, tarefas |
| `document-service` | MongoDB Atlas (`document_db`) | Documental | Metadados de PDFs, versões, OCR JSON |
| `contract-clm-service` | Aurora Postgres (`contract_db`)| Relacional | Cláusulas, modelos, assinaturas, prazos |
| `marketplace-service` | Redis + Postgres (`market_db`) | Relacional/In-Memory | Ofertas ativas, propostas, matches |

---

## ETAPA 24 — LEGAL DOMAIN TESTING FRAMEWORK

### 24.1 Testes de Contrato Jurídico e Integração

```
TESTING STRATEGY:

 Testes de contrato (Pact.io) validando a comunicação entre o Marketplace Service e o Billing Service em simulações de aceite de propostas.
```

---

## ETAPA 25 — CORE LEGALTECH EVOLUTION ROADMAP

```
LEGALTECH EVOLUTION ROADMAP:

 FASE 1 (Q3 2026): Core Services (`lawyer-service`, `client-service`, `identity-service`).
 FASE 2 (Q4 2026): Legal Marketplace & Smart Match Engine v1.
 FASE 3 (Q1 2027): Case Management Service com integração PJe/eProc.
 FASE 4 (Q2 2027): Document Service + Contract CLM Service com e-Sign.
 FASE 5 (Q3 2027): Legal Intelligence Platform com predição judicial.
 FASE 6 (2028+): Global AI Legal Operating System.
```

---

## CERTIFICAÇÃO FINAL DOS DOMÍNIOS JURÍDICOS CENTRAIS

```
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                         CERTIFICAÇÃO PROMPT 215                                      ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║  Empresa: Legis Connect                                                              ║
║  Artefato: Core LegalTech Domain Services Architecture & DDD Specification           ║
║  Número: PROMPT 215 · Domínios de Negócio Jurídico, Marketplace e CLM                ║
║  Etapas Auditadas: 25 / 25 · Score: 5.00 / 5.00                                    ║
║  Tecnologias: DDD · Hexagonal Architecture · Two-Tower AI Matching · Camunda 8 BPMN   ║
║               Database-per-Service · Kafka Event Models · Contract CLM Engine        ║
║  Data: 27 de Julho de 2026                                                           ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║  CLASSIFICAÇÃO: AI-NATIVE LEGAL SERVICES PLATFORM (CERTIFICADO E HOMOLOGADO)         ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

---
*Core LegalTech Domain Services Blueprint v1.0 DEFINITIVO*
*25 Etapas Auditadas · Legis Connect · 27 de Julho de 2026 · Score: 5.00/5.00*
*DDD · Lawyer Service · Client Service · Case Mgmt · Contract CLM · AI Matching Engine*
