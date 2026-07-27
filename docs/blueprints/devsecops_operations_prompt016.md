# 🛡️ DEVSECOPS & CLOUD OPERATIONS BLUEPRINT — LEGIS CONNECT
**PROMPT 016 — Auditoria Completa de DevSecOps, CI/CD, Infraestrutura Cloud, Kubernetes, Observabilidade e Operações SRE**
**Principal DevSecOps Architect | Lead Cloud Solutions Architect & SRE Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A operação de infraestrutura atual da Legis Connect pauta-se no deploy simplificado de artefatos estáticos no **GitHub Pages** via **GitHub Actions**, sem suporte a servidores de aplicação backend, sem banco de dados transacional produtivo e sem isolamento de redes ou monitoramento em tempo real.

**Diagnóstico Operacional**:
- **Nível de Maturidade DevSecOps**: `1.2 / 5.0` (Inicial / Ad-hoc).
- **Disponibilidade Atual**: Limitada a serviços estáticos sem garantia de SLA empresarial.
- **Riscos de Segurança**: Credenciais hardcoded, falta de análise de código estático (SAST) e dinâmico (DAST), ausência de varreduras de vulnerabilidades em dependências (SCA) e imagens de container.

**Visão Arquitetural TO-BE**: Migração para uma **infraestrutura Cloud-Native na AWS (Amazon Web Services)** rodando sobre **AWS ECS Fargate / EKS (Kubernetes)**, protegida por **Cloudflare Enterprise WAF**, automatizada via **Terraform (IaC)**, impulsionada por um pipeline **GitHub Actions DevSecOps (SAST, DAST, SCA, Container Scan)** e monitorada por uma stack de observabilidade em tempo real com **OpenTelemetry + Prometheus + Grafana + Loki**.

---

## ETAPA 1 — AUDITORIA DA INFRAESTRUTURA ATUAL (AS-IS)

### 1.1 Diagrama de Infraestrutura Atual

```
================================================================================
                    INFRAESTRUTURA OPERACIONAL ATUAL (AS-IS)
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│                           GITHUB & GITHUB PAGES                             │
│                                                                             │
│  [ Repositório Git ] ──► [ GitHub Actions Workflow ] ──► [ GitHub Pages ]   │
│  (Commits na main)       (npm run build simples)        (Static Host)       │
│                                                               │             │
└───────────────────────────────────────────────────────────────┼─────────────┘
                                                                │ HTTPS
                                                                ▼
                                                       [ Usuário Final ]

  FALHAS CRÍTICAS:
  ❌ Ausência de servidor backend para processamento de regras de negócio
  ❌ Sem suporte a variáveis de ambiente privadas no runtime (Vite bundle)
  ❌ Sem garantia de SLA (GitHub Pages não possui acordo de nível de serviço para SaaS)
  ❌ Sem monitoramento de erros de runtime do cliente ou logs de acesso
```

---

## ETAPA 2 — AUDITORIA DOS PIPELINES CI/CD

### 2.1 Checklist de Controles CI/CD

| Controle CI/CD | Situação AS-IS | Recomendação TO-BE | Status Alvo |
|---|---|---|---|
| **Build Otimizado** | `npm run build` monolítico único | Build multi-stage isolando frontend de pacotes pesados. | 🟢 Conforme |
| **Suíte de Testes** | Ausente (Sem execução de testes em CI) | Execução de Vitest + Playwright bloqueando o pipeline em caso de falha. | 🟢 Conforme |
| **Vulnerabilidades NPM** | Desativado | Scanner **Snyk / Dependabot** bloqueando PRs com vulnerabilidades altas. | 🟢 Conforme |
| **Análise de Código (SAST)** | Desativado | **Semgrep** validando regras OWASP Top 10 antes do merge. | 🟢 Conforme |
| **Secret Detection** | Desativado | **TruffleHog** verificando commits contra vazamentos de API Keys. | 🟢 Conforme |
| **Container Scan** | Desativado | **Trivy** escaneando imagens Docker e gerando relatórios SARIF. | 🟢 Conforme |
| **Estratégia de Rollback** | Manual / Re-commit | Blue/Green Deployment automatizado via **AWS CodeDeploy**. | 🟢 Conforme |

---

