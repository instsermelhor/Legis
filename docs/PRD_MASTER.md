# LEGIS CONNECT — PRODUCT REQUIREMENTS DOCUMENT (PRD MASTER)

**Documento Normativo Definitivo e Fonte Oficial de Verdade do Produto**  
**Versão**: 1.0.0 — Enterprise Master Edition  
**Data**: Agosto de 2026  
**Status**: Aprovado / Normativo  

---

## 1. VISÃO DO PRODUTO

A **Legis Connect** é o ecossistema digital jurídico definitivo que integra, conecta e empodera todos os agentes da cadeia do direito no Brasil: clientes finalizadores, advogados autônomos, escritórios de advocacia, estudantes, bacharelandos, estagiários, secretários, assistentes jurídicos e administradores de plataforma.

Atuando como uma superplataforma integrada (*All-in-One Legal Platform*), a Legis Connect combina:
1. **Marketplace e Matching Inteligente**: Conexão ética e transparente entre a demanda dos clientes e a oferta qualificada de serviços advocatícios.
2. **ERP & CRM Jurídico Completo**: Gestão de processos, contratos (CLM), finanças (FinOps/Escrow), honorários, equipes, tarefas, agenda e controladoria.
3. **Plataforma Acadêmica e Desenvolvimento Profissional**: Hub de aprendizagem, supervisão de estágio (Lei 11.788/08), simuladores de exames OAB e mentorias.
4. **Inteligência Artificial de Apoio Jurídico**: Copiloto preditivo e assistente de minuta processual que respeita rigorosamente o Provimento OAB nº 205/2021 e o Código de Ética e Disciplina da OAB.
5. **Governança, Segurança Zero-Trust e Compliance LGPD**: Arquitetura imutável de auditoria com encadeamento de hash (HMAC-SHA256), Row-Level Security (RLS) e encriptação AES-GCM.

---

## 2. MISSÃO

Democratizar o acesso à justiça de forma transparente e acessível para a sociedade, enquanto provê infraestrutura tecnológica de ponta, governada por ética e IA de apoio, para acelerar em até 10x a produtividade e a gestão dos profissionais do Direito.

---

## 3. O PROBLEMA

O mercado jurídico brasileiro enfrenta gargalos estruturais em todas as pontas:
- **Para o Cliente**: Dificuldade em localizar especialistas qualificados para a sua demanda específica, falta de transparência no acompanhamento processual e assimetria de informações financeiras.
- **Para o Advogado / Escritório**: Sobrecarga com tarefas burocráticas repetitivas, ineficiência na gestão financeira e de honorários, limitação na prospecção ética de clientes e falta de ferramentas modernas de automação.
- **Para o Estudante / Estagiário**: Dificuldade em encontrar estágios supervisionados reais, falta de registro formal e seguro de horas cumpridas e ausência de ferramentas para preparação para o exame da OAB.
- **Para o Secretariado / Assistente Jurídico**: Falta de canal unificado para triagem de clientes, recepção virtual, gestão de tarefas delegadas e agendamento de reuniões.

---

## 4. PROPOSTA DE VALOR

A Legis Connect resolve essas dores integrando todos os papéis em um ambiente seguro, colaborativo e interoperável:
- **Clientes**: Encontram advogados qualificados via IA de matching, acompanham o status dos seus casos em tempo real e realizam pagamentos protegidos por escrow.
- **Advogados / Escritórios**: Recebem oportunidades qualificadas, automatizam minutas com IA, gerenciam finanças/processos/equipes e impulsionam a produtividade da banca.
- **Estudantes / Estagiários**: Conectam-se a supervisores OAB, registram horas válidas conforme a Lei 11.788/08, utilizam o simulador OAB com feedback de IA e participam de mentorias.
- **Secretários / Assistentes**: Operam recepção virtual, sala de espera digital, triagem de casos e organização de prazos e agendas com controle de acesso refinado (RBAC).

---

## 5. PERSONAS DETALHADAS

### 5.1. Cliente (`client`)
- **Perfil**: Pessoa física ou jurídica que necessita de assistência ou representação jurídica.
- **Necessidades**: Relatar caso, encontrar especialistas com filtros por localização/área, comparar perfis e reputações, contratar serviços com pagamento seguro, acompanhar andamento em tempo real, enviar e assinar documentos, tirar dúvidas com assistente virtual.

