// Ballmac UI: Publication template route. https://ui.ballmac.com/templates/template-publication
import type { Metadata } from "next"

import { PublicationHome } from "@/components/ballmac/templates/publication/publication-home"

export const metadata: Metadata = {
  title: "Marginalia: a magazine of ideas, written slowly",
  description: "Essays, culture, science and technology, written slowly.",
}

export default function Page() {
  return <PublicationHome />
}
