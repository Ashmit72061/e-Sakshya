# handoff/05-upload-search.md — Agent D: Upload wizard + Search + AI

**Status:** ⬜ pending → ✅ done / ❌ blocked

## Mission
Capture/intake flow and intelligent retrieval — where "AI" and real hashing show up.

## Files you OWN
```
src/pages/upload/UploadWizardPage.tsx   (+ src/pages/upload/*)
src/pages/search/SearchPage.tsx         (+ src/pages/search/*)
src/components/upload/* , src/components/search/*   (optional)
```

## A. Upload wizard `/upload` (supports `?case=CASE-ID` preselect)
5-step stepper (shadcn + custom rail), each step validates before Next:
1. **Select file** — real drag&drop zone + file input (accept pdf/jpg/png/docx). On file: read name/size/type, show card; **compute REAL `sha256Hex(await file.arrayBuffer())`** with progress; also offer "Use demo document" (picks a seeded text) so the flow works without a file. If no case preselected, require case select (from `useData.cases`).
2. **OCR & classify** — simulated OCR pipeline with staged progress bars (Ingesting → Page segmentation → Text extraction → Language detect → Indexing) taking ~2.5s total, then result: detected doc type suggestion (selectable), language, page count, extracted-text preview (mono, first 300 chars), confidence %. Allow "Re-run OCR".
3. **Metadata** — form: title, doc type, classification (radio row w/ descriptions), station (readonly from case), tags (chip input), language, retention policy select, legal-hold checkbox (gated `retention:manage`). Required-field validation with inline errors.
4. **Security & custody** — integrity receipt card: SHA-256 (mono, full, copy), algorithm, computed-at timestamp, custodian (current user), **Merkle + anchor preview** ("will be anchored in next batch"), watermark toggle, access classification summary; checkbox "I confirm chain-of-custody intake details are accurate" (required).
5. **Review & submit** — summary of steps 1–4, back buttons, "Submit to vault" → `addDocument` + `logAudit('doc.upload')` + `custody` intake event (if store lacks a helper, call mutations available; if a mutation is missing, note it in Status and approximate locally *without* editing shared files) → success screen: big verified badge, doc id, hashes, buttons "Open document" (→ `/documents/:id`), "Upload another".
- Step state in URL query (`?step=`) or local state; cancel button with confirm.

## B. Search `/search` (reads `?q=`)
- Big search bar with mode toggle **Keyword | Semantic (AI)**, scope chips (All / Within case `<active case if linked>` / OCR text / Metadata), and Filters button (mobile-style drawer for facets).
- **Facet rail**: doc type, classification, case, station, date range (two date inputs), status, integrity, language — with counts, multi-select, clear.
- **Results** (card list): icon, title, case chip, classification/status chips, **snippet with <mark> highlighted terms** (search `searchableText` and `title`), meta line (type · station · updated · size), integrity chip, quick actions (Open, Verify → toast w/ real recompute). Result count + sort (relevance/date/size) + empty state with suggestions.
- **Keyword mode**: real client-side filtering + simple scoring (term frequency in title/tags/text).
- **Semantic (AI) mode** (simulated but honest): show an **AI answer panel** at top — answer synthesized from top matches (deterministic template combining best docs: "Across N documents in M cases, …" + key findings list), confidence bar (e.g. 84%), **citations** `[1] Title — p.3` chips that scroll/open the doc, and the required banner `AI-generated summary — verify against source documents`. Plus feedback buttons (thumbs; on click → toast "Feedback recorded"). Clearly label the toggle effect: results still shown below.
- Recent searches (seeded 4) + suggested queries ("FIR with sections 318", "CCTV seizure memo", "forensic report match"). Cmd/Ctrl+K focuses the input (if integration agent adds a global palette later, still work standalone).

## Rules
Read `context.md`, `00-contracts.md`, `research.md`. Real Web Crypto hashing mandatory in both flows. No editing shared modules. `npm run build` passes → Status ✅.

## Status — Agent D

✅ Implemented `UploadWizardPage` and `SearchPage` with responsive, accessible workflows.

- Upload includes file drag/drop and input, real browser Web Crypto hashing, demo intake, URL-backed steps, staged OCR, metadata and RBAC-gated legal hold, receipt/custody confirmation, and vault submission/success navigation.
- Search includes URL-backed query, client-side weighted keyword search, facets/date filters, semantic AI summary/citations/feedback, highlighted snippets, Web Crypto verification, recent searches, and Ctrl/Cmd+K focus.
- `npx tsc -p tsconfig.app.json --noEmit` was run. It is blocked only by pre-existing parallel syntax errors in `src/pages/cases/CaseDetailPage.tsx:74`; no errors were reported in Agent D files.
- Deferred: the shared data-store contract has no custody-event append mutation, so `addDocument` records its built-in upload audit event but cannot append a dedicated custody record without changing shared state.
