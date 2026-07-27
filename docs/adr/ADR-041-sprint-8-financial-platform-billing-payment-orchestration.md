# ADR-041 — Sprint 8: Enterprise Financial Platform, Billing Engine & Payment Orchestration

**Status:** ACCEPTED  
**Date:** 2026-07-27  
**Authors:** Chief Financial Technology Officer · Enterprise Financial Architect · Head of Revenue Operations · Payment Systems Architect · FinOps Director  
**Supersedes:** N/A  
**Related:** ADR-040 (Data Platform), ADR-036 (Legal Services), ADR-038 (Legal Operations)

---

## Context

Sprint 8 delivers the **Enterprise Financial Platform** for Legis Connect. The platform must handle:

- **Multi-Gateway Payment Orchestration**: Pix, Credit Card, Boleto via Stripe (primary) with Mercado Pago / Banco do Brasil Open Finance as automatic fallback.
- **Split Payment Engine**: Automatic distribution of attorney honoraria, platform fees, and tax provisioning — with Escrow custody until service confirmation.
- **Enterprise Billing Engine**: Single charges, recurring subscriptions (B2C/B2B), pro-rata adjustments, and automated NFe fiscal note emission.
- **Digital Wallet**: Per-user wallets (attorneys & clients) with available balance, Escrow balance, and instant Pix cashout.
- **Financial Reconciliation**: Daily automated reconciliation (OFX/Webhook feeds) with zero-tolerance divergence detection (> R$ 0.01 triggers alert).
- **Revenue Intelligence**: MRR, ARR, GMV, Take Rate, LTV/CAC, and Churn Rate KPI computation.

All components must comply with **PCI DSS 4.0**, **LGPD**, **ISO 27001**, and **Open Finance Brasil** regulatory requirements.

---

## Decision

### D1 — Payment Orchestration Strategy

**Decision:** Stripe Enterprise as primary provider; Mercado Pago + BB Open Finance as secondary fallback. Automatic fallback triggers on HTTP 5xx or response timeout > 3 000 ms, completing in < 200 ms.

**Rationale:**
- Stripe provides the richest Pix + Credit Card + Boleto API surface in Brazil.
- Multi-gateway fallback ensures 99.99% payment availability SLA.
- Idempotency keys (`X-Idempotency-Key`) prevent duplicate charges on retries.

### D2 — Split Payment Architecture

**Decision:** Synchronous split calculation (< 18 ms) embedded in the `PaymentCapturedEvent` handler; asynchronous Escrow release triggered by `ConsultationCompletedEvent` from Sprint 3.

**Rationale:**
- Escrow custody protects both parties and ensures platform integrity.
- Configurable split rules stored in `SplitRule` aggregate allow per-tenant customisation without code changes.

### D3 — Subscription Billing Model

**Decision:** Stripe Billing for subscription lifecycle (trial → active → past_due → cancelled); pro-rata credit notes on mid-cycle plan upgrades/downgrades; automated NFe via Nota.fiscal.net API on invoice settlement.

**Rationale:**
- Stripe Billing is PCI DSS 4.0 SAQ-A compliant (no PAN in Legis servers).
- Pro-rata prevents revenue leakage and improves client NPS.

### D4 — Wallet Architecture

**Decision:** Ledger-based double-entry accounting model (`WalletTransaction` with `DEBIT`/`CREDIT` entries); instant Pix cashout via Stripe Payouts or Celcoin for BRL.

**Rationale:**
- Double-entry ledger ensures mathematical consistency and provides a clear audit trail.
- Instant Pix payouts improve attorney satisfaction and liquidity.

### D5 — Financial Security (PCI DSS 4.0 Compliance)

**Decision:** Zero PAN storage on Legis servers (Stripe Vault tokenisation); 3DS2 Strong Customer Authentication on all card transactions > R$ 100; runtime Antifraud (Stripe Radar + Cybersource risk scoring).

**Rationale:**
- PCI DSS 4.0 SAQ-A scope reduces certification burden.
- 3DS2 meets RCB (Banco Central) e-commerce mandate for Brazil.

### D6 — Revenue Intelligence Data Pipeline

**Decision:** Financial domain events published to Kafka topic `legis.financial.events.v1`; ClickHouse OLAP aggregates MRR/ARR/GMV/LTV/CAC in real time; Grafana Financial dashboard auto-refreshes every 60 seconds.

**Rationale:**
- Decoupling revenue analytics from transactional DB prevents contention.
- ClickHouse handles 1M+ events/day with sub-second P95 query latency.

---

## Consequences

### Positive
- Payment availability SLA: 99.99% with multi-gateway fallback.
- Attorneys receive honoraria in < 2 seconds after service confirmation via instant Pix.
- Zero PAN storage on platform servers — PCI DSS SAQ-A compliance achieved.
- Real-time revenue KPIs available to C-suite within 60 seconds of transaction.

### Negative
- Stripe dependency introduces a third-party risk; mitigated by fallback and abstraction layer.
- Escrow holdback may concern attorneys; mitigated by clear UX messaging and SLA commitments.

### Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Stripe API outage | Mercado Pago / BB Open Finance automatic fallback < 200 ms |
| Split arithmetic rounding error | `decimal.js` arbitrary-precision arithmetic; 1 000-transaction golden-path test suite |
| Regulatory change (Open Finance) | Adapter pattern isolates Open Finance client; hot-swap without redeploy |
| NFe provider downtime | Async retry queue with dead-letter topic; NFe issued asynchronously within 2h |

---

## Standards & Compliance

| Standard | Scope |
|---|---|
| PCI DSS 4.0 | Payment card security — SAQ-A (tokenisation, no PAN storage) |
| LGPD | Financial data minimisation, right to erasure, consent management |
| ISO 27001 | Information security controls on financial microservices |
| Open Finance Brasil | Banco Central API compliance for account data and payments |
| Resolução BCB nº 1 (Pix) | Pix transaction rules, DICT key management |
| NFe SPED Fiscal | Automated fiscal note emission and SPED export |

---

## Architecture References

- **Sprint 8 Master Blueprint:** `docs/blueprints/enterprise_financial_platform_prompt255.md`
- **Financial Engine:** `platform/financial/financial-engine.ts`
- **Financial Schema:** `platform/financial/financial-schema.prisma`
- **Related ADRs:** ADR-036, ADR-038, ADR-039, ADR-040
