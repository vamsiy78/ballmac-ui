import { ComparisonTable } from "@/components/ballmac/comparison-table"
export default function ComparisonTableDemo() {
  return (
    <ComparisonTable
      className="w-full max-w-xl"
      caption="Compare workspace plans"
      columns={[
        { key: "starter", title: "Starter" },
        {
          key: "team",
          title: "Team",
          description: "For growing groups",
          featured: true,
        },
      ]}
      rows={[
        { label: "Members", values: { starter: "3", team: "Unlimited" } },
        { label: "Shared projects", values: { starter: true, team: true } },
        { label: "Advanced roles", values: { starter: false, team: true } },
      ]}
    />
  )
}
