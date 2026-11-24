import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/site/json-ld"
import { LibraryEntry, profileOf } from "@/components/site/library-entry"
import Link from "@/components/site/link"
import { checkedPhrase, alternatives, bestLists, getBestList, getProfile } from "@/lib/alternatives"
import { article, breadcrumbs } from "@/lib/schema"

export const dynamicParams = false

export function generateStaticParams() {
  return bestLists.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = getBestList((await params).slug)
  if (!b) return {}
  return { title: b.title, description: b.description, alternates: { canonical: `/best/${b.slug}` } }
}

export default async function BestPage({ params }: { params: Promise<{ slug: string }> }) {
  const b = getBestList((await params).slug)
  if (!b) notFound()
  const picks = b.picks.map((pk) => ({ ...pk, p: profileOf(pk.slug) })).filter((pk) => pk.p !== undefined)
  const date = checkedPhrase(b.picks.map((pk) => pk.slug))
  const path = `/best/${b.slug}`
  return (
    <div className="mx-auto max-w-[860px] px-4 py-14 sm:px-6 md:py-20">
      <JsonLd graph={[article({ headline: b.title, description: b.description, path, section: "Compare" }), breadcrumbs([{ name: "Compare", path: "/compare" }, { name: b.title, path }])]} />
      <header>
        <p className="text-muted-foreground text-sm">
          <Link href="/compare" className="hover:text-foreground">
            Compare
          </Link>
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">{b.title}</h1>
        <p className="mt-5 text-base leading-relaxed text-pretty sm:text-lg">{b.intro}</p>
        <p className="text-muted-foreground mt-3 text-sm">
          We make Ballmac UI and it is in this list; it is placed only where it fits. Prices and limits were read from each library&rsquo;s own site {date}.
        </p>
      </header>

      <section aria-labelledby="picks-h" className="mt-12">
        <h2 id="picks-h" className="text-2xl font-semibold tracking-[-0.03em]">
          The picks
        </h2>
        <div className="mt-6 space-y-5">
          {picks.map(({ label, p }) => (
            <LibraryEntry key={p!.slug} p={p!} label={label} headingLevel={3} />
          ))}
        </div>
      </section>

      <section aria-labelledby="how-h" className="mt-16">
        <h2 id="how-h" className="text-2xl font-semibold tracking-[-0.03em]">
          How we picked
        </h2>
        <ul className="text-muted-foreground mt-4 list-disc space-y-2 ps-5 text-[15px] leading-relaxed">
          {b.criteria.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="alt-h" className="mt-16">
        <h2 id="alt-h" className="text-lg font-semibold tracking-tight">
          Looking to replace one?
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {alternatives.map((o) => (
            <li key={o.slug}>
              <Link href={`/alternatives/${o.slug}`} className="bg-frame hover:bg-accent inline-flex rounded-full px-3.5 py-1.5 text-sm transition-colors motion-reduce:transition-none">
                {getProfile(o.slug)?.name} alternatives
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
