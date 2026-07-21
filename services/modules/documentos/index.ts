/**
 * Módulo DOCUMENTOS — entidades do diagrama (whiteboard 2):
 *   Documento { id PK, nome, descricao, tipo?, campos, url, data, pessoaFk }
 *   Tipos     { id PK, nome, data, tipoProcesso[] }
 *
 * Inclui o fluxo de AUTO-CLASSIFICAÇÃO (em vermelho no diagrama):
 *   cliente sobe doc → classifica documento via IA → extrai informações
 *   relevantes → preenche descrição e tipo → auto-preenchimento de campos
 *   (ex.: CNH → nome, tipo, data de nascimento, validade, número, espelho).
 */
import { dbDocuments, type ReceivedDocument } from '../../dbService';

export type { ReceivedDocument };

/** Tipos de documento (entidade TIPOS) — lista dinâmica baseada no processo */
export interface TipoDocumento {
  id: string;
  nome: string;
  data: string;
  tipoProcesso: string[];
  /** campos que o tipo exige (ex.: CNH → validade, número...) */
  campos: string[];
}

export const TIPOS_DOCUMENTO: TipoDocumento[] = [
  { id: 'cnh', nome: 'CNH', data: '2026-01-01', tipoProcesso: ['Cível', 'Trânsito'], campos: ['nome', 'tipo', 'dataNascimento', 'validade', 'numeroCnh', 'numEspelho'] },
  { id: 'rg', nome: 'RG', data: '2026-01-01', tipoProcesso: ['Cível', 'Criminal', 'Família'], campos: ['nome', 'numero', 'orgaoEmissor', 'dataExpedicao'] },
  { id: 'cpf', nome: 'CPF', data: '2026-01-01', tipoProcesso: ['Cível', 'Tributário'], campos: ['nome', 'numero'] },
  { id: 'contrato', nome: 'Contrato', data: '2026-01-01', tipoProcesso: ['Cível', 'Empresarial'], campos: ['partes', 'objeto', 'valor', 'vigencia'] },
  { id: 'procuracao', nome: 'Procuração', data: '2026-01-01', tipoProcesso: ['Todos'], campos: ['outorgante', 'outorgado', 'poderes', 'validade'] },
  { id: 'comprovante', nome: 'Comprovante de Residência', data: '2026-01-01', tipoProcesso: ['Todos'], campos: ['nome', 'endereco', 'dataEmissao'] },
];

export interface ClassificacaoResultado {
  tipo: TipoDocumento;
  descricao: string;
  /** campos extraídos automaticamente (auto-preenchimento) */
  campos: Record<string, string>;
  confianca: number;
}

/**
 * Classifica documento via IA (mock heurístico por nome de arquivo —
 * o pipeline real usa o CLI sobre o doc + lista de tipos baseada no processo).
 */
export function classificarDocumento(nomeArquivo: string): ClassificacaoResultado {
  const lower = nomeArquivo.toLowerCase();
  const tipo =
    TIPOS_DOCUMENTO.find(t => lower.includes(t.id) || lower.includes(t.nome.toLowerCase())) ??
    TIPOS_DOCUMENTO.find(t => t.id === 'contrato')!;
  return {
    tipo,
    descricao: `Documento classificado automaticamente como ${tipo.nome}.`,
    campos: Object.fromEntries(tipo.campos.map(c => [c, ''])),
    confianca: lower.includes(tipo.id) ? 0.95 : 0.6,
  };
}

export const documentosService = {
  getAll: (pessoaFk?: number) => dbDocuments.getAll(pessoaFk),
  add: (doc: ReceivedDocument) => dbDocuments.add(doc),
  remove: (id: string) => dbDocuments.remove(id),
  tipos: TIPOS_DOCUMENTO,
  classificar: classificarDocumento,
  raw: dbDocuments,
};
