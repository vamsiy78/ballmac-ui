import { ArrowRight } from "lucide-react"

import { PageCard } from "@/components/site/page-card"
import { thumbFor } from "@/lib/thumbs"
import { isPro } from "@/lib/registry"

type Block = { name: string; title: string; description: string; tier?: string }

/**
 * The "3D and motion" collection: a short strip of scenes drawn by shaders, on a canvas or in CSS 3D, with a link to the whole collection in the
 * blocks gallery. Used on the blocks page and the Pro page.
 */
export function MotionStrip({ picks, total, className }: { picks: Block[]; total: number; className?: string }) {
  if (picks.length === 0) return null
  return (
    <section aria-labelledby="motion-h" className={className}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="motion-h" className="text-2xl font-semibold tracking-[-0.03em]">3D &amp; motion</h2>
          <p className="text-muted-foreground mt-1.5 max-w-xl text-[15px] leading-relaxed">
            {total} scenes drawn on the GPU, on a canvas or in CSS 3D: a glass crystal, a meadow of flowers, jellyfish, a black hole. Each pauses, stops under reduced motion and comes with a build prompt.
          </p>
        </div>
        {/* A plain link: on the blocks page the gallery reads its filters from the address after a full load, which a client navigation would not trigger. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/blocks?motion=1" className="text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px]">
          See all {total}
          <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
        </a>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {picks.map((b) => (
          <PageCard key={b.name} href={`/blocks/${b.name}`} title={b.title} description={b.description} name={b.name} Preview={null} thumb={thumbFor(b.name, b.tier ?? "free")} pro={isPro(b as never)} priority={false} />
        ))}
      </div>
    </section>
  )
}
