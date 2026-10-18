// Ballmac UI: Accordion. https://ui.ballmac.com/components/accordion
// Based on shadcn/ui's Accordion (MIT, Copyright (c) 2023 shadcn), restyled with hairline dividers and a rotating plus.
"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"

type Shared = Omit<React.ComponentProps<typeof AccordionPrimitive.Root>, "value" | "defaultValue" | "onValueChange" | "multiple" | "className"> & { className?: string }
type AccordionProps = Shared &
  (
    | {
        /** One item open at a time. */
        type: "single"
        value?: string
        defaultValue?: string
        onValueChange?: (value: string) => void
        /** Allow the open item to be closed. Without it one item always stays open. */
        collapsible?: boolean
      }
    | { type: "multiple"; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void; collapsible?: never }
  )

function Accordion({ className, type, value, defaultValue, onValueChange, collapsible, ...props }: AccordionProps) {
  // Base UI always works with lists of open items; "single" is a list of at most one, written as a plain string like before.
  const list = (v: string | string[] | undefined) => (v === undefined ? undefined : Array.isArray(v) ? v : v === "" ? [] : [v])
  const controlled = value !== undefined
  const [own, setOwn] = React.useState<string[]>(list(defaultValue) ?? [])
  // A single accordion that is not collapsible keeps its open item open, so it needs its value held here.
  const keepOne = type === "single" && !collapsible
  const current = controlled ? list(value) : keepOne ? own : undefined
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      multiple={type === "multiple"}
      value={current}
      defaultValue={keepOne || controlled ? undefined : list(defaultValue)}
      onValueChange={(next) => {
        if (keepOne && next.length === 0) return
        if (!controlled) setOwn(next)
        ;(onValueChange as ((v: string | string[]) => void) | undefined)?.(type === "multiple" ? next : (next[0] ?? ""))
      }}
      className={cn("w-full border-y", className)}
      {...props}
    />
  )
}

type AccordionItemProps = Omit<React.ComponentProps<typeof AccordionPrimitive.Item>, "className"> & { className?: string }

function AccordionItem({ className, ...props }: AccordionItemProps) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("border-b last:border-b-0", className)} {...props} />
}

type AccordionTriggerProps = Omit<React.ComponentProps<typeof AccordionPrimitive.Trigger>, "className"> & { className?: string }

function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 items-center justify-between gap-4 rounded-md py-5 text-start text-base font-medium outline-none transition-colors hover:text-foreground/80 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <Plus
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[var(--bm-ease-out,ease-out)] group-data-panel-open:rotate-45 motion-reduce:transition-none"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

type AccordionContentProps = Omit<React.ComponentProps<typeof AccordionPrimitive.Panel>, "className"> & { className?: string }

function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="h-(--accordion-panel-height) overflow-hidden text-sm transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      {...props}
    >
      <div className={cn("pb-5 leading-relaxed text-muted-foreground", className)}>{children}</div>
    </AccordionPrimitive.Panel>
  )
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionTriggerProps,
  type AccordionContentProps,
}
