/**
 * Hash de senha com scrypt (node:crypto) — sem dependências externas.
 * Formato armazenado: "scrypt:<salt hex>:<hash hex>".
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function gerarHash(senha: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(senha, salt, 32).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function conferirSenha(senha: string, hashArmazenado: string): boolean {
  const [algoritmo, salt, hash] = hashArmazenado.split(':');
  if (algoritmo !== 'scrypt' || !salt || !hash) return false;
  const candidato = scryptSync(senha, salt, 32);
  return timingSafeEqual(candidato, Buffer.from(hash, 'hex'));
}
