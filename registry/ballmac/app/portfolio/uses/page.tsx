// Ballmac UI: Portfolio template route. https://ui.ballmac.com/templates/template-portfolio
import type { Metadata } from "next"

import { PortfolioUses } from "@/components/ballmac/templates/portfolio/portfolio-uses"

export const metadata: Metadata = {
  title: "Uses · Ines Calder",
  description: "The tools, hardware and books behind the work.",
}

export default function Page() {
  return <PortfolioUses />
}
