// Ballmac UI: Publication template route. https://ui.ballmac.com/templates/template-publication
import type { Metadata } from "next"

import { PublicationIssues } from "@/components/ballmac/templates/publication/publication-issues"

export const metadata: Metadata = {
  title: "Issues · Marginalia",
  description: "Four times a year, one theme, 160 pages.",
}

export default function Page() {
  return <PublicationIssues />
}
