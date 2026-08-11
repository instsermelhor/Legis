# LEGIS CONNECT — SYSTEM INTERACTION & ARCHITECTURE BLUEPRINT (UML MASTER)

**Documento Oficial de Engenharia Reversa, Diagramação UML e Arquitetura de Software**  
**Versão**: 1.0.0 — Enterprise Master Edition  
**Data**: Agosto de 2026  
**Status**: Aprovado / Normativo  

---

## 1. VISÃO GERAL DA ARQUITETURA

A plataforma **Legis Connect** foi projetada sob os princípios da **Arquitetura Desacoplada Orientada a Serviços (SOA)**, **Domain-Driven Design (DDD)** e **Zero-Trust Security**. 

O sistema integra o ecossistema jurídico através de camadas limpas de apresentação, aplicação, domínio, infraestrutura e persistência, suportadas por auditoria imutável encadeada por criptografia.

---

## 2. CONTEXT DIAGRAM (C4 MODEL - NÍVEL 1)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SISTEMA LEGIS CONNECT                                  │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      │                  │                   │                   │                  │
┌─────▼──────┐    ┌──────▼─────┐      ┌──────▼─────┐      ┌──────▼─────┐     ┌─────▼──────┐
│  CLIENTE   │    │  ADVOGADO  │      │ ESTAGIÁRIO │      │ SECRETÁRIA │     │ SUPER ADMIN│
└─────┬──────┘    └──────┬─────┘      └──────┬─────┘      └──────┬─────┘     └─────┬──────┘
      │                  │                   │                   │                  │
      └──────────────────┴───────────────────┼───────────────────┴──────────────────┘
                                             │ HTTPS / WSS
                                ┌────────────▼────────────┐
                                │ API GATEWAY & APP LAYER │
                                └────────────┬────────────┘
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      │                  │                   │                   │                  │
┌─────▼──────┐    ┌──────▼─────┐      ┌──────▼─────┐      ┌──────▼─────┐     ┌─────▼──────┐
│ POSTGRESQL │    │ GOOGLE AI  │      │  GATEWAY   │      │ AUDIT CHAIN│     │ SUPABASE   │
│  WITH RLS  │    │  GEMINI    │      │ PAGAMENTOS │      │ HMAC-SHA256│     │   STORAGE  │
└────────────┘    └────────────┘      └────────────┘      └────────────┘     └────────────┘
```

---

## 3. COMPONENT ARCHITECTURE DIAGRAM (C4 MODEL - NÍVEL 2)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                               FRONTEND APPLICATION (SPA)                                 │
│   React 19 + TypeScript + Vite + AppDataContext + AuthContext + Lazy Loaded Views        │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │ JSON REST / HTTP Headers
┌────────────────────────────────────────────▼─────────────────────────────────────────────┐
│                             API GATEWAY & CONTROL LAYER                                  │
│   - Route Handler (App.tsx / View Switcher)                                              │
│   - Security & Scope Gate (security/scopeValidator.ts)                                   │
│   - RBAC Permission Engine (security/rbac.ts)                                            │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │
┌────────────────────────────────────────────▼─────────────────────────────────────────────┐
│                                 APPLICATION SERVICES LAYER                               │
│  ┌────────────────────┐ ┌────────────────────┐ ┌───────────────────┐ ┌─────────────────┐ │
│  │   AuthService      │ │   StaffService     │ │ProvisioningService│ │  EscrowService  │ │
│  └────────────────────┘ └────────────────────┘ └───────────────────┘ └─────────────────┘ │
│  ┌────────────────────┐ ┌────────────────────┐ ┌───────────────────┐ ┌─────────────────┐ │
│  │   GeminiService    │ │   LgpdRightsService│ │ AuditLogger (HMAC)│ │ DbService (ORM) │ │
│  └────────────────────┘ └────────────────────┘ └───────────────────┘ └─────────────────┘ │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │ PostgreSQL Client / AES-GCM Crypto
┌────────────────────────────────────────────▼─────────────────────────────────────────────┐
│                             DATA & INFRASTRUCTURE LAYER                                  │
│   PostgreSQL Engine + Prisma Schema + Row-Level Security (RLS) + Soft Delete (`deletedAt`)│
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. DIAGRAMA DE CLASSES E ENTIDADES (DDD DOMAINS)

### 4.1. Domínio de Identidade (`Identity`)
```text
┌────────────────────────────────────────────────────────┐
│                        User                            │
├────────────────────────────────────────────────────────┤
│ + id: String [UUID]                                    │
│ + email: String [Unique]                               │
│ + passwordHash: String [PBKDF2]                        │
│ + role: UserRole                                       │
│ + name: String                                         │
│ + cpf: String? [Encrypted AES-GCM]                     │
│ + phone: String?                                       │
│ + active: Boolean                                      │
│ + createdAt: DateTime                                  │
│ + deletedAt: DateTime?                                 │
└────────────────────────────────────────────────────────┘
```

### 4.2. Domínio Jurídico (`Legal`)
```text
┌─────────────────────────────────────┐      ┌─────────────────────────────────────┐
│           LawyerProfile             │      │                Case                 │
├─────────────────────────────────────┤      ├─────────────────────────────────────┤
│ + id: String [UUID]                 │      │ + id: String [UUID]                 │
│ + userId: String [FK -> User]       │ 1  * │ + title: String                     │
│ + oab: String [Unique]              ├──────► + description: String?              │
│ + oabUf: String                     │      │ + status: CaseStatus                │
│ + specialties: String[]             │      │ + clientId: String [FK -> User]     │
│ + consultationFee: Decimal?         │      │ + lawyerId: String [FK -> Lawyer]   │
│ + status: String                    │      │ + processDocuments: String? [AES]   │
└─────────────────────────────────────┘      └──────────────────┬──────────────────┘
                                                                │ 1
                                                                │
                                                                │ *
                                             ┌──────────────────▼──────────────────┐
                                             │              CaseStage              │
                                             ├─────────────────────────────────────┤
                                             │ + id: String [UUID]                 │
                                             │ + caseId: String [FK -> Case]       │
                                             │ + name: String                      │
                                             │ + status: String                    │
                                             │ + order: Int                        │
                                             └─────────────────────────────────────┘
