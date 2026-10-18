// Ballmac UI: Settings 6. https://ui.ballmac.com/blocks/settings-6
"use client"

import * as React from "react"
import { CalendarClock, CircleAlert, CircleCheck, Download, FileArchive, Hourglass, Loader2, ShieldCheck, Trash2, Undo2 } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ballmac/alert-dialog"
import { Button } from "@/components/ballmac/button"
import { Checkbox } from "@/components/ballmac/checkbox"
import { Input } from "@/components/ballmac/input"
import { Progress } from "@/components/ballmac/progress"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Switch } from "@/components/ballmac/switch"
import { cn } from "@/lib/utils"

type Settings6Scope = "profile" | "projects" | "messages" | "billing"
type Settings6Format = "json" | "csv"
type Settings6Retention = "30d" | "1y" | "forever"

type Settings6Export = {
  id: string
  /** Already written for people ("14 October, 09:42"). */
  requested: string
  /** What it contains, in words ("Profile, projects and messages"). */
  contents: string
  format: Settings6Format
  status: "preparing" | "ready" | "failed" | "expired"
  /** 0 to 100 while preparing. */
  progress?: number
  /** "18 MB", when ready. */
  size?: string
  /** "Expires in 6 days", when ready. */
  expires?: string
}

type Settings6Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    /** The account email, which the person types to confirm deletion. */
    email?: string
    /** Past and running exports. Update the list from your server as jobs progress. */
    exports?: Settings6Export[]
    /** Called with what to include and the format. Return a promise; reject to show the message. Without it, a preparing job is simulated for demos. */
    onRequestExport?: (request: { scope: Settings6Scope[]; format: Settings6Format }) => void | Promise<void>
    onDownload?: (item: Settings6Export) => void
    /** How long messages are kept (controlled by onRetentionChange). */
    retention?: Settings6Retention
    onRetentionChange?: (value: Settings6Retention) => void
    /** Whether anonymous product analytics are shared. */
    analytics?: boolean
    onAnalyticsChange?: (value: boolean) => void
    /** Set when deletion is already scheduled ("12 November"). */
    deletionDate?: string
    /** Called when deletion is confirmed. Return a promise; reject to show the message. */
    onDeleteAccount?: () => void | Promise<void>
    onCancelDeletion?: () => void | Promise<void>
  }

const scopes: { id: Settings6Scope; label: string; hint: string }[] = [
  { id: "profile", label: "Profile and settings", hint: "Name, email, preferences" },
  { id: "projects", label: "Projects and files", hint: "Everything you created" },
  { id: "messages", label: "Messages and comments", hint: "Conversations you took part in" },
  { id: "billing", label: "Billing history", hint: "Invoices and payments" },
]

const sampleExports: Settings6Export[] = [
  { id: "e2", requested: "12 October, 16:20", contents: "Profile, projects and messages", format: "json", status: "ready", size: "18 MB", expires: "Expires in 4 days" },
  { id: "e1", requested: "2 September, 09:05", contents: "Billing history", format: "csv", status: "expired" },
]

const retentionLabel: Record<Settings6Retention, string> = { "30d": "30 days", "1y": "1 year", forever: "Until I delete them" }

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-card rounded-2xl border p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-6 h-9 w-48" />
        </div>
      ))}
    </div>
  )
}

