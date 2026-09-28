# handoff/research.md — Domain research digest (for screen agents)

## Legal/compliance anchors (use these *wordings*, never overclaim)
- **IT Act 2000**: s.4 legal recognition of electronic records; s.5/s.3A electronic signatures; CCA-licensed **eSign** signs the document *hash* (not the full file); CCA **trusted time-stamping** links a hash to a national time source → show `tsaId` + verification result.
- **BSA 2023 ss.61–63** (replaced Evidence Act s.65B from 1 Jul 2024): electronic records admissible with a **certificate** describing the record, production, device particulars, and conditions → prototype shows a "BSA Certificate Package" export (original + hash + custody + device details + cert status).
- **DPDP Act 2023**: purpose-bound processing, legal hold overrides deletion, breach notification, data-principal rights routed to authorised review (never promise delete for open cases).
- **Security wording**: "ISO/IEC 27001-**aligned** controls" — NOT "certified". Never "military-grade". Factual labels: `SHA-256 verified`, `Access expires in 2 days`, `Downloaded by …`.
- **Chain of custody** = append-only event stream: intake, access, transfer, seal/unseal, derivative, export. Originals immutable; edits create new versions.

## Ecosystem (mock linkage only, never claim live integration)
- **CCTNS** (police case records), **ICJS** (police↔courts↔prison↔forensic), **eCourts** (CNR, eFiling, orders/judgments), NCRB dashboards (aggregated stats only).
- First-class identifiers in UI: `FIR/PS-…/YYYY/NNN`, `CNR-…`, PS code, court name, BNS sections.

## Integrity / "blockchain" story (Blockchain & Cybersecurity theme)
1. SHA-256 computed at intake (real Web Crypto in the browser).
2. Every audit event: `hash = sha256(prevHash + payload)` → **verifiable chain** (Audit page "Verify chain" walks it).
3. Daily events batched → **Merkle root** → **anchored** to a permissioned ledger (`anchorTx`) + **TSA timestamp** (`tsaId`).
4. Integrity receipt UI: file hash, merkle root, anchor tx, TSA id, capture/verify times, chain: Capture → Hash → Timestamp → Anchor → Verify.
- NEVER show document content or PII "on chain"; anchor only hashes.
- States: `verified` (green) · `pending` (neutral, "awaiting anchoring") · `warning` (amber, "metadata changed; file hash intact") · `failed` (red, disable export + escalate CTA).

## Document metadata model (seed data must feel real)
- Global: doc id, type, title, case/FIR, station/district/state, IO, sections, classification, language, custodian, version, sha256, OCR state, retention/legal-hold, signature state.
- **FIR**: FIR no/year, PS, registration date/time, complainant, occurrence date/place, BNS sections, accused, SHO, attached complaint.
- **Charge sheet**: court/magistrate, IO, accused/custody, offence list, witnesses, exhibits, FSL refs, filing date, e-sign, court acknowledgement.
- **Witness statement**: witness (protected), recording officer, date/place, statutory basis, language, version, **anonymity flag — do not expose identity in lists/search**.
- **Forensic report**: lab/report no, requisition, exhibit IDs + seals, analyst, methods, findings, signature, accreditation ref.
- **Court order**: CNR, court/bench, order date/type, operative directions, next hearing, certified-copy status.
- **Evidence/seizure memo**: exhibit ID, item, seal/package no, seizing officer, date/time, photographs, current custodian.
- Classification ladder: `public → official → confidential → restricted → sealed` (color + text always).

## UI patterns to imitate
- **Reference products**: Mayan EDMS (density, metadata rail), Relativity/Everlaw (evidence workspace, cited AI), DocuWare (task dashboards), M-Files (metadata-first).
- **Audit log**: filter bar (date/actor/action/outcome) + dense table `Time | Actor | Action | Target | Case | Outcome | IP/Device`; expandable drawer adds `prevHash`/`hash`; severity color; export = confirmation modal + crypto receipt.
- **Search**: universal bar + facets (case, type, date, station, officer, classification, status, integrity); snippet with highlighted matches; toggle **Keyword / Semantic (AI)**; AI panel = answer + confidence note + cited docs w/ page + `AI-generated — verify against source` banner + helpful/incorrect feedback.
- **Access control**: role×permission matrix with ✓/conditional/✗; share dialog (recipient, permission, expiry, purpose, watermark toggle, pre-send warning "all accesses recorded"); **watermark preview** (`CONFIDENTIAL · name · badge · ts · case`); **break-glass modal** (mandatory justification → 30-min access → audit event + banner).
- **Viewer**: 3-pane (tree · facsimile w/ OCR highlight · tabs: Details/Versions/Activity/Signatures/Comments); toolbar: zoom, page nav, OCR find, annotate, redact, compare, download (gated); version diff = metadata field table + text split view.
- **Upload wizard**: drop zone (real File read) → simulated OCR progress → metadata form (type/case/classification/retention) → hash receipt (compute SHA-256 of file) → custody confirmation.
- **Approvals**: queue rows + detail drawer; workflow rail `Intake → Review → Approved → Filed → Archived`; eSign ceremony modal (role check → PIN → hashing → signed badge + cert id).
- **Dashboard**: KPIs (open cases, docs this week, pending approvals, integrity alerts, access expiring), recent activity feed, case-type chart (recharts), attention list (pending approvals / failed integrity / expiring shares).

## Visual system recap
- Chrome: deep navy sidebar `--sidebar`; canvas `--background`; govt-blue `--primary`; gold seal accents sparingly; emerald=verified, amber=pending, red=risk.
- Inter for UI, IBM Plex Mono (`mono-nums`) for hashes/IDs/timestamps, Source Serif 4 inside document facsimile.
- Compact tables (h-9 rows), 8px spacing rhythm, radius ≤8px, borders not shadows, tabular numerals.
- Trust cues > decoration. Classification badges always text+icon, never color alone (GIGW 3.0 / UX4G accessibility).
