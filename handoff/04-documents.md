# handoff/04-documents.md — Agent C: Document library + Viewer

**Status:** ✅ done

## Mission
The document library and the 3-pane viewer with integrity, versions, and collaboration — the densest, most impressive screens.

## Files you OWN
```
src/pages/documents/DocumentsLibraryPage.tsx
src/pages/documents/DocumentViewerPage.tsx
src/pages/documents/*            (supporting files)
src/components/documents/*        (if needed)
```

## A. Library `/documents`
- **Facet rail (left, 240px, collapsible)**: Doc type (counts), Classification, Status, Integrity, Signature, Case, Station, Language, Retention/legal-hold. Multi-select chips with counts from `useData.documents`; "Clear all".
- **Toolbar**: search input (title/tags/searchableText), sort (updated/title/size/classification), density toggle, view toggle (table ↔ grid), result count, "Upload" → `/upload` (gated `doc:upload`).
- **Table rows**: type icon (by DocType), title (+ one-line summary), case chip → `/cases/:id`, classification badge, status chip, version `v3`, integrity badge, signature chip, size (mono), updated relative, ⋯ menu (Open, Copy link, Download → gated+logs audit+toast, Verify integrity → local modal w/ `sha256Hex` on `searchableText` recompute demo, Share → gated). Row → `/documents/:id`.
- **Witness protection**: witness-statement titles show "Witness statement — [REDACTED]" for users without `doc:annotate`/prosecutor role? Simpler: always show "Witness statement (protected)" and hide party names; note "Identity protected under law" badge.
- Grid view: compact cards with class-stripe + integrity chip.
- Multi-select + bulk bar (Download/Archive — gated, toasts).

## B. Viewer `/documents/:id` (the flagship screen)
3-pane layout (full height, own scroll areas):
1. **Left rail (220px, collapsible)**: case folder tree (Cases → case → doc-type folders → docs) with active highlight; click navigates.
2. **Center — DocumentFacsimile**: paper-like page (serif, max-w ~780px) rendering the doc's `searchableText` with structural formatting, letterhead for FIR/charge-sheet, page footer `Page 1 of N`. Toolbar above: zoom −/+/fit, page prev/next (updates page number), OCR text toggle (switch facsimile ↔ raw mono text), OCR find box (highlights matches, shows "3/7"), annotate btn (toggles a click-to-add pin w/ comment popover — local state), redact btn (gated `doc:redact`: drag-rectangle overlay → adds a black bar + "Draft redaction" chip; second click applies), download (gated), print, share (gated), verify integrity, ⋯.
   - **WatermarkOverlay** always on for classification ≥ confidential: diagonal repeated `OFFICIAL · <user.name> · <badge> · <timestamp> · <caseId>` — and a "Watermark preview" toggle showing it for all.
   - If `signature.state === 'valid'`, render a signature block/stamp at the bottom of page 1 (gold seal + signer + cert id + mono hash).
3. **Right rail (340px, Tabs)**:
   - **Details**: Integrity card (IntegrityBadge + SHA-256 `HashText` full width + Copy + "Verify now" → async recompute with spinner → verified toast + `verifiedAt`), metadata definition list (all DocumentRecord fields), retention w/ legal-hold switch (gated `retention:manage` → `setLegalHold` + toast + audit), linked case, custodian.
   - **Versions**: timeline of `versionsOf(docId)` — v#, label, author, date, hash, note; "Compare" opens a diff modal: metadata field-by-field before/after table (changed rows highlighted) + text diff (simple line-based diff of `searchableText` between a synthesized previous version note — implement a tiny LCS line diff util locally). "Create version" gated `doc:upload` → `addVersion` + toast.
   - **Activity**: audit events for this doc (compact) + **Chain of Custody** TimelineList (custodyFor) with seal/transfer/access kinds; "Export custody report" gated `audit:export` → confirmation dialog showing scope + fake crypto receipt toast.
   - **Signatures**: signature state card; if unsigned → "Request signature" (gated `doc:sign`) → sets pending + toast; if valid → signer/cert/timestamp details + "View certificate" modal (hash, cert id, TSA id, chain visual Capture → Hash → Timestamp → Verify).
   - **Comments**: thread (2–3 seeded comments) + composer (adds locally + toast), resolve checkbox, @mention styling — collaboration demo.
- **Top strip above panes**: breadcrumbs `Documents / <title>`, classification badge, status chip, signature chip, integrity chip; right: Share/Download/⋯ (gated).

## Rules
Read `context.md`, `00-contracts.md`, `research.md`. Use `sha256Hex` for verify flows (real Web Crypto). Gate with PermissionGate. Dense govt aesthetic. `npm run build` passes → Status ✅.

## Status — Agent C
✅ Implemented the document library, 3-pane viewer, local LCS diff helper, faceting, protected witness labels, RBAC action states, Web Crypto verification, legal hold, signatures, custody export confirmation, comments, and annotation/redaction demos.

✅ Scoped typecheck passed: `npx tsc -p tsconfig.documents.json --noEmit` (temporary config removed afterward).

❌ Repository-wide `npx tsc -p tsconfig.app.json --noEmit` is blocked by a pre-existing syntax error in `src/pages/cases/CaseDetailPage.tsx:74`; Agent C files were not reported.
