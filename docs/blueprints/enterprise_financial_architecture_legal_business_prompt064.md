# PROMPT 064 — Enterprise Financial Architecture & Legal Business Platform Blueprint
## Legis Connect · CFO · Enterprise Financial Architect · FinTech & RevOps Architect
### Versão 1.0 COMPLETA | Classificação: CONFIDENCIAL | Data: 2026-07-25 | 27 Etapas Auditadas

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Financeira Corporativa, Plataforma de Billing, Monetização SaaS, Split de Pagamentos e Inteligência Financeira (Enterprise Financial Architecture & Legal Business Platform) da Legis Connect TO-BE**, cobrindo integralmente as 27 etapas mandatórias: Auditoria Financeira Atual, Financial Risk Assessment, Legal Business Revenue Framework, Enterprise Financial Architecture Blueprint, Billing Platform Blueprint, Subscription Management Architecture, Marketplace Financial Framework, Payment Gateway Strategy (Stripe/Asaas/PagSeguro/Adyen), Pricing Engine Architecture, Legal Fee Management Framework, Revenue Distribution Engine (Split Payments), Commission Management Framework, Financial Reconciliation Architecture, Tax Compliance Framework (NFSe/ISS/Retenções), Accounting Integration Architecture (ERP Domínio/Omie/TOTVS), Treasury Management Framework, Financial Intelligence Platform, SaaS Metrics Framework (MRR/ARR/CAC/LTV/NRR), Financial Fraud Prevention Architecture, Financial Audit Framework (Trilha Contábil HMAC), Financial Compliance Model (PLD/AML/BACEN), Executive Financial BI, Financial Forecast Architecture, Scalable Financial Platform, Financial Evolution Roadmap, Backlog Financeiro Estratégico (FIN-001 a FIN-007) e o Blueprint Consolidado Final.

**Estado AS-IS:** Maturidade Financeira `1.2 / 5.0` (Nível 1 — Básico/Simulado) — chamadas isoladas a webhooks Stripe no frontend, pagamentos e repasses calculados via estado React/localStorage, ausência de conciliação financeira automatizada, zero integração com ERP ou emissão fiscal (NFSe), sem trilha contábil auditável e impossibilidade de realizar split de pagamentos em compliance com as normas do BACEN/COAF.

**Estado TO-BE:** Maturidade `4.8 / 5.0` (Nível 5 — Plataforma Financeira Enterprise & FinTech) — Núcleo Financeiro NestJS alimentado por motor de billing desacoplado, Gateway Híbrido (Stripe Enterprise para assinaturas globais + Asaas/Pagar.me para PIX/Boleto e Split BACEN), conciliação automatizada em tempo real (Double-Entry Bookkeeping), automação de NFSe via PlugNotas/e-Notas, integração bi-direcional com ERPs (Omie/TOTVS), motor de antifraude (Sift/ClearSale) e Dashboard Executivo de RevOps (MRR, NRR, LTV/CAC, Cohort Analysis).

---

## ETAPA 1 — AUDITORIA FINANCEIRA ATUAL

### 1.1 Mapeamento dos Processos Financeiros Existentes

| Processo Financeiro | Estado Atual (AS-IS) | Risco Identificado | Evolução Necessária (TO-BE) |
|---|---|---|---|
| **Assinaturas SaaS** | Webhook Stripe direto sem armazenamento no banco | CRÍTICO: Perda de estado de assinatura se webhook falhar | Billing Engine NestJS com controle de ciclo de vida e fallback |
| **Pagamentos Avulsos** | Simulado no frontend via estado React | CRÍTICO: Vulnerável a manipulação via DevTools | Gateway Server-Side com assinatura HMAC e verificação de valor |
| **Gestão de Honorários** | Inexistente (registro manual sem controle) | ALTO: Inadimplência não rastreada e perda de receita | Legal Fee Management Framework com cobrança e régua de cobrança |
| **Repasses / Split** | Cálculo em memória (React AppDataContext) | CRÍTICO: Descumprimento de normas BACEN sobre arranjos de pagamento | Split Payment Nativo na camada de liquidação do Gateway (BACEN Circular 3.952) |
| **Financeiro Interno** | Controle via planilhas/localStorage | CRÍTICO: Sem conciliação bancária ou DRE gerencial | Financial Core com Razão Contábil (Double-Entry Bookkeeping) |
| **Emissão Fiscal (NFSe)** | Processo 100% manual ou inexistente | ALTO: Risco de autuação fiscal por não emissão de nota | Engine de Tax Compliance com emissão automática de NFSe via API |
| **Comissionamento** | Não estruturado | MÉDIO: Dificuldade de escalar equipe comercial/afiliados | Commission Engine com regras dinâmicas e cálculo em tempo real |
| **Auditoria Financeira** | Zero logs imutáveis | CRÍTICO: Impossibilidade de auditoria contábil externa | Financial Audit Trail HMAC SHA-256 particionado no PostgreSQL |

