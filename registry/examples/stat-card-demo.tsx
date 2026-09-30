import { StatCard } from "@/components/ballmac/stat-card"
import { Sparkline } from "@/components/ballmac/sparkline"
export default function StatCardDemo() {
  return (
    <StatCard
      className="w-full max-w-sm"
      label="Monthly active workspaces"
      value="12,840"
      change={12.8}
      comparison="from last month"
      visual={
        <Sparkline
          className="w-24"
          values={[6, 8, 7, 11, 10, 14, 16]}
          label="Workspaces"
        />
      }
    />
  )
}
