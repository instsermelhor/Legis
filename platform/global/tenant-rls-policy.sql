-- platform/global/tenant-rls-policy.sql
-- Política de Isolamento Multi-Tenant por Row-Level Security (RLS) no PostgreSQL
-- Padrão: Tenant Security Isolation Framework (Prompt 230 - Etapa 5)

-- 1. Habilitar RLS na tabela de processos jurídicos
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- 2. Criar política de isolamento estrito por tenant_id da sessão
CREATE POLICY tenant_isolation_policy ON cases
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- 3. Função auxiliar para definir o contexto do tenant na conexão
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id VARCHAR) RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', p_tenant_id, false);
END;
$$ LANGUAGE plpgsql;
