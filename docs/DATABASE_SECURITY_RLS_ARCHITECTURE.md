# LEGIS CONNECT — DATABASE SECURITY & ROW-LEVEL SECURITY (RLS) ARCHITECTURE
**Documentação Oficial da Arquitetura de Segurança de Banco de Dados v1.0**

---

## 1. Visão Geral e Princípio da Defesa em Profundidade

A arquitetura de banco de dados da plataforma Legis Connect foi projetada sob o princípio da **Defesa em Profundidade (Defense in Depth)**.

O banco de dados não confia unicamente na lógica da aplicação (frontend, middleware, JWT ou autorização de rotas). O banco de dados PostgreSQL possui suas próprias políticas independentes de **Row-Level Security (RLS)** ativas em 100% das tabelas que contêm dados de tenants ou usuários.

```
+-------------------------------------------------------------------+
|                        SOLICITAÇÃO DO USUÁRIO                    |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
| CAMADA 1: AUTHENTICATION & JWT (Supabase Auth / SecurityContext)  |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
| CAMADA 2: APPLICATION DRIVER & GUARDS (lib/db.ts, tenantGuard.ts) |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
| CAMADA 3: CONTEXT INJECTION (set_app_security_context via RPC)    |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
| CAMADA 4: POSTGRESQL ROW-LEVEL SECURITY (USING + WITH CHECK)      |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
|                       BANCO DE DADOS (PostgreSQL)                 |
+-------------------------------------------------------------------+
```

---

## 2. Diagnóstico do Banco de Dados Real

| Parâmetro | Configuração |
|-----------|--------------|
| **Mecanismo de BD Primário** | PostgreSQL / Supabase DB Engine |
| **ORM** | Prisma ORM (`schema.prisma`) |
| **Driver Client-Side** | `@supabase/supabase-js` (`lib/supabase.ts`) |
| **Simulação Fallback** | LocalStorage DB Driver (`lib/db.ts` & `services/dbService.ts`) |
| **Estratégia de Tenancy** | Shared Database / Shared Schema com `tenant_id` UUID |

---

## 3. Matriz de Classificação de Dados e RLS

| Tabela / Modelo | Classificação | Chaves de Proteção | Políticas RLS Aplicadas |
|-----------------|---------------|--------------------|-------------------------|
| `users` | USER / SENSITIVE | `id`, `tenant_id` | `users_select_policy`, `users_update_policy` |
| `cases` | TENANT / USER | `tenant_id`, `client_id`, `lawyer_id` | `cases_select_policy`, `cases_insert_policy`, `cases_update_policy`, `cases_delete_policy` |
| `case_stages` | TENANT / USER | `case_id` (cascata) | `case_stages_all_policy` (via EXISTS JOIN em cases) |
| `lawyer_profiles` | TENANT / USER | `user_id`, `tenant_id` | `lawyer_profiles_policy` |
| `intern_profiles` | TENANT / USER | `user_id`, `tenant_id` | `intern_profiles_policy` |
| `secretary_profiles` | TENANT / USER | `user_id`, `tenant_id` | `secretary_profiles_policy` |
| `service_provisionings` | TENANT / USER | `user_id`, `tenant_id` | `service_provisionings_policy` |
| `staff_audit_logs` | SYSTEM / SENSITIVE | `actor_id` | Append-Only (`FOR UPDATE USING (false)`, `FOR DELETE USING (false)`) |
| `impersonation_sessions` | SYSTEM / SENSITIVE | `staff_id`, `target_user_id` | Audit-Gated RLS Policy |

---

## 4. Cláusulas USING vs WITH CHECK (Proteção contra Tenant Escape)

- **`USING`**: Garante que o banco de dados só leia ou permita localizar linhas pertencentes ao `tenant_id` ou `user_id` do contexto ativo.
- **`WITH CHECK`**: Garante que durante inserções (`INSERT`) ou alterações (`UPDATE`), o usuário não consiga alterar a coluna `tenant_id` para a de outro tenant (impedindo Tenant Escape Attacks).

Exemplo SQL (`cases`):
```sql
CREATE POLICY cases_update_policy ON cases
    FOR UPDATE
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (tenant_id = current_setting('app.current_tenant_id', true) AND lawyer_id::text = current_setting('app.current_user_id', true))
    )
    WITH CHECK (
        -- Garante que tenant_id não possa ser alterado no UPDATE
        tenant_id = current_setting('app.current_tenant_id', true)
    );
```

---

## 5. Injeção de Contexto de Segurança (`set_app_security_context`)

Antes de realizar consultas privilegiadas no banco de dados, o driver da aplicação invoca a Stored Procedure segura:

```sql
SELECT set_app_security_context(
    'tenant_lawfirm_alpha',
    'user_uuid_123',
    'lawyer'
);
```

As variáveis `app.current_tenant_id`, `app.current_user_id` e `app.current_user_role` ficam restritas à transação/conexão PostgreSQL.

---

## 6. Imutabilidade dos Audit Logs (Append-Only)

A tabela `staff_audit_logs` possui restrição absoluta:
- **`UPDATE`**: `USING (false)` (Rejeita qualquer alteração de logs gravados)
- **`DELETE`**: `USING (false)` (Rejeita qualquer exclusão de logs gravados)
- **`INSERT`**: Permitido para gravar eventos de auditoria

---

## 7. Procedimentos de Teste e Validação

Para executar a suíte de testes de RLS do banco de dados:
```bash
npx vitest run tests/multitenancy/rls-database-security.test.ts
```

Para validar a integridade dos tipos TypeScript:
```bash
npx tsc --noEmit
```
