# ADR-047 — Sprint 14: Global Platform, Multi-Region Active-Active, Multi-Cloud & Disaster Recovery

**Status:** ACCEPTED  
**Date:** 2026-07-27  
**Authors:** Chief Cloud Officer · Global Infrastructure Architect · Enterprise Cloud Architect · SRE Director  
**Supersedes:** N/A  
**Related:** ADR-043 (GRC), ADR-044 (Integration), ADR-045 (Mobile), ADR-046 (Reliability)

---

## Context

Sprint 14 delivers the **Enterprise Global Platform** for Legis Connect. The platform must handle:

- **Multi-Region Active-Active Architecture**: Deployment across 3 continents — LATAM (`sa-east-1` São Paulo), North America (`us-east-1` N. Virginia), and Europe (`eu-west-1` Ireland/Frankfurt) with cross-region read replication (< 1s lag).
- **Multi-Cloud Abstraction Strategy**: AWS as Primary cloud provider, coupled with Crossplane/OpenTofu orchestration to support automatic fallback to Google Cloud (GCP) or Azure within 3 minutes in event of full AWS provider outage.
- **Disaster Recovery (RTO < 1 min, RPO = 0)**: Automated cross-region failover via Cloudflare Anycast DNS and Aurora Global Database with point-in-time recovery and WORM backups.
- **Sovereign Cloud & Jurisdiction Guardrails**: Open Policy Agent (OPA) data boundary enforcement ensuring Brazilian data (LGPD) remains in `sa-east-1`, EU data (GDPR) in `eu-west-1`, and US data (CCPA/SOC2) in `us-east-1`.
- **Edge Computing & Global Traffic Routing**: Cloudflare Anycast DNS + Workers executing JWT validation and rate limiting at the edge (< 5ms latency).

---

## Decisions

### D1 — Multi-Region Active-Active with Home-Region Writes

**Decision:** Adopt an Active-Active deployment model where reads are served from the nearest geographical region, and writes are routed to the Tenant's primary Home Region. Cross-region data synchronization achieved via Aurora Global Database and Kafka MSK Replicator.

**Rationale:**
- Complies strictly with national data sovereignty laws (LGPD Art. 33 / GDPR Chapter V).
- Eliminates multi-primary database write conflict complexities while achieving < 40ms global read latencies.

### D2 — Vendor-Neutral IaC with OpenTofu & Crossplane

**Decision:** Standardize all cloud infrastructure definitions on OpenTofu and Crossplane. Define composite K8s and Database resources (XRDs) that instantiate native AWS or GCP resources interchangeably.

**Rationale:**
- Prevents cloud vendor lock-in and allows seamless multi-cloud failover.

### D3 — Cloudflare Anycast + Edge Execution

**Decision:** Route all global traffic through Cloudflare Anycast network. Perform JWT validation, WAF rule checking, and response caching directly on Cloudflare Workers edge nodes.

**Rationale:**
- Blocks malicious traffic and invalid tokens before they hit the cloud origin API Gateways, reducing origin compute load and latency.

---

## Architecture References

- **Sprint 14 Master Blueprint:** `docs/blueprints/enterprise_global_platform_prompt261.md`
- **Global Engine:** `platform/global/global-engine.ts`
- **Global Schema:** `platform/global/global-schema.prisma`
