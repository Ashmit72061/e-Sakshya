# handoff/08-integration.md — Integration & polish agent (runs AFTER screens A–F)

**Status:** ✅ done

## Mission
Wire everything together, fix cross-page gaps, elevate polish, and make the demo flow seamless.

## Files you OWN
```
src/App.tsx, src/main.tsx            (routing/wiring)
src/components/layout/*              (shell improvements)
src/components/command/*             (new: global command palette)
src/components/domain/*              (shared components — extend carefully)
README.md                            (demo script)
any page file                        (ONLY to fix build errors/links reported by screen agents — keep changes minimal)
```

## Tasks
1. **Build triage first**: run `npm run build`; fix all TS/lint errors across pages (minimal, surgical edits). Record what you fixed.
2. **Global command palette** (⌘K / Ctrl+K): dialog with fuzzy list — navigation items (14 routes), recent cases (from seed), recent documents, actions (Upload, Run chain verification → link `/security/integrity`, Break-glass → `/security/access`), and live document search results (title + case). Keyboard: arrows, enter, esc; groups with headers; opens from topbar search click too (keep `/search?q=` for Enter on topbar input, palette for click/⌘K).
3. **Cross-link audit**: every mention of a route works; breadcrumbs consistent (PageHeader usage); back navigation sensible; notifications dropdown items link somewhere real; sidebar badges (Approvals pending count) computed from store.
4. **Auth guard**: unauthenticated → `/login`; after sign-in → `/`; sign-out returns to login. Avoid redirect loops.
5. **Global chrome**: Toaster placement, TooltipProvider, skip-to-content link, focus-visible rings, `document.title` per route (small `useDocumentTitle` hook in `src/hooks/`), scroll restore on route change.
6. **Responsive pass**: sidebar collapse at <1100px (icon rail + overlay drawer <900px), viewer 3-pane → 2-pane → stacked at smaller widths, tables get `overflow-x-auto`, KPI grids reflow. Test at 1440 / 1100 / 900 px.
7. **A11y pass**: aria labels on icon-only buttons, table `<th scope>`, dialog focus traps (radix handles), color+text pairing for badges, `prefers-reduced-motion` guard on animations, alt text.
8. **Demo polish**: consistent empty/loading states (skeletons where data is computed async), hover states, transition timings 120–180ms, no layout shift, `EmptyState` on every empty list, seeded charts theme-safe in dark mode.
9. **README.md**: what it is, stack, `npm install && npm run dev`, **10-stop demo script** (login w/ OTP → dashboard KPIs → case workspace → open FIR viewer + verify hash → upload wizard w/ real SHA-256 → semantic search → approvals eSign ceremony → break-glass → audit chain verify → integrity receipts → role switcher RBAC demo), feature map, honest "frontend prototype / simulated backend" disclaimer, data/legal notes (BSA 2023, DPDP 2023, IT Act).
10. Update `context.md` §8 status + this handoff's Status.

## Definition of done
- `npm run build` && `npm run lint` pass
- All 14 routes render without console errors (verify via dev server + playwright screenshot spot-check)
- Palette works, links resolve, demo script steps all achievable
- Status ✅ with a list of anything intentionally left out

## Completion notes

- Wired every contract route to its real screen inside the protected AppShell; login, sign-out, and unauthenticated redirects are guarded without loops.
- Added responsive global navigation, approvals count, linked notifications, skip-to-content, route titles, scroll restoration, Toaster, theme/role controls, and a keyboard-accessible `Ctrl+K`/`⌘K` command palette.
- Added the production demo README and verified `npx tsc -p tsconfig.app.json --noEmit`, `npm run lint`, and `npm run build` pass. The remaining lint notices are pre-existing Fast Refresh notices plus parallel screen-agent warnings; they do not fail lint.
- Intentionally simulated: integrations, eSign/ledger/TSA services, notifications, and backend persistence, per prototype scope.
