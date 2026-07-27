# PROMPT 052 — Enterprise Cloud Infrastructure, DevOps & SRE Blueprint
## Legis Connect · Chief Technology Officer (CTO) · Enterprise Cloud Architect · Lead SRE & DevOps
### Versão 1.0 | Classificação: CONFIDENCIAL | Data: 2026-07-25

---

## PREFÁCIO EXECUTIVO

Este blueprint estabelece a **Arquitetura Corporativa de Infraestrutura Nuvem, DevOps, SRE e Alta Disponibilidade (Enterprise Cloud Platform) da Legis Connect TO-BE**, consolidando 25 domínios cruciais de AWS Cloud Native Landing Zone, Orquestração de Containers em Kubernetes (AWS EKS com Karpenter Autoscaler), Infrastructure as Code (Terraform), GitOps CI/CD (GitHub Actions + ArgoCD), Observabilidade Unificada LGTM (Grafana, Loki, Prometheus, Tempo), Site Reliability Engineering (SLOs 99.99%), Disaster Recovery (RTO < 15min / RPO ~0) e Cloud FinOps.

**Estado AS-IS:** Maturidade de Infraestrutura `1.1 / 5.0` (Inexistente / Hospedagem Estática) — aplicação React SPA hospedada em ambiente estático sem backend, persistência local volátil (`localStorage`), ausência de pipelines CI/CD automatizados, sem monitoramento de métricas/logs e sem capacidade de suportar usuários concorrentes.

**Estado TO-BE:** Maturidade de Infraestrutura `4.9 / 5.0` (Enterprise Cloud Platform) — Landing Zone AWS Multi-Account, EKS Cluster Multi-AZ com Karpenter Autoscaler, Database RDS PostgreSQL 16 Multi-AZ com Read Replicas, Redis Cluster Caching, CDN CloudFront com WAF, GitOps com ArgoCD e Terraform, Observabilidade OpenTelemetry + Grafana, SLOs de 99.99% de disponibilidade e suporte a 1.000.000+ usuários ativos.

---

## ETAPA 1 — AUDITORIA DA INFRAESTRUTURA ATUAL (AS-IS vs. TO-BE)

### 1.1 Matriz de Componentes de Infraestrutura

| Componente | Estado Atual (AS-IS) | Risco Detectado | Evolução Recomendada (TO-BE) |
|---|---|---|---|
| **Hospedagem** | Servidor estático simples | Sem backend, limite de concorrência | AWS EKS Multi-AZ + CloudFront CDN |
| **Banco de Dados** | `localStorage` no browser | Perda de dados e zero concorrência | PostgreSQL 16 RDS Multi-AZ + Read Replicas |
| **CI/CD Pipeline** | Deploy manual de arquivos | Falha humana e ausência de testes | GitHub Actions + ArgoCD GitOps |
| **IaC Automation** | Configuração manual | Drift de ambiente e falta de padronização| Terraform / OpenTofu Modules no S3/DynamoDB |
| **Observabilidade** | Inexistente (Console.log) | Impossibilidade de diagnosticar erros | LGTM Stack (Grafana/Loki/Prometheus/Tempo)|

---

## ETAPA 2 — COMPARATIVO CLOUD ENTERPRISE & SELEÇÃO DE PROVEDOR

| Critério de Comparação | AWS (Amazon Web Services) | Microsoft Azure | Google Cloud Platform (GCP) |
|---|---|---|---|
| **Escalabilidade & EKS** | Excelente (EKS + Karpenter Native) | Muito Boa (AKS) | Excelente (GKE) |
| **Segurança & Isolation**| Líder de Mercado (Control Tower / Vault)| Muito Boa (Entra ID) | Boa (Google IAM) |
| **Ecossistema LegalTech**| Maior aceitação em escritórios | Boa integração MS Office | Forte em BigQuery/AI |
| **Decisão de Arquitetura**| **PROVEDOR SELECIONADO (AWS)** | Recomendado para suporte MS | Utilizado para BigQuery ML |

---

## ETAPA 3 — CLOUD LANDING ZONE & NETWORK ARCHITECTURE

```
                      AWS CONTROL TOWER LANDING ZONE
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
[SECURITY ACCOUNT]           [PRODUCTION ACCOUNT]         [STAGING / DEV ACCOUNT]
 • AWS GuardDuty & KMS       • EKS Multi-AZ Cluster       • EKS Staging Cluster
 • Centralized IAM Identity  • RDS PostgreSQL Multi-AZ    • RDS Single-AZ Staging
 • AWS WAF & CloudTrail      • AWS S3 Object Storage      • Mocked External Services
```

