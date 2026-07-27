# PROMPT 066 — Enterprise DevSecOps, Cloud & Platform Operations Blueprint
## Legis Connect · CPO · Principal DevSecOps Architect · Cloud Solutions Architect · Lead SRE
### Versão 1.0 COMPLETA | Classificação: CONFIDENCIAL | Data: 2026-07-25 | 27 Etapas Auditadas

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Corporativa Completa de DevSecOps, Infraestrutura Cloud Native, Kubernetes, CI/CD GitOps, Observabilidade End-to-End, SRE e Operações de Plataforma (Enterprise DevSecOps, Cloud & Platform Operations Blueprint) da Legis Connect TO-BE**, cobrindo integralmente as 27 etapas mandatórias: Auditoria da Infraestrutura Atual, Infrastructure Risk Assessment, Enterprise Cloud Architecture Blueprint (AWS EKS Multi-AZ), Environment Strategy Framework (Dev, QA, Staging, Prod, DR), Infrastructure as Code (Terraform + Crossplane), Container Platform Architecture (Docker Multi-stage + Trivy), Enterprise Kubernetes Architecture (EKS + HPA + Cluster Autoscaler), Enterprise CI/CD Blueprint (GitHub Actions), GitOps Architecture (ArgoCD), Enterprise DevSecOps Framework (SAST, DAST, SCA, Secrets Scan), Secrets Management Architecture (HashiCorp Vault + AWS Secrets Manager), Observability Architecture (OpenTelemetry + Prometheus + Grafana), Central Logging Platform (Loki + OpenSearch), Monitoring Framework, Distributed Tracing (Jaeger), Incident Alerting Framework (PagerDuty + Slack), SRE Operating Model (SLI, SLO, SLA, Error Budget), Auto Scaling Framework, Disaster Recovery Architecture (Multi-Region Active/Passive RPO < 5min RTO < 15min), Business Continuity Framework, Enterprise Backup Strategy, Release Management Framework (Canary / Blue-Green), Platform Operations Model (ITIL 4 + SRE), Cloud Cost Optimization Framework (FinOps + Kubecost), Platform Evolution Roadmap, Backlog DevSecOps Estratégico (OPS-001 a OPS-007) e o Blueprint Consolidado Final.

**Estado AS-IS:** Maturidade Operacional `1.0 / 5.0` (Nível 1 — Estático / Sem Backend) — hospedagem estática no GitHub Pages com deploy automatizado via GitHub Actions básico, ausência de cluster Kubernetes ou containers em produção, sem banco de dados gerenciado em nuvem, zero observabilidade (sem APM, sem logs centralizados, sem tracing), sem ambiente de Staging/DR formalizado, sem análise automatizada de segurança de código (SAST/DAST) e dependência de chaves de API expostas em código.

**Estado TO-BE:** Maturidade `4.8 / 5.0` (Nível 5 — Cloud Native Enterprise & Autonomous SRE) — Infraestrutura como Código (Terraform) provisionando EKS Multi-AZ na AWS, GitOps com ArgoCD sincronizando repositórios de manifesto, pipeline DevSecOps completo (SonarQube, Trivy, Zap, Trufflehog), controle de segredos via HashiCorp Vault, Observabilidade unificada (OpenTelemetry, Prometheus, Grafana, Loki, Jaeger), práticas SRE com Error Budgets e alertas via PagerDuty, resiliência multi-região com RPO < 5min e RTO < 15min, e FinOps com Kubecost para otimização contínua de custos.

---

## ETAPA 1 — AUDITORIA DA INFRAESTRUTURA ATUAL

### 1.1 Mapeamento da Infraestrutura Existente

