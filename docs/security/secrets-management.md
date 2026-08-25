# AURA / LEGIS CONNECT — SECRETS MANAGEMENT & ZERO HARDCODED CREDENTIALS
## Política Oficial de Gerenciamento de Segredos, Defesa em Profundidade e CI/CD Security Gates

**Versão Normativa Oficial:** 3.0.0 — Enterprise DevSecOps Edition  
**Data de Homologação:** 25 de Agosto de 2026  
**Classificação:** Política de Segurança da Informação e Gestão de Segredos  
**Instituição:** Instituto Ser Melhor / Plataforma Integrada de Gestão do Cuidado Social & Jurídico  
**Regra Mestra Inegociável:** *NENHUMA SENHA, CHAVE DE API, TOKEN, SEGREDO CRIPTOGRÁFICO, CREDENCIAL DE BANCO OU CHAVE PRIVADA PODE EXISTIR NO CÓDIGO-FONTE, NO BUNDLE DO FRONTEND OU NO REPOSITÓRIO GIT.*

---

## 1. OBJETIVO E ESCOPO

Esta norma estabelece as diretrizes obrigatórias de segurança para o gerenciamento de credenciais, chaves criptográficas, tokens de acesso e variáveis de ambiente na plataforma **AURA / Legis Connect**.

Aplica-se integralmente a:
- Todos os repositórios de código-fonte (Frontend, Backend, Microservices e Scripts);
- Pipelines de Integração e Entrega Contínua (CI/CD Quality Gates);
- Ambientes de Desenvolvimento, Homologação (Staging) e Produção;
- Todas as integrações com provedores externos de IA, mensageria, banco de dados e observabilidade.

---

## 2. ARQUITETURA DE SEGREGAÇÃO DE SEGREDOS

```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           CÓDIGO-FONTE                                 │
  │  Contém exclusivamente: lógica, referências de variáveis, schemas,    │
  │  contratos de API e código funcional.                                 │
  │  NENHUM VALOR LITERAL DE SEGREDO EXISTE AQUI.                          │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                    SISTEMA DE CONFIGURAÇÃO & AMBIENTE                  │
  │  Consome referências externas:                                         │
  │  process.env.DATABASE_URL, process.env.GEMINI_API_KEY                  │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 SECRET STORE / CLOUD SECRET MANAGER                    │
  │  Vercel Environment Variables, Supabase Secrets, Vault, GitHub Secrets │
  │  Valores reais injetados apenas em tempo de execução autorizado.       │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 3. FRONTEND COMO BOUNDARY DE SEGURANÇA (REGRA VITE)

> **"Qualquer variável de ambiente disponibilizada ao frontend NÃO É SEGREDO."**

Em aplicações baseadas em Vite / React, variáveis com o prefixo `VITE_` são incorporadas ao código JavaScript estático enviado ao navegador.

### Regras Mandatórias:
1. **É TERMINANTEMENTE PROIBIDO** utilizar o prefixo `VITE_` em:
   - `GEMINI_API_KEY`, `OPENAI_API_KEY`, `DATABASE_URL`, `DATABASE_PASSWORD`;
   - `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `SESSION_SECRET`;
   - `STRIPE_SECRET_KEY`, `PAGARME_SECRET_KEY`, `WHATSAPP_TOKEN`, `PRIVATE_KEY`.
2. **Operações Confidenciais**: Toda interação com serviços que exigem segredos privados é obrigatoriamente intermediada pelo Backend (`/api/gemini`, NestJS microservices ou Serverless Functions).

```text
Frontend (Navegador) ──> [API Proxy com Auth] ──> Backend ──> [Secret Store] ──> Gemini AI / DB
```

---

## 4. MATRIZ OFICIAL DE VARIÁVEIS DE AMBIENTE

| Variável | Escopo / Local | Natureza do Dado | Sensibilidade | Exposição Frontend Permitida? | Finalidade |
|---|---|---|:---:|:---:|---|
| `VITE_SUPABASE_URL` | Frontend & Server | URL de API Pública | Pública | **SIM** | Endpoint do Supabase para comunicação cliente. |
| `VITE_SUPABASE_ANON_KEY`| Frontend & Server | Chave Anônima Pública | Pública | **SIM** | Chave pública protegida por RLS no PostgreSQL. |
| `DATABASE_URL` | Server-Only | Connection String DB | **CRÍTICA** | **NÃO** | Conexão PostgreSQL para Prisma ORM e Migrations. |
| `GEMINI_API_KEY` | Server-Only | API Key Provedor IA | **CRÍTICA** | **NÃO** | Chave de processamento dos modelos generativos. |
| `VITE_SENTRY_DSN` | Frontend | DSN de Monitoramento | Pública | **SIM** | Rastreamento de exceções no cliente. |
| `SENTRY_AUTH_TOKEN` | CI/CD Server | Auth Token Build | **ALTA** | **NÃO** | Upload de Source Maps durante pipeline de release. |
| `VITE_IS_BETA` | Frontend | Feature Flag | Pública | **SIM** | Ativação visual de componentes de homologação. |
| `VITE_APP_VERSION` | Frontend | Metadado de Versão | Pública | **SIM** | Exibição de versão e sincronia de cache. |

