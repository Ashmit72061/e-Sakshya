import { FileImage, FileText, Gavel, Landmark, Microscope, NotebookPen, Scale, ScrollText } from 'lucide-react'
import type { DocType, DocumentRecord } from '@/lib/types'

export const typeLabels: Record<DocType, string> = { fir: 'FIR', 'charge-sheet': 'Charge sheet', 'witness-statement': 'Witness statement', 'forensic-report': 'Forensic report', 'court-order': 'Court order', 'evidence-record': 'Evidence record', 'legal-notice': 'Legal notice', 'case-diary': 'Case diary', judgment: 'Judgment', application: 'Application', 'cctv-still': 'CCTV still', 'expert-deposition': 'Expert deposition' }
export const typeIcon = (type: DocType) => ({ fir: Landmark, 'charge-sheet': Scale, 'witness-statement': ScrollText, 'forensic-report': Microscope, 'court-order': Gavel, 'evidence-record': FileImage, 'legal-notice': FileText, 'case-diary': NotebookPen, judgment: Gavel, application: FileText, 'cctv-still': FileImage, 'expert-deposition': ScrollText }[type])
export const displayTitle = (doc: DocumentRecord) => doc.docType === 'witness-statement' ? 'Witness statement (protected)' : doc.title
export const protectedNote = (doc: DocumentRecord) => doc.docType === 'witness-statement' ? 'Identity protected under law' : undefined
export const lcsDiff = (before: string, after: string) => {
  const a = before.split('\n'), b = after.split('\n'); const table = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
  const out: { kind: 'same' | 'add' | 'remove'; text: string }[] = []; let i = 0, j = 0
  while (i < a.length || j < b.length) { if (i < a.length && j < b.length && a[i] === b[j]) { out.push({ kind: 'same', text: a[i++] }); j++ } else if (j < b.length && (i === a.length || table[i][j + 1] >= table[i + 1][j])) out.push({ kind: 'add', text: b[j++] }) ; else out.push({ kind: 'remove', text: a[i++] }) }
  return out
}
