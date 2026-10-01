// Ballmac UI: Relay home page. https://ui.ballmac.com/templates/template-relay
"use client"

import * as React from "react"
import { ArrowRight, Check, Clock, History, KeyRound, ListRestart, Radar, ShieldCheck, Shuffle, X } from "lucide-react"

import { DottedMap } from "@/components/ballmac/dotted-map"
import { Marquee } from "@/components/ballmac/marquee"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { SnippetTabs } from "@/components/ballmac/snippet-tabs"
import { RelayShell, type RelayHrefs } from "@/components/ballmac/templates/relay/relay-theme"
import { sendSnippets, verifySnippets } from "@/components/ballmac/templates/relay/relay-samples"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--relay-mono)" } as const
const label = "text-muted-foreground text-xs font-semibold tracking-wider uppercase"

const attempts = [
  { n: 1, t: "0.0 s", status: "503", note: "billing.acme.co unavailable", ok: false },
  { n: 2, t: "+30 s", status: "timeout", note: "No response in 10 s", ok: false },
  { n: 3, t: "+5 min", status: "200", note: "Delivered in 142 ms", ok: true },
]

const features = [
  { icon: ListRestart, title: "Retries that make sense", text: "Exponential backoff with jitter for 3 days. Circuit breakers pause a sick endpoint instead of hammering it." },
  { icon: ShieldCheck, title: "Signed and verifiable", text: "Every delivery is signed with a rotating secret and a timestamp. Verifying takes five lines in any language." },
  { icon: History, title: "Replay anything", text: "Re-send one event or a whole day to any endpoint, including your laptop, with one click or one command." },
  { icon: Shuffle, title: "Transform in flight", text: "Reshape payloads, filter by field and fan out to many endpoints without changing your producer." },
  { icon: Radar, title: "See every attempt", text: "Request, response, headers and latency for each try, searchable for 90 days and exportable to your logs." },
  { icon: KeyRound, title: "Per-endpoint controls", text: "Rate limits, IP allow-lists and mTLS for each destination, so one slow consumer never slows the rest." },
]

const regions = [
  { name: "iad1", city: "Virginia", ms: 11, lat: 38.9, lng: -77.4 },
  { name: "sfo1", city: "San Francisco", ms: 14, lat: 37.7, lng: -122.4 },
  { name: "gru1", city: "São Paulo", ms: 23, lat: -23.5, lng: -46.6 },
  { name: "fra1", city: "Frankfurt", ms: 9, lat: 50.1, lng: 8.7 },
  { name: "bom1", city: "Mumbai", ms: 19, lat: 19.1, lng: 72.9 },
  { name: "sin1", city: "Singapore", ms: 12, lat: 1.35, lng: 103.8 },
  { name: "syd1", city: "Sydney", ms: 16, lat: -33.9, lng: 151.2 },
]

function Console() {
  const [state, setState] = React.useState<"idle" | "sending" | "done">("idle")
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  function send() {
    setState("sending")
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState("done"), 650)
  }
  return (
    <div className="bg-card min-w-0 overflow-hidden rounded-lg border shadow-[6px_6px_0_0_var(--border)]">
      <SnippetTabs snippets={sendSnippets} storageKey="relay-language" variables={{ key: "rl_live_8f3k…" }} title="Send an event" bodyClassName="max-h-64" />
      <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
        <p className="text-muted-foreground text-xs" style={mono} aria-live="polite">
          {state === "idle" ? "POST /v1/events" : state === "sending" ? "Sending…" : "202 Accepted · 38 ms · iad1"}
        </p>
        <button
          type="button"
          onClick={send}
          disabled={state === "sending"}
          className="bg-chart-1 text-background focus-visible:ring-ring/50 inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-semibold outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px] disabled:opacity-60"
          style={mono}
        >
          {state === "done" ? "Send again" : "Send"} <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
      {state === "done" && (
        <div className="bg-surface border-t px-4 py-4 text-xs" style={mono}>
          <p className="text-chart-2 font-semibold">HTTP/1.1 202 Accepted</p>
          <pre className="text-muted-foreground mt-2 overflow-x-auto" tabIndex={0}>{`{
  "id": "evt_9x2k",
  "status": "queued",
  "attempts": [],
  "endpoint": "ep_billing"
}`}</pre>
        </div>
      )}
    </div>
  )
}

