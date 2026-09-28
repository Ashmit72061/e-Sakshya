import { Check, Lock, X } from 'lucide-react'
import type { JSX } from 'react'
import { ALL_PERMISSIONS, PERMISSION_LABELS, ROLE_LABELS, useMatrix } from '@/lib/permissions'
import { useSession } from '@/store/session'
import type { Permission, Role } from '@/lib/types'

const groups: Array<[string, Permission[]]> = [
  ['Document', ['doc:view', 'doc:download', 'doc:upload', 'doc:annotate', 'doc:redact', 'doc:sign', 'doc:approve', 'doc:share', 'doc:delete']],
  ['Case', ['case:view', 'case:create', 'case:assign']],
  ['Access & audit', ['access:manage', 'audit:view', 'audit:export', 'retention:manage', 'security:breakglass']],
  ['Administration', ['admin:users']],
]

export function RoleMatrixTable({ editable, onToggle }: { editable: boolean; onToggle?: (role: Role, perm: Permission) => void }): JSX.Element {
  const matrix = useMatrix()
  const user = useSession((state) => state.user)
  const roles = matrix.map((entry) => entry.role)
  return <><div className="overflow-x-auto"><table className="w-full min-w-[950px] text-center text-xs"><thead><tr className="border-b"><th className="p-2 text-left">Permission</th>{roles.map((role) => <th key={role} className={`p-2 ${role === user.role ? 'bg-primary/10 text-primary' : ''}`}>{ROLE_LABELS[role]}</th>)}</tr></thead><tbody>{groups.map(([group, permissions]) => <GroupRows key={group} group={group} permissions={permissions.filter((permission) => ALL_PERMISSIONS.includes(permission))} roles={roles} matrix={matrix} currentRole={user.role} editable={editable} onToggle={onToggle} />)}</tbody></table></div><p className="p-3 text-xs text-muted-foreground"><span className="text-success">✓</span> Granted · <span>✗</span> Not granted · <span className="text-gold">🔒</span> Self-preservation lock{editable && ' · Click a cell to toggle — applies immediately.'}</p></>
}

function GroupRows({ group, permissions, roles, matrix, currentRole, editable, onToggle }: { group: string; permissions: Permission[]; roles: Role[]; matrix: ReturnType<typeof useMatrix>; currentRole: Role; editable: boolean; onToggle?: (role: Role, perm: Permission) => void }) {
  return <>{<tr><th colSpan={9} className="bg-muted/60 px-3 py-2 text-left text-xs uppercase tracking-wide text-muted-foreground">{group}</th></tr>}{permissions.map((perm) => <tr key={perm} className="border-t"><td className="p-2 text-left">{PERMISSION_LABELS[perm]}</td>{roles.map((role) => <MatrixCell key={role} role={role} perm={perm} granted={matrix.find((entry) => entry.role === role)?.permissions.includes(perm) ?? false} active={role === currentRole} editable={editable} onToggle={onToggle} />)}</tr>)}</>
}

function MatrixCell({ role, perm, granted, active, editable, onToggle }: { role: Role; perm: Permission; granted: boolean; active: boolean; editable: boolean; onToggle?: (role: Role, perm: Permission) => void }) {
  const locked = role === 'superadmin' && (perm === 'access:manage' || perm === 'admin:users')
  const glyph = granted ? <Check className="mx-auto size-4 text-success" /> : <X className="mx-auto size-4 text-muted-foreground" />
  return <td title={locked ? undefined : `${ROLE_LABELS[role]}: ${granted ? 'Granted' : 'Not granted'}`} className={active ? 'bg-primary/5' : ''}>{locked ? <button type="button" disabled title="Self-preservation lock — cannot be revoked" className="w-full py-2"><Lock className="mx-auto size-4 text-gold" /></button> : editable ? <button type="button" onClick={() => onToggle?.(role, perm)} aria-pressed={granted} aria-label={`${ROLE_LABELS[role]} · ${PERMISSION_LABELS[perm]}`} className="w-full py-2 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring">{glyph}</button> : glyph}</td>
}
