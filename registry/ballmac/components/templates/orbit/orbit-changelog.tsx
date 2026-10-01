// Ballmac UI: Orbit changelog page. https://ui.ballmac.com/templates/template-orbit
import * as React from "react"
import { Rss } from "lucide-react"

import { ChangelogFeed, type ChangelogEntry } from "@/components/ballmac/changelog-feed"
import { OrbitShell, type OrbitHrefs } from "@/components/ballmac/templates/orbit/orbit-theme"

const entries: ChangelogEntry[] = [
  {
    id: "2-4",
    version: "2.4",
    date: "2026-09-24",
    title: "Computer use is generally available",
    summary: "Agents can now see a screen, click, type and extract data from any web app, inside a sandboxed browser you control.",
    changes: [
      { type: "new", text: "Browser tool with screenshots, DOM snapshots and a full action trace." },
      { type: "new", text: "Session recording: replay what the agent saw, frame by frame." },
      { type: "improved", text: "Approvals can now be routed to Slack channels by risk level." },
      { type: "fixed", text: "Long-running runs no longer lose their cost counter after a deploy." },
    ],
  },
  {
    id: "2-3",
    version: "2.3",
    date: "2026-08-27",
    title: "Evals as GitHub checks",
    summary: "Every pull request can now run your eval suite and block the merge when success rate drops.",
    changes: [
      { type: "new", text: "GitHub app with per-case results and a diff against main." },
      { type: "new", text: "Model comparison view: run one dataset against three models." },
      { type: "improved", text: "LLM graders accept a rubric and return a rationale you can edit." },
      { type: "removed", text: "The v1 evaluation endpoints, deprecated in March." },
    ],
  },
  {
    id: "2-2",
    version: "2.2",
    date: "2026-07-30",
    title: "Bring your own cloud",
    summary: "Run the data plane in your VPC. Prompts, tool data and secrets never leave your network.",
    changes: [
      { type: "new", text: "Terraform module for AWS, GCP and Azure." },
      { type: "improved", text: "Traces load 3x faster for runs over 500 spans." },
      { type: "fixed", text: "Tool retries respected the wrong backoff when the API returned Retry-After." },
    ],
  },
  {
    id: "2-1",
    version: "2.1",
    date: "2026-06-26",
    title: "Branch any trace",
    changes: [
      { type: "new", text: "Branch a run from any step, edit the input and compare outcomes." },
      { type: "improved", text: "SDK streams partial tool results to your UI." },
      { type: "fixed", text: "Python SDK now cancels in-flight tool calls on Ctrl+C." },
    ],
  },
]

type OrbitChangelogProps = React.ComponentProps<"div"> & { hrefs?: Partial<OrbitHrefs> }

/** Orbit changelog: a filterable release feed under a calm header. */
function OrbitChangelog({ hrefs, ...props }: OrbitChangelogProps) {
  return (
    <OrbitShell page="changelog" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-3xl px-4 pt-16 pb-24 sm:px-6 sm:pt-24">
        <p className="text-chart-1 text-sm font-medium" style={{ fontFamily: "var(--orbit-mono)" }}>Changelog</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">What we shipped.</h1>
          <a href="#" className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-lg text-sm outline-none focus-visible:ring-[3px]">
            <Rss className="size-4" aria-hidden="true" /> RSS
          </a>
        </div>
        <p className="text-muted-foreground mt-5 max-w-xl text-lg text-pretty">New releases land every month. Breaking changes are announced 90 days ahead.</p>
        <ChangelogFeed className="mt-12" entries={entries} filterable />
      </main>
    </OrbitShell>
  )
}

export { OrbitChangelog, type OrbitChangelogProps }
