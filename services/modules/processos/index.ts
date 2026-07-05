/**
 * Módulo PROCESSOS — entidade Processo (numero PK de negócio, tipo,
 * advogado FK, cliente FK). Escopo por papel resolvido no servidor.
 */
import { api } from '../../api';

export interface ProcessoApi {
  id: number;
  numero: string;
  nome: string;
  status: 'Em Andamento' | 'Concluído' | 'Aguardando Documentação' | 'Arquivado';
  valor_causa: number;
  data_entrada: string;
  data_conclusao: string | null;
  tipo_processo_id: number | null;
  tipo_processo: string | null;
  advogado_id: number;
  advogado_nome: string;
  cliente_id: number | null;
  cliente_nome: string | null;
}

export interface TipoProcessoApi {
  id: number;
  nome: string;
}

export const processosService = {
  listar: (status?: ProcessoApi['status']) =>
    api.get<ProcessoApi[]>(`/processos${status ? `?status=${encodeURIComponent(status)}` : ''}`),

  obter: (id: number) => api.get<ProcessoApi>(`/processos/${id}`),

  criar: (dados: { numero: string; nome: string; tipo_processo_id?: number; cliente_id?: number; valor_causa?: number }) =>
    api.post<ProcessoApi>('/processos', dados),

  atualizar: (id: number, dados: Partial<Pick<ProcessoApi, 'nome' | 'status' | 'tipo_processo_id' | 'cliente_id' | 'data_conclusao' | 'valor_causa' | 'advogado_id'>>) =>
    api.put<ProcessoApi>(`/processos/${id}`, dados),

  remover: (id: number) => api.delete<{ ok: true }>(`/processos/${id}`),

  tipos: () => api.get<TipoProcessoApi[]>('/tipos-processo'),
};
