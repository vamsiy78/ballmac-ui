// Ballmac UI: Orbit home page. https://ui.ballmac.com/templates/template-orbit
"use client"

import * as React from "react"
import { ArrowRight, Check, FileCheck2, Fingerprint, GitBranch, KeyRound, Lock, Network, ScrollText, Server } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { AuroraBackground } from "@/components/ballmac/aurora-background"
import { BlurFade } from "@/components/ballmac/blur-fade"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ballmac/chart"
import { CopyButton } from "@/components/ballmac/copy-button"
import { Marquee } from "@/components/ballmac/marquee"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { OrbitAgentRun } from "@/components/ballmac/templates/orbit/orbit-agent-run"
import { OrbitShell, type OrbitHrefs } from "@/components/ballmac/templates/orbit/orbit-theme"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--orbit-mono)" } as const
const display = "font-semibold tracking-[-0.045em] text-balance"

const customers = ["Brightwell", "Lattice", "Fieldly", "Halcyon", "Parallel", "Ridgeline", "Tessera", "Quanta", "Meridian"]

const tools = [
  { name: "stripe", calls: "1.2M", scope: "Refunds, invoices" },
  { name: "slack", calls: "860k", scope: "Post, read threads" },
  { name: "github", calls: "540k", scope: "PRs, issues, checks" },
  { name: "postgres", calls: "2.1M", scope: "Read-only queries" },
  { name: "gmail", calls: "310k", scope: "Drafts, send with approval" },
  { name: "browser", calls: "190k", scope: "Click, type, extract" },
]

const evalData = [
  { build: "#1", baseline: 61, orbit: 62 },
  { build: "#2", baseline: 63, orbit: 68 },
  { build: "#3", baseline: 62, orbit: 74 },
  { build: "#4", baseline: 64, orbit: 79 },
  { build: "#5", baseline: 63, orbit: 83 },
  { build: "#6", baseline: 65, orbit: 86 },
  { build: "#7", baseline: 64, orbit: 91 },
  { build: "#8", baseline: 66, orbit: 94 },
]
const evalConfig = { orbit: { label: "With Orbit evals", color: "var(--chart-1)" }, baseline: { label: "Shipping on vibes", color: "var(--chart-4)" } } satisfies ChartConfig

const security = [
  { icon: Fingerprint, title: "SSO and SCIM", text: "Okta, Entra ID and Google. Roles map to agents, tools and environments." },
  { icon: KeyRound, title: "Scoped credentials", text: "Agents never see secrets. Tools get short-lived, least-privilege tokens." },
  { icon: Lock, title: "Approvals", text: "Require a human for anything that spends, sends or deletes." },
  { icon: ScrollText, title: "Audit log", text: "Every prompt, tool call and decision, streamed to your SIEM." },
  { icon: Server, title: "Your cloud", text: "Run the data plane in your own VPC. Nothing leaves it." },
  { icon: FileCheck2, title: "Certified", text: "SOC 2 Type II, ISO 27001, GDPR, and HIPAA-ready." },
]

type OrbitHomeProps = React.ComponentProps<"div"> & { hrefs?: Partial<OrbitHrefs> }

function SectionIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-xl">
      <p className="text-chart-1 text-sm font-medium" style={mono}>{eyebrow}</p>
      <h2 className={cn("mt-3 text-3xl sm:text-4xl", display)}>{title}</h2>
      <p className="text-muted-foreground mt-4 text-pretty sm:text-lg">{children}</p>
    </div>
  )
}

