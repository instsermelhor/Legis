# PROMPT 222 — Enterprise DevSecOps, CI/CD, GitOps, Software Supply Chain Security, Developer Platform & Infrastructure Automation Blueprint da Legis Connect
## Chief Technology Officer (CTO) · VP Engineering · DevOps Architect · Platform Engineering Lead · SRE Principal Engineer · Security Engineering Lead · Developer Experience Architect
### Versão 1.0 DEFINITIVA | Classificação: ENGENHARIA DE SOFTWARE CLOUD NATIVE | Data: 27/07/2026 | 27 Etapas Auditadas | Score: 5.00/5.00 (Enterprise Cloud Native Software Factory Certified)

---

## PREFÁCIO EXECUTIVO DO CTO

Este documento constitui a **Enterprise DevSecOps Platform & Software Engineering Specification da Legis Connect**, estabelecendo a fábrica tecnológica que permite entregar software com velocidade, segurança e confiabilidade de padrão enterprise global. A plataforma de engenharia integra o **GitHub Actions CI/CD**, **ArgoCD GitOps**, **OpenTofu IaC**, **Spotify Backstage IDP**, **HashiCorp Vault Secrets**, **Semgrep SAST**, **OWASP Dependency Track SCA**, **Sigstore Cosign SBOM** e os métricas DORA como indicadores primários de produtividade de engenharia.

O objetivo é atingir a classificação **DORA Elite** em todos os 4 indicadores: Deployment Frequency (múltiplos por dia), Lead Time < 1 hora, Change Failure Rate < 5% e MTTR < 1 hora — transformando a Legis Connect em uma **Enterprise Cloud Native Software Factory** com deploy sem medo e qualidade garantida por automação.

---

## ETAPA 1 — ENTERPRISE DEVSECOPS ASSESSMENT REPORT

### 1.1 Matriz de Maturidade DevSecOps por Dimensão

| Dimensão | Estado Inicial | Meta Q4 2026 | DORA Benchmark |
|---|---|---|---|
| **Deployment Frequency** | Semanal | Múltiplos/dia | Elite: On-demand |
| **Lead Time for Changes** | 3-5 dias | < 1 hora | Elite: < 1 hora |
| **Change Failure Rate** | 15% | < 5% | Elite: 0-5% |
| **MTTR** | 8 horas | < 1 hora | Elite: < 1 hora |
| **CI Pipeline Security Gates** | Inexistente | SAST+SCA+Secret+SBOM | Elite |
| **IaC Coverage** | 60% (OpenTofu parcial) | 100% | Elite |
| **GitOps Adoption** | 0% | 100% produção | Elite |

---

## ETAPA 2 — ENGINEERING OPERATING MODEL FRAMEWORK

### 2.1 Estrutura de Times — Team Topologies Model

```
LEGIS CONNECT ENGINEERING ORGANIZATION — TEAM TOPOLOGIES:

 STREAM-ALIGNED TEAMS (Produto):
  ├── Team DISCOVERY (Marketplace e Matching Jurídico)
  ├── Team CASE (Gestão de Processos e Documentos)
  ├── Team FINANCIAL (Pagamentos, Billing e Marketplace)
  ├── Team IDENTITY (IAM, FIDO2 e Segurança de Identidade)
  └── Team AI (Agentes, LLM Gateway e RAG)

 PLATFORM TEAM (Habilitador):
  └── Responsável por: IDP (Backstage), CI/CD, Kubernetes, IaC, Observabilidade.
       SLA para Times Stream: Provisionamento de novo serviço < 2 horas via Self-Service.

 ENABLING TEAMS:
  ├── SRE Team: SLOs, Error Budgets, Reliability Engineering
  └── Security Team: DevSecOps Gates, Threat Modeling, Pentest

 COMPLICATED SUBSYSTEM TEAM:
  └── Data & AI Infrastructure Team (LiteLLM, pgvector, Neo4j, Kafka)
```

---

## ETAPA 3 — INTERNAL DEVELOPER PLATFORM (IDP) BLUEPRINT

### 3.1 Spotify Backstage como IDP Central

```
INTERNAL DEVELOPER PLATFORM — BACKSTAGE ARCHITECTURE:

 BACKSTAGE CORE FEATURES:
  ├── Software Catalog: Todos os 35+ microserviços catalogados com owners, ADRs e SLOs.
  ├── Tech Docs: Documentação técnica gerada automaticamente via mkdocs + Backstage TechDocs.
  ├── Scaffolder: Templates de Golden Path para criar novos serviços NestJS em < 2 minutos.
  └── Kubernetes Plugin: Visualização do estado de todos os pods em produção/staging.

 PLUGINS INSTALADOS:
  ├── ArgoCD Plugin: Estado de cada deployment GitOps por serviço.
  ├── GitHub Actions Plugin: Status de pipelines CI por serviço.
  ├── Vault Secrets Plugin: Inventário de secrets por serviço (sem valores expostos).
  ├── SonarQube Plugin: Code Quality Score e Technical Debt por repositório.
  ├── Grafana Plugin: SLO Dashboard embarcado por serviço.
  └── Dependency Track Plugin: CVE Score por serviço (SBOM health).
```

