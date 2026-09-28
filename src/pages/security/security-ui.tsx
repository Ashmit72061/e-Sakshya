import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { denialMessage, useCan } from '@/lib/permissions'
import type { Permission } from '@/lib/types'

export function GuardedButton({perm,children,onClick,variant='outline',className}:{perm:Permission;children:ReactNode;onClick:()=>void;variant?:'default'|'outline'|'destructive'|'secondary'|'ghost';className?:string}){const allowed=useCan()(perm);return <span title={allowed?undefined:denialMessage(perm)} aria-disabled={!allowed} className={!allowed?'inline-block cursor-not-allowed':''}><Button type="button" variant={variant} className={className} disabled={!allowed} onClick={onClick}>{children}</Button></span>}
export function Panel({title,children,action}:{title:string;children:ReactNode;action?:ReactNode}){return <section className="rounded-md border bg-card"><header className="flex items-center justify-between border-b px-4 py-3"><h2 className="text-sm font-semibold">{title}</h2>{action}</header>{children}</section>}
export const actionLabel=(a:string)=>({ 'doc.view':'Viewed document','doc.download':'Downloaded document','doc.upload':'Uploaded document','doc.share':'Shared document','access.revoke':'Revoked access','access.denied':'Access denied','breakglass.request':'Requested emergency access','breakglass.grant':'Granted emergency access','retention.hold':'Placed legal hold','retention.release':'Released legal hold','chain.verify':'Verified audit chain','login.failed':'Failed sign-in'}[a]??a.replaceAll('.',' '))
