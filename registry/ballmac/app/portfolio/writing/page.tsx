// Ballmac UI: Portfolio template route. https://ui.ballmac.com/templates/template-portfolio
import type { Metadata } from "next"

import { PortfolioWriting } from "@/components/ballmac/templates/portfolio/portfolio-writing"

export const metadata: Metadata = {
  title: "Writing · Ines Calder",
  description: "Notes on making things people use.",
}

export default function Page() {
  return <PortfolioWriting />
}
