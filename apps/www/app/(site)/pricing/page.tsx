import { Check, Minus } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ballmac/button"
import { Eyebrow } from "@/components/site/section-heading"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Ballmac UI's components, blocks and templates are free and MIT licensed. Ballmac UI Pro, with premium blocks and templates, is coming.",
  alternates: { canonical: "/pricing" },
}

const plans = [
  {
    name: "Free",
    price: "$0",
    note: "MIT licensed, forever.",
    cta: { label: "Browse components", href: "/components" },
    features: [
      [true, "Every free component, block and template"],
      [true, "shadcn CLI and MCP installs"],
      [true, "Commercial use, no attribution in your UI"],
      [true, "Source you own and can change"],
      [false, "Premium blocks and templates"],
      [false, "Priority requests"],
    ],
  },
  {
    name: "Pro",
    price: "Soon",
    note: "One-time purchase, lifetime updates.",
    cta: null,
    features: [
      [true, "Everything in Free"],
      [true, "Premium blocks and full templates"],
      [true, "Private registry access for the CLI and MCP"],
      [true, "Unlimited projects for you and your clients"],
      [true, "Priority requests"],
    ],
  },
] as const

const faqs = [
  { q: "Is the free tier really free for commercial work?", a: "Yes. Free items are MIT licensed. Use them in client work and commercial products; keep the license notice in the source files." },
  { q: "Will free components become paid?", a: "No. Anything released as free stays free. Pro adds new premium items; it doesn't take any away." },
  { q: "How will Pro work with the CLI?", a: "You'll add your license key once as an environment variable, and the shadcn CLI and MCP server will install Pro items the same way as free ones." },
]

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
      <header className="mx-auto max-w-2xl space-y-4 text-center">
        <div className="flex justify-center">
          <Eyebrow>Pricing</Eyebrow>
        </div>
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">Free to build with. Pro when you want more.</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          The core library is free and MIT licensed. Pro will add premium blocks and templates.
        </p>
      </header>
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {plans.map((plan) => {
          const pro = plan.name === "Pro"
          return (
            <div key={plan.name} className={pro ? "bg-foreground text-background flex flex-col rounded-2xl p-8" : "bg-card flex flex-col rounded-2xl border p-8"}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                {pro && <span className="font-mono text-[11px] tracking-[0.14em] uppercase opacity-70">Coming soon</span>}
              </div>
              <p className="mt-6 text-5xl font-semibold tracking-[-0.04em]">{plan.price}</p>
              <p className={pro ? "mt-2 opacity-70" : "text-muted-foreground mt-2"}>{plan.note}</p>
              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {plan.features.map(([on, label]) => (
                  <li key={label} className={on ? "flex gap-3" : "flex gap-3 opacity-60"}>
                    {on ? <Check className="mt-0.5 size-4 shrink-0" aria-label="Included" /> : <Minus className="mt-0.5 size-4 shrink-0" aria-label="Not included" />}
                    {label}
                  </li>
                ))}
              </ul>
              {plan.cta ? (
                <Button asChild size="lg" shape="pill" variant="outline" className="mt-8">
                  <Link href={plan.cta.href}>{plan.cta.label}</Link>
                </Button>
              ) : (
                <Button asChild size="lg" shape="pill" variant="secondary" className="mt-8">
                  <a href="https://x.com/ballmacapps">Follow @ballmacapps for launch news</a>
                </Button>
              )}
            </div>
          )
        })}
      </div>
      <section className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-xl font-semibold tracking-tight">Questions</h2>
        <dl className="mt-6 divide-y border-y">
          {faqs.map((f) => (
            <div key={f.q} className="py-5">
              <dt className="font-medium">{f.q}</dt>
              <dd className="text-muted-foreground mt-2 leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
