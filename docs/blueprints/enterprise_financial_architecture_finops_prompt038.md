# PROMPT 038 — Enterprise Financial Architecture & FinOps Blueprint
## Legis Connect · Chief Financial Officer (CFO) · Enterprise Financial Architect · FinOps Lead
### Versão 1.0 | Classificação: CONFIDENCIAL | Data: 2026-07-25

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Financeira Corporativa e FinOps da Legis Connect TO-BE**, consolidando 25 domínios estratégicos de gestão de receita SaaS, faturamento recorrente, split payment para marketplace jurídico, controladoria digital, conformidade tributária e contábil (IFRS / CPC 47), antifraude, Cloud FinOps e inteligência econômica preditiva.

**Estado AS-IS:** Maturidade Financeira `1.4 / 5.0` (Fragmentada) — cobrança manual de faturas, ausência de split payment automatizado no marketplace, reconciliação bancária via planilhas, sem visibilidade do custo de infraestrutura por tenant/IA e sem automação de dunning/recuperação de inadimplência.

**Estado TO-BE:** Maturidade Financeira `4.9 / 5.0` (Enterprise Financial Ecosystem) — Billing Engine automatizado (Stripe Billing / Pagar.me), Split Payment em Conta de Garantia (Escrow), Carteira Digital (Wallet), Conciliação Financeira Real-Time, Cloud & AI FinOps com Chargeback por Tenant, Métrica MRR/ARR/LTV/CAC em tempo real e conformidade regulatória total com IFRS, CPC e Banco Central do Brasil.

---

## ETAPA 1 — INVENTÁRIO FINANCEIRO ATUAL (AS-IS vs. TO-BE)

### 1.1 Matriz de Componentes Financeiros

| Componente | Função Principal | Dados Processados | Criticidade | Provedor / Arquitetura |
|---|---|---|---|---|
| **Billing Engine** | Faturamento de Assinaturas SaaS | Planos, Tokens, Metragem | CRÍTICA | Stripe Billing + NestJS Core |
| **Payment Gateway** | Processamento PIX, Cartão e Boleto | Cartões (Tokenized), PIX Key | CRÍTICA | Pagar.me / Stripe / Itaú API |
| **Split Engine** | Divisão de Honorários Advocatícios | % Comissão, Chave PIX Advogado | CRÍTICA | Pagar.me Split / Banco Genial |
| **Escrow Engine** | Custódia Temporária de Honorários | Saldo retido até conclusão de etapa | CRÍTICA | Conta Grafada / Bacen Escrow |
| **Contas a Receber** | Gestão de Inadimplência & Dunning | Faturas, Aging, Pro-rata | Alta | Financial Core + BullMQ |
| **Cloud FinOps** | Alocação de Custo AWS & IA por Tenant | Métricas CloudWatch, Token Usage | Alta | AWS Cost Explorer + Datadog |
| **ERP Contábil** | Escrituração IFRS/CPC & Emissão NFS-e | Balancete, DRE, Livro Razão | Alta | Omie / NetSuite Integration |

---

## ETAPA 2 — MODELO FINANCEIRO DE NEGÓCIO (BUSINESS MODEL BLUEPRINT)

```
                       LEGIS CONNECT REVENUE ENGINE
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
[ASSINATURA SAAS]          [MARKETPLACE JURÍDICO]      [API COMERCIAL & IA]
 Planos: Solo, Firm, Corp   Comissão: 8% a 15%/Match    Pay-per-query LLM RAG
 MRR / ARR Recorrente      Split Payment Automatizado  Consumo medido (Metered)
```

1. **SaaS Recurring Revenue:** Assinaturas mensais/anuais por escritório com tiers de usuários e módulos inclusos.
2. **Marketplace Take-Rate:** Comissão retida pela plataforma em cada honorário contratado via algoritmo de match.
3. **Usage-Based Pricing (Metered AI):** Cobrança adicional por volume de requisições de IA e armazenamento excedente no GED.

---

## ETAPA 3 — ARQUITETURA FINANCEIRA CORPORATIVA (TO-BE)

