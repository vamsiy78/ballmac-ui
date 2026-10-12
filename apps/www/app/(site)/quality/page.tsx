import type { Metadata } from "next"

import { Check, TriangleAlert } from "lucide-react"

import { CodePanel } from "@/components/site/code-panel"
import Link from "@/components/site/link"
import { Eyebrow } from "@/components/site/section-heading"
import { formatMeasured, measured, overview } from "@/lib/quality"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Quality, measured",
  description: "Every Ballmac UI item is loaded in a real browser in light, dark, phone width, reduced motion and right to left, and the results are published, including what failed.",
  alternates: { canonical: "/quality" },
}

const WHAT: Record<string, string> = {
  a11y: "axe-core finds no serious or critical accessibility violations, in light and dark.",
  mobile: "No sideways scrolling at 1280, 390 and 360 pixels wide.",
  motion: "With reduced motion on, nothing keeps animating.",
  rtl: "Mirrored for right-to-left languages, the layout is the reflection of the left-to-right one.",
  console: "Loading the example logs no errors to the browser console.",
  keyboard: "Pressing Tab moves through the controls and each one shows a visible change when focused.",
  states: "Loading, empty and error views exist for every item that can have them.",
  tests: "The item ships with a test you can run (informational for Pro blocks, which are tested in batches).",
  footprint: "Source size, gzipped. For information only, there is no pass mark.",
}

export default function QualityPage() {
  const o = overview()
  const rows = o.byCheck.filter((c) => c.pass + c.fail > 0)
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6">
      <header className="space-y-4">
        <Eyebrow>Quality</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Every item is measured, and the results are public</h1>
        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed text-pretty">
          Most libraries say they are accessible. We load each of the {o.items} items in a real browser and publish what happened, including the ones that failed.
          {measured.generated ? ` Last run: ${formatMeasured(measured.generated)}.` : ""}
        </p>
      </header>

      <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [String(o.items), "items measured"],
          [o.examples.toLocaleString("en-US"), "examples loaded"],
          [`${o.pageLoads.toLocaleString("en-US")}+`, "page loads, across themes, widths and directions"],
          [String(o.failing.length), o.failing.length === 1 ? "item with a failing check" : "items with a failing check"],
        ].map(([n, label]) => (
          <div key={label} className="bg-card rounded-2xl border p-4">
            <dt className="text-muted-foreground order-2 mt-1 text-sm leading-snug">{label}</dt>
            <dd className="text-3xl font-semibold tracking-tight tabular-nums">{n}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="checks-h" className="mt-14">
        <h2 id="checks-h" className="text-xl font-semibold tracking-tight">
          What is checked
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">A check that does not apply to an item (a hero has no keyboard controls) is marked not applicable and left out of its score, not counted as a pass.</p>
        <ul className="mt-6 divide-y rounded-2xl border">
          {rows.map((c) => {
            const total = c.pass + c.fail
            const pct = total ? (c.pass / total) * 100 : 0
            return (
              <li key={c.id} className="grid gap-x-6 gap-y-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
                <div>
                  <p className="font-medium">{c.label}</p>
                  <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">{WHAT[c.id]}</p>
                </div>
                <div className="self-center">
                  <p className="text-sm tabular-nums">
                    <span className="font-medium">{c.pass}</span> of {total} pass
                    {c.fail > 0 && <span className="text-destructive"> · {c.fail} did not</span>}
                  </p>
                  <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full" role="img" aria-label={`${Math.round(pct)} percent pass`}>
                    <div className={cn("h-full rounded-full", c.fail ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="failing-h" className="mt-14">
        <h2 id="failing-h" className="text-xl font-semibold tracking-tight">
          What did not pass
        </h2>
        {o.failing.length ? (
          <>
            <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">These are real defects found by the run. They are listed here until they are fixed in a new version of the item.</p>
            <ul className="mt-5 divide-y rounded-2xl border">
              {o.failing.map((f) => (
                <li key={f.name} className="flex flex-wrap items-start gap-x-4 gap-y-1 px-5 py-3.5">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/components/${f.name}`} className="font-mono text-sm font-medium underline underline-offset-4">
                      {f.name}
                    </Link>
                    <p className="text-muted-foreground mt-0.5 text-sm">{f.failed.map((c) => `${c.label}: ${c.detail}`).join(" · ")}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-3 flex items-center gap-2 leading-relaxed">
            <Check className="size-4 text-emerald-600" aria-hidden="true" />
            Nothing failed in the last run.
          </p>
        )}
      </section>

      <section aria-labelledby="limits-h" id="limits" className="mt-14 scroll-mt-24">
        <h2 id="limits-h" className="text-xl font-semibold tracking-tight">
          What these numbers do not tell you
        </h2>
        <ul className="text-muted-foreground mt-4 list-disc space-y-2 ps-5 leading-relaxed">
          <li>
            Automated tools find only a part of accessibility problems. A pass means axe and our keyboard pass found nothing, not that the item has been
            used with a screen reader. We have not done a manual screen reader pass on every item.
          </li>
          <li>The keyboard check confirms that focus moves and is visible. It does not judge whether the order makes sense.</li>
          <li>Right-to-left is scored by comparing the layout with its mirror image, which finds physical-direction mistakes but not translation or typography problems.</li>
          <li>Measured on Chromium. Other browsers can differ.</li>
          <li>The numbers describe the version shown on each page. After you edit a component they describe ours, not yours.</li>
        </ul>
      </section>

      <section aria-labelledby="own-h" className="mt-14">
        <h2 id="own-h" className="text-xl font-semibold tracking-tight">
          Hold your own app to the same bar
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
          The same engine is in the command line tool and the MCP server, so you or your AI agent can check the app you build with these components.{" "}
          <Link href="/docs/check" className="text-foreground underline underline-offset-4">
            Read how it works
          </Link>
          .
        </p>
        <div className="mt-5 space-y-3">
          <CodePanel lang="bash" code={"npx @ballmac/cli check"} />
          <CodePanel lang="bash" title="Run the measurement yourself" code={"pnpm quality --filter button,dialog"} />
        </div>
      </section>
    </div>
  )
}
