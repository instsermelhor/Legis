# ADR-043 — Sprint 10: Enterprise GRC Platform, LGPD Enterprise & Business Continuity

**Status:** ACCEPTED  
**Date:** 2026-07-27  
**Authors:** Chief Governance Officer · Chief Compliance Officer · Chief Risk Officer · CISO · Internal Audit Director · Enterprise Architect  
**Supersedes:** N/A  
**Related:** ADR-041 (Financial), ADR-042 (CRM), ADR-037 (Secure Communication), ADR-034 (Identity)

---

## Context

Sprint 10 delivers the **Enterprise GRC Platform** for Legis Connect. The platform must handle:

- **Enterprise Risk Management (ERM)**: ISO 31000 risk matrix (5×5 likelihood × impact), 7 risk categories, automated risk scoring, mitigation tracking, and escalation workflows.
- **Compliance Platform**: Continuous compliance monitoring for LGPD, ISO 27001 (114 controls), PCI DSS 4.0, ISO 22301, and OAB regulations — with evidence linkage, corrective action plans, and compliance dashboards.
- **LGPD DPO Platform**: Complete data protection officer tooling — ROPA (Record of Processing Activities), DPIA (Data Protection Impact Assessment), 5 data subject rights (Art. 18), 72-hour breach notification (Art. 48), and consent lifecycle management.
- **Internal Control Framework (COSO ERM)**: 5 COSO components, Segregation of Duties (SoD) matrix, 4-eyes approval controls, and Continuous Control Monitoring (CCM) via Kafka consumers.
- **Enterprise Audit Platform**: 5-phase audit lifecycle (Planning → Fieldwork → Reporting → Follow-up → Closure), findings severity classification (CRITICAL/HIGH/MEDIUM/LOW/INFO), action plan tracking.
- **Business Continuity (ISO 22301)**: BIA-driven RTO/RPO definitions, warm standby configurations, DR test automation, and BCP activation workflows.
- **Cyber Resilience (NIST CSF 2.0)**: 6-function implementation (GOVERN, IDENTIFY, PROTECT, DETECT, RESPOND, RECOVER), incident severity (P1–P4), and automated playbook orchestration.
- **Policy Management**: 8-stage lifecycle with digital acceptance, semantic versioning, and mandatory review alerts.
- **Third-Party Risk**: 3-tier supplier classification with BitSight continuous monitoring.

---

## Decision

### D1 — Risk Scoring Engine

**Decision:** Automated risk score = Likelihood (1–5) × Impact (1–5). Thresholds: CRITICAL ≥ 20, HIGH ≥ 12, MEDIUM ≥ 6, LOW < 6. Risk register updated in real-time via domain events; automatic escalation to CISO/CRO if CRITICAL risk has no mitigation plan within 72 hours.

**Rationale:**
- ISO 31000 5×5 matrix is industry standard for enterprise risk assessment.
- Kafka-driven escalation ensures no critical risk remains unaddressed without human acknowledgment.

### D2 — LGPD Compliance Architecture

**Decision:** Central `ProcessingActivity` catalog (ROPA) owned by the GRC service. Each Sprint's domain registers its processing activities on startup via `grc.lgpd.processing_activity.registered.v1` Kafka event. DSAR requests fulfilled by aggregating data from all 8 domain services via orchestrated gRPC calls, completing < 10 seconds for a single data subject.

**Rationale:**
- ANPD requires ROPA to be maintained and auditable.
- Orchestrated gRPC (vs. direct DB access) ensures each domain's LGPD compliance logic is respected.
- 10-second SLA for DSAR export far exceeds the LGPD 15-working-day requirement.

### D3 — Internal Controls (COSO) Architecture

**Decision:** Controls stored as `InternalControl` entities with type (PREVENTIVE/DETECTIVE/CORRECTIVE), frequency (CONTINUOUS/DAILY/MONTHLY/QUARTERLY/ANNUAL), automated test specification, and last test result. Continuous Control Monitoring (CCM) implemented as Kafka consumer evaluating critical controls on each relevant domain event.

