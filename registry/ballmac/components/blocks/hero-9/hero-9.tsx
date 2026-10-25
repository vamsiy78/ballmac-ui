// Ballmac UI: Hero 9. https://ui.ballmac.com/blocks/hero-9
import * as React from "react"
import { ArrowRight } from "lucide-react"

import { ParticleTree } from "@/components/ballmac/particle-tree"
import { buttonVariants } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"

type Action = { label: string; href: string }

type Hero9Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** A short label above the headline. */
  eyebrow?: string
  title?: string
  description?: string
  primaryAction?: Action
  secondaryAction?: Action
  /** A line under the buttons, for example a license or a promise. */
  note?: string
  /** Changes the shape of the tree behind the text. */
  seed?: number
}

/**
 * A hero for products that want a calm, memorable picture: a tree of points grows from the bottom of the section and the message sits above it. It needs no photo,
 * follows the theme (it looks best on dark), and the tree is decoration that stays still under reduced motion.
 */
function Hero9({
  eyebrow = "Now in public beta",
  title = "Software that grows with you",
  description = "A calm workspace for plans, decisions and the agents that help carry them out.",
  primaryAction = { label: "Get started", href: "#" },
  secondaryAction = { label: "Read the docs", href: "#" },
  note = "Free for small teams. No card needed.",
  seed = 7,
  className,
  ...props
}: Hero9Props) {
  const id = React.useId()
  return (
    <section data-slot="hero-9" aria-labelledby={`${id}-title`} className={cn("bg-background text-foreground relative isolate flex min-h-[800px] w-full flex-col items-center overflow-hidden px-4 pt-20 pb-72 text-center sm:px-6 sm:pt-24", className)} {...props}>
      <ParticleTree className="-z-10" seed={seed} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-2/3 bg-gradient-to-b from-background via-background/80 to-transparent" />
      {eyebrow && (
        <p className="text-muted-foreground inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur">
          <span className="bg-chart-1 size-1.5 rounded-full" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h1 id={`${id}-title`} className="mt-6 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-6xl">{title}</h1>
      <p className="text-muted-foreground mt-5 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">{description}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a href={primaryAction.href} className={buttonVariants({ shape: "pill", size: "lg" })}>
          {primaryAction.label}
          <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
        </a>
        <a href={secondaryAction.href} className={buttonVariants({ shape: "pill", size: "lg", variant: "outline" })}>{secondaryAction.label}</a>
      </div>
      {note && <p className="text-muted-foreground mt-4 text-sm">{note}</p>}
    </section>
  )
}

export { Hero9, type Hero9Props }
