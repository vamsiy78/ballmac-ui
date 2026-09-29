import { ArrowRight } from "lucide-react"

import { Particles } from "@/components/ballmac/particles"

export default function ParticlesDemo() {
  return (
    <div className="relative isolate flex h-[360px] w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-xl border bg-background px-6 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,color-mix(in_oklch,var(--chart-1)_18%,transparent),transparent_70%)]"
      />
      <Particles quantity={160} className="-z-10" />
      <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
        <span className="size-1.5 rounded-full bg-chart-1" aria-hidden="true" />
        Now in public beta
      </span>
      <h2 className="mt-5 max-w-md bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-4xl font-semibold tracking-tight text-balance text-transparent sm:text-5xl">
        Think in systems, not tickets.
      </h2>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        One calm workspace for plans, docs and the decisions behind them.
      </p>
      <a
        href="#"
        className="mt-6 inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-[opacity] duration-150 hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        Get early access
        <ArrowRight className="size-4" aria-hidden="true" />
      </a>
    </div>
  )
}
