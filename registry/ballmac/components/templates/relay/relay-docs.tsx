// Ballmac UI: Relay docs page. https://ui.ballmac.com/templates/template-relay
"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"

import { ApiEndpoint } from "@/components/ballmac/api-endpoint"
import { SnippetTabs } from "@/components/ballmac/snippet-tabs"
import { TableOfContents } from "@/components/ballmac/table-of-contents"
import { RelayShell, type RelayHrefs } from "@/components/ballmac/templates/relay/relay-theme"
import { sendSnippets, verifySnippets } from "@/components/ballmac/templates/relay/relay-samples"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--relay-mono)" } as const

const nav = [
  { title: "Get started", items: ["Introduction", "Quickstart", "Authentication"] },
  { title: "Concepts", items: ["Events and endpoints", "Retries and backoff", "Signatures", "Replay"] },
  { title: "API reference", items: ["Send an event", "List attempts", "Replay an event"] },
  { title: "Guides", items: ["Verify in Next.js", "Test locally", "Go to production"] },
]

const h2 = "scroll-mt-24 text-2xl font-semibold tracking-[-0.03em]"

type RelayDocsProps = React.ComponentProps<"div"> & { hrefs?: Partial<RelayHrefs> }

/** Relay docs: sidebar, a quickstart with language-synced samples, API reference and an on-page contents list. */
function RelayDocs({ hrefs, ...props }: RelayDocsProps) {
  return (
    <RelayShell page="docs" hrefs={hrefs} {...props}>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_13rem]">
        <aside className="hidden lg:block">
          <nav aria-label="Documentation" className="sticky top-14 max-h-[calc(100dvh-3.5rem)] space-y-6 overflow-y-auto py-10 pe-2">
            {nav.map((g) => (
              <div key={g.title}>
                <h2 className="text-xs font-semibold tracking-wider uppercase" style={mono}>{g.title}</h2>
                <ul className="mt-2.5 space-y-0.5">
                  {g.items.map((i) => (
                    <li key={i}>
                      <a
                        href="#"
                        aria-current={i === "Quickstart" ? "page" : undefined}
                        className="text-muted-foreground hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:text-foreground block rounded-md px-2.5 py-1.5 text-sm transition-colors"
                      >
                        {i}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 py-10 lg:py-12">
          <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center gap-1 text-sm">
            Get started <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" /> <span className="text-foreground">Quickstart</span>
          </nav>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-5xl">Quickstart</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg text-pretty">Send your first event and watch it arrive. This takes about two minutes.</p>

          <div className="prose-none mt-12 space-y-14">
            <section>
              <h2 id="get-a-key" className={h2}>1. Get an API key</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl text-pretty">
                Create a key in the dashboard under <span className="bg-muted rounded px-1.5 py-0.5 text-[0.85em]" style={mono}>Settings → API keys</span>. Keys starting with <span className="bg-muted rounded px-1.5 py-0.5 text-[0.85em]" style={mono}>rl_test_</span> never reach real endpoints.
              </p>
            </section>

            <section>
              <h2 id="send-an-event" className={h2}>2. Send an event</h2>
              <p className="text-muted-foreground mt-3 mb-5 max-w-2xl text-pretty">Pick your language. Your choice is remembered across every sample in the docs.</p>
              <SnippetTabs snippets={sendSnippets} storageKey="relay-language" variables={{ key: "rl_test_8f3k…" }} lineNumbers />
            </section>

            <section>
              <h2 id="receive-it" className={h2}>3. Receive it</h2>
              <p className="text-muted-foreground mt-3 mb-5 max-w-2xl text-pretty">Verify the signature, then return a 2xx. Anything else is retried.</p>
              <SnippetTabs snippets={verifySnippets} storageKey="relay-language" lineNumbers />
              <div className="bg-chart-1/10 border-chart-1/30 mt-6 rounded-lg border p-4 text-sm text-pretty">
                <p className="font-semibold">Dedupe on event.id</p>
                <p className="text-muted-foreground mt-1">Relay delivers at least once. The id is stable across retries and replays, so store it and skip repeats.</p>
              </div>
            </section>

            <section>
              <h2 id="api-reference" className={h2}>API reference</h2>
              <div className="mt-6 space-y-4">
                <ApiEndpoint
                  method="POST"
                  path="/v1/events"
                  summary="Send an event"
                  description="Queues an event for delivery to one endpoint, or every endpoint subscribed to its type."
                  baseUrl="https://api.relay.dev"
                  auth="Bearer token"
                  defaultOpen
                  parameters={[
                    { name: "type", in: "body", type: "string", required: true, description: "Event type, such as invoice.paid." },
                    { name: "endpoint", in: "body", type: "string", description: "Send to one endpoint. Omit to fan out by subscription." },
                    { name: "data", in: "body", type: "object", required: true, description: "The payload your customer receives." },
                    { name: "Idempotency-Key", in: "header", type: "string", description: "Makes retries of this request safe for 24 hours." },
                  ]}
                  requestExample={`{
  "type": "invoice.paid",
  "endpoint": "ep_billing",
  "data": { "id": "inv_1042", "amount": 4900 }
}`}
                  requestLanguage="json"
                  responses={[
                    { status: 202, description: "Event queued", example: `{ "id": "evt_9x2k", "status": "queued" }`, language: "json" },
                    { status: 422, description: "Invalid payload", example: `{ "error": "data is required" }`, language: "json" },
                  ]}
                />
                <ApiEndpoint
                  method="GET"
                  path="/v1/events/{id}/attempts"
                  summary="List attempts"
                  description="Every delivery attempt for an event, newest first, with status codes and latency."
                  baseUrl="https://api.relay.dev"
                  auth="Bearer token"
                  parameters={[{ name: "id", in: "path", type: "string", required: true, description: "The event id." }]}
                  responses={[{ status: 200, description: "Attempts", example: `{ "data": [{ "n": 3, "status": 200, "ms": 142 }] }`, language: "json" }]}
                />
              </div>
            </section>
          </div>
        </main>

        <aside className="hidden xl:block">
          <div className={cn("sticky top-14 py-12")}>
            <TableOfContents
              title="On this page"
              offset={80}
              items={[
                { id: "get-a-key", title: "1. Get an API key" },
                { id: "send-an-event", title: "2. Send an event" },
                { id: "receive-it", title: "3. Receive it" },
                { id: "api-reference", title: "API reference" },
              ]}
            />
          </div>
        </aside>
      </div>
    </RelayShell>
  )
}

export { RelayDocs, type RelayDocsProps }
