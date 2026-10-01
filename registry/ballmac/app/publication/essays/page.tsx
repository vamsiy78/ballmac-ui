// Ballmac UI: Publication template route. https://ui.ballmac.com/templates/template-publication
import type { Metadata } from "next"

import { PublicationSection } from "@/components/ballmac/templates/publication/publication-section"

export const metadata: Metadata = {
  title: "Essays · Marginalia",
  description: "Long arguments, patiently made.",
}

export default function Page() {
  return <PublicationSection />
}
