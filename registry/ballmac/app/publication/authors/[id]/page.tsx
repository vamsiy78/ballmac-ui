// Ballmac UI: Publication template route. https://ui.ballmac.com/templates/template-publication
import type { Metadata } from "next"
import { Suspense } from "react"

import { PublicationAuthor } from "@/components/ballmac/templates/publication/publication-author"

export const metadata: Metadata = {
  title: "Authors · Marginalia",
  description: "Writers at Marginalia.",
}

// Reading `params` is runtime data: with Cache Components (on by default in new Next.js 16.4 projects) it has to sit inside <Suspense>.
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <AuthorView params={params} />
    </Suspense>
  )
}

async function AuthorView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PublicationAuthor authorId={id} />
}
