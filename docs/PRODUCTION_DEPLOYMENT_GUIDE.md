# LEGIS CONNECT — PRODUCTION DEPLOYMENT & OPERATIONAL RUNBOOK

**Guia Oficial de Implantação, Configuração de Produção e Operação 24/7**  
**Versão**: 1.0.0 — Production Edition  
**Data**: Agosto de 2026  
**Status**: Aprovado / Operacional  

---

## 1. VISÃO GERAL DA INFRAESTRUTURA DE PRODUÇÃO

A arquitetura de implantação em produção da Legis Connect combina:
- **Frontend SPA**: Hospedado no Vercel Edge Network com suporte a SSL automático, rewrites e Content Security Policy (CSP).
- **Serverless API Layer**: Endpoints `/api/health` e proxies executados no Vercel Serverless (Node.js 20.x).
- **Banco de Dados Relacional**: PostgreSQL + Prisma ORM + Row-Level Security (RLS) hospedado no Supabase / AWS RDS.
- **Inteligência Artificial**: Google Gemini API via gateway com throttling e log de custos.

---

## 2. CHECKLIST PRÉ-IMPLANTAÇÃO (QUALITY GATES)

- [x] **Tipagem TypeScript**: Executar `npx tsc --noEmit` sem erros.
- [x] **Variáveis de Ambiente**: Confirmar presença de `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_GEMINI_API_KEY`.
- [x] **Políticas de RLS Aplicadas**: Executar o script [`infrastructure/db/scripts/apply_production_rls.sql`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/infrastructure/db/scripts/apply_production_rls.sql) no banco de dados de produção.
- [x] **Limpeza de Credenciais de Teste**: Garantir que logins de demonstração locais requerem credenciais válidas.

---

## 3. PASSO A PASSO DA IMPLANTAÇÃO DA INFRAESTRUTURA

### Passo 1: Execução das Migrações e RLS do Banco de Dados
```bash
# Executar a migração de esquema do Prisma no PostgreSQL de produção:
npx prisma migrate deploy

# Aplicar o script oficial de Row-Level Security (RLS):
psql $DATABASE_URL -f infrastructure/db/scripts/apply_production_rls.sql
```

### Passo 2: Configuração de Domínio & SSL
- Apontar os registros DNS do domínio `legisconnect.com.br` para a infraestrutura Vercel:
  - **A Record**: `76.76.21.21`
  - **CNAME Record**: `cname.vercel-dns.com`

### Passo 3: Execução da Pipeline de CI/CD
- Todo commit na branch `main` ou `production` dispara automaticamente o workflow do GitHub Actions em `.github/workflows/production-deployment.yml`.

---

## 4. MONITORAMENTO E HEALTH CHECKS 24/7

- **Endpoint de Uptime**: `https://legisconnect.com.br/api/health`
- **Integradores Recomendados**: UptimeRobot, BetterStack ou Datadog.
- **SLA Alvo**:
  - Availability: **99.9% Uptime**
  - API Response Time: **< 200ms**
  - LCP (Largest Contentful Paint): **< 1.5s**

---

## 5. PROCEDIMENTO DE ROLLBACK DE EMERGÊNCIA

Caso seja detectada qualquer anomalia crítica após um deploy em produção:
1. Acesse o painel Vercel (`https://vercel.com/legis-connect`).
2. Navegue para a aba **Deployments**.
3. Selecione o deploy anterior com status "Passed" e clique em **Instant Rollback**.
4. A reversão será concluída em menos de 10 segundos.

---
**FIM DO GUIA DE IMPLANTAÇÃO EM PRODUÇÃO LEGIS CONNECT**