/** The Orbit home page: a live agent run, tools, evals, traces, security and a closing call to action. */
function OrbitHome({ hrefs, ...props }: OrbitHomeProps) {
  return (
    <OrbitShell page="home" hrefs={hrefs} {...props}>
      <main>
        {/* Hero */}
        <section className="relative -mt-[4.25rem] overflow-hidden px-4 pt-36 pb-16 sm:px-6 sm:pt-44">
          <AuroraBackground aria-hidden="true" className="absolute inset-0 -z-10" colors={["var(--chart-1)", "var(--chart-5)", "var(--chart-4)"]} intensity={0.55} radialMask />
          <div className="mx-auto max-w-4xl text-center">
            <a href="#" className="bg-card/60 hover:bg-card focus-visible:ring-ring/50 mx-auto inline-flex items-center gap-2 rounded-full border py-1 pe-3 ps-1 text-sm backdrop-blur outline-none transition-colors focus-visible:ring-[3px]">
              <span className="bg-chart-1 text-background rounded-full px-2 py-0.5 text-xs font-medium">New</span>
              Computer use is generally available
              <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </a>
            <h1 className={cn("mt-7 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl", display)}>
              Agents that <span className="from-chart-1 via-chart-5 to-chart-2 bg-gradient-to-r bg-clip-text text-transparent">finish the job.</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-pretty sm:text-xl">
              Build, test and run AI agents with the tools, evals and guardrails a production team needs. Ship the first one this afternoon.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#" className="bg-foreground text-background focus-visible:ring-ring/50 inline-flex h-12 items-center gap-2 rounded-2xl px-6 font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">
                Start building <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
              </a>
              <div className="bg-card/70 flex h-12 items-center gap-2 rounded-2xl border pe-1.5 ps-4 text-sm backdrop-blur" style={mono}>
                <span className="text-muted-foreground" aria-hidden="true">$</span> npm i @orbit/sdk
                <CopyButton value="npm i @orbit/sdk" ariaLabel="Copy install command" />
              </div>
            </div>
          </div>
          <BlurFade className="mx-auto mt-16 max-w-5xl" delay={0.1}>
            <OrbitAgentRun />
          </BlurFade>
        </section>

        {/* Customers */}
        <section aria-label="Customers" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-muted-foreground text-center text-sm">Powering agents at 1,800 teams, from startups to the Fortune 100</p>
          <Marquee className="mt-8" speed={30} gap={56} fade pauseOnHover>
            {customers.map((c) => (
              <span key={c} className="text-muted-foreground/80 text-xl font-semibold tracking-tight">{c}</span>
            ))}
          </Marquee>
        </section>

        {/* Tools */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20">
          <SectionIntro eyebrow="01 / Tools" title="Give agents hands, not just words.">
            Connect any API, database or browser as a typed tool. Orbit handles auth, retries, rate limits and sandboxing, so the agent only decides what to do.
          </SectionIntro>
          <ul className="grid gap-3 sm:grid-cols-2">
            {tools.map((t) => (
              <li key={t.name} className="bg-card/60 hover:border-chart-1/40 group rounded-2xl border p-4 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={mono}>{t.name}</span>
                  <span className="bg-chart-2 size-1.5 rounded-full" aria-hidden="true" />
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{t.scope}</p>
                <p className="text-muted-foreground mt-3 text-xs tabular-nums" style={mono}>{t.calls} calls / mo</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Evals */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <figure className="bg-card/60 order-2 min-w-0 rounded-3xl border p-5 sm:p-6 lg:order-1">
            <figcaption className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">Task success rate</span>
              <span className="text-muted-foreground text-xs">Last 8 builds, 400 cases</span>
            </figcaption>
            <ChartContainer config={evalConfig} label="Task success rate over eight builds" summary="With Orbit evals, task success climbed from 62 to 94 percent over eight builds. Without evals it stayed between 61 and 66 percent." className="mt-5 aspect-[16/10] w-full">
              <LineChart data={evalData} margin={{ left: 0, right: 10, top: 8 }} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="build" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis domain={[50, 100]} tickLine={false} axisLine={false} width={36} tickFormatter={(v: number) => `${v}%`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" formatter={(v) => `${v}%`} />} />
                <Line dataKey="baseline" type="monotone" stroke="var(--color-baseline)" strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
                <Line dataKey="orbit" type="monotone" stroke="var(--color-orbit)" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </figure>
          <div className="order-1 lg:order-2">
            <SectionIntro eyebrow="02 / Evals" title="Stop shipping on vibes.">
              Turn any trace into a test case. Run the suite on every commit, compare models side by side, and block the merge when success drops.
            </SectionIntro>
            <ul className="mt-7 space-y-3 text-sm">
              {["Replay production runs against a new prompt", "LLM and code graders, with human review", "GitHub check that fails the build on regressions"].map((x) => (
                <li key={x} className="flex items-start gap-2.5"><Check className="text-chart-2 mt-0.5 size-4 shrink-0" aria-hidden="true" />{x}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Traces */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionIntro eyebrow="03 / Traces" title="See every decision an agent made.">
            Each run is a tree you can read: prompts, tool inputs, outputs, cost and latency. Branch from any step and rerun it.
          </SectionIntro>
          <div className="bg-card/60 mt-10 overflow-hidden rounded-3xl border" style={mono}>
            <div className="text-muted-foreground flex items-center gap-2 border-b px-5 py-3 text-xs"><GitBranch className="size-3.5" aria-hidden="true" /> run_8f3k2 · 5 spans · 4.7 s</div>
            <ul className="divide-y text-[13px]">
              {[
                { depth: 0, name: "refund-reconciler", ms: "4.7 s", w: 100, tone: "bg-chart-2" },
                { depth: 1, name: "plan", ms: "640 ms", w: 14, tone: "bg-chart-2" },
                { depth: 1, name: "stripe.refunds.list", ms: "820 ms", w: 18, tone: "bg-chart-1" },
                { depth: 1, name: "warehouse.query", ms: "1.2 s", w: 25, tone: "bg-chart-1" },
                { depth: 1, name: "gmail.send_draft", ms: "1.5 s", w: 32, tone: "bg-chart-3" },
              ].map((r, i) => (
                <li key={r.name} className="grid grid-cols-[1fr_5rem] items-center gap-4 px-5 py-3 sm:grid-cols-[minmax(0,16rem)_1fr_5rem]">
                  <span className="truncate" style={{ paddingInlineStart: `${r.depth * 1.25}rem` }}>{r.name}</span>
                  <span className="bg-muted/60 relative hidden h-2 overflow-hidden rounded-full sm:block">
                    <span className={cn("absolute inset-y-0 rounded-full", r.tone)} style={{ left: `${i === 0 ? 0 : [0, 14, 32, 57][i - 1]}%`, width: `${r.w}%` }} />
                  </span>
                  <span className="text-muted-foreground text-end tabular-nums">{r.ms}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Stats */}
        <section aria-label="Orbit in numbers" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <dl className="grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: 4.2, suffix: "B", label: "Tool calls a month", decimals: 1 },
              { v: 99.99, suffix: "%", label: "Uptime, last 12 months", decimals: 2 },
              { v: 1.4, suffix: " s", label: "p95 time to first action", decimals: 1 },
              { v: 38, suffix: "", label: "Regions, including yours", decimals: 0 },
            ].map((s) => (
              <div key={s.label} className="bg-background p-7">
                <dd className="text-4xl font-semibold tracking-[-0.04em] tabular-nums">
                  <NumberTicker value={s.v} format={{ minimumFractionDigits: s.decimals, maximumFractionDigits: s.decimals }} />{s.suffix}
                </dd>
                <dt className="text-muted-foreground mt-2 text-sm">{s.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        {/* Security */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionIntro eyebrow="04 / Trust" title="Built for the security review.">
            The controls your CISO asks for are on by default, not an enterprise upsell.
          </SectionIntro>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {security.map((s) => (
              <li key={s.title} className="bg-card/60 rounded-2xl border p-6">
                <span className="bg-chart-1/15 text-chart-1 flex size-10 items-center justify-center rounded-xl"><s.icon className="size-5" aria-hidden="true" /></span>
                <h3 className="mt-5 font-medium">{s.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm text-pretty">{s.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Quote */}
        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <blockquote>
            <p className={cn("text-2xl leading-snug sm:text-4xl", display)}>
              “We moved 40 percent of tier-one support to agents in a quarter, and the eval suite is the reason nobody was scared to ship it.”
            </p>
            <footer className="text-muted-foreground mt-8 flex items-center justify-center gap-3 text-sm">
              <span className="bg-chart-4/25 flex size-10 items-center justify-center rounded-full font-medium text-foreground" aria-hidden="true">PN</span>
              <span className="text-start"><span className="text-foreground block font-medium">Priya Nair</span>VP Engineering, Fieldly</span>
            </footer>
          </blockquote>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="bg-card/60 relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border px-6 py-16 text-center sm:py-20">
            <AuroraBackground aria-hidden="true" className="absolute inset-0 -z-10 opacity-70" colors={["var(--chart-1)", "var(--chart-5)"]} intensity={0.45} radialMask />
            <h2 className={cn("mx-auto max-w-2xl text-3xl sm:text-5xl", display)}>Your first agent is ten minutes away.</h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-pretty">Free for your first 10,000 runs. No credit card, no sales call.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#" className="bg-foreground text-background focus-visible:ring-ring/50 inline-flex h-12 items-center gap-2 rounded-2xl px-6 font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">
                Start building <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
              </a>
              <a href="#" className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-12 items-center gap-2 rounded-2xl border px-6 font-medium outline-none transition-colors focus-visible:ring-[3px]">
                <Network className="size-4" aria-hidden="true" /> Talk to an engineer
              </a>
            </div>
          </div>
        </section>
      </main>
    </OrbitShell>
  )
}

export { OrbitHome, type OrbitHomeProps }
