import { ArrowRight, ExternalLink } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/site/json-ld"
import Link from "@/components/site/link"
import { comparisons, getComparison } from "@/lib/compare"
import { getOffer } from "@/lib/offer"
import { getBlocks, isPro } from "@/lib/registry"
import { article, breadcrumbs } from "@/lib/schema"

export const dynamicParams = false

export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = getComparison((await params).slug)
  if (!c) return {}
  return { title: c.title, description: c.description, alternates: { canonical: `/compare/${c.slug}` } }
}

const host = (u: string) => new URL(u).host.replace(/^www\./, "")

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const c = getComparison((await params).slug)
  if (!c) notFound()
  const offer = await getOffer()
  const blocks = getBlocks()
  const free = blocks.filter((b) => !isPro(b)).length
  const pro = blocks.filter(isPro).length
  const date = new Date(`${c.checked}T00:00:00Z`).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
  // Our side comes from the registry and the live offer, so it is current whenever the site is built.
  const ours: { label: string; value: string }[] = [
    { label: "Free", value: `${free} screens and every free component, chart, theme and preset, MIT licensed` },
    { label: "Pro", value: pro > 0 ? `${pro} more screens, starter apps and a private registry${offer.onSale && offer.price ? `: $${offer.price}, one licence for one person` : ""}` : "Premium screens and starter apps" },
    { label: "How you install", value: "The shadcn CLI, or your AI agent through MCP" },
    { label: "Quality", value: "Every item is loaded in a real browser (light, dark, phone width, reduced motion, right to left) and the results are published" },
  ]
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 md:py-20">
      <JsonLd graph={[article({ headline: c.title, description: c.description, path: `/compare/${c.slug}`, section: "Compare" }), breadcrumbs([{ name: "Compare", path: "/compare" }, { name: c.name, path: `/compare/${c.slug}` }])]} />
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-muted-foreground text-sm">
          <Link href="/compare" className="hover:text-foreground">
            Compare
          </Link>
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">{c.title}</h1>
        <p className="text-muted-foreground mt-5 text-base leading-relaxed text-pretty sm:text-lg">{c.what}</p>
        <p className="text-muted-foreground mt-3 text-sm">{c.both}</p>
      </header>

      <section aria-labelledby="facts-h" className="mt-14">
        <h2 id="facts-h" className="text-2xl font-semibold tracking-[-0.03em]">
          Side by side
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h3 className="text-lg font-semibold tracking-tight">{c.name}</h3>
            <dl className="mt-4 divide-y">
              {c.facts.map((f) => (
                <div key={f.label} className="py-3 first:pt-0 last:pb-0">
                  <dt className="text-muted-foreground text-[13px]">{f.label}</dt>
                  <dd className="mt-1 text-[15px] leading-relaxed">
                    {f.value}{" "}
                    <a href={f.source} rel="noopener nofollow" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 align-baseline text-xs underline underline-offset-2">
                      {host(f.source)}
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="text-lg font-semibold tracking-tight">Ballmac UI</h3>
            <dl className="mt-4 divide-y">
              {ours.map((f) => (
                <div key={f.label} className="py-3 first:pt-0 last:pb-0">
                  <dt className="text-muted-foreground text-[13px]">{f.label}</dt>
                  <dd className="mt-1 text-[15px] leading-relaxed">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <p className="text-muted-foreground mt-4 text-sm">
          What we say about {c.name} was read from its own public pages on {date}. Products change, so check their site before you decide. Found something out of date?{" "}
          <Link href="/support" className="hover:text-foreground underline underline-offset-2">
            Tell us
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="pick-h" className="mt-16">
        <h2 id="pick-h" className="text-2xl font-semibold tracking-[-0.03em]">
          Which one to use
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h3 className="text-base font-semibold">Pick {c.name} if</h3>
            <ul className="text-muted-foreground mt-3 list-disc space-y-2 ps-5 text-[15px] leading-relaxed">
              {c.theirs.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border p-6">
            <h3 className="text-base font-semibold">Pick Ballmac UI if</h3>
            <ul className="text-muted-foreground mt-3 list-disc space-y-2 ps-5 text-[15px] leading-relaxed">
              {c.ours.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-muted-foreground mt-4 text-sm">You can use both: everything installs as code into your own repository, so mixing libraries is normal.</p>
      </section>

      <section aria-labelledby="try-h" className="mt-16 rounded-2xl border p-6 sm:p-8">
        <h2 id="try-h" className="text-xl font-semibold tracking-[-0.02em]">
          Try it before you decide
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-[15px] leading-relaxed">The free part needs no account: pick a screen, copy the install command and look at the code.</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium">
          <Link href="/blocks" className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex h-10 items-center gap-2 rounded-lg px-4 outline-none focus-visible:ring-[3px]">
            Browse the free screens <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
          <Link href="/use-cases" className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-10 items-center gap-2 rounded-lg border px-4 outline-none focus-visible:ring-[3px]">
            What you can build
          </Link>
          <Link href="/pricing" className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-10 items-center rounded-lg border px-4 outline-none focus-visible:ring-[3px]">
            Pricing
          </Link>
        </div>
      </section>
    </div>
  )
}
