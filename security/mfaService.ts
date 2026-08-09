// ─────────────────────────────────────────────────────────────────────────────
// security/mfaService.ts
// Serviço de Autenticação Multi-Fator (MFA)
// TOTP: implementação pura TypeScript (RFC 6238 / HOTP RFC 4226)
// WebAuthn: Web Authentication API nativa do browser
// Sem dependências externas
// ─────────────────────────────────────────────────────────────────────────────

import type { MfaChallenge, MfaMethod } from '../types';

// ─── TOTP (Time-based One-Time Password — RFC 6238) ───────────────────────────

const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30; // segundos
const TOTP_WINDOW = 1;  // tolerância de ±1 período (30s antes e depois)
const TOTP_ALGORITHM = 'SHA-1';

/**
 * Gera um secret TOTP aleatório (20 bytes → Base32).
 * Compatível com Google Authenticator, Authy, etc.
 */
export function generateTotpSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return base32Encode(bytes);
}

/**
 * Verifica se o token TOTP de 6 dígitos é válido para o secret.
 * Aceita janela de ±1 período (30s) para tolerância de clock skew.
 */
export async function verifyTotpToken(secret: string, token: string): Promise<boolean> {
  const cleanToken = token.replace(/\s/g, '');
  if (!/^\d{6}$/.test(cleanToken)) return false;

  const now = Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / TOTP_PERIOD);

  for (let delta = -TOTP_WINDOW; delta <= TOTP_WINDOW; delta++) {
    const expected = await generateHotp(secret, counter + delta);
    if (timingSafeEqual(cleanToken, expected)) return true;
  }

  return false;
}

/**
 * Gera o código TOTP atual para exibição de teste.
 */
export async function getCurrentTotpToken(secret: string): Promise<string> {
  const counter = Math.floor(Date.now() / 1000 / TOTP_PERIOD);
  return generateHotp(secret, counter);
}

/**
 * Retorna os segundos restantes no período TOTP atual.
 */
export function getTotpRemainingSeconds(): number {
  return TOTP_PERIOD - (Math.floor(Date.now() / 1000) % TOTP_PERIOD);
}

/**
 * Gera a URL otpauth:// para QR code.
 * Compatível com Google Authenticator, Authy e outros apps TOTP.
 */
export function generateTotpUri(secret: string, email: string, issuer = 'Legis Connect'): string {
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: TOTP_ALGORITHM,
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD),
  });
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?${params}`;
}

// ─── HOTP (HMAC-based OTP — RFC 4226) ────────────────────────────────────────
async function generateHotp(secret: string, counter: number): Promise<string> {
  const keyBytes = base32Decode(secret);

  // Counter como buffer big-endian de 8 bytes
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  // JavaScript não suporta BigInt nativamente em DataView para 64 bits,
  // então preenchemos os 4 bytes menos significativos
  counterView.setUint32(4, counter & 0xffffffff, false);
  counterView.setUint32(0, Math.floor(counter / 0x100000000) & 0xffffffff, false);

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: { name: TOTP_ALGORITHM } },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, counterBuffer);
  const hmac = new Uint8Array(signature);

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % Math.pow(10, TOTP_DIGITS);

  return String(code).padStart(TOTP_DIGITS, '0');
}

// ─── Base32 (RFC 4648) ────────────────────────────────────────────────────────
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(bytes: Uint8Array): string {
  let result = '';
  let bits = 0;
  let buffer = 0;

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += BASE32_CHARS[(buffer >> bits) & 0x1f];
    }
  }

  if (bits > 0) {
    result += BASE32_CHARS[(buffer << (5 - bits)) & 0x1f];
  }

  return result;
}

function base32Decode(input: string): Uint8Array {
  const clean = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  const bytes: number[] = [];
  let bits = 0;
  let buffer = 0;

  for (const char of clean) {
    const idx = BASE32_CHARS.indexOf(char);
    if (idx < 0) continue;
    buffer = (buffer << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  return new Uint8Array(bytes);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ─── QR Code Generator (via API externa — sem dependência npm) ────────────────
/**
 * Gera URL de QR code usando a API pública do QR Server.
 * Em produção: usar biblioteca local ou endpoint próprio.
 */
export function generateQrCodeUrl(data: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=png&ecc=M`;
}

