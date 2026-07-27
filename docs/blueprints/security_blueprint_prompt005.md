# 🔐 SECURITY ARCHITECTURE BLUEPRINT — LEGIS CONNECT
**PROMPT 005 — Auditoria Completa de Segurança, IAM e Modelo Zero Trust**
**Application Security Architect | OWASP | LGPD | Zero Trust | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A Legis Connect apresenta o que pode ser classificado como **falha de segurança existencial**: toda a camada de segurança existe no navegador do usuário — onde não tem qualquer valor protetivo. A autenticação é feita pelo cliente, a autorização é decidida pelo cliente, os dados são armazenados pelo cliente e a auditoria é registrada pelo cliente. Em qualquer modelo de segurança moderno, o cliente (browser) é a superfície de ataque, não o guardião da segurança.

**Score de Segurança AS-IS: 7/100**

Ao mesmo tempo, o projeto demonstra **intenção de segurança**: o `cryptoUtils.ts` tem AES-GCM 256-bit e SHA-256 reais, o `rbac.ts` tem RBAC granular com 9 roles, o `auditLogger.ts` tem chain integrity e o `provisioningService.ts` tem idempotência. Esta intenção precisa ser movida para o servidor.

**O risco regulatório atual é máximo**: uma multa LGPD pode chegar a R$50 milhões ou 2% do faturamento anual. Uma plataforma jurídica com CPFs, processos e documentos em localStorage plaintext não está em conformidade com nenhum artigo da Lei 13.709/2018.

---

## ETAPA 1 — MAPEAMENTO COMPLETO DA SUPERFÍCIE DE SEGURANÇA

### 1.1 Mapa de Superfície de Ataque (Attack Surface Map)

```
SUPERFÍCIE DE ATAQUE ATUAL — LEGIS CONNECT
═══════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────┐
│                    BROWSER (Zona de Ataque)                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  React Bundle (2.3MB não ofuscado)                         │  │
│  │  ┌─────────────────────┐  ┌──────────────────────────┐    │  │
│  │  │  Credenciais        │  │  Lógica de Negócio       │    │  │
│  │  │  @@Rk08266570# ←🔴 │  │  RBAC, Auth, Provisioning│    │  │
│  │  │  API_KEY Gemini ←🔴 │  │  (bypassável pelo usuário│    │  │
│  │  │  Senhas staff ←🔴   │  │  via DevTools)           │    │  │
│  │  └─────────────────────┘  └──────────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  localStorage (Zona Crítica Exposta)                       │  │
│  │  legis_user         ← sessão sem expiração, sem JWT       │  │
│  │  legis_admin_users  ← senhas btoa de todos os admins      │  │
│  │  legis_platform_staff ← senhas btoa de toda a equipe      │  │
│  │  legis_clients      ← CPF + endereço + histórico PII      │  │
│  │  legis_interns      ← CPF de estagiários PII              │  │
│  │  legis_secretaries  ← CPF de secretárias PII              │  │
│  │  legis_financial_tx ← transações financeiras              │  │
│  │  legis_audit_log    ← log adulterável (hash btoa)         │  │
│  │  legis_app_config   ← dbApiKey Firebase/Supabase ←🔴     │  │
│  │  legis_received_docs← documentos jurídicos (PDF base64)   │  │
│  │  legis_ek           ← chave AES-GCM (sessionStorage) ←🔴 │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
         │                                │
         ▼ (requests diretos do browser)  ▼ (bundle expõe)
┌──────────────┐                ┌─────────────────────────────────┐
│ Gemini API   │                │  Firebase Firestore API         │
│ (API Key     │                │  (projectId + apiKey expostos)  │
│  exposta)    │                └─────────────────────────────────┘
└──────────────┘

AUSENTE: Backend, Gateway, WAF, Rate Limiter, Firewall, SIEM
```

### 1.2 Pontos de Entrada Identificados

| Ponto de Entrada | Proteção Atual | Risco |
|---|---|---|
| `/` — Landing Page | Nenhuma (público) | 🟢 OK |
| Form de Login | `hashPassword(btoa)` client-side | 🔴 CRÍTICO |
| Form de Cadastro | Sem validação de e-mail único | 🔴 CRÍTICO |
| Painel Admin | `user.role === 'admin'` no frontend | 🔴 CRÍTICO |
| `localStorage` via DevTools | Nenhuma | 🔴 CRÍTICO |
| Gemini API (direto do browser) | API Key no bundle | 🔴 CRÍTICO |
| Firebase/Supabase REST | ApiKey no localStorage | 🔴 CRÍTICO |
| Webhook de pagamento (simulado) | Sem validação de assinatura | 🔴 CRÍTICO |
| URL de rota (via state machine) | Sem proteção real | 🔴 CRÍTICO |
| Import de PDF (base64) | Sem scan de malware | 🟠 ALTO |

### 1.3 Fronteiras de Confiança (Trust Boundaries)

```
MODELO ATUAL (sem fronteiras reais):
  Browser ←→ [TUDO NA MESMA ZONA DE CONFIANÇA] ←→ localStorage

MODELO PROPOSTO (Zero Trust com fronteiras claras):
  Browser (Untrusted Zone)
      │ HTTPS + JWT httpOnly cookie
      ▼
  API Gateway (DMZ — WAF + Rate Limit + DDoS Protection)
      │ mTLS interna
      ▼
  NestJS Services (Trusted Zone)
      │ Service Account credentials
      ▼
  PostgreSQL / Redis / S3 (Secured Zone — sem acesso externo)
```

---

## ETAPA 2 — AUDITORIA DO PROCESSO DE AUTENTICAÇÃO

### 2.1 Fluxo de Autenticação Atual (AS-IS)

```
Usuário digita email + senha
          │
          ▼
LoginForm.tsx / LoginModal.tsx
          │
          ▼
handleLogin(email, password) — App.tsx
          │
          ├─── [Verifica Admin/Staff]
          │         │
          │         ▼
          │    localStorage.getItem('legis_admin_users')
          │         │
          │         ▼
          │    hashPassword(password)    ← btoa("legis:" + password)
          │         │
          │         ▼
          │    user.password === hashed  ← comparação client-side
          │         │
          │    [SE VERDADEIRO]
          │         ▼
          │    setUser({ role: 'admin', email })
          │    localStorage.setItem('legis_user', JSON.stringify(user))
          │    handleNavigate('adminDashboard')
          │
          ├─── [Verifica Advogado]
          │    allLawyers.find(l => l.email === email)
          │         ▼
          │    if (password) → ← QUALQUER SENHA FUNCIONA
          │         ▼
          │    setUser({ role: 'lawyer', data: lawyer })
          │
          └─── [Verifica Cliente]
               if (password) → ← QUALQUER SENHA FUNCIONA
```

### 2.2 Vulnerabilidades do Processo de Autenticação

| Vulnerabilidade | Descrição | CVE Equivalente | Risco CVSS |
|---|---|---|---|
| **Auth client-side** | Todo o processo de verificação roda no browser | OWASP A07 | 🔴 10.0 |
| **Qualquer senha autentica advogados/clientes** | `if (password)` — qualquer string não-vazia funciona | OWASP A07 | 🔴 10.0 |
| **btoa como hash de senha** | `btoa("legis:" + password)` — reversível em uma linha | OWASP A02 | 🔴 9.8 |
| **Sessão sem JWT** | `localStorage.setItem('legis_user', ...)` — manipulável | OWASP A07 | 🔴 9.8 |
| **Sem expiração de sessão** | Sessão válida para sempre (sem `exp` timestamp) | OWASP A07 | 🔴 9.1 |
| **Sem rate limiting no login** | Brute force irrestrito contra qualquer conta | OWASP A07 | 🔴 8.8 |
| **Senha hardcoded no código** | `@@Rk08266570#` em `App.tsx` e `LoginForm.tsx` | OWASP A05 | 🔴 9.0 |
| **Sem bloqueio de conta** | Sem contador de tentativas falhas | OWASP A07 | 🟠 7.5 |
| **Sem verificação de e-mail** | Cadastro ativo imediatamente sem confirmar e-mail | OWASP A07 | 🟠 7.2 |
| **Credenciais no controle de versão** | Senha do super admin potencialmente no Git | OWASP A05 | 🔴 9.5 |