### 5.2. Advogado (`lawyer`)
- **Perfil**: Profissional inscrito na OAB (ativo), atuando como autônomo ou sócio/associado de escritório.
- **Necessidades**: Receber leads e casos via matching, administrar processos em kanban/tabela, controlar prazos e publicações, gerenciar honorários e fluxo de caixa, delegar tarefas para estagiários/secretários, gerar minutas com IA de apoio.

### 5.3. Escritório de Advocacia (`office`)
- **Perfil**: Sociedade de advogados ou banca jurídica estruturada.
- **Necessidades**: Gestão de múltiplos advogados e colaboradores, visão consolidada de faturamento e margem por área, governança corporativa, atribuição de permissões granulares, gestão da carteira de clientes PJ e PF, relatórios executivos de BI.

### 5.4. Estudante / Bacharelando em Direito (`student`)
- **Perfil**: Acadêmico de graduação em Direito ou bacharel preparando-se para o exame da Ordem.
- **Necessidades**: Acessar conteúdo jurídico e biblioteca virtual, utilizar o Simulador OAB com IA de correção explicativa, buscar vagas de estágio supervisionado, agendar sessões de mentoria com advogados sêniores.

### 5.5. Estagiário Jurídico (`intern`)
- **Perfil**: Estudante de Direito regularmente inscrito na OAB como estagiário ou contratado por escritório.
- **Necessidades**: Registrar horas de prática supervisionada, realizar pesquisas doutrinárias e jurisprudenciais delegadas, confeccionar rascunhos de peças sob supervisão, acompanhar a validação de horas pelo advogado supervisor.

### 5.6. Secretária / Secretário (`secretary`)
- **Perfil**: Profissional administrativo responsável pelo atendimento e rotina do escritório.
- **Necessidades**: Gerenciar a sala de espera virtual, realizar triagem de clientes e recepção, organizar a agenda de atendimentos dos advogados, controlar lembretes e tarefas administrativas.

### 5.7. Assistente Jurídico (`legal_assistant`)
- **Perfil**: Profissional de apoio jurídico com formação técnica ou bacharelado.
- **Necessidades**: Organizar documentos, monitorar andamentos processuais, cadastrar novas causas, preparar relatórios de apoio e executar rotinas de controladoria jurídica delegadas.

### 5.8. Administrador de Plataforma (`admin`)
- **Perfil**: Integrante da equipe interna de operações da Legis Connect.
- **Necessidades**: Validar cadastros de OAB, gerenciar planos de assinatura e cobranças, monitorar suporte L1 e denúncias de compliance, acompanhar métricas da plataforma.

### 5.9. Super Administrador Universal (`super_admin`)
- **Perfil**: Executivo ou auditor master com nível de autoridade máximo (Level 100).
- **Necessidades**: Acesso global, gerenciamento de colaboradores internos (Staff RBAC), execução de auditoria imutável, suporte a modo espelho (*Impersonation Session*) com log compulsório, delegação de privilégios temporários e configuração de parâmetros globais do sistema.

---

## 6. JORNADAS COMPLETAS DOS USUÁRIOS

### 6.1. Jornada do Cliente
```text
Landing Page / App Home
  ↓
Relato do Caso (Formulário ou IA Chat)
  ↓
IA analisa área do Direito & Requisitos
  ↓
Algoritmo de Matching e Busca Inteligente
  ↓
Filtros (Especialidade, Cidade/UF, Avaliação, Honorários)
  ↓
Exibição do Perfil Verificado do Advogado
  ↓
Solicitação de Agendamento / Consulta
  ↓
Pagamento Seguro em Escrow (Cartão / Pix)
  ↓
Atendimento (Videochamada ou Chat Integrado)
  ↓
Acompanhamento do Processo no Painel do Cliente
  ↓
Encerramento do Caso & Avaliação da Consulta
```

