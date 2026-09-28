import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, FileText, FolderOpen, ShieldAlert, UserRoundCheck } from 'lucide-react'
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader, StatCard, EmptyState } from '@/components/domain'
import { useData } from '@/store/data'
import { useSession } from '@/store/session'
import { formatRelative } from '@/lib/format'

const chartPalette = ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-gold)', 'var(--color-destructive)']
const actionLabel: Record<string, string> = { 'doc.view': 'viewed', 'doc.upload': 'uploaded', 'doc.download': 'downloaded', 'doc.sign': 'signed', 'approval.decide': 'decided approval', 'access.denied': 'was denied access', 'integrity.mismatch': 'reported an integrity mismatch', 'doc.export': 'exported' }

export function DashboardPage() {
  const { cases, documents, approvals, shares, audit, ready } = useData()
  const user = useSession((state) => state.user)
  const [now] = useState(() => Date.now())
  const metrics = useMemo(() => {
    const inDays = (date: string, days: number) => { const diff = new Date(date).getTime() - now; return diff >= 0 && diff <= days * 86400000 }
    return {
      open: cases.filter((item) => !['closed', 'archived'].includes(item.status)).length,
      weekDocs: documents.filter((item) => now - new Date(item.createdAt).getTime() <= 7 * 86400000).length,
      pending: approvals.filter((item) => item.state === 'pending').length,
      alerts: documents.filter((item) => item.integrity === 'failed' || item.integrity === 'warning').length,
      expiring: shares.filter((item) => item.status === 'active' && inDays(item.expiresAt, 7)).length,
    }
  }, [cases, documents, approvals, shares, now])
  const documentTypes = useMemo(() => Object.entries(documents.reduce<Record<string, number>>((acc, doc) => { acc[doc.docType.replaceAll('-', ' ')] = (acc[doc.docType.replaceAll('-', ' ')] ?? 0) + 1; return acc }, {})).map(([name, value]) => ({ name, value })), [documents])
  const activity = useMemo(() => Array.from({ length: 14 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (13 - index)); const key = date.toISOString().slice(0, 10)
    return { day: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(date), events: audit.filter((item) => item.ts.slice(0, 10) === key).length }
  }), [audit])
  const attention = [
    ...approvals.filter((item) => item.state === 'pending' && item.assignedTo === user.id).map((item) => ({ id: item.id, href: '/approvals', title: item.title, detail: `Approval due ${formatRelative(item.dueOn)}`, tone: 'warning' })),
    ...documents.filter((item) => item.integrity === 'warning' || item.integrity === 'failed').map((item) => ({ id: item.id, href: `/documents/${item.id}`, title: item.title, detail: item.integrity === 'failed' ? 'Integrity verification failed' : 'Metadata review required', tone: item.integrity === 'failed' ? 'destructive' : 'warning' })),
    ...shares.filter((item) => item.status === 'active' && new Date(item.expiresAt).getTime() - now <= 7 * 86400000 && new Date(item.expiresAt).getTime() >= now).map((item) => ({ id: item.id, href: '/security/access', title: `Access for ${item.recipientName}`, detail: `Expires ${formatRelative(item.expiresAt)}`, tone: 'primary' })),
  ].slice(0, 6)
  const distribution = useMemo(() => Object.entries(cases.reduce<Record<string, number>>((acc, item) => { acc[item.station] = (acc[item.station] ?? 0) + 1; return acc }, {})).sort((a, b) => b[1] - a[1]), [cases])
  const maxStation = Math.max(1, ...distribution.map(([, count]) => count))

  if (!ready) return <><PageHeader title="Operational dashboard" subtitle="Loading secure workspace activity…" /><div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-md border bg-muted" />)}</div></>
  return <div className="space-y-5">
    <PageHeader title="Operational dashboard" subtitle="Current case workload, secure record activity and items requiring attention." breadcrumb="Operations / Dashboard" />
    <section aria-label="Operational metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Open cases" value={metrics.open} delta={metrics.open ? 'Active investigations' : 'No active investigations'} icon={FolderOpen} />
      <StatCard label="Documents · 7 days" value={metrics.weekDocs} delta={metrics.weekDocs ? 'New secure records' : 'No new records this week'} icon={FileText} />
      <Link to="/approvals" className="focus-visible:rounded-md focus-visible:outline-2"><StatCard label="Pending approvals" value={metrics.pending} delta={metrics.pending ? 'Review workflow queue' : 'Workflow queue clear'} icon={UserRoundCheck} tone="warning" /></Link>
      <StatCard label="Integrity alerts" value={metrics.alerts} delta={metrics.alerts ? 'Review before export' : 'All monitored records clear'} icon={ShieldAlert} tone={metrics.alerts ? 'destructive' : 'success'} />
      <Link to="/security/access" className="focus-visible:rounded-md focus-visible:outline-2"><StatCard label="Access expiring" value={metrics.expiring} delta={metrics.expiring ? 'Within the next 7 days' : 'No access expires this week'} icon={AlertTriangle} tone={metrics.expiring ? 'warning' : 'success'} /></Link>
    </section>
    <section className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
      <article className="rounded-md border bg-card p-4"><div className="mb-3"><h2 className="text-sm font-semibold">Secure records by type</h2><p className="text-xs text-muted-foreground">Current vault distribution</p></div>{documentTypes.length ? <div className="h-60"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={documentTypes} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2}>{documentTypes.map((entry, index) => <Cell key={entry.name} fill={chartPalette[index % chartPalette.length]} />)}</Pie><Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--foreground)' }} /></PieChart></ResponsiveContainer></div> : <div className="h-60"><EmptyState title="No documents recorded" description="Document distribution will appear after intake." /></div>}<div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">{documentTypes.map((item, index) => <span key={item.name} className="text-xs text-muted-foreground"><i className="mr-1 inline-block size-2 rounded-full" style={{ backgroundColor: chartPalette[index % chartPalette.length] }} />{item.name} · {item.value}</span>)}</div></article>
      <article className="rounded-md border bg-card p-4"><div className="mb-3"><h2 className="text-sm font-semibold">Audit activity</h2><p className="text-xs text-muted-foreground">Append-only events recorded over 14 days</p></div><div className="h-60"><ResponsiveContainer width="100%" height="100%"><AreaChart data={activity} margin={{ left: -18, right: 6, top: 10 }}><defs><linearGradient id="audit-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35}/><stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} interval="preserveStartEnd"/><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}/><Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--foreground)' }} /><Area type="monotone" dataKey="events" name="Audit events" stroke="var(--color-primary)" strokeWidth={2} fill="url(#audit-area)" /></AreaChart></ResponsiveContainer></div></article>
    </section>
    <section className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
      <article className="rounded-md border bg-card"><header className="flex items-center justify-between border-b px-4 py-3"><div><h2 className="text-sm font-semibold">Needs attention</h2><p className="text-xs text-muted-foreground">Assigned approvals, integrity and expiring access</p></div><AlertTriangle className="size-4 text-warning" /></header>{attention.length ? <ul>{attention.map((item) => <li key={item.id} className="border-b last:border-0"><Link to={item.href} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/60 focus-visible:bg-muted"><span className={`size-2 rounded-full ${item.tone === 'destructive' ? 'bg-destructive' : item.tone === 'warning' ? 'bg-warning' : 'bg-primary'}`} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{item.title}</span><span className="block text-xs text-muted-foreground">{item.detail}</span></span><span className="text-xs text-primary">Open</span></Link></li>)}</ul> : <div className="p-4 text-sm text-muted-foreground">No action is currently assigned to you.</div>}</article>
      <article className="rounded-md border bg-card"><header className="flex items-center justify-between border-b px-4 py-3"><div><h2 className="text-sm font-semibold">Case distribution</h2><p className="text-xs text-muted-foreground">Registered cases by station</p></div><Link to="/cases" className="text-xs font-medium text-primary hover:underline">View cases</Link></header>{distribution.length ? <ul className="p-4">{distribution.map(([station, count]) => <li key={station} className="mb-3 last:mb-0"><div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate">{station}</span><span className="mono-nums font-medium">{count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(count / maxStation) * 100}%` }} /></div></li>)}</ul> : <div className="p-4 text-sm text-muted-foreground">No case distribution is available.</div>}</article>
    </section>
    <article className="rounded-md border bg-card"><header className="flex items-center justify-between border-b px-4 py-3"><div><h2 className="text-sm font-semibold">Recent recorded activity</h2><p className="text-xs text-muted-foreground">Latest events from the append-only audit chain</p></div><Link to="/security/audit" className="text-xs font-medium text-primary hover:underline">Open audit log</Link></header><ul className="divide-y">{audit.slice(-8).reverse().map((event) => <li key={event.id}><Link to="/security/audit" className="flex items-center gap-3 px-4 py-3 hover:bg-muted/60"><span className={`size-2 rounded-full ${event.severity === 'critical' ? 'bg-destructive' : event.severity === 'warning' ? 'bg-warning' : event.severity === 'notice' ? 'bg-success' : 'bg-primary'}`} /><span className="min-w-0 flex-1 text-sm"><b>{event.actorName}</b> {actionLabel[event.action] ?? event.action.replaceAll('.', ' ')} <span className="text-muted-foreground">· {event.targetLabel}</span></span><time className="shrink-0 text-xs text-muted-foreground">{formatRelative(event.ts)}</time></Link></li>)}</ul>{!audit.length && <div className="p-4 text-sm text-muted-foreground">No audit events are available.</div>}</article>
  </div>
}
