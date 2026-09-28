import { ALL_PERMISSIONS, DEFAULT_MATRIX, PERMISSION_LABELS, ROLE_LABELS, useRbac } from '@/store/rbac'
import { useSession } from '@/store/session'
import type { Permission, Role, RolePermissionMatrix, User } from '@/lib/types'

export { ALL_PERMISSIONS, ROLE_LABELS, PERMISSION_LABELS, DEFAULT_MATRIX }
export const ROLE_MATRIX: RolePermissionMatrix[] = DEFAULT_MATRIX

export function rolesWith(perm: Permission): Role[] {
  return useRbac.getState().matrix.filter((entry) => entry.permissions.includes(perm)).map((entry) => entry.role)
}

export function can(user: User, perm: Permission): boolean {
  return useRbac.getState().matrix.find((entry) => entry.role === user.role)?.permissions.includes(perm) ?? false
}

export function useCan(): (perm: Permission) => boolean {
  const user = useSession((state) => state.user)
  const matrix = useRbac((state) => state.matrix)
  return (perm) => matrix.find((entry) => entry.role === user.role)?.permissions.includes(perm) ?? false
}

export function useMatrix(): RolePermissionMatrix[] {
  return useRbac((state) => state.matrix)
}

export function denialMessage(perm: Permission): string {
  return `Requires “${PERMISSION_LABELS[perm]}” — granted to ${rolesWith(perm).map((role) => ROLE_LABELS[role]).join(', ')}`
}
