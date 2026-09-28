import { useEffect } from 'react'
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

const titles: Record<string, string> = { '/': 'Dashboard', '/cases': 'Cases', '/documents': 'Documents', '/upload': 'Secure intake', '/search': 'Secure search', '/approvals': 'Approvals', '/admin': 'Administration', '/security/access': 'Access control', '/security/audit': 'Audit log', '/security/integrity': 'Integrity centre', '/security/retention': 'Retention' }

function RouteEffects() { const { pathname } = useLocation(); useDocumentTitle(titles[pathname] ?? (pathname.startsWith('/cases/') ? 'Case workspace' : pathname.startsWith('/documents/') ? 'Document viewer' : 'e-Sakshya')); useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [pathname]); return null }
function Protected() { const authenticated = useSession((state) => state.authenticated); const location = useLocation(); return authenticated ? <AppShell /> : <Navigate to="/login" replace state={{ from: location.pathname + location.search }} /> }
function LoginRoute() { const authenticated = useSession((state) => state.authenticated); useDocumentTitle('Sign in'); return authenticated ? <Navigate to="/" replace /> : <LoginPage /> }

function App() { return <TooltipProvider><BrowserRouter><RouteEffects /><a className="sr-only fixed left-3 top-3 z-[100] rounded bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:outline-none" href="#main-content">Skip to main content</a><Routes><Route path="/login" element={<LoginRoute />} /><Route element={<Protected />}><Route path="/" element={<DashboardPage />} /><Route path="/cases" element={<CasesListPage />} /><Route path="/cases/:id" element={<CaseDetailPage />} /><Route path="/documents" element={<DocumentsLibraryPage />} /><Route path="/documents/:id" element={<DocumentViewerPage />} /><Route path="/upload" element={<UploadWizardPage />} /><Route path="/search" element={<SearchPage />} /><Route path="/approvals" element={<ApprovalsPage />} /><Route path="/admin" element={<AdminPage />} /><Route path="/security/access" element={<AccessControlPage />} /><Route path="/security/audit" element={<AuditLogPage />} /><Route path="/security/integrity" element={<IntegrityPage />} /><Route path="/security/retention" element={<RetentionPage />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter><Toaster richColors position="top-right" /></TooltipProvider> }
export default App
