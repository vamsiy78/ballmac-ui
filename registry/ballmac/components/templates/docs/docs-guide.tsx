// Ballmac UI: Docs guide page. https://ui.ballmac.com/templates/template-docs
"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Check, Clock, ThumbsDown, ThumbsUp } from "lucide-react"

import { Callout } from "@/components/ballmac/callout"
import { CodeBlock } from "@/components/ballmac/code-block"
import { CopyButton } from "@/components/ballmac/copy-button"
import { InstallTabs } from "@/components/ballmac/install-tabs"
import { SnippetTabs } from "@/components/ballmac/snippet-tabs"
import { TableOfContents } from "@/components/ballmac/table-of-contents"
import { Crumbs, DocsShell, docsMonoClass, docsSerifClass, type DocsHrefs } from "@/components/ballmac/templates/docs/docs-theme"
import { cn } from "@/lib/utils"

const toc = [
  { id: "before", title: "Before you begin", level: 2 },
  { id: "install", title: "Install the SDK", level: 2 },
  { id: "create", title: "Create a queue", level: 2 },
  { id: "send", title: "Send a message", level: 2 },
  { id: "receive", title: "Receive and acknowledge", level: 2 },
  { id: "next", title: "Next steps", level: 2 },
]

const createSnippets = [
  { label: "Node", language: "typescript" as const, code: `const { Tern } = require("@tern/sdk")\n\nconst tern = new Tern({ apiKey: process.env.TERN_KEY, region: "eu" })\n\nawait tern.queues.create({\n  name: "invoices",\n  visibilityTimeout: 60,\n})` },
  { label: "Python", language: "python" as const, code: `import os\nfrom tern import Tern\n\ntern = Tern(api_key=os.environ["TERN_KEY"], region="eu")\n\ntern.queues.create(\n    name="invoices",\n    visibility_timeout=60,\n)` },
  { label: "Go", language: "go" as const, code: `client := tern.New(os.Getenv("TERN_KEY"), tern.WithRegion("eu"))\n\n_, err := client.Queues.Create(ctx, tern.CreateQueue{\n    Name:              "invoices",\n    VisibilityTimeout: 60,\n})` },
  { label: "cURL", language: "bash" as const, code: `curl https://eu.api.tern.dev/v1/queues \\\n  -H "Authorization: Bearer $TERN_KEY" \\\n  -d '{"name":"invoices","visibilityTimeout":60}'` },
]
const sendSnippets = [
  { label: "Node", language: "typescript" as const, code: `const message = await tern.queue("invoices").send(\n  { invoice: "inv_2041", total: 4200 },\n  { idempotencyKey: "inv_2041" }\n)\n\nconsole.log(message.id) // msg_7Hq2Zc` },
  { label: "Python", language: "python" as const, code: `message = tern.queue("invoices").send(\n    {"invoice": "inv_2041", "total": 4200},\n    idempotency_key="inv_2041",\n)\n\nprint(message.id)  # msg_7Hq2Zc` },
  { label: "Go", language: "go" as const, code: `msg, _ := client.Queue("invoices").Send(ctx,\n    map[string]any{"invoice": "inv_2041", "total": 4200},\n    tern.IdempotencyKey("inv_2041"))\n\nfmt.Println(msg.ID) // msg_7Hq2Zc` },
  { label: "cURL", language: "bash" as const, code: `curl https://eu.api.tern.dev/v1/queues/invoices/messages \\\n  -H "Authorization: Bearer $TERN_KEY" \\\n  -H "Idempotency-Key: inv_2041" \\\n  -d '{"body":{"invoice":"inv_2041","total":4200}}'` },
]
const consumeSnippets = [
  { label: "Node", language: "typescript" as const, code: `for await (const msg of tern.queue("invoices").consume({ wait: 20 })) {\n  await chargeCustomer(msg.body)\n  await msg.ack() // delete it, or it comes back\n}` },
  { label: "Python", language: "python" as const, code: `for msg in tern.queue("invoices").consume(wait=20):\n    charge_customer(msg.body)\n    msg.ack()  # delete it, or it comes back` },
  { label: "Go", language: "go" as const, code: `for msg := range client.Queue("invoices").Consume(ctx, tern.Wait(20)) {\n    chargeCustomer(msg.Body)\n    msg.Ack() // delete it, or it comes back\n}` },
  { label: "cURL", language: "bash" as const, code: `curl "https://eu.api.tern.dev/v1/queues/invoices/messages?wait=20" \\\n  -H "Authorization: Bearer $TERN_KEY"` },
]

