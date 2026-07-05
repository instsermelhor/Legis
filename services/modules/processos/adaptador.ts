/**
 * Adaptador: ProcessoApi → forma legada `Processo` consumida pela Gestão
 * Jurídica e pelo KPI financeiro (id_processo, departamento, gestor...).
 * Mantém os componentes grandes intactos enquanto os dados vêm do banco.
 */
import type { ProcessoApi } from './index';

export interface ProcessoLegado {
  id_processo: number;
  departamento: string;
  advogado: string;
  gestor: string;
  data_entrada: string;
  data_conclusao?: string | null;
  status: 'Em Andamento' | 'Concluído' | 'Aguardando Documentação';
  valor: number;
  tempo: number;
  numero?: string;
  clientName?: string;
  clientCpf?: string;
}

const soData = (iso: string | null | undefined) => (iso ? iso.split('T')[0] : iso ?? null);

export function calcularTempo(dataEntrada: string, dataConclusao?: string | null): number {
  const inicio = new Date(dataEntrada).getTime();
  const fim = dataConclusao ? new Date(dataConclusao).getTime() : Date.now();
  return Math.max(0, Math.round((fim - inicio) / 86_400_000));
}

export function processoParaLegado(p: ProcessoApi): ProcessoLegado {
  const entrada = soData(p.data_entrada)!;
  const conclusao = soData(p.data_conclusao);
  return {
    id_processo: p.id,
    numero: p.numero,
    departamento: p.tipo_processo ?? 'Geral',
    advogado: p.advogado_nome,
    gestor: p.advogado_nome, // gestor = advogado responsável, até existir papel próprio
    data_entrada: entrada,
    data_conclusao: conclusao,
    status: (p.status === 'Arquivado' ? 'Concluído' : p.status) as ProcessoLegado['status'],
    valor: p.valor_causa ?? 0,
    tempo: calcularTempo(entrada, conclusao),
    clientName: p.cliente_nome ?? undefined,
  };
}
