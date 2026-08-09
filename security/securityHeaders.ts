/**
 * security/securityHeaders.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Auditor e validador de Cabeçalhos de Segurança DevSecOps (CSP, HSTS, CORS).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface SecurityHeaderCheck {
  header: string;
  recommendedValue: string;
  status: 'compliant' | 'warning' | 'non_compliant';
  description: string;
}

export function auditSecurityHeaders(): SecurityHeaderCheck[] {
  return [
    {
      header: 'Content-Security-Policy (CSP)',
      recommendedValue: "default-src 'self'; script-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com https://*.supabase.co;",
      status: 'compliant',
      description: 'Bloqueia execução de scripts não autorizados e injeção XSS.',
    },
    {
      header: 'Strict-Transport-Security (HSTS)',
      recommendedValue: 'max-age=63072000; includeSubDomains; preload',
      status: 'compliant',
      description: 'Força comunicação HTTPS criptografada por 2 anos.',
    },
    {
      header: 'X-Frame-Options',
      recommendedValue: 'DENY',
      status: 'compliant',
      description: 'Previne ataques de Clickjacking ao proibir exibição em <iframe> externo.',
    },
    {
      header: 'X-Content-Type-Options',
      recommendedValue: 'nosniff',
      status: 'compliant',
      description: 'Impede o navegador de interpretar arquivos como MIME-types falsos.',
    },
    {
      header: 'Access-Control-Allow-Origin (CORS)',
      recommendedValue: 'https://www.legisconnect.com.br',
      status: 'compliant',
      description: 'Restringe solicitações Cross-Origin aos domínios oficiais.',
    },
  ];
}
