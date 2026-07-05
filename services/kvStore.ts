/**
 * kvStore — cache write-through sobre /api/dados (tabela dado_usuario).
 *
 * Dá acesso SÍNCRONO (como o localStorage que substitui) com persistência
 * real no PostgreSQL: `hidratar()` carrega tudo no login; `set()` grava no
 * cache e dispara o PUT em segundo plano.
 */
import { backend } from './modules';
import { obterToken } from './api';

const cache = new Map<string, unknown>();
let hidratado = false;

export const kv = {
  /** Carrega todas as chaves da pessoa logada (chamar após o login). */
  async hidratar(): Promise<void> {
    if (!obterToken()) return;
    try {
      const tudo = await backend.dados.todos();
      cache.clear();
      for (const [chave, valor] of Object.entries(tudo)) cache.set(chave, valor);
      hidratado = true;
    } catch { /* API fora do ar — cache segue vazio */ }
  },

  estaHidratado: () => hidratado,

  get<T>(chave: string, padrao: T): T {
    return cache.has(chave) ? (cache.get(chave) as T) : padrao;
  },

  set(chave: string, valor: unknown): void {
    cache.set(chave, valor);
    void backend.dados.guardar(chave, valor).catch(() => {});
  },

  remover(chave: string): void {
    cache.delete(chave);
    void backend.dados.remover(chave).catch(() => {});
  },

  limpar(): void {
    cache.clear();
    hidratado = false;
  },
};

/**
 * Shim com a interface do localStorage para migração mecânica de código
 * legado (getItem/setItem com JSON string) para o armazenamento no servidor.
 */
export const armazemServidor = {
  getItem(chave: string): string | null {
    const v = kv.get<unknown>(chave, undefined as unknown);
    return v === undefined ? null : JSON.stringify(v);
  },
  setItem(chave: string, valor: string): void {
    try { kv.set(chave, JSON.parse(valor)); } catch { kv.set(chave, valor); }
  },
  removeItem(chave: string): void {
    kv.remover(chave);
  },
};
