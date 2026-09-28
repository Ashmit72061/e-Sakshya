import type { Permission } from '@/lib/types'

export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/': 'case:view', '/cases': 'case:view', '/cases/:id': 'case:view',
  '/documents': 'doc:view', '/documents/:id': 'doc:view',
  '/upload': 'doc:upload', '/search': 'case:view', '/approvals': 'doc:approve',
  '/admin': 'admin:users',
  '/security/access': 'access:manage', '/security/audit': 'audit:view',
  '/security/integrity': 'audit:view', '/security/retention': 'retention:manage',
}

export const NAV_PERMISSIONS: Record<string, Permission> = {
  '/': 'case:view', '/cases': 'case:view', '/documents': 'doc:view', '/upload': 'doc:upload',
  '/search': 'case:view', '/approvals': 'doc:approve',
  '/security/access': 'access:manage', '/security/audit': 'audit:view',
  '/security/integrity': 'audit:view', '/security/retention': 'retention:manage',
  '/admin': 'admin:users',
}

export function permissionForPath(pathname: string): Permission | undefined {
  if (ROUTE_PERMISSIONS[pathname]) return ROUTE_PERMISSIONS[pathname]
  const segments = pathname.split('/').filter(Boolean)
  return Object.entries(ROUTE_PERMISSIONS)
    .filter(([route]) => route.includes(':'))
    .filter(([route]) => {
      const routeSegments = route.split('/').filter(Boolean)
      return routeSegments.length === segments.length && routeSegments.every((segment, index) => segment.startsWith(':') || segment === segments[index])
    })
    .sort(([left], [right]) => right.length - left.length)[0]?.[1]
}
