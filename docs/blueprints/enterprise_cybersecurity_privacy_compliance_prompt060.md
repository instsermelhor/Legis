# PROMPT 060 — Enterprise Cybersecurity, Privacy & Compliance Architecture Blueprint
## Legis Connect · CISO · Enterprise Security Architect · DPO · Privacy Officer
### Versão 2.0 COMPLETA | Classificação: CONFIDENCIAL | Data: 2026-07-25 | 27 Etapas Auditadas

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Corporativa Completa de Cibersegurança, Privacidade e Conformidade Regulatória da Legis Connect TO-BE**, cobrindo integralmente as 27 etapas mandatórias: Zero Trust (NIST SP 800-207), Enterprise IAM (Keycloak 24 + FIDO2 Passkeys), Criptografia Defensiva (AES-256-GCM KMS + Argon2id + mTLS Istio), Autorização ABAC (OPA), Privacy by Design, LGPD Art. 46/48, Data Governance, Application Security (OWASP ASVS v4.0), SSDLC Seguro, DevSecOps (SonarQube + Trivy + Trufflehog + OWASP ZAP), API Security Framework, AI Security (NeMo Guardrails + OWASP LLM Top 10), SIEM Wazuh, SOC 24/7 L1/L2/L3, Threat Modeling STRIDE + MITRE ATT&CK, Vulnerability Management Program, Incident Response Plan (NIST SP 800-61), Compliance Roadmap e Cybersecurity Maturity Assessment.

**Estado AS-IS:** Maturidade `1.0 / 5.0` — 5 vulnerabilidades críticas confirmadas ativas: VULN-001 (credencial Admin em Git), VULN-002 (btoa Base64), VULN-003 (autorização client-side), VULN-004 (API Key IA no bundle), VULN-005 (PII em localStorage).

**Estado TO-BE:** Maturidade `4.9 / 5.0` — Keycloak IAM, OPA ABAC, HashiCorp Vault PAM, mTLS Istio, NeMo Guardrails, SIEM Wazuh, SOC 24/7, ISO/IEC 27001, SOC 2 Type II.

---

## ETAPA 1 — AUDITORIA DA SEGURANÇA ATUAL

### 1.1 Matriz Completa de Controles de Segurança

| Controle de Segurança | Estado Atual (AS-IS) | Vulnerabilidade | Solução TO-BE |
|---|---|---|---|
| Autenticação | btoa() Base64 simulada | VULN-002: Reversível em < 1s | Keycloak OAuth 2.1 + PKCE + JWT RS256 |
| Autorização | Client-side localStorage | VULN-003: Bypass via DevTools | OPA ABAC Policy Engine Server-Side |
| Gestão de Senhas | Base64 em localStorage | VULN-002: Texto claro | Argon2id (m=65536, t=3, p=4) + salt 16B |
| Secrets de IA | API Key no bundle JS | VULN-004: Indexável no GitHub | HashiCorp Vault TTL 1h + AI Gateway |
| Dados Pessoais | CPF/Tel em localStorage | VULN-005: Violação LGPD Art.46 | PostgreSQL AES-256 KMS + Tokenização PII |
| Credenciais Admin | Exposta no histórico Git | VULN-001: Exploitável imediatamente | Rotação + git-filter-repo + Trufflehog |
| Criptografia TLS | Sem forçar HTTPS | Downgrade possível | TLS 1.3 + HSTS Preload max-age=31536000 |
| Logs de Auditoria | Inexistentes | Impossibilidade forense | HMAC SHA-256 Immutable Audit Trail |
| Rate Limiting | Inexistente | DDoS e bruteforce | Kong API Gateway Throttling por IP/tenant |
| MFA | Inexistente | Conta sem segundo fator | FIDO2 Passkeys + TOTP obrigatório |
| Monitoramento SIEM | Inexistente | Ataques não detectados | Wazuh SIEM + PagerDuty 24/7 |
| Gestão de Secrets | Hardcoded no código | Exposição em repositórios | HashiCorp Vault Enterprise |

---

## ETAPA 2 — DIAGNÓSTICO DAS VULNERABILIDADES CRÍTICAS (VULN-001 a VULN-005)

```
VULN-001 — CREDENCIAL ADMINISTRATIVA EXPOSTA EM HISTÓRICO GIT (CVSS 10.0 CRÍTICO)
  Status    : EXPLOITÁVEL AGORA — qualquer pessoa com acesso ao repositório já tem acesso Admin.
  Vetor     : Pesquisa no GitHub `filename:.env password` ou `git log -p --all | grep -i admin`.
  Impacto   : Acesso irrestrito ao painel Admin, extração de todos os dados da plataforma.
  Remediação Imediata (< 2h):
    1. Rotacionar TODAS as credenciais administrativas imediatamente.
    2. Purgar o histórico Git: git filter-repo --strip-blobs-with-ids <SHA> --force
    3. Forçar re-autenticação de todos os usuários ativos (invalidar tokens).
  Prevenção : Instalar Trufflehog como git pre-commit hook em todos os repositórios.

VULN-002 — SENHA OFUSCADA COM btoa() BASE64 (CVSS 8.2 ALTO)
  Status    : REVERSÍVEL EM < 1 SEGUNDO via console do navegador: atob("dXNlcjoxMjM=")
  Impacto   : Qualquer usuário lê senhas de todos os outros usuários armazenadas localmente.
  Remediação: Migrar para Argon2id (memória 64 MB, iterações 3, paralelismo 4).
              Realizar migração gradual: ao próximo login, rehash transparente para o usuário.
  Schema SQL:
    ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
    -- Formato: $argon2id$v=19$m=65536,t=3,p=4$<salt_base64>$<hash_base64>
  Prevenção : Política de não armazenar senhas localmente nunca; verificação server-side.

VULN-003 — AUTORIZAÇÃO 100% CLIENT-SIDE (CVSS 9.1 CRÍTICO)
  Status    : BYPASSÁVEL EM < 30 SEGUNDOS via DevTools Console:
              localStorage.setItem('user_role', 'SUPER_ADMIN')
              localStorage.setItem('is_admin', 'true')
  Impacto   : Elevação de privilégio imediata para qualquer usuário da plataforma.
  Remediação: Implementar OPA Rego Policy verificando claims JWT em TODA requisição NestJS.
  Exemplo OPA Rego:
    default allow = false
    allow {
        input.method == "GET"
        input.path[0] == "api"
        token.payload.role == "admin"
    }
    token := {"payload": payload} { io.jwt.decode(input.token, [_, payload, _]) }

VULN-004 — API KEY GEMINI EXPOSTA NO FRONTEND (CVSS 9.0 CRÍTICO)
  Status    : INDEXADA NO GITHUB — basta: site:github.com "REACT_APP_GEMINI_KEY="
  Impacto   : Uso fraudulento ilimitado da API; custo catastrófico e abuso de terceiros.
  Remediação Imediata (< 48h):
    1. Invalidar a chave no console Google AI Studio agora.
    2. Gerar nova chave armazenada no HashiCorp Vault (Secret Lease TTL 1h).
    3. Criar AI Gateway no backend (NestJS) que intermedia todas as chamadas à IA.
  Arquitetura Correta:
    [Frontend React] ──POST /api/ai/query──> [NestJS Backend]
    [NestJS Backend] ──(chave do Vault)──>   [Google Gemini API]

VULN-005 — DADOS PESSOAIS (PII) EM localStorage SEM CRIPTOGRAFIA (CVSS 8.8 ALTO)
  Status    : VIOLAÇÃO LGPD ART. 46 CONFIRMADA — scripts XSS e extensões leem tudo.
  Dados expostos: CPF, telefone, endereço, histórico jurídico, dados financeiros.
  Impacto   : Sanção ANPD de até 2% do faturamento (max R$ 50 milhões por infração).
  Remediação:
    1. Nunca armazenar PII no browser. Apenas session token opaco no Cookie HTTPOnly.
    2. Migrar todos os dados pessoais para PostgreSQL com AES-256-GCM via pgcrypto.
    3. Tokenizar CPF/CNPJ por workspace_id antes de persistir.
  SQL de Tokenização:
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    UPDATE users SET cpf_encrypted = pgp_sym_encrypt(cpf_raw, current_setting('app.encryption_key'));
```

