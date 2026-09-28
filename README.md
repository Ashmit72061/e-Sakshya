# e-Sakshya — National Secure Document Vault

A high-fidelity frontend prototype for secure legal and investigation-document management, created for SIH26190. It demonstrates purpose-bound access, documented chain of custody, SHA-256 integrity verification, and eSign workflow patterns using realistic simulated data.

## Run locally

```bash
npm install
npm run dev
```

`/` shows the public landing page when signed out and the protected dashboard when signed in. `/home` remains a public landing-page alias.

Stack: Vite, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui, React Router v7, Zustand, Recharts, Lucide, and Sonner.

## Demo script

0. Open `/` (or `/home`) to see the public landing page; from it, **Launch console** goes to `/login`.
1. Open `/login`, continue, and enter OTP `123456`.
2. Review dashboard KPIs, attention items, and case/audit activity.
3. Open **Cases**, then any FIR to explore the six-tab case workspace.
4. Open a linked FIR in the document viewer and run **Verify integrity** for its SHA-256 hash.
5. Select **Upload** and use the demo document; the browser calculates a real SHA-256 intake hash.
6. Use **Secure Search**, switch to Semantic (AI), and inspect source citations.
7. Open **Approvals**, review a charge-sheet request, and complete the demonstration eSign ceremony.
8. Visit **Access Control** and submit a justified break-glass request (switch role if required).
9. Open **Audit Log** to verify the hash chain, then inspect receipts in **Integrity Centre**.
10. Sign in, switch the top-bar role to **Super Administrator** (Aarav Sinha), open **Administration → Roles & permissions**, click any cell to toggle a grant, and watch the sidebar and buttons change instantly. Then open **Controls & actions** to switch individual buttons off or create a new topbar no-op control. Use a non-permitted role to open a forbidden URL and demonstrate the route-level **403** page with its inline role switcher.

## Feature map

- Dashboard, case workspace, document library, responsive three-pane viewer, and secure intake wizard.
- Keyword and simulated semantic retrieval with cited source records.
- Approval queue, demonstration eSign, access-sharing, break-glass, audit-chain and retention controls.
- `/approvals` requires `doc:approve` and is available to Station Officers, Public Prosecutors, and Super Administrators.
- Public landing page at `/` when signed out, with `/home` retained as an alias; `/` shows the protected dashboard when signed in.
- Permission-guarded routes render a 403 screen on denial, with the required permission, eligible roles, and an inline role switcher.
- Permission-filtered sidebar and global command palette (`Ctrl+K` / `⌘K`) search only authorised routes and actions, plus cases and documents.
- Super Administrator-editable role × permission matrix with immediate, app-wide RBAC updates.
- Control registry: Super Administrators can enable builtin controls and create display-only no-op controls.
- Dark theme, responsive navigation, keyboard navigation, skip link, focus states, and route-specific titles.

## Prototype and legal notes

This is a **frontend prototype with a simulated backend**. Records, integrations, ledger anchors, notifications, and certificates are in-memory demonstrations; it does not connect to CCTNS, ICJS, eCourts, a CCA provider, or a production ledger. Role-grant and control settings are client-side only and persist in `localStorage` under `esakshya-rbac-v1`.

The interface references BSA 2023 sections 61–63 for electronic-record certificate concepts, DPDP Act 2023 purpose limitation and legal holds, and IT Act 2000 electronic-record/eSign concepts. These references are informational design cues, not legal advice or a claim of statutory compliance.