### 2.3 Avaliação: A Autenticação é Confiável?

**NÃO**. De forma categoricamente absoluta:

1. **Pode ser manipulada pelo usuário?** Sim — `localStorage.setItem('legis_user', '{"role":"admin","email":"x@x.com"}')` concede acesso total ao painel admin sem qualquer verificação.

2. **Existe proteção contra brute force?** Não — nenhum contador de tentativas, nenhum CAPTCHA, nenhum delay.

3. **Existe rastreabilidade?** Parcialmente — `auditLogger` registra `LOGIN_SUCCESS` e `LOGIN_FAILURE`, mas os logs estão no mesmo localStorage que pode ser apagado.

---

## ETAPA 3 — AUDITORIA DO ARMAZENAMENTO DE SENHAS

### 3.1 Análise do `hashPassword()`

```typescript
// services/mockDataService.ts
export function hashPassword(password: string): string {
  return btoa("legis:" + password);
  //     ↑ Base64 ENCODING — NÃO É UMA FUNÇÃO DE HASH
}

// btoa("legis:" + "supervisor123")
// → "bGVnaXM6c3VwZXJ2aXNvcjEyMw=="
//
// Reversão imediata:
// atob("bGVnaXM6c3VwZXJ2aXNvcjEyMw==").replace("legis:", "")
// → "supervisor123"
//
// Tempo para quebrar: < 0.1 milissegundo
```

### 3.2 Matriz de Avaliação vs. Padrões NIST

| Item | Atual | Padrão NIST SP 800-63B | Risco | Solução |
|---|---|---|---|---|
| **Algoritmo** | `btoa` (Base64) | Argon2id / bcrypt (cost ≥ 12) / scrypt | 🔴 CRÍTICO | Argon2id (memória 64MB, iterações 3, paralelismo 4) |
| **Salt** | Nenhum (prefixo fixo `"legis:"`) | Salt aleatório de 128 bits por senha | 🔴 CRÍTICO | Salt aleatório criptográfico por bcrypt/Argon2id |
| **Custo Computacional** | Zero (btoa é instantâneo) | Deve levar ≥ 100ms por hash | 🔴 CRÍTICO | bcrypt work factor 12+ |
| **Armazenamento** | `localStorage` (plaintext acessível) | Banco de dados servidor, sem acesso do cliente | 🔴 CRÍTICO | PostgreSQL server-side (NestJS) |
| **Comprimento mínimo** | Sem validação | Mínimo 12 caracteres (NIST 2024) | 🔴 CRÍTICO | Zod: `z.string().min(12)` |
| **Recuperação de senha** | Inexistente | Fluxo seguro com token de uso único (expiração 15min) | 🟠 ALTO | Reset link com UUID + expiração + bcrypt |
| **Verificação de vazamento** | Inexistente | Verificar contra HaveIBeenPwned API | 🟡 MÉDIO | `pwned-passwords` API em tempo de cadastro |
| **Histórico de senha** | Inexistente | Impedir reutilização das últimas 12 | 🟡 MÉDIO | Tabela `password_history` no PostgreSQL |
| **Bloqueio após falhas** | Inexistente | Bloqueio progressivo (5 tentativas) | 🔴 CRÍTICO | Redis contador + JWT blocklist |

### 3.3 Política de Senhas — Proposta

```
Regras de Complexidade:
  ✅ Mínimo 12 caracteres
  ✅ Pelo menos 1 maiúscula, 1 minúscula, 1 número, 1 símbolo
  ❌ SEM regras de rotação obrigatória (NIST 2024 removeu esta prática)
  ✅ Bloqueio após 5 tentativas consecutivas (15 minutos de desbloqueio)
  ✅ Verificação contra HaveIBeenPwned (k-anonymity API — privacidade preservada)

Armazenamento:
  Argon2id: memory=65536 (64MB), iterations=3, parallelism=4
  Alternativa: bcrypt work factor 14 (≈250ms em hardware moderno)

Rotação:
  Super Admin: a cada 90 dias (com notificação)
  Admin/Staff: a cada 180 dias
  Lawyer/Client: sem expiração forçada (NIST recomenda)

Recuperação:
  Token UUID v4 + expiração de 15 minutos + uso único
  Entregue via email (SendGrid/SES) — nunca via SMS (SIM swap)
```

---

## ETAPA 4 — AUDITORIA DE AUTORIZAÇÃO E RBAC

### 4.1 Modelo Atual de Autorização

```typescript
// App.tsx — Verificação de autorização client-side:
if (savedView === 'adminDashboard' && parsedUser?.role !== 'admin') return 'landing';

// AdminDashboard.tsx — Guard de painel:
{user?.role === 'admin' && <AdminPanel />}

// rbac.ts — Verificação de permissão:
export function hasPermission(role, permission, customPermissions?): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
// ↑ Toda esta verificação roda no JavaScript do browser
// ↑ Um atacante pode modificar o objeto ROLE_PERMISSIONS no DevTools
// ↑ Ou simplesmente trocar o localStorage.legis_user.role para 'admin'
```

### 4.2 Demonstração do Bypass de Autorização

```javascript
// Bypass completo do RBAC atual — 3 linhas no DevTools Console:

// 1. Simular login como super admin:
localStorage.setItem('legis_user', JSON.stringify({
  role: 'admin',
  email: 'hacker@evil.com',
  name: 'Super Admin'
}));
localStorage.setItem('legis_currentView', 'adminDashboard');

// 2. Recarregar a página:
location.reload();

// Resultado: acesso completo ao painel admin com todas as funcionalidades,
// incluindo SettingsTab (259KB de configurações), FinanceTab, RegistrationsTab.
// Tempo necessário: 10 segundos.
```

### 4.3 Matriz de Permissões Atual vs. Futura

| Papel | Permissões Atuais | Onde é Verificado | Permissões Futuras | Onde Será Verificado |
|---|---|---|---|---|
| **super_admin** | Tudo (rbac.ts) | Frontend only | Tudo + audit:write + system:config | NestJS Guard (JWT payload) |
| **admin** | Gestão sem delete | Frontend only | Gestão sem impersonate | NestJS Guard + PermissionsGuard |
| **staff_finance_admin** | Finance + provisioning | Frontend only | Idêntico mas server-enforced | NestJS Guard |
| **staff_compliance_auditor** | Audit + registrations:read | Frontend only | Idêntico mas server-enforced | NestJS Guard |
| **staff_support_l1** | registrations:read apenas | Frontend only | Idêntico mas server-enforced | NestJS Guard |
| **lawyer** | Dashboard próprio + ai:use | Frontend only | Dashboard + ai:use com rate limit | NestJS Guard + ThrottlerGuard |
| **client** | Dashboard próprio | Frontend only | Dashboard + apenas SEUS dados | NestJS Guard + Resource Owner Check |
| **intern** | Dashboard + ai:use | Frontend only | Idêntico mas server-enforced | NestJS Guard |
| **secretary** | Dashboard próprio | Frontend only | Dashboard vinculado ao escritório | NestJS Guard + Workspace Check |

