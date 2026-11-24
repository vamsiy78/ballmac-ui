import type { Metadata } from "next"
import Link from "@/components/site/link"

import { GoBack } from "@/components/site/go-back"
import { BallmacMark } from "@/components/site/logo"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"

export const metadata: Metadata = { title: "Page not found", robots: { index: false } }

const places = [
  { href: "/blocks", title: "Blocks" },
  { href: "/components", title: "Components" },
  { href: "/templates", title: "Templates" },
  { href: "/docs", title: "Docs" },
  { href: "/pricing", title: "Pricing" },
]

const action = "focus-visible:ring-ring/50 inline-flex items-center gap-2.5 rounded-full py-1 ps-1 pe-3 text-[17px] outline-none transition-colors hover:bg-frame focus-visible:ring-[3px] motion-reduce:transition-none"

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-frame/50 flex flex-1 items-center">
        <div className="mx-auto max-w-2xl px-4 py-32 text-center sm:px-6 sm:py-40">
          <p className="text-muted-foreground font-mono text-[13px] tracking-[0.06em] uppercase">404 page not found</p>
          <h1 className="mt-6 text-xl font-medium tracking-[-0.02em] text-balance sm:text-[22px]">You&rsquo;re looking for a page that isn&rsquo;t here</h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <GoBack className={action} />
            <Link href="/" className={action}>
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-[oklch(0.56_0.22_258)] text-white">
                <BallmacMark className="size-5" />
              </span>
              Home
            </Link>
            <Link href="/blocks" className={action}>
              <span className="bg-background inline-flex size-8 items-center justify-center rounded-full font-mono text-sm shadow-[0_1px_2px_rgb(0_0_0/0.08)]" aria-hidden="true">⌘</span>
              Browse
            </Link>
          </div>
          <p className="text-muted-foreground mt-10 text-sm">
            Or search with <kbd className="bg-background rounded-md px-1.5 py-0.5 font-mono text-xs shadow-[0_1px_2px_rgb(0_0_0/0.08)]">⌘K</kbd>, or go to{" "}
            {places.map((p, i) => (
              <span key={p.href}>
                <Link href={p.href} className="text-foreground underline-offset-4 hover:underline">{p.title}</Link>
                {i < places.length - 2 ? ", " : i === places.length - 2 ? " or " : "."}
              </span>
            ))}
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
