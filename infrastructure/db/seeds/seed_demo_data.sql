-- =============================================================================
-- LEGIS CONNECT — SEED: Demo Data
-- Popula o banco com dados de demonstração para testes e homologação.
--
-- ATENÇÃO: Execute apenas em bancos de desenvolvimento/staging.
--          NUNCA em produção com dados reais.
--
-- Aplicar via: Supabase Dashboard > SQL Editor > Run
-- Ou: psql $DATABASE_URL -f infrastructure/db/seeds/seed_demo_data.sql
-- =============================================================================

-- ─── Limpar dados existentes (ordem inversa de FK) ────────────────────────────
TRUNCATE public.impersonation_sessions CASCADE;
TRUNCATE public.staff_audit_logs CASCADE;
TRUNCATE public.case_stages CASCADE;
TRUNCATE public.service_provisionings CASCADE;
TRUNCATE public.cases CASCADE;
TRUNCATE public.secretary_profiles CASCADE;
TRUNCATE public.intern_profiles CASCADE;
TRUNCATE public.lawyer_profiles CASCADE;
TRUNCATE public.platform_staff CASCADE;
TRUNCATE public.users CASCADE;

-- ─── UUIDs fixos para facilitar testes ───────────────────────────────────────
-- Estes UUIDs são determinísticos para fins de seed/testes.
-- Em produção os UUIDs são gerados automaticamente pelo banco.

-- ─── Usuários Externos ────────────────────────────────────────────────────────

-- Clientes
INSERT INTO public.users (id, email, password_hash, role, name, phone, active) VALUES
  ('00000000-0000-0000-0001-000000000001', 'cliente@demo.legis', '$demo$cliente', 'CLIENT', 'Maria Oliveira', '+55 11 99999-0001', true),
  ('00000000-0000-0000-0001-000000000002', 'cliente2@demo.legis', '$demo$cliente2', 'CLIENT', 'João Santos', '+55 21 98888-0002', true);

-- Advogados
INSERT INTO public.users (id, email, password_hash, role, name, phone, active) VALUES
  ('00000000-0000-0000-0002-000000000001', 'advogado@demo.legis', '$demo$advogado', 'LAWYER', 'Dr. Carlos Andrade', '+55 11 99999-1111', true),
  ('00000000-0000-0000-0002-000000000002', 'advogada@demo.legis', '$demo$advogada', 'LAWYER', 'Dra. Ana Ferreira', '+55 21 99999-2222', true);

-- Estagiários
INSERT INTO public.users (id, email, password_hash, role, name, active) VALUES
  ('00000000-0000-0000-0003-000000000001', 'estagiario@demo.legis', '$demo$estagiario', 'INTERN', 'Lucas Ribeiro', true);

-- Secretárias
INSERT INTO public.users (id, email, password_hash, role, name, active) VALUES
  ('00000000-0000-0000-0004-000000000001', 'secretaria@demo.legis', '$demo$secretaria', 'SECRETARY', 'Fernanda Lima', true);

-- ─── Perfis de Advogados ──────────────────────────────────────────────────────
INSERT INTO public.lawyer_profiles
  (user_id, oab, oab_uf, bio, specialties, location_city, location_state, location_lat, location_lng, rating, review_count, consultation_fee, verified)
VALUES
  (
    '00000000-0000-0000-0002-000000000001',
    'SP123456', 'SP',
    'Advogado com mais de 15 anos de experiência em Direito de Família e Civil.',
    ARRAY['Direito de Família e Sucessões', 'Direito Civil'],
    'São Paulo', 'SP', -23.550520, -46.633308,
    4.9, 125, 450.00, true
  ),
  (
    '00000000-0000-0000-0002-000000000002',
    'RJ987654', 'RJ',
    'Especialista em Direito Trabalhista com sólida experiência em negociações sindicais.',
    ARRAY['Direito Trabalhista', 'Direito Previdenciário'],
    'Rio de Janeiro', 'RJ', -22.906847, -43.172897,
    4.7, 89, 380.00, true
  );

