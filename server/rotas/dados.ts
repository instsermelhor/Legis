/**
 * Dados por usuário — armazenamento chave/valor (jsonb) para widgets
 * pessoais dos painéis (notas do bacharel, cronômetro de estágio,
 * preferências). Substitui o localStorage: persiste no PostgreSQL.
 */
import { Router } from 'express';
import { q } from '../db';
import { exigirLogin } from './../auth';

export const rotasDados = Router();

// GET /api/dados — todas as chaves da pessoa logada.
rotasDados.get('/dados', exigirLogin, async (req, res) => {
  const r = await q('SELECT chave, valor FROM dado_usuario WHERE pessoa_id = $1', [req.pessoa!.id]);
  res.json(Object.fromEntries(r.rows.map(x => [x.chave, x.valor])));
});

// GET /api/dados/:chave
rotasDados.get('/dados/:chave', exigirLogin, async (req, res) => {
  const r = await q('SELECT valor FROM dado_usuario WHERE pessoa_id = $1 AND chave = $2', [req.pessoa!.id, req.params.chave]);
  res.json({ valor: r.rows[0]?.valor ?? null });
});

// PUT /api/dados/:chave { valor } — upsert.
rotasDados.put('/dados/:chave', exigirLogin, async (req, res) => {
  if (req.body?.valor === undefined) return res.status(400).json({ erro: 'Informe o campo valor.' });
  await q(
    `INSERT INTO dado_usuario (pessoa_id, chave, valor) VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (pessoa_id, chave) DO UPDATE SET valor = $3::jsonb, atualizado_em = now()`,
    [req.pessoa!.id, req.params.chave, JSON.stringify(req.body.valor)]
  );
  res.json({ ok: true });
});

// DELETE /api/dados/:chave
rotasDados.delete('/dados/:chave', exigirLogin, async (req, res) => {
  await q('DELETE FROM dado_usuario WHERE pessoa_id = $1 AND chave = $2', [req.pessoa!.id, req.params.chave]);
  res.json({ ok: true });
});