// ─── MFA Challenge Store ──────────────────────────────────────────────────────
const CHALLENGE_STORE_KEY = 'legis_mfa_challenges';
const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutos

function readChallenges(): MfaChallenge[] {
  try {
    const raw = sessionStorage.getItem(CHALLENGE_STORE_KEY);
    if (!raw) return [];
    const all: MfaChallenge[] = JSON.parse(raw);
    // Remove expirados
    const now = new Date().toISOString();
    return all.filter(c => c.expiresAt > now && !c.solved);
  } catch {
    return [];
  }
}

function writeChallenges(challenges: MfaChallenge[]): void {
  try {
    sessionStorage.setItem(CHALLENGE_STORE_KEY, JSON.stringify(challenges));
  } catch { /* silent */ }
}

export const MfaService = {
  /**
   * Cria um novo desafio MFA para o usuário.
   */
  createChallenge(userId: string, method: MfaMethod): MfaChallenge {
    const challenge: MfaChallenge = {
      id: `mfa_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      userId,
      method,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS).toISOString(),
      attempts: 0,
      maxAttempts: 3,
      solved: false,
    };

    const challenges = readChallenges();
    // Remove desafios anteriores do mesmo usuário
    const filtered = challenges.filter(c => c.userId !== userId);
    filtered.push(challenge);
    writeChallenges(filtered);

    return challenge;
  },

  /**
   * Verifica um token TOTP contra um desafio ativo.
   */
  async verifyChallenge(challengeId: string, token: string, totpSecret: string): Promise<{
    success: boolean;
    error?: string;
    attemptsRemaining?: number;
  }> {
    const challenges = readChallenges();
    const idx = challenges.findIndex(c => c.id === challengeId);

    if (idx === -1) {
      return { success: false, error: 'Desafio de MFA não encontrado ou expirado.' };
    }

    const challenge = challenges[idx];

    if (challenge.solved) {
      return { success: false, error: 'Este desafio já foi resolvido.' };
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      challenges.splice(idx, 1);
      writeChallenges(challenges);
      return { success: false, error: 'Número máximo de tentativas atingido. Faça login novamente.' };
    }

    // Incrementa tentativas
    challenges[idx].attempts++;

    let valid = false;
    if (challenge.method === 'TOTP') {
      valid = await verifyTotpToken(totpSecret, token);
    }

    if (valid) {
      challenges[idx].solved = true;
      writeChallenges(challenges);
      return { success: true };
    }

    writeChallenges(challenges);
    const remaining = challenge.maxAttempts - challenges[idx].attempts;
    return {
      success: false,
      error: `Código incorreto. ${remaining} tentativa(s) restante(s).`,
      attemptsRemaining: remaining,
    };
  },

  /**
   * Verifica se o desafio foi resolvido.
   */
  isChallengeResolved(challengeId: string): boolean {
    const challenges = readChallenges();
    return challenges.find(c => c.id === challengeId)?.solved ?? false;
  },

  /**
   * Remove desafio (limpeza após login completo).
   */
  clearChallenge(challengeId: string): void {
    const challenges = readChallenges().filter(c => c.id !== challengeId);
    writeChallenges(challenges);
  },

  /**
   * Gera e retorna URI TOTP para configuração inicial.
   */
  setupTotp(email: string): { secret: string; uri: string; qrCodeUrl: string } {
    const secret = generateTotpSecret();
    const uri = generateTotpUri(secret, email);
    const qrCodeUrl = generateQrCodeUrl(uri);
    return { secret, uri, qrCodeUrl };
  },

  /**
   * Verifica código TOTP sem desafio (para validação inicial de setup).
   */
  async verifySetupToken(secret: string, token: string): Promise<boolean> {
    return verifyTotpToken(secret, token);
  },

  getTotpRemainingSeconds,
  getCurrentTotpToken,
};
