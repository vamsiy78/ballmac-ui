// Ballmac UI: FAQ 2. https://ui.ballmac.com/blocks/faq-2
"use client"

import * as React from "react"
import { LifeBuoy, SearchX } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ballmac/accordion"
import { buttonVariants } from "@/components/ballmac/button"
import { SearchField } from "@/components/ballmac/search-field"
import { cn } from "@/lib/utils"

type Faq2Question = {
  /** The question. */
  question: string
  /** The answer, as plain text. */
  answer: string
}

type Faq2Category = {
  /** Category name. */
  name: string
  /** Questions in this category. */
  questions: Faq2Question[]
}

type Faq2Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Section heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** Question groups. An "All" filter is added in front. */
  categories?: Faq2Category[]
  /** Contact shown when nothing matches, and under the list. */
  support?: { label: string; href: string; text?: string } | null
  /** Placeholder for the search field. */
  searchPlaceholder?: string
}

const defaults: Faq2Category[] = [
  {
    name: "Billing",
    questions: [
      { question: "Can I change plans at any time?", answer: "Yes. Upgrades take effect immediately and we prorate the difference. Downgrades start at the end of your billing period." },
      { question: "Do you offer refunds?", answer: "If you are not happy within the first 30 days of a paid plan, email us and we will refund you in full, no questions asked." },
      { question: "Which payment methods do you accept?", answer: "All major credit and debit cards, plus invoices and bank transfer on annual Scale plans." },
      { question: "Is VAT included in the price?", answer: "Prices exclude taxes. VAT or sales tax is calculated at checkout based on your billing address." },
    ],
  },
  {
    name: "Security",
    questions: [
      { question: "Is my data encrypted?", answer: "Everything is encrypted in transit with TLS 1.3 and at rest with AES-256. Backups use separate keys." },
      { question: "Do you support single sign-on?", answer: "SAML SSO and SCIM provisioning are available on Pro and Scale plans and work with Okta, Entra ID and Google Workspace." },
      { question: "Where is my data stored?", answer: "You choose a region when you create a workspace: United States, European Union or United Kingdom. Data stays in that region." },
    ],
  },
  {
    name: "Product",
    questions: [
      { question: "How do I import data from another tool?", answer: "Use the import wizard in Settings to upload a CSV or connect your old account. Most teams finish in under an hour." },
      { question: "Is there an API?", answer: "Yes. Every action in the app is available through a REST API and webhooks, with official SDKs for TypeScript, Python and Go." },
      { question: "Can I invite people outside my company?", answer: "Guests can view and comment on shared items without taking a paid seat. Pro includes 50 guests and Scale is unlimited." },
    ],
  },
]

function highlight(text: string, query: string) {
  const q = query.trim()
  if (!q) return text
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"))
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="bg-chart-3/30 text-foreground rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

function Faq2({
  title = "Questions, answered.",
  description = "Search the list or pick a topic. Still stuck? We reply within a day.",
  categories = defaults,
  support = { label: "Contact support", href: "#", text: "Can’t find what you need?" },
  searchPlaceholder = "Search questions",
  className,
  ...props
}: Faq2Props) {
  const [category, setCategory] = React.useState("All")
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()

  const visible = categories
    .filter((c) => category === "All" || c.name === category)
    .flatMap((c) => c.questions.map((item) => ({ ...item, category: c.name })))
    .filter((item) => !q || item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q))
  const names = ["All", ...categories.map((c) => c.name)]
  const total = categories.reduce((n, c) => n + c.questions.length, 0)

  return (
    <section data-slot="faq-2" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="grid gap-10 lg:grid-cols-[20rem_1fr] lg:gap-16">
        <div className="min-w-0">
          <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">{title}</h2>
          <p className="text-muted-foreground mt-4 text-pretty">{description}</p>
          <SearchField className="mt-6" label="Search questions" placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          <div role="group" aria-label="Topics" className="mt-5 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:overflow-visible">
            {names.map((name) => {
              const on = category === name
              const n = name === "All" ? total : (categories.find((c) => c.name === name)?.questions.length ?? 0)
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCategory(name)}
                  className={cn(
                    "focus-visible:ring-ring/50 flex h-9 shrink-0 items-center justify-between gap-3 rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] lg:rounded-xl",
                    on ? "bg-foreground text-background border-transparent" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {name}
                  <span className={cn("text-xs tabular-nums", on ? "text-background/70" : "text-muted-foreground")}>{n}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="min-w-0">
          <p role="status" className="sr-only">
            {visible.length === 0 ? "No questions match your search." : `${visible.length} ${visible.length === 1 ? "question" : "questions"} shown.`}
          </p>
          {visible.length > 0 ? (
            <Accordion type="single" collapsible className="divide-y rounded-2xl border px-5 sm:px-6">
              {visible.map((item) => (
                <AccordionItem key={item.question} value={item.question} className="border-b-0">
                  <AccordionTrigger className="py-5 text-base">
                    <span className="flex flex-col items-start gap-1 text-start">
                      {category === "All" && <span className="text-muted-foreground text-xs font-normal">{item.category}</span>}
                      {highlight(item.question, query)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed text-pretty">{highlight(item.answer, query)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center">
              <span className="bg-muted flex size-12 items-center justify-center rounded-full"><SearchX className="size-5" aria-hidden="true" /></span>
              <p className="mt-4 font-semibold">No answers found</p>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">Nothing matches “{query}”. Try a shorter word, or ask us directly.</p>
              <button type="button" onClick={() => { setQuery(""); setCategory("All") }} className={buttonVariants({ variant: "outline", size: "sm", shape: "pill", className: "mt-5" })}>
                Reset filters
              </button>
            </div>
          )}
          {support && (
            <div className="bg-muted/40 mt-6 flex flex-col items-start gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2.5 text-sm">
                <LifeBuoy className="text-muted-foreground size-4" aria-hidden="true" />
                {support.text ?? "Still have questions?"}
              </p>
              <a href={support.href} className={buttonVariants({ variant: "outline", size: "sm", shape: "pill" })}>{support.label}</a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export { Faq2, type Faq2Props, type Faq2Category, type Faq2Question }
