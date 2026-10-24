// Ballmac UI: Agent 10. https://ui.ballmac.com/blocks/agent-10
"use client"

import * as React from "react"
import { CircleAlert, Hand, Loader2, SendHorizontal, Square, Wrench } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Agent10Tool = { name: string; /** What it was asked, in words. */ input: string; /** What came back, in words. */ output?: string; status: "running" | "done" | "failed" }
type Agent10Message =
  | { id: string; role: "user"; text: string; at?: string }
  | { id: string; role: "agent"; text: string; at?: string; tools?: Agent10Tool[] }
  | { id: string; role: "human"; text: string; at?: string; name: string }

type Agent10Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    messages?: Agent10Message[]
    title?: string
    /** True while the agent is working. Shows Stop in place of Send. */
    running?: boolean
    /** Whether a person has taken over. The agent stays silent until it is handed back. */
    humanActive?: boolean
    onSend?: (text: string) => void | Promise<void>
    onStop?: () => void
    /** Called to take over from, or hand back to, the agent. */
    onHandoff?: (takeOver: boolean) => void | Promise<void>
  }

const messages: Agent10Message[] = [
  { id: "1", role: "user", text: "Why did my refund for order 4821 not arrive?", at: "10:02" },
  {
    id: "2",
    role: "agent",
    text: "The refund was issued on 14 October, but it was sent to a card that has since expired, so the bank returned it. I can re-issue it to the card on file, or to store credit instantly.",
    at: "10:02",
    tools: [
      { name: "lookup_order", input: "Order 4821", output: "Delivered 6 Oct, refund requested 12 Oct", status: "done" },
      { name: "check_refund", input: "Refund for order 4821", output: "Issued 14 Oct, returned by the bank (card expired)", status: "done" },
    ],
  },
  { id: "3", role: "user", text: "Store credit please. And can someone confirm it by email?", at: "10:03" },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4">
      <Skeleton className="ms-auto h-10 w-2/3 rounded-2xl" />
      <Skeleton className="h-28 w-5/6 rounded-2xl" />
      <Skeleton className="ms-auto h-10 w-1/2 rounded-2xl" />
    </div>
  )
}

const TOOL_LABEL = { running: "Working", done: "Done", failed: "Failed" } as const

/**
 * An agent console: the conversation with each tool call shown as a step you can open, Stop while the agent works, and a clear way for a person to take over and hand back.
 * Who said what is written, not only coloured; a person's reply is marked so it is never mistaken for the agent; sending is refused with an empty message.
 */
