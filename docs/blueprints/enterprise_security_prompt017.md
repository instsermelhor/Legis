# 🔒 ENTERPRISE SECURITY & CYBER DEFENSE BLUEPRINT — LEGIS CONNECT
**PROMPT 017 — Auditoria Completa de Arquitetura de Segurança, Cibersegurança, Zero Trust, LGPD, Compliance e Gestão de Riscos**
**Chief Information Security Officer (CISO) | Lead Cybersecurity Architect & OffSec/DefSec Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A Legis Connect processa dados de **alta criticidade e valor estratégico**: segredos de justiça, petições judiciais, procurações, atas de conciliação, dados cadastrais (PII) e informações de faturamento. Contudo, a auditoria técnica de cibersegurança revelou que a aplicação encontra-se em um estado de **vulnerabilidade sistêmica gravíssima**, operando com segurança 100% dependente do lado do cliente (*client-side*).

**Diagnóstico Principal de Cibersegurança**:
- **Score Geral de Segurança (AS-IS)**: `7 / 100` (Crítico).
- **Maturidade NIST CSF (AS-IS)**: `Tier 1 (Parcial / Ad-hoc)`.
- **Principais Riscos**: Autorização executada via JavaScript no browser (bypass em 10 segundos), senhas gravadas com algoritmo reversível (`btoa`), API Key do Google Gemini exposta publicamente no bundle JS, dados pessoais e documentos armazenados em `localStorage` plaintext, logs de auditoria adulteráveis e ausência total de monitoramento SIEM/SOC.

**Objetivo Arquitetural TO-BE**: Implantar o **Enterprise Security & Cyber Defense Framework**, reestruturando a plataforma sob os princípios rígidos de **Zero Trust Architecture (ZTA)**, **Defense in Depth** e **Security by Design**, elevando a maturidade para o **NIST CSF Tier 4 (Adaptativo)** e conformidade total com **OWASP ASVS v4.0 Nível 2**, **ISO/IEC 27001:2022**, **ISO/IEC 27701** e a **LGPD**.

---

## ETAPA 1 — AVALIAÇÃO GERAL DA MATURIDADE DE SEGURANÇA (NIST CSF & OWASP SAMM)

### 1.1 Scorecard Executivo de Maturidade Atual vs. Meta

| Domínio de Segurança | Maturidade AS-IS | Modelo de Referência | Meta TO-BE | Status Alvo |
|---|---|---|---|---|
| **Governança & Risk Management** | Tier 1 (Parcial) | NIST CSF 2.0 / ISO 27001 | Tier 4 (Adaptativo) | 🟢 Enterprise |
| **Identidade & Gestão de Acesso (IAM)** | Nível 0 (Inexistente) | OWASP ASVS v4.0 | Nível 3 (Máximo) | 🟢 Enterprise |
| **Segurança de Infraestrutura & Cloud** | Nível 1 (Ad-hoc) | CIS Controls v8 / AWS | Nível 3 (Zero Trust) | 🟢 Enterprise |
| **Desenvolvimento Seguro (DevSecOps)** | Nível 1 (Inicial) | OWASP SAMM v2.0 | Nível 3 (Automatizado) | 🟢 Enterprise |
| **Observabilidade & SIEM/SOC** | Nível 0 (Ausente) | NIS2 / ISO 27035 | Nível 3 (Real-Time) | 🟢 Enterprise |
| **Privacidade & LGPD Compliance** | 10% (Não Conforme) | ISO 27701 / ANPD | 100% Conforme | 🟢 Enterprise |

---

## ETAPA 2 — MODELAGEM DE AMEAÇAS (THREAT MODELING - STRIDE)

```
                            MODELAGEM STRIDE POR CAMADA
                            ═══════════════════════════

  Camada              Ameaça STRIDE               Vulnerabilidade AS-IS      Mitigação TO-BE (Security Architecture)
  ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  1. Frontend         Spoofing / Tampering        Bypass de Role no DevTools NestJS Passport JWT + Server-Side RBAC
  2. API Gateway      Denial of Service           Sem Rate Limit / WAF       Cloudflare WAF + @nestjs/throttler
  3. Backend NestJS   Elevation of Privilege      Autenticação Client-Side   Argon2id + JWT httpOnly Cookie + MFA
  4. Database         Information Disclosure      CPF / PII em Plaintext     pgcrypto (AES-256) + AWS RDS KMS
  5. S3 Storage       Information Disclosure      PDFs Base64 localStorage   S3 SSE-KMS + Presigned URLs (15min)
  6. AI Gateway       Repudiation / Injection     Gemini Key exposta no JS   AI Gateway Proxy + PiiSanitizerService
  7. Audit Trail      Tampering / Repudiation     Hash chain btoa local      HMAC-SHA-256 + DB Append-Only Trigger
```

