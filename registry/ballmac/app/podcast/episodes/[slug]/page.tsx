// Ballmac UI: Podcast template route. https://ui.ballmac.com/templates/template-podcast
import type { Metadata } from "next"

import { PodcastEpisode } from "@/components/ballmac/templates/podcast/podcast-episode"

export const metadata: Metadata = {
  title: "The Optimised Life · The Long Table",
  description: "A year without metrics, and what was left when she stopped counting.",
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <PodcastEpisode slug={slug} />
}
