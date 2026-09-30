import { Sparkline } from "@/components/ballmac/sparkline"
export default function SparklineDemo() {
  return (
    <div className="flex w-full max-w-sm items-end justify-between gap-4 rounded-xl border border-border bg-card p-5">
      <div>
        <p className="text-muted-foreground text-sm">Weekly signups</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">1,208</p>
        <p className="text-primary mt-1 text-xs font-medium">Up this week</p>
      </div>
      <Sparkline
        className="max-w-36"
        values={[8, 12, 11, 17, 14, 20, 23, 21, 26]}
        label="Weekly signups"
      />
    </div>
  )
}