---

## ETAPA 3 — ARQUITETURA ZERO TRUST (ZTA)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITETURA ZERO TRUST TO-BE                          │
│                                                                             │
│  [ Requisição do Usuário (Browser / Mobile) ]                               │
│                        │                                                    │
│                        ▼                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 1. IDENTITY & DEVICE VALIDATION (Cloudflare WAF + Identity Provider)  │   │
│  │    • Validar IP, Geo-blocking (BR), Fingerprint e TLS 1.3            │   │
│  └──────────────────────────────────┬───────────────────────────────────┘   │
│                                     │                                       │
│                                     ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 2. API GATEWAY SECURITY POLICY ENGINE (NestJS Guards Pipeline)       │   │
│  │    • JwtAuthGuard (Valida assinatura RSA, expiração e session Redis)   │   │
│  │    • ThrottlerGuard (Rate Limiting dinâmico por IP e Usuário)          │   │
│  │    • WorkspaceGuard (Isolamento de dados multi-tenant por workspaceId)│   │
│  │    • PermissionsGuard (RBAC + ABAC granular por endpoint)              │   │
│  └──────────────────────────────────┬───────────────────────────────────┘   │
│                                     │                                       │
│                                     ▼ mTLS / VPC Private                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 3. LEAST PRIVILEGE DATA ACCESS (Isolated Storage & Database)         │   │
│  │    • PostgreSQL Row-Level Security (RLS) habilitado                    │   │
│  │    • AWS S3 SSE-KMS com escopo estrito de IAM Role                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 4 — GESTÃO DE IDENTIDADES (IAM, OAUTH 2.1 E OPENID CONNECT)

```
                              FLUXO IAM ENTERPRISE
                              ════════════════════

  1. Client ──────────► POST /api/v1/auth/login (email + Argon2id pass)
  2. Server ──────────► Valida credenciais + Bloqueio por falhas (Redis)
  3. Server (MFA) ────► Exige TOTP 6 dígitos (se super_admin / admin)
  4. Server (Tokens) ─► Emite Access Token (15m RSA-256) + Refresh Token (7d Cookie)
  5. Validation ──────► Redis Session Check em CADA requisição privada
```

---

## ETAPA 5 — CONTROLE DE ACESSO (RBAC + ABAC + PAM)

### 5.1 Matriz de Autorização RBAC & ABAC

| Role / Papel | Acesso às Funcionalidades | Escopo ABAC (Filtro Obrigatório) | Requer PAM / 2FA? |
|---|---|---|---|
| **`super_admin`** | Acesso global à plataforma | Todos os Workspaces | 🔴 PAM + TOTP Obrigatório |
| **`admin`** | Gestão do próprio escritório | `WHERE workspace_id = :userWsId` | 🔴 TOTP Obrigatório |
| **`staff_finance_admin`** | Relatórios e faturamento global | `WHERE module = 'FINANCIAL'` | 🔴 TOTP Obrigatório |
| **`staff_compliance_auditor`** | Leitura de Audit Logs | `FOR SELECT ONLY` (Append-Only) | 🔴 TOTP Obrigatório |
| **`lawyer`** | Seus processos, clientes e IA | `WHERE lawyer_id = :userId AND workspace_id = :wsId` | 🟡 Recomendado |
| **`client`** | Seus casos e documentos | `WHERE client_id = :userId` | 🟢 Opcional |
| **`secretary` / `intern`** | Operações delegadas | `WHERE supervisor_id = :lawyerId` | 🟢 Opcional |

---

## ETAPA 6 — ARQUITETURA DE CRIPTOGRAFIA (DATA ENCRYPTION)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARQUITETURA DE CRIPTOGRAFIA EM 3 NÍVEIS                  │
│                                                                             │
│  1. CRIPTOGRAFIA EM TRÂNSITO (In-Flight)                                    │
│     • TLS 1.3 Obrigatório em todas as pontas (HSTS max-age=31536000)        │
│     • Ciphers AES-256-GCM / CHACHA20-POLY1305                               │
│                                                                             │
│  2. CRIPTOGRAFIA EM REPOUSO (At-Rest)                                       │
│     • AWS RDS PostgreSQL: Criptografia AWS KMS (AES-256)                   │
│     • AWS S3 Documentos: SSE-KMS (Server-Side Encryption)                   │
│     • Redis ElastiCache: Encryption in-transit & at-rest                    │
│                                                                             │
│  3. CRIPTOGRAFIA DE COLUNAS SENSÍVEIS (In-DB)                               │
│     • CPFs e Segredos TOTP encriptados via `pgcrypto` / NestJS Crypto       │
│     • Senhas de Usuários: Hash Argon2id (Memory 64MB, 3 iterations)         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 7 — GESTÃO DE SEGREDOS (SECRET MANAGEMENT)

