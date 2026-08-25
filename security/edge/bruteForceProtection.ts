/**
 * security/edge/bruteForceProtection.ts — Legis Connect Anti-Brute Force & Credential Stuffing
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor de defesa na borda contra ataques de força bruta, credential stuffing
 * e password spraying. Implementa degradação progressiva de acesso:
 * ALLOW ➔ THROTTLE (Atraso artificial) ➔ CHALLENGE (MFA/Captcha) ➔ BLOCK.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type DefenseTier = 'ALLOW' | 'THROTTLE' | 'CHALLENGE' | 'BLOCK';

export interface BruteForceAssessment {
  tier: DefenseTier;
  blocked: boolean;
  challenged: boolean;
  throttled: boolean;
  artificialDelayMs: number;
  remainingAttempts: number;
  blockExpiresAt?: string;
  reason: string;
  isPasswordSpraying: boolean;
  isCredentialStuffing: boolean;
}

interface AttemptRecord {
  failedAttempts: number;
  firstFailedTs: number;
  lastFailedTs: number;
  targetAccounts: Set<string>;
  blockedUntilTs?: number;
}

export class BruteForceProtection {
  private static readonly WINDOW_MS = 15 * 60 * 1000; // Janela de 15 minutos
  private static readonly BLOCK_DURATION_MS = 15 * 60 * 1000; // Bloqueio de 15 minutos

  private static ipRecords = new Map<string, AttemptRecord>();
  private static accountRecords = new Map<string, AttemptRecord>();

  /**
   * Avalia o status de um IP / conta antes de processar a autenticação.
   */
  public static evaluateRequest(ip: string, accountIdentifier?: string): BruteForceAssessment {
    const now = Date.now();
    const cleanIp = ip || '0.0.0.0';
    const ipRecord = this.getCleanRecord(this.ipRecords, cleanIp, now);

    // 1. Verificar se o IP está ativamente bloqueado
    if (ipRecord.blockedUntilTs && ipRecord.blockedUntilTs > now) {
      const remainingSeconds = Math.ceil((ipRecord.blockedUntilTs - now) / 1000);
      return {
        tier: 'BLOCK',
        blocked: true,
        challenged: false,
        throttled: false,
        artificialDelayMs: 0,
        remainingAttempts: 0,
        blockExpiresAt: new Date(ipRecord.blockedUntilTs).toISOString(),
        reason: 'IP bloqueado temporariamente por excesso de falhas. Tente em ' + remainingSeconds + 's.',
        isPasswordSpraying: ipRecord.targetAccounts.size >= 3,
        isCredentialStuffing: ipRecord.targetAccounts.size >= 5,
      };
    }

    // 2. Verificar conta individual se fornecida
    if (accountIdentifier) {
      const cleanAcc = accountIdentifier.toLowerCase().trim();
      const accRecord = this.getCleanRecord(this.accountRecords, cleanAcc, now);

      if (accRecord.blockedUntilTs && accRecord.blockedUntilTs > now) {
        return {
          tier: 'CHALLENGE',
          blocked: false,
          challenged: true,
          throttled: true,
          artificialDelayMs: 1500,
          remainingAttempts: 0,
          reason: 'Conta temporariamente protegida por múltiplas tentativas incorretas. Desafio MFA requerido.',
          isPasswordSpraying: false,
          isCredentialStuffing: false,
        };
      }
    }

    // 3. Avaliar progressão por contagem de falhas do IP
    const fails = ipRecord.failedAttempts;
    const isSpraying = ipRecord.targetAccounts.size >= 3;

    if (fails >= 10 || (isSpraying && fails >= 6)) {
      ipRecord.blockedUntilTs = now + this.BLOCK_DURATION_MS;
      return {
        tier: 'BLOCK',
        blocked: true,
        challenged: false,
        throttled: false,
        artificialDelayMs: 0,
        remainingAttempts: 0,
        blockExpiresAt: new Date(ipRecord.blockedUntilTs).toISOString(),
        reason: 'Bloqueio de segurança ativado por tentativas repetidas de autenticação.',
        isPasswordSpraying: isSpraying,
        isCredentialStuffing: ipRecord.targetAccounts.size >= 5,
      };
    }

    if (fails >= 5 || isSpraying) {
      return {
        tier: 'CHALLENGE',
        blocked: false,
        challenged: true,
        throttled: true,
        artificialDelayMs: 2000,
        remainingAttempts: Math.max(0, 10 - fails),
        reason: 'Nível de risco elevado. Desafio adicional (MFA / Captcha) obrigatório.',
        isPasswordSpraying: isSpraying,
        isCredentialStuffing: false,
      };
    }

    if (fails >= 3) {
      return {
        tier: 'THROTTLE',
        blocked: false,
        challenged: false,
        throttled: true,
        artificialDelayMs: 1000,
        remainingAttempts: 10 - fails,
        reason: 'Atraso artificial aplicado para mitigar força bruta automatizada.',
        isPasswordSpraying: false,
        isCredentialStuffing: false,
      };
    }

    return {
      tier: 'ALLOW',
      blocked: false,
      challenged: false,
      throttled: false,
      artificialDelayMs: 0,
      remainingAttempts: 10 - fails,
      reason: 'Tráfego dentro dos parâmetros normais de autenticação.',
      isPasswordSpraying: false,
      isCredentialStuffing: false,
    };
  }

  /**
   * Registra uma tentativa de autenticação (sucesso ou falha).
   */
  public static recordAttempt(ip: string, accountIdentifier: string, success: boolean): BruteForceAssessment {
    const now = Date.now();
    const cleanIp = ip || '0.0.0.0';
    const cleanAcc = accountIdentifier ? accountIdentifier.toLowerCase().trim() : 'unknown';

    const ipRecord = this.getCleanRecord(this.ipRecords, cleanIp, now);
    const accRecord = this.getCleanRecord(this.accountRecords, cleanAcc, now);

    if (success) {
      // Em sucesso, zera contadores para permitir acesso legítimo
      ipRecord.failedAttempts = Math.max(0, ipRecord.failedAttempts - 1);
      this.accountRecords.delete(cleanAcc);
      return this.evaluateRequest(cleanIp, cleanAcc);
    }

    // Em falha, incrementa contadores e registra alvo
    ipRecord.failedAttempts += 1;
    ipRecord.lastFailedTs = now;
    ipRecord.targetAccounts.add(cleanAcc);

    accRecord.failedAttempts += 1;
    accRecord.lastFailedTs = now;

    // Se conta atingiu 5 falhas consecutivas, proteger a conta
    if (accRecord.failedAttempts >= 5) {
      accRecord.blockedUntilTs = now + (10 * 60 * 1000); // 10 min de proteção de conta
    }

    return this.evaluateRequest(cleanIp, cleanAcc);
  }

  /**
   * Limpa registros de um IP ou conta (para uso administrativo ou testes).
   */
  public static resetTarget(ip?: string, accountIdentifier?: string): void {
    if (ip) this.ipRecords.delete(ip);
    if (accountIdentifier) this.accountRecords.delete(accountIdentifier.toLowerCase().trim());
  }

  /**
   * Limpa todos os registros em memória.
   */
  public static clearAll(): void {
    this.ipRecords.clear();
    this.accountRecords.clear();
  }

  private static getCleanRecord(map: Map<string, AttemptRecord>, key: string, now: number): AttemptRecord {
    let rec = map.get(key);
    if (!rec || now - rec.firstFailedTs >= this.WINDOW_MS) {
      rec = {
        failedAttempts: 0,
        firstFailedTs: now,
        lastFailedTs: now,
        targetAccounts: new Set<string>(),
      };
      map.set(key, rec);
    }
    return rec;
  }
}
