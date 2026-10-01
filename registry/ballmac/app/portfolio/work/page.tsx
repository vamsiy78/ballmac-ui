// Ballmac UI: Portfolio template route. https://ui.ballmac.com/templates/template-portfolio
import type { Metadata } from "next"

import { PortfolioWork } from "@/components/ballmac/templates/portfolio/portfolio-work"

export const metadata: Metadata = {
  title: "Work · Ines Calder",
  description: "Six projects and what they changed.",
}

export default function Page() {
  return <PortfolioWork />
}
