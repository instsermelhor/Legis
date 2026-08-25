/**
 * security/errorReportSanitizer.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — ERROR REPORT SANITIZER ENGINE (LGPD & SECRETS HARDENING)
 * 
 * Regra Mestra:
 * "NENHUM DADO SENSÍVEL, SEGREDO, TOKEN OU CONTEÚDO JURÍDICO RESTRITO PODE
 * SER ARMAZENADO OU TRANSMITIDO NO RELATÓRIO DE ERROS."
 * 
 * Princípios aplicados:
 * 1. NECESSIDADE e MINIMIZAÇÃO (LGPD Art. 6º, III)
 * 2. REDACTION de secrets, tokens, chaves e credenciais
 * 3. MASCARAMENTO de PII (CPF, CNPJ, cartões)
 * 4. SANITIZAÇÃO de stack traces e queries SQL
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Chaves que devem ser sumariamente redigidas em qualquer objeto/payload
const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /passwd/i,
  /pwd/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /auth/i,
  /authorization/i,
  /bearer/i,
  /jwt/i,
  /cookie/i,
  /session/i,
  /credential/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i,
  /client[_-]?secret/i,
  /private[_-]?key/i,
  /db[_-]?pass/i,
  /card[_-]?number/i,
  /cvv/i,
  /security[_-]?code/i,
];

// Regex para detecção e mascaramento de PII e segredos em texto puro
const CPF_REGEX = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const CNPJ_REGEX = /\b\d{2}\.?\d{3}\.?\d{3}\/\d{4}-?\d{2}\b/g;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
const BEARER_AUTH_REGEX = /Bearer\s+([A-Za-z0-9\-_.~+/]+=*)/gi;
const BASIC_AUTH_REGEX = /Basic\s+([A-Za-z0-9+/=]+)/gi;
const CONNECTION_STRING_REGEX = /(postgres(?:ql)?|mysql|mongodb|redis):\/\/[^:]+:([^@]+)@/gi;
const JWT_REGEX = /\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*\b/g;
const GENERIC_API_KEY_REGEX = /\b(?:AIza[0-9A-Za-z-_]{35}|ghp_[0-9A-Za-z]{36}|sk-[0-9A-Za-z]{32,})\b/g;

export class ErrorReportSanitizer {
  /**
   * Mascara string de segredo com asteriscos preservando contexto mínimo
   */
  static maskSecret(value: string): string {
    if (!value || typeof value !== 'string') return '[REDACTED]';
    if (value.length <= 8) return '********';
    return `${value.slice(0, 3)}***[REDACTED]***${value.slice(-2)}`;
  }

  /**
   * Mascara CPF mantendo formato regulatório LGPD (XXX.***.***-XX)
   */
  static maskCpf(text: string): string {
    if (!text || typeof text !== 'string') return text;
    return text.replace(CPF_REGEX, (match) => {
      const clean = match.replace(/\D/g, '');
      if (clean.length !== 11) return match;
      return `${clean.slice(0, 3)}.***.***-${clean.slice(-2)}`;
    });
  }

  /**
   * Mascara CNPJ mantendo apenas prefixo
   */
  static maskCnpj(text: string): string {
    if (!text || typeof text !== 'string') return text;
    return text.replace(CNPJ_REGEX, (match) => {
      const clean = match.replace(/\D/g, '');
      if (clean.length !== 14) return match;
      return `${clean.slice(0, 2)}.***.***/${clean.slice(8, 12)}-**`;
    });
  }

  /**
   * Mascara número de cartão de crédito
   */
  static maskCreditCard(text: string): string {
    if (!text || typeof text !== 'string') return text;
    return text.replace(CREDIT_CARD_REGEX, '****-****-****-****');
  }

  /**
   * Sanitiza URL removendo query params com tokens, chaves ou credenciais
   */
  static sanitizeUrl(rawUrl: string): string {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    try {
      // Suporte a URLs relativas e absolutas
      const isRelative = rawUrl.startsWith('/');
      const parsed = new URL(isRelative ? `https://legisconnect.local${rawUrl}` : rawUrl);
      
      const sensitiveParamKeys = ['token', 'key', 'auth', 'secret', 'password', 'session', 'jwt', 'apiKey', 'access_token', 'code'];
      for (const [key] of parsed.searchParams.entries()) {
        if (sensitiveParamKeys.some(s => key.toLowerCase().includes(s))) {
          parsed.searchParams.set(key, '[REDACTED]');
        }
      }

      return isRelative ? `${parsed.pathname}${parsed.search}${parsed.hash}` : parsed.toString();
    } catch {
      // Fallback regex se falhar URL parse
      return rawUrl
        .replace(/([?&](?:token|key|auth|secret|password|session|code)=)[^&]+/gi, '$1[REDACTED]')
        .replace(JWT_REGEX, '[REDACTED_JWT]');
    }
  }

  /**
   * Sanitiza stack trace removendo SQL, credenciais, connection strings e PII
   */
  static sanitizeStackTrace(stack: string): string {
    if (!stack || typeof stack !== 'string') return '';
    
    let sanitized = stack;
    
    // 1. Mascarar JWTs
    sanitized = sanitized.replace(JWT_REGEX, '[REDACTED_JWT]');

    // 2. Mascarar Authorization headers
    sanitized = sanitized.replace(BEARER_AUTH_REGEX, 'Bearer ********');
    sanitized = sanitized.replace(BASIC_AUTH_REGEX, 'Basic ********');

    // 3. Mascarar connection strings com usuário/senha
    sanitized = sanitized.replace(CONNECTION_STRING_REGEX, '$1://****:****@');

    // 4. Mascarar API keys conhecidas (Google, GitHub, OpenAI)
    sanitized = sanitized.replace(GENERIC_API_KEY_REGEX, '[REDACTED_API_KEY]');

    // 5. Mascarar PII (CPF, CNPJ, Cartões)
    sanitized = this.maskCpf(sanitized);
    sanitized = this.maskCnpj(sanitized);
    sanitized = this.maskCreditCard(sanitized);

    // 6. Mascarar senhas em formato JSON ou string params
    sanitized = sanitized.replace(/(["']?(?:password|passwd|pwd|secret|token)["']?\s*[:=]\s*["'])[^"']+(["'])/gi, '$1[REDACTED]$2');

    return sanitized;
  }

  /**
   * Sanitiza headers HTTP mascarando Authorization, Cookie, etc.
   */
  static sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    if (!headers || typeof headers !== 'object') return {};
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      const lower = key.toLowerCase();
      if (lower === 'authorization') {
        sanitized[key] = value.startsWith('Bearer ') ? 'Bearer ********' : '********';
      } else if (lower === 'cookie' || lower === 'set-cookie') {
        sanitized[key] = '[REDACTED_COOKIE]';
      } else if (SENSITIVE_KEY_PATTERNS.some(p => p.test(lower))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitiza recursivamente qualquer payload (JSON/Object/Array)
   */
  static sanitizePayload(payload: unknown, depth = 0): unknown {
    if (depth > 8) return '[MAX_DEPTH_REACHED]'; // Prevenir circularidade
    if (payload === null || payload === undefined) return payload;

    if (typeof payload === 'string') {
      let text = this.maskCpf(payload);
      text = this.maskCnpj(text);
      text = this.maskCreditCard(text);
      text = text.replace(BEARER_AUTH_REGEX, 'Bearer ********');
      text = text.replace(JWT_REGEX, '[REDACTED_JWT]');
      text = text.replace(GENERIC_API_KEY_REGEX, '[REDACTED_API_KEY]');
      return text;
    }

    if (typeof payload === 'number' || typeof payload === 'boolean') {
      return payload;
    }

    if (Array.isArray(payload)) {
      return payload.map(item => this.sanitizePayload(item, depth + 1));
    }

    if (typeof payload === 'object') {
      const sanitizedObj: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
        if (SENSITIVE_KEY_PATTERNS.some(pattern => pattern.test(key))) {
          sanitizedObj[key] = '[REDACTED]';
        } else {
          sanitizedObj[key] = this.sanitizePayload(value, depth + 1);
        }
      }

      return sanitizedObj;
    }

    return String(payload);
  }

  /**
   * Sanitiza a captura visual (Canvas) cobrindo elementos de senha e confidenciais com retângulos opacos
   */
  static maskSensitiveCanvasElements(canvas: HTMLCanvasElement, doc: Document = document): void {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const sensitiveElements = doc.querySelectorAll<HTMLElement>(
        'input[type="password"], [data-sensitive], [data-mask], [data-legal-content], .sensitive-field'
      );

      ctx.fillStyle = '#1e293b'; // Slate 800 — cobertura opaca neutra
      
      sensitiveElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
        }
      });
    } catch {}
  }
}