### 4.4 Multi-Tenancy — Gap Crítico Não Implementado

A Legis Connect será usada por **múltiplos escritórios**. O modelo atual não tem nenhuma segregação de dados por organização. Um advogado do Escritório A pode acessar dados do Escritório B porque todos os dados estão no mesmo localStorage compartilhado.

```typescript
// Proposta: todas as entidades terão workspaceId (organizationId):
interface LawyerTO-BE {
  id: string;
  workspaceId: string;  ← NOVO — obrigatório
  name: string;
  oab: string;
  // ...
}

// NestJS Guard de workspace:
@Injectable()
export class WorkspaceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;  // do JWT
    const resourceWorkspaceId = request.params.workspaceId;
    // super_admin pode ver qualquer workspace
    if (user.role === 'super_admin') return true;
    // Qualquer outro: deve pertencer ao mesmo workspace
    return user.workspaceId === resourceWorkspaceId;
  }
}
```

---

## ETAPA 5 — PROJETO DO NOVO MODELO IAM

### 5.1 Arquitetura IAM TO-BE

```
┌─────────────────────────────────────────────────────────────────────┐
│                    IDENTITY & ACCESS MANAGEMENT                     │
│                                                                     │
│  ┌───────────────┐    ┌──────────────────┐   ┌──────────────────┐  │
│  │   Identity    │    │  Authentication  │   │  Authorization   │  │
│  │   Provider    │    │    Service       │   │    Engine        │  │
│  │               │    │                  │   │                  │  │
│  │  PostgreSQL   │    │  Passport.js     │   │  RBAC + ABAC     │  │
│  │  users table  │───▶│  + bcrypt/Argon2 │──▶│  (NestJS Guards) │  │
│  │               │    │  + JWT signing   │   │                  │  │
│  │  - id (UUID)  │    │  + MFA/TOTP      │   │  ROLE_PERMISSIONS│  │
│  │  - email      │    │  + Rate Limit    │   │  + ABAC policies │  │
│  │  - password   │    │  + Brute Force   │   │  + Workspace     │  │
│  │  - role       │    │    Protection    │   │    Isolation     │  │
│  │  - workspaceId│    │                  │   │                  │  │
│  │  - mfa_secret │    └────────┬─────────┘   └────────┬─────────┘  │
│  │  - status     │             │                       │            │
│  └───────────────┘             │                       │            │
│                                ▼                       ▼            │
│                    ┌───────────────────────────────────────────┐    │
│                    │         JWT Access Token (15min)          │    │
│                    │    + Refresh Token (7 dias, httpOnly)     │    │
│                    │    payload: { sub, email, role,           │    │
│                    │              workspaceId, permissions,    │    │
│                    │              sessionId, iat, exp }        │    │
│                    └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Componentes do Modelo IAM

#### Identity Provider (IdP) — NestJS + PostgreSQL
```sql
-- Tabela principal de usuários (multi-tenant)
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID REFERENCES workspaces(id),
  email           TEXT UNIQUE NOT NULL,
  email_verified  BOOLEAN DEFAULT FALSE,
  password_hash   TEXT NOT NULL,         -- Argon2id
  role            user_role NOT NULL,
  status          TEXT DEFAULT 'active', -- active|suspended|pending_verification
  mfa_enabled     BOOLEAN DEFAULT FALSE,
  mfa_secret      TEXT,                  -- Criptografado com KMS
  mfa_backup_codes TEXT[],               -- Criptografados com KMS
  login_count     INTEGER DEFAULT 0,
  failed_attempts INTEGER DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM (
  'super_admin', 'admin', 'staff_finance_admin',
  'staff_compliance_auditor', 'staff_support_l1',
  'lawyer', 'client', 'intern', 'secretary'
);
```

#### Authentication Service — Fluxo Completo
```typescript
// auth.service.ts (NestJS)
async login(dto: LoginDto, req: Request): Promise<AuthResponse> {
  // 1. Rate limiting check (Redis)
  if (await this.rateLimiter.isBlocked(dto.email, req.ip)) {
    throw new TooManyRequestsException('Conta temporariamente bloqueada.');
  }

  // 2. Buscar usuário
  const user = await this.usersRepo.findByEmail(dto.email);
  if (!user) {
    await this.auditService.log('LOGIN_FAILURE', { email: dto.email, ip: req.ip });
    throw new UnauthorizedException(); // Sem distinguir se email existe
  }

  // 3. Verificar status
  if (user.status !== 'active') throw new UnauthorizedException('Conta suspensa.');
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new UnauthorizedException('Conta temporariamente bloqueada.');
  }

  // 4. Verificar senha (Argon2id)
  const isValid = await argon2.verify(user.passwordHash, dto.password);
  if (!isValid) {
    await this.incrementFailedAttempts(user.id);  // Bloqueio progressivo
    await this.auditService.log('LOGIN_FAILURE', { userId: user.id, ip: req.ip });
    throw new UnauthorizedException();
  }

  // 5. MFA se habilitado
  if (user.mfaEnabled) {
    const mfaToken = await this.mfaService.generateChallenge(user.id);
    return { requiresMfa: true, mfaToken };
  }

  // 6. Emitir tokens
  return this.issueTokens(user, req);
}

async issueTokens(user: User, req: Request): Promise<AuthResponse> {
  const sessionId = randomUUID();
  const accessToken = this.jwtService.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
    workspaceId: user.workspaceId,
    permissions: ROLE_PERMISSIONS[user.role],
    sessionId,
  }, { expiresIn: '15m' });

  const refreshToken = randomBytes(64).toString('hex');
  await this.refreshTokenRepo.create({ userId: user.id, token: hash(refreshToken), sessionId, expiresAt: addDays(7) });

  // httpOnly, Secure, SameSite=Strict
  return { accessToken, refreshToken }; // refresh via httpOnly cookie
}
```

#### Authorization Engine — NestJS Guards
```typescript
// Composição de guards para qualquer endpoint:
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('admin', 'super_admin')
@Permissions('finance:read')
@Get('/api/finance/transactions')
async getTransactions() { ... }

// RolesGuard.ts:
canActivate(context): boolean {
  const requiredRoles = this.reflector.get<SystemRole[]>('roles', context.getHandler());
  const user = context.switchToHttp().getRequest().user; // do JWT verificado
  return requiredRoles.includes(user.role);
}
```

### 5.3 RBAC + ABAC Combinados

```
RBAC (Role-Based) — "O QUE este papel pode fazer"
  super_admin → tudo
  lawyer → apenas dashboard próprio + ai:use
  client → apenas SEUS dados

ABAC (Attribute-Based) — "COM QUAIS RECURSOS este usuário pode interagir"
  lawyer.workspaceId === case.workspaceId  → pode ver o processo
  lawyer.id === case.lawyerId              → pode editar o processo
  client.id === document.clientId          → pode ver o documento

Combinação:
  Advogado + workspaceId correto + is owner → pode editar processo
  Advogado + workspaceId correto + NOT owner → pode apenas ler
  Advogado + workspaceId errado → 403 Forbidden
  Advogado + admin role → 403 Forbidden (sem RBAC para admin)
```

---

## ETAPA 6 — AUDITORIA DE SESSÕES

### 6.1 Sessão Atual — Análise de Falhas

```typescript
// App.tsx — Sessão atual:
const [user, setUser] = useState<User | null>(() => {
  const saved = localStorage.getItem('legis_user');
  try { return saved ? JSON.parse(saved) : null; } catch { return null; }
});

