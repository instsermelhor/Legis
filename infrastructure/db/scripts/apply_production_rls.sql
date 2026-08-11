-- =============================================================================
-- LEGIS CONNECT — PRODUCTION ROW-LEVEL SECURITY (RLS) POLICIES
-- Script Oficial de Segurança em Nível de Linha para PostgreSQL + Prisma ORM
-- Executar via psql ou console do Supabase após a execução das migrations.
-- =============================================================================

-- ─── 1. Habilitar RLS em Todas as Tabelas de Produção ────────────────────────
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

-- ─── 2. Políticas da Tabela `cases` (Isolamento de Processos) ───────────────
-- Clientes só visualizam e editam seus próprios processos
DROP POLICY IF EXISTS client_case_isolation ON public.cases;
CREATE POLICY client_case_isolation ON public.cases
    FOR ALL
    USING (
        client_id::text = current_setting('app.current_user_id', true)
        OR lawyer_id::text = current_setting('app.current_lawyer_id', true)
        OR current_setting('app.user_role', true) IN ('super_admin', 'admin')
    );

-- ─── 3. Políticas da Tabela `service_provisionings` ──────────────────────────
-- Usuários só veem seus próprios registros de compra e provisionamento
DROP POLICY IF EXISTS provisioning_user_isolation ON public.service_provisionings;
CREATE POLICY provisioning_user_isolation ON public.service_provisionings
    FOR ALL
    USING (
        user_id::text = current_setting('app.current_user_id', true)
        OR current_setting('app.user_role', true) IN ('super_admin', 'admin', 'staff_finance_admin')
    );

-- ─── 4. Políticas da Tabela `staff_audit_logs` (Imutabilidade Imparável) ────
-- Leitura autorizada apenas para Auditores de Compliance e Super Admins
DROP POLICY IF EXISTS audit_log_read ON public.staff_audit_logs;
CREATE POLICY audit_log_read ON public.staff_audit_logs
    FOR SELECT
    USING (
        current_setting('app.user_role', true) IN ('super_admin', 'admin', 'staff_compliance_auditor')
    );

-- Bloqueio absoluto de UPDATE e DELETE (Append-Only Enforcement)
DROP POLICY IF EXISTS audit_log_no_update ON public.staff_audit_logs;
CREATE POLICY audit_log_no_update ON public.staff_audit_logs
    FOR UPDATE USING (false);

DROP POLICY IF EXISTS audit_log_no_delete ON public.staff_audit_logs;
CREATE POLICY audit_log_no_delete ON public.staff_audit_logs
    FOR DELETE USING (false);

-- ─── 5. Políticas da Tabela `impersonation_sessions` ─────────────────────────
DROP POLICY IF EXISTS impersonation_read ON public.impersonation_sessions;
CREATE POLICY impersonation_read ON public.impersonation_sessions
    FOR SELECT
    USING (
        staff_id::text = current_setting('app.current_staff_id', true)
        OR current_setting('app.user_role', true) IN ('super_admin', 'staff_compliance_auditor')
    );

-- =============================================================================
-- FIM DO SCRIPT DE SEGURANÇA RLS LEGIS CONNECT
-- =============================================================================