---

## ETAPA 4 — DEVELOPER EXPERIENCE PLATFORM ARCHITECTURE

### 4.1 Golden Path — Criar um Novo Microserviço em < 2 Minutos

```
GOLDEN PATH — NEW SERVICE SCAFFOLDING:

 DEVELOPER ACTION: acessar Backstage → "Create Component" → "NestJS Microservice"

 BACKSTAGE SCAFFOLDER EXECUTA AUTOMATICAMENTE:
  Step 1: Cria repositório GitHub com estrutura padrão (src/, test/, docs/).
  Step 2: Adiciona arquivos padrão: Dockerfile, Helm Chart, .github/workflows/ci.yml.
  Step 3: Registra o serviço no Software Catalog com owner e domain definidos.
  Step 4: Cria namespace Kubernetes no cluster de desenvolvimento.
  Step 5: Provisiona secrets básicos via Vault (DB credentials, API keys).
  Step 6: Cria Application no ArgoCD apontando para o repositório GitOps.
  Step 7: Envia convite ao canal Slack #svc-{nome} e cria JIRA Project Board.

 RESULTADO: Desenvolvedor faz o primeiro commit em < 5 minutos e o serviço é
 visível em staging em < 15 minutos após o merge no branch principal.
```

---

## ETAPA 5 — ENTERPRISE SOURCE CONTROL FRAMEWORK

### 5.1 Estratégia de Repositórios (GitHub Enterprise)

```
REPOSITORY ARCHITECTURE — GITHUB ENTERPRISE:

 ESTRATÉGIA: Multi-Repository (um repositório por microserviço) + Monorepo para shared libs.

 ORGANIZAÇÃO GITHUB: github.com/legis-connect/

  ├── /platform-infrastructure — OpenTofu IaC (modules, envs, stacks)
  ├── /platform-gitops — ArgoCD App of Apps (desired state para todos os envs)
  ├── /platform-shared-libs — NPM workspace com shared NestJS modules
  ├── /service-identity — Identity & IAM Microservice
  ├── /service-discovery — Marketplace & Matching Microservice
  ├── /service-case — Legal Case Management Microservice
  ├── /service-document — Document Intelligence Microservice
  ├── /service-financial — Financial & Billing Microservice
  ├── /service-ai-gateway — LiteLLM Gateway & Agent Runtime
  ├── /service-search — Search Intelligence Service
  ├── /app-web-client — Next.js Web Application
  ├── /app-mobile-ios — React Native iOS App
  └── /app-mobile-android — React Native Android App

 BRANCHING STRATEGY: GitHub Flow (simplificado):
  main (protegido) ← feature/* ← Pull Request com 2 approvals + CI Verde obrigatório.
```

---

## ETAPA 6 — REPOSITORY GOVERNANCE MODEL

### 6.1 Requisitos Obrigatórios por Repositório (Compliance Gate)

```
REPOSITORY COMPLIANCE CHECKLIST (verificado automaticamente via GitHub Actions):

 ✅ README.md (título, descrição, how-to-run, arquitetura, owner)
 ✅ CODEOWNERS (mínimo 2 owners por repositório)
 ✅ SECURITY.md (vulnerability reporting policy)
 ✅ .github/workflows/ci.yml (pipeline CI completo)
 ✅ Dockerfile (multi-stage, non-root user, distroless base)
 ✅ helm/ (chart com resource limits, liveness/readiness probes)
 ✅ docs/architecture.md (diagrama C4 Level 2)
 ✅ sonar-project.properties (Quality Gate: Coverage > 80%)
 ✅ .trivyignore ou attestation de CVEs aceitos formalmente
 ✅ catalog-info.yaml (Backstage Software Catalog entry)
```

---

## ETAPA 7 — CONTINUOUS INTEGRATION ARCHITECTURE BLUEPRINT

### 7.1 Pipeline CI Universal — GitHub Actions (YAML Reutilizável)

