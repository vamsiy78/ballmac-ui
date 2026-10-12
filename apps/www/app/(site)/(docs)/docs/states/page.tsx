import type { Metadata } from "next"

import Link from "@/components/site/link"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"
import { getBlocks } from "@/lib/registry"

export const metadata: Metadata = {
  title: "States: loading, empty and error",
  description: "Every data block shows loading, empty and error states, and every form block can show submitting, success and error, through one state prop. Skeletons match the layout, errors retry, and screen readers are told.",
  alternates: { canonical: "/docs/states" },
}

const VOCAB = [
  { id: "loading", what: "Data is on its way. A skeleton with the same shape as the content, announced as loading." },
  { id: "empty", what: "There is nothing yet. A clear message and, where it helps, a way to make the first thing." },
  { id: "error", what: "It failed. A message that says what happened and a way to try again." },
  { id: "submitting", what: "A form request is in flight. Fields lock, the button spins, and nothing can be sent twice." },
  { id: "success", what: "The request went through. The confirmation the flow ends on." },
]

export default function StatesPage() {
  const blocks = getBlocks().filter((b) => b.tier === "free")
  const withStates = blocks.filter((b) => b.states.length)
  const kinds = (b: (typeof blocks)[number]) => b.states.map((s) => s.id).join(", ")
  return (
    <DocsPage
      title="States"
      lead="An interface is not finished until it handles loading, nothing, and failure. Every data block and form block takes one prop, state, and shows the right thing."
    >
      <p>
        The edge cases are what make an app feel built. They are also what generated UI skips. Here they are part of the block: skeletons that match its layout, a clear empty message, an error you can retry, and announcements for screen readers. Open any block in the{" "}
        <Link href="/blocks">gallery</Link> and use the <em>State</em> chips above the preview to see each one.
      </p>

      <h2 id="vocabulary">The states</h2>
      <ul>
        {VOCAB.map((v) => (
          <li key={v.id}>
            <code>{v.id}</code>: {v.what}
          </li>
        ))}
      </ul>
      <p>
        Leave <code>state</code> out and the block behaves as it always has. Nothing changes until you pass it.
      </p>

      <h2 id="data">Data blocks</h2>
      <p>
        Lists, boards, dashboards, calendars and chats take <code>state</code>, <code>onRetry</code>, <code>emptyState</code> and <code>errorState</code>. <code>useResource</code> turns a fetch into the state to pass:
      </p>
      <CodePanel
        lang="tsx"
        title="app/inbox.tsx"
        code={`import { Mail1 } from "@/components/ballmac/blocks/mail-1/mail-1"
import { useResource } from "@/lib/ballmac/use-resource"

export function Inbox() {
  const mail = useResource((signal) => fetch("/api/mail", { signal }).then((r) => r.json()))
  return (
    <Mail1
      state={mail.state}          // "loading" | "ready" | "empty" | "error"
      messages={mail.data}
      onRetry={mail.retry}
      emptyState={{ title: "Inbox zero", description: "Nothing new. Enjoy it." }}
      errorState={{ description: "Mail is taking a break. Your messages are safe." }}
    />
  )
}`}
      />
      <p>
        <code>useResource</code> aborts a request that is replaced or unmounted, never lets a slow old answer overwrite a newer one, and goes round again on <code>retry()</code>. If you already use TanStack Query or SWR, map their result instead:
      </p>
      <CodePanel
        lang="tsx"
        code={`import { stateOf } from "@/lib/ballmac/use-resource"

const query = useQuery({ queryKey: ["mail"], queryFn: fetchMail })
<Mail1 state={stateOf(query)} messages={query.data} onRetry={query.refetch} />`}
      />

      <h2 id="forms">Form blocks</h2>
      <p>
        Sign-in, sign-up, contact, newsletter, settings and the rest already run their own submit flow. <code>state</code> lets you drive it from your own async code, or show one stage on its own: <code>submitting</code> locks the fields, <code>success</code> shows the confirmation, <code>error</code> shows the failure. <code>errorState.description</code> sets the message.
      </p>
      <CodePanel
        lang="tsx"
        code={`const [phase, setPhase] = useState<"ready" | "submitting" | "success" | "error">("ready")

<Signup1
  state={phase}
  errorState={{ description: "That email is already registered." }}
  onSubmit={async (values) => {
    setPhase("submitting")
    try { await createAccount(values); setPhase("success") } catch { setPhase("error") }
  }}
/>`}
      />
      <p>
        Leaving <code>state</code> out lets the form decide by itself, exactly as before. Several forms also take <code>defaultValues</code> or <code>defaultEmail</code> to prefill.
      </p>

      <h2 id="state-view">Your own views</h2>
      <p>
        <code>StateView</code> is the part the blocks are built on. Wrap anything that loads:
      </p>
      <CodePanel
        lang="tsx"
        code={`<StateView
  state={invoices.state}
  loading={<InvoiceSkeleton />}        // the same shape as the real list
  empty={{ title: "No invoices", action: <Button>Create one</Button> }}
  error={{ title: "Invoices are unavailable", details: String(invoices.error) }}
  onRetry={invoices.retry}
>
  <InvoiceList items={invoices.data} />
</StateView>`}
      />

      <h2 id="a11y">What it does for accessibility</h2>
      <ul>
        <li>Loading is announced as a status, and the region is marked <code>aria-busy</code> while it lasts. The skeleton itself is hidden from assistive technology.</li>
        <li>An error is announced as an alert. Focus is never moved for you, so nobody loses their place.</li>
        <li>Under reduced motion the fades stop. The skeleton&apos;s pulse follows the theme&apos;s <Link href="/docs/motion">decorative loops</Link> switch, and the fades follow its speed.</li>
        <li>A form that is submitting is a disabled fieldset, so every control inside is disabled, the same way the browser does it.</li>
      </ul>

      <h2 id="blocks">Which blocks</h2>
      <p>
        {withStates.length} of the {blocks.length} free blocks show states. The rest are static content with nothing to load, submit or fail, and say so on their page.
      </p>
      <ul>
        {withStates.map((b) => (
          <li key={b.name}>
            <Link href={`/blocks/${b.name}`}>{b.title}</Link>: <span className="text-muted-foreground">{kinds(b)}</span>
          </li>
        ))}
      </ul>
      <p>
        A build check keeps this true: a free block that lists no states and gives no reason fails <code>pnpm check</code>, and so does a state example that would break a production build.
      </p>
    </DocsPage>
  )
}
