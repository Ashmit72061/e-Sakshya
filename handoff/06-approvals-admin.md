# handoff/06-approvals-admin.md — Agent E: Approvals/eSign + Admin

**Status:** ⬜ pending → ✅ done / ❌ blocked

## Mission
Workflow & signing (legal validity demo) plus administration screens.

## Files you OWN
```
src/pages/approvals/ApprovalsPage.tsx  (+ src/pages/approvals/*)
src/pages/admin/AdminPage.tsx          (+ src/pages/admin/*)
src/components/approvals/*, src/components/admin/*  (optional)
```

## A. Approvals `/approvals`
- **Header stats**: Pending (mine) · Pending (all) · Approved 7d · Rejected 7d · Avg time (mono).
- **Filters**: kind (charge-sheet / evidence-export / redaction / share-elevated / bsa-certificate), state tabs (Pending | Approved | Rejected | All), assigned-to, search; count.
- **Queue table**: urgency (due date: red if <48h), kind chip, title + case chip (→ `/cases/:id`), requested by (avatar), assigned to, age (relative), state chip, action "Review" → opens **detail drawer/dialog**.
- **Detail view** (Sheet/Dialog, 480px): doc link + classification banner, request note, timeline of the request, decision actions gated by `doc:approve`:
  - **Approve** → `decideApproval(id,'approved')` + toast + audit; if kind is charge-sheet/bsa-certificate show **eSign ceremony modal** first:
    1. Identity check (current user, badge, role — must have `doc:sign`, else blocked tooltip)
    2. Authentication: 6-digit PIN boxes (demo hint `123456`) + "Sign document hash" — shows the doc `sha256` being hashed (mono, truncated), ticking progress
    3. Certificate issued modal: gold seal, signer, cert id `CCA-DEMO-2026-…`, TSA timestamp, algorithm SHA-256, "Signature valid" state; confirm → sets document `signature = {state:'valid', …}` via `updateDocument`, `decideApproval`, audit `doc.sign`.
  - **Reject** → textarea reason required → `decideApproval('rejected')`.
  - **Request changes** → note → state `changes-requested`.
- **Workflow rail** (in detail): `Intake → Review → Approved → Filed → Archived` with current step highlighted (derive from approval state + doc status).
- **BSA certificate preview**: for `bsa-certificate` kind show a certificate document preview (serif, fields: case, doc, hash, custody summary, device particulars, certifying officer, signature block) with "Export PDF" → confirmation dialog + fake receipt toast (gated `audit:export`... use `doc:download` if simpler — keep gating consistent with matrix).
- Empty state per tab.

## B. Admin `/admin` (tabs; the route requires `admin:users`, and a denied user receives the shared 403 screen)
1. **Users** — table: avatar, name, designation, role badge, badge id, station, clearance, status (Active/MFA on), last login; row → user detail dialog (permissions list read from ROLE_MATRIX, recent audit of that user); "Invite user" button (dialog, toast demo, gated).
2. **Roles & permissions** — render all 18 permissions across 8 roles in four groups. The **Super Administrator** can click cells to toggle grants; changes apply immediately and create an `access.grant` or `access.revoke` audit event. Non-superadmins see no edit affordance. The legend is `✓ Granted · ✗ Not granted · 🔒 Self-preservation lock`; there is no conditional-access glyph. The Super Administrator's `access:manage` and `admin:users` cells are locked.
3. **Departments & stations** — cards/table: station name, code, district, active cases, docs, officers (count) — derived from seed cases/users.
4. **System status** — service cards (Vault storage, OCR engine, Anchor node, eSign gateway, Backup) each with status pill (Operational/Degraded), latency mono numbers, uptime; **storage meter** bars (documents by classification); recent system audit events (action starts with `system`/`chain` else last 6); "Run chain verification" button → `verifyChain()` → toast `Chain intact · N events verified` or critical toast with broken id (real call).
5. **Integrations** (read-only info): CCTNS / ICJS / eCourts cards with "Linked (demo)" badges and identifier formats, plus honest footnote "Demonstration only — no live integration".

### B.1 Controls & actions
- **Controls & actions** is an Administration tab with columns: **Control** · **Placement** · **Gated by** · **Kind** · **Status**.
- It lists builtin and custom controls. Builtin controls have on/off switches; only the Super Administrator can change them.
- **Create control** opens a dialog for name, placement area, optional permission gate, and a display-only/no-op flag. Custom controls can be removed; builtin controls cannot.
- `Control` from `@/components/rbac/Control` is the render primitive. It renders a control only when the control is enabled and its optional permission gate passes.
- Current limitation: `CustomControlsDock` is mounted only for the `topbar` area in `AppShell`. Custom controls assigned another placement are stored and listed, but no page currently mounts a dock for them.

## Rules
Read `context.md`, `00-contracts.md`, `research.md`. All privileged actions gated. Deterministic UI (no Math.random in render). `npm run build` passes → Status ✅.

## Status — Agent E

✅ Done. Implemented the approvals queue, review dialog, eSign ceremony, BSA certificate preview/export, and the RBAC-gated administration workspace with all requested tabs. `npx tsc -p tsconfig.app.json --noEmit` is currently blocked by a parallel-agent syntax error in `src/pages/cases/CaseDetailPage.tsx`; Agent E files pass an isolated strict typecheck. Routes remain dependent on the integration agent wiring page components into `App.tsx`.
