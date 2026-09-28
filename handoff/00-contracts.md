# handoff/00-contracts.md — Shared API contracts (source of truth)

All screen agents import from these modules. **Only the core agent creates/edits them.**
Screen agents never redefine these types; if something is missing, request it via your handoff status note.

## 3.1 `src/lib/types.ts`

```ts
export type Classification = 'public' | 'official' | 'confidential' | 'restricted' | 'sealed'

export type DocType =
  | 'fir' | 'charge-sheet' | 'witness-statement' | 'forensic-report'
  | 'court-order' | 'evidence-record' | 'legal-notice' | 'case-diary'
  | 'judgment' | 'application' | 'cctv-still' | 'expert-deposition'

export type CaseStatus = 'registered' | 'under-investigation' | 'charge-sheet-filed' | 'in-trial' | 'closed' | 'archived'

export type DocStatus = 'draft' | 'in-review' | 'approved' | 'filed' | 'rejected' | 'archived'

export type IntegrityState = 'verified' | 'pending' | 'warning' | 'failed'
export type SignatureState = 'unsigned' | 'pending' | 'valid' | 'expired' | 'revoked'

export type Role =
  | 'investigator' | 'station-officer' | 'prosecutor'
  | 'court-clerk' | 'evidence-custodian' | 'auditor' | 'admin' | 'superadmin'

export type Permission =
  | 'doc:view' | 'doc:download' | 'doc:upload' | 'doc:annotate' | 'doc:redact'
  | 'doc:sign' | 'doc:approve' | 'doc:share' | 'doc:delete'
  | 'case:view' | 'case:create' | 'case:assign'
  | 'access:manage' | 'audit:view' | 'audit:export'
  | 'retention:manage' | 'admin:users' | 'security:breakglass'

export type ControlArea = 'topbar' | 'documents' | 'cases' | 'approvals' | 'admin' | 'security'

export interface ControlDef {
  id: string
  label: string
  area: ControlArea
  permission?: Permission
  stub: boolean
  builtin: boolean
}

export interface User {
  id: string            // 'u-001'
  name: string
  designation: string   // 'Sub-Inspector'
  role: Role
  badgeId: string       // 'MH-POL-2291'
  station: string
  department: string
  clearance: Classification  // highest clearance the user holds
  initials: string
  email: string
}

export interface CaseRecord {
  id: string            // 'CASE-2026-0184'
  firNumber: string     // 'FIR/PS-CYBER/2026/0451'
  title: string
  crimeType: string     // 'Cyber Fraud'
  status: CaseStatus
  classification: Classification
  station: string
  district: string
  state: string
  ioName: string        // investigating officer
  ioBadge: string
  sections: string[]    // ['BNS s.318(4)', 'IT Act s.66D']
  cnr?: string
  court?: string
  registeredOn: string  // ISO date
  updatedOn: string
  description: string
  parties: { role: 'complainant' | 'accused' | 'witness' | 'victim'; name: string; notes?: string }[]
  tags: string[]
}

export interface DocumentRecord {
  id: string            // 'DOC-2026-0451-01'
  caseId: string
  title: string
  docType: DocType
  classification: Classification
  status: DocStatus
  mimeType: string
  ext: string           // 'pdf'
  sizeBytes: number
  pageCount: number
  sha256: string
  ocrState: 'not-started' | 'processing' | 'complete' | 'failed'
  searchableText: string   // seeded body used for search + facsimile
  integrity: IntegrityState
  signature: { state: SignatureState; signer?: string; signedAt?: string; certId?: string }
  version: number
  createdBy: string     // user id
  createdAt: string
  updatedBy: string
  updatedAt: string
  custodian: string     // user id
  tags: string[]
  language: string      // 'English' | 'Hindi' | 'Marathi'
  retention: { policy: string; expiresOn: string; legalHold: boolean }
  summary: string       // one-line AI-ish summary shown in lists
}

export interface DocumentVersion {
  id: string
  docId: string
  version: number
  label: string         // 'Original intake', 'Redacted for court'
  sha256: string
  authorId: string
  createdAt: string
  note: string
}

export type AuditAction =
  | 'login.success' | 'login.failed' | 'mfa.challenge'
  | 'doc.view' | 'doc.download' | 'doc.upload' | 'doc.version.create'
  | 'doc.share' | 'doc.sign' | 'doc.redact' | 'doc.delete' | 'doc.export'
  | 'access.grant' | 'access.revoke' | 'access.denied'
  | 'breakglass.request' | 'breakglass.grant' | 'breakglass.expire'
  | 'retention.hold' | 'retention.release'
  | 'chain.verify' | 'integrity.mismatch' | 'approval.decide'

export interface AuditEvent {
  id: string
  ts: string            // ISO
  actorId: string
  actorName: string
  actorBadge: string
  action: AuditAction
  targetType: 'document' | 'case' | 'user' | 'system' | 'session'
  targetId: string
  targetLabel: string
  caseId?: string
  outcome: 'success' | 'denied' | 'failure'
  severity: 'info' | 'notice' | 'warning' | 'critical'
  ip: string
  device: string
  detail?: string
  prevHash: string      // hex sha256 of previous event (or GENESIS)
  hash: string          // hex sha256 of this event payload + prevHash
}

export interface CustodyEvent {
  id: string
  docId: string
  ts: string
  kind: 'intake' | 'transfer' | 'seal' | 'unseal' | 'access' | 'derivative' | 'export' | 'return'
  fromCustodian?: string
  toCustodian?: string
  actorName: string
  location: string
  note: string
  hash: string
}

export interface ApprovalRequest {
  id: string
  docId: string
  caseId: string
  kind: 'charge-sheet' | 'evidence-export' | 'redaction' | 'share-elevated' | 'bsa-certificate'
  title: string
  requestedBy: string   // user id
  requestedAt: string
  assignedTo: string    // user id
  state: 'pending' | 'approved' | 'rejected' | 'changes-requested'
  dueOn: string
  note: string
}

export interface ShareLink {
  id: string
  docId: string
  recipientId: string
  recipientName: string
  permission: 'view' | 'view-download'
  purpose: string
  createdAt: string
  expiresAt: string
  watermark: boolean
  status: 'active' | 'expired' | 'revoked'
}

export interface IntegrityReceipt {
  docId: string
  sha256: string
  merkleRoot: string
  anchorTx: string       // fake ledger tx id
  anchoredAt: string
  tsaId: string          // trusted timestamp token id
  signerCert?: string
  verifiedAt?: string
}

export interface RolePermissionMatrix {
  role: Role
  permissions: Permission[]
}
```

