"use client"

import { Check, CircleDollarSign, Command, Folder, Mail, MessageCircle, Monitor, Moon, Music2, Rocket, Sparkles, SquareTerminal, StickyNote, Sun, TrendingUp, UploadCloud } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import Link from "@/components/site/link"
import * as React from "react"

import { Message, MessageAvatar, MessageContent } from "@/components/ballmac/ai-message"
import { AnimatedTabs, AnimatedTabsContent, AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ballmac/animated-tabs"
import { ApiKeyField } from "@/components/ballmac/api-key-field"
import { Badge } from "@/components/ballmac/badge"
import { Dock, DockItem, DockSeparator } from "@/components/ballmac/dock"
import { DynamicIsland, DynamicIslandView } from "@/components/ballmac/dynamic-island"
import { Globe, type GlobeMarker } from "@/components/ballmac/globe"
import { Label } from "@/components/ballmac/label"
import { Notification, NotificationStack } from "@/components/ballmac/notification-stack"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { PromptInput, PromptInputAttachButton, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from "@/components/ballmac/prompt-input"
import { ReasoningDisclosure } from "@/components/ballmac/reasoning-disclosure"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { StreamingText } from "@/components/ballmac/streaming-text"
import { Switch } from "@/components/ballmac/switch"
import { Terminal, TerminalLine } from "@/components/ballmac/terminal"
import { ToolCallCard } from "@/components/ballmac/tool-call-card"
import { cn } from "@/lib/utils"

/** Card chrome shared by every tile, so the mosaic reads as one product. */
function Tile({ children, className, uses }: { children: React.ReactNode; className?: string; uses: { name: string; title: string }[] }) {
  return (
    <figure className="group/tile min-w-0 space-y-2">
      <div className={cn("bg-card text-card-foreground relative overflow-hidden rounded-xl border shadow-[0_1px_2px_rgb(0_0_0/0.04)]", className)}>{children}</div>
      <figcaption className="text-muted-foreground flex flex-wrap gap-x-2 px-1 text-xs">
        {uses.map((u, i) => (
          <React.Fragment key={u.name}>
            {i > 0 && <span aria-hidden="true">·</span>}
            <Link href={`/components/${u.name}`} className="hover:text-foreground inline-flex min-h-6 items-center underline-offset-4 transition-colors hover:underline">
              {u.title}
            </Link>
          </React.Fragment>
        ))}
      </figcaption>
    </figure>
  )
}

function TileHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold tracking-tight">{title}</p>
        {description && <p className="text-muted-foreground mt-0.5 text-[13px]">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function Wallpaper({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.6] dark:saturate-[1.2]", className)}>
      <div className="from-chart-1 via-chart-4 to-chart-5 absolute inset-0 bg-linear-to-br" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_15%_100%,var(--chart-2),transparent_70%),radial-gradient(60%_55%_at_85%_0%,var(--chart-3),transparent_70%)] opacity-70" />
      <div className="absolute -inset-x-1/4 top-[40%] h-[70%] rounded-[50%] bg-white/15 blur-2xl" />
    </div>
  )
}

const appTile = "text-white [&_svg]:drop-shadow-[0_1px_1px_rgb(0_0_0/0.25)]"

function SettingsTile() {
  return (
    <Tile uses={[{ name: "segmented-control", title: "Segmented Control" }, { name: "switch", title: "Switch" }]}>
      <TileHeader title="General" description="Appearance and startup" />
      <div className="divide-y px-5 pb-2">
        <div className="space-y-2.5 py-4">
          <p className="text-[13px] font-medium">Appearance</p>
          <SegmentedControl aria-label="Appearance" defaultValue="auto" fullWidth>
            <SegmentedControlItem value="auto">
              <Monitor aria-hidden="true" /> Auto
            </SegmentedControlItem>
            <SegmentedControlItem value="light">
              <Sun aria-hidden="true" /> Light
            </SegmentedControlItem>
            <SegmentedControlItem value="dark">
              <Moon aria-hidden="true" /> Dark
            </SegmentedControlItem>
          </SegmentedControl>
        </div>
        {[
          { id: "m-login", label: "Open at login", hint: "Start quietly in the menu bar.", on: true },
          { id: "m-sounds", label: "Play sounds", hint: "A soft click when a task finishes.", on: false },
        ].map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-4 py-3.5">
            <div>
              <Label htmlFor={row.id} className="text-[13px]">
                {row.label}
              </Label>
              <p className="text-muted-foreground text-xs">{row.hint}</p>
            </div>
            <Switch id={row.id} defaultChecked={row.on} />
          </div>
        ))}
      </div>
    </Tile>
  )
}

