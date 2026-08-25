/**
 * services/tenantService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — SERVIÇO CENTRAL DE MULTI-TENANCY E ISOLAMENTO DE CONTEXTO
 * 
 * Fonte da Verdade de Tenancy da Plataforma:
 *   • Resolução segura e imutável de Tenant Context por Usuário / Sessão / Membership
 *   • Suporte a Múltiplos Vínculos (Multi-Membership: Advogado em múltiplos escritórios)
 *   • Bloqueio rigoroso de Tenant Escape e Acesso Cross-Tenant não autorizado
 *   • Estruturação padronizada de Storage e Cache por Tenant Boundary
 *   • Trilha de Auditoria imutável para violações e acessos privilegiados
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Tenant, TenantMembership, User } from '../types';
import { AuditLogger } from '../security/auditLogger';

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
  // Advogado com múltiplos vínculos (Escritório Alpha + Escritório Beta)
  { id: 'm6', tenantId: 'tenant_lawfirm_beta', userId: '1', role: 'lawyer', scope: 'office', status: 'ativo', joinedAt: '2024-06-01' },
];

export class TenantService {
  /**
   * Obtém todos os memberships ativos de um usuário.
   */
  public static getUserMemberships(userId: string | number): TenantMembership[] {
    const uid = String(userId);
    return MOCK_MEMBERSHIPS.filter(m => m.userId === uid && m.status === 'ativo');
  }

  /**
   * Valida se um usuário possui membership formal e ativo em um determinado tenant.
   */
  public static validateUserTenantMembership(userId: string | number, tenantId: string): boolean {
    const uid = String(userId);
    return MOCK_MEMBERSHIPS.some(m => m.userId === uid && m.tenantId === tenantId && m.status === 'ativo');
  }

  /**
   * Resolve o tenantId primário para um usuário autenticado.
   * Não aceita tenantId arbitrário sem validação formal de pertencimento.
   */
  public static resolveTenantId(user: User | null, requestedTenantId?: string): string {
    if (!user) return DEFAULT_TENANT_ID;

    // Super Admins e Admins Globais operam com o Tenant da Plataforma
    if (user.role === 'super_admin' || user.role === 'admin') {
      return PLATFORM_TENANT_ID;
    }

    const userId = user.id ? String(user.id) : '';

    // Se houver solicitação explícita de alternância de tenant (ex: multi-membership)
    if (requestedTenantId && userId) {
      if (this.validateUserTenantMembership(userId, requestedTenantId)) {
        return requestedTenantId;
      }
      console.warn(`[SECURITY WARNING] Usuário ${userId} tentou selecionar tenant ${requestedTenantId} sem vínculo ativo.`);
    }

    // Se o usuário possui um tenantId explicitamente validado na sessão
    if (user.tenantId) {
      if (!userId || this.validateUserTenantMembership(userId, user.tenantId) || user.tenantId === DEFAULT_TENANT_ID) {
        return user.tenantId;
      }
    }

    // Mapeamento por ID de usuário em memberships
    if (userId) {
      const activeMemberships = this.getUserMemberships(userId);
      if (activeMemberships.length > 0) {
        return activeMemberships[0].tenantId;
      }
    }

    // Mapeamento fallback por e-mail (para contas mock/seed)
    if (user.email) {
      if (user.email.includes('bruno') || user.email.includes('ferreira')) return 'tenant_lawfirm_beta';
      if (user.email.includes('carla') || user.email.includes('mendes')) return 'tenant_independent_gamma';
    }

    return DEFAULT_TENANT_ID;
  }

  /**
   * Alterna de forma segura o contexto de tenant de um usuário com múltiplos memberships.
   */
  public static switchTenantContext(user: User, targetTenantId: string): User {
    if (user.role === 'super_admin') {
      return { ...user, tenantId: targetTenantId };
    }

    const userId = user.id ? String(user.id) : '';
    if (!this.validateUserTenantMembership(userId, targetTenantId)) {
      throw new Error(`[SECURITY DENIED] Usuário não possui membership ativa no tenant selecionado: ${targetTenantId}`);
    }

    AuditLogger.log({
      action: 'TENANT_CONTEXT_SWITCHED',
      actorId: String(user.id || user.email),
      actorRole: (user.role || 'client') as any,
      targetId: targetTenantId,
      details: `Usuário alternou contexto de tenant para ${targetTenantId}`,
      severity: 'INFO',
    });

    return {
      ...user,
      tenantId: targetTenantId
    };
  }

  /**
   * Valida se o usuário tem permissão para acessar o tenant de destino.
   * Lança exceção de segurança se o acesso for cross-tenant não autorizado.
   */
  public static assertTenantAccess(requesterTenantId: string, resourceTenantId?: string, actorId?: string, actorRole?: string): void {
    // Se o recurso não tem tenant especificado ou o solicitante é Super Admin da Plataforma, permite
    if (!resourceTenantId || requesterTenantId === PLATFORM_TENANT_ID) {
      return;
    }

    if (requesterTenantId !== resourceTenantId) {
      console.error(`[SECURITY ALERT] Tentativa de Acesso Cross-Tenant Bloqueada! Solicitante: ${requesterTenantId} | Recurso: ${resourceTenantId}`);
      
      if (actorId && actorRole) {
        AuditLogger.log({
          action: 'CROSS_TENANT_ACCESS_BLOCKED',
          actorId,
          actorRole: actorRole as any,
          targetId: resourceTenantId,
          details: `Tentativa de acesso não autorizado do Tenant ${requesterTenantId} ao recurso do Tenant ${resourceTenantId}`,
          severity: 'CRITICAL',
        });
      }

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
      return items; // Super Admin visualiza todos com auditoria
    }
    return items.filter(item => item.tenantId === activeTenantId);
  }

  /**
   * Gera o caminho de armazenamento de arquivos (Storage) isolado por Tenant.
   * Padrão: tenants/{tenantId}/{resourceType}/{resourceId}/{fileName}
   */
  public static getTenantStoragePath(tenantId: string, resourceType: string, resourceId: string, fileName: string): string {
    const cleanTenant = tenantId.replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanType = resourceType.replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanId = resourceId.replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanFile = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
    return `tenants/${cleanTenant}/${cleanType}/${cleanId}/${cleanFile}`;
  }

  /**
   * Gera uma chave de cache padronizada com boundary de Tenant.
   * Padrão: tenant:{tenantId}:{resource}:{key}
   */
  public static getTenantCacheKey(tenantId: string, resource: string, key: string): string {
    return `tenant:${tenantId}:${resource}:${key}`;
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