---

## 5. MATRIZ DE INTEGRAÇÕES EXTERNAS

| Integração | Tipo de Credencial | Local de Armazenamento | Exposição Frontend | Mecanismo de Proteção |
|---|---|---|:---:|---|
| **Google Gemini AI** | API Key Privada | Backend / Cloud Secrets | **PROIBIDA** | Intermediação via API Proxy (`/api/gemini`). |
| **Supabase PostgreSQL**| `DATABASE_URL` | Cloud Secret Store | **PROIBIDA** | Execução restrita a migrações e backend. |
| **Supabase Client** | `VITE_SUPABASE_ANON_KEY` | Bundle Frontend | **PERMITIDA** | Acesso limitado por Row-Level Security (RLS). |
| **Sentry Error Tracking**| Auth Token | GitHub Actions Secrets | **PROIBIDA** | Injetado exclusivamente na etapa de build. |
| **WhatsApp Business API**| WABA Access Token | Backend / KMS | **PROIBIDA** | Processamento via Webhook seguro. |

---

## 6. SANITIZAÇÃO DE LOGS & REDACTION

É expressamente proibido registrar credenciais, tokens de autorização ou PII sem mascaramento em logs (`console.log`, Sentry, Datadog ou arquivos de sistema).

- **Cabeçalhos de Autorização**: Interceptados e mascarados como `Authorization: [REDACTED]`.
- **CPFs e Documentos Pessoais**: Mascarados via `TenantService.maskCpf(cpf)` gerando `***.***.***-**`.
- **Hashes Criptográficos**: Senhas armazenadas exclusivamente com PBKDF2 / SHA-256 (`$pbkdf2$...`).

---

## 7. PIPELINE CI/CD — SECURITY QUALITY GATE

O pipeline de DevSecOps (`.github/workflows/devsecops-ci.yml`) impõe a validação mandatória de segredos antes de autorizar qualquer build ou deploy:

```text
  Checkout Code
       │
       ▼
  Setup Node.js 20 LTS
       │
       ▼
  Install Dependencies (npm ci)
       │
       ▼
  Lint & Typecheck (ESLint + tsc --noEmit)
       │
       ▼
  Automated Secret Scanning Gate (npm run secret-scan) ──> [SEGREDO DETECTADO?] ──> BUILD BLOQUEADO!
       │
       ▼ (Nenhum segredo)
  Unit & Integration Test Suite (npm test)
       │
       ▼
  Production Build (npm run build)
       │
       ▼
  Deploy Autorizado
```

---

## 8. POLÍTICA DE ROTAÇÃO E RESPOSTA A INCIDENTES

Caso qualquer credencial seja acidentalmente exposta ou suspeita de comprometimento:

```text
1. IDENTIFICAR     ──> Localizar o arquivo, commit e tipo de credencial exposta.
2. CLASSIFICAR     ──> Avaliar o impacto (Crítico, Alto, Médio).
3. REVOGAR IMEDIATO──> Invalidar a credencial no painel do provedor externo.
4. ROTACIONAR      ──> Gerar nova credencial com entropia adequada.
5. ATUALIZAR SECRET──> Atualizar o Secret Store (Vercel / Cloud Secret Manager).
6. AUDITAR & EXPURGO──> Eliminar do histórico Git se necessário e emitir relatório de incidente.
```

---

## 9. CLASSIFICAÇÃO FINAL DE CONFORMIDADE

A plataforma AURA / Legis Connect é certificada como **🔵 HARDENED**:
- **0** senhas ou chaves hardcoded no código-fonte.
- **100%** de conformidade no scanner automatizado (`npm run secret-scan`).
- **100%** das variáveis de ambiente segregadas entre públicas e server-only.
- **Security Quality Gate** ativo bloqueando builds em caso de regressão.
