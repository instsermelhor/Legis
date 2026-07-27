# 💬 ENTERPRISE COMMUNICATION, CRM & CUSTOMER EXPERIENCE BLUEPRINT — LEGIS CONNECT
**PROMPT 023 — Auditoria Completa de Arquitetura de Comunicação, CRM Jurídico, Atendimento Omnichannel, Chat e Experiência do Cliente**
**Chief Customer Experience Architect (CCXA) | Enterprise CRM Architect & Omnichannel Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A arquitetura de comunicação e atendimento atual da Legis Connect é **fragmentada e dependente de interações não gerenciadas** fora da plataforma. Não há um serviço centralizado de notificações, o atendimento ao cliente é simulado na interface, não existe um CRM especializado para o funil jurídico de captação de clientes, o chat em tempo real não utiliza servidores de WebSockets e não há integração nativa com o **WhatsApp Business API (Meta)**, e-mails transacionais seguros ou videoconferência protegida para audiências e consultas.

**Diagnóstico de Comunicação & CRM**:
- **Maturidade de Comunicação (AS-IS)**: `1.0 / 5.0` (Inicial / Sem Servidor de Comunicação em Tempo Real).
- **Risco Negocial & Sigilo**: **CRÍTICO**. O envio não criptografado de mensagens e anexos em navegadores locais viola os preceitos de **Sigilo Profissional da OAB (Art. 7º, II do EAOAB)** e a **LGPD**.
- **Ineficiência Operacional**: Perda de oportunidades de contratação devido à falta de régua de automação, lembretes de audiências e acompanhamento do funil de vendas dos escritórios.

**Objetivo Arquitetural TO-BE**: Implementar o **Enterprise Communication & Legal CRM Engine**, construído sobre um **Communication Gateway NestJS**, servidor de Chat em Tempo Real **Socket.IO + Redis Pub/Sub**, videoconferência privada **WebRTC (LiveKit)**, disparador omnichannel **WhatsApp Cloud API + SendGrid + FCM Push**, **CRM Jurídico completo** com funil de pipeline, central inteligente de notificações e motor de **Customer Success (Health Score & NPS)**.

---

## ETAPA 1 — INVENTÁRIO DOS FLUXOS DE COMUNICAÇÃO

### 1.1 Matriz de Mapeamento dos Fluxos Comunicacionais

| Fluxo de Comunicação | Canais Utilizados | Criticidade | Frequência | Prioridade TO-BE |
|---|---|---|---|---|
| **Cliente ↔ Advogado** | Chat Web, WhatsApp, Vídeo, E-mail | 🔴 Extrema | Alta (Diária) | 🔴 CRÍTICA (COM-001) |
| **Cliente ↔ Escritório** | Atendimento Omnichannel, CRM | 🔴 Extrema | Alta | 🔴 CRÍTICA (COM-002) |
| **Cliente ↔ Plataforma** | Notificações Push, E-mail Transacional | 🟠 Alta | Média | 🟠 ALTA |
| **Advogado ↔ Plataforma** | Alertas de Prazos, Billing, Suporte | 🔴 Extrema | Alta | 🔴 CRÍTICA |
| **Escritório ↔ Equipe** | Chat Interno, Menções em Peças | 🟠 Alta | Diária | 🟠 ALTA |
| **IA ↔ Usuário** | Interface Conversacional, Sugestões | 🔴 Extrema | Alta | 🔴 CRÍTICA |
| **Sistema ↔ Notificação** | Webhooks, Fila BullMQ, SMS, Push | 🔴 Extrema | Contínua | 🔴 CRÍTICA |

---