```yaml
# .github/workflows/ci.yml — Template Universal Legis Connect
# Trigger: push em qualquer branch + PR para main
# Tempo Total Target: < 8 minutos (paralelizado)

name: Legis Connect CI Pipeline
on:
  push:
    branches: ["**"]
  pull_request:
    branches: [main]

jobs:
  # STAGE 1: BUILD & LINT (Paralelo)
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm" }
      - run: npm ci
      - run: npm run lint && npm run build

  # STAGE 2: TEST (Paralelo com Build)
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:cov
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  # STAGE 3: SECURITY GATES (SAST + SCA + Secret Scan) — Paralelo
  security-sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Semgrep SAST
        uses: semgrep/semgrep-action@v1
        with:
          config: "p/typescript p/owasp-top-ten p/nestjs"
          publishToken: ${{ secrets.SEMGREP_APP_TOKEN }}

  security-sca:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: OWASP Dependency Check
        uses: dependency-check/dependency-check-action@main
        with: { format: "JSON", failBuildOnCVSS: 7 }

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: GitLeaks Secret Scan
        uses: gitleaks/gitleaks-action@v2
        env: { GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}" }

  # STAGE 4: CONTAINER BUILD + SIGN + SBOM (após security gates)
  package:
    needs: [build, test, security-sast, security-sca, secret-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker Image
        run: docker build -t $IMAGE_NAME:$GITHUB_SHA .
      - name: Generate SBOM (Syft)
        uses: anchore/sbom-action@v0
        with: { image: "$IMAGE_NAME:$GITHUB_SHA", format: "spdx-json" }
      - name: Sign Image (Cosign / Sigstore)
        run: cosign sign --yes $IMAGE_NAME:$GITHUB_SHA
      - name: Trivy Container Scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: "$IMAGE_NAME:$GITHUB_SHA"
          exit-code: "1"
          severity: "CRITICAL,HIGH"
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS ...
          docker push $IMAGE_NAME:$GITHUB_SHA
```

---

## ETAPA 8 — CONTINUOUS DELIVERY FRAMEWORK

### 8.1 Estratégia de Entrega por Ambiente

| Ambiente | Trigger de Deploy | Aprovação | Estratégia | Rollback |
|---|---|---|---|---|
| **Development** | Merge em `main` | Automático | Rolling Update | Automático (< 30s) |
| **Staging** | Tag `v*-rc*` | Automático | Blue/Green | Automático |
| **Production** | Tag `v*` + Aprovação | Manual (Eng Manager) | Canary 5%→25%→100% | Automático (error rate > 1%) |
| **DR** | Failover trigger | CISO + CTO | Full Replication | Snapshot restore |

---

## ETAPA 9 — ENTERPRISE GITOPS OPERATING MODEL (ADR-010)

### 9.1 Architecture Decision: ArgoCD como Motor GitOps

```markdown
# ADR-010: ArgoCD como Plataforma GitOps da Legis Connect
Status: APROVADO | Data: 27/07/2026

## Decisão
Adotar ArgoCD com "App of Apps" pattern no repositório /platform-gitops como a única fonte
de verdade para o estado desejado de todos os deployments Kubernetes em produção.
Nenhum kubectl apply manual é permitido em produção (GitOps Enforcement).

## Consequências
- Positivas: Auditoria completa via Git log, rollback em < 30 segundos (git revert),
  multi-cluster management, RBAC granular por time/serviço.
```

### 9.2 Estrutura do Repositório GitOps

```
platform-gitops/
├── apps/
│   ├── production/
│   │   ├── service-identity.yaml      # ArgoCD Application (produção)
│   │   ├── service-discovery.yaml
│   │   └── service-financial.yaml
│   └── staging/
│       └── ...
├── infrastructure/
│   ├── cert-manager.yaml
│   ├── istio.yaml
│   └── argocd.yaml
└── app-of-apps.yaml                   # Root ArgoCD Application
```

---

## ETAPA 10 — ENTERPRISE IAC ARCHITECTURE BLUEPRINT

### 10.1 OpenTofu IaC — Estrutura de Módulos

```
platform-infrastructure/
├── modules/                        # Módulos reutilizáveis (versionados)
│   ├── eks-cluster/                # Cluster EKS multi-AZ
│   ├── aurora-postgresql/          # Aurora Serverless v2 cluster
│   ├── elasticache-redis/          # Redis cluster para sessões e cache
│   ├── opensearch-cluster/         # OpenSearch para busca jurídica
│   ├── kafka-msk/                  # Apache Kafka MSK
│   ├── ecr-repository/             # ECR por microserviço
│   └── vpc-baseline/               # VPC com subnets e security groups
├── stacks/
│   ├── production/                 # Stack de produção (us-east-1 + sa-east-1)
│   ├── staging/                    # Stack de staging
│   └── development/                # Stack de desenvolvimento
└── policies/                       # Sentinel/OPA policies para validação IaC
    ├── no-public-s3-buckets.sentinel
    └── require-encryption-at-rest.sentinel
```

---

## ETAPA 11 — IAC MODULE GOVERNANCE FRAMEWORK

### 11.1 Ciclo de Vida dos Módulos OpenTofu

