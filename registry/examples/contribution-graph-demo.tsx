import { ContributionGraph } from "@/components/ballmac/contribution-graph"
const data = Array.from({ length: 84 }, (_, i) => ({
  date: new Date(Date.UTC(2026, 6, i + 1)).toISOString().slice(0, 10),
  count: (i * 7 + Math.floor(i / 5)) % 12,
}))
export default function ContributionGraphDemo() {
  return (
    <ContributionGraph
      className="w-full max-w-lg"
      label="Workspace activity"
      data={data}
    />
  )
}
