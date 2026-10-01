import { CircularProgress } from "@/components/ballmac/circular-progress"

export default function CircularProgressDemo() {
  return (
    <CircularProgress
      size={190}
      thickness={15}
      rings={[
        { label: "Move", value: 420, max: 560, display: "420 kcal", tone: "chart-4" },
        { label: "Exercise", value: 21, max: 30, display: "21 min", tone: "chart-2" },
        { label: "Stand", value: 8, max: 12, display: "8 hr", tone: "chart-1" },
      ]}
    >
      <span className="text-3xl font-semibold tracking-tight tabular-nums">75%</span>
      <span className="text-xs text-muted-foreground">of daily goal</span>
    </CircularProgress>
  )
}