## 3.2 Store modules (zustand, created by core agent)

```ts
// src/store/session.ts
useSession: {
  user: User                     // current acting user (demo switchable)
  users: User[]
  setUserId(id: string): void    // role switcher in topbar
  theme: 'light' | 'dark'
  toggleTheme(): void
  authenticated: boolean
  signIn(user: User): void
  signOut(): void
}

// src/store/data.ts  (the mock "database")
useData: {
  cases: CaseRecord[]
  documents: DocumentRecord[]
  versions: DocumentVersion[]
  audit: AuditEvent[]            // hash-chained, append-only
  custody: CustodyEvent[]
  approvals: ApprovalRequest[]
  shares: ShareLink[]
  // selectors
  getCase(id): CaseRecord | undefined
  getDocument(id): DocumentRecord | undefined
  documentsOfCase(caseId): DocumentRecord[]
  versionsOf(docId): DocumentVersion[]
  auditFor(targetId): AuditEvent[]
  custodyFor(docId): CustodyEvent[]
  // mutations (all log audit automatically)
  addDocument(doc: Partial<DocumentRecord> & { title: string; caseId: string; docType: DocType }): DocumentRecord
  updateDocument(id: string, patch: Partial<DocumentRecord>): void
  addVersion(docId: string, label: string, note: string): DocumentVersion
  logAudit(event: Omit<AuditEvent, 'id' | 'ts' | 'prevHash' | 'hash' | 'actorId' | 'actorName' | 'actorBadge'>): AuditEvent
  decideApproval(id: string, state: 'approved' | 'rejected' | 'changes-requested', note: string): void
  grantShare(share: Omit<ShareLink, 'id' | 'createdAt' | 'status'>): void
  revokeShare(id: string): void
  setLegalHold(docId: string, on: boolean): void
  verifyChain(): { ok: boolean; brokenAt?: string }
}
```

## 3.3 `src/lib/permissions.ts`
```ts
export function can(user: User, perm: Permission): boolean
export function useCan(): (perm: Permission) => boolean
export function useMatrix(): RolePermissionMatrix[]
export function denialMessage(perm: Permission): string
export const DEFAULT_MATRIX: RolePermissionMatrix[]
export const ROLE_MATRIX: RolePermissionMatrix[] // legacy read-only alias of DEFAULT_MATRIX
export const ROLE_LABELS: Record<Role, string>
```
Screen agents MUST gate sensitive controls with `can()` / `useCan()`. Denial surfaces use
`denialMessage(perm)`, which produces `Requires “<label>” — granted to <role list>`.

## 3.4 RBAC routes, state, and primitives

- `src/lib/routes.ts` exports `ROUTE_PERMISSIONS`, `NAV_PERMISSIONS`, and `permissionForPath()`.
- `src/store/rbac.ts` owns the persisted live matrix, builtin-control state, and custom controls.
- `src/components/rbac/Control.tsx` exports `Control`, `useControl`, `CustomControlsDock`, and `runControl`.
- `src/components/rbac/RoleMatrixTable.tsx` renders the shared live role matrix.