const notices = [
  { id: 3, icon: <MessageCircle fill="currentColor" />, tile: "bg-linear-to-b from-chart-2/80 to-chart-2 text-white", title: "Maya", body: "The new icons look great on the dark wallpaper. Ship it!", time: "now" },
  { id: 2, icon: <Rocket />, tile: "bg-black/85 text-white", title: "Deploy succeeded", body: "acme-web is live on production in 42 seconds.", time: "4m ago" },
  { id: 1, icon: <Mail />, tile: "bg-linear-to-b from-chart-1/80 to-chart-1 text-white", title: "Invoice #2041 paid", body: "Acme Inc. paid $4,200.00.", time: "9m ago" },
]

function NotificationsTile() {
  const [items, setItems] = React.useState(notices)
  return (
    <Tile uses={[{ name: "notification-stack", title: "Notification Stack" }]} className="isolate h-[340px] border-foreground/10 px-4 pt-5">
      <Wallpaper />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-5 left-5 text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.2)]">
        <p className="text-xs font-medium opacity-90">Tuesday, September 29</p>
        <p className="text-5xl font-semibold tracking-tight">9:41</p>
      </div>
      <NotificationStack className="w-full" onClearAll={() => setItems(notices)}>
        {items.map((n) => (
          <Notification
            key={n.id}
            icon={n.icon}
            iconClassName={n.tile}
            title={n.title}
            time={n.time}
            onDismiss={() => setItems((current) => (current.length > 1 ? current.filter((x) => x.id !== n.id) : notices))}
          >
            {n.body}
          </Notification>
        ))}
      </NotificationStack>
    </Tile>
  )
}

const answer = "Done. The dock is in components/ballmac/dock.tsx and sits at the bottom of your hero. It magnifies under the pointer and works with the arrow keys."

