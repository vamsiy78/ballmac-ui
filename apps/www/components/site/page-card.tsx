import Image from "next/image"

import Link from "@/components/site/link"

import { PageThumb } from "@/components/site/page-thumb"
import { ProBadge } from "@/components/site/pro-notice"

/** A page-sized thumbnail (block or template) in a quiet window frame, with its name and description below. */
export function PageCard({
  href,
  title,
  description,
  name,
  Preview,
  frame,
  thumb,
  tall = false,
  priority = false,
  pro = false,
  isNew = false,
  short = false,
  height = 300,
}: {
  href: string
  title: string
  description: string
  name: string
  Preview: React.ComponentType | null
  /** A /preview/<name> address. Shown in a lazy iframe instead of `Preview` (used for Pro items, which render on the server). */
  frame?: string
  /** A captured thumbnail (see `pnpm thumbs`), as a path without mode and extension. Used instead of a live preview. */
  thumb?: string
  /** Templates are captured taller than blocks. */
  tall?: boolean
  /** Load the thumbnail at once (for cards visible without scrolling) instead of lazily. */
  priority?: boolean
  /** Show the Pro label. */
  pro?: boolean
  /** Show the New label (added or changed in the newest release). */
  isNew?: boolean
  /** A short window, for blocks that are only a strip of the page (a header), so the card is not mostly empty. */
  short?: boolean
  height?: number
}) {
  return (
    <div className="group bg-frame relative rounded-[1.75rem] p-2.5 transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)] motion-reduce:transition-none">
      <div className="bg-background overflow-hidden rounded-[1.25rem] ring-1 ring-black/[0.05] dark:ring-white/[0.06]">
        {thumb ? (
          // Both pictures are in the page; the one that does not match the colour scheme is display:none, so the browser never downloads it.
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: tall ? "1280 / 840" : short ? "1280 / 300" : "1280 / 640" }}>
            {(["light", "dark"] as const).map((mode) => (
              <Image
                key={mode}
                src={`${thumb}.${mode}.webp`}
                alt={`${title} preview`}
                width={800}
                height={tall ? 525 : short ? 188 : 400}
                unoptimized
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={`absolute inset-0 size-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${mode === "light" ? "dark:hidden" : "hidden dark:block"}`}
              />
            ))}
          </div>
        ) : (
          <PageThumb height={short ? 150 : height} title={`${title} preview`} frame={frame}>
            {Preview ? <Preview /> : null}
          </PageThumb>
        )}
      </div>
      <div className="px-2 pt-2.5 pb-1">
        <div className="flex items-center justify-between gap-3">
          <Link href={href} className="min-w-0 truncate text-[15px] font-medium tracking-[-0.01em] outline-none after:absolute after:inset-0 after:rounded-[1.75rem] focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50">
            {title}
          </Link>
          <span className="flex shrink-0 items-center gap-2">
            <span className="text-muted-foreground hidden font-mono text-xs sm:inline">{name}</span>
            {pro && <ProBadge />}
            {isNew && !pro && <span className="text-[12px] font-medium text-[oklch(0.56_0.22_258)] dark:text-[oklch(0.72_0.16_250)]">New</span>}
          </span>
        </div>
        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-[13px] leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
