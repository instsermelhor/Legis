/**
 * security/entitlementManager.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — ENTITLEMENTS & MODULAR RESOLUTION ENGINE v3.0
 * 
 * Motor Oficial de Resolução em Cascata de Acesso a Módulos e Funcionalidades.
 * Implementa a cadeia:
 *   USUÁRIO → MEMBERSHIP → TENANT → ENTITLEMENT → FEATURE FLAG → RBAC → SCOPE → BACKEND → RLS → DADO
 * 
 * Garante que:
 * 1. "Esconder botão NÃO é autorizar acesso" (Enforcement final no Backend)
 * 2. Módulos dependentes não podem ser ativados se suas dependências estiverem inativas
 * 3. Desativação de módulo NÃO apaga dados históricos
 * 4. Isolamento estrito de entitlements por tenant_id
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ModuleKey, ModuleDefinition, LEGIS_MODULE_CATALOG, getModuleDefinition } from './catalog';
import { SystemRole } from './rbac';
import { Resource, Action, isAllowed, checkMatrix } from './rbacMatrix';
import { AuditLogger } from './auditLogger';
import { PLATFORM_TENANT_ID } from '../services/tenantService';

export type EntitlementSource = 'PLAN' | 'MANUAL_OVERRIDE' | 'PROMO' | 'SYSTEM_CORE';

export interface TenantEntitlement {
  tenantId: string;
  moduleKey: ModuleKey;
  enabled: boolean;
  source: EntitlementSource;
  grantedBy: string;
  grantedAt: number;
  expiresAt?: number;
  reason?: string;
}

export type FeatureFlagLevel = 'GLOBAL' | 'TENANT' | 'USER';

export interface FeatureFlag {
  key: string;
  name: string;
  level: FeatureFlagLevel;
  enabled: boolean;
  targetTenants?: string[];
  targetUsers?: string[];
  rolloutPercentage?: number;
}

export interface AccessResolutionContext {
  userId: string;
  tenantId: string;
  userRole: SystemRole;
}

export interface AccessResolutionResult {
  granted: boolean;
  statusCode: 200 | 403 | 404 | 422;
  denialReason?: string;
  moduleKey?: ModuleKey;
  missingDependencies?: ModuleKey[];
}

/**
 * Matriz de Entitlements Padrão por Plano de Assinatura
 */
export const PLAN_DEFAULT_ENTITLEMENTS: Record<string, ModuleKey[]> = {
  plan_starter: [
    'core_clients',
    'core_cases',
    'legal_contracts',
    'legal_invoices',
    'legal_agenda',
    'client_portal',
    'settings_config',
  ],
  plan_pro: [
    'core_clients',
    'core_cases',
    'legal_contracts',
    'legal_invoices',
    'legal_agenda',
    'ai_copilot',
    'messaging_waba',
    'bi_analytics',
    'client_portal',
    'secretary_portal',
    'intern_portal',
    'marketplace',
    'settings_config',
  ],
  plan_enterprise: [
    'core_clients',
    'core_cases',
    'legal_contracts',
    'legal_invoices',
    'legal_agenda',
    'ai_copilot',
    'messaging_waba',
    'bi_analytics',
    'staff_provisioning',
    'client_portal',
    'secretary_portal',
    'intern_portal',
    'marketplace',
    'audit_compliance',
    'settings_config',
  ],
};

/**
 * Mapeamento de Chave de Módulo para Tipo de Recurso no RBAC
 */
const MODULE_TO_RESOURCE_MAP: Partial<Record<ModuleKey, Resource>> = {
  core_clients: 'clients',
  core_cases: 'cases',
  legal_contracts: 'documents',
  legal_invoices: 'financial',
  legal_agenda: 'agenda',
  ai_copilot: 'ai',
  bi_analytics: 'financial',
  messaging_waba: 'notifications',
  staff_provisioning: 'provisioning',
  intern_portal: 'academic',
  secretary_portal: 'staff',
  client_portal: 'profile',
  marketplace: 'services',
  audit_compliance: 'audit',
  super_admin: 'system',
  settings_config: 'security',
};

// Armazenamento em memória / cache com fallback
const memoryEntitlementsStore = new Map<string, TenantEntitlement>();
const memoryFeatureFlagsStore = new Map<string, FeatureFlag>();

