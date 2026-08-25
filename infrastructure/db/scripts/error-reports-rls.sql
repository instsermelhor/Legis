-- =============================================================================
-- infrastructure/db/scripts/error-reports-rls.sql
-- LEGIS CONNECT — DATABASE SECURITY POLICIES: ERROR REPORTS (RLS ENFORCEMENT)
-- =============================================================================

-- 1. Habilitar RLS estrito nas tabelas de Error Reporting
ALTER TABLE IF EXISTS error_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS error_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS error_report_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS error_report_events FORCE ROW LEVEL SECURITY;

-- 2. Limpar políticas legadas
DROP POLICY IF EXISTS "error_reports_insert_own_tenant" ON error_reports;
DROP POLICY IF EXISTS "error_reports_select_tenant_scoped" ON error_reports;
DROP POLICY IF EXISTS "error_reports_update_staff" ON error_reports;
DROP POLICY IF EXISTS "error_reports_delete_superadmin" ON error_reports;

DROP POLICY IF EXISTS "error_report_events_insert" ON error_report_events;
DROP POLICY IF EXISTS "error_report_events_select" ON error_report_events;

-- 3. Políticas para error_reports

-- INSERT: Qualquer usuário autenticado pode criar relatório no próprio tenant
CREATE POLICY "error_reports_insert_own_tenant"
  ON error_reports FOR INSERT
  WITH CHECK (
    tenant_id = current_setting('app.current_tenant_id', true)
    OR current_setting('app.current_role', true) = 'super_admin'
  );

-- SELECT: Isolamento estrito por tenant. Super Admin pode ler globalmente
CREATE POLICY "error_reports_select_tenant_scoped"
  ON error_reports FOR SELECT
  USING (
    tenant_id = current_setting('app.current_tenant_id', true)
    OR current_setting('app.current_role', true) = 'super_admin'
  );

-- UPDATE: Apenas staff autorizado (Admin, Super Admin, Compliance Auditor) no próprio tenant
CREATE POLICY "error_reports_update_staff"
  ON error_reports FOR UPDATE
  USING (
    (tenant_id = current_setting('app.current_tenant_id', true)
     AND current_setting('app.current_role', true) IN ('admin', 'staff_compliance_auditor'))
    OR current_setting('app.current_role', true) = 'super_admin'
  )
  WITH CHECK (
    -- Impede fuga ou migração indevida de tenant_id
    tenant_id = current_setting('app.current_tenant_id', true)
    OR current_setting('app.current_role', true) = 'super_admin'
  );

-- DELETE: Exclusão estritamente restrita ao Super Administrador com auditoria
CREATE POLICY "error_reports_delete_superadmin"
  ON error_reports FOR DELETE
  USING (current_setting('app.current_role', true) = 'super_admin');

-- 4. Políticas para error_report_events

-- INSERT: Staff e autor do evento
CREATE POLICY "error_report_events_insert"
  ON error_report_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM error_reports r
      WHERE r.id = error_report_events.report_id
      AND (r.tenant_id = current_setting('app.current_tenant_id', true)
           OR current_setting('app.current_role', true) = 'super_admin')
    )
  );

-- SELECT: Tenant-scoped via relacionamento com error_reports
CREATE POLICY "error_report_events_select"
  ON error_report_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM error_reports r
      WHERE r.id = error_report_events.report_id
      AND (r.tenant_id = current_setting('app.current_tenant_id', true)
           OR current_setting('app.current_role', true) = 'super_admin')
    )
  );
