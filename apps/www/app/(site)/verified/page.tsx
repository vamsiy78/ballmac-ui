import type { Metadata } from "next"

import { CodePanel } from "@/components/site/code-panel"
import Link from "@/components/site/link"
import { Eyebrow } from "@/components/site/section-heading"
import { formatMeasured } from "@/lib/quality"
import { leaderboard, own } from "@/lib/verified"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Ballmac Verified",
  description: "An open score for any shadcn registry: accessibility, theme tokens, dependencies, states, motion and right-to-left support, with a badge, a leaderboard and a GitHub Action you can run on your own.",
  alternates: { canonical: "/verified" },
}

const GRADE_TONE: Record<string, string> = {
  A: "bg-emerald-600 text-white",
  B: "bg-lime-700 text-white",
  C: "bg-amber-700 text-white",
  D: "bg-orange-700 text-white",
  F: "bg-red-700 text-white",
}

const BADGE_MD = "[![Ballmac Verified](https://ui.ballmac.com/verified/ballmac.svg)](https://ui.ballmac.com/verified)"

const ACTION = `name: Ballmac Verified
on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Build your registry first so each item's JSON sits next to registry.json.
      - run: npm ci && npm run registry:build
      - uses: vamsiy78/ballmac-ui/actions/verify@main
        with:
          registry: ./public/r/registry.json
          min-score: 80
          badge: public/verified.svg`

