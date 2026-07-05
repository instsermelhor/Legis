/**
 * Processos — escopo MULTI-TENANT:
 *   advogado/bacharel/secretário → processos do SEU tenant (escritório);
 *   cliente → processos onde é parte; admin → todos.
 */
import { Router } from 'express';
import { q } from '../db';
import { exigirLogin, type Pessoa } from '../auth';

export const rotasProcessos = Router();

const SELECT_PROCESSO = `
  SELECT pr.id, pr.tenant_id, pr.numero, pr.nome, pr.status, pr.valor_causa::float8 AS valor_causa, pr.data_entrada, pr.data_conclusao,
         pr.tipo_processo_id, tp.nome AS tipo_processo,
         pr.advogado_id, adv.nome AS advogado_nome,
         pr.cliente_id,  cli.nome AS cliente_nome
    FROM processo pr
    LEFT JOIN tipo_processo tp ON tp.id = pr.tipo_processo_id
    JOIN pessoa adv ON adv.id = pr.advogado_id
    LEFT JOIN pessoa cli ON cli.id = pr.cliente_id`;

/** Cláusula WHERE de isolamento por tenant/papel. */
export function escopoProcesso(pessoa: Pessoa): { sql: string; params: unknown[] } {
  if (pessoa.tipo === 'admin') return { sql: 'TRUE', params: [] };
  if (pessoa.tipo === 'cliente') return { sql: 'pr.cliente_id = $1', params: [pessoa.id] };
  // advogado, bacharel e secretário compartilham o escritório (tenant)
  return { sql: 'pr.tenant_id = $1', params: [pessoa.tenant_id] };
}

// GET /api/tipos-processo
rotasProcessos.get('/tipos-processo', async (_req, res) => {
  const r = await q('SELECT id, nome FROM tipo_processo ORDER BY nome');
  res.json(r.rows);
});

// GET /api/processos?status=
rotasProcessos.get('/processos', exigirLogin, async (req, res) => {
  const escopo = escopoProcesso(req.pessoa!);
  const params = [...escopo.params];
  let filtroStatus = 'TRUE';
  if (req.query.status) { params.push(req.query.status); filtroStatus = `pr.status = $${params.length}`; }

  const r = await q(
    `${SELECT_PROCESSO} WHERE ${escopo.sql} AND ${filtroStatus} ORDER BY pr.data_entrada DESC`,
    params
  );
  res.json(r.rows);
});

// GET /api/processos/:id
rotasProcessos.get('/processos/:id', exigirLogin, async (req, res) => {
  const escopo = escopoProcesso(req.pessoa!);
  const r = await q(
    `${SELECT_PROCESSO} WHERE pr.id = $${escopo.params.length + 1} AND ${escopo.sql}`,
    [...escopo.params, req.params.id]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Processo não encontrado.' });
  res.json(r.rows[0]);
});

// POST /api/processos — advogado (no seu tenant) ou admin (indicando advogado).
rotasProcessos.post('/processos', exigirLogin, async (req, res) => {
  const { numero, nome, tipo_processo_id, cliente_id, advogado_id, valor_causa } = req.body ?? {};
  if (!numero || !nome) return res.status(400).json({ erro: 'Informe número e nome do processo.' });
  if (req.pessoa!.tipo !== 'advogado' && req.pessoa!.tipo !== 'admin') {
    return res.status(403).json({ erro: 'Apenas advogados criam processos.' });
  }

  // O processo nasce no tenant do advogado responsável.
  let donoId = req.pessoa!.id;
  let tenantId = req.pessoa!.tenant_id;
  if (req.pessoa!.tipo === 'admin') {
    if (!advogado_id) return res.status(400).json({ erro: 'Admin deve indicar o advogado responsável.' });
    const dono = await q<{ id: number; tenant_id: number }>(
      `SELECT id, tenant_id FROM pessoa WHERE id = $1 AND tipo = 'advogado'`, [advogado_id]
    );
    if (!dono.rows[0]) return res.status(400).json({ erro: 'Advogado não encontrado.' });
    donoId = dono.rows[0].id;
    tenantId = dono.rows[0].tenant_id;
  }

  const duplicado = await q('SELECT 1 FROM processo WHERE numero = $1', [numero]);
  if (duplicado.rowCount) return res.status(409).json({ erro: 'Já existe um processo com este número.' });

  const r = await q(
    `INSERT INTO processo (tenant_id, numero, nome, tipo_processo_id, advogado_id, cliente_id, valor_causa)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 0)) RETURNING id`,
    [tenantId, numero, nome, tipo_processo_id ?? null, donoId, cliente_id ?? null, valor_causa ?? null]
  );
  const criado = await q(`${SELECT_PROCESSO} WHERE pr.id = $1`, [r.rows[0].id]);
  res.status(201).json(criado.rows[0]);
});

// PUT /api/processos/:id — advogado do MESMO tenant (gestão do escritório) ou admin.
rotasProcessos.put('/processos/:id', exigirLogin, async (req, res) => {
  const atual = await q<{ tenant_id: number }>('SELECT tenant_id FROM processo WHERE id = $1', [req.params.id]);
  if (!atual.rows[0]) return res.status(404).json({ erro: 'Processo não encontrado.' });

  const podeEditar = req.pessoa!.tipo === 'admin' ||
    (req.pessoa!.tipo === 'advogado' && atual.rows[0].tenant_id === req.pessoa!.tenant_id);
  if (!podeEditar) {
    return res.status(403).json({ erro: 'Somente advogados do escritório alteram este processo.' });
  }

  const { nome, status, tipo_processo_id, cliente_id, data_conclusao, valor_causa, advogado_id } = req.body ?? {};

  // Subestabelecimento: trocar o advogado responsável move o processo para
  // o tenant (escritório) do novo advogado.
  if (advogado_id) {
    const novo = await q<{ tenant_id: number }>(
      `SELECT tenant_id FROM pessoa WHERE id = $1 AND tipo = 'advogado'`, [advogado_id]
    );
    if (!novo.rows[0]) return res.status(400).json({ erro: 'Advogado de destino não encontrado.' });
    await q('UPDATE processo SET advogado_id = $2, tenant_id = $3 WHERE id = $1',
      [req.params.id, advogado_id, novo.rows[0].tenant_id]);
  }

  await q(
    `UPDATE processo SET
       nome             = COALESCE($2, nome),
       status           = COALESCE($3, status),
       tipo_processo_id = COALESCE($4, tipo_processo_id),
       cliente_id       = COALESCE($5, cliente_id),
       data_conclusao   = COALESCE($6, data_conclusao),
       valor_causa      = COALESCE($7, valor_causa)
     WHERE id = $1`,
    [req.params.id, nome ?? null, status ?? null, tipo_processo_id ?? null, cliente_id ?? null, data_conclusao ?? null, valor_causa ?? null]
  );
  const r = await q(`${SELECT_PROCESSO} WHERE pr.id = $1`, [req.params.id]);
  res.json(r.rows[0]);
});

// DELETE /api/processos/:id — advogado do tenant ou admin.
rotasProcessos.delete('/processos/:id', exigirLogin, async (req, res) => {
  const r = await q(
    `DELETE FROM processo
      WHERE id = $1 AND ($2 = 'admin' OR (tenant_id = $3 AND $4 = 'advogado'))
      RETURNING id`,
    [req.params.id, req.pessoa!.tipo, req.pessoa!.tenant_id, req.pessoa!.tipo]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Processo não encontrado ou sem permissão.' });
  res.json({ ok: true });
});
