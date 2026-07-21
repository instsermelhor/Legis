/**
 * Módulo FINANCEIRO — entidades do diagrama (whiteboard 2):
 *   Financeiro { fcontas[] FK, pessoaFk, dataInicio, dataFim, dataPago, processoFk, id PK }
 *   FContas   { descricao, valor, data, pessoasFk[], pessoaResponsavelFk, id PK }
 */
import { dbFinancial, type FinancialTransaction } from '../../dbService';

export type { FinancialTransaction };

/** FConta — lançamento financeiro individual (diagrama: FCONTAS) */
export interface FConta {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  pessoaResponsavelFk: number;
  status: FinancialTransaction['status'];
}

const toFConta = (t: FinancialTransaction): FConta => ({
  id: t.id,
  descricao: t.description,
  valor: t.amount,
  data: t.date,
  pessoaResponsavelFk: t.lawyerId,
  status: t.status,
});

export const financeiroService = {
  getAll: (pessoaFk?: number) => dbFinancial.getAll(pessoaFk),
  getFContas: (pessoaFk?: number): FConta[] => dbFinancial.getAll(pessoaFk).map(toFConta),
  update: (id: string, changes: Partial<FinancialTransaction>) => dbFinancial.update(id, changes),
  /** total recebido no mês corrente para uma pessoa */
  receitaDoMes: (pessoaFk: number): number => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return dbFinancial.getAll(pessoaFk)
      .filter(t => t.status === 'recebido' && t.date.startsWith(key))
      .reduce((s, t) => s + t.amount, 0);
  },
  raw: dbFinancial,
};
