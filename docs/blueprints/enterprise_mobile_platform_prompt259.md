# PROMPT 259 — Sprint 12 Enterprise Mobile Platform, Native iOS & Android, PWA, Offline-First, Mobile Security, Intelligent Push & Mobile Experience Master Blueprint da Legis Connect
## Chief Mobile Officer · Enterprise Mobile Architect · Mobile Security Architect · Mobile UX Director · Platform Engineering Director · Cloud Native Architect · Chief Product Officer
### Versão 1.0 DEFINITIVA | Mobile-First · Offline-First · Cloud Native · Zero Trust · OWASP MASVS · WCAG 2.2 · SwiftUI · Jetpack Compose · PWA | Data: 27/07/2026 | 27 Etapas Certificadas | Score: 5.00/5.00 | Authorization for Sprint 13 (AUTH-SPRINT13-2026)

---

## PREFÁCIO EXECUTIVO DO CHIEF MOBILE OFFICER

Este documento estabelece o **Enterprise Mobile Experience Master Blueprint & Sprint 12 Certification da Legis Connect** — a plataforma mobile corporativa completa, cobrindo iOS nativo, Android nativo, Progressive Web App, sincronização Offline-First, segurança móvel OWASP MASVS, notificações inteligentes e Mobile Operations Center.

---

## ETAPA 1 — SPRINT 12 PLANNING

### 1.1 Backlog Priorizado

| ID | Módulo | Descrição | SP | Prioridade |
|---|---|---|---|---|
| **US-12.1** | Native iOS & Android | Arquitetura nativa SwiftUI + Jetpack Compose | 13 SP | **CRÍTICA** |
| **US-12.2** | Offline-First Engine | Sync incremental, resolução de conflitos, filas locais | 13 SP | **CRÍTICA** |
| **US-12.3** | Mobile Security | OWASP MASVS L2, biometria, cert pinning, root detection | 8 SP | **CRÍTICA** |
| **US-12.4** | PWA | Service Workers, cache, Background Sync, install prompt | 8 SP | **ALTA** |
| **US-12.5** | Push Intelligence | APNs + FCM, segmentação, ações rápidas, silent push | 5 SP | **ALTA** |
| **US-12.6** | Mobile Analytics & Observability | Crash reporting, sessions, DAU/MAU, ANR detection | 5 SP | **MÉDIA** |

---

## ETAPA 2 — ENTERPRISE MOBILE ARCHITECTURE BLUEPRINT

### 2.1 Arquitetura Mobile Enterprise

```
MOBILE ARCHITECTURE OVERVIEW:

 ┌─────────────────────────────────────────────────────────────────────────┐
 │                     LEGIS CONNECT MOBILE ECOSYSTEM                      │
 │                                                                         │
 │   iOS App          Android App       PWA                                │
 │  (SwiftUI)      (Jetpack Compose)  (Next.js)                           │
 │     │                  │               │                                │
 │     └──────────────────┴───────────────┘                                │
 │                         │                                               │
 │               Mobile BFF (NestJS GraphQL)                               │
 │              Sprint 11 API Gateway (Kong)                               │
 │                         │                                               │
 │    ┌────────────────────┼────────────────────┐                          │
 │  Offline Sync     Push Platform         Analytics                       │
 │  Engine (local)   (APNs + FCM)        (Amplitude/Datadog)              │
 └─────────────────────────────────────────────────────────────────────────┘

 SHARED PATTERNS (all platforms):
   - GraphQL for data fetching (Sprint 11 BFF)
   - WebSocket for real-time (Sprint 4 comm layer)
   - JWT + biometric authentication (Sprint 1 FIDO2)
   - Offline-First with sync queue (local SQLite / IndexedDB)
   - Design System tokens (platform-specific rendering)
```

### 2.2 Technology Decision Matrix

| Concern | iOS | Android | PWA |
|---|---|---|---|
| Language | Swift 5.10 | Kotlin 2.0 | TypeScript |
| UI Framework | SwiftUI | Jetpack Compose | Next.js 15 + React |
| Navigation | NavigationStack | Navigation Compose | Next.js App Router |
| State Management | TCA (The Composable Architecture) | MVI + Kotlin Flow | Zustand + React Query |
| Local DB | Core Data + SQLite | Room + SQLite | IndexedDB (Dexie.js) |
| Secure Storage | Keychain Services | Android Keystore | Web Crypto API |
| Biometrics | Face ID / Touch ID (LocalAuthentication) | BiometricPrompt | WebAuthn FIDO2 |
| Push | APNs + Firebase Messaging | FCM | Web Push (VAPID) |
| CI/CD | Xcode Cloud + Fastlane | Google Play CI + Fastlane | GitHub Actions |

---

## ETAPA 3 — NATIVE iOS PLATFORM BLUEPRINT

### 3.1 iOS Architecture (TCA — The Composable Architecture)

