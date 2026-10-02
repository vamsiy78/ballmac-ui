// Ballmac UI: Launch template page. https://ui.ballmac.com/templates/template-launch
"use client"

import * as React from "react"
import { Check, GitBranch, Gauge, Rocket, RotateCcw } from "lucide-react"

import { Cta3 } from "@/components/ballmac/blocks/cta-3/cta-3"
import { Features5 } from "@/components/ballmac/blocks/features-5/features-5"
import { Hero6, Hero6Float } from "@/components/ballmac/blocks/hero-6/hero-6"
import { LogoCloud1 } from "@/components/ballmac/blocks/logo-cloud-1/logo-cloud-1"
import { Stats1 } from "@/components/ballmac/blocks/stats-1/stats-1"
import { Testimonials2 } from "@/components/ballmac/blocks/testimonials-2/testimonials-2"
import { LaunchShell, launchMono, type LaunchHrefs } from "@/components/ballmac/templates/launch/launch-theme"
import { cn } from "@/lib/utils"

const card = "bg-card w-64 rounded-2xl border p-4 shadow-lg"

/** The three cards that float around the hero: a deploy, a budget and a rollback. Replace with product shots. */
function HeroCards() {
  return (
    <>
      <Hero6Float depth={22} bob={6.5} className="xl:top-[50%] xl:start-0 2xl:start-[3%]">
        <div className={card}>
          <p className="flex items-center gap-2 text-sm font-semibold"><Rocket className="text-primary size-4" aria-hidden="true" />Preview ready</p>
          <p className={cn("text-muted-foreground mt-2 text-xs", launchMono.className)}>feat/checkout-v2 · 41s</p>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium"><span className="bg-chart-2 size-2 rounded-full" aria-hidden="true" />Live at pe-482.beacon.app</p>
        </div>
      </Hero6Float>
      <Hero6Float depth={34} bob={7.5} delay={1.2} className="xl:top-[44%] xl:end-0 2xl:end-[3%]">
        <div className={card}>
          <p className="flex items-center gap-2 text-sm font-semibold"><Gauge className="text-primary size-4" aria-hidden="true" />Performance budget</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">94 <span className="text-muted-foreground text-xs font-medium">/ 90 required</span></p>
          <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full" aria-hidden="true"><div className="bg-chart-2 h-full w-[94%]" /></div>
        </div>
      </Hero6Float>
      <Hero6Float depth={14} bob={8} delay={0.6} className="xl:end-[3%] xl:bottom-[1%] 2xl:end-[9%]">
        <div className={card}>
          <p className="flex items-center gap-2 text-sm font-semibold"><RotateCcw className="text-primary size-4" aria-hidden="true" />Rolled back</p>
          <p className="text-muted-foreground mt-2 text-xs">Error rate crossed 2%. Production returned to <span className={launchMono.className}>v2.18.3</span> in 6s.</p>
        </div>
      </Hero6Float>
    </>
  )
}

function Visual({ children, label }: { children: React.ReactNode; label: string }) {
  return <div role="img" aria-label={label} className="bg-surface grid min-h-72 place-items-center rounded-3xl border p-6">{children}</div>
}

