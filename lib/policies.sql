-- ============================================================================
-- lib/policies.sql — Row Level Security para Legis Connect
-- ============================================================================
-- Execute este arquivo no SQL Editor do Supabase:
--   Supabase Dashboard → SQL Editor → New Query → cole e execute
--
-- Após executar o DDL do schema.prisma, rode estas políticas.
-- ============================================================================

-- ─── Habilitar RLS em todas as tabelas ────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

-- ─── USERS ───────────────────────────────────────────────────────────────────

-- Usuário vê apenas seu próprio perfil
CREATE POLICY "users_self_read" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Usuário atualiza apenas seu próprio perfil
CREATE POLICY "users_self_update" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Admin vê todos os usuários
CREATE POLICY "users_admin_read" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()::text
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- ─── CASES ───────────────────────────────────────────────────────────────────

-- Cliente vê apenas seus próprios processos
CREATE POLICY "cases_client_read" ON cases
  FOR SELECT USING (client_id = auth.uid()::text);

-- Advogado vê os processos onde é responsável
CREATE POLICY "cases_lawyer_read" ON cases
  FOR SELECT USING (lawyer_id = auth.uid()::text);

-- Advogado cria processos
CREATE POLICY "cases_lawyer_insert" ON cases
  FOR INSERT WITH CHECK (lawyer_id = auth.uid()::text);

-- Advogado atualiza seus processos
CREATE POLICY "cases_lawyer_update" ON cases
  FOR UPDATE USING (lawyer_id = auth.uid()::text);

-- Admin vê todos os processos
CREATE POLICY "cases_admin_read" ON cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()::text
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- ─── CONTRACTS ───────────────────────────────────────────────────────────────

CREATE POLICY "contracts_client_read" ON contracts
  FOR SELECT USING (client_id = auth.uid()::text);

CREATE POLICY "contracts_lawyer_read" ON contracts
  FOR SELECT USING (lawyer_id = auth.uid()::text);

CREATE POLICY "contracts_lawyer_insert" ON contracts
  FOR INSERT WITH CHECK (lawyer_id = auth.uid()::text);

CREATE POLICY "contracts_lawyer_update" ON contracts
  FOR UPDATE USING (lawyer_id = auth.uid()::text);

-- ─── INVOICES ────────────────────────────────────────────────────────────────

CREATE POLICY "invoices_client_read" ON invoices
  FOR SELECT USING (client_id = auth.uid()::text);

CREATE POLICY "invoices_lawyer_read" ON invoices
  FOR SELECT USING (lawyer_id = auth.uid()::text);

CREATE POLICY "invoices_lawyer_insert" ON invoices
  FOR INSERT WITH CHECK (lawyer_id = auth.uid()::text);

-- ─── DOCUMENTS ───────────────────────────────────────────────────────────────

CREATE POLICY "documents_case_read" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = documents.case_id
      AND (c.lawyer_id = auth.uid()::text OR c.client_id = auth.uid()::text)
    )
  );

-- ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

-- Logs são somente leitura para admins; apenas o sistema escreve
CREATE POLICY "audit_logs_admin_read" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()::text
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- ─── PRIVACY CONSENTS ────────────────────────────────────────────────────────

CREATE POLICY "privacy_consents_self" ON privacy_consents
  FOR ALL USING (user_id = auth.uid()::text);

-- ============================================================================
-- TABELA LGPD: privacy_consents (se não existir no schema.prisma)
-- ============================================================================

CREATE TABLE IF NOT EXISTS privacy_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  policy_version TEXT NOT NULL DEFAULT '1.0',
  UNIQUE(user_id, policy_version)
);
