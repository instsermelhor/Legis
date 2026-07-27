# ADR-046 — Sprint 13: Enterprise Observability Platform, SRE, AIOps, FinOps & GreenOps

**Status:** ACCEPTED  
**Date:** 2026-07-27  
**Authors:** Chief Reliability Officer · SRE Director · Enterprise Observability Architect · Platform Engineering Director  
**Supersedes:** N/A  
**Related:** ADR-043 (GRC), ADR-044 (Integration), ADR-045 (Mobile)

---

## Context

Sprint 13 delivers the **Enterprise Observability & Reliability Platform** for Legis Connect. The platform must handle:

- **OpenTelemetry Standard**: Unified metrics, traces, and logs across 12 domain microservices, Mobile (iOS/Android/PWA), Frontend, Databases, and Infrastructure with PII redaction filters.
- **Site Reliability Engineering (SRE)**: Definition of SLIs, SLOs, SLAs, Error Budgets, and Burn Rate alerts (14.4x / 6x / 1x) based on Google SRE principles.
- **AIOps & Self-Healing**: Isolation Forest anomaly detection, graph-based causal event correlation, noise reduction (>85%), and automated remediations (auto-restart, auto-scale, failover).
- **Chaos Engineering**: LitmusChaos framework executing 12 resilience scenarios (Pod delete, latency, DB failover) to validate system self-recovery.
- **FinOps & GreenOps**: Cloud cost attribution per tenant/service/AI query, automated savings recommendations ($2.15k/mo), and carbon footprint monitoring (CO₂e) with green compute policies.

---

## Decisions

### D1 — OpenTelemetry as the Unified Telemetry Standard

**Decision:** Adopt OpenTelemetry (OTel) SDKs and DaemonSet Collectors for all applications and infrastructure. Traces exported to Grafana Tempo/Jaeger, Metrics to Prometheus/Thanos, and Logs to Grafana Loki.

**Rationale:**
- Vendor-neutral CNCF standard avoids lock-in and allows seamless switching of backend visualization tools.
- Centralized OTel Collector enables automatic PII scrubbing before data leaves the cluster.

### D2 — SRE Error Budget Policy & Release Freeze

**Decision:** Enforce Google SRE Error Budget policies. If a service consumes >90% of its monthly Error Budget, feature deployments are automatically frozen via ArgoCD/Flagger until the budget recovers.

**Rationale:**
- Aligns engineering incentive with system stability, preventing premature releases during instability.

### D3 — Automated Self-Healing with KEDA & Custom Operators

**Decision:** Implement automated self-healing triggers for recurring low-risk operational failures (Pod OOM, queue lag, circuit breaker opens). Remediations executed by KEDA and custom Kubernetes operators with strict safety caps.

**Rationale:**
- Reduces MTTR from minutes to seconds and auto-resolves >60% of non-critical operational alerts.

---

## Architecture References

- **Sprint 13 Master Blueprint:** `docs/blueprints/enterprise_observability_platform_prompt260.md`
- **Reliability Engine:** `platform/reliability/reliability-engine.ts`
- **Reliability Schema:** `platform/reliability/reliability-schema.prisma`