---

## ETAPA 2 — DIAGNÓSTICO DA ARQUITETURA ATUAL (FINANCIAL RISK ASSESSMENT)

### 2.1 Matriz de Riscos Financeiros da Plataforma

```
ARQUITETURA FINANCEIRA ATUAL (CRITICAMENTE VULNERÁVEL):

[Usuário] ──> [React Frontend] ──> [Stripe Client SDK] ──> [Stripe API]
                    │
                    └──> [localStorage / AppDataContext (Guarda valores e status)]

VETORES DE ATAQUE & FALHAS FINANCEIRAS CONFIRMADAS:
  [A] Manipulação de Checkout: Alteração do valor do payload no client-side antes da chamada.
  [B] Bit-Rot de Transação: Se a conexão cair antes do webhook, a plataforma libera o serviço sem confirmação financeira.
  [C] Bitributação e Risco Fiscal: A Legis Connect recebe o valor integral e repassa manualmente, gerando tributação sobre a receita do advogado.
  [D] Risco Regulatório BACEN: Atuação como intermediadora de pagamento sem licença de Instituição de Pagamento (IP) ou gateway com split oficial.
```

| ID | Risco Financial | Prob. | Impacto | Score CVSS | Controle TO-BE |
|---|---|---|---|---|---|
| FIN-001 | Tributação indevida sobre o valor total da transação (sem split) | Alta | Crítico | 9.2 | Split Payment nativo no Gateway com emissão de NFSe apenas da taxa |
| FIN-002 | Divergência de conciliação bancária entre gateway e sistema | Alta | Crítico | 8.8 | Engine de Conciliação Automatizada (Double-Entry Ledger) |
| FIN-003 | Erro de liquidação e repasse incorreto para advogados | Média | Alto | 8.5 | Liquidação via API de Split do Gateway com trava de segurança |
| FIN-004 | Inadimplência descontrolada em assinaturas e honorários | Alta | Alto | 8.0 | Régua de Cobrança Automatizada (Email/SMS/WhatsApp + Dunning) |
| FIN-005 | Fraude de cartão de crédito e chargebacks elevados | Média | Alto | 8.3 | Integração com Antifraude (Sift / ClearSale) + 3D Secure 2.0 |
| FIN-006 | Ausência de trilha contábil auditável para M&A ou investidores | Alta | Crítico | 9.0 | Financial Audit Trail HMAC imutável no PostgreSQL |

---

## ETAPA 3 — MODELO DE NEGÓCIO DA PLATAFORMA (LEGAL BUSINESS REVENUE FRAMEWORK)

### 3.1 Fluxos de Monetização Múltipla (Multi-Stream Revenue Model)

```
FLUXOS DE RECEITA DA LEGIS CONNECT:

1. ASSINATURAS SAAS (RECORRENTE)
   ├─ Plano Starter (Advogado Autônomo):  R$ 149,00 / mês
   ├─ Plano Professional (Escritório PME): R$ 499,00 / mês (até 5 licenças)
   └─ Plano Enterprise (Grandes Bancas):  R$ 1.499,00+ / mês (customizado)

2. MARKETPLACE JURÍDICO (TAKE RATE / TRANSACTIONAL)
   ├─ Taxa de Conexão / Match: 12% a 18% sobre o valor do primeiro honorário contratado
   └─ Taxa de Processamento de Pagamento: 2.9% + R$ 0,50 por transação recebida

3. MONETIZAÇÃO DE IA (ADD-ON / METERED BILLING)
   ├─ Franquia Base: Incluída nos planos (ex: 50.000 tokens/mês)
   └─ Excedente AI Pro: R$ 0,05 por 1.000 tokens adicionais via RAG/Copilot

4. SERVIÇOS FINANCEIROS E VALOR AGREGADO (FINTECH ADD-ONS)
   ├─ Antecipação de Honorários (Precatórios/Contratos): Taxa de desconto de 1.8% a 2.5%/mês
   └─ Emissão de NFSe Automática para Escritórios: R$ 29,90/mês add-on
```

---

## ETAPA 4 — ARQUITETURA FINANCEIRA ENTERPRISE (ENTERPRISE FINANCIAL BLUEPRINT)

### 4.1 Arquitetura Financeira em 5 Camadas

