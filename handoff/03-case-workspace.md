# handoff/03-case-workspace.md — Agent B: Case workspace

**Status:** ⬜ pending → ✅ done / ❌ blocked

## Mission
The case-centric workspace where investigators live — the heart of the demo.

## Files you OWN
```
src/pages/cases/CaseDetailPage.tsx   (+ files under src/pages/cases/detail/*)
src/components/cases/detail/*        (if needed)
```
Do NOT touch `CasesListPage.tsx` (Agent A) or any shared module.

## Requirements
Route `/cases/:id` (unknown id → EmptyState + back link).

**Case header**: FIR no (mono, copyable), title, status chip, classification badge, station/district/state, registered date; right side: IO block (avatar, name, badge), court/CNR if present (link out icon), action buttons: `Share` (opens share dialog — local modal, gated `doc:share`), `Export package` (toast + gated), `⋯` dropdown (Print, Flag for review, Legal hold — gated `retention:manage` and actually flips `setLegalHold` on case docs with toast).

**Tabs** (shadcn Tabs, persisted in URL hash or query so back/forward works):
1. **Overview** — description card, sections list (mono chips), parties table (role, name, notes; witnesses anonymized as "Witness A (protected)" per research), tags, key dates timeline (TimelineList), linked identifiers card (CCTNS ref, CNR, court) with "linked — demo only" note.
2. **Documents** — table of `documentsOfCase(id)`: type icon, title, classification, status, version, integrity badge, signature state, updated, size; row → `/documents/:id`. Toolbar: type filter, classification filter, sort; "Upload" button → `/upload?case=<id>` (gated `doc:upload`).
3. **Timeline** — merged chronological feed of case events: registrations, document uploads, custody events, approvals, shares, audit highlights — unified TimelineList with tone colors and filters (All/Docs/Custody/Access/Workflow).
4. **People** — parties + assigned officers (from seed users where station matches) cards with roles and clearance; witness protection masking always on.
5. **Access** — current access grants for this case (shares via `useData.shares` filtered by case docs), classification policy summary, "Manage access" button → `/security/access` (gated), member list w/ role badges.
6. **Activity** — audit events where `caseId === id` in the compact audit table (time, actor, action, target, outcome) + custody events; "Open full audit log" link.

## Quality
Sub-second interactions, no layout shift, dense-but-readable, breadcrumbs `Cases / CASE-2026-0184`, empty states everywhere, keyboard navigable tabs. `npm run build` passes. Update Status ✅.

## Status — Agent B
✅ Complete. Implemented the full case workspace in `src/pages/cases/CaseDetailPage.tsx`: persisted URL tabs, case header/actions, legal-hold mutation plus audit/toast, all six data-backed tabs, RBAC gates, protected witness masking, filters, and empty/loading states.

Typecheck: `npx tsc -p tsconfig.app.json --noEmit` has no errors in Agent B files. Existing concurrent-agent errors remain in document/security page files; not edited per ownership boundaries. Router integration is deferred to the core/integration agent because `App.tsx` is outside this agent's ownership.
