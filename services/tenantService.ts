/**
 * services/tenantService.ts
 * Servidor e Gerenciador Central de Multi-Tenancy para o Legis Connect.
 * 
 * Implementa:
 *  - Resolução segura de Tenant Context por usuário/sessão
 *  - Registro de Tenants (Escritórios / Organizações / Autônomos)
 *  - Mapeamento de Memberships (User <-> Tenant)
 *  - Validação estrita de isolamento cross-tenant (Assertion Guards)
 *  - Sanitização e mascaramento de dados confidenciais
 */

import type { Tenant, TenantMembership, User } from '../types';

export const PLATFORM_TENANT_ID = 'tenant_platform_global';
export const DEFAULT_TENANT_ID = 'tenant_lawfirm_alpha';

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'tenant_lawfirm_alpha',
    name: 'Silva & Advogados Associados',
    code: 'FIRM_ALPHA',
    cnpj: '12.345.678/0001-90',
    type: 'escritorio',
    status: 'ativo',
    createdAt: '2024-01-01T00:00:00Z',
    ownerUserId: 'lawyer_1'
  },
  {
    id: 'tenant_lawfirm_beta',
    name: 'Ferreira & Mendes Advocacia',
    code: 'FIRM_BETA',
    cnpj: '98.765.432/0001-10',
    type: 'escritorio',
    status: 'ativo',
    createdAt: '2024-02-01T00:00:00Z',
    ownerUserId: 'lawyer_2'
  },
  {
    id: 'tenant_independent_gamma',
    name: 'Dra. Carla Mendes — Advocacia Autônoma',
    code: 'SOLO_GAMMA',
    cnpj: '45.678.910/0001-55',
    type: 'autonomo',
    status: 'ativo',
    createdAt: '2024-03-01T00:00:00Z',
    ownerUserId: 'lawyer_3'
  }
];

export const MOCK_MEMBERSHIPS: TenantMembership[] = [
  { id: 'm1', tenantId: 'tenant_lawfirm_alpha', userId: '1', role: 'lawyer', scope: 'office', status: 'ativo', joinedAt: '2024-01-15' },
  { id: 'm2', tenantId: 'tenant_lawfirm_beta', userId: '2', role: 'lawyer', scope: 'office', status: 'ativo', joinedAt: '2024-02-01' },
  { id: 'm3', tenantId: 'tenant_independent_gamma', userId: '3', role: 'lawyer', scope: 'individual', status: 'ativo', joinedAt: '2024-03-01' },
  { id: 'm4', tenantId: 'tenant_lawfirm_alpha', userId: 'intern_1', role: 'intern', scope: 'team', status: 'ativo', joinedAt: '2024-01-20' },
  { id: 'm5', tenantId: 'tenant_lawfirm_alpha', userId: 'secretary_1', role: 'secretary', scope: 'office', status: 'ativo', joinedAt: '2024-01-25' },
];

export class TenantService {
  /**
   * Resolve o tenantId primário para um usuário autenticado.
   * Não aceita tenantId arbitrário vindo do client sem validação de pertencimento.
   */
  public static resolveTenantId(user: User | null): string {
    if (!user) return DEFAULT_TENANT_ID;

    // Super Admins e Admins Globais operam com o Tenant da Plataforma
    if (user.role === 'super_admin' || user.role === 'admin') {
      return PLATFORM_TENANT_ID;
    }

    // Se o usuário possui um tenantId explicitamente validado
    if (user.tenantId) {
      return user.tenantId;
    }

    // Mapeamento por ID de usuário em memberships
    if (user.id) {
      const membership = MOCK_MEMBERSHIPS.find(m => m.userId === String(user.id) && m.status === 'ativo');
      if (membership) {
        return membership.tenantId;
      }
    }

    // Mapeamento fallback por e-mail ou dados
    if (user.email) {
      if (user.email.includes('bruno') || user.email.includes('ferreira')) return 'tenant_lawfirm_beta';
      if (user.email.includes('carla') || user.email.includes('mendes')) return 'tenant_independent_gamma';
    }

    return DEFAULT_TENANT_ID;
  }

  /**
   * Valida se o usuário tem permissão para acessar o tenant de destino.
   * Lança exceção de segurança se o acesso for cross-tenant não autorizado.
   */
  public static assertTenantAccess(requesterTenantId: string, resourceTenantId?: string): void {
    // Se o recurso não tem tenant especificado ou o solicitante é Super Admin da Plataforma, permite
    if (!resourceTenantId || requesterTenantId === PLATFORM_TENANT_ID) {
      return;
    }

    if (requesterTenantId !== resourceTenantId) {
      console.error(`[SECURITY ALERT] Tentativa de Acesso Cross-Tenant Bloqueada! Solicitante: ${requesterTenantId} | Recurso: ${resourceTenantId}`);
      throw new Error(`[SECURITY DENIED] Acesso negado: o recurso pertence a outro tenant (${resourceTenantId}).`);
    }
  }

  /**
   * Garante que uma entidade criada ou alterada receba obrigatoriamente o tenantId do contexto ativo.
   */
  public static enforceTenantScope<T extends { tenantId?: string }>(data: T, activeTenantId: string): T & { tenantId: string } {
    return {
      ...data,
      tenantId: activeTenantId
    };
  }

  /**
   * Filtra uma coleção de itens por tenantId.
   */
  public static filterByTenant<T extends { tenantId?: string }>(items: T[], activeTenantId: string): T[] {
    if (activeTenantId === PLATFORM_TENANT_ID) {
      return items; // Super Admin visualiza todos
    }
    return items.filter(item => !item.tenantId || item.tenantId === activeTenantId);
  }

  /**
   * Mascara CPF para evitar vazamento inadvertido de PII (LGPD compliance)
   */
  public static maskCpf(cpf?: string): string {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return '***.***.***-**';
    return `${cleaned.slice(0, 3)}.***.***-${cleaned.slice(9)}`;
  }
}
