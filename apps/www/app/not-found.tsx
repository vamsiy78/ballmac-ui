import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/site/link"

import { Button } from "@/components/ballmac/button"
import { Eyebrow } from "@/components/site/section-heading"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { getComponents } from "@/lib/registry"

export const metadata: Metadata = { title: "Page not found", robots: { index: false } }

const places = (components: number) => [
  { href: "/components", title: "Components", text: `${components} pieces with live previews` },
  { href: "/blocks", title: "Blocks", text: "Whole sections: heroes, pricing, dashboards" },
  { href: "/templates", title: "Templates", text: "Complete sites and apps" },
  { href: "/themes", title: "Themes", text: "Twelve looks and a builder" },
  { href: "/docs", title: "Docs", text: "Install, theme, connect your agent" },
  { href: "/pricing", title: "Pricing", text: "Free, and what Pro adds" },
]

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="flex justify-center">
            <Eyebrow>Error 404</Eyebrow>
          </div>
          <h1 className="mt-5 text-center text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">This page is not here</h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-md text-center text-lg leading-relaxed text-pretty">
            The link may be old or mistyped. Try search (press <kbd className="bg-muted rounded border px-1.5 py-0.5 font-mono text-sm">⌘K</kbd> or <kbd className="bg-muted rounded border px-1.5 py-0.5 font-mono text-sm">Ctrl K</kbd>) or pick a place to start.
          </p>
          <ul className="mt-12 grid gap-3 sm:grid-cols-2">
            {places(getComponents().length).map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="bg-card hover:bg-accent focus-visible:ring-ring/50 group flex items-center justify-between gap-4 rounded-xl border p-4 outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none"
                >
                  <span>
                    <span className="block font-medium">{p.title}</span>
                    <span className="text-muted-foreground block text-sm">{p.text}</span>
                  </span>
                  <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <Button asChild shape="pill" size="lg">
              <Link href="/">Back to the home page</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
