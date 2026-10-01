// Ballmac UI: Testimonials 2. https://ui.ballmac.com/blocks/testimonials-2
"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ballmac/avatar"
import { Badge } from "@/components/ballmac/badge"
import { Button } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"

type Testimonials2Item = {
  /** The quote, without quotation marks. */
  quote: string
  /** Person's name. */
  name: string
  /** Their role. */
  role: string
  /** Their company. */
  company: string
  /** Profile photo. Initials are shown when omitted. */
  image?: string
  /** A result worth highlighting, e.g. "−38% support tickets". */
  result?: string
}

type Testimonials2Props = Omit<React.ComponentProps<"section">, "title" | "onChange"> & {
  /** Label above the quote. */
  eyebrow?: string
  /** The quotes. Three to five work best. */
  items?: Testimonials2Item[]
  /** Controlled index of the quote shown. */
  value?: number
  /** Index shown first when uncontrolled. */
  defaultValue?: number
  /** Called when the visitor picks another quote. */
  onValueChange?: (index: number) => void
  /** Milliseconds between automatic changes. 0 keeps it manual (the default). Pauses on hover and focus, and never runs with reduced motion. */
  autoplay?: number
}

const defaults: Testimonials2Item[] = [
  {
    quote: "We replaced three tools and two spreadsheets with Acme in a single afternoon. Month-end close went from five days to one.",
    name: "Priya Raman",
    role: "VP Finance",
    company: "Northwind",
    result: "Close time down 80%",
  },
  {
    quote: "The approval flow finally matches how our team actually works. Nobody asks where an invoice is anymore, because they can just look.",
    name: "Marcus Webb",
    role: "Head of Operations",
    company: "Globex",
    result: "−38% support tickets",
  },
  {
    quote: "Setup took minutes and our auditors loved the trail. It is the first finance tool I have rolled out without a single training session.",
    name: "Elena Fischer",
    role: "Controller",
    company: "Initech",
    result: "Zero training sessions",
  },
  {
    quote: "Our customers pay faster because the invoices look great and the payment link works on a phone. That alone paid for the year.",
    name: "Tomás Herrera",
    role: "Founder",
    company: "Umbrella Studio",
    result: "Paid 6 days faster",
  },
]

const tones = ["bg-chart-1/25", "bg-chart-3/25", "bg-chart-5/25", "bg-chart-2/25", "bg-chart-4/25"]
const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2)

function Testimonials2({
  eyebrow = "Loved by finance teams",
  items = defaults,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  autoplay = 0,
  className,
  ...props
}: Testimonials2Props) {
  const [internal, setInternal] = React.useState(defaultValue)
  const index = Math.min(Math.max(valueProp ?? internal, 0), Math.max(items.length - 1, 0))
  const reduce = useReducedMotion()
  const [paused, setPaused] = React.useState(false)
  const count = items.length

  const go = React.useCallback(
    (next: number) => {
      const wrapped = (next + count) % count
      if (valueProp === undefined) setInternal(wrapped)
      onValueChange?.(wrapped)
    },
    [count, onValueChange, valueProp]
  )

  React.useEffect(() => {
    if (!autoplay || reduce || paused || count < 2) return
    const id = window.setTimeout(() => go(index + 1), autoplay)
    return () => window.clearTimeout(id)
  }, [autoplay, reduce, paused, count, index, go])

  const current = items[index]
  if (!current) return null

  return (
    <section
      data-slot="testimonials-2"
      className={cn("mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-28", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      {...props}
    >
      <TabsPrimitive.Root value={String(index)} onValueChange={(v) => go(Number(v))} className="flex flex-col items-center text-center">
        <Badge variant="outline" className="rounded-full px-3 py-1">{eyebrow}</Badge>

        <div className="relative mt-6 w-full pt-16">
          <span aria-hidden="true" className="text-chart-1/30 pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 font-serif text-[7rem] leading-[0.8] select-none">“</span>
          {items.map((item, i) => (
            <TabsPrimitive.Content key={i} value={String(i)} className="focus-visible:ring-ring/50 relative rounded-2xl outline-none focus-visible:ring-[3px]">
              <motion.figure
                initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-3xl"
              >
                <blockquote className="text-2xl leading-[1.35] font-medium tracking-[-0.025em] text-balance sm:text-3xl lg:text-4xl">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-8 flex flex-col items-center gap-3">
                  <span className="text-base">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-muted-foreground">, {item.role} at {item.company}</span>
                  </span>
                  {item.result && <Badge status="success">{item.result}</Badge>}
                </figcaption>
              </motion.figure>
            </TabsPrimitive.Content>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-3">
          <Button variant="outline" size="icon" shape="pill" aria-label="Previous testimonial" onClick={() => go(index - 1)} className="hidden sm:inline-flex">
            <ArrowLeft />
          </Button>
          <TabsPrimitive.List aria-label="Choose a testimonial" className="flex items-center gap-1 rounded-full border p-1.5">
            {items.map((item, i) => (
              <TabsPrimitive.Trigger
                key={i}
                value={String(i)}
                aria-label={`${item.name}, ${item.company}`}
                className="group/avatar focus-visible:ring-ring/50 rounded-full p-0.5 outline-none focus-visible:ring-[3px]"
              >
                <Avatar className={cn("size-10 transition-all duration-300 group-data-[state=inactive]/avatar:scale-90 group-data-[state=inactive]/avatar:opacity-75 group-data-[state=active]/avatar:ring-2 group-data-[state=active]/avatar:ring-foreground group-data-[state=active]/avatar:ring-offset-2 group-data-[state=active]/avatar:ring-offset-background motion-reduce:transition-none")}>
                  {item.image && <AvatarImage src={item.image} alt="" />}
                  <AvatarFallback className={cn("text-foreground text-xs font-semibold", tones[i % tones.length])}>{initials(item.name)}</AvatarFallback>
                </Avatar>
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>
          <Button variant="outline" size="icon" shape="pill" aria-label="Next testimonial" onClick={() => go(index + 1)} className="hidden sm:inline-flex">
            <ArrowRight />
          </Button>
        </div>
      </TabsPrimitive.Root>
    </section>
  )
}

export { Testimonials2, type Testimonials2Props, type Testimonials2Item }