## ETAPA 2 — ARQUITETURA GERAL DE COMUNICAÇÃO (TO-BE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ENTERPRISE COMMUNICATION ARCHITECTURE (TO-BE)               │
│                                                                             │
│  [ Clients: Web React 19 / Mobile Apps / WhatsApp Users ]                   │
│                            │                                                │
│                            ▼ HTTPS / WSS TLS 1.3                            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ CLOUDFLARE WAF + COMMUNICATION GATEWAY (NestJS WSS Gateway Engine)   │   │
│  └─────────────────────────────────┬────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼ Socket.IO / Event Bus                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ COMMUNICATION SERVICES LAYER                                         │   │
│  │                                                                      │   │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │   │
│  │  │ Chat Service     │ │ Legal CRM Module │ │ Video Service    │  │   │
│  │  │ (Socket.IO/Redis)│ │ (Pipeline/Leads) │ │ (WebRTC LiveKit) │  │   │
│  │  └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘  │   │
│  │           │                    │                    │            │   │
│  │  ┌────────┴─────────┐ ┌────────┴─────────┐ ┌────────┴─────────┐  │   │
│  │  │ WhatsApp Service │ │ Email Service    │ │ Push Service     │  │   │
│  │  │ (Meta Cloud API) │ │ (SendGrid / SES) │ │ (FCM / WebPush)  │  │   │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘  │   │
│  └─────────────────────────────────┬────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼ Persistence & Queues                   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ DATA & QUEUE LAYER                                                   │   │
│  │ ├── PostgreSQL Chat & CRM Tables (Encrypted Messages & Leads)        │   │
│  │ ├── Redis Pub/Sub (Socket.IO Adapter Multi-Server Cluster)          │   │
│  │ └── BullMQ Notification Queue (Fila Assíncrona de Disparos)          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 3 — CRM JURÍDICO ENTERPRISE (`Legal CRM`)

### 3.1 Funil de Atendimento e Conversão de Leads

```
                            FUNIL DE CAPTAÇÃO DO CRM JURÍDICO
                            ═════════════════════════════════

  1. PROSPECÇÃO (Lead) ──────► Cliente realiza busca no portal público
  2. PRIMEIRA CONSULTA ──────► Agendamento de videochamada ou chat
  3. PROPOSTA EMITIDA ───────► Envio do contrato de honorários com assinatura digital
  4. EM ANDAMENTO (Cliente) ──► Processo iniciado; atualizações automáticas via WhatsApp
  5. RETENÇÃO & FIDELIZAÇÃO ──► Pesquisa NPS pós-caso + lembretes de revisão preventiva
```

---

## ETAPA 4 — MAPEAMENTO COMPLETO DA CUSTOMER JOURNEY

* **Jornada do Cliente**: Descoberta no portal -> Agendamento assistido -> Assinatura digital ICP-Brasil em 1 clique -> Acompanhamento via WhatsApp em tempo real -> Avaliação NPS.
* **Jornada do Advogado**: Notificação instantânea de novo lead -> Atendimento integrado no Chat -> Minuta automática de proposta por IA -> Recebimento do split com confirmação bancária.

---

## ETAPA 5 — CENTRAL OMNICHANNEL (FILA UNIFICADA DE ATENDIMENTO)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FILA UNIFICADA DE ATENDIMENTO OMNICHANNEL                │
│                                                                             │
│  [ Entradas: WhatsApp + Web Chat + E-mail + Formulário ]                    │
│                            │                                                │
│                            ▼ Unified Ingestion                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ OMNICHANNEL DISPATCH ENGINE                                          │   │
│  │ • Roteamento Inteligente: Envia para o Advogado responsável do Caso   │   │
│  │ • Triagem Inicial por IA: Resposta instantânea a dúvidas frequentes  │   │
│  │ • Histórico Único: O mesmo histórico exposto independente do canal   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 6 — CHAT CORPORATIVO EM TEMPO REAL (`Socket.IO + Redis Pub/Sub`)

### 6.1 Especificação do Servidor de Chat

- **Tecnologia**: **Socket.IO v4** sobre NestJS WebSockets Gateway.
- **Escalabilidade**: **Redis Pub/Sub Adapter** sincronizando estados de conexão entre múltiplas instâncias ECS Fargate.
- **Recursos**: Mensagens de texto, envio de anexos (PDFs com Presigned S3 URLs), áudios formatados, confirmação de leitura (`delivered` / `read`), digitação em tempo real (*typing indicator*) e criptografia de canal TLS 1.3.

---

