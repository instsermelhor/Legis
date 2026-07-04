/**
 * Chat 1-a-1 — Chat {pessoa1, pessoa2} + Mensagens (FK pessoa, FK chat).
 * O par é normalizado (menor id primeiro) para garantir chat único.
 */
import { Router } from 'express';
import { q } from '../db';
import { exigirLogin } from '../auth';

export const rotasChats = Router();

/** Confere se a pessoa participa do chat. */
async function participaDoChat(chatId: number, pessoaId: number): Promise<boolean> {
  const r = await q('SELECT 1 FROM chat WHERE id = $1 AND (pessoa1_id = $2 OR pessoa2_id = $2)', [chatId, pessoaId]);
  return r.rowCount! > 0;
}

// POST /api/chats { destinatario_id } — obtém (ou cria) o chat com a pessoa.
rotasChats.post('/chats', exigirLogin, async (req, res) => {
  const destinatarioId = Number(req.body?.destinatario_id);
  if (!destinatarioId || destinatarioId === req.pessoa!.id) {
    return res.status(400).json({ erro: 'Informe um destinatário válido.' });
  }
  const existe = await q('SELECT 1 FROM pessoa WHERE id = $1 AND ativo', [destinatarioId]);
  if (!existe.rowCount) return res.status(404).json({ erro: 'Destinatário não encontrado.' });

  const [p1, p2] = [req.pessoa!.id, destinatarioId].sort((a, b) => a - b);
  const r = await q(
    `INSERT INTO chat (pessoa1_id, pessoa2_id) VALUES ($1, $2)
     ON CONFLICT (pessoa1_id, pessoa2_id) DO UPDATE SET pessoa1_id = EXCLUDED.pessoa1_id
     RETURNING id, pessoa1_id, pessoa2_id, criado_em`,
    [p1, p2]
  );
  res.status(201).json(r.rows[0]);
});

// GET /api/chats — meus chats, com o interlocutor e a última mensagem.
rotasChats.get('/chats', exigirLogin, async (req, res) => {
  const r = await q(
    `SELECT c.id, c.criado_em,
            outro.id AS interlocutor_id, outro.nome AS interlocutor_nome, outro.tipo AS interlocutor_tipo,
            ultima.texto AS ultima_mensagem, ultima.criado_em AS ultima_em
       FROM chat c
       JOIN pessoa outro
         ON outro.id = CASE WHEN c.pessoa1_id = $1 THEN c.pessoa2_id ELSE c.pessoa1_id END
       LEFT JOIN LATERAL (
         SELECT texto, criado_em FROM mensagem WHERE chat_id = c.id ORDER BY criado_em DESC LIMIT 1
       ) ultima ON TRUE
      WHERE c.pessoa1_id = $1 OR c.pessoa2_id = $1
      ORDER BY COALESCE(ultima.criado_em, c.criado_em) DESC`,
    [req.pessoa!.id]
  );
  res.json(r.rows);
});

// GET /api/chats/:id/mensagens
rotasChats.get('/chats/:id/mensagens', exigirLogin, async (req, res) => {
  const chatId = Number(req.params.id);
  if (!(await participaDoChat(chatId, req.pessoa!.id))) {
    return res.status(403).json({ erro: 'Você não participa deste chat.' });
  }
  const r = await q(
    `SELECT m.id, m.chat_id, m.pessoa_id, p.nome AS pessoa_nome, m.texto, m.criado_em
       FROM mensagem m JOIN pessoa p ON p.id = m.pessoa_id
      WHERE m.chat_id = $1 ORDER BY m.criado_em`,
    [chatId]
  );
  res.json(r.rows);
});

// POST /api/chats/:id/mensagens { texto }
rotasChats.post('/chats/:id/mensagens', exigirLogin, async (req, res) => {
  const chatId = Number(req.params.id);
  const texto = String(req.body?.texto ?? '').trim();
  if (!texto) return res.status(400).json({ erro: 'Mensagem vazia.' });
  if (!(await participaDoChat(chatId, req.pessoa!.id))) {
    return res.status(403).json({ erro: 'Você não participa deste chat.' });
  }
  const r = await q(
    `INSERT INTO mensagem (chat_id, pessoa_id, texto) VALUES ($1, $2, $3)
     RETURNING id, chat_id, pessoa_id, texto, criado_em`,
    [chatId, req.pessoa!.id, texto]
  );
  res.status(201).json(r.rows[0]);
});
