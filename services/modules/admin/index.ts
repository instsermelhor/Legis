/**
 * Módulo ADMIN — métricas agregadas e gestão de contas do backoffice.
 */
import { api } from '../../api';

export interface MetricasAdmin {
  pessoas_por_tipo: Array<{ tipo: string; total: number; ativos: number }>;
  processos_por_status: Array<{ status: string; total: number }>;
  receita: { recebido: number; pendente: number };
  receita_por_mes: Array<{ mes: string; recebido: number }>;
  tenants: Array<{ id: number; nome: string; pessoas: number; processos: number }>;
  contratos_por_status: Array<{ status: string; total: number }>;
  contratos_por_servico: Array<{ servico_id: number; nome: string; total: number }>;
}

export interface PessoaAdmin {
  id: number;
  tipo: string;
  nome: string;
  email: string;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
  criado_em: string;
  tenant_id: number;
  tenant_nome: string;
}

export interface AdvogadoAdmin extends PessoaAdmin {
  oab: string;
  especialidades: string[];
  bio: string | null;
  foto_url: string | null;
  status: 'pendente' | 'verificado' | 'rejeitado';
}

export interface LeadAdmin {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  criado_em: string;
  servico_nome: string | null;
}

export const adminService = {
  metricas: () => api.get<MetricasAdmin>('/admin/metricas'),
  pessoas: (tipo?: string) => api.get<PessoaAdmin[]>(`/admin/pessoas${tipo ? `?tipo=${tipo}` : ''}`),
  advogados: () => api.get<AdvogadoAdmin[]>('/admin/advogados'),
  leads: () => api.get<LeadAdmin[]>('/admin/leads'),
  definirAtivo: (id: number, ativo: boolean) => api.put(`/admin/pessoas/${id}/ativo`, { ativo }),
  criarAdmin: (dados: { nome: string; email: string; senha: string }) => api.post('/admin/admins', dados),
  redefinirSenha: (id: number, senha: string) => api.put(`/admin/pessoas/${id}/senha`, { senha }),
  /** Modo Espelho: sessão real em nome da pessoa (token de 1h). */
  impersonar: (pessoaId: number) => api.post<{ token: string; pessoa: unknown }>('/admin/impersonar', { pessoa_id: pessoaId }),
};
