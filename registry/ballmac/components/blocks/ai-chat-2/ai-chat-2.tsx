// Ballmac UI: AI Chat 2. https://ui.ballmac.com/blocks/ai-chat-2
"use client"

import * as React from "react"
import { Check, FileCode2, MessageSquare, PanelLeft, Plus, Sparkles } from "lucide-react"

import { Chat, ChatFooter, ChatMessages } from "@/components/ballmac/ai-chat"
import { Message, MessageAvatar, MessageContent, MessageCopyAction, MessageActions } from "@/components/ballmac/ai-message"
import { ArtifactPanel } from "@/components/ballmac/artifact-panel"
import { Button } from "@/components/ballmac/button"
import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from "@/components/ballmac/prompt-input"
import { StreamingText } from "@/components/ballmac/streaming-text"
import { cn } from "@/lib/utils"

type AiChat2Turn = {
  id: string
  role: "user" | "assistant"
  text: string
  streaming?: boolean
  /** Which artifact version this reply created or updated. */
  artifact?: number
}

type AiChat2Version = {
  /** Source code shown in the Code tab and copied or downloaded. */
  code: string
  /** The rendered result, shown in the Preview tab. */
  preview: React.ReactNode
  /** What changed, shown on the chip in the chat. */
  note: string
}

type AiChat2Props = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  /** Conversations in the sidebar. */
  conversations?: { id: string; title: string }[]
  /** Name of the generated thing. */
  artifactTitle?: string
  /** Kind of artifact, such as "React component". */
  artifactKind?: string
  /** File name for download. */
  filename?: string
  /** Language label for the code. */
  language?: string
  /** The versions, oldest first. The last one is shown first. */
  versions?: AiChat2Version[]
  /** Messages shown to begin with. */
  defaultMessages?: AiChat2Turn[]
  /** Follow-up prompts offered as chips under the conversation. */
  suggestions?: string[]
  /**
   * Called with the prompt. Return the reply text and, if the reply changes the artifact, the 1-based version it moves to.
   * Without it, a built-in script answers so you can try the whole flow.
   */
  onSend?: (prompt: string) => { reply: string; artifact?: number } | Promise<{ reply: string; artifact?: number }>
  /** Height of the frame. */
  height?: string
}

