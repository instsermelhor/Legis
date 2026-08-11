-- ─────────────────────────────────────────────────────────────────────────────
-- infrastructure/db/scripts/update_rls_rbac_v2.sql
-- LEGIS CONNECT — RLS RBAC v2.0 Update
-- IDOR Protection + Tenant Isolation + Role-Level Policies
--
-- Objetivo:
--   Nenhum dado é acessado sem que o banco valide:
--   1. Autenticação (auth.uid() != null)
--   2. Propriedade do recurso (owner_id, assigned_to, office_id)
--   3. Role do usuário via JWT claim (auth.jwt() -> 'role')
--
-- Execução: psql $DATABASE_URL -f update_rls_rbac_v2.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Helper Functions ──────────────────────────────────────────────────────────

-- Retorna o role do usuário autenticado a partir do JWT
CREATE OR REPLACE FUNCTION legis_get_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'role',
    (SELECT role FROM legis_profiles WHERE id = auth.uid()),
    'client'
  );
$$;

-- Retorna o office_id do usuário autenticado
CREATE OR REPLACE FUNCTION legis_get_user_office_id()
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT office_id FROM legis_profiles WHERE id = auth.uid();
$$;

-- Verifica se o usuário é staff interno (admin / super_admin)
CREATE OR REPLACE FUNCTION legis_is_staff()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT legis_get_user_role() IN (
    'super_admin', 'admin',
    'staff_finance_admin', 'staff_compliance_auditor', 'staff_support_l1'
  );
$$;

-- ── Profiles ──────────────────────────────────────────────────────────────────
-- Isolamento: usuário acessa somente seu próprio perfil
-- Admin/Super Admin acessam todos

ALTER TABLE IF EXISTS legis_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_own_read"    ON legis_profiles;
DROP POLICY IF EXISTS "profiles_own_update"  ON legis_profiles;
DROP POLICY IF EXISTS "profiles_staff_read"  ON legis_profiles;
DROP POLICY IF EXISTS "profiles_staff_write" ON legis_profiles;

CREATE POLICY "profiles_own_read"
  ON legis_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_own_update"
  ON legis_profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profiles_staff_read"
  ON legis_profiles FOR SELECT
  USING (legis_is_staff());

CREATE POLICY "profiles_staff_write"
  ON legis_profiles FOR ALL
  USING (legis_get_user_role() IN ('super_admin', 'admin'));

-- ── Clients ───────────────────────────────────────────────────────────────────
-- Cliente acessa somente seus próprios dados.
-- Advogado acessa clientes vinculados ao seu escritório.
-- Admin/Staff acessam todos.
-- IDOR: proibido acessar por ID sem vínculo.

ALTER TABLE IF EXISTS legis_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients_own_read"    ON legis_clients;
DROP POLICY IF EXISTS "clients_lawyer_read" ON legis_clients;
DROP POLICY IF EXISTS "clients_staff_all"   ON legis_clients;

CREATE POLICY "clients_own_read"
  ON legis_clients FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "clients_lawyer_read"
  ON legis_clients FOR SELECT
  USING (
    legis_get_user_role() = 'lawyer'
    AND office_id = legis_get_user_office_id()
  );

CREATE POLICY "clients_staff_all"
  ON legis_clients FOR ALL
  USING (legis_is_staff());

-- ── Cases ─────────────────────────────────────────────────────────────────────
-- Cliente acessa apenas seus próprios casos.
-- Advogado acessa casos atribuídos ou do seu escritório.
-- Estagiário/Secretária: apenas casos explicitamente atribuídos.
-- IDOR: proibido acessar caso de outro usuário por ID.

ALTER TABLE IF EXISTS legis_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cases_client_own"    ON legis_cases;
DROP POLICY IF EXISTS "cases_lawyer_office" ON legis_cases;
DROP POLICY IF EXISTS "cases_assigned"      ON legis_cases;
DROP POLICY IF EXISTS "cases_staff_all"     ON legis_cases;

CREATE POLICY "cases_client_own"
  ON legis_cases FOR SELECT
  USING (
    legis_get_user_role() = 'client'
    AND client_id = auth.uid()
  );

CREATE POLICY "cases_lawyer_office"
  ON legis_cases FOR ALL
  USING (
    legis_get_user_role() = 'lawyer'
    AND (
      lawyer_id = auth.uid()
      OR office_id = legis_get_user_office_id()
    )
  );

CREATE POLICY "cases_assigned"
  ON legis_cases FOR SELECT
  USING (
    legis_get_user_role() IN ('secretary', 'intern')
    AND assigned_to = auth.uid()
  );

CREATE POLICY "cases_staff_all"
  ON legis_cases FOR ALL
  USING (legis_is_staff());

-- ── Documents ─────────────────────────────────────────────────────────────────
-- Documento acessa somente por owner ou por compartilhamento explícito.
-- IDOR: proibido acessar documento por ID sem autorização.

ALTER TABLE IF EXISTS legis_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "docs_own_read"      ON legis_documents;
DROP POLICY IF EXISTS "docs_shared_read"   ON legis_documents;
DROP POLICY IF EXISTS "docs_lawyer_office" ON legis_documents;
DROP POLICY IF EXISTS "docs_staff_all"     ON legis_documents;

CREATE POLICY "docs_own_read"
  ON legis_documents FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "docs_shared_read"
  ON legis_documents FOR SELECT
  USING (
    auth.uid() = ANY(shared_with)
    OR (is_public = true AND legis_get_user_role() != 'client')
  );

