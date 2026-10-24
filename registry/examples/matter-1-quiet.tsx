"use client"

import { Matter1 } from "@/components/ballmac/blocks/matter-1/matter-1"

export default function Matter1Quiet() {
  return <Matter1 matters={[{ id: "a", client: "Northpoint Dental", title: "Data protection policy", area: "Commercial", lead: "L. Rossi", status: "open", hours: 3.5, budget: 8 }]} />
}
