// Ballmac UI: Integrations 1. https://ui.ballmac.com/blocks/integrations-1
"use client"

import * as React from "react"
import { ArrowUpRight, Check, Loader2, Plug, Search, X } from "lucide-react"

import { Badge } from "@/components/ballmac/badge"
import { Button, buttonVariants } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { MatchHighlight, matchesAll, queryTokens } from "@/components/ballmac/match-highlight"
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ballmac/sheet"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Integrations1Item = {
  id: string
  name: string
  category: string
  /** One line, shown on the card. */
  summary: string
  /** A paragraph, shown in the details. */
  description?: string
  /** What it does, as short phrases. */
  features?: string[]
  badge?: "Popular" | "New" | "Beta"
  connected?: boolean
  docsHref?: string
}

type Integrations1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    integrations?: Integrations1Item[]
    title?: string
    description?: string
    /** Called when someone connects. Return a promise; reject to show its message. */
    onConnect?: (item: Integrations1Item) => void | Promise<void>
    onDisconnect?: (item: Integrations1Item) => void | Promise<void>
    /** The integration whose details are open at first. */
    defaultOpenId?: string
  }

const sample: Integrations1Item[] = [
  { id: "slack", name: "Slack", category: "Communication", summary: "Post updates and approve requests from a channel.", badge: "Popular", connected: true, description: "Send the right update to the right channel, and let people approve or reject from the message itself.", features: ["Channel notifications", "Approve from Slack", "Daily digest"], docsHref: "#" },
  { id: "github", name: "GitHub", category: "Developer", summary: "Link pull requests and issues to your work.", badge: "Popular", description: "Every pull request shows up next to the task it belongs to, and merging one can finish the task.", features: ["Pull request links", "Close on merge", "Branch names from tasks"], docsHref: "#" },
  { id: "gcal", name: "Google Calendar", category: "Productivity", summary: "See due dates and meetings on one calendar.", connected: true, description: "Due dates appear as events and meetings block time, so plans match the week you really have.", features: ["Two-way sync", "Working hours", "Meeting-aware schedules"] },
  { id: "notion", name: "Notion", category: "Productivity", summary: "Embed pages and keep docs next to tasks.", description: "Pages stay where your team writes them and appear where the work happens.", features: ["Embed pages", "Search across both"] },
  { id: "stripe", name: "Stripe", category: "Finance", summary: "Bill by the project and reconcile payments.", badge: "New", description: "Turn tracked work into invoices and see when they are paid, without leaving the project.", features: ["Invoices from time", "Payment status", "Refund notes"] },
  { id: "zapier", name: "Zapier", category: "Automation", summary: "Connect to thousands of other apps.", description: "Start from any event and send it to any of the apps Zapier supports.", features: ["Triggers and actions", "Multi-step zaps"] },
  { id: "figma", name: "Figma", category: "Design", summary: "Preview designs inside the task that needs them.", badge: "Beta", description: "Frames stay in sync, so nobody reviews last week's version.", features: ["Live previews", "Comments both ways"] },
  { id: "linear", name: "Linear", category: "Developer", summary: "Mirror issues and keep status in step.", description: "Issues created in either place appear in both, with status kept in step.", features: ["Two-way issues", "Cycle sync"] },
  { id: "zoom", name: "Zoom", category: "Communication", summary: "Start a call from any task.", description: "Start a meeting from a task and keep its notes attached.", features: ["One-click meetings", "Notes on the task"] },
]

function Tile({ name, className }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-base font-semibold", className)}>
      <CoverArt seed={name} variant="mesh" className="absolute inset-0" />
      <span className="relative">{name[0]}</span>
    </span>
  )
}

const badgeTone = { Popular: "bg-chart-4/15 text-foreground", New: "bg-chart-2/15 text-foreground", Beta: "bg-chart-5/15 text-foreground" }

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="bg-card rounded-2xl border p-5">
          <div className="flex gap-4">
            <Skeleton className="size-12 rounded-xl" />
            <div className="grid flex-1 content-center gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="mt-5 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
        </div>
      ))}
    </div>
  )
}

/**
 * A public integrations directory: search that highlights what matched, category filters with counts, cards that show whether each is
 * connected, and a side sheet with what it does and a Connect button that handles the wait and a failure. Pictures are drawn from each name.
 */