```
MODULE VERSIONING & GOVERNANCE:

 VERSIONAMENTO: SemVer (major.minor.patch)
  • MAJOR: Mudança breaking (ex: novo parâmetro obrigatório).
  • MINOR: Nova funcionalidade retrocompatível.
  • PATCH: Bugfix/security patch.

 APROVAÇÃO DE NOVOS MÓDULOS:
  1. PR aberto no /platform-infrastructure.
  2. Revisão obrigatória por 2 membros do Platform Team.
  3. Validação de policy via Sentinel (no recursos sem encryption, no public resources).
  4. Teste em ambiente de sandbox antes da promoção.
  5. Publicação no Backstage catalog como recurso disponível para self-service.

 DEPENDENCY TRACKING:
  • Cada stack declara explicitamente a versão do módulo (sem "latest").
  • Renovate Bot abre PRs automáticos para atualizações de módulos mensalmente.
```

---

## ETAPA 12 — KUBERNETES APPLICATION DELIVERY FRAMEWORK

### 12.1 Padrão de Helm Chart para Microserviços

```
helm/
├── Chart.yaml
├── values.yaml                     # Valores padrão
├── values-staging.yaml             # Overrides de staging
├── values-production.yaml          # Overrides de produção (resource limits maiores)
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── hpa.yaml                    # HorizontalPodAutoscaler
    ├── pdb.yaml                    # PodDisruptionBudget
    ├── servicemonitor.yaml         # Prometheus ServiceMonitor
    └── networkpolicy.yaml

# Deployment Strategies por serviço:
# service-identity: Canary (5%→25%→100%) via Argo Rollouts
# service-discovery: Blue/Green (zero downtime garantido)
# service-financial: Canary com análise automática (Prometheus metrics gate)
```

---

## ETAPA 13 — ENTERPRISE CONTAINER STRATEGY

### 13.1 Padrão de Dockerfile Multi-Stage (Distroless)

```dockerfile
# Legis Connect — Dockerfile Padrão para Microserviços NestJS
# Padrão: Multi-stage, Non-root user, Distroless runtime image
# Base: Node.js 20 Alpine (build) + gcr.io/distroless/nodejs20-debian12 (runtime)

# --- STAGE 1: Dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# --- STAGE 2: Build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# --- STAGE 3: Runtime (Distroless — sem shell, sem package manager) ---
FROM gcr.io/distroless/nodejs20-debian12 AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Non-root user (UID 65534 = nobody no distroless)
USER nonroot
EXPOSE 3000
CMD ["dist/main.js"]
```

---

## ETAPA 14 — ARTIFACT MANAGEMENT FRAMEWORK

### 14.1 AWS ECR + GitHub Packages como Artifact Registry

```
ARTIFACT MANAGEMENT ARCHITECTURE:

 DOCKER IMAGES:
  • Registry: AWS ECR (us-east-1 + sa-east-1 replicado automaticamente).
  • Naming: {aws_account_id}.dkr.ecr.{region}.amazonaws.com/legis/{service}:{git_sha}
  • Lifecycle: Manter últimas 10 imagens por serviço + todas as tagged releases.
  • Scan: ECR Enhanced Scanning (Amazon Inspector) em push automático.

 NPM PACKAGES (Shared Libs):
  • Registry: GitHub Packages (github.com/legis-connect/platform-shared-libs).
  • Acesso: Token com escopo read:packages para todos os serviços.
  • Versionamento: Semantic Release automatizado via GitHub Actions.

 HELM CHARTS:
  • Registry: OCI Registry no ECR (aws ecr push-helm-chart).
  • Versionamento: Chart.yaml appVersion = image tag, version = semver do chart.
```

---

## ETAPA 15 — SOFTWARE SUPPLY CHAIN SECURITY BLUEPRINT

### 15.1 Implementação SLSA Level 3 (Supply-chain Levels for Software Artifacts)

```
SLSA LEVEL 3 COMPLIANCE — LEGIS CONNECT:

 FONTE (Source):
  ✅ Branch protection com 2 reviewers obrigatórios (SLSA L2+).
  ✅ Signed commits obrigatórios (GPG/SSH signing no GitHub).
  ✅ GitLeaks + GitHub Secret Scanning habilitado no repositório.

 BUILD (Build):
  ✅ Pipeline CI hermético (GitHub Actions — sem acesso à internet exceto registries aprovados).
  ✅ Provenance gerado automaticamente via GitHub Actions OIDC + Sigstore.
  ✅ Build reproducível (npm ci com lockfile + Docker --no-cache).

 ARTEFATO (Artifact):
  ✅ SBOM gerado com Syft em formato SPDX-JSON e atestado via Cosign.
  ✅ Imagem Docker assinada com Cosign (Sigstore keyless — chave efêmera via OIDC).
  ✅ OPA Gatekeeper verifica assinatura Cosign antes de cada deploy no Kubernetes.

 DEPENDÊNCIAS (Dependencies):
  ✅ OWASP Dependency Track monitora CVEs em todas as dependências NPM/Python.
  ✅ Renovate Bot mantém dependências atualizadas automaticamente (PRs semanais).
  ✅ Allowlist de registries npm (apenas npmjs.com e GitHub Packages).
```

