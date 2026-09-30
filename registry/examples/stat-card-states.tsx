import { StatCard } from "@/components/ballmac/stat-card"
export default function StatCardStates() {
  return (
    <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
      <StatCard
        label="Response time"
        value="84 ms"
        change={-18}
        lowerIsBetter
        comparison="versus last week"
      />
      <StatCard
        label="Open issues"
        value="7"
        change={3}
        lowerIsBetter
        comparison="versus last week"
      />
    </div>
  )
}
