// Ballmac UI: Podcast template route. https://ui.ballmac.com/templates/template-podcast
import type { Metadata } from "next"

import { PodcastEpisodes } from "@/components/ballmac/templates/podcast/podcast-episodes"

export const metadata: Metadata = {
  title: "Episodes · The Long Table",
  description: "Every conversation, newest first.",
}

export default function Page() {
  return <PodcastEpisodes />
}
