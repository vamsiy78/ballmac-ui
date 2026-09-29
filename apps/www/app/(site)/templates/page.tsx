import type { Metadata } from "next"

import { PageCard } from "@/components/site/page-card"
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
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Templates</h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">
          Complete pages assembled from Ballmac blocks. Install one as a route in your app, then change the copy and sections.
        </p>
      </header>
      {templates.length === 0 && <p className="text-muted-foreground mt-12">Templates are on the way.</p>}
      <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-12 lg:grid-cols-2">
        {templates.map((t) => (
          <PageCard key={t.name} href={`/templates/${t.name}`} title={t.title} description={t.description} name={t.name} Preview={t.Preview} height={420} scale={0.5} />
        ))}
      </div>
    </div>
  )
}
