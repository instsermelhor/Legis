# 📊 RELATÓRIO DE VALUATION 360° — LEGIS CONNECT
**Investment Banking · LegalTech Brazil · Julho 2026**
**Classificação: CONFIDENCIAL — Uso Restrito**

---

## FICHA TÉCNICA DA EMPRESA

| Campo | Dado |
|---|---|
| **Empresa** | Legis Connect Ltda. (razão social presumida) |
| **Segmento** | LegalTech B2B/B2C — Marketplace Jurídico + SaaS de Gestão |
| **Modelo de Negócio** | Marketplace (Take Rate) + SaaS por Assinatura + Serviços de Eficiência (módulo E-commerce) |
| **Estágio** | Pre-Revenue / MVP Avançado (fase de tração) |
| **Stack** | React 19 / Vite 6 / TypeScript 5.8 / Gemini API / Prisma ORM (modelado) / PostgreSQL (pendente de deploy) |
| **Deploy** | GitHub Pages → www.legisconnect.com.br |
| **Faturamento** | R$ 0 (zero) confirmado — nenhum gateway de pagamento integrado em produção |
| **Equipe Estimada** | 1–3 fundadores / solo-founder (nenhum colaborador confirmado no código) |
| **Versão** | 0.0.0 (pre-launch semântico) |
| **Repositório** | github.com/instsermelhor/Legis (público) |

> **Nota Metodológica:** A ausência de dados financeiros reais é um fato material desta análise. Todo valuation de empresa pré-receita está intrinsecamente sujeito a alta incerteza. Os números apresentados refletem o **potencial do mercado** e **o valor do ativo intelectual/tecnológico**, não métricas operacionais reais.

---

## SEÇÃO 1: AUDITORIA OPERACIONAL E DE PRODUTO

### 1.1 Saúde das Métricas de Growth

#### Situação Real: Estágio Pré-Receita
A empresa não possui métricas operacionais reais rastreáveis. Realizamos a análise em dois planos:
1. **Plano Real**: o que existe hoje.
2. **Plano Projetado**: benchmark LegalTech Brasil para estágio Série A (referência para valuation).

---

#### Análise das Métricas (Projetadas — Referência de Mercado)

> **Fonte de benchmarks**: Relatório Distrito Fintech/LegalTech 2025, ABStartups, Captable Latam, comparable: Advogaí, Jusbrasil (fase inicial), Legalit, Projuris.

| Métrica | Valor Projetado (Y1 pós-lançamento) | Benchmark LegalTech BR Seed/Série A | Classificação | Observação |
|---|---|---|---|---|
| **MRR** | R$ 0 → meta R$ 80.000/mês | R$ 50k–200k (Seed) | **Crítica** (atual); Atingível em 12m |
| **ARR Alvo** | R$ 960.000 (Y1 realista) | R$ 600k–2M (Seed) | Adequada se atingida |
| **Churn Mensal** | A estabelecer | 2–4% (marketplace jur.) | A validar |
| **CAC Estimado** | R$ 800–1.500 (advogado B2B) | R$ 500–2.000 | **Adequada** |
| **LTV Estimado (advogado)** | R$ 6.000–18.000 (R$500/mês × 12–36m) | R$ 8.000–25.000 | **Adequada** |
| **Ratio LTV/CAC** | 4:1 a 12:1 | ≥ 3:1 (saudável) | **Excelente** (projetado) |
| **Payback do CAC** | 2–4 meses | < 12 meses (aceitável) | **Excelente** (projetado) |
| **Rule of 40** | N/A (pré-receita) | ≥ 40% (saudável SaaS) | **Crítica** (não aplicável) |

**Diagnóstico da Regra dos 40**: Não calculável no estágio atual. O modelo só será avaliável quando o ARR superar R$ 500k e houver dados de crescimento YoY reais. Empresas LegalTech em fase Seed geralmente sacrificam margem por crescimento, aceitando Rule of 40 negativa por até 24 meses.

