// Ballmac UI: Desktop 5. https://ui.ballmac.com/blocks/desktop-5
"use client"

import * as React from "react"
import { Accessibility, Bell, Check, ExternalLink, Loader2, MonitorUp, ShieldCheck, Sparkles } from "lucide-react"

import { AppWindow, AppWindowContent, AppWindowTitleBar } from "@/components/ballmac/app-window"
import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { useFeel, type FeelId } from "@/lib/ballmac/feel"
import { cn } from "@/lib/utils"

type Desktop5Status = "granted" | "denied" | "prompt"

type Desktop5Permission = {
  id: string
  title: string
  /** Why the app needs it, in one sentence people can judge. */
  description: string
  icon?: React.ReactNode
  /** Continue stays disabled until every required permission is granted. */
  required?: boolean
  /** granted, denied (turned off; only the system settings can change it) or prompt (not asked yet). */
  status: Desktop5Status
  /** Where it lives in the system settings, per platform, shown when it was denied. */
  settingsPath?: Partial<Record<FeelId, string>>
}

type Desktop5Props = Omit<React.ComponentProps<"div">, "children"> &
  StateProps & {
    /** Which platform the window handles like. Defaults to the page's feel. */
    feel?: FeelId
    /** Draw the window frame. Turn off inside a real Tauri or Electron window that already has one. */
    frame?: boolean
    appName?: string
    /** The app icon. A generated one is drawn when you leave it out. */
    icon?: React.ReactNode
    /** The permissions, in the order to ask for them. */
    permissions?: Desktop5Permission[]
    /** Called by Allow: show the system prompt and resolve with the answer. Defaults to granting after a moment. */
    onRequest?: (id: string) => Desktop5Status | Promise<Desktop5Status>
    /** Called by "Open System Settings" (macOS) or "Open Settings" (Windows) for a permission that was denied. */
    onOpenSettings?: (id: string) => void
    /**
     * Called when the window gets focus again, the moment people come back from the system settings. Read the real statuses and
     * pass them back through `permissions`.
     */
    onRecheck?: () => void
    /** Called by Continue, enabled once every required permission is granted. */
    onContinue?: () => void
    /** Called by "Set up later". Leave it out to hide the button. */
    onSkip?: () => void
  }

const sample: Desktop5Permission[] = [
  {
    id: "accessibility",
    title: "Accessibility",
    description: "Reads the text you select so it can be summarized. Nothing leaves this computer.",
    icon: <Accessibility />,
    required: true,
    status: "granted",
    settingsPath: { macos: "Privacy & Security › Accessibility", windows: "Accessibility" },
  },
  {
    id: "screen",
    title: "Screen recording",
    description: "Captures the window you pick when you share a screenshot.",
    icon: <MonitorUp />,
    status: "denied",
    settingsPath: { macos: "Privacy & Security › Screen & System Audio Recording", windows: "Privacy & security › Screenshots and apps" },
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Tells you when a long summary is ready.",
    icon: <Bell />,
    status: "prompt",
    settingsPath: { macos: "Notifications", windows: "System › Notifications" },
  },
]

function AppIcon({ icon }: { icon?: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="from-primary to-primary/70 text-primary-foreground flex size-14 shrink-0 items-center justify-center rounded-[22%] bg-linear-to-b shadow-[0_1px_2px_rgb(0_0_0/0.2),inset_0_1px_0_rgb(255_255_255/0.25)] [&_svg]:size-1/2"
    >
      {icon ?? <Sparkles />}
    </span>
  )
}

