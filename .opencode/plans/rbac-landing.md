# Detailed Execution Plan — RBAC + Landing Page

**Repo:** `e-Sakshya` · Vite 8 · React 19 · TS strict · Tailwind v4 · shadcn/ui (frontend-only prototype, zero backend)
**Goal:** enforce RBAC strictly to a matrix across routes/nav/palette/controls; add a `superadmin` who can edit that matrix and create/enable controls (even no-op buttons); add a public landing page at `/home`.

---

## 0. TARGETS (definition of done — every item must be verifiable)

### T1 — RBAC correctness
| # | Target | How to verify |
|---|---|---|
| T1.1 | `Role` union has 8 members incl. `superadmin`; `admin` is **demoted** to the 11-perm set in §1 | `grep` `types.ts`, `permissions.ts` |
| T1.2 | Every route in §2 is guarded by its listed minimum permission; denial renders a **403 page**, not a redirect | Playwright: as `auditor` visit `/admin` → 403 screen |
| T1.3 | Sidebar shows only permitted links; empty groups disappear entirely | As `auditor`: no *Security → Access Control*, no *System → Administration*, no *Upload* |
| T1.4 | Command palette (`Ctrl+K`) hides forbidden routes **and** forbidden actions | As `auditor`: palette has no "Administration", no "Upload a record" |
| T1.5 | Zero hardcoded denial strings remain (list in §6) — all go through `denialMessage(perm)` | `grep -rn "Requires Station Officer clearance\|Requires System Administrator\|Requires document download" src/` → **0 hits** |
| T1.6 | `PermissionGate` / `GuardedButton` are **reactive**: flipping a matrix cell re-renders them without reload | Toggle cell → button state changes instantly |
| T1.7 | Denial tooltip names the real permission *and* the roles that hold it | Hover a denied button |
| T1.8 | Fake ⚠ "conditional" glyph is gone from both matrix views; legend is truthful | No `CircleAlert` in `AdminPage` matrix; no "evaluated against classification and purpose" copy in `AccessControlPage` |

### T2 — Superadmin powers
| # | Target | How to verify |
|---|---|---|
| T2.1 | `superadmin` seed user exists and appears in the topbar role switcher | Switch to *Super Administrator* |
| T2.2 | Only `superadmin` sees an **Edit matrix** affordance; cells become toggles | As `admin`: no edit affordance at all (not merely disabled) |
| T2.3 | Toggling a cell changes `can()` **immediately** across nav, buttons, routes | Revoke `investigator × doc:download` → Download buttons grey out for investigator |
| T2.4 | `superadmin × {access:manage, admin:users}` cells are **locked** (inert, lock glyph) | Click does nothing |
| T2.5 | Every toggle writes an `access.grant` / `access.revoke` audit event | Check Audit Log |
| T2.6 | **Controls** tab: superadmin can switch existing controls off/on and create new ones | Disable `doc.delete` → button vanishes from Document viewer |
| T2.7 | Created controls render in their area and respond, even when they do nothing | New topbar control → click → no-op toast |
| T2.8 | Non-superadmin cannot mutate matrix or controls (action is a no-op, not just UI-hidden) | `togglePermission` early-returns unless role is `superadmin` |

### T3 — Landing page
| # | Target | How to verify |
|---|---|---|
| T3.1 | `/home` renders publicly with no auth, in light **and** dark | Incognito + theme toggle |
| T3.2 | `/` still = protected Dashboard; unauthed `/` → `/login`; `*` → `/home` | URL checks |
| T3.3 | 10 sections (§7) present, all using design tokens — **no raw hex**, radius ≤ 8px, borders over shadows | `grep -rn "#[0-9a-f]\{3,6\}" src/pages/marketing src/components/marketing` → 0 hits |
| T3.4 | Responsive at 1440 / 1100 / 900 px; keyboard-focusable CTAs; skip link | Playwright viewport resize |
| T3.5 | `index.html` gains description + OG tags; `/login` gains "← Back to home" | View source |

### T4 — Quality gates (must pass after **every** wave)
```bash
npm run lint    # oxlint, clean
npm run build   # tsc -b strict + vite, clean
```

---

## 1. THE MATRIX — 8 roles × 18 permissions (single source of truth)

**Original 7 rows are byte-for-byte unchanged** from today's `ROLE_MATRIX`. Only two deltas: `admin` demoted, `superadmin` added.

Legend: `V` granted · `–` not granted

| Permission | Label | inv | stn | pros | clerk | cust | aud | **admin** | **super** |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `doc:view` | View records | V | V | V | V | V | V | V | V |
| `doc:download` | Download records | V | V | V | V | V | – | V | V |
| `doc:upload` | Upload records | V | V | – | V | V | – | **–** | V |
| `doc:annotate` | Annotate records | V | V | V | – | V | – | **–** | V |
| `doc:redact` | Redact records | V | V | – | – | – | – | **–** | V |
| `doc:sign` | eSign document | – | V | V | V | – | – | **–** | V |
| `doc:approve` | Approve workflow | – | V | V | – | – | – | **–** | V |
| `doc:share` | Share records | – | V | – | – | – | – | V | V |
| `doc:delete` | Delete records | – | – | – | – | – | – | **–** | V |
| `case:view` | View cases | V | V | V | V | V | V | V | V |
| `case:create` | Create cases | V | V | – | – | – | – | **–** | V |
| `case:assign` | Assign cases | – | V | – | – | – | – | V | V |
| `access:manage` | Manage access | – | – | – | – | – | – | V | V 🔒 |
| `audit:view` | View audit | V | V | V | V | V | V | V | V |
| `audit:export` | Export audit | – | V | V | – | – | V | V | V |
| `retention:manage` | Manage retention | – | – | – | – | V | – | V | V |
| `admin:users` | Manage users | – | – | – | – | – | – | V | V 🔒 |
| `security:breakglass` | Break-glass access | V | V | – | – | – | – | V | V |

