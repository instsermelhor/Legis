/**
 * scripts/secret-scan.ts — Legis Connect Enterprise Automated Secret Scanner
 * ─────────────────────────────────────────────────────────────────────────────
 * AUDIT & ENFORCEMENT ENGINE:
 * Scans all repository files (excluding ignored build artifacts and node_modules)
 * for hardcoded credentials, secret keys, private certificates, and insecure
 * environment variable prefixes (VITE_ secrets).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';

interface Finding {
  filePath: string;
  lineNumber: number;
  patternName: string;
  matchedTextRedacted: string;
  severity: 'CRITICAL' | 'HIGH';
}

const SECRET_PATTERNS: Array<{ name: string; regex: RegExp; severity: 'CRITICAL' | 'HIGH' }> = [
  { name: 'Google API Key', regex: /AIzaSy[0-9A-Za-z-_]{35}/g, severity: 'CRITICAL' },
  { name: 'OpenAI Secret Key', regex: /sk-[0-9A-Za-z]{32,}/g, severity: 'CRITICAL' },
  { name: 'WhatsApp WABA Live Key', regex: /waba_live_sec_[0-9A-Za-z_]{10,}/g, severity: 'CRITICAL' },
  { name: 'Private Key Header', regex: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g, severity: 'CRITICAL' },
  { name: 'Database Connection String with Credentials', regex: /(postgres|postgresql|mysql|mongodb):\/\/[a-zA-Z0-9_-]+:[^@\s"']+@[a-zA-Z0-9_.-]+/g, severity: 'CRITICAL' },
  { name: 'Hardcoded Admin Password Assignment', regex: /(const|let|var)\s+(ADMIN_PASSWORD|TEST_PASSWORD|DEFAULT_PASSWORD|SECRET_KEY)\s*=\s*['"][^'"]+['"]/g, severity: 'CRITICAL' },
  { name: 'Hardcoded Password Field Assignment', regex: /password:\s*['"](?!(\$locked\$|\$pbkdf2|\$scrambled\$|\||\$\{))[^\s'"]{3,}['"]/g, severity: 'CRITICAL' },
  { name: 'Forbidden VITE_ Secret Variable', regex: /VITE_(DATABASE_PASSWORD|JWT_SECRET|PRIVATE_KEY|ADMIN_TOKEN|API_SECRET|GEMINI_API_KEY)/g, severity: 'CRITICAL' },
  { name: 'GitHub Personal Access Token', regex: /(ghp|gho|ghu|ghs|ghr)_[0-9A-Za-z]{36}/g, severity: 'CRITICAL' },
  { name: 'Slack Bot / App Token', regex: /xox[baprs]-[0-9A-Za-z]{10,}/g, severity: 'HIGH' },
  { name: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24,}/g, severity: 'CRITICAL' },
];

const IGNORE_DIRS = [
  'node_modules',
  'dist',
  '.git',
  '.vercel',
  'brain_artifacts_link',
  '.gemini',
];

const IGNORE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar', '.gz', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3'];

function redact(text: string): string {
  if (text.length <= 8) return '[REDACTED]';
  return text.substring(0, 4) + '...' + text.substring(text.length - 4);
}

function scanFile(filePath: string, rootDir: string): Finding[] {
  const relativePath = path.relative(rootDir, filePath);

  // Skip .env.example, secret-scan.ts itself, and audit reports
  if (
    relativePath === '.env.example' ||
    relativePath === 'scripts/secret-scan.ts' ||
    relativePath.endsWith('secrets_audit_report.md') ||
    relativePath.endsWith('implementation_plan.md') ||
    relativePath.endsWith('walkthrough.md') ||
    relativePath.startsWith('docs/blueprints/')
  ) {
    return [];
  }

  const findings: Finding[] = [];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of SECRET_PATTERNS) {
        pattern.regex.lastIndex = 0; // Reset regex state
        const match = pattern.regex.exec(line);
        if (match) {
          findings.push({
            filePath: relativePath,
            lineNumber: i + 1,
            patternName: pattern.name,
            matchedTextRedacted: redact(match[0]),
            severity: pattern.severity,
          });
        }
      }
    }
  } catch {
    // Binary or unreadable file
  }
  return findings;
}

function walkDir(dir: string, rootDir: string): Finding[] {
  let results: Finding[] = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        results = results.concat(walkDir(fullPath, rootDir));
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (!IGNORE_EXTENSIONS.includes(ext)) {
        results = results.concat(scanFile(fullPath, rootDir));
      }
    }
  }
  return results;
}

export function runSecretScan(targetDir: string = process.cwd()): Finding[] {
  return walkDir(targetDir, targetDir);
}

function main() {
  const rootDir = process.cwd();
  console.log('================================================================');
  console.log('LEGIS CONNECT — SECRETS & CREDENTIAL SECURITY SCANNER');
  console.log('================================================================');
  console.log(`Auditando repositório: ${rootDir}\n`);

  const findings = runSecretScan(rootDir);

  if (findings.length === 0) {
    console.log('✅ NENHUM SEGREDO DETECTADO NO CÓDIGO-FONTE!');
    console.log('Conformidade com a Regra Mestra Legis Connect: 100%\n');
    process.exit(0);
  } else {
    console.error(`❌ ALERTA DE SEGURANÇA: ${findings.length} SEGREDO(S) DETECTADO(S)!`);
    console.error('----------------------------------------------------------------');
    for (const f of findings) {
      console.error(`[${f.severity}] ${f.filePath}:${f.lineNumber} → Padrão: ${f.patternName} (${f.matchedTextRedacted})`);
    }
    console.error('----------------------------------------------------------------');
    console.error('AÇÃO EXIGIDA: Remova todas as credenciais antes de realizar o commit ou deploy.');
    process.exit(1);
  }
}

main();