```

### 4.3. Domínio Acadêmico & Estágio (`Academic`)
```text
┌─────────────────────────────────────┐      ┌─────────────────────────────────────┐
│            InternProfile            │      │          SecretaryProfile           │
├─────────────────────────────────────┤      ├─────────────────────────────────────┤
│ + id: String [UUID]                 │      │ + id: String [UUID]                 │
│ + userId: String [FK -> User]       │      │ + userId: String [FK -> User]       │
│ + university: String                │      │ + areasOfKnowledge: String[]        │
│ + hoursCompleted: Int               │      │ + availability: String              │
│ + supervisorLawyerId: String? [OAB] │      │ + assignedLawyerId: String?         │
└─────────────────────────────────────┘      └─────────────────────────────────────┘
```

### 4.4. Domínio de Segurança & Staff (`Security & Audit`)
```text
┌─────────────────────────────────────┐      ┌─────────────────────────────────────┐
│            PlatformStaff            │      │            StaffAuditLog            │
├─────────────────────────────────────┤      ├─────────────────────────────────────┤
│ + id: String [UUID]                 │      │ + id: String [UUID]                 │
│ + name: String                      │      │ + timestamp: DateTime               │
│ + email: String [Unique]            │      │ + action: String                    │
│ + role: StaffRole                   │      │ + actorId: String                   │
│ + permissions: String[]             │      │ + previousHash: String              │
│ + active: Boolean                   │      │ + hash: String [HMAC-SHA256]        │
└──────────────────┬──────────────────┘      └─────────────────────────────────────┘
                   │ 1
                   │ *
┌──────────────────▼──────────────────┐
│        ImpersonationSession         │
├─────────────────────────────────────┤
│ + id: String [UUID]                 │
│ + staffId: String [FK -> Staff]     │
│ + targetUserId: String              │
│ + justification: String [Min 20]    │
│ + expiresAt: DateTime [Max 30m]     │
└─────────────────────────────────────┘
```

---

## 5. DIAGRAMAS DE SEQUÊNCIA (WORKFLOWS CRÍTICOS)

### 5.1. Sequência: Login, Autenticação MFA e Modo Espelho
```text
Usuário/Staff         Frontend (React)       AuthService       RBAC / StaffService      PostgreSQL/Audit
      │                     │                     │                     │                     │
      │── 1. Credenciais ──►│                     │                     │                     │
      │                     │── 2. verifyPass ───►│                     │                     │
      │                     │                     │── 3. Check User ───►│                     │
      │                     │                     │                     │── 4. Query DB ─────►│
      │                     │                     │◄── 5. User Data ────│◄── User Record ─────│
      │                     │◄── 6. Require MFA ──│                     │                     │
      │── 7. Token TOTP ───►│                     │                     │                     │
      │                     │── 8. Verify TOTP ──►│                     │                     │
      │                     │                     │── 9. Grant Session ►│                     │
      │                     │                     │                     │── 10. Audit Log ───►│
      │◄── 11. Redireciona ─│◄── Session JWT ─────│                     │                     │
