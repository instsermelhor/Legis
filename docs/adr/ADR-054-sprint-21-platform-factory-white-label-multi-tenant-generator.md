# ADR-054 — Sprint 21 / Replication: Enterprise Platform Factory, White Label Architecture & AI Platform Generator

**Status:** ACCEPTED  
**Date:** 2026-07-28  
**Authors:** Chief Platform Officer · Chief Enterprise Architect · Chief Product Officer · Software Factory Director  
**Supersedes:** N/A  
**Related:** ADR-001 to ADR-053 (All previous Sprints & LCERA Reference Architecture)

---

## Context

Following the consolidation of the Legis Connect Enterprise Reference Architecture (LCERA v1.0) in Prompt 267, Prompt 268 establishes the **Enterprise Platform Factory**, transforming Legis Connect into a Platform-as-a-Product (PaaP) engine capable of generating multi-tenant, white-label vertical platforms (LegalTech, AccountingTech, HealthTech, GovTech) reusing up to 85% of core code and infrastructure.

---

## Factory Architectural Decisions

### D1 — Extraction of the Reusable Core Platform Kernel

**Decision:** Isolate Identity (IAM), Observability (OTel), Event Mesh (Kafka), Multi-Tenant Persistence (Aurora/Redis), AI Engine, and Billing into an immutable Core Platform Kernel.

**Rationale:**
- Eliminates code duplication across vertical products and guarantees consistent security, reliability, and compliance across all derived platforms.

### D2 — AI Platform Generator & Declarative Infrastructure Engine

**Decision:** Build an AI Platform Generator Engine that interprets natural language specifications from architects and automatically outputs OpenTofu manifests, Helm Charts, Prisma extension schemas, and Cloudflare Anycast routing configurations in < 90 seconds.

**Rationale:**
- Reduces time-to-market for new vertical platforms from months to days.

### D3 — White-Label Profile Configuration over Code Customization

**Decision:** Implement white-label customizations (branding, themes, enabled modules, custom domains) purely through dynamic JSON configuration profiles stored in the Core Database and rendered at runtime.

**Rationale:**
- Prevents code branching per client or vertical, preserving a single unified codebase.

---

## Architecture References

- **Platform Factory Master Blueprint:** `docs/blueprints/enterprise_platform_factory_prompt268.md`
- **Factory Engine:** `platform/factory/platform-factory-engine.ts`
- **Factory Schema:** `platform/factory/platform-factory-schema.prisma`
