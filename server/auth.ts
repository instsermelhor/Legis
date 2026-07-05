/**
 * Autenticação: registro, login, sessão via Bearer token (tabela sessao).
 */
import { Router, type Request, type Response, type NextFunction } from 'express';
import { q, transacao } from './db';
import { gerarHash, conferirSenha } from './senha';

export interface Pessoa {
  id: number;
  tenant_id: number;
  tipo: 'cliente' | 'advogado' | 'bacharel' | 'secretario' | 'admin';
  nome: string;
  email: string;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
}

// Pessoa autenticada anexada ao request pelo middleware `exigirLogin`.
declare module 'express-serve-static-core' {
  interface Request {
    pessoa?: Pessoa;
  }
}

const COLUNAS_PESSOA = 'id, tenant_id, tipo, nome, email, telefone, cidade, estado, ativo';

/** Carrega o perfil do subtipo (advogado/bacharel/secretario), se houver. */
export async function carregarPerfil(pessoa: Pessoa): Promise<Record<string, unknown> | null> {
  if (pessoa.tipo === 'advogado') {
    const r = await q('SELECT oab, especialidades, bio, foto_url, status FROM advogado WHERE pessoa_id = $1', [pessoa.id]);
    return r.rows[0] ?? null;
  }
  if (pessoa.tipo === 'bacharel') {
    const r = await q('SELECT universidade, semestre, interesse, supervisor_id FROM bacharel WHERE pessoa_id = $1', [pessoa.id]);
    return r.rows[0] ?? null;
  }
  if (pessoa.tipo === 'secretario') {
    const r = await q('SELECT experiencia_anos, disponibilidade, advogado_id FROM secretario WHERE pessoa_id = $1', [pessoa.id]);
    return r.rows[0] ?? null;
  }
  return null;
}

/** Middleware: exige sessão válida; anexa req.pessoa. */
export async function exigirLogin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ erro: 'Não autenticado.' });

  const r = await q<Pessoa>(
    `SELECT ${COLUNAS_PESSOA.split(', ').map(c => 'p.' + c).join(', ')}
       FROM sessao s JOIN pessoa p ON p.id = s.pessoa_id
      WHERE s.token = $1 AND s.expira_em > now() AND p.ativo`,
    [token]
  ).catch(() => null); // token fora do formato uuid

  if (!r?.rows[0]) return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
  req.pessoa = r.rows[0];
  next();
}

/** Middleware: exige que a pessoa logada seja admin. */
export function exigirAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.pessoa?.tipo !== 'admin') return res.status(403).json({ erro: 'Acesso restrito ao administrador.' });
  next();
}

async function criarSessao(pessoaId: number): Promise<string> {
  const r = await q<{ token: string }>('INSERT INTO sessao (pessoa_id) VALUES ($1) RETURNING token', [pessoaId]);
  return r.rows[0].token;
}

export const rotasAuth = Router();

// POST /api/auth/registrar — cria pessoa + perfil do subtipo e já loga.
rotasAuth.post('/registrar', async (req, res) => {
  const { tipo, nome, email, senha, telefone, cidade, estado, perfil = {} } = req.body ?? {};

  if (!['cliente', 'advogado', 'bacharel', 'secretario'].includes(tipo)) {
    return res.status(400).json({ erro: 'Tipo inválido. Use cliente, advogado, bacharel ou secretario.' });
  }
  if (!nome || !email || !senha) return res.status(400).json({ erro: 'Informe nome, e-mail e senha.' });
  if (String(senha).length < 4) return res.status(400).json({ erro: 'A senha deve ter pelo menos 4 caracteres.' });
  if (tipo === 'advogado' && !perfil.oab) return res.status(400).json({ erro: 'Advogado precisa informar a OAB.' });

  const jaExiste = await q('SELECT 1 FROM pessoa WHERE email = $1', [String(email).toLowerCase()]);
  if (jaExiste.rowCount) return res.status(409).json({ erro: 'E-mail já cadastrado.' });

  const pessoa = await transacao(async c => {
    // Multi-tenant: cada advogado ganha um tenant (escritório) próprio.
    // Clientes/bacharéis/secretários nascem no tenant 1 (Plataforma) e
    // bacharel/secretário migram para o tenant do advogado ao se vincular.
    let tenantId = 1;
    if (tipo === 'advogado') {
      const t = await c.query<{ id: number }>(
        'INSERT INTO tenant (nome) VALUES ($1) RETURNING id',
        [`Escritório ${nome}`]
      );
      tenantId = t.rows[0].id;
    }

    const r = await c.query<Pessoa>(
      `INSERT INTO pessoa (tenant_id, tipo, nome, email, senha_hash, telefone, cidade, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${COLUNAS_PESSOA}`,
      [tenantId, tipo, nome, String(email).toLowerCase(), gerarHash(String(senha)), telefone ?? null, cidade ?? null, estado ?? null]
    );
    const nova = r.rows[0];

    if (tipo === 'advogado') {
      await c.query(
        'INSERT INTO advogado (pessoa_id, oab, especialidades, bio, foto_url) VALUES ($1, $2, $3, $4, $5)',
        [nova.id, perfil.oab, perfil.especialidades ?? [], perfil.bio ?? null, perfil.foto_url ?? null]
      );
    } else if (tipo === 'bacharel') {
      await c.query(
        'INSERT INTO bacharel (pessoa_id, universidade, semestre, interesse) VALUES ($1, $2, $3, $4)',
        [nova.id, perfil.universidade ?? null, perfil.semestre ?? null, perfil.interesse ?? null]
      );
    } else if (tipo === 'secretario') {
      await c.query(
        'INSERT INTO secretario (pessoa_id, experiencia_anos, disponibilidade) VALUES ($1, $2, $3)',
        [nova.id, perfil.experiencia_anos ?? 0, perfil.disponibilidade ?? null]
      );
    }
    return nova;
  });

  const token = await criarSessao(pessoa.id);
  res.status(201).json({ token, pessoa, perfil: await carregarPerfil(pessoa) });
});

