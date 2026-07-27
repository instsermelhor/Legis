# PROMPT 046 — Enterprise Cybersecurity Architecture & Zero Trust Security Blueprint
## Legis Connect · Chief Information Security Officer (CISO) · Enterprise Security Architect · Cyber Defense Lead
### Versão 1.0 | Classificação: CONFIDENCIAL | Data: 2026-07-25

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Corporativa de Cibersegurança, Defesa Digital e Zero Trust (Enterprise Cyber Defense) da Legis Connect TO-BE**, consolidando 25 domínios fundamentais de Zero Trust ("Never Trust, Always Verify"), Gestão de Identidades (IAM/PAM), Segurança de Aplicações e APIs (AppSec), DevSecOps Pipeline, Criptografia End-to-End, Segurança de IA (NeMo Guardrails), SIEM/SOC Operations 24/7, Resposta a Incidentes, Disaster Recovery (RTO < 15min / RPO ~0) e Governança alinhada às normas **ISO/IEC 27001**, **NIST Cybersecurity Framework 2.0**, **SOC 2 Type II** e **LGPD Art. 46**.

**Estado AS-IS:** Maturidade de Segurança `1.3 / 5.0` (Vulnerável & Reativa) — permissões baseadas em RBAC estático sem autenticação contínua, credenciais hardcoded em variáveis locais, ausência de validação DAST/SAST em CI/CD, falta de monitoramento SIEM/SOC centralizado e vulnerabilidade a ataques OWASP API e Prompt Injection em IA.

**Estado TO-BE:** Maturidade de Segurança `4.9 / 5.0` (Zero Trust & Resilient Cyber Defense) — Identidade como Perímetro (Keycloak OIDC com Passkeys FIDO2), Autorização Dinâmica ABAC (Open Policy Agent), HashiCorp Vault Secrets com TTL 1h, mTLS em Istio Service Mesh, DevSecOps Pipeline automatizado (SAST/DAST/SCA), SIEM Wazuh com SOC 24/7, Cofre Digital S3 Object Lock (WORM) com Criptografia de Envelope AES-256 e Conformidade Total ISO 27001 / SOC 2 Type II.

---

## ETAPA 1 — AUDITORIA DO MODELO ATUAL DE SEGURANÇA (AS-IS vs. TO-BE)

### 1.1 Matriz de Controles de Segurança

| Controle de Segurança | Estado Atual (AS-IS) | Risco Detectado | Recomendação TO-BE |
|---|---|---|---|
| **Autenticação** | Senha estática + SMS MFA parcial | Roubo de credenciais via Phishing / SIM Swap | Keycloak OIDC com Passkeys FIDO2 + WebAuthn + TOTP |
| **Autorização** | RBAC simples em código backend | Broken Object Level Authorization (BOLA) | ABAC com Open Policy Agent (OPA) + PostgreSQL RLS |
| **Segredos & Keys** | Arquivos `.env` estáticos no servidor | Exposição acidental de credenciais mestre | HashiCorp Vault com rotação dinâmica efêmera (TTL 1h) |
| **Criptografia Dados** | Criptografia padrão RDS básica | Exposição de dados caso a chave RDS seja exposta | KMS Customer Managed Keys (CMK) + Tokenização Vault |
| **Segurança de API** | API Key estática na query string | Interceptação de tráfego e requisições maliciosas | OAuth 2.1 + Rate Limiting Kong WAF + mTLS Istio |
| **DevSecOps** | Deploy manual via SSH | Promoção de código vulnerável para produção | Pipeline GitOps com SAST (SonarQube) + SCA + DAST |
| **Monitoramento SOC** | Logs isolados em arquivo de texto | Impossibilidade de responder a ataques em tempo real | SIEM Wazuh + Elastic Security + SOC L1/L2/L3 24/7 |

---

## ETAPA 2 — THREAT MODELING COMPLETO (STRIDE & ATTACK SURFACE)

