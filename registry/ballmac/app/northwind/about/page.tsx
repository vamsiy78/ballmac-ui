// Ballmac UI: Northwind template route. https://ui.ballmac.com/templates/template-northwind
import type { Metadata } from "next"

import { NorthwindAbout } from "@/components/ballmac/templates/northwind/northwind-about"

export const metadata: Metadata = {
  title: "About Northwind",
  description: "Why we think finance should feel quiet.",
}

export default function Page() {
  return <NorthwindAbout />
}
