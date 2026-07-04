/**
 * Financeiro — Financeiro 1—N FContas (lançamentos), conforme diagrama.
 * Inclui resumo agregado (fluxo de caixa dos últimos 6 meses) via SQL real.
 */
import { Router } from 'express';
import { q } from '../db';
import { exigirLogin } from '../auth';

export const rotasFinanceiro = Router();

/** A pessoa pode ver o financeiro do processo? (advogado dono, cliente ou admin) */
async function podeVerProcesso(pessoaId: number, tipo: string, processoId: number): Promise<boolean> {
  if (tipo === 'admin') return true;
  const r = await q(
    'SELECT 1 FROM processo WHERE id = $1 AND (advogado_id = $2 OR cliente_id = $2)',
    [processoId, pessoaId]
  );
  return r.rowCount! > 0;
}

// POST /api/processos/:id/financeiro — abre o registro financeiro do processo.
rotasFinanceiro.post('/processos/:id/financeiro', exigirLogin, async (req, res) => {
  const processoId = Number(req.params.id);
  if (!(await podeVerProcesso(req.pessoa!.id, req.pessoa!.tipo, processoId))) {
    return res.status(403).json({ erro: 'Sem acesso a este processo.' });
  }
  const { data_inicio, data_fim } = req.body ?? {};
  const r = await q(
    `INSERT INTO financeiro (processo_id, pessoa_id, data_inicio, data_fim)
     VALUES ($1, $2, $3, $4)
     RETURNING id, processo_id, pessoa_id, data_inicio, data_fim, data_pago`,
    [processoId, req.pessoa!.id, data_inicio ?? null, data_fim ?? null]
  );
  res.status(201).json(r.rows[0]);
});

// GET /api/processos/:id/financeiro — registros + lançamentos do processo.
rotasFinanceiro.get('/processos/:id/financeiro', exigirLogin, async (req, res) => {
  const processoId = Number(req.params.id);
  if (!(await podeVerProcesso(req.pessoa!.id, req.pessoa!.tipo, processoId))) {
    return res.status(403).json({ erro: 'Sem acesso a este processo.' });
  }
  const financeiros = await q(
    'SELECT id, processo_id, pessoa_id, data_inicio, data_fim, data_pago FROM financeiro WHERE processo_id = $1',
    [processoId]
  );
  const fcontas = await q(
    `SELECT f.id, f.financeiro_id, f.descricao, f.valor::float8 AS valor, f.data, f.status,
            f.pessoa_responsavel_id, p.nome AS responsavel_nome
       FROM fconta f
       LEFT JOIN pessoa p ON p.id = f.pessoa_responsavel_id
      WHERE f.financeiro_id = ANY($1::int[])
      ORDER BY f.data DESC`,
    [financeiros.rows.map(x => x.id)]
  );
  res.json({ financeiros: financeiros.rows, fcontas: fcontas.rows });
});

// POST /api/financeiro/:id/fcontas — novo lançamento.
rotasFinanceiro.post('/financeiro/:id/fcontas', exigirLogin, async (req, res) => {
  const { descricao, valor, data, status } = req.body ?? {};
  if (!descricao || valor === undefined) return res.status(400).json({ erro: 'Informe descrição e valor.' });

  const dono = await q<{ processo_id: number | null }>('SELECT processo_id FROM financeiro WHERE id = $1', [req.params.id]);
  if (!dono.rows[0]) return res.status(404).json({ erro: 'Registro financeiro não encontrado.' });
  if (dono.rows[0].processo_id !== null &&
      !(await podeVerProcesso(req.pessoa!.id, req.pessoa!.tipo, dono.rows[0].processo_id))) {
    return res.status(403).json({ erro: 'Sem acesso a este financeiro.' });
  }

  const r = await q(
    `INSERT INTO fconta (financeiro_id, descricao, valor, data, pessoa_responsavel_id, status)
     VALUES ($1, $2, $3, COALESCE($4, current_date), $5, COALESCE($6, 'pendente'))
     RETURNING id, financeiro_id, descricao, valor::float8 AS valor, data, status, pessoa_responsavel_id`,
    [req.params.id, descricao, valor, data ?? null, req.pessoa!.id, status ?? null]
  );
  res.status(201).json(r.rows[0]);
});

// PUT /api/fcontas/:id — atualiza status/valor/descrição do lançamento.
rotasFinanceiro.put('/fcontas/:id', exigirLogin, async (req, res) => {
  const { descricao, valor, status, data } = req.body ?? {};
  const r = await q(
    `UPDATE fconta f SET
       descricao = COALESCE($2, f.descricao),
       valor     = COALESCE($3, f.valor),
       status    = COALESCE($4, f.status),
       data      = COALESCE($5, f.data)
     FROM financeiro fin
     LEFT JOIN processo pr ON pr.id = fin.processo_id
     WHERE f.id = $1 AND fin.id = f.financeiro_id
       AND ($6 = 'admin' OR pr.advogado_id = $7 OR fin.pessoa_id = $7)
     RETURNING f.id, f.descricao, f.valor::float8 AS valor, f.status, f.data`,
    [req.params.id, descricao ?? null, valor ?? null, status ?? null, data ?? null, req.pessoa!.tipo, req.pessoa!.id]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Lançamento não encontrado ou sem permissão.' });
  res.json(r.rows[0]);
});

// GET /api/financeiro/resumo — agregados da pessoa logada (fluxo 6 meses).
rotasFinanceiro.get('/financeiro/resumo', exigirLogin, async (req, res) => {
  const pessoaId = req.pessoa!.id;

  const totais = await q<{ recebido: number; pendente: number; atrasado: number }>(
    `SELECT
       COALESCE(SUM(f.valor) FILTER (WHERE f.status = 'recebido'), 0)::float8 AS recebido,
       COALESCE(SUM(f.valor) FILTER (WHERE f.status = 'pendente'), 0)::float8 AS pendente,
       COALESCE(SUM(f.valor) FILTER (WHERE f.status = 'atrasado'), 0)::float8 AS atrasado
     FROM fconta f
     JOIN financeiro fin ON fin.id = f.financeiro_id
     LEFT JOIN processo pr ON pr.id = fin.processo_id
     WHERE fin.pessoa_id = $1 OR pr.advogado_id = $1 OR pr.cliente_id = $1`,
    [pessoaId]
  );

  const porMes = await q(
    `SELECT to_char(date_trunc('month', f.data), 'YYYY-MM') AS mes,
            COALESCE(SUM(f.valor) FILTER (WHERE f.status = 'recebido'), 0)::float8 AS recebido,
            COALESCE(SUM(f.valor) FILTER (WHERE f.status <> 'recebido'), 0)::float8 AS aberto
       FROM fconta f
       JOIN financeiro fin ON fin.id = f.financeiro_id
       LEFT JOIN processo pr ON pr.id = fin.processo_id
      WHERE (fin.pessoa_id = $1 OR pr.advogado_id = $1 OR pr.cliente_id = $1)
        AND f.data >= date_trunc('month', current_date) - interval '5 months'
      GROUP BY 1 ORDER BY 1`,
    [pessoaId]
  );

  res.json({ ...totais.rows[0], por_mes: porMes.rows });
});
