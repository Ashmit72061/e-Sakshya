import { useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { FileText, FolderKanban, Gauge, Gavel, Search, ShieldAlert, ShieldCheck, Upload, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useData } from '@/store/data'

type PaletteItem = readonly [string, string, LucideIcon, string?]
const navigation: readonly PaletteItem[] = [
  ['Dashboard', '/', Gauge], ['Cases', '/cases', FolderKanban], ['Documents', '/documents', FileText], ['Upload record', '/upload', Upload], ['Secure search', '/search', Search], ['Approvals', '/approvals', Gavel], ['Access control', '/security/access', ShieldAlert], ['Audit log', '/security/audit', ShieldCheck], ['Integrity centre', '/security/integrity', ShieldCheck], ['Retention', '/security/retention', FileText], ['Administration', '/admin', Gauge],
] as const
const actions: readonly PaletteItem[] = [['Upload a record', '/upload', Upload], ['Verify audit chain', '/security/integrity', ShieldCheck], ['Request break-glass access', '/security/access', ShieldAlert]]

function PaletteGroup({ label, items, offset, active, onHover, onSelect }: { label: string; items: readonly PaletteItem[]; offset: number; active: number; onHover: (index: number) => void; onSelect: (path: string) => void }) {
  if (!items.length) return null
  return <section><h3 className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</h3>{items.map(([labelText, path, Icon, detail], index) => <button key={`${label}-${path}`} type="button" onMouseEnter={() => onHover(offset + index)} onClick={() => onSelect(path)} className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${active === offset + index ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}><Icon className="size-4 text-primary" /><span className="min-w-0 flex-1 truncate">{labelText}</span>{detail && <span className="font-mono text-xs text-muted-foreground">{detail}</span>}</button>)}</section>
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate(); const [query, setQuery] = useState(''); const [rawActive, setActive] = useState(0)
  const cases = useData((s) => s.cases); const documents = useData((s) => s.documents)
  const normalized = query.toLowerCase().trim()
  const matches = (items: readonly PaletteItem[]) => items.filter(([label]) => !normalized || label.toLowerCase().includes(normalized))
  const nav = matches(navigation); const actionItems = matches(actions)
  const caseItems = useMemo(() => cases.filter((item) => !normalized || `${item.id} ${item.title} ${item.firNumber}`.toLowerCase().includes(normalized)).slice(0, 5).map((item) => [item.title, `/cases/${item.id}`, FolderKanban, item.id] as const), [cases, normalized])
  const docItems = useMemo(() => documents.filter((item) => !normalized || `${item.title} ${item.searchableText}`.toLowerCase().includes(normalized)).slice(0, 6).map((item) => [item.title, `/documents/${item.id}`, FileText, item.caseId] as const), [documents, normalized])
  const all = [...nav, ...actionItems, ...caseItems, ...docItems]
  const active = Math.min(rawActive, Math.max(all.length - 1, 0))
  useEffect(() => { const handler = (event: globalThis.KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); onOpenChange(true) } }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler) }, [onOpenChange])
  const select = (path: string) => { onOpenChange(false); setQuery(''); navigate(path) }
  const keyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => { if (!all.length) return; if (event.key === 'ArrowDown') { event.preventDefault(); setActive((value) => (value + 1) % all.length) } if (event.key === 'ArrowUp') { event.preventDefault(); setActive((value) => (value - 1 + all.length) % all.length) } if (event.key === 'Enter') { event.preventDefault(); select(all[active][1]) } }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="top-[15%] translate-y-0 overflow-hidden p-0 sm:max-w-2xl" showCloseButton={false}><DialogHeader className="sr-only"><DialogTitle>Command palette</DialogTitle><DialogDescription>Search secure records and navigate the vault.</DialogDescription></DialogHeader><div className="flex items-center gap-2 border-b px-3"><Search className="size-4 text-muted-foreground" /><Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={keyDown} placeholder="Search pages, cases and documents…" className="border-0 shadow-none focus-visible:ring-0" /><kbd className="hidden rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">ESC</kbd></div><div className="max-h-[60vh] overflow-y-auto pb-2"><PaletteGroup label="Navigation" items={nav} offset={0} active={active} onHover={setActive} onSelect={select} /><PaletteGroup label="Actions" items={actionItems} offset={nav.length} active={active} onHover={setActive} onSelect={select} /><PaletteGroup label="Recent cases" items={caseItems} offset={nav.length + actionItems.length} active={active} onHover={setActive} onSelect={select} /><PaletteGroup label={normalized ? 'Matching documents' : 'Recent documents'} items={docItems} offset={nav.length + actionItems.length + caseItems.length} active={active} onHover={setActive} onSelect={select} />{!all.length && <p className="p-6 text-center text-sm text-muted-foreground">No authorised records match this search.</p>}</div><p className="border-t px-3 py-2 text-xs text-muted-foreground">Use ↑ ↓ to select, Enter to open, Esc to close.</p></DialogContent></Dialog>
}
