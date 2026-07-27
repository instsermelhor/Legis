-- Script de Ativação de Row-Level Security (RLS) para Isolamento Multi-Tenant
ALTER TABLE legis_core.legal_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON legis_core.legal_cases
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);
