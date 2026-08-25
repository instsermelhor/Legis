/**
 * security/edge/botManagementEngine.ts — Legis Connect Bot Management & Bot Fight
 * ─────────────────────────────────────────────────────────────────────────────
 * Classificador de tráfego na borda para defesa contra scraping abusivo,
 * credential stuffing, scanners automatizados e bots maliciosos.
 * Preserva bots e crawlers legítimos (Googlebot, BetterStack, etc.).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { HttpRequestContext } from './wafEngine';

export type TrafficCategory = 'HUMAN' | 'LEGITIMATE_BOT' | 'KNOWN_CRAWLER' | 'SUSPICIOUS_BOT' | 'MALICIOUS_BOT';
export type BotAction = 'ALLOW' | 'CHALLENGE' | 'THROTTLE' | 'BLOCK';

export interface BotClassificationResult {
  category: TrafficCategory;
  isBot: boolean;
  isMalicious: boolean;
  isLegitimate: boolean;
  action: BotAction;
  botName?: string;
  confidenceScore: number; // 0 a 100
  reason: string;
  detectedSignatures: string[];
}

export class BotManagementEngine {
  // Lista de bots legítimos e mecanismos de busca autorizados
  private static readonly LEGITIMATE_BOTS: Array<{ name: string; pattern: RegExp }> = [
    { name: 'Googlebot', pattern: /Googlebot|Google-InspectionTool|Mediapartners-Google/i },
    { name: 'Bingbot', pattern: /bingbot|BingPreview/i },
    { name: 'DuckDuckGo', pattern: /DuckDuckBot/i },
    { name: 'Applebot', pattern: /Applebot/i },
    { name: 'BetterStack', pattern: /BetterStack|BetterUptime/i },
    { name: 'UptimeRobot', pattern: /UptimeRobot/i },
    { name: 'Vercel Monitoring', pattern: /Vercelbot|Vercel-Health/i },
    { name: 'WhatsApp Link Preview', pattern: /WhatsApp/i },
    { name: 'LinkedIn Preview', pattern: /LinkedInBot/i },
    { name: 'Twitterbot', pattern: /Twitterbot/i },
  ];

  // Ferramentas maliciosas e scanners conhecidos
  private static readonly MALICIOUS_TOOLS: Array<{ name: string; pattern: RegExp }> = [
    { name: 'SqlMap Scanner', pattern: /sqlmap/i },
    { name: 'Nikto Web Scanner', pattern: /nikto/i },
    { name: 'DirBuster / Gobuster', pattern: /dirbuster|gobuster|ffuf|wfuzz/i },
    { name: 'Acunetix / Nessus', pattern: /acunetix|nessus/i },
    { name: 'Masscan / Zgrab', pattern: /masscan|zgrab|nmap/i },
    { name: 'Hydra Password Cracker', pattern: /hydra/i },
    { name: 'Headless Exploit Script', pattern: /phantomjs|casperjs|selenium-wire/i },
  ];

  // Clientes genéricos de script / scrapers suspeitos
  private static readonly SUSPICIOUS_CLIENTS: Array<{ name: string; pattern: RegExp }> = [
    { name: 'Python Scraper (requests/urllib)', pattern: /python-requests|aiohttp|urllib|scrapy/i },
    { name: 'CLI HTTP Client (curl/wget)', pattern: /^curl\/|^wget\/|^httpie\//i },
    { name: 'Node.js Raw Client (node-fetch/axios)', pattern: /node-fetch|axios\/|got\//i },
    { name: 'Go HTTP Client', pattern: /^Go-http-client/i },
    { name: 'Java HTTP Client', pattern: /Java\/|Apache-HttpClient/i },
  ];

  /**
   * Classifica a requisição e retorna a ação recomendada do Bot Management.
   */
  public static classifyTraffic(req: HttpRequestContext): BotClassificationResult {
    const userAgent = this.getHeaderValue(req.headers, 'user-agent') || '';
    const acceptLanguage = this.getHeaderValue(req.headers, 'accept-language') || '';
    const secFetchDest = this.getHeaderValue(req.headers, 'sec-fetch-dest') || '';
    const detectedSignatures: string[] = [];

    // 1. Verificar assinaturas de ferramentas maliciosas (MALICIOUS_BOT)
    for (const tool of this.MALICIOUS_TOOLS) {
      if (tool.pattern.test(userAgent)) {
        detectedSignatures.push('Malicious tool: ' + tool.name);
        return {
          category: 'MALICIOUS_BOT',
          isBot: true,
          isMalicious: true,
          isLegitimate: false,
          action: 'BLOCK',
          botName: tool.name,
          confidenceScore: 99,
          reason: 'Ferramenta maliciosa identificada na assinatura User-Agent: ' + tool.name,
          detectedSignatures,
        };
      }
    }

    // 2. Verificar bots legítimos e monitoramento oficial (LEGITIMATE_BOT)
    for (const bot of this.LEGITIMATE_BOTS) {
      if (bot.pattern.test(userAgent)) {
        detectedSignatures.push('Legitimate crawler: ' + bot.name);
        return {
          category: 'LEGITIMATE_BOT',
          isBot: true,
          isMalicious: false,
          isLegitimate: true,
          action: 'ALLOW',
          botName: bot.name,
          confidenceScore: 95,
          reason: 'Crawler legítimo autorizado: ' + bot.name,
          detectedSignatures,
        };
      }
    }

    // 3. Verificar clientes automatizados genéricos (SUSPICIOUS_BOT)
    for (const client of this.SUSPICIOUS_CLIENTS) {
      if (client.pattern.test(userAgent)) {
        detectedSignatures.push('Suspicious client: ' + client.name);

        // Rotas públicas de health check podem permitir curl/wget com throttle
        const isHealthCheck = req.path === '/api/health' || req.path === '/health';
        const isDevOrTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

        const action: BotAction = (isHealthCheck || isDevOrTest) ? 'ALLOW' : 'CHALLENGE';

        return {
          category: 'SUSPICIOUS_BOT',
          isBot: true,
          isMalicious: false,
          isLegitimate: isHealthCheck,
          action,
          botName: client.name,
          confidenceScore: 80,
          reason: 'Cliente automatizado genérico detectado (' + client.name + '). Aplicado desafio ou limitação.',
          detectedSignatures,
        };
      }
    }

    // 4. Análise de anomalias em requisições de navegadores alegados
    const isBrowserClaim = /Mozilla|Chrome|Safari|Firefox|Edge/i.test(userAgent);

    // Se afirma ser navegador moderno mas não envia Accept-Language nem Sec-Fetch-* em rotas autenticadas
    if (isBrowserClaim && !acceptLanguage && !secFetchDest && (req.path.includes('/login') || req.path.includes('/admin'))) {
      detectedSignatures.push('Headless / Script impersonating browser on sensitive route');
      return {
        category: 'SUSPICIOUS_BOT',
        isBot: true,
        isMalicious: false,
        isLegitimate: false,
        action: 'CHALLENGE',
        confidenceScore: 75,
        reason: 'Navegador simulado sem headers padrão em rota sensível. Desafio de bot requerido.',
        detectedSignatures,
      };
    }

    // 5. Se ausente User-Agent
    if (!userAgent.trim()) {
      detectedSignatures.push('Empty User-Agent');
      return {
        category: 'SUSPICIOUS_BOT',
        isBot: true,
        isMalicious: false,
        isLegitimate: false,
        action: 'CHALLENGE',
        confidenceScore: 70,
        reason: 'Requisição sem cabeçalho User-Agent.',
        detectedSignatures,
      };
    }

    // 6. Tráfego classificado como Humano (HUMAN)
    return {
      category: 'HUMAN',
      isBot: false,
      isMalicious: false,
      isLegitimate: true,
      action: 'ALLOW',
      confidenceScore: 90,
      reason: 'Tráfego com características e cabeçalhos compatíveis com usuário humano legítimo.',
      detectedSignatures,
    };
  }

  /**
   * Verifica se o User-Agent pertence à lista de bots legítimos.
   */
  public static isLegitimateBot(userAgent: string): boolean {
    return this.LEGITIMATE_BOTS.some(b => b.pattern.test(userAgent));
  }

  private static getHeaderValue(headers: Record<string, string | string[] | undefined>, name: string): string {
    const val = headers[name.toLowerCase()] || headers[name];
    if (Array.isArray(val)) return val.join(' ');
    return typeof val === 'string' ? val : '';
  }
}