### 6.2. Jornada do Advogado
```text
Cadastro & Validação do Registro OAB (Receita/OAB)
  ↓
Definição de Perfil, Especialidades e Tabela de Honorários
  ↓
Recebimento de Oportunidades & Notificação de Matching
  ↓
Aceite do Atendimento / Consulta
  ↓
Abertura de Pasta de Caso no CRM/ERP Jurídico
  ↓
Elaboração de Peça com Apoio do Copiloto IA (opcional)
  ↓
Delegação de Pesquisa / Tarefa para Estagiário ou Secretária
  ↓
Acompanhamento Processual & Atualização de Fases
  ↓
Faturamento, Liberação de Escrow & Relatórios Financeiros
```

### 6.3. Jornada do Estagiário
```text
Cadastro como Estagiário + Vínculo a Supervisor OAB
  ↓
Acesso ao Hub do Estagiário & Simulador OAB
  ↓
Recebimento de Tarefas Delegadas pelo Advogado
  ↓
Execução da Pesquisa / Minuta + Registro do Log de Horas
  ↓
Submissão para Validação do Advogado Supervisor
  ↓
Horas Validadas Cumuladas na Ficha de Estágio (Lei 11.788/08)
```

---

## 7. ARQUITETURA FUNCIONAL DO PRODUTO

A Legis Connect é estruturada em uma arquitetura modular em camadas, garantindo alta coesão e baixo acoplamento:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
┌                                 FRONTEND                                    │
│   React 19 + TypeScript + Vite + Vanilla CSS / Design System Tokens        │
│   (Single Page Application com Lazy Loading e Code Splitting)               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / WSS / JSON REST
┌──────────────────────────────────────▼──────────────────────────────────────┐
┌                            CAMADA DE APLICAÇÃO                              │
│   State Management (AppDataContext + AuthContext + LocalStorage Guard)      │
│   RBAC Engine (Zero-Trust Permission Checking & Role Levels)               │
│   AI Orchestrator (Google Gemini API + Legal Guardrails + Audit Proxy)      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Prisma ORM / Direct SQL
┌──────────────────────────────────────▼──────────────────────────────────────┐
┌                         BANCO DE DADOS & PERSISTÊNCIA                       │
│   PostgreSQL + Row-Level Security (RLS)                                     │
│   Encadeamento de Audit Log (HMAC-SHA256 Append-Only)                       │
│   Encripcação de Dados Sensíveis (CPF/Documentos em AES-GCM)                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. MÓDULOS DO SISTEMA

| MÓDULO | OBJETIVO | PERSONAS | CLASSIFICAÇÃO |
| :--- | :--- | :--- | :--- |
| **Site Institucional & Landing Page** | Apresentação de proposta de valor, planos e entrada de fluxos. | Todos | **Obrigatório** |
| **Marketplace Jurídico & Busca** | Localização e comparação de advogados por localização e especialidade. | Cliente, Advogado | **Obrigatório** |
| **Matching Jurídico por IA** | Leitura de relato de caso do cliente e indicação automática de especialistas. | Cliente, Advogado | **Obrigatório** |
| **Cadastro & Autenticação (Auth)** | Signup/Login com MFA, suporte a estrangeiros, validação de OAB/CPF. | Todos | **Obrigatório** |
| **Painel do Cliente** | Gestão de casos contratados, agenda, documentos e chat de atendimento. | Cliente | **Obrigatório** |
| **Painel do Advogado (CRM/ERP)** | Gestão de processos em kanban, honorários, documentos, IA e minutas. | Advogado | **Obrigatório** |
| **Controladoria Jurídica & FinOps** | Gestão financeira do escritório, faturamento, parcelamentos e DRE. | Advogado, Escritório | **Obrigatório** |
| **Hub do Estagiário & Simulador OAB** | Registro de horas (Lei 11.788/08), simulador OAB com IA e tarefas. | Estagiário, Advogado | **Obrigatório** |
| **Portal do Secretariado** | Triagem, recepção virtual, sala de espera digital e agenda unificada. | Secretária, Advogado | **Obrigatório** |
| **Motor de Pagamentos & Escrow** | Retenção segura de honorários em escrow até conclusão do serviço. | Cliente, Advogado, Admin | **Obrigatório** |
| **Agente Copiloto IA Jurídico** | Elaboração de minutas, análise de prazos e resumos de caso com Gemini. | Advogado, Estagiário | **Obrigatório** |
| **Segurança, RBAC & Auditoria** | Controle de acesso em 9 níveis, log imutável HMAC-SHA256, impersonamento. | Admin, Super Admin | **Obrigatório** |
| **Conformidade & Módulo LGPD** | Atendimento a direitos do titular (SAR), revogação de consentimento e exportação. | Todos | **Obrigatório** |
| **Business Intelligence (BI) & Analytics** | Indicadores operacionais, financeiros e gráficos de desempenho. | Escritório, Super Admin | **Recomendado** |

