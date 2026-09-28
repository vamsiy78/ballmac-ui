// Ballmac UI: Textarea. https://ui.ballmac.com/components/textarea
// Based on shadcn/ui's Textarea (MIT, Copyright (c) 2023 shadcn), restyled and extended with auto-resize.
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type TextareaProps = React.ComponentProps<"textarea"> & {
  /** Grow and shrink with the content instead of scrolling. */
  autoResize?: boolean
  /** Smallest height in rows when autoResize is on. Defaults to `rows` or 3. */
  minRows?: number
  /** Largest height in rows when autoResize is on; past it the textarea scrolls. */
  maxRows?: number
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

function Textarea({
  className,
  autoResize = false,
  minRows,
  maxRows,
  rows,
  ref,
  onChange,
  ...props
}: TextareaProps) {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null)
  const min = minRows ?? rows ?? 3

  const resize = React.useCallback(() => {
    const el = innerRef.current
    if (!el || !autoResize) return
    const cs = window.getComputedStyle(el)
    const px = (value: string) => parseFloat(value) || 0
    const lineHeight = px(cs.lineHeight) || px(cs.fontSize) * 1.5 || 24
    const border = px(cs.borderTopWidth) + px(cs.borderBottomWidth)
    const chrome = px(cs.paddingTop) + px(cs.paddingBottom) + border
    const minHeight = min * lineHeight + chrome
    const maxHeight = maxRows ? maxRows * lineHeight + chrome : Infinity
    el.style.height = "auto"
    const content = el.scrollHeight + border
    el.style.height = `${Math.min(Math.max(content, minHeight), maxHeight)}px`
    el.style.overflowY = content > maxHeight + 1 ? "auto" : "hidden"
  }, [autoResize, min, maxRows])

  // Re-measure on mount, on controlled value changes and when the width changes (line wrapping).
  useIsomorphicLayoutEffect(() => {
    resize()
  })
  React.useEffect(() => {
    const el = innerRef.current
    if (!el || !autoResize || typeof ResizeObserver === "undefined") return
    let width = el.offsetWidth
    const observer = new ResizeObserver(() => {
      if (el.offsetWidth !== width) {
        width = el.offsetWidth
        resize()
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [autoResize, resize])

  const setRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  return (
    <textarea
      ref={setRef}
      data-slot="textarea"
      data-autoresize={autoResize || undefined}
      rows={autoResize ? min : rows}
      onChange={(event) => {
        onChange?.(event)
        resize()
      }}
      className={cn(
        "flex min-h-16 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 text-foreground shadow-xs outline-none transition-[color,border-color,box-shadow] duration-150 selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30",
        autoResize && "min-h-0 resize-none",
        className
      )}
      {...props}
    />
  )
}

export { Textarea, type TextareaProps }
