// Ballmac UI: Ledger pricing page. https://ui.ballmac.com/templates/template-ledger
import * as React from "react"
import { Check, Minus } from "lucide-react"

import { Faq2 } from "@/components/ballmac/blocks/faq-2/faq-2"
import { Pricing4 } from "@/components/ballmac/blocks/pricing-4/pricing-4"
import { LedgerHeading, LedgerShell, type LedgerHrefs } from "@/components/ballmac/templates/ledger/ledger-theme"

const rows: [string, boolean | string, boolean | string][] = [
  ["Invoices and expenses", "Up to 10 a month", "Unlimited"],
  ["Reports and exports", "Basic", "Full, with CSV and PDF"],
  ["iCloud sync across Macs", false, true],
  ["Approvals and menu bar capture", false, true],
  ["Shortcuts and AppleScript", false, true],
  ["Custom invoice templates", false, true],
  ["Updates", "Bug fixes", "All of this major version"],
]

function Cell({ v }: { v: boolean | string }) {
  if (typeof v === "string") return <span className="text-sm">{v}</span>
  return v ? <Check className="text-chart-2 mx-auto size-4.5" role="img" aria-label="Included" /> : <Minus className="text-muted-foreground mx-auto size-4" role="img" aria-label="Not included" />
}

type LedgerPricingProps = React.ComponentProps<"div"> & { hrefs?: Partial<LedgerHrefs> }

/** Ledger pricing: buy once or subscribe with the cost chart, a free-versus-licensed table and questions. */
function LedgerPricing({ hrefs, ...props }: LedgerPricingProps) {
  return (
    <LedgerShell page="pricing" hrefs={hrefs} {...props}>
      <main>
        <div className="px-4 pt-16 text-center sm:px-6 sm:pt-20">
          <LedgerHeading as="h1" className="mx-auto max-w-2xl text-4xl sm:text-6xl">Honest pricing for <em>honest</em> software.</LedgerHeading>
        </div>
        <Pricing4 title="Pick how you like to pay." description="Buy a license and keep it forever, or subscribe if you’d rather always have the latest. The chart shows exactly when each one pays off." />
        <section aria-labelledby="ledger-compare" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
          <h2 id="ledger-compare" className="text-2xl font-semibold tracking-[-0.03em]">Free trial or licensed</h2>
          <div tabIndex={0} role="region" aria-label="Trial compared with a license" className="bg-card focus-visible:ring-ring/50 mt-6 overflow-x-auto rounded-2xl border outline-none focus-visible:ring-[3px]">
            <table className="w-full min-w-[30rem] text-left">
              <caption className="sr-only">Trial and licensed features</caption>
              <thead><tr className="border-b text-sm"><th scope="col" className="p-4 font-medium"><span className="sr-only">Feature</span></th><th scope="col" className="p-4 text-center font-medium">14-day trial</th><th scope="col" className="p-4 text-center font-medium">Licensed</th></tr></thead>
              <tbody>
                {rows.map(([f, a, b]) => (
                  <tr key={f} className="border-b last:border-b-0"><th scope="row" className="p-4 text-sm font-normal">{f}</th><td className="p-4 text-center"><Cell v={a} /></td><td className="bg-chart-1/5 p-4 text-center"><Cell v={b} /></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <Faq2
          title="Pricing questions"
          description="If yours isn’t here, we answer email within a day."
          categories={[
            { name: "Licenses", questions: [
              { question: "Is a license really forever?", answer: "Yes. A license works on the version you bought and every update in that major version, including all of 2.x. A new major version is a paid upgrade at a discount." },
              { question: "Can I move my license to another Mac?", answer: "Deactivate it from Settings on the old Mac and activate it on the new one. There is no limit on moves, only on how many Macs use it at once." },
            ] },
            { name: "Subscriptions", questions: [
              { question: "What happens if I cancel?", answer: "Ledger keeps opening your books in read-only mode, and you can export everything. You can resubscribe any time." },
              { question: "Is there a student or nonprofit discount?", answer: "Yes, 50 percent off for students, teachers and registered nonprofits. Write to us from your school or organisation address." },
            ] },
          ]}
          support={{ label: "Email support", href: "#", text: "Still unsure which is right for you?" }}
        />
      </main>
    </LedgerShell>
  )
}

export { LedgerPricing, type LedgerPricingProps }
