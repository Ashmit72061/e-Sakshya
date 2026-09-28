import { useEffect, useRef, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { CasesListPage } from '@/pages/cases/CasesListPage'
import { CaseDetailPage } from '@/pages/cases/CaseDetailPage'
import { DocumentsLibraryPage } from '@/pages/documents/DocumentsLibraryPage'
import { DocumentViewerPage } from '@/pages/documents/DocumentViewerPage'
import UploadWizardPage from '@/pages/upload/UploadWizardPage'
import SearchPage from '@/pages/search/SearchPage'
import { ApprovalsPage } from '@/pages/approvals/ApprovalsPage'
import { AdminPage } from '@/pages/admin/AdminPage'
import { AccessControlPage } from '@/pages/security/AccessControlPage'
import { AuditLogPage } from '@/pages/security/AuditLogPage'
import { IntegrityPage } from '@/pages/security/IntegrityPage'
import { RetentionPage } from '@/pages/security/RetentionPage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSession } from '@/store/session'
import { useData } from '@/store/data'
import { PERMISSION_LABELS, ROLE_LABELS, useCan } from '@/lib/permissions'
import { ROUTE_PERMISSIONS } from '@/lib/routes'
import type { Permission } from '@/lib/types'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'
import { MarketingLayout } from '@/components/marketing/MarketingLayout'
import { LandingPage } from '@/pages/marketing/LandingPage'

const titles: Record<string, string> = { '/home': 'e-Sakshya — National Secure Document Vault', '/': 'Dashboard', '/cases': 'Cases', '/documents': 'Documents', '/upload': 'Secure intake', '/search': 'Secure search', '/approvals': 'Approvals', '/admin': 'Administration', '/security/access': 'Access control', '/security/audit': 'Audit log', '/security/integrity': 'Integrity centre', '/security/retention': 'Retention' }

function RouteEffects() { const { pathname } = useLocation(); const authenticated = useSession((state) => state.authenticated); useDocumentTitle(pathname === '/' && !authenticated ? 'e-Sakshya — National Secure Document Vault' : titles[pathname] ?? (pathname.startsWith('/cases/') ? 'Case workspace' : pathname.startsWith('/documents/') ? 'Document viewer' : 'e-Sakshya')); useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [pathname]); return null }
function Protected() { return <AppShell /> }
function LoginRoute() { const authenticated = useSession((state) => state.authenticated); useDocumentTitle('Sign in'); return authenticated ? <Navigate to="/" replace /> : <LoginPage /> }
function Require({ children, perm }: { children: ReactNode; perm?: Permission }) { const authenticated = useSession((state) => state.authenticated); const user = useSession((state) => state.user); const allowed = useCan(); const location = useLocation(); const loggedDenial = useRef<string | undefined>(undefined); const denied = Boolean(perm && !allowed(perm)); const denialKey = perm ? `${location.pathname}:${perm}:${user.id}` : ''; useEffect(() => { if (!denied || !perm) { loggedDenial.current = undefined; return } if (loggedDenial.current === denialKey) return; loggedDenial.current = denialKey; void useData.getState().logAudit({ action: 'access.denied', targetType: 'system', targetId: location.pathname, targetLabel: `${location.pathname} · ${PERMISSION_LABELS[perm]}`, outcome: 'denied', severity: 'warning', ip: '10.24.18.40', device: 'NCRB Secure Workspace', detail: `Blocked for ${ROLE_LABELS[user.role]}` }) }, [denialKey, denied, location.pathname, perm, user.role]); if (!authenticated) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />; if (denied) return <ForbiddenPage permission={perm} path={location.pathname} />; return <>{children}</> }
function RootRoute() { const authenticated = useSession((state) => state.authenticated); if (authenticated) return <AppShell />; return <MarketingLayout><LandingPage /></MarketingLayout> }

function App() { return <TooltipProvider><BrowserRouter><RouteEffects /><a className="sr-only fixed left-3 top-3 z-[100] rounded bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:outline-none" href="#main-content">Skip to main content</a><Routes><Route path="/" element={<RootRoute />}><Route index element={<Require perm={ROUTE_PERMISSIONS['/']}><DashboardPage /></Require>} /></Route><Route path="/home" element={<MarketingLayout><LandingPage /></MarketingLayout>} /><Route path="/login" element={<LoginRoute />} /><Route element={<Protected />}><Route path="/cases" element={<Require perm={ROUTE_PERMISSIONS['/cases']}><CasesListPage /></Require>} /><Route path="/cases/:id" element={<Require perm={ROUTE_PERMISSIONS['/cases/:id']}><CaseDetailPage /></Require>} /><Route path="/documents" element={<Require perm={ROUTE_PERMISSIONS['/documents']}><DocumentsLibraryPage /></Require>} /><Route path="/documents/:id" element={<Require perm={ROUTE_PERMISSIONS['/documents/:id']}><DocumentViewerPage /></Require>} /><Route path="/upload" element={<Require perm={ROUTE_PERMISSIONS['/upload']}><UploadWizardPage /></Require>} /><Route path="/search" element={<Require perm={ROUTE_PERMISSIONS['/search']}><SearchPage /></Require>} /><Route path="/approvals" element={<Require perm={ROUTE_PERMISSIONS['/approvals']}><ApprovalsPage /></Require>} /><Route path="/admin" element={<Require perm={ROUTE_PERMISSIONS['/admin']}><AdminPage /></Require>} /><Route path="/security/access" element={<Require perm={ROUTE_PERMISSIONS['/security/access']}><AccessControlPage /></Require>} /><Route path="/security/audit" element={<Require perm={ROUTE_PERMISSIONS['/security/audit']}><AuditLogPage /></Require>} /><Route path="/security/integrity" element={<Require perm={ROUTE_PERMISSIONS['/security/integrity']}><IntegrityPage /></Require>} /><Route path="/security/retention" element={<Require perm={ROUTE_PERMISSIONS['/security/retention']}><RetentionPage /></Require>} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes><Toaster /></BrowserRouter></TooltipProvider> }
export default App
