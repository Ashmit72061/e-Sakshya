import type { ReactNode } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useSession } from '@/store/session'

export function MarketingLayout({ children }: { children: ReactNode }) {
  const theme = useSession((state) => state.theme)
  const toggleTheme = useSession((state) => state.toggleTheme)

  return <div className="min-h-screen bg-background text-foreground">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground">Skip to main content</a>
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link to="/home" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="e-Sakshya home">
          <span aria-hidden className="grid size-8 place-items-center rounded border border-gold/70 text-gold">✦</span>
          <span>e-Sakshya</span>
        </Link>
        <nav aria-label="Landing page" className="ml-auto hidden items-center gap-1 lg:flex">
          <a href="#capabilities" className="rounded px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">Capabilities</a>
          <a href="#workflow" className="rounded px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">Workflow</a>
          <a href="#access" className="rounded px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">Access model</a>
          <a href="#security" className="rounded px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">Security</a>
        </nav>
        <div className="ml-auto flex items-center gap-1 lg:ml-3">
          <Button type="button" variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/login">Sign in</Link></Button>
          <Button asChild size="sm"><Link to="/login">Launch console</Link></Button>
        </div>
      </div>
    </header>
    <main id="main-content">{children}</main>
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <section aria-labelledby="footer-product"><h2 id="footer-product" className="text-sm font-semibold">Product</h2><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li><a href="#capabilities" className="hover:text-foreground">Capabilities</a></li><li><a href="#workflow" className="hover:text-foreground">Custody workflow</a></li><li><Link to="/login" className="hover:text-foreground">Demo console</Link></li></ul></section>
          <section aria-labelledby="footer-access"><h2 id="footer-access" className="text-sm font-semibold">Access model</h2><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li><a href="#access" className="hover:text-foreground">Role matrix</a></li><li><a href="#access" className="hover:text-foreground">Purpose-bound grants</a></li><li><Link to="/login" className="hover:text-foreground">Administration</Link></li></ul></section>
          <section aria-labelledby="footer-security"><h2 id="footer-security" className="text-sm font-semibold">Security &amp; compliance</h2><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li><a href="#security" className="hover:text-foreground">Integrity controls</a></li><li><a href="#security" className="hover:text-foreground">BSA 2023 readiness</a></li><li><a href="#security" className="hover:text-foreground">Audit chain</a></li></ul></section>
          <section aria-labelledby="footer-legal"><h2 id="footer-legal" className="text-sm font-semibold">Legal</h2><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li><a href="#security" className="hover:text-foreground">Privacy notice</a></li><li><a href="#security" className="hover:text-foreground">Terms of use</a></li><li><a href="#security" className="hover:text-foreground">Responsible disclosure</a></li></ul></section>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3"><span>e-Sakshya v0.9 · DEMO</span><span className="font-semibold text-gold">OFFICIAL · DEMO DATA</span></div>
          <p>This prototype uses fictionalised records and does not connect to production government systems.</p>
        </div>
      </div>
    </footer>
  </div>
}
