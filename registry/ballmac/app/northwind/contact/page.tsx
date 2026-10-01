// Ballmac UI: Northwind template route. https://ui.ballmac.com/templates/template-northwind
import type { Metadata } from "next"

import { NorthwindContact } from "@/components/ballmac/templates/northwind/northwind-contact"

export const metadata: Metadata = {
  title: "Contact Northwind",
  description: "Book a demo built around how your team spends.",
}

export default function Page() {
  return <NorthwindContact />
}
