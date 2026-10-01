// Ballmac UI: Docs template route. https://ui.ballmac.com/templates/template-docs
import type { Metadata } from "next"

import { DocsChangelog } from "@/components/ballmac/templates/docs/docs-changelog"

export const metadata: Metadata = {
  title: "Changelog · Tern docs",
  description: "What shipped, what changed and what to do about it.",
}

export default function Page() {
  return <DocsChangelog />
}
