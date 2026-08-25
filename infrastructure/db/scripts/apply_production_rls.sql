-- =============================================================================
-- LEGIS CONNECT — PRODUCTION ROW-LEVEL SECURITY (RLS) POLICIES MASTER v3.0
-- Script Oficial de Segurança em Nível de Linha para PostgreSQL + Prisma ORM
--
-- Princípio: DEFENSE IN DEPTH — O Banco é a última linha de defesa.
-- Executar via psql ou console do Supabase após a execução das migrations.
-- =============================================================================

-- ─── 1. Habilitar RLS em 100% das Tabelas com Dados de Usuários/Tenants ───────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intern_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secretary_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provisionings ENABLE ROW LEVEL SECURITY;

-- ─── 2. Helper Functions de Segurança no Banco ───────────────────────────────

CREATE OR REPLACE FUNCTION public.set_app_security_context(
    p_tenant_id TEXT,
    p_user_id TEXT,
    p_user_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', p_tenant_id, false);
    PERFORM set_config('app.current_user_id', p_user_id, false);
    PERFORM set_config('app.current_user_role', p_user_role, false);
END;
$$;

-- ─── 3. Políticas da Tabela `cases` (Isolamento Estrito de Tenant & Ownership) ─

DROP POLICY IF EXISTS cases_select_policy ON public.cases;
CREATE POLICY cases_select_policy ON public.cases
    FOR SELECT
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (
            tenant_id = current_setting('app.current_tenant_id', true)
            AND (
                client_id::text = current_setting('app.current_user_id', true)
                OR lawyer_id::text = current_setting('app.current_user_id', true)
            )
        )
    );

DROP POLICY IF EXISTS cases_insert_policy ON public.cases;
CREATE POLICY cases_insert_policy ON public.cases
    FOR INSERT
    WITH CHECK (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (
            tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    );

DROP POLICY IF EXISTS cases_update_policy ON public.cases;
CREATE POLICY cases_update_policy ON public.cases
    FOR UPDATE
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (
            tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    )
    WITH CHECK (
        -- Garante proteção contra Tenant Escape: tenant_id não pode ser alterado
        tenant_id = current_setting('app.current_tenant_id', true)
    );

DROP POLICY IF EXISTS cases_delete_policy ON public.cases;
CREATE POLICY cases_delete_policy ON public.cases
    FOR DELETE
    USING (
        current_setting('app.current_user_role', true) = 'super_admin'
        OR (
            tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    );

-- ─── 4. Políticas da Tabela `case_stages` (Cascata com Casos) ────────────────

DROP POLICY IF EXISTS case_stages_all_policy ON public.case_stages;
CREATE POLICY case_stages_all_policy ON public.case_stages
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR EXISTS (
            SELECT 1 FROM public.cases c
            WHERE c.id = case_stages.case_id
              AND c.tenant_id = current_setting('app.current_tenant_id', true)
        )
    );

-- ─── 5. Políticas da Tabela `service_provisionings` ──────────────────────────

DROP POLICY IF EXISTS provisioning_isolation ON public.service_provisionings;
CREATE POLICY provisioning_isolation ON public.service_provisionings
    FOR ALL
    USING (
        user_id::text = current_setting('app.current_user_id', true)
        OR current_setting('app.current_user_role', true) IN ('super_admin', 'admin', 'staff_finance_admin')
    )
    WITH CHECK (
        user_id::text = current_setting('app.current_user_id', true)
        OR current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
    );

-- ─── 6. Políticas da Tabela `staff_audit_logs` (Imutabilidade Absoluta) ─────

DROP POLICY IF EXISTS audit_log_read ON public.staff_audit_logs;
CREATE POLICY audit_log_read ON public.staff_audit_logs
    FOR SELECT
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin', 'staff_compliance_auditor')
    );

DROP POLICY IF EXISTS audit_log_insert ON public.staff_audit_logs;
CREATE POLICY audit_log_insert ON public.staff_audit_logs
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS audit_log_no_update ON public.staff_audit_logs;
CREATE POLICY audit_log_no_update ON public.staff_audit_logs
    FOR UPDATE USING (false);

DROP POLICY IF EXISTS audit_log_no_delete ON public.staff_audit_logs;
CREATE POLICY audit_log_no_delete ON public.staff_audit_logs
    FOR DELETE USING (false);

-- ─── 7. Políticas da Tabela `impersonation_sessions` ─────────────────────────

DROP POLICY IF EXISTS impersonation_read ON public.impersonation_sessions;
CREATE POLICY impersonation_read ON public.impersonation_sessions
    FOR SELECT
    USING (
        staff_id::text = current_setting('app.current_user_id', true)
        OR current_setting('app.current_user_role', true) IN ('super_admin', 'staff_compliance_auditor')
    );

DROP POLICY IF EXISTS impersonation_insert ON public.impersonation_sessions;
CREATE POLICY impersonation_insert ON public.impersonation_sessions
    FOR INSERT
    WITH CHECK (
        current_setting('app.current_user_role', true) = 'super_admin'
        AND length(justification) >= 20
    );

-- =============================================================================
-- FIM DO SCRIPT DE SEGURANÇA RLS LEGIS CONNECT v3.0
-- =============================================================================
