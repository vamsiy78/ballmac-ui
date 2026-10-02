import { GridPattern } from "@/components/ballmac/grid-pattern"

export default function GridPatternVariants() {
  return (
    <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
      <div className="relative h-40 overflow-hidden rounded-xl border bg-card">
        <GridPattern cell={24} strokeDasharray="3 3" fade="top" />
        <span className="absolute bottom-3 start-3 text-xs font-medium">Dashed, fading down</span>
      </div>
      <div className="relative h-40 overflow-hidden rounded-xl border bg-card">
        <GridPattern cell={28} flicker={6} fade="radial" />
        <span className="absolute bottom-3 start-3 text-xs font-medium">Cells that glow now and then</span>
      </div>
    </div>
  )
}
