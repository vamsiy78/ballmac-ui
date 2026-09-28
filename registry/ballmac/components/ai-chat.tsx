// Ballmac UI: AI Chat. https://ui.ballmac.com/components/ai-chat
"use client"

import * as React from "react"
import { ArrowDown } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ballmac/button"
import { spring } from "@/lib/ballmac/motion"
import { cn } from "@/lib/utils"

/** Pixels from the bottom that still count as "at the bottom". */
const BOTTOM_THRESHOLD = 48

type ChatScroll = {
  /** Callback ref for the scroll container. */
  scrollRef: (node: HTMLDivElement | null) => void
  /** Callback ref for the element whose height grows as content streams in. */
  contentRef: (node: HTMLDivElement | null) => void
  /** Whether the view is pinned to the newest content. */
  isAtBottom: boolean
  /** Scroll to the newest content and stick there while it grows. */
  scrollToBottom: (behavior?: ScrollBehavior) => void
}

function useStickToBottom(): ChatScroll {
  const [scroller, setScroller] = React.useState<HTMLDivElement | null>(null)
  const [content, setContent] = React.useState<HTMLDivElement | null>(null)
  const stick = React.useRef(true)
  const [isAtBottom, setIsAtBottom] = React.useState(true)
  const reduceMotion = useReducedMotion()

  const scrollToBottom = React.useCallback(
    (behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth") => {
      stick.current = true
      setIsAtBottom(true)
      scroller?.scrollTo({ top: scroller.scrollHeight, behavior })
    },
    [reduceMotion, scroller]
  )

  React.useEffect(() => {
    if (!scroller) return
    let lastTop = scroller.scrollTop
    const onScroll = () => {
      const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
      const atBottom = distance <= BOTTOM_THRESHOLD
      // Only an upward scroll releases the pin; smooth scrolls towards the bottom keep it.
      if (scroller.scrollTop < lastTop - 1 && !atBottom) stick.current = false
      if (atBottom) stick.current = true
      lastTop = scroller.scrollTop
      setIsAtBottom(stick.current || atBottom)
    }
    const follow = () => {
      if (stick.current) {
        scroller.scrollTop = scroller.scrollHeight
        lastTop = scroller.scrollTop
      } else onScroll()
    }

    follow()
    scroller.addEventListener("scroll", onScroll, { passive: true })
    const observer = new ResizeObserver(follow)
    observer.observe(scroller)
    if (content) observer.observe(content)
    return () => {
      scroller.removeEventListener("scroll", onScroll)
      observer.disconnect()
    }
  }, [scroller, content])

  return { scrollRef: setScroller, contentRef: setContent, isAtBottom, scrollToBottom }
}

const ChatContext = React.createContext<ChatScroll | null>(null)

/** Read the scroll state of the surrounding <Chat>, e.g. to jump to the bottom after the user sends a message. */
function useChatScroll() {
  const ctx = React.useContext(ChatContext)
  if (!ctx) throw new Error("useChatScroll must be used inside <Chat>.")
  return ctx
}

type ChatProps = React.ComponentProps<"div">

/** Full-height column: messages scroll, the footer stays put. Give it (or its parent) a height. */
function Chat({ className, ...props }: ChatProps) {
  const scroll = useStickToBottom()
  return (
    <ChatContext.Provider value={scroll}>
      <div data-slot="chat" className={cn("flex h-full min-h-0 w-full flex-col", className)} {...props} />
    </ChatContext.Provider>
  )
}

type ChatMessagesProps = React.ComponentProps<"div"> & {
  /** Classes for the inner column that holds the messages (width, gap, padding). */
  contentClassName?: string
  /** Accessible name of the log. */
  label?: string
  /** Accessible name of the jump-to-latest button. */
  scrollButtonLabel?: string
}

/**
 * The scrolling message log. Sticks to the bottom while content streams in, unless the
 * reader scrolled up; then shows a "scroll to latest" button.
 */
