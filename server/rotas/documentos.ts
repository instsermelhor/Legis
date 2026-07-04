/**
 * Documentos — upload real (base64 → arquivo em server/uploads, servido
 * estaticamente), tipos com campos p/ auto-preenchimento.
 *
 * A CLASSIFICAÇÃO VIA IA não é feita aqui (fluxo externo): o endpoint
 * PUT /documentos/:id apenas persiste `tipo_id`, `descricao` e `campos`.
 */
import { Router } from 'express';
import { writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { q } from '../db';
import { exigirLogin } from '../auth';

export const DIRETORIO_UPLOADS = join(import.meta.dirname, 'uploads');

const EXTENSOES_PERMITIDAS = ['pdf', 'png', 'jpg', 'jpeg'];

export const rotasDocumentos = Router();

// GET /api/documento-tipos
rotasDocumentos.get('/documento-tipos', async (_req, res) => {
  const r = await q('SELECT id, nome, campos FROM documento_tipo ORDER BY nome');
  res.json(r.rows);
});

// GET /api/documentos?processo_id=|pessoa_id=
rotasDocumentos.get('/documentos', exigirLogin, async (req, res) => {
  const processoId = req.query.processo_id ? Number(req.query.processo_id) : null;
  const pessoaId = req.query.pessoa_id ? Number(req.query.pessoa_id) : null;

  const r = await q(
    `SELECT d.id, d.nome, d.descricao, d.tipo_id, dt.nome AS tipo_nome,
            d.campos, d.url, d.data, d.pessoa_id, d.processo_id
       FROM documento d
       LEFT JOIN documento_tipo dt ON dt.id = d.tipo_id
      WHERE ($1::int IS NULL OR d.processo_id = $1)
        AND ($2::int IS NULL OR d.pessoa_id = $2)
        AND ($1::int IS NOT NULL OR $2::int IS NOT NULL OR d.pessoa_id = $3)
      ORDER BY d.data DESC, d.id DESC`,
    [processoId, pessoaId, req.pessoa!.id]
  );
  res.json(r.rows);
});

// POST /api/documentos — { nome, conteudo_base64?, descricao?, tipo_id?, processo_id? }
rotasDocumentos.post('/documentos', exigirLogin, async (req, res) => {
  const { nome, descricao, tipo_id, processo_id, conteudo_base64 } = req.body ?? {};
  if (!nome) return res.status(400).json({ erro: 'Informe o nome do documento.' });

  let url: string | null = null;
  if (conteudo_base64) {
    const extensao = String(nome).split('.').pop()?.toLowerCase() ?? '';
    if (!EXTENSOES_PERMITIDAS.includes(extensao)) {
      return res.status(400).json({ erro: `Formato não permitido. Use: ${EXTENSOES_PERMITIDAS.join(', ')}.` });
    }
    const nomeArquivo = `${Date.now()}-${String(nome).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    await writeFile(join(DIRETORIO_UPLOADS, nomeArquivo), Buffer.from(conteudo_base64, 'base64'));
    url = `/uploads/${nomeArquivo}`;
  }

  const r = await q(
    `INSERT INTO documento (nome, descricao, tipo_id, url, pessoa_id, processo_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, nome, descricao, tipo_id, campos, url, data, pessoa_id, processo_id`,
    [nome, descricao ?? null, tipo_id ?? null, url, req.pessoa!.id, processo_id ?? null]
  );
  res.status(201).json(r.rows[0]);
});

// PUT /api/documentos/:id — persiste classificação/campos (IA é fluxo externo).
rotasDocumentos.put('/documentos/:id', exigirLogin, async (req, res) => {
  const { descricao, tipo_id, campos } = req.body ?? {};
  const r = await q(
    `UPDATE documento SET
       descricao = COALESCE($2, descricao),
       tipo_id   = COALESCE($3, tipo_id),
       campos    = COALESCE($4::jsonb, campos)
     WHERE id = $1 AND ($5 = 'admin' OR pessoa_id = $6)
     RETURNING id, nome, descricao, tipo_id, campos, url, data, pessoa_id, processo_id`,
    [req.params.id, descricao ?? null, tipo_id ?? null, campos ? JSON.stringify(campos) : null, req.pessoa!.tipo, req.pessoa!.id]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Documento não encontrado ou sem permissão.' });
  res.json(r.rows[0]);
});

// DELETE /api/documentos/:id
rotasDocumentos.delete('/documentos/:id', exigirLogin, async (req, res) => {
  const r = await q<{ url: string | null }>(
    `DELETE FROM documento WHERE id = $1 AND ($2 = 'admin' OR pessoa_id = $3) RETURNING url`,
    [req.params.id, req.pessoa!.tipo, req.pessoa!.id]
  );
  if (!r.rows[0]) return res.status(404).json({ erro: 'Documento não encontrado ou sem permissão.' });
  if (r.rows[0].url) {
    await unlink(join(DIRETORIO_UPLOADS, r.rows[0].url.replace('/uploads/', ''))).catch(() => {});
  }
  res.json({ ok: true });
});