-- ─── Perfil de Estagiário ─────────────────────────────────────────────────────
INSERT INTO public.intern_profiles (user_id, university, semester, active) VALUES
  ('00000000-0000-0000-0003-000000000001', 'USP — Faculdade de Direito', 8, true);

-- ─── Perfil de Secretária ─────────────────────────────────────────────────────
INSERT INTO public.secretary_profiles (user_id, assigned_lawyer_id, active) VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0002-000000000001', true);

-- ─── Processos (Cases) ────────────────────────────────────────────────────────
INSERT INTO public.cases (id, case_number, title, status, client_id, lawyer_id, description, opened_at) VALUES
  (
    '00000000-0000-0000-0010-000000000001',
    '0001234-56.2024.8.26.0100',
    'Ação de Divórcio Litigioso',
    'ACTIVE',
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0002-000000000001',
    'Processo de divórcio com disputa de guarda e partilha de bens.',
    NOW() - INTERVAL '45 days'
  ),
  (
    '00000000-0000-0000-0010-000000000002',
    '0009876-54.2024.8.26.0100',
    'Reclamação Trabalhista',
    'ACTIVE',
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0002-000000000002',
    'Reclamação por horas extras e verbas rescisórias não pagas.',
    NOW() - INTERVAL '20 days'
  );

-- ─── Etapas dos Processos ─────────────────────────────────────────────────────
INSERT INTO public.case_stages (case_id, name, description, completed, completed_at, "order") VALUES
  ('00000000-0000-0000-0010-000000000001', 'Petição Inicial', 'Elaboração e protocolo da petição inicial.', true, NOW() - INTERVAL '40 days', 1),
  ('00000000-0000-0000-0010-000000000001', 'Citação do Réu', 'Citação e prazo para resposta.', true, NOW() - INTERVAL '25 days', 2),
  ('00000000-0000-0000-0010-000000000001', 'Audiência de Conciliação', 'Tentativa de acordo entre as partes.', false, NULL, 3),
  ('00000000-0000-0000-0010-000000000001', 'Sentença', 'Prolação da sentença judicial.', false, NULL, 4);

-- ─── Platform Staff (Administradores Internos) ────────────────────────────────
-- NOTA: Senhas reais devem ser definidas via painel administrativo após o seed.
--       Os hashes abaixo são placeholders que forçam troca de senha no primeiro login.
INSERT INTO public.platform_staff (id, email, password_hash, role, name, must_change_password, active) VALUES
  (
    '00000000-0000-0000-0099-000000000001',
    'admin@legisconnect.com.br',
    '$placeholder$force_change_on_first_login',
    'ADMIN',
    'Administrador Demo',
    true,
    true
  ),
  (
    '00000000-0000-0000-0099-000000000002',
    'legisconnectonline@gmail.com',
    '$placeholder$force_change_on_first_login',
    'SUPER_ADMIN',
    'Super Admin',
    true,
    true
  );

-- ─── Log de Auditoria Inicial ─────────────────────────────────────────────────
INSERT INTO public.staff_audit_logs (action, actor_id, actor_role, details, severity) VALUES
  ('SEED_EXECUTED', 'system', 'SUPER_ADMIN', 'Seed de dados de demonstração aplicado com sucesso.', 'INFO');

-- =============================================================================
-- SEED CONCLUÍDO
-- Usuários criados para testes:
--   Cliente:    cliente@demo.legis
--   Advogado:   advogado@demo.legis
--   Estagiário: estagiario@demo.legis
--   Secretária: secretaria@demo.legis
--   Admin:      admin@legisconnect.com.br (deve alterar senha no 1º login)
--   Super Admin: legisconnectonline@gmail.com (deve alterar senha no 1º login)
-- =============================================================================
