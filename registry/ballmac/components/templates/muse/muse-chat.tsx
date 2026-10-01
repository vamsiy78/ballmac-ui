// Ballmac UI: Muse chat page. https://ui.ballmac.com/templates/template-muse
"use client"

import * as React from "react"
import { FileText, Share2, Sparkles } from "lucide-react"

import { Chat, ChatFooter, ChatMessages } from "@/components/ballmac/ai-chat"
import { Message, MessageActions, MessageAvatar, MessageContent, MessageCopyAction } from "@/components/ballmac/ai-message"
import { ArtifactPanel } from "@/components/ballmac/artifact-panel"
import { Citation } from "@/components/ballmac/citation"
import { ModelPicker } from "@/components/ballmac/model-picker"
import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from "@/components/ballmac/prompt-input"
import { ReasoningDisclosure } from "@/components/ballmac/reasoning-disclosure"
import { StreamingText } from "@/components/ballmac/streaming-text"
import { SuggestionChips } from "@/components/ballmac/suggestion-chips"
import { ThinkingIndicator } from "@/components/ballmac/thinking-indicator"
import { artifacts, models, replies, suggestions } from "@/components/ballmac/templates/muse/muse-data"
import { MuseMark, MuseShell, museButton, type MuseHrefs } from "@/components/ballmac/templates/muse/muse-theme"
import { cn } from "@/lib/utils"

type Turn = { id: string; role: "user" | "assistant"; text: string; reasoning?: string; sources?: boolean; artifact?: boolean; state?: "thinking" | "streaming" | "done" }

const plan = artifacts[0]

const starter: Turn[] = [
  { id: "t1", role: "user", text: "Help me turn these notes into a Q4 plan for the design team. We have an onboarding rebuild, a component library refresh and not enough research." },
  {
    id: "t2",
    role: "assistant",
    state: "done",
    reasoning: "The notes name three efforts but not owners or dates. A plan needs a few clear bets, a rough order and the risks. I should keep it short, and ask for the owners rather than inventing them.",
    text: "Here is a plan that keeps the team to three bets, in the order I would run them.\n\nOnboarding comes first because it has a hard date and the most customer impact. The component library refresh can run alongside it, as long as it stays small and ships in pieces. Research is the one most likely to be squeezed, so I gave it a standing weekly slot instead of a project.\n\nI left owners blank where your notes did not say. I have put the plan in a document so you can edit it.",
    sources: true,
    artifact: true,
  },
  { id: "t3", role: "user", text: "Great. Can you make the risks section sharper?" },
  {
    id: "t4",
    role: "assistant",
    state: "done",
    text: "Yes. I would name the two risks that can actually derail the quarter and drop the rest: scope creep on onboarding, and engineering capacity in November. Each gets an owner and an early warning sign, so you know in week three, not week eleven.",
  },
]

const sourceList = [
  { title: "Planning a quarter with three bets", url: "https://example.com/three-bets", site: "Design Ops Handbook", snippet: "Teams that limit themselves to three bets ship more of them." },
  { title: "Why research gets cut first", url: "https://example.org/research-squeezed", site: "Field Notes", snippet: "A standing weekly slot protects research better than a project plan does." },
]

type MuseChatProps = React.ComponentProps<"div"> & {
  /** "conversation" starts with a finished chat and an open document; "empty" starts a new chat with suggestions. */
  start?: "conversation" | "empty"
  hrefs?: Partial<MuseHrefs>
}

