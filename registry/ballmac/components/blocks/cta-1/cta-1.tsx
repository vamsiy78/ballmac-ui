// Ballmac UI: CTA 1. https://ui.ballmac.com/blocks/cta-1
import * as React from "react"
import { ArrowRight } from "lucide-react"

import { AnimatedGrid } from "@/components/ballmac/animated-grid"
import { buttonVariants } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"

type Cta1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** The heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** Main call to action. */
  primaryAction?: { label: string; href: string }
  /** Secondary call to action. */
  secondaryAction?: { label: string; href: string }
}

function Cta1({
  title = "Ready when you are.",
  description = "Set up your first project in under a minute. No credit card required.",
  primaryAction = { label: "Get started", href: "#" },
  secondaryAction = { label: "Talk to sales", href: "#" },
  className,
  ...props
}: Cta1Props) {
  return (
    <section data-slot="cta-1" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6", className)} {...props}>
      <div className="relative isolate overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center sm:px-12 md:py-24">
        <AnimatedGrid className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,#000_20%,transparent_75%)]" />
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a className={buttonVariants({ size: "lg", shape: "pill" })} href={primaryAction.href}>
            {primaryAction.label} <ArrowRight />
          </a>
          <a className={buttonVariants({ variant: "outline", size: "lg", shape: "pill" })} href={secondaryAction.href}>{secondaryAction.label}</a>
        </div>
      </div>
    </section>
  )
}

export { Cta1, type Cta1Props }
