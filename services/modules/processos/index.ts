/**
 * Módulo PROCESSOS — entidade Processo do diagrama (whiteboard 2):
 *   numero (PK), nome, documentos[] (nome, url azure, descrição, tipo, campos),
 *   documentoRequerido[], financeiroFk, pessoaFk, tipoProcesso.
 * Frontend consome: nome, número, financeiro (forma, data, valor).
 */
import { mockProcessosService, calcularTempo, type Processo } from '../../mockProcessosService';

export type { Processo };
export { calcularTempo };

export const processosService = {
  getAll: () => mockProcessosService.getProcessos(),
  getByAdvogado: (nomeAdvogado: string) =>
    mockProcessosService.getProcessos().filter(p => p.advogado === nomeAdvogado),
  getByNumero: (numero: string) =>
    mockProcessosService.getProcessos().find(p => p.numero === numero) ?? null,
  /** acesso completo ao service legado enquanto a migração avança */
  raw: mockProcessosService,
};
