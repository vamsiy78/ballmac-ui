// Ballmac UI: Docs template route. https://ui.ballmac.com/templates/template-docs
import type { Metadata } from "next"

import { DocsSearch } from "@/components/ballmac/templates/docs/docs-search"

export const metadata: Metadata = {
  title: "Search · Tern docs",
  description: "Search guides, endpoints and releases.",
}

export default function Page() {
  return <DocsSearch />
}
