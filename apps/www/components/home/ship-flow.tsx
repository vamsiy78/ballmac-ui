"use client"

import { ArrowUpRight, Check, FileCode2, Folder, MessageSquare, Palette, SquareTerminal } from "lucide-react"
import * as React from "react"

import { LiveScreen, type LiveScreenId } from "@/components/home/live-screen"
import { CopyButton } from "@/components/site/copy-button"
import Link from "@/components/site/link"
import { cn } from "@/lib/utils"

export type FlowScreen = {
  id: LiveScreenId
  name: string
  /** The shadcn CLI command that installs it. */
  command: string
  /** What someone might ask an agent for. */
  prompt: string
  /** What an agent connected to the registry would report doing. */
  reply: string
  /** Where the file lands in a project. */
  path: string
  /** The start of the real source file, already highlighted. */
  codeHtml: string
  /** The picture shown while the live block loads. */
  poster: React.ReactNode
}

const STEPS = [
  { id: "pick", label: "Pick a screen", icon: Folder, text: "Start from a whole screen that already works, not a blank file." },
  { id: "install", label: "Install it", icon: SquareTerminal, text: "One shadcn command, or ask your AI agent to do it." },
  { id: "source", label: "Read the source", icon: FileCode2, text: "It arrives as plain React and Tailwind in your own project." },
  { id: "own", label: "Make it yours", icon: Palette, text: "Change colors, radius and mode in your theme. The screen follows." },
] as const

const ACCENTS = [
  { id: "ink", label: "Ink", value: null },
  { id: "indigo", label: "Indigo", value: ["oklch(0.511 0.262 276.966)", "oklch(0.985 0 0)"] },
  { id: "green", label: "Green", value: ["oklch(0.527 0.154 150.069)", "oklch(0.985 0 0)"] },
  { id: "rose", label: "Rose", value: ["oklch(0.586 0.253 17.585)", "oklch(0.985 0 0)"] },
  { id: "amber", label: "Amber", value: ["oklch(0.769 0.188 70.08)", "oklch(0.205 0 0)"] },
] as const
const RADII = [
  { id: "sharp", label: "Sharp", value: "0.125rem" },
  { id: "soft", label: "Soft", value: null },
  { id: "round", label: "Round", value: "1.25rem" },
] as const

function Window({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-card overflow-hidden rounded-2xl border shadow-[0_30px_80px_-30px_rgb(0_0_0/0.3)]", className)}>
      <div className="bg-muted/60 flex h-10 items-center gap-3 border-b px-4">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="text-muted-foreground mx-auto max-w-[70%] truncate text-xs">{title}</span>
        <span className="w-10" aria-hidden="true" />
      </div>
      {children}
    </div>
  )
}

/**
 * The whole path in four steps, with real parts at every one: a real block from the library, the real install command, the first lines of its real source, and the
 * same block with your own theme values. Nothing here is a mock-up; the controls change the actual block shown.
 */