function Step({ n, title, id, children, last }: { n: number; title: string; id: string; children: React.ReactNode; last?: boolean }) {
  return (
    <section aria-labelledby={id} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 sm:gap-x-5">
      <div className="flex flex-col items-center">
        <span aria-hidden="true" className={cn("bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full text-sm font-bold", docsMonoClass)}>{n}</span>
        {!last && <span aria-hidden="true" className="bg-border mt-2 w-px flex-1" />}
      </div>
      <div className={cn("grid min-w-0 gap-4", !last && "pb-12")}>
        <h2 id={id} className={cn("scroll-mt-24 pt-1 text-3xl", docsSerifClass)}>{title}</h2>
        {children}
      </div>
    </section>
  )
}

function Helpful() {
  const [vote, setVote] = React.useState<"yes" | "no" | null>(null)
  const [note, setNote] = React.useState("")
  const [sent, setSent] = React.useState(false)
  const btn = "hover:bg-accent focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-accent inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold outline-none focus-visible:ring-[3px]"
  return (
    <section aria-labelledby="dg-help" className="bg-surface rounded-2xl border p-6">
      <h2 id="dg-help" className="font-semibold">Was this page helpful?</h2>
      {sent || vote === "yes" ? (
        <p role="status" className="mt-3 flex items-center gap-2 text-sm"><Check className="text-chart-4 size-4" aria-hidden="true" />{sent ? "Thanks. We read every note." : "Glad it helped. Thank you."}</p>
      ) : (
        <>
          <div className="mt-3 flex gap-2">
            <button type="button" className={btn} onClick={() => setVote("yes")}><ThumbsUp className="size-4" aria-hidden="true" />Yes</button>
            <button type="button" className={btn} aria-pressed={vote === "no"} onClick={() => setVote("no")}><ThumbsDown className="size-4" aria-hidden="true" />No</button>
          </div>
          {vote === "no" && (
            <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
              <label htmlFor="dg-note" className="text-sm font-medium">What was missing or confusing?</label>
              <textarea id="dg-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="bg-background focus-visible:ring-ring/50 w-full rounded-lg border p-3 text-sm outline-none focus-visible:ring-[3px]" />
              <button type="submit" className="bg-primary text-primary-foreground focus-visible:ring-ring/50 h-10 w-fit rounded-lg px-5 text-sm font-semibold outline-none focus-visible:ring-[3px]">Send feedback</button>
            </form>
          )}
        </>
      )}
    </section>
  )
}

type DocsGuideProps = React.ComponentProps<"div"> & { hrefs?: Partial<DocsHrefs> }

