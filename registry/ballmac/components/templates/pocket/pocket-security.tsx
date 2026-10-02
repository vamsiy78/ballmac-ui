// Ballmac UI: Pocket security page. https://ui.ballmac.com/templates/template-pocket
"use client"

import * as React from "react"
import { Fingerprint, KeyRound, LockKeyhole, ShieldCheck, Smartphone, Snowflake } from "lucide-react"

import { PocketShell, pocketDisplayClass, type PocketHrefs } from "@/components/ballmac/templates/pocket/pocket-theme"
import { cn } from "@/lib/utils"

const pillars = [
  { icon: Fingerprint, title: "Only you get in", body: "Face or fingerprint on your phone, plus a passkey that never leaves the device. No passwords to leak.", tone: "bg-chart-1" },
  { icon: LockKeyhole, title: "Encrypted end to end", body: "Everything is encrypted in transit and at rest. Card numbers live in a hardware vault, not in a database.", tone: "bg-chart-4" },
  { icon: KeyRound, title: "You decide every payment", body: "Set limits, switch off online or contactless, and approve unusual payments with a tap.", tone: "bg-chart-5" },
  { icon: ShieldCheck, title: "Insured and audited", body: "Deposits are FDIC insured up to $250,000, and independent auditors test us every quarter.", tone: "bg-chart-2" },
]
const steps = [
  { icon: Smartphone, t: "0:00", title: "You notice it’s gone", body: "Open Pocket on any other device and sign in with your passkey." },
  { icon: Snowflake, t: "0:20", title: "Freeze the card", body: "One tap stops every payment. The old phone is signed out at the same time." },
  { icon: LockKeyhole, t: "1:30", title: "Nothing was on the phone", body: "No balances or card numbers are stored on the device, so there is nothing to find." },
  { icon: ShieldCheck, t: "5:00", title: "A new card is on its way", body: "Order a replacement and it arrives in three days. The virtual card works in minutes." },
]

type PocketSecurityProps = React.ComponentProps<"div"> & { hrefs?: Partial<PocketHrefs> }

/** The security page: four pillars, a minute-by-minute lost-phone timeline, live status and a bug bounty. */
function PocketSecurity({ hrefs, ...props }: PocketSecurityProps) {
  return (
    <PocketShell page="security" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-6xl px-4 pt-14 pb-8 sm:px-6 sm:pt-20">
        <section aria-labelledby="pse-title" className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="bg-card inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-extrabold"><span className="bg-chart-1 size-2.5 rounded-full" aria-hidden="true" />All systems normal · 99.99% uptime this year</p>
            <h1 id="pse-title" className={cn("mt-6 text-[clamp(3rem,9vw,7rem)] leading-[0.9] text-balance", pocketDisplayClass)}>Boring on purpose.</h1>
            <p className="text-muted-foreground mt-5 max-w-xl text-xl font-medium text-pretty">Money should be the least exciting thing about your phone. This is how we make sure it is.</p>
          </div>
          <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-sm">
            <div className="bg-chart-1 absolute inset-[6%] rounded-full" /><div className="bg-[var(--pocket-navy)] absolute inset-[22%] rounded-full" /><ShieldCheck className="text-chart-1 absolute inset-[36%] size-[28%]" strokeWidth={1.6} />
            <span className="bg-card absolute top-[8%] end-[2%] rotate-6 rounded-2xl border px-3 py-1.5 text-sm font-extrabold shadow-lg">256-bit</span><span className="bg-card absolute bottom-[10%] start-[0%] -rotate-6 rounded-2xl border px-3 py-1.5 text-sm font-extrabold shadow-lg">Passkeys</span>
          </div>
        </section>

        <ul className="mt-20 grid gap-4 md:grid-cols-2">{pillars.map((p) => <li key={p.title} className={cn("rounded-[2rem] p-8 text-[var(--pocket-on-lime)] sm:p-10", p.tone)}><p.icon className="size-9" aria-hidden="true" /><h2 className={cn("mt-8 text-3xl", pocketDisplayClass)}>{p.title}</h2><p className="mt-3 text-lg font-medium text-pretty">{p.body}</p></li>)}</ul>

        <section aria-labelledby="pse-lost" className="mt-24">
          <h2 id="pse-lost" className={cn("max-w-2xl text-[clamp(2.2rem,5.5vw,4rem)] leading-[0.95] text-balance", pocketDisplayClass)}>What happens when you lose your phone</h2>
          <ol className="mt-12 grid gap-4 md:grid-cols-4">{steps.map((s, i) => <li key={s.title} className="bg-card relative rounded-3xl border p-6"><span className="text-primary text-sm font-extrabold tabular-nums">{s.t}</span><s.icon className="mt-6 size-7" aria-hidden="true" /><h3 className="mt-4 text-xl font-extrabold text-balance">{s.title}</h3><p className="text-muted-foreground mt-2 text-sm font-medium text-pretty">{s.body}</p><span className="sr-only">Step {i + 1} of {steps.length}</span></li>)}</ol>
        </section>

        <section aria-labelledby="pse-bounty" className="mt-24 grid gap-4 lg:grid-cols-2">
          <div className="bg-[var(--pocket-navy)] rounded-[2rem] p-8 text-[var(--pocket-on-navy)] sm:p-12"><h2 id="pse-bounty" className={cn("text-4xl", pocketDisplayClass)}>Find a bug, get paid.</h2><p className="mt-3 text-lg font-medium text-pretty">Our bug bounty pays up to $50,000 for serious findings. We publish every fixed report and credit the researcher.</p><p className={cn("text-chart-1 mt-8 text-7xl leading-none tabular-nums", pocketDisplayClass)}>$50k</p></div>
          <div className="bg-card rounded-[2rem] border p-8 sm:p-12"><h2 className={cn("text-4xl", pocketDisplayClass)}>Checked by others</h2><ul className="mt-6 grid grid-cols-2 gap-3">{["SOC 2 Type II", "ISO 27001", "PCI DSS Level 1", "FDIC insured"].map((c) => <li key={c} className="bg-secondary flex items-center gap-2 rounded-2xl p-4 text-sm font-extrabold"><ShieldCheck className="size-5 shrink-0" aria-hidden="true" />{c}</li>)}</ul><p className="text-muted-foreground mt-6 text-sm font-medium">Reports are available to customers on request. Last audit: August 2026.</p></div>
        </section>
      </main>
    </PocketShell>
  )
}

export { PocketSecurity, type PocketSecurityProps }
