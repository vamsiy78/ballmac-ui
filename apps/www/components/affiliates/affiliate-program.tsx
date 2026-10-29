"use client"

import * as React from "react"
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Link2,
  MousePointer2,
  Wallet,
  ShieldCheck,
  Sparkles,
  LoaderCircle,
} from "lucide-react"
import { WorkspaceNav } from "./workspace-nav"
import { Button, buttonVariants } from "@/components/ballmac/button"
import { Textarea } from "@/components/ballmac/textarea"
import { Input } from "@/components/ballmac/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ballmac/field"
import { Badge } from "@/components/ballmac/badge"
import { AFFILIATE, commissionCents, usd } from "@/lib/affiliates"

const faqs = [
  [
    "Who is this for?",
    "Developers, educators, newsletter writers and creators who help people build with React. You do not need a huge audience. A thoughtful recommendation to the right people matters more.",
  ],
  [
    "How does attribution work?",
    "Your personal link saves a first-party referral cookie for 30 days. The most recent valid partner link gets the credit. The buyer must complete checkout in that browser with cookies and JavaScript enabled. We never claim cross-device tracking.",
  ],
  [
    "What counts as an eligible sale?",
    "A completed purchase of regular-price Ballmac UI Pro through your referral checkout. Founding-price purchases are excluded. The 10% partner discount cannot be combined with another offer.",
  ],
  [
    "When do I get paid?",
    `Our monthly payout review window is the 1st–15th (UTC), covering the previous month’s eligible sales, with a ${usd(AFFILIATE.minimumPayout)} minimum. Smaller balances roll over. A supported payout method, any payment fees and required tax information are confirmed privately before your first transfer.`,
  ],
  [
    "What are the ground rules?",
    "Disclose your affiliate relationship clearly. No self-referrals, spam, misleading claims, coupon sites or ads bidding on Ballmac brand terms. If any part of a payment is reversed, that order’s commission is removed. Disputed payments are held for review; adjustments can reduce a future balance. Ballmac may pause accounts that breach these rules and update the program terms prospectively.",
  ],
] as const

