// Ballmac UI: AI Chat 1. https://ui.ballmac.com/blocks/ai-chat-1
"use client"

import * as React from "react"
import { MessageSquare, PanelLeft, Plus, RotateCcw } from "lucide-react"

import { Chat, ChatFooter, ChatMessages } from "@/components/ballmac/ai-chat"
import { Message, MessageAction, MessageActions, MessageAvatar, MessageContent, MessageCopyAction } from "@/components/ballmac/ai-message"
import { Button } from "@/components/ballmac/button"
import { PromptInput, PromptInputAttachButton, PromptInputAttachments, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from "@/components/ballmac/prompt-input"
import { ReasoningDisclosure } from "@/components/ballmac/reasoning-disclosure"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { StreamingText } from "@/components/ballmac/streaming-text"
import { ToolCallCard, type ToolCallCardProps } from "@/components/ballmac/tool-call-card"
import { cn } from "@/lib/utils"

type ChatTurn = {
  id: string
  role: "user" | "assistant"
  text: string
  /** Assistant turns only: still arriving. */
  streaming?: boolean
  /** Assistant turns only: reasoning shown above the answer. */
  reasoning?: { text: string; seconds?: number }
  /** Assistant turns only: tool calls made while answering. */
  tools?: Pick<ToolCallCardProps, "name" | "status" | "duration" | "input" | "result">[]
}

type AiChat1Props = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  /** Conversations in the sidebar. */
  conversations?: { id: string; title: string }[]
  /** The open conversation's id. */
  activeConversation?: string
  /** Called when a conversation is picked or "New chat" is pressed (with null). */
  onSelectConversation?: (id: string | null) => void
  /** The messages of the open conversation. */
  messages?: ChatTurn[]
  /** Models offered in the picker. */
  models?: { id: string; label: string }[]
  /** Selected model id. */
  model?: string
  /** Called when another model is picked. */
  onModelChange?: (id: string) => void
  /** Called with the prompt and attached files. */
  onSubmit?: (value: string, files: File[]) => void
  /** Called by the Stop button while a reply streams. */
  onStop?: () => void
  /** True while the assistant is replying. */
  streaming?: boolean
}

const demoConversations = [
  { id: "c1", title: "Q3 revenue summary" },
  { id: "c2", title: "Fix flaky checkout test" },
  { id: "c3", title: "Draft launch announcement" },
]
const demoMessages: ChatTurn[] = [
  { id: "m1", role: "user", text: "Why did the checkout test fail on the last three runs?" },
  {
    id: "m2",
    role: "assistant",
    reasoning: { text: "Check the CI logs for the failing assertion, then compare timings between passing and failing runs.", seconds: 6 },
    tools: [{ name: "read_ci_logs", status: "success", duration: 612, input: { job: "e2e", runs: 3 }, result: "Timeout waiting for #pay-button (3/3)" }],
    text: "All three failures time out waiting for the pay button. It renders after the payment form loads, which got slower after the new fraud check. Waiting for the form's ready state instead of a fixed timeout fixes it.",
  },
]
const demoModels = [
  { id: "fast", label: "Fast" },
  { id: "balanced", label: "Balanced" },
  { id: "deep", label: "Deep reasoning" },
]

function AiChat1({
  conversations = demoConversations,
  activeConversation = "c2",
  onSelectConversation,
  messages = demoMessages,
  models = demoModels,
  model: modelProp,
  onModelChange,
  onSubmit,
  onStop,
  streaming = false,
  className,
  ...props
}: AiChat1Props) {
  const [sidebar, setSidebar] = React.useState(true)
  const [modelState, setModelState] = React.useState(models[1]?.id ?? models[0]?.id)
  const model = modelProp ?? modelState
  return (
    <div data-slot="ai-chat-1" className={cn("flex h-[720px] w-full overflow-hidden border bg-background", className)} {...props}>
      <aside hidden={!sidebar} className="hidden w-64 shrink-0 flex-col border-e bg-card md:flex [&[hidden]]:hidden">
        <div className="p-3">
          <Button variant="outline" className="w-full justify-start" onClick={() => onSelectConversation?.(null)}>
            <Plus /> New chat
          </Button>
        </div>
        <nav aria-label="Conversations" className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          <p className="px-2 pt-2 pb-1 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Recent</p>
          <ul className="space-y-0.5">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  aria-current={c.id === activeConversation ? "page" : undefined}
                  onClick={() => onSelectConversation?.(c.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    c.id === activeConversation ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <MessageSquare className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{c.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
          <Button variant="ghost" size="icon-sm" className="hidden md:inline-flex" aria-label={sidebar ? "Hide conversations" : "Show conversations"} aria-pressed={sidebar} onClick={() => setSidebar((s) => !s)}>
            <PanelLeft  className="rtl:-scale-x-100"/>
          </Button>
          <p className="truncate text-sm font-medium">{conversations.find((c) => c.id === activeConversation)?.title ?? "New chat"}</p>
          <div className="ms-auto">
            <Select
              value={model}
              onValueChange={(v) => {
                setModelState(v)
                onModelChange?.(v)
              }}
            >
              <SelectTrigger size="sm" aria-label="Model" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Chat className="min-h-0 flex-1">
          <ChatMessages contentClassName="mx-auto w-full max-w-3xl px-4 py-6">
            {messages.map((m) =>
              m.role === "user" ? (
                <Message key={m.id} role="user">
                  <MessageContent>{m.text}</MessageContent>
                </Message>
              ) : (
                <Message key={m.id} role="assistant">
                  <MessageAvatar>AI</MessageAvatar>
                  <MessageContent>
                    {m.reasoning && (
                      <ReasoningDisclosure streaming={m.streaming && !m.text} duration={m.reasoning.seconds}>
                        {m.reasoning.text}
                      </ReasoningDisclosure>
                    )}
                    {m.tools?.map((t, i) => <ToolCallCard key={`${t.name}-${i}`} {...t} />)}
                    <StreamingText text={m.text} streaming={m.streaming} />
                  </MessageContent>
                  {!m.streaming && (
                    <MessageActions>
                      <MessageCopyAction value={m.text} />
                      <MessageAction label="Regenerate">
                        <RotateCcw />
                      </MessageAction>
                    </MessageActions>
                  )}
                </Message>
              )
            )}
          </ChatMessages>
          <ChatFooter contentClassName="mx-auto w-full max-w-3xl px-4 pb-4">
            <PromptInput onSubmit={(v, f) => onSubmit?.(v, f)} status={streaming ? "streaming" : "idle"} onStop={onStop}>
              <PromptInputAttachments />
              <PromptInputTextarea placeholder="Message the assistant…" />
              <PromptInputToolbar>
                <PromptInputAttachButton />
                <PromptInputSubmit className="ms-auto" />
              </PromptInputToolbar>
            </PromptInput>
            <p className="mt-2 text-center text-xs text-muted-foreground">Answers can be wrong. Check important details.</p>
          </ChatFooter>
        </Chat>
      </div>
    </div>
  )
}

export { AiChat1, type AiChat1Props, type ChatTurn }
