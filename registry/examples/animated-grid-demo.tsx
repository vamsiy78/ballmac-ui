import { AnimatedGrid } from "@/components/ballmac/animated-grid"

export default function AnimatedGridDemo() {
  return (
    <div className="relative flex h-72 w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-xl border bg-background px-6 text-center">
      <AnimatedGrid />
      <span className="relative font-mono text-xs tracking-widest text-muted-foreground uppercase">Observability</span>
      <h2 className="relative mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Every request, measured.
      </h2>
      <p className="relative mt-2 max-w-sm text-sm text-muted-foreground">
        Traces, logs and metrics on one timeline, with no sampling below 10k requests a minute.
      </p>
    </div>
  )
}