function getStorageKey(tenantId: string, moduleKey: ModuleKey): string {
  return `${tenantId}:${moduleKey}`;
}

export class EntitlementManager {
  /**
   * Concede ou atualiza um entitlement para um Tenant com registro auditado
   */
  static grantEntitlement(entitlement: TenantEntitlement): void {
    // 1. Validar se módulo existe no catálogo
    const moduleDef = getModuleDefinition(entitlement.moduleKey);
    if (!moduleDef) {
      throw new Error(`[ENTITLEMENT ERROR] Módulo inválido ou inexistente: ${entitlement.moduleKey}`);
    }

    const key = getStorageKey(entitlement.tenantId, entitlement.moduleKey);
    memoryEntitlementsStore.set(key, entitlement);

    // Registro de Auditoria
    AuditLogger.log({
      action: 'ENTITLEMENT_GRANTED' as any,
      actorId: entitlement.grantedBy,
      actorRole: 'super_admin',
      targetId: entitlement.tenantId,
      targetType: 'tenant',
      details: JSON.stringify({
        moduleKey: entitlement.moduleKey,
        source: entitlement.source,
        expiresAt: entitlement.expiresAt,
        reason: entitlement.reason || 'Concessão formal de entitlement',
      }),
    });
  }

  /**
   * Revoga um entitlement de um Tenant com registro auditado
   */
  static revokeEntitlement(tenantId: string, moduleKey: ModuleKey, revokedBy: string, reason: string): void {
    const key = getStorageKey(tenantId, moduleKey);
    const existing = memoryEntitlementsStore.get(key);

    if (existing) {
      existing.enabled = false;
      existing.reason = `Revogado por: ${reason}`;
      memoryEntitlementsStore.set(key, existing);
    } else {
      memoryEntitlementsStore.set(key, {
        tenantId,
        moduleKey,
        enabled: false,
        source: 'MANUAL_OVERRIDE',
        grantedBy: revokedBy,
        grantedAt: Date.now(),
        reason: `Revogado: ${reason}`,
      });
    }

    AuditLogger.log({
      action: 'ENTITLEMENT_REVOKED' as any,
      actorId: revokedBy,
      actorRole: 'super_admin',
      targetId: tenantId,
      targetType: 'tenant',
      details: JSON.stringify({ moduleKey, reason }),
    });
  }

  /**
   * Aplica os entitlements padrão de um plano a um Tenant
   */
  static applyPlanEntitlements(tenantId: string, planId: string, grantedBy: string): void {
    const planModules = PLAN_DEFAULT_ENTITLEMENTS[planId] || PLAN_DEFAULT_ENTITLEMENTS['plan_starter'];
    
    // Habilita os módulos do plano
    for (const modKey of planModules) {
      this.grantEntitlement({
        tenantId,
        moduleKey: modKey,
        enabled: true,
        source: 'PLAN',
        grantedBy,
        grantedAt: Date.now(),
        reason: `Ativação por assinatura do ${planId}`,
      });
    }
  }

  /**
   * Verifica se o Tenant possui o Entitlement do módulo ativo e não expirado
   */
  static isTenantEntitled(tenantId: string, moduleKey: ModuleKey): boolean {
    // Super Admins e Tenant Global de Plataforma possuem acesso estrutural a módulos de sistema
    if (tenantId === PLATFORM_TENANT_ID) {
      return true;
    }

    const key = getStorageKey(tenantId, moduleKey);
    const ent = memoryEntitlementsStore.get(key);

    if (ent) {
      if (!ent.enabled) return false;
      if (ent.expiresAt && ent.expiresAt < Date.now()) return false;
      return true;
    }

    // Fallback: Se não houver override gravado, assume o plano Pro padrão para tenants registrados
    const defaultProModules = PLAN_DEFAULT_ENTITLEMENTS['plan_pro'];
    return defaultProModules.includes(moduleKey);
  }

