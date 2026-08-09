-- ============================================================================
-- Legis Connect Platform — Sprint 11 Beta Tables Migration
-- Target: PostgreSQL 15+ / Supabase
-- Execução: após sprint8_master_migration.sql
-- ============================================================================

-- ─── Tabela: beta_users ────────────────────────────────────────────────────────
-- Registro de advogados parceiros convidados para o beta fechado.

CREATE TABLE IF NOT EXISTS beta_users (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT        NOT NULL UNIQUE,
  oab_number      TEXT,                                 -- Número OAB para validação
  name            TEXT,
  phone           TEXT,
  specialty       TEXT,                                 -- Área jurídica principal
  invite_token    TEXT        UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  invited_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at    TIMESTAMPTZ,                          -- NULL = ainda não ativou
  last_seen_at    TIMESTAMPTZ,
  status          TEXT        NOT NULL DEFAULT 'invited'  -- invited | active | inactive | removed
                  CHECK (status IN ('invited', 'active', 'inactive', 'removed')),
  notes           TEXT,                                 -- Notas internas do time
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_users_status     ON beta_users(status);
CREATE INDEX IF NOT EXISTS idx_beta_users_email      ON beta_users(email);
CREATE INDEX IF NOT EXISTS idx_beta_users_invite_tok ON beta_users(invite_token);

-- Trigger de updated_at automático
CREATE OR REPLACE FUNCTION update_beta_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_beta_users_updated_at ON beta_users;
CREATE TRIGGER trg_beta_users_updated_at
  BEFORE UPDATE ON beta_users
  FOR EACH ROW EXECUTE FUNCTION update_beta_users_updated_at();

-- ─── Tabela: beta_feedback ─────────────────────────────────────────────────────
-- Feedback coletado via BetaFeedbackButton durante o beta fechado.

CREATE TABLE IF NOT EXISTS beta_feedback (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL,                     -- auth.users.id ou 'anonymous'
  role        TEXT        NOT NULL DEFAULT 'unknown',   -- SystemRole do usuário
  rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category    TEXT        NOT NULL DEFAULT 'suggestion'
              CHECK (category IN ('bug', 'suggestion', 'compliment')),
  message     TEXT        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 1000),
  page        TEXT,                                     -- window.location.pathname
  resolved    BOOLEAN     NOT NULL DEFAULT FALSE,       -- Admin marcou como resolvido
  resolved_by TEXT,                                     -- ID do admin que resolveu
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_feedback_user_id  ON beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_category ON beta_feedback(category);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_rating   ON beta_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_resolved ON beta_feedback(resolved);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_created  ON beta_feedback(created_at DESC);

-- ─── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE beta_users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_feedback  ENABLE ROW LEVEL SECURITY;

-- beta_users: apenas super_admin e admin gerenciam
CREATE POLICY "super_admin_all_beta_users"
  ON beta_users FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_role') IN ('super_admin', 'admin')
  );

-- beta_feedback: usuário lê apenas o próprio; admin lê tudo
CREATE POLICY "owner_read_own_feedback"
  ON beta_feedback FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::TEXT);

CREATE POLICY "admin_all_beta_feedback"
  ON beta_feedback FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_role') IN ('super_admin', 'admin')
  );

CREATE POLICY "authenticated_insert_feedback"
  ON beta_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::TEXT OR user_id = 'anonymous');

-- ─── View: beta_summary ────────────────────────────────────────────────────────
-- Agregação para o SuperAdmin Dashboard — KPIs do beta.

CREATE OR REPLACE VIEW beta_summary AS
SELECT
  COUNT(*)                                              AS total_feedback,
  ROUND(AVG(rating)::NUMERIC, 2)                       AS avg_rating,
  COUNT(*) FILTER (WHERE rating >= 4)                  AS positive_count,
  COUNT(*) FILTER (WHERE category = 'bug')             AS bug_count,
  COUNT(*) FILTER (WHERE category = 'suggestion')      AS suggestion_count,
  COUNT(*) FILTER (WHERE category = 'compliment')      AS compliment_count,
  COUNT(*) FILTER (WHERE resolved = FALSE)             AS unresolved_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS last_7_days
FROM beta_feedback;

-- View de usuários beta ativos
CREATE OR REPLACE VIEW beta_users_summary AS
SELECT
  COUNT(*)                                              AS total_invited,
  COUNT(*) FILTER (WHERE status = 'active')            AS total_active,
  COUNT(*) FILTER (WHERE status = 'invited')           AS pending_activation,
  COUNT(*) FILTER (WHERE last_seen_at >= NOW() - INTERVAL '7 days') AS active_last_7d
FROM beta_users;

-- ============================================================================
-- Sprint 11 Beta Tables — Migration Complete
-- Tabelas criadas: beta_users, beta_feedback
-- Views criadas:   beta_summary, beta_users_summary
-- RLS ativado:     beta_users, beta_feedback
-- ============================================================================
