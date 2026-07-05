/**
 * Métricas do backoffice — agregados reais para o painel administrativo.
 */
import { Router } from 'express';
import { q } from '../db';
import { exigirLogin, exigirAdmin } from '../auth';
import { gerarHash } from '../senha';

export const rotasAdmin = Router();

// GET /api/admin/advogados — todos (qualquer status) p/ fila de verificação.
rotasAdmin.get('/admin/advogados', exigirLogin, exigirAdmin, async (_req, res) => {
  const r = await q(
    `SELECT p.id, p.nome, p.email, p.telefone, p.cidade, p.estado, p.ativo, p.criado_em,
            p.tenant_id, t.nome AS tenant_nome,
            a.oab, a.especialidades, a.bio, a.foto_url, a.status
       FROM pessoa p
       JOIN advogado a ON a.pessoa_id = p.id
       JOIN tenant t ON t.id = p.tenant_id
      ORDER BY p.criado_em DESC`
  );
  res.json(r.rows);
});

// POST /api/admin/admins — cria outra conta de administrador.
rotasAdmin.post('/admin/admins', exigirLogin, exigirAdmin, async (req, res) => {
  const { nome, email, senha } = req.body ?? {};
  if (!nome || !email || !senha) return res.status(400).json({ erro: 'Informe nome, e-mail e senha.' });
  const existe = await q('SELECT 1 FROM pessoa WHERE email = $1', [String(email).toLowerCase()]);
  if (existe.rowCount) return res.status(409).json({ erro: 'E-mail já cadastrado.' });

  const r = await q(
    `INSERT INTO pessoa (tenant_id, tipo, nome, email, senha_hash)
     VALUES (1, 'admin', $1, $2, $3)
     RETURNING id, tipo, nome, email, ativo, criado_em`,
    [nome, String(email).toLowerCase(), gerarHash(String(senha))]
  );
  res.status(201).json(r.rows[0]);
});

// PUT /api/admin/pessoas/:id/senha — admin redefine a senha de uma conta.
rotasAdmin.put('/admin/pessoas/:id/senha', exigirLogin, exigirAdmin, async (req, res) => {
  const { senha } = req.body ?? {};
  if (!senha || String(senha).length < 4) return res.status(400).json({ erro: 'Senha inválida (mínimo 4 caracteres).' });
  const r = await q('UPDATE pessoa SET senha_hash = $2 WHERE id = $1 RETURNING id', [req.params.id, gerarHash(String(senha))]);
  if (!r.rows[0]) return res.status(404).json({ erro: 'Pessoa não encontrada.' });
  res.json({ ok: true });
});

// POST /api/admin/impersonar { pessoa_id } — sessão real em nome da pessoa
// (Modo Espelho). Retorna um token de sessão do alvo; o admin assume a visão.
rotasAdmin.post('/admin/impersonar', exigirLogin, exigirAdmin, async (req, res) => {
  const pessoaId = Number(req.body?.pessoa_id);
  const alvo = await q(
    'SELECT id, tenant_id, tipo, nome, email, telefone, cidade, estado, ativo FROM pessoa WHERE id = $1 AND ativo',
    [pessoaId]
  );
  if (!alvo.rows[0]) return res.status(404).json({ erro: 'Pessoa não encontrada ou inativa.' });
  if (alvo.rows[0].tipo === 'admin') return res.status(400).json({ erro: 'Não é possível espelhar outro admin.' });

  const sessao = await q<{ token: string }>(
    `INSERT INTO sessao (pessoa_id, expira_em) VALUES ($1, now() + interval '1 hour') RETURNING token`,
    [pessoaId]
  );
  res.json({ token: sessao.rows[0].token, pessoa: alvo.rows[0] });
});

// GET /api/admin/metricas
rotasAdmin.get('/admin/metricas', exigirLogin, exigirAdmin, async (_req, res) => {
  const pessoasPorTipo = await q(
    `SELECT tipo, COUNT(*)::int AS total, COUNT(*) FILTER (WHERE ativo)::int AS ativos
       FROM pessoa GROUP BY tipo`
  );

  const processosPorStatus = await q(
    `SELECT status, COUNT(*)::int AS total FROM processo GROUP BY status`
  );

  const receita = await q<{ recebido: number; pendente: number }>(
    `SELECT COALESCE(SUM(valor) FILTER (WHERE status = 'recebido'), 0)::float8 AS recebido,
            COALESCE(SUM(valor) FILTER (WHERE status <> 'recebido'), 0)::float8 AS pendente
       FROM fconta`
  );

  const receitaPorMes = await q(
    `SELECT to_char(date_trunc('month', data), 'YYYY-MM') AS mes,
            COALESCE(SUM(valor) FILTER (WHERE status = 'recebido'), 0)::float8 AS recebido
       FROM fconta
      WHERE data >= date_trunc('month', current_date) - interval '5 months'
      GROUP BY 1 ORDER BY 1`
  );

  const tenants = await q(
    `SELECT t.id, t.nome, COUNT(p.id)::int AS pessoas,
            (SELECT COUNT(*)::int FROM processo pr WHERE pr.tenant_id = t.id) AS processos
       FROM tenant t LEFT JOIN pessoa p ON p.tenant_id = t.id
      GROUP BY t.id ORDER BY t.id`
  );

  const contratos = await q(
    `SELECT status, COUNT(*)::int AS total FROM contrato GROUP BY status`
  );

  const contratosPorServico = await q(
    `SELECT s.id AS servico_id, s.nome, COUNT(c.id)::int AS total
       FROM servico s LEFT JOIN contrato c ON c.servico_id = s.id
      GROUP BY s.id, s.nome ORDER BY total DESC`
  );

  res.json({
    pessoas_por_tipo: pessoasPorTipo.rows,
    processos_por_status: processosPorStatus.rows,
    receita: receita.rows[0],
    receita_por_mes: receitaPorMes.rows,
    tenants: tenants.rows,
    contratos_por_status: contratos.rows,
    contratos_por_servico: contratosPorServico.rows,
  });
});