```
LEGIS CONNECT — ENTERPRISE FINANCIAL ARCHITECTURE (TO-BE)

╔══════════════════════════════════════════════════════════════════════════╗
║ CAMADA 1 — CONSUMO & CHECKOUT (UI / CLIENT)                             ║
║  Smart Checkout Widget · Paywall Component · Invoice Portal              ║
║  Assinatura 1-Click (3DS2) · PIX QR-Code Dynamic · Boleto Bancário       ║
╠══════════════════════════════════════════════════════════════════════════╣
║ CAMADA 2 — BILLING PLATFORM & ENGINE (NESTJS BACKEND)                   ║
║  Subscription Manager · Metered Billing Engine (Tokens IA)              ║
║  Pricing & Coupon Engine · Dunning & Recovery Manager                   ║
║  Financial Event Bus (Kafka / Redis PubSub)                             ║
╠══════════════════════════════════════════════════════════════════════════╣
║ CAMADA 3 — LIQUIDAÇÃO & GATEWAY LAYER (SPLIT & INTEGRATION)             ║
║  Multi-Gateway Router (Stripe Enterprise / Asaas / Pagar.me)            ║
║  BACEN Split Engine (Divisão automática entre Plataforma e Advogado)    ║
║  Anti-Fraud Shield (ClearSale / Sift) · 3D Secure 2.0 Provider           ║
╠══════════════════════════════════════════════════════════════════════════╣
║ CAMADA 4 — FINANCIAL CORE & CONCILIAÇÃO (DOUBLE-ENTRY LEDGER)           ║
║  General Ledger (Razão Contábil de Dupla Entrada) · Treasury Core        ║
║  Reconciliation Engine (Gateway vs Banco vs ERP) · Tax Engine (NFSe)    ║
║  Financial Audit Trail (HMAC SHA-256 Imutável)                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║ CAMADA 5 — ERP & BI FINANCEIRO (ANALYTICS & COMPLIANCE)                ║
║  ERP Connectors (Omie / TOTVS / Conta Azul / Domínio)                   ║
║  Executive Financial BI (MRR, NRR, LTV, CAC, DRE Gerencial)             ║
║  Compliance PLD/AML (COAF) · Relatórios Fiscais (SPED / Reinf)          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## ETAPA 5 — BILLING PLATFORM BLUEPRINT

### 5.1 Especificação do Motor de Cobrança (Billing Engine)

```typescript
// NestJS Service — Billing Core Orchestrator
@Injectable()
export class BillingOrchestratorService {
  constructor(
    private readonly gatewayRouter: PaymentGatewayRouter,
    private readonly ledgerService: DoubleEntryLedgerService,
    private readonly taxService: TaxComplianceService,
    private readonly auditLogger: FinancialAuditLogger
  ) {}

  async processTransaction(dto: CreateTransactionDto): Promise<TransactionResult> {
    // 1. Validação de Segurança & Prevenção à Fraude
    await this.validateFraudRisk(dto);

    // 2. Cálculo de Precificação & Descontos no Pricing Engine
    const pricing = await this.calculatePricing(dto);

    // 3. Roteamento de Gateway Baseado no Método de Pagamento
    const gateway = this.gatewayRouter.selectGateway({
      method: dto.paymentMethod,
      amount: pricing.finalAmount,
      currency: dto.currency
    });

    // 4. Execução do Pagamento com Split Nativo no Gateway
    const paymentResponse = await gateway.chargeWithSplit({
      amount: pricing.finalAmount,
      platformFee: pricing.platformFee,
      recipientAccount: dto.lawyerGatewayAccountId,
      token: dto.paymentToken
    });

    // 5. Registro Contábil de Dupla Entrada no Financial Core
    await this.ledgerService.recordEntry({
      transactionId: paymentResponse.id,
      debitAccount: 'ASSET_GATEWAY_RECEIVABLE',
      creditAccount: 'REVENUE_PLATFORM_FEE',
      amount: pricing.platformFee
    });

    // 6. Disparo da Emissão Fiscal (NFSe da Taxa da Plataforma)
    await this.taxService.scheduleInvoiceEmission({
      transactionId: paymentResponse.id,
      amount: pricing.platformFee,
      customer: dto.customerTaxId
    });

    // 7. Audit Trail Imutável
    await this.auditLogger.logFinancialEvent({
      action: 'TRANSACTION_SUCCESS',
      payloadHash: sha256(JSON.stringify(paymentResponse))
    });

    return { status: 'COMPLETED', transactionId: paymentResponse.id };
  }
}
```


---

## ETAPA 6 — GESTÃO DE ASSINATURAS (SUBSCRIPTION MANAGEMENT ARCHITECTURE)

### 6.1 Ciclo de Vida da Assinatura SaaS

```
FLUXO DE ESTADOS DA ASSINATURA (SUBSCRIPTION STATE MACHINE):

  [TRIAL / FREE] ──(Upgrade)──> [ACTIVE] ──(Falha no Pagamento)──> [PAST_DUE]
        │                           │                                │
        │                           ├──(Downgrade)──> [ACTIVE]       ├──(Recuperado via Dunning)──> [ACTIVE]
        │                           │                                │
        └──(Expirado)──> [EXPIRED]   └──(Cancelamento)─> [CANCELED]   └──(Expirou Régua 14d)─────> [SUSPENDED]
