import { StaggerItem, StaggerList } from "@/components/ballmac/stagger-list"

const dirs = ["up", "down", "left", "right", "scale"] as const

export default function StaggerListDirections() {
  return (
    <div className="grid w-full max-w-md gap-4">
      {dirs.map((direction) => (
        <div key={direction} className="grid grid-cols-[4rem_1fr] items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">{direction}</span>
          <StaggerList inView={false} direction={direction} stagger={0.08} className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <StaggerItem key={n} className="flex size-9 items-center justify-center rounded-lg border bg-card text-sm font-medium tabular-nums">
                {n}
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      ))}
    </div>
  )
}
