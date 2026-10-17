// Ballmac UI: Settings 4. https://ui.ballmac.com/blocks/settings-4
"use client"

import * as React from "react"
import { BarChart3, CalendarDays, CircleAlert, CreditCard, FolderGit2, HardDrive, Loader2, Mail, MessagesSquare, Plug, Search, Sheet, SquareKanban, Users, Video, Webhook } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ballmac/alert-dialog"
import { Badge } from "@/components/ballmac/badge"
import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Settings4Integration = {
  id: string
  name: string
  /** What connecting it does, in one sentence. */
  description: string
  category: string
  icon?: React.ReactNode
  connected?: boolean
  /** The connected account, shown under the name ("acme-team"). */
  account?: string
  /** Not available yet: shown with "Coming soon" and no Connect button. */
  comingSoon?: boolean
}

type Settings4Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    integrations?: Settings4Integration[]
    title?: string
    description?: string
    /** Called by Connect. Resolve with the account name to show it; throw an Error to show its message on the card. Defaults to a short simulated connection. */
    onConnect?: (id: string) => string | void | Promise<string | void>
    /** Called after the disconnect is confirmed. */
    onDisconnect?: (id: string) => void | Promise<void>
    /** Called by Manage on a connected integration. Without it the button is hidden. */
    onManage?: (id: string) => void
    /** Called by "Request an integration". Without it the link is hidden. */
    onRequest?: () => void
  }

const sample: Settings4Integration[] = [
  { id: "chat", name: "Team chat", description: "Post updates to a channel and reply to alerts without leaving the conversation.", category: "Communication", icon: <MessagesSquare />, connected: true, account: "acme-team" },
  { id: "code", name: "Code hosting", description: "Link pull requests to tasks and close them when the branch is merged.", category: "Engineering", icon: <FolderGit2 />, connected: true, account: "acme-org" },
  { id: "calendar", name: "Calendar", description: "Show due dates on your calendar and book reviews from a task.", category: "Productivity", icon: <CalendarDays /> },
  { id: "payments", name: "Payments", description: "Sync customers and invoices so revenue shows up in reports.", category: "Finance", icon: <CreditCard /> },
  { id: "issues", name: "Issue tracker", description: "Turn feedback into issues and keep their status in sync both ways.", category: "Engineering", icon: <SquareKanban /> },
  { id: "storage", name: "Cloud storage", description: "Attach files from your drive and keep them up to date.", category: "Productivity", icon: <HardDrive /> },
  { id: "crm", name: "CRM", description: "See each customer’s plan and open deals next to their requests.", category: "Sales", icon: <Users /> },
  { id: "email", name: "Email marketing", description: "Add new sign-ups to a list and tag them by plan.", category: "Sales", icon: <Mail /> },
  { id: "analytics", name: "Analytics", description: "Send product events to your analytics workspace.", category: "Engineering", icon: <BarChart3 /> },
  { id: "video", name: "Video calls", description: "Start a call from a task and save the recording to it.", category: "Communication", icon: <Video /> },
  { id: "sheets", name: "Spreadsheets", description: "Export any view to a sheet that refreshes every hour.", category: "Productivity", icon: <Sheet />, comingSoon: true },
  { id: "webhooks", name: "Webhooks", description: "Send a signed request to your own endpoint when something changes.", category: "Engineering", icon: <Webhook /> },
]

function GridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="grid gap-3 rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      ))}
    </div>
  )
}

/**
 * The integrations page of a product: search, categories, connected ones first, Connect with progress and the reason when it fails,
 * Manage, Disconnect after a confirmation, coming-soon entries and a way to ask for one that is missing.
 */