function ChatMessages({
  label = "Conversation",
  scrollButtonLabel = "Scroll to latest message",
  contentClassName,
  className,
  children,
  ...props
}: ChatMessagesProps) {
  const ctx = React.useContext(ChatContext)
  const local = useStickToBottom()
  const { scrollRef, contentRef, isAtBottom, scrollToBottom } = ctx ?? local
  const reduceMotion = useReducedMotion()

  return (
    <div data-slot="chat-messages-viewport" className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        data-slot="chat-messages"
        role="log"
        aria-live="polite"
        aria-label={label}
        tabIndex={0}
        className={cn(
          "absolute inset-0 overflow-y-auto overscroll-contain outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
          className
        )}
        {...props}
      >
        <div
          ref={contentRef}
          data-slot="chat-messages-content"
          className={cn("mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-4 py-6", contentClassName)}
        >
          {children}
        </div>
      </div>
      <AnimatePresence>
        {!isAtBottom ? (
          <motion.div
            key="scroll-to-latest"
            className="absolute bottom-3 left-1/2 -translate-x-1/2"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
            transition={reduceMotion ? { duration: 0.12 } : spring.snappy}
          >
            <Button
              data-slot="chat-scroll-button"
              type="button"
              variant="outline"
              size="icon-sm"
              shape="pill"
              aria-label={scrollButtonLabel}
              title={scrollButtonLabel}
              onClick={() => scrollToBottom()}
              className="bg-background shadow-[0_2px_8px_0_rgb(0_0_0/0.08)]"
            >
              <ArrowDown />
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

type ChatEmptyProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Small mark above the title (an icon or logo). */
  icon?: React.ReactNode
  /** Headline, e.g. "How can I help?" */
  title?: React.ReactNode
  /** One line under the title. */
  description?: React.ReactNode
}

/** Empty state shown before the first message. Put <ChatSuggestions> in children. */
function ChatEmpty({ icon, title, description, className, children, ...props }: ChatEmptyProps) {
  return (
    <div
      data-slot="chat-empty"
      className={cn("m-auto flex w-full max-w-md flex-col items-center gap-3 px-2 py-8 text-center", className)}
      {...props}
    >
      {icon ? (
        <div
          aria-hidden="true"
          className="mb-1 flex size-10 items-center justify-center rounded-xl border bg-card text-muted-foreground [&_svg]:size-5"
        >
          {icon}
        </div>
      ) : null}
      {title ? <h2 className="text-base font-semibold tracking-tight text-balance">{title}</h2> : null}
      {description ? <p className="text-sm text-balance text-muted-foreground">{description}</p> : null}
      {children}
    </div>
  )
}

const SuggestionsContext = React.createContext<((value: string) => void) | undefined>(undefined)

type ChatSuggestionsProps = Omit<React.ComponentProps<"ul">, "onSelect"> & {
  /** Called with a suggestion's value when it is clicked. Usually sends it as a message. */
  onSelect?: (value: string) => void
}

function ChatSuggestions({ onSelect, className, children, ...props }: ChatSuggestionsProps) {
  return (
    <SuggestionsContext.Provider value={onSelect}>
      <ul
        data-slot="chat-suggestions"
        aria-label="Suggestions"
        className={cn("mt-2 flex flex-wrap justify-center gap-2", className)}
        {...props}
      >
        {React.Children.map(children, (child) => (child == null ? null : <li className="max-w-full">{child}</li>))}
      </ul>
    </SuggestionsContext.Provider>
  )
}

type ChatSuggestionProps = React.ComponentProps<"button"> & {
  /** Text passed to onSelect. Defaults to the button's text when children is a string. */
  value?: string
}

function ChatSuggestion({ value, className, children, onClick, ...props }: ChatSuggestionProps) {
  const onSelect = React.useContext(SuggestionsContext)
  return (
    <button
      data-slot="chat-suggestion"
      type="button"
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        const text = value ?? (typeof children === "string" ? children : "")
        if (text) onSelect?.(text)
      }}
      className={cn(
        "inline-flex min-h-8 max-w-full items-center rounded-full border bg-card px-3 py-1 text-left text-[13px] text-foreground outline-none transition-colors duration-150 hover:border-foreground/20 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

type ChatFooterProps = React.ComponentProps<"div"> & {
  /** Classes for the inner column (match ChatMessages' width). */
  contentClassName?: string
}

/** Area under the log for the prompt input and a short disclaimer. */
function ChatFooter({ contentClassName, className, children, ...props }: ChatFooterProps) {
  return (
    <div data-slot="chat-footer" className={cn("sticky bottom-0 shrink-0 bg-background px-4 pt-2 pb-4", className)} {...props}>
      <div className={cn("mx-auto w-full max-w-3xl", contentClassName)}>{children}</div>
    </div>
  )
}

export {
  Chat,
  ChatMessages,
  ChatEmpty,
  ChatSuggestions,
  ChatSuggestion,
  ChatFooter,
  useChatScroll,
  type ChatProps,
  type ChatMessagesProps,
  type ChatEmptyProps,
  type ChatSuggestionsProps,
  type ChatSuggestionProps,
  type ChatFooterProps,
}
