import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { loadExample } from "@/lib/examples"
import { getAllItems } from "@/lib/registry"

// Bare canvas for iframes (blocks, templates), screenshots and a11y tests.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export function generateStaticParams() {
  return getAllItems().flatMap((i) => i.examples.map((e) => ({ name: e.name })))
}
export const dynamicParams = false

export default async function PreviewPage({ params }: PageProps<"/preview/[name]">) {
  const { name } = await params
  const Example = await loadExample(name)
  if (!Example) notFound()
  return (
    <div className="bg-background min-h-dvh">
      <Example />
    </div>
  )
}