| Componente | Estado Atual (AS-IS) | Criticidade | Risco Identificado | Evolução Necessária (TO-BE) |
|---|---|---|---|---|
| **Frontend Web** | GitHub Pages (Arquivos Estáticos HTML/JS/CSS) | CRÍTICA | Alto: Sem CDN avançado, WAF ou proteção DDoS corporativa | Cloudflare Enterprise + AWS S3 + CloudFront CDN |
| **Backend / API** | Inexistente (Lógica mockada/embarcada no frontend) | CRÍTICA | Crítico: Ausência de regra de negócio server-side segura | Microserviços NestJS em EKS Kubernetes Multi-AZ |
| **CI/CD Pipeline** | GitHub Actions básico de build e deploy estático | ALTA | Médio: Sem etapas de testes de segurança (SAST/DAST) | Pipeline DevSecOps completo + GitOps via ArgoCD |
| **Armazenamento** | `localStorage` do navegador | CRÍTICA | Crítico: Perda de dados e limite de 5MB por cliente | PostgreSQL RDS Multi-AZ + AWS S3 Data Lake |
| **Banco de Dados** | Inexistente em nuvem | CRÍTICA | Crítico: Zero conformidade ACID e sem backups contínuos | PostgreSQL 16 RDS + Redshift + Redis ElastiCache |
| **DNS & SSL/TLS** | DNS básico do registrador + Let's Encrypt / GitHub | ALTA | Médio: Sem roteamento inteligente ou failover de DNS | Cloudflare DNS + AWS Route 53 com Latency Routing |
| **Segredos & Keys** | Chaves hardcoded ou em variáveis de repositório | CRÍTICA | Crítico: Exposição de chaves no bundle frontend | HashiCorp Vault com rotação dinâmica (TTL 1h) |
| **Observabilidade** | Inexistente (apenas `console.log` no browser) | ALTA | High: Zero visibilidade sobre erros ou performance | Stack OpenTelemetry + Prometheus + Grafana + Loki |

---

## ETAPA 2 — DIAGNÓSTICO OPERACIONAL (INFRASTRUCTURE RISK ASSESSMENT)

### 2.1 Matriz de Riscos de Infraestrutura e Operações

```
DIAGNÓSTICO DA INFRAESTRUTURA ATUAL (FALHA DE MISSÃO CRÍTICA):

[Usuário] ──> [GitHub Pages (Static Web)] ──> [Gemini Direct API Call]
                     │
                     └── (Sem Backend Server / Sem Banco Cloud / Sem Logs Centralizados)

FALHAS OPERACIONAIS CRÍTICAS CONFIRMADAS:
  [A] Ausência de Resiliência: Se o GitHub Pages oscilar, a plataforma inteira fica inacessível sem failover.
  [B] Risco de Perda Irrecuperável de Dados: Dados gravados no browser do usuário não possuem backup centralizado.
  [C] Cegueira Operacional (Zero Observability): Impossível saber a latência P95, taxa de erros ou se os usuários estão sofrendo com falhas.
  [D] Ausência de Pipeline DevSecOps: Código deployado sem verificação de vulnerabilidades de dependências (SCA) ou SAST.
```

| ID | Risco Operacional | Prob. | Impacto | Score CVSS | Controle TO-BE |
|---|---|---|---|---|---|
| OPS-001 | Indisponibilidade total por falha na hospedagem estática sem réplica | Média | Crítico | 9.0 | Arquitetura Multi-AZ no AWS EKS + CloudFront + Route53 Failover |
| OPS-002 | Perda permanente de dados de clientes devido ao uso de localStorage | Alta | Crítico | 9.8 | PostgreSQL 16 RDS Multi-AZ com PITR 35 dias |
| OPS-003 | Vazamento de credenciais de serviços e APIs em repositórios de código | Média | Alto | 8.8 | Gitleaks / Trufflehog no CI/CD + HashiCorp Vault |
| OPS-004 | Invasão e comprometimento por falta de Web Application Firewall (WAF) | Alta | Crítico | 9.2 | WAF Cloudflare Enterprise + AWS WAF na ingress |
| OPS-005 | Indisponibilidade de serviços por esgotamento de memória/CPU | Alta | Alto | 8.5 | HPA (Horizontal Pod Autoscaler) + Cluster Autoscaler EKS |
| OPS-006 | Impossibilidade de recuperar o ambiente em caso de desastre regional | Baixa | Crítico | 8.5 | Plano de Disaster Recovery Multi-Region (us-east-1 / sa-east-1) |

---

## ETAPA 3 — ARQUITETURA CLOUD ENTERPRISE (ENTERPRISE CLOUD BLUEPRINT)

### 3.1 Arquitetura Cloud Target AWS (Multi-AZ Multi-Layer)

