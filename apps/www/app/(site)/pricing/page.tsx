import { Check, Minus } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/site/link"

import { Button } from "@/components/ballmac/button"
import { Eyebrow } from "@/components/site/section-heading"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Ballmac UI's components, blocks and templates are free to use. Ballmac UI Pro adds premium blocks, templates and SaaS starter apps.",
  alternates: { canonical: "/pricing" },
}

const checkout = process.env.NEXT_PUBLIC_PRO_CHECKOUT_URL
const teamCheckout = process.env.NEXT_PUBLIC_PRO_TEAM_CHECKOUT_URL
const proPrice = process.env.NEXT_PUBLIC_PRO_PRICE
const teamPrice = process.env.NEXT_PUBLIC_PRO_TEAM_PRICE
const licenseUrl = process.env.NEXT_PUBLIC_PRO_LICENSE_URL
// Prices and plans appear only when the owner has set them in the environment.
const onSale = Boolean(checkout && proPrice)
const teamOnSale = Boolean(onSale && teamCheckout && teamPrice)

type Plan = { name: string; price: string; note: string; cta: { label: string; href: string; external: boolean } | null; features: [boolean, string][] }

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    note: "Free forever.",
    cta: { label: "Browse components", href: "/components", external: false },
    features: [
      [true, "Every free component, block and template"],
      [true, "shadcn CLI and MCP installs"],
      [true, "Commercial use, no attribution in your UI"],
      [true, "Source you own and can change"],
      [false, "Premium blocks and templates"],
      [false, "SaaS starter apps"],
    ],
  },
  {
    name: "Pro",
    price: onSale ? `$${proPrice}` : "Soon",
    note: onSale ? "One licence for one person." : "Premium blocks for the shadcn CLI.",
    cta: onSale ? { label: "Get Pro", href: checkout!, external: true } : null,
    features: [
      [true, "Everything in Free"],
      [true, "150 premium blocks: heroes, features, pricing, dashboards, app screens, ecommerce, content and more"],
      [true, "Private registry for the shadcn CLI and MCP"],
      [true, "Light, dark and RTL support on every block"],
      [true, "Two starter apps: Beacon SaaS (teams, Stripe billing, dashboard) and Quire (an AI assistant that cites its sources)"],
      [true, "Figma design tokens for every theme"],
      [false, "More starter apps (planned)"],
      [false, "Figma component library (planned)"],
    ],
  },
  ...(teamOnSale
    ? ([
        {
          name: "Team",
          price: `$${teamPrice}`,
          note: "For teams that share one licence.",
          cta: { label: "Get Team", href: teamCheckout!, external: true },
          features: [
            [true, "Everything in Pro"] as [boolean, string],
            [true, "One key for CI and shared environments"],
          ],
        },
      ] satisfies Plan[])
    : []),
]

const faqs = [
  { q: "Is the free tier really free for commercial work?", a: "Yes. Use free items in personal, client and commercial projects, and change them however you like. The license notice stays in the source files." },
  { q: "Will free components become paid?", a: "No. Anything released as free stays free. Pro adds new premium items; it doesn't take any away." },
  { q: "How does Pro work with the CLI?", a: "Add your licence key once as an environment variable and the @ballmac-pro registry to components.json. The shadcn CLI and the MCP server then install Pro items the same way as free ones. The Pro guide walks through it." },
  ...(licenseUrl ? [{ q: "What can I do with a Pro licence?", a: `The Pro licence terms are published at ${licenseUrl}. Read them before you buy.` }] : []),
  { q: "Who handles tax and invoices?", a: "Our payment provider acts as the merchant of record: it charges the right sales tax or VAT and sends you an invoice." },
]

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
      <header className="mx-auto max-w-2xl space-y-4 text-center">
        <div className="flex justify-center">
          <Eyebrow>Pricing</Eyebrow>
        </div>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Free to build with. Pro when you want more.</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          The core library is free for any project. Pro adds premium blocks, templates and complete SaaS starters.
        </p>
      </header>
      <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-[repeat(var(--plans),minmax(0,1fr))]" style={{ "--plans": plans.length } as React.CSSProperties}>
        {plans.map((plan) => {
          const pro = plan.name === "Pro"
          return (
            <div key={plan.name} className={pro ? "bg-foreground text-background flex flex-col rounded-2xl p-8" : "bg-card flex flex-col rounded-2xl border p-8"}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                {pro && !onSale && <span className="rounded-full border border-current/20 px-2 py-0.5 text-xs font-medium opacity-80">Coming soon</span>}
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
                <Button asChild size="lg" shape="pill" variant={pro ? "secondary" : "outline"} className="mt-8">
                  {plan.cta.external ? <a href={plan.cta.href}>{plan.cta.label}</a> : <Link href={plan.cta.href}>{plan.cta.label}</Link>}
                </Button>
              ) : (
                <Button asChild size="lg" shape="pill" variant={pro ? "secondary" : "outline"} className="mt-8">
                  <a href="https://x.com/ballmacapps">Get launch news on X</a>
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
