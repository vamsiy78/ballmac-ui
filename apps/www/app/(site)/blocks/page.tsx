import type { Metadata } from "next"
import Link from "@/components/site/link"

import { JsonLd } from "@/components/site/json-ld"
import { collection } from "@/lib/schema"
import { BlocksBrowser } from "@/components/site/blocks-browser"
import { PageCard } from "@/components/site/page-card"
import { MotionStrip } from "@/components/site/motion-strip"
import { ProCallout } from "@/components/site/pro-callout"
import { loadThumb } from "@/lib/examples"
import { isMotionBlock } from "@/lib/blocks-filter"
import { motionCollection } from "@/lib/motion-collection"
import { thumbFor } from "@/lib/thumbs"
import { blockCategoryLabels, blockGroups, getBlocks, isNew } from "@/lib/registry"

export const metadata: Metadata = {
  title: "React page blocks for shadcn and Tailwind",
  description: "Responsive page sections for React and Tailwind: heroes, features, pricing, FAQ, footers, auth and AI chat. Install any block with one command.",
  alternates: { canonical: "/blocks" },
}

/** Six blocks that show the range, in the order a visitor should meet them. They must be free, so the gallery looks the same with or without the Pro source. */
const START_HERE = [
  { name: "hero-4", label: "Landing pages" },
  { name: "dashboard-1", label: "Dashboards" },
  { name: "mail-1", label: "Inbox" },
  { name: "kanban-1", label: "Planning" },
  { name: "calendar-1", label: "Scheduling" },
  { name: "billing-2", label: "Billing" },
] as const

export default async function BlocksPage() {
  const all = await Promise.all(
    getBlocks().map(async (b) => {
      const example = b.examples[0]?.name
      const thumb = thumbFor(b.name, b.tier)
      if (thumb) return { ...b, Preview: null, frame: undefined, thumb }
      // Pro previews render on the server; in a gallery they go in lazy iframes so their markup is not part of this page.
      return { ...b, Preview: example && b.tier !== "pro" ? await loadThumb(example) : null, frame: example && b.tier === "pro" ? `/preview/${example}` : undefined, thumb: undefined as string | undefined }
    })
  )
  const blocks = all
  const free = blocks.filter((b) => b.tier !== "pro").length
  const pro = blocks.length - free
  const groups = blockGroups
    .map((g) => ({
      ...g,
      sections: g.categories
        .map((c) => ({ id: c, label: blockCategoryLabels[c] ?? c, items: blocks.filter((b) => b.blockCategory === c) }))
        .filter((s) => s.items.length > 0),
    }))
    .filter((g) => g.sections.length > 0)

  const groupLabel = new Map<string, string>(groups.flatMap((g) => g.sections.map((s) => [s.id, `${g.label} ${s.label}`] as [string, string])))
  const cards: Record<string, React.ReactNode> = {}
  for (const g of groups)
    for (const s of g.sections)
      for (const b of s.items) {
        cards[b.name] = (
          <PageCard
            key={b.name}
            href={`/blocks/${b.name}`}
            title={b.title}
            description={b.description}
            name={b.name}
            pro={b.tier === "pro"}
            isNew={isNew(b)}
            short={b.blockCategory === "header"}
            Preview={b.Preview}
            frame={b.frame}
            thumb={b.thumb}
            priority={false}
          />
        )
      }

  const motionSet = motionCollection(blocks)
  const featured = START_HERE.map((f) => ({ ...f, block: blocks.find((b) => b.name === f.name) })).filter((f) => f.block)

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:py-16">
      <JsonLd graph={collection({ name: "React page blocks", description: String(metadata.description), path: "/blocks", items: blocks.filter((b) => b.tier !== "pro").map((b) => ({ name: b.title, path: `/blocks/${b.name}` })) })} />
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Blocks for real pages</h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">
          {free} free blocks and {pro} in Pro, from landing pages to dashboards, agents and desktop apps. Preview them at any width, then install one into{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">components/ballmac/blocks</code>.
        </p>
      </header>
      <BlocksBrowser
        groups={groups.map((g) => ({ id: g.id, label: g.label, description: g.description, sections: g.sections.map((s) => ({ id: s.id, label: s.label, items: s.items.map((b) => b.name) })) }))}
        items={blocks.map((b) => ({ name: b.name, pro: b.tier === "pro", isNew: isNew(b), motion: isMotionBlock(b.tags), text: `${b.title} ${b.name} ${b.description} ${groupLabel.get(b.blockCategory ?? "") ?? ""} ${b.tags?.join(" ") ?? ""}`.toLowerCase() }))}
        cards={cards}
        featured={
          <section aria-labelledby="start-here" className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="start-here" className="text-2xl font-semibold tracking-[-0.03em]">
                  Start with these
                </h2>
                <p className="text-muted-foreground mt-1.5 text-[15px]">Six blocks that show the range. All free.</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {featured.map(({ name, label, block }, i) => (
                <div key={name}>
                  <p className="text-muted-foreground mb-2 text-xs font-medium">{label}</p>
                  <PageCard href={`/blocks/${name}`} title={block!.title} description={block!.description} name={name} Preview={block!.Preview} thumb={block!.thumb} frame={block!.frame} priority={i < 3} />
                </div>
              ))}
            </div>
            <MotionStrip className="mt-16" picks={motionSet.picks} total={motionSet.all.length} />
          </section>
        }
        interlude={<ProCallout where="blocks" className="mx-auto mt-20 max-w-4xl" />}
      />
      <p className="text-muted-foreground mt-20 text-center text-sm">
        Want the whole page? Start from a{" "}
        <Link href="/templates" className="text-foreground underline underline-offset-4">
          template
        </Link>
        .
      </p>
    </div>
  )
}