**Rationale:**
- CCM reduces control testing lag from months (periodic audit) to seconds (event-driven).
- Structured control definitions enable automated evidence collection for ISO 27001 and SOC 2.

### D4 — Audit Evidence Integrity

**Decision:** All audit evidence files stored with SHA-256 hash computed at upload, CRYSTALS-Dilithium-3 (PQC) digital signature, and optional Hyperledger Besu blockchain anchoring (leveraging Sprint 4 infrastructure). Chain of custody logged for every access, copy, and deletion attempt.

**Rationale:**
- SHA-256 + PQC signature provides evidence integrity for legal proceedings.
- Besu anchoring provides third-party verifiable timestamp for high-stakes audit evidence.

### D5 — Business Continuity Automation

**Decision:** BCP activation triggered either manually (CCO/CRO) or automatically by SLO breach events from the Observability stack (Sprint 7). Automated DR test pipeline runs quarterly via scheduled GitHub Actions, measuring actual RTO/RPO against defined targets and publishing results to the Governance Dashboard.

**Rationale:**
- Automated DR tests replace error-prone manual procedures.
- SLO-triggered BCP activation reduces Mean Time To Recovery (MTTR).

### D6 — ComplianceOps Integration

**Decision:** Open Policy Agent (OPA) policies deployed as a sidecar in the Kubernetes CI/CD pipeline (ArgoCD, Sprint 0). Any policy violation (security misconfiguration, LGPD control gap, missing encryption) blocks the deployment pipeline. Results published to the Governance Dashboard.

**Rationale:**
- Shifting compliance left (into CI/CD) prevents non-compliant code from reaching production.
- OPA policies are codified, versionable, and peer-reviewed alongside application code.

---

## Consequences

### Positive
- Platform achieves ISO 27001 certification readiness with structured SoA and CCM evidence.
- LGPD Art. 48 breach notification capability within 72 hours — avoiding up to R$ 50M ANPD fines.
- Automated risk escalation eliminates blind spots in critical risk management.
- BCP automation reduces DR test effort by ~80% vs. manual procedures.

### Negative
- ComplianceOps gates add ~3 min to CI/CD pipeline; mitigated by parallel execution.
- DSAR orchestration across 8 services adds complexity; mitigated by gRPC service mesh.

### Risks & Mitigations
| Risk | Mitigation |
|---|---|
| OPA policy false-positive blocks valid deploy | Policy change requires 2-reviewer PR; fast rollback available |
| DSAR gRPC timeout if service is unhealthy | Circuit breaker with partial-data graceful degradation + SLA extension |
| Besu anchoring latency for evidence | Asynchronous anchoring — evidence usable immediately; Besu txHash added later |
| ROPA staleness as platform evolves | Kafka-driven automatic ROPA update on domain service deploy |

---

## Standards & Compliance

| Standard | Scope |
|---|---|
| LGPD (Lei 13.709/2018) | Full DPO platform: ROPA, DPIA, DSAR, breach notification |
| ISO 27001:2022 | 114 Annex A controls with SoA and CCM evidence |
| ISO 22301:2019 | BIA, BCP, DR test automation, RTO/RPO management |
| ISO 31000:2018 | Risk assessment methodology, risk register, treatment plans |
| ISO 37301:2021 | Compliance management system structure |
| COBIT 2019 | IT governance framework alignment |
| COSO ERM 2017 | Internal control framework (5 components) |
| NIST CSF 2.0 | Cybersecurity framework (6 functions) |

---

## Architecture References

- **Sprint 10 Master Blueprint:** `docs/blueprints/enterprise_grc_platform_prompt257.md`
- **GRC Engine:** `platform/governance/governance-engine.ts`
- **GRC Schema:** `platform/governance/governance-schema.prisma`
- **Related ADRs:** ADR-034, ADR-037, ADR-041, ADR-042