```
                       AMEAÇAS & VETORES DE ATAQUE (STRIDE)
                                         │
 ┌───────────────────┬───────────────────┼───────────────────┬───────────────────┐
 ▼                   ▼                   ▼                   ▼                   ▼
[SPOOFING]          [TAMPERING]         [REPUDIATION]       [INFO DISCLOSURE]   [DOS / HIJACKING]
 Imputação de       Injeção SQL /       Falta de Logs       Vazamento de PII    Exaustão de Recursos
 Identidade OAB     Alteração de Docs   Assinados HMAC      por Prompt LLM      Ataques DDoS L7
```

---

## ETAPA 3 — ARQUITETURA ZERO TRUST (NEVER TRUST, ALWAYS VERIFY)

```
[SOLICITANTE (Usuário / Dispositivo / API)]
                    │
                    ▼
[1. AUTHENTICATION & DEVICE TRUST (Keycloak / FIDO2 Passkey)]
 ├── Validação de Identidade (MFA / Biometria FIDO2)
 └── Device Health-Check (EDR Status & Patch Compliance)
                    │
                    ▼
[2. POLICY DECISION POINT (OPA - Open Policy Agent Engine)]
 ├── Avaliação ABAC: Usuário + Atributo + Workspace + Geo/Hora
 └── Verificação de Privilégio Mínimo (Least Privilege)
                    │
                    ▼
[3. POLICY ENFORCEMENT POINT (Kong API Gateway + Istio mTLS)]
 ├── Validação de JWT Assinado (RS256)
 ├── Inspeção WAF / NeMo Guardrails (OWASP 10 + AI Safety)
 └── Criptografia de Trânsito mTLS (TLS 1.3)
                    │
                    ▼
[RECURSO PROTEGIDO (Microsserviços NestJS / PostgreSQL / S3 Lakehouse)]
```

---

## ETAPA 4 — IAM & MATRIZ DE AUTORIZAÇÃO (RBAC / ABAC PERMISSION MATRIX)

### 4.1 Permissões por Perfil de Acesso

| Perfil de Acesso | Gestão de Usuários | Documentos & GED | Módulo Financeiro | Administração & Audit |
|---|---|---|---|---|
| **Cliente Final** | Apenas Próprio Perfil | Apenas Próprios Casos | Apenas Faturas Próprias | Sem Acesso |
| **Advogado Autônomo**| Apenas Próprio Perfil | Leitura/Escrita Própria| Faturamento Próprio | Sem Acesso |
| **LegalOps / Sócio** | Equipe do Escritório | Todos do Escritório | DRE & Faturamento Total | Sem Acesso |
| **SysAdmin Legis** | Leitura Auditada | Sem Acesso ao Conteúdo| Sem Acesso a Faturas | Gestão de Infra & SLOs |
| **Compliance/Auditor**| Leitura de Logs | Audit Logs de Acesso | Audit Logs de Repasses | Acesso Total a Logs |

---

## ETAPA 5 — SEGURANÇA DE APIS, BACKEND & FRONTEND