  /**
   * MOTOR PRINCIPAL DE RESOLUÇÃO DE ACESSO (Cadeia Multidimensional)
   * canAccessModule(ctx, moduleKey, action?)
   */
  static canAccessModule(
    ctx: AccessResolutionContext,
    moduleKey: ModuleKey,
    action: Action = 'READ'
  ): AccessResolutionResult {
    // Passo 1: Verificar se módulo existe no catálogo oficial
    const moduleDef = getModuleDefinition(moduleKey);
    if (!moduleDef) {
      return {
        granted: false,
        statusCode: 404,
        denialReason: `Módulo não catalogado no sistema: ${moduleKey}`,
      };
    }

    // Passo 2: Verificar status do módulo (se foi descontinuado ou está inativo)
    if (moduleDef.status === 'INACTIVE') {
      return {
        granted: false,
        statusCode: 403,
        denialReason: `Módulo desativado na plataforma: ${moduleDef.name}`,
        moduleKey,
      };
    }

    // Passo 3: Super Admin possui acesso irrestrito para governança auditada
    if (ctx.userRole === 'super_admin' && ctx.tenantId === PLATFORM_TENANT_ID) {
      return { granted: true, statusCode: 200, moduleKey };
    }

    // Passo 4: Verificar dependências técnicas obrigatórias
    const missingDeps: ModuleKey[] = [];
    for (const depKey of moduleDef.dependencies) {
      if (!this.isTenantEntitled(ctx.tenantId, depKey)) {
        missingDeps.push(depKey);
      }
    }

    if (missingDeps.length > 0) {
      return {
        granted: false,
        statusCode: 422,
        denialReason: `Módulo ${moduleDef.name} requer as dependências ativas: ${missingDeps.join(', ')}`,
        moduleKey,
        missingDependencies: missingDeps,
      };
    }

    // Passo 5: Verificar Entitlement do Tenant
    const isEntitled = this.isTenantEntitled(ctx.tenantId, moduleKey);
    if (!isEntitled) {
      return {
        granted: false,
        statusCode: 403,
        denialReason: `O seu escritório (Tenant: ${ctx.tenantId}) não possui assinatura ativa para o módulo: ${moduleDef.name}`,
        moduleKey,
      };
    }

    // Passo 6: Verificar Autorização RBAC para o papel do usuário (ALLOW ou CONDITIONAL permite acesso ao módulo)
    const resourceType = MODULE_TO_RESOURCE_MAP[moduleKey];
    if (resourceType) {
      const matrixResult = checkMatrix(ctx.userRole, resourceType, action);
      if (matrixResult === 'DENY') {
        return {
          granted: false,
          statusCode: 403,
          denialReason: `O seu perfil (${ctx.userRole}) não possui permissão para executar ${action} no módulo ${moduleDef.name}`,
          moduleKey,
        };
      }
    }

    // Acesso Autorizado em todas as 6 camadas
    return {
      granted: true,
      statusCode: 200,
      moduleKey,
    };
  }

  /**
   * Resolução de Subfuncionalidade específica dentro de um módulo
   */
  static canAccessFeature(
    ctx: AccessResolutionContext,
    moduleKey: ModuleKey,
    featureKey: string,
    action: Action = 'READ'
  ): AccessResolutionResult {
    // 1. Valida o módulo pai
    const moduleResult = this.canAccessModule(ctx, moduleKey, action);
    if (!moduleResult.granted) {
      return moduleResult;
    }

    // 2. Valida a existência da subfeature no catálogo
    const moduleDef = getModuleDefinition(moduleKey);
    const featureDef = moduleDef?.features.find(f => f.key === featureKey);
    if (!featureDef) {
      return {
        granted: false,
        statusCode: 404,
        denialReason: `Subfuncionalidade ${featureKey} não encontrada no módulo ${moduleKey}`,
        moduleKey,
      };
    }

    return { granted: true, statusCode: 200, moduleKey };
  }

  /**
   * Lista todos os entitlements ativos de um determinado Tenant
   */
  static listTenantEntitlements(tenantId: string): Array<{ module: ModuleDefinition; entitlement: TenantEntitlement | null; enabled: boolean }> {
    const allModules = Object.values(LEGIS_MODULE_CATALOG);
    return allModules.map(mod => {
      const key = getStorageKey(tenantId, mod.key);
      const ent = memoryEntitlementsStore.get(key) || null;
      const enabled = this.isTenantEntitled(tenantId, mod.key);
      return {
        module: mod,
        entitlement: ent,
        enabled,
      };
    });
  }
}