function Integrations1({
  integrations = sample,
  title = "Works with the tools you already use",
  description = "Connect once and your work shows up where your team already looks.",
  onConnect,
  onDisconnect,
  defaultOpenId,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Integrations1Props) {
  const id = React.useId()
  const list = state === "empty" ? [] : integrations
  const [connected, setConnected] = React.useState<Record<string, boolean>>(() => Object.fromEntries(integrations.map((i) => [i.id, !!i.connected])))
  const [category, setCategory] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")
  const [openId, setOpenId] = React.useState<string | null>(defaultOpenId ?? null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string>()
  const [announce, setAnnounce] = React.useState("")
  const actionRef = React.useRef<HTMLButtonElement>(null)
  const lastOpen = React.useRef<string | null>(null)
  if (openId) lastOpen.current = openId
  const tokens = queryTokens(query)

  const categories = React.useMemo(() => [...new Set(list.map((i) => i.category))], [list])
  const counts = (c: string | null) => list.filter((i) => (c ? i.category === c : true) && (!tokens.length || matchesAll(`${i.name} ${i.summary} ${i.category}`, tokens))).length
  const shown = list.filter((i) => (!category || i.category === category) && (!tokens.length || matchesAll(`${i.name} ${i.summary} ${i.category}`, tokens)))
  const open = list.find((i) => i.id === openId)

  async function act(item: Integrations1Item) {
    const on = !connected[item.id]
    setError(undefined)
    setBusy(true)
    try {
      await (on ? onConnect : onDisconnect)?.(item)
      setConnected((c) => ({ ...c, [item.id]: on }))
      setAnnounce(on ? `${item.name} connected` : `${item.name} disconnected`)
    } catch (e) {
      setError(e instanceof Error ? e.message : `We could not ${on ? "connect" : "disconnect"} ${item.name}. Nothing was changed.`)
    } finally {
      setBusy(false)
    }
  }

  const content =
    !list.length ? (
      <div className="bg-card rounded-2xl border px-6 py-16 text-center">
        <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
          <Plug className="size-6" />
        </span>
        <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No integrations yet"}</h2>
        <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "When an integration is added it appears here, ready to connect."}</p>
        {emptyState?.action}
      </div>
    ) : (
      <>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="bg-background focus-within:ring-ring/50 flex h-10 items-center gap-2 rounded-lg border px-3 focus-within:ring-[3px] sm:w-72">
            <Search aria-hidden="true" className="text-muted-foreground size-4" />
            <input type="search" aria-label="Search integrations" placeholder="Search integrations" value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </div>
          <div role="group" aria-label="Filter by category" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {[null, ...categories].map((c) => (
              <button
                key={c ?? "all"}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={cn("focus-visible:ring-ring/50 shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", category === c ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}
              >
                {c ?? "All"} <span className={cn("tabular-nums", category === c ? "opacity-70" : "text-muted-foreground")}>{counts(c)}</span>
              </button>
            ))}
          </div>
        </div>

        {shown.length ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  data-integration={i.id}
                  onClick={() => {
                    setError(undefined)
                    setOpenId(i.id)
                  }}
                  className="bg-card hover:border-foreground/30 focus-visible:ring-ring/50 group flex h-full w-full flex-col rounded-2xl border p-5 text-start outline-none transition-[border-color,box-shadow] duration-150 hover:shadow-md focus-visible:ring-[3px] motion-reduce:transition-none"
                >
                  <span className="flex items-start gap-4">
                    <Tile name={i.name} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-semibold tracking-tight">
                          <MatchHighlight text={i.name} query={tokens} />
                        </span>
                        {i.badge ? <Badge className={cn("border-transparent", badgeTone[i.badge])}>{i.badge}</Badge> : null}
                      </span>
                      <span className="text-muted-foreground mt-0.5 block text-xs">{i.category}</span>
                    </span>
                    {connected[i.id] ? (
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium">
                        <Check aria-hidden="true" className="text-chart-2 size-3.5" />
                        Connected
                      </span>
                    ) : null}
                  </span>
                  <span className="text-muted-foreground mt-4 text-sm text-pretty">
                    <MatchHighlight text={i.summary} query={tokens} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed px-6 py-14 text-center">
            <p className="font-medium">Nothing matches {query.trim() ? `“${query.trim()}”` : "that"}</p>
            <p className="text-muted-foreground mt-1 text-sm">Try another word, or look in all categories.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setQuery("")
                setCategory(null)
              }}
            >
              <X aria-hidden="true" />
              Clear filters
            </Button>
          </div>
        )}
      </>
    )

  return (
    <section data-slot="integrations-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20", className)} {...frameProps(props)}>
      <header className="mb-10 max-w-2xl">
        <h1 id={`${id}-title`} className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading integrations" loading={<Skel />} error={{ title: errorState?.title ?? "Integrations could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>

      <Sheet open={!!open} onOpenChange={(o) => !o && !busy && setOpenId(null)}>
        <SheetContent
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            actionRef.current?.focus()
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            document.querySelector<HTMLElement>(`[data-integration="${lastOpen.current ?? ""}"]`)?.focus()
          }}
        >
          {open ? (
            <>
              <SheetHeader className="pb-5">
                <div className="flex items-center gap-4">
                  <Tile name={open.name} className="size-14 text-lg" />
                  <div className="min-w-0 text-start">
                    <SheetTitle>{open.name}</SheetTitle>
                    <SheetDescription>{open.category}{connected[open.id] ? " · Connected" : ""}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              <SheetBody className="pb-6">
                <p className="text-base text-pretty">{open.description ?? open.summary}</p>
                {open.features?.length ? (
                  <>
                    <h3 className="mt-6 text-sm font-semibold">What you get</h3>
                    <ul className="mt-3 grid gap-2.5">
                      {open.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check aria-hidden="true" className="text-chart-2 mt-0.5 size-4 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {error ? (
                  <p role="alert" className="text-destructive mt-6 text-sm">
                    {error}
                  </p>
                ) : null}
              </SheetBody>
              <SheetFooter>
                {open.docsHref ? (
                  <a href={open.docsHref} className={buttonVariants({ variant: "ghost" })}>
                    Read the docs
                    <ArrowUpRight aria-hidden="true" className="rtl:-scale-x-100" />
                  </a>
                ) : null}
                <Button ref={actionRef} variant={connected[open.id] ? "outline" : "default"} disabled={busy} onClick={() => void act(open)}>
                  {busy ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
                  {busy ? (connected[open.id] ? "Disconnecting" : "Connecting") : connected[open.id] ? "Disconnect" : `Connect ${open.name}`}
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Integrations1, type Integrations1Props, type Integrations1Item }