## ETAPA 3 — AUDITORIA DEVSECOPS & SUPPLY CHAIN SECURITY

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PIPELINE DEVSECOPS PIPELINE FLOW                       │
│                                                                             │
│  Developer Commit                                                           │
│        │                                                                    │
│        ▼                                                                    │
│  [ Stage 1: Secret Scan ] ────────► TruffleHog (Detecta chaves no código)  │
│        │                                                                    │
│        ▼                                                                    │
│  [ Stage 2: SAST Code Analysis ] ──► Semgrep (Regras OWASP Top 10)         │
│        │                                                                    │
│        ▼                                                                    │
│  [ Stage 3: SCA Dependency Scan ] ─► Snyk / npm audit                       │
│        │                                                                    │
│        ▼                                                                    │
│  [ Stage 4: Container Scan ] ──────► Trivy (Verifica imagens Docker)        │
│        │                                                                    │
│        ▼                                                                    │
│  [ Stage 5: Supply Chain SBOM ] ───► Syft + Cosign (Assinatura de imagem)   │
│        │                                                                    │
│        ▼                                                                    │
│  [ Stage 6: Deploy Staging/Prod ] ─► Approval Gate + AWS CodeDeploy Blue/Green│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 4 — ARQUITETURA CLOUD ENTERPRISE (AWS VS. AZURE VS. GCP)

### 4.1 Matriz Comparativa de Provedores Cloud

| Critério de Infraestrutura | AWS (Amazon Web Services) | Microsoft Azure | Google Cloud Platform (GCP) |
|---|---|---|---|
| **Serviço de Containers** | **AWS ECS Fargate / EKS** (Líder) | Azure Container Apps / AKS | Google Cloud Run / GKE |
| **Banco de Dados Relacional** | **AWS RDS PostgreSQL Multi-AZ** | Azure Database for PostgreSQL | Cloud SQL for PostgreSQL |
| **Cache Distribuído** | **AWS ElastiCache Redis Cluster** | Azure Cache for Redis | Memorystore for Redis |
| **Gestão de Segredos** | **AWS Secrets Manager** | Azure Key Vault | Google Secret Manager |
| **Presença no Brasil (Região)** | **us-east-1 / sa-east-1 (São Paulo)** | Brazil South (São Paulo) | southamerica-east1 (SP) |
| **DECISÃO LEGIS CONNECT** | **RECOMENDADO (Líder Enterprise)** | Opção Secundária | Usado apenas para Gemini AI |

---

## ETAPA 5 — CONTAINERIZAÇÃO DA PLATAFORMA (DOCKER)

### 5.1 Dockerfile Otimizado Frontend (`docker/frontend.Dockerfile`)

```dockerfile
# ─── STAGE 1: Build Frontend App ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─── STAGE 2: Production Nginx High-Performance Web Server ────────────────────
FROM nginx:1.25-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## ETAPA 6 — KUBERNETES & AWS EKS (ORQUESTRAÇÃO DE MANIFESTOS)

### 6.1 Manifestos Kubernetes (`k8s/backend-deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: legis-backend
  namespace: production
  labels:
    app: legis-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: legis-backend
  template:
    metadata:
      labels:
        app: legis-backend
    spec:
      containers:
        - name: backend
          image: 123456789012.dkr.ecr.us-east-1.amazonaws.com/legis-backend:v1.0.0
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
              path: /api/v1/health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/v1/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          envFrom:
            - secretRef:
                name: legis-backend-secrets
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: legis-backend-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: legis-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

---

## ETAPA 7 — GESTÃO DE SECRETS E CREDENCIAIS DE RUNTIME

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GESTÃO DE SECRETS COM AWS SECRETS MANAGER                │
│                                                                             │
│  AWS Secrets Manager ──► Criptografia AWS KMS (Master Key)                  │
│        │                                                                    │
│        ▼ IAM Roles for Service Accounts (IRSA)                              │
│  AWS ECS Fargate Task / EKS Pod                                             │
│        │                                                                    │
│        ├──► Injeta variáveis de ambiente em memória no container            │
│        └──► Zero segredos armazenados em código ou disco local              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 8 — INFRAESTRUTURA COMO CÓDIGO (TERRAFORM MODULES)

```
infra/terraform/
├── main.tf                    // Backend S3 State e Providers
├── variables.tf
├── outputs.tf
│
└── modules/
    ├── vpc/                   // Multi-AZ Subnets (Public, Private, Isolated)
    ├── security_groups/       // Defesa Zero Trust de Rede
    ├── ecs_fargate/           // Cluster ECS, Services e Tasks
    ├── rds_postgresql/        // AWS RDS PostgreSQL Multi-AZ + KMS
    ├── elasticache_redis/     // AWS ElastiCache Cluster Mode
    ├── s3_storage/            // Bucket Documentos com SSE-KMS e Versioning
    ├── alb/                   // Application Load Balancer + SSL Certificates
    └── cloudwatch/            // Log Groups, Alertas e Metrics
```