function AssistantTile() {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = React.useState<"thinking" | "running" | "done">("thinking")
  const [run, setRun] = React.useState(0)
  const shown = reduceMotion ? "done" : phase
  React.useEffect(() => {
    if (reduceMotion) return
    const timers = [
      window.setTimeout(() => setPhase("running"), 1800),
      window.setTimeout(() => setPhase("done"), 3600),
      window.setTimeout(() => {
        setPhase("thinking")
        setRun((r) => r + 1)
      }, 16000),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [run, reduceMotion])
  return (
    <Tile
      uses={[
        { name: "ai-message", title: "AI Message" },
        { name: "reasoning-disclosure", title: "Reasoning" },
        { name: "tool-call-card", title: "Tool Call Card" },
        { name: "prompt-input", title: "Prompt Input" },
      ]}
    >
      <TileHeader title="Assistant" description="Landing page polish">
        <Badge variant="outline" className="font-mono text-[11px]">
          <Sparkles aria-hidden="true" /> agent
        </Badge>
      </TileHeader>
      <div className="flex h-[372px] flex-col gap-4 overflow-hidden px-5 pt-5 text-sm">
        <Message role="user">
          <MessageAvatar>YO</MessageAvatar>
          <MessageContent>Add a dock to my hero.</MessageContent>
        </Message>
        <div className="space-y-2.5">
          <ReasoningDisclosure key={`r${run}`} streaming={shown === "thinking"} duration={2}>
            The user wants a dock in the hero. Ballmac has @ballmac/dock; install it with the shadcn CLI and place it at the bottom of the section.
          </ReasoningDisclosure>
          {shown !== "thinking" && (
            <motion.div initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <ToolCallCard
                name="shadcn add"
                description="@ballmac/dock"
                status={shown === "running" ? "running" : "success"}
                duration={shown === "done" ? 2140 : undefined}
              />
            </motion.div>
          )}
        </div>
        {shown === "done" && (
          <Message role="assistant">
            <MessageAvatar>AI</MessageAvatar>
            <MessageContent>
              <StreamingText key={run} text={answer} animate={!reduceMotion} speed={90} />
            </MessageContent>
          </Message>
        )}
      </div>
      <div className="p-3 pt-0">
        <PromptInput onSubmit={() => setRun((r) => r + 1)}>
          <PromptInputTextarea placeholder="Ask for a component…" aria-label="Message the assistant" />
          <PromptInputToolbar>
            <PromptInputAttachButton />
            <PromptInputSubmit className="ml-auto" />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </Tile>
  )
}

function ApiKeyTile() {
  return (
    <Tile uses={[{ name: "api-key-field", title: "API Key Field" }]} className="p-5">
      <ApiKeyField
        label="Secret key"
        description="Created Sep 28, 2026. Keep it on your server."
        value="sk-live-7f3a9c1e5b2d4f6a8c0e2b4d6f8a1c3e5b7d9fa1b2"
        visiblePrefix={8}
        visibleSuffix={4}
        onRegenerate={() => {}}
      />
    </Tile>
  )
}

const regions: GlobeMarker[] = [
  { location: [37.77, -122.42], size: 0.06 },
  { location: [40.71, -74.01], size: 0.07 },
  { location: [-23.55, -46.63], size: 0.06 },
  { location: [51.51, -0.13], size: 0.07 },
  { location: [50.11, 8.68], size: 0.06 },
  { location: [19.08, 72.88], size: 0.06 },
  { location: [1.35, 103.82], size: 0.06 },
  { location: [35.68, 139.69], size: 0.07 },
  { location: [-33.87, 151.21], size: 0.06 },
]

function GlobeTile() {
  return (
    <Tile uses={[{ name: "globe", title: "Globe" }]} className="isolate h-[320px]">
      <div className="relative z-10 p-5">
        <span className="bg-background/70 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium backdrop-blur">
          <span className="bg-chart-2 size-1.5 rounded-full" aria-hidden="true" /> Live
        </span>
        <p className="mt-3 text-xl font-semibold tracking-tight">35 regions</p>
        <p className="text-muted-foreground mt-0.5 text-[13px]">38 ms median latency</p>
      </div>
      <Globe markers={regions} label="Globe with nine highlighted regions" className="absolute top-16 -right-24 w-[380px] max-w-none" />
      <div aria-hidden="true" className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t to-transparent" />
    </Tile>
  )
}

const bars = [38, 52, 46, 61, 58, 72, 66, 80, 74, 88, 84, 96]

function RevenueTile() {
  return (
    <Tile uses={[{ name: "number-ticker", title: "Number Ticker" }, { name: "badge", title: "Badge" }]}>
      <TileHeader title="Revenue" description="Last 12 weeks">
        <Badge status="success" dot={false}>
          <TrendingUp aria-hidden="true" /> 18.2%
        </Badge>
      </TileHeader>
      <div className="px-5 pt-3 pb-5">
        <p className="flex items-center gap-1.5 text-3xl font-semibold tracking-tight tabular-nums">
          <CircleDollarSign className="text-muted-foreground size-5" aria-hidden="true" />
          <NumberTicker value={48290} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
        </p>
        <div className="mt-4 flex h-16 items-end gap-1" aria-hidden="true">
          {bars.map((h, i) => (
            <span key={i} className="flex-1 rounded-t-[3px] bg-[linear-gradient(180deg,var(--chart-1),color-mix(in_oklch,var(--chart-1)_25%,transparent))]" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </Tile>
  )
}

function TerminalTile() {
  return (
    <figure className="min-w-0 space-y-2">
      <Terminal title="~/acme-web" className="w-full">
        <TerminalLine variant="command" copyable>
          npx shadcn@latest add @ballmac/dock
        </TerminalLine>
        <TerminalLine>✔ Checking registry.</TerminalLine>
        <TerminalLine>✔ Installing dependencies.</TerminalLine>
        <TerminalLine variant="success">Created components/ballmac/dock.tsx</TerminalLine>
      </Terminal>
      <figcaption className="text-muted-foreground px-1 text-xs">
        <Link href="/components/terminal" className="hover:text-foreground inline-flex min-h-6 items-center underline-offset-4 transition-colors hover:underline">
          Terminal
        </Link>
      </figcaption>
    </figure>
  )
}

type IslandView = "idle" | "upload" | "done"

function IslandTile() {
  const reduceMotion = useReducedMotion()
  const [view, setView] = React.useState<IslandView>("idle")
  React.useEffect(() => {
    if (reduceMotion) return
    const next: Record<IslandView, IslandView> = { idle: "upload", upload: "done", done: "idle" }
    const id = window.setTimeout(() => setView(next[view]), view === "idle" ? 1600 : 2800)
    return () => window.clearTimeout(id)
  }, [view, reduceMotion])
  return (
    <Tile uses={[{ name: "dynamic-island", title: "Dynamic Island" }]} className="isolate h-[190px] border-foreground/10">
      <Wallpaper />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 flex h-7 items-center justify-between bg-white/30 px-3 text-[11px] font-medium text-black/80 backdrop-blur-xl dark:bg-black/25 dark:text-white/90">
        <span className="flex items-center gap-2.5">
          <Command className="size-3" />
          <span className="font-semibold">Acme</span>
        </span>
        <span className="tabular-nums">9:41</span>
      </div>
      <DynamicIsland view={view} shape="notch" className="absolute inset-x-0 top-0 z-10">
        <DynamicIslandView value="idle" radius={11} className="h-7 w-[110px]" />
        <DynamicIslandView value="upload" radius={16} label="Uploading build" className="h-9 w-[210px] justify-between gap-3 px-3">
          <span className="flex items-center gap-2 text-[12px] font-medium text-white/90">
            <UploadCloud className="text-chart-1 size-4" aria-hidden="true" /> Uploading
          </span>
          <span className="h-1 w-12 overflow-hidden rounded-full bg-white/15">
            <motion.span className="bg-chart-1 block h-full rounded-full" initial={{ width: "10%" }} animate={{ width: "92%" }} transition={{ duration: 2.4, ease: "easeOut" }} />
          </span>
        </DynamicIslandView>
        <DynamicIslandView value="done" radius={20} label="Build uploaded" className="h-12 w-[220px] gap-2.5 px-2.5">
          <span className="bg-chart-2 flex size-7 items-center justify-center rounded-full text-white">
            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-[12px] font-semibold text-white">Build uploaded</span>
            <span className="block truncate font-mono text-[10px] text-white/60">acme-2.4.0.dmg</span>
          </span>
        </DynamicIslandView>
      </DynamicIsland>
    </Tile>
  )
}

const chart = [42, 58, 50, 72, 64, 80, 76, 92, 70, 88]

function TabsTile() {
  return (
    <Tile uses={[{ name: "animated-tabs", title: "Animated Tabs" }]} className="p-4">
      <AnimatedTabs defaultValue="overview">
        <AnimatedTabsList aria-label="Project" className="self-start">
          <AnimatedTabsTrigger value="overview">Overview</AnimatedTabsTrigger>
          <AnimatedTabsTrigger value="activity">Activity</AnimatedTabsTrigger>
          <AnimatedTabsTrigger value="deploys">Deploys</AnimatedTabsTrigger>
        </AnimatedTabsList>
        <div className="min-h-40 pt-2">
          <AnimatedTabsContent value="overview">
            <p className="text-muted-foreground text-[13px]">Requests, last 10 hours</p>
            <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums">1.28M</p>
            <div className="mt-3 flex h-16 items-end gap-1" aria-hidden="true">
              {chart.map((h, i) => (
                <span key={i} className="bg-foreground/80 flex-1 rounded-t-[3px] first:opacity-40 [&:nth-child(2)]:opacity-50" style={{ height: `${h}%` }} />
              ))}
            </div>
          </AnimatedTabsContent>
          <AnimatedTabsContent value="activity">
            <ul className="space-y-3 text-[13px]">
              {[
                ["Maya merged", "feat/billing-v2", "2m"],
                ["Deploy promoted", "v2.4.0 to production", "9m"],
                ["Alert resolved", "p95 back under 200 ms", "31m"],
              ].map(([what, detail, when]) => (
                <li key={what} className="flex items-start gap-3">
                  <span className="bg-chart-2 mt-1.5 size-1.5 shrink-0 rounded-full" aria-hidden="true" />
                  <span className="flex-1">
                    <span className="font-medium">{what}</span>
                    <span className="text-muted-foreground block">{detail}</span>
                  </span>
                  <span className="text-muted-foreground font-mono text-xs">{when}</span>
                </li>
              ))}
            </ul>
          </AnimatedTabsContent>
          <AnimatedTabsContent value="deploys">
            <div className="space-y-2 font-mono text-xs">
              {[
                ["v2.4.0", "production"],
                ["v2.4.0-rc.2", "preview"],
                ["v2.3.9", "production"],
              ].map(([v, env]) => (
                <div key={v} className="bg-background flex items-center gap-3 rounded-md border px-3 py-2">
                  <span className="font-medium">{v}</span>
                  <span className="text-muted-foreground">{env}</span>
                  <span className="bg-chart-2 ml-auto size-1.5 rounded-full" aria-hidden="true" />
                </div>
              ))}
            </div>
          </AnimatedTabsContent>
        </div>
      </AnimatedTabs>
    </Tile>
  )
}

function DockTile() {
  const [running, setRunning] = React.useState(["Files", "Messages"])
  const item = (label: string) => ({ label, active: running.includes(label), onClick: () => setRunning((r) => (r.includes(label) ? r : [...r, label])) })
  return (
    <Tile uses={[{ name: "dock", title: "Dock" }]} className="isolate flex h-[168px] items-end justify-center border-foreground/10 px-2 pb-2.5">
      <Wallpaper />
      <Dock size={36} magnification={58} distance={110} aria-label="Applications">
        <DockItem {...item("Files")} icon={<Folder fill="currentColor" fillOpacity={0.25} />} className={`${appTile} from-chart-1/80 to-chart-1 bg-linear-to-b`} />
        <DockItem {...item("Messages")} icon={<MessageCircle fill="currentColor" />} className={`${appTile} from-chart-2/80 to-chart-2 bg-linear-to-b`} />
        <DockItem {...item("Notes")} icon={<StickyNote />} className={`${appTile} from-chart-3/80 to-chart-3 bg-linear-to-b`} />
        <DockItem {...item("Music")} icon={<Music2 />} className={`${appTile} from-chart-5 to-chart-4 bg-linear-to-b`} />
        <DockItem {...item("Terminal")} icon={<SquareTerminal />} className={`${appTile} bg-black/85`} />
        <DockSeparator />
        <DockItem {...item("Mail")} icon={<Mail />} className={`${appTile} from-chart-1/70 to-chart-1 bg-linear-to-b`} />
      </Dock>
    </Tile>
  )
}

/**
 * The home page's product shot: real components composed into believable app surfaces, all live.
 * Four balanced stacks on wide screens, two on tablets, and a shorter single column on phones.
 */
export function Mosaic() {
  return (
    <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-4">
      <div className="grid min-w-0 grid-cols-1 gap-5">
        <SettingsTile />
        <NotificationsTile />
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-5">
        <AssistantTile />
        <div className="max-md:hidden">
          <ApiKeyTile />
        </div>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-5">
        <GlobeTile />
        <RevenueTile />
        <div className="max-md:hidden">
          <TerminalTile />
        </div>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-5">
        <IslandTile />
        <DockTile />
        <div className="max-md:hidden">
          <TabsTile />
        </div>
      </div>
    </div>
  )
}
