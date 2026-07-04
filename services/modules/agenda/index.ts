/**
 * Módulo AGENDA — eventos do calendário (1—N com Processo) via API.
 */
import { api } from '../../api';

export type TipoEvento = 'audiencia' | 'consulta' | 'reuniao' | 'prazo';

export interface EventoAgendaApi {
  id: number;
  titulo: string;
  inicio: string;
  fim: string | null;
  tipo: TipoEvento;
  local: string | null;
  processo_id: number | null;
  processo_numero?: string | null;
  processo_nome?: string | null;
}

export const agendaService = {
  listar: (periodo?: { de?: string; ate?: string }) => {
    const query = new URLSearchParams(
      Object.entries(periodo ?? {}).filter(([, v]) => v) as [string, string][]
    ).toString();
    return api.get<EventoAgendaApi[]>(`/agenda${query ? `?${query}` : ''}`);
  },

  criar: (dados: { titulo: string; inicio: string; fim?: string; tipo?: TipoEvento; local?: string; processo_id?: number }) =>
    api.post<EventoAgendaApi>('/agenda', dados),

  atualizar: (id: number, dados: Partial<Pick<EventoAgendaApi, 'titulo' | 'inicio' | 'fim' | 'tipo' | 'local'>>) =>
    api.put<EventoAgendaApi>(`/agenda/${id}`, dados),

  remover: (id: number) => api.delete<{ ok: true }>(`/agenda/${id}`),
};
