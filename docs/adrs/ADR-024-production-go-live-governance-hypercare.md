# ADR-024: Enterprise Production Go-Live Governance & Hypercare Operating Model
# Status: APROVADO | Data: 27/07/2026 | Decisores: CTO, CISO, COO, CPO, CFO, DPO

## Contexto
Apos a certificacao EPRI 94.2/100 no Prompt 238, a Legis Connect esta apta para Go-Live em producao.
Este ADR formaliza a estrategia de cutover, o modelo operacional de Hypercare para os primeiros 90 dias
e os criterios de saida do Hypercare para operacao padrao (BAU — Business as Usual).

## Decisoes Tecnicas

### 1. Estrategia de Cutover
Adotar **Blue-Green Deployment com Route53 Weighted Routing e Feature Flags (LaunchDarkly)**:
- Janela: 10/08/2026 (Domingo), 02h00-06h00 BRT (janela de menor trafego)
- Progressao: 0% → 1% → 5% → 20% → 100% com health checks entre cada step
- Rollback: DNS reverter para BLUE em < 5 minutos (TTL = 60s)
- Trigger de Rollback: Error Rate > 2% ou P99 > 3s por mais de 5 minutos

### 2. Hypercare Operating Model (90 dias)
- **Dias 1-7 (Critico):** War Room 24/7, review de metricas a cada 30 min, briefing executivo diario
- **Dias 8-30 (Intensivo):** War Room horario comercial + extended, briefing 3x/semana
- **Dias 31-90 (Reducao):** On-call padrao, briefing semanal, SLAs normais restaurados

### 3. Criterios de Saida do Hypercare (para BAU)
- Nenhum incidente P1 nas ultimas 2 semanas consecutivas
- Error Budget consumido < 10% no ultimo mes
- NPS dos primeiros usuarios > 40
- MAU crescendo semana a semana de forma organica
- Todos os GAPs do Go-Live fechados (GAP-001 a GAP-005)

### 4. Producao Certification Board
- Votacao: Unanimidade para GO sem condicoes | Maioria 5/6 para GO WITH CONDITIONS
- Qualquer veto individual = NO GO ate resolucao da condicao de veto
- Recertificacao anual obrigatoria (validade: 12 meses)

## Consequencias
- Positivas: Risco de Go-Live minimizado, stakeholders alinhados, rollback claro e testado
- Restricoes: Janela de cutover limitada (4h) requer preparacao rigorosa D-7 a D-1
  com shadow traffic e pre-aquecimento do ambiente Green
