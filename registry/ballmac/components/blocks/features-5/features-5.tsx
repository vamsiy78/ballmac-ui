// Ballmac UI: Features 5. https://ui.ballmac.com/blocks/features-5
"use client"

import * as React from "react"
import { Check, Inbox, Link2, Lock, Sparkles, Tag, Workflow, Zap } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { Avatar, AvatarFallback } from "@/components/ballmac/avatar"
import { Badge } from "@/components/ballmac/badge"
import { cn } from "@/lib/utils"

type Features5Step = {
  /** Step title. */
  title: string
  /** One or two sentences. */
  description: string
  /** Short checked points under the description. */
  points?: string[]
  /** The picture shown beside the steps while this step is in view. Decorative: describe it in the text. */
  visual: React.ReactNode
}

type Features5Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Label above the heading. */
  eyebrow?: string
  /** Section heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** The steps, in order. */
  steps?: Features5Step[]
}

/* ----------------------------------------------------------------------------------------------
 * Sample visuals: small product panels drawn with theme tokens.
 * --------------------------------------------------------------------------------------------*/

const panel = "bg-card w-full max-w-sm rounded-2xl border p-5 shadow-[0_30px_70px_-35px_rgb(0_0_0/0.4)]"

function CaptureVisual() {
  const items = [
    { t: "Pricing page feedback from Maya", tag: "Customer", tone: "bg-chart-1" },
    { t: "Ship the invoice export before Friday", tag: "Task", tone: "bg-chart-3" },
    { t: "Idea: weekly digest for admins", tag: "Idea", tone: "bg-chart-5" },
  ]
  return (
    <div className={panel}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Inbox className="size-4" /> Inbox <Badge variant="secondary" className="ml-auto">3 new</Badge>
      </div>
      <ul className="mt-4 space-y-2.5">
        {items.map((i) => (
          <li key={i.t} className="flex items-center gap-3 rounded-xl border p-3">
            <span className={cn("size-2 shrink-0 rounded-full", i.tone)} />
            <span className="min-w-0 flex-1 truncate text-sm">{i.t}</span>
            <span className="text-muted-foreground text-xs">{i.tag}</span>
          </li>
        ))}
      </ul>
      <div className="text-muted-foreground mt-4 flex items-center gap-2 rounded-xl border border-dashed px-3 py-2.5 text-sm">
        <Sparkles className="size-4" /> Paste a link or just start typing
      </div>
    </div>
  )
}

