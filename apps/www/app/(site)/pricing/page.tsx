import { Check, Clock, Minus, ShieldCheck } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/site/link"

import { Button } from "@/components/ballmac/button"
import { CheckoutLink } from "@/components/pro/checkout-link"
import { EmailForm } from "@/components/site/email-form"
import { FoundingBanner } from "@/components/site/founding-banner"
import { FoundingCountdown } from "@/components/site/founding-countdown"
import { PageCard } from "@/components/site/page-card"
import { Eyebrow } from "@/components/site/section-heading"
import { Sampler } from "@/components/site/sampler"
import { endsLabel, leftPhrase } from "@/lib/founding"
import { FOUNDERS_EMAIL } from "@/lib/founders"
import { getOffer } from "@/lib/offer"
import { getBlocks, getItem, isPro } from "@/lib/registry"
import { SAMPLER_BLOCKS } from "@/lib/sampler"
import { thumbFor } from "@/lib/thumbs"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Ballmac UI's components, blocks and templates are free to use. Ballmac UI Pro adds 150 premium blocks and complete SaaS starter apps.",
  alternates: { canonical: "/pricing" },
}

// The founding price ends at a deadline, so the page is rebuilt every few minutes instead of once: the switch to the regular price reaches visitors without a redeploy.
export const revalidate = 300

const teamCheckout = process.env.NEXT_PUBLIC_PRO_TEAM_CHECKOUT_URL
const teamPrice = process.env.NEXT_PUBLIC_PRO_TEAM_PRICE
const licenseUrl = process.env.NEXT_PUBLIC_PRO_LICENSE_URL
// The number of Pro blocks comes from the registry when Pro is part of this build.
const proBlocks = getBlocks().filter(isPro).length || 150
// A spread of what Pro holds, chosen for range: an analytics dashboard, a command-palette hero, a calendar, a product listing, a mail client and a kanban board.
const PREVIEWS = ["dashboard-pro-1", "hero-pro-3", "calendar-pro-1", "ecommerce-pro-1", "mail-pro-1", "kanban-pro-1"]

type Plan = { name: string; price: string; was?: string; save?: string; note: string; cta: { label: string; href: string; external: boolean } | null; features: [boolean, string][] }

const money = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2))