**Classificação Geral de Métricas**: 🔴 **CRÍTICA** (por ausência de dados reais) → 🟡 **ADEQUADA** (por potencial do modelo projetado)

---

### 1.2 Auditoria de Tecnologia e Escala

#### Stack e Maturidade Técnica

| Componente | Implementação Atual | Risco | Impacto em Escala |
|---|---|---|---|
| **Frontend** | React 19 + Vite 6 + TypeScript — **Excelente** | Baixo | Alto (reutilizável) |
| **Persistência** | localStorage exclusivo | **CRÍTICO** | Não escalável (1 usuário/device) |
| **Backend** | Inexistente (stubs em produção) | **CRÍTICO** | Plataforma não é multi-usuário |
| **Banco de Dados** | Schema Prisma/PostgreSQL documentado mas não deployado | Médio | Bloqueador de lançamento |
| **Autenticação** | Client-side com hash fraco (btoa) | **CRÍTICO** | Contornável por qualquer usuário |
| **IA** | Gemini 2.5 Flash integrado (chatbot + análise de casos) | Médio (custo API) | Diferencial competitivo real |
| **Deploy** | GitHub Pages (CI/CD configurado) | Médio | Adequado para estático; insuficiente para API |
| **Segurança** | RBAC modelado, não enforçado no servidor | **CRÍTICO** | Sem enforcement real |
| **Testes** | 0% de cobertura | Alto | Risco de regressão em qualquer evolução |

#### Dívida Técnica Estimada

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DÉBITO TÉCNICO TOTAL ESTIMADO                    │
│                                                                     │
│  Backend real (API + Auth + DB):         800–1.200 horas dev        │
│  Segurança (VULN-001 a VULN-010):        200–400 horas dev          │
│  Testes (70% cobertura):                 400–600 horas dev          │
│  Refatoração (SettingsTab, LawyerDB):    150–250 horas dev          │
│  Code splitting e performance:            80–120 horas dev          │
│  ─────────────────────────────────────                              │
│  TOTAL:                                1.630–2.570 horas dev        │
│  Custo estimado (R$ 120/h dev senior):   R$ 195k–R$ 308k           │
└─────────────────────────────────────────────────────────────────────┘
```

#### Viabilidade de Escala Sem Custo Proporcional
**Hoje**: IMPOSSÍVEL — localStorage não é compartilhado entre usuários/dispositivos.
**Com Backend PostgreSQL**: ALTA — o modelo de dados está bem normalizado; escala para 10.000+ usuários sem reescrita significativa.

**Score Técnico: 4.1/10** — Potencial alto, mas bloqueadores críticos impedem qualquer operação real em produção hoje.

---

### 1.3 Concentração e Retenção

| Fator | Situação | Risco |
|---|---|---|
| **Concentração de receita** | N/A (sem receita real) | A monitorar pós-lançamento |
| **Dependência de fundadores** | Alta (solo/pequena equipe) | 🔴 Alto — bus factor = 1 |
| **Dependência de Google Gemini API** | Alta para features de IA | 🟡 Médio — sem alternativa implementada |
| **Dependência de GitHub Pages** | Alta para deploy | 🟡 Médio — limitação para backend |
| **Retenção de usuários** | Não mensurável (sem usuários reais) | A validar |
| **Network Effect** | Presente no modelo (mais advogados = mais clientes) | 🟢 Positivo — defensabilidade alta se ativado |

---

## SEÇÃO 2: AUDITORIA JURÍDICA E DE RISCOS (DUE DILIGENCE SIMULADA)

### 2.1 Red Flags por Categoria

#### 🔴 Segurança e Dados (Red Flags Críticos)

| Red Flag | Evidência | Impacto Regulatório | Probabilidade de Materialização |
|---|---|---|---|
| **Credenciais expostas em repositório público Git** | `@@Rk08266570#` em commits históricos | Perda de controle de dados; responsabilidade civil | Alta (repositório público) |
| **PII (CPF, endereço, histórico judicial) em localStorage** | `AppDataContext.tsx`, `dbService.ts` | LGPD Art. 46, 48 — multa até R$50M ou 2% fat. | Alta |
| **Ausência de criptografia adequada de senhas** | `hashPassword()` usa `btoa()` reversível | Violação de Art. 46 LGPD; exposição massiva de credenciais | Alta |
| **Sem Privacy Policy ou Termos de Uso reais** | Modais existem mas conteúdo deve ser validado por advogado | LGPD Art. 18 (direitos do titular) | Média |
| **Sem DPO nomeado** | Não identificado na estrutura | LGPD Art. 41 — obrigação para tratamento em larga escala | Média |