```
LEGIS CONNECT — ENTERPRISE CLOUD ARCHITECTURE (AWS / CLOUDFLARE)

[INTERNET / USUÁRIOS]
       │
       ▼
[CLOUDFLARE ENTERPRISE (WAF / CDN / DDoS Protection / DNS)]
       │
       ▼ (TLS 1.3 / mTLS)
[AWS ROUTE 53 (Latency & Health-Check Routing)]
       │
       ▼
[AWS APPLICATION LOAD BALANCER (ALB Multi-AZ)]
       │
       ▼
[KONG API GATEWAY INGRESS (EKS Cluster)]
       │
       ├─────────────────────────────────────────────────────────────────┐
       ▼                                                                 ▼
[AWS EKS CLUSTER — US-EAST-1 (NODE GROUPS MULTI-AZ)]          [EKS NODE GROUP (SERVICES)]
  ├─ Namespace: prod-legal-services                             ├─ Auth Service (NestJS)
  ├─ Namespace: prod-financial-billing                          ├─ Legal Case Service (NestJS)
  ├─ Namespace: prod-ai-intelligence                            ├─ AI Copilot Engine (Python)
  └─ Namespace: prod-monitoring-system                          └─ Worker Jobs (Go)
       │                                                                 │
       ├─────────────────────────────────┬───────────────────────────────┘
       ▼                                 ▼
[PERSISTÊNCIA & CACHE (MANAGED)]   [DATA LAKE & DW]
  ├─ AWS RDS PostgreSQL 16 Multi-AZ  ├─ AWS S3 (Raw/Curated/Analytics)
  ├─ AWS ElastiCache (Redis 7 Cluster)└─ AWS Redshift RA3 Cluster
  └─ OpenSearch Service (Logs/Search)
```

---

## ETAPA 4 — ESTRATÉGIA MULTIAMBIENTE (ENVIRONMENT STRATEGY FRAMEWORK)

### 4.1 Matriz de Segregação e Isolamento de Ambientes

| Ambiente | Objetivo | Cluster / VPC | Fonte de Dados | Acesso / Permissão |
|---|---|---|---|---|
| **Development (Dev)** | Desenvolvimento ativo de features | AWS VPC Dev (EKS Dev) | PostgreSQL Dev (Dados Anônimos/Mock) | Desenvolvedores (RW) |
| **QA / Testing** | Testes de integração e automatizados | AWS VPC Dev (EKS Dev) | PostgreSQL QA (Mock Data Refinado) | QA / Automação (RW) |
| **Staging** | Homologação idêntica à Produção | AWS VPC Staging (EKS Stg) | PostgreSQL Staging (Sanitized Dump) | Tech Leads / QA (Read Only) |
| **Production (Prod)** | Operação real com tráfego de clientes | AWS VPC Prod (EKS Prod) | PostgreSQL RDS Prod (Multi-AZ) | Somente Pipeline CI/CD / GitOps |
| **Disaster Recovery (DR)** | Réplica passiva de emergência | AWS VPC DR (us-west-2) | PostgreSQL Read Replica Cross-Region | Break-Glass Only (SRE Lead) |

---

## ETAPA 5 — INFRASTRUCTURE AS CODE (TERRAFORM + CROSSPLANE)

### 5.1 Especificação do Módulo Terraform (AWS EKS Multi-AZ)

```hcl
# main.tf — Legis Connect Production Infrastructure
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.0"

  name = "legis-prod-vpc"
  cidr = "10.100.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.100.1.0/24", "10.100.2.0/24", "10.100.3.0/24"]
  public_subnets  = ["10.100.101.0/24", "10.100.102.0/24", "10.100.103.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = false # High Availability Multi-AZ
  enable_dns_hostnames = true

  tags = {
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.15.0"

  cluster_name    = "legis-prod-eks"
  cluster_version = "1.28"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = false # Acesso restrito via VPN/Bastion

  eks_managed_node_groups = {
    general = {
      min_size     = 3
      max_size     = 10
      desired_size = 3

      instance_types = ["t3a.xlarge"]
      capacity_type  = "ON_DEMAND"
    }
    ai_workloads = {
      min_size     = 2
      max_size     = 8
      desired_size = 2

      instance_types = ["c6i.2xlarge"]
      capacity_type  = "SPOT" # Otimização FinOps para IA
    }
  }
}
```


---

## ETAPA 6 — PLATAFORMA DE CONTAINERS (CONTAINER PLATFORM ARCHITECTURE)

### 6.1 Dockerfile Otimizado e Seguro (Multi-Stage Build NestJS)

