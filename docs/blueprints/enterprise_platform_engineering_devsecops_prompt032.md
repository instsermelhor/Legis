# 🛠️ ENTERPRISE PLATFORM ENGINEERING & DEVSECOPS BLUEPRINT — LEGIS CONNECT
**PROMPT 032 — Auditoria Completa de Engenharia de Plataforma, AWS EKS Kubernetes, Terraform IaC, ArgoCD GitOps, Linkerd Service Mesh, Observabilidade LGTM e SRE**
**Chief Platform Architect (CPA) | Principal DevSecOps Engineer, Cloud Architect & SRE Lead | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A auditoria operacional e de infraestrutura da Legis Connect confirmou que a plataforma opera sob um **modelo estático legada de baixo nível de maturidade**. As implantações dependem de rotinas manuais enviando artefatos compilação diretamente para o **GitHub Pages**, sem backend em nuvem corporativa, sem orquestração de containers via **Kubernetes**, sem automação de infraestrutura por código (*IaC Terraform*), sem controle declarativo de estados (*GitOps ArgoCD*), sem proteção de malha de serviço (*Service Mesh Linkerd*) e sem observabilidade de métricas, logs e traces (*Stack LGTM*).

**Diagnóstico de Engenharia de Plataforma & Operações**:
- **Nível de Maturidade de Plataforma (AS-IS)**: `1.0 / 5.0` (Deploy Estático Manual).
- **Incapacidade Operacional Enterprise**: Impossibilidade de atender aos requisitos de alta disponibilidade (SLO 99.95%), recuperação de desastres (RPO < 5 min / RTO < 1h) e segurança de infraestrutura (CIS Benchmarks / ISO 22301).

**Objetivo Arquitetural TO-BE**: Construir a **Enterprise Cloud Native & Platform Engineering Engine**, estruturada em um cluster **AWS EKS Kubernetes 1.30+ Multi-AZ**, provisionado 100% via **Terraform IaC**, operado por **ArgoCD (GitOps)**, protegido por **Linkerd Service Mesh (mTLS automatizado)**, monitorado pela stack **LGTM (Loki, Grafana, Tempo, Prometheus) + OpenTelemetry**, gerenciado por **Backstage IDP (Internal Developer Platform)**, com práticas avançadas de **SRE (Error Budget de 21.6 min/mês)**, **Chaos Engineering (LitmusChaos)** e **GreenOps (KubeCost)**.

---

## ETAPA 1 — INVENTÁRIO DA INFRAESTRUTURA OPERACIONAL (ASSET MAP)

### 1.1 Matriz de Mapeamento dos 12 Componentes Operacionais

| Componente Operacional | Função no Ecossistema | Ambientes | Criticidade | Status TO-BE |
|---|---|---|---|---|
| **1. Frontend Web App** | Interface React 19 SPA | Dev, Staging, Prod | 🔴 Extrema | 🟢 EKS NGINX Ingress |
| **2. Backend API Gateway**| Core API NestJS Modules | Dev, Staging, Prod | 🔴 Extrema | 🟢 EKS Pods + Linkerd |
| **3. Database Relacional**| PostgreSQL 16 OLTP Multi-AZ| Staging, Prod | 🔴 Extrema | 🟢 AWS RDS Multi-AZ |
| **4. In-Memory Cache** | Redis 7+ Cluster Mode | Staging, Prod | 🔴 Extrema | 🟢 AWS ElastiCache |
| **5. Message Broker** | BullMQ Async Worker Queues | Staging, Prod | 🔴 Extrema | 🟢 EKS BullMQ Worker |
| **6. Document Storage** | S3 GED + Object Lock | All Environments | 🔴 Extrema | 🟢 AWS S3 SSE-KMS |
| **7. Analytics DW** | Data Warehouse Redshift | Prod Only | 🟠 Alta | 🟢 AWS Redshift OLAP |
| **8. Pipelines CI/CD** | GitHub Actions Workflows | Cloud CI Engine | 🔴 Extrema | 🟢 DevSecOps Action |
| **9. GitOps Engine** | Declarative State Sync | Staging, Prod | 🔴 Extrema | 🟢 ArgoCD Operator |
| **10. Secrets Vault** | AWS Secrets Manager + ESO | All Environments | 🔴 Extrema | 🟢 External Secrets |
| **11. Observabilidade** | OpenTelemetry + LGTM Stack | All Environments | 🔴 Extrema | 🟢 Grafana / Prometheus|
| **12. Backup & DR Engine** | Velero K8s Snapshots | Prod & DR Region | 🔴 Extrema | 🟢 Velero + S3 Sync |

