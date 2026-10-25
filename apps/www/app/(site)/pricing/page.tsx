import { Check, Clock, Lock, Mail, Minus, ShieldCheck, Users, Vote } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/site/link"

import { Button } from "@/components/ballmac/button"
import { BuildCost } from "@/components/pro/build-cost"
import { CheckoutLink } from "@/components/pro/checkout-link"
import { ProofWall } from "@/components/pro/proof-wall"
import { EmailForm } from "@/components/site/email-form"
import { FoundingBanner } from "@/components/site/founding-banner"
import { FoundingCountdown } from "@/components/site/founding-countdown"
import { PageCard } from "@/components/site/page-card"
import { Eyebrow } from "@/components/site/section-heading"
import { Sampler } from "@/components/site/sampler"
import { endsLabel } from "@/lib/founding"
import { FOUNDERS_EMAIL } from "@/lib/founders"
import { getOffer } from "@/lib/offer"
import { PRO_LICENCE_PATH } from "@/lib/pro-licence"
import { REFUND_PATH, REFUND_PROMISE } from "@/lib/pro-refund"
import { JsonLd } from "@/components/site/json-ld"
import { faqPage, proProduct } from "@/lib/schema"
import { TEAM_CHECKOUT, TEAM_PRICE, TEAM_SEATS, teamPerSeat } from "@/lib/pro-team"
import { blockGroups, getBlocks, getItem, isPro } from "@/lib/registry"
import { SAMPLER_BLOCKS } from "@/lib/sampler"
import { thumbFor } from "@/lib/thumbs"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Ballmac UI's components, blocks and templates are free to use. Ballmac UI Pro adds 150 finished app blocks, a private registry and Figma tokens.",
  alternates: { canonical: "/pricing" },
}