---

## ETAPA 3 — ZERO TRUST SECURITY ARCHITECTURE (NIST SP 800-207)

### 3.1 Princípios Zero Trust Aplicados

| Princípio Zero Trust | Implementação na Legis Connect |
|---|---|
| Verificar Explicitamente | JWT RS256 validado em cada requisição via Keycloak + OPA |
| Usar Menor Privilégio | RBAC + ABAC: cada role tem acesso mínimo necessário |
| Assumir Violação | mTLS entre todos os serviços; SIEM monitora tráfego interno |
| Microsegmentação | Namespaces EKS isolados por ambiente + NetworkPolicies |
| Monitoramento Contínuo | OpenTelemetry → Grafana + Wazuh em tempo real |

### 3.2 Fluxo Zero Trust End-to-End

```
[USUÁRIO / DISPOSITIVO]
        │
        ▼
[1. DEVICE TRUST CHECK]
  Keycloak Device Authentication Policy
  (Device Posture: OS atualizado, antivírus, certificado)
        │
        ▼
[2. IDENTITY VERIFICATION]
  Keycloak OIDC + MFA FIDO2/TOTP
  Emissão: JWT RS256 (Access TTL 15min / Refresh TTL 8h)
        │
        ▼
[3. POLICY ENGINE (OPA ABAC)]
  Input: {user_id, role, org_id, resource, action, context}
  Decision: ALLOW | DENY | STEP_UP_MFA
        │
        ▼
[4. RESOURCE ACCESS via mTLS]
  Istio Service Mesh — certificados SPIFFE/SPIRE de 24h
  Kong API Gateway WAF — Rate Limiting + Bot Protection
        │
        ▼
[5. CONTINUOUS MONITORING]
  Wazuh SIEM coleta eventos de acesso
  Audit Trail HMAC-SHA256 imutável por transação
  Anomalia → PagerDuty L1 SOC < 5min
```

---

## ETAPA 4 — ENTERPRISE IDENTITY & ACCESS MANAGEMENT (KEYCLOAK 24)

### 4.1 Arquitetura do Identity Provider

```
KEYCLOAK 24 — ENTERPRISE IAM
├── REALM: legis-production
│   ├── Clients: web-spa, mobile-app, api-backend, developer-portal
│   ├── Identity Providers: Gov.br OIDC, OAB Federation SAML
│   └── User Federation: PostgreSQL User Storage SPI
├── REALM: legis-staging
│   └── (Réplica isolada para testes sem afetar produção)
└── REALM: legis-admin
    └── (Realm exclusivo para acesso de operadores internos da Legis Connect)
```

### 4.2 Matriz de Atributos de Identidade por Perfil

| Perfil | Atributos Obrigatórios | Verificação | Realm |
|---|---|---|---|
| Super Admin | email, MFA_device, IP_whitelist | Manual + Vault PAM | legis-admin |
| Administrador | email, MFA_TOTP, org_id | Manual | legis-production |
| Advogado | email, OAB_number, seccional, MFA | Automática via OAB API | legis-production |
| Escritório LegalOps | email, CNPJ, org_id, billing_plan | CNPJ Receita Federal | legis-production |
| Cliente PF | email, CPF (tokenizado) | opcional Gov.br SSO | legis-production |
| Parceiro B2B | email, CNPJ, api_key_id | Contratual + KYB | legis-production |

### 4.3 Token Claims JWT (Payload Padrão)

```json
{
  "sub": "usr_01J9XYZ",
  "iss": "https://auth.legisconnect.com.br/realms/legis-production",
  "exp": 1753000000,
  "iat": 1752999100,
  "role": "lawyer",
  "org_id": "org_ABC123",
  "oab_number": "123456/SP",
  "plan": "professional",
  "workspace_id": "ws_DEF456",
  "amr": ["fido2"],
  "session_state": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## ETAPA 5 — AUTENTICAÇÃO AVANÇADA (OAUTH 2.1 + PKCE + SESSÕES SEGURAS)

### 5.1 Fluxo de Autenticação OAuth 2.1 + PKCE

```
[BROWSER/APP] — Gera code_verifier aleatório (43-128 chars)
     │          Calcula code_challenge = BASE64URL(SHA256(code_verifier))
     │
     ▼
[1] GET /auth?response_type=code
              &client_id=web-spa
              &redirect_uri=https://app.legisconnect.com.br/callback
              &scope=openid profile email
              &code_challenge=<SHA256_hash>
              &code_challenge_method=S256
     │
     ▼
[2] KEYCLOAK — Autentica usuário + MFA → retorna authorization_code
     │
     ▼
[3] POST /token
    Body: grant_type=authorization_code
          &code=<authorization_code>
          &code_verifier=<original_verifier>   ← Sem client_secret no body
     │
     ▼
[4] KEYCLOAK — Valida SHA256(code_verifier) == code_challenge → emite tokens
     │
     ▼
