import { OrbitingCircles } from "@/components/ballmac/orbiting-circles"

export default function OrbitingCirclesMinimal() {
  return (
    <div className="relative flex h-64 w-full max-w-sm items-center justify-center">
      <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">in sync</span>
      <OrbitingCircles radius={96} duration={12} iconSize={10}>
        <span className="size-2.5 rounded-full bg-chart-1" />
        <span className="size-2.5 rounded-full bg-chart-2" />
        <span className="size-2.5 rounded-full bg-chart-4" />
      </OrbitingCircles>
    </div>
  )
}