useEffect(() => {
  if (user) localStorage.setItem('legis_user', JSON.stringify(user));
  else localStorage.removeItem('legis_user');
}, [user]);

// FALHAS:
// 🔴 Sem expiração — sessão válida para sempre (sem `exp` field)
// 🔴 Sem assinatura — pode ser forjada
// 🔴 Sem revogação — logout apenas local (outros devices continuam autenticados)
// 🔴 Acessível ao JavaScript — XSS pode ler a sessão
// 🔴 Sem vínculo com IP/dispositivo — session fixation possível
// 🔴 JSON sem criptografia — role pode ser alterada
```

### 6.2 Modelo de Sessão TO-BE — JWT + Refresh Token

```
┌─────────────────────────────────────────────────────────────────┐
│               ARQUITETURA DE SESSÃO TO-BE                       │
│                                                                 │
│  Login bem-sucedido                                             │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Access Token (JWT — 15 minutos)                         │   │
│  │   - Armazenado em memória (React state)                 │   │
│  │   - NUNCA em localStorage ou sessionStorage             │   │
│  │   - Enviado no header: Authorization: Bearer <token>    │   │
│  │   - Payload: { sub, email, role, workspaceId, exp, jti }│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Refresh Token (opaque token — 7 dias)                   │   │
│  │   - Armazenado em cookie httpOnly + Secure + SameSite   │   │
│  │   - NUNCA acessível ao JavaScript                       │   │
│  │   - Usado apenas para renovar o Access Token            │   │
│  │   - Rotação a cada uso (Refresh Token Rotation)         │   │
│  │   - Revogado no logout (blacklist no Redis)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Server Session Control (Redis)                          │   │
│  │   - sessionId no JWT payload                            │   │
│  │   - Redis: SET session:{sessionId} {userId} EX 604800   │   │
│  │   - Logout: DEL session:{sessionId}                     │   │
│  │   - Logout global: DEL session:* WHERE userId = X       │   │
│  │   - Controle de dispositivos: lista de sessions ativas  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Fluxo de Renovação de Token

```
Access Token expira (15min)
        │
        ▼
Frontend: POST /api/auth/refresh
  (cookie httpOnly com Refresh Token é enviado automaticamente)
        │
        ▼
Backend: Valida Refresh Token
  ├── Token no Redis? → Válido
  ├── Token no blacklist? → 401 Unauthorized
  └── Expirado? → 401 Unauthorized
        │
        ▼
Backend: Emite NOVO Access Token (15min)
       + NOVO Refresh Token (rotação) + invalida o antigo
        │
        ▼
Frontend recebe novo Access Token → armazena em memória
```

---

## ETAPA 7 — IMPLEMENTAÇÃO DE MFA

### 7.1 Matriz de Obrigatoriedade MFA

| Role | MFA | Método Obrigatório | Método Alternativo |
|---|---|---|---|
| `super_admin` | 🔴 **Obrigatório** | TOTP (Authenticator App) | Passkey/WebAuthn |
| `admin` | 🔴 **Obrigatório** | TOTP | — |
| `staff_compliance_auditor` | 🔴 **Obrigatório** | TOTP | — |
| `staff_finance_admin` | 🔴 **Obrigatório** | TOTP | — |
| `staff_support_l1` | 🟡 Recomendado | TOTP | Email OTP |
| `lawyer` | 🟡 Opcional (fortemente recomendado) | TOTP | Email OTP |
| `client` | 🟢 Opcional | Email OTP | SMS (baixa prioridade) |
| `intern` | 🟢 Opcional | Email OTP | — |
| `secretary` | 🟢 Opcional | Email OTP | — |

### 7.2 Fluxo TOTP (Google Authenticator / Authy)

```
Configuração (primeira vez):
  1. Usuário acessa Configurações → Segurança → Ativar 2FA
  2. Backend: gera TOTP secret (speakeasy.generateSecret())
  3. Backend: criptografa secret com KMS → armazena em users.mfa_secret
  4. Frontend: exibe QR Code (otpauth://totp/LegisConnect:email?secret=...)
  5. Usuário escaneia com app autenticador
  6. Usuário digita código de 6 dígitos para confirmar
  7. Backend: valida código (speakeasy.totp.verify())
  8. Backend: gera 10 códigos de backup (UUID truncado) → hash + salva
  9. Frontend: exibe códigos de backup para o usuário salvar

Login com MFA ativo:
  1. Usuário digita email + senha → POST /api/auth/login
  2. Backend: valida senha → emite MFA Challenge Token (5 minutos, sem acesso)
  3. Frontend: exibe tela de inserção do código TOTP
  4. Usuário digita código de 6 dígitos
  5. Frontend: POST /api/auth/mfa/verify { challengeToken, totpCode }
  6. Backend: valida código TOTP com janela de ±30s (evita dessincronização)
  7. Backend: emite Access Token + Refresh Token → sessão criada
```

### 7.3 Implementação NestJS (speakeasy)

```typescript
// mfa.service.ts
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class MfaService {
  async generateSetup(userId: string, email: string) {
    const secret = speakeasy.generateSecret({
      name: `Legis Connect (${email})`,
      issuer: 'Legis Connect',
      length: 32,
    });

    // Criptografar com KMS antes de salvar
    const encryptedSecret = await this.kmsService.encrypt(secret.base32);
    await this.usersRepo.updateMfaSecret(userId, encryptedSecret);

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    return { qrCodeUrl, manualCode: secret.base32 };
  }

  async verifyTotp(userId: string, token: string): Promise<boolean> {
    const user = await this.usersRepo.findById(userId);
    const decryptedSecret = await this.kmsService.decrypt(user.mfaSecret);
    return speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 1, // Aceita ±30 segundos
    });
  }
}
```

---

## ETAPA 8 — AUDITORIA DE CRIPTOGRAFIA

### 8.1 Análise do `cryptoUtils.ts`

```typescript
// IMPLEMENTAÇÃO ATUAL — cryptoUtils.ts

// ✅ AES-GCM 256-bit — CORRETO algoritmicamente:
const KEY_ALGORITHM = { name: 'AES-GCM', length: 256 };

// 🔴 PROBLEMA — Chave armazenada na sessionStorage:
sessionStorage.setItem(CRYPTO_KEY_STORAGE, base64Key);
// sessionStorage é acessível via DevTools → Application → Session Storage
// Um atacante com XSS tem acesso à chave e pode descriptografar tudo

// 🔴 PROBLEMA — Fallback plaintext quando Web Crypto falha:
return `$plain$${btoa(unescape(encodeURIComponent(plaintext)))}`;
// Se o ambiente não tem Web Crypto (ex: HTTP sem TLS), dados ficam em btoa
// Sem alerta ao desenvolvedor de que a criptografia falhou silenciosamente

// ✅ SHA-256 — CORRETO:
const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
// Mas não é usado em nenhum lugar que precisaria (auditLogger usa btoa)

// ✅ Validação CPF — CORRETO (dígito verificador matemático)
// 🔴 NÃO é chamada nos formulários de cadastro
```

### 8.2 Política de Criptografia — Matriz Completa

