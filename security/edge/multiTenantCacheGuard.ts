/**
 * security/edge/multiTenantCacheGuard.ts — Legis Connect Multi-Tenant Cache Security
 * ─────────────────────────────────────────────────────────────────────────────
 * Garante o isolamento de cache entre diferentes inquilinos (tenants).
 * Previne ataques de Cache Poisoning e Cache Deception, assegurando que
 * dados confidenciais do Tenant A nunca sejam servidos ao Tenant B via cache de borda.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface CachePolicyEvaluation {
  cacheControl: string;
  isPrivate: boolean;
  isPublicCacheable: boolean;
  tenantPartitioned: boolean;
  varyHeader: string;
  auditCompliant: boolean;
  reason: string;
}

export class MultiTenantCacheGuard {
  /**
   * Avalia a rota, dados de autenticação e inquilino para gerar os cabeçalhos
   * de cache estritamente seguros para a borda e para o navegador.
   */
  public static evaluateCachePolicy(path: string, hasAuthOrTenant: boolean): CachePolicyEvaluation {
    const cleanPath = path.toLowerCase();

    // 1. Recursos estáticos públicos imutáveis (CSS, JS empacotado, fontes)
    const isPublicStatic = (
      cleanPath.startsWith('/assets/') ||
      cleanPath.endsWith('.js') ||
      cleanPath.endsWith('.css') ||
      cleanPath.endsWith('.woff2') ||
      cleanPath.endsWith('.png') ||
      cleanPath.endsWith('.ico')
    ) && !cleanPath.includes('/api/') && !cleanPath.includes('/admin');

    if (isPublicStatic && !hasAuthOrTenant) {
      return {
        cacheControl: 'public, max-age=31536000, immutable',
        isPrivate: false,
        isPublicCacheable: true,
        tenantPartitioned: false,
        varyHeader: 'Accept-Encoding',
        auditCompliant: true,
        reason: 'Recurso estático estritamente público e versionado.',
      };
    }

    // 2. Rotas autenticadas, APIs, endpoints administrativos ou com contexto de inquilino
    // MANDATO: Nunca permitir cache compartilhado em borda (Zero Cross-Tenant Leakage)
    return {
      cacheControl: 'private, no-cache, no-store, must-revalidate, max-age=0',
      isPrivate: true,
      isPublicCacheable: false,
      tenantPartitioned: true,
      varyHeader: 'Authorization, Cookie, X-Tenant-ID, Accept-Encoding',
      auditCompliant: true,
      reason: 'Dados dinâmicos / sensíveis com contexto de usuário ou tenant. Cache compartilhado proibido.',
    };
  }

  /**
   * Constrói chave de partição de cache segura.
   */
  public static buildPartitionedCacheKey(path: string, tenantId?: string, userId?: string): string {
    const t = tenantId || 'anonymous_tenant';
    const u = userId || 'anonymous_user';
    return t + ':' + u + ':' + path;
  }

  /**
   * Valida se uma combinação de cabeçalhos de resposta é segura contra vazamento de tenant.
   */
  public static validateResponseHeaders(headers: Record<string, string>): { safe: boolean; error?: string } {
    const cc = (headers['cache-control'] || headers['Cache-Control'] || '').toLowerCase();
    const isPublic = cc.includes('public');
    const isNoStore = cc.includes('no-store') || cc.includes('no-cache');

    if (isPublic && !isNoStore) {
      return {
        safe: false,
        error: 'Resposta contém Cache-Control: public em rota protegida, arriscando vazamento cross-tenant no CDN.',
      };
    }

    return { safe: true };
  }
}
