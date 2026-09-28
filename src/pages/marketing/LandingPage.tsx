import { EyeOff, GitBranch, ScrollText, Share2, ShieldCheck, Siren, Stamp } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroImg from '@/assets/hero.png'
import { ClassificationBadge } from '@/components/domain'
import { Button } from '@/components/ui/button'

const capabilities = [
  { icon: ScrollText, title: 'Hash-chained audit log', description: 'Append-only events each cover the previous hash, so any deletion attempt is independently provable.' },
  { icon: GitBranch, title: 'Documented chain of custody', description: 'Intake, seal, transfer, unseal, derivative and export are timestamped and attributed to an accountable officer.' },
  { icon: Share2, title: 'Purpose-bound sharing', description: 'Every grant carries a stated purpose and expiry; classified material always carries a visible watermark.' },
  { icon: Siren, title: 'Break-glass access', description: 'Emergency access requires a 20-character justification, lasts 30 minutes and records every request.' },
  { icon: EyeOff, title: 'Classification-aware redaction', description: 'Redaction is a recorded act on a specific version, never a silent overwrite of the original record.' },
  { icon: Stamp, title: 'Court-ready eSign', description: 'CCA-anchored signatures travel with a Bharatiya Sakshya Adhiniyam 2023 certificate package.' },
]

const roles = [
  ['Investigator', [true, true, true, false, false, false]],
  ['Station Officer', [true, true, true, true, true, false]],
  ['Prosecutor', [true, true, false, true, true, false]],
  ['Court Clerk', [true, true, true, false, false, false]],
  ['Evidence Custodian', [true, true, true, false, false, false]],
  ['Auditor', [true, false, false, false, true, false]],
  ['Administrator', [true, true, false, false, true, true]],
  ['Super Administrator', [true, true, true, true, true, true]],
] as const

const permissions = ['doc:view', 'doc:download', 'doc:upload', 'doc:approve', 'audit:export', 'admin:users']