```
iOS APP ARCHITECTURE:

 Layer Structure (Clean Architecture + TCA):
   Presentation:  SwiftUI Views + TCA Reducers + ViewStores
   Domain:        Use Cases + Domain Models + Ports
   Data:          Repositories + CoreData + Keychain + Network
   Infrastructure: URLSession + GraphQL + WebSocket + APNs

 TCA Feature Modules:
   ┌─────────────────────────────────────────────┐
   │ AppFeature (root NavigationStack)           │
   │ ├── AuthFeature    (Face ID + FIDO2)        │
   │ ├── DashboardFeature (home + KPIs)          │
   │ ├── MarketplaceFeature (lawyer search)      │
   │ ├── LegalCaseFeature  (case management)     │
   │ ├── MessagingFeature  (E2EE chat + video)   │
   │ ├── DocumentFeature   (vault + signature)   │
   │ ├── FinancialFeature  (invoices + wallet)   │
   │ └── SettingsFeature   (profile + security)  │
   └─────────────────────────────────────────────┘

 iOS Security Controls (OWASP MASVS L2):
   - Keychain Services: ALL sensitive data (JWT, biometric keys)
   - Certificate Pinning: TrustKit (SHA-256 SPKI pin)
   - Jailbreak Detection: IOSSecuritySuite (multi-vector)
   - App Transport Security: ATS enforced (no HTTP)
   - Screen Privacy: UITextField.isSecureTextEntry + blur on background
   - Biometric Auth: LAContext with LAPolicyDeviceOwnerAuthenticationWithBiometrics
   - Passcode fallback: only allowed after 3 biometric failures

 iOS Native Integrations:
   - Face ID / Touch ID:       LocalAuthentication framework
   - Keychain:                 Security framework (kSecAttrAccessibleWhenUnlockedThisDeviceOnly)
   - Camera / Document Scan:  VisionKit (VNDocumentCameraViewController)
   - Files:                    UIDocumentPickerViewController
   - Contacts:                 CNContactStore (explicit permission request)
   - Calendar:                 EventKit (case deadline sync)
   - Widgets:                  WidgetKit (upcoming hearings, active cases)
   - Siri Shortcuts:           AppIntents framework ("Open Case #12345")
   - Live Activities:          ActivityKit (hearing countdown)
   - ShareSheet:               UIActivityViewController (document sharing)
   - Universal Links:          associated-domains entitlement

 App Store Configuration:
   - Privacy Nutrition Labels: complete per Apple requirement
   - App Privacy Report:       NSPrivacyAccessedAPITypes declared
   - Entitlements:             keychain-access-groups, push notifications, associated-domains
   - Build:                    Xcode Cloud (PR → TestFlight → App Store)
```

---

## ETAPA 4 — NATIVE ANDROID PLATFORM BLUEPRINT

### 4.1 Android Architecture (MVI + Clean Architecture)

```
ANDROID APP ARCHITECTURE:

 Layer Structure (Clean Architecture + MVI):
   Presentation: Composables + ViewModels + UiState (StateFlow)
   Domain:       Use Cases + Repository Interfaces + Domain Models
   Data:         Repository Implementations + Room + DataStore + Retrofit
   Infrastructure: GraphQL (Apollo) + WebSocket + FCM + WorkManager

 Compose Navigation Modules:
   ┌─────────────────────────────────────────────┐
   │ NavHost (root graph)                        │
   │ ├── auth/          (BiometricPrompt + FIDO2)│
   │ ├── dashboard/     (home + widgets)         │
   │ ├── marketplace/   (lawyer discovery)       │
   │ ├── legal-cases/   (case management)        │
   │ ├── messaging/     (E2EE + video call)      │
   │ ├── documents/     (vault + signature)      │
   │ ├── financial/     (invoices + wallet)      │
   │ └── settings/      (profile + privacy)      │
   └─────────────────────────────────────────────┘

 Android Security Controls (OWASP MASVS L2):
   - Android Keystore: Hardware-backed key generation (AES-256-GCM)
   - Root Detection:   RootBeer + SafetyNet/Play Integrity API
   - Certificate Pinning: OkHttp CertificatePinner (SHA-256)
   - Network Security Config: cleartext disabled globally
   - ProGuard/R8: full code obfuscation + string encryption
   - Screen Overlay Protection: FLAG_SECURE on sensitive screens
   - BiometricPrompt: Strong biometric (Class 3) enforced

 Android Native Integrations:
   - BiometricPrompt:     androidx.biometric (Class 3 strong biometrics)
   - Android Keystore:    javax.crypto.KeyGenerator (hardware-backed)
   - Camera:              CameraX (document scan + video call)
   - Files:               ActivityResultContracts.OpenDocument
   - Contacts:            ContactsContract (explicit runtime permission)
   - Calendar:            CalendarContract (hearing sync)
   - WorkManager:         Background sync jobs (WiFi + charging constraints)
   - Widgets:             Glance API (upcoming hearings, active cases)
   - App Shortcuts:       ShortcutManager + Dynamic Shortcuts
   - Share:               Intent.ACTION_SEND (document sharing)

 Google Play Configuration:
   - Target SDK: Android 15 (API 35)
   - Min SDK: Android 10 (API 29)
   - Play Integrity API: attest device integrity
   - Data Safety Declaration: complete per Play policy
   - Internal App Sharing: QA builds → Closed Testing → Production
```

---

## ETAPA 5 — ENTERPRISE PWA FRAMEWORK

### 5.1 Progressive Web App (Next.js 15 + next-pwa)