| Dado | Proteção Atual | Risco | Proteção TO-BE |
|---|---|---|---|
| **Senhas (users)** | `btoa("legis:" + password)` | 🔴 CRÍTICO | `Argon2id` server-side |
| **Senhas (staff)** | `btoa("legis:" + password)` | 🔴 CRÍTICO | `bcrypt(cost=14)` server-side |
| **CPF em repouso** | Plaintext no localStorage | 🔴 CRÍTICO | `AES-256-GCM` no PostgreSQL (pgcrypto) ou nível de aplicação |
| **MFA Secret** | — (não implementado) | — | `AES-256-GCM` via AWS KMS |
| **JWT signing key** | — (não existe JWT) | — | `RS256` (RSA 2048-bit) ou `ES256` (ECDSA P-256) |
| **Refresh Token** | — | — | `SHA-256(randomBytes(64))` no DB |
| **Documentos jurídicos** | Base64 no localStorage | 🔴 CRÍTICO | S3 + AES-256 SSE-KMS |
| **Comunicação Frontend→Backend** | Via CDN/HTTPS (Vite) | 🟢 OK | TLS 1.3 obrigatório; HSTS |
| **Comunicação Backend→DB** | — | — | TLS 1.3 + certificado de servidor |
| **API Keys externas** | No bundle JS e localStorage | 🔴 CRÍTICO | AWS Secrets Manager / Vault |
| **Audit Logs** | `btoa` hash + localStorage | 🔴 CRÍTICO | HMAC-SHA-256 com chave KMS |

### 8.3 Gestão de Chaves — KMS Architecture

```
MODELO DE GESTÃO DE CHAVES (TO-BE):

┌─────────────────────────────────────────────────────────┐
│                    AWS KMS / HashiCorp Vault             │
│                                                         │
│  Master Keys (CMK — Customer Managed Keys):             │
│    kms/legis/user-data     ← Criptografia de CPF/PII    │
│    kms/legis/mfa-secrets   ← Segredos TOTP              │
│    kms/legis/documents     ← Documentos S3              │
│    kms/legis/audit         ← HMAC de audit logs         │
│                                                         │
│  Data Keys (derivadas das CMKs — rotação automática):   │
│    DEK (Data Encryption Key) por entidade               │
│    Rotação automática a cada 365 dias                   │
│                                                         │
│  Acesso: apenas NestJS via IAM Role (não há credencial  │
│  hardcoded — usa EC2/ECS Instance Profile)              │
└─────────────────────────────────────────────────────────┘
```

---

## ETAPA 9 — AUDITORIA DE DADOS SENSÍVEIS E LGPD

### 9.1 Inventário de Dados Pessoais (LGPD Art. 5º)

| Dado | Categoria LGPD | Base Legal Atual | Base Legal Necessária | Status Compliance |
|---|---|---|---|---|
| Nome completo | Dado pessoal | — | Execução de contrato (Art. 7º, V) | 🔴 Sem base definida |
| CPF | Dado pessoal + identificador único | — | Execução de contrato (Art. 7º, V) | 🔴 Sem base definida |
| Email | Dado pessoal | — | Legítimo interesse (Art. 7º, IX) | 🔴 Sem base definida |
| Telefone | Dado pessoal | — | Consentimento (Art. 7º, I) | 🔴 Sem base definida |
| Endereço | Dado pessoal | — | Execução de contrato | 🔴 Sem base definida |
| Foto (advogado) | Dado pessoal | — | Consentimento | 🔴 Sem base definida |
| Histórico de casos | Dado jurídico sensível | — | Exercício regular de direito (Art. 7º, VI) | 🔴 Sem base definida |
| Documentos processuais | Dado jurídico sigiloso | — | Exercício regular de direito | 🔴 Exposto em localStorage |
| Transações financeiras | Dado financeiro | — | Execução de contrato | 🔴 Exposto em localStorage |
| Número OAB | Dado profissional | — | Execução de contrato | 🟡 Público (OAB) |
| Dados biométricos | Dado sensível (Art. 5º II) | — | Consentimento específico | 🔴 Sem implementação |
| IP e localização | Dado pessoal (tratável) | — | Legítimo interesse | 🔴 Nunca registrado |

### 9.2 Data Classification Matrix

| Dado | Classificação | Retenção Mínima | Retenção Máxima | Criptografia | Acesso |
|---|---|---|---|---|---|
| **CPF** | 🔴 Restrito | Durante contrato | 5 anos pós-encerramento | AES-256 + exibição mascarada | Dono + admin com log |
| **Processos judiciais** | 🔴 Crítico (sigilo profissional) | 10 anos (OAB) | Indeterminado | AES-256 + ACL por advogado | Advogado + cliente do caso |
| **Documentos assinados** | 🔴 Crítico | 5 anos | Indeterminado | AES-256 + S3 SSE-KMS | Partes do contrato |
| **Histórico financeiro** | 🔴 Restrito | 5 anos (Receita Federal) | 10 anos | AES-256 | Dono + staff_finance_admin |
| **Email** | 🟠 Interno | Durante contrato | 2 anos pós-encerramento | Trânsito (TLS) | Dono + admin |
| **Foto de perfil** | 🟡 Público (se advogado) | Durante cadastro ativo | 1 ano pós-exclusão | CDN público | Todos |
| **Audit logs** | 🔴 Restrito | 5 anos (LGPD Art. 37) | Indefinido | HMAC imutável | compliance_auditor |
| **Senhas (hash)** | 🔴 Crítico | — | 90 dias após troca | Argon2id | Jamais exibido |

### 9.3 Direitos LGPD — Implementação Obrigatória

```
Art. 18 da LGPD — Direitos do Titular de Dados:

I.   Confirmação de tratamento   → GET /api/privacy/data-summary
II.  Acesso aos dados            → GET /api/privacy/data-export (JSON/PDF)
III. Correção de dados           → PATCH /api/users/:id/profile
IV.  Anonimização/bloqueio       → PATCH /api/users/:id/anonymize
V.   Portabilidade               → GET /api/privacy/data-export (formato estruturado)
VI.  Eliminação (direito ao esquecimento) → DELETE /api/users/:id
     ⚠️ Atenção: processos judiciais têm retenção obrigatória de 10 anos
VII. Informação sobre compartilhamento → GET /api/privacy/data-sharing
VIII. Revogação de consentimento → DELETE /api/privacy/consent/:id

Prazo de resposta: 15 dias corridos (Art. 18, §5º)
Canal de DPO (Encarregado): dpo@legisconnect.com.br
Relatório de impacto: RIPD obrigatório antes do lançamento
```

### 9.4 Mapeamento de Risco LGPD

| Situação Atual | Artigo LGPD Violado | Penalidade Máxima |
|---|---|---|
| CPF em localStorage sem criptografia | Art. 46 (segurança) | R$50M ou 2% faturamento |
| Sem política de retenção e exclusão | Art. 15 | R$50M ou 2% faturamento |
| Sem registro de atividades de tratamento | Art. 37 | Advertência + prazo |
| Sem DPO nomeado | Art. 41 | Advertência |
| Sem aviso de vazamento em 72h | Art. 48 | R$50M ou 2% faturamento |
| Sem consentimento explícito para cookies | Art. 8º | Advertência + R$50M |
| **Risco total estimado** | | **> R$200M** |

---

## ETAPA 10 — AUDITORIA DO AUDIT TRAIL

### 10.1 Análise do `auditLogger.ts` — Falhas Jurídicas

```
CADEIA DE INTEGRIDADE ATUAL:
  Entry[0]: hash = btoa(payload + GENESIS_HASH)
  Entry[1]: hash = btoa(payload + Entry[0].hash)
  Entry[N]: hash = btoa(payload + Entry[N-1].hash)

ATAQUE À CADEIA:
  1. Atacante abre DevTools → Application → localStorage → legis_audit_log
  2. Remove entradas incriminadoras
  3. Recalcula toda a cadeia (btoa é público, sem chave secreta)
  4. Grava o JSON adulterado de volta
  5. AuditLogger.verifyIntegrity() → retorna { valid: true }
  
  Tempo necessário: < 5 minutos com ChatGPT para gerar o script
```

