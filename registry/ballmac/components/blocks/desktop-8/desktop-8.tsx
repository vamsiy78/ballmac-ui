// Ballmac UI: Desktop 8. https://ui.ballmac.com/blocks/desktop-8
"use client"

import * as React from "react"
import { Keyboard, RotateCcw, Search, TriangleAlert } from "lucide-react"

import { AppWindow, AppWindowContent, AppWindowTitleBar } from "@/components/ballmac/app-window"
import { Button } from "@/components/ballmac/button"
import { useFeel, type FeelId } from "@/lib/ballmac/feel"
import { formatShortcut, normalizeShortcut, shortcutFromEvent, usesMacKeys } from "@/lib/ballmac/shortcut"
import { cn } from "@/lib/utils"

type Desktop8Command = {
  id: string
  label: string
  /** The section it is listed under ("File", "Edit", "View"). */
  group: string
  /** The default shortcut, such as "Mod+Shift+N". Empty for none. */
  shortcut: string
}

type Desktop8Props = Omit<React.ComponentProps<"div">, "children" | "onChange"> & {
  /** Which platform the window handles like. Defaults to the page's feel. */
  feel?: FeelId
  /** Draw the window frame. Turn off inside a real Tauri or Electron window, or a settings pane. */
  frame?: boolean
  /** Every command that can have a shortcut, with its default. */
  commands?: Desktop8Command[]
  /** Shortcuts people changed, by command id ("" for removed). Pass with onValuesChange to control. */
  values?: Record<string, string>
  defaultValues?: Record<string, string>
  /** Called with every change, holding only the shortcuts that differ from the defaults. */
  onValuesChange?: (values: Record<string, string>) => void
  onClose?: () => void
}

const sample: Desktop8Command[] = [
  { id: "new", label: "New note", group: "File", shortcut: "Mod+N" },
  { id: "new-window", label: "New window", group: "File", shortcut: "Mod+Shift+N" },
  { id: "save", label: "Save", group: "File", shortcut: "Mod+S" },
  { id: "export", label: "Export as PDF", group: "File", shortcut: "" },
  { id: "find", label: "Find in note", group: "Edit", shortcut: "Mod+F" },
  { id: "find-all", label: "Find in all notes", group: "Edit", shortcut: "Mod+Shift+F" },
  { id: "duplicate", label: "Duplicate line", group: "Edit", shortcut: "Mod+Shift+D" },
  { id: "palette", label: "Command palette", group: "View", shortcut: "Mod+K" },
  { id: "sidebar", label: "Toggle sidebar", group: "View", shortcut: "Mod+Alt+S" },
  { id: "focus", label: "Focus mode", group: "View", shortcut: "Mod+Shift+Enter" },
]

/**
 * A keyboard shortcuts editor: every command grouped and searchable by name or by pressing the keys, a recorder on each row, a
 * warning with Replace when a combination is already taken, reset per command, Restore defaults, and each platform's notation.
 */