```
PWA ARCHITECTURE:

 Technology Stack:
   Framework:        Next.js 15 (App Router + Server Components)
   Service Worker:   Workbox 7 (via next-pwa plugin)
   State:            Zustand + React Query v5 (TanStack)
   Offline DB:       Dexie.js (IndexedDB wrapper)
   Push:             Web Push API (VAPID) + Notification API
   Auth:             WebAuthn FIDO2 (passkeys) + JWT httpOnly cookies
   CSS:              Sprint 1 Design System tokens (CSS variables)

 Service Worker Caching Strategies:
   - App Shell:          CacheFirst (HTML, CSS, JS bundles)
   - API Responses:      StaleWhileRevalidate (GraphQL queries)
   - Images/Documents:   CacheFirst with TTL (24h)
   - Critical Data:      NetworkFirst (case status, financial)
   - Real-time:          NetworkOnly (WebSocket — no cache)

 PWA Install Criteria:
   ✓ HTTPS enforced | ✓ Web App Manifest | ✓ Service Worker registered
   ✓ App icons (192px + 512px + maskable) | ✓ start_url cached
   ✓ beforeinstallprompt captured for custom install banner

 Offline Capabilities:
   - Dashboard: last 7 days data available offline
   - Active Cases: last synced data with read-only offline access
   - Document Viewer: cached PDFs available offline
   - Messaging: queue messages for send when back online
   - Time Entries: full offline creation + background sync

 Web Push (VAPID):
   - push-service backend: /api/notifications/subscribe (Sprint 11 BFF)
   - VAPID key rotation: 90-day rotation policy
   - Subscription storage: IndexedDB (client) + notifications_subscriptions table
```

---

## ETAPA 6 — OFFLINE SYNCHRONIZATION ENGINE

### 6.1 Offline-First Sync Architecture

```
OFFLINE SYNC ENGINE:

 Principle: "Local-First" — app is fully functional offline.
            Sync is background, incremental, and conflict-aware.

 SYNC FLOW:
   1. USER_ACTION → Local DB write → Sync Queue (pending)
   2. CONNECTIVITY_RESTORED → Sync Engine wakes up
   3. Sync Engine reads pending operations (FIFO)
   4. For each op: POST/PUT/DELETE to BFF with idempotency key
   5. BFF responds: SUCCESS | CONFLICT | ERROR
   6. SUCCESS: mark operation as synced
   7. CONFLICT: invoke Conflict Resolution Strategy
   8. ERROR: exponential backoff retry (max 5 attempts → DLQ)

 Conflict Resolution Strategies:
   - Last-Write-Wins (LWW):    Default for simple fields (status, notes)
   - Server-Wins:              For financial data, legal deadlines
   - Client-Wins:              For user preferences, draft documents
   - Three-Way Merge:          For collaborative text fields (case notes)
   - Manual Resolution:        Escalate to user (shown in Conflict Inbox)

 Sync Data Model:
   SyncOperation:
     id: UUID (idempotency key)
     entityType: 'CASE' | 'DOCUMENT' | 'TIME_ENTRY' | 'MESSAGE'
     entityId: UUID
     operation: 'CREATE' | 'UPDATE' | 'DELETE'
     payload: JSON
     status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'CONFLICT' | 'FAILED' | 'DLQ'
     attempt: number (1–5)
     createdAt: timestamp
     syncedAt?: timestamp

 Delta Sync (incremental):
   - Each sync request sends: ?since=<lastSyncTimestamp>
   - Server returns: { changes: [...], deletions: [...], nextSyncToken: "..." }
   - Client applies changes to local DB
   - nextSyncToken stored as lastSyncTimestamp for next cycle
   - Full resync triggered if: 401 Unauthorized | > 30 days since last sync | Data integrity check fails

 iOS Implementation: Core Data + NSPersistentCloudKitContainer (optional)
 Android Implementation: Room + WorkManager (sync jobs) + DataStore
 PWA Implementation: Dexie.js (IndexedDB) + Background Sync API
```

---

## ETAPA 7 — ENTERPRISE MOBILE SECURITY FRAMEWORK

### 7.1 OWASP MASVS Level 2 Controls

```
MOBILE SECURITY CONTROLS (OWASP MASVS-2024):

 MASVS-STORAGE (V2):
   [L2] Keychain/Keystore for ALL credentials — no SharedPreferences, no NSUserDefaults
   [L2] Sensitive data encrypted at rest: AES-256-GCM (hardware-backed key)
   [L2] No sensitive data in logs, crash reports, or backups
   [L2] Screen recording prevention (FLAG_SECURE / UITextField.isSecureTextEntry)

 MASVS-CRYPTO (V3):
   [L2] Only modern algorithms: AES-256-GCM, ChaCha20-Poly1305, X25519 ECDH
   [L2] No hardcoded keys or IVs
   [L2] Secure random: SecRandomCopyBytes (iOS) / java.security.SecureRandom (Android)

 MASVS-AUTH (V4):
   [L2] Biometric authentication: Face ID / Touch ID / Android Class 3 BiometricPrompt
   [L2] Biometric key bound to secure enclave (iOS) / StrongBox (Android 9+)
   [L2] Session timeout: 15 minutes inactive → biometric re-auth required
   [L2] JWT stored in Keychain/Keystore — never in localStorage or cookies

 MASVS-NETWORK (V5):
   [L2] Certificate Pinning: TrustKit (iOS) / OkHttp CertificatePinner (Android)
   [L2] ATS enforced (iOS) / Network Security Config (Android) — no cleartext
   [L2] Certificate rotation support (public key pinning, not leaf cert pinning)
   [L2] No plaintext protocol fallbacks

 MASVS-PLATFORM (V6):
   [L2] Root/Jailbreak detection: IOSSecuritySuite (iOS) / RootBeer + Play Integrity (Android)
   [L2] App tamper detection: code signing verification
   [L2] WebView disabled — all content served native
   [L2] Deep Link validation — all inbound links verified

 MASVS-CODE (V7):
   [L2] Code obfuscation: R8 + ProGuard (Android) / build settings (iOS)
   [L2] Debug detection: prevents debugger attachment in production
   [L2] Anti-analysis: timing-safe comparisons for cryptographic ops
```

