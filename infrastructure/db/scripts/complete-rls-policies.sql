-- =============================================================================
-- LEGIS CONNECT — PRODUCTION ROW-LEVEL SECURITY (RLS) & MULTI-TENANCY POLICIES
-- Script de Ativação no PostgreSQL
--
-- Garante isolamento absoluto por tenant_id e user_id na camada de banco de dados
-- Défesa em Profundidade: RLS no DB + Guardias no Backend/Frontend
-- =============================================================================

-- 1. Habilitar RLS em todas as tabelas com dados de Tenant e Usuários
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS intern_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS secretary_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS service_provisionings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS staff_audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Função auxiliar para definir o contexto ativo do Tenant e Usuário na sessão de BD
CREATE OR REPLACE FUNCTION set_app_security_context(
    p_tenant_id VARCHAR,
    p_user_id VARCHAR,
    p_user_role VARCHAR
) RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', p_tenant_id, false);
    PERFORM set_config('app.current_user_id', p_user_id, false);
    PERFORM set_config('app.current_user_role', p_user_role, false);
END;
$$ LANGUAGE plpgsql;

-- 3. Políticas para tabela 'cases'
DROP POLICY IF EXISTS cases_tenant_isolation_policy ON cases;
CREATE POLICY cases_tenant_isolation_policy ON cases
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (tenant_id = current_setting('app.current_tenant_id', true))
        OR (client_id::text = current_setting('app.current_user_id', true))
        OR (lawyer_id::text = current_setting('app.current_user_id', true))
    )
    WITH CHECK (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (tenant_id = current_setting('app.current_tenant_id', true))
    );

-- 4. Políticas para tabela 'users'
DROP POLICY IF EXISTS users_isolation_policy ON users;
CREATE POLICY users_isolation_policy ON users
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) IN ('super_admin', 'admin')
        OR (id::text = current_setting('app.current_user_id', true))
        OR (tenant_id = current_setting('app.current_tenant_id', true))
    );

-- 5. Imutabilidade dos Logs de Auditoria (Append-Only)
DROP POLICY IF EXISTS audit_readonly_policy ON staff_audit_logs;
CREATE POLICY audit_readonly_policy ON staff_audit_logs
    FOR UPDATE USING (false);

DROP POLICY IF EXISTS audit_no_delete_policy ON staff_audit_logs;
CREATE POLICY audit_no_delete_policy ON staff_audit_logs
    FOR DELETE USING (false);

-- 6. Garantia de Inserção de Auditoria para Super Admin
DROP POLICY IF EXISTS audit_insert_policy ON staff_audit_logs;
CREATE POLICY audit_insert_policy ON staff_audit_logs
    FOR INSERT WITH CHECK (true);
