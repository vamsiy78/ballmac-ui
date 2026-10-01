import type { Metadata } from "next"

import { PageCard } from "@/components/site/page-card"
import { loadExample } from "@/lib/examples"
import { getTemplates, templateGroups } from "@/lib/registry"

export const metadata: Metadata = {
  title: "Templates",
  description: "Complete multi-page React + Tailwind sites and apps with their own art direction, built from Ballmac UI blocks. Install one with a single shadcn command.",
  alternates: { canonical: "/templates" },
}

export default async function TemplatesPage() {
  const templates = await Promise.all(getTemplates().map(async (t) => ({ ...t, Preview: t.examples[0] ? await loadExample(t.examples[0].name) : null })))
  const groups = templateGroups
    .map((g) => ({ ...g, items: templates.filter((t) => t.templateKind === g.id).sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title)) }))
    .filter((g) => g.items.length > 0)
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Templates with a point of view</h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">
          {templates.length} complete sites and apps, each with its own look, fonts and signature interaction. Install one as routes in your app, then make it yours.
        </p>
      </header>
      {groups.length > 1 && (
        <nav aria-label="Template groups" className="bg-background/85 sticky top-14 z-20 -mx-4 mt-10 border-b px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
          <ul className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] md:justify-center">
            {groups.map((g) => (
              <li key={g.id} className="shrink-0">
                <a
                  href={`#${g.id}`}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]"
                >
                  {g.label}
                  <span className="text-[11px] tabular-nums">{g.items.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {templates.length === 0 && <p className="text-muted-foreground mt-12">Templates are on the way.</p>}
      {groups.map((g) => (
        <section key={g.id} id={g.id} className="mt-16 scroll-mt-32 first-of-type:mt-12">
          <header className="mb-6 max-w-2xl border-b pb-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">{g.label}</h2>
            <p className="text-muted-foreground mt-1.5 text-[15px] leading-relaxed text-pretty">{g.description}</p>
          </header>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 lg:grid-cols-2">
            {g.items.map((t) => (
              <div key={t.name}>
                <PageCard href={`/templates/${t.name}`} title={t.title} description={t.description} name={t.name} Preview={t.Preview} height={420} scale={0.5} />
                {(t.templatePages.length > 1 || t.fonts.length > 0) && (
                  <p className="text-muted-foreground mt-2 text-xs">
                    {t.templatePages.length > 1 && `${t.templatePages.length} pages`}
                    {t.templatePages.length > 1 && t.fonts.length > 0 && " · "}
                    {t.fonts.length > 0 && t.fonts.join(" + ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