```
[INTERNET] ──> [AWS WAF + CLOUDFRONT CDN] ──> [APPLICATION LOAD BALANCER (ALB)]
                                                         │
                                                         ▼
                                       [AWS VPC MULTI-AZ (us-east-1)]
 ┌───────────────────────────────────────────────────────┴───────────────────────────────────────────────────────┐
 │ PUBLIC SUBNET: NAT Gateways & ALB Target Groups                                                              │
 │ PRIVATE SUBNET (EKS Nodes): Frontend Pods, API Pods, Worker Pods, AI Gateway (Security Groups Enforced)      │
 │ DATABASE SUBNET: RDS PostgreSQL 16 Multi-AZ Master/Replica & Redis Cluster (Isolamento Total de Rede)        │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 4 — KUBERNETES ARCHITECTURE & AUTOSCALING (AWS EKS + KARPENTER)

```
AWS EKS CLUSTER ARCHITECTURE
├── NAMESPACE: ingress-sys ──> Kong API Gateway WAF & Cert-Manager (Let's Encrypt)
├── NAMESPACE: legis-prod  ──> NestJS API Pods, Worker Pods, Legis Copilot Services
├── NAMESPACE: monitoring  ──> Prometheus, Grafana, Loki Agent, OpenTelemetry Collector
└── AUTOSCALING ENGINE     ──> Karpenter (Provisionamento instantâneo de nós EC2 Spot/On-Demand)
```

---

## ETAPA 5 — GITOPS CI/CD ENTERPRISE PIPELINE (GITHUB ACTIONS + ARGOCD)

```
[DEVELOPER COMMIT] ──> [1. SAST / SCA SCAN (SonarQube/Trivy)] ──> [2. BUILD & PUSH DOCKER ECR]
                                                                        │
                                                                        ▼
[KUBERNETES PROD DEPLOY] <── [4. ARGOCD SYNC] <── [3. UPDATE HELM / KUSTOMIZE GIT REPO]
```

---

## ETAPA 6 — OBSERVABILIDADE UNIFICADA (LGTM STACK & OPENTELEMETRY)

```
APPLICATION / INFRA ──> [OPENTELEMETRY COLLECTOR]
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
[PROMETHEUS (Metrics)]   [LOKI (Logs Centralizados)] [TEMPO (Traces Distribuídos)]
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
              [GRAFANA UNIFIED DASHBOARD & PAGERDUTY]
```

---

## ETAPA 7 — SITE RELIABILITY ENGINEERING (SRE & SLOs 99.99%)

### 7.1 Definindo Service Level Objectives (SLOs)

| Serviço Criítico | Métrica (SLI) | Target SLO | Error Budget Mensal |
|---|---|---|---|
| **Autenticação & IAM** | Taxa de respostas HTTP 2xx/3xx | **99.99%** | 4.38 minutos de downtime |
| **API Backend Core** | Latência P95 < 200ms | **99.95%** | 21.9 minutos de latência alta |
| **Copiloto RAG de IA** | Sucesso no envio de chunks RAG | **99.90%** | 43.8 minutos de erro RAG |
| **Uploads de GED (S3)**| Sucesso de escrita S3 Object Lock | **99.99%** | 4.38 minutos de erro S3 |

---

## ETAPA 8 — DISASTER RECOVERY & CONTINUIDADE DE NEGÓCIOS (RTO/RPO)

| Cenário de Falha | Mecanismo de Failover | Target RTO | Target RPO |
|---|---|---|---|
| Queda de Instância EC2 | Kubernetes Pod Relocation / Karpenter | < 10 segundos | ~0 |
| Queda de AZ AWS | RDS Multi-AZ Auto-Failover + EKS Multi-AZ | < 1 minuto | ~0 (Síncrono) |
| Corrupção de Banco | Restauração Point-in-Time (PITR) RDS | < 15 minutos | < 5 minutos |
| Ataque Ransomware | S3 Object Lock (WORM Imutável) + Air-Gapped Backup | < 30 minutos | ~0 |

---

## ETAPA 9 — CLOUD FINOPS & COST OPTIMIZATION

- **Rateamento de Custos:** Tagging obrigatório `Environment`, `Squad` e `workspace_id` em todos os recursos AWS.
- **Estratégia de Instâncias:** Uso de 70% EC2 Spot para workers assíncronos e 30% Savings Plans de 3 anos para nós mestres EKS e banco RDS.
- **Alocação de IA:** Budget Alerts no AWS Budgets acionando travas automáticas caso os custos excedam 15% do forecast mensal.

---

## ETAPA 10 — BACKLOG TÉCNICO DE INFRAESTRUTURA CLOUD & SRE

---

### INFRA-001 — Deploy da Landing Zone AWS e Módulos Terraform

**Problema:** Ausência de infraestrutura corporativa provisionada como código.

**Impacto:** Risco de configuração manual inconsistente e falta de ambientes segregados.

**Solução:** Implantar a AWS Landing Zone Multi-Account com módulos Terraform salvos em S3/DynamoDB.

**Prioridade:** CRÍTICA | **Complexidade:** Alta | **Estimativa:** 6 semanas

---

### INFRA-002 — Orquestração de Containers EKS com Karpenter Autoscaler

**Problema:** Aplicação sem orquestração de containers ou capacidade de autoscale em momentos de pico.

**Impacto:** Lentidão ou queda do sistema durante picos de acessos judiciais (ex: abertura de prazos).

**Solução:** Implantar cluster AWS EKS Multi-AZ com Karpenter provisionando instâncias dinâmicas em < 30s.

**Prioridade:** CRÍTICA | **Complexidade:** Alta | **Estimativa:** 6 semanas

---

### INFRA-003 — Esteira GitOps com GitHub Actions e ArgoCD

**Problema:** Deploy manual sem testes ou rastreabilidade de alterações de código.

**Impacto:** Alto risco de indisponibilidade em produção por deploys quebrados.

**Solução:** Implementar pipeline GitOps com GitHub Actions executando SAST/DAST e ArgoCD sincronizando o EKS.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

### INFRA-004 — Stack de Observabilidade LGTM e Alertas PagerDuty

**Problema:** Falta de visibilidade sobre erros, métricas de CPU/Memória ou rastreamento de chamadas.

**Impacto:** Tempo longo de diagnóstico (MTTR > 4 horas) e dependência de queixas de usuários.

**Solução:** Deploy do OpenTelemetry Collector alimentando Grafana, Loki, Prometheus e Tempo com PagerDuty 24/7.

**Prioridade:** ALTA | **Complexidade:** Média-Alta | **Estimativa:** 5 semanas

---

### INFRA-005 — Plano de Disaster Recovery Cross-Region e S3 WORM

**Problema:** Ausência de backup imutável contra ransomware e plano de recuperação testado.

**Impacto:** Perda irreversível de documentos processuais e indisponibilidade prolongada.

**Solução:** Configurar replicação RDS PITR, backups em S3 Object Lock (WORM) e testes de DR semestrais.

**Prioridade:** ALTA | **Complexidade:** Média | **Estimativa:** 4 semanas

---

## ETAPA 11 — ARQUITETURA FINAL DE INFRAESTRUTURA CLOUD ENTERPRISE

```
LEGIS CONNECT — INTEGRATED ENTERPRISE CLOUD ARCHITECTURE
Versão 1.0 — Julho 2026

[TRÁFEGO GLOBAL E EDGE SECURITY]
Cloudflare WAF / Edge Workers ──> AWS CloudFront CDN ──> AWS WAF
          ↓
[INGRESS & LOAD BALANCING]
AWS Application Load Balancer (ALB) ──> Kong API Gateway (EKS Ingress Controller)
          ↓
[ORQUESTRADOR DE CONTAINERS (AWS EKS MULTI-AZ)]
 ├── Microservices: NestJS API Pods · Legis Copilot AI Pods · Background Workers
 └── Autoscaling: Karpenter Engine (Dynamically Provisioning EC2 On-Demand/Spot)
          ↓
[DADOS & STORAGE PERSISTENTE]
PostgreSQL 16 RDS Multi-AZ (Master/Replica) · Redis Cluster · AWS S3 Object Lock (WORM)
          ↓
[GITOPS, IA C & OBSERVABILIDADE SRE (TRANSVERSAL)]
Terraform IaC · GitHub Actions · ArgoCD GitOps · LGTM Stack (Grafana/Loki/Prometheus/Tempo)
SLOs 99.99% · RTO < 15min / RPO ~0 · AWS FinOps Savings Plans
```

---

*Enterprise Cloud Infrastructure, DevOps & SRE Blueprint v1.0*
*Chief Technology Officer · Lead SRE & Cloud Architect · Legis Connect · 2026*
