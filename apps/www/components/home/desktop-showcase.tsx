"use client"

import { BatteryFull, Blocks, Check, Command, Folder, Mail, MessageCircle, Sparkles, SquareTerminal, StickyNote, Wifi } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { Message, MessageAvatar, MessageContent } from "@/components/ballmac/ai-message"
import { Dock, DockItem, DockSeparator } from "@/components/ballmac/dock"
import { DynamicIsland, DynamicIslandView } from "@/components/ballmac/dynamic-island"
import { MacWindow, MacWindowContent, MacWindowMain, MacWindowSidebar, MacWindowSidebarItem, MacWindowTitleBar } from "@/components/ballmac/mac-window"
import { StreamingText } from "@/components/ballmac/streaming-text"
import { ToolCallCard } from "@/components/ballmac/tool-call-card"

// Design size of the desktop; it scales to fit its container like a screenshot, but stays live.
const W = 1180
const H = 700

type Step = "ask" | "running" | "done"

const tile = "text-white [&_svg]:drop-shadow-[0_1px_1px_rgb(0_0_0/0.25)]"
const answer =
  "Added a Dock to your landing page. It magnifies under the pointer, works with the arrow keys and stays still when reduced motion is on. It lives in components/ballmac/dock.tsx, so it's yours to change."

