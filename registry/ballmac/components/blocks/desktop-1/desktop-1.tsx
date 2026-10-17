// Ballmac UI: Desktop 1. https://ui.ballmac.com/blocks/desktop-1
"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { Keyboard, Palette, RefreshCw, Settings2, SlidersHorizontal } from "lucide-react"

import { AppWindow, AppWindowContent, AppWindowTitleBar } from "@/components/ballmac/app-window"
import { Button } from "@/components/ballmac/button"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Switch } from "@/components/ballmac/switch"
import { useDirection } from "@/lib/ballmac/direction"
import { useFeel, type FeelId } from "@/lib/ballmac/feel"
import { cn } from "@/lib/utils"

type Desktop1Values = {
  launchAtLogin: boolean
  showInMenuBar: boolean
  appearance: "system" | "light" | "dark"
  density: "comfortable" | "compact"
  /** The global shortcut as key names joined with "+", for example "Mod+Shift+Space". Mod is ⌘ on a Mac and Ctrl elsewhere. */
  shortcut: string
  autoCheck: boolean
  autoInstall: boolean
  channel: "stable" | "beta"
  crashReports: boolean
}

type Desktop1Pane = {
  id: string
  label: string
  icon: React.ReactNode
  content: React.ReactNode
}

type Desktop1Props = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** Which platform the window handles like. Defaults to the page's feel. */
  feel?: FeelId
  /** Draw the window frame. Turn off inside a real Tauri or Electron window that already has one. */
  frame?: boolean
  /** The app name, used in copy such as "Open Acme at login". */
  appName?: string
  /** The settings when the window opens. */
  defaultValues?: Desktop1Values
  /** Controlled settings. Pass with onValuesChange. */
  values?: Desktop1Values
  /** Called with every change. Settings apply immediately, as they do in desktop apps: there is no Save button. */
  onValuesChange?: (values: Desktop1Values) => void
  /** The pane shown first. */
  defaultPane?: string
  /** More panes after the built-in ones, for your own settings. */
  extraPanes?: Desktop1Pane[]
  /** The version shown in the Updates pane. */
  version?: string
  /** Called by "Check now" in the Updates pane. */
  onCheckForUpdates?: () => void
  /** Called by "Reset all settings" after the built-in values are restored. */
  onReset?: () => void
  /** Window controls, passed to App Window. */
  onClose?: () => void
  onMinimize?: () => void
}

const defaults: Desktop1Values = {
  launchAtLogin: true,
  showInMenuBar: true,
  appearance: "system",
  density: "comfortable",
  shortcut: "Mod+Shift+Space",
  autoCheck: true,
  autoInstall: false,
  channel: "stable",
  crashReports: true,
}

