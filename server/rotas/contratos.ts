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
  const r = await q('SELECT id, nome, descricao, preco::float8 AS preco, prazo_dias FROM servico ORDER BY preco');
  res.json(r.rows);
});

// POST /api/servicos — admin.
rotasContratos.post('/servicos', exigirLogin, exigirAdmin, async (req, res) => {
  const { nome, descricao, preco, prazo_dias } = req.body ?? {};
  if (!nome || preco === undefined) return res.status(400).json({ erro: 'Informe nome e preço.' });
  const r = await q(
    `INSERT INTO servico (nome, descricao, preco, prazo_dias) VALUES ($1, $2, $3, $4)
     RETURNING id, nome, descricao, preco::float8 AS preco, prazo_dias`,
    [nome, descricao ?? null, preco, prazo_dias ?? null]
  );
  res.status(201).json(r.rows[0]);
});

// PUT /api/servicos/:id — admin.
rotasContratos.put('/servicos/:id', exigirLogin, exigirAdmin, async (req, res) => {
  const { nome, descricao, preco, prazo_dias } = req.body ?? {};
  const r = await q(
    `UPDATE servico SET
       nome       = COALESCE($2, nome),
       descricao  = COALESCE($3, descricao),
       preco      = COALESCE($4, preco),
       prazo_dias = COALESCE($5, prazo_dias)
     WHERE id = $1
     RETURNING id, nome, descricao, preco::float8 AS preco, prazo_dias`,
    [req.params.id, nome ?? null, descricao ?? null, preco ?? null, prazo_dias ?? null]
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

// ── Contratos ─────────────────────────────────────────────────────────────

const SELECT_CONTRATO = `
  SELECT c.id, c.status, c.criado_em,
         c.advogado_id, adv.nome AS advogado_nome,
         c.cliente_id,  cli.nome AS cliente_nome,
         c.servico_id,  s.nome  AS servico_nome, s.preco::float8 AS servico_preco
    FROM contrato c
    JOIN pessoa adv ON adv.id = c.advogado_id
    JOIN pessoa cli ON cli.id = c.cliente_id
    LEFT JOIN servico s ON s.id = c.servico_id`;

// GET /api/contratos — meus contratos (admin vê todos).
rotasContratos.get('/contratos', exigirLogin, async (req, res) => {
  const r = await q(
    `${SELECT_CONTRATO}
      WHERE $1 = 'admin' OR c.advogado_id = $2 OR c.cliente_id = $2
      ORDER BY c.criado_em DESC`,
    [req.pessoa!.tipo, req.pessoa!.id]
  );
  res.json(r.rows);
});

// POST /api/contratos { advogado_id, servico_id? } — cliente contrata.
rotasContratos.post('/contratos', exigirLogin, async (req, res) => {
  const { advogado_id, cliente_id, servico_id } = req.body ?? {};

  // Cliente contrata para si; advogado/admin podem indicar o cliente.
  const clienteFinal = req.pessoa!.tipo === 'cliente' ? req.pessoa!.id : Number(cliente_id);
  const advogadoFinal = req.pessoa!.tipo === 'advogado' ? req.pessoa!.id : Number(advogado_id);
  if (!clienteFinal || !advogadoFinal) return res.status(400).json({ erro: 'Informe advogado e cliente.' });

  const advogadoOk = await q(
    `SELECT 1 FROM advogado WHERE pessoa_id = $1 AND status = 'verificado'`, [advogadoFinal]
  );
  if (!advogadoOk.rowCount) return res.status(400).json({ erro: 'Advogado inexistente ou não verificado.' });

  const r = await q(
    'INSERT INTO contrato (advogado_id, cliente_id, servico_id) VALUES ($1, $2, $3) RETURNING id',
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
