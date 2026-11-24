import { ArrowUpRight } from "lucide-react"

import { FitPreview } from "@/components/site/fit-preview"
import { LazyExample } from "@/components/site/lazy-example"
import { LazyMount } from "@/components/site/lazy-mount"
import Link from "@/components/site/link"
import { cn } from "@/lib/utils"

export type LiveTile = {
  /** The component's page, /components/<name>. */
  name: string
  /** Its demo, rendered live. */
  example: string
  title: string
  /** A dark stage: the demo renders in dark mode inside it whatever the site's mode. */
  dark?: boolean
  /** The design box the demo is laid out in before it is scaled to fit the tile. */
  width?: number
  height?: number
}

/** The tile rhythm, same as the screens grid: small, wide, tall; wide, small; wide, big; wide. */
const SPANS = ["lg:col-span-1", "lg:col-span-2", "lg:col-span-1 lg:row-span-2", "lg:col-span-2", "lg:col-span-1", "lg:col-span-2", "lg:col-span-2 lg:row-span-2", "lg:col-span-2"]

/**
 * Real components running in the page, not pictures of them: each tile mounts its demo when it comes near the window and you can use it
 * right there. The name under each tile goes to the component's own page. Demos follow reduced motion as they do everywhere.
 */
export function LiveBento({ tiles }: { tiles: LiveTile[] }) {
  return (
    <ul className="grid auto-rows-[15.5rem] grid-cols-1 gap-3 sm:grid-cols-2 lg:auto-rows-[18rem] lg:grid-cols-4">
      {tiles.slice(0, 8).map((t, i) => (
        <li key={t.name} className={cn("bm-reveal group bg-frame min-w-0 flex-col rounded-[1.75rem] p-2.5", i < 4 ? "flex" : "hidden sm:flex", SPANS[i], i === 2 || i === 6 ? "sm:row-span-2" : "")}>
          <div className={cn("relative min-h-0 flex-1 overflow-hidden rounded-[1.25rem] ring-1", t.dark ? "dark bg-[oklch(0.17_0_0)] text-foreground ring-white/[0.06]" : "bm-stage ring-black/[0.05] dark:ring-white/[0.06]")}>
            <LazyMount className="absolute inset-0">
              <FitPreview width={t.width ?? 560} height={t.height ?? 400} inset={0.06}>
                <LazyExample name={t.example} />
              </FitPreview>
            </LazyMount>
          </div>
          <div className="flex items-center justify-between gap-3 px-2 pt-2.5 pb-1">
            <Link href={`/components/${t.name}`} className="focus-visible:ring-ring/50 min-w-0 truncate rounded-sm text-[15px] font-medium tracking-[-0.01em] outline-none hover:underline hover:underline-offset-4 focus-visible:ring-[3px]">
              {t.title}
            </Link>
            <Link href={`/components/${t.name}`} tabIndex={-1} aria-hidden="true" className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 font-mono text-xs">
              {t.name}
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </li>
      ))}
    </ul>
  )
}
