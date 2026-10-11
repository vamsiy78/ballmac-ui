// Ballmac UI: Podcast template route. https://ui.ballmac.com/templates/template-podcast
import type { Metadata } from "next"
import { Suspense } from "react"

import { PodcastEpisode } from "@/components/ballmac/templates/podcast/podcast-episode"

export const metadata: Metadata = {
  title: "The Optimised Life · The Long Table",
  description: "A year without metrics, and what was left when she stopped counting.",
}

// Reading `params` is runtime data: with Cache Components (on by default in new Next.js 16.4 projects) it has to sit inside <Suspense>.
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={null}>
      <EpisodeView params={params} />
    </Suspense>
  )
}

async function EpisodeView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <PodcastEpisode slug={slug} />
}
