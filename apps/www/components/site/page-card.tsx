import Link from "next/link"

import { LazyMount } from "@/components/site/lazy-mount"
import { ProBadge } from "@/components/site/pro-notice"
import { ScaledPreview } from "@/components/site/scaled-preview"

/** A page-sized thumbnail (block or template) in a quiet window frame, with its name and description below. */
export function PageCard({
  href,
  title,
  description,
  name,
  Preview,
  pro = false,
  height = 300,
  scale = 0.46,
}: {
  href: string
  title: string
  description: string
  name: string
  Preview: React.ComponentType | null
  /** Show the Pro label. */
  pro?: boolean
  height?: number
  scale?: number
}) {
  return (
    <div className="group relative">
      <div className="bg-background overflow-hidden rounded-xl border transition-[border-color,box-shadow] duration-200 group-hover:border-foreground/20 group-hover:shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)]">
        <div className="bg-muted/50 flex h-7 items-center gap-1.5 border-b px-3" aria-hidden="true">
          <span className="bg-foreground/15 size-2 rounded-full" />
          <span className="bg-foreground/15 size-2 rounded-full" />
          <span className="bg-foreground/15 size-2 rounded-full" />
        </div>
        <LazyMount className="relative" style={{ height }} rootMargin="400px">
          <ScaledPreview scale={scale} height={height} width={1280}>
            {Preview ? <Preview /> : null}
          </ScaledPreview>
        </LazyMount>
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
