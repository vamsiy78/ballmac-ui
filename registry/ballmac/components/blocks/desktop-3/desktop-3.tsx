// Ballmac UI: Desktop 3. https://ui.ballmac.com/blocks/desktop-3
"use client"

import * as React from "react"
import { CircleAlert, CircleCheck, Download, RotateCw, Sparkles } from "lucide-react"

import { AppWindow, AppWindowContent, AppWindowTitleBar } from "@/components/ballmac/app-window"
import { Button } from "@/components/ballmac/button"
import { Checkbox } from "@/components/ballmac/checkbox"
import { Progress } from "@/components/ballmac/progress"
import { Spinner } from "@/components/ballmac/spinner"
import { frameProps, type ErrorConfig } from "@/components/ballmac/state-view"
import { useFeel, type FeelId } from "@/lib/ballmac/feel"
import type { BlockState } from "@/lib/ballmac/use-resource"
import { cn } from "@/lib/utils"

type Desktop3Release = {
  version: string
  /** Already written for people ("12 October 2026"). */
  date?: string
  changes: { type?: "new" | "improved" | "fixed"; text: string }[]
}

type Desktop3Props = Omit<React.ComponentProps<"div">, "children"> & {
  /** Which platform the window handles like. Defaults to the page's feel. */
  feel?: FeelId
  /** Draw the window frame. Turn off inside a real Tauri or Electron window that already has one. */
  frame?: boolean
  appName?: string
  /** The version running now. */
  currentVersion?: string
  /** The releases since the current version, newest first. The first one is the version offered. */
  releases?: Desktop3Release[]
  /** The download size in bytes, shown while downloading. */
  size?: number
  /** The app icon. A generated one is drawn when you leave it out. */
  icon?: React.ReactNode
  /**
   * Where the update is. Leave it out and the window runs the whole flow itself (offer, download with progress, ready to relaunch).
   * `loading` is checking, `empty` is up to date, `submitting` is downloading (with `progress`), `success` is ready to relaunch, `error` failed.
   */
  state?: BlockState
  /** Download progress from 0 to 1 while `state` is `submitting`. */
  progress?: number
  /** Copy for the error state. */
  errorState?: ErrorConfig
  /** Whether "Automatically download and install updates" is ticked (controlled). */
  automatic?: boolean
  onAutomaticChange?: (automatic: boolean) => void
  /**
   * Called by Install. Report progress from 0 to 1 with `report`; resolve when the update is downloaded and ready, throw to show the
   * error. Defaults to a short simulated download.
   */
  onInstall?: (report: (progress: number) => void) => void | Promise<void>
  /** Called by "Install and relaunch" once the update is ready. */
  onRelaunch?: () => void
  /** Called by "Remind me later" and Close. */
  onRemindLater?: () => void
  /** Called by "Skip this version" with the version skipped. */
  onSkip?: (version: string) => void
  /** Called by "Try again" in the error state, and by "Check again" when up to date. */
  onRetry?: () => void
}

const sample: Desktop3Release[] = [
  {
    version: "2.5.0",
    date: "14 October 2026",
    changes: [
      { type: "new", text: "Folders can be shared with a link that expires." },
      { type: "new", text: "Quick look: press Space on any item to preview it." },
      { type: "improved", text: "Search is up to three times faster in large libraries." },
      { type: "fixed", text: "The window remembers its size on displays with different scaling." },
    ],
  },
  {
    version: "2.4.2",
    date: "2 October 2026",
    changes: [{ type: "fixed", text: "Sync no longer pauses after the computer wakes from sleep." }],
  },
]

const changeLabel = { new: "New", improved: "Improved", fixed: "Fixed" } as const

const mb = (bytes: number) => `${(bytes / 1_000_000).toFixed(1)} MB`

function AppIcon({ icon, className }: { icon?: React.ReactNode; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "from-primary to-primary/70 text-primary-foreground flex shrink-0 items-center justify-center rounded-[22%] bg-linear-to-b shadow-[0_1px_2px_rgb(0_0_0/0.2),inset_0_1px_0_rgb(255_255_255/0.25)] [&_svg]:size-1/2",
        className
      )}
    >
      {icon ?? <Sparkles />}
    </span>
  )
}