```dockerfile
# Multi-stage Dockerfile — Legis Connect Microservices
# Stage 1: Build Environment
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# Stage 2: Hardened Runtime Environment
FROM node:20-alpine AS runner
WORKDIR /app

# Segurança: Executar com usuário não-root (Least Privilege)
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs
USER nestjs

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3000

# Healthcheck interno
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

---

## ETAPA 7 — ENTERPRISE KUBERNETES ARCHITECTURE

### 7.1 Estrutura de Deployment no Kubernetes (Manifesto Prod)

```yaml
# deployment.yaml — Legal Case Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: legal-case-service
  namespace: prod-legal-services
  labels:
    app: legal-case-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: legal-case-service
  template:
    metadata:
      labels:
        app: legal-case-service
    spec:
      containers:
      - name: legal-case-service
        image: 123456789012.dkr.ecr.us-east-1.amazonaws.com/legis/legal-case-service:v1.4.2
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1024Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health/liveness
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## ETAPA 8 — PIPELINE CI/CD ENTERPRISE (ENTERPRISE CI/CD BLUEPRINT)

### 8.1 Esteira GitHub Actions com DevSecOps Integrado

```yaml
# .github/workflows/devsecops-pipeline.yml
name: Legis Connect Enterprise DevSecOps Pipeline

on:
  push:
    branches: [ main, release/* ]
  pull_request:
    branches: [ main ]

jobs:
  security-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # 1. Dependency Scan (SCA)
      - name: Dependency Check (Snyk / Audit)
        run: npm audit --audit-level=high

      # 2. Secret Scan
      - name: Secret Scan (Trufflehog)
        uses: trufflesecurity/trufflehog-actions-scan@v3.0.0

      # 3. Static Code Analysis (SAST)
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@v2.0
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

      # 4. Build & Push Image
      - name: Build Docker Image
        run: docker build -t legis/legal-case-service:${{ github.sha }} .

      # 5. Container Image Vulnerability Scan
      - name: Scan Image (Trivy)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'legis/legal-case-service:${{ github.sha }}'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'

      # 6. Push to Amazon ECR
      - name: Push to ECR
        if: github.ref == 'refs/heads/main'
        run: |
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${{ secrets.AWS_ECR_URI }}
          docker tag legis/legal-case-service:${{ github.sha }} ${{ secrets.AWS_ECR_URI }}:v${{ github.run_number }}
          docker push ${{ secrets.AWS_ECR_URI }}:v${{ github.run_number }}
```

---

## ETAPA 9 — ARQUITETURA GITOPS (ARGOCD GITOPS BLUEPRINT)

### 9.1 Modelo Operacional GitOps

```
FLUXO GITOPS DE IMPLANTAÇÃO CONTINUA:

[Desenvolvedor] ──(PR Aprovado)──> [Repositório Código Fonte]
                                          │
                                          ▼ (CI Build & ECR Push)
[Repositório Manifestos Git (K8s)] <──(PR Automático de Nova Versão)
        │
        ▼ (Sincronização Contínua a cada 3 minutos)
[ARGOCD GITOPS CONTROLLER (EKS)]
        │
        ├── Comparação: Git State (Desejado) vs Cluster State (Atual)
        └── (Out of Sync?) ──> Aplica `kubectl apply` e atualiza pods sem downtime
```

---

## ETAPA 10 — ENTERPRISE DEVSECOPS FRAMEWORK

### 10.1 Portfólio de Ferramentas de Segurança Integradas

| Fase do Ciclo | Ferramenta | Objetivo / Gate de Bloqueio |
|---|---|---|
| **IDE / Commit** | Pre-commit hooks / GitLeaks | Bloquear envio de senhas ou API keys no Git |
| **SCA (Dependencies)** | Snyk / OWASP Dependency-Check | Identificar vulnerabilidades em pacotes npm/pip |
| **SAST (Code)** | SonarQube / Semgrep | Analisar falhas de segurança no código fonte |
| **Secrets Scan** | Trufflehog / Gitleaks | Detectar credenciais vazadas no histórico Git |
| **Container Scan** | Trivy / AWS ECR Inspector | Bloquear imagens Docker com CVEs Críticos |
| **IaC Security** | Checkov / Tfsec | Detectar misconfigurations em arquivos Terraform |
| **DAST (Runtime)** | OWASP ZAP / Nuclei | Testar vulnerabilidades dinâmicas em Staging |

---

## ETAPA 11 — GESTÃO DE SEGREDOS (SECRETS MANAGEMENT ARCHITECTURE)

### 11.1 Integração HashiCorp Vault + Kubernetes External Secrets Operator