CREATE POLICY "docs_lawyer_office"
  ON legis_documents FOR ALL
  USING (
    legis_get_user_role() = 'lawyer'
    AND office_id = legis_get_user_office_id()
  );

CREATE POLICY "docs_staff_all"
  ON legis_documents FOR ALL
  USING (legis_is_staff());

-- ── Agenda / Appointments ─────────────────────────────────────────────────────
-- IDOR: agenda de outro usuário não deve ser acessível por manipulação de ID.

ALTER TABLE IF EXISTS legis_agenda ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agenda_participant_read"  ON legis_agenda;
DROP POLICY IF EXISTS "agenda_owner_write"       ON legis_agenda;
DROP POLICY IF EXISTS "agenda_secretary_manage"  ON legis_agenda;
DROP POLICY IF EXISTS "agenda_staff_all"         ON legis_agenda;

CREATE POLICY "agenda_participant_read"
  ON legis_agenda FOR SELECT
  USING (
    owner_id = auth.uid()
    OR client_id = auth.uid()
    OR assigned_to = auth.uid()
  );

CREATE POLICY "agenda_owner_write"
  ON legis_agenda FOR INSERT
  USING (owner_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "agenda_secretary_manage"
  ON legis_agenda FOR ALL
  USING (
    legis_get_user_role() = 'secretary'
    AND office_id = legis_get_user_office_id()
  );

CREATE POLICY "agenda_staff_all"
  ON legis_agenda FOR ALL
  USING (legis_is_staff());

-- ── Financial Transactions ────────────────────────────────────────────────────
-- Financeiro: apenas Finance Admin e Super Admin têm acesso global.
-- Advogado: somente suas próprias transações.
-- Cliente: somente suas próprias transações.
-- Qualquer outro role: DENY BY DEFAULT.

ALTER TABLE IF EXISTS legis_financial_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financial_own_read"     ON legis_financial_transactions;
DROP POLICY IF EXISTS "financial_lawyer_own"   ON legis_financial_transactions;
DROP POLICY IF EXISTS "financial_admin_all"    ON legis_financial_transactions;

CREATE POLICY "financial_own_read"
  ON legis_financial_transactions FOR SELECT
  USING (
    legis_get_user_role() = 'client'
    AND client_id = auth.uid()
  );

CREATE POLICY "financial_lawyer_own"
  ON legis_financial_transactions FOR SELECT
  USING (
    legis_get_user_role() = 'lawyer'
    AND lawyer_id = auth.uid()
  );

CREATE POLICY "financial_admin_all"
  ON legis_financial_transactions FOR ALL
  USING (
    legis_get_user_role() IN ('super_admin', 'admin', 'staff_finance_admin')
  );

-- ── Escrow ────────────────────────────────────────────────────────────────────

ALTER TABLE IF EXISTS legis_escrow ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "escrow_parties_read"  ON legis_escrow;
DROP POLICY IF EXISTS "escrow_lawyer_manage" ON legis_escrow;
DROP POLICY IF EXISTS "escrow_admin_all"     ON legis_escrow;

CREATE POLICY "escrow_parties_read"
  ON legis_escrow FOR SELECT
  USING (
    client_id = auth.uid()
    OR lawyer_id = auth.uid()
  );

CREATE POLICY "escrow_lawyer_manage"
  ON legis_escrow FOR ALL
  USING (
    legis_get_user_role() = 'lawyer'
    AND lawyer_id = auth.uid()
  );

CREATE POLICY "escrow_admin_all"
  ON legis_escrow FOR ALL
  USING (
    legis_get_user_role() IN ('super_admin', 'admin', 'staff_finance_admin')
  );

-- ── Audit Logs ────────────────────────────────────────────────────────────────
-- Append-only por padrão — somente super_admin pode deletar.
-- IDOR: nenhum usuário acessa logs de outro sem autorização de staff.

ALTER TABLE IF EXISTS legis_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_own_read"        ON legis_audit_logs;
DROP POLICY IF EXISTS "audit_staff_read"      ON legis_audit_logs;
DROP POLICY IF EXISTS "audit_superadmin_all"  ON legis_audit_logs;
DROP POLICY IF EXISTS "audit_no_delete"       ON legis_audit_logs;

CREATE POLICY "audit_own_read"
  ON legis_audit_logs FOR SELECT
  USING (actor_id = auth.uid());

CREATE POLICY "audit_staff_read"
  ON legis_audit_logs FOR SELECT
  USING (legis_is_staff());

-- Super admin pode deletar (ex: LGPD)
CREATE POLICY "audit_superadmin_all"
  ON legis_audit_logs FOR ALL
  USING (legis_get_user_role() = 'super_admin');

-- Insert permitido para todos os autenticados (append-only)
CREATE POLICY "audit_insert"
  ON legis_audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── Offices / Organizations ───────────────────────────────────────────────────
-- Isolamento total entre escritórios (Tenant Isolation)

ALTER TABLE IF EXISTS legis_offices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "offices_member_read"  ON legis_offices;
DROP POLICY IF EXISTS "offices_admin_all"    ON legis_offices;

CREATE POLICY "offices_member_read"
  ON legis_offices FOR SELECT
  USING (id = legis_get_user_office_id());

CREATE POLICY "offices_admin_all"
  ON legis_offices FOR ALL
  USING (legis_get_user_role() IN ('super_admin', 'admin'));

-- ─────────────────────────────────────────────────────────────────────────────
-- Verificação pós-aplicação
-- ─────────────────────────────────────────────────────────────────────────────
-- Exibir políticas ativas
SELECT schemaname, tablename, policyname, cmd, permissive
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'legis_%'
ORDER BY tablename, policyname;