const steps = [
  {
    title: "Every branch gets a URL",
    description: "Push a branch and Beacon builds it, runs your checks and posts a live preview on the pull request. Reviewers click a link instead of cloning a repo.",
    points: ["Previews in under a minute", "Comments pinned to the page", "Shareable with people outside your team"],
    visual: (
      <Visual label="A list of three preview deployments, the newest building">
        <ul className="grid w-full max-w-sm gap-2.5">{[["feat/checkout-v2", "Ready", "bg-chart-2"], ["fix/nav-focus", "Ready", "bg-chart-2"], ["chore/deps", "Building", "bg-chart-3"]].map(([b, s, c]) => <li key={b} className="bg-card flex items-center justify-between rounded-xl border px-4 py-3 text-sm shadow-xs"><span className="flex items-center gap-2"><GitBranch className="text-muted-foreground size-4" aria-hidden="true" /><span className={launchMono.className}>{b}</span></span><span className="flex items-center gap-1.5 text-xs font-medium"><span className={cn("size-2 rounded-full", c)} aria-hidden="true" />{s}</span></li>)}</ul>
      </Visual>
    ),
  },
  {
    title: "Budgets that block bad merges",
    description: "Set a ceiling for bundle size, load time or accessibility score. If a change breaks it, the check fails with the exact line that did.",
    points: ["Lighthouse and bundle budgets", "Per-route limits", "Trend lines over time"],
    visual: (
      <Visual label="Three budget bars: bundle size passes, load time passes and accessibility fails">
        <ul className="grid w-full max-w-sm gap-4">{[["Bundle size", 72, true, "148 KB of 200 KB"], ["Load time", 58, true, "1.6 s of 2.5 s"], ["Accessibility", 100, false, "Score 86, needs 90"]].map(([l, w, ok, note]) => <li key={l as string}><div className="flex justify-between text-sm font-medium"><span>{l as string}</span><span className="text-muted-foreground text-xs">{note as string}</span></div><div className="bg-muted mt-1.5 h-2 overflow-hidden rounded-full" aria-hidden="true"><div className={cn("h-full rounded-full", ok ? "bg-chart-2" : "bg-chart-4")} style={{ width: `${w}%` }} /></div></li>)}</ul>
      </Visual>
    ),
  },
  {
    title: "Roll back before anyone notices",
    description: "Beacon watches errors and latency after every release. Cross a threshold and it returns production to the last good build, then tells you why.",
    points: ["One-click or automatic rollback", "Alerts in Slack and email", "A full audit trail"],
    visual: (
      <Visual label="A release timeline where version 2.19.0 is rolled back to 2.18.3">
        <ol className="grid w-full max-w-sm gap-3">{[["v2.19.0", "Released 14:02", "bg-chart-4", "Rolled back at 14:03"], ["v2.18.3", "Restored 14:03", "bg-chart-2", "Serving traffic"]].map(([v, t, c, n]) => <li key={v} className="bg-card flex items-start gap-3 rounded-xl border p-4 shadow-xs"><span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", c)} aria-hidden="true" /><span><span className={cn("block text-sm font-semibold", launchMono.className)}>{v}</span><span className="text-muted-foreground block text-xs">{t}</span><span className="mt-1 flex items-center gap-1 text-xs font-medium"><Check className="size-3.5" aria-hidden="true" />{n}</span></span></li>)}</ol>
      </Visual>
    ),
  },
]

type LaunchHomeProps = React.ComponentProps<"div"> & { hrefs?: Partial<LaunchHrefs> }

/**
 * The Launch home page: every section is a Ballmac block (Hero6, LogoCloud1, Stats1, Features5, Testimonials2, Cta3).
 * Edit the copy through each block's props, reorder them, or swap one for another block in the same category.
 */
function LaunchPage({ hrefs, ...props }: LaunchHomeProps) {
  const link = { pricing: "/launch/pricing", contact: "/launch/contact", changelog: "/launch/changelog", ...hrefs }
  return (
    <LaunchShell page="home" hrefs={hrefs} {...props}>
      <main>
        <Hero6
          eyebrow="Beacon 3.2 · automatic rollbacks"
          title="Ship every branch with"
          highlight="nothing to fear."
          description="Preview URLs, performance budgets and one-click rollbacks for every pull request. Know what you are about to ship, and undo it in seconds if you were wrong."
          primaryAction={{ label: "Start for free", href: link.pricing }}
          secondaryAction={{ label: "Talk to us", href: link.contact }}
          highlights={["Free for small teams", "Connects to GitHub in a minute", "No card needed"]}
          cards={<HeroCards />}
        />
        <LogoCloud1 title="Trusted by teams who deploy on a Friday" />
        <Stats1
          eyebrow="By the numbers"
          title="Fewer incidents, faster merges."
          description="Across 9,400 teams and 3.1 million deploys last quarter."
          link={{ label: "Read the report", href: link.changelog }}
          stats={[
            { label: "Teams on Beacon", value: 9400, suffix: "+", delta: "+21%", trend: [3, 4, 5, 6, 7, 8, 8, 9, 9.4], trendLabel: "Teams, last 9 months", note: "Up from 7,800 in the spring." },
            { label: "Deploys each quarter", value: 3.1, suffix: "M", decimals: 1, delta: "+32%", trend: [1.2, 1.5, 1.7, 2, 2.2, 2.4, 2.7, 2.9, 3.1], trendLabel: "Deploys, last 9 months", note: "Roughly one every three seconds." },
            { label: "Median preview time", value: 41, suffix: " s", delta: "−12 s", trend: [70, 66, 60, 55, 52, 48, 45, 43, 41], trendLabel: "Preview time, last 9 months", note: "From push to a live URL." },
            { label: "Rollback time", value: 6, suffix: " s", trend: [30, 24, 18, 12, 10, 8, 7, 6, 6], trendLabel: "Rollback time, last 9 months", note: "From alert to the last good build." },
          ]}
        />
        <Features5 eyebrow="How it works" title="Preview it. Check it. Undo it." description="Three things every release needs, built into the same pull request." steps={steps} />
        <Testimonials2
          eyebrow="What teams say"
          items={[
            { quote: "We used to dread Fridays. Now a bad deploy rolls itself back before I finish reading the alert.", name: "Maya Chen", role: "VP Engineering", company: "Northwind", result: "−71% incident minutes" },
            { quote: "Budgets on pull requests changed how my team thinks about performance. Nobody argues about it anymore, the check just says no.", name: "Tomás Reyes", role: "Staff Engineer", company: "Parcel", result: "Bundle −38%" },
            { quote: "Design review used to mean screenshots in Slack. Now it is a link and a comment pinned to the button.", name: "Ingrid Solheim", role: "Design Director", company: "Fjord & Co", result: "Reviews 3× faster" },
          ]}
        />
        <Cta3
          title="Your next deploy, with a safety net."
          description="Connect a repository and Beacon builds your first preview in about a minute."
          command="create-beacon@latest"
          storageKey="beacon-pm"
          primaryAction={{ label: "Start for free", href: link.pricing }}
          secondaryAction={{ label: "Read the docs", href: link.changelog }}
          notes={["Works with Next.js, Remix, Astro and plain static sites", "Free forever for personal projects"]}
        />
      </main>
    </LaunchShell>
  )
}

export { LaunchPage, type LaunchHomeProps }