```
ARQUITETURA DE GESTÃO DE SEGREDOS:

[HASHICORP VAULT (PROD)] ──(AppRole / ServiceAccount K8s)──> [EXTERNAL SECRETS OPERATOR]
                                                                      │
                                                                      ▼
                                                      [KUBERNETES SECRET (IN-MEMORY)]
                                                                      │
                                                                      ▼
                                                      [PODS NESTJS (ENV VARIABLES)]

REGRAS DE RETENÇÃO & ROTAÇÃO:
  • Chaves de API de terceiros (Stripe, Gemini): Rotação dinâmica automática a cada 30 dias.
  • Credenciais de Banco de Dados: Vault gera usuários temporários com TTL de 1 hora.
  • Certificados SSL/TLS: Cert-Manager + Vault PKI engine com renovação aos 30 dias de expiração.
```

---

## ETAPA 12 — ARQUITETURA DE OBSERVABILIDADE (OBSERVABILITY ARCHITECTURE)

### 12.1 Pilares da Observabilidade Unificada (MELT Framework)

```
STACK DE OBSERVABILIDADE (METRICS, EVENTS, LOGS, TRACES):

[OPENTELEMETRY SDK (NATIVO NOS MICROSERVIÇOS)]
       │
       ├─► METRICS ──> [PROMETHEUS]  ──> [GRAFANA DASHBOARDS (ALERTAS)]
       ├─► LOGS    ──> [FLUENT-BIT]   ──> [GRAFANA LOKI (LOGS CENTRALIZADOS)]
       └─► TRACES  ──> [OTEL COLLECT] ──> [JAEGER / TEMPO (RASTREAMENTO)]
```

---

## ETAPA 13 — LOGGING CENTRALIZADO (CENTRAL LOGGING PLATFORM)

### 13.1 Grafana Loki + OpenSearch Architecture

```yaml
# fluent-bit.conf — Coletor de Logs de Pods K8s
[INPUT]
    Name              tail
    Tag               kube.*
    Path              /var/log/containers/*.log
    Parser            docker
    DB                /var/log/flb_kube.db
    Mem_Buf_Limit     5MB
    Skip_Long_Lines   On

[FILTER]
    Name                kubernetes
    Match               kube.*
    Kube_URL            https://kubernetes.default.svc:443
    Kube_CA_File        /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    Kube_Token_File     /var/run/secrets/kubernetes.io/serviceaccount/token
    Kube_Tag_Prefix     kube.var.log.containers.
    Merge_Log           On

[OUTPUT]
    Name            loki
    Match           *
    Host            loki.prod-monitoring-system.svc.cluster.local
    Port            3100
    Labels          job=fluentbit, environment=production
```

---

## ETAPA 14 — MONITORAMENTO & ALERTAS (MONITORING FRAMEWORK)

### 14.1 Regras de Alerta Prometheus (PrometheusRule)

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: legis-critical-alerts
  namespace: prod-monitoring-system
spec:
  groups:
  - name: HighPriorityAlerts
    rules:
    - alert: HighErrorRate5xx
      expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100 > 2
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "Taxa de erros 5xx acima de 2% em produção"
        description: "O serviço {{ $labels.service }} apresentou alta taxa de erro nos últimos 2 minutos."

    - alert: PodMemoryNearLimit
      expr: container_memory_working_set_bytes{container!=""} / container_spec_memory_limit_bytes * 100 > 85
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Uso de memória próximo ao limite (>85%)"
```

---

## ETAPA 15 — DISTRIBUTED TRACING (JAEGER ARCHITECTURE)

### 15.1 Rastreamento End-to-End de Requisições

*   **Trace ID Propagation:** Injeção do cabeçalho `traceparent` (padrão W3C) em toda chamada HTTP/gRPC.
*   **Análise de Gargalo:** Rastreamento do caminho percorrido pela requisição (Frontend → API Gateway → NestJS API → PostgreSQL query → Gemini API), identificando a latência exata em cada trecho.

---

## ETAPA 16 — SRE OPERATING MODEL (SLI, SLO, SLA & ERROR BUDGET)

### 16.1 Tabela de Indicadores de Confiabilidade (SLO/SLA)

| Serviço | Service Level Indicator (SLI) | Service Level Objective (SLO) | Service Level Agreement (SLA) | Error Budget Mensal |
|---|---|---|---|---|
| **API Backend (Geral)** | % requisições HTTP 2xx/4xx com latência < 500ms | 99.9% de disponibilidade | 99.5% de disponibilidade | 43 minutos de downtime |
| **Autenticação / Login** | % chamadas de login concluídas com sucesso < 300ms | 99.95% de disponibilidade | 99.9% de disponibilidade | 21 minutos de downtime |
| **Legis Copilot (IA)** | % requisições de geração concluídas < 4.0s | 99.0% de sucesso | 98.0% de sucesso | 7.2 horas de erro |
| **Banco PostgreSQL** | % tempo com réplicas ativas e latência de escrita < 50ms | 99.99% de uptime | 99.95% de uptime | 4.3 minutos de downtime |

---

## ETAPA 17 — INCIDENT ALERTING FRAMEWORK (PAGERDUTY / SLACK)

### 17.1 Matriz de Roteamento de Incidentes

```
MATRIZ DE ESCALONAMENTO DE INCIDENTES:

  [SEVERIDADE SEV-1 (CRÍTICO - SISTEMA FORA)]
  • Alerta disparado imediatamente via PagerDuty (Ligação + SMS para o SRE de Plantão).
  • Canal automático criado no Slack: `#incident-sev1-yyyymmdd`.
  • Escalamento: Se não houver aceite em 5 minutos → Notifica Lead SRE e CTO.

  [SEVERIDADE SEV-2 (ALTO - FEATURE DEGRADADA)]
  • Notificação PagerDuty (Push notification no app mobile) + Mensagem no Slack `#alerts-p1`.
  • Escalamento: Se não houver aceite em 15 minutos → Liga para o On-Call.

  [SEVERIDADE SEV-3 (MÉDIO/BAIXO - ADVERTÊNCIA)]
  • Mensagem no canal Slack `#alerts-warning` para resolução no horário comercial.