---

## 9. REQUISITOS FUNCIONAIS (FR)

### Módulo: Autenticação & Gestão de Identidades (AUTH)
- **FR-001**: O sistema deve permitir o cadastro de Usuários nas roles: `client`, `lawyer`, `intern`, `secretary`, `admin`, `super_admin`.
  - *Critério de Aceite*: Usuário criado com sucesso no banco, com hash PBKDF2 da senha, UUID único e role atribuída.
- **FR-002**: O cadastro de advogados deve exigir o número da OAB e a UF de registro, com verificação de status.
  - *Critério de Aceite*: Campo de OAB obriga formato numérico e estado válido; cadastra com status `pendente` ou `verificado`.
- **FR-003**: O sistema deve permitir cadastro de pessoas estrangeiras sem CPF, solicitando documento do país de origem e passaporte.
  - *Critério de Aceite*: Toggle `isForeigner` habilita campos `foreignerDocument` e `countryOfOrigin`, tornando CPF opcional.
- **FR-004**: O sistema deve fornecer suporte a Autenticação de Múltiplos Fatores (MFA) via TOTP para perfis administrativos e advogados.
  - *Critério de Aceite*: Geração de QR Code TOTP e validação do token de 6 dígitos antes de conceder sessão administrativa.
- **FR-005**: O Super Admin pode iniciar uma Sessão de Modo Espelho (*Impersonation Session*) informando justificativa obrigatória.
  - *Critério de Aceite*: Justificativa com no mínimo 20 caracteres; log imutável de auditoria criado; sessão expira em 30 min.

### Módulo: Marketplace & Matching Jurídico (MATCH)
- **FR-006**: O cliente deve conseguir buscar advogados por especialidade, cidade, estado e faixa de valor de consulta.
  - *Critério de Aceite*: Filtro dinâmico retorna lista atualizada de perfis que correspondem a todos os critérios selecionados.
- **FR-007**: A IA de Matching deve analisar a descrição textual do caso do cliente e sugerir as áreas jurídicas e advogados ideais.
  - *Critério de Aceite*: Integração Gemini retorna `primaryArea`, `specializations` e lista de advogados sugeridos.
- **FR-008**: O perfil público do advogado deve exibir foto, OAB/UF, especialidades, bio, avaliações de clientes e valor da consulta.
  - *Critério de Aceite*: Exibição correta sem expor dados pessoais sensíveis do advogado (ex: CPF residencial ocultado).

### Módulo: Painel do Cliente (CLIENT)
- **FR-009**: O cliente deve visualizar todos os seus casos ativos, concluídos e cancelados com a linha do tempo de fases (*stages*).
  - *Critério de Aceite*: Status do caso e etapas (`completed`, `current`, `upcoming`) exibidos de forma clara e legível.
- **FR-010**: O cliente deve poder agendar consultas por videochamada ou presenciais escolhendo horários disponíveis na agenda do advogado.
  - *Critério de Aceite*: Slot agendado fica marcado como reservado e indisponível para outros clientes.
- **FR-011**: O cliente deve poder avaliar o atendimento do advogado após a conclusão do caso/consulta.
  - *Critério de Aceite*: Nota de 1 a 5 estrelas e comentário registrados no perfil do advogado, recalculando a média pública.

### Módulo: Painel do Advogado & CRM/ERP (LAWYER)
- **FR-012**: O advogado deve ter visualização em quadro Kanban de todos os seus casos por status (Ativo, Concluído, Cancelado).
  - *Critério de Aceite*: Movimentação de cards atualiza o status do processo no banco de dados e notifica o cliente.
