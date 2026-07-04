/**
 * Módulo DOCUMENTOS — CRUD real via API (upload em base64 → arquivo no
 * servidor, servido em /uploads) + tipos com campos de auto-preenchimento.
 *
 * NOTA: a CLASSIFICAÇÃO VIA IA é um fluxo à parte (não implementado aqui,
 * por decisão do produto). `classificarDocumento` abaixo é apenas o ponto
 * de integração: preencha `tipo_id`, `descricao` e `campos` e persista com
 * `documentosService.atualizar`.
 */
import { api } from '../../api';

export interface DocumentoTipoApi {
  id: number;
  nome: string;
  campos: string[];
}

export interface DocumentoApi {
  id: number;
  nome: string;
  descricao: string | null;
  tipo_id: number | null;
  tipo_nome?: string | null;
  campos: Record<string, string>;
  url: string | null;
  data: string;
  pessoa_id: number | null;
  processo_id: number | null;
}

export const documentosService = {
  tipos: () => api.get<DocumentoTipoApi[]>('/documento-tipos'),

  listar: (filtro?: { processo_id?: number; pessoa_id?: number }) => {
    const query = new URLSearchParams(
      Object.entries(filtro ?? {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    ).toString();
    return api.get<DocumentoApi[]>(`/documentos${query ? `?${query}` : ''}`);
  },

  /** Envia o documento; `conteudoBase64` grava o arquivo real no servidor. */
  enviar: (dados: { nome: string; descricao?: string; tipo_id?: number; processo_id?: number; conteudoBase64?: string }) =>
    api.post<DocumentoApi>('/documentos', {
      nome: dados.nome,
      descricao: dados.descricao,
      tipo_id: dados.tipo_id,
      processo_id: dados.processo_id,
      conteudo_base64: dados.conteudoBase64,
    }),

  /** Persiste classificação/campos (o preenchimento via IA é fluxo externo). */
  atualizar: (id: number, dados: { descricao?: string; tipo_id?: number; campos?: Record<string, string> }) =>
    api.put<DocumentoApi>(`/documentos/${id}`, dados),

  remover: (id: number) => api.delete<{ ok: true }>(`/documentos/${id}`),
};

/**
 * PONTO DE INTEGRAÇÃO DA IA — implementação fica a cargo do fluxo de
 * classificação (externo). Não implementar aqui.
 */
export function classificarDocumento(_nomeArquivo: string): never {
  throw new Error('Classificação de documentos via IA é um fluxo externo — integre aqui.');
}
