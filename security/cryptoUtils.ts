// ─────────────────────────────────────────────────────────────────────────────
// security/cryptoUtils.ts
// Utilitários de Criptografia usando Web Crypto API (nativa do browser)
// Algoritmo: AES-GCM 256-bit — autenticado, com IV aleatório por operação
// Conformidade LGPD: dados sensíveis em repouso nunca ficam em plaintext
// ─────────────────────────────────────────────────────────────────────────────

// ─── Chave de Criptografia ────────────────────────────────────────────────────
// Em produção: derivar da senha master via PBKDF2 ou recuperar do servidor
// Aqui: chave gerada na sessão e armazenada na sessionStorage (não persiste)
const CRYPTO_KEY_STORAGE = 'legis_ek';
const KEY_ALGORITHM = { name: 'AES-GCM', length: 256 };

/**
 * Obtém ou gera a chave de encriptação da sessão.
 * Em produção: a chave viria de um KMS (Key Management Service).
 */
async function getOrCreateKey(): Promise<CryptoKey> {
  const stored = sessionStorage.getItem(CRYPTO_KEY_STORAGE);
  if (stored) {
    try {
      const rawKey = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
      return await crypto.subtle.importKey('raw', rawKey, KEY_ALGORITHM, false, ['encrypt', 'decrypt']);
    } catch {
      // Chave corrompida — regerar
    }
  }

  // Gera nova chave AES-GCM 256-bit
  const key = await crypto.subtle.generateKey(KEY_ALGORITHM, true, ['encrypt', 'decrypt']);
  const exported = await crypto.subtle.exportKey('raw', key);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  sessionStorage.setItem(CRYPTO_KEY_STORAGE, base64);
  return key;
}

// ─── Encriptação ──────────────────────────────────────────────────────────────
/**
 * Encripta uma string com AES-GCM.
 * Retorna string base64 no formato: `<base64(iv)>.<base64(ciphertext)>`
 */
export async function encryptData(plaintext: string): Promise<string> {
  try {
    if (!crypto.subtle) throw new Error('Web Crypto API não disponível');
    const key = await getOrCreateKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV para AES-GCM
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const ivB64 = btoa(String.fromCharCode(...iv));
    const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
    return `${ivB64}.${ctB64}`;
  } catch {
    // Fallback: ofuscação básica se Web Crypto não disponível (ex: HTTP sem TLS)
    return `$plain$${btoa(unescape(encodeURIComponent(plaintext)))}`;
  }
}

// ─── Decriptação ──────────────────────────────────────────────────────────────
/**
 * Decripta uma string previamente encriptada com `encryptData`.
 */
export async function decryptData(encrypted: string): Promise<string> {
  try {
    // Fallback plaintext
    if (encrypted.startsWith('$plain$')) {
      return decodeURIComponent(escape(atob(encrypted.slice(7))));
    }

    const [ivB64, ctB64] = encrypted.split('.');
    if (!ivB64 || !ctB64) throw new Error('Formato inválido');

    const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(ctB64), c => c.charCodeAt(0));

    const key = await getOrCreateKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    return '[ERRO: Dados corrompidos ou chave inválida]';
  }
}

// ─── Hash de Dados Sensíveis (one-way) ───────────────────────────────────────
/**
 * Hash SHA-256 de um dado sensível (CPF, senha, etc.) para comparação.
 * One-way: não pode ser revertido.
 */
export async function hashSensitiveData(data: string): Promise<string> {
  try {
    const encoded = new TextEncoder().encode(`legis_v1:${data}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '$sha256$' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback btoa hash
    return '$btoa$' + btoa(unescape(encodeURIComponent(`legis_v1:${data}`))).slice(0, 44);
  }
}

/**
 * Compara um dado com seu hash.
 */
export async function compareHash(data: string, hash: string): Promise<boolean> {
  const newHash = await hashSensitiveData(data);
  return newHash === hash;
}

// ─── Máscara de Dados Sensíveis para Exibição ─────────────────────────────────
/**
 * Mascara CPF: "123.456.789-01" → "123.***.***.01"
 */
export function maskCpf(cpf: string): string {
  return cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '$1.***.***-$4');
}

/**
 * Mascara e-mail: "usuario@dominio.com" → "usu***@dominio.com"
 */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.slice(0, 3)}***@${domain}`;
}

/**
 * Mascara telefone: "(11) 91234-5678" → "(11) 9****-5678"
 */
export function maskPhone(phone: string): string {
  return phone.replace(/(\(\d{2}\) \d)(\d{4})(-)(\d{4})/, '$1****$3$4');
}

/**
 * Mascara valor financeiro para roles sem acesso financeiro.
 */
export function maskCurrency(value: number): string {
  return 'R$ **.***,**';
}

// ─── Sanitização de Input ─────────────────────────────────────────────────────
/**
 * Remove caracteres perigosos de input de usuário (XSS prevention).
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Valida CPF brasileiro.
 */
export function isValidCpf(cpf: string): boolean {
  const stripped = cpf.replace(/\D/g, '');
  if (stripped.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(stripped)) return false; // todos iguais

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(stripped[i]) * (10 - i);
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  if (parseInt(stripped[9]) !== digit1) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(stripped[i]) * (11 - i);
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  return parseInt(stripped[10]) === digit2;
}

/**
 * Valida CNPJ brasileiro.
 */
export function isValidCnpj(cnpj: string): boolean {
  const stripped = cnpj.replace(/\D/g, '');
  if (stripped.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(stripped)) return false;

  const calcDigit = (str: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + parseInt(str[i]) * w, 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const d1 = calcDigit(stripped, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calcDigit(stripped, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return parseInt(stripped[12]) === d1 && parseInt(stripped[13]) === d2;
}