### 10.2 Arquitetura de Audit Trail Imutável TO-BE

```
Ação do Usuário (ex: login, edição de processo)
        │
        ▼
AuditInterceptor (NestJS) — captura automaticamente:
  { userId, role, endpoint, method, ip, userAgent, body hash }
        │
        ▼
POST /api/audit/log (internal — não exposto externamente)
        │
        ▼
AuditService.log(entry)
  ├── Enriquece: IP real, geolocalização, sessionId do JWT
  ├── HMAC-SHA-256 com chave privada (AWS KMS)
  ├── Encadeia hash com entrada anterior
  └── Publica em Bull Queue (assíncrono — não bloqueia a request)
        │
        ▼
AuditProcessor (Worker Bull)
  ├── Persiste em PostgreSQL (tabela com triggers: sem UPDATE/DELETE)
  ├── Replica em Amazon CloudWatch Logs (retenção: 5 anos)
  └── Alerta SIEM se severity = CRITICAL
```

### 10.3 Eventos Obrigatórios de Auditoria

| Categoria | Eventos | Severidade | Retenção |
|---|---|---|---|
| **Autenticação** | LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, MFA_CHALLENGE, MFA_FAILURE, PASSWORD_CHANGED, PASSWORD_RESET | INFO/WARNING | 5 anos |
| **Autorização** | PERMISSION_DENIED, ROLE_CHANGED, IMPERSONATION_START/END | WARNING/CRITICAL | 5 anos |
| **Dados PII** | CPF_ACCESSED, DOCUMENT_DOWNLOADED, FINANCIAL_DATA_READ, DATA_EXPORT_REQUESTED | INFO/WARNING | 5 anos |
| **Dados Jurídicos** | CASE_CREATED, CASE_UPDATED, CASE_CLOSED, DOCUMENT_UPLOADED | INFO | 10 anos |
| **Admin** | STAFF_CREATED, STAFF_DEACTIVATED, CONFIG_CHANGED, USER_SUSPENDED | WARNING | 5 anos |
| **Financeiro** | PAYMENT_RECEIVED, CHARGEBACK_PROCESSED, TRANSACTION_MODIFIED | INFO/WARNING | 10 anos |
| **Sistema** | PROVISIONING_STARTED/COMPLETED/FAILED, RATE_LIMIT_HIT, SYSTEM_ERROR | INFO/ERROR | 2 anos |
| **Compliance** | OAB_CHECK_PERFORMED, LGPD_REQUEST_RECEIVED, DATA_DELETED | INFO | 5 anos |

---

## ETAPA 11 — AUDITORIA DE SEGURANÇA FRONTEND

### 11.1 Análise de Vetores Frontend

#### XSS (Cross-Site Scripting)
```
Status atual: Risco BAIXO (React escapa automaticamente JSX)
Riscos residuais:
  - dangerouslySetInnerHTML: não identificado no código
  - LegalAiTools: conteúdo da IA renderizado — verificar se usa dangerouslySetInnerHTML
  - Importação de PDFs: sem scan de conteúdo malicioso
  - Campos de busca: React escapa → OK
```

#### CSRF (Cross-Site Request Forgery)
```
Status atual: Sem proteção (sem tokens JWT no frontend = sem CSRF relevante)
Risco futuro (com JWT): 
  - JWT em localStorage → suscetível a CSRF se requests usam cookies
  - SOLUÇÃO: Cookie httpOnly com SameSite=Strict bloqueia CSRF automaticamente
```

#### Secrets no Bundle
```javascript
// Vite injeta process.env.API_KEY diretamente no bundle:
// Após build:
// ./dist/assets/index-[hash].js:
// const ai = new GoogleGenAI({ apiKey: "AIzaSy..." });
// ↑ Qualquer pessoa pode ver em DevTools → Sources

// SOLUÇÃO: NUNCA expor secrets via VITE_* variables para dados sensíveis
// Usar proxy NestJS para todas as chamadas externas
```

#### DevTools Abuse
```javascript
// Proteção IMPOSSÍVEL no frontend — qualquer JS pode:
// 1. Ler localStorage, sessionStorage, cookies não-httpOnly
// 2. Modificar o estado React via React DevTools
// 3. Interceptar requests via Network tab

// SOLUÇÃO: Nunca confiar no estado do browser para decisões de segurança
// Toda verificação de segurança deve ocorrer no servidor
```

### 11.2 Security Headers Obrigatórios (Helmet.js + NestJS)

```typescript
// main.ts (NestJS bootstrap)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{RANDOM_NONCE}'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://storage.googleapis.com"],
      connectSrc: ["'self'", "https://api.legisconnect.com.br"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,       // 1 ano
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xFrameOptions: { action: 'DENY' },
  xContentTypeOptions: true,
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
}));

// Configuração de cookies:
cookie: {
  httpOnly: true,       // inacessível ao JavaScript
  secure: true,         // HTTPS obrigatório
  sameSite: 'strict',   // bloqueia CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  path: '/api/auth',    // apenas nas rotas de auth
}
```

---

## ETAPA 12 — SEGURANÇA DE API FUTURA

### 12.1 Arquitetura de Gateway Segura

```
Internet (Untrusted)
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│                  API Gateway / Load Balancer                  │
│  AWS ALB / Cloudflare / Kong                                 │
│  ├── WAF (Web Application Firewall)                          │
│  │    ├── OWASP CRS (Core Rule Set)                          │
│  │    ├── Rate limiting por IP (100 req/min)                 │
│  │    ├── DDoS protection (Cloudflare / AWS Shield)          │
│  │    ├── Geo-blocking (opcional: bloquear fora do Brasil)   │
│  │    └── Bot detection                                      │
│  ├── TLS termination (TLS 1.3 obrigatório)                  │
│  └── CORS: apenas https://legisconnect.com.br                │
└──────────────────────────────────────────────────────────────┘
        │
        ▼ (interno — não exposto externamente)
┌──────────────────────────────────────────────────────────────┐
│                    NestJS API (Trusted Zone)                  │
│  ├── JwtAuthGuard (todos os endpoints privados)              │
│  ├── RolesGuard (@Roles decorator)                           │
│  ├── PermissionsGuard (@Permissions decorator)               │
│  ├── WorkspaceGuard (isolamento multi-tenant)                │
│  ├── ThrottlerGuard (@Throttle — por usuário, não só por IP)│
│  ├── ValidationPipe (Zod/class-validator em todos os DTOs)   │
│  ├── AuditInterceptor (log automático de todas as requests)  │
│  ├── TransformInterceptor (normaliza respostas)              │
│  └── HttpExceptionFilter (sem stack trace em produção)       │
└──────────────────────────────────────────────────────────────┘
        │
        ▼ (VPC privada — sem acesso da internet)
┌──────────────────────────────────────────────────────────────┐
│  PostgreSQL + Redis + S3 (Isolated Data Zone)                │
│  ├── Sem acesso externo (security group: apenas NestJS)      │
│  ├── Criptografia em repouso (AES-256)                       │
│  ├── Backup automático (RDS Automated Backups)               │
│  └── Logs de acesso ao banco (CloudTrail / RDS Activity)     │
└──────────────────────────────────────────────────────────────┘
```

### 12.2 Rate Limiting por Endpoint