## ETAPA 7 — ARQUITETURA DE VIDEOCONFERÊNCIA JURÍDICA (`WebRTC LiveKit`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ARQUITETURA DE VÍDEO SEGURO (LIVEKIT WEBRTC)              │
│                                                                             │
│  [ Cliente Browser / Mobile ] ◄── WebRTC SFU Media ──► [ Advogado Browser ] │
│                                         │                                   │
│                                         ▼ Direct Stream                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ LiveKit Server Cluster (AWS ECS Fargate)                             │   │
│  │ • Criptografia SRTP / DTLS ponta a ponta                             │   │
│  │ • Gravação de Audiências / Consultas com upload criptografado no S3  │   │
│  │ • Autenticação de participantes via JWT de curta duração (15 min)    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 8 — CENTRAL INTELIGENTE DE NOTIFICAÇÕES (`NotificationCenter`)

### 8.1 Priorização de Alertas da Aplicação

| Categoria de Alerta | Prioridade | Canais de Entrega | Exemplo de Notificação |
|---|---|---|---|
| **Jurídica / Prazo** | 🔴 Emergencial | Push + WhatsApp + E-mail + In-App | *"Atenção: Prazo de contestação do processo nº XXX vence hoje às 18h!"* |
| **Financeira** | 🔴 Alta | E-mail + Push + In-App | *"Pagamento do honorário recebido com sucesso (R$ 850,00)."* |
| **Segurança** | 🔴 Alta | E-mail + SMS + In-App | *"Novo login detectado a partir do IP 200.xxx.xxx em São Paulo."* |
| **Agenda / Reunião** | 🟠 Média | WhatsApp + Push | *"Sua consulta virtual com Dra. Amanda inicia em 15 minutos."* |
| **Inteligência Artificial**| 🟡 Baixa | In-App Only | *"A IA concluiu a análise do contrato anexado ao Caso #104."* |

---

## ETAPA 9 — INTEGRAÇÃO COM WHATSAPP BUSINESS API (META CLOUD API)

* **Templates Pré-Aprovados**: Uso de modelos de mensagens cadastrados na Meta para notificações ativas fora da janela de 24 horas:
  - `template_appointment_reminder`: Lembrete de consulta jurídica.
  - `template_payment_received`: Confirmação de recebimento de honorário.
  - `template_case_update`: Atualização de andamento processual via DataJud.

---

## ETAPA 10 — ARQUITETURA DE E-MAIL CORPORATIVO (AWS SES & SENDGRID)

* **Segurança de Entrega de E-mails**:
  - **SPF (Sender Policy Framework)**: Autorização de servidores IP de envio da Legis Connect.
  - **DKIM (DomainKeys Identified Mail)**: Assinatura criptográfica de 2048 bits nos cabeçalhos dos e-mails.
  - **DMARC (Domain-based Message Authentication)**: Política estrita `p=reject` impedindo spoofing do domínio `@legisconnect.com.br`.

---

## ETAPA 11 — AGENDA COMPARTILHADA (SINCRONIZAÇÃO CALDAV / ICAL)

```
                               SINCRONIZAÇÃO DE AGENDA
                               ═══════════════════════

  [ Legis Connect Calendar ] ◄── Sync CalDAV Engine ──► [ Google Calendar ]
              │                                                │
              └───────────────────┬────────────────────────────┘
                                  ▼
                        [ Microsoft Outlook 365 ]
```

---

## ETAPA 12 — PLATAFORMA DE CUSTOMER SUCCESS (HEALTH SCORE & NPS)

* **Health Score do Cliente/Escritório**: Algoritmo calculando a saúde da conta baseado em:
  - Frequência de login na plataforma (Últimos 7 dias).
  - Quantidade de processos gerenciados.
  - Tempo médio de resposta a clientes.
  - Avaliações NPS (Net Promoter Score) acumuladas.
* **Alertas de Risco de Churn**: Contas com Health Score < 50 geram automaticamente um card no dashboard da equipe de CS para intervenção proativa.

---

