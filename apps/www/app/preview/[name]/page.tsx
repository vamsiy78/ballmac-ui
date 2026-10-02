import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PreviewDirection } from "@/components/site/preview-direction"
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
  const owner = getAllItems().find((i) => i.examples.some((e) => e.name === name))
  const fullPage = owner?.category === "blocks" || owner?.category === "templates"
  return (
    <PreviewDirection>
      {fullPage ? (
        <div className="bg-background min-h-dvh">
          <Example />
        </div>
      ) : (
        <div className="bm-stage bg-background flex min-h-dvh items-center justify-center p-6 sm:p-12">
          <Example />
        </div>
      )}
    </PreviewDirection>
  )
}
