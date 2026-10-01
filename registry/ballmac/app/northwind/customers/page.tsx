// Ballmac UI: Northwind template route. https://ui.ballmac.com/templates/template-northwind
import type { Metadata } from "next"

import { NorthwindCustomers } from "@/components/ballmac/templates/northwind/northwind-customers"

export const metadata: Metadata = {
  title: "Northwind customers",
  description: "How finance teams closed faster with Northwind.",
}

export default function Page() {
  return <NorthwindCustomers />
}
