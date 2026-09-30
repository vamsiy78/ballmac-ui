import { ContributionGraph } from "@/components/ballmac/contribution-graph"
const data = Array.from({ length: 35 }, (_, i) => ({
  date: `day-${i}`,
  count: i % 5 === 0 ? 0 : i % 4,
}))
export default function ContributionGraphStates() {
  return (
    <ContributionGraph
      className="w-full max-w-sm"
      label="Five week activity"
      data={data}
      levels={3}
    />
  )
}