- **Backend (NestJS Server-Side):** Validação estrita de DTOs com `class-validator`, sanitização de entrada contra SQL Injection / XSS e Guards de autorização por rota.
- **Frontend (React / TypeScript):** Content Security Policy (CSP) rigorosa, eliminação de armazenamento de dados sensíveis em `localStorage` e cabeçalhos HTTP seguros (`HSTS`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
- **APIs (Kong API Gateway WAF):** Rate limiting por Tenant/IP, validação de tokens JWT RS256 e proteção contra Broken Object Level Authorization (BOLA).

---

## ETAPA 6 — ESTRUTURA CRIPTOGRÁFICA & ARQUITETURA DE DOCUMENTOS

```
ENCRYPTION & DOCUMENT SECURITY ARCHITECTURE:
• Dados em Trânsito: TLS 1.3 obrigatório com HSTS Preload e mTLS no Istio Service Mesh.
• Dados em Repouso:  AES-256-GCM via AWS KMS com Customer Managed Keys (CMK) por Workspace.
• Cofre Digital S3:  Criptografia de Envelope por arquivo + S3 Object Lock (WORM Imutável).
• Assinatura Digital: Integração com Certificados ICP-Brasil (PAdES / CAdES) para validade jurídica.
```

---

## ETAPA 7 — AI SECURITY FRAMEWORK (PROTEÇÃO DE LLMS)

```
[ENTRADA DO PROMPT (Usuário)] ──> [NEMO GUARDRAILS / SANITIZER] ──> [PROMPT HIGIENIZADO]
                                  ├── Inspecção Prompt Injection
                                  ├── Sanitização PII (PiiSanitizer)
                                  └── Bloqueio System Leak
                                                                        │
                                                                        ▼
[RESPOSTA AO USUÁRIO] <── [OUTPUT VALIDATOR (Factualidade/XAI)] <── [LLM MODEL]
```

---

## ETAPA 8 — DEVSECOPS PIPELINE & VULNERABILITY MANAGEMENT

```
[DEV COMMIT] ──> [1. SAST (SonarQube)] ──> [2. SCA (Trivy)] ──> [3. SECRET SCANNING (Trufflehog)]
                       │                        │                        │
                       ▼                        ▼                        ▼
[DEPLOY STAGING] <── [Clean Code]      [Containers Approved]     [Zero Hardcoded Keys]
       │
       ▼
[4. DAST (OWASP ZAP)] ──> [5. IAC SCAN (Checkov)] ──> [GITOPS PRODUCTION DEPLOY]
```

### SLAs de Correção de Vulnerabilidades (CVEs):
- **P1 (Crítica):** Patch e deploy em produção em **< 24 horas**.
- **P2 (Alta):** Patch e deploy em produção em **< 7 dias**.
- **P3 (Média):** Correção em **< 30 dias**.
- **P4 (Baixa):** Correção em **< 90 dias**.

---

## ETAPA 9 — LOGS IMUTÁVEIS, SIEM & SOC OPERATIONS 24/7

- **Audit Trail Imutável:** Tabela `audit_events` com encadeamento de hashes (*Hash Chaining HMAC-SHA256*) para impedir alteração manual por administradores.
- **SIEM Platform:** **Wazuh / Elastic Security** centralizando logs do CloudTrail, EKS Audit, Keycloak e PostgreSQL.
- **SOC Operations:**
  - **L1 (Triagem):** Regras de detecção automatizadas e alertas PagerDuty.
  - **L2 (Análise Forense):** Investigação de causa raiz e contenção.
  - **L3 (Threat Hunting):** Caça ativa de ameaças e atualização de regras WAF.

---

## ETAPA 10 — DISASTER RECOVERY & CONTINUIDADE DE NEGÓCIOS (RTO/RPO)

| Cenário de Desastre | Estratégia de Mitigação | Target RTO | Target RPO |
|---|---|---|---|
| Queda de AZ AWS | RDS Multi-AZ Auto-Failover + EKS Multi-AZ | < 1 minuto | ~0 (Síncrono) |
| Corrupção de Banco | Restauração Point-in-Time (PITR) RDS + S3 Air-Gapped | < 15 minutos | < 5 minutos |
| Ataque Ransomware | S3 Object Lock (WORM Imutável) + Backups Criptografados | < 30 minutos | ~0 |
| Falha Total de Região | Disaster Recovery Standby em Região Secundária (AWS us-east-1)| < 2 horas | < 15 minutos |

---

## ETAPA 11 — BACKLOG TÉCNICO DE SEGURANÇA CIBERNÉTICA

---

### SEC-001 — Implantação da Arquitetura Zero Trust com Keycloak e OPA

**Problema:** A autorização é feita via verificações genéricas em código sem política dinâmica ou autenticação contínua.

**Impacto:** Risco crítico de vazamento entre tenants (BOLA) e comprometimento por roubo de senhas.

**Solução:** Implantar Keycloak OIDC com Passkeys FIDO2, Open Policy Agent (OPA) para ABAC e isolamento RLS.

**Prioridade:** CRÍTICA | **Complexidade:** Alta | **Estimativa:** 6 semanas

---

### SEC-002 — Gestão de Segredos com HashiCorp Vault e Rotação Efêmera

**Problema:** Credenciais de produção expostas em variáveis de ambiente estáticas nos servidores.

**Impacto:** Risco de vazamento de credenciais mestre do banco de dados e APIs de terceiros.

**Solução:** Implantar HashiCorp Vault com rotação dinâmica de segredos (TTL 1h) e injeção automática no Kubernetes.

**Prioridade:** CRÍTICA | **Complexidade:** Média-Alta | **Estimativa:** 4 semanas

---

### SEC-003 — DevSecOps Pipeline e Automação SAST/DAST/SCA

**Problema:** Ausência de verificações automáticas de segurança no ciclo de integração contínua (CI/CD).

**Impacto:** Introdução involuntária de código vulnerável e dependências desatualizadas em produção.

**Solução:** Integrar SonarQube (SAST), Trivy (SCA) e OWASP ZAP (DAST) no GitHub Actions com bloqueio de compilação.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

### SEC-004 — SIEM Wazuh Centralizado e Monitoramento SOC 24/7

**Problema:** Logs operacionais dispersos e ausência de detecção de comportamentos suspeitos em tempo real.

**Impacto:** Impossibilidade de conter ataques cibernéticos em andamento antes do exfiltração de dados.

**Solução:** Implementar SIEM Wazuh centralizando CloudTrail, EKS e PostgreSQL logs com alertas PagerDuty para o SOC.

**Prioridade:** ALTA | **Complexidade:** Alta | **Estimativa:** 5 semanas

---

### SEC-005 — AI Guardrails e Proteção contra Prompt Injections

**Problema:** Agentes de IA sem proteção contra injeções de prompt ou vazamento inadvertido de dados sensíveis (PII).

**Impacto:** Manipulação dos modelos generativos e risco de quebra de sigilo de processos.

**Solução:** Implementar NeMo Guardrails e PiiSanitizer na camada do AI Gateway para inspeção contínua de entradas e saídas.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 3 semanas

---

## ETAPA 12 — ARQUITETURA FINAL DE SEGURANÇA ENTERPRISE

```
LEGIS CONNECT — INTEGRATED ENTERPRISE CYBERSECURITY ARCHITECTURE
Versão 1.0 — Julho 2026

[SOLICITANTE DE ACESSO]
Usuários · Dispositivos EDR · APIs Externas · Processos Automatizados
          ↓
[ZERO TRUST & IDENTITY GATEWAY]
Keycloak OIDC (Passkeys / FIDO2) · Open Policy Agent (ABAC) · Kong WAF
          ↓
[CAMADA DE APLICAÇÃO & IA PROTEGIDA]
Istio mTLS Service Mesh · NeMo AI Guardrails · PiiSanitizer Pipeline
          ↓
[GESTÃO DE SEGREDOS & INFRAESTRUTURA HARDENED]
HashiCorp Vault Dynamic Credentials · KMS CMK AES-256 · S3 Object Lock (WORM)
          ↓
[DADOS & BANCO DE DADOS PROTEGIDO]
PostgreSQL RDS (RLS Enabled) · Audit Trail (HMAC Signed) · Hash Chaining
          ↓
[DEVSECOPS, SOC & COMPLIANCE]
GitOps SAST/DAST/SCA · SIEM Wazuh Centralizado · SOC L1/L2/L3 PagerDuty 24/7
ISO/IEC 27001 · SOC 2 Type II · NIST CSF 2.0 · Compliance LGPD Art. 46
```

---

*Enterprise Cybersecurity Architecture & Zero Trust Security Blueprint v1.0*
*Chief Information Security Officer · Enterprise Security Architect · Legis Connect · 2026*
