// Ballmac UI: Publication template route. https://ui.ballmac.com/templates/template-publication
import type { Metadata } from "next"

import { PublicationArticle } from "@/components/ballmac/templates/publication/publication-article"

export const metadata: Metadata = {
  title: "The case for the unfinished city · Marginalia",
  description: "What a scaffold-covered street teaches us about patience.",
}

// One layout for every article. Load the story by params.slug from your data when you add more.
export default function Page() {
  return <PublicationArticle />
}
