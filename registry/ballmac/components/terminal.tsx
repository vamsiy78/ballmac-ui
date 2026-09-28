// Ballmac UI: Terminal. https://ui.ballmac.com/components/terminal
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Copy } from "lucide-react"
import { motion, useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type TerminalProps = React.ComponentProps<"figure"> & {
  /** Text in the title bar, e.g. "zsh" or "~/my-app". */
  title?: string
  /** "dark" scopes the theme's dark tokens to the window in light mode too; "inherit" follows the page. */
  theme?: "dark" | "inherit"
  /** Classes for the scrolling body. */
  bodyClassName?: string
}

function Terminal({ title, theme = "dark", bodyClassName, className, children, ...props }: TerminalProps) {
  return (
    <figure
      data-slot="terminal"
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-[0_1px_2px_0_rgb(0_0_0/0.08)]",
        theme === "dark" && "dark [color-scheme:dark]",
        className
      )}
      {...props}
    >
      <figcaption
        data-slot="terminal-header"
        className="relative flex h-9 items-center border-b bg-muted/40 px-3.5"
      >
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/35" />
          <span className="size-2.5 rounded-full bg-muted-foreground/35" />
          <span className="size-2.5 rounded-full bg-muted-foreground/35" />
        </span>
        <span className="absolute inset-x-16 truncate text-center font-mono text-xs text-muted-foreground">
          {title ?? <span className="sr-only">Terminal</span>}
        </span>
      </figcaption>
      <div
        data-slot="terminal-body"
        className={cn("overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-6", bodyClassName)}
      >
        {children}
      </div>
    </figure>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Sequencing: TerminalAnimated reveals lines one after another.
 * -----------------------------------------------------------------------------------------------*/

type SequenceContextValue = { active: number; done: (index: number) => void; lineDelay: number; speed: number }
const SequenceContext = React.createContext<SequenceContextValue | null>(null)
const LineIndexContext = React.createContext<number>(-1)

type TerminalAnimatedProps = React.ComponentProps<"div"> & {
  /** Typing speed for command lines, in characters per second. */
  speed?: number
  /** Pause before each non-command line appears, in milliseconds. */
  lineDelay?: number
  /** Wait before the first line starts, in milliseconds. */
  startDelay?: number
  /** Start only once the terminal scrolls into view. */
  startOnView?: boolean
  /** Called when every line has been revealed. */
  onComplete?: () => void
}

/** Wrap TerminalLine children to reveal them in order: commands type out, output lines follow. Reduced motion shows everything at once. */
function TerminalAnimated({
  speed = 36,
  lineDelay = 140,
  startDelay = 300,
  startOnView = true,
  onComplete,
  className,
  children,
  ...props
}: TerminalAnimatedProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" })
  const reduceMotion = useReducedMotion()
  const items = React.Children.toArray(children)
  const total = items.length
  const [active, setActive] = React.useState(-1)
  const onCompleteRef = React.useRef(onComplete)
  React.useEffect(() => {
    onCompleteRef.current = onComplete
  })

  React.useEffect(() => {
    if (reduceMotion) {
      setActive(total)
      return
    }
    if (active !== -1 || (startOnView && !inView)) return
    const t = setTimeout(() => setActive(0), startDelay)
    return () => clearTimeout(t)
  }, [reduceMotion, total, active, startOnView, inView, startDelay])

  React.useEffect(() => {
    if (active >= total && total > 0) onCompleteRef.current?.()
  }, [active, total])

  const done = React.useCallback((index: number) => {
    setActive((current) => (current === index ? index + 1 : current))
  }, [])

  const ctx = React.useMemo(() => ({ active, done, lineDelay, speed }), [active, done, lineDelay, speed])

  return (
    <SequenceContext.Provider value={ctx}>
      <div
        ref={ref}
        data-slot="terminal-animated"
        aria-busy={active < total}
        className={cn("min-h-6", className)}
        {...props}
      >
        {items.map((child, index) => (
          <LineIndexContext.Provider key={React.isValidElement(child) && child.key != null ? child.key : index} value={index}>
            {child}
          </LineIndexContext.Provider>
        ))}
      </div>
    </SequenceContext.Provider>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Lines
 * -----------------------------------------------------------------------------------------------*/

const terminalLineVariants = cva("group/line relative flex min-w-0 items-start gap-2 whitespace-pre", {
  variants: {
    variant: {
      command: "text-foreground",
      output: "text-foreground/75",
      success: "text-chart-2",
      error: "text-destructive",
      comment: "text-muted-foreground italic",
    },
  },
  defaultVariants: { variant: "output" },
})

function Caret() {
  const reduceMotion = useReducedMotion()
  const className = "inline-block h-[1.15em] w-[0.6ch] translate-y-[0.2em] bg-foreground/80"
  if (reduceMotion) return <span aria-hidden="true" className={className} />
  return (
    <motion.span
      aria-hidden="true"
      className={className}
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }}
    />
  )
}

function useTyping(text: string, enabled: boolean, speed: number, onDone: () => void) {
  const [count, setCount] = React.useState(0)
  const onDoneRef = React.useRef(onDone)
  React.useEffect(() => {
    onDoneRef.current = onDone
  })
  React.useEffect(() => {
    if (!enabled) return
    let i = 0
    setCount(0)
    const interval = setInterval(() => {
      i += 1
      setCount(i)
      if (i >= text.length) {
        clearInterval(interval)
        onDoneRef.current()
      }
    }, 1000 / speed)
    return () => clearInterval(interval)
  }, [enabled, text, speed])
  return count
}

function LineCopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <>
      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy command"}
        title="Copy command"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value)
          } catch {
            return
          }
          setCopied(true)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => setCopied(false), 1600)
        }}
        className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-opacity duration-150 hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/line:opacity-100"
      >
        {copied ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  )
}

