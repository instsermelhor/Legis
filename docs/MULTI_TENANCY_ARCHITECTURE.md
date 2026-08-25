# LEGIS CONNECT — MULTI-TENANCY & TENANT ISOLATION ARCHITECTURE MASTER
## Arquitetura Oficial de Isolamento Total de Tenants, Boundary Enforcement e Defesa em Profundidade

**Versão Normativa Oficial:** 3.0.0 — Enterprise Tenancy Edition  
**Data de Aprovação:** 24 de Agosto de 2026  
**Classificação:** Fonte Oficial de Verdade de Tenancy & Segurança  
**Princípio Basilar:** *TENANT A NÃO PODE ACESSAR DADOS DO TENANT B — Deny by default para acesso cross-tenant sem autorização formal e auditada.*

---

## 1. VISÃO GERAL E CONCEITO DE TENANCY

A **Legis Connect** é um ecossistema digital jurídico multiusuário e multi-tenant. Cada empresa, escritório de advocacia, instituição, departamento jurídico ou profissional autônomo opera em seu próprio **Tenant Lógico Isolado**.

O isolamento de dados não depende exclusivamente de `user_id`, pois um mesmo usuário pode manter múltiplos vínculos profissionais (por exemplo, atuar no Escritório Alpha e prestar consultoria no Escritório Beta).

```text
                     LEGIS CONNECT PLATFORM
                               │
                        AUTHENTICATION
                               │
                          USER (Identity)
                               │
                    MEMBERSHIP (Vínculo Ativo)
                               │
                        TENANT CONTEXT
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       RBAC / PERMISSION                   OWNERSHIP
               │                               │
               └───────────────┬───────────────┘
                               ▼
                             SCOPE
                               │
                      BACKEND / API GUARDS
                               │
                       SERVICES & STORAGE
                               │
                      DATABASE DRIVER (lib/db)
                               │
                    POSTGRESQL RLS (USING/CHECK)
                               │
                        DADO AUTORIZADO
```

---

## 2. MAPA CONCEITUAL DE TENANTS E ENTIDADES

```text
ORGANIZAÇÃO / TENANT (Tenant Entity)
├── Código Único: FIRM_ALPHA (UUID)
├── Escritório / Office: Silva & Advogados Associados
│   ├── Equipe / Team: Contencioso Cível
│   │   ├── Membro 1: Advogado Titular (Membership A)
│   │   ├── Membro 2: Assistente Jurídico (Membership B)
│   │   └── Membro 3: Estagiário Supervisionado (Membership C)
│   ├── Clientes Vinculados (Tenant-Owned + Ownership)
│   ├── Casos / Processos (Tenant-Owned + Assigned)
│   ├── Documentos e Minutas (Tenant-Owned Storage)
│   └── Financeiro e Escrow (Tenant-Owned Ledger)
```

---

## 3. MATRIZ DE ENTIDADES E CLASSIFICAÇÃO DE ISOLAMENTO

| Entidade / Tabela | Tenant Obrigatório? | Ownership Primário | Escopo de Acesso | RLS no Banco | Acesso Cross-Tenant | Motivo / Classificação |
|---|:---:|---|---|:---:|:---:|---|
| `users` | Não (Global) | Próprio Usuário | `OWN` / `GLOBAL` | Sim | Não | Identidade central de autenticação da plataforma. |
| `tenants` / `law_firms` | Sim (PK) | Entidade Organizacional | `OFFICE` / `GLOBAL` | Sim | Sim (Auditado) | Demarcação do limite lógico de cada organização. |
| `tenant_memberships` | Sim | User + Tenant | `OFFICE` / `TENANT` | Sim | Não | Vínculo contratual e role do usuário no tenant. |
| `lawyer_profiles` | Sim | `user_id` + `tenant_id` | `OFFICE` | Sim | Não | Cadastro profissional e vinculação à OAB. |
| `intern_profiles` | Sim | `user_id` + Supervisor | `ASSIGNED` | Sim | Não | Cadastro acadêmico e estágio (Lei 11.788/08). |
| `secretary_profiles` | Sim | `user_id` + Supervisor | `ASSIGNED` | Sim | Não | Cadastro operacional e recepção virtual. |
| `cases` / `legal_cases` | **SIM (Estrito)** | `client_id` + `lawyer_id` | `OFFICE` / `ASSIGNED` | **SIM (USING+CHECK)** | **NEGADO** | Processos e ações judiciais. Sigilo absoluto. |
| `case_stages` | **SIM (Cascata)** | `case_id` | `OFFICE` / `ASSIGNED` | **SIM (JOIN CHECK)**| **NEGADO** | Fases processuais associadas ao caso. |
| `documents` | **SIM (Estrito)** | `owner_id` + `tenant_id` | `OWN` / `AUTHORIZED` | **SIM (USING+CHECK)** | **NEGADO** | Peças, procurações e contratos confidenciais. |
| `contracts` | **SIM (Estrito)** | `case_id` + `tenant_id` | `OFFICE` / `OWN` | **SIM (USING+CHECK)** | **NEGADO** | Contratos de prestação de serviços e honorários. |
| `invoices` / `financial`| **SIM (Estrito)** | `lawyer_id` + `tenant_id`| `OFFICE` / `OWN` | **SIM (USING+CHECK)** | **NEGADO** | Faturamento, extratos, conciliação e DRE. |
| `service_provisionings` | Sim | `user_id` + `tenant_id` | `OWN` / `TENANT` | Sim | **NEGADO** | Contratação de serviços de plataforma e IA. |
| `staff_audit_logs` | Sim (Target) | `actor_id` | `GLOBAL` / `TENANT` | **SIM (APPEND-ONLY)**| Auditores | Trilha imutável com hash HMAC-SHA256. |
| `impersonation_sessions`| Sim (Target) | `staff_id` | `GLOBAL` | **SIM (AUDIT-GATED)**| Super Admin | Sessões de suporte com justificativa obrigatória. |

