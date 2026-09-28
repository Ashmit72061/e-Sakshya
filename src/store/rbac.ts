import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useData } from '@/store/data'
import { useSession } from '@/store/session'
import type { ControlArea, ControlDef, Permission, Role, RolePermissionMatrix } from '@/lib/types'

const KEY = 'esakshya-rbac-v1'
const roles: Role[] = ['investigator', 'station-officer', 'prosecutor', 'court-clerk', 'evidence-custodian', 'auditor', 'admin', 'superadmin']
export const ALL_PERMISSIONS: Permission[] = ['doc:view', 'doc:download', 'doc:upload', 'doc:annotate', 'doc:redact', 'doc:sign', 'doc:approve', 'doc:share', 'doc:delete', 'case:view', 'case:create', 'case:assign', 'access:manage', 'audit:view', 'audit:export', 'retention:manage', 'admin:users', 'security:breakglass']
export const ROLE_LABELS: Record<Role, string> = { investigator: 'Investigating Officer', 'station-officer': 'Station Officer', prosecutor: 'Public Prosecutor', 'court-clerk': 'Court Clerk', 'evidence-custodian': 'Evidence Custodian', auditor: 'Compliance Auditor', admin: 'System Administrator', superadmin: 'Super Administrator' }
export const PERMISSION_LABELS: Record<Permission, string> = { 'doc:view': 'View records', 'doc:download': 'Download records', 'doc:upload': 'Upload records', 'doc:annotate': 'Annotate records', 'doc:redact': 'Redact records', 'doc:sign': 'eSign document', 'doc:approve': 'Approve workflow', 'doc:share': 'Share records', 'doc:delete': 'Delete records', 'case:view': 'View cases', 'case:create': 'Create cases', 'case:assign': 'Assign cases', 'access:manage': 'Manage access', 'audit:view': 'View audit', 'audit:export': 'Export audit', 'retention:manage': 'Manage retention', 'admin:users': 'Manage users', 'security:breakglass': 'Break-glass access' }
export const DEFAULT_MATRIX: RolePermissionMatrix[] = [
  { role: 'investigator', permissions: ['doc:view', 'doc:download', 'doc:upload', 'doc:annotate', 'doc:redact', 'case:view', 'case:create', 'audit:view', 'security:breakglass'] },
  { role: 'station-officer', permissions: ['doc:view', 'doc:download', 'doc:upload', 'doc:annotate', 'doc:redact', 'doc:sign', 'doc:approve', 'doc:share', 'case:view', 'case:create', 'case:assign', 'audit:view', 'audit:export', 'security:breakglass'] },
  { role: 'prosecutor', permissions: ['doc:view', 'doc:download', 'doc:annotate', 'doc:sign', 'doc:approve', 'case:view', 'audit:view', 'audit:export'] },
  { role: 'court-clerk', permissions: ['doc:view', 'doc:download', 'doc:sign', 'case:view', 'audit:view'] },
  { role: 'evidence-custodian', permissions: ['doc:view', 'doc:download', 'doc:upload', 'doc:annotate', 'case:view', 'audit:view', 'retention:manage'] },
  { role: 'auditor', permissions: ['doc:view', 'case:view', 'audit:view', 'audit:export'] },
  { role: 'admin', permissions: ['doc:view', 'doc:download', 'doc:share', 'case:view', 'case:assign', 'access:manage', 'audit:view', 'audit:export', 'retention:manage', 'admin:users', 'security:breakglass'] },
  { role: 'superadmin', permissions: ['doc:view', 'doc:download', 'doc:upload', 'doc:annotate', 'doc:redact', 'doc:sign', 'doc:approve', 'doc:share', 'doc:delete', 'case:view', 'case:create', 'case:assign', 'access:manage', 'audit:view', 'audit:export', 'retention:manage', 'admin:users', 'security:breakglass'] },
]

export const BUILTIN_CONTROLS: ControlDef[] = [
  { id: 'doc.delete', label: 'Delete record', area: 'documents', permission: 'doc:delete', stub: false, builtin: true },
  { id: 'doc.redact.run', label: 'Apply redaction', area: 'documents', permission: 'doc:redact', stub: false, builtin: true },
  { id: 'doc.share.external', label: 'Share outside agency', area: 'documents', permission: 'doc:share', stub: true, builtin: true },
  { id: 'doc.version', label: 'New version', area: 'documents', permission: 'doc:upload', stub: false, builtin: true },
  { id: 'case.transfer', label: 'Transfer case', area: 'cases', permission: 'case:assign', stub: true, builtin: true },
  { id: 'case.close', label: 'Close case', area: 'cases', permission: 'case:assign', stub: true, builtin: true },
  { id: 'approvals.bulk', label: 'Bulk approve', area: 'approvals', permission: 'doc:approve', stub: true, builtin: true },
  { id: 'audit.export.csv', label: 'Export CSV', area: 'security', permission: 'audit:export', stub: false, builtin: true },
  { id: 'access.share.create', label: 'New share link', area: 'security', permission: 'access:manage', stub: false, builtin: true },
  { id: 'retention.purge', label: 'Purge expired', area: 'security', permission: 'retention:manage', stub: true, builtin: true },
  { id: 'admin.maintenance', label: 'Maintenance mode', area: 'admin', permission: 'admin:users', stub: true, builtin: true },
  { id: 'admin.sync.registry', label: 'Sync registry', area: 'admin', permission: 'admin:users', stub: true, builtin: true },
]

