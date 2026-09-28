import { useSession } from '@/store/session'
import type { Permission, Role, RolePermissionMatrix, User } from '@/lib/types'
const all: Permission[] = ['doc:view','doc:download','doc:upload','doc:annotate','doc:redact','doc:sign','doc:approve','doc:share','doc:delete','case:view','case:create','case:assign','access:manage','audit:view','audit:export','retention:manage','admin:users','security:breakglass']
const pick = (...permissions: Permission[]): Permission[] => permissions
export const ROLE_MATRIX: RolePermissionMatrix[] = [
  { role: 'investigator', permissions: pick('doc:view','doc:download','doc:upload','doc:annotate','doc:redact','case:view','case:create','audit:view','security:breakglass') },
  { role: 'station-officer', permissions: pick('doc:view','doc:download','doc:upload','doc:annotate','doc:redact','doc:sign','doc:approve','doc:share','case:view','case:create','case:assign','audit:view','audit:export','security:breakglass') },
  { role: 'prosecutor', permissions: pick('doc:view','doc:download','doc:annotate','doc:sign','doc:approve','case:view','audit:view','audit:export') },
  { role: 'court-clerk', permissions: pick('doc:view','doc:download','doc:upload','doc:sign','case:view','audit:view') },
  { role: 'evidence-custodian', permissions: pick('doc:view','doc:download','doc:upload','doc:annotate','case:view','audit:view','retention:manage') },
  { role: 'auditor', permissions: pick('doc:view','case:view','audit:view','audit:export') },
  { role: 'admin', permissions: all },
]
export const ROLE_LABELS: Record<Role, string> = { investigator: 'Investigating Officer', 'station-officer': 'Station Officer', prosecutor: 'Public Prosecutor', 'court-clerk': 'Court Clerk', 'evidence-custodian': 'Evidence Custodian', auditor: 'Compliance Auditor', admin: 'System Administrator' }
export function can(user: User, perm: Permission): boolean { return ROLE_MATRIX.find((entry) => entry.role === user.role)?.permissions.includes(perm) ?? false }
export function useCan(): (perm: Permission) => boolean { const user = useSession((state) => state.user); return (perm) => can(user, perm) }
