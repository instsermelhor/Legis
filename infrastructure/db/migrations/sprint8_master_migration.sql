-- ============================================================================
-- Legis Connect Platform — Sprint 8 Master Database Migration & RLS Policies
-- Target Database: PostgreSQL 15+ / Supabase
-- Project ID: tddzffccnuccewfoczjl
-- ============================================================================

-- ─── 1. EXTENSÕES ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 2. ENUMS ────────────────────────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CLIENT', 'LAWYER', 'INTERN', 'SECRETARY', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE case_status AS ENUM ('ACTIVE', 'CONCLUDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE audit_severity AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 3. TABELAS DE BANCO DE DADOS ────────────────────────────────────────────

-- 3.1 Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CLIENT',
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  mfa_secret TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 3.2 Lawyer Profiles
CREATE TABLE IF NOT EXISTS lawyer_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  oab TEXT UNIQUE NOT NULL,
  oab_uf TEXT NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  bio TEXT,
  consultation_fee NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'pendente',
  verified_at TIMESTAMPTZ,
  ai_token_balance INT NOT NULL DEFAULT 1000,
  client_limit INT NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 Cases (Processos jurídicos)
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  case_group TEXT,
  case_type TEXT,
  client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_cpf_hash TEXT,
  process_documents TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  concluded_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- 3.4 Contracts (Contratos de honorários e prestação de serviços)
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id TEXT REFERENCES cases(id) ON DELETE SET NULL,
  client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'draft',
  signed_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.5 Invoices (Faturas e Lançamentos Financeiros)
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  contract_id TEXT REFERENCES contracts(id) ON DELETE SET NULL,
  client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  pix_code TEXT,
  barcode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.6 Documents (Digital Vault)
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.7 Staff Audit Logs (Trilha de Auditoria com Hash Chain)
CREATE TABLE IF NOT EXISTS staff_audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  details TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  hash TEXT UNIQUE NOT NULL,
  previous_hash TEXT,
  severity TEXT NOT NULL DEFAULT 'INFO'
);

-- 3.8 Privacy Consents (LGPD)
CREATE TABLE IF NOT EXISTS privacy_consents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  policy_version TEXT NOT NULL DEFAULT '1.0',
  UNIQUE(user_id, policy_version)
);

-- 3.9 CMS Content (SSOT de Branding e Configurações)
CREATE TABLE IF NOT EXISTS cms_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  content JSONB NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.10 Moderation Queue (Fila de Moderação)
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

-- 3.11 AI Usage Logs (Monitoramento de Consumo de Tokens Gemini)
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id),
  model TEXT NOT NULL,
  tokens_in INT NOT NULL DEFAULT 0,
  tokens_out INT NOT NULL DEFAULT 0,
  view TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.12 LGPD Requests (Solicitações de Direitos do Titular)
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

-- ─── 4. ÍNDICES DE ALTA PERFORMANCE ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_user ON lawyer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_oab ON lawyer_profiles(oab);
CREATE INDEX IF NOT EXISTS idx_cases_client ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_contracts_case ON contracts(case_id);
CREATE INDEX IF NOT EXISTS idx_contracts_lawyer ON contracts(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_lawyer ON invoices(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON staff_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_hash ON staff_audit_logs(hash);

-- ─── 5. ATUALIZAÇÃO AUTOMÁTICA DE UPDATED_AT ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_lawyer_profiles_updated_at BEFORE UPDATE ON lawyer_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 6. ROW LEVEL SECURITY (RLS) POLICIES ────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_requests ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas prévias
DROP POLICY IF EXISTS "users_permissive" ON users;
DROP POLICY IF EXISTS "lawyer_profiles_permissive" ON lawyer_profiles;
DROP POLICY IF EXISTS "cases_permissive" ON cases;
DROP POLICY IF EXISTS "contracts_permissive" ON contracts;
DROP POLICY IF EXISTS "invoices_permissive" ON invoices;
DROP POLICY IF EXISTS "documents_permissive" ON documents;
DROP POLICY IF EXISTS "audit_logs_permissive" ON staff_audit_logs;
DROP POLICY IF EXISTS "privacy_consents_permissive" ON privacy_consents;
DROP POLICY IF EXISTS "cms_content_permissive" ON cms_content;
DROP POLICY IF EXISTS "moderation_queue_permissive" ON moderation_queue;
DROP POLICY IF EXISTS "ai_usage_logs_permissive" ON ai_usage_logs;
DROP POLICY IF EXISTS "lgpd_requests_permissive" ON lgpd_requests;

-- Aplicação de Políticas Flexíveis para DUAL MODE (Anon / Auth)
CREATE POLICY "users_permissive" ON users FOR ALL USING (true);
CREATE POLICY "lawyer_profiles_permissive" ON lawyer_profiles FOR ALL USING (true);
CREATE POLICY "cases_permissive" ON cases FOR ALL USING (true);
CREATE POLICY "contracts_permissive" ON contracts FOR ALL USING (true);
CREATE POLICY "invoices_permissive" ON invoices FOR ALL USING (true);
CREATE POLICY "documents_permissive" ON documents FOR ALL USING (true);
CREATE POLICY "audit_logs_permissive" ON staff_audit_logs FOR ALL USING (true);
CREATE POLICY "privacy_consents_permissive" ON privacy_consents FOR ALL USING (true);
CREATE POLICY "cms_content_permissive" ON cms_content FOR ALL USING (true);
CREATE POLICY "moderation_queue_permissive" ON moderation_queue FOR ALL USING (true);
CREATE POLICY "ai_usage_logs_permissive" ON ai_usage_logs FOR ALL USING (true);
CREATE POLICY "lgpd_requests_permissive" ON lgpd_requests FOR ALL USING (true);

-- ─── 7. SEED INICIAL DE PRODUÇÃO ──────────────────────────────────────────────
INSERT INTO users (id, email, password_hash, role, name, active)
VALUES (
  'super_admin_master_001',
  'instsermelhor.adm@gmail.com',
  '@@Rk08266570#',
  'SUPER_ADMIN',
  'Super Admin Legis Connect',
  true
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, active = true;

SELECT 'Legis Connect Sprint 8 Master Database Migration Completed Successfully!' AS status;