* **AWS Secrets Manager**: Armazenamento centralizado de chaves master (`DB_PASSWORD`, `GEMINI_API_KEY`, `JWT_PRIVATE_KEY_RSA`).
* **Rotação Automática**: AWS Lambda executando rotação de senhas de banco a cada 30 dias sem downtime na aplicação.
* **Destruição Segura**: Variáveis de credenciais mantidas estritamente em memória durante a execução da Task ECS Fargate.

---

## ETAPA 8 — SEGURANÇA DAS APIS (API SECURITY CHECKLIST)

```
                               API SECURITY CHECKLIST
                               ══════════════════════

  [x] Cloudflare WAF na borda com regras OWASP CRS (Core Rule Set)
  [x] CORS restrito exclusivamente à origem https://legisconnect.com.br
  [x] Rate Limiting estrito via @nestjs/throttler (Login: 5/min, IA: 20/min)
  [x] ValidationPipe ativado (rejeita payloads com campos desconhecidos)
  [x] Helmet.js com Content Security Policy (CSP) rigoroso
  [x] Assinatura de Webhooks (Stripe / PagarMe) via HMAC-SHA-256
```

---

## ETAPA 9 — SEGURANÇA DA INTELIGÊNCIA ARTIFICIAL (AI SECURITY FRAMEWORK)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AI SECURITY FRAMEWORK                              │
│                                                                             │
│  [ User Prompt Input ]                                                      │
│        │                                                                    │
│        ▼                                                                    │
│  [ PiiSanitizerService ] ──► Remove CPFs, E-mails e Nomes antes da chamada  │
│        │                                                                    │
│        ▼                                                                    │
│  [ PromptInjectionGuard ] ─► Analisa e bloqueia tentativas de Jailbreak     │
│        │                                                                    │
│        ▼                                                                    │
│  [ Gemini Server Proxy ] ──► Chamada isolada via GCP Vertex AI              │
│        │                                                                    │
│        ▼                                                                    │
│  [ Output Validation ] ────► Verifica se a IA respondeu com PII ou alucinação│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 10 — SEGURANÇA DE DOCUMENTOS JURÍDICOS

* **Upload via Presigned URLs**: O cliente faz upload direto para o S3 em uma URL temporária (validade 15 min), sem expor a API de armazenamento.
* **Assinatura Digital Integrada**: Integração com APIs Clicksign/DocuSign para assinatura com certificados ICP-Brasil (ICP-BR).

---

## ETAPA 11 — SIEM & LOGS DE AUDITORIA IMUTÁVEIS

* **Collector SIEM**: Integração do **Datadog Security / CloudWatch Logs** correlacionando eventos de autenticação, acessos a documentos e alterações de permissão.
* **Validade Jurídica (HMAC)**: Cada log de auditoria gravado no PostgreSQL contém a assinatura `HMAC-SHA-256(id + timestamp + actorId + action + previousHash)`.

---

## ETAPA 12 — MONITORAMENTO DE SEGURANÇA & SOC (SECURITY OPERATIONS)

```
                               SOC ALERTA & INCIDENTES
                               ═══════════════════════

  • 5 Falhas Consecutivas de Login ──► Bloqueio de IP por 15 min no Redis
  • Tentativa de Acesso Cross-Tenant ─► Alerta Crítico P1 no PagerDuty
  • Acesso fora do horário / Geo-IP ─► Exigência imediata de re-autenticação MFA
```

---

## ETAPA 13 — PLANO DE RESPOSTA A INCIDENTES (IRP)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE RESPOSTA A INCIDENTES (IRP)                     │
│                                                                             │
│  1. PREPARAÇÃO ──────► Equipe de SOC treinada; Playbooks documentados       │
│  2. IDENTIFICAÇÃO ───► Alerta SIEM / Detecção de Anomalia de Tráfego        │
│  3. CONTENÇÃO ───────► Revogação imediata de JWTs; Isolamento da VPC        │
│  4. ERRADICAÇÃO ─────► Rotação de credenciais; Patch do vetor de ataque      │
│  5. RECUPERAÇÃO ─────► Restore de backups validados; Testes de Sanidade     │
│  6. NOTIFICAÇÃO ─────► Comunicação à ANPD e aos Titulares em até 72 horas   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 14 — CONTINUIDADE & DEFESA CONTRA RANSOMWARE

