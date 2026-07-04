/**
 * Cliente HTTP da API Legis Connect (Express + PostgreSQL, porta 4000).
 * O Vite faz proxy de /api e /uploads — as URLs aqui são relativas.
 *
 * Token de sessão fica em localStorage ('legis_token') e é enviado
 * como Bearer em toda chamada autenticada.
 */

const CHAVE_TOKEN = 'legis_token';

export function obterToken(): string | null {
  try { return localStorage.getItem(CHAVE_TOKEN); } catch { return null; }
}

export function guardarToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(CHAVE_TOKEN, token);
    else localStorage.removeItem(CHAVE_TOKEN);
  } catch { /* storage indisponível */ }
}

export class ErroApi extends Error {
  constructor(public status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ErroApi';
  }
}

async function chamar<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const cabecalhos: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = obterToken();
  if (token) cabecalhos.Authorization = `Bearer ${token}`;

  const resposta = await fetch(`/api${caminho}`, {
    method: metodo,
    headers: cabecalhos,
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new ErroApi(resposta.status, (dados as { erro?: string }).erro ?? `Erro HTTP ${resposta.status}`);
  }
  return dados as T;
}

export const api = {
  get:    <T>(caminho: string) => chamar<T>('GET', caminho),
  post:   <T>(caminho: string, corpo?: unknown) => chamar<T>('POST', caminho, corpo),
  put:    <T>(caminho: string, corpo?: unknown) => chamar<T>('PUT', caminho, corpo),
  delete: <T>(caminho: string) => chamar<T>('DELETE', caminho),
};