/** A Docs guide: breadcrumbs, numbered steps with synced language tabs, callouts, an on-this-page list and a feedback box. */
function DocsGuide({ hrefs, ...props }: DocsGuideProps) {
  const link = { guide: "/docs/guides", reference: "/docs/reference", ...hrefs }
  return (
    <DocsShell page="guide" hrefs={hrefs} {...props}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 px-4 py-10 sm:px-8 xl:grid-cols-[minmax(0,1fr)_14rem]">
        <main className="mx-auto w-full min-w-0 max-w-3xl">
          <Crumbs items={["Get started", "Send your first message"]} />
          <h1 className={cn("mt-5 text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.05] text-balance", docsSerifClass)}>Send your first message</h1>
          <p className="text-muted-foreground mt-4 text-xl text-pretty">Create a queue, put a message on it and take it off again. By the end you will have seen the whole loop that everything else is built on.</p>
          <p className="text-muted-foreground mt-5 flex items-center gap-4 text-sm"><span className="inline-flex items-center gap-1.5"><Clock className="size-4" aria-hidden="true" />7 min read</span><span>Updated Sep 24, 2026</span></p>

          <div className="mt-10">
            <Step n={1} id="before" title="Before you begin">
              <p className="text-pretty">You need a Tern account and a test API key. Test keys only touch test queues, so nothing here can affect production.</p>
              <div className="bg-card flex items-center justify-between gap-3 rounded-xl border p-3 ps-4">
                <div className="min-w-0"><p className="text-muted-foreground text-xs">Your test key</p><p className={cn("truncate text-sm", docsMonoClass)}>tern_test_4fJ2kQ9xN7mB1c</p></div>
                <CopyButton value="tern_test_4fJ2kQ9xN7mB1c" ariaLabel="Copy the test key" variant="outline" size="sm" />
              </div>
              <Callout kind="note" title="Pick a region once">Queues live in one region. Use <code className={docsMonoClass}>eu</code>, <code className={docsMonoClass}>us</code> or <code className={docsMonoClass}>ap</code> and keep it the same in every client.</Callout>
            </Step>
            <Step n={2} id="install" title="Install the SDK">
              <p className="text-pretty">Add the Node package with your package manager. Using Python or Go? Switch the tabs below and every sample on this page follows.</p>
              <InstallTabs storageKey="tern-pm" commands={{ npm: "npm install @tern/sdk", pnpm: "pnpm add @tern/sdk", yarn: "yarn add @tern/sdk", bun: "bun add @tern/sdk" }} />
            </Step>
            <Step n={3} id="create" title="Create a queue">
              <p className="text-pretty">A queue holds messages until a consumer acknowledges them. The visibility timeout is how long a received message stays hidden before Tern offers it to someone else.</p>
              <SnippetTabs storageKey="tern-lang" title="Create a queue" lineNumbers snippets={createSnippets} />
              <Callout kind="tip" title="Names are permanent">A queue cannot be renamed. Pick something you will still like in a year, such as <code className={docsMonoClass}>invoices</code> rather than <code className={docsMonoClass}>test2</code>.</Callout>
            </Step>
            <Step n={4} id="send" title="Send a message">
              <p className="text-pretty">The body can be any JSON up to 256 KB. Pass an idempotency key and a network retry returns the first message instead of adding a second.</p>
              <SnippetTabs storageKey="tern-lang" title="Send a message" lineNumbers snippets={sendSnippets} />
              <CodeBlock filename="response.json" language="json" code={`{\n  "id": "msg_7Hq2Zc",\n  "queue": "invoices",\n  "visibleAt": "2026-09-30T08:14:22Z"\n}`} highlight={[2]} />
            </Step>
            <Step n={5} id="receive" title="Receive and acknowledge" last>
              <p className="text-pretty">Consuming is a loop: wait for a message, do the work, then acknowledge. Acknowledging deletes the message. If your code crashes first, the visibility timeout ends and Tern hands the message to the next consumer.</p>
              <SnippetTabs storageKey="tern-lang" title="Consume messages" lineNumbers snippets={consumeSnippets} />
              <Callout kind="caution" title="Acknowledge only after the work succeeds">Delivery is at least once. A message can arrive twice, so make your handler safe to run twice. The idempotent consumers guide shows how.</Callout>
            </Step>
          </div>

          <section aria-labelledby="next" className="mt-14">
            <h2 id="next" className={cn("scroll-mt-24 text-3xl", docsSerifClass)}>Next steps</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {[["Delivery guarantees", "What at-least-once really means for your code.", link.guide], ["Dead-letter queues", "Park messages that keep failing and replay them later.", link.guide], ["Idempotent consumers", "Make retries safe.", link.guide], ["API reference", "Every endpoint, with examples.", link.reference]].map(([t, d, h]) => (
                <li key={t}><a href={h} className="bg-card hover:border-primary/50 focus-visible:ring-ring/50 group block h-full rounded-xl border p-5 outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none"><span className="flex items-center justify-between font-semibold">{t}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" /></span><span className="text-muted-foreground mt-1 block text-sm">{d}</span></a></li>
              ))}
            </ul>
          </section>

          <div className="mt-12"><Helpful /></div>

          <nav aria-label="Previous and next page" className="mt-8 grid gap-4 sm:grid-cols-2">
            <a href={link.guide} className="hover:border-primary/50 focus-visible:ring-ring/50 group rounded-xl border p-5 outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none"><span className="text-muted-foreground flex items-center gap-1 text-xs"><ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />Previous</span><span className="mt-1 block font-semibold">Core concepts</span></a>
            <a href={link.guide} className="hover:border-primary/50 focus-visible:ring-ring/50 group rounded-xl border p-5 text-end outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none"><span className="text-muted-foreground flex items-center justify-end gap-1 text-xs">Next<ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" /></span><span className="mt-1 block font-semibold">Delivery guarantees</span></a>
          </nav>
        </main>
        <aside className="hidden xl:block" aria-label="On this page"><div className="sticky top-24"><TableOfContents items={toc} title="On this page" offset={96} /></div></aside>
      </div>
    </DocsShell>
  )
}

export { DocsGuide, type DocsGuideProps }