**`admin` (demoted) final set** = `doc:view, doc:download, doc:share, case:view, case:assign, access:manage, audit:view, audit:export, retention:manage, admin:users, security:breakglass` → **11 of 18** (was 18).
**`superadmin`** = all 18. `doc:delete` is now exclusive to superadmin.
**🔒 = self-preservation lock**: `superadmin`'s `access:manage` and `admin:users` cells are permanently granted and non-toggleable.

**Consequence for existing screens (must hold after implementation):**
- `auditor` and `prosecutor` lose `/upload` and lose the *Upload* nav link.
- everyone except `admin`/`superadmin` loses `/security/access`.
- everyone except `evidence-custodian`/`admin`/`superadmin` loses `/security/retention`.
- everyone except `admin`/`superadmin` loses `/admin`.
- **only `superadmin`** sees a Delete/Archive control gated on `doc:delete` (today `admin` has it).

---

## 2. ROUTE → minimum permission map

| Route | `ROUTE_PERMISSIONS` | Notes |
|---|---|---|
| `/home` | *(none — public)* | not inside `Protected` |
| `/` (Dashboard) | `case:view` | all 8 roles pass |
| `/cases`, `/cases/:id` | `case:view` | |
| `/documents`, `/documents/:id` | `doc:view` | |
| `/upload` | `doc:upload` | blocks auditor + prosecutor |
| `/search` | `case:view` | |
| `/approvals` | `case:view` | list visible to all; **Approve/Sign buttons** gated separately (`doc:approve` / `doc:sign`) |
| `/admin` | `admin:users` | |
| `/security/access` | `access:manage` | admin + superadmin only |
| `/security/audit` | `audit:view` | |
| `/security/integrity` | `audit:view` | |
| `/security/retention` | `retention:manage` | custodian, admin, superadmin |
| `*` | → redirect `/home` | currently `/` |

**NAV map** (identical permissions, applied to `AppShell` groups + `CommandPalette`):

| Nav item | Permission |
|---|---|
| Dashboard, Cases, Documents, Search | `case:view` / `doc:view` (as above) |
| Upload | `doc:upload` |
| Approvals | `case:view` |
| Access Control | `access:manage` |
| Audit Log, Integrity | `audit:view` |
| Retention | `retention:manage` |
| Administration | `admin:users` |
| *(group with 0 visible items → group omitted entirely)* | |

---

## 3. CODE CONTRACTS (exact APIs — A implements, everyone else consumes)

### 3.1 `src/lib/types.ts` (A)
```ts
export type Role = 'investigator' | 'station-officer' | 'prosecutor' | 'court-clerk'
  | 'evidence-custodian' | 'auditor' | 'admin' | 'superadmin'          // + superadmin

export type ControlArea = 'topbar' | 'documents' | 'cases' | 'approvals' | 'admin' | 'security'
export interface ControlDef {
  id: string; label: string; area: ControlArea
  permission?: Permission        // optional extra RBAC gate
  stub: boolean                  // true = display-only, fires a no-op toast
  builtin: boolean               // seeded controls cannot be deleted
}
```
`AuditAction` — **no change needed** (reuse `access.grant` / `access.revoke`).

### 3.2 `src/store/rbac.ts` (A, new)
```ts
const KEY = 'esakshya-rbac-v1'
interface RbacState {
  matrix: RolePermissionMatrix[]                  // defaults to DEFAULT_MATRIX
  controls: Record<string, boolean>               // builtin control id -> enabled
  customControls: ControlDef[]                    // superadmin-authored
  togglePermission(role: Role, perm: Permission): void
  setControl(id: string, enabled: boolean): void
  createControl(def: Omit<ControlDef,'builtin'>): void
  removeControl(id: string): void
  resetMatrix(): void
}
```
- `togglePermission`: **first line** `if (useSession.getState().user.role !== 'superadmin') return`
- **lock check**: `if (role === 'superadmin' && (perm === 'access:manage' || perm === 'admin:users')) return`
- every mutation writes an audit event via `useData.getState().logAudit({ action: perm === ... })` using `access.grant`/`access.revoke`
- `togglePermission` also calls `logAudit({action:'access.grant'|'access.revoke', targetType:'user', targetId:role, targetLabel:`${ROLE_LABELS[role]} · ${PERMISSION_LABELS[perm]}`, outcome:'success', severity:'notice', ip:'10.24.18.40', device:'NCRB Secure Workspace', detail:'Role matrix edited by Super Administrator'})`
- persistence via `zustand/middleware` `persist` **with a `migrate`/`partialize` guard**: on load, drop any role/permission strings not in the current unions, then fall back to `DEFAULT_MATRIX` if the result is empty/invalid. A stale localStorage must never break `can()`.
- `BUILTIN_CONTROLS: ControlDef[]` exported from here (table §5).

