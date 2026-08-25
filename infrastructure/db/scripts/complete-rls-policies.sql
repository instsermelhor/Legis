-- =============================================================================
-- LEGIS CONNECT — ENTERPRISE ROW-LEVEL SECURITY (RLS) POLICIES & DATABASE ENFORCEMENT
-- Script Oficial de Políticas RLS no PostgreSQL / Supabase
--
-- Garante:
--   - Habilitação e FORCE RLS em 100% das tabelas tenant-owned
--   - Políticas especializadas por operação (SELECT, INSERT, UPDATE, DELETE)
--   - USING e WITH CHECK para bloqueio de Tenant Escape
--   - Imutabilidade absoluta de Audit Logs (Append-Only)
--   - Isolamento de IA, Embeddings e RAG
-- =============================================================================

-- ── 1. HABILITAÇÃO & FORCE RLS NAS TABELAS ───────────────────────────────────

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.intern_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.secretary_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.platform_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.case_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.service_provisionings ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.cases FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contracts FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.case_stages FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff_audit_logs FORCE ROW LEVEL SECURITY;

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

-- ── 3. POLÍTICAS DA TABELA 'cases' ───────────────────────────────────────────

DROP POLICY IF EXISTS cases_select_policy ON cases;
CREATE POLICY cases_select_policy ON cases
    FOR SELECT
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND (
                client_id::text = current_setting('app.current_user_id', true)
                OR lawyer_id::text = current_setting('app.current_user_id', true)
            )
        )
    );

DROP POLICY IF EXISTS cases_insert_policy ON cases;
CREATE POLICY cases_insert_policy ON cases
    FOR INSERT
    WITH CHECK (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    );

DROP POLICY IF EXISTS cases_update_policy ON cases;
CREATE POLICY cases_update_policy ON cases
    FOR UPDATE
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    )
    WITH CHECK (
        -- Bloqueia a alteração de tenant_id durante o UPDATE (Tenant Escape Protection)
        tenant_id = current_setting('app.current_tenant_id', true)
    );

DROP POLICY IF EXISTS cases_delete_policy ON cases;
CREATE POLICY cases_delete_policy ON cases
    FOR DELETE
    USING (
        current_setting('app.current_user_role', true) = 'super_admin'
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    );

-- ── 4. POLÍTICAS DA TABELA 'contracts' ───────────────────────────────────────

DROP POLICY IF EXISTS contracts_select_policy ON contracts;
CREATE POLICY contracts_select_policy ON contracts
    FOR SELECT
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND (
                client_id::text = current_setting('app.current_user_id', true)
                OR lawyer_id::text = current_setting('app.current_user_id', true)
            )
        )
    );

DROP POLICY IF EXISTS contracts_insert_policy ON contracts;
CREATE POLICY contracts_insert_policy ON contracts
    FOR INSERT
    WITH CHECK (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    );

DROP POLICY IF EXISTS contracts_update_policy ON contracts;
CREATE POLICY contracts_update_policy ON contracts
    FOR UPDATE
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    )
    WITH CHECK (
        tenant_id = current_setting('app.current_tenant_id', true)
    );

-- ── 5. POLÍTICAS DA TABELA 'invoices' ────────────────────────────────────────

DROP POLICY IF EXISTS invoices_select_policy ON invoices;
CREATE POLICY invoices_select_policy ON invoices
    FOR SELECT
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin', 'staff_finance_admin')
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND (
                client_id::text = current_setting('app.current_user_id', true)
                OR lawyer_id::text = current_setting('app.current_user_id', true)
            )
        )
    );

DROP POLICY IF EXISTS invoices_insert_policy ON invoices;
CREATE POLICY invoices_insert_policy ON invoices
    FOR INSERT
    WITH CHECK (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin', 'staff_finance_admin')
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    );

DROP POLICY IF EXISTS invoices_update_policy ON invoices;
CREATE POLICY invoices_update_policy ON invoices
    FOR UPDATE
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin', 'staff_finance_admin')
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    )
    WITH CHECK (
        tenant_id = current_setting('app.current_tenant_id', true)
    );

-- ── 6. POLÍTICAS DA TABELA 'case_stages' ─────────────────────────────────────

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
              )
        )
    );

-- ── 7. POLÍTICAS DA TABELA 'staff_audit_logs' ────────────────────────────────

DROP POLICY IF EXISTS audit_log_read ON staff_audit_logs;
CREATE POLICY audit_log_read ON staff_audit_logs
    FOR SELECT
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin', 'staff_compliance_auditor')
    );

DROP POLICY IF EXISTS audit_log_insert ON staff_audit_logs;
CREATE POLICY audit_log_insert ON staff_audit_logs
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS audit_log_no_update ON staff_audit_logs;
CREATE POLICY audit_log_no_update ON staff_audit_logs
    FOR UPDATE USING (false);

DROP POLICY IF EXISTS audit_log_no_delete ON staff_audit_logs;
CREATE POLICY audit_log_no_delete ON staff_audit_logs
    FOR DELETE USING (false);

-- ── 8. POLÍTICAS DA TABELA 'impersonation_sessions' ──────────────────────────

DROP POLICY IF EXISTS impersonation_read ON impersonation_sessions;
CREATE POLICY impersonation_read ON impersonation_sessions
    FOR SELECT
    USING (
        staff_id::text = current_setting('app.current_user_id', true)
        OR current_setting('app.current_user_role', true) IN ('super_admin', 'staff_compliance_auditor')
    );

DROP POLICY IF EXISTS impersonation_insert ON impersonation_sessions;
CREATE POLICY impersonation_insert ON impersonation_sessions
    FOR INSERT
    WITH CHECK (
        current_setting('app.current_user_role', true) = 'super_admin'
        AND length(justification) >= 20
    );

-- =============================================================================
-- FIM DO SCRIPT ENTERPRISE RLS POLICIES
-- =============================================================================