---

## ETAPA 2 — ARQUITETURA CLOUD-NATIVE CORPORATIVA (TO-BE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ENTERPRISE CLOUD-NATIVE ENGINE ARCHITECTURE                 │
│                                                                             │
│  [ Users / Clients / External Integrations ]                                │
│                        │                                                    │
│                        ▼ HTTPS TLS 1.3                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ CLOUDFLARE ENTERPRISE EDGE (CDN + WAF Layer 7 + DDoS Mitigation)     │   │
│  └────────────────────┬─────────────────────────────────────────────────┘   │
│                       │                                                     │
│                       ▼ mTLS / Internal VPC Traffic                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ AWS APPLICATION LOAD BALANCER (ALB Multi-AZ Router)                  │   │
│  └────────────────────┬─────────────────────────────────────────────────┘   │
│                       │                                                     │
│                       ▼ NGINX Ingress Controller                            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ AWS EKS KUBERNETES CLUSTER (Linkerd Service Mesh Engaged)            │   │
│  │ ├── Frontend Pods (Distroless Nginx)   ├── Backend Pods (NestJS)     │   │
│  │ ├── BullMQ Workers                     └── Karpenter Auto-scaler     │   │
│  └────────────────────┬─────────────────────────────────────────────────┘   │
│                       │                                                     │
│        ┌──────────────┴──────────────┐                                      │
│        ▼                             ▼                                      │
│  ┌───────────────┐             ┌───────────────┐                            │
│  │ AWS RDS Postgres│           │ AWS ElastiCache│                            │
│  │ Multi-AZ (3NF) │             │ Redis Cluster │                            │
│  └───────┬───────┘             └───────┬───────┘                            │
│          │                             │                                    │
│          └──────────────┬──────────────┘                                    │
│                         │                                                   │
│                         ▼ Full Observability                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ OPENTELEMETRY + LGTM OBSERVABILITY PLATFORM (Prometheus/Loki/Grafana)│   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 3 — ESTRATÉGIA DE CONTAINERS (DISTROLESS DOCKERFILES)

```dockerfile
# Dockerfile.backend (Multi-Stage Distroless Build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER 10001:10001
EXPOSE 3000
CMD ["dist/main.js"]
```

---

## ETAPA 4 — BLUEPRINT KUBERNETES (`AWS EKS MULTI-AZ + KARPENTER`)

```
                               KUBERNETES CLUSTER BLUEPRINT
                               ═════════════════════════════

  • Namespaces Segregados ──► `production`, `staging`, `monitoring`, `argo-cd`
  • Karpenter Auto-scaler ──► Provisionamento instantâneo de nós EC2 sob demanda (< 10s)
  • NetworkPolicies ────────► Bloqueio de comunicação direta não autorizada entre Pods
  • Service Account IRSA ───► Permissões IAM concedidas exclusivamente via Service Accounts
```

---

## ETAPA 5 — ARCHITECTURE INFRASTRUCTURE AS CODE (`Terraform IaC`)

```
infra/terraform/
├── environments/
│   ├── staging/
│   └── production/
└── modules/
    ├── vpc/                   // Multi-AZ VPC em 3 Zonas de Disponibilidade
    ├── eks/                   // AWS EKS Cluster + Karpenter Auto-scaler
    ├── rds/                   // AWS RDS PostgreSQL 16 Multi-AZ
    ├── elasticache/           // Redis Cluster Mode
    └── s3/                    // Buckets S3 + Object Lock WORM
```