```typescript
// Configuração ThrottlerModule:
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'global', ttl: 60000, limit: 100 },  // 100 req/min geral
      ],
    }),
  ],
})

// Sobrescritas por endpoint crítico:
@Throttle({ default: { limit: 5, ttl: 60000 } })      // Login: 5/min
@Post('/auth/login')

@Throttle({ default: { limit: 3, ttl: 900000 } })     // MFA: 3 tentativas/15min
@Post('/auth/mfa/verify')

@Throttle({ default: { limit: 20, ttl: 60000 } })     // AI: 20 req/min
@Post('/ai/analyze-case')

@Throttle({ default: { limit: 1, ttl: 300000 } })     // Reset senha: 1/5min
@Post('/auth/request-password-reset')
```

---

## ETAPA 13 — MODELO ZERO TRUST PARA LEGIS CONNECT

### 13.1 Princípios Zero Trust Aplicados

```
PRINCÍPIO 1: NEVER TRUST, ALWAYS VERIFY
─────────────────────────────────────────
  Atual: browser decide quem pode acessar o quê
  TO-BE: CADA request ao backend é verificada:
    1. JWT assinado com chave RSA presente?
    2. Token não expirado?
    3. sessionId válido no Redis?
    4. Role suficiente para o recurso?
    5. workspaceId correto para o recurso?
    6. IP não na blocklist?
    7. Rate limit não excedido?
  Todas as 7 verificações falham → 401 Unauthorized

PRINCÍPIO 2: LEAST PRIVILEGE (MENOR PRIVILÉGIO)
────────────────────────────────────────────────
  Advogado só vê SEUS casos (WHERE lawyer_id = :userId)
  Cliente só vê SEUS documentos (WHERE client_id = :userId)
  Staff support_l1 não vê dados financeiros em nenhuma query
  Nenhum role tem acesso de escrita ao audit log

PRINCÍPIO 3: ASSUME BREACH (ASSUMIR COMPROMETIMENTO)
─────────────────────────────────────────────────────
  Se um token JWT for roubado:
    - Expiração curta (15min) limita a janela de dano
    - sessionId no Redis permite revogação imediata
    - Audit log registra uso anômalo (IP diferente, device diferente)

PRINCÍPIO 4: MICRO-SEGMENTAÇÃO
───────────────────────────────
  Cada microserviço/módulo acessa apenas sua própria tabela
  Redis: acesso apenas ao cache de sessão (não ao DB)
  S3: IAM Role com acesso apenas ao bucket de documentos
  Gemini API: chamada apenas pelo AiGatewayService (não por outros módulos)

PRINCÍPIO 5: IDENTIDADE COMO PERÍMETRO
────────────────────────────────────────
  Sem distinção de rede "interna" vs "externa"
  Um colaborador em home office tem o mesmo controle de acesso
  que um atacante que comprometeu a rede interna
```

### 13.2 Zero Trust Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZERO TRUST ARCHITECTURE                      │
│                                                                 │
│  Device → Identity Verification → Policy Engine → Resource     │
│                                                                 │
│  USUÁRIO (qualquer rede, qualquer device):                      │
│    Browser → JWT Token → NestJS Policy Engine → PostgreSQL      │
│               (15min)    ↑                                      │
│                     Verify: JWT signature, exp,                 │
│                             Redis sessionId, role,              │
│                             workspaceId, rate limit             │
│                                                                 │
│  SERVIÇO INTERNO (NestJS → PostgreSQL):                         │
│    NestJS IAM Role → RDS Security Group → PostgreSQL            │
│    (sem credencial hardcoded — usa EC2 Instance Profile)        │
│                                                                 │
│  SERVIÇO EXTERNO (NestJS → Gemini API):                         │
│    NestJS → AWS Secrets Manager (get API Key) → Gemini API      │
│    (API Key nunca está no código ou variável de ambiente CI/CD) │
│                                                                 │
│  ADMIN ACESSO DIRETO AO BANCO (emergência):                     │
│    Bastian Host (jump server) → MFA → RDS → Audit Log obrigatório│
│    Proibido acesso direto ao RDS de qualquer máquina local      │
└─────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 14 — MATRIZ OWASP TOP 10

### 14.1 Avaliação Completa OWASP Top 10:2021

| # | Categoria | Situação Atual | Severidade | Correção Principal |
|---|---|---|---|---|
| **A01** | **Broken Access Control** | RBAC inteiramente no frontend; qualquer usuário pode se tornar admin via DevTools em 10 segundos | 🔴 CRÍTICO (10.0) | NestJS Guards server-side; JWT com role no payload verificado no servidor |
| **A02** | **Cryptographic Failures** | `btoa` como hash de senha (reversível); API Keys em localStorage; chave AES na sessionStorage; CPF em plaintext | 🔴 CRÍTICO (9.8) | Argon2id para senhas; KMS para chaves; criptografia de coluna no PostgreSQL |
| **A03** | **Injection** | React escapa JSX automaticamente; sem SQL (sem backend); Gemini recebe input do usuário sem sanitização completa | 🟠 ALTO (7.5) | Sanitização de input antes de prompts; Parameterized queries (Prisma); class-validator nos DTOs |
| **A04** | **Insecure Design** | Arquitetura sem separação de confiança; cliente como árbitro de segurança; sem threat model | 🔴 CRÍTICO (9.5) | Redesign completo com backend; threat modeling formal; security review em cada feature |
| **A05** | **Security Misconfiguration** | API Key hardcoded; sem CSP; sem security headers; credenciais no código | 🔴 CRÍTICO (9.0) | Helmet.js; CSP; remover secrets do código; AWS Secrets Manager |
| **A06** | **Vulnerable Components** | Vite 6, React 19, `@google/genai` no frontend — dependências modernas; sem auditoria regular | 🟡 MÉDIO (6.5) | `npm audit` no CI/CD; Dependabot; `snyk test` |
| **A07** | **Authentication Failures** | Qualquer senha autentica advogados/clientes; sessão sem expiração; sem MFA; sem rate limiting | 🔴 CRÍTICO (10.0) | JWT server-side; Passport.js; Argon2id; MFA obrigatório para admins; Redis rate limiting |
| **A08** | **Software Integrity Failures** | Sem validação de integridade do bundle; sem SRI em scripts externos | 🟡 MÉDIO (6.0) | Subresource Integrity (SRI); checksums no CI/CD; SLSA level 2 |
| **A09** | **Logging Failures** | Logs em localStorage (adulteráveis); sem log de IP real; sem SIEM; truncamento após 5.000 | 🔴 CRÍTICO (9.0) | AuditService NestJS → CloudWatch → SIEM; HMAC-SHA-256; sem truncamento |
| **A10** | **SSRF** | Sem backend = sem SSRF no sentido clássico; `dbCloud` faz fetch direto de URLs configuradas pelo usuário | 🟠 ALTO (7.0) | Whitelist de URLs permitidas no NestJS; sem fetch dinâmico de URLs do usuário |

### 14.2 Score OWASP ASVS (Application Security Verification Standard)

| Capítulo ASVS | Nível Atual (0-3) | Meta | Lacunas |
|---|---|---|---|
| V1 — Architecture | 0 | 2 | Sem threat model; sem security by design |
| V2 — Authentication | 0 | 3 | Sem JWT, sem MFA, sem rate limit, btoa |
| V3 — Session Management | 0 | 3 | Sem JWT, sessão eterna, sem revogação |
| V4 — Access Control | 0 | 3 | RBAC client-side; sem ABAC |
| V5 — Validation | 1 | 2 | Sem Zod server-side; parcial no frontend |
| V6 — Cryptography | 1 | 3 | AES-GCM existe mas chave exposta |
| V7 — Error Handling & Logging | 1 | 3 | Log existe mas adulterável |
| V8 — Data Protection | 0 | 3 | PII em localStorage sem criptografia |
| V9 — Communication Security | 1 | 3 | HTTPS via CDN; sem headers de segurança |
| V10 — Malicious Code | 1 | 2 | Sem scan de dependências |
| **MÉDIA GERAL** | **0.5/3** | **2.7/3** | **Nível 1 não atingido** |