```
[USUÁRIO / CLIENTE / ESCRITÓRIO]
               │
               ▼
[SaaS APPLICATION / MARKETPLACE LAYER]
               │
               ▼
[ENTERPRISE BILLING ENGINE (Stripe Billing / Core)]
 ├── Subscription Lifecycle & Prorata Engine
 ├── Coupon, Discount & Promotional Credit Manager
 └── Metered Usage Aggregator (Tokens IA + Storage)
               │
               ▼
[PAYMENT ROUTER & ANTIFRAUDE (Pagar.me / Adyen / Konduto)]
 ├── Tokenização PCI-DSS Compliance
 ├── Antifraude Comportamental & Device Fingerprint
 └── Multi-Gateway Smart Routing (PIX, Cartão, Boleto)
               │
               ▼
[SPLIT PAYMENT & ESCROW ENGINE (Conta de Garantia Bacen)]
 ├── Retenção de Take-Rate Legis (10%)
 ├── Custódia de Honorários até Aprovação do Handoff (Escrow)
 └── Repasse Automático via PIX/TED para Advogado
               │
               ▼
[FINANCIAL CORE & CONTROLADORIA DIGITAL]
 ├── Plano de Contas IFRS / CPC 47 (Revenue Recognition)
 ├── Conciliação Bancária & Gateway Automática (Real-Time)
 └── Integração ERP (NetSuite / Omie) + Emissão NFS-e
               │
               ▼
[FINANCIAL DATA WAREHOUSE & ANALYTICS]
 Redshift DW · Financial Dashboards (MRR/ARR/LTV/CAC) · FinOps Engine
```

---

## ETAPA 4 — BILLING ENGINE & SUBSCRIPTION MANAGEMENT

### 4.1 Ciclo de Vida da Assinatura SaaS

```
[ONBOARDING (Freemium/Trial 14d)] ──> [CONVERSÃO (Cartão/PIX)] ──> [USO ATIVO (Metered AI)]
                                                                           │
[CHURN RECOVERY] <── [DUNNING AUTOMÁTICO] <── [FALHA DE PAGAMENTO] <───────┤ (Renovação Auto)
 Retry 1d, 3d, 7d    Avisos WhatsApp/Email    Cartão Recusado/Expirado    │
        │                                                                  ▼
        └──────────────────────────────────────────────> [UPGRADE / EXPANSÃO]
```

- **Prorata Engine:** Cálculo milimétrico de upgrading/downgrading proporcional no meio do ciclo de faturamento.
- **Dunning Automatizado:** Tentativas inteligentes de cobrança (*Smart Retries*) combinadas com réguas de comunicação via WhatsApp e e-mail.

---

## ETAPA 5 — PAYMENT ARCHITECTURE & SPLIT PAYMENT

### 5.1 Fluxo de Split Payment e Escrow para Marketplace

```
[CLIENTE FINAL] ──(Paga R$ 10.000 via PIX/Cartão)──> [PAYMENT GATEWAY]
                                                             │
                                                             ▼
                                                    [CONTA DE GARANTIA (ESCROW)]
                                                             │
                                ┌────────────────────────────┴────────────────────────────┐
                                ▼                                                         ▼
                     [COMISSÃO LEGIS CONNECT (10%)]                             [REPASSE ADVOGADO (90%)]
                     R$ 1.000,00                                                R$ 9.000,00
                     Emissão NFS-e Serviço Plataforma                           Liberado após entrega da etapa
```

---

## ETAPA 6 — MOTOR DE COMISSÕES E CARTEIRA DIGITAL (WALLET)

- **Commission Engine:** Tabela dinâmica de comissões por volume do escritório, categoria do serviço jurídico e programa de afiliados.
- **Digital Wallet:** Saldo acumulado em carteira digital para advogados, permitindo resgate via PIX instantâneo ou utilização como crédito de assinatura.

---

## ETAPA 7 — CONTAS A RECEBER E CONTAS A PAGAR

```
INDICADORES CORE DE CONTAS A RECEBER:
• DSO (Days Sales Outstanding): Redução da média atual de 42 dias para < 12 dias.
• Inadimplência Recorrente (Bad Debt): Manutenção abaixo de 1.8% do MRR total.
• Taxa de Recuperação de Dunning: Meta de recuperar > 65% das faturas recusadas em até 14 dias.
```

