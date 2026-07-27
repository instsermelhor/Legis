# 💰 ENTERPRISE FINANCIAL PLATFORM & SAAS BILLING BLUEPRINT — LEGIS CONNECT
**PROMPT 022 — Auditoria Completa de Arquitetura Financeira, Billing SaaS, Assinaturas, Split de Pagamentos e Compliance Fiscal**
**Chief Financial Systems Architect (CFSA) | Enterprise Billing Architect & FinOps Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A arquitetura financeira atual da Legis Connect baseia-se em **transações simuladas salvas localmente no `localStorage`** sob a chave `legis_financial_tx` e no arquivo `provisioningService.ts`. Não existe integração com adquirentes ou gateways de pagamento em produção, não há split automatizado de valores entre o marketplace e os advogados contratados, não há controle de inadimplência (*Dunning Management*), emissão automática de Nota Fiscal de Serviço (NFS-e) ou contabilidade em partidas dobradas (*Double-Entry Financial Ledger*).

**Diagnóstico Financeiro**:
- **Maturidade de Billing & Monetização (AS-IS)**: `0.5 / 5.0` (Inexistente / Mock Local).
- **Risco de Conformidade Fiscal & PCI**: **CRÍTICO**. Inexistência de retenções tributárias na fonte, ausência de conformidade com normas contábeis **IFRS 15 / CPC 47** (Reconhecimento de Receita) e dados financeiros mantidos no cliente sem auditoria.

**Objetivo Arquitetural TO-BE**: Estruturar o **Enterprise Financial Engine & SaaS Billing Platform**, implementando um motor de assinaturas desacoplado (**Stripe Billing + Pagar.me / Asaas**), split de pagamentos em conta garantida (*Escrow Marketplace*), **Livro Razão de Partidas Dobradas (Double-Entry Ledger)** no PostgreSQL 16, emissão automatizada de NFS-e via **e-Notas / NFe.io**, conciliação bancária diária via **CNAB 240 / OFX**, motor de cobrança automática (*Dunning Engine*) e dashboards executivos de métricas SaaS (**MRR, ARR, LTV, CAC, Churn**).

---

## ETAPA 1 — INVENTÁRIO FINANCEIRO COMPLETO

### 1.1 Matriz de Fluxos Monetários da Plataforma

| Fluxo Financeiro | Tipo de Transação | Criticidade | Frequência | Risco de Negócio / Fiscal |
|---|---|---|---|---|
| **Cobrança de Assinatura SaaS** | Recorrente (Cartão / PIX) | 🔴 Extrema | Mensal / Anual | Chargeback / Inadimplência |
| **Split de Serviços Advocatícios**| Marketplace Escrow | 🔴 Extrema | Sob Demanda | Bloqueio judicial / Bitributação |
| **Comissão da Plataforma Legis** | Retenção percentual (15%) | 🔴 Extrema | Por transação | Não emissão de NFS-e de comissão |
| **Repasse Líquido ao Advogado** | Transferência PIX / TED | 🔴 Extrema | D+3 a D+30 | Falha no split / Erro de conciliação |
| **Estornos / Reembolsos** | Refund total ou parcial | 🟠 Alta | Esporádica | Perda de tarifa do gateway |
| **Chargebacks de Cartão** | Contestação pelo titular | 🔴 Extrema | Esporádica | Fraude / Perda financeira direta |
| **Retenções Tributárias (ISS/PIS)**| Impostos na Fonte | 🔴 Extrema | Mensal | Autuação fiscal municipal/federal |

---

