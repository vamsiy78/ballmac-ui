// Ballmac UI: Hero 4. https://ui.ballmac.com/blocks/hero-4
import * as React from "react"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { Globe, type GlobeMarker } from "@/components/ballmac/globe"
import { cn } from "@/lib/utils"
import { Media, type MediaSource } from "@/components/ballmac/media"

type Action = { label: string; href: string }

type Hero4Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Short line in the pill above the heading. */
  announcement?: string
  /** The heading. */
  title?: React.ReactNode
  /** One or two sentences under the heading. */
  description?: string
  /** Main call to action. */
  primaryAction?: Action
  /** Secondary call to action. */
  secondaryAction?: Action
  /** Headline numbers under the actions. */
  stats?: { value: string; label: string }[]
  /** Points on the globe, such as your regions or offices. */
  markers?: GlobeMarker[]
  /** Your own image instead of the globe. An image URL (give it mediaAlt), an object with alt text and a dark-mode file, or your own element. */
  media?: MediaSource
  /** Describes `media` when it is a plain URL. */
  mediaAlt?: string
}

const defaultMarkers: GlobeMarker[] = [
  { location: [37.77, -122.42], size: 0.06 },
  { location: [40.71, -74.01], size: 0.07 },
  { location: [-23.55, -46.63], size: 0.06 },
  { location: [51.51, -0.13], size: 0.07 },
  { location: [50.11, 8.68], size: 0.05 },
  { location: [19.08, 72.88], size: 0.06 },
  { location: [1.35, 103.82], size: 0.06 },
  { location: [35.68, 139.69], size: 0.07 },
  { location: [-33.87, 151.21], size: 0.05 },
]

function Hero4({
  announcement = "Now in 35 regions",
  title = "Your app, close to every user.",
  description = "Deploy once and run at the edge on every continent, with no configuration and no cold starts.",
  primaryAction = { label: "Start deploying", href: "#" },
  secondaryAction = { label: "See the network", href: "#" },
  stats = [
    { value: "35", label: "regions" },
    { value: "38 ms", label: "median latency" },
    { value: "99.99%", label: "uptime" },
  ],
  markers = defaultMarkers,
  media,
  mediaAlt,
  className,
  ...props
}: Hero4Props) {
  return (
    <section data-slot="hero-4" className={cn("relative isolate overflow-hidden", className)} {...props}>
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 px-4 pt-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div className="relative z-10 py-4 lg:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inset-0 animate-ping rounded-full bg-chart-2 opacity-60 motion-reduce:animate-none" />
              <span className="relative size-2 rounded-full bg-chart-2" />
            </span>
            {announcement}
          </span>
          <h1 className="mt-6 text-4xl leading-[1.04] font-semibold tracking-[-0.045em] text-balance sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-pretty text-muted-foreground">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={primaryAction.href} className={buttonVariants({ size: "lg", shape: "pill" })}>
              {primaryAction.label} <ArrowRight  className="rtl:rotate-180"/>
            </a>
            <a href={secondaryAction.href} className={buttonVariants({ size: "lg", shape: "pill", variant: "outline" })}>
              {secondaryAction.label}
            </a>
          </div>
          {stats.length > 0 && (
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t pt-6">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse gap-1">
                  <dt className="text-sm text-muted-foreground">{s.label}</dt>
                  <dd className="text-2xl font-semibold tracking-tight tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <Media media={media} alt={mediaAlt} aspect="square" priority fallback={
        <div className="relative -mx-4 aspect-square sm:mx-auto sm:w-full sm:max-w-[560px] lg:-me-24 lg:max-w-none">
          <div aria-hidden="true" className="absolute inset-[12%] -z-10 rounded-full bg-chart-1/20 blur-3xl" />
          <Globe markers={markers} label={`Globe with ${markers.length} highlighted regions`} className="size-full" />
        </div>
        } />
      </div>
    </section>
  )
}

export { Hero4, type Hero4Props }
