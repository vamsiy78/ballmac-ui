// Ballmac UI: Atlas settings page. https://ui.ballmac.com/templates/template-atlas
"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { Switch } from "@/components/ballmac/switch"
import { AtlasPageHeader, AtlasShell, atlasButton, type AtlasHrefs } from "@/components/ballmac/templates/atlas/atlas-theme"
import { cn } from "@/lib/utils"

const field = "bg-background focus-visible:ring-ring/50 mt-1.5 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]"

type State = {
  name: string
  email: string
  currency: string
  rates: Record<string, boolean>
  alerts: Record<string, boolean>
}

const initial: State = {
  name: "Fieldnote Goods",
  email: "hello@fieldnote.example",
  currency: "USD",
  rates: { standard: true, express: true, pickup: false },
  alerts: { orders: true, stock: true, reviews: false, digest: true },
}

const rateRows = [
  ["standard", "Standard shipping", "3 to 5 business days · $8, free over $100"],
  ["express", "Express shipping", "1 to 2 business days · $19"],
  ["pickup", "Local pickup", "Collect from the Portland studio · Free"],
]
const alertRows = [
  ["orders", "New orders", "Email me as soon as an order is placed."],
  ["stock", "Low stock", "Tell me when a product drops to 10 or fewer."],
  ["reviews", "Customer reviews", "Tell me about new reviews that need a reply."],
  ["digest", "Weekly digest", "A Monday summary of sales, orders and top products."],
]

const sections = [["profile", "Store profile"], ["shipping", "Shipping"], ["alerts", "Notifications"], ["danger", "Danger zone"]]

type AtlasSettingsProps = React.ComponentProps<"div"> & { hrefs?: Partial<AtlasHrefs> }

/** The Atlas settings page: store profile, shipping rates and notification switches, with a save bar that appears only when something changed. */
function AtlasSettings({ hrefs, ...props }: AtlasSettingsProps) {
  const [saved, setSaved] = React.useState<State>(initial)
  const [draft, setDraft] = React.useState<State>(initial)
  const [status, setStatus] = React.useState<"idle" | "saved">("idle")
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft)

  function set<K extends keyof State>(key: K, value: State[K]) {
    setStatus("idle")
    setDraft((d) => ({ ...d, [key]: value }))
  }

  return (
    <AtlasShell page="settings" title="Settings" hrefs={hrefs} {...props}>
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-6 pb-28 sm:px-6 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="hidden lg:block">
          <ul className="sticky top-20 space-y-0.5">
            {sections.map(([id, label]) => <li key={id}><a href={`#${id}`} className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 block rounded-lg px-3 py-2 text-sm font-medium outline-none focus-visible:ring-[3px]">{label}</a></li>)}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">
          <AtlasPageHeader title="Settings" description="Manage how your store looks, ships and talks to you." />

          <section id="profile" aria-labelledby="as-profile" className="bg-card scroll-mt-20 rounded-xl border p-5">
            <h3 id="as-profile" className="font-bold">Store profile</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="as-name" className="text-sm font-medium">Store name</label><input id="as-name" value={draft.name} onChange={(e) => set("name", e.target.value)} className={field} /></div>
              <div><label htmlFor="as-email" className="text-sm font-medium">Contact email</label><input id="as-email" type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} className={field} /></div>
              <div><label htmlFor="as-cur" className="text-sm font-medium">Currency</label>
                <select id="as-cur" value={draft.currency} onChange={(e) => set("currency", e.target.value)} className={field}><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option></select>
              </div>
            </div>
          </section>

          <section id="shipping" aria-labelledby="as-ship" className="bg-card scroll-mt-20 rounded-xl border">
            <h3 id="as-ship" className="p-5 pb-3 font-bold">Shipping rates</h3>
            <ul className="divide-y border-t">
              {rateRows.map(([id, title, text]) => (
                <li key={id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div><p id={`as-rate-${id}`} className="text-sm font-semibold">{title}</p><p className="text-muted-foreground text-sm">{text}</p></div>
                  <Switch aria-labelledby={`as-rate-${id}`} checked={draft.rates[id]} onCheckedChange={(v) => set("rates", { ...draft.rates, [id]: v })} />
                </li>
              ))}
            </ul>
          </section>

          <section id="alerts" aria-labelledby="as-alerts" className="bg-card scroll-mt-20 rounded-xl border">
            <h3 id="as-alerts" className="p-5 pb-3 font-bold">Notifications</h3>
            <ul className="divide-y border-t">
              {alertRows.map(([id, title, text]) => (
                <li key={id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div><p id={`as-alert-${id}`} className="text-sm font-semibold">{title}</p><p className="text-muted-foreground text-sm">{text}</p></div>
                  <Switch aria-labelledby={`as-alert-${id}`} checked={draft.alerts[id]} onCheckedChange={(v) => set("alerts", { ...draft.alerts, [id]: v })} />
                </li>
              ))}
            </ul>
          </section>

          <section id="danger" aria-labelledby="as-danger" className="border-destructive/40 bg-card scroll-mt-20 rounded-xl border p-5">
            <h3 id="as-danger" className="font-bold">Danger zone</h3>
            <p className="text-muted-foreground mt-1 text-sm text-pretty">Closing the store hides it from customers. Orders and customer data are kept for 90 days.</p>
            <button type="button" className={cn(atlasButton.danger, "mt-4")}>Close store</button>
          </section>
        </div>
      </main>

      {(dirty || status === "saved") && (
        <div role="region" aria-label="Save changes" className="bg-popover fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border p-3 pl-5 shadow-[0_20px_50px_-12px_rgb(0_0_0/0.35)]">
          <p className="text-sm font-semibold" role="status">{dirty ? "You have unsaved changes" : <span className="flex items-center gap-1.5"><Check className="text-chart-2 size-4" aria-hidden="true" />Changes saved</span>}</p>
          {dirty && (
            <div className="flex gap-2">
              <button type="button" className={atlasButton.outline} onClick={() => setDraft(saved)}>Discard</button>
              <button type="button" className={atlasButton.primary} onClick={() => { setSaved(draft); setStatus("saved") }}>Save changes</button>
            </div>
          )}
        </div>
      )}
    </AtlasShell>
  )
}

export { AtlasSettings, type AtlasSettingsProps }