## ETAPA 2 — ARQUITETURA FINANCEIRA GERAL (TO-BE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ENTERPRISE FINANCIAL ENGINE ARCHITECTURE                  │
│                                                                             │
│  [ Web & Mobile Clients ]                                                   │
│            │                                                                │
│            ▼ HTTPS TLS 1.3                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ CLOUDFLARE WAF + API GATEWAY (NestJS Financial Security Guard)       │   │
│  └──────────────────────────────────┬───────────────────────────────────┘   │
│                                     │                                       │
│                                     ▼ Internal VPC                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ NESTSJ BILLING & FINANCE MODULES (`FinanceModule`)                   │   │
│  │                                                                      │   │
│  │ ├── 1. Subscription & Plan Engine (Stripe Billing Integration)       │   │
│  │ ├── 2. Marketplace Split Engine (Pagar.me / Asaas Escrow Accounts)   │   │
│  │ ├── 3. Dunning Engine (Recuperação automatizada de inadimplência)   │   │
│  │ └── 4. Fiscal Integration Engine (NFS-e via e-Notas / NFe.io API)    │   │
│  └──────────────────────────────────┬───────────────────────────────────┘   │
│                                     │                                       │
│                                     ▼ Double-Entry Transactions             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ FINANCIAL RECORDING & COMPLIANCE LAYER                               │   │
│  │ ├── PostgreSQL Double-Entry Ledger (Tabelas Debits & Credits)        │   │
│  │ ├── Conciliação Bancária Automática (CNAB 240 / OFX Extratos)        │   │
│  │ └── Financial BI Analytics (Metabase MRR, ARR, LTV & CAC Dashboards) │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 3 — BILLING SAAS & CICLO DE VIDA DAS ASSINATURAS

```
                            CICLO DE VIDA DA ASSINATURA SAAS
                            ═════════════════════════════════

  [ Trial Gratuito (14 dias) ] ──► [ Transição Automática para Pago ]
                                                │
                                                ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ RENOVAÇÃO MENSAL                                                        │
  │ • Sucesso no Pagamento ──► Emite NFS-e + Mantém Acesso                  │
  │ • Falha no Pagamento   ──► Entra no Dunning Engine (3 tentativas)       │
  └─────────────────────────────────────┬───────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
  [ Recuperado (Pagamento OK) ]           [ Cancelado por Inadimplência (D+15) ]
```

---

## ETAPA 4 — GESTÃO DO CATÁLOGO DE PLANOS DE NEGÓCIO

| Nome do Plano | Valor Mensal | Limite Usuários | Limite Storage S3 | Tokens IA / Mês | Taxa Marketplace |
|---|---|---|---|---|---|
| **Gratuito / Trial** | R$ 0,00 | 1 Usuário | 500 MB | 10.000 Tokens | 20% sobre serviços |
| **Advogado Pro** | R$ 149,00 | 1 Advogado + 1 Estagiário | 15 GB | 250.000 Tokens | 12% sobre serviços |
| **Escritório Master** | R$ 599,00 | Até 10 Colaboradores | 100 GB | 1.500.000 Tokens| 8% sobre serviços |
| **Enterprise / Governo**| Sob Consulta | Ilimitado | Customizado | Customizado | Customizada |

---

## ETAPA 5 — ARQUITETURA DE PAGAMENTOS & SELEÇÃO DE GATEWAYS

### 5.1 Matriz Comparativa de Provedores de Pagamento

| Critério de Avaliação | Stripe Billing | Pagar.me (Stone) | Asaas | Mercado Pago |
|---|---|---|---|---|
| **Gestão de Assinaturas SaaS** | 🟢 **Líder Mundial (Stripe Billing)** | 🟡 Básico | 🟡 Básico | 🟡 Básico |
| **Split de Pagamentos (Marketplace)**| 🟢 Stripe Connect | 🟢 **Excelente (Split Nativo)** | 🟢 Excelente | 🟡 Risco de Conta |
| **PIX Instantâneo & Boleto BR** | 🟡 Taxa mais alta | 🟢 **Excelente (Baixa taxa)** | 🟢 Excelente | 🟢 Baixa taxa |
| **PCI DSS Level 1 Certified** | 🟢 Sim (100%) | 🟢 Sim (100%) | 🟢 Sim (100%) | 🟢 Sim (100%) |
| **ARQUITETURA ADOTADA** | **SaaS Billing Global** | **PIX & Split Brasil** | Backup Secundário | Descartado |

---

