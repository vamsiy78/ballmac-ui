import type { Metadata } from "next"

import { ChartsGallery, type ChartTile } from "@/components/site/charts-gallery"
import { CopyButton } from "@/components/site/copy-button"
import Link from "@/components/site/link"
import { PageCard } from "@/components/site/page-card"
import { Eyebrow } from "@/components/site/section-heading"
import { getAllItems } from "@/lib/registry"
import { thumbFor } from "@/lib/thumbs"

export const metadata: Metadata = {
  title: "Charts for shadcn that everyone can read",
  description: "Accessible Recharts charts for React and Tailwind: seven kinds, each with a table view, color-blind patterns, a written summary and every state. Free.",
  alternates: { canonical: "/charts" },
}

const FAMILIES = ["chart-area", "chart-bar", "chart-line", "chart-pie", "chart-radar", "chart-radial", "chart-scatter"] as const
const DASHBOARDS = ["charts-1", "charts-2", "charts-3", "charts-4"] as const

const points = [
  { title: "A table behind every chart", body: "One switch turns the chart into an accessible table of the same numbers, with a CSV download. People who cannot see a chart, or would rather read the figures, are not left out." },
  { title: "Never only color", body: "Patterns fill series with stripes, dots and hatching as well as color. Lines can be dashed or labeled at their ends. Change is written in words as well as shown with an arrow." },
  { title: "Written for screen readers", body: "Every chart is a named figure with a summary made from its data: first to last, highest and lowest, or a ranking. Say what it means with your own summary if you like." },
  { title: "Finished states", body: "Loading, empty and error are part of the frame, with a skeleton in the shape of the chart. Reduced motion stops the animation. Axes and labels mirror in right-to-left." },
]

export default function ChartsPage() {
  const items = getAllItems()
  const families = FAMILIES.map((id) => items.find((i) => i.name === id)).filter((i): i is NonNullable<typeof i> => !!i)
  const tiles: ChartTile[] = families.flatMap((f) => f.examples.map((e) => ({ id: e.name, title: e.title, family: f.name, familyTitle: f.title.replace(/^Chart /, "") })))
  const dashboards = DASHBOARDS.map((n) => items.find((i) => i.name === n)).filter((i): i is NonNullable<typeof i> => !!i)
  const command = "npx shadcn@latest add @ballmac/chart-area"

  return (
    <div className="mx-auto max-w-[1440px] space-y-14 px-4 py-12 sm:px-6 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Eyebrow>Charts</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Charts everyone can read.</h1>
        <p className="text-muted-foreground text-lg leading-8 text-balance">
          Area, bar, line, pie, radar, radial and scatter, built on Recharts and the shadcn chart. {tiles.length} examples that follow your theme, handle loading and errors, and work for people who cannot tell the colors apart or cannot see the chart at all.
        </p>
        <div className="bg-muted/60 flex max-w-md items-center justify-between gap-2 rounded-lg border ps-3 pe-1">
          <code className="py-2 font-mono text-[13px]" dir="ltr">
            {command}
          </code>
          <CopyButton value={command} label="Copy the install command" />
        </div>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((p) => (
          <li key={p.title} className="rounded-xl border p-4">
            <h2 className="text-sm font-semibold">{p.title}</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">{p.body}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="gallery" className="space-y-6">
        <div>
          <h2 id="gallery" className="text-2xl font-semibold tracking-tight">
            Every chart
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">Each tile is live: try the Table view, the legend and the Patterns switch. Copy the command to install that exact chart.</p>
        </div>
        <ChartsGallery tiles={tiles} families={families.map((f) => ({ id: f.name, title: f.title.replace(/^Chart /, "") }))} />
      </section>

      <section aria-labelledby="dashboards" className="space-y-6">
        <div>
          <h2 id="dashboards" className="text-2xl font-semibold tracking-tight">
            Dashboards made of them
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Whole sections with figures worked out from your data. <Link href="/blocks" className="underline-offset-4 hover:underline">See every block.</Link>
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {dashboards.map((b) => (
            <PageCard key={b.name} href={`/blocks/${b.name}`} title={b.title} description={b.description} name={b.name} Preview={null} thumb={thumbFor(b.name, b.tier)} />
          ))}
        </div>
      </section>
    </div>
  )
}
