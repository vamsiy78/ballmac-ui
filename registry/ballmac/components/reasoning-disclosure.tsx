// Ballmac UI: Reasoning Disclosure. https://ui.ballmac.com/components/reasoning-disclosure
"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/** "Thought for 12s", "Thought for 1m 5s", "Thought for a few seconds". */
function formatThoughtDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 1) return "Thought for a few seconds"
  const total = Math.round(seconds)
  if (total < 60) return `Thought for ${total}s`
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return rest ? `Thought for ${minutes}m ${rest}s` : `Thought for ${minutes}m`
}

function ShimmerLabel({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return <span>{children}</span>
  return (
    <motion.span
      className="bg-clip-text text-transparent"
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--muted-foreground) 35%, var(--foreground) 50%, var(--muted-foreground) 65%)",
        backgroundSize: "250% 100%",
      }}
      initial={{ backgroundPosition: "100% 0%" }}
      animate={{ backgroundPosition: "0% 0%" }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  )
}

type ReasoningDisclosureProps = Omit<React.ComponentProps<"div">, "dir"> & {
  /** True while the model is still reasoning. Shows "Thinking…" and opens the panel. */
  streaming?: boolean
  /** How long the model reasoned, in seconds. Shown as "Thought for 12s" once streaming ends. */
  duration?: number
  /** Controlled open state. When set, streaming no longer opens or closes the panel. */
  open?: boolean
  /** Initial open state when uncontrolled. Defaults to `streaming`. */
  defaultOpen?: boolean
  /** Called when the panel opens or closes, including the automatic open and collapse. */
  onOpenChange?: (open: boolean) => void
  /** Collapse automatically when streaming ends (uncontrolled only). */
  autoCollapse?: boolean
  /** Replaces the header text. */
  label?: React.ReactNode
  /** Classes for the content panel. */
  contentClassName?: string
}

function ReasoningDisclosure({
  streaming = false,
  duration,
  open: openProp,
  defaultOpen,
  onOpenChange,
  autoCollapse = true,
  label,
  contentClassName,
  className,
  children,
  ...props
}: ReasoningDisclosureProps) {
  const controlled = openProp !== undefined
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? streaming)
  const open = controlled ? openProp : internalOpen
  const onOpenChangeRef = React.useRef(onOpenChange)
  React.useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  })

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next)
      onOpenChangeRef.current?.(next)
    },
    [controlled]
  )

  // Open when streaming starts, collapse when it ends.
  const wasStreaming = React.useRef(streaming)
  React.useEffect(() => {
    if (wasStreaming.current === streaming) return
    wasStreaming.current = streaming
    if (controlled) return
    if (streaming) setOpen(true)
    else if (autoCollapse) setOpen(false)
  }, [streaming, controlled, autoCollapse, setOpen])

  const heading =
    label ??
    (streaming ? <ShimmerLabel>Thinking…</ShimmerLabel> : duration !== undefined ? formatThoughtDuration(duration) : "Reasoning")

  return (
    <CollapsiblePrimitive.Root
      data-slot="reasoning-disclosure"
      data-streaming={streaming || undefined}
      open={open}
      onOpenChange={setOpen}
      className={cn("group/reasoning w-full text-sm", className)}
      {...props}
    >
      <CollapsiblePrimitive.Trigger
        data-slot="reasoning-disclosure-trigger"
        className="-mx-1.5 inline-flex h-7 items-center gap-1.5 rounded-md px-1.5 text-muted-foreground outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="font-medium">{heading}</span>
        <ChevronRight
          aria-hidden="true"
          className="size-3.5 transition-transform duration-150 group-data-[state=open]/reasoning:rotate-90 rtl:group-data-[state=closed]/reasoning:rotate-180 motion-reduce:transition-none"
        />
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content
        data-slot="reasoning-disclosure-content"
        className={cn(
          "mt-1.5 border-s-2 border-border ps-4 text-[13px] leading-6 whitespace-pre-wrap break-words text-muted-foreground",
          contentClassName
        )}
      >
        {children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

export { ReasoningDisclosure, formatThoughtDuration, type ReasoningDisclosureProps }