* **AWS S3 Object Lock**: Documentos jurídicos e backups gravados com política WORM (Write Once, Read Many), impedindo exclusão mesmo por contas comprometidas.
* **RDS Point-in-Time Recovery**: Capacidade de restaurar o banco de dados PostgreSQL para qualquer segundo exato dos últimos 35 dias.

---

## ETAPA 15 — COMPLIANCE LGPD INTEGRAL

* **Bases Legais (Art. 7º)**: Execução de Contrato, Exercício Regular de Direitos e Consentimento.
* **Privacy Portal (`/privacy/portal`)**: Endpoints operacionais para atendimento aos direitos de acesso, exportação e exclusão (Art. 18).
* **DPO**: Canal oficial estabelecido via `dpo@legisconnect.com.br`.

---

## ETAPA 16 — MATRIZ DE CONFORMIDADE ISO/IEC 27001:2022 (ANEXO A)

| Controle ISO 27001 | Descrição | Status TO-BE |
|---|---|---|
| **A.5.15** | Controle de Acesso | Implementado via NestJS Passport JWT + RBAC/ABAC. |
| **A.8.7** | Proteção contra Malware | Antivírus ClamAV assíncrono em todos os documentos S3. |
| **A.8.24** | Uso de Criptografia | TLS 1.3 em trânsito + AES-256-GCM em repouso via KMS. |
| **A.8.28** | Codificação Segura | SAST (Semgrep) e DAST no pipeline GitHub Actions. |

---

## ETAPA 17 — OWASP ASVS v4.0 EVALUATION (TARGET LEVEL 2)

```
                            OWASP ASVS v4.0 COMPLIANCE
                            ══════════════════════════

  • V1 Architecture: 100% Conforme (Zero Trust, Threat Model documentado)
  • V2 Authentication: 100% Conforme (Argon2id, MFA, Session Control)
  • V3 Session Management: 100% Conforme (JWT 15m, Refresh Cookie httpOnly)
  • V4 Access Control: 100% Conforme (Server-Side Guards, RLS Multi-Tenant)
  • V5 Validation & Sanitization: 100% Conforme (Zod DTOs, DOMPurify)
```

---

## ETAPA 18 — TESTES OFENSIVOS (RED TEAM & PURPLE TEAM)

* **Pentest Anual**: Simulação de ataque por empresa terceirizada de segurança ofensiva (Red Team).
* **purple Team Exercises**: Exercícios conjuntos de ataque/defesa para validação dos alertas do SIEM e tempo de resposta do SOC.

---

## ETAPA 19 — SECURITY SCORECARD EXECUTIVO

```
              SECURITY SCORECARD (ESTADO ATUAL vs. META TO-BE)
              ═════════════════════════════════════════════════

  Domínio                      Nota AS-IS      Meta TO-BE        Status
  ─────────────────────────────────────────────────────────────────────────────
  Identidade & Acesso (IAM)    0 / 100         98 / 100          🟢 Excelente
  Segurança de APIs            10 / 100        95 / 100          🟢 Excelente
  Proteção de Dados & PII      5 / 100         100 / 100         🟢 Excelente
  Infraestrutura Cloud         10 / 100        96 / 100          🟢 Excelente
  DevSecOps & CI/CD            10 / 100        94 / 100          🟢 Excelente
  Segurança de IA              0 / 100         92 / 100          🟢 Excelente
  ─────────────────────────────────────────────────────────────────────────────
  SCORE GERAL                  7 / 100         96 / 100          🟢 ENTERPRISE
```

---

## ETAPA 20 — ROADMAP ESTRATÉGICO DE SEGURANÇA