export default function VerifiedPage() {
  const rows = leaderboard()
  const weakest = own.weakest.slice(0, 5)
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6">
      <header className="space-y-4">
        <Eyebrow>Ballmac Verified</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">An open score for any shadcn registry</h1>
        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed text-pretty">
          One command reads a registry&rsquo;s source and scores it on the things users run into: accessibility, theme tokens, declared dependencies, loading and error states, motion and right-to-left support. The
          code is open, the checks are listed below, and our own registry is scored the same way.
        </p>
      </header>

      <section aria-labelledby="own-h" className="mt-10">
        <h2 id="own-h" className="sr-only">
          Ballmac UI&rsquo;s score
        </h2>
        <div className="bg-card flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl border p-6">
          <div className="flex items-center gap-4">
            <span className={cn("flex size-16 items-center justify-center rounded-2xl text-3xl font-semibold", GRADE_TONE[own.grade])} aria-hidden="true">
              {own.grade}
            </span>
            <div>
              <p className="text-4xl font-semibold tracking-tight tabular-nums">
                {own.score}
                <span className="text-muted-foreground text-xl font-normal"> / 100</span>
              </p>
              <p className="text-muted-foreground text-sm">Ballmac UI, grade {own.grade}</p>
            </div>
          </div>
          <p className="text-muted-foreground min-w-[14rem] flex-1 text-sm leading-relaxed">
            {own.items.scored} components, blocks, hooks and libraries scored from <code className="text-foreground font-mono text-[13px]">{own.registry.source.replace("https://", "")}</code>. Last run {formatMeasured(own.generated)}.{" "}
            <a href="/verified/ballmac.json" className="text-foreground underline underline-offset-4">
              Read the scorecard
            </a>
            .
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/verified/ballmac.svg" alt={`Ballmac Verified: ${own.score} out of 100, grade ${own.grade}`} width={182} height={22} className="h-[22px] w-auto" />
        </div>
      </section>

      <section aria-labelledby="checks-h" className="mt-14">
        <h2 id="checks-h" className="text-xl font-semibold tracking-tight">
          What is checked
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
          Each check is scored across the items it applies to. A check that does not apply to an item (a hook has no colors) is left out of its score, not counted as a pass. The score is the weighted average, so
          accessibility counts most.
        </p>
        <ul className="mt-6 divide-y rounded-2xl border">
          {own.checks.map((k) => {
            const total = k.pass + k.fail
            return (
              <li key={k.id} className="grid gap-x-6 gap-y-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
                <div>
                  <p className="font-medium">
                    {k.label} <span className="text-muted-foreground text-sm font-normal">· weight {k.weight}</span>
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">{k.what}</p>
                </div>
                <div className="self-center">
                  <p className="text-sm tabular-nums">
                    <span className="font-medium">{k.pass}</span> of {total} pass
                    {k.fail > 0 && <span className="text-destructive"> · {k.fail} did not</span>}
                  </p>
                  <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full" role="img" aria-label={`${Math.round(k.pct)} percent pass`}>
                    <div className={cn("h-full rounded-full", k.fail ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${k.pct}%` }} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        {weakest.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium">Where we lose points</h3>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
              The five lowest-scoring items in our own registry. Some are judgment calls by the rules (a scrim that is meant to be black), and we leave them visible instead of tuning the score.
            </p>
            <ul className="mt-3 divide-y rounded-2xl border">
              {weakest.map((r) => (
                <li key={r.name} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-3">
                  <Link href={`/components/${r.name}`} className="font-mono text-sm font-medium underline underline-offset-4">
                    {r.name}
                  </Link>
                  <span className="text-muted-foreground text-sm tabular-nums">{r.score}</span>
                  <span className="text-muted-foreground min-w-0 flex-1 text-sm">{r.problems[0]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="board-h" className="mt-14">
        <h2 id="board-h" className="text-xl font-semibold tracking-tight">
          Leaderboard
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
          Registries that have published a scorecard, highest first. Every row links to the address the score was run on, so you can run the command and get the same number. A score is a snapshot of that registry on that day, and
          only registries that choose to submit appear here.
        </p>
        <div role="region" aria-label="Leaderboard" tabIndex={0} className="focus-visible:ring-ring/50 mt-5 overflow-x-auto rounded-2xl border outline-none focus-visible:ring-[3px]">
          <table className="w-full min-w-[34rem] text-sm">
            <thead className="bg-card">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-start font-medium">#</th>
                <th scope="col" className="px-4 py-2.5 text-start font-medium">Registry</th>
                <th scope="col" className="px-4 py-2.5 text-end font-medium">Score</th>
                <th scope="col" className="px-4 py-2.5 text-end font-medium">Grade</th>
                <th scope="col" className="px-4 py-2.5 text-end font-medium">Items</th>
                <th scope="col" className="px-4 py-2.5 text-end font-medium">Run</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r, i) => (
                <tr key={r.source}>
                  <td className="text-muted-foreground px-4 py-2.5 tabular-nums">{i + 1}</td>
                  <th scope="row" className="px-4 py-2.5 text-start font-normal">
                    <a href={r.homepage ?? r.source} className="font-medium underline underline-offset-4">
                      {r.name}
                    </a>
                    {r.own && <span className="text-muted-foreground"> · ours</span>}
                  </th>
                  <td className="px-4 py-2.5 text-end tabular-nums">{r.score}</td>
                  <td className="px-4 py-2.5 text-end font-medium">{r.grade}</td>
                  <td className="px-4 py-2.5 text-end tabular-nums">{r.scored}</td>
                  <td className="px-4 py-2.5 text-end">
                    <time dateTime={r.generated.slice(0, 10)}>{formatMeasured(r.generated)}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Want to be listed? Run the command below, then open a pull request that adds your scorecard to{" "}
          <a href="https://github.com/vamsiy78/ballmac-ui/tree/main/apps/www/content/verified/submissions" className="text-foreground underline underline-offset-4">
            content/verified/submissions
          </a>
          . We re-run it on your registry before merging.
        </p>
      </section>

      <section aria-labelledby="run-h" className="mt-14">
        <h2 id="run-h" className="text-xl font-semibold tracking-tight">
          Run it on your registry
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
          Point it at a URL, a folder or a <code className="font-mono text-[13px]">registry.json</code>. It reads the registry and writes nothing to it, and needs TypeScript in the folder you run it from.
        </p>
        <div className="mt-5 space-y-3">
          <CodePanel lang="bash" code={"npx @ballmac/cli verify https://acme.com --badge verified.svg --out scorecard.json"} />
          <CodePanel lang="bash" title="Local registry, failing under 80" code={"npx @ballmac/cli verify ./public/r/registry.json --min-score 80"} />
          <CodePanel lang="bash" title=".github/workflows/verified.yml" code={ACTION} />
          <CodePanel lang="bash" title="README.md" code={BADGE_MD} maxHeight={false} />
        </div>
        <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-relaxed">
          The full guide, with every flag and how to read a failing item, is in{" "}
          <Link href="/docs/guides/verify-your-registry" className="text-foreground underline underline-offset-4">
            Verify your registry
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="limits-h" id="limits" className="mt-14 scroll-mt-24">
        <h2 id="limits-h" className="text-xl font-semibold tracking-tight">
          What this score does not tell you
        </h2>
        <ul className="text-muted-foreground mt-4 list-disc space-y-2 ps-5 leading-relaxed">
          <li>It reads source. It does not load anything in a browser, so it cannot see contrast, focus order, phone width or a broken layout. For those, see how we measure <Link href="/quality" className="text-foreground underline underline-offset-4">every item in a real browser</Link>, or run <code className="font-mono text-[13px]">ballmac check --url</code> on your app.</li>
          <li>Static rules make judgment calls and can be wrong in both directions. A flagged item is a place to look, not proof of a defect, and you can silence a finding with a reason.</li>
          <li>It is not a certification and not an audit. Nobody at Ballmac reviews a registry before it is scored.</li>
          <li>The weights are our choice. They are listed above and in the open source, and you can read the per-check numbers instead of the single score.</li>
        </ul>
      </section>
    </div>
  )
}
