// Ballmac UI: Atlas template route. https://ui.ballmac.com/templates/template-atlas
import type { Metadata } from "next"

import { AtlasCustomers } from "@/components/ballmac/templates/atlas/atlas-customers"

export const metadata: Metadata = {
  title: "Customers · Atlas",
  description: "Segments, lifetime spend and recent orders.",
}

export default function Page() {
  return <AtlasCustomers />
}
