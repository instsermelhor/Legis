-- =============================================================================
-- LEGIS CONNECT — MIGRATION 001: Initial Schema
-- Aplicar via: Supabase Dashboard > SQL Editor > Run
-- Ou via: psql $DATABASE_URL -f infrastructure/db/migrations/001_initial_schema.sql
--
-- ORDEM DE EXECUÇÃO: Este script deve ser executado ANTES do script de RLS.
-- =============================================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('CLIENT', 'LAWYER', 'INTERN', 'SECRETARY', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE staff_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF_FINANCE_ADMIN', 'STAFF_COMPLIANCE_AUDITOR', 'STAFF_SUPPORT_L1');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE case_status AS ENUM ('ACTIVE', 'CONCLUDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE provisioning_status AS ENUM ('PENDING', 'IN_PROGRESS', 'PROVISIONED', 'PROVISION_FAILED', 'REFUNDED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE audit_severity AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE service_group AS ENUM ('CLIENT', 'LAWYER', 'INTERN', 'SECRETARY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Tabela: users ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL,
  name          TEXT NOT NULL,
  cpf           TEXT UNIQUE,                        -- Criptografado AES-GCM na aplicação
  phone         TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ                          -- Soft delete — LGPD Art. 16
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf   ON public.users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_role  ON public.users(role);

-- ─── Tabela: lawyer_profiles ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lawyer_profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  oab              TEXT NOT NULL,
  oab_uf           TEXT NOT NULL DEFAULT 'SP',
  bio              TEXT,
  specialties      TEXT[] NOT NULL DEFAULT '{}',
  location_city    TEXT,
  location_state   TEXT,
  location_lat     DOUBLE PRECISION,
  location_lng     DOUBLE PRECISION,
  photo_url        TEXT,
  rating           NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count     INTEGER NOT NULL DEFAULT 0,
  consultation_fee NUMERIC(10,2),
  active           BOOLEAN NOT NULL DEFAULT true,
  verified         BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lawyer_profiles_user_id ON public.lawyer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_oab ON public.lawyer_profiles(oab, oab_uf);

-- ─── Tabela: intern_profiles ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.intern_profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  university       TEXT,
  semester         SMALLINT,
  oab_registration TEXT,
  active           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_intern_profiles_user_id ON public.intern_profiles(user_id);

-- ─── Tabela: secretary_profiles ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.secretary_profiles (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_lawyer_id UUID REFERENCES public.users(id),
  active             BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_secretary_profiles_user_id ON public.secretary_profiles(user_id);

-- ─── Tabela: platform_staff ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.platform_staff (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               TEXT NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,
  role                staff_role NOT NULL,
  name                TEXT NOT NULL,
  active              BOOLEAN NOT NULL DEFAULT true,
  mfa_enabled         BOOLEAN NOT NULL DEFAULT false,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  last_login          TIMESTAMPTZ,
  login_count         INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_staff_email ON public.platform_staff(email);
CREATE INDEX IF NOT EXISTS idx_platform_staff_role  ON public.platform_staff(role);

-- ─── Tabela: cases ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cases (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT UNIQUE,
  title       TEXT NOT NULL,
  status      case_status NOT NULL DEFAULT 'ACTIVE',
  client_id   UUID NOT NULL REFERENCES public.users(id),
  lawyer_id   UUID NOT NULL REFERENCES public.users(id),
  description TEXT,
  opened_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cases_client_id ON public.cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON public.cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_status    ON public.cases(status);

-- ─── Tabela: case_stages ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.case_stages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id      UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  completed    BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  "order"      SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_stages_case_id ON public.case_stages(case_id);

-- ─── Tabela: service_provisionings ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_provisionings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.users(id),
  service_name   TEXT NOT NULL,
  service_group  service_group NOT NULL,
  status         provisioning_status NOT NULL DEFAULT 'PENDING',
  amount         NUMERIC(12,2),
  currency       CHAR(3) NOT NULL DEFAULT 'BRL',
  provisioned_at TIMESTAMPTZ,
  expires_at     TIMESTAMPTZ,
  metadata       JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provisionings_user_id ON public.service_provisionings(user_id);
CREATE INDEX IF NOT EXISTS idx_provisionings_status  ON public.service_provisionings(status);

-- ─── Tabela: staff_audit_logs ─────────────────────────────────────────────────
-- APPEND-ONLY: UPDATE e DELETE são bloqueados via RLS.
CREATE TABLE IF NOT EXISTS public.staff_audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action      TEXT NOT NULL,
  actor_id    TEXT NOT NULL,
  actor_role  TEXT NOT NULL,
  target_id   TEXT,
  details     TEXT NOT NULL,
  severity    audit_severity NOT NULL DEFAULT 'INFO',
  ip_address  INET,
  user_agent  TEXT,
  chain_hash  TEXT,    -- HMAC-SHA256 do log anterior para detecção de adulteração
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id  ON public.staff_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity  ON public.staff_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.staff_audit_logs(created_at DESC);

-- ─── Tabela: impersonation_sessions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.impersonation_sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id       UUID NOT NULL REFERENCES public.platform_staff(id),
  target_user_id UUID NOT NULL REFERENCES public.users(id),
  reason         TEXT NOT NULL,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at       TIMESTAMPTZ,
  is_active      BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_impersonation_staff_id  ON public.impersonation_sessions(staff_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_is_active ON public.impersonation_sessions(is_active);

-- ─── Triggers: updated_at automático ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT; BEGIN
  FOR t IN SELECT unnest(ARRAY['users','lawyer_profiles','intern_profiles','secretary_profiles','platform_staff','cases','service_provisionings'])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON public.%I;
       CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();',
      t, t, t, t
    );
  END LOOP;
END $$;

-- =============================================================================
-- PRÓXIMO PASSO: aplicar o script de RLS
-- psql $DATABASE_URL -f infrastructure/db/scripts/apply_production_rls.sql
-- =============================================================================