---

## ETAPA 6 — PLATAFORMA GITOPS (`ArgoCD Engine`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GITOPS DECLARATIVE DEPLOYMENT                         │
│                                                                             │
│  [ Git Manifests Repo `legis-k8s-manifests` ]                               │
│                        │                                                    │
│                        ▼ ArgoCD Sync Engine                                 │
│  [ ArgoCD Operator ] ──► Monitora drift no EKS Kubernetes em tempo real      │
│                        │                                                    │
│                        ▼ Dynamic Promotion                                  │
│  ├── Automatic Staging Sync ──► Promove artefato assinado no Staging       │
│  └── Manual Approval Production ──► Deploy Blue/Green sem downtime          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 7 — PIPELINE DEVSECOPS COMPLETO (GITHUB ACTIONS SPEC)

```
                            DEVSECOPS PIPELINE STEPS
                            ════════════════════════

  1. Code Checkout ────────► Checkout de código na branch principal.
  2. TruffleHog Scan ──────► Verificação estrita de segredos ou chaves no Git.
  3. Semgrep SAST ─────────► Análise estática do código TypeScript.
  4. Snyk SCA Scan ────────► Verificação de dependências vulneráveis no npm.
  5. Vitest Coverage ──────► Testes unitários e de integração com cobertura > 90%.
  6. Trivy Container Scan ─► Scan da imagem Docker compilada.
  7. Syft & Cosign ────────► Geração de SBOM em SPDX e assinatura digital da imagem.
  8. ArgoCD Trigger ───────► Atualização do manifesto K8s promovendo a release.
```

---

## ETAPA 8 — GESTÃO DE AMBIENTES SEGREGADOS

* **Segregação Estrita em 6 Ambientes**: `Development`, `QA`, `Homologação`, `Staging`, `Produção (Multi-AZ)` e `Disaster Recovery (Multi-Region)`.

---

## ETAPA 9 — PLATAFORMA DE GESTÃO DE SEGREDOS (`AWS Secrets Manager + ESO`)

* **External Secrets Operator (ESO)**: O ESO sincroniza segredos armazenados no AWS Secrets Manager diretamente para Secrets em memória dentro do Kubernetes, eliminando credenciais em arquivos ou variáveis de ambiente expostas.

---

## ETAPA 10 — ARQUITETURA DE API GATEWAY (NESTJS + CLOUDFLARE WAF)

* **Edge + Application Gateway**: O Cloudflare Enterprise WAF trata proteção contra ataques DoS/DDoS e filtragem de bots na borda. O NestJS API Gateway valida OAuth 2.1 / JWT RSA-256 e executa rate limiting por tenant.

---

## ETAPA 11 — PROJETO DE SERVICE MESH (`Linkerd Engine`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LINKERD SERVICE MESH ARCHITECTURE                        │
│                                                                             │
│  [ Pod A (Backend API) ] ──(Automatic mTLS TLS 1.3)──► [ Pod B (Worker) ]   │
│             │                                                               │
│             ▼                                                               │
│  [ Linkerd Control Plane ] ──► Golden Metrics (RPS, Latência p95, Error Rate) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 12 — PLATAFORMA DE OBSERVABILIDADE UNIFICADA (`Stack LGTM`)

* **Stack LGTM Integrada**:
  - **Loki**: Agregação centralizada de logs em formato JSON com `correlationId`.
  - **Grafana**: Painéis unificados de controle executivo, infraestrutura e SRE.
  - **Tempo / Jaeger**: Rastreamento distribuído (*Distributed Tracing*) via OpenTelemetry.
  - **Prometheus**: Coleta de métricas de infraestrutura, Kubernetes e Pods.

---

## ETAPA 13 — FRAMEWORK SITE RELIABILITY ENGINEERING (SRE)