---

## 4. MATRIZ DE ISOLAMENTO CROSS-TENANT

| Origem da Requisição | Destino / Recurso | Tipo de Acesso | Acesso Padrão | Regra de Exceção | Auditoria Obrigatória |
|---|---|---|:---:|---|:---:|
| **Tenant A** | **Tenant A** | Próprios Processos/Clientes | **PERMITIDO** | Sujeito a RBAC + Ownership | Sim (Trilha Padrão) |
| **Tenant A** | **Tenant B** | Dados Privados / Processos | **NEGADO (403)** | Proibição Absoluta | Sim (Alerta Crítico) |
| **Cliente A** | **Cliente B** | Casos / Documentos Privados | **NEGADO (403)** | Proibição Absoluta | Sim (Alerta de Segurança) |
| **Advogado Alpha** | **Advogado Beta** | Casos Não Compartilhados | **NEGADO (403)** | Delegação Formal (`shared_with`) | Sim (Log de Delegação) |
| **Super Administrador** | **Qualquer Tenant** | Auditoria / Manutenção | **PERMITIDO** | Política de Governança Master | **SIM (Log Compulsório)** |

---

## 5. REGRAS DE DEFESA EM PROFUNDIDADE (END-TO-END)

### 5.1 Proteção contra Tenant Escape em Mutações (`WITH CHECK`)
Nas operações de `UPDATE` e `INSERT`, o banco de dados PostgreSQL e os drivers de dados (`lib/db.ts`) impedem que um usuário altere a coluna `tenant_id` para a de outro tenant:
```sql
CREATE POLICY cases_update_policy ON cases
    FOR UPDATE
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (tenant_id = current_setting('app.current_tenant_id', true) AND lawyer_id::text = current_setting('app.current_user_id', true))
    )
    WITH CHECK (
        -- Garante que tenant_id permaneça estritamente idêntico ao do contexto
        tenant_id = current_setting('app.current_tenant_id', true)
    );
```

### 5.2 Isolamento de Storage de Arquivos
Todos os arquivos (documentos, comprovantes, procurações) são armazenados em caminhos segregados:
$$\text{Path: } \texttt{tenants/\{tenant\_id\}/\{resource\_type\}/\{resource\_id\}/\{file\_name\}}$$
URLs assinadas geradas para o Tenant A jamais concedem acesso a arquivos do diretório do Tenant B.

### 5.3 Isolamento de Cache e Memória
Toda chave de cache intermediário (Redis / Local Memory) obriga o uso de namespace de tenant:
$$\text{Cache Key: } \texttt{tenant:\{tenant\_id\}:\{resource\}:\{id\}}$$

### 5.4 Isolamento de Inteligência Artificial & RAG
- **Context Boundary**: O prompt enviado aos modelos generativos (Gemini API) recebe demarcação explícita de tenant e instruções restritas de contexto.
- **RAG / Embeddings**: Consultas vetoriais realizam pré-filtragem estrita com cláusula `WHERE tenant_id = :current_tenant_id`.

### 5.5 Isolamento de Relatórios e Exportações (PDF & Excel)
O motor de BI (`biExporterService.ts`) e o extrator de DRE injetam o cabeçalho oficial de tenant em todos os documentos gerados, aplicando anonimização de CPFs (LGPD) e filtrando 100% dos dados para o tenant emissor.

---

## 6. SUÍTE DE TESTES DE CONFORMIDADE MULTI-TENANT

Os testes automatizados cobrem todos os vetores de ataque e validações exigidas:

| Cenário de Teste | Descrição da Operação | Comportamento Esperado | Status |
|---|---|---|:---:|
| **Teste A (Acesso Legítimo)** | Usuário Tenant A acessa recurso do Tenant A | Acesso Permitido | **CONFORME** |
| **Teste B (Cross-Tenant Negado)** | Usuário Tenant A tenta acessar recurso do Tenant B | Bloqueado com Erro de Segurança (403) | **CONFORME** |
| **Teste C (Tenant ID Mutation)** | Usuário Tenant A tenta alterar `tenant_id` para Tenant B em UPDATE | Bloqueado com Erro de Tentativa Maliciosa | **CONFORME** |
| **Teste D (IDOR de Documento)** | Usuário Tenant A tenta baixar documento de processo do Tenant B | Bloqueado (Acesso Negado) | **CONFORME** |
| **Teste E (Super Admin Auditado)**| Super Admin acessa recurso de qualquer tenant | Permitido com Log de Auditoria Imutável | **CONFORME** |
| **Teste F (Revogação Imediata)** | Usuário perde membership no Tenant A | Acesso Imediatamente Negado | **CONFORME** |

---

## 7. RASTREABILIDADE E EVIDÊNCIAS DE CÓDIGO

- **Serviço de Tenancy Central**: [`services/tenantService.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/services/tenantService.ts)
- **Guardião de Tenancy e Ownership**: [`security/tenantGuard.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/security/tenantGuard.ts)
- **Camada de Acesso a Dados com Boundary**: [`lib/db.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/lib/db.ts)
- **Guardião de Tenancy NestJS**: [`services/identity-service/src/guards/tenant-isolation.guard.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/services/identity-service/src/guards/tenant-isolation.guard.ts)
- **Script PostgreSQL RLS de Produção**: [`infrastructure/db/scripts/apply_production_rls.sql`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/infrastructure/db/scripts/apply_production_rls.sql)
- **Suíte de Testes Automatizados**: [`tests/multitenancy/tenant-isolation.test.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/tests/multitenancy/tenant-isolation.test.ts)
