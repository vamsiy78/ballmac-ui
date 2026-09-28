import type { Metadata } from "next"
import Link from "next/link"

import { ScaledPreview } from "@/components/site/scaled-preview"
import { Eyebrow } from "@/components/site/section-heading"
import { loadExample } from "@/lib/examples"
import { getTemplates } from "@/lib/registry"

export const metadata: Metadata = {
  title: "Templates",
  description: "Complete React + Tailwind pages built from Ballmac UI blocks and components. Install a full page with one shadcn command and make it yours.",
  alternates: { canonical: "/templates" },
}

export default async function TemplatesPage() {
  const templates = await Promise.all(getTemplates().map(async (t) => ({ ...t, Preview: t.examples[0] ? await loadExample(t.examples[0].name) : null })))
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6">
      <header className="max-w-2xl space-y-4">
        <Eyebrow>{templates.length} {templates.length === 1 ? "template" : "templates"}</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Templates</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Full pages assembled from Ballmac blocks. Install one as a route in your app, then edit the copy and sections.
        </p>
      </header>
      {templates.length === 0 && <p className="text-muted-foreground mt-12">Templates are on the way.</p>}
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {templates.map((t) => (
          <div key={t.name} className="relative overflow-hidden rounded-xl border transition-colors hover:border-foreground/25">
            <div className="border-b">
              <ScaledPreview scale={0.48} height={420} width={1280}>
                {t.Preview ? <t.Preview /> : null}
              </ScaledPreview>
            </div>
            <div className="p-5">
              <Link href={`/templates/${t.name}`} className="text-lg font-medium after:absolute after:inset-0 after:rounded-xl outline-none focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50">
                {t.title}
              </Link>
              <p className="text-muted-foreground mt-1 text-sm">{t.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