/** The Muse chat: a calm reading column with reasoning, sources and a document panel, plus a model picker and a streamed reply to anything you send. */
function MuseChat({ start = "conversation", hrefs, ...props }: MuseChatProps) {
  const empty = start === "empty"
  const [turns, setTurns] = React.useState<Turn[]>(empty ? [] : starter)
  const [model, setModel] = React.useState("muse-5")
  const [panel, setPanel] = React.useState(!empty)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const count = React.useRef(0)
  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const busy = turns.some((t) => t.state === "thinking" || t.state === "streaming")

  function send(text: string) {
    if (busy || !text.trim()) return
    const n = turns.length
    const reply = replies[count.current++ % replies.length]
    setTurns((all) => [...all, { id: `u${n}`, role: "user", text }, { id: `a${n}`, role: "assistant", text: "", state: "thinking" }])
    timers.current.push(setTimeout(() => setTurns((all) => all.map((t) => (t.id === `a${n}` ? { ...t, text: reply, state: "streaming" } : t))), 900))
  }
  function finish(id: string) {
    setTurns((all) => all.map((t) => (t.id === id ? { ...t, state: "done" } : t)))
  }

  const greeting = (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 pt-[10dvh] text-center">
      <MuseMark className="size-12" />
      <h2 className="mt-6 text-3xl font-medium tracking-[-0.02em] [font-family:var(--muse-serif),ui-serif,Georgia,serif] sm:text-4xl">Good morning, Mina.</h2>
      <p className="text-muted-foreground mt-3 text-pretty">What would you like to think through today?</p>
    </div>
  )

  return (
    <MuseShell
      page={empty ? "new" : "chat"}
      activeChat={empty ? undefined : "c1"}
      title={empty ? "New chat" : "Q4 plan for the design team"}
      hrefs={hrefs}
      fill
      actions={
        <>
          <ModelPicker models={models} value={model} onValueChange={setModel} className="max-w-44" />
          {!empty && <button type="button" className={cn(museButton.outline, "hidden sm:inline-flex")}><Share2 aria-hidden="true" /> Share</button>}
        </>
      }
      {...props}
    >
      <div className="relative flex min-h-0 min-w-0 flex-1">
        <Chat className="min-w-0 flex-1">
          <ChatMessages contentClassName="mx-auto w-full max-w-2xl px-4 py-6">
            {turns.length === 0 && greeting}
            <div className="space-y-8">
              {turns.map((t) =>
                t.role === "user" ? (
                  <Message key={t.id} role="user"><MessageContent className="bg-secondary rounded-2xl px-4 py-3 text-[15px] text-pretty">{t.text}</MessageContent></Message>
                ) : (
                  <Message key={t.id} role="assistant">
                    <MessageAvatar className="bg-transparent"><MuseMark className="size-7" /></MessageAvatar>
                    <MessageContent className="min-w-0 space-y-4">
                      {t.state === "thinking" && <ThinkingIndicator variant="dots" label="Thinking" />}
                      {t.reasoning && <ReasoningDisclosure duration={9}><p className="text-sm text-pretty">{t.reasoning}</p></ReasoningDisclosure>}
                      {t.text && (
                        <StreamingText
                          text={t.text}
                          animate={t.state === "streaming"}
                          streaming={t.state === "streaming"}
                          speed={170}
                          onAnimationComplete={() => finish(t.id)}
                          className="text-[17px] leading-8 text-pretty [font-family:var(--muse-serif),ui-serif,Georgia,serif]"
                        />
                      )}
                      {t.sources && (
                        <p className="text-muted-foreground text-sm">
                          Drawing on <Citation sources={sourceList} variant="pill" /> two sources about planning with limited bets.
                        </p>
                      )}
                      {t.artifact && (
                        <button type="button" onClick={() => setPanel(true)} className="bg-card hover:bg-accent/50 focus-visible:ring-ring/50 flex w-full max-w-sm items-center gap-3 rounded-2xl border p-3 text-left outline-none transition-colors focus-visible:ring-[3px]">
                          <span aria-hidden="true" className="bg-chart-1/15 text-chart-1 flex size-10 items-center justify-center rounded-xl"><FileText className="size-5" /></span>
                          <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{plan.title}</span><span className="text-muted-foreground block text-xs">Document · open to edit</span></span>
                        </button>
                      )}
                    </MessageContent>
                    {t.state === "done" && t.text && <MessageActions><MessageCopyAction value={t.text} /></MessageActions>}
                  </Message>
                )
              )}
            </div>
          </ChatMessages>
          <ChatFooter contentClassName="mx-auto w-full max-w-2xl px-4 pb-5">
            {turns.length === 0 && <SuggestionChips className="mb-4" variant="cards" label="Try one of these" suggestions={suggestions} onSelect={(p) => send(p)} />}
            <PromptInput onSubmit={(v) => send(v)} status={busy ? "streaming" : "idle"} className="rounded-2xl">
              <PromptInputTextarea placeholder="Message Muse" aria-label="Message Muse" />
              <PromptInputToolbar>
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs"><Sparkles className="size-3.5" aria-hidden="true" />{models.find((m) => m.id === model)?.name}</span>
                <PromptInputSubmit className="ml-auto" />
              </PromptInputToolbar>
            </PromptInput>
            <p className="text-muted-foreground mt-2 text-center text-xs">Muse can make mistakes. Check anything that matters.</p>
          </ChatFooter>
        </Chat>

        {panel && !empty && (
          <div className="bg-background absolute inset-0 z-10 flex xl:static xl:z-auto xl:w-[26rem] xl:shrink-0 xl:border-l 2xl:w-[32rem]">
            <ArtifactPanel title={plan.title} kind="Document" icon={<FileText />} code={plan.body} filename={plan.filename} language={plan.language} onClose={() => setPanel(false)} className="h-full w-full rounded-none border-0">
              <div className="space-y-5 p-6 [font-family:var(--muse-serif),ui-serif,Georgia,serif]">
                <h2 className="text-2xl font-semibold tracking-tight">Q4 design plan</h2>
                <section><h3 className="text-chart-1 text-sm font-semibold tracking-wide uppercase [font-family:var(--muse-sans)]">Goals</h3><ul className="mt-2 list-disc space-y-1.5 pl-5 text-[16px] leading-7"><li>Ship the new onboarding flow by Oct 31</li><li>Cut design-to-dev handoff time in half</li><li>Run two customer research rounds</li></ul></section>
                <section><h3 className="text-chart-1 text-sm font-semibold tracking-wide uppercase [font-family:var(--muse-sans)]">Three bets</h3><ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[16px] leading-7"><li>Onboarding rebuild</li><li>Component library v2</li><li>Research ops</li></ol></section>
                <section><h3 className="text-chart-1 text-sm font-semibold tracking-wide uppercase [font-family:var(--muse-sans)]">Risks and owners</h3><ul className="mt-2 list-disc space-y-1.5 pl-5 text-[16px] leading-7"><li>Scope creep on onboarding (Priya)</li><li>Engineering capacity in November (Dev)</li></ul></section>
              </div>
            </ArtifactPanel>
          </div>
        )}
      </div>
    </MuseShell>
  )
}

export { MuseChat, type MuseChatProps }