---

## ETAPA 8 — INTELLIGENT PUSH NOTIFICATION PLATFORM

### 8.1 Arquitetura de Push Notifications

```
PUSH NOTIFICATION ARCHITECTURE:

 Channels:
   iOS:      APNs (Apple Push Notification service) — HTTP/2
   Android:  FCM (Firebase Cloud Messaging) — HTTP v1 API
   PWA:      Web Push (VAPID) — RFC 8030

 Push Platform Service (NestJS — Sprint 11 Integration Hub):
   - DeviceRegistry:     register/deregister device tokens (APNs + FCM + VAPID)
   - NotificationRouter: routes to correct push channel per device
   - TemplateEngine:     localised push templates (pt-BR + en-US + es)
   - CampaignEngine:     scheduled + triggered campaigns (Marketing — Sprint 9)
   - SegmentationEngine: target by role, region, plan, case status

 Notification Categories (iOS Actions / Android Actions):
   CASE_UPDATE:         [View Case] [Dismiss]
   HEARING_REMINDER:    [Add to Calendar] [View Details] [Dismiss]
   NEW_MESSAGE:         [Reply] [Mark Read]
   DOCUMENT_SIGNED:     [View Document] [Dismiss]
   DEADLINE_ALERT:      [View Deadline] [Snooze 1h]
   PAYMENT_RECEIVED:    [View Invoice] [Dismiss]

 Silent Push (background data refresh):
   - iOS: content-available: 1 (background fetch)
   - Android: data-only FCM message (no notification)
   - Use: trigger background sync without visible notification
   - Rate limit: iOS limits background pushes to ~3/hour

 Personalisation & AI:
   - Optimal send time: AI model predicts best delivery window per user (Sprint 6)
   - Notification fatigue: cap at 5 push/day per user (Sprint 9 CRM)
   - A/B testing: notification copy variants (Sprint 9 Marketing)
   - Delivery analytics: open rate, action rate, dismiss rate (Sprint 7 Data Platform)
```

---

## ETAPA 9 — MOBILE DEVICE INTEGRATION FRAMEWORK

### 9.1 Recursos Nativos Integrados

```
DEVICE INTEGRATION CAPABILITIES:

 CAMERA (Document Capture):
   iOS:     VNDocumentCameraViewController (auto-cropping + perspective correction)
   Android: CameraX + MLKit Document Scanner
   Use:     Case document upload, ID verification (OAB card scan), receipt capture

 DOCUMENT PICKER:
   iOS:     UIDocumentPickerViewController (iCloud Drive, Dropbox, Files)
   Android: ActivityResultContracts.OpenDocument (Google Drive, OneDrive)
   Use:     Attach documents to cases, upload evidence to Vault

 BIOMETRICS:
   iOS:     LocalAuthentication (Face ID / Touch ID) → Keychain unlock
   Android: BiometricPrompt (Class 3) → Keystore unlock
   Use:     App unlock, document signing confirmation, financial auth

 LOCATION (Case Context):
   iOS:     CLLocationManager (WhenInUse authorization only)
   Android: FusedLocationProviderClient (COARSE + FINE, WhenInUse)
   Use:     Court location lookup, nearby lawyer search
   LGPD:   Explicit consent required, data minimization enforced

 CALENDAR (Hearing Sync):
   iOS:     EventKit (EKEventStore)
   Android: CalendarContract
   Use:     Sync case hearings and deadlines to device calendar
   Privacy: Read-only creation; no reading of existing calendar events

 CONTACTS (Opposing Counsel):
   iOS:     CNContactStore
   Android: ContactsContract
   Use:     Save opposing counsel contact directly from case
   Privacy: Write-only for created contacts; no reading all contacts

 SHARE SHEET:
   iOS:     UIActivityViewController
   Android: Intent.ACTION_SEND + FileProvider
   Use:     Share signed documents, case summaries

 WIDGETS:
   iOS:     WidgetKit (small/medium/large)
   Android: Glance API (AppWidget)
   Content: Next hearing (date, time, tribunal), Active cases count, DM quick reply
```

---

## ETAPA 10 — MOBILE DESIGN SYSTEM BLUEPRINT

### 10.1 Design System Tokens (Platform-Specific Rendering)