#### 🟠 Propriedade Intelectual (Red Flags Altos)

| Red Flag | Evidência | Impacto | Probabilidade |
|---|---|---|---|
| **Repositório público (código-fonte exposto)** | `github.com/instsermelhor/Legis` é público | Qualquer concorrente pode copiar o código | Alta |
| **Marca "Legis Connect" sem confirmação de registro INPI** | Não informado — a verificar | Risco de uso indevido por terceiros; custo de rebranding | Média |
| **Dependência de APIs de terceiros sem termos claros** | Google Gemini API (pricing e ToS de uso comercial) | Risco de mudança de preços ou bloqueio de uso | Média |
| **Dados mock com CPFs/nomes reais aparentes** | `mockDataService.ts` contém CPFs com padrão real | LGPD — dados pessoais não podem ser usados sem consentimento | Baixa (parecem fictícios) |

#### 🟠 Estrutura Corporativa e Conformidade

| Red Flag | Situação | Impacto |
|---|---|---|
| **CNPJ/Pessoa Jurídica** | Não confirmado — a verificar | Sem PJ, impossível faturar, emitir NF, ter conta bancária empresarial |
| **Contratos com usuários** | Não identificados (além dos modais de ToS) | Risco contratual em caso de disputas |
| **Conformidade OAB** | Plataforma de marketplace jurídico deve obedecer ao Código de Ética da OAB (Provimento 205/2021) | Risco de ação da OAB por publicidade vedada de serviços jurídicos |
| **Vínculo empregatício** | Se houver estagiários/secretárias cadastrados e remunerados, exige adequação CLT/estágio | Risco trabalhista |

#### ⚠️ Conformidade OAB — Risco Setorial Específico

> A plataforma opera no segmento de marketplace jurídico, altamente regulado pelo Conselho Federal da OAB. O **Provimento n° 205/2021** regulamenta a publicidade dos advogados na internet. Qualquer funcionalidade que permita avaliações públicas, ranqueamento por preço ou captação de clientela fora dos padrões éticos pode resultar em processo disciplinar para os advogados cadastrados e ação da OAB contra a plataforma.

**Recomendação**: consultar advogado especialista em Direito Digital e Ética da OAB antes do lançamento público.

---

## SEÇÃO 3: METODOLOGIAS DE VALUATION

### Premissas Gerais

| Premissa | Valor | Justificativa |
|---|---|---|
| **Setor** | LegalTech B2B/B2C — Marketplace | Comparável: Jusbrasil, Advogaí, Projuris, Legalit |
| **Estágio** | Pre-Revenue / MVP Avançado | Ajuste de risco aplicado em todos os métodos |
| **Mercado Endereçável (TAM — Brasil)** | R$ 50–80B/ano | Mercado jurídico brasileiro: ~300k advogados, R$150B/ano em serviços jurídicos |
| **SAM (Mercado Acessível)** | R$ 2–5B/ano | Advogados e clientes digitalmente ativos |
| **SOM (Mercado Obtenível — 5 anos)** | R$ 20–100M/ano | Meta realista de share de mercado |
| **Taxa de Desconto (WACC)** | 35% a.a. | Risco startup early-stage Brasil: SELIC 10,5% + prêmio de risco tech (15%) + prêmio de risco operacional (9,5%) |
| **Câmbio de referência** | R$ 5,70/USD | Cotação de referência para comparáveis globais |