type TerminalLineProps = React.ComponentProps<"div"> &
  VariantProps<typeof terminalLineVariants> & {
    /** Prompt shown before command lines. */
    prompt?: string
    /** Show a copy button for command lines (copies the text without the prompt). */
    copyable?: boolean
    /** Type the command out character by character (string children only). Implied inside TerminalAnimated. */
    typing?: boolean
    /** Characters per second when typing outside TerminalAnimated. */
    speed?: number
  }

function TerminalLine({
  variant = "output",
  prompt = "$",
  copyable = false,
  typing,
  speed,
  className,
  children,
  ...props
}: TerminalLineProps) {
  const sequence = React.useContext(SequenceContext)
  const index = React.useContext(LineIndexContext)
  const reduceMotion = useReducedMotion()
  const inSequence = sequence !== null && index >= 0
  const isCommand = variant === "command"
  const text = typeof children === "string" ? children : null

  const isActive = inSequence && sequence.active === index
  const typeThis = isCommand && text !== null && !reduceMotion && (inSequence ? typing !== false : !!typing)
  // Standalone typing starts on mount; sequenced typing when this line becomes active.
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const typingEnabled = typeThis && (inSequence ? isActive : mounted)

  const finish = React.useCallback(() => {
    if (inSequence) sequence.done(index)
  }, [inSequence, sequence, index])

  const typed = useTyping(text ?? "", typingEnabled, speed ?? sequence?.speed ?? 36, finish)

  // Non-typing lines inside a sequence advance after a short pause.
  React.useEffect(() => {
    if (!isActive || typeThis) return
    const t = setTimeout(finish, sequence?.lineDelay ?? 0)
    return () => clearTimeout(t)
  }, [isActive, typeThis, finish, sequence?.lineDelay])

  if (inSequence) {
    const visible = index < sequence.active || (isActive && typeThis)
    if (!visible) return null
  }

  const stillTyping = typeThis && (inSequence ? index >= sequence!.active : typed < (text?.length ?? 0))
  const content = typeThis && stillTyping ? (text ?? "").slice(0, typed) : children

  return (
    <div
      data-slot="terminal-line"
      data-variant={variant}
      className={cn(terminalLineVariants({ variant }), className)}
      {...props}
    >
      {isCommand ? (
        <span aria-hidden="true" className="shrink-0 text-muted-foreground select-none">
          {prompt}
        </span>
      ) : null}
      {variant === "success" || variant === "error" ? (
        <>
          <span aria-hidden="true" className="shrink-0 select-none">
            {variant === "success" ? "✓" : "✗"}
          </span>
          <span className="sr-only">{variant === "success" ? "Success: " : "Error: "}</span>
        </>
      ) : null}
      <span className="min-w-0">
        {content}
        {typeThis && stillTyping ? <Caret /> : null}
      </span>
      {isCommand && copyable && text !== null && !stillTyping ? <LineCopyButton value={text} /> : null}
    </div>
  )
}

export { Terminal, TerminalLine, TerminalAnimated, terminalLineVariants, type TerminalProps, type TerminalLineProps, type TerminalAnimatedProps }
