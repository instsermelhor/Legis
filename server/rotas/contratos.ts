/**
 * Serviços (catálogo) e Contratos (Advogado N—Contrato—N Pessoa, FK Serviço).
 */
import { Router } from 'express';
import { q } from '../db';
import { exigirLogin, exigirAdmin } from '../auth';

export const rotasContratos = Router();

// ── Catálogo de serviços ──────────────────────────────────────────────────

// GET /api/servicos — público.
rotasContratos.get('/servicos', async (_req, res) => {
  const r = await q('SELECT id, nome, descricao, grupo, preco::float8 AS preco, prazo_dias FROM servico ORDER BY grupo NULLS FIRST, nome');
  res.json(r.rows);
});

// POST /api/servicos — admin.
rotasContratos.post('/servicos', exigirLogin, exigirAdmin, async (req, res) => {
  const { nome, descricao, grupo, preco, prazo_dias } = req.body ?? {};
  if (!nome || preco === undefined) return res.status(400).json({ erro: 'Informe nome e preço.' });
  const r = await q(
    `INSERT INTO servico (nome, descricao, grupo, preco, prazo_dias) VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nome, descricao, grupo, preco::float8 AS preco, prazo_dias`,
    [nome, descricao ?? null, grupo ?? null, preco, prazo_dias ?? null]
  );
  res.status(201).json(r.rows[0]);
});

// PUT /api/servicos/:id — admin.
rotasContratos.put('/servicos/:id', exigirLogin, exigirAdmin, async (req, res) => {
  const { nome, descricao, grupo, preco, prazo_dias } = req.body ?? {};
  const r = await q(
    `UPDATE servico SET
       nome       = COALESCE($2, nome),
       descricao  = COALESCE($3, descricao),
       grupo      = COALESCE($4, grupo),
       preco      = COALESCE($5, preco),
       prazo_dias = COALESCE($6, prazo_dias)
     WHERE id = $1
     RETURNING id, nome, descricao, grupo, preco::float8 AS preco, prazo_dias`,
    [req.params.id, nome ?? null, descricao ?? null, grupo ?? null, preco ?? null, prazo_dias ?? null]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Serviço não encontrado.' });
  res.json(r.rows[0]);
});

// DELETE /api/servicos/:id — admin.
rotasContratos.delete('/servicos/:id', exigirLogin, exigirAdmin, async (req, res) => {
  const r = await q('DELETE FROM servico WHERE id = $1 RETURNING id', [req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ erro: 'Serviço não encontrado.' });
  res.json({ ok: true });
});

// POST /api/leads — público: visitante interessado em um serviço.
rotasContratos.post('/leads', async (req, res) => {
  const { nome, email, telefone, servico_id } = req.body ?? {};
  if (!nome || !email) return res.status(400).json({ erro: 'Informe nome e e-mail.' });
  const r = await q(
    `INSERT INTO lead (nome, email, telefone, servico_id) VALUES ($1, $2, $3, $4)
     RETURNING id, nome, email, telefone, servico_id, criado_em`,
    [nome, String(email).toLowerCase(), telefone ?? null, servico_id ?? null]
  );
  res.status(201).json(r.rows[0]);
});

// GET /api/admin/leads — backoffice.
rotasContratos.get('/admin/leads', exigirLogin, exigirAdmin, async (_req, res) => {
  const r = await q(
    `SELECT l.id, l.nome, l.email, l.telefone, l.criado_em, s.nome AS servico_nome
       FROM lead l LEFT JOIN servico s ON s.id = l.servico_id
      ORDER BY l.criado_em DESC`
  );
  res.json(r.rows);
});

// ── Contratos ─────────────────────────────────────────────────────────────

const SELECT_CONTRATO = `
  SELECT c.id, c.status, c.criado_em,
         c.advogado_id, adv.nome AS advogado_nome,
         c.cliente_id,  cli.nome AS cliente_nome,
         c.servico_id,  s.nome  AS servico_nome, s.preco::float8 AS servico_preco
    FROM contrato c
    LEFT JOIN pessoa adv ON adv.id = c.advogado_id
    JOIN pessoa cli ON cli.id = c.cliente_id
    LEFT JOIN servico s ON s.id = c.servico_id`;

// GET /api/contratos — meus contratos (admin vê todos).
rotasContratos.get('/contratos', exigirLogin, async (req, res) => {
  // Multi-tenant: equipe ve contratos do escritorio; cliente ve os seus.
  const p = req.pessoa!;
  const escopo =
    p.tipo === 'admin' ? { sql: 'TRUE', params: [] as unknown[] } :
    p.tipo === 'cliente' ? { sql: 'c.cliente_id = $1', params: [p.id] } :
    { sql: 'c.tenant_id = $1', params: [p.tenant_id] };
  const r = await q(
    `${SELECT_CONTRATO} WHERE ${escopo.sql} ORDER BY c.criado_em DESC`,
    escopo.params
  );
  res.json(r.rows);
});

// POST /api/contratos { advogado_id, servico_id? } — cliente contrata.
rotasContratos.post('/contratos', exigirLogin, async (req, res) => {
  const { advogado_id, cliente_id, servico_id } = req.body ?? {};

  // Cliente contrata para si; advogado/admin podem indicar o cliente.
  // Sem advogado = serviço direto da plataforma (tenant 1).
  const clienteFinal = req.pessoa!.tipo === 'cliente' ? req.pessoa!.id : Number(cliente_id);
  const advogadoFinal = req.pessoa!.tipo === 'advogado'
    ? req.pessoa!.id
    : (advogado_id ? Number(advogado_id) : null);
  if (!clienteFinal) return res.status(400).json({ erro: 'Informe o cliente.' });
  if (!advogadoFinal && !servico_id) return res.status(400).json({ erro: 'Informe advogado ou serviço.' });

  if (advogadoFinal) {
    const advogadoOk = await q(
      `SELECT 1 FROM advogado WHERE pessoa_id = $1 AND status = 'verificado'`, [advogadoFinal]
    );
    if (!advogadoOk.rowCount) return res.status(400).json({ erro: 'Advogado inexistente ou não verificado.' });
  }

  const r = await q(
    `INSERT INTO contrato (tenant_id, advogado_id, cliente_id, servico_id)
     VALUES (COALESCE((SELECT tenant_id FROM pessoa WHERE id = $1), 1), $1, $2, $3)
     RETURNING id`,
    [advogadoFinal, clienteFinal, servico_id ?? null]
  );
  const criado = await q(`${SELECT_CONTRATO} WHERE c.id = $1`, [r.rows[0].id]);
  res.status(201).json(criado.rows[0]);
});

// PUT /api/contratos/:id { status } — partes do contrato ou admin.
rotasContratos.put('/contratos/:id', exigirLogin, async (req, res) => {
  const { status } = req.body ?? {};
  if (!['ativo', 'concluido', 'cancelado'].includes(status)) {
    return res.status(400).json({ erro: 'Status inválido.' });
  }
  const r = await q(
    `UPDATE contrato SET status = $2
     WHERE id = $1 AND ($3 = 'admin' OR advogado_id = $4 OR cliente_id = $4)
     RETURNING id, status`,
    [req.params.id, status, req.pessoa!.tipo, req.pessoa!.id]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Contrato não encontrado ou sem permissão.' });
  res.json(r.rows[0]);
});