const MODIFIERS = ["Mod", "Ctrl", "Alt", "Shift"] as const
const macKeys: Record<string, string> = { Mod: "⌘", Ctrl: "⌃", Alt: "⌥", Shift: "⇧", Space: "Space", Enter: "↩", Backspace: "⌫", Tab: "⇥", ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→" }
const pcKeys: Record<string, string> = { Mod: "Ctrl", Ctrl: "Ctrl", Alt: "Alt", Shift: "Shift", ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right" }

/** Writes a shortcut the way the platform does: ⇧⌘Space on a Mac (modifiers in Apple's order, no separators), Ctrl+Shift+Space elsewhere. */
function formatShortcut(shortcut: string, feel: FeelId) {
  if (!shortcut) return ""
  const parts = shortcut.split("+")
  if (feel === "macos" || feel === "ios") {
    const order = ["Ctrl", "Alt", "Shift", "Mod"]
    const mods = order.filter((m) => parts.includes(m)).map((m) => macKeys[m])
    const key = parts.find((p) => !(MODIFIERS as readonly string[]).includes(p)) ?? ""
    return mods.join("") + (macKeys[key] ?? key)
  }
  const mods = ["Mod", "Ctrl", "Alt", "Shift"].filter((m) => parts.includes(m)).map((m) => pcKeys[m])
  const key = parts.find((p) => !(MODIFIERS as readonly string[]).includes(p)) ?? ""
  return [...new Set(mods), pcKeys[key] ?? key].join("+")
}

/** Turns a key press into a shortcut string, or null when only modifiers are down or no modifier is held. */
function shortcutFromEvent(e: React.KeyboardEvent, mac: boolean): string | null {
  if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) return null
  const mods: string[] = []
  if (mac ? e.metaKey : e.ctrlKey) mods.push("Mod")
  if (mac && e.ctrlKey) mods.push("Ctrl")
  if (e.altKey) mods.push("Alt")
  if (e.shiftKey) mods.push("Shift")
  if (!mods.length) return null
  const key = e.code === "Space" ? "Space" : e.key.length === 1 ? e.key.toUpperCase() : e.key
  return [...mods, key].join("+")
}

/**
 * A button that records the next key combination. Escape cancels, Backspace or Delete clears. A combination needs at least one
 * modifier, so typing a letter cannot steal it from every other app.
 */
function ShortcutRecorder({ value, onChange, feel, labelledBy }: { value: string; onChange: (v: string) => void; feel: FeelId; labelledBy: string }) {
  const [recording, setRecording] = React.useState(false)
  const mac = feel === "macos" || feel === "ios"
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        data-slot="desktop-1-shortcut"
        aria-labelledby={labelledBy}
        aria-describedby={`${labelledBy}-hint`}
        aria-pressed={recording}
        onClick={() => setRecording((r) => !r)}
        onBlur={() => setRecording(false)}
        onKeyDown={(e) => {
          if (!recording) return
          if (e.key === "Tab") return setRecording(false)
          e.preventDefault()
          if (e.key === "Escape") return setRecording(false)
          if (e.key === "Backspace" || e.key === "Delete") {
            onChange("")
            return setRecording(false)
          }
          const next = shortcutFromEvent(e, mac)
          if (next) {
            onChange(next)
            setRecording(false)
          }
        }}
        className={cn(
          "border-input bg-background inline-flex h-[var(--bm-control-h-sm,calc(var(--spacing)*8))] min-w-32 items-center justify-center rounded-md border px-3 font-mono text-[13px] tabular-nums outline-none",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50",
          recording && "border-ring ring-ring/30 text-muted-foreground ring-[3px]"
        )}
      >
        <span dir="ltr">{recording ? "Type a shortcut…" : formatShortcut(value, feel) || "Record shortcut"}</span>
      </button>
      <span id={`${labelledBy}-hint`} className="sr-only">
        {recording ? "Press the new key combination. Escape cancels, Delete clears." : "Press to record a new shortcut."}
      </span>
      {value && !recording ? (
        <Button variant="ghost" size="sm" onClick={() => onChange("")}>
          Clear
        </Button>
      ) : null}
    </div>
  )
}

const FeelContext = React.createContext<FeelId>("web")

/** A group of setting rows. Windows draws each row as its own card; macOS, iOS and the web group them in one rounded box. */
function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  const feel = React.useContext(FeelContext)
  const id = React.useId()
  return (
    <section aria-labelledby={title ? id : undefined} className="grid gap-2">
      {title ? (
        <h3 id={id} className={cn("text-sm font-semibold", feel === "ios" && "text-muted-foreground px-4 text-xs font-normal uppercase")}>
          {title}
        </h3>
      ) : null}
      <div className={cn(feel === "windows" ? "grid gap-1" : "bg-card divide-border divide-y overflow-hidden rounded-lg border", feel === "macos" && "bg-muted/40")}>{children}</div>
    </section>
  )
}