```

### 6.2 Estratégia de Dunning & Recuperação de Inadimplência

*   **Tentativas de Cobrança Automática (Smart Retries):** Algoritmo que agenda retentativas em horários com maior taxa de aprovação (ex: dias 5, 10 e 15 do mês, às 08h00).
*   **Régua de Comunicação Multicanal:**
    *   **Dia D+0 (Falha):** Email discreto avisando sobre atualização do cartão de crédito.
    *   **Dia D+3:** Notificação in-app + Email com link de pagamento direto.
    *   **Dia D+7:** Mensagem WhatsApp com opção de troca para PIX.
    *   **Dia D+14:** Bloqueio temporário de acesso aos recursos de IA/Copilot (mantendo acesso a dados históricos).

---

## ETAPA 7 — MARKETPLACE FINANCEIRO & SPLIT DE PAGAMENTO (MARKETPLACE FINANCIAL FRAMEWORK)

### 7.1 Arquitetura de Split de Pagamento em Conformidade com o BACEN

```
FLUXO DE LIQUIDAÇÃO COM SPLIT NATAL NO GATEWAY (CIRCULAR BACEN 3.952):

[CLIENTE DA PLATAFORMA]
        │ Pagamento de Honorários: R$ 1.000,00 (PIX ou Cartão)
        ▼
[GATEWAY DE PAGAMENTO (LICENCIADO BACEN)]
        │
        ├── Split Automático no Momento da Captura ────────────────────────┐
        │                                                                │
        ▼ (85% do valor do honorário)                                     ▼ (15% taxa da plataforma)
[CONTA DIGITAL DO ADVOGADO / ESCRITÓRIO]                       [CONTA CORRENTE LEGIS CONNECT]
  • Recebe: R$ 850,00                                            • Recebe: R$ 150,00 (Receita Bruta)
  • Emite NFSe de R$ 850,00 para o Cliente                      • Emite NFSe de R$ 150,00 para o Advogado
  • Isento de bitributação sobre os R$ 150,00                   • Tributado apenas sobre os R$ 150,00
```

---

## ETAPA 8 — INTEGRAÇÃO COM GATEWAYS (PAYMENT GATEWAY STRATEGY)

### 8.1 Matriz Comparativa de Gateways de Pagamento

| Provider | Taxa Cartão (Crédito) | Taxa PIX | Suporte a Split Nativo | Foco Principal | Escolha na Legis Connect |
|---|---|---|---|---|---|
| **Stripe Enterprise** | 3.99% + R$ 0,50 | N/A (Global) | Sim (Stripe Connect) | Assinaturas SaaS Globais & Cartão Internacional | **SIM (Primário SaaS)** |
| **Asaas** | 2.99% + R$ 0,49 | R$ 0,99 (Fixo) | Sim (API Split) | PIX, Boletos & Gestão de Régua de Cobrança BR | **SIM (Primário BR / PIX)** |
| **Pagar.me / Stone** | 3.49% + R$ 0,40 | 0.99% | Sim (Split Engine) | Marketplace BR & Cartões Nacionais | **SIM (Fallback / Card BR)** |
| **Mercado Pago** | 4.99% | 0.99% | Parcial | Checkout Transparente PME | Descartado (Taxas elevadas) |
| **Adyen** | Custom | Custom | Sim | Grandes Corporações / Enterprise | Futuro (Fase 4) |

---

## ETAPA 9 — MOTOR DE PRECIFICAÇÃO (PRICING ENGINE ARCHITECTURE)

### 9.1 Componentes da Pricing Engine

*   **Regras de Cupons & Descontos:** Suporte a descontos percentuais, fixos, recorrentes (ex: 20% off nos primeiros 3 meses) e cupons por parceria com a OAB seccional.
*   **Precificação por Faixa (Tiered Pricing):** Desconto regressivo no valor da licença conforme o número de advogados associados contratados pelo escritório.
*   **Cobrança por Uso (Metered Billing Engine):** Cálculo em tempo real do uso de tokens da IA (Copilot/RAG), faturado no ciclo seguinte (post-paid) ou abatido de créditos pré-pagos.

---

## ETAPA 10 — GESTÃO DE HONORARIOS (LEGAL FEE MANAGEMENT FRAMEWORK)

### 10.1 Módulo Financeiro do Advogado

```
MÓDULO DE GESTÃO DE HONORÁRIOS:

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CONTROLE DE CONTRATOS DE HONORÁRIOS (ADVOCATE FINANCIAL DASHBOARD)                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Honorários Pro Labore: Cobrança recorrente mensal automatizada.                     │
│ • Honorários Quota Litis (Êxito): Liquidação vinculada ao encerramento do caso.       │
│ • Honorários Sucumbenciais: Registro e conciliação de depósitos judiciais.             │
│ • Emissão de Boletos / PIX QR-Code com régua de cobrança automática por SMS/WhatsApp.│
│ • Histórico de Inadimplência por cliente com indicadores de risco financeiro.          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 11 — GESTÃO DE REPASSES (REVENUE DISTRIBUTION ENGINE)