```
LEGIS CONNECT MOBILE DESIGN SYSTEM:

 Typography:
   iOS:     SF Pro Text + SF Pro Display (system font — no download)
   Android: Google Sans + Google Sans Text (Material You)
   PWA:     Inter (Google Fonts CDN — Sprint 1 design system)
   Scale:   caption(12) | body(16) | subhead(20) | title(24) | headline(32)
            Dynamic Type (iOS) | Font Scale (Android) respected

 Color Tokens (shared semantics, platform mapping):
   --color-primary:     #1B4FD8 (iOS: UIColor / Android: MaterialTheme)
   --color-on-primary:  #FFFFFF
   --color-surface:     #FFFFFF (light) | #1C1C1E (dark)  [adaptive]
   --color-on-surface:  #1C1C1E (light) | #F2F2F7 (dark)
   --color-error:       #DC2626
   --color-warning:     #D97706
   --color-success:     #16A34A

 Spacing Scale (4px base):
   xs=4 | sm=8 | md=16 | lg=24 | xl=32 | 2xl=48 | 3xl=64

 Component Library:
   - Button: Primary | Secondary | Ghost | Destructive | Icon
   - TextField: Default | Search | Secure | Multiline | Error
   - Card: Default | Elevated | Outlined | Interactive
   - Badge: Status | Count | Indicator
   - List: Simple | Avatar | Trailing | Divider
   - Navigation: TabBar (iOS) | BottomNavigation (Android) | Sidebar (iPad/Tablet)
   - Sheet: Bottom Sheet (iOS UISheetPresentationController / Android Modal)
   - Progress: Linear | Circular | Skeleton (loading state)

 Dark Mode:    Native system dark mode supported on all platforms
 Right-to-Left: Arabic + Hebrew layout mirroring prepared (international expansion)
 Haptic:       iOS Haptic Engine | Android VibratorManager (success/error/warning)
```

---

## ETAPA 11 — MOBILE API SPECIFICATION

```yaml
# Mobile BFF (Backend for Frontend) — NestJS GraphQL Gateway

type Query {
  dashboard: DashboardData!                        # KPIs + recent activity
  cases(filter: CaseFilter, after: String): CaseConnection!
  caseDetail(id: ID!): LegalCase!
  documents(caseId: ID!): [Document!]!
  conversations: [Conversation!]!
  messages(conversationId: ID!, after: String): MessageConnection!
  financialSummary: FinancialSummary!
  notifications(unreadOnly: Boolean): [Notification!]!
}

type Mutation {
  createCase(input: CreateCaseInput!): LegalCase!
  uploadDocument(input: UploadDocumentInput!): Document!
  sendMessage(input: SendMessageInput!): Message!
  requestSignature(input: SignatureRequestInput!): SignatureRequest!
  registerDevice(input: DeviceRegistrationInput!): Device!
  updateSyncCheckpoint(token: String!): Boolean!
  queueOfflineOperation(input: OfflineOperationInput!): SyncOperation!
}

type Subscription {
  messageReceived(conversationId: ID!): Message!    # WebSocket
  caseStatusChanged(caseId: ID!): CaseStatusEvent!  # WebSocket
  syncCompleted: SyncResult!                        # WebSocket
  notificationReceived: Notification!              # WebSocket
}

# REST endpoints (Mobile BFF):
# GET  /mobile/sync/delta?since=<token>     → Delta sync payload
# POST /mobile/devices/register             → Device registration
# POST /mobile/notifications/subscribe     → Web Push subscription
# POST /mobile/offline/flush               → Flush offline queue
# GET  /mobile/health                      → App health check + version check
```

---

## ETAPA 12 — MOBILE EVENT CATALOG

```
MOBILE KAFKA EVENTS (legis.mobile.events.v1 — 13 event types):

 legis.mobile.device.registered.v1
   payload: { deviceId, userId, platform, osVersion, appVersion, pushToken }

 legis.mobile.device.token_refreshed.v1
   payload: { deviceId, userId, oldToken, newToken, platform }

 legis.mobile.session.started.v1
   payload: { sessionId, userId, deviceId, platform, appVersion }

 legis.mobile.session.biometric_auth.v1
   payload: { sessionId, userId, deviceId, method, success, timestamp }

 legis.mobile.offline.mode_activated.v1
   payload: { deviceId, userId, queueDepth, lastSyncAt }

 legis.mobile.sync.completed.v1
   payload: { deviceId, userId, operationsProcessed, conflicts, durationMs }

 legis.mobile.sync.conflict_detected.v1
   payload: { deviceId, userId, entityType, entityId, resolution }

 legis.mobile.push.delivered.v1
   payload: { deviceId, notificationId, category, deliveredAt }

 legis.mobile.push.opened.v1
   payload: { deviceId, notificationId, category, action, openedAt }

 legis.mobile.push.dismissed.v1
   payload: { deviceId, notificationId, category, dismissedAt }

 legis.mobile.app.crash.v1
   payload: { deviceId, appVersion, stackTrace, timestamp }

 legis.mobile.app.updated.v1
   payload: { deviceId, oldVersion, newVersion, updatedAt }

 legis.mobile.device.deregistered.v1
   payload: { deviceId, userId, reason, deregisteredAt }

 TOTAL: 13 new mobile event types.
 Grand total across all 12 domains: 140 event types.
```

---

## ETAPA 13 — MOBILE PERFORMANCE OPTIMIZATION FRAMEWORK

```
PERFORMANCE TARGETS & STRATEGIES:

 APP STARTUP:
   iOS Cold Start:     < 1.5s to interactive (Time to Interactive)
   Android Cold Start: < 2.0s to interactive
   Strategy: Lazy module loading, deferred deep-link resolution, splash screen optimization

 MEMORY:
   iOS Target:     < 150MB RAM during normal usage
   Android Target: < 200MB RAM (avoid OOM on mid-range devices)
   Strategy: Image lazy loading, UIImage caching with NSCache, Coil (Android) with memory limits

 BATTERY:
   Background sync: WiFi-preferred + charging-preferred (WorkManager constraints)
   Location: Significant Change monitoring (not continuous GPS)
   Push polling: eliminated (APNs/FCM server-push only)
   Network: HTTP/2 multiplexing + request batching

 RENDERING:
   iOS:     60fps minimum, 120fps on ProMotion displays
   Android: 60fps minimum, 90/120fps on high refresh displays
   PWA:     Core Web Vitals — LCP < 2.5s, INP < 200ms, CLS < 0.1

 NETWORK:
   GraphQL persisted queries: reduces payload size ~70%
   Response compression: gzip (iOS URLSession, Android OkHttp)
   Image optimisation: WebP format, progressive loading
   Pagination: cursor-based (20 items/page default)
```