/** One setting: its name and an optional line of help on the start side, the control on the end side. */
function Row({ label, description, children, id: idProp }: { label: string; description?: string; children: (id: string) => React.ReactNode; id?: string }) {
  const feel = React.useContext(FeelContext)
  const auto = React.useId()
  const id = idProp ?? auto
  return (
    <div
      data-slot="desktop-1-row"
      className={cn("flex flex-wrap items-center justify-between gap-x-6 gap-y-2", feel === "windows" ? "bg-card rounded-md border px-4 py-3.5" : "px-4 py-3")}
    >
      <div className="min-w-0 flex-1 basis-48">
        <p id={id} className="text-sm">
          {label}
        </p>
        {description ? (
          <p id={`${id}-desc`} className="text-muted-foreground mt-0.5 text-xs text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center">{children(id)}</div>
    </div>
  )
}

function Desktop1({
  feel: feelProp,
  frame = true,
  appName = "Acme",
  defaultValues = defaults,
  values: valuesProp,
  onValuesChange,
  defaultPane = "general",
  extraPanes = [],
  version = "2.4.1",
  onCheckForUpdates,
  onReset,
  onClose,
  onMinimize,
  className,
  ...props
}: Desktop1Props) {
  const page = useFeel().feel
  const feel = feelProp ?? page
  const dir = useDirection()
  const [internal, setInternal] = React.useState(defaultValues)
  const v = valuesProp ?? internal
  const [pane, setPane] = React.useState(defaultPane)
  const set = <K extends keyof Desktop1Values>(k: K, value: Desktop1Values[K]) => {
    const next = { ...v, [k]: value }
    if (!valuesProp) setInternal(next)
    onValuesChange?.(next)
  }
  const sideNav = feel === "windows"
  const settingsApp = feel === "macos" ? "System Settings" : feel === "windows" ? "Settings" : "settings"

  const panes: Desktop1Pane[] = [
    {
      id: "general",
      label: "General",
      icon: <Settings2 />,
      content: (
        <>
          <Group title="Startup">
            <Row label={`Open ${appName} at login`} description={`${appName} starts in the background when you sign in to this ${feel === "macos" ? "Mac" : "computer"}.`}>
              {(id) => <Switch checked={v.launchAtLogin} onCheckedChange={(c) => set("launchAtLogin", c)} aria-labelledby={id} aria-describedby={`${id}-desc`} />}
            </Row>
            <Row label={feel === "windows" ? "Show in the system tray" : "Show in the menu bar"} description="Quick access without opening the main window.">
              {(id) => <Switch checked={v.showInMenuBar} onCheckedChange={(c) => set("showInMenuBar", c)} aria-labelledby={id} aria-describedby={`${id}-desc`} />}
            </Row>
          </Group>
          <Group title="Privacy">
            <Row label="Send crash reports" description="Anonymous reports help fix problems. They never include your files.">
              {(id) => <Switch checked={v.crashReports} onCheckedChange={(c) => set("crashReports", c)} aria-labelledby={id} aria-describedby={`${id}-desc`} />}
            </Row>
          </Group>
        </>
      ),
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <Palette />,
      content: (
        <Group title="Look">
          <Row label="Appearance" description={`System follows the light or dark setting in ${settingsApp}.`}>
            {(id) => (
              <SegmentedControl value={v.appearance} onValueChange={(a) => set("appearance", a as Desktop1Values["appearance"])} aria-labelledby={id} size="sm">
                <SegmentedControlItem value="system">System</SegmentedControlItem>
                <SegmentedControlItem value="light">Light</SegmentedControlItem>
                <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
              </SegmentedControl>
            )}
          </Row>
          <Row label="Density">
            {(id) => (
              <Select value={v.density} onValueChange={(d) => set("density", d as Desktop1Values["density"])}>
                <SelectTrigger size="sm" className="w-36" aria-labelledby={id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            )}
          </Row>
        </Group>
      ),
    },
    {
      id: "shortcuts",
      label: "Shortcuts",
      icon: <Keyboard />,
      content: (
        <Group title="Global">
          <Row label={`Show ${appName}`} description="Works from any app. Use at least one modifier key.">
            {(id) => <ShortcutRecorder value={v.shortcut} onChange={(s) => set("shortcut", s)} feel={feel} labelledBy={id} />}
          </Row>
        </Group>
      ),
    },
    {
      id: "updates",
      label: "Updates",
      icon: <RefreshCw />,
      content: (
        <>
          <Group>
            <Row label={`${appName} ${version}`} description={v.autoCheck ? "Checks for updates once a day." : "Automatic checks are off."}>
              {() => (
                <Button variant="outline" size="sm" onClick={onCheckForUpdates}>
                  Check now
                </Button>
              )}
            </Row>
          </Group>
          <Group title="Automatic updates">
            <Row label="Check for updates automatically">
              {(id) => <Switch checked={v.autoCheck} onCheckedChange={(c) => set("autoCheck", c)} aria-labelledby={id} />}
            </Row>
            <Row label="Download and install in the background" description="The update is applied the next time you quit.">
              {(id) => <Switch checked={v.autoInstall} disabled={!v.autoCheck} onCheckedChange={(c) => set("autoInstall", c)} aria-labelledby={id} aria-describedby={`${id}-desc`} />}
            </Row>
            <Row label="Update channel" description="Beta builds arrive earlier and may have rough edges.">
              {(id) => (
                <SegmentedControl value={v.channel} onValueChange={(c) => set("channel", c as Desktop1Values["channel"])} aria-labelledby={id} size="sm">
                  <SegmentedControlItem value="stable">Stable</SegmentedControlItem>
                  <SegmentedControlItem value="beta">Beta</SegmentedControlItem>
                </SegmentedControl>
              )}
            </Row>
          </Group>
        </>
      ),
    },
    {
      id: "advanced",
      label: "Advanced",
      icon: <SlidersHorizontal />,
      content: (
        <Group title="Reset">
          <Row label="Reset all settings" description="Puts every setting back to how it was when you installed the app. Your data is kept.">
            {() => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!valuesProp) setInternal(defaults)
                  onValuesChange?.(defaults)
                  onReset?.()
                }}
              >
                Reset…
              </Button>
            )}
          </Row>
        </Group>
      ),
    },
    ...extraPanes,
  ]
  const current = panes.find((p) => p.id === pane) ?? panes[0]!
  // macOS names the window after the pane, as System Settings and every Settings window do; Windows keeps "Settings"
  const title = feel === "macos" ? current.label : "Settings"

  const tabs = (
    <TabsPrimitive.Root
      value={current.id}
      onValueChange={setPane}
      orientation={sideNav ? "vertical" : "horizontal"}
      dir={dir}
      className={cn("flex min-h-0 flex-1", sideNav ? "flex-col sm:flex-row" : "flex-col")}
    >
      <TabsPrimitive.List
        aria-label="Settings"
        data-slot="desktop-1-tabs"
        className={cn(
          "flex shrink-0",
          sideNav
            ? "gap-0.5 overflow-x-auto p-2 sm:w-52 sm:flex-col sm:overflow-visible sm:p-3"
            : "justify-center gap-1 overflow-x-auto border-b px-2 py-1.5"
        )}
      >
        {panes.map((p) => (
          <TabsPrimitive.Trigger
            key={p.id}
            value={p.id}
            className={cn(
              "text-muted-foreground data-[state=active]:text-foreground relative flex shrink-0 items-center rounded-md outline-none [&_svg]:shrink-0",
              "focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-colors duration-150",
              sideNav
                ? "hover:bg-foreground/[0.05] data-[state=active]:bg-foreground/[0.06] h-9 gap-3 px-3 text-sm [&_svg]:size-4 sm:w-full"
                : "hover:bg-foreground/[0.05] data-[state=active]:bg-foreground/[0.07] min-w-16 flex-col gap-1 px-2.5 py-1.5 text-[11px] [&_svg]:size-5"
            )}
          >
            {sideNav ? (
              <span aria-hidden="true" className="bg-primary absolute inset-y-2 start-0 hidden w-[3px] rounded-full [[data-state=active]>&]:block" />
            ) : null}
            <span aria-hidden="true" className={cn(!sideNav && "[[data-state=active]>&]:text-primary")}>
              {p.icon}
            </span>
            {p.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {panes.map((p) => (
        <TabsPrimitive.Content key={p.id} value={p.id} className="min-h-0 flex-1 overflow-auto outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50">
          <div className={cn("mx-auto grid w-full max-w-2xl gap-6", sideNav ? "p-4 sm:p-6" : "p-5")}>
            {sideNav ? <h2 className="text-xl font-semibold tracking-tight">{p.label}</h2> : null}
            {p.content}
          </div>
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  )

  const body = <FeelContext.Provider value={feel}>{tabs}</FeelContext.Provider>
  if (!frame)
    return (
      <div data-slot="desktop-1" data-feel={feelProp} className={cn("flex min-h-0 flex-col", className)} {...props}>
        {body}
      </div>
    )
  return (
    <AppWindow data-slot="desktop-1" feel={feel} onClose={onClose} onMinimize={onMinimize} className={cn("h-[30rem] w-full max-w-3xl", className)} {...props}>
      <AppWindowTitleBar title={title} icon={<Settings2 />} className={cn(!sideNav && "border-b-0")} />
      <AppWindowContent className="flex flex-col overflow-hidden">{body}</AppWindowContent>
    </AppWindow>
  )
}

export { Desktop1, formatShortcut, type Desktop1Props, type Desktop1Values, type Desktop1Pane }