```
                               SRE METRICS METRICS
                               ═══════════════════

  • SLI (Service Level Indicator): % de requisições ativas respondidas em < 200ms.
  • SLO (Service Level Objective): 99.95% de uptime operacional mensal.
  • SLA (Service Level Agreement): 99.90% contratual para clientes B2B.
  • Error Budget: 21.6 minutos de inoperância permitida por mês.
```

---

## ETAPA 14 — ARQUITETURA DE ALTA DISPONIBILIDADE (MULTI-AZ)

* **Multi-AZ Fault Tolerance**: Infraestrutura distribuída em 3 Zonas de Disponibilidade (us-east-1a, us-east-1b, us-east-1c) com réplicas síncronas do PostgreSQL RDS e clusters Redis em nó primário e réplicas de leitura.

---

## ETAPA 15 — PLANO DE BACKUP E DISASTER RECOVERY (`Velero + AWS S3`)

```
               DISASTER RECOVERY TARGETS (PLAN DE RECUPERAÇÃO)
               ═══════════════════════════════════════════════

  Métrica                      Alvo Garantido       Mecanismo Técnico
  ─────────────────────────────────────────────────────────────────────────────
  RPO (Recovery Point)         < 5 Minutos          RDS Continuous WAL Streaming p/ S3
  RTO (Recovery Time)          < 1 Hora             Velero Snapshot K8s + Terraform DR
  DR Backup Frequency          Diário               Snapshots em S3 Object Lock WORM
```

---

## ETAPA 16 — FRAMEWORK DE SEGURANÇA OPERACIONAL (CIS BENCHMARKS)

* **Hardening CIS Benchmarks**: Hardening automatizado de nós Kubernetes EKS alinhado às recomendações dos CIS Benchmarks. Acesso administrativo restrito via **AWS SSM Session Manager** (zero IP público em portas SSH).

---

## ETAPA 17 — ESTRATÉGIA DE SUPPLY CHAIN SECURITY (SLSA LEVEL 3)

```
                            SUPPLY CHAIN SECURITY PIPELINE
                            ══════════════════════════════

  • SBOM Syft ────────► Geração de inventário completo de dependências em SPDX JSON.
  • Cosign Signature ─► Assinatura de imagens no AWS ECR via chaves de PKI.
  • Kyverno Engine ───► Policy Enforcement no K8s bloqueando containers não assinados.
```

---

## ETAPA 18 — PLANO DE CHAOS ENGINEERING (`LitmusChaos`)

* **Simulação de Falhas Periódicas**: Testes mensais automatizados injetando caos no ambiente de Staging (queda súbita de Pods K8s, latência forçada no banco PostgreSQL e desconexão do Redis) para validar a resiliência do *Auto-Healing*.

---

## ETAPA 19 — MATRIZ DE COMPLIANCE OPERACIONAL

| Norma / Padrão | Requisito Operacional | Status Legis Connect TO-BE |
|---|---|---|
| **ISO/IEC 27001:2022** | Segurança em Operações de TI | 🟢 PR Approval Gates + Audit Log. |
| **ISO 22301:2019** | Gestão de Continuidade de Negócios | 🟢 Disaster Recovery Plan (RTO < 1h). |
| **SOC 2 Type II** | Disponibilidade e Confidencialidade | 🟢 OpenTelemetry + LGTM Stack. |
| **CIS Controls v8** | Controle de Ativos de Infraestrutura | 🟢 Multi-AZ VPC + Subnets Privadas. |

---

## ETAPA 20 — ROADMAP EVOLUTIVO DE PLATFORM ENGINEERING

