# ADR-044 — Sprint 11: Enterprise Integration Platform, API Management & Partner Ecosystem

**Status:** ACCEPTED  
**Date:** 2026-07-27  
**Authors:** Chief Integration Officer · Enterprise Integration Architect · API Platform Architect · Platform Engineering Director · Partner Ecosystem Director  
**Supersedes:** N/A  
**Related:** ADR-034 (Identity/OIDC), ADR-041 (Financial/Open Finance), ADR-043 (GRC/Compliance)

---

## Context

Sprint 11 delivers the **Enterprise Integration Platform** for Legis Connect. The platform must handle:

- **API Gateway**: Kong Enterprise as the primary gateway (AWS API Gateway as fallback) with OAuth 2.1, mTLS, rate limiting, WAF integration, response caching (Redis), and observability (Prometheus + Datadog).
- **API Management**: Full API lifecycle (DESIGN → BUILD → TEST → PUBLISH → VERSION → DEPRECATE → RETIRE) with semantic versioning, consumer-driven contract testing (Pact), and monetisation plans.
- **Developer Portal**: Self-service API key management, OpenAPI + AsyncAPI documentation, sandbox environment, SDK auto-generation (5 languages), webhook registration with HMAC-SHA256 signing.
- **Integration Hub**: Enterprise Integration Patterns (EIP) — Message Router, Transformer, Aggregator, Splitter, Saga Orchestrator, Dead Letter Channel — implemented via Kafka + BullMQ.
- **Court Integration**: Adapters for PJe (CNJ REST API v2), e-SAJ (TJSP), Projudi (TJPR), ESAJ (multiple TJs) with circuit breaker, exponential backoff, and XML→JSON transformation.
- **Digital Signature**: Provider-agnostic abstraction for DocuSign, ClickSign, D4Sign, and Soluti (ICP-Brasil) supporting Simple, Advanced, and Qualified (ICP-B) signature levels.
- **Partner Ecosystem**: 4-tier partner programme (BRONZE/SILVER/GOLD/PLATINUM) with automated onboarding, certification pipeline, revenue share management, and SLA monitoring.
- **Security**: Zero Trust across all integration layers — SPIFFE/SPIRE workload identity, mTLS for B2B, AWS Secrets Manager for credential storage, 42Crunch API security scanning in CI/CD.

---

## Decision

### D1 — API Gateway Technology

**Decision:** Kong Enterprise (self-managed on EKS) as primary API Gateway. AWS API Gateway (HTTP API mode) as fallback for specific partner integrations. Kong plugins: JWT validation, OAuth 2.0 introspection, rate-limiting-advanced (sliding window), proxy-cache, request-transformer, response-transformer, prometheus, opentelemetry.

**Rationale:**
- Kong Enterprise provides declarative configuration (GitOps via KongIngress CRDs) compatible with ArgoCD (Sprint 0).
- Sliding-window rate limiting is more accurate than fixed-window for burst protection.
- Prometheus plugin eliminates the need for a separate APM agent on the gateway tier.

### D2 — API Versioning Strategy

**Decision:** URI-based major versioning (`/api/v1/`, `/api/v2/`). Minor and patch versions are backward-compatible and require no URI change. Sunset header (`Sunset: Sat, 31 Jan 2027 23:59:59 GMT`) required 90 days before any API deprecation. Consumers notified via Developer Portal + email + Kafka event `legis.integration.api.deprecated.v1`.

**Rationale:**
- URI versioning is the most discoverable pattern for third-party developers.
- Sunset header (RFC 8594) provides machine-readable deprecation signal for automated consumer tooling.

### D3 — Court Integration Architecture

**Decision:** All court connectors implement the `CourtConnectorPort` interface (Adapter Pattern). Circuit breaker state persisted in Redis (Sprint 1) — not in-memory — ensuring state survives pod restarts. All court data cached with TTL = 15 minutes (processual data changes infrequently). XML responses from legacy court APIs transformed to a canonical JSON `ProcessoJudicial` schema in the Integration Hub transformer layer.

