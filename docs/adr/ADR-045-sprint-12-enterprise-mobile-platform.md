# ADR-045 — Sprint 12: Enterprise Mobile Platform, Native iOS & Android, PWA & Offline Sync

**Status:** ACCEPTED  
**Date:** 2026-07-27  
**Authors:** Chief Mobile Officer · Enterprise Mobile Architect · Mobile Security Architect · Mobile UX Director · Platform Engineering Director  
**Supersedes:** N/A  
**Related:** ADR-034 (Identity/FIDO2), ADR-041 (Financial), ADR-043 (GRC), ADR-044 (Integration Platform)

---

## Context

Sprint 12 delivers the **Enterprise Mobile Platform** for Legis Connect. The platform must handle:

- **Multi-Platform Support**: Native iOS (SwiftUI + TCA), Native Android (Jetpack Compose + MVI), and PWA (Next.js 15 + Workbox + Dexie.js).
- **Offline-First Engine**: Local SQLite / Room / Core Data / Dexie storage with delta synchronization, idempotency keys, and 5 conflict resolution strategies (LWW, Server-Wins, Client-Wins, Three-Way Merge, Manual).
- **Mobile Security (OWASP MASVS-2024 L2)**: Biometrics (Face ID/Touch ID/Class 3 BiometricPrompt), hardware-backed Keychain/Keystore key storage, TrustKit/OkHttp certificate pinning, root/jailbreak detection, and anti-tamper.
- **Intelligent Push Notifications**: APNs (HTTP/2) + FCM (HTTP v1) + Web Push (VAPID) with AI-powered optimal send-time, fatigue control, silent background sync, and action categories.
- **Mobile Device Integrations**: Camera document scanning (VisionKit / CameraX MLKit), biometrics, device calendar sync, contact export, native share sheet, and desktop/home widgets (WidgetKit / Glance).
- **Mobile Observability & Analytics**: Crashlytics, Datadog RUM, session replay, ANR detection, and LGPD-compliant analytics without PII.

---

## Decisions

### D1 — Mobile Architecture Strategy: Dual Native + PWA

**Decision:** Adopt Native iOS (Swift 5.10 + SwiftUI + TCA) and Native Android (Kotlin 2.0 + Jetpack Compose + MVI) for primary enterprise apps, coupled with a PWA (Next.js 15 App Router + Workbox 7) for web fallback and light mobile access.

**Rationale:**
- Native frameworks provide zero-compromise access to hardware security features (Secure Enclave, StrongBox), high-performance background sync, and OS-specific UI patterns.
- PWA ensures 100% device reach without app store friction for light enterprise users.

### D2 — Offline Synchronization Protocol

**Decision:** Local-First model using UUID idempotency keys for all offline mutations. Incremental delta sync via timestamp tokens (`?since=<token>`). Conflict resolution Matrix:
1. `LAST_WRITE_WINS` for status and notes.
2. `SERVER_WINS` for financial transactions and legal deadlines.
3. `CLIENT_WINS` for drafts and local UI state.
4. `THREE_WAY_MERGE` for collaborative text fields.
5. `MANUAL_RESOLUTION` for critical business conflicts.

**Rationale:**
- Ensures zero data loss during connectivity drops in courtrooms or remote sites.
- Deterministic conflict handling prevents database corruption.

### D3 — Mobile Security Standard (OWASP MASVS L2)

**Decision:** Enforce OWASP MASVS Level 2 compliance across all mobile platforms:
- Store ALL tokens and keys in Keychain (iOS) and Keystore (Android).
- Pin SPKI public keys using TrustKit (iOS) and OkHttp CertificatePinner (Android).
- Detect root/jailbreak via IOSSecuritySuite and RootBeer + Play Integrity API.
- Prevent screenshot/recording on sensitive screens (`FLAG_SECURE` / `isSecureTextEntry`).

**Rationale:**
- Legal enterprise data requires strict protection against device theft, network interception, and reverse engineering.

---

## Consequences

### Positive
- Fully functional offline experience for lawyers in courtrooms without cell reception.
- Highest security tier achievable on mobile devices (OWASP MASVS L2 certified).
- Uniform Design System token parity across iOS, Android, and PWA.

### Negative
- Dual native codebases require parallel maintenance in Swift and Kotlin.

---

## Architecture References

- **Sprint 12 Master Blueprint:** `docs/blueprints/enterprise_mobile_platform_prompt259.md`
- **Mobile Engine:** `platform/mobile/mobile-engine.ts`
- **Mobile Schema:** `platform/mobile/mobile-schema.prisma`
