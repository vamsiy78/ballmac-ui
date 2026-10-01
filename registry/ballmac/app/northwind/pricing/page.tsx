// Ballmac UI: Northwind template route. https://ui.ballmac.com/templates/template-northwind
import type { Metadata } from "next"

import { NorthwindPricing } from "@/components/ballmac/templates/northwind/northwind-pricing"

export const metadata: Metadata = {
  title: "Northwind pricing",
  description: "Pricing that scales with your team, not your spend.",
}

export default function Page() {
  return <NorthwindPricing />
}
