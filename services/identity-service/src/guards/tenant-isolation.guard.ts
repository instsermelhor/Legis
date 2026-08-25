import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantIsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role;
    const userTenantId = request.user?.tenantId;
    const targetTenantId = request.headers['x-tenant-id'] || request.params?.tenantId;

    // Super Administrador tem acesso a todos os tenants (com auditoria obrigatória)
    if (userRole === 'super_admin') {
      return true;
    }

    if (!userTenantId || userTenantId !== targetTenantId) {
      throw new ForbiddenException('Acesso negado: Tentativa de violação de limite multi-tenant');
    }
    return true;
  }
}