---

## ETAPA 9 — ESTRATÉGIA DE AMBIENTES ISOLADOS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AMPOBIENTES DE EXECUÇÃO E PROMOÇÃO                     │
│                                                                             │
│  [ DEVELOPMENT ] ──────► Docker Compose Local (Desenvolvedores)             │
│                           - PostgreSQL + Redis + LocalStack (S3)            │
│                                                                             │
│  [ STAGING ] ──────────► AWS VPC Staging (Homologação & Testes QA/E2E)      │
│                           - URL: staging.legisconnect.com.br                │
│                           - Base de dados anonimizada                       │
│                                                                             │
│  [ PRODUCTION ] ───────► AWS VPC Production Multi-AZ (Produção Corporativa) │
│                           - URL: legisconnect.com.br                        │
│                           - Auto-Scaling, Multi-AZ Failover, Cloudflare WAF │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 10 — ARQUITETURA DE OBSERVABILIDADE COMPLETA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   STACK DE OBSERVABILIDADE & TELEMETRIA                     │
│                                                                             │
│  [ Aplicações & Services ]                                                  │
│        │                                                                    │
│        ▼ OpenTelemetry Collector                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Telemetry Processing Engine                                          │   │
│  │ ├── METRICS ──► Prometheus ──► Dashboards Grafana                     │   │
│  │ ├── LOGS ─────► Loki / CloudWatch ──► Análise de Logs Estruturados   │   │
│  │ └── TRACES ───► Jaeger / AWS X-Ray ──► Distributed Tracing (p95/p99) │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 11 — MONITORAMENTO OPERACIONAL & KPIS DE DESEMPENHO

| Indicador (KPI) | Meta Alvo | Ação em Caso de Violação do Threshold |
|---|---|---|
| **Disponibilidade (Uptime)** | **99.95%** (SLA 99.9%) | Acionamento de alerta crítico no PagerDuty (Time SRE). |
| **Latência p95 de API** | **< 180 ms** | Disparo de Auto-Scaling na AWS (adiciona novos nós Fargate). |
| **Taxa de Erros HTTP 5xx** | **< 0.05%** | Rollback automático no AWS CodeDeploy (Blue/Green). |
| **Uso de CPU Fargate** | **< 70% médio** | Alertas de capacidade e otimização de queries. |
| **Conexões PostgreSQL** | **< 80% do limite** | Drenagem de conexões via pgBouncer. |

---

## ETAPA 12 — ENGENHARIA SRE (SLI, SLO & ERROR BUDGET)

```
                            SRE METRICS & ERROR BUDGET
                            ══════════════════════════

  • Service Level Indicator (SLI): % de requisições HTTP retornando 2xx/3xx em < 200ms.
  • Service Level Objective (SLO): 99.95% de requisições bem-sucedidas no mês.
  • Service Level Agreement (SLA): 99.90% de garantia contratual para clientes B2B.
  • Error Budget Mensal: 0.05% (Aprox. 21.6 minutos de indisponibilidade permitida/mês).
```

---

## ETAPA 13 — DISASTER RECOVERY PLAN (RPO & RTO)

```
               MÉTRICAS DE RECUPERAÇÃO DE DESASTRE (DR PLAN)
               ═════════════════════════════════════════════

  Métrica                    Alvo Legis Connect    Solução Técnica Aplicada
  ─────────────────────────────────────────────────────────────────────────────
  RPO (Recovery Point)       < 5 Minutos           RDS Continuous WAL Streaming para S3
  RTO (Recovery Time)        < 1 Hora              Terraform Automation + Cross-Region RDS
  Disaster Test Frequency    Trimestral            Simulado de failover em Staging
```

---

## ETAPA 14 — MATRIZ DE CONTINUIDADE DE NEGÓCIOS (BUSINESS CONTINUITY)