interface RbacState {
  matrix: RolePermissionMatrix[]
  controls: Record<string, boolean>
  customControls: ControlDef[]
  togglePermission: (role: Role, perm: Permission) => void
  setControl: (id: string, enabled: boolean) => void
  createControl: (def: Omit<ControlDef, 'builtin'>) => void
  removeControl: (id: string) => void
  resetMatrix: () => void
}

const defaultMatrix = (): RolePermissionMatrix[] => DEFAULT_MATRIX.map((entry) => ({ role: entry.role, permissions: [...entry.permissions] }))
const defaultControls = (): Record<string, boolean> => Object.fromEntries(BUILTIN_CONTROLS.map((control) => [control.id, true]))
const isRole = (value: unknown): value is Role => typeof value === 'string' && roles.includes(value as Role)
const isPermission = (value: unknown): value is Permission => typeof value === 'string' && ALL_PERMISSIONS.includes(value as Permission)
const isArea = (value: unknown): value is ControlArea => ['topbar', 'documents', 'cases', 'approvals', 'admin', 'security'].includes(value as ControlArea)
const authorized = () => useSession.getState().user.role === 'superadmin'

function validMatrix(value: unknown): RolePermissionMatrix[] {
  if (!Array.isArray(value)) return defaultMatrix()
  const entries = new Map<Role, Permission[]>()
  for (const candidate of value) {
    if (!candidate || typeof candidate !== 'object') continue
    const entry = candidate as { role?: unknown; permissions?: unknown }
    if (!isRole(entry.role) || !Array.isArray(entry.permissions)) continue
    entries.set(entry.role, [...new Set(entry.permissions.filter(isPermission))])
  }
  return roles.map((role) => {
    const fallback = defaultMatrix().find((entry) => entry.role === role)!
    const permissions = entries.has(role) ? entries.get(role) ?? [] : fallback.permissions
    return role === 'superadmin' ? { role, permissions: [...new Set<Permission>([...permissions, 'access:manage', 'admin:users'])] } : { role, permissions }
  })
}

function validCustomControls(value: unknown): ControlDef[] {
  if (!Array.isArray(value)) return []
  const seen = new Set(BUILTIN_CONTROLS.map((control) => control.id))
  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object') return []
    const control = candidate as Partial<ControlDef>
    if (typeof control.id !== 'string' || !control.id.trim() || seen.has(control.id) || typeof control.label !== 'string' || !control.label.trim() || !isArea(control.area) || typeof control.stub !== 'boolean' || (control.permission !== undefined && !isPermission(control.permission))) return []
    seen.add(control.id)
    return [{ id: control.id, label: control.label, area: control.area, permission: control.permission, stub: control.stub, builtin: false }]
  })
}

export const useRbac = create<RbacState>()(persist((set, get) => ({
  matrix: defaultMatrix(),
  controls: defaultControls(),
  customControls: [],
  togglePermission: (role, perm) => {
    if (!authorized()) return
    if (role === 'superadmin' && (perm === 'access:manage' || perm === 'admin:users')) return
    const current = get().matrix.find((entry) => entry.role === role)
    if (!current) return
    const granted = !current.permissions.includes(perm)
    set((state) => ({ matrix: state.matrix.map((entry) => entry.role !== role ? entry : { ...entry, permissions: granted ? [...entry.permissions, perm] : entry.permissions.filter((item) => item !== perm) }) }))
    useData.getState().logAudit({ action: granted ? 'access.grant' : 'access.revoke', targetType: 'user', targetId: role, targetLabel: `${ROLE_LABELS[role]} · ${PERMISSION_LABELS[perm]}`, outcome: 'success', severity: 'notice', ip: '10.24.18.40', device: 'NCRB Secure Workspace', detail: 'Role matrix edited by Super Administrator' })
  },
  setControl: (id, enabled) => {
    if (!authorized() || !BUILTIN_CONTROLS.some((control) => control.id === id)) return
    set((state) => ({ controls: { ...state.controls, [id]: enabled } }))
  },
  createControl: (def) => {
    if (!authorized() || !def.id.trim() || !def.label.trim() || !isArea(def.area) || (def.permission !== undefined && !isPermission(def.permission)) || get().customControls.some((control) => control.id === def.id) || BUILTIN_CONTROLS.some((control) => control.id === def.id)) return
    set((state) => ({ customControls: [...state.customControls, { ...def, id: def.id.trim(), label: def.label.trim(), builtin: false }] }))
  },
  removeControl: (id) => {
    if (!authorized()) return
    set((state) => ({ customControls: state.customControls.filter((control) => control.id !== id) }))
  },
  resetMatrix: () => {
    if (!authorized()) return
    set({ matrix: defaultMatrix() })
  },
}), {
  name: KEY,
  partialize: (state) => ({ matrix: state.matrix, controls: state.controls, customControls: state.customControls }),
  merge: (persisted, current) => {
    const state = persisted as Partial<Pick<RbacState, 'matrix' | 'controls' | 'customControls'>> | undefined
    const controls = Object.fromEntries(BUILTIN_CONTROLS.map((control) => [control.id, typeof state?.controls?.[control.id] === 'boolean' ? state.controls[control.id] : true]))
    return { ...current, matrix: validMatrix(state?.matrix), controls, customControls: validCustomControls(state?.customControls) }
  },
}))