```

---

## ETAPA 18 — ESCALABILIDADE AUTOMÁTICA (AUTO SCALING FRAMEWORK)

### 18.1 HPA + KEDA + Cluster Autoscaler

*   **HPA (Horizontal Pod Autoscaler):** Escala pods NestJS baseado em CPU (>70%), Memória (>80%) ou Throughput de requisições.
*   **KEDA (Kubernetes Event-driven Autoscaling):** Escala pods workers com base no tamanho das filas do RabbitMQ ou lags de tópicos do Kafka.
*   **Cluster Autoscaler / Karpenter:** Provisiona e encerra nós EC2 automaticamente na AWS conforme a demanda do cluster EKS.

---

## ETAPA 19 — DISASTER RECOVERY ARCHITECTURE (DR PLAN)

### 19.1 Estratégia de DR Multi-Região (Active / Passive Warm-Standby)

```
DISASTER RECOVERY ARCHITECTURE (AWS US-EAST-1 PRIMARY / US-WEST-2 DR):

  PRIMARY REGION (US-EAST-1 - ATIVA)             SECONDARY REGION (US-WEST-2 - STANDBY)
  ├─ EKS Cluster (Prod Live)                     ├─ EKS Cluster (Min-Nodes Ready)
  ├─ PostgreSQL RDS Master                        ├─ PostgreSQL RDS Cross-Region Read Replica
  ├─ S3 Primary Bucket                           ├─ S3 Cross-Region Replication (CRR)
  └─ Redis Primary                               └─ ElastiCache Standby

MÉTRICAS METAS DE DR:
  • RPO (Recovery Point Objective):  < 5 minutos (Perda máxima tolerada de dados).
  • RTO (Recovery Time Objective):   < 15 minutos (Tempo máximo para restaurar operação total).
  • Automatização: Script de failover de DNS via AWS Route 53 com 1 clique (Break-Glass).
