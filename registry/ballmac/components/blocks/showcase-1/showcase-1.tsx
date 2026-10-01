// Ballmac UI: Showcase 1. https://ui.ballmac.com/blocks/showcase-1
"use client"

import * as React from "react"
import { BatteryFull, Command, Mail, Music2, Search, StickyNote, Wifi } from "lucide-react"

import { Dock, DockItem, DockSeparator } from "@/components/ballmac/dock"
import { MenuBar, MenuBarClock, MenuBarContent, MenuBarItem, MenuBarMenu, MenuBarSeparator, MenuBarShortcut, MenuBarStatus, MenuBarStatusItem, MenuBarTrigger } from "@/components/ballmac/menu-bar"
import { WindowManager, type ManagedWindow } from "@/components/ballmac/window-manager"
import { CalendarWidget, WeatherWidget } from "@/components/ballmac/widgets"
import { cn } from "@/lib/utils"

type Showcase1Props = Omit<React.ComponentProps<"div">, "children"> & {
  /** Name of your app, shown in the menu bar and the window title. */
  app?: string
  /** Your app's window content. It is laid out inside a container, so use container queries (`@sm:`) to adapt. Defaults to a sample ledger. */
  children?: React.ReactNode
  /** The time shown in the menu bar, as an ISO date-time. Fixed so every viewer sees the same screen. */
  time?: string
  /** Show the weather and calendar widgets on wide screens. */
  widgets?: boolean
  /** Include the sample Notes window and its dock icon. Turn it off when you show your own app on its own. */
  notes?: boolean
  /** Height of the scene. */
  height?: string
}

const tile = "text-white [&_svg]:drop-shadow-[0_1px_1px_rgb(0_0_0/0.25)]"

