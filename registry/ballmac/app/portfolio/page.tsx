// Ballmac UI: Portfolio template route. https://ui.ballmac.com/templates/template-portfolio
import type { Metadata } from "next"

import { PortfolioHome } from "@/components/ballmac/templates/portfolio/portfolio-home"

export const metadata: Metadata = {
  title: "Ines Calder: product designer",
  description: "Independent product designer in Lisbon. Selected work, writing and how to get in touch.",
}

export default function Page() {
  return <PortfolioHome />
}