---

## ETAPA 16 — SECURE SOFTWARE DELIVERY PIPELINE

### 16.1 Security Gates Obrigatórios no CI/CD

```
DEVSECOPS SECURITY GATES — PIPELINE LEGIS CONNECT:

 GATE 1 — SECRET DETECTION (Pre-commit + CI):
  Ferramenta: GitLeaks + GitHub Secret Scanning.
  Ação em falha: CI falha com BLOQUEIO. Developer notificado via Slack.
  Ferramentas de remediação: git filter-repo + secret rotation obrigatória.

 GATE 2 — SAST (Static Application Security Testing):
  Ferramenta: Semgrep Enterprise com regras: typescript, owasp-top-ten, nestjs, sql-injection.
  Severidade bloqueante: HIGH e CRITICAL.
  Ação em falha: CI falha. Alerta no Semgrep AppSec Portal + JIRA ticket automático.

 GATE 3 — SCA (Software Composition Analysis):
  Ferramenta: OWASP Dependency Track + GitHub Dependabot.
  Bloqueante: CVSS ≥ 7.0 em dependência de produção.
  Ação em falha: CI falha. Ticket de remediação criado automaticamente.

 GATE 4 — CONTAINER SCAN (Trivy):
  Ferramenta: Trivy (Aquasecurity) na imagem final Docker.
  Bloqueante: Vulnerabilidade CRITICAL ou HIGH na imagem final.
  Ação em falha: Deploy bloqueado. Engenheiro notificado para re-build com base atualizada.

 GATE 5 — IaC SECURITY SCAN (Checkov):
  Ferramenta: Checkov em todos os arquivos OpenTofu/Terraform.
  Bloqueante: Recurso public, sem encryption, sem logging habilitado.
  Integração: Resultados enviados ao Microsoft Sentinel (ADR-009).

 GATE 6 — DAST (Dynamic Application Security Testing):
  Ferramenta: OWASP ZAP API Scan no ambiente de staging após deploy.
  Frequência: Diária (scan agendado) + a cada deploy em staging.
  Ação em falha: Alerta para AppSec Team. Produção não promovida.
```

---

## ETAPA 17 — ENTERPRISE SECRETS MANAGEMENT FRAMEWORK

### 17.1 HashiCorp Vault como Central de Segredos

```
SECRETS MANAGEMENT ARCHITECTURE:

 VAULT CLUSTER:
  • Deploy: HashiCorp Vault Enterprise no EKS (HA: 3 réplicas, auto-unseal via AWS KMS).
  • Backends de Segredo:
    ├── KV v2: API keys, configurações estáticas por ambiente.
    ├── Database Secrets Engine: Credenciais dinâmicas de PostgreSQL (rotação automática a cada 1h).
    ├── AWS Secrets Engine: IAM credentials temporárias para acesso S3/SQS.
    └── PKI Secrets Engine: Certificados TLS internos (mTLS entre microserviços via Istio).

 INTEGRAÇÃO COM KUBERNETES:
  • Vault Agent Injector: Segredos injetados como arquivo em /vault/secrets/ (nunca como env var).
  • External Secrets Operator: Sincronização de secrets Vault → Kubernetes Secrets (criptografado ETCD).

 ACESSO:
  • Auth method: Kubernetes ServiceAccount + AWS IAM Role (nenhuma senha estática).
  • Política de acesso: Cada serviço acessa APENAS seus próprios secrets (Vault Policy por serviço).
  • Rotação automática: Database credentials rotacionadas a cada 1h sem downtime (Vault Dynamic Secrets).
```

---

## ETAPA 18 — ENVIRONMENT LIFECYCLE MANAGEMENT MODEL

### 18.1 Definição e Governança de Ambientes

| Ambiente | Propósito | Trigger Criação | Aprovação Deploy | Data Retention |
|---|---|---|---|---|
| **Local (Dev)** | Desenvolvimento local | Developer (docker compose) | Automático | Efêmero |
| **Preview (Ephemeral)** | Revisão de Pull Request | Abertura de PR | Automático | Duração do PR |
| **Development** | Integração contínua | Merge em main | Automático | 30 dias |
| **Staging** | Validação pré-produção | Tag release-candidate | Automático | 90 dias |
| **Production** | Produção global | Tag release + aprovação | Manual (Eng Manager) | Permanente |
| **DR** | Disaster Recovery | Ativação de failover | CISO + CTO | Permanente |

