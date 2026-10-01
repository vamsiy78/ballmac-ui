import { InteractiveGrid } from "@/components/ballmac/interactive-grid"

export default function InteractiveGridDemo() {
  return (
    <div className="relative flex h-80 w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl border bg-background">
      <InteractiveGrid cell={36} color="--chart-1" radius={2.6} />
      <div className="pointer-events-none relative z-10 text-center">
        <h3 className="text-3xl font-semibold tracking-tight">Move your mouse</h3>
        <p className="mt-1 text-sm text-muted-foreground">Every cell you touch glows, then fades.</p>
      </div>
    </div>
  )
}