function Card({ id, icon: Icon, title, children, danger }: { id: string; icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <section aria-labelledby={id} className={cn("bg-card rounded-2xl border p-5 sm:p-6", danger && "border-destructive/40")}>
      <h2 id={id} className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
        <span aria-hidden="true" className={cn("bg-muted flex size-8 items-center justify-center rounded-lg", danger && "bg-destructive/10 text-destructive")}>
          <Icon aria-hidden className="size-4" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

/**
 * A data and privacy page: ask for a copy of your data (pick what to include, watch it prepare, download it before it expires), choose how
 * long messages are kept, and delete the account behind a typed confirmation with a grace period you can cancel.
 */
function Settings6({
  title = "Data and privacy",
  description = "Take your data with you, decide how long we keep it, or remove it.",
  email = "priya@acme.com",
  exports: exportsProp,
  onRequestExport,
  onDownload,
  retention: retentionProp,
  onRetentionChange,
  analytics: analyticsProp,
  onAnalyticsChange,
  deletionDate: deletionProp,
  onDeleteAccount,
  onCancelDeletion,
  state = "ready",
  onRetry,
  errorState,
  className,
  ...props
}: Settings6Props) {
  const id = React.useId()
  const [list, setList] = React.useState<Settings6Export[]>(exportsProp ?? sampleExports)
  React.useEffect(() => {
    if (exportsProp) setList(exportsProp)
  }, [exportsProp])
  const [picked, setPicked] = React.useState<Set<Settings6Scope>>(new Set(["profile", "projects"]))
  const [format, setFormat] = React.useState<Settings6Format>("json")
  const [requesting, setRequesting] = React.useState(false)
  const [exportError, setExportError] = React.useState<string>()
  const [retention, setRetention] = React.useState<Settings6Retention>(retentionProp ?? "1y")
  const [analytics, setAnalytics] = React.useState(analyticsProp ?? true)
  const [deletionDate, setDeletionDate] = React.useState(deletionProp)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [typed, setTyped] = React.useState("")
  const [deleting, setDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string>()
  const [announce, setAnnounce] = React.useState("")
  const deleteTrigger = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => setDeletionDate(deletionProp), [deletionProp])
  React.useEffect(() => {
    if (retentionProp) setRetention(retentionProp)
  }, [retentionProp])
  React.useEffect(() => {
    if (analyticsProp !== undefined) setAnalytics(analyticsProp)
  }, [analyticsProp])

  // Without a server, a request is simulated so the whole path from asking to downloading can be seen.
  React.useEffect(() => {
    if (onRequestExport || exportsProp) return
    if (!list.some((e) => e.status === "preparing")) return
    const t = setInterval(() => {
      setList((l) =>
        l.map((e) => {
          if (e.status !== "preparing") return e
          const p = Math.min(100, (e.progress ?? 0) + 18)
          return p >= 100 ? { ...e, status: "ready", progress: 100, size: "12 MB", expires: "Expires in 7 days" } : { ...e, progress: p }
        })
      )
    }, 700)
    return () => clearInterval(t)
  }, [list, onRequestExport, exportsProp])

  const toggleScope = (s: Settings6Scope, on: boolean) =>
    setPicked((p) => {
      const n = new Set(p)
      if (on) n.add(s)
      else n.delete(s)
      return n
    })

  async function request() {
    if (!picked.size || requesting) return
    const scope = scopes.filter((s) => picked.has(s.id)).map((s) => s.id)
    setExportError(undefined)
    setRequesting(true)
    try {
      if (onRequestExport) await onRequestExport({ scope, format })
      else {
        const names = scopes.filter((s) => picked.has(s.id)).map((s) => s.label.split(" and ")[0]!.toLowerCase())
        const contents = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]!
        setList((l) => [{ id: `e${Date.now()}`, requested: "Just now", contents: contents[0]!.toUpperCase() + contents.slice(1), format, status: "preparing", progress: 4 }, ...l])
      }
      setAnnounce("Your export was requested. We will email you when it is ready.")
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "We could not start the export. Try again.")
    } finally {
      setRequesting(false)
    }
  }

  async function confirmDelete() {
    setDeleteError(undefined)
    setDeleting(true)
    try {
      await onDeleteAccount?.()
      setDeletionDate((d) => d ?? "in 30 days")
      setConfirmOpen(false)
      setTyped("")
      setAnnounce("Deletion confirmed. You have 30 days to change your mind.")
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "We could not schedule the deletion. Nothing was changed.")
    } finally {
      setDeleting(false)
    }
  }

  const busy = list.some((e) => e.status === "preparing")

  const content = (
    <div className="grid gap-6">
      <Card id={`${id}-export`} icon={FileArchive} title="Export your data">
        <p className="text-muted-foreground mt-2 max-w-xl text-sm text-pretty">We prepare a download and email you when it is ready. Links work for a week.</p>
        <fieldset className="mt-5">
          <legend className="text-sm font-medium">Include</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {scopes.map((s) => (
              <label key={s.id} className={cn("hover:bg-accent/50 flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors motion-reduce:transition-none", picked.has(s.id) && "border-foreground/40 bg-accent/30")}>
                <Checkbox checked={picked.has(s.id)} onCheckedChange={(v) => toggleScope(s.id, v === true)} className="mt-0.5" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{s.label}</span>
                  <span className="text-muted-foreground block text-xs">{s.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p id={`${id}-format`} className="mb-2 text-sm font-medium">
              Format
            </p>
            <SegmentedControl value={format} onValueChange={(v) => setFormat(v as Settings6Format)} aria-labelledby={`${id}-format`} size="sm">
              <SegmentedControlItem value="json">JSON</SegmentedControlItem>
              <SegmentedControlItem value="csv">CSV</SegmentedControlItem>
            </SegmentedControl>
          </div>
          <Button onClick={request} disabled={!picked.size || requesting} aria-describedby={!picked.size ? `${id}-none` : undefined}>
            {requesting ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Download aria-hidden="true" />}
            {requesting ? "Requesting" : "Request export"}
          </Button>
        </div>
        {!picked.size ? (
          <p id={`${id}-none`} className="text-muted-foreground mt-3 text-sm">
            Choose at least one thing to include.
          </p>
        ) : null}
        {exportError ? (
          <p role="alert" className="text-destructive mt-3 flex items-center gap-2 text-sm">
            <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
            {exportError}
          </p>
        ) : null}

        {list.length ? (
          <div className="mt-6 border-t pt-5">
            <h3 className="text-sm font-medium">Your exports</h3>
            <ul className="mt-3 grid gap-2.5">
              {list.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border p-3.5">
                  <span aria-hidden="true" className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", e.status === "ready" ? "bg-chart-2/15 text-chart-2" : e.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}>
                    {e.status === "ready" ? <CircleCheck className="size-4" /> : e.status === "failed" ? <CircleAlert className="size-4" /> : e.status === "preparing" ? <Hourglass className="size-4" /> : <CalendarClock className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="text-sm font-medium">
                      {e.contents} <span className="text-muted-foreground font-normal uppercase">· {e.format}</span>
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Requested {e.requested}
                      {e.status === "ready" ? ` · ${e.size} · ${e.expires}` : e.status === "expired" ? " · Link expired" : e.status === "failed" ? " · Something went wrong, ask again" : ""}
                    </p>
                    {e.status === "preparing" ? <Progress value={e.progress ?? 0} aria-label={`Preparing ${e.contents}`} className="mt-2.5 max-w-xs" /> : null}
                  </div>
                  {e.status === "preparing" ? <span className="text-muted-foreground text-sm tabular-nums">{e.progress ?? 0}%</span> : null}
                  {e.status === "ready" ? (
                    <Button variant="outline" size="sm" onClick={() => onDownload?.(e)}>
                      <Download aria-hidden="true" />
                      Download
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      <Card id={`${id}-keep`} icon={ShieldCheck} title="What we keep">
        <div className="mt-4 grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-md">
              <p id={`${id}-ret`} className="text-sm font-medium">
                Keep my messages for
              </p>
              <p className="text-muted-foreground mt-0.5 text-sm text-pretty">Older messages are deleted for good, and cannot be recovered.</p>
            </div>
            <Select
              value={retention}
              onValueChange={(v) => {
                setRetention(v as Settings6Retention)
                onRetentionChange?.(v as Settings6Retention)
              }}
            >
              <SelectTrigger aria-labelledby={`${id}-ret`} className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(retentionLabel) as Settings6Retention[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {retentionLabel[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-4 border-t pt-5">
            <div className="max-w-md">
              <p id={`${id}-an`} className="text-sm font-medium">
                Share anonymous usage data
              </p>
              <p className="text-muted-foreground mt-0.5 text-sm text-pretty">Helps us fix what is slow. Never includes your content.</p>
            </div>
            <Switch
              checked={analytics}
              onCheckedChange={(v) => {
                setAnalytics(v)
                onAnalyticsChange?.(v)
              }}
              aria-labelledby={`${id}-an`}
            />
          </div>
        </div>
      </Card>

      <Card id={`${id}-delete`} icon={Trash2} title="Delete your account" danger>
        {deletionDate ? (
          <div role="status" className="bg-destructive/5 border-destructive/30 mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4">
            <div className="min-w-0 max-w-md">
              <p className="text-sm font-medium">Your account is scheduled for deletion {deletionDate.startsWith("in") ? deletionDate : `on ${deletionDate}`}.</p>
              <p className="text-muted-foreground mt-1 text-sm text-pretty">Until then you can sign in and change your mind. After that, everything is removed for good.</p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                await onCancelDeletion?.()
                setDeletionDate(undefined)
                setAnnounce("Deletion cancelled. Your account stays as it is.")
              }}
            >
              <Undo2 aria-hidden="true" className="rtl:-scale-x-100" />
              Keep my account
            </Button>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm text-pretty">Removes your profile, projects and messages. We wait 30 days before deleting anything, so you can change your mind. Export first if you want a copy.</p>
            <Button ref={deleteTrigger} variant="destructive" className="mt-5" onClick={() => setConfirmOpen(true)}>
              <Trash2 aria-hidden="true" />
              Delete account
            </Button>
          </>
        )}
      </Card>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          if (deleting) return
          setConfirmOpen(o)
          if (!o) {
            setTyped("")
            setDeleteError(undefined)
          }
        }}
      >
        <AlertDialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            deleteTrigger.current?.focus()
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this account?</AlertDialogTitle>
            <AlertDialogDescription>
              {busy ? "An export is still being prepared; it will be lost. " : ""}After 30 days your projects, messages and settings are removed for good. To confirm, type <strong className="text-foreground">{email}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} aria-label="Type your email to confirm" autoComplete="off" placeholder={email} aria-invalid={!!deleteError} />
          {deleteError ? (
            <p role="alert" className="text-destructive text-sm">
              {deleteError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep my account</AlertDialogCancel>
            <AlertDialogAction
              destructive
              disabled={typed.trim().toLowerCase() !== email.toLowerCase() || deleting}
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
            >
              {deleting ? <Loader2 aria-hidden="true" className="me-2 size-4 animate-spin motion-reduce:animate-none" /> : null}
              {deleting ? "Scheduling" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

  return (
    <section data-slot="settings-6" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-3xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.03em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 text-base text-pretty">{description}</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading your data settings" loading={<Skel />} error={{ title: errorState?.title ?? "Your data settings could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Settings6, type Settings6Props, type Settings6Export, type Settings6Scope, type Settings6Format, type Settings6Retention }
