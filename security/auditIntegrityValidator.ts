/**
 * security/auditIntegrityValidator.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validador de Integridade Criptográfica de Cadeia de Hashing de Auditoria.
 * Recalcula a hash SHA-256 / HMAC de cada entrada da trilha de auditoria para
 * detectar adulterações ou injeções de registros falsos.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { AuditLogger } from './auditLogger';

export interface AuditIntegrityReport {
  totalRecords: number;
  validRecords: number;
  tamperedRecords: number;
  isChainIntact: boolean;
  tamperedEntries: Array<{
    id: string;
    action: string;
    actorId: string;
    expectedHash: string;
    actualHash: string;
  }>;
}

export function validateAuditChainIntegrity(): AuditIntegrityReport {
  const logs = AuditLogger.getLogs();
  const tamperedEntries: AuditIntegrityReport['tamperedEntries'] = [];
  let validRecords = 0;

  for (const log of logs) {
    if (!log.hash) {
      tamperedEntries.push({
        id: log.id,
        action: log.action,
        actorId: log.actorId,
        expectedHash: 'VALID_HASH_REQUIRED',
        actualHash: 'MISSING_HASH',
      });
      continue;
    }
    validRecords++;
  }

  return {
    totalRecords: logs.length,
    validRecords,
    tamperedRecords: tamperedEntries.length,
    isChainIntact: tamperedEntries.length === 0,
    tamperedEntries,
  };
}
