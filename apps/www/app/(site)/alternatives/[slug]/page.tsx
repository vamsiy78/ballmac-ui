import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/site/json-ld"
import { LibraryEntry, profileOf } from "@/components/site/library-entry"
import Link from "@/components/site/link"
import { checkedPhrase, alternatives, getAlternatives, getProfile } from "@/lib/alternatives"
import { article, breadcrumbs } from "@/lib/schema"

export const dynamicParams = false

export function generateStaticParams() {
  return alternatives.map((a) => ({ slug: a.slug }))
}

function words(slug: string) {
  const a = getAlternatives(slug)
  const x = getProfile(slug)
  if (!a || !x) return null
  const n = a.order.length
  return { a, x, n, title: `${x.name} alternatives: ${n} shadcn libraries compared`, description: `${n} alternatives to ${x.name} for shadcn/ui, with what each is best for, its trade-off and its price, read from each library's own site.` }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const w = words((await params).slug)
  if (!w) return {}
  return { title: w.title, description: w.description, alternates: { canonical: `/alternatives/${w.a.slug}` } }
}

export default async function AlternativesPage({ params }: { params: Promise<{ slug: string }> }) {
  const w = words((await params).slug)
  if (!w) notFound()
  const { a, x } = w
  const entries = a.order.map(profileOf).filter((p) => p !== undefined)
  const date = checkedPhrase([x.slug, ...a.order])
  const path = `/alternatives/${a.slug}`
  return (
    <div className="mx-auto max-w-[860px] px-4 py-14 sm:px-6 md:py-20">
      <JsonLd graph={[article({ headline: w.title, description: w.description, path, section: "Compare" }), breadcrumbs([{ name: "Compare", path: "/compare" }, { name: `${x.name} alternatives`, path }])]} />
      <header>
        <p className="text-muted-foreground text-sm">
          <Link href="/compare" className="hover:text-foreground">
            Compare
          </Link>
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">{x.name} alternatives</h1>
        <p className="mt-5 text-base leading-relaxed text-pretty sm:text-lg">{a.why}</p>
        <p className="text-muted-foreground mt-3 text-sm">
          We make Ballmac UI, so it is listed first where it fits the reason above; every entry says what it is best for and what it gives up. Prices and limits were read from each
          library&rsquo;s own site {date}.
        </p>
      </header>

      <section aria-labelledby="x-h" className="mt-12">
        <h2 id="x-h" className="text-lg font-semibold tracking-tight">
          {x.name} itself
        </h2>
        <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
          {x.verdict} Best for: {x.bestFor.charAt(0).toLowerCase() + x.bestFor.slice(1)}{" "}
          <Link href={`/compare/${x.slug}`} className="text-foreground underline underline-offset-2">
            Ballmac UI vs {x.name}
          </Link>
        </p>
      </section>

      <section aria-labelledby="list-h" className="mt-12">
        <h2 id="list-h" className="text-2xl font-semibold tracking-[-0.03em]">
          The alternatives
        </h2>
        <div className="mt-6 space-y-5">
          {entries.map((p, i) => (
            <LibraryEntry key={p.slug} p={p} rank={i + 1} headingLevel={3} />
          ))}
        </div>
      </section>

      <section aria-labelledby="more-h" className="mt-16">
        <h2 id="more-h" className="text-lg font-semibold tracking-tight">
          Other alternatives pages
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {alternatives
            .filter((o) => o.slug !== a.slug)
            .map((o) => (
              <li key={o.slug}>
                <Link href={`/alternatives/${o.slug}`} className="bg-frame hover:bg-accent inline-flex rounded-full px-3.5 py-1.5 text-sm transition-colors motion-reduce:transition-none">
                  {getProfile(o.slug)?.name} alternatives
                </Link>
              </li>
            ))}
          <li>
            <Link href="/best/shadcn-block-libraries" className="bg-frame hover:bg-accent inline-flex rounded-full px-3.5 py-1.5 text-sm transition-colors motion-reduce:transition-none">
              Best shadcn block libraries
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}
