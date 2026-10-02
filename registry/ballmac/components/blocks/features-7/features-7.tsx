// Ballmac UI: Features 7. https://ui.ballmac.com/blocks/features-7
"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { BatteryFull, Check, ClipboardList, Command, Link2, Palette, Pause, Play, Search, Timer, Wifi, Zap } from "lucide-react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { Kbd } from "@/components/ballmac/kbd"
import { cn } from "@/lib/utils"
import { Media, type MediaSource } from "@/components/ballmac/media"

type Features7Feature = {
  /** Stable key. */
  id: string
  title: string
  description: string
  /** Keys that open it, shown as keycaps. */
  keys?: string[]
  icon?: React.ReactNode
  /** What the menu bar panel shows. Decorative: the title and description carry the meaning. */
  panel: React.ReactNode
  /** Your own screenshot of this feature instead of the sample menu bar scene: an image URL (give it imageAlt), an object with alt text and a dark-mode file, or your own element. */
  image?: MediaSource
  /** Describes `image` when it is a plain URL. */
  imageAlt?: string
}

type Features7Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Label above the heading. */
  eyebrow?: string
  /** Section heading. */
  title?: string
  /** One or two sentences under the heading. */
  description?: string
  /** The features, one panel each. */
  features?: Features7Feature[]
  /** Feature shown first. Defaults to the first. */
  defaultValue?: string
  /** The time shown in the menu bar of the scene. */
  time?: string
}

const panelShell = "bg-popover text-popover-foreground w-[19rem] max-w-full overflow-hidden rounded-2xl border shadow-[0_24px_60px_-20px_rgb(0_0_0/0.5)]"

function CapturePanel() {
  return (
    <div className={panelShell}>
      <div className="flex items-center justify-between border-b px-4 py-2.5 text-xs"><span className="font-semibold">Quick capture</span><span className="text-muted-foreground">Inbox</span></div>
      <div className="space-y-3 p-4">
        <p className="min-h-16 text-[15px] leading-6">Call Maya about the Q4 budget before Friday<span className="bg-foreground ms-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse align-middle motion-reduce:animate-none" /></p>
        <div className="flex flex-wrap gap-1.5">{["#finance", "#follow-up", "Today"].map((t) => <span key={t} className="bg-muted rounded-full px-2.5 py-1 text-xs">{t}</span>)}</div>
      </div>
      <div className="bg-muted/50 flex items-center justify-between border-t px-4 py-2.5 text-xs"><span className="text-muted-foreground">Saves to Inbox</span><span className="flex items-center gap-1.5">Save <Kbd>⌘</Kbd><Kbd>↩</Kbd></span></div>
    </div>
  )
}