- **FR-013**: O advogado deve poder contratar serviços de eficiência jurídica (ex: minutas com IA, bots de tribunal, revisões).
  - *Critério de Aceite*: Motor de provisionamento altera status para `PROVISIONED` e debita saldo de tokens/créditos.
- **FR-014**: O advogado deve poder delegar tarefas e pesquisas para estagiários vinculados ao seu perfil.
  - *Critério de Aceite*: Tarefa atribuída surge no painel do estagiário com prazo, orientações e status de execução.

### Módulo: Hub do Estagiário (INTERN)
- **FR-015**: O estagiário deve registrar suas atividades diárias e quantidade de horas para validação do advogado supervisor.
  - *Critério de Aceite*: Registro fica pendente até aprovação explícita do advogado; contagem de horas da Lei 11.788/08 é incrementada após aprovação.
- **FR-016**: O estagiário deve ter acesso ao Simulador do Exame da OAB com questões objetivas e feedback instantâneo da IA.
  - *Critério de Aceite*: Apresentação das questões, cálculo da nota final e explicação jurídica fundamentada para cada alternativa.

### Módulo: Portal do Secretariado (SECRETARY)
- **FR-017**: O secretário deve visualizar a sala de espera digital contendo os clientes aguardando atendimento presencial ou virtual.
  - *Critério de Aceite*: Alteração de status para "Em Atendimento" ou "Concluído" atualiza o painel do advogado em tempo real.
- **FR-018**: O secretário deve registrar chamados e mensagens de clientes direcionando para os advogados responsáveis.
  - *Critério de Aceite*: Registro da mensagem com data/hora e notificação emitida no painel do advogado.

### Módulo: Copiloto IA Jurídico (AI)
- **FR-019**: O copiloto de IA deve gerar rascunhos de minutas processuais (petição inicial, contestação, recurso) com indicação clara de que é um documento preliminar.
  - *Critério de Aceite*: Texto gerado contém disclaimer mandatório exigido pela OAB sobre a necessidade de revisão profissional.
- **FR-020**: A IA deve ser impedida de tomar decisões jurídicas autônomas ou emitir pareceres definitivos sem supervisão humana.
  - *Critério de Aceite*: Respostas sobre pareceres são qualificadas com instrução de validação por advogado habilitado na Ordem.

### Módulo: Financeiro, Escrow & Provisionamento (FINANCE)
- **FR-021**: O pagamento da consulta do cliente deve ser mantido em conta de custódia (*Escrow*) até a realização do atendimento.
  - *Critério de Aceite*: Liberação do valor ao advogado acontece somente após confirmação da consulta ou decurso de prazo de contestação.
- **FR-022**: O motor de provisionamento de serviços deve ser idempotente, utilizando o ID da transação no gateway como chave única.
  - *Critério de Aceite*: Re-execução da chamada de webhooks com o mesmo `paymentId` não duplica o serviço nem os créditos.

### Módulo: Administração & Compliance (ADMIN)
- **FR-023**: O painel administrativo deve exibir métricas financeiras globais (MRR, GMV, total de advogados, provisionamentos com falha).
  - *Critério de Aceite*: Gráficos e números recalculados com precisão a partir das tabelas `service_provisionings` e `users`.
- **FR-024**: Todos os eventos administrativos e acessos sensíveis devem gravar log de auditoria encadeado via SHA-256/HMAC.
  - *Critério de Aceite*: Cada registro possui `previousHash` do registro anterior; alteração direta no banco corrompe o hash e alerta auditoria.

---

## 10. REQUISITOS NÃO FUNCIONAIS (NFR)

- **NFR-001 (Segurança / Encriptação)**: Todos os dados sensíveis (CPF, RG, documentos sigilosos de processos) devem ser encriptados no banco de dados com AES-256-GCM.
- **NFR-002 (Disponibilidade)**: A plataforma deve manter disponibilidade mínima de 99.9% (uptime) em regime 24/7.
- **NFR-003 (Performance / CWV)**: O tempo de resposta inicial das telas (Largest Contentful Paint - LCP) não deve exceder 1.5 segundos.
- **NFR-004 (Escalabilidade)**: A arquitetura deve suportar até 50.000 usuários simultâneos via execução descentralizada e stateless.
- **NFR-005 (Privacidade / LGPD)**: Implementar controle estrito de consentimento (Art. 7º LGPD) e mecanismo de solicitação de Direitos do Titular (Art. 18 LGPD).
- **NFR-006 (Acessibilidade)**: A interface web deve seguir as diretrizes WCAG 2.1 nível AA, garantindo navegação por teclado e contraste adequado.
- **NFR-007 (Auditabilidade Imutável)**: A tabela de logs de auditoria deve ser append-only, com políticas PostgreSQL RLS impedindo UPDATE e DELETE.
- **NFR-008 (Observabilidade)**: O sistema deve registrar exceções globais via ErrorBoundary com suporte a envio de telemetria e rastreamento.