function Desktop8({
  feel: feelProp,
  frame = true,
  commands = sample,
  values: valuesProp,
  defaultValues = {},
  onValuesChange,
  onClose,
  className,
  ...props
}: Desktop8Props) {
  const page = useFeel().feel
  const feel = feelProp ?? page
  const mac = usesMacKeys(feel)
  const id = React.useId()
  const [local, setLocal] = React.useState(defaultValues)
  const overrides = valuesProp ?? local
  const [query, setQuery] = React.useState("")
  const [byKeys, setByKeys] = React.useState<string | null>(null)
  const [listening, setListening] = React.useState(false)
  const [recording, setRecording] = React.useState<string | null>(null)
  const [conflict, setConflict] = React.useState<{ id: string; shortcut: string; other: Desktop8Command } | null>(null)
  const [announce, setAnnounce] = React.useState("")

  const current = (c: Desktop8Command) => (c.id in overrides ? overrides[c.id]! : c.shortcut)
  const commit = (next: Record<string, string>) => {
    // keep only real changes, so the stored settings stay small and defaults can change later
    const clean = Object.fromEntries(Object.entries(next).filter(([k, v]) => commands.find((c) => c.id === k)?.shortcut !== v))
    if (!valuesProp) setLocal(clean)
    onValuesChange?.(clean)
  }
  const assign = (cmdId: string, shortcut: string) => commit({ ...overrides, [cmdId]: shortcut })

  function record(cmd: Desktop8Command, shortcut: string) {
    setRecording(null)
    const other = commands.find((c) => c.id !== cmd.id && current(c) && normalizeShortcut(current(c), feel) === normalizeShortcut(shortcut, feel))
    if (other) {
      setConflict({ id: cmd.id, shortcut, other })
      return
    }
    assign(cmd.id, shortcut)
    setAnnounce(`${cmd.label}: ${formatShortcut(shortcut, feel)}`)
  }

  const q = query.trim().toLowerCase()
  const visible = commands.filter((c) => (byKeys ? normalizeShortcut(current(c), feel) === normalizeShortcut(byKeys, feel) : !q || c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)))
  const groups = [...new Set(visible.map((c) => c.group))]
  const changed = Object.keys(overrides).length

  const body = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b p-3">
        <div className="bg-background focus-within:ring-ring/50 flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border px-2.5 focus-within:ring-[3px]">
          <Search aria-hidden="true" className="text-muted-foreground size-3.5" />
          {listening || byKeys ? (
            <button
              type="button"
              autoFocus
              aria-label="Search by keys"
              aria-describedby={`${id}-keys-hint`}
              onKeyDown={(e) => {
                if (e.key === "Tab") return
                e.preventDefault()
                if (e.key === "Escape") {
                  setListening(false)
                  setByKeys(null)
                  return
                }
                const s = shortcutFromEvent(e, mac, false)
                if (s) {
                  setByKeys(s)
                  setListening(false)
                }
              }}
              onClick={() => {
                setByKeys(null)
                setListening(true)
              }}
              className="text-muted-foreground min-w-0 flex-1 text-start text-[13px] outline-none"
            >
              {byKeys ? (
                <span dir="ltr" className="text-foreground font-mono">{formatShortcut(byKeys, feel)}</span>
              ) : (
                "Press keys…"
              )}
            </button>
          ) : (
            <input type="search" aria-label="Search commands" placeholder="Search commands" value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-[13px] outline-none" />
          )}
          <span id={`${id}-keys-hint`} className="sr-only">
            Press a key combination to find the command that uses it. Escape goes back to searching by name.
          </span>
        </div>
        <Button
          variant={listening || byKeys ? "secondary" : "outline"}
          size="sm"
          aria-pressed={listening || !!byKeys}
          onClick={() => {
            if (listening || byKeys) {
              setListening(false)
              setByKeys(null)
            } else {
              setQuery("")
              setListening(true)
            }
          }}
        >
          <Keyboard aria-hidden="true" />
          By keys
        </Button>
      </div>

      {conflict ? (
        <div role="alert" className="bg-chart-3/10 border-chart-3/30 flex flex-wrap items-center gap-3 border-b px-4 py-2.5 text-[13px]">
          <TriangleAlert aria-hidden="true" className="text-chart-3 size-4 shrink-0" />
          <p className="min-w-0 flex-1 text-pretty">
            <span dir="ltr" className="font-mono font-medium">{formatShortcut(conflict.shortcut, feel)}</span> is already used by “{conflict.other.label}”.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setConflict(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                commit({ ...overrides, [conflict.id]: conflict.shortcut, [conflict.other.id]: "" })
                setAnnounce(`Replaced. ${conflict.other.label} has no shortcut now.`)
                setConflict(null)
              }}
            >
              Replace
            </Button>
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {groups.map((g) => (
          <section key={g} aria-labelledby={`${id}-${g}`} className="mb-4 last:mb-0">
            <h3 id={`${id}-${g}`} className="text-muted-foreground px-2 pb-1 text-xs font-medium">
              {g}
            </h3>
            <ul className="divide-border bg-card divide-y overflow-hidden rounded-lg border">
              {visible
                .filter((c) => c.group === g)
                .map((c) => {
                  const value = current(c)
                  const isRec = recording === c.id
                  const custom = c.id in overrides
                  return (
                    <li key={c.id} className="flex items-center gap-2 px-3 py-1.5">
                      <span className="min-w-0 flex-1 truncate text-[13px]">
                        <span id={`${id}-${c.id}`}>{c.label}</span>
                        {custom ? <span className="text-muted-foreground ms-2 text-xs">Changed</span> : null}
                      </span>
                      <button
                        type="button"
                        aria-labelledby={`${id}-${c.id}`}
                        aria-describedby={`${id}-rec-hint`}
                        aria-pressed={isRec}
                        onClick={() => setRecording(isRec ? null : c.id)}
                        onBlur={() => isRec && setRecording(null)}
                        onKeyDown={(e) => {
                          if (!isRec) return
                          if (e.key === "Tab") return setRecording(null)
                          e.preventDefault()
                          if (e.key === "Escape") return setRecording(null)
                          if (e.key === "Backspace" || e.key === "Delete") {
                            setRecording(null)
                            assign(c.id, "")
                            setAnnounce(`${c.label}: no shortcut`)
                            return
                          }
                          const s = shortcutFromEvent(e, mac, false)
                          if (s) record(c, s)
                        }}
                        className={cn(
                          "border-input bg-background inline-flex h-7 min-w-24 items-center justify-center rounded-md border px-2 font-mono text-xs tabular-nums outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                          isRec && "border-ring ring-ring/30 text-muted-foreground ring-[3px]",
                          !value && !isRec && "text-muted-foreground"
                        )}
                      >
                        <span dir="ltr">{isRec ? "Type keys…" : value ? formatShortcut(value, feel) : "None"}</span>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Reset ${c.label}`}
                        className={cn("size-7", !custom && "invisible")}
                        tabIndex={custom ? undefined : -1}
                        aria-hidden={custom ? undefined : true}
                        onClick={() => {
                          const { [c.id]: _, ...rest } = overrides
                          commit(rest)
                          setAnnounce(`${c.label} reset to ${c.shortcut ? formatShortcut(c.shortcut, feel) : "no shortcut"}`)
                        }}
                      >
                        <RotateCcw aria-hidden="true" />
                      </Button>
                    </li>
                  )
                })}
            </ul>
          </section>
        ))}
        {!visible.length ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            {byKeys ? (
              <>
                No command uses <span dir="ltr" className="font-mono">{formatShortcut(byKeys, feel)}</span>.
              </>
            ) : (
              <>No commands match “{query}”.</>
            )}
          </p>
        ) : null}
        <span id={`${id}-rec-hint`} className="sr-only">
          Press to record. Then type the new keys; Escape cancels, Delete removes the shortcut.
        </span>
      </div>

      <div className="flex items-center gap-3 border-t px-4 py-2.5">
        <p className="text-muted-foreground flex-1 text-xs">{changed ? (changed === 1 ? "1 shortcut changed" : `${changed} shortcuts changed`) : "All shortcuts are the defaults"}</p>
        <Button variant="outline" size="sm" disabled={!changed} onClick={() => { commit({}); setAnnounce("Every shortcut restored") }}>
          {mac ? "Restore Defaults" : "Restore defaults"}
        </Button>
      </div>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </div>
  )

  if (!frame)
    return (
      <div data-slot="desktop-8" data-feel={feelProp} className={cn("bg-card flex min-h-0 flex-col overflow-hidden rounded-xl border", className)} {...props}>
        {body}
      </div>
    )
  return (
    <AppWindow data-slot="desktop-8" feel={feel} onClose={onClose} className={cn("h-[32rem] w-full max-w-xl", className)} {...props}>
      <AppWindowTitleBar title={mac ? "Keyboard Shortcuts" : "Keyboard shortcuts"} icon={<Keyboard />} />
      <AppWindowContent className="flex flex-col overflow-hidden">{body}</AppWindowContent>
    </AppWindow>
  )
}

export { Desktop8, type Desktop8Props, type Desktop8Command }
