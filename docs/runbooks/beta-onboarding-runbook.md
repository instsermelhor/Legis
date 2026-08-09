# Runbook — Onboarding de Advogados Parceiros (Beta Fechado)

Este runbook define os critérios de seleção, processo de convite, suporte e coleta de feedback para a fase de **Beta Fechado** da plataforma Legis Connect.

---

## 🎯 Objetivos da Fase Beta Fechado

- **Público-alvo**: 15 a 30 advogados parceiros (autônomos, escritórios de pequeno/médio porte e departamentos jurídicos).
- **Duração**: 4 semanas.
- **Metas**:
  - Zerar bugs de alta severidade nas jornadas de advogado e cliente.
  - Validar a precisão do assistente de IA Gemini nas respostas de consultas jurídicas.
  - Testar o fluxo completo de pagamento via PIX, Boleto e Custódia Escrow com divisão de honorários OAB.
  - Atingir nota média de satisfação no feedback $\ge 4.2 / 5.0$.

---

## 📋 Critérios de Seleção de Participantes

| Perfil | Quantidade Vagas | Foco de Validação |
|---|---|---|
| **Advogados Autônomos** | 10 vagas | Gestão de casos, precificação, atendimento e pagamentos PIX |
| **Pequenos Escritórios (2-5 advogados)** | 10 vagas | Gestão de equipe/estagiários, delegação e painel financeiro |
| **Bacharelandos / Estagiários** | 5 vagas | Pesquisa jurídica com IA, resumos e usabilidade do portal |
| **Secretários / Assistentes** | 5 vagas | Agendamentos, cadastros e triagem de clientes |

---

## ✉️ Processo de Convite & Cadastro

### 1. Inserir Usuário na Tabela `beta_users`

Execute no Supabase SQL Editor para registrar o convidado e gerar o token único de ativação:

```sql
INSERT INTO beta_users (email, name, oab_number, phone, specialty)
VALUES (
  'advogado.exemplo@oabsp.org.br',
  'Dr. Carlos Eduardo da Silva',
  'OAB/SP 123.456',
  '+55 11 99999-8888',
  'Direito Civil / Trabalhista'
);
```

### 2. Enviar Template de Convite (WhatsApp / Email)

```text
Olá, Dr. [NOME DO ADVOGADO]!

Seja bem-vindo ao programa exclusivo de Beta Fechado da Legis Connect — a nova plataforma jurídica enterprise do Brasil.

Sua conta de teste já está liberada!

🔗 Acesse: https://legisconnect.com.br
✉️ Login: [EMAIL]
🔑 Senha temporária: LegisBeta@2026

O que você pode testar:
- Copiloto de IA Gemini para pesquisa e elaboração de peças
- Gestão de processos e clientes em tempo real
- Cobrança de honorários via PIX com Conta Garantia (Escrow Jurídico)
- Painel de auditoria e segurança RBAC

Sua opinião é essencial! Use o botão "💬 Feedback" no canto inferior da tela para relatar bugs ou sugerir melhorias.

Dúvidas ou suporte direto:
💬 WhatsApp Suporte Beta: https://wa.me/5511999999999

Equipe Legis Connect
```

---

## 📊 Acompanhamento & Suporte no Beta

### 1. Monitoramento no Dashboard SuperAdmin

O SuperAdmin acompanha a saúde do Beta na aba **Governança & Métrica Beta**:

- **KPIs**: Usuários ativos vs. convidados, média de estrelas nos feedbacks.
- **Painel de Feedback**: Tabela em tempo real com registros enviados via `BetaFeedbackButton`.
- **Cadeia de Auditoria**: Verificação de integridade de logs via `validateAuditChainIntegrity()`.

### 2. SLA de Atendimento no Beta

- **Bugs Críticos (Impedimento de uso / Pagamentos)**: Resposta em até 2h, correção em até 12h.
- **Dúvidas e Sugestões**: Resposta em até 24h úteis.

---

## 🏁 Critérios de Encerramento e Transição para Go-Live Comercial

O Beta Fechado será considerado concluído com sucesso quando:

1. **Testes QA**: Todos os 10 testes automatizados da suíte QA (Sprint 10) passarem com 100% de aprovação.
2. **Volumetria de Testes**: Mais de 50 transações de teste processadas no módulo financeiro (PIX/Escrow).
3. **Satisfação**: Média geral de feedback $\ge 4.2$ estrelas.
4. **Segurança**: Zero violações na cadeia de hashes de auditoria (`tamperedRecords == 0`).

Após o atingimento dos critérios, os usuários beta recebem a oferta de transição para o plano comercial com **50% de desconto perpétuo** no primeiro ano.
