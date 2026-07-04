/**
 * Módulo PESSOAS — advogados (vitrine), bachareis, secretários e
 * administração de contas. Tudo contra a API real.
 */
import { api } from '../../api';

export interface AdvogadoApi {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  oab: string;
  especialidades: string[];
  bio: string | null;
  foto_url: string | null;
  status: 'pendente' | 'verificado' | 'rejeitado';
}

export interface BacharelApi {
  id: number;
  nome: string;
  email: string;
  universidade: string | null;
  semestre: string | null;
  interesse: string | null;
  supervisor_id: number | null;
}

export interface SecretarioApi {
  id: number;
  nome: string;
  email: string;
  experiencia_anos: number;
  disponibilidade: string | null;
  advogado_id: number | null;
}

export const pessoasService = {
  advogados: {
    listar: (filtros?: { especialidade?: string; cidade?: string; estado?: string }) => {
      const query = new URLSearchParams(
        Object.entries(filtros ?? {}).filter(([, v]) => v) as [string, string][]
      ).toString();
      return api.get<AdvogadoApi[]>(`/advogados${query ? `?${query}` : ''}`);
    },
    obter: (id: number) => api.get<AdvogadoApi>(`/advogados/${id}`),
    atualizar: (id: number, dados: Partial<Pick<AdvogadoApi, 'especialidades' | 'bio' | 'foto_url' | 'status'>>) =>
      api.put<AdvogadoApi>(`/advogados/${id}`, dados),
  },

  bachareis: {
    listar: (supervisorId?: number) =>
      api.get<BacharelApi[]>(`/bachareis${supervisorId ? `?supervisor_id=${supervisorId}` : ''}`),
    atualizar: (id: number, dados: Partial<Omit<BacharelApi, 'id' | 'nome' | 'email'>>) =>
      api.put<BacharelApi>(`/bachareis/${id}`, dados),
  },

  secretarios: {
    listar: (advogadoId?: number) =>
      api.get<SecretarioApi[]>(`/secretarios${advogadoId ? `?advogado_id=${advogadoId}` : ''}`),
    atualizar: (id: number, dados: Partial<Omit<SecretarioApi, 'id' | 'nome' | 'email'>>) =>
      api.put<SecretarioApi>(`/secretarios/${id}`, dados),
  },

  /** Dados básicos da própria conta. */
  atualizarConta: (id: number, dados: { nome?: string; telefone?: string; cidade?: string; estado?: string }) =>
    api.put(`/pessoas/${id}`, dados),

  admin: {
    listar: (tipo?: string) => api.get(`/admin/pessoas${tipo ? `?tipo=${tipo}` : ''}`),
    definirAtivo: (id: number, ativo: boolean) => api.put(`/admin/pessoas/${id}/ativo`, { ativo }),
  },
};