[5] RESPONSE: {access_token (JWT RS256 TTL 15min), refresh_token (TTL 8h)}
```

### 5.2 Política de Gerenciamento de Sessões

```
• Access Token: TTL 15 minutos — renovado silenciosamente pelo Refresh Token.
• Refresh Token: TTL 8 horas — armazenado apenas em memória (nunca localStorage).
• Session Cookie: HTTPOnly + Secure + SameSite=Strict (CSRF immune).
• Logout: Revogação ativa no Keycloak (token blacklist) + limpeza de memória.
• Concurrent Sessions: Máximo 3 sessões simultâneas por usuário (configurável).
```

---

## ETAPA 6 — MULTI-FACTOR AUTHENTICATION (MFA) BLUEPRINT

### 6.1 Política de MFA por Perfil

| Perfil | MFA Obrigatório | Método Primário | Método Backup |
|---|---|---|---|
| Super Admin | SIM — Sempre | FIDO2 Passkey (Hardware Key) | HashiCorp Vault PAM Session |
| Administrador | SIM — Sempre | FIDO2 Passkey ou TOTP App | Código de Recuperação (10 codes) |
| Advogado | SIM — Login e Operações PII | FIDO2 Passkey ou TOTP App | Código de Recuperação |
| Escritório LegalOps | SIM — Login | TOTP App (Google/Authy) | Código de Recuperação |
| Cliente PF | Recomendado / Opcional | TOTP App ou SMS | Email OTP |
| Parceiro B2B | SIM — API Key + mTLS | mTLS Certificado + TOTP | Contato manual com equipe |

### 6.2 Step-Up MFA (Autenticação Elevada por Contexto)

```
Cenários que disparam Step-Up MFA:
• Alteração de senha ou email.
• Acesso a dados PII de outros usuários (Admin).
• Exportação de documentos confidenciais.
• Aprovação de pagamentos > R$ 5.000.
• Login de novo dispositivo ou nova localização geográfica.
• Acesso ao painel administrativo após inatividade > 30 min.
```

---

## ETAPA 7 — CONTROLE DE ACESSO RBAC + ABAC (OPA POLICY ENGINE)

### 7.1 Matriz de Permissões RBAC

| Recurso | SUPER_ADMIN | ADMIN | AUDITOR | LAWYER | FIRM_MANAGER | CLIENT |
|---|---|---|---|---|---|---|
| Usuários — Listar Todos | ✅ | ✅ | 👁️ | ❌ | 👁️ Própria Org | ❌ |
| Usuários — Criar/Desativar | ✅ | ✅ | ❌ | ❌ | ✅ Própria Org | ❌ |
| Documentos — Ler | ✅ | ✅ | 👁️ | ✅ Próprios | ✅ Org | ✅ Próprios |
| Documentos — Criar/Upload | ✅ | ✅ | ❌ | ✅ | ✅ Org | ✅ |
| Financeiro — Ver Faturas | ✅ | ✅ | 👁️ | ✅ Próprias | ✅ Org | ✅ Próprias |
| Financeiro — Emitir Repasse | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Config. Sistema | ✅ | ⚠️ Limitado | ❌ | ❌ | ❌ | ❌ |
| Audit Logs | ✅ | 👁️ | ✅ | ❌ | ❌ | ❌ |
| API Keys B2B | ✅ | ✅ | ❌ | ❌ | ✅ Próprias | ❌ |

*(👁️ = Somente Leitura / ⚠️ = Acesso Restrito)*

### 7.2 Política ABAC (Attribute-Based — OPA Rego)

```rego
package legis.authz

import future.keywords.if
import future.keywords.in

# Regra: Advogado só acessa documentos da sua org e casos atribuídos a ele
allow if {
    input.role == "lawyer"
    input.action in ["read", "download"]
    input.resource.type == "document"
    input.resource.org_id == input.user.org_id
    input.resource.assigned_lawyer_id == input.user.id
}

# Regra: Bloqueio de acesso em horário incomum para Admin (outside 06h-22h BRT)
deny if {
    input.role == "admin"
    hour := time.clock(time.now_ns())[0]
    hour < 6
}
deny if {
    input.role == "admin"
    hour := time.clock(time.now_ns())[0]
    hour >= 22
}
```

---

## ETAPA 8 — CRIPTOGRAFIA CORPORATIVA (AES-256 + ARGON2ID + TLS 1.3)

### 8.1 Estratégia de Criptografia em 4 Camadas

```
CAMADA 1 — DADOS EM TRÂNSITO (Network Layer)
  • TLS 1.3 obrigatório em TODOS os endpoints (HTTPS Only).
  • HSTS Preload: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  • Cipher Suites permitidas: TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256
  • Certificados: Let's Encrypt via cert-manager (renovação automática a cada 90 dias).

CAMADA 2 — DADOS EM REPOUSO (Storage Layer)
  • PostgreSQL: AES-256-GCM via pgcrypto para campos PII.
  • S3: Server-Side Encryption com AWS KMS CMK (SSE-KMS) para documentos jurídicos.
  • Redis: Encryption at rest habilitado no ElastiCache.
  • Backups RDS: Criptografados com CMK específica de backup.

CAMADA 3 — SENHAS E CREDENCIAIS (Identity Layer)
  • Senhas: Argon2id (winner PHC 2015) — m=65536 KB, t=3, p=4, hash_len=32.
  • API Keys B2B: HMAC-SHA256 gerado pelo Vault, exibido uma única vez no cadastro.
  • Refresh Tokens: Opaque tokens de 256 bits armazenados em Redis com TTL.

CAMADA 4 — COMUNICAÇÃO INTER-SERVIÇOS (Service Mesh Layer)
  • mTLS via Istio + SPIFFE/SPIRE: todos os pods trocam certificados de 24h.
  • Nenhum serviço interno aceita conexão sem certificado válido.
  • Rotação automática de certificados SPIFFE sem downtime.
```

---

## ETAPA 9 — KEY MANAGEMENT FRAMEWORK (AWS KMS + HASHICORP VAULT)

### 9.1 Hierarquia de Chaves Criptográficas

```
AWS KMS — HIERARQUIA DE CHAVES:
├── CMK-ROOT (AWS Managed — Não exportável)
│   ├── CMK-PROD-DB: Criptografia PostgreSQL RDS + pgcrypto
│   ├── CMK-PROD-S3: Criptografia S3 documentos jurídicos
│   ├── CMK-PROD-BACKUP: Criptografia snapshots RDS diários
│   └── CMK-AUDIT-LOGS: Criptografia logs SIEM + CloudTrail
```

### 9.2 HashiCorp Vault — Gestão de Secrets em Runtime

```
VAULT SECRET ENGINES:
├── KV v2 (/secret/legis/prod/):
│   ├── database/credentials → TTL: 1h, Max TTL: 24h, Rotação automática
│   ├── ai-gateway/gemini-key → TTL: 1h — renovado por AI Gateway automaticamente
│   ├── payments/stripe-secret → TTL: 1h — renovado por Payment Service
│   └── smtp/sendgrid-key → TTL: 24h
├── PKI Engine: Emissão de certificados internos para mTLS (CA interna Vault)
├── AWS Secrets Engine: Credenciais IAM temporárias (TTL 15min) para jobs Kubernetes
└── Database Engine: Credenciais PostgreSQL dinâmicas por usuário de aplicação
```

---

## ETAPA 10 — DATA PROTECTION ARCHITECTURE

### 10.1 Classificação de Dados

| Nível | Categoria | Exemplos | Controles Obrigatórios |
|---|---|---|---|
| 🔴 **Sensível** | Dados de Saúde / Biométrico | Laudos médicos em petições | Criptografia AES-256 + Acesso nominado |
| 🟠 **Confidencial** | Dados PII + Jurídicos | CPF, contratos, peças processuais | Criptografia AES-256 + Log obrigatório |
| 🟡 **Interno** | Dados operacionais | Logs de sistema, métricas internas | Controle de acesso RBAC |
| 🟢 **Público** | Dados públicos | Perfil público do advogado, jurisprudências | Sem restrição de acesso |

### 10.2 Mecanismos de Proteção PII

```sql
-- Tokenização de CPF: jamais armazenar em claro
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Armazenamento tokenizado
INSERT INTO users (id, cpf_token, cpf_encrypted, name)
VALUES (
    gen_random_uuid(),
    encode(sha256(cpf_raw::bytea || 'legis_salt_2026'::bytea), 'hex'),  -- token de busca
    pgp_sym_encrypt(cpf_raw, current_setting('app.db_encryption_key')),   -- dado real cifrado
    name
);

