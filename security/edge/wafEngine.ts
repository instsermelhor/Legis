/**
 * security/edge/wafEngine.ts — Legis Connect Enterprise Edge WAF Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor de Web Application Firewall (WAF) executado na Borda da Infraestrutura.
 * Inspeciona requisições antes que atinjam a aplicação, bloqueando ataques OWASP
 * Top 10, scanners maliciosos e anomalias de protocolo.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type WafSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type WafAction = 'ALLOW' | 'BLOCK' | 'CHALLENGE' | 'LOG_ONLY';

export interface WafRule {
  id: string;
  name: string;
  category: 'SQLI' | 'XSS' | 'RCE' | 'PATH_TRAVERSAL' | 'PROTOCOL_ANOMALY' | 'MALICIOUS_SCANNER' | 'PAYLOAD_LIMIT' | 'CUSTOM';
  severity: WafSeverity;
  action: WafAction;
  pattern: RegExp;
  description: string;
  enabled: boolean;
}

export interface HttpRequestContext {
  method: string;
  url: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined> | string;
  body?: unknown;
  ip?: string;
  tenantId?: string;
  userId?: string;
}

export interface WafMatchedRule {
  ruleId: string;
  ruleName: string;
  category: string;
  severity: WafSeverity;
  action: WafAction;
  matchedField: string;
  matchedValueSnippet: string;
  description: string;
}

export interface WafInspectionResult {
  allowed: boolean;
  action: WafAction;
  blocked: boolean;
  challenged: boolean;
  blockReason?: string;
  statusCode?: number;
  matchedRules: WafMatchedRule[];
  inspectedAt: string;
  latencyMs: number;
}

export class WafEngine {
  private static rules: WafRule[] = [
    // ── 1. SQL Injection Rules ──────────────────────────────────────────────
    {
      id: 'WAF-SQLI-001',
      name: 'SQL Injection — Classic Boolean / Union Exploitation',
      category: 'SQLI',
      severity: 'CRITICAL',
      action: 'BLOCK',
      pattern: /(\bunion\b.+?\bselect\b|'\s*or\s*['"\d]+\s*=\s*['"\d]+|--|;\s*drop\s+table|;\s*delete\s+from|benchmark\s*\(|waitfor\s+delay)/i,
      description: 'Tentativa de manipulação de consultas SQL via injeção direta de palavras-chave.',
      enabled: true,
    },
    {
      id: 'WAF-SQLI-002',
      name: 'SQL Injection — Blind / Time-Based Signatures',
      category: 'SQLI',
      severity: 'HIGH',
      action: 'BLOCK',
      pattern: /(\bpg_sleep\s*\(|\bsleep\s*\(\s*\d+\s*\)|\bexec\s*\(\s*xp_)/i,
      description: 'Tentativa de SQL Injection baseada em tempo ou execução de procedimentos estendidos.',
      enabled: true,
    },

    // ── 2. Cross-Site Scripting (XSS) Rules ──────────────────────────────────
    {
      id: 'WAF-XSS-001',
      name: 'XSS — Script Tags & Event Handlers Injection',
      category: 'XSS',
      severity: 'HIGH',
      action: 'BLOCK',
      pattern: /(<script[\s>/]|javascript\s*:|\bonerror\s*=|\bonload\s*=|\bonclick\s*=|\beval\s*\(|document\.cookie)/i,
      description: 'Tentativa de injeção de scripts maliciosos ou manipuladores de eventos no navegador.',
      enabled: true,
    },

    // ── 3. Remote Code Execution (RCE) / Command Injection ───────────────────
    {
      id: 'WAF-RCE-001',
      name: 'RCE — OS Command Injection Sequences',
      category: 'RCE',
      severity: 'CRITICAL',
      action: 'BLOCK',
      pattern: /(;\s*cat\s+\/etc|&&\s*cat\s+\/|\|\|\s*whoami|`\s*whoami\s*`|\$\(\s*id\s*\)|;\s*rm\s+-rf|;\s*curl\s+http)/i,
      description: 'Tentativa de execução de comandos do sistema operacional.',
      enabled: true,
    },

    // ── 4. Path Traversal & Local File Inclusion (LFI) ──────────────────────
    {
      id: 'WAF-LFI-001',
      name: 'Path Traversal — Directory Navigation Probe',
      category: 'PATH_TRAVERSAL',
      severity: 'HIGH',
      action: 'BLOCK',
      pattern: /(\.\.[/\\]|%2e%2e[/\\]|\/etc\/passwd|c:\\boot\.ini|win\.ini)/i,
      description: 'Tentativa de evasão de diretório e acesso a arquivos confidenciais do sistema.',
      enabled: true,
    },

    // ── 5. Protocol Anomalies & Null Byte Injections ─────────────────────────
    {
      id: 'WAF-PROTO-001',
      name: 'Protocol Anomaly — Null Byte Injection',
      category: 'PROTOCOL_ANOMALY',
      severity: 'CRITICAL',
      action: 'BLOCK',
      // eslint-disable-next-line no-control-regex
      pattern: /(%00|\x00|\\000)/i,
      description: 'Tentativa de injeção de byte nulo para bypass de extensão ou término de string.',
      enabled: true,
    },

    // ── 6. Malicious Scanners & Exploit Tool Signatures ─────────────────────
    {
      id: 'WAF-SCAN-001',
      name: 'Malicious Scanner — Automated Penetration Tool Detection',
      category: 'MALICIOUS_SCANNER',
      severity: 'HIGH',
      action: 'BLOCK',
      pattern: /(sqlmap|nikto|acunetix|nessus|gobuster|dirbuster|wpscan|masscan|zgrab)/i,
      description: 'Assinatura conhecida de ferramentas e scanners automatizados de exploração.',
      enabled: true,
    },
  ];

  /**
   * Inspeciona uma requisição HTTP contra todas as regras do WAF ativas.
   */
  public static inspectRequest(req: HttpRequestContext): WafInspectionResult {
    const startTime = Date.now();
    const matchedRules: WafMatchedRule[] = [];

    // 1. Validar limites básicos de payload
    if (req.url && req.url.length > 2048) {
      matchedRules.push({
        ruleId: 'WAF-LIMIT-001',
        ruleName: 'URI Length Exceeded (Max 2048)',
        category: 'PAYLOAD_LIMIT',
        severity: 'MEDIUM',
        action: 'BLOCK',
        matchedField: 'url',
        matchedValueSnippet: req.url.substring(0, 50) + '...',
        description: 'Tamanho da URI excede o limite máximo permitido de 2048 caracteres.',
      });
    }

    // 2. Extrair dados para inspeção
    const inspectTargets: Array<{ field: string; value: string }> = [
      { field: 'url', value: req.url || '' },
      { field: 'path', value: req.path || '' },
    ];

    // Inspecionar User-Agent
    const userAgent = this.getHeaderValue(req.headers, 'user-agent');
    if (userAgent) {
      inspectTargets.push({ field: 'header:user-agent', value: userAgent });
    }

    // Inspecionar Query String
    if (typeof req.query === 'string') {
      inspectTargets.push({ field: 'queryString', value: req.query });
    } else if (req.query && typeof req.query === 'object') {
      try {
        inspectTargets.push({ field: 'queryObject', value: JSON.stringify(req.query) });
      } catch {}
    }

    // Inspecionar Body
    if (req.body) {
      const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      inspectTargets.push({ field: 'body', value: bodyStr });
    }

    // 3. Executar casamento de padrões
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      for (const target of inspectTargets) {
        if (rule.pattern.test(target.value)) {
          matchedRules.push({
            ruleId: rule.id,
            ruleName: rule.name,
            category: rule.category,
            severity: rule.severity,
            action: rule.action,
            matchedField: target.field,
            matchedValueSnippet: target.value.substring(0, 80),
            description: rule.description,
          });
          break; // Não duplicar match para a mesma regra
        }
      }
    }

    // 4. Determinar decisão
    const hasBlock = matchedRules.some(r => r.action === 'BLOCK');
    const hasChallenge = matchedRules.some(r => r.action === 'CHALLENGE');

    let finalAction: WafAction = 'ALLOW';
    let statusCode = 200;
    let blockReason: string | undefined = undefined;

    if (hasBlock) {
      finalAction = 'BLOCK';
      statusCode = 403;
      const primaryRule = matchedRules.find(r => r.action === 'BLOCK');
      blockReason = 'WAF Blocked: ' + (primaryRule ? primaryRule.ruleName : 'Security violation detected');
    } else if (hasChallenge) {
      finalAction = 'CHALLENGE';
      statusCode = 429;
      blockReason = 'WAF Challenge Required';
    }

    return {
      allowed: finalAction === 'ALLOW',
      action: finalAction,
      blocked: finalAction === 'BLOCK',
      challenged: finalAction === 'CHALLENGE',
      blockReason,
      statusCode,
      matchedRules,
      inspectedAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Registra regra customizada no motor WAF.
   */
  public static registerCustomRule(rule: WafRule): void {
    this.rules.push(rule);
  }

  /**
   * Retorna todas as regras registradas.
   */
  public static getRules(): readonly WafRule[] {
    return this.rules;
  }

  private static getHeaderValue(headers: Record<string, string | string[] | undefined>, name: string): string {
    const val = headers[name.toLowerCase()] || headers[name];
    if (Array.isArray(val)) return val.join(' ');
    return typeof val === 'string' ? val : '';
  }
}
