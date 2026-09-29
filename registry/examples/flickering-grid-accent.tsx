import { FlickeringGrid } from "@/components/ballmac/flickering-grid"

export default function FlickeringGridAccent() {
  return (
    <div className="relative isolate w-full max-w-sm overflow-hidden rounded-xl border bg-card p-6">
      <FlickeringGrid color="--chart-1" squareSize={3} gap={4} maxOpacity={0.5} flickerChance={0.6} fade={false} className="-z-10 [mask-image:linear-gradient(to_top,black,transparent_75%)]" />
      <p className="text-sm text-muted-foreground">Requests today</p>
      <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">48.2M</p>
      <p className="mt-16 text-xs text-muted-foreground">Up 12% from yesterday</p>
    </div>
  )
}
