// Ballmac UI: Northwind template route. https://ui.ballmac.com/templates/template-northwind
import type { Metadata } from "next"

import { NorthwindHome } from "@/components/ballmac/templates/northwind/northwind-home"

export const metadata: Metadata = {
  title: "Northwind: Spend with clarity",
  description: "Cards, approvals and budgets for finance teams.",
}

export default function Page() {
  return <NorthwindHome />
}
