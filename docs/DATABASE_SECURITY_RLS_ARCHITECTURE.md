# LEGIS CONNECT — DATABASE SECURITY & ROW-LEVEL SECURITY (RLS) ARCHITECTURE MASTER
## Arquitetura Oficial da Trava Dentro do Banco, Políticas Granulares e Defesa em Profundidade

**Versão Normativa Oficial:** 3.0.0 — Enterprise Database Security Edition  
**Data de Aprovação:** 25 de Agosto de 2026  
**Classificação:** Fonte Oficial de Verdade de Segurança em Banco de Dados  
**Princípio Basilar:** *DENY BY DEFAULT — O banco de dados é a última linha de defesa. Se não houver autorização explícita comprovada, o acesso é negado.*

---

## 1. VISÃO GERAL E PRINCÍPIO DA TRAVA DENTRO DO BANCO

A arquitetura de banco de dados da **Legis Connect** foi projetada sob o princípio da **Defesa em Profundidade (Defense in Depth)**. O banco de dados PostgreSQL não confia cegamente no frontend, nas rotas ou na camada intermediária de serviços.

Mesmo que um agente malicioso consiga:
- Burlar a interface do usuário ou manipular o estado local;
- Forjar parâmetros de URL ou alterar identificadores (UUIDs);
- Executar requisições diretas de API contornando filtros do backend;

**O banco de dados bloqueia qualquer leitura, inserção, atualização ou exclusão fora do contexto autorizado.**