### 3.3 `src/lib/permissions.ts` (A)
```ts
export const DEFAULT_MATRIX: RolePermissionMatrix[]  // §1 table, frozen
export const ROLE_LABELS: Record<Role, string>       // + superadmin: 'Super Administrator'
export const PERMISSION_LABELS: Record<Permission, string>   // moved OUT of AdminPage
export const ALL_PERMISSIONS: Permission[]
export function rolesWith(perm: Permission): Role[]  // derives from live matrix
export function can(user: User, perm: Permission): boolean   // reads useRbac.getState().matrix  — 2-arg, UNCHANGED signature
export function useCan(): (perm: Permission) => boolean       // subscribes to useRbac matrix — 1-arg, UNCHANGED signature
export function useMatrix(): RolePermissionMatrix[]           // new — for matrix tables
export function denialMessage(perm: Permission): string
//   => `Requires “${PERMISSION_LABELS[perm]}” — granted to ${rolesWith(perm).map(r=>ROLE_LABELS[r]).join(', ')}`
```
**Back-compat is mandatory.** Both existing call shapes keep working:
- 1-arg `can(perm)` from `useCan()` — used by `CaseDetailPage:37`
- 2-arg `can(user, perm)` — used by `ApprovalsPage`, `DocumentsLibraryPage`, `DocumentViewerPage`, `AdminPage`, `AccessControlPage`

**Rule for every consumer:** render-time permission checks **must** use `useCan()` (reactive). `can(user, p)` is only acceptable inside event handlers. Explicitly listed render-time call sites to migrate: `AdminPage:24`, `ApprovalsPage:45` (`disabled={!can(user,'doc:download')}`), `domain/index.tsx:19`.

### 3.4 `src/lib/routes.ts` (A, new)
```ts
export const ROUTE_PERMISSIONS: Record<string, Permission> = { /* §2 */ }
export const NAV_PERMISSIONS: Record<string, Permission>   = { /* §2 */ }
export function permissionForPath(pathname: string): Permission | undefined
//  matches '/cases/:id' style keys via segment compare (exact match first, then longest prefix)
```

### 3.5 `src/components/rbac/Control.tsx` (A, new — shared primitive, like `PermissionGate`)
```tsx
export function Control({ id, children, fallback = null }: { id: string; children: ReactNode; fallback?: ReactNode }): JSX.Element | null
//  renders children ONLY if: enabled(id) && (!def.permission || can(perm)). Else fallback.
export function useControl(id: string): boolean
export function CustomControlsDock({ area }: { area: ControlArea }): JSX.Element | null
//  renders superadmin-authored controls in `area`; each fires toast.info(`${label} — display-only control (no-op)`)
export function runControl(id: string): void
//  if builtin && !stub -> caller wires real handler; if stub -> toast.info(`${label} — display-only control (no-op)`)
```
`Control` subscribes to `useRbac` + `useCan` → toggles re-render live.

---

## 4. SUBAGENT BRIEFS

### 🔵 Wave 1a — Agent **A** · "RBAC core"
**Owns (may edit):**
`src/lib/types.ts` · `src/lib/permissions.ts` · `src/lib/routes.ts` *(new)* · `src/store/rbac.ts` *(new)* · `src/store/session.ts` · `src/data/seed.ts` · `src/components/rbac/Control.tsx` *(new)*
**Must NOT touch:** `src/App.tsx`, `src/components/layout/**`, `src/components/domain/**`, `src/components/command/**`, any `src/pages/**`