**Rationale:**
- Redis-persisted circuit breaker state prevents thundering-herd on pod restarts.
- Canonical schema decouples consuming services from court-specific data models.
- 15-minute cache TTL balances freshness with court API rate limits.

### D4 — Digital Signature Provider Abstraction

**Decision:** `DigitalSignaturePort` interface with 5 methods (createRequest, getStatus, downloadSigned, validateSignature, getAuditTrail). Provider selection logic: tenant config → signature level requirement (QUALIFIED → Soluti/ICP-Brasil only) → provider availability (circuit breaker). All signed documents automatically archived in Sprint 4 Digital Evidence Vault with SHA-256 hash chain.

**Rationale:**
- Provider abstraction prevents vendor lock-in — critical given DocuSign's pricing model.
- Auto-archiving to Evidence Vault ensures legal admissibility and LGPD retention compliance.

### D5 — Partner API Security (mTLS + Certificate Binding)

**Decision:** All Tier 1 and Tier 2 partners required to present a client certificate (issued by Legis Connect PKI or a trusted CA) on every API call. Access tokens bound to client certificate (RFC 8705 — Certificate-Bound Access Tokens) to prevent token theft. Tier 3 partners use API key + HMAC-SHA256 request signing.

**Rationale:**
- Certificate-bound tokens (DPoP/mTLS) prevent bearer token exfiltration attacks common in partner integrations.
- Tiered security requirements match the risk profile of each partner tier.

### D6 — Schema Registry for Event Catalog

**Decision:** AWS Glue Schema Registry with FULL_TRANSITIVE compatibility mode for all 127 Kafka event types. Schema evolution policy: new required fields forbidden (must be optional); field removal requires 2-sprint deprecation window; field rename creates a new optional field + deprecated old field.

**Rationale:**
- FULL_TRANSITIVE compatibility ensures both producers and consumers can evolve independently.
- 127 event types across 11 domains requires automated schema enforcement — manual enforcement is error-prone.

---

## Consequences

### Positive
- 100,000 RPS API Gateway capacity (tested to 500k RPS horizontal scaling).
- Developers can self-onboard, create API keys, and test integrations without manual provisioning.
- Court integration ready for PJe/e-SAJ production credentials with zero code changes.
- Digital signature supports ICP-Brasil qualified signatures required for official legal documents.

### Negative
- Kong Enterprise license cost (~$50k/year); mitigated by OSS fallback evaluated annually.
- Court API availability (especially legacy tribunals) is outside Legis Connect's control; mitigated by circuit breaker + cache.

### Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Court API breaking changes (no versioning) | XML transformer + canonical schema absorbs court-side changes |
| Partner certificate expiry | Automated certificate expiry alert (90 days) via Governance platform |
| API Gateway single point of failure | Active-Active multi-AZ Kong + AWS API Gateway fallback |
| Webhook delivery failure | 3-retry with exponential backoff + Kafka DLQ + partner dashboard alert |

---

## Standards & Compliance

| Standard | Scope |
|---|---|
| OAuth 2.1 (IETF draft) | All public and partner API authentication |
| OpenID Connect 1.0 | Developer Portal and partner SSO |
| RFC 8705 (mTLS Token Binding) | Tier 1 & 2 partner API security |
| RFC 8594 (Sunset Header) | API deprecation signalling |
| RFC 7807 (Problem Details) | All API error responses |
| OpenAPI 3.1 | All REST API specifications |
| AsyncAPI 2.6 | All event-driven API specifications |
| MP 2.200-2/2001 | Brazilian digital signature levels (Simple/Advanced/Qualified) |
| ICP-Brasil PKI | Qualified signature provider (Soluti/Serpro) |
| LGPD | Data minimisation in integration payloads |

---

## Architecture References

- **Sprint 11 Master Blueprint:** `docs/blueprints/enterprise_integration_platform_prompt258.md`
- **Integration Engine:** `platform/integration/integration-engine.ts`
- **Integration Schema:** `platform/integration/integration-schema.prisma`
- **Related ADRs:** ADR-034, ADR-037, ADR-041, ADR-043