export function AffiliateProgram({ productProof }: { productProof: React.ReactNode }) {
  const [sales, setSales] = React.useState(10)
  const [state, setState] = React.useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = React.useState("")
  const [acceptedTerms, setAcceptedTerms] = React.useState(false)
  async function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (!acceptedTerms || data.get("terms") !== "on") {
      setError("Please read and accept the program terms before applying.")
      return
    }
    setState("sending")
    setError("")
    try {
      const response = await fetch("/api/affiliates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          channel: data.get("channel"),
          promotionPlan: data.get("promotionPlan"),
          website: data.get("website"),
          terms: data.get("terms") === "on",
        }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? "Could not send your application. Please try again.")
      setState("sent")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.")
      setState("idle")
    }
  }
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-6 sm:px-8 sm:pt-8">
      <WorkspaceNav current="program" />
      <section
        className="relative grid gap-8 rounded-3xl border bg-muted/15 p-5 sm:p-8 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-12 md:p-12 md:py-16"
        aria-labelledby="affiliate-title"
      >
        <div className="relative flex flex-col items-start gap-7">
          <Badge variant="outline">
            <Sparkles className="size-3.5" aria-hidden="true" /> The Ballmac partner program
          </Badge>
          <h1
            id="affiliate-title"
            className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-6xl lg:text-[4.25rem]"
          >
            Recommend <span className="whitespace-nowrap">Ballmac UI.</span>
            <br />
            <span className="text-muted-foreground">Earn 30%.</span>
          </h1>
          <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
            Share the UI you would use yourself. Earn{" "}
            <strong className="text-foreground font-medium">30% on every eligible Pro sale.</strong> Give your
            audience 10% off.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#apply" className={buttonVariants({ size: "lg", shape: "pill" })}>
              Apply to become a partner{" "}
              <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </a>
            <a
              href="/affiliates/dashboard"
              className="text-sm font-medium underline underline-offset-4 focus-visible:outline-ring"
            >
              Partner dashboard
            </a>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 text-xs">
            <ShieldCheck className="size-4" aria-hidden="true" /> Free to join. No sales quota. A product you
            can stand behind.
          </p>
        </div>
        <div className="relative isolate py-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-primary/5 blur-3xl"
          />
          <div className="overflow-hidden rounded-2xl border bg-card shadow-xl shadow-black/5">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <span className="text-sm font-medium">A recommendation. Rewarded.</span>
              <Link2 className="text-muted-foreground size-4" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-6 p-6 sm:p-8">
              <div>
                <p className="text-muted-foreground text-sm">Your commission</p>
                <p className="mt-2 text-7xl font-semibold tracking-tighter">
                  30<span className="text-muted-foreground text-4xl">%</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-y py-5">
                <div>
                  <p className="text-muted-foreground text-xs">Your audience saves</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">10%</p>
                </div>
                <div className="border-s ps-5">
                  <p className="text-muted-foreground text-xs">Referral window</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">30 days</p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">One $49 Pro purchase</span>
                  <span className="shrink-0 whitespace-nowrap font-mono tabular-nums">$44.10 for them</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="font-medium">You earn</span>
                  <span className="font-mono text-xl font-semibold tabular-nums">$13.23</span>
                </div>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Example at the $49 Pro price. Commission is calculated after the discount, before tax.
              </p>
            </div>
          </div>
        </div>
      </section>
      {productProof}
      <section className="grid gap-7 border-b py-10 sm:grid-cols-3" aria-label="How the program works">
        {[
          {
            icon: Link2,
            step: "01",
            title: "Make it yours",
            text: "Apply with your audience link. Once approved, get your personal referral link and dashboard access.",
          },
          {
            icon: MousePointer2,
            step: "02",
            title: "Share something useful",
            text: "A tutorial, a build walkthrough, a newsletter. Show what you love and give your audience 10% off Pro.",
          },
          {
            icon: Wallet,
            step: "03",
            title: "Get your share",
            text: "Earn 30% of eligible sales. Follow your commissions in your dashboard, with payouts reviewed monthly.",
          },
        ].map(({ icon: Icon, step, title, text }) => (
          <div key={step}>
            <div className="flex items-center justify-between">
              <Icon className="size-5" aria-hidden="true" />
              <span className="text-muted-foreground font-mono text-xs">{step}</span>
            </div>
            <h2 className="mt-5 text-lg font-semibold tracking-tight">{title}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{text}</p>
          </div>
        ))}
      </section>
      <section
        className="grid gap-8 border-b py-12 md:grid-cols-2 md:items-center"
        aria-labelledby="calculator-title"
      >
        <div>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
            Small audience. Real potential.
          </p>
          <h2 id="calculator-title" className="mt-4 text-3xl font-semibold tracking-tight">
            Let your recommendations
            <br />
            add up.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
            No tiers to unlock. No moving targets. You earn the same 30% from your very first eligible sale.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="sales" className="text-sm font-medium">
              Referred Pro purchases
            </label>
            <output htmlFor="sales" className="font-mono text-sm tabular-nums">
              {sales}
            </output>
          </div>
          <input
            id="sales"
            type="range"
            min="1"
            max="100"
            value={sales}
            onChange={(e) => setSales(Number(e.target.value))}
            className="accent-primary mt-6 h-6 w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          />
          <div className="mt-5 flex items-end justify-between gap-4 border-t pt-6">
            <span className="text-muted-foreground text-sm">Your potential commission</span>
            <output
              aria-live="polite"
              className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl"
            >
              {usd(commissionCents(4410) * sales)}
            </output>
          </div>
          <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
            Illustration based on $49 Pro, less the 10% discount. This is an estimate, not a promise of
            earnings.
          </p>
        </div>
      </section>
      <section
        id="apply"
        className="grid scroll-mt-24 gap-8 border-b py-12 md:grid-cols-2"
        aria-labelledby="apply-title"
      >
        <div>
          <Badge variant="secondary">Build with us</Badge>
          <h2 id="apply-title" className="mt-5 text-4xl font-semibold tracking-tight">
            Your next great
            <br />
            recommendation starts here.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-sm leading-relaxed">
            Tell us a little about yourself and where you share your work. We review every application
            personally. Our review goal is within 3 business days.
          </p>
          <ul className="mt-7 flex flex-col gap-3 text-sm">
            {[
              "Personal referral link",
              "A private commission dashboard",
              "30% for you. 10% off for your audience.",
            ].map((text) => (
              <li key={text} className="flex items-center gap-3">
                <Check className="size-4" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          {state === "sent" ? (
            <div role="status" className="flex min-h-80 flex-col items-start justify-center gap-4">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Check className="size-5" />
              </span>
              <h3 className="text-2xl font-semibold tracking-tight">Application received.</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We’ll review your audience link and email you with the next steps. Our review goal is within 3
                business days. You do not need to apply again.
              </p>
              <a href="/pro" className="mt-2 text-sm font-medium underline underline-offset-4">
                Explore Ballmac UI Pro
              </a>
            </div>
          ) : (
            <form onSubmit={apply} aria-busy={state === "sending"}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="partner-name">Your name</FieldLabel>
                  <Input
                    id="partner-name"
                    name="name"
                    required
                    maxLength={100}
                    autoComplete="name"
                    placeholder="What should we call you?"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="partner-email">Email address</FieldLabel>
                  <Input
                    id="partner-email"
                    name="email"
                    required
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                  <FieldDescription>We’ll send your application update here.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="partner-channel">Where do you share your work?</FieldLabel>
                  <Input
                    id="partner-channel"
                    name="channel"
                    required
                    type="url"
                    maxLength={500}
                    placeholder="https://your-channel.com"
                  />
                  <FieldDescription>Your website, newsletter, social profile or channel.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="partner-promotion">How will you recommend Ballmac?</FieldLabel>
                  <Textarea
                    id="partner-promotion"
                    name="promotionPlan"
                    required
                    minLength={20}
                    maxLength={1000}
                    rows={4}
                    aria-describedby="partner-promotion-help"
                    placeholder="Tell us who you reach and how you would introduce Ballmac UI to them."
                  />
                  <FieldDescription id="partner-promotion-help">
                    A few sentences about your audience and planned content. No minimum audience size. Please
                    leave out bank, identity and tax details.
                  </FieldDescription>
                </Field>
                <div className="hidden" aria-hidden="true">
                  <label>
                    Leave empty
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                <label className="text-muted-foreground flex items-start gap-3 text-xs leading-relaxed">
                  <input
                    name="terms"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    type="checkbox"
                    required
                    className="accent-primary mt-0.5 size-4 shrink-0 focus-visible:outline-ring"
                  />
                  <span>
                    I agree to the{" "}
                    <a href="#program-terms" className="text-foreground underline underline-offset-2">
                      program terms
                    </a>{" "}
                    and understand how my application data and referral cookies are used.
                  </span>
                </label>
                {error && (
                  <p role="alert" className="text-destructive text-sm">
                    {error}
                  </p>
                )}
                <p id="partner-consent-help" className="text-muted-foreground text-xs leading-relaxed">
                  {acceptedTerms
                    ? "Terms accepted. You can submit your application when the fields above are complete."
                    : "Read the program terms and check the box above to enable your application."}
                </p>
                <Button
                  type="submit"
                  disabled={!acceptedTerms || state === "sending"}
                  aria-describedby="partner-consent-help"
                  className="w-full"
                >
                  {state === "sending" ? (
                    <>
                      <LoaderCircle
                        className="motion-safe:animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />{" "}
                      Sending application…
                    </>
                  ) : (
                    <>
                      Apply to become a partner <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
                    </>
                  )}
                </Button>
                <p className="text-muted-foreground text-center text-xs">
                  Already approved?{" "}
                  <a href="/affiliates/dashboard" className="text-foreground underline underline-offset-4">
                    Open your dashboard
                  </a>
                </p>
              </FieldGroup>
            </form>
          )}
        </div>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/30 px-5 py-4 mt-8">
        <p className="text-sm">
          <strong className="font-medium">A good fit goes both ways.</strong>{" "}
          <span className="text-muted-foreground">
            Explore the product before putting your name behind it.
          </span>
        </p>
        <a href="/pro" className="text-sm font-medium underline underline-offset-4">
          Explore Pro
        </a>
      </div>
      <section
        id="program-terms"
        className="mx-auto max-w-3xl scroll-mt-24 py-16"
        aria-labelledby="faq-title"
      >
        <p className="text-muted-foreground text-center font-mono text-xs uppercase tracking-widest">
          The details, in plain English
        </p>
        <h2 id="faq-title" className="mt-4 text-center text-3xl font-semibold tracking-tight">
          Good partnerships start with clarity.
        </h2>
        <div className="mt-9 divide-y border-y">
          {faqs.map(([title, answer]) => (
            <details key={title} className="group py-5">
              <summary className="cursor-pointer text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                {title}
              </summary>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{answer}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 grid gap-6 rounded-2xl border bg-muted/20 p-5 text-sm leading-relaxed sm:grid-cols-2 sm:p-7">
          {[
            [
              "Enrollment & approval",
              "Applying does not activate a referral link. We review the audience link you provide, and email you when approved. You must be able to receive payouts legally where you live and provide any required identity or tax information privately.",
            ],
            [
              "Commission & currency",
              "Earn 30% of an eligible regular-Pro purchase after the 10% discount and before tax, rounded to USD cents per order. For supported local-currency checkouts, we use Dodo’s reported USD settlement subtotal and converted tax. Founding offers, self-referrals and unsupported transactions are excluded.",
            ],
            [
              "Attribution & adjustments",
              "The most recent valid partner link in the same browser receives credit for 30 days. Cookies and JavaScript are required. Blocked cookies, another browser or device, and purchases outside the referral checkout may prevent attribution. Payment reversals remove the full order commission; disputed payments stay held until reviewed. Adjustments after a payout offset future earnings.",
            ],
            [
              "Payout review",
              `Earlier-month unpaid commissions become eligible for review on the first day of the next UTC month. Eligible balances of at least ${usd(AFFILIATE.minimumPayout)} USD are reviewed during the 1st–15th; smaller balances roll forward. A supported payout method, availability, provider fees and required documents are confirmed privately before the first transfer. No automatic withdrawal or guaranteed arrival date is offered.`,
            ],
            [
              "Honest recommendations",
              "Place a clear affiliate disclosure beside your recommendation or link. Only describe experiences and product capabilities truthfully. No spam, self-referrals, impersonation, coupon-site distribution, cookie stuffing, misleading claims or paid ads bidding on Ballmac brand terms. Share the public preview assets; do not redistribute private Pro source.",
            ],
            [
              "Changes, access & questions",
              "We may pause a partnership to investigate misuse or end participation for rule violations. Legitimate outstanding earnings remain subject to verification, adjustments and the payout rules. Changes to program terms apply prospectively. Contact support to question a commission, request a data correction or close your partnership.",
            ],
          ].map(([title, text]) => (
            <div key={title}>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-6 text-xs leading-relaxed">
          Privacy: we store your application details, accepted terms version, sign-in records, commission and
          payout history to run the partnership. Application, sign-in, approval and payout messages are
          transactional emails; application details are shared only with authorized program administrators.
          Cloudflare hosts this data, Resend delivers email, and Dodo processes purchases. Approved partners
          sign in with a one-time email code or their private access key. A secure session cookie remembers
          them for 30 days. Keep access keys secure. Referral links set an HttpOnly first-party cookie for 30
          days to apply the buyer’s discount and attribute the purchase. Dashboards show order references and
          commission amounts, never buyer identities. For data requests,{" "}
          <a href="/support" className="underline underline-offset-2">
            contact support
          </a>
          . Terms version {AFFILIATE.termsVersion}.
        </p>
      </section>
    </div>
  )
}
