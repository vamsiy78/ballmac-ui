// Ballmac UI: Docs template route. https://ui.ballmac.com/templates/template-docs
import type { Metadata } from "next"

import { DocsReference } from "@/components/ballmac/templates/docs/docs-reference"

export const metadata: Metadata = {
  title: "API reference · Tern docs",
  description: "Every endpoint, parameter and error code.",
}

export default function Page() {
  return <DocsReference />
}
