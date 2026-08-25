# LEGIS CONNECT — ARQUITETURA NORMATIVA DE ERROR REPORTING & INCIDENT MANAGEMENT v3.0

> **Status:** ✅ HOMOLOGADO | **Data:** 25 de Agosto de 2026 | **Classificação:** ENTERPRISE / LGPD CONFORME  
> **Cadeia de Defesa:** `USUÁRIO → ERROR BOUNDARY → EVIDENCE COLLECTOR → SANITIZER (LGPD) → IDEMPOTENCY QUEUE → API → DEDUPLICATION → DATABASE (RLS) → AUDIT LOGGER`

---

## 1. Visão Geral & Regra Mestra

A plataforma **Legis Connect** implementa um sistema institucional de **Error Reporting & Incident Management** com a missão de transformar qualquer falha técnica em um sensor de qualidade rastreável, sem sobrecarregar o usuário com termos técnicos e sem comprometer a confidencialidade jurídica ou dados pessoais regulados pela LGPD.

### Regra Mestra Permanente
```
"O USUÁRIO INFORMA 'DEU ERRO' EM UMA INTERFACE SIMPLES.
 O SISTEMA COLETA AUTOMATICAMENTE AS EVIDÊNCIAS TÉCNICAS NECESSÁRIAS.
 TODA COLETA OBEDECE AOS PRINCÍPIOS DE NECESSIDADE, MINIMIZAÇÃO,
 REDAÇÃO DE SEGREDOS, ISOLAMENTO MULTI-TENANT E RLS."
```

---

## 2. Diagrama de Fluxo Ponta a Ponta

```
┌─────────────────┐
│     Usuário     │  Clica em "Reportar erro" OU Boundary captura falha de tela
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Evidence        │  Coleta: Timestamp, Rota, Módulo, UserAgent, Viewport,
│ Collector       │  Versão da App, Breadcrumbs (navegação/ações)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ LGPD Sanitizer  │  Redação automática: Passwords, JWTs, Tokens, Chaves,
│ Engine          │  CPFs, CNPJs, Cartões, SQL, Connection Strings
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Consentimento   │  Usuário revisa e autoriza envio. Screenshot opcional
│ Transparente    │  com mascaramento visual de campos sensíveis
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Fila Resiliente │  Idempotency Key + Rate Limit (5/min) + Retry (3x) +
│ (Fail-Safe)     │  Fingerprint Hash (deduplicação por causa raiz)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Ingestão API    │  POST /api/error-reports — Tenant derivado do contexto
│ & Security SOC  │  Detecção automática de incidentes (Cross-Tenant / RLS)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Armazenamento   │  PostgreSQL RLS (Isolamento por Tenant) +
│ & Auditoria     │  StaffAuditLog Imutável com Hash Encadeado (SHA-256)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Painel Admin    │  Triagem: Status (NEW → INVESTIGATING → RESOLVED),
│ & Engenharia    │  Atribuição, Timeline de Eventos, Causa Raiz
└─────────────────┘
```

---

## 3. Inventário de Error Boundaries & Handlers

| Camada | Componente / Local | Escopo de Captura | Comportamento |
|---|---|---|---|
| **Top-Level Root** | `components/common/ErrorBoundary.tsx` | Falha fatal na inicialização da aplicação | UI Fallback com reinicialização controlada |
| **Sectional Boundary** | `App.tsx` envolto em `<main>` | Falha isolada de renderização por view/módulo | `ErrorBoundaryFallback` sem derrubar a aplicação |
| **Global Script Error** | `window.onerror` em `lib/monitoring.ts` | Erros de script síncronos e assíncronos não capturados | Envio automático com fingerprint |
| **Promise Rejections** | `window.onunhandledrejection` | Falhas em chamadas assíncronas / fetch / workers | Envio automático com fingerprint |
| **Service Layer** | `ErrorReportingService` | Exceções de rede, serialização ou storage | FAIL-SAFE (try/catch não propaga falha para UI) |

---

## 4. Política de Sanitização & Minimização (LGPD)