/** A live macOS desktop built only from Ballmac UI components, telling the install story on a loop. */
export function DesktopShowcase() {
  const reduceMotion = useReducedMotion()
  const [scriptedStep, setStep] = React.useState<Step>("ask")
  // Reduced motion shows the finished story without the loop.
  const step: Step = reduceMotion ? "done" : scriptedStep
  const [cycle, setCycle] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / W))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  React.useEffect(() => {
    if (reduceMotion) return
    const timers = [
      window.setTimeout(() => setStep("running"), 1400),
      window.setTimeout(() => setStep("done"), 3600),
      window.setTimeout(() => {
        setStep("ask")
        setCycle((c) => c + 1)
      }, 12500),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [cycle, reduceMotion])

  const view = step === "running" ? "thinking" : step === "done" ? "done" : "idle"

  return (
    <div ref={ref} className="relative w-full" style={{ height: H * scale }}>
      <div
        className="absolute top-0 left-1/2 origin-top overflow-hidden rounded-[22px] border border-black/10 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.55),0_0_0_1px_rgb(255_255_255/0.06)_inset] dark:border-white/10"
        style={{ width: W, height: H, transform: `translateX(-50%) scale(${scale})` }}
      >
        {/* Wallpaper */}
        <div aria-hidden="true" className="absolute inset-0 dark:brightness-[0.55] dark:saturate-[1.15]">
          <div className="from-chart-1 via-chart-4 to-chart-5 absolute inset-0 bg-linear-to-br" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_12%_100%,var(--chart-2),transparent_70%),radial-gradient(55%_50%_at_90%_0%,var(--chart-3),transparent_70%)] opacity-70" />
          <div className="absolute -inset-x-1/4 top-[40%] h-[70%] rounded-[50%] bg-white/15 blur-3xl" />
        </div>

        {/* Menu bar */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 flex h-8 items-center justify-between bg-white/35 px-4 text-[13px] font-medium text-black/80 backdrop-blur-2xl dark:bg-black/30 dark:text-white/90">
          <div className="flex items-center gap-5">
            <Command className="size-4" />
            <span className="font-bold">Acme</span>
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Window</span>
          </div>
          <div className="flex items-center gap-4">
            <Wifi className="size-4" />
            <BatteryFull className="size-[18px]" />
            <span className="tabular-nums">Tue Sep 29&nbsp;&nbsp;9:41</span>
          </div>
        </div>

        <DynamicIsland view={view} shape="notch" className="absolute inset-x-0 top-0 z-20">
          <DynamicIslandView value="idle" radius={12} className="h-8 w-[170px] justify-center">
            <span aria-hidden="true" className="size-2 rounded-full bg-white/[0.07] ring-1 ring-white/10" />
          </DynamicIslandView>
          <DynamicIslandView value="thinking" radius={16} label="Agent is installing a component" className="h-9 w-[330px] justify-between gap-3 px-3.5">
            <span className="flex items-center gap-2.5">
              <motion.span
                aria-hidden="true"
                className="size-4 rounded-full blur-[1px]"
                style={{ background: "conic-gradient(from 0deg, var(--chart-1), var(--chart-4), var(--chart-5), var(--chart-2), var(--chart-1))" }}
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-[13px] font-medium text-white/85">Installing @ballmac/dock</span>
            </span>
            <span className="font-mono text-[11px] text-white/50">shadcn</span>
          </DynamicIslandView>
          <DynamicIslandView value="done" radius={22} label="Dock installed" className="h-[52px] w-[380px] gap-3 px-3">
            <span className="bg-chart-2 flex size-8 items-center justify-center rounded-full text-white">
              <Check className="size-4" strokeWidth={3} aria-hidden="true" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[13px] font-semibold text-white">Dock installed</span>
              <span className="block truncate font-mono text-[11px] text-white/55">components/ballmac/dock.tsx</span>
            </span>
          </DynamicIslandView>
        </DynamicIsland>

        {/* Agent window */}
        {/* The window tells a story; only the dock is interactive. */}
        <MacWindow inert className="absolute top-[70px] left-1/2 h-[480px] w-[860px] -translate-x-1/2">
          <MacWindowSidebar>
            <p className="px-2 pt-1 pb-1.5 text-[11px] font-semibold text-muted-foreground">Chats</p>
            <MacWindowSidebarItem selected>
              <Sparkles className="size-3.5" aria-hidden="true" /> Landing page polish
            </MacWindowSidebarItem>
            <MacWindowSidebarItem>
              <Blocks className="size-3.5" aria-hidden="true" /> Pricing section
            </MacWindowSidebarItem>
            <MacWindowSidebarItem>
              <MessageCircle className="size-3.5" aria-hidden="true" /> Onboarding copy
            </MacWindowSidebarItem>
          </MacWindowSidebar>
          <MacWindowMain>
            <MacWindowTitleBar title="Landing page polish" controls={false} />
            <MacWindowContent className="flex flex-col gap-5 overflow-hidden p-6 text-[14px]">
              <Message role="user">
                <MessageAvatar>YO</MessageAvatar>
                <MessageContent>Add a macOS dock to the bottom of my landing page hero.</MessageContent>
              </Message>
              {step !== "ask" && (
                <motion.div initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pl-11">
                  <ToolCallCard
                    name="shadcn add"
                    description="npx shadcn@latest add @ballmac/dock"
                    status={step === "running" ? "running" : "success"}
                    duration={step === "done" ? 2140 : undefined}
                  />
                </motion.div>
              )}
              {step === "done" && (
                <Message role="assistant">
                  <MessageAvatar>AI</MessageAvatar>
                  <MessageContent>
                    <StreamingText key={cycle} text={answer} animate speed={120} />
                  </MessageContent>
                </Message>
              )}
            </MacWindowContent>
          </MacWindowMain>
        </MacWindow>

        {/* Dock */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <Dock size={48} magnification={78} distance={160} aria-label="Applications">
            <DockItem label="Files" active icon={<Folder fill="currentColor" fillOpacity={0.25} />} className={`${tile} from-chart-1/80 to-chart-1 bg-linear-to-b`} />
            <DockItem label="Mail" icon={<Mail />} className={`${tile} from-chart-1/70 to-chart-1 bg-linear-to-b`} />
            <DockItem label="Messages" active icon={<MessageCircle fill="currentColor" />} className={`${tile} from-chart-2/80 to-chart-2 bg-linear-to-b`} />
            <DockItem label="Notes" icon={<StickyNote />} className={`${tile} from-chart-3/80 to-chart-3 bg-linear-to-b`} />
            <DockItem label="Agent" active icon={<Sparkles />} className={tile} style={{ background: "conic-gradient(from 200deg, var(--chart-1), var(--chart-4), var(--chart-5), var(--chart-1))" }} />
            <DockItem label="Terminal" active icon={<SquareTerminal />} className={`${tile} bg-black/85`} />
            <DockSeparator />
            <DockItem label="Ballmac UI" icon={<Blocks />} className="bg-white/80 text-black/80 dark:bg-white/15 dark:text-white" />
          </Dock>
        </div>
      </div>
    </div>
  )
}
