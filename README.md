<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LEGIS CONNECT — Plataforma Jurídica Online

Plataforma SaaS para conectar clientes a advogados, gerenciar processos, gerar minutas jurídicas com IA e operar com conformidade total à LGPD, OAB e CF/88.

---

## 🚀 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript 5.8 + Vite 6 |
| Estilo | Vanilla CSS + Design Tokens |
| Backend / Auth | Supabase (PostgreSQL + Auth + RLS) |
| IA | Google Gemini API (via Serverless Proxy) |
| Deploy | Vercel (Edge Network + Serverless Functions) |
| CI/CD | GitHub Actions + DevSecOps gates |

---

## ⚙️ Configuração Local

**Pré-requisitos:** Node.js 20+

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
# Supabase (chaves públicas — seguras para o frontend)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Gemini API (apenas no servidor via Vercel Serverless Function)
GEMINI_API_KEY=sua-api-key-aqui
```

> ⚠️ **Nunca** coloque `GEMINI_API_KEY` ou qualquer secret com prefixo `VITE_`.

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

---

## 🗄️ Banco de Dados (Supabase)

### Aplicar o schema inicial
No [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql), execute:

```sql
-- 1. Schema completo (tabelas, índices, triggers)
\i infrastructure/db/migrations/001_initial_schema.sql

-- 2. Row-Level Security (isolamento de dados por usuário)
\i infrastructure/db/scripts/apply_production_rls.sql

-- 3. (Opcional) Dados de demonstração para testes
\i infrastructure/db/seeds/seed_demo_data.sql
```

---

## 🔐 Segurança

- **Zero Secrets no Código**: Nenhuma credencial no repositório.
- **RLS Ativo**: Row-Level Security no PostgreSQL garante isolamento total por usuário.
- **Proxy Serverless**: `GEMINI_API_KEY` nunca exposta no bundle frontend.
- **PBKDF2 + SHA-256**: Hash de senhas de staff com 210.000 iterações (OWASP 2024).
- **MFA**: Autenticação multifator TOTP disponível para staff administrativo.
- **Scan Automático**: CI/CD bloqueia builds com secrets detectados.

```bash
npm run secret-scan    # Scanner de credenciais local
npx tsc --noEmit       # Verificação de tipagem
npm run build          # Build de produção
```

---

## 🧪 Testes

```bash
# Type check
npx tsc --noEmit

# Secret scan
npm run secret-scan

# E2E (Playwright)
npx playwright test tests/e2e/

# Performance (k6)
k6 run tests/performance/api-load-test.k6.js
```

---

## 📦 Deploy (Vercel)

Cada push na branch `main` dispara o deploy automático via Vercel.

**Variáveis necessárias no Vercel Dashboard:**
- `GEMINI_API_KEY` — Chave da API Gemini (server-side only)
- `VITE_SUPABASE_URL` — URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` — Chave anon pública do Supabase

---

## 📋 Documentação

| Documento | Descrição |
|-----------|-----------|
| [PRD Master](docs/PRD_MASTER.md) | Requisitos funcionais completos |
| [Arquitetura UML](docs/UML_ARCHITECTURE_BLUEPRINT.md) | Diagramas de sistema |
| [RBAC & Governança](docs/RBAC_ACCESS_GOVERNANCE.md) | Controle de acesso por papel |
| [Segurança](docs/CYBER_SECURITY_HARDENING.md) | Políticas de segurança |
| [LGPD Compliance](docs/COMPLIANCE_AUDIT_360.md) | Conformidade de privacidade |
| [Guia de Deploy](docs/PRODUCTION_DEPLOYMENT_GUIDE.md) | Implantação em produção |

---

## 👥 Perfis de Usuário

| Perfil | Descrição |
|--------|-----------|
| **Cliente** | Contrata serviços, acompanha processos, usa IA copiloto |
| **Advogado** | CRM jurídico, agenda, minutas com IA, relatórios |
| **Estagiário** | Acompanhamento de casos, horas, conformidade Lei 11.788 |
| **Secretária** | Gestão de agenda, documentos e comunicações |
| **Admin** | Gestão da plataforma, RBAC, relatórios |
| **Super Admin** | Acesso universal, auditoria, impersonation |

---

*© 2026 Legis Connect. Todos os direitos reservados.*
