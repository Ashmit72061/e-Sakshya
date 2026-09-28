import type { ReactNode } from 'react'
export function AuthLayout({children}:{children:ReactNode}){return <main className="min-h-screen bg-sidebar p-4 text-sidebar-foreground sm:p-8"><div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">{children}</div></main>}
