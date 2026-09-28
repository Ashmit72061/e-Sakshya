# handoff/02-dashboard-cases.md — Agent A: Dashboard + Cases list

**Status:** ⬜ pending → ✅ done / ❌ blocked

## Mission
Two high-visibility pages that sell the product in the first 30 seconds of a demo.

## Files you OWN
```
src/pages/dashboard/DashboardPage.tsx   (+ any files under src/pages/dashboard/)
src/pages/cases/CasesListPage.tsx
```
(You may also create `src/components/dashboard/*` and `src/components/cases/list*` if you prefer co-locating — but prefer inside your page folders to avoid collisions with Agent B who owns `src/pages/cases/CaseDetailPage.tsx` and any `src/components/cases/detail*`.)

## Dashboard requirements
- **KPI row** (StatCard): Open cases · Documents (7d) · Pending approvals (links `/approvals`) · Integrity alerts (failed+warning docs) · Access expiring ≤7d.
- **Charts** (recharts): (1) documents-by-type or case-status donut/bar, (2) 14-day audit-activity area/bar. Respect theme colors via CSS vars (`var(--color-primary)` etc.), dark-mode safe.
- **Attention list**: pending approvals assigned to current user, integrity warnings, expiring shares — each row actionable (links to `/approvals`, `/documents/:id`, `/security/access`).
- **Recent activity**: last 8 audit events (actor, action verb, target, relative time, severity dot) → link `/security/audit`.
- **Case distribution**: mini table/bar of cases by station or status → `/cases`.
- Empty-safe: if a metric is 0 show a sensible state, never NaN.

## Cases list requirements
- Toolbar: search input (filters title/FIR/parties), status filter, classification filter, station filter, sort (updated/registered), view toggle (table ↔ cards), "New case" button gated by `case:create` (PermissionGate w/ tooltip when denied).
- **Table**: FIR no (mono), title + crime type, status chip, classification badge, station/district, IO (avatar+name), sections (mono, max 2 + "+n"), updated (relative), row click → `/cases/:id`. Dense h-10 rows, sticky header, hover, keyboard focusable.
- **Card view**: same data in compact cards with class-stripe.
- Live count "12 of 42 cases", clear-filters button, EmptyState when no matches.
- Bulk-select checkboxes with a bottom action bar (Archive/Export — gated, toast "not available in demo" style is fine but must feel real).
- Clicking a case row and "Open" navigates to `/cases/:id`.

## Rules
Read `context.md`, `handoff/00-contracts.md`, `handoff/research.md` first. Import only shared contracts. Realistic data from `useData`. Gate destructive/privileged buttons. `npm run build` must pass when done. Update Status to ✅.

## Status — Agent A

✅ Implemented responsive, data-driven dashboard metrics, Recharts visualisations, attention/audit links, and the filterable/selectable table/card cases workflow. New-case RBAC includes an accessible Station Officer clearance tooltip fallback. `npx oxlint` is clean for both owned pages. `npx tsc -p tsconfig.app.json --noEmit` reports no Agent A errors; remaining failures are in other agents' Case Detail, Documents, and Security pages, so no non-owned files were changed.
