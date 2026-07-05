/**
 * Módulo DADOS — chave/valor por usuário no PostgreSQL (substitui o
 * localStorage para widgets pessoais: notas, cronômetros, preferências).
 */
import { api } from '../../api';

export const dadosService = {
  todos: () => api.get<Record<string, unknown>>('/dados'),

  obter: async <T>(chave: string): Promise<T | null> => {
    const r = await api.get<{ valor: T | null }>(`/dados/${encodeURIComponent(chave)}`);
    return r.valor;
  },

  guardar: (chave: string, valor: unknown) =>
    api.put<{ ok: true }>(`/dados/${encodeURIComponent(chave)}`, { valor }),

  remover: (chave: string) => api.delete<{ ok: true }>(`/dados/${encodeURIComponent(chave)}`),
};