function OrganizeVisual() {
  const cols = [
    { name: "Backlog", cards: ["Export to CSV", "Dark mode polish"] },
    { name: "In progress", cards: ["Invoice export", "Team roles", "Audit log"] },
    { name: "Done", cards: ["SSO setup"] },
  ]
  return (
    <div className={cn(panel, "max-w-md")}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Tag className="size-4" /> Q4 roadmap
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {cols.map((c) => (
          <div key={c.name} className="bg-muted/50 rounded-xl p-2">
            <p className="text-muted-foreground px-1 pb-2 text-[11px] font-medium">{c.name}</p>
            <div className="space-y-2">
              {c.cards.map((card) => (
                <div key={card} className="bg-card rounded-lg border p-2 text-xs leading-snug shadow-xs">{card}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AutomateVisual() {
  const steps = [
    { icon: Zap, label: "When", value: "An invoice is overdue 7 days" },
    { icon: Workflow, label: "Then", value: "Send a friendly reminder email" },
    { icon: Link2, label: "And", value: "Post to #finance in Slack" },
  ]
  return (
    <div className={panel}>
      <div className="flex items-center justify-between text-sm font-medium">
        Overdue invoices <Badge status="success">Active</Badge>
      </div>
      <ol className="relative mt-5 space-y-3">
        <span aria-hidden="true" className="bg-border absolute top-6 bottom-6 left-[1.1rem] w-px" />
        {steps.map(({ icon: Icon, label, value }) => (
          <li key={label} className="relative flex items-center gap-3">
            <span className="bg-background relative flex size-9 shrink-0 items-center justify-center rounded-full border"><Icon className="size-4" /></span>
            <div className="min-w-0 flex-1 rounded-xl border px-3 py-2">
              <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">{label}</p>
              <p className="truncate text-sm">{value}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function ShareVisual() {
  const people = [
    ["MK", "Maya Kim", "Can edit", "bg-chart-1/25"],
    ["JO", "Jonas Ortiz", "Can comment", "bg-chart-3/25"],
    ["AS", "Amara Singh", "Can view", "bg-chart-5/25"],
  ]
  return (
    <div className={panel}>
      <p className="text-sm font-medium">Share “Q4 roadmap”</p>
      <div className="mt-4 space-y-3">
        {people.map(([i, n, r, c]) => (
          <div key={n} className="flex items-center gap-3">
            <Avatar size="sm"><AvatarFallback className={cn("text-foreground text-[10px] font-semibold", c)}>{i}</AvatarFallback></Avatar>
            <span className="flex-1 text-sm">{n}</span>
            <span className="text-muted-foreground text-xs">{r}</span>
          </div>
        ))}
      </div>
      <div className="text-muted-foreground mt-5 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm">
        <Lock className="size-4" /> Only people with the link
        <Check className="text-chart-2 ml-auto size-4" />
      </div>
    </div>
  )
}

const defaultSteps: Features5Step[] = [
  {
    title: "Capture anything in seconds",
    description: "Notes, links and ideas land in one inbox the moment you have them, from the web, your phone or an email forward.",
    points: ["Paste a link to unfurl it", "Forward email to your inbox address"],
    visual: <CaptureVisual />,
  },
  {
    title: "Turn it into a plan",
    description: "Drag items onto a board, set an owner and a date, and watch the roadmap assemble itself.",
    points: ["Board, list and timeline views", "Owners and due dates on everything"],
    visual: <OrganizeVisual />,
  },
  {
    title: "Automate the busywork",
    description: "Describe what should happen and when. Reminders, handoffs and status updates run on their own.",
    points: ["No code, no scripts", "Works with the tools you already use"],
    visual: <AutomateVisual />,
  },
  {
    title: "Share with exactly who needs it",
    description: "Invite teammates or send a link. Permissions are per item, and you can see who looked at what.",
    points: ["View, comment or edit", "Revoke access in one click"],
    visual: <ShareVisual />,
  },
]

function Features5({
  eyebrow = "How it works",
  title = "From a loose idea to a shipped plan.",
  description = "Four steps, one workspace. Scroll to see each one.",
  steps = defaultSteps,
  className,
  ...props
}: Features5Props) {
  const [active, setActive] = React.useState(0)
  const refs = React.useRef<(HTMLLIElement | null)[]>([])
  const reduce = useReducedMotion()

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return
    const nodes = refs.current.filter((n): n is HTMLLIElement => !!n)
    // A step becomes active when it crosses the middle band of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index))
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    )
    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [steps.length])

  return (
    <section data-slot="features-5" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm font-medium">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
      </div>

      <div className="mt-14 grid gap-x-16 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <ol className="min-w-0 space-y-14 lg:space-y-0">
          {steps.map((step, i) => (
            <li
              key={step.title}
              ref={(n) => {
                refs.current[i] = n
              }}
              data-index={i}
              data-active={active === i}
              className="group/step relative lg:flex lg:min-h-[26rem] lg:items-center"
            >
              <div className="lg:border-l lg:pl-10">
                <span
                  aria-hidden="true"
                  className="bg-foreground absolute top-[18%] bottom-[18%] left-0 hidden w-0.5 origin-top scale-y-0 rounded-full transition-transform duration-500 ease-out group-data-[active=true]/step:scale-y-100 motion-reduce:transition-none lg:block"
                />
                <p className="text-muted-foreground font-mono text-sm tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-balance lg:text-3xl lg:text-muted-foreground lg:transition-colors lg:duration-300 lg:group-data-[active=true]/step:text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mt-3 max-w-md text-base leading-relaxed text-pretty">{step.description}</p>
                {step.points && (
                  <ul className="mt-5 space-y-2 text-sm">
                    {step.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Phones and tablets: the picture sits right under its step. */}
              <div aria-hidden="true" className="bg-muted/40 mt-8 flex justify-center rounded-3xl border p-5 sm:p-8 lg:hidden">{step.visual}</div>
            </li>
          ))}
        </ol>

        <div className="hidden lg:block" aria-hidden="true">
          <div className="sticky top-24 flex h-[28rem] items-center justify-center overflow-hidden rounded-3xl border bg-muted/40 p-10">
            <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                className="relative flex w-full justify-center"
                initial={reduce ? false : { opacity: 0, y: 14, scale: 0.97, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, y: -10, scale: 0.98, filter: "blur(6px)" }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                {steps[active]?.visual}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Features5, type Features5Props, type Features5Step }
