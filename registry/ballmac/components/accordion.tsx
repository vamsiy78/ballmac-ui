// Ballmac UI: Accordion. https://ui.ballmac.com/components/accordion
// Based on shadcn/ui's Accordion (MIT, Copyright (c) 2023 shadcn), restyled with hairline dividers and a rotating plus.
"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"

type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root>

function Accordion({ className, ...props }: AccordionProps) {
  return <AccordionPrimitive.Root data-slot="accordion" className={cn("w-full border-y", className)} {...props} />
}

type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>

function AccordionItem({ className, ...props }: AccordionItemProps) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("border-b last:border-b-0", className)} {...props} />
}

type AccordionTriggerProps = React.ComponentProps<typeof AccordionPrimitive.Trigger>

function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 items-center justify-between gap-4 rounded-md py-5 text-left text-base font-medium outline-none transition-colors hover:text-foreground/80 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <Plus
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[var(--bm-ease-out,ease-out)] group-data-[state=open]:rotate-45 motion-reduce:transition-none"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

type AccordionContentProps = React.ComponentProps<typeof AccordionPrimitive.Content>

function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none"
      {...props}
    >
      <div className={cn("pb-5 leading-relaxed text-muted-foreground", className)}>{children}</div>
    </AccordionPrimitive.Content>
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