## ETAPA 13 — AUTOMAÇÃO DE COMUNICAÇÃO (RÉGUAS DE RELACIONAMENTO)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     RÉGUAS DE AUTOMAÇÃO DE COMUNICAÇÃO                      │
│                                                                             │
│  1. ONBOARDING CLIENTE ──► E-mail de Boas-Vindas + Tour Guiado pelo App     │
│  2. LEMBRETE AUDIÊNCIA ──► SMS/WhatsApp em D-3, D-1 e H-2                   │
│  3. COBRANÇA RECORRENTE ─► Lembrete de vencimento da fatura em D-5          │
│  4. PÓS-CONSULTA ───────► Pesquisa automatizada de satisfação NPS após 2h   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 14 — COLABORAÇÃO CORPORATIVA INTERNA (SQUAD AGILITY)

* **Comunicação Interna de Escritórios**: Canais de chat privados por caso ou departamento, menções com `@nome` notificando advogados específicos, atribuição de tarefas com *deadline* e compartilhamento interno de anotações confidenciais.

---

## ETAPA 15 — GESTÃO DOCUMENTAL COMPARTILHADA COM REVISÃO EM TEMPO REAL

* **Colaboração em Minutas**: Permite que o advogado e o cliente façam comentários em parágrafos específicos de um contrato anexado, mantendo a trilha de versão e histórico de aprovações antes da assinatura final.

---

## ETAPA 16 — ANALYTICS DE COMUNICAÇÃO (KPIS DE ATENDIMENTO)

| Métrica de Atendimento | Definição | Meta Alvo |
|---|---|---|
| **TMR (Tempo Médio de Resposta)** | Tempo entre o envio da dúvida pelo cliente e a resposta do advogado. | **< 30 Minutos** (em horário comercial) |
| **SLA de Primeira Resposta** | % de atendimentos iniciados dentro do prazo acordado. | **> 98%** |
| **NPS (Net Promoter Score)** | Nota de satisfação pós-atendimento (0 a 10). | **NPS > 75 (Zona de Excelência)** |
| **FCR (First Contact Resolution)** | % de dúvidas resolvidas no primeiro contato sem réplica. | **> 80%** |

---

## ETAPA 17 — CIBERSEGURANÇA DA COMUNICAÇÃO & SIGILO OAB

* **Proteção de Sigilo Profissional (Art. 7º, II EAOAB)**: Todas as conversas de chat e gravações de videoconferência são criptografadas em repouso no banco de dados e no S3 usando chaves KMS exclusivas por escritório, garantindo a inviolabilidade do sigilo advogado-cliente.

---

## ETAPA 18 — GOVERNANÇA E MODERAÇÃO DE CONTEÚDO

* **Moderação Automática**: Filtro de palavras ofensivas ou incompatíveis com a ética profissional OAB antes da transmissão de mensagens públicas no chat do marketplace.
* **Política de Retenção de Mensagens**: Histórico de mensagens mantido e auditável por **5 anos** para atendimento à legislação vigente e defesa jurídica.

---

## ETAPA 19 — ROADMAP EVOLUTIVO DE COMUNICAÇÃO & CRM

```
                    ROADMAP DA PLATAFORMA DE COMUNICAÇÃO
                    ════════════════════════════════════

  FASE 1: CHAT TEMPO REAL & NOTIFICAÇÕES (Semanas 1-4)
  ├── Servidor Socket.IO + Redis Pub/Sub para Chat Web em tempo real
  ├── E-mails transacionais via SendGrid com SPF, DKIM e DMARC
  └── Central de Notificações In-App (`NotificationCenter`)

  FASE 2: WHATSAPP BUSINESS & CRM JURÍDICO (Semanas 5-8)
  ├── Integração oficial com WhatsApp Business Cloud API (Meta)
  ├── Módulo `Legal CRM` com Funil de Vendas e Captação de Clientes
  └── Sincronização de Agenda Compartilhada (CalDAV / Google Calendar)

  FASE 3: VIDEOCONFERÊNCIA & CUSTOMER SUCCESS (Semanas 9-12)
  ├── Plataforma de Videoconferência WebRTC com LiveKit
  ├── Engine de Customer Success (Health Score & NPS automatizado)
  └── Dashboards de Analytics de Comunicação (TMR, SLA, NPS)
```

---

