// Ballmac UI: Podcast template route. https://ui.ballmac.com/templates/template-podcast
import type { Metadata } from "next"

import { PodcastHome } from "@/components/ballmac/templates/podcast/podcast-home"

export const metadata: Metadata = {
  title: "The Long Table: a podcast recorded at a real table",
  description: "Long dinners, good questions, no agenda. New episodes every other Tuesday.",
}

export default function Page() {
  return <PodcastHome />
}
