/**
 * Pessoas: advogados (vitrine pública), bachareis, secretários e
 * administração de contas.
 */
import { Router } from 'express';
import { q } from '../db';
import { exigirLogin, exigirAdmin } from '../auth';

export const rotasPessoas = Router();

const VITRINE_ADVOGADO = `
  SELECT p.id, p.nome, p.email, p.telefone, p.cidade, p.estado,
         a.oab, a.especialidades, a.bio, a.foto_url, a.status
    FROM pessoa p JOIN advogado a ON a.pessoa_id = p.id
   WHERE p.ativo`;

// GET /api/advogados — vitrine pública (apenas verificados).
rotasPessoas.get('/advogados', async (req, res) => {
  const { especialidade, cidade, estado } = req.query;
  const condicoes: string[] = [`a.status = 'verificado'`];
  const params: unknown[] = [];

  if (especialidade) { params.push(especialidade); condicoes.push(`$${params.length} = ANY(a.especialidades)`); }
  if (cidade) { params.push(`%${cidade}%`); condicoes.push(`p.cidade ILIKE $${params.length}`); }
  if (estado) { params.push(estado); condicoes.push(`p.estado = $${params.length}`); }

  const r = await q(`${VITRINE_ADVOGADO} AND ${condicoes.join(' AND ')} ORDER BY p.nome`, params);
  res.json(r.rows);
});

// GET /api/advogados/:id — perfil público.
rotasPessoas.get('/advogados/:id', async (req, res) => {
  const r = await q(`${VITRINE_ADVOGADO} AND p.id = $1`, [req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ erro: 'Advogado não encontrado.' });
  res.json(r.rows[0]);
});