### `src/lib/access.ts`
```ts
export type AccessDenied = { status: 'denied'; required: Classification; actual: Classification }
export type CaseAccess = { status: 'ok'; record: CaseRecord } | { status: 'missing' } | AccessDenied
export type DocumentAccess = { status: 'ok'; record: DocumentRecord } | { status: 'missing' } | AccessDenied
export function isCaseVisible(record: CaseRecord, user: User, clearance: Classification): boolean
export function isDocumentVisible(record: DocumentRecord, ctx: { cases: readonly CaseRecord[]; user: User; clearance: Classification }): boolean
export function useVisibleCases(): CaseRecord[]
export function useVisibleDocuments(): DocumentRecord[]
export function useVisibleApprovals(): ApprovalRequest[]
export function useCaseAccess(id: string | undefined): CaseAccess
export function useDocumentAccess(id: string | undefined): DocumentAccess
export function useCanSeeDocument(): (record: DocumentRecord) => boolean
```

## 3.5 `src/lib/crypto.ts`
```ts
export async function sha256Hex(input: string | ArrayBuffer): Promise<string>  // Web Crypto
export function shortHash(hex: string, n?: number): string  // 'a1b2c3…9f0e'
export const GENESIS = '0'.repeat(64)
export async function chainEventPayload(prevHash: string, payload: unknown): Promise<string>
```

## 3.6 `src/lib/format.ts`
```ts
formatBytes(n), formatDate(iso), formatDateTime(iso), formatRelative(iso),
formatINR(n) /* not needed */, classNames → use cn from 'cn'
```

## 3.7 Shared domain components (`src/components/domain/`) — created by core agent

| Component | Props (abridged) | Purpose |
|---|---|---|
| `PageHeader` | title, subtitle?, breadcrumb?, actions? | page chrome |
| `ClassificationBadge` | value, size? | color + text + lock icon |
| `IntegrityBadge` | state, onClick? | verified/pending/failed chip |
| `StatusChip` | status (case/doc/approval) | neutral status pill |
| `RoleBadge` | role | role label chip |
| `UserAvatar` | user, size? | initials avatar + name |
| `HashText` | value, copyable? | mono truncated hash w/ copy |
| `PermissionGate` | perm, children, fallback? | wraps buttons needing RBAC |
| `EmptyState` | icon?, title, description, action? | empty placeholders |
| `StatCard` | label, value, delta?, icon?, tone? | dashboard KPI |
| `TimelineList` | items: {id, ts, title, detail?, tone?} | vertical timeline (custody/case) |
| `DocumentFacsimile` | doc, watermark? | serif-rendered mock page (FIR/charge sheet layout) used inside viewer |
| `WatermarkOverlay` | text | diagonal repeating watermark layer |

## 3.8 Layout (`src/components/layout/`) — core agent
- `AppShell`: fixed left sidebar (collapsible) + topbar + main content (own route outlet).
- Sidebar nav groups: **Operations** (Dashboard, Cases, Documents, Upload, Search) · **Workflow** (Approvals) · **Security** (Access Control, Audit Log, Integrity, Retention) · **System** (Admin).
- Topbar: global search entry (navigates `/search?q=`), notifications bell (dropdown with 3 items), theme toggle, **role switcher** (select user), user chip.
- Sidebar footer: build label `e-Sakshya v0.9 · DEMO` + classification banner "OFFICIAL — DEMO DATA".
- `AuthLayout` for `/login`.

## 3.9 Mock data requirements (core agent)
`src/data/` seeds:
- **8 users** across roles (investigator, station-officer, prosecutor, court-clerk, evidence-custodian, auditor, admin, superadmin) — Indian names, badges, stations.
- **6 cases** (cyber fraud, POSCO, narcotics, murder, financial fraud, missing person) with realistic FIR numbers, BNS/NDPS/POCSO sections, CNR, courts.
- **~16 documents** spread across cases covering every `DocType`, each with `searchableText` (600–1500 chars of realistic body — FIR format with header, complainant, sections, signature block; charge sheet; witness statement; forensic report; court order), all metadata, versions (1–3), sha256 (computed via crypto on the text at load or precomputed deterministic strings).
- **~40 audit events** forming a valid hash chain (compute sequentially in seed builder), plus 2 demo anomalies (a denied access, a failed login) marked severity accordingly.
- **~14 custody events**, **5 approvals** (2 pending assigned to demo user), **4 share links**, **4 integrity receipts** with Merkle root/anchor tx.
- Deterministic: stable IDs, no `Math.random()` at module scope (use a seeded PRNG or constants).

Seed module: `src/data/seed.ts` exporting `buildSeed()` returning everything; `src/store/data.ts` initializes from it.

## 3.10 Rules for ALL screen agents
1. Read `context.md` + this file + your handoff before coding.
2. **Only touch files listed in your handoff.** Never edit shared modules; extend locally.
3. Import shared components/types; don't duplicate them.
4. Realistic Indian data; no lorem ipsum; no emoji.
5. Gate privileged actions with `PermissionGate`/`can()`.
6. Page must compile under `tsc -b` strict + `noUnusedLocals`.
7. When done: run `npm run build` (fix YOUR errors), then update your handoff's Status section to ✅ with notes on anything deferred.