function PricingPreview({ yearly = false, compact = false }: { yearly?: boolean; compact?: boolean }) {
  const [annual, setAnnual] = React.useState(yearly)
  return (
    <div className={cn("mx-auto flex w-full max-w-md flex-col gap-4 p-4", compact && "max-w-xs")}>
      {yearly && (
        <div className="bg-muted mx-auto flex rounded-full p-1 text-xs font-medium" role="group" aria-label="Billing interval">
          {[
            ["Monthly", false],
            ["Yearly", true],
          ].map(([label, value]) => (
            <button key={String(label)} type="button" aria-pressed={annual === value} onClick={() => setAnnual(value as boolean)} className={cn("focus-visible:ring-ring/50 rounded-full px-3 py-1 outline-none focus-visible:ring-[3px]", annual === value ? "bg-background shadow-sm" : "text-muted-foreground")}>{label as string}</button>
          ))}
        </div>
      )}
      <div className={cn("grid gap-3", !compact && "sm:grid-cols-2")}>
        {[
          ["Starter", annual ? 9 : 12, ["3 projects", "10 GB storage"]],
          ["Pro", annual ? 25 : 32, ["Unlimited projects", "1 TB storage"]],
        ].map(([name, price, feats], i) => (
          <div key={String(name)} className={cn("bg-card rounded-xl border p-4", i === 1 && "border-foreground/30 shadow-md")}>
            <p className="text-sm font-semibold">{name as string}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">${price as number}<span className="text-muted-foreground text-xs font-normal"> / seat / mo</span></p>
            <ul className="text-muted-foreground mt-3 space-y-1.5 text-xs">{(feats as string[]).map((f) => <li key={f} className="flex items-center gap-1.5"><Check className="size-3" aria-hidden="true" />{f}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  )
}

const code1 = `export function PricingTable() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Plan name="Starter" price={12} features={["3 projects", "10 GB storage"]} />
      <Plan name="Pro" price={32} featured features={["Unlimited projects", "1 TB storage"]} />
    </div>
  )
}`

const code2 = `export function PricingTable() {
  const [yearly, setYearly] = useState(true)
  return (
    <div className="grid gap-4">
      <BillingToggle yearly={yearly} onChange={setYearly} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Plan name="Starter" price={yearly ? 9 : 12} features={["3 projects", "10 GB storage"]} />
        <Plan name="Pro" price={yearly ? 25 : 32} featured features={["Unlimited projects", "1 TB storage"]} />
      </div>
    </div>
  )
}`

const defaultVersions: AiChat2Version[] = [
  { code: code1, preview: <PricingPreview />, note: "Two plans side by side" },
  { code: code2, preview: <PricingPreview yearly />, note: "Added a monthly and yearly toggle" },
]

const defaultMessages: AiChat2Turn[] = [
  { id: "u1", role: "user", text: "Build me a simple pricing table component with a Starter and a Pro plan." },
  { id: "a1", role: "assistant", artifact: 1, text: "Here is a pricing table with two plans. The Pro plan is highlighted, and each plan lists what it includes. I put it in a panel on the right so you can see it and copy the code." },
]

const defaultConversations = [
  { id: "c1", title: "Pricing table component" },
  { id: "c2", title: "Refactor the billing hook" },
  { id: "c3", title: "Write release notes for 2.4" },
  { id: "c4", title: "Explain this stack trace" },
]

const defaultSuggestions = ["Add a monthly and yearly toggle", "Explain how the code works"]

function AiChat2({
  conversations = defaultConversations,
  artifactTitle = "Pricing table",
  artifactKind = "React component",
  filename = "pricing-table.tsx",
  language = "tsx",
  versions = defaultVersions,
  defaultMessages: initial = defaultMessages,
  suggestions = defaultSuggestions,
  onSend,
  height = "46rem",
  className,
  style,
  ...props
}: AiChat2Props) {
  const [messages, setMessages] = React.useState(initial)
  const [version, setVersion] = React.useState(Math.max(1, ...initial.map((m) => m.artifact ?? 1)))
  // "auto" shows the panel beside the chat on wide screens only; "open" also lets it cover the chat on narrow ones.
  const [panel, setPanel] = React.useState<"auto" | "open" | "closed">("auto")
  const [sidebar, setSidebar] = React.useState(true)
  const [busy, setBusy] = React.useState(false)
  const [chips, setChips] = React.useState(suggestions)
  const [active, setActive] = React.useState<string | undefined>(conversations[0]?.id)
  const timer = React.useRef<number | null>(null)
  React.useEffect(() => () => { if (timer.current) window.clearInterval(timer.current) }, [])

  const hasArtifact = initial.some((m) => m.artifact) || messages.some((m) => m.artifact)
  const current = versions[Math.min(version, versions.length) - 1] ?? versions[0]

  async function send(prompt: string) {
    if (busy) return
    const id = messages.length
    setChips([])
    setMessages((m) => [...m, { id: `u${id}`, role: "user", text: prompt }, { id: `a${id}`, role: "assistant", text: "", streaming: true }])
    setBusy(true)
    const scripted = () => {
      if (/toggle|yearly|annual/i.test(prompt)) return { reply: "Done. I added a monthly and yearly toggle above the plans. Switching to yearly drops the prices by about 20%, and the cards keep their layout.", artifact: 2 }
      if (/explain|how/i.test(prompt)) return { reply: "The component is a two-column grid of plan cards. Each plan is a small component that takes a name, a price and a list of features. The Pro plan gets a stronger border to make it stand out." }
      return { reply: "Got it. I can change the copy, the number of plans or the layout. Tell me what you would like different and I will update the panel." }
    }
    const result = await Promise.resolve(onSend ? onSend(prompt) : scripted())
    if (result.artifact) {
      setVersion(result.artifact)
      setPanel("open")
    }
    const words = result.reply.split(" ")
    let n = 0
    timer.current = window.setInterval(() => {
      n += 2
      const done = n >= words.length
      setMessages((all) => all.map((m) => (m.id === `a${id}` ? { ...m, text: words.slice(0, n).join(" "), streaming: !done, artifact: done ? result.artifact : undefined } : m)))
      if (done) {
        if (timer.current) window.clearInterval(timer.current)
        setBusy(false)
        if (!result.artifact && /toggle|yearly|annual/i.test(prompt) === false) setChips(suggestions.filter((s) => !/explain/i.test(s) || !/explain|how/i.test(prompt)))
      }
    }, 45)
  }

  return (
    <div data-slot="ai-chat-2" className={cn("bg-background relative flex overflow-hidden rounded-2xl border shadow-[0_30px_80px_-50px_rgb(0_0_0/0.4)]", className)} style={{ height, ...style }} {...props}>
      <aside hidden={!sidebar} className="bg-muted/30 hidden w-60 shrink-0 flex-col border-e lg:flex [&[hidden]]:hidden">
        <div className="p-3">
          <Button variant="outline" className="w-full justify-start" onClick={() => { setMessages([]); setActive(undefined); setChips([]); setPanel("closed") }}><Plus /> New chat</Button>
        </div>
        <nav aria-label="Conversations" className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          <p className="text-muted-foreground px-2 pt-2 pb-1 text-xs font-medium">Recent</p>
          <ul className="space-y-0.5">
            {conversations.map((c) => (
              <li key={c.id}>
                <button type="button" aria-current={c.id === active ? "page" : undefined} onClick={() => setActive(c.id)} className={cn("focus-visible:ring-ring/50 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-start text-sm outline-none transition-colors focus-visible:ring-[3px]", c.id === active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground")}>
                  <MessageSquare className="size-4 shrink-0" aria-hidden="true" /><span className="truncate">{c.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
          <Button variant="ghost" size="icon" className="hidden lg:inline-flex" aria-label={sidebar ? "Hide conversations" : "Show conversations"} aria-pressed={sidebar} onClick={() => setSidebar((s) => !s)}><PanelLeft  className="rtl:-scale-x-100"/></Button>
          <p className="truncate text-sm font-medium">{conversations.find((c) => c.id === active)?.title ?? "New chat"}</p>
          {hasArtifact && panel !== "open" && <Button variant="outline" size="sm" className={cn("ms-auto", panel === "auto" && "xl:hidden")} onClick={() => setPanel("open")}><FileCode2 /> Open {artifactTitle}</Button>}
        </div>

        <Chat className="min-h-0 flex-1">
          <ChatMessages contentClassName="mx-auto w-full max-w-2xl px-4 py-6">
            {messages.length === 0 && (
              <div className="text-muted-foreground flex min-h-64 flex-col items-center justify-center text-center">
                <Sparkles className="size-8" aria-hidden="true" />
                <p className="text-foreground mt-4 font-medium">What shall we build?</p>
                <p className="mt-1 text-sm">Ask for a component, a page or a snippet. The result appears in a panel beside the chat.</p>
              </div>
            )}
            {messages.map((m) =>
              m.role === "user" ? (
                <Message key={m.id} role="user"><MessageContent>{m.text}</MessageContent></Message>
              ) : (
                <Message key={m.id} role="assistant">
                  <MessageAvatar>AI</MessageAvatar>
                  <MessageContent>
                    <StreamingText text={m.text} streaming={m.streaming} />
                    {m.artifact && !m.streaming && (
                      <button type="button" onClick={() => { setVersion(m.artifact!); setPanel("open") }} className="bg-card hover:bg-accent/50 focus-visible:ring-ring/50 mt-3 flex w-full max-w-sm items-center gap-3 rounded-xl border p-3 text-start outline-none transition-colors focus-visible:ring-[3px]">
                        <span aria-hidden="true" className="bg-muted flex size-9 items-center justify-center rounded-lg"><FileCode2 className="size-4" /></span>
                        <span className="min-w-0 flex-1 text-sm"><span className="block font-medium">{artifactTitle} <span className="text-muted-foreground font-normal">· v{m.artifact}</span></span><span className="text-muted-foreground block truncate text-xs">{versions[m.artifact - 1]?.note}</span></span>
                      </button>
                    )}
                  </MessageContent>
                  {!m.streaming && m.text && <MessageActions><MessageCopyAction value={m.text} /></MessageActions>}
                </Message>
              )
            )}
          </ChatMessages>
          <ChatFooter contentClassName="mx-auto w-full max-w-2xl px-4 pb-4">
            {chips.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {chips.map((c) => <button key={c} type="button" onClick={() => send(c)} className="hover:bg-accent focus-visible:ring-ring/50 rounded-full border px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-[3px]">{c}</button>)}
              </div>
            )}
            <PromptInput onSubmit={(v) => send(v)} status={busy ? "streaming" : "idle"}>
              <PromptInputTextarea placeholder="Ask for a change…" />
              <PromptInputToolbar>
                <PromptInputSubmit className="ms-auto" />
              </PromptInputToolbar>
            </PromptInput>
          </ChatFooter>
        </Chat>
      </div>

      {hasArtifact && panel !== "closed" && current && (
        <div className={cn("bg-background xl:static xl:inset-auto xl:z-auto xl:flex xl:w-[28rem] xl:shrink-0 xl:border-s 2xl:w-[34rem]", panel === "open" ? "absolute inset-0 z-10 flex" : "hidden")}>
          <ArtifactPanel
            title={artifactTitle}
            kind={artifactKind}
            icon={<FileCode2 />}
            code={current.code}
            filename={filename}
            language={language}
            versions={versions.length}
            version={Math.min(version, versions.length)}
            onVersionChange={setVersion}
            streaming={busy && messages.at(-1)?.role === "assistant" && !messages.at(-1)?.text}
            onClose={() => setPanel("closed")}
            className="h-full w-full rounded-none border-0"
          >
            {current.preview}
          </ArtifactPanel>
        </div>
      )}
    </div>
  )
}

export { AiChat2, PricingPreview, type AiChat2Props, type AiChat2Turn, type AiChat2Version }
