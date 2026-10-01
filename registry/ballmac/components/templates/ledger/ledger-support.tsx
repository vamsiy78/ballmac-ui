// Ballmac UI: Ledger support page. https://ui.ballmac.com/templates/template-ledger
"use client"

import * as React from "react"
import { BookOpen, CreditCard, Keyboard, LifeBuoy, Mail, Search, Wrench } from "lucide-react"

import { Kbd } from "@/components/ballmac/kbd"
import { LedgerHeading, LedgerShell, type LedgerHrefs } from "@/components/ballmac/templates/ledger/ledger-theme"
import { cn } from "@/lib/utils"

const topics = [
  { icon: BookOpen, title: "Getting started", text: "Import your data, add a customer and send your first invoice.", articles: ["Import from a spreadsheet", "Your first invoice", "Set up iCloud sync"] },
  { icon: CreditCard, title: "Licenses and billing", text: "Activate, move or recover a license, and manage a subscription.", articles: ["Activate a license", "Move to a new Mac", "Update a payment method"] },
  { icon: Wrench, title: "Troubleshooting", text: "Fix sync conflicts, a stuck export or an app that won’t open.", articles: ["Sync says “paused”", "Rebuild the index", "Reset preferences"] },
  { icon: Keyboard, title: "Shortcuts and automation", text: "Every keyboard shortcut and a few AppleScript recipes.", articles: ["All keyboard shortcuts", "Shortcuts app actions", "AppleScript dictionary"] },
]

const shortcuts: [string, string[]][] = [
  ["New invoice", ["⌘", "N"]],
  ["Quick open", ["⌘", "K"]],
  ["Mark as paid", ["⌃", "⌘", "P"]],
  ["Export report", ["⇧", "⌘", "E"]],
  ["Toggle sidebar", ["⌥", "⌘", "S"]],
  ["Capture expense", ["⌃", "⌥", "N"]],
]

type LedgerSupportProps = React.ComponentProps<"div"> & { hrefs?: Partial<LedgerHrefs> }

/** Ledger support: a search field that filters help topics, shortcut cheat sheet and contact options. */
function LedgerSupport({ hrefs, ...props }: LedgerSupportProps) {
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const shown = q ? topics.filter((t) => [t.title, t.text, ...t.articles].join(" ").toLowerCase().includes(q)) : topics
  return (
    <LedgerShell page="support" hrefs={hrefs} {...props}>
      <main>
        <section className="px-4 pt-16 text-center sm:px-6 sm:pt-20">
          <LedgerHeading as="h1" className="text-4xl sm:text-6xl">How can we <em>help</em>?</LedgerHeading>
          <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mx-auto mt-8 max-w-xl">
            <label htmlFor="ledger-search" className="sr-only">Search help articles</label>
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" aria-hidden="true" />
            <input id="ledger-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search “license”, “sync”, “export”…" className="bg-card focus-visible:ring-ring/50 placeholder:text-muted-foreground h-13 w-full rounded-full border pr-5 pl-12 text-base shadow-sm outline-none focus-visible:ring-[3px]" />
          </form>
          <p className="text-muted-foreground mt-3 text-sm" role="status">{q ? `${shown.length} ${shown.length === 1 ? "topic" : "topics"} match “${query}”` : "Most questions are answered in under a minute."}</p>
        </section>

        <section aria-label="Help topics" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          {shown.length === 0 ? (
            <div className="bg-card rounded-3xl border p-10 text-center"><p className="font-medium">Nothing found</p><p className="text-muted-foreground mt-1 text-sm">Try a shorter word, or write to us below.</p></div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {shown.map((t) => (
                <li key={t.title} className="bg-card rounded-3xl border p-7">
                  <t.icon className="text-chart-1 size-6" aria-hidden="true" />
                  <h2 className="mt-4 text-xl font-semibold tracking-tight">{t.title}</h2>
                  <p className="text-muted-foreground mt-1.5 text-sm text-pretty">{t.text}</p>
                  <ul className="mt-5 divide-y border-t text-sm">
                    {t.articles.map((a) => <li key={a}><a href="#" className="hover:text-chart-1 flex items-center justify-between py-2.5 transition-colors">{a}<span aria-hidden="true">›</span></a></li>)}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="ledger-keys" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 id="ledger-keys" className="text-2xl font-semibold tracking-[-0.03em]">Shortcuts worth learning</h2>
          <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {shortcuts.map(([label, keys]) => (
              <li key={label} className="bg-card flex items-center justify-between px-5 py-4 text-sm">{label}<span className="flex gap-1">{keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</span></li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="ledger-contact" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <h2 id="ledger-contact" className="sr-only">Contact</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { icon: Mail, title: "Email us", text: "A person writes back, usually within a day.", cta: "support@ledger.app" },
              { icon: LifeBuoy, title: "System status", text: "iCloud sync and license servers are running normally.", cta: "All systems normal" },
            ].map((c) => (
              <div key={c.title} className={cn("bg-card flex items-start gap-4 rounded-3xl border p-6")}>
                <span className="bg-chart-1/12 text-chart-1 flex size-11 shrink-0 items-center justify-center rounded-2xl"><c.icon className="size-5" aria-hidden="true" /></span>
                <div><h3 className="font-semibold">{c.title}</h3><p className="text-muted-foreground mt-1 text-sm text-pretty">{c.text}</p><a href="#" className="text-chart-1 mt-3 inline-block text-sm font-medium underline underline-offset-4">{c.cta}</a></div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </LedgerShell>
  )
}

export { LedgerSupport, type LedgerSupportProps }