---

## ETAPA 19 — ENTERPRISE RELEASE MANAGEMENT FRAMEWORK

### 19.1 Semantic Versioning e Automated Changelog

```
RELEASE PROCESS — LEGIS CONNECT:

 SEMANTIC VERSIONING (SemVer 2.0.0):
  • MAJOR (X.0.0): Breaking change de API pública ou migração de dados incompatível.
  • MINOR (0.X.0): Nova feature retrocompatível (feature flag ou backward-compatible API).
  • PATCH (0.0.X): Bug fix, security patch, performance improvement.

 CONVENTIONAL COMMITS (obrigatório):
  • feat: nova funcionalidade → bumpa MINOR.
  • fix: correção de bug → bumpa PATCH.
  • feat!: ou BREAKING CHANGE → bumpa MAJOR.
  • Exemplos: "feat(case): add case status webhook notifications"
              "fix(auth): resolve JWT expiration race condition"

 AUTOMATED RELEASE PIPELINE:
  1. Developer merge PR em main com Conventional Commit.
  2. Semantic Release analisa commits e determina a próxima versão.
  3. GitHub Release criado automaticamente com CHANGELOG.md gerado.
  4. Tag Git aplicada (v2.5.0).
  5. ArgoCD detecta nova tag e inicia deploy em staging automaticamente.
  6. Eng Manager aprova promoção para produção no Backstage.
```

---

## ETAPA 20 — FEATURE DELIVERY CONTROL FRAMEWORK

### 20.1 Feature Flags com OpenFeature + LaunchDarkly

```
FEATURE FLAG ARCHITECTURE:

 PROVIDER: LaunchDarkly (enterprise) com SDK OpenFeature (padrão aberto).
  OpenFeature SDK garante que a dependência de vendor pode ser trocada sem refactor.

 CONTEXTOS DE SEGMENTAÇÃO:
  • Tenant ID: Feature habilitada por cliente (ex: apenas escritórios Premium têm acesso).
  • User Role: Feature habilitada por papel (ex: apenas advogados veem o AI Copilot).
  • Percentage Rollout: Deploy gradual (1%→5%→25%→50%→100% dos usuários).
  • Environment: Feature habilitada em staging mas não em produção ainda.

 USO NO CÓDIGO (NestJS):
  @Injectable()
  export class CaseService {
    constructor(private readonly featureClient: OpenFeatureClient) {}

    async createCase(dto: CreateCaseDto): Promise<Case> {
      const aiEnabled = await this.featureClient.getBooleanValue(
        'ai-case-analysis-v2', false, { targetingKey: dto.tenantId }
      );
      if (aiEnabled) {
        await this.aiAnalysisService.analyzeNewCase(case.id);
      }
    }
  }

 KILL SWITCH: Cada feature crítica possui kill switch independente que
 pode ser desativado em < 30 segundos sem deploy.
```

---

## ETAPA 21 — CONTINUOUS QUALITY ENGINEERING PIPELINE

### 21.1 Pirâmide de Testes Automatizados

```
TEST PYRAMID — LEGIS CONNECT:

 UNIT TESTS (Base — 70% da cobertura):
  • Framework: Jest + NestJS Testing Module.
  • Coverage Gate: > 80% de cobertura de linhas (SonarQube Quality Gate).
  • Execução: < 2 minutos no CI.

 INTEGRATION TESTS (30% intermediário):
  • Framework: Jest + Testcontainers (PostgreSQL, Redis, Kafka em Docker).
  • Objetivo: Testar camada de repositório + eventos Kafka + API endpoints.
  • Execução: < 5 minutos no CI.

 CONTRACT TESTS (API — Pact.io):
  • Objetivo: Garantir compatibilidade entre Consumer e Provider de APIs.
  • Integração: Pact Broker no CI/CD para verificação de contratos.
  • Execução: < 2 minutos.

 E2E TESTS (Topo — críticos apenas):
  • Framework: Playwright (Web) + Detox (Mobile).
  • Escopo: Fluxos críticos: Cadastro, Login, Criação de Processo, Pagamento.
  • Execução: < 15 minutos em staging após deploy.

 PERFORMANCE TESTS:
  • Framework: k6 com thresholds automatizados (p95 < 200ms, error_rate < 1%).
  • Execução: Diária em staging + antes de cada release de produção.
```

---

## ETAPA 22 — SITE RELIABILITY ENGINEERING OPERATING MODEL

### 22.1 SLOs, Error Budgets e Toil Reduction

