/**
 * security/edge/threatIntelligence.ts — Legis Connect Threat Intelligence & IP Reputation
 * ─────────────────────────────────────────────────────────────────────────────
 * Gerencia inteligência de ameaças, listas de reputação de IP (Denylist / Allowlist)
 * e conformidade de governança com expiração mandatória.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ThreatAssessment {
  ip: string;
  isThreat: boolean;
  isAllowlisted: boolean;
  action: 'ALLOW' | 'BLOCK' | 'FLAG_FOR_MONITORING';
  category?: string;
  reason?: string;
  responsible?: string;
  expiresAt?: string;
}

export interface ReputationEntry {
  ipOrCidr: string;
  reason: string;
  category: string;
  responsible: string;
  addedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface GovernanceData {
  version: string;
  lastUpdated: string;
  governancePolicy: string;
  denylist: ReputationEntry[];
  allowlist: ReputationEntry[];
}

export class ThreatIntelligence {
  private static denylist = new Map<string, ReputationEntry>();
  private static allowlist = new Map<string, ReputationEntry>();
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;

    try {
      const govPath = path.resolve(process.cwd(), 'security/edge/ip-reputation-governance.json');
      if (fs.existsSync(govPath)) {
        const raw = fs.readFileSync(govPath, 'utf-8');
        const data: GovernanceData = JSON.parse(raw);

        const now = Date.now();

        if (Array.isArray(data.denylist)) {
          data.denylist.forEach(item => {
            const exp = new Date(item.expiresAt).getTime();
            if (item.status === 'ACTIVE' && exp > now) {
              this.denylist.set(item.ipOrCidr, item);
            }
          });
        }

        if (Array.isArray(data.allowlist)) {
          data.allowlist.forEach(item => {
            const exp = new Date(item.expiresAt).getTime();
            if (item.status === 'ACTIVE' && exp > now) {
              this.allowlist.set(item.ipOrCidr, item);
            }
          });
        }
      }
    } catch {
      // Fallback gracioso
    }

    this.initialized = true;
  }

  /**
   * Avalia a reputação de um IP contra as bases de inteligência e listas governadas.
   */
  public static checkIpReputation(ip: string): ThreatAssessment {
    this.initialize();

    const cleanIp = (ip || '0.0.0.0').trim();

    // 1. Checar Allowlist primeiro (Ex: localhost, CDNs confiáveis, probes internas)
    const allowed = this.allowlist.get(cleanIp);
    if (allowed) {
      return {
        ip: cleanIp,
        isThreat: false,
        isAllowlisted: true,
        action: 'ALLOW',
        category: allowed.category,
        reason: 'IP presente na lista de permissões autorizadas: ' + allowed.reason,
        responsible: allowed.responsible,
        expiresAt: allowed.expiresAt,
      };
    }

    // 2. Checar Denylist (IPs maliciosos conhecidos, scanners, ataques ativos)
    const blocked = this.denylist.get(cleanIp);
    if (blocked) {
      return {
        ip: cleanIp,
        isThreat: true,
        isAllowlisted: false,
        action: 'BLOCK',
        category: blocked.category,
        reason: 'IP bloqueado por inteligência de ameaças: ' + blocked.reason,
        responsible: blocked.responsible,
        expiresAt: blocked.expiresAt,
      };
    }

    // 3. IP Neutro / Não listado
    return {
      ip: cleanIp,
      isThreat: false,
      isAllowlisted: false,
      action: 'ALLOW',
      reason: 'IP sem registros adversos na base de inteligência de ameaças.',
    };
  }

  /**
   * Adiciona um IP à denylist em memória com governança.
   */
  public static blockIp(entry: ReputationEntry): void {
    this.initialize();
    this.denylist.set(entry.ipOrCidr, entry);
  }

  /**
   * Adiciona um IP à allowlist em memória com governança.
   */
  public static allowIp(entry: ReputationEntry): void {
    this.initialize();
    this.allowlist.set(entry.ipOrCidr, entry);
  }

  /**
   * Limpa as listas em memória (para testes).
   */
  public static clearAll(): void {
    this.denylist.clear();
    this.allowlist.clear();
    this.initialized = false;
  }
}
