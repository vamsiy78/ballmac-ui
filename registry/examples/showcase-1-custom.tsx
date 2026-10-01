import { Showcase1 } from "@/components/ballmac/blocks/showcase-1/showcase-1"

function Timer() {
  return (
    <div className="@container bg-background flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Focus session</p>
      <p className="text-6xl font-light tracking-tight tabular-nums">24:18</p>
      <div className="bg-muted h-1.5 w-40 overflow-hidden rounded-full"><div className="bg-chart-2 h-full w-2/3 rounded-full" /></div>
      <p className="text-muted-foreground text-xs">Next: a 5 minute break</p>
    </div>
  )
}

export default function Showcase1Custom() {
  return (
    <Showcase1 app="Tempo" time="2026-10-01T14:05:00" widgets={false} notes={false} height="32rem">
      <Timer />
    </Showcase1>
  )
}