function Settings4({
  integrations = sample,
  title = "Integrations",
  description = "Connect the tools your team already uses.",
  onConnect,
  onDisconnect,
  onManage,
  onRequest,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Settings4Props) {
  const id = React.useId()
  const [list, setList] = React.useState(integrations)
  React.useEffect(() => setList(integrations), [integrations])
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState("All")
  const [busy, setBusy] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [confirm, setConfirm] = React.useState<Settings4Integration | null>(null)
  const [announce, setAnnounce] = React.useState("")

  const categories = ["All", ...[...new Set(list.map((i) => i.category))].sort()]
  const q = query.trim().toLowerCase()
  const visible = list.filter((i) => (category === "All" || i.category === category) && (!q || `${i.name} ${i.description} ${i.category}`.toLowerCase().includes(q)))
  const connected = visible.filter((i) => i.connected)
  const available = visible.filter((i) => !i.connected)
  const connectedCount = list.filter((i) => i.connected).length
  const ready = state === "ready"

  async function connect(i: Settings4Integration) {
    setBusy(i.id)
    setErrors(({ [i.id]: _, ...rest }) => rest)
    try {
      const account = onConnect ? await onConnect(i.id) : await new Promise<string>((r) => setTimeout(() => r("acme"), 900))
      setList((l) => l.map((x) => (x.id === i.id ? { ...x, connected: true, account: account || x.account } : x)))
      setAnnounce(`${i.name} connected`)
    } catch (err) {
      setErrors((e) => ({ ...e, [i.id]: err instanceof Error && err.message ? err.message : "Could not connect. Try again." }))
    } finally {
      setBusy(null)
    }
  }

  async function disconnect(i: Settings4Integration) {
    setConfirm(null)
    setBusy(i.id)
    try {
      await onDisconnect?.(i.id)
      setList((l) => l.map((x) => (x.id === i.id ? { ...x, connected: false, account: undefined } : x)))
      setAnnounce(`${i.name} disconnected`)
    } finally {
      setBusy(null)
    }
  }

  const card = (i: Settings4Integration) => {
    const working = busy === i.id
    const error = errors[i.id]
    return (
      <li key={i.id} className={cn("bg-card flex flex-col gap-3 rounded-xl border p-4", i.connected && "border-chart-2/40")}>
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg border [&_svg]:size-5">
            {i.icon ?? <span className="text-sm font-semibold">{i.name.slice(0, 1)}</span>}
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
              {i.name}
              {i.connected ? <Badge status="success">Connected</Badge> : i.comingSoon ? <Badge status="neutral" dot={false}>Coming soon</Badge> : null}
            </h4>
            <p className="text-muted-foreground mt-0.5 truncate text-xs">{i.connected && i.account ? i.account : i.category}</p>
          </div>
        </div>
        <p className="text-muted-foreground flex-1 text-[13px] text-pretty">{i.description}</p>
        {error ? (
          <p role="alert" className="text-destructive flex items-start gap-1.5 text-xs">
            <CircleAlert aria-hidden="true" className="mt-px size-3.5 shrink-0" />
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {i.connected ? (
            <>
              {onManage ? (
                <Button variant="outline" size="sm" onClick={() => onManage(i.id)} aria-label={`Manage ${i.name}`}>
                  Manage
                </Button>
              ) : null}
              <Button variant="ghost" size="sm" onClick={() => setConfirm(i)} disabled={working} aria-label={`Disconnect ${i.name}`}>
                {working ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
                Disconnect
              </Button>
            </>
          ) : i.comingSoon ? null : (
            <Button variant="outline" size="sm" onClick={() => connect(i)} disabled={working} aria-label={`Connect ${i.name}`}>
              {working ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Plug aria-hidden="true" />}
              {working ? "Connecting…" : "Connect"}
            </Button>
          )}
        </div>
      </li>
    )
  }

  return (
    <section data-slot="settings-4" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1">
          <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em]">
            {title}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {description}
            {ready && connectedCount ? ` ${connectedCount} connected.` : ""}
          </p>
        </div>
        <div className="bg-background focus-within:ring-ring/50 flex h-9 w-full items-center gap-2 rounded-md border px-2.5 focus-within:ring-[3px] sm:w-64">
          <Search aria-hidden="true" className="text-muted-foreground size-4" />
          <input type="search" aria-label="Search integrations" placeholder="Search integrations" value={query} onChange={(e) => setQuery(e.target.value)} disabled={!ready} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
      </div>

      <div role="group" aria-label="Category" className="mt-5 flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            disabled={!ready}
            onClick={() => setCategory(c)}
            className={cn(
              "h-8 rounded-full border px-3 text-[13px] outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50",
              category === c ? "bg-foreground text-background border-foreground" : "hover:bg-accent"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <StateView
        state={ready && !list.length ? "empty" : state}
        onRetry={onRetry}
        label="Loading integrations"
        loading={<GridSkeleton />}
        empty={{ title: emptyState?.title ?? "No integrations yet", description: emptyState?.description ?? "Integrations you can connect will be listed here.", icon: emptyState?.icon ?? <Plug />, action: emptyState?.action }}
        error={{ title: errorState?.title ?? "Integrations could not be loaded", ...errorState }}
        className="mt-6"
      >
        <div className="grid gap-8">
          {connected.length ? (
            <div className="grid gap-3">
              <h3 className="text-sm font-semibold">Connected</h3>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{connected.map(card)}</ul>
            </div>
          ) : null}
          {available.length ? (
            <div className="grid gap-3">
              <h3 className="text-sm font-semibold">{connected.length ? "Available" : "All integrations"}</h3>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{available.map(card)}</ul>
            </div>
          ) : null}
          {!visible.length ? <p className="text-muted-foreground py-10 text-center text-sm">No integrations match “{query || category}”.</p> : null}
          {onRequest ? (
            <p className="text-muted-foreground text-center text-sm">
              Missing a tool you use?{" "}
              <button type="button" onClick={onRequest} className="text-foreground rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                Request an integration
              </button>
            </p>
          ) : null}
        </div>
      </StateView>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {confirm?.name}?</AlertDialogTitle>
            <AlertDialogDescription>Syncing stops straight away. Data already copied stays, and you can connect again at any time.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirm && disconnect(confirm)}>Disconnect</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Settings4, type Settings4Props, type Settings4Integration }
