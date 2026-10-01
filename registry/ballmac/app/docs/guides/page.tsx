// Ballmac UI: Docs template route. https://ui.ballmac.com/templates/template-docs
import type { Metadata } from "next"

import { DocsGuide } from "@/components/ballmac/templates/docs/docs-guide"

export const metadata: Metadata = {
  title: "Send your first message · Tern docs",
  description: "Create a queue, send a message and acknowledge it in about seven minutes.",
}

export default function Page() {
  return <DocsGuide />
}
