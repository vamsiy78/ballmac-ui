import { LightRays } from "@/components/ballmac/light-rays"

export default function LightRaysDemo() {
  return (
    <div className="relative flex h-80 w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl border bg-background">
      <LightRays tone="chart-1" count={8} />
      <div className="relative z-10 text-center">
        <h3 className="text-4xl font-semibold tracking-tight">Let there be light</h3>
        <p className="mt-1 text-sm text-muted-foreground">Soft rays, sway, and nothing else moving.</p>
      </div>
    </div>
  )
}
