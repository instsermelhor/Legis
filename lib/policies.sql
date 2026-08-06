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

-- ─── CMS CONTENT (SSOT) ──────────────────────────────────────────────────────

ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;

-- Leitura pública para todos os utilizadores (necessário para site institucional)
CREATE POLICY "cms_public_read" ON cms_content
  FOR SELECT USING (true);

-- Escrita restrita a administradores e super_admins
CREATE POLICY "cms_admin_write" ON cms_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()::text
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- ─── MODERATION QUEUE ────────────────────────────────────────────────────────

ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- Utilizadores podem ver seus próprios itens de moderação
CREATE POLICY "moderation_author_read" ON moderation_queue
  FOR SELECT USING (author_id = auth.uid()::text);

-- Utilizadores podem submeter novos itens para moderação
CREATE POLICY "moderation_user_insert" ON moderation_queue
  FOR INSERT WITH CHECK (author_id = auth.uid()::text);

-- Admins têm acesso total à fila de moderação
CREATE POLICY "moderation_admin_all" ON moderation_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()::text
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- ─── AI USAGE LOGS ───────────────────────────────────────────────────────────

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Utilizadores lêem apenas seus próprios logs de consumo de IA
CREATE POLICY "ai_logs_self_read" ON ai_usage_logs
  FOR SELECT USING (user_id = auth.uid()::text);

-- Inserção de log pelo utilizador ou sistema
CREATE POLICY "ai_logs_user_insert" ON ai_usage_logs
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Admins visualizam consumo global
CREATE POLICY "ai_logs_admin_read" ON ai_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()::text
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- ─── LGPD REQUESTS ───────────────────────────────────────────────────────────

ALTER TABLE lgpd_requests ENABLE ROW LEVEL SECURITY;

-- Titular lê e cria suas próprias solicitações de direitos
CREATE POLICY "lgpd_self_all" ON lgpd_requests
  FOR ALL USING (user_id = auth.uid()::text);

-- Admins e DPO gerenciam todas as solicitações LGPD
CREATE POLICY "lgpd_admin_all" ON lgpd_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()::text
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- TABELAS SUPABASE (DDL Completo)
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

CREATE TABLE IF NOT EXISTS cms_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  content JSONB NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS moderation_queue (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  author_id TEXT NOT NULL REFERENCES users(id),
  author_email TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  flags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  review_notes TEXT,
  reported_by TEXT
);

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id),
  model TEXT NOT NULL,
  tokens_in INT NOT NULL DEFAULT 0,
  tokens_out INT NOT NULL DEFAULT 0,
  view TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lgpd_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id),
  user_email TEXT NOT NULL,
  right_type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deadline_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_notes TEXT
);

