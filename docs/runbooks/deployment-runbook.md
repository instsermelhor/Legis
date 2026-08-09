# Runbook — Deployment de Produção & Staging (Vercel + Supabase)

Este runbook documenta os procedimentos operacionais padrão para implantação, atualização e manutenção do ambiente de produção e staging da plataforma Legis Connect.

---

## 📋 Pré-requisitos & Acessos

Para realizar o deploy e operar o ambiente de produção, são necessárias as seguintes credenciais:

1. **Conta Vercel Enterprise / Pro**: Acesso à org `team_axeHbzSg8P7Vo9qgIdSWgDbw`
2. **Supabase Production Dashboard**: Acesso ao projeto `tddzffccnuccewfoczjl`
3. **GitHub Repository Admin**: Acesso a secrets do repositório `Legis`

---

## 🔐 Configuração de Environment Secrets

### 1. GitHub Secrets (`Settings → Secrets and variables → Actions`)

| Secret Name | Descrição | Onde Obter |
|---|---|---|
| `VERCEL_TOKEN` | Token de autenticação da CLI Vercel | Vercel Account → Tokens |
| `VERCEL_ORG_ID` | ID da organização Vercel | `.vercel/project.json` (`orgId`) |
| `VERCEL_PROJECT_ID` | ID do projeto Vercel | `.vercel/project.json` (`projectId`) |
| `VITE_SUPABASE_URL` | URL de produção Supabase | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Chave pública anônima Supabase | Supabase Dashboard → Settings → API |
| `VITE_SENTRY_DSN` | DSN do projeto Sentry (erros) | Sentry → Client Keys (DSN) |
| `SENTRY_AUTH_TOKEN` | Token CLI do Sentry (releases) | Sentry → Organization Tokens |

### 2. Vercel Environment Variables (Dashboard Vercel)

| Variável | Escopo | Descrição |
|---|---|---|
| `GEMINI_API_KEY` | **Serverless Only** (sem `VITE_`) | Chave privada do Google Gemini AI API |
| `VITE_SUPABASE_URL` | Production & Preview | URL do Supabase |
| `VITE_SUPABASE_ANON_KEY` | Production & Preview | Chave anônima pública |
| `VITE_IS_BETA` | Production & Preview | `true` (ativa modo beta fechado) |
| `VITE_APP_VERSION` | Production & Preview | Ex: `1.0.0-beta` |

---

## 🚀 Fluxo de Deploy

### Deploy Automático em Staging (Preview per Pull Request)

1. Crie uma branch a partir de `staging` ou `main`: `git checkout -b feature/nova-funcionalidade`
2. Abra um Pull Request direcionado a `main` ou `staging`
3. O workflow [`.github/workflows/staging.yml`](file:///.github/workflows/staging.yml) será disparado automaticamente:
   - Executa lint (`npm run lint`)
   - Compila o projeto (`npm run build`)
   - Gera um preview isolado na Vercel
   - Comenta a URL do preview diretamente no PR
4. Valide as alterações na URL de preview gerada.

### Deploy Automático em Produção (`www.legisconnect.com.br`)

1. Realize o merge do PR na branch `main`
2. O workflow [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml) iniciará o pipeline:
   - **Job 1 (Build & Quality Gate)**: Linting + Build + Auditoria de dependências
   - **Job 2 (Deploy Production)**: Deploy direto via Vercel CLI com `--prod`
   - **Job 3 (Health Check)**: Requisição HTTP automática para `https://legisconnect.com.br/api/health`
3. Notificação do release enviada ao Sentry se `SENTRY_AUTH_TOKEN` estiver configurado.

---

## 🗄️ Execução de Migrações de Banco de Dados

Antes ou imediatamente após o primeiro deploy, execute os scripts SQL de migração no Supabase:

### Opção A: Via Script Automático (Recomendado)

```bash
bash infrastructure/db/run_migrations.sh
```

### Opção B: Via Supabase Dashboard SQL Editor

1. Acesse: [https://supabase.com/dashboard/project/tddzffccnuccewfoczjl/sql/new](https://supabase.com/dashboard/project/tddzffccnuccewfoczjl/sql/new)
2. Cole e execute em ordem:
   - [`infrastructure/db/migrations/sprint8_master_migration.sql`](file:///infrastructure/db/migrations/sprint8_master_migration.sql)
   - [`infrastructure/db/migrations/sprint11_beta_tables.sql`](file:///infrastructure/db/migrations/sprint11_beta_tables.sql)

---

## 🩺 Check-list de Validação Pós-Deploy

Após a conclusão do deploy, execute as seguintes verificações em produção:

- [ ] **Homepage**: Acessar `https://legisconnect.com.br` → deve retornar 200 OK.
- [ ] **Health Check API**: Acessar `https://legisconnect.com.br/api/health` → deve retornar JSON com `status: "ok"` e `supabase.status: "connected"`.
- [ ] **Security Headers**: Executar `curl -I https://legisconnect.com.br` e confirmar presença de:
  - `Strict-Transport-Security`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy`
- [ ] **SPA Routing**: Acessar rota direta `https://legisconnect.com.br/status` → deve carregar a página de status sem erro 404.
- [ ] **Login Admin**: Autenticar como `super_admin` e verificar o carregamento do `SuperAdminDashboard` e `DatabaseHealthIndicator`.
- [ ] **Beta Feedback**: Clicar no botão flutuante `💬 Feedback` e enviar um teste para confirmar salvamento na tabela `beta_feedback`.

---

## 🆘 Rollback de Emergência

Caso ocorra uma falha crítica em produção:

1. Acesse o **Vercel Dashboard** → `Project` → `Deployments`
2. Encontre o deployment anterior com status **Ready** (sucesso)
3. Clique nos 3 pontos `...` → **Promote to Production**
4. A reversão será concluída em < 10 segundos sem downtime.