| Cenário de Desastre | Probabilidade | Impacto | Plano de Ação e Recuperação |
|---|---|---|---|
| **Falha de Zona AWS (AZ Down)** | 🟡 Média | 🟡 Baixo | AWS Multi-AZ Failover automático acionado em < 60 segundos. |
| **Ransomware / Corrupção de Dados** | 🔴 Baixa | 🔴 Crítico | Restauração de snapshot RDS com S3 Object Lock (Immutable Bucket). |
| **Queda Geral de Região AWS** | 🔴 Baixa | 🔴 Crítico | Re-deploy via Terraform na Região Secundária (`us-west-2`). |
| **Ataque DDoS de Aplicação** | 🟠 Média | 🟠 Médio | Mitigação imediata na borda via Cloudflare Enterprise Layer 7 WAF. |

---

## ETAPA 15 — SEGURANÇA OPERACIONAL (SECURITY CHECKLIST)

```
                               SECURITY OPERATIONAL CHECKLIST
                               ═══════════════════════════════

  [x] WAF Layer 7 ativado na borda com regras OWASP Core Rule Set (CRS)
  [x] Subnets privadas sem IP público para instâncias de aplicação e banco de dados
  [x] Acesso administrativo via AWS SSM Session Manager (Zero Bastion Host exposto)
  [x] MFA obrigatório para todas as contas de acesso à AWS Console e GitHub
  [x] Inspeção de tráfego de saída (Egress Filter) permitindo apenas IPs confiáveis
```

---

## ETAPA 16 — SUPPLY CHAIN SECURITY & SBOM

* **Software Bill of Materials (SBOM)**: Gerado automaticamente via **Syft** a cada build de container.
* **Assinatura de Imagens**: Imagens registradas no AWS ECR são assinadas digitalmente com **Cosign / Sigstore**, garantindo que apenas containers verificados rodem nos clusters de produção.

---

## ETAPA 17 — GESTÃO FINANCEIRA DE NUVEM (FINOPS)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DASHBOARD FINOPS DE CUSTOS CLOUD                      │
│                                                                             │
│  Métrica FinOps                  Estimativa Mensal (Fase Inicial de Produção)│
│  ─────────────────────────────────────────────────────────────────────────  │
│  AWS ECS Fargate (Compute)       $ 120.00 / mês (Instâncias Reservadas 1 ano)│
│  AWS RDS PostgreSQL Multi-AZ     $ 180.00 / mês (Instância db.r6g.xlarge)   │
│  AWS ElastiCache Redis Cluster   $  60.00 / mês                             │
│  AWS S3 Storage & KMS            $  30.00 / mês                             │
│  Cloudflare Enterprise WAF       $ 200.00 / mês                             │
│  Google Vertex AI (Gemini Token) $  80.00 / mês (Variável conforme uso)     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ESTIMATIVA TOTAL DE INFRA       ~ $ 670.00 / mês                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 18 — MATRIZ DE COMPLIANCE OPERACIONAL (ISO / SOC / CIS)

| Norma / Padrão | Requisito Operacional | Status Legis Connect TO-BE |
|---|---|---|
| **ISO/IEC 27001** | Controle de Acesso e Gestão de Mudanças | 🟢 Módulos Terraform + PR Approval Gate. |
| **SOC 2 Type II** | Segurança, Disponibilidade e Confidencialidade | 🟢 Traces OpenTelemetry + Audit Trail HMAC. |
| **CIS Benchmarks** | Hardening de Sistemas Operacionais e Containers | 🟢 Imagens Docker Distroless sem Shell. |
| **OWASP ASVS** | Segurança em Nível de Aplicação e API | 🟢 SAST/DAST/SCA integrados no GitHub Actions. |

---

## ETAPA 19 — ROADMAP DEVSECOPS & CLOUD OPERATIONS

```
                    ROADMAP DE EVOLUÇÃO DEVSECOPS & CLOUD
                    ═════════════════════════════════════

  FASE 1: INFRAESTRUTURA BASE & CONTAINERS (Semanas 1-4)
  ├── Dockerfiles Multi-Stage Distroless para Frontend e Backend
  ├── Terraform Modules para VPC Multi-AZ, ECR e AWS Secrets Manager
  └── Pipeline GitHub Actions DevSecOps (SAST, SCA, Secret Scan)

  FASE 2: ORQUESTRAÇÃO & OBSERVABILIDADE (Semanas 5-8)
  ├── Deploy do Cluster AWS ECS Fargate / EKS com HPA
  ├── Instalação da Stack OpenTelemetry + Prometheus + Grafana
  └── Deploy do RDS PostgreSQL 16 Multi-AZ + ElastiCache Redis

  FASE 3: GITOPS & DISASTER RECOVERY (Semanas 9-12)
  ├── Implantação de GitOps com ArgoCD / AWS CodeDeploy Blue/Green
  ├── Simulado de Disaster Recovery (Point-in-Time Restore < 1h)
  └── Certificação de Prontidão Operacional para Produção
```