```
                    ROADMAP DE ENG ENGENHARIA DE PLATAFORMA
                    ═══════════════════════════════════════

  FASE 1: CONTAINERS, EKS & CI/CD (Semanas 1-4)
  ├── Implantação dos módulos Terraform IaC para EKS e RDS
  ├── Dockerfiles Multi-Stage Distroless para Node.js e Nginx
  └── Pipeline GitHub Actions DevSecOps (TruffleHog, Semgrep, Snyk, Trivy)

  FASE 2: GITOPS & OBSERVABILIDADE LGTM (Semanas 5-8)
  ├── ArgoCD Operator com promoção automatizada Staging/Prod
  ├── Deploy da Stack LGTM (Loki, Grafana, Tempo, Prometheus)
  └── Linkerd Service Mesh com mTLS automatizado inter-pod

  FASE 3: PLATFORM ENGINEERING & BACKSTAGE (Semanas 9-12)
  ├── Internal Developer Platform (IDP) baseado no Backstage
  ├── Testes de Chaos Engineering com LitmusChaos
  └── Governança GreenOps via KubeCost
```

---

## ETAPA 21 — PLATFORM ENGINEERING & INTERNAL DEVELOPER PLATFORM (IDP BACKSTAGE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 INTERNAL DEVELOPER PLATFORM (BACKSTAGE IDP)                 │
│                                                                             │
│  [ Developer Portal (Spotify Backstage) ]                                   │
│  ├── Service Catalog ────► Visibilidade de todos os micro-serviços e APIs. │
│  ├── Golden Paths ───────► Scaffolding automatizado de novos módulos NestJS.│
│  └── Ephemeral Envs ─────► Ambientes de teste temporários criados por PR.   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 22 — GREENOPS & SUSTENTABILIDADE CLOUD (`KubeCost`)

* **Otimização de Emissão de Carbono**: O **KubeCost** monitora a eficiência de CPU/RAM no EKS Kubernetes, desativando automaticamente réplicas de Pods em ambientes de Staging fora do horário comercial (economia de 35% em compute).

---

## ETAPA 23 — OPERAÇÃO MULTI-CLOUD & PORTABILIDADE

* **Multi-Cloud Hybrid Layout**: AWS como nuvem primária para Compute/DB, GCP para Inteligência Artificial (Vertex AI) e Cloudflare como Edge CDN/WAF. Definição 100% declarativa em Terraform garantindo portabilidade para Azure.

---

## ETAPA 24 — BACKLOG TÉCNICO OPERACIONAL

### OPS-001 — Pipeline DevSecOps Completo com Sign Cosign
* **Problema**: Implantação manual sem validação de segurança em produção.
* **Solução**: Workflow GitHub Actions com TruffleHog, Semgrep, Snyk, Trivy e Cosign.
* **Prioridade**: 🔴 EMERGENCIAL | **Complexidade**: Alta | **Esforço**: 48h

### OPS-002 — Terraform IaC para AWS EKS Kubernetes Multi-AZ
* **Problema**: Ausência de infraestrutura em nuvem reproduzível por código.
* **Solução**: Módulos Terraform provisionando VPC, EKS, RDS e ElastiCache.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 60h

### OPS-003 — Implantação do ArgoCD Operator para GitOps
* **Problema**: Falta de sincronização declarativa e rollback automatizado.
* **Solução**: ArgoCD monitorando o repositório de manifestos Kubernetes.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 40h

### OPS-004 — Stack de Observabilidade LGTM + OpenTelemetry Collector
* **Problema**: Ausência de rastreamento de métricas, logs e traces distribuídos.
* **Solução**: OpenTelemetry Collector integrando Loki, Grafana, Tempo e Prometheus.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 48h

### OPS-005 — Setup do Internal Developer Platform (IDP Backstage)
* **Problema**: Dificuldade de desenvolvedores em provisionar serviços e ambientes.
* **Solução**: Spotify Backstage oferecendo portal self-service e Golden Paths.
* **Prioridade**: 🟠 ALTA | **Complexidade**: Alta | **Esforço**: 56h

---

