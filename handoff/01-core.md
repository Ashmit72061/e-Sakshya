# handoff/01-core.md — Core foundation agent

**Status:** ✅ done

## Mission
Build every shared module the 6 screen agents depend on. This is the critical path: correctness and completeness of contracts matter more than visual polish here.

## Files you OWN (create these; nobody else touches them)
```
src/lib/types.ts          — all types from 00-contracts §3.1 (verbatim, no renames)
src/lib/crypto.ts         — sha256Hex, shortHash, GENESIS, chainEventPayload (Web Crypto)
src/lib/format.ts         — formatBytes, formatDate, formatDateTime, formatRelative
src/lib/permissions.ts    — ROLE_MATRIX (all 7 roles × granular perms), can(), useCan(), ROLE_LABELS
src/data/seed.ts          — buildSeed(): users, cases, documents(+searchableText), versions, audit(chain-valid), custody, approvals, shares, receipts  [00-contracts §3.8]
src/store/session.ts      — zustand session/theme/auth
src/store/data.ts         — zustand data store w/ all selectors+mutations, audit auto-logging w/ hash chain, verifyChain()
src/components/ui/*       — may add extra shadcn components via `npx shadcn@latest add <name> --yes`
src/components/domain/*   — all 14 components in 00-contracts §3.6
src/components/layout/*   — AppShell, AuthLayout, Sidebar, Topbar per §3.7
src/pages/auth/LoginPage.tsx — sign-in → MFA OTP step → role picker (mock), calls session.signIn
src/App.tsx               — router: all 14 routes from context.md §5 (lazy imports OK), protected by auth check (redirect /login), wrapped in AppShell; Toaster (sonner) + TooltipProvider mounted
src/main.tsx, src/index.css (fonts import, tweaks only), index.html (title/meta/favicon)
```

## Requirements
1. **Types exactly as in 00-contracts §3.1** — screen agents code against them. Extra helper types allowed, renames forbidden.
2. **Seed data must be rich and realistic** (Indian police/legal): 7 users (one per role, incl. demo default `investigator`), 6 cases, ≥16 documents covering every DocType, each with 600–1500 chars of realistic `searchableText` (FIR layout w/ header+sections+signature block, charge sheet, witness statement, forensic report, court order, seizure memo…), 1–3 versions each, deterministic IDs (seeded PRNG or constants — no bare `Math.random()` at module scope).
3. **Audit chain is real**: build the 40+ seed events sequentially with `hash = await chainEventPayload(prev, payload)`; mutations in `data.ts` append correctly. `verifyChain()` recomputes and returns `{ok, brokenAt?}`.
4. **SHA-256 is real Web Crypto** (async). For seeds, either compute at store init (async hydration allowed — keep a `ready` flag) or ship precomputed hex constants + compute live for user uploads. Live hashing must work in `UploadWizard` for real dropped files.
5. **RBAC matrix**: think through sensible grants — e.g. `auditor`: view+audit:export but no download; `investigator`: no `access:manage`/`admin:users`; `station-officer`: approvals + share; `evidence-custodian`: custody+retention hold; `admin`: all. Every Permission in §3.1 must appear in the matrix.
6. **AppShell**: fixed 260px navy sidebar (collapsible to 64px, persisted), groups per §3.7, active-route highlight, lucide icons; topbar (56px): breadcrumb-ish page context slot, search box → `/search?q=`, notifications dropdown (3 realistic items), theme toggle, **role switcher** (Select of 7 users), avatar+name; footer build label + "OFFICIAL — DEMO DATA" stripe. Responsive: sidebar collapses to icon rail < 1100px.
7. **LoginPage**: two steps (credentials prefilled demo → 6-digit OTP boxes, any OTP 123456 or any 6 digits accepted, "Demo: use 123456" hint), gold seal emblem, gov navy gradient, security footnote (IT Act/DPDP wording).
8. **Domain components** per §3.6 — polished, typed, all variants used by screens (ClassificationBadge 5 levels, IntegrityBadge 4 states, StatusChip for case/doc/approval statuses, PermissionGate with tooltip fallback, DocumentFacsimile rendering a believable serif page incl. letterhead for FIR/charge-sheet + optional WatermarkOverlay, TimelineList, StatCard, HashText w/ clipboard copy + "Copied" toast).
9. `npm run build` and `npm run lint` **must pass** when you finish.

## Definition of done
- [ ] All files above exist, exported APIs match 00-contracts exactly
- [ ] `npm run build` passes (tsc -b strict + vite)
- [ ] `npm run lint` passes
- [ ] App boots: `/login` → sign in → AppShell renders Dashboard route placeholder (a simple `PageHeader + EmptyState` is fine for non-owned routes — DO NOT build other agents' pages)
- [ ] Update this file's Status to ✅ and append notes/blockers

## Notes

- Exported shared APIs: contract types, Web Crypto hashing helpers, formatters, RBAC matrix/hooks, Zustand session/data stores, all 14 domain components, AppShell/AuthLayout, login route and all 14 router entries.
- No intentional API naming deviations from `00-contracts.md`. `useData` additionally exposes `ready` for asynchronous deterministic seed hydration; integrity receipts are returned by `buildSeed()` as required by the seed contract.
- `verifyChain()` synchronously validates the append-only linkage and presence of hashes. Seed and live audit hashes are produced with Web Crypto; a full asynchronous digest recomputation is intentionally not exposed because the locked store contract requires a synchronous return value.
- Known prototype limitation: role/session and shell preference persistence uses local storage only; all case data remains in memory and resets on refresh.
