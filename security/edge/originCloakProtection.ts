/**
 * security/edge/originCloakProtection.ts — Legis Connect Origin Shield & Cloaking
 * ─────────────────────────────────────────────────────────────────────────────
 * Garante que a infraestrutura de origem (APIs, funções serverless e backend)
 * nunca seja acessada diretamente contornando o Edge / CDN / WAF.
 * Exige a presença de token criptográfico de borda: X-Legis-Edge-Secret.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { HttpRequestContext } from './wafEngine';

export interface OriginCloakValidation {
  valid: boolean;
  bypassed: boolean;
  statusCode: number;
  reason?: string;
  shieldHeaderPresent: boolean;
}

export class OriginCloakProtection {
  private static readonly EDGE_HEADER_NAME = 'x-legis-edge-secret';
  private static expectedSecret: string = process.env.LEGIS_EDGE_SECRET || 'LEGIS_ENTERPRISE_EDGE_DEFAULT_SECRET_2026';

  /**
   * Configura o segredo esperado (para ambientes dinâmicos e testes).
   */
  public static setExpectedSecret(secret: string): void {
    this.expectedSecret = secret;
  }

  /**
   * Valida se a requisição originou-se legitimamente da Borda (CDN/WAF).
   */
  public static validateOriginRequest(req: HttpRequestContext): OriginCloakValidation {
    const isTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

    const headerVal = req.headers[this.EDGE_HEADER_NAME] || req.headers[this.EDGE_HEADER_NAME.toLowerCase()];
    const providedSecret = Array.isArray(headerVal) ? headerVal[0] : headerVal;

    const hasShieldHeader = Boolean(providedSecret && providedSecret.trim().length > 0);

    // Se o segredo de borda for válido
    if (providedSecret === this.expectedSecret) {
      return {
        valid: true,
        bypassed: false,
        statusCode: 200,
        shieldHeaderPresent: true,
      };
    }

    // Em ambiente de teste/dev sem secret configurado
    if (isTest && !hasShieldHeader && process.env.ENFORCE_ORIGIN_CLOAK !== 'true') {
      return {
        valid: true,
        bypassed: true,
        statusCode: 200,
        reason: 'Ambiente de desenvolvimento/teste — bypass permitido.',
        shieldHeaderPresent: false,
      };
    }

    // Em produção ou com enforcement ativo, rejeitar requisições diretas
    return {
      valid: false,
      bypassed: false,
      statusCode: 403,
      reason: 'Acesso direto à origem proibido. Toda requisição deve transitar pelo Escudo de Borda (WAF/CDN).',
      shieldHeaderPresent: hasShieldHeader,
    };
  }

  /**
   * Retorna os headers que a borda deve injetar antes de encaminhar ao origin.
   */
  public static getEdgeForwardHeaders(): Record<string, string> {
    return {
      [this.EDGE_HEADER_NAME]: this.expectedSecret,
      'X-Edge-Protected-By': 'Legis-Connect-Enterprise-WAF-v3',
    };
  }
}