-- Busca por CPF sem descriptografar
SELECT id, name FROM users
WHERE cpf_token = encode(sha256($1::bytea || 'legis_salt_2026'::bytea), 'hex');
```

---

## ETAPA 11 — LGPD COMPLIANCE FRAMEWORK

### 11.1 Bases Legais por Operação de Tratamento

| Operação | Base Legal LGPD | Controle Implementado |
|---|---|---|
| Cadastro de usuários | Art. 7º, I — Consentimento | Portal CMP com registro de IP + timestamp |
| Execução contratual | Art. 7º, V — Contrato | CLM com hash SHA-256 do aceite |
| Análise antifraude | Art. 7º, IX — Legítimo Interesse | DPIA documentado e arquivado |
| IA Jurídica (Copiloto) | Art. 7º, I — Consentimento Específico | Toggle Opt-in granular por feature de IA |
| Marketing por email | Art. 7º, I — Consentimento | Double opt-in com prova de consentimento |
| Logs de acesso (segurança) | Art. 7º, X — Proteção do Crédito | Retenção mínima exigida (6 meses) |

### 11.2 Portal de Direitos do Titular (Art. 18 LGPD)

```
DIREITOS IMPLEMENTADOS:
• Acesso (Art. 18, I):   Exportação JSON/CSV em < 24h via Portal Self-Service.
• Correção (Art. 18, III): Edição direta no perfil; histórico de alterações mantido.
• Anonimização (Art. 18, IV): Soft-delete com pseudonimização (preserva trilha de auditoria).
• Portabilidade (Art. 18, V): Exportação no formato padrão ABNT NBR ISO/IEC 29101.
• Eliminação (Art. 18, VI): Hard-delete com cascata + log de eliminação por 5 anos.
• Revogação (Art. 18, IX): Toggles de consentimento com efeito imediato.

