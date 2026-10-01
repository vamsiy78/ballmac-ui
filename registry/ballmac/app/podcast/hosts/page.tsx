// Ballmac UI: Podcast template route. https://ui.ballmac.com/templates/template-podcast
import type { Metadata } from "next"

import { PodcastHosts } from "@/components/ballmac/templates/podcast/podcast-hosts"

export const metadata: Metadata = {
  title: "Hosts · The Long Table",
  description: "Meet Nora Vale and Sam Okoye.",
}

export default function Page() {
  return <PodcastHosts />
}
