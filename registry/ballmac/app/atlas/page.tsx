// Ballmac UI: Atlas template route. https://ui.ballmac.com/templates/template-atlas
import type { Metadata } from "next"

import { AtlasDashboard } from "@/components/ballmac/templates/atlas/atlas-dashboard"

export const metadata: Metadata = {
  title: "Atlas dashboard · Atlas",
  description: "Sales, orders and stock for Fieldnote Goods.",
}

export default function Page() {
  return <AtlasDashboard />
}