---

## ETAPA 8 — CONCILIAÇÃO FINANCEIRA AUTOMATIZADA

- **Conciliação em 3 Vias (Three-Way Matching):** Comparação automática contínua entre:
  1. Registros do Banco de Dados Operacional (Pedidos / Contratos).
  2. Extratos do Payment Gateway / Adquirente.
  3. Extrato Bancário OFX / API de Open Finance.
- **Detecção de Divergências:** Criação automática de tickets de auditoria para divergências superiores a R$ 0,01.

---

## ETAPA 9 — CONTROLADORIA DIGITAL & COMPLIANCE CONTÁBIL (IFRS / CPC 47)

```
PRINCIPIO CPC 47 (REVENUE RECOGNITION):
A receita de assinaturas anuais não é reconhecida no caixa imediato, mas diferida linearmente em 12 meses (Deferred Revenue / Receita Diferida), garantindo alinhamento contábil estrito com IFRS 15.
```

---

## ETAPA 10 — FINANCIAL DATA ARCHITECTURE & ANALYTICS

```
[TRANSAÇÕES OPERACIONAIS] ──> [DEBEZIUM CDC] ──> [S3 BRONZE / SILVER] ──> [REDSHIFT DW GOLD]
                                                                                │
                                                                                ▼
                                                                     [DASHBOARD FINANCEIRO BI]
                                                                      • MRR / ARR / Net Retention
                                                                      • LTV / CAC / Payback
                                                                      • Cohort Retention & Churn
```

---

## ETAPA 11 — CLOUD & AI FINOPS (GOVERNANÇA DE CUSTOS TECNOLÓGICOS)

```
ALOCAÇÃO DE CUSTOS DE NUVEM & IA (CHARGEBACK MODEL):
• Custo AWS EKS / RDS / S3  ──> Rateado por número de escritórios ativos (Showback).
• Custo de Tokens LLM (OpenAI/Anthropic) ──> Identificado por workspace_id e cobrado como consumo metrado.
```

- **Métrica FinOps Key:** *Unit Economics do Usuário* — Custo de Infraestrutura + IA por Advogado Ativo (Meta: < R$ 12,00 / usuário / mês).

---

## ETAPA 12 — FINANCIAL COMPLIANCE, SEGURANÇA E ANTIFRAUDE

- **Antifraude Comportamental:** Integração com Konduto / Clearsale analisando fingerprint do dispositivo, geolocalização e padrão de comportamento antes de autorizar transações de alto valor.
- **Segregação de Funções (SoD - Segregation of Duties):** Quem cadastra a conta a pagar não possui permissão para aprovar a transferência.
- **Dupla Aprovação Financeira:** Transações de repasse manuais superiores a R$ 10.000,00 exigem assinatura digital de 2 diretores.

---

## ETAPA 13 — PLANO DE CONTAS E INTEGRAÇÃO ERP

```
PLANO DE CONTAS ENTERPRISE (ESTRUTURA SINTÉTICA):
1. ATIVO
   1.1 Ativo Circulante (Disponibilidades, Bancos, Contas a Receber, Escrow)
2. PASSIVO
   2.1 Passivo Circulante (Contas a Pagar, Repasses Pendentes, Receita Diferida)
3. RECEITAS OPERACIONAIS
   3.1 Receita SaaS (Assinaturas, Upsells, AI Tokens)
   3.2 Receita Marketplace (Comissões / Take-Rate)
4. CUSTOS & DESPESAS (COGS / OPEX)
   4.1 Custos de Nuvem & Provedores de IA (AWS, OpenAI)
   4.2 Taxas de Adquirencia & Gateways
```

---

## ETAPA 14 — BACKLOG TÉCNICO FINANCEIRO

---

### FIN-001 — Implementação do Billing Engine Corporativo & Dunning

**Problema:** A cobrança de assinaturas é realizada sem automação de réguas de cobrança ou prorata, gerando inadimplência alta e retrabalho manual.

**Impacto:** Perda de receita recorrente (churn involuntário > 8%), atraso na conciliação e alta taxa de inadimplência.