export default async function PricingPage() {
  const now = new Date()
  const offer = await getOffer(now)
  const f = offer.founding
  const onSale = offer.onSale
  const teamOnSale = Boolean(onSale && teamCheckout && teamPrice)
  const save = f?.listPrice ? Number(f.listPrice) - Number(f.price) : 0
  const deadline = f?.endsAt ? endsLabel(f.endsAt) : null

  // Only blocks that exist in this build, with a captured thumbnail.
  const previews = PREVIEWS.map((n) => getItem(n)).filter((i): i is NonNullable<typeof i> => Boolean(i && isPro(i) && thumbFor(i.name, "pro")))
  const sampler = SAMPLER_BLOCKS.map((n) => getItem(n)).filter((i): i is NonNullable<typeof i> => Boolean(i && isPro(i)))

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
        [false, "Premium blocks"],
        [false, "SaaS starter apps"],
      ],
    },
    {
      name: "Pro",
      price: onSale ? `$${offer.price}` : "Soon",
      was: f?.listPrice ? `$${f.listPrice}` : undefined,
      save: save > 0 ? `Save $${money(save)}` : undefined,
      note: onSale
        ? f
          ? `One licence for one person. Founding price for the first ${f.limit} buyers${deadline ? `, until ${deadline}` : ""}.`
          : "One licence for one person."
        : "Premium blocks for the shadcn CLI.",
      cta: onSale ? { label: f ? `Get Pro for $${f.price}` : "Get Pro", href: offer.checkout!, external: true } : null,
      features: [
        [true, "Everything in Free"],
        [true, `${proBlocks} premium blocks: heroes, features, pricing, dashboards, app screens, ecommerce, content and more`],
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
    ...(f
      ? [
          {
            q: "What does the founding price include?",
            a: `You pay $${f.price} once. Every future update to Ballmac UI Pro is included for your licence key: new blocks, fixes, and new starter apps added to Pro. Separately sold products are not covered. Founding members can also vote on the next blocks, ask to be listed on the Founders page, and write to ${FOUNDERS_EMAIL} directly.`,
          },
          {
            q: "What happens when the founding price ends?",
            a: `${deadline ? `It ends ${deadline}, or earlier if all ${f.limit} founding licences are taken. ` : `It ends when all ${f.limit} founding licences are taken. `}${f.listPrice ? `After that, new buyers pay $${f.listPrice}.` : "After that, new buyers pay the regular price."} Founding licences keep their updates.`,
          },
        ]
      : []),
    { q: "Is the free tier really free for commercial work?", a: "Yes. Use free items in personal, client and commercial projects, and change them however you like. The license notice stays in the source files." },
    { q: "Will free components become paid?", a: "No. Anything released as free stays free. Pro adds new premium items; it doesn't take any away." },
    { q: "I bought Pro. How do I get my code?", a: "Open the Pro log in page and paste the licence key from your purchase email. There is no account to create: the key is the login. You can then read and copy any Pro block, download the starter apps, and get install commands with your key filled in. The shadcn CLI and the MCP server work with the same key." },
    { q: "How does Pro work with the CLI?", a: "Add your licence key once as an environment variable and the @ballmac-pro registry to components.json. The shadcn CLI and the MCP server then install Pro items the same way as free ones. The Pro guide walks through it." },
    ...(licenseUrl ? [{ q: "What can I do with a Pro licence?", a: `The Pro licence terms are published at ${licenseUrl}. Read them before you buy.` }] : []),
    { q: "Who handles tax and invoices?", a: "Our payment provider acts as the merchant of record: it charges the right sales tax or VAT and sends you an invoice." },
  ]

  return (
    <>
      {f && <FoundingBanner offer={f} phrase={f.endsAt ? leftPhrase(f.endsAt, now) : null} href="#plans" />}
      <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
        <header className="mx-auto max-w-2xl space-y-4 text-center">
          <div className="flex justify-center">
            <Eyebrow>Pricing</Eyebrow>
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Free to build with. Pro when you want more.</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">The core library is free for any project. Pro adds {proBlocks} premium blocks and complete SaaS starter apps.</p>
        </header>

        {f?.endsAt && (
          <section aria-label="Founding price deadline" className="bg-foreground text-background mx-auto mt-12 flex max-w-3xl flex-col items-center gap-5 rounded-2xl p-6 text-center sm:flex-row sm:justify-between sm:p-7 sm:text-start">
            <div className="space-y-1">
              <p className="flex items-center justify-center gap-2 text-sm font-medium opacity-80 sm:justify-start">
                <Clock className="size-4" aria-hidden="true" /> Founding price ends
              </p>
              <p className="text-lg font-semibold">{deadline}</p>
              <p className="text-sm opacity-70">
                ${f.price} now{f.listPrice ? `, then $${f.listPrice}` : ""}. Or earlier, if all {f.limit} founding licences are taken.
              </p>
            </div>
            <FoundingCountdown endsAt={f.endsAt} renderedAt={now.getTime()} />
          </section>
        )}

        <div id="plans" className="mt-12 grid scroll-mt-20 grid-cols-1 gap-5 lg:grid-cols-[repeat(var(--plans),minmax(0,1fr))]" style={{ "--plans": plans.length } as React.CSSProperties}>
          {plans.map((plan) => {
            const pro = plan.name === "Pro"
            return (
              <div key={plan.name} className={pro ? "bg-foreground text-background flex flex-col rounded-2xl p-8" : "bg-card flex flex-col rounded-2xl border p-8"}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{plan.name}</h2>
                  {pro && !onSale && <span className="rounded-full border border-current/20 px-2 py-0.5 text-xs font-medium opacity-80">Coming soon</span>}
                  {pro && onSale && f && <span className="rounded-full border border-current/25 px-2.5 py-0.5 text-xs font-medium">Founding price</span>}
                </div>
                <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {plan.was && (
                    <p className="text-2xl font-medium tracking-[-0.02em] line-through opacity-60">
                      <span className="sr-only">Regular price </span>
                      {plan.was}
                    </p>
                  )}
                  <p className="text-5xl font-semibold tracking-[-0.04em]">{plan.price}</p>
                  {plan.save && <span className="bg-background/15 rounded-full px-2.5 py-0.5 text-xs font-semibold">{plan.save}</span>}
                </div>
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
                    {plan.cta.external ? <CheckoutLink href={plan.cta.href}>{plan.cta.label}</CheckoutLink> : <Link href={plan.cta.href}>{plan.cta.label}</Link>}
                  </Button>
                ) : (
                  <Button asChild size="lg" shape="pill" variant={pro ? "secondary" : "outline"} className="mt-8">
                    <a href="https://x.com/ballmacapps">Get launch news on X</a>
                  </Button>
                )}
                {pro && onSale && (
                  <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs opacity-75">
                    <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
                    Tax and invoice handled for you.
                  </p>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-muted-foreground mt-8 text-center text-sm">
          Already have a licence?{" "}
          <Link href="/pro" className="text-foreground font-medium underline underline-offset-4">
            Log in to your Pro library
          </Link>
        </p>

        {previews.length > 0 && (
          <section aria-labelledby="inside-h" className="mt-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="inside-h" className="text-3xl font-semibold tracking-[-0.03em] text-balance">
                See what is inside before you decide
              </h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">A 40-second film, then six of the {proBlocks} Pro blocks. Each opens as a full page you can look around.</p>
            </div>
            <figure className="mx-auto mt-10 max-w-3xl">
              <video className="bg-muted aspect-video w-full rounded-2xl border" controls preload="none" playsInline poster="/media/ballmac-ui-explainer-poster.jpg">
                <source src="/media/ballmac-ui-explainer.mp4" type="video/mp4" />
                <track kind="captions" src="/media/ballmac-ui-explainer.en.vtt" srcLang="en" label="English" default />
                Your browser cannot play this video.
              </video>
              <figcaption className="text-muted-foreground mt-3 text-center text-sm">Why a web app feels native, and how Ballmac UI gets you there. Captions are on.</figcaption>
            </figure>
            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {previews.map((b) => (
                <PageCard key={b.name} href={`/blocks/${b.name}`} title={b.title} description={b.description} name={b.name} pro Preview={null} thumb={thumbFor(b.name, "pro")} />
              ))}
            </div>
          </section>
        )}

        {f && (
          <section aria-labelledby="founding-h" className="mt-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="founding-h" className="text-3xl font-semibold tracking-[-0.03em] text-balance">
                What founding members get
              </h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">Only the first {f.limit} licences. It costs us little, and it is yours for good.</p>
            </div>
            <dl className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                ["Your price is locked", `You pay $${f.price} once. Every future update to Pro is included for your key: new blocks, fixes and new starter apps added to Pro. Separately sold products are not covered.`],
                ["Your name on the Founders page", "If you want it. Ask from the Founders desk in your Pro library and we add you by hand."],
                ["A vote on what we build next", "Founding members choose the next batch of blocks from a short list."],
                ["A direct line", `Write to ${FOUNDERS_EMAIL} with “Founding member” in the subject. It reaches a person.`],
              ].map(([t, d]) => (
                <div key={t} className="bg-card rounded-2xl border p-6">
                  <dt className="font-semibold">{t}</dt>
                  <dd className="text-muted-foreground mt-2 text-sm leading-relaxed">{d}</dd>
                </div>
              ))}
            </dl>
            <p className="text-muted-foreground mt-6 text-center text-sm">
              See the <Link href="/founders" className="text-foreground underline underline-offset-4">Founders page</Link>.
            </p>
          </section>
        )}

        {sampler.length > 0 && (
          <section aria-labelledby="sampler-h" className="mx-auto mt-24 max-w-3xl">
            <div className="text-center">
              <h2 id="sampler-h" className="text-3xl font-semibold tracking-[-0.03em] text-balance">
                Try three Pro blocks free
              </h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {sampler.map((s) => s.title).join(", ")}. Leave your email and the source appears right here. Use it in any project.
              </p>
            </div>
            <div className="bg-card mt-8 rounded-2xl border p-6 sm:p-8">
              <Sampler reminders={Boolean(f?.endsAt)} />
            </div>
          </section>
        )}

        {f?.endsAt && (
          <section aria-labelledby="remind-h" className="mx-auto mt-20 max-w-xl text-center">
            <h2 id="remind-h" className="text-2xl font-semibold tracking-[-0.03em]">
              Not ready yet? We will remind you.
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">Two emails: about 72 hours and about 24 hours before the founding price ends. Then nothing more unless you buy.</p>
            <div className="mt-6 text-start">
              <EmailForm
                endpoint="/api/reminders"
                label="Email address for the two reminders"
                button="Remind me"
                doneMessage="Done. Check your inbox for a short confirmation."
                consent={`We use your address only for these two reminders about the offer ending ${deadline}. One click to unsubscribe.`}
              />
            </div>
          </section>
        )}

        <section className="mx-auto mt-20 max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight">Questions</h2>
          <dl className="mt-6 divide-y border-y">
            {faqs.map((x) => (
              <div key={x.q} className="py-5">
                <dt className="font-medium">{x.q}</dt>
                <dd className="text-muted-foreground mt-2 leading-relaxed">{x.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  )
}
