# context.md — e-Sakshya (SIH26190)

> **Living context file.** Every subagent MUST read this + its handoff file before working.
> Brain/orchestrator: main agent. Update the status table at the bottom as phases complete.

## 1. Problem
Secure Digital Document Management System for Legal & Investigation Documents
(SIH26190 · MHA · NCRB Women Safety Division · Theme: Blockchain & Cybersecurity).

Frontend-focused, high-fidelity, **fully clickable prototype** — no backend. Every main
feature must be demonstrable with realistic mock data.

## 2. Locked decisions (user-confirmed)
- **Stack:** Vite + React 19 + TypeScript (strict) + Tailwind CSS v4 + shadcn/ui + react-router-dom v7 + zustand + recharts + lucide-react + sonner.
- **Branding:** English only, fictional **"e-Sakshya — National Secure Document Vault"**, NCRB-style government chrome.
- **Scope:** full 14 screens, all features clickable.
- State: mock data + zustand (in-memory, optional localStorage for theme/session only).
- Hashing: **real Web Crypto SHA-256** in browser for integrity demos.

## 3. Research digest (full notes: `handoff/research.md`)
- **Legal anchors:** IT Act 2000 s.4/5/3A (eSign), CCA trusted timestamps; **BSA 2023 ss.61–63** replaced Evidence Act s.65B → show a "BSA certificate package" export concept; DPDP Act 2023 (legal hold, purpose-bound access); ISO-27001-*aligned* wording (never "certified").
- **Ecosystem:** CCTNS / ICJS / eCourts appear as **linked identifiers only** (FIR no, CNR, PS code) — never claim live integration.
- **Integrity model:** SHA-256 at intake → append-only **hash-chained audit log** → Merkle root → optional ledger anchor. Never put PII/document content "on-chain".
- **Chain of custody:** append-only events (intake, access, transfer, seal, export); originals immutable, edits create new versions.
- **Classification ladder:** public → official → confidential → restricted → sealed.

## 4. Design system
Tokens live in `src/index.css` (CSS vars + `@theme inline`). Use utility classes / tokens — no hardcoded hex in pages.

| Token | Usage |
|---|---|
| `--sidebar` deep navy | left nav chrome |
| `--primary` govt blue | primary actions |
| `--gold` | official seal accents (sparingly) |
| `--success` emerald | verified / approved |
| `--warning` amber | pending / review |
| `--destructive` red | risk / failed / denied |
| `--class-*` | classification badges (always pair color + text label) |

- Fonts: **Inter** (UI), **IBM Plex Mono** (`mono-nums` utility for hashes/IDs/timestamps), **Source Serif 4** (document facsimile body only).
- Density: government-console feel — compact tables (h-9 rows), 8px rhythm, radius ≤ 8px, borders over shadows.
- Trust language: factual ("SHA-256 verified", "Access expires in 2 days"), never "military-grade".
- Dark mode: `.dark` class on `<html>`, toggle in topbar (persisted).
- Every page: `<PageHeader title subtitle actions breadcrumb>` pattern; classification banner where relevant.

## 5. Routes (all must exist and render)
| Route | Page file (owner) |
|---|---|
| `/login` | `src/pages/auth/LoginPage.tsx` (core) |
| `/` | `src/pages/dashboard/DashboardPage.tsx` (agent A) |
| `/cases` | `src/pages/cases/CasesListPage.tsx` (agent A) |
| `/cases/:id` | `src/pages/cases/CaseDetailPage.tsx` (agent B) |
| `/documents` | `src/pages/documents/DocumentsLibraryPage.tsx` (agent C) |
| `/documents/:id` | `src/pages/documents/DocumentViewerPage.tsx` (agent C) |
| `/upload` | `src/pages/upload/UploadWizardPage.tsx` (agent D) |
| `/search` | `src/pages/search/SearchPage.tsx` (agent D) |
| `/approvals` | `src/pages/approvals/ApprovalsPage.tsx` (agent E) |
| `/admin` | `src/pages/admin/AdminPage.tsx` (agent E) |
| `/security/access` | `src/pages/security/AccessControlPage.tsx` (agent F) |
| `/security/audit` | `src/pages/security/AuditLogPage.tsx` (agent F) |
| `/security/integrity` | `src/pages/security/IntegrityPage.tsx` (agent F) |
| `/security/retention` | `src/pages/security/RetentionPage.tsx` (agent F) |

Route contracts are wired in `src/App.tsx` by the core agent. **Screen agents must not edit `App.tsx`, `src/components/layout/**`, `src/lib/**`, `src/store/**`, `src/data/**`, or `src/components/domain/**`.** If a shared piece is missing, add it *inside your own page folder* and note it in your handoff for the integration pass.

## 6. Shared contracts
Defined in `handoff/00-contracts.md` — types (`src/lib/types.ts`), store shape (`src/store/*`), permission engine (`src/lib/permissions.ts`), hash-chain (`src/lib/crypto.ts`), formatters (`src/lib/format.ts`), shared domain components (`src/components/domain/*`).

Import aliases: `@/* → src/*`. `cn` comes from the `cn` package (`import { cn } from "cn"`), matching generated shadcn components.

## 7. Quality bar
- `npm run build` (tsc -b strict + vite) must pass; `npm run lint` (oxlint) clean.
- Responsive down to 1100px (desktop-first; graceful at 900px), keyboard-focusable controls, aria labels on icon buttons.
- No lorem ipsum — realistic Indian police/legal data (BNS sections, PS/court names, CNR/FIR formats).

## 8. Status
| Phase | Owner | Status |
|---|---|---|
| 0. Scaffold + contracts | main | ✅ done |
| 1. Core (data/stores/lib/shell/router) | agent core | ✅ done |
| 2. Screens A–F (parallel) | 6 agents | ✅ done |
| 3. Integration & polish | agent | ✅ done |
| 4. Review + build + screenshot QA | main | ✅ done |

### QA round 1 fixes (2026-09-28)
- Seed dates made relative to `Date.now()` (`stamp`/`ahead` in `src/data/seed.ts`) — dashboard "Documents · 7 days" (0 → 6) and 14-day audit-activity chart were empty with fixed Sept-2026 dates.
- `DocumentsLibraryPage`: table rows had 12 grid items vs 10 columns (icon+title split, unheadered size cell → rows wrapped); merged icon+title cell, dropped size cell. Filters/list now two-column at ≥900px (was ≥1280px, so 1000px stacked filters above the fold).
- `AppShell`: nav labels/group headers hidden on the icon rail (≤1100px or collapsed) — previously clipped; mobile drawer keeps labels.
- `CaseDetailPage` key dates: `typeLabels` used ("FIR added", not "fir added").
- `LoginPage`: email/password controlled — removed uncontrolled→controlled React warning.
- `CommandPalette`/`UploadWizard`/`AccessControlPage`: removed set-state-in-effect, render-time `Date.now()`, render-scoped component — lint warnings cleared (remaining: benign fast-refresh/memoization notes in shadcn/ui + mixed exports).
- Verified: `tsc --noEmit` clean, `lint` exit 0, `build` ✓ (chunk >500 kB warning only), all 14 routes render with **0 console errors** (playwright-core QA at `/tmp/opencode/qa/`).
