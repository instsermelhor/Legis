# ADR-042 — Sprint 9: Enterprise CRM Platform, Customer Success & Growth Intelligence

**Status:** ACCEPTED  
**Date:** 2026-07-27  
**Authors:** Chief Customer Officer · Chief Revenue Officer · CRM Enterprise Architect · Customer Success Director · Growth Engineering Director · MarTech Architect  
**Supersedes:** N/A  
**Related:** ADR-041 (Financial Platform), ADR-036 (Legal Services), ADR-040 (Data Platform)

---

## Context

Sprint 9 delivers the **Enterprise CRM, Customer Success & Growth Intelligence Platform** for Legis Connect. The platform must handle:

- **Lead Management**: Multi-channel capture (web form, WhatsApp, referral, marketplace), automatic enrichment (Receita Federal CNPJ API, ViaCEP), AI-powered lead scoring (0–100), and round-robin distribution.
- **Sales Pipeline**: Configurable multi-stage funnel, win/loss tracking, revenue forecasting, and deal activity logging.
- **Customer Success Platform**: Composite health score engine (Adoption 30% + Engagement 25% + Financial 20% + Results 15% + Relationship 10%), automated CSM alerts, churn prediction.
- **Marketing Automation**: Event-driven campaign journeys (Welcome, Nurture, Re-engagement, Upsell, Churn Prevention, Referral), triggered by Kafka events across all domains.
- **Omnichannel**: 6 channels (Email/SES, SMS/Zenvia, WhatsApp Business API, Push/FCM, Web Push, In-App Chat) with per-user opt-in preferences stored per LGPD requirements.
- **Customer Data Platform (CDP)**: Real-time unified 360° profile sourced from Kafka consumers across all 8 platform domains.
- **Growth Intelligence**: CAC, LTV, NPS, NRR, Churn Rate, Expansion MRR as real-time KPIs.

All components must comply with **LGPD** (Lei 13.709/2018), **ISO 27001**, and support multi-tenant data isolation.

---

## Decision

### D1 — Lead Scoring Architecture

**Decision:** Composite score model (Behavioral 40 pts + Firmographic 30 pts + Engagement 30 pts = 100 pts max). Score recalculated on each new behavioral event via Kafka consumer. Classification: COLD (< 25), WARM (25–59), HOT (60–79), VERY_HOT (≥ 80).

**Rationale:**
- Composite scoring outperforms single-signal models in B2B SaaS contexts.
- Event-driven recalculation ensures score freshness without batch jobs.
- Threshold-based classification drives automated qualification workflows.

### D2 — Health Score Computation

**Decision:** Nightly batch recalculation + real-time delta update on significant events (session login, payment failure, support ticket opened). Materialized in `CustomerHealthScore` table. Alert triggered to Kafka when score crosses threshold boundaries (80→60, 60→40, 40→0).

**Rationale:**
- Nightly batch ensures full recalculation consistency; real-time delta prevents stale scores after critical events.
- Kafka alert decouples CS team notification from score calculation.

### D3 — Marketing Automation Engine

**Decision:** Event-driven journey engine consuming Kafka topics from all platform domains. Journeys stored as directed acyclic graphs (DAG) in the `CampaignJourney` aggregate. Step execution managed by a BullMQ/Redis queue with retry and dead-letter policies.

**Rationale:**
- Kafka consumption enables real-time journey triggers without polling.
- BullMQ provides durable, prioritised job execution with built-in retry.
- DAG model allows non-sequential journeys (conditional branching, A/B splits).

### D4 — Customer Data Platform Architecture

**Decision:** Real-time Kafka consumers for all 8 domain event streams update the `UnifiedCustomerProfile` projection in PostgreSQL (primary) and Redis (cache, TTL 5 min). Identity resolution uses deterministic matching on (userId, email, CPF/CNPJ hash).

**Rationale:**
- Deterministic identity matching avoids false merges common in probabilistic models.
- Redis caching ensures CDP profile retrieval < 45 ms P95.
- PostgreSQL as source of truth ensures LGPD portability and erasure compliance.

### D5 — Omnichannel Channel Preference & LGPD Consent

**Decision:** Each communication channel requires an explicit opt-in record in `CommunicationConsent` table (channel, purpose, consentedAt, consentIp). Campaigns are filtered against this table before dispatch. Opt-out triggers immediate suppression list update across all channel adapters.

**Rationale:**
- LGPD Art. 7 requires a valid legal basis (consent) for marketing communications.
- Per-channel, per-purpose granularity satisfies ANPD guidance on consent management.

### D6 — Growth Intelligence Data Pipeline

**Decision:** Growth KPIs computed in ClickHouse (Sprint 7 Data Platform) from financial and CRM event streams. NPS collected via in-app survey triggered at D+30, D+90, and post-consultation. NPS score stored per response with verbatim for sentiment analysis.

**Rationale:**
- ClickHouse sub-second aggregation on 1M+ daily CRM events.
- NPS collected at key lifecycle moments to maximise response relevance.

---

## Consequences

### Positive
- Sales teams gain real-time pipeline visibility and revenue forecasting.
- CS teams receive automated alerts before churn occurs (health score < 40).
- Marketing campaigns are LGPD-compliant from day one with opt-in enforcement.
- CDP enables hyper-personalised AI copilot recommendations (Sprint 6 integration).

### Negative
- WhatsApp Business API has per-message costs; mitigated by smart frequency capping.
- CDP identity resolution may miss users who registered with different emails; mitigated by CPF/CNPJ matching.

### Risks & Mitigations
| Risk | Mitigation |
|---|---|
| LGPD consent management gaps | Central `CommunicationConsent` table enforced at campaign dispatch layer |
| Health score staleness | Real-time delta updates on critical events + nightly full recalculation |
| Campaign spam / fatigue | Per-user frequency caps (max 2 emails/week, 1 WhatsApp/day) |
| CDP data consistency | Event sourcing + idempotent Kafka consumers with exactly-once semantics |

---

## Standards & Compliance

| Standard | Scope |
|---|---|
| LGPD (Lei 13.709/2018) | Consent management, data minimisation, portability, right to erasure |
| ISO 27001 | Information security controls on CRM microservices |
| WCAG 2.1 AA | Accessibility compliance for CRM portal and dashboards |
| CAN-SPAM / ABMR | Email marketing opt-out compliance |
| WhatsApp Business Policy | Approved message templates, opt-in enforcement |

---

## Architecture References

- **Sprint 9 Master Blueprint:** `docs/blueprints/enterprise_crm_platform_prompt256.md`
- **CRM Engine:** `platform/crm/crm-engine.ts`
- **CRM Schema:** `platform/crm/crm-schema.prisma`
- **Related ADRs:** ADR-036, ADR-040, ADR-041