```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           REQUISIÇÃO DO CLIENTE                        │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ CAMADA 1: IDENTIDADE & AUTH (Supabase Auth / JWT Validado)             │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ CAMADA 2: GUARDS & SERVICES (TenantService, RbacGuard, TenantGuard)    │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ CAMADA 3: CONTEXT INJECTION (set_app_security_context via RPC Seguro)  │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ CAMADA 4: POSTGRESQL RLS (ENABLE + FORCE RLS + USING + WITH CHECK)     │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                       DADO EFETIVAMENTE AUTORIZADO                     │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. INVENTÁRIO DO BANCO DE DADOS & CLASSIFICAÇÃO DE ENTIDADES

| Schema | Tabela / Entidade | Classificação | Tenant Obrigatório? | Ownership Primário | RLS Status | Enforcement Level |
|---|---|---|:---:|---|:---:|:---:|
| `public` | `users` | User-Owned / Global | Não | `id` | Habilitado | Standard RLS |
| `public` | `lawyer_profiles` | Tenant + Ownership | Sim | `user_id` + `tenant_id` | Habilitado | Standard RLS |
| `public` | `intern_profiles` | Tenant + Ownership | Sim | `user_id` + Supervisor | Habilitado | Standard RLS |
| `public` | `secretary_profiles` | Tenant + Ownership | Sim | `user_id` + Supervisor | Habilitado | Standard RLS |
| `public` | `platform_staff` | System / Sensitive | Não | `user_id` | Habilitado | Standard RLS |
| `public` | `impersonation_sessions` | System / Audit-Gated | Sim (Target) | `staff_id` | Habilitado | Standard RLS |
| `public` | `staff_audit_logs` | System / Append-Only | Sim (Target) | `actor_id` | Habilitado | **FORCE RLS** |
| `public` | `cases` | **Tenant-Owned (Estrito)** | **SIM** | `client_id` + `lawyer_id` | Habilitado | **FORCE RLS** |
| `public` | `case_stages` | Tenant-Owned (Cascata) | **SIM** | `case_id` (via Join) | Habilitado | **FORCE RLS** |
| `public` | `contracts` | **Tenant-Owned (Estrito)** | **SIM** | `case_id` + `tenant_id` | Habilitado | **FORCE RLS** |
| `public` | `invoices` | **Tenant-Owned (Estrito)** | **SIM** | `lawyer_id` + `tenant_id` | Habilitado | **FORCE RLS** |
| `public` | `service_provisionings` | Tenant / User-Owned | Sim | `user_id` + `tenant_id` | Habilitado | Standard RLS |
| `legis_ai`| `document_embeddings` | Tenant-Owned (RAG) | **SIM** | `document_id` + `tenant_id` | Habilitado | **FORCE RLS** |
| `legis_knowledge`| `embeddings` | Shared / Public & Tenant | Condicional | `source_type` + `tenant_id`| Habilitado | Standard RLS |

---

## 3. MATRIZ OFICIAL DE POLÍTICAS ROW-LEVEL SECURITY (RLS)

| Tabela | Tenant Constraint | Operação | Tipo de Cláusula | Regra de Autorização | Status |
|---|---|---|---|---|:---:|
| `cases` | Estrito por Tenant | `SELECT` | `USING` | `is_admin_or_super() OR (tenant_id = current_tenant() AND (client_id = uid() OR lawyer_id = uid()))` | **CONFORME** |
| `cases` | Estrito por Tenant | `INSERT` | `WITH CHECK` | `is_admin_or_super() OR (tenant_id = current_tenant() AND lawyer_id = uid())` | **CONFORME** |
| `cases` | Estrito por Tenant | `UPDATE` | `USING + WITH CHECK` | `USING (same as select) WITH CHECK (tenant_id = current_tenant())` *(Tenant Escape Guard)* | **CONFORME** |
| `cases` | Estrito por Tenant | `DELETE` | `USING` | `is_super_admin() OR (tenant_id = current_tenant() AND lawyer_id = uid())` | **CONFORME** |
| `contracts` | Estrito por Tenant | `SELECT` | `USING` | `tenant_id = current_tenant() AND (client_id = uid() OR lawyer_id = uid())` | **CONFORME** |
| `contracts` | Estrito por Tenant | `UPDATE` | `USING + WITH CHECK` | `USING (same as select) WITH CHECK (tenant_id = current_tenant())` | **CONFORME** |
| `invoices` | Estrito por Tenant | `SELECT` | `USING` | `tenant_id = current_tenant() AND (client_id = uid() OR lawyer_id = uid() OR is_finance_admin())` | **CONFORME** |
| `invoices` | Estrito por Tenant | `UPDATE` | `USING + WITH CHECK` | `USING (same as select) WITH CHECK (tenant_id = current_tenant())` | **CONFORME** |
| `case_stages` | Cascata com `cases` | `ALL` | `USING` | `EXISTS (SELECT 1 FROM cases c WHERE c.id = case_id AND c.tenant_id = current_tenant())` | **CONFORME** |
| `staff_audit_logs` | Global / Append-Only | `SELECT` | `USING` | `is_compliance_auditor() OR is_super_admin()` | **CONFORME** |
| `staff_audit_logs` | Global / Append-Only | `UPDATE / DELETE` | `USING` | `USING (false)` *(Bloqueio Absoluto — Append-Only)* | **CONFORME** |
| `document_embeddings`| Estrito por Tenant | `ALL` | `USING` | `EXISTS (SELECT 1 FROM cases c WHERE c.id = document_id AND c.tenant_id = current_tenant())` | **CONFORME** |

---

## 4. MATRIZ DE INTEGRAÇÃO RBAC × RLS

| Perfil | Recurso | Ação | Escopo | Validação Backend | Proteção RLS no Banco | Status |
|---|---|---|---|---|---|:---:|
| `super_admin` | `ALL` | `ALL` | `GLOBAL` | `RbacGuard` + Audit Filter | Bypass via Bypass Policy Auditada | **CONFORME** |
| `admin` | `users` | `READ/WRITE` | `GLOBAL` | `StaffGuard` | `users_select_policy` | **CONFORME** |
| `staff_finance_admin` | `invoices` | `READ/UPDATE` | `TENANT` | `FinanceGuard` | `invoices_select_policy` | **CONFORME** |
| `staff_compliance_auditor`| `staff_audit_logs`| `READ` | `TENANT` | `AuditService` | `audit_log_read` | **CONFORME** |
| `gestor` | `cases` | `READ/UPDATE` | `OFFICE` | `OfficeGuard` | `cases_select_policy` | **CONFORME** |
| `lawyer` | `cases` | `CREATE/READ/UPDATE`| `OWN/OFFICE` | `CaseController` | `cases_select_policy` + `cases_update_policy` | **CONFORME** |
| `client` | `cases` | `READ` | `OWN` | `ClientPortalGuard` | `client_id = auth.uid()` | **CONFORME** |
| `student` | `cases` | `ALL` | `NONE` | 403 Forbidden | Bloqueio RLS (0 linhas retornadas) | **CONFORME** |

---

## 5. MATRIZ DE ATAQUE & RESILIÊNCIA DO BANCO

| Vetor de Ataque | Camada de Tentativa | Mecanismo de Defesa no Banco | Resultado Real | Status |
|---|---|---|---|:---:|
| **Tentativa de Alteração de `tenant_id` (Tenant Escape)** | `UPDATE cases SET tenant_id = 'B'` | Cláusula `WITH CHECK (tenant_id = current_setting('app.current_tenant_id'))` | Transação Abortada / Erro de Violação de Política RLS | **CONFORME** |
| **Acesso Direto a Registro por ID (IDOR)** | `SELECT * FROM cases WHERE id = 'uuid_b'` | Cláusula `USING` filtra por `tenant_id` e `client_id/lawyer_id` | 0 Linhas Retornadas | **CONFORME** |
| **Injeção de Registro Cross-Tenant** | `INSERT INTO cases (tenant_id, ...)` | Cláusula `WITH CHECK` compara `tenant_id` com o contexto ativo | Rejeição com Erro de Política RLS | **CONFORME** |
| **Exclusão Cross-Tenant de Registro** | `DELETE FROM cases WHERE id = 'uuid_b'` | Cláusula `USING` exige `tenant_id` igual ao contexto ativo | 0 Linhas Afetadas | **CONFORME** |
| **Violação de Imutabilidade de Auditoria** | `DELETE FROM staff_audit_logs` | Política com `FOR DELETE USING (false)` | Transação Abortada | **CONFORME** |
| **Contexto Ausente ou Nulo** | Consulta sem chamada prévia de contexto | Cláusula `NULLIF(current_setting(...), '') IS NOT NULL` | 0 Linhas Retornadas (Deny by Default) | **CONFORME** |
| **Contaminação de Busca Semântica IA / RAG** | Busca em `document_embeddings` do Tenant B | Cláusula `USING (EXISTS (SELECT 1 FROM cases WHERE ...))` | Apenas Embeddings do Tenant A Retornados | **CONFORME** |

---

## 6. AUDITORIA DE FUNÇÕES `SECURITY DEFINER`, `GRANTS` E `BYPASSRLS`

1. **Função `set_app_security_context`**:
   - Declarada como `SECURITY DEFINER` para permitir que o driver da aplicação configure variáveis restritas de sessão (`app.current_tenant_id`, `app.current_user_id`, `app.current_user_role`) sem conceder privilégios de superusuário à conexão padrão.
   - Parâmetros são sanitizados com `COALESCE` para impedir injeções ou valores indefinidos.
2. **`FORCE ROW LEVEL SECURITY`**:
   - Ativo em 100% das tabelas críticas (`cases`, `contracts`, `invoices`, `case_stages`, `staff_audit_logs`, `document_embeddings`), assegurando que nem mesmo o proprietário da tabela ignore as políticas durante a execução de consultas da aplicação.
3. **Privilégios `BYPASSRLS`**:
   - Estritamente restrito a roles administrativas de manutenção interna do provedor de infraestrutura (Supabase Admin), sendo completamente desabilitado para o usuário da aplicação e roles de conexão pública (`authenticated`, `anon`).

---

## 7. RASTREABILIDADE E EVIDÊNCIAS DE TESTES

- **Script SQL de Produção Master**: [`infrastructure/db/scripts/apply_production_rls.sql`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/infrastructure/db/scripts/apply_production_rls.sql)
- **Script SQL Enterprise de Políticas RLS**: [`infrastructure/db/scripts/complete-rls-policies.sql`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/infrastructure/db/scripts/complete-rls-policies.sql)
- **Driver de Banco com Proteção em Profundidade**: [`lib/db.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/lib/db.ts)
- **Suíte de Testes Automatizados de RLS**: [`tests/multitenancy/rls-database-security.test.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/tests/multitenancy/rls-database-security.test.ts)
- **Documento Normativo de Tenancy**: [`docs/MULTI_TENANCY_ARCHITECTURE.md`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/docs/MULTI_TENANCY_ARCHITECTURE.md)
- **Documento Normativo de Governança RBAC**: [`docs/RBAC_ACCESS_GOVERNANCE.md`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/docs/RBAC_ACCESS_GOVERNANCE.md)