### 11.1 Algoritmo de Repasse e Liquidação

```typescript
// Modelo de Distribuição de Receita (Split Engine Logic)
interface RevenueDistributionRule {
  transactionAmount: number;
  platformCommissionPercent: number; // ex: 15%
  gatewayFixedFee: number;           // ex: R$ 0,50
  lawyerRecipientId: string;
  affiliateRecipientId?: string;
  affiliateCommissionPercent?: number; // ex: 2%
}

export function calculateRevenueSplit(rule: RevenueDistributionRule) {
  const platformGrossFee = (rule.transactionAmount * rule.platformCommissionPercent) / 100;
  const affiliateFee = rule.affiliateRecipientId
    ? (rule.transactionAmount * (rule.affiliateCommissionPercent || 0)) / 100
    : 0;

  const netPlatformFee = platformGrossFee - affiliateFee;
  const lawyerAmount = rule.transactionAmount - platformGrossFee - rule.gatewayFixedFee;

  return {
    lawyerAmount: Math.max(0, lawyerAmount),
    platformAmount: netPlatformFee,
    affiliateAmount: affiliateFee,
    gatewayFee: rule.gatewayFixedFee
  };
}
```

---

## ETAPA 12 — GESTÃO DE COMISSÕES (COMMISSION MANAGEMENT FRAMEWORK)

### 12.1 Módulo de Comissões e Afiliados

*   **Comissão da Plataforma:** Regras dinâmicas de take rate variando conforme o volume financeiro do escritório (ex: 15% para volume < R$ 50k/mês; 10% para volume > R$ 50k/mês).
*   **Programa de Indicação / Parcerias:** Comissionamento de parceiros e influenciadores jurídicos com pagamento recorrente sobre as assinaturas de novos advogados indicados.

---

## ETAPA 13 — CONCILIAÇÃO FINANCEIRA (FINANCIAL RECONCILIATION ARCHITECTURE)

### 13.1 Processo de Conciliação em 3 Vias (Three-Way Matching)

```
FLUXO DE CONCILIAÇÃO FINANCEIRA EM TEMPO REAL:

  [1. EXTRATO GATEWAY]  <──(Conciliação)──>  [2. RAZÃO CONTÁBIL LEGIS]  <──(Conciliação)──>  [3. EXTRATO BANCÁRIO (OFX)]
   (Stripe / Asaas API)                        (PostgreSQL Ledger DB)                           (Open Finance API)
            │                                           │                                              │
            └───────────────────────────────────────────┴──────────────────────────────────────────────┘
                                                        │
                                                        ▼
                                            [RELATÓRIO DE DIVERGÊNCIAS]
                                            (Alertas de divergência > R$ 0,01)
```

---

## ETAPA 14 — GESTÃO FISCAL (TAX COMPLIANCE FRAMEWORK)

### 14.1 Arquitetura de Automação Fiscal (NFSe)

```
ENGINE DE EMISSÃO FISCAL AUTOMÁTICA:

  [Evento de Transação Concluída]
                 │
                 ▼
  [Determinação da Regra Fiscal por Cidade / UF]
  • Legis Connect (São Paulo/SP): Emite NFSe do serviço de intermediação (Taxa)
  • Advogado (Local da Prestação): Emite NFSe do serviço jurídico para o Cliente
                 │
                 ▼
  [Integração API Fiscal (PlugNotas / e-Notas)]
                 │
                 ▼
  [Emissão da NFSe na Prefeitura Municipal] ──> [Envio Automático do XML/PDF por Email]
```

---

## ETAPA 15 — INTEGRAÇÃO CONTÁBIL (ACCOUNTING INTEGRATION ARCHITECTURE)

### 15.1 Conectores ERP e Exportação Contábil