/** The buttons along the bottom, in the platform's order: macOS puts the default button last, Windows first. */
function Actions({ feel, start, children }: { feel: FeelId; start?: React.ReactNode; children: React.ReactNode[] }) {
  const ordered = feel === "windows" ? [...children].reverse() : children
  return (
    <div data-slot="desktop-3-actions" className="flex flex-wrap items-center gap-2">
      {start}
      <div className="ms-auto flex flex-wrap justify-end gap-2">{ordered}</div>
    </div>
  )
}

function Desktop3({
  feel: feelProp,
  frame = true,
  appName = "Acme",
  currentVersion = "2.4.1",
  releases = sample,
  size = 42_600_000,
  icon,
  state: stateProp,
  progress: progressProp,
  errorState,
  automatic: automaticProp,
  onAutomaticChange,
  onInstall,
  onRelaunch,
  onRemindLater,
  onSkip,
  onRetry,
  className,
  ...props
}: Desktop3Props) {
  const page = useFeel().feel
  const feel = feelProp ?? page
  const win = feel === "windows"
  const id = React.useId()
  const [internal, setInternal] = React.useState<BlockState>("ready")
  const [internalProgress, setInternalProgress] = React.useState(0)
  const [autoLocal, setAutoLocal] = React.useState(false)
  const state = stateProp ?? internal
  const progress = Math.min(1, Math.max(0, progressProp ?? internalProgress))
  const automatic = automaticProp ?? autoLocal
  const offered = releases[0]
  const mounted = React.useRef(true)
  React.useEffect(() => () => void (mounted.current = false), [])

  async function install() {
    setInternal("submitting")
    setInternalProgress(0)
    const report = (p: number) => mounted.current && setInternalProgress(p)
    try {
      if (onInstall) await onInstall(report)
      else
        for (let i = 1; i <= 20; i++) {
          await new Promise((r) => setTimeout(r, 90))
          report(i / 20)
        }
      if (mounted.current) setInternal("success")
    } catch {
      if (mounted.current) setInternal("error")
    }
  }

  const heading =
    state === "loading"
      ? "Checking for updates…"
      : state === "empty" || !offered
        ? `${appName} is up to date`
        : state === "error"
          ? "The update could not be downloaded"
          : state === "submitting"
            ? `Downloading ${appName} ${offered.version}…`
            : state === "success"
              ? `${appName} ${offered.version} is ready to install`
              : `A new version of ${appName} is available`

  const detail =
    state === "loading"
      ? `You have ${appName} ${currentVersion}.`
      : state === "empty" || !offered
        ? `${currentVersion} is the newest version.`
        : state === "error"
          ? (errorState?.description ?? "Check your internet connection and try again. Nothing was changed.")
          : state === "submitting"
            ? `${mb(size * progress)} of ${mb(size)}`
            : state === "success"
              ? `${appName} will quit, install the update and open again. Unsaved work is kept.`
              : `${appName} ${offered.version} is available. You have ${currentVersion}.`

  const showNotes = offered && (state === "ready" || state === "submitting" || state === "success")
  const status = state === "loading" ? <Spinner className="size-4" /> : state === "error" ? <CircleAlert className="text-destructive size-4" /> : state === "empty" || state === "success" ? <CircleCheck className="text-chart-2 size-4" /> : null

  const content = (
    <div data-slot="desktop-3-body" className="flex min-h-0 flex-1 flex-col gap-4 p-5">
      <div className={cn("flex gap-4", win ? "items-center" : "items-start")}>
        <AppIcon icon={icon} className={win ? "size-10" : "size-16"} />
        <div className="min-w-0 flex-1">
          {/* only the heading is live: the byte count under it changes many times a second */}
          <h2 aria-live="polite" aria-atomic="true" id={`${id}-title`} className={cn("flex items-center gap-2 font-semibold text-pretty", win ? "text-lg" : "text-[15px]")}>
            {status ? <span aria-hidden="true">{status}</span> : null}
            {errorState?.title && state === "error" ? errorState.title : heading}
          </h2>
          <p className="text-muted-foreground mt-1 text-[13px] tabular-nums text-pretty">{detail}</p>
        </div>
      </div>

      {state === "submitting" ? <Progress value={progress * 100} aria-label={`Downloading ${appName} ${offered?.version ?? ""}`} /> : null}

      {showNotes ? (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <p className="text-[13px] font-medium">{win ? "What’s new" : "Release notes:"}</p>
          <div tabIndex={0} aria-label="Release notes" role="region" className="bg-background min-h-0 flex-1 overflow-y-auto rounded-md border p-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            {releases.map((r) => (
              <section key={r.version} className="mb-4 last:mb-0">
                <h3 className="text-sm font-semibold">
                  {appName} {r.version}
                  {r.date ? <span className="text-muted-foreground ms-2 text-xs font-normal">{r.date}</span> : null}
                </h3>
                <ul className="mt-2 grid gap-1.5">
                  {r.changes.map((c, i) => (
                    <li key={i} className="flex gap-2 text-[13px]">
                      {c.type ? (
                        <span
                          className={cn(
                            "mt-px h-fit shrink-0 rounded px-1.5 text-[10px] leading-4 font-medium uppercase",
                            c.type === "new" ? "bg-primary/10 text-primary" : c.type === "fixed" ? "bg-chart-2/15 text-foreground" : "bg-muted text-foreground"
                          )}
                        >
                          {changeLabel[c.type]}
                        </span>
                      ) : null}
                      <span className="text-pretty">{c.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {state === "ready" && offered ? (
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${id}-auto`}
            checked={automatic}
            onCheckedChange={(c) => {
              setAutoLocal(c === true)
              onAutomaticChange?.(c === true)
            }}
          />
          <label htmlFor={`${id}-auto`} className="text-[13px]">
            Automatically download and install updates in the future
          </label>
        </div>
      ) : null}

      {state === "ready" && offered ? (
        <Actions
          feel={feel}
          start={
            <Button variant={win ? "link" : "outline"} size="sm" className={cn(win && "px-0")} onClick={() => onSkip?.(offered.version)}>
              {win ? "Skip this version" : "Skip This Version"}
            </Button>
          }
        >
          {[
            <Button key="later" variant="outline" size="sm" onClick={onRemindLater}>
              {win ? "Remind me later" : "Remind Me Later"}
            </Button>,
            <Button key="install" size="sm" onClick={install}>
              <Download aria-hidden="true" />
              {win ? "Install now" : "Install Update"}
            </Button>,
          ]}
        </Actions>
      ) : state === "submitting" ? (
        <Actions feel={feel}>
          {[
            <Button key="hide" variant="outline" size="sm" onClick={onRemindLater}>
              Hide
            </Button>,
          ]}
        </Actions>
      ) : state === "success" ? (
        <Actions feel={feel}>
          {[
            <Button key="later" variant="outline" size="sm" onClick={onRemindLater}>
              {win ? "Install on quit" : "Install on Quit"}
            </Button>,
            <Button key="relaunch" size="sm" onClick={onRelaunch}>
              <RotateCw aria-hidden="true" />
              {win ? "Restart now" : "Install and Relaunch"}
            </Button>,
          ]}
        </Actions>
      ) : state === "error" ? (
        <Actions feel={feel}>
          {[
            <Button key="close" variant="outline" size="sm" onClick={onRemindLater}>
              {win ? "Close" : "Cancel"}
            </Button>,
            <Button key="retry" size="sm" onClick={onRetry ?? (stateProp === undefined ? install : undefined)}>
              {errorState?.retryLabel ?? (win ? "Try again" : "Try Again")}
            </Button>,
          ]}
        </Actions>
      ) : state === "empty" || !offered ? (
        <Actions feel={feel}>
          {[
            <Button key="ok" size="sm" onClick={onRemindLater}>
              OK
            </Button>,
          ]}
        </Actions>
      ) : (
        <Actions feel={feel}>
          {[
            <Button key="cancel" variant="outline" size="sm" onClick={onRemindLater}>
              Cancel
            </Button>,
          ]}
        </Actions>
      )}
    </div>
  )

  const busy = state === "loading" || state === "submitting"
  if (!frame)
    return (
      <div data-slot="desktop-3" data-state={state} data-feel={feelProp} aria-busy={busy || undefined} aria-labelledby={`${id}-title`} role="region" className={cn("flex flex-col", className)} {...frameProps(props)}>
        {content}
      </div>
    )
  return (
    <AppWindow
      data-slot="desktop-3"
      data-state={state}
      feel={feel}
      onClose={onRemindLater}
      aria-busy={busy || undefined}
      aria-labelledby={`${id}-title`}
      role="region"
      className={cn("h-[28rem] w-full max-w-xl", className)}
      {...frameProps(props)}
    >
      <AppWindowTitleBar title={win ? `${appName} update` : "Software Update"} icon={<RotateCw />} className="border-b-0" />
      <AppWindowContent className="flex flex-col">{content}</AppWindowContent>
    </AppWindow>
  )
}

export { Desktop3, type Desktop3Props, type Desktop3Release }