```

---

## ETAPA 20 — BUSINESS CONTINUITY FRAMEWORK (BCP)

### 20.1 Plano de Continuidade de Negócios

*   **Testes Periódicos de Failover (GameDays):** Simulação trimestral de queda da região primária com failover real para a região de DR.
*   **Redundância de Provedores de IA:** Se o Google Gemini API cair, o LiteLLM redireciona automaticamente 100% do tráfego para Anthropic Claude ou Llama 3 On-Premises.

---

## ETAPA 21 — BACKUP CORPORATIVO (ENTERPRISE BACKUP STRATEGY)

### 21.1 Matriz de Backups da Plataforma

| Ativo de Dado | Tipo de Backup | Frequência | Retenção | Localização |
|---|---|---|---|---|
| **PostgreSQL RDS** | PITR (Point-in-Time) + Snapshot Diário | Contínuo (Wwal) + 1x/dia | 35 dias PITR + 7 anos mensal | S3 US-East-1 + CRR US-West-2 |
| **Documentos (S3)** | Versionamento S3 + Replica Cross-Region | Tempo real | Permanente | S3 Standard → Glacier (7a) |
| **Configurações K8s** | Velero K8s Backup | Diário | 90 dias | S3 DR Bucket |
| **Código & IaC** | Git Commits + Tagging | A cada push | Permanente | GitHub + AWS CodeCommit Mirror |

---

## ETAPA 22 — GESTÃO DE RELEASES (RELEASE MANAGEMENT FRAMEWORK)

### 22.1 Estratégia de Deploy Sem Downtime (Canary Release)

```
ESTRATÉGIA CANARY RELEASE COM ARGO ROLLOUTS:

  [Novo Deploy Disparado (v1.5.0)]
               │
               ▼
  [Argo Rollouts — 10% do Tráfego para v1.5.0 | 90% no v1.4.0]
               │ (Análise de Métricas por 10 minutos — Prometheus)
               ├── (Error rate < 0.1% e Latência P95 ok?)
               │        │
               │        ▼ (Sim)
               │   [Aumenta para 50% do Tráfego] ──(Mais 10 min)──> [Promove 100% para v1.5.0]
               │
               └── (Error rate > 0.5% ou Latência Alta?)
                        │
                        ▼ (Não)
                   [Rollback Automático Instantâneo para v1.4.0]
```

---

## ETAPA 23 — GESTÃO OPERACIONAL (PLATFORM OPERATIONS MODEL)

### 23.1 Modelo Integrado ITIL 4 + SRE

*   **Gestão de Incidentes:** Post-mortem blameless obrigatório para todo incidente SEV-1/SEV-2, gerando itens de ação com SLA de correção.
*   **Gestão de Mudanças (CAB Automático):** Mudanças promovidas automaticamente via pipeline CI/CD se passarem nos testes e gates de segurança (Sem aprovação manual de comitê para deploys padrão).

---

## ETAPA 24 — CUSTOS DA INFRAESTRUTURA (FINOPS FRAMEWORK)

### 24.1 Otimização de Custos Cloud com Kubecost

```
DIRETRIZES FINOPS LEGIS CONNECT:

  • EKS Spot Instances: Uso de instâncias Spot para workloads não-críticos de worker e IA (Economia de até 70%).
  • Right-Sizing Automático: Kubecost ajusta CPU/RAM Requests dos Pods semanalmente.
  • S3 Lifecycle Rules: Transição automática de objetos S3 para Infrequent Access (30d) e Glacier (90d).
  • Savings Plans / Reserved Instances: Compra de AWS Savings Plans de 1 ano para o baseline de bancos RDS e EKS nodes.
```

---

## ETAPA 25 — ROADMAP OPERACIONAL (PLATFORM EVOLUTION ROADMAP)

```
ROADMAP DE EVOLUÇÃO OPERACIONAL DA PLATAFORMA:

FASE 1 — BACKEND & INFRAESTRUTURA BASE (Meses 1-3):
  ├── Provisionamento da VPC, EKS Multi-AZ e RDS PostgreSQL via Terraform
  ├── Esteira CI/CD GitHub Actions com SAST/SCA/Secret Scanning
  └── Deploy do Kong API Gateway e HashiCorp Vault para segredos

FASE 2 — CONTAINERS & GITOPS (Meses 4-6):
  ├── Migração dos microserviços para Docker multi-stage
  ├── Implantação do ArgoCD para GitOps nos clusters K8s
  └── Início do monitoramento Prometheus + Grafana

FASE 3 — OBSERVABILIDADE & RESILIÊNCIA (Meses 7-9):
  ├── Implementação do OpenTelemetry + Jaeger para tracing distribuído
  ├── Grafana Loki para centralização e análise de logs
  └── Definição formal dos SLOs/SLIs e Error Budgets

FASE 4 — SRE, DR MULTI-REGIÃO & FINOPS (Meses 10-12):
  ├── Automação do plano de Disaster Recovery Multi-Region (Active/Passive)
  ├── Argo Rollouts para Canary Deployments sem downtime
  └── Otimização de custos FinOps com Kubecost e AWS Savings Plans