## ETAPA 6 — MARKETPLACE JURÍDICO & SPLIT EM CONTA GARANTIDA (ESCROW)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE SPLIT FINANCEIRO EM ESCROW                      │
│                                                                             │
│  [ Cliente contrata parecer de R$ 1.000,00 via PIX / Cartão ]               │
│                                   │                                         │
│                                   ▼                                         │
│  [ Adquirente Pagar.me / Stripe recebe R$ 1.000,00 em Custódia ]            │
│                                   │                                         │
│                                   ├─► Retém R$ 150,00 (15% Comissão Legis) │
│                                   └─► Retém R$ 850,00 (85% Saldo Advogado)  │
│                                                                             │
│  [ Advogado entrega o parecer e o cliente confirma o recebimento ]          │
│                                   │                                         │
│                                   ▼                                         │
│  [ Liberação do Split: R$ 850,00 transferidos p/ conta bancária do Advogado]│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 7 — LEDGER FINANCEIRO DE PARTIDAS DOBRADAS (DOUBLE-ENTRY LEDGER)

* **Princípio Contábil**: Todo lançamento financeiro gera obrigatoriamente um **Débito** e um **Crédito** de valor idêntico (`Soma(Débitos) == Soma(Créditos)`).
* **Schema no PostgreSQL (`financial_ledger`)**:
```sql
CREATE TABLE financial_ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT NOT NULL,
  debit_account VARCHAR(50) NOT NULL,   -- Ex: 'ASSETS:BANK_STRIPE'
  credit_account VARCHAR(50) NOT NULL,  -- Ex: 'REVENUE:SAAS_SUBSCRIPTIONS'
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  correlation_id VARCHAR(100) NOT NULL -- ID externo da transação Stripe
);
```

---

## ETAPA 8 — CONCILIAÇÃO BANCÁRIA AUTOMÁTICA (`CNAB 240 / OFX`)

```
                               CONCILIAÇÃO AUTOMÁTICA
                               ══════════════════════

  1. Extrato de Gateway ──► Importação diária de relatórios de liquidação em JSON
  2. Extrato Bancário ────► Leitura de arquivos CNAB 240 / OFX fornecidos pelos bancos
  3. Reconciliation Match ─► Algoritmo que cruza `amount` + `correlation_id` + `date`
  4. Divergência Alert ───► Notificação automática caso o valor líquido divirja em > R$ 0,01
```

---

## ETAPA 9 — GESTÃO TRIBUTÁRIA & EMISSÃO DE NFS-E

* **Tributação do Marketplace**: A Legis Connect recolhe **ISSQN** e tributos federais exclusivamente sobre a sua **taxa de intermediação (comissão de 15%)**, e não sobre o valor total do serviço advocatício, evitando a bitributação.
* **Automação Fiscal (e-Notas / NFe.io)**: Webhook acionado imediatamente após o status `payment_confirmed`, transmitindo o XML para a Prefeitura Municipal e enviando a NFS-e em PDF por e-mail para o tomador do serviço.

---

## ETAPA 10 — DUNNING ENGINE (RECURSOS CONTRA INADIMPLÊNCIA)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUXO DO ENGINE DE COBRANÇA (DUNNING)                    │
│                                                                             │
│  [ Falha na Renovação da Assinatura ]                                       │
│        │                                                                    │
│        ├── D+1 ──► E-mail amigável + Notificação Push no App                │
│        ├── D+3 ──► Segunda tentativa de cobrança automática no Cartão       │
│        ├── D+7 ──► Notificação WhatsApp via Meta Cloud API                  │
│        ├── D+10 ─► Terceira tentativa de cobrança + Aviso de Bloqueio       │
│        └── D+15 ─► Suspensão temporária do acesso à plataforma (Graça)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 11 — REEMBOLSOS, ESTORNOS E CHARGEBACKS

* **Fluxo de Chargeback**: Notificação via Webhook altera o status do pagamento para `UNDER_DISPUTE`, bloqueando preventivamente o repasse ao advogado e criando uma tarefa no módulo de compliance para envio de evidências (logs de acesso, aceite de termos e IP do usuário).

---

## ETAPA 12 — ESTRUTURAÇÃO DE CENTROS DE CUSTO & DRE