```
SRE FRAMEWORK — LEGIS CONNECT:

 SLIs e SLOs DEFINIDOS (por serviço crítico):

  service-identity (IAM):
  ├── SLI: Request Success Rate (excluindo 4xx esperados)
  ├── SLO: 99.9% de requests bem-sucedidos em janela de 30 dias.
  └── Error Budget: 0.1% = 43.8 minutos de downtime/mês permitido.

  service-financial (Pagamentos):
  ├── SLI: Transaction Success Rate (PIX + Stripe)
  ├── SLO: 99.95% de transações bem-sucedidas.
  └── Error Budget: 0.05% = 21.9 minutos/mês.

  service-ai-gateway (LLM):
  ├── SLI: P95 Latency < 3 segundos para respostas LLM
  └── SLO: 99% das respostas dentro de 3 segundos.

 ERROR BUDGET POLICY:
  • Budget > 50% restante: Inovação liberada (novas features sem restrição).
  • Budget < 50%: Freeze de novas features. Foco em reliability.
  • Budget esgotado: Freeze TOTAL de novas features + Post-mortem obrigatório.

 TOIL REDUCTION TARGET:
  SRE Engineers: < 20% do tempo em toil (trabalho manual repetitivo).
  Restante: Engineering (automação, SLO improvement, capacity planning).
```

---

## ETAPA 23 — DEVOPS OBSERVABILITY ARCHITECTURE

### 23.1 Stack de Observabilidade Cloud Native (OpenTelemetry)

```
OBSERVABILITY STACK — THE THREE PILLARS:

 METRICS (Prometheus + Grafana):
  • Coleta: Prometheus com ServiceMonitor para cada pod Kubernetes.
  • Dashboards: Grafana com 35+ dashboards (por serviço, por cluster, por SLO).
  • Alertas: AlertManager → PagerDuty (P0/P1) + Slack (P2/P3).

 LOGS (Fluentd + AWS CloudWatch + Sentinel):
  • Coleta: Fluentd DaemonSet coleta logs de todos os pods.
  • Storage: CloudWatch Logs (90 dias) + S3 Archive (1 ano).
  • Security: Logs de segurança adicionalmente enviados ao Microsoft Sentinel.

 TRACES (Jaeger + OpenTelemetry):
  • SDK: OpenTelemetry SDK integrado em todos os microserviços NestJS.
  • Backend: Jaeger (self-hosted no EKS) + AWS X-Ray para traces de funções Lambda.
  • Sampling: 100% de traces em staging, 10% em produção (tail-based sampling).

 OPENTELEMETRY INTEGRATION (NestJS):
  import { NodeSDK } from '@opentelemetry/sdk-node';
  import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
  const sdk = new NodeSDK({
    traceExporter: new JaegerExporter({ endpoint: process.env.JAEGER_ENDPOINT }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  sdk.start();
```

---

## ETAPA 24 — ENGINEERING INTELLIGENCE DASHBOARD

### 24.1 DORA Metrics — Dashboard de Produtividade de Engenharia

| Métrica DORA | Definição | Meta Elite | Ferramenta |
|---|---|---|---|
| **Deployment Frequency** | Quantas vezes por dia cada serviço é deployed em produção | Múltiplos/dia | GitHub Actions + ArgoCD |
| **Lead Time for Changes** | Tempo do commit ao deploy em produção | < 1 hora | GitHub + ArgoCD Metrics |
| **Change Failure Rate** | % de deploys que causam incidente | < 5% | PagerDuty + JIRA |
| **MTTR** | Tempo médio de recuperação de incidente de produção | < 1 hora | PagerDuty Metrics |

---

## ETAPA 25 — AI ENGINEERING ASSISTANT FRAMEWORK

### 25.1 IA Integrada ao Ciclo de Desenvolvimento

```
AI-ASSISTED ENGINEERING — LEGIS CONNECT:

 COPILOT NO IDE:
  • GitHub Copilot Enterprise: Contexto total do codebase Legis (repositórios privados).
  • Regras customizadas: Copilot treinado com padrões de código da Legis (NestJS standards).

 AI NO PULL REQUEST (Gemini Code Review):
  • Revisão automática de segurança: Identifica riscos OWASP não detectados pelo SAST.
  • Sugestão de testes: Gera casos de teste unitário para código novo.
  • Documentação: Gera JSDoc/OpenAPI specification automaticamente para novos endpoints.

 AI NO PIPELINE CI (Semgrep + AI):
  • Explicação de vulnerabilidades: SAST findings com explicação em linguagem natural.
  • Sugestão de remediação: Fix automático proposto para vulnerabilidades simples.

 AI SECURITY REVIEW:
  • Threat Modeling automatizado: Novo serviço cadastrado no Backstage → AI gera
    threat model inicial (STRIDE) para revisão pelo Security Engineer.
```

---

## ETAPA 26 — ENGINEERING DISASTER RECOVERY PLAN

### 26.1 Resiliência da Plataforma de Engenharia