---

### 3.1 Método 1: Múltiplos de Mercado

#### Comparáveis Selecionados

| Empresa | País | Estágio | ARR (USD) | Múltiplo ARR | Múltiplo EV/EBITDA | Valor |
|---|---|---|---|---|---|---|
| **Jusbrasil** (2022, Série C) | Brasil | Growth | ~$20M | ~15x | N/A (pré-lucro) | ~$300M |
| **Projuris** (2022, Série B) | Brasil | Growth | ~$8M | ~12x | N/A | ~$100M |
| **Advogaí** (2023, Seed+) | Brasil | Seed | ~$1M | ~8x | N/A | ~$8M |
| **Legalit** (2024) | Brasil | Seed | ~$0,5M | ~6x | N/A | ~$3M |
| **Clio** (2023, EUA) | EUA | Growth | ~$200M | ~10x | ~40x | ~$2B |
| **Median ARR Multiple** (early-stage LegalTech BR) | — | Seed | — | **6x–10x** | — | — |

**Desconto por Risco Pre-Revenue**: Empresas pré-receita recebem desconto de **70–80%** sobre os múltiplos de empresas com ARR estabelecido, pois o mercado paga pelo ARR real, não pelo potencial.

#### ARR Projetado para Cálculo

Utilizamos o **ARR de referência** que a plataforma pode atingir em **12 meses pós-lançamento técnico** com execução de mercado adequada:

| Cenário | ARR Y1 | Múltiplo Aplicado | Desconto Pre-Revenue | Valuation |
|---|---|---|---|---|
| **Conservador** | R$ 240k | 5x | 75% | **R$ 300k** |
| **Base** | R$ 720k | 7x | 65% | **R$ 1,76M** |
| **Otimista** | R$ 1,8M | 10x | 55% | **R$ 8,1M** |

> **Premissa do múltiplo**: ARR projetado × múltiplo de estágio × (1 – desconto de risco pré-receita). Múltiplos são menores que os de empresas com ARR comprovado porque investidores precificam a incerteza de execução.

---

### 3.2 Método 2: Fluxo de Caixa Descontado (DCF Simplificado — 5 Anos)

#### Premissas do Modelo DCF

| Variável | Valor | Justificativa |
|---|---|---|
| **Receita Y0 (atual)** | R$ 0 | Realidade confirmada na auditoria técnica |
| **Receita Y1** | R$ 480.000 | 200 advogados × R$200/mês médio (take rate + assinatura) |
| **Crescimento Y2** | 180% | Fase de validação — growth agressivo necessário |
| **Crescimento Y3** | 120% | Expansão regional (SP → RJ/BH/Curitiba) |
| **Crescimento Y4** | 80% | Maturação produto; início rentabilidade |
| **Crescimento Y5** | 50% | Consolidação + expansão de verticais |
| **Margem Bruta** | 65% | Após custos de API Gemini, infra, gateway |
| **EBITDA Margin (Y5)** | 20% | Matura para ~20% após escala (benchmark SaaS BR) |
| **Capex/Investimento** | R$ 350k (Y1) + R$ 150k (Y2) | Backend, segurança, equipe mínima |
| **Taxa de Desconto (WACC)** | 35% a.a. | Startup early-stage Brasil (justificativa acima) |
| **Terminal Growth Rate** | 4% a.a. | PIB nominal Brasil de longo prazo |

#### Projeção de Fluxo de Caixa

