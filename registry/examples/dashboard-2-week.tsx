import { Dashboard2 } from "@/components/ballmac/blocks/dashboard-2/dashboard-2"

export default function Dashboard2Week() {
  return (
    <Dashboard2
      title="Docs traffic"
      description="Reads and searches across the documentation site."
      defaultRange="7d"
      live={null}
      sources={[
        { key: "search", label: "Search", visitors: 9200 },
        { key: "direct", label: "Direct", visitors: 3100 },
        { key: "github", label: "GitHub", visitors: 2400 },
      ]}
      devices={{ desktop: 82, mobile: 15, tablet: 3 }}
      pages={[
        { path: "/docs/getting-started", views: 6200, bounce: 22 },
        { path: "/docs/api", views: 4100, bounce: 18 },
      ]}
      countries={[
        { name: "United States", visitors: 5200 },
        { name: "India", visitors: 3300 },
        { name: "Germany", visitors: 1900 },
      ]}
    />
  )
}