```

### 5.2. Sequência: Busca Jurídica & Matching por IA
```text
  Cliente             Landing Page          GeminiService       LawyerSearchService     PostgreSQL (DB)
     │                     │                      │                      │                     │
     │── 1. Relato Caso ──►│                      │                      │                     │
     │                     │── 2. Call IA Match ─►│                      │                     │
     │                     │                      │── 3. Prompt Gemini ─►│                     │
     │                     │                      │◄── 4. Areas & Urg ───│                     │
     │                     │◄── 5. Extracted Area ┤                      │                     │
     │                     │── 6. Query Filters ────────────────────────►│                     │
     │                     │                                             │── 7. Select Lawyers►│
     │                     │                                             │◄── 8. Advogados ────│
     │◄── 9. Advs Exibidos ┼◄── Results Match ───────────────────────────│                     │
```

### 5.3. Sequência: Delegação de Tarefas a Estagiários e Registro de Horas (Lei 11.788/08)
```text
 Advogado Supervisor      Frontend/Kanban       InternDashboard      DbService / Audit     PostgreSQL
          │                      │                     │                     │                  │
          │── 1. Cria Tarefa ───►│                     │                     │                  │
          │                      │── 2. Delegate ─────►│                     │                  │
          │                      │                     │── 3. Salva Tarefa ─►│                  │
          │                      │                     │                     │── 4. Insert ────►│
          │                      │                     │◄── 5. Tarefa Lista ─┤◄── Task Created ─│
          │                      │                     │                     │                  │
          │                      │    Estagiário Executa & Registra Horas    │                  │
          │                      │                     │                     │                  │
          │                      │◄── 6. Submete Horas ┤                     │                  │
          │── 7. Aprova Horas ──►│                     │                     │                  │
          │                      │── 8. Update Hours ───────────────────────►│                  │
          │                      │                                           │── 9. Increment ─►│
```

### 5.4. Sequência: Pagamento Protegido em Escrow e Provisionamento
```text
  Cliente               ClientPortal         EscrowService      ProvisioningService    Gateway Pagamento
     │                       │                     │                     │                     │
     │── 1. Contrata Cons. ─►│                     │                     │                     │
     │                       │── 2. Create Escrow ─►                     │                     │
     │                       │                     │── 3. Pay Request ──►│                     │
     │                       │                     │                     │── 4. Process Pay ──►│
     │                       │                     │                     │◄── 5. Webhook OK ───│
     │                       │                     │◄── 6. Status HELD ──┤                     │
     │                       │◄── 7. Confirm Ret. ─┤                     │                     │
     │                       │                     │                     │                     │
     │      [Atendimento Realizado / Consulta Concluída pelo Advogado]                         │
     │                       │                     │                     │                     │
     │── 8. Aceite Cliente ─►│                     │                     │                     │
     │                       │── 9. Release Escrow ┤                     │                     │
     │                       │                     │── 10. Transfer Pay ──────────────────────►│
     │                       │◄── 11. Status REL. ─┤                     │                     │
```

---

## 6. DIAGRAMAS DE ESTADO (STATE MACHINES)

### 6.1. State Machine: Usuário (`User Account`)
```text
   ┌───────────┐         Validação OAB / Email        ┌──────────┐
   │  PENDING  ├─────────────────────────────────────►│  ACTIVE  │
   └─────┬─────┘                                      └────┬─────┘
         │                                                 │
         │ Falha de Documento / Violação                   │ Suspensão OAB / Inadimplência
         ▼                                                 ▼
   ┌───────────┐                                      ┌──────────┐
   │ REJECTED  │                                      │SUSPENDED │
   └───────────┘                                      └────┬─────┘
                                                           │
                                                           │ Reativação / Regularização
                                                           ▼
                                                      ┌──────────┐
                                                      │ BLOCKED  │
                                                      └──────────┘
