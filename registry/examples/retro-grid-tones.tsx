import { RetroGrid, type GridTone } from "@/components/ballmac/retro-grid"

const sets: { tone: GridTone; angle: number }[] = [
  { tone: "chart-4", angle: 70 },
  { tone: "chart-2", angle: 58 },
  { tone: "foreground", angle: 64 },
  { tone: "chart-3", angle: 66 },
]

export default function RetroGridTones() {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-3">
      {sets.map(({ tone, angle }) => (
        <div key={tone} className="relative h-36 overflow-hidden rounded-xl border bg-background">
          <RetroGrid tone={tone} angle={angle} cellSize={44} />
          <span className="absolute bottom-2 start-3 z-10 font-mono text-[11px] text-muted-foreground">
            {tone} · {angle}°
          </span>
        </div>
      ))}
    </div>
  )
}