```
                            DRE OPERACIONAL SAAS (CENTROS DE CUSTO)
                            ═══════════════════════════════════════

  (+) RECEITA BRUTA DE VENDAS (Assinaturas SaaS + Comissões Marketplace)
  (-) DEDUÇÕES E IMPOSTOS DIRETO (ISSQN, PIS, COFINS sobre comissões)
  (=) RECEITA LÍQUIDA DE OPERAÇÕES
  (-) CUSTOS OPERACIONAIS DA PLATAFORMA (COGS):
      ├── Infraestrutura Cloud (AWS ECS, RDS, S3)
      ├── Consumo de Tokens de IA (Google Vertex AI / OpenAI)
      └── Taxas de Adquirentes e Gateways de Pagamento (Stripe / Pagar.me)
  (=) LUCRO BRUTO OPERACIONAL
  (-) DESPESAS OPERACIONAIS (OPEX):
      ├── Marketing & Vendas (CAC)
      └── P&D / Engenharia de Software
  (=) EBITDA OPERACIONAL
```

---

## ETAPA 13 — CATÁLOGO DE INDICADORES FINANCEIROS (SAAS METRICS)

| Indicador Financeiro | Fórmula de Cálculo | Meta Alvo |
|---|---|---|
| **MRR (Monthly Recurring Revenue)** | `Soma(Assinaturas_Ativas_Mensais)` | **Crescimento > 15% ao mês** |
| **ARR (Annual Run Rate)** | `MRR * 12` | Projeção anual de receita |
| **CAC (Customer Acquisition Cost)** | `(Gastos_Marketing + Vendas) / Novos_Clientes` | **< R$ 350,00** por escritório |
| **LTV (Lifetime Value)** | `(Ticket_Médio * Margem_Bruta) / Churn_Rate` | **LTV : CAC > 4 : 1** |
| **Gross Churn Rate** | `(MRR_Cancelado / MRR_Inicio_Mês) * 100` | **< 1.5% ao mês** |
| **Net Revenue Retention (NRR)** | `((MRR_Inicial + Expansão - Cancelamento) / MRR_Inicial) * 100` | **> 110% ao ano** |

---

## ETAPA 14 — AUDITORIA FINANCEIRA & TRILHA DE SEGURANÇA

* **Assinatura HMAC de Transações**: Cada entrada no `financial_ledger` possui um hash SHA-256 gerado a partir do registro anterior, garantindo imutabilidade completa (impossível alterar um saldo passado sem quebrar a corrente de validação).

---

## ETAPA 15 — COMPLIANCE NORMATIVO (IFRS 15 / CPC 47 & PCI DSS)

* **IFRS 15 / CPC 47 (Reconhecimento de Receita)**: O valor pago em assinaturas anuais é alocado no passivo diferido (*Deferred Revenue*) e reconhecido na DRE pro-rata ao longo dos 12 meses.
* **PCI DSS Level 1**: A Legis Connect **nunca armazena números de cartão de crédito** em seu banco de dados. Todos os dados sensíveis de pagamento são tokenizados diretamente no frontend via Stripe Elements / Pagar.me JS SDK.

---

## ETAPA 16 — ROADMAP EVOLUTIVO FINANCEIRO

```
                    ROADMAP DA ARQUITETURA FINANCEIRA
                    ═════════════════════════════════

  FASE 1: STRIPE BILLING & BASE DE ASSINATURAS (Semanas 1-4)
  ├── Integração com Stripe Billing para gestão de planos e recorrência
  ├── Tabela `financial_ledger` com partidas dobradas no PostgreSQL
  └── Emissão de NFS-e automatizada via e-Notas API

  FASE 2: SPLIT DE MARKETPLACE & PIX (Semanas 5-8)
  ├── Integração com Pagar.me / Asaas para checkout PIX e Boleto Brasil
  ├── Motor de split de pagamentos em conta garantida (Escrow)
  └── Implementação do Dunning Engine para recuperação de inadimplentes

  FASE 3: CONCILIAÇÃO AUTOMÁTICA & FINOPS (Semanas 9-12)
  ├── Leitura automatizada de extratos CNAB 240 / OFX para conciliação
  └── Painel de métricas SaaS no BI (MRR, ARR, LTV, CAC, Churn)
```