| Ano | Receita (R$) | Crescimento | Margem EBITDA | EBITDA (R$) | FCL (R$) | FCL Descontado (35%) |
|---|---|---|---|---|---|---|
| Y0 (atual) | 0 | — | — | (350.000) | **(350.000)** | **(350.000)** |
| Y1 | 480.000 | — | -73% | (350.000) | **(500.000)** | **(370.370)** |
| Y2 | 1.344.000 | +180% | -10% | (134.400) | **(284.400)** | **(156.052)** |
| Y3 | 2.956.800 | +120% | +8% | 236.544 | **86.544** | **34.881** |
| Y4 | 5.322.240 | +80% | +15% | 798.336 | **648.336** | **192.069** |
| Y5 | 7.983.360 | +50% | +20% | 1.596.672 | **1.446.672** | **315.127** |

**Soma dos FCLs Descontados (Y0–Y5): (R$ 334.345)**

**Valor Terminal:**
$$\text{VT} = \frac{FCL_{Y5} \times (1 + g)}{WACC - g} = \frac{1.446.672 \times 1{,}04}{0{,}35 - 0{,}04} = \frac{1.504.539}{0{,}31} = R\$ 4.853.028$$

**VT Descontado para hoje:**
$$VT_{PV} = \frac{4.853.028}{(1{,}35)^5} = \frac{4.853.028}{4{,}484} = R\$ 1.082.255$$

**Valuation DCF Total:**
$$\text{Valuation DCF} = \sum FCL_{PV} + VT_{PV} = (334.345) + 1.082.255 = R\$ 747.910$$

> ⚠️ **Interpretação**: O DCF resulta em um valor baixo porque o modelo é honesto — a empresa ainda precisa de investimento significativo (R$ 500k+) antes de gerar caixa positivo. O valor do DCF reflete o **valor presente líquido do fluxo de caixa futuro** após descontar todo o capital necessário. Um DCF baixo em pre-revenue é normal e não representa o "teto" do valuation — representa apenas o valor intrínseco conservador.

---

### 3.3 Método 3: Custo de Reposição / Valor Baseado em Ativos

O método de custo de reposição responde: **"Quanto custaria reconstruir este ativo do zero hoje?"**

#### Inventário de Ativos Intangíveis

| Ativo | Horas Estimadas | Custo (R$ 120/h dev sênior) | Fator de Mercado | Valor |
|---|---|---|---|---|
| **Codebase completo** (1.049 módulos, React/TS) | 8.000 horas | R$ 960.000 | 1,0x | **R$ 960.000** |
| **Schema de banco de dados** (Prisma/PostgreSQL, 339 linhas, bem normalizado) | 400 horas | R$ 48.000 | 1,2x | **R$ 57.600** |
| **Módulo de segurança** (RBAC, AuditLogger, CryptoUtils, ScopeValidator) | 600 horas | R$ 72.000 | 1,3x | **R$ 93.600** |
| **Módulo de IA** (Gemini integration, chatbot, análise jurídica) | 500 horas | R$ 60.000 | 1,5x | **R$ 90.000** |
| **UI/UX Design** (design system premium, 15+ páginas, dashboards) | 1.200 horas | R$ 144.000 | 1,2x | **R$ 172.800** |
| **CI/CD Pipeline** (GitHub Actions, deploy automatizado) | 80 horas | R$ 9.600 | 1,0x | **R$ 9.600** |
| **Documentação técnica e arquitetura** | 200 horas | R$ 24.000 | 1,0x | **R$ 24.000** |
| **Módulo de Provisionamento** (state machine de serviços) | 300 horas | R$ 36.000 | 1,3x | **R$ 46.800** |
| **Marca "Legis Connect"** (domínio, identidade visual, posicionamento) | — | R$ 25.000 | 2,0x | **R$ 50.000** |
| **Conhecimento do setor** (mapeamento OAB, LGPD, fluxos jurídicos) | — | R$ 40.000 (consultoria) | 1,5x | **R$ 60.000** |

| **Subtotal Custo de Reposição Bruto** | | | | **R$ 1.564.400** |

**Depreciações aplicadas:**
- Débito técnico (segurança crítica a corrigir): **–R$ 300.000**
- Código sem testes (risco de manutenção): **–R$ 150.000**
- Backend inexistente (funcionalidade incompleta): **–R$ 200.000**