export function LandingPage() {
  return <>
    <section id="hero" className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">SIH 26190 <span aria-hidden>·</span> Ministry of Home Affairs / NCRB</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">The national secure document vault</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">Purpose-bound access, documented custody and hash-chained integrity for every record — from first information report to court order.</p>
        <div className="mt-7 flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/login">Launch console</Link></Button><Button asChild variant="outline" size="lg"><a href="#access">Explore the access model</a></Button></div>
      </div>
      <div className="relative">
        <div className="overflow-hidden rounded-md border shadow-sm"><img src={heroImg} alt="Officer reviewing a secure digital evidence record" className="w-full object-cover" /></div>
        <div className="absolute bottom-4 left-4 rounded-md border bg-card/95 px-3 py-2 text-xs font-medium"><span className="text-success">✓</span> SHA-256 verified</div>
        <div className="absolute right-4 top-4"><ClassificationBadge value="restricted" size="sm" /></div>
      </div>
    </section>

    <section aria-label="Participating institutions" className="border-y"><div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-6 px-4 py-5 text-xs font-medium uppercase tracking-widest text-muted-foreground sm:px-6"><span>Maharashtra Police</span><span>Directorate of Prosecution</span><span>eCourts Services</span><span>Forensic Science Laboratories</span><span>NCRB</span></div></section>

    <section aria-label="Vault statistics" className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="grid gap-6 rounded-md bg-sidebar p-6 text-sidebar-foreground sm:grid-cols-2 lg:grid-cols-4"><div><p className="mono-nums text-3xl font-semibold">1,48,206</p><p className="mt-1 text-sm text-sidebar-muted-foreground">records vaulted</p></div><div><p className="mono-nums text-3xl font-semibold">42.6 L</p><p className="mt-1 text-sm text-sidebar-muted-foreground">hash-chain events</p></div><div><p className="mono-nums text-3xl font-semibold">220 ms</p><p className="mt-1 text-sm text-sidebar-muted-foreground">median seal time</p></div><div><p className="mono-nums text-3xl font-semibold">99.99%</p><p className="mt-1 text-sm text-sidebar-muted-foreground">audit availability</p></div></div></section>

    <section id="capabilities" className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-widest text-gold">Evidence infrastructure</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Built for evidence that must survive scrutiny</h2><p className="mt-3 text-muted-foreground">Controls are designed around how investigation records are received, examined, challenged and relied upon in court.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{capabilities.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-md border bg-card p-5"><span className="grid size-9 place-items-center rounded border bg-muted"><Icon className="size-4 text-primary" /></span><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></article>)}</div></section>

    <section id="workflow" className="border-y bg-card"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-widest text-gold">Custody workflow</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">From seizure to court order</h2></div><ol className="mt-9 grid gap-8 md:grid-cols-3">{[['01', 'Intake & hash', 'Register the record against its case, source and classification; calculate its SHA-256 fingerprint at intake.'], ['02', 'Seal & anchor', 'Seal the original, capture the authorised custodian and append the event to the audit chain for anchoring.'], ['03', 'Authorised release', 'Release only the approved version to a named role, purpose and time window, with exports watermarked.']].map(([number, title, description]) => <li key={number} className="relative border-t pt-5"><span className="absolute -top-1.5 left-0 size-3 rounded-full border-2 border-card bg-gold" /><p className="mono-nums text-xs font-semibold text-gold">{number}</p><h3 className="mt-2 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></li>)}</ol></div></section>

    <section id="access" className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-widest text-gold">Role-based controls</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Access is a matrix, not a checkbox</h2><p className="mt-3 text-muted-foreground">Permissions are deliberately separated so routine collaboration never becomes unrestricted access.</p></div><div className="mt-8 overflow-x-auto rounded-sm border bg-card"><table className="w-full min-w-[720px] text-xs"><caption className="sr-only">Role permission matrix teaser</caption><thead className="bg-muted text-muted-foreground"><tr><th scope="col" className="px-3 py-3 text-left font-medium">Role</th>{permissions.map((permission) => <th key={permission} scope="col" className="px-3 py-3 text-center font-mono font-medium">{permission}</th>)}</tr></thead><tbody>{roles.map(([role, grants]) => <tr key={role} className="border-t"><th scope="row" className="whitespace-nowrap px-3 py-3 text-left font-medium">{role}</th>{grants.map((granted, index) => <td key={`${role}-${permissions[index]}`} className="px-3 py-3 text-center"><span aria-label={granted ? 'Granted' : 'Not granted'} className={granted ? 'font-semibold text-success' : 'text-muted-foreground'}>{granted ? '✓' : '✗'}</span></td>)}</tr>)}</tbody></table></div><div className="mt-4 flex flex-wrap gap-2">{roles.map(([role]) => <span key={role} className="rounded-sm bg-secondary px-2 py-1 text-xs text-secondary-foreground">{role}</span>)}</div><div className="mt-6 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted-foreground">Every button, route and menu in the console is gated by this matrix.</p><Button asChild variant="outline"><Link to="/login">Open Administration</Link></Button></div></section>

    <section id="security" className="border-y bg-card"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-widest text-gold">Security &amp; compliance</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Defensible by design</h2><p className="mt-3 text-muted-foreground">Technical safeguards are paired with records that show who acted, why they acted and what changed.</p></div><ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">{['Bharatiya Sakshya Adhiniyam 2023 (ss. 61–63)', 'IT Act 2000 eSign', 'AES-256 at rest', 'SHA-256 + Merkle anchoring', 'Watermarked exports', 'Append-only audit chain'].map((item) => <li key={item} className="flex items-start gap-3 text-sm"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" /><span>{item}</span></li>)}</ul></div></section>

    <section aria-label="Testimonial" className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><figure className="border-l-4 border-gold pl-6"><blockquote className="font-serif text-2xl leading-9 sm:text-3xl">“When a defence counsel asks who handled a record, when it moved and whether it changed, our answer must be a verifiable trail — not an officer&apos;s recollection. That is what makes the custody record defensible in cross-examination.”</blockquote><figcaption className="mt-5 text-sm font-medium">SPI Raghavendra Patil <span className="font-normal text-muted-foreground">· Station House Officer, Cyber Police Station, Pune</span></figcaption></figure></section>

    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6"><div className="rounded-md border bg-card p-8 text-center"><p className="text-xs font-semibold uppercase tracking-widest text-gold">Explore safely</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Start in the demo console</h2><p className="mt-3 text-muted-foreground">Review the role-specific evidence workflow with fictionalised demonstration data.</p><Button asChild className="mt-6" size="lg"><Link to="/login">Launch console</Link></Button><p className="mt-3 text-sm text-muted-foreground">Sign in with the demo OTP — <span className="mono-nums">123456</span></p></div></section>
  </>
}