type RelayHomeProps = React.ComponentProps<"div"> & { hrefs?: Partial<RelayHrefs> }

/** The Relay home page: hero with a live console, the life of an event, features, a delivery map and code. */
function RelayHome({ hrefs, ...props }: RelayHomeProps) {
  return (
    <RelayShell page="home" hrefs={hrefs} {...props}>
      <main>
        <section className="relative border-b">
          <div aria-hidden="true" className="absolute inset-0 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className={cn(label, "text-chart-1 flex items-center gap-2")} style={mono}><span className="bg-chart-1 size-1.5 rounded-full" aria-hidden="true" /> Webhook infrastructure</p>
              <h1 className="mt-5 text-5xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-7xl">Never lose a webhook again.</h1>
              <p className="text-muted-foreground mt-6 max-w-lg text-lg text-pretty">
                Relay delivers your events to every customer endpoint with retries, signatures, replay and a complete audit trail. You send one request. We make sure it lands.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a href="#" className="bg-foreground text-background focus-visible:ring-ring/50 inline-flex h-12 items-center gap-2 rounded-md px-5 font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]" style={mono}>
                  Get your API key <ArrowRight className="size-4" aria-hidden="true" />
                </a>
                <a href={hrefs?.docs ?? "/relay/docs"} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-12 items-center rounded-md border px-5 font-medium outline-none transition-colors focus-visible:ring-[3px]" style={mono}>
                  Read the docs
                </a>
              </div>
              <p className="text-muted-foreground mt-6 text-sm">Free up to 100,000 events a month. No card needed.</p>
            </div>
            <Console />
          </div>
        </section>

        <section aria-label="Customers" className="border-b">
          <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6">
            <Marquee speed={28} gap={64} fade pauseOnHover>
              {["Stripeline", "Northbeam", "Cashew", "Lumen", "Paddock", "Vantage", "Ironclad Co", "Helix"].map((c) => (
                <span key={c} className="text-muted-foreground text-lg font-semibold tracking-tight" style={mono}>{c}</span>
              ))}
            </Marquee>
          </div>
        </section>

        {/* Life of an event */}
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className={label} style={mono}>The life of an event</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Your customer’s server was down. Your event still arrived.</h2>
              <p className="text-muted-foreground mt-5 max-w-md text-pretty sm:text-lg">
                Endpoints fail all the time. Relay keeps trying on a schedule that respects the receiver, then tells you exactly what happened.
              </p>
            </div>
            <ol className="bg-card rounded-lg border" aria-label="Delivery attempts for evt_9x2k">
              <li className="flex items-center justify-between gap-4 border-b px-5 py-4 text-sm" style={mono}>
                <span>evt_9x2k · invoice.paid</span>
                <span className="text-muted-foreground">received 09:41:02</span>
              </li>
              {attempts.map((a) => (
                <li key={a.n} className="flex items-start gap-4 border-b px-5 py-4 last:border-b-0">
                  <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border", a.ok ? "border-chart-2 text-chart-2" : "border-destructive/50 text-destructive")}>
                    {a.ok ? <Check className="size-3.5" aria-hidden="true" /> : <X className="size-3.5" aria-hidden="true" />}
                    <span className="sr-only">{a.ok ? "Delivered" : "Failed"}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Attempt {a.n} <span className="text-muted-foreground font-normal">· {a.status}</span></p>
                    <p className="text-muted-foreground mt-0.5 text-sm">{a.note}</p>
                  </div>
                  <span className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs" style={mono}><Clock className="size-3" aria-hidden="true" />{a.t}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features in a ruled grid */}
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className={label} style={mono}>What you get</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Everything between “send” and “received”.</h2>
            <ul className="mt-12 grid overflow-hidden rounded-lg border sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <li key={f.title} className={cn("bg-card p-7", "border-b sm:[&:nth-child(odd)]:border-r lg:[&:nth-child(odd)]:border-r-0 lg:[&:not(:nth-child(3n))]:border-r", i >= 4 && "sm:border-b-0", i >= 3 && "lg:border-b-0", i < 3 && "lg:border-b")}>
                  <f.icon className="text-chart-1 size-6" aria-hidden="true" />
                  <h3 className="mt-6 font-semibold">{f.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm text-pretty">{f.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Map */}
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="order-2 lg:order-1">
              <DottedMap
                tone="foreground"
                dots={120}
                latRange={[-50, 70]}
                label="Relay delivery regions"
                markers={regions.map((r) => ({ lat: r.lat, lng: r.lng, label: r.city, tone: "primary" as const }))}
                arcs={[
                  { from: [38.9, -77.4], to: [50.1, 8.7], tone: "primary" },
                  { from: [37.7, -122.4], to: [38.9, -77.4], tone: "primary" },
                  { from: [50.1, 8.7], to: [19.1, 72.9], tone: "primary" },
                  { from: [1.35, 103.8], to: [-33.9, 151.2], tone: "primary" },
                ]}
                className="text-muted-foreground/70"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className={label} style={mono}>Global delivery</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl">Seven regions. Closest one wins.</h2>
              <dl className="mt-8 divide-y rounded-lg border" style={mono}>
                {regions.map((r) => (
                  <div key={r.name} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <dt>{r.name} <span className="text-muted-foreground">· {r.city}</span></dt>
                    <dd className="text-chart-2 tabular-nums">{r.ms} ms</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Verify */}
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div>
              <p className={label} style={mono}>Receiving</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl">Verify in five lines. Dedupe for free.</h2>
              <p className="text-muted-foreground mt-5 max-w-md text-pretty sm:text-lg">Choose a language once. Every sample in these docs follows you.</p>
            </div>
            <div className="min-w-0"><SnippetTabs snippets={verifySnippets} storageKey="relay-language" title="Receive an event" bodyClassName="max-h-64" /></div>
          </div>
        </section>

        {/* Stats */}
        <section aria-label="Relay in numbers" className="border-b">
          <dl className="mx-auto grid max-w-6xl divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {[
              { v: 12.8, s: "B", l: "Events delivered each month", d: 1 },
              { v: 99.99, s: "%", l: "Delivery success within 3 days", d: 2 },
              { v: 38, s: " ms", l: "Median time to first attempt", d: 0 },
              { v: 90, s: " days", l: "Searchable attempt history", d: 0 },
            ].map((x) => (
              <div key={x.l} className="px-6 py-10">
                <dd className="text-4xl font-semibold tracking-[-0.04em] tabular-nums" style={mono}><NumberTicker value={x.v} format={{ minimumFractionDigits: x.d, maximumFractionDigits: x.d }} />{x.s}</dd>
                <dt className="text-muted-foreground mt-2 text-sm">{x.l}</dt>
              </div>
            ))}
          </dl>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <div className="bg-foreground text-background mx-auto max-w-6xl rounded-lg px-6 py-16 text-center sm:py-20">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.045em] text-balance sm:text-5xl">Send your first event in two minutes.</h2>
            <p className="mx-auto mt-4 max-w-md text-pretty opacity-70">One API key, one request. The free plan includes 100,000 events a month.</p>
            <a href="#" className="bg-chart-1 text-background focus-visible:ring-ring mt-8 inline-flex h-12 items-center gap-2 rounded-md px-6 font-semibold outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]" style={mono}>
              Get your API key <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
    </RelayShell>
  )
}

export { RelayHome, type RelayHomeProps }