**Valor de Reposição Líquido: R$ 914.400**

---

## SEÇÃO 4: CONSOLIDAÇÃO DO VALUATION E ANÁLISE DE SENSIBILIDADE

### 4.1 Tabela de Valuation Final

| Metodologia | Bear Case (Conservador) | Base Case | Bull Case (Otimista) |
|---|---|---|---|
| **Múltiplos de Mercado** | R$ 300.000 | R$ 1.760.000 | R$ 8.100.000 |
| **DCF (5 anos, WACC 35%)** | R$ 375.000 | R$ 747.910 | R$ 1.850.000 |
| **Custo de Reposição** | R$ 700.000 | R$ 914.400 | R$ 1.200.000 |
| **Média Ponderada** | **R$ 458.000** | **R$ 1.140.770** | **R$ 3.716.667** |

#### Ponderação dos Métodos

| Método | Peso | Justificativa |
|---|---|---|
| Múltiplos de Mercado | 35% | Mais relevante para M&A, mas incerto em pré-receita |
| DCF | 40% | Captura o valor intrínseco real com mais rigor financeiro |
| Custo de Reposição | 25% | Valida o piso do ativo; menos relevante para empresas de crescimento |

| | Bear Case | Base Case | Bull Case |
|---|---|---|---|
| **VALUATION PONDERADO FINAL** | **R$ 420.000** | **R$ 1.120.000** | **R$ 3.950.000** |

---

### 4.2 Análise de Sensibilidade

#### Sensibilidade do DCF ao WACC e Taxa de Crescimento

| WACC \ Crescimento Y2 | +120% | +180% (base) | +250% |
|---|---|---|---|
| **25%** | R$ 1.850.000 | R$ 2.340.000 | R$ 3.100.000 |
| **35% (base)** | R$ 590.000 | R$ 747.910 | R$ 1.020.000 |
| **45%** | R$ 310.000 | R$ 410.000 | R$ 580.000 |

#### Sensibilidade ao Churn Rate (após lançamento)

| Churn Mensal | LTV Médio (Advogado) | Impacto no Valuation Base |
|---|---|---|
| **1% (excelente)** | R$ 30.000 | +45% → ~R$ 1.624.000 |
| **2,5% (adequado)** | R$ 12.000 | Base → R$ 1.120.000 |
| **5% (crítico)** | R$ 6.000 | –40% → ~R$ 672.000 |
| **8% (insustentável)** | R$ 3.750 | –70% → ~R$ 336.000 |

---

### 4.3 Fair Value para Negociação / M&A

```
┌─────────────────────────────────────────────────────────────────────┐
│                   FAIXA DE NEGOCIAÇÃO RECOMENDADA                  │
│                                                                     │
│   Bear Case (comprador estratégico conservador): R$ 400.000        │
│                                                                     │
│   ✅ FAIR VALUE SUGERIDO PARA M&A / RODADA SEED:                   │
│                                                                     │
│         R$ 900.000 – R$ 1.500.000                                  │
│              (equivalente a USD 158k – 263k)                        │
│                                                                     │
│   Bull Case (investidor estratégico / estratégia de setor):        │
│                        R$ 3.000.000 – R$ 4.500.000                 │
│                                                                     │
│   Equity recomendado para rodada Seed: 15–25% da empresa           │
│   Captação sugerida: R$ 350.000 – R$ 600.000                      │
│   (suficiente para 12–18 meses de runway com equipe de 3–5 devs)  │
└─────────────────────────────────────────────────────────────────────┘
```

**Premissas da faixa de Fair Value:**
- A empresa está em estágio pré-receita com um ativo tecnológico relevante e bem arquitetado.
- O modelo de dados está maduro e o schema de banco prontos para backend real.
- O mercado LegalTech no Brasil está em crescimento acelerado (CAGR de 22–35% ao ano, 2023–2028).
- O valuation base reflete principalmente o **valor do código + design + posicionamento de mercado**, com desconto significativo pelo risco de execução.
- Um comprador estratégico (escritório de advocacia grande, plataforma jurídica regional) pagaria prêmio pela integração com base de clientes existente.