function Agent10({ messages: list = messages, title = "Support agent", running = false, humanActive = false, onSend, onStop, onHandoff, state = "ready", onRetry, emptyState, errorState, className, ...props }: Agent10Props) {
  const id = React.useId()
  const [text, setText] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [human, setHuman] = React.useState(humanActive)
  const [local, setLocal] = React.useState<Agent10Message[]>([])
  const end = React.useRef<HTMLDivElement>(null)
  const view = state === "ready" && list.length === 0 && local.length === 0 ? "empty" : state
  const all = [...list, ...local]

  React.useEffect(() => { end.current?.scrollIntoView?.({ block: "end" }) }, [all.length])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const t = text.trim()
    if (!t) { setError("Write a message first."); return }
    setBusy(true)
    setError(null)
    try {
      await onSend?.(t)
      setLocal((l) => [...l, human ? { id: `l${l.length}`, role: "human", name: "You", text: t } : { id: `l${l.length}`, role: "user", text: t }])
      setText("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "The message was not sent. It is still here.")
    } finally {
      setBusy(false)
    }
  }
  async function handoff() {
    const next = !human
    setError(null)
    try {
      await onHandoff?.(next)
      setHuman(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : "The handoff did not go through.")
    }
  }

  return (
    <section data-slot="agent-10" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto flex w-full max-w-3xl flex-col px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
          <p aria-live="polite" className="text-muted-foreground mt-0.5 text-sm">{human ? "A person is handling this. The agent is paused." : running ? "The agent is working…" : "The agent is answering."}</p>
        </div>
        <Button variant={human ? "default" : "outline"} onClick={() => void handoff()} disabled={state !== "ready"}>
          <Hand aria-hidden="true" /> {human ? "Hand back to the agent" : "Take over"}
        </Button>
      </header>

      <StateView state={view} onRetry={onRetry} label="Loading the conversation" loading={<Skel />} empty={{ title: "No messages yet", description: "Start the conversation below.", ...emptyState }} error={{ title: "The conversation could not be loaded", description: "Nothing was sent. Check your connection and try again.", ...errorState }}>
        <div className="bg-card flex min-h-0 flex-col rounded-2xl border">
          <div role="log" aria-label="Conversation" aria-live="polite" tabIndex={0} className="focus-visible:ring-ring/50 max-h-[32rem] overflow-y-auto rounded-t-2xl p-4 outline-none focus-visible:ring-[3px] sm:p-5">
            <ol className="grid gap-4">
              {all.map((m) => (
                <li key={m.id} className={cn("flex flex-col gap-1.5", m.role === "user" || (m.role === "human" && m.name === "You") ? "items-end" : "items-start")}>
                  <span className="text-muted-foreground text-xs">
                    {m.role === "user" ? "You" : m.role === "agent" ? "Agent" : `${m.name} (a person)`}{m.at ? ` · ${m.at}` : ""}
                  </span>
                  <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed text-pretty", m.role === "user" ? "bg-foreground text-background" : m.role === "human" ? "border-foreground border-2" : "bg-muted")}>{m.text}</div>
                  {m.role === "agent" && m.tools?.length ? (
                    <ul aria-label="Steps the agent took" className="grid w-full max-w-[85%] gap-1.5">
                      {m.tools.map((t, i) => (
                        <li key={i}>
                          <details className="group rounded-lg border text-sm">
                            <summary className="focus-visible:ring-ring/50 flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 outline-none focus-visible:ring-[3px] [&::-webkit-details-marker]:hidden">
                              {t.status === "running" ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin motion-reduce:animate-none" /> : t.status === "failed" ? <CircleAlert aria-hidden="true" className="text-destructive size-3.5" /> : <Wrench aria-hidden="true" className="size-3.5" />}
                              <span className="font-mono text-xs">{t.name}</span>
                              <span className={cn("ms-auto text-xs", t.status === "failed" ? "text-destructive font-medium" : "text-muted-foreground")}>{TOOL_LABEL[t.status]}</span>
                            </summary>
                            <dl className="text-muted-foreground grid gap-1 border-t px-3 py-2 text-xs">
                              <div><dt className="inline font-medium">Asked: </dt><dd className="inline">{t.input}</dd></div>
                              {t.output && <div><dt className="inline font-medium">Got: </dt><dd className="inline">{t.output}</dd></div>}
                            </dl>
                          </details>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
            <div ref={end} />
          </div>

          <form onSubmit={(e) => void send(e)} noValidate className="border-t p-3">
            <label htmlFor={`${id}-msg`} className="sr-only">{human ? "Reply as a person" : "Message the agent"}</label>
            <div className="flex items-end gap-2">
              <textarea id={`${id}-msg`} rows={2} value={text} onChange={(e) => { setText(e.target.value); setError(null) }} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); e.currentTarget.form?.requestSubmit() } }} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} placeholder={human ? "Reply as a person…" : "Message the agent…"} className="bg-background focus-visible:ring-ring/50 aria-[invalid=true]:border-destructive min-h-11 flex-1 resize-none rounded-xl border px-3 py-2.5 text-sm outline-none focus-visible:ring-[3px]" />
              {running && !human ? (
                <Button type="button" variant="outline" size="lg" onClick={onStop}><Square aria-hidden="true" /> Stop</Button>
              ) : (
                <Button type="submit" size="lg" disabled={busy}>{busy ? <Loader2 aria-hidden="true" className="animate-spin" /> : <SendHorizontal aria-hidden="true" className="rtl:-scale-x-100" />} Send</Button>
              )}
            </div>
            <p id={`${id}-err`} role={error ? "alert" : undefined} className="text-destructive mt-2 min-h-5 text-sm font-medium">{error}</p>
            <p className="text-muted-foreground text-xs">Enter sends. Shift and Enter adds a new line.</p>
          </form>
        </div>
      </StateView>
    </section>
  )
}

export { Agent10, type Agent10Message, type Agent10Props, type Agent10Tool }
