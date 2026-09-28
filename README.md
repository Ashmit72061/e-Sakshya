# e-Sakshya — National Secure Document Vault

A high-fidelity frontend prototype for secure legal and investigation-document management, created for SIH26190. It demonstrates purpose-bound access, documented chain of custody, SHA-256 integrity verification, and eSign workflow patterns using realistic simulated data.

## Run locally

```bash
npm install
npm run dev
```

Stack: Vite, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui, React Router v7, Zustand, Recharts, Lucide, and Sonner.

## 10-stop demo script

1. Open `/login`, continue, and enter OTP `123456`.
2. Review dashboard KPIs, attention items, and case/audit activity.
3. Open **Cases**, then any FIR to explore the six-tab case workspace.
4. Open a linked FIR in the document viewer and run **Verify integrity** for its SHA-256 hash.
5. Select **Upload** and use the demo document; the browser calculates a real SHA-256 intake hash.
6. Use **Secure Search**, switch to Semantic (AI), and inspect source citations.
7. Open **Approvals**, review a charge-sheet request, and complete the demonstration eSign ceremony.
8. Visit **Access Control** and submit a justified break-glass request (switch role if required).
9. Open **Audit Log** to verify the hash chain, then inspect receipts in **Integrity Centre**.
10. Use the top-bar role switcher to demonstrate RBAC, including restricted Administration access.

## Feature map

- Dashboard, case workspace, document library, responsive three-pane viewer, and secure intake wizard.
- Keyword and simulated semantic retrieval with cited source records.
- Approval queue, demonstration eSign, access-sharing, break-glass, audit-chain and retention controls.
- Global command palette: `Ctrl+K` / `⌘K` searches routes, actions, cases, and documents.
- Dark theme, responsive navigation, keyboard navigation, skip link, focus states, and route-specific titles.

## Prototype and legal notes

This is a **frontend prototype with a simulated backend**. Records, integrations, ledger anchors, notifications, certificates, and access grants are in-memory demonstrations; it does not connect to CCTNS, ICJS, eCourts, a CCA provider, or a production ledger.

The interface references BSA 2023 sections 61–63 for electronic-record certificate concepts, DPDP Act 2023 purpose limitation and legal holds, and IT Act 2000 electronic-record/eSign concepts. These references are informational design cues, not legal advice or a claim of statutory compliance.