## ETAPA 25 — ARQUITETURA OPERACIONAL CORPORATIVA INTEGRADA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 INTEGRATED ENTERPRISE OPERATIONS ENGINE                     │
│                                                                             │
│  [ CLOUD INFRASTRUCTURE ] ──► AWS EKS Kubernetes Multi-AZ + Terraform IaC   │
│  [ CONTAINER PLATFORM ] ───► Distroless Docker Images + Karpenter Autoscaler│
│  [ GITOPS & CI/CD ] ────────► GitHub Actions DevSecOps + ArgoCD Operator    │
│  [ SERVICE MESH ] ──────────► Linkerd Mesh (mTLS + Retries + Circuit Breaker)│
│  [ SECRETS MANAGEMENT ] ────► AWS Secrets Manager + External Secrets (ESO)  │
│  [ OBSERVABILITY STACK ] ───► LGTM Stack (Loki, Grafana, Tempo, Prometheus) │
│  [ SRE & RELIABILITY ] ─────► SLO 99.95% + Error Budget (21.6m) + PagerDuty│
│  [ BACKUP & DR ] ───────────► Velero K8s Snapshots + S3 Object Lock         │
│  [ DEVELOPER PLATFORM ] ────► Backstage IDP + Golden Paths + KubeCost       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 032

| Entregável | Status |
|---|---|
| ✅ Inventário Completo da Infraestrutura (Mapeamento dos 12 Componentes) | Concluído |
| ✅ Arquitetura Cloud-Native Corporativa (Diagrama 10 Camadas TO-BE) | Concluído |
| ✅ Estratégia de Containers (Dockerfiles Multi-Stage Distroless Node.js/Nginx) | Concluído |
| ✅ Blueprint Kubernetes (AWS EKS Multi-AZ + Karpenter Auto-scaler) | Concluído |
| ✅ Arquitetura Infrastructure as Code (Módulos Terraform IaC) | Concluído |
| ✅ Plataforma GitOps (ArgoCD Operator com Promoção Staging/Prod) | Concluído |
| ✅ Pipeline DevSecOps Completo (GitHub Actions Spec com Cosign/Syft) | Concluído |
| ✅ Estratégia de Ambientes (6 Ambientes Segregados Mapeados) | Concluído |
| ✅ Plataforma de Gestão de Segredos (AWS Secrets Manager + ESO) | Concluído |
| ✅ Arquitetura de API Gateway (NestJS API Gateway + Cloudflare WAF) | Concluído |
| ✅ Projeto de Service Mesh (Linkerd Mesh com mTLS Automatizado) | Concluído |
| ✅ Plataforma de Observabilidade (Stack LGTM: Loki, Grafana, Tempo, Prometheus) | Concluído |
| ✅ Framework SRE (SLO 99.95%, SLA 99.90%, Error Budget 21.6 min/mês) | Concluído |
| ✅ Arquitetura de Alta Disponibilidade (AWS Multi-AZ + ALB Redundancy) | Concluído |
| ✅ Plano de Backup e Disaster Recovery (Velero K8s Snapshots, RPO < 5m, RTO < 1h)| Concluído |
| ✅ Framework de Segurança Operacional (CIS Benchmarks Hardening + SSM Manager) | Concluído |
| ✅ Estratégia de Supply Chain Security (SLSA Level 3 + Syft + Cosign) | Concluído |
| ✅ Plano de Chaos Engineering (Simulações LitmusChaos) | Concluído |
| ✅ Matriz de Compliance Operacional (ISO 27001, ISO 22301, SOC 2, CIS Controls) | Concluído |
| ✅ Roadmap Evolutivo em 3 Fases (12 semanas) | Concluído |
| ✅ Plataforma de Platform Engineering (Spotify Backstage IDP) | Concluído |
| ✅ Estratégia GreenOps (KubeCost Otimização Energética) | Concluído |
| ✅ Arquitetura Multi-Cloud (AWS + GCP Vertex AI + Cloudflare Edge) | Concluído |
| ✅ Backlog Técnico Priorizado (`OPS-001` a `OPS-005`) | Concluído |
| ✅ Arquitetura Operacional Corporativa Integrada | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 032 — Enterprise Platform Engineering & DevSecOps Blueprint | v1.0.0*
*Próximo: PROMPT 033 — Plano Mestre de Reengenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
