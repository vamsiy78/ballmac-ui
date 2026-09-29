import { DotPattern } from "@/components/ballmac/dot-pattern"

export default function DotPatternDemo() {
  return (
    <div className="relative isolate flex h-80 w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-xl border bg-background px-6 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_45%_at_50%_45%,color-mix(in_oklch,var(--chart-1)_10%,transparent),transparent)]"
      />
      <DotPattern glow glowCount={26} width={14} height={14} radius={1.1} className="-z-10" />
      <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Changelog</span>
      <h2 className="mt-3 max-w-md text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Small details, shipped weekly.
      </h2>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        Every Friday: fixes, polish and one thing you asked for.
      </p>
    </div>
  )
}