O sanitizador [`security/errorReportSanitizer.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/security/errorReportSanitizer.ts) aplica redação em tempo real antes de qualquer persistência ou transmissão:

### Regras de Redação Ativa:

| Vetor de Dado | Padrão Detectado | Ação de Sanitização |
|---|---|---|
| **Senhas e Credenciais** | `password`, `passwd`, `pwd`, `db_pass` | Redigido para `[REDACTED]` |
| **Tokens de Acesso** | `Bearer <token>`, `Basic <token>`, JWTs | Substituído por `Bearer ********` ou `[REDACTED_JWT]` |
| **Chaves de API** | `AIza...`, `sk-...`, `ghp_...`, `apiKey` | Substituído por `[REDACTED_API_KEY]` |
| **Connection Strings** | `postgresql://user:pass@host/db` | Substituído por `postgresql://****:****@host/db` |
| **CPF do Cidadão** | `\d{3}\.\d{3}\.\d{3}-\d{2}` | Mascarado para `XXX.***.***-XX` |
| **CNPJ de Pessoa Jurídica** | `\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}` | Mascarado para `XX.***.***/XXXX-**` |
| **Cartões de Crédito** | `\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}` | Substituído por `****-****-****-****` |
| **URLs com Segredos** | `?token=...&key=...` | Query params sensíveis substituídos por `[REDACTED]` |
| **Conteúdo Jurídico Restrito** | Elementos com `[data-legal-content]` | Conteúdo omitido da captura visual e do payload |

---

## 5. Rastreabilidade: Report ID, Request ID & Fingerprint

### 1. Report ID Rastreável
- Formato regulamentar: `ERR-{ANO}-{RANDOM_6_HEX}` (Ex.: `ERR-2026-A3F9B2`).
- Exibido ao usuário após o envio para protocolo de suporte.

### 2. Request ID & Correlation ID
- UUID v4 gerado no início da interação.
- Propaga-se pelos logs de backend e auditoria para correlação direta entre frontend, API e banco.

### 3. Error Fingerprint (Deduplicação Inteligente)
- Hash FNV-1a calculado sobre: `error.name + error.message + componentName + url`.
- Ocorrências idênticas dentro do mesmo tenant não criam tickets separados; incrementam o contador `occurrences` e anexam novo evento à timeline.

---

## 6. Matriz de Autorização RBAC & Multi-Tenancy

| Role | Criar Relatório | Listar Próprio Tenant | Listar Todos (Global) | Triar / Alterar Status | Excluir Relatório |
|---|:---:|:---:|:---:|:---:|:---:|
| **`client`** | ✅ ALLOW | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY |
| **`intern`** | ✅ ALLOW | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY |
| **`secretary`** | ✅ ALLOW | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY |
| **`lawyer`** | ✅ ALLOW | ⚖️ CONDITIONAL (próprio) | ❌ DENY | ❌ DENY | ❌ DENY |
| **`gestor`** | ✅ ALLOW | ⚖️ CONDITIONAL (escritório) | ❌ DENY | ❌ DENY | ❌ DENY |
| **`staff_support_l1`** | ✅ ALLOW | ✅ ALLOW | ❌ DENY | ✅ ALLOW | ❌ DENY |
| **`staff_compliance_auditor`** | ✅ ALLOW | ✅ ALLOW | ❌ DENY | ✅ ALLOW | ❌ DENY |
| **`admin`** | ✅ ALLOW | ✅ ALLOW | ❌ DENY | ✅ ALLOW | ❌ DENY |
| **`super_admin`** | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW (Auditoria) | ✅ ALLOW | ✅ ALLOW (Auditado) |

---

## 7. Políticas de Retenção & LGPD

1. **Capturas de Tela (Screenshots)**: Retenção máxima de **90 dias**; após este período, referências de imagem são automaticamente expurgadas.
2. **Metadados Técnicos e Stack Traces**: Retenção de **365 dias** para análise de confiabilidade de software e SLA.
3. **Anonimização Pós-Resolução**: Ao atingir status `RESOLVED`, dados de navegação são arquivados para métricas agregadas sem vinculação direta a contas de clientes.

---

## 8. Incidentes de Segurança (Security Incidents)

Tentativas de **violação de isolamento cross-tenant**, ataques **IDOR**, falhas de **RLS** ou tentativas de **elevação de privilégio** são classificadas automaticamente:

- **Severidade**: `CRITICAL`
- **Flag**: `isSecurityIncident = true`
- **Auditoria**: Ação `SECURITY_INCIDENT_FLAGGED` enviada com alta prioridade para o canal de conformidade da Legis Connect.
