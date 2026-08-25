/**
 * scripts/security-audit-gate.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — ENTERPRISE SECURITY AUDIT & CI/CD SECURITY GATE ENGINE v3.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Executa varredura profunda de segurança estática (SAST), segredos, dependências,
 * autorização RBAC, isolamento multi-tenant, RLS e conformidade de headers.
 * 
 * Regra Mestra:
 *   CRITICAL VULNERABILITY  → DEPLOY = BLOCKED (Exit Code 1)
 *   HIGH VULNERABILITY      → DEPLOY = BLOCKED (a menos que haja exceção formal válida)
 *   MEDIUM / LOW            → Alerta & Registro para Acompanhamento
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Polyfills para ambiente de execução CLI (Node.js) ───────────────────────
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new MemoryStorage();
}
if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as any).sessionStorage = new MemoryStorage();
}
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    location: { origin: 'http://localhost:3000', pathname: '/' }
  };
}

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { RBAC_MATRIX } from '../security/rbacMatrix';
import type { SystemRole } from '../security/rbac';
import { auditOwaspTop10 } from '../security/securityAuditEngine';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type Exploitability = 'EXPLOITABLE' | 'POTENTIALLY_EXPLOITABLE' | 'NON_EXPLOITABLE' | 'FALSE_POSITIVE' | 'NOT_VALIDATED';

export interface SecurityFinding {
  id: string;
  title: string;
  category: 'SAST' | 'SECRETS' | 'DEPENDENCY' | 'RBAC' | 'MULTI_TENANT' | 'RLS' | 'HEADERS' | 'CONFIG' | 'AUTH';
  severity: Severity;
  exploitability: Exploitability;
  file?: string;
  line?: number;
  description: string;
  remediation: string;
  isExceptionApproved?: boolean;
}

export interface SecurityException {
  id: string;
  vulnerability: string;
  severity: Severity;
  justification: string;
  riskAssessment: string;
  owner: string;
  expiresAt: string;
  mitigation: string;
  approvedBy: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ─── 1. Carregar Exceções Formais de Segurança ───────────────────────────────
function loadSecurityExceptions(): SecurityException[] {
  const exceptionsFile = path.join(ROOT_DIR, 'security', 'security-exceptions.json');
  if (!fs.existsSync(exceptionsFile)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(exceptionsFile, 'utf-8'));
    const now = new Date();
    return (data as SecurityException[]).filter(exc => {
      const expDate = new Date(exc.expiresAt);
      return expDate > now; // Exceção só é válida se não estiver expirada
    });
  } catch {
    return [];
  }
}

// Helper centralizado para listar arquivos do projeto
function getAllSourceFiles(): string[] {
  const files: string[] = [];
  const scannedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.sql'];
  const targetDirs = [
    'api', 'compliance', 'components', 'constants', 'context', 'data',
    'hooks', 'infrastructure', 'lib', 'platform', 'scripts', 'security',
    'server', 'services', 'tests', 'utils'
  ];

  // Root files
  const rootFiles = ['App.tsx', 'index.tsx', 'constants.ts', 'types.ts', 'vite.config.ts', 'eslint.config.js', 'package.json', 'vercel.json'];
  for (const rf of rootFiles) {
    const full = path.join(ROOT_DIR, rf);
    if (fs.existsSync(full)) files.push(full);
  }

  function walk(currentDir: string) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isSymbolicLink() || entry.name.startsWith('.')) continue;
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (scannedExtensions.includes(ext)) {
            try {
              const stat = fs.statSync(fullPath);
              if (stat.size < 300_000) {
                files.push(fullPath);
              }
            } catch {}
          }
        }
      }
    } catch {}
  }

  for (const td of targetDirs) {
    const dirPath = path.join(ROOT_DIR, td);
    if (fs.existsSync(dirPath)) {
      walk(dirPath);
    }
  }

  return files;
}

// ─── 2. SAST Scanner (Static Application Security Testing) ───────────────────
function runSastScan(sourceFiles: string[]): SecurityFinding[] {
  const findings: SecurityFinding[] = [];

  const dangerousPatterns: Array<{
    id: string;
    regex: RegExp;
    title: string;
    severity: Severity;
    exploitability: Exploitability;
    description: string;
    remediation: string;
    excludeFiles?: RegExp;
  }> = [
    {
      id: 'SAST-001',
      regex: /\beval\s*\(/,
      title: 'Uso perigoso de eval()',
      severity: 'CRITICAL',
      exploitability: 'EXPLOITABLE',
      description: 'Execução dinâmica de código via eval() permite Remote Code Execution (RCE).',
      remediation: 'Substitua eval() por parsers seguros de JSON ou despacho estático de funções.',
      excludeFiles: /securityAuditEngine|security-audit-gate/
    },
    {
      id: 'SAST-002',
      regex: /dangerouslySetInnerHTML/,
      title: 'XSS Potencial via dangerouslySetInnerHTML',
      severity: 'HIGH',
      exploitability: 'POTENTIALLY_EXPLOITABLE',
      description: 'Inserção de HTML bruto no DOM sem passar por sanitizeXss() ou sanitizador aprovado.',
      remediation: 'Utilize sanitizeXss() ou biblioteca DOMPurify antes de renderizar HTML.',
      excludeFiles: /securityAuditEngine|security-audit-gate/
    },
    {
      id: 'SAST-003',
      regex: /(?:\.query|\.rpc|sql`|rawSql|\.raw\()\s*[^;\n]*(?:SELECT|INSERT|UPDATE|DELETE|WHERE|FROM)[^;\n]*\$\{[^}]+\}/i,
      title: 'Interpolação de Strings em Queries SQL (Risco de SQLi)',
      severity: 'CRITICAL',
      exploitability: 'EXPLOITABLE',
      description: 'Concatenação direta de parâmetros em consultas SQL permite SQL Injection.',
      remediation: 'Utilize prepared statements e consultas parametrizadas do ORM ou Supabase RPC.',
      excludeFiles: /securityAuditEngine|security-audit-gate|\.sql/
    },
    {
      id: 'SAST-004',
      regex: /child_process\.(exec|execSync)\s*\(/g,
      title: 'Injeção de Comandos de Sistema Operacional (Command Injection)',
      severity: 'CRITICAL',
      exploitability: 'EXPLOITABLE',
      description: 'Execução de comandos de shell com interpolação insegura.',
      remediation: 'Utilize execFile/spawn com argumentos segregados e validação de input estrita.',
      excludeFiles: /run_migrations|security-audit-gate/
    },
    {
      id: 'SAST-005',
      regex: /localStorage\.setItem\s*\(\s*['"`](auth_token|token|jwt|session_secret)['"`]/gi,
      title: 'Armazenamento de Segredo Crítico em LocalStorage',
      severity: 'MEDIUM',
      exploitability: 'POTENTIALLY_EXPLOITABLE',
      description: 'Tokens sensíveis de alta autoridade não devem residir em localStorage sem criptografia.',
      remediation: 'Utilize cookies HttpOnly/SameSite ou sessões efêmeras em memória.',
    }
  ];

  for (const fullPath of sourceFiles) {
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      for (const pattern of dangerousPatterns) {
        if (pattern.excludeFiles && pattern.excludeFiles.test(fullPath)) continue;

        lines.forEach((lineText, lineIdx) => {
          if (pattern.regex.test(lineText)) {
            findings.push({
              id: pattern.id,
              title: pattern.title,
              category: 'SAST',
              severity: pattern.severity,
              exploitability: pattern.exploitability,
              file: path.relative(ROOT_DIR, fullPath),
              line: lineIdx + 1,
              description: pattern.description,
              remediation: pattern.remediation,
            });
          }
        });
      }
    } catch {}
  }

  return findings;
}

// ─── 3. Secrets Scanner ───────────────────────────────────────────────────────
function runSecretsScan(sourceFiles: string[]): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const secretPatterns = [
    { name: 'Chave Privada RSA / OpenSSH', regex: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/, severity: 'CRITICAL' as Severity },
    { name: 'Token de Acesso AWS', regex: /AKIA[0-9A-Z]{16}/, severity: 'CRITICAL' as Severity },
    { name: 'Google API Key Hardcoded', regex: /AIzaSy[A-Za-z0-9-_]{33}/, severity: 'CRITICAL' as Severity },
    { name: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24}/, severity: 'CRITICAL' as Severity },
    { name: 'GitHub Personal Token', regex: /ghp_[0-9a-zA-Z]{36}/, severity: 'CRITICAL' as Severity },
  ];

  for (const fullPath of sourceFiles) {
    if (fullPath.includes('secret-scan') || fullPath.includes('security-audit-gate')) continue;
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((lineText, idx) => {
        for (const pat of secretPatterns) {
          if (pat.regex.test(lineText)) {
            findings.push({
              id: 'SECRET-001',
              title: `Credencial / Segredo Real Detectado: ${pat.name}`,
              category: 'SECRETS',
              severity: pat.severity,
              exploitability: 'EXPLOITABLE',
              file: path.relative(ROOT_DIR, fullPath),
              line: idx + 1,
              description: `Foi detectada uma credencial real no código-fonte (${pat.name}). Violação absoluta da Regra Mestra.`,
              remediation: 'Remova a credencial imediatamente, rotacione a chave no provedor e utilize variáveis de ambiente (.env / Secret Manager).'
            });
          }
        }
      });
    } catch {}
  }

  return findings;
}

// ─── 4. RBAC & Authorization Integrity ─────────────────────────────────────────
function runRbacSecurityScan(): SecurityFinding[] {
  const findings: SecurityFinding[] = [];

  // Validar se todas as roles oficiais do sistema estão mapeadas no RBAC
  // Sincronizado com o tipo SystemRole em security/rbac.ts
  const requiredRoles = [
    'super_admin', 'admin', 'staff_finance_admin',
    'staff_compliance_auditor', 'staff_support_l1',
    'gestor', 'lawyer', 'secretary',
    'legal_assistant', 'intern', 'student', 'client'
  ];

  for (const r of requiredRoles) {
    if (!Object.keys(RBAC_MATRIX).includes(r as any)) {
      findings.push({
        id: 'RBAC-001',
        title: `Papel do Sistema Ausente da Matriz RBAC: ${r}`,
        category: 'RBAC',
        severity: 'CRITICAL',
        exploitability: 'EXPLOITABLE',
        description: `O papel ${r} é mandatório e não foi encontrado na definição oficial SYSTEM_ROLES.`,
        remediation: 'Adicione o papel em SYSTEM_ROLES e configure a matriz de permissões em rbacMatrix.ts.'
      });
    }
  }

  // Validar que papéis não-administrativos nunca possuam acesso MANAGE em system ou security
  const lowPrivilegeRoles = ['client', 'intern', 'student', 'secretary', 'legal_assistant'];
  for (const role of lowPrivilegeRoles) {
    const matrix = RBAC_MATRIX[role as any];
    if (matrix) {
      if (matrix.system && matrix.system.MANAGE === 'ALLOW') {
        findings.push({
          id: 'RBAC-002',
          title: `Privilege Escalation Crítico: ${role} com acesso a system.MANAGE`,
          category: 'RBAC',
          severity: 'CRITICAL',
          exploitability: 'EXPLOITABLE',
          description: `O papel de menor privilégio ${role} recebeu permissão MANAGE no recurso system.`,
          remediation: 'Configure a ação system.MANAGE como DENY para papéis operacionais e clientes.'
        });
      }
      if (matrix.audit && matrix.audit.DELETE === 'ALLOW') {
        findings.push({
          id: 'RBAC-003',
          title: `Violação de Imutabilidade: ${role} com permissão audit.DELETE`,
          category: 'RBAC',
          severity: 'CRITICAL',
          exploitability: 'EXPLOITABLE',
          description: `Logs de auditoria devem ser estritamente append-only. ${role} possui permissão de deleção.`,
          remediation: 'Remova permissões de exclusão de logs de auditoria (audit.DELETE deve ser DENY).'
        });
      }
    }
  }

  return findings;
}

// ─── 5. Multi-Tenant & RLS Defense Scan ────────────────────────────────────────
function runMultiTenantRlsScan(): SecurityFinding[] {
  const findings: SecurityFinding[] = [];

  // Verificar existência de scripts RLS
  const rlsScripts = [
    path.join(ROOT_DIR, 'infrastructure', 'db', 'scripts', 'apply_production_rls.sql'),
    path.join(ROOT_DIR, 'infrastructure', 'db', 'scripts', 'complete-rls-policies.sql'),
    path.join(ROOT_DIR, 'infrastructure', 'db', 'scripts', 'update_rls_rbac_v2.sql')
  ];

  for (const scriptPath of rlsScripts) {
    if (!fs.existsSync(scriptPath)) {
      findings.push({
        id: 'RLS-001',
        title: `Script de Defesa RLS Ausente: ${path.basename(scriptPath)}`,
        category: 'RLS',
        severity: 'HIGH',
        exploitability: 'POTENTIALLY_EXPLOITABLE',
        description: 'Políticas de isolamento RLS a nível de banco de dados não encontradas.',
        remediation: 'Restaure e aplique os scripts SQL de Row-Level Security no diretório infrastructure/db/scripts/.'
      });
    }
  }

  // Verificar se tenantGuard e scopeValidator existem
  const guards = [
    path.join(ROOT_DIR, 'security', 'tenantGuard.ts'),
    path.join(ROOT_DIR, 'security', 'scopeValidator.ts')
  ];

  for (const g of guards) {
    if (!fs.existsSync(g)) {
      findings.push({
        id: 'MULTI_TENANT-001',
        title: `Guarda de Isolamento Multi-Tenant Ausente: ${path.basename(g)}`,
        category: 'MULTI_TENANT',
        severity: 'CRITICAL',
        exploitability: 'EXPLOITABLE',
        description: 'Falta de mecanismo de defesa contra IDOR e vazamento cross-tenant.',
        remediation: 'Implemente o guarda de validação de tenant e escopo no diretório security/.'
      });
    }
  }

  return findings;
}

// ─── 6. Security Headers & Configuration Scan ─────────────────────────────────
function runConfigScan(): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const vercelJsonPath = path.join(ROOT_DIR, 'vercel.json');

  if (fs.existsSync(vercelJsonPath)) {
    try {
      const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
      const headers = vercelConfig.headers || [];
      const headerNames: string[] = [];
      headers.forEach((h: any) => {
        if (h.headers) {
          h.headers.forEach((subHeader: any) => headerNames.push(subHeader.key.toLowerCase()));
        }
      });

      const requiredHeaders = [
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy',
        'strict-transport-security'
      ];

      for (const req of requiredHeaders) {
        if (!headerNames.includes(req)) {
          findings.push({
            id: 'HEADERS-001',
            title: `Security Header Ausente no vercel.json: ${req}`,
            category: 'HEADERS',
            severity: 'MEDIUM',
            exploitability: 'POTENTIALLY_EXPLOITABLE',
            description: `O cabeçalho de proteção HTTP ${req} não está configurado em vercel.json.`,
            remediation: `Adicione o cabeçalho ${req} com política restritiva em vercel.json.`
          });
        }
      }
    } catch {}
  }

  return findings;
}

// ─── 7. Dependency Scanning (Package.json Integrity) ──────────────────────────
function runDependencyScan(): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      // Verificar dependências reconhecidamente perigosas ou obsoletas
      const deprecatedOrInsecure = ['node-serialize', 'serialize-javascript@<3.1.0', 'request'];
      for (const dep of deprecatedOrInsecure) {
        if (allDeps[dep]) {
          findings.push({
            id: 'DEP-001',
            title: `Dependência Vulnerável ou Insegura Detectada: ${dep}`,
            category: 'DEPENDENCY',
            severity: 'HIGH',
            exploitability: 'POTENTIALLY_EXPLOITABLE',
            description: `O pacote ${dep} possui vulnerabilidades conhecidas e deve ser substituído.`,
            remediation: `Remova ou atualize o pacote ${dep} para uma versão estável e auditada.`
          });
        }
      }
    } catch {}
  }

  return findings;
}

// ─── 8. Edge Security & WAF Perimeter Scan ─────────────────────────────────────
function runEdgeSecurityScan(): SecurityFinding[] {
  const findings: SecurityFinding[] = [];

  const requiredEdgeModules = [
    { file: path.join(ROOT_DIR, 'security', 'edge', 'wafEngine.ts'), name: 'WAF Engine (wafEngine.ts)' },
    { file: path.join(ROOT_DIR, 'security', 'edge', 'botManagementEngine.ts'), name: 'Bot Management Engine (botManagementEngine.ts)' },
    { file: path.join(ROOT_DIR, 'security', 'edge', 'rateLimitingEngine.ts'), name: 'Rate Limiting Engine (rateLimitingEngine.ts)' },
    { file: path.join(ROOT_DIR, 'security', 'edge', 'bruteForceProtection.ts'), name: 'Anti-Brute Force (bruteForceProtection.ts)' },
    { file: path.join(ROOT_DIR, 'security', 'edge', 'originCloakProtection.ts'), name: 'Origin Shield (originCloakProtection.ts)' },
    { file: path.join(ROOT_DIR, 'security', 'edge', 'threatIntelligence.ts'), name: 'Threat Intelligence (threatIntelligence.ts)' },
    { file: path.join(ROOT_DIR, 'security', 'edge', 'multiTenantCacheGuard.ts'), name: 'Multi-Tenant Cache Guard (multiTenantCacheGuard.ts)' },
    { file: path.join(ROOT_DIR, 'api', '_edge-shield.ts'), name: 'Master Edge Shield Wrapper (_edge-shield.ts)' },
    { file: path.join(ROOT_DIR, 'security', 'edge', 'ip-reputation-governance.json'), name: 'IP Reputation Governance Registry' },
  ];

  for (const mod of requiredEdgeModules) {
    if (!fs.existsSync(mod.file)) {
      findings.push({
        id: 'EDGE-001',
        title: `Módulo do Escudo de Borda Ausente: ${mod.name}`,
        category: 'CONFIG',
        severity: 'CRITICAL',
        exploitability: 'EXPLOITABLE',
        description: `O componente perimetral obrigatório ${mod.name} não foi encontrado na infraestrutura.`,
        remediation: 'Implemente o componente do Escudo de Borda correspondente no diretório security/edge/ ou api/.'
      });
    }
  }

  return findings;
}

// ─── 9. Motor de Avaliação & Decisão do Security Gate ─────────────────────────
export async function runSecurityAuditGate(): Promise<boolean> {
  console.log('\n================================================================');
  console.log('  LEGIS CONNECT — ENTERPRISE SECURITY AUDIT & CI/CD GATE');
  console.log('================================================================');
  console.log(`  Data da Auditoria: ${new Date().toISOString()}`);
  console.log(`  Diretório Auditado: ${ROOT_DIR}`);
  console.log('----------------------------------------------------------------\n');

  const exceptions = loadSecurityExceptions();
  console.log(`ℹ️  Exceções Formais de Segurança Ativas: ${exceptions.length}`);

  const sourceFiles = getAllSourceFiles();
  console.log(`📁 Arquivos de Código-Fonte Auditados: ${sourceFiles.length}`);

  const allFindings: SecurityFinding[] = [
    ...runSastScan(sourceFiles),
    ...runSecretsScan(sourceFiles),
    ...runRbacSecurityScan(),
    ...runMultiTenantRlsScan(),
    ...runConfigScan(),
    ...runDependencyScan(),
    ...runEdgeSecurityScan(),
  ];

  // Mapear exceções aprovadas
  allFindings.forEach(f => {
    const isApproved = exceptions.some(exc => exc.vulnerability.toLowerCase().includes(f.title.toLowerCase()) || exc.id === f.id);
    if (isApproved) {
      f.isExceptionApproved = true;
    }
  });

  const criticalFindings = allFindings.filter(f => f.severity === 'CRITICAL');
  const unapprovedHighFindings = allFindings.filter(f => f.severity === 'HIGH' && !f.isExceptionApproved);
  const approvedHighFindings = allFindings.filter(f => f.severity === 'HIGH' && f.isExceptionApproved);
  const mediumFindings = allFindings.filter(f => f.severity === 'MEDIUM');
  const lowFindings = allFindings.filter(f => f.severity === 'LOW' || f.severity === 'INFO');

  // OWASP Top 10 Summary
  const owaspItems = auditOwaspTop10();
  console.log('🛡️  OWASP TOP 10 MITIGATION CHECK:');
  owaspItems.forEach(item => {
    console.log(`  ✓ [${item.category}] ${item.name} → ${item.status} (${item.mitigation})`);
  });

  console.log('\n----------------------------------------------------------------');
  console.log('📊 RESUMO DOS ACHADOS DE SEGURANÇA:');
  console.log(`  🔴 CRITICAL Findings (Bloqueio Imediato):   ${criticalFindings.length}`);
  console.log(`  🟠 HIGH Findings Não Aprovados (Bloqueio):  ${unapprovedHighFindings.length}`);
  console.log(`  🟡 HIGH Findings com Exceção Formal:       ${approvedHighFindings.length}`);
  console.log(`  🔵 MEDIUM Findings (Alerta):                ${mediumFindings.length}`);
  console.log(`  ⚪ LOW / INFO Findings:                     ${lowFindings.length}`);
  console.log('----------------------------------------------------------------\n');

  if (allFindings.length > 0) {
    console.log('📋 DETALHAMENTO DOS ACHADOS:');
    allFindings.forEach((f, idx) => {
      const statusTag = f.isExceptionApproved ? ' [EXCEÇÃO APROVADA]' : '';
      console.log(`  ${idx + 1}. [${f.severity}] ${f.title}${statusTag}`);
      if (f.file) console.log(`     Localização: ${f.file}:${f.line || 1}`);
      console.log(`     Descrição:   ${f.description}`);
      console.log(`     Remediação:  ${f.remediation}\n`);
    });
  }

  // ─── DECISÃO FINAL DO SECURITY GATE ──────────────────────────────────────────
  const isBlocked = criticalFindings.length > 0 || unapprovedHighFindings.length > 0;

  // Calcular Security Score (0 a 100)
  let score = 100;
  score -= criticalFindings.length * 35;
  score -= unapprovedHighFindings.length * 15;
  score -= mediumFindings.length * 2;
  if (score < 0) score = 0;

  console.log('================================================================');
  console.log(`  SECURITY SCORE: ${score} / 100`);

  if (isBlocked) {
    console.log('  DECISÃO DO GATE: ❌ DEPLOY BLOCKED');
    console.log('  MOTIVO: Foram detectadas vulnerabilidades CRÍTICAS ou ALTAS não mitigadas.');
    console.log('================================================================\n');
    return false;
  } else {
    console.log('  DECISÃO DO GATE: ✅ DEPLOY APPROVED (Security Gate Passed)');
    console.log('  CONFORMIDADE: Nenhuma vulnerabilidade bloqueadora ativa.');
    console.log('================================================================\n');
    return true;
  }
}

// Execução direta via CLI
runSecurityAuditGate().then(passed => {
  process.exit(passed ? 0 : 1);
}).catch(err => {
  console.error('Erro fatal durante execução do Security Gate:', err);
  process.exit(1);
});