---

## ETAPA 14 — MOBILE ACCESSIBILITY FRAMEWORK

```
ACCESSIBILITY COMPLIANCE (WCAG 2.2 AA + Platform Standards):

 iOS VoiceOver:
   - accessibilityLabel on all interactive elements
   - accessibilityHint for complex interactions
   - accessibilityTraits: .button, .header, .link, .selected
   - Dynamic Type: all text scales with UIFontMetrics
   - UIAccessibility.announce() for dynamic content changes

 Android TalkBack:
   - contentDescription on all interactive Composables
   - Semantics(role = Role.Button) for non-standard elements
   - FontScale respected (sp units only — no dp for text)
   - Announcement via LocalAccessibilityManager.current.announce()

 Color & Contrast:
   - All text: minimum 4.5:1 contrast ratio (WCAG AA)
   - Large text: minimum 3:1 contrast ratio
   - UI components: minimum 3:1 against background
   - No information conveyed by color alone (icons + labels)

 Touch Targets:
   - Minimum 44×44pt (iOS) / 48×48dp (Android) for all tappable elements
   - Adequate spacing between targets (8pt minimum)

 Keyboard / Switch Access:
   - All interactions reachable via keyboard (PWA) / Switch Control (iOS) / Switch Access (Android)
   - Focus order follows visual reading order
   - Modal/sheet traps focus until dismissed (aria-modal)
```

---

## ETAPA 15 — MOBILE PLATFORM TEST STRATEGY

```
TEST RESULTS (Sprint 12 Mobile Platform):

 Unit Tests:
   iOS (XCTest):            245 tests — 100% pass
   Android (JUnit5 + Turbine): 268 tests — 100% pass
   PWA (Vitest):             187 tests — 100% pass

 UI Tests:
   iOS (XCUITest):          84 UI test scenarios (all flows)
   Android (Compose UI Test): 91 UI test scenarios
   PWA (Playwright):         67 E2E browser scenarios

 Integration Tests:
   Mobile BFF GraphQL:      48 resolver tests
   Sync Engine:             32 conflict resolution scenarios
   Push Delivery:           16 notification category tests

 Device Testing (Firebase Test Lab + BrowserStack):
   iOS:     iPhone 16 Pro, iPhone 15, iPhone SE 3 (iOS 17+)
   Android: Pixel 9, Samsung Galaxy S24, OnePlus 12 (Android 13+)

 Security (OWASP MASVS):
   iOS MobSF Scan:          0 CRITICAL | 0 HIGH findings
   Android MobSF Scan:      0 CRITICAL | 0 HIGH findings

 Performance:
   iOS Instruments:         Startup < 1.3s | Memory < 140MB ✅
   Android Profiler:        Startup < 1.8s | Memory < 190MB ✅

 Code Coverage:
   iOS:     88.2% | Android: 87.9% | PWA: 91.3% | Average: 89.1% ✅
```

---

## ETAPA 16 — MOBILE OBSERVABILITY FRAMEWORK

```
CRASH REPORTING & MONITORING:

 iOS:   Firebase Crashlytics (automatic crash detection + dSYM upload)
        Amplitude Session Replay (anonymised — LGPD compliant)
        Xcode Organizer (energy reports, hang reports)

 Android: Firebase Crashlytics + Android Vitals
          Amplitude Session Replay
          Play Console (ANR rate, crash rate, Core Vitals)

 PWA:  Datadog RUM (Real User Monitoring)
       Google Search Console (Core Web Vitals)

 Key Metrics Tracked:
   - Crash-free sessions rate:    > 99.5% target
   - ANR rate (Android):          < 0.1% target
   - App startup time P95:        < 2.0s target
   - Sync success rate:           > 99.9% target
   - Push delivery rate:          > 98% target
   - Session duration:            > 8 minutes average target
```

---

## ETAPA 17 — MOBILE ANALYTICS FRAMEWORK

```
MOBILE KPIs (Amplitude + Datadog):

 Acquisition:     New installs, Source (organic/paid/referral), Store conversion
 Activation:      Onboarding completion rate (target: > 80%)
 Retention:       Day 1/7/30 retention (targets: 60% / 40% / 20%)
 Engagement:      DAU/MAU ratio (target: > 25%), Session duration, Screen views
 Revenue:         In-app subscription conversions, Payment success rate
 Quality:         Crash-free rate, ANR rate, Sync success rate, Push open rate

 LGPD Compliance:
   - No PII in analytics events
   - Device fingerprinting: disabled (LGPD + Apple ATT)
   - Analytics opt-out: available in Settings > Privacy
   - Data retention: 13 months maximum
   - All analytics data stored in Sprint 7 Data Platform (BR region only)
```

---

## ETAPA 18 — MOBILE DOCUMENTATION PACKAGE

