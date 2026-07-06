/**
 * Credenciais de DESENVOLVIMENTO centralizadas — TEMPORÁRIO.
 *
 * Todo ponto do frontend que ainda referencia credenciais hardcoded importa
 * deste arquivo. Quando os logins hardcoded forem removidos, basta apagar
 * este arquivo e os pontos de uso (o compilador aponta todos).
 *
 * A senha REAL do admin nunca fica no código: o backend a lê da env
 * ADMIN_SENHA (server/setup.ts); o valor abaixo é só o default de dev.
 */
export const ADMIN_EMAIL_DEV = 'admin@legisconnect.com.br';
export const SENHA_ADMIN_DEV = 'admin';

// Conta Google compartilhada do escritório (Firebase). A senha não é
// versionada — obtenha com o administrador e configure localmente.
export const EMAIL_CONTA_GOOGLE = 'legisconnectonline@gmail.com';
export const SENHA_CONTA_GOOGLE = '(solicite ao administrador)';
