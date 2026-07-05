/**
 * Agenda/Calendário — eventos da pessoa logada; evento pode referir Processo.
 */
import { Router } from 'express';
import { q } from '../db';
import { exigirLogin } from '../auth';

export const rotasAgenda = Router();

// GET /api/agenda?de=YYYY-MM-DD&ate=YYYY-MM-DD&escopo=tenant
// escopo=tenant (equipe): agenda do escritorio inteiro — ex.: secretaria
// acompanhando os compromissos dos advogados do tenant.
rotasAgenda.get('/agenda', exigirLogin, async (req, res) => {
  const { de, ate } = req.query;
  const equipe = ['advogado', 'bacharel', 'secretario'].includes(req.pessoa!.tipo);
  const porTenant = req.query.escopo === 'tenant' && equipe;

  const r = await q(
    `SELECT e.id, e.titulo, e.inicio, e.fim, e.tipo, e.local, e.processo_id,
            pr.numero AS processo_numero, pr.nome AS processo_nome,
            e.pessoa_id, dono.nome AS pessoa_nome
       FROM evento_agenda e
       LEFT JOIN processo pr ON pr.id = e.processo_id
       JOIN pessoa dono ON dono.id = e.pessoa_id
      WHERE ${porTenant ? 'e.tenant_id = $1' : 'e.pessoa_id = $1'}
        AND ($2::date IS NULL OR e.inicio >= $2::date)
        AND ($3::date IS NULL OR e.inicio < ($3::date + 1))
      ORDER BY e.inicio`,
    [porTenant ? req.pessoa!.tenant_id : req.pessoa!.id, de ?? null, ate ?? null]
  );
  res.json(r.rows);
});

// POST /api/agenda { titulo, inicio, fim?, tipo?, local?, processo_id? }
rotasAgenda.post('/agenda', exigirLogin, async (req, res) => {
  const { titulo, inicio, fim, tipo, local, processo_id } = req.body ?? {};
  if (!titulo || !inicio) return res.status(400).json({ erro: 'Informe título e data/hora de início.' });

  const r = await q(
    `INSERT INTO evento_agenda (tenant_id, titulo, inicio, fim, tipo, local, processo_id, pessoa_id)
     VALUES ($1, $2, $3, $4, COALESCE($5, 'reuniao'), $6, $7, $8)
     RETURNING id, titulo, inicio, fim, tipo, local, processo_id`,
    [req.pessoa!.tenant_id, titulo, inicio, fim ?? null, tipo ?? null, local ?? null, processo_id ?? null, req.pessoa!.id]
  );
  res.status(201).json(r.rows[0]);
});

// PUT /api/agenda/:id
rotasAgenda.put('/agenda/:id', exigirLogin, async (req, res) => {
  const { titulo, inicio, fim, tipo, local } = req.body ?? {};
  const r = await q(
    `UPDATE evento_agenda SET
       titulo = COALESCE($2, titulo),
       inicio = COALESCE($3, inicio),
       fim    = COALESCE($4, fim),
       tipo   = COALESCE($5, tipo),
       local  = COALESCE($6, local)
     WHERE id = $1 AND pessoa_id = $7
     RETURNING id, titulo, inicio, fim, tipo, local, processo_id`,
    [req.params.id, titulo ?? null, inicio ?? null, fim ?? null, tipo ?? null, local ?? null, req.pessoa!.id]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Evento não encontrado.' });
  res.json(r.rows[0]);
});

// DELETE /api/agenda/:id
rotasAgenda.delete('/agenda/:id', exigirLogin, async (req, res) => {
  const r = await q('DELETE FROM evento_agenda WHERE id = $1 AND pessoa_id = $2 RETURNING id', [req.params.id, req.pessoa!.id]);
  if (!r.rows[0]) return res.status(404).json({ erro: 'Evento não encontrado.' });
  res.json({ ok: true });
});