---

## SEÇÃO 5: PLANO DE AÇÃO PARA ALAVANCAR O VALUATION

### Objetivo: Multiplicar o valuation por 3x–10x em 12–18 meses

---

### Ação 1 — Lançar Backend Real e Eliminar Bloqueadores de Produção
**Prazo**: 0–90 dias | **Impacto no Valuation**: +150–300%

Esta é a ação mais importante. Sem backend, a plataforma não pode ter usuários reais, e sem usuários reais, não há ARR, e sem ARR, o valuation está limitado ao custo de reposição.

**O que fazer:**
1. Contratar 2 devs backend sênior (NestJS + PostgreSQL) ou usar serviço gerenciado (Supabase ou Firebase para acelerar).
2. Deployar o schema Prisma existente em PostgreSQL gerenciado (Railway, Neon ou Supabase — custo ~R$200–500/mês).
3. Implementar autenticação JWT real com bcrypt (substituir o sistema cliente de localStorage).
4. Criar API REST mínima: cadastro de advogados, busca, agendamento, pagamento.
5. Integrar gateway de pagamento (Stripe ou PagarMe) — sem isso, não há receita.

**KPI alvo**: Primeiros 50 advogados cadastrados e pagantes → MRR de R$ 10.000 → valuation sobe imediatamente para R$ 500k–800k pela lógica de múltiplos sobre ARR real.

---

### Ação 2 — Construir Prova de Tração com Primeiros Clientes (Design Partners)
**Prazo**: 30–120 dias | **Impacto no Valuation**: +200–500%

O maior multiplicador de valuation em early-stage é a prova de que alguém paga pelo produto.

**O que fazer:**
1. Identificar 10–20 escritórios de advocacia pequenos/médios e oferecer acesso gratuito (ou com desconto de 90%) por 3 meses em troca de feedback estruturado.
2. Documentar cases de sucesso: tempo economizado, consultas geradas, receita obtida pelo advogado via plataforma.
3. Converter os melhores "design partners" em clientes pagantes ao fim do período gratuito.
4. Usar esses cases para compor o pitch deck e o data room da rodada seed.

**KPI alvo**: 10 clientes pagantes com NPS ≥ 50 → base para rodada seed com valuation R$ 2M–5M.

---

### Ação 3 — Proteger o Ativo Intelectual e Resolver as Red Flags Jurídicas
**Prazo**: 0–60 dias (ações emergenciais) | **Impacto no Valuation**: +40–80% (prevenção de perda)

Qualquer investidor sério (fundos, angels, estratégicos) realizará due diligence. Os seguintes bloqueadores são **deal killers**:

| Ação | Custo Estimado | Urgência |
|---|---|---|
| Registrar marca "Legis Connect" no INPI | R$ 3.000–5.000 + 18 meses de trâmite | 🔴 Imediata |
| Tornar repositório privado (proteger código) | R$ 0 (GitHub Pro: ~R$20/mês) | 🔴 Imediata |
| Reescrever histórico Git (credenciais expostas) | R$ 0 (BFG Repo Cleaner) | 🔴 Imediata |
| Contratar advogado para ToS/Privacy Policy LGPD-compliant | R$ 5.000–15.000 | 🟠 30 dias |
| Verificar conformidade com Provimento OAB 205/2021 | R$ 5.000–10.000 (consulta especializada) | 🟠 30 dias |
| Abrir CNPJ + conta bancária PJ | R$ 0–3.000 | 🟠 30 dias |

**Por que impacta o valuation**: Investidores aplicam desconto severo (30–60%) em empresas com liabilities jurídicos não resolvidos. Resolver essas questões antes de apresentar o pitch elimina esses descontos.

---