```

---

## ETAPA 26 — BACKLOG DEVSECOPS ESTRATÉGICO

### OPS-001 — P0 CRÍTICO: Provisionamento IaC (Terraform) da Infraestrutura AWS (VPC, EKS, RDS)
**Prioridade:** MÁXIMA | **Estimativa:** 4 semanas | **Complexidade:** Alta
Desenvolver scripts Terraform para provisionar a VPC Multi-AZ, Cluster EKS, PostgreSQL RDS e Redis ElastiCache na AWS.

### OPS-002 — P0 CRÍTICO: Esteira DevSecOps GitHub Actions com Gates de Segurança
**Prioridade:** CRÍTICA | **Estimativa:** 3 semanas | **Complexidade:** Média
Criar a esteira CI/CD unificada integrando SonarQube (SAST), Snyk (SCA), Trufflehog (Secrets) e Trivy (Container Scan).

### OPS-003 — P1: Implantação GitOps com ArgoCD no Cluster EKS
**Prioridade:** ALTA | **Estimativa:** 3 semanas | **Complexidade:** Média
Configurar o ArgoCD para gerenciar e sincronizar automaticamente os manifestos Kubernetes do repositório Git com o cluster EKS.

### OPS-004 — P1: Stack de Observabilidade Unificada (OpenTelemetry, Prometheus, Grafana, Loki)
**Prioridade:** ALTA | **Estimativa:** 4 semanas | **Complexidade:** Alta
Instalar e configurar os coletores OpenTelemetry, Prometheus, Grafana e Grafana Loki para centralização de métricas e logs.

### OPS-005 — P2: Gestão de Segredos com HashiCorp Vault & External Secrets Operator
**Prioridade:** MÉDIA | **Estimativa:** 3 semanas | **Complexidade:** Média
Implantar o HashiCorp Vault para rotação dinâmica de segredos e credenciais de banco de dados integradas ao Kubernetes.

### OPS-006 — P2: Plano de Disaster Recovery Multi-Região (Active/Standby)
**Prioridade:** MÉDIA | **Estimativa:** 4 semanas | **Complexidade:** Alta
Configurar réplicas cross-region do PostgreSQL RDS e S3, e automação de failover de DNS no Route 53.

### OPS-007 — P3: FinOps & Otimização de Custos com Kubecost
**Prioridade:** MÉDIA | **Estimativa:** 2 semanas | **Complexidade:** Média
Instalar a ferramenta Kubecost no cluster EKS para rastreamento de custos por namespace e otimização de requisições de recursos.

---

## ETAPA 27 — ENTERPRISE DEVSECOPS, CLOUD & PLATFORM OPERATIONS BLUEPRINT

```
LEGIS CONNECT — CLOUD NATIVE ENTERPRISE LEGAL PLATFORM
Versão 1.0 | 27 Etapas Auditadas e Verificadas | Julho 2026

╔══════════════════════════════════════════════════════════════════╗
║             INFRAESTRUTURA CLOUD NATIVE & IAC                    ║
║  AWS VPC Multi-AZ · EKS Kubernetes 1.28 Cluster (Terraform IaC)  ║
║  Cloudflare Enterprise (WAF/CDN/DDoS) · AWS Route 53 DNS         ║
╠══════════════════════════════════════════════════════════════════╣
║              DEVSECOPS & GITOPS PIPELINE                         ║
║  GitHub Actions CI (SonarQube SAST / Snyk SCA / Trivy Scan)      ║
║  ArgoCD GitOps Deployment · HashiCorp Vault Secrets (TTL 1h)     ║
║  Argo Rollouts (Canary Release 0-Downtime)                       ║
╠══════════════════════════════════════════════════════════════════╣
║            OBSERVABILIDADE, SRE & RESILIÊNCIA                    ║
║  OpenTelemetry Tracing · Prometheus Metrics · Grafana Dashboards ║
║  Grafana Loki Central Logs · PagerDuty Incident Alerting         ║
║  SLO/SLA 99.9% · Error Budgets · Active/Passive DR Multi-Region  ║
╠══════════════════════════════════════════════════════════════════╝

MATURIDADE OPERACIONAL AS-IS: 1.0 / 5.0  →  TO-BE: 4.8 / 5.0
OBJETIVO FINAL: A PLATAFORMA CLOUD NATIVE JURÍDICA MAIS SEGURA, RESILIENTE E AUTOMATIZADA DO BRASIL.
```

---

*Enterprise DevSecOps, Cloud & Platform Operations Blueprint v1.0*
*27 Etapas Auditadas, Verificadas e Documentadas*
*CPO · Principal DevSecOps Architect · Lead SRE · Legis Connect · 2026*
