import { RetroGrid } from "@/components/ballmac/retro-grid"

export default function RetroGridDemo() {
  return (
    <div className="relative flex h-80 w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-2xl border bg-background">
      <RetroGrid tone="chart-1" />
      <div className="relative z-10 grid justify-items-center gap-3 px-6 text-center">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Ship it tonight</p>
        <h3 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Back to the future of UI</h3>
        <p className="max-w-sm text-sm text-muted-foreground">A grid that keeps moving toward you while you build.</p>
      </div>
    </div>
  )
}