---

## 11. REGRAS DE NEGÓCIO (BR)

- **BR-001 (Captação Ética OAB)**: É estritamente vedado o uso da plataforma para mercantilização da advocacia ou aviltamento de honorários (Provimento 205/2021 OAB).
- **BR-002 (Lei do Estágio - Lei 11.788/2008)**: Horas de estágio registradas só têm validade acadêmica quando vinculadas e aprovadas por Advogado Supervisor com OAB ativa.
- **BR-003 (Impersonamento Auditado)**: Sessões de Modo Espelho por administradores só podem ocorrer sob justificativa explícita de suporte ou compliance e duram no máximo 30 minutos.
- **BR-004 (Retenção de Dados / Soft Delete)**: Nenhum dado de processo ou usuário é deletado fisicamente via DELETE; todas as tabelas utilizam `deletedAt` para conformidade com a LGPD e guarda regulatória de 5 anos.
- **BR-005 (Zero-Trust RBAC)**: Nenhuma rota ou API assume permissão implícita; todas as requisições checam a matriz `ROLE_PERMISSIONS` e o nível numérico da Role.

---

## 12. MODELO DE DADOS (PRISMA / POSTGRESQL)

### Diagrama Entidade-Relacionamento Resumido:

```text
  ┌──────────┐        1:1        ┌──────────────────┐
  │   User   ├───────────────────► LawyerProfile    │
  └────┬─────┘                   └────────┬─────────┘
       │                                  │
       │ 1:N                              │ 1:N
       ▼                                  ▼
  ┌──────────┐       N:1         ┌──────────────────┐
  │   Case   │◄──────────────────┤ ServiceProvision │
  └──────────┘                   └──────────────────┘
       │ 1:N
       ▼
  ┌──────────┐
  │CaseStage │
  └──────────┘
```

### Entidades Mapeadas:
1. `User` (id, email, passwordHash, role, name, cpf, phone, active, deletedAt).
2. `LawyerProfile` (id, userId, oab, oabUf, specialties, city, state, bio, consultationFee, status, aiTokenBalance).
3. `InternProfile` (id, userId, university, semester, hoursCompleted, supervisorLawyerId).
4. `SecretaryProfile` (id, userId, areasOfKnowledge, availability, assignedLawyerId).
5. `PlatformStaff` (id, name, email, role, department, active, permissions).
6. `ImpersonationSession` (id, staffId, targetUserId, justification, startedAt, expiresAt, auditLogId).
7. `StaffAuditLog` (id, timestamp, action, actorId, targetId, details, previousHash, hash, severity).
8. `Case` (id, title, description, status, group, clientId, lawyerId, clientCpfHash, processDocuments).
9. `CaseStage` (id, caseId, name, status, order, completedAt).
10. `ServiceProvisioning` (id, paymentId, userId, serviceId, amount, status, provisionedAt).

---

## 13. MATRIZ DE PERMISSÕES RBAC (ROLES X RECURSOS)

| RECURSO | Super Admin | Admin | Auditor Compliance | Gestor Financeiro | Suporte L1 | Advogado | Estagiário | Secretária | Cliente |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Painel Admin Geral** |  |  | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Impersonamento** |  | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Gestão Financeira** |  |  | ❌ |  | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Aprovação de OAB** |  |  |  | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Dashboard Advogado** | 👁️ | 👁️ | ❌ | ❌ | ❌ |  | ❌ | ❌ | ❌ |
| **Dashboard Estagiário**| 👁️ | 👁️ | ❌ | ❌ | ❌ | ❌ |  | ❌ | ❌ |
| **Dashboard Secretária**| 👁️ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |  | ❌ |
| **Dashboard Cliente** | 👁️ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |  |
| **Uso da IA Jurídica** |  |  | ❌ | ❌ | ❌ |  |  | ❌ | ❌ |