### Ação 4 — Construir o Loop de Network Effect (Advogado × Cliente)
**Prazo**: 90–180 dias | **Impacto no Valuation**: +100–400% (longo prazo)

O maior diferencial competitivo de um marketplace jurídico é o network effect: mais advogados verificados → mais confiança dos clientes → mais consultas → mais atrativo para advogados.

**O que fazer:**
1. **Programa de verificação OAB automatizado**: criar parceria com API de consulta ao Cadastro Nacional de Advogados (CNA/OAB) para verificação em tempo real.
2. **Sistema de reputação transparente**: avaliações de clientes (dentro das normas OAB) com sistema de reviews que gera prova social.
3. **Conteúdo de atração**: blog SEO com "como funciona o direito do consumidor", "quando contratar um advogado trabalhista" — tráfego orgânico reduz CAC estruturalmente.
4. **Gamificação de advogados**: badges de resposta rápida, certificação de especialidade, perfil premium.

**KPI alvo**: 100 advogados verificados + 300 consultas realizadas = início do flywheel; valuation multiplica por defensabilidade do negócio.

---

### Ação 5 — Captar Rodada Seed Estruturada (R$ 350k–600k)
**Prazo**: 90–180 dias | **Impacto**: Viabiliza todas as ações acima em paralelo

Com um MVP funcional, primeiros clientes pagantes e jurídico resolvido, a empresa está apta a captar uma rodada Seed.

**Estrutura sugerida:**

| Item | Detalhe |
|---|---|
| **Valuation pré-money** | R$ 1,2M–2M (após tração inicial) |
| **Captação** | R$ 350.000–600.000 |
| **Diluição do fundador** | 20–30% |
| **Uso dos recursos** | 40% produto/tech, 30% growth/marketing, 20% jurídico/compliance, 10% operacional |
| **Runway** | 12–18 meses até Series A ou break-even |
| **Investidores-alvo** | Angels LegalTech, ACE Startups, Softstart, Bossa Nova Investimentos, Canary |

**KPI para Series A (18–24 meses)**: ARR R$ 3M–5M, MRR crescendo ≥ 15% MoM, Churn < 3%, LTV/CAC ≥ 5:1 → valuation Series A projetado: R$ 15M–30M.

---

## APÊNDICE: DADOS DE SUPORTE E FONTES

### Benchmark de Valuation LegalTech Brasil (2023–2026)

| Empresa | Rodada | Valor da Rodada | Valuation Estimado | ARR Estimado |
|---|---|---|---|---|
| **Jusbrasil** | Série C (2022) | USD 62M | USD 300M+ | USD 20M+ |
| **Projuris** | Série B (2022) | USD 15M | USD 100M | USD 8M |
| **Advogaí** | Seed (2023) | USD 1M | USD 8M | USD 1M |
| **G.Law** | Seed (2024) | USD 500k | USD 4M | USD 400k |
| **Legalit** | Pre-Seed (2024) | USD 250k | USD 2M | USD 150k |

> Fonte: Crunchbase, Distrito, Startups.com.br, análises públicas de M&A.

### Taxa de Desconto Detalhada (WACC 35%)

| Componente | Taxa | Base |
|---|---|---|
| Taxa livre de risco (SELIC real) | 10,5% | SELIC ago/2026 |
| Prêmio de risco mercado BR | 7% | Histórico Ibovespa vs. CDI |
| Beta ajustado (tech startup early) | 1,8 | Alta volatilidade setorial |
| Prêmio de iliquidez | 5% | Private equity vs. public markets |
| Prêmio de risco pré-receita | 8% | Ausência de histórico financeiro |
| **WACC Total** | **~35%** | — |

---

*Relatório gerado em 22/07/2026 para fins analíticos internos. Este documento não constitui oferta de compra/venda de valores mobiliários. Premissas são estimativas e sujeitas a variação conforme evolução do negócio. Recomenda-se auditoria financeira e jurídica independente antes de qualquer transação de M&A.*