**Tasks**
- **A1.** `types.ts`: add `'superadmin'` to `Role`; add `ControlArea` + `ControlDef`.
- **A2.** `permissions.ts`: rewrite per §3.3. `DEFAULT_MATRIX` must reproduce §1 **exactly** (write it out explicitly, don't derive). Keep `pick()`/`all` helpers if convenient but export `DEFAULT_MATRIX`.
- **A3.** `store/rbac.ts`: per §3.2, incl. persistence + validation + locked cells + audit events + `BUILTIN_CONTROLS` (§5).
- **A4.** `seed.ts`: add 8th user —
  `{ id:'u-008', name:'Aarav Sinha', designation:'Director, Digital Evidence', role:'superadmin', badgeId:'NCRB-SYS-001', station:'NCRB Regional Cell, Mumbai', department:'NCRB', clearance:'sealed', initials:'AS', email:'aarav.sinha@ncrb.gov.in' }`
  Keep `u-007 Meera Deshpande` as `admin`. **Verify** `buildSeed()`'s audit seeding doesn't hardcode a user count / index that breaks with 8 users.
- **A5.** `store/session.ts`: no logic change required (seed flows through `buildSeed`). Confirm the role-switcher `Select` renders 8 users without overflow.
- **A6.** `lib/routes.ts` per §3.4.
- **A7.** `components/rbac/Control.tsx` per §3.5. Note: `runControl` must be callable from anywhere without React context — read `useRbac.getState()`.

**Acceptance (A must self-verify before handing off)**
```bash
npx tsc -b --noEmit   # or: npm run build
npm run lint
```
- `can()` returns correct booleans for all 8 roles × 18 perms — write a throwaway node/tsx check or verify via `useMatrix()` output.
- Importing `@/lib/permissions` from a fresh file compiles with **no** consumer changes needed (2-arg and 1-arg both work).
- `grep -c superadmin src/data/seed.ts` → ≥1.

---

### 🟢 Wave 1b — Agent **B** · "Landing page"
**Owns (may edit):**
`src/pages/marketing/**` *(new)* · `src/components/marketing/**` *(new)* · `index.html`
**Must NOT touch:** `src/App.tsx` (C wires the route), `src/lib/**`, `src/store/**`, `src/components/domain/**`, `src/components/layout/**`

**Deliverables**
1. `src/components/marketing/MarketingLayout.tsx`
   - sticky topbar: `✦ e-Sakshya` wordmark (gold ✦, `border-gold/70` box like the sidebar logo) · nav anchors `Capabilities · Workflow · Access model · Security` · theme toggle (reuse `useSession().toggleTheme` + `Moon`/`Sun`) · `Sign in` (ghost, → `/login`) · `Launch console` (primary, → `/login`)
   - `<main id="main-content">` for children, full `<footer>`
   - footer: 4-col sitemap (Product / Access model / Security / Legal), `OFFICIAL · DEMO DATA` gold line, `e-Sakshya v0.9` line, and a note that this is a prototype.
   - topbar must be `bg-background/95 backdrop-blur border-b`, radius ≤ 8px everywhere.
2. `src/pages/marketing/LandingPage.tsx` — 10 sections, exact order:

| # | Section | Content / key details |
|---|---|---|
| 1 | **Hero** | eyebrow pill `SIH 26190 · Ministry of Home Affairs / NCRB` (`rounded-full border border-gold/50 bg-gold/10 text-gold`) · H1 `The national secure document vault` · sub: *"Purpose-bound access, documented custody and hash-chained integrity for every record — from first information report to court order."* · CTAs `Launch console` → `/login`, `Explore the access model` → `#access` · right: `src/assets/hero.png` (**currently unused — this is its first use**) in `overflow-hidden rounded-md border`, with a floating `SHA-256 verified` chip and a `ClassificationBadge`-style overlay. Verify the import path `@/assets/hero.png` works with the existing Vite/TS setup; if the PNG is unsuitable, fall back to a `DocumentFacsimile`-styled mock card using `@/components/domain`. |
| 2 | **Trust strip** | hairline `border-y`, 5 items: Maharashtra Police · Directorate of Prosecution · eCourts Services · Forensic Science Laboratories · NCRB |
| 3 | **Stats band** | `bg-sidebar text-sidebar-foreground` panel, 4 × `mono-nums` figures: `1,48,206` records vaulted · `42.6 L` hash-chain events · `220 ms` median seal time · `99.99%` audit availability. Indian digit grouping. |
| 4 | **Capabilities** | heading `Built for evidence that must survive scrutiny` + 6 cards (`rounded-md border bg-card p-5`, lucide icon in a bordered box): Hash-chained audit log · Documented chain of custody · Purpose-bound sharing · Break-glass with mandatory justification · Classification-aware redaction · Court-ready eSign + BSA 2023 package |
| 5 | **Workflow** | `From seizure to court order` — 3 numbered steps on a horizontal connecting rule (`border-t` + dot markers): `01 Intake & hash` → `02 Seal & anchor` → `03 Authorised release` |
| 6 | **Access model** (`id="access"`) | heading `Access is a matrix, not a checkbox` · render an 8-role × 6-perm teaser table (`doc:view, doc:download, doc:upload, doc:approve, audit:export, admin:users`) using `✓`/`✗` glyphs with `text-success`/`text-muted-foreground` · role chips row for all 8 roles incl. *Super Administrator* · footnote *"Every button, route and menu in the console is gated by this matrix."* · CTA `Open Administration` → `/login` |
| 7 | **Security & compliance** | 2-col list: Bharatiya Sakshya Adhiniyam 2023 (ss.61–63) · IT Act 2000 eSign · AES-256 at rest · SHA-256 + Merkle anchoring · Watermarked exports · Append-only audit chain |
| 8 | **Quote** | bordered pull-quote, Source Serif 4, attributed to `SPI Raghavendra Patil · Station House Officer, Cyber Police Station, Pune` — about custody/audit defensibility |
| 9 | **CTA band** | `bg-card border rounded-md` · `Start in the demo console` + secondary `Sign in with the demo OTP — 123456` |
| 10 | **Footer** | (in `MarketingLayout`) |

3. `index.html`: add `<meta name="description">`, `og:title`, `og:description`, `og:type=website`. Keep existing fonts/title.

**Constraints (hard)**
- Tokens only — **no hex/rgb/hsl literals**. Use `bg-card`, `text-gold`, `border-primary/30`, `class-*` classification tokens, `--sidebar` vars.
- radius ≤ 8px: `rounded-md` (6px) / `rounded` (4px) — never `rounded-2xl`/`rounded-3xl`.
- borders over shadows; at most `shadow-sm` on the hero image.
- dark mode must work: verify both `:root` and `.dark` token names you use (`bg-sidebar` is dark navy in both — good for the stats band).
- no lorem ipsum; realistic Indian police/legal copy.
- responsive: `lg:` grids collapse to 1 col; hero stacks under `lg`.
- a11y: one `<h1>`, semantic sections, `aria-label` on icon-only buttons, visible focus rings.

**Acceptance (B)**
```bash
npm run build && npm run lint
grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(' src/pages/marketing src/components/marketing   # → 0 hits
```
Route will be `/home` — C wires it. B should not register the route.

---

### 🟡 Wave 2a — Agent **C** · "Enforcement"
**Depends on:** A (Wave 1a) + B (Wave 1b) both merged.
**Owns (may edit):** `src/App.tsx` · `src/components/layout/AppShell.tsx` · `src/components/command/CommandPalette.tsx` · `src/components/domain/index.tsx` · `src/pages/security/security-ui.tsx` · `src/pages/errors/ForbiddenPage.tsx` *(new)* · `src/pages/auth/LoginPage.tsx`
**Must NOT touch:** `src/lib/**`, `src/store/**`, `src/data/**`, `src/components/rbac/**`, `src/components/marketing/**`, `src/pages/admin/**`, `src/pages/security/*.tsx` (other than `security-ui.tsx`), any other page

**Tasks**
- **C1 — `ForbiddenPage.tsx` (new).** Props: `{ permission?: Permission; path?: string }`.
  - `ShieldAlert` icon in a bordered gold box · `403` in huge `mono-nums` · H1 `Insufficient clearance`
  - body: `This workspace requires the permission <b>“{PERMISSION_LABELS[p]}”</b>.` + `rolesWith(p)` rendered as `RoleBadge` chips (`Granted to: …`)
  - if no permission (auth failure): generic copy.
  - actions: `<Button onClick={()=>navigate(-1)}>Go back</Button>` + **role switcher**: a `Select` of `useSession().users` calling `setUserId` — so the demo can hop roles in place. After switching, re-evaluate: the `Require` wrapper re-renders and the page appears.
  - Link back to `/home`.
- **C2 — `App.tsx`.**
  ```tsx
  function Require({ perm, children }: { perm?: Permission; children: ReactNode }) {
    const authed = useSession(s => s.authenticated)
    const user   = useSession(s => s.user)
    const can_   = useCan()
    const location = useLocation()
    if (!authed) return <Navigate to="/login" replace state={{ from: location.pathname }} />
    if (perm && !can_(perm)) { /* log access.denied once via useData logAudit (guard with a ref) */ return <ForbiddenPage permission={perm} path={location.pathname} /> }
    return <>{children}</>
  }
  ```
  Routes: add `<Route path="/home" element={<MarketingLayout><LandingPage /></MarketingLayout>} />` (public, outside `Protected`). Wrap each protected route: `<Route path="/admin" element={<Require perm="admin:users"><AdminPage/></Require>} />` etc. per §2 — `ROUTE_PERMISSIONS` drives the `perm` where possible, but a static JSX wrapper per route is acceptable and clearer; use `permissionForPath()` inside `Require` if you prefer one wrapper for all.
  - `*` → `<Navigate to="/home" replace />` (was `/`).
  - `LoginRoute`: keep `authenticated → <Navigate to="/" />` (dashboard) — do **not** send to `/home`.
  - `titles` map: add `/home: 'e-Sakshya — National Secure Document Vault'` and `/403`.
  - **Do not** render `AppShell` for `/home`.
- **C3 — `AppShell.tsx`.**
  - Add `permission?: Permission` to each item in `groups` using `NAV_PERMISSIONS`.
  - `const can_ = useCan()`; inside `renderLinks`, `group.items.filter(([, path]) => !NAV_PERMISSIONS[path] || can_(NAV_PERMISSIONS[path]))`; skip `if (!visible.length)`.
  - Dashboard (`/`) stays visible to all (it passes `case:view` anyway).
  - Add `<CustomControlsDock area="topbar" />` from `@/components/rbac/Control` in the header, next to the search/palette button — **only renders if there are custom controls**, so it's a no-op until superadmin creates one.
  - Role switcher: keep as-is (8 users now). If the `Select` is cramped, group by nothing but ensure `superadmin` label fits (`Super Administrator`).
- **C4 — `CommandPalette.tsx`.**
  - Add `perm?: Permission` as the 5th tuple element of `PaletteItem` **or** (simpler) filter by `NAV_PERMISSIONS[path]` for `navigation` and a small local `ACTION_PERMISSIONS` map for `actions` (`/upload → doc:upload`, `/security/access → access:manage`, `/security/integrity → audit:view`). Filter both arrays with `useCan()` **before** `matches()`.
- **C5 — `domain/index.tsx` → `PermissionGate`.**
  ```tsx
  export function PermissionGate({ perm, children, fallback }: {...}) {
    const allowed = useCan()(perm)
    if (allowed) return <>{children}</>
    if (fallback !== undefined) return <>{fallback}</>
    return <span title={denialMessage(perm)} aria-disabled className="inline-block cursor-not-allowed opacity-50">{children}</span>
  }
  ```
  Same for the `CasesListPage` style `fallback` — but that page's copy is D's job.
- **C6 — `security-ui.tsx` → `GuardedButton`.** Same treatment: `useCan()`, `title={allowed ? undefined : denialMessage(perm)}`, plus `aria-disabled` and `cursor-not-allowed` on the wrapper. **Keep the exported names `GuardedButton` and `Panel` and their prop signatures unchanged** (D imports them).
- **C7 — `LoginPage.tsx`.** Add `← Back to home` link → `/home` (top-left of the card or above the form).

**Acceptance (C)**
```bash
npm run build && npm run lint
grep -rn "Requires Station Officer clearance" src/components/ src/pages/errors/   # → 0
```
Playwright spot-check as `auditor`: `/admin` → 403 with role switcher; sidebar has no *Administration*/*Access Control*/*Retention*/*Upload*; `Ctrl+K` offers none of them.

---

### 🟠 Wave 2b — Agent **D** · "Editable matrix + controls UI"
**Depends on:** A (Wave 1a). Runs **in parallel with C** — so D must not edit any file C owns.
**Owns (may edit):**
`src/components/rbac/RoleMatrixTable.tsx` *(new)* · `src/pages/admin/AdminPage.tsx` · `src/pages/security/AccessControlPage.tsx` · `src/pages/security/AuditLogPage.tsx` · `src/pages/security/RetentionPage.tsx` · `src/pages/security/IntegrityPage.tsx` · surgical one-line edits in `src/pages/cases/CasesListPage.tsx`, `src/pages/cases/CaseDetailPage.tsx`, `src/pages/documents/DocumentsLibraryPage.tsx`, `src/pages/documents/DocumentViewerPage.tsx`, `src/pages/approvals/ApprovalsPage.tsx`, `src/pages/upload/UploadWizardPage.tsx`
**Must NOT touch:** `src/App.tsx`, `src/components/layout/**`, `src/components/command/**`, `src/components/domain/**`, `src/pages/security/security-ui.tsx`, `src/lib/**`, `src/store/**`, `src/data/**`, `src/components/marketing/**`

**D1 — `src/components/rbac/RoleMatrixTable.tsx` (new, shared by two pages)**
```tsx
export function RoleMatrixTable({ editable, onToggle }: {
  editable: boolean                       // superadmin only
  onToggle?: (role: Role, perm: Permission) => void
}): JSX.Element
```
- rows = all 18 `ALL_PERMISSIONS` grouped by §1's 4 groups; columns = 8 roles; current user's column tinted `bg-primary/10 text-primary`.
- read mode: `<Check className="size-4 text-success"/>` / `<X className="size-4 text-muted-foreground"/>`.
- edit mode: each cell = `<button aria-pressed={yes} aria-label={`${ROLE_LABELS[role]} · ${PERMISSION_LABELS[perm]}`} …>` with hover `bg-accent`; locked cells render `<Lock className="size-4 text-gold"/>` + `title="Self-preservation lock — cannot be revoked"`.
- cell `title` always: `` `${ROLE_LABELS[role]}: ${yes ? 'Granted' : 'Not granted'}` ``.
- header row sticky; `overflow-x-auto`; `min-w-[950px]`; `text-xs`; **no** ⚠ glyph anywhere.
- legend: `✓ Granted · ✗ Not granted · 🔒 Self-preservation lock` + (when editable) `Click a cell to toggle — applies immediately.`
- uses `useMatrix()` from `@/lib/permissions` (reactive).

**D2 — `AdminPage.tsx`**
- Remove the local `permissionName` map and `roles` const → import `PERMISSION_LABELS` / `ALL_PERMISSIONS` from `@/lib/permissions`. (Keep the `permissions` group array or derive it — grouping must match §1.)
- Replace `RolesTab` body with `<RoleMatrixTable editable={isSuper} onToggle={togglePermission} />` where `const isSuper = user.role === 'superadmin'` and `togglePermission` comes from `useRbac()`.
- **Edit affordance:** show `Edit matrix` button **only when `isSuper`** (don't render a disabled button for anyone else). Keep the existing page-level `admin:users` gate as-is.
- `UserDialog` and `UsersTab`: unchanged except `permissionName` → `PERMISSION_LABELS`.
- **Add tab `controls` → "Controls & actions"** (6th tab):
  - table columns: `Control` · `Placement` · `Gated by` (permission chip, or `—`) · `Kind` (`Functional` / `Display-only stub`) · `Status` (a `Switch`).
  - rows = `BUILTIN_CONTROLS` ∪ `customControls`.
  - `Switch` → `setControl(id, next)`; disabled when `!isSuper`, with `title={denialMessage(...)}` — use a `Requires Super Administrator clearance` title when `!isSuper`.
  - header actions: `Reset matrix` (ghost, `resetMatrix()` — superadmin only) + `Create control` (primary, opens dialog).
  - **Create control dialog**: `Name` (Input) · `Placement` (Select of `ControlArea`) · `Gate on permission` (Select of `ALL_PERMISSIONS`, optional, `none` option) · `Display-only (no-op)` (Checkbox, default checked) → `createControl(...)` + `toast.success('Control created — it now renders in <area>')`.
  - deletion: only for `!builtin` rows, a ghost trash `IconButton` → `removeControl`.
- `Integrations`/`Status` tabs: optionally wire one builtin control (`admin.maintenance`) — nice-to-have, not blocking.

**D3 — `AccessControlPage.tsx` (matrix tab)**
- Replace the hand-rolled `groups` table with `<RoleMatrixTable editable={isSuper} onToggle={…}/>`.
- `Panel action` prop: change `GuardedButton perm="access:manage"` → conditional render: `isSuper && <Button size="sm" variant="outline" onClick={()=>setEditing(!editing)}>Edit matrix</Button>` (the table is editable whenever `isSuper`, so this can simply be omitted).
- **Delete the false copy** at the footer: the sentence *"conditional access is evaluated against classification and purpose"* — replace with *"Grants are role-derived. Edits by the Super Administrator apply immediately across the console."*
- Keep the `shares` and `break-glass` tabs untouched except the `GuardedButton` import still resolving.
- `can(user,'security:breakglass')` at line 20 is inside an event handler → acceptable as-is.

**D4 — denial-string sweep (T1.5).** Replace every literal with `denialMessage(perm)` from `@/lib/permissions`:

| File:line (approx) | Current literal | Permission |
|---|---|---|
| `cases/CasesListPage.tsx:41` | `Requires Station Officer clearance` (TooltipContent) | `case:create` |
| `cases/CasesListPage.tsx:48` | `Archive requires Station Officer clearance` (DeniedAction label) | `case:assign` |
| `cases/CasesListPage.tsx:48` | `Export requires audit export clearance` | `audit:export` |
| `cases/CaseDetailPage.tsx:56` | `Export requires audit export permission` | `audit:export` |
| `documents/DocumentsLibraryPage.tsx:31` | `toast.error('Requires Station Officer clearance')` | `doc:download` |
| `documents/DocumentViewerPage.tsx:24` | same | `doc:download` |
| `upload/UploadWizardPage.tsx:39` | `Legal hold requires Station Officer clearance` | `retention:manage` |
| `approvals/ApprovalsPage.tsx:45` | `Requires document download permission` | `doc:download` |
| `approvals/ApprovalsPage.tsx:49` (`DecisionActions` ×3) | `Requires Station Officer clearance` | `doc:approve` |
| `admin/AdminPage.tsx:24` | `Requires System Administrator clearance` | `admin:users` |

(`domain/index.tsx`, `security-ui.tsx` are **C's** — skip them.)
Also in **ApprovalsPage**: confirm `DecisionActions`'s `allowed` is fed by `can(user,'doc:approve')` (via `useCan()`); if it's currently something else, wire it to `doc:approve`.

**D5 — surgical `<Control>` wraps** (one line each; do not restructure JSX):

| File | Where | Control id |
|---|---|---|
| `documents/DocumentViewerPage.tsx` | header action cluster, beside Share/Download | `doc.delete` (new Delete button), `doc.redact.run`, `doc.share.external` |
| `documents/DocumentsLibraryPage.tsx` | bulk-action bar (`selected.length>0`) | `doc.version` |
| `cases/CaseDetailPage.tsx` | `PageHeader actions` / dropdown | `case.transfer`, `case.close` |
| `approvals/ApprovalsPage.tsx` | `PageHeader` (currently no actions) | `approvals.bulk` |
| `security/AuditLogPage.tsx` | `PageHeader actions` | `audit.export.csv` |
| `security/AccessControlPage.tsx` | `PageHeader actions` | `access.share.create` |
| `security/RetentionPage.tsx` | `PageHeader actions` | `retention.purge` |
| `admin/AdminPage.tsx` | status/integrations | `admin.maintenance`, `admin.sync.registry` (stub) |

Pattern:
```tsx
<Control id="doc.delete"><Button size="sm" variant="destructive" onClick={()=>toast.info('Delete record — demonstration control')}>Delete</Button></Control>
```
`Control` already enforces the control's `permission` + enabled flag, so **no extra `PermissionGate`** is needed — but `doc.delete`'s builtin def must carry `permission:'doc:delete'`.

**Acceptance (D)**
```bash
npm run build && npm run lint
grep -rn "Requires Station Officer clearance\|Requires System Administrator clearance\|Requires document download permission\|Read-only in demo" src/pages/   # → 0 hits
grep -rn "conditional access is evaluated" src/   # → 0 hits
grep -rn "CircleAlert" src/pages/admin/           # → 0 hits
```
Playwright as `superadmin`: toggle `investigator × doc:download` off → nav/Download react; audit row appears. As `admin`: no `Edit matrix` button, Controls switches disabled.

---

### ⚪ Wave 3 — Agent **E** · "QA + docs"
**Owns:** `README.md` · `context.md` · `handoff/01-core.md` · `handoff/06-approvals-admin.md` · `handoff/07-security.md`
**Tasks**
1. Run T4 gates. Fix any fallout (coordinate ownership with whoever broke it).
2. Full Playwright pass — script below.
3. Docs updates:
   - `context.md` §5 route table: add `/home` (public, `MarketingLayout`) + note `*` → `/home`; add a row/note for the 403 page; update §8 status.
   - `README.md`: add `/home` landing to the demo script as stop 0; document the **Super Administrator** demo user; document the *Controls* tab; note `/` = dashboard, `/home` = public landing.
   - `handoff/01-core.md`: replace the old matrix guidance with the §1 table (8 roles).
   - `handoff/06-approvals-admin.md` §B.2: matrix is now **editable by superadmin**; Controls tab added.
   - `handoff/07-security.md` §A: remove the "read-only" wording.

**Playwright verification script (E must run all)**
```
PUBLIC
  [ ] /home loads unauthenticated, light + dark
  [ ] hero.png renders (or documented fallback)
  [ ] viewport 1440 → 1100 → 900: no horizontal overflow, no clipped CTAs
  [ ] "Launch console" → /login ; "← Back to home" → /home
  [ ] unauthenticated / → /login ; unauthenticated /admin → /login ; * → /home

RBAC (repeat per role for: auditor, prosecutor, court-clerk, investigator, admin, superadmin)
  [ ] sidebar items match §2 exactly
  [ ] each blocked route shows the 403 page (not a redirect), naming the right permission
  [ ] Ctrl+K hides blocked routes/actions
  [ ] denied buttons show denialMessage() tooltip, not the old Station Officer text
  [ ] role switcher on the 403 page works and lands you in the target route

SUPERADMIN
  [ ] Administration → Roles & permissions → cells are clickable
  [ ] toggle investigator×doc:download → investigator's Download buttons grey out instantly (no reload)
  [ ] superadmin×access:manage and ×admin:users are inert + show lock glyph
  [ ] audit log gains access.grant / access.revoke rows
  [ ] Controls tab: disable doc.delete → button disappears from Document viewer; re-enable → returns
  [ ] Create control (topbar, no-op) → appears in topbar → click → no-op toast
  [ ] Reset matrix restores defaults

ADMIN (demoted)
  [ ] sees Administration (has admin:users) but NO Edit matrix button, Controls switches disabled
  [ ] does NOT see /security/access? (admin HAS access:manage → it IS visible — assert this)
  [ ] does NOT hold doc:delete, doc:sign, doc:approve, doc:upload, case:create
```
4. Final: `git status` review — no stray files (`.opencode/plans/` may stay or be deleted at user's discretion).

---

## 5. `BUILTIN_CONTROLS` (A creates; D renders)

| id | label | area | permission | kind |
|---|---|---|---|---|
| `doc.delete` | Delete record | `documents` | `doc:delete` | functional (stub handler w/ toast) |
| `doc.redact.run` | Apply redaction | `documents` | `doc:redact` | functional |
| `doc.share.external` | Share outside agency | `documents` | `doc:share` | **stub** |
| `doc.version` | New version | `documents` | `doc:upload` | functional |
| `case.transfer` | Transfer case | `cases` | `case:assign` | **stub** |
| `case.close` | Close case | `cases` | `case:assign` | **stub** |
| `approvals.bulk` | Bulk approve | `approvals` | `doc:approve` | **stub** |
| `audit.export.csv` | Export CSV | `security` | `audit:export` | functional |
| `access.share.create` | New share link | `security` | `access:manage` | functional |
| `retention.purge` | Purge expired | `security` | `retention:manage` | **stub** |
| `admin.maintenance` | Maintenance mode | `admin` | `admin:users` | **stub** |
| `admin.sync.registry` | Sync registry | `admin` | `admin:users` | **stub** |

All default `enabled: true`. Stubs fire `toast.info('<label> — display-only control (no-op)')`.

---

## 6. HARDCODED DENIAL STRINGS — full inventory (must reach 0)

```
src/components/domain/index.tsx:19                     → C
src/pages/security/security-ui.tsx:7                   → C
src/pages/cases/CasesListPage.tsx:41, 48 (×2)          → D
src/pages/cases/CaseDetailPage.tsx:56                  → D
src/pages/documents/DocumentsLibraryPage.tsx:31        → D
src/pages/documents/DocumentViewerPage.tsx:24          → D
src/pages/upload/UploadWizardPage.tsx:39               → D
src/pages/approvals/ApprovalsPage.tsx:45, 49 (×3)      → D
src/pages/admin/AdminPage.tsx:24 + RolesTab `Read-only in demo` → D
src/pages/security/AccessControlPage.tsx footer claim  → D
```
Final check: `grep -rn "Requires Station Officer clearance\|Read-only in demo\|conditional access is evaluated" src/` → **0 hits**.

---

## 7. EXECUTION ORDER & PARALLELISM

```
Wave 1 ─┬─ A: RBAC core        (src/lib, src/store, src/data, src/components/rbac/Control.tsx)
        └─ B: Landing          (src/pages/marketing, src/components/marketing, index.html)
              │  gate: npm run lint && npm run build   +  A's back-compat check
              ▼
Wave 2 ─┬─ C: Enforcement      (App.tsx, layout, command, domain, security-ui, errors, auth)
        └─ D: Matrix + Controls (components/rbac/RoleMatrixTable, admin, security pages, surgical page edits)
              │  gate: npm run lint && npm run build   +  §6 grep = 0
              ▼
Wave 3 ──── E: QA + docs       (README, context.md, handoff/*, full Playwright script)
```
**Parallel-safety rules**
- Only A touches `src/lib|store|data`; only C touches `App.tsx` / `layout` / `domain`; only D touches `admin` / `security` pages; only B creates marketing files.
- C must **not** rename `GuardedButton`, `Panel`, `PermissionGate`, `PageHeader`, `RoleBadge` exports or change their props — D and the pages depend on them.
- D must **not** import anything C is creating (`ForbiddenPage`) — no dependency.
- A must keep `can(user,perm)` **and** `useCan()(perm)` both working, or C/D break.
- If a wave gate fails, fix in that wave before starting the next.

---

## 8. RISKS & MITIGATIONS

| Risk | Mitigation |
|---|---|
| Superadmin locks itself out of matrix editing | 🔒 locked cells + `resetMatrix()` in Controls tab |
| Stale `localStorage['esakshya-rbac']` breaks `can()` | versioned key + shape validation + fallback to `DEFAULT_MATRIX` |
| `can(user,p)` used at render time doesn't react to toggles | rule: render-time → `useCan()`; enumerated call sites in §3.3 and D4 |
| Two `can()` arities confuse agents | both signatures frozen; documented in §3.3; A self-checks both |
| C and D both edit `security-ui.tsx` | C owns it; D only imports it |
| Landing misses the design system | B's grep gate for hex literals + dark-mode + 900px check |
| `admin` demotion breaks existing demo flows (e.g. `doc:delete` Archive button, `IntegrityPage` `admin:users` anchor) | §1 "Consequence" list + E's per-role script |
| `ApprovalsPage` `allowed` wiring unknown | D4 explicitly verifies it maps to `doc:approve` |
| Seed `buildSeed()` breaks with 8th user | A4 checks for hardcoded index/count |