export function ShipFlow({ screens }: { screens: FlowScreen[] }) {
  const id = React.useId()
  const [step, setStep] = React.useState(0)
  const [pick, setPick] = React.useState(0)
  const [mode, setMode] = React.useState<"cli" | "agent">("cli")
  const [accent, setAccent] = React.useState<(typeof ACCENTS)[number]["id"]>("ink")
  const [radius, setRadius] = React.useState<(typeof RADII)[number]["id"]>("soft")
  const [dark, setDark] = React.useState(false)
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([])
  const screen = screens[pick] ?? screens[0]
  if (!screen) return null

  const a = ACCENTS.find((x) => x.id === accent)!
  const r = RADII.find((x) => x.id === radius)!
  const vars: Record<string, string> = {}
  if (a.value) {
    vars["--primary"] = a.value[0]
    vars["--primary-foreground"] = a.value[1]
    vars["--ring"] = a.value[0]
    vars["--chart-1"] = a.value[0]
  }
  if (r.value) vars["--radius"] = r.value
  const changed = [...(a.value ? [`--primary: ${a.value[0]};`, `--primary-foreground: ${a.value[1]};`, `--chart-1: ${a.value[0]};`] : []), ...(r.value ? [`--radius: ${r.value};`] : [])]

  function onKey(e: React.KeyboardEvent, i: number) {
    const n = e.key === "ArrowDown" || e.key === "ArrowRight" ? (i + 1) % STEPS.length : e.key === "ArrowUp" || e.key === "ArrowLeft" ? (i + STEPS.length - 1) % STEPS.length : e.key === "Home" ? 0 : e.key === "End" ? STEPS.length - 1 : -1
    if (n < 0) return
    e.preventDefault()
    setStep(n)
    tabs.current[n]?.focus()
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
      <div role="tablist" aria-label="From idea to your project" aria-orientation="vertical" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {STEPS.map((s, i) => {
          const on = step === i
          return (
            <button
              key={s.id}
              ref={(el) => {
                tabs.current[i] = el
              }}
              role="tab"
              type="button"
              id={`${id}-tab-${s.id}`}
              aria-selected={on}
              aria-controls={`${id}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => setStep(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn("focus-visible:ring-ring/50 group rounded-xl border p-4 text-start outline-none transition-[background-color,border-color] focus-visible:ring-[3px] motion-reduce:transition-none", on ? "bg-card border-foreground/25 shadow-sm" : "border-transparent hover:bg-muted/50")}
            >
              <span className="flex items-center gap-3">
                <span aria-hidden="true" className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold tabular-nums", on ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground")}>
                  {i + 1}
                </span>
                <span className="font-semibold tracking-tight">{s.label}</span>
              </span>
              <span className={cn("text-muted-foreground mt-2 block ps-11 text-sm leading-relaxed text-pretty", !on && "max-lg:hidden lg:hidden")}>{s.text}</span>
            </button>
          )
        })}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${STEPS[step].id}`} tabIndex={0} className="focus-visible:ring-ring/50 min-w-0 rounded-2xl outline-none focus-visible:ring-[3px]">
        {(step === 0 || step === 3) && (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div role="group" aria-label="Screen" className="flex flex-wrap gap-1">
                {screens.map((s, i) => (
                  <button key={s.id} type="button" aria-pressed={pick === i} onClick={() => setPick(i)} className={cn("focus-visible:ring-ring/50 rounded-full border px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", pick === i ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>
                    {s.name}
                  </button>
                ))}
              </div>
              <Link href={`/blocks/${screen.id}`} className="text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">
                Open {screen.id} <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <Window title={step === 0 ? `${screen.id} · free block` : "your-app.com"}>
              <LiveScreen key={`${screen.id}-${step}`} id={screen.id} poster={screen.poster} style={step === 3 ? (vars as React.CSSProperties) : undefined} theme={step === 3 && dark ? "dark" : step === 3 ? "light" : undefined} />
            </Window>
            {step === 3 && (
              <div className="bg-card grid gap-5 rounded-2xl border p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="grid gap-4">
                  <fieldset className="grid gap-2">
                    <legend className="mb-1 text-sm font-medium">Accent color</legend>
                    <div className="flex flex-wrap gap-2">
                      {ACCENTS.map((x) => (
                        <label key={x.id} className="relative cursor-pointer">
                          <input type="radio" name={`${id}-accent`} checked={accent === x.id} onChange={() => setAccent(x.id)} className="peer sr-only" />
                          <span className="sr-only">{x.label}</span>
                          <span aria-hidden="true" className="peer-focus-visible:ring-ring ring-border peer-checked:ring-foreground block size-8 rounded-full border-2 border-card ring-1 peer-checked:ring-2 peer-focus-visible:ring-[3px]" style={{ background: x.value ? x.value[0] : "var(--foreground)" }} />
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="grid gap-2">
                    <legend className="mb-1 text-sm font-medium">Corners</legend>
                    <div className="flex gap-1.5">
                      {RADII.map((x) => (
                        <label key={x.id} className="relative cursor-pointer">
                          <input type="radio" name={`${id}-radius`} checked={radius === x.id} onChange={() => setRadius(x.id)} className="peer sr-only" />
                          <span className="peer-checked:bg-foreground peer-checked:text-background peer-checked:border-foreground peer-focus-visible:ring-ring/50 flex h-9 items-center rounded-lg border px-3 text-sm font-medium peer-focus-visible:ring-[3px]">{x.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                    <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} className="accent-foreground size-4" />
                    Dark mode
                  </label>
                </div>
                <div className="min-w-0">
                  <p className="mb-2 text-sm font-medium">What you changed in <span className="font-mono text-[13px]">globals.css</span></p>
                  <pre dir="ltr" tabIndex={0} aria-live="polite" className="bg-muted/50 focus-visible:ring-ring/50 min-h-24 overflow-x-auto rounded-lg border p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-[3px]">
                    {changed.length ? `:root {\n${changed.map((l) => `  ${l}`).join("\n")}\n}` : "/* Nothing yet. Pick a color or change the corners. */"}
                  </pre>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">Every Ballmac screen reads these tokens, so one change reaches all of them. Dark mode is the same screen with a class on the page.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4">
            <div role="radiogroup" aria-label="How to install" className="flex gap-1 self-start rounded-full border p-1">
              {([["cli", "Command line", SquareTerminal], ["agent", "AI agent", MessageSquare]] as const).map(([k, label, Icon]) => (
                <label key={k} className="relative cursor-pointer">
                  <input type="radio" name={`${id}-mode`} checked={mode === k} onChange={() => setMode(k)} className="peer sr-only" />
                  <span className="peer-checked:bg-foreground peer-checked:text-background text-muted-foreground peer-focus-visible:ring-ring/50 inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-sm font-medium peer-focus-visible:ring-[3px]">
                    <Icon className="size-3.5" aria-hidden="true" />
                    {label}
                  </span>
                </label>
              ))}
            </div>
            {mode === "cli" ? (
              <Window title="Terminal">
                <div dir="ltr" className="bg-background grid gap-1.5 p-5 font-mono text-sm leading-relaxed">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-all"><span className="text-muted-foreground">$ </span>{screen.command}</p>
                    <CopyButton value={screen.command} label="Copy install command" />
                  </div>
                  <p className="font-medium">✓ Created 1 file</p>
                  <p className="text-muted-foreground">{screen.path}</p>
                </div>
              </Window>
            ) : (
              <Window title="Your coding agent">
                <div className="bg-background grid gap-3 p-5 text-sm leading-relaxed">
                  <p className="bg-foreground text-background ms-auto max-w-[88%] rounded-2xl rounded-ee-md px-4 py-2.5">{screen.prompt}</p>
                  <p className="bg-card max-w-[92%] rounded-2xl rounded-es-md border px-4 py-2.5 shadow-xs">{screen.reply}</p>
                  <p className="text-muted-foreground flex items-center gap-1.5 ps-1 font-mono text-xs"><Check className="size-3.5" aria-hidden="true" />{screen.command}</p>
                </div>
              </Window>
            )}
            <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
              {mode === "cli" ? "The same command works with npm, pnpm, yarn and bun." : "Agents search the registry through the shadcn MCP server, so they install a real screen instead of inventing one. This is an example request."}{" "}
              <Link href="/docs/get-started/connect-your-agent" className="text-foreground rounded-sm font-medium underline underline-offset-4">Connect your agent</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <Window title="Your project">
              <div className="grid min-w-0 md:grid-cols-[13rem_minmax(0,1fr)]">
                <div dir="ltr" className="bg-muted/30 hidden border-e p-4 font-mono text-xs leading-7 md:block">
                  <p className="text-muted-foreground">components/</p>
                  <p className="ps-3 text-muted-foreground">ballmac/</p>
                  <p className="ps-6">blocks/</p>
                  <p className="ps-9">{screen.id}/</p>
                  <p className="bg-foreground/10 ms-9 rounded px-2 font-medium">{screen.id}.tsx</p>
                  <p className="text-muted-foreground mt-2">app/</p>
                </div>
                <div className="min-w-0">
                  <div className="flex h-10 items-center justify-between border-b px-4">
                    <span className="text-muted-foreground font-mono text-xs">{screen.path}</span>
                  </div>
                  <div dir="ltr" tabIndex={0} className="focus-visible:ring-ring/50 max-h-[26rem] overflow-auto px-4 py-3.5 outline-none focus-visible:ring-[3px] focus-visible:ring-inset [&_pre]:bg-transparent!" dangerouslySetInnerHTML={{ __html: screen.codeHtml }} />
                </div>
              </div>
            </Window>
            <p className="text-muted-foreground text-sm leading-relaxed text-pretty">These are the first lines of the real file. It is plain React and Tailwind, and the parts it uses are installed beside it as files in your project, so there is no package to keep in sync. Edit it like code you wrote, because now you did.</p>
          </div>
        )}
      </div>
    </div>
  )
}
