/**
 * Módulo AUTH — sessão real contra a API (tabela sessao no PostgreSQL).
 */
import { api, guardarToken } from '../../api';

export type TipoPessoa = 'cliente' | 'advogado' | 'bacharel' | 'secretario' | 'admin';

export interface PessoaApi {
  id: number;
  tipo: TipoPessoa;
  nome: string;
  email: string;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
}

export interface SessaoApi {
  token: string;
  pessoa: PessoaApi;
  perfil: Record<string, unknown> | null;
}

export const authService = {
  async login(email: string, senha: string): Promise<SessaoApi> {
    const sessao = await api.post<SessaoApi>('/auth/login', { email, senha });
    guardarToken(sessao.token);
    return sessao;
  },

  async registrar(dados: {
    tipo: Exclude<TipoPessoa, 'admin'>;
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    cidade?: string;
    estado?: string;
    perfil?: Record<string, unknown>;
  }): Promise<SessaoApi> {
    const sessao = await api.post<SessaoApi>('/auth/registrar', dados);
    guardarToken(sessao.token);
    return sessao;
  },

  /** Sessão atual (ou null se o token expirou). */
  async eu(): Promise<Omit<SessaoApi, 'token'> | null> {
    try {
      return await api.get<Omit<SessaoApi, 'token'>>('/auth/eu');
    } catch {
      return null;
    }
  },

  async sair(): Promise<void> {
    await api.post('/auth/sair').catch(() => {});
    guardarToken(null);
  },
};