function ClipboardPanel() {
  const rows = [
    { icon: ClipboardList, text: "Invoice INV-1042 is overdue", meta: "Text" },
    { icon: Link2, text: "acme.com/pricing", meta: "Link" },
    { icon: Palette, text: "rgb(59, 130, 246)", meta: "Color" },
    { icon: ClipboardList, text: "Call Maya about the Q4 budget", meta: "Text" },
  ]
  return (
    <div className={panelShell}>
      <div className="border-b p-3"><div className="bg-muted text-muted-foreground flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs"><Search className="size-3.5" />Search history</div></div>
      <ul className="p-1.5">
        {rows.map((r, i) => (
          <li key={r.text} className={cn("flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm", i === 0 && "bg-accent")}>
            <r.icon className="text-muted-foreground size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{r.text}</span>
            <span className="text-muted-foreground text-xs tabular-nums">⌘{i + 1}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TimerPanel() {
  return (
    <div className={cn(panelShell, "p-5 text-center")}>
      <div className="relative mx-auto flex size-36 items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="none" stroke="var(--muted)" strokeWidth="6" /><circle cx="50" cy="50" r="44" fill="none" stroke="var(--chart-2)" strokeWidth="6" strokeLinecap="round" strokeDasharray="276" strokeDashoffset="92" /></svg>
        <div><p className="text-4xl font-light tracking-tight tabular-nums">16:42</p><p className="text-muted-foreground text-xs">Focus</p></div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {["15", "25", "50"].map((m, i) => <span key={m} className={cn("rounded-full border px-3 py-1 text-xs tabular-nums", i === 1 && "bg-foreground text-background border-transparent")}>{m} min</span>)}
      </div>
      <div className="mt-4 flex items-center justify-center gap-3"><span className="bg-foreground text-background flex size-10 items-center justify-center rounded-full"><Pause className="size-4" /></span><span className="flex size-10 items-center justify-center rounded-full border"><Play className="size-4" /></span></div>
    </div>
  )
}

function ShortcutsPanel() {
  const rows: [string, string[]][] = [["New capture", ["⌃", "⌥", "N"]], ["Open clipboard", ["⌃", "⌥", "V"]], ["Start focus timer", ["⌃", "⌥", "F"]], ["Search everything", ["⌘", "Space"]]]
  return (
    <div className={panelShell}>
      <div className="border-b px-4 py-2.5 text-xs font-semibold">Global shortcuts</div>
      <ul className="divide-y">
        {rows.map(([a, keys]) => (
          <li key={a} className="flex items-center justify-between px-4 py-3 text-sm"><span>{a}</span><span className="flex gap-1">{keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</span></li>
        ))}
      </ul>
    </div>
  )
}

const defaultFeatures: Features7Feature[] = [
  { id: "capture", title: "Quick capture", description: "Jot a thought from any app without switching windows. It lands in your inbox, tagged and ready.", keys: ["⌃", "⌥", "N"], icon: <Zap />, panel: <CapturePanel /> },
  { id: "clipboard", title: "Clipboard history", description: "Everything you copied today, searchable. Paste text, links and colors from the past with one shortcut.", keys: ["⌃", "⌥", "V"], icon: <ClipboardList />, panel: <ClipboardPanel /> },
  { id: "timer", title: "Focus timer", description: "Start a session from the menu bar. A quiet ring counts down, and breaks arrive on time.", keys: ["⌃", "⌥", "F"], icon: <Timer />, panel: <TimerPanel /> },
  { id: "shortcuts", title: "Global shortcuts", description: "Every action has a shortcut that works everywhere, and you can change all of them.", keys: ["⌘", "Space"], icon: <Command />, panel: <ShortcutsPanel /> },
]

function Features7({
  eyebrow = "Lives in your menu bar",
  title = "Always one keystroke away.",
  description = "No window to open, no app to switch to. Ledger waits quietly in the menu bar until you need it.",
  features = defaultFeatures,
  defaultValue,
  time = "Thu 9:41 AM",
  className,
  ...props
}: Features7Props) {
  const reduce = useReducedMotion()
  const [value, setValue] = React.useState(defaultValue ?? features[0]?.id ?? "")
  const current = features.find((f) => f.id === value) ?? features[0]
  if (!current) return null

  return (
    <section data-slot="features-7" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm font-medium">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
          <p className="text-muted-foreground mt-4 max-w-md text-lg text-pretty">{description}</p>
          <RadioGroupPrimitive.Root value={value} onValueChange={setValue} aria-label="Features" orientation="vertical" className="mt-8 grid gap-2">
            {features.map((f) => {
              const on = f.id === value
              return (
                <RadioGroupPrimitive.Item
                  key={f.id}
                  value={f.id}
                  className={cn("focus-visible:ring-ring/50 group/feature flex items-start gap-4 rounded-2xl border p-4 text-start outline-none transition-colors focus-visible:ring-[3px]", on ? "border-foreground bg-accent/50" : "hover:bg-accent/30")}
                >
                  <span aria-hidden="true" className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5", on ? "bg-foreground text-background" : "bg-muted")}>{f.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{f.title}</span>
                      {f.keys && <span aria-hidden="true" className="hidden gap-1 sm:flex">{f.keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</span>}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-sm text-pretty">{f.description}</span>
                    {f.keys && <span className="sr-only">Shortcut: {f.keys.join(" ")}</span>}
                  </span>
                  <RadioGroupPrimitive.Indicator className="mt-1"><Check className="size-4" aria-hidden="true" /></RadioGroupPrimitive.Indicator>
                </RadioGroupPrimitive.Item>
              )
            })}
          </RadioGroupPrimitive.Root>
        </div>

        {/* A miniature desktop: the menu bar with the app's icon lit, and its panel hanging underneath. Decorative. */}
        <Media media={current.image} alt={current.imageAlt} frame fallback={
        <div aria-hidden="true" className="relative isolate overflow-hidden rounded-3xl border">
          <div className="pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.6] dark:saturate-[1.2]">
            <div className="absolute inset-0 bg-linear-to-br from-chart-1 via-chart-4 to-chart-5" />
            <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_15%_100%,var(--chart-2),transparent_70%),radial-gradient(60%_55%_at_85%_0%,var(--chart-3),transparent_70%)] opacity-70" />
            <div className="absolute -inset-x-1/4 top-[45%] h-[70%] rounded-[50%] bg-white/15 blur-2xl" />
          </div>
          <div className="bg-background/55 text-foreground flex h-7 items-center gap-3 border-b border-white/20 px-3 text-[13px] backdrop-blur-2xl dark:border-white/[0.06]">
            <Command className="size-3.5" /><span className="font-bold">Finder</span><span className="max-sm:hidden">File</span><span className="max-sm:hidden">Edit</span><span className="max-sm:hidden">View</span>
            <span className="ms-auto flex items-center gap-3">
              <span className="bg-foreground/15 flex size-5 items-center justify-center rounded-md"><span className="bg-foreground text-background flex size-4 items-center justify-center rounded-[4px] text-[10px] font-bold">L</span></span>
              <Wifi className="size-3.5 max-sm:hidden" /><BatteryFull className="size-4" /><span className="tabular-nums max-sm:hidden">{time}</span>
            </span>
          </div>
          <div className="flex min-h-[26rem] items-start justify-end px-3 pt-2 pb-8 sm:px-6">
            <div className="relative">
              <span className="bg-popover absolute -top-1.5 end-6 size-3 rotate-45 rounded-[3px] border-t border-s" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  initial={reduce ? false : { opacity: 0, y: -8, scale: 0.97, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={reduce ? undefined : { opacity: 0, y: -4, scale: 0.98, filter: "blur(4px)" }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  {current.panel}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        } />
      </div>
    </section>
  )
}

export { Features7, type Features7Props, type Features7Feature }
