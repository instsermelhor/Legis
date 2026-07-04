/**
 * Processos — escopo por papel:
 *   advogado → seus processos; cliente → seus; bacharel/secretário → do
 *   advogado vinculado; admin → todos.
 */
import { Router } from 'express';
import { q } from '../db';
import { exigirLogin, type Pessoa } from '../auth';

export const rotasProcessos = Router();

const SELECT_PROCESSO = `
  SELECT pr.id, pr.numero, pr.nome, pr.status, pr.data_entrada, pr.data_conclusao,
         pr.tipo_processo_id, tp.nome AS tipo_processo,
         pr.advogado_id, adv.nome AS advogado_nome,
         pr.cliente_id,  cli.nome AS cliente_nome
    FROM processo pr
    LEFT JOIN tipo_processo tp ON tp.id = pr.tipo_processo_id
    JOIN pessoa adv ON adv.id = pr.advogado_id
    LEFT JOIN pessoa cli ON cli.id = pr.cliente_id`;

/** Advogado ao qual a pessoa está vinculada (para bacharel/secretário). */
async function advogadoVinculado(pessoa: Pessoa): Promise<number | null> {
  if (pessoa.tipo === 'bacharel') {
    const r = await q<{ supervisor_id: number | null }>('SELECT supervisor_id FROM bacharel WHERE pessoa_id = $1', [pessoa.id]);
    return r.rows[0]?.supervisor_id ?? null;
  }
  if (pessoa.tipo === 'secretario') {
    const r = await q<{ advogado_id: number | null }>('SELECT advogado_id FROM secretario WHERE pessoa_id = $1', [pessoa.id]);
    return r.rows[0]?.advogado_id ?? null;
  }
  return null;
}

/** Cláusula de escopo (WHERE) conforme o papel da pessoa logada. */
async function escopoDe(pessoa: Pessoa): Promise<{ sql: string; params: unknown[] }> {
  if (pessoa.tipo === 'admin') return { sql: 'TRUE', params: [] };
  if (pessoa.tipo === 'advogado') return { sql: 'pr.advogado_id = $1', params: [pessoa.id] };
  if (pessoa.tipo === 'cliente') return { sql: 'pr.cliente_id = $1', params: [pessoa.id] };
  const advogadoId = await advogadoVinculado(pessoa);
  return { sql: 'pr.advogado_id = $1', params: [advogadoId ?? -1] };
}

// GET /api/tipos-processo
rotasProcessos.get('/tipos-processo', async (_req, res) => {
  const r = await q('SELECT id, nome FROM tipo_processo ORDER BY nome');
  res.json(r.rows);
});

// GET /api/processos?status=
rotasProcessos.get('/processos', exigirLogin, async (req, res) => {
  const escopo = await escopoDe(req.pessoa!);
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
  const escopo = await escopoDe(req.pessoa!);
  const r = await q(
    `${SELECT_PROCESSO} WHERE pr.id = $${escopo.params.length + 1} AND ${escopo.sql}`,
    [...escopo.params, req.params.id]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Processo não encontrado.' });
  res.json(r.rows[0]);
});

// POST /api/processos — advogado (para si) ou admin.
rotasProcessos.post('/processos', exigirLogin, async (req, res) => {
  const { numero, nome, tipo_processo_id, cliente_id, advogado_id } = req.body ?? {};
  if (!numero || !nome) return res.status(400).json({ erro: 'Informe número e nome do processo.' });

  const donoId = req.pessoa!.tipo === 'admin' && advogado_id ? Number(advogado_id) : req.pessoa!.id;
  if (req.pessoa!.tipo !== 'advogado' && req.pessoa!.tipo !== 'admin') {
    return res.status(403).json({ erro: 'Apenas advogados criam processos.' });
  }

  const duplicado = await q('SELECT 1 FROM processo WHERE numero = $1', [numero]);
  if (duplicado.rowCount) return res.status(409).json({ erro: 'Já existe um processo com este número.' });

  const r = await q(
    `INSERT INTO processo (numero, nome, tipo_processo_id, advogado_id, cliente_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [numero, nome, tipo_processo_id ?? null, donoId, cliente_id ?? null]
  );
  const criado = await q(`${SELECT_PROCESSO} WHERE pr.id = $1`, [r.rows[0].id]);
  res.status(201).json(criado.rows[0]);
});

// PUT /api/processos/:id — advogado dono ou admin.
rotasProcessos.put('/processos/:id', exigirLogin, async (req, res) => {
  const atual = await q<{ advogado_id: number }>('SELECT advogado_id FROM processo WHERE id = $1', [req.params.id]);
  if (!atual.rows[0]) return res.status(404).json({ erro: 'Processo não encontrado.' });
  if (req.pessoa!.tipo !== 'admin' && atual.rows[0].advogado_id !== req.pessoa!.id) {
    return res.status(403).json({ erro: 'Somente o advogado responsável altera este processo.' });
  }

  const { nome, status, tipo_processo_id, cliente_id, data_conclusao } = req.body ?? {};
  await q(
    `UPDATE processo SET
       nome             = COALESCE($2, nome),
       status           = COALESCE($3, status),
       tipo_processo_id = COALESCE($4, tipo_processo_id),
       cliente_id       = COALESCE($5, cliente_id),
       data_conclusao   = COALESCE($6, data_conclusao)
     WHERE id = $1`,
    [req.params.id, nome ?? null, status ?? null, tipo_processo_id ?? null, cliente_id ?? null, data_conclusao ?? null]
  );
  const r = await q(`${SELECT_PROCESSO} WHERE pr.id = $1`, [req.params.id]);
  res.json(r.rows[0]);
});
