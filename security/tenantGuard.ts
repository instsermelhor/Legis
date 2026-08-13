/**
 * security/tenantGuard.ts
 * Guardião de Segurança de Tenancy e Isolamento de Recursos.
 * 
 * Fornece validações de tempo de execução (guards) para garantir que nenhuma operação
 * de consulta, atualização ou exclusão interaja com dados de outros tenants sem autorização.
 */

import { TenantService, PLATFORM_TENANT_ID } from '../services/tenantService';
import type { User } from '../types';

export interface SecurityTenantContext {
  userId: string;
  role: string;
  tenantId: string;
  firmId?: string;
}

export class TenantGuard {
  /**
   * Valida se a requisição possui autorização explícita sobre o tenant do recurso.
   */
  public static validateResourceOwnership(
    ctx: SecurityTenantContext,
    resourceOwnerUserId?: string | number,
    resourceTenantId?: string
  ): boolean {
    // 1. Super Admins possuem acesso auditado a qualquer tenant
    if (ctx.role === 'super_admin' || ctx.tenantId === PLATFORM_TENANT_ID) {
      return true;
    }

    // 2. Se houver tenantId no recurso, deve ser idêntico ao do solicitante
    if (resourceTenantId && resourceTenantId !== ctx.tenantId) {
      return false;
    }

    // 3. Se for uma operação individual de cliente ou estagiário, o userId deve coincidir ou ter vinculo
    if (resourceOwnerUserId && ctx.role === 'client' && String(resourceOwnerUserId) !== String(ctx.userId)) {
      return false;
    }

    return true;
  }

  /**
   * Assegura acesso ou lança erro HTTP 403 / Security Exception
   */
  public static enforce(
    ctx: SecurityTenantContext,
    resourceOwnerUserId?: string | number,
    resourceTenantId?: string,
    actionName: string = 'recurso'
  ): void {
    if (!this.validateResourceOwnership(ctx, resourceOwnerUserId, resourceTenantId)) {
      throw new Error(`[403 FORBIDDEN] Ação não autorizada no ${actionName}. Violação de isolamento por tenant ou ownership.`);
    }
  }
}