function Ledger({ app }: { app: string }) {
  const rows = [
    ["Northwind Studio", "Paid", "$4,200"],
    ["Globex Corp", "Due", "$12,800"],
    ["Initech", "Paid", "$960"],
    ["Umbrella Labs", "Paid", "$3,450"],
  ]
  return (
    <div className="@container bg-background flex h-full text-xs">
      <aside className="bg-muted/50 hidden w-32 shrink-0 space-y-0.5 border-r p-2 @md:block">
        <p className="text-muted-foreground px-2 pt-1 pb-1.5 text-[10px] font-semibold uppercase">{app}</p>
        {["Overview", "Invoices", "Customers", "Reports"].map((l, i) => (
          <p key={l} className={cn("rounded-md px-2 py-1.5", i === 1 ? "bg-foreground/10 font-medium" : "text-muted-foreground")}>{l}</p>
        ))}
      </aside>
      <div className="min-w-0 flex-1 p-4">
        <p className="text-base font-semibold tracking-tight">Invoices</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[["Outstanding", "$12.8k"], ["Paid this month", "$48.2k"], ["Overdue", "2"]].map(([k, v]) => (
            <div key={k} className="rounded-lg border p-2">
              <p className="text-muted-foreground text-[10px]">{k}</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">{v}</p>
            </div>
          ))}
        </div>
        <ul className="mt-3 divide-y rounded-lg border">
          {rows.map(([n, s, a]) => (
            <li key={n} className="flex items-center gap-2 px-2.5 py-2">
              <span className="min-w-0 flex-1 truncate font-medium">{n}</span>
              <span className={cn("rounded-full px-1.5 py-px text-[10px]", s === "Paid" ? "bg-chart-2/15" : "bg-chart-3/20")}>{s}</span>
              <span className="w-14 text-right tabular-nums">{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Notes() {
  return (
    <div className="bg-chart-3/10 h-full p-3 text-xs leading-relaxed">
      <p className="text-sm font-semibold">Before launch</p>
      <ul className="mt-2 space-y-1.5">
        {[["Final screenshots", true], ["Update the changelog", true], ["Notarize the build", false], ["Post to the newsletter", false]].map(([t, done]) => (
          <li key={String(t)} className="flex items-center gap-2">
            <span aria-hidden="true" className={cn("flex size-3.5 items-center justify-center rounded-full border", done && "bg-chart-2 border-transparent")}>{done && <svg viewBox="0 0 12 12" className="size-2.5 text-white"><path d="M2.5 6.5l2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span>
            <span className={cn(done && "text-muted-foreground line-through")}>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Showcase1({ app = "Ledger", children, time = "2026-10-01T09:41:00", widgets = true, notes = true, height = "38rem", className, style, ...props }: Showcase1Props) {
  const ref = React.useRef<HTMLDivElement>(null)
  const windowFor = React.useCallback(
    (id: string, narrow: boolean): ManagedWindow => {
      if (id === "notes") return { id, title: "Notes", x: 640, y: 60, width: 250, height: 220, content: <Notes /> }
      return narrow
        ? { id: "app", title: app, x: 10, y: 10, width: 330, height: 290, content: children ?? <Ledger app={app} /> }
        : { id: "app", title: app, x: 56, y: 28, width: 560, height: 350, content: children ?? <Ledger app={app} /> }
    },
    [app, children]
  )
  const [narrow, setNarrow] = React.useState(false)
  const [windows, setWindows] = React.useState<ManagedWindow[]>(() => (notes ? [windowFor("app", false), windowFor("notes", false)] : [windowFor("app", false)]))
  const open = React.useRef<string[]>(notes ? ["app", "notes"] : ["app"])

  // Re-lay the windows out when the scene becomes narrow or wide. The observer callback is not part of rendering.
  React.useEffect(() => {
    const node = ref.current
    if (!node || typeof ResizeObserver === "undefined") return
    let last = false
    const observer = new ResizeObserver(([entry]) => {
      const isNarrow = entry.contentRect.width < 640
      if (isNarrow === last) return
      last = isNarrow
      setNarrow(isNarrow)
      setWindows(open.current.filter((id) => !(isNarrow && id === "notes")).map((id) => windowFor(id, isNarrow)))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [windowFor])

  const launch = (id: "app" | "notes") => {
    if (narrow && id === "notes") return
    if (!open.current.includes(id)) open.current = [...open.current, id]
    setWindows((all) => (all.some((w) => w.id === id) ? all : [...all, windowFor(id, narrow)]))
  }
  const close = (id: string) => {
    open.current = open.current.filter((x) => x !== id)
    setWindows((all) => all.filter((w) => w.id !== id))
  }
  const running = (id: string) => windows.some((w) => w.id === id)

  return (
    <div
      ref={ref}
      data-slot="showcase-1"
      className={cn("@container relative isolate overflow-hidden rounded-2xl border border-foreground/10 shadow-[0_40px_100px_-50px_rgb(0_0_0/0.5)]", className)}
      style={{ height, ...style }}
      {...props}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.6] dark:saturate-[1.2]">
        <div className="absolute inset-0 bg-linear-to-br from-chart-1 via-chart-4 to-chart-5" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_15%_100%,var(--chart-2),transparent_70%),radial-gradient(60%_55%_at_85%_0%,var(--chart-3),transparent_70%)] opacity-70" />
        <div className="absolute -inset-x-1/4 top-[40%] h-[70%] rounded-[50%] bg-white/15 blur-2xl" />
      </div>

      <MenuBar className="relative z-30" aria-label="Menu bar">
        <MenuBarMenu value="system">
          <MenuBarTrigger aria-label="System menu" className="px-2.5"><Command aria-hidden="true" /></MenuBarTrigger>
          <MenuBarContent portal={false}>
            <MenuBarItem>About This Mac</MenuBarItem>
            <MenuBarSeparator />
            <MenuBarItem>System Settings…</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu value="app">
          <MenuBarTrigger variant="app">{app}</MenuBarTrigger>
          <MenuBarContent portal={false}>
            <MenuBarItem>About {app}</MenuBarItem>
            <MenuBarSeparator />
            <MenuBarItem>Settings… <MenuBarShortcut>⌘,</MenuBarShortcut></MenuBarItem>
            <MenuBarItem>Quit {app} <MenuBarShortcut>⌘Q</MenuBarShortcut></MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu value="file">
          <MenuBarTrigger className="max-sm:hidden">File</MenuBarTrigger>
          <MenuBarContent portal={false}>
            <MenuBarItem>New Invoice <MenuBarShortcut>⌘N</MenuBarShortcut></MenuBarItem>
            <MenuBarItem>Export… <MenuBarShortcut>⌘E</MenuBarShortcut></MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu value="window">
          <MenuBarTrigger className="max-sm:hidden">Window</MenuBarTrigger>
          <MenuBarContent portal={false}>
            <MenuBarItem>Minimize <MenuBarShortcut>⌘M</MenuBarShortcut></MenuBarItem>
            <MenuBarItem>Bring All to Front</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarStatus>
          <MenuBarStatusItem aria-label="Wi-Fi" className="max-sm:hidden"><Wifi className="size-3.5" aria-hidden="true" /></MenuBarStatusItem>
          <MenuBarStatusItem aria-label="Battery"><BatteryFull className="size-4" aria-hidden="true" /></MenuBarStatusItem>
          <MenuBarStatusItem aria-label="Search" className="max-sm:hidden"><Search className="size-3.5" aria-hidden="true" /></MenuBarStatusItem>
          <MenuBarClock value={new Date(time)} className="max-sm:hidden" />
        </MenuBarStatus>
      </MenuBar>

      {widgets && (
        <div className="pointer-events-none absolute top-10 right-4 z-0 hidden flex-col gap-3 @4xl:flex">
          <WeatherWidget city="Cupertino" temperature={72} condition="partly-cloudy" high={78} low={61} className="pointer-events-auto w-40" />
          <CalendarWidget date="2026-10-01" events={[{ id: "a", title: "Design review", time: "10:30 AM", tone: "red" }]} className="pointer-events-auto w-40" />
        </div>
      )}

      <WindowManager windows={windows} onClose={close} label={`${app} desktop`} className="absolute inset-x-0 top-7 bottom-0 z-10" />

      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center px-2">
        <Dock size={40} magnification={60} distance={130} aria-label="Applications" className="pointer-events-auto">
          <DockItem label={app} active={running("app")} activeLabel="running" bounce onClick={() => launch("app")} icon={<span className="text-lg font-bold">{app[0]}</span>} className={`${tile} bg-linear-to-b from-chart-1/80 to-chart-1`} />
          {notes && <DockItem label="Notes" active={running("notes")} activeLabel="running" bounce onClick={() => launch("notes")} icon={<StickyNote />} containerClassName="max-sm:hidden" className={`${tile} bg-linear-to-b from-chart-3/80 to-chart-3`} />}
          <DockItem label="Mail" icon={<Mail />} bounce className={`${tile} bg-linear-to-b from-chart-1/60 to-chart-5`} />
          <DockSeparator />
          <DockItem label="Music" icon={<Music2 />} bounce className={`${tile} bg-linear-to-b from-chart-4/80 to-chart-4`} />
        </Dock>
      </div>
    </div>
  )
}

export { Showcase1, type Showcase1Props }
