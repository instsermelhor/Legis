-- ============================================================================
-- lib/policies.sql — Row Level Security para Legis Connect
-- ============================================================================
-- ⚠️  AUDITORIA P0 — CORREÇÃO CRÍTICA DE SEGURANÇA (V-001)
--     Adicionado tenant_id a TODAS as políticas de isolamento.
--     Sem isso, um usuário do Tenant A poderia acessar dados do Tenant B.
--
-- Execute este arquivo no SQL Editor do Supabase APÓS o setup_database.sql:
--   Supabase Dashboard → SQL Editor → New Query → cole e execute
-- ============================================================================

-- ─── Função de contexto de segurança ─────────────────────────────────────────
-- Deve ser chamada no início de cada conexão/request para injetar:
--   app.current_tenant_id  — tenant ativo
--   app.current_user_id    — usuário autenticado
--   app.current_user_role  — role do usuário

CREATE OR REPLACE FUNCTION set_app_security_context(
  p_tenant_id TEXT,
  p_user_id   TEXT,
  p_user_role TEXT
) RETURNS void AS $$
BEGIN
  -- Valida que os parâmetros não estão vazios (proteção contra injeção de contexto vazio)
  IF p_tenant_id = '' OR p_user_id = '' THEN
    RAISE EXCEPTION '[RLS] set_app_security_context: tenant_id e user_id são obrigatórios';
  END IF;

  PERFORM set_config('app.current_tenant_id', p_tenant_id, true);
  PERFORM set_config('app.current_user_id',   p_user_id,   true);
  PERFORM set_config('app.current_user_role', p_user_role, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: verifica se o usuário é admin/super_admin
CREATE OR REPLACE FUNCTION is_platform_admin() RETURNS boolean AS $$
BEGIN
  RETURN current_setting('app.current_user_role', true) IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper: verifica se o tenant atual é o tenant da row
CREATE OR REPLACE FUNCTION current_tenant_matches(row_tenant_id TEXT) RETURNS boolean AS $$
BEGIN
  -- Admins de plataforma têm acesso cross-tenant (auditado)
  IF is_platform_admin() THEN RETURN true; END IF;
  RETURN row_tenant_id = current_setting('app.current_tenant_id', true);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ─── Habilitar RLS em todas as tabelas ────────────────────────────────────────

ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases               ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_consents    ENABLE ROW LEVEL SECURITY;

-- ─── USERS ───────────────────────────────────────────────────────────────────

-- DROP das políticas antigas para evitar conflito
DROP POLICY IF EXISTS "users_self_read"   ON users;
DROP POLICY IF EXISTS "users_self_update" ON users;
DROP POLICY IF EXISTS "users_admin_read"  ON users;

-- Usuário vê apenas seu próprio perfil
CREATE POLICY "users_self_read" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Usuário atualiza apenas seu próprio perfil
CREATE POLICY "users_self_update" ON users
  FOR UPDATE USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Admin de plataforma vê todos os usuários (auditado via audit_logs)
CREATE POLICY "users_platform_admin_read" ON users
  FOR SELECT USING (is_platform_admin());

-- Gestor vê usuários do mesmo tenant
CREATE POLICY "users_gestor_read" ON users
  FOR SELECT USING (
    current_setting('app.current_user_role', true) IN ('gestor', 'lawyer')
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

-- ─── LAWYER PROFILES ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "lawyer_profiles_self" ON lawyer_profiles;
DROP POLICY IF EXISTS "lawyer_profiles_admin" ON lawyer_profiles;

-- Advogado vê e edita seu próprio perfil
CREATE POLICY "lawyer_profiles_self_read" ON lawyer_profiles
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "lawyer_profiles_self_update" ON lawyer_profiles
  FOR UPDATE USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Leitura pública de perfis aprovados (marketplace)
CREATE POLICY "lawyer_profiles_public_read" ON lawyer_profiles
  FOR SELECT USING (status = 'approved');

-- Admin vê todos
CREATE POLICY "lawyer_profiles_admin_all" ON lawyer_profiles
  FOR ALL USING (is_platform_admin());

-- ─── CASES ───────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "cases_client_read"  ON cases;
DROP POLICY IF EXISTS "cases_lawyer_read"  ON cases;
DROP POLICY IF EXISTS "cases_lawyer_insert" ON cases;
DROP POLICY IF EXISTS "cases_lawyer_update" ON cases;
DROP POLICY IF EXISTS "cases_admin_read"   ON cases;

-- ⚠️  CORREÇÃO CRÍTICA: Adicionado tenant_id em TODAS as políticas de cases

-- Cliente vê APENAS seus processos NO TENANT ATIVO
CREATE POLICY "cases_client_read" ON cases
  FOR SELECT USING (
    client_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

-- Advogado vê processos onde é responsável NO TENANT ATIVO
CREATE POLICY "cases_lawyer_read" ON cases
  FOR SELECT USING (
    lawyer_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

-- Estagiário/assistente vê processos atribuídos NO TENANT ATIVO
CREATE POLICY "cases_assigned_read" ON cases
  FOR SELECT USING (
    assigned_to = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

-- Gestor vê todos os casos do tenant
CREATE POLICY "cases_gestor_read" ON cases
  FOR SELECT USING (
    current_setting('app.current_user_role', true) = 'gestor'
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

-- Advogado cria processos somente no próprio tenant
CREATE POLICY "cases_lawyer_insert" ON cases
  FOR INSERT WITH CHECK (
    lawyer_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

-- Gestor cria processos no tenant
CREATE POLICY "cases_gestor_insert" ON cases
  FOR INSERT WITH CHECK (
    current_setting('app.current_user_role', true) = 'gestor'
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

-- Advogado atualiza seus processos no tenant
CREATE POLICY "cases_lawyer_update" ON cases
  FOR UPDATE USING (
    lawyer_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    lawyer_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

-- Gestor atualiza processos do tenant
CREATE POLICY "cases_gestor_update" ON cases
  FOR UPDATE USING (
    current_setting('app.current_user_role', true) = 'gestor'
    AND tenant_id = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    tenant_id = current_setting('app.current_tenant_id', true)
  );

-- Soft delete: advogado e gestor
CREATE POLICY "cases_delete" ON cases
  FOR DELETE USING (
    (lawyer_id = auth.uid()::text OR current_setting('app.current_user_role', true) = 'gestor')
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

-- Admin de plataforma vê todos os casos (cross-tenant — auditado)
CREATE POLICY "cases_platform_admin_all" ON cases
  FOR ALL USING (is_platform_admin());

-- ─── CONTRACTS ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "contracts_client_read"   ON contracts;
DROP POLICY IF EXISTS "contracts_lawyer_read"   ON contracts;
DROP POLICY IF EXISTS "contracts_lawyer_insert" ON contracts;
DROP POLICY IF EXISTS "contracts_lawyer_update" ON contracts;

-- ⚠️  CORREÇÃO CRÍTICA: tenant_id em todas as políticas de contracts

CREATE POLICY "contracts_client_read" ON contracts
  FOR SELECT USING (
    client_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY "contracts_lawyer_read" ON contracts
  FOR SELECT USING (
    lawyer_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY "contracts_gestor_read" ON contracts
  FOR SELECT USING (
    current_setting('app.current_user_role', true) = 'gestor'
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY "contracts_lawyer_insert" ON contracts
  FOR INSERT WITH CHECK (
    lawyer_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY "contracts_lawyer_update" ON contracts
  FOR UPDATE USING (
    lawyer_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    tenant_id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY "contracts_platform_admin_all" ON contracts
  FOR ALL USING (is_platform_admin());

-- ─── INVOICES ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "invoices_client_read"   ON invoices;
DROP POLICY IF EXISTS "invoices_lawyer_read"   ON invoices;
DROP POLICY IF EXISTS "invoices_lawyer_insert" ON invoices;

-- ⚠️  CORREÇÃO CRÍTICA: tenant_id em todas as políticas de invoices

CREATE POLICY "invoices_client_read" ON invoices
  FOR SELECT USING (
    client_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY "invoices_lawyer_read" ON invoices
  FOR SELECT USING (
    lawyer_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY "invoices_gestor_read" ON invoices
  FOR SELECT USING (
    current_setting('app.current_user_role', true) = 'gestor'
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY "invoices_lawyer_insert" ON invoices
  FOR INSERT WITH CHECK (
    lawyer_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY "invoices_lawyer_update" ON invoices
  FOR UPDATE USING (
    lawyer_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    tenant_id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY "invoices_platform_admin_all" ON invoices
  FOR ALL USING (is_platform_admin());

-- ─── DOCUMENTS ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "documents_case_read" ON documents;

-- ⚠️  CORREÇÃO CRÍTICA: tenant_id verificado via case pai

CREATE POLICY "documents_authorized_read" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = documents.case_id
      AND (c.lawyer_id = auth.uid()::text OR c.client_id = auth.uid()::text OR c.assigned_to = auth.uid()::text)
      AND c.tenant_id = current_setting('app.current_tenant_id', true)
    )
    OR (
      -- Documentos sem case_id (avulsos) — verificar owner direto
      documents.case_id IS NULL
      AND documents.owner_id = auth.uid()::text
      AND documents.tenant_id = current_setting('app.current_tenant_id', true)
    )
  );

CREATE POLICY "documents_authorized_insert" ON documents
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY "documents_owner_update" ON documents
  FOR UPDATE USING (
    owner_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    tenant_id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY "documents_owner_delete" ON documents
  FOR DELETE USING (
    owner_id = auth.uid()::text
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY "documents_platform_admin_all" ON documents
  FOR ALL USING (is_platform_admin());

-- ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "audit_logs_admin_read" ON audit_logs;

-- Logs são IMUTÁVEIS — apenas INSERT pelo sistema, SELECT por admins
CREATE POLICY "audit_logs_platform_admin_read" ON audit_logs
  FOR SELECT USING (is_platform_admin());

-- Sistema (service role) pode inserir — sem policy de INSERT para roles normais
-- O service_role bypassa RLS por definição no Supabase

-- ─── PRIVACY CONSENTS ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "privacy_consents_self" ON privacy_consents;

CREATE POLICY "privacy_consents_self_all" ON privacy_consents
  FOR ALL USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "privacy_consents_admin_read" ON privacy_consents
  FOR SELECT USING (is_platform_admin());

-- ─── CMS CONTENT (SSOT) ──────────────────────────────────────────────────────

ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cms_public_read"  ON cms_content;
DROP POLICY IF EXISTS "cms_admin_write"  ON cms_content;

-- Leitura pública para todos (site institucional)
CREATE POLICY "cms_public_read" ON cms_content
  FOR SELECT USING (true);

-- Escrita restrita a admins de plataforma
CREATE POLICY "cms_platform_admin_write" ON cms_content
  FOR ALL USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- ─── MODERATION QUEUE ────────────────────────────────────────────────────────

ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "moderation_author_read"  ON moderation_queue;
DROP POLICY IF EXISTS "moderation_user_insert"  ON moderation_queue;
DROP POLICY IF EXISTS "moderation_admin_all"    ON moderation_queue;

CREATE POLICY "moderation_author_read" ON moderation_queue
  FOR SELECT USING (author_id = auth.uid()::text);

CREATE POLICY "moderation_user_insert" ON moderation_queue
  FOR INSERT WITH CHECK (author_id = auth.uid()::text);

CREATE POLICY "moderation_platform_admin_all" ON moderation_queue
  FOR ALL USING (is_platform_admin());

-- ─── AI USAGE LOGS ───────────────────────────────────────────────────────────

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_logs_self_read"   ON ai_usage_logs;
DROP POLICY IF EXISTS "ai_logs_user_insert" ON ai_usage_logs;
DROP POLICY IF EXISTS "ai_logs_admin_read"  ON ai_usage_logs;

CREATE POLICY "ai_logs_self_read" ON ai_usage_logs
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "ai_logs_user_insert" ON ai_usage_logs
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "ai_logs_platform_admin_read" ON ai_usage_logs
  FOR SELECT USING (is_platform_admin());

-- ─── LGPD REQUESTS ───────────────────────────────────────────────────────────

ALTER TABLE lgpd_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lgpd_self_all"  ON lgpd_requests;
DROP POLICY IF EXISTS "lgpd_admin_all" ON lgpd_requests;

-- Titular lê e cria suas próprias solicitações
CREATE POLICY "lgpd_self_all" ON lgpd_requests
  FOR ALL USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Admins e DPO gerenciam todas as solicitações
CREATE POLICY "lgpd_platform_admin_all" ON lgpd_requests
  FOR ALL USING (is_platform_admin());

-- ─── STAFF AUDIT LOGS ────────────────────────────────────────────────────────

ALTER TABLE staff_audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas super_admin lê logs de staff
CREATE POLICY "staff_audit_super_admin_read" ON staff_audit_logs
  FOR SELECT USING (
    current_setting('app.current_user_role', true) = 'super_admin'
  );

-- Sistema insere via service_role (bypassa RLS)

-- ============================================================================
-- DDL: Tabelas complementares (se ainda não existirem)
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

-- ─── Índices para performance de RLS ─────────────────────────────────────────
-- Índices em tenant_id melhoram dramaticamente o custo das políticas RLS

CREATE INDEX IF NOT EXISTS idx_cases_tenant_id       ON cases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_tenant   ON cases(lawyer_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_tenant   ON cases(client_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_id   ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id    ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_id   ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_owner_tenant ON documents(owner_id, tenant_id);