const licenseUrl = process.env.NEXT_PUBLIC_PRO_LICENSE_URL || PRO_LICENCE_PATH
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
  // The Team plan is always shown. Until its Dodo product exists (NEXT_PUBLIC_PRO_TEAM_CHECKOUT_URL), the button writes to us instead.
  const teamOnSale = Boolean(onSale && TEAM_CHECKOUT)
  const save = f?.listPrice ? Number(f.listPrice) - Number(f.price) : 0
  const deadline = f?.endsAt ? endsLabel(f.endsAt) : null

  // Only blocks that exist in this build, with a captured thumbnail.
  const previews = PREVIEWS.map((n) => getItem(n)).filter((i): i is NonNullable<typeof i> => Boolean(i && isPro(i) && thumbFor(i.name, "pro")))
  const sampler = SAMPLER_BLOCKS.map((n) => getItem(n)).filter((i): i is NonNullable<typeof i> => Boolean(i && isPro(i)))

  // Free and Pro side by side, from the real catalogue: how many blocks of each kind exist in each tier.
  const all = getBlocks()
  const rows = blockGroups
    .map((g) => {
      const inGroup = all.filter((b) => (g.categories as readonly string[]).includes(b.blockCategory ?? ""))
      return { label: g.label, free: inGroup.filter((b) => !isPro(b)).length, pro: inGroup.filter(isPro).length }
    })
    .filter((r) => r.pro > r.free)

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
        [true, "Loading, empty and error states built into blocks that show data"],
        [true, "Light, dark and RTL support on every block"],
        [true, "Figma design tokens for every theme"],
        [true, "Three starter apps: Beacon (SaaS with teams, Stripe billing and a dashboard), Quire (an AI assistant that cites its sources) and Cove (a desktop notes app)"],
        [false, "More starter apps (planned)"],
        [false, "Figma component library (planned)"],
      ],
    },
    {
      name: "Team",
      price: `$${TEAM_PRICE}`,
      note: `One licence for one organisation and up to ${TEAM_SEATS} people: $${teamPerSeat()} a person.`,
      cta: teamOnSale
        ? { label: `Get Team for $${TEAM_PRICE}`, href: TEAM_CHECKOUT, external: true }
        : { label: "Get Team by email", href: `mailto:${FOUNDERS_EMAIL}?subject=${encodeURIComponent("Team licence for Ballmac UI Pro")}`, external: false },
      features: [
        [true, "Everything in Pro"],
        [true, `Up to ${TEAM_SEATS} named people at one organisation on one licence`],
        [true, "One licence key for the whole team and your CI"],
        [true, "Your company name and tax ID on the invoice"],
        [true, "Every future update included"],
        [false, `More than ${TEAM_SEATS} people: write to us`],
      ],
    },
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
    {
      q: "What can I do with a Pro licence?",
      a: (
        <>
          Build any number of apps and sites with it, for yourself or your clients, and change the code. You cannot resell, share or publish the Pro source, share your key, build a competing library or starter from it, or use it to train AI models. One Pro licence is one person; a Team licence covers up to 10 people at one organisation. Read the full{" "}
          <a href={licenseUrl} className="text-foreground underline underline-offset-4">Pro licence agreement</a> before you buy.
        </>
      ),
    },
    { q: "Who handles tax and invoices?", a: "The price already includes tax. Our payment provider acts as the merchant of record: it handles the sales tax or VAT and sends you an invoice. Add a business name or tax ID at checkout if you need one on it." },
    {
      q: "What if it does not work, or I am charged wrongly?",
      a: (
        <>
          {REFUND_PROMISE} Mistakes on our side, such as a double charge, are always refunded. Write to {FOUNDERS_EMAIL} and see the full <a href={REFUND_PATH} className="text-foreground underline underline-offset-4">Refund Policy</a>.
        </>
      ),
    },
    { q: "How does the Team plan work?", a: `One Team licence is for one organisation and up to ${TEAM_SEATS} named people, for $${TEAM_PRICE} once ($${teamPerSeat()} each). Everyone uses the same licence key and private registry, and the invoice can carry your company name and tax ID. Need more than ${TEAM_SEATS}? Email ${FOUNDERS_EMAIL}.` },
  ]

  return (
    <>
      <JsonLd graph={[...(onSale ? [proProduct({ path: "/pricing", description: "Finished app blocks, starter apps, a private shadcn registry and Figma tokens for React and Tailwind. Pay once, every future Pro update included.", pro: { price: String(offer.price), url: offer.checkout ?? undefined }, team: { price: TEAM_PRICE, seats: TEAM_SEATS } })] : []), faqPage(faqs.flatMap((x) => (typeof x.a === "string" ? [{ q: x.q, text: x.a }] : [])))]} />
      {f && <FoundingBanner offer={f} at={now.getTime()} href="#plans" />}
      <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
        <header className="mx-auto max-w-2xl space-y-4 text-center">
          <div className="flex justify-center">
            <Eyebrow>Pricing</Eyebrow>
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">The screens your app needs, finished. Pay once.</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">The core library is free for any project. Pro adds {proBlocks} finished screens, a private registry and Figma tokens, so you spend the week on your product.</p>
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

        <div id="plans" className="mt-12 grid scroll-mt-20 grid-cols-1 gap-5 lg:grid-cols-[repeat(var(--plans),minmax(0,1fr))] lg:items-stretch" style={{ "--plans": plans.length } as React.CSSProperties}>
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
                    {plan.cta.external ? <CheckoutLink href={plan.cta.href} plan={plan.name === "Team" ? "team" : "pro"}>{plan.cta.label}</CheckoutLink> : plan.cta.href.startsWith("mailto:") ? <a href={plan.cta.href}>{plan.cta.label}</a> : <Link href={plan.cta.href}>{plan.cta.label}</Link>}
                  </Button>
                ) : (
                  <Button asChild size="lg" shape="pill" variant={pro ? "secondary" : "outline"} className="mt-8">
                    <a href="https://x.com/ballmacapps">Get launch news on X</a>
                  </Button>
                )}
                {pro && onSale && (
                  <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs opacity-75">
                    <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
                    Tax is included. Your invoice is sent for you.
                  </p>
                )}
                {pro && onSale && (
                  <p className="mt-2 text-center text-xs opacity-70">
                    {REFUND_PROMISE} <a href={REFUND_PATH} className="underline underline-offset-2">Refund policy</a>. By buying you agree to the <a href={licenseUrl} className="underline underline-offset-2">Pro licence</a>.
                  </p>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-muted-foreground mt-8 text-center text-sm">
          Already have a licence?{" "}
          <Link href="/pro/login" className="text-foreground font-medium underline underline-offset-4">
            Log in to your Pro library
          </Link>
        </p>

        <aside aria-labelledby="guarantee-h" className="bg-card mx-auto mt-12 flex max-w-3xl items-start gap-4 rounded-2xl border p-5 sm:p-6">
          <span className="bg-foreground text-background flex size-10 shrink-0 items-center justify-center rounded-xl" aria-hidden="true">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 id="guarantee-h" className="font-semibold tracking-tight">Works as described, or your money back</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {REFUND_PROMISE.replace("Works as described, or your money back: ", "")} Mistakes on our side are always refunded.{" "}
              <Link href={REFUND_PATH} className="text-foreground underline underline-offset-4">Read the refund policy</Link>.
            </p>
          </div>
        </aside>

        <section aria-labelledby="cost-h" className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="cost-h" className="text-3xl font-semibold tracking-[-0.03em] text-balance">What would it cost to build these yourself?</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">Polished states, dark mode, keyboard support and motion take time. Put in your own numbers.</p>
          </div>
          <BuildCost
            className="mt-10"
            price={Number(offer.price) || 99}
            action={
              onSale && offer.checkout ? (
                <Button asChild size="lg" shape="pill">
                  <CheckoutLink href={offer.checkout}>{f ? `Get Pro for $${f.price}` : `Get Pro for $${offer.price}`}</CheckoutLink>
                </Button>
              ) : null
            }
          />
        </section>

        <ProofWall className="mt-24" />

        <section aria-labelledby="compare-h" className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="compare-h" className="text-3xl font-semibold tracking-[-0.03em] text-balance">
              Which one is for what
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Free covers components, marketing pages and a starter set of app screens. Pro goes much deeper in every area, and adds whole apps to start from.
            </p>
          </div>
          <div className="focus-visible:ring-ring/50 mt-10 overflow-x-auto rounded-2xl border outline-none focus-visible:ring-[3px]" role="region" aria-label="Free and Pro compared" tabIndex={0}>
            <table className="w-full min-w-[560px] border-collapse text-start text-sm">
              <caption className="sr-only">Free and Pro compared</caption>
              <thead>
                <tr className="bg-muted/40 border-b text-start">
                  <th scope="col" className="px-5 py-4 font-medium">What you get</th>
                  <th scope="col" className="px-5 py-4 font-medium">Free</th>
                  <th scope="col" className="px-5 py-4 font-medium">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <th scope="row" className="px-5 py-3.5 text-start font-normal">Components, with live previews and keyboard support</th>
                  <td className="px-5 py-3.5"><Check className="size-4" aria-label="Included" /></td>
                  <td className="px-5 py-3.5"><Check className="size-4" aria-label="Included" /></td>
                </tr>
                {rows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row" className="px-5 py-3.5 text-start font-normal">{r.label} blocks</th>
                    <td className="text-muted-foreground px-5 py-3.5 tabular-nums">{r.free > 0 ? r.free : <Minus className="size-4" aria-label="None" />}</td>
                    <td className="px-5 py-3.5 font-medium tabular-nums">{r.pro > 0 ? r.pro : <Minus className="text-muted-foreground size-4" aria-label="None" />}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="px-5 py-3.5 text-start font-normal">Complete starter apps (SaaS, AI assistant, desktop)</th>
                  <td className="px-5 py-3.5"><Minus className="text-muted-foreground size-4" aria-label="Not included" /></td>
                  <td className="px-5 py-3.5 font-medium">3</td>
                </tr>
                <tr>
                  <th scope="row" className="px-5 py-3.5 text-start font-normal">Loading, empty and error states in blocks that show data</th>
                  <td className="px-5 py-3.5"><Check className="size-4" aria-label="Included" /></td>
                  <td className="px-5 py-3.5"><Check className="size-4" aria-label="Included" /></td>
                </tr>
                <tr>
                  <th scope="row" className="px-5 py-3.5 text-start font-normal">Install with the shadcn CLI and the MCP server</th>
                  <td className="px-5 py-3.5"><Check className="size-4" aria-label="Included" /></td>
                  <td className="px-5 py-3.5"><Check className="size-4" aria-label="Included" /></td>
                </tr>
                <tr>
                  <th scope="row" className="px-5 py-3.5 text-start font-normal">Updates that merge into your edited files (ballmac update)</th>
                  <td className="px-5 py-3.5"><Check className="size-4" aria-label="Included" /></td>
                  <td className="px-5 py-3.5"><Check className="size-4" aria-label="Included" /></td>
                </tr>
                <tr>
                  <th scope="row" className="px-5 py-3.5 text-start font-normal">Quality scorecards, and ballmac check for your own app</th>
                  <td className="px-5 py-3.5"><Check className="size-4" aria-label="Included" /></td>
                  <td className="px-5 py-3.5"><Check className="size-4" aria-label="Included" /></td>
                </tr>
                <tr>
                  <th scope="row" className="px-5 py-3.5 text-start font-normal">Private registry with your licence key</th>
                  <td className="px-5 py-3.5"><Minus className="text-muted-foreground size-4" aria-label="Not included" /></td>
                  <td className="px-5 py-3.5"><Check className="size-4" aria-label="Included" /></td>
                </tr>
                <tr>
                  <th scope="row" className="px-5 py-3.5 text-start font-normal">Figma design tokens for every theme</th>
                  <td className="px-5 py-3.5"><Minus className="text-muted-foreground size-4" aria-label="Not included" /></td>
                  <td className="px-5 py-3.5"><Check className="size-4" aria-label="Included" /></td>
                </tr>
                <tr>
                  <th scope="row" className="px-5 py-3.5 text-start font-normal">Updates</th>
                  <td className="text-muted-foreground px-5 py-3.5">Free stays free</td>
                  <td className="px-5 py-3.5 font-medium">Every future Pro update</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/pro?utm_source=ballmac-ui&utm_medium=pricing&utm_campaign=compare" className="text-foreground text-sm font-medium underline underline-offset-4">
              See everything in Pro
            </Link>
          </div>
        </section>

        {previews.length > 0 && (
          <section aria-labelledby="inside-h" className="mt-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="inside-h" className="text-3xl font-semibold tracking-[-0.03em] text-balance">
                See what is inside before you decide
              </h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">Six of the {proBlocks} Pro blocks. Each opens as a full page you can look around.</p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
            <dl className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                [Lock, "Your price is locked", `Pay $${f.price} once. Every future Pro update is included for your key: new blocks, fixes and new starter apps. Separately sold products are not covered.`],
                [Users, "Your name on the Founders page", "Optional. Ask from the Founders desk in your Pro library and we add you by hand."],
                [Vote, "A vote on what we build next", "Founding members pick the next batch of blocks from a short list."],
                [Mail, "A direct line", `Write to ${FOUNDERS_EMAIL} with “Founding member” in the subject. It reaches a person.`],
              ].map(([Icon, t, d]) => {
                const I = Icon as typeof Lock
                return (
                  <div key={t as string} className="bg-card flex gap-4 rounded-2xl border p-5 sm:p-6">
                    <span className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                      <I className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <dt className="font-semibold tracking-tight">{t as string}</dt>
                      <dd className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">{d as string}</dd>
                    </div>
                  </div>
                )
              })}
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
              <p className="text-muted-foreground mt-3 leading-relaxed">Real Pro blocks, yours to use in any project. Leave your email and they appear right here, ready to copy.</p>
              <ul className="mt-6 flex flex-wrap justify-center gap-2" aria-label="The three blocks">
                {sampler.map((x) => {
                  const [name, what] = (x.title ?? x.name).split(/:\s*/)
                  return (
                    <li key={x.name} className="bg-card rounded-full border px-3.5 py-1.5 text-sm">
                      <span className="font-medium">{name}</span>
                      {what && <span className="text-muted-foreground"> · {what}</span>}
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="bg-card mt-8 rounded-2xl border p-5 shadow-xs sm:p-8">
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

        <section aria-labelledby="hire-h" className="bg-card mx-auto mt-20 max-w-3xl rounded-2xl border p-6 sm:p-8">
          <h2 id="hire-h" className="text-xl font-semibold tracking-tight">
            Rather have it built for you?
          </h2>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            The studio behind Ballmac UI takes on a few client projects at a time: a product UI built on these components, or a private
            registry with an MCP server for your own team. Fixed price in writing, and you own the code.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://ballmac.com/services?offer=ui&ref=ui-pricing#start"
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium outline-none focus-visible:ring-[3px]"
            >
              Hire us to build it
            </a>
            <a
              href="https://ballmac.com/services?ref=ui-pricing"
              className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-10 items-center rounded-full border px-5 text-sm font-medium outline-none focus-visible:ring-[3px]"
            >
              See services and prices
            </a>
          </div>
        </section>

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
