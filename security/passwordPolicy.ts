// ─────────────────────────────────────────────────────────────────────────────
// security/passwordPolicy.ts
// Política de Senha e Geração de Hash Seguro (PBKDF2-SHA256)
// OWASP: 310.000 iterações, salt aleatório de 16 bytes
// ─────────────────────────────────────────────────────────────────────────────

import type { PasswordPolicy } from '../types';

// ─── Política padrão do Super Administrador ───────────────────────────────────
export const SUPER_ADMIN_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  maxHistoryCount: 5,
  expirationDays: 90,
  prohibitedPatterns: ['123456', 'password', 'senha', 'admin', 'legis'],
};

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: false,
  maxHistoryCount: 3,
};

// ─── Resultado de validação ───────────────────────────────────────────────────
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'strong' | 'very_strong';
  score: number; // 0–100
}

// ─── Validação de Política de Senha ──────────────────────────────────────────
export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
  history: string[] = []
): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Comprimento mínimo
  if (password.length < policy.minLength) {
    errors.push(`Mínimo de ${policy.minLength} caracteres`);
  } else {
    score += Math.min(30, password.length * 2);
  }

  // Maiúsculas
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Deve conter pelo menos uma letra maiúscula');
  } else if (/[A-Z]/.test(password)) {
    score += 15;
  }

  // Minúsculas
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Deve conter pelo menos uma letra minúscula');
  } else if (/[a-z]/.test(password)) {
    score += 10;
  }

  // Números
  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Deve conter pelo menos um número');
  } else if (/[0-9]/.test(password)) {
    score += 15;
  }

  // Símbolos
  if (policy.requireSymbols && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Deve conter pelo menos um símbolo especial (!@#$%...)');
  } else if (/[^A-Za-z0-9]/.test(password)) {
    score += 20;
  }

  // Padrões proibidos
  if (policy.prohibitedPatterns) {
    const lc = password.toLowerCase();
    for (const pattern of policy.prohibitedPatterns) {
      if (lc.includes(pattern.toLowerCase())) {
        errors.push(`Não pode conter o termo "${pattern}"`);
      }
    }
  }

  // Histórico de senhas (hashes já calculados)
  if (history.length > 0) {
    // A verificação real contra histórico é feita no authService (com await)
    // Aqui apenas reduzimos o score se houver histórico (indica reutilização potencial)
    if (history.length >= policy.maxHistoryCount) {
      score = Math.max(0, score - 5);
    }
  }

  // Pontuação final
  score = Math.min(100, score);
  let strength: PasswordValidationResult['strength'];
  if (score < 30) strength = 'weak';
  else if (score < 55) strength = 'fair';
  else if (score < 80) strength = 'strong';
  else strength = 'very_strong';

  return { valid: errors.length === 0, errors, strength, score };
}

// ─── Geração de Hash PBKDF2-SHA256 ────────────────────────────────────────────
// 310.000 iterações (OWASP 2024 recomendação para PBKDF2-SHA256)
// Salt único de 16 bytes por operação
// Formato: $pbkdf2v2$<iterations>$<salt_hex>$<hash_hex>

const PBKDF2_ITERATIONS = 310_000;
const SALT_LENGTH = 16; // bytes
const KEY_LENGTH = 32;  // bytes (256 bits)

export async function generatePasswordHash(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PBKDF2_ITERATIONS,
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `$pbkdf2v2$${PBKDF2_ITERATIONS}$${saltHex}$${hashHex}`;
}

export async function verifyPasswordHash(password: string, storedHash: string): Promise<boolean> {
  try {
    if (!storedHash.startsWith('$pbkdf2v2$')) {
      // Legado: delega para a verificação original do mockDataService
      return false; // Sinaliza para tentar verificação legada
    }

    const parts = storedHash.split('$');
    // $pbkdf2v2$<iter>$<salt>$<hash> → parts = ['', 'pbkdf2v2', iter, salt, hash]
    if (parts.length !== 5) return false;

    const iterations = parseInt(parts[2], 10);
    const saltHex = parts[3];
    const expectedHashHex = parts[4];

    // Reconstrói o salt
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
      keyMaterial,
      KEY_LENGTH * 8
    );

    const derivedHex = Array.from(new Uint8Array(derivedBits))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Comparação constante para prevenir timing attacks
    return timingSafeEqual(derivedHex, expectedHashHex);
  } catch {
    return false;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ─── Geração de Códigos de Recuperação ───────────────────────────────────────
// 8 códigos de 10 caracteres alfanuméricos separados por hífen (ex: ABCD-EFGH-IJ)
export function generateRecoveryCodes(count = 8): string[] {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluindo caracteres ambíguos
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const bytes = crypto.getRandomValues(new Uint8Array(10));
    const code = Array.from(bytes)
      .map(b => chars[b % chars.length])
      .join('');
    // Formata: XXXXXX-XXXXXX
    codes.push(`${code.slice(0, 6)}-${code.slice(6)}`);
  }

  return codes;
}

// Hash de código de recuperação para armazenamento seguro
export async function hashRecoveryCode(code: string): Promise<string> {
  const normalized = code.replace(/-/g, '').toUpperCase();
  const data = new TextEncoder().encode(`legis_recovery_${normalized}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '$rc$' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyRecoveryCode(code: string, storedHash: string): Promise<boolean> {
  try {
    const computedHash = await hashRecoveryCode(code);
    return timingSafeEqual(computedHash, storedHash);
  } catch {
    return false;
  }
}