---

## ETAPA 15 — PLANO DE IMPLEMENTAÇÃO DE SEGURANÇA

### Fase Emergencial (0–30 dias) — Risco Imediato

```
SEC-001 — Remover Credenciais Hardcoded do Código (Dia 1)
  Ação:
    1. Remover @@Rk08266570# de App.tsx e LoginForm.tsx IMEDIATAMENTE
    2. Trocar todas as senhas de staff nos dados mock
    3. Revogar a API Key Gemini exposta → gerar nova + mover para .env
    4. Remover dbApiKey do localStorage (interface de settings)
    5. Fazer git history rewrite (git filter-branch ou BFG Repo Cleaner)
  Prioridade: 🔴 EMERGENCIAL | Estimativa: 8h

SEC-002 — Substituir btoa por SHA-256 nos Hashes (Dias 1-3)
  Ação:
    1. Substituir hashPassword() por cryptoUtils.hashSensitiveData() (SHA-256)
    2. Migrar auditLogger.computeHash() para SHA-256 assíncrono
    3. Re-hash de todos os dados existentes
  Prioridade: 🔴 CRÍTICA | Estimativa: 16h

SEC-003 — Implementar AuthModule NestJS + JWT (Dias 3-14)
  Ação:
    1. NestJS + Passport JWT + httpOnly cookie
    2. POST /api/auth/login, /logout, /refresh, /me
    3. Remover handleLogin do App.tsx
    4. Implementar brute force protection (Redis + progressive delay)
  Prioridade: 🔴 CRÍTICA | Estimativa: 80h

SEC-004 — Implementar RolesGuard e PermissionsGuard (Dias 10-20)
  Ação:
    1. Migrar rbac.ts para decorators NestJS
    2. Guards em todos os endpoints privados
    3. Manter rbac.ts no frontend apenas para controle de UI
  Prioridade: 🔴 CRÍTICA | Estimativa: 40h

SEC-005 — Mover API Key Gemini para Backend (Dias 5-10)
  Ação:
    1. Criar AiGatewayModule NestJS
    2. POST /api/ai/analyze-case, /chat, /find-lawyers
    3. ThrottlerGuard: 20 req/min por usuário
    4. API Key apenas no .env do servidor (AWS Secrets Manager em produção)
  Prioridade: 🔴 CRÍTICA | Estimativa: 40h
```

### Fase Estrutural (30–90 dias) — Segurança Corporativa

```
SEC-006 — Implementar MFA (TOTP) para Admins (Dias 30-45)
  Estimativa: 60h
  Ferramentas: speakeasy + qrcode (NestJS)

SEC-007 — Migrar Audit Log para PostgreSQL (Dias 30-50)
  Estimativa: 60h
  HMAC-SHA-256 com KMS; retenção 5 anos

SEC-008 — Implementar Sessão com Refresh Token + Redis (Dias 20-40)
  Estimativa: 40h
  Refresh Token rotation; logout global; controle de devices

SEC-009 — Criptografar PII no PostgreSQL (Dias 50-70)
  Estimativa: 80h
  pgcrypto ou criptografia de aplicação; CPF, endereço

SEC-010 — Implementar Security Headers (Helmets + CSP) (Dia 30)
  Estimativa: 8h
  Helmet.js; Content-Security-Policy; HSTS

SEC-011 — Pipeline de Segurança no CI/CD (Dias 30-45)
  Estimativa: 24h
  npm audit; Snyk; SAST (Semgrep); secret scanning (GitGuardian)
```

### Fase Enterprise (90+ dias) — Compliance Total

```
SEC-012 — Implementar Verificação OAB Real (Dias 90-120)
  Estimativa: 60h
  Integração com API OAB ou parceiro de verificação

SEC-013 — Pentest Externo (Dia 120)
  Contratar empresa especializada (ex: Tempest, Cipher, NCC Group)
  Escopo: API, frontend, infraestrutura
  Estimativa: R$40.000–80.000

SEC-014 — SIEM e SOC (Dias 90-150)
  Estimativa: 120h
  CloudWatch + GuardDuty + alertas; oncall rotation

SEC-015 — LGPD Compliance Formal (Dias 90-180)
  Estimativa: 160h
  DPO nomeado; RIPD elaborado; cookie consent; endpoints LGPD (/privacy/*)
  Certificação ISO 27001 (2 anos de roadmap)
```

---

## BACKLOG DE SEGURANÇA — PRIORIZAÇÃO

| Item | Descrição | Prioridade | Estimativa | Dependências |
|---|---|---|---|---|
| **SEC-001** | Remover credenciais hardcoded + revogar API Keys | 🔴 EMERGENCIAL | 8h | Nenhuma — FAZER HOJE |
| **SEC-002** | Substituir btoa por SHA-256 (cryptoUtils.hashSensitiveData) | 🔴 EMERGENCIAL | 16h | Nenhuma |
| **SEC-003** | AuthModule NestJS + JWT httpOnly cookie | 🔴 CRÍTICA | 80h | Infraestrutura NestJS |
| **SEC-004** | RolesGuard + PermissionsGuard NestJS | 🔴 CRÍTICA | 40h | SEC-003 |
| **SEC-005** | AI Gateway Proxy (API Key no servidor) | 🔴 CRÍTICA | 40h | SEC-003 |
| **SEC-006** | MFA/TOTP para super_admin e admin | 🔴 CRÍTICA | 60h | SEC-003 |
| **SEC-007** | Audit Log imutável (PostgreSQL + HMAC-SHA-256) | 🔴 CRÍTICA | 60h | SEC-003 |
| **SEC-008** | Refresh Token + Redis + logout global | 🔴 ALTA | 40h | SEC-003 |
| **SEC-009** | Criptografia de PII no PostgreSQL | 🔴 ALTA | 80h | SEC-003 |
| **SEC-010** | Security Headers (Helmet + CSP) | 🔴 ALTA | 8h | NestJS backend |
| **SEC-011** | CI/CD Security Pipeline | 🟠 ALTA | 24h | NestJS |
| **SEC-012** | Verificação OAB real | 🟡 MÉDIA | 60h | SEC-003 |
| **SEC-013** | Pentest externo | 🟠 ALTA | R$60k | Fase 2 completa |
| **SEC-014** | SIEM + CloudWatch Alerts | 🟠 ALTA | 120h | SEC-007 |
| **SEC-015** | LGPD Compliance Formal + DPO | 🔴 CRÍTICA (legal) | 160h | Fase 2 |

---

## SCORE FINAL DE SEGURANÇA

| Métrica | AS-IS | TO-BE (após todas as fases) |
|---|---|---|
| **OWASP Top 10 — itens críticos resolvidos** | 0/10 | 10/10 |
| **OWASP ASVS Nível** | 0 (abaixo do Nível 1) | Nível 2 (Nível 3 com certificação) |
| **LGPD Compliance** | 0% | 100% (após SEC-015) |
| **Zero Trust maturidade** | 0% | 85% (após Fase Enterprise) |
| **Security Score (0-100)** | **7** | **88** |

---

*Documento gerado em 25/07/2026 | Prompt 005 — Security Architecture Blueprint | v1.0.0*
*Próximo: PROMPT 006 — Especificação do Schema PostgreSQL + Prisma ORM (Modelagem de Dados TO-BE)*