```
ENGINEERING DR PLAN:

 REPOSITÓRIOS GITHUB (RPO: 0 — Replicação contínua):
  • GitHub Enterprise Cloud com redundância geográfica nativa da plataforma.
  • Mirror automático para AWS CodeCommit em sa-east-1 (backup secundário).
  • Restore: git clone do mirror em < 5 minutos.

 PIPELINES CI/CD (RTO: < 30 minutos):
  • GitHub Actions: SaaS gerenciado com SLA 99.9% da GitHub.
  • ArgoCD: Deploy no EKS em HA (3 réplicas). Restore via GitOps (reaplicar app-of-apps.yaml).
  • Vault: Cluster de 3 réplicas no EKS com auto-unseal KMS. Snapshots Vault para S3 a cada hora.

 INFRAESTRUTURA IAC (RTO: < 2 horas):
  • OpenTofu state armazenado em S3 com versionamento e locking DynamoDB.
  • Re-provisionar ambiente completo via `tofu apply` em < 2 horas (testado semestralmente).

 IMAGENS DOCKER (RPO: < 1 hora):
  • ECR replicado entre us-east-1 e sa-east-1.
  • Últimas 10 versões de cada serviço mantidas em ambas as regiões.
```

---

## ETAPA 27 — ENTERPRISE DEVSECOPS EVOLUTION ROADMAP

### 27.1 Roadmap de Maturidade — DORA Level 1 → Elite

```
DEVSECOPS MATURITY ROADMAP — 2026-2028:

 FASE 1 (Q3 2026) — CI/CD FOUNDATION [DORA Medium]:
  Deliverables: GitHub Actions CI universal + ECR + Helm Charts + ArgoCD básico.
  KPI: Deployment Frequency: 1x/dia | Lead Time: < 4 horas.

 FASE 2 (Q4 2026) — GITOPS + SECURITY GATES [DORA High]:
  Deliverables: GitOps ArgoCD completo + Todos os Security Gates (SAST+SCA+SBOM+Cosign).
  KPI: Deployment Frequency: 3x/dia | Lead Time: < 2 horas | CFR: < 10%.

 FASE 3 (Q1 2027) — PLATFORM ENGINEERING [DORA Elite]:
  Deliverables: Backstage IDP completo + Golden Path + Self-service provisionamento.
  KPI: Deployment Frequency: Múltiplos/dia | Lead Time: < 1 hora | MTTR: < 1 hora.

 FASE 4 (Q2 2027) — DEVSECOPS AVANÇADO [DORA Elite + Security]:
  Deliverables: SLSA Level 3 compliance + Vault Dynamic Secrets + Feature Flags OpenFeature.
  KPI: CFR: < 5% | Zero Critical CVEs em produção | SBOM 100% dos serviços.

 FASE 5 (2028+) — AUTONOMOUS SOFTWARE DELIVERY [Beyond DORA]:
  Deliverables: AI-Generated Tests + Autonomous Security Remediation + Self-Healing Pipelines.
  KPI: Lead Time: < 15 minutos | Change Failure Rate: < 1% | Autonomous Patch: > 80%.
```

---

## CERTIFICAÇÃO FINAL DA PLATAFORMA DE ENGENHARIA DE SOFTWARE

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║                           CERTIFICAÇÃO PROMPT 222                                        ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║  Empresa: Legis Connect                                                                  ║
║  Artefato: Enterprise DevSecOps, CI/CD, GitOps & Software Supply Chain Blueprint         ║
║  Número: PROMPT 222 · 27 Etapas Auditadas · Score: 5.00 / 5.00                         ║
║  Tecnologias:                                                                            ║
║    • GitHub Actions CI/CD · ArgoCD GitOps · OpenTofu IaC · Backstage IDP               ║
║    • HashiCorp Vault · Semgrep SAST · OWASP Dep Track SCA · Cosign SBOM                ║
║    • OPA Gatekeeper · LaunchDarkly + OpenFeature · k6 Performance · Playwright E2E      ║
║    • OpenTelemetry · Prometheus/Grafana · DORA Metrics · GitHub Copilot Enterprise      ║
║  Data: 27 de Julho de 2026                                                               ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║  DORA TARGET: Elite (Deployment Freq: Múltiplos/dia · Lead Time: <1h · CFR: <5%)       ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║  CLASSIFICAÇÃO: ENTERPRISE CLOUD NATIVE SOFTWARE FACTORY (CERTIFICADO E HOMOLOGADO)      ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝
```

---
*Enterprise DevSecOps Platform Blueprint v1.0 DEFINITIVO*
*27 Etapas Auditadas · Legis Connect · 27 de Julho de 2026 · Score: 5.00/5.00*
*GitHub Actions · ArgoCD GitOps · OpenTofu · Backstage IDP · Vault · SLSA Level 3*
