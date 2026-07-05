-- ═══════════════════════════════════════════════════════════════════════
-- LEGIS CONNECT — Esquema PostgreSQL
-- Entidades conforme os diagramas de arquitetura (whiteboards 2026-07-02):
-- Pessoa (cliente/advogado/bacharel/secretário/admin), Processo, Financeiro,
-- FContas, Tipos, Documento, Contrato, Serviço, Chat, Mensagem, Calendário.
-- ═══════════════════════════════════════════════════════════════════════

-- ── Tenant: o escritório. TODA linha de domínio pertence a um tenant. ───
-- Tenant 1 = "Plataforma" (admin e clientes avulsos). Cada advogado que se
-- cadastra ganha um tenant próprio; bacharel/secretário entram no tenant do
-- advogado ao qual se vinculam. Isolamento garantido nas consultas (WHERE
-- tenant_id = ...) em todas as rotas.
CREATE TABLE IF NOT EXISTS tenant (
  id        serial PRIMARY KEY,
  nome      text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- ── Pessoa: entidade central. Subtipos em tabelas próprias (1:1). ────────
CREATE TABLE IF NOT EXISTS pessoa (
  id          serial PRIMARY KEY,
  tenant_id   int NOT NULL REFERENCES tenant(id),
  tipo        text NOT NULL CHECK (tipo IN ('cliente','advogado','bacharel','secretario','admin')),
  nome        text NOT NULL,
  email       text NOT NULL UNIQUE,
  senha_hash  text NOT NULL,
  telefone    text,
  cidade      text,
  estado      text,
  ativo       boolean NOT NULL DEFAULT true,
  criado_em   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS advogado (
  pessoa_id      int PRIMARY KEY REFERENCES pessoa(id) ON DELETE CASCADE,
  oab            text NOT NULL,
  especialidades text[] NOT NULL DEFAULT '{}',
  bio            text,
  foto_url       text,
  status         text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','verificado','rejeitado'))
);

CREATE TABLE IF NOT EXISTS bacharel (
  pessoa_id     int PRIMARY KEY REFERENCES pessoa(id) ON DELETE CASCADE,
  universidade  text,
  semestre      text,
  interesse     text,
  supervisor_id int REFERENCES pessoa(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS secretario (
  pessoa_id        int PRIMARY KEY REFERENCES pessoa(id) ON DELETE CASCADE,
  experiencia_anos int NOT NULL DEFAULT 0,
  disponibilidade  text,
  advogado_id      int REFERENCES pessoa(id) ON DELETE SET NULL
);

-- ── Catálogo de serviços e contratos (Advogado N—Contrato—N Pessoa) ─────
CREATE TABLE IF NOT EXISTS servico (
  id         serial PRIMARY KEY,
  nome       text NOT NULL UNIQUE,
  descricao  text,
  grupo      text,
  preco      numeric(12,2) NOT NULL,
  prazo_dias int
);

CREATE TABLE IF NOT EXISTS contrato (
  id          serial PRIMARY KEY,
  tenant_id   int NOT NULL REFERENCES tenant(id),
  -- NULL = serviço contratado diretamente da plataforma (sem advogado).
  advogado_id int REFERENCES pessoa(id),
  cliente_id  int NOT NULL REFERENCES pessoa(id),
  servico_id  int REFERENCES servico(id),
  status      text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','concluido','cancelado')),
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- ── Processos ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tipo_processo (
  id   serial PRIMARY KEY,
  nome text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS processo (
  id               serial PRIMARY KEY,
  tenant_id        int NOT NULL REFERENCES tenant(id),
  numero           text NOT NULL UNIQUE,
  nome             text NOT NULL,
  tipo_processo_id int REFERENCES tipo_processo(id),
  advogado_id      int NOT NULL REFERENCES pessoa(id),
  cliente_id       int REFERENCES pessoa(id),
  status           text NOT NULL DEFAULT 'Em Andamento'
                   CHECK (status IN ('Em Andamento','Concluído','Aguardando Documentação','Arquivado')),
  valor_causa      numeric(14,2) NOT NULL DEFAULT 0,
  data_entrada     date NOT NULL DEFAULT current_date,
  data_conclusao   date
);

-- ── Financeiro (Financeiro 1—N FContas, conforme diagrama) ──────────────
CREATE TABLE IF NOT EXISTS financeiro (
  id          serial PRIMARY KEY,
  tenant_id   int NOT NULL REFERENCES tenant(id),
  processo_id int REFERENCES processo(id) ON DELETE CASCADE,
  pessoa_id   int NOT NULL REFERENCES pessoa(id),
  data_inicio date,
  data_fim    date,
  data_pago   date
);

CREATE TABLE IF NOT EXISTS fconta (
  id                    serial PRIMARY KEY,
  financeiro_id         int NOT NULL REFERENCES financeiro(id) ON DELETE CASCADE,
  descricao             text NOT NULL,
  valor                 numeric(12,2) NOT NULL,
  data                  date NOT NULL DEFAULT current_date,
  pessoa_responsavel_id int REFERENCES pessoa(id),
  status                text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','recebido','atrasado'))
);

-- ── Documentos (Tipos com campos p/ auto-preenchimento via IA) ──────────
CREATE TABLE IF NOT EXISTS documento_tipo (
  id     serial PRIMARY KEY,
  nome   text NOT NULL UNIQUE,
  campos text[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS documento (
  id          serial PRIMARY KEY,
  tenant_id   int NOT NULL REFERENCES tenant(id),
  nome        text NOT NULL,
  descricao   text,
  tipo_id     int REFERENCES documento_tipo(id),
  -- Campos extraídos do documento. O preenchimento automático (classificação
  -- via IA) é responsabilidade de outro fluxo; aqui apenas persistimos.
  campos      jsonb NOT NULL DEFAULT '{}',
  url         text,
  data        date NOT NULL DEFAULT current_date,
  pessoa_id   int REFERENCES pessoa(id) ON DELETE SET NULL,
  processo_id int REFERENCES processo(id) ON DELETE CASCADE
);

-- ── Chat (P1 ↔ P2; Mensagem FK pessoa + FK chat) ────────────────────────
CREATE TABLE IF NOT EXISTS chat (
  id         serial PRIMARY KEY,
  tenant_id  int NOT NULL REFERENCES tenant(id),
  pessoa1_id int NOT NULL REFERENCES pessoa(id) ON DELETE CASCADE,
  pessoa2_id int NOT NULL REFERENCES pessoa(id) ON DELETE CASCADE,
  criado_em  timestamptz NOT NULL DEFAULT now(),
  CHECK (pessoa1_id < pessoa2_id),
  UNIQUE (pessoa1_id, pessoa2_id)
);

CREATE TABLE IF NOT EXISTS mensagem (
  id        serial PRIMARY KEY,
  chat_id   int NOT NULL REFERENCES chat(id) ON DELETE CASCADE,
  pessoa_id int NOT NULL REFERENCES pessoa(id) ON DELETE CASCADE,
  texto     text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- ── Calendário (1 Calendário — N eventos; evento pode referir Processo) ─
CREATE TABLE IF NOT EXISTS evento_agenda (
  id          serial PRIMARY KEY,
  tenant_id   int NOT NULL REFERENCES tenant(id),
  titulo      text NOT NULL,
  inicio      timestamptz NOT NULL,
  fim         timestamptz,
  tipo        text NOT NULL DEFAULT 'reuniao' CHECK (tipo IN ('audiencia','consulta','reuniao','prazo')),
  local       text,
  processo_id int REFERENCES processo(id) ON DELETE CASCADE,
  pessoa_id   int NOT NULL REFERENCES pessoa(id) ON DELETE CASCADE
);

-- ── Sessões de autenticação ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessao (
  token     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id int NOT NULL REFERENCES pessoa(id) ON DELETE CASCADE,
  criado_em timestamptz NOT NULL DEFAULT now(),
  expira_em timestamptz NOT NULL DEFAULT now() + interval '7 days'
);

-- ── Leads públicos (contato de visitantes interessados em serviços) ─────
CREATE TABLE IF NOT EXISTS lead (
  id         serial PRIMARY KEY,
  nome       text NOT NULL,
  email      text NOT NULL,
  telefone   text,
  servico_id int REFERENCES servico(id),
  criado_em  timestamptz NOT NULL DEFAULT now()
);

-- ── Dados por usuário (widgets pessoais: notas, cronômetros, prefs) ─────
CREATE TABLE IF NOT EXISTS dado_usuario (
  pessoa_id int NOT NULL REFERENCES pessoa(id) ON DELETE CASCADE,
  chave     text NOT NULL,
  valor     jsonb NOT NULL,
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (pessoa_id, chave)
);

-- ── Recuperação de senha (código de uso único com validade) ─────────────
CREATE TABLE IF NOT EXISTS recuperacao_senha (
  id        serial PRIMARY KEY,
  pessoa_id int NOT NULL REFERENCES pessoa(id) ON DELETE CASCADE,
  codigo    text NOT NULL,
  usado     boolean NOT NULL DEFAULT false,
  expira_em timestamptz NOT NULL DEFAULT now() + interval '30 minutes'
);

-- ── Índices de acesso frequente ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_processo_advogado ON processo(advogado_id);
CREATE INDEX IF NOT EXISTS idx_processo_cliente  ON processo(cliente_id);
CREATE INDEX IF NOT EXISTS idx_fconta_financeiro ON fconta(financeiro_id);
CREATE INDEX IF NOT EXISTS idx_mensagem_chat     ON mensagem(chat_id);
CREATE INDEX IF NOT EXISTS idx_documento_processo ON documento(processo_id);
CREATE INDEX IF NOT EXISTS idx_evento_pessoa     ON evento_agenda(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_pessoa_tenant     ON pessoa(tenant_id);
CREATE INDEX IF NOT EXISTS idx_processo_tenant   ON processo(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documento_tenant  ON documento(tenant_id);
CREATE INDEX IF NOT EXISTS idx_evento_tenant     ON evento_agenda(tenant_id);