## ETAPA 20 — BACKLOG TÉCNICO DE COMUNICAÇÃO

### COM-001 — Servidor de Chat em Tempo Real com Socket.IO e Redis
* **Problema**: Ausência de chat em tempo real seguro entre cliente e advogado.
* **Solução**: Implementar `ChatModule` NestJS com Socket.IO e Redis Pub/Sub Adapter.
* **Prioridade**: 🔴 EMERGENCIAL | **Complexidade**: Alta | **Esforço**: 48h

### COM-002 — Módulo de CRM Jurídico (`Legal CRM Module`)
* **Problema**: Perda de controle de oportunidades e pipeline de atendimento.
* **Solução**: Módulo de CRM completo gerenciando leads, etapas e propostas.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 56h

### COM-003 — Integração com WhatsApp Business Cloud API (Meta)
* **Problema**: Comunicação dependente de WhatsApp pessoal dos advogados sem auditoria.
* **Solução**: Integração oficial com Meta Cloud API enviando templates homologados.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 40h

### COM-004 — Central de Videoconferência WebRTC com LiveKit
* **Problema**: Necessidade de ferramentas de terceiros (Zoom/Meet) para audiências.
* **Solução**: Servidor LiveKit integrado com gravação criptografada no S3.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Alta | **Esforço**: 48h

### COM-005 — Engine de Customer Success (Health Score & NPS)
* **Problema**: Desconhecimento da insatisfação de clientes e risco de churn.
* **Solução**: Engine calculando Health Score e disparando pesquisas NPS automatizadas.
* **Prioridade**: 🟠 ALTA | **Complexidade**: Média | **Esforço**: 32h

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 023

| Entregável | Status |
|---|---|
| ✅ Inventário Completo dos Fluxos de Comunicação (Mapeamento de 7 Canais) | Concluído |
| ✅ Arquitetura Enterprise de Comunicação (Diagrama Multi-Layer TO-BE) | Concluído |
| ✅ Projeto do CRM Jurídico Enterprise (Funil de Captação e Propostas) | Concluído |
| ✅ Mapeamento da Customer Journey (Jornada do Cliente e Advogado) | Concluído |
| ✅ Central Omnichannel Fila Unificada (WhatsApp, Chat, E-mail, FCM) | Concluído |
| ✅ Arquitetura do Chat Corporativo em Tempo Real (Socket.IO + Redis Pub/Sub) | Concluído |
| ✅ Plataforma de Videoconferência (LiveKit WebRTC + S3 Gravação Criptografada) | Concluído |
| ✅ Central Inteligente de Notificações (NotificationCenter Priorizado) | Concluído |
| ✅ Integração WhatsApp Business (Meta Cloud API + Templates Homologados) | Concluído |
| ✅ Arquitetura de E-mail Corporativo (AWS SES / SendGrid com SPF/DKIM/DMARC) | Concluído |
| ✅ Sistema de Agenda Compartilhada (CalDAV / Google / Outlook Sync) | Concluído |
| ✅ Plataforma de Customer Success (Health Score & Disparo NPS Automático) | Concluído |
| ✅ Arquitetura de Automação de Comunicação (Réguas de Relacionamento D-3/D-1) | Concluído |
| ✅ Modelo de Colaboração Corporativa Interna (Canais, `@mentions`, Tarefas) | Concluído |
| ✅ Gestão Documental Compartilhada (Comentários e Revisão em Tempo Real) | Concluído |
| ✅ Analytics de Comunicação (KPIs TMR, SLA, NPS, FCR) | Concluído |
| ✅ Plano de Segurança & Sigilo OAB (Art. 7º EAOAB + Criptografia KMS) | Concluído |
| ✅ Framework de Governança da Comunicação (Retenção 5 anos & Moderação) | Concluído |
| ✅ Roadmap Evolutivo em 3 Fases (12 semanas) | Concluído |
| ✅ Backlog Técnico de Comunicação Priorizado (`COM-001` a `COM-005`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 023 — Enterprise Communication, CRM & Customer Experience Blueprint | v1.0.0*
*Próximo: PROMPT 024 — Plano Mestre de Reengenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
