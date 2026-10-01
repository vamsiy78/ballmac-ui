import { CircularProgress } from "@/components/ballmac/circular-progress"

export default function CircularProgressGauge() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-8">
      <CircularProgress sweep={270} size={170} thickness={14} legend={false} rings={[{ label: "Storage used", value: 72, tone: "chart-3" }]} />
      <CircularProgress sweep={270} size={170} thickness={14} legend={false} rings={[{ label: "Health score", value: 94, tone: "chart-2", display: "94" }]}>
        <span className="text-4xl font-semibold tabular-nums">94</span>
        <span className="text-xs text-muted-foreground">Excellent</span>
      </CircularProgress>
    </div>
  )
}