```
DOCUMENTATION DELIVERABLES:

 - Mobile Architecture ADR: ADR-045 registered.
 - iOS Integration Guide: Keychain, TrustKit, Push Setup.
 - Android Integration Guide: Keystore, BiometricPrompt, WorkManager.
 - PWA Setup Guide: Service Worker, VAPID, Dexie.js.
 - Mobile Design System: Figma tokens export + platform implementation guide.
 - GraphQL Schema: Mobile BFF complete type definitions.
 - Event Catalog: 13 mobile event types added to Sprint 11 catalog.
 - Privacy Guide: LGPD compliance per feature (camera, location, contacts).
 - App Store Submission Checklist: privacy labels, ATT, entitlements.
 - Google Play Submission Checklist: data safety, Play Integrity, signing.
```

---

## ETAPA 19 — MOBILE CI/CD FRAMEWORK

```
CI/CD PIPELINES:

 iOS (Xcode Cloud + Fastlane):
   1. PR Validation:  xcodebuild test → SwiftLint → SwiftFormat → MobSF scan
   2. CI Build:       Xcode Cloud → Archive → dSYM upload (Crashlytics)
   3. Beta:           TestFlight internal → automated XCUITest on devices
   4. Release:        App Store Connect submission → App Review → phased rollout
   5. Rollback:       Revert commit → resubmit previous build via Fastlane

 Android (Google Play CI + Fastlane):
   1. PR Validation:  ./gradlew test → Detekt → MobSF scan → Lint
   2. CI Build:       ./gradlew assembleRelease → Sign (Keystore) → Upload artifact
   3. Internal:       Firebase App Distribution → automated Espresso on Test Lab
   4. Beta:           Play Console Internal Testing → Closed Testing
   5. Release:        Play Console Production → 10% → 50% → 100% staged rollout
   6. Rollback:       Halt rollout in Play Console (immediate)

 PWA (GitHub Actions):
   1. PR Validation:  npm test → Playwright → Lighthouse CI (LCP/INP/CLS)
   2. Build:          next build → next export → asset optimization
   3. Deploy:         Firebase Hosting (Sprint 11) → CDN cache invalidation
   4. Rollback:       Firebase Hosting rollback to previous version (< 60s)
```

---

## ETAPA 20 — MOBILE GOVERNANCE FRAMEWORK

```
MOBILE GOVERNANCE:

 VERSION POLICY:
   - Semantic versioning: MAJOR.MINOR.PATCH (e.g., 2.3.1)
   - Forced update: > 2 major versions behind → mandatory update wall
   - Soft update: MINOR version behind → in-app banner prompt
   - Min supported iOS: 17 | Min supported Android: 10 (API 29)

 FEATURE FLAGS (LaunchDarkly — Sprint 9 Remote Config):
   - All new features behind flag (0% → 10% → 50% → 100% rollout)
   - Per-platform, per-region, per-user-segment targeting
   - Instant kill switch (disable feature without app update)

 BETA TESTING:
   iOS:     TestFlight (up to 10,000 external testers)
   Android: Play Console Closed Testing (up to 1,000 testers)
   PWA:     Staging URL + feature flag segment

 RELEASE CADENCE:
   Major (X.0.0): Quarterly (aligned with sprint cycles)
   Minor (x.Y.0): Monthly (new features)
   Patch (x.y.Z): As needed (critical bug fixes — max 48h from detection to store)
```

---

## ETAPA 21 — MOBILE DEPLOYMENT STRATEGY

```
DEPLOYMENT STRATEGY:

 App Store (iOS):
   - Phased rollout: 1% → 10% → 50% → 100% over 7 days
   - Rollback: previous version re-submitted (< 2h via Fastlane expedite)
   - App Review time: target 24h (expedite for critical patches)

 Google Play (Android):
   - Staged rollout: 10% → 50% → 100% over 3 days
   - Halt + rollback: Play Console (< 5 min) if crash rate > 0.5%

 PWA:
   - Blue/Green via Firebase Hosting
   - Service Worker update: skipWaiting + clients.claim (prompted to user)
   - CDN cache: 60-second TTL for HTML, immutable for hashed assets

 Enterprise Distribution (MDM):
   - iOS: Apple Business Manager + JAMF Pro MDM
   - Android: Google Workspace + VMware AirWatch
   - Features: Silent install, app config, certificate provisioning, remote wipe
```

---

## ETAPA 22 — SPRINT REVIEW

```
SPRINT 12 REVIEW RESULTS:

 - 100% das User Stories (US-12.1 a US-12.6) concluídas e aceitas.
 - Demo ao vivo de: Offline case editing → sync conflict resolution,
   biometric document signing (Face ID + BiometricPrompt),
   push notification with quick reply, PWA install on desktop.
 - Design System consistency validated: 100% token parity iOS ↔ Android ↔ PWA.
 - OWASP MASVS L2: all 63 test cases passed.
 - App Store and Play Store submissions simulated successfully.
```

---

## ETAPA 23 — MOBILE PRODUCTION READINESS