// POST /api/auth/login
rotasAuth.post('/login', async (req, res) => {
  const { email, senha } = req.body ?? {};
  if (!email || !senha) return res.status(400).json({ erro: 'Informe e-mail e senha.' });

  const r = await q<Pessoa & { senha_hash: string }>(
    `SELECT ${COLUNAS_PESSOA}, senha_hash FROM pessoa WHERE email = $1`,
    [String(email).toLowerCase()]
  );
  const registro = r.rows[0];
  if (!registro || !conferirSenha(String(senha), registro.senha_hash)) {
    return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
  }
  if (!registro.ativo) return res.status(403).json({ erro: 'Conta desativada.' });

  const { senha_hash: _descartado, ...pessoa } = registro;
  const token = await criarSessao(pessoa.id);
  res.json({ token, pessoa, perfil: await carregarPerfil(pessoa) });
});

// POST /api/auth/recuperar { email } — gera código de redefinição.
// SEM SMTP configurado, o código é retornado na resposta e exibido pela UI
// como "e-mail simulado". Quando houver SMTP, basta enviar em vez de retornar.
rotasAuth.post('/recuperar', async (req, res) => {
  const email = String(req.body?.email ?? '').toLowerCase();
  const r = await q<{ id: number; nome: string }>('SELECT id, nome FROM pessoa WHERE email = $1 AND ativo', [email]);
  if (!r.rows[0]) return res.status(404).json({ erro: 'E-mail não encontrado.' });

  const codigo = 'LC-' + String(Math.floor(1000 + Math.random() * 9000));
  await q('INSERT INTO recuperacao_senha (pessoa_id, codigo) VALUES ($1, $2)', [r.rows[0].id, codigo]);
  res.json({ nome: r.rows[0].nome, codigo });
});

// POST /api/auth/redefinir { email, codigo, nova_senha } — valida e troca.
rotasAuth.post('/redefinir', async (req, res) => {
  const { email, codigo, nova_senha } = req.body ?? {};
  if (!email || !codigo || !nova_senha) return res.status(400).json({ erro: 'Informe e-mail, código e nova senha.' });
  if (String(nova_senha).length < 4) return res.status(400).json({ erro: 'A senha deve ter pelo menos 4 caracteres.' });

  const r = await q<{ id: number; pessoa_id: number }>(
    `SELECT rs.id, rs.pessoa_id
       FROM recuperacao_senha rs JOIN pessoa p ON p.id = rs.pessoa_id
      WHERE p.email = $1 AND rs.codigo = $2 AND NOT rs.usado AND rs.expira_em > now()
      ORDER BY rs.id DESC LIMIT 1`,
    [String(email).toLowerCase(), String(codigo).toUpperCase()]
  );
  if (!r.rows[0]) return res.status(400).json({ erro: 'Código inválido ou expirado.' });

  await q('UPDATE pessoa SET senha_hash = $2 WHERE id = $1', [r.rows[0].pessoa_id, gerarHash(String(nova_senha))]);
  await q('UPDATE recuperacao_senha SET usado = true WHERE id = $1', [r.rows[0].id]);
  res.json({ ok: true });
});

// GET /api/auth/eu — dados da sessão atual.
rotasAuth.get('/eu', exigirLogin, async (req, res) => {
  res.json({ pessoa: req.pessoa, perfil: await carregarPerfil(req.pessoa!) });
});

// POST /api/auth/sair — encerra a sessão atual.
rotasAuth.post('/sair', exigirLogin, async (req, res) => {
  const token = req.headers.authorization!.replace(/^Bearer\s+/i, '');
  await q('DELETE FROM sessao WHERE token = $1', [token]);
  res.json({ ok: true });
});