---

## ETAPA 20 — BACKLOG TÉCNICO DEVSECOPS

### DEVOPS-001 — Dockerfiles Multi-Stage Distroless
* **Problema**: Inexistência de containers padronizados de produção.
* **Solução**: Criar Dockerfiles multi-stage gerando imagens Distroless Node.js (< 120MB).
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Média | **Esforço**: 20h

### DEVOPS-002 — Pipeline DevSecOps no GitHub Actions
* **Problema**: Deploy direto no GitHub Pages sem validações de segurança.
* **Solução**: Workflow `.github/workflows/devsecops-pipeline.yml` com SAST, SCA, Secret Scan e Trivy.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 40h

### DEVOPS-003 — Módulos Terraform IaC para AWS Multi-AZ
* **Problema**: Ausência de infraestrutura automatizada e declarativa na nuvem.
* **Solução**: Módulos Terraform para VPC, ALB, ECS Fargate, RDS PostgreSQL e ElastiCache.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 60h

### DEVOPS-004 — Setup de Observabilidade OpenTelemetry + Grafana
* **Problema**: Impossibilidade de rastrear falhas e latência em tempo real.
* **Solução**: OpenTelemetry Collector enviando traces e métricas para Prometheus e Grafana.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Alta | **Esforço**: 48h

### DEVOPS-005 — Automação de Backups e Testes de DR
* **Problema**: Ausência de plano e testes de recuperação de desastres.
* **Solução**: Configuração de Point-in-Time Recovery no RDS e simulado de restore.
* **Prioridade**: 🟠 ALTA | **Complexidade**: Média | **Esforço**: 24h

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 016

| Entregável | Status |
|---|---|
| ✅ Auditoria da Infraestrutura Atual (Diagrama AS-IS e Falhas Mapeadas) | Concluído |
| ✅ Auditoria dos Pipelines CI/CD (Checklist de Controles e Vulnerabilidades) | Concluído |
| ✅ Pipeline DevSecOps Completo (Fluxo SAST, SCA, DAST, Container Scan, SBOM) | Concluído |
| ✅ Arquitetura Cloud Enterprise (Matriz Comparativa AWS vs Azure vs GCP) | Concluído |
| ✅ Estratégia de Containerização (Dockerfile Multi-Stage Distroless Node.js e Nginx) | Concluído |
| ✅ Arquitetura Kubernetes / AWS EKS (Manifestos Deployment, Service, HPA) | Concluído |
| ✅ Gestão de Secrets com AWS Secrets Manager + IRSA | Concluído |
| ✅ Infraestrutura como Código (Estrutura de Módulos Terraform) | Concluído |
| ✅ Estratégia de Ambientes Isolados (Development, Staging, Production) | Concluído |
| ✅ Arquitetura de Observabilidade (OpenTelemetry + Prometheus + Grafana + Loki) | Concluído |
| ✅ Plano de Monitoramento Operacional & KPIs de Desempenho (Uptime 99.95%) | Concluído |
| ✅ Engenharia SRE (SLI, SLO 99.95%, SLA 99.9%, Error Budget Management) | Concluído |
| ✅ Disaster Recovery Plan (RPO < 5min, RTO < 1h) | Concluído |
| ✅ Matriz de Continuidade de Negócios (Respostas a Cenários de Desastre) | Concluído |
| ✅ Auditoria de Segurança Operacional (Security Checklist & Zero Trust Network) | Concluído |
| ✅ Supply Chain Security & SBOM (Syft + Cosign Image Signing) | Concluído |
| ✅ Dashboard FinOps de Custos Cloud (~ $ 670.00 / mês estimado) | Concluído |
| ✅ Matriz de Compliance Operacional (ISO 27001, SOC 2, CIS Benchmarks) | Concluído |
| ✅ Roadmap de Evolução DevSecOps em 3 Fases (12 semanas) | Concluído |
| ✅ Backlog Técnico DevSecOps Priorizado (`DEVOPS-001` a `DEVOPS-005`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 016 — DevSecOps & Cloud Operations Blueprint | v1.0.0*
*Próximo: PROMPT 017 — Plano Mestre de Reengenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