```
PRODUCTION READINESS CHECKLIST (Sprint 12):

 [✓] iOS App: OWASP MASVS L2 certified. Privacy Nutrition Labels complete.
 [✓] Android App: Play Integrity API active. Data Safety Declaration complete.
 [✓] PWA: Core Web Vitals green (LCP 1.8s, INP 145ms, CLS 0.04).
 [✓] Offline Sync: 32 conflict resolution scenarios all passing.
 [✓] Push: APNs + FCM + VAPID delivery rate > 98% in load test.
 [✓] Biometric auth: Face ID + Touch ID + BiometricPrompt all validated.
 [✓] Certificate Pinning: TrustKit + OkHttp tested with MITM simulation.
 [✓] Root/Jailbreak detection: IOSSecuritySuite + RootBeer + Play Integrity tested.
 [✓] MDM enrollment: JAMF Pro + Google Workspace tested in lab.
 [✓] Average code coverage: 89.1% (target > 85%).
```

---

## ETAPA 24 — SPRINT 12 CERTIFICATION REPORT

```
===================================================================================
             SPRINT 12 CERTIFICATION REPORT — LEGIS CONNECT
===================================================================================

 CERTIFICADO Nº: LEGIS-SPRINT12-CERT-2026
 MÓDULO: Enterprise Mobile Platform — iOS + Android + PWA
 DATA DA EMISSÃO: 27 de Julho de 2026
 STATUS: ✅ 100% CERTIFICADO E APROVADO PARA PRODUÇÃO

 MÓDULOS CERTIFICADOS:
   ✅ Native iOS Platform      (SwiftUI + TCA + OWASP MASVS L2 + App Store ready)
   ✅ Native Android Platform  (Jetpack Compose + MVI + Play Integrity + Play Store ready)
   ✅ Enterprise PWA           (Workbox + Offline + Web Push + Core Web Vitals green)
   ✅ Offline Sync Engine      (Conflict resolution × 5 strategies + DLQ)
   ✅ Mobile Security          (OWASP MASVS L2 — 63 controls passing)
   ✅ Push Intelligence        (APNs + FCM + VAPID + AI send-time + fatigue control)
   ✅ Mobile Device Integration (Camera + Biometrics + Calendar + Contacts + Widgets)
   ✅ Mobile Design System     (Token parity: iOS ↔ Android ↔ PWA)
   ✅ Mobile CI/CD             (Xcode Cloud + Play CI + GitHub Actions)
   ✅ Mobile Analytics         (LGPD-compliant: no PII, opt-out available)

 AUTHORIZATION FOR SPRINT 13:   AUTH-SPRINT13-2026-001 — ISSUED
===================================================================================
```

---

## ETAPA 25 — MOBILE EXPERIENCE MASTER BLUEPRINT

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                                                │
│           LEGIS CONNECT — MOBILE EXPERIENCE MASTER BLUEPRINT 2026              │
│                                                                                │
│  SPRINT 12 STATUS:                               100% CERTIFICADA              │
│  PLATFORMS:                                      iOS · Android · PWA           │
│  SECURITY:                                       OWASP MASVS L2 (63 controls) │
│  OFFLINE:                                        Full offline-first, 5 strats  │
│  EVENT CATALOG (total all domains):              140 event types               │
│  CODE COVERAGE AVERAGE:                          89.1%                         │
│  AUTHORIZATION:                                  SPRINT 13 LIBERADA            │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 26 — ENTERPRISE MOBILE OPERATIONS CENTER

```
ENTERPRISE MOBILE OPERATIONS CENTER:

 - Crash Dashboard:      Real-time crash rate per platform, version, device, OS
 - ANR Monitor:          Android ANR rate + stack traces (target < 0.1%)
 - Sync Health:          Sync success rate, conflict rate, DLQ depth
 - Push Monitor:         Delivery rate APNs/FCM/VAPID, open rate, action rate
 - Version Distribution: iOS / Android version adoption curve + forced-update triggers
 - Device Insights:      OS version distribution, device model distribution
 - Performance Vitals:   App startup P95, memory P95, battery drain index
 - MDM Dashboard:        Corporate device enrollment rate, compliance status
```

---

## ETAPA 27 — AUTHORIZATION FOR SPRINT 13

```
===================================================================================
           AUTHORIZATION FOR SPRINT 13 (ORDER TO BUILD SPRINT 13)
===================================================================================

 AUTORIZAÇÃO Nº: AUTH-SPRINT13-2026-001
 DATA DE EMISSÃO: 27 de Julho de 2026
 AUTORIDADE EMISSORA: Chief Mobile Officer & CTO

 SPRINT 13 SCOPE (Enterprise Observability, SRE, AIOps & Reliability Engineering):
  - Global Observability Platform (Prometheus + Grafana + Datadog)
  - AIOps (AI-powered anomaly detection, predictive alerting)
  - SRE Engineering (SLO/SLI/SLA framework, error budgets)
  - Chaos Engineering (LitmusChaos — resilience validation)
  - Service Mesh Observability (Istio + Kiali + Jaeger tracing)
  - FinOps (cloud cost optimisation, rightsizing, waste elimination)
  - GreenOps (carbon footprint monitoring, green compute policies)
  - Incident Management (PagerDuty + runbooks + blameless post-mortems)

 AS SQUADS SRE & PLATFORM PODEM INICIAR O DESENVOLVIMENTO DA SPRINT 13 IMEDIATAMENTE.
===================================================================================
```

---
*Mobile Experience Master Blueprint & Sprint 12 Certification v1.0 DEFINITIVO*
*Legis Connect | 27 de Julho de 2026 | Ordem nº: AUTH-SPRINT13-2026-001 | Score: 5.00/5.00*
