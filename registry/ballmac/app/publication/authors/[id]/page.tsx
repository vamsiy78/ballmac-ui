// Ballmac UI: Publication template route. https://ui.ballmac.com/templates/template-publication
import type { Metadata } from "next"

import { PublicationAuthor } from "@/components/ballmac/templates/publication/publication-author"

export const metadata: Metadata = {
  title: "Authors · Marginalia",
  description: "Writers at Marginalia.",
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PublicationAuthor authorId={id} />
}
