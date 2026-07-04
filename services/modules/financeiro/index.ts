/**
 * Módulo FINANCEIRO — Financeiro 1—N FContas (lançamentos) + resumo
 * agregado real (SQL no servidor).
 */
import { api } from '../../api';

export interface FinanceiroApi {
  id: number;
  processo_id: number | null;
  pessoa_id: number;
  data_inicio: string | null;
  data_fim: string | null;
  data_pago: string | null;
}

export interface FContaApi {
  id: number;
  financeiro_id: number;
  descricao: string;
  valor: number;
  data: string;
  status: 'pendente' | 'recebido' | 'atrasado';
  pessoa_responsavel_id: number | null;
  responsavel_nome?: string | null;
}

export interface ResumoFinanceiroApi {
  recebido: number;
  pendente: number;
  atrasado: number;
  por_mes: Array<{ mes: string; recebido: number; aberto: number }>;
}

export const financeiroService = {
  abrirParaProcesso: (processoId: number, dados?: { data_inicio?: string; data_fim?: string }) =>
    api.post<FinanceiroApi>(`/processos/${processoId}/financeiro`, dados ?? {}),

  doProcesso: (processoId: number) =>
    api.get<{ financeiros: FinanceiroApi[]; fcontas: FContaApi[] }>(`/processos/${processoId}/financeiro`),

  lancar: (financeiroId: number, dados: { descricao: string; valor: number; data?: string; status?: FContaApi['status'] }) =>
    api.post<FContaApi>(`/financeiro/${financeiroId}/fcontas`, dados),

  atualizarLancamento: (fcontaId: number, dados: Partial<Pick<FContaApi, 'descricao' | 'valor' | 'status' | 'data'>>) =>
    api.put<FContaApi>(`/fcontas/${fcontaId}`, dados),

  /** Totais + fluxo de caixa dos últimos 6 meses da pessoa logada. */
  resumo: () => api.get<ResumoFinanceiroApi>('/financeiro/resumo'),
};