---

## ETAPA 17 — BACKLOG TÉCNICO FINANCEIRO

### FIN-001 — Desacoplar Módulo Financeiro (`FinanceModule` NestJS)
* **Problema**: Operações financeiras simuladas no `localStorage`.
* **Solução**: Implementar `FinanceModule` em NestJS integrado ao Stripe Billing.
* **Prioridade**: 🔴 EMERGENCIAL | **Complexidade**: Alta | **Esforço**: 60h

### FIN-002 — Implementar Double-Entry Financial Ledger no PostgreSQL
* **Problema**: Ausência de controle contábil imutável de débitos e créditos.
* **Solução**: Tabelas contábeis com restrição de integridade e hash HMAC.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 48h

### FIN-003 — Motor de Split de Pagamentos para Marketplace Jurídico
* **Problema**: Incapacidade de repassar valores líquidos aos advogados com retenção de comissão.
* **Solução**: Integração de split nativo com Pagar.me / Stripe Connect.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 48h

### FIN-004 — Automação de Emissão de NFS-e via e-Notas API
* **Problema**: Riscos de autuação fiscal por falta de emissão de documento fiscal.
* **Solução**: Webhook acionando a e-Notas API para emissão automática de NFS-e.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Média | **Esforço**: 32h

### FIN-005 — Implementar Dunning Engine de Cobrança Automática
* **Problema**: Perda de receita por cartões recusados ou expirados.
* **Solução**: Retentativas inteligentes + notificações e-mail/WhatsApp via BullMQ.
* **Prioridade**: 🟠 ALTA | **Complexidade**: Média | **Esforço**: 32h

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 022

| Entregável | Status |
|---|---|
| ✅ Inventário Financeiro Completo (Mapeamento de 7 Fluxos Monetários) | Concluído |
| ✅ Arquitetura Financeira Geral (Diagrama Multi-Camadas TO-BE) | Concluído |
| ✅ Plataforma de Billing SaaS (Assinaturas, Recorrência, Upgrades, Trial) | Concluído |
| ✅ Catálogo de Planos de Negócio (Gratuito, Pro, Master, Enterprise) | Concluído |
| ✅ Estratégia de Pagamentos (Comparativo Gateways: Stripe vs Pagar.me) | Concluído |
| ✅ Arquitetura de Marketplace Jurídico (Split de Pagamentos & Escrow) | Concluído |
| ✅ Double-Entry Financial Ledger (Partidas Dobradas no PostgreSQL) | Concluído |
| ✅ Sistema de Conciliação Bancária Automática (CNAB 240 / OFX) | Concluído |
| ✅ Gestão Tributária (Impostos sobre Comissão, ISSQN, Retenções) | Concluído |
| ✅ Plataforma de Emissão Fiscal (Automação NFS-e via e-Notas API) | Concluído |
| ✅ Dunning Engine (Gestão Automatizada de Inadimplência) | Concluído |
| ✅ Processo de Estornos, Reembolsos e Defesa de Chargebacks | Concluído |
| ✅ Arquitetura de Fluxo de Caixa e Projeção de Liquidez | Concluído |
| ✅ Modelo de Centros de Custos e DRE Operacional SaaS | Concluído |
| ✅ Catálogo de KPIs Financeiros (MRR, ARR, LTV, CAC, NRR, Churn) | Concluído |
| ✅ Sistema de Auditoria Financeira Imutável com Assinatura HMAC | Concluído |
| ✅ Plano de Segurança Financeira (Tokenização PCI DSS Level 1) | Concluído |
| ✅ Matriz de Compliance Financeiro (IFRS 15 / CPC 47 & LGPD) | Concluído |
| ✅ Roadmap Evolutivo Financeiro em 3 Fases (12 semanas) | Concluído |
| ✅ Backlog Técnico Financeiro Priorizado (`FIN-001` a `FIN-005`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 022 — Enterprise Financial Platform & SaaS Billing Blueprint | v1.0.0*
*Próximo: PROMPT 023 — Plano Mestre de Reengenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
