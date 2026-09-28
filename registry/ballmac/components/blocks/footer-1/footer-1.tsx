// Ballmac UI: Footer 1. https://ui.ballmac.com/blocks/footer-1
"use client"

import * as React from "react"

import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { cn } from "@/lib/utils"

type LinkGroup = { title: string; links: { label: string; href: string }[] }

type Footer1Props = React.ComponentProps<"footer"> & {
  /** Brand name or logo. */
  brand?: React.ReactNode
  /** One line under the brand. */
  tagline?: string
  /** Link columns. */
  groups?: LinkGroup[]
  /** Called with the email from the newsletter form. Omit to hide the form. */
  onSubscribe?: (email: string) => void
  /** Text in the bottom bar, e.g. copyright. */
  legal?: React.ReactNode
}

const defaults: LinkGroup[] = [
  { title: "Product", links: [{ label: "Features", href: "#" }, { label: "Pricing", href: "#" }, { label: "Changelog", href: "#" }] },
  { title: "Company", links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Careers", href: "#" }] },
  { title: "Resources", links: [{ label: "Docs", href: "#" }, { label: "Support", href: "#" }, { label: "Status", href: "#" }] },
  { title: "Legal", links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }] },
]

function Footer1({
  brand = "Acme",
  tagline = "Software for teams who ship.",
  groups = defaults,
  onSubscribe,
  legal = "© 2026 Acme, Inc. All rights reserved.",
  className,
  ...props
}: Footer1Props) {
  const id = React.useId()
  const [sent, setSent] = React.useState(false)
  return (
    <footer data-slot="footer-1" className={cn("border-t", className)} {...props}>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_2fr]">
        <div className="max-w-sm">
          <div className="text-lg font-semibold tracking-tight">{brand}</div>
          <p className="mt-2 text-sm text-muted-foreground">{tagline}</p>
          {onSubscribe && (
            <form
              className="mt-6 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                const email = new FormData(e.currentTarget).get("email")
                if (typeof email === "string" && email) {
                  onSubscribe(email)
                  setSent(true)
                }
              }}
            >
              <label htmlFor={`${id}-email`} className="sr-only">
                Email address
              </label>
              <Input id={`${id}-email`} name="email" type="email" required placeholder="you@company.com" autoComplete="email" />
              <Button type="submit">Subscribe</Button>
            </form>
          )}
          <p aria-live="polite" className="mt-2 text-sm text-muted-foreground">
            {sent ? "Thanks! Check your inbox to confirm." : ""}
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {groups.map((g) => (
            <div key={g.title}>
              <h2 className="text-sm font-medium">{g.title}</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="rounded-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">{legal}</p>
      </div>
    </footer>
  )
}

export { Footer1, type Footer1Props }
