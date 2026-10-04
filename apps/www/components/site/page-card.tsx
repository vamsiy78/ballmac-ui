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
  height?: number
}) {
  return (
    <div className="group relative">
      <div className="bg-background overflow-hidden rounded-xl border transition-[border-color,box-shadow] duration-200 group-hover:border-foreground/20 group-hover:shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)]">
        <div className="bg-muted/50 flex h-7 items-center gap-1.5 border-b px-3" aria-hidden="true">
          <span className="bg-foreground/15 size-2 rounded-full" />
          <span className="bg-foreground/15 size-2 rounded-full" />
          <span className="bg-foreground/15 size-2 rounded-full" />
        </div>
        {thumb ? (
          // Both pictures are in the page; the one that does not match the colour scheme is display:none, so the browser never downloads it.
          <div className="bg-muted/30 relative w-full overflow-hidden" style={{ aspectRatio: tall ? "1280 / 840" : "1280 / 640" }}>
            {(["light", "dark"] as const).map((mode) => (
              <Image
                key={mode}
                src={`${thumb}.${mode}.webp`}
                alt={`${title} preview`}
                width={800}
                height={tall ? 525 : 400}
                unoptimized
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={mode === "light" ? "absolute inset-0 size-full object-cover object-top dark:hidden" : "absolute inset-0 hidden size-full object-cover object-top dark:block"}
              />
            ))}
          </div>
        ) : (
          <PageThumb height={height} title={`${title} preview`} frame={frame}>
            {Preview ? <Preview /> : null}
          </PageThumb>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <Link href={href} className="font-medium outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50">
          {title}
        </Link>
        {pro && <ProBadge className="ms-2 align-middle" />}
        <span className="text-muted-foreground hidden font-mono text-xs sm:inline">@ballmac/{name}</span>
      </div>
      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
