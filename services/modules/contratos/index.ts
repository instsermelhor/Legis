/**
 * Módulo CONTRATOS & SERVIÇOS — catálogo público e contratações
 * (Advogado N—Contrato—N Pessoa, FK Serviço).
 */
import { api } from '../../api';

export interface ServicoApi {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  prazo_dias: number | null;
}

export interface ContratoApi {
  id: number;
  status: 'ativo' | 'concluido' | 'cancelado';
  criado_em: string;
  advogado_id: number;
  advogado_nome: string;
  cliente_id: number;
  cliente_nome: string;
  servico_id: number | null;
  servico_nome: string | null;
  servico_preco: number | null;
}

export const contratosService = {
  catalogo: () => api.get<ServicoApi[]>('/servicos'),

  meus: () => api.get<ContratoApi[]>('/contratos'),

  contratar: (dados: { advogado_id: number; servico_id?: number; cliente_id?: number }) =>
    api.post<ContratoApi>('/contratos', dados),

  atualizarStatus: (id: number, status: ContratoApi['status']) =>
    api.put<Pick<ContratoApi, 'id' | 'status'>>(`/contratos/${id}`, { status }),

  admin: {
    criarServico: (dados: { nome: string; descricao?: string; preco: number; prazo_dias?: number }) =>
      api.post<ServicoApi>('/servicos', dados),
    atualizarServico: (id: number, dados: Partial<Omit<ServicoApi, 'id'>>) =>
      api.put<ServicoApi>(`/servicos/${id}`, dados),
    removerServico: (id: number) => api.delete<{ ok: true }>(`/servicos/${id}`),
  },
};