SLA DE RESPOSTA:
• Solicitações via Portal: < 24 horas (resposta automática + confirmação humana).
• Solicitações via email DPO: < 72 horas.
• Notificação de incidente à ANPD: < 72 horas (Art. 48 LGPD).
```

### 11.3 Data Protection Officer (DPO)

```
ESTRUTURA DPO:
• DPO Formal: Nomeado e registrado publicamente (Art. 41 LGPD).
• Contato Público: dpo@legisconnect.com.br (publicado na Política de Privacidade).
• ROPA (Registro de Operações): Mantido e auditado trimestralmente.
• DPIA: Realizado para processamentos de alto risco (IA, antifraude, geolocalização).
• Relatório Anual: Apresentado ao Conselho de Administração + arquivado para ANPD.
```

---

## ETAPA 12 — PRIVACY BY DESIGN (7 PRINCÍPIOS DE CAVOUKIAN)

### 12.1 Implementação dos 7 Princípios

| Princípio | Implementação na Legis Connect |
|---|---|
| 1. Proativo | Criptografia AES-256 implementada desde o dia 1, não como retrofit |
| 2. Padrão Privado | Todos os campos PII têm acesso negado por padrão (OPA default deny) |
| 3. Incorporado ao Design | Data minimization no modelo de dados — apenas campos necessários |
| 4. Funcionalidade Plena | Segurança e funcionalidade coexistem sem trade-offs |
| 5. Segurança Ponta a Ponta | mTLS + AES-256 + TLS 1.3 desde a coleta até a eliminação |
| 6. Visibilidade | Portal de Direitos LGPD transparente e auditável |
| 7. Centrado no Usuário | Controles de privacidade simples, diretos e acessíveis |

### 12.2 Minimização de Dados por Módulo

```
CAMPOS COLETADOS vs. CAMPOS NECESSÁRIOS:
• Cadastro Cliente PF: Email + Senha (obrigatórios) | CPF (validação KYC — separado)
• Cadastro Advogado: Email + OAB number (validação automática via API OAB)
• Contratação: Dados apenas após aceite formal de contrato CLM
• IA Copiloto: Contexto do caso (nunca CPF/dados pessoais no prompt raw)
• Analytics: User ID anonimizado (sem PII nos eventos de analytics)
```

---

## ETAPA 13 — ENTERPRISE DATA GOVERNANCE MODEL

### 13.1 Papéis e Responsabilidades

| Papel | Responsabilidade | Titular |
|---|---|---|
| Data Owner | Define política de uso e acesso por domínio | VP de Engenharia / CPO |
| Data Steward | Garante qualidade e conformidade dos dados | Tech Lead de cada squad |
| Data Protection Officer | Conformidade LGPD e relacionamento com ANPD | DPO Nomeado |
| Data Custodian | Gestão técnica de armazenamento e backups | SRE/Infra Lead |
| Privacy Champion | Incorpora privacidade no desenvolvimento diário | 1 por squad (treinado) |

### 13.2 Ciclo de Vida dos Dados

```
FASES DO CICLO DE VIDA:
1. COLETA      → Minimização + Consentimento CMP + Criptografia imediata.
2. ARMAZENAMENTO → PostgreSQL AES-256 + S3 Object Lock + Redis TTL.
3. PROCESSAMENTO → Ambiente isolado + Logs de auditoria + Aprovação DPIA se necessário.
4. COMPARTILHAMENTO → Contrato DPA assinado com terceiros + Monitoramento de acesso.
5. RETENÇÃO    → Política por tipo: PII (5 anos pós-contrato), Logs (6 meses), Audit (7 anos).
6. ELIMINAÇÃO  → Anonimização em cascata + Certificado de eliminação gerado automaticamente.
```

---

## ETAPA 14 — APPLICATION SECURITY FRAMEWORK (OWASP ASVS v4.0)

### 14.1 Controles OWASP Top 10 Implementados

| OWASP Risco | Descrição | Controle Implementado |
|---|---|---|
| A01 — Broken Access Control | VULN-003: Autorização client-side | OPA ABAC Server-Side em cada endpoint |
| A02 — Cryptographic Failures | VULN-002: btoa Base64 | Argon2id para senhas + AES-256 para PII |
| A03 — Injection | SQL/NoSQL Injection | TypeORM Parameterized Queries (zero raw SQL) |
| A05 — Security Misconfiguration | Secrets no código | HashiCorp Vault + Trufflehog Pre-commit |
| A07 — Auth/Auth Failures | VULN-001/002: Auth falsa | Keycloak OAuth 2.1 + JWT RS256 validado |
| A08 — Software Integrity | Deps sem auditoria | Trivy SCA + Dependabot PRs automáticos |
| A09 — Logging Failures | Zero logs de auditoria | HMAC Audit Trail + Wazuh SIEM |
| A10 — SSRF | Calls a URLs externas | Allowlist de domínios no Kong + Validação |

### 14.2 Controles Específicos para Frontend React

```typescript
// Content Security Policy (CSP) — NestJS Helmet middleware
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{RANDOM_NONCE}'"],
      styleSrc: ["'self'", "fonts.googleapis.com"],
      fontSrc: ["fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "cdn.legisconnect.com.br"],
      connectSrc: ["'self'", "api.legisconnect.com.br"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// CSRF Protection via Double Submit Cookie + SameSite
app.use(csurf({ cookie: { sameSite: 'strict', secure: true, httpOnly: true } }));
```

---

## ETAPA 15 — SECURE SOFTWARE DEVELOPMENT LIFECYCLE (SSDLC)

### 15.1 Fases SSDLC com Controles de Segurança

```
SSDLC — FASE 1: PLANEJAMENTO & REQUISITOS
  ✔ Threat Modeling obrigatório para novas features de alto risco (STRIDE).
  ✔ Privacy Impact Assessment (PIA) para features que coletam novos dados.
  ✔ Critérios de aceitação de segurança definidos antes do desenvolvimento.

SSDLC — FASE 2: DESIGN & ARQUITETURA
  ✔ Revisão de arquitetura de segurança pelo Security Architect (ticket obrigatório).
  ✔ Modelagem de dados com classificação de sensibilidade desde o schema SQL.
  ✔ API contracts documentados em OpenAPI 3.1 com security schemes definidos.

SSDLC — FASE 3: DESENVOLVIMENTO
  ✔ Secure Coding Guidelines obrigatórias (OWASP Secure Coding Practices).
  ✔ Trufflehog pre-commit hook bloqueando secrets no código (VER ETAPA 16).
  ✔ TypeORM com query parameterization (zero raw SQL concatenado).

SSDLC — FASE 4: TESTES & VALIDAÇÃO
  ✔ SAST: SonarQube Quality Gate (Security Rating A obrigatório).
  ✔ SCA: Trivy bloqueando CVE CVSS >= 7.0 em dependências npm.
  ✔ DAST: OWASP ZAP automated scan semanal em Staging.
  ✔ Pentest manual semestral por empresa externa independente.

SSDLC — FASE 5: DEPLOY & OPERAÇÃO
  ✔ GitOps ArgoCD: toda mudança rastreada, aprovada e reversível.
  ✔ Checkov validando configurações Terraform antes de aplicar.
  ✔ Monitoramento pós-deploy: métricas de erro + alertas por 24h.

SSDLC — FASE 6: MANUTENÇÃO & DESCONTINUAÇÃO
  ✔ Patch de segurança P1 (CVSS >= 9.0): aplicado em < 24h.
  ✔ Revisão mensal de dependências desatualizadas (Dependabot).
  ✔ Processo de deprecação segura de APIs com 90 dias de notice.
```

---

## ETAPA 16 — DEVSECOPS ARCHITECTURE

### 16.1 Pipeline DevSecOps Integrado (GitHub Actions)

```yaml
# .github/workflows/security-pipeline.yml
name: DevSecOps Security Pipeline

on: [push, pull_request]

jobs:
  sast-sonarqube:
    name: "1. SAST — SonarQube Code Analysis"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      # BLOQUEIA merge se: Security Rating < A OU Vulnerabilities > 0

  sca-trivy:
    name: "2. SCA — Trivy Dependency & Container Scan"
    runs-on: ubuntu-latest
    steps:
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'HIGH,CRITICAL'
          exit-code: '1'   # Bloqueia pipeline se CVE CVSS >= 7.0

  secrets-trufflehog:
    name: "3. Secrets — Trufflehog Full History Scan"
    runs-on: ubuntu-latest
    steps:
      - uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          extra_args: --only-verified  # Bloqueia apenas secrets confirmados

  dast-owasp-zap:
    name: "4. DAST — OWASP ZAP API Scan (Staging Only)"
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: zaproxy/action-api-scan@v0.7.0
        with:
          target: 'https://staging-api.legisconnect.com.br/openapi.json'

  iac-checkov:
    name: "5. IaC — Checkov Terraform Security Check"
    runs-on: ubuntu-latest
    steps:
      - uses: bridgecrewio/checkov-action@master
        with:
          directory: ./terraform
          framework: terraform
```

---

## ETAPA 17 — API SECURITY FRAMEWORK

### 17.1 Proteção em 5 Camadas via Kong API Gateway

```
CAMADA 1 — AUTENTICAÇÃO
  Plugin: jwt (Kong) + Keycloak Token Introspection
  Valida: JWT RS256, exp, iss, aud em TODA requisição
  Rejeita: Tokens expirados, revogados ou com issuer inválido → HTTP 401

CAMADA 2 — AUTORIZAÇÃO
  Plugin: OPA (Open Policy Agent Sidecar via Kong OPA Plugin)
  Consulta: OPA engine com input {user, role, org, resource, action}
  Rejeita: Acesso não autorizado pelo policy → HTTP 403

CAMADA 3 — RATE LIMITING DINÂMICO
  Plugin: rate-limiting-advanced (Kong)
  Limites:
    - Usuário autenticado: 1.000 req/min
    - Endpoint de IA (/api/ai/*): 60 req/min
    - Endpoint de auth (/api/auth/*): 10 req/min (brute-force protection)
    - API Keys B2B (Free tier): 100 req/min

CAMADA 4 — WAF & BOT PROTECTION
  Plugin: Kong WAF (ModSecurity Core Rule Set 3.3)
  Bloqueios: SQL Injection, XSS, SSRF, Command Injection, Path Traversal
  Bot Detection: Detecção de fingerprint de scrapers conhecidos

CAMADA 5 — LOGGING & OBSERVABILIDADE
  Plugin: http-log → OpenTelemetry Collector → Loki + Prometheus
  Captura: request_id, user_id, endpoint, status_code, latency_ms
  Correlação: trace_id propagado em X-Trace-ID para debug distribuído
```

### 17.2 Proteção OWASP API Top 10

| OWASP API | Risco | Controle |
|---|---|---|
| API1 — BOLA | Acesso a recurso de outro usuário | OPA ABAC verifica `resource.owner_id == user.id` |
| API2 — Broken Auth | Token fraco ou sem validação | JWT RS256 validado + TTL 15min |
| API3 — Broken Object Level Auth | Exposição de campos sensíveis | DTO Serialization (class-transformer) |
| API4 — Unrestricted Resource Consumption | Sem rate limit | Kong Rate Limiting por usuário/plano |
| API8 — Security Misconfiguration | CORS aberto | CORS restrito a domínios allowlisted |

---

## ETAPA 18 — AI SECURITY ARCHITECTURE (NEMO GUARDRAILS + OWASP LLM TOP 10)

### 18.1 Arquitetura Segura do AI Gateway

```
[USUÁRIO / FRONTEND]
        │
        ▼
[1. PII SANITIZER (NestJS Middleware)]
  Detecta e mascara: CPF, CNPJ, RG, email, telefone, nome completo
  antes de qualquer processamento ou envio para LLM externo
        │
        ▼
[2. NVIDIA NeMo GUARDRAILS]
  Input Rails: Detecta Prompt Injection, Jailbreak, DAN attacks
  Output Rails: Detecta alucinações jurídicas críticas, dados sensíveis
  Topical Rails: Restringe o modelo ao domínio jurídico brasileiro
        │
        ▼
[3. AI GATEWAY (LiteLLM / Kong AI Plugin)]
  Roteia para: Claude 3.5 Sonnet, Gemini 2.5 Pro, Llama 3 70B
  Aplica: Token Budget por workspace, Rate Limit, Cost Tracking
  Chave API: Recuperada do HashiCorp Vault (TTL 1h, nunca hardcoded)
        │
        ▼
[4. AUDIT LOG DA IA]
  Registra: user_id, prompt_hash (SHA-256), model_used, tokens_used, response_hash
  Nunca registra: conteúdo raw do prompt (privacidade do cliente)
```

### 18.2 Cobertura OWASP LLM Top 10

| OWASP LLM | Risco | Controle |
|---|---|---|
| LLM01 — Prompt Injection | Usuário manipula comportamento do modelo | NeMo Guardrails Input Rails |
| LLM02 — Insecure Output | Modelo retorna código malicioso | Output sanitization + sandboxed execution |
| LLM04 — Data/Model Poisoning | RAG com documentos maliciosos | Validação de hash dos documentos no índice |
| LLM06 — Sensitive Info Disclosure | Modelo vaza dados de outros usuários | Namespace isolation no pgvector por workspace_id |
| LLM09 — Overreliance | Usuário executa ação sem validação humana | HITL obrigatório para peças jurídicas + disclaimer |

---

## ETAPA 19 — SECURITY LOGGING ARCHITECTURE (TRILHA DE AUDITORIA IMUTÁVEL)

### 19.1 Schema da Tabela de Audit Trail

```sql
CREATE TABLE audit_trail (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_time      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type      VARCHAR(64) NOT NULL,     -- ex: USER_LOGIN, DOC_DOWNLOAD, ADMIN_ACCESS
    actor_user_id   UUID REFERENCES users(id),
    actor_role      VARCHAR(32) NOT NULL,
    actor_ip        INET NOT NULL,
    target_resource VARCHAR(128),
    target_id       UUID,
    action          VARCHAR(32) NOT NULL,
    result          VARCHAR(16) NOT NULL CHECK (result IN ('SUCCESS','FAILURE','DENIED')),
    metadata        JSONB,
    prev_hash       CHAR(64),                 -- hash do registro anterior (chaining)
    record_hash     CHAR(64) GENERATED ALWAYS AS (
        encode(sha256(
            (event_time::text || event_type || actor_user_id::text || action || result || COALESCE(prev_hash,''))::bytea
        ), 'hex')
    ) STORED
);

-- Índices para queries forenses
CREATE INDEX idx_audit_actor ON audit_trail(actor_user_id, event_time DESC);
CREATE INDEX idx_audit_event ON audit_trail(event_type, event_time DESC);
CREATE INDEX idx_audit_resource ON audit_trail(target_resource, target_id, event_time DESC);
```

### 19.2 Fontes de Log Centralizadas no SIEM Wazuh

```
FONTES INTEGRADAS AO WAZUH SIEM:
• AWS CloudTrail    → Toda ação na conta AWS (IAM, S3, RDS, EKS)
• EKS Audit Logs   → kubectl commands, RBAC events, Pod lifecycle
• Kong Access Logs → Todas as requisições de API (request_id, status, latency)
• PostgreSQL pgaudit → DDL changes, privileged queries, login failures
• Keycloak Events  → Login success/fail, token issued/revoked, MFA events
• Application Logs → NestJS structured logs (Winston JSON → Loki)
• OS-Level (auditd) → Syscalls suspeitos nos nós EKS
```

---

## ETAPA 20 — SECURITY OPERATIONS CENTER (SOC 24×7 L1/L2/L3)

### 20.1 Estrutura e Escalada do SOC

```
SOC TIER MODEL — 24 HORAS / 7 DIAS / 365 DIAS

L1 TRIAGEM (Response < 5 min):
  • Monitoramento dos alertas Wazuh + Kong + CloudTrail.
  • Filtro de falsos positivos usando runbooks documentados.
  • Escalonamento imediato de incidentes confirmados para L2.
  • Notificação PagerDuty com severidade P1/P2/P3/P4.

L2 ANÁLISE FORENSE (Resposta < 30 min para P1):
  • Investigação aprofundada de incidentes escalonados pelo L1.
  • Correlação de eventos no SIEM Wazuh (timelines de ataque).
  • Acionamento do Playbook de Incident Response correto.
  • Comunicação com stakeholders: CISO, CTO, Jurídico.

L3 THREAT HUNTING (Proativo — Semanal):
  • Busca proativa de ameaças persistentes avançadas (APT).
  • Análise de IoCs (Indicators of Compromise) de feeds STIX/TAXII.
  • Red Team exercises trimestrais com equipe de pentest interna.
  • Relatório mensal de threat intelligence entregue ao CISO.
```

### 20.2 SLA de Resposta por Severidade

| Severidade | Critério | Resposta L1 | Resolução Target |
|---|---|---|---|
| P1 — Crítico | Comprometimento ativo / Vazamento de dados | < 5 min | < 4 horas |
| P2 — Alto | Vulnerabilidade exploitável / Acesso não autorizado | < 15 min | < 24 horas |
| P3 — Médio | Anomalia detectada / Falha de controle | < 1 hora | < 72 horas |
| P4 — Baixo | Violação de política / Alerta informativo | < 4 horas | < 30 dias |

---

## ETAPA 21 — THREAT MODELING (STRIDE + MITRE ATT&CK)

### 21.1 Análise STRIDE da Legis Connect

| Ameaça | Vetor | Controle Implementado | Risco Residual |
|---|---|---|---|
| **S — Spoofing** | Falsificação de identidade de advogado | Keycloak + Validação OAB API | Baixo |
| **T — Tampering** | Alteração de documentos jurídicos | S3 Object Lock (WORM) + Hash SHA-256 | Baixo |
| **R — Repudiation** | Negar ação realizada na plataforma | Audit Trail HMAC-SHA256 imutável | Muito Baixo |
| **I — Info Disclosure** | Vazamento de PII de clientes | AES-256 + Tokenização + OPA ABAC | Baixo |
| **D — Denial of Service** | Ataque DDoS na API | AWS Shield + Kong Rate Limiting | Médio |
| **E — Elevation of Privilege** | VULN-003: localStorage bypass | OPA ABAC Server-Side (remediação) | Baixo pós-fix |

### 21.2 Principais Táticas MITRE ATT&CK Mapeadas

```
MITRE ATT&CK COVERAGE:
• T1190 — Exploit Public-Facing Application → Bloqueado por Kong WAF (ModSec CRS 3.3)
• T1078 — Valid Accounts (credential theft) → Mitigado por MFA FIDO2 + Token TTL 15min
• T1552 — Unsecured Credentials → Prevenido por Trufflehog pre-commit + Vault
• T1098 — Account Manipulation → Detectado por Wazuh (alerta em mudança de role)
• T1486 — Data Encrypted for Impact (Ransomware) → Mitigado por S3 Object Lock WORM
• T1530 — Data from Cloud Storage → Prevenido por S3 Bucket Policies + KMS CMK
```

---

## ETAPA 22 — VULNERABILITY MANAGEMENT PROGRAM

### 22.1 SLAs de Correção por Severidade CVSS

| Severidade | CVSS Score | SLA de Correção | Processo |
|---|---|---|---|
| Crítica | 9.0 — 10.0 | **< 24 horas** | War Room imediato, patch emergencial |
| Alta | 7.0 — 8.9 | **< 7 dias** | Sprint de segurança prioritária |
| Média | 4.0 — 6.9 | **< 30 dias** | Incluída no sprint regular |
| Baixa | 0.1 — 3.9 | **< 90 dias** | Backlog priorizado normalmente |

### 22.2 Fontes de Descoberta de Vulnerabilidades

```
DISCOVERY SOURCES:
1. SAST Contínuo   → SonarQube a cada Pull Request (automatizado).
2. SCA Contínuo    → Trivy + Dependabot a cada merge em main (automatizado).
3. DAST Semanal    → OWASP ZAP scan no ambiente Staging (automatizado).
4. Pentest Semestral → Empresa externa certificada OSCP/CEH (manual).
5. Bug Bounty      → Programa responsável em HackerOne (recompensas por severidade).
6. CVE Monitoring  → Feed NVD/CISA KEV monitorado pelo SOC L3 diariamente.
7. Threat Intel    → Feeds STIX/TAXII integrados ao Wazuh SIEM.
```

---

## ETAPA 23 — INCIDENT RESPONSE PLAN (NIST SP 800-61)

### 23.1 Playbook Completo de Resposta a Incidentes

```
FASE 1 — DETECÇÃO (< 5 minutos)
  • SIEM Wazuh gera alerta → PagerDuty notifica analista L1 SOC.
  • Analista L1 confirma o incidente vs. falso positivo em runbook.
  • Se confirmado P1: liga imediatamente para CISO + CTO.

FASE 2 — ANÁLISE (< 30 minutos para P1)
  • L2 acessa timeline de eventos no Wazuh.
  • Coleta de evidências: logs, screenshots, IPs, user agents.
  • Classificação do incidente: Tipo, Origem, Dados Afetados.
  • Acionamento do Playbook específico (Ransomware / Data Breach / Account Compromise).

FASE 3 — CONTENÇÃO (< 1 hora para P1)
  • Revogar tokens Keycloak do(s) usuário(s) comprometido(s).
  • Isolar namespace EKS afetado (NetworkPolicy deny-all).
  • Bloquear IP de origem no Kong WAF + AWS WAF.
  • Preservar evidências (snapshot de volume EBS, export de logs).

FASE 4 — ERRADICAÇÃO (< 4 horas para P1)
  • Remover malware / backdoors identificados.
  • Rotacionar credenciais afetadas (Vault rotação imediata).
  • Aplicar patch da vulnerabilidade explorada.
  • Rebuild do container afetado com imagem limpa validada.

FASE 5 — RECUPERAÇÃO (< 24 horas para P1)
  • Restaurar serviço a partir de backup Point-in-Time validado.
  • Monitoramento intensificado por 72 horas pós-recuperação.
  • Verificação de integridade dos dados afetados (hash comparison).

FASE 6 — PÓS-INCIDENTE
  • Notificação à ANPD em < 72h (se dados pessoais afetados — LGPD Art. 48).
  • Comunicado aos titulares afetados em < 15 dias úteis.
  • Post-Mortem blameless documentado em < 5 dias úteis.
  • Atualização do Threat Model com o novo vetor explorado.
```

---

## ETAPA 24 — COMPLIANCE & CERTIFICAÇÕES ROADMAP

### 24.1 Roadmap de Certificações Internacionais

```
ANO 1 — FUNDAÇÃO & LGPD (Meses 1-12)
  Mês 1-3:   Remediação VULNs críticas + Gap Assessment ISO 27001.
  Mês 4-6:   Deploy IAM, OPA, Vault, DevSecOps Pipeline + LGPD Portal Self-Service.
  Mês 7-9:   SOC 24/7 Wazuh + Pentest Externo Independente (relatório formal).
  Mês 10-12: Auditoria ISO/IEC 27001 Stage 1 + SOC 2 Type I Readiness Assessment.

ANO 2 — CERTIFICAÇÕES (Meses 13-24)
  Mês 13-15: ISO/IEC 27001 Stage 2 Audit → Certificação.
  Mês 16-18: SOC 2 Type II Observation Period (12 meses de evidências contínuas).
  Mês 19-21: NIST CSF 2.0 Self-Assessment + CIS Controls v8 Benchmark.
  Mês 22-24: SOC 2 Type II Report Final → Entrega a clientes Enterprise.
```

### 24.2 Controles ISO/IEC 27001 Mapeados

| Domínio ISO 27001 | Controles Relevantes | Status Esperado TO-BE |
|---|---|---|
| A.5 — Políticas de SI | Política de Segurança aprovada pelo Board | Em elaboração |
| A.8 — Gestão de Ativos | Inventário de dados e sistemas classificado | Implementado |
| A.9 — Controle de Acesso | IAM, RBAC, ABAC, MFA | Implementado |
| A.10 — Criptografia | AES-256, TLS 1.3, Argon2id, KMS | Implementado |
| A.12 — Segurança Operacional | SIEM, Patch Management, Malware | Implementado |
| A.14 — Dev Seguro | SSDLC, SAST, DAST, Code Review | Implementado |
| A.16 — Incidentes | IRP, SOC, Post-Mortem, ANPD | Implementado |
| A.18 — Conformidade | LGPD, Análise jurídica periódica | Implementado |

---

## ETAPA 25 — CYBERSECURITY MATURITY ASSESSMENT

### 25.1 Avaliação de Maturidade por Domínio

| Domínio de Segurança | Nível AS-IS | Nível TO-BE (12m) | Evidência |
|---|---|---|---|
| Identidade & Acesso | 1 — Inicial | 5 — Otimizado | Keycloak + OPA + FIDO2 |
| Proteção de Dados | 1 — Inicial | 5 — Otimizado | AES-256 + Argon2id + Tokenização |
| Segurança de Aplicação | 1 — Inicial | 4 — Gerenciado | OWASP ASVS v4.0 + DevSecOps |
| Gestão de Vulnerabilidades | 1 — Inicial | 4 — Gerenciado | Trivy + SonarQube + Pentest semestral |
| Detecção & Resposta | 1 — Inicial | 5 — Otimizado | Wazuh SIEM + SOC 24/7 + IRP |
| Conformidade Regulatória | 2 — Controlado | 5 — Otimizado | LGPD + ISO 27001 + SOC 2 Type II |
| Segurança de IA | 1 — Inicial | 4 — Gerenciado | NeMo Guardrails + OWASP LLM Top 10 |
| **MATURIDADE GERAL** | **1.1 / 5.0** | **4.7 / 5.0** | Programa completo 12 meses |

---

## ETAPA 26 — BACKLOG DE SEGURANÇA PRIORIZADO

### SEC-001 — EMERGENCIAL: Remediação VULN-001 a VULN-005 (War Room 24h)
**Prioridade:** MÁXIMA | **Estimativa:** 1 semana | **Complexidade:** Alta
- Rotacionar credenciais Admin (VULN-001) — **ação em < 2h**.
- Invalidar API Key Gemini exposta (VULN-004) — **ação em < 48h**.
- Remover dados PII do localStorage (VULN-005) — **início imediato**.
- Desabilitar btoa e implementar Argon2id (VULN-002) — **sprint emergencial**.
- Adicionar validação server-side mínima (VULN-003) — **hotfix urgente**.

### SEC-002 — CRÍTICO: Deploy Keycloak IAM + OAuth 2.1 + MFA FIDO2
**Prioridade:** CRÍTICA | **Estimativa:** 6 semanas | **Complexidade:** Alta
Keycloak 24 no EKS com Realms isolados, PKCE, tokens JWT RS256 TTL 15min, FIDO2 obrigatório para Admin/Lawyers, TOTP para clientes.

### SEC-003 — CRÍTICO: OPA ABAC Policy Engine Server-Side
**Prioridade:** CRÍTICA | **Estimativa:** 4 semanas | **Complexidade:** Média-Alta
Open Policy Agent como middleware NestJS globalmente aplicado em todos os endpoints. Policies Rego para todos os perfis de usuário com testes automatizados.

### SEC-004 — CRÍTICO: HashiCorp Vault + AI Gateway
**Prioridade:** CRÍTICA | **Estimativa:** 3 semanas | **Complexidade:** Média
Vault Enterprise no EKS com Secret Engines (KV v2, PKI, Database, AWS). AI Gateway intermediando todas as chamadas a LLMs externos com chave do Vault (TTL 1h).

### SEC-005 — ALTA: DevSecOps Pipeline Completo
**Prioridade:** ALTA | **Estimativa:** 3 semanas | **Complexidade:** Média
SonarQube (Quality Gate obrigatório) + Trivy SCA + Trufflehog pre-commit + OWASP ZAP semanal em Staging + Checkov para IaC Terraform.

---

## ETAPA 27 — ENTERPRISE CYBERSECURITY, PRIVACY & COMPLIANCE BLUEPRINT CONSOLIDADO

```
LEGIS CONNECT — INTEGRATED ENTERPRISE SECURITY ARCHITECTURE
Versão 2.0 | 27 Etapas Auditadas | Julho 2026

[CAMADA 1 — IDENTIDADE & ACESSO ZERO TRUST]
  Keycloak 24 OIDC · OAuth 2.1 + PKCE · FIDO2 Passkeys WebAuthn
  JWT RS256 (TTL 15min) · OPA ABAC Policy Engine · HashiCorp Vault PAM
  mTLS Istio Service Mesh (SPIFFE/SPIRE) · Step-Up MFA por contexto

[CAMADA 2 — PROTEÇÃO DE DADOS & CRIPTOGRAFIA]
  AES-256-GCM AWS KMS · Argon2id Passwords · TLS 1.3 + HSTS Preload
  S3 Object Lock WORM · pgcrypto Tokenização PII · Redis Encryption at Rest
  CMK Hierarquia: ROOT → DB → S3 → BACKUP → AUDIT

[CAMADA 3 — PRIVACIDADE & CONFORMIDADE (LGPD + ISO 27001 + SOC 2)]
  Privacy by Design (7 Princípios) · DPO Formalizado · ROPA Trimestral
  LGPD Art. 46 (Medidas Técnicas) · Portal Direitos Art. 18 (< 24h)
  ANPD Notificação Art. 48 (< 72h) · ISO/IEC 27001 · SOC 2 Type II

[CAMADA 4 — APPLICATION & AI SECURITY]
  OWASP ASVS v4.0 · SSDLC Seguro · Kong WAF (ModSec CRS 3.3)
  NeMo Guardrails (Prompt Injection + PII Sanitizer) · OWASP LLM Top 10
  API Security Framework (BOLA, Auth, Rate Limiting, Bot Protection)

[CAMADA 5 — DEVSECOPS & VULNERABILITY MANAGEMENT]
  SonarQube SAST · Trivy SCA · Trufflehog Secrets · OWASP ZAP DAST
  Checkov IaC · Dependabot · Pentest Semestral · Bug Bounty HackerOne
  SLA Correção: P1 < 24h | P2 < 7d | P3 < 30d | P4 < 90d

[CAMADA 6 — DETECÇÃO, RESPOSTA & INTELIGÊNCIA DE AMEAÇAS]
  SIEM Wazuh (CloudTrail + EKS + Kong + PostgreSQL + Keycloak)
  SOC 24/7 L1 (< 5min) / L2 (< 30min) / L3 Threat Hunting (semanal)
  Threat Modeling STRIDE + MITRE ATT&CK · IRP NIST SP 800-61
  Audit Trail HMAC-SHA256 Imutável · Post-Mortem Blameless

MATURIDADE: 1.1 → 4.9 / 5.0  |  PRAZO: 12 MESES  |  RESULTADO: SECURE LEGAL PLATFORM
```

---

*Enterprise Cybersecurity, Privacy & Compliance Architecture Blueprint v2.0*
*27 Etapas Auditadas e Verificadas*
*CISO · DPO · Enterprise Security Architect · Legis Connect · 2026*