```

### 6.2. State Machine: Provisionamento de Serviços (`ServiceProvisioning`)
```text
 ┌──────────┐    Webhook Received     ┌───────────────┐   Deliver Success   ┌─────────────┐
 │ PENDING  ├────────────────────────►│  IN_PROGRESS  ├────────────────────►│ PROVISIONED │
 └────┬─────┘                         └───────┬───────┘                     └─────────────┘
      │                                       │
      │ Expiração                             │ Falha API Externa
      ▼                                       ▼
 ┌──────────┐                         ┌───────────────┐   Reembolso          ┌─────────────┐
 │ EXPIRED  │                         │PROVISION_FAIL ├────────────────────►│  REFUNDED   │
 └──────────┘                         └───────────────┘                     └─────────────┘
```

### 6.3. State Machine: Escrow de Pagamento (`EscrowTransaction`)
```text
 ┌──────────┐    Pagamento Confirmado ┌───────────────┐   Serviço Entregue  ┌─────────────┐
 │ CREATED  ├────────────────────────►│     HELD      ├────────────────────►│  RELEASED   │
 └──────────┘                         └───────┬───────┘                     └─────────────┘
                                              │
                                              │ Contestação / Desistência
                                              ▼
                                      ┌───────────────┐   Procedente        ┌─────────────┐
                                      │   DISPUTED    ├────────────────────►│  REFUNDED   │
                                      └───────────────┘                     └─────────────┘
```

---

## 7. DATA FLOW DIAGRAM (DFD) COM MARCAÇÃO DE DADOS SENSÍVEIS LGPD

```text
 (Usuário Cliente) ──[ Nome, Email, CPF (PII Encrypted) ]──► [ Processo 1.0 Auth & Onboarding ]
                                                                      │
                                                           ┌──────────┴──────────┐
                                                           ▼                     ▼
                                                    (Tabela `users`)    (Tabela `lawyer_profiles`)
                                                           │
                                                           ▼
 (Advogado OAB) ───[ Petição / Documento de Processo ]───► [ Processo 2.0 Gestão Processual ]
                                                                      │
                                                                      ▼
                                                            (Tabela `cases` - AES-256)
                                                                      │
                                                                      ▼
                                                          [ Processo 3.0 Auditoria Imutável ]
                                                                      │
                                                                      ▼
                                                            (Tabela `staff_audit_logs`)
                                                            (Encadeamento HMAC-SHA256)
```

---

## 8. API INTERACTION MAP

| ENDPOINT / SERVIÇO | CONTROLLER / HANDLER | DOMAIN SERVICE | DATABASE TABLE | PROTOCOLO |
| :--- | :--- | :--- | :--- | :--- |
| `auth.signInWithPassword` | [`LoginForm.tsx`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/components/auth/LoginForm.tsx) | [`authService.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/services/authService.ts) | `users` | HTTPS / REST |
| `staff.startImpersonation`| [`DelegationManager.tsx`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/components/admin/DelegationManager.tsx) | [`staffService.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/services/staffService.ts) | `impersonation_sessions` | HTTPS / REST |
| `gemini.analyzeCase` | [`LandingPage.tsx`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/components/landing/LandingPage.tsx) | [`geminiService.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/services/geminiService.ts) | — (AI Proxy) | HTTPS / JSON |
| `escrow.release` | [`ClientPortalModal.tsx`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/components/client/ClientPortalModal.tsx) | [`escrowService.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/services/escrowService.ts) | `service_provisionings` | HTTPS / REST |
| `provisioning.process` | [`EfficiencyServicesPage.tsx`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/components/client/EfficiencyServicesPage.tsx)| [`provisioningService.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/services/provisioningService.ts)| `service_provisionings` | HTTPS / REST |

---

## 9. AUDITORIA DE DEPENDÊNCIAS & ACOPLAMENTO

- **Inexistência de Dependências Circulares**: Todos os serviços em `services/` consomem primariamente a camada de segurança em `security/` e utilitários de infraestrutura sem chamadas cíclicas.
- **Isolamento de Tenant**: Clientes e Advogados navegam sob isolamento lógico estrito reforçado pelas RLS Policies do PostgreSQL.
- **Zero-Trust Validation**: O arquivo [`security/rbac.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/security/rbac.ts) centraliza os níveis numéricos das Roles (`ROLE_LEVELS`) e o mapeamento explicito de permissões (`ROLE_PERMISSIONS`).

---
**FIM DO BLUEPRINT ARQUITETURAL UML MASTER LEGIS CONNECT**
