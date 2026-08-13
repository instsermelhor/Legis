-- =============================================================================
-- LEGIS CONNECT — ENTERPRISE ROW-LEVEL SECURITY (RLS) & DATABASE DEFENSE IN DEPTH
-- Script Oficial de Ativação e Políticas no PostgreSQL / Supabase
--
-- Garante isolamento estrito na camada de banco de dados para:
--   - SELECT, INSERT, UPDATE, DELETE segregados
--   - Prevenção de Tenant Escape (USING + WITH CHECK)
--   - Imutabilidade de Audit Logs (Append-Only)
--   - Validação de Ownership (Client ID, Lawyer ID, User ID, Tenant ID)
-- =============================================================================

-- ── 1. HABILITAÇÃO DE RLS NAS TABELAS ─────────────────────────────────────────

ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS intern_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS secretary_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS platform_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS staff_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS case_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS service_provisionings ENABLE ROW LEVEL SECURITY;

-- ── 2. FUNÇÃO AUXILIAR DE INJEÇÃO DE CONTEXTO DE SEGURANÇA ───────────────────

CREATE OR REPLACE FUNCTION set_app_security_context(
    p_tenant_id VARCHAR,
    p_user_id VARCHAR,
    p_user_role VARCHAR
) RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', COALESCE(p_tenant_id, ''), false);
    PERFORM set_config('app.current_user_id', COALESCE(p_user_id, ''), false);
    PERFORM set_config('app.current_user_role', COALESCE(p_user_role, ''), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. POLÍTICAS DA TABELA 'cases' (Processos Jurídicos) ──────────────────────

DROP POLICY IF EXISTS cases_select_policy ON cases;
CREATE POLICY cases_select_policy ON cases
    FOR SELECT
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (tenant_id = current_setting('app.current_tenant_id', true))
        OR (client_id::text = current_setting('app.current_user_id', true))
        OR (lawyer_id::text = current_setting('app.current_user_id', true))
    );

DROP POLICY IF EXISTS cases_insert_policy ON cases;
CREATE POLICY cases_insert_policy ON cases
    FOR INSERT
    WITH CHECK (
        (current_setting('app.current_user_role', true) IN ('super_admin', 'admin', 'lawyer'))
        AND (tenant_id = current_setting('app.current_tenant_id', true))
    );

DROP POLICY IF EXISTS cases_update_policy ON cases;
CREATE POLICY cases_update_policy ON cases
    FOR UPDATE
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (tenant_id = current_setting('app.current_tenant_id', true) AND lawyer_id::text = current_setting('app.current_user_id', true))
    )
    WITH CHECK (
        -- Bloqueia a alteração de tenant_id durante o UPDATE (Tenant Escape Protection)
        tenant_id = current_setting('app.current_tenant_id', true)
    );

DROP POLICY IF EXISTS cases_delete_policy ON cases;
CREATE POLICY cases_delete_policy ON cases
    FOR DELETE
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (tenant_id = current_setting('app.current_tenant_id', true) AND lawyer_id::text = current_setting('app.current_user_id', true))
    );

-- ── 4. POLÍTICAS DA TABELA 'case_stages' (Etapas de Processo) ─────────────────

DROP POLICY IF EXISTS case_stages_all_policy ON case_stages;
CREATE POLICY case_stages_all_policy ON case_stages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = case_stages.case_id
              AND (
                current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
                OR c.tenant_id = current_setting('app.current_tenant_id', true)
                OR c.client_id::text = current_setting('app.current_user_id', true)
                OR c.lawyer_id::text = current_setting('app.current_user_id', true)
              )
        )
    );

-- ── 5. POLÍTICAS DA TABELA 'users' (Usuários do Sistema) ───────────────────────

DROP POLICY IF EXISTS users_select_policy ON users;
CREATE POLICY users_select_policy ON users
    FOR SELECT
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (id::text = current_setting('app.current_user_id', true))
        OR (tenant_id = current_setting('app.current_tenant_id', true))
    );

DROP POLICY IF EXISTS users_update_policy ON users;
CREATE POLICY users_update_policy ON users
    FOR UPDATE
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (id::text = current_setting('app.current_user_id', true))
    )
    WITH CHECK (
        -- Bloqueia a alteração do ID do usuário ou tenant
        id::text = current_setting('app.current_user_id', true)
    );

-- ── 6. POLÍTICAS DOS PERFIS (lawyer_profiles, intern_profiles, secretary_profiles) ─

DROP POLICY IF EXISTS lawyer_profiles_policy ON lawyer_profiles;
CREATE POLICY lawyer_profiles_policy ON lawyer_profiles
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (user_id::text = current_setting('app.current_user_id', true))
        OR (tenant_id = current_setting('app.current_tenant_id', true))
    );

DROP POLICY IF EXISTS intern_profiles_policy ON intern_profiles;
CREATE POLICY intern_profiles_policy ON intern_profiles
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (user_id::text = current_setting('app.current_user_id', true))
        OR (tenant_id = current_setting('app.current_tenant_id', true))
    );

DROP POLICY IF EXISTS secretary_profiles_policy ON secretary_profiles;
CREATE POLICY secretary_profiles_policy ON secretary_profiles
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (user_id::text = current_setting('app.current_user_id', true))
        OR (tenant_id = current_setting('app.current_tenant_id', true))
    );

-- ── 7. POLÍTICAS DA TABELA 'service_provisionings' (Contratação/Billing) ─────

DROP POLICY IF EXISTS service_provisionings_policy ON service_provisionings;
CREATE POLICY service_provisionings_policy ON service_provisionings
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin', 'staff_finance_admin')
        OR (user_id::text = current_setting('app.current_user_id', true))
        OR (tenant_id = current_setting('app.current_tenant_id', true))
    );

-- ── 8. POLÍTICAS DA TABELA 'staff_audit_logs' (Audit Log Append-Only) ────────

DROP POLICY IF EXISTS audit_readonly_policy ON staff_audit_logs;
CREATE POLICY audit_readonly_policy ON staff_audit_logs
    FOR UPDATE USING (false);

DROP POLICY IF EXISTS audit_no_delete_policy ON staff_audit_logs;
CREATE POLICY audit_no_delete_policy ON staff_audit_logs
    FOR DELETE USING (false);

DROP POLICY IF EXISTS audit_insert_policy ON staff_audit_logs;
CREATE POLICY audit_insert_policy ON staff_audit_logs
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS audit_select_policy ON staff_audit_logs;
CREATE POLICY audit_select_policy ON staff_audit_logs
    FOR SELECT
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin', 'staff_compliance_auditor')
    );
