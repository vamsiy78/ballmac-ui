import { ArrowUpRight, Check, Plus } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"

import { buttonVariants } from "@/components/ballmac/button"
import { Frame } from "@/components/pro/shots"
import Link from "@/components/site/link"
import { Eyebrow } from "@/components/site/section-heading"
import { BUILT_WITH, ISSUE_URL } from "@/lib/built-with"

const empty = BUILT_WITH.length === 0

export const metadata: Metadata = {
  title: "Built with Ballmac UI",
  description: "Live products and sites made with Ballmac UI components, blocks and templates, shown with the items they use.",
  alternates: { canonical: "/built-with" },
  // An empty gallery is not worth indexing; it starts to be once the first project is in.
  robots: empty ? { index: false, follow: true } : undefined,
}

const CRITERIA = [
  "It is live and anyone can open it.",
  "It really uses Ballmac UI, free or Pro. You tell us which items.",
  "You own it, or have its owner's permission to show it.",
]

export default function BuiltWithPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
      <header className="mx-auto max-w-2xl space-y-4 text-center">
        <div className="flex justify-center">
          <Eyebrow>Built with Ballmac UI</Eyebrow>
        </div>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Real products, made with these components</h1>
        <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
          {empty ? "This is where live projects are shown, each with the items it uses." : "Live projects, each shown with the items it uses. Open one and look around."}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <a href={ISSUE_URL} className={buttonVariants({ shape: "pill", size: "lg" })}>
            <Plus aria-hidden="true" /> Add your project
          </a>
          <Link href="/contribute" className={buttonVariants({ shape: "pill", size: "lg", variant: "outline" })}>
            Contribute an item
          </Link>
        </div>
      </header>

      {empty ? (
        <section aria-labelledby="first-h" className="mt-16">
          {/* Three quiet frames where projects will go. Decorative, so hidden from assistive technology. */}
          <div aria-hidden="true" className="grid gap-5 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="border-border bg-muted/20 rounded-2xl border border-dashed p-3">
                <div className="bg-background overflow-hidden rounded-xl border">
                  <div className="bg-muted/50 flex h-6 items-center gap-1.5 border-b px-3">
                    <span className="bg-foreground/15 size-1.5 rounded-full" />
                    <span className="bg-foreground/15 size-1.5 rounded-full" />
                    <span className="bg-foreground/15 size-1.5 rounded-full" />
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="bg-muted h-3 w-1/3 rounded-full" />
                    <div className="bg-muted/70 h-2 w-4/5 rounded-full" />
                    <div className="bg-muted/70 h-2 w-3/5 rounded-full" />
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="bg-muted/60 h-14 rounded-lg" />
                      <div className="bg-muted/60 h-14 rounded-lg" />
                      <div className="bg-muted/60 h-14 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-12 max-w-xl text-center">
            <h2 id="first-h" className="text-2xl font-semibold tracking-tight">No projects yet. The first spot is yours.</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">We add a project after checking it. It takes one short form.</p>
            <ul className="mx-auto mt-6 inline-grid gap-2.5 text-start text-sm">
              {CRITERIA.map((c) => (
                <li key={c} className="flex items-start gap-2.5">
                  <span className="bg-foreground/[0.07] mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full" aria-hidden="true">
                    <Check className="size-3" />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section aria-label="Projects" className="mt-14">
          <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2">
            {BUILT_WITH.map((p) => (
              <li key={p.slug}>
                <a href={p.url} rel="noopener noreferrer" target="_blank" className="focus-visible:ring-ring/50 group block rounded-2xl outline-none focus-visible:ring-[3px]">
                  <Frame className="transition-shadow group-hover:shadow-[0_32px_80px_-32px_rgb(0_0_0/0.5)]">
                    <Image src={p.image} alt={p.imageAlt} width={1600} height={1000} unoptimized loading="lazy" className="h-auto w-full" />
                  </Frame>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="flex items-center gap-1.5 text-lg font-semibold tracking-tight">
                        {p.name}
                        <ArrowUpRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" aria-hidden="true" />
                      </h2>
                      <p className="text-muted-foreground mt-1 text-sm leading-relaxed text-pretty">{p.description}</p>
                    </div>
                  </div>
                </a>
                {p.items.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`Items ${p.name} uses`}>
                    {p.items.map((n) => (
                      <li key={n}>
                        <Link href={`/components/${n}`} className="bg-muted/60 hover:bg-muted rounded-full px-2.5 py-1 font-mono text-xs transition-colors">
                          {n}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
