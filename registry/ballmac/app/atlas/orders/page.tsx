// Ballmac UI: Atlas template route. https://ui.ballmac.com/templates/template-atlas
import type { Metadata } from "next"

import { AtlasOrders } from "@/components/ballmac/templates/atlas/atlas-orders"

export const metadata: Metadata = {
  title: "Orders · Atlas",
  description: "Search, sort and fulfil every order.",
}

export default function Page() {
  return <AtlasOrders />
}
