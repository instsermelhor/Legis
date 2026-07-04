/**
 * Módulo PESSOAS — entidade central do diagrama (whiteboard 1).
 * Pessoa → { cliente, advogado, bacharel/estagiário, secretário/assistente }
 * ADVOGADO N—CONTRATO N—PESSOA; integrações via chaves de API.
 *
 * Fachada única sobre os data-services existentes; quando o backend real
 * (Postgres em servidor mini via SSH/Azure) entrar, apenas este módulo muda.
 */
import { mockLawyers } from '../../mockLawyerService';
import { mockClients, mockInterns, mockAdminUsers } from '../../mockDataService';
import { StaffService } from '../../staffService';

export type TipoPessoa = 'cliente' | 'advogado' | 'bacharel' | 'secretario' | 'admin';

export const pessoasService = {
  /** Advogados (entidade Advogado do diagrama) */
  advogados: {
    getAll: () => mockLawyers,
    getById: (id: number) => mockLawyers.find(l => l.id === id) ?? null,
    getVerificados: () => mockLawyers.filter(l => l.status === 'verificado'),
  },

  /** Clientes */
  clientes: {
    getAll: () => mockClients,
  },

  /** Bacharelandos / estagiários */
  bachareis: {
    getAll: () => mockInterns,
    getBySupervisor: (lawyerId: number) => mockInterns.filter(i => i.supervisorLawyerId === lawyerId),
  },

  /** Equipe interna / administradores (RBAC) */
  equipe: {
    staff: StaffService,
    admins: () => mockAdminUsers,
  },
};
