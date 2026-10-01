// Ballmac UI: Portfolio template route. https://ui.ballmac.com/templates/template-portfolio
import type { Metadata } from "next"

import { PortfolioCase } from "@/components/ballmac/templates/portfolio/portfolio-case"

export const metadata: Metadata = {
  title: "Rebuilding onboarding · Ines Calder",
  description: "A case study: how a first-run flow got teams to their first invoice in one sitting.",
}

// One layout for every case study. Load the project by params.slug from your data when you add more.
export default function Page() {
  return <PortfolioCase />
}