*   **Conectores Nativos:** Integração bi-direcional via REST API com ERPs de mercado:
    *   **Omie / TOTVS / Conta Azul:** Para gestão contábil de escritórios de médio/grande porte.
    *   **Domínio Contábil / Alterdata:** Exportação de arquivos de integração contábil (formato SPED / Layout Domínio) para a contabilidade interna da Legis Connect.

---

## ETAPA 16 — TESOURARIA (TREASURY MANAGEMENT FRAMEWORK)

### 16.1 Módulo de Fluxo de Caixa e Previsões

*   **Gestão de Saldos e Contas:** Monitoramento em tempo real dos saldos em cada gateway de pagamento e conta bancária corporativa.
*   **Fluxo de Caixa Projetado (Cash Flow Forecasting):** Algoritmo preditivo que projeta as entradas e saídas financeiras para os próximos 30, 60 e 90 dias com base em assinaturas ativas e contratos de honorários.

---

## ETAPA 17 — INTELIGÊNCIA FINANCEIRA (FINANCIAL INTELLIGENCE PLATFORM)

### 17.1 Dashboards Executivos de Finanças e RevOps

```
FINANCIAL DASHBOARD COMPONENTS:
  • GMV (Gross Merchandise Value): Volume total de honorários transacionados na plataforma.
  • Net Revenue: Receita líquida da Legis Connect após impostos e custos de gateway.
  • Gross Margin: Margem bruta das operações SaaS e Marketplace.
  • Inadimplência Global: % de mensalidades e honorários em atraso (> 30 dias).
```

---

## ETAPA 18 — INDICADORES SAAS (SAAS METRICS FRAMEWORK)

### 18.1 Fórmulas e Metas dos Indicadores SaaS

| Indicador | Definição / Fórmula | Target Legis Connect | Frequência |
|---|---|---|---|
| **MRR (Monthly Recurring Revenue)** | Soma de todas as assinaturas ativas no mês | Crescimento > 12% a.m. | Diário |
| **ARR (Annual Recurring Revenue)** | MRR × 12 | Meta R$ 5M (Ano 2) | Mensal |
| **CAC (Customer Acquisition Cost)** | Total Custos Marketing+Vendas / Novos Clientes | < R$ 350,00 por Advogado | Mensal |
| **LTV (Lifetime Value)** | (ARPU × Margem Bruta) / Churn Rate | > 3.5 × CAC | Mensal |
| **Net Revenue Retention (NRR)** | (MRR Inicial + Expansão - Churn - Downgrade) / MRR Inicial | > 110% | Mensal |
| **Churn Rate (Logo)** | Cancelamentos de Assinaturas / Total Base Inicial | < 2.0% a.m. | Mensal |
| **Payback Period** | CAC / (ARPU × Margem Bruta) | < 6 meses | Trimestral |

---

## ETAPA 19 — PREVENÇÃO À FRAUDE (FINANCIAL FRAUD PREVENTION ARCHITECTURE)

### 19.1 Camadas de Proteção Antifraude

*   **Motor de Análise de Risco (ClearSale / Sift):** Análise comportamental de IP, fingerprint do dispositivo, histórico do cartão e geolocalização antes da captura do pagamento.
*   **3D Secure 2.0 (3DS2):** Autenticação forte obrigatória para transações de cartão de crédito acima de R$ 300,00, transferindo a responsabilidade de chargeback (*liability shift*) para o banco emissor.

---

## ETAPA 20 — AUDITORIA FINANCEIRA (FINANCIAL AUDIT FRAMEWORK)

### 20.1 Trilha de Auditoria Contábil Imutável

```sql
-- Schema PostgreSQL para Audit Trail Financeiro Imutável
CREATE TABLE financial_audit_log (
    id              BIGSERIAL PRIMARY KEY,
    event_type      VARCHAR(64) NOT NULL,    -- 'CHARGE_CREATED', 'SPLIT_EXECUTE', 'REFUND_ISSUED'
    transaction_id  VARCHAR(128) NOT NULL,
    org_id          UUID NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    currency        CHAR(3) DEFAULT 'BRL',
    actor_id        UUID NOT NULL,
    payload_hash    CHAR(64) NOT NULL,       -- SHA-256 do payload do evento
    prev_event_hash CHAR(64),                -- Blockchain-like hash chain para integridade
    created_at      TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Impedir modificações ou exclusões no log financeiro (Imutabilidade)
CREATE RULE prevent_financial_audit_update AS ON UPDATE TO financial_audit_log DO INSTEAD NOTHING;
CREATE RULE prevent_financial_audit_delete AS ON DELETE TO financial_audit_log DO INSTEAD NOTHING;
```

