// Ballmac UI: Orbit sign-in page. https://ui.ballmac.com/templates/template-orbit
"use client"

import * as React from "react"
import { ArrowRight, Check } from "lucide-react"

import { OrbitMark, OrbitShell, type OrbitHrefs } from "@/components/ballmac/templates/orbit/orbit-theme"

const mono = { fontFamily: "var(--orbit-mono)" } as const

type OrbitLoginProps = React.ComponentProps<"div"> & { hrefs?: Partial<OrbitHrefs> }

/** Orbit sign-in: a focused form beside a live-looking trace. */
function OrbitLogin({ hrefs, ...props }: OrbitLoginProps) {
  const [sent, setSent] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const home = hrefs?.home ?? "/orbit"
  return (
    <OrbitShell page="login" hrefs={hrefs} bare {...props}>
      <main className="grid min-h-dvh lg:grid-cols-2">
        <div className="flex flex-col px-6 py-8 sm:px-12">
          <a href={home} className="focus-visible:ring-ring/50 flex w-fit items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px]"><OrbitMark /> Orbit</a>
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
            {sent ? (
              <div role="status">
                <span className="bg-chart-2/15 text-chart-2 flex size-12 items-center justify-center rounded-2xl"><Check className="size-6" aria-hidden="true" /></span>
                <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">Check your inbox</h1>
                <p className="text-muted-foreground mt-3 text-pretty">We sent a sign-in link to <span className="text-foreground font-medium">{email}</span>. It works for 15 minutes.</p>
                <button type="button" onClick={() => setSent(false)} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 mt-6 rounded-md text-sm underline underline-offset-4 outline-none focus-visible:ring-[3px]">Use a different email</button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-semibold tracking-[-0.04em]">Welcome back</h1>
                <p className="text-muted-foreground mt-2">Sign in to your Orbit workspace.</p>
                <button type="button" className="hover:bg-accent focus-visible:ring-ring/50 mt-8 inline-flex h-11 items-center justify-center gap-2.5 rounded-xl border text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]">
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" /></svg>
                  Continue with GitHub
                </button>
                <div className="text-muted-foreground my-6 flex items-center gap-3 text-xs"><span className="bg-border h-px flex-1" />or with email<span className="bg-border h-px flex-1" /></div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (email.trim()) setSent(true)
                  }}
                >
                  <label htmlFor="orbit-email" className="text-sm font-medium">Work email</label>
                  <input
                    id="orbit-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="bg-card/60 focus-visible:ring-ring/50 placeholder:text-muted-foreground mt-2 h-11 w-full rounded-xl border px-3.5 text-sm outline-none focus-visible:ring-[3px]"
                  />
                  <button type="submit" className="bg-foreground text-background focus-visible:ring-ring/50 mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">
                    Email me a sign-in link <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </form>
                <p className="text-muted-foreground mt-6 text-xs text-pretty">New to Orbit? Signing in creates your workspace. By continuing you agree to the Terms and Privacy Policy.</p>
              </>
            )}
          </div>
        </div>

        <div aria-hidden="true" className="bg-surface relative hidden overflow-hidden border-l lg:block">
          <div className="from-chart-1/25 to-chart-5/10 absolute inset-0 bg-gradient-to-br via-transparent" />
          <div className="relative flex h-full flex-col justify-center gap-4 px-14">
            {[
              { t: "09:41:02", n: "refund-reconciler", s: "completed", tone: "text-chart-2" },
              { t: "09:41:00", n: "stripe.refunds.list", s: "214 rows", tone: "text-chart-1" },
              { t: "09:40:58", n: "support-triage", s: "approval needed", tone: "text-chart-3" },
              { t: "09:40:55", n: "warehouse.query", s: "208 matched", tone: "text-chart-1" },
              { t: "09:40:51", n: "onboarding-guide", s: "completed", tone: "text-chart-2" },
            ].map((r, i) => (
              <div key={r.t} className="bg-card/70 flex items-center justify-between rounded-2xl border px-5 py-4 text-sm backdrop-blur" style={{ ...mono, marginLeft: `${(i % 3) * 1.5}rem`, opacity: 1 - i * 0.14 }}>
                <span className="text-muted-foreground">{r.t}</span>
                <span>{r.n}</span>
                <span className={r.tone}>{r.s}</span>
              </div>
            ))}
            <p className="text-muted-foreground mt-6 max-w-sm text-lg text-pretty">“Orbit is the first agent platform our security team signed off on in a week.”</p>
          </div>
        </div>
      </main>
    </OrbitShell>
  )
}

export { OrbitLogin, type OrbitLoginProps }
