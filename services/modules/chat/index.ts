/**
 * Módulo CHAT — bloco vermelho do diagrama (whiteboard 1):
 *   Chat      { id PK, pessoa1Fk, pessoa2Fk, fk mensagens[] }
 *   Mensagem  { id PK, texto, fkPessoa, fkChat, timestamp }
 * Fluxo: P1 ↔ Middleman (Bot Legis, via WhatsApp) ↔ P2, criptografia
 * end-to-end, Termo/NDA (LGPD). Persistência local até o banco entrar.
 */

export interface Mensagem {
  id: string;
  chatFk: string;
  pessoaFk: string;
  texto: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  pessoa1Fk: string;
  pessoa2Fk: string;
  criadoEm: string;
}

const KEY_CHATS = 'legis_chats';
const KEY_MSGS = 'legis_chat_mensagens';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* quota / SSR */ }
}

export const chatService = {
  /** obtém (ou cria) o chat entre duas pessoas */
  getOrCreate(pessoa1Fk: string, pessoa2Fk: string): Chat {
    const chats = load<Chat[]>(KEY_CHATS, []);
    const found = chats.find(c =>
      (c.pessoa1Fk === pessoa1Fk && c.pessoa2Fk === pessoa2Fk) ||
      (c.pessoa1Fk === pessoa2Fk && c.pessoa2Fk === pessoa1Fk));
    if (found) return found;
    const chat: Chat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      pessoa1Fk, pessoa2Fk,
      criadoEm: new Date().toISOString(),
    };
    save(KEY_CHATS, [...chats, chat]);
    return chat;
  },

  getMensagens(chatFk: string): Mensagem[] {
    return load<Mensagem[]>(KEY_MSGS, []).filter(m => m.chatFk === chatFk);
  },

  enviar(chatFk: string, pessoaFk: string, texto: string): Mensagem {
    const msg: Mensagem = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      chatFk, pessoaFk, texto,
      timestamp: new Date().toISOString(),
    };
    save(KEY_MSGS, [...load<Mensagem[]>(KEY_MSGS, []), msg]);
    return msg;
  },
};