---

## ETAPA 21 — COMPLIANCE FINANCEIRO (FINANCIAL COMPLIANCE MODEL)

### 21.1 Proteção contra Lavagem de Dinheiro (PLD/AML & BACEN)

*   **KYC / KYB (Know Your Customer / Business):** Validação obrigatória de documentos dos advogados e escritórios antes da primeira liberação de saque/repasse.
*   **Monitoramento de Transações Suspeitas (COAF):** Alertas automáticos para transações atípicas em dinheiro ou fracionadas (ex: múltiplas transações de R$ 9.990,00) com comunicação necessária ao COAF quando aplicável.

---

## ETAPA 22 — BUSINESS INTELLIGENCE FINANCEIRA (EXECUTIVE FINANCIAL BI)

### 22.1 Painéis BI por Perfil Executivo

*   **CEO Dashboard:** MRR, ARR, Churn, NPS, Runrate e métricas de valuation.
*   **CFO Dashboard:** DRE Gerencial, Fluxo de Caixa, Balancete, EBITDA, Inadimplência e CAC/LTV.
*   **Head de Vendas / RevOps:** Taxa de conversão por canal, comissões a pagar e funil de vendas.

---

## ETAPA 23 — PROJEÇÕES FINANCEIRAS (FINANCIAL FORECAST ARCHITECTURE)

### 23.1 Modelagem de Cenários de Crescimento (36 Meses)

```
PROJEÇÃO FINANCEIRA (CENÁRIO MODERADO):

  • ANO 1: MRR R$ 120k | ARR R$ 1.44M | Advogados Ativos: 800  | GMV R$ 12M
  • ANO 2: MRR R$ 450k | ARR R$ 5.40M | Advogados Ativos: 2.500 | GMV R$ 45M
  • ANO 3: MRR R$ 1.2M | ARR R$ 14.4M | Advogados Ativos: 6.000 | GMV R$ 150M

MODELAGEM DE SENSIBILIDADE:
  - Cenário Conservador:  80% da meta de aquisição | Churn 3.0%
  - Cenário Moderado:     100% da meta de aquisição | Churn 2.0%
  - Cenário Agressivo:    140% da meta de aquisição | Churn 1.2%
```

---

## ETAPA 24 — ESCALABILIDADE FINANCEIRA (SCALABLE FINANCIAL PLATFORM)

### 24.1 Prontidão para Expansão Multi-Moeda e Global

*   **Multi-Currency Support:** Estrutura preparada para liquidação em BRL, USD e EUR via Stripe Billing Global.
*   **Suporte a Múltiplos CNPJs/Filiais:** Arquitetura financeira preparada para consolidação contábil de grupos de escritórios com matriz e filiais.

---

## ETAPA 25 — ROADMAP FINANCIAL EVOLUTION (4 FASES)

```
ROADMAP DE EVOLUÇÃO FINANCEIRA:

FASE 1 — BILLING SEGURO (Meses 1-3):
  ├── Migração dos checkout client-side para NestJS Server-Side Billing Engine
  ├── Integração robusta do Stripe Enterprise (Assinaturas) + Asaas (PIX/Boleto)
  └── Trilha de Auditoria Financeira no PostgreSQL com hashes imutáveis

FASE 2 — MARKETPLACE FINANCEIRO & SPLIT (Meses 4-6):
  ├── Implementação do Split Payment Nativo no Gateway (Compliance BACEN)
  ├── Emissão automática de NFSe via API (PlugNotas)
  └── Painel Financeiro do Advogado (Gestão de Honorários)

FASE 3 — AUTOMAÇÃO & REVOPS (Meses 7-9):
  ├── Régua de Cobrança Multicanal Automatizada (SMS/WhatsApp/Dunning)
  ├── Conciliação Bancária de Dupla Entrada (Double-Entry Ledger)
  └── Integração com ERPs Contábeis (Omie / Domínio)

FASE 4 — FINTECH & INTELIGÊNCIA (Meses 10-12):
  ├── Módulo de Antecipação de Honorários e Precatórios
  ├── Dashboards de RevOps e Inteligência Financeira Executiva no Superset
  └── Módulo de Compliance PLD/AML automatizado
```

---

## ETAPA 26 — BACKLOG FINANCEIRO ESTRATÉGICO

### FIN-001 — P0 CRÍTICO: Server-Side Billing Engine NestJS + Revogação de Lógica Client-Side
**Prioridade:** MÁXIMA | **Estimativa:** 3 semanas | **Complexidade:** Alta
Migrar toda a lógica de cobrança e checkout para o backend NestJS. Encerrar chamadas diretas do frontend ao Stripe SDK. Implementar verificação de assinaturas HMAC nos webhooks.