**Solução:** Implementar Billing Engine automatizado (Stripe Billing / Pagar.me API) com cálculo de prorata, cupons, Smart Retries e régua de Dunning via WhatsApp.

**Prioridade:** CRÍTICA | **Complexidade:** Alta | **Estimativa:** 6 semanas

---

### FIN-002 — Arquitetura de Split Payment e Escrow para Marketplace

**Problema:** O marketplace jurídico transfere honorários sem segregação automatizada, gerando bi-tributação indevida e risco regulatório.

**Impacto:** Impacto fiscal grave (imposto incidente sobre o valor total em vez do take-rate) e falta de garantia para o cliente final.

**Solução:** Implementar Split Payment automatizado com Conta de Garantia (Escrow) e repasse automático pós-confirmação da entrega.

**Prioridade:** CRÍTICA | **Complexidade:** Alta | **Estimativa:** 6 semanas

---

### FIN-003 — Engine de Conciliação Financeira Real-Time

**Problema:** A conciliação entre banco, gateway e banco de dados é feita manualmente no fim do mês via planilhas.

**Impacto:** Divergências financeiras não detectadas, atrasos no fechamento contábil e falta de visibilidade do caixa real.

**Solução:** Criar pipeline de conciliação automática em 3 vias (Three-Way Matching) via Kafka + Debezium + APIs de Open Finance.

**Prioridade:** ALTA | **Complexidade:** Média-Alta | **Estimativa:** 5 semanas

---

### FIN-004 — Módulo de Cloud & AI FinOps com Alocação de Custos

**Problema:** Não há visibilidade do custo de infraestrutura AWS e tokens de IA consumidos por cada cliente/escritório.

**Impacto:** Risco de clientes com margem negativa devido ao uso massivo de modelos LLM sem repasse de custo.

**Solução:** Implementar monitoramento FinOps com tagging estrito por workspace_id e faturamento metrado (*Metered Billing*) para consumo de IA.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

### FIN-005 — Adequação Contábil IFRS / CPC 47 & Data Warehouse BI

**Problema:** A receita de contratos anuais é reconhecida integralmente na assinatura, violando normas contábeis internacionais.

**Impacto:** Impossibilidade de passar por auditoria Big Four e métricas de MRR/ARR distorcidas para investidores.

**Solução:** Implementar motor de Receita Diferida (Deferred Revenue) alinhado ao CPC 47 e pipeline de dados financeiros para dashboards em Redshift/Superset.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

## ETAPA 15 — ARQUITETURA FINANCEIRA INTEGRADA TO-BE

```
LEGIS CONNECT — INTEGRATED ENTERPRISE FINANCIAL ARCHITECTURE
Versão 1.0 — Julho 2026

[CLIENTES & ESCRITÓRIOS]
Contratação SaaS · Marketplace Jurídico · Consumo de IA
          ↓
[ENTERPRISE BILLING & SUBSCRIPTION ENGINE]
Stripe Billing / Core · Prorata Calculator · Dunning Engine · Metered AI Aggregator
          ↓
[PAYMENT ROUTER & ANTIFRAUDE]
Pagar.me / Adyen Gateway · Tokenização PCI-DSS · Konduto Antifraude
          ↓
[SPLIT PAYMENT & ESCROW ENGINE]
Conta Grafada Bacen · Take-Rate 10% Legis · Repasse PIX Advogado 90%
          ↓
[FINANCIAL CORE & CONCILIAÇÃO 3-VIAS]
Conciliação Real-Time · Plano de Contas IFRS / CPC 47 · Emissão NFS-e
          ↓
[INTEGRAÇÃO ERP & CONTROLADORIA]
NetSuite / Omie API · Segregação de Funções (SoD) · Audit Log HMAC
          ↓
[FINANCIAL DATA WAREHOUSE & FINOPS]
AWS Redshift DW · Financial Dashboards (MRR/ARR/LTV/CAC) · Cloud & AI FinOps
```

---

*Enterprise Financial Architecture & FinOps Blueprint v1.0*
*Chief Financial Officer · Enterprise Financial Architect · Legis Connect · 2026*