// PUT /api/advogados/:id — o próprio advogado (ou admin) atualiza o perfil.
rotasPessoas.put('/advogados/:id', exigirLogin, async (req, res) => {
  const id = Number(req.params.id);
  if (req.pessoa!.id !== id && req.pessoa!.tipo !== 'admin') {
    return res.status(403).json({ erro: 'Sem permissão para editar este perfil.' });
  }
  const { especialidades, bio, foto_url, status } = req.body ?? {};
  // Só o admin altera o status de verificação.
  const novoStatus = req.pessoa!.tipo === 'admin' && status ? status : undefined;

  const r = await q(
    `UPDATE advogado SET
       especialidades = COALESCE($2, especialidades),
       bio            = COALESCE($3, bio),
       foto_url       = COALESCE($4, foto_url),
       status         = COALESCE($5, status)
     WHERE pessoa_id = $1
     RETURNING pessoa_id, oab, especialidades, bio, foto_url, status`,
    [id, especialidades ?? null, bio ?? null, foto_url ?? null, novoStatus ?? null]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Advogado não encontrado.' });
  res.json(r.rows[0]);
});

// GET /api/bachareis?supervisor_id= — bachareis (do supervisor, ou todos p/ admin).
rotasPessoas.get('/bachareis', exigirLogin, async (req, res) => {
  const supervisorId = req.query.supervisor_id ? Number(req.query.supervisor_id) : null;
  const r = await q(
    `SELECT p.id, p.nome, p.email, p.telefone, p.cidade, p.estado,
            b.universidade, b.semestre, b.interesse, b.supervisor_id
       FROM pessoa p JOIN bacharel b ON b.pessoa_id = p.id
      WHERE p.ativo AND ($1::int IS NULL OR b.supervisor_id = $1)
      ORDER BY p.nome`,
    [supervisorId]
  );
  res.json(r.rows);
});

// PUT /api/bachareis/:id — o próprio bacharel (ou admin/supervisor) atualiza.
rotasPessoas.put('/bachareis/:id', exigirLogin, async (req, res) => {
  const id = Number(req.params.id);
  const podeEditar = req.pessoa!.id === id || req.pessoa!.tipo === 'admin' || req.pessoa!.tipo === 'advogado';
  if (!podeEditar) return res.status(403).json({ erro: 'Sem permissão.' });

  const { universidade, semestre, interesse, supervisor_id } = req.body ?? {};
  const r = await q(
    `UPDATE bacharel SET
       universidade  = COALESCE($2, universidade),
       semestre      = COALESCE($3, semestre),
       interesse     = COALESCE($4, interesse),
       supervisor_id = COALESCE($5, supervisor_id)
     WHERE pessoa_id = $1
     RETURNING pessoa_id, universidade, semestre, interesse, supervisor_id`,
    [id, universidade ?? null, semestre ?? null, interesse ?? null, supervisor_id ?? null]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Bacharel não encontrado.' });
  res.json(r.rows[0]);
});

// GET /api/secretarios?advogado_id=
rotasPessoas.get('/secretarios', exigirLogin, async (req, res) => {
  const advogadoId = req.query.advogado_id ? Number(req.query.advogado_id) : null;
  const r = await q(
    `SELECT p.id, p.nome, p.email, p.telefone, p.cidade, p.estado,
            s.experiencia_anos, s.disponibilidade, s.advogado_id
       FROM pessoa p JOIN secretario s ON s.pessoa_id = p.id
      WHERE p.ativo AND ($1::int IS NULL OR s.advogado_id = $1)
      ORDER BY p.nome`,
    [advogadoId]
  );
  res.json(r.rows);
});

// PUT /api/secretarios/:id
rotasPessoas.put('/secretarios/:id', exigirLogin, async (req, res) => {
  const id = Number(req.params.id);
  const podeEditar = req.pessoa!.id === id || req.pessoa!.tipo === 'admin' || req.pessoa!.tipo === 'advogado';
  if (!podeEditar) return res.status(403).json({ erro: 'Sem permissão.' });

  const { experiencia_anos, disponibilidade, advogado_id } = req.body ?? {};
  const r = await q(
    `UPDATE secretario SET
       experiencia_anos = COALESCE($2, experiencia_anos),
       disponibilidade  = COALESCE($3, disponibilidade),
       advogado_id      = COALESCE($4, advogado_id)
     WHERE pessoa_id = $1
     RETURNING pessoa_id, experiencia_anos, disponibilidade, advogado_id`,
    [id, experiencia_anos ?? null, disponibilidade ?? null, advogado_id ?? null]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Secretário não encontrado.' });
  res.json(r.rows[0]);
});

// PUT /api/pessoas/:id — dados básicos (o próprio ou admin).
rotasPessoas.put('/pessoas/:id', exigirLogin, async (req, res) => {
  const id = Number(req.params.id);
  if (req.pessoa!.id !== id && req.pessoa!.tipo !== 'admin') {
    return res.status(403).json({ erro: 'Sem permissão.' });
  }
  const { nome, telefone, cidade, estado } = req.body ?? {};
  const r = await q(
    `UPDATE pessoa SET
       nome     = COALESCE($2, nome),
       telefone = COALESCE($3, telefone),
       cidade   = COALESCE($4, cidade),
       estado   = COALESCE($5, estado)
     WHERE id = $1
     RETURNING id, tipo, nome, email, telefone, cidade, estado, ativo`,
    [id, nome ?? null, telefone ?? null, cidade ?? null, estado ?? null]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Pessoa não encontrada.' });
  res.json(r.rows[0]);
});

// GET /api/admin/pessoas — listagem completa para o backoffice.
rotasPessoas.get('/admin/pessoas', exigirLogin, exigirAdmin, async (req, res) => {
  const tipo = req.query.tipo ? String(req.query.tipo) : null;
  const r = await q(
    `SELECT id, tipo, nome, email, telefone, cidade, estado, ativo, criado_em
       FROM pessoa
      WHERE $1::text IS NULL OR tipo = $1
      ORDER BY criado_em DESC`,
    [tipo]
  );
  res.json(r.rows);
});

// PUT /api/admin/pessoas/:id/ativo — ativar/desativar conta.
rotasPessoas.put('/admin/pessoas/:id/ativo', exigirLogin, exigirAdmin, async (req, res) => {
  const r = await q(
    'UPDATE pessoa SET ativo = $2 WHERE id = $1 RETURNING id, nome, ativo',
    [req.params.id, Boolean(req.body?.ativo)]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Pessoa não encontrada.' });
  res.json(r.rows[0]);
});
