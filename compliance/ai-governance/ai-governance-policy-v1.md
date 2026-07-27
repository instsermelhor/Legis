# Política de Governança de Inteligência Artificial — Legis Connect
**Versão:** 1.0 | **Classificação:** Corporativa | **Aprovação:** Comitê de IA + CCO + CEO
**Data:** 27/07/2026 | **Próxima Revisão:** 27/01/2027 | **Base Legal:** LGPD Art. 20 + EU AI Act

---

## 1. OBJETIVO

Estabelecer os princípios, requisitos e controles para o desenvolvimento, implantação e uso
de sistemas de Inteligência Artificial pela Legis Connect, garantindo uso ético, transparente,
seguro e conforme à legislação vigente.

## 2. ESCOPO

Esta política aplica-se a:
- Todos os modelos de LLM (GPT-4o, Gemini, Claude) utilizados na plataforma.
- Todos os agentes autônomos (AI Copilot, Document Analyzer, Legal Risk Scorer).
- Todos os modelos de ML proprietários (Churn, Matching, Revenue Forecast).
- Qualquer sistema que tome decisões automatizadas com impacto em usuários.

## 3. PRINCÍPIOS OBRIGATÓRIOS

### 3.1 Transparência
- Todo output de IA deve ser identificado como tal (badge "IA" visível).
- Disclaimer obrigatório: "Esta análise foi gerada por Inteligência Artificial. 
  Verifique com um advogado qualificado antes de tomar decisões jurídicas."

### 3.2 Explicabilidade
- Análises jurídicas DEVEM incluir citação de fonte (lei, acórdão, súmula).
- Zero conclusões sem embasamento verificável.

### 3.3 Supervisão Humana (LGPD Art. 20)
- Botão "Revisar com Humano" obrigatório em toda saída de IA que impacte direitos do titular.
- SLA de revisão humana: < 24 horas.
- Usuário pode contestar qualquer decisão automatizada.

### 3.4 Não-Discriminação
- Modelos de matching auditados trimestralmente para viés (gênero, raça, região, OAB section).
- Relatório de Bias Assessment emitido por engenheiro de ML independente.
- Qualquer modelo com viés estatisticamente significativo (p < 0.05) é suspenso para revisão.

### 3.5 Privacidade por Design de IA
- PII Scrubber OBRIGATÓRIO antes de qualquer dado chegar ao LLM externo.
- CPF, nome completo, OAB number NUNCA incluídos em prompts — substituídos por tokens.
- Dados de menores de idade PROIBIDOS em qualquer pipeline de IA.

## 4. PROCESSO DE APROVAÇÃO DE NOVOS MODELOS

1. Engenheiro submete proposta ao AI Model Registry com: fornecedor, finalidade, dados usados.
2. DPIA realizado se modelo usar dados pessoais ou tomar decisões automatizadas.
3. Bias Assessment concluído para modelos de classificação/ranking.
4. Comitê de IA aprova formalmente (quórum: AI Governance Officer + CISO + CCO).
5. Modelo adicionado ao AI Model Registry com status APPROVED.
6. Review semestral obrigatório para manter status APPROVED.

## 5. USOS PROIBIDOS

- Uso de dados de processos jurídicos para treinamento de modelos sem consentimento explícito.
- Sistemas de scoring social ou vigilância de comportamento.
- Decisões automatizadas sem possibilidade de revisão humana disponível.
- Processamento de dados biométricos de titulares sem DPIA e consentimento explícito.

## 6. RESPONSABILIDADES

| Papel | Responsabilidade |
|---|---|
| AI Governance Officer | Manter AI Model Registry, coordenar Comitê de IA |
| Engenheiro de ML | Executar Bias Assessment, documentar modelos |
| DPO | Aprovar DPIAs para novos modelos de IA |
| CCO | Garantir conformidade com LGPD Art. 20 e EU AI Act |
| CPO | Garantir disclaimers e UX de transparência no produto |
