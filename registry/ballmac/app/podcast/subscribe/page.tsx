// Ballmac UI: Podcast template route. https://ui.ballmac.com/templates/template-podcast
import type { Metadata } from "next"

import { PodcastSubscribe } from "@/components/ballmac/templates/podcast/podcast-subscribe"

export const metadata: Metadata = {
  title: "Subscribe · The Long Table",
  description: "Follow the show on any platform, or support it directly.",
}

export default function Page() {
  return <PodcastSubscribe />
}