---

## 14. MATRIZ DE CAPACIDADES DE ASSINATURA & FEATURE FLAGS

| CAPACIDADE | PLANO BRONZE | PLANO PRATA | PLANO OURO | ENTERPRISE | ON-DEMAND |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Perfil no Marketplace** | Basic | Destacado | Premium Top | Custom | — |
| **Limite de Casos Ativos** | Até 15 | Até 50 | Ilimitado | Ilimitado | — |
| **Tokens de IA por Mês** | 10.000 | 50.000 | 250.000 | Customizado | Compra avulsa |
| **Bots de Tribunal** | 0 | 2 | 10 | Ilimitado | Compra avulsa |
| **Gestão de Estagiários** | 1 | 3 | 10 | Ilimitado | — |
| **Suporte Prioritário** | Email | Chat 12h | Chat 24/7 | Gerente Dedicado | — |

---

## 15. INTELIGÊNCIA ARTIFICIAL & GUARDRAILS ÉTICOS

A IA da Legis Connect atua estritamente sob o ecossistema Gemini (Google AI), obedecendo ao seguinte pipeline de segurança:

```text
Entrada do Usuário (Prompt)
  ↓
Filtro de Conteúdo & Moderation Service
  ↓
Injeção de Guardrail Jurídico (Provimento 205/2021 OAB)
  ↓
Processamento Gemini 2.5/3.0
  ↓
Adição Automática de Disclaimer Mandatório
  ↓
Log de Uso & Custo (aiUsageLogService)
  ↓
Entrega ao Advogado para Validação Humana
```

---

## 16. QUADRO REGULATÓRIO & CONFORMIDADE LEGAL

1. **Constituição Federal (CF/88)**: Garantia de proteção a dados pessoais (Art. 5º, LXXIX) e devido processo legal.
2. **Estatuto da Advocacia (Lei 8.906/94)**: Preservação da prerrogativa dos advogados e inviolabilidade de documentos.
3. **Provimento OAB nº 205/2021**: Regras sobre publicidade, marketing jurídico e uso de tecnologia sem aviltamento.
4. **Código de Ética e Disciplina da OAB**: Vedação à captação indevida de clientela e mercantilização.
5. **LGPD (Lei 13.709/2018)**: Atendimento integral aos princípios de finalidade, necessidade, transparência e segurança.
6. **Lei do Estágio (Lei 11.788/2008)**: Obrigatoriedade de supervisão por profissional habilitado na OAB.
7. **Marco Civil da Internet (Lei 12.965/2014)**: Guarda de registros de acesso sob sigilo.

---

## 17. CRITÉRIOS DE ACEITE E DEFINITION OF DONE (DoD)

Uma funcionalidade só será considerada **CONCLUÍDA** quando atender cumulativamente a:
- [x] Requisito documentado formalmente com ID no PRD.
- [x] Código-fonte implementado sem erros de compilação ou linter (`tsc --noEmit`).
- [x] Persistência em banco de dados validada com soft delete e encriptação.
- [x] Verificação de permissões RBAC testada para todas as roles.
- [x] Interface do usuário responsiva e alinhada ao Design System Tokens.
- [x] Registro de auditoria gravado para ações administrativas.
- [x] Testes unitários/integração automatizados executados com sucesso.

---

## 18. GLOSSÁRIO

- **Escrow**: Conta de custódia onde o valor contratado fica retido até a prestação do serviço.
- **RBAC**: *Role-Based Access Control* (Controle de Acesso Baseado em Papéis).
- **RLS**: *Row-Level Security* (Segurança em Nível de Linha no banco PostgreSQL).
- **Impersonamento**: Capacidade concedida ao Super Admin de visualizar o sistema exatamente como outro usuário para fins de suporte e auditoria.
- **SAR**: *Subject Access Request* (Solicitação do Titular de Dados para exercício de direitos LGPD).

---
**FIM DO DOCUMENTO NORMATIVO PRD MASTER LEGIS CONNECT**
