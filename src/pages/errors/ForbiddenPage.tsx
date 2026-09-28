import { Link, useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { RoleBadge } from '@/components/domain'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PERMISSION_LABELS, rolesWith } from '@/lib/permissions'
import { useSession } from '@/store/session'
import type { Permission } from '@/lib/types'

export function ForbiddenPage({ permission }: { permission?: Permission; path?: string }) {
  const navigate = useNavigate()
  const user = useSession((state) => state.user)
  const users = useSession((state) => state.users)
  const setUserId = useSession((state) => state.setUserId)
  const roles = permission ? rolesWith(permission) : []

  return <div className="flex min-h-[60vh] flex-col items-center justify-center"><section className="mx-auto max-w-lg rounded-md border bg-card p-8 text-center"><div className="mx-auto grid size-12 place-items-center rounded-md border border-gold/50 bg-gold/10 text-gold"><ShieldAlert className="size-6" /></div><p className="mono-nums mt-5 text-7xl font-semibold tracking-tight">403</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Insufficient clearance</h1>{permission ? <><p className="mt-3 text-sm text-muted-foreground">This workspace requires the permission <b>“{PERMISSION_LABELS[permission]}”</b>.</p><div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm"><span className="text-muted-foreground">Granted to:</span>{roles.map((role) => <RoleBadge key={role} role={role} />)}</div></> : <p className="mt-3 text-sm text-muted-foreground">Your session does not grant access to this workspace.</p>}<label className="mt-6 block text-left text-xs font-medium text-muted-foreground">Switch demonstration role<Select value={user.id} onValueChange={setUserId}><SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger><SelectContent>{users.map((entry) => <SelectItem key={entry.id} value={entry.id}>{entry.name} · {entry.role}</SelectItem>)}</SelectContent></Select></label><div className="mt-6 flex flex-wrap justify-center gap-2"><Button variant="outline" onClick={() => navigate(-1)}>Go back</Button><Button asChild><Link to="/home">Back to home</Link></Button></div></section></div>
}
