-- ============================================================================
-- Legis Connect Ecosystem — Master Database Setup & RLS Script
-- ============================================================================
-- Instruções:
--   1. Acesse https://supabase.com/dashboard/project/tddzffccnuccewfoczjl
--   2. Vá na navegação lateral → SQL Editor → "+ New query"
--   3. Cole este arquivo completo e clique em "Run" (ou pressione Cmd/Ctrl + Enter)
-- ============================================================================

-- ─── 1. EXTENSÕES & ENUMS ────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CLIENT', 'LAWYER', 'INTERN', 'SECRETARY', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE case_status AS ENUM ('ACTIVE', 'CONCLUDED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_severity AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ─── 2. TABELAS DE BANCO DE DADOS ────────────────────────────────────────────

-- Tabela: USERS
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CLIENT',
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Tabela: LAWYER_PROFILES
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
  ai_token_balance INT NOT NULL DEFAULT 0,
  client_limit INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: CASES
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

-- Tabela: CONTRACTS
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id TEXT REFERENCES cases(id) ON DELETE SET NULL,
  client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | pending_signature | signed | cancelled
  signed_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  contract_id TEXT REFERENCES contracts(id) ON DELETE SET NULL,
  client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | overdue | cancelled
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  pix_code TEXT,
  barcode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: DOCUMENTS
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

-- Tabela: STAFF_AUDIT_LOGS
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
  severity TEXT NOT NULL DEFAULT 'INFO'
);

-- Tabela: PRIVACY_CONSENTS (LGPD Compliance)
CREATE TABLE IF NOT EXISTS privacy_consents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  policy_version TEXT NOT NULL DEFAULT '1.0',
  UNIQUE(user_id, policy_version)
);

-- ─── 3. ÍNDICES DE PERFORMANCE ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_cases_client ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_contracts_case ON contracts(case_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_lawyer ON invoices(lawyer_id);

-- ─── 4. ROW LEVEL SECURITY (RLS) & POLÍTICAS DE SEGURANÇA ───────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

-- Limpa políticas anteriores se existirem
DROP POLICY IF EXISTS "users_all_authenticated" ON users;
DROP POLICY IF EXISTS "lawyer_profiles_public_read" ON lawyer_profiles;
DROP POLICY IF EXISTS "cases_access_policy" ON cases;
DROP POLICY IF EXISTS "contracts_access_policy" ON contracts;
DROP POLICY IF EXISTS "invoices_access_policy" ON invoices;
DROP POLICY IF EXISTS "documents_access_policy" ON documents;
DROP POLICY IF EXISTS "audit_logs_read" ON staff_audit_logs;
DROP POLICY IF EXISTS "privacy_consents_policy" ON privacy_consents;

-- Políticas de Acesso
CREATE POLICY "users_all_authenticated" ON users
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "lawyer_profiles_public_read" ON lawyer_profiles
  FOR ALL USING (true);

CREATE POLICY "cases_access_policy" ON cases
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "contracts_access_policy" ON contracts
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "invoices_access_policy" ON invoices
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "documents_access_policy" ON documents
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "audit_logs_read" ON staff_audit_logs
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "privacy_consents_policy" ON privacy_consents
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- ─── 5. DADOS DE SEED INICIAIS ────────────────────────────────────────────────

INSERT INTO users (id, email, password_hash, role, name, active)
VALUES (
  'super_admin_id',
  'legisconnectonline@gmail.com',
  '@@Rk08266570#',
  'SUPER_ADMIN',
  'Super Admin Legis Connect',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Mensagem de confirmação
SELECT 'Sucesso: Banco de dados Legis Connect, tabelas, RLS e dados iniciais ativados!' as resultado;
