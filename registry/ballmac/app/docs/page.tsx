// Ballmac UI: Docs template route. https://ui.ballmac.com/templates/template-docs
import type { Metadata } from "next"

import { DocsHome } from "@/components/ballmac/templates/docs/docs-home"

export const metadata: Metadata = {
  title: "Tern docs: queues that never lose a message",
  description: "Guides, API reference and changelog for Tern.",
}

export default function Page() {
  return <DocsHome />
}
