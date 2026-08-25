/**
 * security/tenantGuard.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — GUARDIÃO DE TENANCY E ISOLAMENTO DE RECURSOS
 * 
 * Fornece validações de tempo de execução (guards) para garantir que nenhuma operação
 * de consulta, inserção, atualização ou exclusão interaja com dados de outros tenants
 * sem autorização formal e explícita.
 * 
 * Princípio: Defense in Depth (Camada de Aplicação + RLS no Banco)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { TenantService, PLATFORM_TENANT_ID } from '../services/tenantService';
import { AuditLogger } from './auditLogger';

export interface SecurityTenantContext {
  userId: string;
  role: string;
  tenantId: string;
  firmId?: string;
  officeId?: string;
}

export class TenantGuard {
  /**
   * Valida se a requisição possui autorização explícita sobre o tenant e ownership do recurso.
   */
  public static validateResourceOwnership(
    ctx: SecurityTenantContext,
    resourceOwnerUserId?: string | number,
    resourceTenantId?: string,
    resourceOfficeId?: string
  ): boolean {
    // 1. Super Admins possuem acesso auditado global
    if (ctx.role === 'super_admin' || ctx.tenantId === PLATFORM_TENANT_ID) {
      return true;
    }

    // 2. Isolamento Estrito de Tenant: se o recurso tem tenantId, deve coincidir exatamente
    if (resourceTenantId && resourceTenantId !== ctx.tenantId) {
      return false;
    }

    // 3. Isolamento de Escritório (Office) quando aplicável
    if (resourceOfficeId && ctx.officeId && resourceOfficeId !== ctx.officeId && !['super_admin', 'admin'].includes(ctx.role)) {
      return false;
    }

    // 4. Se for operação individual de cliente ou estagiário, o userId deve coincidir com o dono
    if (resourceOwnerUserId && ctx.role === 'client' && String(resourceOwnerUserId) !== String(ctx.userId)) {
      return false;
    }

    return true;
  }

  /**
   * Assegura acesso ou lança erro HTTP 403 / Security Exception com log de auditoria compulsório.
   */
  public static enforce(
    ctx: SecurityTenantContext,
    resourceOwnerUserId?: string | number,
    resourceTenantId?: string,
    resourceOfficeId?: string,
    actionName: string = 'recurso'
  ): void {
    if (!this.validateResourceOwnership(ctx, resourceOwnerUserId, resourceTenantId, resourceOfficeId)) {
      AuditLogger.log({
        action: 'TENANT_VIOLATION_BLOCKED',
        actorId: ctx.userId,
        actorRole: ctx.role,
        targetId: resourceTenantId || String(resourceOwnerUserId || 'unknown'),
        details: `Violação de isolamento bloqueada no ${actionName}. Solicitante Tenant: ${ctx.tenantId} | Alvo Tenant: ${resourceTenantId}`,
        severity: 'CRITICAL',
      });

      throw new Error(`[403 FORBIDDEN] Ação não autorizada no ${actionName}. Violação de isolamento por tenant ou ownership.`);
    }
  }
}
