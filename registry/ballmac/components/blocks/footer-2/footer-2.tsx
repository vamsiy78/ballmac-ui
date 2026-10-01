// Ballmac UI: Footer 2. https://ui.ballmac.com/blocks/footer-2
import * as React from "react"
import { Globe, Mail, Rss } from "lucide-react"

import { StatusDot } from "@/components/ballmac/status-dot"
import { cn } from "@/lib/utils"

type Footer2Link = { label: string; href: string }

type Footer2Column = {
  /** Column heading. */
  title: string
  links: Footer2Link[]
}

type Footer2Social = {
  /** Accessible name, e.g. "Acme on GitHub". */
  label: string
  href: string
  /** Icon. Defaults to a globe. */
  icon?: React.ReactNode
}

type Footer2Props = React.ComponentProps<"footer"> & {
  /** Brand name beside the tagline. */
  brand?: string
  /** One sentence under the brand. */
  tagline?: string
  /** Link columns. Three fit best. */
  columns?: Footer2Column[]
  /** Icon links. */
  socials?: Footer2Social[]
  /** Live status line. Pass null to hide it. */
  status?: { label: string; href?: string; tone?: "online" | "busy" | "away" } | null
  /** Legal text in the bottom bar. */
  legal?: string
  /** Legal links in the bottom bar. */
  legalLinks?: Footer2Link[]
  /** Giant word along the bottom. Defaults to the brand. */
  wordmark?: string
}

const defaultColumns: Footer2Column[] = [
  { title: "Product", links: [{ label: "Overview", href: "#" }, { label: "Pricing", href: "#" }, { label: "Changelog", href: "#" }, { label: "Integrations", href: "#" }] },
  { title: "Company", links: [{ label: "About", href: "#" }, { label: "Careers", href: "#" }, { label: "Blog", href: "#" }, { label: "Contact", href: "#" }] },
  { title: "Resources", links: [{ label: "Documentation", href: "#" }, { label: "Guides", href: "#" }, { label: "Help center", href: "#" }, { label: "Security", href: "#" }] },
]

function Footer2({
  brand = "Acme",
  tagline = "Finance tools that feel like a quiet room. Built by a small remote team.",
  columns = defaultColumns,
  socials = [
    { label: "Acme website", href: "#", icon: <Globe /> },
    { label: "Email Acme", href: "#", icon: <Mail /> },
    { label: "Acme RSS feed", href: "#", icon: <Rss /> },
  ],
  status = { label: "All systems operational", href: "#", tone: "online" },
  legal = "© 2026 Acme, Inc. All rights reserved.",
  legalLinks = [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }, { label: "Cookies", href: "#" }],
  wordmark,
  className,
  ...props
}: Footer2Props) {
  const word = wordmark ?? brand
  // Size the word so it spans the footer: roughly 0.56em per character in a bold sans.
  const fontSize = `min(${(96 / (Math.max(word.length, 1) * 0.74)).toFixed(2)}cqw, 40rem)`
  return (
    <footer data-slot="footer-2" className={cn("relative overflow-hidden border-t", className)} {...props}>
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div>
            <a href="#" className="focus-visible:ring-ring/50 rounded-md text-xl font-semibold tracking-tight outline-none focus-visible:ring-[3px]">{brand}</a>
            <p className="text-muted-foreground mt-3 max-w-xs text-sm leading-relaxed text-pretty">{tagline}</p>
            {status && (
              <a href={status.href} className="hover:bg-accent focus-visible:ring-ring/50 mt-6 inline-flex rounded-full border px-3 py-1.5 outline-none transition-colors focus-visible:ring-[3px]">
                <StatusDot status={status.tone ?? "online"} label={status.label} pulse className="text-xs" />
              </a>
            )}
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((c) => (
              <div key={c.title}>
                <h2 className="text-sm font-semibold">{c.title}</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-sm outline-none transition-colors focus-visible:ring-[3px]">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <p>{legal}</p>
            <ul className="flex gap-4">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-foreground focus-visible:ring-ring/50 rounded-sm outline-none transition-colors focus-visible:ring-[3px]">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          {socials.length > 0 && (
            <ul className="flex gap-1">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} aria-label={s.label} className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 flex size-9 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-[3px] [&_svg]:size-4.5">
                    {s.icon ?? <Globe />}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div aria-hidden="true" className="@container mt-6 select-none">
        <div
          className="mx-auto max-w-[90rem] overflow-hidden bg-gradient-to-b from-foreground/90 to-foreground/5 bg-clip-text text-center leading-[0.82] font-semibold tracking-[-0.06em] whitespace-nowrap text-transparent [-webkit-background-clip:text]"
          style={{ fontSize, height: "0.58em" }}
        >
          {word}
        </div>
      </div>
    </footer>
  )
}

export { Footer2, type Footer2Props, type Footer2Column, type Footer2Link, type Footer2Social }