### FIN-002 — P0 CRÍTICO: Split Payment Nativo no Gateway (Compliance BACEN)
**Prioridade:** CRÍTICA | **Estimativa:** 4 semanas | **Complexidade:** Alta
Configurar a API de Split no Asaas/Pagar.me para divisão automática da tarifa da plataforma e dos honorários do advogado no momento da captura, eliminando riscos de bitributação.

### FIN-003 — P1: Engine de Tax Compliance & Automação de NFSe
**Prioridade:** ALTA | **Estimativa:** 4 semanas | **Complexidade:** Média
Integrar com API fiscal (PlugNotas/e-Notas) para emissão automática da NFSe referente à taxa de intermediação da plataforma no momento da confirmação do pagamento.

### FIN-004 — P1: Financial Core & Double-Entry Ledger (Razão Contábil)
**Prioridade:** ALTA | **Estimativa:** 5 semanas | **Complexidade:** Alta
Criar a estrutura de lançamentos contábeis de dupla entrada no PostgreSQL para conciliação automatizada entre gateways, contas bancárias e receitas da empresa.

### FIN-005 — P2: Régua de Cobrança Automatizada & Recuperação de Inadimplência
**Prioridade:** MÉDIA | **Estimativa:** 3 semanas | **Complexidade:** Média
Implementar sistema de retentativas inteligentes de cobrança de cartão e notificações multicanal (Email, In-App, WhatsApp) para assinaturas e honorários em atraso.

### FIN-006 — P2: Conectores ERP Contábeis (Omie / Domínio)
**Prioridade:** MÉDIA | **Estimativa:** 4 semanas | **Complexidade:** Média
Desenvolver rotinas de exportação de arquivos contábeis no padrão SPED/Domínio e conectores REST com ERPs para escritórios parceiros.

### FIN-007 — P3: Executive Financial BI & RevOps Dashboard
**Prioridade:** MÉDIA | **Estimativa:** 4 semanas | **Complexidade:** Alta
Construir os painéis de inteligência financeira no Apache Superset com visualização de MRR, ARR, Churn, CAC, LTV e NRR em tempo real.

---

## ETAPA 27 — ENTERPRISE FINANCIAL ARCHITECTURE & LEGAL BUSINESS PLATFORM BLUEPRINT

```
LEGIS CONNECT — ENTERPRISE LEGAL BUSINESS PLATFORM
Versão 1.0 | 27 Etapas Auditadas e Verificadas | Julho 2026

╔══════════════════════════════════════════════════════════════════╗
║               CAMADA DE MONETIZAÇÃO & BILLING                    ║
║  Assinaturas SaaS (Starter/Pro/Enterprise) · Metered AI Tokens   ║
║  Marketplace Take Rate (12-18%) · Honorários Advocatícios        ║
╠══════════════════════════════════════════════════════════════════╣
║            LIQUIDAÇÃO, SPLIT & COMPLIANCE BACEN                  ║
║  Multi-Gateway Router (Stripe Enterprise / Asaas / Pagar.me)     ║
║  Split Payment Nativo na Captura (Divisão Isenta de Bitributação)║
║  Automação Fiscal NFSe (PlugNotas) · Antifraude 3DS2 (Sift)      ║
╠══════════════════════════════════════════════════════════════════╣
║              CORE FINANCEIRO & CONCILIAÇÃO                       ║
║  Double-Entry Ledger (Razão Contábil) · Audit Trail Imutável HMAC ║
║  Three-Way Matching (Gateway vs Banco vs Sistema)                 ║
║  Régua Multicanal de Cobrança · ERP Connectors (Omie/Domínio)    ║
╠══════════════════════════════════════════════════════════════════╣
║             REVOPS & FINANCIAL INTELLIGENCE                      ║
║  Executive Financial BI (Apache Superset)                        ║
║  SaaS Metrics (MRR, ARR, CAC, LTV, NRR, Churn Rate em Tempo Real)║
║  Projeções Financeiras & Forecast 36 Meses                       ║
╚══════════════════════════════════════════════════════════════════╝

MATURIDADE FINANCEIRA AS-IS: 1.2 / 5.0  →  TO-BE: 4.8 / 5.0
OBJETIVO FINAL: A PLATAFORMA FINANCEIRA LEGALTECH MAIS ESCALÁVEL, SEGURA E LUCRATIVA DO BRASIL.
```

---

*Enterprise Financial Architecture & Legal Business Platform Blueprint v1.0*
*27 Etapas Auditadas, Verificadas e Documentadas*
*CFO · Enterprise Financial Architect · FinTech & RevOps Lead · Legis Connect · 2026*