function RowsSkeleton() {
  return (
    <div className="grid gap-2" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="grid flex-1 gap-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  )
}

/**
 * The first-run window that asks for system permissions one at a time, says why each is needed, sends people to the right place in
 * the system settings when one was turned off, and checks again the moment they come back.
 */
function Desktop5({
  feel: feelProp,
  frame = true,
  appName = "Acme",
  icon,
  permissions: permissionsProp = sample,
  onRequest,
  onOpenSettings,
  onRecheck,
  onContinue,
  onSkip,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Desktop5Props) {
  const page = useFeel().feel
  const feel = feelProp ?? page
  const win = feel === "windows"
  const mac = feel === "macos"
  const id = React.useId()
  const settingsApp = mac ? "System Settings" : "Settings"
  const [list, setList] = React.useState(permissionsProp)
  React.useEffect(() => setList(permissionsProp), [permissionsProp])
  const [asking, setAsking] = React.useState<string | null>(null)

  // coming back from the system settings focuses this window again: the moment to read the statuses
  React.useEffect(() => {
    if (!onRecheck) return
    window.addEventListener("focus", onRecheck)
    return () => window.removeEventListener("focus", onRecheck)
  }, [onRecheck])

  async function request(p: Desktop5Permission) {
    setAsking(p.id)
    try {
      const status = onRequest ? await onRequest(p.id) : await new Promise<Desktop5Status>((r) => setTimeout(() => r("granted"), 700))
      setList((l) => l.map((x) => (x.id === p.id ? { ...x, status } : x)))
    } finally {
      setAsking(null)
    }
  }

  const granted = list.filter((p) => p.status === "granted").length
  const missing = list.filter((p) => p.required && p.status !== "granted")
  const t = (macText: string, other: string) => (mac ? macText : other)

  const content = (
    <div className="flex min-h-0 flex-1 flex-col gap-5 p-6">
      <div className={cn("flex gap-4", mac ? "flex-col items-center text-center" : "items-center")}>
        <AppIcon icon={icon} />
        <div>
          <h2 id={`${id}-title`} className="text-lg font-semibold">
            {t(`Welcome to ${appName}`, `Set up ${appName}`)}
          </h2>
          <p className="text-muted-foreground mt-1 text-[13px] text-pretty">
            {appName} needs your permission for a few things. You can change them any time in {settingsApp}.
          </p>
        </div>
      </div>

      <StateView
        state={state}
        onRetry={onRetry}
        label="Checking permissions"
        loading={<RowsSkeleton />}
        empty={{ title: emptyState?.title ?? "Nothing to set up", description: emptyState?.description ?? `${appName} is ready to use.`, icon: emptyState?.icon ?? <ShieldCheck />, action: emptyState?.action }}
        error={{ title: errorState?.title ?? "Permissions could not be read", description: errorState?.description ?? `Open ${settingsApp} to check them, or try again.`, ...errorState }}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <ul aria-label="Permissions" className={cn("grid gap-2", !win && "bg-muted/40 gap-0 divide-y overflow-hidden rounded-lg border")}>
          {list.map((p) => {
            const path = p.settingsPath?.[feel] ?? p.settingsPath?.macos
            return (
              <li key={p.id} data-status={p.status} className={cn("flex flex-wrap items-center gap-3 p-3", win && "bg-card rounded-md border")}>
                <span aria-hidden="true" className="bg-background text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border [&_svg]:size-4">
                  {p.icon ?? <ShieldCheck />}
                </span>
                <div className="min-w-0 flex-1 basis-48">
                  <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium">
                    {p.title}
                    {p.required ? <span className="text-muted-foreground text-xs font-normal">Required</span> : null}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs text-pretty">{p.description}</p>
                  {p.status === "denied" ? (
                    <p className="mt-1 text-xs text-pretty">
                      Turned off. Turn it on in {settingsApp}
                      {path ? <> › <span className="font-medium">{path}</span></> : null}, then come back.
                    </p>
                  ) : null}
                </div>
                <div className="ms-auto shrink-0">
                  {p.status === "granted" ? (
                    <span className="text-muted-foreground flex h-8 items-center gap-1.5 px-2 text-[13px]">
                      <Check aria-hidden="true" className="text-chart-2 size-4" />
                      Allowed
                    </span>
                  ) : p.status === "denied" ? (
                    <Button variant="outline" size="sm" onClick={() => onOpenSettings?.(p.id)} aria-label={`${t("Open System Settings", "Open Settings")} for ${p.title}`}>
                      {t("Open System Settings", "Open Settings")}
                      <ExternalLink aria-hidden="true" className="rtl:-scale-x-100" />
                    </Button>
                  ) : (
                    <Button size="sm" variant={p.required ? "default" : "outline"} onClick={() => request(p)} disabled={asking !== null} aria-label={`Allow ${p.title}`}>
                      {asking === p.id ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
                      Allow
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </StateView>

      <div className="flex flex-wrap items-center gap-3">
        <p id={`${id}-progress`} aria-live="polite" className="text-muted-foreground text-xs tabular-nums">
          {state === "ready"
            ? missing.length
              ? `${granted} of ${list.length} allowed. Allow ${missing.map((m) => m.title).join(" and ")} to continue.`
              : `${granted} of ${list.length} allowed.`
            : ""}
        </p>
        <div className={cn("ms-auto flex gap-2", win && "flex-row-reverse")}>
          {onSkip ? (
            <Button variant="outline" size="sm" onClick={onSkip}>
              {t("Set Up Later", "Set up later")}
            </Button>
          ) : null}
          <Button size="sm" onClick={onContinue} disabled={state !== "ready" || missing.length > 0} aria-describedby={`${id}-progress`}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )

  if (!frame)
    return (
      <div data-slot="desktop-5" data-state={state} data-feel={feelProp} role="region" aria-labelledby={`${id}-title`} className={cn("flex flex-col", className)} {...frameProps(props)}>
        {content}
      </div>
    )
  return (
    <AppWindow data-slot="desktop-5" data-state={state} feel={feel} role="region" aria-labelledby={`${id}-title`} className={cn("h-[34rem] w-full max-w-xl", className)} {...frameProps(props)}>
      <AppWindowTitleBar title={win ? appName : ""} icon={<ShieldCheck />} className="border-b-0" />
      <AppWindowContent className="flex flex-col">{content}</AppWindowContent>
    </AppWindow>
  )
}

export { Desktop5, type Desktop5Props, type Desktop5Permission, type Desktop5Status }
