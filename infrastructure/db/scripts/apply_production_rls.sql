-- =============================================================================
-- LEGIS CONNECT — PRODUCTION ROW-LEVEL SECURITY (RLS) POLICIES MASTER v3.0
-- Script Oficial de Segurança em Nível de Linha para PostgreSQL + Prisma ORM
--
-- Princípio: DEFENSE IN DEPTH — O Banco de Dados é a última linha de defesa.
-- Executar via psql ou console do Supabase após a execução das migrations.
-- =============================================================================

-- ─── 1. Habilitar & Forçar RLS em 100% das Tabelas de Produção ────────────────
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
ALTER TABLE IF EXISTS public.beta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.beta_feedback ENABLE ROW LEVEL SECURITY;

-- Aplicar FORCE ROW LEVEL SECURITY para impedir bypass mesmo por donos de tabelas
ALTER TABLE IF EXISTS public.cases FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contracts FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.case_stages FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff_audit_logs FORCE ROW LEVEL SECURITY;

-- ─── 2. Schemas Adicionais (IA, RAG & Knowledge) ──────────────────────────────
CREATE SCHEMA IF NOT EXISTS legis_ai;
CREATE SCHEMA IF NOT EXISTS legis_knowledge;

ALTER TABLE IF EXISTS legis_ai.document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS legis_ai.document_embeddings FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS legis_knowledge.embeddings ENABLE ROW LEVEL SECURITY;

-- ─── 3. Helper Functions de Segurança no Banco ───────────────────────────────

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
    PERFORM set_config('app.current_tenant_id', COALESCE(p_tenant_id, ''), false);
    PERFORM set_config('app.current_user_id', COALESCE(p_user_id, ''), false);
    PERFORM set_config('app.current_user_role', COALESCE(p_user_role, ''), false);
END;
$$;

-- ─── 4. Políticas da Tabela `cases` (Processos Jurídicos) ────────────────────

DROP POLICY IF EXISTS cases_select_policy ON public.cases;
CREATE POLICY cases_select_policy ON public.cases
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

DROP POLICY IF EXISTS cases_insert_policy ON public.cases;
CREATE POLICY cases_insert_policy ON public.cases
    FOR INSERT
    WITH CHECK (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    );

DROP POLICY IF EXISTS cases_update_policy ON public.cases;
CREATE POLICY cases_update_policy ON public.cases
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
        -- Bloqueia Tenant Escape: o tenant_id não pode ser alterado durante UPDATE
        tenant_id = current_setting('app.current_tenant_id', true)
    );

DROP POLICY IF EXISTS cases_delete_policy ON public.cases;
CREATE POLICY cases_delete_policy ON public.cases
    FOR DELETE
    USING (
        current_setting('app.current_user_role', true) = 'super_admin'
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    );

-- ─── 5. Políticas da Tabela `contracts` (Contratos de Honorários) ─────────────

DROP POLICY IF EXISTS contracts_select_policy ON public.contracts;
CREATE POLICY contracts_select_policy ON public.contracts
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

DROP POLICY IF EXISTS contracts_insert_policy ON public.contracts;
CREATE POLICY contracts_insert_policy ON public.contracts
    FOR INSERT
    WITH CHECK (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    );

DROP POLICY IF EXISTS contracts_update_policy ON public.contracts;
CREATE POLICY contracts_update_policy ON public.contracts
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

-- ─── 6. Políticas da Tabela `invoices` (Faturas e Financeiro) ─────────────────

DROP POLICY IF EXISTS invoices_select_policy ON public.invoices;
CREATE POLICY invoices_select_policy ON public.invoices
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

DROP POLICY IF EXISTS invoices_insert_policy ON public.invoices;
CREATE POLICY invoices_insert_policy ON public.invoices
    FOR INSERT
    WITH CHECK (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin', 'staff_finance_admin')
        OR (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id', true)
            AND lawyer_id::text = current_setting('app.current_user_id', true)
        )
    );

DROP POLICY IF EXISTS invoices_update_policy ON public.invoices;
CREATE POLICY invoices_update_policy ON public.invoices
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

-- ─── 7. Políticas da Tabela `case_stages` (Cascata) ───────────────────────────

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

-- ─── 8. Políticas da Tabela `staff_audit_logs` (Imutabilidade Absoluta) ───────

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

-- ─── 9. Políticas da Tabela `impersonation_sessions` ──────────────────────────

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

-- ─── 10. Políticas de IA & RAG Embeddings ────────────────────────────────────

DROP POLICY IF EXISTS embeddings_tenant_isolation ON legis_ai.document_embeddings;
CREATE POLICY embeddings_tenant_isolation ON legis_ai.document_embeddings
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR EXISTS (
            SELECT 1 FROM public.cases c
            WHERE c.id::text = document_embeddings.document_id::text
              AND c.tenant_id = current_setting('app.current_tenant_id', true)
        )
    );

-- =============================================================================
-- FIM DO SCRIPT DE SEGURANÇA RLS LEGIS CONNECT v3.0
-- =============================================================================