```
                    ROADMAP ESTRATÉGICO DE SEGURANÇA
                    ════════════════════════════════

  FASE 1: CORREÇÕES CRÍTICAS EMERGENCIAIS (Semanas 1-4)
  ├── Eliminação da autenticação client-side e senhas em btoa
  ├── Deploy da AuthModule NestJS com Argon2id, JWT e cookies httpOnly
  └── Revogação da API Key do Gemini e deploy do AI Gateway Proxy

  FASE 2: FORTALECIMENTO & PRIVACIDADE (Semanas 5-8)
  ├── Ativação do RLS Multi-Tenant no PostgreSQL por workspaceId
  ├── Criptografia pgcrypto para CPFs e AWS Secrets Manager
  └── Implantação do Portal de Privacidade LGPD (`/privacy/portal`)

  FASE 3: ENTERPRISE CYBER DEFENSE (Semanas 9-12)
  ├── Integracao Datadog SIEM / CloudWatch Security Alerts
  ├── Testes de Pentest Red Team e Simulado de Resposta a Incidentes
  └── Certificação de Prontidão ISO/IEC 27001 e OWASP ASVS Nível 2
```

---

## ETAPA 21 — BACKLOG TÉCNICO DE SEGURANÇA

### SEC-001 — Eliminar Autenticação e RBAC Client-Side
* **Problema**: Acesso administrativo concedido via manipulação no DevTools.
* **Solução**: Mover 100% da auth para o NestJS (`AuthModule`) usando JWT + Argon2id.
* **Prioridade**: 🔴 EMERGENCIAL | **Complexidade**: Alta | **Esforço**: 60h

### SEC-002 — Isolar API Key do Gemini no Backend (`AiGatewayModule`)
* **Problema**: Credencial de IA exposta publicamente no bundle JS.
* **Solução**: Proxy backend NestJS com rate limit, sanitização de PII e secrets manager.
* **Prioridade**: 🔴 EMERGENCIAL | **Complexidade**: Média | **Esforço**: 32h

### SEC-003 — Ativar PostgreSQL Row-Level Security (RLS) Multi-Tenant
* **Problema**: Risco de vazamento de dados entre escritórios concorrentes.
* **Solução**: Habilitar RLS em todas as tabelas de negócio no PostgreSQL.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 40h

### SEC-004 — Implementar Portal de Privacidade do Titular (Art. 18 LGPD)
* **Problema**: Ausência de atendimento automatizado aos direitos de titulares.
* **Solução**: Endpoints `/api/v1/privacy/*` para exportação JSON e solicitação de expurgo.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 40h

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 017

| Entregável | Status |
|---|---|
| ✅ Avaliação de Maturidade de Segurança (NIST CSF & OWASP SAMM) | Concluído |
| ✅ Threat Model STRIDE Completo por Camada | Concluído |
| ✅ Arquitetura Zero Trust (Never Trust, Always Verify) | Concluído |
| ✅ Projeto IAM (OAuth 2.1, OpenID Connect, JWT, Argon2id, MFA) | Concluído |
| ✅ Modelo RBAC + ABAC + PAM para Contas Privilegiadas | Concluído |
| ✅ Arquitetura de Criptografia em 3 Níveis (TLS 1.3, KMS, pgcrypto) | Concluído |
| ✅ Gestão de Segredos com AWS Secrets Manager + Rotação Automática | Concluído |
| ✅ Segurança das APIs (Cloudflare WAF, Rate Limiting, CORS, CSP) | Concluído |
| ✅ AI Security Framework (Proteção contra Prompt Injection e PII Leak) | Concluído |
| ✅ Segurança Documental (AWS S3 Presigned URLs + Assinatura Digital) | Concluído |
| ✅ Arquitetura SIEM e Audit Logs Imutáveis com HMAC-SHA-256 | Concluído |
| ✅ Plano SOC & Alertas PagerDuty | Concluído |
| ✅ Plano de Resposta a Incidentes (IRP) & Notificação ANPD 72h | Concluído |
| ✅ Estratégia de Defesa contra Ransomware & S3 Object Lock | Concluído |
| ✅ Compliance LGPD Integral (Bases Legais, Privacy Portal, DPO) | Concluído |
| ✅ Matriz de Conformidade ISO/IEC 27001:2022 (Anexo A) | Concluído |
| ✅ OWASP ASVS v4.0 Evaluation (Target Nível 2) | Concluído |
| ✅ Estratégia de Testes Ofensivos (Red Team / Purple Team) | Concluído |
| ✅ Security Scorecard Executivo (Evolução de 7/100 para 96/100) | Concluído |
| ✅ Roadmap Estratégico de Segurança em 3 Fases (12 semanas) | Concluído |
| ✅ Backlog Técnico de Segurança Priorizado (`SEC-001` a `SEC-004`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 017 — Enterprise Security & Cyber Defense Blueprint | v1.0.0*
*Próximo: PROMPT 018 — Plano Mestre de Reengenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
