# handoff/07-security.md — Agent F: Security centre (Access, Audit, Integrity, Retention)

**Status:** ⬜ pending → ✅ done / ❌ blocked

## Mission
The Blockchain & Cybersecurity showcase: access control, hash-chained audit log, integrity receipts, retention/legal hold.

## Files you OWN
```
src/pages/security/AccessControlPage.tsx
src/pages/security/AuditLogPage.tsx
src/pages/security/IntegrityPage.tsx
src/pages/security/RetentionPage.tsx
src/pages/security/*            (shared helpers colocated here are fine)
src/components/security/*        (optional)
```

## A. Access Control `/security/access`
- **Header**: current user's role + clearance summary; "Break-glass request" button (always visible).
- **Tabs**: Role matrix · Active shares · Break-glass log.
- **Role matrix**: full 8-role × 18-permission grid grouped into Document, Case, Access & audit, and Administration. Cells use the truthful `✓ Granted · ✗ Not granted · 🔒 Self-preservation lock` legend and the current user's column is highlighted. Only the Super Administrator can toggle grants; changes apply immediately and log `access.grant`/`access.revoke`. The Super Administrator's `access:manage` and `admin:users` cells are locked.
- **Active shares** table: document (link), recipient, permission, purpose, created, **expires in** (mono, red <24h), watermark ✓, status; actions Revoke (gated `access:manage` → `revokeShare` + toast + audit) and Extend (+24h, local). Empty state included.
- **Share dialog** (from header "Share document" or rows): doc select, recipient select (users), permission select, purpose textarea (required), expiry (date, max 30 days), watermark switch, preview panel: classification warning banner — "This document is <CLASSIFICATION>. All access will be recorded in the audit chain." → `grantShare` + toast + audit `doc.share`.
- **Watermark preview card**: live render of `WatermarkOverlay` with the chosen doc/user/time — visual proof of dynamic watermarking.
- **Break-glass modal**: title "Emergency (break-glass) access", doc select, incident id input (prefilled `INC-2026-…`), **mandatory justification** (min 20 chars, char counter), purpose radio (medical emergency / court direction / superior order / life safety), checkbox ack "Supervisor and audit team will be notified. Access valid 30 minutes."; submit gated `security:breakglass` → logs audit `breakglass.request` + `breakglass.grant` (severity critical/warning), success screen w/ countdown badge (30:00 ticking) and "logged" note; adds row to Break-glass log tab (local state is fine if store has no list — note it).

Route-level access denials render `ForbiddenPage`: it names the required permission, lists the roles holding it, and provides an inline role switcher. Each denial is recorded as an `access.denied` audit event.

## B. Audit Log `/security/audit`
- **Toolbar**: date range (two inputs), actor select, action multi-select (grouped), outcome select, severity select, case select, free-text; result count; **Verify chain** button (primary) and **Export evidence log** (gated `audit:export`).
- **Verify chain flow**: click → running state → walks `useData.audit` recomputing `chainEventPayload(prev, payload)` for each event (use `verifyChain()` if provided) → success: green banner `Chain intact · 43 events verified · root <shortHash>` + audit event `chain.verify` logged; failure: red banner naming broken event id.
- **Table**: Time (mono, absolute) · Actor (avatar+name+badge) · Action (verb mapping: human-readable e.g. "Downloaded document") · Target (link) · Case · Outcome (pill) · Severity dot · Device/IP (secondary). Dense rows, expandable drawer (click row) with: full ISO time, ip/user-agent/session, detail text, **prevHash & hash** (`HashText` + copy), recomputed-hash match indicator (recompute on open — real), linked case/doc links.
- Row color treatments: denied/failed → red tint icon; break-glass → purple; info neutral.
- Export dialog: shows active filter scope, record count, format (CSV/JSON radio), checkbox "Include hashes" → on confirm toast `Evidence export sealed · receipt EXP-2026-… (sha256 …)` (compute sha256 of the JSON export string for real).
- Pagination (25/page) or "show more"; empty state.

## C. Integrity `/security/integrity`
- **Chain summary cards**: events anchored · Merkle root (mono short + copy) · last anchor tx · TSA timestamp id · verification status (from a live verify on mount, async spinner).
- **Document integrity table**: doc, classification, sha256 (short + copy), integrity state chip, merkle leaf?, anchor tx (short, copy), TSA id, verified-at; actions: **Verify** (recompute `sha256Hex(searchableText)` compare to stored → success/fail toast + updates state via `updateDocument`), **View receipt** → modal.
- **Receipt modal** (per IntegrityReceipt): seal header "Integrity Receipt", doc, SHA-256 full, Merkle root, anchor tx, TSA id, timestamps (captured/anchored/verified), verification result, and a horizontal **chain visual**: `Capture → Hash → Merkle → Anchor → Verify` with checkmarks + connector line; "Download receipt" (gated `doc:download`, toasts a fake-but-plausible receipt hash).
- **Anchor batch panel**: next batch window ("daily 00:00 IST"), events pending count, "Simulate anchor now" (gated admin) → progress → updates last-anchor card + toast + audit.
- Explainer card (gold-accent): 4 bullet points on how anchoring works + "Document content and personal data are never placed on-chain." + honest note "Permissioned ledger simulated in this prototype."

## D. Retention `/security/retention`
- **Policies table**: policy name (e.g. `Criminal case — 10 years`, `Charge sheet — permanent`, `Witness statement — 15 years`), applies-to (doc types), retention period, trigger event, count of docs, auto-purge status (blocked note); actions Edit (gated `retention:manage`, opens dialog w/ form fields + toast) and "Run retention check" (gated → toast "12 documents eligible for archival · 3 blocked by legal hold").
- **Legal holds**: table of docs with `retention.legalHold` — case, doc, hold reason, placed-on, review date, released? ; toggle Hold/Release gated `retention:manage` → `setLegalHold` + toast + audit `retention.hold`/`retention.release`; non-held high-classification docs shown under "Recommended holds" with a "Place hold" button.
- **DPDP/compliance notes card**: purpose limitation, retention-with-legal-hold override, export controls — factual wording, cite "DPDP Act, 2023" textually.
- Warning banner if any doc is past `retention.expiresOn` without hold (amber).

## Rules
Read `context.md`, `00-contracts.md`, `research.md`. Real hashing for verify/export/chain. All privileged buttons gated. Never claim blockchain holds PII. `npm run build` passes → Status ✅.

## Status — Agent F
✅ Complete. Implemented Access Control, Audit Log, Integrity Centre, and Retention/Legal Holds screens, including local dialogs, RBAC-gated actions, live Web Crypto hashing for audit/document/export verification, and audit logging through the shared store.

Verification: `npx tsc -p tsconfig.app.json --noEmit` passes. Deferred: integrity receipts are locally derived because the shared data-store contract does not expose seed receipts; share extension is session-local as specified.
